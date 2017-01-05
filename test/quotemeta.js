/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var rxu = require('rxu'), eq = require('assert').deepStrictEqual;

(function emoticons() {

  var tx = "<(^_^<)  |-|e/_/_( )??  {{$..$}}  [*_+_*]", rx;

  rx = new RegExp(tx);
  eq(tx.match(rx)[0], '-');

  rx = new RegExp(rxu.quotemeta(tx));
  eq(tx.match(rx)[0], tx);

}());














/*scroll*/
