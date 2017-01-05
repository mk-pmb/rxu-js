/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var rxu = require('rxu'), eq = require('assert').deepStrictEqual;

(function replaceStuff(tx, r) {

  r = rxu.replacer(/([A-Z])([a-z])/g, '$2$1');
  tx =   [ 'HelLo', 'bRavE', 'neW', 'worlD' ].map(r);
  eq(tx, [ 'eHloL', 'baRvE', 'neW', 'worlD' ]);

  r = rxu.replacer(/[aeiou]/ig, '#');
  tx =   [ 'HelLo', 'bRavE', 'neW', 'worlD' ].map(r);
  eq(tx, [ 'H#lL#', 'bR#v#', 'n#W', 'w#rlD' ]);

}());














/*scroll*/
