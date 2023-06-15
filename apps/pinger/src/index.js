const { Model } = require('db');
const { manager } = require('./manager');

export default {
	scheduled: (event, env, ctx) => {
		Model.DB = env.PING_DB;
		const run_promise = manager.run().catch(e => {
			console.error(e);

			return fetch('https://api.logsnag.com/v1/log', {
				method: 'POST',
				body: JSON.stringify({
					project: 'ping',
					channel: 'pinger-errors',
					event: e.message || 'Unknown error',
					description: e.stack,
					notify: true,
				}),
				headers: {
					Authorization: `Bearer ${env.LOGSNAG_TOKEN}`,
					'Content-Type': 'application/json'
				}
			}).finally(() => {
				throw e;
			});
		});

		ctx.waitUntil(run_promise);
	}
}
