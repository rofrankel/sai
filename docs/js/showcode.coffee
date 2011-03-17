$(document).ready( ->
    $("script.show").each((i, e) ->
        js = $(e).html()
        indent = 0
        lines = js.split('\n')
        for line in lines
            if line # ignore initial blank line(s)
                matches = line.match(/^ +/)
                if matches
                    indent = matches[0].length
                break
        
        unindented_js = ''
        for line in lines
            unindented_js += line[indent..] + "\n"
        
        $('<pre></pre>').addClass('code').insertAfter(e).html(unindented_js)
    )
    
    $("pre.code").snippet("javascript",{style:"acid"})
)
