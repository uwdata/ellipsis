fs            = require 'fs'
{print}       = require 'util'
{spawn, exec} = require 'child_process'

task 'test', 'test against the specs', ->
    args = ['--color', '--coffee', '--verbose', 'spec/']
    jasmine = spawn 'jasmine-node', args
    jasmine.stdout.on 'data', (data) -> print data.toString()
    jasmine.stderr.on 'data', (data) -> print data.toString()