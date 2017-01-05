/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var rxu = require('rxu'), eq = require('assert').deepStrictEqual;

function catchErr(provo, expect) {
  try { return provo(); } catch (err) { provo = err; }
  if (expect && String(provo).match(expect)) { return expect; }
  throw provo;
}


(function test_args2match() {
  var rx = /^Error: Property \.input missing\b[\S\s]* might be replacer/i;

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

}());















/*scroll*/
