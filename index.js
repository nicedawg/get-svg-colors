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
    let rgb = str.replace(/[^\d,]/g, '').split(',');
    return chroma(str);
  }
  return isColorString(str) ? chroma(str) : null
}

module.exports = function getSvgColors(input, options) {

  // load svg in a way that we can query it for attributes
  let parser = new DOMParser();
  let doc = parser.parseFromString(input, "image/svg+xml");

  let elements = [];

  // Find elements with a `fill` attribute
  let fills = [];
  elements = doc.querySelectorAll('[fill]');
  for (let i = 0; i < elements.length; i++) {
    let fill = color(elements[i].getAttribute('fill'));
    if (fill) {
      fills.push(fill.hex());
    }
  }

  let strokes = [];
  elements = doc.querySelectorAll('[stroke]');
  for (let i = 0; i < elements.length; i++) {
    let stroke = color(elements[i].getAttribute('stroke'));
    if (stroke) {
      strokes.push(stroke.hex());
    }
  }

  // Find `fill` and `stroke` within inline styles
  elements = doc.querySelectorAll('[style]');
  for (let i = 0; i < elements.length; i++) {
    let fill = color(elements[i].style.fill);
    if (fill) {
      fills.push(fill.hex());
    }

    let stroke = color(elements[i].style.stroke);
    if (stroke) {
      strokes.push(stroke.hex());
    }
  }

  // Find elements with a `stop-color` attribute (gradients)
  let stops = [];
  elements = doc.querySelectorAll('[stop-color]');
  for (let i = 0; i < elements.length; i++) {
    let stopColor = color(elements[i].getAttribute('stop-color'));
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
