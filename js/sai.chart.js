(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __bind = function(func, context) {
    return function(){ return func.apply(context, arguments); };
  }, __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__superClass__ = parent.prototype;
  };
  Sai.Chart = function(_b, _c, _d, _e, _f, data, _g) {
    var _a;
    this.opts = _g;
    this.h = _f;
    this.w = _e;
    this.y = _d;
    this.x = _c;
    this.r = _b;
    _a = this;
    this.drawInfo = function(){ return Sai.Chart.prototype.drawInfo.apply(_a, arguments); };
    this.opts = (typeof this.opts !== "undefined" && this.opts !== null) ? this.opts : {};
    this.opts.bgcolor = (typeof this.opts.bgcolor !== "undefined" && this.opts.bgcolor !== null) ? this.opts.bgcolor : 'white';
    this.setData(data);
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
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, group, groups, i, nngroups, series;
    this.data = {};
    _b = data;
    for (series in _b) {
      if (!__hasProp.call(_b, series)) continue;
      _a = _b[series];
      if (data[series] instanceof Array) {
        this.data[series] = data[series].slice(0);
      } else {
        this.data[series] = data[series];
      };
    }
    groups = this.dataGroups(data);
    nngroups = this.nonNegativeGroups();
    _d = groups;
    for (group in _d) {
      if (!__hasProp.call(_d, group)) continue;
      _c = _d[group];
      if (groups[group].length > 0) {
        if ((function(){ for (var _j=0, _k=nngroups.length; _j<_k; _j++) { if (nngroups[_j] === group) return true; } return false; }).call(this)) {
          _f = groups[group];
          for (_e = 0, _g = _f.length; _e < _g; _e++) {
            series = _f[_e];
            if ((typeof (_i = this.data[series]) !== "undefined" && _i !== null)) {
              _h = this.data[series].length;
              for (i = 0; (0 <= _h ? i < _h : i > _h); (0 <= _h ? i += 1 : i -= 1)) {
                if (this.data[series][i] < 0) {
                  this.data[series][i] *= -1;
                };
              }
            }
          }
        }
      }
    }
    _m = this.groupsToNullPad();
    for (_l = 0, _n = _m.length; _l < _n; _l++) {
      group = _m[_l];
      if (group in groups) {
        _p = groups[group];
        for (_o = 0, _q = _p.length; _o < _q; _o++) {
          series = _p[_o];
          this.nullPad(series);
        }
      }
    }
    return this.normalize(this.data);
  };
  Sai.Chart.prototype.nullPad = function(seriesName) {
    return seriesName in this.data ? (this.data[seriesName] = [null].concat(this.data[seriesName].concat([null]))) : null;
  };
  Sai.Chart.prototype.caresAbout = function(seriesName) {
    return !seriesName.match("^__");
  };
  Sai.Chart.prototype.dataGroups = function(data) {
    var _a, _b, _c, _d, _e, _f, seriesName;
    return {
      'all': (function() {
        _b = []; _c = data;
        for (seriesName in _c) {
          if (!__hasProp.call(_c, seriesName)) continue;
          _a = _c[seriesName];
          if (this.caresAbout(seriesName)) {
            _b.push(seriesName);
          };
        }
        return _b;
      }).call(this),
      '__META__': (function() {
        _e = []; _f = data;
        for (seriesName in _f) {
          if (!__hasProp.call(_f, seriesName)) continue;
          _d = _f[seriesName];
          if (seriesName.match("^__")) {
            _e.push(seriesName);
          };
        }
        return _e;
      })()
    };
  };
  Sai.Chart.prototype.getYAxisVals = function(min, max, nopad) {
    var _a, bottom, factor, i, mag, rawmag, step, top;
    if (min === max) {
      return [0, max, max * 2];
    }
    nopad = (typeof nopad !== "undefined" && nopad !== null) ? nopad : false;
    factor = 1;
    while (((max - min) * factor) < 10) {
      factor *= 10;
    }
    min *= factor;
    max *= factor;
    mag = Math.floor((rawmag = (Math.log(max - min) / Math.LN10) - 0.4));
    step = Math.pow(10, mag);
    if (rawmag % 1 > 0.7 && !nopad) {
      step *= 4;
    } else if (rawmag % 1 > 0.35 && !nopad) {
      step *= 2;
    }
    bottom = Sai.util.round(min - (nopad ? (step / 2.1) : (step / 1.9)), step);
    if ((bottom <= 0) && (0 <= min)) {
      bottom = 0;
    }
    top = Sai.util.round(max + (nopad ? (step / 2.1) : (step / 1.9)), step);
    bottom /= factor;
    top /= factor;
    step /= factor;
    _a = [];
    for (i = bottom; (bottom <= top ? i <= top : i >= top); i += step) {
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
        if ((typeof (_i = data[series]) !== "undefined" && _i !== null)) {
          _a.push(Math.max.apply(Math, (function() {
            _e = []; _g = data[series];
            for (_f = 0, _h = _g.length; _f < _h; _f++) {
              d = _g[_f];
              if ((typeof d !== "undefined" && d !== null) && typeof d === "number") {
                _e.push(d);
              };
            }
            return _e;
          })()));
        };
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
        if ((typeof (_i = data[series]) !== "undefined" && _i !== null)) {
          _a.push(Math.min.apply(Math, (function() {
            _e = []; _g = data[series];
            for (_f = 0, _h = _g.length; _f < _h; _f++) {
              d = _g[_f];
              if ((typeof d !== "undefined" && d !== null) && typeof d === "number") {
                _e.push(d);
              };
            }
            return _e;
          })()));
        };
      }
      return _a;
    })());
  };
  Sai.Chart.prototype.getStackedMax = function(data, group) {
    var _a, _b, _c, _d, _e, _f, i, series;
    return Math.max.apply(Math, (function() {
      _a = []; _b = this.data['__LABELS__'].length;
      for (i = 0; (0 <= _b ? i < _b : i > _b); (0 <= _b ? i += 1 : i -= 1)) {
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
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, baseline, baselines, group, groups, i, max, maxf, min, minf, norm, nval, series, stackedPoint, yvals;
    groups = this.dataGroups(data);
    this.ndata = {};
    if ((typeof (_a = this.opts.stacked) !== "undefined" && _a !== null)) {
      this.stackedNdata = {};
    };
    norm = function(val, min, max) {
      if (typeof val === "number") {
        if (min === max) {
          return 1;
        } else {
          return (val - min) / (max - min);
        }
      }
      return null;
    };
    _c = []; _d = groups;
    for (group in _d) {
      if (!__hasProp.call(_d, group)) continue;
      _b = _d[group];
      if (group.match('^__') || Sai.util.sumArray((function() {
        _e = []; _g = groups[group];
        for (_f = 0, _h = _g.length; _f < _h; _f++) {
          series = _g[_f];
          _e.push(this.data[series].length);
        }
        return _e;
      }).call(this)) === 0) {
        continue;
      }
      this.ndata[group] = {};
      if ((typeof (_i = this.opts.stacked) !== "undefined" && _i !== null)) {
        this.stackedNdata[group] = {};
        baselines = {};
      }
      minf = this.opts.stacked ? this.getStackedMin : this.getMin;
      maxf = this.opts.stacked ? this.getStackedMax : this.getMax;
      min = minf(data, groups[group]);
      max = maxf(data, groups[group]);
      yvals = this.getYAxisVals(min, max);
      min = yvals[0];
      max = yvals[yvals.length - 1];
      _k = groups[group];
      for (_j = 0, _l = _k.length; _j < _l; _j++) {
        series = _k[_j];
        if (!((typeof (_m = data[series]) !== "undefined" && _m !== null))) {
          continue;
        }
        this.ndata[group][series] = (function() {
          _n = []; _o = data[series].length;
          for (i = 0; (0 <= _o ? i < _o : i > _o); (0 <= _o ? i += 1 : i -= 1)) {
            _n.push(((typeof (_p = data[series][i]) !== "undefined" && _p !== null) && (nval = norm(data[series][i], min, max)) !== null ? [i / (data[series].length - 1 || 1), nval] : null));
          }
          return _n;
        })();
        if ((typeof (_s = this.opts.stacked) !== "undefined" && _s !== null)) {
          this.stackedNdata[group][series] = [];
          _q = data[series].length;
          for (i = 0; (0 <= _q ? i < _q : i > _q); (0 <= _q ? i += 1 : i -= 1)) {
            baseline = baselines[i] || 0;
            stackedPoint = [i / (data[series].length - 1 || 1), (typeof (_r = data[series][i]) !== "undefined" && _r !== null) && (nval = norm(data[series][i], min, max)) !== null ? nval + baseline : baseline];
            this.stackedNdata[group][series].push(stackedPoint);
            if (!(stackedPoint === null)) {
              baselines[i] = stackedPoint[1];
            }
          }
        }
        this.ndata[group].__YVALS__ = yvals;
      }
    }
    return _c;
  };
  Sai.Chart.prototype.addAxes = function(group) {
    var LINE_HEIGHT, _a, _b, haxis_height, hlen, i, tmptext, vlen;
    LINE_HEIGHT = 10;
    this.axisWidth = 1.5;
    haxis_height = LINE_HEIGHT + 2 + 10;
    this.padding.top += 5;
    for (i = this.data['__LABELS__'].length - 1; (this.data['__LABELS__'].length - 1 <= 0 ? i <= 0 : i >= 0); (this.data['__LABELS__'].length - 1 <= 0 ? i += 1 : i -= 1)) {
      if ((typeof (_a = this.data['__LABELS__'][i]) !== "undefined" && _a !== null)) {
        tmptext = this.r.text(0, 0, Sai.util.prettystr(this.data['__LABELS__'][i]));
        this.padding.right += tmptext.getBBox().width / 2;
        tmptext.remove();
        break;
      }
    }
    vlen = this.h - (this.padding.bottom + haxis_height + this.padding.top);
    this.vaxis = this.r.sai.prim.vaxis((typeof (_b = this.ndata[group] == undefined ? undefined : this.ndata[group].__YVALS__) !== "undefined" && _b !== null) ? (this.ndata[group] == undefined ? undefined : this.ndata[group].__YVALS__) : [0, '?'], this.x + this.padding.left, this.y - (this.padding.bottom + haxis_height), vlen, this.axisWidth);
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
    return (this.ph = this.h - this.padding.bottom - this.padding.top);
  };
  Sai.Chart.prototype.drawBG = function() {
    var _a, _b, _c, _d;
    return (this.bg = this.r.rect((typeof (_a = this.px) !== "undefined" && _a !== null) && this.px || this.x, (typeof (_b = this.py) !== "undefined" && _b !== null) && (this.py - this.ph) || (this.y - this.h), (typeof (_c = this.pw) !== "undefined" && _c !== null) && this.pw || this.w, (typeof (_d = this.ph) !== "undefined" && _d !== null) && this.ph || this.h).attr({
      fill: this.opts.bgcolor,
      'stroke-width': 0,
      'stroke-opacity': 0
    }).toBack());
  };
  Sai.Chart.prototype.logoPos = function() {
    var _a, _b, _c, _d, h, w, x, y;
    w = 160;
    h = 34;
    x = (typeof (_a = this.px) !== "undefined" && _a !== null) && (typeof (_b = this.pw) !== "undefined" && _b !== null) ? this.px + this.pw - w - 5 : this.w + this.x - w - this.padding.right;
    y = (typeof (_c = this.py) !== "undefined" && _c !== null) && (typeof (_d = this.ph) !== "undefined" && _d !== null) ? this.py - this.ph + 5 : this.y - this.h + this.padding.top;
    return [x, y, w, h];
  };
  Sai.Chart.prototype.drawLogo = function() {
    var _a, h, w, x, y;
    _a = this.logoPos();
    x = _a[0];
    y = _a[1];
    w = _a[2];
    h = _a[3];
    return (this.logo = this.r.image(Sai.imagePath + 'logo.png', x, y, w, h).attr({
      opacity: 0.25
    }));
  };
  Sai.Chart.prototype.render = function() {
    this.plot = (typeof this.plot !== "undefined" && this.plot !== null) ? this.plot : new Sai.Plot(this.r);
    this.plot.render();
    return this;
  };
  Sai.Chart.prototype.showError = function(error) {
    var err;
    return (err = this.r.text(this.x + (this.w / 2), this.y - (this.h / 2), error));
  };
  Sai.Chart.prototype.setColors = function(colors) {
    var _a, _b, series;
    this.colors = (typeof this.colors !== "undefined" && this.colors !== null) ? this.colors : {};
    _b = colors;
    for (series in _b) {
      if (!__hasProp.call(_b, series)) continue;
      _a = _b[series];
      if (series in this.data) {
        this.colors[series] = colors[series];
      };
    }
    return this;
  };
  Sai.Chart.prototype.setColor = function(series, color) {
    this.colors = (typeof this.colors !== "undefined" && this.colors !== null) ? this.colors : {};
    this.colors[series] = color;
    return this;
  };
  Sai.Chart.prototype.drawGuideline = function(h, group) {
    var _a, guideline, nh, ymax, ymin;
    group = (typeof group !== "undefined" && group !== null) ? group : 'all';
    if (!((typeof (_a = this.ndata[group] == undefined ? undefined : this.ndata[group].__YVALS__) !== "undefined" && _a !== null))) {
      return null;
    }
    ymin = this.ndata[group].__YVALS__[0];
    ymax = this.ndata[group].__YVALS__[this.ndata[group].__YVALS__.length - 1];
    if (!(h > ymin)) {
      return null;
    }
    nh = (h - ymin) / (ymax - ymin);
    this.guidelines = (typeof this.guidelines !== "undefined" && this.guidelines !== null) ? this.guidelines : this.r.set();
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
      if (this.legend.length > 0) {
        this.padding.bottom += this.legend.getBBox().height + 15;
      };
      return this.legend.translate((this.w - this.legend.getBBox().width) / 2, 0);
    }
  };
  Sai.Chart.prototype.drawTitle = function() {
    var _a;
    if ((typeof (_a = this.opts.title) !== "undefined" && _a !== null)) {
      this.title = this.r.text(this.x + (this.w / 2), this.y - this.h, this.opts.title).attr({
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
    var _a, _b, _c, _d, label;
    clear = (typeof clear !== "undefined" && clear !== null) ? clear : true;
    info = (typeof info !== "undefined" && info !== null) ? info : (typeof (_a = this.default_info) !== "undefined" && _a !== null) ? this.default_info() : {};
    if (clear) {
      this.info_data = {};
    };
    if (this.info) {
      this.info.remove();
    };
    _c = info;
    for (label in _c) {
      if (!__hasProp.call(_c, label)) continue;
      _b = _c[label];
      if (!(label.match("^__"))) {
        this.info_data[label] = (typeof (_d = info[label]) !== "undefined" && _d !== null) ? info[label] : '(no data)';
      };
    }
    return (this.info = this.r.sai.prim.info(this.info_x, this.info_y, this.info_w, this.info_data));
  };
  Sai.Chart.prototype.getIndex = function(evt) {
    var tx;
    tx = Sai.util.transformCoords(evt, this.r.canvas).x;
    return Math.round((this.data.__LABELS__.length - 1) * (tx - this.px) / this.pw);
  };
  Sai.LineChart = function() {
    return Sai.Chart.apply(this, arguments);
  };
  __extends(Sai.LineChart, Sai.Chart);
  Sai.LineChart.prototype.nonNegativeGroups = function() {
    return this.opts.stacked ? ['all'] : [];
  };
  Sai.LineChart.prototype.render = function() {
    var _a, _b, _c, color, everything, moveDots, ndata, plotType, series;
    this.drawTitle();
    this.setupInfoSpace();
    this.drawLegend();
    this.addAxes('all');
    this.drawBG();
    this.drawLogo();
    this.drawGuideline(0);
    this.lines = [];
    this.dots = this.r.set();
    ndata = (typeof (_a = this.opts.stacked) !== "undefined" && _a !== null) ? this.stackedNdata : this.ndata;
    plotType = this.opts.area ? Sai.AreaPlot : Sai.LinePlot;
    this.plot = (new plotType(this.r, this.px, this.py, this.pw, this.ph, ndata['all'])).render(this.colors, 2, this.opts.stacked);
    _c = ndata['all'];
    for (series in _c) {
      if (!__hasProp.call(_c, series)) continue;
      _b = _c[series];
      if (series === '__YVALS__') {
        continue;
      }
      color = this.colors && this.colors[series] || 'black';
      this.dots.push(this.r.circle(0, 0, 4).attr({
        'fill': color
      }).hide());
    }
    everything = this.r.set().push(this.bg, this.plot.set, this.dots, this.logo, this.guidelines).mousemove((moveDots = __bind(function(event) {
      var _d, _e, _f, _g, _h, _i, i, idx, info, pos;
      idx = this.getIndex(event);
      info = {};
      _e = ndata['all'];
      for (series in _e) {
        if (!__hasProp.call(_e, series)) continue;
        _d = _e[series];
        if ((typeof (_f = this.data[series]) !== "undefined" && _f !== null)) {
          info[series] = this.data[series][idx];
        };
      }
      this.drawInfo(info);
      i = 0;
      _h = []; _i = this.plot.dndata;
      for (series in _i) {
        if (!__hasProp.call(_i, series)) continue;
        _g = _i[series];
        if (!series.match('^__')) {
          _h.push((function() {
            pos = this.plot.dndata[series][idx];
            if ((typeof pos !== "undefined" && pos !== null)) {
              this.dots[i].attr({
                cx: pos[0],
                cy: pos[1]
              }).show().toFront();
            } else {
              this.dots[i].hide();
            };
            return i++;
          }).call(this));
        };
      }
      return _h;
    }, this))).mouseout(__bind(function(event) {
      this.drawInfo({}, true);
      return this.dots.hide();
    }, this));
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
  Sai.BarChart.prototype.getMin = function(data, group) {
    return 0;
  };
  Sai.BarChart.prototype.groupsToNullPad = function() {
    var _a, _b, _c, group;
    _b = []; _c = this.dataGroups();
    for (group in _c) {
      if (!__hasProp.call(_c, group)) continue;
      _a = _c[group];
      _b.push(group);
    }
    return _b;
  };
  Sai.BarChart.prototype.nonNegativeGroups = function() {
    var _a, _b, _c, group;
    _b = []; _c = this.dataGroups();
    for (group in _c) {
      if (!__hasProp.call(_c, group)) continue;
      _a = _c[group];
      _b.push(group);
    }
    return _b;
  };
  Sai.BarChart.prototype.render = function() {
    var _a, _b, _c, _d, _e, _f, _g, data, ndata, rawdata, series, yval;
    this.drawTitle();
    this.setupInfoSpace();
    this.drawLegend();
    this.addAxes('all');
    this.drawLogo();
    this.drawBG();
    if ('all' in this.ndata) {
      this.guidelines = this.r.set();
      _b = this.ndata['all']['__YVALS__'];
      for (_a = 0, _c = _b.length; _a < _c; _a++) {
        yval = _b[_a];
        this.drawGuideline(yval);
      }
    }
    this.plots = this.r.set();
    data = {};
    rawdata = {};
    ndata = (typeof (_d = this.opts.stacked) !== "undefined" && _d !== null) ? this.stackedNdata : this.ndata;
    _f = ndata['all'];
    for (series in _f) {
      if (!__hasProp.call(_f, series)) continue;
      _e = _f[series];
      if (!(series.match('^__'))) {
        data[series] = ndata['all'][series];
        rawdata[series] = this.data[series];
      }
    }
    this.plots.push((new Sai.BarPlot(this.r, this.px, this.py, this.pw, this.ph, data, rawdata)).render((typeof (_g = this.opts.stacked) !== "undefined" && _g !== null), this.colors, this.opts.interactive, this.drawInfo).set);
    this.logo == undefined ? undefined : this.logo.toFront();
    return this;
  };
  Sai.StockChart = function() {
    return Sai.Chart.apply(this, arguments);
  };
  __extends(Sai.StockChart, Sai.Chart);
  Sai.StockChart.prototype.groupsToNullPad = function() {
    return ['prices', 'volume', '__META__'];
  };
  Sai.StockChart.prototype.dataGroups = function(data) {
    var _a, _b, groups, seriesName;
    groups = {
      '__META__': ['__LABELS__']
    };
    if ('volume' in this.data) {
      groups.volume = ['volume'];
    };
    _b = data;
    for (seriesName in _b) {
      if (!__hasProp.call(_b, seriesName)) continue;
      _a = _b[seriesName];
      if (this.caresAbout(seriesName) && !('__LABELS__' === seriesName || 'volume' === seriesName)) {
        groups.prices = (typeof groups.prices !== "undefined" && groups.prices !== null) ? groups.prices : [];
        groups.prices.push(seriesName);
      }
    }
    return groups;
  };
  Sai.StockChart.prototype.nonNegativeGroups = function() {
    return ['volume'];
  };
  Sai.StockChart.prototype.render = function() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, avgColors, avgNdata, everything, glow_width, i, moveGlow, p, rawdata, series, shouldDrawLegend, vol;
    if (!((typeof (_a = this.ndata.prices) !== "undefined" && _a !== null) && 'open' in this.ndata.prices && 'close' in this.ndata.prices && 'high' in this.ndata.prices && 'low' in this.ndata.prices)) {
      this.showError("This chart requires data series named 'open', 'close', 'high', and 'low'.\n \nOnce you add series with these names, the chart will display.");
      return null;
    }
    this.drawTitle();
    this.setupInfoSpace();
    avgColors = {};
    shouldDrawLegend = false;
    _c = this.ndata['prices'];
    for (series in _c) {
      if (!__hasProp.call(_c, series)) continue;
      _b = _c[series];
      if (!('open' === series || 'close' === series || 'high' === series || 'low' === series) && !series.match('^__')) {
        avgColors[series] = (this.colors == undefined ? undefined : this.colors[series]) || 'black';
        shouldDrawLegend = true;
      }
    }
    if (shouldDrawLegend) {
      this.drawLegend(avgColors);
    };
    this.colors = (typeof this.colors !== "undefined" && this.colors !== null) ? this.colors : {};
    this.colors['up'] = (typeof this.colors['up'] !== "undefined" && this.colors['up'] !== null) ? this.colors['up'] : 'black';
    this.colors['down'] = (typeof this.colors['down'] !== "undefined" && this.colors['down'] !== null) ? this.colors['down'] : 'red';
    this.colors['vol_up'] = (typeof this.colors['vol_up'] !== "undefined" && this.colors['vol_up'] !== null) ? this.colors['vol_up'] : '#666666';
    this.colors['vol_down'] = (typeof this.colors['vol_down'] !== "undefined" && this.colors['vol_down'] !== null) ? this.colors['vol_down'] : '#cc6666';
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
    _e = this.ndata['prices'];
    for (p in _e) {
      if (!__hasProp.call(_e, p)) continue;
      _d = _e[p];
      if (!(p.match('^__'))) {
        rawdata[p] = this.data[p];
      };
    }
    if ((typeof (_f = this.data['volume']) !== "undefined" && _f !== null)) {
      rawdata['vol'] = this.data['volume'];
    };
    if ('volume' in this.ndata) {
      _g = this.ndata['volume']['volume'].length;
      for (i = 0; (0 <= _g ? i < _g : i > _g); (0 <= _g ? i += 1 : i -= 1)) {
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
    _i = this.ndata['prices'];
    for (series in _i) {
      if (!__hasProp.call(_i, series)) continue;
      _h = _i[series];
      if (!((('open' === series || 'close' === series || 'high' === series || 'low' === series)) || series.match("^__"))) {
        avgNdata[series] = this.ndata['prices'][series];
      };
    }
    this.plots.push((new Sai.LinePlot(this.r, this.px, this.py, this.pw, this.ph, avgNdata)).render(this.colors).set);
    glow_width = this.pw / (this.data.__LABELS__.length - 1);
    this.glow = this.r.rect(this.px - (glow_width / 2), this.py - this.ph, glow_width, this.ph).attr({
      fill: ("0-" + (this.opts.bgcolor) + "-#DDAA99-" + (this.opts.bgcolor)),
      'stroke-width': 0,
      'stroke-opacity': 0
    }).toBack().hide();
    this.bg.toBack();
    everything = this.r.set().push(this.bg, this.plots, this.logo, this.glow, this.guidelines).mousemove((moveGlow = __bind(function(event) {
      var _j, _k, _l, _m, idx, info, notNull;
      idx = this.getIndex(event);
      info = {};
      notNull = false;
      _k = this.ndata['prices'];
      for (series in _k) {
        if (!__hasProp.call(_k, series)) continue;
        _j = _k[series];
        if (!series.match('^__')) {
          if ((typeof (_l = this.data[series] == undefined ? undefined : this.data[series][idx]) !== "undefined" && _l !== null)) {
            info[series] = this.data[series][idx];
            notNull = true;
          }
        }
      }
      if ((typeof (_m = this.data['volume'] == undefined ? undefined : this.data['volume'][idx]) !== "undefined" && _m !== null)) {
        info['volume'] = this.data['volume'][idx];
        notNull = true;
      }
      this.drawInfo(info);
      return notNull ? this.glow.attr({
        x: this.px + (glow_width * (idx - 0.5))
      }).show() : null;
    }, this))).mouseout(__bind(function(event) {
      this.drawInfo({}, true);
      return this.glow.hide();
    }, this));
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
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, d, dataWithoutNulls, i, max, maxes, min, mins, overallMax, overallMin, series;
    this.ndata = {};
    this.bounds = {};
    maxes = {};
    mins = {};
    _b = data;
    for (series in _b) {
      if (!__hasProp.call(_b, series)) continue;
      _a = _b[series];
      if (series.match('^__')) {
        continue;
      }
      if (!((typeof (_c = data[series]) !== "undefined" && _c !== null))) {
        continue;
      }
      dataWithoutNulls = (function() {
        _d = []; _f = data[series];
        for (_e = 0, _g = _f.length; _e < _g; _e++) {
          d = _f[_e];
          if ((typeof d !== "undefined" && d !== null)) {
            _d.push(d);
          };
        }
        return _d;
      })();
      maxes[series] = this.getMax(dataWithoutNulls, series);
      if (!(typeof overallMax !== "undefined" && overallMax !== null) || maxes[series] > overallMax) {
        overallMax = maxes[series];
      };
      mins[series] = this.getMin(dataWithoutNulls, series);
      if (!(typeof overallMin !== "undefined" && overallMin !== null) || mins[series] < overallMin) {
        overallMin = mins[series];
      };
    }
    _i = []; _j = data;
    for (series in _j) {
      if (!__hasProp.call(_j, series)) continue;
      _h = _j[series];
      if (series.match('^__')) {
        continue;
      }
      if (!((typeof (_k = data[series]) !== "undefined" && _k !== null))) {
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
        _l = []; _m = data[series].length;
        for (i = 0; (0 <= _m ? i < _m : i > _m); (0 <= _m ? i += 1 : i -= 1)) {
          _l.push(((typeof (_n = data[series][i]) !== "undefined" && _n !== null) ? [i / (data[series].length - 1), ((data[series][i] - min) / (max - min))] : null));
        }
        return _l;
      })();
    }
    return _i;
  };
  Sai.GeoChart.prototype.dataGroups = function(data) {
    var _a, _b, _c, _d, _e, groups, seriesName;
    groups = {
      '__META__': (function() {
        _b = []; _c = data;
        for (seriesName in _c) {
          if (!__hasProp.call(_c, seriesName)) continue;
          _a = _c[seriesName];
          if (seriesName.match("^__")) {
            _b.push(seriesName);
          };
        }
        return _b;
      })()
    };
    _e = data;
    for (seriesName in _e) {
      if (!__hasProp.call(_e, seriesName)) continue;
      _d = _e[seriesName];
      if (!(seriesName.match("^__"))) {
        groups[seriesName] = [seriesName];
      };
    }
    return groups;
  };
  Sai.GeoChart.prototype.drawHistogramLegend = function(seriesNames) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, data, dataWithoutNulls, extrapadding, height, histogram, i, j, max, maxLabel, min, minLabel, px, series, width, x, yvals;
    this.histogramLegend = this.r.set();
    extrapadding = 20;
    height = Math.max(0.1 * (this.h - this.padding.bottom - this.padding.top), 50);
    width = Math.min(150, (this.w - this.padding.left - this.padding.right - extrapadding) / seriesNames.length);
    _a = seriesNames.length;
    for (i = 0; (0 <= _a ? i < _a : i > _a); (0 <= _a ? i += 1 : i -= 1)) {
      series = seriesNames[i];
      px = this.x + (i * width);
      data = (function() {
        _b = []; _c = this.ndata[series].length;
        for (j = 0; (0 <= _c ? j < _c : j > _c); (0 <= _c ? j += 1 : j -= 1)) {
          if ((typeof (_d = this.ndata[series][j]) !== "undefined" && _d !== null)) {
            _b.push(this.ndata[series][j][1]);
          };
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
            if ((typeof x !== "undefined" && x !== null)) {
              _g.push(x);
            };
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
      this.histogramLegend.push((histogram = this.r.sai.prim.histogram(px, this.y - this.padding.bottom, width * 0.8, height, data, minLabel, maxLabel, series, this.colors[series], 'white', this.opts.fromWhite)));
      if (this.opts.interactive) {
        this.setupHistogramInteraction(histogram, series);
      };
    }
    this.histogramLegend.translate((this.w - this.padding.left - this.padding.right - this.histogramLegend.getBBox().width) / 2, 0);
    return this.padding.bottom += height + 5;
  };
  Sai.GeoChart.prototype.setupHistogramInteraction = function(histogram, series) {
    return histogram.click(__bind(function() {
      return this.renderPlot(series);
    }, this)).hover((__bind(function(set) {
      return __bind(function() {
        set.attr({
          'fill-opacity': 0.75
        });
        return this.drawInfo({
          'Click to display on map': series
        });
      }, this);
    }, this))(histogram), (__bind(function(set) {
      return __bind(function() {
        set.attr({
          'fill-opacity': 1.0
        });
        return this.drawInfo();
      }, this);
    }, this))(histogram));
  };
  Sai.GeoChart.prototype.renderPlot = function(mainSeries) {
    this.geoPlot == undefined ? undefined : this.geoPlot.set.remove();
    this.geoPlot = (new this.plotType(this.r, this.px, this.py, this.pw, this.ph, this.ndata, this.data, {
      fromWhite: this.opts.fromWhite
    })).render(this.colors || {}, this.data['__MAP__'], mainSeries, this.opts.bgcolor, this.opts.interactive, this.drawInfo);
    return this.logo == undefined ? undefined : this.logo.toFront();
  };
  Sai.GeoChart.prototype.default_info = function() {
    return {
      '': this.opts.interactive ? 'Click histogram below to change map display' : ''
    };
  };
  Sai.GeoChart.prototype.render = function() {
    var _a, _b, _c, series;
    this.drawTitle();
    this.setupInfoSpace();
    this.drawHistogramLegend((function() {
      _b = []; _c = this.data;
      for (series in _c) {
        if (!__hasProp.call(_c, series)) continue;
        _a = _c[series];
        if (!series.match('^__')) {
          _b.push(series);
        };
      }
      return _b;
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
