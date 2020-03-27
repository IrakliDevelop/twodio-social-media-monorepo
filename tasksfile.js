const fs = require('fs');
const { sh, cli, help } = require('tasksfile');
const YAML = require('yaml');

const codegenConfig = YAML.parse(fs.readFileSync('./codegen.yml', 'utf8'));

function rebuildTypes(options) {
  sh('npx graphql-codegen --config ./codegen.yml');
}

function deployDatabase(options, env) {
  return require('./database/deploy').deployToEnv(env || options.env || 'dev');
}

async function deploy(options, ...objects) {
  options.env = options.env || 'dev';
  const hasObject = obj => objects.length <= 0 || objects.includes(obj);
  if (['database', 'db'].some(obj => hasObject(obj))) {
    await deployDatabase(options, options.env);
  }
  console.log('Deployments finished!');
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
