// Pre-runtime polyfill to prevent Hermes read-only property 'NONE' crash in Expo Go
(function () {
  try {
    const targetGlobal = typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : global);
    if (targetGlobal && targetGlobal.Event) {
      let val = 0;
      Object.defineProperty(targetGlobal.Event, 'NONE', {
        get: function () { return val; },
        set: function (v) { val = v; },
        configurable: true,
        enumerable: true
      });
    }
  } catch (e) {}
})();
