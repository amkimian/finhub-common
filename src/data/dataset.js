const btoa = require('btoa');
const atob = require('atob');

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
				return addIdPath(entity);
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
				return addIdPath(entity);
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

	module.createResource = (datasetid, resource, cb) => {
		var pathDecomp = JSON.parse(atob(datasetid));
		pathDecomp.push('Res');
		pathDecomp.push(resource.name);
		console.log("Key path is " + JSON.stringify(pathDecomp));
		var dsKey = ds.key(pathDecomp);
		ds.save({
			key: dsKey,
			data: resource
		}, (err) => {
			if (err) {
				return cb(err);
			}
			else {
				return cb(null, btoa(JSON.stringify(dsKey.path)));
			}
		});
	};

	module.getResources = (datasetid, cb) => {
		var pathDecomp = JSON.parse(atob(datasetid));
		var ancestorKey = ds.key(pathDecomp);
		var query = ds.createQuery('Res');
		query.hasAncestor(ancestorKey);
		ds.runQuery(query, (err, resources, info) => {
			// Promote the key into the id property
			var ds2 = resources.map(function(entity) {
				return addIdPath(entity);
			});
			cb(err, ds2, info);
		});
	};

	var addIdPath = (entity) => {
		var newE = entity;
		var k = entity[ds.KEY];
		var idPath = btoa(JSON.stringify(k.path));
		newE.idPath = idPath;
		return newE;
	};

	module.getDataSetById = (idPath, ownerId, cb) => {
		const pathDecomp = JSON.parse(atob(idPath));
		const dsKey = ds.key(pathDecomp);
		//const dsKey = ds.key([DataSet, id]);
		ds.get(dsKey, (err, dataset) => {
			if (err) {
				return cb(err);
			}
			cb(err, addIdPath(dataset));
		});
	};

	module.updateDataSet = (idPath, dataset, cb) => {
		const pathDecomp = JSON.parse(atob(idPath));
		const dsKey = ds.key(pathDecomp);
		ds.save({
			key: dsKey,
			data: dataset
		}, cb);
	};

	return module;
}
