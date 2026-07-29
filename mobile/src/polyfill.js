// Pre-runtime polyfill to prevent Hermes read-only property 'NONE' crash in Expo Go
(function() {
  try {
    var g = typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : (typeof self !== 'undefined' ? self : global));
    if (g) {
      // 1. Safely define Event.NONE getter/setter on Event if it exists
      if (g.Event) {
        try {
          var val = 0;
          Object.defineProperty(g.Event, 'NONE', {
            get: function() { return val; },
            set: function(v) { val = v; },
            configurable: true,
            enumerable: true
          });
        } catch(e) {}
      }

      // 2. Intercept Object.defineProperty to prevent non-writable 'NONE' property definitions on Event
      var origDefine = Object.defineProperty;
      if (origDefine) {
        Object.defineProperty = function(obj, prop, desc) {
          if (prop === 'NONE' && (obj === g.Event || (obj && (obj.name === 'Event' || obj.constructor?.name === 'Event')))) {
            try {
              if (desc) {
                desc.writable = true;
                desc.configurable = true;
              }
            } catch(e) {}
          }
          return origDefine.call(Object, obj, prop, desc);
        };
      }
    }
  } catch(e) {}
})();
