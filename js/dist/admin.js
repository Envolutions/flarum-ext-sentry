/******/ (() => { // webpackBootstrap
/******/ 	// runtime can't be in strict mode because a global variable is assign and maybe created.
/******/ 	var __webpack_modules__ = ({

/***/ "./src/admin/extend.tsx":
/*!******************************!*\
  !*** ./src/admin/extend.tsx ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var flarum_common_extenders__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! flarum/common/extenders */ "flarum/common/extenders");
/* harmony import */ var flarum_common_extenders__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(flarum_common_extenders__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var flarum_admin_app__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! flarum/admin/app */ "flarum/admin/app");
/* harmony import */ var flarum_admin_app__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(flarum_admin_app__WEBPACK_IMPORTED_MODULE_1__);


const hasExcimer = () => (flarum_admin_app__WEBPACK_IMPORTED_MODULE_1___default().data)['hasExcimer'];
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ([new (flarum_common_extenders__WEBPACK_IMPORTED_MODULE_0___default().Admin)().setting(() => ({
  setting: 'fof-sentry.dsn',
  type: 'text',
  label: flarum_admin_app__WEBPACK_IMPORTED_MODULE_1___default().translator.trans('fof-sentry.admin.settings.dsn_label'),
  help: flarum_admin_app__WEBPACK_IMPORTED_MODULE_1___default().translator.trans('fof-sentry.admin.settings.dsn_help'),
  required: true
})).setting(() => ({
  setting: 'fof-sentry.dsn_backend',
  type: 'url',
  label: flarum_admin_app__WEBPACK_IMPORTED_MODULE_1___default().translator.trans('fof-sentry.admin.settings.dsn_backend_label'),
  help: flarum_admin_app__WEBPACK_IMPORTED_MODULE_1___default().translator.trans('fof-sentry.admin.settings.dsn_backend_help')
})).setting(() => ({
  setting: 'fof-sentry.environment',
  type: 'string',
  label: flarum_admin_app__WEBPACK_IMPORTED_MODULE_1___default().translator.trans('fof-sentry.admin.settings.environment_label')
})).setting(() => ({
  setting: 'fof-sentry.user_feedback',
  type: 'boolean',
  label: flarum_admin_app__WEBPACK_IMPORTED_MODULE_1___default().translator.trans('fof-sentry.admin.settings.user_feedback_label')
})).setting(() => ({
  setting: 'fof-sentry.send_emails_with_sentry_reports',
  type: 'boolean',
  label: flarum_admin_app__WEBPACK_IMPORTED_MODULE_1___default().translator.trans('fof-sentry.admin.settings.send_user_emails_label')
})).setting(() => ({
  setting: 'fof-sentry.monitor_performance',
  type: 'number',
  label: flarum_admin_app__WEBPACK_IMPORTED_MODULE_1___default().translator.trans('fof-sentry.admin.settings.monitor_performance_label'),
  min: 0,
  max: 100
})).setting(() => ({
  setting: 'fof-sentry.profile_rate',
  type: 'number',
  label: flarum_admin_app__WEBPACK_IMPORTED_MODULE_1___default().translator.trans('fof-sentry.admin.settings.profile_rate_label'),
  help: flarum_admin_app__WEBPACK_IMPORTED_MODULE_1___default().translator.trans('fof-sentry.admin.settings.profile_rate_help', {
    br: m("br", null),
    bold: hasExcimer() ? '' : m("b", null),
    icon: hasExcimer() ? '✔' : '✖',
    a: m("a", {
      href: "https://docs.sentry.io/platforms/php/profiling/#improve-response-time",
      target: "_blank"
    })
  }),
  min: 0,
  max: 100,
  disabled: !hasExcimer() // requires PHP extension
})).setting(() => ({
  setting: 'fof-sentry.javascript',
  type: 'boolean',
  label: flarum_admin_app__WEBPACK_IMPORTED_MODULE_1___default().translator.trans('fof-sentry.admin.settings.javascript_label')
})).setting(() => ({
  setting: 'fof-sentry.javascript.console',
  type: 'boolean',
  label: flarum_admin_app__WEBPACK_IMPORTED_MODULE_1___default().translator.trans('fof-sentry.admin.settings.javascript_console_label')
})).setting(() => ({
  setting: 'fof-sentry.javascript.trace_sample_rate',
  type: 'number',
  label: flarum_admin_app__WEBPACK_IMPORTED_MODULE_1___default().translator.trans('fof-sentry.admin.settings.javascript_trace_sample_rate'),
  help: flarum_admin_app__WEBPACK_IMPORTED_MODULE_1___default().translator.trans('fof-sentry.admin.settings.javascript_trace_sample_rate_help', {
    br: m("br", null)
  }),
  min: 0,
  max: 100
})).setting(() => ({
  setting: 'fof-sentry.javascript.replays_session_sample_rate',
  type: 'number',
  label: flarum_admin_app__WEBPACK_IMPORTED_MODULE_1___default().translator.trans('fof-sentry.admin.settings.javascript_replays_session_sample_rate'),
  help: flarum_admin_app__WEBPACK_IMPORTED_MODULE_1___default().translator.trans('fof-sentry.admin.settings.javascript_replays_session_sample_rate_help', {
    br: m("br", null)
  }),
  min: 0,
  max: 100
})).setting(() => ({
  setting: 'fof-sentry.javascript.replays_error_sample_rate',
  type: 'number',
  label: flarum_admin_app__WEBPACK_IMPORTED_MODULE_1___default().translator.trans('fof-sentry.admin.settings.javascript_replays_error_sample_rate'),
  help: flarum_admin_app__WEBPACK_IMPORTED_MODULE_1___default().translator.trans('fof-sentry.admin.settings.javascript_replays_error_sample_rate_help', {
    br: m("br", null)
  }),
  min: 0,
  max: 100
}))]);

/***/ }),

/***/ "./src/admin/index.ts":
/*!****************************!*\
  !*** ./src/admin/index.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   extend: () => (/* reexport safe */ _extend__WEBPACK_IMPORTED_MODULE_1__["default"])
/* harmony export */ });
/* harmony import */ var flarum_admin_app__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! flarum/admin/app */ "flarum/admin/app");
/* harmony import */ var flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(flarum_admin_app__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _extend__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./extend */ "./src/admin/extend.tsx");


flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().initializers.add('fof/sentry', () => {
  flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().registry.for('fof-sentry');
});

/***/ }),

/***/ "flarum/admin/app":
/*!******************************************************!*\
  !*** external "flarum.reg.get('core', 'admin/app')" ***!
  \******************************************************/
/***/ ((module) => {

"use strict";
module.exports = flarum.reg.get('core', 'admin/app');

/***/ }),

/***/ "flarum/common/extenders":
/*!*************************************************************!*\
  !*** external "flarum.reg.get('core', 'common/extenders')" ***!
  \*************************************************************/
/***/ ((module) => {

"use strict";
module.exports = flarum.reg.get('core', 'common/extenders');

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
  !*** ./admin.ts ***!
  \******************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   extend: () => (/* reexport safe */ _src_admin__WEBPACK_IMPORTED_MODULE_0__.extend)
/* harmony export */ });
/* harmony import */ var _src_admin__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./src/admin */ "./src/admin/index.ts");

})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=admin.js.map