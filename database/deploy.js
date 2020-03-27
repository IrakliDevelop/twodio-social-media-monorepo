const fs = require('fs');
const path = require('path');
const url = require('url');
const superagent = require('superagent');

const taskPrefix = 'Deploy:dgraph-schema -';

const delay = ms => new Promise(res => setTimeout(res, ms));
const log = (type, ...msgs) => {
  console[type](taskPrefix, ...msgs);
};

async function deploy (databaseUrl) {
  const schemaPath = path.resolve(__dirname, './schema.gql');
  for (let i = 0; i < 3; ++i) {
    try {
      log('log', `deploying to url: ${databaseUrl}`);
      await superagent
        .post(url.resolve(databaseUrl, 'admin/schema'))
        .send(fs.readFileSync(schemaPath, 'utf8'));
      break;
    } catch (e) {
      log('error', e);
      await delay(2000);
    }
  }
};

module.exports.deploy = deploy;
module.exports.deployToEnv = function (env) {
  switch (env) {
    case 'dev':
      return deploy('http://localhost:8070');
    default:
      throw Error(`${taskPrefix} unknown env: ${env}`);
  }
};
