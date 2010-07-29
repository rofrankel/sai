Sai ?= {}
Sai.util ?= {}

Sai.imagePath ?= 'images/'

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
    if Math.abs(x) >= 1000000000000
      suffix: 't'
      x /= 1000000000000
    else if Math.abs(x) >= 1000000000
      suffix: 'b'
      x /= 1000000000
    else if Math.abs(x) >= 1000000
      suffix: 'm'
      x /= 1000000
    else if Math.abs(x) >= 1000
      suffix: 'k'
      x /= 1000
    else
      return String(parseFloat(x.toFixed(2)))
    
    return parseFloat(x.toFixed(1)) + suffix
  
  return x


Sai.util.infoSetters: (fSetInfo, info) ->
  [
    () ->
      fSetInfo(info)
    ,
    () ->
      fSetInfo()
  ]

Sai.util.transformCoords: (coords, canvas) ->
  if canvas.getScreenCTM
    svgPoint: canvas.createSVGPoint();
    svgPoint.x: coords.x
    svgPoint.y: coords.y
    xformed: svgPoint.matrixTransform(canvas.getScreenCTM().inverse())
    return {x: xformed.x, y: xformed.y}
  else
    {x: event.x, y: event.y}

Sai.util.multiplyColor: (colorStr, coeff, bob) ->
  rgb: Raphael.getRGB(colorStr)
  return "rgb(${rgb.r * coeff}, ${rgb.g * coeff}, ${rgb.b * coeff})"


# for maps
Sai.data ?= {}
Sai.data.map ?= {}

Raphael.fn.sai ?= {}

Raphael.fn.sai.chart: (x, y, w, h, type, data) ->
  type = {
    'line': Sai.LineChart
  }[type] or type
  
  type ?= Sai.Chart
  
  chart: new type(this, x, y, w, h, data)
  chart.render()
  