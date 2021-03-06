#!/usr/bin/env node
'use strict';

const path = require('path');
const spawnSync = require('child_process').spawnSync;

const compile = (config) => {
  require('./clean').clean(config);

  const step = require('./status.js').status('Compiling');

  const compileArgs = ['build', '--prod'];
  if (!config.firebase) {
    // appengine serves the compiled artifacts in a static path that isn't root
    compileArgs.push('--deployUrl');
    compileArgs.push('/gc/');
  }
  const compileStep = spawnSync('ng', compileArgs);
  if (compileStep.status !== 0) {
    step.error(compileStep.stderr.toString('utf8'));
  }

  if (!config.firebase) {
    const dir = config.dir;
    const genFilesDir = path.join(dir, 'genfiles');
    const genContentDir = path.join(dir, 'generated_content');
    const distDir = path.join(process.cwd(), 'dist');

    spawnSync('mkdir', [genFilesDir]);

    spawnSync('cp', [path.join(distDir, 'index.html'), path.join(genFilesDir, 'index.html')]);
    spawnSync('cp', ['-R', distDir, genContentDir]);
    spawnSync('rm', ['-f', path.join(genContentDir, 'index.html')]);
  }

  step.done();
};

exports.compile = compile;

if (require.main == module) {
  const program = require('commander');

  program.arguments('')
      .option('-c, --config [file]', 'Configuration file', 'ngae.conf.json')
      .action(() => { });
  program.parse(process.argv);

  const config = require('./config.js').config(program.config);
  compile(config);
}
