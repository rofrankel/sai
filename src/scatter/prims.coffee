Raphael.fn.sai.prim.radiusLegendCont = (x, y, w, h, label, low=0, high=1, bgcolor='white') ->
    set = @set()
    
    set.push(
        bg = @rect(x, y-h, w, h).attr({
            'stroke-width': 0
            'stroke-opacity': 0
            'fill': bgcolor
        })
    )
    
    circletop = y - (h - 10) # leave room for text at top
    y -= 5 # text height / 2
    
    set.push(lowLabel = @text(x, y, Sai.util.num_abbrev(low)).attr({'text-anchor': 'start'}))
    set.push(highLabel = @text(x + w, y, Sai.util.num_abbrev(high)).attr({'text-anchor': 'end'}))
    
    y -= 7 # rest of text, plus padding
    
    set.push(hrule = @rect(x, y, w, 1).attr({
        'fill': "#000"
        'stroke-width': 0
        'stroke-opacity': 0
    }))
    y -= 1
    
    padding = 3
    bigradius = Math.min(y - circletop, w / 2) / 2 - padding * 2
    smallradius = bigradius / 2
    set.push(smallcircle = @circle(x + smallradius + padding, y - smallradius - padding, smallradius))
    set.push(bigcircle = @circle(x + w - (bigradius + padding), y - bigradius - padding, bigradius))
    
    set.push(lbl = @text(x + w/2, circletop - 5, Sai.util.num_abbrev(label)))
    
    return set