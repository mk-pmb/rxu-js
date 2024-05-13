
<!--#echo json="package.json" key="name" underline="=" -->
rxu
===
<!--/#echo -->

<!--#echo json="package.json" key="description" -->
misc regexp utils.
<!--/#echo -->

They're meant to increase code expressiveness and to help detect bugs.
To achieve this, many functions contain sanity checks on their arguments,
which will have a performance cost. If you want your RegExp action to run
at maximum speed, use [`rxu.js`](rxu.js) only as a collection of code
recipes that you copy and hard-wire in your program.



API
---
For examples see each function's [☂ tests](test/).

<!--#toc cap-end=" &amp;nbsp;&#0;, rxu." -->
  * [rxu(rgx, text)](#toc-rxu-rgx-text)
  * [rxu(slot)](#toc-rxu-slot)
  * [rxu(null)](#toc-rxu-null)
  * [rxu(func)](#toc-rxu-func)
  * [rxu.wrapAugmentReplacer(string | undefined | regexp)](#toc-rxu-wrapaugmentreplacer-string-undefined-regexp)
  * [rxu.s(pattern&#x5B;, better&#x5D;&#x5B;, opt&#x5D;&#x5B;, text&#x5D;)](#toc-rxu-s-pattern-better-opt-text)
  * [rxu.isRx(thing)](#toc-rxu-isrx-thing)
  * [rxu.quotemeta(text)](#toc-rxu-quotemeta-text)
  * [rxu.replacer(rWhat, rWith)](#toc-rxu-replacer-rwhat-rwith)
  * [rxu.ifMatch(text, rgx, thenFunc, elseFunc)](#toc-rxu-ifmatch-text-rgx-thenfunc-elsefunc)
  * [rxu.body(rx)](#toc-rxu-body-rx)
  * [rxu.splitBodyAndFlags(rx)](#toc-rxu-splitbodyandflags-rx)
  * [rxu.compile(rx)](#toc-rxu-compile-rx)
  * [rxu.join(rxs, flags&#x5B;, wash&#x5D;)](#toc-rxu-join-rxs-flags-wash)
  * [rxu.end(m)](#toc-rxu-end-m)
  * [rxu.contextSlots(m)](#toc-rxu-contextslots-m)
  * [rxu.args2match(arguments)](#toc-rxu-args2match-arguments)

<!--/#toc -->


<a class="readme-ssi-toc-target" id="toc-rxu-rgx-text" name="toc-rxu-rgx-text"></a>
### rxu(rgx, text) &nbsp; &nbsp; [☂](test/match.js)
Try to match RegExp `rgx` on string `text`, with fancy extras.
Returns the match if there was one, or `false` otherwise.
The latter is chosen so you can safely access number properties
of `rxu()`'s result.

  * If `rgx` is an array, it's `rxu.join()`ed, see below.
  * In case there is a match,
    * … it's extended with `rxu.contextSlots(match, text)`.
    * … it's cached, see below.


<a class="readme-ssi-toc-target" id="toc-rxu-slot" name="toc-rxu-slot"></a>
### rxu(slot) &nbsp; &nbsp; [☂](test/match.js)
Get property `slot` (string or number) from the cached match object.
If the slot contains a function, call it and return its result.


<a class="readme-ssi-toc-target" id="toc-rxu-null" name="toc-rxu-null"></a>
### rxu(null) &nbsp; &nbsp; [☂](test/match.js)
Clear `rxu()`'s cache.
Do this if you matched sensitive information that you need to hide from
other modules that run in the same VM.
You probably can't if they're evil, but you might avoid accidential disclosure.
This does not affect any other caches that your VM might have created,
maybe by some aspect of its RegExp implementation,
like [`RegExp.input` in Firefox][mdn-regexp-input].


<a class="readme-ssi-toc-target" id="toc-rxu-func" name="toc-rxu-func"></a>
### rxu(func), rxu.wrapAugmentReplacer(func) &nbsp; &nbsp; [☂](test/augmrepl.js)
The 1st is a shorthand for the 2nd.
Assuming that function `func` expects a match result object, return a wrapper
function that can be used as a replacer function and will provide a match
result object to `func`, with additional features.

The wrapper takes either a match result object, or standard replacer
function arguments, in which case it will convert them using
`rxu.args2match()`. Additional features:
(`m` = match object, `w` = wrapper function)

  * `rxu.contextSlots(m)`, see below.
  * `m.memo` = `w.memo`: An object that will be carried along. You can set
    properties on it in order to remember stuff between invocations.
  * `m.opt` = `w.opt`: Options for wrapper behavior.
    * `opt.cnt`: Well ok this isn't an option, but a match counter.
      In case it's not a number, the wrapper will initialize it to 0
      (before calling `func`), and will increment it by 1 each time it
      survived a call to `func`, i.e. `func` has not thrown an Error.
    * `opt.limit`: Set to a number in order to limit how many matches you
      want to replace. If `opt.cnt >= opt.limit`, the wrapper will just
      return `m[0]` (the original text, unchanged) instead of calling `func`.
    * `opt.undef`: What text to return in case `func` returns `undefined`.
      (Reminder: That's the default if your function has no `return` statement
      or no value in it.) If `opt.undef` is `undefined` itself (default),
      the original match text will be returned.


<a class="readme-ssi-toc-target" id="toc-rxu-wrapaugmentreplacer-string-undefined-regexp" name="toc-rxu-wrapaugmentreplacer-string-undefined-regexp"></a>
### rxu.wrapAugmentReplacer(string | undefined | regexp) &nbsp; &nbsp; [☂](test/augmrepl.js)
Arrange most features described above, especially counter and limit.
Since you provided no replacer function, it can't be called, but instead:

  * If given a string, just return that each time, verbatim.
    Dollar signs won't have any special effect even if followed by a digit.
  * If given `null` (or `undefined` or no argument), make the wrapper act
    as if `func` had returned undefined. You probably want to set `opt.undef`.
  * If given a RegExp, format the match using `rxu.fmt()` (not available yet).


<a class="readme-ssi-toc-target" id="toc-rxu-s-pattern-better-opt-text" name="toc-rxu-s-pattern-better-opt-text"></a>
### rxu.s(pattern[, better][, opt][, text]) &nbsp; &nbsp; [☂](test/subst.js)
That `s` means to substitute (parts of a string),
name [inspired by Perl][perldoc-s].

Make a function that, given a string, will return it with `pattern` replaced.
If `text` is provided, don't return said function but instead feed `text` to
it and return the result.

`pattern` can be a RegExp or a string. Note that in the latter case, `s` tends
to replace **all** occurrences of the `pattern`. To have it act as
`String.prototype.replace()` does, set `opt.limit` to 1.

`better` will be used to replace the occurrence(s) of `pattern`. It can be…
  * a function whose `opt` and `memo` properties both contain objects,
    then `s` will assume that function was made by `rxu.wrapAugmentReplacer()`
    and use it as the replacer. If the `opt` argument to `s` is `true`,
    the `opt` and `memo` properties will be left as they are, else they're
    backed up, reset (`memo` to empty object, `opt` to options as described
    below) and restored after the substitutions are done.
  * anything else that `rxu.wrapAugmentReplacer()` can accept, because that's
    what `s` will use to get a replacer function.

`opt`: An object with options. Supports all options that you could set on a
replacer function created by `rxu.wrapAugmentReplacer()`, with some exceptions:

  * If `opt` is a number, it will be used as `opt.limit` and no other options
    will be set.
  * If `opt` is true and `better` looks like it was made by
    `rxu.wrapAugmentReplacer()`, the original `better.opt` and `better.memo`
    will be kept as they are.


<a class="readme-ssi-toc-target" id="toc-rxu-isrx-thing" name="toc-rxu-isrx-thing"></a>
### rxu.isRx(thing) &nbsp; &nbsp; [☂](test/isrx.js)
Returns a boolean whether `thing` looks like a RegExp.
Will be maintained to always use the most reliable, cross-platform,
edgecase-avoiding approach known to rxu's maintainers.
(Advice and PRs welcome, as for any aspect of `rxu`.)


<a class="readme-ssi-toc-target" id="toc-rxu-quotemeta-text" name="toc-rxu-quotemeta-text"></a>
### rxu.quotemeta(text) &nbsp; &nbsp; [☂](test/quotemeta.js)
Return a version of `text` that has a backslash added in front of each
character that looks like it could has a special meaning in RegExp syntax,
and whitespace characters. The exact list can be found in `rxu.rgxMagicChars`.
Don't change it, or you'll break other modules that run in the same VM.


<a class="readme-ssi-toc-target" id="toc-rxu-replacer-rwhat-rwith" name="toc-rxu-replacer-rwhat-rwith"></a>
### rxu.replacer(rWhat, rWith) &nbsp; &nbsp; [☂](test/replacer.js)
```js
  return function subst(input) { return String(input).replace(rWhat, rWith); };
```
Construct handy iterators for cases where `rxu.s()` would be disproportionate.


<a class="readme-ssi-toc-target" id="toc-rxu-ifmatch-text-rgx-thenfunc-elsefunc" name="toc-rxu-ifmatch-text-rgx-thenfunc-elsefunc"></a>
### rxu.ifMatch(text, rgx, thenFunc, elseFunc) &nbsp; &nbsp; [☂](test/ifmatch.js)
```js
  return (match ? (thenFunc ? thenFunc(match, text) : match)
                : (elseFunc ? elseFunc(text)        : false));
```


<a class="readme-ssi-toc-target" id="toc-rxu-body-rx" name="toc-rxu-body-rx"></a>
### rxu.body(rx), rxu.flags(rx) &nbsp; &nbsp; [☂](test/bodyparts.js)
Get the body part or flags from a regexp. Uses `.source` and `.flags`
where available, with fallback to string parsing.


<a class="readme-ssi-toc-target" id="toc-rxu-splitbodyandflags-rx" name="toc-rxu-splitbodyandflags-rx"></a>
### rxu.splitBodyAndFlags(rx) &nbsp; &nbsp; [☂](test/bodyparts.js)
Find the body, flags, and delimiter used in a regexp.
Returns an object `{ delim: …, body: …, flags: … }` with a prototype
that knows a `.compile` method that makes a RegExp.


<a class="readme-ssi-toc-target" id="toc-rxu-compile-rx" name="toc-rxu-compile-rx"></a>
### rxu.compile(rx) &nbsp; &nbsp; [☂](test/bodyparts.js)
`return rxu.splitBodyAndFlags(rx).compile();` – allows to `.map()` an
array of string representations of RegExps to actual live RegExps.


<a class="readme-ssi-toc-target" id="toc-rxu-join-rxs-flags-wash" name="toc-rxu-join-rxs-flags-wash"></a>
### rxu.join(rxs, flags[, wash]) &nbsp; &nbsp; [☂](test/bodyparts.js)
From an array `rxs` of RegExp bodies given as strings
(and/or as RegExps, which will be converted to strings using `rxu.body`),
make a new RegExp from the concatenated body parts and (if given) `flags`.
If a function `wash` is given, each body part will be passed through that
(as string).


<a class="readme-ssi-toc-target" id="toc-rxu-end-m" name="toc-rxu-end-m"></a>
### rxu.end(m), rxu.before(m), rxu.after(m), rxu.grp(m, g) &nbsp; &nbsp; [☂](test/match.js)
Assuming that `m` is a result object from a successful RegExp match,
determine…
  * `end`:    the position of the first character after the match.
  * `before`: the text before the match.
  * `after`:  the text after the match.
  * `grp`, g ∈ {number}: `m[g]` but warping around at 0 and `m.length`.
  * `grp`, g ∈ {string}: (not supported yet) the named match group `g`.


<a class="readme-ssi-toc-target" id="toc-rxu-contextslots-m" name="toc-rxu-contextslots-m"></a>
### rxu.contextSlots(m) &nbsp; &nbsp; [☂](test/ctxslots.js)
Assuming that `m` is a result object from a successful RegExp match,
set some handy additional slots on `m`, and return it.

  * `m['@']`: (int) Position of the match. Alias for `m.index`.
  * `m.end`: (int) Position of the first character after the match.
  * `m['*']`: (func) Returns `m.input`.
  * `m['<']`, `m.before`: (func) Returns the text before the match.
  * `m['>']`, `m.after`: (func) Returns the text after the match.
  * `m.fmt`, `m.grp`:
    (func) Like the same-named functions on `rxu.` but with the match
    object pre-set.


<a class="readme-ssi-toc-target" id="toc-rxu-args2match-arguments" name="toc-rxu-args2match-arguments"></a>
### rxu.args2match(arguments) &nbsp; &nbsp; [☂](test/ctxslots.js)
When you call `.replace()` on some string with the 2nd argument being your
replacer function, that function won't receive a proper match result object,
just unnamed arguments. This function converts that `arguments` Array-like
object to a proper match result object, so you can use it with other
`rxu` functions.









<!--#toc stop="scan" -->


  [mdn-regexp-input]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/input
  [perldoc-s]: http://perldoc.perl.org/functions/s.html



License
-------
<!--#echo json="package.json" key=".license" -->
ISC
<!--/#echo -->
