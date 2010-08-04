var Sai, _a, _b, _c, _d, _e;
Sai = (typeof Sai !== "undefined" && Sai !== null) ? Sai : {};
Sai.util = (typeof (_a = Sai.util) !== "undefined" && _a !== null) ? Sai.util : {};
Sai.imagePath = (typeof (_b = Sai.imagePath) !== "undefined" && _b !== null) ? Sai.imagePath : 'images/';
Sai.util.roundToMag = function(x, mag) {
  var target;
  mag = (typeof mag !== "undefined" && mag !== null) ? mag : 0;
  target = Math.pow(10, mag);
  return parseFloat((Math.round(x / target) * target).toFixed(Math.max(0, mag)));
};
Sai.util.round = function(x, target) {
  return parseFloat((Math.round(x / target) * target).toFixed(Math.max(0, Math.log(x) / Math.LN10)));
};
Sai.util.sumArray = function(a) {
  var _c, i, sum;
  sum = 0;
  (_c = a.length);

  for (i = 0; i < _c; i += 1) {
    sum += typeof a[i] === 'number' ? a[i] : 0;
  }
  return sum;
};
Sai.util.prettystr = function(x) {
  var suffix;
  if (typeof x === 'number') {
    suffix = '';
    if (Math.abs(x) >= 1000000000000) {
      suffix = 't';
      x /= 1000000000000;
    } else if (Math.abs(x) >= 1000000000) {
      suffix = 'b';
      x /= 1000000000;
    } else if (Math.abs(x) >= 1000000) {
      suffix = 'm';
      x /= 1000000;
    } else if (Math.abs(x) >= 1000) {
      suffix = 'k';
      x /= 1000;
    } else {
      return String(parseFloat(x.toFixed(2)));
    }
    return parseFloat(x.toFixed(1)) + suffix;
  }
  return x;
};
Sai.util.infoSetters = function(fSetInfo, info) {
  return [
    function() {
      return fSetInfo(info);
    }, function() {
      return fSetInfo();
    }
  ];
};
Sai.util.transformCoords = function(coords, canvas) {
  var svgPoint, xformed;
  if (canvas.getScreenCTM) {
    svgPoint = canvas.createSVGPoint();
    svgPoint.x = coords.x;
    svgPoint.y = coords.y;
    xformed = svgPoint.matrixTransform(canvas.getScreenCTM().inverse());
    return {
      x: xformed.x,
      y: xformed.y
    };
  } else {
    return {
      x: event.x,
      y: event.y
    };
  }
};
Sai.util.multiplyColor = function(colorStr, coeff, fromWhite, padding) {
  var b, g, r, rgb;
  padding = (typeof padding !== "undefined" && padding !== null) ? padding : 0;
  coeff = padding + (1.0 - padding) * coeff;
  rgb = Raphael.getRGB(colorStr);
  if (fromWhite) {
    r = rgb.r + ((255 - rgb.r) * (1.0 - coeff));
    g = rgb.g + ((255 - rgb.g) * (1.0 - coeff));
    b = rgb.b + ((255 - rgb.b) * (1.0 - coeff));
  } else {
    r = rgb.r * coeff;
    g = rgb.g * coeff;
    b = rgb.b * coeff;
  }
  return {
    r: r,
    g: g,
    b: b,
    str: ("rgb(" + r + ", " + g + ", " + b + ")")
  };
};
Sai.util.reflectColor = function(color, mirror) {
  var _c, _d, _e, c, channel, crgb, m, max, mrgb, rgb;
  max = 255;
  crgb = Raphael.getRGB(color);
  mrgb = Raphael.getRGB(mirror);
  rgb = {};
  _d = ['r', 'g', 'b'];
  for (_c = 0, _e = _d.length; _c < _e; _c++) {
    channel = _d[_c];
    c = crgb[channel];
    m = mrgb[channel];
    if (c === m) {
      rgb[channel] = c;
    } else if (c > m) {
      rgb[channel] = m * ((max - c) / (max - m));
    } else {
      rgb[channel] = (max * (m - c) + (m * c)) / m;
    }
  }
  return ("rgb(" + (rgb.r) + ", " + (rgb.g) + ", " + (rgb.b) + ")");
};
Sai.data = (typeof (_c = Sai.data) !== "undefined" && _c !== null) ? Sai.data : {};
Sai.data.map = (typeof (_d = Sai.data.map) !== "undefined" && _d !== null) ? Sai.data.map : {};
Raphael.fn.sai = (typeof (_e = Raphael.fn.sai) !== "undefined" && _e !== null) ? Raphael.fn.sai : {};
Raphael.fn.sai.chart = function(x, y, w, h, type, data) {
  var chart;
  type = ({
    'line': Sai.LineChart
  })[type] || type;
  type = (typeof type !== "undefined" && type !== null) ? type : Sai.Chart;
  chart = new type(this, x, y, w, h, data);
  return chart.render();
};