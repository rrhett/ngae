#!/usr/bin/env node
'use strict';

const path = require('path');
const spawnSync = require('child_process').spawnSync;

const compile = (dir) => {
  require('./clean').clean(dir);

  const step = require('./status.js').status('Compiling');

  // TODO: figure out how to get this logging to print, do I need spawn?
  spawnSync('ng', ['build', '--prod', '-d', '/gc']);

  const genFilesDir = path.join(dir, 'genfiles');
  const genContentDir = path.join(dir, 'generated_content');
  const distDir = path.join(process.cwd(), 'dist');

  spawnSync('mkdir', [genFilesDir]);

  spawnSync('cp', [path.join(distDir, 'index.html'), path.join(genFilesDir, 'index.html')]);
  spawnSync('cp', ['-R', distDir, genContentDir]);
  spawnSync('rm', ['-f', path.join(genContentDir, 'index.html')]);

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
  compile(config.dir);
}
