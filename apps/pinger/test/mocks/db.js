const { Database } = require('sqlite3').verbose();
const { before, after, beforeEach, afterEach } = require('node:test');

const { models, Model } = require('db');
const { MigrationManager } = require('db/migrations');


class Statement {
	constructor(sql, statement) {
		this.sql = sql;
		this.statement = statement;
	}

	bind(...args) {
		this.statement.bind(...args);
		return this;
	}

	first() {
		return new Promise((resolve, reject) => {
			this.statement.get(((err, row) => {
				if(err) {
					return reject(err);
				}

				resolve(row);
			})).finalize();
		});
	}

	all() {
		return new Promise((resolve, reject) => {
			this.statement.all(((err, rows) => {
				if(err) {
					return reject(err);
				}

				resolve({
					results: rows,
					success: true
				});
			})).finalize();
		});
	}

	raw() {
		return new Promise((resolve, reject) => {
			this.statement.run((err) => {
				if(err) {
					return reject(err);
				}

				return resolve();
			}).finalize();
		});
	}

	run() {
		return new Promise((resolve, reject) => {
			this.statement.run(((err, rows) => {
				if(err) {
					return reject(err);
				}

				resolve(rows);
			})).finalize();
		});
	}
}

// This is a mock of what cloudflare would give us to handle
// Technically it could be used as a drop-in replacement for the DB API
// if we ever want to use something else
class DB {
	constructor(db) {
		this.db = db;
	}

	prepare(sql) {
		const stmt = this.db.prepare(sql);
		return new Statement(sql, stmt);
	}

	dump() {
		throw new Error('Cannot dump test db');
	}

	batch(statements) {
		return Promise.all(statements.map(s => s.all()));
	}

	empty() {
		const promises = models.map(model => model.truncate());
		return Promise.all(promises);
	}


	static start() {
		return new Promise((resolve, reject) => {
			const db = new Database(':memory:', (err, ...args) => {
				if(err) {
					return reject(err);
				}

				// Bootstrap
				MigrationManager.read_migrations().then(migrations => {
					MigrationManager.chain((migration) => {
						const { contents, filename } = migration;
						// console.log(new Date().toISOString(), '\u001b[43;1m\u001b[38;5;232m MIGRATING \u001b[0m', filename);
						return new Promise((ok, nok) => {
							db.run(contents, (err, res) => {
								if(err) {
									console.error(new Date().toISOString(), '\u001b[41;1m ERROR MIGRATING \u001b[0m', filename);
									return nok(err);
								}

								// console.log(new Date().toISOString(), '\u001b[42;1m\u001b[38;5;232m MIGRATED! \u001b[0m', filename);

								return ok();
							});
						});

					}, migrations).then(() => {
						return resolve(new DB(db));
					}).catch(e => {
						return reject(e);
					});
				});
			});
		});
	}
}

const db_promise = DB.start().catch(e => {
	console.error(e);
	process.exit(1);
});

const use_db = () => {
	before(() => {
		return db_promise.then(db => {
			Model.DB = db;
		});
	});

	beforeEach(() => {
		return Model.db().empty();
	});

	after(() => {
		return Model.db().empty();
	});
};

module.exports = {
	DB,
	use_db,
	db_promise
};
