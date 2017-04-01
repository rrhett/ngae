#!/usr/bin/env node
'use strict';

const pkg = require('./package.json')
const program = require('commander');

program
    .version(pkg.version)
    .command('compile', 'Does a production build of the client')
    .command('run', 'Runs the dev appengine server')
    .parse(process.argv);
