class Monitor {
	constructor({
		id,
		last_check_time=null,
		name,
		type,
		config={},
		interval_ms,
		checks=[]
	}) {
		this.id = id;
		this.name = name;
		this.last_check_time = last_check_time;
		this.type = type;
		this.interval_ms = interval_ms;

		this.validate_config(config);
		this.config = config;
		this.checks = checks;
	}

	validate_config(config) {
		return true;
	}

	run() {
		throw new Error('Override this method');
	}

	#run() {
		try {
			let run = this.run();
			if(run instanceof Promise) {
				return run;
			}

			return Promise.resolve(run);
		} catch(e) {
			return Promise.reject(e);
		}
	}

	test() {
		const then_ms = Date.now();
		// Instanciate with then_ms in case 1ms happened between the two
		const now = new Date(then_ms).toISOString();

		return this.#run().then(result => {
			const ping = Date.now() - then_ms;

			return {
				id: this.id,
				date: now,
				up: true,
				result,
				error: null,
				ping,
				last_check_time: now
			};

		}).catch(e => {
			const ping = Date.now() - then_ms;

			return {
				id: this.id,
				date: now,
				up: false,
				error: e,
				result: null,
				ping,
				last_check_time: now
			};
		});
	}
}

module.exports = Monitor;
