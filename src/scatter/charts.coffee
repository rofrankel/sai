class Sai.ScatterChart extends Sai.Chart

    dataGroups: (data) ->
        groups = {
            '__META__': seriesName for seriesName of data when seriesName.match("^__") or seriesName is @__LABELS__
        }
        
        for seriesName of data
            unless seriesName.match("^__") or seriesName is @__LABELS__
                groups[seriesName] = [seriesName]
        
        return groups
    
    get_colors: (series) ->
        # make a crappy guess about whether it's a symbolic data series or not
        return unless series?
        if typeof @data[series]?[0] is 'number'
            return Sai.util.n_colors(2)
        else
            keys = {}
            for val in @data[series]
                if val not of keys then keys[val] = 1
            return @random_colors(keys)
    
    set_defaults: () ->
        @opts.colors ?=  @get_colors(@opts.mappings.color) ? ['black', 'white']
        @opts.stroke_opacity ?= [0, 1]
        @opts.stroke_colors ?= @get_colors(@opts.mappings.stroke_color) ? ['black', 'black']
        @opts.radii ?= [4, 12]
    
    renderPlots: () ->
        
        @setPlotCoords() unless @px?
        @drawBG()
        
        ndata = {}
        for series of @ndata
            ndata[series] = @ndata[series][series]
        
        @set_defaults()
        
        @plots.push(
            (new Sai.ScatterPlot(
                @r,
                @px,
                @py,
                @pw,
                @ph,
                ndata,
                @data)
            ).render(
                @opts.mappings,
                @opts.colors,
                @opts.radii,
                @opts.stroke_opacity,
                @opts.stroke_colors,
                @opts.interactive and not @opts.simple,
                @drawInfo
            )
        )
        
        return this
    
    renderFull: () ->
        @drawTitle()
        @setupInfoSpace()
        @drawFootnote()
        
        @set_defaults()
        
        histogramSeries = []
        histogramColors = {}
        histogramLabels = []
        legend_colors = {}
        
        {colors, radii, stroke_opacity, stroke_colors} = @opts
        
        if colors instanceof Array
            histogramSeries.push(@opts.mappings.color)
            histogramColors[@opts.mappings.color] = {__LOW__: colors[0], __HIGH__: colors[1]}
            histogramLabels.push(null)
        else
            draw_legend = true
            for c of colors
                legend_colors[c] = colors[c]
        
        if @opts.mappings.stroke_color
            if stroke_colors instanceof Array
                histogramSeries.push(@opts.mappings.stroke_color)
                histogramColors[@opts.mappings.stroke_color] = {__LOW__: stroke_colors[0], __HIGH__: stroke_colors[1]}
                histogramLabels.push("#{@opts.mappings.stroke_color} (stroke)")
            else
                draw_legend = true
                for c of stroke_colors
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
        
        if radii instanceof Array and @opts.mappings.radius?
            yvals = @ndata[@opts.mappings.radius]['__YVALS__']
            radiusLegendWidth = 100
            radiusLegendHeight = 55
            @radiusLegend = @r.sai.prim.radiusLegendCont(@x + (@w - radiusLegendWidth) / 2, @y - @padding.bottom, radiusLegendWidth, radiusLegendHeight, @opts.mappings.radius, yvals[0], yvals[yvals.length - 1], @opts.bgcolor);
            @padding.bottom += radiusLegendHeight + 5
        else if radii instanceof Object and @opts.mappings.radius?
            0
        
        if histogramSeries.length
            @drawHistogramLegend(histogramSeries, histogramColors, histogramLabels)
        
        if draw_legend
            @drawLegend(legend_colors)
        
        @__LABELS__ = '__XVALS__'
        @data.__XVALS__ = @ndata[@opts.mappings.x]['__YVALS__']
        @addAxes([@opts.mappings.y], {left: @opts.mappings.y, bottom: @opts.mappings.x})
        
        @renderPlots()
        
        everything = @r.set().push(
            @plotSets(),
            @bg,
            @info,
            @footnote,
            @histogramLegend,
            @radiusLegend,
            @legend
        )
        
        if @opts.href then everything.attr({
            href: @opts.href
            target: '_blank'
        })
        
        return this

    setPlotCoords: () ->
        super
        rlbb = @radiusLegend?.getBBox()
        @radiusLegend?.translate(@px + @pw/2 - (rlbb.x + rlbb.width/2), 0)
