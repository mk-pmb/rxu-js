/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

//##### BEGIN short helper funcs #####//
function identity(x) { return x; }
function isStr(x) { return ((typeof x) === 'string'); }
function isNum(x) { return ((typeof x) === 'number'); }
function isRgx(x) { return (x instanceof RegExp); }
function isArr(x) { return (x instanceof Array); }
function isFunc(x) { return (x instanceof Function); }
//##### ENDOF short helper funcs #####//


//##### BEGIN official API #####//

function rxu(rgx, text) {
  var match;
  if (arguments.length === 1) {
    switch (rgx && typeof rgx) {
    case '':
    case 'string':
    case 'number':
      rgx = rxu.cache[rgx];
      if (isFunc(rgx)) { rgx = rgx(); }
      return rgx;
    case null:
      rxu.cache = false;
      return;
    case 'object':    // probably RegExp or Array of RegExp parts
      break;
    default:
      throw new Error('Unsupported slotname rxu("' + String(rgx) + '")');
    }
  }
  if (isArr(rgx)) { rgx = rxu.join(rgx); }
  match = String(text).match(rgx);
  if (!match) { return false; }
  rxu.contextSlots(match, text);
  rxu.cache = match;
  return match;
}

rxu.quotemeta = function (text) {
  return String(text).replace(rxu.rgxMagicChars, '\\$1');
};
rxu.rgxMagicChars = /([\!\#\$\(\)\*\+\-\.\/\?\[\\\]\^\{\|\}\s\n])/g;

rxu.replacer = function (rWhat, rWith) {
  return function (text) { return String(text).replace(rWhat, rWith); };
};

rxu.ifMatch = function rxu_ifMatch(text, rgx, thenFunc, elseFunc) {
  var match = rgx.exec(text);
  rxu_ifMatch.m = (match || false);
  return (match ? (thenFunc ? thenFunc(match, text) : match)
                : (elseFunc ? elseFunc(text)        : false));
};

rxu.body = function rxu_body(rx) {
  if (!rx) { return ''; }
  rx = rxu.body.raw(rx);
  if (rx === '(?:)') { return ''; }
  rx = rx.replace(/\n|\r/g, rxu.jsonquot);    // upgrade ES3+4 to ES5
  return rx;
};

rxu.flags = function rxu_flags(rx) {
  if (!isRgx(rx)) { return ''; }
  if (isStr(rx.flags)) { return rx.flags; }
  rx = String(rx);
  return rx.substr(rx.lastIndexOf('/') + 1, rx.length);
};

rxu.join = function rxu_join(rxs, flags) {
  if (isStr(rxs)) { return rxs; }
  if (isRgx(rxs)) { return rxu.body(rxs); }
  if (isArr(rxs)) { return new RegExp(rxs.map(rxu_join).join(''), flags); }
  throw new Error('Expected array of {RegExp|string} as arg 1');
};

rxu.end = function (m) {
  if (!m) { rxu.args2match.hint(null, m); }
  if (!isStr(m[0])) { rxu.args2match.hint(0, m); }
  if (!isNum(m.index)) { rxu.args2match.hint('index', m); }
  return (m.index + m[0].length);
};

rxu.before = function (m) {
  if (!m) { rxu.args2match.hint(null, m); }
  if (!isStr(m.input)) { rxu.args2match.hint('input', m); }
  if (!isNum(m.index)) { rxu.args2match.hint('index', m); }
  return m.input.slice(0, m.index);
};

rxu.after = function (m) {
  if (!m) { rxu.args2match.hint(null, m); }
  if (!isStr(m.input)) { rxu.args2match.hint('input', m); }
  if (!isStr(m[0])) { rxu.args2match.hint(0, m); }
  if (!isNum(m.index)) { rxu.args2match.hint('index', m); }
  return m.input.slice(m.index + m[0].length, m.input.length);
};

rxu.contextSlots = function (m) {
  m['@'] = m.index;
  m.end = m.index + m[0].length;
  m['*'] = function () { return m.input; };
  m['<'] = m.before = rxu.before.bind(null, m);
  m['>'] = m.after = rxu.after.bind(null, m);
  return m;
};

rxu.args2match = function (args) {
  if (!rxu.args2match.maybe(args)) {
    throw new Error("That doesn't look like replacer arguments: " +
      String(args) + (args instanceof Object ? JSON.stringify(args) : ''));
  }
  args = Array.prototype.slice.call(args);
  args.input = args.pop();
  args.index = args.pop();
  return args;
};

rxu.args2match.maybe = function (obj) {
  return Boolean(obj
    && isNum(obj.length)
    && isNum(obj[obj.length - 2])
    && isStr(obj[obj.length - 1])
    && isStr(obj[0]));
};



//##### ENDOF official API #####//






//##### BEGIN internal utility funcs #####//


rxu.jsonquot = function (x) {
  x = JSON.stringify(String(x));
  return x.substr(1, x.length - 2);
};

rxu.body.raw = function (rx, body) {
  if (!isRgx(rx)) { return String(rx); }
  body = rx.source;
  if (isStr(body)) { return body; }
  return String(rx).replace(/^\//, '').replace(/\/[a-z]*$/, '');
};

rxu.args2match.hint = function (prop, obj) {
  var value = (prop ? obj[prop] : obj);
  prop = (prop ? ('Property ' + (isNum(prop) ? '[' + prop + ']' : '.' + prop
                  ) + ' missing or of wrong type, value: ')
               : 'Expected a match result object but got ');
  prop += (isStr(value) ? JSON.stringify(value) : String(value));
  if (rxu.args2match.maybe(obj)) {
    prop += '; Is that really a regexp match object?' +
      ' It looks like it might be replacer function arguments.';
  }
  throw new Error(prop);
};



















//##### ENDOF internal utility funcs #####//

module.exports = rxu;
