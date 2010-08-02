(function(){
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    var ctor = function(){ };
    ctor.prototype = parent.prototype;
    child.__superClass__ = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
  };
  Sai.Plot = function(r, x, y, w, h, data, rawdata) {
    this.r = r;
    this.x = x || 0;
    this.y = y || 0;
    this.w = w || 640;
    this.h = h || 480;
    this.data = data;
    this.setDenormalizedData();
    this.rawdata = rawdata;
    this.set = this.r.set();
    return this;
  };
  Sai.Plot.prototype.setDenormalizedData = function() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, column, dnPoint;
    if (this.data instanceof Array) {
      this.dndata = (function() {
        _a = []; _c = this.data;
        for (_b = 0, _d = _c.length; _b < _d; _b++) {
          dnPoint = _c[_b];
          _a.push(this.denormalize(dnPoint));
        }
        return _a;
      }).call(this);
      return this.dndata;
    } else {
      this.dndata = (typeof (_e = this.dndata) !== "undefined" && _e !== null) ? this.dndata : {};
      _f = []; _g = this.data;
      for (column in _g) { if (__hasProp.call(_g, column)) {
        _f.push((this.dndata[column] = (function() {
          _h = []; _j = this.data[column];
          for (_i = 0, _k = _j.length; _i < _k; _i++) {
            dnPoint = _j[_i];
            _h.push(this.denormalize(dnPoint));
          }
          return _h;
        }).call(this)));
      }}
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
  Sai.LinePlot.prototype.render = function(colors, width) {
    var _a, series;
    this.set.remove();
    _a = this.dndata;
    for (series in _a) { if (__hasProp.call(_a, series)) {
      !series.match('^__') ? this.set.push(this.r.sai.prim.line(this.dndata[series], ((colors == undefined ? undefined : colors[series]) || 'black'), width || 1)) : null;
    }}
    return this;
  };

  Sai.AreaPlot = function() {
    return Sai.Plot.apply(this, arguments);
  };
  __extends(Sai.AreaPlot, Sai.Plot);
  Sai.AreaPlot.prototype.render = function(colors, width, stacked) {
    var _a, _b, _c, _d, _e, baseline, d, series;
    this.set.remove();
    _a = this.dndata;
    for (series in _a) { if (__hasProp.call(_a, series)) {
      if (!series.match('^__')) {
        baseline = (typeof baseline !== "undefined" && baseline !== null) ? baseline : [this.denormalize([0, 0]), this.denormalize([1, 0])];
        this.set.push(this.r.sai.prim.area(this.dndata[series], (colors == undefined ? undefined : colors[series]) || 'black', width || 1, baseline));
        stacked ? (baseline = (function() {
          _b = []; _d = this.dndata[series];
          for (_c = 0, _e = _d.length; _c < _e; _c++) {
            d = _d[_c];
            _b.push([d[0], d[1] - width / 2]);
          }
          return _b;
        }).call(this)) : null;
      }
    }}
    return this;
  };

  Sai.CandlestickPlot = function() {
    return Sai.Plot.apply(this, arguments);
  };
  __extends(Sai.CandlestickPlot, Sai.Plot);
  Sai.CandlestickPlot.prototype.render = function(colors, body_width, shouldInteract, fSetInfo) {
    var _a, _b, _c, _d, cdown, cup, i, info, p, upDay;
    this.set.remove();
    cup = (colors == undefined ? undefined : colors['up']) || 'black';
    cdown = (colors == undefined ? undefined : colors['down']) || 'red';
    body_width = (typeof body_width !== "undefined" && body_width !== null) ? body_width : 5;
    (_a = this.dndata['open'].length);

    for (i = 0; i < _a; i += 1) {
      if (!((typeof (_b = this.dndata['close'][i]) !== "undefined" && _b !== null))) {
        continue;
      }
      upDay = this.dndata['close'][i][1] < this.dndata['open'][i][1];
      info = {};
      _c = this.rawdata;
      for (p in _c) { if (__hasProp.call(_c, p)) {
        info[p] = this.rawdata[p][i];
      }}
      this.set.push(this.r.sai.prim.candlestick(this.dndata['open'][i][0], upDay && this.dndata['close'][i][1] || this.dndata['open'][i][1], upDay && this.dndata['open'][i][1] || this.dndata['close'][i][1], this.dndata['high'][i][1], this.dndata['low'][i][1], body_width || 5, (i && (typeof (_d = this.dndata['close'][i - 1]) !== "undefined" && _d !== null) && (this.dndata['close'][i - 1][1] < this.dndata['close'][i][1])) ? cdown : cup, !upDay, shouldInteract, fSetInfo, Sai.util.infoSetters(fSetInfo, info)));
    }
    return this;
  };

  Sai.BarPlot = function() {
    return Sai.Plot.apply(this, arguments);
  };
  __extends(Sai.BarPlot, Sai.Plot);
  Sai.BarPlot.prototype.render = function(stacked, colors, shouldInteract, fSetInfo) {
    var _a, _b, _c, bardata, barfunc, colorArray, i, info, len, p, series;
    this.set.remove();
    len = 0;
    colorArray = [];
    barfunc = stacked ? this.r.sai.prim.stackedBar : this.r.sai.prim.groupedBar;
    _a = this.dndata;
    for (series in _a) { if (__hasProp.call(_a, series)) {
      len = this.dndata[series].length;
      colorArray.push((colors == undefined ? undefined : colors[series]) || 'black');
    }}
    for (i = 0; i < len; i += 1) {
      bardata = [];
      _b = this.dndata;
      for (series in _b) { if (__hasProp.call(_b, series)) {
        bardata.push(this.dndata[series][i]);
      }}
      info = {};
      _c = this.rawdata;
      for (p in _c) { if (__hasProp.call(_c, p)) {
        info[p] = this.rawdata[p][i];
      }}
      this.set.push(barfunc(bardata, colorArray, this.w / len, this.y, shouldInteract, fSetInfo, Sai.util.infoSetters(fSetInfo, info)));
    }
    return this;
  };

  Sai.GeoPlot = function() {
    return Sai.Plot.apply(this, arguments);
  };
  __extends(Sai.GeoPlot, Sai.Plot);
  Sai.GeoPlot.prototype.getRegionColor = function(colors, ridx, mainSeries) {
    return Sai.util.multiplyColor(colors[mainSeries], (this.data[mainSeries][ridx] == undefined ? undefined : this.data[mainSeries][ridx][1]) || 0).str;
  };
  Sai.GeoPlot.prototype.getRegionOpacity = function(ridx, mainSeries) {
    var _a;
    if ((typeof (_a = this.data[mainSeries][ridx] == undefined ? undefined : this.data[mainSeries][ridx][1]) !== "undefined" && _a !== null)) {
      return 1;
    } else {
      return 0.25;
    }
  };
  Sai.GeoPlot.prototype.render = function(colors, map, mainSeries, bgcolor, shouldInteract, fSetInfo) {
    var _a, _b, _c, bbox, i, region, regions, ri;
    this.set.remove();
    regions = this.rawdata.__LABELS__;
    ri = {};
    (_a = regions.length);

    for (i = 0; i < _a; i += 1) {
      ri[regions[i]] = i;
    }
    _c = map.paths;
    for (_b in _c) { if (__hasProp.call(_c, _b)) {
      (function() {
        var _d, color, hoverShape, info, name, opacity, ridx, series;
        var region = _b;
        ridx = ri[region];
        name = map.name[region];
        info = {
          region: (typeof name !== "undefined" && name !== null) ? name : region
        };
        _d = this.rawdata;
        for (series in _d) { if (__hasProp.call(_d, series)) {
          info[series] = this.rawdata[series][ridx];
        }}
        color = this.getRegionColor(colors, ridx, mainSeries);
        opacity = this.getRegionOpacity(ridx, mainSeries);
        return this.set.push((hoverShape = this.r.sai.prim.hoverShape((function(path, scale, x, y) {
          return function(r) {
            return r.path(path).translate(x, y).scale(scale, scale, x, y);
          };
        })(map.paths[region], Math.min(this.w / map.width, this.h / map.height), this.x, this.y - this.h), {
          'fill': color,
          'stroke': bgcolor,
          'stroke-width': 0.75,
          'opacity': opacity
        }, shouldInteract ? Sai.util.infoSetters(fSetInfo, info) : null, shouldInteract ? [
          {
            'fill-opacity': .75
          }, {
            'fill-opacity': 1
          }
        ] : null)));
      }).call(this);
    }}
    bbox = this.set.getBBox();
    this.set.translate((this.w - bbox.width) / 2, (this.h - bbox.height) / 2);
    return this;
  };

  Sai.ChromaticGeoPlot = function() {
    return Sai.GeoPlot.apply(this, arguments);
  };
  __extends(Sai.ChromaticGeoPlot, Sai.GeoPlot);
  Sai.ChromaticGeoPlot.prototype.getRegionColor = function(colors, ridx, mainSeries) {
    var _a, b, g, r, rgb, series;
    r = (g = (b = 0));
    _a = this.data;
    for (series in _a) { if (__hasProp.call(_a, series)) {
      rgb = Sai.util.multiplyColor(colors[series], (this.data[series][ridx] == undefined ? undefined : this.data[series][ridx][1]) || 0);
      r += rgb.r;
      g += rgb.g;
      b += rgb.b;
    }}
    return ("rgb(" + r + ", " + g + ", " + b + ")");
  };
  Sai.ChromaticGeoPlot.prototype.getRegionOpacity = function(ridx, mainSeries) {
    var _a, _b, series;
    _a = this.data;
    for (series in _a) { if (__hasProp.call(_a, series)) {
      if ((typeof (_b = this.data[series][ridx] == undefined ? undefined : this.data[series][ridx][1]) !== "undefined" && _b !== null)) {
        return 1;
      }
    }}
    return 0.25;
  };

})();
