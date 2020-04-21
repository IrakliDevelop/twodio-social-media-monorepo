const fs = require('fs');
const path = require('path');
const url = require('url');
const colors = require('colors');
const superagent = require('superagent');

const taskPrefix = 'Deploy:dgraph-schema -';

const delay = ms => new Promise(res => setTimeout(res, ms));
const defaultEnv = 'dev';
const defaultLog = () => {};
const defaultDelayMs = 2000;

async function deploy (
  databaseUrl,
  log = defaultLog,
  delayMs = defaultDelayMs
) {
  await delay(delayMs);
  const schemaPath = path.resolve(__dirname, './schema.gql');
  log('log', `deploying to url: ${databaseUrl}`);
  const result = await superagent
    .post(url.resolve(databaseUrl, 'admin/schema'))
    .send(fs.readFileSync(schemaPath, 'utf8'));

  const errors = result.body && result.body.errors || [];
  if (errors.length) {
    throw Error(errors.map(x => x.message || x));
  }
};

module.exports.deploy = deploy;
module.exports.deployToEnv = function (
  env = defaultEnv,
  log = defaultLog,
  delayMs = defaultDelayMs
) {
  switch (env) {
    case 'dev':
      return deploy('http://localhost:8070', log, delayMs);
    default:
      throw Error(`${taskPrefix} unknown env: ${env}`);
  }
};
