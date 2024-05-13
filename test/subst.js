/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var rxu = require('rxu'), eq = require('assert').deepStrictEqual;

(function replaceStuff(r, i, w) {

  r = rxu.s(/[aeiou]/ig, '#');
  i =   [ 'HelLo', 'bRavE', 'neW', 'worlD' ].map(r);
  eq(i, [ 'H#lL#', 'bR#v#', 'n#W', 'w#rlD' ]);

  r = rxu.s(/[aeiou]/ig, '#', { limit: 3 });
  i =   [ 'HelLo', 'bRavE', 'neW', 'worlD' ].map(r);
  eq(i, [ 'H#lL#', 'bR#vE', 'neW', 'worlD' ]);

  i = 'foo bar qux yay wat lul';
  w = 'foo:bar:qux:yay wat lul';
  eq(rxu.s(/ /ig, ':', { limit: 3 }, i), w);


}());









console.warn('W: too few tests in', module.filename.replace(/^\S+\//, ''));

/*scroll*/
