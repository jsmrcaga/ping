export function classnames(...args) {
	let classes = args
		.map(arg => {
			if (arg instanceof Object) {
				// Take all keys
				return Object.entries(arg)
					.filter(([, value]) => value)
					.map(([key]) => key);
			}

			if (typeof arg === "string" && arg) {
				return arg;
			}

			return null;
		})
		.filter(value => value)
		.flat();

	return classes.join(" ");
}
