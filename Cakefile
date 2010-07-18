exec: require('child_process').exec
fs: require('fs')
coffee: require('./coffee-script')

task 'build', 'build all of the source files', ->

  f: (error, stdout, stderr) ->
    if stdout then puts "stdout: $stdout"
    if stderr then puts "stderr: $stderr"
    if error then puts "error: $error"

  rootFile = 'sai.coffee'
  exec("coffee -c --no-wrap src/$rootFile", f)
  
  sourceFiles: ['sai.chart.coffee', 'sai.plot.coffee', 'sai.prim.coffee']
  
  for src in sourceFiles
    try
      exec("coffee -c src/$src", f)
    catch error
      puts 'build error: ' + error
