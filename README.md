selectionchange-polyfill
========================

A polyfill that fires `selectionchange` events for Firefox.

Why
---

Firefox has a `select` event for when the selection changes within an `input`
or `textarea` element, but doesn't yet support the general `selectionchange`
event like the other major browsers. This polyfill fires it very close to how
Google Chrome does.

How to Use
----------

Call `selectionchange.start()` to enable the polyfill and `selectionchange.stop()`
to disable it. Both functions take an optional `DOMDocument` argument, defaulting
to `window.document`.

Handlers for the `selectionchange` event should be registered on the document or
its `.defaultView` (typically `window`).

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

There are several ways a user can create a new selection:
  - User clicks and drags mouse cursor
  - User double-clicks a word or triple-clicks a paragraph
  - User chooses "Select All" from the context (right-click) menu
  - User chooses "Select All" from the Edit menu in the menu bar
  - User types Ctrl+A (or Cmd+A) to select all

There are also some ways a user can modify a selection:
  - User holds down Shift key (and optionally Alt key) and clicks and/or drags mouse
  - User holds down Shift key (and optionally Alt key) and presses an arrow key

Note that, while Chrome will sometimes alter the selection if the user scrolls the
wheel with the primary mouse button down, Firefox does not. It only updates the
selection on `mousemove`.

No DOM event fires when a user chooses "Select All" from a menu or when the
selection is changed via script, so the best that can be done to detect those
scenarios is polling the document selection for changes. Because that can be
expensive and is a bit of a corner case, this polyfill doesn't do it for now.
As a result, the `selectionchange` event will not necessarily fire soon after
these kinds of changes, but may still fire eventually, after a subsequent user
action.
