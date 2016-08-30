/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

function catchErr(provo, expect) {
  try { return provo(); } catch (err) { provo = err; }
  if (expect && String(provo).match(expect)) { return expect; }
  throw provo;
}


var rxu = require('rxu'), eq = require('assert').deepStrictEqual, rx, tx, m;

tx = 'Hello brave new world!';
m = rxu(/(brave|new)/, tx);
eq(m[1], 'brave');
eq(m[2], undefined);
eq(m.index, 6);
eq(m.input, tx);
eq(m.end, 11);
eq(m.end, rxu.end(m));

eq(m.before(),  'Hello ');
eq(m.before(),  m['<']());
eq(m.before(),  rxu.before(m));

eq(m.after(),   ' new world!');
eq(m.after(),   m['>']());
eq(m.after(),   rxu.after(m));

// check whether we can retrieve all these facts from the cache, too:
'0 1 2 3 * < > @'.replace(/\S/, function (prop) { eq(m[prop], rxu(prop)); });

eq(m.index,     rxu('@'));
eq(m.end,       rxu('end'));
eq(m.before(),  rxu('<'));
eq(m.before(),  rxu('before'));
eq(m.after(),   rxu('>'));
eq(m.after(),   rxu('after'));


m = rxu(/[0-9]/, 'Hello brave new world!');
eq(m[0], undefined);
eq(m, false);

// Since it didn't match, the cache should still have the old data:
eq(rxu('<'), 'Hello ');

// Clear the cache.
rxu(null);
eq(rxu('<'), undefined);


// quotemeta

tx = "<(^_^<)  |-|e/_/_( )??  {{$..$}}  [*_+_*]";
rx = new RegExp(tx);
eq(tx.match(rx)[0], '-');
rx = new RegExp(rxu.quotemeta(tx));
eq(tx.match(rx)[0], tx);


// replacer

m = rxu.replacer(/([A-Z])([a-z])/g, '$2$1');
tx =   [ 'HelLo', 'bRavE', 'neW', 'worlD' ].map(m);
eq(tx, [ 'eHloL', 'baRvE', 'neW', 'worlD' ]);

m = rxu.replacer(/[aeiou]/ig, '#');
tx =   [ 'HelLo', 'bRavE', 'neW', 'worlD' ].map(m);
eq(tx, [ 'H#lL#', 'bR#v#', 'n#W', 'w#rlD' ]);


// ifMatch
rx = /r\w+/;
tx = { lc: 'dlrow olleh', UC: 'DLROW OLLEH' };
eq(rxu.ifMatch(tx.lc, rx)[0], 'row');
eq(rxu.ifMatch(tx.UC, rx), false);

tx.matched = function (a, b) { return ['+', a && a[0], b && b.length]; };
tx.noMatch = function (x, y) { return ['-', x && x[0], y && y.length]; };
tx.avoidMe = function () { throw new Error("shouln't have been called"); };

eq(rxu.ifMatch(tx.lc, rx, null, null)[0], 'row');
eq(rxu.ifMatch(tx.UC, rx, null, null), false);

eq(rxu.ifMatch(tx.lc, rx, null, tx.avoidMe)[0], 'row');
eq(rxu.ifMatch(tx.UC, rx, tx.avoidMe, null), false);

eq(rxu.ifMatch(tx.lc, rx, tx.matched, tx.avoidMe), ['+', 'row', 11]);
eq(rxu.ifMatch(tx.UC, rx, tx.avoidMe, tx.noMatch), ['-', 'D', undefined]);



// Bodies and flags…

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


// .join()

rx = [ /^hello\s/, '(',
  /\brave |/,
  /\new /,
  ')*', /world$/ ];
eq(rxu.join(rx, 'mi'), /^hello\s(\brave |\new )*world$/mi);

// Let's test that array…
eq((rx instanceof Array ? 'array' : rx), 'array');
// … with rxu():
tx = 'Hello rave \new world';
eq(rxu(rx, tx) && 'matched', false);

// Right, auto-combine has no idea of that i flag above.
tx = tx.toLowerCase();
eq(rxu(rx, tx) && 'matched', 'matched');
eq(rxu('1'), '\new ');
eq(rxu('end'), tx.length);
eq(rxu('>'), '');


// args2match

rx = /^Error: Property \.input missing\b[\S\s]* might be replacer/i;
eq(catchErr(function () {
  return 'hello'.replace(/e/, function () {
    var match = arguments;
    return ':' + rxu.after(match) + '_';
  });
}, rx), rx);

eq(catchErr(function () {
  return 'hello'.replace(/e/, function () {
    var match = rxu.args2match(arguments);
    return ':.' + rxu.after(match) + '.:';
  });
}), 'h:.llo.:llo');

rx = /^Error: That doesn't look like replacer/i;
eq(catchErr(function () { rxu.args2match(arguments); }, rx), rx);














console.log('+OK All tests passed.');
