exec: require('child_process').exec

task 'build', 'build all of the source files', ->
  sourceFiles: ['sai.coffee']
  for src in sourceFiles
    puts 'building ' + src
    exec(['coffee -c src/' + src])