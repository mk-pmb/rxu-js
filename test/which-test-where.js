/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';


var EX = module.exports,
  readmd = require('read-resolved-file-sync')(require, '../README.md');

readmd.replace(/\n#+ (rxu[ -\uFFFF]+)/g, function (fn, hl) {
  fn = hl.replace(/\.js\)$/, '').split(/\(test\//)[1];
  var oldFuncs = (EX[fn] || []);
  hl = hl.split(/\s+\&nbsp;/)[0].replace(/\), /g, ')\n').split(/\n/);
  EX[fn] = oldFuncs.concat(hl);
});


if (require.main === module) {
  Object.keys(EX).sort().forEach(function (fn) {
    console.log((fn + '             ').substr(0, 12) + EX[fn].join('\t'));
  });
}
