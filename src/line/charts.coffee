class Sai.LineChart extends Sai.Chart
    
    nonNegativeGroups: () ->
        if @opts.stacked then ['all', 'left', 'right'] else []
    
    dataGroups: (data) ->
        groups = super
        
        if @opts.groups?.left? and @opts.groups?.right?
            groups.left = (x for x in @opts.groups.left when @caresAbout(x) and x of @data)
            groups.right = (x for x in @opts.groups.right when @caresAbout(x) and x of @data)
        
        return groups
    
    renderPlots: () ->
        @setPlotCoords() unless @px?
        
        @drawBG()
        @drawLogo()
        saxis = 'right' of @ndata
        ndata = if @opts.stacked? then @stackedNdata else @ndata
        plotType = if @opts.area then Sai.AreaPlot else Sai.LinePlot
        
        if saxis
            if @ndata.left?['__YVALS__'][0] < 0
                @drawGuideline(0, 'left')
            if @ndata.right?['__YVALS__'][0] < 0
                @drawGuideline(0, 'right')
        else
            if @ndata.all['__YVALS__'][0] < 0
                @drawGuideline(0, 'all')
        
        if saxis
            if ndata.left?
                @plots.push(
                    (new plotType(
                        @r,
                        @px, @py, @pw, @ph,
                        ndata['left'],
                    ))
                    .render(@colors, @opts.lineWidth ? 2, @opts.stacked, @getBaseline('left'))
                )
            
            if ndata.right?
                @plots.push(
                    (new plotType(
                        @r,
                        @px, @py, @pw, @ph,
                        ndata['right'],
                    ))
                    .render(@colors, @opts.lineWidth ? 2, @opts.stacked, @getBaseline('right'))
                )
        else
            @plots.push(
                (new plotType(
                    @r,
                    @px, @py, @pw, @ph,
                    ndata['all'],
                ))
                .render(@colors, @opts.lineWidth ? 2, @opts.stacked, @getBaseline('all'))
            )
    
    renderFull: () ->
        _title = @drawTitle()
        @setupInfoSpace()
        _footnote = @drawFootnote()
        _legend = @drawLegend()
        saxis = 'right' of @ndata
        _axes = if saxis then @addAxes(['left', 'right']) else @addAxes(['all'])
        
        @renderPlots()
        
        @dots = @r.set()
        
        plot_area = @r.set().push(@bg, @plotSets(), @dots, @logo, @guidelines)
        
        if @opts.interactive
            for series of @ndata['all'] when series isnt '__YVALS__'
                @dots.push(@r.circle(0, 0, 4).attr({'fill': @colors?[series] ? 'black'}).hide())
                
            plot_area.mousemove(
                moveDots = (event) =>
                    
                    idx = @getIndex(event)
                    
                    info = {}
                    if @data[@__LABELS__]?.length > idx >= 0
                        info[@__LABELS__] = @data[@__LABELS__][idx]
                        
                        for series of @ndata['all']
                            if @data[series]? then info[series] = @data[series][idx]
                    
                    @drawInfo(info)
                    
                    i = 0
                    for series of @ndata['all'] when series isnt '__YVALS__'
                        for plot in @plots when series of plot.dndata
                            pos = plot.dndata[series][idx]
                            if pos?
                                @dots[i].attr({cx: pos[0], cy: pos[1]}).show().toFront()
                            else
                                @dots[i].hide()
                            i++
                    
            ).mouseout(
                (event) =>
                    @drawInfo({}, true)
                    @dots.hide()
            )
        
        if @opts.href then plot_area.attr({
            href: @opts.href
            target: '_blank'
        })
        
        return this
