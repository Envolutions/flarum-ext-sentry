/******/ (() => { // webpackBootstrap
/******/ 	// runtime can't be in strict mode because a global variable is assign and maybe created.
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@sentry-internal/browser-utils/build/esm/debug-build.js":
/*!******************************************************************************!*\
  !*** ./node_modules/@sentry-internal/browser-utils/build/esm/debug-build.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DEBUG_BUILD: () => (/* binding */ DEBUG_BUILD)
/* harmony export */ });
/**
 * This serves as a build time flag that will be true by default, but false in non-debug builds or if users replace `__SENTRY_DEBUG__` in their generated code.
 *
 * ATTENTION: This constant must never cross package boundaries (i.e. be exported) to guarantee that it can be used for tree shaking.
 */
const DEBUG_BUILD =  false || false;


/***/ }),

/***/ "./node_modules/@sentry-internal/browser-utils/build/esm/getNativeImplementation.js":
/*!******************************************************************************************!*\
  !*** ./node_modules/@sentry-internal/browser-utils/build/esm/getNativeImplementation.js ***!
  \******************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   clearCachedImplementation: () => (/* binding */ clearCachedImplementation),
/* harmony export */   fetch: () => (/* binding */ fetch),
/* harmony export */   getNativeImplementation: () => (/* binding */ getNativeImplementation),
/* harmony export */   setTimeout: () => (/* binding */ setTimeout)
/* harmony export */ });
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils-hoist/supports.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils-hoist/logger.js");
/* harmony import */ var _debug_build_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./debug-build.js */ "./node_modules/@sentry-internal/browser-utils/build/esm/debug-build.js");
/* harmony import */ var _types_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./types.js */ "./node_modules/@sentry-internal/browser-utils/build/esm/types.js");




/**
 * We generally want to use window.fetch / window.setTimeout.
 * However, in some cases this may be wrapped (e.g. by Zone.js for Angular),
 * so we try to get an unpatched version of this from a sandboxed iframe.
 */

const cachedImplementations = {};

/**
 * Get the native implementation of a browser function.
 *
 * This can be used to ensure we get an unwrapped version of a function, in cases where a wrapped function can lead to problems.
 *
 * The following methods can be retrieved:
 * - `setTimeout`: This can be wrapped by e.g. Angular, causing change detection to be triggered.
 * - `fetch`: This can be wrapped by e.g. ad-blockers, causing an infinite loop when a request is blocked.
 */
function getNativeImplementation(name) {
  const cached = cachedImplementations[name];
  if (cached) {
    return cached;
  }
  let impl = _types_js__WEBPACK_IMPORTED_MODULE_0__.WINDOW[name];

  // Fast path to avoid DOM I/O
  if ((0,_sentry_core__WEBPACK_IMPORTED_MODULE_1__.isNativeFunction)(impl)) {
    return cachedImplementations[name] = impl.bind(_types_js__WEBPACK_IMPORTED_MODULE_0__.WINDOW);
  }
  const document = _types_js__WEBPACK_IMPORTED_MODULE_0__.WINDOW.document;
  // eslint-disable-next-line deprecation/deprecation
  if (document && typeof document.createElement === 'function') {
    try {
      const sandbox = document.createElement('iframe');
      sandbox.hidden = true;
      document.head.appendChild(sandbox);
      const contentWindow = sandbox.contentWindow;
      if (contentWindow?.[name]) {
        impl = contentWindow[name];
      }
      document.head.removeChild(sandbox);
    } catch (e) {
      // Could not create sandbox iframe, just use window.xxx
      _debug_build_js__WEBPACK_IMPORTED_MODULE_2__.DEBUG_BUILD && _sentry_core__WEBPACK_IMPORTED_MODULE_3__.logger.warn(`Could not create sandbox iframe for ${name} check, bailing to window.${name}: `, e);
    }
  }

  // Sanity check: This _should_ not happen, but if it does, we just skip caching...
  // This can happen e.g. in tests where fetch may not be available in the env, or similar.
  if (!impl) {
    return impl;
  }
  return cachedImplementations[name] = impl.bind(_types_js__WEBPACK_IMPORTED_MODULE_0__.WINDOW);
}

/** Clear a cached implementation. */
function clearCachedImplementation(name) {
  cachedImplementations[name] = undefined;
}

/**
 * A special usecase for incorrectly wrapped Fetch APIs in conjunction with ad-blockers.
 * Whenever someone wraps the Fetch API and returns the wrong promise chain,
 * this chain becomes orphaned and there is no possible way to capture it's rejections
 * other than allowing it bubble up to this very handler. eg.
 *
 * const f = window.fetch;
 * window.fetch = function () {
 *   const p = f.apply(this, arguments);
 *
 *   p.then(function() {
 *     console.log('hi.');
 *   });
 *
 *   return p;
 * }
 *
 * `p.then(function () { ... })` is producing a completely separate promise chain,
 * however, what's returned is `p` - the result of original `fetch` call.
 *
 * This mean, that whenever we use the Fetch API to send our own requests, _and_
 * some ad-blocker blocks it, this orphaned chain will _always_ reject,
 * effectively causing another event to be captured.
 * This makes a whole process become an infinite loop, which we need to somehow
 * deal with, and break it in one way or another.
 *
 * To deal with this issue, we are making sure that we _always_ use the real
 * browser Fetch API, instead of relying on what `window.fetch` exposes.
 * The only downside to this would be missing our own requests as breadcrumbs,
 * but because we are already not doing this, it should be just fine.
 *
 * Possible failed fetch error messages per-browser:
 *
 * Chrome:  Failed to fetch
 * Edge:    Failed to Fetch
 * Firefox: NetworkError when attempting to fetch resource
 * Safari:  resource blocked by content blocker
 */
function fetch() {
  return getNativeImplementation('fetch')(...arguments);
}

/**
 * Get an unwrapped `setTimeout` method.
 * This ensures that even if e.g. Angular wraps `setTimeout`, we get the native implementation,
 * avoiding triggering change detection.
 */
function setTimeout() {
  return getNativeImplementation('setTimeout')(...arguments);
}


/***/ }),

/***/ "./node_modules/@sentry-internal/browser-utils/build/esm/instrument/dom.js":
/*!*********************************************************************************!*\
  !*** ./node_modules/@sentry-internal/browser-utils/build/esm/instrument/dom.js ***!
  \*********************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addClickKeypressInstrumentationHandler: () => (/* binding */ addClickKeypressInstrumentationHandler),
/* harmony export */   instrumentDOM: () => (/* binding */ instrumentDOM)
/* harmony export */ });
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils-hoist/instrument/handlers.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils-hoist/object.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils-hoist/misc.js");
/* harmony import */ var _types_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../types.js */ "./node_modules/@sentry-internal/browser-utils/build/esm/types.js");


const DEBOUNCE_DURATION = 1000;
let debounceTimerID;
let lastCapturedEventType;
let lastCapturedEventTargetId;

/**
 * Add an instrumentation handler for when a click or a keypress happens.
 *
 * Use at your own risk, this might break without changelog notice, only used internally.
 * @hidden
 */
function addClickKeypressInstrumentationHandler(handler) {
  const type = 'dom';
  (0,_sentry_core__WEBPACK_IMPORTED_MODULE_0__.addHandler)(type, handler);
  (0,_sentry_core__WEBPACK_IMPORTED_MODULE_0__.maybeInstrument)(type, instrumentDOM);
}

/** Exported for tests only. */
function instrumentDOM() {
  if (!_types_js__WEBPACK_IMPORTED_MODULE_1__.WINDOW.document) {
    return;
  }

  // Make it so that any click or keypress that is unhandled / bubbled up all the way to the document triggers our dom
  // handlers. (Normally we have only one, which captures a breadcrumb for each click or keypress.) Do this before
  // we instrument `addEventListener` so that we don't end up attaching this handler twice.
  const triggerDOMHandler = _sentry_core__WEBPACK_IMPORTED_MODULE_0__.triggerHandlers.bind(null, 'dom');
  const globalDOMEventHandler = makeDOMEventHandler(triggerDOMHandler, true);
  _types_js__WEBPACK_IMPORTED_MODULE_1__.WINDOW.document.addEventListener('click', globalDOMEventHandler, false);
  _types_js__WEBPACK_IMPORTED_MODULE_1__.WINDOW.document.addEventListener('keypress', globalDOMEventHandler, false);

  // After hooking into click and keypress events bubbled up to `document`, we also hook into user-handled
  // clicks & keypresses, by adding an event listener of our own to any element to which they add a listener. That
  // way, whenever one of their handlers is triggered, ours will be, too. (This is needed because their handler
  // could potentially prevent the event from bubbling up to our global listeners. This way, our handler are still
  // guaranteed to fire at least once.)
  ['EventTarget', 'Node'].forEach(target => {
    const globalObject = _types_js__WEBPACK_IMPORTED_MODULE_1__.WINDOW;
    const proto = globalObject[target]?.prototype;

    // eslint-disable-next-line no-prototype-builtins
    if (!proto?.hasOwnProperty?.('addEventListener')) {
      return;
    }
    (0,_sentry_core__WEBPACK_IMPORTED_MODULE_2__.fill)(proto, 'addEventListener', function (originalAddEventListener) {
      return function (type, listener, options) {
        if (type === 'click' || type == 'keypress') {
          try {
            const handlers = this.__sentry_instrumentation_handlers__ = this.__sentry_instrumentation_handlers__ || {};
            const handlerForType = handlers[type] = handlers[type] || {
              refCount: 0
            };
            if (!handlerForType.handler) {
              const handler = makeDOMEventHandler(triggerDOMHandler);
              handlerForType.handler = handler;
              originalAddEventListener.call(this, type, handler, options);
            }
            handlerForType.refCount++;
          } catch (e) {
            // Accessing dom properties is always fragile.
            // Also allows us to skip `addEventListeners` calls with no proper `this` context.
          }
        }
        return originalAddEventListener.call(this, type, listener, options);
      };
    });
    (0,_sentry_core__WEBPACK_IMPORTED_MODULE_2__.fill)(proto, 'removeEventListener', function (originalRemoveEventListener) {
      return function (type, listener, options) {
        if (type === 'click' || type == 'keypress') {
          try {
            const handlers = this.__sentry_instrumentation_handlers__ || {};
            const handlerForType = handlers[type];
            if (handlerForType) {
              handlerForType.refCount--;
              // If there are no longer any custom handlers of the current type on this element, we can remove ours, too.
              if (handlerForType.refCount <= 0) {
                originalRemoveEventListener.call(this, type, handlerForType.handler, options);
                handlerForType.handler = undefined;
                delete handlers[type]; // eslint-disable-line @typescript-eslint/no-dynamic-delete
              }

              // If there are no longer any custom handlers of any type on this element, cleanup everything.
              if (Object.keys(handlers).length === 0) {
                delete this.__sentry_instrumentation_handlers__;
              }
            }
          } catch (e) {
            // Accessing dom properties is always fragile.
            // Also allows us to skip `addEventListeners` calls with no proper `this` context.
          }
        }
        return originalRemoveEventListener.call(this, type, listener, options);
      };
    });
  });
}

/**
 * Check whether the event is similar to the last captured one. For example, two click events on the same button.
 */
function isSimilarToLastCapturedEvent(event) {
  // If both events have different type, then user definitely performed two separate actions. e.g. click + keypress.
  if (event.type !== lastCapturedEventType) {
    return false;
  }
  try {
    // If both events have the same type, it's still possible that actions were performed on different targets.
    // e.g. 2 clicks on different buttons.
    if (!event.target || event.target._sentryId !== lastCapturedEventTargetId) {
      return false;
    }
  } catch (e) {
    // just accessing `target` property can throw an exception in some rare circumstances
    // see: https://github.com/getsentry/sentry-javascript/issues/838
  }

  // If both events have the same type _and_ same `target` (an element which triggered an event, _not necessarily_
  // to which an event listener was attached), we treat them as the same action, as we want to capture
  // only one breadcrumb. e.g. multiple clicks on the same button, or typing inside a user input box.
  return true;
}

/**
 * Decide whether an event should be captured.
 * @param event event to be captured
 */
function shouldSkipDOMEvent(eventType, target) {
  // We are only interested in filtering `keypress` events for now.
  if (eventType !== 'keypress') {
    return false;
  }
  if (!target?.tagName) {
    return true;
  }

  // Only consider keypress events on actual input elements. This will disregard keypresses targeting body
  // e.g.tabbing through elements, hotkeys, etc.
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
    return false;
  }
  return true;
}

/**
 * Wraps addEventListener to capture UI breadcrumbs
 */
function makeDOMEventHandler(handler, globalListener) {
  if (globalListener === void 0) {
    globalListener = false;
  }
  return event => {
    // It's possible this handler might trigger multiple times for the same
    // event (e.g. event propagation through node ancestors).
    // Ignore if we've already captured that event.
    if (!event || event['_sentryCaptured']) {
      return;
    }
    const target = getEventTarget(event);

    // We always want to skip _some_ events.
    if (shouldSkipDOMEvent(event.type, target)) {
      return;
    }

    // Mark event as "seen"
    (0,_sentry_core__WEBPACK_IMPORTED_MODULE_2__.addNonEnumerableProperty)(event, '_sentryCaptured', true);
    if (target && !target._sentryId) {
      // Add UUID to event target so we can identify if
      (0,_sentry_core__WEBPACK_IMPORTED_MODULE_2__.addNonEnumerableProperty)(target, '_sentryId', (0,_sentry_core__WEBPACK_IMPORTED_MODULE_3__.uuid4)());
    }
    const name = event.type === 'keypress' ? 'input' : event.type;

    // If there is no last captured event, it means that we can safely capture the new event and store it for future comparisons.
    // If there is a last captured event, see if the new event is different enough to treat it as a unique one.
    // If that's the case, emit the previous event and store locally the newly-captured DOM event.
    if (!isSimilarToLastCapturedEvent(event)) {
      const handlerData = {
        event,
        name,
        global: globalListener
      };
      handler(handlerData);
      lastCapturedEventType = event.type;
      lastCapturedEventTargetId = target ? target._sentryId : undefined;
    }

    // Start a new debounce timer that will prevent us from capturing multiple events that should be grouped together.
    clearTimeout(debounceTimerID);
    debounceTimerID = _types_js__WEBPACK_IMPORTED_MODULE_1__.WINDOW.setTimeout(() => {
      lastCapturedEventTargetId = undefined;
      lastCapturedEventType = undefined;
    }, DEBOUNCE_DURATION);
  };
}
function getEventTarget(event) {
  try {
    return event.target;
  } catch (e) {
    // just accessing `target` property can throw an exception in some rare circumstances
    // see: https://github.com/getsentry/sentry-javascript/issues/838
    return null;
  }
}


/***/ }),

/***/ "./node_modules/@sentry-internal/browser-utils/build/esm/instrument/history.js":
/*!*************************************************************************************!*\
  !*** ./node_modules/@sentry-internal/browser-utils/build/esm/instrument/history.js ***!
  \*************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addHistoryInstrumentationHandler: () => (/* binding */ addHistoryInstrumentationHandler),
/* harmony export */   instrumentHistory: () => (/* binding */ instrumentHistory)
/* harmony export */ });
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils-hoist/instrument/handlers.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils-hoist/supports.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils-hoist/object.js");
/* harmony import */ var _types_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../types.js */ "./node_modules/@sentry-internal/browser-utils/build/esm/types.js");


let lastHref;

/**
 * Add an instrumentation handler for when a fetch request happens.
 * The handler function is called once when the request starts and once when it ends,
 * which can be identified by checking if it has an `endTimestamp`.
 *
 * Use at your own risk, this might break without changelog notice, only used internally.
 * @hidden
 */
function addHistoryInstrumentationHandler(handler) {
  const type = 'history';
  (0,_sentry_core__WEBPACK_IMPORTED_MODULE_0__.addHandler)(type, handler);
  (0,_sentry_core__WEBPACK_IMPORTED_MODULE_0__.maybeInstrument)(type, instrumentHistory);
}

/**
 * Exported just for testing
 */
function instrumentHistory() {
  // The `popstate` event may also be triggered on `pushState`, but it may not always reliably be emitted by the browser
  // Which is why we also monkey-patch methods below, in addition to this
  _types_js__WEBPACK_IMPORTED_MODULE_1__.WINDOW.addEventListener('popstate', () => {
    const to = _types_js__WEBPACK_IMPORTED_MODULE_1__.WINDOW.location.href;
    // keep track of the current URL state, as we always receive only the updated state
    const from = lastHref;
    lastHref = to;
    if (from === to) {
      return;
    }
    const handlerData = {
      from,
      to
    };
    (0,_sentry_core__WEBPACK_IMPORTED_MODULE_0__.triggerHandlers)('history', handlerData);
  });

  // Just guard against this not being available, in weird environments
  if (!(0,_sentry_core__WEBPACK_IMPORTED_MODULE_2__.supportsHistory)()) {
    return;
  }
  function historyReplacementFunction(originalHistoryFunction) {
    return function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      const url = args.length > 2 ? args[2] : undefined;
      if (url) {
        // coerce to string (this is what pushState does)
        const from = lastHref;
        const to = String(url);
        // keep track of the current URL state, as we always receive only the updated state
        lastHref = to;
        if (from === to) {
          return originalHistoryFunction.apply(this, args);
        }
        const handlerData = {
          from,
          to
        };
        (0,_sentry_core__WEBPACK_IMPORTED_MODULE_0__.triggerHandlers)('history', handlerData);
      }
      return originalHistoryFunction.apply(this, args);
    };
  }
  (0,_sentry_core__WEBPACK_IMPORTED_MODULE_3__.fill)(_types_js__WEBPACK_IMPORTED_MODULE_1__.WINDOW.history, 'pushState', historyReplacementFunction);
  (0,_sentry_core__WEBPACK_IMPORTED_MODULE_3__.fill)(_types_js__WEBPACK_IMPORTED_MODULE_1__.WINDOW.history, 'replaceState', historyReplacementFunction);
}


/***/ }),

/***/ "./node_modules/@sentry-internal/browser-utils/build/esm/instrument/xhr.js":
/*!*********************************************************************************!*\
  !*** ./node_modules/@sentry-internal/browser-utils/build/esm/instrument/xhr.js ***!
  \*********************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SENTRY_XHR_DATA_KEY: () => (/* binding */ SENTRY_XHR_DATA_KEY),
/* harmony export */   addXhrInstrumentationHandler: () => (/* binding */ addXhrInstrumentationHandler),
/* harmony export */   instrumentXHR: () => (/* binding */ instrumentXHR)
/* harmony export */ });
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils-hoist/instrument/handlers.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils-hoist/time.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils-hoist/is.js");
/* harmony import */ var _types_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../types.js */ "./node_modules/@sentry-internal/browser-utils/build/esm/types.js");


const SENTRY_XHR_DATA_KEY = '__sentry_xhr_v3__';

/**
 * Add an instrumentation handler for when an XHR request happens.
 * The handler function is called once when the request starts and once when it ends,
 * which can be identified by checking if it has an `endTimestamp`.
 *
 * Use at your own risk, this might break without changelog notice, only used internally.
 * @hidden
 */
function addXhrInstrumentationHandler(handler) {
  const type = 'xhr';
  (0,_sentry_core__WEBPACK_IMPORTED_MODULE_0__.addHandler)(type, handler);
  (0,_sentry_core__WEBPACK_IMPORTED_MODULE_0__.maybeInstrument)(type, instrumentXHR);
}

/** Exported only for tests. */
function instrumentXHR() {
  if (!_types_js__WEBPACK_IMPORTED_MODULE_1__.WINDOW.XMLHttpRequest) {
    return;
  }
  const xhrproto = XMLHttpRequest.prototype;

  // eslint-disable-next-line @typescript-eslint/unbound-method
  xhrproto.open = new Proxy(xhrproto.open, {
    apply(originalOpen, xhrOpenThisArg, xhrOpenArgArray) {
      // NOTE: If you are a Sentry user, and you are seeing this stack frame,
      //       it means the error, that was caused by your XHR call did not
      //       have a stack trace. If you are using HttpClient integration,
      //       this is the expected behavior, as we are using this virtual error to capture
      //       the location of your XHR call, and group your HttpClient events accordingly.
      const virtualError = new Error();
      const startTimestamp = (0,_sentry_core__WEBPACK_IMPORTED_MODULE_2__.timestampInSeconds)() * 1000;

      // open() should always be called with two or more arguments
      // But to be on the safe side, we actually validate this and bail out if we don't have a method & url
      const method = (0,_sentry_core__WEBPACK_IMPORTED_MODULE_3__.isString)(xhrOpenArgArray[0]) ? xhrOpenArgArray[0].toUpperCase() : undefined;
      const url = parseUrl(xhrOpenArgArray[1]);
      if (!method || !url) {
        return originalOpen.apply(xhrOpenThisArg, xhrOpenArgArray);
      }
      xhrOpenThisArg[SENTRY_XHR_DATA_KEY] = {
        method,
        url,
        request_headers: {}
      };

      // if Sentry key appears in URL, don't capture it as a request
      if (method === 'POST' && url.match(/sentry_key/)) {
        xhrOpenThisArg.__sentry_own_request__ = true;
      }
      const onreadystatechangeHandler = () => {
        // For whatever reason, this is not the same instance here as from the outer method
        const xhrInfo = xhrOpenThisArg[SENTRY_XHR_DATA_KEY];
        if (!xhrInfo) {
          return;
        }
        if (xhrOpenThisArg.readyState === 4) {
          try {
            // touching statusCode in some platforms throws
            // an exception
            xhrInfo.status_code = xhrOpenThisArg.status;
          } catch (e) {
            /* do nothing */
          }
          const handlerData = {
            endTimestamp: (0,_sentry_core__WEBPACK_IMPORTED_MODULE_2__.timestampInSeconds)() * 1000,
            startTimestamp,
            xhr: xhrOpenThisArg,
            virtualError
          };
          (0,_sentry_core__WEBPACK_IMPORTED_MODULE_0__.triggerHandlers)('xhr', handlerData);
        }
      };
      if ('onreadystatechange' in xhrOpenThisArg && typeof xhrOpenThisArg.onreadystatechange === 'function') {
        xhrOpenThisArg.onreadystatechange = new Proxy(xhrOpenThisArg.onreadystatechange, {
          apply(originalOnreadystatechange, onreadystatechangeThisArg, onreadystatechangeArgArray) {
            onreadystatechangeHandler();
            return originalOnreadystatechange.apply(onreadystatechangeThisArg, onreadystatechangeArgArray);
          }
        });
      } else {
        xhrOpenThisArg.addEventListener('readystatechange', onreadystatechangeHandler);
      }

      // Intercepting `setRequestHeader` to access the request headers of XHR instance.
      // This will only work for user/library defined headers, not for the default/browser-assigned headers.
      // Request cookies are also unavailable for XHR, as `Cookie` header can't be defined by `setRequestHeader`.
      xhrOpenThisArg.setRequestHeader = new Proxy(xhrOpenThisArg.setRequestHeader, {
        apply(originalSetRequestHeader, setRequestHeaderThisArg, setRequestHeaderArgArray) {
          const [header, value] = setRequestHeaderArgArray;
          const xhrInfo = setRequestHeaderThisArg[SENTRY_XHR_DATA_KEY];
          if (xhrInfo && (0,_sentry_core__WEBPACK_IMPORTED_MODULE_3__.isString)(header) && (0,_sentry_core__WEBPACK_IMPORTED_MODULE_3__.isString)(value)) {
            xhrInfo.request_headers[header.toLowerCase()] = value;
          }
          return originalSetRequestHeader.apply(setRequestHeaderThisArg, setRequestHeaderArgArray);
        }
      });
      return originalOpen.apply(xhrOpenThisArg, xhrOpenArgArray);
    }
  });

  // eslint-disable-next-line @typescript-eslint/unbound-method
  xhrproto.send = new Proxy(xhrproto.send, {
    apply(originalSend, sendThisArg, sendArgArray) {
      const sentryXhrData = sendThisArg[SENTRY_XHR_DATA_KEY];
      if (!sentryXhrData) {
        return originalSend.apply(sendThisArg, sendArgArray);
      }
      if (sendArgArray[0] !== undefined) {
        sentryXhrData.body = sendArgArray[0];
      }
      const handlerData = {
        startTimestamp: (0,_sentry_core__WEBPACK_IMPORTED_MODULE_2__.timestampInSeconds)() * 1000,
        xhr: sendThisArg
      };
      (0,_sentry_core__WEBPACK_IMPORTED_MODULE_0__.triggerHandlers)('xhr', handlerData);
      return originalSend.apply(sendThisArg, sendArgArray);
    }
  });
}
function parseUrl(url) {
  if ((0,_sentry_core__WEBPACK_IMPORTED_MODULE_3__.isString)(url)) {
    return url;
  }
  try {
    // url can be a string or URL
    // but since URL is not available in IE11, we do not check for it,
    // but simply assume it is an URL and return `toString()` from it (which returns the full URL)
    // If that fails, we just return undefined
    return url.toString();
  } catch {} // eslint-disable-line no-empty

  return undefined;
}


/***/ }),

/***/ "./node_modules/@sentry-internal/browser-utils/build/esm/types.js":
/*!************************************************************************!*\
  !*** ./node_modules/@sentry-internal/browser-utils/build/esm/types.js ***!
  \************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   WINDOW: () => (/* binding */ WINDOW)
/* harmony export */ });
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils-hoist/worldwide.js");

const WINDOW = _sentry_core__WEBPACK_IMPORTED_MODULE_0__.GLOBAL_OBJ;


/***/ }),

/***/ "./node_modules/@sentry/browser/build/npm/esm/client.js":
/*!**************************************************************!*\
  !*** ./node_modules/@sentry/browser/build/npm/esm/client.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BrowserClient: () => (/* binding */ BrowserClient)
/* harmony export */ });
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/client.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils-hoist/env.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils/sdkMetadata.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils/ipAddress.js");
/* harmony import */ var _eventbuilder_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./eventbuilder.js */ "./node_modules/@sentry/browser/build/npm/esm/eventbuilder.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./helpers.js */ "./node_modules/@sentry/browser/build/npm/esm/helpers.js");




/**
 * Configuration options for the Sentry Browser SDK.
 * @see @sentry/core Options for more information.
 */

/**
 * The Sentry Browser SDK Client.
 *
 * @see BrowserOptions for documentation on configuration options.
 * @see SentryClient for usage documentation.
 */
class BrowserClient extends _sentry_core__WEBPACK_IMPORTED_MODULE_0__.Client {
  /**
   * Creates a new Browser SDK instance.
   *
   * @param options Configuration options for this SDK.
   */
  constructor(options) {
    const opts = {
      // We default this to true, as it is the safer scenario
      parentSpanIsAlwaysRootSpan: true,
      ...options
    };
    const sdkSource = _helpers_js__WEBPACK_IMPORTED_MODULE_1__.WINDOW.SENTRY_SDK_SOURCE || (0,_sentry_core__WEBPACK_IMPORTED_MODULE_2__.getSDKSource)();
    (0,_sentry_core__WEBPACK_IMPORTED_MODULE_3__.applySdkMetadata)(opts, 'browser', ['browser'], sdkSource);
    super(opts);
    if (opts.sendClientReports && _helpers_js__WEBPACK_IMPORTED_MODULE_1__.WINDOW.document) {
      _helpers_js__WEBPACK_IMPORTED_MODULE_1__.WINDOW.document.addEventListener('visibilitychange', () => {
        if (_helpers_js__WEBPACK_IMPORTED_MODULE_1__.WINDOW.document.visibilityState === 'hidden') {
          this._flushOutcomes();
        }
      });
    }
    if (this._options.sendDefaultPii) {
      this.on('postprocessEvent', _sentry_core__WEBPACK_IMPORTED_MODULE_4__.addAutoIpAddressToUser);
      this.on('beforeSendSession', _sentry_core__WEBPACK_IMPORTED_MODULE_4__.addAutoIpAddressToSession);
    }
  }

  /**
   * @inheritDoc
   */
  eventFromException(exception, hint) {
    return (0,_eventbuilder_js__WEBPACK_IMPORTED_MODULE_5__.eventFromException)(this._options.stackParser, exception, hint, this._options.attachStacktrace);
  }

  /**
   * @inheritDoc
   */
  eventFromMessage(message, level, hint) {
    if (level === void 0) {
      level = 'info';
    }
    return (0,_eventbuilder_js__WEBPACK_IMPORTED_MODULE_5__.eventFromMessage)(this._options.stackParser, message, level, hint, this._options.attachStacktrace);
  }

  /**
   * @inheritDoc
   */
  _prepareEvent(event, hint, currentScope, isolationScope) {
    event.platform = event.platform || 'javascript';
    return super._prepareEvent(event, hint, currentScope, isolationScope);
  }
}


/***/ }),

/***/ "./node_modules/@sentry/browser/build/npm/esm/debug-build.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@sentry/browser/build/npm/esm/debug-build.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DEBUG_BUILD: () => (/* binding */ DEBUG_BUILD)
/* harmony export */ });
/**
 * This serves as a build time flag that will be true by default, but false in non-debug builds or if users replace `__SENTRY_DEBUG__` in their generated code.
 *
 * ATTENTION: This constant must never cross package boundaries (i.e. be exported) to guarantee that it can be used for tree shaking.
 */
const DEBUG_BUILD =  false || false;


/***/ }),

/***/ "./node_modules/@sentry/browser/build/npm/esm/eventbuilder.js":
/*!********************************************************************!*\
  !*** ./node_modules/@sentry/browser/build/npm/esm/eventbuilder.js ***!
  \********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   eventFromException: () => (/* binding */ eventFromException),
/* harmony export */   eventFromMessage: () => (/* binding */ eventFromMessage),
/* harmony export */   eventFromUnknownInput: () => (/* binding */ eventFromUnknownInput),
/* harmony export */   exceptionFromError: () => (/* binding */ exceptionFromError),
/* harmony export */   extractMessage: () => (/* binding */ extractMessage),
/* harmony export */   extractType: () => (/* binding */ extractType)
/* harmony export */ });
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/currentScopes.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils-hoist/normalize.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils-hoist/is.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils-hoist/misc.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils-hoist/syncpromise.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils-hoist/object.js");


/**
 * This function creates an exception from a JavaScript Error
 */
function exceptionFromError(stackParser, ex) {
  // Get the frames first since Opera can lose the stack if we touch anything else first
  const frames = parseStackFrames(stackParser, ex);
  const exception = {
    type: extractType(ex),
    value: extractMessage(ex)
  };
  if (frames.length) {
    exception.stacktrace = {
      frames
    };
  }
  if (exception.type === undefined && exception.value === '') {
    exception.value = 'Unrecoverable error caught';
  }
  return exception;
}
function eventFromPlainObject(stackParser, exception, syntheticException, isUnhandledRejection) {
  const client = (0,_sentry_core__WEBPACK_IMPORTED_MODULE_0__.getClient)();
  const normalizeDepth = client?.getOptions().normalizeDepth;

  // If we can, we extract an exception from the object properties
  const errorFromProp = getErrorPropertyFromObject(exception);
  const extra = {
    __serialized__: (0,_sentry_core__WEBPACK_IMPORTED_MODULE_1__.normalizeToSize)(exception, normalizeDepth)
  };
  if (errorFromProp) {
    return {
      exception: {
        values: [exceptionFromError(stackParser, errorFromProp)]
      },
      extra
    };
  }
  const event = {
    exception: {
      values: [{
        type: (0,_sentry_core__WEBPACK_IMPORTED_MODULE_2__.isEvent)(exception) ? exception.constructor.name : isUnhandledRejection ? 'UnhandledRejection' : 'Error',
        value: getNonErrorObjectExceptionValue(exception, {
          isUnhandledRejection
        })
      }]
    },
    extra
  };
  if (syntheticException) {
    const frames = parseStackFrames(stackParser, syntheticException);
    if (frames.length) {
      // event.exception.values[0] has been set above
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      event.exception.values[0].stacktrace = {
        frames
      };
    }
  }
  return event;
}
function eventFromError(stackParser, ex) {
  return {
    exception: {
      values: [exceptionFromError(stackParser, ex)]
    }
  };
}

/** Parses stack frames from an error */
function parseStackFrames(stackParser, ex) {
  // Access and store the stacktrace property before doing ANYTHING
  // else to it because Opera is not very good at providing it
  // reliably in other circumstances.
  const stacktrace = ex.stacktrace || ex.stack || '';
  const skipLines = getSkipFirstStackStringLines(ex);
  const framesToPop = getPopFirstTopFrames(ex);
  try {
    return stackParser(stacktrace, skipLines, framesToPop);
  } catch (e) {
    // no-empty
  }
  return [];
}

// Based on our own mapping pattern - https://github.com/getsentry/sentry/blob/9f08305e09866c8bd6d0c24f5b0aabdd7dd6c59c/src/sentry/lang/javascript/errormapping.py#L83-L108
const reactMinifiedRegexp = /Minified React error #\d+;/i;

/**
 * Certain known React errors contain links that would be falsely
 * parsed as frames. This function check for these errors and
 * returns number of the stack string lines to skip.
 */
function getSkipFirstStackStringLines(ex) {
  if (ex && reactMinifiedRegexp.test(ex.message)) {
    return 1;
  }
  return 0;
}

/**
 * If error has `framesToPop` property, it means that the
 * creator tells us the first x frames will be useless
 * and should be discarded. Typically error from wrapper function
 * which don't point to the actual location in the developer's code.
 *
 * Example: https://github.com/zertosh/invariant/blob/master/invariant.js#L46
 */
function getPopFirstTopFrames(ex) {
  if (typeof ex.framesToPop === 'number') {
    return ex.framesToPop;
  }
  return 0;
}

// https://developer.mozilla.org/en-US/docs/WebAssembly/JavaScript_interface/Exception
// @ts-expect-error - WebAssembly.Exception is a valid class
function isWebAssemblyException(exception) {
  // Check for support
  // @ts-expect-error - WebAssembly.Exception is a valid class
  if (typeof WebAssembly !== 'undefined' && typeof WebAssembly.Exception !== 'undefined') {
    // @ts-expect-error - WebAssembly.Exception is a valid class
    return exception instanceof WebAssembly.Exception;
  } else {
    return false;
  }
}

/**
 * Extracts from errors what we use as the exception `type` in error events.
 *
 * Usually, this is the `name` property on Error objects but WASM errors need to be treated differently.
 */
function extractType(ex) {
  const name = ex?.name;

  // The name for WebAssembly.Exception Errors needs to be extracted differently.
  // Context: https://github.com/getsentry/sentry-javascript/issues/13787
  if (!name && isWebAssemblyException(ex)) {
    // Emscripten sets array[type, message] to the "message" property on the WebAssembly.Exception object
    const hasTypeInMessage = ex.message && Array.isArray(ex.message) && ex.message.length == 2;
    return hasTypeInMessage ? ex.message[0] : 'WebAssembly.Exception';
  }
  return name;
}

/**
 * There are cases where stacktrace.message is an Event object
 * https://github.com/getsentry/sentry-javascript/issues/1949
 * In this specific case we try to extract stacktrace.message.error.message
 */
function extractMessage(ex) {
  const message = ex?.message;
  if (isWebAssemblyException(ex)) {
    // For Node 18, Emscripten sets array[type, message] to the "message" property on the WebAssembly.Exception object
    if (Array.isArray(ex.message) && ex.message.length == 2) {
      return ex.message[1];
    }
    return 'wasm exception';
  }
  if (!message) {
    return 'No error message';
  }
  if (message.error && typeof message.error.message === 'string') {
    return message.error.message;
  }
  return message;
}

/**
 * Creates an {@link Event} from all inputs to `captureException` and non-primitive inputs to `captureMessage`.
 * @hidden
 */
function eventFromException(stackParser, exception, hint, attachStacktrace) {
  const syntheticException = hint?.syntheticException || undefined;
  const event = eventFromUnknownInput(stackParser, exception, syntheticException, attachStacktrace);
  (0,_sentry_core__WEBPACK_IMPORTED_MODULE_3__.addExceptionMechanism)(event); // defaults to { type: 'generic', handled: true }
  event.level = 'error';
  if (hint?.event_id) {
    event.event_id = hint.event_id;
  }
  return (0,_sentry_core__WEBPACK_IMPORTED_MODULE_4__.resolvedSyncPromise)(event);
}

/**
 * Builds and Event from a Message
 * @hidden
 */
function eventFromMessage(stackParser, message, level, hint, attachStacktrace) {
  if (level === void 0) {
    level = 'info';
  }
  const syntheticException = hint?.syntheticException || undefined;
  const event = eventFromString(stackParser, message, syntheticException, attachStacktrace);
  event.level = level;
  if (hint?.event_id) {
    event.event_id = hint.event_id;
  }
  return (0,_sentry_core__WEBPACK_IMPORTED_MODULE_4__.resolvedSyncPromise)(event);
}

/**
 * @hidden
 */
function eventFromUnknownInput(stackParser, exception, syntheticException, attachStacktrace, isUnhandledRejection) {
  let event;
  if ((0,_sentry_core__WEBPACK_IMPORTED_MODULE_2__.isErrorEvent)(exception) && exception.error) {
    // If it is an ErrorEvent with `error` property, extract it to get actual Error
    const errorEvent = exception;
    return eventFromError(stackParser, errorEvent.error);
  }

  // If it is a `DOMError` (which is a legacy API, but still supported in some browsers) then we just extract the name
  // and message, as it doesn't provide anything else. According to the spec, all `DOMExceptions` should also be
  // `Error`s, but that's not the case in IE11, so in that case we treat it the same as we do a `DOMError`.
  //
  // https://developer.mozilla.org/en-US/docs/Web/API/DOMError
  // https://developer.mozilla.org/en-US/docs/Web/API/DOMException
  // https://webidl.spec.whatwg.org/#es-DOMException-specialness
  if ((0,_sentry_core__WEBPACK_IMPORTED_MODULE_2__.isDOMError)(exception) || (0,_sentry_core__WEBPACK_IMPORTED_MODULE_2__.isDOMException)(exception)) {
    const domException = exception;
    if ('stack' in exception) {
      event = eventFromError(stackParser, exception);
    } else {
      const name = domException.name || ((0,_sentry_core__WEBPACK_IMPORTED_MODULE_2__.isDOMError)(domException) ? 'DOMError' : 'DOMException');
      const message = domException.message ? `${name}: ${domException.message}` : name;
      event = eventFromString(stackParser, message, syntheticException, attachStacktrace);
      (0,_sentry_core__WEBPACK_IMPORTED_MODULE_3__.addExceptionTypeValue)(event, message);
    }
    if ('code' in domException) {
      // eslint-disable-next-line deprecation/deprecation
      event.tags = {
        ...event.tags,
        'DOMException.code': `${domException.code}`
      };
    }
    return event;
  }
  if ((0,_sentry_core__WEBPACK_IMPORTED_MODULE_2__.isError)(exception)) {
    // we have a real Error object, do nothing
    return eventFromError(stackParser, exception);
  }
  if ((0,_sentry_core__WEBPACK_IMPORTED_MODULE_2__.isPlainObject)(exception) || (0,_sentry_core__WEBPACK_IMPORTED_MODULE_2__.isEvent)(exception)) {
    // If it's a plain object or an instance of `Event` (the built-in JS kind, not this SDK's `Event` type), serialize
    // it manually. This will allow us to group events based on top-level keys which is much better than creating a new
    // group on any key/value change.
    const objectException = exception;
    event = eventFromPlainObject(stackParser, objectException, syntheticException, isUnhandledRejection);
    (0,_sentry_core__WEBPACK_IMPORTED_MODULE_3__.addExceptionMechanism)(event, {
      synthetic: true
    });
    return event;
  }

  // If none of previous checks were valid, then it means that it's not:
  // - an instance of DOMError
  // - an instance of DOMException
  // - an instance of Event
  // - an instance of Error
  // - a valid ErrorEvent (one with an error property)
  // - a plain Object
  //
  // So bail out and capture it as a simple message:
  event = eventFromString(stackParser, exception, syntheticException, attachStacktrace);
  (0,_sentry_core__WEBPACK_IMPORTED_MODULE_3__.addExceptionTypeValue)(event, `${exception}`, undefined);
  (0,_sentry_core__WEBPACK_IMPORTED_MODULE_3__.addExceptionMechanism)(event, {
    synthetic: true
  });
  return event;
}
function eventFromString(stackParser, message, syntheticException, attachStacktrace) {
  const event = {};
  if (attachStacktrace && syntheticException) {
    const frames = parseStackFrames(stackParser, syntheticException);
    if (frames.length) {
      event.exception = {
        values: [{
          value: message,
          stacktrace: {
            frames
          }
        }]
      };
    }
    (0,_sentry_core__WEBPACK_IMPORTED_MODULE_3__.addExceptionMechanism)(event, {
      synthetic: true
    });
  }
  if ((0,_sentry_core__WEBPACK_IMPORTED_MODULE_2__.isParameterizedString)(message)) {
    const {
      __sentry_template_string__,
      __sentry_template_values__
    } = message;
    event.logentry = {
      message: __sentry_template_string__,
      params: __sentry_template_values__
    };
    return event;
  }
  event.message = message;
  return event;
}
function getNonErrorObjectExceptionValue(exception, _ref) {
  let {
    isUnhandledRejection
  } = _ref;
  const keys = (0,_sentry_core__WEBPACK_IMPORTED_MODULE_5__.extractExceptionKeysForMessage)(exception);
  const captureType = isUnhandledRejection ? 'promise rejection' : 'exception';

  // Some ErrorEvent instances do not have an `error` property, which is why they are not handled before
  // We still want to try to get a decent message for these cases
  if ((0,_sentry_core__WEBPACK_IMPORTED_MODULE_2__.isErrorEvent)(exception)) {
    return `Event \`ErrorEvent\` captured as ${captureType} with message \`${exception.message}\``;
  }
  if ((0,_sentry_core__WEBPACK_IMPORTED_MODULE_2__.isEvent)(exception)) {
    const className = getObjectClassName(exception);
    return `Event \`${className}\` (type=${exception.type}) captured as ${captureType}`;
  }
  return `Object captured as ${captureType} with keys: ${keys}`;
}
function getObjectClassName(obj) {
  try {
    const prototype = Object.getPrototypeOf(obj);
    return prototype ? prototype.constructor.name : undefined;
  } catch (e) {
    // ignore errors here
  }
}

/** If a plain object has a property that is an `Error`, return this error. */
function getErrorPropertyFromObject(obj) {
  for (const prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      const value = obj[prop];
      if (value instanceof Error) {
        return value;
      }
    }
  }
  return undefined;
}


/***/ }),

/***/ "./node_modules/@sentry/browser/build/npm/esm/helpers.js":
/*!***************************************************************!*\
  !*** ./node_modules/@sentry/browser/build/npm/esm/helpers.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   WINDOW: () => (/* binding */ WINDOW),
/* harmony export */   ignoreNextOnError: () => (/* binding */ ignoreNextOnError),
/* harmony export */   shouldIgnoreOnError: () => (/* binding */ shouldIgnoreOnError),
/* harmony export */   wrap: () => (/* binding */ wrap)
/* harmony export */ });
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils-hoist/worldwide.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils-hoist/object.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/currentScopes.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils-hoist/misc.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/exports.js");

const WINDOW = _sentry_core__WEBPACK_IMPORTED_MODULE_0__.GLOBAL_OBJ;
let ignoreOnError = 0;

/**
 * @hidden
 */
function shouldIgnoreOnError() {
  return ignoreOnError > 0;
}

/**
 * @hidden
 */
function ignoreNextOnError() {
  // onerror should trigger before setTimeout
  ignoreOnError++;
  setTimeout(() => {
    ignoreOnError--;
  });
}

// eslint-disable-next-line @typescript-eslint/ban-types

/**
 * Instruments the given function and sends an event to Sentry every time the
 * function throws an exception.
 *
 * @param fn A function to wrap. It is generally safe to pass an unbound function, because the returned wrapper always
 * has a correct `this` context.
 * @returns The wrapped function.
 * @hidden
 */
function wrap(fn, options) {
  if (options === void 0) {
    options = {};
  }
  // for future readers what this does is wrap a function and then create
  // a bi-directional wrapping between them.
  //
  // example: wrapped = wrap(original);
  //  original.__sentry_wrapped__ -> wrapped
  //  wrapped.__sentry_original__ -> original

  function isFunction(fn) {
    return typeof fn === 'function';
  }
  if (!isFunction(fn)) {
    return fn;
  }
  try {
    // if we're dealing with a function that was previously wrapped, return
    // the original wrapper.
    const wrapper = fn.__sentry_wrapped__;
    if (wrapper) {
      if (typeof wrapper === 'function') {
        return wrapper;
      } else {
        // If we find that the `__sentry_wrapped__` function is not a function at the time of accessing it, it means
        // that something messed with it. In that case we want to return the originally passed function.
        return fn;
      }
    }

    // We don't wanna wrap it twice
    if ((0,_sentry_core__WEBPACK_IMPORTED_MODULE_1__.getOriginalFunction)(fn)) {
      return fn;
    }
  } catch (e) {
    // Just accessing custom props in some Selenium environments
    // can cause a "Permission denied" exception (see raven-js#495).
    // Bail on wrapping and return the function as-is (defers to window.onerror).
    return fn;
  }

  // Wrap the function itself
  // It is important that `sentryWrapped` is not an arrow function to preserve the context of `this`
  const sentryWrapped = function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    try {
      // Also wrap arguments that are themselves functions
      const wrappedArguments = args.map(arg => wrap(arg, options));

      // Attempt to invoke user-land function
      // NOTE: If you are a Sentry user, and you are seeing this stack frame, it
      //       means the sentry.javascript SDK caught an error invoking your application code. This
      //       is expected behavior and NOT indicative of a bug with sentry.javascript.
      return fn.apply(this, wrappedArguments);
    } catch (ex) {
      ignoreNextOnError();
      (0,_sentry_core__WEBPACK_IMPORTED_MODULE_2__.withScope)(scope => {
        scope.addEventProcessor(event => {
          if (options.mechanism) {
            (0,_sentry_core__WEBPACK_IMPORTED_MODULE_3__.addExceptionTypeValue)(event, undefined, undefined);
            (0,_sentry_core__WEBPACK_IMPORTED_MODULE_3__.addExceptionMechanism)(event, options.mechanism);
          }
          event.extra = {
            ...event.extra,
            arguments: args
          };
          return event;
        });
        (0,_sentry_core__WEBPACK_IMPORTED_MODULE_4__.captureException)(ex);
      });
      throw ex;
    }
  };

  // Wrap the wrapped function in a proxy, to ensure any other properties of the original function remain available
  try {
    for (const property in fn) {
      if (Object.prototype.hasOwnProperty.call(fn, property)) {
        sentryWrapped[property] = fn[property];
      }
    }
  } catch {
    // Accessing some objects may throw
    // ref: https://github.com/getsentry/sentry-javascript/issues/1168
  }

  // Signal that this function has been wrapped/filled already
  // for both debugging and to prevent it to being wrapped/filled twice
  (0,_sentry_core__WEBPACK_IMPORTED_MODULE_1__.markFunctionWrapped)(sentryWrapped, fn);
  (0,_sentry_core__WEBPACK_IMPORTED_MODULE_1__.addNonEnumerableProperty)(fn, '__sentry_wrapped__', sentryWrapped);

  // Restore original function name (not all browsers allow that)
  try {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const descriptor = Object.getOwnPropertyDescriptor(sentryWrapped, 'name');
    if (descriptor.configurable) {
      Object.defineProperty(sentryWrapped, 'name', {
        get() {
          return fn.name;
        }
      });
    }
  } catch {
    // This may throw if e.g. the descriptor does not exist, or a browser does not allow redefining `name`.
    // to save some bytes we simply try-catch this
  }
  return sentryWrapped;
}


/***/ }),

/***/ "./node_modules/@sentry/browser/build/npm/esm/integrations/breadcrumbs.js":
/*!********************************************************************************!*\
  !*** ./node_modules/@sentry/browser/build/npm/esm/integrations/breadcrumbs.js ***!
  \********************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   breadcrumbsIntegration: () => (/* binding */ breadcrumbsIntegration)
/* harmony export */ });
/* harmony import */ var _sentry_internal_browser_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @sentry-internal/browser-utils */ "./node_modules/@sentry-internal/browser-utils/build/esm/instrument/dom.js");
/* harmony import */ var _sentry_internal_browser_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @sentry-internal/browser-utils */ "./node_modules/@sentry-internal/browser-utils/build/esm/instrument/xhr.js");
/* harmony import */ var _sentry_internal_browser_utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @sentry-internal/browser-utils */ "./node_modules/@sentry-internal/browser-utils/build/esm/instrument/history.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils-hoist/instrument/console.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils-hoist/instrument/fetch.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/integration.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/currentScopes.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/breadcrumbs.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils-hoist/misc.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils-hoist/logger.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils-hoist/browser.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils-hoist/severity.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils-hoist/string.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils-hoist/breadcrumb-log-level.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils-hoist/url.js");
/* harmony import */ var _debug_build_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../debug-build.js */ "./node_modules/@sentry/browser/build/npm/esm/debug-build.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../helpers.js */ "./node_modules/@sentry/browser/build/npm/esm/helpers.js");





/* eslint-disable max-lines */

/** maxStringLength gets capped to prevent 100 breadcrumbs exceeding 1MB event payload size */
const MAX_ALLOWED_STRING_LENGTH = 1024;
const INTEGRATION_NAME = 'Breadcrumbs';
const _breadcrumbsIntegration = function (options) {
  if (options === void 0) {
    options = {};
  }
  const _options = {
    console: true,
    dom: true,
    fetch: true,
    history: true,
    sentry: true,
    xhr: true,
    ...options
  };
  return {
    name: INTEGRATION_NAME,
    setup(client) {
      if (_options.console) {
        (0,_sentry_core__WEBPACK_IMPORTED_MODULE_0__.addConsoleInstrumentationHandler)(_getConsoleBreadcrumbHandler(client));
      }
      if (_options.dom) {
        (0,_sentry_internal_browser_utils__WEBPACK_IMPORTED_MODULE_1__.addClickKeypressInstrumentationHandler)(_getDomBreadcrumbHandler(client, _options.dom));
      }
      if (_options.xhr) {
        (0,_sentry_internal_browser_utils__WEBPACK_IMPORTED_MODULE_2__.addXhrInstrumentationHandler)(_getXhrBreadcrumbHandler(client));
      }
      if (_options.fetch) {
        (0,_sentry_core__WEBPACK_IMPORTED_MODULE_3__.addFetchInstrumentationHandler)(_getFetchBreadcrumbHandler(client));
      }
      if (_options.history) {
        (0,_sentry_internal_browser_utils__WEBPACK_IMPORTED_MODULE_4__.addHistoryInstrumentationHandler)(_getHistoryBreadcrumbHandler(client));
      }
      if (_options.sentry) {
        client.on('beforeSendEvent', _getSentryBreadcrumbHandler(client));
      }
    }
  };
};
const breadcrumbsIntegration = (0,_sentry_core__WEBPACK_IMPORTED_MODULE_5__.defineIntegration)(_breadcrumbsIntegration);

/**
 * Adds a breadcrumb for Sentry events or transactions if this option is enabled.
 */
function _getSentryBreadcrumbHandler(client) {
  return function addSentryBreadcrumb(event) {
    if ((0,_sentry_core__WEBPACK_IMPORTED_MODULE_6__.getClient)() !== client) {
      return;
    }
    (0,_sentry_core__WEBPACK_IMPORTED_MODULE_7__.addBreadcrumb)({
      category: `sentry.${event.type === 'transaction' ? 'transaction' : 'event'}`,
      event_id: event.event_id,
      level: event.level,
      message: (0,_sentry_core__WEBPACK_IMPORTED_MODULE_8__.getEventDescription)(event)
    }, {
      event
    });
  };
}

/**
 * A HOC that creates a function that creates breadcrumbs from DOM API calls.
 * This is a HOC so that we get access to dom options in the closure.
 */
function _getDomBreadcrumbHandler(client, dom) {
  return function _innerDomBreadcrumb(handlerData) {
    if ((0,_sentry_core__WEBPACK_IMPORTED_MODULE_6__.getClient)() !== client) {
      return;
    }
    let target;
    let componentName;
    let keyAttrs = typeof dom === 'object' ? dom.serializeAttribute : undefined;
    let maxStringLength = typeof dom === 'object' && typeof dom.maxStringLength === 'number' ? dom.maxStringLength : undefined;
    if (maxStringLength && maxStringLength > MAX_ALLOWED_STRING_LENGTH) {
      _debug_build_js__WEBPACK_IMPORTED_MODULE_9__.DEBUG_BUILD && _sentry_core__WEBPACK_IMPORTED_MODULE_10__.logger.warn(`\`dom.maxStringLength\` cannot exceed ${MAX_ALLOWED_STRING_LENGTH}, but a value of ${maxStringLength} was configured. Sentry will use ${MAX_ALLOWED_STRING_LENGTH} instead.`);
      maxStringLength = MAX_ALLOWED_STRING_LENGTH;
    }
    if (typeof keyAttrs === 'string') {
      keyAttrs = [keyAttrs];
    }

    // Accessing event.target can throw (see getsentry/raven-js#838, #768)
    try {
      const event = handlerData.event;
      const element = _isEvent(event) ? event.target : event;
      target = (0,_sentry_core__WEBPACK_IMPORTED_MODULE_11__.htmlTreeAsString)(element, {
        keyAttrs,
        maxStringLength
      });
      componentName = (0,_sentry_core__WEBPACK_IMPORTED_MODULE_11__.getComponentName)(element);
    } catch (e) {
      target = '<unknown>';
    }
    if (target.length === 0) {
      return;
    }
    const breadcrumb = {
      category: `ui.${handlerData.name}`,
      message: target
    };
    if (componentName) {
      breadcrumb.data = {
        'ui.component_name': componentName
      };
    }
    (0,_sentry_core__WEBPACK_IMPORTED_MODULE_7__.addBreadcrumb)(breadcrumb, {
      event: handlerData.event,
      name: handlerData.name,
      global: handlerData.global
    });
  };
}

/**
 * Creates breadcrumbs from console API calls
 */
function _getConsoleBreadcrumbHandler(client) {
  return function _consoleBreadcrumb(handlerData) {
    if ((0,_sentry_core__WEBPACK_IMPORTED_MODULE_6__.getClient)() !== client) {
      return;
    }
    const breadcrumb = {
      category: 'console',
      data: {
        arguments: handlerData.args,
        logger: 'console'
      },
      level: (0,_sentry_core__WEBPACK_IMPORTED_MODULE_12__.severityLevelFromString)(handlerData.level),
      message: (0,_sentry_core__WEBPACK_IMPORTED_MODULE_13__.safeJoin)(handlerData.args, ' ')
    };
    if (handlerData.level === 'assert') {
      if (handlerData.args[0] === false) {
        breadcrumb.message = `Assertion failed: ${(0,_sentry_core__WEBPACK_IMPORTED_MODULE_13__.safeJoin)(handlerData.args.slice(1), ' ') || 'console.assert'}`;
        breadcrumb.data.arguments = handlerData.args.slice(1);
      } else {
        // Don't capture a breadcrumb for passed assertions
        return;
      }
    }
    (0,_sentry_core__WEBPACK_IMPORTED_MODULE_7__.addBreadcrumb)(breadcrumb, {
      input: handlerData.args,
      level: handlerData.level
    });
  };
}

/**
 * Creates breadcrumbs from XHR API calls
 */
function _getXhrBreadcrumbHandler(client) {
  return function _xhrBreadcrumb(handlerData) {
    if ((0,_sentry_core__WEBPACK_IMPORTED_MODULE_6__.getClient)() !== client) {
      return;
    }
    const {
      startTimestamp,
      endTimestamp
    } = handlerData;
    const sentryXhrData = handlerData.xhr[_sentry_internal_browser_utils__WEBPACK_IMPORTED_MODULE_2__.SENTRY_XHR_DATA_KEY];

    // We only capture complete, non-sentry requests
    if (!startTimestamp || !endTimestamp || !sentryXhrData) {
      return;
    }
    const {
      method,
      url,
      status_code,
      body
    } = sentryXhrData;
    const data = {
      method,
      url,
      status_code
    };
    const hint = {
      xhr: handlerData.xhr,
      input: body,
      startTimestamp,
      endTimestamp
    };
    const breadcrumb = {
      category: 'xhr',
      data,
      type: 'http',
      level: (0,_sentry_core__WEBPACK_IMPORTED_MODULE_14__.getBreadcrumbLogLevelFromHttpStatusCode)(status_code)
    };
    client.emit('beforeOutgoingRequestBreadcrumb', breadcrumb, hint);
    (0,_sentry_core__WEBPACK_IMPORTED_MODULE_7__.addBreadcrumb)(breadcrumb, hint);
  };
}

/**
 * Creates breadcrumbs from fetch API calls
 */
function _getFetchBreadcrumbHandler(client) {
  return function _fetchBreadcrumb(handlerData) {
    if ((0,_sentry_core__WEBPACK_IMPORTED_MODULE_6__.getClient)() !== client) {
      return;
    }
    const {
      startTimestamp,
      endTimestamp
    } = handlerData;

    // We only capture complete fetch requests
    if (!endTimestamp) {
      return;
    }
    if (handlerData.fetchData.url.match(/sentry_key/) && handlerData.fetchData.method === 'POST') {
      // We will not create breadcrumbs for fetch requests that contain `sentry_key` (internal sentry requests)
      return;
    }
    ({
      method: handlerData.fetchData.method,
      url: handlerData.fetchData.url
    });
    if (handlerData.error) {
      const data = handlerData.fetchData;
      const hint = {
        data: handlerData.error,
        input: handlerData.args,
        startTimestamp,
        endTimestamp
      };
      const breadcrumb = {
        category: 'fetch',
        data,
        level: 'error',
        type: 'http'
      };
      client.emit('beforeOutgoingRequestBreadcrumb', breadcrumb, hint);
      (0,_sentry_core__WEBPACK_IMPORTED_MODULE_7__.addBreadcrumb)(breadcrumb, hint);
    } else {
      const response = handlerData.response;
      const data = {
        ...handlerData.fetchData,
        status_code: response?.status
      };
      handlerData.fetchData.request_body_size;
      handlerData.fetchData.response_body_size;
      response?.status;
      const hint = {
        input: handlerData.args,
        response,
        startTimestamp,
        endTimestamp
      };
      const breadcrumb = {
        category: 'fetch',
        data,
        type: 'http',
        level: (0,_sentry_core__WEBPACK_IMPORTED_MODULE_14__.getBreadcrumbLogLevelFromHttpStatusCode)(data.status_code)
      };
      client.emit('beforeOutgoingRequestBreadcrumb', breadcrumb, hint);
      (0,_sentry_core__WEBPACK_IMPORTED_MODULE_7__.addBreadcrumb)(breadcrumb, hint);
    }
  };
}

/**
 * Creates breadcrumbs from history API calls
 */
function _getHistoryBreadcrumbHandler(client) {
  return function _historyBreadcrumb(handlerData) {
    if ((0,_sentry_core__WEBPACK_IMPORTED_MODULE_6__.getClient)() !== client) {
      return;
    }
    let from = handlerData.from;
    let to = handlerData.to;
    const parsedLoc = (0,_sentry_core__WEBPACK_IMPORTED_MODULE_15__.parseUrl)(_helpers_js__WEBPACK_IMPORTED_MODULE_16__.WINDOW.location.href);
    let parsedFrom = from ? (0,_sentry_core__WEBPACK_IMPORTED_MODULE_15__.parseUrl)(from) : undefined;
    const parsedTo = (0,_sentry_core__WEBPACK_IMPORTED_MODULE_15__.parseUrl)(to);

    // Initial pushState doesn't provide `from` information
    if (!parsedFrom?.path) {
      parsedFrom = parsedLoc;
    }

    // Use only the path component of the URL if the URL matches the current
    // document (almost all the time when using pushState)
    if (parsedLoc.protocol === parsedTo.protocol && parsedLoc.host === parsedTo.host) {
      to = parsedTo.relative;
    }
    if (parsedLoc.protocol === parsedFrom.protocol && parsedLoc.host === parsedFrom.host) {
      from = parsedFrom.relative;
    }
    (0,_sentry_core__WEBPACK_IMPORTED_MODULE_7__.addBreadcrumb)({
      category: 'navigation',
      data: {
        from,
        to
      }
    });
  };
}
function _isEvent(event) {
  return !!event && !!event.target;
}


/***/ }),

/***/ "./node_modules/@sentry/browser/build/npm/esm/integrations/browserapierrors.js":
/*!*************************************************************************************!*\
  !*** ./node_modules/@sentry/browser/build/npm/esm/integrations/browserapierrors.js ***!
  \*************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   browserApiErrorsIntegration: () => (/* binding */ browserApiErrorsIntegration)
/* harmony export */ });
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils-hoist/object.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/integration.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils-hoist/stacktrace.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../helpers.js */ "./node_modules/@sentry/browser/build/npm/esm/helpers.js");


const DEFAULT_EVENT_TARGET = ['EventTarget', 'Window', 'Node', 'ApplicationCache', 'AudioTrackList', 'BroadcastChannel', 'ChannelMergerNode', 'CryptoOperation', 'EventSource', 'FileReader', 'HTMLUnknownElement', 'IDBDatabase', 'IDBRequest', 'IDBTransaction', 'KeyOperation', 'MediaController', 'MessagePort', 'ModalWindow', 'Notification', 'SVGElementInstance', 'Screen', 'SharedWorker', 'TextTrack', 'TextTrackCue', 'TextTrackList', 'WebSocket', 'WebSocketWorker', 'Worker', 'XMLHttpRequest', 'XMLHttpRequestEventTarget', 'XMLHttpRequestUpload'];
const INTEGRATION_NAME = 'BrowserApiErrors';
const _browserApiErrorsIntegration = function (options) {
  if (options === void 0) {
    options = {};
  }
  const _options = {
    XMLHttpRequest: true,
    eventTarget: true,
    requestAnimationFrame: true,
    setInterval: true,
    setTimeout: true,
    ...options
  };
  return {
    name: INTEGRATION_NAME,
    // TODO: This currently only works for the first client this is setup
    // We may want to adjust this to check for client etc.
    setupOnce() {
      if (_options.setTimeout) {
        (0,_sentry_core__WEBPACK_IMPORTED_MODULE_0__.fill)(_helpers_js__WEBPACK_IMPORTED_MODULE_1__.WINDOW, 'setTimeout', _wrapTimeFunction);
      }
      if (_options.setInterval) {
        (0,_sentry_core__WEBPACK_IMPORTED_MODULE_0__.fill)(_helpers_js__WEBPACK_IMPORTED_MODULE_1__.WINDOW, 'setInterval', _wrapTimeFunction);
      }
      if (_options.requestAnimationFrame) {
        (0,_sentry_core__WEBPACK_IMPORTED_MODULE_0__.fill)(_helpers_js__WEBPACK_IMPORTED_MODULE_1__.WINDOW, 'requestAnimationFrame', _wrapRAF);
      }
      if (_options.XMLHttpRequest && "XMLHttpRequest" in _helpers_js__WEBPACK_IMPORTED_MODULE_1__.WINDOW) {
        (0,_sentry_core__WEBPACK_IMPORTED_MODULE_0__.fill)(XMLHttpRequest.prototype, 'send', _wrapXHR);
      }
      const eventTargetOption = _options.eventTarget;
      if (eventTargetOption) {
        const eventTarget = Array.isArray(eventTargetOption) ? eventTargetOption : DEFAULT_EVENT_TARGET;
        eventTarget.forEach(_wrapEventTarget);
      }
    }
  };
};

/**
 * Wrap timer functions and event targets to catch errors and provide better meta data.
 */
const browserApiErrorsIntegration = (0,_sentry_core__WEBPACK_IMPORTED_MODULE_2__.defineIntegration)(_browserApiErrorsIntegration);
function _wrapTimeFunction(original) {
  return function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    const originalCallback = args[0];
    args[0] = (0,_helpers_js__WEBPACK_IMPORTED_MODULE_1__.wrap)(originalCallback, {
      mechanism: {
        data: {
          function: (0,_sentry_core__WEBPACK_IMPORTED_MODULE_3__.getFunctionName)(original)
        },
        handled: false,
        type: 'instrument'
      }
    });
    return original.apply(this, args);
  };
}
function _wrapRAF(original) {
  return function (callback) {
    return original.apply(this, [(0,_helpers_js__WEBPACK_IMPORTED_MODULE_1__.wrap)(callback, {
      mechanism: {
        data: {
          function: 'requestAnimationFrame',
          handler: (0,_sentry_core__WEBPACK_IMPORTED_MODULE_3__.getFunctionName)(original)
        },
        handled: false,
        type: 'instrument'
      }
    })]);
  };
}
function _wrapXHR(originalSend) {
  return function () {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const xhr = this;
    const xmlHttpRequestProps = ['onload', 'onerror', 'onprogress', 'onreadystatechange'];
    xmlHttpRequestProps.forEach(prop => {
      if (prop in xhr && typeof xhr[prop] === 'function') {
        (0,_sentry_core__WEBPACK_IMPORTED_MODULE_0__.fill)(xhr, prop, function (original) {
          const wrapOptions = {
            mechanism: {
              data: {
                function: prop,
                handler: (0,_sentry_core__WEBPACK_IMPORTED_MODULE_3__.getFunctionName)(original)
              },
              handled: false,
              type: 'instrument'
            }
          };

          // If Instrument integration has been called before BrowserApiErrors, get the name of original function
          const originalFunction = (0,_sentry_core__WEBPACK_IMPORTED_MODULE_0__.getOriginalFunction)(original);
          if (originalFunction) {
            wrapOptions.mechanism.data.handler = (0,_sentry_core__WEBPACK_IMPORTED_MODULE_3__.getFunctionName)(originalFunction);
          }

          // Otherwise wrap directly
          return (0,_helpers_js__WEBPACK_IMPORTED_MODULE_1__.wrap)(original, wrapOptions);
        });
      }
    });
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }
    return originalSend.apply(this, args);
  };
}
function _wrapEventTarget(target) {
  const globalObject = _helpers_js__WEBPACK_IMPORTED_MODULE_1__.WINDOW;
  const proto = globalObject[target]?.prototype;

  // eslint-disable-next-line no-prototype-builtins
  if (!proto?.hasOwnProperty?.('addEventListener')) {
    return;
  }
  (0,_sentry_core__WEBPACK_IMPORTED_MODULE_0__.fill)(proto, 'addEventListener', function (original) {
    return function (eventName, fn, options) {
      try {
        if (isEventListenerObject(fn)) {
          // ESlint disable explanation:
          //  First, it is generally safe to call `wrap` with an unbound function. Furthermore, using `.bind()` would
          //  introduce a bug here, because bind returns a new function that doesn't have our
          //  flags(like __sentry_original__) attached. `wrap` checks for those flags to avoid unnecessary wrapping.
          //  Without those flags, every call to addEventListener wraps the function again, causing a memory leak.
          // eslint-disable-next-line @typescript-eslint/unbound-method
          fn.handleEvent = (0,_helpers_js__WEBPACK_IMPORTED_MODULE_1__.wrap)(fn.handleEvent, {
            mechanism: {
              data: {
                function: 'handleEvent',
                handler: (0,_sentry_core__WEBPACK_IMPORTED_MODULE_3__.getFunctionName)(fn),
                target
              },
              handled: false,
              type: 'instrument'
            }
          });
        }
      } catch {
        // can sometimes get 'Permission denied to access property "handle Event'
      }
      return original.apply(this, [eventName, (0,_helpers_js__WEBPACK_IMPORTED_MODULE_1__.wrap)(fn, {
        mechanism: {
          data: {
            function: 'addEventListener',
            handler: (0,_sentry_core__WEBPACK_IMPORTED_MODULE_3__.getFunctionName)(fn),
            target
          },
          handled: false,
          type: 'instrument'
        }
      }), options]);
    };
  });
  (0,_sentry_core__WEBPACK_IMPORTED_MODULE_0__.fill)(proto, 'removeEventListener', function (originalRemoveEventListener) {
    return function (eventName, fn, options) {
      /**
       * There are 2 possible scenarios here:
       *
       * 1. Someone passes a callback, which was attached prior to Sentry initialization, or by using unmodified
       * method, eg. `document.addEventListener.call(el, name, handler). In this case, we treat this function
       * as a pass-through, and call original `removeEventListener` with it.
       *
       * 2. Someone passes a callback, which was attached after Sentry was initialized, which means that it was using
       * our wrapped version of `addEventListener`, which internally calls `wrap` helper.
       * This helper "wraps" whole callback inside a try/catch statement, and attached appropriate metadata to it,
       * in order for us to make a distinction between wrapped/non-wrapped functions possible.
       * If a function was wrapped, it has additional property of `__sentry_wrapped__`, holding the handler.
       *
       * When someone adds a handler prior to initialization, and then do it again, but after,
       * then we have to detach both of them. Otherwise, if we'd detach only wrapped one, it'd be impossible
       * to get rid of the initial handler and it'd stick there forever.
       */
      try {
        const originalEventHandler = fn.__sentry_wrapped__;
        if (originalEventHandler) {
          originalRemoveEventListener.call(this, eventName, originalEventHandler, options);
        }
      } catch (e) {
        // ignore, accessing __sentry_wrapped__ will throw in some Selenium environments
      }
      return originalRemoveEventListener.call(this, eventName, fn, options);
    };
  });
}
function isEventListenerObject(obj) {
  return typeof obj.handleEvent === 'function';
}


/***/ }),

/***/ "./node_modules/@sentry/browser/build/npm/esm/integrations/browsersession.js":
/*!***********************************************************************************!*\
  !*** ./node_modules/@sentry/browser/build/npm/esm/integrations/browsersession.js ***!
  \***********************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   browserSessionIntegration: () => (/* binding */ browserSessionIntegration)
/* harmony export */ });
/* harmony import */ var _sentry_internal_browser_utils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @sentry-internal/browser-utils */ "./node_modules/@sentry-internal/browser-utils/build/esm/instrument/history.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/integration.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils-hoist/logger.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/exports.js");
/* harmony import */ var _debug_build_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../debug-build.js */ "./node_modules/@sentry/browser/build/npm/esm/debug-build.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../helpers.js */ "./node_modules/@sentry/browser/build/npm/esm/helpers.js");





/**
 * When added, automatically creates sessions which allow you to track adoption and crashes (crash free rate) in your Releases in Sentry.
 * More information: https://docs.sentry.io/product/releases/health/
 *
 * Note: In order for session tracking to work, you need to set up Releases: https://docs.sentry.io/product/releases/
 */
const browserSessionIntegration = (0,_sentry_core__WEBPACK_IMPORTED_MODULE_0__.defineIntegration)(() => {
  return {
    name: 'BrowserSession',
    setupOnce() {
      if (typeof _helpers_js__WEBPACK_IMPORTED_MODULE_1__.WINDOW.document === 'undefined') {
        _debug_build_js__WEBPACK_IMPORTED_MODULE_2__.DEBUG_BUILD && _sentry_core__WEBPACK_IMPORTED_MODULE_3__.logger.warn('Using the `browserSessionIntegration` in non-browser environments is not supported.');
        return;
      }

      // The session duration for browser sessions does not track a meaningful
      // concept that can be used as a metric.
      // Automatically captured sessions are akin to page views, and thus we
      // discard their duration.
      (0,_sentry_core__WEBPACK_IMPORTED_MODULE_4__.startSession)({
        ignoreDuration: true
      });
      (0,_sentry_core__WEBPACK_IMPORTED_MODULE_4__.captureSession)();

      // We want to create a session for every navigation as well
      (0,_sentry_internal_browser_utils__WEBPACK_IMPORTED_MODULE_5__.addHistoryInstrumentationHandler)(_ref => {
        let {
          from,
          to
        } = _ref;
        // Don't create an additional session for the initial route or if the location did not change
        if (from !== undefined && from !== to) {
          (0,_sentry_core__WEBPACK_IMPORTED_MODULE_4__.startSession)({
            ignoreDuration: true
          });
          (0,_sentry_core__WEBPACK_IMPORTED_MODULE_4__.captureSession)();
        }
      });
    }
  };
});


/***/ }),

/***/ "./node_modules/@sentry/browser/build/npm/esm/integrations/globalhandlers.js":
/*!***********************************************************************************!*\
  !*** ./node_modules/@sentry/browser/build/npm/esm/integrations/globalhandlers.js ***!
  \***********************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   globalHandlersIntegration: () => (/* binding */ globalHandlersIntegration)
/* harmony export */ });
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/integration.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils-hoist/instrument/globalError.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/currentScopes.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/exports.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils-hoist/instrument/globalUnhandledRejection.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils-hoist/is.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils-hoist/browser.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils-hoist/stacktrace.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils-hoist/logger.js");
/* harmony import */ var _debug_build_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../debug-build.js */ "./node_modules/@sentry/browser/build/npm/esm/debug-build.js");
/* harmony import */ var _eventbuilder_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../eventbuilder.js */ "./node_modules/@sentry/browser/build/npm/esm/eventbuilder.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../helpers.js */ "./node_modules/@sentry/browser/build/npm/esm/helpers.js");




const INTEGRATION_NAME = 'GlobalHandlers';
const _globalHandlersIntegration = function (options) {
  if (options === void 0) {
    options = {};
  }
  const _options = {
    onerror: true,
    onunhandledrejection: true,
    ...options
  };
  return {
    name: INTEGRATION_NAME,
    setupOnce() {
      Error.stackTraceLimit = 50;
    },
    setup(client) {
      if (_options.onerror) {
        _installGlobalOnErrorHandler(client);
        globalHandlerLog('onerror');
      }
      if (_options.onunhandledrejection) {
        _installGlobalOnUnhandledRejectionHandler(client);
        globalHandlerLog('onunhandledrejection');
      }
    }
  };
};
const globalHandlersIntegration = (0,_sentry_core__WEBPACK_IMPORTED_MODULE_0__.defineIntegration)(_globalHandlersIntegration);
function _installGlobalOnErrorHandler(client) {
  (0,_sentry_core__WEBPACK_IMPORTED_MODULE_1__.addGlobalErrorInstrumentationHandler)(data => {
    const {
      stackParser,
      attachStacktrace
    } = getOptions();
    if ((0,_sentry_core__WEBPACK_IMPORTED_MODULE_2__.getClient)() !== client || (0,_helpers_js__WEBPACK_IMPORTED_MODULE_3__.shouldIgnoreOnError)()) {
      return;
    }
    const {
      msg,
      url,
      line,
      column,
      error
    } = data;
    const event = _enhanceEventWithInitialFrame((0,_eventbuilder_js__WEBPACK_IMPORTED_MODULE_4__.eventFromUnknownInput)(stackParser, error || msg, undefined, attachStacktrace, false), url, line, column);
    event.level = 'error';
    (0,_sentry_core__WEBPACK_IMPORTED_MODULE_5__.captureEvent)(event, {
      originalException: error,
      mechanism: {
        handled: false,
        type: 'onerror'
      }
    });
  });
}
function _installGlobalOnUnhandledRejectionHandler(client) {
  (0,_sentry_core__WEBPACK_IMPORTED_MODULE_6__.addGlobalUnhandledRejectionInstrumentationHandler)(e => {
    const {
      stackParser,
      attachStacktrace
    } = getOptions();
    if ((0,_sentry_core__WEBPACK_IMPORTED_MODULE_2__.getClient)() !== client || (0,_helpers_js__WEBPACK_IMPORTED_MODULE_3__.shouldIgnoreOnError)()) {
      return;
    }
    const error = _getUnhandledRejectionError(e);
    const event = (0,_sentry_core__WEBPACK_IMPORTED_MODULE_7__.isPrimitive)(error) ? _eventFromRejectionWithPrimitive(error) : (0,_eventbuilder_js__WEBPACK_IMPORTED_MODULE_4__.eventFromUnknownInput)(stackParser, error, undefined, attachStacktrace, true);
    event.level = 'error';
    (0,_sentry_core__WEBPACK_IMPORTED_MODULE_5__.captureEvent)(event, {
      originalException: error,
      mechanism: {
        handled: false,
        type: 'onunhandledrejection'
      }
    });
  });
}
function _getUnhandledRejectionError(error) {
  if ((0,_sentry_core__WEBPACK_IMPORTED_MODULE_7__.isPrimitive)(error)) {
    return error;
  }

  // dig the object of the rejection out of known event types
  try {
    // PromiseRejectionEvents store the object of the rejection under 'reason'
    // see https://developer.mozilla.org/en-US/docs/Web/API/PromiseRejectionEvent
    if ('reason' in error) {
      return error.reason;
    }

    // something, somewhere, (likely a browser extension) effectively casts PromiseRejectionEvents
    // to CustomEvents, moving the `promise` and `reason` attributes of the PRE into
    // the CustomEvent's `detail` attribute, since they're not part of CustomEvent's spec
    // see https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent and
    // https://github.com/getsentry/sentry-javascript/issues/2380
    if ('detail' in error && 'reason' in error.detail) {
      return error.detail.reason;
    }
  } catch {} // eslint-disable-line no-empty

  return error;
}

/**
 * Create an event from a promise rejection where the `reason` is a primitive.
 *
 * @param reason: The `reason` property of the promise rejection
 * @returns An Event object with an appropriate `exception` value
 */
function _eventFromRejectionWithPrimitive(reason) {
  return {
    exception: {
      values: [{
        type: 'UnhandledRejection',
        // String() is needed because the Primitive type includes symbols (which can't be automatically stringified)
        value: `Non-Error promise rejection captured with value: ${String(reason)}`
      }]
    }
  };
}
function _enhanceEventWithInitialFrame(event, url, line, column) {
  // event.exception
  const e = event.exception = event.exception || {};
  // event.exception.values
  const ev = e.values = e.values || [];
  // event.exception.values[0]
  const ev0 = ev[0] = ev[0] || {};
  // event.exception.values[0].stacktrace
  const ev0s = ev0.stacktrace = ev0.stacktrace || {};
  // event.exception.values[0].stacktrace.frames
  const ev0sf = ev0s.frames = ev0s.frames || [];
  const colno = column;
  const lineno = line;
  const filename = (0,_sentry_core__WEBPACK_IMPORTED_MODULE_7__.isString)(url) && url.length > 0 ? url : (0,_sentry_core__WEBPACK_IMPORTED_MODULE_8__.getLocationHref)();

  // event.exception.values[0].stacktrace.frames
  if (ev0sf.length === 0) {
    ev0sf.push({
      colno,
      filename,
      function: _sentry_core__WEBPACK_IMPORTED_MODULE_9__.UNKNOWN_FUNCTION,
      in_app: true,
      lineno
    });
  }
  return event;
}
function globalHandlerLog(type) {
  _debug_build_js__WEBPACK_IMPORTED_MODULE_10__.DEBUG_BUILD && _sentry_core__WEBPACK_IMPORTED_MODULE_11__.logger.log(`Global Handler attached: ${type}`);
}
function getOptions() {
  const client = (0,_sentry_core__WEBPACK_IMPORTED_MODULE_2__.getClient)();
  const options = client?.getOptions() || {
    stackParser: () => [],
    attachStacktrace: false
  };
  return options;
}


/***/ }),

/***/ "./node_modules/@sentry/browser/build/npm/esm/integrations/httpcontext.js":
/*!********************************************************************************!*\
  !*** ./node_modules/@sentry/browser/build/npm/esm/integrations/httpcontext.js ***!
  \********************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   httpContextIntegration: () => (/* binding */ httpContextIntegration)
/* harmony export */ });
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/integration.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils-hoist/browser.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../helpers.js */ "./node_modules/@sentry/browser/build/npm/esm/helpers.js");



/**
 * Collects information about HTTP request headers and
 * attaches them to the event.
 */
const httpContextIntegration = (0,_sentry_core__WEBPACK_IMPORTED_MODULE_0__.defineIntegration)(() => {
  return {
    name: 'HttpContext',
    preprocessEvent(event) {
      // if none of the information we want exists, don't bother
      if (!_helpers_js__WEBPACK_IMPORTED_MODULE_1__.WINDOW.navigator && !_helpers_js__WEBPACK_IMPORTED_MODULE_1__.WINDOW.location && !_helpers_js__WEBPACK_IMPORTED_MODULE_1__.WINDOW.document) {
        return;
      }

      // grab as much info as exists and add it to the event
      const url = event.request?.url || (0,_sentry_core__WEBPACK_IMPORTED_MODULE_2__.getLocationHref)();
      const {
        referrer
      } = _helpers_js__WEBPACK_IMPORTED_MODULE_1__.WINDOW.document || {};
      const {
        userAgent
      } = _helpers_js__WEBPACK_IMPORTED_MODULE_1__.WINDOW.navigator || {};
      const headers = {
        ...event.request?.headers,
        ...(referrer && {
          Referer: referrer
        }),
        ...(userAgent && {
          'User-Agent': userAgent
        })
      };
      const request = {
        ...event.request,
        ...(url && {
          url
        }),
        headers
      };
      event.request = request;
    }
  };
});


/***/ }),

/***/ "./node_modules/@sentry/browser/build/npm/esm/integrations/linkederrors.js":
/*!*********************************************************************************!*\
  !*** ./node_modules/@sentry/browser/build/npm/esm/integrations/linkederrors.js ***!
  \*********************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   linkedErrorsIntegration: () => (/* binding */ linkedErrorsIntegration)
/* harmony export */ });
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils-hoist/aggregate-errors.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/integration.js");
/* harmony import */ var _eventbuilder_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../eventbuilder.js */ "./node_modules/@sentry/browser/build/npm/esm/eventbuilder.js");


const DEFAULT_KEY = 'cause';
const DEFAULT_LIMIT = 5;
const INTEGRATION_NAME = 'LinkedErrors';
const _linkedErrorsIntegration = function (options) {
  if (options === void 0) {
    options = {};
  }
  const limit = options.limit || DEFAULT_LIMIT;
  const key = options.key || DEFAULT_KEY;
  return {
    name: INTEGRATION_NAME,
    preprocessEvent(event, hint, client) {
      const options = client.getOptions();
      (0,_sentry_core__WEBPACK_IMPORTED_MODULE_0__.applyAggregateErrorsToEvent)(
      // This differs from the LinkedErrors integration in core by using a different exceptionFromError function
      _eventbuilder_js__WEBPACK_IMPORTED_MODULE_1__.exceptionFromError, options.stackParser, options.maxValueLength, key, limit, event, hint);
    }
  };
};

/**
 * Aggregrate linked errors in an event.
 */
const linkedErrorsIntegration = (0,_sentry_core__WEBPACK_IMPORTED_MODULE_2__.defineIntegration)(_linkedErrorsIntegration);


/***/ }),

/***/ "./node_modules/@sentry/browser/build/npm/esm/sdk.js":
/*!***********************************************************!*\
  !*** ./node_modules/@sentry/browser/build/npm/esm/sdk.js ***!
  \***********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   applyDefaultOptions: () => (/* binding */ applyDefaultOptions),
/* harmony export */   forceLoad: () => (/* binding */ forceLoad),
/* harmony export */   getDefaultIntegrations: () => (/* binding */ getDefaultIntegrations),
/* harmony export */   init: () => (/* binding */ init),
/* harmony export */   onLoad: () => (/* binding */ onLoad),
/* harmony export */   showReportDialog: () => (/* binding */ showReportDialog)
/* harmony export */ });
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/integrations/eventFilters.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/integrations/functiontostring.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/integrations/dedupe.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils-hoist/browser.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils-hoist/logger.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils-hoist/supports.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils-hoist/stacktrace.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/integration.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/sdk.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/currentScopes.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/exports.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/api.js");
/* harmony import */ var _client_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./client.js */ "./node_modules/@sentry/browser/build/npm/esm/client.js");
/* harmony import */ var _debug_build_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./debug-build.js */ "./node_modules/@sentry/browser/build/npm/esm/debug-build.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./helpers.js */ "./node_modules/@sentry/browser/build/npm/esm/helpers.js");
/* harmony import */ var _integrations_breadcrumbs_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./integrations/breadcrumbs.js */ "./node_modules/@sentry/browser/build/npm/esm/integrations/breadcrumbs.js");
/* harmony import */ var _integrations_browserapierrors_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./integrations/browserapierrors.js */ "./node_modules/@sentry/browser/build/npm/esm/integrations/browserapierrors.js");
/* harmony import */ var _integrations_browsersession_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./integrations/browsersession.js */ "./node_modules/@sentry/browser/build/npm/esm/integrations/browsersession.js");
/* harmony import */ var _integrations_globalhandlers_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./integrations/globalhandlers.js */ "./node_modules/@sentry/browser/build/npm/esm/integrations/globalhandlers.js");
/* harmony import */ var _integrations_httpcontext_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./integrations/httpcontext.js */ "./node_modules/@sentry/browser/build/npm/esm/integrations/httpcontext.js");
/* harmony import */ var _integrations_linkederrors_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./integrations/linkederrors.js */ "./node_modules/@sentry/browser/build/npm/esm/integrations/linkederrors.js");
/* harmony import */ var _stack_parsers_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./stack-parsers.js */ "./node_modules/@sentry/browser/build/npm/esm/stack-parsers.js");
/* harmony import */ var _transports_fetch_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./transports/fetch.js */ "./node_modules/@sentry/browser/build/npm/esm/transports/fetch.js");













/** Get the default integrations for the browser SDK. */
function getDefaultIntegrations(_options) {
  /**
   * Note: Please make sure this stays in sync with Angular SDK, which re-exports
   * `getDefaultIntegrations` but with an adjusted set of integrations.
   */
  return [
  // TODO(v10): Replace with `eventFiltersIntegration` once we remove the deprecated `inboundFiltersIntegration`
  // eslint-disable-next-line deprecation/deprecation
  (0,_sentry_core__WEBPACK_IMPORTED_MODULE_0__.inboundFiltersIntegration)(), (0,_sentry_core__WEBPACK_IMPORTED_MODULE_1__.functionToStringIntegration)(), (0,_integrations_browserapierrors_js__WEBPACK_IMPORTED_MODULE_2__.browserApiErrorsIntegration)(), (0,_integrations_breadcrumbs_js__WEBPACK_IMPORTED_MODULE_3__.breadcrumbsIntegration)(), (0,_integrations_globalhandlers_js__WEBPACK_IMPORTED_MODULE_4__.globalHandlersIntegration)(), (0,_integrations_linkederrors_js__WEBPACK_IMPORTED_MODULE_5__.linkedErrorsIntegration)(), (0,_sentry_core__WEBPACK_IMPORTED_MODULE_6__.dedupeIntegration)(), (0,_integrations_httpcontext_js__WEBPACK_IMPORTED_MODULE_7__.httpContextIntegration)(), (0,_integrations_browsersession_js__WEBPACK_IMPORTED_MODULE_8__.browserSessionIntegration)()];
}

/** Exported only for tests. */
function applyDefaultOptions(optionsArg) {
  if (optionsArg === void 0) {
    optionsArg = {};
  }
  const defaultOptions = {
    defaultIntegrations: getDefaultIntegrations(),
    release: typeof __SENTRY_RELEASE__ === 'string' // This allows build tooling to find-and-replace __SENTRY_RELEASE__ to inject a release value
    ? __SENTRY_RELEASE__ : _helpers_js__WEBPACK_IMPORTED_MODULE_9__.WINDOW.SENTRY_RELEASE?.id,
    // This supports the variable that sentry-webpack-plugin injects
    sendClientReports: true
  };
  return {
    ...defaultOptions,
    ...dropTopLevelUndefinedKeys(optionsArg)
  };
}

/**
 * In contrast to the regular `dropUndefinedKeys` method,
 * this one does not deep-drop keys, but only on the top level.
 */
function dropTopLevelUndefinedKeys(obj) {
  const mutatetedObj = {};
  for (const k of Object.getOwnPropertyNames(obj)) {
    const key = k;
    if (obj[key] !== undefined) {
      mutatetedObj[key] = obj[key];
    }
  }
  return mutatetedObj;
}
function shouldShowBrowserExtensionError() {
  const windowWithMaybeExtension = typeof _helpers_js__WEBPACK_IMPORTED_MODULE_9__.WINDOW.window !== 'undefined' && _helpers_js__WEBPACK_IMPORTED_MODULE_9__.WINDOW;
  if (!windowWithMaybeExtension) {
    // No need to show the error if we're not in a browser window environment (e.g. service workers)
    return false;
  }
  const extensionKey = windowWithMaybeExtension.chrome ? 'chrome' : 'browser';
  const extensionObject = windowWithMaybeExtension[extensionKey];
  const runtimeId = extensionObject?.runtime?.id;
  const href = (0,_sentry_core__WEBPACK_IMPORTED_MODULE_10__.getLocationHref)() || '';
  const extensionProtocols = ['chrome-extension:', 'moz-extension:', 'ms-browser-extension:', 'safari-web-extension:'];

  // Running the SDK in a dedicated extension page and calling Sentry.init is fine; no risk of data leakage
  const isDedicatedExtensionPage = !!runtimeId && _helpers_js__WEBPACK_IMPORTED_MODULE_9__.WINDOW === _helpers_js__WEBPACK_IMPORTED_MODULE_9__.WINDOW.top && extensionProtocols.some(protocol => href.startsWith(`${protocol}//`));

  // Running the SDK in NW.js, which appears like a browser extension but isn't, is also fine
  // see: https://github.com/getsentry/sentry-javascript/issues/12668
  const isNWjs = typeof windowWithMaybeExtension.nw !== 'undefined';
  return !!runtimeId && !isDedicatedExtensionPage && !isNWjs;
}

/**
 * A magic string that build tooling can leverage in order to inject a release value into the SDK.
 */

/**
 * The Sentry Browser SDK Client.
 *
 * To use this SDK, call the {@link init} function as early as possible when
 * loading the web page. To set context information or send manual events, use
 * the provided methods.
 *
 * @example
 *
 * ```
 *
 * import { init } from '@sentry/browser';
 *
 * init({
 *   dsn: '__DSN__',
 *   // ...
 * });
 * ```
 *
 * @example
 * ```
 *
 * import { addBreadcrumb } from '@sentry/browser';
 * addBreadcrumb({
 *   message: 'My Breadcrumb',
 *   // ...
 * });
 * ```
 *
 * @example
 *
 * ```
 *
 * import * as Sentry from '@sentry/browser';
 * Sentry.captureMessage('Hello, world!');
 * Sentry.captureException(new Error('Good bye'));
 * Sentry.captureEvent({
 *   message: 'Manual',
 *   stacktrace: [
 *     // ...
 *   ],
 * });
 * ```
 *
 * @see {@link BrowserOptions} for documentation on configuration options.
 */
function init(browserOptions) {
  if (browserOptions === void 0) {
    browserOptions = {};
  }
  const options = applyDefaultOptions(browserOptions);
  if (!options.skipBrowserExtensionCheck && shouldShowBrowserExtensionError()) {
    if (_debug_build_js__WEBPACK_IMPORTED_MODULE_11__.DEBUG_BUILD) {
      (0,_sentry_core__WEBPACK_IMPORTED_MODULE_12__.consoleSandbox)(() => {
        // eslint-disable-next-line no-console
        console.error('[Sentry] You cannot run Sentry this way in a browser extension, check: https://docs.sentry.io/platforms/javascript/best-practices/browser-extensions/');
      });
    }
    return;
  }
  if (_debug_build_js__WEBPACK_IMPORTED_MODULE_11__.DEBUG_BUILD && !(0,_sentry_core__WEBPACK_IMPORTED_MODULE_13__.supportsFetch)()) {
    _sentry_core__WEBPACK_IMPORTED_MODULE_12__.logger.warn('No Fetch API detected. The Sentry SDK requires a Fetch API compatible environment to send events. Please add a Fetch API polyfill.');
  }
  const clientOptions = {
    ...options,
    stackParser: (0,_sentry_core__WEBPACK_IMPORTED_MODULE_14__.stackParserFromStackParserOptions)(options.stackParser || _stack_parsers_js__WEBPACK_IMPORTED_MODULE_15__.defaultStackParser),
    integrations: (0,_sentry_core__WEBPACK_IMPORTED_MODULE_16__.getIntegrationsToSetup)(options),
    transport: options.transport || _transports_fetch_js__WEBPACK_IMPORTED_MODULE_17__.makeFetchTransport
  };
  return (0,_sentry_core__WEBPACK_IMPORTED_MODULE_18__.initAndBind)(_client_js__WEBPACK_IMPORTED_MODULE_19__.BrowserClient, clientOptions);
}

/**
 * Present the user with a report dialog.
 *
 * @param options Everything is optional, we try to fetch all info need from the global scope.
 */
function showReportDialog(options) {
  if (options === void 0) {
    options = {};
  }
  // doesn't work without a document (React Native)
  if (!_helpers_js__WEBPACK_IMPORTED_MODULE_9__.WINDOW.document) {
    _debug_build_js__WEBPACK_IMPORTED_MODULE_11__.DEBUG_BUILD && _sentry_core__WEBPACK_IMPORTED_MODULE_12__.logger.error('Global document not defined in showReportDialog call');
    return;
  }
  const scope = (0,_sentry_core__WEBPACK_IMPORTED_MODULE_20__.getCurrentScope)();
  const client = scope.getClient();
  const dsn = client?.getDsn();
  if (!dsn) {
    _debug_build_js__WEBPACK_IMPORTED_MODULE_11__.DEBUG_BUILD && _sentry_core__WEBPACK_IMPORTED_MODULE_12__.logger.error('DSN not configured for showReportDialog call');
    return;
  }
  if (scope) {
    options.user = {
      ...scope.getUser(),
      ...options.user
    };
  }
  if (!options.eventId) {
    const eventId = (0,_sentry_core__WEBPACK_IMPORTED_MODULE_21__.lastEventId)();
    if (eventId) {
      options.eventId = eventId;
    }
  }
  const script = _helpers_js__WEBPACK_IMPORTED_MODULE_9__.WINDOW.document.createElement('script');
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = (0,_sentry_core__WEBPACK_IMPORTED_MODULE_22__.getReportDialogEndpoint)(dsn, options);
  if (options.onLoad) {
    script.onload = options.onLoad;
  }
  const {
    onClose
  } = options;
  if (onClose) {
    const reportDialogClosedMessageHandler = event => {
      if (event.data === '__sentry_reportdialog_closed__') {
        try {
          onClose();
        } finally {
          _helpers_js__WEBPACK_IMPORTED_MODULE_9__.WINDOW.removeEventListener('message', reportDialogClosedMessageHandler);
        }
      }
    };
    _helpers_js__WEBPACK_IMPORTED_MODULE_9__.WINDOW.addEventListener('message', reportDialogClosedMessageHandler);
  }
  const injectionPoint = _helpers_js__WEBPACK_IMPORTED_MODULE_9__.WINDOW.document.head || _helpers_js__WEBPACK_IMPORTED_MODULE_9__.WINDOW.document.body;
  if (injectionPoint) {
    injectionPoint.appendChild(script);
  } else {
    _debug_build_js__WEBPACK_IMPORTED_MODULE_11__.DEBUG_BUILD && _sentry_core__WEBPACK_IMPORTED_MODULE_12__.logger.error('Not injecting report dialog. No injection point found in HTML');
  }
}

/**
 * This function is here to be API compatible with the loader.
 * @hidden
 */
function forceLoad() {
  // Noop
}

/**
 * This function is here to be API compatible with the loader.
 * @hidden
 */
function onLoad(callback) {
  callback();
}


/***/ }),

/***/ "./node_modules/@sentry/browser/build/npm/esm/stack-parsers.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@sentry/browser/build/npm/esm/stack-parsers.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   chromeStackLineParser: () => (/* binding */ chromeStackLineParser),
/* harmony export */   defaultStackLineParsers: () => (/* binding */ defaultStackLineParsers),
/* harmony export */   defaultStackParser: () => (/* binding */ defaultStackParser),
/* harmony export */   geckoStackLineParser: () => (/* binding */ geckoStackLineParser),
/* harmony export */   opera10StackLineParser: () => (/* binding */ opera10StackLineParser),
/* harmony export */   opera11StackLineParser: () => (/* binding */ opera11StackLineParser),
/* harmony export */   winjsStackLineParser: () => (/* binding */ winjsStackLineParser)
/* harmony export */ });
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils-hoist/stacktrace.js");


// This was originally forked from https://github.com/csnover/TraceKit, and was largely
// re - written as part of raven - js.
//
// This code was later copied to the JavaScript mono - repo and further modified and
// refactored over the years.

const OPERA10_PRIORITY = 10;
const OPERA11_PRIORITY = 20;
const CHROME_PRIORITY = 30;
const WINJS_PRIORITY = 40;
const GECKO_PRIORITY = 50;
function createFrame(filename, func, lineno, colno) {
  const frame = {
    filename,
    function: func === '<anonymous>' ? _sentry_core__WEBPACK_IMPORTED_MODULE_0__.UNKNOWN_FUNCTION : func,
    in_app: true // All browser frames are considered in_app
  };
  if (lineno !== undefined) {
    frame.lineno = lineno;
  }
  if (colno !== undefined) {
    frame.colno = colno;
  }
  return frame;
}

// This regex matches frames that have no function name (ie. are at the top level of a module).
// For example "at http://localhost:5000//script.js:1:126"
// Frames _with_ function names usually look as follows: "at commitLayoutEffects (react-dom.development.js:23426:1)"
const chromeRegexNoFnName = /^\s*at (\S+?)(?::(\d+))(?::(\d+))\s*$/i;

// This regex matches all the frames that have a function name.
const chromeRegex = /^\s*at (?:(.+?\)(?: \[.+\])?|.*?) ?\((?:address at )?)?(?:async )?((?:<anonymous>|[-a-z]+:|.*bundle|\/)?.*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;
const chromeEvalRegex = /\((\S*)(?::(\d+))(?::(\d+))\)/;

// Chromium based browsers: Chrome, Brave, new Opera, new Edge
// We cannot call this variable `chrome` because it can conflict with global `chrome` variable in certain environments
// See: https://github.com/getsentry/sentry-javascript/issues/6880
const chromeStackParserFn = line => {
  // If the stack line has no function name, we need to parse it differently
  const noFnParts = chromeRegexNoFnName.exec(line);
  if (noFnParts) {
    const [, filename, line, col] = noFnParts;
    return createFrame(filename, _sentry_core__WEBPACK_IMPORTED_MODULE_0__.UNKNOWN_FUNCTION, +line, +col);
  }
  const parts = chromeRegex.exec(line);
  if (parts) {
    const isEval = parts[2] && parts[2].indexOf('eval') === 0; // start of line

    if (isEval) {
      const subMatch = chromeEvalRegex.exec(parts[2]);
      if (subMatch) {
        // throw out eval line/column and use top-most line/column number
        parts[2] = subMatch[1]; // url
        parts[3] = subMatch[2]; // line
        parts[4] = subMatch[3]; // column
      }
    }

    // Kamil: One more hack won't hurt us right? Understanding and adding more rules on top of these regexps right now
    // would be way too time consuming. (TODO: Rewrite whole RegExp to be more readable)
    const [func, filename] = extractSafariExtensionDetails(parts[1] || _sentry_core__WEBPACK_IMPORTED_MODULE_0__.UNKNOWN_FUNCTION, parts[2]);
    return createFrame(filename, func, parts[3] ? +parts[3] : undefined, parts[4] ? +parts[4] : undefined);
  }
  return;
};
const chromeStackLineParser = [CHROME_PRIORITY, chromeStackParserFn];

// gecko regex: `(?:bundle|\d+\.js)`: `bundle` is for react native, `\d+\.js` also but specifically for ram bundles because it
// generates filenames without a prefix like `file://` the filenames in the stacktrace are just 42.js
// We need this specific case for now because we want no other regex to match.
const geckoREgex = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)?((?:[-a-z]+)?:\/.*?|\[native code\]|[^@]*(?:bundle|\d+\.js)|\/[\w\-. /=]+)(?::(\d+))?(?::(\d+))?\s*$/i;
const geckoEvalRegex = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i;
const gecko = line => {
  const parts = geckoREgex.exec(line);
  if (parts) {
    const isEval = parts[3] && parts[3].indexOf(' > eval') > -1;
    if (isEval) {
      const subMatch = geckoEvalRegex.exec(parts[3]);
      if (subMatch) {
        // throw out eval line/column and use top-most line number
        parts[1] = parts[1] || 'eval';
        parts[3] = subMatch[1];
        parts[4] = subMatch[2];
        parts[5] = ''; // no column when eval
      }
    }
    let filename = parts[3];
    let func = parts[1] || _sentry_core__WEBPACK_IMPORTED_MODULE_0__.UNKNOWN_FUNCTION;
    [func, filename] = extractSafariExtensionDetails(func, filename);
    return createFrame(filename, func, parts[4] ? +parts[4] : undefined, parts[5] ? +parts[5] : undefined);
  }
  return;
};
const geckoStackLineParser = [GECKO_PRIORITY, gecko];
const winjsRegex = /^\s*at (?:((?:\[object object\])?.+) )?\(?((?:[-a-z]+):.*?):(\d+)(?::(\d+))?\)?\s*$/i;
const winjs = line => {
  const parts = winjsRegex.exec(line);
  return parts ? createFrame(parts[2], parts[1] || _sentry_core__WEBPACK_IMPORTED_MODULE_0__.UNKNOWN_FUNCTION, +parts[3], parts[4] ? +parts[4] : undefined) : undefined;
};
const winjsStackLineParser = [WINJS_PRIORITY, winjs];
const opera10Regex = / line (\d+).*script (?:in )?(\S+)(?:: in function (\S+))?$/i;
const opera10 = line => {
  const parts = opera10Regex.exec(line);
  return parts ? createFrame(parts[2], parts[3] || _sentry_core__WEBPACK_IMPORTED_MODULE_0__.UNKNOWN_FUNCTION, +parts[1]) : undefined;
};
const opera10StackLineParser = [OPERA10_PRIORITY, opera10];
const opera11Regex = / line (\d+), column (\d+)\s*(?:in (?:<anonymous function: ([^>]+)>|([^)]+))\(.*\))? in (.*):\s*$/i;
const opera11 = line => {
  const parts = opera11Regex.exec(line);
  return parts ? createFrame(parts[5], parts[3] || parts[4] || _sentry_core__WEBPACK_IMPORTED_MODULE_0__.UNKNOWN_FUNCTION, +parts[1], +parts[2]) : undefined;
};
const opera11StackLineParser = [OPERA11_PRIORITY, opera11];
const defaultStackLineParsers = [chromeStackLineParser, geckoStackLineParser];
const defaultStackParser = (0,_sentry_core__WEBPACK_IMPORTED_MODULE_0__.createStackParser)(...defaultStackLineParsers);

/**
 * Safari web extensions, starting version unknown, can produce "frames-only" stacktraces.
 * What it means, is that instead of format like:
 *
 * Error: wat
 *   at function@url:row:col
 *   at function@url:row:col
 *   at function@url:row:col
 *
 * it produces something like:
 *
 *   function@url:row:col
 *   function@url:row:col
 *   function@url:row:col
 *
 * Because of that, it won't be captured by `chrome` RegExp and will fall into `Gecko` branch.
 * This function is extracted so that we can use it in both places without duplicating the logic.
 * Unfortunately "just" changing RegExp is too complicated now and making it pass all tests
 * and fix this case seems like an impossible, or at least way too time-consuming task.
 */
const extractSafariExtensionDetails = (func, filename) => {
  const isSafariExtension = func.indexOf('safari-extension') !== -1;
  const isSafariWebExtension = func.indexOf('safari-web-extension') !== -1;
  return isSafariExtension || isSafariWebExtension ? [func.indexOf('@') !== -1 ? func.split('@')[0] : _sentry_core__WEBPACK_IMPORTED_MODULE_0__.UNKNOWN_FUNCTION, isSafariExtension ? `safari-extension:${filename}` : `safari-web-extension:${filename}`] : [func, filename];
};


/***/ }),

/***/ "./node_modules/@sentry/browser/build/npm/esm/transports/fetch.js":
/*!************************************************************************!*\
  !*** ./node_modules/@sentry/browser/build/npm/esm/transports/fetch.js ***!
  \************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   makeFetchTransport: () => (/* binding */ makeFetchTransport)
/* harmony export */ });
/* harmony import */ var _sentry_internal_browser_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry-internal/browser-utils */ "./node_modules/@sentry-internal/browser-utils/build/esm/getNativeImplementation.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/utils-hoist/syncpromise.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/build/esm/transports/base.js");



/**
 * Creates a Transport that uses the Fetch API to send events to Sentry.
 */
function makeFetchTransport(options, nativeFetch) {
  if (nativeFetch === void 0) {
    nativeFetch = (0,_sentry_internal_browser_utils__WEBPACK_IMPORTED_MODULE_0__.getNativeImplementation)('fetch');
  }
  let pendingBodySize = 0;
  let pendingCount = 0;
  function makeRequest(request) {
    const requestSize = request.body.length;
    pendingBodySize += requestSize;
    pendingCount++;
    const requestOptions = {
      body: request.body,
      method: 'POST',
      referrerPolicy: 'strict-origin',
      headers: options.headers,
      // Outgoing requests are usually cancelled when navigating to a different page, causing a "TypeError: Failed to
      // fetch" error and sending a "network_error" client-outcome - in Chrome, the request status shows "(cancelled)".
      // The `keepalive` flag keeps outgoing requests alive, even when switching pages. We want this since we're
      // frequently sending events right before the user is switching pages (eg. when finishing navigation transactions).
      // Gotchas:
      // - `keepalive` isn't supported by Firefox
      // - As per spec (https://fetch.spec.whatwg.org/#http-network-or-cache-fetch):
      //   If the sum of contentLength and inflightKeepaliveBytes is greater than 64 kibibytes, then return a network error.
      //   We will therefore only activate the flag when we're below that limit.
      // There is also a limit of requests that can be open at the same time, so we also limit this to 15
      // See https://github.com/getsentry/sentry-javascript/pull/7553 for details
      keepalive: pendingBodySize <= 60000 && pendingCount < 15,
      ...options.fetchOptions
    };
    if (!nativeFetch) {
      (0,_sentry_internal_browser_utils__WEBPACK_IMPORTED_MODULE_0__.clearCachedImplementation)('fetch');
      return (0,_sentry_core__WEBPACK_IMPORTED_MODULE_1__.rejectedSyncPromise)('No fetch implementation available');
    }
    try {
      // TODO: This may need a `suppressTracing` call in the future when we switch the browser SDK to OTEL
      return nativeFetch(options.url, requestOptions).then(response => {
        pendingBodySize -= requestSize;
        pendingCount--;
        return {
          statusCode: response.status,
          headers: {
            'x-sentry-rate-limits': response.headers.get('X-Sentry-Rate-Limits'),
            'retry-after': response.headers.get('Retry-After')
          }
        };
      });
    } catch (e) {
      (0,_sentry_internal_browser_utils__WEBPACK_IMPORTED_MODULE_0__.clearCachedImplementation)('fetch');
      pendingBodySize -= requestSize;
      pendingCount--;
      return (0,_sentry_core__WEBPACK_IMPORTED_MODULE_1__.rejectedSyncPromise)(e);
    }
  }
  return (0,_sentry_core__WEBPACK_IMPORTED_MODULE_2__.createTransport)(options, makeRequest);
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/api.js":
/*!****************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/api.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getEnvelopeEndpointWithUrlEncodedAuth: () => (/* binding */ getEnvelopeEndpointWithUrlEncodedAuth),
/* harmony export */   getReportDialogEndpoint: () => (/* binding */ getReportDialogEndpoint)
/* harmony export */ });
/* harmony import */ var _utils_hoist_dsn_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils-hoist/dsn.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/dsn.js");

const SENTRY_API_VERSION = '7';

/** Returns the prefix to construct Sentry ingestion API endpoints. */
function getBaseApiEndpoint(dsn) {
  const protocol = dsn.protocol ? `${dsn.protocol}:` : '';
  const port = dsn.port ? `:${dsn.port}` : '';
  return `${protocol}//${dsn.host}${port}${dsn.path ? `/${dsn.path}` : ''}/api/`;
}

/** Returns the ingest API endpoint for target. */
function _getIngestEndpoint(dsn) {
  return `${getBaseApiEndpoint(dsn)}${dsn.projectId}/envelope/`;
}

/** Returns a URL-encoded string with auth config suitable for a query string. */
function _encodedAuth(dsn, sdkInfo) {
  const params = {
    sentry_version: SENTRY_API_VERSION
  };
  if (dsn.publicKey) {
    // We send only the minimum set of required information. See
    // https://github.com/getsentry/sentry-javascript/issues/2572.
    params.sentry_key = dsn.publicKey;
  }
  if (sdkInfo) {
    params.sentry_client = `${sdkInfo.name}/${sdkInfo.version}`;
  }
  return new URLSearchParams(params).toString();
}

/**
 * Returns the envelope endpoint URL with auth in the query string.
 *
 * Sending auth as part of the query string and not as custom HTTP headers avoids CORS preflight requests.
 */
function getEnvelopeEndpointWithUrlEncodedAuth(dsn, tunnel, sdkInfo) {
  return tunnel ? tunnel : `${_getIngestEndpoint(dsn)}?${_encodedAuth(dsn, sdkInfo)}`;
}

/** Returns the url to the report dialog endpoint. */
function getReportDialogEndpoint(dsnLike, dialogOptions) {
  const dsn = (0,_utils_hoist_dsn_js__WEBPACK_IMPORTED_MODULE_0__.makeDsn)(dsnLike);
  if (!dsn) {
    return '';
  }
  const endpoint = `${getBaseApiEndpoint(dsn)}embed/error-page/`;
  let encodedOptions = `dsn=${(0,_utils_hoist_dsn_js__WEBPACK_IMPORTED_MODULE_0__.dsnToString)(dsn)}`;
  for (const key in dialogOptions) {
    if (key === 'dsn') {
      continue;
    }
    if (key === 'onClose') {
      continue;
    }
    if (key === 'user') {
      const user = dialogOptions.user;
      if (!user) {
        continue;
      }
      if (user.name) {
        encodedOptions += `&name=${encodeURIComponent(user.name)}`;
      }
      if (user.email) {
        encodedOptions += `&email=${encodeURIComponent(user.email)}`;
      }
    } else {
      encodedOptions += `&${encodeURIComponent(key)}=${encodeURIComponent(dialogOptions[key])}`;
    }
  }
  return `${endpoint}?${encodedOptions}`;
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/asyncContext/index.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/asyncContext/index.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getAsyncContextStrategy: () => (/* binding */ getAsyncContextStrategy),
/* harmony export */   setAsyncContextStrategy: () => (/* binding */ setAsyncContextStrategy)
/* harmony export */ });
/* harmony import */ var _carrier_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../carrier.js */ "./node_modules/@sentry/core/build/esm/carrier.js");
/* harmony import */ var _stackStrategy_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./stackStrategy.js */ "./node_modules/@sentry/core/build/esm/asyncContext/stackStrategy.js");



/**
 * @private Private API with no semver guarantees!
 *
 * Sets the global async context strategy
 */
function setAsyncContextStrategy(strategy) {
  // Get main carrier (global for every environment)
  const registry = (0,_carrier_js__WEBPACK_IMPORTED_MODULE_0__.getMainCarrier)();
  const sentry = (0,_carrier_js__WEBPACK_IMPORTED_MODULE_0__.getSentryCarrier)(registry);
  sentry.acs = strategy;
}

/**
 * Get the current async context strategy.
 * If none has been setup, the default will be used.
 */
function getAsyncContextStrategy(carrier) {
  const sentry = (0,_carrier_js__WEBPACK_IMPORTED_MODULE_0__.getSentryCarrier)(carrier);
  if (sentry.acs) {
    return sentry.acs;
  }

  // Otherwise, use the default one (stack)
  return (0,_stackStrategy_js__WEBPACK_IMPORTED_MODULE_1__.getStackAsyncContextStrategy)();
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/asyncContext/stackStrategy.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/asyncContext/stackStrategy.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AsyncContextStack: () => (/* binding */ AsyncContextStack),
/* harmony export */   getStackAsyncContextStrategy: () => (/* binding */ getStackAsyncContextStrategy)
/* harmony export */ });
/* harmony import */ var _defaultScopes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../defaultScopes.js */ "./node_modules/@sentry/core/build/esm/defaultScopes.js");
/* harmony import */ var _scope_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../scope.js */ "./node_modules/@sentry/core/build/esm/scope.js");
/* harmony import */ var _utils_hoist_is_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils-hoist/is.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/is.js");
/* harmony import */ var _carrier_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../carrier.js */ "./node_modules/@sentry/core/build/esm/carrier.js");





/**
 * This is an object that holds a stack of scopes.
 */
class AsyncContextStack {
  constructor(scope, isolationScope) {
    let assignedScope;
    if (!scope) {
      assignedScope = new _scope_js__WEBPACK_IMPORTED_MODULE_0__.Scope();
    } else {
      assignedScope = scope;
    }
    let assignedIsolationScope;
    if (!isolationScope) {
      assignedIsolationScope = new _scope_js__WEBPACK_IMPORTED_MODULE_0__.Scope();
    } else {
      assignedIsolationScope = isolationScope;
    }

    // scope stack for domains or the process
    this._stack = [{
      scope: assignedScope
    }];
    this._isolationScope = assignedIsolationScope;
  }

  /**
   * Fork a scope for the stack.
   */
  withScope(callback) {
    const scope = this._pushScope();
    let maybePromiseResult;
    try {
      maybePromiseResult = callback(scope);
    } catch (e) {
      this._popScope();
      throw e;
    }
    if ((0,_utils_hoist_is_js__WEBPACK_IMPORTED_MODULE_1__.isThenable)(maybePromiseResult)) {
      // @ts-expect-error - isThenable returns the wrong type
      return maybePromiseResult.then(res => {
        this._popScope();
        return res;
      }, e => {
        this._popScope();
        throw e;
      });
    }
    this._popScope();
    return maybePromiseResult;
  }

  /**
   * Get the client of the stack.
   */
  getClient() {
    return this.getStackTop().client;
  }

  /**
   * Returns the scope of the top stack.
   */
  getScope() {
    return this.getStackTop().scope;
  }

  /**
   * Get the isolation scope for the stack.
   */
  getIsolationScope() {
    return this._isolationScope;
  }

  /**
   * Returns the topmost scope layer in the order domain > local > process.
   */
  getStackTop() {
    return this._stack[this._stack.length - 1];
  }

  /**
   * Push a scope to the stack.
   */
  _pushScope() {
    // We want to clone the content of prev scope
    const scope = this.getScope().clone();
    this._stack.push({
      client: this.getClient(),
      scope
    });
    return scope;
  }

  /**
   * Pop a scope from the stack.
   */
  _popScope() {
    if (this._stack.length <= 1) return false;
    return !!this._stack.pop();
  }
}

/**
 * Get the global async context stack.
 * This will be removed during the v8 cycle and is only here to make migration easier.
 */
function getAsyncContextStack() {
  const registry = (0,_carrier_js__WEBPACK_IMPORTED_MODULE_2__.getMainCarrier)();
  const sentry = (0,_carrier_js__WEBPACK_IMPORTED_MODULE_2__.getSentryCarrier)(registry);
  return sentry.stack = sentry.stack || new AsyncContextStack((0,_defaultScopes_js__WEBPACK_IMPORTED_MODULE_3__.getDefaultCurrentScope)(), (0,_defaultScopes_js__WEBPACK_IMPORTED_MODULE_3__.getDefaultIsolationScope)());
}
function withScope(callback) {
  return getAsyncContextStack().withScope(callback);
}
function withSetScope(scope, callback) {
  const stack = getAsyncContextStack();
  return stack.withScope(() => {
    stack.getStackTop().scope = scope;
    return callback(scope);
  });
}
function withIsolationScope(callback) {
  return getAsyncContextStack().withScope(() => {
    return callback(getAsyncContextStack().getIsolationScope());
  });
}

/**
 * Get the stack-based async context strategy.
 */
function getStackAsyncContextStrategy() {
  return {
    withIsolationScope,
    withScope,
    withSetScope,
    withSetIsolationScope: (_isolationScope, callback) => {
      return withIsolationScope(callback);
    },
    getCurrentScope: () => getAsyncContextStack().getScope(),
    getIsolationScope: () => getAsyncContextStack().getIsolationScope()
  };
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/breadcrumbs.js":
/*!************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/breadcrumbs.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addBreadcrumb: () => (/* binding */ addBreadcrumb)
/* harmony export */ });
/* harmony import */ var _currentScopes_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./currentScopes.js */ "./node_modules/@sentry/core/build/esm/currentScopes.js");
/* harmony import */ var _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils-hoist/logger.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/logger.js");
/* harmony import */ var _utils_hoist_time_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils-hoist/time.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/time.js");




/**
 * Default maximum number of breadcrumbs added to an event. Can be overwritten
 * with {@link Options.maxBreadcrumbs}.
 */
const DEFAULT_BREADCRUMBS = 100;

/**
 * Records a new breadcrumb which will be attached to future events.
 *
 * Breadcrumbs will be added to subsequent events to provide more context on
 * user's actions prior to an error or crash.
 */
function addBreadcrumb(breadcrumb, hint) {
  const client = (0,_currentScopes_js__WEBPACK_IMPORTED_MODULE_0__.getClient)();
  const isolationScope = (0,_currentScopes_js__WEBPACK_IMPORTED_MODULE_0__.getIsolationScope)();
  if (!client) return;
  const {
    beforeBreadcrumb = null,
    maxBreadcrumbs = DEFAULT_BREADCRUMBS
  } = client.getOptions();
  if (maxBreadcrumbs <= 0) return;
  const timestamp = (0,_utils_hoist_time_js__WEBPACK_IMPORTED_MODULE_1__.dateTimestampInSeconds)();
  const mergedBreadcrumb = {
    timestamp,
    ...breadcrumb
  };
  const finalBreadcrumb = beforeBreadcrumb ? (0,_utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_2__.consoleSandbox)(() => beforeBreadcrumb(mergedBreadcrumb, hint)) : mergedBreadcrumb;
  if (finalBreadcrumb === null) return;
  if (client.emit) {
    client.emit('beforeAddBreadcrumb', finalBreadcrumb, hint);
  }
  isolationScope.addBreadcrumb(finalBreadcrumb, maxBreadcrumbs);
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/carrier.js":
/*!********************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/carrier.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getGlobalSingleton: () => (/* binding */ getGlobalSingleton),
/* harmony export */   getMainCarrier: () => (/* binding */ getMainCarrier),
/* harmony export */   getSentryCarrier: () => (/* binding */ getSentryCarrier)
/* harmony export */ });
/* harmony import */ var _utils_hoist_version_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils-hoist/version.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/version.js");
/* harmony import */ var _utils_hoist_worldwide_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils-hoist/worldwide.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/worldwide.js");



/**
 * An object that contains globally accessible properties and maintains a scope stack.
 * @hidden
 */

/**
 * Returns the global shim registry.
 *
 * FIXME: This function is problematic, because despite always returning a valid Carrier,
 * it has an optional `__SENTRY__` property, which then in turn requires us to always perform an unnecessary check
 * at the call-site. We always access the carrier through this function, so we can guarantee that `__SENTRY__` is there.
 **/
function getMainCarrier() {
  // This ensures a Sentry carrier exists
  getSentryCarrier(_utils_hoist_worldwide_js__WEBPACK_IMPORTED_MODULE_0__.GLOBAL_OBJ);
  return _utils_hoist_worldwide_js__WEBPACK_IMPORTED_MODULE_0__.GLOBAL_OBJ;
}

/** Will either get the existing sentry carrier, or create a new one. */
function getSentryCarrier(carrier) {
  const __SENTRY__ = carrier.__SENTRY__ = carrier.__SENTRY__ || {};

  // For now: First SDK that sets the .version property wins
  __SENTRY__.version = __SENTRY__.version || _utils_hoist_version_js__WEBPACK_IMPORTED_MODULE_1__.SDK_VERSION;

  // Intentionally populating and returning the version of "this" SDK instance
  // rather than what's set in .version so that "this" SDK always gets its carrier
  return __SENTRY__[_utils_hoist_version_js__WEBPACK_IMPORTED_MODULE_1__.SDK_VERSION] = __SENTRY__[_utils_hoist_version_js__WEBPACK_IMPORTED_MODULE_1__.SDK_VERSION] || {};
}

/**
 * Returns a global singleton contained in the global `__SENTRY__[]` object.
 *
 * If the singleton doesn't already exist in `__SENTRY__`, it will be created using the given factory
 * function and added to the `__SENTRY__` object.
 *
 * @param name name of the global singleton on __SENTRY__
 * @param creator creator Factory function to create the singleton if it doesn't already exist on `__SENTRY__`
 * @param obj (Optional) The global object on which to look for `__SENTRY__`, if not `GLOBAL_OBJ`'s return value
 * @returns the singleton
 */
function getGlobalSingleton(name, creator, obj) {
  if (obj === void 0) {
    obj = _utils_hoist_worldwide_js__WEBPACK_IMPORTED_MODULE_0__.GLOBAL_OBJ;
  }
  const __SENTRY__ = obj.__SENTRY__ = obj.__SENTRY__ || {};
  const carrier = __SENTRY__[_utils_hoist_version_js__WEBPACK_IMPORTED_MODULE_1__.SDK_VERSION] = __SENTRY__[_utils_hoist_version_js__WEBPACK_IMPORTED_MODULE_1__.SDK_VERSION] || {};
  // Note: We do not want to set `carrier.version` here, as this may be called before any `init` is called, e.g. for the default scopes
  return carrier[name] || (carrier[name] = creator());
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/client.js":
/*!*******************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/client.js ***!
  \*******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BaseClient: () => (/* binding */ BaseClient),
/* harmony export */   Client: () => (/* binding */ Client)
/* harmony export */ });
/* harmony import */ var _api_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./api.js */ "./node_modules/@sentry/core/build/esm/api.js");
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./constants.js */ "./node_modules/@sentry/core/build/esm/constants.js");
/* harmony import */ var _currentScopes_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./currentScopes.js */ "./node_modules/@sentry/core/build/esm/currentScopes.js");
/* harmony import */ var _debug_build_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./debug-build.js */ "./node_modules/@sentry/core/build/esm/debug-build.js");
/* harmony import */ var _envelope_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./envelope.js */ "./node_modules/@sentry/core/build/esm/envelope.js");
/* harmony import */ var _integration_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./integration.js */ "./node_modules/@sentry/core/build/esm/integration.js");
/* harmony import */ var _session_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./session.js */ "./node_modules/@sentry/core/build/esm/session.js");
/* harmony import */ var _tracing_dynamicSamplingContext_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./tracing/dynamicSamplingContext.js */ "./node_modules/@sentry/core/build/esm/tracing/dynamicSamplingContext.js");
/* harmony import */ var _utils_hoist_clientreport_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./utils-hoist/clientreport.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/clientreport.js");
/* harmony import */ var _utils_hoist_dsn_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils-hoist/dsn.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/dsn.js");
/* harmony import */ var _utils_hoist_envelope_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./utils-hoist/envelope.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/envelope.js");
/* harmony import */ var _utils_hoist_error_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./utils-hoist/error.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/error.js");
/* harmony import */ var _utils_hoist_is_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./utils-hoist/is.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/is.js");
/* harmony import */ var _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils-hoist/logger.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/logger.js");
/* harmony import */ var _utils_hoist_misc_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./utils-hoist/misc.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/misc.js");
/* harmony import */ var _utils_hoist_syncpromise_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./utils-hoist/syncpromise.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/syncpromise.js");
/* harmony import */ var _utils_eventUtils_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./utils/eventUtils.js */ "./node_modules/@sentry/core/build/esm/utils/eventUtils.js");
/* harmony import */ var _utils_merge_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./utils/merge.js */ "./node_modules/@sentry/core/build/esm/utils/merge.js");
/* harmony import */ var _utils_parseSampleRate_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./utils/parseSampleRate.js */ "./node_modules/@sentry/core/build/esm/utils/parseSampleRate.js");
/* harmony import */ var _utils_prepareEvent_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./utils/prepareEvent.js */ "./node_modules/@sentry/core/build/esm/utils/prepareEvent.js");
/* harmony import */ var _utils_spanUtils_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./utils/spanUtils.js */ "./node_modules/@sentry/core/build/esm/utils/spanUtils.js");
/* harmony import */ var _utils_transactionEvent_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./utils/transactionEvent.js */ "./node_modules/@sentry/core/build/esm/utils/transactionEvent.js");






















const ALREADY_SEEN_ERROR = "Not capturing exception because it's already been captured.";
const MISSING_RELEASE_FOR_SESSION_ERROR = 'Discarded session because of missing or non-string release';

/**
 * Base implementation for all JavaScript SDK clients.
 *
 * Call the constructor with the corresponding options
 * specific to the client subclass. To access these options later, use
 * {@link Client.getOptions}.
 *
 * If a Dsn is specified in the options, it will be parsed and stored. Use
 * {@link Client.getDsn} to retrieve the Dsn at any moment. In case the Dsn is
 * invalid, the constructor will throw a {@link SentryException}. Note that
 * without a valid Dsn, the SDK will not send any events to Sentry.
 *
 * Before sending an event, it is passed through
 * {@link Client._prepareEvent} to add SDK information and scope data
 * (breadcrumbs and context). To add more custom information, override this
 * method and extend the resulting prepared event.
 *
 * To issue automatically created events (e.g. via instrumentation), use
 * {@link Client.captureEvent}. It will prepare the event and pass it through
 * the callback lifecycle. To issue auto-breadcrumbs, use
 * {@link Client.addBreadcrumb}.
 *
 * @example
 * class NodeClient extends Client<NodeOptions> {
 *   public constructor(options: NodeOptions) {
 *     super(options);
 *   }
 *
 *   // ...
 * }
 */
class Client {
  /** Options passed to the SDK. */

  /** The client Dsn, if specified in options. Without this Dsn, the SDK will be disabled. */

  /** Array of set up integrations. */

  /** Number of calls being processed */

  /** Holds flushable  */

  // eslint-disable-next-line @typescript-eslint/ban-types

  /**
   * Initializes this client instance.
   *
   * @param options Options for the client.
   */
  constructor(options) {
    this._options = options;
    this._integrations = {};
    this._numProcessing = 0;
    this._outcomes = {};
    this._hooks = {};
    this._eventProcessors = [];
    if (options.dsn) {
      this._dsn = (0,_utils_hoist_dsn_js__WEBPACK_IMPORTED_MODULE_0__.makeDsn)(options.dsn);
    } else {
      _debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD && _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_2__.logger.warn('No DSN provided, client will not send events.');
    }
    if (this._dsn) {
      const url = (0,_api_js__WEBPACK_IMPORTED_MODULE_3__.getEnvelopeEndpointWithUrlEncodedAuth)(this._dsn, options.tunnel, options._metadata ? options._metadata.sdk : undefined);
      this._transport = options.transport({
        tunnel: this._options.tunnel,
        recordDroppedEvent: this.recordDroppedEvent.bind(this),
        ...options.transportOptions,
        url
      });
    }
  }

  /**
   * Captures an exception event and sends it to Sentry.
   *
   * Unlike `captureException` exported from every SDK, this method requires that you pass it the current scope.
   */
  captureException(exception, hint, scope) {
    const eventId = (0,_utils_hoist_misc_js__WEBPACK_IMPORTED_MODULE_4__.uuid4)();

    // ensure we haven't captured this very object before
    if ((0,_utils_hoist_misc_js__WEBPACK_IMPORTED_MODULE_4__.checkOrSetAlreadyCaught)(exception)) {
      _debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD && _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_2__.logger.log(ALREADY_SEEN_ERROR);
      return eventId;
    }
    const hintWithEventId = {
      event_id: eventId,
      ...hint
    };
    this._process(this.eventFromException(exception, hintWithEventId).then(event => this._captureEvent(event, hintWithEventId, scope)));
    return hintWithEventId.event_id;
  }

  /**
   * Captures a message event and sends it to Sentry.
   *
   * Unlike `captureMessage` exported from every SDK, this method requires that you pass it the current scope.
   */
  captureMessage(message, level, hint, currentScope) {
    const hintWithEventId = {
      event_id: (0,_utils_hoist_misc_js__WEBPACK_IMPORTED_MODULE_4__.uuid4)(),
      ...hint
    };
    const eventMessage = (0,_utils_hoist_is_js__WEBPACK_IMPORTED_MODULE_5__.isParameterizedString)(message) ? message : String(message);
    const promisedEvent = (0,_utils_hoist_is_js__WEBPACK_IMPORTED_MODULE_5__.isPrimitive)(message) ? this.eventFromMessage(eventMessage, level, hintWithEventId) : this.eventFromException(message, hintWithEventId);
    this._process(promisedEvent.then(event => this._captureEvent(event, hintWithEventId, currentScope)));
    return hintWithEventId.event_id;
  }

  /**
   * Captures a manually created event and sends it to Sentry.
   *
   * Unlike `captureEvent` exported from every SDK, this method requires that you pass it the current scope.
   */
  captureEvent(event, hint, currentScope) {
    const eventId = (0,_utils_hoist_misc_js__WEBPACK_IMPORTED_MODULE_4__.uuid4)();

    // ensure we haven't captured this very object before
    if (hint?.originalException && (0,_utils_hoist_misc_js__WEBPACK_IMPORTED_MODULE_4__.checkOrSetAlreadyCaught)(hint.originalException)) {
      _debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD && _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_2__.logger.log(ALREADY_SEEN_ERROR);
      return eventId;
    }
    const hintWithEventId = {
      event_id: eventId,
      ...hint
    };
    const sdkProcessingMetadata = event.sdkProcessingMetadata || {};
    const capturedSpanScope = sdkProcessingMetadata.capturedSpanScope;
    const capturedSpanIsolationScope = sdkProcessingMetadata.capturedSpanIsolationScope;
    this._process(this._captureEvent(event, hintWithEventId, capturedSpanScope || currentScope, capturedSpanIsolationScope));
    return hintWithEventId.event_id;
  }

  /**
   * Captures a session.
   */
  captureSession(session) {
    this.sendSession(session);
    // After sending, we set init false to indicate it's not the first occurrence
    (0,_session_js__WEBPACK_IMPORTED_MODULE_6__.updateSession)(session, {
      init: false
    });
  }

  /**
   * Create a cron monitor check in and send it to Sentry. This method is not available on all clients.
   *
   * @param checkIn An object that describes a check in.
   * @param upsertMonitorConfig An optional object that describes a monitor config. Use this if you want
   * to create a monitor automatically when sending a check in.
   * @param scope An optional scope containing event metadata.
   * @returns A string representing the id of the check in.
   */

  /**
   * Get the current Dsn.
   */
  getDsn() {
    return this._dsn;
  }

  /**
   * Get the current options.
   */
  getOptions() {
    return this._options;
  }

  /**
   * Get the SDK metadata.
   * @see SdkMetadata
   */
  getSdkMetadata() {
    return this._options._metadata;
  }

  /**
   * Returns the transport that is used by the client.
   * Please note that the transport gets lazy initialized so it will only be there once the first event has been sent.
   */
  getTransport() {
    return this._transport;
  }

  /**
   * Wait for all events to be sent or the timeout to expire, whichever comes first.
   *
   * @param timeout Maximum time in ms the client should wait for events to be flushed. Omitting this parameter will
   *   cause the client to wait until all events are sent before resolving the promise.
   * @returns A promise that will resolve with `true` if all events are sent before the timeout, or `false` if there are
   * still events in the queue when the timeout is reached.
   */
  flush(timeout) {
    const transport = this._transport;
    if (transport) {
      this.emit('flush');
      return this._isClientDoneProcessing(timeout).then(clientFinished => {
        return transport.flush(timeout).then(transportFlushed => clientFinished && transportFlushed);
      });
    } else {
      return (0,_utils_hoist_syncpromise_js__WEBPACK_IMPORTED_MODULE_7__.resolvedSyncPromise)(true);
    }
  }

  /**
   * Flush the event queue and set the client to `enabled = false`. See {@link Client.flush}.
   *
   * @param {number} timeout Maximum time in ms the client should wait before shutting down. Omitting this parameter will cause
   *   the client to wait until all events are sent before disabling itself.
   * @returns {Promise<boolean>} A promise which resolves to `true` if the flush completes successfully before the timeout, or `false` if
   * it doesn't.
   */
  close(timeout) {
    return this.flush(timeout).then(result => {
      this.getOptions().enabled = false;
      this.emit('close');
      return result;
    });
  }

  /**
   * Get all installed event processors.
   */
  getEventProcessors() {
    return this._eventProcessors;
  }

  /**
   * Adds an event processor that applies to any event processed by this client.
   */
  addEventProcessor(eventProcessor) {
    this._eventProcessors.push(eventProcessor);
  }

  /**
   * Initialize this client.
   * Call this after the client was set on a scope.
   */
  init() {
    if (this._isEnabled() ||
    // Force integrations to be setup even if no DSN was set when we have
    // Spotlight enabled. This is particularly important for browser as we
    // don't support the `spotlight` option there and rely on the users
    // adding the `spotlightBrowserIntegration()` to their integrations which
    // wouldn't get initialized with the check below when there's no DSN set.
    this._options.integrations.some(_ref => {
      let {
        name
      } = _ref;
      return name.startsWith('Spotlight');
    })) {
      this._setupIntegrations();
    }
  }

  /**
   * Gets an installed integration by its name.
   *
   * @returns {Integration|undefined} The installed integration or `undefined` if no integration with that `name` was installed.
   */
  getIntegrationByName(integrationName) {
    return this._integrations[integrationName];
  }

  /**
   * Add an integration to the client.
   * This can be used to e.g. lazy load integrations.
   * In most cases, this should not be necessary,
   * and you're better off just passing the integrations via `integrations: []` at initialization time.
   * However, if you find the need to conditionally load & add an integration, you can use `addIntegration` to do so.
   */
  addIntegration(integration) {
    const isAlreadyInstalled = this._integrations[integration.name];

    // This hook takes care of only installing if not already installed
    (0,_integration_js__WEBPACK_IMPORTED_MODULE_8__.setupIntegration)(this, integration, this._integrations);
    // Here we need to check manually to make sure to not run this multiple times
    if (!isAlreadyInstalled) {
      (0,_integration_js__WEBPACK_IMPORTED_MODULE_8__.afterSetupIntegrations)(this, [integration]);
    }
  }

  /**
   * Send a fully prepared event to Sentry.
   */
  sendEvent(event, hint) {
    if (hint === void 0) {
      hint = {};
    }
    this.emit('beforeSendEvent', event, hint);
    let env = (0,_envelope_js__WEBPACK_IMPORTED_MODULE_9__.createEventEnvelope)(event, this._dsn, this._options._metadata, this._options.tunnel);
    for (const attachment of hint.attachments || []) {
      env = (0,_utils_hoist_envelope_js__WEBPACK_IMPORTED_MODULE_10__.addItemToEnvelope)(env, (0,_utils_hoist_envelope_js__WEBPACK_IMPORTED_MODULE_10__.createAttachmentEnvelopeItem)(attachment));
    }
    const promise = this.sendEnvelope(env);
    if (promise) {
      promise.then(sendResponse => this.emit('afterSendEvent', event, sendResponse), null);
    }
  }

  /**
   * Send a session or session aggregrates to Sentry.
   */
  sendSession(session) {
    // Backfill release and environment on session
    const {
      release: clientReleaseOption,
      environment: clientEnvironmentOption = _constants_js__WEBPACK_IMPORTED_MODULE_11__.DEFAULT_ENVIRONMENT
    } = this._options;
    if ('aggregates' in session) {
      const sessionAttrs = session.attrs || {};
      if (!sessionAttrs.release && !clientReleaseOption) {
        _debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD && _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_2__.logger.warn(MISSING_RELEASE_FOR_SESSION_ERROR);
        return;
      }
      sessionAttrs.release = sessionAttrs.release || clientReleaseOption;
      sessionAttrs.environment = sessionAttrs.environment || clientEnvironmentOption;
      session.attrs = sessionAttrs;
    } else {
      if (!session.release && !clientReleaseOption) {
        _debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD && _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_2__.logger.warn(MISSING_RELEASE_FOR_SESSION_ERROR);
        return;
      }
      session.release = session.release || clientReleaseOption;
      session.environment = session.environment || clientEnvironmentOption;
    }
    this.emit('beforeSendSession', session);
    const env = (0,_envelope_js__WEBPACK_IMPORTED_MODULE_9__.createSessionEnvelope)(session, this._dsn, this._options._metadata, this._options.tunnel);

    // sendEnvelope should not throw
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.sendEnvelope(env);
  }

  /**
   * Record on the client that an event got dropped (ie, an event that will not be sent to Sentry).
   */
  recordDroppedEvent(reason, category, count) {
    if (count === void 0) {
      count = 1;
    }
    if (this._options.sendClientReports) {
      // We want to track each category (error, transaction, session, replay_event) separately
      // but still keep the distinction between different type of outcomes.
      // We could use nested maps, but it's much easier to read and type this way.
      // A correct type for map-based implementation if we want to go that route
      // would be `Partial<Record<SentryRequestType, Partial<Record<Outcome, number>>>>`
      // With typescript 4.1 we could even use template literal types
      const key = `${reason}:${category}`;
      _debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD && _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_2__.logger.log(`Recording outcome: "${key}"${count > 1 ? ` (${count} times)` : ''}`);
      this._outcomes[key] = (this._outcomes[key] || 0) + count;
    }
  }

  /* eslint-disable @typescript-eslint/unified-signatures */
  /**
   * Register a callback for whenever a span is started.
   * Receives the span as argument.
   * @returns {() => void} A function that, when executed, removes the registered callback.
   */

  /**
   * Register a hook oin this client.
   */
  on(hook, callback) {
    const hooks = this._hooks[hook] = this._hooks[hook] || [];

    // @ts-expect-error We assume the types are correct
    hooks.push(callback);

    // This function returns a callback execution handler that, when invoked,
    // deregisters a callback. This is crucial for managing instances where callbacks
    // need to be unregistered to prevent self-referencing in callback closures,
    // ensuring proper garbage collection.
    return () => {
      // @ts-expect-error We assume the types are correct
      const cbIndex = hooks.indexOf(callback);
      if (cbIndex > -1) {
        hooks.splice(cbIndex, 1);
      }
    };
  }

  /** Fire a hook whenever a span starts. */

  /**
   * Emit a hook that was previously registered via `on()`.
   */
  emit(hook) {
    for (var _len = arguments.length, rest = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      rest[_key - 1] = arguments[_key];
    }
    const callbacks = this._hooks[hook];
    if (callbacks) {
      callbacks.forEach(callback => callback(...rest));
    }
  }

  /**
   * Send an envelope to Sentry.
   */
  sendEnvelope(envelope) {
    this.emit('beforeEnvelope', envelope);
    if (this._isEnabled() && this._transport) {
      return this._transport.send(envelope).then(null, reason => {
        _debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD && _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_2__.logger.error('Error while sending envelope:', reason);
        return reason;
      });
    }
    _debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD && _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_2__.logger.error('Transport disabled');
    return (0,_utils_hoist_syncpromise_js__WEBPACK_IMPORTED_MODULE_7__.resolvedSyncPromise)({});
  }

  /* eslint-enable @typescript-eslint/unified-signatures */

  /** Setup integrations for this client. */
  _setupIntegrations() {
    const {
      integrations
    } = this._options;
    this._integrations = (0,_integration_js__WEBPACK_IMPORTED_MODULE_8__.setupIntegrations)(this, integrations);
    (0,_integration_js__WEBPACK_IMPORTED_MODULE_8__.afterSetupIntegrations)(this, integrations);
  }

  /** Updates existing session based on the provided event */
  _updateSessionFromEvent(session, event) {
    let crashed = event.level === 'fatal';
    let errored = false;
    const exceptions = event.exception?.values;
    if (exceptions) {
      errored = true;
      for (const ex of exceptions) {
        const mechanism = ex.mechanism;
        if (mechanism?.handled === false) {
          crashed = true;
          break;
        }
      }
    }

    // A session is updated and that session update is sent in only one of the two following scenarios:
    // 1. Session with non terminal status and 0 errors + an error occurred -> Will set error count to 1 and send update
    // 2. Session with non terminal status and 1 error + a crash occurred -> Will set status crashed and send update
    const sessionNonTerminal = session.status === 'ok';
    const shouldUpdateAndSend = sessionNonTerminal && session.errors === 0 || sessionNonTerminal && crashed;
    if (shouldUpdateAndSend) {
      (0,_session_js__WEBPACK_IMPORTED_MODULE_6__.updateSession)(session, {
        ...(crashed && {
          status: 'crashed'
        }),
        errors: session.errors || Number(errored || crashed)
      });
      this.captureSession(session);
    }
  }

  /**
   * Determine if the client is finished processing. Returns a promise because it will wait `timeout` ms before saying
   * "no" (resolving to `false`) in order to give the client a chance to potentially finish first.
   *
   * @param timeout The time, in ms, after which to resolve to `false` if the client is still busy. Passing `0` (or not
   * passing anything) will make the promise wait as long as it takes for processing to finish before resolving to
   * `true`.
   * @returns A promise which will resolve to `true` if processing is already done or finishes before the timeout, and
   * `false` otherwise
   */
  _isClientDoneProcessing(timeout) {
    return new _utils_hoist_syncpromise_js__WEBPACK_IMPORTED_MODULE_7__.SyncPromise(resolve => {
      let ticked = 0;
      const tick = 1;
      const interval = setInterval(() => {
        if (this._numProcessing == 0) {
          clearInterval(interval);
          resolve(true);
        } else {
          ticked += tick;
          if (timeout && ticked >= timeout) {
            clearInterval(interval);
            resolve(false);
          }
        }
      }, tick);
    });
  }

  /** Determines whether this SDK is enabled and a transport is present. */
  _isEnabled() {
    return this.getOptions().enabled !== false && this._transport !== undefined;
  }

  /**
   * Adds common information to events.
   *
   * The information includes release and environment from `options`,
   * breadcrumbs and context (extra, tags and user) from the scope.
   *
   * Information that is already present in the event is never overwritten. For
   * nested objects, such as the context, keys are merged.
   *
   * @param event The original event.
   * @param hint May contain additional information about the original exception.
   * @param currentScope A scope containing event metadata.
   * @returns A new event with more information.
   */
  _prepareEvent(event, hint, currentScope, isolationScope) {
    const options = this.getOptions();
    const integrations = Object.keys(this._integrations);
    if (!hint.integrations && integrations?.length) {
      hint.integrations = integrations;
    }
    this.emit('preprocessEvent', event, hint);
    if (!event.type) {
      isolationScope.setLastEventId(event.event_id || hint.event_id);
    }
    return (0,_utils_prepareEvent_js__WEBPACK_IMPORTED_MODULE_12__.prepareEvent)(options, event, hint, currentScope, this, isolationScope).then(evt => {
      if (evt === null) {
        return evt;
      }
      this.emit('postprocessEvent', evt, hint);
      evt.contexts = {
        trace: (0,_currentScopes_js__WEBPACK_IMPORTED_MODULE_13__.getTraceContextFromScope)(currentScope),
        ...evt.contexts
      };
      const dynamicSamplingContext = (0,_tracing_dynamicSamplingContext_js__WEBPACK_IMPORTED_MODULE_14__.getDynamicSamplingContextFromScope)(this, currentScope);
      evt.sdkProcessingMetadata = {
        dynamicSamplingContext,
        ...evt.sdkProcessingMetadata
      };
      return evt;
    });
  }

  /**
   * Processes the event and logs an error in case of rejection
   * @param event
   * @param hint
   * @param scope
   */
  _captureEvent(event, hint, currentScope, isolationScope) {
    if (hint === void 0) {
      hint = {};
    }
    if (currentScope === void 0) {
      currentScope = (0,_currentScopes_js__WEBPACK_IMPORTED_MODULE_13__.getCurrentScope)();
    }
    if (isolationScope === void 0) {
      isolationScope = (0,_currentScopes_js__WEBPACK_IMPORTED_MODULE_13__.getIsolationScope)();
    }
    if (_debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD && isErrorEvent(event)) {
      _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_2__.logger.log(`Captured error event \`${(0,_utils_eventUtils_js__WEBPACK_IMPORTED_MODULE_15__.getPossibleEventMessages)(event)[0] || '<unknown>'}\``);
    }
    return this._processEvent(event, hint, currentScope, isolationScope).then(finalEvent => {
      return finalEvent.event_id;
    }, reason => {
      if (_debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD) {
        // If something's gone wrong, log the error as a warning. If it's just us having used a `SentryError` for
        // control flow, log just the message (no stack) as a log-level log.
        if (reason instanceof _utils_hoist_error_js__WEBPACK_IMPORTED_MODULE_16__.SentryError && reason.logLevel === 'log') {
          _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_2__.logger.log(reason.message);
        } else {
          _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_2__.logger.warn(reason);
        }
      }
      return undefined;
    });
  }

  /**
   * Processes an event (either error or message) and sends it to Sentry.
   *
   * This also adds breadcrumbs and context information to the event. However,
   * platform specific meta data (such as the User's IP address) must be added
   * by the SDK implementor.
   *
   *
   * @param event The event to send to Sentry.
   * @param hint May contain additional information about the original exception.
   * @param currentScope A scope containing event metadata.
   * @returns A SyncPromise that resolves with the event or rejects in case event was/will not be send.
   */
  _processEvent(event, hint, currentScope, isolationScope) {
    const options = this.getOptions();
    const {
      sampleRate
    } = options;
    const isTransaction = isTransactionEvent(event);
    const isError = isErrorEvent(event);
    const eventType = event.type || 'error';
    const beforeSendLabel = `before send for type \`${eventType}\``;

    // 1.0 === 100% events are sent
    // 0.0 === 0% events are sent
    // Sampling for transaction happens somewhere else
    const parsedSampleRate = typeof sampleRate === 'undefined' ? undefined : (0,_utils_parseSampleRate_js__WEBPACK_IMPORTED_MODULE_17__.parseSampleRate)(sampleRate);
    if (isError && typeof parsedSampleRate === 'number' && Math.random() > parsedSampleRate) {
      this.recordDroppedEvent('sample_rate', 'error');
      return (0,_utils_hoist_syncpromise_js__WEBPACK_IMPORTED_MODULE_7__.rejectedSyncPromise)(new _utils_hoist_error_js__WEBPACK_IMPORTED_MODULE_16__.SentryError(`Discarding event because it's not included in the random sample (sampling rate = ${sampleRate})`, 'log'));
    }
    const dataCategory = eventType === 'replay_event' ? 'replay' : eventType;
    return this._prepareEvent(event, hint, currentScope, isolationScope).then(prepared => {
      if (prepared === null) {
        this.recordDroppedEvent('event_processor', dataCategory);
        throw new _utils_hoist_error_js__WEBPACK_IMPORTED_MODULE_16__.SentryError('An event processor returned `null`, will not send event.', 'log');
      }
      const isInternalException = hint.data && hint.data.__sentry__ === true;
      if (isInternalException) {
        return prepared;
      }
      const result = processBeforeSend(this, options, prepared, hint);
      return _validateBeforeSendResult(result, beforeSendLabel);
    }).then(processedEvent => {
      if (processedEvent === null) {
        this.recordDroppedEvent('before_send', dataCategory);
        if (isTransaction) {
          const spans = event.spans || [];
          // the transaction itself counts as one span, plus all the child spans that are added
          const spanCount = 1 + spans.length;
          this.recordDroppedEvent('before_send', 'span', spanCount);
        }
        throw new _utils_hoist_error_js__WEBPACK_IMPORTED_MODULE_16__.SentryError(`${beforeSendLabel} returned \`null\`, will not send event.`, 'log');
      }
      const session = currentScope.getSession() || isolationScope.getSession();
      if (isError && session) {
        this._updateSessionFromEvent(session, processedEvent);
      }
      if (isTransaction) {
        const spanCountBefore = processedEvent.sdkProcessingMetadata?.spanCountBeforeProcessing || 0;
        const spanCountAfter = processedEvent.spans ? processedEvent.spans.length : 0;
        const droppedSpanCount = spanCountBefore - spanCountAfter;
        if (droppedSpanCount > 0) {
          this.recordDroppedEvent('before_send', 'span', droppedSpanCount);
        }
      }

      // None of the Sentry built event processor will update transaction name,
      // so if the transaction name has been changed by an event processor, we know
      // it has to come from custom event processor added by a user
      const transactionInfo = processedEvent.transaction_info;
      if (isTransaction && transactionInfo && processedEvent.transaction !== event.transaction) {
        const source = 'custom';
        processedEvent.transaction_info = {
          ...transactionInfo,
          source
        };
      }
      this.sendEvent(processedEvent, hint);
      return processedEvent;
    }).then(null, reason => {
      if (reason instanceof _utils_hoist_error_js__WEBPACK_IMPORTED_MODULE_16__.SentryError) {
        throw reason;
      }
      this.captureException(reason, {
        data: {
          __sentry__: true
        },
        originalException: reason
      });
      throw new _utils_hoist_error_js__WEBPACK_IMPORTED_MODULE_16__.SentryError(`Event processing pipeline threw an error, original event will not be sent. Details have been sent as a new event.\nReason: ${reason}`);
    });
  }

  /**
   * Occupies the client with processing and event
   */
  _process(promise) {
    this._numProcessing++;
    void promise.then(value => {
      this._numProcessing--;
      return value;
    }, reason => {
      this._numProcessing--;
      return reason;
    });
  }

  /**
   * Clears outcomes on this client and returns them.
   */
  _clearOutcomes() {
    const outcomes = this._outcomes;
    this._outcomes = {};
    return Object.entries(outcomes).map(_ref2 => {
      let [key, quantity] = _ref2;
      const [reason, category] = key.split(':');
      return {
        reason,
        category,
        quantity
      };
    });
  }

  /**
   * Sends client reports as an envelope.
   */
  _flushOutcomes() {
    _debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD && _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_2__.logger.log('Flushing outcomes...');
    const outcomes = this._clearOutcomes();
    if (outcomes.length === 0) {
      _debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD && _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_2__.logger.log('No outcomes to send');
      return;
    }

    // This is really the only place where we want to check for a DSN and only send outcomes then
    if (!this._dsn) {
      _debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD && _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_2__.logger.log('No dsn provided, will not send outcomes');
      return;
    }
    _debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD && _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_2__.logger.log('Sending outcomes:', outcomes);
    const envelope = (0,_utils_hoist_clientreport_js__WEBPACK_IMPORTED_MODULE_18__.createClientReportEnvelope)(outcomes, this._options.tunnel && (0,_utils_hoist_dsn_js__WEBPACK_IMPORTED_MODULE_0__.dsnToString)(this._dsn));

    // sendEnvelope should not throw
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.sendEnvelope(envelope);
  }

  /**
   * Creates an {@link Event} from all inputs to `captureException` and non-primitive inputs to `captureMessage`.
   */
}

/**
 * @deprecated Use `Client` instead. This alias may be removed in a future major version.
 */
// TODO(v10): Remove

/**
 * @deprecated Use `Client` instead. This alias may be removed in a future major version.
 */
// TODO(v10): Remove
const BaseClient = Client;

/**
 * Verifies that return value of configured `beforeSend` or `beforeSendTransaction` is of expected type, and returns the value if so.
 */
function _validateBeforeSendResult(beforeSendResult, beforeSendLabel) {
  const invalidValueError = `${beforeSendLabel} must return \`null\` or a valid event.`;
  if ((0,_utils_hoist_is_js__WEBPACK_IMPORTED_MODULE_5__.isThenable)(beforeSendResult)) {
    return beforeSendResult.then(event => {
      if (!(0,_utils_hoist_is_js__WEBPACK_IMPORTED_MODULE_5__.isPlainObject)(event) && event !== null) {
        throw new _utils_hoist_error_js__WEBPACK_IMPORTED_MODULE_16__.SentryError(invalidValueError);
      }
      return event;
    }, e => {
      throw new _utils_hoist_error_js__WEBPACK_IMPORTED_MODULE_16__.SentryError(`${beforeSendLabel} rejected with ${e}`);
    });
  } else if (!(0,_utils_hoist_is_js__WEBPACK_IMPORTED_MODULE_5__.isPlainObject)(beforeSendResult) && beforeSendResult !== null) {
    throw new _utils_hoist_error_js__WEBPACK_IMPORTED_MODULE_16__.SentryError(invalidValueError);
  }
  return beforeSendResult;
}

/**
 * Process the matching `beforeSendXXX` callback.
 */
function processBeforeSend(client, options, event, hint) {
  const {
    beforeSend,
    beforeSendTransaction,
    beforeSendSpan
  } = options;
  let processedEvent = event;
  if (isErrorEvent(processedEvent) && beforeSend) {
    return beforeSend(processedEvent, hint);
  }
  if (isTransactionEvent(processedEvent)) {
    if (beforeSendSpan) {
      // process root span
      const processedRootSpanJson = beforeSendSpan((0,_utils_transactionEvent_js__WEBPACK_IMPORTED_MODULE_19__.convertTransactionEventToSpanJson)(processedEvent));
      if (!processedRootSpanJson) {
        (0,_utils_spanUtils_js__WEBPACK_IMPORTED_MODULE_20__.showSpanDropWarning)();
      } else {
        // update event with processed root span values
        processedEvent = (0,_utils_merge_js__WEBPACK_IMPORTED_MODULE_21__.merge)(event, (0,_utils_transactionEvent_js__WEBPACK_IMPORTED_MODULE_19__.convertSpanJsonToTransactionEvent)(processedRootSpanJson));
      }

      // process child spans
      if (processedEvent.spans) {
        const processedSpans = [];
        for (const span of processedEvent.spans) {
          const processedSpan = beforeSendSpan(span);
          if (!processedSpan) {
            (0,_utils_spanUtils_js__WEBPACK_IMPORTED_MODULE_20__.showSpanDropWarning)();
            processedSpans.push(span);
          } else {
            processedSpans.push(processedSpan);
          }
        }
        processedEvent.spans = processedSpans;
      }
    }
    if (beforeSendTransaction) {
      if (processedEvent.spans) {
        // We store the # of spans before processing in SDK metadata,
        // so we can compare it afterwards to determine how many spans were dropped
        const spanCountBefore = processedEvent.spans.length;
        processedEvent.sdkProcessingMetadata = {
          ...event.sdkProcessingMetadata,
          spanCountBeforeProcessing: spanCountBefore
        };
      }
      return beforeSendTransaction(processedEvent, hint);
    }
  }
  return processedEvent;
}
function isErrorEvent(event) {
  return event.type === undefined;
}
function isTransactionEvent(event) {
  return event.type === 'transaction';
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/constants.js":
/*!**********************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/constants.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DEFAULT_ENVIRONMENT: () => (/* binding */ DEFAULT_ENVIRONMENT)
/* harmony export */ });
const DEFAULT_ENVIRONMENT = 'production';


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/currentScopes.js":
/*!**************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/currentScopes.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getClient: () => (/* binding */ getClient),
/* harmony export */   getCurrentScope: () => (/* binding */ getCurrentScope),
/* harmony export */   getGlobalScope: () => (/* binding */ getGlobalScope),
/* harmony export */   getIsolationScope: () => (/* binding */ getIsolationScope),
/* harmony export */   getTraceContextFromScope: () => (/* binding */ getTraceContextFromScope),
/* harmony export */   withIsolationScope: () => (/* binding */ withIsolationScope),
/* harmony export */   withScope: () => (/* binding */ withScope)
/* harmony export */ });
/* harmony import */ var _asyncContext_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./asyncContext/index.js */ "./node_modules/@sentry/core/build/esm/asyncContext/index.js");
/* harmony import */ var _carrier_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./carrier.js */ "./node_modules/@sentry/core/build/esm/carrier.js");
/* harmony import */ var _scope_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./scope.js */ "./node_modules/@sentry/core/build/esm/scope.js");
/* harmony import */ var _utils_hoist_object_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utils-hoist/object.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/object.js");
/* harmony import */ var _utils_hoist_propagationContext_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./utils-hoist/propagationContext.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/propagationContext.js");










/**
 * Get the currently active scope.
 */
function getCurrentScope() {
  const carrier = (0,_carrier_js__WEBPACK_IMPORTED_MODULE_0__.getMainCarrier)();
  const acs = (0,_asyncContext_index_js__WEBPACK_IMPORTED_MODULE_1__.getAsyncContextStrategy)(carrier);
  return acs.getCurrentScope();
}

/**
 * Get the currently active isolation scope.
 * The isolation scope is active for the current execution context.
 */
function getIsolationScope() {
  const carrier = (0,_carrier_js__WEBPACK_IMPORTED_MODULE_0__.getMainCarrier)();
  const acs = (0,_asyncContext_index_js__WEBPACK_IMPORTED_MODULE_1__.getAsyncContextStrategy)(carrier);
  return acs.getIsolationScope();
}

/**
 * Get the global scope.
 * This scope is applied to _all_ events.
 */
function getGlobalScope() {
  return (0,_carrier_js__WEBPACK_IMPORTED_MODULE_0__.getGlobalSingleton)('globalScope', () => new _scope_js__WEBPACK_IMPORTED_MODULE_2__.Scope());
}

/**
 * Creates a new scope with and executes the given operation within.
 * The scope is automatically removed once the operation
 * finishes or throws.
 */

/**
 * Either creates a new active scope, or sets the given scope as active scope in the given callback.
 */
function withScope() {
  const carrier = (0,_carrier_js__WEBPACK_IMPORTED_MODULE_0__.getMainCarrier)();
  const acs = (0,_asyncContext_index_js__WEBPACK_IMPORTED_MODULE_1__.getAsyncContextStrategy)(carrier);

  // If a scope is defined, we want to make this the active scope instead of the default one
  for (var _len = arguments.length, rest = new Array(_len), _key = 0; _key < _len; _key++) {
    rest[_key] = arguments[_key];
  }
  if (rest.length === 2) {
    const [scope, callback] = rest;
    if (!scope) {
      return acs.withScope(callback);
    }
    return acs.withSetScope(scope, callback);
  }
  return acs.withScope(rest[0]);
}

/**
 * Attempts to fork the current isolation scope and the current scope based on the current async context strategy. If no
 * async context strategy is set, the isolation scope and the current scope will not be forked (this is currently the
 * case, for example, in the browser).
 *
 * Usage of this function in environments without async context strategy is discouraged and may lead to unexpected behaviour.
 *
 * This function is intended for Sentry SDK and SDK integration development. It is not recommended to be used in "normal"
 * applications directly because it comes with pitfalls. Use at your own risk!
 */

/**
 * Either creates a new active isolation scope, or sets the given isolation scope as active scope in the given callback.
 */
function withIsolationScope() {
  const carrier = (0,_carrier_js__WEBPACK_IMPORTED_MODULE_0__.getMainCarrier)();
  const acs = (0,_asyncContext_index_js__WEBPACK_IMPORTED_MODULE_1__.getAsyncContextStrategy)(carrier);

  // If a scope is defined, we want to make this the active scope instead of the default one
  for (var _len2 = arguments.length, rest = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    rest[_key2] = arguments[_key2];
  }
  if (rest.length === 2) {
    const [isolationScope, callback] = rest;
    if (!isolationScope) {
      return acs.withIsolationScope(callback);
    }
    return acs.withSetIsolationScope(isolationScope, callback);
  }
  return acs.withIsolationScope(rest[0]);
}

/**
 * Get the currently active client.
 */
function getClient() {
  return getCurrentScope().getClient();
}

/**
 * Get a trace context for the given scope.
 */
function getTraceContextFromScope(scope) {
  const propagationContext = scope.getPropagationContext();
  const {
    traceId,
    parentSpanId,
    propagationSpanId
  } = propagationContext;
  const traceContext = (0,_utils_hoist_object_js__WEBPACK_IMPORTED_MODULE_3__.dropUndefinedKeys)({
    trace_id: traceId,
    span_id: propagationSpanId || (0,_utils_hoist_propagationContext_js__WEBPACK_IMPORTED_MODULE_4__.generateSpanId)(),
    parent_span_id: parentSpanId
  });
  return traceContext;
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/debug-build.js":
/*!************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/debug-build.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DEBUG_BUILD: () => (/* binding */ DEBUG_BUILD)
/* harmony export */ });
/**
 * This serves as a build time flag that will be true by default, but false in non-debug builds or if users replace `__SENTRY_DEBUG__` in their generated code.
 *
 * ATTENTION: This constant must never cross package boundaries (i.e. be exported) to guarantee that it can be used for tree shaking.
 */
const DEBUG_BUILD =  false || false;


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/defaultScopes.js":
/*!**************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/defaultScopes.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getDefaultCurrentScope: () => (/* binding */ getDefaultCurrentScope),
/* harmony export */   getDefaultIsolationScope: () => (/* binding */ getDefaultIsolationScope)
/* harmony export */ });
/* harmony import */ var _carrier_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./carrier.js */ "./node_modules/@sentry/core/build/esm/carrier.js");
/* harmony import */ var _scope_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./scope.js */ "./node_modules/@sentry/core/build/esm/scope.js");



/** Get the default current scope. */
function getDefaultCurrentScope() {
  return (0,_carrier_js__WEBPACK_IMPORTED_MODULE_0__.getGlobalSingleton)('defaultCurrentScope', () => new _scope_js__WEBPACK_IMPORTED_MODULE_1__.Scope());
}

/** Get the default isolation scope. */
function getDefaultIsolationScope() {
  return (0,_carrier_js__WEBPACK_IMPORTED_MODULE_0__.getGlobalSingleton)('defaultIsolationScope', () => new _scope_js__WEBPACK_IMPORTED_MODULE_1__.Scope());
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/envelope.js":
/*!*********************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/envelope.js ***!
  \*********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createEventEnvelope: () => (/* binding */ createEventEnvelope),
/* harmony export */   createSessionEnvelope: () => (/* binding */ createSessionEnvelope),
/* harmony export */   createSpanEnvelope: () => (/* binding */ createSpanEnvelope)
/* harmony export */ });
/* harmony import */ var _tracing_dynamicSamplingContext_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./tracing/dynamicSamplingContext.js */ "./node_modules/@sentry/core/build/esm/tracing/dynamicSamplingContext.js");
/* harmony import */ var _utils_hoist_dsn_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils-hoist/dsn.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/dsn.js");
/* harmony import */ var _utils_hoist_envelope_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils-hoist/envelope.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/envelope.js");
/* harmony import */ var _utils_spanUtils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utils/spanUtils.js */ "./node_modules/@sentry/core/build/esm/utils/spanUtils.js");







/**
 * Apply SdkInfo (name, version, packages, integrations) to the corresponding event key.
 * Merge with existing data if any.
 **/
function enhanceEventWithSdkInfo(event, sdkInfo) {
  if (!sdkInfo) {
    return event;
  }
  event.sdk = event.sdk || {};
  event.sdk.name = event.sdk.name || sdkInfo.name;
  event.sdk.version = event.sdk.version || sdkInfo.version;
  event.sdk.integrations = [...(event.sdk.integrations || []), ...(sdkInfo.integrations || [])];
  event.sdk.packages = [...(event.sdk.packages || []), ...(sdkInfo.packages || [])];
  return event;
}

/** Creates an envelope from a Session */
function createSessionEnvelope(session, dsn, metadata, tunnel) {
  const sdkInfo = (0,_utils_hoist_envelope_js__WEBPACK_IMPORTED_MODULE_0__.getSdkMetadataForEnvelopeHeader)(metadata);
  const envelopeHeaders = {
    sent_at: new Date().toISOString(),
    ...(sdkInfo && {
      sdk: sdkInfo
    }),
    ...(!!tunnel && dsn && {
      dsn: (0,_utils_hoist_dsn_js__WEBPACK_IMPORTED_MODULE_1__.dsnToString)(dsn)
    })
  };
  const envelopeItem = 'aggregates' in session ? [{
    type: 'sessions'
  }, session] : [{
    type: 'session'
  }, session.toJSON()];
  return (0,_utils_hoist_envelope_js__WEBPACK_IMPORTED_MODULE_0__.createEnvelope)(envelopeHeaders, [envelopeItem]);
}

/**
 * Create an Envelope from an event.
 */
function createEventEnvelope(event, dsn, metadata, tunnel) {
  const sdkInfo = (0,_utils_hoist_envelope_js__WEBPACK_IMPORTED_MODULE_0__.getSdkMetadataForEnvelopeHeader)(metadata);

  /*
    Note: Due to TS, event.type may be `replay_event`, theoretically.
    In practice, we never call `createEventEnvelope` with `replay_event` type,
    and we'd have to adjust a looot of types to make this work properly.
    We want to avoid casting this around, as that could lead to bugs (e.g. when we add another type)
    So the safe choice is to really guard against the replay_event type here.
  */
  const eventType = event.type && event.type !== 'replay_event' ? event.type : 'event';
  enhanceEventWithSdkInfo(event, metadata?.sdk);
  const envelopeHeaders = (0,_utils_hoist_envelope_js__WEBPACK_IMPORTED_MODULE_0__.createEventEnvelopeHeaders)(event, sdkInfo, tunnel, dsn);

  // Prevent this data (which, if it exists, was used in earlier steps in the processing pipeline) from being sent to
  // sentry. (Note: Our use of this property comes and goes with whatever we might be debugging, whatever hacks we may
  // have temporarily added, etc. Even if we don't happen to be using it at some point in the future, let's not get rid
  // of this `delete`, lest we miss putting it back in the next time the property is in use.)
  delete event.sdkProcessingMetadata;
  const eventItem = [{
    type: eventType
  }, event];
  return (0,_utils_hoist_envelope_js__WEBPACK_IMPORTED_MODULE_0__.createEnvelope)(envelopeHeaders, [eventItem]);
}

/**
 * Create envelope from Span item.
 *
 * Takes an optional client and runs spans through `beforeSendSpan` if available.
 */
function createSpanEnvelope(spans, client) {
  function dscHasRequiredProps(dsc) {
    return !!dsc.trace_id && !!dsc.public_key;
  }

  // For the moment we'll obtain the DSC from the first span in the array
  // This might need to be changed if we permit sending multiple spans from
  // different segments in one envelope
  const dsc = (0,_tracing_dynamicSamplingContext_js__WEBPACK_IMPORTED_MODULE_2__.getDynamicSamplingContextFromSpan)(spans[0]);
  const dsn = client?.getDsn();
  const tunnel = client?.getOptions().tunnel;
  const headers = {
    sent_at: new Date().toISOString(),
    ...(dscHasRequiredProps(dsc) && {
      trace: dsc
    }),
    ...(!!tunnel && dsn && {
      dsn: (0,_utils_hoist_dsn_js__WEBPACK_IMPORTED_MODULE_1__.dsnToString)(dsn)
    })
  };
  const beforeSendSpan = client?.getOptions().beforeSendSpan;
  const convertToSpanJSON = beforeSendSpan ? span => {
    const spanJson = (0,_utils_spanUtils_js__WEBPACK_IMPORTED_MODULE_3__.spanToJSON)(span);
    const processedSpan = beforeSendSpan(spanJson);
    if (!processedSpan) {
      (0,_utils_spanUtils_js__WEBPACK_IMPORTED_MODULE_3__.showSpanDropWarning)();
      return spanJson;
    }
    return processedSpan;
  } : _utils_spanUtils_js__WEBPACK_IMPORTED_MODULE_3__.spanToJSON;
  const items = [];
  for (const span of spans) {
    const spanJson = convertToSpanJSON(span);
    if (spanJson) {
      items.push((0,_utils_hoist_envelope_js__WEBPACK_IMPORTED_MODULE_0__.createSpanEnvelopeItem)(spanJson));
    }
  }
  return (0,_utils_hoist_envelope_js__WEBPACK_IMPORTED_MODULE_0__.createEnvelope)(headers, items);
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/eventProcessors.js":
/*!****************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/eventProcessors.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   notifyEventProcessors: () => (/* binding */ notifyEventProcessors)
/* harmony export */ });
/* harmony import */ var _debug_build_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./debug-build.js */ "./node_modules/@sentry/core/build/esm/debug-build.js");
/* harmony import */ var _utils_hoist_is_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utils-hoist/is.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/is.js");
/* harmony import */ var _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils-hoist/logger.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/logger.js");
/* harmony import */ var _utils_hoist_syncpromise_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils-hoist/syncpromise.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/syncpromise.js");





/**
 * Process an array of event processors, returning the processed event (or `null` if the event was dropped).
 */
function notifyEventProcessors(processors, event, hint, index) {
  if (index === void 0) {
    index = 0;
  }
  return new _utils_hoist_syncpromise_js__WEBPACK_IMPORTED_MODULE_0__.SyncPromise((resolve, reject) => {
    const processor = processors[index];
    if (event === null || typeof processor !== 'function') {
      resolve(event);
    } else {
      const result = processor({
        ...event
      }, hint);
      _debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD && processor.id && result === null && _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_2__.logger.log(`Event processor "${processor.id}" dropped event`);
      if ((0,_utils_hoist_is_js__WEBPACK_IMPORTED_MODULE_3__.isThenable)(result)) {
        void result.then(final => notifyEventProcessors(processors, final, hint, index + 1).then(resolve)).then(null, reject);
      } else {
        void notifyEventProcessors(processors, result, hint, index + 1).then(resolve).then(null, reject);
      }
    }
  });
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/exports.js":
/*!********************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/exports.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addEventProcessor: () => (/* binding */ addEventProcessor),
/* harmony export */   captureCheckIn: () => (/* binding */ captureCheckIn),
/* harmony export */   captureEvent: () => (/* binding */ captureEvent),
/* harmony export */   captureException: () => (/* binding */ captureException),
/* harmony export */   captureMessage: () => (/* binding */ captureMessage),
/* harmony export */   captureSession: () => (/* binding */ captureSession),
/* harmony export */   close: () => (/* binding */ close),
/* harmony export */   endSession: () => (/* binding */ endSession),
/* harmony export */   flush: () => (/* binding */ flush),
/* harmony export */   isEnabled: () => (/* binding */ isEnabled),
/* harmony export */   isInitialized: () => (/* binding */ isInitialized),
/* harmony export */   lastEventId: () => (/* binding */ lastEventId),
/* harmony export */   setContext: () => (/* binding */ setContext),
/* harmony export */   setExtra: () => (/* binding */ setExtra),
/* harmony export */   setExtras: () => (/* binding */ setExtras),
/* harmony export */   setTag: () => (/* binding */ setTag),
/* harmony export */   setTags: () => (/* binding */ setTags),
/* harmony export */   setUser: () => (/* binding */ setUser),
/* harmony export */   startSession: () => (/* binding */ startSession),
/* harmony export */   withMonitor: () => (/* binding */ withMonitor)
/* harmony export */ });
/* harmony import */ var _currentScopes_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./currentScopes.js */ "./node_modules/@sentry/core/build/esm/currentScopes.js");
/* harmony import */ var _debug_build_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./debug-build.js */ "./node_modules/@sentry/core/build/esm/debug-build.js");
/* harmony import */ var _session_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./session.js */ "./node_modules/@sentry/core/build/esm/session.js");
/* harmony import */ var _utils_hoist_is_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./utils-hoist/is.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/is.js");
/* harmony import */ var _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utils-hoist/logger.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/logger.js");
/* harmony import */ var _utils_hoist_misc_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./utils-hoist/misc.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/misc.js");
/* harmony import */ var _utils_hoist_time_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./utils-hoist/time.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/time.js");
/* harmony import */ var _utils_hoist_worldwide_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./utils-hoist/worldwide.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/worldwide.js");
/* harmony import */ var _utils_prepareEvent_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils/prepareEvent.js */ "./node_modules/@sentry/core/build/esm/utils/prepareEvent.js");










/**
 * Captures an exception event and sends it to Sentry.
 *
 * @param exception The exception to capture.
 * @param hint Optional additional data to attach to the Sentry event.
 * @returns the id of the captured Sentry event.
 */
function captureException(exception, hint) {
  return (0,_currentScopes_js__WEBPACK_IMPORTED_MODULE_0__.getCurrentScope)().captureException(exception, (0,_utils_prepareEvent_js__WEBPACK_IMPORTED_MODULE_1__.parseEventHintOrCaptureContext)(hint));
}

/**
 * Captures a message event and sends it to Sentry.
 *
 * @param message The message to send to Sentry.
 * @param captureContext Define the level of the message or pass in additional data to attach to the message.
 * @returns the id of the captured message.
 */
function captureMessage(message, captureContext) {
  // This is necessary to provide explicit scopes upgrade, without changing the original
  // arity of the `captureMessage(message, level)` method.
  const level = typeof captureContext === 'string' ? captureContext : undefined;
  const context = typeof captureContext !== 'string' ? {
    captureContext
  } : undefined;
  return (0,_currentScopes_js__WEBPACK_IMPORTED_MODULE_0__.getCurrentScope)().captureMessage(message, level, context);
}

/**
 * Captures a manually created event and sends it to Sentry.
 *
 * @param event The event to send to Sentry.
 * @param hint Optional additional data to attach to the Sentry event.
 * @returns the id of the captured event.
 */
function captureEvent(event, hint) {
  return (0,_currentScopes_js__WEBPACK_IMPORTED_MODULE_0__.getCurrentScope)().captureEvent(event, hint);
}

/**
 * Sets context data with the given name.
 * @param name of the context
 * @param context Any kind of data. This data will be normalized.
 */
function setContext(name, context) {
  (0,_currentScopes_js__WEBPACK_IMPORTED_MODULE_0__.getIsolationScope)().setContext(name, context);
}

/**
 * Set an object that will be merged sent as extra data with the event.
 * @param extras Extras object to merge into current context.
 */
function setExtras(extras) {
  (0,_currentScopes_js__WEBPACK_IMPORTED_MODULE_0__.getIsolationScope)().setExtras(extras);
}

/**
 * Set key:value that will be sent as extra data with the event.
 * @param key String of extra
 * @param extra Any kind of data. This data will be normalized.
 */
function setExtra(key, extra) {
  (0,_currentScopes_js__WEBPACK_IMPORTED_MODULE_0__.getIsolationScope)().setExtra(key, extra);
}

/**
 * Set an object that will be merged sent as tags data with the event.
 * @param tags Tags context object to merge into current context.
 */
function setTags(tags) {
  (0,_currentScopes_js__WEBPACK_IMPORTED_MODULE_0__.getIsolationScope)().setTags(tags);
}

/**
 * Set key:value that will be sent as tags data with the event.
 *
 * Can also be used to unset a tag, by passing `undefined`.
 *
 * @param key String key of tag
 * @param value Value of tag
 */
function setTag(key, value) {
  (0,_currentScopes_js__WEBPACK_IMPORTED_MODULE_0__.getIsolationScope)().setTag(key, value);
}

/**
 * Updates user context information for future events.
 *
 * @param user User context object to be set in the current context. Pass `null` to unset the user.
 */
function setUser(user) {
  (0,_currentScopes_js__WEBPACK_IMPORTED_MODULE_0__.getIsolationScope)().setUser(user);
}

/**
 * The last error event id of the isolation scope.
 *
 * Warning: This function really returns the last recorded error event id on the current
 * isolation scope. If you call this function after handling a certain error and another error
 * is captured in between, the last one is returned instead of the one you might expect.
 * Also, ids of events that were never sent to Sentry (for example because
 * they were dropped in `beforeSend`) could be returned.
 *
 * @returns The last event id of the isolation scope.
 */
function lastEventId() {
  return (0,_currentScopes_js__WEBPACK_IMPORTED_MODULE_0__.getIsolationScope)().lastEventId();
}

/**
 * Create a cron monitor check in and send it to Sentry.
 *
 * @param checkIn An object that describes a check in.
 * @param upsertMonitorConfig An optional object that describes a monitor config. Use this if you want
 * to create a monitor automatically when sending a check in.
 */
function captureCheckIn(checkIn, upsertMonitorConfig) {
  const scope = (0,_currentScopes_js__WEBPACK_IMPORTED_MODULE_0__.getCurrentScope)();
  const client = (0,_currentScopes_js__WEBPACK_IMPORTED_MODULE_0__.getClient)();
  if (!client) {
    _debug_build_js__WEBPACK_IMPORTED_MODULE_2__.DEBUG_BUILD && _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_3__.logger.warn('Cannot capture check-in. No client defined.');
  } else if (!client.captureCheckIn) {
    _debug_build_js__WEBPACK_IMPORTED_MODULE_2__.DEBUG_BUILD && _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_3__.logger.warn('Cannot capture check-in. Client does not support sending check-ins.');
  } else {
    return client.captureCheckIn(checkIn, upsertMonitorConfig, scope);
  }
  return (0,_utils_hoist_misc_js__WEBPACK_IMPORTED_MODULE_4__.uuid4)();
}

/**
 * Wraps a callback with a cron monitor check in. The check in will be sent to Sentry when the callback finishes.
 *
 * @param monitorSlug The distinct slug of the monitor.
 * @param upsertMonitorConfig An optional object that describes a monitor config. Use this if you want
 * to create a monitor automatically when sending a check in.
 */
function withMonitor(monitorSlug, callback, upsertMonitorConfig) {
  const checkInId = captureCheckIn({
    monitorSlug,
    status: 'in_progress'
  }, upsertMonitorConfig);
  const now = (0,_utils_hoist_time_js__WEBPACK_IMPORTED_MODULE_5__.timestampInSeconds)();
  function finishCheckIn(status) {
    captureCheckIn({
      monitorSlug,
      status,
      checkInId,
      duration: (0,_utils_hoist_time_js__WEBPACK_IMPORTED_MODULE_5__.timestampInSeconds)() - now
    });
  }
  return (0,_currentScopes_js__WEBPACK_IMPORTED_MODULE_0__.withIsolationScope)(() => {
    let maybePromiseResult;
    try {
      maybePromiseResult = callback();
    } catch (e) {
      finishCheckIn('error');
      throw e;
    }
    if ((0,_utils_hoist_is_js__WEBPACK_IMPORTED_MODULE_6__.isThenable)(maybePromiseResult)) {
      Promise.resolve(maybePromiseResult).then(() => {
        finishCheckIn('ok');
      }, e => {
        finishCheckIn('error');
        throw e;
      });
    } else {
      finishCheckIn('ok');
    }
    return maybePromiseResult;
  });
}

/**
 * Call `flush()` on the current client, if there is one. See {@link Client.flush}.
 *
 * @param timeout Maximum time in ms the client should wait to flush its event queue. Omitting this parameter will cause
 * the client to wait until all events are sent before resolving the promise.
 * @returns A promise which resolves to `true` if the queue successfully drains before the timeout, or `false` if it
 * doesn't (or if there's no client defined).
 */
async function flush(timeout) {
  const client = (0,_currentScopes_js__WEBPACK_IMPORTED_MODULE_0__.getClient)();
  if (client) {
    return client.flush(timeout);
  }
  _debug_build_js__WEBPACK_IMPORTED_MODULE_2__.DEBUG_BUILD && _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_3__.logger.warn('Cannot flush events. No client defined.');
  return Promise.resolve(false);
}

/**
 * Call `close()` on the current client, if there is one. See {@link Client.close}.
 *
 * @param timeout Maximum time in ms the client should wait to flush its event queue before shutting down. Omitting this
 * parameter will cause the client to wait until all events are sent before disabling itself.
 * @returns A promise which resolves to `true` if the queue successfully drains before the timeout, or `false` if it
 * doesn't (or if there's no client defined).
 */
async function close(timeout) {
  const client = (0,_currentScopes_js__WEBPACK_IMPORTED_MODULE_0__.getClient)();
  if (client) {
    return client.close(timeout);
  }
  _debug_build_js__WEBPACK_IMPORTED_MODULE_2__.DEBUG_BUILD && _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_3__.logger.warn('Cannot flush events and disable SDK. No client defined.');
  return Promise.resolve(false);
}

/**
 * Returns true if Sentry has been properly initialized.
 */
function isInitialized() {
  return !!(0,_currentScopes_js__WEBPACK_IMPORTED_MODULE_0__.getClient)();
}

/** If the SDK is initialized & enabled. */
function isEnabled() {
  const client = (0,_currentScopes_js__WEBPACK_IMPORTED_MODULE_0__.getClient)();
  return client?.getOptions().enabled !== false && !!client?.getTransport();
}

/**
 * Add an event processor.
 * This will be added to the current isolation scope, ensuring any event that is processed in the current execution
 * context will have the processor applied.
 */
function addEventProcessor(callback) {
  (0,_currentScopes_js__WEBPACK_IMPORTED_MODULE_0__.getIsolationScope)().addEventProcessor(callback);
}

/**
 * Start a session on the current isolation scope.
 *
 * @param context (optional) additional properties to be applied to the returned session object
 *
 * @returns the new active session
 */
function startSession(context) {
  const isolationScope = (0,_currentScopes_js__WEBPACK_IMPORTED_MODULE_0__.getIsolationScope)();
  const currentScope = (0,_currentScopes_js__WEBPACK_IMPORTED_MODULE_0__.getCurrentScope)();

  // Will fetch userAgent if called from browser sdk
  const {
    userAgent
  } = _utils_hoist_worldwide_js__WEBPACK_IMPORTED_MODULE_7__.GLOBAL_OBJ.navigator || {};
  const session = (0,_session_js__WEBPACK_IMPORTED_MODULE_8__.makeSession)({
    user: currentScope.getUser() || isolationScope.getUser(),
    ...(userAgent && {
      userAgent
    }),
    ...context
  });

  // End existing session if there's one
  const currentSession = isolationScope.getSession();
  if (currentSession?.status === 'ok') {
    (0,_session_js__WEBPACK_IMPORTED_MODULE_8__.updateSession)(currentSession, {
      status: 'exited'
    });
  }
  endSession();

  // Afterwards we set the new session on the scope
  isolationScope.setSession(session);
  return session;
}

/**
 * End the session on the current isolation scope.
 */
function endSession() {
  const isolationScope = (0,_currentScopes_js__WEBPACK_IMPORTED_MODULE_0__.getIsolationScope)();
  const currentScope = (0,_currentScopes_js__WEBPACK_IMPORTED_MODULE_0__.getCurrentScope)();
  const session = currentScope.getSession() || isolationScope.getSession();
  if (session) {
    (0,_session_js__WEBPACK_IMPORTED_MODULE_8__.closeSession)(session);
  }
  _sendSessionUpdate();

  // the session is over; take it off of the scope
  isolationScope.setSession();
}

/**
 * Sends the current Session on the scope
 */
function _sendSessionUpdate() {
  const isolationScope = (0,_currentScopes_js__WEBPACK_IMPORTED_MODULE_0__.getIsolationScope)();
  const client = (0,_currentScopes_js__WEBPACK_IMPORTED_MODULE_0__.getClient)();
  const session = isolationScope.getSession();
  if (session && client) {
    client.captureSession(session);
  }
}

/**
 * Sends the current session on the scope to Sentry
 *
 * @param end If set the session will be marked as exited and removed from the scope.
 *            Defaults to `false`.
 */
function captureSession(end) {
  if (end === void 0) {
    end = false;
  }
  // both send the update and pull the session from the scope
  if (end) {
    endSession();
    return;
  }

  // only send the update
  _sendSessionUpdate();
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/integration.js":
/*!************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/integration.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addIntegration: () => (/* binding */ addIntegration),
/* harmony export */   afterSetupIntegrations: () => (/* binding */ afterSetupIntegrations),
/* harmony export */   defineIntegration: () => (/* binding */ defineIntegration),
/* harmony export */   getIntegrationsToSetup: () => (/* binding */ getIntegrationsToSetup),
/* harmony export */   installedIntegrations: () => (/* binding */ installedIntegrations),
/* harmony export */   setupIntegration: () => (/* binding */ setupIntegration),
/* harmony export */   setupIntegrations: () => (/* binding */ setupIntegrations)
/* harmony export */ });
/* harmony import */ var _currentScopes_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./currentScopes.js */ "./node_modules/@sentry/core/build/esm/currentScopes.js");
/* harmony import */ var _debug_build_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./debug-build.js */ "./node_modules/@sentry/core/build/esm/debug-build.js");
/* harmony import */ var _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils-hoist/logger.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/logger.js");



const installedIntegrations = [];

/** Map of integrations assigned to a client */

/**
 * Remove duplicates from the given array, preferring the last instance of any duplicate. Not guaranteed to
 * preserve the order of integrations in the array.
 *
 * @private
 */
function filterDuplicates(integrations) {
  const integrationsByName = {};
  integrations.forEach(currentInstance => {
    const {
      name
    } = currentInstance;
    const existingInstance = integrationsByName[name];

    // We want integrations later in the array to overwrite earlier ones of the same type, except that we never want a
    // default instance to overwrite an existing user instance
    if (existingInstance && !existingInstance.isDefaultInstance && currentInstance.isDefaultInstance) {
      return;
    }
    integrationsByName[name] = currentInstance;
  });
  return Object.values(integrationsByName);
}

/** Gets integrations to install */
function getIntegrationsToSetup(options) {
  const defaultIntegrations = options.defaultIntegrations || [];
  const userIntegrations = options.integrations;

  // We flag default instances, so that later we can tell them apart from any user-created instances of the same class
  defaultIntegrations.forEach(integration => {
    integration.isDefaultInstance = true;
  });
  let integrations;
  if (Array.isArray(userIntegrations)) {
    integrations = [...defaultIntegrations, ...userIntegrations];
  } else if (typeof userIntegrations === 'function') {
    const resolvedUserIntegrations = userIntegrations(defaultIntegrations);
    integrations = Array.isArray(resolvedUserIntegrations) ? resolvedUserIntegrations : [resolvedUserIntegrations];
  } else {
    integrations = defaultIntegrations;
  }
  return filterDuplicates(integrations);
}

/**
 * Given a list of integration instances this installs them all. When `withDefaults` is set to `true` then all default
 * integrations are added unless they were already provided before.
 * @param integrations array of integration instances
 * @param withDefault should enable default integrations
 */
function setupIntegrations(client, integrations) {
  const integrationIndex = {};
  integrations.forEach(integration => {
    // guard against empty provided integrations
    if (integration) {
      setupIntegration(client, integration, integrationIndex);
    }
  });
  return integrationIndex;
}

/**
 * Execute the `afterAllSetup` hooks of the given integrations.
 */
function afterSetupIntegrations(client, integrations) {
  for (const integration of integrations) {
    // guard against empty provided integrations
    if (integration?.afterAllSetup) {
      integration.afterAllSetup(client);
    }
  }
}

/** Setup a single integration.  */
function setupIntegration(client, integration, integrationIndex) {
  if (integrationIndex[integration.name]) {
    _debug_build_js__WEBPACK_IMPORTED_MODULE_0__.DEBUG_BUILD && _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_1__.logger.log(`Integration skipped because it was already installed: ${integration.name}`);
    return;
  }
  integrationIndex[integration.name] = integration;

  // `setupOnce` is only called the first time
  if (installedIntegrations.indexOf(integration.name) === -1 && typeof integration.setupOnce === 'function') {
    integration.setupOnce();
    installedIntegrations.push(integration.name);
  }

  // `setup` is run for each client
  if (integration.setup && typeof integration.setup === 'function') {
    integration.setup(client);
  }
  if (typeof integration.preprocessEvent === 'function') {
    const callback = integration.preprocessEvent.bind(integration);
    client.on('preprocessEvent', (event, hint) => callback(event, hint, client));
  }
  if (typeof integration.processEvent === 'function') {
    const callback = integration.processEvent.bind(integration);
    const processor = Object.assign((event, hint) => callback(event, hint, client), {
      id: integration.name
    });
    client.addEventProcessor(processor);
  }
  _debug_build_js__WEBPACK_IMPORTED_MODULE_0__.DEBUG_BUILD && _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_1__.logger.log(`Integration installed: ${integration.name}`);
}

/** Add an integration to the current scope's client. */
function addIntegration(integration) {
  const client = (0,_currentScopes_js__WEBPACK_IMPORTED_MODULE_2__.getClient)();
  if (!client) {
    _debug_build_js__WEBPACK_IMPORTED_MODULE_0__.DEBUG_BUILD && _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_1__.logger.warn(`Cannot add integration "${integration.name}" because no SDK Client is available.`);
    return;
  }
  client.addIntegration(integration);
}

/**
 * Define an integration function that can be used to create an integration instance.
 * Note that this by design hides the implementation details of the integration, as they are considered internal.
 */
function defineIntegration(fn) {
  return fn;
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/integrations/dedupe.js":
/*!********************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/integrations/dedupe.js ***!
  \********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   _shouldDropEvent: () => (/* binding */ _shouldDropEvent),
/* harmony export */   dedupeIntegration: () => (/* binding */ dedupeIntegration)
/* harmony export */ });
/* harmony import */ var _integration_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../integration.js */ "./node_modules/@sentry/core/build/esm/integration.js");
/* harmony import */ var _debug_build_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../debug-build.js */ "./node_modules/@sentry/core/build/esm/debug-build.js");
/* harmony import */ var _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils-hoist/logger.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/logger.js");
/* harmony import */ var _utils_hoist_stacktrace_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils-hoist/stacktrace.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/stacktrace.js");




const INTEGRATION_NAME = 'Dedupe';
const _dedupeIntegration = () => {
  let previousEvent;
  return {
    name: INTEGRATION_NAME,
    processEvent(currentEvent) {
      // We want to ignore any non-error type events, e.g. transactions or replays
      // These should never be deduped, and also not be compared against as _previousEvent.
      if (currentEvent.type) {
        return currentEvent;
      }

      // Juuust in case something goes wrong
      try {
        if (_shouldDropEvent(currentEvent, previousEvent)) {
          _debug_build_js__WEBPACK_IMPORTED_MODULE_0__.DEBUG_BUILD && _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_1__.logger.warn('Event dropped due to being a duplicate of previously captured event.');
          return null;
        }
      } catch (_oO) {} // eslint-disable-line no-empty

      return previousEvent = currentEvent;
    }
  };
};

/**
 * Deduplication filter.
 */
const dedupeIntegration = (0,_integration_js__WEBPACK_IMPORTED_MODULE_2__.defineIntegration)(_dedupeIntegration);

/** only exported for tests. */
function _shouldDropEvent(currentEvent, previousEvent) {
  if (!previousEvent) {
    return false;
  }
  if (_isSameMessageEvent(currentEvent, previousEvent)) {
    return true;
  }
  if (_isSameExceptionEvent(currentEvent, previousEvent)) {
    return true;
  }
  return false;
}
function _isSameMessageEvent(currentEvent, previousEvent) {
  const currentMessage = currentEvent.message;
  const previousMessage = previousEvent.message;

  // If neither event has a message property, they were both exceptions, so bail out
  if (!currentMessage && !previousMessage) {
    return false;
  }

  // If only one event has a stacktrace, but not the other one, they are not the same
  if (currentMessage && !previousMessage || !currentMessage && previousMessage) {
    return false;
  }
  if (currentMessage !== previousMessage) {
    return false;
  }
  if (!_isSameFingerprint(currentEvent, previousEvent)) {
    return false;
  }
  if (!_isSameStacktrace(currentEvent, previousEvent)) {
    return false;
  }
  return true;
}
function _isSameExceptionEvent(currentEvent, previousEvent) {
  const previousException = _getExceptionFromEvent(previousEvent);
  const currentException = _getExceptionFromEvent(currentEvent);
  if (!previousException || !currentException) {
    return false;
  }
  if (previousException.type !== currentException.type || previousException.value !== currentException.value) {
    return false;
  }
  if (!_isSameFingerprint(currentEvent, previousEvent)) {
    return false;
  }
  if (!_isSameStacktrace(currentEvent, previousEvent)) {
    return false;
  }
  return true;
}
function _isSameStacktrace(currentEvent, previousEvent) {
  let currentFrames = (0,_utils_hoist_stacktrace_js__WEBPACK_IMPORTED_MODULE_3__.getFramesFromEvent)(currentEvent);
  let previousFrames = (0,_utils_hoist_stacktrace_js__WEBPACK_IMPORTED_MODULE_3__.getFramesFromEvent)(previousEvent);

  // If neither event has a stacktrace, they are assumed to be the same
  if (!currentFrames && !previousFrames) {
    return true;
  }

  // If only one event has a stacktrace, but not the other one, they are not the same
  if (currentFrames && !previousFrames || !currentFrames && previousFrames) {
    return false;
  }
  currentFrames = currentFrames;
  previousFrames = previousFrames;

  // If number of frames differ, they are not the same
  if (previousFrames.length !== currentFrames.length) {
    return false;
  }

  // Otherwise, compare the two
  for (let i = 0; i < previousFrames.length; i++) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const frameA = previousFrames[i];
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const frameB = currentFrames[i];
    if (frameA.filename !== frameB.filename || frameA.lineno !== frameB.lineno || frameA.colno !== frameB.colno || frameA.function !== frameB.function) {
      return false;
    }
  }
  return true;
}
function _isSameFingerprint(currentEvent, previousEvent) {
  let currentFingerprint = currentEvent.fingerprint;
  let previousFingerprint = previousEvent.fingerprint;

  // If neither event has a fingerprint, they are assumed to be the same
  if (!currentFingerprint && !previousFingerprint) {
    return true;
  }

  // If only one event has a fingerprint, but not the other one, they are not the same
  if (currentFingerprint && !previousFingerprint || !currentFingerprint && previousFingerprint) {
    return false;
  }
  currentFingerprint = currentFingerprint;
  previousFingerprint = previousFingerprint;

  // Otherwise, compare the two
  try {
    return !!(currentFingerprint.join('') === previousFingerprint.join(''));
  } catch (_oO) {
    return false;
  }
}
function _getExceptionFromEvent(event) {
  return event.exception?.values && event.exception.values[0];
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/integrations/eventFilters.js":
/*!**************************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/integrations/eventFilters.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   eventFiltersIntegration: () => (/* binding */ eventFiltersIntegration),
/* harmony export */   inboundFiltersIntegration: () => (/* binding */ inboundFiltersIntegration)
/* harmony export */ });
/* harmony import */ var _debug_build_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../debug-build.js */ "./node_modules/@sentry/core/build/esm/debug-build.js");
/* harmony import */ var _integration_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../integration.js */ "./node_modules/@sentry/core/build/esm/integration.js");
/* harmony import */ var _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils-hoist/logger.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/logger.js");
/* harmony import */ var _utils_hoist_misc_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils-hoist/misc.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/misc.js");
/* harmony import */ var _utils_hoist_string_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils-hoist/string.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/string.js");
/* harmony import */ var _utils_eventUtils_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/eventUtils.js */ "./node_modules/@sentry/core/build/esm/utils/eventUtils.js");







// "Script error." is hard coded into browsers for errors that it can't read.
// this is the result of a script being pulled in from an external domain and CORS.
const DEFAULT_IGNORE_ERRORS = [/^Script error\.?$/, /^Javascript error: Script error\.? on line 0$/, /^ResizeObserver loop completed with undelivered notifications.$/,
// The browser logs this when a ResizeObserver handler takes a bit longer. Usually this is not an actual issue though. It indicates slowness.
/^Cannot redefine property: googletag$/,
// This is thrown when google tag manager is used in combination with an ad blocker
/^Can't find variable: gmo$/,
// Error from Google Search App https://issuetracker.google.com/issues/396043331
/^undefined is not an object \(evaluating 'a\.[A-Z]'\)$/,
// Random error that happens but not actionable or noticeable to end-users.
'can\'t redefine non-configurable property "solana"',
// Probably a browser extension or custom browser (Brave) throwing this error
"vv().getRestrictions is not a function. (In 'vv().getRestrictions(1,a)', 'vv().getRestrictions' is undefined)",
// Error thrown by GTM, seemingly not affecting end-users
"Can't find variable: _AutofillCallbackHandler",
// Unactionable error in instagram webview https://developers.facebook.com/community/threads/320013549791141/
/^Non-Error promise rejection captured with value: Object Not Found Matching Id:\d+, MethodName:simulateEvent, ParamCount:\d+$/,
// unactionable error from CEFSharp, a .NET library that embeds chromium in .NET apps
/^Java exception was raised during method invocation$/ // error from Facebook Mobile browser (https://github.com/getsentry/sentry-javascript/issues/15065)
];

/** Options for the EventFilters integration */

const INTEGRATION_NAME = 'EventFilters';
const _eventFiltersIntegration = function (options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: INTEGRATION_NAME,
    processEvent(event, _hint, client) {
      const clientOptions = client.getOptions();
      const mergedOptions = _mergeOptions(options, clientOptions);
      return _shouldDropEvent(event, mergedOptions) ? null : event;
    }
  };
};

/**
 * An integration that filters out events (errors and transactions) based on:
 *
 * - (Errors) A curated list of known low-value or irrelevant errors (see {@link DEFAULT_IGNORE_ERRORS})
 * - (Errors) A list of error messages or urls/filenames passed in via
 *   - Top level Sentry.init options (`ignoreErrors`, `denyUrls`, `allowUrls`)
 *   - The same options passed to the integration directly via @param options
 * - (Transactions/Spans) A list of root span (transaction) names passed in via
 *   - Top level Sentry.init option (`ignoreTransactions`)
 *   - The same option passed to the integration directly via @param options
 *
 * Events filtered by this integration will not be sent to Sentry.
 */
const eventFiltersIntegration = (0,_integration_js__WEBPACK_IMPORTED_MODULE_0__.defineIntegration)(_eventFiltersIntegration);

/**
 * An integration that filters out events (errors and transactions) based on:
 *
 * - (Errors) A curated list of known low-value or irrelevant errors (see {@link DEFAULT_IGNORE_ERRORS})
 * - (Errors) A list of error messages or urls/filenames passed in via
 *   - Top level Sentry.init options (`ignoreErrors`, `denyUrls`, `allowUrls`)
 *   - The same options passed to the integration directly via @param options
 * - (Transactions/Spans) A list of root span (transaction) names passed in via
 *   - Top level Sentry.init option (`ignoreTransactions`)
 *   - The same option passed to the integration directly via @param options
 *
 * Events filtered by this integration will not be sent to Sentry.
 *
 * @deprecated this integration was renamed and will be removed in a future major version.
 * Use `eventFiltersIntegration` instead.
 */
const inboundFiltersIntegration = (0,_integration_js__WEBPACK_IMPORTED_MODULE_0__.defineIntegration)(function (options) {
  if (options === void 0) {
    options = {};
  }
  return {
    ...eventFiltersIntegration(options),
    name: 'InboundFilters'
  };
});
function _mergeOptions(internalOptions, clientOptions) {
  if (internalOptions === void 0) {
    internalOptions = {};
  }
  if (clientOptions === void 0) {
    clientOptions = {};
  }
  return {
    allowUrls: [...(internalOptions.allowUrls || []), ...(clientOptions.allowUrls || [])],
    denyUrls: [...(internalOptions.denyUrls || []), ...(clientOptions.denyUrls || [])],
    ignoreErrors: [...(internalOptions.ignoreErrors || []), ...(clientOptions.ignoreErrors || []), ...(internalOptions.disableErrorDefaults ? [] : DEFAULT_IGNORE_ERRORS)],
    ignoreTransactions: [...(internalOptions.ignoreTransactions || []), ...(clientOptions.ignoreTransactions || [])],
    ignoreInternal: internalOptions.ignoreInternal !== undefined ? internalOptions.ignoreInternal : true
  };
}
function _shouldDropEvent(event, options) {
  if (options.ignoreInternal && _isSentryError(event)) {
    _debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD && _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_2__.logger.warn(`Event dropped due to being internal Sentry Error.\nEvent: ${(0,_utils_hoist_misc_js__WEBPACK_IMPORTED_MODULE_3__.getEventDescription)(event)}`);
    return true;
  }
  if (_isIgnoredError(event, options.ignoreErrors)) {
    _debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD && _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_2__.logger.warn(`Event dropped due to being matched by \`ignoreErrors\` option.\nEvent: ${(0,_utils_hoist_misc_js__WEBPACK_IMPORTED_MODULE_3__.getEventDescription)(event)}`);
    return true;
  }
  if (_isUselessError(event)) {
    _debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD && _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_2__.logger.warn(`Event dropped due to not having an error message, error type or stacktrace.\nEvent: ${(0,_utils_hoist_misc_js__WEBPACK_IMPORTED_MODULE_3__.getEventDescription)(event)}`);
    return true;
  }
  if (_isIgnoredTransaction(event, options.ignoreTransactions)) {
    _debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD && _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_2__.logger.warn(`Event dropped due to being matched by \`ignoreTransactions\` option.\nEvent: ${(0,_utils_hoist_misc_js__WEBPACK_IMPORTED_MODULE_3__.getEventDescription)(event)}`);
    return true;
  }
  if (_isDeniedUrl(event, options.denyUrls)) {
    _debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD && _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_2__.logger.warn(`Event dropped due to being matched by \`denyUrls\` option.\nEvent: ${(0,_utils_hoist_misc_js__WEBPACK_IMPORTED_MODULE_3__.getEventDescription)(event)}.\nUrl: ${_getEventFilterUrl(event)}`);
    return true;
  }
  if (!_isAllowedUrl(event, options.allowUrls)) {
    _debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD && _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_2__.logger.warn(`Event dropped due to not being matched by \`allowUrls\` option.\nEvent: ${(0,_utils_hoist_misc_js__WEBPACK_IMPORTED_MODULE_3__.getEventDescription)(event)}.\nUrl: ${_getEventFilterUrl(event)}`);
    return true;
  }
  return false;
}
function _isIgnoredError(event, ignoreErrors) {
  // If event.type, this is not an error
  if (event.type || !ignoreErrors || !ignoreErrors.length) {
    return false;
  }
  return (0,_utils_eventUtils_js__WEBPACK_IMPORTED_MODULE_4__.getPossibleEventMessages)(event).some(message => (0,_utils_hoist_string_js__WEBPACK_IMPORTED_MODULE_5__.stringMatchesSomePattern)(message, ignoreErrors));
}
function _isIgnoredTransaction(event, ignoreTransactions) {
  if (event.type !== 'transaction' || !ignoreTransactions || !ignoreTransactions.length) {
    return false;
  }
  const name = event.transaction;
  return name ? (0,_utils_hoist_string_js__WEBPACK_IMPORTED_MODULE_5__.stringMatchesSomePattern)(name, ignoreTransactions) : false;
}
function _isDeniedUrl(event, denyUrls) {
  if (!denyUrls?.length) {
    return false;
  }
  const url = _getEventFilterUrl(event);
  return !url ? false : (0,_utils_hoist_string_js__WEBPACK_IMPORTED_MODULE_5__.stringMatchesSomePattern)(url, denyUrls);
}
function _isAllowedUrl(event, allowUrls) {
  if (!allowUrls?.length) {
    return true;
  }
  const url = _getEventFilterUrl(event);
  return !url ? true : (0,_utils_hoist_string_js__WEBPACK_IMPORTED_MODULE_5__.stringMatchesSomePattern)(url, allowUrls);
}
function _isSentryError(event) {
  try {
    // @ts-expect-error can't be a sentry error if undefined
    return event.exception.values[0].type === 'SentryError';
  } catch (e) {
    // ignore
  }
  return false;
}
function _getLastValidUrl(frames) {
  if (frames === void 0) {
    frames = [];
  }
  for (let i = frames.length - 1; i >= 0; i--) {
    const frame = frames[i];
    if (frame && frame.filename !== '<anonymous>' && frame.filename !== '[native code]') {
      return frame.filename || null;
    }
  }
  return null;
}
function _getEventFilterUrl(event) {
  try {
    // If there are linked exceptions or exception aggregates we only want to match against the top frame of the "root" (the main exception)
    // The root always comes last in linked exceptions
    const rootException = [...(event.exception?.values ?? [])].reverse().find(value => value.mechanism?.parent_id === undefined && value.stacktrace?.frames?.length);
    const frames = rootException?.stacktrace?.frames;
    return frames ? _getLastValidUrl(frames) : null;
  } catch (oO) {
    _debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD && _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_2__.logger.error(`Cannot extract url for event ${(0,_utils_hoist_misc_js__WEBPACK_IMPORTED_MODULE_3__.getEventDescription)(event)}`);
    return null;
  }
}
function _isUselessError(event) {
  if (event.type) {
    // event is not an error
    return false;
  }

  // We only want to consider events for dropping that actually have recorded exception values.
  if (!event.exception?.values?.length) {
    return false;
  }
  return (
    // No top-level message
    !event.message &&
    // There are no exception values that have a stacktrace, a non-generic-Error type or value
    !event.exception.values.some(value => value.stacktrace || value.type && value.type !== 'Error' || value.value)
  );
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/integrations/functiontostring.js":
/*!******************************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/integrations/functiontostring.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   functionToStringIntegration: () => (/* binding */ functionToStringIntegration)
/* harmony export */ });
/* harmony import */ var _currentScopes_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../currentScopes.js */ "./node_modules/@sentry/core/build/esm/currentScopes.js");
/* harmony import */ var _integration_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../integration.js */ "./node_modules/@sentry/core/build/esm/integration.js");
/* harmony import */ var _utils_hoist_object_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils-hoist/object.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/object.js");



let originalFunctionToString;
const INTEGRATION_NAME = 'FunctionToString';
const SETUP_CLIENTS = new WeakMap();
const _functionToStringIntegration = () => {
  return {
    name: INTEGRATION_NAME,
    setupOnce() {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      originalFunctionToString = Function.prototype.toString;

      // intrinsics (like Function.prototype) might be immutable in some environments
      // e.g. Node with --frozen-intrinsics, XS (an embedded JavaScript engine) or SES (a JavaScript proposal)
      try {
        Function.prototype.toString = function () {
          const originalFunction = (0,_utils_hoist_object_js__WEBPACK_IMPORTED_MODULE_0__.getOriginalFunction)(this);
          const context = SETUP_CLIENTS.has((0,_currentScopes_js__WEBPACK_IMPORTED_MODULE_1__.getClient)()) && originalFunction !== undefined ? originalFunction : this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          return originalFunctionToString.apply(context, args);
        };
      } catch {
        // ignore errors here, just don't patch this
      }
    },
    setup(client) {
      SETUP_CLIENTS.set(client, true);
    }
  };
};

/**
 * Patch toString calls to return proper name for wrapped functions.
 *
 * ```js
 * Sentry.init({
 *   integrations: [
 *     functionToStringIntegration(),
 *   ],
 * });
 * ```
 */
const functionToStringIntegration = (0,_integration_js__WEBPACK_IMPORTED_MODULE_2__.defineIntegration)(_functionToStringIntegration);


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/scope.js":
/*!******************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/scope.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Scope: () => (/* binding */ Scope)
/* harmony export */ });
/* harmony import */ var _session_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./session.js */ "./node_modules/@sentry/core/build/esm/session.js");
/* harmony import */ var _utils_hoist_is_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utils-hoist/is.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/is.js");
/* harmony import */ var _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./utils-hoist/logger.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/logger.js");
/* harmony import */ var _utils_hoist_misc_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./utils-hoist/misc.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/misc.js");
/* harmony import */ var _utils_hoist_propagationContext_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils-hoist/propagationContext.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/propagationContext.js");
/* harmony import */ var _utils_hoist_time_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./utils-hoist/time.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/time.js");
/* harmony import */ var _utils_merge_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./utils/merge.js */ "./node_modules/@sentry/core/build/esm/utils/merge.js");
/* harmony import */ var _utils_spanOnScope_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils/spanOnScope.js */ "./node_modules/@sentry/core/build/esm/utils/spanOnScope.js");









/**
 * Default value for maximum number of breadcrumbs added to an event.
 */
const DEFAULT_MAX_BREADCRUMBS = 100;

/**
 * A context to be used for capturing an event.
 * This can either be a Scope, or a partial ScopeContext,
 * or a callback that receives the current scope and returns a new scope to use.
 */

/**
 * Holds additional event information.
 */
class Scope {
  /** Flag if notifying is happening. */

  /** Callback for client to receive scope changes. */

  /** Callback list that will be called during event processing. */

  /** Array of breadcrumbs. */

  /** User */

  /** Tags */

  /** Extra */

  /** Contexts */

  /** Attachments */

  /** Propagation Context for distributed tracing */

  /**
   * A place to stash data which is needed at some point in the SDK's event processing pipeline but which shouldn't get
   * sent to Sentry
   */

  /** Fingerprint */

  /** Severity */

  /**
   * Transaction Name
   *
   * IMPORTANT: The transaction name on the scope has nothing to do with root spans/transaction objects.
   * It's purpose is to assign a transaction to the scope that's added to non-transaction events.
   */

  /** Session */

  /** The client on this scope */

  /** Contains the last event id of a captured event.  */

  // NOTE: Any field which gets added here should get added not only to the constructor but also to the `clone` method.

  constructor() {
    this._notifyingListeners = false;
    this._scopeListeners = [];
    this._eventProcessors = [];
    this._breadcrumbs = [];
    this._attachments = [];
    this._user = {};
    this._tags = {};
    this._extra = {};
    this._contexts = {};
    this._sdkProcessingMetadata = {};
    this._propagationContext = {
      traceId: (0,_utils_hoist_propagationContext_js__WEBPACK_IMPORTED_MODULE_0__.generateTraceId)(),
      sampleRand: Math.random()
    };
  }

  /**
   * Clone all data from this scope into a new scope.
   */
  clone() {
    const newScope = new Scope();
    newScope._breadcrumbs = [...this._breadcrumbs];
    newScope._tags = {
      ...this._tags
    };
    newScope._extra = {
      ...this._extra
    };
    newScope._contexts = {
      ...this._contexts
    };
    if (this._contexts.flags) {
      // We need to copy the `values` array so insertions on a cloned scope
      // won't affect the original array.
      newScope._contexts.flags = {
        values: [...this._contexts.flags.values]
      };
    }
    newScope._user = this._user;
    newScope._level = this._level;
    newScope._session = this._session;
    newScope._transactionName = this._transactionName;
    newScope._fingerprint = this._fingerprint;
    newScope._eventProcessors = [...this._eventProcessors];
    newScope._attachments = [...this._attachments];
    newScope._sdkProcessingMetadata = {
      ...this._sdkProcessingMetadata
    };
    newScope._propagationContext = {
      ...this._propagationContext
    };
    newScope._client = this._client;
    newScope._lastEventId = this._lastEventId;
    (0,_utils_spanOnScope_js__WEBPACK_IMPORTED_MODULE_1__._setSpanForScope)(newScope, (0,_utils_spanOnScope_js__WEBPACK_IMPORTED_MODULE_1__._getSpanForScope)(this));
    return newScope;
  }

  /**
   * Update the client assigned to this scope.
   * Note that not every scope will have a client assigned - isolation scopes & the global scope will generally not have a client,
   * as well as manually created scopes.
   */
  setClient(client) {
    this._client = client;
  }

  /**
   * Set the ID of the last captured error event.
   * This is generally only captured on the isolation scope.
   */
  setLastEventId(lastEventId) {
    this._lastEventId = lastEventId;
  }

  /**
   * Get the client assigned to this scope.
   */
  getClient() {
    return this._client;
  }

  /**
   * Get the ID of the last captured error event.
   * This is generally only available on the isolation scope.
   */
  lastEventId() {
    return this._lastEventId;
  }

  /**
   * @inheritDoc
   */
  addScopeListener(callback) {
    this._scopeListeners.push(callback);
  }

  /**
   * Add an event processor that will be called before an event is sent.
   */
  addEventProcessor(callback) {
    this._eventProcessors.push(callback);
    return this;
  }

  /**
   * Set the user for this scope.
   * Set to `null` to unset the user.
   */
  setUser(user) {
    // If null is passed we want to unset everything, but still define keys,
    // so that later down in the pipeline any existing values are cleared.
    this._user = user || {
      email: undefined,
      id: undefined,
      ip_address: undefined,
      username: undefined
    };
    if (this._session) {
      (0,_session_js__WEBPACK_IMPORTED_MODULE_2__.updateSession)(this._session, {
        user
      });
    }
    this._notifyScopeListeners();
    return this;
  }

  /**
   * Get the user from this scope.
   */
  getUser() {
    return this._user;
  }

  /**
   * Set an object that will be merged into existing tags on the scope,
   * and will be sent as tags data with the event.
   */
  setTags(tags) {
    this._tags = {
      ...this._tags,
      ...tags
    };
    this._notifyScopeListeners();
    return this;
  }

  /**
   * Set a single tag that will be sent as tags data with the event.
   */
  setTag(key, value) {
    this._tags = {
      ...this._tags,
      [key]: value
    };
    this._notifyScopeListeners();
    return this;
  }

  /**
   * Set an object that will be merged into existing extra on the scope,
   * and will be sent as extra data with the event.
   */
  setExtras(extras) {
    this._extra = {
      ...this._extra,
      ...extras
    };
    this._notifyScopeListeners();
    return this;
  }

  /**
   * Set a single key:value extra entry that will be sent as extra data with the event.
   */
  setExtra(key, extra) {
    this._extra = {
      ...this._extra,
      [key]: extra
    };
    this._notifyScopeListeners();
    return this;
  }

  /**
   * Sets the fingerprint on the scope to send with the events.
   * @param {string[]} fingerprint Fingerprint to group events in Sentry.
   */
  setFingerprint(fingerprint) {
    this._fingerprint = fingerprint;
    this._notifyScopeListeners();
    return this;
  }

  /**
   * Sets the level on the scope for future events.
   */
  setLevel(level) {
    this._level = level;
    this._notifyScopeListeners();
    return this;
  }

  /**
   * Sets the transaction name on the scope so that the name of e.g. taken server route or
   * the page location is attached to future events.
   *
   * IMPORTANT: Calling this function does NOT change the name of the currently active
   * root span. If you want to change the name of the active root span, use
   * `Sentry.updateSpanName(rootSpan, 'new name')` instead.
   *
   * By default, the SDK updates the scope's transaction name automatically on sensible
   * occasions, such as a page navigation or when handling a new request on the server.
   */
  setTransactionName(name) {
    this._transactionName = name;
    this._notifyScopeListeners();
    return this;
  }

  /**
   * Sets context data with the given name.
   * Data passed as context will be normalized. You can also pass `null` to unset the context.
   * Note that context data will not be merged - calling `setContext` will overwrite an existing context with the same key.
   */
  setContext(key, context) {
    if (context === null) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete this._contexts[key];
    } else {
      this._contexts[key] = context;
    }
    this._notifyScopeListeners();
    return this;
  }

  /**
   * Set the session for the scope.
   */
  setSession(session) {
    if (!session) {
      delete this._session;
    } else {
      this._session = session;
    }
    this._notifyScopeListeners();
    return this;
  }

  /**
   * Get the session from the scope.
   */
  getSession() {
    return this._session;
  }

  /**
   * Updates the scope with provided data. Can work in three variations:
   * - plain object containing updatable attributes
   * - Scope instance that'll extract the attributes from
   * - callback function that'll receive the current scope as an argument and allow for modifications
   */
  update(captureContext) {
    if (!captureContext) {
      return this;
    }
    const scopeToMerge = typeof captureContext === 'function' ? captureContext(this) : captureContext;
    const scopeInstance = scopeToMerge instanceof Scope ? scopeToMerge.getScopeData() : (0,_utils_hoist_is_js__WEBPACK_IMPORTED_MODULE_3__.isPlainObject)(scopeToMerge) ? captureContext : undefined;
    const {
      tags,
      extra,
      user,
      contexts,
      level,
      fingerprint = [],
      propagationContext
    } = scopeInstance || {};
    this._tags = {
      ...this._tags,
      ...tags
    };
    this._extra = {
      ...this._extra,
      ...extra
    };
    this._contexts = {
      ...this._contexts,
      ...contexts
    };
    if (user && Object.keys(user).length) {
      this._user = user;
    }
    if (level) {
      this._level = level;
    }
    if (fingerprint.length) {
      this._fingerprint = fingerprint;
    }
    if (propagationContext) {
      this._propagationContext = propagationContext;
    }
    return this;
  }

  /**
   * Clears the current scope and resets its properties.
   * Note: The client will not be cleared.
   */
  clear() {
    // client is not cleared here on purpose!
    this._breadcrumbs = [];
    this._tags = {};
    this._extra = {};
    this._user = {};
    this._contexts = {};
    this._level = undefined;
    this._transactionName = undefined;
    this._fingerprint = undefined;
    this._session = undefined;
    (0,_utils_spanOnScope_js__WEBPACK_IMPORTED_MODULE_1__._setSpanForScope)(this, undefined);
    this._attachments = [];
    this.setPropagationContext({
      traceId: (0,_utils_hoist_propagationContext_js__WEBPACK_IMPORTED_MODULE_0__.generateTraceId)(),
      sampleRand: Math.random()
    });
    this._notifyScopeListeners();
    return this;
  }

  /**
   * Adds a breadcrumb to the scope.
   * By default, the last 100 breadcrumbs are kept.
   */
  addBreadcrumb(breadcrumb, maxBreadcrumbs) {
    const maxCrumbs = typeof maxBreadcrumbs === 'number' ? maxBreadcrumbs : DEFAULT_MAX_BREADCRUMBS;

    // No data has been changed, so don't notify scope listeners
    if (maxCrumbs <= 0) {
      return this;
    }
    const mergedBreadcrumb = {
      timestamp: (0,_utils_hoist_time_js__WEBPACK_IMPORTED_MODULE_4__.dateTimestampInSeconds)(),
      ...breadcrumb
    };
    this._breadcrumbs.push(mergedBreadcrumb);
    if (this._breadcrumbs.length > maxCrumbs) {
      this._breadcrumbs = this._breadcrumbs.slice(-maxCrumbs);
      this._client?.recordDroppedEvent('buffer_overflow', 'log_item');
    }
    this._notifyScopeListeners();
    return this;
  }

  /**
   * Get the last breadcrumb of the scope.
   */
  getLastBreadcrumb() {
    return this._breadcrumbs[this._breadcrumbs.length - 1];
  }

  /**
   * Clear all breadcrumbs from the scope.
   */
  clearBreadcrumbs() {
    this._breadcrumbs = [];
    this._notifyScopeListeners();
    return this;
  }

  /**
   * Add an attachment to the scope.
   */
  addAttachment(attachment) {
    this._attachments.push(attachment);
    return this;
  }

  /**
   * Clear all attachments from the scope.
   */
  clearAttachments() {
    this._attachments = [];
    return this;
  }

  /**
   * Get the data of this scope, which should be applied to an event during processing.
   */
  getScopeData() {
    return {
      breadcrumbs: this._breadcrumbs,
      attachments: this._attachments,
      contexts: this._contexts,
      tags: this._tags,
      extra: this._extra,
      user: this._user,
      level: this._level,
      fingerprint: this._fingerprint || [],
      eventProcessors: this._eventProcessors,
      propagationContext: this._propagationContext,
      sdkProcessingMetadata: this._sdkProcessingMetadata,
      transactionName: this._transactionName,
      span: (0,_utils_spanOnScope_js__WEBPACK_IMPORTED_MODULE_1__._getSpanForScope)(this)
    };
  }

  /**
   * Add data which will be accessible during event processing but won't get sent to Sentry.
   */
  setSDKProcessingMetadata(newData) {
    this._sdkProcessingMetadata = (0,_utils_merge_js__WEBPACK_IMPORTED_MODULE_5__.merge)(this._sdkProcessingMetadata, newData, 2);
    return this;
  }

  /**
   * Add propagation context to the scope, used for distributed tracing
   */
  setPropagationContext(context) {
    this._propagationContext = context;
    return this;
  }

  /**
   * Get propagation context from the scope, used for distributed tracing
   */
  getPropagationContext() {
    return this._propagationContext;
  }

  /**
   * Capture an exception for this scope.
   *
   * @returns {string} The id of the captured Sentry event.
   */
  captureException(exception, hint) {
    const eventId = hint?.event_id || (0,_utils_hoist_misc_js__WEBPACK_IMPORTED_MODULE_6__.uuid4)();
    if (!this._client) {
      _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_7__.logger.warn('No client configured on scope - will not capture exception!');
      return eventId;
    }
    const syntheticException = new Error('Sentry syntheticException');
    this._client.captureException(exception, {
      originalException: exception,
      syntheticException,
      ...hint,
      event_id: eventId
    }, this);
    return eventId;
  }

  /**
   * Capture a message for this scope.
   *
   * @returns {string} The id of the captured message.
   */
  captureMessage(message, level, hint) {
    const eventId = hint?.event_id || (0,_utils_hoist_misc_js__WEBPACK_IMPORTED_MODULE_6__.uuid4)();
    if (!this._client) {
      _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_7__.logger.warn('No client configured on scope - will not capture message!');
      return eventId;
    }
    const syntheticException = new Error(message);
    this._client.captureMessage(message, level, {
      originalException: message,
      syntheticException,
      ...hint,
      event_id: eventId
    }, this);
    return eventId;
  }

  /**
   * Capture a Sentry event for this scope.
   *
   * @returns {string} The id of the captured event.
   */
  captureEvent(event, hint) {
    const eventId = hint?.event_id || (0,_utils_hoist_misc_js__WEBPACK_IMPORTED_MODULE_6__.uuid4)();
    if (!this._client) {
      _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_7__.logger.warn('No client configured on scope - will not capture event!');
      return eventId;
    }
    this._client.captureEvent(event, {
      ...hint,
      event_id: eventId
    }, this);
    return eventId;
  }

  /**
   * This will be called on every set call.
   */
  _notifyScopeListeners() {
    // We need this check for this._notifyingListeners to be able to work on scope during updates
    // If this check is not here we'll produce endless recursion when something is done with the scope
    // during the callback.
    if (!this._notifyingListeners) {
      this._notifyingListeners = true;
      this._scopeListeners.forEach(callback => {
        callback(this);
      });
      this._notifyingListeners = false;
    }
  }
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/sdk.js":
/*!****************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/sdk.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initAndBind: () => (/* binding */ initAndBind),
/* harmony export */   setCurrentClient: () => (/* binding */ setCurrentClient)
/* harmony export */ });
/* harmony import */ var _currentScopes_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./currentScopes.js */ "./node_modules/@sentry/core/build/esm/currentScopes.js");
/* harmony import */ var _debug_build_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./debug-build.js */ "./node_modules/@sentry/core/build/esm/debug-build.js");
/* harmony import */ var _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils-hoist/logger.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/logger.js");




/** A class object that can instantiate Client objects. */

/**
 * Internal function to create a new SDK client instance. The client is
 * installed and then bound to the current scope.
 *
 * @param clientClass The client class to instantiate.
 * @param options Options to pass to the client.
 */
function initAndBind(clientClass, options) {
  if (options.debug === true) {
    if (_debug_build_js__WEBPACK_IMPORTED_MODULE_0__.DEBUG_BUILD) {
      _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_1__.logger.enable();
    } else {
      // use `console.warn` rather than `logger.warn` since by non-debug bundles have all `logger.x` statements stripped
      (0,_utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_1__.consoleSandbox)(() => {
        // eslint-disable-next-line no-console
        console.warn('[Sentry] Cannot initialize SDK with `debug` option using a non-debug bundle.');
      });
    }
  }
  const scope = (0,_currentScopes_js__WEBPACK_IMPORTED_MODULE_2__.getCurrentScope)();
  scope.update(options.initialScope);
  const client = new clientClass(options);
  setCurrentClient(client);
  client.init();
  return client;
}

/**
 * Make the given client the current client.
 */
function setCurrentClient(client) {
  (0,_currentScopes_js__WEBPACK_IMPORTED_MODULE_2__.getCurrentScope)().setClient(client);
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/semanticAttributes.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/semanticAttributes.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SEMANTIC_ATTRIBUTE_CACHE_HIT: () => (/* binding */ SEMANTIC_ATTRIBUTE_CACHE_HIT),
/* harmony export */   SEMANTIC_ATTRIBUTE_CACHE_ITEM_SIZE: () => (/* binding */ SEMANTIC_ATTRIBUTE_CACHE_ITEM_SIZE),
/* harmony export */   SEMANTIC_ATTRIBUTE_CACHE_KEY: () => (/* binding */ SEMANTIC_ATTRIBUTE_CACHE_KEY),
/* harmony export */   SEMANTIC_ATTRIBUTE_EXCLUSIVE_TIME: () => (/* binding */ SEMANTIC_ATTRIBUTE_EXCLUSIVE_TIME),
/* harmony export */   SEMANTIC_ATTRIBUTE_HTTP_REQUEST_METHOD: () => (/* binding */ SEMANTIC_ATTRIBUTE_HTTP_REQUEST_METHOD),
/* harmony export */   SEMANTIC_ATTRIBUTE_PROFILE_ID: () => (/* binding */ SEMANTIC_ATTRIBUTE_PROFILE_ID),
/* harmony export */   SEMANTIC_ATTRIBUTE_SENTRY_CUSTOM_SPAN_NAME: () => (/* binding */ SEMANTIC_ATTRIBUTE_SENTRY_CUSTOM_SPAN_NAME),
/* harmony export */   SEMANTIC_ATTRIBUTE_SENTRY_IDLE_SPAN_FINISH_REASON: () => (/* binding */ SEMANTIC_ATTRIBUTE_SENTRY_IDLE_SPAN_FINISH_REASON),
/* harmony export */   SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_UNIT: () => (/* binding */ SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_UNIT),
/* harmony export */   SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_VALUE: () => (/* binding */ SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_VALUE),
/* harmony export */   SEMANTIC_ATTRIBUTE_SENTRY_OP: () => (/* binding */ SEMANTIC_ATTRIBUTE_SENTRY_OP),
/* harmony export */   SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN: () => (/* binding */ SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN),
/* harmony export */   SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE: () => (/* binding */ SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE),
/* harmony export */   SEMANTIC_ATTRIBUTE_SENTRY_SOURCE: () => (/* binding */ SEMANTIC_ATTRIBUTE_SENTRY_SOURCE),
/* harmony export */   SEMANTIC_ATTRIBUTE_URL_FULL: () => (/* binding */ SEMANTIC_ATTRIBUTE_URL_FULL)
/* harmony export */ });
/**
 * Use this attribute to represent the source of a span.
 * Should be one of: custom, url, route, view, component, task, unknown
 *
 */
const SEMANTIC_ATTRIBUTE_SENTRY_SOURCE = 'sentry.source';

/**
 * Attributes that holds the sample rate that was locally applied to a span.
 * If this attribute is not defined, it means that the span inherited a sampling decision.
 *
 * NOTE: Is only defined on root spans.
 */
const SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE = 'sentry.sample_rate';

/**
 * Use this attribute to represent the operation of a span.
 */
const SEMANTIC_ATTRIBUTE_SENTRY_OP = 'sentry.op';

/**
 * Use this attribute to represent the origin of a span.
 */
const SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN = 'sentry.origin';

/** The reason why an idle span finished. */
const SEMANTIC_ATTRIBUTE_SENTRY_IDLE_SPAN_FINISH_REASON = 'sentry.idle_span_finish_reason';

/** The unit of a measurement, which may be stored as a TimedEvent. */
const SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_UNIT = 'sentry.measurement_unit';

/** The value of a measurement, which may be stored as a TimedEvent. */
const SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_VALUE = 'sentry.measurement_value';

/**
 * A custom span name set by users guaranteed to be taken over any automatically
 * inferred name. This attribute is removed before the span is sent.
 *
 * @internal only meant for internal SDK usage
 * @hidden
 */
const SEMANTIC_ATTRIBUTE_SENTRY_CUSTOM_SPAN_NAME = 'sentry.custom_span_name';

/**
 * The id of the profile that this span occurred in.
 */
const SEMANTIC_ATTRIBUTE_PROFILE_ID = 'sentry.profile_id';
const SEMANTIC_ATTRIBUTE_EXCLUSIVE_TIME = 'sentry.exclusive_time';
const SEMANTIC_ATTRIBUTE_CACHE_HIT = 'cache.hit';
const SEMANTIC_ATTRIBUTE_CACHE_KEY = 'cache.key';
const SEMANTIC_ATTRIBUTE_CACHE_ITEM_SIZE = 'cache.item_size';

/** TODO: Remove these once we update to latest semantic conventions */
const SEMANTIC_ATTRIBUTE_HTTP_REQUEST_METHOD = 'http.request.method';
const SEMANTIC_ATTRIBUTE_URL_FULL = 'url.full';


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/session.js":
/*!********************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/session.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   closeSession: () => (/* binding */ closeSession),
/* harmony export */   makeSession: () => (/* binding */ makeSession),
/* harmony export */   updateSession: () => (/* binding */ updateSession)
/* harmony export */ });
/* harmony import */ var _utils_hoist_object_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils-hoist/object.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/object.js");
/* harmony import */ var _utils_hoist_time_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils-hoist/time.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/time.js");
/* harmony import */ var _utils_hoist_misc_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils-hoist/misc.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/misc.js");







/**
 * Creates a new `Session` object by setting certain default parameters. If optional @param context
 * is passed, the passed properties are applied to the session object.
 *
 * @param context (optional) additional properties to be applied to the returned session object
 *
 * @returns a new `Session` object
 */
function makeSession(context) {
  // Both timestamp and started are in seconds since the UNIX epoch.
  const startingTime = (0,_utils_hoist_time_js__WEBPACK_IMPORTED_MODULE_0__.timestampInSeconds)();
  const session = {
    sid: (0,_utils_hoist_misc_js__WEBPACK_IMPORTED_MODULE_1__.uuid4)(),
    init: true,
    timestamp: startingTime,
    started: startingTime,
    duration: 0,
    status: 'ok',
    errors: 0,
    ignoreDuration: false,
    toJSON: () => sessionToJSON(session)
  };
  if (context) {
    updateSession(session, context);
  }
  return session;
}

/**
 * Updates a session object with the properties passed in the context.
 *
 * Note that this function mutates the passed object and returns void.
 * (Had to do this instead of returning a new and updated session because closing and sending a session
 * makes an update to the session after it was passed to the sending logic.
 * @see Client.captureSession )
 *
 * @param session the `Session` to update
 * @param context the `SessionContext` holding the properties that should be updated in @param session
 */
// eslint-disable-next-line complexity
function updateSession(session, context) {
  if (context === void 0) {
    context = {};
  }
  if (context.user) {
    if (!session.ipAddress && context.user.ip_address) {
      session.ipAddress = context.user.ip_address;
    }
    if (!session.did && !context.did) {
      session.did = context.user.id || context.user.email || context.user.username;
    }
  }
  session.timestamp = context.timestamp || (0,_utils_hoist_time_js__WEBPACK_IMPORTED_MODULE_0__.timestampInSeconds)();
  if (context.abnormal_mechanism) {
    session.abnormal_mechanism = context.abnormal_mechanism;
  }
  if (context.ignoreDuration) {
    session.ignoreDuration = context.ignoreDuration;
  }
  if (context.sid) {
    // Good enough uuid validation. — Kamil
    session.sid = context.sid.length === 32 ? context.sid : (0,_utils_hoist_misc_js__WEBPACK_IMPORTED_MODULE_1__.uuid4)();
  }
  if (context.init !== undefined) {
    session.init = context.init;
  }
  if (!session.did && context.did) {
    session.did = `${context.did}`;
  }
  if (typeof context.started === 'number') {
    session.started = context.started;
  }
  if (session.ignoreDuration) {
    session.duration = undefined;
  } else if (typeof context.duration === 'number') {
    session.duration = context.duration;
  } else {
    const duration = session.timestamp - session.started;
    session.duration = duration >= 0 ? duration : 0;
  }
  if (context.release) {
    session.release = context.release;
  }
  if (context.environment) {
    session.environment = context.environment;
  }
  if (!session.ipAddress && context.ipAddress) {
    session.ipAddress = context.ipAddress;
  }
  if (!session.userAgent && context.userAgent) {
    session.userAgent = context.userAgent;
  }
  if (typeof context.errors === 'number') {
    session.errors = context.errors;
  }
  if (context.status) {
    session.status = context.status;
  }
}

/**
 * Closes a session by setting its status and updating the session object with it.
 * Internally calls `updateSession` to update the passed session object.
 *
 * Note that this function mutates the passed session (@see updateSession for explanation).
 *
 * @param session the `Session` object to be closed
 * @param status the `SessionStatus` with which the session was closed. If you don't pass a status,
 *               this function will keep the previously set status, unless it was `'ok'` in which case
 *               it is changed to `'exited'`.
 */
function closeSession(session, status) {
  let context = {};
  if (status) {
    context = {
      status
    };
  } else if (session.status === 'ok') {
    context = {
      status: 'exited'
    };
  }
  updateSession(session, context);
}

/**
 * Serializes a passed session object to a JSON object with a slightly different structure.
 * This is necessary because the Sentry backend requires a slightly different schema of a session
 * than the one the JS SDKs use internally.
 *
 * @param session the session to be converted
 *
 * @returns a JSON object of the passed session
 */
function sessionToJSON(session) {
  return (0,_utils_hoist_object_js__WEBPACK_IMPORTED_MODULE_2__.dropUndefinedKeys)({
    sid: `${session.sid}`,
    init: session.init,
    // Make sure that sec is converted to ms for date constructor
    started: new Date(session.started * 1000).toISOString(),
    timestamp: new Date(session.timestamp * 1000).toISOString(),
    status: session.status,
    errors: session.errors,
    did: typeof session.did === 'number' || typeof session.did === 'string' ? `${session.did}` : undefined,
    duration: session.duration,
    abnormal_mechanism: session.abnormal_mechanism,
    attrs: {
      release: session.release,
      environment: session.environment,
      ip_address: session.ipAddress,
      user_agent: session.userAgent
    }
  });
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/tracing/dynamicSamplingContext.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/tracing/dynamicSamplingContext.js ***!
  \*******************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   freezeDscOnSpan: () => (/* binding */ freezeDscOnSpan),
/* harmony export */   getDynamicSamplingContextFromClient: () => (/* binding */ getDynamicSamplingContextFromClient),
/* harmony export */   getDynamicSamplingContextFromScope: () => (/* binding */ getDynamicSamplingContextFromScope),
/* harmony export */   getDynamicSamplingContextFromSpan: () => (/* binding */ getDynamicSamplingContextFromSpan),
/* harmony export */   spanToBaggageHeader: () => (/* binding */ spanToBaggageHeader)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants.js */ "./node_modules/@sentry/core/build/esm/constants.js");
/* harmony import */ var _currentScopes_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../currentScopes.js */ "./node_modules/@sentry/core/build/esm/currentScopes.js");
/* harmony import */ var _semanticAttributes_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../semanticAttributes.js */ "./node_modules/@sentry/core/build/esm/semanticAttributes.js");
/* harmony import */ var _utils_hoist_baggage_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils-hoist/baggage.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/baggage.js");
/* harmony import */ var _utils_hoist_object_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils-hoist/object.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/object.js");
/* harmony import */ var _utils_hasSpansEnabled_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../utils/hasSpansEnabled.js */ "./node_modules/@sentry/core/build/esm/utils/hasSpansEnabled.js");
/* harmony import */ var _utils_spanUtils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/spanUtils.js */ "./node_modules/@sentry/core/build/esm/utils/spanUtils.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./utils.js */ "./node_modules/@sentry/core/build/esm/tracing/utils.js");









/**
 * If you change this value, also update the terser plugin config to
 * avoid minification of the object property!
 */
const FROZEN_DSC_FIELD = '_frozenDsc';

/**
 * Freeze the given DSC on the given span.
 */
function freezeDscOnSpan(span, dsc) {
  const spanWithMaybeDsc = span;
  (0,_utils_hoist_object_js__WEBPACK_IMPORTED_MODULE_0__.addNonEnumerableProperty)(spanWithMaybeDsc, FROZEN_DSC_FIELD, dsc);
}

/**
 * Creates a dynamic sampling context from a client.
 *
 * Dispatches the `createDsc` lifecycle hook as a side effect.
 */
function getDynamicSamplingContextFromClient(trace_id, client) {
  const options = client.getOptions();
  const {
    publicKey: public_key
  } = client.getDsn() || {};
  const dsc = (0,_utils_hoist_object_js__WEBPACK_IMPORTED_MODULE_0__.dropUndefinedKeys)({
    environment: options.environment || _constants_js__WEBPACK_IMPORTED_MODULE_1__.DEFAULT_ENVIRONMENT,
    release: options.release,
    public_key,
    trace_id
  });
  client.emit('createDsc', dsc);
  return dsc;
}

/**
 * Get the dynamic sampling context for the currently active scopes.
 */
function getDynamicSamplingContextFromScope(client, scope) {
  const propagationContext = scope.getPropagationContext();
  return propagationContext.dsc || getDynamicSamplingContextFromClient(propagationContext.traceId, client);
}

/**
 * Creates a dynamic sampling context from a span (and client and scope)
 *
 * @param span the span from which a few values like the root span name and sample rate are extracted.
 *
 * @returns a dynamic sampling context
 */
function getDynamicSamplingContextFromSpan(span) {
  const client = (0,_currentScopes_js__WEBPACK_IMPORTED_MODULE_2__.getClient)();
  if (!client) {
    return {};
  }
  const rootSpan = (0,_utils_spanUtils_js__WEBPACK_IMPORTED_MODULE_3__.getRootSpan)(span);
  const rootSpanJson = (0,_utils_spanUtils_js__WEBPACK_IMPORTED_MODULE_3__.spanToJSON)(rootSpan);
  const rootSpanAttributes = rootSpanJson.data;
  const traceState = rootSpan.spanContext().traceState;

  // The span sample rate that was locally applied to the root span should also always be applied to the DSC, even if the DSC is frozen.
  // This is so that the downstream traces/services can use parentSampleRate in their `tracesSampler` to make consistent sampling decisions across the entire trace.
  const rootSpanSampleRate = traceState?.get('sentry.sample_rate') ?? rootSpanAttributes[_semanticAttributes_js__WEBPACK_IMPORTED_MODULE_4__.SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE];
  function applyLocalSampleRateToDsc(dsc) {
    if (typeof rootSpanSampleRate === 'number' || typeof rootSpanSampleRate === 'string') {
      dsc.sample_rate = `${rootSpanSampleRate}`;
    }
    return dsc;
  }

  // For core implementation, we freeze the DSC onto the span as a non-enumerable property
  const frozenDsc = rootSpan[FROZEN_DSC_FIELD];
  if (frozenDsc) {
    return applyLocalSampleRateToDsc(frozenDsc);
  }

  // For OpenTelemetry, we freeze the DSC on the trace state
  const traceStateDsc = traceState?.get('sentry.dsc');

  // If the span has a DSC, we want it to take precedence
  const dscOnTraceState = traceStateDsc && (0,_utils_hoist_baggage_js__WEBPACK_IMPORTED_MODULE_5__.baggageHeaderToDynamicSamplingContext)(traceStateDsc);
  if (dscOnTraceState) {
    return applyLocalSampleRateToDsc(dscOnTraceState);
  }

  // Else, we generate it from the span
  const dsc = getDynamicSamplingContextFromClient(span.spanContext().traceId, client);

  // We don't want to have a transaction name in the DSC if the source is "url" because URLs might contain PII
  const source = rootSpanAttributes[_semanticAttributes_js__WEBPACK_IMPORTED_MODULE_4__.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE];

  // after JSON conversion, txn.name becomes jsonSpan.description
  const name = rootSpanJson.description;
  if (source !== 'url' && name) {
    dsc.transaction = name;
  }

  // How can we even land here with hasSpansEnabled() returning false?
  // Otel creates a Non-recording span in Tracing Without Performance mode when handling incoming requests
  // So we end up with an active span that is not sampled (neither positively nor negatively)
  if ((0,_utils_hasSpansEnabled_js__WEBPACK_IMPORTED_MODULE_6__.hasSpansEnabled)()) {
    dsc.sampled = String((0,_utils_spanUtils_js__WEBPACK_IMPORTED_MODULE_3__.spanIsSampled)(rootSpan));
    dsc.sample_rand =
    // In OTEL we store the sample rand on the trace state because we cannot access scopes for NonRecordingSpans
    // The Sentry OTEL SpanSampler takes care of writing the sample rand on the root span
    traceState?.get('sentry.sample_rand') ??
    // On all other platforms we can actually get the scopes from a root span (we use this as a fallback)
    (0,_utils_js__WEBPACK_IMPORTED_MODULE_7__.getCapturedScopesOnSpan)(rootSpan).scope?.getPropagationContext().sampleRand.toString();
  }
  applyLocalSampleRateToDsc(dsc);
  client.emit('createDsc', dsc, rootSpan);
  return dsc;
}

/**
 * Convert a Span to a baggage header.
 */
function spanToBaggageHeader(span) {
  const dsc = getDynamicSamplingContextFromSpan(span);
  return (0,_utils_hoist_baggage_js__WEBPACK_IMPORTED_MODULE_5__.dynamicSamplingContextToSentryBaggageHeader)(dsc);
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/tracing/spanstatus.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/tracing/spanstatus.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SPAN_STATUS_ERROR: () => (/* binding */ SPAN_STATUS_ERROR),
/* harmony export */   SPAN_STATUS_OK: () => (/* binding */ SPAN_STATUS_OK),
/* harmony export */   SPAN_STATUS_UNSET: () => (/* binding */ SPAN_STATUS_UNSET),
/* harmony export */   getSpanStatusFromHttpCode: () => (/* binding */ getSpanStatusFromHttpCode),
/* harmony export */   setHttpStatus: () => (/* binding */ setHttpStatus)
/* harmony export */ });
const SPAN_STATUS_UNSET = 0;
const SPAN_STATUS_OK = 1;
const SPAN_STATUS_ERROR = 2;

/**
 * Converts a HTTP status code into a sentry status with a message.
 *
 * @param httpStatus The HTTP response status code.
 * @returns The span status or unknown_error.
 */
// https://develop.sentry.dev/sdk/event-payloads/span/
function getSpanStatusFromHttpCode(httpStatus) {
  if (httpStatus < 400 && httpStatus >= 100) {
    return {
      code: SPAN_STATUS_OK
    };
  }
  if (httpStatus >= 400 && httpStatus < 500) {
    switch (httpStatus) {
      case 401:
        return {
          code: SPAN_STATUS_ERROR,
          message: 'unauthenticated'
        };
      case 403:
        return {
          code: SPAN_STATUS_ERROR,
          message: 'permission_denied'
        };
      case 404:
        return {
          code: SPAN_STATUS_ERROR,
          message: 'not_found'
        };
      case 409:
        return {
          code: SPAN_STATUS_ERROR,
          message: 'already_exists'
        };
      case 413:
        return {
          code: SPAN_STATUS_ERROR,
          message: 'failed_precondition'
        };
      case 429:
        return {
          code: SPAN_STATUS_ERROR,
          message: 'resource_exhausted'
        };
      case 499:
        return {
          code: SPAN_STATUS_ERROR,
          message: 'cancelled'
        };
      default:
        return {
          code: SPAN_STATUS_ERROR,
          message: 'invalid_argument'
        };
    }
  }
  if (httpStatus >= 500 && httpStatus < 600) {
    switch (httpStatus) {
      case 501:
        return {
          code: SPAN_STATUS_ERROR,
          message: 'unimplemented'
        };
      case 503:
        return {
          code: SPAN_STATUS_ERROR,
          message: 'unavailable'
        };
      case 504:
        return {
          code: SPAN_STATUS_ERROR,
          message: 'deadline_exceeded'
        };
      default:
        return {
          code: SPAN_STATUS_ERROR,
          message: 'internal_error'
        };
    }
  }
  return {
    code: SPAN_STATUS_ERROR,
    message: 'unknown_error'
  };
}

/**
 * Sets the Http status attributes on the current span based on the http code.
 * Additionally, the span's status is updated, depending on the http code.
 */
function setHttpStatus(span, httpStatus) {
  span.setAttribute('http.response.status_code', httpStatus);
  const spanStatus = getSpanStatusFromHttpCode(httpStatus);
  if (spanStatus.message !== 'unknown_error') {
    span.setStatus(spanStatus);
  }
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/tracing/utils.js":
/*!**************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/tracing/utils.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getCapturedScopesOnSpan: () => (/* binding */ getCapturedScopesOnSpan),
/* harmony export */   setCapturedScopesOnSpan: () => (/* binding */ setCapturedScopesOnSpan)
/* harmony export */ });
/* harmony import */ var _utils_hoist_object_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils-hoist/object.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/object.js");

const SCOPE_ON_START_SPAN_FIELD = '_sentryScope';
const ISOLATION_SCOPE_ON_START_SPAN_FIELD = '_sentryIsolationScope';

/** Store the scope & isolation scope for a span, which can the be used when it is finished. */
function setCapturedScopesOnSpan(span, scope, isolationScope) {
  if (span) {
    (0,_utils_hoist_object_js__WEBPACK_IMPORTED_MODULE_0__.addNonEnumerableProperty)(span, ISOLATION_SCOPE_ON_START_SPAN_FIELD, isolationScope);
    (0,_utils_hoist_object_js__WEBPACK_IMPORTED_MODULE_0__.addNonEnumerableProperty)(span, SCOPE_ON_START_SPAN_FIELD, scope);
  }
}

/**
 * Grabs the scope and isolation scope off a span that were active when the span was started.
 */
function getCapturedScopesOnSpan(span) {
  return {
    scope: span[SCOPE_ON_START_SPAN_FIELD],
    isolationScope: span[ISOLATION_SCOPE_ON_START_SPAN_FIELD]
  };
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/transports/base.js":
/*!****************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/transports/base.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DEFAULT_TRANSPORT_BUFFER_SIZE: () => (/* binding */ DEFAULT_TRANSPORT_BUFFER_SIZE),
/* harmony export */   createTransport: () => (/* binding */ createTransport)
/* harmony export */ });
/* harmony import */ var _debug_build_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../debug-build.js */ "./node_modules/@sentry/core/build/esm/debug-build.js");
/* harmony import */ var _utils_hoist_envelope_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils-hoist/envelope.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/envelope.js");
/* harmony import */ var _utils_hoist_error_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../utils-hoist/error.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/error.js");
/* harmony import */ var _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils-hoist/logger.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/logger.js");
/* harmony import */ var _utils_hoist_promisebuffer_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils-hoist/promisebuffer.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/promisebuffer.js");
/* harmony import */ var _utils_hoist_ratelimit_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils-hoist/ratelimit.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/ratelimit.js");
/* harmony import */ var _utils_hoist_syncpromise_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils-hoist/syncpromise.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/syncpromise.js");







const DEFAULT_TRANSPORT_BUFFER_SIZE = 64;

/**
 * Creates an instance of a Sentry `Transport`
 *
 * @param options
 * @param makeRequest
 */
function createTransport(options, makeRequest, buffer) {
  if (buffer === void 0) {
    buffer = (0,_utils_hoist_promisebuffer_js__WEBPACK_IMPORTED_MODULE_0__.makePromiseBuffer)(options.bufferSize || DEFAULT_TRANSPORT_BUFFER_SIZE);
  }
  let rateLimits = {};
  const flush = timeout => buffer.drain(timeout);
  function send(envelope) {
    const filteredEnvelopeItems = [];

    // Drop rate limited items from envelope
    (0,_utils_hoist_envelope_js__WEBPACK_IMPORTED_MODULE_1__.forEachEnvelopeItem)(envelope, (item, type) => {
      const dataCategory = (0,_utils_hoist_envelope_js__WEBPACK_IMPORTED_MODULE_1__.envelopeItemTypeToDataCategory)(type);
      if ((0,_utils_hoist_ratelimit_js__WEBPACK_IMPORTED_MODULE_2__.isRateLimited)(rateLimits, dataCategory)) {
        options.recordDroppedEvent('ratelimit_backoff', dataCategory);
      } else {
        filteredEnvelopeItems.push(item);
      }
    });

    // Skip sending if envelope is empty after filtering out rate limited events
    if (filteredEnvelopeItems.length === 0) {
      return (0,_utils_hoist_syncpromise_js__WEBPACK_IMPORTED_MODULE_3__.resolvedSyncPromise)({});
    }
    const filteredEnvelope = (0,_utils_hoist_envelope_js__WEBPACK_IMPORTED_MODULE_1__.createEnvelope)(envelope[0], filteredEnvelopeItems);

    // Creates client report for each item in an envelope
    const recordEnvelopeLoss = reason => {
      (0,_utils_hoist_envelope_js__WEBPACK_IMPORTED_MODULE_1__.forEachEnvelopeItem)(filteredEnvelope, (item, type) => {
        options.recordDroppedEvent(reason, (0,_utils_hoist_envelope_js__WEBPACK_IMPORTED_MODULE_1__.envelopeItemTypeToDataCategory)(type));
      });
    };
    const requestTask = () => makeRequest({
      body: (0,_utils_hoist_envelope_js__WEBPACK_IMPORTED_MODULE_1__.serializeEnvelope)(filteredEnvelope)
    }).then(response => {
      // We don't want to throw on NOK responses, but we want to at least log them
      if (response.statusCode !== undefined && (response.statusCode < 200 || response.statusCode >= 300)) {
        _debug_build_js__WEBPACK_IMPORTED_MODULE_4__.DEBUG_BUILD && _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_5__.logger.warn(`Sentry responded with status code ${response.statusCode} to sent event.`);
      }
      rateLimits = (0,_utils_hoist_ratelimit_js__WEBPACK_IMPORTED_MODULE_2__.updateRateLimits)(rateLimits, response);
      return response;
    }, error => {
      recordEnvelopeLoss('network_error');
      throw error;
    });
    return buffer.add(requestTask).then(result => result, error => {
      if (error instanceof _utils_hoist_error_js__WEBPACK_IMPORTED_MODULE_6__.SentryError) {
        _debug_build_js__WEBPACK_IMPORTED_MODULE_4__.DEBUG_BUILD && _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_5__.logger.error('Skipped sending event because buffer is full.');
        recordEnvelopeLoss('queue_overflow');
        return (0,_utils_hoist_syncpromise_js__WEBPACK_IMPORTED_MODULE_3__.resolvedSyncPromise)({});
      } else {
        throw error;
      }
    });
  }
  return {
    send,
    flush
  };
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/utils-hoist/aggregate-errors.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/utils-hoist/aggregate-errors.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   applyAggregateErrorsToEvent: () => (/* binding */ applyAggregateErrorsToEvent)
/* harmony export */ });
/* harmony import */ var _is_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./is.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/is.js");
/* harmony import */ var _string_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./string.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/string.js");



/**
 * Creates exceptions inside `event.exception.values` for errors that are nested on properties based on the `key` parameter.
 */
function applyAggregateErrorsToEvent(exceptionFromErrorImplementation, parser, maxValueLimit, key, limit, event, hint) {
  if (maxValueLimit === void 0) {
    maxValueLimit = 250;
  }
  if (!event.exception?.values || !hint || !(0,_is_js__WEBPACK_IMPORTED_MODULE_0__.isInstanceOf)(hint.originalException, Error)) {
    return;
  }

  // Generally speaking the last item in `event.exception.values` is the exception originating from the original Error
  const originalException = event.exception.values.length > 0 ? event.exception.values[event.exception.values.length - 1] : undefined;

  // We only create exception grouping if there is an exception in the event.
  if (originalException) {
    event.exception.values = truncateAggregateExceptions(aggregateExceptionsFromError(exceptionFromErrorImplementation, parser, limit, hint.originalException, key, event.exception.values, originalException, 0), maxValueLimit);
  }
}
function aggregateExceptionsFromError(exceptionFromErrorImplementation, parser, limit, error, key, prevExceptions, exception, exceptionId) {
  if (prevExceptions.length >= limit + 1) {
    return prevExceptions;
  }
  let newExceptions = [...prevExceptions];

  // Recursively call this function in order to walk down a chain of errors
  if ((0,_is_js__WEBPACK_IMPORTED_MODULE_0__.isInstanceOf)(error[key], Error)) {
    applyExceptionGroupFieldsForParentException(exception, exceptionId);
    const newException = exceptionFromErrorImplementation(parser, error[key]);
    const newExceptionId = newExceptions.length;
    applyExceptionGroupFieldsForChildException(newException, key, newExceptionId, exceptionId);
    newExceptions = aggregateExceptionsFromError(exceptionFromErrorImplementation, parser, limit, error[key], key, [newException, ...newExceptions], newException, newExceptionId);
  }

  // This will create exception grouping for AggregateErrors
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AggregateError
  if (Array.isArray(error.errors)) {
    error.errors.forEach((childError, i) => {
      if ((0,_is_js__WEBPACK_IMPORTED_MODULE_0__.isInstanceOf)(childError, Error)) {
        applyExceptionGroupFieldsForParentException(exception, exceptionId);
        const newException = exceptionFromErrorImplementation(parser, childError);
        const newExceptionId = newExceptions.length;
        applyExceptionGroupFieldsForChildException(newException, `errors[${i}]`, newExceptionId, exceptionId);
        newExceptions = aggregateExceptionsFromError(exceptionFromErrorImplementation, parser, limit, childError, key, [newException, ...newExceptions], newException, newExceptionId);
      }
    });
  }
  return newExceptions;
}
function applyExceptionGroupFieldsForParentException(exception, exceptionId) {
  // Don't know if this default makes sense. The protocol requires us to set these values so we pick *some* default.
  exception.mechanism = exception.mechanism || {
    type: 'generic',
    handled: true
  };
  exception.mechanism = {
    ...exception.mechanism,
    ...(exception.type === 'AggregateError' && {
      is_exception_group: true
    }),
    exception_id: exceptionId
  };
}
function applyExceptionGroupFieldsForChildException(exception, source, exceptionId, parentId) {
  // Don't know if this default makes sense. The protocol requires us to set these values so we pick *some* default.
  exception.mechanism = exception.mechanism || {
    type: 'generic',
    handled: true
  };
  exception.mechanism = {
    ...exception.mechanism,
    type: 'chained',
    source,
    exception_id: exceptionId,
    parent_id: parentId
  };
}

/**
 * Truncate the message (exception.value) of all exceptions in the event.
 * Because this event processor is ran after `applyClientOptions`,
 * we need to truncate the message of the added exceptions here.
 */
function truncateAggregateExceptions(exceptions, maxValueLength) {
  return exceptions.map(exception => {
    if (exception.value) {
      exception.value = (0,_string_js__WEBPACK_IMPORTED_MODULE_1__.truncate)(exception.value, maxValueLength);
    }
    return exception;
  });
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/utils-hoist/baggage.js":
/*!********************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/utils-hoist/baggage.js ***!
  \********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MAX_BAGGAGE_STRING_LENGTH: () => (/* binding */ MAX_BAGGAGE_STRING_LENGTH),
/* harmony export */   SENTRY_BAGGAGE_KEY_PREFIX: () => (/* binding */ SENTRY_BAGGAGE_KEY_PREFIX),
/* harmony export */   SENTRY_BAGGAGE_KEY_PREFIX_REGEX: () => (/* binding */ SENTRY_BAGGAGE_KEY_PREFIX_REGEX),
/* harmony export */   baggageHeaderToDynamicSamplingContext: () => (/* binding */ baggageHeaderToDynamicSamplingContext),
/* harmony export */   dynamicSamplingContextToSentryBaggageHeader: () => (/* binding */ dynamicSamplingContextToSentryBaggageHeader),
/* harmony export */   objectToBaggageHeader: () => (/* binding */ objectToBaggageHeader),
/* harmony export */   parseBaggageHeader: () => (/* binding */ parseBaggageHeader)
/* harmony export */ });
/* harmony import */ var _debug_build_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./debug-build.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/debug-build.js");
/* harmony import */ var _is_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./is.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/is.js");
/* harmony import */ var _logger_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./logger.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/logger.js");



const SENTRY_BAGGAGE_KEY_PREFIX = 'sentry-';
const SENTRY_BAGGAGE_KEY_PREFIX_REGEX = /^sentry-/;

/**
 * Max length of a serialized baggage string
 *
 * https://www.w3.org/TR/baggage/#limits
 */
const MAX_BAGGAGE_STRING_LENGTH = 8192;

/**
 * Takes a baggage header and turns it into Dynamic Sampling Context, by extracting all the "sentry-" prefixed values
 * from it.
 *
 * @param baggageHeader A very bread definition of a baggage header as it might appear in various frameworks.
 * @returns The Dynamic Sampling Context that was found on `baggageHeader`, if there was any, `undefined` otherwise.
 */
function baggageHeaderToDynamicSamplingContext(
// Very liberal definition of what any incoming header might look like
baggageHeader) {
  const baggageObject = parseBaggageHeader(baggageHeader);
  if (!baggageObject) {
    return undefined;
  }

  // Read all "sentry-" prefixed values out of the baggage object and put it onto a dynamic sampling context object.
  const dynamicSamplingContext = Object.entries(baggageObject).reduce((acc, _ref) => {
    let [key, value] = _ref;
    if (key.match(SENTRY_BAGGAGE_KEY_PREFIX_REGEX)) {
      const nonPrefixedKey = key.slice(SENTRY_BAGGAGE_KEY_PREFIX.length);
      acc[nonPrefixedKey] = value;
    }
    return acc;
  }, {});

  // Only return a dynamic sampling context object if there are keys in it.
  // A keyless object means there were no sentry values on the header, which means that there is no DSC.
  if (Object.keys(dynamicSamplingContext).length > 0) {
    return dynamicSamplingContext;
  } else {
    return undefined;
  }
}

/**
 * Turns a Dynamic Sampling Object into a baggage header by prefixing all the keys on the object with "sentry-".
 *
 * @param dynamicSamplingContext The Dynamic Sampling Context to turn into a header. For convenience and compatibility
 * with the `getDynamicSamplingContext` method on the Transaction class ,this argument can also be `undefined`. If it is
 * `undefined` the function will return `undefined`.
 * @returns a baggage header, created from `dynamicSamplingContext`, or `undefined` either if `dynamicSamplingContext`
 * was `undefined`, or if `dynamicSamplingContext` didn't contain any values.
 */
function dynamicSamplingContextToSentryBaggageHeader(
// this also takes undefined for convenience and bundle size in other places
dynamicSamplingContext) {
  if (!dynamicSamplingContext) {
    return undefined;
  }

  // Prefix all DSC keys with "sentry-" and put them into a new object
  const sentryPrefixedDSC = Object.entries(dynamicSamplingContext).reduce((acc, _ref2) => {
    let [dscKey, dscValue] = _ref2;
    if (dscValue) {
      acc[`${SENTRY_BAGGAGE_KEY_PREFIX}${dscKey}`] = dscValue;
    }
    return acc;
  }, {});
  return objectToBaggageHeader(sentryPrefixedDSC);
}

/**
 * Take a baggage header and parse it into an object.
 */
function parseBaggageHeader(baggageHeader) {
  if (!baggageHeader || !(0,_is_js__WEBPACK_IMPORTED_MODULE_0__.isString)(baggageHeader) && !Array.isArray(baggageHeader)) {
    return undefined;
  }
  if (Array.isArray(baggageHeader)) {
    // Combine all baggage headers into one object containing the baggage values so we can later read the Sentry-DSC-values from it
    return baggageHeader.reduce((acc, curr) => {
      const currBaggageObject = baggageHeaderToObject(curr);
      Object.entries(currBaggageObject).forEach(_ref3 => {
        let [key, value] = _ref3;
        acc[key] = value;
      });
      return acc;
    }, {});
  }
  return baggageHeaderToObject(baggageHeader);
}

/**
 * Will parse a baggage header, which is a simple key-value map, into a flat object.
 *
 * @param baggageHeader The baggage header to parse.
 * @returns a flat object containing all the key-value pairs from `baggageHeader`.
 */
function baggageHeaderToObject(baggageHeader) {
  return baggageHeader.split(',').map(baggageEntry => baggageEntry.split('=').map(keyOrValue => decodeURIComponent(keyOrValue.trim()))).reduce((acc, _ref4) => {
    let [key, value] = _ref4;
    if (key && value) {
      acc[key] = value;
    }
    return acc;
  }, {});
}

/**
 * Turns a flat object (key-value pairs) into a baggage header, which is also just key-value pairs.
 *
 * @param object The object to turn into a baggage header.
 * @returns a baggage header string, or `undefined` if the object didn't have any values, since an empty baggage header
 * is not spec compliant.
 */
function objectToBaggageHeader(object) {
  if (Object.keys(object).length === 0) {
    // An empty baggage header is not spec compliant: We return undefined.
    return undefined;
  }
  return Object.entries(object).reduce((baggageHeader, _ref5, currentIndex) => {
    let [objectKey, objectValue] = _ref5;
    const baggageEntry = `${encodeURIComponent(objectKey)}=${encodeURIComponent(objectValue)}`;
    const newBaggageHeader = currentIndex === 0 ? baggageEntry : `${baggageHeader},${baggageEntry}`;
    if (newBaggageHeader.length > MAX_BAGGAGE_STRING_LENGTH) {
      _debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD && _logger_js__WEBPACK_IMPORTED_MODULE_2__.logger.warn(`Not adding key: ${objectKey} with val: ${objectValue} to baggage header due to exceeding baggage size limits.`);
      return baggageHeader;
    } else {
      return newBaggageHeader;
    }
  }, '');
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/utils-hoist/breadcrumb-log-level.js":
/*!*********************************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/utils-hoist/breadcrumb-log-level.js ***!
  \*********************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getBreadcrumbLogLevelFromHttpStatusCode: () => (/* binding */ getBreadcrumbLogLevelFromHttpStatusCode)
/* harmony export */ });
/**
 * Determine a breadcrumb's log level (only `warning` or `error`) based on an HTTP status code.
 */
function getBreadcrumbLogLevelFromHttpStatusCode(statusCode) {
  // NOTE: undefined defaults to 'info' in Sentry
  if (statusCode === undefined) {
    return undefined;
  } else if (statusCode >= 400 && statusCode < 500) {
    return 'warning';
  } else if (statusCode >= 500) {
    return 'error';
  } else {
    return undefined;
  }
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/utils-hoist/browser.js":
/*!********************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/utils-hoist/browser.js ***!
  \********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getComponentName: () => (/* binding */ getComponentName),
/* harmony export */   getLocationHref: () => (/* binding */ getLocationHref),
/* harmony export */   htmlTreeAsString: () => (/* binding */ htmlTreeAsString)
/* harmony export */ });
/* harmony import */ var _is_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./is.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/is.js");
/* harmony import */ var _worldwide_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./worldwide.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/worldwide.js");


const WINDOW = _worldwide_js__WEBPACK_IMPORTED_MODULE_0__.GLOBAL_OBJ;
const DEFAULT_MAX_STRING_LENGTH = 80;

/**
 * Given a child DOM element, returns a query-selector statement describing that
 * and its ancestors
 * e.g. [HTMLElement] => body > div > input#foo.btn[name=baz]
 * @returns generated DOM path
 */
function htmlTreeAsString(elem, options) {
  if (options === void 0) {
    options = {};
  }
  if (!elem) {
    return '<unknown>';
  }

  // try/catch both:
  // - accessing event.target (see getsentry/raven-js#838, #768)
  // - `htmlTreeAsString` because it's complex, and just accessing the DOM incorrectly
  // - can throw an exception in some circumstances.
  try {
    let currentElem = elem;
    const MAX_TRAVERSE_HEIGHT = 5;
    const out = [];
    let height = 0;
    let len = 0;
    const separator = ' > ';
    const sepLength = separator.length;
    let nextStr;
    const keyAttrs = Array.isArray(options) ? options : options.keyAttrs;
    const maxStringLength = !Array.isArray(options) && options.maxStringLength || DEFAULT_MAX_STRING_LENGTH;
    while (currentElem && height++ < MAX_TRAVERSE_HEIGHT) {
      nextStr = _htmlElementAsString(currentElem, keyAttrs);
      // bail out if
      // - nextStr is the 'html' element
      // - the length of the string that would be created exceeds maxStringLength
      //   (ignore this limit if we are on the first iteration)
      if (nextStr === 'html' || height > 1 && len + out.length * sepLength + nextStr.length >= maxStringLength) {
        break;
      }
      out.push(nextStr);
      len += nextStr.length;
      currentElem = currentElem.parentNode;
    }
    return out.reverse().join(separator);
  } catch (_oO) {
    return '<unknown>';
  }
}

/**
 * Returns a simple, query-selector representation of a DOM element
 * e.g. [HTMLElement] => input#foo.btn[name=baz]
 * @returns generated DOM path
 */
function _htmlElementAsString(el, keyAttrs) {
  const elem = el;
  const out = [];
  if (!elem?.tagName) {
    return '';
  }

  // @ts-expect-error WINDOW has HTMLElement
  if (WINDOW.HTMLElement) {
    // If using the component name annotation plugin, this value may be available on the DOM node
    if (elem instanceof HTMLElement && elem.dataset) {
      if (elem.dataset['sentryComponent']) {
        return elem.dataset['sentryComponent'];
      }
      if (elem.dataset['sentryElement']) {
        return elem.dataset['sentryElement'];
      }
    }
  }
  out.push(elem.tagName.toLowerCase());

  // Pairs of attribute keys defined in `serializeAttribute` and their values on element.
  const keyAttrPairs = keyAttrs?.length ? keyAttrs.filter(keyAttr => elem.getAttribute(keyAttr)).map(keyAttr => [keyAttr, elem.getAttribute(keyAttr)]) : null;
  if (keyAttrPairs?.length) {
    keyAttrPairs.forEach(keyAttrPair => {
      out.push(`[${keyAttrPair[0]}="${keyAttrPair[1]}"]`);
    });
  } else {
    if (elem.id) {
      out.push(`#${elem.id}`);
    }
    const className = elem.className;
    if (className && (0,_is_js__WEBPACK_IMPORTED_MODULE_1__.isString)(className)) {
      const classes = className.split(/\s+/);
      for (const c of classes) {
        out.push(`.${c}`);
      }
    }
  }
  const allowedAttrs = ['aria-label', 'type', 'name', 'title', 'alt'];
  for (const k of allowedAttrs) {
    const attr = elem.getAttribute(k);
    if (attr) {
      out.push(`[${k}="${attr}"]`);
    }
  }
  return out.join('');
}

/**
 * A safe form of location.href
 */
function getLocationHref() {
  try {
    return WINDOW.document.location.href;
  } catch (oO) {
    return '';
  }
}

/**
 * Given a DOM element, traverses up the tree until it finds the first ancestor node
 * that has the `data-sentry-component` or `data-sentry-element` attribute with `data-sentry-component` taking
 * precedence. This attribute is added at build-time by projects that have the component name annotation plugin installed.
 *
 * @returns a string representation of the component for the provided DOM element, or `null` if not found
 */
function getComponentName(elem) {
  // @ts-expect-error WINDOW has HTMLElement
  if (!WINDOW.HTMLElement) {
    return null;
  }
  let currentElem = elem;
  const MAX_TRAVERSE_HEIGHT = 5;
  for (let i = 0; i < MAX_TRAVERSE_HEIGHT; i++) {
    if (!currentElem) {
      return null;
    }
    if (currentElem instanceof HTMLElement) {
      if (currentElem.dataset['sentryComponent']) {
        return currentElem.dataset['sentryComponent'];
      }
      if (currentElem.dataset['sentryElement']) {
        return currentElem.dataset['sentryElement'];
      }
    }
    currentElem = currentElem.parentNode;
  }
  return null;
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/utils-hoist/clientreport.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/utils-hoist/clientreport.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createClientReportEnvelope: () => (/* binding */ createClientReportEnvelope)
/* harmony export */ });
/* harmony import */ var _envelope_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./envelope.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/envelope.js");
/* harmony import */ var _time_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./time.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/time.js");



/**
 * Creates client report envelope
 * @param discarded_events An array of discard events
 * @param dsn A DSN that can be set on the header. Optional.
 */
function createClientReportEnvelope(discarded_events, dsn, timestamp) {
  const clientReportItem = [{
    type: 'client_report'
  }, {
    timestamp: timestamp || (0,_time_js__WEBPACK_IMPORTED_MODULE_0__.dateTimestampInSeconds)(),
    discarded_events
  }];
  return (0,_envelope_js__WEBPACK_IMPORTED_MODULE_1__.createEnvelope)(dsn ? {
    dsn
  } : {}, [clientReportItem]);
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/utils-hoist/debug-build.js":
/*!************************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/utils-hoist/debug-build.js ***!
  \************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DEBUG_BUILD: () => (/* binding */ DEBUG_BUILD)
/* harmony export */ });
/**
 * This serves as a build time flag that will be true by default, but false in non-debug builds or if users replace `__SENTRY_DEBUG__` in their generated code.
 *
 * ATTENTION: This constant must never cross package boundaries (i.e. be exported) to guarantee that it can be used for tree shaking.
 */
const DEBUG_BUILD =  false || false;


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/utils-hoist/debug-ids.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/utils-hoist/debug-ids.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getDebugImagesForResources: () => (/* binding */ getDebugImagesForResources),
/* harmony export */   getFilenameToDebugIdMap: () => (/* binding */ getFilenameToDebugIdMap)
/* harmony export */ });
/* harmony import */ var _worldwide_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./worldwide.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/worldwide.js");

let parsedStackResults;
let lastKeysCount;
let cachedFilenameDebugIds;

/**
 * Returns a map of filenames to debug identifiers.
 */
function getFilenameToDebugIdMap(stackParser) {
  const debugIdMap = _worldwide_js__WEBPACK_IMPORTED_MODULE_0__.GLOBAL_OBJ._sentryDebugIds;
  if (!debugIdMap) {
    return {};
  }
  const debugIdKeys = Object.keys(debugIdMap);

  // If the count of registered globals hasn't changed since the last call, we
  // can just return the cached result.
  if (cachedFilenameDebugIds && debugIdKeys.length === lastKeysCount) {
    return cachedFilenameDebugIds;
  }
  lastKeysCount = debugIdKeys.length;

  // Build a map of filename -> debug_id.
  cachedFilenameDebugIds = debugIdKeys.reduce((acc, stackKey) => {
    if (!parsedStackResults) {
      parsedStackResults = {};
    }
    const result = parsedStackResults[stackKey];
    if (result) {
      acc[result[0]] = result[1];
    } else {
      const parsedStack = stackParser(stackKey);
      for (let i = parsedStack.length - 1; i >= 0; i--) {
        const stackFrame = parsedStack[i];
        const filename = stackFrame?.filename;
        const debugId = debugIdMap[stackKey];
        if (filename && debugId) {
          acc[filename] = debugId;
          parsedStackResults[stackKey] = [filename, debugId];
          break;
        }
      }
    }
    return acc;
  }, {});
  return cachedFilenameDebugIds;
}

/**
 * Returns a list of debug images for the given resources.
 */
function getDebugImagesForResources(stackParser, resource_paths) {
  const filenameDebugIdMap = getFilenameToDebugIdMap(stackParser);
  if (!filenameDebugIdMap) {
    return [];
  }
  const images = [];
  for (const path of resource_paths) {
    if (path && filenameDebugIdMap[path]) {
      images.push({
        type: 'sourcemap',
        code_file: path,
        debug_id: filenameDebugIdMap[path]
      });
    }
  }
  return images;
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/utils-hoist/dsn.js":
/*!****************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/utils-hoist/dsn.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   dsnFromString: () => (/* binding */ dsnFromString),
/* harmony export */   dsnToString: () => (/* binding */ dsnToString),
/* harmony export */   makeDsn: () => (/* binding */ makeDsn)
/* harmony export */ });
/* harmony import */ var _debug_build_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./debug-build.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/debug-build.js");
/* harmony import */ var _logger_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./logger.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/logger.js");



/** Regular expression used to parse a Dsn. */
const DSN_REGEX = /^(?:(\w+):)\/\/(?:(\w+)(?::(\w+)?)?@)([\w.-]+)(?::(\d+))?\/(.+)/;
function isValidProtocol(protocol) {
  return protocol === 'http' || protocol === 'https';
}

/**
 * Renders the string representation of this Dsn.
 *
 * By default, this will render the public representation without the password
 * component. To get the deprecated private representation, set `withPassword`
 * to true.
 *
 * @param withPassword When set to true, the password will be included.
 */
function dsnToString(dsn, withPassword) {
  if (withPassword === void 0) {
    withPassword = false;
  }
  const {
    host,
    path,
    pass,
    port,
    projectId,
    protocol,
    publicKey
  } = dsn;
  return `${protocol}://${publicKey}${withPassword && pass ? `:${pass}` : ''}` + `@${host}${port ? `:${port}` : ''}/${path ? `${path}/` : path}${projectId}`;
}

/**
 * Parses a Dsn from a given string.
 *
 * @param str A Dsn as string
 * @returns Dsn as DsnComponents or undefined if @param str is not a valid DSN string
 */
function dsnFromString(str) {
  const match = DSN_REGEX.exec(str);
  if (!match) {
    // This should be logged to the console
    (0,_logger_js__WEBPACK_IMPORTED_MODULE_0__.consoleSandbox)(() => {
      // eslint-disable-next-line no-console
      console.error(`Invalid Sentry Dsn: ${str}`);
    });
    return undefined;
  }
  const [protocol, publicKey, pass = '', host = '', port = '', lastPath = ''] = match.slice(1);
  let path = '';
  let projectId = lastPath;
  const split = projectId.split('/');
  if (split.length > 1) {
    path = split.slice(0, -1).join('/');
    projectId = split.pop();
  }
  if (projectId) {
    const projectMatch = projectId.match(/^\d+/);
    if (projectMatch) {
      projectId = projectMatch[0];
    }
  }
  return dsnFromComponents({
    host,
    pass,
    path,
    projectId,
    port,
    protocol: protocol,
    publicKey
  });
}
function dsnFromComponents(components) {
  return {
    protocol: components.protocol,
    publicKey: components.publicKey || '',
    pass: components.pass || '',
    host: components.host,
    port: components.port || '',
    path: components.path || '',
    projectId: components.projectId
  };
}
function validateDsn(dsn) {
  if (!_debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD) {
    return true;
  }
  const {
    port,
    projectId,
    protocol
  } = dsn;
  const requiredComponents = ['protocol', 'publicKey', 'host', 'projectId'];
  const hasMissingRequiredComponent = requiredComponents.find(component => {
    if (!dsn[component]) {
      _logger_js__WEBPACK_IMPORTED_MODULE_0__.logger.error(`Invalid Sentry Dsn: ${component} missing`);
      return true;
    }
    return false;
  });
  if (hasMissingRequiredComponent) {
    return false;
  }
  if (!projectId.match(/^\d+$/)) {
    _logger_js__WEBPACK_IMPORTED_MODULE_0__.logger.error(`Invalid Sentry Dsn: Invalid projectId ${projectId}`);
    return false;
  }
  if (!isValidProtocol(protocol)) {
    _logger_js__WEBPACK_IMPORTED_MODULE_0__.logger.error(`Invalid Sentry Dsn: Invalid protocol ${protocol}`);
    return false;
  }
  if (port && isNaN(parseInt(port, 10))) {
    _logger_js__WEBPACK_IMPORTED_MODULE_0__.logger.error(`Invalid Sentry Dsn: Invalid port ${port}`);
    return false;
  }
  return true;
}

/**
 * Creates a valid Sentry Dsn object, identifying a Sentry instance and project.
 * @returns a valid DsnComponents object or `undefined` if @param from is an invalid DSN source
 */
function makeDsn(from) {
  const components = typeof from === 'string' ? dsnFromString(from) : dsnFromComponents(from);
  if (!components || !validateDsn(components)) {
    return undefined;
  }
  return components;
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/utils-hoist/env.js":
/*!****************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/utils-hoist/env.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getSDKSource: () => (/* binding */ getSDKSource),
/* harmony export */   isBrowserBundle: () => (/* binding */ isBrowserBundle)
/* harmony export */ });
/*
 * This module exists for optimizations in the build process through rollup and terser.  We define some global
 * constants, which can be overridden during build. By guarding certain pieces of code with functions that return these
 * constants, we can control whether or not they appear in the final bundle. (Any code guarded by a false condition will
 * never run, and will hence be dropped during treeshaking.) The two primary uses for this are stripping out calls to
 * `logger` and preventing node-related code from appearing in browser bundles.
 *
 * Attention:
 * This file should not be used to define constants/flags that are intended to be used for tree-shaking conducted by
 * users. These flags should live in their respective packages, as we identified user tooling (specifically webpack)
 * having issues tree-shaking these constants across package boundaries.
 * An example for this is the __SENTRY_DEBUG__ constant. It is declared in each package individually because we want
 * users to be able to shake away expressions that it guards.
 */

/**
 * Figures out if we're building a browser bundle.
 *
 * @returns true if this is a browser bundle build.
 */
function isBrowserBundle() {
  return typeof __SENTRY_BROWSER_BUNDLE__ !== 'undefined' && !!__SENTRY_BROWSER_BUNDLE__;
}

/**
 * Get source of SDK.
 */
function getSDKSource() {
  // This comment is used to identify this line in the CDN bundle build step and replace this with "return 'cdn';"
  /* __SENTRY_SDK_SOURCE__ */
  return 'npm';
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/utils-hoist/envelope.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/utils-hoist/envelope.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addItemToEnvelope: () => (/* binding */ addItemToEnvelope),
/* harmony export */   createAttachmentEnvelopeItem: () => (/* binding */ createAttachmentEnvelopeItem),
/* harmony export */   createEnvelope: () => (/* binding */ createEnvelope),
/* harmony export */   createEventEnvelopeHeaders: () => (/* binding */ createEventEnvelopeHeaders),
/* harmony export */   createSpanEnvelopeItem: () => (/* binding */ createSpanEnvelopeItem),
/* harmony export */   envelopeContainsItemType: () => (/* binding */ envelopeContainsItemType),
/* harmony export */   envelopeItemTypeToDataCategory: () => (/* binding */ envelopeItemTypeToDataCategory),
/* harmony export */   forEachEnvelopeItem: () => (/* binding */ forEachEnvelopeItem),
/* harmony export */   getSdkMetadataForEnvelopeHeader: () => (/* binding */ getSdkMetadataForEnvelopeHeader),
/* harmony export */   parseEnvelope: () => (/* binding */ parseEnvelope),
/* harmony export */   serializeEnvelope: () => (/* binding */ serializeEnvelope)
/* harmony export */ });
/* harmony import */ var _carrier_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../carrier.js */ "./node_modules/@sentry/core/build/esm/carrier.js");
/* harmony import */ var _dsn_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./dsn.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/dsn.js");
/* harmony import */ var _normalize_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./normalize.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/normalize.js");
/* harmony import */ var _object_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./object.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/object.js");
/* harmony import */ var _worldwide_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./worldwide.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/worldwide.js");






/**
 * Creates an envelope.
 * Make sure to always explicitly provide the generic to this function
 * so that the envelope types resolve correctly.
 */
function createEnvelope(headers, items) {
  if (items === void 0) {
    items = [];
  }
  return [headers, items];
}

/**
 * Add an item to an envelope.
 * Make sure to always explicitly provide the generic to this function
 * so that the envelope types resolve correctly.
 */
function addItemToEnvelope(envelope, newItem) {
  const [headers, items] = envelope;
  return [headers, [...items, newItem]];
}

/**
 * Convenience function to loop through the items and item types of an envelope.
 * (This function was mostly created because working with envelope types is painful at the moment)
 *
 * If the callback returns true, the rest of the items will be skipped.
 */
function forEachEnvelopeItem(envelope, callback) {
  const envelopeItems = envelope[1];
  for (const envelopeItem of envelopeItems) {
    const envelopeItemType = envelopeItem[0].type;
    const result = callback(envelopeItem, envelopeItemType);
    if (result) {
      return true;
    }
  }
  return false;
}

/**
 * Returns true if the envelope contains any of the given envelope item types
 */
function envelopeContainsItemType(envelope, types) {
  return forEachEnvelopeItem(envelope, (_, type) => types.includes(type));
}

/**
 * Encode a string to UTF8 array.
 */
function encodeUTF8(input) {
  const carrier = (0,_carrier_js__WEBPACK_IMPORTED_MODULE_0__.getSentryCarrier)(_worldwide_js__WEBPACK_IMPORTED_MODULE_1__.GLOBAL_OBJ);
  return carrier.encodePolyfill ? carrier.encodePolyfill(input) : new TextEncoder().encode(input);
}

/**
 * Decode a UTF8 array to string.
 */
function decodeUTF8(input) {
  const carrier = (0,_carrier_js__WEBPACK_IMPORTED_MODULE_0__.getSentryCarrier)(_worldwide_js__WEBPACK_IMPORTED_MODULE_1__.GLOBAL_OBJ);
  return carrier.decodePolyfill ? carrier.decodePolyfill(input) : new TextDecoder().decode(input);
}

/**
 * Serializes an envelope.
 */
function serializeEnvelope(envelope) {
  const [envHeaders, items] = envelope;

  // Initially we construct our envelope as a string and only convert to binary chunks if we encounter binary data
  let parts = JSON.stringify(envHeaders);
  function append(next) {
    if (typeof parts === 'string') {
      parts = typeof next === 'string' ? parts + next : [encodeUTF8(parts), next];
    } else {
      parts.push(typeof next === 'string' ? encodeUTF8(next) : next);
    }
  }
  for (const item of items) {
    const [itemHeaders, payload] = item;
    append(`\n${JSON.stringify(itemHeaders)}\n`);
    if (typeof payload === 'string' || payload instanceof Uint8Array) {
      append(payload);
    } else {
      let stringifiedPayload;
      try {
        stringifiedPayload = JSON.stringify(payload);
      } catch (e) {
        // In case, despite all our efforts to keep `payload` circular-dependency-free, `JSON.stringify()` still
        // fails, we try again after normalizing it again with infinite normalization depth. This of course has a
        // performance impact but in this case a performance hit is better than throwing.
        stringifiedPayload = JSON.stringify((0,_normalize_js__WEBPACK_IMPORTED_MODULE_2__.normalize)(payload));
      }
      append(stringifiedPayload);
    }
  }
  return typeof parts === 'string' ? parts : concatBuffers(parts);
}
function concatBuffers(buffers) {
  const totalLength = buffers.reduce((acc, buf) => acc + buf.length, 0);
  const merged = new Uint8Array(totalLength);
  let offset = 0;
  for (const buffer of buffers) {
    merged.set(buffer, offset);
    offset += buffer.length;
  }
  return merged;
}

/**
 * Parses an envelope
 */
function parseEnvelope(env) {
  let buffer = typeof env === 'string' ? encodeUTF8(env) : env;
  function readBinary(length) {
    const bin = buffer.subarray(0, length);
    // Replace the buffer with the remaining data excluding trailing newline
    buffer = buffer.subarray(length + 1);
    return bin;
  }
  function readJson() {
    let i = buffer.indexOf(0xa);
    // If we couldn't find a newline, we must have found the end of the buffer
    if (i < 0) {
      i = buffer.length;
    }
    return JSON.parse(decodeUTF8(readBinary(i)));
  }
  const envelopeHeader = readJson();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items = [];
  while (buffer.length) {
    const itemHeader = readJson();
    const binaryLength = typeof itemHeader.length === 'number' ? itemHeader.length : undefined;
    items.push([itemHeader, binaryLength ? readBinary(binaryLength) : readJson()]);
  }
  return [envelopeHeader, items];
}

/**
 * Creates envelope item for a single span
 */
function createSpanEnvelopeItem(spanJson) {
  const spanHeaders = {
    type: 'span'
  };
  return [spanHeaders, spanJson];
}

/**
 * Creates attachment envelope items
 */
function createAttachmentEnvelopeItem(attachment) {
  const buffer = typeof attachment.data === 'string' ? encodeUTF8(attachment.data) : attachment.data;
  return [(0,_object_js__WEBPACK_IMPORTED_MODULE_3__.dropUndefinedKeys)({
    type: 'attachment',
    length: buffer.length,
    filename: attachment.filename,
    content_type: attachment.contentType,
    attachment_type: attachment.attachmentType
  }), buffer];
}
const ITEM_TYPE_TO_DATA_CATEGORY_MAP = {
  session: 'session',
  sessions: 'session',
  attachment: 'attachment',
  transaction: 'transaction',
  event: 'error',
  client_report: 'internal',
  user_report: 'default',
  profile: 'profile',
  profile_chunk: 'profile',
  replay_event: 'replay',
  replay_recording: 'replay',
  check_in: 'monitor',
  feedback: 'feedback',
  span: 'span',
  raw_security: 'security',
  otel_log: 'log_item'
};

/**
 * Maps the type of an envelope item to a data category.
 */
function envelopeItemTypeToDataCategory(type) {
  return ITEM_TYPE_TO_DATA_CATEGORY_MAP[type];
}

/** Extracts the minimal SDK info from the metadata or an events */
function getSdkMetadataForEnvelopeHeader(metadataOrEvent) {
  if (!metadataOrEvent?.sdk) {
    return;
  }
  const {
    name,
    version
  } = metadataOrEvent.sdk;
  return {
    name,
    version
  };
}

/**
 * Creates event envelope headers, based on event, sdk info and tunnel
 * Note: This function was extracted from the core package to make it available in Replay
 */
function createEventEnvelopeHeaders(event, sdkInfo, tunnel, dsn) {
  const dynamicSamplingContext = event.sdkProcessingMetadata?.dynamicSamplingContext;
  return {
    event_id: event.event_id,
    sent_at: new Date().toISOString(),
    ...(sdkInfo && {
      sdk: sdkInfo
    }),
    ...(!!tunnel && dsn && {
      dsn: (0,_dsn_js__WEBPACK_IMPORTED_MODULE_4__.dsnToString)(dsn)
    }),
    ...(dynamicSamplingContext && {
      trace: (0,_object_js__WEBPACK_IMPORTED_MODULE_3__.dropUndefinedKeys)({
        ...dynamicSamplingContext
      })
    })
  };
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/utils-hoist/error.js":
/*!******************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/utils-hoist/error.js ***!
  \******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SentryError: () => (/* binding */ SentryError)
/* harmony export */ });
/** An error emitted by Sentry SDKs and related utilities. */
class SentryError extends Error {
  constructor(message, logLevel) {
    if (logLevel === void 0) {
      logLevel = 'warn';
    }
    super(message);
    this.message = message;
    this.logLevel = logLevel;
  }
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/utils-hoist/instrument/console.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/utils-hoist/instrument/console.js ***!
  \*******************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addConsoleInstrumentationHandler: () => (/* binding */ addConsoleInstrumentationHandler)
/* harmony export */ });
/* harmony import */ var _logger_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../logger.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/logger.js");
/* harmony import */ var _object_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../object.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/object.js");
/* harmony import */ var _worldwide_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../worldwide.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/worldwide.js");
/* harmony import */ var _handlers_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./handlers.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/instrument/handlers.js");





/**
 * Add an instrumentation handler for when a console.xxx method is called.
 *
 * Use at your own risk, this might break without changelog notice, only used internally.
 * @hidden
 */
function addConsoleInstrumentationHandler(handler) {
  const type = 'console';
  (0,_handlers_js__WEBPACK_IMPORTED_MODULE_0__.addHandler)(type, handler);
  (0,_handlers_js__WEBPACK_IMPORTED_MODULE_0__.maybeInstrument)(type, instrumentConsole);
}
function instrumentConsole() {
  if (!("console" in _worldwide_js__WEBPACK_IMPORTED_MODULE_1__.GLOBAL_OBJ)) {
    return;
  }
  _logger_js__WEBPACK_IMPORTED_MODULE_2__.CONSOLE_LEVELS.forEach(function (level) {
    if (!(level in _worldwide_js__WEBPACK_IMPORTED_MODULE_1__.GLOBAL_OBJ.console)) {
      return;
    }
    (0,_object_js__WEBPACK_IMPORTED_MODULE_3__.fill)(_worldwide_js__WEBPACK_IMPORTED_MODULE_1__.GLOBAL_OBJ.console, level, function (originalConsoleMethod) {
      _logger_js__WEBPACK_IMPORTED_MODULE_2__.originalConsoleMethods[level] = originalConsoleMethod;
      return function () {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        const handlerData = {
          args,
          level
        };
        (0,_handlers_js__WEBPACK_IMPORTED_MODULE_0__.triggerHandlers)('console', handlerData);
        const log = _logger_js__WEBPACK_IMPORTED_MODULE_2__.originalConsoleMethods[level];
        log?.apply(_worldwide_js__WEBPACK_IMPORTED_MODULE_1__.GLOBAL_OBJ.console, args);
      };
    });
  });
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/utils-hoist/instrument/fetch.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/utils-hoist/instrument/fetch.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addFetchEndInstrumentationHandler: () => (/* binding */ addFetchEndInstrumentationHandler),
/* harmony export */   addFetchInstrumentationHandler: () => (/* binding */ addFetchInstrumentationHandler),
/* harmony export */   parseFetchArgs: () => (/* binding */ parseFetchArgs)
/* harmony export */ });
/* harmony import */ var _is_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../is.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/is.js");
/* harmony import */ var _object_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../object.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/object.js");
/* harmony import */ var _supports_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../supports.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/supports.js");
/* harmony import */ var _time_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../time.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/time.js");
/* harmony import */ var _worldwide_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../worldwide.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/worldwide.js");
/* harmony import */ var _handlers_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./handlers.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/instrument/handlers.js");







/**
 * Add an instrumentation handler for when a fetch request happens.
 * The handler function is called once when the request starts and once when it ends,
 * which can be identified by checking if it has an `endTimestamp`.
 *
 * Use at your own risk, this might break without changelog notice, only used internally.
 * @hidden
 */
function addFetchInstrumentationHandler(handler, skipNativeFetchCheck) {
  const type = 'fetch';
  (0,_handlers_js__WEBPACK_IMPORTED_MODULE_0__.addHandler)(type, handler);
  (0,_handlers_js__WEBPACK_IMPORTED_MODULE_0__.maybeInstrument)(type, () => instrumentFetch(undefined, skipNativeFetchCheck));
}

/**
 * Add an instrumentation handler for long-lived fetch requests, like consuming server-sent events (SSE) via fetch.
 * The handler will resolve the request body and emit the actual `endTimestamp`, so that the
 * span can be updated accordingly.
 *
 * Only used internally
 * @hidden
 */
function addFetchEndInstrumentationHandler(handler) {
  const type = 'fetch-body-resolved';
  (0,_handlers_js__WEBPACK_IMPORTED_MODULE_0__.addHandler)(type, handler);
  (0,_handlers_js__WEBPACK_IMPORTED_MODULE_0__.maybeInstrument)(type, () => instrumentFetch(streamHandler));
}
function instrumentFetch(onFetchResolved, skipNativeFetchCheck) {
  if (skipNativeFetchCheck === void 0) {
    skipNativeFetchCheck = false;
  }
  if (skipNativeFetchCheck && !(0,_supports_js__WEBPACK_IMPORTED_MODULE_1__.supportsNativeFetch)()) {
    return;
  }
  (0,_object_js__WEBPACK_IMPORTED_MODULE_2__.fill)(_worldwide_js__WEBPACK_IMPORTED_MODULE_3__.GLOBAL_OBJ, 'fetch', function (originalFetch) {
    return function () {
      // We capture the error right here and not in the Promise error callback because Safari (and probably other
      // browsers too) will wipe the stack trace up to this point, only leaving us with this file which is useless.

      // NOTE: If you are a Sentry user, and you are seeing this stack frame,
      //       it means the error, that was caused by your fetch call did not
      //       have a stack trace, so the SDK backfilled the stack trace so
      //       you can see which fetch call failed.
      const virtualError = new Error();
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      const {
        method,
        url
      } = parseFetchArgs(args);
      const handlerData = {
        args,
        fetchData: {
          method,
          url
        },
        startTimestamp: (0,_time_js__WEBPACK_IMPORTED_MODULE_4__.timestampInSeconds)() * 1000,
        // // Adding the error to be able to fingerprint the failed fetch event in HttpClient instrumentation
        virtualError
      };

      // if there is no callback, fetch is instrumented directly
      if (!onFetchResolved) {
        (0,_handlers_js__WEBPACK_IMPORTED_MODULE_0__.triggerHandlers)('fetch', {
          ...handlerData
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return originalFetch.apply(_worldwide_js__WEBPACK_IMPORTED_MODULE_3__.GLOBAL_OBJ, args).then(async response => {
        if (onFetchResolved) {
          onFetchResolved(response);
        } else {
          (0,_handlers_js__WEBPACK_IMPORTED_MODULE_0__.triggerHandlers)('fetch', {
            ...handlerData,
            endTimestamp: (0,_time_js__WEBPACK_IMPORTED_MODULE_4__.timestampInSeconds)() * 1000,
            response
          });
        }
        return response;
      }, error => {
        (0,_handlers_js__WEBPACK_IMPORTED_MODULE_0__.triggerHandlers)('fetch', {
          ...handlerData,
          endTimestamp: (0,_time_js__WEBPACK_IMPORTED_MODULE_4__.timestampInSeconds)() * 1000,
          error
        });
        if ((0,_is_js__WEBPACK_IMPORTED_MODULE_5__.isError)(error) && error.stack === undefined) {
          // NOTE: If you are a Sentry user, and you are seeing this stack frame,
          //       it means the error, that was caused by your fetch call did not
          //       have a stack trace, so the SDK backfilled the stack trace so
          //       you can see which fetch call failed.
          error.stack = virtualError.stack;
          (0,_object_js__WEBPACK_IMPORTED_MODULE_2__.addNonEnumerableProperty)(error, 'framesToPop', 1);
        }

        // NOTE: If you are a Sentry user, and you are seeing this stack frame,
        //       it means the sentry.javascript SDK caught an error invoking your application code.
        //       This is expected behavior and NOT indicative of a bug with sentry.javascript.
        throw error;
      });
    };
  });
}
async function resolveResponse(res, onFinishedResolving) {
  if (res?.body) {
    const body = res.body;
    const responseReader = body.getReader();

    // Define a maximum duration after which we just cancel
    const maxFetchDurationTimeout = setTimeout(() => {
      body.cancel().then(null, () => {
        // noop
      });
    }, 90 * 1000 // 90s
    );
    let readingActive = true;
    while (readingActive) {
      let chunkTimeout;
      try {
        // abort reading if read op takes more than 5s
        chunkTimeout = setTimeout(() => {
          body.cancel().then(null, () => {
            // noop on error
          });
        }, 5000);

        // This .read() call will reject/throw when we abort due to timeouts through `body.cancel()`
        const {
          done
        } = await responseReader.read();
        clearTimeout(chunkTimeout);
        if (done) {
          onFinishedResolving();
          readingActive = false;
        }
      } catch (error) {
        readingActive = false;
      } finally {
        clearTimeout(chunkTimeout);
      }
    }
    clearTimeout(maxFetchDurationTimeout);
    responseReader.releaseLock();
    body.cancel().then(null, () => {
      // noop on error
    });
  }
}
function streamHandler(response) {
  // clone response for awaiting stream
  let clonedResponseForResolving;
  try {
    clonedResponseForResolving = response.clone();
  } catch {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  resolveResponse(clonedResponseForResolving, () => {
    (0,_handlers_js__WEBPACK_IMPORTED_MODULE_0__.triggerHandlers)('fetch-body-resolved', {
      endTimestamp: (0,_time_js__WEBPACK_IMPORTED_MODULE_4__.timestampInSeconds)() * 1000,
      response
    });
  });
}
function hasProp(obj, prop) {
  return !!obj && typeof obj === 'object' && !!obj[prop];
}
function getUrlFromResource(resource) {
  if (typeof resource === 'string') {
    return resource;
  }
  if (!resource) {
    return '';
  }
  if (hasProp(resource, 'url')) {
    return resource.url;
  }
  if (resource.toString) {
    return resource.toString();
  }
  return '';
}

/**
 * Parses the fetch arguments to find the used Http method and the url of the request.
 * Exported for tests only.
 */
function parseFetchArgs(fetchArgs) {
  if (fetchArgs.length === 0) {
    return {
      method: 'GET',
      url: ''
    };
  }
  if (fetchArgs.length === 2) {
    const [url, options] = fetchArgs;
    return {
      url: getUrlFromResource(url),
      method: hasProp(options, 'method') ? String(options.method).toUpperCase() : 'GET'
    };
  }
  const arg = fetchArgs[0];
  return {
    url: getUrlFromResource(arg),
    method: hasProp(arg, 'method') ? String(arg.method).toUpperCase() : 'GET'
  };
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/utils-hoist/instrument/globalError.js":
/*!***********************************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/utils-hoist/instrument/globalError.js ***!
  \***********************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addGlobalErrorInstrumentationHandler: () => (/* binding */ addGlobalErrorInstrumentationHandler)
/* harmony export */ });
/* harmony import */ var _worldwide_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../worldwide.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/worldwide.js");
/* harmony import */ var _handlers_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./handlers.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/instrument/handlers.js");


let _oldOnErrorHandler = null;

/**
 * Add an instrumentation handler for when an error is captured by the global error handler.
 *
 * Use at your own risk, this might break without changelog notice, only used internally.
 * @hidden
 */
function addGlobalErrorInstrumentationHandler(handler) {
  const type = 'error';
  (0,_handlers_js__WEBPACK_IMPORTED_MODULE_0__.addHandler)(type, handler);
  (0,_handlers_js__WEBPACK_IMPORTED_MODULE_0__.maybeInstrument)(type, instrumentError);
}
function instrumentError() {
  _oldOnErrorHandler = _worldwide_js__WEBPACK_IMPORTED_MODULE_1__.GLOBAL_OBJ.onerror;

  // Note: The reason we are doing window.onerror instead of window.addEventListener('error')
  // is that we are using this handler in the Loader Script, to handle buffered errors consistently
  _worldwide_js__WEBPACK_IMPORTED_MODULE_1__.GLOBAL_OBJ.onerror = function (msg, url, line, column, error) {
    const handlerData = {
      column,
      error,
      line,
      msg,
      url
    };
    (0,_handlers_js__WEBPACK_IMPORTED_MODULE_0__.triggerHandlers)('error', handlerData);
    if (_oldOnErrorHandler) {
      // eslint-disable-next-line prefer-rest-params
      return _oldOnErrorHandler.apply(this, arguments);
    }
    return false;
  };
  _worldwide_js__WEBPACK_IMPORTED_MODULE_1__.GLOBAL_OBJ.onerror.__SENTRY_INSTRUMENTED__ = true;
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/utils-hoist/instrument/globalUnhandledRejection.js":
/*!************************************************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/utils-hoist/instrument/globalUnhandledRejection.js ***!
  \************************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addGlobalUnhandledRejectionInstrumentationHandler: () => (/* binding */ addGlobalUnhandledRejectionInstrumentationHandler)
/* harmony export */ });
/* harmony import */ var _worldwide_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../worldwide.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/worldwide.js");
/* harmony import */ var _handlers_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./handlers.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/instrument/handlers.js");


let _oldOnUnhandledRejectionHandler = null;

/**
 * Add an instrumentation handler for when an unhandled promise rejection is captured.
 *
 * Use at your own risk, this might break without changelog notice, only used internally.
 * @hidden
 */
function addGlobalUnhandledRejectionInstrumentationHandler(handler) {
  const type = 'unhandledrejection';
  (0,_handlers_js__WEBPACK_IMPORTED_MODULE_0__.addHandler)(type, handler);
  (0,_handlers_js__WEBPACK_IMPORTED_MODULE_0__.maybeInstrument)(type, instrumentUnhandledRejection);
}
function instrumentUnhandledRejection() {
  _oldOnUnhandledRejectionHandler = _worldwide_js__WEBPACK_IMPORTED_MODULE_1__.GLOBAL_OBJ.onunhandledrejection;

  // Note: The reason we are doing window.onunhandledrejection instead of window.addEventListener('unhandledrejection')
  // is that we are using this handler in the Loader Script, to handle buffered rejections consistently
  _worldwide_js__WEBPACK_IMPORTED_MODULE_1__.GLOBAL_OBJ.onunhandledrejection = function (e) {
    const handlerData = e;
    (0,_handlers_js__WEBPACK_IMPORTED_MODULE_0__.triggerHandlers)('unhandledrejection', handlerData);
    if (_oldOnUnhandledRejectionHandler) {
      // eslint-disable-next-line prefer-rest-params
      return _oldOnUnhandledRejectionHandler.apply(this, arguments);
    }
    return true;
  };
  _worldwide_js__WEBPACK_IMPORTED_MODULE_1__.GLOBAL_OBJ.onunhandledrejection.__SENTRY_INSTRUMENTED__ = true;
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/utils-hoist/instrument/handlers.js":
/*!********************************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/utils-hoist/instrument/handlers.js ***!
  \********************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addHandler: () => (/* binding */ addHandler),
/* harmony export */   maybeInstrument: () => (/* binding */ maybeInstrument),
/* harmony export */   resetInstrumentationHandlers: () => (/* binding */ resetInstrumentationHandlers),
/* harmony export */   triggerHandlers: () => (/* binding */ triggerHandlers)
/* harmony export */ });
/* harmony import */ var _debug_build_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../debug-build.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/debug-build.js");
/* harmony import */ var _logger_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../logger.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/logger.js");
/* harmony import */ var _stacktrace_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../stacktrace.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/stacktrace.js");




// We keep the handlers globally
const handlers = {};
const instrumented = {};

/** Add a handler function. */
function addHandler(type, handler) {
  handlers[type] = handlers[type] || [];
  handlers[type].push(handler);
}

/**
 * Reset all instrumentation handlers.
 * This can be used by tests to ensure we have a clean slate of instrumentation handlers.
 */
function resetInstrumentationHandlers() {
  Object.keys(handlers).forEach(key => {
    handlers[key] = undefined;
  });
}

/** Maybe run an instrumentation function, unless it was already called. */
function maybeInstrument(type, instrumentFn) {
  if (!instrumented[type]) {
    instrumented[type] = true;
    try {
      instrumentFn();
    } catch (e) {
      _debug_build_js__WEBPACK_IMPORTED_MODULE_0__.DEBUG_BUILD && _logger_js__WEBPACK_IMPORTED_MODULE_1__.logger.error(`Error while instrumenting ${type}`, e);
    }
  }
}

/** Trigger handlers for a given instrumentation type. */
function triggerHandlers(type, data) {
  const typeHandlers = type && handlers[type];
  if (!typeHandlers) {
    return;
  }
  for (const handler of typeHandlers) {
    try {
      handler(data);
    } catch (e) {
      _debug_build_js__WEBPACK_IMPORTED_MODULE_0__.DEBUG_BUILD && _logger_js__WEBPACK_IMPORTED_MODULE_1__.logger.error(`Error while triggering instrumentation handler.\nType: ${type}\nName: ${(0,_stacktrace_js__WEBPACK_IMPORTED_MODULE_2__.getFunctionName)(handler)}\nError:`, e);
    }
  }
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/utils-hoist/is.js":
/*!***************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/utils-hoist/is.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isDOMError: () => (/* binding */ isDOMError),
/* harmony export */   isDOMException: () => (/* binding */ isDOMException),
/* harmony export */   isElement: () => (/* binding */ isElement),
/* harmony export */   isError: () => (/* binding */ isError),
/* harmony export */   isErrorEvent: () => (/* binding */ isErrorEvent),
/* harmony export */   isEvent: () => (/* binding */ isEvent),
/* harmony export */   isInstanceOf: () => (/* binding */ isInstanceOf),
/* harmony export */   isParameterizedString: () => (/* binding */ isParameterizedString),
/* harmony export */   isPlainObject: () => (/* binding */ isPlainObject),
/* harmony export */   isPrimitive: () => (/* binding */ isPrimitive),
/* harmony export */   isRegExp: () => (/* binding */ isRegExp),
/* harmony export */   isString: () => (/* binding */ isString),
/* harmony export */   isSyntheticEvent: () => (/* binding */ isSyntheticEvent),
/* harmony export */   isThenable: () => (/* binding */ isThenable),
/* harmony export */   isVueViewModel: () => (/* binding */ isVueViewModel)
/* harmony export */ });
// eslint-disable-next-line @typescript-eslint/unbound-method
const objectToString = Object.prototype.toString;

/**
 * Checks whether given value's type is one of a few Error or Error-like
 * {@link isError}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isError(wat) {
  switch (objectToString.call(wat)) {
    case '[object Error]':
    case '[object Exception]':
    case '[object DOMException]':
    case '[object WebAssembly.Exception]':
      return true;
    default:
      return isInstanceOf(wat, Error);
  }
}
/**
 * Checks whether given value is an instance of the given built-in class.
 *
 * @param wat The value to be checked
 * @param className
 * @returns A boolean representing the result.
 */
function isBuiltin(wat, className) {
  return objectToString.call(wat) === `[object ${className}]`;
}

/**
 * Checks whether given value's type is ErrorEvent
 * {@link isErrorEvent}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isErrorEvent(wat) {
  return isBuiltin(wat, 'ErrorEvent');
}

/**
 * Checks whether given value's type is DOMError
 * {@link isDOMError}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isDOMError(wat) {
  return isBuiltin(wat, 'DOMError');
}

/**
 * Checks whether given value's type is DOMException
 * {@link isDOMException}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isDOMException(wat) {
  return isBuiltin(wat, 'DOMException');
}

/**
 * Checks whether given value's type is a string
 * {@link isString}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isString(wat) {
  return isBuiltin(wat, 'String');
}

/**
 * Checks whether given string is parameterized
 * {@link isParameterizedString}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isParameterizedString(wat) {
  return typeof wat === 'object' && wat !== null && '__sentry_template_string__' in wat && '__sentry_template_values__' in wat;
}

/**
 * Checks whether given value is a primitive (undefined, null, number, boolean, string, bigint, symbol)
 * {@link isPrimitive}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isPrimitive(wat) {
  return wat === null || isParameterizedString(wat) || typeof wat !== 'object' && typeof wat !== 'function';
}

/**
 * Checks whether given value's type is an object literal, or a class instance.
 * {@link isPlainObject}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isPlainObject(wat) {
  return isBuiltin(wat, 'Object');
}

/**
 * Checks whether given value's type is an Event instance
 * {@link isEvent}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isEvent(wat) {
  return typeof Event !== 'undefined' && isInstanceOf(wat, Event);
}

/**
 * Checks whether given value's type is an Element instance
 * {@link isElement}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isElement(wat) {
  return typeof Element !== 'undefined' && isInstanceOf(wat, Element);
}

/**
 * Checks whether given value's type is an regexp
 * {@link isRegExp}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isRegExp(wat) {
  return isBuiltin(wat, 'RegExp');
}

/**
 * Checks whether given value has a then function.
 * @param wat A value to be checked.
 */
function isThenable(wat) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return Boolean(wat?.then && typeof wat.then === 'function');
}

/**
 * Checks whether given value's type is a SyntheticEvent
 * {@link isSyntheticEvent}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isSyntheticEvent(wat) {
  return isPlainObject(wat) && 'nativeEvent' in wat && 'preventDefault' in wat && 'stopPropagation' in wat;
}

/**
 * Checks whether given value's type is an instance of provided constructor.
 * {@link isInstanceOf}.
 *
 * @param wat A value to be checked.
 * @param base A constructor to be used in a check.
 * @returns A boolean representing the result.
 */
function isInstanceOf(wat, base) {
  try {
    return wat instanceof base;
  } catch (_e) {
    return false;
  }
}

/**
 * Checks whether given value's type is a Vue ViewModel.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isVueViewModel(wat) {
  // Not using Object.prototype.toString because in Vue 3 it would read the instance's Symbol(Symbol.toStringTag) property.
  return !!(typeof wat === 'object' && wat !== null && (wat.__isVue || wat._isVue));
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/utils-hoist/logger.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/utils-hoist/logger.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CONSOLE_LEVELS: () => (/* binding */ CONSOLE_LEVELS),
/* harmony export */   consoleSandbox: () => (/* binding */ consoleSandbox),
/* harmony export */   logger: () => (/* binding */ logger),
/* harmony export */   originalConsoleMethods: () => (/* binding */ originalConsoleMethods)
/* harmony export */ });
/* harmony import */ var _carrier_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../carrier.js */ "./node_modules/@sentry/core/build/esm/carrier.js");
/* harmony import */ var _debug_build_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./debug-build.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/debug-build.js");
/* harmony import */ var _worldwide_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./worldwide.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/worldwide.js");




/** Prefix for logging strings */
const PREFIX = 'Sentry Logger ';
const CONSOLE_LEVELS = ['debug', 'info', 'warn', 'error', 'log', 'assert', 'trace'];

/** This may be mutated by the console instrumentation. */
const originalConsoleMethods = {};

/** A Sentry Logger instance. */

/**
 * Temporarily disable sentry console instrumentations.
 *
 * @param callback The function to run against the original `console` messages
 * @returns The results of the callback
 */
function consoleSandbox(callback) {
  if (!("console" in _worldwide_js__WEBPACK_IMPORTED_MODULE_0__.GLOBAL_OBJ)) {
    return callback();
  }
  const console = _worldwide_js__WEBPACK_IMPORTED_MODULE_0__.GLOBAL_OBJ.console;
  const wrappedFuncs = {};
  const wrappedLevels = Object.keys(originalConsoleMethods);

  // Restore all wrapped console methods
  wrappedLevels.forEach(level => {
    const originalConsoleMethod = originalConsoleMethods[level];
    wrappedFuncs[level] = console[level];
    console[level] = originalConsoleMethod;
  });
  try {
    return callback();
  } finally {
    // Revert restoration to wrapped state
    wrappedLevels.forEach(level => {
      console[level] = wrappedFuncs[level];
    });
  }
}
function makeLogger() {
  let enabled = false;
  const logger = {
    enable: () => {
      enabled = true;
    },
    disable: () => {
      enabled = false;
    },
    isEnabled: () => enabled
  };
  if (_debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD) {
    CONSOLE_LEVELS.forEach(name => {
      logger[name] = function () {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        if (enabled) {
          consoleSandbox(() => {
            _worldwide_js__WEBPACK_IMPORTED_MODULE_0__.GLOBAL_OBJ.console[name](`${PREFIX}[${name}]:`, ...args);
          });
        }
      };
    });
  } else {
    CONSOLE_LEVELS.forEach(name => {
      logger[name] = () => undefined;
    });
  }
  return logger;
}

/**
 * This is a logger singleton which either logs things or no-ops if logging is not enabled.
 * The logger is a singleton on the carrier, to ensure that a consistent logger is used throughout the SDK.
 */
const logger = (0,_carrier_js__WEBPACK_IMPORTED_MODULE_2__.getGlobalSingleton)('logger', makeLogger);


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/utils-hoist/misc.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/utils-hoist/misc.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addContextToFrame: () => (/* binding */ addContextToFrame),
/* harmony export */   addExceptionMechanism: () => (/* binding */ addExceptionMechanism),
/* harmony export */   addExceptionTypeValue: () => (/* binding */ addExceptionTypeValue),
/* harmony export */   checkOrSetAlreadyCaught: () => (/* binding */ checkOrSetAlreadyCaught),
/* harmony export */   getEventDescription: () => (/* binding */ getEventDescription),
/* harmony export */   parseSemver: () => (/* binding */ parseSemver),
/* harmony export */   uuid4: () => (/* binding */ uuid4)
/* harmony export */ });
/* harmony import */ var _object_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./object.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/object.js");
/* harmony import */ var _string_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./string.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/string.js");
/* harmony import */ var _worldwide_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./worldwide.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/worldwide.js");



function getCrypto() {
  const gbl = _worldwide_js__WEBPACK_IMPORTED_MODULE_0__.GLOBAL_OBJ;
  return gbl.crypto || gbl.msCrypto;
}

/**
 * UUID4 generator
 * @param crypto Object that provides the crypto API.
 * @returns string Generated UUID4.
 */
function uuid4(crypto) {
  if (crypto === void 0) {
    crypto = getCrypto();
  }
  let getRandomByte = () => Math.random() * 16;
  try {
    if (crypto?.randomUUID) {
      return crypto.randomUUID().replace(/-/g, '');
    }
    if (crypto?.getRandomValues) {
      getRandomByte = () => {
        // crypto.getRandomValues might return undefined instead of the typed array
        // in old Chromium versions (e.g. 23.0.1235.0 (151422))
        // However, `typedArray` is still filled in-place.
        // @see https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues#typedarray
        const typedArray = new Uint8Array(1);
        crypto.getRandomValues(typedArray);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return typedArray[0];
      };
    }
  } catch (_) {
    // some runtimes can crash invoking crypto
    // https://github.com/getsentry/sentry-javascript/issues/8935
  }

  // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/2117523#2117523
  // Concatenating the following numbers as strings results in '10000000100040008000100000000000'
  return ([1e7] + 1e3 + 4e3 + 8e3 + 1e11).replace(/[018]/g, c =>
  // eslint-disable-next-line no-bitwise
  (c ^ (getRandomByte() & 15) >> c / 4).toString(16));
}
function getFirstException(event) {
  return event.exception?.values?.[0];
}

/**
 * Extracts either message or type+value from an event that can be used for user-facing logs
 * @returns event's description
 */
function getEventDescription(event) {
  const {
    message,
    event_id: eventId
  } = event;
  if (message) {
    return message;
  }
  const firstException = getFirstException(event);
  if (firstException) {
    if (firstException.type && firstException.value) {
      return `${firstException.type}: ${firstException.value}`;
    }
    return firstException.type || firstException.value || eventId || '<unknown>';
  }
  return eventId || '<unknown>';
}

/**
 * Adds exception values, type and value to an synthetic Exception.
 * @param event The event to modify.
 * @param value Value of the exception.
 * @param type Type of the exception.
 * @hidden
 */
function addExceptionTypeValue(event, value, type) {
  const exception = event.exception = event.exception || {};
  const values = exception.values = exception.values || [];
  const firstException = values[0] = values[0] || {};
  if (!firstException.value) {
    firstException.value = value || '';
  }
  if (!firstException.type) {
    firstException.type = type || 'Error';
  }
}

/**
 * Adds exception mechanism data to a given event. Uses defaults if the second parameter is not passed.
 *
 * @param event The event to modify.
 * @param newMechanism Mechanism data to add to the event.
 * @hidden
 */
function addExceptionMechanism(event, newMechanism) {
  const firstException = getFirstException(event);
  if (!firstException) {
    return;
  }
  const defaultMechanism = {
    type: 'generic',
    handled: true
  };
  const currentMechanism = firstException.mechanism;
  firstException.mechanism = {
    ...defaultMechanism,
    ...currentMechanism,
    ...newMechanism
  };
  if (newMechanism && 'data' in newMechanism) {
    const mergedData = {
      ...currentMechanism?.data,
      ...newMechanism.data
    };
    firstException.mechanism.data = mergedData;
  }
}

// https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
const SEMVER_REGEXP = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

/**
 * Represents Semantic Versioning object
 */

function _parseInt(input) {
  return parseInt(input || '', 10);
}

/**
 * Parses input into a SemVer interface
 * @param input string representation of a semver version
 */
function parseSemver(input) {
  const match = input.match(SEMVER_REGEXP) || [];
  const major = _parseInt(match[1]);
  const minor = _parseInt(match[2]);
  const patch = _parseInt(match[3]);
  return {
    buildmetadata: match[5],
    major: isNaN(major) ? undefined : major,
    minor: isNaN(minor) ? undefined : minor,
    patch: isNaN(patch) ? undefined : patch,
    prerelease: match[4]
  };
}

/**
 * This function adds context (pre/post/line) lines to the provided frame
 *
 * @param lines string[] containing all lines
 * @param frame StackFrame that will be mutated
 * @param linesOfContext number of context lines we want to add pre/post
 */
function addContextToFrame(lines, frame, linesOfContext) {
  if (linesOfContext === void 0) {
    linesOfContext = 5;
  }
  // When there is no line number in the frame, attaching context is nonsensical and will even break grouping
  if (frame.lineno === undefined) {
    return;
  }
  const maxLines = lines.length;
  const sourceLine = Math.max(Math.min(maxLines - 1, frame.lineno - 1), 0);
  frame.pre_context = lines.slice(Math.max(0, sourceLine - linesOfContext), sourceLine).map(line => (0,_string_js__WEBPACK_IMPORTED_MODULE_1__.snipLine)(line, 0));

  // We guard here to ensure this is not larger than the existing number of lines
  const lineIndex = Math.min(maxLines - 1, sourceLine);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  frame.context_line = (0,_string_js__WEBPACK_IMPORTED_MODULE_1__.snipLine)(lines[lineIndex], frame.colno || 0);
  frame.post_context = lines.slice(Math.min(sourceLine + 1, maxLines), sourceLine + 1 + linesOfContext).map(line => (0,_string_js__WEBPACK_IMPORTED_MODULE_1__.snipLine)(line, 0));
}

/**
 * Checks whether or not we've already captured the given exception (note: not an identical exception - the very object
 * in question), and marks it captured if not.
 *
 * This is useful because it's possible for an error to get captured by more than one mechanism. After we intercept and
 * record an error, we rethrow it (assuming we've intercepted it before it's reached the top-level global handlers), so
 * that we don't interfere with whatever effects the error might have had were the SDK not there. At that point, because
 * the error has been rethrown, it's possible for it to bubble up to some other code we've instrumented. If it's not
 * caught after that, it will bubble all the way up to the global handlers (which of course we also instrument). This
 * function helps us ensure that even if we encounter the same error more than once, we only record it the first time we
 * see it.
 *
 * Note: It will ignore primitives (always return `false` and not mark them as seen), as properties can't be set on
 * them. {@link: Object.objectify} can be used on exceptions to convert any that are primitives into their equivalent
 * object wrapper forms so that this check will always work. However, because we need to flag the exact object which
 * will get rethrown, and because that rethrowing happens outside of the event processing pipeline, the objectification
 * must be done before the exception captured.
 *
 * @param A thrown exception to check or flag as having been seen
 * @returns `true` if the exception has already been captured, `false` if not (with the side effect of marking it seen)
 */
function checkOrSetAlreadyCaught(exception) {
  if (isAlreadyCaptured(exception)) {
    return true;
  }
  try {
    // set it this way rather than by assignment so that it's not ennumerable and therefore isn't recorded by the
    // `ExtraErrorData` integration
    (0,_object_js__WEBPACK_IMPORTED_MODULE_2__.addNonEnumerableProperty)(exception, '__sentry_captured__', true);
  } catch (err) {
    // `exception` is a primitive, so we can't mark it seen
  }
  return false;
}
function isAlreadyCaptured(exception) {
  try {
    return exception.__sentry_captured__;
  } catch {} // eslint-disable-line no-empty
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/utils-hoist/normalize.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/utils-hoist/normalize.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   normalize: () => (/* binding */ normalize),
/* harmony export */   normalizeToSize: () => (/* binding */ normalizeToSize),
/* harmony export */   normalizeUrlToBase: () => (/* binding */ normalizeUrlToBase)
/* harmony export */ });
/* harmony import */ var _is_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./is.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/is.js");
/* harmony import */ var _object_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./object.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/object.js");
/* harmony import */ var _stacktrace_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./stacktrace.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/stacktrace.js");




/**
 * Recursively normalizes the given object.
 *
 * - Creates a copy to prevent original input mutation
 * - Skips non-enumerable properties
 * - When stringifying, calls `toJSON` if implemented
 * - Removes circular references
 * - Translates non-serializable values (`undefined`/`NaN`/functions) to serializable format
 * - Translates known global objects/classes to a string representations
 * - Takes care of `Error` object serialization
 * - Optionally limits depth of final output
 * - Optionally limits number of properties/elements included in any single object/array
 *
 * @param input The object to be normalized.
 * @param depth The max depth to which to normalize the object. (Anything deeper stringified whole.)
 * @param maxProperties The max number of elements or properties to be included in any single array or
 * object in the normalized output.
 * @returns A normalized version of the object, or `"**non-serializable**"` if any errors are thrown during normalization.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalize(input, depth, maxProperties) {
  if (depth === void 0) {
    depth = 100;
  }
  if (maxProperties === void 0) {
    maxProperties = +Infinity;
  }
  try {
    // since we're at the outermost level, we don't provide a key
    return visit('', input, depth, maxProperties);
  } catch (err) {
    return {
      ERROR: `**non-serializable** (${err})`
    };
  }
}

/** JSDoc */
function normalizeToSize(
// eslint-disable-next-line @typescript-eslint/no-explicit-any
object,
// Default Node.js REPL depth
depth,
// 100kB, as 200kB is max payload size, so half sounds reasonable
maxSize) {
  if (depth === void 0) {
    depth = 3;
  }
  if (maxSize === void 0) {
    maxSize = 100 * 1024;
  }
  const normalized = normalize(object, depth);
  if (jsonSize(normalized) > maxSize) {
    return normalizeToSize(object, depth - 1, maxSize);
  }
  return normalized;
}

/**
 * Visits a node to perform normalization on it
 *
 * @param key The key corresponding to the given node
 * @param value The node to be visited
 * @param depth Optional number indicating the maximum recursion depth
 * @param maxProperties Optional maximum number of properties/elements included in any single object/array
 * @param memo Optional Memo class handling decycling
 */
function visit(key, value, depth, maxProperties, memo) {
  if (depth === void 0) {
    depth = +Infinity;
  }
  if (maxProperties === void 0) {
    maxProperties = +Infinity;
  }
  if (memo === void 0) {
    memo = memoBuilder();
  }
  const [memoize, unmemoize] = memo;

  // Get the simple cases out of the way first
  if (value == null ||
  // this matches null and undefined -> eqeq not eqeqeq
  ['boolean', 'string'].includes(typeof value) || typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  const stringified = stringifyValue(key, value);

  // Anything we could potentially dig into more (objects or arrays) will have come back as `"[object XXXX]"`.
  // Everything else will have already been serialized, so if we don't see that pattern, we're done.
  if (!stringified.startsWith('[object ')) {
    return stringified;
  }

  // From here on, we can assert that `value` is either an object or an array.

  // Do not normalize objects that we know have already been normalized. As a general rule, the
  // "__sentry_skip_normalization__" property should only be used sparingly and only should only be set on objects that
  // have already been normalized.
  if (value['__sentry_skip_normalization__']) {
    return value;
  }

  // We can set `__sentry_override_normalization_depth__` on an object to ensure that from there
  // We keep a certain amount of depth.
  // This should be used sparingly, e.g. we use it for the redux integration to ensure we get a certain amount of state.
  const remainingDepth = typeof value['__sentry_override_normalization_depth__'] === 'number' ? value['__sentry_override_normalization_depth__'] : depth;

  // We're also done if we've reached the max depth
  if (remainingDepth === 0) {
    // At this point we know `serialized` is a string of the form `"[object XXXX]"`. Clean it up so it's just `"[XXXX]"`.
    return stringified.replace('object ', '');
  }

  // If we've already visited this branch, bail out, as it's circular reference. If not, note that we're seeing it now.
  if (memoize(value)) {
    return '[Circular ~]';
  }

  // If the value has a `toJSON` method, we call it to extract more information
  const valueWithToJSON = value;
  if (valueWithToJSON && typeof valueWithToJSON.toJSON === 'function') {
    try {
      const jsonValue = valueWithToJSON.toJSON();
      // We need to normalize the return value of `.toJSON()` in case it has circular references
      return visit('', jsonValue, remainingDepth - 1, maxProperties, memo);
    } catch (err) {
      // pass (The built-in `toJSON` failed, but we can still try to do it ourselves)
    }
  }

  // At this point we know we either have an object or an array, we haven't seen it before, and we're going to recurse
  // because we haven't yet reached the max depth. Create an accumulator to hold the results of visiting each
  // property/entry, and keep track of the number of items we add to it.
  const normalized = Array.isArray(value) ? [] : {};
  let numAdded = 0;

  // Before we begin, convert`Error` and`Event` instances into plain objects, since some of each of their relevant
  // properties are non-enumerable and otherwise would get missed.
  const visitable = (0,_object_js__WEBPACK_IMPORTED_MODULE_0__.convertToPlainObject)(value);
  for (const visitKey in visitable) {
    // Avoid iterating over fields in the prototype if they've somehow been exposed to enumeration.
    if (!Object.prototype.hasOwnProperty.call(visitable, visitKey)) {
      continue;
    }
    if (numAdded >= maxProperties) {
      normalized[visitKey] = '[MaxProperties ~]';
      break;
    }

    // Recursively visit all the child nodes
    const visitValue = visitable[visitKey];
    normalized[visitKey] = visit(visitKey, visitValue, remainingDepth - 1, maxProperties, memo);
    numAdded++;
  }

  // Once we've visited all the branches, remove the parent from memo storage
  unmemoize(value);

  // Return accumulated values
  return normalized;
}

/* eslint-disable complexity */
/**
 * Stringify the given value. Handles various known special values and types.
 *
 * Not meant to be used on simple primitives which already have a string representation, as it will, for example, turn
 * the number 1231 into "[Object Number]", nor on `null`, as it will throw.
 *
 * @param value The value to stringify
 * @returns A stringified representation of the given value
 */
function stringifyValue(key,
// this type is a tiny bit of a cheat, since this function does handle NaN (which is technically a number), but for
// our internal use, it'll do
value) {
  try {
    if (key === 'domain' && value && typeof value === 'object' && value._events) {
      return '[Domain]';
    }
    if (key === 'domainEmitter') {
      return '[DomainEmitter]';
    }

    // It's safe to use `global`, `window`, and `document` here in this manner, as we are asserting using `typeof` first
    // which won't throw if they are not present.

    if (typeof global !== 'undefined' && value === global) {
      return '[Global]';
    }

    // eslint-disable-next-line no-restricted-globals
    if (typeof window !== 'undefined' && value === window) {
      return '[Window]';
    }

    // eslint-disable-next-line no-restricted-globals
    if (typeof document !== 'undefined' && value === document) {
      return '[Document]';
    }
    if ((0,_is_js__WEBPACK_IMPORTED_MODULE_1__.isVueViewModel)(value)) {
      return '[VueViewModel]';
    }

    // React's SyntheticEvent thingy
    if ((0,_is_js__WEBPACK_IMPORTED_MODULE_1__.isSyntheticEvent)(value)) {
      return '[SyntheticEvent]';
    }
    if (typeof value === 'number' && !Number.isFinite(value)) {
      return `[${value}]`;
    }
    if (typeof value === 'function') {
      return `[Function: ${(0,_stacktrace_js__WEBPACK_IMPORTED_MODULE_2__.getFunctionName)(value)}]`;
    }
    if (typeof value === 'symbol') {
      return `[${String(value)}]`;
    }

    // stringified BigInts are indistinguishable from regular numbers, so we need to label them to avoid confusion
    if (typeof value === 'bigint') {
      return `[BigInt: ${String(value)}]`;
    }

    // Now that we've knocked out all the special cases and the primitives, all we have left are objects. Simply casting
    // them to strings means that instances of classes which haven't defined their `toStringTag` will just come out as
    // `"[object Object]"`. If we instead look at the constructor's name (which is the same as the name of the class),
    // we can make sure that only plain objects come out that way.
    const objName = getConstructorName(value);

    // Handle HTML Elements
    if (/^HTML(\w*)Element$/.test(objName)) {
      return `[HTMLElement: ${objName}]`;
    }
    return `[object ${objName}]`;
  } catch (err) {
    return `**non-serializable** (${err})`;
  }
}
/* eslint-enable complexity */

function getConstructorName(value) {
  const prototype = Object.getPrototypeOf(value);
  return prototype?.constructor ? prototype.constructor.name : 'null prototype';
}

/** Calculates bytes size of input string */
function utf8Length(value) {
  // eslint-disable-next-line no-bitwise
  return ~-encodeURI(value).split(/%..|./).length;
}

/** Calculates bytes size of input object */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function jsonSize(value) {
  return utf8Length(JSON.stringify(value));
}

/**
 * Normalizes URLs in exceptions and stacktraces to a base path so Sentry can fingerprint
 * across platforms and working directory.
 *
 * @param url The URL to be normalized.
 * @param basePath The application base path.
 * @returns The normalized URL.
 */
function normalizeUrlToBase(url, basePath) {
  const escapedBase = basePath
  // Backslash to forward
  .replace(/\\/g, '/')
  // Escape RegExp special characters
  .replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
  let newUrl = url;
  try {
    newUrl = decodeURI(url);
  } catch (_Oo) {
    // Sometime this breaks
  }
  return newUrl.replace(/\\/g, '/').replace(/webpack:\/?/g, '') // Remove intermediate base path
  // eslint-disable-next-line @sentry-internal/sdk/no-regexp-constructor
  .replace(new RegExp(`(file://)?/*${escapedBase}/*`, 'ig'), 'app:///');
}

/**
 * Helper to decycle json objects
 */
function memoBuilder() {
  const inner = new WeakSet();
  function memoize(obj) {
    if (inner.has(obj)) {
      return true;
    }
    inner.add(obj);
    return false;
  }
  function unmemoize(obj) {
    inner.delete(obj);
  }
  return [memoize, unmemoize];
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/utils-hoist/object.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/utils-hoist/object.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addNonEnumerableProperty: () => (/* binding */ addNonEnumerableProperty),
/* harmony export */   convertToPlainObject: () => (/* binding */ convertToPlainObject),
/* harmony export */   dropUndefinedKeys: () => (/* binding */ dropUndefinedKeys),
/* harmony export */   extractExceptionKeysForMessage: () => (/* binding */ extractExceptionKeysForMessage),
/* harmony export */   fill: () => (/* binding */ fill),
/* harmony export */   getOriginalFunction: () => (/* binding */ getOriginalFunction),
/* harmony export */   markFunctionWrapped: () => (/* binding */ markFunctionWrapped),
/* harmony export */   objectify: () => (/* binding */ objectify)
/* harmony export */ });
/* harmony import */ var _browser_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./browser.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/browser.js");
/* harmony import */ var _debug_build_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./debug-build.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/debug-build.js");
/* harmony import */ var _is_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./is.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/is.js");
/* harmony import */ var _logger_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./logger.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/logger.js");
/* harmony import */ var _string_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./string.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/string.js");






/**
 * Replace a method in an object with a wrapped version of itself.
 *
 * If the method on the passed object is not a function, the wrapper will not be applied.
 *
 * @param source An object that contains a method to be wrapped.
 * @param name The name of the method to be wrapped.
 * @param replacementFactory A higher-order function that takes the original version of the given method and returns a
 * wrapped version. Note: The function returned by `replacementFactory` needs to be a non-arrow function, in order to
 * preserve the correct value of `this`, and the original method must be called using `origMethod.call(this, <other
 * args>)` or `origMethod.apply(this, [<other args>])` (rather than being called directly), again to preserve `this`.
 * @returns void
 */
function fill(source, name, replacementFactory) {
  if (!(name in source)) {
    return;
  }

  // explicitly casting to unknown because we don't know the type of the method initially at all
  const original = source[name];
  if (typeof original !== 'function') {
    return;
  }
  const wrapped = replacementFactory(original);

  // Make sure it's a function first, as we need to attach an empty prototype for `defineProperties` to work
  // otherwise it'll throw "TypeError: Object.defineProperties called on non-object"
  if (typeof wrapped === 'function') {
    markFunctionWrapped(wrapped, original);
  }
  try {
    source[name] = wrapped;
  } catch {
    _debug_build_js__WEBPACK_IMPORTED_MODULE_0__.DEBUG_BUILD && _logger_js__WEBPACK_IMPORTED_MODULE_1__.logger.log(`Failed to replace method "${name}" in object`, source);
  }
}

/**
 * Defines a non-enumerable property on the given object.
 *
 * @param obj The object on which to set the property
 * @param name The name of the property to be set
 * @param value The value to which to set the property
 */
function addNonEnumerableProperty(obj, name, value) {
  try {
    Object.defineProperty(obj, name, {
      // enumerable: false, // the default, so we can save on bundle size by not explicitly setting it
      value: value,
      writable: true,
      configurable: true
    });
  } catch (o_O) {
    _debug_build_js__WEBPACK_IMPORTED_MODULE_0__.DEBUG_BUILD && _logger_js__WEBPACK_IMPORTED_MODULE_1__.logger.log(`Failed to add non-enumerable property "${name}" to object`, obj);
  }
}

/**
 * Remembers the original function on the wrapped function and
 * patches up the prototype.
 *
 * @param wrapped the wrapper function
 * @param original the original function that gets wrapped
 */
function markFunctionWrapped(wrapped, original) {
  try {
    const proto = original.prototype || {};
    wrapped.prototype = original.prototype = proto;
    addNonEnumerableProperty(wrapped, '__sentry_original__', original);
  } catch (o_O) {} // eslint-disable-line no-empty
}

/**
 * This extracts the original function if available.  See
 * `markFunctionWrapped` for more information.
 *
 * @param func the function to unwrap
 * @returns the unwrapped version of the function if available.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
function getOriginalFunction(func) {
  return func.__sentry_original__;
}

/**
 * Transforms any `Error` or `Event` into a plain object with all of their enumerable properties, and some of their
 * non-enumerable properties attached.
 *
 * @param value Initial source that we have to transform in order for it to be usable by the serializer
 * @returns An Event or Error turned into an object - or the value argument itself, when value is neither an Event nor
 *  an Error.
 */
function convertToPlainObject(value) {
  if ((0,_is_js__WEBPACK_IMPORTED_MODULE_2__.isError)(value)) {
    return {
      message: value.message,
      name: value.name,
      stack: value.stack,
      ...getOwnProperties(value)
    };
  } else if ((0,_is_js__WEBPACK_IMPORTED_MODULE_2__.isEvent)(value)) {
    const newObj = {
      type: value.type,
      target: serializeEventTarget(value.target),
      currentTarget: serializeEventTarget(value.currentTarget),
      ...getOwnProperties(value)
    };
    if (typeof CustomEvent !== 'undefined' && (0,_is_js__WEBPACK_IMPORTED_MODULE_2__.isInstanceOf)(value, CustomEvent)) {
      newObj.detail = value.detail;
    }
    return newObj;
  } else {
    return value;
  }
}

/** Creates a string representation of the target of an `Event` object */
function serializeEventTarget(target) {
  try {
    return (0,_is_js__WEBPACK_IMPORTED_MODULE_2__.isElement)(target) ? (0,_browser_js__WEBPACK_IMPORTED_MODULE_3__.htmlTreeAsString)(target) : Object.prototype.toString.call(target);
  } catch (_oO) {
    return '<unknown>';
  }
}

/** Filters out all but an object's own properties */
function getOwnProperties(obj) {
  if (typeof obj === 'object' && obj !== null) {
    const extractedProps = {};
    for (const property in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, property)) {
        extractedProps[property] = obj[property];
      }
    }
    return extractedProps;
  } else {
    return {};
  }
}

/**
 * Given any captured exception, extract its keys and create a sorted
 * and truncated list that will be used inside the event message.
 * eg. `Non-error exception captured with keys: foo, bar, baz`
 */
function extractExceptionKeysForMessage(exception, maxLength) {
  if (maxLength === void 0) {
    maxLength = 40;
  }
  const keys = Object.keys(convertToPlainObject(exception));
  keys.sort();
  const firstKey = keys[0];
  if (!firstKey) {
    return '[object has no keys]';
  }
  if (firstKey.length >= maxLength) {
    return (0,_string_js__WEBPACK_IMPORTED_MODULE_4__.truncate)(firstKey, maxLength);
  }
  for (let includedKeys = keys.length; includedKeys > 0; includedKeys--) {
    const serialized = keys.slice(0, includedKeys).join(', ');
    if (serialized.length > maxLength) {
      continue;
    }
    if (includedKeys === keys.length) {
      return serialized;
    }
    return (0,_string_js__WEBPACK_IMPORTED_MODULE_4__.truncate)(serialized, maxLength);
  }
  return '';
}

/**
 * Given any object, return a new object having removed all fields whose value was `undefined`.
 * Works recursively on objects and arrays.
 *
 * Attention: This function keeps circular references in the returned object.
 */
function dropUndefinedKeys(inputValue) {
  // This map keeps track of what already visited nodes map to.
  // Our Set - based memoBuilder doesn't work here because we want to the output object to have the same circular
  // references as the input object.
  const memoizationMap = new Map();

  // This function just proxies `_dropUndefinedKeys` to keep the `memoBuilder` out of this function's API
  return _dropUndefinedKeys(inputValue, memoizationMap);
}
function _dropUndefinedKeys(inputValue, memoizationMap) {
  if (isPojo(inputValue)) {
    // If this node has already been visited due to a circular reference, return the object it was mapped to in the new object
    const memoVal = memoizationMap.get(inputValue);
    if (memoVal !== undefined) {
      return memoVal;
    }
    const returnValue = {};
    // Store the mapping of this value in case we visit it again, in case of circular data
    memoizationMap.set(inputValue, returnValue);
    for (const key of Object.getOwnPropertyNames(inputValue)) {
      if (typeof inputValue[key] !== 'undefined') {
        returnValue[key] = _dropUndefinedKeys(inputValue[key], memoizationMap);
      }
    }
    return returnValue;
  }
  if (Array.isArray(inputValue)) {
    // If this node has already been visited due to a circular reference, return the array it was mapped to in the new object
    const memoVal = memoizationMap.get(inputValue);
    if (memoVal !== undefined) {
      return memoVal;
    }
    const returnValue = [];
    // Store the mapping of this value in case we visit it again, in case of circular data
    memoizationMap.set(inputValue, returnValue);
    inputValue.forEach(item => {
      returnValue.push(_dropUndefinedKeys(item, memoizationMap));
    });
    return returnValue;
  }
  return inputValue;
}
function isPojo(input) {
  if (!(0,_is_js__WEBPACK_IMPORTED_MODULE_2__.isPlainObject)(input)) {
    return false;
  }
  try {
    const name = Object.getPrototypeOf(input).constructor.name;
    return !name || name === 'Object';
  } catch {
    return true;
  }
}

/**
 * Ensure that something is an object.
 *
 * Turns `undefined` and `null` into `String`s and all other primitives into instances of their respective wrapper
 * classes (String, Boolean, Number, etc.). Acts as the identity function on non-primitives.
 *
 * @param wat The subject of the objectification
 * @returns A version of `wat` which can safely be used with `Object` class methods
 */
function objectify(wat) {
  let objectified;
  switch (true) {
    // this will catch both undefined and null
    case wat == undefined:
      objectified = new String(wat);
      break;

    // Though symbols and bigints do have wrapper classes (`Symbol` and `BigInt`, respectively), for whatever reason
    // those classes don't have constructors which can be used with the `new` keyword. We therefore need to cast each as
    // an object in order to wrap it.
    case typeof wat === 'symbol' || typeof wat === 'bigint':
      objectified = Object(wat);
      break;

    // this will catch the remaining primitives: `String`, `Number`, and `Boolean`
    case (0,_is_js__WEBPACK_IMPORTED_MODULE_2__.isPrimitive)(wat):
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      objectified = new wat.constructor(wat);
      break;

    // by process of elimination, at this point we know that `wat` must already be an object
    default:
      objectified = wat;
      break;
  }
  return objectified;
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/utils-hoist/promisebuffer.js":
/*!**************************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/utils-hoist/promisebuffer.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   makePromiseBuffer: () => (/* binding */ makePromiseBuffer)
/* harmony export */ });
/* harmony import */ var _error_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./error.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/error.js");
/* harmony import */ var _syncpromise_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./syncpromise.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/syncpromise.js");



/**
 * Creates an new PromiseBuffer object with the specified limit
 * @param limit max number of promises that can be stored in the buffer
 */
function makePromiseBuffer(limit) {
  const buffer = [];
  function isReady() {
    return limit === undefined || buffer.length < limit;
  }

  /**
   * Remove a promise from the queue.
   *
   * @param task Can be any PromiseLike<T>
   * @returns Removed promise.
   */
  function remove(task) {
    return buffer.splice(buffer.indexOf(task), 1)[0] || Promise.resolve(undefined);
  }

  /**
   * Add a promise (representing an in-flight action) to the queue, and set it to remove itself on fulfillment.
   *
   * @param taskProducer A function producing any PromiseLike<T>; In previous versions this used to be `task:
   *        PromiseLike<T>`, but under that model, Promises were instantly created on the call-site and their executor
   *        functions therefore ran immediately. Thus, even if the buffer was full, the action still happened. By
   *        requiring the promise to be wrapped in a function, we can defer promise creation until after the buffer
   *        limit check.
   * @returns The original promise.
   */
  function add(taskProducer) {
    if (!isReady()) {
      return (0,_syncpromise_js__WEBPACK_IMPORTED_MODULE_0__.rejectedSyncPromise)(new _error_js__WEBPACK_IMPORTED_MODULE_1__.SentryError('Not adding Promise because buffer limit was reached.'));
    }

    // start the task and add its promise to the queue
    const task = taskProducer();
    if (buffer.indexOf(task) === -1) {
      buffer.push(task);
    }
    void task.then(() => remove(task))
    // Use `then(null, rejectionHandler)` rather than `catch(rejectionHandler)` so that we can use `PromiseLike`
    // rather than `Promise`. `PromiseLike` doesn't have a `.catch` method, making its polyfill smaller. (ES5 didn't
    // have promises, so TS has to polyfill when down-compiling.)
    .then(null, () => remove(task).then(null, () => {
      // We have to add another catch here because `remove()` starts a new promise chain.
    }));
    return task;
  }

  /**
   * Wait for all promises in the queue to resolve or for timeout to expire, whichever comes first.
   *
   * @param timeout The time, in ms, after which to resolve to `false` if the queue is still non-empty. Passing `0` (or
   * not passing anything) will make the promise wait as long as it takes for the queue to drain before resolving to
   * `true`.
   * @returns A promise which will resolve to `true` if the queue is already empty or drains before the timeout, and
   * `false` otherwise
   */
  function drain(timeout) {
    return new _syncpromise_js__WEBPACK_IMPORTED_MODULE_0__.SyncPromise((resolve, reject) => {
      let counter = buffer.length;
      if (!counter) {
        return resolve(true);
      }

      // wait for `timeout` ms and then resolve to `false` (if not cancelled first)
      const capturedSetTimeout = setTimeout(() => {
        if (timeout && timeout > 0) {
          resolve(false);
        }
      }, timeout);

      // if all promises resolve in time, cancel the timer and resolve to `true`
      buffer.forEach(item => {
        void (0,_syncpromise_js__WEBPACK_IMPORTED_MODULE_0__.resolvedSyncPromise)(item).then(() => {
          if (! --counter) {
            clearTimeout(capturedSetTimeout);
            resolve(true);
          }
        }, reject);
      });
    });
  }
  return {
    $: buffer,
    add,
    drain
  };
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/utils-hoist/propagationContext.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/utils-hoist/propagationContext.js ***!
  \*******************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   generateSpanId: () => (/* binding */ generateSpanId),
/* harmony export */   generateTraceId: () => (/* binding */ generateTraceId)
/* harmony export */ });
/* harmony import */ var _misc_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./misc.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/misc.js");


/**
 * Generate a random, valid trace ID.
 */
function generateTraceId() {
  return (0,_misc_js__WEBPACK_IMPORTED_MODULE_0__.uuid4)();
}

/**
 * Generate a random, valid span ID.
 */
function generateSpanId() {
  return (0,_misc_js__WEBPACK_IMPORTED_MODULE_0__.uuid4)().substring(16);
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/utils-hoist/ratelimit.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/utils-hoist/ratelimit.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DEFAULT_RETRY_AFTER: () => (/* binding */ DEFAULT_RETRY_AFTER),
/* harmony export */   disabledUntil: () => (/* binding */ disabledUntil),
/* harmony export */   isRateLimited: () => (/* binding */ isRateLimited),
/* harmony export */   parseRetryAfterHeader: () => (/* binding */ parseRetryAfterHeader),
/* harmony export */   updateRateLimits: () => (/* binding */ updateRateLimits)
/* harmony export */ });
// Intentionally keeping the key broad, as we don't know for sure what rate limit headers get returned from backend

const DEFAULT_RETRY_AFTER = 60 * 1000; // 60 seconds

/**
 * Extracts Retry-After value from the request header or returns default value
 * @param header string representation of 'Retry-After' header
 * @param now current unix timestamp
 *
 */
function parseRetryAfterHeader(header, now) {
  if (now === void 0) {
    now = Date.now();
  }
  const headerDelay = parseInt(`${header}`, 10);
  if (!isNaN(headerDelay)) {
    return headerDelay * 1000;
  }
  const headerDate = Date.parse(`${header}`);
  if (!isNaN(headerDate)) {
    return headerDate - now;
  }
  return DEFAULT_RETRY_AFTER;
}

/**
 * Gets the time that the given category is disabled until for rate limiting.
 * In case no category-specific limit is set but a general rate limit across all categories is active,
 * that time is returned.
 *
 * @return the time in ms that the category is disabled until or 0 if there's no active rate limit.
 */
function disabledUntil(limits, dataCategory) {
  return limits[dataCategory] || limits.all || 0;
}

/**
 * Checks if a category is rate limited
 */
function isRateLimited(limits, dataCategory, now) {
  if (now === void 0) {
    now = Date.now();
  }
  return disabledUntil(limits, dataCategory) > now;
}

/**
 * Update ratelimits from incoming headers.
 *
 * @return the updated RateLimits object.
 */
function updateRateLimits(limits, _ref, now) {
  let {
    statusCode,
    headers
  } = _ref;
  if (now === void 0) {
    now = Date.now();
  }
  const updatedRateLimits = {
    ...limits
  };

  // "The name is case-insensitive."
  // https://developer.mozilla.org/en-US/docs/Web/API/Headers/get
  const rateLimitHeader = headers?.['x-sentry-rate-limits'];
  const retryAfterHeader = headers?.['retry-after'];
  if (rateLimitHeader) {
    /**
     * rate limit headers are of the form
     *     <header>,<header>,..
     * where each <header> is of the form
     *     <retry_after>: <categories>: <scope>: <reason_code>: <namespaces>
     * where
     *     <retry_after> is a delay in seconds
     *     <categories> is the event type(s) (error, transaction, etc) being rate limited and is of the form
     *         <category>;<category>;...
     *     <scope> is what's being limited (org, project, or key) - ignored by SDK
     *     <reason_code> is an arbitrary string like "org_quota" - ignored by SDK
     *     <namespaces> Semicolon-separated list of metric namespace identifiers. Defines which namespace(s) will be affected.
     *         Only present if rate limit applies to the metric_bucket data category.
     */
    for (const limit of rateLimitHeader.trim().split(',')) {
      const [retryAfter, categories,,, namespaces] = limit.split(':', 5);
      const headerDelay = parseInt(retryAfter, 10);
      const delay = (!isNaN(headerDelay) ? headerDelay : 60) * 1000; // 60sec default
      if (!categories) {
        updatedRateLimits.all = now + delay;
      } else {
        for (const category of categories.split(';')) {
          if (category === 'metric_bucket') {
            // namespaces will be present when category === 'metric_bucket'
            if (!namespaces || namespaces.split(';').includes('custom')) {
              updatedRateLimits[category] = now + delay;
            }
          } else {
            updatedRateLimits[category] = now + delay;
          }
        }
      }
    }
  } else if (retryAfterHeader) {
    updatedRateLimits.all = now + parseRetryAfterHeader(retryAfterHeader, now);
  } else if (statusCode === 429) {
    updatedRateLimits.all = now + 60 * 1000;
  }
  return updatedRateLimits;
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/utils-hoist/severity.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/utils-hoist/severity.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   severityLevelFromString: () => (/* binding */ severityLevelFromString)
/* harmony export */ });
/**
 * Converts a string-based level into a `SeverityLevel`, normalizing it along the way.
 *
 * @param level String representation of desired `SeverityLevel`.
 * @returns The `SeverityLevel` corresponding to the given string, or 'log' if the string isn't a valid level.
 */
function severityLevelFromString(level) {
  return level === 'warn' ? 'warning' : ['fatal', 'error', 'warning', 'log', 'info', 'debug'].includes(level) ? level : 'log';
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/utils-hoist/stacktrace.js":
/*!***********************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/utils-hoist/stacktrace.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   UNKNOWN_FUNCTION: () => (/* binding */ UNKNOWN_FUNCTION),
/* harmony export */   createStackParser: () => (/* binding */ createStackParser),
/* harmony export */   getFramesFromEvent: () => (/* binding */ getFramesFromEvent),
/* harmony export */   getFunctionName: () => (/* binding */ getFunctionName),
/* harmony export */   stackParserFromStackParserOptions: () => (/* binding */ stackParserFromStackParserOptions),
/* harmony export */   stripSentryFramesAndReverse: () => (/* binding */ stripSentryFramesAndReverse)
/* harmony export */ });
const STACKTRACE_FRAME_LIMIT = 50;
const UNKNOWN_FUNCTION = '?';
// Used to sanitize webpack (error: *) wrapped stack errors
const WEBPACK_ERROR_REGEXP = /\(error: (.*)\)/;
const STRIP_FRAME_REGEXP = /captureMessage|captureException/;

/**
 * Creates a stack parser with the supplied line parsers
 *
 * StackFrames are returned in the correct order for Sentry Exception
 * frames and with Sentry SDK internal frames removed from the top and bottom
 *
 */
function createStackParser() {
  for (var _len = arguments.length, parsers = new Array(_len), _key = 0; _key < _len; _key++) {
    parsers[_key] = arguments[_key];
  }
  const sortedParsers = parsers.sort((a, b) => a[0] - b[0]).map(p => p[1]);
  return function (stack, skipFirstLines, framesToPop) {
    if (skipFirstLines === void 0) {
      skipFirstLines = 0;
    }
    if (framesToPop === void 0) {
      framesToPop = 0;
    }
    const frames = [];
    const lines = stack.split('\n');
    for (let i = skipFirstLines; i < lines.length; i++) {
      const line = lines[i];
      // Ignore lines over 1kb as they are unlikely to be stack frames.
      // Many of the regular expressions use backtracking which results in run time that increases exponentially with
      // input size. Huge strings can result in hangs/Denial of Service:
      // https://github.com/getsentry/sentry-javascript/issues/2286
      if (line.length > 1024) {
        continue;
      }

      // https://github.com/getsentry/sentry-javascript/issues/5459
      // Remove webpack (error: *) wrappers
      const cleanedLine = WEBPACK_ERROR_REGEXP.test(line) ? line.replace(WEBPACK_ERROR_REGEXP, '$1') : line;

      // https://github.com/getsentry/sentry-javascript/issues/7813
      // Skip Error: lines
      if (cleanedLine.match(/\S*Error: /)) {
        continue;
      }
      for (const parser of sortedParsers) {
        const frame = parser(cleanedLine);
        if (frame) {
          frames.push(frame);
          break;
        }
      }
      if (frames.length >= STACKTRACE_FRAME_LIMIT + framesToPop) {
        break;
      }
    }
    return stripSentryFramesAndReverse(frames.slice(framesToPop));
  };
}

/**
 * Gets a stack parser implementation from Options.stackParser
 * @see Options
 *
 * If options contains an array of line parsers, it is converted into a parser
 */
function stackParserFromStackParserOptions(stackParser) {
  if (Array.isArray(stackParser)) {
    return createStackParser(...stackParser);
  }
  return stackParser;
}

/**
 * Removes Sentry frames from the top and bottom of the stack if present and enforces a limit of max number of frames.
 * Assumes stack input is ordered from top to bottom and returns the reverse representation so call site of the
 * function that caused the crash is the last frame in the array.
 * @hidden
 */
function stripSentryFramesAndReverse(stack) {
  if (!stack.length) {
    return [];
  }
  const localStack = Array.from(stack);

  // If stack starts with one of our API calls, remove it (starts, meaning it's the top of the stack - aka last call)
  if (/sentryWrapped/.test(getLastStackFrame(localStack).function || '')) {
    localStack.pop();
  }

  // Reversing in the middle of the procedure allows us to just pop the values off the stack
  localStack.reverse();

  // If stack ends with one of our internal API calls, remove it (ends, meaning it's the bottom of the stack - aka top-most call)
  if (STRIP_FRAME_REGEXP.test(getLastStackFrame(localStack).function || '')) {
    localStack.pop();

    // When using synthetic events, we will have a 2 levels deep stack, as `new Error('Sentry syntheticException')`
    // is produced within the scope itself, making it:
    //
    //   Sentry.captureException()
    //   scope.captureException()
    //
    // instead of just the top `Sentry` call itself.
    // This forces us to possibly strip an additional frame in the exact same was as above.
    if (STRIP_FRAME_REGEXP.test(getLastStackFrame(localStack).function || '')) {
      localStack.pop();
    }
  }
  return localStack.slice(0, STACKTRACE_FRAME_LIMIT).map(frame => ({
    ...frame,
    filename: frame.filename || getLastStackFrame(localStack).filename,
    function: frame.function || UNKNOWN_FUNCTION
  }));
}
function getLastStackFrame(arr) {
  return arr[arr.length - 1] || {};
}
const defaultFunctionName = '<anonymous>';

/**
 * Safely extract function name from itself
 */
function getFunctionName(fn) {
  try {
    if (!fn || typeof fn !== 'function') {
      return defaultFunctionName;
    }
    return fn.name || defaultFunctionName;
  } catch (e) {
    // Just accessing custom props in some Selenium environments
    // can cause a "Permission denied" exception (see raven-js#495).
    return defaultFunctionName;
  }
}

/**
 * Get's stack frames from an event without needing to check for undefined properties.
 */
function getFramesFromEvent(event) {
  const exception = event.exception;
  if (exception) {
    const frames = [];
    try {
      // @ts-expect-error Object could be undefined
      exception.values.forEach(value => {
        // @ts-expect-error Value could be undefined
        if (value.stacktrace.frames) {
          // @ts-expect-error Value could be undefined
          frames.push(...value.stacktrace.frames);
        }
      });
      return frames;
    } catch (_oO) {
      return undefined;
    }
  }
  return undefined;
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/utils-hoist/string.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/utils-hoist/string.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isMatchingPattern: () => (/* binding */ isMatchingPattern),
/* harmony export */   safeJoin: () => (/* binding */ safeJoin),
/* harmony export */   snipLine: () => (/* binding */ snipLine),
/* harmony export */   stringMatchesSomePattern: () => (/* binding */ stringMatchesSomePattern),
/* harmony export */   truncate: () => (/* binding */ truncate)
/* harmony export */ });
/* harmony import */ var _is_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./is.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/is.js");


/**
 * Truncates given string to the maximum characters count
 *
 * @param str An object that contains serializable values
 * @param max Maximum number of characters in truncated string (0 = unlimited)
 * @returns string Encoded
 */
function truncate(str, max) {
  if (max === void 0) {
    max = 0;
  }
  if (typeof str !== 'string' || max === 0) {
    return str;
  }
  return str.length <= max ? str : `${str.slice(0, max)}...`;
}

/**
 * This is basically just `trim_line` from
 * https://github.com/getsentry/sentry/blob/master/src/sentry/lang/javascript/processor.py#L67
 *
 * @param str An object that contains serializable values
 * @param max Maximum number of characters in truncated string
 * @returns string Encoded
 */
function snipLine(line, colno) {
  let newLine = line;
  const lineLength = newLine.length;
  if (lineLength <= 150) {
    return newLine;
  }
  if (colno > lineLength) {
    // eslint-disable-next-line no-param-reassign
    colno = lineLength;
  }
  let start = Math.max(colno - 60, 0);
  if (start < 5) {
    start = 0;
  }
  let end = Math.min(start + 140, lineLength);
  if (end > lineLength - 5) {
    end = lineLength;
  }
  if (end === lineLength) {
    start = Math.max(end - 140, 0);
  }
  newLine = newLine.slice(start, end);
  if (start > 0) {
    newLine = `'{snip} ${newLine}`;
  }
  if (end < lineLength) {
    newLine += ' {snip}';
  }
  return newLine;
}

/**
 * Join values in array
 * @param input array of values to be joined together
 * @param delimiter string to be placed in-between values
 * @returns Joined values
 */
function safeJoin(input, delimiter) {
  if (!Array.isArray(input)) {
    return '';
  }
  const output = [];
  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < input.length; i++) {
    const value = input[i];
    try {
      // This is a hack to fix a Vue3-specific bug that causes an infinite loop of
      // console warnings. This happens when a Vue template is rendered with
      // an undeclared variable, which we try to stringify, ultimately causing
      // Vue to issue another warning which repeats indefinitely.
      // see: https://github.com/getsentry/sentry-javascript/pull/8981
      if ((0,_is_js__WEBPACK_IMPORTED_MODULE_0__.isVueViewModel)(value)) {
        output.push('[VueViewModel]');
      } else {
        output.push(String(value));
      }
    } catch (e) {
      output.push('[value cannot be serialized]');
    }
  }
  return output.join(delimiter);
}

/**
 * Checks if the given value matches a regex or string
 *
 * @param value The string to test
 * @param pattern Either a regex or a string against which `value` will be matched
 * @param requireExactStringMatch If true, `value` must match `pattern` exactly. If false, `value` will match
 * `pattern` if it contains `pattern`. Only applies to string-type patterns.
 */
function isMatchingPattern(value, pattern, requireExactStringMatch) {
  if (requireExactStringMatch === void 0) {
    requireExactStringMatch = false;
  }
  if (!(0,_is_js__WEBPACK_IMPORTED_MODULE_0__.isString)(value)) {
    return false;
  }
  if ((0,_is_js__WEBPACK_IMPORTED_MODULE_0__.isRegExp)(pattern)) {
    return pattern.test(value);
  }
  if ((0,_is_js__WEBPACK_IMPORTED_MODULE_0__.isString)(pattern)) {
    return requireExactStringMatch ? value === pattern : value.includes(pattern);
  }
  return false;
}

/**
 * Test the given string against an array of strings and regexes. By default, string matching is done on a
 * substring-inclusion basis rather than a strict equality basis
 *
 * @param testString The string to test
 * @param patterns The patterns against which to test the string
 * @param requireExactStringMatch If true, `testString` must match one of the given string patterns exactly in order to
 * count. If false, `testString` will match a string pattern if it contains that pattern.
 * @returns
 */
function stringMatchesSomePattern(testString, patterns, requireExactStringMatch) {
  if (patterns === void 0) {
    patterns = [];
  }
  if (requireExactStringMatch === void 0) {
    requireExactStringMatch = false;
  }
  return patterns.some(pattern => isMatchingPattern(testString, pattern, requireExactStringMatch));
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/utils-hoist/supports.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/utils-hoist/supports.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isNativeFunction: () => (/* binding */ isNativeFunction),
/* harmony export */   supportsDOMError: () => (/* binding */ supportsDOMError),
/* harmony export */   supportsDOMException: () => (/* binding */ supportsDOMException),
/* harmony export */   supportsErrorEvent: () => (/* binding */ supportsErrorEvent),
/* harmony export */   supportsFetch: () => (/* binding */ supportsFetch),
/* harmony export */   supportsHistory: () => (/* binding */ supportsHistory),
/* harmony export */   supportsNativeFetch: () => (/* binding */ supportsNativeFetch),
/* harmony export */   supportsReferrerPolicy: () => (/* binding */ supportsReferrerPolicy),
/* harmony export */   supportsReportingObserver: () => (/* binding */ supportsReportingObserver)
/* harmony export */ });
/* harmony import */ var _debug_build_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./debug-build.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/debug-build.js");
/* harmony import */ var _logger_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./logger.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/logger.js");
/* harmony import */ var _worldwide_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./worldwide.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/worldwide.js");



const WINDOW = _worldwide_js__WEBPACK_IMPORTED_MODULE_0__.GLOBAL_OBJ;

/**
 * Tells whether current environment supports ErrorEvent objects
 * {@link supportsErrorEvent}.
 *
 * @returns Answer to the given question.
 */
function supportsErrorEvent() {
  try {
    new ErrorEvent('');
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Tells whether current environment supports DOMError objects
 * {@link supportsDOMError}.
 *
 * @returns Answer to the given question.
 */
function supportsDOMError() {
  try {
    // Chrome: VM89:1 Uncaught TypeError: Failed to construct 'DOMError':
    // 1 argument required, but only 0 present.
    // @ts-expect-error It really needs 1 argument, not 0.
    new DOMError('');
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Tells whether current environment supports DOMException objects
 * {@link supportsDOMException}.
 *
 * @returns Answer to the given question.
 */
function supportsDOMException() {
  try {
    new DOMException('');
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Tells whether current environment supports History API
 * {@link supportsHistory}.
 *
 * @returns Answer to the given question.
 */
function supportsHistory() {
  return 'history' in WINDOW && !!WINDOW.history;
}

/**
 * Tells whether current environment supports Fetch API
 * {@link supportsFetch}.
 *
 * @returns Answer to the given question.
 */
function supportsFetch() {
  if (!('fetch' in WINDOW)) {
    return false;
  }
  try {
    new Headers();
    new Request('http://www.example.com');
    new Response();
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * isNative checks if the given function is a native implementation
 */
// eslint-disable-next-line @typescript-eslint/ban-types
function isNativeFunction(func) {
  return func && /^function\s+\w+\(\)\s+\{\s+\[native code\]\s+\}$/.test(func.toString());
}

/**
 * Tells whether current environment supports Fetch API natively
 * {@link supportsNativeFetch}.
 *
 * @returns true if `window.fetch` is natively implemented, false otherwise
 */
function supportsNativeFetch() {
  if (typeof EdgeRuntime === 'string') {
    return true;
  }
  if (!supportsFetch()) {
    return false;
  }

  // Fast path to avoid DOM I/O
  // eslint-disable-next-line @typescript-eslint/unbound-method
  if (isNativeFunction(WINDOW.fetch)) {
    return true;
  }

  // window.fetch is implemented, but is polyfilled or already wrapped (e.g: by a chrome extension)
  // so create a "pure" iframe to see if that has native fetch
  let result = false;
  const doc = WINDOW.document;
  // eslint-disable-next-line deprecation/deprecation
  if (doc && typeof doc.createElement === 'function') {
    try {
      const sandbox = doc.createElement('iframe');
      sandbox.hidden = true;
      doc.head.appendChild(sandbox);
      if (sandbox.contentWindow?.fetch) {
        // eslint-disable-next-line @typescript-eslint/unbound-method
        result = isNativeFunction(sandbox.contentWindow.fetch);
      }
      doc.head.removeChild(sandbox);
    } catch (err) {
      _debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD && _logger_js__WEBPACK_IMPORTED_MODULE_2__.logger.warn('Could not create sandbox iframe for pure fetch check, bailing to window.fetch: ', err);
    }
  }
  return result;
}

/**
 * Tells whether current environment supports ReportingObserver API
 * {@link supportsReportingObserver}.
 *
 * @returns Answer to the given question.
 */
function supportsReportingObserver() {
  return 'ReportingObserver' in WINDOW;
}

/**
 * Tells whether current environment supports Referrer Policy API
 * {@link supportsReferrerPolicy}.
 *
 * @returns Answer to the given question.
 */
function supportsReferrerPolicy() {
  // Despite all stars in the sky saying that Edge supports old draft syntax, aka 'never', 'always', 'origin' and 'default'
  // (see https://caniuse.com/#feat=referrer-policy),
  // it doesn't. And it throws an exception instead of ignoring this parameter...
  // REF: https://github.com/getsentry/raven-js/issues/1233

  if (!supportsFetch()) {
    return false;
  }
  try {
    new Request('_', {
      referrerPolicy: 'origin'
    });
    return true;
  } catch (e) {
    return false;
  }
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/utils-hoist/syncpromise.js":
/*!************************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/utils-hoist/syncpromise.js ***!
  \************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SyncPromise: () => (/* binding */ SyncPromise),
/* harmony export */   rejectedSyncPromise: () => (/* binding */ rejectedSyncPromise),
/* harmony export */   resolvedSyncPromise: () => (/* binding */ resolvedSyncPromise)
/* harmony export */ });
/* harmony import */ var _is_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./is.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/is.js");


/* eslint-disable @typescript-eslint/no-explicit-any */

/** SyncPromise internal states */
var States;
(function (States) {
  /** Pending */
  const PENDING = 0;
  States[States["PENDING"] = PENDING] = "PENDING";
  /** Resolved / OK */
  const RESOLVED = 1;
  States[States["RESOLVED"] = RESOLVED] = "RESOLVED";
  /** Rejected / Error */
  const REJECTED = 2;
  States[States["REJECTED"] = REJECTED] = "REJECTED";
})(States || (States = {}));

// Overloads so we can call resolvedSyncPromise without arguments and generic argument

/**
 * Creates a resolved sync promise.
 *
 * @param value the value to resolve the promise with
 * @returns the resolved sync promise
 */
function resolvedSyncPromise(value) {
  return new SyncPromise(resolve => {
    resolve(value);
  });
}

/**
 * Creates a rejected sync promise.
 *
 * @param value the value to reject the promise with
 * @returns the rejected sync promise
 */
function rejectedSyncPromise(reason) {
  return new SyncPromise((_, reject) => {
    reject(reason);
  });
}

/**
 * Thenable class that behaves like a Promise and follows it's interface
 * but is not async internally
 */
class SyncPromise {
  constructor(executor) {
    this._state = States.PENDING;
    this._handlers = [];
    this._runExecutor(executor);
  }

  /** @inheritdoc */
  then(onfulfilled, onrejected) {
    return new SyncPromise((resolve, reject) => {
      this._handlers.push([false, result => {
        if (!onfulfilled) {
          // TODO: ¯\_(ツ)_/¯
          // TODO: FIXME
          resolve(result);
        } else {
          try {
            resolve(onfulfilled(result));
          } catch (e) {
            reject(e);
          }
        }
      }, reason => {
        if (!onrejected) {
          reject(reason);
        } else {
          try {
            resolve(onrejected(reason));
          } catch (e) {
            reject(e);
          }
        }
      }]);
      this._executeHandlers();
    });
  }

  /** @inheritdoc */
  catch(onrejected) {
    return this.then(val => val, onrejected);
  }

  /** @inheritdoc */
  finally(onfinally) {
    return new SyncPromise((resolve, reject) => {
      let val;
      let isRejected;
      return this.then(value => {
        isRejected = false;
        val = value;
        if (onfinally) {
          onfinally();
        }
      }, reason => {
        isRejected = true;
        val = reason;
        if (onfinally) {
          onfinally();
        }
      }).then(() => {
        if (isRejected) {
          reject(val);
          return;
        }
        resolve(val);
      });
    });
  }

  /** Excute the resolve/reject handlers. */
  _executeHandlers() {
    if (this._state === States.PENDING) {
      return;
    }
    const cachedHandlers = this._handlers.slice();
    this._handlers = [];
    cachedHandlers.forEach(handler => {
      if (handler[0]) {
        return;
      }
      if (this._state === States.RESOLVED) {
        handler[1](this._value);
      }
      if (this._state === States.REJECTED) {
        handler[2](this._value);
      }
      handler[0] = true;
    });
  }

  /** Run the executor for the SyncPromise. */
  _runExecutor(executor) {
    const setResult = (state, value) => {
      if (this._state !== States.PENDING) {
        return;
      }
      if ((0,_is_js__WEBPACK_IMPORTED_MODULE_0__.isThenable)(value)) {
        void value.then(resolve, reject);
        return;
      }
      this._state = state;
      this._value = value;
      this._executeHandlers();
    };
    const resolve = value => {
      setResult(States.RESOLVED, value);
    };
    const reject = reason => {
      setResult(States.REJECTED, reason);
    };
    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/utils-hoist/time.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/utils-hoist/time.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   browserPerformanceTimeOrigin: () => (/* binding */ browserPerformanceTimeOrigin),
/* harmony export */   dateTimestampInSeconds: () => (/* binding */ dateTimestampInSeconds),
/* harmony export */   timestampInSeconds: () => (/* binding */ timestampInSeconds)
/* harmony export */ });
/* harmony import */ var _worldwide_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./worldwide.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/worldwide.js");

const ONE_SECOND_IN_MS = 1000;

/**
 * A partial definition of the [Performance Web API]{@link https://developer.mozilla.org/en-US/docs/Web/API/Performance}
 * for accessing a high-resolution monotonic clock.
 */

/**
 * Returns a timestamp in seconds since the UNIX epoch using the Date API.
 */
function dateTimestampInSeconds() {
  return Date.now() / ONE_SECOND_IN_MS;
}

/**
 * Returns a wrapper around the native Performance API browser implementation, or undefined for browsers that do not
 * support the API.
 *
 * Wrapping the native API works around differences in behavior from different browsers.
 */
function createUnixTimestampInSecondsFunc() {
  const {
    performance
  } = _worldwide_js__WEBPACK_IMPORTED_MODULE_0__.GLOBAL_OBJ;
  if (!performance?.now) {
    return dateTimestampInSeconds;
  }

  // Some browser and environments don't have a timeOrigin, so we fallback to
  // using Date.now() to compute the starting time.
  const approxStartingTimeOrigin = Date.now() - performance.now();
  const timeOrigin = performance.timeOrigin == undefined ? approxStartingTimeOrigin : performance.timeOrigin;

  // performance.now() is a monotonic clock, which means it starts at 0 when the process begins. To get the current
  // wall clock time (actual UNIX timestamp), we need to add the starting time origin and the current time elapsed.
  //
  // TODO: This does not account for the case where the monotonic clock that powers performance.now() drifts from the
  // wall clock time, which causes the returned timestamp to be inaccurate. We should investigate how to detect and
  // correct for this.
  // See: https://github.com/getsentry/sentry-javascript/issues/2590
  // See: https://github.com/mdn/content/issues/4713
  // See: https://dev.to/noamr/when-a-millisecond-is-not-a-millisecond-3h6
  return () => {
    return (timeOrigin + performance.now()) / ONE_SECOND_IN_MS;
  };
}

/**
 * Returns a timestamp in seconds since the UNIX epoch using either the Performance or Date APIs, depending on the
 * availability of the Performance API.
 *
 * BUG: Note that because of how browsers implement the Performance API, the clock might stop when the computer is
 * asleep. This creates a skew between `dateTimestampInSeconds` and `timestampInSeconds`. The
 * skew can grow to arbitrary amounts like days, weeks or months.
 * See https://github.com/getsentry/sentry-javascript/issues/2590.
 */
const timestampInSeconds = createUnixTimestampInSecondsFunc();

/**
 * Cached result of getBrowserTimeOrigin.
 */
let cachedTimeOrigin;

/**
 * Gets the time origin and the mode used to determine it.
 */
function getBrowserTimeOrigin() {
  // Unfortunately browsers may report an inaccurate time origin data, through either performance.timeOrigin or
  // performance.timing.navigationStart, which results in poor results in performance data. We only treat time origin
  // data as reliable if they are within a reasonable threshold of the current time.

  const {
    performance
  } = _worldwide_js__WEBPACK_IMPORTED_MODULE_0__.GLOBAL_OBJ;
  if (!performance?.now) {
    return [undefined, 'none'];
  }
  const threshold = 3600 * 1000;
  const performanceNow = performance.now();
  const dateNow = Date.now();

  // if timeOrigin isn't available set delta to threshold so it isn't used
  const timeOriginDelta = performance.timeOrigin ? Math.abs(performance.timeOrigin + performanceNow - dateNow) : threshold;
  const timeOriginIsReliable = timeOriginDelta < threshold;

  // While performance.timing.navigationStart is deprecated in favor of performance.timeOrigin, performance.timeOrigin
  // is not as widely supported. Namely, performance.timeOrigin is undefined in Safari as of writing.
  // Also as of writing, performance.timing is not available in Web Workers in mainstream browsers, so it is not always
  // a valid fallback. In the absence of an initial time provided by the browser, fallback to the current time from the
  // Date API.
  // eslint-disable-next-line deprecation/deprecation
  const navigationStart = performance.timing?.navigationStart;
  const hasNavigationStart = typeof navigationStart === 'number';
  // if navigationStart isn't available set delta to threshold so it isn't used
  const navigationStartDelta = hasNavigationStart ? Math.abs(navigationStart + performanceNow - dateNow) : threshold;
  const navigationStartIsReliable = navigationStartDelta < threshold;
  if (timeOriginIsReliable || navigationStartIsReliable) {
    // Use the more reliable time origin
    if (timeOriginDelta <= navigationStartDelta) {
      return [performance.timeOrigin, 'timeOrigin'];
    } else {
      return [navigationStart, 'navigationStart'];
    }
  }

  // Either both timeOrigin and navigationStart are skewed or neither is available, fallback to Date.
  return [dateNow, 'dateNow'];
}

/**
 * The number of milliseconds since the UNIX epoch. This value is only usable in a browser, and only when the
 * performance API is available.
 */
function browserPerformanceTimeOrigin() {
  if (!cachedTimeOrigin) {
    cachedTimeOrigin = getBrowserTimeOrigin();
  }
  return cachedTimeOrigin[0];
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/utils-hoist/tracing.js":
/*!********************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/utils-hoist/tracing.js ***!
  \********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TRACEPARENT_REGEXP: () => (/* binding */ TRACEPARENT_REGEXP),
/* harmony export */   extractTraceparentData: () => (/* binding */ extractTraceparentData),
/* harmony export */   generateSentryTraceHeader: () => (/* binding */ generateSentryTraceHeader),
/* harmony export */   propagationContextFromHeaders: () => (/* binding */ propagationContextFromHeaders)
/* harmony export */ });
/* harmony import */ var _utils_parseSampleRate_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/parseSampleRate.js */ "./node_modules/@sentry/core/build/esm/utils/parseSampleRate.js");
/* harmony import */ var _baggage_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./baggage.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/baggage.js");
/* harmony import */ var _propagationContext_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./propagationContext.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/propagationContext.js");




// eslint-disable-next-line @sentry-internal/sdk/no-regexp-constructor -- RegExp is used for readability here
const TRACEPARENT_REGEXP = new RegExp('^[ \\t]*' +
// whitespace
'([0-9a-f]{32})?' +
// trace_id
'-?([0-9a-f]{16})?' +
// span_id
'-?([01])?' +
// sampled
'[ \\t]*$') // whitespace
;

/**
 * Extract transaction context data from a `sentry-trace` header.
 *
 * @param traceparent Traceparent string
 *
 * @returns Object containing data from the header, or undefined if traceparent string is malformed
 */
function extractTraceparentData(traceparent) {
  if (!traceparent) {
    return undefined;
  }
  const matches = traceparent.match(TRACEPARENT_REGEXP);
  if (!matches) {
    return undefined;
  }
  let parentSampled;
  if (matches[3] === '1') {
    parentSampled = true;
  } else if (matches[3] === '0') {
    parentSampled = false;
  }
  return {
    traceId: matches[1],
    parentSampled,
    parentSpanId: matches[2]
  };
}

/**
 * Create a propagation context from incoming headers or
 * creates a minimal new one if the headers are undefined.
 */
function propagationContextFromHeaders(sentryTrace, baggage) {
  const traceparentData = extractTraceparentData(sentryTrace);
  const dynamicSamplingContext = (0,_baggage_js__WEBPACK_IMPORTED_MODULE_0__.baggageHeaderToDynamicSamplingContext)(baggage);
  if (!traceparentData?.traceId) {
    return {
      traceId: (0,_propagationContext_js__WEBPACK_IMPORTED_MODULE_1__.generateTraceId)(),
      sampleRand: Math.random()
    };
  }
  const sampleRand = getSampleRandFromTraceparentAndDsc(traceparentData, dynamicSamplingContext);

  // The sample_rand on the DSC needs to be generated based on traceparent + baggage.
  if (dynamicSamplingContext) {
    dynamicSamplingContext.sample_rand = sampleRand.toString();
  }
  const {
    traceId,
    parentSpanId,
    parentSampled
  } = traceparentData;
  return {
    traceId,
    parentSpanId,
    sampled: parentSampled,
    dsc: dynamicSamplingContext || {},
    // If we have traceparent data but no DSC it means we are not head of trace and we must freeze it
    sampleRand
  };
}

/**
 * Create sentry-trace header from span context values.
 */
function generateSentryTraceHeader(traceId, spanId, sampled) {
  if (traceId === void 0) {
    traceId = (0,_propagationContext_js__WEBPACK_IMPORTED_MODULE_1__.generateTraceId)();
  }
  if (spanId === void 0) {
    spanId = (0,_propagationContext_js__WEBPACK_IMPORTED_MODULE_1__.generateSpanId)();
  }
  let sampledString = '';
  if (sampled !== undefined) {
    sampledString = sampled ? '-1' : '-0';
  }
  return `${traceId}-${spanId}${sampledString}`;
}

/**
 * Given any combination of an incoming trace, generate a sample rand based on its defined semantics.
 *
 * Read more: https://develop.sentry.dev/sdk/telemetry/traces/#propagated-random-value
 */
function getSampleRandFromTraceparentAndDsc(traceparentData, dsc) {
  // When there is an incoming sample rand use it.
  const parsedSampleRand = (0,_utils_parseSampleRate_js__WEBPACK_IMPORTED_MODULE_2__.parseSampleRate)(dsc?.sample_rand);
  if (parsedSampleRand !== undefined) {
    return parsedSampleRand;
  }

  // Otherwise, if there is an incoming sampling decision + sample rate, generate a sample rand that would lead to the same sampling decision.
  const parsedSampleRate = (0,_utils_parseSampleRate_js__WEBPACK_IMPORTED_MODULE_2__.parseSampleRate)(dsc?.sample_rate);
  if (parsedSampleRate && traceparentData?.parentSampled !== undefined) {
    return traceparentData.parentSampled ?
    // Returns a sample rand with positive sampling decision [0, sampleRate)
    Math.random() * parsedSampleRate :
    // Returns a sample rand with negative sampling decision [sampleRate, 1)
    parsedSampleRate + Math.random() * (1 - parsedSampleRate);
  } else {
    // If nothing applies, return a random sample rand.
    return Math.random();
  }
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/utils-hoist/url.js":
/*!****************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/utils-hoist/url.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getSanitizedUrlString: () => (/* binding */ getSanitizedUrlString),
/* harmony export */   parseUrl: () => (/* binding */ parseUrl),
/* harmony export */   stripUrlQueryAndFragment: () => (/* binding */ stripUrlQueryAndFragment)
/* harmony export */ });
/**
 * Parses string form of URL into an object
 * // borrowed from https://tools.ietf.org/html/rfc3986#appendix-B
 * // intentionally using regex and not <a/> href parsing trick because React Native and other
 * // environments where DOM might not be available
 * @returns parsed URL object
 */
function parseUrl(url) {
  if (!url) {
    return {};
  }
  const match = url.match(/^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/);
  if (!match) {
    return {};
  }

  // coerce to undefined values to empty string so we don't get 'undefined'
  const query = match[6] || '';
  const fragment = match[8] || '';
  return {
    host: match[4],
    path: match[5],
    protocol: match[2],
    search: query,
    hash: fragment,
    relative: match[5] + query + fragment // everything minus origin
  };
}

/**
 * Strip the query string and fragment off of a given URL or path (if present)
 *
 * @param urlPath Full URL or path, including possible query string and/or fragment
 * @returns URL or path without query string or fragment
 */
function stripUrlQueryAndFragment(urlPath) {
  return urlPath.split(/[?#]/, 1)[0];
}

/**
 * Takes a URL object and returns a sanitized string which is safe to use as span name
 * see: https://develop.sentry.dev/sdk/data-handling/#structuring-data
 */
function getSanitizedUrlString(url) {
  const {
    protocol,
    host,
    path
  } = url;
  const filteredHost = host
  // Always filter out authority
  ?.replace(/^.*@/, '[filtered]:[filtered]@')
  // Don't show standard :80 (http) and :443 (https) ports to reduce the noise
  // TODO: Use new URL global if it exists
  .replace(/(:80)$/, '').replace(/(:443)$/, '') || '';
  return `${protocol ? `${protocol}://` : ''}${filteredHost}${path}`;
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/utils-hoist/version.js":
/*!********************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/utils-hoist/version.js ***!
  \********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SDK_VERSION: () => (/* binding */ SDK_VERSION)
/* harmony export */ });
// This is a magic string replaced by rollup

const SDK_VERSION = "9.6.1";


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/utils-hoist/worldwide.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/utils-hoist/worldwide.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GLOBAL_OBJ: () => (/* binding */ GLOBAL_OBJ)
/* harmony export */ });
/** Internal global with common properties and Sentry extensions  */

/** Get's the global object for the current JavaScript runtime */
const GLOBAL_OBJ = globalThis;


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/utils/applyScopeDataToEvent.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/utils/applyScopeDataToEvent.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   applyScopeDataToEvent: () => (/* binding */ applyScopeDataToEvent),
/* harmony export */   mergeAndOverwriteScopeData: () => (/* binding */ mergeAndOverwriteScopeData),
/* harmony export */   mergeScopeData: () => (/* binding */ mergeScopeData)
/* harmony export */ });
/* harmony import */ var _tracing_dynamicSamplingContext_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../tracing/dynamicSamplingContext.js */ "./node_modules/@sentry/core/build/esm/tracing/dynamicSamplingContext.js");
/* harmony import */ var _utils_hoist_object_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils-hoist/object.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/object.js");
/* harmony import */ var _merge_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./merge.js */ "./node_modules/@sentry/core/build/esm/utils/merge.js");
/* harmony import */ var _spanUtils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./spanUtils.js */ "./node_modules/@sentry/core/build/esm/utils/spanUtils.js");





/**
 * Applies data from the scope to the event and runs all event processors on it.
 */
function applyScopeDataToEvent(event, data) {
  const {
    fingerprint,
    span,
    breadcrumbs,
    sdkProcessingMetadata
  } = data;

  // Apply general data
  applyDataToEvent(event, data);

  // We want to set the trace context for normal events only if there isn't already
  // a trace context on the event. There is a product feature in place where we link
  // errors with transaction and it relies on that.
  if (span) {
    applySpanToEvent(event, span);
  }
  applyFingerprintToEvent(event, fingerprint);
  applyBreadcrumbsToEvent(event, breadcrumbs);
  applySdkMetadataToEvent(event, sdkProcessingMetadata);
}

/** Merge data of two scopes together. */
function mergeScopeData(data, mergeData) {
  const {
    extra,
    tags,
    user,
    contexts,
    level,
    sdkProcessingMetadata,
    breadcrumbs,
    fingerprint,
    eventProcessors,
    attachments,
    propagationContext,
    transactionName,
    span
  } = mergeData;
  mergeAndOverwriteScopeData(data, 'extra', extra);
  mergeAndOverwriteScopeData(data, 'tags', tags);
  mergeAndOverwriteScopeData(data, 'user', user);
  mergeAndOverwriteScopeData(data, 'contexts', contexts);
  data.sdkProcessingMetadata = (0,_merge_js__WEBPACK_IMPORTED_MODULE_0__.merge)(data.sdkProcessingMetadata, sdkProcessingMetadata, 2);
  if (level) {
    data.level = level;
  }
  if (transactionName) {
    data.transactionName = transactionName;
  }
  if (span) {
    data.span = span;
  }
  if (breadcrumbs.length) {
    data.breadcrumbs = [...data.breadcrumbs, ...breadcrumbs];
  }
  if (fingerprint.length) {
    data.fingerprint = [...data.fingerprint, ...fingerprint];
  }
  if (eventProcessors.length) {
    data.eventProcessors = [...data.eventProcessors, ...eventProcessors];
  }
  if (attachments.length) {
    data.attachments = [...data.attachments, ...attachments];
  }
  data.propagationContext = {
    ...data.propagationContext,
    ...propagationContext
  };
}

/**
 * Merges certain scope data. Undefined values will overwrite any existing values.
 * Exported only for tests.
 */
function mergeAndOverwriteScopeData(data, prop, mergeVal) {
  data[prop] = (0,_merge_js__WEBPACK_IMPORTED_MODULE_0__.merge)(data[prop], mergeVal, 1);
}
function applyDataToEvent(event, data) {
  const {
    extra,
    tags,
    user,
    contexts,
    level,
    transactionName
  } = data;
  const cleanedExtra = (0,_utils_hoist_object_js__WEBPACK_IMPORTED_MODULE_1__.dropUndefinedKeys)(extra);
  if (Object.keys(cleanedExtra).length) {
    event.extra = {
      ...cleanedExtra,
      ...event.extra
    };
  }
  const cleanedTags = (0,_utils_hoist_object_js__WEBPACK_IMPORTED_MODULE_1__.dropUndefinedKeys)(tags);
  if (Object.keys(cleanedTags).length) {
    event.tags = {
      ...cleanedTags,
      ...event.tags
    };
  }
  const cleanedUser = (0,_utils_hoist_object_js__WEBPACK_IMPORTED_MODULE_1__.dropUndefinedKeys)(user);
  if (Object.keys(cleanedUser).length) {
    event.user = {
      ...cleanedUser,
      ...event.user
    };
  }
  const cleanedContexts = (0,_utils_hoist_object_js__WEBPACK_IMPORTED_MODULE_1__.dropUndefinedKeys)(contexts);
  if (Object.keys(cleanedContexts).length) {
    event.contexts = {
      ...cleanedContexts,
      ...event.contexts
    };
  }
  if (level) {
    event.level = level;
  }

  // transaction events get their `transaction` from the root span name
  if (transactionName && event.type !== 'transaction') {
    event.transaction = transactionName;
  }
}
function applyBreadcrumbsToEvent(event, breadcrumbs) {
  const mergedBreadcrumbs = [...(event.breadcrumbs || []), ...breadcrumbs];
  event.breadcrumbs = mergedBreadcrumbs.length ? mergedBreadcrumbs : undefined;
}
function applySdkMetadataToEvent(event, sdkProcessingMetadata) {
  event.sdkProcessingMetadata = {
    ...event.sdkProcessingMetadata,
    ...sdkProcessingMetadata
  };
}
function applySpanToEvent(event, span) {
  event.contexts = {
    trace: (0,_spanUtils_js__WEBPACK_IMPORTED_MODULE_2__.spanToTraceContext)(span),
    ...event.contexts
  };
  event.sdkProcessingMetadata = {
    dynamicSamplingContext: (0,_tracing_dynamicSamplingContext_js__WEBPACK_IMPORTED_MODULE_3__.getDynamicSamplingContextFromSpan)(span),
    ...event.sdkProcessingMetadata
  };
  const rootSpan = (0,_spanUtils_js__WEBPACK_IMPORTED_MODULE_2__.getRootSpan)(span);
  const transactionName = (0,_spanUtils_js__WEBPACK_IMPORTED_MODULE_2__.spanToJSON)(rootSpan).description;
  if (transactionName && !event.transaction && event.type === 'transaction') {
    event.transaction = transactionName;
  }
}

/**
 * Applies fingerprint from the scope to the event if there's one,
 * uses message if there's one instead or get rid of empty fingerprint
 */
function applyFingerprintToEvent(event, fingerprint) {
  // Make sure it's an array first and we actually have something in place
  event.fingerprint = event.fingerprint ? Array.isArray(event.fingerprint) ? event.fingerprint : [event.fingerprint] : [];

  // If we have something on the scope, then merge it with event
  if (fingerprint) {
    event.fingerprint = event.fingerprint.concat(fingerprint);
  }

  // If we have no data at all, remove empty array default
  if (!event.fingerprint.length) {
    delete event.fingerprint;
  }
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/utils/eventUtils.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/utils/eventUtils.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getPossibleEventMessages: () => (/* binding */ getPossibleEventMessages)
/* harmony export */ });
/**
 * Get a list of possible event messages from a Sentry event.
 */
function getPossibleEventMessages(event) {
  const possibleMessages = [];
  if (event.message) {
    possibleMessages.push(event.message);
  }
  try {
    // @ts-expect-error Try catching to save bundle size
    const lastException = event.exception.values[event.exception.values.length - 1];
    if (lastException?.value) {
      possibleMessages.push(lastException.value);
      if (lastException.type) {
        possibleMessages.push(`${lastException.type}: ${lastException.value}`);
      }
    }
  } catch (e) {
    // ignore errors here
  }
  return possibleMessages;
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/utils/hasSpansEnabled.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/utils/hasSpansEnabled.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   hasSpansEnabled: () => (/* binding */ hasSpansEnabled),
/* harmony export */   hasTracingEnabled: () => (/* binding */ hasTracingEnabled)
/* harmony export */ });
/* harmony import */ var _currentScopes_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../currentScopes.js */ "./node_modules/@sentry/core/build/esm/currentScopes.js");


// Treeshakable guard to remove all code related to tracing

/**
 * Determines if span recording is currently enabled.
 *
 * Spans are recorded when at least one of `tracesSampleRate` and `tracesSampler`
 * is defined in the SDK config. This function does not make any assumption about
 * sampling decisions, it only checks if the SDK is configured to record spans.
 *
 * Important: This function only determines if span recording is enabled. Trace
 * continuation and propagation is separately controlled and not covered by this function.
 * If this function returns `false`, traces can still be propagated (which is what
 * we refer to by "Tracing without Performance")
 * @see https://develop.sentry.dev/sdk/telemetry/traces/tracing-without-performance/
 *
 * @param maybeOptions An SDK options object to be passed to this function.
 * If this option is not provided, the function will use the current client's options.
 */
function hasSpansEnabled(maybeOptions) {
  if (true) {
    return false;
  }
  const options = maybeOptions || (0,_currentScopes_js__WEBPACK_IMPORTED_MODULE_0__.getClient)()?.getOptions();
  return !!options && (
  // Note: This check is `!= null`, meaning "nullish". `0` is not "nullish", `undefined` and `null` are. (This comment was brought to you by 15 minutes of questioning life)
  options.tracesSampleRate != null || !!options.tracesSampler);
}

/**
 * @see JSDoc of `hasSpansEnabled`
 * @deprecated Use `hasSpansEnabled` instead, which is a more accurately named version of this function.
 * This function will be removed in the next major version of the SDK.
 */
// TODO(v10): Remove this export
const hasTracingEnabled = hasSpansEnabled;


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/utils/ipAddress.js":
/*!****************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/utils/ipAddress.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addAutoIpAddressToSession: () => (/* binding */ addAutoIpAddressToSession),
/* harmony export */   addAutoIpAddressToUser: () => (/* binding */ addAutoIpAddressToUser)
/* harmony export */ });
// By default, we want to infer the IP address, unless this is explicitly set to `null`
// We do this after all other processing is done
// If `ip_address` is explicitly set to `null` or a value, we leave it as is

/**
 * @internal
 */
function addAutoIpAddressToUser(objWithMaybeUser) {
  if (objWithMaybeUser.user?.ip_address === undefined) {
    objWithMaybeUser.user = {
      ...objWithMaybeUser.user,
      ip_address: '{{auto}}'
    };
  }
}

/**
 * @internal
 */
function addAutoIpAddressToSession(session) {
  if ('aggregates' in session) {
    if (session.attrs?.['ip_address'] === undefined) {
      session.attrs = {
        ...session.attrs,
        ip_address: '{{auto}}'
      };
    }
  } else {
    if (session.ipAddress === undefined) {
      session.ipAddress = '{{auto}}';
    }
  }
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/utils/merge.js":
/*!************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/utils/merge.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   merge: () => (/* binding */ merge)
/* harmony export */ });
/**
 * Shallow merge two objects.
 * Does not mutate the passed in objects.
 * Undefined/empty values in the merge object will overwrite existing values.
 *
 * By default, this merges 2 levels deep.
 */
function merge(initialObj, mergeObj, levels) {
  if (levels === void 0) {
    levels = 2;
  }
  // If the merge value is not an object, or we have no merge levels left,
  // we just set the value to the merge value
  if (!mergeObj || typeof mergeObj !== 'object' || levels <= 0) {
    return mergeObj;
  }

  // If the merge object is an empty object, and the initial object is not undefined, we return the initial object
  if (initialObj && Object.keys(mergeObj).length === 0) {
    return initialObj;
  }

  // Clone object
  const output = {
    ...initialObj
  };

  // Merge values into output, resursively
  for (const key in mergeObj) {
    if (Object.prototype.hasOwnProperty.call(mergeObj, key)) {
      output[key] = merge(output[key], mergeObj[key], levels - 1);
    }
  }
  return output;
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/utils/parseSampleRate.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/utils/parseSampleRate.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   parseSampleRate: () => (/* binding */ parseSampleRate)
/* harmony export */ });
/**
 * Parse a sample rate from a given value.
 * This will either return a boolean or number sample rate, if the sample rate is valid (between 0 and 1).
 * If a string is passed, we try to convert it to a number.
 *
 * Any invalid sample rate will return `undefined`.
 */
function parseSampleRate(sampleRate) {
  if (typeof sampleRate === 'boolean') {
    return Number(sampleRate);
  }
  const rate = typeof sampleRate === 'string' ? parseFloat(sampleRate) : sampleRate;
  if (typeof rate !== 'number' || isNaN(rate) || rate < 0 || rate > 1) {
    return undefined;
  }
  return rate;
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/utils/prepareEvent.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/utils/prepareEvent.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   applyClientOptions: () => (/* binding */ applyClientOptions),
/* harmony export */   applyDebugIds: () => (/* binding */ applyDebugIds),
/* harmony export */   applyDebugMeta: () => (/* binding */ applyDebugMeta),
/* harmony export */   parseEventHintOrCaptureContext: () => (/* binding */ parseEventHintOrCaptureContext),
/* harmony export */   prepareEvent: () => (/* binding */ prepareEvent)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../constants.js */ "./node_modules/@sentry/core/build/esm/constants.js");
/* harmony import */ var _currentScopes_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../currentScopes.js */ "./node_modules/@sentry/core/build/esm/currentScopes.js");
/* harmony import */ var _eventProcessors_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../eventProcessors.js */ "./node_modules/@sentry/core/build/esm/eventProcessors.js");
/* harmony import */ var _scope_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../scope.js */ "./node_modules/@sentry/core/build/esm/scope.js");
/* harmony import */ var _utils_hoist_debug_ids_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../utils-hoist/debug-ids.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/debug-ids.js");
/* harmony import */ var _utils_hoist_misc_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils-hoist/misc.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/misc.js");
/* harmony import */ var _utils_hoist_normalize_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../utils-hoist/normalize.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/normalize.js");
/* harmony import */ var _utils_hoist_string_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../utils-hoist/string.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/string.js");
/* harmony import */ var _utils_hoist_time_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils-hoist/time.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/time.js");
/* harmony import */ var _applyScopeDataToEvent_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./applyScopeDataToEvent.js */ "./node_modules/@sentry/core/build/esm/utils/applyScopeDataToEvent.js");











/**
 * This type makes sure that we get either a CaptureContext, OR an EventHint.
 * It does not allow mixing them, which could lead to unexpected outcomes, e.g. this is disallowed:
 * { user: { id: '123' }, mechanism: { handled: false } }
 */

/**
 * Adds common information to events.
 *
 * The information includes release and environment from `options`,
 * breadcrumbs and context (extra, tags and user) from the scope.
 *
 * Information that is already present in the event is never overwritten. For
 * nested objects, such as the context, keys are merged.
 *
 * @param event The original event.
 * @param hint May contain additional information about the original exception.
 * @param scope A scope containing event metadata.
 * @returns A new event with more information.
 * @hidden
 */
function prepareEvent(options, event, hint, scope, client, isolationScope) {
  const {
    normalizeDepth = 3,
    normalizeMaxBreadth = 1000
  } = options;
  const prepared = {
    ...event,
    event_id: event.event_id || hint.event_id || (0,_utils_hoist_misc_js__WEBPACK_IMPORTED_MODULE_0__.uuid4)(),
    timestamp: event.timestamp || (0,_utils_hoist_time_js__WEBPACK_IMPORTED_MODULE_1__.dateTimestampInSeconds)()
  };
  const integrations = hint.integrations || options.integrations.map(i => i.name);
  applyClientOptions(prepared, options);
  applyIntegrationsMetadata(prepared, integrations);
  if (client) {
    client.emit('applyFrameMetadata', event);
  }

  // Only put debug IDs onto frames for error events.
  if (event.type === undefined) {
    applyDebugIds(prepared, options.stackParser);
  }

  // If we have scope given to us, use it as the base for further modifications.
  // This allows us to prevent unnecessary copying of data if `captureContext` is not provided.
  const finalScope = getFinalScope(scope, hint.captureContext);
  if (hint.mechanism) {
    (0,_utils_hoist_misc_js__WEBPACK_IMPORTED_MODULE_0__.addExceptionMechanism)(prepared, hint.mechanism);
  }
  const clientEventProcessors = client ? client.getEventProcessors() : [];

  // This should be the last thing called, since we want that
  // {@link Scope.addEventProcessor} gets the finished prepared event.
  // Merge scope data together
  const data = (0,_currentScopes_js__WEBPACK_IMPORTED_MODULE_2__.getGlobalScope)().getScopeData();
  if (isolationScope) {
    const isolationData = isolationScope.getScopeData();
    (0,_applyScopeDataToEvent_js__WEBPACK_IMPORTED_MODULE_3__.mergeScopeData)(data, isolationData);
  }
  if (finalScope) {
    const finalScopeData = finalScope.getScopeData();
    (0,_applyScopeDataToEvent_js__WEBPACK_IMPORTED_MODULE_3__.mergeScopeData)(data, finalScopeData);
  }
  const attachments = [...(hint.attachments || []), ...data.attachments];
  if (attachments.length) {
    hint.attachments = attachments;
  }
  (0,_applyScopeDataToEvent_js__WEBPACK_IMPORTED_MODULE_3__.applyScopeDataToEvent)(prepared, data);
  const eventProcessors = [...clientEventProcessors,
  // Run scope event processors _after_ all other processors
  ...data.eventProcessors];
  const result = (0,_eventProcessors_js__WEBPACK_IMPORTED_MODULE_4__.notifyEventProcessors)(eventProcessors, prepared, hint);
  return result.then(evt => {
    if (evt) {
      // We apply the debug_meta field only after all event processors have ran, so that if any event processors modified
      // file names (e.g.the RewriteFrames integration) the filename -> debug ID relationship isn't destroyed.
      // This should not cause any PII issues, since we're only moving data that is already on the event and not adding
      // any new data
      applyDebugMeta(evt);
    }
    if (typeof normalizeDepth === 'number' && normalizeDepth > 0) {
      return normalizeEvent(evt, normalizeDepth, normalizeMaxBreadth);
    }
    return evt;
  });
}

/**
 * Enhances event using the client configuration.
 * It takes care of all "static" values like environment, release and `dist`,
 * as well as truncating overly long values.
 *
 * Only exported for tests.
 *
 * @param event event instance to be enhanced
 */
function applyClientOptions(event, options) {
  const {
    environment,
    release,
    dist,
    maxValueLength = 250
  } = options;

  // empty strings do not make sense for environment, release, and dist
  // so we handle them the same as if they were not provided
  event.environment = event.environment || environment || _constants_js__WEBPACK_IMPORTED_MODULE_5__.DEFAULT_ENVIRONMENT;
  if (!event.release && release) {
    event.release = release;
  }
  if (!event.dist && dist) {
    event.dist = dist;
  }
  if (event.message) {
    event.message = (0,_utils_hoist_string_js__WEBPACK_IMPORTED_MODULE_6__.truncate)(event.message, maxValueLength);
  }
  const exception = event.exception?.values?.[0];
  if (exception?.value) {
    exception.value = (0,_utils_hoist_string_js__WEBPACK_IMPORTED_MODULE_6__.truncate)(exception.value, maxValueLength);
  }
  const request = event.request;
  if (request?.url) {
    request.url = (0,_utils_hoist_string_js__WEBPACK_IMPORTED_MODULE_6__.truncate)(request.url, maxValueLength);
  }
}

/**
 * Puts debug IDs into the stack frames of an error event.
 */
function applyDebugIds(event, stackParser) {
  // Build a map of filename -> debug_id
  const filenameDebugIdMap = (0,_utils_hoist_debug_ids_js__WEBPACK_IMPORTED_MODULE_7__.getFilenameToDebugIdMap)(stackParser);
  event.exception?.values?.forEach(exception => {
    exception.stacktrace?.frames?.forEach(frame => {
      if (frame.filename) {
        frame.debug_id = filenameDebugIdMap[frame.filename];
      }
    });
  });
}

/**
 * Moves debug IDs from the stack frames of an error event into the debug_meta field.
 */
function applyDebugMeta(event) {
  // Extract debug IDs and filenames from the stack frames on the event.
  const filenameDebugIdMap = {};
  event.exception?.values?.forEach(exception => {
    exception.stacktrace?.frames?.forEach(frame => {
      if (frame.debug_id) {
        if (frame.abs_path) {
          filenameDebugIdMap[frame.abs_path] = frame.debug_id;
        } else if (frame.filename) {
          filenameDebugIdMap[frame.filename] = frame.debug_id;
        }
        delete frame.debug_id;
      }
    });
  });
  if (Object.keys(filenameDebugIdMap).length === 0) {
    return;
  }

  // Fill debug_meta information
  event.debug_meta = event.debug_meta || {};
  event.debug_meta.images = event.debug_meta.images || [];
  const images = event.debug_meta.images;
  Object.entries(filenameDebugIdMap).forEach(_ref => {
    let [filename, debug_id] = _ref;
    images.push({
      type: 'sourcemap',
      code_file: filename,
      debug_id
    });
  });
}

/**
 * This function adds all used integrations to the SDK info in the event.
 * @param event The event that will be filled with all integrations.
 */
function applyIntegrationsMetadata(event, integrationNames) {
  if (integrationNames.length > 0) {
    event.sdk = event.sdk || {};
    event.sdk.integrations = [...(event.sdk.integrations || []), ...integrationNames];
  }
}

/**
 * Applies `normalize` function on necessary `Event` attributes to make them safe for serialization.
 * Normalized keys:
 * - `breadcrumbs.data`
 * - `user`
 * - `contexts`
 * - `extra`
 * @param event Event
 * @returns Normalized event
 */
function normalizeEvent(event, depth, maxBreadth) {
  if (!event) {
    return null;
  }
  const normalized = {
    ...event,
    ...(event.breadcrumbs && {
      breadcrumbs: event.breadcrumbs.map(b => ({
        ...b,
        ...(b.data && {
          data: (0,_utils_hoist_normalize_js__WEBPACK_IMPORTED_MODULE_8__.normalize)(b.data, depth, maxBreadth)
        })
      }))
    }),
    ...(event.user && {
      user: (0,_utils_hoist_normalize_js__WEBPACK_IMPORTED_MODULE_8__.normalize)(event.user, depth, maxBreadth)
    }),
    ...(event.contexts && {
      contexts: (0,_utils_hoist_normalize_js__WEBPACK_IMPORTED_MODULE_8__.normalize)(event.contexts, depth, maxBreadth)
    }),
    ...(event.extra && {
      extra: (0,_utils_hoist_normalize_js__WEBPACK_IMPORTED_MODULE_8__.normalize)(event.extra, depth, maxBreadth)
    })
  };

  // event.contexts.trace stores information about a Transaction. Similarly,
  // event.spans[] stores information about child Spans. Given that a
  // Transaction is conceptually a Span, normalization should apply to both
  // Transactions and Spans consistently.
  // For now the decision is to skip normalization of Transactions and Spans,
  // so this block overwrites the normalized event to add back the original
  // Transaction information prior to normalization.
  if (event.contexts?.trace && normalized.contexts) {
    normalized.contexts.trace = event.contexts.trace;

    // event.contexts.trace.data may contain circular/dangerous data so we need to normalize it
    if (event.contexts.trace.data) {
      normalized.contexts.trace.data = (0,_utils_hoist_normalize_js__WEBPACK_IMPORTED_MODULE_8__.normalize)(event.contexts.trace.data, depth, maxBreadth);
    }
  }

  // event.spans[].data may contain circular/dangerous data so we need to normalize it
  if (event.spans) {
    normalized.spans = event.spans.map(span => {
      return {
        ...span,
        ...(span.data && {
          data: (0,_utils_hoist_normalize_js__WEBPACK_IMPORTED_MODULE_8__.normalize)(span.data, depth, maxBreadth)
        })
      };
    });
  }

  // event.contexts.flags (FeatureFlagContext) stores context for our feature
  // flag integrations. It has a greater nesting depth than our other typed
  // Contexts, so we re-normalize with a fixed depth of 3 here. We do not want
  // to skip this in case of conflicting, user-provided context.
  if (event.contexts?.flags && normalized.contexts) {
    normalized.contexts.flags = (0,_utils_hoist_normalize_js__WEBPACK_IMPORTED_MODULE_8__.normalize)(event.contexts.flags, 3, maxBreadth);
  }
  return normalized;
}
function getFinalScope(scope, captureContext) {
  if (!captureContext) {
    return scope;
  }
  const finalScope = scope ? scope.clone() : new _scope_js__WEBPACK_IMPORTED_MODULE_9__.Scope();
  finalScope.update(captureContext);
  return finalScope;
}

/**
 * Parse either an `EventHint` directly, or convert a `CaptureContext` to an `EventHint`.
 * This is used to allow to update method signatures that used to accept a `CaptureContext` but should now accept an `EventHint`.
 */
function parseEventHintOrCaptureContext(hint) {
  if (!hint) {
    return undefined;
  }

  // If you pass a Scope or `() => Scope` as CaptureContext, we just return this as captureContext
  if (hintIsScopeOrFunction(hint)) {
    return {
      captureContext: hint
    };
  }
  if (hintIsScopeContext(hint)) {
    return {
      captureContext: hint
    };
  }
  return hint;
}
function hintIsScopeOrFunction(hint) {
  return hint instanceof _scope_js__WEBPACK_IMPORTED_MODULE_9__.Scope || typeof hint === 'function';
}
const captureContextKeys = ['user', 'level', 'extra', 'contexts', 'tags', 'fingerprint', 'propagationContext'];
function hintIsScopeContext(hint) {
  return Object.keys(hint).some(key => captureContextKeys.includes(key));
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/utils/sdkMetadata.js":
/*!******************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/utils/sdkMetadata.js ***!
  \******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   applySdkMetadata: () => (/* binding */ applySdkMetadata)
/* harmony export */ });
/* harmony import */ var _utils_hoist_version_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils-hoist/version.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/version.js");


/**
 * A builder for the SDK metadata in the options for the SDK initialization.
 *
 * Note: This function is identical to `buildMetadata` in Remix and NextJS and SvelteKit.
 * We don't extract it for bundle size reasons.
 * @see https://github.com/getsentry/sentry-javascript/pull/7404
 * @see https://github.com/getsentry/sentry-javascript/pull/4196
 *
 * If you make changes to this function consider updating the others as well.
 *
 * @param options SDK options object that gets mutated
 * @param names list of package names
 */
function applySdkMetadata(options, name, names, source) {
  if (names === void 0) {
    names = [name];
  }
  if (source === void 0) {
    source = 'npm';
  }
  const metadata = options._metadata || {};
  if (!metadata.sdk) {
    metadata.sdk = {
      name: `sentry.javascript.${name}`,
      packages: names.map(name => ({
        name: `${source}:@sentry/${name}`,
        version: _utils_hoist_version_js__WEBPACK_IMPORTED_MODULE_0__.SDK_VERSION
      })),
      version: _utils_hoist_version_js__WEBPACK_IMPORTED_MODULE_0__.SDK_VERSION
    };
  }
  options._metadata = metadata;
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/utils/spanOnScope.js":
/*!******************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/utils/spanOnScope.js ***!
  \******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   _getSpanForScope: () => (/* binding */ _getSpanForScope),
/* harmony export */   _setSpanForScope: () => (/* binding */ _setSpanForScope)
/* harmony export */ });
/* harmony import */ var _utils_hoist_object_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils-hoist/object.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/object.js");

const SCOPE_SPAN_FIELD = '_sentrySpan';

/**
 * Set the active span for a given scope.
 * NOTE: This should NOT be used directly, but is only used internally by the trace methods.
 */
function _setSpanForScope(scope, span) {
  if (span) {
    (0,_utils_hoist_object_js__WEBPACK_IMPORTED_MODULE_0__.addNonEnumerableProperty)(scope, SCOPE_SPAN_FIELD, span);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete scope[SCOPE_SPAN_FIELD];
  }
}

/**
 * Get the active span for a given scope.
 * NOTE: This should NOT be used directly, but is only used internally by the trace methods.
 */
function _getSpanForScope(scope) {
  return scope[SCOPE_SPAN_FIELD];
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/utils/spanUtils.js":
/*!****************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/utils/spanUtils.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TRACE_FLAG_NONE: () => (/* binding */ TRACE_FLAG_NONE),
/* harmony export */   TRACE_FLAG_SAMPLED: () => (/* binding */ TRACE_FLAG_SAMPLED),
/* harmony export */   addChildSpanToSpan: () => (/* binding */ addChildSpanToSpan),
/* harmony export */   convertSpanLinksForEnvelope: () => (/* binding */ convertSpanLinksForEnvelope),
/* harmony export */   getActiveSpan: () => (/* binding */ getActiveSpan),
/* harmony export */   getRootSpan: () => (/* binding */ getRootSpan),
/* harmony export */   getSpanDescendants: () => (/* binding */ getSpanDescendants),
/* harmony export */   getStatusMessage: () => (/* binding */ getStatusMessage),
/* harmony export */   removeChildSpanFromSpan: () => (/* binding */ removeChildSpanFromSpan),
/* harmony export */   showSpanDropWarning: () => (/* binding */ showSpanDropWarning),
/* harmony export */   spanIsSampled: () => (/* binding */ spanIsSampled),
/* harmony export */   spanTimeInputToSeconds: () => (/* binding */ spanTimeInputToSeconds),
/* harmony export */   spanToJSON: () => (/* binding */ spanToJSON),
/* harmony export */   spanToTraceContext: () => (/* binding */ spanToTraceContext),
/* harmony export */   spanToTraceHeader: () => (/* binding */ spanToTraceHeader),
/* harmony export */   spanToTransactionTraceContext: () => (/* binding */ spanToTransactionTraceContext),
/* harmony export */   updateSpanName: () => (/* binding */ updateSpanName)
/* harmony export */ });
/* harmony import */ var _asyncContext_index_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../asyncContext/index.js */ "./node_modules/@sentry/core/build/esm/asyncContext/index.js");
/* harmony import */ var _carrier_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../carrier.js */ "./node_modules/@sentry/core/build/esm/carrier.js");
/* harmony import */ var _currentScopes_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../currentScopes.js */ "./node_modules/@sentry/core/build/esm/currentScopes.js");
/* harmony import */ var _semanticAttributes_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../semanticAttributes.js */ "./node_modules/@sentry/core/build/esm/semanticAttributes.js");
/* harmony import */ var _tracing_spanstatus_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../tracing/spanstatus.js */ "./node_modules/@sentry/core/build/esm/tracing/spanstatus.js");
/* harmony import */ var _tracing_utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../tracing/utils.js */ "./node_modules/@sentry/core/build/esm/tracing/utils.js");
/* harmony import */ var _utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../utils-hoist/logger.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/logger.js");
/* harmony import */ var _utils_hoist_object_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils-hoist/object.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/object.js");
/* harmony import */ var _utils_hoist_propagationContext_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils-hoist/propagationContext.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/propagationContext.js");
/* harmony import */ var _utils_hoist_time_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils-hoist/time.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/time.js");
/* harmony import */ var _utils_hoist_tracing_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils-hoist/tracing.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/tracing.js");
/* harmony import */ var _spanOnScope_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./spanOnScope.js */ "./node_modules/@sentry/core/build/esm/utils/spanOnScope.js");













// These are aligned with OpenTelemetry trace flags
const TRACE_FLAG_NONE = 0x0;
const TRACE_FLAG_SAMPLED = 0x1;
let hasShownSpanDropWarning = false;

/**
 * Convert a span to a trace context, which can be sent as the `trace` context in an event.
 * By default, this will only include trace_id, span_id & parent_span_id.
 * If `includeAllData` is true, it will also include data, op, status & origin.
 */
function spanToTransactionTraceContext(span) {
  const {
    spanId: span_id,
    traceId: trace_id
  } = span.spanContext();
  const {
    data,
    op,
    parent_span_id,
    status,
    origin,
    links
  } = spanToJSON(span);
  return (0,_utils_hoist_object_js__WEBPACK_IMPORTED_MODULE_0__.dropUndefinedKeys)({
    parent_span_id,
    span_id,
    trace_id,
    data,
    op,
    status,
    origin,
    links
  });
}

/**
 * Convert a span to a trace context, which can be sent as the `trace` context in a non-transaction event.
 */
function spanToTraceContext(span) {
  const {
    spanId,
    traceId: trace_id,
    isRemote
  } = span.spanContext();

  // If the span is remote, we use a random/virtual span as span_id to the trace context,
  // and the remote span as parent_span_id
  const parent_span_id = isRemote ? spanId : spanToJSON(span).parent_span_id;
  const scope = (0,_tracing_utils_js__WEBPACK_IMPORTED_MODULE_1__.getCapturedScopesOnSpan)(span).scope;
  const span_id = isRemote ? scope?.getPropagationContext().propagationSpanId || (0,_utils_hoist_propagationContext_js__WEBPACK_IMPORTED_MODULE_2__.generateSpanId)() : spanId;
  return (0,_utils_hoist_object_js__WEBPACK_IMPORTED_MODULE_0__.dropUndefinedKeys)({
    parent_span_id,
    span_id,
    trace_id
  });
}

/**
 * Convert a Span to a Sentry trace header.
 */
function spanToTraceHeader(span) {
  const {
    traceId,
    spanId
  } = span.spanContext();
  const sampled = spanIsSampled(span);
  return (0,_utils_hoist_tracing_js__WEBPACK_IMPORTED_MODULE_3__.generateSentryTraceHeader)(traceId, spanId, sampled);
}

/**
 *  Converts the span links array to a flattened version to be sent within an envelope.
 *
 *  If the links array is empty, it returns `undefined` so the empty value can be dropped before it's sent.
 */
function convertSpanLinksForEnvelope(links) {
  if (links && links.length > 0) {
    return links.map(_ref => {
      let {
        context: {
          spanId,
          traceId,
          traceFlags,
          ...restContext
        },
        attributes
      } = _ref;
      return {
        span_id: spanId,
        trace_id: traceId,
        sampled: traceFlags === TRACE_FLAG_SAMPLED,
        attributes,
        ...restContext
      };
    });
  } else {
    return undefined;
  }
}

/**
 * Convert a span time input into a timestamp in seconds.
 */
function spanTimeInputToSeconds(input) {
  if (typeof input === 'number') {
    return ensureTimestampInSeconds(input);
  }
  if (Array.isArray(input)) {
    // See {@link HrTime} for the array-based time format
    return input[0] + input[1] / 1e9;
  }
  if (input instanceof Date) {
    return ensureTimestampInSeconds(input.getTime());
  }
  return (0,_utils_hoist_time_js__WEBPACK_IMPORTED_MODULE_4__.timestampInSeconds)();
}

/**
 * Converts a timestamp to second, if it was in milliseconds, or keeps it as second.
 */
function ensureTimestampInSeconds(timestamp) {
  const isMs = timestamp > 9999999999;
  return isMs ? timestamp / 1000 : timestamp;
}

/**
 * Convert a span to a JSON representation.
 */
// Note: Because of this, we currently have a circular type dependency (which we opted out of in package.json).
// This is not avoidable as we need `spanToJSON` in `spanUtils.ts`, which in turn is needed by `span.ts` for backwards compatibility.
// And `spanToJSON` needs the Span class from `span.ts` to check here.
function spanToJSON(span) {
  if (spanIsSentrySpan(span)) {
    return span.getSpanJSON();
  }
  const {
    spanId: span_id,
    traceId: trace_id
  } = span.spanContext();

  // Handle a span from @opentelemetry/sdk-base-trace's `Span` class
  if (spanIsOpenTelemetrySdkTraceBaseSpan(span)) {
    const {
      attributes,
      startTime,
      name,
      endTime,
      parentSpanId,
      status,
      links
    } = span;
    return (0,_utils_hoist_object_js__WEBPACK_IMPORTED_MODULE_0__.dropUndefinedKeys)({
      span_id,
      trace_id,
      data: attributes,
      description: name,
      parent_span_id: parentSpanId,
      start_timestamp: spanTimeInputToSeconds(startTime),
      // This is [0,0] by default in OTEL, in which case we want to interpret this as no end time
      timestamp: spanTimeInputToSeconds(endTime) || undefined,
      status: getStatusMessage(status),
      op: attributes[_semanticAttributes_js__WEBPACK_IMPORTED_MODULE_5__.SEMANTIC_ATTRIBUTE_SENTRY_OP],
      origin: attributes[_semanticAttributes_js__WEBPACK_IMPORTED_MODULE_5__.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN],
      links: convertSpanLinksForEnvelope(links)
    });
  }

  // Finally, at least we have `spanContext()`....
  // This should not actually happen in reality, but we need to handle it for type safety.
  return {
    span_id,
    trace_id,
    start_timestamp: 0,
    data: {}
  };
}
function spanIsOpenTelemetrySdkTraceBaseSpan(span) {
  const castSpan = span;
  return !!castSpan.attributes && !!castSpan.startTime && !!castSpan.name && !!castSpan.endTime && !!castSpan.status;
}

/** Exported only for tests. */

/**
 * Sadly, due to circular dependency checks we cannot actually import the Span class here and check for instanceof.
 * :( So instead we approximate this by checking if it has the `getSpanJSON` method.
 */
function spanIsSentrySpan(span) {
  return typeof span.getSpanJSON === 'function';
}

/**
 * Returns true if a span is sampled.
 * In most cases, you should just use `span.isRecording()` instead.
 * However, this has a slightly different semantic, as it also returns false if the span is finished.
 * So in the case where this distinction is important, use this method.
 */
function spanIsSampled(span) {
  // We align our trace flags with the ones OpenTelemetry use
  // So we also check for sampled the same way they do.
  const {
    traceFlags
  } = span.spanContext();
  return traceFlags === TRACE_FLAG_SAMPLED;
}

/** Get the status message to use for a JSON representation of a span. */
function getStatusMessage(status) {
  if (!status || status.code === _tracing_spanstatus_js__WEBPACK_IMPORTED_MODULE_6__.SPAN_STATUS_UNSET) {
    return undefined;
  }
  if (status.code === _tracing_spanstatus_js__WEBPACK_IMPORTED_MODULE_6__.SPAN_STATUS_OK) {
    return 'ok';
  }
  return status.message || 'unknown_error';
}
const CHILD_SPANS_FIELD = '_sentryChildSpans';
const ROOT_SPAN_FIELD = '_sentryRootSpan';

/**
 * Adds an opaque child span reference to a span.
 */
function addChildSpanToSpan(span, childSpan) {
  // We store the root span reference on the child span
  // We need this for `getRootSpan()` to work
  const rootSpan = span[ROOT_SPAN_FIELD] || span;
  (0,_utils_hoist_object_js__WEBPACK_IMPORTED_MODULE_0__.addNonEnumerableProperty)(childSpan, ROOT_SPAN_FIELD, rootSpan);

  // We store a list of child spans on the parent span
  // We need this for `getSpanDescendants()` to work
  if (span[CHILD_SPANS_FIELD]) {
    span[CHILD_SPANS_FIELD].add(childSpan);
  } else {
    (0,_utils_hoist_object_js__WEBPACK_IMPORTED_MODULE_0__.addNonEnumerableProperty)(span, CHILD_SPANS_FIELD, new Set([childSpan]));
  }
}

/** This is only used internally by Idle Spans. */
function removeChildSpanFromSpan(span, childSpan) {
  if (span[CHILD_SPANS_FIELD]) {
    span[CHILD_SPANS_FIELD].delete(childSpan);
  }
}

/**
 * Returns an array of the given span and all of its descendants.
 */
function getSpanDescendants(span) {
  const resultSet = new Set();
  function addSpanChildren(span) {
    // This exit condition is required to not infinitely loop in case of a circular dependency.
    if (resultSet.has(span)) {
      return;
      // We want to ignore unsampled spans (e.g. non recording spans)
    } else if (spanIsSampled(span)) {
      resultSet.add(span);
      const childSpans = span[CHILD_SPANS_FIELD] ? Array.from(span[CHILD_SPANS_FIELD]) : [];
      for (const childSpan of childSpans) {
        addSpanChildren(childSpan);
      }
    }
  }
  addSpanChildren(span);
  return Array.from(resultSet);
}

/**
 * Returns the root span of a given span.
 */
function getRootSpan(span) {
  return span[ROOT_SPAN_FIELD] || span;
}

/**
 * Returns the currently active span.
 */
function getActiveSpan() {
  const carrier = (0,_carrier_js__WEBPACK_IMPORTED_MODULE_7__.getMainCarrier)();
  const acs = (0,_asyncContext_index_js__WEBPACK_IMPORTED_MODULE_8__.getAsyncContextStrategy)(carrier);
  if (acs.getActiveSpan) {
    return acs.getActiveSpan();
  }
  return (0,_spanOnScope_js__WEBPACK_IMPORTED_MODULE_9__._getSpanForScope)((0,_currentScopes_js__WEBPACK_IMPORTED_MODULE_10__.getCurrentScope)());
}

/**
 * Logs a warning once if `beforeSendSpan` is used to drop spans.
 */
function showSpanDropWarning() {
  if (!hasShownSpanDropWarning) {
    (0,_utils_hoist_logger_js__WEBPACK_IMPORTED_MODULE_11__.consoleSandbox)(() => {
      // eslint-disable-next-line no-console
      console.warn('[Sentry] Returning null from `beforeSendSpan` is disallowed. To drop certain spans, configure the respective integrations directly.');
    });
    hasShownSpanDropWarning = true;
  }
}

/**
 * Updates the name of the given span and ensures that the span name is not
 * overwritten by the Sentry SDK.
 *
 * Use this function instead of `span.updateName()` if you want to make sure that
 * your name is kept. For some spans, for example root `http.server` spans the
 * Sentry SDK would otherwise overwrite the span name with a high-quality name
 * it infers when the span ends.
 *
 * Use this function in server code or when your span is started on the server
 * and on the client (browser). If you only update a span name on the client,
 * you can also use `span.updateName()` the SDK does not overwrite the name.
 *
 * @param span - The span to update the name of.
 * @param name - The name to set on the span.
 */
function updateSpanName(span, name) {
  span.updateName(name);
  span.setAttributes({
    [_semanticAttributes_js__WEBPACK_IMPORTED_MODULE_5__.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: 'custom',
    [_semanticAttributes_js__WEBPACK_IMPORTED_MODULE_5__.SEMANTIC_ATTRIBUTE_SENTRY_CUSTOM_SPAN_NAME]: name
  });
}


/***/ }),

/***/ "./node_modules/@sentry/core/build/esm/utils/transactionEvent.js":
/*!***********************************************************************!*\
  !*** ./node_modules/@sentry/core/build/esm/utils/transactionEvent.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   convertSpanJsonToTransactionEvent: () => (/* binding */ convertSpanJsonToTransactionEvent),
/* harmony export */   convertTransactionEventToSpanJson: () => (/* binding */ convertTransactionEventToSpanJson)
/* harmony export */ });
/* harmony import */ var _semanticAttributes_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../semanticAttributes.js */ "./node_modules/@sentry/core/build/esm/semanticAttributes.js");
/* harmony import */ var _utils_hoist_object_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils-hoist/object.js */ "./node_modules/@sentry/core/build/esm/utils-hoist/object.js");







/**
 * Converts a transaction event to a span JSON object.
 */
function convertTransactionEventToSpanJson(event) {
  const {
    trace_id,
    parent_span_id,
    span_id,
    status,
    origin,
    data,
    op
  } = event.contexts?.trace ?? {};
  return (0,_utils_hoist_object_js__WEBPACK_IMPORTED_MODULE_0__.dropUndefinedKeys)({
    data: data ?? {},
    description: event.transaction,
    op,
    parent_span_id,
    span_id: span_id ?? '',
    start_timestamp: event.start_timestamp ?? 0,
    status,
    timestamp: event.timestamp,
    trace_id: trace_id ?? '',
    origin,
    profile_id: data?.[_semanticAttributes_js__WEBPACK_IMPORTED_MODULE_1__.SEMANTIC_ATTRIBUTE_PROFILE_ID],
    exclusive_time: data?.[_semanticAttributes_js__WEBPACK_IMPORTED_MODULE_1__.SEMANTIC_ATTRIBUTE_EXCLUSIVE_TIME],
    measurements: event.measurements,
    is_segment: true
  });
}

/**
 * Converts a span JSON object to a transaction event.
 */
function convertSpanJsonToTransactionEvent(span) {
  const event = {
    type: 'transaction',
    timestamp: span.timestamp,
    start_timestamp: span.start_timestamp,
    transaction: span.description,
    contexts: {
      trace: {
        trace_id: span.trace_id,
        span_id: span.span_id,
        parent_span_id: span.parent_span_id,
        op: span.op,
        status: span.status,
        origin: span.origin,
        data: {
          ...span.data,
          ...(span.profile_id && {
            [_semanticAttributes_js__WEBPACK_IMPORTED_MODULE_1__.SEMANTIC_ATTRIBUTE_PROFILE_ID]: span.profile_id
          }),
          ...(span.exclusive_time && {
            [_semanticAttributes_js__WEBPACK_IMPORTED_MODULE_1__.SEMANTIC_ATTRIBUTE_EXCLUSIVE_TIME]: span.exclusive_time
          })
        }
      }
    },
    measurements: span.measurements
  };
  return (0,_utils_hoist_object_js__WEBPACK_IMPORTED_MODULE_0__.dropUndefinedKeys)(event);
}


/***/ }),

/***/ "./node_modules/@sentry/integrations/esm/captureconsole.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@sentry/integrations/esm/captureconsole.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CaptureConsole: () => (/* binding */ CaptureConsole),
/* harmony export */   captureConsoleIntegration: () => (/* binding */ captureConsoleIntegration)
/* harmony export */ });
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/exports.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/integration.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/logger.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/worldwide.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/instrument/console.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/severity.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/misc.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/string.js");


const INTEGRATION_NAME = 'CaptureConsole';
const _captureConsoleIntegration = function (options) {
  if (options === void 0) {
    options = {};
  }
  const levels = options.levels || _sentry_utils__WEBPACK_IMPORTED_MODULE_0__.CONSOLE_LEVELS;
  return {
    name: INTEGRATION_NAME,
    // TODO v8: Remove this
    setupOnce() {},
    // eslint-disable-line @typescript-eslint/no-empty-function
    setup(client) {
      if (!("console" in _sentry_utils__WEBPACK_IMPORTED_MODULE_1__.GLOBAL_OBJ)) {
        return;
      }
      (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_2__.addConsoleInstrumentationHandler)(_ref => {
        let {
          args,
          level
        } = _ref;
        if ((0,_sentry_core__WEBPACK_IMPORTED_MODULE_3__.getClient)() !== client || !levels.includes(level)) {
          return;
        }
        consoleHandler(args, level);
      });
    }
  };
};
const captureConsoleIntegration = (0,_sentry_core__WEBPACK_IMPORTED_MODULE_4__.defineIntegration)(_captureConsoleIntegration);

/**
 * Send Console API calls as Sentry Events.
 * @deprecated Use `captureConsoleIntegration()` instead.
 */
// eslint-disable-next-line deprecation/deprecation
const CaptureConsole = (0,_sentry_core__WEBPACK_IMPORTED_MODULE_4__.convertIntegrationFnToClass)(INTEGRATION_NAME, captureConsoleIntegration);
function consoleHandler(args, level) {
  const captureContext = {
    level: (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_5__.severityLevelFromString)(level),
    extra: {
      arguments: args
    }
  };
  (0,_sentry_core__WEBPACK_IMPORTED_MODULE_3__.withScope)(scope => {
    scope.addEventProcessor(event => {
      event.logger = 'console';
      (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_6__.addExceptionMechanism)(event, {
        handled: false,
        type: 'console'
      });
      return event;
    });
    if (level === 'assert' && args[0] === false) {
      const message = `Assertion failed: ${(0,_sentry_utils__WEBPACK_IMPORTED_MODULE_7__.safeJoin)(args.slice(1), ' ') || 'console.assert'}`;
      scope.setExtra('arguments', args.slice(1));
      (0,_sentry_core__WEBPACK_IMPORTED_MODULE_3__.captureMessage)(message, captureContext);
      return;
    }
    const error = args.find(arg => arg instanceof Error);
    if (level === 'error' && error) {
      (0,_sentry_core__WEBPACK_IMPORTED_MODULE_3__.captureException)(error, captureContext);
      return;
    }
    const message = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_7__.safeJoin)(args, ' ');
    (0,_sentry_core__WEBPACK_IMPORTED_MODULE_3__.captureMessage)(message, captureContext);
  });
}


/***/ }),

/***/ "./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/constants.js":
/*!**************************************************************************************!*\
  !*** ./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/constants.js ***!
  \**************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DEFAULT_ENVIRONMENT: () => (/* binding */ DEFAULT_ENVIRONMENT)
/* harmony export */ });
const DEFAULT_ENVIRONMENT = 'production';


/***/ }),

/***/ "./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/debug-build.js":
/*!****************************************************************************************!*\
  !*** ./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/debug-build.js ***!
  \****************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DEBUG_BUILD: () => (/* binding */ DEBUG_BUILD)
/* harmony export */ });
/**
 * This serves as a build time flag that will be true by default, but false in non-debug builds or if users replace `__SENTRY_DEBUG__` in their generated code.
 *
 * ATTENTION: This constant must never cross package boundaries (i.e. be exported) to guarantee that it can be used for tree shaking.
 */
const DEBUG_BUILD =  false || false;


/***/ }),

/***/ "./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/eventProcessors.js":
/*!********************************************************************************************!*\
  !*** ./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/eventProcessors.js ***!
  \********************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addGlobalEventProcessor: () => (/* binding */ addGlobalEventProcessor),
/* harmony export */   getGlobalEventProcessors: () => (/* binding */ getGlobalEventProcessors),
/* harmony export */   notifyEventProcessors: () => (/* binding */ notifyEventProcessors)
/* harmony export */ });
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/worldwide.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/syncpromise.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/logger.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/is.js");
/* harmony import */ var _debug_build_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./debug-build.js */ "./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/debug-build.js");



/**
 * Returns the global event processors.
 * @deprecated Global event processors will be removed in v8.
 */
function getGlobalEventProcessors() {
  return (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_0__.getGlobalSingleton)('globalEventProcessors', () => []);
}

/**
 * Add a EventProcessor to be kept globally.
 * @deprecated Use `addEventProcessor` instead. Global event processors will be removed in v8.
 */
function addGlobalEventProcessor(callback) {
  // eslint-disable-next-line deprecation/deprecation
  getGlobalEventProcessors().push(callback);
}

/**
 * Process an array of event processors, returning the processed event (or `null` if the event was dropped).
 */
function notifyEventProcessors(processors, event, hint, index) {
  if (index === void 0) {
    index = 0;
  }
  return new _sentry_utils__WEBPACK_IMPORTED_MODULE_1__.SyncPromise((resolve, reject) => {
    const processor = processors[index];
    if (event === null || typeof processor !== 'function') {
      resolve(event);
    } else {
      const result = processor({
        ...event
      }, hint);
      _debug_build_js__WEBPACK_IMPORTED_MODULE_2__.DEBUG_BUILD && processor.id && result === null && _sentry_utils__WEBPACK_IMPORTED_MODULE_3__.logger.log(`Event processor "${processor.id}" dropped event`);
      if ((0,_sentry_utils__WEBPACK_IMPORTED_MODULE_4__.isThenable)(result)) {
        void result.then(final => notifyEventProcessors(processors, final, hint, index + 1).then(resolve)).then(null, reject);
      } else {
        void notifyEventProcessors(processors, result, hint, index + 1).then(resolve).then(null, reject);
      }
    }
  });
}


/***/ }),

/***/ "./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/exports.js":
/*!************************************************************************************!*\
  !*** ./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/exports.js ***!
  \************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addBreadcrumb: () => (/* binding */ addBreadcrumb),
/* harmony export */   captureCheckIn: () => (/* binding */ captureCheckIn),
/* harmony export */   captureEvent: () => (/* binding */ captureEvent),
/* harmony export */   captureException: () => (/* binding */ captureException),
/* harmony export */   captureMessage: () => (/* binding */ captureMessage),
/* harmony export */   captureSession: () => (/* binding */ captureSession),
/* harmony export */   close: () => (/* binding */ close),
/* harmony export */   configureScope: () => (/* binding */ configureScope),
/* harmony export */   endSession: () => (/* binding */ endSession),
/* harmony export */   flush: () => (/* binding */ flush),
/* harmony export */   getClient: () => (/* binding */ getClient),
/* harmony export */   getCurrentScope: () => (/* binding */ getCurrentScope),
/* harmony export */   isInitialized: () => (/* binding */ isInitialized),
/* harmony export */   lastEventId: () => (/* binding */ lastEventId),
/* harmony export */   setContext: () => (/* binding */ setContext),
/* harmony export */   setExtra: () => (/* binding */ setExtra),
/* harmony export */   setExtras: () => (/* binding */ setExtras),
/* harmony export */   setTag: () => (/* binding */ setTag),
/* harmony export */   setTags: () => (/* binding */ setTags),
/* harmony export */   setUser: () => (/* binding */ setUser),
/* harmony export */   startSession: () => (/* binding */ startSession),
/* harmony export */   startTransaction: () => (/* binding */ startTransaction),
/* harmony export */   withActiveSpan: () => (/* binding */ withActiveSpan),
/* harmony export */   withIsolationScope: () => (/* binding */ withIsolationScope),
/* harmony export */   withMonitor: () => (/* binding */ withMonitor),
/* harmony export */   withScope: () => (/* binding */ withScope)
/* harmony export */ });
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/logger.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/misc.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/time.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/is.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/worldwide.js");
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./constants.js */ "./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/constants.js");
/* harmony import */ var _debug_build_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./debug-build.js */ "./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/debug-build.js");
/* harmony import */ var _hub_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./hub.js */ "./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/hub.js");
/* harmony import */ var _session_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./session.js */ "./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/session.js");
/* harmony import */ var _utils_prepareEvent_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils/prepareEvent.js */ "./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/utils/prepareEvent.js");







/**
 * Captures an exception event and sends it to Sentry.
 *
 * @param exception The exception to capture.
 * @param hint Optional additional data to attach to the Sentry event.
 * @returns the id of the captured Sentry event.
 */
function captureException(
// eslint-disable-next-line @typescript-eslint/no-explicit-any
exception, hint) {
  // eslint-disable-next-line deprecation/deprecation
  return (0,_hub_js__WEBPACK_IMPORTED_MODULE_0__.getCurrentHub)().captureException(exception, (0,_utils_prepareEvent_js__WEBPACK_IMPORTED_MODULE_1__.parseEventHintOrCaptureContext)(hint));
}

/**
 * Captures a message event and sends it to Sentry.
 *
 * @param exception The exception to capture.
 * @param captureContext Define the level of the message or pass in additional data to attach to the message.
 * @returns the id of the captured message.
 */
function captureMessage(message,
// eslint-disable-next-line deprecation/deprecation
captureContext) {
  // This is necessary to provide explicit scopes upgrade, without changing the original
  // arity of the `captureMessage(message, level)` method.
  const level = typeof captureContext === 'string' ? captureContext : undefined;
  const context = typeof captureContext !== 'string' ? {
    captureContext
  } : undefined;
  // eslint-disable-next-line deprecation/deprecation
  return (0,_hub_js__WEBPACK_IMPORTED_MODULE_0__.getCurrentHub)().captureMessage(message, level, context);
}

/**
 * Captures a manually created event and sends it to Sentry.
 *
 * @param exception The event to send to Sentry.
 * @param hint Optional additional data to attach to the Sentry event.
 * @returns the id of the captured event.
 */
function captureEvent(event, hint) {
  // eslint-disable-next-line deprecation/deprecation
  return (0,_hub_js__WEBPACK_IMPORTED_MODULE_0__.getCurrentHub)().captureEvent(event, hint);
}

/**
 * Callback to set context information onto the scope.
 * @param callback Callback function that receives Scope.
 *
 * @deprecated Use getCurrentScope() directly.
 */
// eslint-disable-next-line deprecation/deprecation
function configureScope(callback) {
  // eslint-disable-next-line deprecation/deprecation
  (0,_hub_js__WEBPACK_IMPORTED_MODULE_0__.getCurrentHub)().configureScope(callback);
}

/**
 * Records a new breadcrumb which will be attached to future events.
 *
 * Breadcrumbs will be added to subsequent events to provide more context on
 * user's actions prior to an error or crash.
 *
 * @param breadcrumb The breadcrumb to record.
 */
// eslint-disable-next-line deprecation/deprecation
function addBreadcrumb(breadcrumb, hint) {
  // eslint-disable-next-line deprecation/deprecation
  (0,_hub_js__WEBPACK_IMPORTED_MODULE_0__.getCurrentHub)().addBreadcrumb(breadcrumb, hint);
}

/**
 * Sets context data with the given name.
 * @param name of the context
 * @param context Any kind of data. This data will be normalized.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any, deprecation/deprecation
function setContext(name, context) {
  // eslint-disable-next-line deprecation/deprecation
  (0,_hub_js__WEBPACK_IMPORTED_MODULE_0__.getCurrentHub)().setContext(name, context);
}

/**
 * Set an object that will be merged sent as extra data with the event.
 * @param extras Extras object to merge into current context.
 */
// eslint-disable-next-line deprecation/deprecation
function setExtras(extras) {
  // eslint-disable-next-line deprecation/deprecation
  (0,_hub_js__WEBPACK_IMPORTED_MODULE_0__.getCurrentHub)().setExtras(extras);
}

/**
 * Set key:value that will be sent as extra data with the event.
 * @param key String of extra
 * @param extra Any kind of data. This data will be normalized.
 */
// eslint-disable-next-line deprecation/deprecation
function setExtra(key, extra) {
  // eslint-disable-next-line deprecation/deprecation
  (0,_hub_js__WEBPACK_IMPORTED_MODULE_0__.getCurrentHub)().setExtra(key, extra);
}

/**
 * Set an object that will be merged sent as tags data with the event.
 * @param tags Tags context object to merge into current context.
 */
// eslint-disable-next-line deprecation/deprecation
function setTags(tags) {
  // eslint-disable-next-line deprecation/deprecation
  (0,_hub_js__WEBPACK_IMPORTED_MODULE_0__.getCurrentHub)().setTags(tags);
}

/**
 * Set key:value that will be sent as tags data with the event.
 *
 * Can also be used to unset a tag, by passing `undefined`.
 *
 * @param key String key of tag
 * @param value Value of tag
 */
// eslint-disable-next-line deprecation/deprecation
function setTag(key, value) {
  // eslint-disable-next-line deprecation/deprecation
  (0,_hub_js__WEBPACK_IMPORTED_MODULE_0__.getCurrentHub)().setTag(key, value);
}

/**
 * Updates user context information for future events.
 *
 * @param user User context object to be set in the current context. Pass `null` to unset the user.
 */
// eslint-disable-next-line deprecation/deprecation
function setUser(user) {
  // eslint-disable-next-line deprecation/deprecation
  (0,_hub_js__WEBPACK_IMPORTED_MODULE_0__.getCurrentHub)().setUser(user);
}

/**
 * Creates a new scope with and executes the given operation within.
 * The scope is automatically removed once the operation
 * finishes or throws.
 *
 * This is essentially a convenience function for:
 *
 *     pushScope();
 *     callback();
 *     popScope();
 */

/**
 * Either creates a new active scope, or sets the given scope as active scope in the given callback.
 */
function withScope() {
  // eslint-disable-next-line deprecation/deprecation
  const hub = (0,_hub_js__WEBPACK_IMPORTED_MODULE_0__.getCurrentHub)();

  // If a scope is defined, we want to make this the active scope instead of the default one
  for (var _len = arguments.length, rest = new Array(_len), _key = 0; _key < _len; _key++) {
    rest[_key] = arguments[_key];
  }
  if (rest.length === 2) {
    const [scope, callback] = rest;
    if (!scope) {
      // eslint-disable-next-line deprecation/deprecation
      return hub.withScope(callback);
    }

    // eslint-disable-next-line deprecation/deprecation
    return hub.withScope(() => {
      // eslint-disable-next-line deprecation/deprecation
      hub.getStackTop().scope = scope;
      return callback(scope);
    });
  }

  // eslint-disable-next-line deprecation/deprecation
  return hub.withScope(rest[0]);
}

/**
 * Attempts to fork the current isolation scope and the current scope based on the current async context strategy. If no
 * async context strategy is set, the isolation scope and the current scope will not be forked (this is currently the
 * case, for example, in the browser).
 *
 * Usage of this function in environments without async context strategy is discouraged and may lead to unexpected behaviour.
 *
 * This function is intended for Sentry SDK and SDK integration development. It is not recommended to be used in "normal"
 * applications directly because it comes with pitfalls. Use at your own risk!
 *
 * @param callback The callback in which the passed isolation scope is active. (Note: In environments without async
 * context strategy, the currently active isolation scope may change within execution of the callback.)
 * @returns The same value that `callback` returns.
 */
function withIsolationScope(callback) {
  return (0,_hub_js__WEBPACK_IMPORTED_MODULE_0__.runWithAsyncContext)(() => {
    return callback((0,_hub_js__WEBPACK_IMPORTED_MODULE_0__.getIsolationScope)());
  });
}

/**
 * Forks the current scope and sets the provided span as active span in the context of the provided callback.
 *
 * @param span Spans started in the context of the provided callback will be children of this span.
 * @param callback Execution context in which the provided span will be active. Is passed the newly forked scope.
 * @returns the value returned from the provided callback function.
 */
function withActiveSpan(span, callback) {
  return withScope(scope => {
    // eslint-disable-next-line deprecation/deprecation
    scope.setSpan(span);
    return callback(scope);
  });
}

/**
 * Starts a new `Transaction` and returns it. This is the entry point to manual tracing instrumentation.
 *
 * A tree structure can be built by adding child spans to the transaction, and child spans to other spans. To start a
 * new child span within the transaction or any span, call the respective `.startChild()` method.
 *
 * Every child span must be finished before the transaction is finished, otherwise the unfinished spans are discarded.
 *
 * The transaction must be finished with a call to its `.end()` method, at which point the transaction with all its
 * finished child spans will be sent to Sentry.
 *
 * NOTE: This function should only be used for *manual* instrumentation. Auto-instrumentation should call
 * `startTransaction` directly on the hub.
 *
 * @param context Properties of the new `Transaction`.
 * @param customSamplingContext Information given to the transaction sampling function (along with context-dependent
 * default values). See {@link Options.tracesSampler}.
 *
 * @returns The transaction which was just started
 *
 * @deprecated Use `startSpan()`, `startSpanManual()` or `startInactiveSpan()` instead.
 */
function startTransaction(context, customSamplingContext
// eslint-disable-next-line deprecation/deprecation
) {
  // eslint-disable-next-line deprecation/deprecation
  return (0,_hub_js__WEBPACK_IMPORTED_MODULE_0__.getCurrentHub)().startTransaction({
    ...context
  }, customSamplingContext);
}

/**
 * Create a cron monitor check in and send it to Sentry.
 *
 * @param checkIn An object that describes a check in.
 * @param upsertMonitorConfig An optional object that describes a monitor config. Use this if you want
 * to create a monitor automatically when sending a check in.
 */
function captureCheckIn(checkIn, upsertMonitorConfig) {
  const scope = getCurrentScope();
  const client = getClient();
  if (!client) {
    _debug_build_js__WEBPACK_IMPORTED_MODULE_2__.DEBUG_BUILD && _sentry_utils__WEBPACK_IMPORTED_MODULE_3__.logger.warn('Cannot capture check-in. No client defined.');
  } else if (!client.captureCheckIn) {
    _debug_build_js__WEBPACK_IMPORTED_MODULE_2__.DEBUG_BUILD && _sentry_utils__WEBPACK_IMPORTED_MODULE_3__.logger.warn('Cannot capture check-in. Client does not support sending check-ins.');
  } else {
    return client.captureCheckIn(checkIn, upsertMonitorConfig, scope);
  }
  return (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_4__.uuid4)();
}

/**
 * Wraps a callback with a cron monitor check in. The check in will be sent to Sentry when the callback finishes.
 *
 * @param monitorSlug The distinct slug of the monitor.
 * @param upsertMonitorConfig An optional object that describes a monitor config. Use this if you want
 * to create a monitor automatically when sending a check in.
 */
function withMonitor(monitorSlug, callback, upsertMonitorConfig) {
  const checkInId = captureCheckIn({
    monitorSlug,
    status: 'in_progress'
  }, upsertMonitorConfig);
  const now = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_5__.timestampInSeconds)();
  function finishCheckIn(status) {
    captureCheckIn({
      monitorSlug,
      status,
      checkInId,
      duration: (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_5__.timestampInSeconds)() - now
    });
  }
  let maybePromiseResult;
  try {
    maybePromiseResult = callback();
  } catch (e) {
    finishCheckIn('error');
    throw e;
  }
  if ((0,_sentry_utils__WEBPACK_IMPORTED_MODULE_6__.isThenable)(maybePromiseResult)) {
    Promise.resolve(maybePromiseResult).then(() => {
      finishCheckIn('ok');
    }, () => {
      finishCheckIn('error');
    });
  } else {
    finishCheckIn('ok');
  }
  return maybePromiseResult;
}

/**
 * Call `flush()` on the current client, if there is one. See {@link Client.flush}.
 *
 * @param timeout Maximum time in ms the client should wait to flush its event queue. Omitting this parameter will cause
 * the client to wait until all events are sent before resolving the promise.
 * @returns A promise which resolves to `true` if the queue successfully drains before the timeout, or `false` if it
 * doesn't (or if there's no client defined).
 */
async function flush(timeout) {
  const client = getClient();
  if (client) {
    return client.flush(timeout);
  }
  _debug_build_js__WEBPACK_IMPORTED_MODULE_2__.DEBUG_BUILD && _sentry_utils__WEBPACK_IMPORTED_MODULE_3__.logger.warn('Cannot flush events. No client defined.');
  return Promise.resolve(false);
}

/**
 * Call `close()` on the current client, if there is one. See {@link Client.close}.
 *
 * @param timeout Maximum time in ms the client should wait to flush its event queue before shutting down. Omitting this
 * parameter will cause the client to wait until all events are sent before disabling itself.
 * @returns A promise which resolves to `true` if the queue successfully drains before the timeout, or `false` if it
 * doesn't (or if there's no client defined).
 */
async function close(timeout) {
  const client = getClient();
  if (client) {
    return client.close(timeout);
  }
  _debug_build_js__WEBPACK_IMPORTED_MODULE_2__.DEBUG_BUILD && _sentry_utils__WEBPACK_IMPORTED_MODULE_3__.logger.warn('Cannot flush events and disable SDK. No client defined.');
  return Promise.resolve(false);
}

/**
 * This is the getter for lastEventId.
 *
 * @returns The last event id of a captured event.
 */
function lastEventId() {
  // eslint-disable-next-line deprecation/deprecation
  return (0,_hub_js__WEBPACK_IMPORTED_MODULE_0__.getCurrentHub)().lastEventId();
}

/**
 * Get the currently active client.
 */
function getClient() {
  // eslint-disable-next-line deprecation/deprecation
  return (0,_hub_js__WEBPACK_IMPORTED_MODULE_0__.getCurrentHub)().getClient();
}

/**
 * Returns true if Sentry has been properly initialized.
 */
function isInitialized() {
  return !!getClient();
}

/**
 * Get the currently active scope.
 */
function getCurrentScope() {
  // eslint-disable-next-line deprecation/deprecation
  return (0,_hub_js__WEBPACK_IMPORTED_MODULE_0__.getCurrentHub)().getScope();
}

/**
 * Start a session on the current isolation scope.
 *
 * @param context (optional) additional properties to be applied to the returned session object
 *
 * @returns the new active session
 */
function startSession(context) {
  const client = getClient();
  const isolationScope = (0,_hub_js__WEBPACK_IMPORTED_MODULE_0__.getIsolationScope)();
  const currentScope = getCurrentScope();
  const {
    release,
    environment = _constants_js__WEBPACK_IMPORTED_MODULE_7__.DEFAULT_ENVIRONMENT
  } = client && client.getOptions() || {};

  // Will fetch userAgent if called from browser sdk
  const {
    userAgent
  } = _sentry_utils__WEBPACK_IMPORTED_MODULE_8__.GLOBAL_OBJ.navigator || {};
  const session = (0,_session_js__WEBPACK_IMPORTED_MODULE_9__.makeSession)({
    release,
    environment,
    user: currentScope.getUser() || isolationScope.getUser(),
    ...(userAgent && {
      userAgent
    }),
    ...context
  });

  // End existing session if there's one
  const currentSession = isolationScope.getSession();
  if (currentSession && currentSession.status === 'ok') {
    (0,_session_js__WEBPACK_IMPORTED_MODULE_9__.updateSession)(currentSession, {
      status: 'exited'
    });
  }
  endSession();

  // Afterwards we set the new session on the scope
  isolationScope.setSession(session);

  // TODO (v8): Remove this and only use the isolation scope(?).
  // For v7 though, we can't "soft-break" people using getCurrentHub().getScope().setSession()
  currentScope.setSession(session);
  return session;
}

/**
 * End the session on the current isolation scope.
 */
function endSession() {
  const isolationScope = (0,_hub_js__WEBPACK_IMPORTED_MODULE_0__.getIsolationScope)();
  const currentScope = getCurrentScope();
  const session = currentScope.getSession() || isolationScope.getSession();
  if (session) {
    (0,_session_js__WEBPACK_IMPORTED_MODULE_9__.closeSession)(session);
  }
  _sendSessionUpdate();

  // the session is over; take it off of the scope
  isolationScope.setSession();

  // TODO (v8): Remove this and only use the isolation scope(?).
  // For v7 though, we can't "soft-break" people using getCurrentHub().getScope().setSession()
  currentScope.setSession();
}

/**
 * Sends the current Session on the scope
 */
function _sendSessionUpdate() {
  const isolationScope = (0,_hub_js__WEBPACK_IMPORTED_MODULE_0__.getIsolationScope)();
  const currentScope = getCurrentScope();
  const client = getClient();
  // TODO (v8): Remove currentScope and only use the isolation scope(?).
  // For v7 though, we can't "soft-break" people using getCurrentHub().getScope().setSession()
  const session = currentScope.getSession() || isolationScope.getSession();
  if (session && client && client.captureSession) {
    client.captureSession(session);
  }
}

/**
 * Sends the current session on the scope to Sentry
 *
 * @param end If set the session will be marked as exited and removed from the scope.
 *            Defaults to `false`.
 */
function captureSession(end) {
  if (end === void 0) {
    end = false;
  }
  // both send the update and pull the session from the scope
  if (end) {
    endSession();
    return;
  }

  // only send the update
  _sendSessionUpdate();
}


/***/ }),

/***/ "./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/hub.js":
/*!********************************************************************************!*\
  !*** ./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/hub.js ***!
  \********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   API_VERSION: () => (/* binding */ API_VERSION),
/* harmony export */   Hub: () => (/* binding */ Hub),
/* harmony export */   ensureHubOnCarrier: () => (/* binding */ ensureHubOnCarrier),
/* harmony export */   getCurrentHub: () => (/* binding */ getCurrentHub),
/* harmony export */   getHubFromCarrier: () => (/* binding */ getHubFromCarrier),
/* harmony export */   getIsolationScope: () => (/* binding */ getIsolationScope),
/* harmony export */   getMainCarrier: () => (/* binding */ getMainCarrier),
/* harmony export */   makeMain: () => (/* binding */ makeMain),
/* harmony export */   runWithAsyncContext: () => (/* binding */ runWithAsyncContext),
/* harmony export */   setAsyncContextStrategy: () => (/* binding */ setAsyncContextStrategy),
/* harmony export */   setHubOnCarrier: () => (/* binding */ setHubOnCarrier)
/* harmony export */ });
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/is.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/misc.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/time.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/logger.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/worldwide.js");
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./constants.js */ "./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/constants.js");
/* harmony import */ var _debug_build_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./debug-build.js */ "./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/debug-build.js");
/* harmony import */ var _scope_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./scope.js */ "./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/scope.js");
/* harmony import */ var _session_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./session.js */ "./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/session.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./version.js */ "./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/version.js");







/**
 * API compatibility version of this hub.
 *
 * WARNING: This number should only be increased when the global interface
 * changes and new methods are introduced.
 *
 * @hidden
 */
const API_VERSION = parseFloat(_version_js__WEBPACK_IMPORTED_MODULE_0__.SDK_VERSION);

/**
 * Default maximum number of breadcrumbs added to an event. Can be overwritten
 * with {@link Options.maxBreadcrumbs}.
 */
const DEFAULT_BREADCRUMBS = 100;

/**
 * @deprecated The `Hub` class will be removed in version 8 of the SDK in favour of `Scope` and `Client` objects.
 *
 * If you previously used the `Hub` class directly, replace it with `Scope` and `Client` objects. More information:
 * - [Multiple Sentry Instances](https://docs.sentry.io/platforms/javascript/best-practices/multiple-sentry-instances/)
 * - [Browser Extensions](https://docs.sentry.io/platforms/javascript/best-practices/browser-extensions/)
 *
 * Some of our APIs are typed with the Hub class instead of the interface (e.g. `getCurrentHub`). Most of them are deprecated
 * themselves and will also be removed in version 8. More information:
 * - [Migration Guide](https://github.com/getsentry/sentry-javascript/blob/develop/MIGRATION.md#deprecate-hub)
 */
// eslint-disable-next-line deprecation/deprecation
class Hub {
  /** Is a {@link Layer}[] containing the client and scope */

  /** Contains the last event id of a captured event.  */

  /**
   * Creates a new instance of the hub, will push one {@link Layer} into the
   * internal stack on creation.
   *
   * @param client bound to the hub.
   * @param scope bound to the hub.
   * @param version number, higher number means higher priority.
   *
   * @deprecated Instantiation of Hub objects is deprecated and the constructor will be removed in version 8 of the SDK.
   *
   * If you are currently using the Hub for multi-client use like so:
   *
   * ```
   * // OLD
   * const hub = new Hub();
   * hub.bindClient(client);
   * makeMain(hub)
   * ```
   *
   * instead initialize the client as follows:
   *
   * ```
   * // NEW
   * Sentry.withIsolationScope(() => {
   *    Sentry.setCurrentClient(client);
   *    client.init();
   * });
   * ```
   *
   * If you are using the Hub to capture events like so:
   *
   * ```
   * // OLD
   * const client = new Client();
   * const hub = new Hub(client);
   * hub.captureException()
   * ```
   *
   * instead capture isolated events as follows:
   *
   * ```
   * // NEW
   * const client = new Client();
   * const scope = new Scope();
   * scope.setClient(client);
   * scope.captureException();
   * ```
   */
  constructor(client, scope, isolationScope, _version) {
    if (_version === void 0) {
      _version = API_VERSION;
    }
    this._version = _version;
    let assignedScope;
    if (!scope) {
      assignedScope = new _scope_js__WEBPACK_IMPORTED_MODULE_1__.Scope();
      assignedScope.setClient(client);
    } else {
      assignedScope = scope;
    }
    let assignedIsolationScope;
    if (!isolationScope) {
      assignedIsolationScope = new _scope_js__WEBPACK_IMPORTED_MODULE_1__.Scope();
      assignedIsolationScope.setClient(client);
    } else {
      assignedIsolationScope = isolationScope;
    }
    this._stack = [{
      scope: assignedScope
    }];
    if (client) {
      // eslint-disable-next-line deprecation/deprecation
      this.bindClient(client);
    }
    this._isolationScope = assignedIsolationScope;
  }

  /**
   * Checks if this hub's version is older than the given version.
   *
   * @param version A version number to compare to.
   * @return True if the given version is newer; otherwise false.
   *
   * @deprecated This will be removed in v8.
   */
  isOlderThan(version) {
    return this._version < version;
  }

  /**
   * This binds the given client to the current scope.
   * @param client An SDK client (client) instance.
   *
   * @deprecated Use `initAndBind()` directly, or `setCurrentClient()` and/or `client.init()` instead.
   */
  bindClient(client) {
    // eslint-disable-next-line deprecation/deprecation
    const top = this.getStackTop();
    top.client = client;
    top.scope.setClient(client);
    // eslint-disable-next-line deprecation/deprecation
    if (client && client.setupIntegrations) {
      // eslint-disable-next-line deprecation/deprecation
      client.setupIntegrations();
    }
  }

  /**
   * @inheritDoc
   *
   * @deprecated Use `withScope` instead.
   */
  pushScope() {
    // We want to clone the content of prev scope
    // eslint-disable-next-line deprecation/deprecation
    const scope = this.getScope().clone();
    // eslint-disable-next-line deprecation/deprecation
    this.getStack().push({
      // eslint-disable-next-line deprecation/deprecation
      client: this.getClient(),
      scope
    });
    return scope;
  }

  /**
   * @inheritDoc
   *
   * @deprecated Use `withScope` instead.
   */
  popScope() {
    // eslint-disable-next-line deprecation/deprecation
    if (this.getStack().length <= 1) return false;
    // eslint-disable-next-line deprecation/deprecation
    return !!this.getStack().pop();
  }

  /**
   * @inheritDoc
   *
   * @deprecated Use `Sentry.withScope()` instead.
   */
  withScope(callback) {
    // eslint-disable-next-line deprecation/deprecation
    const scope = this.pushScope();
    let maybePromiseResult;
    try {
      maybePromiseResult = callback(scope);
    } catch (e) {
      // eslint-disable-next-line deprecation/deprecation
      this.popScope();
      throw e;
    }
    if ((0,_sentry_utils__WEBPACK_IMPORTED_MODULE_2__.isThenable)(maybePromiseResult)) {
      // @ts-expect-error - isThenable returns the wrong type
      return maybePromiseResult.then(res => {
        // eslint-disable-next-line deprecation/deprecation
        this.popScope();
        return res;
      }, e => {
        // eslint-disable-next-line deprecation/deprecation
        this.popScope();
        throw e;
      });
    }

    // eslint-disable-next-line deprecation/deprecation
    this.popScope();
    return maybePromiseResult;
  }

  /**
   * @inheritDoc
   *
   * @deprecated Use `Sentry.getClient()` instead.
   */
  getClient() {
    // eslint-disable-next-line deprecation/deprecation
    return this.getStackTop().client;
  }

  /**
   * Returns the scope of the top stack.
   *
   * @deprecated Use `Sentry.getCurrentScope()` instead.
   */
  getScope() {
    // eslint-disable-next-line deprecation/deprecation
    return this.getStackTop().scope;
  }

  /**
   * @deprecated Use `Sentry.getIsolationScope()` instead.
   */
  getIsolationScope() {
    return this._isolationScope;
  }

  /**
   * Returns the scope stack for domains or the process.
   * @deprecated This will be removed in v8.
   */
  getStack() {
    return this._stack;
  }

  /**
   * Returns the topmost scope layer in the order domain > local > process.
   * @deprecated This will be removed in v8.
   */
  getStackTop() {
    return this._stack[this._stack.length - 1];
  }

  /**
   * @inheritDoc
   *
   * @deprecated Use `Sentry.captureException()` instead.
   */
  captureException(exception, hint) {
    const eventId = this._lastEventId = hint && hint.event_id ? hint.event_id : (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_3__.uuid4)();
    const syntheticException = new Error('Sentry syntheticException');
    // eslint-disable-next-line deprecation/deprecation
    this.getScope().captureException(exception, {
      originalException: exception,
      syntheticException,
      ...hint,
      event_id: eventId
    });
    return eventId;
  }

  /**
   * @inheritDoc
   *
   * @deprecated Use  `Sentry.captureMessage()` instead.
   */
  captureMessage(message,
  // eslint-disable-next-line deprecation/deprecation
  level, hint) {
    const eventId = this._lastEventId = hint && hint.event_id ? hint.event_id : (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_3__.uuid4)();
    const syntheticException = new Error(message);
    // eslint-disable-next-line deprecation/deprecation
    this.getScope().captureMessage(message, level, {
      originalException: message,
      syntheticException,
      ...hint,
      event_id: eventId
    });
    return eventId;
  }

  /**
   * @inheritDoc
   *
   * @deprecated Use `Sentry.captureEvent()` instead.
   */
  captureEvent(event, hint) {
    const eventId = hint && hint.event_id ? hint.event_id : (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_3__.uuid4)();
    if (!event.type) {
      this._lastEventId = eventId;
    }
    // eslint-disable-next-line deprecation/deprecation
    this.getScope().captureEvent(event, {
      ...hint,
      event_id: eventId
    });
    return eventId;
  }

  /**
   * @inheritDoc
   *
   * @deprecated This will be removed in v8.
   */
  lastEventId() {
    return this._lastEventId;
  }

  /**
   * @inheritDoc
   *
   * @deprecated Use `Sentry.addBreadcrumb()` instead.
   */
  addBreadcrumb(breadcrumb, hint) {
    // eslint-disable-next-line deprecation/deprecation
    const {
      scope,
      client
    } = this.getStackTop();
    if (!client) return;
    const {
      beforeBreadcrumb = null,
      maxBreadcrumbs = DEFAULT_BREADCRUMBS
    } = client.getOptions && client.getOptions() || {};
    if (maxBreadcrumbs <= 0) return;
    const timestamp = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_4__.dateTimestampInSeconds)();
    const mergedBreadcrumb = {
      timestamp,
      ...breadcrumb
    };
    const finalBreadcrumb = beforeBreadcrumb ? (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_5__.consoleSandbox)(() => beforeBreadcrumb(mergedBreadcrumb, hint)) : mergedBreadcrumb;
    if (finalBreadcrumb === null) return;
    if (client.emit) {
      client.emit('beforeAddBreadcrumb', finalBreadcrumb, hint);
    }

    // TODO(v8): I know this comment doesn't make much sense because the hub will be deprecated but I still wanted to
    // write it down. In theory, we would have to add the breadcrumbs to the isolation scope here, however, that would
    // duplicate all of the breadcrumbs. There was the possibility of adding breadcrumbs to both, the isolation scope
    // and the normal scope, and deduplicating it down the line in the event processing pipeline. However, that would
    // have been very fragile, because the breadcrumb objects would have needed to keep their identity all throughout
    // the event processing pipeline.
    // In the new implementation, the top level `Sentry.addBreadcrumb()` should ONLY write to the isolation scope.

    scope.addBreadcrumb(finalBreadcrumb, maxBreadcrumbs);
  }

  /**
   * @inheritDoc
   * @deprecated Use `Sentry.setUser()` instead.
   */
  setUser(user) {
    // TODO(v8): The top level `Sentry.setUser()` function should write ONLY to the isolation scope.
    // eslint-disable-next-line deprecation/deprecation
    this.getScope().setUser(user);
    // eslint-disable-next-line deprecation/deprecation
    this.getIsolationScope().setUser(user);
  }

  /**
   * @inheritDoc
   * @deprecated Use `Sentry.setTags()` instead.
   */
  setTags(tags) {
    // TODO(v8): The top level `Sentry.setTags()` function should write ONLY to the isolation scope.
    // eslint-disable-next-line deprecation/deprecation
    this.getScope().setTags(tags);
    // eslint-disable-next-line deprecation/deprecation
    this.getIsolationScope().setTags(tags);
  }

  /**
   * @inheritDoc
   * @deprecated Use `Sentry.setExtras()` instead.
   */
  setExtras(extras) {
    // TODO(v8): The top level `Sentry.setExtras()` function should write ONLY to the isolation scope.
    // eslint-disable-next-line deprecation/deprecation
    this.getScope().setExtras(extras);
    // eslint-disable-next-line deprecation/deprecation
    this.getIsolationScope().setExtras(extras);
  }

  /**
   * @inheritDoc
   * @deprecated Use `Sentry.setTag()` instead.
   */
  setTag(key, value) {
    // TODO(v8): The top level `Sentry.setTag()` function should write ONLY to the isolation scope.
    // eslint-disable-next-line deprecation/deprecation
    this.getScope().setTag(key, value);
    // eslint-disable-next-line deprecation/deprecation
    this.getIsolationScope().setTag(key, value);
  }

  /**
   * @inheritDoc
   * @deprecated Use `Sentry.setExtra()` instead.
   */
  setExtra(key, extra) {
    // TODO(v8): The top level `Sentry.setExtra()` function should write ONLY to the isolation scope.
    // eslint-disable-next-line deprecation/deprecation
    this.getScope().setExtra(key, extra);
    // eslint-disable-next-line deprecation/deprecation
    this.getIsolationScope().setExtra(key, extra);
  }

  /**
   * @inheritDoc
   * @deprecated Use `Sentry.setContext()` instead.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setContext(name, context) {
    // TODO(v8): The top level `Sentry.setContext()` function should write ONLY to the isolation scope.
    // eslint-disable-next-line deprecation/deprecation
    this.getScope().setContext(name, context);
    // eslint-disable-next-line deprecation/deprecation
    this.getIsolationScope().setContext(name, context);
  }

  /**
   * @inheritDoc
   *
   * @deprecated Use `getScope()` directly.
   */
  configureScope(callback) {
    // eslint-disable-next-line deprecation/deprecation
    const {
      scope,
      client
    } = this.getStackTop();
    if (client) {
      callback(scope);
    }
  }

  /**
   * @inheritDoc
   */
  // eslint-disable-next-line deprecation/deprecation
  run(callback) {
    // eslint-disable-next-line deprecation/deprecation
    const oldHub = makeMain(this);
    try {
      callback(this);
    } finally {
      // eslint-disable-next-line deprecation/deprecation
      makeMain(oldHub);
    }
  }

  /**
   * @inheritDoc
   * @deprecated Use `Sentry.getClient().getIntegrationByName()` instead.
   */
  getIntegration(integration) {
    // eslint-disable-next-line deprecation/deprecation
    const client = this.getClient();
    if (!client) return null;
    try {
      // eslint-disable-next-line deprecation/deprecation
      return client.getIntegration(integration);
    } catch (_oO) {
      _debug_build_js__WEBPACK_IMPORTED_MODULE_6__.DEBUG_BUILD && _sentry_utils__WEBPACK_IMPORTED_MODULE_5__.logger.warn(`Cannot retrieve integration ${integration.id} from the current Hub`);
      return null;
    }
  }

  /**
   * Starts a new `Transaction` and returns it. This is the entry point to manual tracing instrumentation.
   *
   * A tree structure can be built by adding child spans to the transaction, and child spans to other spans. To start a
   * new child span within the transaction or any span, call the respective `.startChild()` method.
   *
   * Every child span must be finished before the transaction is finished, otherwise the unfinished spans are discarded.
   *
   * The transaction must be finished with a call to its `.end()` method, at which point the transaction with all its
   * finished child spans will be sent to Sentry.
   *
   * @param context Properties of the new `Transaction`.
   * @param customSamplingContext Information given to the transaction sampling function (along with context-dependent
   * default values). See {@link Options.tracesSampler}.
   *
   * @returns The transaction which was just started
   *
   * @deprecated Use `startSpan()`, `startSpanManual()` or `startInactiveSpan()` instead.
   */
  startTransaction(context, customSamplingContext) {
    const result = this._callExtensionMethod('startTransaction', context, customSamplingContext);
    if (_debug_build_js__WEBPACK_IMPORTED_MODULE_6__.DEBUG_BUILD && !result) {
      // eslint-disable-next-line deprecation/deprecation
      const client = this.getClient();
      if (!client) {
        _sentry_utils__WEBPACK_IMPORTED_MODULE_5__.logger.warn("Tracing extension 'startTransaction' is missing. You should 'init' the SDK before calling 'startTransaction'");
      } else {
        _sentry_utils__WEBPACK_IMPORTED_MODULE_5__.logger.warn(`Tracing extension 'startTransaction' has not been added. Call 'addTracingExtensions' before calling 'init':
Sentry.addTracingExtensions();
Sentry.init({...});
`);
      }
    }
    return result;
  }

  /**
   * @inheritDoc
   * @deprecated Use `spanToTraceHeader()` instead.
   */
  traceHeaders() {
    return this._callExtensionMethod('traceHeaders');
  }

  /**
   * @inheritDoc
   *
   * @deprecated Use top level `captureSession` instead.
   */
  captureSession(endSession) {
    if (endSession === void 0) {
      endSession = false;
    }
    // both send the update and pull the session from the scope
    if (endSession) {
      // eslint-disable-next-line deprecation/deprecation
      return this.endSession();
    }

    // only send the update
    this._sendSessionUpdate();
  }

  /**
   * @inheritDoc
   * @deprecated Use top level `endSession` instead.
   */
  endSession() {
    // eslint-disable-next-line deprecation/deprecation
    const layer = this.getStackTop();
    const scope = layer.scope;
    const session = scope.getSession();
    if (session) {
      (0,_session_js__WEBPACK_IMPORTED_MODULE_7__.closeSession)(session);
    }
    this._sendSessionUpdate();

    // the session is over; take it off of the scope
    scope.setSession();
  }

  /**
   * @inheritDoc
   * @deprecated Use top level `startSession` instead.
   */
  startSession(context) {
    // eslint-disable-next-line deprecation/deprecation
    const {
      scope,
      client
    } = this.getStackTop();
    const {
      release,
      environment = _constants_js__WEBPACK_IMPORTED_MODULE_8__.DEFAULT_ENVIRONMENT
    } = client && client.getOptions() || {};

    // Will fetch userAgent if called from browser sdk
    const {
      userAgent
    } = _sentry_utils__WEBPACK_IMPORTED_MODULE_9__.GLOBAL_OBJ.navigator || {};
    const session = (0,_session_js__WEBPACK_IMPORTED_MODULE_7__.makeSession)({
      release,
      environment,
      user: scope.getUser(),
      ...(userAgent && {
        userAgent
      }),
      ...context
    });

    // End existing session if there's one
    const currentSession = scope.getSession && scope.getSession();
    if (currentSession && currentSession.status === 'ok') {
      (0,_session_js__WEBPACK_IMPORTED_MODULE_7__.updateSession)(currentSession, {
        status: 'exited'
      });
    }
    // eslint-disable-next-line deprecation/deprecation
    this.endSession();

    // Afterwards we set the new session on the scope
    scope.setSession(session);
    return session;
  }

  /**
   * Returns if default PII should be sent to Sentry and propagated in ourgoing requests
   * when Tracing is used.
   *
   * @deprecated Use top-level `getClient().getOptions().sendDefaultPii` instead. This function
   * only unnecessarily increased API surface but only wrapped accessing the option.
   */
  shouldSendDefaultPii() {
    // eslint-disable-next-line deprecation/deprecation
    const client = this.getClient();
    const options = client && client.getOptions();
    return Boolean(options && options.sendDefaultPii);
  }

  /**
   * Sends the current Session on the scope
   */
  _sendSessionUpdate() {
    // eslint-disable-next-line deprecation/deprecation
    const {
      scope,
      client
    } = this.getStackTop();
    const session = scope.getSession();
    if (session && client && client.captureSession) {
      client.captureSession(session);
    }
  }

  /**
   * Calls global extension method and binding current instance to the function call
   */
  // @ts-expect-error Function lacks ending return statement and return type does not include 'undefined'. ts(2366)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _callExtensionMethod(method) {
    const carrier = getMainCarrier();
    const sentry = carrier.__SENTRY__;
    if (sentry && sentry.extensions && typeof sentry.extensions[method] === 'function') {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      return sentry.extensions[method].apply(this, args);
    }
    _debug_build_js__WEBPACK_IMPORTED_MODULE_6__.DEBUG_BUILD && _sentry_utils__WEBPACK_IMPORTED_MODULE_5__.logger.warn(`Extension method ${method} couldn't be found, doing nothing.`);
  }
}

/**
 * Returns the global shim registry.
 *
 * FIXME: This function is problematic, because despite always returning a valid Carrier,
 * it has an optional `__SENTRY__` property, which then in turn requires us to always perform an unnecessary check
 * at the call-site. We always access the carrier through this function, so we can guarantee that `__SENTRY__` is there.
 **/
function getMainCarrier() {
  _sentry_utils__WEBPACK_IMPORTED_MODULE_9__.GLOBAL_OBJ.__SENTRY__ = _sentry_utils__WEBPACK_IMPORTED_MODULE_9__.GLOBAL_OBJ.__SENTRY__ || {
    extensions: {},
    hub: undefined
  };
  return _sentry_utils__WEBPACK_IMPORTED_MODULE_9__.GLOBAL_OBJ;
}

/**
 * Replaces the current main hub with the passed one on the global object
 *
 * @returns The old replaced hub
 *
 * @deprecated Use `setCurrentClient()` instead.
 */
// eslint-disable-next-line deprecation/deprecation
function makeMain(hub) {
  const registry = getMainCarrier();
  const oldHub = getHubFromCarrier(registry);
  setHubOnCarrier(registry, hub);
  return oldHub;
}

/**
 * Returns the default hub instance.
 *
 * If a hub is already registered in the global carrier but this module
 * contains a more recent version, it replaces the registered version.
 * Otherwise, the currently registered hub will be returned.
 *
 * @deprecated Use the respective replacement method directly instead.
 */
// eslint-disable-next-line deprecation/deprecation
function getCurrentHub() {
  // Get main carrier (global for every environment)
  const registry = getMainCarrier();
  if (registry.__SENTRY__ && registry.__SENTRY__.acs) {
    const hub = registry.__SENTRY__.acs.getCurrentHub();
    if (hub) {
      return hub;
    }
  }

  // Return hub that lives on a global object
  return getGlobalHub(registry);
}

/**
 * Get the currently active isolation scope.
 * The isolation scope is active for the current exection context,
 * meaning that it will remain stable for the same Hub.
 */
function getIsolationScope() {
  // eslint-disable-next-line deprecation/deprecation
  return getCurrentHub().getIsolationScope();
}

// eslint-disable-next-line deprecation/deprecation
function getGlobalHub(registry) {
  if (registry === void 0) {
    registry = getMainCarrier();
  }
  // If there's no hub, or its an old API, assign a new one

  if (!hasHubOnCarrier(registry) ||
  // eslint-disable-next-line deprecation/deprecation
  getHubFromCarrier(registry).isOlderThan(API_VERSION)) {
    // eslint-disable-next-line deprecation/deprecation
    setHubOnCarrier(registry, new Hub());
  }

  // Return hub that lives on a global object
  return getHubFromCarrier(registry);
}

/**
 * @private Private API with no semver guarantees!
 *
 * If the carrier does not contain a hub, a new hub is created with the global hub client and scope.
 */
// eslint-disable-next-line deprecation/deprecation
function ensureHubOnCarrier(carrier, parent) {
  if (parent === void 0) {
    parent = getGlobalHub();
  }
  // If there's no hub on current domain, or it's an old API, assign a new one
  if (!hasHubOnCarrier(carrier) ||
  // eslint-disable-next-line deprecation/deprecation
  getHubFromCarrier(carrier).isOlderThan(API_VERSION)) {
    // eslint-disable-next-line deprecation/deprecation
    const client = parent.getClient();
    // eslint-disable-next-line deprecation/deprecation
    const scope = parent.getScope();
    // eslint-disable-next-line deprecation/deprecation
    const isolationScope = parent.getIsolationScope();
    // eslint-disable-next-line deprecation/deprecation
    setHubOnCarrier(carrier, new Hub(client, scope.clone(), isolationScope.clone()));
  }
}

/**
 * @private Private API with no semver guarantees!
 *
 * Sets the global async context strategy
 */
function setAsyncContextStrategy(strategy) {
  // Get main carrier (global for every environment)
  const registry = getMainCarrier();
  registry.__SENTRY__ = registry.__SENTRY__ || {};
  registry.__SENTRY__.acs = strategy;
}

/**
 * Runs the supplied callback in its own async context. Async Context strategies are defined per SDK.
 *
 * @param callback The callback to run in its own async context
 * @param options Options to pass to the async context strategy
 * @returns The result of the callback
 */
function runWithAsyncContext(callback, options) {
  if (options === void 0) {
    options = {};
  }
  const registry = getMainCarrier();
  if (registry.__SENTRY__ && registry.__SENTRY__.acs) {
    return registry.__SENTRY__.acs.runWithAsyncContext(callback, options);
  }

  // if there was no strategy, fallback to just calling the callback
  return callback();
}

/**
 * This will tell whether a carrier has a hub on it or not
 * @param carrier object
 */
function hasHubOnCarrier(carrier) {
  return !!(carrier && carrier.__SENTRY__ && carrier.__SENTRY__.hub);
}

/**
 * This will create a new {@link Hub} and add to the passed object on
 * __SENTRY__.hub.
 * @param carrier object
 * @hidden
 */
// eslint-disable-next-line deprecation/deprecation
function getHubFromCarrier(carrier) {
  // eslint-disable-next-line deprecation/deprecation
  return (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_9__.getGlobalSingleton)('hub', () => new Hub(), carrier);
}

/**
 * This will set passed {@link Hub} on the passed object's __SENTRY__.hub attribute
 * @param carrier object
 * @param hub Hub
 * @returns A boolean indicating success or failure
 */
// eslint-disable-next-line deprecation/deprecation
function setHubOnCarrier(carrier, hub) {
  if (!carrier) return false;
  const __SENTRY__ = carrier.__SENTRY__ = carrier.__SENTRY__ || {};
  __SENTRY__.hub = hub;
  return true;
}


/***/ }),

/***/ "./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/integration.js":
/*!****************************************************************************************!*\
  !*** ./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/integration.js ***!
  \****************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addIntegration: () => (/* binding */ addIntegration),
/* harmony export */   afterSetupIntegrations: () => (/* binding */ afterSetupIntegrations),
/* harmony export */   convertIntegrationFnToClass: () => (/* binding */ convertIntegrationFnToClass),
/* harmony export */   defineIntegration: () => (/* binding */ defineIntegration),
/* harmony export */   getIntegrationsToSetup: () => (/* binding */ getIntegrationsToSetup),
/* harmony export */   installedIntegrations: () => (/* binding */ installedIntegrations),
/* harmony export */   setupIntegration: () => (/* binding */ setupIntegration),
/* harmony export */   setupIntegrations: () => (/* binding */ setupIntegrations)
/* harmony export */ });
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/misc.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/logger.js");
/* harmony import */ var _debug_build_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./debug-build.js */ "./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/debug-build.js");
/* harmony import */ var _eventProcessors_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./eventProcessors.js */ "./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/eventProcessors.js");
/* harmony import */ var _exports_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./exports.js */ "./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/exports.js");
/* harmony import */ var _hub_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./hub.js */ "./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/hub.js");





const installedIntegrations = [];

/** Map of integrations assigned to a client */

/**
 * Remove duplicates from the given array, preferring the last instance of any duplicate. Not guaranteed to
 * preseve the order of integrations in the array.
 *
 * @private
 */
function filterDuplicates(integrations) {
  const integrationsByName = {};
  integrations.forEach(currentInstance => {
    const {
      name
    } = currentInstance;
    const existingInstance = integrationsByName[name];

    // We want integrations later in the array to overwrite earlier ones of the same type, except that we never want a
    // default instance to overwrite an existing user instance
    if (existingInstance && !existingInstance.isDefaultInstance && currentInstance.isDefaultInstance) {
      return;
    }
    integrationsByName[name] = currentInstance;
  });
  return Object.keys(integrationsByName).map(k => integrationsByName[k]);
}

/** Gets integrations to install */
function getIntegrationsToSetup(options) {
  const defaultIntegrations = options.defaultIntegrations || [];
  const userIntegrations = options.integrations;

  // We flag default instances, so that later we can tell them apart from any user-created instances of the same class
  defaultIntegrations.forEach(integration => {
    integration.isDefaultInstance = true;
  });
  let integrations;
  if (Array.isArray(userIntegrations)) {
    integrations = [...defaultIntegrations, ...userIntegrations];
  } else if (typeof userIntegrations === 'function') {
    integrations = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_0__.arrayify)(userIntegrations(defaultIntegrations));
  } else {
    integrations = defaultIntegrations;
  }
  const finalIntegrations = filterDuplicates(integrations);

  // The `Debug` integration prints copies of the `event` and `hint` which will be passed to `beforeSend` or
  // `beforeSendTransaction`. It therefore has to run after all other integrations, so that the changes of all event
  // processors will be reflected in the printed values. For lack of a more elegant way to guarantee that, we therefore
  // locate it and, assuming it exists, pop it out of its current spot and shove it onto the end of the array.
  const debugIndex = findIndex(finalIntegrations, integration => integration.name === 'Debug');
  if (debugIndex !== -1) {
    const [debugInstance] = finalIntegrations.splice(debugIndex, 1);
    finalIntegrations.push(debugInstance);
  }
  return finalIntegrations;
}

/**
 * Given a list of integration instances this installs them all. When `withDefaults` is set to `true` then all default
 * integrations are added unless they were already provided before.
 * @param integrations array of integration instances
 * @param withDefault should enable default integrations
 */
function setupIntegrations(client, integrations) {
  const integrationIndex = {};
  integrations.forEach(integration => {
    // guard against empty provided integrations
    if (integration) {
      setupIntegration(client, integration, integrationIndex);
    }
  });
  return integrationIndex;
}

/**
 * Execute the `afterAllSetup` hooks of the given integrations.
 */
function afterSetupIntegrations(client, integrations) {
  for (const integration of integrations) {
    // guard against empty provided integrations
    if (integration && integration.afterAllSetup) {
      integration.afterAllSetup(client);
    }
  }
}

/** Setup a single integration.  */
function setupIntegration(client, integration, integrationIndex) {
  if (integrationIndex[integration.name]) {
    _debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD && _sentry_utils__WEBPACK_IMPORTED_MODULE_2__.logger.log(`Integration skipped because it was already installed: ${integration.name}`);
    return;
  }
  integrationIndex[integration.name] = integration;

  // `setupOnce` is only called the first time
  if (installedIntegrations.indexOf(integration.name) === -1) {
    // eslint-disable-next-line deprecation/deprecation
    integration.setupOnce(_eventProcessors_js__WEBPACK_IMPORTED_MODULE_3__.addGlobalEventProcessor, _hub_js__WEBPACK_IMPORTED_MODULE_4__.getCurrentHub);
    installedIntegrations.push(integration.name);
  }

  // `setup` is run for each client
  if (integration.setup && typeof integration.setup === 'function') {
    integration.setup(client);
  }
  if (client.on && typeof integration.preprocessEvent === 'function') {
    const callback = integration.preprocessEvent.bind(integration);
    client.on('preprocessEvent', (event, hint) => callback(event, hint, client));
  }
  if (client.addEventProcessor && typeof integration.processEvent === 'function') {
    const callback = integration.processEvent.bind(integration);
    const processor = Object.assign((event, hint) => callback(event, hint, client), {
      id: integration.name
    });
    client.addEventProcessor(processor);
  }
  _debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD && _sentry_utils__WEBPACK_IMPORTED_MODULE_2__.logger.log(`Integration installed: ${integration.name}`);
}

/** Add an integration to the current hub's client. */
function addIntegration(integration) {
  const client = (0,_exports_js__WEBPACK_IMPORTED_MODULE_5__.getClient)();
  if (!client || !client.addIntegration) {
    _debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD && _sentry_utils__WEBPACK_IMPORTED_MODULE_2__.logger.warn(`Cannot add integration "${integration.name}" because no SDK Client is available.`);
    return;
  }
  client.addIntegration(integration);
}

// Polyfill for Array.findIndex(), which is not supported in ES5
function findIndex(arr, callback) {
  for (let i = 0; i < arr.length; i++) {
    if (callback(arr[i]) === true) {
      return i;
    }
  }
  return -1;
}

/**
 * Convert a new integration function to the legacy class syntax.
 * In v8, we can remove this and instead export the integration functions directly.
 *
 * @deprecated This will be removed in v8!
 */
function convertIntegrationFnToClass(name, fn) {
  return Object.assign(function ConvertedIntegration() {
    return fn(...arguments);
  }, {
    id: name
  });
}

/**
 * Define an integration function that can be used to create an integration instance.
 * Note that this by design hides the implementation details of the integration, as they are considered internal.
 */
function defineIntegration(fn) {
  return fn;
}


/***/ }),

/***/ "./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/scope.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/scope.js ***!
  \**********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Scope: () => (/* binding */ Scope),
/* harmony export */   getGlobalScope: () => (/* binding */ getGlobalScope),
/* harmony export */   setGlobalScope: () => (/* binding */ setGlobalScope)
/* harmony export */ });
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/is.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/time.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/misc.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/logger.js");
/* harmony import */ var _eventProcessors_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./eventProcessors.js */ "./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/eventProcessors.js");
/* harmony import */ var _session_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./session.js */ "./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/session.js");
/* harmony import */ var _utils_applyScopeDataToEvent_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utils/applyScopeDataToEvent.js */ "./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/utils/applyScopeDataToEvent.js");





/**
 * Default value for maximum number of breadcrumbs added to an event.
 */
const DEFAULT_MAX_BREADCRUMBS = 100;

/**
 * The global scope is kept in this module.
 * When accessing this via `getGlobalScope()` we'll make sure to set one if none is currently present.
 */
let globalScope;

/**
 * Holds additional event information. {@link Scope.applyToEvent} will be
 * called by the client before an event will be sent.
 */
class Scope {
  /** Flag if notifying is happening. */

  /** Callback for client to receive scope changes. */

  /** Callback list that will be called after {@link applyToEvent}. */

  /** Array of breadcrumbs. */

  /** User */

  /** Tags */

  /** Extra */

  /** Contexts */

  /** Attachments */

  /** Propagation Context for distributed tracing */

  /**
   * A place to stash data which is needed at some point in the SDK's event processing pipeline but which shouldn't get
   * sent to Sentry
   */

  /** Fingerprint */

  /** Severity */
  // eslint-disable-next-line deprecation/deprecation

  /**
   * Transaction Name
   */

  /** Span */

  /** Session */

  /** Request Mode Session Status */

  /** The client on this scope */

  // NOTE: Any field which gets added here should get added not only to the constructor but also to the `clone` method.

  constructor() {
    this._notifyingListeners = false;
    this._scopeListeners = [];
    this._eventProcessors = [];
    this._breadcrumbs = [];
    this._attachments = [];
    this._user = {};
    this._tags = {};
    this._extra = {};
    this._contexts = {};
    this._sdkProcessingMetadata = {};
    this._propagationContext = generatePropagationContext();
  }

  /**
   * Inherit values from the parent scope.
   * @deprecated Use `scope.clone()` and `new Scope()` instead.
   */
  static clone(scope) {
    return scope ? scope.clone() : new Scope();
  }

  /**
   * Clone this scope instance.
   */
  clone() {
    const newScope = new Scope();
    newScope._breadcrumbs = [...this._breadcrumbs];
    newScope._tags = {
      ...this._tags
    };
    newScope._extra = {
      ...this._extra
    };
    newScope._contexts = {
      ...this._contexts
    };
    newScope._user = this._user;
    newScope._level = this._level;
    newScope._span = this._span;
    newScope._session = this._session;
    newScope._transactionName = this._transactionName;
    newScope._fingerprint = this._fingerprint;
    newScope._eventProcessors = [...this._eventProcessors];
    newScope._requestSession = this._requestSession;
    newScope._attachments = [...this._attachments];
    newScope._sdkProcessingMetadata = {
      ...this._sdkProcessingMetadata
    };
    newScope._propagationContext = {
      ...this._propagationContext
    };
    newScope._client = this._client;
    return newScope;
  }

  /** Update the client on the scope. */
  setClient(client) {
    this._client = client;
  }

  /**
   * Get the client assigned to this scope.
   *
   * It is generally recommended to use the global function `Sentry.getClient()` instead, unless you know what you are doing.
   */
  getClient() {
    return this._client;
  }

  /**
   * Add internal on change listener. Used for sub SDKs that need to store the scope.
   * @hidden
   */
  addScopeListener(callback) {
    this._scopeListeners.push(callback);
  }

  /**
   * @inheritDoc
   */
  addEventProcessor(callback) {
    this._eventProcessors.push(callback);
    return this;
  }

  /**
   * @inheritDoc
   */
  setUser(user) {
    // If null is passed we want to unset everything, but still define keys,
    // so that later down in the pipeline any existing values are cleared.
    this._user = user || {
      email: undefined,
      id: undefined,
      ip_address: undefined,
      segment: undefined,
      username: undefined
    };
    if (this._session) {
      (0,_session_js__WEBPACK_IMPORTED_MODULE_0__.updateSession)(this._session, {
        user
      });
    }
    this._notifyScopeListeners();
    return this;
  }

  /**
   * @inheritDoc
   */
  getUser() {
    return this._user;
  }

  /**
   * @inheritDoc
   */
  getRequestSession() {
    return this._requestSession;
  }

  /**
   * @inheritDoc
   */
  setRequestSession(requestSession) {
    this._requestSession = requestSession;
    return this;
  }

  /**
   * @inheritDoc
   */
  setTags(tags) {
    this._tags = {
      ...this._tags,
      ...tags
    };
    this._notifyScopeListeners();
    return this;
  }

  /**
   * @inheritDoc
   */
  setTag(key, value) {
    this._tags = {
      ...this._tags,
      [key]: value
    };
    this._notifyScopeListeners();
    return this;
  }

  /**
   * @inheritDoc
   */
  setExtras(extras) {
    this._extra = {
      ...this._extra,
      ...extras
    };
    this._notifyScopeListeners();
    return this;
  }

  /**
   * @inheritDoc
   */
  setExtra(key, extra) {
    this._extra = {
      ...this._extra,
      [key]: extra
    };
    this._notifyScopeListeners();
    return this;
  }

  /**
   * @inheritDoc
   */
  setFingerprint(fingerprint) {
    this._fingerprint = fingerprint;
    this._notifyScopeListeners();
    return this;
  }

  /**
   * @inheritDoc
   */
  setLevel(
  // eslint-disable-next-line deprecation/deprecation
  level) {
    this._level = level;
    this._notifyScopeListeners();
    return this;
  }

  /**
   * Sets the transaction name on the scope for future events.
   */
  setTransactionName(name) {
    this._transactionName = name;
    this._notifyScopeListeners();
    return this;
  }

  /**
   * @inheritDoc
   */
  setContext(key, context) {
    if (context === null) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete this._contexts[key];
    } else {
      this._contexts[key] = context;
    }
    this._notifyScopeListeners();
    return this;
  }

  /**
   * Sets the Span on the scope.
   * @param span Span
   * @deprecated Instead of setting a span on a scope, use `startSpan()`/`startSpanManual()` instead.
   */
  setSpan(span) {
    this._span = span;
    this._notifyScopeListeners();
    return this;
  }

  /**
   * Returns the `Span` if there is one.
   * @deprecated Use `getActiveSpan()` instead.
   */
  getSpan() {
    return this._span;
  }

  /**
   * Returns the `Transaction` attached to the scope (if there is one).
   * @deprecated You should not rely on the transaction, but just use `startSpan()` APIs instead.
   */
  getTransaction() {
    // Often, this span (if it exists at all) will be a transaction, but it's not guaranteed to be. Regardless, it will
    // have a pointer to the currently-active transaction.
    const span = this._span;
    // Cannot replace with getRootSpan because getRootSpan returns a span, not a transaction
    // Also, this method will be removed anyway.
    // eslint-disable-next-line deprecation/deprecation
    return span && span.transaction;
  }

  /**
   * @inheritDoc
   */
  setSession(session) {
    if (!session) {
      delete this._session;
    } else {
      this._session = session;
    }
    this._notifyScopeListeners();
    return this;
  }

  /**
   * @inheritDoc
   */
  getSession() {
    return this._session;
  }

  /**
   * @inheritDoc
   */
  update(captureContext) {
    if (!captureContext) {
      return this;
    }
    const scopeToMerge = typeof captureContext === 'function' ? captureContext(this) : captureContext;
    if (scopeToMerge instanceof Scope) {
      const scopeData = scopeToMerge.getScopeData();
      this._tags = {
        ...this._tags,
        ...scopeData.tags
      };
      this._extra = {
        ...this._extra,
        ...scopeData.extra
      };
      this._contexts = {
        ...this._contexts,
        ...scopeData.contexts
      };
      if (scopeData.user && Object.keys(scopeData.user).length) {
        this._user = scopeData.user;
      }
      if (scopeData.level) {
        this._level = scopeData.level;
      }
      if (scopeData.fingerprint.length) {
        this._fingerprint = scopeData.fingerprint;
      }
      if (scopeToMerge.getRequestSession()) {
        this._requestSession = scopeToMerge.getRequestSession();
      }
      if (scopeData.propagationContext) {
        this._propagationContext = scopeData.propagationContext;
      }
    } else if ((0,_sentry_utils__WEBPACK_IMPORTED_MODULE_1__.isPlainObject)(scopeToMerge)) {
      const scopeContext = captureContext;
      this._tags = {
        ...this._tags,
        ...scopeContext.tags
      };
      this._extra = {
        ...this._extra,
        ...scopeContext.extra
      };
      this._contexts = {
        ...this._contexts,
        ...scopeContext.contexts
      };
      if (scopeContext.user) {
        this._user = scopeContext.user;
      }
      if (scopeContext.level) {
        this._level = scopeContext.level;
      }
      if (scopeContext.fingerprint) {
        this._fingerprint = scopeContext.fingerprint;
      }
      if (scopeContext.requestSession) {
        this._requestSession = scopeContext.requestSession;
      }
      if (scopeContext.propagationContext) {
        this._propagationContext = scopeContext.propagationContext;
      }
    }
    return this;
  }

  /**
   * @inheritDoc
   */
  clear() {
    this._breadcrumbs = [];
    this._tags = {};
    this._extra = {};
    this._user = {};
    this._contexts = {};
    this._level = undefined;
    this._transactionName = undefined;
    this._fingerprint = undefined;
    this._requestSession = undefined;
    this._span = undefined;
    this._session = undefined;
    this._notifyScopeListeners();
    this._attachments = [];
    this._propagationContext = generatePropagationContext();
    return this;
  }

  /**
   * @inheritDoc
   */
  addBreadcrumb(breadcrumb, maxBreadcrumbs) {
    const maxCrumbs = typeof maxBreadcrumbs === 'number' ? maxBreadcrumbs : DEFAULT_MAX_BREADCRUMBS;

    // No data has been changed, so don't notify scope listeners
    if (maxCrumbs <= 0) {
      return this;
    }
    const mergedBreadcrumb = {
      timestamp: (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_2__.dateTimestampInSeconds)(),
      ...breadcrumb
    };
    const breadcrumbs = this._breadcrumbs;
    breadcrumbs.push(mergedBreadcrumb);
    this._breadcrumbs = breadcrumbs.length > maxCrumbs ? breadcrumbs.slice(-maxCrumbs) : breadcrumbs;
    this._notifyScopeListeners();
    return this;
  }

  /**
   * @inheritDoc
   */
  getLastBreadcrumb() {
    return this._breadcrumbs[this._breadcrumbs.length - 1];
  }

  /**
   * @inheritDoc
   */
  clearBreadcrumbs() {
    this._breadcrumbs = [];
    this._notifyScopeListeners();
    return this;
  }

  /**
   * @inheritDoc
   */
  addAttachment(attachment) {
    this._attachments.push(attachment);
    return this;
  }

  /**
   * @inheritDoc
   * @deprecated Use `getScopeData()` instead.
   */
  getAttachments() {
    const data = this.getScopeData();
    return data.attachments;
  }

  /**
   * @inheritDoc
   */
  clearAttachments() {
    this._attachments = [];
    return this;
  }

  /** @inheritDoc */
  getScopeData() {
    const {
      _breadcrumbs,
      _attachments,
      _contexts,
      _tags,
      _extra,
      _user,
      _level,
      _fingerprint,
      _eventProcessors,
      _propagationContext,
      _sdkProcessingMetadata,
      _transactionName,
      _span
    } = this;
    return {
      breadcrumbs: _breadcrumbs,
      attachments: _attachments,
      contexts: _contexts,
      tags: _tags,
      extra: _extra,
      user: _user,
      level: _level,
      fingerprint: _fingerprint || [],
      eventProcessors: _eventProcessors,
      propagationContext: _propagationContext,
      sdkProcessingMetadata: _sdkProcessingMetadata,
      transactionName: _transactionName,
      span: _span
    };
  }

  /**
   * Applies data from the scope to the event and runs all event processors on it.
   *
   * @param event Event
   * @param hint Object containing additional information about the original exception, for use by the event processors.
   * @hidden
   * @deprecated Use `applyScopeDataToEvent()` directly
   */
  applyToEvent(event, hint, additionalEventProcessors) {
    if (hint === void 0) {
      hint = {};
    }
    if (additionalEventProcessors === void 0) {
      additionalEventProcessors = [];
    }
    (0,_utils_applyScopeDataToEvent_js__WEBPACK_IMPORTED_MODULE_3__.applyScopeDataToEvent)(event, this.getScopeData());

    // TODO (v8): Update this order to be: Global > Client > Scope
    const eventProcessors = [...additionalEventProcessors,
    // eslint-disable-next-line deprecation/deprecation
    ...(0,_eventProcessors_js__WEBPACK_IMPORTED_MODULE_4__.getGlobalEventProcessors)(), ...this._eventProcessors];
    return (0,_eventProcessors_js__WEBPACK_IMPORTED_MODULE_4__.notifyEventProcessors)(eventProcessors, event, hint);
  }

  /**
   * Add data which will be accessible during event processing but won't get sent to Sentry
   */
  setSDKProcessingMetadata(newData) {
    this._sdkProcessingMetadata = {
      ...this._sdkProcessingMetadata,
      ...newData
    };
    return this;
  }

  /**
   * @inheritDoc
   */
  setPropagationContext(context) {
    this._propagationContext = context;
    return this;
  }

  /**
   * @inheritDoc
   */
  getPropagationContext() {
    return this._propagationContext;
  }

  /**
   * Capture an exception for this scope.
   *
   * @param exception The exception to capture.
   * @param hint Optinal additional data to attach to the Sentry event.
   * @returns the id of the captured Sentry event.
   */
  captureException(exception, hint) {
    const eventId = hint && hint.event_id ? hint.event_id : (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_5__.uuid4)();
    if (!this._client) {
      _sentry_utils__WEBPACK_IMPORTED_MODULE_6__.logger.warn('No client configured on scope - will not capture exception!');
      return eventId;
    }
    const syntheticException = new Error('Sentry syntheticException');
    this._client.captureException(exception, {
      originalException: exception,
      syntheticException,
      ...hint,
      event_id: eventId
    }, this);
    return eventId;
  }

  /**
   * Capture a message for this scope.
   *
   * @param message The message to capture.
   * @param level An optional severity level to report the message with.
   * @param hint Optional additional data to attach to the Sentry event.
   * @returns the id of the captured message.
   */
  captureMessage(message, level, hint) {
    const eventId = hint && hint.event_id ? hint.event_id : (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_5__.uuid4)();
    if (!this._client) {
      _sentry_utils__WEBPACK_IMPORTED_MODULE_6__.logger.warn('No client configured on scope - will not capture message!');
      return eventId;
    }
    const syntheticException = new Error(message);
    this._client.captureMessage(message, level, {
      originalException: message,
      syntheticException,
      ...hint,
      event_id: eventId
    }, this);
    return eventId;
  }

  /**
   * Captures a manually created event for this scope and sends it to Sentry.
   *
   * @param exception The event to capture.
   * @param hint Optional additional data to attach to the Sentry event.
   * @returns the id of the captured event.
   */
  captureEvent(event, hint) {
    const eventId = hint && hint.event_id ? hint.event_id : (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_5__.uuid4)();
    if (!this._client) {
      _sentry_utils__WEBPACK_IMPORTED_MODULE_6__.logger.warn('No client configured on scope - will not capture event!');
      return eventId;
    }
    this._client.captureEvent(event, {
      ...hint,
      event_id: eventId
    }, this);
    return eventId;
  }

  /**
   * This will be called on every set call.
   */
  _notifyScopeListeners() {
    // We need this check for this._notifyingListeners to be able to work on scope during updates
    // If this check is not here we'll produce endless recursion when something is done with the scope
    // during the callback.
    if (!this._notifyingListeners) {
      this._notifyingListeners = true;
      this._scopeListeners.forEach(callback => {
        callback(this);
      });
      this._notifyingListeners = false;
    }
  }
}

/**
 * Get the global scope.
 * This scope is applied to _all_ events.
 */
function getGlobalScope() {
  if (!globalScope) {
    globalScope = new Scope();
  }
  return globalScope;
}

/**
 * This is mainly needed for tests.
 * DO NOT USE this, as this is an internal API and subject to change.
 * @hidden
 */
function setGlobalScope(scope) {
  globalScope = scope;
}
function generatePropagationContext() {
  return {
    traceId: (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_5__.uuid4)(),
    spanId: (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_5__.uuid4)().substring(16)
  };
}


/***/ }),

/***/ "./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/session.js":
/*!************************************************************************************!*\
  !*** ./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/session.js ***!
  \************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   closeSession: () => (/* binding */ closeSession),
/* harmony export */   makeSession: () => (/* binding */ makeSession),
/* harmony export */   updateSession: () => (/* binding */ updateSession)
/* harmony export */ });
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/time.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/misc.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/object.js");


/**
 * Creates a new `Session` object by setting certain default parameters. If optional @param context
 * is passed, the passed properties are applied to the session object.
 *
 * @param context (optional) additional properties to be applied to the returned session object
 *
 * @returns a new `Session` object
 */
function makeSession(context) {
  // Both timestamp and started are in seconds since the UNIX epoch.
  const startingTime = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_0__.timestampInSeconds)();
  const session = {
    sid: (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_1__.uuid4)(),
    init: true,
    timestamp: startingTime,
    started: startingTime,
    duration: 0,
    status: 'ok',
    errors: 0,
    ignoreDuration: false,
    toJSON: () => sessionToJSON(session)
  };
  if (context) {
    updateSession(session, context);
  }
  return session;
}

/**
 * Updates a session object with the properties passed in the context.
 *
 * Note that this function mutates the passed object and returns void.
 * (Had to do this instead of returning a new and updated session because closing and sending a session
 * makes an update to the session after it was passed to the sending logic.
 * @see BaseClient.captureSession )
 *
 * @param session the `Session` to update
 * @param context the `SessionContext` holding the properties that should be updated in @param session
 */
// eslint-disable-next-line complexity
function updateSession(session, context) {
  if (context === void 0) {
    context = {};
  }
  if (context.user) {
    if (!session.ipAddress && context.user.ip_address) {
      session.ipAddress = context.user.ip_address;
    }
    if (!session.did && !context.did) {
      session.did = context.user.id || context.user.email || context.user.username;
    }
  }
  session.timestamp = context.timestamp || (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_0__.timestampInSeconds)();
  if (context.abnormal_mechanism) {
    session.abnormal_mechanism = context.abnormal_mechanism;
  }
  if (context.ignoreDuration) {
    session.ignoreDuration = context.ignoreDuration;
  }
  if (context.sid) {
    // Good enough uuid validation. — Kamil
    session.sid = context.sid.length === 32 ? context.sid : (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_1__.uuid4)();
  }
  if (context.init !== undefined) {
    session.init = context.init;
  }
  if (!session.did && context.did) {
    session.did = `${context.did}`;
  }
  if (typeof context.started === 'number') {
    session.started = context.started;
  }
  if (session.ignoreDuration) {
    session.duration = undefined;
  } else if (typeof context.duration === 'number') {
    session.duration = context.duration;
  } else {
    const duration = session.timestamp - session.started;
    session.duration = duration >= 0 ? duration : 0;
  }
  if (context.release) {
    session.release = context.release;
  }
  if (context.environment) {
    session.environment = context.environment;
  }
  if (!session.ipAddress && context.ipAddress) {
    session.ipAddress = context.ipAddress;
  }
  if (!session.userAgent && context.userAgent) {
    session.userAgent = context.userAgent;
  }
  if (typeof context.errors === 'number') {
    session.errors = context.errors;
  }
  if (context.status) {
    session.status = context.status;
  }
}

/**
 * Closes a session by setting its status and updating the session object with it.
 * Internally calls `updateSession` to update the passed session object.
 *
 * Note that this function mutates the passed session (@see updateSession for explanation).
 *
 * @param session the `Session` object to be closed
 * @param status the `SessionStatus` with which the session was closed. If you don't pass a status,
 *               this function will keep the previously set status, unless it was `'ok'` in which case
 *               it is changed to `'exited'`.
 */
function closeSession(session, status) {
  let context = {};
  if (status) {
    context = {
      status
    };
  } else if (session.status === 'ok') {
    context = {
      status: 'exited'
    };
  }
  updateSession(session, context);
}

/**
 * Serializes a passed session object to a JSON object with a slightly different structure.
 * This is necessary because the Sentry backend requires a slightly different schema of a session
 * than the one the JS SDKs use internally.
 *
 * @param session the session to be converted
 *
 * @returns a JSON object of the passed session
 */
function sessionToJSON(session) {
  return (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_2__.dropUndefinedKeys)({
    sid: `${session.sid}`,
    init: session.init,
    // Make sure that sec is converted to ms for date constructor
    started: new Date(session.started * 1000).toISOString(),
    timestamp: new Date(session.timestamp * 1000).toISOString(),
    status: session.status,
    errors: session.errors,
    did: typeof session.did === 'number' || typeof session.did === 'string' ? `${session.did}` : undefined,
    duration: session.duration,
    abnormal_mechanism: session.abnormal_mechanism,
    attrs: {
      release: session.release,
      environment: session.environment,
      ip_address: session.ipAddress,
      user_agent: session.userAgent
    }
  });
}


/***/ }),

/***/ "./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/tracing/dynamicSamplingContext.js":
/*!***********************************************************************************************************!*\
  !*** ./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/tracing/dynamicSamplingContext.js ***!
  \***********************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getDynamicSamplingContextFromClient: () => (/* binding */ getDynamicSamplingContextFromClient),
/* harmony export */   getDynamicSamplingContextFromSpan: () => (/* binding */ getDynamicSamplingContextFromSpan)
/* harmony export */ });
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/object.js");
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants.js */ "./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/constants.js");
/* harmony import */ var _exports_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../exports.js */ "./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/exports.js");
/* harmony import */ var _utils_getRootSpan_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/getRootSpan.js */ "./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/utils/getRootSpan.js");
/* harmony import */ var _utils_spanUtils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/spanUtils.js */ "./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/utils/spanUtils.js");






/**
 * Creates a dynamic sampling context from a client.
 *
 * Dispatches the `createDsc` lifecycle hook as a side effect.
 */
function getDynamicSamplingContextFromClient(trace_id, client, scope) {
  const options = client.getOptions();
  const {
    publicKey: public_key
  } = client.getDsn() || {};
  // TODO(v8): Remove segment from User
  // eslint-disable-next-line deprecation/deprecation
  const {
    segment: user_segment
  } = scope && scope.getUser() || {};
  const dsc = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_0__.dropUndefinedKeys)({
    environment: options.environment || _constants_js__WEBPACK_IMPORTED_MODULE_1__.DEFAULT_ENVIRONMENT,
    release: options.release,
    user_segment,
    public_key,
    trace_id
  });
  client.emit && client.emit('createDsc', dsc);
  return dsc;
}

/**
 * A Span with a frozen dynamic sampling context.
 */

/**
 * Creates a dynamic sampling context from a span (and client and scope)
 *
 * @param span the span from which a few values like the root span name and sample rate are extracted.
 *
 * @returns a dynamic sampling context
 */
function getDynamicSamplingContextFromSpan(span) {
  const client = (0,_exports_js__WEBPACK_IMPORTED_MODULE_2__.getClient)();
  if (!client) {
    return {};
  }

  // passing emit=false here to only emit later once the DSC is actually populated
  const dsc = getDynamicSamplingContextFromClient((0,_utils_spanUtils_js__WEBPACK_IMPORTED_MODULE_3__.spanToJSON)(span).trace_id || '', client, (0,_exports_js__WEBPACK_IMPORTED_MODULE_2__.getCurrentScope)());

  // TODO (v8): Remove v7FrozenDsc as a Transaction will no longer have _frozenDynamicSamplingContext
  const txn = (0,_utils_getRootSpan_js__WEBPACK_IMPORTED_MODULE_4__.getRootSpan)(span);
  if (!txn) {
    return dsc;
  }

  // TODO (v8): Remove v7FrozenDsc as a Transaction will no longer have _frozenDynamicSamplingContext
  // For now we need to avoid breaking users who directly created a txn with a DSC, where this field is still set.
  // @see Transaction class constructor
  const v7FrozenDsc = txn && txn._frozenDynamicSamplingContext;
  if (v7FrozenDsc) {
    return v7FrozenDsc;
  }

  // TODO (v8): Replace txn.metadata with txn.attributes[]
  // We can't do this yet because attributes aren't always set yet.
  // eslint-disable-next-line deprecation/deprecation
  const {
    sampleRate: maybeSampleRate,
    source
  } = txn.metadata;
  if (maybeSampleRate != null) {
    dsc.sample_rate = `${maybeSampleRate}`;
  }

  // We don't want to have a transaction name in the DSC if the source is "url" because URLs might contain PII
  const jsonSpan = (0,_utils_spanUtils_js__WEBPACK_IMPORTED_MODULE_3__.spanToJSON)(txn);

  // after JSON conversion, txn.name becomes jsonSpan.description
  if (source && source !== 'url') {
    dsc.transaction = jsonSpan.description;
  }
  dsc.sampled = String((0,_utils_spanUtils_js__WEBPACK_IMPORTED_MODULE_3__.spanIsSampled)(txn));
  client.emit && client.emit('createDsc', dsc);
  return dsc;
}


/***/ }),

/***/ "./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/utils/applyScopeDataToEvent.js":
/*!********************************************************************************************************!*\
  !*** ./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/utils/applyScopeDataToEvent.js ***!
  \********************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   applyScopeDataToEvent: () => (/* binding */ applyScopeDataToEvent),
/* harmony export */   mergeAndOverwriteScopeData: () => (/* binding */ mergeAndOverwriteScopeData),
/* harmony export */   mergeScopeData: () => (/* binding */ mergeScopeData)
/* harmony export */ });
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/object.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/misc.js");
/* harmony import */ var _tracing_dynamicSamplingContext_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../tracing/dynamicSamplingContext.js */ "./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/tracing/dynamicSamplingContext.js");
/* harmony import */ var _getRootSpan_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./getRootSpan.js */ "./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/utils/getRootSpan.js");
/* harmony import */ var _spanUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./spanUtils.js */ "./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/utils/spanUtils.js");





/**
 * Applies data from the scope to the event and runs all event processors on it.
 */
function applyScopeDataToEvent(event, data) {
  const {
    fingerprint,
    span,
    breadcrumbs,
    sdkProcessingMetadata
  } = data;

  // Apply general data
  applyDataToEvent(event, data);

  // We want to set the trace context for normal events only if there isn't already
  // a trace context on the event. There is a product feature in place where we link
  // errors with transaction and it relies on that.
  if (span) {
    applySpanToEvent(event, span);
  }
  applyFingerprintToEvent(event, fingerprint);
  applyBreadcrumbsToEvent(event, breadcrumbs);
  applySdkMetadataToEvent(event, sdkProcessingMetadata);
}

/** Merge data of two scopes together. */
function mergeScopeData(data, mergeData) {
  const {
    extra,
    tags,
    user,
    contexts,
    level,
    sdkProcessingMetadata,
    breadcrumbs,
    fingerprint,
    eventProcessors,
    attachments,
    propagationContext,
    // eslint-disable-next-line deprecation/deprecation
    transactionName,
    span
  } = mergeData;
  mergeAndOverwriteScopeData(data, 'extra', extra);
  mergeAndOverwriteScopeData(data, 'tags', tags);
  mergeAndOverwriteScopeData(data, 'user', user);
  mergeAndOverwriteScopeData(data, 'contexts', contexts);
  mergeAndOverwriteScopeData(data, 'sdkProcessingMetadata', sdkProcessingMetadata);
  if (level) {
    data.level = level;
  }
  if (transactionName) {
    // eslint-disable-next-line deprecation/deprecation
    data.transactionName = transactionName;
  }
  if (span) {
    data.span = span;
  }
  if (breadcrumbs.length) {
    data.breadcrumbs = [...data.breadcrumbs, ...breadcrumbs];
  }
  if (fingerprint.length) {
    data.fingerprint = [...data.fingerprint, ...fingerprint];
  }
  if (eventProcessors.length) {
    data.eventProcessors = [...data.eventProcessors, ...eventProcessors];
  }
  if (attachments.length) {
    data.attachments = [...data.attachments, ...attachments];
  }
  data.propagationContext = {
    ...data.propagationContext,
    ...propagationContext
  };
}

/**
 * Merges certain scope data. Undefined values will overwrite any existing values.
 * Exported only for tests.
 */
function mergeAndOverwriteScopeData(data, prop, mergeVal) {
  if (mergeVal && Object.keys(mergeVal).length) {
    // Clone object
    data[prop] = {
      ...data[prop]
    };
    for (const key in mergeVal) {
      if (Object.prototype.hasOwnProperty.call(mergeVal, key)) {
        data[prop][key] = mergeVal[key];
      }
    }
  }
}
function applyDataToEvent(event, data) {
  const {
    extra,
    tags,
    user,
    contexts,
    level,
    // eslint-disable-next-line deprecation/deprecation
    transactionName
  } = data;
  const cleanedExtra = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_0__.dropUndefinedKeys)(extra);
  if (cleanedExtra && Object.keys(cleanedExtra).length) {
    event.extra = {
      ...cleanedExtra,
      ...event.extra
    };
  }
  const cleanedTags = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_0__.dropUndefinedKeys)(tags);
  if (cleanedTags && Object.keys(cleanedTags).length) {
    event.tags = {
      ...cleanedTags,
      ...event.tags
    };
  }
  const cleanedUser = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_0__.dropUndefinedKeys)(user);
  if (cleanedUser && Object.keys(cleanedUser).length) {
    event.user = {
      ...cleanedUser,
      ...event.user
    };
  }
  const cleanedContexts = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_0__.dropUndefinedKeys)(contexts);
  if (cleanedContexts && Object.keys(cleanedContexts).length) {
    event.contexts = {
      ...cleanedContexts,
      ...event.contexts
    };
  }
  if (level) {
    event.level = level;
  }
  if (transactionName) {
    event.transaction = transactionName;
  }
}
function applyBreadcrumbsToEvent(event, breadcrumbs) {
  const mergedBreadcrumbs = [...(event.breadcrumbs || []), ...breadcrumbs];
  event.breadcrumbs = mergedBreadcrumbs.length ? mergedBreadcrumbs : undefined;
}
function applySdkMetadataToEvent(event, sdkProcessingMetadata) {
  event.sdkProcessingMetadata = {
    ...event.sdkProcessingMetadata,
    ...sdkProcessingMetadata
  };
}
function applySpanToEvent(event, span) {
  event.contexts = {
    trace: (0,_spanUtils_js__WEBPACK_IMPORTED_MODULE_1__.spanToTraceContext)(span),
    ...event.contexts
  };
  const rootSpan = (0,_getRootSpan_js__WEBPACK_IMPORTED_MODULE_2__.getRootSpan)(span);
  if (rootSpan) {
    event.sdkProcessingMetadata = {
      dynamicSamplingContext: (0,_tracing_dynamicSamplingContext_js__WEBPACK_IMPORTED_MODULE_3__.getDynamicSamplingContextFromSpan)(span),
      ...event.sdkProcessingMetadata
    };
    const transactionName = (0,_spanUtils_js__WEBPACK_IMPORTED_MODULE_1__.spanToJSON)(rootSpan).description;
    if (transactionName) {
      event.tags = {
        transaction: transactionName,
        ...event.tags
      };
    }
  }
}

/**
 * Applies fingerprint from the scope to the event if there's one,
 * uses message if there's one instead or get rid of empty fingerprint
 */
function applyFingerprintToEvent(event, fingerprint) {
  // Make sure it's an array first and we actually have something in place
  event.fingerprint = event.fingerprint ? (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_4__.arrayify)(event.fingerprint) : [];

  // If we have something on the scope, then merge it with event
  if (fingerprint) {
    event.fingerprint = event.fingerprint.concat(fingerprint);
  }

  // If we have no data at all, remove empty array default
  if (event.fingerprint && !event.fingerprint.length) {
    delete event.fingerprint;
  }
}


/***/ }),

/***/ "./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/utils/getRootSpan.js":
/*!**********************************************************************************************!*\
  !*** ./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/utils/getRootSpan.js ***!
  \**********************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getRootSpan: () => (/* binding */ getRootSpan)
/* harmony export */ });
/**
 * Returns the root span of a given span.
 *
 * As long as we use `Transaction`s internally, the returned root span
 * will be a `Transaction` but be aware that this might change in the future.
 *
 * If the given span has no root span or transaction, `undefined` is returned.
 */
function getRootSpan(span) {
  // TODO (v8): Remove this check and just return span
  // eslint-disable-next-line deprecation/deprecation
  return span.transaction;
}


/***/ }),

/***/ "./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/utils/prepareEvent.js":
/*!***********************************************************************************************!*\
  !*** ./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/utils/prepareEvent.js ***!
  \***********************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   applyDebugIds: () => (/* binding */ applyDebugIds),
/* harmony export */   applyDebugMeta: () => (/* binding */ applyDebugMeta),
/* harmony export */   parseEventHintOrCaptureContext: () => (/* binding */ parseEventHintOrCaptureContext),
/* harmony export */   prepareEvent: () => (/* binding */ prepareEvent)
/* harmony export */ });
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/misc.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/time.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/string.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/worldwide.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/normalize.js");
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../constants.js */ "./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/constants.js");
/* harmony import */ var _eventProcessors_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../eventProcessors.js */ "./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/eventProcessors.js");
/* harmony import */ var _scope_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../scope.js */ "./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/scope.js");
/* harmony import */ var _applyScopeDataToEvent_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./applyScopeDataToEvent.js */ "./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/utils/applyScopeDataToEvent.js");
/* harmony import */ var _spanUtils_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./spanUtils.js */ "./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/utils/spanUtils.js");







/**
 * This type makes sure that we get either a CaptureContext, OR an EventHint.
 * It does not allow mixing them, which could lead to unexpected outcomes, e.g. this is disallowed:
 * { user: { id: '123' }, mechanism: { handled: false } }
 */

/**
 * Adds common information to events.
 *
 * The information includes release and environment from `options`,
 * breadcrumbs and context (extra, tags and user) from the scope.
 *
 * Information that is already present in the event is never overwritten. For
 * nested objects, such as the context, keys are merged.
 *
 * Note: This also triggers callbacks for `addGlobalEventProcessor`, but not `beforeSend`.
 *
 * @param event The original event.
 * @param hint May contain additional information about the original exception.
 * @param scope A scope containing event metadata.
 * @returns A new event with more information.
 * @hidden
 */
function prepareEvent(options, event, hint, scope, client, isolationScope) {
  const {
    normalizeDepth = 3,
    normalizeMaxBreadth = 1000
  } = options;
  const prepared = {
    ...event,
    event_id: event.event_id || hint.event_id || (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_0__.uuid4)(),
    timestamp: event.timestamp || (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_1__.dateTimestampInSeconds)()
  };
  const integrations = hint.integrations || options.integrations.map(i => i.name);
  applyClientOptions(prepared, options);
  applyIntegrationsMetadata(prepared, integrations);

  // Only put debug IDs onto frames for error events.
  if (event.type === undefined) {
    applyDebugIds(prepared, options.stackParser);
  }

  // If we have scope given to us, use it as the base for further modifications.
  // This allows us to prevent unnecessary copying of data if `captureContext` is not provided.
  const finalScope = getFinalScope(scope, hint.captureContext);
  if (hint.mechanism) {
    (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_0__.addExceptionMechanism)(prepared, hint.mechanism);
  }
  const clientEventProcessors = client && client.getEventProcessors ? client.getEventProcessors() : [];

  // This should be the last thing called, since we want that
  // {@link Hub.addEventProcessor} gets the finished prepared event.
  // Merge scope data together
  const data = (0,_scope_js__WEBPACK_IMPORTED_MODULE_2__.getGlobalScope)().getScopeData();
  if (isolationScope) {
    const isolationData = isolationScope.getScopeData();
    (0,_applyScopeDataToEvent_js__WEBPACK_IMPORTED_MODULE_3__.mergeScopeData)(data, isolationData);
  }
  if (finalScope) {
    const finalScopeData = finalScope.getScopeData();
    (0,_applyScopeDataToEvent_js__WEBPACK_IMPORTED_MODULE_3__.mergeScopeData)(data, finalScopeData);
  }
  const attachments = [...(hint.attachments || []), ...data.attachments];
  if (attachments.length) {
    hint.attachments = attachments;
  }
  (0,_applyScopeDataToEvent_js__WEBPACK_IMPORTED_MODULE_3__.applyScopeDataToEvent)(prepared, data);

  // TODO (v8): Update this order to be: Global > Client > Scope
  const eventProcessors = [...clientEventProcessors,
  // eslint-disable-next-line deprecation/deprecation
  ...(0,_eventProcessors_js__WEBPACK_IMPORTED_MODULE_4__.getGlobalEventProcessors)(),
  // Run scope event processors _after_ all other processors
  ...data.eventProcessors];
  const result = (0,_eventProcessors_js__WEBPACK_IMPORTED_MODULE_4__.notifyEventProcessors)(eventProcessors, prepared, hint);
  return result.then(evt => {
    if (evt) {
      // We apply the debug_meta field only after all event processors have ran, so that if any event processors modified
      // file names (e.g.the RewriteFrames integration) the filename -> debug ID relationship isn't destroyed.
      // This should not cause any PII issues, since we're only moving data that is already on the event and not adding
      // any new data
      applyDebugMeta(evt);
    }
    if (typeof normalizeDepth === 'number' && normalizeDepth > 0) {
      return normalizeEvent(evt, normalizeDepth, normalizeMaxBreadth);
    }
    return evt;
  });
}

/**
 *  Enhances event using the client configuration.
 *  It takes care of all "static" values like environment, release and `dist`,
 *  as well as truncating overly long values.
 * @param event event instance to be enhanced
 */
function applyClientOptions(event, options) {
  const {
    environment,
    release,
    dist,
    maxValueLength = 250
  } = options;
  if (!('environment' in event)) {
    event.environment = 'environment' in options ? environment : _constants_js__WEBPACK_IMPORTED_MODULE_5__.DEFAULT_ENVIRONMENT;
  }
  if (event.release === undefined && release !== undefined) {
    event.release = release;
  }
  if (event.dist === undefined && dist !== undefined) {
    event.dist = dist;
  }
  if (event.message) {
    event.message = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_6__.truncate)(event.message, maxValueLength);
  }
  const exception = event.exception && event.exception.values && event.exception.values[0];
  if (exception && exception.value) {
    exception.value = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_6__.truncate)(exception.value, maxValueLength);
  }
  const request = event.request;
  if (request && request.url) {
    request.url = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_6__.truncate)(request.url, maxValueLength);
  }
}
const debugIdStackParserCache = new WeakMap();

/**
 * Puts debug IDs into the stack frames of an error event.
 */
function applyDebugIds(event, stackParser) {
  const debugIdMap = _sentry_utils__WEBPACK_IMPORTED_MODULE_7__.GLOBAL_OBJ._sentryDebugIds;
  if (!debugIdMap) {
    return;
  }
  let debugIdStackFramesCache;
  const cachedDebugIdStackFrameCache = debugIdStackParserCache.get(stackParser);
  if (cachedDebugIdStackFrameCache) {
    debugIdStackFramesCache = cachedDebugIdStackFrameCache;
  } else {
    debugIdStackFramesCache = new Map();
    debugIdStackParserCache.set(stackParser, debugIdStackFramesCache);
  }

  // Build a map of filename -> debug_id
  const filenameDebugIdMap = Object.keys(debugIdMap).reduce((acc, debugIdStackTrace) => {
    let parsedStack;
    const cachedParsedStack = debugIdStackFramesCache.get(debugIdStackTrace);
    if (cachedParsedStack) {
      parsedStack = cachedParsedStack;
    } else {
      parsedStack = stackParser(debugIdStackTrace);
      debugIdStackFramesCache.set(debugIdStackTrace, parsedStack);
    }
    for (let i = parsedStack.length - 1; i >= 0; i--) {
      const stackFrame = parsedStack[i];
      if (stackFrame.filename) {
        acc[stackFrame.filename] = debugIdMap[debugIdStackTrace];
        break;
      }
    }
    return acc;
  }, {});
  try {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    event.exception.values.forEach(exception => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      exception.stacktrace.frames.forEach(frame => {
        if (frame.filename) {
          frame.debug_id = filenameDebugIdMap[frame.filename];
        }
      });
    });
  } catch (e) {
    // To save bundle size we're just try catching here instead of checking for the existence of all the different objects.
  }
}

/**
 * Moves debug IDs from the stack frames of an error event into the debug_meta field.
 */
function applyDebugMeta(event) {
  // Extract debug IDs and filenames from the stack frames on the event.
  const filenameDebugIdMap = {};
  try {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    event.exception.values.forEach(exception => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      exception.stacktrace.frames.forEach(frame => {
        if (frame.debug_id) {
          if (frame.abs_path) {
            filenameDebugIdMap[frame.abs_path] = frame.debug_id;
          } else if (frame.filename) {
            filenameDebugIdMap[frame.filename] = frame.debug_id;
          }
          delete frame.debug_id;
        }
      });
    });
  } catch (e) {
    // To save bundle size we're just try catching here instead of checking for the existence of all the different objects.
  }
  if (Object.keys(filenameDebugIdMap).length === 0) {
    return;
  }

  // Fill debug_meta information
  event.debug_meta = event.debug_meta || {};
  event.debug_meta.images = event.debug_meta.images || [];
  const images = event.debug_meta.images;
  Object.keys(filenameDebugIdMap).forEach(filename => {
    images.push({
      type: 'sourcemap',
      code_file: filename,
      debug_id: filenameDebugIdMap[filename]
    });
  });
}

/**
 * This function adds all used integrations to the SDK info in the event.
 * @param event The event that will be filled with all integrations.
 */
function applyIntegrationsMetadata(event, integrationNames) {
  if (integrationNames.length > 0) {
    event.sdk = event.sdk || {};
    event.sdk.integrations = [...(event.sdk.integrations || []), ...integrationNames];
  }
}

/**
 * Applies `normalize` function on necessary `Event` attributes to make them safe for serialization.
 * Normalized keys:
 * - `breadcrumbs.data`
 * - `user`
 * - `contexts`
 * - `extra`
 * @param event Event
 * @returns Normalized event
 */
function normalizeEvent(event, depth, maxBreadth) {
  if (!event) {
    return null;
  }
  const normalized = {
    ...event,
    ...(event.breadcrumbs && {
      breadcrumbs: event.breadcrumbs.map(b => ({
        ...b,
        ...(b.data && {
          data: (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_8__.normalize)(b.data, depth, maxBreadth)
        })
      }))
    }),
    ...(event.user && {
      user: (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_8__.normalize)(event.user, depth, maxBreadth)
    }),
    ...(event.contexts && {
      contexts: (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_8__.normalize)(event.contexts, depth, maxBreadth)
    }),
    ...(event.extra && {
      extra: (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_8__.normalize)(event.extra, depth, maxBreadth)
    })
  };

  // event.contexts.trace stores information about a Transaction. Similarly,
  // event.spans[] stores information about child Spans. Given that a
  // Transaction is conceptually a Span, normalization should apply to both
  // Transactions and Spans consistently.
  // For now the decision is to skip normalization of Transactions and Spans,
  // so this block overwrites the normalized event to add back the original
  // Transaction information prior to normalization.
  if (event.contexts && event.contexts.trace && normalized.contexts) {
    normalized.contexts.trace = event.contexts.trace;

    // event.contexts.trace.data may contain circular/dangerous data so we need to normalize it
    if (event.contexts.trace.data) {
      normalized.contexts.trace.data = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_8__.normalize)(event.contexts.trace.data, depth, maxBreadth);
    }
  }

  // event.spans[].data may contain circular/dangerous data so we need to normalize it
  if (event.spans) {
    normalized.spans = event.spans.map(span => {
      const data = (0,_spanUtils_js__WEBPACK_IMPORTED_MODULE_9__.spanToJSON)(span).data;
      if (data) {
        // This is a bit weird, as we generally have `Span` instances here, but to be safe we do not assume so
        // eslint-disable-next-line deprecation/deprecation
        span.data = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_8__.normalize)(data, depth, maxBreadth);
      }
      return span;
    });
  }
  return normalized;
}
function getFinalScope(scope, captureContext) {
  if (!captureContext) {
    return scope;
  }
  const finalScope = scope ? scope.clone() : new _scope_js__WEBPACK_IMPORTED_MODULE_2__.Scope();
  finalScope.update(captureContext);
  return finalScope;
}

/**
 * Parse either an `EventHint` directly, or convert a `CaptureContext` to an `EventHint`.
 * This is used to allow to update method signatures that used to accept a `CaptureContext` but should now accept an `EventHint`.
 */
function parseEventHintOrCaptureContext(hint) {
  if (!hint) {
    return undefined;
  }

  // If you pass a Scope or `() => Scope` as CaptureContext, we just return this as captureContext
  if (hintIsScopeOrFunction(hint)) {
    return {
      captureContext: hint
    };
  }
  if (hintIsScopeContext(hint)) {
    return {
      captureContext: hint
    };
  }
  return hint;
}
function hintIsScopeOrFunction(hint) {
  return hint instanceof _scope_js__WEBPACK_IMPORTED_MODULE_2__.Scope || typeof hint === 'function';
}
const captureContextKeys = ['user', 'level', 'extra', 'contexts', 'tags', 'fingerprint', 'requestSession', 'propagationContext'];
function hintIsScopeContext(hint) {
  return Object.keys(hint).some(key => captureContextKeys.includes(key));
}


/***/ }),

/***/ "./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/utils/spanUtils.js":
/*!********************************************************************************************!*\
  !*** ./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/utils/spanUtils.js ***!
  \********************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TRACE_FLAG_NONE: () => (/* binding */ TRACE_FLAG_NONE),
/* harmony export */   TRACE_FLAG_SAMPLED: () => (/* binding */ TRACE_FLAG_SAMPLED),
/* harmony export */   spanIsSampled: () => (/* binding */ spanIsSampled),
/* harmony export */   spanTimeInputToSeconds: () => (/* binding */ spanTimeInputToSeconds),
/* harmony export */   spanToJSON: () => (/* binding */ spanToJSON),
/* harmony export */   spanToTraceContext: () => (/* binding */ spanToTraceContext),
/* harmony export */   spanToTraceHeader: () => (/* binding */ spanToTraceHeader)
/* harmony export */ });
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/object.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/tracing.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/time.js");


// These are aligned with OpenTelemetry trace flags
const TRACE_FLAG_NONE = 0x0;
const TRACE_FLAG_SAMPLED = 0x1;

/**
 * Convert a span to a trace context, which can be sent as the `trace` context in an event.
 */
function spanToTraceContext(span) {
  const {
    spanId: span_id,
    traceId: trace_id
  } = span.spanContext();
  const {
    data,
    op,
    parent_span_id,
    status,
    tags,
    origin
  } = spanToJSON(span);
  return (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_0__.dropUndefinedKeys)({
    data,
    op,
    parent_span_id,
    span_id,
    status,
    tags,
    trace_id,
    origin
  });
}

/**
 * Convert a Span to a Sentry trace header.
 */
function spanToTraceHeader(span) {
  const {
    traceId,
    spanId
  } = span.spanContext();
  const sampled = spanIsSampled(span);
  return (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_1__.generateSentryTraceHeader)(traceId, spanId, sampled);
}

/**
 * Convert a span time input intp a timestamp in seconds.
 */
function spanTimeInputToSeconds(input) {
  if (typeof input === 'number') {
    return ensureTimestampInSeconds(input);
  }
  if (Array.isArray(input)) {
    // See {@link HrTime} for the array-based time format
    return input[0] + input[1] / 1e9;
  }
  if (input instanceof Date) {
    return ensureTimestampInSeconds(input.getTime());
  }
  return (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_2__.timestampInSeconds)();
}

/**
 * Converts a timestamp to second, if it was in milliseconds, or keeps it as second.
 */
function ensureTimestampInSeconds(timestamp) {
  const isMs = timestamp > 9999999999;
  return isMs ? timestamp / 1000 : timestamp;
}

/**
 * Convert a span to a JSON representation.
 * Note that all fields returned here are optional and need to be guarded against.
 *
 * Note: Because of this, we currently have a circular type dependency (which we opted out of in package.json).
 * This is not avoidable as we need `spanToJSON` in `spanUtils.ts`, which in turn is needed by `span.ts` for backwards compatibility.
 * And `spanToJSON` needs the Span class from `span.ts` to check here.
 * TODO v8: When we remove the deprecated stuff from `span.ts`, we can remove the circular dependency again.
 */
function spanToJSON(span) {
  if (spanIsSpanClass(span)) {
    return span.getSpanJSON();
  }

  // Fallback: We also check for `.toJSON()` here...
  // eslint-disable-next-line deprecation/deprecation
  if (typeof span.toJSON === 'function') {
    // eslint-disable-next-line deprecation/deprecation
    return span.toJSON();
  }
  return {};
}

/**
 * Sadly, due to circular dependency checks we cannot actually import the Span class here and check for instanceof.
 * :( So instead we approximate this by checking if it has the `getSpanJSON` method.
 */
function spanIsSpanClass(span) {
  return typeof span.getSpanJSON === 'function';
}

/**
 * Returns true if a span is sampled.
 * In most cases, you should just use `span.isRecording()` instead.
 * However, this has a slightly different semantic, as it also returns false if the span is finished.
 * So in the case where this distinction is important, use this method.
 */
function spanIsSampled(span) {
  // We align our trace flags with the ones OpenTelemetry use
  // So we also check for sampled the same way they do.
  const {
    traceFlags
  } = span.spanContext();
  // eslint-disable-next-line no-bitwise
  return Boolean(traceFlags & TRACE_FLAG_SAMPLED);
}


/***/ }),

/***/ "./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/version.js":
/*!************************************************************************************!*\
  !*** ./node_modules/@sentry/integrations/node_modules/@sentry/core/esm/version.js ***!
  \************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SDK_VERSION: () => (/* binding */ SDK_VERSION)
/* harmony export */ });
const SDK_VERSION = '7.120.3';


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/baggage.js":
/*!***************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/baggage.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BAGGAGE_HEADER_NAME: () => (/* binding */ BAGGAGE_HEADER_NAME),
/* harmony export */   MAX_BAGGAGE_STRING_LENGTH: () => (/* binding */ MAX_BAGGAGE_STRING_LENGTH),
/* harmony export */   SENTRY_BAGGAGE_KEY_PREFIX: () => (/* binding */ SENTRY_BAGGAGE_KEY_PREFIX),
/* harmony export */   SENTRY_BAGGAGE_KEY_PREFIX_REGEX: () => (/* binding */ SENTRY_BAGGAGE_KEY_PREFIX_REGEX),
/* harmony export */   baggageHeaderToDynamicSamplingContext: () => (/* binding */ baggageHeaderToDynamicSamplingContext),
/* harmony export */   dynamicSamplingContextToSentryBaggageHeader: () => (/* binding */ dynamicSamplingContextToSentryBaggageHeader)
/* harmony export */ });
/* harmony import */ var _debug_build_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./debug-build.js */ "./node_modules/@sentry/utils/esm/debug-build.js");
/* harmony import */ var _is_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./is.js */ "./node_modules/@sentry/utils/esm/is.js");
/* harmony import */ var _logger_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./logger.js */ "./node_modules/@sentry/utils/esm/logger.js");



const BAGGAGE_HEADER_NAME = 'baggage';
const SENTRY_BAGGAGE_KEY_PREFIX = 'sentry-';
const SENTRY_BAGGAGE_KEY_PREFIX_REGEX = /^sentry-/;

/**
 * Max length of a serialized baggage string
 *
 * https://www.w3.org/TR/baggage/#limits
 */
const MAX_BAGGAGE_STRING_LENGTH = 8192;

/**
 * Takes a baggage header and turns it into Dynamic Sampling Context, by extracting all the "sentry-" prefixed values
 * from it.
 *
 * @param baggageHeader A very bread definition of a baggage header as it might appear in various frameworks.
 * @returns The Dynamic Sampling Context that was found on `baggageHeader`, if there was any, `undefined` otherwise.
 */
function baggageHeaderToDynamicSamplingContext(
// Very liberal definition of what any incoming header might look like
baggageHeader) {
  if (!(0,_is_js__WEBPACK_IMPORTED_MODULE_0__.isString)(baggageHeader) && !Array.isArray(baggageHeader)) {
    return undefined;
  }

  // Intermediary object to store baggage key value pairs of incoming baggage headers on.
  // It is later used to read Sentry-DSC-values from.
  let baggageObject = {};
  if (Array.isArray(baggageHeader)) {
    // Combine all baggage headers into one object containing the baggage values so we can later read the Sentry-DSC-values from it
    baggageObject = baggageHeader.reduce((acc, curr) => {
      const currBaggageObject = baggageHeaderToObject(curr);
      for (const key of Object.keys(currBaggageObject)) {
        acc[key] = currBaggageObject[key];
      }
      return acc;
    }, {});
  } else {
    // Return undefined if baggage header is an empty string (technically an empty baggage header is not spec conform but
    // this is how we choose to handle it)
    if (!baggageHeader) {
      return undefined;
    }
    baggageObject = baggageHeaderToObject(baggageHeader);
  }

  // Read all "sentry-" prefixed values out of the baggage object and put it onto a dynamic sampling context object.
  const dynamicSamplingContext = Object.entries(baggageObject).reduce((acc, _ref) => {
    let [key, value] = _ref;
    if (key.match(SENTRY_BAGGAGE_KEY_PREFIX_REGEX)) {
      const nonPrefixedKey = key.slice(SENTRY_BAGGAGE_KEY_PREFIX.length);
      acc[nonPrefixedKey] = value;
    }
    return acc;
  }, {});

  // Only return a dynamic sampling context object if there are keys in it.
  // A keyless object means there were no sentry values on the header, which means that there is no DSC.
  if (Object.keys(dynamicSamplingContext).length > 0) {
    return dynamicSamplingContext;
  } else {
    return undefined;
  }
}

/**
 * Turns a Dynamic Sampling Object into a baggage header by prefixing all the keys on the object with "sentry-".
 *
 * @param dynamicSamplingContext The Dynamic Sampling Context to turn into a header. For convenience and compatibility
 * with the `getDynamicSamplingContext` method on the Transaction class ,this argument can also be `undefined`. If it is
 * `undefined` the function will return `undefined`.
 * @returns a baggage header, created from `dynamicSamplingContext`, or `undefined` either if `dynamicSamplingContext`
 * was `undefined`, or if `dynamicSamplingContext` didn't contain any values.
 */
function dynamicSamplingContextToSentryBaggageHeader(
// this also takes undefined for convenience and bundle size in other places
dynamicSamplingContext) {
  if (!dynamicSamplingContext) {
    return undefined;
  }

  // Prefix all DSC keys with "sentry-" and put them into a new object
  const sentryPrefixedDSC = Object.entries(dynamicSamplingContext).reduce((acc, _ref2) => {
    let [dscKey, dscValue] = _ref2;
    if (dscValue) {
      acc[`${SENTRY_BAGGAGE_KEY_PREFIX}${dscKey}`] = dscValue;
    }
    return acc;
  }, {});
  return objectToBaggageHeader(sentryPrefixedDSC);
}

/**
 * Will parse a baggage header, which is a simple key-value map, into a flat object.
 *
 * @param baggageHeader The baggage header to parse.
 * @returns a flat object containing all the key-value pairs from `baggageHeader`.
 */
function baggageHeaderToObject(baggageHeader) {
  return baggageHeader.split(',').map(baggageEntry => baggageEntry.split('=').map(keyOrValue => decodeURIComponent(keyOrValue.trim()))).reduce((acc, _ref3) => {
    let [key, value] = _ref3;
    acc[key] = value;
    return acc;
  }, {});
}

/**
 * Turns a flat object (key-value pairs) into a baggage header, which is also just key-value pairs.
 *
 * @param object The object to turn into a baggage header.
 * @returns a baggage header string, or `undefined` if the object didn't have any values, since an empty baggage header
 * is not spec compliant.
 */
function objectToBaggageHeader(object) {
  if (Object.keys(object).length === 0) {
    // An empty baggage header is not spec compliant: We return undefined.
    return undefined;
  }
  return Object.entries(object).reduce((baggageHeader, _ref4, currentIndex) => {
    let [objectKey, objectValue] = _ref4;
    const baggageEntry = `${encodeURIComponent(objectKey)}=${encodeURIComponent(objectValue)}`;
    const newBaggageHeader = currentIndex === 0 ? baggageEntry : `${baggageHeader},${baggageEntry}`;
    if (newBaggageHeader.length > MAX_BAGGAGE_STRING_LENGTH) {
      _debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD && _logger_js__WEBPACK_IMPORTED_MODULE_2__.logger.warn(`Not adding key: ${objectKey} with val: ${objectValue} to baggage header due to exceeding baggage size limits.`);
      return baggageHeader;
    } else {
      return newBaggageHeader;
    }
  }, '');
}


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/browser.js":
/*!***************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/browser.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getComponentName: () => (/* binding */ getComponentName),
/* harmony export */   getDomElement: () => (/* binding */ getDomElement),
/* harmony export */   getLocationHref: () => (/* binding */ getLocationHref),
/* harmony export */   htmlTreeAsString: () => (/* binding */ htmlTreeAsString)
/* harmony export */ });
/* harmony import */ var _is_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./is.js */ "./node_modules/@sentry/utils/esm/is.js");
/* harmony import */ var _worldwide_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./worldwide.js */ "./node_modules/@sentry/utils/esm/worldwide.js");



// eslint-disable-next-line deprecation/deprecation
const WINDOW = (0,_worldwide_js__WEBPACK_IMPORTED_MODULE_0__.getGlobalObject)();
const DEFAULT_MAX_STRING_LENGTH = 80;

/**
 * Given a child DOM element, returns a query-selector statement describing that
 * and its ancestors
 * e.g. [HTMLElement] => body > div > input#foo.btn[name=baz]
 * @returns generated DOM path
 */
function htmlTreeAsString(elem, options) {
  if (options === void 0) {
    options = {};
  }
  if (!elem) {
    return '<unknown>';
  }

  // try/catch both:
  // - accessing event.target (see getsentry/raven-js#838, #768)
  // - `htmlTreeAsString` because it's complex, and just accessing the DOM incorrectly
  // - can throw an exception in some circumstances.
  try {
    let currentElem = elem;
    const MAX_TRAVERSE_HEIGHT = 5;
    const out = [];
    let height = 0;
    let len = 0;
    const separator = ' > ';
    const sepLength = separator.length;
    let nextStr;
    const keyAttrs = Array.isArray(options) ? options : options.keyAttrs;
    const maxStringLength = !Array.isArray(options) && options.maxStringLength || DEFAULT_MAX_STRING_LENGTH;
    while (currentElem && height++ < MAX_TRAVERSE_HEIGHT) {
      nextStr = _htmlElementAsString(currentElem, keyAttrs);
      // bail out if
      // - nextStr is the 'html' element
      // - the length of the string that would be created exceeds maxStringLength
      //   (ignore this limit if we are on the first iteration)
      if (nextStr === 'html' || height > 1 && len + out.length * sepLength + nextStr.length >= maxStringLength) {
        break;
      }
      out.push(nextStr);
      len += nextStr.length;
      currentElem = currentElem.parentNode;
    }
    return out.reverse().join(separator);
  } catch (_oO) {
    return '<unknown>';
  }
}

/**
 * Returns a simple, query-selector representation of a DOM element
 * e.g. [HTMLElement] => input#foo.btn[name=baz]
 * @returns generated DOM path
 */
function _htmlElementAsString(el, keyAttrs) {
  const elem = el;
  const out = [];
  let className;
  let classes;
  let key;
  let attr;
  let i;
  if (!elem || !elem.tagName) {
    return '';
  }

  // @ts-expect-error WINDOW has HTMLElement
  if (WINDOW.HTMLElement) {
    // If using the component name annotation plugin, this value may be available on the DOM node
    if (elem instanceof HTMLElement && elem.dataset && elem.dataset['sentryComponent']) {
      return elem.dataset['sentryComponent'];
    }
  }
  out.push(elem.tagName.toLowerCase());

  // Pairs of attribute keys defined in `serializeAttribute` and their values on element.
  const keyAttrPairs = keyAttrs && keyAttrs.length ? keyAttrs.filter(keyAttr => elem.getAttribute(keyAttr)).map(keyAttr => [keyAttr, elem.getAttribute(keyAttr)]) : null;
  if (keyAttrPairs && keyAttrPairs.length) {
    keyAttrPairs.forEach(keyAttrPair => {
      out.push(`[${keyAttrPair[0]}="${keyAttrPair[1]}"]`);
    });
  } else {
    if (elem.id) {
      out.push(`#${elem.id}`);
    }

    // eslint-disable-next-line prefer-const
    className = elem.className;
    if (className && (0,_is_js__WEBPACK_IMPORTED_MODULE_1__.isString)(className)) {
      classes = className.split(/\s+/);
      for (i = 0; i < classes.length; i++) {
        out.push(`.${classes[i]}`);
      }
    }
  }
  const allowedAttrs = ['aria-label', 'type', 'name', 'title', 'alt'];
  for (i = 0; i < allowedAttrs.length; i++) {
    key = allowedAttrs[i];
    attr = elem.getAttribute(key);
    if (attr) {
      out.push(`[${key}="${attr}"]`);
    }
  }
  return out.join('');
}

/**
 * A safe form of location.href
 */
function getLocationHref() {
  try {
    return WINDOW.document.location.href;
  } catch (oO) {
    return '';
  }
}

/**
 * Gets a DOM element by using document.querySelector.
 *
 * This wrapper will first check for the existance of the function before
 * actually calling it so that we don't have to take care of this check,
 * every time we want to access the DOM.
 *
 * Reason: DOM/querySelector is not available in all environments.
 *
 * We have to cast to any because utils can be consumed by a variety of environments,
 * and we don't want to break TS users. If you know what element will be selected by
 * `document.querySelector`, specify it as part of the generic call. For example,
 * `const element = getDomElement<Element>('selector');`
 *
 * @param selector the selector string passed on to document.querySelector
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getDomElement(selector) {
  if (WINDOW.document && WINDOW.document.querySelector) {
    return WINDOW.document.querySelector(selector);
  }
  return null;
}

/**
 * Given a DOM element, traverses up the tree until it finds the first ancestor node
 * that has the `data-sentry-component` attribute. This attribute is added at build-time
 * by projects that have the component name annotation plugin installed.
 *
 * @returns a string representation of the component for the provided DOM element, or `null` if not found
 */
function getComponentName(elem) {
  // @ts-expect-error WINDOW has HTMLElement
  if (!WINDOW.HTMLElement) {
    return null;
  }
  let currentElem = elem;
  const MAX_TRAVERSE_HEIGHT = 5;
  for (let i = 0; i < MAX_TRAVERSE_HEIGHT; i++) {
    if (!currentElem) {
      return null;
    }
    if (currentElem instanceof HTMLElement && currentElem.dataset['sentryComponent']) {
      return currentElem.dataset['sentryComponent'];
    }
    currentElem = currentElem.parentNode;
  }
  return null;
}


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/debug-build.js":
/*!*******************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/debug-build.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DEBUG_BUILD: () => (/* binding */ DEBUG_BUILD)
/* harmony export */ });
/**
 * This serves as a build time flag that will be true by default, but false in non-debug builds or if users replace `__SENTRY_DEBUG__` in their generated code.
 *
 * ATTENTION: This constant must never cross package boundaries (i.e. be exported) to guarantee that it can be used for tree shaking.
 */
const DEBUG_BUILD =  false || false;


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/instrument/_handlers.js":
/*!****************************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/instrument/_handlers.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addHandler: () => (/* binding */ addHandler),
/* harmony export */   maybeInstrument: () => (/* binding */ maybeInstrument),
/* harmony export */   resetInstrumentationHandlers: () => (/* binding */ resetInstrumentationHandlers),
/* harmony export */   triggerHandlers: () => (/* binding */ triggerHandlers)
/* harmony export */ });
/* harmony import */ var _debug_build_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../debug-build.js */ "./node_modules/@sentry/utils/esm/debug-build.js");
/* harmony import */ var _logger_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../logger.js */ "./node_modules/@sentry/utils/esm/logger.js");
/* harmony import */ var _stacktrace_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../stacktrace.js */ "./node_modules/@sentry/utils/esm/stacktrace.js");




// We keep the handlers globally
const handlers = {};
const instrumented = {};

/** Add a handler function. */
function addHandler(type, handler) {
  handlers[type] = handlers[type] || [];
  handlers[type].push(handler);
}

/**
 * Reset all instrumentation handlers.
 * This can be used by tests to ensure we have a clean slate of instrumentation handlers.
 */
function resetInstrumentationHandlers() {
  Object.keys(handlers).forEach(key => {
    handlers[key] = undefined;
  });
}

/** Maybe run an instrumentation function, unless it was already called. */
function maybeInstrument(type, instrumentFn) {
  if (!instrumented[type]) {
    instrumentFn();
    instrumented[type] = true;
  }
}

/** Trigger handlers for a given instrumentation type. */
function triggerHandlers(type, data) {
  const typeHandlers = type && handlers[type];
  if (!typeHandlers) {
    return;
  }
  for (const handler of typeHandlers) {
    try {
      handler(data);
    } catch (e) {
      _debug_build_js__WEBPACK_IMPORTED_MODULE_0__.DEBUG_BUILD && _logger_js__WEBPACK_IMPORTED_MODULE_1__.logger.error(`Error while triggering instrumentation handler.\nType: ${type}\nName: ${(0,_stacktrace_js__WEBPACK_IMPORTED_MODULE_2__.getFunctionName)(handler)}\nError:`, e);
    }
  }
}


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/instrument/console.js":
/*!**************************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/instrument/console.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addConsoleInstrumentationHandler: () => (/* binding */ addConsoleInstrumentationHandler)
/* harmony export */ });
/* harmony import */ var _logger_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../logger.js */ "./node_modules/@sentry/utils/esm/logger.js");
/* harmony import */ var _object_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../object.js */ "./node_modules/@sentry/utils/esm/object.js");
/* harmony import */ var _worldwide_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../worldwide.js */ "./node_modules/@sentry/utils/esm/worldwide.js");
/* harmony import */ var _handlers_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_handlers.js */ "./node_modules/@sentry/utils/esm/instrument/_handlers.js");





/**
 * Add an instrumentation handler for when a console.xxx method is called.
 *
 * Use at your own risk, this might break without changelog notice, only used internally.
 * @hidden
 */
function addConsoleInstrumentationHandler(handler) {
  const type = 'console';
  (0,_handlers_js__WEBPACK_IMPORTED_MODULE_0__.addHandler)(type, handler);
  (0,_handlers_js__WEBPACK_IMPORTED_MODULE_0__.maybeInstrument)(type, instrumentConsole);
}
function instrumentConsole() {
  if (!("console" in _worldwide_js__WEBPACK_IMPORTED_MODULE_1__.GLOBAL_OBJ)) {
    return;
  }
  _logger_js__WEBPACK_IMPORTED_MODULE_2__.CONSOLE_LEVELS.forEach(function (level) {
    if (!(level in _worldwide_js__WEBPACK_IMPORTED_MODULE_1__.GLOBAL_OBJ.console)) {
      return;
    }
    (0,_object_js__WEBPACK_IMPORTED_MODULE_3__.fill)(_worldwide_js__WEBPACK_IMPORTED_MODULE_1__.GLOBAL_OBJ.console, level, function (originalConsoleMethod) {
      _logger_js__WEBPACK_IMPORTED_MODULE_2__.originalConsoleMethods[level] = originalConsoleMethod;
      return function () {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        const handlerData = {
          args,
          level
        };
        (0,_handlers_js__WEBPACK_IMPORTED_MODULE_0__.triggerHandlers)('console', handlerData);
        const log = _logger_js__WEBPACK_IMPORTED_MODULE_2__.originalConsoleMethods[level];
        log && log.apply(_worldwide_js__WEBPACK_IMPORTED_MODULE_1__.GLOBAL_OBJ.console, args);
      };
    });
  });
}


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/is.js":
/*!**********************************************!*\
  !*** ./node_modules/@sentry/utils/esm/is.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isDOMError: () => (/* binding */ isDOMError),
/* harmony export */   isDOMException: () => (/* binding */ isDOMException),
/* harmony export */   isElement: () => (/* binding */ isElement),
/* harmony export */   isError: () => (/* binding */ isError),
/* harmony export */   isErrorEvent: () => (/* binding */ isErrorEvent),
/* harmony export */   isEvent: () => (/* binding */ isEvent),
/* harmony export */   isInstanceOf: () => (/* binding */ isInstanceOf),
/* harmony export */   isNaN: () => (/* binding */ isNaN),
/* harmony export */   isParameterizedString: () => (/* binding */ isParameterizedString),
/* harmony export */   isPlainObject: () => (/* binding */ isPlainObject),
/* harmony export */   isPrimitive: () => (/* binding */ isPrimitive),
/* harmony export */   isRegExp: () => (/* binding */ isRegExp),
/* harmony export */   isString: () => (/* binding */ isString),
/* harmony export */   isSyntheticEvent: () => (/* binding */ isSyntheticEvent),
/* harmony export */   isThenable: () => (/* binding */ isThenable),
/* harmony export */   isVueViewModel: () => (/* binding */ isVueViewModel)
/* harmony export */ });
// eslint-disable-next-line @typescript-eslint/unbound-method
const objectToString = Object.prototype.toString;

/**
 * Checks whether given value's type is one of a few Error or Error-like
 * {@link isError}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isError(wat) {
  switch (objectToString.call(wat)) {
    case '[object Error]':
    case '[object Exception]':
    case '[object DOMException]':
      return true;
    default:
      return isInstanceOf(wat, Error);
  }
}
/**
 * Checks whether given value is an instance of the given built-in class.
 *
 * @param wat The value to be checked
 * @param className
 * @returns A boolean representing the result.
 */
function isBuiltin(wat, className) {
  return objectToString.call(wat) === `[object ${className}]`;
}

/**
 * Checks whether given value's type is ErrorEvent
 * {@link isErrorEvent}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isErrorEvent(wat) {
  return isBuiltin(wat, 'ErrorEvent');
}

/**
 * Checks whether given value's type is DOMError
 * {@link isDOMError}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isDOMError(wat) {
  return isBuiltin(wat, 'DOMError');
}

/**
 * Checks whether given value's type is DOMException
 * {@link isDOMException}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isDOMException(wat) {
  return isBuiltin(wat, 'DOMException');
}

/**
 * Checks whether given value's type is a string
 * {@link isString}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isString(wat) {
  return isBuiltin(wat, 'String');
}

/**
 * Checks whether given string is parameterized
 * {@link isParameterizedString}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isParameterizedString(wat) {
  return typeof wat === 'object' && wat !== null && '__sentry_template_string__' in wat && '__sentry_template_values__' in wat;
}

/**
 * Checks whether given value is a primitive (undefined, null, number, boolean, string, bigint, symbol)
 * {@link isPrimitive}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isPrimitive(wat) {
  return wat === null || isParameterizedString(wat) || typeof wat !== 'object' && typeof wat !== 'function';
}

/**
 * Checks whether given value's type is an object literal, or a class instance.
 * {@link isPlainObject}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isPlainObject(wat) {
  return isBuiltin(wat, 'Object');
}

/**
 * Checks whether given value's type is an Event instance
 * {@link isEvent}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isEvent(wat) {
  return typeof Event !== 'undefined' && isInstanceOf(wat, Event);
}

/**
 * Checks whether given value's type is an Element instance
 * {@link isElement}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isElement(wat) {
  return typeof Element !== 'undefined' && isInstanceOf(wat, Element);
}

/**
 * Checks whether given value's type is an regexp
 * {@link isRegExp}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isRegExp(wat) {
  return isBuiltin(wat, 'RegExp');
}

/**
 * Checks whether given value has a then function.
 * @param wat A value to be checked.
 */
function isThenable(wat) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return Boolean(wat && wat.then && typeof wat.then === 'function');
}

/**
 * Checks whether given value's type is a SyntheticEvent
 * {@link isSyntheticEvent}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isSyntheticEvent(wat) {
  return isPlainObject(wat) && 'nativeEvent' in wat && 'preventDefault' in wat && 'stopPropagation' in wat;
}

/**
 * Checks whether given value is NaN
 * {@link isNaN}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isNaN(wat) {
  return typeof wat === 'number' && wat !== wat;
}

/**
 * Checks whether given value's type is an instance of provided constructor.
 * {@link isInstanceOf}.
 *
 * @param wat A value to be checked.
 * @param base A constructor to be used in a check.
 * @returns A boolean representing the result.
 */
function isInstanceOf(wat, base) {
  try {
    return wat instanceof base;
  } catch (_e) {
    return false;
  }
}

/**
 * Checks whether given value's type is a Vue ViewModel.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isVueViewModel(wat) {
  // Not using Object.prototype.toString because in Vue 3 it would read the instance's Symbol(Symbol.toStringTag) property.
  return !!(typeof wat === 'object' && wat !== null && (wat.__isVue || wat._isVue));
}


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/logger.js":
/*!**************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/logger.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CONSOLE_LEVELS: () => (/* binding */ CONSOLE_LEVELS),
/* harmony export */   consoleSandbox: () => (/* binding */ consoleSandbox),
/* harmony export */   logger: () => (/* binding */ logger),
/* harmony export */   originalConsoleMethods: () => (/* binding */ originalConsoleMethods)
/* harmony export */ });
/* harmony import */ var _debug_build_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./debug-build.js */ "./node_modules/@sentry/utils/esm/debug-build.js");
/* harmony import */ var _worldwide_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./worldwide.js */ "./node_modules/@sentry/utils/esm/worldwide.js");



/** Prefix for logging strings */
const PREFIX = 'Sentry Logger ';
const CONSOLE_LEVELS = ['debug', 'info', 'warn', 'error', 'log', 'assert', 'trace'];

/** This may be mutated by the console instrumentation. */
const originalConsoleMethods = {};

/** JSDoc */

/**
 * Temporarily disable sentry console instrumentations.
 *
 * @param callback The function to run against the original `console` messages
 * @returns The results of the callback
 */
function consoleSandbox(callback) {
  if (!("console" in _worldwide_js__WEBPACK_IMPORTED_MODULE_0__.GLOBAL_OBJ)) {
    return callback();
  }
  const console = _worldwide_js__WEBPACK_IMPORTED_MODULE_0__.GLOBAL_OBJ.console;
  const wrappedFuncs = {};
  const wrappedLevels = Object.keys(originalConsoleMethods);

  // Restore all wrapped console methods
  wrappedLevels.forEach(level => {
    const originalConsoleMethod = originalConsoleMethods[level];
    wrappedFuncs[level] = console[level];
    console[level] = originalConsoleMethod;
  });
  try {
    return callback();
  } finally {
    // Revert restoration to wrapped state
    wrappedLevels.forEach(level => {
      console[level] = wrappedFuncs[level];
    });
  }
}
function makeLogger() {
  let enabled = false;
  const logger = {
    enable: () => {
      enabled = true;
    },
    disable: () => {
      enabled = false;
    },
    isEnabled: () => enabled
  };
  if (_debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD) {
    CONSOLE_LEVELS.forEach(name => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      logger[name] = function () {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        if (enabled) {
          consoleSandbox(() => {
            _worldwide_js__WEBPACK_IMPORTED_MODULE_0__.GLOBAL_OBJ.console[name](`${PREFIX}[${name}]:`, ...args);
          });
        }
      };
    });
  } else {
    CONSOLE_LEVELS.forEach(name => {
      logger[name] = () => undefined;
    });
  }
  return logger;
}
const logger = makeLogger();


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/memo.js":
/*!************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/memo.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   memoBuilder: () => (/* binding */ memoBuilder)
/* harmony export */ });
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Helper to decycle json objects
 */
function memoBuilder() {
  const hasWeakSet = typeof WeakSet === 'function';
  const inner = hasWeakSet ? new WeakSet() : [];
  function memoize(obj) {
    if (hasWeakSet) {
      if (inner.has(obj)) {
        return true;
      }
      inner.add(obj);
      return false;
    }
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < inner.length; i++) {
      const value = inner[i];
      if (value === obj) {
        return true;
      }
    }
    inner.push(obj);
    return false;
  }
  function unmemoize(obj) {
    if (hasWeakSet) {
      inner.delete(obj);
    } else {
      for (let i = 0; i < inner.length; i++) {
        if (inner[i] === obj) {
          inner.splice(i, 1);
          break;
        }
      }
    }
  }
  return [memoize, unmemoize];
}


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/misc.js":
/*!************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/misc.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addContextToFrame: () => (/* binding */ addContextToFrame),
/* harmony export */   addExceptionMechanism: () => (/* binding */ addExceptionMechanism),
/* harmony export */   addExceptionTypeValue: () => (/* binding */ addExceptionTypeValue),
/* harmony export */   arrayify: () => (/* binding */ arrayify),
/* harmony export */   checkOrSetAlreadyCaught: () => (/* binding */ checkOrSetAlreadyCaught),
/* harmony export */   getEventDescription: () => (/* binding */ getEventDescription),
/* harmony export */   parseSemver: () => (/* binding */ parseSemver),
/* harmony export */   uuid4: () => (/* binding */ uuid4)
/* harmony export */ });
/* harmony import */ var _object_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./object.js */ "./node_modules/@sentry/utils/esm/object.js");
/* harmony import */ var _string_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./string.js */ "./node_modules/@sentry/utils/esm/string.js");
/* harmony import */ var _worldwide_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./worldwide.js */ "./node_modules/@sentry/utils/esm/worldwide.js");




/**
 * UUID4 generator
 *
 * @returns string Generated UUID4.
 */
function uuid4() {
  const gbl = _worldwide_js__WEBPACK_IMPORTED_MODULE_0__.GLOBAL_OBJ;
  const crypto = gbl.crypto || gbl.msCrypto;
  let getRandomByte = () => Math.random() * 16;
  try {
    if (crypto && crypto.randomUUID) {
      return crypto.randomUUID().replace(/-/g, '');
    }
    if (crypto && crypto.getRandomValues) {
      getRandomByte = () => {
        // crypto.getRandomValues might return undefined instead of the typed array
        // in old Chromium versions (e.g. 23.0.1235.0 (151422))
        // However, `typedArray` is still filled in-place.
        // @see https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues#typedarray
        const typedArray = new Uint8Array(1);
        crypto.getRandomValues(typedArray);
        return typedArray[0];
      };
    }
  } catch (_) {
    // some runtimes can crash invoking crypto
    // https://github.com/getsentry/sentry-javascript/issues/8935
  }

  // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/2117523#2117523
  // Concatenating the following numbers as strings results in '10000000100040008000100000000000'
  return ([1e7] + 1e3 + 4e3 + 8e3 + 1e11).replace(/[018]/g, c =>
  // eslint-disable-next-line no-bitwise
  (c ^ (getRandomByte() & 15) >> c / 4).toString(16));
}
function getFirstException(event) {
  return event.exception && event.exception.values ? event.exception.values[0] : undefined;
}

/**
 * Extracts either message or type+value from an event that can be used for user-facing logs
 * @returns event's description
 */
function getEventDescription(event) {
  const {
    message,
    event_id: eventId
  } = event;
  if (message) {
    return message;
  }
  const firstException = getFirstException(event);
  if (firstException) {
    if (firstException.type && firstException.value) {
      return `${firstException.type}: ${firstException.value}`;
    }
    return firstException.type || firstException.value || eventId || '<unknown>';
  }
  return eventId || '<unknown>';
}

/**
 * Adds exception values, type and value to an synthetic Exception.
 * @param event The event to modify.
 * @param value Value of the exception.
 * @param type Type of the exception.
 * @hidden
 */
function addExceptionTypeValue(event, value, type) {
  const exception = event.exception = event.exception || {};
  const values = exception.values = exception.values || [];
  const firstException = values[0] = values[0] || {};
  if (!firstException.value) {
    firstException.value = value || '';
  }
  if (!firstException.type) {
    firstException.type = type || 'Error';
  }
}

/**
 * Adds exception mechanism data to a given event. Uses defaults if the second parameter is not passed.
 *
 * @param event The event to modify.
 * @param newMechanism Mechanism data to add to the event.
 * @hidden
 */
function addExceptionMechanism(event, newMechanism) {
  const firstException = getFirstException(event);
  if (!firstException) {
    return;
  }
  const defaultMechanism = {
    type: 'generic',
    handled: true
  };
  const currentMechanism = firstException.mechanism;
  firstException.mechanism = {
    ...defaultMechanism,
    ...currentMechanism,
    ...newMechanism
  };
  if (newMechanism && 'data' in newMechanism) {
    const mergedData = {
      ...(currentMechanism && currentMechanism.data),
      ...newMechanism.data
    };
    firstException.mechanism.data = mergedData;
  }
}

// https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
const SEMVER_REGEXP = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

/**
 * Represents Semantic Versioning object
 */

/**
 * Parses input into a SemVer interface
 * @param input string representation of a semver version
 */
function parseSemver(input) {
  const match = input.match(SEMVER_REGEXP) || [];
  const major = parseInt(match[1], 10);
  const minor = parseInt(match[2], 10);
  const patch = parseInt(match[3], 10);
  return {
    buildmetadata: match[5],
    major: isNaN(major) ? undefined : major,
    minor: isNaN(minor) ? undefined : minor,
    patch: isNaN(patch) ? undefined : patch,
    prerelease: match[4]
  };
}

/**
 * This function adds context (pre/post/line) lines to the provided frame
 *
 * @param lines string[] containing all lines
 * @param frame StackFrame that will be mutated
 * @param linesOfContext number of context lines we want to add pre/post
 */
function addContextToFrame(lines, frame, linesOfContext) {
  if (linesOfContext === void 0) {
    linesOfContext = 5;
  }
  // When there is no line number in the frame, attaching context is nonsensical and will even break grouping
  if (frame.lineno === undefined) {
    return;
  }
  const maxLines = lines.length;
  const sourceLine = Math.max(Math.min(maxLines - 1, frame.lineno - 1), 0);
  frame.pre_context = lines.slice(Math.max(0, sourceLine - linesOfContext), sourceLine).map(line => (0,_string_js__WEBPACK_IMPORTED_MODULE_1__.snipLine)(line, 0));
  frame.context_line = (0,_string_js__WEBPACK_IMPORTED_MODULE_1__.snipLine)(lines[Math.min(maxLines - 1, sourceLine)], frame.colno || 0);
  frame.post_context = lines.slice(Math.min(sourceLine + 1, maxLines), sourceLine + 1 + linesOfContext).map(line => (0,_string_js__WEBPACK_IMPORTED_MODULE_1__.snipLine)(line, 0));
}

/**
 * Checks whether or not we've already captured the given exception (note: not an identical exception - the very object
 * in question), and marks it captured if not.
 *
 * This is useful because it's possible for an error to get captured by more than one mechanism. After we intercept and
 * record an error, we rethrow it (assuming we've intercepted it before it's reached the top-level global handlers), so
 * that we don't interfere with whatever effects the error might have had were the SDK not there. At that point, because
 * the error has been rethrown, it's possible for it to bubble up to some other code we've instrumented. If it's not
 * caught after that, it will bubble all the way up to the global handlers (which of course we also instrument). This
 * function helps us ensure that even if we encounter the same error more than once, we only record it the first time we
 * see it.
 *
 * Note: It will ignore primitives (always return `false` and not mark them as seen), as properties can't be set on
 * them. {@link: Object.objectify} can be used on exceptions to convert any that are primitives into their equivalent
 * object wrapper forms so that this check will always work. However, because we need to flag the exact object which
 * will get rethrown, and because that rethrowing happens outside of the event processing pipeline, the objectification
 * must be done before the exception captured.
 *
 * @param A thrown exception to check or flag as having been seen
 * @returns `true` if the exception has already been captured, `false` if not (with the side effect of marking it seen)
 */
function checkOrSetAlreadyCaught(exception) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (exception && exception.__sentry_captured__) {
    return true;
  }
  try {
    // set it this way rather than by assignment so that it's not ennumerable and therefore isn't recorded by the
    // `ExtraErrorData` integration
    (0,_object_js__WEBPACK_IMPORTED_MODULE_2__.addNonEnumerableProperty)(exception, '__sentry_captured__', true);
  } catch (err) {
    // `exception` is a primitive, so we can't mark it seen
  }
  return false;
}

/**
 * Checks whether the given input is already an array, and if it isn't, wraps it in one.
 *
 * @param maybeArray Input to turn into an array, if necessary
 * @returns The input, if already an array, or an array with the input as the only element, if not
 */
function arrayify(maybeArray) {
  return Array.isArray(maybeArray) ? maybeArray : [maybeArray];
}


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/node-stack-trace.js":
/*!************************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/node-stack-trace.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   filenameIsInApp: () => (/* binding */ filenameIsInApp),
/* harmony export */   node: () => (/* binding */ node)
/* harmony export */ });
/**
 * Does this filename look like it's part of the app code?
 */
function filenameIsInApp(filename, isNative) {
  if (isNative === void 0) {
    isNative = false;
  }
  const isInternal = isNative || filename &&
  // It's not internal if it's an absolute linux path
  !filename.startsWith('/') &&
  // It's not internal if it's an absolute windows path
  !filename.match(/^[A-Z]:/) &&
  // It's not internal if the path is starting with a dot
  !filename.startsWith('.') &&
  // It's not internal if the frame has a protocol. In node, this is usually the case if the file got pre-processed with a bundler like webpack
  !filename.match(/^[a-zA-Z]([a-zA-Z0-9.\-+])*:\/\//); // Schema from: https://stackoverflow.com/a/3641782

  // in_app is all that's not an internal Node function or a module within node_modules
  // note that isNative appears to return true even for node core libraries
  // see https://github.com/getsentry/raven-node/issues/176

  return !isInternal && filename !== undefined && !filename.includes('node_modules/');
}

/** Node Stack line parser */
// eslint-disable-next-line complexity
function node(getModule) {
  const FILENAME_MATCH = /^\s*[-]{4,}$/;
  const FULL_MATCH = /at (?:async )?(?:(.+?)\s+\()?(?:(.+):(\d+):(\d+)?|([^)]+))\)?/;

  // eslint-disable-next-line complexity
  return line => {
    const lineMatch = line.match(FULL_MATCH);
    if (lineMatch) {
      let object;
      let method;
      let functionName;
      let typeName;
      let methodName;
      if (lineMatch[1]) {
        functionName = lineMatch[1];
        let methodStart = functionName.lastIndexOf('.');
        if (functionName[methodStart - 1] === '.') {
          methodStart--;
        }
        if (methodStart > 0) {
          object = functionName.slice(0, methodStart);
          method = functionName.slice(methodStart + 1);
          const objectEnd = object.indexOf('.Module');
          if (objectEnd > 0) {
            functionName = functionName.slice(objectEnd + 1);
            object = object.slice(0, objectEnd);
          }
        }
        typeName = undefined;
      }
      if (method) {
        typeName = object;
        methodName = method;
      }
      if (method === '<anonymous>') {
        methodName = undefined;
        functionName = undefined;
      }
      if (functionName === undefined) {
        methodName = methodName || '<anonymous>';
        functionName = typeName ? `${typeName}.${methodName}` : methodName;
      }
      let filename = lineMatch[2] && lineMatch[2].startsWith('file://') ? lineMatch[2].slice(7) : lineMatch[2];
      const isNative = lineMatch[5] === 'native';

      // If it's a Windows path, trim the leading slash so that `/C:/foo` becomes `C:/foo`
      if (filename && filename.match(/\/[A-Z]:/)) {
        filename = filename.slice(1);
      }
      if (!filename && lineMatch[5] && !isNative) {
        filename = lineMatch[5];
      }
      return {
        filename,
        module: getModule ? getModule(filename) : undefined,
        function: functionName,
        lineno: parseInt(lineMatch[3], 10) || undefined,
        colno: parseInt(lineMatch[4], 10) || undefined,
        in_app: filenameIsInApp(filename, isNative)
      };
    }
    if (line.match(FILENAME_MATCH)) {
      return {
        filename: line
      };
    }
    return undefined;
  };
}


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/normalize.js":
/*!*****************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/normalize.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   normalize: () => (/* binding */ normalize),
/* harmony export */   normalizeToSize: () => (/* binding */ normalizeToSize),
/* harmony export */   normalizeUrlToBase: () => (/* binding */ normalizeUrlToBase),
/* harmony export */   walk: () => (/* binding */ visit)
/* harmony export */ });
/* harmony import */ var _is_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./is.js */ "./node_modules/@sentry/utils/esm/is.js");
/* harmony import */ var _memo_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./memo.js */ "./node_modules/@sentry/utils/esm/memo.js");
/* harmony import */ var _object_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./object.js */ "./node_modules/@sentry/utils/esm/object.js");
/* harmony import */ var _stacktrace_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./stacktrace.js */ "./node_modules/@sentry/utils/esm/stacktrace.js");





/**
 * Recursively normalizes the given object.
 *
 * - Creates a copy to prevent original input mutation
 * - Skips non-enumerable properties
 * - When stringifying, calls `toJSON` if implemented
 * - Removes circular references
 * - Translates non-serializable values (`undefined`/`NaN`/functions) to serializable format
 * - Translates known global objects/classes to a string representations
 * - Takes care of `Error` object serialization
 * - Optionally limits depth of final output
 * - Optionally limits number of properties/elements included in any single object/array
 *
 * @param input The object to be normalized.
 * @param depth The max depth to which to normalize the object. (Anything deeper stringified whole.)
 * @param maxProperties The max number of elements or properties to be included in any single array or
 * object in the normallized output.
 * @returns A normalized version of the object, or `"**non-serializable**"` if any errors are thrown during normalization.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalize(input, depth, maxProperties) {
  if (depth === void 0) {
    depth = 100;
  }
  if (maxProperties === void 0) {
    maxProperties = +Infinity;
  }
  try {
    // since we're at the outermost level, we don't provide a key
    return visit('', input, depth, maxProperties);
  } catch (err) {
    return {
      ERROR: `**non-serializable** (${err})`
    };
  }
}

/** JSDoc */
function normalizeToSize(
// eslint-disable-next-line @typescript-eslint/no-explicit-any
object,
// Default Node.js REPL depth
depth,
// 100kB, as 200kB is max payload size, so half sounds reasonable
maxSize) {
  if (depth === void 0) {
    depth = 3;
  }
  if (maxSize === void 0) {
    maxSize = 100 * 1024;
  }
  const normalized = normalize(object, depth);
  if (jsonSize(normalized) > maxSize) {
    return normalizeToSize(object, depth - 1, maxSize);
  }
  return normalized;
}

/**
 * Visits a node to perform normalization on it
 *
 * @param key The key corresponding to the given node
 * @param value The node to be visited
 * @param depth Optional number indicating the maximum recursion depth
 * @param maxProperties Optional maximum number of properties/elements included in any single object/array
 * @param memo Optional Memo class handling decycling
 */
function visit(key, value, depth, maxProperties, memo) {
  if (depth === void 0) {
    depth = +Infinity;
  }
  if (maxProperties === void 0) {
    maxProperties = +Infinity;
  }
  if (memo === void 0) {
    memo = (0,_memo_js__WEBPACK_IMPORTED_MODULE_0__.memoBuilder)();
  }
  const [memoize, unmemoize] = memo;

  // Get the simple cases out of the way first
  if (value == null ||
  // this matches null and undefined -> eqeq not eqeqeq
  ['number', 'boolean', 'string'].includes(typeof value) && !(0,_is_js__WEBPACK_IMPORTED_MODULE_1__.isNaN)(value)) {
    return value;
  }
  const stringified = stringifyValue(key, value);

  // Anything we could potentially dig into more (objects or arrays) will have come back as `"[object XXXX]"`.
  // Everything else will have already been serialized, so if we don't see that pattern, we're done.
  if (!stringified.startsWith('[object ')) {
    return stringified;
  }

  // From here on, we can assert that `value` is either an object or an array.

  // Do not normalize objects that we know have already been normalized. As a general rule, the
  // "__sentry_skip_normalization__" property should only be used sparingly and only should only be set on objects that
  // have already been normalized.
  if (value['__sentry_skip_normalization__']) {
    return value;
  }

  // We can set `__sentry_override_normalization_depth__` on an object to ensure that from there
  // We keep a certain amount of depth.
  // This should be used sparingly, e.g. we use it for the redux integration to ensure we get a certain amount of state.
  const remainingDepth = typeof value['__sentry_override_normalization_depth__'] === 'number' ? value['__sentry_override_normalization_depth__'] : depth;

  // We're also done if we've reached the max depth
  if (remainingDepth === 0) {
    // At this point we know `serialized` is a string of the form `"[object XXXX]"`. Clean it up so it's just `"[XXXX]"`.
    return stringified.replace('object ', '');
  }

  // If we've already visited this branch, bail out, as it's circular reference. If not, note that we're seeing it now.
  if (memoize(value)) {
    return '[Circular ~]';
  }

  // If the value has a `toJSON` method, we call it to extract more information
  const valueWithToJSON = value;
  if (valueWithToJSON && typeof valueWithToJSON.toJSON === 'function') {
    try {
      const jsonValue = valueWithToJSON.toJSON();
      // We need to normalize the return value of `.toJSON()` in case it has circular references
      return visit('', jsonValue, remainingDepth - 1, maxProperties, memo);
    } catch (err) {
      // pass (The built-in `toJSON` failed, but we can still try to do it ourselves)
    }
  }

  // At this point we know we either have an object or an array, we haven't seen it before, and we're going to recurse
  // because we haven't yet reached the max depth. Create an accumulator to hold the results of visiting each
  // property/entry, and keep track of the number of items we add to it.
  const normalized = Array.isArray(value) ? [] : {};
  let numAdded = 0;

  // Before we begin, convert`Error` and`Event` instances into plain objects, since some of each of their relevant
  // properties are non-enumerable and otherwise would get missed.
  const visitable = (0,_object_js__WEBPACK_IMPORTED_MODULE_2__.convertToPlainObject)(value);
  for (const visitKey in visitable) {
    // Avoid iterating over fields in the prototype if they've somehow been exposed to enumeration.
    if (!Object.prototype.hasOwnProperty.call(visitable, visitKey)) {
      continue;
    }
    if (numAdded >= maxProperties) {
      normalized[visitKey] = '[MaxProperties ~]';
      break;
    }

    // Recursively visit all the child nodes
    const visitValue = visitable[visitKey];
    normalized[visitKey] = visit(visitKey, visitValue, remainingDepth - 1, maxProperties, memo);
    numAdded++;
  }

  // Once we've visited all the branches, remove the parent from memo storage
  unmemoize(value);

  // Return accumulated values
  return normalized;
}

/* eslint-disable complexity */
/**
 * Stringify the given value. Handles various known special values and types.
 *
 * Not meant to be used on simple primitives which already have a string representation, as it will, for example, turn
 * the number 1231 into "[Object Number]", nor on `null`, as it will throw.
 *
 * @param value The value to stringify
 * @returns A stringified representation of the given value
 */
function stringifyValue(key,
// this type is a tiny bit of a cheat, since this function does handle NaN (which is technically a number), but for
// our internal use, it'll do
value) {
  try {
    if (key === 'domain' && value && typeof value === 'object' && value._events) {
      return '[Domain]';
    }
    if (key === 'domainEmitter') {
      return '[DomainEmitter]';
    }

    // It's safe to use `global`, `window`, and `document` here in this manner, as we are asserting using `typeof` first
    // which won't throw if they are not present.

    if (typeof __webpack_require__.g !== 'undefined' && value === __webpack_require__.g) {
      return '[Global]';
    }

    // eslint-disable-next-line no-restricted-globals
    if (typeof window !== 'undefined' && value === window) {
      return '[Window]';
    }

    // eslint-disable-next-line no-restricted-globals
    if (typeof document !== 'undefined' && value === document) {
      return '[Document]';
    }
    if ((0,_is_js__WEBPACK_IMPORTED_MODULE_1__.isVueViewModel)(value)) {
      return '[VueViewModel]';
    }

    // React's SyntheticEvent thingy
    if ((0,_is_js__WEBPACK_IMPORTED_MODULE_1__.isSyntheticEvent)(value)) {
      return '[SyntheticEvent]';
    }
    if (typeof value === 'number' && value !== value) {
      return '[NaN]';
    }
    if (typeof value === 'function') {
      return `[Function: ${(0,_stacktrace_js__WEBPACK_IMPORTED_MODULE_3__.getFunctionName)(value)}]`;
    }
    if (typeof value === 'symbol') {
      return `[${String(value)}]`;
    }

    // stringified BigInts are indistinguishable from regular numbers, so we need to label them to avoid confusion
    if (typeof value === 'bigint') {
      return `[BigInt: ${String(value)}]`;
    }

    // Now that we've knocked out all the special cases and the primitives, all we have left are objects. Simply casting
    // them to strings means that instances of classes which haven't defined their `toStringTag` will just come out as
    // `"[object Object]"`. If we instead look at the constructor's name (which is the same as the name of the class),
    // we can make sure that only plain objects come out that way.
    const objName = getConstructorName(value);

    // Handle HTML Elements
    if (/^HTML(\w*)Element$/.test(objName)) {
      return `[HTMLElement: ${objName}]`;
    }
    return `[object ${objName}]`;
  } catch (err) {
    return `**non-serializable** (${err})`;
  }
}
/* eslint-enable complexity */

function getConstructorName(value) {
  const prototype = Object.getPrototypeOf(value);
  return prototype ? prototype.constructor.name : 'null prototype';
}

/** Calculates bytes size of input string */
function utf8Length(value) {
  // eslint-disable-next-line no-bitwise
  return ~-encodeURI(value).split(/%..|./).length;
}

/** Calculates bytes size of input object */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function jsonSize(value) {
  return utf8Length(JSON.stringify(value));
}

/**
 * Normalizes URLs in exceptions and stacktraces to a base path so Sentry can fingerprint
 * across platforms and working directory.
 *
 * @param url The URL to be normalized.
 * @param basePath The application base path.
 * @returns The normalized URL.
 */
function normalizeUrlToBase(url, basePath) {
  const escapedBase = basePath
  // Backslash to forward
  .replace(/\\/g, '/')
  // Escape RegExp special characters
  .replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
  let newUrl = url;
  try {
    newUrl = decodeURI(url);
  } catch (_Oo) {
    // Sometime this breaks
  }
  return newUrl.replace(/\\/g, '/').replace(/webpack:\/?/g, '') // Remove intermediate base path
  // eslint-disable-next-line @sentry-internal/sdk/no-regexp-constructor
  .replace(new RegExp(`(file://)?/*${escapedBase}/*`, 'ig'), 'app:///');
}


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/object.js":
/*!**************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/object.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addNonEnumerableProperty: () => (/* binding */ addNonEnumerableProperty),
/* harmony export */   convertToPlainObject: () => (/* binding */ convertToPlainObject),
/* harmony export */   dropUndefinedKeys: () => (/* binding */ dropUndefinedKeys),
/* harmony export */   extractExceptionKeysForMessage: () => (/* binding */ extractExceptionKeysForMessage),
/* harmony export */   fill: () => (/* binding */ fill),
/* harmony export */   getOriginalFunction: () => (/* binding */ getOriginalFunction),
/* harmony export */   markFunctionWrapped: () => (/* binding */ markFunctionWrapped),
/* harmony export */   objectify: () => (/* binding */ objectify),
/* harmony export */   urlEncode: () => (/* binding */ urlEncode)
/* harmony export */ });
/* harmony import */ var _browser_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./browser.js */ "./node_modules/@sentry/utils/esm/browser.js");
/* harmony import */ var _debug_build_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./debug-build.js */ "./node_modules/@sentry/utils/esm/debug-build.js");
/* harmony import */ var _is_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./is.js */ "./node_modules/@sentry/utils/esm/is.js");
/* harmony import */ var _logger_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./logger.js */ "./node_modules/@sentry/utils/esm/logger.js");
/* harmony import */ var _string_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./string.js */ "./node_modules/@sentry/utils/esm/string.js");






/**
 * Replace a method in an object with a wrapped version of itself.
 *
 * @param source An object that contains a method to be wrapped.
 * @param name The name of the method to be wrapped.
 * @param replacementFactory A higher-order function that takes the original version of the given method and returns a
 * wrapped version. Note: The function returned by `replacementFactory` needs to be a non-arrow function, in order to
 * preserve the correct value of `this`, and the original method must be called using `origMethod.call(this, <other
 * args>)` or `origMethod.apply(this, [<other args>])` (rather than being called directly), again to preserve `this`.
 * @returns void
 */
function fill(source, name, replacementFactory) {
  if (!(name in source)) {
    return;
  }
  const original = source[name];
  const wrapped = replacementFactory(original);

  // Make sure it's a function first, as we need to attach an empty prototype for `defineProperties` to work
  // otherwise it'll throw "TypeError: Object.defineProperties called on non-object"
  if (typeof wrapped === 'function') {
    markFunctionWrapped(wrapped, original);
  }
  source[name] = wrapped;
}

/**
 * Defines a non-enumerable property on the given object.
 *
 * @param obj The object on which to set the property
 * @param name The name of the property to be set
 * @param value The value to which to set the property
 */
function addNonEnumerableProperty(obj, name, value) {
  try {
    Object.defineProperty(obj, name, {
      // enumerable: false, // the default, so we can save on bundle size by not explicitly setting it
      value: value,
      writable: true,
      configurable: true
    });
  } catch (o_O) {
    _debug_build_js__WEBPACK_IMPORTED_MODULE_0__.DEBUG_BUILD && _logger_js__WEBPACK_IMPORTED_MODULE_1__.logger.log(`Failed to add non-enumerable property "${name}" to object`, obj);
  }
}

/**
 * Remembers the original function on the wrapped function and
 * patches up the prototype.
 *
 * @param wrapped the wrapper function
 * @param original the original function that gets wrapped
 */
function markFunctionWrapped(wrapped, original) {
  try {
    const proto = original.prototype || {};
    wrapped.prototype = original.prototype = proto;
    addNonEnumerableProperty(wrapped, '__sentry_original__', original);
  } catch (o_O) {} // eslint-disable-line no-empty
}

/**
 * This extracts the original function if available.  See
 * `markFunctionWrapped` for more information.
 *
 * @param func the function to unwrap
 * @returns the unwrapped version of the function if available.
 */
function getOriginalFunction(func) {
  return func.__sentry_original__;
}

/**
 * Encodes given object into url-friendly format
 *
 * @param object An object that contains serializable values
 * @returns string Encoded
 */
function urlEncode(object) {
  return Object.keys(object).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(object[key])}`).join('&');
}

/**
 * Transforms any `Error` or `Event` into a plain object with all of their enumerable properties, and some of their
 * non-enumerable properties attached.
 *
 * @param value Initial source that we have to transform in order for it to be usable by the serializer
 * @returns An Event or Error turned into an object - or the value argurment itself, when value is neither an Event nor
 *  an Error.
 */
function convertToPlainObject(value) {
  if ((0,_is_js__WEBPACK_IMPORTED_MODULE_2__.isError)(value)) {
    return {
      message: value.message,
      name: value.name,
      stack: value.stack,
      ...getOwnProperties(value)
    };
  } else if ((0,_is_js__WEBPACK_IMPORTED_MODULE_2__.isEvent)(value)) {
    const newObj = {
      type: value.type,
      target: serializeEventTarget(value.target),
      currentTarget: serializeEventTarget(value.currentTarget),
      ...getOwnProperties(value)
    };
    if (typeof CustomEvent !== 'undefined' && (0,_is_js__WEBPACK_IMPORTED_MODULE_2__.isInstanceOf)(value, CustomEvent)) {
      newObj.detail = value.detail;
    }
    return newObj;
  } else {
    return value;
  }
}

/** Creates a string representation of the target of an `Event` object */
function serializeEventTarget(target) {
  try {
    return (0,_is_js__WEBPACK_IMPORTED_MODULE_2__.isElement)(target) ? (0,_browser_js__WEBPACK_IMPORTED_MODULE_3__.htmlTreeAsString)(target) : Object.prototype.toString.call(target);
  } catch (_oO) {
    return '<unknown>';
  }
}

/** Filters out all but an object's own properties */
function getOwnProperties(obj) {
  if (typeof obj === 'object' && obj !== null) {
    const extractedProps = {};
    for (const property in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, property)) {
        extractedProps[property] = obj[property];
      }
    }
    return extractedProps;
  } else {
    return {};
  }
}

/**
 * Given any captured exception, extract its keys and create a sorted
 * and truncated list that will be used inside the event message.
 * eg. `Non-error exception captured with keys: foo, bar, baz`
 */
function extractExceptionKeysForMessage(exception, maxLength) {
  if (maxLength === void 0) {
    maxLength = 40;
  }
  const keys = Object.keys(convertToPlainObject(exception));
  keys.sort();
  if (!keys.length) {
    return '[object has no keys]';
  }
  if (keys[0].length >= maxLength) {
    return (0,_string_js__WEBPACK_IMPORTED_MODULE_4__.truncate)(keys[0], maxLength);
  }
  for (let includedKeys = keys.length; includedKeys > 0; includedKeys--) {
    const serialized = keys.slice(0, includedKeys).join(', ');
    if (serialized.length > maxLength) {
      continue;
    }
    if (includedKeys === keys.length) {
      return serialized;
    }
    return (0,_string_js__WEBPACK_IMPORTED_MODULE_4__.truncate)(serialized, maxLength);
  }
  return '';
}

/**
 * Given any object, return a new object having removed all fields whose value was `undefined`.
 * Works recursively on objects and arrays.
 *
 * Attention: This function keeps circular references in the returned object.
 */
function dropUndefinedKeys(inputValue) {
  // This map keeps track of what already visited nodes map to.
  // Our Set - based memoBuilder doesn't work here because we want to the output object to have the same circular
  // references as the input object.
  const memoizationMap = new Map();

  // This function just proxies `_dropUndefinedKeys` to keep the `memoBuilder` out of this function's API
  return _dropUndefinedKeys(inputValue, memoizationMap);
}
function _dropUndefinedKeys(inputValue, memoizationMap) {
  if (isPojo(inputValue)) {
    // If this node has already been visited due to a circular reference, return the object it was mapped to in the new object
    const memoVal = memoizationMap.get(inputValue);
    if (memoVal !== undefined) {
      return memoVal;
    }
    const returnValue = {};
    // Store the mapping of this value in case we visit it again, in case of circular data
    memoizationMap.set(inputValue, returnValue);
    for (const key of Object.keys(inputValue)) {
      if (typeof inputValue[key] !== 'undefined') {
        returnValue[key] = _dropUndefinedKeys(inputValue[key], memoizationMap);
      }
    }
    return returnValue;
  }
  if (Array.isArray(inputValue)) {
    // If this node has already been visited due to a circular reference, return the array it was mapped to in the new object
    const memoVal = memoizationMap.get(inputValue);
    if (memoVal !== undefined) {
      return memoVal;
    }
    const returnValue = [];
    // Store the mapping of this value in case we visit it again, in case of circular data
    memoizationMap.set(inputValue, returnValue);
    inputValue.forEach(item => {
      returnValue.push(_dropUndefinedKeys(item, memoizationMap));
    });
    return returnValue;
  }
  return inputValue;
}
function isPojo(input) {
  if (!(0,_is_js__WEBPACK_IMPORTED_MODULE_2__.isPlainObject)(input)) {
    return false;
  }
  try {
    const name = Object.getPrototypeOf(input).constructor.name;
    return !name || name === 'Object';
  } catch (e) {
    return true;
  }
}

/**
 * Ensure that something is an object.
 *
 * Turns `undefined` and `null` into `String`s and all other primitives into instances of their respective wrapper
 * classes (String, Boolean, Number, etc.). Acts as the identity function on non-primitives.
 *
 * @param wat The subject of the objectification
 * @returns A version of `wat` which can safely be used with `Object` class methods
 */
function objectify(wat) {
  let objectified;
  switch (true) {
    case wat === undefined || wat === null:
      objectified = new String(wat);
      break;

    // Though symbols and bigints do have wrapper classes (`Symbol` and `BigInt`, respectively), for whatever reason
    // those classes don't have constructors which can be used with the `new` keyword. We therefore need to cast each as
    // an object in order to wrap it.
    case typeof wat === 'symbol' || typeof wat === 'bigint':
      objectified = Object(wat);
      break;

    // this will catch the remaining primitives: `String`, `Number`, and `Boolean`
    case (0,_is_js__WEBPACK_IMPORTED_MODULE_2__.isPrimitive)(wat):
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      objectified = new wat.constructor(wat);
      break;

    // by process of elimination, at this point we know that `wat` must already be an object
    default:
      objectified = wat;
      break;
  }
  return objectified;
}


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/severity.js":
/*!****************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/severity.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   severityFromString: () => (/* binding */ severityFromString),
/* harmony export */   severityLevelFromString: () => (/* binding */ severityLevelFromString),
/* harmony export */   validSeverityLevels: () => (/* binding */ validSeverityLevels)
/* harmony export */ });
// Note: Ideally the `SeverityLevel` type would be derived from `validSeverityLevels`, but that would mean either
//
// a) moving `validSeverityLevels` to `@sentry/types`,
// b) moving the`SeverityLevel` type here, or
// c) importing `validSeverityLevels` from here into `@sentry/types`.
//
// Option A would make `@sentry/types` a runtime dependency of `@sentry/utils` (not good), and options B and C would
// create a circular dependency between `@sentry/types` and `@sentry/utils` (also not good). So a TODO accompanying the
// type, reminding anyone who changes it to change this list also, will have to do.

const validSeverityLevels = ['fatal', 'error', 'warning', 'log', 'info', 'debug'];

/**
 * Converts a string-based level into a member of the deprecated {@link Severity} enum.
 *
 * @deprecated `severityFromString` is deprecated. Please use `severityLevelFromString` instead.
 *
 * @param level String representation of Severity
 * @returns Severity
 */
function severityFromString(level) {
  return severityLevelFromString(level);
}

/**
 * Converts a string-based level into a `SeverityLevel`, normalizing it along the way.
 *
 * @param level String representation of desired `SeverityLevel`.
 * @returns The `SeverityLevel` corresponding to the given string, or 'log' if the string isn't a valid level.
 */
function severityLevelFromString(level) {
  return level === 'warn' ? 'warning' : validSeverityLevels.includes(level) ? level : 'log';
}


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/stacktrace.js":
/*!******************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/stacktrace.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createStackParser: () => (/* binding */ createStackParser),
/* harmony export */   filenameIsInApp: () => (/* reexport safe */ _node_stack_trace_js__WEBPACK_IMPORTED_MODULE_0__.filenameIsInApp),
/* harmony export */   getFunctionName: () => (/* binding */ getFunctionName),
/* harmony export */   nodeStackLineParser: () => (/* binding */ nodeStackLineParser),
/* harmony export */   stackParserFromStackParserOptions: () => (/* binding */ stackParserFromStackParserOptions),
/* harmony export */   stripSentryFramesAndReverse: () => (/* binding */ stripSentryFramesAndReverse)
/* harmony export */ });
/* harmony import */ var _node_stack_trace_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./node-stack-trace.js */ "./node_modules/@sentry/utils/esm/node-stack-trace.js");


const STACKTRACE_FRAME_LIMIT = 50;
// Used to sanitize webpack (error: *) wrapped stack errors
const WEBPACK_ERROR_REGEXP = /\(error: (.*)\)/;
const STRIP_FRAME_REGEXP = /captureMessage|captureException/;

/**
 * Creates a stack parser with the supplied line parsers
 *
 * StackFrames are returned in the correct order for Sentry Exception
 * frames and with Sentry SDK internal frames removed from the top and bottom
 *
 */
function createStackParser() {
  for (var _len = arguments.length, parsers = new Array(_len), _key = 0; _key < _len; _key++) {
    parsers[_key] = arguments[_key];
  }
  const sortedParsers = parsers.sort((a, b) => a[0] - b[0]).map(p => p[1]);
  return function (stack, skipFirst) {
    if (skipFirst === void 0) {
      skipFirst = 0;
    }
    const frames = [];
    const lines = stack.split('\n');
    for (let i = skipFirst; i < lines.length; i++) {
      const line = lines[i];
      // Ignore lines over 1kb as they are unlikely to be stack frames.
      // Many of the regular expressions use backtracking which results in run time that increases exponentially with
      // input size. Huge strings can result in hangs/Denial of Service:
      // https://github.com/getsentry/sentry-javascript/issues/2286
      if (line.length > 1024) {
        continue;
      }

      // https://github.com/getsentry/sentry-javascript/issues/5459
      // Remove webpack (error: *) wrappers
      const cleanedLine = WEBPACK_ERROR_REGEXP.test(line) ? line.replace(WEBPACK_ERROR_REGEXP, '$1') : line;

      // https://github.com/getsentry/sentry-javascript/issues/7813
      // Skip Error: lines
      if (cleanedLine.match(/\S*Error: /)) {
        continue;
      }
      for (const parser of sortedParsers) {
        const frame = parser(cleanedLine);
        if (frame) {
          frames.push(frame);
          break;
        }
      }
      if (frames.length >= STACKTRACE_FRAME_LIMIT) {
        break;
      }
    }
    return stripSentryFramesAndReverse(frames);
  };
}

/**
 * Gets a stack parser implementation from Options.stackParser
 * @see Options
 *
 * If options contains an array of line parsers, it is converted into a parser
 */
function stackParserFromStackParserOptions(stackParser) {
  if (Array.isArray(stackParser)) {
    return createStackParser(...stackParser);
  }
  return stackParser;
}

/**
 * Removes Sentry frames from the top and bottom of the stack if present and enforces a limit of max number of frames.
 * Assumes stack input is ordered from top to bottom and returns the reverse representation so call site of the
 * function that caused the crash is the last frame in the array.
 * @hidden
 */
function stripSentryFramesAndReverse(stack) {
  if (!stack.length) {
    return [];
  }
  const localStack = Array.from(stack);

  // If stack starts with one of our API calls, remove it (starts, meaning it's the top of the stack - aka last call)
  if (/sentryWrapped/.test(localStack[localStack.length - 1].function || '')) {
    localStack.pop();
  }

  // Reversing in the middle of the procedure allows us to just pop the values off the stack
  localStack.reverse();

  // If stack ends with one of our internal API calls, remove it (ends, meaning it's the bottom of the stack - aka top-most call)
  if (STRIP_FRAME_REGEXP.test(localStack[localStack.length - 1].function || '')) {
    localStack.pop();

    // When using synthetic events, we will have a 2 levels deep stack, as `new Error('Sentry syntheticException')`
    // is produced within the hub itself, making it:
    //
    //   Sentry.captureException()
    //   getCurrentHub().captureException()
    //
    // instead of just the top `Sentry` call itself.
    // This forces us to possibly strip an additional frame in the exact same was as above.
    if (STRIP_FRAME_REGEXP.test(localStack[localStack.length - 1].function || '')) {
      localStack.pop();
    }
  }
  return localStack.slice(0, STACKTRACE_FRAME_LIMIT).map(frame => ({
    ...frame,
    filename: frame.filename || localStack[localStack.length - 1].filename,
    function: frame.function || '?'
  }));
}
const defaultFunctionName = '<anonymous>';

/**
 * Safely extract function name from itself
 */
function getFunctionName(fn) {
  try {
    if (!fn || typeof fn !== 'function') {
      return defaultFunctionName;
    }
    return fn.name || defaultFunctionName;
  } catch (e) {
    // Just accessing custom props in some Selenium environments
    // can cause a "Permission denied" exception (see raven-js#495).
    return defaultFunctionName;
  }
}

/**
 * Node.js stack line parser
 *
 * This is in @sentry/utils so it can be used from the Electron SDK in the browser for when `nodeIntegration == true`.
 * This allows it to be used without referencing or importing any node specific code which causes bundlers to complain
 */
function nodeStackLineParser(getModule) {
  return [90, (0,_node_stack_trace_js__WEBPACK_IMPORTED_MODULE_0__.node)(getModule)];
}


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/string.js":
/*!**************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/string.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isMatchingPattern: () => (/* binding */ isMatchingPattern),
/* harmony export */   safeJoin: () => (/* binding */ safeJoin),
/* harmony export */   snipLine: () => (/* binding */ snipLine),
/* harmony export */   stringMatchesSomePattern: () => (/* binding */ stringMatchesSomePattern),
/* harmony export */   truncate: () => (/* binding */ truncate)
/* harmony export */ });
/* harmony import */ var _is_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./is.js */ "./node_modules/@sentry/utils/esm/is.js");


/**
 * Truncates given string to the maximum characters count
 *
 * @param str An object that contains serializable values
 * @param max Maximum number of characters in truncated string (0 = unlimited)
 * @returns string Encoded
 */
function truncate(str, max) {
  if (max === void 0) {
    max = 0;
  }
  if (typeof str !== 'string' || max === 0) {
    return str;
  }
  return str.length <= max ? str : `${str.slice(0, max)}...`;
}

/**
 * This is basically just `trim_line` from
 * https://github.com/getsentry/sentry/blob/master/src/sentry/lang/javascript/processor.py#L67
 *
 * @param str An object that contains serializable values
 * @param max Maximum number of characters in truncated string
 * @returns string Encoded
 */
function snipLine(line, colno) {
  let newLine = line;
  const lineLength = newLine.length;
  if (lineLength <= 150) {
    return newLine;
  }
  if (colno > lineLength) {
    // eslint-disable-next-line no-param-reassign
    colno = lineLength;
  }
  let start = Math.max(colno - 60, 0);
  if (start < 5) {
    start = 0;
  }
  let end = Math.min(start + 140, lineLength);
  if (end > lineLength - 5) {
    end = lineLength;
  }
  if (end === lineLength) {
    start = Math.max(end - 140, 0);
  }
  newLine = newLine.slice(start, end);
  if (start > 0) {
    newLine = `'{snip} ${newLine}`;
  }
  if (end < lineLength) {
    newLine += ' {snip}';
  }
  return newLine;
}

/**
 * Join values in array
 * @param input array of values to be joined together
 * @param delimiter string to be placed in-between values
 * @returns Joined values
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function safeJoin(input, delimiter) {
  if (!Array.isArray(input)) {
    return '';
  }
  const output = [];
  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < input.length; i++) {
    const value = input[i];
    try {
      // This is a hack to fix a Vue3-specific bug that causes an infinite loop of
      // console warnings. This happens when a Vue template is rendered with
      // an undeclared variable, which we try to stringify, ultimately causing
      // Vue to issue another warning which repeats indefinitely.
      // see: https://github.com/getsentry/sentry-javascript/pull/8981
      if ((0,_is_js__WEBPACK_IMPORTED_MODULE_0__.isVueViewModel)(value)) {
        output.push('[VueViewModel]');
      } else {
        output.push(String(value));
      }
    } catch (e) {
      output.push('[value cannot be serialized]');
    }
  }
  return output.join(delimiter);
}

/**
 * Checks if the given value matches a regex or string
 *
 * @param value The string to test
 * @param pattern Either a regex or a string against which `value` will be matched
 * @param requireExactStringMatch If true, `value` must match `pattern` exactly. If false, `value` will match
 * `pattern` if it contains `pattern`. Only applies to string-type patterns.
 */
function isMatchingPattern(value, pattern, requireExactStringMatch) {
  if (requireExactStringMatch === void 0) {
    requireExactStringMatch = false;
  }
  if (!(0,_is_js__WEBPACK_IMPORTED_MODULE_0__.isString)(value)) {
    return false;
  }
  if ((0,_is_js__WEBPACK_IMPORTED_MODULE_0__.isRegExp)(pattern)) {
    return pattern.test(value);
  }
  if ((0,_is_js__WEBPACK_IMPORTED_MODULE_0__.isString)(pattern)) {
    return requireExactStringMatch ? value === pattern : value.includes(pattern);
  }
  return false;
}

/**
 * Test the given string against an array of strings and regexes. By default, string matching is done on a
 * substring-inclusion basis rather than a strict equality basis
 *
 * @param testString The string to test
 * @param patterns The patterns against which to test the string
 * @param requireExactStringMatch If true, `testString` must match one of the given string patterns exactly in order to
 * count. If false, `testString` will match a string pattern if it contains that pattern.
 * @returns
 */
function stringMatchesSomePattern(testString, patterns, requireExactStringMatch) {
  if (patterns === void 0) {
    patterns = [];
  }
  if (requireExactStringMatch === void 0) {
    requireExactStringMatch = false;
  }
  return patterns.some(pattern => isMatchingPattern(testString, pattern, requireExactStringMatch));
}


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/syncpromise.js":
/*!*******************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/syncpromise.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SyncPromise: () => (/* binding */ SyncPromise),
/* harmony export */   rejectedSyncPromise: () => (/* binding */ rejectedSyncPromise),
/* harmony export */   resolvedSyncPromise: () => (/* binding */ resolvedSyncPromise)
/* harmony export */ });
/* harmony import */ var _is_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./is.js */ "./node_modules/@sentry/utils/esm/is.js");


/* eslint-disable @typescript-eslint/explicit-function-return-type */

/** SyncPromise internal states */
var States;
(function (States) {
  /** Pending */
  const PENDING = 0;
  States[States["PENDING"] = PENDING] = "PENDING";
  /** Resolved / OK */
  const RESOLVED = 1;
  States[States["RESOLVED"] = RESOLVED] = "RESOLVED";
  /** Rejected / Error */
  const REJECTED = 2;
  States[States["REJECTED"] = REJECTED] = "REJECTED";
})(States || (States = {}));

// Overloads so we can call resolvedSyncPromise without arguments and generic argument

/**
 * Creates a resolved sync promise.
 *
 * @param value the value to resolve the promise with
 * @returns the resolved sync promise
 */
function resolvedSyncPromise(value) {
  return new SyncPromise(resolve => {
    resolve(value);
  });
}

/**
 * Creates a rejected sync promise.
 *
 * @param value the value to reject the promise with
 * @returns the rejected sync promise
 */
function rejectedSyncPromise(reason) {
  return new SyncPromise((_, reject) => {
    reject(reason);
  });
}

/**
 * Thenable class that behaves like a Promise and follows it's interface
 * but is not async internally
 */
class SyncPromise {
  constructor(executor) {
    SyncPromise.prototype.__init.call(this);
    SyncPromise.prototype.__init2.call(this);
    SyncPromise.prototype.__init3.call(this);
    SyncPromise.prototype.__init4.call(this);
    this._state = States.PENDING;
    this._handlers = [];
    try {
      executor(this._resolve, this._reject);
    } catch (e) {
      this._reject(e);
    }
  }

  /** JSDoc */
  then(onfulfilled, onrejected) {
    return new SyncPromise((resolve, reject) => {
      this._handlers.push([false, result => {
        if (!onfulfilled) {
          // TODO: ¯\_(ツ)_/¯
          // TODO: FIXME
          resolve(result);
        } else {
          try {
            resolve(onfulfilled(result));
          } catch (e) {
            reject(e);
          }
        }
      }, reason => {
        if (!onrejected) {
          reject(reason);
        } else {
          try {
            resolve(onrejected(reason));
          } catch (e) {
            reject(e);
          }
        }
      }]);
      this._executeHandlers();
    });
  }

  /** JSDoc */
  catch(onrejected) {
    return this.then(val => val, onrejected);
  }

  /** JSDoc */
  finally(onfinally) {
    return new SyncPromise((resolve, reject) => {
      let val;
      let isRejected;
      return this.then(value => {
        isRejected = false;
        val = value;
        if (onfinally) {
          onfinally();
        }
      }, reason => {
        isRejected = true;
        val = reason;
        if (onfinally) {
          onfinally();
        }
      }).then(() => {
        if (isRejected) {
          reject(val);
          return;
        }
        resolve(val);
      });
    });
  }

  /** JSDoc */
  __init() {
    this._resolve = value => {
      this._setResult(States.RESOLVED, value);
    };
  }

  /** JSDoc */
  __init2() {
    this._reject = reason => {
      this._setResult(States.REJECTED, reason);
    };
  }

  /** JSDoc */
  __init3() {
    this._setResult = (state, value) => {
      if (this._state !== States.PENDING) {
        return;
      }
      if ((0,_is_js__WEBPACK_IMPORTED_MODULE_0__.isThenable)(value)) {
        void value.then(this._resolve, this._reject);
        return;
      }
      this._state = state;
      this._value = value;
      this._executeHandlers();
    };
  }

  /** JSDoc */
  __init4() {
    this._executeHandlers = () => {
      if (this._state === States.PENDING) {
        return;
      }
      const cachedHandlers = this._handlers.slice();
      this._handlers = [];
      cachedHandlers.forEach(handler => {
        if (handler[0]) {
          return;
        }
        if (this._state === States.RESOLVED) {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          handler[1](this._value);
        }
        if (this._state === States.REJECTED) {
          handler[2](this._value);
        }
        handler[0] = true;
      });
    };
  }
}


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/time.js":
/*!************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/time.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   _browserPerformanceTimeOriginMode: () => (/* binding */ _browserPerformanceTimeOriginMode),
/* harmony export */   browserPerformanceTimeOrigin: () => (/* binding */ browserPerformanceTimeOrigin),
/* harmony export */   dateTimestampInSeconds: () => (/* binding */ dateTimestampInSeconds),
/* harmony export */   timestampInSeconds: () => (/* binding */ timestampInSeconds),
/* harmony export */   timestampWithMs: () => (/* binding */ timestampWithMs)
/* harmony export */ });
/* harmony import */ var _worldwide_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./worldwide.js */ "./node_modules/@sentry/utils/esm/worldwide.js");

const ONE_SECOND_IN_MS = 1000;

/**
 * A partial definition of the [Performance Web API]{@link https://developer.mozilla.org/en-US/docs/Web/API/Performance}
 * for accessing a high-resolution monotonic clock.
 */

/**
 * Returns a timestamp in seconds since the UNIX epoch using the Date API.
 *
 * TODO(v8): Return type should be rounded.
 */
function dateTimestampInSeconds() {
  return Date.now() / ONE_SECOND_IN_MS;
}

/**
 * Returns a wrapper around the native Performance API browser implementation, or undefined for browsers that do not
 * support the API.
 *
 * Wrapping the native API works around differences in behavior from different browsers.
 */
function createUnixTimestampInSecondsFunc() {
  const {
    performance
  } = _worldwide_js__WEBPACK_IMPORTED_MODULE_0__.GLOBAL_OBJ;
  if (!performance || !performance.now) {
    return dateTimestampInSeconds;
  }

  // Some browser and environments don't have a timeOrigin, so we fallback to
  // using Date.now() to compute the starting time.
  const approxStartingTimeOrigin = Date.now() - performance.now();
  const timeOrigin = performance.timeOrigin == undefined ? approxStartingTimeOrigin : performance.timeOrigin;

  // performance.now() is a monotonic clock, which means it starts at 0 when the process begins. To get the current
  // wall clock time (actual UNIX timestamp), we need to add the starting time origin and the current time elapsed.
  //
  // TODO: This does not account for the case where the monotonic clock that powers performance.now() drifts from the
  // wall clock time, which causes the returned timestamp to be inaccurate. We should investigate how to detect and
  // correct for this.
  // See: https://github.com/getsentry/sentry-javascript/issues/2590
  // See: https://github.com/mdn/content/issues/4713
  // See: https://dev.to/noamr/when-a-millisecond-is-not-a-millisecond-3h6
  return () => {
    return (timeOrigin + performance.now()) / ONE_SECOND_IN_MS;
  };
}

/**
 * Returns a timestamp in seconds since the UNIX epoch using either the Performance or Date APIs, depending on the
 * availability of the Performance API.
 *
 * BUG: Note that because of how browsers implement the Performance API, the clock might stop when the computer is
 * asleep. This creates a skew between `dateTimestampInSeconds` and `timestampInSeconds`. The
 * skew can grow to arbitrary amounts like days, weeks or months.
 * See https://github.com/getsentry/sentry-javascript/issues/2590.
 */
const timestampInSeconds = createUnixTimestampInSecondsFunc();

/**
 * Re-exported with an old name for backwards-compatibility.
 * TODO (v8): Remove this
 *
 * @deprecated Use `timestampInSeconds` instead.
 */
const timestampWithMs = timestampInSeconds;

/**
 * Internal helper to store what is the source of browserPerformanceTimeOrigin below. For debugging only.
 */
let _browserPerformanceTimeOriginMode;

/**
 * The number of milliseconds since the UNIX epoch. This value is only usable in a browser, and only when the
 * performance API is available.
 */
const browserPerformanceTimeOrigin = (() => {
  // Unfortunately browsers may report an inaccurate time origin data, through either performance.timeOrigin or
  // performance.timing.navigationStart, which results in poor results in performance data. We only treat time origin
  // data as reliable if they are within a reasonable threshold of the current time.

  const {
    performance
  } = _worldwide_js__WEBPACK_IMPORTED_MODULE_0__.GLOBAL_OBJ;
  if (!performance || !performance.now) {
    _browserPerformanceTimeOriginMode = 'none';
    return undefined;
  }
  const threshold = 3600 * 1000;
  const performanceNow = performance.now();
  const dateNow = Date.now();

  // if timeOrigin isn't available set delta to threshold so it isn't used
  const timeOriginDelta = performance.timeOrigin ? Math.abs(performance.timeOrigin + performanceNow - dateNow) : threshold;
  const timeOriginIsReliable = timeOriginDelta < threshold;

  // While performance.timing.navigationStart is deprecated in favor of performance.timeOrigin, performance.timeOrigin
  // is not as widely supported. Namely, performance.timeOrigin is undefined in Safari as of writing.
  // Also as of writing, performance.timing is not available in Web Workers in mainstream browsers, so it is not always
  // a valid fallback. In the absence of an initial time provided by the browser, fallback to the current time from the
  // Date API.
  // eslint-disable-next-line deprecation/deprecation
  const navigationStart = performance.timing && performance.timing.navigationStart;
  const hasNavigationStart = typeof navigationStart === 'number';
  // if navigationStart isn't available set delta to threshold so it isn't used
  const navigationStartDelta = hasNavigationStart ? Math.abs(navigationStart + performanceNow - dateNow) : threshold;
  const navigationStartIsReliable = navigationStartDelta < threshold;
  if (timeOriginIsReliable || navigationStartIsReliable) {
    // Use the more reliable time origin
    if (timeOriginDelta <= navigationStartDelta) {
      _browserPerformanceTimeOriginMode = 'timeOrigin';
      return performance.timeOrigin;
    } else {
      _browserPerformanceTimeOriginMode = 'navigationStart';
      return navigationStart;
    }
  }

  // Either both timeOrigin and navigationStart are skewed or neither is available, fallback to Date.
  _browserPerformanceTimeOriginMode = 'dateNow';
  return dateNow;
})();


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/tracing.js":
/*!***************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/tracing.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TRACEPARENT_REGEXP: () => (/* binding */ TRACEPARENT_REGEXP),
/* harmony export */   extractTraceparentData: () => (/* binding */ extractTraceparentData),
/* harmony export */   generateSentryTraceHeader: () => (/* binding */ generateSentryTraceHeader),
/* harmony export */   propagationContextFromHeaders: () => (/* binding */ propagationContextFromHeaders),
/* harmony export */   tracingContextFromHeaders: () => (/* binding */ tracingContextFromHeaders)
/* harmony export */ });
/* harmony import */ var _baggage_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./baggage.js */ "./node_modules/@sentry/utils/esm/baggage.js");
/* harmony import */ var _misc_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./misc.js */ "./node_modules/@sentry/utils/esm/misc.js");



// eslint-disable-next-line @sentry-internal/sdk/no-regexp-constructor -- RegExp is used for readability here
const TRACEPARENT_REGEXP = new RegExp('^[ \\t]*' +
// whitespace
'([0-9a-f]{32})?' +
// trace_id
'-?([0-9a-f]{16})?' +
// span_id
'-?([01])?' +
// sampled
'[ \\t]*$') // whitespace
;

/**
 * Extract transaction context data from a `sentry-trace` header.
 *
 * @param traceparent Traceparent string
 *
 * @returns Object containing data from the header, or undefined if traceparent string is malformed
 */
function extractTraceparentData(traceparent) {
  if (!traceparent) {
    return undefined;
  }
  const matches = traceparent.match(TRACEPARENT_REGEXP);
  if (!matches) {
    return undefined;
  }
  let parentSampled;
  if (matches[3] === '1') {
    parentSampled = true;
  } else if (matches[3] === '0') {
    parentSampled = false;
  }
  return {
    traceId: matches[1],
    parentSampled,
    parentSpanId: matches[2]
  };
}

/**
 * Create tracing context from incoming headers.
 *
 * @deprecated Use `propagationContextFromHeaders` instead.
 */
// TODO(v8): Remove this function
function tracingContextFromHeaders(sentryTrace, baggage) {
  const traceparentData = extractTraceparentData(sentryTrace);
  const dynamicSamplingContext = (0,_baggage_js__WEBPACK_IMPORTED_MODULE_0__.baggageHeaderToDynamicSamplingContext)(baggage);
  const {
    traceId,
    parentSpanId,
    parentSampled
  } = traceparentData || {};
  if (!traceparentData) {
    return {
      traceparentData,
      dynamicSamplingContext: undefined,
      propagationContext: {
        traceId: traceId || (0,_misc_js__WEBPACK_IMPORTED_MODULE_1__.uuid4)(),
        spanId: (0,_misc_js__WEBPACK_IMPORTED_MODULE_1__.uuid4)().substring(16)
      }
    };
  } else {
    return {
      traceparentData,
      dynamicSamplingContext: dynamicSamplingContext || {},
      // If we have traceparent data but no DSC it means we are not head of trace and we must freeze it
      propagationContext: {
        traceId: traceId || (0,_misc_js__WEBPACK_IMPORTED_MODULE_1__.uuid4)(),
        parentSpanId: parentSpanId || (0,_misc_js__WEBPACK_IMPORTED_MODULE_1__.uuid4)().substring(16),
        spanId: (0,_misc_js__WEBPACK_IMPORTED_MODULE_1__.uuid4)().substring(16),
        sampled: parentSampled,
        dsc: dynamicSamplingContext || {} // If we have traceparent data but no DSC it means we are not head of trace and we must freeze it
      }
    };
  }
}

/**
 * Create a propagation context from incoming headers.
 */
function propagationContextFromHeaders(sentryTrace, baggage) {
  const traceparentData = extractTraceparentData(sentryTrace);
  const dynamicSamplingContext = (0,_baggage_js__WEBPACK_IMPORTED_MODULE_0__.baggageHeaderToDynamicSamplingContext)(baggage);
  const {
    traceId,
    parentSpanId,
    parentSampled
  } = traceparentData || {};
  if (!traceparentData) {
    return {
      traceId: traceId || (0,_misc_js__WEBPACK_IMPORTED_MODULE_1__.uuid4)(),
      spanId: (0,_misc_js__WEBPACK_IMPORTED_MODULE_1__.uuid4)().substring(16)
    };
  } else {
    return {
      traceId: traceId || (0,_misc_js__WEBPACK_IMPORTED_MODULE_1__.uuid4)(),
      parentSpanId: parentSpanId || (0,_misc_js__WEBPACK_IMPORTED_MODULE_1__.uuid4)().substring(16),
      spanId: (0,_misc_js__WEBPACK_IMPORTED_MODULE_1__.uuid4)().substring(16),
      sampled: parentSampled,
      dsc: dynamicSamplingContext || {} // If we have traceparent data but no DSC it means we are not head of trace and we must freeze it
    };
  }
}

/**
 * Create sentry-trace header from span context values.
 */
function generateSentryTraceHeader(traceId, spanId, sampled) {
  if (traceId === void 0) {
    traceId = (0,_misc_js__WEBPACK_IMPORTED_MODULE_1__.uuid4)();
  }
  if (spanId === void 0) {
    spanId = (0,_misc_js__WEBPACK_IMPORTED_MODULE_1__.uuid4)().substring(16);
  }
  let sampledString = '';
  if (sampled !== undefined) {
    sampledString = sampled ? '-1' : '-0';
  }
  return `${traceId}-${spanId}${sampledString}`;
}


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/worldwide.js":
/*!*****************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/worldwide.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GLOBAL_OBJ: () => (/* binding */ GLOBAL_OBJ),
/* harmony export */   getGlobalObject: () => (/* binding */ getGlobalObject),
/* harmony export */   getGlobalSingleton: () => (/* binding */ getGlobalSingleton)
/* harmony export */ });
/** Internal global with common properties and Sentry extensions  */

// The code below for 'isGlobalObj' and 'GLOBAL_OBJ' was copied from core-js before modification
// https://github.com/zloirock/core-js/blob/1b944df55282cdc99c90db5f49eb0b6eda2cc0a3/packages/core-js/internals/global.js
// core-js has the following licence:
//
// Copyright (c) 2014-2022 Denis Pushkarev
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/** Returns 'obj' if it's the global object, otherwise returns undefined */
function isGlobalObj(obj) {
  return obj && obj.Math == Math ? obj : undefined;
}

/** Get's the global object for the current JavaScript runtime */
const GLOBAL_OBJ = typeof globalThis == 'object' && isGlobalObj(globalThis) ||
// eslint-disable-next-line no-restricted-globals
typeof window == 'object' && isGlobalObj(window) || typeof self == 'object' && isGlobalObj(self) || typeof __webpack_require__.g == 'object' && isGlobalObj(__webpack_require__.g) || function () {
  return this;
}() || {};

/**
 * @deprecated Use GLOBAL_OBJ instead or WINDOW from @sentry/browser. This will be removed in v8
 */
function getGlobalObject() {
  return GLOBAL_OBJ;
}

/**
 * Returns a global singleton contained in the global `__SENTRY__` object.
 *
 * If the singleton doesn't already exist in `__SENTRY__`, it will be created using the given factory
 * function and added to the `__SENTRY__` object.
 *
 * @param name name of the global singleton on __SENTRY__
 * @param creator creator Factory function to create the singleton if it doesn't already exist on `__SENTRY__`
 * @param obj (Optional) The global object on which to look for `__SENTRY__`, if not `GLOBAL_OBJ`'s return value
 * @returns the singleton
 */
function getGlobalSingleton(name, creator, obj) {
  const gbl = obj || GLOBAL_OBJ;
  const __SENTRY__ = gbl.__SENTRY__ = gbl.__SENTRY__ || {};
  const singleton = __SENTRY__[name] || (__SENTRY__[name] = creator());
  return singleton;
}


/***/ }),

/***/ "./src/forum/index.js":
/*!****************************!*\
  !*** ./src/forum/index.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var flarum_forum_app__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! flarum/forum/app */ "flarum/forum/app");
/* harmony import */ var flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(flarum_forum_app__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _sentry_browser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @sentry/browser */ "./node_modules/@sentry/browser/build/npm/esm/integrations/globalhandlers.js");
/* harmony import */ var _sentry_browser__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @sentry/browser */ "./node_modules/@sentry/core/build/esm/integrations/eventFilters.js");
/* harmony import */ var _sentry_browser__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @sentry/browser */ "./node_modules/@sentry/core/build/esm/integrations/functiontostring.js");
/* harmony import */ var _sentry_browser__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @sentry/browser */ "./node_modules/@sentry/browser/build/npm/esm/integrations/breadcrumbs.js");
/* harmony import */ var _sentry_browser__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @sentry/browser */ "./node_modules/@sentry/browser/build/npm/esm/integrations/browserapierrors.js");
/* harmony import */ var _sentry_browser__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @sentry/browser */ "./node_modules/@sentry/browser/build/npm/esm/integrations/linkederrors.js");
/* harmony import */ var _sentry_browser__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @sentry/browser */ "./node_modules/@sentry/browser/build/npm/esm/integrations/httpcontext.js");
/* harmony import */ var _sentry_browser__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @sentry/browser */ "./node_modules/@sentry/browser/build/npm/esm/client.js");
/* harmony import */ var _sentry_browser__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @sentry/browser */ "./node_modules/@sentry/browser/build/npm/esm/transports/fetch.js");
/* harmony import */ var _sentry_browser__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @sentry/browser */ "./node_modules/@sentry/browser/build/npm/esm/stack-parsers.js");
/* harmony import */ var _sentry_browser__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @sentry/browser */ "./node_modules/@sentry/browser/build/npm/esm/sdk.js");
/* harmony import */ var _sentry_browser__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @sentry/browser */ "./node_modules/@sentry/core/build/esm/sdk.js");
/* harmony import */ var _sentry_browser__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @sentry/browser */ "./node_modules/@sentry/core/build/esm/exports.js");
/* harmony import */ var _sentry_integrations__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @sentry/integrations */ "./node_modules/@sentry/integrations/esm/captureconsole.js");



const integrations = [(0,_sentry_browser__WEBPACK_IMPORTED_MODULE_1__.globalHandlersIntegration)({
  onerror: true,
  onunhandledrejection: true
}), (0,_sentry_browser__WEBPACK_IMPORTED_MODULE_2__.inboundFiltersIntegration)(), (0,_sentry_browser__WEBPACK_IMPORTED_MODULE_3__.functionToStringIntegration)(), (0,_sentry_browser__WEBPACK_IMPORTED_MODULE_4__.breadcrumbsIntegration)({
  console: true,
  dom: true,
  fetch: true,
  history: true,
  sentry: true,
  xhr: true
}), (0,_sentry_browser__WEBPACK_IMPORTED_MODULE_5__.browserApiErrorsIntegration)(), (0,_sentry_browser__WEBPACK_IMPORTED_MODULE_6__.linkedErrorsIntegration)({
  key: 'cause',
  limit: 5
}), (0,_sentry_browser__WEBPACK_IMPORTED_MODULE_7__.httpContextIntegration)()];
if (false) {}
if (false) {}
const createClient = config => new _sentry_browser__WEBPACK_IMPORTED_MODULE_8__.BrowserClient({
  dsn: config.dsn,
  environment: config.environment,
  transport: _sentry_browser__WEBPACK_IMPORTED_MODULE_9__.makeFetchTransport,
  stackParser: _sentry_browser__WEBPACK_IMPORTED_MODULE_10__.defaultStackParser,
  beforeSend: event => {
    event.logger = 'javascript';
    if (config.scrubEmails && event.user?.email) {
      delete event.user.email;
    }
    if (config.showFeedback && event.exception) {
      (0,_sentry_browser__WEBPACK_IMPORTED_MODULE_11__.showReportDialog)({
        eventId: event.event_id,
        user: Sentry.getUserData('name')
      });
    }
    return event;
  },
  tracesSampleRate: config.tracesSampleRate,
  replaysSessionSampleRate: config.replaysSessionSampleRate,
  replaysOnErrorSampleRate: config.replaysOnErrorSampleRate,
  integrations: [...integrations, config.captureConsole && (0,_sentry_integrations__WEBPACK_IMPORTED_MODULE_12__.captureConsoleIntegration)()].filter(Boolean)
});
window.Sentry = {
  createClient,
  setCurrentClient: _sentry_browser__WEBPACK_IMPORTED_MODULE_13__.setCurrentClient,
  setUser: _sentry_browser__WEBPACK_IMPORTED_MODULE_14__.setUser
};
window.Sentry.getUserData = function (nameAttr) {
  if (nameAttr === void 0) {
    nameAttr = 'username';
  }
  /** @type {Sentry.User} */
  let userData = {};

  // Depending on when the error occurs, `app` might not be defined
  if ((flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default())) {
    const user = (flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().session)?.user;
    if ((flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().session) && user && user.id() != 0) {
      userData = {
        ip_address: '{{auto}}',
        id: user.id(),
        [nameAttr]: user.username()
      };
      if (!(flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().data)['fof-sentry.scrub-emails']) {
        userData.email = user.email();
      }
    } else if ((flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().data).session && (flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().data).session.userId !== 0) {
      userData = {
        id: (flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().data).session.userId
      };
    }
  }
  return userData;
};
flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().initializers.add('fof/sentry', () => {
  Sentry.setUser(Sentry.getUserData());
});

/***/ }),

/***/ "flarum/forum/app":
/*!******************************************************!*\
  !*** external "flarum.reg.get('core', 'forum/app')" ***!
  \******************************************************/
/***/ ((module) => {

"use strict";
module.exports = flarum.reg.get('core', 'forum/app');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		flarum.reg._webpack_runtimes["fof-sentry"] ||= __webpack_require__;// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";
/*!******************!*\
  !*** ./forum.js ***!
  \******************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _src_forum__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./src/forum */ "./src/forum/index.js");

})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=forum.js.map