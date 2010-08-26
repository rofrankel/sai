Raphael.fn.sai.prim ?= {}

getHoverfuncs = (target, attrOn, attrOff, extras) ->
  return [
    () ->
      target.attr(attrOn)
      if extras then extras[0](target)
    ,
    () ->
      target.attr(attrOff)
      if extras then extras[1](target)
  ]

Raphael.fn.sai.prim.candlestick = (x, by0, by1, sy0, sy1, body_width, color, fill, shouldInteract, fSetInfo, extras) ->
  color ?= '#000000'
  body_width++ unless body_width % 2
  bx = x - (body_width / 2.0)
  
  body = @rect(bx, by0, body_width, by1-by0 or 1).attr('stroke', color)
  shadow = @path("M" + x + " " + sy0 +
                 "L" + x + " " + by0 +
                 "M" + x + " " + by1 +
                 "L" + x + " " + sy1).attr('stroke', color)
  
  body.attr('fill', if fill then color else '#ffffff')
  
  candlestick = @set().push(body, shadow)
  
  if shouldInteract
    hoverfuncs = getHoverfuncs(
      candlestick,
      {
        scale: '1.5,1.5,' + x + ',' + (by0 + (by1 - by0) / 2)
        'fill-opacity': 0.5
      },
      {
        scale: '1.0,1.0,' + x + ',' + (by0 + (by1 - by0) / 2)
        'fill-opacity': 1.0
      },
      extras
    )
    
    candlestick.hover(
      hoverfuncs[0],
      hoverfuncs[1]
    )
  
  return candlestick


Raphael.fn.sai.prim.line = (coords, color, width) ->
  color ?= '#000000'
  width ?= 1
  
  for coord in coords
    continue unless coord?
    if path?
      path += ("L" + coord[0] + " " + coord[1])
    else
      path = ("M" + coord[0] + " " + coord[1])
  
  return @path(path).attr({'stroke': color, 'stroke-width': width})


Raphael.fn.sai.prim.area = (coords, color, width, baseline) ->

  return @set() if coords.length < 2
  
  color ?= '#000000'
  width ?= 1
  
  for coord in coords
    continue unless coord?
    if strokePath?
      strokePath += ("L" + coord[0] + " " + coord[1])
      areaPath += ("L" + coord[0] + " " + coord[1])
    else
      strokePath = ("M" + coord[0] + " " + coord[1])
      areaPath = ("M" + coord[0] + " " + coord[1])
  
  for i in [baseline.length-1..0] by -1
    areaPath += "L#{baseline[i][0]},#{baseline[i][1]}"
  
  area = @path(areaPath).attr({'fill': color, 'stroke-width': 0, 'stroke-opacity': 0, 'fill-opacity': 0.35})
  stroke = @path(strokePath).attr({'stroke': color, 'stroke-width': width})
  
  return @set().push(area, stroke)


# colors is a list parallel to coords
Raphael.fn.sai.prim.stackedBar = (coords, colors, width, baseline, shouldInteract, fSetInfo, extras) ->

  if shouldInteract and coords[coords.length - 1]?
    totalHeight = baseline - coords[coords.length - 1][1]

  width *= .67
  stack = @set()
  prev = baseline
  for i in [0...coords.length]
    continue unless coords[i]? and coords[i][1] isnt baseline
    height = prev - coords[i][1]
    axisClip = if i is 0 then 1 else 0 # visual hack to prevent bars covering x axis
    stack.push(
      bar = @rect(
        coords[i][0] - (width / 2.0),
        coords[i][1],
        width,
        height - axisClip
      ).attr('fill', colors?[i] or '#000000')
      .attr('stroke', colors?[i] or '#000000')
    )
    
    if shouldInteract
      hoverfuncs = getHoverfuncs(
        bar,
        {
          'fill-opacity': '0.75'
        },
        {
          'fill-opacity': '1.0'
        },
        [
          ((_percent) ->
            () ->
              if extras[0] then extras[0]()
              fSetInfo({'(selected)': Sai.util.prettystr(_percent) + '%'}, false)
          )(100 * height / totalHeight)
          ,
          extras[1]
        ]
      )
      
      bar.hover(
        hoverfuncs[0],
        hoverfuncs[1]
      )
    
    prev = coords[i][1]
  
  return stack


