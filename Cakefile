exec: require('child_process').exec

task 'build', 'build all of the source files', ->

  rootFile = 'sai.coffee'
  puts 'compiling ' + rootFile
  exec(['coffee -c --no-wrap src/' + rootFile])
  
  sourceFiles: ['sai.chart.coffee', 'sai.plot.coffee', 'sai.prim.coffee']
  
  for src in sourceFiles
    puts 'compiling ' + src
    exec(['coffee -c src/' + src])
