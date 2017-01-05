/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var rxu = require('rxu'), eq = require('assert').deepStrictEqual;

(function () {
  var rx = /r\w+/, lower = 'dlrow olleh', upper = 'DLROW OLLEH';

  eq(rxu.ifMatch(lower, rx)[0], 'row');
  eq(rxu.ifMatch(upper, rx), false);

  function matched(a, b) { return ['+', a && a[0], b && b.length]; }
  function noMatch(x, y) { return ['-', x && x[0], y && y.length]; }
  function avoidMe() { throw new Error("I shouln't have been called"); }

  eq(rxu.ifMatch(lower, rx, null, null)[0], 'row');
  eq(rxu.ifMatch(upper, rx, null, null), false);

  eq(rxu.ifMatch(lower, rx, null, avoidMe)[0], 'row');
  eq(rxu.ifMatch(upper, rx, avoidMe, null), false);

  eq(rxu.ifMatch(lower, rx, matched, avoidMe), ['+', 'row', 11]);
  eq(rxu.ifMatch(upper, rx, avoidMe, noMatch), ['-', 'D', undefined]);

}());














/*scroll*/
