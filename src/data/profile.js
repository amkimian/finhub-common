module.exports = (config) => {
	var module = {};
	const gcloud = require('google-cloud');
	const ds = gcloud.datastore(config);
	const storage = gcloud.storage(config);
	const Profile = 'Profile';
	// Code to manage profiles of users and organizations

	module.getProfileByKey = (key, cb) => {
		ds.get(ds.key([Profile, key]), (err, profile) => {
			if (err) {
				return cb(err);
			}
			else {
				ensureProfileStorage(key, profile, cb);
			}
		});
	}

	module.createProfile = (key, userRecord, cb) => {
		var profile = {};
		profile.email = userRecord.email;
		profile.displayName = userRecord.displayName;
		profile.photoURL = userRecord.photoURL;

		ds.save({
			key: ds.key([Profile, key]),
			data: profile
		}, cb);
	}

	// Ensure that the profile has a storage associated with it. We use
	// this to store resources such as files in datasets and for dataset marketing material
	// such as a banner image.

	var ensureProfileStorage = (key, profile, cb) => {
		if (!profile.storageBucket) {
			var bucketName = process.env.GCLOUD_PROJECTID + '-profile-' + key.toLowerCase();
			storage.createBucket(bucketName, (err, bucket) => {
				if (err) {
					return cb(err);
				}
				else {
					profile.storageBucket = bucketName;
					ds.save({
						key: ds.key([Profile, key]),
						data: profile
					}, (err) => {
						return cb(err, profile);
					});
				}
			});
		}
		else {
			cb(null, profile);
		}
	};

	module.getProfileBucket = (key, cb) => {
		ds.get(ds.key([Profile, key]), (err, profile) => {
			if (err) {
				return cb(err);
			}
			else {
				var bucket = storage.bucket(profile.storageBucket);
				return cb(null, bucket);
			}
		});
	};

	module.streamFile = (key, filename, cb) => {
		ds.get(ds.key([Profile, key]), (err, profile) => {
			if (err) {
				return cb(err);
			}
			var bucket = storage.bucket(profile.storageBucket);
			var file = bucket.file(filename);
			file.getMetadata((err, metadata) => {
				if (err) {
					return cb(err);
				}
				file.download((err, contents) => {
					if (err) {
						cb(err);
					}
					else {
						cb(null, metadata.contentType, contents);
					}
				});
			});
		});
	}
	return module;
};
