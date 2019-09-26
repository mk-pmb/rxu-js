/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var rxu = require('rxu'), eq = require('assert').deepStrictEqual;

function asso(x, y) { return Object.assign({}, x, y); }

(function bodiesAndFlags() {
  function chk(rx, ok) {
    eq([rxu.body(rx), rxu.flags(rx)], [ok.body, ok.flags]);
    var parts = rxu.splitBodyAndFlags(rx), compiled;
    eq(asso(parts), ok);
    if (rx.substr) {
      compiled = rxu.compile(rx);
      eq(rxu.isRx(compiled), true);
      compiled.parts = rxu.splitBodyAndFlags(compiled);
      eq(asso(compiled.parts), asso(ok, { delim: '/' }));
    }
  }

  chk(/^hello\s(\brave |\new )*world$/mi,
    { body: "^hello\\s(\\brave |\\new )*world$", flags: 'im', delim: '/' });
  // Wonder about the flags re-ordering?
  eq(String(/mi/mi).slice(-3), '/im');

  chk(new RegExp('', 'gi'), { delim: '/', body: '', flags: 'gi' });
  chk(/(?:)/m, { delim: '/', body: '', flags: 'm' });
  chk('/(?:)/m', { delim: '/', body: '', flags: 'm' });
  chk(':(?:):m', { delim: ':', body: '', flags: 'm' });
  chk('~~~~', { delim: '~', body: '~~', flags: '' });
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
