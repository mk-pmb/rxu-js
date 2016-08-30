/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var EX = module.exports;

EX.id = function identity(x) { return x; };

EX.ifMatch = function rxu_ifMatch(text, rgx, thenFunc, elseFunc) {
  var match = rgx.exec(text);
  rxu_ifMatch.m = (match || false);
  return (match ? (thenFunc ? thenFunc(match, text) : match)
                : (elseFunc ? elseFunc(text) : false));
};
