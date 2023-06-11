const path = require('node:path');

module.exports = {
	mode: 'production',
	entry: './src/index.js',
	output: {
		path: path.resolve(__dirname),
		filename: 'out.js'
	}
};
