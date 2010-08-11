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
  sourceFiles = ['sai.chart', 'sai.plot', 'sai.prim']
  
  compile(rootFile, true)
  
  for src in sourceFiles
    try
      compile(src)
    catch error
      puts 'build error: ' + error

