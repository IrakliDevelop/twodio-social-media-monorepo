const { sh, cli, help } = require('tasksfile');
const YAML = require('yaml');

const codegenConfig = YAML.parse(fs.readFileSync('./codegen.yml', 'utf8'));

function rebuildTypes(options) {
  sh('npx graphql-codegen --config ./codegen.yml');
}

help(rebuildTypes, `rebuild types generated from GraphQL schema: ${codegenConfig.schema}`);

cli({
  'rebuild-types': rebuildTypes,
});
