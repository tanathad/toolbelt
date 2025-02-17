const P = require('bluebird');
const agent = require('superagent-promise')(require('superagent'), P);
const ProgressBar = require('progress');
const { promisify } = require('util');
const jobDeserializer = require('../deserializers/job');
const config = require('../config');
const { getAuthToken } = require('./authenticator');

const setTimeoutAsync = promisify(setTimeout);

function JobStateChecker(message, logError) {
  const bar = new ProgressBar(`${message} [:bar] :percent `, { total: 100 });
  bar.update(0);

  this.check = async (jobId) => {
    try {
      const jobResponse = await agent
        .get(`${config.serverHost()}/api/jobs/${jobId}`)
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .then((response) => jobDeserializer.deserialize(response.body));

      if (jobResponse && jobResponse.state) {
        let isBarComplete = false;
        if (jobResponse.progress) {
          bar.update(jobResponse.progress / 100);
          isBarComplete = bar.complete;
        }
        if (jobResponse.state !== 'inactive' && jobResponse.state !== 'active') {
          if (jobResponse.state === 'complete' && !isBarComplete) {
            bar.update(1);
          }
          return jobResponse.state !== 'failed';
        }
      }
    } catch (error) {
      if (!error.status) {
        throw error;
      }

      logError(`HTTP ${error.status}: ${error.message}`, { exit: 100 });
    }

    await setTimeoutAsync(1000);
    return this.check(jobId);
  };
}

module.exports = JobStateChecker;
