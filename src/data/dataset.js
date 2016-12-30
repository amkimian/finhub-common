module.exports = (config) => {
	var module = {};
	const gcloud = require('google-cloud');
	const ds = gcloud.datastore(config);
	const DataSet = 'DataSet';
	// Code to manage datasets

	module.getDataSets = (ownerId, pageSize, pageCursor, cb) => {
		var query = ds.createQuery(DataSet);
		query.select(['__key__', 'dataset', 'description']);
		query.filter('owner', ownerId);
		query.limit(pageSize);
		if (pageCursor && pageCursor != 'undefined') {
			console.log("Setting starting point for pageCursor " + pageCursor);
			query.start(pageCursor);
		}
		ds.runQuery(query, (err, datasets, info) => {
			cb(err, datasets, info);
		});
	};

	module.putDataSet = (dataset, cb) => {
		ds.save({
			key: ds.key([DataSet]),
			data: dataset
		}, cb);
	};

	return module;
}
