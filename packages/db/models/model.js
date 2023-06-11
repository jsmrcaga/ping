class DoesNotExist extends Error {}

class Model {
	static DB = null;
	static TABLE = null;

	constructor(obj={}) {
		for(const k in obj) {
			this[k] = obj[k];
		}
	}

	static instanciate(raw) {
		return new this(raw);
	}

	static db() {
		if(!this.DB) {
			throw new Error('D1 DB has not been set, set it with Model.DB = env.<YOUR_BINDING>');
		}
		return this.DB;
	}

	static query(query, ...bindings) {
		return this.db().prepare(query).bind(...bindings).all().then(({ results, success, ...rest }) => {
			if(!success) {
				throw new Error('Could not read from DB');
			}

			return results.map(raw => this.instanciate(raw));
		});
	}

	static get(query, ...bindings) {
		return this.query(query, ...bindings).then(models => {
			if(models.length < 1 || models.length > 1) {
				throw new DoesNotExist(`Got invalid number of objects, got ${models.length}`);
			}

			return models[0];
		})
	}

	static raw(query, ...bindings) {
		return this.db().prepare(query).bind(...bindings).all();
	}

	static run(query, ...bindings) {
		return this.db().prepare(query).bind(...bindings).run();
	}

	static prepare(query, ...bindings) {
		return this.db().prepare(query).bind(...bindings);
	}

	static batch(prepared_queries=[]) {
		return this.db().batch(prepared_queries);
	}

	static create(...params) {
		const obj = new this(...params);
		return this.insert(obj).then(() => {
			return obj;
		});
	}

	static all() {
		return this.query(`SELECT * FROM ${this.TABLE}`);
	}

	static insert(instance) {
		if(!(instance instanceof this)) {
			return Promise.reject(new Error(`Can only insert instances of ${this.name}`));
		}

		return Promise.reject('Should be overriden');
	}

	static bulk_insert(instances) {
		if(!intances.every(instance => instance instanceof this)) {
			return Promise.reject(new Error(`Can only insert instances of ${this.name}`));	
		}

		return Promise.reject(new Error('Should be overridden'));
	}

	static truncate() {
		return this.run(`DELETE FROM ${this.TABLE}`);
	}

	static DoesNotExist = DoesNotExist;
}

module.exports = { Model };
