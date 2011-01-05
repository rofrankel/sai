class Sai.ScatterChart extends Sai.Chart

    dataGroups: (data) ->
        groups = {
            '__META__': seriesName for seriesName of data when seriesName.match("^__") or seriesName is @__LABELS__
        }
        
        for seriesName of data
            unless seriesName.match("^__") or seriesName is @__LABELS__
                groups[seriesName] = [seriesName]
        
        return groups
    
    renderPlots: () ->
        
        @setPlotCoords() unless @px?
        
        colors = @opts.colors ? @colors ? ['black', 'white']
        stroke_opacity = @opts.stroke_opacity ? [0, 1]
        stroke_colors = @opts.stroke_colors ? ['black', 'black']
        radii = @opts.radius ? [4, 12]
        
        @drawLogo()
        @drawBG()
        
        ndata = {}
        for series of @ndata
            ndata[series] = @ndata[series][series]
        
        @plots = @r.set()
        
        @plots.push(
            (new Sai.ScatterPlot(
                @r,
                @px,
                @py,
                @pw,
                @ph,
                ndata,
                @data)
            )
            .render(@opts.mappings, colors, radii, stroke_opacity, stroke_colors, @opts.interactive and not @opts.simple, @drawInfo)
            .set
        )
        
        return this
    
    renderFull: () ->
        @drawTitle()
        @setupInfoSpace()
        @drawFootnote()
        
        colors = @opts.colors ? @colors ? ['black', 'white']
        stroke_opacity = @opts.stroke_opacity ? [0, 1]
        stroke_colors = @opts.stroke_colors ? ['black', 'black']
        radii = @opts.radius ? [4, 12]
        
        histogramSeries = []
        histogramColors = {}
        
        if colors instanceof Array
            histogramSeries.push(@opts.mappings.color)
            histogramColors[@opts.mappings.color] = {__LOW__: colors[0], __HIGH__: colors[1]}
        else
            legend_colors ?= {}
            draw_legend = true
            for c of colors
                legend_colors[c] = colors[c]
        
        if stroke_colors instanceof Array
            0
            # histogramSeries.push(@opts.mappings.stroke_color)
            # histogramColors[@opts.mappings.stroke_color] = {__LOW__: stroke_colors[0], __HIGH__: stroke_colors[1]}
        else
            legend_colors ?= {}
            draw_legend = true
            for c of colors
                legend_colors[c] = stroke_colors[c]
        
        ###
        if @opts.mappings.stroke_opacity
            histogramSeries.push(@opts.mappings.stroke_opacity)
            so_colors = [
                Sai.util.colerp(stroke_colors[0], stroke_colors[1], stroke_opacity[0]),
                Sai.util.colerp(stroke_colors[0], stroke_colors[1], stroke_opacity[1]),
            ]
            histogramColors[@opts.mappings.stroke_opacity] = {__LOW__: so_colors[0], __HIGH__: so_colors[1]}
        ###
        
        if histogramSeries.length
            @drawHistogramLegend(histogramSeries, histogramColors)
        
        if draw_legend
            @drawLegend(colors)
        
        @__LABELS__ = '__XVALS__'
        @data.__XVALS__ = @ndata[@opts.mappings.x]['__YVALS__']
        @addAxes([@opts.mappings.y], {left: @opts.mappings.y, bottom: @opts.mappings.x})
        
        @renderPlots()
        
        everything = @r.set().push(
            @plots,
            @bg,
            @logo,
            @info,
            @footnote,
            @histogramLegend,
            @legend
        )
        
        if @opts.href then everything.attr({
            href: @opts.href
            target: '_blank'
        })
        
        return this
