var selectionchange = (function (undefined) {

  var SELECT_ALL_MODIFIER = /^Mac/.test(navigator.platform) ? 'metaKey' : 'ctrlKey';
  var RANGE_PROPS = ['startContainer', 'startOffset', 'endContainer', 'endOffset'];

  var selections, ranges;

  return {
    start: function (doc) {
      var d = doc || document;
      if (selections || !hasNativeSupport(d) && createMaps()) {
        if (!selections.has(d)) {
          var s = d.getSelection();
          selections.set(d, s);
          on(d, 'keydown', onKeyDown);
          on(d, 'mousedown', onMouseDown);
          on(d, 'mousemove', onMouseMove);
          on(d, 'mouseup', onMouseUp);
          if (s.rangeCount) {
            ranges.set(d, s.getRangeAt(0));
          }
        }
      }
    },
    stop: function (doc) {
      var d = doc || document;
      if (selections.has(d)) {
        selections.delete(d);
        ranges.delete(d);
        off(d, 'keydown', onKeyDown);
        off(d, 'mousedown', onMouseDown);
        off(d, 'mousemove', onMouseMove);
        off(d, 'mouseup', onMouseUp);
      }
    }
  };

  function hasNativeSupport(doc) {
    var osc = doc.onselectionchange;
    if (osc !== undefined) {
      try {
        doc.onselectionchange = 0;
        return doc.onselectionchange === null;
      } finally {
        doc.onselectionchange = osc;
      }
    }
    return false;
  }

  function createMaps() {
    if (typeof WeakMap !== 'undefined') {
      selections = new WeakMap();
      ranges = new WeakMap();
      return true;
    } else {
      console.error('selectionchange: WeakMap not supported');
      return false;
    }
  }

  function on(el, eventType, handler) {
    el.addEventListener(eventType, handler, true);
  }

  function off(el, eventType, handler) {
    el.removeEventListener(eventType, handler, true);
  }

  function onKeyDown(e) {
    var code = e.keyCode;
    if (code === 65 && e[SELECT_ALL_MODIFIER] && !e.shiftKey && !e.altKey || // Ctrl-A or Cmd-A
        (code <= 40 && code >= 37) && e.shiftKey) { // (Alt-)Shift-arrow
      setTimeout(dispatchIfChanged.bind(null, this), 0);
    }
  }

  function onMouseDown(e) {
    if (e.button === 0) {
      on(this, 'mousemove', onMouseMove);
      setTimeout(dispatchIfChanged.bind(null, this), 0);
    }
  }

  function onMouseMove(e) {  // only needed while primary button is down
    if (e.buttons & 1) {
      dispatchIfChanged(this);
    } else {
      off(this, 'mousemove', onMouseMove);
    }
  }

  function onMouseUp(e) {
    if (e.button === 0) {
      setTimeout(dispatchIfChanged.bind(null, this), 0);
    } else {
      off(this, 'mousemove', onMouseMove);
    }
  }

  function dispatchIfChanged(doc) {
    var s = selections.get(doc);
    var rOld = ranges.get(doc);
    var rNew = s.rangeCount ? s.getRangeAt(0) : undefined;
    if (!sameRange(rNew, rOld)) {
      ranges.set(doc, rNew);
      setTimeout(doc.dispatchEvent.bind(doc, new Event('selectionchange')), 0);
    }
  }

  function sameRange(r1, r2) {
    return r1 === r2 || r1 && r2 && RANGE_PROPS.every(function (prop) {
      return r1[prop] === r2[prop];
    });
  }
})();
