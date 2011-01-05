Raphael.fn.sai.prim.line = (coords, color='black', width=1) ->
    for coord in coords when coord?
        if path?
            path += ("L" + coord[0] + " " + coord[1])
        else
            path = ("M" + coord[0] + " " + coord[1])
    
    return @path(path).attr({'stroke': color, 'stroke-width': width})


Raphael.fn.sai.prim.area = (coords, color='black', width=1, baseline) ->

    return @set() if coords.length < 2
    
    for coord in coords
        continue unless coord?
        if strokePath?
            strokePath += ("L" + coord[0] + " " + coord[1])
            areaPath += ("L" + coord[0] + " " + coord[1])
        else
            strokePath = ("M" + coord[0] + " " + coord[1])
            areaPath = ("M" + coord[0] + " " + coord[1])
    
    for i in [baseline.length-1..0] by -1
        x = baseline[i][0]
        y = baseline[i][1]
        areaPath += "L#{x},#{y}"
    
    area = @path(areaPath).attr({'fill': color, 'stroke-width': 0, 'stroke-opacity': 0, 'fill-opacity': 0.35})
    stroke = @path(strokePath).attr({'stroke': color, 'stroke-width': width})
    
    return @set().push(area, stroke)
