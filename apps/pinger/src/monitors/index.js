const NoopMonitor = require('./noop');
const TCPMonitor = require('./tcp');
const HTTPMonitor = require('./http');
const HeartbeatMonitor = require('./heartbeat');

module.exports = {
	TCPMonitor,
	NoopMonitor,
	HTTPMonitor,
	HeartbeatMonitor
};
