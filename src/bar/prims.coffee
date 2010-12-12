# colors is a list parallel to coords
Raphael.fn.sai.prim.stackedBar = (coords, colors, width, baseline, shouldInteract, fSetInfo, extras) ->
  
  if shouldInteract
    max = min = baseline
    for c in coords
      if max < c[1] then max = c[1]
      if min > c[1] then min = c[1]
    totalHeight = (max - min) or 1

  width *= .67
  stack = @set()
  prev = [baseline, baseline]
  offset = [0, 0]
  pi = (val) ->
    return (if val < baseline then 1 else 0)
  for i in [0...coords.length]
    continue unless coords[i]? and coords[i][1] isnt baseline
    
    is_positive = pi(coords[i][1])
    
    height = Math.abs(prev[is_positive] - coords[i][1])
    axisClip = if prev[is_positive] is baseline then 1 else 0 # visual hack to prevent bars covering x axis
    segment_baseline = coords[i][1] - (if is_positive then 0 else height - axisClip)
    stack.push(
      bar = @rect(
        coords[i][0] - (width / 2.0),
        segment_baseline,
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
          )(100 * (height / totalHeight))
          ,
          extras[1]
        ]
      )
      
      bar.hover(
        hoverfuncs[0],
        hoverfuncs[1]
      )
    
    prev[is_positive] = coords[i][1]
  
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
