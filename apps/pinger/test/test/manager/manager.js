const assert = require('node:assert/strict');
const { describe, it, before, beforeEach, after, mock } = require('node:test');

const { Model, Monitor, MonitorCheck, Incident } = require('db');

const { date_freezer } = require('../../mocks/date');
const { MockDB } = require('../../mocks/mock-db');
const { use_db } = require('../../mocks/db');

const { MonitorManager } = require('../../../src/manager');

describe('Manager', () => {
	const frozen_date = new Date('2023-01-01T10:45:00.000Z');
	before(() => {
		date_freezer.freeze(frozen_date);
	});

	describe('SQLITE MockDB test', () => {
		use_db();

		it('Should run a statement using mock db', () => {
			return Model.db().prepare('DELETE FROM incident').run();
		});
	});

	describe('Filtering', () => {
		it('Filters active monitors', () => {
			const manager = new MonitorManager();

			const monitors = [{
				id: 1,
				// does not pass (last checked is right now)
				last_check_time: new Date('2023-01-01T10:45:00.000Z').getTime(),
				interval_ms: 1000
			}, {
				id: 2,
				// passes because never checked
				last_check_time: null,
				interval_ms: 1000
			}, {
				id: 3,
				// does not pass, because future
				last_check_time: new Date('2023-01-01T10:46:00.000Z').getTime(),
				interval_ms: 1000
			}, {
				id: 4,
				// passes because past
				last_check_time: new Date('2023-01-01T10:44:00.000Z').getTime(),
				interval_ms: 10_000 // 10 secs
			}, {
				id: 5,
				// passes exactly
				last_check_time: new Date('2023-01-01T10:44:50.000Z').getTime(),
				interval_ms: 10_000 // 10 secs
			}];

			const filtered_monitors = manager.filter_active(monitors);
			const ids = filtered_monitors.map(({ id }) => id);
			assert.deepStrictEqual(ids, [2, 4, 5]);
		});
	});


	describe('NOOP Monitor runs', () => {
		let monitor_all_mock = null;
		let monitor_db_mock = null;
		let monitor_check_run = null;

		before(() => {
			monitor_all_mock = mock.method(Monitor, 'all', () => {
				return Promise.resolve([{
					id: 'monitor-1',
					type: 'noop',
					last_check_time: new Date('2023-01-01T10:44:00.000Z').getTime(),
					interval_ms: 10_000,
					name: 'Monitor 1'
				}, {
					id: 'monitor-2',
					type: 'noop',
					last_check_time: new Date('2023-01-01T10:44:00.000Z').getTime(),
					interval_ms: 10_000,
					name: 'Monitor 2'
				}]);
			});

			// Unique instance to prevent creating a
			// new mock every time we call Model.db();
			const db_mock = MockDB.mock();
			monitor_db_mock = mock.method(Monitor, 'db', () => db_mock);
			monitor_check_run = mock.method(MonitorCheck, 'run', () => Promise.resolve());
		});

		it('Successfully runs noop monitors', () => {
			const manager = new MonitorManager();

			const monitor_mocked_query = monitor_db_mock().mocked_query();
			return manager.run().then(() => {
				// Once per monitor
				assert.strictEqual(monitor_db_mock().prepare.mock.callCount(), 2);
				const [prepareCall1, prepareCall2] = monitor_db_mock().prepare.mock.calls;
				const query = 'UPDATE monitor SET m_last_check_time = ? WHERE m_id = ?';
				assert.deepStrictEqual(prepareCall1.arguments, [query]);
				assert.deepStrictEqual(prepareCall2.arguments, [query]);

				assert.strictEqual(monitor_mocked_query.bind.mock.callCount(), 2);
				const [call1, call2] = monitor_mocked_query.bind.mock.calls;
				assert.deepStrictEqual(call1.arguments, [frozen_date.getTime(), 'monitor-1']);
				assert.deepStrictEqual(call2.arguments, [frozen_date.getTime(), 'monitor-2']);
			});
		});

		after(() => {
			monitor_all_mock.mock.restore();
			monitor_db_mock.mock.restore();
			monitor_check_run.mock.restore();
		});
	});

	describe('Full ping flow run (ping, check, incident)', () => {
		use_db();

		beforeEach(() => {
			const m1 = Monitor.create({
				name: 'Test monitor 1',
				id: 'monitor-1',
				type: 'noop',
				config: {},
				interval_ms: 1_000,
				last_check_time: null
			});

			const m2 = Monitor.create({
				name: 'Test monitor 2',
				id: 'monitor-2',
				type: 'noop',
				config: {
					throws: true
				},
				interval_ms: 1_000,
				last_check_time: null
			});

			return Promise.all([m1, m2]);
		});

		it('Happy path test', () => {
			const manager = new MonitorManager();
			return manager.run().then(() => {
				const checks = MonitorCheck.all();
				const monitors = Monitor.all();
				const incidents = Incident.all();

				return Promise.all([checks, monitors, incidents]);

			}).then(([checks, monitors, incidents]) => {
				assert.strictEqual(checks.length, 2, 'Not expected checks');
				const checked_monitors = checks.map(check => check.monitor_id).sort();

				const m1_check = checks.find(({ monitor_id }) => monitor_id === 'monitor-1');
				const m2_check = checks.find(({ monitor_id }) => monitor_id === 'monitor-2');

				assert.strictEqual(m1_check.up, true, 'Monitor 1 down');
				assert.strictEqual(m2_check.up, false, 'Monitor 2 up');
				assert.strictEqual(m1_check.date.getTime(), frozen_date.getTime());
				assert.strictEqual(m2_check.date.getTime(), frozen_date.getTime());
				assert(m1_check.region);
				assert(m2_check.region);

				const m1 = monitors.find(({ id }) => id === 'monitor-1');
				const m2 = monitors.find(({ id }) => id === 'monitor-2');
				assert.strictEqual(m1.last_check_time, frozen_date.getTime());
				assert.strictEqual(m2.last_check_time, frozen_date.getTime());

				assert.strictEqual(incidents.length, 0, 'Incidents created but not expected');
			});
		});
	});

	describe('Automatic incident creation', () => {
		use_db();

		beforeEach(() => {
			const m1 = Monitor.create({
				name: 'Test monitor w/ incident',
				id: 'monitor-with-incident',
				type: 'noop',
				config: {
					throws: true
				},
				interval_ms: 1_000,
				last_check_time: null,
				consecutive_failed_checks_incident: 2
			});

			const failed_check = MonitorCheck.create({
				monitor_id: 'monitor-with-incident',
				up: false,
				result: null,
				date: 1672569300000, // (10 mins before frozen date),
				ping: 200,
				error: null
			});

			return Promise.all([m1, failed_check]);
		});

		it('Should create an automatic incident', () => {
			const manager = new MonitorManager();
			return manager.run().then(() => {
				return Incident.all();
			}).then((incidents) => {
				assert.strictEqual(incidents.length, 1, 'Not enough, or more incidents');
				const [incident] = incidents;
				assert.strictEqual(incident.monitor_id, 'monitor-with-incident');
				assert.strictEqual(incident.from.getTime(), frozen_date.getTime());
				assert.strictEqual(incident.is_maintenance, false);
			});
		});

		it('Should not create an incident row for already existing incident', () => {
			const manager = new MonitorManager();

			MonitorCheck.create({
				monitor_id: 'monitor-with-incident',
				up: false,
				result: null,
				date: 1672568700000, // (20 mins before frozen date, 10 mins before 1st incident),
				ping: 200,
				error: null
			}).then(() => {
				return manager.run();
			}).then(() => {
				return Incident.all();
			}).then((incidents) => {
				// Incident does not exist on DB, but is never checked by the code
				assert.strictEqual(incidents.length, 0, 'Not enough, or more incidents');
			});
		});
	});

	after(() => {
		date_freezer.unfreeze();
	});
});
