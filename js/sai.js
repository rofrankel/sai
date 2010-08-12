Sai = {};;
Sai.util = {};
Sai.imagePath = (typeof Sai.imagePath !== "undefined" && Sai.imagePath !== null) ? Sai.imagePath : '/static/images/sai/';
Sai.util.roundToMag = function(x, mag) {
  var target;
  mag = (typeof mag !== "undefined" && mag !== null) ? mag : 0;
  target = Math.pow(10, mag);
  return parseFloat((Math.round(x / target) * target).toFixed(Math.max(0, mag)));
};
Sai.util.round = function(x, target) {
  return parseFloat((Math.round(x / target) * target).toFixed(Math.max(0, Math.ceil(-1 * Math.log(target) / Math.LN10))));
};
Sai.util.sumArray = function(a) {
  var _a, i, sum;
  sum = 0;
  _a = a.length;
  for (i = 0; (0 <= _a ? i < _a : i > _a); (0 <= _a ? i += 1 : i -= 1)) {
    sum += typeof a[i] === 'number' ? a[i] : 0;
  }
  return sum;
};
Sai.util.prettystr = function(x, precision) {
  var suffix;
  precision = (typeof precision !== "undefined" && precision !== null) ? precision : 2;
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
      return String(parseFloat(x.toFixed(precision)));
    }
    return parseFloat(x.toFixed(1)) + suffix;
  }
  return x;
};
Sai.util.prettynum = function(num) {
  var rgx;
  if (isNaN(parseFloat(num))) {
    return undefined;
  }
  num = String(num).split('.');
  rgx = /(\d+)(\d{3})/;
  while (rgx.test(num[0])) {
    num[0] = num[0].replace(rgx, '$1,$2');
  }
  if (num.length > 1 && false) {
    alert(num[1]);
    alert("bbb" + parseFloat("0." + num[1]).toFixed(2).slice(1));
  }
  return num[0] + (num.length > 1 ? parseFloat("0." + num[1]).toFixed(2).slice(1) : '');
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
Sai.util.transformCoords = function(evt, canvas) {
  var svgPoint, xformed;
  if (canvas.getScreenCTM) {
    svgPoint = canvas.createSVGPoint();
    svgPoint.x = evt.clientX;
    svgPoint.y = evt.clientY;
    xformed = svgPoint.matrixTransform(canvas.getScreenCTM().inverse());
    if (navigator.userAgent.toLowerCase().indexOf('chrome') !== -1 || navigator.userAgent.toLowerCase().indexOf('safari') !== -1) {
      xformed.x += document.body.scrollLeft;
    };
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
    str: ("rgb(" + (r) + ", " + (g) + ", " + (b) + ")")
  };
};
Sai.util.reflectColor = function(color, mirror) {
  var _a, _b, _c, c, channel, crgb, m, max, mrgb, rgb;
  max = 255;
  crgb = Raphael.getRGB(color);
  mrgb = Raphael.getRGB(mirror);
  rgb = {};
  _b = ['r', 'g', 'b'];
  for (_a = 0, _c = _b.length; _a < _c; _a++) {
    channel = _b[_a];
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
Sai.data = (typeof Sai.data !== "undefined" && Sai.data !== null) ? Sai.data : {};
Sai.data.map = (typeof Sai.data.map !== "undefined" && Sai.data.map !== null) ? Sai.data.map : {};
Raphael.fn.sai = (typeof Raphael.fn.sai !== "undefined" && Raphael.fn.sai !== null) ? Raphael.fn.sai : {};
Raphael.fn.sai.chart = function(x, y, w, h, type, data) {
  var chart;
  type = (typeof (({
    'line': Sai.LineChart
  })[type]) !== "undefined" && (({
    'line': Sai.LineChart
  })[type]) !== null) ? (({
    'line': Sai.LineChart
  })[type]) : type;
  type = (typeof type !== "undefined" && type !== null) ? type : Sai.Chart;
  chart = new type(this, x, y, w, h, data);
  return chart.render();
};