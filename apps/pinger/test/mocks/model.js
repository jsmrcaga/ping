const { mock } = require('node:test');

const { Model } = require('db');

const NativeDate = Date;

module.exports = {
	MockModel: (method, implementation) => {
		return mock.method(Model.prototype, method, implementation);
	},
};
