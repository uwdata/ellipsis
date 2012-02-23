fs            = require 'fs'
{print}       = require 'util'
{spawn, exec} = require 'child_process'

task 'build', 'compile coffee files and concatenate', ->
    files = ['version', 'util', 'state', 'vis', 'annotation']
    args = ['--compile', '--join', 'n3.js']
    args.push "src/#{file}.coffee" for file in files
        
    coffee = spawn 'coffee', args
    coffee.stdout.on 'data', (data) -> print data.toString()
    coffee.stderr.on 'data', (data) -> print data.toString()    
    

task 'test', 'test against the specs', ->
    args = ['-c', '-j', 'test/support/jasmine.yml']
    jasmine = spawn 'jasmine-headless-webkit', args
    jasmine.stdout.on 'data', (data) -> print data.toString()
    jasmine.stderr.on 'data', (data) -> print data.toString()