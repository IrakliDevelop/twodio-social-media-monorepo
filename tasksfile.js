const fs = require('fs');
const { sh, cli, help } = require('tasksfile');
const YAML = require('yaml');
const colors = require('colors');

const codegenConfig = YAML.parse(fs.readFileSync('./codegen.yml', 'utf8'));

const typeColor = (type) => {
  switch (type) {
    case 'success': return colors.bgBlack.green;
    case 'warn': return colors.yellow;
    case 'error': return colors.bgBlack.red;
    default: return x => x;
  }
};

const logger = prefix => (type, ...msgs) => {
  const msgColor = typeColor(type);
  type = type === 'success' ? 'log' : type;
  const msg = msgs.length > 1 ? JSON.stringify(msgs, 0, 2) : msgs.join(' ');
  console[type](
    prefix.bold,
    msgColor(msg)
  );
};

function rebuildTypes(options) {
  sh('npx graphql-codegen --config ./codegen.yml');
}

async function deployDatabase(options, env) {
  const log = logger('Deploy:dgraph-schema -');
  const deployToEnv = require('./database/deploy').deployToEnv
  try {
    await deployToEnv(env || options.env, log);
  } catch (err) {
    log('error', err.message || err);
    throw err;
  }
}

async function deploy(options, ...objects) {
  const log = logger('Deploy -');
  options.env = options.env || 'dev';
  const hasObject = obj => objects.length <= 0 || objects.includes(obj);

  try {
    if (['database', 'db'].some(obj => hasObject(obj))) {
      await deployDatabase(options, options.env);
    }
    log('success', 'Success!');
  } catch (_) {
    log('error', 'Fail!');
  }
}

help(rebuildTypes, `rebuild types generated from GraphQL schema: ${codegenConfig.schema}`);
help(deploy, 'deploy', {
  params: ['...objects'],
  options: {
    env: 'to which env to deploy to. default "dev"'
  },
  examples: `
    task deploy --env=prod
  `
});

cli({
  'rebuild-types': rebuildTypes,
  'deploy': deploy,
});
