/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var rxu = require('rxu'), eq = require('assert').deepStrictEqual;

(function braveOrNew() {
  var text = 'Hello brave new world!', rx, m;

  rx = /(brave|new)/;
  m = rxu(rx, text);

  eq(m[1], 'brave');
  eq(m[2], undefined);
  eq(m.index, 6);
  eq(m.input, text);
  eq(m.end, 11);
  eq(m.end, rxu.end(m));

  eq(m.before(),  'Hello ');
  eq(m.before(),  m['<']());
  eq(m.before(),  rxu.before(m));

  eq(m.after(),   ' new world!');
  eq(m.after(),   m['>']());
  eq(m.after(),   rxu.after(m));

  // check whether we can retrieve all these facts from the cache, too:
  '0 1 2 3 * < > @'.replace(/\S/, function (prop) {
    eq(m[prop], rxu(prop));
  });

  eq(m.index,     rxu('@'));
  eq(m.end,       rxu('end'));
  eq(m.before(),  rxu('<'));
  eq(m.before(),  rxu('before'));
  eq(m.after(),   rxu('>'));
  eq(m.after(),   rxu('after'));

}());


(function mismatch() {

  var m = rxu(/[0-9]/, 'Hello brave new world!');
  eq(m[0], undefined);
  eq(m, false);

  // Since it didn't match, the cache should still have the old data:
  eq(rxu('<'), 'Hello ');

}());


(function clearCache() {

  rxu(null);
  eq(rxu('<'), undefined);

}());














/*scroll*/
