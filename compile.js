#!/usr/bin/env node
'use strict';

var program = require('commander');

program.option('-f, --force', 'force something')
    .parse(process.argv);

console.log('compile, force = ' + program.force);
