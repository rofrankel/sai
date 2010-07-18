fs: require('fs')
coffee: require('./coffee-script')

compile: (source, noWrap) ->
  fs.readFile "$source\.coffee", (err, code) ->
    try
      js: coffee.compile(code.toString(), {source: "$source\.coffee", noWrap: noWrap or false})
      fs.writeFile "$source\.js", js
    catch err
      console.log err


task 'build', 'build all of the source files', ->
  rootFile = 'src/sai'
  sourceFiles: ['src/sai.chart', 'src/sai.plot', 'src/sai.prim']
  
  compile(rootFile, true)
  
  for src in sourceFiles
    try
      compile(src)
    catch error
      puts 'build error: ' + error

