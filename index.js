const uniq = require('lodash.uniq')
const compact = require('lodash.compact')
const chroma = require('chroma-js')
const hexy = /^#[0-9a-f]{3,6}$/i

function isColorString(str) {
  if (!str) return false
  if (str === 'none') return false
  return (str.length === 4 || str.length === 7) && str.match(hexy)
}

function color(str) {
  if (str.startsWith("rgb")) {
    var rgb = str.replace(/[^\d,]/g, '').split(',');
    return chroma(str);
  }
  return isColorString(str) ? chroma(str) : null
}

module.exports = function getSvgColors(input, options) {

  // load svg in a way that we can query it for attributes
  var parser = new DOMParser();
  var doc = parser.parseFromString(input, "image/svg+xml");

  var elements = [];

  // Find elements with a `fill` attribute
  var fills = [];
  elements = doc.querySelectorAll('[fill]');
  for (var i = 0; i < elements.length; i++) {
    var fill = color(elements[i].getAttribute('fill'));
    if (fill) {
      fills.push(fill.hex());
    }
  }

  var strokes = [];
  elements = doc.querySelectorAll('[stroke]');
  for (var i = 0; i < elements.length; i++) {
    var stroke = color(elements[i].getAttribute('stroke'));
    if (stroke) {
      strokes.push(stroke.hex());
    }
  }

  // Find `fill` and `stroke` within inline styles
  elements = doc.querySelectorAll('[style]');
  for (var i = 0; i < elements.length; i++) {
    if (!elements[i].style) {
      continue;
    }
    var fill = color(elements[i].style.fill);
    if (fill) {
      fills.push(fill.hex());
    }

    var stroke = color(elements[i].style.stroke);
    if (stroke) {
      strokes.push(stroke.hex());
    }
  }

  // Find elements with a `stop-color` attribute (gradients)
  var stops = [];
  elements = doc.querySelectorAll('[stop-color]');
  for (var i = 0; i < elements.length; i++) {
    var stopColor = color(elements[i].getAttribute('stop-color'));
    if (stopColor) {
      stops.push(stopColor.hex());
    }
  }

  if (options && options.flat) {
    return compact(uniq(fills.concat(strokes).concat(stops)));
  }

  return {
    fills: compact(uniq(fills)),
    strokes: compact(uniq(strokes)),
    stops: compact(uniq(stops))
  }
}
