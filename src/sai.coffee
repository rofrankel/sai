`Sai = {};`
Sai.util = {}

Sai.imagePath ?= '/static/images/sai/'

Sai.util.roundToMag = (x, mag) ->
  mag ?= 0
  target = Math.pow(10, mag)
  return parseFloat((Math.round(x / target) * target).toFixed(Math.max(0, mag)))

Sai.util.round = (x, target) ->
  return parseFloat((Math.round(x / target) * target).toFixed(Math.max(0, Math.ceil(-1 * Math.log(target) / Math.LN10))))

# why isn't this already in JS? :/
Sai.util.sumArray = (a) ->
  sum = 0
  for i in [0...a.length]
    sum += if typeof a[i] is 'number' then a[i] else 0
  
  return sum

Sai.util.prettystr = (x, precision) ->
  precision ?= 2
  if typeof x is 'number'
    suffix = ''
    if Math.abs(x) >= 1000000000000
      suffix = 't'
      x /= 1000000000000
    else if Math.abs(x) >= 1000000000
      suffix = 'b'
      x /= 1000000000
    else if Math.abs(x) >= 1000000
      suffix = 'm'
      x /= 1000000
    else if Math.abs(x) >= 1000
      suffix = 'k'
      x /= 1000
    else
      return String(parseFloat(x.toFixed(precision)))
    
    return parseFloat(x.toFixed(1)) + suffix
  
  return x

Sai.util.prettynum = (num) ->
  if isNaN(parseFloat(num))
    return undefined
  
  num = String(num).split('.')
  rgx = /(\d+)(\d{3})/
  while rgx.test(num[0])
    num[0] = num[0].replace(rgx, '$1,$2')
  
  if num.length > 1 and false
    alert num[1]
    alert "bbb" + parseFloat("0." + num[1]).toFixed(2).slice(1)
  
  return num[0] + (if num.length > 1 then parseFloat("0." +num[1]).toFixed(2).slice(1) else '')

Sai.util.infoSetters = (fSetInfo, info) ->
  [
    () ->
      fSetInfo(info)
    ,
    () ->
      fSetInfo()
  ]

Sai.util.transformCoords = (evt, canvas) ->
  if canvas.getScreenCTM
    svgPoint = canvas.createSVGPoint();
    svgPoint.x = evt.clientX
    svgPoint.y = evt.clientY
    xformed = svgPoint.matrixTransform(canvas.getScreenCTM().inverse())
    # stupid WebKit bug
    if navigator.userAgent.toLowerCase().indexOf('chrome') isnt -1 or navigator.userAgent.toLowerCase().indexOf('safari') isnt -1 then xformed.x += document.body.scrollLeft
    return {x: xformed.x, y: xformed.y}
  else
    {x: event.x, y: event.y}


Sai.util.multiplyColor = (colorStr, coeff, fromWhite, padding) ->
  padding ?= 0
  coeff = padding + (1.0 - padding) * coeff
  rgb = Raphael.getRGB(colorStr)
  if fromWhite
    r = rgb.r + ((255 - rgb.r) * (1.0 - coeff))
    g = rgb.g + ((255 - rgb.g) * (1.0 - coeff))
    b = rgb.b + ((255 - rgb.b) * (1.0 - coeff))
  else
    r = rgb.r * coeff
    g = rgb.g * coeff
    b = rgb.b * coeff
  return {
    r: r, g: g, b: b,
    str: "rgb(#{r}, #{g}, #{b})"
  }

# if a channel color is 2/3 of the way from black to mirror,
# then the result in that channel is 1/3 of the way from the mirror to white
Sai.util.reflectColor = (color, mirror) ->
  max = 255
  
  crgb = Raphael.getRGB(color)
  mrgb = Raphael.getRGB(mirror)
  rgb = {}
  for channel in ['r', 'g', 'b']
    c = crgb[channel]
    m = mrgb[channel]
    if c == m
      rgb[channel] = c
    # if c is .9 and m is .2 then we want 2 * (1 - 7/8) = 1.75
    else if c > m 
      rgb[channel] =  m * ((max - c) / (max - m))
    else
      rgb[channel] = (max * (m - c) + (m * c)) / m
  
  return "rgb(#{rgb.r}, #{rgb.g}, #{rgb.b})"

# for maps
Sai.data ?= {}
Sai.data.map ?= {}

Raphael.fn.sai ?= {}

Raphael.fn.sai.chart = (x, y, w, h, type, data) ->
  type = {
    'line': Sai.LineChart
  }[type] ? type
  
  type ?= Sai.Chart
  
  chart = new type(this, x, y, w, h, data)
  chart.render()
  