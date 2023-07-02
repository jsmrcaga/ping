const assert = require('node:assert/strict');
const { describe, it, before, beforeEach, after, mock } = require('node:test');

const { PerformanceTracker, Page } = require('db');

const { use_db } = require('../../mocks/db');
const { date_freezer } = require('../../mocks/date');

describe('Models', () => {
	const frozen_date = new Date('2023-01-01T10:45:00.000Z');

	before(() => {
		date_freezer.freeze(frozen_date);
	});

	describe('Performance tracking models', () => {
		use_db();

		it.skip('Should not be able to create a tracker if page does not exist', (t, done) => {
			// Skipped because
			// PRAGMA foreign_keys = ON;
			PerformanceTracker.insert({
				id: 'tracker-1',
				name: 'Tracker 1',
				page_hosts: ['page-host-1']
			}).then(() => {
				done(new Error('Should not pass'));
			}).catch(e => {
				done()
			});
		});

		it('Should insert a tracker without pages', () => {
			return PerformanceTracker.insert({
				id: 'tracker-1',
				name: 'Tracker 1'
			});
		});

		it('Should insert a tracker with pages', () => {
			return Promise.all([
				Page.insert({
					title: 'My page',
					host: 'host-1',
					sections: [{
						title: 'Page 1 section 1',
						components: [{
							performance_trackers: ['tracker-1']
						}]
					}]
				}),
				Page.insert({
					title: 'My page',
					host: 'host-2',
					sections: [{
						title: 'Page 2 section 1',
						components: [{
							performance_trackers: ['tracker-1']
						}]
					}]
				})
			]).then(() => {
				return PerformanceTracker.insert({
					id: 'tracker-1',
					name: 'Tracker 1',
					page_hosts: ['host-1', 'host-2']
				});
			}).then(() => {
				const query = `SELECT * FROM page_performance_tracker_m2m`;
				return PerformanceTracker.raw(query);
			}).then(({ results, success }) => {
				assert(success, 'Error getting trackers');
				assert(results.length === 2);
				assert(results[0].page_host === 'host-1');
				assert(results[0].pt_id === 'tracker-1');
				assert(results[1].page_host === 'host-2');
				assert(results[1].pt_id === 'tracker-1');
			});
		});
	});

	describe('Performance tracking points', () => {
		use_db();
		const date_ms = frozen_date.getTime();

		it('Should only find tracker 1 for page page-1', () => {
			return Promise.all([
				Page.insert({
					title: 'My page',
					host: 'page-1',
					sections: [{
						title: 'Page 1 section 1',
						components: [{
							performance_trackers: ['tracker-1']
						}]
					}]
				}),
				// to make sure we have false positive data
				Page.insert({
					title: 'My second page',
					host: 'page-2',
					sections: [{
						title: 'Page 2 section 1',
						components: [{
							performance_trackers: ['tracker-2']
						}]
					}]
				}),
			]).then(() => {
				return Promise.all([
					PerformanceTracker.insert({
						id: 'perf-tracker-1',
						name: 'Tracker 1',
						// Should create p2t entry
						page_hosts: ['page-1']
					}),
					// to make sure we have false positive data
					PerformanceTracker.insert({
						id: 'perf-tracker-2',
						name: 'Tracker 2',
						// Should create p2t entry
						page_hosts: ['page-2']
					}),
				]);
			}).then(() => {
				const random_values = new Array(100).fill(0).map(() => Math.floor(Math.random() * 1000));

				return PerformanceTracker.add_points([
					...random_values.map((value, i) => ({
						value,
						tracker_id: 'perf-tracker-1',
						// 1 per hour
						date_ms: date_ms + (i * 900 * 1000),
					})),
					// to make sure we have false positive data
					{
						date_ms,
						tracker_id: 'perf-tracker-2',
						value: 500,
					}
				]);
			}).then(() => {
				return PerformanceTracker.for_page({
					host: 'page-1',
					from_date_ms: date_ms - 1,
					aggregate_min: 30
				});
			}).then(result => {
				assert('perf-tracker-1' in result);
				assert(!('perf-tracker-2' in result));

				const points = result['perf-tracker-1'].points;
				// We set points every 15 min and we aggregate every 30 min
				// should be 50 points
				assert(points.length == 51, `Expected length 51, got ${points.length}`);
				// TODO: right now we round "down", so 10h45 became 10h30.
				assert(points[0].agg_date === '2023-01-01T10:30:00.000Z', `Expected '2023-01-01T10:30:00.000Z', got ${points[0].agg_date}`);
			});
		});
	});
});
