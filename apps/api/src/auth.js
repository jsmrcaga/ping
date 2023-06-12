module.exports = (handler) => {
	return (request, params, preprocessed, event, ...rest) => {
		// Cloudflare workers on module format only export env variables on
		// env parameter... kill me pls
		const { ADMIN_USERNAME, ADMIN_KEY } = event.env || {};

		if(!ADMIN_USERNAME && !ADMIN_KEY) {
			return new Response(JSON.stringify({
				error: 'Admin username/key have not been configured'
			}), {
				status: 426,
				headers: {
					'Content-Type': 'application/json'
				}
			});
		}

		if(!request.headers.get('Authorization')) {
			return new Response(null, {
				status: 401,
				headers: {
					'WWW-Authenticate': 'Basic realm=admin'
				}
			});
		}

		const auth = request.headers.get('Authorization');

		try {
			const [username, key] = atob(auth.replace(/^Basic\s/gi, '')).split(':');

			if(username !== ADMIN_USERNAME || key !== ADMIN_KEY) {
				return new Response('Wrong credentials', {
					status: 401,
					headers: {
						'WWW-Authenticate': 'Basic realm=admin'
					}
				});
			}
		} catch(e) {
			return new Response('Wrong credentials - not decoded', {
				status: 401,
				headers: {
					'WWW-Authenticate': 'Basic realm=admin'
				}
			});
		}

		return handler(request, params, preprocessed, event, ...rest);
	};
};
