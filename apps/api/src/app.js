const { App } = require('@control/cloudflare-workers-router');
const router = require('./router');

const { Model } = require('db');

const app = new App(router);

app.error(error => {
	console.error(error);
	if(error instanceof Response) {
		return error;
	}

	if(error instanceof Model.DoesNotExist) {
		return new Response(null, { status: 404 });
	}

	return new Response(null, { status: 500 });
});

// D1 only works in module workers....
export default {
	fetch: (request, env, context) => {
		// Luckily app.run returns a promise
		try {
			Model.DB = env.PING_DB;
			return app.run({ request, env }).catch(e => {
				return new Response(null, { status: 500 });
			});
		} catch(e) {
			console.error(e);
			return new Response(null, { status: 500 });
		}
	}
};
