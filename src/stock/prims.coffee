Raphael.fn.sai.prim.candlestick = (x, by0, by1, sy0, sy1, body_width, color='black', fill, shouldInteract, fSetInfo, extras) ->
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
