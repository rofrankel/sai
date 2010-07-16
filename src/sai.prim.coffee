Raphael.fn.sai.prim ?= {}

getHoverfuncs: (target, attrOn, attrOff, extras) ->
  return [
    () ->
      target.attr(attrOn)
      if extras then extras[0]()
    ,
    () ->
      target.attr(attrOff)
      if extras then extras[1]()
  ]

Raphael.fn.sai.prim.candlestick: (x, by0, by1, sy0, sy1, body_width, color, fill, shouldInteract, extras) ->
  color ?= '#000'
  body_width++ unless body_width % 2
  bx: x - (body_width / 2.0)
  
  body: this.rect(bx, by0, body_width, by1-by0 or 1).attr('stroke', color)
  shadow: this.path("M" + x + " " + sy0 +
                    "L" + x + " " + by0 +
                    "M" + x + " " + by1 +
                    "L" + x + " " + sy1).attr('stroke', color)
  
  body.attr('fill', if fill then color else 'white')
  
  candlestick: this.set().push(body, shadow)
  
  if shouldInteract
    hoverfuncs: getHoverfuncs(
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


Raphael.fn.sai.prim.line: (coords, color, width) ->
  color ?= '#000'
  width ?= 1
  
  for coord in coords
    continue unless coord?
    if path?
      path += ("L" + coord[0] + " " + coord[1])
    else
      path = ("M" + coord[0] + " " + coord[1])
  
  return this.path(path).attr({'stroke': color, 'stroke-width': width})


# colors is a list parallel to coords
Raphael.fn.sai.prim.stackedBar: (coords, colors, width, baseline, shouldInteract, extras) ->
  width *= .67
  stack: this.set()
  h: baseline
  for i in [0...coords.length]
    continue unless coords[i]? and coords[i][1] isnt baseline
    h: coords[i][1] - (baseline - h)
    stack.push(
      this.rect(coords[i][0] - (width / 2.0),
                h - (if i is 0 then 1 else 0), # visual hack to prevent bars covering x axis
                width,
                baseline - coords[i][1])
      .attr('fill', colors and colors[i] or 'black')
      .attr('stroke', colors and colors[i] or 'black')
    )
  
  if shouldInteract
    hoverfuncs: getHoverfuncs(
      stack,
      {
        'fill-opacity': '0.5'
      },
      {
        'fill-opacity': '1.0'
      },
      extras
    )
    
    stack.hover(
      hoverfuncs[0],
      hoverfuncs[1]
    )
  
  
  return stack


# colors is a list parallel to coords
Raphael.fn.sai.prim.groupedBar: (coords, colors, width, baseline, shouldInteract, extras) ->
  group: this.set()
  return group unless coords[0]?
  barwidth: width / (coords.length + 1)
  x: coords[0][0] - ((width - barwidth) / 2)
  for i in [0...coords.length]
    continue unless coords[i]?
    group.push(
      this.rect(x,
                coords[i][1] - (if i is 0 then 1 else 0), # visual hack to prevent bars covering x axis
                barwidth,
                baseline - coords[i][1])
      .attr('fill', colors and colors[i] or 'black')
      .attr('stroke', colors and colors[i] or 'black')
    )
    x += barwidth
  
  return group



Raphael.fn.sai.prim.haxis: (vals, x, y, len, width, color, ticklens) ->
  ticklens ?= [10, 5]
  width ?= 1
  color ?= '#000'
  
  line: this.path("M" + x + " " + y + "l" + len + " 0").attr('stroke', color)
  ticks: this.set()
  labels: this.set()
  
  dx: len / (vals.length - 1)
  xpos: x
  
  for val in vals
    unless val is null
      ticklen: ticklens[if String(val) then 0 else 1]
      ticks.push(this.path("M" + xpos + " " + y + "l0 " + ticklen).attr('stroke', color))
      unless val is ''
        label: this.text(xpos, y + ticklen + 2, String(val))
        label.attr('y', label.attr('y') + (label.getBBox().height / 2.0))
        labels.push(label)
    xpos += dx
  
  return this.set().push(line, ticks, labels)

Raphael.fn.sai.prim.vaxis: (vals, x, y, len, width, color, ticklens) ->
  ticklens ?= [10, 5]
  width ?= 1
  color ?= '#000'
  
  line: this.path("M" + x + " " + y + "l0 " + (-len)).attr('stroke', color)
  ticks: this.set()
  labels: this.set()
  
  dy: len / (vals.length - 1)
  ypos: y
  
  for val in vals
    unless val is null
      ticklen: ticklens[if String(val) then 0 else 1]
      ticks.push(this.path("M" + x + " " + ypos + "l" + (-ticklen) + " 0").attr('stroke', color))
      label: this.text(x - ticklen - 2, ypos, String(val))
      label.attr('x', label.attr('x') - (label.getBBox().width / 2.0))
      labels.push(label)
    ypos -= dy
  
  return this.set().push(line, ticks, labels)


# texts is a map that is displayed "key: value"
# the __TITLE__ key is shown alone and centered at the top.
# opts used to specify colors
# width and height are inferred
# text is 9px high, so leave 10 px each
Raphael.fn.sai.prim.popup: (x, y, texts, opts) ->
  TEXT_LINE_HEIGHT: 10
  
  set: this.set()
  text_set: this.set()
  max_width: 0
  py: y + 5 + (TEXT_LINE_HEIGHT / 2)
  
  if '__HEAD__' of texts
    head_text: this.text(x, py, texts['__HEAD__']).attr({'fill': '#cfc', 'font-size': '12', 'font-weight': 'bold'})
    max_width: Math.max(max_width, head_text.getBBox().width)
    text_set.push(head_text)
    py += (TEXT_LINE_HEIGHT + 2) + 5
  
  # create text and find total height
  for text of texts
    continue if text is '__HEAD__'
    t: this.text(x + 5, py, text + ": " + texts[text]).attr({'fill': 'white', 'font-weight': 'bold'})
    t.translate(t.getBBox().width / 2, 0)
    max_width: Math.max(max_width, t.getBBox().width)
    py += TEXT_LINE_HEIGHT
    text_set.push(t)
  
  bg_width: max_width + 10
  rect: this.rect(x, y, bg_width, (py - y), 5).attr({'fill': 'black', 'fill-opacity': '.85', 'stroke': 'black'})
  
  head_text?.translate(bg_width / 2)
  text_set.toFront()
  

# colors is a map from key names to colors
Raphael.fn.sai.prim.legend: (x, y, max_width, colors) ->
  spacing: 15
  line_height: 14
  y -= line_height
  
  set: this.set()
  
  px: x
  py: y
  
  for text of colors
    t: this.text(px + 14, py, text)
    t.translate(t.getBBox().width / 2, t.getBBox().height / 2)
    r: this.rect(px, py, 9, 9).attr({'fill': colors[text]})
    key: this.set().push(t, r)
    
    if (px - x) + spacing + key.getBBox().width > max_width
      set.translate(0, -line_height)
      key.translate(x - px, y - py)
      px: x
      py: y
    
    px += key.getBBox().width + spacing
    
    set.push(key)
  
  return set


# info is a map from labels to info, e.g. {'close': 123.45}
Raphael.fn.sai.prim.info: (x, y, max_width, info) ->
  spacing: 15
  line_height: 14
  
  set: this.set()
  
  px: x
  py: y
  
  for label of info
    t: this.text(px, py, label + ': ' + Sai.util.prettystr(info[label]))
    t.translate(t.getBBox().width / 2, t.getBBox().height / 2)
    
    if (px - x) + spacing + t.getBBox().width > max_width
      t.translate(x - px, line_height)
      px: x
      py += line_height
    
    px += t.getBBox().width + spacing
    
    set.push(t)
  
  return set
