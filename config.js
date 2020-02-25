'use strict';

const chalk = require('chalk');
const path = require('path');

function get(config, name, defaultValue) {
  if (name in config) {
    return config[name];
  }
  // If we do not have a default value, assume the field is required.
  if (arguments.length === 2) {
    console.error(chalk.red('Config must define ' + name));
    process.exit(1);
  }
  return defaultValue;
};

exports.config = (file) => {
  if (file === undefined) {
    console.error(chalk.red('Must specify a configuration file'));
    process.exit(1);
  }
  const config = {
    firebase: false
  };
  // First, check if this is a firebase project with hosting.
  try {
    const firebaseJson = require(path.join(process.cwd(), 'firebase.json'));
    if ('hosting' in firebaseJson) {
      // Firebase is configured for hosting. Ensure that the public directory is
      // 'dist'.
      const servedDir = get(firebaseJson['hosting'], 'public');
      if (servedDir !== 'dist') {
        console.error(chalk.red('firebase must set hosting.public=\'dist\''));
        process.exit(1);
      }
      config.firebase = true;
      // For now, we'll assume firebase CLI will read projectId from .firebaserc
      // and we won't customize behavior.
      return config;
    }
  } catch (e) {
    // Not firebase, this is okay.
  }

  // Fall back to appengine configuration.
  try {
    const fileConfig = require(path.join(process.cwd(), file));
    config.dir = path.join(process.cwd(), get(fileConfig, 'dir'));
    config.projectId = get(fileConfig, 'projectId');
    return config;
  } catch (e) {
    console.error('Missing configuration file: ' + file, e);
    process.exit(1);
  }
};
