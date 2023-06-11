const { Model } = require('db');
const { mock } = require('node:test');

class MockPreparedQuery {

	static mock({ all, run, raw }={}) {
		class QueryMock {
			bind() {
				return;
			}

			all() {
				return Promise.resolve([]);
			}

			run() {
				return Promise.resolve([]);
			}

			raw() {
				return Promise.resolve([]);
			}
		}

		const instance = new QueryMock();

		mock.method(QueryMock.prototype, 'bind', () => {
			instance;
		});
		mock.method(QueryMock.prototype, 'all', all);
		mock.method(QueryMock.prototype, 'run', run);
		mock.method(QueryMock.prototype, 'raw', raw);

		return instance;
	}
}

class MockDB {
	static mock() {
		const mocked_query = MockPreparedQuery.mock();

		class DBMock {
			prepare() {
				return MockPreparedQuery.mock();
			}

			batch() {
				return Promise.resolve();
			}

			// For debugging purposes
			mocked_query() {
				return mocked_query;
			}
		}


		mock.method(DBMock.prototype, 'prepare', () => {
			return mocked_query;
		});

		mock.method(DBMock.prototype, 'batch', () => {
			return Promise.resolve();
		});

		return new DBMock();
	}
}

module.exports = {
	MockDB,
	MockPreparedQuery
};
