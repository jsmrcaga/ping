const path = require('node:path');

module.exports = {
	mode: 'production',
	entry: './src/app.js',
	output: {
		path: path.resolve(__dirname),
		filename: 'out.js'
	}
};
