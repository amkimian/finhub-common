module.exports = (config) => {
	var module = {};
	const gcloud = require('google-cloud');
	const ds = gcloud.datastore(config);
	const DataSet = 'DataSet';
	// Code to manage datasets

	module.getDataSets = (ownerId, pageSize, pageCursor, cb) => {
		var query = ds.createQuery(DataSet);
		const ancestorKey = ds.key(['Profile', ownerId]);
		query.hasAncestor(ancestorKey);
		//		query.filter('owner', ownerId);
		query.limit(pageSize);
		if (pageCursor && pageCursor != 'undefined') {
			console.log("Setting starting point for pageCursor " + pageCursor);
			query.start(pageCursor);
		}
		ds.runQuery(query, (err, datasets, info) => {
			// Promote the key into the id property
			var ds2 = datasets.map(function(entity) {
				var newE = entity;
				newE.id = entity[ds.KEY];
				return newE;
			});
			//console.log("Keys are " + JSON.stringify(keys));
			cb(err, ds2, info);
		});
	};

	module.getMarketDataSets = (userId, pageSize, pageCursor, cb) => {
		var query = ds.createQuery(DataSet);
		query.filter('private', false);
		query.limit(pageSize);
		if (pageCursor && pageCursor != 'undefined') {
			console.log("Setting starting point for pageCursor " + pageCursor);
			query.start(pageCursor);
		}
		ds.runQuery(query, (err, datasets, info) => {
			// Promote the key into the id property
			var ds2 = datasets.map(function(entity) {
				var newE = entity;
				newE.id = entity[ds.KEY];
				return newE;
			});
			cb(err, ds2, info);
		});
	};

	module.putDataSet = (dataset, owner, cb) => {
		ds.save({
			key: ds.key(['Profile', owner, DataSet]),
			data: dataset
		}, cb);
	};

	module.getDataSetById = (id, ownerId, cb) => {
		const dsKey = ds.key(['Profile', ownerId, DataSet, ds.int(id)]);
		console.log("Id is " + id);
		console.log("Profile Id is " + ownerId);
		//const dsKey = ds.key([DataSet, id]);
		ds.get(dsKey, (err, dataset) => {
			// dataset.id = dataset[ds.KEY];
			cb(err, dataset);
		});
	};

	return module;
}
