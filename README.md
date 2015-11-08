selectionchange-polyfill
========================

A polyfill that fires `selectionchange` events for Firefox.

Why
---

Firefox has a `select` event for when the selection changes within
an `input` or `textarea` element, but doesn't yet support the general
`selectionchange` event like other major browsers
(see [feature request](https://bugzilla.mozilla.org/show_bug.cgi?id=571294)).
This polyfill uses the same event dispatch ordering as Google Chrome.

How to Use
----------

Call `selectionchange.start()` to enable the polyfill and `selectionchange.stop()`
to disable it. Both functions take an optional `DOMDocument` argument, defaulting
to `window.document`.

Handlers for the `selectionchange` event should be registered on the document or
its `.defaultView` (its `window`).

The event is not cancellable and carries no information about the previous or
current selection.

```HTML
<script src="selectionchange.js"></script>
<script>
selectionchange.start();

document.addEventListener('selectionchange', function (event) {
  var sel = this.getSelection();
  console.log('Selected text:', sel.rangeCount ? sel.getRangeAt(0).toString() : null);
});
</script>
```

Implementation Notes
--------------------

This polyfill fires `selectionchange` immediately after most kinds of selection changes
(identified with checkmarks below), but there are some unsupported edge cases.

Ways a user can create a new selection:
  - :white_check_mark: User presses primary mouse button
  - :white_check_mark: User double-clicks a word or triple-clicks a paragraph
  - :x: User chooses "Select All" from the context (right-click) menu <sup>1</sup>
  - :x: User chooses "Select All" from the Edit menu in the menu bar <sup>1</sup>
  - :white_check_mark: User types Ctrl+A (or Cmd+A) to select all
  - :white_check_mark: User tabs to a different focusable element

Ways a user can modify a selection:
  - :white_check_mark: User moves mouse while holding down primary mouse button
  - :white_check_mark: User holds down Shift key (and optionally Alt key) and clicks and/or drags mouse
  - :white_check_mark: User holds down Shift key (and optionally Alt key) and presses an arrow key, Home or End
  - ~~User scrolls the wheel with the primary mouse button down~~ (a Chrome/Safari feature not in Firefox)

Additional ways a user can modify a selection in a contenteditable element or a designMode document:
  - :white_check_mark: User presses an arrow key, Home or End
  - :white_check_mark: User makes an edit (types a character, deletes, cuts, pastes, drops content)

Ways a script can create or modify a selection:
  - :x: Using the Selection API <sup>2</sup>
  - :x: Modifying the DOM within the selection, at a boundary, or with any overlap <sup>2</sup>
  - :white_check_mark: Moving focus using `.focus()` or `.blur()`

If the document’s selection changes via an unsupported mechanism, the `selectionchange`
event will not necessarily fire soon afterwards, but may still fire eventually, after
a subsequent user action.

<sup>1</sup> The reason this polyfill doesn’t currently support "Select All" menu item selection
is that it doesn’t trigger a DOM event and is less common. Optional support via
polling may be added in the future.

<sup>2</sup> The reason this polyfill doesn’t currently support selection changes via script
is that the author’s initial use case didn’t require it. Polling could be used
to detect changes via the Selection API. A DOM `MutationObserver` could be
used to detect selection changes resulting from DOM modifications.

