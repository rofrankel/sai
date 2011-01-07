class Sai.BarPlot extends Sai.Plot
    
    # if stacked, plot is rendered stacked...else, grouped
    # colors maps from series name to color string
    render: (stacked, baseline, colors, interactive, fSetInfo, __LABELS__) ->
        
        @set.remove()
        
        baseline = @denormalize([0, baseline])[1]
        
        len = 0
        colorArray = []
        barfunc = if stacked then @r.sai.prim.stackedBar else @r.sai.prim.groupedBar
        
        for series of @dndata
            len = Math.max(len, @dndata[series].length)
            colorArray.push(colors?[series] or 'black')
        
        for i in [0...len]
            bardata = []
            for series of @dndata
                bardata.push(@dndata[series][i])
            
            info = {}
            for p of @rawdata
                info[p] = @rawdata[p][i]
            
            if stacked
                magnitude = 0
                net = 0
                for series of @rawdata when series isnt __LABELS__
                    unless isNaN(@rawdata[series][i])
                        magnitude += Math.abs(@rawdata[series][i])
                        net += @rawdata[series][i]
                info['(magnitude)'] = magnitude
                # info['(net)'] = net
            
            @set.push(
                barfunc(
                    bardata,
                    colorArray,
                    @w / len,
                    baseline,
                    interactive,
                    fSetInfo,
                    Sai.util.infoSetters(fSetInfo, info)
                )
            )
        
        return this