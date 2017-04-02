#!/usr/bin/env node
'use strict';

const chalk = require('chalk');
const execSync = require('child_process').execSync;
const path = require('path');
const spawnSync = require('child_process').spawnSync;

const err = (msg) => {
  console.error(chalk.red(msg));
  process.exit(1);
};

const publish = (dir, projectId) => {
  require('./compile').compile(dir);

  const step = require('./status.js').status('Publishing');

  const tag = spawnSync('git', ['tag', '-l', '--contains']).stdout.toString().trim();

  // We generate a version based on the git tag of the commit.
  // TODO: maybe allow a version to be passed in and it to git tag?
  // Or allow a prefix or something, so e.g. it looks for ngae-version?
  // For this we verify we have only one tag.
  // Also, appengine requires that the version:
  // - matches [a-z][a-z0-9-]*
  // - doesn't start with ah-
  // - isn't default or latest
  // And for safety we'll further impose:
  // - isn't in use by the app already
  if (tag.includes('\n') || tag.length == 0) {
    err('The current commit must contain exactly one tag');
  }
  if (tag.startsWith('ah-')) {
    err('Tag cannot start with ah-');
  }
  if (tag === 'default' || tag === 'latest') {
    err(`The label ${tag} is reserved.`);
  }
  const requiredRegex = /^[a-z][a-z0-9-]*$/;
  if (!requiredRegex.test(tag)) {
    err(`${tag} must match ${requiredRegex}`);
  }

  const versions = spawnSync('gcloud',
      ['app', 'versions', 'describe', tag, '-s', 'default', '--project',
      projectId]);
  // If gcloud app versions describes exits with status 1, it found the app with
  // the given version. We don't want to accidentally overwrite the app version,
  // so abort here.
  if (versions.status === 0) {
    err(`gcloud app versions exited with error; make sure ${tag} isn't an existing version`);
  }

  // Note: gcloud app deploy will additionally prompt.
  console.log(`About to publish version ${tag}.`);
  try {
    // stdio: [0, 1, 2] uses this process' stdio, effectively running this
    // script inline.
    execSync(
        `gcloud app deploy --version ${tag} --project ${projectId}`,
        {cwd: dir, stdio: [0, 1, 2]});
    step.done();
  } catch (e) {
    step.error('');
  }
};

exports.publish = publish;

if (require.main == module) {
  const program = require('commander');

  program.arguments('')
      .option('-c, --config [file]', 'Configuration file')
      .action(() => { });
  program.parse(process.argv);

  const config = require('./config.js').config(program.config);
  publish(config.dir, config.projectId);
}