# colors is a list parallel to coords
Raphael.fn.sai.prim.groupedBar = (coords, colors, width, baseline, shouldInteract, fSetInfo, extras) ->
  group = @set()
  barwidth = width / (coords.length + 1)
  offset = ((width - barwidth) / 2)
  
  axisClip = 0.5  # visual hack to prevent bars covering x axis
  for i in [0...coords.length]
    if coords[i]?[0]?
      base = Math.min(coords[i][1], baseline)
      h = Math.max(coords[i][1], baseline) - base - axisClip
      group.push(
        @rect(
          coords[i][0] - offset + (i * barwidth),
          base,
          barwidth - 1,
          h,
        ).attr('fill', colors?[i] or '#000000')
        .attr('stroke', colors?[i] or '#000000')
      )
  
  if shouldInteract
    hoverfuncs = getHoverfuncs(
      group,
      {
        'fill-opacity': '0.75'
      },
      {
        'fill-opacity': '1.0'
      },
      extras
    )
    
    group.hover(
      hoverfuncs[0],
      hoverfuncs[1]
    )
  
  return group

Raphael.fn.sai.prim.haxis = (vals, x, y, len, width, color, ticklens) ->
  ticklens ?= [10, 5]
  width ?= 1
  color ?= 'black'
  
  line = @path("M" + x + " " + y + "l" + len + " 0").attr('stroke', color)
  ticks = @set()
  labels = @set()
  
  max_labels = len / 20
  interval = if max_labels < vals.length then Math.ceil(vals.length / max_labels) else 1
  
  dx = len / (vals.length - 1) * interval
  xpos = x
  xmax = -1
  rotate = false
  padding = 2
  max_label_width = 0
  
  for i in [0...vals.length] by interval
    val = vals[i]
    if val?
      ticklen = ticklens[if String(val) then 0 else 1]
      ticks.push(@path("M" + xpos + " " + y + "l0 " + ticklen).attr('stroke', color))
      unless val is ''
        label = @text(xpos, y + ticklen + padding, Sai.util.prettystr(val))
        bbox = label.getBBox()
        label.attr('y', label.attr('y') + (bbox.height / 2.0))
        labels.push(label)
        
        # handle collision detection for rotation
        bbw = bbox.width
        max_label_width = Math.max(bbw, max_label_width)
        if bbox.x <= xmax then rotate = true
        if bbox.x + bbw > xmax then xmax = bbox.x + bbw
    xpos += dx
  
  result = @set().push(line, ticks, labels)
  
  if rotate
    for label in labels.items
      label.rotate(-90)
      label.translate(0, label.getBBox().width/2 - padding)
    # this is a hack because getBBox() doesn't work for rotated text
    result.push(@rect(x, y, 1, width + max_label_width + ticklens[0]).attr('opacity', '0'))
  
  return result

Raphael.fn.sai.prim.vaxis = (vals, x, y, len, width, right, color, ticklens) ->
  ticklens ?= [10, 5]
  width ?= 1
  color ?= '#000000'
  right ?= false
  
  line = @path("M" + x + " " + y + "l0 " + (-len)).attr('stroke', color)
  ticks = @set()
  labels = @set()
  
  dy = len / (vals.length - 1)
  ypos = y
  
  for val in vals
    unless val is null
      ticklen = ticklens[if String(val) then 0 else 1]
      ticks.push(@path("M" + x + " " + ypos + "l" + (if right then ticklen else -ticklen) + " 0").attr('stroke', color))
      label = @text(x + ((if right then 1 else -1) * (ticklen + 2)), ypos, Sai.util.prettystr(val))
      label.attr({
        'x': label.attr('x') + ((if right then 1 else -1) * label.getBBox().width / 2.0)
        'fill': color
      })
      labels.push(label)
    ypos -= dy
  
  return @set().push(line, ticks, labels)


# texts is a map that is displayed "key = value"
# the __TITLE__ key is shown alone and centered at the top.
# opts used to specify colors
# width and height are inferred
# text is 9px high, so leave 10 px each
Raphael.fn.sai.prim.popup = (x, y, texts, opts) ->
  TEXT_LINE_HEIGHT = 10
  
  set = @set()
  text_set = @set()
  max_width = 0
  py = y + 5 + (TEXT_LINE_HEIGHT / 2)
  
  if '__HEAD__' of texts
    head_text = @text(x, py, texts['__HEAD__']).attr({'fill': '#cfc', 'font-size': '12', 'font-weight': 'bold'})
    max_width = Math.max(max_width, head_text.getBBox().width)
    text_set.push(head_text)
    py += (TEXT_LINE_HEIGHT + 2) + 5
  
  # create text and find total height
  for text of texts
    continue if text is '__HEAD__'
    t = @text(x + 5, py, text + " = " + texts[text]).attr({'fill': 'white', 'font-weight': 'bold'})
    t.translate(t.getBBox().width / 2, 0)
    max_width = Math.max(max_width, t.getBBox().width)
    py += TEXT_LINE_HEIGHT
    text_set.push(t)
  
  bg_width = max_width + 10
  rect = @rect(x, y, bg_width, (py - y), 5).attr({'fill': 'black', 'fill-opacity': '.85', 'stroke': 'black'})
  
  head_text?.translate(bg_width / 2)
  text_set.toFront()
  

