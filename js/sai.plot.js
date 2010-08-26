(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__superClass__ = parent.prototype;
  };
  Sai.Plot = function(_a, _b, _c, _d, _e, _f, _g, _h) {
    this.opts = _h;
    this.rawdata = _g;
    this.data = _f;
    this.h = _e;
    this.w = _d;
    this.y = _c;
    this.x = _b;
    this.r = _a;
    this.opts = (typeof this.opts !== "undefined" && this.opts !== null) ? this.opts : {};
    this.setDenormalizedData();
    this.set = this.r.set();
    return this;
  };
  Sai.Plot.prototype.setDenormalizedData = function() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, dnPoint, series;
    if (this.data instanceof Array) {
      return (this.dndata = (function() {
        _a = []; _c = this.data;
        for (_b = 0, _d = _c.length; _b < _d; _b++) {
          dnPoint = _c[_b];
          _a.push(this.denormalize(dnPoint));
        }
        return _a;
      }).call(this));
    } else {
      this.dndata = (typeof this.dndata !== "undefined" && this.dndata !== null) ? this.dndata : {};
      _f = []; _g = this.data;
      for (series in _g) {
        if (!__hasProp.call(_g, series)) continue;
        _e = _g[series];
        _f.push((this.dndata[series] = (function() {
          _h = []; _j = this.data[series];
          for (_i = 0, _k = _j.length; _i < _k; _i++) {
            dnPoint = _j[_i];
            _h.push(this.denormalize(dnPoint));
          }
          return _h;
        }).call(this)));
      }
      return _f;
    }
  };
  Sai.Plot.prototype.denormalize = function(point) {
    if (point instanceof Array) {
      return [this.x + (this.w * point[0]), this.y - (this.h * point[1])];
    }
  };
  Sai.Plot.prototype.render = function() {
    this.set.push(this.r.rect(20, 20, 20, 20).attr('fill', 'red'), this.r.circle(40, 40, 10).attr('fill', 'blue'));
    return this;
  };
  Sai.LinePlot = function() {
    return Sai.Plot.apply(this, arguments);
  };
  __extends(Sai.LinePlot, Sai.Plot);
  Sai.LinePlot.prototype.setDenormalizedData = function() {
    var _a, _b, _c, series;
    Sai.LinePlot.__superClass__.setDenormalizedData.apply(this, arguments);
    _b = []; _c = this.dndata;
    for (series in _c) {
      if (!__hasProp.call(_c, series)) continue;
      _a = _c[series];
      _b.push(this.dndata[series].length === 1 && (this.dndata[series] == undefined ? undefined : this.dndata[series][0] == undefined ? undefined : this.dndata[series][0][0]) === this.x ? this.dndata[series].push([this.x + this.w, this.dndata[series][0][1]]) : null);
    }
    return _b;
  };
  Sai.LinePlot.prototype.render = function(colors, width) {
    var _a, _b, series;
    this.set.remove();
    _b = this.dndata;
    for (series in _b) {
      if (!__hasProp.call(_b, series)) continue;
      _a = _b[series];
      if (!series.match('^__')) {
        this.set.push(this.r.sai.prim.line(this.dndata[series], ((colors == undefined ? undefined : colors[series]) || 'black'), width || 1));
      };
    }
    return this;
  };
  Sai.AreaPlot = function() {
    return Sai.LinePlot.apply(this, arguments);
  };
  __extends(Sai.AreaPlot, Sai.LinePlot);
  Sai.AreaPlot.prototype.render = function(colors, width, stacked, zeroline) {
    var _a, _b, _c, _d, _e, _f, _g, baseline, d, denzel, first, i, last, series;
    this.set.remove();
    denzel = [this.denormalize([0, zeroline]), this.denormalize([1, zeroline])];
    _b = this.dndata;
    for (series in _b) {
      if (!__hasProp.call(_b, series)) continue;
      _a = _b[series];
      if (!series.match('^__')) {
        _c = this.dndata[series].length;
        for (i = 0; (0 <= _c ? i < _c : i > _c); (0 <= _c ? i += 1 : i -= 1)) {
          first = this.dndata[series][i];
          if ((typeof first !== "undefined" && first !== null)) {
            break;
          }
        }
        for (i = this.dndata[series].length - 1; (this.dndata[series].length - 1 <= 0 ? i <= 0 : i >= 0); (this.dndata[series].length - 1 <= 0 ? i += 1 : i -= 1)) {
          last = this.dndata[series][i];
          if ((typeof last !== "undefined" && last !== null)) {
            break;
          }
        }
        if (!((typeof baseline !== "undefined" && baseline !== null) && stacked)) {
          baseline = [[first[0], denzel[0][1]], [last[0], denzel[1][1]]];
        };
        this.set.push(this.r.sai.prim.area(this.dndata[series], (colors == undefined ? undefined : colors[series]) || 'black', width || 1, baseline));
        if (stacked) {
          baseline = (function() {
            _d = []; _f = this.dndata[series];
            for (_e = 0, _g = _f.length; _e < _g; _e++) {
              d = _f[_e];
              _d.push([d[0], d[1] - width / 2]);
            }
            return _d;
          }).call(this);
        };
      }
    }
    return this;
  };
  Sai.CandlestickPlot = function() {
    return Sai.Plot.apply(this, arguments);
  };
  __extends(Sai.CandlestickPlot, Sai.Plot);
  Sai.CandlestickPlot.prototype.render = function(colors, body_width, shouldInteract, fSetInfo) {
    var _a, _b, _c, _d, _e, cdown, cup, i, info, p, upDay;
    this.set.remove();
    cup = (colors == undefined ? undefined : colors['up']) || 'black';
    cdown = (colors == undefined ? undefined : colors['down']) || 'red';
    body_width = (typeof body_width !== "undefined" && body_width !== null) ? body_width : 5;
    _a = this.dndata['open'].length;
    for (i = 0; (0 <= _a ? i < _a : i > _a); (0 <= _a ? i += 1 : i -= 1)) {
      if (!((typeof (_b = this.dndata['close'][i]) !== "undefined" && _b !== null))) {
        continue;
      }
      upDay = this.dndata['close'][i][1] < this.dndata['open'][i][1];
      info = {};
      _d = this.rawdata;
      for (p in _d) {
        if (!__hasProp.call(_d, p)) continue;
        _c = _d[p];
        info[p] = this.rawdata[p][i];
      }
      this.set.push(this.r.sai.prim.candlestick(this.dndata['open'][i][0], upDay && this.dndata['close'][i][1] || this.dndata['open'][i][1], upDay && this.dndata['open'][i][1] || this.dndata['close'][i][1], this.dndata['high'][i][1], this.dndata['low'][i][1], body_width || 5, (i && (typeof (_e = this.dndata['close'][i - 1]) !== "undefined" && _e !== null) && (this.dndata['close'][i - 1][1] < this.dndata['close'][i][1])) ? cdown : cup, !upDay, shouldInteract, fSetInfo, Sai.util.infoSetters(fSetInfo, info)));
    }
    return this;
  };
  Sai.BarPlot = function() {
    return Sai.Plot.apply(this, arguments);
  };
  __extends(Sai.BarPlot, Sai.Plot);
  Sai.BarPlot.prototype.render = function(stacked, baseline, colors, shouldInteract, fSetInfo) {
    var _a, _b, _c, _d, _e, _f, bardata, barfunc, colorArray, i, info, len, p, series;
    this.set.remove();
    baseline = this.denormalize([0, baseline])[1];
    len = 0;
    colorArray = [];
    barfunc = stacked ? this.r.sai.prim.stackedBar : this.r.sai.prim.groupedBar;
    _b = this.dndata;
    for (series in _b) {
      if (!__hasProp.call(_b, series)) continue;
      _a = _b[series];
      len = this.dndata[series].length;
      colorArray.push((colors == undefined ? undefined : colors[series]) || 'black');
    }
    for (i = 0; (0 <= len ? i < len : i > len); (0 <= len ? i += 1 : i -= 1)) {
      bardata = [];
      _d = this.dndata;
      for (series in _d) {
        if (!__hasProp.call(_d, series)) continue;
        _c = _d[series];
        bardata.push(this.dndata[series][i]);
      }
      info = {};
      _f = this.rawdata;
      for (p in _f) {
        if (!__hasProp.call(_f, p)) continue;
        _e = _f[p];
        info[p] = this.rawdata[p][i];
      }
      this.set.push(barfunc(bardata, colorArray, this.w / len, baseline, shouldInteract, fSetInfo, Sai.util.infoSetters(fSetInfo, info)));
    }
    return this;
  };
  Sai.GeoPlot = function() {
    return Sai.Plot.apply(this, arguments);
  };
  __extends(Sai.GeoPlot, Sai.Plot);
  Sai.GeoPlot.prototype.getRegionColor = function(colors, ridx, mainSeries) {
    return Sai.util.multiplyColor(colors[mainSeries], (this.data[mainSeries][ridx] == undefined ? undefined : this.data[mainSeries][ridx][1]) || 0, this.opts.fromWhite, this.opts.fromWhite ? 0.2 : 0).str;
  };
  Sai.GeoPlot.prototype.getRegionOpacity = function(ridx, mainSeries) {
    var _a;
    return (typeof (_a = this.data[mainSeries][ridx] == undefined ? undefined : this.data[mainSeries][ridx][1]) !== "undefined" && _a !== null) ? 1 : (this.opts.fromWhite ? .15 : 0.25);
  };
  Sai.GeoPlot.prototype.render = function(colors, map, regionSeries, mainSeries, bgcolor, shouldInteract, fSetInfo) {
    var _a, _b, _c, _d, _e, _f, _g, _h, bbox, i, region, regions, ri;
    this.set.remove();
    regions = (function() {
      _a = []; _c = this.rawdata[regionSeries];
      for (_b = 0, _d = _c.length; _b < _d; _b++) {
        region = _c[_b];
        _a.push(region.toUpperCase());
      }
      return _a;
    }).call(this);
    ri = {};
    _e = regions.length;
    for (i = 0; (0 <= _e ? i < _e : i > _e); (0 <= _e ? i += 1 : i -= 1)) {
      ri[regions[i]] = i;
    }
    _h = map.paths;
    for (_g in _h) {
      if (!__hasProp.call(_h, _g)) continue;
      (function() {
        var _i, _j, color, hoverShape, info, infoSetters, name, opacity, ridx, series;
        var region = _g;
        var _f = _h[_g];
        ridx = ri[region];
        name = map.name[region];
        info = {
          region: (typeof name !== "undefined" && name !== null) ? name : region
        };
        _j = this.rawdata;
        for (series in _j) {
          if (!__hasProp.call(_j, series)) continue;
          _i = _j[series];
          if (series !== regionSeries) {
            info[series] = this.rawdata[series][ridx];
          };
        }
        color = this.getRegionColor(colors, ridx, mainSeries);
        opacity = this.getRegionOpacity(ridx, mainSeries);
        infoSetters = Sai.util.infoSetters(fSetInfo, info);
        return this.set.push((hoverShape = this.r.sai.prim.hoverShape((function(path, scale, x, y) {
          return function(r) {
            return r.path(path).translate(x, y).scale(scale, scale, x, y);
          };
        })(map.paths[region], Math.min(this.w / map.width, this.h / map.height), this.x, this.y - this.h), {
          'fill': color,
          'stroke': this.opts.fromWhite ? 'black' : bgcolor,
          'stroke-width': 0.5,
          'opacity': opacity
        }, (shouldInteract ? [
          function(target) {
            if (!(navigator.userAgent.toLowerCase().indexOf('msie') !== -1 || navigator.userAgent.toLowerCase().indexOf('opera') !== -1)) {
              target.toFront();
            }
            return infoSetters[0]();
          }, infoSetters[1]
        ] : null), shouldInteract ? [
          {
            'fill-opacity': .75,
            'stroke-width': (this.opts.fromWhite ? 2 : 0.5)
          }, {
            'fill-opacity': 1,
            'stroke-width': 0.5
          }
        ] : null)));
      }).call(this);
    }
    bbox = this.set.getBBox();
    this.set.translate((this.w - bbox.width) / 2, (this.h - bbox.height) / 2);
    return this;
  };
  Sai.ChromaticGeoPlot = function() {
    return Sai.GeoPlot.apply(this, arguments);
  };
  __extends(Sai.ChromaticGeoPlot, Sai.GeoPlot);
  Sai.ChromaticGeoPlot.prototype.getRegionColor = function(colors, ridx, mainSeries) {
    var _a, _b, b, g, r, rgb, series;
    r = (g = (b = 0));
    _b = this.data;
    for (series in _b) {
      if (!__hasProp.call(_b, series)) continue;
      _a = _b[series];
      rgb = Sai.util.multiplyColor(colors[series], (this.data[series][ridx] == undefined ? undefined : this.data[series][ridx][1]) || 0, this.opts.fromWhite);
      r += rgb.r;
      g += rgb.g;
      b += rgb.b;
    }
    return ("rgb(" + (r) + ", " + (g) + ", " + (b) + ")");
  };
  Sai.ChromaticGeoPlot.prototype.getRegionOpacity = function(ridx, mainSeries) {
    var _a, _b, _c, series;
    _b = this.data;
    for (series in _b) {
      if (!__hasProp.call(_b, series)) continue;
      _a = _b[series];
      if ((typeof (_c = this.data[series][ridx] == undefined ? undefined : this.data[series][ridx][1]) !== "undefined" && _c !== null)) {
        return 1;
      }
    }
    return 0.25;
  };
})();
