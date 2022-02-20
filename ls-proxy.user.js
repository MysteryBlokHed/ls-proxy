// ==UserScript==
// @name        ls-proxy
// @descripton  Wrapper around localStorage to easily store JSON objects
// @version     0.3.0
// @author      Adam Thompson-Sharpe
// @license     MIT OR Apache-2.0
// @homepageURL https://gitlab.com/MysteryBlokHed/ls-proxy
// ==/UserScript==
(()=>{"use strict";var e={677:(e,t)=>{var r;Object.defineProperty(t,"__esModule",{value:!0}),function(e){e.keys=(e,t)=>Object.keys(e).every((e=>t.includes(e)))&&t.every((t=>t in e)),e.types=(e,t)=>Object.entries(e).every((([e,r])=>typeof r===t[e]))}(r||(r={})),t.default=r}},t={};function r(o){var l=t[o];if(void 0!==l)return l.exports;var a=t[o]={exports:{}};return e[o](a,a.exports,r),a.exports}var o={};(()=>{var e=o;Object.defineProperty(e,"__esModule",{value:!0}),e.storeSeparate=e.storeObject=e.Validations=void 0;var t=r(677);Object.defineProperty(e,"Validations",{enumerable:!0,get:function(){return t.default}});e.storeObject=function(e,t,r={}){const{checkGets:o,partial:a,validate:n,modify:c,parse:s,stringify:i}=(({checkGets:e,partial:t,validate:r,modify:o,parse:l,stringify:a})=>({checkGets:null==e||e,partial:null!=t&&t,validate:null!=r?r:()=>!0,modify:null!=o?o:e=>e,parse:null!=l?l:JSON.parse,stringify:null!=a?a:JSON.stringify}))(r),g=(t,r="set")=>l(n,c,t,r,e),f=e=>{const t=s(e);return g(t,"get")},u=e=>i(g(e)),d=(e,r=!0)=>{let o={};return Object.keys(t).forEach((l=>{var a;return o[l]=r?null!==(a=e[l])&&void 0!==a?a:t[l]:e[l]})),o};let y=Object.assign({},t);if(localStorage[e])if(a){const t=s(localStorage[e]);y=d(t);const r=g(y);localStorage[e]=i(Object.assign(Object.assign({},t),r))}else y=f(localStorage[e]);else localStorage[e]=u(t);const p=(e,t,r,o)=>new Proxy(r,{set(r,l,a){const n=Reflect.set(r,l,a);return o(e,t,r,e),n},get(e,t){return e[t]&&"object"==typeof e[t]&&e[t].constructor===Object?p(e,t,Reflect.get(e,t),this.set):Reflect.get(e,t)}});return new Proxy(y,{set(t,r,o){const l=Reflect.set(t,r,o);if(a){const r=g(t);localStorage[e]=i(Object.assign(Object.assign({},s(localStorage[e])),r))}else localStorage[e]=u(t);return l},get(r,l){var n;return o&&(a?(r[l]=g(d(s(localStorage[e]),!1),"get")[l],g(r,"get")):r[l]=null!==(n=f(localStorage[e])[l])&&void 0!==n?n:t[l],r[l]&&"object"==typeof r[l]&&r[l].constructor===Object)?p(r,l,r[l],this.set):Reflect.get(r,l)}})};const l=(e,t,r,o,l)=>{const a=new TypeError("get"===o?`Validation failed while parsing ${l} from localStorage`:`Validation failed while setting to ${l} in localStorage`),n=e(r,o);if("boolean"==typeof n){if(!n)throw a}else if(Array.isArray(n)&&!n[0])throw 2===n.length?n[1]:a;return t(r,o)};e.storeSeparate=function(e,t={}){const{id:r,checkGets:o}=(({id:e,checkGets:t})=>({id:e,checkGets:null==t||t}))(t),l=Object.assign({},e);for(const[t,o]of Object.entries(e)){const e=a(t,r);localStorage[e]?l[t]=localStorage[e]:localStorage[e]=o}return new Proxy(l,{set:(e,t,o)=>(localStorage[a(t,r)]=o,Reflect.set(e,t,o)),get(t,l){var n;return o&&(t[l]=null!==(n=localStorage[a(l,r)])&&void 0!==n?n:e[l]),Reflect.get(t,l)}})};const a=(e,t)=>t?`${t}.${e}`:e})(),window.LSProxy=o})();