const Monitor = require('./monitor');

class NoopMonitor extends Monitor {
	run() {
		if(this.config.throws) {
			throw new Error('noop rejection');
		}

		return;
	}
}

module.exports = NoopMonitor;
