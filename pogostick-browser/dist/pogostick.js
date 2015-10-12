(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var pogo=require("pogostick-proto"),requestFactory=function(t,e){try{var o=new XMLHttpRequest,s=t.protocol||"http",r=t.host||"localhost",n=t.port||("https"===s?443:80),u=t.path||"/",p=s+"://"+r+":"+n+u,a=t.headers||{},c=t.method||"POST";o.open(c,p,!0),a["X-Requested-With"]="XMLHttpRequest",Object.keys(a).forEach(function(t){o.setRequestHeader(t,a[t])}),o.onload=function(){o.status<300&&o.status>=200?e(null,o.responseText.split("\n")):e(new Error("Server responded with a "+o.status+" with message: "+o.responseText))},o.onerror=function(t){e(t)},t.body.str?o.send(t.body.str):o.send(t.body)}catch(d){e(d)}};module.exports=function(t,e){return pogo.client(t,requestFactory,e)};

},{"pogostick-proto":2}],2:[function(require,module,exports){
"use strict";var Exit=require("./lib/exit");module.exports={client:require("./lib/client"),server:require("./lib/server"),Exit:Exit,exit:Exit.create};

},{"./lib/client":3,"./lib/exit":4,"./lib/server":6}],3:[function(require,module,exports){
"use strict";function parseField(r,e,t,i,n,o,a){if("number"==typeof a){var s=mkRemoteProc(r,e,t,i,n,o);return mkFn(a,s)}if(Array.isArray(a)){for(var c=[],u=0;u<a.length;u++){var p=parseField(r,e,t,i,n,o+"."+u,a[u]);c.push(p)}return c}if("object"==typeof a){var l={};for(var d in a)if(a.hasOwnProperty(d)){var f=parseField(r,e,t,i,n,o+"."+d,a[d]);l[d]=f}return l}}function mkRemoteProc(r,e,t,i,n,o){return function(){if(n.isEnded)return r(function(r,e){return e(new Error("Connection is closed"))});void 0===this._implicitsCache&&(this._implicitsCache=JSON.stringify(this._implicits));var a=this._implicitsCache,s=Array.prototype.slice.call(arguments);return r(function(r,c){var u=serializer.call(o,s,a),p=extend({body:u},t);e(p,function(e,t){if(e)return c(e),void(i.broadcastError&&i.error(e));switch(t[0]){case"exit":n.isEnded=!0;var o;if(void 0!==t[3])try{o=JSON.parse(t[3])}catch(e){}i.exit(t[1],t[2],o),i.end(t[1],t[2],o);break;case"err":var a;try{a=new Error(JSON.parse(t[3]))}catch(e){a=e}c(a),i.broadcastError&&i.error(a);break;case"res":r(JSON.parse(t[3]))}})})}}function $implicitly(r,e){var t={};for(var i in this._implicits)t[i]=this._implicits;return t[r]=e,new this.constructor(t)}function createRemoteClass(r,e,t,i){var n={isEnded:!1},o=i.on||{},a={end:o.end,error:o.error,broadcastError:!!o.error,exit:o.exit},s=function(r){this._implicits=r},c=Object.create(null);for(var u in t)c[u]=parseField(r,e,i,a,n,u,t[u]);return s.prototype=c,s.prototype.$implicitly=$implicitly,s.prototype.$end=function(){n.isEnded=!0,"function"==typeof a.end&&a.end.apply(this,arguments)},s.prototype.constructor=s,s}function initError(r){var e;try{e=JSON.parse(r[3])}catch(t){return new Error("Error requesting procedure listing")}return new Error(e)}var serializer=require("./serializer"),extend=require("extend"),mkFn=require("mk-fn");module.exports=function(r,e,t){var i=t?extend({},t):{};return function(t,n){var o=extend(extend({},i),t),a=extend({body:serializer.ls()},o);e(a,function(t,i){if(t)return n(t);if("err"===i[0]||"exit"===i[0])return n(initError(i));var a;try{a=JSON.parse(i[3])}catch(s){return n(new Error("JSON parser error: "+s.message))}var c=createRemoteClass(r,e,a,o);n(null,new c({}))})}};

},{"./serializer":5,"extend":7,"mk-fn":8}],4:[function(require,module,exports){
function Exit(t){this.message=t||""}Exit.create=function(t){return new Exit(t)},module.exports=Exit;

},{}],5:[function(require,module,exports){
"use strict";var cleanInitField=function(n){if("function"==typeof n)return n.length;if("object"==typeof n){if(Array.isArray(n))return n.map(cleanInitField);var r={};for(var t in n)n.hasOwnProperty(t)&&(r[t]=cleanInitField(n[t]));return r}},cleanProcObj=function(n){var r={};for(var t in n)n.hasOwnProperty(t)&&(r[t]=cleanInitField(n[t]));return r},randString=function(){var n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";return function(){for(var r=[],t=0;10>t;t++){var i=Math.floor(Math.random()*n.length),e=n.charAt(i);r.push(e)}return r.join("")}}();module.exports={ls:function(){return["ls",Date.now(),randString()].join("\n")},init:function(n){var r=cleanProcObj(n),t=JSON.stringify(r);return function(n,r){return["init",n,r,t].join("\n")}},call:function(n,r,t){var i=randString(),e=Date.now();return{stamp:e,rand:i,str:["call",e,i,n,JSON.stringify(r),t?JSON.stringify(t):""].join("\n")}},res:function(n,r,t){return["res",n,r,JSON.stringify(t)].join("\n")},err:function(n,r,t){return["err",n,r,JSON.stringify(t)].join("\n")},exit:function(n,r,t){return 3===arguments.length?["err",n,r,t].join("\n"):["err","","",JSON.stringify(t)].join("\n")}};

},{}],6:[function(require,module,exports){
"use strict";function processCall(e,r){for(var i=e,t=r[3].split("."),n=0;n<t.length;n++)if(i=i[t[n]],void 0===i)return notExist(r);var s,a;try{s=r[5]?JSON.parse(r[5]):{},a=i.apply(s,JSON.parse(r[4]))}catch(u){return serializer.err(r[1],r[2],u.message)}return"function"==typeof a.then?a.then(function(e){return e instanceof Exit?serializer.exit(r[1],r[2],e.message):serializer.res(r[1],r[2],e)},function(e){return serializer.err(r[1],r[2],e)}):a instanceof Exit?serializer.exit(r[1],r[2],a.message):serializer.res(r[1],r[2],a)}function notExist(e){var r=new Error("Procedure "+e[3]+" does not exist");return serializer.err(e[1],e[2],r)}var extend=require("extend"),serializer=require("./serializer"),Exit=require("./exit");module.exports=function(e,r){var i=extend({},r);return function(r,t){var n=extend(extend({},i),t),s=serializer.init(r),a=function(e){switch(e[0]){case"ls":return s(e[1],e[2]);case"call":return processCall(r,e);default:var i={message:"Could not process request.",received:e.join("\n")};return serializer.err(e[1],e[2],i)}};return e(a,n)}};

},{"./exit":4,"./serializer":5,"extend":7}],7:[function(require,module,exports){
"use strict";var hasOwn=Object.prototype.hasOwnProperty,toStr=Object.prototype.toString,isArray=function(t){return"function"==typeof Array.isArray?Array.isArray(t):"[object Array]"===toStr.call(t)},isPlainObject=function(t){if(!t||"[object Object]"!==toStr.call(t))return!1;var r=hasOwn.call(t,"constructor"),o=t.constructor&&t.constructor.prototype&&hasOwn.call(t.constructor.prototype,"isPrototypeOf");if(t.constructor&&!r&&!o)return!1;var n;for(n in t);return"undefined"==typeof n||hasOwn.call(t,n)};module.exports=function t(){var r,o,n,e,a,c,i=arguments[0],s=1,u=arguments.length,f=!1;for("boolean"==typeof i?(f=i,i=arguments[1]||{},s=2):("object"!=typeof i&&"function"!=typeof i||null==i)&&(i={});u>s;++s)if(r=arguments[s],null!=r)for(o in r)n=i[o],e=r[o],i!==e&&(f&&e&&(isPlainObject(e)||(a=isArray(e)))?(a?(a=!1,c=n&&isArray(n)?n:[]):c=n&&isPlainObject(n)?n:{},i[o]=t(f,c,e)):"undefined"!=typeof e&&(i[o]=e));return i};

},{}],8:[function(require,module,exports){
module.exports=function(n,t){switch(n){case 0:return function(){return t.apply(this,arguments)};case 1:return function(n){return t.apply(this,arguments)};case 2:return function(n,r){return t.apply(this,arguments)};case 3:return function(n,r,e){return t.apply(this,arguments)};case 4:return function(n,r,e,u){return t.apply(this,arguments)};case 5:return function(n,r,e,u,a){return t.apply(this,arguments)};case 6:return function(n,r,e,u,a,s){return t.apply(this,arguments)};case 7:return function(n,r,e,u,a,s,c){return t.apply(this,arguments)};case 8:return function(n,r,e,u,a,s,c,i){return t.apply(this,arguments)};case 9:return function(n,r,e,u,a,s,c,i,p){return t.apply(this,arguments)};case 10:return function(n,r,e,u,a,s,c,i,p,o){return t.apply(this,arguments)};case 11:return function(n,r,e,u,a,s,c,i,p,o,f){return t.apply(this,arguments)};case 12:return function(n,r,e,u,a,s,c,i,p,o,f,l){return t.apply(this,arguments)};case 13:return function(n,r,e,u,a,s,c,i,p,o,f,l,h){return t.apply(this,arguments)};case 14:return function(n,r,e,u,a,s,c,i,p,o,f,l,h,m){return t.apply(this,arguments)};case 15:return function(n,r,e,u,a,s,c,i,p,o,f,l,h,m,g){return t.apply(this,arguments)};case 16:return function(n,r,e,u,a,s,c,i,p,o,f,l,h,m,g,y){return t.apply(this,arguments)};case 17:return function(n,r,e,u,a,s,c,i,p,o,f,l,h,m,g,y,d){return t.apply(this,arguments)};case 18:return function(n,r,e,u,a,s,c,i,p,o,f,l,h,m,g,y,d,w){return t.apply(this,arguments)};case 19:return function(n,r,e,u,a,s,c,i,p,o,f,l,h,m,g,y,d,w,k){return t.apply(this,arguments)};case 20:return function(n,r,e,u,a,s,c,i,p,o,f,l,h,m,g,y,d,w,k,v){return t.apply(this,arguments)};case 21:return function(n,r,e,u,a,s,c,i,p,o,f,l,h,m,g,y,d,w,k,v,x){return t.apply(this,arguments)};case 22:return function(n,r,e,u,a,s,c,i,p,o,f,l,h,m,g,y,d,w,k,v,x,F){return t.apply(this,arguments)};case 23:return function(n,r,e,u,a,s,c,i,p,o,f,l,h,m,g,y,d,w,k,v,x,F,b){return t.apply(this,arguments)};case 24:return function(n,r,e,u,a,s,c,i,p,o,f,l,h,m,g,y,d,w,k,v,x,F,b,j){return t.apply(this,arguments)};case 25:return function(n,r,e,u,a,s,c,i,p,o,f,l,h,m,g,y,d,w,k,v,x,F,b,j,q){return t.apply(this,arguments)};case 26:return function(n,r,e,u,a,s,c,i,p,o,f,l,h,m,g,y,d,w,k,v,x,F,b,j,q,z){return t.apply(this,arguments)};default:throw"Function length is not valid, mk-fn cannot create function"}};

},{}]},{},[1])
//# sourceMappingURL=pogostick.js.map