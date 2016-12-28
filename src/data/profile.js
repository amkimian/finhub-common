module.exports = (config) => {
  var module = {};
  const gcloud = require('google-cloud');
  const ds = gcloud.datastore(config);
  const Profile = 'Profile';
// Code to manage profiles of users and organizations

    module.getProfileByKey = (key, cb) => {
        ds.get(ds.key([Profile, key]), (err, profile) => {
          cb(err, profile);
        });
    }

    return module;
  };
