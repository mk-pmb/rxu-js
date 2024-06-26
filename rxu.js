﻿/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
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


function complainFalseyError(e) {
  if (e) { return e; }
  e = 'Caught a false-y error: ' + (typeof e) + ' "' + e + '"';
  return new TypeError(e);
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
  if (!isFunc(rpl)) { rpl = String(rpl); }
  var aug = function wrappedAugmentedReplacer() {
    return rxu.wrapAugmentReplacer.aug(aug.opt, aug.memo, rpl, arguments);
  };
  aug.opt = (isObj(opt) ? opt : { cnt: 0 });
  aug.memo = (isObj(memo) ? memo : {});
  return aug;
};
rxu.wrapAugmentReplacer.aug = function aug(opt, memo, rpl, args) {
  var m = args[0], origText = (isStr(m) ? m : m[0]);
  if (isNum(opt.limit) && (opt.cnt >= opt.limit)) { return origText; }
  if (isStr(m)) { m = rxu.args2match(args); }
  rxu.contextSlots(m);
  m.memo = memo;
  m.opt = opt;
  m = (rpl.call ? rpl(m) : rpl);
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
  return function subst(input) { return String(input).replace(rWhat, rWith); };
};


rxu.s = function makeSubstFunc(pattern, better, opt, text) {
  if (isObj(better)) {
    text = opt;
    opt = better;
    better = undefined;
  }
  if (!opt) { opt = {}; }
  if (isStr(pattern)) {
    pattern = new RegExp('(' + rxu.quotemeta(pattern) + ')',
      (isStr(opt.flags) ? opt.flags : 'sg'));
  }
  var backupProps = false, subst;
  if (isFunc(better) && isObj(better.opt) && isObj(better.memo)) {
    // could be wrapped already
    if (opt !== true) { backupProps = true; }
  } else {
    better = rxu.wrapAugmentReplacer(better, opt);
  }
  subst = rxu.replacer(pattern, better);
  if (backupProps) { subst = rxu.s.makeBackupWrapper(subst, opt); }
  if (text === undefined) { return subst; }
  return subst(text);
};
rxu.s.makeBackupWrapper = function rxu_s_makeBackupWrapper(origSubst, opt) {
  function subst(text) {
    var result, err, origOpt, origMemo;
    origOpt = origSubst.opt;
    origSubst.opt = opt;
    origMemo = origSubst.memo;
    origSubst.memo = {};
    try {
      result = origSubst(text);
    } catch (caught) {
      err = complainFalseyError(caught);
    }
    origSubst.opt = origOpt;
    origSubst.memo = origMemo;
    if (err) { throw err; }
    return result;
  }
  return subst;
};


rxu.ifMatch = function rxu_ifMatch(text, rgx, thenFunc, elseFunc) {
  var match = rgx.exec(text);
  rxu_ifMatch.m = (match || false);
  return (match ? (thenFunc ? thenFunc(match, text) : match)
                : (elseFunc ? elseFunc(text)        : false));
};

rxu.body = function rxu_body(rx) {
  if (!rx) { return ''; }
  rx = rxu.cleanupBody(rxu.body.raw(rx));
  rx = rx.replace(/\n|\r/g, rxu.jsonquot);    // upgrade ES3+4 to ES5
  return rx;
};

rxu.flags = function rxu_flags(rx) {
  if (isRgx(rx)) {
    if (isStr(rx.flags)) { return rx.flags; } // <-- MSIE 6: not supported
  }
  return rxu.splitBodyAndFlags(rx).flags;
};


rxu.splitBodyAndFlags = function (rx) {
  rx = String(rx);
  var delim = (/^\W/.exec(rx) || false)[0], end, Parts = rxu.RxParts;
  if (!delim) {
    throw new Error('Unsupported regexp delimiter: ' + rx.slice(0, 1));
  }
  end = rx.lastIndexOf(delim);
  return new Parts(delim, rx.slice(1, end), rx.slice(end + 1));
};


rxu.compile = function (rx) { return rxu.splitBodyAndFlags(rx).compile(); };


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

rxu.body.raw = function (rx) {
  if (isRgx(rx) && rx.source) { return rx.source; } // <-- MSIE 6: supported!
  return rxu.splitBodyAndFlags(rx).body;
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

rxu.cleanupBody = function (b) {
  b = b.replace(/^(?:\(\?:\))+/g, '');
  b = b.replace(/(?:\(\?:\))+$/g, '');
  return b;
};

rxu.RxParts = function RxParts(d, b, f) {
  this.delim = d;
  this.body = rxu.cleanupBody(b);
  this.flags = f;
};

rxu.RxParts.prototype.compile = function compileRxParts() {
  return new RegExp(this.body, this.flags);
};



















//##### ENDOF internal utility funcs #####//

module.exports = rxu;
