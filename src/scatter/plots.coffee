class Sai.ScatterPlot extends Sai.Plot

    render: (mappings, colors, radii, stroke_opacities, stroke_colors, interactive, fSetInfo) ->
        @set.remove()
        
        for series of @dndata
            num_points = @dndata[series].length
            break
        
        lerp = (a, b, alpha) -> (b * alpha) + (a * (1 - alpha))
        y2x = (y) => @x + (@w * ((y - @y) / -@h))
        
        for i in [0...num_points]
            x = y2x(@dndata[mappings.x]?[i][1])
            y = @dndata[mappings.y]?[i][1]
            
            if colors instanceof Array and mappings.color?
                color = Sai.util.colerp(colors[0], colors[1], (@data[mappings.color]?[i]?[1] ? 0))
            else if colors instanceof Object and mappings.color?
                color = colors[@rawdata[mappings.color][i]]
            else
                color = 'black'
            
            if stroke_colors instanceof Array and mappings.stroke_color?
                stroke_color = Sai.util.colerp(stroke_colors[0], stroke_colors[1], (@data[mappings.stroke_color]?[i]?[1] ? 0))
            else if colors instanceof Object and mappings.color?
                stroke_color = stroke_colors[@rawdata[mappings.stroke_color][i]]
            else
                stroke_color = 'black'
            
            if radii instanceof Array and mappings.radius?
                radius = lerp(radii[0], radii[1], (@data[mappings.radius]?[i]?[1] ? 0))
            else if radii instanceof Object and mappings.radius?
                radius = radii[@rawdata[mappings.radius][i]]
            else
                radius = 5.0
            
            if stroke_opacities instanceof Array and mappings.stroke_opacity?
                stroke_opacity = lerp(stroke_opacities[0], stroke_opacities[1], (@data[mappings.stroke_opacity]?[i]?[1] ? 0))
            else if stroke_opacities instanceof Object and mappings.stroke_opacity?
                stroke_opacity = stroke_opacities[@rawdata[mappings.stroke_opacity][i]]
            else
                stroke_opacity = 1.0
            
            if interactive
                info = {}
                for series of @rawdata when not series.match('^__')
                    info[series] = @rawdata[series][i]
                infoSetters = Sai.util.infoSetters(fSetInfo, info)
            
            @set.push(
                circle = @r.circle(x, y, radius)
                .attr({
                    'fill': color
                    'stroke-opacity': stroke_opacity
                    'stroke': stroke_color
                    'fill-opacity': 0.8
                    'stroke-width': 2
                })
                
                if interactive
                    circle.hover(
                        do (infoSetters) ->
                            ->
                                infoSetters[0]()
                                this.attr('fill-opacity', 0.5)
                        ,
                        do (infoSetters) ->
                            ->
                                infoSetters[1]()
                                this.attr('fill-opacity', 0.8)
                    )
            )
        
        return this
