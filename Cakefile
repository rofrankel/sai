exec: require('child_process').exec
fs: require('fs')
coffee: require('./coffee-script')

task 'build', 'build all of the source files', ->

  sourceFiles: ['sai.coffee', 'sai.chart.coffee', 'sai.plot.coffee', 'sai.prim.coffee']
  
  for src in sourceFiles
    try
      exec(
        "coffee -c src/$src",
        (error, stdout, stderr) ->
          if stdout then puts "stdout: $stdout"
          if stderr then puts "stderr: $stderr"
          if error then puts "error: $error"
      )
    catch error
      puts 'build error: ' + error
