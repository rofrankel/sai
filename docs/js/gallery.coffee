data = {
    'Alice': [1, 2, 0, 0, 4, 7, 5, 1, -4, -2, -.1, null],
    'Bob': [4, 5, 12, 1, -3, "hello", -6, 6, 4, null, null, null],
    'Carol': [7, 4, 1, 11, 2, 2, 3, 0, 0, 0, 2, 3],
    'Dave': [null, null, null, 1, " 5 ", 6, 3, 8, 3, 4, 7, 1],
    'Month': ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
}

charts = [
    {
        type: Sai.LineChart
        data: data
        key: 'Month'
    }
    {
        type: Sai.LineChart
        data: data
        key: 'Month'
    }
    {
        type: Sai.LineChart
        data: data
        key: 'Month'
    }
    {
        type: Sai.LineChart
        data: data
        key: 'Month'
    }
    {
        type: Sai.LineChart
        data: data
        key: 'Month'
    }
    {
        type: Sai.LineChart
        data: data
        key: 'Month'
    }
    {
        type: Sai.LineChart
        data: data
        key: 'Month'
    }
    {
        type: Sai.LineChart
        data: data
        key: 'Month'
    }
    {
        type: Sai.LineChart
        data: data
        key: 'Month'
    }
]

Sai.gallery = {
    draw: (i, r, x, y, w, h, overrides={}) ->
        chart = Sai.gallery.charts[i]
        options = {}
        for key of chart.options
            options[key] = chart.options[key]
        for key of overrides
            options[key] = overrides[key]
        r.clear() if r is Sai.gallery.showcase
        return new (chart.type)(r, x, y, w ? chart.w ? 400, h ? chart.h ? 400, chart.data, chart.key, options).render()
    
    charts: charts
    
    showcase: Raphael('showcase', 400, 400)
    gallery: Raphael('gallery', 700, 183.3 * Math.ceil(charts.length / 3))
}

for i in [0...Sai.gallery.charts.length]
    chart = Sai.gallery.draw(i, Sai.gallery.gallery, 183.3 * (i % 4), 150 + 183.3 * (Math.floor(i / 4)), 150, 150, {simple: true})
    chart.everything.click(do (i) -> -> Sai.gallery.draw(i, Sai.gallery.showcase, 0, 400, 400, 400))
