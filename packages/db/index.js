const { Model } = require('./models/model');
const { MonitorCheck } = require('./models/monitor-check');
const { Monitor } = require('./models/monitor');
const { Page } = require('./models/page');
const { Incident } = require('./models/incident');

module.exports = {
	Model,
	MonitorCheck,
	Monitor,
	Page,
	Incident,

	models: [
		MonitorCheck,
		Monitor,
		Page,
		Incident
	],
};
