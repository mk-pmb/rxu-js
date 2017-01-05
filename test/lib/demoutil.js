/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var D = console.log.bind(console);
module.exports = D;

D.expectThrow = function (provo, expect) {
  try { return provo(); } catch (err) { provo = err; }
  if (expect && String(provo).match(expect)) { return expect; }
  throw provo;
};

