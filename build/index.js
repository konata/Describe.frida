(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
(function (setImmediate,clearImmediate){(function (){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this)}).call(this,require("timers").setImmediate,require("timers").clearImmediate)

},{"process/browser.js":1,"timers":2}],3:[function(require,module,exports){
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prettyprint = void 0;
var JCollection = Java.use('java.util.Collection').class;
var JMap = Java.use('java.util.Map').class;
var $Entry = Java.use('java.util.Map$Entry');
function prettyprint(wrapped, depth, hierarchyLimit) {
    var _a, _b, _c;
    if (depth === void 0) { depth = 5; }
    if (hierarchyLimit === void 0) { hierarchyLimit = 2; }
    var type = typeof wrapped;
    var runtimeType = (_a = wrapped === null || wrapped === void 0 ? void 0 : wrapped.getClass) === null || _a === void 0 ? void 0 : _a.call(wrapped); // wrapped && wrapped.getClass && wrapped.getClass()
    var runtimeTypeRepr = (_b = runtimeType === null || runtimeType === void 0 ? void 0 : runtimeType.toString) === null || _b === void 0 ? void 0 : _b.call(runtimeType);
    var declareType = wrapped === null || wrapped === void 0 ? void 0 : wrapped.class;
    var declareTypeRepr = (_c = declareType === null || declareType === void 0 ? void 0 : declareType.toString) === null || _c === void 0 ? void 0 : _c.call(declareType);
    var describable = 'String Integer Long Double Float Byte Short Character Boolean'
        .split(/\s+/g)
        .map(function (it) { return "class java.lang.".concat(it); });
    var primitives = "boolean string number";
    if (hierarchyLimit <= 0) {
        return "TooDeep@Hierarchy@".concat(wrapped);
    }
    else if (wrapped === null || wrapped === undefined) {
        return "null";
    }
    else if (
    // 1. primitives
    primitives.includes(type) ||
        describable.includes(runtimeTypeRepr) ||
        describable.includes(declareTypeRepr)) {
        return wrapped.toString();
    }
    else if ((runtimeType === undefined && declareTypeRepr === undefined) ||
        (runtimeTypeRepr === null || runtimeTypeRepr === void 0 ? void 0 : runtimeTypeRepr.startsWith('class ['))) {
        // 2. js aware arrays & java aware array
        if (depth <= 0) {
            return "TooDeep@Array@".concat(wrapped);
        }
        else {
            return __spreadArray([], __read(wrapped), false).map(function (it) {
                return prettyprint(it, depth - 1, hierarchyLimit);
            });
        }
    }
    else if ((declareType && JCollection.isAssignableFrom(declareType)) ||
        (runtimeType && JCollection.isAssignableFrom(runtimeType))) {
        // 3. Collection [List, Set, Etc]
        if (depth <= 0) {
            return "TooDeep@Collection@".concat(wrapped);
        }
        else {
            return __spreadArray([], __read(wrapped.toArray()), false).map(function (it) {
                return prettyprint(it, depth - 1, hierarchyLimit);
            });
        }
    }
    else if ((declareType && JMap.isAssignableFrom(declareType)) ||
        (runtimeType && JMap.isAssignableFrom(runtimeType))) {
        // 4. Map
        if (depth <= 0) {
            return "TooDeep@Map@".concat(wrapped);
        }
        else {
            return __spreadArray([], __read(wrapped.entrySet().toArray()), false).reduce(function (acc, ele) {
                var key = $Entry.getKey.call(ele).toString();
                var value = $Entry.getValue.call(ele);
                acc[key] = prettyprint(value, depth - 1, hierarchyLimit);
                return acc;
            }, new Map());
        }
    }
    else {
        // 5. Pojo, choose the most accuracy type
        var clazz = runtimeType || declareType;
        if (clazz) {
            var _d = __read(__spreadArray([], __read(Array(hierarchyLimit).keys()), false).reduce(function (_a, level) {
                var _b, _c;
                var _d = __read(_a, 2), tuples = _d[0], clazz = _d[1];
                var acc = __spreadArray([], __read(((_c = (_b = clazz === null || clazz === void 0 ? void 0 : clazz.getDeclaredFields) === null || _b === void 0 ? void 0 : _b.call(clazz)) !== null && _c !== void 0 ? _c : [])), false).map(function (it) { return it.getName(); })
                    .map(function (it) {
                    var _a;
                    return [
                        it,
                        prettyprint((_a = wrapped[it]) === null || _a === void 0 ? void 0 : _a.value, depth - 1, hierarchyLimit - level - 1),
                    ];
                });
                var supers = clazz === null || clazz === void 0 ? void 0 : clazz.getSuperclass();
                return [__spreadArray(__spreadArray([], __read(tuples), false), __read(acc), false), supers];
            }, [[], clazz]), 1), fields = _d[0];
            return fields.reduce(function (acc, _a) {
                var _b;
                var _c = __read(_a, 2), key = _c[0], value = _c[1];
                return (__assign(__assign({}, acc), (_b = {}, _b[key] = value, _b)));
            }, {});
        }
        else {
            // not primitive, not js array, no declaredType no runtimeType, who are u?
            console.error("wired:".concat(wrapped, "  runtimeType:").concat(runtimeType, "  declType:").concat(declareType));
            return "BadPojo@".concat(wrapped);
        }
    }
}
exports.prettyprint = prettyprint;

},{}],4:[function(require,module,exports){
(function (setImmediate){(function (){
"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var Describe_1 = require("./Describe");
setImmediate(function () {
    return Java.perform(function () {
        var ContextWrapper = Java.use('android.content.ContextWrapper');
        ContextWrapper.attachBaseContext.implementation = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            console.log(JSON.stringify((0, Describe_1.prettyprint)(args, 3, 5)));
            return this.attachBaseContext.apply(this, __spreadArray([], __read(args), false));
        };
    });
});

}).call(this)}).call(this,require("timers").setImmediate)

},{"./Describe":3,"timers":2}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3RpbWVycy1icm93c2VyaWZ5L21haW4uanMiLCJzcmMvRGVzY3JpYmUudHMiLCJzcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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RSxDQUFDLDBDQUFFLEtBQUssRUFDbEIsS0FBSyxHQUFHLENBQUMsRUFDVCxjQUFjLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FDM0I7cUJBQ3FCLENBQUE7aUJBQUEsQ0FDM0IsQ0FBQTtnQkFDSCxJQUFNLE1BQU0sR0FBRyxLQUFLLGFBQUwsS0FBSyx1QkFBTCxLQUFLLENBQUUsYUFBYSxFQUFFLENBQUE7Z0JBQ3JDLE9BQU8sd0NBQUssTUFBTSxrQkFBSyxHQUFHLFdBQUcsTUFBTSxDQUFDLENBQUE7WUFDdEMsQ0FBQyxFQUNELENBQUMsRUFBMkIsRUFBRSxLQUFLLENBQUMsQ0FDckMsSUFBQSxFQW5CTSxNQUFNLFFBbUJaLENBQUE7WUFDRCxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQ2xCLFVBQUMsR0FBRyxFQUFFLEVBQVk7O29CQUFaLEtBQUEsYUFBWSxFQUFYLEdBQUcsUUFBQSxFQUFFLEtBQUssUUFBQTtnQkFBTSxPQUFBLHVCQUFNLEdBQUcsZ0JBQUcsR0FBRyxJQUFHLEtBQUssT0FBRztZQUExQixDQUEwQixFQUNqRCxFQUErQixDQUNoQyxDQUFBO1NBQ0Y7YUFBTTtZQUNMLDBFQUEwRTtZQUMxRSxPQUFPLENBQUMsS0FBSyxDQUNYLGdCQUFTLE9BQU8sMkJBQWlCLFdBQVcsd0JBQWMsV0FBVyxDQUFFLENBQ3hFLENBQUE7WUFDRCxPQUFPLGtCQUFXLE9BQU8sQ0FBRSxDQUFBO1NBQzVCO0tBQ0Y7QUFDSCxDQUFDO0FBdEdELGtDQXNHQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ2hIRCx1Q0FBd0M7QUFFeEMsWUFBWSxDQUFDO0lBQ1gsT0FBQSxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ1gsSUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFBO1FBQ2pFLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLEdBQUc7WUFDaEQsY0FBYztpQkFBZCxVQUFjLEVBQWQscUJBQWMsRUFBZCxJQUFjO2dCQUFkLHlCQUFjOztZQUVkLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFBLHNCQUFXLEVBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDcEQsT0FBTyxJQUFJLENBQUMsaUJBQWlCLE9BQXRCLElBQUksMkJBQXNCLElBQUksV0FBQztRQUN4QyxDQUFDLENBQUE7SUFDSCxDQUFDLENBQUM7QUFSRixDQVFFLENBQ0gsQ0FBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIn0=
