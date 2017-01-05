/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var rxu = require('rxu'), eq = require('assert').deepStrictEqual;

(function bodiesAndFlags() {
  var rx;

  rx = /^hello\s(\brave |\new )*world$/mi;
  eq([rxu.body(rx),                         rxu.flags(rx)],
     ["^hello\\s(\\brave |\\new )*world$",  'im']);
  // Wonder about the flags re-ordering?
  eq(String(rx).substr(-3), '/im');

  rx = new RegExp('', 'gi');
  eq([rxu.body(rx), rxu.flags(rx)],
     ['',           'gi']);

  rx = /(?:)/m;
  eq([rxu.body(rx), rxu.flags(rx)],
     ['',           'm']);

}());

(function joins() {
  var parts = [ /^hello\s/, '(',
    /\brave |/,
    /\new /,
    ')*', /world$/ ],
    tx = 'Hello rave \new world';

  eq(rxu.join(parts, 'mi'), /^hello\s(\brave |\new )*world$/mi);

  // Is it still an array?
  eq((Array.isArray(parts) ? 'array' : parts), 'array');
  // What happens if we put that array directly into rxu()?
  eq(rxu(parts, tx) && 'matched', false);

  // Right, auto-combine has no idea of that i flag above.
  tx = tx.toLowerCase();
  eq(rxu(parts, tx) && 'matched', 'matched');
  eq(rxu('1'), '\new ');
  eq(rxu('end'), tx.length);
  eq(rxu('>'), '');

}());














/*scroll*/
