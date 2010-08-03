(function(){
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    var ctor = function(){ };
    ctor.prototype = parent.prototype;
    child.__superClass__ = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
  };
  Sai.Chart = function(r, x, y, w, h, data, opts) {
    var _a;
    _a = this;
    this.drawInfo = function(){ return Sai.Chart.prototype.drawInfo.apply(_a, arguments); };
    this.r = r;
    this.x = x || 0;
    this.y = y || 0;
    this.w = w || 640;
    this.h = h || 480;
    this.r.rect(this.x, this.y - this.h, this.w, this.h).attr('stroke', 'red');
    this.stacked = opts.stacked;
    this.opts = opts;
    this.setData(data);
    this.title_text = opts.title;
    this.interactive = opts.interactive;
    this.bgcolor = opts.bgcolor || 'white';
    this.padding = {
      left: 2,
      right: 2,
      top: 2,
      bottom: 2
    };
    return this;
  };
  Sai.Chart.prototype.groupsToNullPad = function() {
    return [];
  };
  Sai.Chart.prototype.nonNegativeGroups = function() {
    return [];
  };
  Sai.Chart.prototype.setData = function(data) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, group, groups, i, nngroups, series;
    this.data = {};
    _a = data;
    for (series in _a) { if (__hasProp.call(_a, series)) {
      data[series] instanceof Array ? (this.data[series] = data[series].slice(0)) : (this.data[series] = data[series]);
    }}
    groups = this.dataGroups(data);
    nngroups = this.nonNegativeGroups();
    _b = groups;
    for (group in _b) { if (__hasProp.call(_b, group)) {
      if (!!(function(){ for (var _h=0, _i=nngroups.length; _h<_i; _h++) if (nngroups[_h] === group) return true; })()) {
        _d = groups[group];
        for (_c = 0, _e = _d.length; _c < _e; _c++) {
          series = _d[_c];
          if ((typeof (_g = this.data[series]) !== "undefined" && _g !== null)) {
            (_f = this.data[series].length);

            for (i = 0; i < _f; i += 1) {
              this.data[series][i] < 0 ? this.data[series][i] *= -1 : null;
            }
          }
        }
      }
    }}
    _k = this.groupsToNullPad();
    for (_j = 0, _l = _k.length; _j < _l; _j++) {
      group = _k[_j];
      _n = groups[group];
      for (_m = 0, _o = _n.length; _m < _o; _m++) {
        series = _n[_m];
        this.nullPad(series);
      }
    }
    return this.normalize(this.data);
  };
  Sai.Chart.prototype.nullPad = function(seriesName) {
    if (seriesName in this.data) {
      this.data[seriesName] = [null].concat(this.data[seriesName].concat([null]));
      return this.data[seriesName];
    }
  };
  Sai.Chart.prototype.caresAbout = function(seriesName) {
    return !seriesName.match("^__");
  };
  Sai.Chart.prototype.dataGroups = function(data) {
    var _a, _b, _c, _d, seriesName;
    return {
      'all': (function() {
        _a = []; _b = data;
        for (seriesName in _b) { if (__hasProp.call(_b, seriesName)) {
          this.caresAbout(seriesName) ? _a.push(seriesName) : null;
        }}
        return _a;
      }).call(this),
      '__META__': (function() {
        _c = []; _d = data;
        for (seriesName in _d) { if (__hasProp.call(_d, seriesName)) {
          seriesName.match("^__") ? _c.push(seriesName) : null;
        }}
        return _c;
      })()
    };
  };
  Sai.Chart.prototype.getYAxisVals = function(min, max, nopad) {
    var _a, bottom, i, mag, rawmag, step, top;
    nopad = (typeof nopad !== "undefined" && nopad !== null) ? nopad : false;
    mag = Math.floor((rawmag = (Math.log(max - min) / Math.LN10) - 0.4));
    step = Math.pow(10, mag);
    if (rawmag % 1 > 0.7 && !nopad) {
      step *= 4;
    } else if (rawmag % 1 > 0.35 && !nopad) {
      step *= 2;
    }
    bottom = Sai.util.round(min - (nopad ? (step / 2.1) : (step / 1.9)), step);
    if ((bottom < 0) && (0 <= min)) {
      bottom = 0;
    }
    top = Sai.util.round(max + (nopad ? (step / 2.1) : (step / 1.9)), step);
    _a = [];
    for (i = bottom; i <= top; i += step) {
      _a.push(Sai.util.round(i, step));
    }
    return _a;
  };
  Sai.Chart.prototype.getMax = function(data, group) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, d, series;
    return Math.max.apply(Math, (function() {
      _a = []; _c = group;
      for (_b = 0, _d = _c.length; _b < _d; _b++) {
        series = _c[_b];
        (typeof (_e = data[series]) !== "undefined" && _e !== null) ? _a.push(Math.max.apply(Math, (function() {
          _f = []; _h = data[series];
          for (_g = 0, _i = _h.length; _g < _i; _g++) {
            d = _h[_g];
            (typeof d !== "undefined" && d !== null) ? _f.push(d) : null;
          }
          return _f;
        })())) : null;
      }
      return _a;
    })());
  };
  Sai.Chart.prototype.getMin = function(data, group) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, d, series;
    return Math.min.apply(Math, (function() {
      _a = []; _c = group;
      for (_b = 0, _d = _c.length; _b < _d; _b++) {
        series = _c[_b];
        (typeof (_e = data[series]) !== "undefined" && _e !== null) ? _a.push(Math.min.apply(Math, (function() {
          _f = []; _h = data[series];
          for (_g = 0, _i = _h.length; _g < _i; _g++) {
            d = _h[_g];
            (typeof d !== "undefined" && d !== null) ? _f.push(d) : null;
          }
          return _f;
        })())) : null;
      }
      return _a;
    })());
  };
  Sai.Chart.prototype.getStackedMax = function(data, group) {
    var _a, _b, _c, _d, _e, _f, i, series;
    return Math.max.apply(Math, (function() {
      _a = []; (_b = this.data['__LABELS__'].length);

      for (i = 0; i < _b; i += 1) {
        _a.push(Sai.util.sumArray((function() {
          _c = []; _e = group;
          for (_d = 0, _f = _e.length; _d < _f; _d++) {
            series = _e[_d];
            _c.push(data[series][i]);
          }
          return _c;
        })()));
      }
      return _a;
    }).call(this));
  };
  Sai.Chart.prototype.getStackedMin = function(data, group) {
    return 0;
  };
  Sai.Chart.prototype.normalize = function(data) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, baseline, baselines, group, groups, i, max, maxf, min, minf, series, stackedPoint, yvals;
    groups = this.dataGroups(data);
    this.ndata = {};
    (typeof (_a = this.stacked) !== "undefined" && _a !== null) ? (this.stackedNdata = {}) : null;
    _b = []; _c = groups;
    for (group in _c) { if (__hasProp.call(_c, group)) {
      if (group.match('^__')) {
        continue;
      }
      this.ndata[group] = {};
      if ((typeof (_d = this.stacked) !== "undefined" && _d !== null)) {
        this.stackedNdata[group] = {};
        baselines = {};
      }
      maxf = (typeof (_e = this.stacked) !== "undefined" && _e !== null) ? this.getStackedMax : this.getMax;
      minf = (typeof (_f = this.stacked) !== "undefined" && _f !== null) ? this.getStackedMin : this.getMin;
      max = maxf(data, groups[group]);
      min = minf(data, groups[group]);
      yvals = this.getYAxisVals(min, max);
      min = yvals[0];
      max = yvals[yvals.length - 1];
      _h = groups[group];
      for (_g = 0, _i = _h.length; _g < _i; _g++) {
        series = _h[_g];
        if (!((typeof (_j = data[series]) !== "undefined" && _j !== null))) {
          continue;
        }
        this.ndata[group][series] = (function() {
          _k = []; (_l = data[series].length);

          for (i = 0; i < _l; i += 1) {
            _k.push(((typeof (_m = data[series][i]) !== "undefined" && _m !== null) ? [i / (data[series].length - 1), ((data[series][i] - min) / (max - min))] : null));
          }
          return _k;
        })();
        if ((typeof (_p = this.stacked) !== "undefined" && _p !== null)) {
          this.stackedNdata[group][series] = [];
          (_n = data[series].length);

          for (i = 0; i < _n; i += 1) {
            baseline = baselines[i] || 0;
            stackedPoint = [i / (data[series].length - 1), (typeof (_o = data[series][i]) !== "undefined" && _o !== null) ? ((data[series][i] - min) / (max - min)) + baseline : baseline];
            this.stackedNdata[group][series].push(stackedPoint);
            if (!(stackedPoint === null)) {
              baselines[i] = stackedPoint[1];
            }
          }
        }
        this.ndata[group].__YVALS__ = yvals;
      }
    }}
    return _b;
  };
  Sai.Chart.prototype.addAxes = function(group) {
    var LINE_HEIGHT, _a, haxis_height, hlen, vlen;
    LINE_HEIGHT = 10;
    this.axisWidth = 1.5;
    haxis_height = LINE_HEIGHT + 2 + 10;
    this.padding.top += 5;
    (typeof (_a = this.data['__LABELS__'][this.data['__LABELS__'].length - 1]) !== "undefined" && _a !== null) ? this.padding.right += (Sai.util.prettystr(this.data['__LABELS__'][this.data['__LABELS__'].length - 1]).length / 2) * 5 : null;
    vlen = this.h - (this.padding.bottom + haxis_height + this.padding.top);
    this.vaxis = this.r.sai.prim.vaxis(this.ndata[group].__YVALS__, this.x + this.padding.left, this.y - (this.padding.bottom + haxis_height), vlen, this.axisWidth);
    this.vaxis.translate(this.vaxis.getBBox().width, 0);
    this.padding.left += this.vaxis.getBBox().width;
    hlen = this.w - this.padding.left - this.padding.right;
    this.haxis = this.r.sai.prim.haxis(this.data['__LABELS__'], this.x + this.padding.left, this.y - this.padding.bottom, hlen, this.axisWidth);
    this.haxis.translate(0, -haxis_height);
    this.padding.bottom += haxis_height;
    this.setPlotCoords();
    return this.r.set().push(this.haxis).push(this.vaxis);
  };
  Sai.Chart.prototype.setPlotCoords = function() {
    this.px = this.x + this.padding.left;
    this.py = this.y - this.padding.bottom;
    this.pw = this.w - this.padding.left - this.padding.right;
    this.ph = this.h - this.padding.bottom - this.padding.top;
    return this.ph;
  };
  Sai.Chart.prototype.drawBG = function() {
    var _a, _b, _c, _d;
    this.bg = this.r.rect((typeof (_a = this.px) !== "undefined" && _a !== null) && this.px || this.x, (typeof (_b = this.py) !== "undefined" && _b !== null) && (this.py - this.ph) || (this.y - this.h), (typeof (_c = this.pw) !== "undefined" && _c !== null) && this.pw || this.w, (typeof (_d = this.ph) !== "undefined" && _d !== null) && this.ph || this.h).attr({
      fill: this.bgcolor,
      'stroke-width': 0,
      'stroke-opacity': 0
    }).toBack();
    return this.bg;
  };
  Sai.Chart.prototype.logoPos = function() {
    var h, w;
    w = 160;
    h = 34;
    return [this.px + this.pw - w - 5, this.py - this.ph + 5, w, h];
  };
  Sai.Chart.prototype.drawLogo = function() {
    var _a, h, w, x, y;
    _a = this.logoPos();
    x = _a[0];
    y = _a[1];
    w = _a[2];
    h = _a[3];
    this.logo = this.r.image(Sai.imagePath + 'logo.png', x, y, w, h).attr({
      opacity: 0.25
    });
    return this.logo;
  };
  Sai.Chart.prototype.render = function() {
    var _a;
    this.plot = (typeof (_a = this.plot) !== "undefined" && _a !== null) ? this.plot : new Sai.Plot(this.r);
    this.plot.render();
    return this;
  };
  Sai.Chart.prototype.setColors = function(colors) {
    var _a, _b, series;
    this.colors = (typeof (_a = this.colors) !== "undefined" && _a !== null) ? this.colors : {};
    _b = colors;
    for (series in _b) { if (__hasProp.call(_b, series)) {
      series in this.data ? (this.colors[series] = colors[series]) : null;
    }}
    return this;
  };
  Sai.Chart.prototype.setColor = function(series, color) {
    var _a;
    this.colors = (typeof (_a = this.colors) !== "undefined" && _a !== null) ? this.colors : {};
    this.colors[series] = color;
    return this;
  };
  Sai.Chart.prototype.drawGuideline = function(h, group) {
    var _a, guideline, nh, ymax, ymin;
    group = (typeof group !== "undefined" && group !== null) ? group : 'all';
    ymin = this.ndata[group].__YVALS__[0];
    ymax = this.ndata[group].__YVALS__[this.ndata[group].__YVALS__.length - 1];
    if (!(h > ymin)) {
      return null;
    }
    nh = (h - ymin) / (ymax - ymin);
    this.guidelines = (typeof (_a = this.guidelines) !== "undefined" && _a !== null) ? this.guidelines : this.r.set();
    guideline = new Sai.LinePlot(this.r, this.px, this.py, this.pw, this.ph, {
      'guideline': [[0, nh], [1, nh]]
    });
    guideline.render({
      'guideline': '#ccc'
    });
    return this.guidelines.push(guideline.set);
  };
  Sai.Chart.prototype.drawLegend = function(colors) {
    colors = (typeof colors !== "undefined" && colors !== null) ? colors : this.colors;
    if (colors) {
      this.legend = this.r.sai.prim.legend(this.x, this.y - this.padding.bottom, this.w, colors);
      this.padding.bottom += this.legend.getBBox().height + 15;
      return this.legend.translate((this.w - this.legend.getBBox().width) / 2, 0);
    }
  };
  Sai.Chart.prototype.drawTitle = function() {
    var _a;
    if ((typeof (_a = this.title_text) !== "undefined" && _a !== null)) {
      this.title = this.r.text(this.x + (this.w / 2), this.y - this.h, this.title_text).attr({
        'font-size': 20
      });
      this.title.translate(0, this.title.getBBox().height / 2);
      return this.padding.top += this.title.getBBox().height + 5;
    }
  };
  Sai.Chart.prototype.setupInfoSpace = function() {
    this.info_y = this.y - this.h + this.padding.top;
    this.info_x = this.x + this.padding.left;
    this.info_w = this.w - this.padding.left - this.padding.right;
    return this.padding.top += 30;
  };
  Sai.Chart.prototype.drawInfo = function(info, clear) {
    var _a, _b, label;
    clear = (typeof clear !== "undefined" && clear !== null) ? clear : true;
    info = (typeof info !== "undefined" && info !== null) ? info : (typeof (_a = this.default_info) !== "undefined" && _a !== null) ? this.default_info() : {};
    clear ? (this.info_data = {}) : null;
    this.info ? this.info.remove() : null;
    _b = info;
    for (label in _b) { if (__hasProp.call(_b, label)) {
      !(label.match("^__")) ? (this.info_data[label] = info[label] || '(no data)') : null;
    }}
    this.info = this.r.sai.prim.info(this.info_x, this.info_y, this.info_w, this.info_data);
    return this.info;
  };
  Sai.Chart.prototype.getIndex = function(mx, my) {
    var tx;
    tx = Sai.util.transformCoords({
      x: mx,
      y: my
    }, this.r.canvas).x;
    return Math.round((this.data.__LABELS__.length - 1) * (tx - this.px) / this.pw);
  };

  Sai.LineChart = function() {
    return Sai.Chart.apply(this, arguments);
  };
  __extends(Sai.LineChart, Sai.Chart);
  Sai.LineChart.prototype.nonNegativeGroups = function() {
    if (this.stacked) {
      return ['all'];
    } else {
      return [];
    }
  };
  Sai.LineChart.prototype.render = function() {
    var _a, _b, color, ndata, plotType, series;
    this.drawTitle();
    this.setupInfoSpace();
    this.drawLegend();
    this.addAxes('all');
    this.drawBG();
    this.drawLogo();
    this.drawGuideline(0);
    this.lines = [];
    this.dots = this.r.set();
    ndata = (typeof (_a = this.stacked) !== "undefined" && _a !== null) ? this.stackedNdata : this.ndata;
    plotType = this.opts.area ? Sai.AreaPlot : Sai.LinePlot;
    this.plot = (new plotType(this.r, this.px, this.py, this.pw, this.ph, ndata['all'])).render(this.colors, 2, this.stacked);
    _b = ndata['all'];
    for (series in _b) { if (__hasProp.call(_b, series)) {
      if (series === '__YVALS__') {
        continue;
      }
      color = this.colors && this.colors[series] || 'black';
      this.dots.push(this.r.circle(0, 0, 4).attr({
        'fill': color
      }).hide());
    }}
    this.r.set().push(this.bg, this.plot.set, this.dots, this.logo, this.guidelines).mousemove((function(__this) {
      var __func = function(event) {
        var _c, _d, _e, _f, i, idx, info, pos;
        idx = this.getIndex(event.clientX, event.clientY);
        info = {};
        _c = ndata['all'];
        for (series in _c) { if (__hasProp.call(_c, series)) {
          (typeof (_d = this.data[series]) !== "undefined" && _d !== null) ? (info[series] = this.data[series][idx]) : null;
        }}
        this.drawInfo(info);
        i = 0;
        _e = []; _f = this.plot.dndata;
        for (series in _f) { if (__hasProp.call(_f, series)) {
          !series.match('^__') ? _e.push((function() {
            pos = this.plot.dndata[series][idx];
            (typeof pos !== "undefined" && pos !== null) ? this.dots[i].attr({
              cx: pos[0],
              cy: pos[1]
            }).show().toFront() : this.dots[i].hide();
            return i++;
          }).call(this)) : null;
        }}
        return _e;
      };
      return (function() {
        return __func.apply(__this, arguments);
      });
    })(this)).mouseout((function(__this) {
      var __func = function(event) {
        this.drawInfo({});
        return this.dots.hide();
      };
      return (function() {
        return __func.apply(__this, arguments);
      });
    })(this));
    this.logo == undefined ? undefined : this.logo.toFront();
    return this;
  };

  Sai.Sparkline = function() {
    return Sai.Chart.apply(this, arguments);
  };
  __extends(Sai.Sparkline, Sai.Chart);
  Sai.Sparkline.prototype.dataGroups = function(data) {
    return {
      'data': ['data']
    };
  };
  Sai.Sparkline.prototype.render = function() {
    this.drawBG();
    this.plots = this.r.set();
    this.plots.push((new Sai.LinePlot(this.r, this.x, this.y, this.w, this.h, this.ndata['data'])).render({
      data: this.colors && this.colors[series] || 'black'
    }, 1).set);
    return this;
  };

  Sai.BarChart = function() {
    return Sai.Chart.apply(this, arguments);
  };
  __extends(Sai.BarChart, Sai.Chart);
  Sai.BarChart.prototype.groupsToNullPad = function() {
    var _a, _b, group;
    _a = []; _b = this.dataGroups();
    for (group in _b) { if (__hasProp.call(_b, group)) {
      _a.push(group);
    }}
    return _a;
  };
  Sai.BarChart.prototype.nonNegativeGroups = function() {
    var _a, _b, group;
    _a = []; _b = this.dataGroups();
    for (group in _b) { if (__hasProp.call(_b, group)) {
      _a.push(group);
    }}
    return _a;
  };
  Sai.BarChart.prototype.render = function() {
    var _a, _b, _c, _d, _e, _f, data, ndata, rawdata, series, yval;
    this.drawTitle();
    this.setupInfoSpace();
    this.drawLegend();
    this.addAxes('all');
    this.drawLogo();
    this.drawBG();
    this.guidelines = this.r.set();
    _b = this.ndata['all']['__YVALS__'];
    for (_a = 0, _c = _b.length; _a < _c; _a++) {
      yval = _b[_a];
      this.drawGuideline(yval);
    }
    this.plots = this.r.set();
    data = {};
    rawdata = {};
    ndata = (typeof (_d = this.stacked) !== "undefined" && _d !== null) ? this.stackedNdata : this.ndata;
    _e = ndata['all'];
    for (series in _e) { if (__hasProp.call(_e, series)) {
      if (!(series.match('^__'))) {
        data[series] = ndata['all'][series];
        rawdata[series] = this.data[series];
      }
    }}
    this.plots.push((new Sai.BarPlot(this.r, this.px, this.py, this.pw, this.ph, data, rawdata)).render((typeof (_f = this.stacked) !== "undefined" && _f !== null), this.colors, this.interactive, this.drawInfo).set);
    this.logo == undefined ? undefined : this.logo.toFront();
    return this;
  };

  Sai.StockChart = function() {
    return Sai.Chart.apply(this, arguments);
  };
  __extends(Sai.StockChart, Sai.Chart);
  Sai.StockChart.prototype.groupsToNullPad = function() {
    var _a, _b, group;
    _a = []; _b = this.dataGroups();
    for (group in _b) { if (__hasProp.call(_b, group)) {
      _a.push(group);
    }}
    return _a;
  };
  Sai.StockChart.prototype.dataGroups = function(data) {
    var _a, _b, seriesName;
    return {
      '__META__': ['__LABELS__'],
      'volume': ['volume'],
      'prices': (function() {
        _a = []; _b = data;
        for (seriesName in _b) { if (__hasProp.call(_b, seriesName)) {
          this.caresAbout(seriesName) && !('__LABELS__' === seriesName || 'volume' === seriesName) ? _a.push(seriesName) : null;
        }}
        return _a;
      }).call(this)
    };
  };
  Sai.StockChart.prototype.nonNegativeGroups = function() {
    return ['volume'];
  };
  Sai.StockChart.prototype.render = function() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, avgColors, avgNdata, glow_width, i, p, rawdata, series, shouldDrawLegend, vol;
    this.drawTitle();
    this.setupInfoSpace();
    avgColors = {};
    shouldDrawLegend = false;
    _a = this.ndata['prices'];
    for (series in _a) { if (__hasProp.call(_a, series)) {
      if (!('open' === series || 'close' === series || 'high' === series || 'low' === series) && !series.match('^__')) {
        avgColors[series] = (this.colors == undefined ? undefined : this.colors[series]) || 'black';
        shouldDrawLegend = true;
      }
    }}
    shouldDrawLegend ? this.drawLegend(avgColors) : null;
    this.colors = (typeof (_b = this.colors) !== "undefined" && _b !== null) ? this.colors : {};
    this.colors['up'] = (typeof (_c = this.colors['up']) !== "undefined" && _c !== null) ? this.colors['up'] : 'black';
    this.colors['down'] = (typeof (_d = this.colors['down']) !== "undefined" && _d !== null) ? this.colors['down'] : 'red';
    this.colors['vol_up'] = (typeof (_e = this.colors['vol_up']) !== "undefined" && _e !== null) ? this.colors['vol_up'] : '#666';
    this.colors['vol_down'] = (typeof (_f = this.colors['vol_down']) !== "undefined" && _f !== null) ? this.colors['vol_down'] : '#c66';
    this.addAxes('prices');
    this.drawLogo();
    this.drawBG();
    this.drawGuideline(0, 'prices');
    this.plots = this.r.set();
    vol = {
      'up': [],
      'down': []
    };
    rawdata = {};
    _g = this.ndata['prices'];
    for (p in _g) { if (__hasProp.call(_g, p)) {
      !(p.match('^__')) ? (rawdata[p] = this.data[p]) : null;
    }}
    (typeof (_h = this.data['volume']) !== "undefined" && _h !== null) ? (rawdata['vol'] = this.data['volume']) : null;
    if ('volume' in this.ndata.volume) {
      (_i = this.ndata['volume']['volume'].length);

      for (i = 0; i < _i; i += 1) {
        if (this.ndata['volume']['volume'][i] !== null) {
          if (i && this.ndata['prices']['close'][i - 1] && (this.ndata['prices']['close'][i][1] < this.ndata['prices']['close'][i - 1][1])) {
            vol.down.push(this.ndata['volume']['volume'][i]);
            vol.up.push([this.ndata['volume']['volume'][i][0], 0]);
          } else {
            vol.up.push(this.ndata['volume']['volume'][i]);
            vol.down.push([this.ndata['volume']['volume'][i][0], 0]);
          }
        } else {
          vol.up.push([0, 0]);
          vol.down.push([0, 0]);
        }
      }
      this.plots.push((new Sai.BarPlot(this.r, this.px, this.py, this.pw, this.ph * 0.2, vol, rawdata)).render(true, {
        'up': this.colors['vol_up'],
        'down': this.colors['vol_down']
      }).set);
    }
    this.plots.push((new Sai.CandlestickPlot(this.r, this.px, this.py, this.pw, this.ph, {
      'open': this.ndata['prices']['open'],
      'close': this.ndata['prices']['close'],
      'high': this.ndata['prices']['high'],
      'low': this.ndata['prices']['low']
    }, rawdata)).render(this.colors, Math.min(5, (this.pw / this.ndata['prices']['open'].length) - 2)).set);
    avgNdata = {};
    _j = this.ndata['prices'];
    for (series in _j) { if (__hasProp.call(_j, series)) {
      !(('open' === series || 'close' === series || 'high' === series || 'low' === series) || series.match("^__")) ? (avgNdata[series] = this.ndata['prices'][series]) : null;
    }}
    this.plots.push((new Sai.LinePlot(this.r, this.px, this.py, this.pw, this.ph, avgNdata)).render(this.colors).set);
    glow_width = this.pw / (this.data.__LABELS__.length - 1);
    this.glow = this.r.rect(this.px - (glow_width / 2), this.py - this.ph, glow_width, this.ph).attr({
      fill: ("0-" + this.bgcolor + "-#DDAA99-" + this.bgcolor),
      'stroke-width': 0,
      'stroke-opacity': 0
    }).toBack().hide();
    this.bg.toBack();
    this.r.set().push(this.bg, this.plots, this.logo, this.glow, this.guidelines).mousemove((function(__this) {
      var __func = function(event) {
        var _k, _l, idx, info, notNull;
        idx = this.getIndex(event.clientX, event.clientY);
        info = {};
        notNull = true;
        _k = this.ndata['prices'];
        for (series in _k) { if (__hasProp.call(_k, series)) {
          this.data[series] == undefined ? undefined : this.data[series][idx] ? (info[series] = this.data[series][idx]) : (notNull = false);
        }}
        (typeof (_l = this.data['volume'] == undefined ? undefined : this.data['volume'][idx]) !== "undefined" && _l !== null) ? (info['volume'] = this.data['volume'][idx]) : (notNull = false);
        this.drawInfo(info);
        if (notNull) {
          return this.glow.attr({
            x: this.px + (glow_width * (idx - 0.5))
          }).show();
        }
      };
      return (function() {
        return __func.apply(__this, arguments);
      });
    })(this)).mouseout((function(__this) {
      var __func = function(event) {
        this.drawInfo({});
        return this.glow.hide();
      };
      return (function() {
        return __func.apply(__this, arguments);
      });
    })(this));
    this.logo == undefined ? undefined : this.logo.toFront();
    return this;
  };

  Sai.GeoChart = function() {
    var _a;
    _a = this;
    this.renderPlot = function(){ return Sai.GeoChart.prototype.renderPlot.apply(_a, arguments); };
    return Sai.Chart.apply(this, arguments);
  };
  __extends(Sai.GeoChart, Sai.Chart);
  Sai.GeoChart.prototype.plotType = Sai.GeoPlot;
  Sai.GeoChart.prototype.interactiveHistogram = true;
  Sai.GeoChart.prototype.getMax = function(data, series) {
    return Math.max.apply(Math, data);
  };
  Sai.GeoChart.prototype.getMin = function(data, series) {
    return Math.min.apply(Math, data);
  };
  Sai.GeoChart.prototype.normalize = function(data) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, d, dataWithoutNulls, i, max, maxes, min, mins, overallMax, overallMin, series;
    this.ndata = {};
    this.bounds = {};
    maxes = {};
    mins = {};
    _a = data;
    for (series in _a) { if (__hasProp.call(_a, series)) {
      if (series.match('^__')) {
        continue;
      }
      if (!((typeof (_b = data[series]) !== "undefined" && _b !== null))) {
        continue;
      }
      dataWithoutNulls = (function() {
        _c = []; _e = data[series];
        for (_d = 0, _f = _e.length; _d < _f; _d++) {
          d = _e[_d];
          (typeof d !== "undefined" && d !== null) ? _c.push(d) : null;
        }
        return _c;
      })();
      maxes[series] = this.getMax(dataWithoutNulls, series);
      !(typeof overallMax !== "undefined" && overallMax !== null) || maxes[series] > overallMax ? (overallMax = maxes[series]) : null;
      mins[series] = this.getMin(dataWithoutNulls, series);
      !(typeof overallMin !== "undefined" && overallMin !== null) || mins[series] < overallMin ? (overallMin = mins[series]) : null;
    }}
    _g = []; _h = data;
    for (series in _h) { if (__hasProp.call(_h, series)) {
      if (series.match('^__')) {
        continue;
      }
      if (!((typeof (_i = data[series]) !== "undefined" && _i !== null))) {
        continue;
      }
      if (this.opts.groupedNormalization) {
        max = overallMax;
        min = overallMin;
      } else {
        max = maxes[series];
        min = mins[series];
      }
      this.bounds[series] = [min, max];
      this.ndata[series] = (function() {
        _j = []; (_k = data[series].length);

        for (i = 0; i < _k; i += 1) {
          _j.push(((typeof (_l = data[series][i]) !== "undefined" && _l !== null) ? [i / (data[series].length - 1), ((data[series][i] - min) / (max - min))] : null));
        }
        return _j;
      })();
    }}
    return _g;
  };
  Sai.GeoChart.prototype.dataGroups = function(data) {
    var _a, _b, _c, groups, seriesName;
    groups = {
      '__META__': (function() {
        _a = []; _b = data;
        for (seriesName in _b) { if (__hasProp.call(_b, seriesName)) {
          seriesName.match("^__") ? _a.push(seriesName) : null;
        }}
        return _a;
      })()
    };
    _c = data;
    for (seriesName in _c) { if (__hasProp.call(_c, seriesName)) {
      !(seriesName.match("^__")) ? (groups[seriesName] = [seriesName]) : null;
    }}
    return groups;
  };
  Sai.GeoChart.prototype.drawHistogramLegend = function(seriesNames) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, data, dataWithoutNulls, extrapadding, height, histogram, i, j, max, maxLabel, min, minLabel, px, series, width, x, yvals;
    this.histogramLegend = this.r.set();
    extrapadding = 20;
    height = Math.max(0.1 * (this.h - this.padding.bottom - this.padding.top), 50);
    width = Math.min(150, (this.w - this.padding.left - this.padding.right - extrapadding) / seriesNames.length);
    (_a = seriesNames.length);

    for (i = 0; i < _a; i += 1) {
      series = seriesNames[i];
      px = this.x + (i * width);
      data = (function() {
        _b = []; (_c = this.ndata[series].length);

        for (j = 0; j < _c; j += 1) {
          (typeof (_d = this.ndata[series][j]) !== "undefined" && _d !== null) ? _b.push(this.ndata[series][j][1]) : null;
        }
        return _b;
      }).call(this);
      if ((typeof (_f = this.bounds == undefined ? undefined : this.bounds[series]) !== "undefined" && _f !== null)) {
        _e = this.bounds[series];
        min = _e[0];
        max = _e[1];
      } else {
        dataWithoutNulls = (function() {
          _g = []; _i = this.data[series];
          for (_h = 0, _j = _i.length; _h < _j; _h++) {
            x = _i[_h];
            (typeof x !== "undefined" && x !== null) ? _g.push(x) : null;
          }
          return _g;
        }).call(this);
        _k = [Math.min.apply(Math, dataWithoutNulls), Math.max.apply(Math, dataWithoutNulls)];
        min = _k[0];
        max = _k[1];
      }
      yvals = this.getYAxisVals(min, max, true);
      minLabel = yvals[0];
      maxLabel = yvals[yvals.length - 1];
      this.histogramLegend.push((histogram = this.r.sai.prim.histogram(px, this.y - this.padding.bottom, width * 0.8, height, data, minLabel, maxLabel, series, this.colors[series], 'white')));
      this.interactive ? this.setupHistogramInteraction(histogram, series) : null;
    }
    this.histogramLegend.translate((this.w - this.padding.left - this.padding.right - this.histogramLegend.getBBox().width) / 2, 0);
    return this.padding.bottom += height + 5;
  };
  Sai.GeoChart.prototype.setupHistogramInteraction = function(histogram, series) {
    return histogram.click((function(__this) {
      var __func = function() {
        return this.renderPlot(series);
      };
      return (function() {
        return __func.apply(__this, arguments);
      });
    })(this)).hover(((function(__this) {
      var __func = function(set) {
        return (function(__this) {
          var __func = function() {
            set.attr({
              'fill-opacity': 0.75
            });
            return this.drawInfo({
              'Click to display on map': series
            });
          };
          return (function() {
            return __func.apply(__this, arguments);
          });
        })(this);
      };
      return (function() {
        return __func.apply(__this, arguments);
      });
    })(this))(histogram), ((function(__this) {
      var __func = function(set) {
        return (function(__this) {
          var __func = function() {
            set.attr({
              'fill-opacity': 1.0
            });
            return this.drawInfo();
          };
          return (function() {
            return __func.apply(__this, arguments);
          });
        })(this);
      };
      return (function() {
        return __func.apply(__this, arguments);
      });
    })(this))(histogram));
  };
  Sai.GeoChart.prototype.renderPlot = function(mainSeries) {
    this.geoPlot == undefined ? undefined : this.geoPlot.set.remove();
    this.geoPlot = (new this.plotType(this.r, this.px, this.py, this.pw, this.ph, this.ndata, this.data)).render(this.colors || {}, this.data['__MAP__'], mainSeries, this.bgcolor, this.interactive, this.drawInfo);
    return this.logo == undefined ? undefined : this.logo.toFront();
  };
  Sai.GeoChart.prototype.default_info = function() {
    return {
      '': this.interactive ? 'Click histogram below to change map display' : ''
    };
  };
  Sai.GeoChart.prototype.render = function() {
    var _a, _b, series;
    this.drawTitle();
    this.setupInfoSpace();
    this.drawHistogramLegend((function() {
      _a = []; _b = this.data;
      for (series in _b) { if (__hasProp.call(_b, series)) {
        !series.match('^__') ? _a.push(series) : null;
      }}
      return _a;
    }).call(this));
    this.setPlotCoords();
    this.drawLogo();
    this.drawBG();
    this.drawInfo();
    this.renderPlot(this.data['__DEFAULT__']);
    return this;
  };

  Sai.ChromaticGeoChart = function() {
    return Sai.GeoChart.apply(this, arguments);
  };
  __extends(Sai.ChromaticGeoChart, Sai.GeoChart);
  Sai.ChromaticGeoChart.prototype.plotType = Sai.ChromaticGeoPlot;
  Sai.ChromaticGeoChart.prototype.interactiveHistogram = false;
  Sai.ChromaticGeoChart.prototype.default_info = function() {
    return {};
  };
  Sai.ChromaticGeoChart.prototype.setupHistogramInteraction = function(histogram, series) {
    return false;
  };

})();
