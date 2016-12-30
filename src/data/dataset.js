module.exports = (config) => {
	var module = {};
	const gcloud = require('google-cloud');
	const ds = gcloud.datastore(config);
	const DataSet = 'DataSet';
	// Code to manage datasets

	module.getDataSets = (ownerId, pageSize, pageCursor, cb) => {
		var query = ds.createQuery(DataSet);
		query.filter('owner', ownerId);
		query.limit(pageSize);
		if (pageCursor && pageCursor != 'undefined') {
			console.log("Setting starting point for pageCursor " + pageCursor);
			query.start(pageCursor);
		}
		ds.runQuery(query, (err, datasets, info) => {
			var ds2 = datasets.map(function(entity) {
				var newE = entity;
				newE.id = entity[ds.KEY];
				return newE;
			});
			//console.log("Keys are " + JSON.stringify(keys));
			cb(err, ds2, info);
		});
	};

	module.putDataSet = (dataset, owner, cb) => {
		ds.save({
			key: ds.key(['Profile', owner, DataSet]),
			data: dataset
		}, cb);
	};

	return module;
}
