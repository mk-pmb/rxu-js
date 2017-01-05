/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';


var objToStr = Function.call.bind(Object.prototype.toString),
  isArr = Array.isArray.bind(Array);

function identity(x) { return x; }
function isStr(x) { return ((typeof x) === 'string'); }
function isNum(x) { return ((typeof x) === 'number'); }
function isRgx(x) { return (objToStr(x) === '[object RegExp]'); }
function isObj(x) { return ((x && typeof x) === 'object'); }
function isFunc(x) { return ((typeof x) === 'function'); }

function stubErr(feature) {
  throw new Error("Stub: This version of rxu doesn't implement " +
    feature + ' yet.');
}


//##### BEGIN official API #####//

function rxu(rgx, text) {
  var match;
  if (arguments.length === 1) {
    switch (rgx && typeof rgx) {
    case '':
    case 0:
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
    case 'function':
      return rxu.wrapAugmentReplacer(rgx);
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


rxu.wrapAugmentReplacer = function rxu_wrapAugmentReplacer(rpl, opt, memo) {
  var aug = function () {
    return rxu.wrapAugmentReplacer.aug(aug.opt, aug.memo, rpl, arguments);
  };
  aug.opt = (isObj(opt) ? opt : { cnt: 0 });
  aug.memo = (isObj(memo) ? memo : {});
  return aug;
};
rxu.wrapAugmentReplacer.aug = function (opt, memo, rpl, args) {
  var m = args[0], origText = (isStr(m) ? m : m[0]);
  if (isNum(opt.limit) && (opt.cnt >= opt.limit)) { return origText; }
  if (isStr(m)) { m = rxu.args2match(args); }
  rxu.contextSlots(m);
  m.memo = memo;
  m.opt = opt;
  m = rpl(m);
  opt.cnt = +(opt.cnt || 0) + 1;
            // ^-- don't use a cached value: rpl might have changed it.
  if (m === undefined) { m = m.opt.undef; }
  if (m === undefined) { m = origText; }
  return m;
};


rxu.isRx = isRgx;


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
  return rx.slice(rx.lastIndexOf('/') + 1);
};

rxu.join = function rxu_join(rxs, flags, wash) {
  if (isRgx(rxs)) { rxs = rxu.body(rxs); }
  if (isStr(rxs)) { return (isFunc(wash) ? wash(rxs) : rxs); }
  if (isArr(rxs)) {
    return new RegExp(rxs.map(function (pt) { return rxu_join(pt, '', wash); }
      ).join(''), flags);
  }
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

rxu.grp = function (m, g) {
  if (!m) { rxu.args2match.hint(null, m); }
  if (!isStr(m.input)) { rxu.args2match.hint('input', m); }
  if (!isNum(m.index)) { rxu.args2match.hint('index', m); }
  if (!isNum(m.length)) { rxu.args2match.hint('length', m); }
  switch (typeof g) {
  case 'number':
    g %= m.length;
    if (g < 0) { g += m.length; }
    return m[g];
  case 'string':
    return stubErr('named match groups');
  }
  throw new Error('unsupported group spec type: ' + String(g && typeof g));
};

rxu.contextSlots = function (m) {
  m['@'] = m.index;
  m.end = m.index + m[0].length;
  m['*'] = function () { return m.input; };
  m['<'] = m.before = rxu.before.bind(null, m);
  m['>'] = m.after = rxu.after.bind(null, m);
  ['fmt', 'grp'
    ].map(function (funcName) { m[funcName] = rxu[funcName].bind(null, m); });
  return m;
};



rxu.args2match = function (args) {
  if (!rxu.args2match.maybe(args)) {
    throw new Error("That doesn't look like replacer arguments: " +
      String(args) + (isObj(args) ? JSON.stringify(args) : ''));
  }
  args = Array.prototype.slice.call(args);
  args.input = args.pop();
  args.index = args.pop();
  return args;
};

rxu.args2match.maybe = function (obj) {
  /* We could do even better guessing based on .callee ∈ {Function} and
        String(arguments) === '[object Arguments]'
     in mordern engines (NodeJS 5.x, Firefox 48) and the deprecated
     .caller ∈ {Function} in old engines (MSIE 6), to an extent that
     we can reliably decide to automagically call args2match… but why
     invest the effort when you'll want to use rxu.s() anyway. :-)
  */
  return Boolean(obj
    && isNum(obj.length)
    && isNum(obj[obj.length - 2])
    && isStr(obj[obj.length - 1])
    && isStr(obj[0]));
};


rxu.fmt = stubErr.bind(null, '.fmt()');










//##### ENDOF official API #####//






//##### BEGIN internal utility funcs #####//


rxu.jsonquot = function (x) { return JSON.stringify(String(x)).slice(1, -1); };

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
