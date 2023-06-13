const Monitor = require('./monitor');

const DEFAULT_CONFIG = {
	method: 'GET',
	endpoint: null,
	follow_redirects: true,
	headers: {},
	expected_status_range: [200, 200],
	timeout: 1000,
	contains: null
};

class HTTPMonitor extends Monitor {
	constructor({ config, ...rest }) {
		const default_config = {
			...DEFAULT_CONFIG,
			...config
		};

		super({ config: default_config, ...rest });
	}

	validate_config({ method, endpoint }) {
		if(!(method && endpoint)) {
			throw new Error('Missing endpoint or method');
		}
	}

	run() {
		const {
			endpoint,
			port,
			method,
			follow_redirects,
			headers,
			expected_status_range,
			timeout,
			contains
		} = this.config;

		const [min_status=200, max_status=200] = expected_status_range || [];

		const abort_controller = new AbortController();

		const abort_timeout = setTimeout(() => {
			abort_controller.abort();
		}, timeout);

		// Perform HTTP Request
		// Check connect & response time
		return fetch(endpoint, {
			method,
			redirect: follow_redirects ? 'follow' : 'manual',
			headers: new Headers({
				'User-Agent': 'control\'s ping', 
				...headers
			}),
			signal: abort_controller.signal
		}).then(response => {
			if(response.status < min_status || response.status > max_status) {
				throw new Error(`Status was ${response.status}`);
			}

			if(contains) {
				return response.text().then(text => {
					const reg = new RegExp(contains, 'g');
					if(!reg.test(text)) {
						throw new Error('Response did not contain expected text');
					}
				});
			}
		}).finally(() => {
			clearTimeout(abort_timeout);
		});
	}
}

module.exports = HTTPMonitor;
