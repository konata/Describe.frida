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
exports.prettyprint = exports.describe = void 0;
var JCollection = Java.use('java.util.Collection').class;
var JMap = Java.use('java.util.Map').class;
var $Entry = Java.use('java.util.Map$Entry');
var JObject = Java.use('java.lang.Object');
var Modifier = Java.use('java.lang.reflect.Modifier');
function describe(wrapped, depth, hierarchyLimit, ignoreStatics) {
    if (depth === void 0) { depth = 5; }
    if (hierarchyLimit === void 0) { hierarchyLimit = 2; }
    if (ignoreStatics === void 0) { ignoreStatics = true; }
    return JSON.stringify(prettyprint(wrapped, depth, hierarchyLimit, ignoreStatics));
}
exports.describe = describe;
function prettyprint(wrapped, depth, hierarchyLimit, ignoreStatics) {
    var _a, _b, _c;
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
        return "".concat(wrapped);
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
            return "".concat(wrapped);
        }
        else {
            return __spreadArray([], __read(wrapped), false).map(function (it) {
                return prettyprint(it, depth - 1, hierarchyLimit, ignoreStatics);
            });
        }
    }
    else if ((declareType && JCollection.isAssignableFrom(declareType)) ||
        (runtimeType && JCollection.isAssignableFrom(runtimeType))) {
        // 3. Collection [List, Set, Etc]
        if (depth <= 0) {
            return "".concat(wrapped);
        }
        else {
            return __spreadArray([], __read(wrapped.toArray()), false).map(function (it) {
                return prettyprint(it, depth - 1, hierarchyLimit, ignoreStatics);
            });
        }
    }
    else if ((declareType && JMap.isAssignableFrom(declareType)) ||
        (runtimeType && JMap.isAssignableFrom(runtimeType))) {
        // 4. Map
        if (depth <= 0) {
            return "".concat(wrapped);
        }
        else {
            return __spreadArray([], __read(wrapped.entrySet().toArray()), false).reduce(function (acc, ele) {
                var key = $Entry.getKey.call(ele).toString();
                var value = $Entry.getValue.call(ele);
                acc[key] = prettyprint(value, depth - 1, hierarchyLimit, ignoreStatics);
                return acc;
            }, new Map());
        }
    }
    else {
        // 5. Pojo, choose the most accuracy type
        var clazz = runtimeType ||
            (function () {
                var _a, _b;
                var casted = Java.cast(wrapped, JObject);
                return (_b = (_a = casted === null || casted === void 0 ? void 0 : casted.getClass) === null || _a === void 0 ? void 0 : _a.call(casted)) !== null && _b !== void 0 ? _b : casted === null || casted === void 0 ? void 0 : casted.class;
            })() ||
            declareType;
        // declareType
        if (clazz) {
            var _d = __read(__spreadArray([], __read(Array(hierarchyLimit).keys()), false).reduce(function (_a, level) {
                var _b, _c;
                var _d = __read(_a, 2), tuples = _d[0], clazz = _d[1];
                var acc = __spreadArray([], __read(((_c = (_b = clazz === null || clazz === void 0 ? void 0 : clazz.getDeclaredFields) === null || _b === void 0 ? void 0 : _b.call(clazz)) !== null && _c !== void 0 ? _c : [])), false).filter(function (it) { return !ignoreStatics || !Modifier.isStatic(it.getModifiers()); })
                    .map(function (it) { return it.getName(); })
                    .map(function (it) {
                    var _a;
                    return [
                        it,
                        prettyprint((_a = wrapped[it]) === null || _a === void 0 ? void 0 : _a.value, depth - 1, hierarchyLimit - level - 1, ignoreStatics),
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
Object.defineProperty(exports, "__esModule", { value: true });
var Describe_1 = require("./Describe");
setImmediate(function () {
    return Java.perform(function () {
        var Activity = Java.use('android.app.Activity');
        Activity.onCreate.overloads.forEach(function (overload) {
            overload.implementation = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                console.log('activity=', (0, Describe_1.describe)(this, 5, 7));
                return overload.apply(this, args);
            };
        });
    });
});

}).call(this)}).call(this,require("timers").setImmediate)

},{"./Describe":3,"timers":2}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3RpbWVycy1icm93c2VyaWZ5L21haW4uanMiLCJzcmMvRGVzY3JpYmUudHMiLCJzcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN4TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUMzRUEsSUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLEtBQUssQ0FBQTtBQUMxRCxJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDLEtBQUssQ0FBQTtBQUM1QyxJQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUE7QUFDOUMsSUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFB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
