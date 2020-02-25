#!/usr/bin/env node
'use strict';

const pkg = require('./package.json')
const program = require('commander');

program
    .version(pkg.version)
    .command('clean', 'Cleans up generated content')
    .command('compile', 'Does a production build of the client')
    .command('deploy', 'Deploys to production')
    .command('run', 'Runs the project locally')
    .parse(process.argv);
