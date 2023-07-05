const { App } = require('@control/cloudflare-workers-router');
const router = require('./router');

const { Model } = require('db');

const app = new App(router);

app.error((error, request, params, { env }) => {
	console.error(error);

	if(error instanceof Response) {
		return error;
	}

	if(error instanceof Model.DoesNotExist) {
		return new Response(null, { status: 404 });
	}

	return fetch('https://api.logsnag.com/v1/log', {
		method: 'POST',
		body: JSON.stringify({
			project: 'ping',
			channel: 'errors',
			event: error.message || 'Unknown error',
			description: error.stack,
			notify: true,
		}),
		headers: {
			Authorization: `Bearer ${env.LOGSNAG_TOKEN}`,
			'Content-Type': 'application/json'
		}
	}).then(() => {
		return new Response(null, { status: 500 });
	}).catch(e => {
		return new Response(null, { status: 500 });
	});
});

// D1 only works in module workers....
export default {
	fetch: (request, env, context) => {
		// Luckily app.run returns a promise
		try {
			Model.DB = env.PING_DB;
			if(!Model.DB) {
				throw new Error('Cannot bootstrap application, no DB');
			}

			return app.run({ request, env, context }).catch(e => {
				return new Response(null, { status: 500 });
			});
		} catch(e) {
			console.error(e);
			return new Response(null, { status: 500 });
		}
	}
};
