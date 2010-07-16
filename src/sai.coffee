Sai ?= {}
Sai.util ?= {}

Sai.util.roundToMag: (x, mag) ->
  mag ?= 0
  target: Math.pow(10, mag)
  return parseFloat((Math.round(x / target) * target).toFixed(Math.max(0, mag)))

Sai.util.round: (x, target) ->
  return parseFloat((Math.round(x / target) * target).toFixed(Math.max(0, Math.log(x) / Math.LN10)))

# why isn't this already in JS? :/
Sai.util.sumArray: (a) ->
  sum: 0
  for i in [0...a.length]
    sum += if typeof a[i] == 'number' then a[i] else 0
  
  return sum

Sai.util.prettystr: (x) ->
  if typeof x is 'number'
    suffix: ''
    if x > 999999999999
      suffix: 't'
      x /= 1000000000000
    else if x > 999999999
      suffix: 'b'
      x /= 1000000000
    else if x > 999999
      suffix: 'm'
      x /= 1000000
    else if x > 999
      suffix: 'k'
      x /= 1000
    else
      return x.toFixed(2)
    
    return parseFloat(x.toFixed(1)) + suffix
  
  return x


Sai.util.infoSetters: (fSetInfo, info) ->
  [
    () ->
      fSetInfo(info)
    ,
    () ->
      fSetInfo({})
  ]



Raphael.fn.sai ?= {}

Raphael.fn.sai.chart: (x, y, w, h, type, data) ->
  type = {
    'line': Sai.LineChart
  }[type] or type
  
  type ?= Sai.Chart
  
  chart: new type(this, x, y, w, h, data)
  chart.render()
  