# colors is a map from key names to colors
Raphael.fn.sai.prim.legend = (x, y, max_width, colors, highlightColors) ->
  spacing = 15
  line_height = 14
  y -= line_height
  
  set = @set()
  
  px = x
  py = y
  
  for text of colors
    t = @text(px + 14, py, text).attr({
      fill: highlightColors?[text] ? 'black'
    })
    t.translate(t.getBBox().width / 2, t.getBBox().height / 2)
    r = @rect(px, py, 9, 9).attr({
      'fill': colors[text] ? 'black'
      'stroke': highlightColors?[text] ? 'black'
    })
    key = @set().push(t, r)
    
    if (px - x) + spacing + key.getBBox().width > max_width
      set.translate(0, -line_height)
      key.translate(x - px, y - py)
      px = x
      py = y
    
    px += key.getBBox().width + spacing
    
    set.push(key)
  
  return set


# info is a map from labels to info, e.g. {'close': 123.45}
Raphael.fn.sai.prim.info = (x, y, max_width, info) ->
  spacing = 15
  line_height = 14
  
  set = @set()
  
  px = x
  py = y
  
  for label of info
    continue if info[label] is null
    text = label + (if label is '' then '' else ': ')
    if typeof info[label] is 'string'
      text += info[label]
    else
      text += Sai.util.prettynum(info[label]) ? Sai.util.prettystr(info[label])
    t = @text(px, py, text)
    tbbox = t.getBBox()
    t.translate(tbbox.width / 2, tbbox.height / 2)
    
    if (px - x) + spacing + tbbox.width > max_width
      t.translate(x - px, line_height)
      px = x
      py += line_height
    
    px += tbbox.width + spacing
    
    set.push(t)
  
  return set


Raphael.fn.sai.prim.hoverShape = (fDraw, attrs, extras, hoverattrs) ->
  shape = fDraw(this).attr(attrs)
  
  hoverfuncs = getHoverfuncs(
    shape,
    hoverattrs and hoverattrs[0] or {},
    hoverattrs and hoverattrs[1] or {},
    extras
  )
  ###
  shape.hover(
    hoverfuncs[0],
    hoverfuncs[1]
  )
  ###
  shape.mouseover(hoverfuncs[0])
  shape.mouseout(hoverfuncs[1])
  return shape


Raphael.fn.sai.prim.histogram = (x, y, w, h, data, low, high, label, color, bgcolor, fromWhite, numBuckets) ->
  bgcolor ?= 'white'
  color ?= 'black'
  numBuckets ?= 10
  
  set = @set()
  
  set.push(
    bg = @rect(x, y-h, w, h).attr({
      'stroke-width': 0
      'stroke-opacity': 0
      'fill': bgcolor
    })
  )
  
  bartop = y - (h - 12) # leave room for text at top
  y -= 5 # text height / 2
  
  low ?= 0
  high ?= 1
  
  set.push(lowLabel = @text(x, y, Sai.util.prettystr(low)))
  lowLabel.translate(lowLabel.getBBox().width / 2, 0)
  set.push(highLabel = @text(x + w, y, Sai.util.prettystr(high)))
  highLabel.translate(-highLabel.getBBox().width / 2, 0)
  
  y -= 7 # rest of text, plus padding
  
  buckets = {}
  maxBucket = 0
  
  for datum in data
    idx = Math.min(numBuckets - 1, Math.floor(numBuckets * datum / 1))
    if idx of buckets then buckets[idx] += 1 else buckets[idx] = 1
    maxBucket = Math.max(maxBucket, buckets[idx])
  
  set.push(hrule = @path("M#{x},#{y} l#{w}, 0").attr('stroke', color))
  y -= 1
  
  bw = w / numBuckets
  for bucket of buckets
    bh = (y - bartop) * (buckets[bucket] / maxBucket)
    set.push(
      @rect(x + ((parseInt(bucket) + 0.2) * bw), y - bh, bw * .6, bh)
      .attr({
        'fill': Sai.util.multiplyColor(color, (parseInt(bucket) + 0.5) / numBuckets, fromWhite, 0.2).str,
        'stroke-width': if fromWhite then .35 else 0,
        'stroke-opacity': if fromWhite then 1 else 0,
        'stroke': '#000000'
      })
    )
  
  set.push(lbl = @text(x + w/2, bartop - 6, Sai.util.prettystr(label)))
  
  return set
  