fs = require('fs')
{puts} = require 'util'
path = require 'path'
coffee = require('coffee-script')
sourceDir = 'src'
targetDir = 'js'
libDir = 'lib'
mainFile = 'sai.coffee'

VERBOSE = true

tsort = (edges, callback) ->
    ts = require('child_process').exec('tsort')
    result = []

    ts.stdout.on(
        'data',
        callback
    )
    
    ts.stdin.write(edges.join(' '))
    ts.stdin.end()

gclosure = (dirs) ->
    try
        args = ["-jar", "compiler.jar", "--js", path.join(targetDir, "sai.js")]
        
        for component in ['prims', 'plots', 'charts']
            for d in dirs when d
                filename = path.join(targetDir, d, "#{component#}.js")
                try
                    fs.statSync filename
                    args.push "--js"
                    args.push filename
        
        args.push("--js_output_file")
        args.push(path.join(libDir, "sai-min.js"))
        #args.push("--compilation_level")
        #args.push("ADVANCED_OPTIMIZATIONS")
        #args.push("--externs")
        #args.push("externs.js")
        
        gclosure = require('child_process').spawn("java", args)
        
        puts "java #{args.join(' ')}"
        
        gclosure.stderr.setEncoding('utf8')
        gclosure.on('exit', (code, signal) => puts "Google Closure finished with code=#{code} and signal=#{signal}"; @done = true)
        
    catch err
        puts "Error generating minified JavaScript: #{err}"


task 'build', 'build Sai', ->
    # first, compile all .coffee files
    first_step = require('child_process').spawn("coffee", ['-o', targetDir, '-c', sourceDir])
    
    # now, collect dependencies
    second_step = ->
        dependencies = []
        files = fs.readdirSync sourceDir
        for file in files
            stats = fs.statSync path.join(sourceDir, file)
            if stats.isDirectory()
                for dependency in fs.readFileSync(path.join(sourceDir, file, 'dependencies'), 'ascii').split(/\s+/)
                    if dependency
                        dependencies.push(dependency)
                        dependencies.push(file)
        
        if VERBOSE then puts 'dependencies are:', dependencies.join(' ')
        
        tsort(dependencies, (data) ->
            gclosure data.split(/\s+/)
        )
    
    first_step.on('exit', second_step)

task 'clean', 'clean up', ->
    try
        fs.rmdirSync targetDir
        puts 'cleaned'
    catch err
        puts 'nothing to do.'

    
    