// ==UserScript==
// @name        ls-proxy
// @descripton  Wrapper around localStorage to easily store JSON objects
// @version     0.1.0
// @author      Adam Thompson-Sharpe
// @license     MIT
// @homepageURL https://gitlab.com/MysteryBlokHed/ls-proxy
// ==/UserScript==
(()=>{"use strict";var e={};(()=>{var t=e;Object.defineProperty(t,"__esModule",{value:!0}),t.storeSeparate=t.storeObject=void 0;t.storeObject=function(e,t,o={}){const{checkGets:l,validate:a,parse:n,stringify:c}=(({checkGets:e,validate:t,parse:r,stringify:o})=>({checkGets:null==e||e,validate:null!=t?t:()=>!0,parse:null!=r?r:JSON.parse,stringify:null!=o?o:JSON.stringify}))(o),s=t=>{const o=n(t);return r(a(o),o,"get",e)},i=t=>c(r(a(t),t,"set",e));let g=Object.assign({},t);return localStorage[e]?g=s(localStorage[e]):localStorage[e]=i(t),new Proxy(g,{set(t,r,o,l){const a=Reflect.set(t,r,o,l);return localStorage[e]=i(t),a},get(r,o,a){var n;return l&&(r[o]=null!==(n=s(localStorage[e])[o])&&void 0!==n?n:t[o]),Reflect.get(r,o,a)}})};const r=(e,t,r,o)=>{const l=new TypeError("get"===r?`Validation failed while parsing ${o} from localStorage`:`Validation failed while setting to ${o} in localStorage`);if("boolean"==typeof e){if(!e)throw l}else{if(!Array.isArray(e))return e;if(!e[0])throw 2===e.length?e[1]:l}return t};t.storeSeparate=function(e,t={}){const{id:r,checkGets:l}=(({id:e,checkGets:t})=>({id:e,checkGets:null==t||t}))(t),a=Object.assign({},e);for(const[t,l]of Object.entries(e)){const e=o(t,r);localStorage[e]?a[t]=localStorage[e]:localStorage[e]=l}return new Proxy(a,{set:(e,t,l,a)=>(localStorage[o(t,r)]=l,Reflect.set(e,t,l,a)),get(t,a,n){var c;return l&&(t[a]=null!==(c=localStorage[o(a,r)])&&void 0!==c?c:e[a]),Reflect.get(t,a,n)}})};const o=(e,t)=>t?`${t}.${e}`:e})(),window.LSProxy=e})();