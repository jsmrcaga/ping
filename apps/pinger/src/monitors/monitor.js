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

	test() {
		const then_ms = Date.now();
		// Instanciate with ms in case 1ms happened between the two
		const now = new Date(then_ms).toISOString();

		const run = new Promise((resolve, reject) => {
			try {
				const r = this.run();
				if(r instanceof Promise) {
					return r.then(res => resolve(res)).catch(e => reject(e));
				}
				return resolve(r);
			} catch(e) {
				reject(e);
			}
		});

		return run.then(result => {
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
