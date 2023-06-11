const { Model } = require('db');
const { manager } = require('./manager');

export default {
	scheduled: (event, env, ctx) => {
		Model.DB = env.PING_DB;
		const run_promise = manager.run().catch(e => {
			console.error(e);
			throw e;
		});
		ctx.waitUntil(run_promise);
	}
}
