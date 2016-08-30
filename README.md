
rxu
===
misc regexp utils.


Usage
-----
For examples see [test.js](test.js).


### rxu(rgx, text)
Try to match RegExp `rgx` on string `text`, with fancy extras.
Returns the match if there was one, or `false` otherwise.
The latter is chosen so you can safely access number properties
of `rxu()`'s result.

  * If `rgx` is an array, it's `rxu.join()`ed, see below.
  * In case there is a match,
    * … it's extended with `rxu.contextSlots(match, text)`.
    * … it's cached, see below.


### rxu(slot)
Get property `slot` (string or number) from the cached match object.
If the slot contains a function, call it and return its result.


### rxu(null)
Clear `rxu()`'s cache.
Do this if you matched sensitive information that you need to hide from
other modules that run in the same VM.
You probably can't if they're evil, but you might avoid accidential disclosure.
This does not affect any other caches that your VM might have created,
maybe by some aspect of its RegExp implementation,
like [`RegExp.input` in Firefox][mdn-regexp-input].


### rxu.quotemeta(text)
Return a version of `text` that has a backslash added in front of each
character that looks like it could has a special meaning in RegExp syntax,
and whitespace characters. The exact list can be found in `rxu.rgxMagicChars`.
Don't change it, or you'll break other modules that run in the same VM.


### rxu.replacer(rWhat, rWith)
```js
  return function (text) { return String(text).replace(rWhat, rWith); };
```
Construct handy iterators.


### rxu.ifMatch(text, rgx, thenFunc, elseFunc)
```js
  return (match ? (thenFunc ? thenFunc(match, text) : match)
                : (elseFunc ? elseFunc(text)        : false));
```


### rxu.body(rx), rxu.flags(rx)
Get the body part or flags from a regexp. Uses `.source` and `.flags`
where available, with fallback to string parsing.


### rxu.join(rxs, flags)
Given an array `rxs` of RegExp bodies given as strings
(and/or as RegExps, which will be converted to strings using `rxu.body`),
make a new RegExp from the concatenated body parts and (if given) `flags`.


### rxu.end(m), rxu.before(m), rxu.after(m)
Assuming that `m` is a result object from a successful RegExp match,
determine…
  * `end`:   the position of the first character after the match.
  * `before`: the text before the match.
  * `after`:  the text after the match.


### rxu.contextSlots(m)
Assuming that `m` is a result object from a successful RegExp match,
sets some handy additional slots on `m`:

  * `m['@']`: (int) Position of the match. Alias for `m.index`.
  * `m.end`: (int) Position of the first character after the match.
  * `m['*']`: (func) Returns `m.input`.
  * `m['<']`, `m.before`: (func) Returns the text before the match.
  * `m['>']`, `m.after`: (func) Returns the text after the match.


### rxu.args2match(arguments)
When you call `.replace()` on some string with the 2nd argument being your
replacer function, that function won't receive a proper match result object,
just unnamed arguments. This function converts that `arguments` Array-like
object to a proper match result object, so you can use it with other
`rxu` functions.





  [mdn-regexp-input]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/input



License
-------
ISC
