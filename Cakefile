fs = require('fs')
coffee = require('coffee-script')
sourceDir = 'src/'
targetDir = 'js/'

compile = (source, noWrap) ->
  fs.readFile "#{sourceDir}#{source}.coffee", (err, code) ->
    try
      js = coffee.compile(code.toString(), {source: "#{sourceDir}#{source}.coffee", noWrap: noWrap or false})
      fs.writeFile "#{targetDir}#{source}.js", js
    catch err
      console.log "#{source}.coffee: #{err}"


task 'build', 'build all of the source files', ->
  rootFile = 'sai'
  sourceFiles = ['sai.prim', 'sai.plot', 'sai.chart']
  
  compile(rootFile, true)
  
  compile(src) for src in sourceFiles

  # generate optimized and minified JS
  try
    inputs = "--js js/#{f}.js" for f in [rootFile].concat sourceFiles
    args = ["-jar",  "compiler.jar"]
    
    for f in [rootFile].concat sourceFiles
      args.push("--js")
      args.push("js/#{f}.js")
    
    args.push("--js_output_file")
    args.push("js/sai-min.js")
    #args.push("--compilation_level")
    #args.push("ADVANCED_OPTIMIZATIONS")
    #args.push("--externs")
    #args.push("externs.js")
    
    gclosure = require('child_process').spawn("java", args)
    
    # gclosure.stderr.setEncoding('utf8')
    # gclosure.on('exit', (code, signal) => puts "Google Closure finished with code=#{code} and signal=#{signal}"; @done = true)
    
  catch err
    puts "Error generating minified JavaScript: #{err}"

