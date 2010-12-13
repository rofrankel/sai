fs = require 'fs' 
path = require 'path'
coffee = require 'coffee-script'
{puts} = require 'util'

sourceDir = 'src'
targetDir = 'js'
libDir = 'lib'
mainFile = 'sai.coffee'

VERBOSE = true
inform = (msg) -> puts msg if VERBOSE

# this does a dependency-based topological sort of the different chart modules
tsort = (edges, callback) ->
    ts = require('child_process').exec('tsort')

    ts.stdout.on('data', callback)
    
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
        
        gclosure.stderr.setEncoding('utf8')
        gclosure.on(
            'exit',
            (code, signal) ->
                if code
                    inform "Google Closure finished with code=#{code} and signal=#{signal}"
                else
                    try
                        inform "built minified JS, size is " + fs.statSync('lib/sai-min.js').size
                    catch err
                        puts "something went wrong: #{err}"
        )
        
    catch err
        puts "Error generating minified JavaScript: #{err}"


task 'build', 'build Sai', ->
    # first, compile all .coffee files
    compile_coffeescript = require('child_process').spawn("coffee", ['-o', targetDir, '-c', sourceDir])
    
    # now, collect dependencies
    combine_and_minify = ->
        dependencies = []
        files = fs.readdirSync sourceDir
        for file in files
            stats = fs.statSync path.join(sourceDir, file)
            if stats.isDirectory()
                for dependency in fs.readFileSync(path.join(sourceDir, file, 'dependencies'), 'ascii').split(/\s+/)
                    if dependency
                        dependencies.push(dependency)
                        dependencies.push(file)
        
        # sort the modules and then combine and minify them with Google Closure
        tsort(dependencies, (data) ->
            gclosure data.split(/\s+/)
        )
    
    compile_coffeescript.on('exit', combine_and_minify)

task 'clean', 'clean up intermediate JS', ->
    # sadly, fs.rmdir is non-recursive and fails if the directory isn't empty
    rm = require('child_process').exec("rm -rf #{targetDir}")
    rm.on('exit', -> inform 'cleaned')

    
    