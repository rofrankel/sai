exec: require('child_process').exec
fs: require('fs')
coffee: require('./coffee-script')

task 'build', 'build all of the source files', ->

  rootFile = 'sai.coffee'
  puts 'compiling ' + rootFile
  exec(['coffee -c --no-wrap src/' + rootFile])
  
  sourceFiles: ['sai.chart.coffee', 'sai.plot.coffee', 'sai.prim.coffee']
  
  for src in sourceFiles
    puts 'compiling ' + src
    try
      exec(['coffee -c src/' + src])
    catch error
      puts 'build error: ' + error
