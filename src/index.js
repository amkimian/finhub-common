module.exports = () => {
	// Bind config
	var module = {};
	module.config = require('./data/config.js');


	module.profile = (projectId) => {
		return require('./data/profile.js')(module.config.getConfig(projectId));
	};

	module.dataset = (projectId) => {
		return require('./data/dataset.js')(module.config.getConfig(projectId));
	}

	return module;
}
