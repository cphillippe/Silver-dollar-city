(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const d of document.querySelectorAll('link[rel="modulepreload"]'))h(d);new MutationObserver(d=>{for(const m of d)if(m.type==="childList")for(const w of m.addedNodes)w.tagName==="LINK"&&w.rel==="modulepreload"&&h(w)}).observe(document,{childList:!0,subtree:!0});function r(d){const m={};return d.integrity&&(m.integrity=d.integrity),d.referrerPolicy&&(m.referrerPolicy=d.referrerPolicy),d.crossOrigin==="use-credentials"?m.credentials="include":d.crossOrigin==="anonymous"?m.credentials="omit":m.credentials="same-origin",m}function h(d){if(d.ep)return;d.ep=!0;const m=r(d);fetch(d.href,m)}})();var Bh={exports:{}},po={};var iy;function Dv(){if(iy)return po;iy=1;var a=Symbol.for("react.transitional.element"),o=Symbol.for("react.fragment");function r(h,d,m){var w=null;if(m!==void 0&&(w=""+m),d.key!==void 0&&(w=""+d.key),"key"in d){m={};for(var y in d)y!=="key"&&(m[y]=d[y])}else m=d;return d=m.ref,{$$typeof:a,type:h,key:w,ref:d!==void 0?d:null,props:m}}return po.Fragment=o,po.jsx=r,po.jsxs=r,po}var oy;function Pv(){return oy||(oy=1,Bh.exports=Dv()),Bh.exports}var s=Pv();var mi;(function(a){a.Unimplemented="UNIMPLEMENTED",a.Unavailable="UNAVAILABLE"})(mi||(mi={}));class Fh extends Error{constructor(o,r,h){super(o),this.message=o,this.code=r,this.data=h}}const Gv=a=>{var o,r;return a?.androidBridge?"android":!((r=(o=a?.webkit)===null||o===void 0?void 0:o.messageHandlers)===null||r===void 0)&&r.bridge?"ios":"web"},zv=a=>{const o=a.CapacitorCustomPlatform||null,r=a.Capacitor||{},h=r.Plugins=r.Plugins||{},d=()=>o!==null?o.name:Gv(a),m=()=>d()!=="web",w=b=>{const M=g.get(b);return!!(M?.platforms.has(d())||y(b))},y=b=>{var M;return(M=r.PluginHeaders)===null||M===void 0?void 0:M.find(E=>E.name===b)},f=b=>a.console.error(b),g=new Map,T=(b,M={})=>{const E=g.get(b);if(E)return console.warn(`Capacitor plugin "${b}" already registered. Cannot register plugins twice.`),E.proxy;const G=d(),I=y(b);let _;const Q=async()=>(!_&&G in M?_=typeof M[G]=="function"?_=await M[G]():_=M[G]:o!==null&&!_&&"web"in M&&(_=typeof M.web=="function"?_=await M.web():_=M.web),_),ne=(te,ee)=>{var ge,j;if(I){const O=I?.methods.find(A=>ee===A.name);if(O)return O.rtype==="promise"?A=>r.nativePromise(b,ee.toString(),A):(A,X)=>r.nativeCallback(b,ee.toString(),A,X);if(te)return(ge=te[ee])===null||ge===void 0?void 0:ge.bind(te)}else{if(te)return(j=te[ee])===null||j===void 0?void 0:j.bind(te);throw new Fh(`"${b}" plugin is not implemented on ${G}`,mi.Unimplemented)}},se=te=>{let ee;const ge=(...j)=>{const O=Q().then(A=>{const X=ne(A,te);if(X){const L=X(...j);return ee=L?.remove,L}else throw new Fh(`"${b}.${te}()" is not implemented on ${G}`,mi.Unimplemented)});return te==="addListener"&&(O.remove=async()=>ee()),O};return ge.toString=()=>`${te.toString()}() { [capacitor code] }`,Object.defineProperty(ge,"name",{value:te,writable:!1,configurable:!1}),ge},ie=se("addListener"),re=se("removeListener"),F=(te,ee)=>{const ge=ie({eventName:te},ee),j=async()=>{const A=await ge;re({eventName:te,callbackId:A},ee)},O=new Promise(A=>ge.then(()=>A({remove:j})));return O.remove=async()=>{console.warn("Using addListener() without 'await' is deprecated."),await j()},O},B=new Proxy({},{get(te,ee){switch(ee){case"$$typeof":return;case"toJSON":return()=>({});case"addListener":return I?F:ie;case"removeListener":return re;default:return se(ee)}}});return h[b]=B,g.set(b,{name:b,proxy:B,platforms:new Set([...Object.keys(M),...I?[G]:[]])}),B};return r.convertFileSrc||(r.convertFileSrc=b=>b),r.getPlatform=d,r.handleError=f,r.isNativePlatform=m,r.isPluginAvailable=w,r.registerPlugin=T,r.Exception=Fh,r.DEBUG=!!r.DEBUG,r.isLoggingEnabled=!!r.isLoggingEnabled,r},Jv=a=>a.Capacitor=zv(a),pl=Jv(typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{}),Cd=pl.registerPlugin;class Ad{constructor(){this.listeners={},this.retainedEventArguments={},this.windowListeners={}}addListener(o,r){let h=!1;this.listeners[o]||(this.listeners[o]=[],h=!0),this.listeners[o].push(r);const m=this.windowListeners[o];m&&!m.registered&&this.addWindowListener(m),h&&this.sendRetainedArgumentsForEvent(o);const w=async()=>this.removeListener(o,r);return Promise.resolve({remove:w})}async removeAllListeners(){this.listeners={};for(const o in this.windowListeners)this.removeWindowListener(this.windowListeners[o]);this.windowListeners={}}notifyListeners(o,r,h){const d=this.listeners[o];if(!d){if(h){let m=this.retainedEventArguments[o];m||(m=[]),m.push(r),this.retainedEventArguments[o]=m}return}d.forEach(m=>m(r))}hasListeners(o){var r;return!!(!((r=this.listeners[o])===null||r===void 0)&&r.length)}registerWindowListener(o,r){this.windowListeners[r]={registered:!1,windowEventName:o,pluginEventName:r,handler:h=>{this.notifyListeners(r,h)}}}unimplemented(o="not implemented"){return new pl.Exception(o,mi.Unimplemented)}unavailable(o="not available"){return new pl.Exception(o,mi.Unavailable)}async removeListener(o,r){const h=this.listeners[o];if(!h)return;const d=h.indexOf(r);d!==-1&&this.listeners[o].splice(d,1),this.listeners[o].length||this.removeWindowListener(this.windowListeners[o])}addWindowListener(o){window.addEventListener(o.windowEventName,o.handler),o.registered=!0}removeWindowListener(o){o&&(window.removeEventListener(o.windowEventName,o.handler),o.registered=!1)}sendRetainedArgumentsForEvent(o){const r=this.retainedEventArguments[o];r&&(delete this.retainedEventArguments[o],r.forEach(h=>{this.notifyListeners(o,h)}))}}const ry=a=>encodeURIComponent(a).replace(/%(2[346B]|5E|60|7C)/g,decodeURIComponent).replace(/[()]/g,escape),ly=a=>a.replace(/(%[\dA-F]{2})+/gi,decodeURIComponent);class _v extends Ad{async getCookies(){const o=document.cookie,r={};return o.split(";").forEach(h=>{if(h.length<=0)return;let[d,m]=h.replace(/=/,"CAP_COOKIE").split("CAP_COOKIE");d=ly(d).trim(),m=ly(m).trim(),r[d]=m}),r}async setCookie(o){try{const r=ry(o.key),h=ry(o.value),d=o.expires?`; expires=${o.expires.replace("expires=","")}`:"",m=(o.path||"/").replace("path=",""),w=o.url!=null&&o.url.length>0?`domain=${o.url}`:"";document.cookie=`${r}=${h||""}${d}; path=${m}; ${w};`}catch(r){return Promise.reject(r)}}async deleteCookie(o){try{document.cookie=`${o.key}=; Max-Age=0`}catch(r){return Promise.reject(r)}}async clearCookies(){try{const o=document.cookie.split(";")||[];for(const r of o)document.cookie=r.replace(/^ +/,"").replace(/=.*/,`=;expires=${new Date().toUTCString()};path=/`)}catch(o){return Promise.reject(o)}}async clearAllCookies(){try{await this.clearCookies()}catch(o){return Promise.reject(o)}}}Cd("CapacitorCookies",{web:()=>new _v});const Uv=async a=>new Promise((o,r)=>{const h=new FileReader;h.onload=()=>{const d=h.result;o(d.indexOf(",")>=0?d.split(",")[1]:d)},h.onerror=d=>r(d),h.readAsDataURL(a)}),Bv=(a={})=>{const o=Object.keys(a);return Object.keys(a).map(d=>d.toLocaleLowerCase()).reduce((d,m,w)=>(d[m]=a[o[w]],d),{})},Fv=(a,o=!0)=>a?Object.entries(a).reduce((h,d)=>{const[m,w]=d;let y,f;return Array.isArray(w)?(f="",w.forEach(g=>{y=o?encodeURIComponent(g):g,f+=`${m}=${y}&`}),f.slice(0,-1)):(y=o?encodeURIComponent(w):w,f=`${m}=${y}`),`${h}&${f}`},"").substr(1):null,$v=(a,o={})=>{const r=Object.assign({method:a.method||"GET",headers:a.headers},o),d=Bv(a.headers)["content-type"]||"";if(typeof a.data=="string")r.body=a.data;else if(d.includes("application/x-www-form-urlencoded")){const m=new URLSearchParams;for(const[w,y]of Object.entries(a.data||{}))m.set(w,y);r.body=m.toString()}else if(d.includes("multipart/form-data")||a.data instanceof FormData){const m=new FormData;if(a.data instanceof FormData)a.data.forEach((y,f)=>{m.append(f,y)});else for(const y of Object.keys(a.data))m.append(y,a.data[y]);r.body=m;const w=new Headers(r.headers);w.delete("content-type"),r.headers=w}else(d.includes("application/json")||typeof a.data=="object")&&(r.body=JSON.stringify(a.data));return r};class Kv extends Ad{async request(o){const r=$v(o,o.webFetchExtra),h=Fv(o.params,o.shouldEncodeUrlParams),d=h?`${o.url}?${h}`:o.url,m=await fetch(d,r),w=m.headers.get("content-type")||"";let{responseType:y="text"}=m.ok?o:{};w.includes("application/json")&&(y="json");let f,g;switch(y){case"arraybuffer":case"blob":g=await m.blob(),f=await Uv(g);break;case"json":f=await m.json();break;default:f=await m.text()}const T={};return m.headers.forEach((b,M)=>{T[M]=b}),{data:f,headers:T,status:m.status,url:m.url}}async get(o){return this.request(Object.assign(Object.assign({},o),{method:"GET"}))}async post(o){return this.request(Object.assign(Object.assign({},o),{method:"POST"}))}async put(o){return this.request(Object.assign(Object.assign({},o),{method:"PUT"}))}async patch(o){return this.request(Object.assign(Object.assign({},o),{method:"PATCH"}))}async delete(o){return this.request(Object.assign(Object.assign({},o),{method:"DELETE"}))}}Cd("CapacitorHttp",{web:()=>new Kv});var cy;(function(a){a.Dark="DARK",a.Light="LIGHT",a.Default="DEFAULT"})(cy||(cy={}));var hy;(function(a){a.StatusBar="StatusBar",a.NavigationBar="NavigationBar"})(hy||(hy={}));class Yv extends Ad{async setStyle(){this.unavailable("not available for web")}async setAnimation(){this.unavailable("not available for web")}async show(){this.unavailable("not available for web")}async hide(){this.unavailable("not available for web")}}Cd("SystemBars",{web:()=>new Yv});var $h={exports:{}},xe={};var dy;function Vv(){if(dy)return xe;dy=1;var a=Symbol.for("react.transitional.element"),o=Symbol.for("react.portal"),r=Symbol.for("react.fragment"),h=Symbol.for("react.strict_mode"),d=Symbol.for("react.profiler"),m=Symbol.for("react.consumer"),w=Symbol.for("react.context"),y=Symbol.for("react.forward_ref"),f=Symbol.for("react.suspense"),g=Symbol.for("react.memo"),T=Symbol.for("react.lazy"),b=Symbol.for("react.activity"),M=Symbol.iterator;function E(k){return k===null||typeof k!="object"?null:(k=M&&k[M]||k["@@iterator"],typeof k=="function"?k:null)}var G={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},I=Object.assign,_={};function Q(k,N,K){this.props=k,this.context=N,this.refs=_,this.updater=K||G}Q.prototype.isReactComponent={},Q.prototype.setState=function(k,N){if(typeof k!="object"&&typeof k!="function"&&k!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,k,N,"setState")},Q.prototype.forceUpdate=function(k){this.updater.enqueueForceUpdate(this,k,"forceUpdate")};function ne(){}ne.prototype=Q.prototype;function se(k,N,K){this.props=k,this.context=N,this.refs=_,this.updater=K||G}var ie=se.prototype=new ne;ie.constructor=se,I(ie,Q.prototype),ie.isPureReactComponent=!0;var re=Array.isArray;function F(){}var B={H:null,A:null,T:null,S:null},te=Object.prototype.hasOwnProperty;function ee(k,N,K){var Y=K.ref;return{$$typeof:a,type:k,key:N,ref:Y!==void 0?Y:null,props:K}}function ge(k,N){return ee(k.type,N,k.props)}function j(k){return typeof k=="object"&&k!==null&&k.$$typeof===a}function O(k){var N={"=":"=0",":":"=2"};return"$"+k.replace(/[=:]/g,function(K){return N[K]})}var A=/\/+/g;function X(k,N){return typeof k=="object"&&k!==null&&k.key!=null?O(""+k.key):N.toString(36)}function L(k){switch(k.status){case"fulfilled":return k.value;case"rejected":throw k.reason;default:switch(typeof k.status=="string"?k.then(F,F):(k.status="pending",k.then(function(N){k.status==="pending"&&(k.status="fulfilled",k.value=N)},function(N){k.status==="pending"&&(k.status="rejected",k.reason=N)})),k.status){case"fulfilled":return k.value;case"rejected":throw k.reason}}throw k}function v(k,N,K,Y,he){var we=typeof k;(we==="undefined"||we==="boolean")&&(k=null);var Te=!1;if(k===null)Te=!0;else switch(we){case"bigint":case"string":case"number":Te=!0;break;case"object":switch(k.$$typeof){case a:case o:Te=!0;break;case T:return Te=k._init,v(Te(k._payload),N,K,Y,he)}}if(Te)return he=he(k),Te=Y===""?"."+X(k,0):Y,re(he)?(K="",Te!=null&&(K=Te.replace(A,"$&/")+"/"),v(he,N,K,"",function(Fe){return Fe})):he!=null&&(j(he)&&(he=ge(he,K+(he.key==null||k&&k.key===he.key?"":(""+he.key).replace(A,"$&/")+"/")+Te)),N.push(he)),1;Te=0;var le=Y===""?".":Y+":";if(re(k))for(var be=0;be<k.length;be++)Y=k[be],we=le+X(Y,be),Te+=v(Y,N,K,we,he);else if(be=E(k),typeof be=="function")for(k=be.call(k),be=0;!(Y=k.next()).done;)Y=Y.value,we=le+X(Y,be++),Te+=v(Y,N,K,we,he);else if(we==="object"){if(typeof k.then=="function")return v(L(k),N,K,Y,he);throw N=String(k),Error("Objects are not valid as a React child (found: "+(N==="[object Object]"?"object with keys {"+Object.keys(k).join(", ")+"}":N)+"). If you meant to render a collection of children, use an array instead.")}return Te}function x(k,N,K){if(k==null)return k;var Y=[],he=0;return v(k,Y,"","",function(we){return N.call(K,we,he++)}),Y}function J(k){if(k._status===-1){var N=k._result;N=N(),N.then(function(K){(k._status===0||k._status===-1)&&(k._status=1,k._result=K)},function(K){(k._status===0||k._status===-1)&&(k._status=2,k._result=K)}),k._status===-1&&(k._status=0,k._result=N)}if(k._status===1)return k._result.default;throw k._result}var ae=typeof reportError=="function"?reportError:function(k){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var N=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof k=="object"&&k!==null&&typeof k.message=="string"?String(k.message):String(k),error:k});if(!window.dispatchEvent(N))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",k);return}console.error(k)},R={map:x,forEach:function(k,N,K){x(k,function(){N.apply(this,arguments)},K)},count:function(k){var N=0;return x(k,function(){N++}),N},toArray:function(k){return x(k,function(N){return N})||[]},only:function(k){if(!j(k))throw Error("React.Children.only expected to receive a single React element child.");return k}};return xe.Activity=b,xe.Children=R,xe.Component=Q,xe.Fragment=r,xe.Profiler=d,xe.PureComponent=se,xe.StrictMode=h,xe.Suspense=f,xe.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=B,xe.__COMPILER_RUNTIME={__proto__:null,c:function(k){return B.H.useMemoCache(k)}},xe.cache=function(k){return function(){return k.apply(null,arguments)}},xe.cacheSignal=function(){return null},xe.cloneElement=function(k,N,K){if(k==null)throw Error("The argument must be a React element, but you passed "+k+".");var Y=I({},k.props),he=k.key;if(N!=null)for(we in N.key!==void 0&&(he=""+N.key),N)!te.call(N,we)||we==="key"||we==="__self"||we==="__source"||we==="ref"&&N.ref===void 0||(Y[we]=N[we]);var we=arguments.length-2;if(we===1)Y.children=K;else if(1<we){for(var Te=Array(we),le=0;le<we;le++)Te[le]=arguments[le+2];Y.children=Te}return ee(k.type,he,Y)},xe.createContext=function(k){return k={$$typeof:w,_currentValue:k,_currentValue2:k,_threadCount:0,Provider:null,Consumer:null},k.Provider=k,k.Consumer={$$typeof:m,_context:k},k},xe.createElement=function(k,N,K){var Y,he={},we=null;if(N!=null)for(Y in N.key!==void 0&&(we=""+N.key),N)te.call(N,Y)&&Y!=="key"&&Y!=="__self"&&Y!=="__source"&&(he[Y]=N[Y]);var Te=arguments.length-2;if(Te===1)he.children=K;else if(1<Te){for(var le=Array(Te),be=0;be<Te;be++)le[be]=arguments[be+2];he.children=le}if(k&&k.defaultProps)for(Y in Te=k.defaultProps,Te)he[Y]===void 0&&(he[Y]=Te[Y]);return ee(k,we,he)},xe.createRef=function(){return{current:null}},xe.forwardRef=function(k){return{$$typeof:y,render:k}},xe.isValidElement=j,xe.lazy=function(k){return{$$typeof:T,_payload:{_status:-1,_result:k},_init:J}},xe.memo=function(k,N){return{$$typeof:g,type:k,compare:N===void 0?null:N}},xe.startTransition=function(k){var N=B.T,K={};B.T=K;try{var Y=k(),he=B.S;he!==null&&he(K,Y),typeof Y=="object"&&Y!==null&&typeof Y.then=="function"&&Y.then(F,ae)}catch(we){ae(we)}finally{N!==null&&K.types!==null&&(N.types=K.types),B.T=N}},xe.unstable_useCacheRefresh=function(){return B.H.useCacheRefresh()},xe.use=function(k){return B.H.use(k)},xe.useActionState=function(k,N,K){return B.H.useActionState(k,N,K)},xe.useCallback=function(k,N){return B.H.useCallback(k,N)},xe.useContext=function(k){return B.H.useContext(k)},xe.useDebugValue=function(){},xe.useDeferredValue=function(k,N){return B.H.useDeferredValue(k,N)},xe.useEffect=function(k,N){return B.H.useEffect(k,N)},xe.useEffectEvent=function(k){return B.H.useEffectEvent(k)},xe.useId=function(){return B.H.useId()},xe.useImperativeHandle=function(k,N,K){return B.H.useImperativeHandle(k,N,K)},xe.useInsertionEffect=function(k,N){return B.H.useInsertionEffect(k,N)},xe.useLayoutEffect=function(k,N){return B.H.useLayoutEffect(k,N)},xe.useMemo=function(k,N){return B.H.useMemo(k,N)},xe.useOptimistic=function(k,N){return B.H.useOptimistic(k,N)},xe.useReducer=function(k,N,K){return B.H.useReducer(k,N,K)},xe.useRef=function(k){return B.H.useRef(k)},xe.useState=function(k){return B.H.useState(k)},xe.useSyncExternalStore=function(k,N,K){return B.H.useSyncExternalStore(k,N,K)},xe.useTransition=function(){return B.H.useTransition()},xe.version="19.2.8",xe}var uy;function Nd(){return uy||(uy=1,$h.exports=Vv()),$h.exports}var W=Nd(),Kh={exports:{}},fo={},Yh={exports:{}},Vh={};var my;function Xv(){return my||(my=1,(function(a){function o(v,x){var J=v.length;v.push(x);e:for(;0<J;){var ae=J-1>>>1,R=v[ae];if(0<d(R,x))v[ae]=x,v[J]=R,J=ae;else break e}}function r(v){return v.length===0?null:v[0]}function h(v){if(v.length===0)return null;var x=v[0],J=v.pop();if(J!==x){v[0]=J;e:for(var ae=0,R=v.length,k=R>>>1;ae<k;){var N=2*(ae+1)-1,K=v[N],Y=N+1,he=v[Y];if(0>d(K,J))Y<R&&0>d(he,K)?(v[ae]=he,v[Y]=J,ae=Y):(v[ae]=K,v[N]=J,ae=N);else if(Y<R&&0>d(he,J))v[ae]=he,v[Y]=J,ae=Y;else break e}}return x}function d(v,x){var J=v.sortIndex-x.sortIndex;return J!==0?J:v.id-x.id}if(a.unstable_now=void 0,typeof performance=="object"&&typeof performance.now=="function"){var m=performance;a.unstable_now=function(){return m.now()}}else{var w=Date,y=w.now();a.unstable_now=function(){return w.now()-y}}var f=[],g=[],T=1,b=null,M=3,E=!1,G=!1,I=!1,_=!1,Q=typeof setTimeout=="function"?setTimeout:null,ne=typeof clearTimeout=="function"?clearTimeout:null,se=typeof setImmediate<"u"?setImmediate:null;function ie(v){for(var x=r(g);x!==null;){if(x.callback===null)h(g);else if(x.startTime<=v)h(g),x.sortIndex=x.expirationTime,o(f,x);else break;x=r(g)}}function re(v){if(I=!1,ie(v),!G)if(r(f)!==null)G=!0,F||(F=!0,O());else{var x=r(g);x!==null&&L(re,x.startTime-v)}}var F=!1,B=-1,te=5,ee=-1;function ge(){return _?!0:!(a.unstable_now()-ee<te)}function j(){if(_=!1,F){var v=a.unstable_now();ee=v;var x=!0;try{e:{G=!1,I&&(I=!1,ne(B),B=-1),E=!0;var J=M;try{t:{for(ie(v),b=r(f);b!==null&&!(b.expirationTime>v&&ge());){var ae=b.callback;if(typeof ae=="function"){b.callback=null,M=b.priorityLevel;var R=ae(b.expirationTime<=v);if(v=a.unstable_now(),typeof R=="function"){b.callback=R,ie(v),x=!0;break t}b===r(f)&&h(f),ie(v)}else h(f);b=r(f)}if(b!==null)x=!0;else{var k=r(g);k!==null&&L(re,k.startTime-v),x=!1}}break e}finally{b=null,M=J,E=!1}x=void 0}}finally{x?O():F=!1}}}var O;if(typeof se=="function")O=function(){se(j)};else if(typeof MessageChannel<"u"){var A=new MessageChannel,X=A.port2;A.port1.onmessage=j,O=function(){X.postMessage(null)}}else O=function(){Q(j,0)};function L(v,x){B=Q(function(){v(a.unstable_now())},x)}a.unstable_IdlePriority=5,a.unstable_ImmediatePriority=1,a.unstable_LowPriority=4,a.unstable_NormalPriority=3,a.unstable_Profiling=null,a.unstable_UserBlockingPriority=2,a.unstable_cancelCallback=function(v){v.callback=null},a.unstable_forceFrameRate=function(v){0>v||125<v?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):te=0<v?Math.floor(1e3/v):5},a.unstable_getCurrentPriorityLevel=function(){return M},a.unstable_next=function(v){switch(M){case 1:case 2:case 3:var x=3;break;default:x=M}var J=M;M=x;try{return v()}finally{M=J}},a.unstable_requestPaint=function(){_=!0},a.unstable_runWithPriority=function(v,x){switch(v){case 1:case 2:case 3:case 4:case 5:break;default:v=3}var J=M;M=v;try{return x()}finally{M=J}},a.unstable_scheduleCallback=function(v,x,J){var ae=a.unstable_now();switch(typeof J=="object"&&J!==null?(J=J.delay,J=typeof J=="number"&&0<J?ae+J:ae):J=ae,v){case 1:var R=-1;break;case 2:R=250;break;case 5:R=1073741823;break;case 4:R=1e4;break;default:R=5e3}return R=J+R,v={id:T++,callback:x,priorityLevel:v,startTime:J,expirationTime:R,sortIndex:-1},J>ae?(v.sortIndex=J,o(g,v),r(f)===null&&v===r(g)&&(I?(ne(B),B=-1):I=!0,L(re,J-ae))):(v.sortIndex=R,o(f,v),G||E||(G=!0,F||(F=!0,O()))),v},a.unstable_shouldYield=ge,a.unstable_wrapCallback=function(v){var x=M;return function(){var J=M;M=x;try{return v.apply(this,arguments)}finally{M=J}}}})(Vh)),Vh}var py;function Qv(){return py||(py=1,Yh.exports=Xv()),Yh.exports}var Xh={exports:{}},Gt={};var fy;function Zv(){if(fy)return Gt;fy=1;var a=Nd();function o(f){var g="https://react.dev/errors/"+f;if(1<arguments.length){g+="?args[]="+encodeURIComponent(arguments[1]);for(var T=2;T<arguments.length;T++)g+="&args[]="+encodeURIComponent(arguments[T])}return"Minified React error #"+f+"; visit "+g+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function r(){}var h={d:{f:r,r:function(){throw Error(o(522))},D:r,C:r,L:r,m:r,X:r,S:r,M:r},p:0,findDOMNode:null},d=Symbol.for("react.portal");function m(f,g,T){var b=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:d,key:b==null?null:""+b,children:f,containerInfo:g,implementation:T}}var w=a.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function y(f,g){if(f==="font")return"";if(typeof g=="string")return g==="use-credentials"?g:""}return Gt.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=h,Gt.createPortal=function(f,g){var T=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!g||g.nodeType!==1&&g.nodeType!==9&&g.nodeType!==11)throw Error(o(299));return m(f,g,null,T)},Gt.flushSync=function(f){var g=w.T,T=h.p;try{if(w.T=null,h.p=2,f)return f()}finally{w.T=g,h.p=T,h.d.f()}},Gt.preconnect=function(f,g){typeof f=="string"&&(g?(g=g.crossOrigin,g=typeof g=="string"?g==="use-credentials"?g:"":void 0):g=null,h.d.C(f,g))},Gt.prefetchDNS=function(f){typeof f=="string"&&h.d.D(f)},Gt.preinit=function(f,g){if(typeof f=="string"&&g&&typeof g.as=="string"){var T=g.as,b=y(T,g.crossOrigin),M=typeof g.integrity=="string"?g.integrity:void 0,E=typeof g.fetchPriority=="string"?g.fetchPriority:void 0;T==="style"?h.d.S(f,typeof g.precedence=="string"?g.precedence:void 0,{crossOrigin:b,integrity:M,fetchPriority:E}):T==="script"&&h.d.X(f,{crossOrigin:b,integrity:M,fetchPriority:E,nonce:typeof g.nonce=="string"?g.nonce:void 0})}},Gt.preinitModule=function(f,g){if(typeof f=="string")if(typeof g=="object"&&g!==null){if(g.as==null||g.as==="script"){var T=y(g.as,g.crossOrigin);h.d.M(f,{crossOrigin:T,integrity:typeof g.integrity=="string"?g.integrity:void 0,nonce:typeof g.nonce=="string"?g.nonce:void 0})}}else g==null&&h.d.M(f)},Gt.preload=function(f,g){if(typeof f=="string"&&typeof g=="object"&&g!==null&&typeof g.as=="string"){var T=g.as,b=y(T,g.crossOrigin);h.d.L(f,T,{crossOrigin:b,integrity:typeof g.integrity=="string"?g.integrity:void 0,nonce:typeof g.nonce=="string"?g.nonce:void 0,type:typeof g.type=="string"?g.type:void 0,fetchPriority:typeof g.fetchPriority=="string"?g.fetchPriority:void 0,referrerPolicy:typeof g.referrerPolicy=="string"?g.referrerPolicy:void 0,imageSrcSet:typeof g.imageSrcSet=="string"?g.imageSrcSet:void 0,imageSizes:typeof g.imageSizes=="string"?g.imageSizes:void 0,media:typeof g.media=="string"?g.media:void 0})}},Gt.preloadModule=function(f,g){if(typeof f=="string")if(g){var T=y(g.as,g.crossOrigin);h.d.m(f,{as:typeof g.as=="string"&&g.as!=="script"?g.as:void 0,crossOrigin:T,integrity:typeof g.integrity=="string"?g.integrity:void 0})}else h.d.m(f)},Gt.requestFormReset=function(f){h.d.r(f)},Gt.unstable_batchedUpdates=function(f,g){return f(g)},Gt.useFormState=function(f,g,T){return w.H.useFormState(f,g,T)},Gt.useFormStatus=function(){return w.H.useHostTransitionStatus()},Gt.version="19.2.8",Gt}var yy;function lg(){if(yy)return Xh.exports;yy=1;function a(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(a)}catch(o){console.error(o)}}return a(),Xh.exports=Zv(),Xh.exports}var gy;function ek(){if(gy)return fo;gy=1;var a=Qv(),o=Nd(),r=lg();function h(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)t+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function d(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function m(e){var t=e,n=e;if(e.alternate)for(;t.return;)t=t.return;else{e=t;do t=e,(t.flags&4098)!==0&&(n=t.return),e=t.return;while(e)}return t.tag===3?n:null}function w(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function y(e){if(e.tag===31){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function f(e){if(m(e)!==e)throw Error(h(188))}function g(e){var t=e.alternate;if(!t){if(t=m(e),t===null)throw Error(h(188));return t!==e?null:e}for(var n=e,i=t;;){var l=n.return;if(l===null)break;var c=l.alternate;if(c===null){if(i=l.return,i!==null){n=i;continue}break}if(l.child===c.child){for(c=l.child;c;){if(c===n)return f(l),e;if(c===i)return f(l),t;c=c.sibling}throw Error(h(188))}if(n.return!==i.return)n=l,i=c;else{for(var u=!1,p=l.child;p;){if(p===n){u=!0,n=l,i=c;break}if(p===i){u=!0,i=l,n=c;break}p=p.sibling}if(!u){for(p=c.child;p;){if(p===n){u=!0,n=c,i=l;break}if(p===i){u=!0,i=c,n=l;break}p=p.sibling}if(!u)throw Error(h(189))}}if(n.alternate!==i)throw Error(h(190))}if(n.tag!==3)throw Error(h(188));return n.stateNode.current===n?e:t}function T(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e;for(e=e.child;e!==null;){if(t=T(e),t!==null)return t;e=e.sibling}return null}var b=Object.assign,M=Symbol.for("react.element"),E=Symbol.for("react.transitional.element"),G=Symbol.for("react.portal"),I=Symbol.for("react.fragment"),_=Symbol.for("react.strict_mode"),Q=Symbol.for("react.profiler"),ne=Symbol.for("react.consumer"),se=Symbol.for("react.context"),ie=Symbol.for("react.forward_ref"),re=Symbol.for("react.suspense"),F=Symbol.for("react.suspense_list"),B=Symbol.for("react.memo"),te=Symbol.for("react.lazy"),ee=Symbol.for("react.activity"),ge=Symbol.for("react.memo_cache_sentinel"),j=Symbol.iterator;function O(e){return e===null||typeof e!="object"?null:(e=j&&e[j]||e["@@iterator"],typeof e=="function"?e:null)}var A=Symbol.for("react.client.reference");function X(e){if(e==null)return null;if(typeof e=="function")return e.$$typeof===A?null:e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case I:return"Fragment";case Q:return"Profiler";case _:return"StrictMode";case re:return"Suspense";case F:return"SuspenseList";case ee:return"Activity"}if(typeof e=="object")switch(e.$$typeof){case G:return"Portal";case se:return e.displayName||"Context";case ne:return(e._context.displayName||"Context")+".Consumer";case ie:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case B:return t=e.displayName||null,t!==null?t:X(e.type)||"Memo";case te:t=e._payload,e=e._init;try{return X(e(t))}catch{}}return null}var L=Array.isArray,v=o.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,x=r.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,J={pending:!1,data:null,method:null,action:null},ae=[],R=-1;function k(e){return{current:e}}function N(e){0>R||(e.current=ae[R],ae[R]=null,R--)}function K(e,t){R++,ae[R]=e.current,e.current=t}var Y=k(null),he=k(null),we=k(null),Te=k(null);function le(e,t){switch(K(we,t),K(he,e),K(Y,null),t.nodeType){case 9:case 11:e=(e=t.documentElement)&&(e=e.namespaceURI)?Af(e):0;break;default:if(e=t.tagName,t=t.namespaceURI)t=Af(t),e=Nf(t,e);else switch(e){case"svg":e=1;break;case"math":e=2;break;default:e=0}}N(Y),K(Y,e)}function be(){N(Y),N(he),N(we)}function Fe(e){e.memoizedState!==null&&K(Te,e);var t=Y.current,n=Nf(t,e.type);t!==n&&(K(he,e),K(Y,n))}function ue(e){he.current===e&&(N(Y),N(he)),Te.current===e&&(N(Te),co._currentValue=J)}var Pe,_e;function ce(e){if(Pe===void 0)try{throw Error()}catch(n){var t=n.stack.trim().match(/\n( *(at )?)/);Pe=t&&t[1]||"",_e=-1<n.stack.indexOf(`
    at`)?" (<anonymous>)":-1<n.stack.indexOf("@")?"@unknown:0:0":""}return`
`+Pe+e+_e}var pe=!1;function Ae(e,t){if(!e||pe)return"";pe=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var i={DetermineComponentFrameRoot:function(){try{if(t){var V=function(){throw Error()};if(Object.defineProperty(V.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(V,[])}catch(z){var P=z}Reflect.construct(e,[],V)}else{try{V.call()}catch(z){P=z}e.call(V.prototype)}}else{try{throw Error()}catch(z){P=z}(V=e())&&typeof V.catch=="function"&&V.catch(function(){})}}catch(z){if(z&&P&&typeof z.stack=="string")return[z.stack,P.stack]}return[null,null]}};i.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var l=Object.getOwnPropertyDescriptor(i.DetermineComponentFrameRoot,"name");l&&l.configurable&&Object.defineProperty(i.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var c=i.DetermineComponentFrameRoot(),u=c[0],p=c[1];if(u&&p){var S=u.split(`
`),D=p.split(`
`);for(l=i=0;i<S.length&&!S[i].includes("DetermineComponentFrameRoot");)i++;for(;l<D.length&&!D[l].includes("DetermineComponentFrameRoot");)l++;if(i===S.length||l===D.length)for(i=S.length-1,l=D.length-1;1<=i&&0<=l&&S[i]!==D[l];)l--;for(;1<=i&&0<=l;i--,l--)if(S[i]!==D[l]){if(i!==1||l!==1)do if(i--,l--,0>l||S[i]!==D[l]){var U=`
`+S[i].replace(" at new "," at ");return e.displayName&&U.includes("<anonymous>")&&(U=U.replace("<anonymous>",e.displayName)),U}while(1<=i&&0<=l);break}}}finally{pe=!1,Error.prepareStackTrace=n}return(n=e?e.displayName||e.name:"")?ce(n):""}function Oe(e,t){switch(e.tag){case 26:case 27:case 5:return ce(e.type);case 16:return ce("Lazy");case 13:return e.child!==t&&t!==null?ce("Suspense Fallback"):ce("Suspense");case 19:return ce("SuspenseList");case 0:case 15:return Ae(e.type,!1);case 11:return Ae(e.type.render,!1);case 1:return Ae(e.type,!0);case 31:return ce("Activity");default:return""}}function ht(e){try{var t="",n=null;do t+=Oe(e,n),n=e,e=e.return;while(e);return t}catch(i){return`
Error generating stack: `+i.message+`
`+i.stack}}var yt=Object.prototype.hasOwnProperty,_t=a.unstable_scheduleCallback,Lt=a.unstable_cancelCallback,nt=a.unstable_shouldYield,Pt=a.unstable_requestPaint,Tt=a.unstable_now,oe=a.unstable_getCurrentPriorityLevel,je=a.unstable_ImmediatePriority,De=a.unstable_UserBlockingPriority,xt=a.unstable_NormalPriority,tn=a.unstable_LowPriority,dt=a.unstable_IdlePriority,gt=a.log,En=a.unstable_setDisableYieldValue,un=null,rt=null;function Ut(e){if(typeof gt=="function"&&En(e),rt&&typeof rt.setStrictMode=="function")try{rt.setStrictMode(un,e)}catch{}}var Ne=Math.clz32?Math.clz32:lt,ha=Math.log,gs=Math.LN2;function lt(e){return e>>>=0,e===0?32:31-(ha(e)/gs|0)|0}var Mn=256,Bo=262144,Fo=4194304;function Ja(e){var t=e&42;if(t!==0)return t;switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return e&261888;case 262144:case 524288:case 1048576:case 2097152:return e&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return e&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return e}}function $o(e,t,n){var i=e.pendingLanes;if(i===0)return 0;var l=0,c=e.suspendedLanes,u=e.pingedLanes;e=e.warmLanes;var p=i&134217727;return p!==0?(i=p&~c,i!==0?l=Ja(i):(u&=p,u!==0?l=Ja(u):n||(n=p&~e,n!==0&&(l=Ja(n))))):(p=i&~c,p!==0?l=Ja(p):u!==0?l=Ja(u):n||(n=i&~e,n!==0&&(l=Ja(n)))),l===0?0:t!==0&&t!==l&&(t&c)===0&&(c=l&-l,n=t&-t,c>=n||c===32&&(n&4194048)!==0)?t:l}function Ti(e,t){return(e.pendingLanes&~(e.suspendedLanes&~e.pingedLanes)&t)===0}function jw(e,t){switch(e){case 1:case 2:case 4:case 8:case 64:return t+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function lu(){var e=Fo;return Fo<<=1,(Fo&62914560)===0&&(Fo=4194304),e}function Wl(e){for(var t=[],n=0;31>n;n++)t.push(e);return t}function xi(e,t){e.pendingLanes|=t,t!==268435456&&(e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0)}function Mw(e,t,n,i,l,c){var u=e.pendingLanes;e.pendingLanes=n,e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0,e.expiredLanes&=n,e.entangledLanes&=n,e.errorRecoveryDisabledLanes&=n,e.shellSuspendCounter=0;var p=e.entanglements,S=e.expirationTimes,D=e.hiddenUpdates;for(n=u&~n;0<n;){var U=31-Ne(n),V=1<<U;p[U]=0,S[U]=-1;var P=D[U];if(P!==null)for(D[U]=null,U=0;U<P.length;U++){var z=P[U];z!==null&&(z.lane&=-536870913)}n&=~V}i!==0&&cu(e,i,0),c!==0&&l===0&&e.tag!==0&&(e.suspendedLanes|=c&~(u&~t))}function cu(e,t,n){e.pendingLanes|=t,e.suspendedLanes&=~t;var i=31-Ne(t);e.entangledLanes|=t,e.entanglements[i]=e.entanglements[i]|1073741824|n&261930}function hu(e,t){var n=e.entangledLanes|=t;for(e=e.entanglements;n;){var i=31-Ne(n),l=1<<i;l&t|e[i]&t&&(e[i]|=t),n&=~l}}function du(e,t){var n=t&-t;return n=(n&42)!==0?1:Il(n),(n&(e.suspendedLanes|t))!==0?0:n}function Il(e){switch(e){case 2:e=1;break;case 8:e=4;break;case 32:e=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:e=128;break;case 268435456:e=134217728;break;default:e=0}return e}function Ol(e){return e&=-e,2<e?8<e?(e&134217727)!==0?32:268435456:8:2}function uu(){var e=x.p;return e!==0?e:(e=window.event,e===void 0?32:Qf(e.type))}function mu(e,t){var n=x.p;try{return x.p=e,t()}finally{x.p=n}}var da=Math.random().toString(36).slice(2),Et="__reactFiber$"+da,Bt="__reactProps$"+da,ws="__reactContainer$"+da,Rl="__reactEvents$"+da,Cw="__reactListeners$"+da,Aw="__reactHandles$"+da,pu="__reactResources$"+da,Si="__reactMarker$"+da;function ql(e){delete e[Et],delete e[Bt],delete e[Rl],delete e[Cw],delete e[Aw]}function bs(e){var t=e[Et];if(t)return t;for(var n=e.parentNode;n;){if(t=n[ws]||n[Et]){if(n=t.alternate,t.child!==null||n!==null&&n.child!==null)for(e=Rf(e);e!==null;){if(n=e[Et])return n;e=Rf(e)}return t}e=n,n=e.parentNode}return null}function vs(e){if(e=e[Et]||e[ws]){var t=e.tag;if(t===5||t===6||t===13||t===31||t===26||t===27||t===3)return e}return null}function ji(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e.stateNode;throw Error(h(33))}function ks(e){var t=e[pu];return t||(t=e[pu]={hoistableStyles:new Map,hoistableScripts:new Map}),t}function Mt(e){e[Si]=!0}var fu=new Set,yu={};function _a(e,t){Ts(e,t),Ts(e+"Capture",t)}function Ts(e,t){for(yu[e]=t,e=0;e<t.length;e++)fu.add(t[e])}var Nw=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),gu={},wu={};function Lw(e){return yt.call(wu,e)?!0:yt.call(gu,e)?!1:Nw.test(e)?wu[e]=!0:(gu[e]=!0,!1)}function Ko(e,t,n){if(Lw(t))if(n===null)e.removeAttribute(t);else{switch(typeof n){case"undefined":case"function":case"symbol":e.removeAttribute(t);return;case"boolean":var i=t.toLowerCase().slice(0,5);if(i!=="data-"&&i!=="aria-"){e.removeAttribute(t);return}}e.setAttribute(t,""+n)}}function Yo(e,t,n){if(n===null)e.removeAttribute(t);else{switch(typeof n){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(t);return}e.setAttribute(t,""+n)}}function Jn(e,t,n,i){if(i===null)e.removeAttribute(n);else{switch(typeof i){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(n);return}e.setAttributeNS(t,n,""+i)}}function mn(e){switch(typeof e){case"bigint":case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function bu(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function Ew(e,t,n){var i=Object.getOwnPropertyDescriptor(e.constructor.prototype,t);if(!e.hasOwnProperty(t)&&typeof i<"u"&&typeof i.get=="function"&&typeof i.set=="function"){var l=i.get,c=i.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return l.call(this)},set:function(u){n=""+u,c.call(this,u)}}),Object.defineProperty(e,t,{enumerable:i.enumerable}),{getValue:function(){return n},setValue:function(u){n=""+u},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function Dl(e){if(!e._valueTracker){var t=bu(e)?"checked":"value";e._valueTracker=Ew(e,t,""+e[t])}}function vu(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var n=t.getValue(),i="";return e&&(i=bu(e)?e.checked?"true":"false":e.value),e=i,e!==n?(t.setValue(e),!0):!1}function Vo(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}var Hw=/[\n"\\]/g;function pn(e){return e.replace(Hw,function(t){return"\\"+t.charCodeAt(0).toString(16)+" "})}function Pl(e,t,n,i,l,c,u,p){e.name="",u!=null&&typeof u!="function"&&typeof u!="symbol"&&typeof u!="boolean"?e.type=u:e.removeAttribute("type"),t!=null?u==="number"?(t===0&&e.value===""||e.value!=t)&&(e.value=""+mn(t)):e.value!==""+mn(t)&&(e.value=""+mn(t)):u!=="submit"&&u!=="reset"||e.removeAttribute("value"),t!=null?Gl(e,u,mn(t)):n!=null?Gl(e,u,mn(n)):i!=null&&e.removeAttribute("value"),l==null&&c!=null&&(e.defaultChecked=!!c),l!=null&&(e.checked=l&&typeof l!="function"&&typeof l!="symbol"),p!=null&&typeof p!="function"&&typeof p!="symbol"&&typeof p!="boolean"?e.name=""+mn(p):e.removeAttribute("name")}function ku(e,t,n,i,l,c,u,p){if(c!=null&&typeof c!="function"&&typeof c!="symbol"&&typeof c!="boolean"&&(e.type=c),t!=null||n!=null){if(!(c!=="submit"&&c!=="reset"||t!=null)){Dl(e);return}n=n!=null?""+mn(n):"",t=t!=null?""+mn(t):n,p||t===e.value||(e.value=t),e.defaultValue=t}i=i??l,i=typeof i!="function"&&typeof i!="symbol"&&!!i,e.checked=p?e.checked:!!i,e.defaultChecked=!!i,u!=null&&typeof u!="function"&&typeof u!="symbol"&&typeof u!="boolean"&&(e.name=u),Dl(e)}function Gl(e,t,n){t==="number"&&Vo(e.ownerDocument)===e||e.defaultValue===""+n||(e.defaultValue=""+n)}function xs(e,t,n,i){if(e=e.options,t){t={};for(var l=0;l<n.length;l++)t["$"+n[l]]=!0;for(n=0;n<e.length;n++)l=t.hasOwnProperty("$"+e[n].value),e[n].selected!==l&&(e[n].selected=l),l&&i&&(e[n].defaultSelected=!0)}else{for(n=""+mn(n),t=null,l=0;l<e.length;l++){if(e[l].value===n){e[l].selected=!0,i&&(e[l].defaultSelected=!0);return}t!==null||e[l].disabled||(t=e[l])}t!==null&&(t.selected=!0)}}function Tu(e,t,n){if(t!=null&&(t=""+mn(t),t!==e.value&&(e.value=t),n==null)){e.defaultValue!==t&&(e.defaultValue=t);return}e.defaultValue=n!=null?""+mn(n):""}function xu(e,t,n,i){if(t==null){if(i!=null){if(n!=null)throw Error(h(92));if(L(i)){if(1<i.length)throw Error(h(93));i=i[0]}n=i}n==null&&(n=""),t=n}n=mn(t),e.defaultValue=n,i=e.textContent,i===n&&i!==""&&i!==null&&(e.value=i),Dl(e)}function Ss(e,t){if(t){var n=e.firstChild;if(n&&n===e.lastChild&&n.nodeType===3){n.nodeValue=t;return}}e.textContent=t}var Ww=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function Su(e,t,n){var i=t.indexOf("--")===0;n==null||typeof n=="boolean"||n===""?i?e.setProperty(t,""):t==="float"?e.cssFloat="":e[t]="":i?e.setProperty(t,n):typeof n!="number"||n===0||Ww.has(t)?t==="float"?e.cssFloat=n:e[t]=(""+n).trim():e[t]=n+"px"}function ju(e,t,n){if(t!=null&&typeof t!="object")throw Error(h(62));if(e=e.style,n!=null){for(var i in n)!n.hasOwnProperty(i)||t!=null&&t.hasOwnProperty(i)||(i.indexOf("--")===0?e.setProperty(i,""):i==="float"?e.cssFloat="":e[i]="");for(var l in t)i=t[l],t.hasOwnProperty(l)&&n[l]!==i&&Su(e,l,i)}else for(var c in t)t.hasOwnProperty(c)&&Su(e,c,t[c])}function zl(e){if(e.indexOf("-")===-1)return!1;switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var Iw=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),Ow=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function Xo(e){return Ow.test(""+e)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":e}function _n(){}var Jl=null;function _l(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var js=null,Ms=null;function Mu(e){var t=vs(e);if(t&&(e=t.stateNode)){var n=e[Bt]||null;e:switch(e=t.stateNode,t.type){case"input":if(Pl(e,n.value,n.defaultValue,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name),t=n.name,n.type==="radio"&&t!=null){for(n=e;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll('input[name="'+pn(""+t)+'"][type="radio"]'),t=0;t<n.length;t++){var i=n[t];if(i!==e&&i.form===e.form){var l=i[Bt]||null;if(!l)throw Error(h(90));Pl(i,l.value,l.defaultValue,l.defaultValue,l.checked,l.defaultChecked,l.type,l.name)}}for(t=0;t<n.length;t++)i=n[t],i.form===e.form&&vu(i)}break e;case"textarea":Tu(e,n.value,n.defaultValue);break e;case"select":t=n.value,t!=null&&xs(e,!!n.multiple,t,!1)}}}var Ul=!1;function Cu(e,t,n){if(Ul)return e(t,n);Ul=!0;try{var i=e(t);return i}finally{if(Ul=!1,(js!==null||Ms!==null)&&(Dr(),js&&(t=js,e=Ms,Ms=js=null,Mu(t),e)))for(t=0;t<e.length;t++)Mu(e[t])}}function Mi(e,t){var n=e.stateNode;if(n===null)return null;var i=n[Bt]||null;if(i===null)return null;n=i[t];e:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(i=!i.disabled)||(e=e.type,i=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!i;break e;default:e=!1}if(e)return null;if(n&&typeof n!="function")throw Error(h(231,t,typeof n));return n}var Un=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),Bl=!1;if(Un)try{var Ci={};Object.defineProperty(Ci,"passive",{get:function(){Bl=!0}}),window.addEventListener("test",Ci,Ci),window.removeEventListener("test",Ci,Ci)}catch{Bl=!1}var ua=null,Fl=null,Qo=null;function Au(){if(Qo)return Qo;var e,t=Fl,n=t.length,i,l="value"in ua?ua.value:ua.textContent,c=l.length;for(e=0;e<n&&t[e]===l[e];e++);var u=n-e;for(i=1;i<=u&&t[n-i]===l[c-i];i++);return Qo=l.slice(e,1<i?1-i:void 0)}function Zo(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function er(){return!0}function Nu(){return!1}function Ft(e){function t(n,i,l,c,u){this._reactName=n,this._targetInst=l,this.type=i,this.nativeEvent=c,this.target=u,this.currentTarget=null;for(var p in e)e.hasOwnProperty(p)&&(n=e[p],this[p]=n?n(c):c[p]);return this.isDefaultPrevented=(c.defaultPrevented!=null?c.defaultPrevented:c.returnValue===!1)?er:Nu,this.isPropagationStopped=Nu,this}return b(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=er)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=er)},persist:function(){},isPersistent:er}),t}var Ua={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},tr=Ft(Ua),Ai=b({},Ua,{view:0,detail:0}),Rw=Ft(Ai),$l,Kl,Ni,nr=b({},Ai,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Vl,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==Ni&&(Ni&&e.type==="mousemove"?($l=e.screenX-Ni.screenX,Kl=e.screenY-Ni.screenY):Kl=$l=0,Ni=e),$l)},movementY:function(e){return"movementY"in e?e.movementY:Kl}}),Lu=Ft(nr),qw=b({},nr,{dataTransfer:0}),Dw=Ft(qw),Pw=b({},Ai,{relatedTarget:0}),Yl=Ft(Pw),Gw=b({},Ua,{animationName:0,elapsedTime:0,pseudoElement:0}),zw=Ft(Gw),Jw=b({},Ua,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),_w=Ft(Jw),Uw=b({},Ua,{data:0}),Eu=Ft(Uw),Bw={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},Fw={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},$w={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function Kw(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=$w[e])?!!t[e]:!1}function Vl(){return Kw}var Yw=b({},Ai,{key:function(e){if(e.key){var t=Bw[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=Zo(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?Fw[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Vl,charCode:function(e){return e.type==="keypress"?Zo(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?Zo(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),Vw=Ft(Yw),Xw=b({},nr,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Hu=Ft(Xw),Qw=b({},Ai,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Vl}),Zw=Ft(Qw),eb=b({},Ua,{propertyName:0,elapsedTime:0,pseudoElement:0}),tb=Ft(eb),nb=b({},nr,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),ab=Ft(nb),sb=b({},Ua,{newState:0,oldState:0}),ib=Ft(sb),ob=[9,13,27,32],Xl=Un&&"CompositionEvent"in window,Li=null;Un&&"documentMode"in document&&(Li=document.documentMode);var rb=Un&&"TextEvent"in window&&!Li,Wu=Un&&(!Xl||Li&&8<Li&&11>=Li),Iu=" ",Ou=!1;function Ru(e,t){switch(e){case"keyup":return ob.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function qu(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var Cs=!1;function lb(e,t){switch(e){case"compositionend":return qu(t);case"keypress":return t.which!==32?null:(Ou=!0,Iu);case"textInput":return e=t.data,e===Iu&&Ou?null:e;default:return null}}function cb(e,t){if(Cs)return e==="compositionend"||!Xl&&Ru(e,t)?(e=Au(),Qo=Fl=ua=null,Cs=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return Wu&&t.locale!=="ko"?null:t.data;default:return null}}var hb={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Du(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!hb[e.type]:t==="textarea"}function Pu(e,t,n,i){js?Ms?Ms.push(i):Ms=[i]:js=i,t=Br(t,"onChange"),0<t.length&&(n=new tr("onChange","change",null,n,i),e.push({event:n,listeners:t}))}var Ei=null,Hi=null;function db(e){Tf(e,0)}function ar(e){var t=ji(e);if(vu(t))return e}function Gu(e,t){if(e==="change")return t}var zu=!1;if(Un){var Ql;if(Un){var Zl="oninput"in document;if(!Zl){var Ju=document.createElement("div");Ju.setAttribute("oninput","return;"),Zl=typeof Ju.oninput=="function"}Ql=Zl}else Ql=!1;zu=Ql&&(!document.documentMode||9<document.documentMode)}function _u(){Ei&&(Ei.detachEvent("onpropertychange",Uu),Hi=Ei=null)}function Uu(e){if(e.propertyName==="value"&&ar(Hi)){var t=[];Pu(t,Hi,e,_l(e)),Cu(db,t)}}function ub(e,t,n){e==="focusin"?(_u(),Ei=t,Hi=n,Ei.attachEvent("onpropertychange",Uu)):e==="focusout"&&_u()}function mb(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return ar(Hi)}function pb(e,t){if(e==="click")return ar(t)}function fb(e,t){if(e==="input"||e==="change")return ar(t)}function yb(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var nn=typeof Object.is=="function"?Object.is:yb;function Wi(e,t){if(nn(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var n=Object.keys(e),i=Object.keys(t);if(n.length!==i.length)return!1;for(i=0;i<n.length;i++){var l=n[i];if(!yt.call(t,l)||!nn(e[l],t[l]))return!1}return!0}function Bu(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function Fu(e,t){var n=Bu(e);e=0;for(var i;n;){if(n.nodeType===3){if(i=e+n.textContent.length,e<=t&&i>=t)return{node:n,offset:t-e};e=i}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=Bu(n)}}function $u(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?$u(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function Ku(e){e=e!=null&&e.ownerDocument!=null&&e.ownerDocument.defaultView!=null?e.ownerDocument.defaultView:window;for(var t=Vo(e.document);t instanceof e.HTMLIFrameElement;){try{var n=typeof t.contentWindow.location.href=="string"}catch{n=!1}if(n)e=t.contentWindow;else break;t=Vo(e.document)}return t}function ec(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}var gb=Un&&"documentMode"in document&&11>=document.documentMode,As=null,tc=null,Ii=null,nc=!1;function Yu(e,t,n){var i=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;nc||As==null||As!==Vo(i)||(i=As,"selectionStart"in i&&ec(i)?i={start:i.selectionStart,end:i.selectionEnd}:(i=(i.ownerDocument&&i.ownerDocument.defaultView||window).getSelection(),i={anchorNode:i.anchorNode,anchorOffset:i.anchorOffset,focusNode:i.focusNode,focusOffset:i.focusOffset}),Ii&&Wi(Ii,i)||(Ii=i,i=Br(tc,"onSelect"),0<i.length&&(t=new tr("onSelect","select",null,t,n),e.push({event:t,listeners:i}),t.target=As)))}function Ba(e,t){var n={};return n[e.toLowerCase()]=t.toLowerCase(),n["Webkit"+e]="webkit"+t,n["Moz"+e]="moz"+t,n}var Ns={animationend:Ba("Animation","AnimationEnd"),animationiteration:Ba("Animation","AnimationIteration"),animationstart:Ba("Animation","AnimationStart"),transitionrun:Ba("Transition","TransitionRun"),transitionstart:Ba("Transition","TransitionStart"),transitioncancel:Ba("Transition","TransitionCancel"),transitionend:Ba("Transition","TransitionEnd")},ac={},Vu={};Un&&(Vu=document.createElement("div").style,"AnimationEvent"in window||(delete Ns.animationend.animation,delete Ns.animationiteration.animation,delete Ns.animationstart.animation),"TransitionEvent"in window||delete Ns.transitionend.transition);function Fa(e){if(ac[e])return ac[e];if(!Ns[e])return e;var t=Ns[e],n;for(n in t)if(t.hasOwnProperty(n)&&n in Vu)return ac[e]=t[n];return e}var Xu=Fa("animationend"),Qu=Fa("animationiteration"),Zu=Fa("animationstart"),wb=Fa("transitionrun"),bb=Fa("transitionstart"),vb=Fa("transitioncancel"),em=Fa("transitionend"),tm=new Map,sc="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");sc.push("scrollEnd");function Cn(e,t){tm.set(e,t),_a(t,[e])}var sr=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)},fn=[],Ls=0,ic=0;function ir(){for(var e=Ls,t=ic=Ls=0;t<e;){var n=fn[t];fn[t++]=null;var i=fn[t];fn[t++]=null;var l=fn[t];fn[t++]=null;var c=fn[t];if(fn[t++]=null,i!==null&&l!==null){var u=i.pending;u===null?l.next=l:(l.next=u.next,u.next=l),i.pending=l}c!==0&&nm(n,l,c)}}function or(e,t,n,i){fn[Ls++]=e,fn[Ls++]=t,fn[Ls++]=n,fn[Ls++]=i,ic|=i,e.lanes|=i,e=e.alternate,e!==null&&(e.lanes|=i)}function oc(e,t,n,i){return or(e,t,n,i),rr(e)}function $a(e,t){return or(e,null,null,t),rr(e)}function nm(e,t,n){e.lanes|=n;var i=e.alternate;i!==null&&(i.lanes|=n);for(var l=!1,c=e.return;c!==null;)c.childLanes|=n,i=c.alternate,i!==null&&(i.childLanes|=n),c.tag===22&&(e=c.stateNode,e===null||e._visibility&1||(l=!0)),e=c,c=c.return;return e.tag===3?(c=e.stateNode,l&&t!==null&&(l=31-Ne(n),e=c.hiddenUpdates,i=e[l],i===null?e[l]=[t]:i.push(t),t.lane=n|536870912),c):null}function rr(e){if(50<no)throw no=0,fh=null,Error(h(185));for(var t=e.return;t!==null;)e=t,t=e.return;return e.tag===3?e.stateNode:null}var Es={};function kb(e,t,n,i){this.tag=e,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=i,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function an(e,t,n,i){return new kb(e,t,n,i)}function rc(e){return e=e.prototype,!(!e||!e.isReactComponent)}function Bn(e,t){var n=e.alternate;return n===null?(n=an(e.tag,t,e.key,e.mode),n.elementType=e.elementType,n.type=e.type,n.stateNode=e.stateNode,n.alternate=e,e.alternate=n):(n.pendingProps=t,n.type=e.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=e.flags&65011712,n.childLanes=e.childLanes,n.lanes=e.lanes,n.child=e.child,n.memoizedProps=e.memoizedProps,n.memoizedState=e.memoizedState,n.updateQueue=e.updateQueue,t=e.dependencies,n.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},n.sibling=e.sibling,n.index=e.index,n.ref=e.ref,n.refCleanup=e.refCleanup,n}function am(e,t){e.flags&=65011714;var n=e.alternate;return n===null?(e.childLanes=0,e.lanes=t,e.child=null,e.subtreeFlags=0,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.stateNode=null):(e.childLanes=n.childLanes,e.lanes=n.lanes,e.child=n.child,e.subtreeFlags=0,e.deletions=null,e.memoizedProps=n.memoizedProps,e.memoizedState=n.memoizedState,e.updateQueue=n.updateQueue,e.type=n.type,t=n.dependencies,e.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),e}function lr(e,t,n,i,l,c){var u=0;if(i=e,typeof e=="function")rc(e)&&(u=1);else if(typeof e=="string")u=Mv(e,n,Y.current)?26:e==="html"||e==="head"||e==="body"?27:5;else e:switch(e){case ee:return e=an(31,n,t,l),e.elementType=ee,e.lanes=c,e;case I:return Ka(n.children,l,c,t);case _:u=8,l|=24;break;case Q:return e=an(12,n,t,l|2),e.elementType=Q,e.lanes=c,e;case re:return e=an(13,n,t,l),e.elementType=re,e.lanes=c,e;case F:return e=an(19,n,t,l),e.elementType=F,e.lanes=c,e;default:if(typeof e=="object"&&e!==null)switch(e.$$typeof){case se:u=10;break e;case ne:u=9;break e;case ie:u=11;break e;case B:u=14;break e;case te:u=16,i=null;break e}u=29,n=Error(h(130,e===null?"null":typeof e,"")),i=null}return t=an(u,n,t,l),t.elementType=e,t.type=i,t.lanes=c,t}function Ka(e,t,n,i){return e=an(7,e,i,t),e.lanes=n,e}function lc(e,t,n){return e=an(6,e,null,t),e.lanes=n,e}function sm(e){var t=an(18,null,null,0);return t.stateNode=e,t}function cc(e,t,n){return t=an(4,e.children!==null?e.children:[],e.key,t),t.lanes=n,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}var im=new WeakMap;function yn(e,t){if(typeof e=="object"&&e!==null){var n=im.get(e);return n!==void 0?n:(t={value:e,source:t,stack:ht(t)},im.set(e,t),t)}return{value:e,source:t,stack:ht(t)}}var Hs=[],Ws=0,cr=null,Oi=0,gn=[],wn=0,ma=null,Hn=1,Wn="";function Fn(e,t){Hs[Ws++]=Oi,Hs[Ws++]=cr,cr=e,Oi=t}function om(e,t,n){gn[wn++]=Hn,gn[wn++]=Wn,gn[wn++]=ma,ma=e;var i=Hn;e=Wn;var l=32-Ne(i)-1;i&=~(1<<l),n+=1;var c=32-Ne(t)+l;if(30<c){var u=l-l%5;c=(i&(1<<u)-1).toString(32),i>>=u,l-=u,Hn=1<<32-Ne(t)+l|n<<l|i,Wn=c+e}else Hn=1<<c|n<<l|i,Wn=e}function hc(e){e.return!==null&&(Fn(e,1),om(e,1,0))}function dc(e){for(;e===cr;)cr=Hs[--Ws],Hs[Ws]=null,Oi=Hs[--Ws],Hs[Ws]=null;for(;e===ma;)ma=gn[--wn],gn[wn]=null,Wn=gn[--wn],gn[wn]=null,Hn=gn[--wn],gn[wn]=null}function rm(e,t){gn[wn++]=Hn,gn[wn++]=Wn,gn[wn++]=ma,Hn=t.id,Wn=t.overflow,ma=e}var Ht=null,at=null,Re=!1,pa=null,bn=!1,uc=Error(h(519));function fa(e){var t=Error(h(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw Ri(yn(t,e)),uc}function lm(e){var t=e.stateNode,n=e.type,i=e.memoizedProps;switch(t[Et]=e,t[Bt]=i,n){case"dialog":Ee("cancel",t),Ee("close",t);break;case"iframe":case"object":case"embed":Ee("load",t);break;case"video":case"audio":for(n=0;n<so.length;n++)Ee(so[n],t);break;case"source":Ee("error",t);break;case"img":case"image":case"link":Ee("error",t),Ee("load",t);break;case"details":Ee("toggle",t);break;case"input":Ee("invalid",t),ku(t,i.value,i.defaultValue,i.checked,i.defaultChecked,i.type,i.name,!0);break;case"select":Ee("invalid",t);break;case"textarea":Ee("invalid",t),xu(t,i.value,i.defaultValue,i.children)}n=i.children,typeof n!="string"&&typeof n!="number"&&typeof n!="bigint"||t.textContent===""+n||i.suppressHydrationWarning===!0||Mf(t.textContent,n)?(i.popover!=null&&(Ee("beforetoggle",t),Ee("toggle",t)),i.onScroll!=null&&Ee("scroll",t),i.onScrollEnd!=null&&Ee("scrollend",t),i.onClick!=null&&(t.onclick=_n),t=!0):t=!1,t||fa(e,!0)}function cm(e){for(Ht=e.return;Ht;)switch(Ht.tag){case 5:case 31:case 13:bn=!1;return;case 27:case 3:bn=!0;return;default:Ht=Ht.return}}function Is(e){if(e!==Ht)return!1;if(!Re)return cm(e),Re=!0,!1;var t=e.tag,n;if((n=t!==3&&t!==27)&&((n=t===5)&&(n=e.type,n=!(n!=="form"&&n!=="button")||Lh(e.type,e.memoizedProps)),n=!n),n&&at&&fa(e),cm(e),t===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(h(317));at=Of(e)}else if(t===31){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(h(317));at=Of(e)}else t===27?(t=at,Na(e.type)?(e=Oh,Oh=null,at=e):at=t):at=Ht?kn(e.stateNode.nextSibling):null;return!0}function Ya(){at=Ht=null,Re=!1}function mc(){var e=pa;return e!==null&&(Vt===null?Vt=e:Vt.push.apply(Vt,e),pa=null),e}function Ri(e){pa===null?pa=[e]:pa.push(e)}var pc=k(null),Va=null,$n=null;function ya(e,t,n){K(pc,t._currentValue),t._currentValue=n}function Kn(e){e._currentValue=pc.current,N(pc)}function fc(e,t,n){for(;e!==null;){var i=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,i!==null&&(i.childLanes|=t)):i!==null&&(i.childLanes&t)!==t&&(i.childLanes|=t),e===n)break;e=e.return}}function yc(e,t,n,i){var l=e.child;for(l!==null&&(l.return=e);l!==null;){var c=l.dependencies;if(c!==null){var u=l.child;c=c.firstContext;e:for(;c!==null;){var p=c;c=l;for(var S=0;S<t.length;S++)if(p.context===t[S]){c.lanes|=n,p=c.alternate,p!==null&&(p.lanes|=n),fc(c.return,n,e),i||(u=null);break e}c=p.next}}else if(l.tag===18){if(u=l.return,u===null)throw Error(h(341));u.lanes|=n,c=u.alternate,c!==null&&(c.lanes|=n),fc(u,n,e),u=null}else u=l.child;if(u!==null)u.return=l;else for(u=l;u!==null;){if(u===e){u=null;break}if(l=u.sibling,l!==null){l.return=u.return,u=l;break}u=u.return}l=u}}function Os(e,t,n,i){e=null;for(var l=t,c=!1;l!==null;){if(!c){if((l.flags&524288)!==0)c=!0;else if((l.flags&262144)!==0)break}if(l.tag===10){var u=l.alternate;if(u===null)throw Error(h(387));if(u=u.memoizedProps,u!==null){var p=l.type;nn(l.pendingProps.value,u.value)||(e!==null?e.push(p):e=[p])}}else if(l===Te.current){if(u=l.alternate,u===null)throw Error(h(387));u.memoizedState.memoizedState!==l.memoizedState.memoizedState&&(e!==null?e.push(co):e=[co])}l=l.return}e!==null&&yc(t,e,n,i),t.flags|=262144}function hr(e){for(e=e.firstContext;e!==null;){if(!nn(e.context._currentValue,e.memoizedValue))return!0;e=e.next}return!1}function Xa(e){Va=e,$n=null,e=e.dependencies,e!==null&&(e.firstContext=null)}function Wt(e){return hm(Va,e)}function dr(e,t){return Va===null&&Xa(e),hm(e,t)}function hm(e,t){var n=t._currentValue;if(t={context:t,memoizedValue:n,next:null},$n===null){if(e===null)throw Error(h(308));$n=t,e.dependencies={lanes:0,firstContext:t},e.flags|=524288}else $n=$n.next=t;return n}var Tb=typeof AbortController<"u"?AbortController:function(){var e=[],t=this.signal={aborted:!1,addEventListener:function(n,i){e.push(i)}};this.abort=function(){t.aborted=!0,e.forEach(function(n){return n()})}},xb=a.unstable_scheduleCallback,Sb=a.unstable_NormalPriority,wt={$$typeof:se,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function gc(){return{controller:new Tb,data:new Map,refCount:0}}function qi(e){e.refCount--,e.refCount===0&&xb(Sb,function(){e.controller.abort()})}var Di=null,wc=0,Rs=0,qs=null;function jb(e,t){if(Di===null){var n=Di=[];wc=0,Rs=kh(),qs={status:"pending",value:void 0,then:function(i){n.push(i)}}}return wc++,t.then(dm,dm),t}function dm(){if(--wc===0&&Di!==null){qs!==null&&(qs.status="fulfilled");var e=Di;Di=null,Rs=0,qs=null;for(var t=0;t<e.length;t++)(0,e[t])()}}function Mb(e,t){var n=[],i={status:"pending",value:null,reason:null,then:function(l){n.push(l)}};return e.then(function(){i.status="fulfilled",i.value=t;for(var l=0;l<n.length;l++)(0,n[l])(t)},function(l){for(i.status="rejected",i.reason=l,l=0;l<n.length;l++)(0,n[l])(void 0)}),i}var um=v.S;v.S=function(e,t){Yp=Tt(),typeof t=="object"&&t!==null&&typeof t.then=="function"&&jb(e,t),um!==null&&um(e,t)};var Qa=k(null);function bc(){var e=Qa.current;return e!==null?e:et.pooledCache}function ur(e,t){t===null?K(Qa,Qa.current):K(Qa,t.pool)}function mm(){var e=bc();return e===null?null:{parent:wt._currentValue,pool:e}}var Ds=Error(h(460)),vc=Error(h(474)),mr=Error(h(542)),pr={then:function(){}};function pm(e){return e=e.status,e==="fulfilled"||e==="rejected"}function fm(e,t,n){switch(n=e[n],n===void 0?e.push(t):n!==t&&(t.then(_n,_n),t=n),t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,gm(e),e;default:if(typeof t.status=="string")t.then(_n,_n);else{if(e=et,e!==null&&100<e.shellSuspendCounter)throw Error(h(482));e=t,e.status="pending",e.then(function(i){if(t.status==="pending"){var l=t;l.status="fulfilled",l.value=i}},function(i){if(t.status==="pending"){var l=t;l.status="rejected",l.reason=i}})}switch(t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,gm(e),e}throw es=t,Ds}}function Za(e){try{var t=e._init;return t(e._payload)}catch(n){throw n!==null&&typeof n=="object"&&typeof n.then=="function"?(es=n,Ds):n}}var es=null;function ym(){if(es===null)throw Error(h(459));var e=es;return es=null,e}function gm(e){if(e===Ds||e===mr)throw Error(h(483))}var Ps=null,Pi=0;function fr(e){var t=Pi;return Pi+=1,Ps===null&&(Ps=[]),fm(Ps,e,t)}function Gi(e,t){t=t.props.ref,e.ref=t!==void 0?t:null}function yr(e,t){throw t.$$typeof===M?Error(h(525)):(e=Object.prototype.toString.call(t),Error(h(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)))}function wm(e){function t(H,C){if(e){var q=H.deletions;q===null?(H.deletions=[C],H.flags|=16):q.push(C)}}function n(H,C){if(!e)return null;for(;C!==null;)t(H,C),C=C.sibling;return null}function i(H){for(var C=new Map;H!==null;)H.key!==null?C.set(H.key,H):C.set(H.index,H),H=H.sibling;return C}function l(H,C){return H=Bn(H,C),H.index=0,H.sibling=null,H}function c(H,C,q){return H.index=q,e?(q=H.alternate,q!==null?(q=q.index,q<C?(H.flags|=67108866,C):q):(H.flags|=67108866,C)):(H.flags|=1048576,C)}function u(H){return e&&H.alternate===null&&(H.flags|=67108866),H}function p(H,C,q,$){return C===null||C.tag!==6?(C=lc(q,H.mode,$),C.return=H,C):(C=l(C,q),C.return=H,C)}function S(H,C,q,$){var ve=q.type;return ve===I?U(H,C,q.props.children,$,q.key):C!==null&&(C.elementType===ve||typeof ve=="object"&&ve!==null&&ve.$$typeof===te&&Za(ve)===C.type)?(C=l(C,q.props),Gi(C,q),C.return=H,C):(C=lr(q.type,q.key,q.props,null,H.mode,$),Gi(C,q),C.return=H,C)}function D(H,C,q,$){return C===null||C.tag!==4||C.stateNode.containerInfo!==q.containerInfo||C.stateNode.implementation!==q.implementation?(C=cc(q,H.mode,$),C.return=H,C):(C=l(C,q.children||[]),C.return=H,C)}function U(H,C,q,$,ve){return C===null||C.tag!==7?(C=Ka(q,H.mode,$,ve),C.return=H,C):(C=l(C,q),C.return=H,C)}function V(H,C,q){if(typeof C=="string"&&C!==""||typeof C=="number"||typeof C=="bigint")return C=lc(""+C,H.mode,q),C.return=H,C;if(typeof C=="object"&&C!==null){switch(C.$$typeof){case E:return q=lr(C.type,C.key,C.props,null,H.mode,q),Gi(q,C),q.return=H,q;case G:return C=cc(C,H.mode,q),C.return=H,C;case te:return C=Za(C),V(H,C,q)}if(L(C)||O(C))return C=Ka(C,H.mode,q,null),C.return=H,C;if(typeof C.then=="function")return V(H,fr(C),q);if(C.$$typeof===se)return V(H,dr(H,C),q);yr(H,C)}return null}function P(H,C,q,$){var ve=C!==null?C.key:null;if(typeof q=="string"&&q!==""||typeof q=="number"||typeof q=="bigint")return ve!==null?null:p(H,C,""+q,$);if(typeof q=="object"&&q!==null){switch(q.$$typeof){case E:return q.key===ve?S(H,C,q,$):null;case G:return q.key===ve?D(H,C,q,$):null;case te:return q=Za(q),P(H,C,q,$)}if(L(q)||O(q))return ve!==null?null:U(H,C,q,$,null);if(typeof q.then=="function")return P(H,C,fr(q),$);if(q.$$typeof===se)return P(H,C,dr(H,q),$);yr(H,q)}return null}function z(H,C,q,$,ve){if(typeof $=="string"&&$!==""||typeof $=="number"||typeof $=="bigint")return H=H.get(q)||null,p(C,H,""+$,ve);if(typeof $=="object"&&$!==null){switch($.$$typeof){case E:return H=H.get($.key===null?q:$.key)||null,S(C,H,$,ve);case G:return H=H.get($.key===null?q:$.key)||null,D(C,H,$,ve);case te:return $=Za($),z(H,C,q,$,ve)}if(L($)||O($))return H=H.get(q)||null,U(C,H,$,ve,null);if(typeof $.then=="function")return z(H,C,q,fr($),ve);if($.$$typeof===se)return z(H,C,q,dr(C,$),ve);yr(C,$)}return null}function me(H,C,q,$){for(var ve=null,Ge=null,fe=C,Me=C=0,Ie=null;fe!==null&&Me<q.length;Me++){fe.index>Me?(Ie=fe,fe=null):Ie=fe.sibling;var ze=P(H,fe,q[Me],$);if(ze===null){fe===null&&(fe=Ie);break}e&&fe&&ze.alternate===null&&t(H,fe),C=c(ze,C,Me),Ge===null?ve=ze:Ge.sibling=ze,Ge=ze,fe=Ie}if(Me===q.length)return n(H,fe),Re&&Fn(H,Me),ve;if(fe===null){for(;Me<q.length;Me++)fe=V(H,q[Me],$),fe!==null&&(C=c(fe,C,Me),Ge===null?ve=fe:Ge.sibling=fe,Ge=fe);return Re&&Fn(H,Me),ve}for(fe=i(fe);Me<q.length;Me++)Ie=z(fe,H,Me,q[Me],$),Ie!==null&&(e&&Ie.alternate!==null&&fe.delete(Ie.key===null?Me:Ie.key),C=c(Ie,C,Me),Ge===null?ve=Ie:Ge.sibling=Ie,Ge=Ie);return e&&fe.forEach(function(Ia){return t(H,Ia)}),Re&&Fn(H,Me),ve}function ke(H,C,q,$){if(q==null)throw Error(h(151));for(var ve=null,Ge=null,fe=C,Me=C=0,Ie=null,ze=q.next();fe!==null&&!ze.done;Me++,ze=q.next()){fe.index>Me?(Ie=fe,fe=null):Ie=fe.sibling;var Ia=P(H,fe,ze.value,$);if(Ia===null){fe===null&&(fe=Ie);break}e&&fe&&Ia.alternate===null&&t(H,fe),C=c(Ia,C,Me),Ge===null?ve=Ia:Ge.sibling=Ia,Ge=Ia,fe=Ie}if(ze.done)return n(H,fe),Re&&Fn(H,Me),ve;if(fe===null){for(;!ze.done;Me++,ze=q.next())ze=V(H,ze.value,$),ze!==null&&(C=c(ze,C,Me),Ge===null?ve=ze:Ge.sibling=ze,Ge=ze);return Re&&Fn(H,Me),ve}for(fe=i(fe);!ze.done;Me++,ze=q.next())ze=z(fe,H,Me,ze.value,$),ze!==null&&(e&&ze.alternate!==null&&fe.delete(ze.key===null?Me:ze.key),C=c(ze,C,Me),Ge===null?ve=ze:Ge.sibling=ze,Ge=ze);return e&&fe.forEach(function(qv){return t(H,qv)}),Re&&Fn(H,Me),ve}function Qe(H,C,q,$){if(typeof q=="object"&&q!==null&&q.type===I&&q.key===null&&(q=q.props.children),typeof q=="object"&&q!==null){switch(q.$$typeof){case E:e:{for(var ve=q.key;C!==null;){if(C.key===ve){if(ve=q.type,ve===I){if(C.tag===7){n(H,C.sibling),$=l(C,q.props.children),$.return=H,H=$;break e}}else if(C.elementType===ve||typeof ve=="object"&&ve!==null&&ve.$$typeof===te&&Za(ve)===C.type){n(H,C.sibling),$=l(C,q.props),Gi($,q),$.return=H,H=$;break e}n(H,C);break}else t(H,C);C=C.sibling}q.type===I?($=Ka(q.props.children,H.mode,$,q.key),$.return=H,H=$):($=lr(q.type,q.key,q.props,null,H.mode,$),Gi($,q),$.return=H,H=$)}return u(H);case G:e:{for(ve=q.key;C!==null;){if(C.key===ve)if(C.tag===4&&C.stateNode.containerInfo===q.containerInfo&&C.stateNode.implementation===q.implementation){n(H,C.sibling),$=l(C,q.children||[]),$.return=H,H=$;break e}else{n(H,C);break}else t(H,C);C=C.sibling}$=cc(q,H.mode,$),$.return=H,H=$}return u(H);case te:return q=Za(q),Qe(H,C,q,$)}if(L(q))return me(H,C,q,$);if(O(q)){if(ve=O(q),typeof ve!="function")throw Error(h(150));return q=ve.call(q),ke(H,C,q,$)}if(typeof q.then=="function")return Qe(H,C,fr(q),$);if(q.$$typeof===se)return Qe(H,C,dr(H,q),$);yr(H,q)}return typeof q=="string"&&q!==""||typeof q=="number"||typeof q=="bigint"?(q=""+q,C!==null&&C.tag===6?(n(H,C.sibling),$=l(C,q),$.return=H,H=$):(n(H,C),$=lc(q,H.mode,$),$.return=H,H=$),u(H)):n(H,C)}return function(H,C,q,$){try{Pi=0;var ve=Qe(H,C,q,$);return Ps=null,ve}catch(fe){if(fe===Ds||fe===mr)throw fe;var Ge=an(29,fe,null,H.mode);return Ge.lanes=$,Ge.return=H,Ge}}}var ts=wm(!0),bm=wm(!1),ga=!1;function kc(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function Tc(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,callbacks:null})}function wa(e){return{lane:e,tag:0,payload:null,callback:null,next:null}}function ba(e,t,n){var i=e.updateQueue;if(i===null)return null;if(i=i.shared,(Ue&2)!==0){var l=i.pending;return l===null?t.next=t:(t.next=l.next,l.next=t),i.pending=t,t=rr(e),nm(e,null,n),t}return or(e,i,t,n),rr(e)}function zi(e,t,n){if(t=t.updateQueue,t!==null&&(t=t.shared,(n&4194048)!==0)){var i=t.lanes;i&=e.pendingLanes,n|=i,t.lanes=n,hu(e,n)}}function xc(e,t){var n=e.updateQueue,i=e.alternate;if(i!==null&&(i=i.updateQueue,n===i)){var l=null,c=null;if(n=n.firstBaseUpdate,n!==null){do{var u={lane:n.lane,tag:n.tag,payload:n.payload,callback:null,next:null};c===null?l=c=u:c=c.next=u,n=n.next}while(n!==null);c===null?l=c=t:c=c.next=t}else l=c=t;n={baseState:i.baseState,firstBaseUpdate:l,lastBaseUpdate:c,shared:i.shared,callbacks:i.callbacks},e.updateQueue=n;return}e=n.lastBaseUpdate,e===null?n.firstBaseUpdate=t:e.next=t,n.lastBaseUpdate=t}var Sc=!1;function Ji(){if(Sc){var e=qs;if(e!==null)throw e}}function _i(e,t,n,i){Sc=!1;var l=e.updateQueue;ga=!1;var c=l.firstBaseUpdate,u=l.lastBaseUpdate,p=l.shared.pending;if(p!==null){l.shared.pending=null;var S=p,D=S.next;S.next=null,u===null?c=D:u.next=D,u=S;var U=e.alternate;U!==null&&(U=U.updateQueue,p=U.lastBaseUpdate,p!==u&&(p===null?U.firstBaseUpdate=D:p.next=D,U.lastBaseUpdate=S))}if(c!==null){var V=l.baseState;u=0,U=D=S=null,p=c;do{var P=p.lane&-536870913,z=P!==p.lane;if(z?(We&P)===P:(i&P)===P){P!==0&&P===Rs&&(Sc=!0),U!==null&&(U=U.next={lane:0,tag:p.tag,payload:p.payload,callback:null,next:null});e:{var me=e,ke=p;P=t;var Qe=n;switch(ke.tag){case 1:if(me=ke.payload,typeof me=="function"){V=me.call(Qe,V,P);break e}V=me;break e;case 3:me.flags=me.flags&-65537|128;case 0:if(me=ke.payload,P=typeof me=="function"?me.call(Qe,V,P):me,P==null)break e;V=b({},V,P);break e;case 2:ga=!0}}P=p.callback,P!==null&&(e.flags|=64,z&&(e.flags|=8192),z=l.callbacks,z===null?l.callbacks=[P]:z.push(P))}else z={lane:P,tag:p.tag,payload:p.payload,callback:p.callback,next:null},U===null?(D=U=z,S=V):U=U.next=z,u|=P;if(p=p.next,p===null){if(p=l.shared.pending,p===null)break;z=p,p=z.next,z.next=null,l.lastBaseUpdate=z,l.shared.pending=null}}while(!0);U===null&&(S=V),l.baseState=S,l.firstBaseUpdate=D,l.lastBaseUpdate=U,c===null&&(l.shared.lanes=0),Sa|=u,e.lanes=u,e.memoizedState=V}}function vm(e,t){if(typeof e!="function")throw Error(h(191,e));e.call(t)}function km(e,t){var n=e.callbacks;if(n!==null)for(e.callbacks=null,e=0;e<n.length;e++)vm(n[e],t)}var Gs=k(null),gr=k(0);function Tm(e,t){e=aa,K(gr,e),K(Gs,t),aa=e|t.baseLanes}function jc(){K(gr,aa),K(Gs,Gs.current)}function Mc(){aa=gr.current,N(Gs),N(gr)}var sn=k(null),vn=null;function va(e){var t=e.alternate;K(pt,pt.current&1),K(sn,e),vn===null&&(t===null||Gs.current!==null||t.memoizedState!==null)&&(vn=e)}function Cc(e){K(pt,pt.current),K(sn,e),vn===null&&(vn=e)}function xm(e){e.tag===22?(K(pt,pt.current),K(sn,e),vn===null&&(vn=e)):ka()}function ka(){K(pt,pt.current),K(sn,sn.current)}function on(e){N(sn),vn===e&&(vn=null),N(pt)}var pt=k(0);function wr(e){for(var t=e;t!==null;){if(t.tag===13){var n=t.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||Wh(n)||Ih(n)))return t}else if(t.tag===19&&(t.memoizedProps.revealOrder==="forwards"||t.memoizedProps.revealOrder==="backwards"||t.memoizedProps.revealOrder==="unstable_legacy-backwards"||t.memoizedProps.revealOrder==="together")){if((t.flags&128)!==0)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var Yn=0,Se=null,Ve=null,bt=null,br=!1,zs=!1,ns=!1,vr=0,Ui=0,Js=null,Cb=0;function ut(){throw Error(h(321))}function Ac(e,t){if(t===null)return!1;for(var n=0;n<t.length&&n<e.length;n++)if(!nn(e[n],t[n]))return!1;return!0}function Nc(e,t,n,i,l,c){return Yn=c,Se=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,v.H=e===null||e.memoizedState===null?op:Uc,ns=!1,c=n(i,l),ns=!1,zs&&(c=jm(t,n,i,l)),Sm(e),c}function Sm(e){v.H=$i;var t=Ve!==null&&Ve.next!==null;if(Yn=0,bt=Ve=Se=null,br=!1,Ui=0,Js=null,t)throw Error(h(300));e===null||vt||(e=e.dependencies,e!==null&&hr(e)&&(vt=!0))}function jm(e,t,n,i){Se=e;var l=0;do{if(zs&&(Js=null),Ui=0,zs=!1,25<=l)throw Error(h(301));if(l+=1,bt=Ve=null,e.updateQueue!=null){var c=e.updateQueue;c.lastEffect=null,c.events=null,c.stores=null,c.memoCache!=null&&(c.memoCache.index=0)}v.H=rp,c=t(n,i)}while(zs);return c}function Ab(){var e=v.H,t=e.useState()[0];return t=typeof t.then=="function"?Bi(t):t,e=e.useState()[0],(Ve!==null?Ve.memoizedState:null)!==e&&(Se.flags|=1024),t}function Lc(){var e=vr!==0;return vr=0,e}function Ec(e,t,n){t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~n}function Hc(e){if(br){for(e=e.memoizedState;e!==null;){var t=e.queue;t!==null&&(t.pending=null),e=e.next}br=!1}Yn=0,bt=Ve=Se=null,zs=!1,Ui=vr=0,Js=null}function zt(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return bt===null?Se.memoizedState=bt=e:bt=bt.next=e,bt}function ft(){if(Ve===null){var e=Se.alternate;e=e!==null?e.memoizedState:null}else e=Ve.next;var t=bt===null?Se.memoizedState:bt.next;if(t!==null)bt=t,Ve=e;else{if(e===null)throw Se.alternate===null?Error(h(467)):Error(h(310));Ve=e,e={memoizedState:Ve.memoizedState,baseState:Ve.baseState,baseQueue:Ve.baseQueue,queue:Ve.queue,next:null},bt===null?Se.memoizedState=bt=e:bt=bt.next=e}return bt}function kr(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function Bi(e){var t=Ui;return Ui+=1,Js===null&&(Js=[]),e=fm(Js,e,t),t=Se,(bt===null?t.memoizedState:bt.next)===null&&(t=t.alternate,v.H=t===null||t.memoizedState===null?op:Uc),e}function Tr(e){if(e!==null&&typeof e=="object"){if(typeof e.then=="function")return Bi(e);if(e.$$typeof===se)return Wt(e)}throw Error(h(438,String(e)))}function Wc(e){var t=null,n=Se.updateQueue;if(n!==null&&(t=n.memoCache),t==null){var i=Se.alternate;i!==null&&(i=i.updateQueue,i!==null&&(i=i.memoCache,i!=null&&(t={data:i.data.map(function(l){return l.slice()}),index:0})))}if(t==null&&(t={data:[],index:0}),n===null&&(n=kr(),Se.updateQueue=n),n.memoCache=t,n=t.data[t.index],n===void 0)for(n=t.data[t.index]=Array(e),i=0;i<e;i++)n[i]=ge;return t.index++,n}function Vn(e,t){return typeof t=="function"?t(e):t}function xr(e){var t=ft();return Ic(t,Ve,e)}function Ic(e,t,n){var i=e.queue;if(i===null)throw Error(h(311));i.lastRenderedReducer=n;var l=e.baseQueue,c=i.pending;if(c!==null){if(l!==null){var u=l.next;l.next=c.next,c.next=u}t.baseQueue=l=c,i.pending=null}if(c=e.baseState,l===null)e.memoizedState=c;else{t=l.next;var p=u=null,S=null,D=t,U=!1;do{var V=D.lane&-536870913;if(V!==D.lane?(We&V)===V:(Yn&V)===V){var P=D.revertLane;if(P===0)S!==null&&(S=S.next={lane:0,revertLane:0,gesture:null,action:D.action,hasEagerState:D.hasEagerState,eagerState:D.eagerState,next:null}),V===Rs&&(U=!0);else if((Yn&P)===P){D=D.next,P===Rs&&(U=!0);continue}else V={lane:0,revertLane:D.revertLane,gesture:null,action:D.action,hasEagerState:D.hasEagerState,eagerState:D.eagerState,next:null},S===null?(p=S=V,u=c):S=S.next=V,Se.lanes|=P,Sa|=P;V=D.action,ns&&n(c,V),c=D.hasEagerState?D.eagerState:n(c,V)}else P={lane:V,revertLane:D.revertLane,gesture:D.gesture,action:D.action,hasEagerState:D.hasEagerState,eagerState:D.eagerState,next:null},S===null?(p=S=P,u=c):S=S.next=P,Se.lanes|=V,Sa|=V;D=D.next}while(D!==null&&D!==t);if(S===null?u=c:S.next=p,!nn(c,e.memoizedState)&&(vt=!0,U&&(n=qs,n!==null)))throw n;e.memoizedState=c,e.baseState=u,e.baseQueue=S,i.lastRenderedState=c}return l===null&&(i.lanes=0),[e.memoizedState,i.dispatch]}function Oc(e){var t=ft(),n=t.queue;if(n===null)throw Error(h(311));n.lastRenderedReducer=e;var i=n.dispatch,l=n.pending,c=t.memoizedState;if(l!==null){n.pending=null;var u=l=l.next;do c=e(c,u.action),u=u.next;while(u!==l);nn(c,t.memoizedState)||(vt=!0),t.memoizedState=c,t.baseQueue===null&&(t.baseState=c),n.lastRenderedState=c}return[c,i]}function Mm(e,t,n){var i=Se,l=ft(),c=Re;if(c){if(n===void 0)throw Error(h(407));n=n()}else n=t();var u=!nn((Ve||l).memoizedState,n);if(u&&(l.memoizedState=n,vt=!0),l=l.queue,Dc(Nm.bind(null,i,l,e),[e]),l.getSnapshot!==t||u||bt!==null&&bt.memoizedState.tag&1){if(i.flags|=2048,_s(9,{destroy:void 0},Am.bind(null,i,l,n,t),null),et===null)throw Error(h(349));c||(Yn&127)!==0||Cm(i,t,n)}return n}function Cm(e,t,n){e.flags|=16384,e={getSnapshot:t,value:n},t=Se.updateQueue,t===null?(t=kr(),Se.updateQueue=t,t.stores=[e]):(n=t.stores,n===null?t.stores=[e]:n.push(e))}function Am(e,t,n,i){t.value=n,t.getSnapshot=i,Lm(t)&&Em(e)}function Nm(e,t,n){return n(function(){Lm(t)&&Em(e)})}function Lm(e){var t=e.getSnapshot;e=e.value;try{var n=t();return!nn(e,n)}catch{return!0}}function Em(e){var t=$a(e,2);t!==null&&Xt(t,e,2)}function Rc(e){var t=zt();if(typeof e=="function"){var n=e;if(e=n(),ns){Ut(!0);try{n()}finally{Ut(!1)}}}return t.memoizedState=t.baseState=e,t.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Vn,lastRenderedState:e},t}function Hm(e,t,n,i){return e.baseState=n,Ic(e,Ve,typeof i=="function"?i:Vn)}function Nb(e,t,n,i,l){if(Mr(e))throw Error(h(485));if(e=t.action,e!==null){var c={payload:l,action:e,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(u){c.listeners.push(u)}};v.T!==null?n(!0):c.isTransition=!1,i(c),n=t.pending,n===null?(c.next=t.pending=c,Wm(t,c)):(c.next=n.next,t.pending=n.next=c)}}function Wm(e,t){var n=t.action,i=t.payload,l=e.state;if(t.isTransition){var c=v.T,u={};v.T=u;try{var p=n(l,i),S=v.S;S!==null&&S(u,p),Im(e,t,p)}catch(D){qc(e,t,D)}finally{c!==null&&u.types!==null&&(c.types=u.types),v.T=c}}else try{c=n(l,i),Im(e,t,c)}catch(D){qc(e,t,D)}}function Im(e,t,n){n!==null&&typeof n=="object"&&typeof n.then=="function"?n.then(function(i){Om(e,t,i)},function(i){return qc(e,t,i)}):Om(e,t,n)}function Om(e,t,n){t.status="fulfilled",t.value=n,Rm(t),e.state=n,t=e.pending,t!==null&&(n=t.next,n===t?e.pending=null:(n=n.next,t.next=n,Wm(e,n)))}function qc(e,t,n){var i=e.pending;if(e.pending=null,i!==null){i=i.next;do t.status="rejected",t.reason=n,Rm(t),t=t.next;while(t!==i)}e.action=null}function Rm(e){e=e.listeners;for(var t=0;t<e.length;t++)(0,e[t])()}function qm(e,t){return t}function Dm(e,t){if(Re){var n=et.formState;if(n!==null){e:{var i=Se;if(Re){if(at){t:{for(var l=at,c=bn;l.nodeType!==8;){if(!c){l=null;break t}if(l=kn(l.nextSibling),l===null){l=null;break t}}c=l.data,l=c==="F!"||c==="F"?l:null}if(l){at=kn(l.nextSibling),i=l.data==="F!";break e}}fa(i)}i=!1}i&&(t=n[0])}}return n=zt(),n.memoizedState=n.baseState=t,i={pending:null,lanes:0,dispatch:null,lastRenderedReducer:qm,lastRenderedState:t},n.queue=i,n=ap.bind(null,Se,i),i.dispatch=n,i=Rc(!1),c=_c.bind(null,Se,!1,i.queue),i=zt(),l={state:t,dispatch:null,action:e,pending:null},i.queue=l,n=Nb.bind(null,Se,l,c,n),l.dispatch=n,i.memoizedState=e,[t,n,!1]}function Pm(e){var t=ft();return Gm(t,Ve,e)}function Gm(e,t,n){if(t=Ic(e,t,qm)[0],e=xr(Vn)[0],typeof t=="object"&&t!==null&&typeof t.then=="function")try{var i=Bi(t)}catch(u){throw u===Ds?mr:u}else i=t;t=ft();var l=t.queue,c=l.dispatch;return n!==t.memoizedState&&(Se.flags|=2048,_s(9,{destroy:void 0},Lb.bind(null,l,n),null)),[i,c,e]}function Lb(e,t){e.action=t}function zm(e){var t=ft(),n=Ve;if(n!==null)return Gm(t,n,e);ft(),t=t.memoizedState,n=ft();var i=n.queue.dispatch;return n.memoizedState=e,[t,i,!1]}function _s(e,t,n,i){return e={tag:e,create:n,deps:i,inst:t,next:null},t=Se.updateQueue,t===null&&(t=kr(),Se.updateQueue=t),n=t.lastEffect,n===null?t.lastEffect=e.next=e:(i=n.next,n.next=e,e.next=i,t.lastEffect=e),e}function Jm(){return ft().memoizedState}function Sr(e,t,n,i){var l=zt();Se.flags|=e,l.memoizedState=_s(1|t,{destroy:void 0},n,i===void 0?null:i)}function jr(e,t,n,i){var l=ft();i=i===void 0?null:i;var c=l.memoizedState.inst;Ve!==null&&i!==null&&Ac(i,Ve.memoizedState.deps)?l.memoizedState=_s(t,c,n,i):(Se.flags|=e,l.memoizedState=_s(1|t,c,n,i))}function _m(e,t){Sr(8390656,8,e,t)}function Dc(e,t){jr(2048,8,e,t)}function Eb(e){Se.flags|=4;var t=Se.updateQueue;if(t===null)t=kr(),Se.updateQueue=t,t.events=[e];else{var n=t.events;n===null?t.events=[e]:n.push(e)}}function Um(e){var t=ft().memoizedState;return Eb({ref:t,nextImpl:e}),function(){if((Ue&2)!==0)throw Error(h(440));return t.impl.apply(void 0,arguments)}}function Bm(e,t){return jr(4,2,e,t)}function Fm(e,t){return jr(4,4,e,t)}function $m(e,t){if(typeof t=="function"){e=e();var n=t(e);return function(){typeof n=="function"?n():t(null)}}if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function Km(e,t,n){n=n!=null?n.concat([e]):null,jr(4,4,$m.bind(null,t,e),n)}function Pc(){}function Ym(e,t){var n=ft();t=t===void 0?null:t;var i=n.memoizedState;return t!==null&&Ac(t,i[1])?i[0]:(n.memoizedState=[e,t],e)}function Vm(e,t){var n=ft();t=t===void 0?null:t;var i=n.memoizedState;if(t!==null&&Ac(t,i[1]))return i[0];if(i=e(),ns){Ut(!0);try{e()}finally{Ut(!1)}}return n.memoizedState=[i,t],i}function Gc(e,t,n){return n===void 0||(Yn&1073741824)!==0&&(We&261930)===0?e.memoizedState=t:(e.memoizedState=n,e=Xp(),Se.lanes|=e,Sa|=e,n)}function Xm(e,t,n,i){return nn(n,t)?n:Gs.current!==null?(e=Gc(e,n,i),nn(e,t)||(vt=!0),e):(Yn&42)===0||(Yn&1073741824)!==0&&(We&261930)===0?(vt=!0,e.memoizedState=n):(e=Xp(),Se.lanes|=e,Sa|=e,t)}function Qm(e,t,n,i,l){var c=x.p;x.p=c!==0&&8>c?c:8;var u=v.T,p={};v.T=p,_c(e,!1,t,n);try{var S=l(),D=v.S;if(D!==null&&D(p,S),S!==null&&typeof S=="object"&&typeof S.then=="function"){var U=Mb(S,i);Fi(e,t,U,cn(e))}else Fi(e,t,i,cn(e))}catch(V){Fi(e,t,{then:function(){},status:"rejected",reason:V},cn())}finally{x.p=c,u!==null&&p.types!==null&&(u.types=p.types),v.T=u}}function Hb(){}function zc(e,t,n,i){if(e.tag!==5)throw Error(h(476));var l=Zm(e).queue;Qm(e,l,t,J,n===null?Hb:function(){return ep(e),n(i)})}function Zm(e){var t=e.memoizedState;if(t!==null)return t;t={memoizedState:J,baseState:J,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Vn,lastRenderedState:J},next:null};var n={};return t.next={memoizedState:n,baseState:n,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Vn,lastRenderedState:n},next:null},e.memoizedState=t,e=e.alternate,e!==null&&(e.memoizedState=t),t}function ep(e){var t=Zm(e);t.next===null&&(t=e.alternate.memoizedState),Fi(e,t.next.queue,{},cn())}function Jc(){return Wt(co)}function tp(){return ft().memoizedState}function np(){return ft().memoizedState}function Wb(e){for(var t=e.return;t!==null;){switch(t.tag){case 24:case 3:var n=cn();e=wa(n);var i=ba(t,e,n);i!==null&&(Xt(i,t,n),zi(i,t,n)),t={cache:gc()},e.payload=t;return}t=t.return}}function Ib(e,t,n){var i=cn();n={lane:i,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},Mr(e)?sp(t,n):(n=oc(e,t,n,i),n!==null&&(Xt(n,e,i),ip(n,t,i)))}function ap(e,t,n){var i=cn();Fi(e,t,n,i)}function Fi(e,t,n,i){var l={lane:i,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null};if(Mr(e))sp(t,l);else{var c=e.alternate;if(e.lanes===0&&(c===null||c.lanes===0)&&(c=t.lastRenderedReducer,c!==null))try{var u=t.lastRenderedState,p=c(u,n);if(l.hasEagerState=!0,l.eagerState=p,nn(p,u))return or(e,t,l,0),et===null&&ir(),!1}catch{}if(n=oc(e,t,l,i),n!==null)return Xt(n,e,i),ip(n,t,i),!0}return!1}function _c(e,t,n,i){if(i={lane:2,revertLane:kh(),gesture:null,action:i,hasEagerState:!1,eagerState:null,next:null},Mr(e)){if(t)throw Error(h(479))}else t=oc(e,n,i,2),t!==null&&Xt(t,e,2)}function Mr(e){var t=e.alternate;return e===Se||t!==null&&t===Se}function sp(e,t){zs=br=!0;var n=e.pending;n===null?t.next=t:(t.next=n.next,n.next=t),e.pending=t}function ip(e,t,n){if((n&4194048)!==0){var i=t.lanes;i&=e.pendingLanes,n|=i,t.lanes=n,hu(e,n)}}var $i={readContext:Wt,use:Tr,useCallback:ut,useContext:ut,useEffect:ut,useImperativeHandle:ut,useLayoutEffect:ut,useInsertionEffect:ut,useMemo:ut,useReducer:ut,useRef:ut,useState:ut,useDebugValue:ut,useDeferredValue:ut,useTransition:ut,useSyncExternalStore:ut,useId:ut,useHostTransitionStatus:ut,useFormState:ut,useActionState:ut,useOptimistic:ut,useMemoCache:ut,useCacheRefresh:ut};$i.useEffectEvent=ut;var op={readContext:Wt,use:Tr,useCallback:function(e,t){return zt().memoizedState=[e,t===void 0?null:t],e},useContext:Wt,useEffect:_m,useImperativeHandle:function(e,t,n){n=n!=null?n.concat([e]):null,Sr(4194308,4,$m.bind(null,t,e),n)},useLayoutEffect:function(e,t){return Sr(4194308,4,e,t)},useInsertionEffect:function(e,t){Sr(4,2,e,t)},useMemo:function(e,t){var n=zt();t=t===void 0?null:t;var i=e();if(ns){Ut(!0);try{e()}finally{Ut(!1)}}return n.memoizedState=[i,t],i},useReducer:function(e,t,n){var i=zt();if(n!==void 0){var l=n(t);if(ns){Ut(!0);try{n(t)}finally{Ut(!1)}}}else l=t;return i.memoizedState=i.baseState=l,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:l},i.queue=e,e=e.dispatch=Ib.bind(null,Se,e),[i.memoizedState,e]},useRef:function(e){var t=zt();return e={current:e},t.memoizedState=e},useState:function(e){e=Rc(e);var t=e.queue,n=ap.bind(null,Se,t);return t.dispatch=n,[e.memoizedState,n]},useDebugValue:Pc,useDeferredValue:function(e,t){var n=zt();return Gc(n,e,t)},useTransition:function(){var e=Rc(!1);return e=Qm.bind(null,Se,e.queue,!0,!1),zt().memoizedState=e,[!1,e]},useSyncExternalStore:function(e,t,n){var i=Se,l=zt();if(Re){if(n===void 0)throw Error(h(407));n=n()}else{if(n=t(),et===null)throw Error(h(349));(We&127)!==0||Cm(i,t,n)}l.memoizedState=n;var c={value:n,getSnapshot:t};return l.queue=c,_m(Nm.bind(null,i,c,e),[e]),i.flags|=2048,_s(9,{destroy:void 0},Am.bind(null,i,c,n,t),null),n},useId:function(){var e=zt(),t=et.identifierPrefix;if(Re){var n=Wn,i=Hn;n=(i&~(1<<32-Ne(i)-1)).toString(32)+n,t="_"+t+"R_"+n,n=vr++,0<n&&(t+="H"+n.toString(32)),t+="_"}else n=Cb++,t="_"+t+"r_"+n.toString(32)+"_";return e.memoizedState=t},useHostTransitionStatus:Jc,useFormState:Dm,useActionState:Dm,useOptimistic:function(e){var t=zt();t.memoizedState=t.baseState=e;var n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return t.queue=n,t=_c.bind(null,Se,!0,n),n.dispatch=t,[e,t]},useMemoCache:Wc,useCacheRefresh:function(){return zt().memoizedState=Wb.bind(null,Se)},useEffectEvent:function(e){var t=zt(),n={impl:e};return t.memoizedState=n,function(){if((Ue&2)!==0)throw Error(h(440));return n.impl.apply(void 0,arguments)}}},Uc={readContext:Wt,use:Tr,useCallback:Ym,useContext:Wt,useEffect:Dc,useImperativeHandle:Km,useInsertionEffect:Bm,useLayoutEffect:Fm,useMemo:Vm,useReducer:xr,useRef:Jm,useState:function(){return xr(Vn)},useDebugValue:Pc,useDeferredValue:function(e,t){var n=ft();return Xm(n,Ve.memoizedState,e,t)},useTransition:function(){var e=xr(Vn)[0],t=ft().memoizedState;return[typeof e=="boolean"?e:Bi(e),t]},useSyncExternalStore:Mm,useId:tp,useHostTransitionStatus:Jc,useFormState:Pm,useActionState:Pm,useOptimistic:function(e,t){var n=ft();return Hm(n,Ve,e,t)},useMemoCache:Wc,useCacheRefresh:np};Uc.useEffectEvent=Um;var rp={readContext:Wt,use:Tr,useCallback:Ym,useContext:Wt,useEffect:Dc,useImperativeHandle:Km,useInsertionEffect:Bm,useLayoutEffect:Fm,useMemo:Vm,useReducer:Oc,useRef:Jm,useState:function(){return Oc(Vn)},useDebugValue:Pc,useDeferredValue:function(e,t){var n=ft();return Ve===null?Gc(n,e,t):Xm(n,Ve.memoizedState,e,t)},useTransition:function(){var e=Oc(Vn)[0],t=ft().memoizedState;return[typeof e=="boolean"?e:Bi(e),t]},useSyncExternalStore:Mm,useId:tp,useHostTransitionStatus:Jc,useFormState:zm,useActionState:zm,useOptimistic:function(e,t){var n=ft();return Ve!==null?Hm(n,Ve,e,t):(n.baseState=e,[e,n.queue.dispatch])},useMemoCache:Wc,useCacheRefresh:np};rp.useEffectEvent=Um;function Bc(e,t,n,i){t=e.memoizedState,n=n(i,t),n=n==null?t:b({},t,n),e.memoizedState=n,e.lanes===0&&(e.updateQueue.baseState=n)}var Fc={enqueueSetState:function(e,t,n){e=e._reactInternals;var i=cn(),l=wa(i);l.payload=t,n!=null&&(l.callback=n),t=ba(e,l,i),t!==null&&(Xt(t,e,i),zi(t,e,i))},enqueueReplaceState:function(e,t,n){e=e._reactInternals;var i=cn(),l=wa(i);l.tag=1,l.payload=t,n!=null&&(l.callback=n),t=ba(e,l,i),t!==null&&(Xt(t,e,i),zi(t,e,i))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var n=cn(),i=wa(n);i.tag=2,t!=null&&(i.callback=t),t=ba(e,i,n),t!==null&&(Xt(t,e,n),zi(t,e,n))}};function lp(e,t,n,i,l,c,u){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(i,c,u):t.prototype&&t.prototype.isPureReactComponent?!Wi(n,i)||!Wi(l,c):!0}function cp(e,t,n,i){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(n,i),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(n,i),t.state!==e&&Fc.enqueueReplaceState(t,t.state,null)}function as(e,t){var n=t;if("ref"in t){n={};for(var i in t)i!=="ref"&&(n[i]=t[i])}if(e=e.defaultProps){n===t&&(n=b({},n));for(var l in e)n[l]===void 0&&(n[l]=e[l])}return n}function hp(e){sr(e)}function dp(e){console.error(e)}function up(e){sr(e)}function Cr(e,t){try{var n=e.onUncaughtError;n(t.value,{componentStack:t.stack})}catch(i){setTimeout(function(){throw i})}}function mp(e,t,n){try{var i=e.onCaughtError;i(n.value,{componentStack:n.stack,errorBoundary:t.tag===1?t.stateNode:null})}catch(l){setTimeout(function(){throw l})}}function $c(e,t,n){return n=wa(n),n.tag=3,n.payload={element:null},n.callback=function(){Cr(e,t)},n}function pp(e){return e=wa(e),e.tag=3,e}function fp(e,t,n,i){var l=n.type.getDerivedStateFromError;if(typeof l=="function"){var c=i.value;e.payload=function(){return l(c)},e.callback=function(){mp(t,n,i)}}var u=n.stateNode;u!==null&&typeof u.componentDidCatch=="function"&&(e.callback=function(){mp(t,n,i),typeof l!="function"&&(ja===null?ja=new Set([this]):ja.add(this));var p=i.stack;this.componentDidCatch(i.value,{componentStack:p!==null?p:""})})}function Ob(e,t,n,i,l){if(n.flags|=32768,i!==null&&typeof i=="object"&&typeof i.then=="function"){if(t=n.alternate,t!==null&&Os(t,n,l,!0),n=sn.current,n!==null){switch(n.tag){case 31:case 13:return vn===null?Pr():n.alternate===null&&mt===0&&(mt=3),n.flags&=-257,n.flags|=65536,n.lanes=l,i===pr?n.flags|=16384:(t=n.updateQueue,t===null?n.updateQueue=new Set([i]):t.add(i),wh(e,i,l)),!1;case 22:return n.flags|=65536,i===pr?n.flags|=16384:(t=n.updateQueue,t===null?(t={transitions:null,markerInstances:null,retryQueue:new Set([i])},n.updateQueue=t):(n=t.retryQueue,n===null?t.retryQueue=new Set([i]):n.add(i)),wh(e,i,l)),!1}throw Error(h(435,n.tag))}return wh(e,i,l),Pr(),!1}if(Re)return t=sn.current,t!==null?((t.flags&65536)===0&&(t.flags|=256),t.flags|=65536,t.lanes=l,i!==uc&&(e=Error(h(422),{cause:i}),Ri(yn(e,n)))):(i!==uc&&(t=Error(h(423),{cause:i}),Ri(yn(t,n))),e=e.current.alternate,e.flags|=65536,l&=-l,e.lanes|=l,i=yn(i,n),l=$c(e.stateNode,i,l),xc(e,l),mt!==4&&(mt=2)),!1;var c=Error(h(520),{cause:i});if(c=yn(c,n),to===null?to=[c]:to.push(c),mt!==4&&(mt=2),t===null)return!0;i=yn(i,n),n=t;do{switch(n.tag){case 3:return n.flags|=65536,e=l&-l,n.lanes|=e,e=$c(n.stateNode,i,e),xc(n,e),!1;case 1:if(t=n.type,c=n.stateNode,(n.flags&128)===0&&(typeof t.getDerivedStateFromError=="function"||c!==null&&typeof c.componentDidCatch=="function"&&(ja===null||!ja.has(c))))return n.flags|=65536,l&=-l,n.lanes|=l,l=pp(l),fp(l,e,n,i),xc(n,l),!1}n=n.return}while(n!==null);return!1}var Kc=Error(h(461)),vt=!1;function It(e,t,n,i){t.child=e===null?bm(t,null,n,i):ts(t,e.child,n,i)}function yp(e,t,n,i,l){n=n.render;var c=t.ref;if("ref"in i){var u={};for(var p in i)p!=="ref"&&(u[p]=i[p])}else u=i;return Xa(t),i=Nc(e,t,n,u,c,l),p=Lc(),e!==null&&!vt?(Ec(e,t,l),Xn(e,t,l)):(Re&&p&&hc(t),t.flags|=1,It(e,t,i,l),t.child)}function gp(e,t,n,i,l){if(e===null){var c=n.type;return typeof c=="function"&&!rc(c)&&c.defaultProps===void 0&&n.compare===null?(t.tag=15,t.type=c,wp(e,t,c,i,l)):(e=lr(n.type,null,i,t,t.mode,l),e.ref=t.ref,e.return=t,t.child=e)}if(c=e.child,!nh(e,l)){var u=c.memoizedProps;if(n=n.compare,n=n!==null?n:Wi,n(u,i)&&e.ref===t.ref)return Xn(e,t,l)}return t.flags|=1,e=Bn(c,i),e.ref=t.ref,e.return=t,t.child=e}function wp(e,t,n,i,l){if(e!==null){var c=e.memoizedProps;if(Wi(c,i)&&e.ref===t.ref)if(vt=!1,t.pendingProps=i=c,nh(e,l))(e.flags&131072)!==0&&(vt=!0);else return t.lanes=e.lanes,Xn(e,t,l)}return Yc(e,t,n,i,l)}function bp(e,t,n,i){var l=i.children,c=e!==null?e.memoizedState:null;if(e===null&&t.stateNode===null&&(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),i.mode==="hidden"){if((t.flags&128)!==0){if(c=c!==null?c.baseLanes|n:n,e!==null){for(i=t.child=e.child,l=0;i!==null;)l=l|i.lanes|i.childLanes,i=i.sibling;i=l&~c}else i=0,t.child=null;return vp(e,t,c,n,i)}if((n&536870912)!==0)t.memoizedState={baseLanes:0,cachePool:null},e!==null&&ur(t,c!==null?c.cachePool:null),c!==null?Tm(t,c):jc(),xm(t);else return i=t.lanes=536870912,vp(e,t,c!==null?c.baseLanes|n:n,n,i)}else c!==null?(ur(t,c.cachePool),Tm(t,c),ka(),t.memoizedState=null):(e!==null&&ur(t,null),jc(),ka());return It(e,t,l,n),t.child}function Ki(e,t){return e!==null&&e.tag===22||t.stateNode!==null||(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),t.sibling}function vp(e,t,n,i,l){var c=bc();return c=c===null?null:{parent:wt._currentValue,pool:c},t.memoizedState={baseLanes:n,cachePool:c},e!==null&&ur(t,null),jc(),xm(t),e!==null&&Os(e,t,i,!0),t.childLanes=l,null}function Ar(e,t){return t=Lr({mode:t.mode,children:t.children},e.mode),t.ref=e.ref,e.child=t,t.return=e,t}function kp(e,t,n){return ts(t,e.child,null,n),e=Ar(t,t.pendingProps),e.flags|=2,on(t),t.memoizedState=null,e}function Rb(e,t,n){var i=t.pendingProps,l=(t.flags&128)!==0;if(t.flags&=-129,e===null){if(Re){if(i.mode==="hidden")return e=Ar(t,i),t.lanes=536870912,Ki(null,e);if(Cc(t),(e=at)?(e=If(e,bn),e=e!==null&&e.data==="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:ma!==null?{id:Hn,overflow:Wn}:null,retryLane:536870912,hydrationErrors:null},n=sm(e),n.return=t,t.child=n,Ht=t,at=null)):e=null,e===null)throw fa(t);return t.lanes=536870912,null}return Ar(t,i)}var c=e.memoizedState;if(c!==null){var u=c.dehydrated;if(Cc(t),l)if(t.flags&256)t.flags&=-257,t=kp(e,t,n);else if(t.memoizedState!==null)t.child=e.child,t.flags|=128,t=null;else throw Error(h(558));else if(vt||Os(e,t,n,!1),l=(n&e.childLanes)!==0,vt||l){if(i=et,i!==null&&(u=du(i,n),u!==0&&u!==c.retryLane))throw c.retryLane=u,$a(e,u),Xt(i,e,u),Kc;Pr(),t=kp(e,t,n)}else e=c.treeContext,at=kn(u.nextSibling),Ht=t,Re=!0,pa=null,bn=!1,e!==null&&rm(t,e),t=Ar(t,i),t.flags|=4096;return t}return e=Bn(e.child,{mode:i.mode,children:i.children}),e.ref=t.ref,t.child=e,e.return=t,e}function Nr(e,t){var n=t.ref;if(n===null)e!==null&&e.ref!==null&&(t.flags|=4194816);else{if(typeof n!="function"&&typeof n!="object")throw Error(h(284));(e===null||e.ref!==n)&&(t.flags|=4194816)}}function Yc(e,t,n,i,l){return Xa(t),n=Nc(e,t,n,i,void 0,l),i=Lc(),e!==null&&!vt?(Ec(e,t,l),Xn(e,t,l)):(Re&&i&&hc(t),t.flags|=1,It(e,t,n,l),t.child)}function Tp(e,t,n,i,l,c){return Xa(t),t.updateQueue=null,n=jm(t,i,n,l),Sm(e),i=Lc(),e!==null&&!vt?(Ec(e,t,c),Xn(e,t,c)):(Re&&i&&hc(t),t.flags|=1,It(e,t,n,c),t.child)}function xp(e,t,n,i,l){if(Xa(t),t.stateNode===null){var c=Es,u=n.contextType;typeof u=="object"&&u!==null&&(c=Wt(u)),c=new n(i,c),t.memoizedState=c.state!==null&&c.state!==void 0?c.state:null,c.updater=Fc,t.stateNode=c,c._reactInternals=t,c=t.stateNode,c.props=i,c.state=t.memoizedState,c.refs={},kc(t),u=n.contextType,c.context=typeof u=="object"&&u!==null?Wt(u):Es,c.state=t.memoizedState,u=n.getDerivedStateFromProps,typeof u=="function"&&(Bc(t,n,u,i),c.state=t.memoizedState),typeof n.getDerivedStateFromProps=="function"||typeof c.getSnapshotBeforeUpdate=="function"||typeof c.UNSAFE_componentWillMount!="function"&&typeof c.componentWillMount!="function"||(u=c.state,typeof c.componentWillMount=="function"&&c.componentWillMount(),typeof c.UNSAFE_componentWillMount=="function"&&c.UNSAFE_componentWillMount(),u!==c.state&&Fc.enqueueReplaceState(c,c.state,null),_i(t,i,c,l),Ji(),c.state=t.memoizedState),typeof c.componentDidMount=="function"&&(t.flags|=4194308),i=!0}else if(e===null){c=t.stateNode;var p=t.memoizedProps,S=as(n,p);c.props=S;var D=c.context,U=n.contextType;u=Es,typeof U=="object"&&U!==null&&(u=Wt(U));var V=n.getDerivedStateFromProps;U=typeof V=="function"||typeof c.getSnapshotBeforeUpdate=="function",p=t.pendingProps!==p,U||typeof c.UNSAFE_componentWillReceiveProps!="function"&&typeof c.componentWillReceiveProps!="function"||(p||D!==u)&&cp(t,c,i,u),ga=!1;var P=t.memoizedState;c.state=P,_i(t,i,c,l),Ji(),D=t.memoizedState,p||P!==D||ga?(typeof V=="function"&&(Bc(t,n,V,i),D=t.memoizedState),(S=ga||lp(t,n,S,i,P,D,u))?(U||typeof c.UNSAFE_componentWillMount!="function"&&typeof c.componentWillMount!="function"||(typeof c.componentWillMount=="function"&&c.componentWillMount(),typeof c.UNSAFE_componentWillMount=="function"&&c.UNSAFE_componentWillMount()),typeof c.componentDidMount=="function"&&(t.flags|=4194308)):(typeof c.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=i,t.memoizedState=D),c.props=i,c.state=D,c.context=u,i=S):(typeof c.componentDidMount=="function"&&(t.flags|=4194308),i=!1)}else{c=t.stateNode,Tc(e,t),u=t.memoizedProps,U=as(n,u),c.props=U,V=t.pendingProps,P=c.context,D=n.contextType,S=Es,typeof D=="object"&&D!==null&&(S=Wt(D)),p=n.getDerivedStateFromProps,(D=typeof p=="function"||typeof c.getSnapshotBeforeUpdate=="function")||typeof c.UNSAFE_componentWillReceiveProps!="function"&&typeof c.componentWillReceiveProps!="function"||(u!==V||P!==S)&&cp(t,c,i,S),ga=!1,P=t.memoizedState,c.state=P,_i(t,i,c,l),Ji();var z=t.memoizedState;u!==V||P!==z||ga||e!==null&&e.dependencies!==null&&hr(e.dependencies)?(typeof p=="function"&&(Bc(t,n,p,i),z=t.memoizedState),(U=ga||lp(t,n,U,i,P,z,S)||e!==null&&e.dependencies!==null&&hr(e.dependencies))?(D||typeof c.UNSAFE_componentWillUpdate!="function"&&typeof c.componentWillUpdate!="function"||(typeof c.componentWillUpdate=="function"&&c.componentWillUpdate(i,z,S),typeof c.UNSAFE_componentWillUpdate=="function"&&c.UNSAFE_componentWillUpdate(i,z,S)),typeof c.componentDidUpdate=="function"&&(t.flags|=4),typeof c.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof c.componentDidUpdate!="function"||u===e.memoizedProps&&P===e.memoizedState||(t.flags|=4),typeof c.getSnapshotBeforeUpdate!="function"||u===e.memoizedProps&&P===e.memoizedState||(t.flags|=1024),t.memoizedProps=i,t.memoizedState=z),c.props=i,c.state=z,c.context=S,i=U):(typeof c.componentDidUpdate!="function"||u===e.memoizedProps&&P===e.memoizedState||(t.flags|=4),typeof c.getSnapshotBeforeUpdate!="function"||u===e.memoizedProps&&P===e.memoizedState||(t.flags|=1024),i=!1)}return c=i,Nr(e,t),i=(t.flags&128)!==0,c||i?(c=t.stateNode,n=i&&typeof n.getDerivedStateFromError!="function"?null:c.render(),t.flags|=1,e!==null&&i?(t.child=ts(t,e.child,null,l),t.child=ts(t,null,n,l)):It(e,t,n,l),t.memoizedState=c.state,e=t.child):e=Xn(e,t,l),e}function Sp(e,t,n,i){return Ya(),t.flags|=256,It(e,t,n,i),t.child}var Vc={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function Xc(e){return{baseLanes:e,cachePool:mm()}}function Qc(e,t,n){return e=e!==null?e.childLanes&~n:0,t&&(e|=ln),e}function jp(e,t,n){var i=t.pendingProps,l=!1,c=(t.flags&128)!==0,u;if((u=c)||(u=e!==null&&e.memoizedState===null?!1:(pt.current&2)!==0),u&&(l=!0,t.flags&=-129),u=(t.flags&32)!==0,t.flags&=-33,e===null){if(Re){if(l?va(t):ka(),(e=at)?(e=If(e,bn),e=e!==null&&e.data!=="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:ma!==null?{id:Hn,overflow:Wn}:null,retryLane:536870912,hydrationErrors:null},n=sm(e),n.return=t,t.child=n,Ht=t,at=null)):e=null,e===null)throw fa(t);return Ih(e)?t.lanes=32:t.lanes=536870912,null}var p=i.children;return i=i.fallback,l?(ka(),l=t.mode,p=Lr({mode:"hidden",children:p},l),i=Ka(i,l,n,null),p.return=t,i.return=t,p.sibling=i,t.child=p,i=t.child,i.memoizedState=Xc(n),i.childLanes=Qc(e,u,n),t.memoizedState=Vc,Ki(null,i)):(va(t),Zc(t,p))}var S=e.memoizedState;if(S!==null&&(p=S.dehydrated,p!==null)){if(c)t.flags&256?(va(t),t.flags&=-257,t=eh(e,t,n)):t.memoizedState!==null?(ka(),t.child=e.child,t.flags|=128,t=null):(ka(),p=i.fallback,l=t.mode,i=Lr({mode:"visible",children:i.children},l),p=Ka(p,l,n,null),p.flags|=2,i.return=t,p.return=t,i.sibling=p,t.child=i,ts(t,e.child,null,n),i=t.child,i.memoizedState=Xc(n),i.childLanes=Qc(e,u,n),t.memoizedState=Vc,t=Ki(null,i));else if(va(t),Ih(p)){if(u=p.nextSibling&&p.nextSibling.dataset,u)var D=u.dgst;u=D,i=Error(h(419)),i.stack="",i.digest=u,Ri({value:i,source:null,stack:null}),t=eh(e,t,n)}else if(vt||Os(e,t,n,!1),u=(n&e.childLanes)!==0,vt||u){if(u=et,u!==null&&(i=du(u,n),i!==0&&i!==S.retryLane))throw S.retryLane=i,$a(e,i),Xt(u,e,i),Kc;Wh(p)||Pr(),t=eh(e,t,n)}else Wh(p)?(t.flags|=192,t.child=e.child,t=null):(e=S.treeContext,at=kn(p.nextSibling),Ht=t,Re=!0,pa=null,bn=!1,e!==null&&rm(t,e),t=Zc(t,i.children),t.flags|=4096);return t}return l?(ka(),p=i.fallback,l=t.mode,S=e.child,D=S.sibling,i=Bn(S,{mode:"hidden",children:i.children}),i.subtreeFlags=S.subtreeFlags&65011712,D!==null?p=Bn(D,p):(p=Ka(p,l,n,null),p.flags|=2),p.return=t,i.return=t,i.sibling=p,t.child=i,Ki(null,i),i=t.child,p=e.child.memoizedState,p===null?p=Xc(n):(l=p.cachePool,l!==null?(S=wt._currentValue,l=l.parent!==S?{parent:S,pool:S}:l):l=mm(),p={baseLanes:p.baseLanes|n,cachePool:l}),i.memoizedState=p,i.childLanes=Qc(e,u,n),t.memoizedState=Vc,Ki(e.child,i)):(va(t),n=e.child,e=n.sibling,n=Bn(n,{mode:"visible",children:i.children}),n.return=t,n.sibling=null,e!==null&&(u=t.deletions,u===null?(t.deletions=[e],t.flags|=16):u.push(e)),t.child=n,t.memoizedState=null,n)}function Zc(e,t){return t=Lr({mode:"visible",children:t},e.mode),t.return=e,e.child=t}function Lr(e,t){return e=an(22,e,null,t),e.lanes=0,e}function eh(e,t,n){return ts(t,e.child,null,n),e=Zc(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function Mp(e,t,n){e.lanes|=t;var i=e.alternate;i!==null&&(i.lanes|=t),fc(e.return,t,n)}function th(e,t,n,i,l,c){var u=e.memoizedState;u===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:i,tail:n,tailMode:l,treeForkCount:c}:(u.isBackwards=t,u.rendering=null,u.renderingStartTime=0,u.last=i,u.tail=n,u.tailMode=l,u.treeForkCount=c)}function Cp(e,t,n){var i=t.pendingProps,l=i.revealOrder,c=i.tail;i=i.children;var u=pt.current,p=(u&2)!==0;if(p?(u=u&1|2,t.flags|=128):u&=1,K(pt,u),It(e,t,i,n),i=Re?Oi:0,!p&&e!==null&&(e.flags&128)!==0)e:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&Mp(e,n,t);else if(e.tag===19)Mp(e,n,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}switch(l){case"forwards":for(n=t.child,l=null;n!==null;)e=n.alternate,e!==null&&wr(e)===null&&(l=n),n=n.sibling;n=l,n===null?(l=t.child,t.child=null):(l=n.sibling,n.sibling=null),th(t,!1,l,n,c,i);break;case"backwards":case"unstable_legacy-backwards":for(n=null,l=t.child,t.child=null;l!==null;){if(e=l.alternate,e!==null&&wr(e)===null){t.child=l;break}e=l.sibling,l.sibling=n,n=l,l=e}th(t,!0,n,null,c,i);break;case"together":th(t,!1,null,null,void 0,i);break;default:t.memoizedState=null}return t.child}function Xn(e,t,n){if(e!==null&&(t.dependencies=e.dependencies),Sa|=t.lanes,(n&t.childLanes)===0)if(e!==null){if(Os(e,t,n,!1),(n&t.childLanes)===0)return null}else return null;if(e!==null&&t.child!==e.child)throw Error(h(153));if(t.child!==null){for(e=t.child,n=Bn(e,e.pendingProps),t.child=n,n.return=t;e.sibling!==null;)e=e.sibling,n=n.sibling=Bn(e,e.pendingProps),n.return=t;n.sibling=null}return t.child}function nh(e,t){return(e.lanes&t)!==0?!0:(e=e.dependencies,!!(e!==null&&hr(e)))}function qb(e,t,n){switch(t.tag){case 3:le(t,t.stateNode.containerInfo),ya(t,wt,e.memoizedState.cache),Ya();break;case 27:case 5:Fe(t);break;case 4:le(t,t.stateNode.containerInfo);break;case 10:ya(t,t.type,t.memoizedProps.value);break;case 31:if(t.memoizedState!==null)return t.flags|=128,Cc(t),null;break;case 13:var i=t.memoizedState;if(i!==null)return i.dehydrated!==null?(va(t),t.flags|=128,null):(n&t.child.childLanes)!==0?jp(e,t,n):(va(t),e=Xn(e,t,n),e!==null?e.sibling:null);va(t);break;case 19:var l=(e.flags&128)!==0;if(i=(n&t.childLanes)!==0,i||(Os(e,t,n,!1),i=(n&t.childLanes)!==0),l){if(i)return Cp(e,t,n);t.flags|=128}if(l=t.memoizedState,l!==null&&(l.rendering=null,l.tail=null,l.lastEffect=null),K(pt,pt.current),i)break;return null;case 22:return t.lanes=0,bp(e,t,n,t.pendingProps);case 24:ya(t,wt,e.memoizedState.cache)}return Xn(e,t,n)}function Ap(e,t,n){if(e!==null)if(e.memoizedProps!==t.pendingProps)vt=!0;else{if(!nh(e,n)&&(t.flags&128)===0)return vt=!1,qb(e,t,n);vt=(e.flags&131072)!==0}else vt=!1,Re&&(t.flags&1048576)!==0&&om(t,Oi,t.index);switch(t.lanes=0,t.tag){case 16:e:{var i=t.pendingProps;if(e=Za(t.elementType),t.type=e,typeof e=="function")rc(e)?(i=as(e,i),t.tag=1,t=xp(null,t,e,i,n)):(t.tag=0,t=Yc(null,t,e,i,n));else{if(e!=null){var l=e.$$typeof;if(l===ie){t.tag=11,t=yp(null,t,e,i,n);break e}else if(l===B){t.tag=14,t=gp(null,t,e,i,n);break e}}throw t=X(e)||e,Error(h(306,t,""))}}return t;case 0:return Yc(e,t,t.type,t.pendingProps,n);case 1:return i=t.type,l=as(i,t.pendingProps),xp(e,t,i,l,n);case 3:e:{if(le(t,t.stateNode.containerInfo),e===null)throw Error(h(387));i=t.pendingProps;var c=t.memoizedState;l=c.element,Tc(e,t),_i(t,i,null,n);var u=t.memoizedState;if(i=u.cache,ya(t,wt,i),i!==c.cache&&yc(t,[wt],n,!0),Ji(),i=u.element,c.isDehydrated)if(c={element:i,isDehydrated:!1,cache:u.cache},t.updateQueue.baseState=c,t.memoizedState=c,t.flags&256){t=Sp(e,t,i,n);break e}else if(i!==l){l=yn(Error(h(424)),t),Ri(l),t=Sp(e,t,i,n);break e}else for(e=t.stateNode.containerInfo,e.nodeType===9?e=e.body:e=e.nodeName==="HTML"?e.ownerDocument.body:e,at=kn(e.firstChild),Ht=t,Re=!0,pa=null,bn=!0,n=bm(t,null,i,n),t.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling;else{if(Ya(),i===l){t=Xn(e,t,n);break e}It(e,t,i,n)}t=t.child}return t;case 26:return Nr(e,t),e===null?(n=Gf(t.type,null,t.pendingProps,null))?t.memoizedState=n:Re||(n=t.type,e=t.pendingProps,i=Fr(we.current).createElement(n),i[Et]=t,i[Bt]=e,Ot(i,n,e),Mt(i),t.stateNode=i):t.memoizedState=Gf(t.type,e.memoizedProps,t.pendingProps,e.memoizedState),null;case 27:return Fe(t),e===null&&Re&&(i=t.stateNode=qf(t.type,t.pendingProps,we.current),Ht=t,bn=!0,l=at,Na(t.type)?(Oh=l,at=kn(i.firstChild)):at=l),It(e,t,t.pendingProps.children,n),Nr(e,t),e===null&&(t.flags|=4194304),t.child;case 5:return e===null&&Re&&((l=i=at)&&(i=mv(i,t.type,t.pendingProps,bn),i!==null?(t.stateNode=i,Ht=t,at=kn(i.firstChild),bn=!1,l=!0):l=!1),l||fa(t)),Fe(t),l=t.type,c=t.pendingProps,u=e!==null?e.memoizedProps:null,i=c.children,Lh(l,c)?i=null:u!==null&&Lh(l,u)&&(t.flags|=32),t.memoizedState!==null&&(l=Nc(e,t,Ab,null,null,n),co._currentValue=l),Nr(e,t),It(e,t,i,n),t.child;case 6:return e===null&&Re&&((e=n=at)&&(n=pv(n,t.pendingProps,bn),n!==null?(t.stateNode=n,Ht=t,at=null,e=!0):e=!1),e||fa(t)),null;case 13:return jp(e,t,n);case 4:return le(t,t.stateNode.containerInfo),i=t.pendingProps,e===null?t.child=ts(t,null,i,n):It(e,t,i,n),t.child;case 11:return yp(e,t,t.type,t.pendingProps,n);case 7:return It(e,t,t.pendingProps,n),t.child;case 8:return It(e,t,t.pendingProps.children,n),t.child;case 12:return It(e,t,t.pendingProps.children,n),t.child;case 10:return i=t.pendingProps,ya(t,t.type,i.value),It(e,t,i.children,n),t.child;case 9:return l=t.type._context,i=t.pendingProps.children,Xa(t),l=Wt(l),i=i(l),t.flags|=1,It(e,t,i,n),t.child;case 14:return gp(e,t,t.type,t.pendingProps,n);case 15:return wp(e,t,t.type,t.pendingProps,n);case 19:return Cp(e,t,n);case 31:return Rb(e,t,n);case 22:return bp(e,t,n,t.pendingProps);case 24:return Xa(t),i=Wt(wt),e===null?(l=bc(),l===null&&(l=et,c=gc(),l.pooledCache=c,c.refCount++,c!==null&&(l.pooledCacheLanes|=n),l=c),t.memoizedState={parent:i,cache:l},kc(t),ya(t,wt,l)):((e.lanes&n)!==0&&(Tc(e,t),_i(t,null,null,n),Ji()),l=e.memoizedState,c=t.memoizedState,l.parent!==i?(l={parent:i,cache:i},t.memoizedState=l,t.lanes===0&&(t.memoizedState=t.updateQueue.baseState=l),ya(t,wt,i)):(i=c.cache,ya(t,wt,i),i!==l.cache&&yc(t,[wt],n,!0))),It(e,t,t.pendingProps.children,n),t.child;case 29:throw t.pendingProps}throw Error(h(156,t.tag))}function Qn(e){e.flags|=4}function ah(e,t,n,i,l){if((t=(e.mode&32)!==0)&&(t=!1),t){if(e.flags|=16777216,(l&335544128)===l)if(e.stateNode.complete)e.flags|=8192;else if(tf())e.flags|=8192;else throw es=pr,vc}else e.flags&=-16777217}function Np(e,t){if(t.type!=="stylesheet"||(t.state.loading&4)!==0)e.flags&=-16777217;else if(e.flags|=16777216,!Bf(t))if(tf())e.flags|=8192;else throw es=pr,vc}function Er(e,t){t!==null&&(e.flags|=4),e.flags&16384&&(t=e.tag!==22?lu():536870912,e.lanes|=t,$s|=t)}function Yi(e,t){if(!Re)switch(e.tailMode){case"hidden":t=e.tail;for(var n=null;t!==null;)t.alternate!==null&&(n=t),t=t.sibling;n===null?e.tail=null:n.sibling=null;break;case"collapsed":n=e.tail;for(var i=null;n!==null;)n.alternate!==null&&(i=n),n=n.sibling;i===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:i.sibling=null}}function st(e){var t=e.alternate!==null&&e.alternate.child===e.child,n=0,i=0;if(t)for(var l=e.child;l!==null;)n|=l.lanes|l.childLanes,i|=l.subtreeFlags&65011712,i|=l.flags&65011712,l.return=e,l=l.sibling;else for(l=e.child;l!==null;)n|=l.lanes|l.childLanes,i|=l.subtreeFlags,i|=l.flags,l.return=e,l=l.sibling;return e.subtreeFlags|=i,e.childLanes=n,t}function Db(e,t,n){var i=t.pendingProps;switch(dc(t),t.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return st(t),null;case 1:return st(t),null;case 3:return n=t.stateNode,i=null,e!==null&&(i=e.memoizedState.cache),t.memoizedState.cache!==i&&(t.flags|=2048),Kn(wt),be(),n.pendingContext&&(n.context=n.pendingContext,n.pendingContext=null),(e===null||e.child===null)&&(Is(t)?Qn(t):e===null||e.memoizedState.isDehydrated&&(t.flags&256)===0||(t.flags|=1024,mc())),st(t),null;case 26:var l=t.type,c=t.memoizedState;return e===null?(Qn(t),c!==null?(st(t),Np(t,c)):(st(t),ah(t,l,null,i,n))):c?c!==e.memoizedState?(Qn(t),st(t),Np(t,c)):(st(t),t.flags&=-16777217):(e=e.memoizedProps,e!==i&&Qn(t),st(t),ah(t,l,e,i,n)),null;case 27:if(ue(t),n=we.current,l=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==i&&Qn(t);else{if(!i){if(t.stateNode===null)throw Error(h(166));return st(t),null}e=Y.current,Is(t)?lm(t):(e=qf(l,i,n),t.stateNode=e,Qn(t))}return st(t),null;case 5:if(ue(t),l=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==i&&Qn(t);else{if(!i){if(t.stateNode===null)throw Error(h(166));return st(t),null}if(c=Y.current,Is(t))lm(t);else{var u=Fr(we.current);switch(c){case 1:c=u.createElementNS("http://www.w3.org/2000/svg",l);break;case 2:c=u.createElementNS("http://www.w3.org/1998/Math/MathML",l);break;default:switch(l){case"svg":c=u.createElementNS("http://www.w3.org/2000/svg",l);break;case"math":c=u.createElementNS("http://www.w3.org/1998/Math/MathML",l);break;case"script":c=u.createElement("div"),c.innerHTML="<script><\/script>",c=c.removeChild(c.firstChild);break;case"select":c=typeof i.is=="string"?u.createElement("select",{is:i.is}):u.createElement("select"),i.multiple?c.multiple=!0:i.size&&(c.size=i.size);break;default:c=typeof i.is=="string"?u.createElement(l,{is:i.is}):u.createElement(l)}}c[Et]=t,c[Bt]=i;e:for(u=t.child;u!==null;){if(u.tag===5||u.tag===6)c.appendChild(u.stateNode);else if(u.tag!==4&&u.tag!==27&&u.child!==null){u.child.return=u,u=u.child;continue}if(u===t)break e;for(;u.sibling===null;){if(u.return===null||u.return===t)break e;u=u.return}u.sibling.return=u.return,u=u.sibling}t.stateNode=c;e:switch(Ot(c,l,i),l){case"button":case"input":case"select":case"textarea":i=!!i.autoFocus;break e;case"img":i=!0;break e;default:i=!1}i&&Qn(t)}}return st(t),ah(t,t.type,e===null?null:e.memoizedProps,t.pendingProps,n),null;case 6:if(e&&t.stateNode!=null)e.memoizedProps!==i&&Qn(t);else{if(typeof i!="string"&&t.stateNode===null)throw Error(h(166));if(e=we.current,Is(t)){if(e=t.stateNode,n=t.memoizedProps,i=null,l=Ht,l!==null)switch(l.tag){case 27:case 5:i=l.memoizedProps}e[Et]=t,e=!!(e.nodeValue===n||i!==null&&i.suppressHydrationWarning===!0||Mf(e.nodeValue,n)),e||fa(t,!0)}else e=Fr(e).createTextNode(i),e[Et]=t,t.stateNode=e}return st(t),null;case 31:if(n=t.memoizedState,e===null||e.memoizedState!==null){if(i=Is(t),n!==null){if(e===null){if(!i)throw Error(h(318));if(e=t.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(h(557));e[Et]=t}else Ya(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;st(t),e=!1}else n=mc(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=n),e=!0;if(!e)return t.flags&256?(on(t),t):(on(t),null);if((t.flags&128)!==0)throw Error(h(558))}return st(t),null;case 13:if(i=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(l=Is(t),i!==null&&i.dehydrated!==null){if(e===null){if(!l)throw Error(h(318));if(l=t.memoizedState,l=l!==null?l.dehydrated:null,!l)throw Error(h(317));l[Et]=t}else Ya(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;st(t),l=!1}else l=mc(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=l),l=!0;if(!l)return t.flags&256?(on(t),t):(on(t),null)}return on(t),(t.flags&128)!==0?(t.lanes=n,t):(n=i!==null,e=e!==null&&e.memoizedState!==null,n&&(i=t.child,l=null,i.alternate!==null&&i.alternate.memoizedState!==null&&i.alternate.memoizedState.cachePool!==null&&(l=i.alternate.memoizedState.cachePool.pool),c=null,i.memoizedState!==null&&i.memoizedState.cachePool!==null&&(c=i.memoizedState.cachePool.pool),c!==l&&(i.flags|=2048)),n!==e&&n&&(t.child.flags|=8192),Er(t,t.updateQueue),st(t),null);case 4:return be(),e===null&&jh(t.stateNode.containerInfo),st(t),null;case 10:return Kn(t.type),st(t),null;case 19:if(N(pt),i=t.memoizedState,i===null)return st(t),null;if(l=(t.flags&128)!==0,c=i.rendering,c===null)if(l)Yi(i,!1);else{if(mt!==0||e!==null&&(e.flags&128)!==0)for(e=t.child;e!==null;){if(c=wr(e),c!==null){for(t.flags|=128,Yi(i,!1),e=c.updateQueue,t.updateQueue=e,Er(t,e),t.subtreeFlags=0,e=n,n=t.child;n!==null;)am(n,e),n=n.sibling;return K(pt,pt.current&1|2),Re&&Fn(t,i.treeForkCount),t.child}e=e.sibling}i.tail!==null&&Tt()>Rr&&(t.flags|=128,l=!0,Yi(i,!1),t.lanes=4194304)}else{if(!l)if(e=wr(c),e!==null){if(t.flags|=128,l=!0,e=e.updateQueue,t.updateQueue=e,Er(t,e),Yi(i,!0),i.tail===null&&i.tailMode==="hidden"&&!c.alternate&&!Re)return st(t),null}else 2*Tt()-i.renderingStartTime>Rr&&n!==536870912&&(t.flags|=128,l=!0,Yi(i,!1),t.lanes=4194304);i.isBackwards?(c.sibling=t.child,t.child=c):(e=i.last,e!==null?e.sibling=c:t.child=c,i.last=c)}return i.tail!==null?(e=i.tail,i.rendering=e,i.tail=e.sibling,i.renderingStartTime=Tt(),e.sibling=null,n=pt.current,K(pt,l?n&1|2:n&1),Re&&Fn(t,i.treeForkCount),e):(st(t),null);case 22:case 23:return on(t),Mc(),i=t.memoizedState!==null,e!==null?e.memoizedState!==null!==i&&(t.flags|=8192):i&&(t.flags|=8192),i?(n&536870912)!==0&&(t.flags&128)===0&&(st(t),t.subtreeFlags&6&&(t.flags|=8192)):st(t),n=t.updateQueue,n!==null&&Er(t,n.retryQueue),n=null,e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(n=e.memoizedState.cachePool.pool),i=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(i=t.memoizedState.cachePool.pool),i!==n&&(t.flags|=2048),e!==null&&N(Qa),null;case 24:return n=null,e!==null&&(n=e.memoizedState.cache),t.memoizedState.cache!==n&&(t.flags|=2048),Kn(wt),st(t),null;case 25:return null;case 30:return null}throw Error(h(156,t.tag))}function Pb(e,t){switch(dc(t),t.tag){case 1:return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return Kn(wt),be(),e=t.flags,(e&65536)!==0&&(e&128)===0?(t.flags=e&-65537|128,t):null;case 26:case 27:case 5:return ue(t),null;case 31:if(t.memoizedState!==null){if(on(t),t.alternate===null)throw Error(h(340));Ya()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 13:if(on(t),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(h(340));Ya()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return N(pt),null;case 4:return be(),null;case 10:return Kn(t.type),null;case 22:case 23:return on(t),Mc(),e!==null&&N(Qa),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 24:return Kn(wt),null;case 25:return null;default:return null}}function Lp(e,t){switch(dc(t),t.tag){case 3:Kn(wt),be();break;case 26:case 27:case 5:ue(t);break;case 4:be();break;case 31:t.memoizedState!==null&&on(t);break;case 13:on(t);break;case 19:N(pt);break;case 10:Kn(t.type);break;case 22:case 23:on(t),Mc(),e!==null&&N(Qa);break;case 24:Kn(wt)}}function Vi(e,t){try{var n=t.updateQueue,i=n!==null?n.lastEffect:null;if(i!==null){var l=i.next;n=l;do{if((n.tag&e)===e){i=void 0;var c=n.create,u=n.inst;i=c(),u.destroy=i}n=n.next}while(n!==l)}}catch(p){Ke(t,t.return,p)}}function Ta(e,t,n){try{var i=t.updateQueue,l=i!==null?i.lastEffect:null;if(l!==null){var c=l.next;i=c;do{if((i.tag&e)===e){var u=i.inst,p=u.destroy;if(p!==void 0){u.destroy=void 0,l=t;var S=n,D=p;try{D()}catch(U){Ke(l,S,U)}}}i=i.next}while(i!==c)}}catch(U){Ke(t,t.return,U)}}function Ep(e){var t=e.updateQueue;if(t!==null){var n=e.stateNode;try{km(t,n)}catch(i){Ke(e,e.return,i)}}}function Hp(e,t,n){n.props=as(e.type,e.memoizedProps),n.state=e.memoizedState;try{n.componentWillUnmount()}catch(i){Ke(e,t,i)}}function Xi(e,t){try{var n=e.ref;if(n!==null){switch(e.tag){case 26:case 27:case 5:var i=e.stateNode;break;case 30:i=e.stateNode;break;default:i=e.stateNode}typeof n=="function"?e.refCleanup=n(i):n.current=i}}catch(l){Ke(e,t,l)}}function In(e,t){var n=e.ref,i=e.refCleanup;if(n!==null)if(typeof i=="function")try{i()}catch(l){Ke(e,t,l)}finally{e.refCleanup=null,e=e.alternate,e!=null&&(e.refCleanup=null)}else if(typeof n=="function")try{n(null)}catch(l){Ke(e,t,l)}else n.current=null}function Wp(e){var t=e.type,n=e.memoizedProps,i=e.stateNode;try{e:switch(t){case"button":case"input":case"select":case"textarea":n.autoFocus&&i.focus();break e;case"img":n.src?i.src=n.src:n.srcSet&&(i.srcset=n.srcSet)}}catch(l){Ke(e,e.return,l)}}function sh(e,t,n){try{var i=e.stateNode;rv(i,e.type,n,t),i[Bt]=t}catch(l){Ke(e,e.return,l)}}function Ip(e){return e.tag===5||e.tag===3||e.tag===26||e.tag===27&&Na(e.type)||e.tag===4}function ih(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||Ip(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.tag===27&&Na(e.type)||e.flags&2||e.child===null||e.tag===4)continue e;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function oh(e,t,n){var i=e.tag;if(i===5||i===6)e=e.stateNode,t?(n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n).insertBefore(e,t):(t=n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n,t.appendChild(e),n=n._reactRootContainer,n!=null||t.onclick!==null||(t.onclick=_n));else if(i!==4&&(i===27&&Na(e.type)&&(n=e.stateNode,t=null),e=e.child,e!==null))for(oh(e,t,n),e=e.sibling;e!==null;)oh(e,t,n),e=e.sibling}function Hr(e,t,n){var i=e.tag;if(i===5||i===6)e=e.stateNode,t?n.insertBefore(e,t):n.appendChild(e);else if(i!==4&&(i===27&&Na(e.type)&&(n=e.stateNode),e=e.child,e!==null))for(Hr(e,t,n),e=e.sibling;e!==null;)Hr(e,t,n),e=e.sibling}function Op(e){var t=e.stateNode,n=e.memoizedProps;try{for(var i=e.type,l=t.attributes;l.length;)t.removeAttributeNode(l[0]);Ot(t,i,n),t[Et]=e,t[Bt]=n}catch(c){Ke(e,e.return,c)}}var Zn=!1,kt=!1,rh=!1,Rp=typeof WeakSet=="function"?WeakSet:Set,Ct=null;function Gb(e,t){if(e=e.containerInfo,Ah=Zr,e=Ku(e),ec(e)){if("selectionStart"in e)var n={start:e.selectionStart,end:e.selectionEnd};else e:{n=(n=e.ownerDocument)&&n.defaultView||window;var i=n.getSelection&&n.getSelection();if(i&&i.rangeCount!==0){n=i.anchorNode;var l=i.anchorOffset,c=i.focusNode;i=i.focusOffset;try{n.nodeType,c.nodeType}catch{n=null;break e}var u=0,p=-1,S=-1,D=0,U=0,V=e,P=null;t:for(;;){for(var z;V!==n||l!==0&&V.nodeType!==3||(p=u+l),V!==c||i!==0&&V.nodeType!==3||(S=u+i),V.nodeType===3&&(u+=V.nodeValue.length),(z=V.firstChild)!==null;)P=V,V=z;for(;;){if(V===e)break t;if(P===n&&++D===l&&(p=u),P===c&&++U===i&&(S=u),(z=V.nextSibling)!==null)break;V=P,P=V.parentNode}V=z}n=p===-1||S===-1?null:{start:p,end:S}}else n=null}n=n||{start:0,end:0}}else n=null;for(Nh={focusedElem:e,selectionRange:n},Zr=!1,Ct=t;Ct!==null;)if(t=Ct,e=t.child,(t.subtreeFlags&1028)!==0&&e!==null)e.return=t,Ct=e;else for(;Ct!==null;){switch(t=Ct,c=t.alternate,e=t.flags,t.tag){case 0:if((e&4)!==0&&(e=t.updateQueue,e=e!==null?e.events:null,e!==null))for(n=0;n<e.length;n++)l=e[n],l.ref.impl=l.nextImpl;break;case 11:case 15:break;case 1:if((e&1024)!==0&&c!==null){e=void 0,n=t,l=c.memoizedProps,c=c.memoizedState,i=n.stateNode;try{var me=as(n.type,l);e=i.getSnapshotBeforeUpdate(me,c),i.__reactInternalSnapshotBeforeUpdate=e}catch(ke){Ke(n,n.return,ke)}}break;case 3:if((e&1024)!==0){if(e=t.stateNode.containerInfo,n=e.nodeType,n===9)Hh(e);else if(n===1)switch(e.nodeName){case"HEAD":case"HTML":case"BODY":Hh(e);break;default:e.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;default:if((e&1024)!==0)throw Error(h(163))}if(e=t.sibling,e!==null){e.return=t.return,Ct=e;break}Ct=t.return}}function qp(e,t,n){var i=n.flags;switch(n.tag){case 0:case 11:case 15:ta(e,n),i&4&&Vi(5,n);break;case 1:if(ta(e,n),i&4)if(e=n.stateNode,t===null)try{e.componentDidMount()}catch(u){Ke(n,n.return,u)}else{var l=as(n.type,t.memoizedProps);t=t.memoizedState;try{e.componentDidUpdate(l,t,e.__reactInternalSnapshotBeforeUpdate)}catch(u){Ke(n,n.return,u)}}i&64&&Ep(n),i&512&&Xi(n,n.return);break;case 3:if(ta(e,n),i&64&&(e=n.updateQueue,e!==null)){if(t=null,n.child!==null)switch(n.child.tag){case 27:case 5:t=n.child.stateNode;break;case 1:t=n.child.stateNode}try{km(e,t)}catch(u){Ke(n,n.return,u)}}break;case 27:t===null&&i&4&&Op(n);case 26:case 5:ta(e,n),t===null&&i&4&&Wp(n),i&512&&Xi(n,n.return);break;case 12:ta(e,n);break;case 31:ta(e,n),i&4&&Gp(e,n);break;case 13:ta(e,n),i&4&&zp(e,n),i&64&&(e=n.memoizedState,e!==null&&(e=e.dehydrated,e!==null&&(n=Yb.bind(null,n),fv(e,n))));break;case 22:if(i=n.memoizedState!==null||Zn,!i){t=t!==null&&t.memoizedState!==null||kt,l=Zn;var c=kt;Zn=i,(kt=t)&&!c?na(e,n,(n.subtreeFlags&8772)!==0):ta(e,n),Zn=l,kt=c}break;case 30:break;default:ta(e,n)}}function Dp(e){var t=e.alternate;t!==null&&(e.alternate=null,Dp(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&ql(t)),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}var ct=null,$t=!1;function ea(e,t,n){for(n=n.child;n!==null;)Pp(e,t,n),n=n.sibling}function Pp(e,t,n){if(rt&&typeof rt.onCommitFiberUnmount=="function")try{rt.onCommitFiberUnmount(un,n)}catch{}switch(n.tag){case 26:kt||In(n,t),ea(e,t,n),n.memoizedState?n.memoizedState.count--:n.stateNode&&(n=n.stateNode,n.parentNode.removeChild(n));break;case 27:kt||In(n,t);var i=ct,l=$t;Na(n.type)&&(ct=n.stateNode,$t=!1),ea(e,t,n),oo(n.stateNode),ct=i,$t=l;break;case 5:kt||In(n,t);case 6:if(i=ct,l=$t,ct=null,ea(e,t,n),ct=i,$t=l,ct!==null)if($t)try{(ct.nodeType===9?ct.body:ct.nodeName==="HTML"?ct.ownerDocument.body:ct).removeChild(n.stateNode)}catch(c){Ke(n,t,c)}else try{ct.removeChild(n.stateNode)}catch(c){Ke(n,t,c)}break;case 18:ct!==null&&($t?(e=ct,Hf(e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,n.stateNode),ti(e)):Hf(ct,n.stateNode));break;case 4:i=ct,l=$t,ct=n.stateNode.containerInfo,$t=!0,ea(e,t,n),ct=i,$t=l;break;case 0:case 11:case 14:case 15:Ta(2,n,t),kt||Ta(4,n,t),ea(e,t,n);break;case 1:kt||(In(n,t),i=n.stateNode,typeof i.componentWillUnmount=="function"&&Hp(n,t,i)),ea(e,t,n);break;case 21:ea(e,t,n);break;case 22:kt=(i=kt)||n.memoizedState!==null,ea(e,t,n),kt=i;break;default:ea(e,t,n)}}function Gp(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null))){e=e.dehydrated;try{ti(e)}catch(n){Ke(t,t.return,n)}}}function zp(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null&&(e=e.dehydrated,e!==null))))try{ti(e)}catch(n){Ke(t,t.return,n)}}function zb(e){switch(e.tag){case 31:case 13:case 19:var t=e.stateNode;return t===null&&(t=e.stateNode=new Rp),t;case 22:return e=e.stateNode,t=e._retryCache,t===null&&(t=e._retryCache=new Rp),t;default:throw Error(h(435,e.tag))}}function Wr(e,t){var n=zb(e);t.forEach(function(i){if(!n.has(i)){n.add(i);var l=Vb.bind(null,e,i);i.then(l,l)}})}function Kt(e,t){var n=t.deletions;if(n!==null)for(var i=0;i<n.length;i++){var l=n[i],c=e,u=t,p=u;e:for(;p!==null;){switch(p.tag){case 27:if(Na(p.type)){ct=p.stateNode,$t=!1;break e}break;case 5:ct=p.stateNode,$t=!1;break e;case 3:case 4:ct=p.stateNode.containerInfo,$t=!0;break e}p=p.return}if(ct===null)throw Error(h(160));Pp(c,u,l),ct=null,$t=!1,c=l.alternate,c!==null&&(c.return=null),l.return=null}if(t.subtreeFlags&13886)for(t=t.child;t!==null;)Jp(t,e),t=t.sibling}var An=null;function Jp(e,t){var n=e.alternate,i=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:Kt(t,e),Yt(e),i&4&&(Ta(3,e,e.return),Vi(3,e),Ta(5,e,e.return));break;case 1:Kt(t,e),Yt(e),i&512&&(kt||n===null||In(n,n.return)),i&64&&Zn&&(e=e.updateQueue,e!==null&&(i=e.callbacks,i!==null&&(n=e.shared.hiddenCallbacks,e.shared.hiddenCallbacks=n===null?i:n.concat(i))));break;case 26:var l=An;if(Kt(t,e),Yt(e),i&512&&(kt||n===null||In(n,n.return)),i&4){var c=n!==null?n.memoizedState:null;if(i=e.memoizedState,n===null)if(i===null)if(e.stateNode===null){e:{i=e.type,n=e.memoizedProps,l=l.ownerDocument||l;t:switch(i){case"title":c=l.getElementsByTagName("title")[0],(!c||c[Si]||c[Et]||c.namespaceURI==="http://www.w3.org/2000/svg"||c.hasAttribute("itemprop"))&&(c=l.createElement(i),l.head.insertBefore(c,l.querySelector("head > title"))),Ot(c,i,n),c[Et]=e,Mt(c),i=c;break e;case"link":var u=_f("link","href",l).get(i+(n.href||""));if(u){for(var p=0;p<u.length;p++)if(c=u[p],c.getAttribute("href")===(n.href==null||n.href===""?null:n.href)&&c.getAttribute("rel")===(n.rel==null?null:n.rel)&&c.getAttribute("title")===(n.title==null?null:n.title)&&c.getAttribute("crossorigin")===(n.crossOrigin==null?null:n.crossOrigin)){u.splice(p,1);break t}}c=l.createElement(i),Ot(c,i,n),l.head.appendChild(c);break;case"meta":if(u=_f("meta","content",l).get(i+(n.content||""))){for(p=0;p<u.length;p++)if(c=u[p],c.getAttribute("content")===(n.content==null?null:""+n.content)&&c.getAttribute("name")===(n.name==null?null:n.name)&&c.getAttribute("property")===(n.property==null?null:n.property)&&c.getAttribute("http-equiv")===(n.httpEquiv==null?null:n.httpEquiv)&&c.getAttribute("charset")===(n.charSet==null?null:n.charSet)){u.splice(p,1);break t}}c=l.createElement(i),Ot(c,i,n),l.head.appendChild(c);break;default:throw Error(h(468,i))}c[Et]=e,Mt(c),i=c}e.stateNode=i}else Uf(l,e.type,e.stateNode);else e.stateNode=Jf(l,i,e.memoizedProps);else c!==i?(c===null?n.stateNode!==null&&(n=n.stateNode,n.parentNode.removeChild(n)):c.count--,i===null?Uf(l,e.type,e.stateNode):Jf(l,i,e.memoizedProps)):i===null&&e.stateNode!==null&&sh(e,e.memoizedProps,n.memoizedProps)}break;case 27:Kt(t,e),Yt(e),i&512&&(kt||n===null||In(n,n.return)),n!==null&&i&4&&sh(e,e.memoizedProps,n.memoizedProps);break;case 5:if(Kt(t,e),Yt(e),i&512&&(kt||n===null||In(n,n.return)),e.flags&32){l=e.stateNode;try{Ss(l,"")}catch(me){Ke(e,e.return,me)}}i&4&&e.stateNode!=null&&(l=e.memoizedProps,sh(e,l,n!==null?n.memoizedProps:l)),i&1024&&(rh=!0);break;case 6:if(Kt(t,e),Yt(e),i&4){if(e.stateNode===null)throw Error(h(162));i=e.memoizedProps,n=e.stateNode;try{n.nodeValue=i}catch(me){Ke(e,e.return,me)}}break;case 3:if(Yr=null,l=An,An=$r(t.containerInfo),Kt(t,e),An=l,Yt(e),i&4&&n!==null&&n.memoizedState.isDehydrated)try{ti(t.containerInfo)}catch(me){Ke(e,e.return,me)}rh&&(rh=!1,_p(e));break;case 4:i=An,An=$r(e.stateNode.containerInfo),Kt(t,e),Yt(e),An=i;break;case 12:Kt(t,e),Yt(e);break;case 31:Kt(t,e),Yt(e),i&4&&(i=e.updateQueue,i!==null&&(e.updateQueue=null,Wr(e,i)));break;case 13:Kt(t,e),Yt(e),e.child.flags&8192&&e.memoizedState!==null!=(n!==null&&n.memoizedState!==null)&&(Or=Tt()),i&4&&(i=e.updateQueue,i!==null&&(e.updateQueue=null,Wr(e,i)));break;case 22:l=e.memoizedState!==null;var S=n!==null&&n.memoizedState!==null,D=Zn,U=kt;if(Zn=D||l,kt=U||S,Kt(t,e),kt=U,Zn=D,Yt(e),i&8192)e:for(t=e.stateNode,t._visibility=l?t._visibility&-2:t._visibility|1,l&&(n===null||S||Zn||kt||ss(e)),n=null,t=e;;){if(t.tag===5||t.tag===26){if(n===null){S=n=t;try{if(c=S.stateNode,l)u=c.style,typeof u.setProperty=="function"?u.setProperty("display","none","important"):u.display="none";else{p=S.stateNode;var V=S.memoizedProps.style,P=V!=null&&V.hasOwnProperty("display")?V.display:null;p.style.display=P==null||typeof P=="boolean"?"":(""+P).trim()}}catch(me){Ke(S,S.return,me)}}}else if(t.tag===6){if(n===null){S=t;try{S.stateNode.nodeValue=l?"":S.memoizedProps}catch(me){Ke(S,S.return,me)}}}else if(t.tag===18){if(n===null){S=t;try{var z=S.stateNode;l?Wf(z,!0):Wf(S.stateNode,!1)}catch(me){Ke(S,S.return,me)}}}else if((t.tag!==22&&t.tag!==23||t.memoizedState===null||t===e)&&t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break e;for(;t.sibling===null;){if(t.return===null||t.return===e)break e;n===t&&(n=null),t=t.return}n===t&&(n=null),t.sibling.return=t.return,t=t.sibling}i&4&&(i=e.updateQueue,i!==null&&(n=i.retryQueue,n!==null&&(i.retryQueue=null,Wr(e,n))));break;case 19:Kt(t,e),Yt(e),i&4&&(i=e.updateQueue,i!==null&&(e.updateQueue=null,Wr(e,i)));break;case 30:break;case 21:break;default:Kt(t,e),Yt(e)}}function Yt(e){var t=e.flags;if(t&2){try{for(var n,i=e.return;i!==null;){if(Ip(i)){n=i;break}i=i.return}if(n==null)throw Error(h(160));switch(n.tag){case 27:var l=n.stateNode,c=ih(e);Hr(e,c,l);break;case 5:var u=n.stateNode;n.flags&32&&(Ss(u,""),n.flags&=-33);var p=ih(e);Hr(e,p,u);break;case 3:case 4:var S=n.stateNode.containerInfo,D=ih(e);oh(e,D,S);break;default:throw Error(h(161))}}catch(U){Ke(e,e.return,U)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function _p(e){if(e.subtreeFlags&1024)for(e=e.child;e!==null;){var t=e;_p(t),t.tag===5&&t.flags&1024&&t.stateNode.reset(),e=e.sibling}}function ta(e,t){if(t.subtreeFlags&8772)for(t=t.child;t!==null;)qp(e,t.alternate,t),t=t.sibling}function ss(e){for(e=e.child;e!==null;){var t=e;switch(t.tag){case 0:case 11:case 14:case 15:Ta(4,t,t.return),ss(t);break;case 1:In(t,t.return);var n=t.stateNode;typeof n.componentWillUnmount=="function"&&Hp(t,t.return,n),ss(t);break;case 27:oo(t.stateNode);case 26:case 5:In(t,t.return),ss(t);break;case 22:t.memoizedState===null&&ss(t);break;case 30:ss(t);break;default:ss(t)}e=e.sibling}}function na(e,t,n){for(n=n&&(t.subtreeFlags&8772)!==0,t=t.child;t!==null;){var i=t.alternate,l=e,c=t,u=c.flags;switch(c.tag){case 0:case 11:case 15:na(l,c,n),Vi(4,c);break;case 1:if(na(l,c,n),i=c,l=i.stateNode,typeof l.componentDidMount=="function")try{l.componentDidMount()}catch(D){Ke(i,i.return,D)}if(i=c,l=i.updateQueue,l!==null){var p=i.stateNode;try{var S=l.shared.hiddenCallbacks;if(S!==null)for(l.shared.hiddenCallbacks=null,l=0;l<S.length;l++)vm(S[l],p)}catch(D){Ke(i,i.return,D)}}n&&u&64&&Ep(c),Xi(c,c.return);break;case 27:Op(c);case 26:case 5:na(l,c,n),n&&i===null&&u&4&&Wp(c),Xi(c,c.return);break;case 12:na(l,c,n);break;case 31:na(l,c,n),n&&u&4&&Gp(l,c);break;case 13:na(l,c,n),n&&u&4&&zp(l,c);break;case 22:c.memoizedState===null&&na(l,c,n),Xi(c,c.return);break;case 30:break;default:na(l,c,n)}t=t.sibling}}function lh(e,t){var n=null;e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(n=e.memoizedState.cachePool.pool),e=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(e=t.memoizedState.cachePool.pool),e!==n&&(e!=null&&e.refCount++,n!=null&&qi(n))}function ch(e,t){e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&qi(e))}function Nn(e,t,n,i){if(t.subtreeFlags&10256)for(t=t.child;t!==null;)Up(e,t,n,i),t=t.sibling}function Up(e,t,n,i){var l=t.flags;switch(t.tag){case 0:case 11:case 15:Nn(e,t,n,i),l&2048&&Vi(9,t);break;case 1:Nn(e,t,n,i);break;case 3:Nn(e,t,n,i),l&2048&&(e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&qi(e)));break;case 12:if(l&2048){Nn(e,t,n,i),e=t.stateNode;try{var c=t.memoizedProps,u=c.id,p=c.onPostCommit;typeof p=="function"&&p(u,t.alternate===null?"mount":"update",e.passiveEffectDuration,-0)}catch(S){Ke(t,t.return,S)}}else Nn(e,t,n,i);break;case 31:Nn(e,t,n,i);break;case 13:Nn(e,t,n,i);break;case 23:break;case 22:c=t.stateNode,u=t.alternate,t.memoizedState!==null?c._visibility&2?Nn(e,t,n,i):Qi(e,t):c._visibility&2?Nn(e,t,n,i):(c._visibility|=2,Us(e,t,n,i,(t.subtreeFlags&10256)!==0||!1)),l&2048&&lh(u,t);break;case 24:Nn(e,t,n,i),l&2048&&ch(t.alternate,t);break;default:Nn(e,t,n,i)}}function Us(e,t,n,i,l){for(l=l&&((t.subtreeFlags&10256)!==0||!1),t=t.child;t!==null;){var c=e,u=t,p=n,S=i,D=u.flags;switch(u.tag){case 0:case 11:case 15:Us(c,u,p,S,l),Vi(8,u);break;case 23:break;case 22:var U=u.stateNode;u.memoizedState!==null?U._visibility&2?Us(c,u,p,S,l):Qi(c,u):(U._visibility|=2,Us(c,u,p,S,l)),l&&D&2048&&lh(u.alternate,u);break;case 24:Us(c,u,p,S,l),l&&D&2048&&ch(u.alternate,u);break;default:Us(c,u,p,S,l)}t=t.sibling}}function Qi(e,t){if(t.subtreeFlags&10256)for(t=t.child;t!==null;){var n=e,i=t,l=i.flags;switch(i.tag){case 22:Qi(n,i),l&2048&&lh(i.alternate,i);break;case 24:Qi(n,i),l&2048&&ch(i.alternate,i);break;default:Qi(n,i)}t=t.sibling}}var Zi=8192;function Bs(e,t,n){if(e.subtreeFlags&Zi)for(e=e.child;e!==null;)Bp(e,t,n),e=e.sibling}function Bp(e,t,n){switch(e.tag){case 26:Bs(e,t,n),e.flags&Zi&&e.memoizedState!==null&&Cv(n,An,e.memoizedState,e.memoizedProps);break;case 5:Bs(e,t,n);break;case 3:case 4:var i=An;An=$r(e.stateNode.containerInfo),Bs(e,t,n),An=i;break;case 22:e.memoizedState===null&&(i=e.alternate,i!==null&&i.memoizedState!==null?(i=Zi,Zi=16777216,Bs(e,t,n),Zi=i):Bs(e,t,n));break;default:Bs(e,t,n)}}function Fp(e){var t=e.alternate;if(t!==null&&(e=t.child,e!==null)){t.child=null;do t=e.sibling,e.sibling=null,e=t;while(e!==null)}}function eo(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var n=0;n<t.length;n++){var i=t[n];Ct=i,Kp(i,e)}Fp(e)}if(e.subtreeFlags&10256)for(e=e.child;e!==null;)$p(e),e=e.sibling}function $p(e){switch(e.tag){case 0:case 11:case 15:eo(e),e.flags&2048&&Ta(9,e,e.return);break;case 3:eo(e);break;case 12:eo(e);break;case 22:var t=e.stateNode;e.memoizedState!==null&&t._visibility&2&&(e.return===null||e.return.tag!==13)?(t._visibility&=-3,Ir(e)):eo(e);break;default:eo(e)}}function Ir(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var n=0;n<t.length;n++){var i=t[n];Ct=i,Kp(i,e)}Fp(e)}for(e=e.child;e!==null;){switch(t=e,t.tag){case 0:case 11:case 15:Ta(8,t,t.return),Ir(t);break;case 22:n=t.stateNode,n._visibility&2&&(n._visibility&=-3,Ir(t));break;default:Ir(t)}e=e.sibling}}function Kp(e,t){for(;Ct!==null;){var n=Ct;switch(n.tag){case 0:case 11:case 15:Ta(8,n,t);break;case 23:case 22:if(n.memoizedState!==null&&n.memoizedState.cachePool!==null){var i=n.memoizedState.cachePool.pool;i!=null&&i.refCount++}break;case 24:qi(n.memoizedState.cache)}if(i=n.child,i!==null)i.return=n,Ct=i;else e:for(n=e;Ct!==null;){i=Ct;var l=i.sibling,c=i.return;if(Dp(i),i===n){Ct=null;break e}if(l!==null){l.return=c,Ct=l;break e}Ct=c}}}var Jb={getCacheForType:function(e){var t=Wt(wt),n=t.data.get(e);return n===void 0&&(n=e(),t.data.set(e,n)),n},cacheSignal:function(){return Wt(wt).controller.signal}},_b=typeof WeakMap=="function"?WeakMap:Map,Ue=0,et=null,Le=null,We=0,$e=0,rn=null,xa=!1,Fs=!1,hh=!1,aa=0,mt=0,Sa=0,is=0,dh=0,ln=0,$s=0,to=null,Vt=null,uh=!1,Or=0,Yp=0,Rr=1/0,qr=null,ja=null,St=0,Ma=null,Ks=null,sa=0,mh=0,ph=null,Vp=null,no=0,fh=null;function cn(){return(Ue&2)!==0&&We!==0?We&-We:v.T!==null?kh():uu()}function Xp(){if(ln===0)if((We&536870912)===0||Re){var e=Bo;Bo<<=1,(Bo&3932160)===0&&(Bo=262144),ln=e}else ln=536870912;return e=sn.current,e!==null&&(e.flags|=32),ln}function Xt(e,t,n){(e===et&&($e===2||$e===9)||e.cancelPendingCommit!==null)&&(Ys(e,0),Ca(e,We,ln,!1)),xi(e,n),((Ue&2)===0||e!==et)&&(e===et&&((Ue&2)===0&&(is|=n),mt===4&&Ca(e,We,ln,!1)),On(e))}function Qp(e,t,n){if((Ue&6)!==0)throw Error(h(327));var i=!n&&(t&127)===0&&(t&e.expiredLanes)===0||Ti(e,t),l=i?Fb(e,t):gh(e,t,!0),c=i;do{if(l===0){Fs&&!i&&Ca(e,t,0,!1);break}else{if(n=e.current.alternate,c&&!Ub(n)){l=gh(e,t,!1),c=!1;continue}if(l===2){if(c=t,e.errorRecoveryDisabledLanes&c)var u=0;else u=e.pendingLanes&-536870913,u=u!==0?u:u&536870912?536870912:0;if(u!==0){t=u;e:{var p=e;l=to;var S=p.current.memoizedState.isDehydrated;if(S&&(Ys(p,u).flags|=256),u=gh(p,u,!1),u!==2){if(hh&&!S){p.errorRecoveryDisabledLanes|=c,is|=c,l=4;break e}c=Vt,Vt=l,c!==null&&(Vt===null?Vt=c:Vt.push.apply(Vt,c))}l=u}if(c=!1,l!==2)continue}}if(l===1){Ys(e,0),Ca(e,t,0,!0);break}e:{switch(i=e,c=l,c){case 0:case 1:throw Error(h(345));case 4:if((t&4194048)!==t)break;case 6:Ca(i,t,ln,!xa);break e;case 2:Vt=null;break;case 3:case 5:break;default:throw Error(h(329))}if((t&62914560)===t&&(l=Or+300-Tt(),10<l)){if(Ca(i,t,ln,!xa),$o(i,0,!0)!==0)break e;sa=t,i.timeoutHandle=Lf(Zp.bind(null,i,n,Vt,qr,uh,t,ln,is,$s,xa,c,"Throttled",-0,0),l);break e}Zp(i,n,Vt,qr,uh,t,ln,is,$s,xa,c,null,-0,0)}}break}while(!0);On(e)}function Zp(e,t,n,i,l,c,u,p,S,D,U,V,P,z){if(e.timeoutHandle=-1,V=t.subtreeFlags,V&8192||(V&16785408)===16785408){V={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:_n},Bp(t,c,V);var me=(c&62914560)===c?Or-Tt():(c&4194048)===c?Yp-Tt():0;if(me=Av(V,me),me!==null){sa=c,e.cancelPendingCommit=me(lf.bind(null,e,t,c,n,i,l,u,p,S,U,V,null,P,z)),Ca(e,c,u,!D);return}}lf(e,t,c,n,i,l,u,p,S)}function Ub(e){for(var t=e;;){var n=t.tag;if((n===0||n===11||n===15)&&t.flags&16384&&(n=t.updateQueue,n!==null&&(n=n.stores,n!==null)))for(var i=0;i<n.length;i++){var l=n[i],c=l.getSnapshot;l=l.value;try{if(!nn(c(),l))return!1}catch{return!1}}if(n=t.child,t.subtreeFlags&16384&&n!==null)n.return=t,t=n;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function Ca(e,t,n,i){t&=~dh,t&=~is,e.suspendedLanes|=t,e.pingedLanes&=~t,i&&(e.warmLanes|=t),i=e.expirationTimes;for(var l=t;0<l;){var c=31-Ne(l),u=1<<c;i[c]=-1,l&=~u}n!==0&&cu(e,n,t)}function Dr(){return(Ue&6)===0?(ao(0),!1):!0}function yh(){if(Le!==null){if($e===0)var e=Le.return;else e=Le,$n=Va=null,Hc(e),Ps=null,Pi=0,e=Le;for(;e!==null;)Lp(e.alternate,e),e=e.return;Le=null}}function Ys(e,t){var n=e.timeoutHandle;n!==-1&&(e.timeoutHandle=-1,hv(n)),n=e.cancelPendingCommit,n!==null&&(e.cancelPendingCommit=null,n()),sa=0,yh(),et=e,Le=n=Bn(e.current,null),We=t,$e=0,rn=null,xa=!1,Fs=Ti(e,t),hh=!1,$s=ln=dh=is=Sa=mt=0,Vt=to=null,uh=!1,(t&8)!==0&&(t|=t&32);var i=e.entangledLanes;if(i!==0)for(e=e.entanglements,i&=t;0<i;){var l=31-Ne(i),c=1<<l;t|=e[l],i&=~c}return aa=t,ir(),n}function ef(e,t){Se=null,v.H=$i,t===Ds||t===mr?(t=ym(),$e=3):t===vc?(t=ym(),$e=4):$e=t===Kc?8:t!==null&&typeof t=="object"&&typeof t.then=="function"?6:1,rn=t,Le===null&&(mt=1,Cr(e,yn(t,e.current)))}function tf(){var e=sn.current;return e===null?!0:(We&4194048)===We?vn===null:(We&62914560)===We||(We&536870912)!==0?e===vn:!1}function nf(){var e=v.H;return v.H=$i,e===null?$i:e}function af(){var e=v.A;return v.A=Jb,e}function Pr(){mt=4,xa||(We&4194048)!==We&&sn.current!==null||(Fs=!0),(Sa&134217727)===0&&(is&134217727)===0||et===null||Ca(et,We,ln,!1)}function gh(e,t,n){var i=Ue;Ue|=2;var l=nf(),c=af();(et!==e||We!==t)&&(qr=null,Ys(e,t)),t=!1;var u=mt;e:do try{if($e!==0&&Le!==null){var p=Le,S=rn;switch($e){case 8:yh(),u=6;break e;case 3:case 2:case 9:case 6:sn.current===null&&(t=!0);var D=$e;if($e=0,rn=null,Vs(e,p,S,D),n&&Fs){u=0;break e}break;default:D=$e,$e=0,rn=null,Vs(e,p,S,D)}}Bb(),u=mt;break}catch(U){ef(e,U)}while(!0);return t&&e.shellSuspendCounter++,$n=Va=null,Ue=i,v.H=l,v.A=c,Le===null&&(et=null,We=0,ir()),u}function Bb(){for(;Le!==null;)sf(Le)}function Fb(e,t){var n=Ue;Ue|=2;var i=nf(),l=af();et!==e||We!==t?(qr=null,Rr=Tt()+500,Ys(e,t)):Fs=Ti(e,t);e:do try{if($e!==0&&Le!==null){t=Le;var c=rn;t:switch($e){case 1:$e=0,rn=null,Vs(e,t,c,1);break;case 2:case 9:if(pm(c)){$e=0,rn=null,of(t);break}t=function(){$e!==2&&$e!==9||et!==e||($e=7),On(e)},c.then(t,t);break e;case 3:$e=7;break e;case 4:$e=5;break e;case 7:pm(c)?($e=0,rn=null,of(t)):($e=0,rn=null,Vs(e,t,c,7));break;case 5:var u=null;switch(Le.tag){case 26:u=Le.memoizedState;case 5:case 27:var p=Le;if(u?Bf(u):p.stateNode.complete){$e=0,rn=null;var S=p.sibling;if(S!==null)Le=S;else{var D=p.return;D!==null?(Le=D,Gr(D)):Le=null}break t}}$e=0,rn=null,Vs(e,t,c,5);break;case 6:$e=0,rn=null,Vs(e,t,c,6);break;case 8:yh(),mt=6;break e;default:throw Error(h(462))}}$b();break}catch(U){ef(e,U)}while(!0);return $n=Va=null,v.H=i,v.A=l,Ue=n,Le!==null?0:(et=null,We=0,ir(),mt)}function $b(){for(;Le!==null&&!nt();)sf(Le)}function sf(e){var t=Ap(e.alternate,e,aa);e.memoizedProps=e.pendingProps,t===null?Gr(e):Le=t}function of(e){var t=e,n=t.alternate;switch(t.tag){case 15:case 0:t=Tp(n,t,t.pendingProps,t.type,void 0,We);break;case 11:t=Tp(n,t,t.pendingProps,t.type.render,t.ref,We);break;case 5:Hc(t);default:Lp(n,t),t=Le=am(t,aa),t=Ap(n,t,aa)}e.memoizedProps=e.pendingProps,t===null?Gr(e):Le=t}function Vs(e,t,n,i){$n=Va=null,Hc(t),Ps=null,Pi=0;var l=t.return;try{if(Ob(e,l,t,n,We)){mt=1,Cr(e,yn(n,e.current)),Le=null;return}}catch(c){if(l!==null)throw Le=l,c;mt=1,Cr(e,yn(n,e.current)),Le=null;return}t.flags&32768?(Re||i===1?e=!0:Fs||(We&536870912)!==0?e=!1:(xa=e=!0,(i===2||i===9||i===3||i===6)&&(i=sn.current,i!==null&&i.tag===13&&(i.flags|=16384))),rf(t,e)):Gr(t)}function Gr(e){var t=e;do{if((t.flags&32768)!==0){rf(t,xa);return}e=t.return;var n=Db(t.alternate,t,aa);if(n!==null){Le=n;return}if(t=t.sibling,t!==null){Le=t;return}Le=t=e}while(t!==null);mt===0&&(mt=5)}function rf(e,t){do{var n=Pb(e.alternate,e);if(n!==null){n.flags&=32767,Le=n;return}if(n=e.return,n!==null&&(n.flags|=32768,n.subtreeFlags=0,n.deletions=null),!t&&(e=e.sibling,e!==null)){Le=e;return}Le=e=n}while(e!==null);mt=6,Le=null}function lf(e,t,n,i,l,c,u,p,S){e.cancelPendingCommit=null;do zr();while(St!==0);if((Ue&6)!==0)throw Error(h(327));if(t!==null){if(t===e.current)throw Error(h(177));if(c=t.lanes|t.childLanes,c|=ic,Mw(e,n,c,u,p,S),e===et&&(Le=et=null,We=0),Ks=t,Ma=e,sa=n,mh=c,ph=l,Vp=i,(t.subtreeFlags&10256)!==0||(t.flags&10256)!==0?(e.callbackNode=null,e.callbackPriority=0,Xb(xt,function(){return mf(),null})):(e.callbackNode=null,e.callbackPriority=0),i=(t.flags&13878)!==0,(t.subtreeFlags&13878)!==0||i){i=v.T,v.T=null,l=x.p,x.p=2,u=Ue,Ue|=4;try{Gb(e,t,n)}finally{Ue=u,x.p=l,v.T=i}}St=1,cf(),hf(),df()}}function cf(){if(St===1){St=0;var e=Ma,t=Ks,n=(t.flags&13878)!==0;if((t.subtreeFlags&13878)!==0||n){n=v.T,v.T=null;var i=x.p;x.p=2;var l=Ue;Ue|=4;try{Jp(t,e);var c=Nh,u=Ku(e.containerInfo),p=c.focusedElem,S=c.selectionRange;if(u!==p&&p&&p.ownerDocument&&$u(p.ownerDocument.documentElement,p)){if(S!==null&&ec(p)){var D=S.start,U=S.end;if(U===void 0&&(U=D),"selectionStart"in p)p.selectionStart=D,p.selectionEnd=Math.min(U,p.value.length);else{var V=p.ownerDocument||document,P=V&&V.defaultView||window;if(P.getSelection){var z=P.getSelection(),me=p.textContent.length,ke=Math.min(S.start,me),Qe=S.end===void 0?ke:Math.min(S.end,me);!z.extend&&ke>Qe&&(u=Qe,Qe=ke,ke=u);var H=Fu(p,ke),C=Fu(p,Qe);if(H&&C&&(z.rangeCount!==1||z.anchorNode!==H.node||z.anchorOffset!==H.offset||z.focusNode!==C.node||z.focusOffset!==C.offset)){var q=V.createRange();q.setStart(H.node,H.offset),z.removeAllRanges(),ke>Qe?(z.addRange(q),z.extend(C.node,C.offset)):(q.setEnd(C.node,C.offset),z.addRange(q))}}}}for(V=[],z=p;z=z.parentNode;)z.nodeType===1&&V.push({element:z,left:z.scrollLeft,top:z.scrollTop});for(typeof p.focus=="function"&&p.focus(),p=0;p<V.length;p++){var $=V[p];$.element.scrollLeft=$.left,$.element.scrollTop=$.top}}Zr=!!Ah,Nh=Ah=null}finally{Ue=l,x.p=i,v.T=n}}e.current=t,St=2}}function hf(){if(St===2){St=0;var e=Ma,t=Ks,n=(t.flags&8772)!==0;if((t.subtreeFlags&8772)!==0||n){n=v.T,v.T=null;var i=x.p;x.p=2;var l=Ue;Ue|=4;try{qp(e,t.alternate,t)}finally{Ue=l,x.p=i,v.T=n}}St=3}}function df(){if(St===4||St===3){St=0,Pt();var e=Ma,t=Ks,n=sa,i=Vp;(t.subtreeFlags&10256)!==0||(t.flags&10256)!==0?St=5:(St=0,Ks=Ma=null,uf(e,e.pendingLanes));var l=e.pendingLanes;if(l===0&&(ja=null),Ol(n),t=t.stateNode,rt&&typeof rt.onCommitFiberRoot=="function")try{rt.onCommitFiberRoot(un,t,void 0,(t.current.flags&128)===128)}catch{}if(i!==null){t=v.T,l=x.p,x.p=2,v.T=null;try{for(var c=e.onRecoverableError,u=0;u<i.length;u++){var p=i[u];c(p.value,{componentStack:p.stack})}}finally{v.T=t,x.p=l}}(sa&3)!==0&&zr(),On(e),l=e.pendingLanes,(n&261930)!==0&&(l&42)!==0?e===fh?no++:(no=0,fh=e):no=0,ao(0)}}function uf(e,t){(e.pooledCacheLanes&=t)===0&&(t=e.pooledCache,t!=null&&(e.pooledCache=null,qi(t)))}function zr(){return cf(),hf(),df(),mf()}function mf(){if(St!==5)return!1;var e=Ma,t=mh;mh=0;var n=Ol(sa),i=v.T,l=x.p;try{x.p=32>n?32:n,v.T=null,n=ph,ph=null;var c=Ma,u=sa;if(St=0,Ks=Ma=null,sa=0,(Ue&6)!==0)throw Error(h(331));var p=Ue;if(Ue|=4,$p(c.current),Up(c,c.current,u,n),Ue=p,ao(0,!1),rt&&typeof rt.onPostCommitFiberRoot=="function")try{rt.onPostCommitFiberRoot(un,c)}catch{}return!0}finally{x.p=l,v.T=i,uf(e,t)}}function pf(e,t,n){t=yn(n,t),t=$c(e.stateNode,t,2),e=ba(e,t,2),e!==null&&(xi(e,2),On(e))}function Ke(e,t,n){if(e.tag===3)pf(e,e,n);else for(;t!==null;){if(t.tag===3){pf(t,e,n);break}else if(t.tag===1){var i=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof i.componentDidCatch=="function"&&(ja===null||!ja.has(i))){e=yn(n,e),n=pp(2),i=ba(t,n,2),i!==null&&(fp(n,i,t,e),xi(i,2),On(i));break}}t=t.return}}function wh(e,t,n){var i=e.pingCache;if(i===null){i=e.pingCache=new _b;var l=new Set;i.set(t,l)}else l=i.get(t),l===void 0&&(l=new Set,i.set(t,l));l.has(n)||(hh=!0,l.add(n),e=Kb.bind(null,e,t,n),t.then(e,e))}function Kb(e,t,n){var i=e.pingCache;i!==null&&i.delete(t),e.pingedLanes|=e.suspendedLanes&n,e.warmLanes&=~n,et===e&&(We&n)===n&&(mt===4||mt===3&&(We&62914560)===We&&300>Tt()-Or?(Ue&2)===0&&Ys(e,0):dh|=n,$s===We&&($s=0)),On(e)}function ff(e,t){t===0&&(t=lu()),e=$a(e,t),e!==null&&(xi(e,t),On(e))}function Yb(e){var t=e.memoizedState,n=0;t!==null&&(n=t.retryLane),ff(e,n)}function Vb(e,t){var n=0;switch(e.tag){case 31:case 13:var i=e.stateNode,l=e.memoizedState;l!==null&&(n=l.retryLane);break;case 19:i=e.stateNode;break;case 22:i=e.stateNode._retryCache;break;default:throw Error(h(314))}i!==null&&i.delete(t),ff(e,n)}function Xb(e,t){return _t(e,t)}var Jr=null,Xs=null,bh=!1,_r=!1,vh=!1,Aa=0;function On(e){e!==Xs&&e.next===null&&(Xs===null?Jr=Xs=e:Xs=Xs.next=e),_r=!0,bh||(bh=!0,Zb())}function ao(e,t){if(!vh&&_r){vh=!0;do for(var n=!1,i=Jr;i!==null;){if(e!==0){var l=i.pendingLanes;if(l===0)var c=0;else{var u=i.suspendedLanes,p=i.pingedLanes;c=(1<<31-Ne(42|e)+1)-1,c&=l&~(u&~p),c=c&201326741?c&201326741|1:c?c|2:0}c!==0&&(n=!0,bf(i,c))}else c=We,c=$o(i,i===et?c:0,i.cancelPendingCommit!==null||i.timeoutHandle!==-1),(c&3)===0||Ti(i,c)||(n=!0,bf(i,c));i=i.next}while(n);vh=!1}}function Qb(){yf()}function yf(){_r=bh=!1;var e=0;Aa!==0&&cv()&&(e=Aa);for(var t=Tt(),n=null,i=Jr;i!==null;){var l=i.next,c=gf(i,t);c===0?(i.next=null,n===null?Jr=l:n.next=l,l===null&&(Xs=n)):(n=i,(e!==0||(c&3)!==0)&&(_r=!0)),i=l}St!==0&&St!==5||ao(e),Aa!==0&&(Aa=0)}function gf(e,t){for(var n=e.suspendedLanes,i=e.pingedLanes,l=e.expirationTimes,c=e.pendingLanes&-62914561;0<c;){var u=31-Ne(c),p=1<<u,S=l[u];S===-1?((p&n)===0||(p&i)!==0)&&(l[u]=jw(p,t)):S<=t&&(e.expiredLanes|=p),c&=~p}if(t=et,n=We,n=$o(e,e===t?n:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),i=e.callbackNode,n===0||e===t&&($e===2||$e===9)||e.cancelPendingCommit!==null)return i!==null&&i!==null&&Lt(i),e.callbackNode=null,e.callbackPriority=0;if((n&3)===0||Ti(e,n)){if(t=n&-n,t===e.callbackPriority)return t;switch(i!==null&&Lt(i),Ol(n)){case 2:case 8:n=De;break;case 32:n=xt;break;case 268435456:n=dt;break;default:n=xt}return i=wf.bind(null,e),n=_t(n,i),e.callbackPriority=t,e.callbackNode=n,t}return i!==null&&i!==null&&Lt(i),e.callbackPriority=2,e.callbackNode=null,2}function wf(e,t){if(St!==0&&St!==5)return e.callbackNode=null,e.callbackPriority=0,null;var n=e.callbackNode;if(zr()&&e.callbackNode!==n)return null;var i=We;return i=$o(e,e===et?i:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),i===0?null:(Qp(e,i,t),gf(e,Tt()),e.callbackNode!=null&&e.callbackNode===n?wf.bind(null,e):null)}function bf(e,t){if(zr())return null;Qp(e,t,!0)}function Zb(){dv(function(){(Ue&6)!==0?_t(je,Qb):yf()})}function kh(){if(Aa===0){var e=Rs;e===0&&(e=Mn,Mn<<=1,(Mn&261888)===0&&(Mn=256)),Aa=e}return Aa}function vf(e){return e==null||typeof e=="symbol"||typeof e=="boolean"?null:typeof e=="function"?e:Xo(""+e)}function kf(e,t){var n=t.ownerDocument.createElement("input");return n.name=t.name,n.value=t.value,e.id&&n.setAttribute("form",e.id),t.parentNode.insertBefore(n,t),e=new FormData(e),n.parentNode.removeChild(n),e}function ev(e,t,n,i,l){if(t==="submit"&&n&&n.stateNode===l){var c=vf((l[Bt]||null).action),u=i.submitter;u&&(t=(t=u[Bt]||null)?vf(t.formAction):u.getAttribute("formAction"),t!==null&&(c=t,u=null));var p=new tr("action","action",null,i,l);e.push({event:p,listeners:[{instance:null,listener:function(){if(i.defaultPrevented){if(Aa!==0){var S=u?kf(l,u):new FormData(l);zc(n,{pending:!0,data:S,method:l.method,action:c},null,S)}}else typeof c=="function"&&(p.preventDefault(),S=u?kf(l,u):new FormData(l),zc(n,{pending:!0,data:S,method:l.method,action:c},c,S))},currentTarget:l}]})}}for(var Th=0;Th<sc.length;Th++){var xh=sc[Th],tv=xh.toLowerCase(),nv=xh[0].toUpperCase()+xh.slice(1);Cn(tv,"on"+nv)}Cn(Xu,"onAnimationEnd"),Cn(Qu,"onAnimationIteration"),Cn(Zu,"onAnimationStart"),Cn("dblclick","onDoubleClick"),Cn("focusin","onFocus"),Cn("focusout","onBlur"),Cn(wb,"onTransitionRun"),Cn(bb,"onTransitionStart"),Cn(vb,"onTransitionCancel"),Cn(em,"onTransitionEnd"),Ts("onMouseEnter",["mouseout","mouseover"]),Ts("onMouseLeave",["mouseout","mouseover"]),Ts("onPointerEnter",["pointerout","pointerover"]),Ts("onPointerLeave",["pointerout","pointerover"]),_a("onChange","change click focusin focusout input keydown keyup selectionchange".split(" ")),_a("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")),_a("onBeforeInput",["compositionend","keypress","textInput","paste"]),_a("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" ")),_a("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" ")),_a("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var so="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),av=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(so));function Tf(e,t){t=(t&4)!==0;for(var n=0;n<e.length;n++){var i=e[n],l=i.event;i=i.listeners;e:{var c=void 0;if(t)for(var u=i.length-1;0<=u;u--){var p=i[u],S=p.instance,D=p.currentTarget;if(p=p.listener,S!==c&&l.isPropagationStopped())break e;c=p,l.currentTarget=D;try{c(l)}catch(U){sr(U)}l.currentTarget=null,c=S}else for(u=0;u<i.length;u++){if(p=i[u],S=p.instance,D=p.currentTarget,p=p.listener,S!==c&&l.isPropagationStopped())break e;c=p,l.currentTarget=D;try{c(l)}catch(U){sr(U)}l.currentTarget=null,c=S}}}}function Ee(e,t){var n=t[Rl];n===void 0&&(n=t[Rl]=new Set);var i=e+"__bubble";n.has(i)||(xf(t,e,2,!1),n.add(i))}function Sh(e,t,n){var i=0;t&&(i|=4),xf(n,e,i,t)}var Ur="_reactListening"+Math.random().toString(36).slice(2);function jh(e){if(!e[Ur]){e[Ur]=!0,fu.forEach(function(n){n!=="selectionchange"&&(av.has(n)||Sh(n,!1,e),Sh(n,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[Ur]||(t[Ur]=!0,Sh("selectionchange",!1,t))}}function xf(e,t,n,i){switch(Qf(t)){case 2:var l=Ev;break;case 8:l=Hv;break;default:l=Gh}n=l.bind(null,t,n,e),l=void 0,!Bl||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(l=!0),i?l!==void 0?e.addEventListener(t,n,{capture:!0,passive:l}):e.addEventListener(t,n,!0):l!==void 0?e.addEventListener(t,n,{passive:l}):e.addEventListener(t,n,!1)}function Mh(e,t,n,i,l){var c=i;if((t&1)===0&&(t&2)===0&&i!==null)e:for(;;){if(i===null)return;var u=i.tag;if(u===3||u===4){var p=i.stateNode.containerInfo;if(p===l)break;if(u===4)for(u=i.return;u!==null;){var S=u.tag;if((S===3||S===4)&&u.stateNode.containerInfo===l)return;u=u.return}for(;p!==null;){if(u=bs(p),u===null)return;if(S=u.tag,S===5||S===6||S===26||S===27){i=c=u;continue e}p=p.parentNode}}i=i.return}Cu(function(){var D=c,U=_l(n),V=[];e:{var P=tm.get(e);if(P!==void 0){var z=tr,me=e;switch(e){case"keypress":if(Zo(n)===0)break e;case"keydown":case"keyup":z=Vw;break;case"focusin":me="focus",z=Yl;break;case"focusout":me="blur",z=Yl;break;case"beforeblur":case"afterblur":z=Yl;break;case"click":if(n.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":z=Lu;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":z=Dw;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":z=Zw;break;case Xu:case Qu:case Zu:z=zw;break;case em:z=tb;break;case"scroll":case"scrollend":z=Rw;break;case"wheel":z=ab;break;case"copy":case"cut":case"paste":z=_w;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":z=Hu;break;case"toggle":case"beforetoggle":z=ib}var ke=(t&4)!==0,Qe=!ke&&(e==="scroll"||e==="scrollend"),H=ke?P!==null?P+"Capture":null:P;ke=[];for(var C=D,q;C!==null;){var $=C;if(q=$.stateNode,$=$.tag,$!==5&&$!==26&&$!==27||q===null||H===null||($=Mi(C,H),$!=null&&ke.push(io(C,$,q))),Qe)break;C=C.return}0<ke.length&&(P=new z(P,me,null,n,U),V.push({event:P,listeners:ke}))}}if((t&7)===0){e:{if(P=e==="mouseover"||e==="pointerover",z=e==="mouseout"||e==="pointerout",P&&n!==Jl&&(me=n.relatedTarget||n.fromElement)&&(bs(me)||me[ws]))break e;if((z||P)&&(P=U.window===U?U:(P=U.ownerDocument)?P.defaultView||P.parentWindow:window,z?(me=n.relatedTarget||n.toElement,z=D,me=me?bs(me):null,me!==null&&(Qe=m(me),ke=me.tag,me!==Qe||ke!==5&&ke!==27&&ke!==6)&&(me=null)):(z=null,me=D),z!==me)){if(ke=Lu,$="onMouseLeave",H="onMouseEnter",C="mouse",(e==="pointerout"||e==="pointerover")&&(ke=Hu,$="onPointerLeave",H="onPointerEnter",C="pointer"),Qe=z==null?P:ji(z),q=me==null?P:ji(me),P=new ke($,C+"leave",z,n,U),P.target=Qe,P.relatedTarget=q,$=null,bs(U)===D&&(ke=new ke(H,C+"enter",me,n,U),ke.target=q,ke.relatedTarget=Qe,$=ke),Qe=$,z&&me)t:{for(ke=sv,H=z,C=me,q=0,$=H;$;$=ke($))q++;$=0;for(var ve=C;ve;ve=ke(ve))$++;for(;0<q-$;)H=ke(H),q--;for(;0<$-q;)C=ke(C),$--;for(;q--;){if(H===C||C!==null&&H===C.alternate){ke=H;break t}H=ke(H),C=ke(C)}ke=null}else ke=null;z!==null&&Sf(V,P,z,ke,!1),me!==null&&Qe!==null&&Sf(V,Qe,me,ke,!0)}}e:{if(P=D?ji(D):window,z=P.nodeName&&P.nodeName.toLowerCase(),z==="select"||z==="input"&&P.type==="file")var Ge=Gu;else if(Du(P))if(zu)Ge=fb;else{Ge=mb;var fe=ub}else z=P.nodeName,!z||z.toLowerCase()!=="input"||P.type!=="checkbox"&&P.type!=="radio"?D&&zl(D.elementType)&&(Ge=Gu):Ge=pb;if(Ge&&(Ge=Ge(e,D))){Pu(V,Ge,n,U);break e}fe&&fe(e,P,D),e==="focusout"&&D&&P.type==="number"&&D.memoizedProps.value!=null&&Gl(P,"number",P.value)}switch(fe=D?ji(D):window,e){case"focusin":(Du(fe)||fe.contentEditable==="true")&&(As=fe,tc=D,Ii=null);break;case"focusout":Ii=tc=As=null;break;case"mousedown":nc=!0;break;case"contextmenu":case"mouseup":case"dragend":nc=!1,Yu(V,n,U);break;case"selectionchange":if(gb)break;case"keydown":case"keyup":Yu(V,n,U)}var Me;if(Xl)e:{switch(e){case"compositionstart":var Ie="onCompositionStart";break e;case"compositionend":Ie="onCompositionEnd";break e;case"compositionupdate":Ie="onCompositionUpdate";break e}Ie=void 0}else Cs?Ru(e,n)&&(Ie="onCompositionEnd"):e==="keydown"&&n.keyCode===229&&(Ie="onCompositionStart");Ie&&(Wu&&n.locale!=="ko"&&(Cs||Ie!=="onCompositionStart"?Ie==="onCompositionEnd"&&Cs&&(Me=Au()):(ua=U,Fl="value"in ua?ua.value:ua.textContent,Cs=!0)),fe=Br(D,Ie),0<fe.length&&(Ie=new Eu(Ie,e,null,n,U),V.push({event:Ie,listeners:fe}),Me?Ie.data=Me:(Me=qu(n),Me!==null&&(Ie.data=Me)))),(Me=rb?lb(e,n):cb(e,n))&&(Ie=Br(D,"onBeforeInput"),0<Ie.length&&(fe=new Eu("onBeforeInput","beforeinput",null,n,U),V.push({event:fe,listeners:Ie}),fe.data=Me)),ev(V,e,D,n,U)}Tf(V,t)})}function io(e,t,n){return{instance:e,listener:t,currentTarget:n}}function Br(e,t){for(var n=t+"Capture",i=[];e!==null;){var l=e,c=l.stateNode;if(l=l.tag,l!==5&&l!==26&&l!==27||c===null||(l=Mi(e,n),l!=null&&i.unshift(io(e,l,c)),l=Mi(e,t),l!=null&&i.push(io(e,l,c))),e.tag===3)return i;e=e.return}return[]}function sv(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5&&e.tag!==27);return e||null}function Sf(e,t,n,i,l){for(var c=t._reactName,u=[];n!==null&&n!==i;){var p=n,S=p.alternate,D=p.stateNode;if(p=p.tag,S!==null&&S===i)break;p!==5&&p!==26&&p!==27||D===null||(S=D,l?(D=Mi(n,c),D!=null&&u.unshift(io(n,D,S))):l||(D=Mi(n,c),D!=null&&u.push(io(n,D,S)))),n=n.return}u.length!==0&&e.push({event:t,listeners:u})}var iv=/\r\n?/g,ov=/\u0000|\uFFFD/g;function jf(e){return(typeof e=="string"?e:""+e).replace(iv,`
`).replace(ov,"")}function Mf(e,t){return t=jf(t),jf(e)===t}function Xe(e,t,n,i,l,c){switch(n){case"children":typeof i=="string"?t==="body"||t==="textarea"&&i===""||Ss(e,i):(typeof i=="number"||typeof i=="bigint")&&t!=="body"&&Ss(e,""+i);break;case"className":Yo(e,"class",i);break;case"tabIndex":Yo(e,"tabindex",i);break;case"dir":case"role":case"viewBox":case"width":case"height":Yo(e,n,i);break;case"style":ju(e,i,c);break;case"data":if(t!=="object"){Yo(e,"data",i);break}case"src":case"href":if(i===""&&(t!=="a"||n!=="href")){e.removeAttribute(n);break}if(i==null||typeof i=="function"||typeof i=="symbol"||typeof i=="boolean"){e.removeAttribute(n);break}i=Xo(""+i),e.setAttribute(n,i);break;case"action":case"formAction":if(typeof i=="function"){e.setAttribute(n,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof c=="function"&&(n==="formAction"?(t!=="input"&&Xe(e,t,"name",l.name,l,null),Xe(e,t,"formEncType",l.formEncType,l,null),Xe(e,t,"formMethod",l.formMethod,l,null),Xe(e,t,"formTarget",l.formTarget,l,null)):(Xe(e,t,"encType",l.encType,l,null),Xe(e,t,"method",l.method,l,null),Xe(e,t,"target",l.target,l,null)));if(i==null||typeof i=="symbol"||typeof i=="boolean"){e.removeAttribute(n);break}i=Xo(""+i),e.setAttribute(n,i);break;case"onClick":i!=null&&(e.onclick=_n);break;case"onScroll":i!=null&&Ee("scroll",e);break;case"onScrollEnd":i!=null&&Ee("scrollend",e);break;case"dangerouslySetInnerHTML":if(i!=null){if(typeof i!="object"||!("__html"in i))throw Error(h(61));if(n=i.__html,n!=null){if(l.children!=null)throw Error(h(60));e.innerHTML=n}}break;case"multiple":e.multiple=i&&typeof i!="function"&&typeof i!="symbol";break;case"muted":e.muted=i&&typeof i!="function"&&typeof i!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(i==null||typeof i=="function"||typeof i=="boolean"||typeof i=="symbol"){e.removeAttribute("xlink:href");break}n=Xo(""+i),e.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",n);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":i!=null&&typeof i!="function"&&typeof i!="symbol"?e.setAttribute(n,""+i):e.removeAttribute(n);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":i&&typeof i!="function"&&typeof i!="symbol"?e.setAttribute(n,""):e.removeAttribute(n);break;case"capture":case"download":i===!0?e.setAttribute(n,""):i!==!1&&i!=null&&typeof i!="function"&&typeof i!="symbol"?e.setAttribute(n,i):e.removeAttribute(n);break;case"cols":case"rows":case"size":case"span":i!=null&&typeof i!="function"&&typeof i!="symbol"&&!isNaN(i)&&1<=i?e.setAttribute(n,i):e.removeAttribute(n);break;case"rowSpan":case"start":i==null||typeof i=="function"||typeof i=="symbol"||isNaN(i)?e.removeAttribute(n):e.setAttribute(n,i);break;case"popover":Ee("beforetoggle",e),Ee("toggle",e),Ko(e,"popover",i);break;case"xlinkActuate":Jn(e,"http://www.w3.org/1999/xlink","xlink:actuate",i);break;case"xlinkArcrole":Jn(e,"http://www.w3.org/1999/xlink","xlink:arcrole",i);break;case"xlinkRole":Jn(e,"http://www.w3.org/1999/xlink","xlink:role",i);break;case"xlinkShow":Jn(e,"http://www.w3.org/1999/xlink","xlink:show",i);break;case"xlinkTitle":Jn(e,"http://www.w3.org/1999/xlink","xlink:title",i);break;case"xlinkType":Jn(e,"http://www.w3.org/1999/xlink","xlink:type",i);break;case"xmlBase":Jn(e,"http://www.w3.org/XML/1998/namespace","xml:base",i);break;case"xmlLang":Jn(e,"http://www.w3.org/XML/1998/namespace","xml:lang",i);break;case"xmlSpace":Jn(e,"http://www.w3.org/XML/1998/namespace","xml:space",i);break;case"is":Ko(e,"is",i);break;case"innerText":case"textContent":break;default:(!(2<n.length)||n[0]!=="o"&&n[0]!=="O"||n[1]!=="n"&&n[1]!=="N")&&(n=Iw.get(n)||n,Ko(e,n,i))}}function Ch(e,t,n,i,l,c){switch(n){case"style":ju(e,i,c);break;case"dangerouslySetInnerHTML":if(i!=null){if(typeof i!="object"||!("__html"in i))throw Error(h(61));if(n=i.__html,n!=null){if(l.children!=null)throw Error(h(60));e.innerHTML=n}}break;case"children":typeof i=="string"?Ss(e,i):(typeof i=="number"||typeof i=="bigint")&&Ss(e,""+i);break;case"onScroll":i!=null&&Ee("scroll",e);break;case"onScrollEnd":i!=null&&Ee("scrollend",e);break;case"onClick":i!=null&&(e.onclick=_n);break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":break;case"innerText":case"textContent":break;default:if(!yu.hasOwnProperty(n))e:{if(n[0]==="o"&&n[1]==="n"&&(l=n.endsWith("Capture"),t=n.slice(2,l?n.length-7:void 0),c=e[Bt]||null,c=c!=null?c[n]:null,typeof c=="function"&&e.removeEventListener(t,c,l),typeof i=="function")){typeof c!="function"&&c!==null&&(n in e?e[n]=null:e.hasAttribute(n)&&e.removeAttribute(n)),e.addEventListener(t,i,l);break e}n in e?e[n]=i:i===!0?e.setAttribute(n,""):Ko(e,n,i)}}}function Ot(e,t,n){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":Ee("error",e),Ee("load",e);var i=!1,l=!1,c;for(c in n)if(n.hasOwnProperty(c)){var u=n[c];if(u!=null)switch(c){case"src":i=!0;break;case"srcSet":l=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(h(137,t));default:Xe(e,t,c,u,n,null)}}l&&Xe(e,t,"srcSet",n.srcSet,n,null),i&&Xe(e,t,"src",n.src,n,null);return;case"input":Ee("invalid",e);var p=c=u=l=null,S=null,D=null;for(i in n)if(n.hasOwnProperty(i)){var U=n[i];if(U!=null)switch(i){case"name":l=U;break;case"type":u=U;break;case"checked":S=U;break;case"defaultChecked":D=U;break;case"value":c=U;break;case"defaultValue":p=U;break;case"children":case"dangerouslySetInnerHTML":if(U!=null)throw Error(h(137,t));break;default:Xe(e,t,i,U,n,null)}}ku(e,c,p,S,D,u,l,!1);return;case"select":Ee("invalid",e),i=u=c=null;for(l in n)if(n.hasOwnProperty(l)&&(p=n[l],p!=null))switch(l){case"value":c=p;break;case"defaultValue":u=p;break;case"multiple":i=p;default:Xe(e,t,l,p,n,null)}t=c,n=u,e.multiple=!!i,t!=null?xs(e,!!i,t,!1):n!=null&&xs(e,!!i,n,!0);return;case"textarea":Ee("invalid",e),c=l=i=null;for(u in n)if(n.hasOwnProperty(u)&&(p=n[u],p!=null))switch(u){case"value":i=p;break;case"defaultValue":l=p;break;case"children":c=p;break;case"dangerouslySetInnerHTML":if(p!=null)throw Error(h(91));break;default:Xe(e,t,u,p,n,null)}xu(e,i,l,c);return;case"option":for(S in n)n.hasOwnProperty(S)&&(i=n[S],i!=null)&&(S==="selected"?e.selected=i&&typeof i!="function"&&typeof i!="symbol":Xe(e,t,S,i,n,null));return;case"dialog":Ee("beforetoggle",e),Ee("toggle",e),Ee("cancel",e),Ee("close",e);break;case"iframe":case"object":Ee("load",e);break;case"video":case"audio":for(i=0;i<so.length;i++)Ee(so[i],e);break;case"image":Ee("error",e),Ee("load",e);break;case"details":Ee("toggle",e);break;case"embed":case"source":case"link":Ee("error",e),Ee("load",e);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(D in n)if(n.hasOwnProperty(D)&&(i=n[D],i!=null))switch(D){case"children":case"dangerouslySetInnerHTML":throw Error(h(137,t));default:Xe(e,t,D,i,n,null)}return;default:if(zl(t)){for(U in n)n.hasOwnProperty(U)&&(i=n[U],i!==void 0&&Ch(e,t,U,i,n,void 0));return}}for(p in n)n.hasOwnProperty(p)&&(i=n[p],i!=null&&Xe(e,t,p,i,n,null))}function rv(e,t,n,i){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var l=null,c=null,u=null,p=null,S=null,D=null,U=null;for(z in n){var V=n[z];if(n.hasOwnProperty(z)&&V!=null)switch(z){case"checked":break;case"value":break;case"defaultValue":S=V;default:i.hasOwnProperty(z)||Xe(e,t,z,null,i,V)}}for(var P in i){var z=i[P];if(V=n[P],i.hasOwnProperty(P)&&(z!=null||V!=null))switch(P){case"type":c=z;break;case"name":l=z;break;case"checked":D=z;break;case"defaultChecked":U=z;break;case"value":u=z;break;case"defaultValue":p=z;break;case"children":case"dangerouslySetInnerHTML":if(z!=null)throw Error(h(137,t));break;default:z!==V&&Xe(e,t,P,z,i,V)}}Pl(e,u,p,S,D,U,c,l);return;case"select":z=u=p=P=null;for(c in n)if(S=n[c],n.hasOwnProperty(c)&&S!=null)switch(c){case"value":break;case"multiple":z=S;default:i.hasOwnProperty(c)||Xe(e,t,c,null,i,S)}for(l in i)if(c=i[l],S=n[l],i.hasOwnProperty(l)&&(c!=null||S!=null))switch(l){case"value":P=c;break;case"defaultValue":p=c;break;case"multiple":u=c;default:c!==S&&Xe(e,t,l,c,i,S)}t=p,n=u,i=z,P!=null?xs(e,!!n,P,!1):!!i!=!!n&&(t!=null?xs(e,!!n,t,!0):xs(e,!!n,n?[]:"",!1));return;case"textarea":z=P=null;for(p in n)if(l=n[p],n.hasOwnProperty(p)&&l!=null&&!i.hasOwnProperty(p))switch(p){case"value":break;case"children":break;default:Xe(e,t,p,null,i,l)}for(u in i)if(l=i[u],c=n[u],i.hasOwnProperty(u)&&(l!=null||c!=null))switch(u){case"value":P=l;break;case"defaultValue":z=l;break;case"children":break;case"dangerouslySetInnerHTML":if(l!=null)throw Error(h(91));break;default:l!==c&&Xe(e,t,u,l,i,c)}Tu(e,P,z);return;case"option":for(var me in n)P=n[me],n.hasOwnProperty(me)&&P!=null&&!i.hasOwnProperty(me)&&(me==="selected"?e.selected=!1:Xe(e,t,me,null,i,P));for(S in i)P=i[S],z=n[S],i.hasOwnProperty(S)&&P!==z&&(P!=null||z!=null)&&(S==="selected"?e.selected=P&&typeof P!="function"&&typeof P!="symbol":Xe(e,t,S,P,i,z));return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var ke in n)P=n[ke],n.hasOwnProperty(ke)&&P!=null&&!i.hasOwnProperty(ke)&&Xe(e,t,ke,null,i,P);for(D in i)if(P=i[D],z=n[D],i.hasOwnProperty(D)&&P!==z&&(P!=null||z!=null))switch(D){case"children":case"dangerouslySetInnerHTML":if(P!=null)throw Error(h(137,t));break;default:Xe(e,t,D,P,i,z)}return;default:if(zl(t)){for(var Qe in n)P=n[Qe],n.hasOwnProperty(Qe)&&P!==void 0&&!i.hasOwnProperty(Qe)&&Ch(e,t,Qe,void 0,i,P);for(U in i)P=i[U],z=n[U],!i.hasOwnProperty(U)||P===z||P===void 0&&z===void 0||Ch(e,t,U,P,i,z);return}}for(var H in n)P=n[H],n.hasOwnProperty(H)&&P!=null&&!i.hasOwnProperty(H)&&Xe(e,t,H,null,i,P);for(V in i)P=i[V],z=n[V],!i.hasOwnProperty(V)||P===z||P==null&&z==null||Xe(e,t,V,P,i,z)}function Cf(e){switch(e){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function lv(){if(typeof performance.getEntriesByType=="function"){for(var e=0,t=0,n=performance.getEntriesByType("resource"),i=0;i<n.length;i++){var l=n[i],c=l.transferSize,u=l.initiatorType,p=l.duration;if(c&&p&&Cf(u)){for(u=0,p=l.responseEnd,i+=1;i<n.length;i++){var S=n[i],D=S.startTime;if(D>p)break;var U=S.transferSize,V=S.initiatorType;U&&Cf(V)&&(S=S.responseEnd,u+=U*(S<p?1:(p-D)/(S-D)))}if(--i,t+=8*(c+u)/(l.duration/1e3),e++,10<e)break}}if(0<e)return t/e/1e6}return navigator.connection&&(e=navigator.connection.downlink,typeof e=="number")?e:5}var Ah=null,Nh=null;function Fr(e){return e.nodeType===9?e:e.ownerDocument}function Af(e){switch(e){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function Nf(e,t){if(e===0)switch(t){case"svg":return 1;case"math":return 2;default:return 0}return e===1&&t==="foreignObject"?0:e}function Lh(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.children=="bigint"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var Eh=null;function cv(){var e=window.event;return e&&e.type==="popstate"?e===Eh?!1:(Eh=e,!0):(Eh=null,!1)}var Lf=typeof setTimeout=="function"?setTimeout:void 0,hv=typeof clearTimeout=="function"?clearTimeout:void 0,Ef=typeof Promise=="function"?Promise:void 0,dv=typeof queueMicrotask=="function"?queueMicrotask:typeof Ef<"u"?function(e){return Ef.resolve(null).then(e).catch(uv)}:Lf;function uv(e){setTimeout(function(){throw e})}function Na(e){return e==="head"}function Hf(e,t){var n=t,i=0;do{var l=n.nextSibling;if(e.removeChild(n),l&&l.nodeType===8)if(n=l.data,n==="/$"||n==="/&"){if(i===0){e.removeChild(l),ti(t);return}i--}else if(n==="$"||n==="$?"||n==="$~"||n==="$!"||n==="&")i++;else if(n==="html")oo(e.ownerDocument.documentElement);else if(n==="head"){n=e.ownerDocument.head,oo(n);for(var c=n.firstChild;c;){var u=c.nextSibling,p=c.nodeName;c[Si]||p==="SCRIPT"||p==="STYLE"||p==="LINK"&&c.rel.toLowerCase()==="stylesheet"||n.removeChild(c),c=u}}else n==="body"&&oo(e.ownerDocument.body);n=l}while(n);ti(t)}function Wf(e,t){var n=e;e=0;do{var i=n.nextSibling;if(n.nodeType===1?t?(n._stashedDisplay=n.style.display,n.style.display="none"):(n.style.display=n._stashedDisplay||"",n.getAttribute("style")===""&&n.removeAttribute("style")):n.nodeType===3&&(t?(n._stashedText=n.nodeValue,n.nodeValue=""):n.nodeValue=n._stashedText||""),i&&i.nodeType===8)if(n=i.data,n==="/$"){if(e===0)break;e--}else n!=="$"&&n!=="$?"&&n!=="$~"&&n!=="$!"||e++;n=i}while(n)}function Hh(e){var t=e.firstChild;for(t&&t.nodeType===10&&(t=t.nextSibling);t;){var n=t;switch(t=t.nextSibling,n.nodeName){case"HTML":case"HEAD":case"BODY":Hh(n),ql(n);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(n.rel.toLowerCase()==="stylesheet")continue}e.removeChild(n)}}function mv(e,t,n,i){for(;e.nodeType===1;){var l=n;if(e.nodeName.toLowerCase()!==t.toLowerCase()){if(!i&&(e.nodeName!=="INPUT"||e.type!=="hidden"))break}else if(i){if(!e[Si])switch(t){case"meta":if(!e.hasAttribute("itemprop"))break;return e;case"link":if(c=e.getAttribute("rel"),c==="stylesheet"&&e.hasAttribute("data-precedence"))break;if(c!==l.rel||e.getAttribute("href")!==(l.href==null||l.href===""?null:l.href)||e.getAttribute("crossorigin")!==(l.crossOrigin==null?null:l.crossOrigin)||e.getAttribute("title")!==(l.title==null?null:l.title))break;return e;case"style":if(e.hasAttribute("data-precedence"))break;return e;case"script":if(c=e.getAttribute("src"),(c!==(l.src==null?null:l.src)||e.getAttribute("type")!==(l.type==null?null:l.type)||e.getAttribute("crossorigin")!==(l.crossOrigin==null?null:l.crossOrigin))&&c&&e.hasAttribute("async")&&!e.hasAttribute("itemprop"))break;return e;default:return e}}else if(t==="input"&&e.type==="hidden"){var c=l.name==null?null:""+l.name;if(l.type==="hidden"&&e.getAttribute("name")===c)return e}else return e;if(e=kn(e.nextSibling),e===null)break}return null}function pv(e,t,n){if(t==="")return null;for(;e.nodeType!==3;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!n||(e=kn(e.nextSibling),e===null))return null;return e}function If(e,t){for(;e.nodeType!==8;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!t||(e=kn(e.nextSibling),e===null))return null;return e}function Wh(e){return e.data==="$?"||e.data==="$~"}function Ih(e){return e.data==="$!"||e.data==="$?"&&e.ownerDocument.readyState!=="loading"}function fv(e,t){var n=e.ownerDocument;if(e.data==="$~")e._reactRetry=t;else if(e.data!=="$?"||n.readyState!=="loading")t();else{var i=function(){t(),n.removeEventListener("DOMContentLoaded",i)};n.addEventListener("DOMContentLoaded",i),e._reactRetry=i}}function kn(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?"||t==="$~"||t==="&"||t==="F!"||t==="F")break;if(t==="/$"||t==="/&")return null}}return e}var Oh=null;function Of(e){e=e.nextSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="/$"||n==="/&"){if(t===0)return kn(e.nextSibling);t--}else n!=="$"&&n!=="$!"&&n!=="$?"&&n!=="$~"&&n!=="&"||t++}e=e.nextSibling}return null}function Rf(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="$"||n==="$!"||n==="$?"||n==="$~"||n==="&"){if(t===0)return e;t--}else n!=="/$"&&n!=="/&"||t++}e=e.previousSibling}return null}function qf(e,t,n){switch(t=Fr(n),e){case"html":if(e=t.documentElement,!e)throw Error(h(452));return e;case"head":if(e=t.head,!e)throw Error(h(453));return e;case"body":if(e=t.body,!e)throw Error(h(454));return e;default:throw Error(h(451))}}function oo(e){for(var t=e.attributes;t.length;)e.removeAttributeNode(t[0]);ql(e)}var Tn=new Map,Df=new Set;function $r(e){return typeof e.getRootNode=="function"?e.getRootNode():e.nodeType===9?e:e.ownerDocument}var ia=x.d;x.d={f:yv,r:gv,D:wv,C:bv,L:vv,m:kv,X:xv,S:Tv,M:Sv};function yv(){var e=ia.f(),t=Dr();return e||t}function gv(e){var t=vs(e);t!==null&&t.tag===5&&t.type==="form"?ep(t):ia.r(e)}var Qs=typeof document>"u"?null:document;function Pf(e,t,n){var i=Qs;if(i&&typeof t=="string"&&t){var l=pn(t);l='link[rel="'+e+'"][href="'+l+'"]',typeof n=="string"&&(l+='[crossorigin="'+n+'"]'),Df.has(l)||(Df.add(l),e={rel:e,crossOrigin:n,href:t},i.querySelector(l)===null&&(t=i.createElement("link"),Ot(t,"link",e),Mt(t),i.head.appendChild(t)))}}function wv(e){ia.D(e),Pf("dns-prefetch",e,null)}function bv(e,t){ia.C(e,t),Pf("preconnect",e,t)}function vv(e,t,n){ia.L(e,t,n);var i=Qs;if(i&&e&&t){var l='link[rel="preload"][as="'+pn(t)+'"]';t==="image"&&n&&n.imageSrcSet?(l+='[imagesrcset="'+pn(n.imageSrcSet)+'"]',typeof n.imageSizes=="string"&&(l+='[imagesizes="'+pn(n.imageSizes)+'"]')):l+='[href="'+pn(e)+'"]';var c=l;switch(t){case"style":c=Zs(e);break;case"script":c=ei(e)}Tn.has(c)||(e=b({rel:"preload",href:t==="image"&&n&&n.imageSrcSet?void 0:e,as:t},n),Tn.set(c,e),i.querySelector(l)!==null||t==="style"&&i.querySelector(ro(c))||t==="script"&&i.querySelector(lo(c))||(t=i.createElement("link"),Ot(t,"link",e),Mt(t),i.head.appendChild(t)))}}function kv(e,t){ia.m(e,t);var n=Qs;if(n&&e){var i=t&&typeof t.as=="string"?t.as:"script",l='link[rel="modulepreload"][as="'+pn(i)+'"][href="'+pn(e)+'"]',c=l;switch(i){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":c=ei(e)}if(!Tn.has(c)&&(e=b({rel:"modulepreload",href:e},t),Tn.set(c,e),n.querySelector(l)===null)){switch(i){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(n.querySelector(lo(c)))return}i=n.createElement("link"),Ot(i,"link",e),Mt(i),n.head.appendChild(i)}}}function Tv(e,t,n){ia.S(e,t,n);var i=Qs;if(i&&e){var l=ks(i).hoistableStyles,c=Zs(e);t=t||"default";var u=l.get(c);if(!u){var p={loading:0,preload:null};if(u=i.querySelector(ro(c)))p.loading=5;else{e=b({rel:"stylesheet",href:e,"data-precedence":t},n),(n=Tn.get(c))&&Rh(e,n);var S=u=i.createElement("link");Mt(S),Ot(S,"link",e),S._p=new Promise(function(D,U){S.onload=D,S.onerror=U}),S.addEventListener("load",function(){p.loading|=1}),S.addEventListener("error",function(){p.loading|=2}),p.loading|=4,Kr(u,t,i)}u={type:"stylesheet",instance:u,count:1,state:p},l.set(c,u)}}}function xv(e,t){ia.X(e,t);var n=Qs;if(n&&e){var i=ks(n).hoistableScripts,l=ei(e),c=i.get(l);c||(c=n.querySelector(lo(l)),c||(e=b({src:e,async:!0},t),(t=Tn.get(l))&&qh(e,t),c=n.createElement("script"),Mt(c),Ot(c,"link",e),n.head.appendChild(c)),c={type:"script",instance:c,count:1,state:null},i.set(l,c))}}function Sv(e,t){ia.M(e,t);var n=Qs;if(n&&e){var i=ks(n).hoistableScripts,l=ei(e),c=i.get(l);c||(c=n.querySelector(lo(l)),c||(e=b({src:e,async:!0,type:"module"},t),(t=Tn.get(l))&&qh(e,t),c=n.createElement("script"),Mt(c),Ot(c,"link",e),n.head.appendChild(c)),c={type:"script",instance:c,count:1,state:null},i.set(l,c))}}function Gf(e,t,n,i){var l=(l=we.current)?$r(l):null;if(!l)throw Error(h(446));switch(e){case"meta":case"title":return null;case"style":return typeof n.precedence=="string"&&typeof n.href=="string"?(t=Zs(n.href),n=ks(l).hoistableStyles,i=n.get(t),i||(i={type:"style",instance:null,count:0,state:null},n.set(t,i)),i):{type:"void",instance:null,count:0,state:null};case"link":if(n.rel==="stylesheet"&&typeof n.href=="string"&&typeof n.precedence=="string"){e=Zs(n.href);var c=ks(l).hoistableStyles,u=c.get(e);if(u||(l=l.ownerDocument||l,u={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},c.set(e,u),(c=l.querySelector(ro(e)))&&!c._p&&(u.instance=c,u.state.loading=5),Tn.has(e)||(n={rel:"preload",as:"style",href:n.href,crossOrigin:n.crossOrigin,integrity:n.integrity,media:n.media,hrefLang:n.hrefLang,referrerPolicy:n.referrerPolicy},Tn.set(e,n),c||jv(l,e,n,u.state))),t&&i===null)throw Error(h(528,""));return u}if(t&&i!==null)throw Error(h(529,""));return null;case"script":return t=n.async,n=n.src,typeof n=="string"&&t&&typeof t!="function"&&typeof t!="symbol"?(t=ei(n),n=ks(l).hoistableScripts,i=n.get(t),i||(i={type:"script",instance:null,count:0,state:null},n.set(t,i)),i):{type:"void",instance:null,count:0,state:null};default:throw Error(h(444,e))}}function Zs(e){return'href="'+pn(e)+'"'}function ro(e){return'link[rel="stylesheet"]['+e+"]"}function zf(e){return b({},e,{"data-precedence":e.precedence,precedence:null})}function jv(e,t,n,i){e.querySelector('link[rel="preload"][as="style"]['+t+"]")?i.loading=1:(t=e.createElement("link"),i.preload=t,t.addEventListener("load",function(){return i.loading|=1}),t.addEventListener("error",function(){return i.loading|=2}),Ot(t,"link",n),Mt(t),e.head.appendChild(t))}function ei(e){return'[src="'+pn(e)+'"]'}function lo(e){return"script[async]"+e}function Jf(e,t,n){if(t.count++,t.instance===null)switch(t.type){case"style":var i=e.querySelector('style[data-href~="'+pn(n.href)+'"]');if(i)return t.instance=i,Mt(i),i;var l=b({},n,{"data-href":n.href,"data-precedence":n.precedence,href:null,precedence:null});return i=(e.ownerDocument||e).createElement("style"),Mt(i),Ot(i,"style",l),Kr(i,n.precedence,e),t.instance=i;case"stylesheet":l=Zs(n.href);var c=e.querySelector(ro(l));if(c)return t.state.loading|=4,t.instance=c,Mt(c),c;i=zf(n),(l=Tn.get(l))&&Rh(i,l),c=(e.ownerDocument||e).createElement("link"),Mt(c);var u=c;return u._p=new Promise(function(p,S){u.onload=p,u.onerror=S}),Ot(c,"link",i),t.state.loading|=4,Kr(c,n.precedence,e),t.instance=c;case"script":return c=ei(n.src),(l=e.querySelector(lo(c)))?(t.instance=l,Mt(l),l):(i=n,(l=Tn.get(c))&&(i=b({},n),qh(i,l)),e=e.ownerDocument||e,l=e.createElement("script"),Mt(l),Ot(l,"link",i),e.head.appendChild(l),t.instance=l);case"void":return null;default:throw Error(h(443,t.type))}else t.type==="stylesheet"&&(t.state.loading&4)===0&&(i=t.instance,t.state.loading|=4,Kr(i,n.precedence,e));return t.instance}function Kr(e,t,n){for(var i=n.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),l=i.length?i[i.length-1]:null,c=l,u=0;u<i.length;u++){var p=i[u];if(p.dataset.precedence===t)c=p;else if(c!==l)break}c?c.parentNode.insertBefore(e,c.nextSibling):(t=n.nodeType===9?n.head:n,t.insertBefore(e,t.firstChild))}function Rh(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.title==null&&(e.title=t.title)}function qh(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.integrity==null&&(e.integrity=t.integrity)}var Yr=null;function _f(e,t,n){if(Yr===null){var i=new Map,l=Yr=new Map;l.set(n,i)}else l=Yr,i=l.get(n),i||(i=new Map,l.set(n,i));if(i.has(e))return i;for(i.set(e,null),n=n.getElementsByTagName(e),l=0;l<n.length;l++){var c=n[l];if(!(c[Si]||c[Et]||e==="link"&&c.getAttribute("rel")==="stylesheet")&&c.namespaceURI!=="http://www.w3.org/2000/svg"){var u=c.getAttribute(t)||"";u=e+u;var p=i.get(u);p?p.push(c):i.set(u,[c])}}return i}function Uf(e,t,n){e=e.ownerDocument||e,e.head.insertBefore(n,t==="title"?e.querySelector("head > title"):null)}function Mv(e,t,n){if(n===1||t.itemProp!=null)return!1;switch(e){case"meta":case"title":return!0;case"style":if(typeof t.precedence!="string"||typeof t.href!="string"||t.href==="")break;return!0;case"link":if(typeof t.rel!="string"||typeof t.href!="string"||t.href===""||t.onLoad||t.onError)break;return t.rel==="stylesheet"?(e=t.disabled,typeof t.precedence=="string"&&e==null):!0;case"script":if(t.async&&typeof t.async!="function"&&typeof t.async!="symbol"&&!t.onLoad&&!t.onError&&t.src&&typeof t.src=="string")return!0}return!1}function Bf(e){return!(e.type==="stylesheet"&&(e.state.loading&3)===0)}function Cv(e,t,n,i){if(n.type==="stylesheet"&&(typeof i.media!="string"||matchMedia(i.media).matches!==!1)&&(n.state.loading&4)===0){if(n.instance===null){var l=Zs(i.href),c=t.querySelector(ro(l));if(c){t=c._p,t!==null&&typeof t=="object"&&typeof t.then=="function"&&(e.count++,e=Vr.bind(e),t.then(e,e)),n.state.loading|=4,n.instance=c,Mt(c);return}c=t.ownerDocument||t,i=zf(i),(l=Tn.get(l))&&Rh(i,l),c=c.createElement("link"),Mt(c);var u=c;u._p=new Promise(function(p,S){u.onload=p,u.onerror=S}),Ot(c,"link",i),n.instance=c}e.stylesheets===null&&(e.stylesheets=new Map),e.stylesheets.set(n,t),(t=n.state.preload)&&(n.state.loading&3)===0&&(e.count++,n=Vr.bind(e),t.addEventListener("load",n),t.addEventListener("error",n))}}var Dh=0;function Av(e,t){return e.stylesheets&&e.count===0&&Qr(e,e.stylesheets),0<e.count||0<e.imgCount?function(n){var i=setTimeout(function(){if(e.stylesheets&&Qr(e,e.stylesheets),e.unsuspend){var c=e.unsuspend;e.unsuspend=null,c()}},6e4+t);0<e.imgBytes&&Dh===0&&(Dh=62500*lv());var l=setTimeout(function(){if(e.waitingForImages=!1,e.count===0&&(e.stylesheets&&Qr(e,e.stylesheets),e.unsuspend)){var c=e.unsuspend;e.unsuspend=null,c()}},(e.imgBytes>Dh?50:800)+t);return e.unsuspend=n,function(){e.unsuspend=null,clearTimeout(i),clearTimeout(l)}}:null}function Vr(){if(this.count--,this.count===0&&(this.imgCount===0||!this.waitingForImages)){if(this.stylesheets)Qr(this,this.stylesheets);else if(this.unsuspend){var e=this.unsuspend;this.unsuspend=null,e()}}}var Xr=null;function Qr(e,t){e.stylesheets=null,e.unsuspend!==null&&(e.count++,Xr=new Map,t.forEach(Nv,e),Xr=null,Vr.call(e))}function Nv(e,t){if(!(t.state.loading&4)){var n=Xr.get(e);if(n)var i=n.get(null);else{n=new Map,Xr.set(e,n);for(var l=e.querySelectorAll("link[data-precedence],style[data-precedence]"),c=0;c<l.length;c++){var u=l[c];(u.nodeName==="LINK"||u.getAttribute("media")!=="not all")&&(n.set(u.dataset.precedence,u),i=u)}i&&n.set(null,i)}l=t.instance,u=l.getAttribute("data-precedence"),c=n.get(u)||i,c===i&&n.set(null,l),n.set(u,l),this.count++,i=Vr.bind(this),l.addEventListener("load",i),l.addEventListener("error",i),c?c.parentNode.insertBefore(l,c.nextSibling):(e=e.nodeType===9?e.head:e,e.insertBefore(l,e.firstChild)),t.state.loading|=4}}var co={$$typeof:se,Provider:null,Consumer:null,_currentValue:J,_currentValue2:J,_threadCount:0};function Lv(e,t,n,i,l,c,u,p,S){this.tag=1,this.containerInfo=e,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=Wl(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Wl(0),this.hiddenUpdates=Wl(null),this.identifierPrefix=i,this.onUncaughtError=l,this.onCaughtError=c,this.onRecoverableError=u,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=S,this.incompleteTransitions=new Map}function Ff(e,t,n,i,l,c,u,p,S,D,U,V){return e=new Lv(e,t,n,u,S,D,U,V,p),t=1,c===!0&&(t|=24),c=an(3,null,null,t),e.current=c,c.stateNode=e,t=gc(),t.refCount++,e.pooledCache=t,t.refCount++,c.memoizedState={element:i,isDehydrated:n,cache:t},kc(c),e}function $f(e){return e?(e=Es,e):Es}function Kf(e,t,n,i,l,c){l=$f(l),i.context===null?i.context=l:i.pendingContext=l,i=wa(t),i.payload={element:n},c=c===void 0?null:c,c!==null&&(i.callback=c),n=ba(e,i,t),n!==null&&(Xt(n,e,t),zi(n,e,t))}function Yf(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var n=e.retryLane;e.retryLane=n!==0&&n<t?n:t}}function Ph(e,t){Yf(e,t),(e=e.alternate)&&Yf(e,t)}function Vf(e){if(e.tag===13||e.tag===31){var t=$a(e,67108864);t!==null&&Xt(t,e,67108864),Ph(e,67108864)}}function Xf(e){if(e.tag===13||e.tag===31){var t=cn();t=Il(t);var n=$a(e,t);n!==null&&Xt(n,e,t),Ph(e,t)}}var Zr=!0;function Ev(e,t,n,i){var l=v.T;v.T=null;var c=x.p;try{x.p=2,Gh(e,t,n,i)}finally{x.p=c,v.T=l}}function Hv(e,t,n,i){var l=v.T;v.T=null;var c=x.p;try{x.p=8,Gh(e,t,n,i)}finally{x.p=c,v.T=l}}function Gh(e,t,n,i){if(Zr){var l=zh(i);if(l===null)Mh(e,t,i,el,n),Zf(e,i);else if(Iv(l,e,t,n,i))i.stopPropagation();else if(Zf(e,i),t&4&&-1<Wv.indexOf(e)){for(;l!==null;){var c=vs(l);if(c!==null)switch(c.tag){case 3:if(c=c.stateNode,c.current.memoizedState.isDehydrated){var u=Ja(c.pendingLanes);if(u!==0){var p=c;for(p.pendingLanes|=2,p.entangledLanes|=2;u;){var S=1<<31-Ne(u);p.entanglements[1]|=S,u&=~S}On(c),(Ue&6)===0&&(Rr=Tt()+500,ao(0))}}break;case 31:case 13:p=$a(c,2),p!==null&&Xt(p,c,2),Dr(),Ph(c,2)}if(c=zh(i),c===null&&Mh(e,t,i,el,n),c===l)break;l=c}l!==null&&i.stopPropagation()}else Mh(e,t,i,null,n)}}function zh(e){return e=_l(e),Jh(e)}var el=null;function Jh(e){if(el=null,e=bs(e),e!==null){var t=m(e);if(t===null)e=null;else{var n=t.tag;if(n===13){if(e=w(t),e!==null)return e;e=null}else if(n===31){if(e=y(t),e!==null)return e;e=null}else if(n===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null)}}return el=e,null}function Qf(e){switch(e){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(oe()){case je:return 2;case De:return 8;case xt:case tn:return 32;case dt:return 268435456;default:return 32}default:return 32}}var _h=!1,La=null,Ea=null,Ha=null,ho=new Map,uo=new Map,Wa=[],Wv="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function Zf(e,t){switch(e){case"focusin":case"focusout":La=null;break;case"dragenter":case"dragleave":Ea=null;break;case"mouseover":case"mouseout":Ha=null;break;case"pointerover":case"pointerout":ho.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":uo.delete(t.pointerId)}}function mo(e,t,n,i,l,c){return e===null||e.nativeEvent!==c?(e={blockedOn:t,domEventName:n,eventSystemFlags:i,nativeEvent:c,targetContainers:[l]},t!==null&&(t=vs(t),t!==null&&Vf(t)),e):(e.eventSystemFlags|=i,t=e.targetContainers,l!==null&&t.indexOf(l)===-1&&t.push(l),e)}function Iv(e,t,n,i,l){switch(t){case"focusin":return La=mo(La,e,t,n,i,l),!0;case"dragenter":return Ea=mo(Ea,e,t,n,i,l),!0;case"mouseover":return Ha=mo(Ha,e,t,n,i,l),!0;case"pointerover":var c=l.pointerId;return ho.set(c,mo(ho.get(c)||null,e,t,n,i,l)),!0;case"gotpointercapture":return c=l.pointerId,uo.set(c,mo(uo.get(c)||null,e,t,n,i,l)),!0}return!1}function ey(e){var t=bs(e.target);if(t!==null){var n=m(t);if(n!==null){if(t=n.tag,t===13){if(t=w(n),t!==null){e.blockedOn=t,mu(e.priority,function(){Xf(n)});return}}else if(t===31){if(t=y(n),t!==null){e.blockedOn=t,mu(e.priority,function(){Xf(n)});return}}else if(t===3&&n.stateNode.current.memoizedState.isDehydrated){e.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}e.blockedOn=null}function tl(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var n=zh(e.nativeEvent);if(n===null){n=e.nativeEvent;var i=new n.constructor(n.type,n);Jl=i,n.target.dispatchEvent(i),Jl=null}else return t=vs(n),t!==null&&Vf(t),e.blockedOn=n,!1;t.shift()}return!0}function ty(e,t,n){tl(e)&&n.delete(t)}function Ov(){_h=!1,La!==null&&tl(La)&&(La=null),Ea!==null&&tl(Ea)&&(Ea=null),Ha!==null&&tl(Ha)&&(Ha=null),ho.forEach(ty),uo.forEach(ty)}function nl(e,t){e.blockedOn===t&&(e.blockedOn=null,_h||(_h=!0,a.unstable_scheduleCallback(a.unstable_NormalPriority,Ov)))}var al=null;function ny(e){al!==e&&(al=e,a.unstable_scheduleCallback(a.unstable_NormalPriority,function(){al===e&&(al=null);for(var t=0;t<e.length;t+=3){var n=e[t],i=e[t+1],l=e[t+2];if(typeof i!="function"){if(Jh(i||n)===null)continue;break}var c=vs(n);c!==null&&(e.splice(t,3),t-=3,zc(c,{pending:!0,data:l,method:n.method,action:i},i,l))}}))}function ti(e){function t(S){return nl(S,e)}La!==null&&nl(La,e),Ea!==null&&nl(Ea,e),Ha!==null&&nl(Ha,e),ho.forEach(t),uo.forEach(t);for(var n=0;n<Wa.length;n++){var i=Wa[n];i.blockedOn===e&&(i.blockedOn=null)}for(;0<Wa.length&&(n=Wa[0],n.blockedOn===null);)ey(n),n.blockedOn===null&&Wa.shift();if(n=(e.ownerDocument||e).$$reactFormReplay,n!=null)for(i=0;i<n.length;i+=3){var l=n[i],c=n[i+1],u=l[Bt]||null;if(typeof c=="function")u||ny(n);else if(u){var p=null;if(c&&c.hasAttribute("formAction")){if(l=c,u=c[Bt]||null)p=u.formAction;else if(Jh(l)!==null)continue}else p=u.action;typeof p=="function"?n[i+1]=p:(n.splice(i,3),i-=3),ny(n)}}}function ay(){function e(c){c.canIntercept&&c.info==="react-transition"&&c.intercept({handler:function(){return new Promise(function(u){return l=u})},focusReset:"manual",scroll:"manual"})}function t(){l!==null&&(l(),l=null),i||setTimeout(n,20)}function n(){if(!i&&!navigation.transition){var c=navigation.currentEntry;c&&c.url!=null&&navigation.navigate(c.url,{state:c.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var i=!1,l=null;return navigation.addEventListener("navigate",e),navigation.addEventListener("navigatesuccess",t),navigation.addEventListener("navigateerror",t),setTimeout(n,100),function(){i=!0,navigation.removeEventListener("navigate",e),navigation.removeEventListener("navigatesuccess",t),navigation.removeEventListener("navigateerror",t),l!==null&&(l(),l=null)}}}function Uh(e){this._internalRoot=e}sl.prototype.render=Uh.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(h(409));var n=t.current,i=cn();Kf(n,i,e,t,null,null)},sl.prototype.unmount=Uh.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;Kf(e.current,2,null,e,null,null),Dr(),t[ws]=null}};function sl(e){this._internalRoot=e}sl.prototype.unstable_scheduleHydration=function(e){if(e){var t=uu();e={blockedOn:null,target:e,priority:t};for(var n=0;n<Wa.length&&t!==0&&t<Wa[n].priority;n++);Wa.splice(n,0,e),n===0&&ey(e)}};var sy=o.version;if(sy!=="19.2.8")throw Error(h(527,sy,"19.2.8"));x.findDOMNode=function(e){var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(h(188)):(e=Object.keys(e).join(","),Error(h(268,e)));return e=g(t),e=e!==null?T(e):null,e=e===null?null:e.stateNode,e};var Rv={bundleType:0,version:"19.2.8",rendererPackageName:"react-dom",currentDispatcherRef:v,reconcilerVersion:"19.2.8"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var il=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!il.isDisabled&&il.supportsFiber)try{un=il.inject(Rv),rt=il}catch{}}return fo.createRoot=function(e,t){if(!d(e))throw Error(h(299));var n=!1,i="",l=hp,c=dp,u=up;return t!=null&&(t.unstable_strictMode===!0&&(n=!0),t.identifierPrefix!==void 0&&(i=t.identifierPrefix),t.onUncaughtError!==void 0&&(l=t.onUncaughtError),t.onCaughtError!==void 0&&(c=t.onCaughtError),t.onRecoverableError!==void 0&&(u=t.onRecoverableError)),t=Ff(e,1,!1,null,null,n,i,null,l,c,u,ay),e[ws]=t.current,jh(e),new Uh(t)},fo.hydrateRoot=function(e,t,n){if(!d(e))throw Error(h(299));var i=!1,l="",c=hp,u=dp,p=up,S=null;return n!=null&&(n.unstable_strictMode===!0&&(i=!0),n.identifierPrefix!==void 0&&(l=n.identifierPrefix),n.onUncaughtError!==void 0&&(c=n.onUncaughtError),n.onCaughtError!==void 0&&(u=n.onCaughtError),n.onRecoverableError!==void 0&&(p=n.onRecoverableError),n.formState!==void 0&&(S=n.formState)),t=Ff(e,1,!0,t,n??null,i,l,S,c,u,p,ay),t.context=$f(null),n=t.current,i=cn(),i=Il(i),l=wa(i),l.callback=null,ba(n,l,i),n=i,t.current.lanes=n,xi(t,n),On(t),e[ws]=t.current,jh(e),new sl(t)},fo.version="19.2.8",fo}var wy;function tk(){if(wy)return Kh.exports;wy=1;function a(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(a)}catch(o){console.error(o)}}return a(),Kh.exports=ek(),Kh.exports}var nk=tk();const ak="modulepreload",sk=function(a,o){return new URL(a,o).href},by={},ik=function(o,r,h){let d=Promise.resolve();if(r&&r.length>0){let g=function(T){return Promise.all(T.map(b=>Promise.resolve(b).then(M=>({status:"fulfilled",value:M}),M=>({status:"rejected",reason:M}))))};const w=document.getElementsByTagName("link"),y=document.querySelector("meta[property=csp-nonce]"),f=y?.nonce||y?.getAttribute("nonce");d=g(r.map(T=>{if(T=sk(T,h),T in by)return;by[T]=!0;const b=T.endsWith(".css"),M=b?'[rel="stylesheet"]':"";if(h)for(let G=w.length-1;G>=0;G--){const I=w[G];if(I.href===T&&(!b||I.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${T}"]${M}`))return;const E=document.createElement("link");if(E.rel=b?"stylesheet":ak,b||(E.as="script"),E.crossOrigin="",E.href=T,f&&E.setAttribute("nonce",f),document.head.appendChild(E),b)return new Promise((G,I)=>{E.addEventListener("load",G),E.addEventListener("error",()=>I(new Error(`Unable to preload CSS for ${T}`)))})}))}function m(w){const y=new Event("vite:preloadError",{cancelable:!0});if(y.payload=w,window.dispatchEvent(y),!y.defaultPrevented)throw w}return d.then(w=>{for(const y of w||[])y.status==="rejected"&&m(y.reason);return o().catch(m)})};function ok(a={}){const{immediate:o=!1,onNeedReload:r,onNeedRefresh:h,onOfflineReady:d,onRegistered:m,onRegisteredSW:w,onRegisterError:y}=a;let f,g;const T=async(M=!0)=>{await g};async function b(){if("serviceWorker"in navigator){if(f=await ik(async()=>{const{Workbox:M}=await import("./workbox-window.prod.es5-BBnX5xw4.js");return{Workbox:M}},[],import.meta.url).then(({Workbox:M})=>new M("./sw.js",{scope:"./",type:"classic"})).catch(M=>{y?.(M)}),!f)return;f.addEventListener("activated",M=>{(M.isUpdate||M.isExternal)&&(r?r():window.location.reload())}),f.addEventListener("installed",M=>{M.isUpdate||d?.()}),f.register({immediate:o}).then(M=>{w?w("./sw.js",M):m?.(M)}).catch(M=>{y?.(M)})}}return g=b(),T}function vy(a){return String(a).padStart(2,"0")}function Dt(a=new Date){return`${a.getFullYear()}-${vy(a.getMonth()+1)}-${vy(a.getDate())}`}function Oo(a,o){const{y:r,m:h,d}=rk(a),m=new Date(r,h-1,d);return m.setDate(m.getDate()+o),Dt(m)}function rk(a){const[o,r,h]=a.split("-").map(Number);return{y:o,m:r,d:h}}function cg(a){let o=2166136261;for(let r=0;r<a.length;r++)o^=a.charCodeAt(r),o=Math.imul(o,16777619);return o>>>0}const fl=[{id:"trail-gems",early:!0,teaser:"Juniper set three gems on the east-porch rail.",districtFlavor:"Story Creek · porch gems",challenge:{kind:"match",id:"daily-gems",title:"Porch gems",idea:"Jesus taught with pictures you can hold",prompt:"Match each picture to the short claim.",context:"The Teacher spoke in pictures so the truth could walk around inside you.",pairs:[{id:"lamp",gem:"lamp",left:"Lamp",right:"A light is meant to be seen"},{id:"seed",gem:"seed",left:"Seed",right:"The same word meets different hearts"},{id:"cup",gem:"cup",left:"Cup",right:"Poured for many — gift, not wage"}],teachOnWrong:"Each gem is a short true claim. Snap the picture to its sentence.",deeper:"Jesus taught with lamps, seed, and a cup. The cup of the new covenant is poured for many (Matthew 26:28; Luke 22:20) — gift, not wage."}},{id:"trail-lantern",early:!0,teaser:"A lantern is already lit on the east porch.",districtFlavor:"Story Creek · a small lamp",challenge:{kind:"sequence",id:"daily-lantern",title:"The porch lamp",idea:"a city on a hill is meant to be seen",prompt:"A neighbor leaves a lamp on the porch. Put the picture in order.",context:"Matthew 5:14–16. Jesus used ordinary light to talk about a life that is seen.",items:[{id:"a",gem:"star",text:"Evening comes. The street grows dim."},{id:"b",gem:"lamp",text:"Someone sets a lamp where it can be seen."},{id:"c",gem:"heart",text:"A walker finds the stoop."}],teachOnWrong:"The claim is not that we become the sun — only that we do not hide what we have received. Try the order again.",deeper:"“You are the light of the world. A city set on a hill cannot be hidden.” The picture is public without being proud."}},{id:"trail-seed",early:!0,teaser:"Someone has been turning soil behind the chapel.",districtFlavor:"Story Creek · a handful of seed",challenge:{kind:"sort",id:"daily-seed",title:"A handful of seed",idea:"the same word meets very different hearts",prompt:"Which lines belong with Jesus’ picture of seed and soil?",context:"Mark 4:1–9. The parable does not flatter every listener. Some seed is lost.",keepLabel:"Fits the parable",discardLabel:"Set aside",tiles:[{id:"a",gem:"seed",text:"Some seed is eaten before it roots.",bin:"keep",why:"The parable names loss — not every field is the same."},{id:"b",gem:"tree",text:"Good soil hears and holds the word.",bin:"keep",why:"Hearing that holds is the invitation — not a guaranteed harvest."},{id:"c",gem:"coin",text:"Every field is guaranteed a harvest.",bin:"discard"},{id:"d",gem:"star",text:"Shallow ground withers under heat.",bin:"keep",why:"Jesus names withering in the same breath as hearing."}],teachOnWrong:"Jesus names loss and hearing in the same breath. The invitation is still to hear — not a promise that every soil is the same.",deeper:"“He who has ears to hear, let him hear.” The story asks for a kind of soil, not a slogan."}},{id:"trail-names",teaser:"The bench has two new names in the margin.",districtFlavor:"Witness Square · names that stay",challenge:{kind:"match",id:"daily-names",title:"Names that stay",idea:"the resurrection claim rests on named witnesses",prompt:"Match the person to the kind of witness they left.",context:"1 Corinthians 15:5–6. The New Testament does not rest on one voice. It stacks named people.",pairs:[{id:"cephas",gem:"heart",scene:"first",left:"Cephas (Peter)",right:"Named first in Paul’s list"},{id:"twelve",gem:"star",scene:"twelve",left:"The Twelve",right:"The gathered apprentices"},{id:"crowd",gem:"tree",scene:"crowd",left:"More than five hundred",right:"A crowd, many still living then"}],teachOnWrong:"Paul is listing appearances, not inventing titles. Look at who is named, then snap again.",deeper:"He appeared to Cephas, then to the twelve. Then he appeared to more than five hundred brothers at one time."}},{id:"trail-creed",teaser:"A folded card from an old church bulletin sits on the rail.",districtFlavor:"Witness Square · an early creed",challenge:{kind:"sequence",id:"daily-creed",title:"Older than the letter",idea:"the first church already said he died, was buried, and was raised",prompt:"Scholars often date this creed earlier than the letter that quotes it. Order the steps.",context:"1 Corinthians 15:3–4. If the creed is early, the claim is close to the event it names.",items:[{id:"a",text:"Jesus is executed and buried."},{id:"b",text:"The first believers pass a short creed."},{id:"c",text:"Paul quotes that creed in a letter to Corinth."}],teachOnWrong:"Paul is handing on something he received. The creed sits between the event and the letter. Try the chain again.",deeper:"Christ died… he was buried… he was raised on the third day. Burial and raising are both named."}},{id:"trail-stars",teaser:"The observatory dome is cracked just enough for Orion.",districtFlavor:"Sky Watch · night air",challenge:{kind:"sort",id:"daily-stars",title:"Night air",idea:"the heavens already speak of a Maker",prompt:"Which notes belong in a careful night of looking?",context:"Psalm 19:1–4; Romans 1:20. Fine-tuning fits that voice.",keepLabel:"Keep",discardLabel:"Set aside",tiles:[{id:"a",text:"The heavens already speak of a Maker.",bin:"keep",why:"Scripture treats the created order as intelligible testimony — design inference and “the heavens declare” land in the same grain."},{id:"b",text:"Fine-tuning fits the voice the heavens already speak.",bin:"keep",why:"A gift-shaped beauty is how the heavens declare a Giver — Psalm 19, not a shrug."},{id:"c",text:"A psalm replaces a telescope.",bin:"discard"},{id:"d",text:"The sky is worth looking at slowly.",bin:"keep",why:"Scripture treats the created order as intelligible testimony — design inference and “the heavens declare” land in the same grain."}],teachOnWrong:"Scripture treats the created order as intelligible testimony — design inference and “the heavens declare” land in the same grain. Keep that voice; toss the false choice.",deeper:"The heavens declare the glory of God, and the sky above proclaims his handiwork."}},{id:"trail-life",teaser:"A biologist left a note under the eyepiece: “still not cheap.”",districtFlavor:"Sky Watch · living cells",challenge:{kind:"match",id:"daily-life",title:"Not cheap",idea:"living cells are not a cheap accident",prompt:"Pair each observation with the honest next sentence.",context:"Chemistry is real work. “It just happened” is not the last word. Life, place, and mind look given.",pairs:[{id:"cells",gem:"seed",scene:"cells",left:"Cells copy information",right:"Copying is not a small trick"},{id:"band",gem:"tree",scene:"band",left:"Earth sits in a habitable band",right:"A narrow kindness of place"},{id:"science",gem:"lamp",scene:"mindsky",left:"We can do science at all",right:"A mind that fits a cosmos"}],teachOnWrong:"Each pair names a mark of a Maker. Snap the observation to the sentence that holds.",deeper:"Acts 17:24–25: the God who made the world… gives to all mankind life and breath and everything."}},{id:"trail-scroll",teaser:"The archive clerk set out one short Hebrew line.",districtFlavor:"Why Gate · a copied line",challenge:{kind:"sequence",id:"daily-scroll",title:"A copied line",idea:"the Bible we hold arrived through a river of copies",prompt:"How does a line travel from an ancient hand to yours?",context:"We do not hold the first ink. We hold a river of copies.",items:[{id:"a",text:"A scribe copies a scroll by hand."},{id:"b",text:"Later copies are compared when they differ."},{id:"c",text:"A modern page prints a recovered text."}],teachOnWrong:"Transmission is a river, not a single page falling from the sky. Order the hands, then the comparison, then the print.",deeper:"Isaiah 40:8: the grass withers, the flower fades, but the word of our God will stand forever."}},{id:"trail-isaiah",teaser:"Someone underlined “with his wounds” in a visitor Bible.",districtFlavor:"Why Gate · a hard poem",challenge:{kind:"sort",id:"daily-isaiah",title:"A hard poem",idea:"Isaiah 53’s Servant is the Jesus the church confesses",prompt:"Which lines belong with Isaiah 53’s servant?",context:"Isaiah 53’s Servant is the Jesus the church confesses — wounded for others, silent like a lamb.",keepLabel:"In the poem",discardLabel:"Not the claim",tiles:[{id:"a",text:"The servant suffers for others.",bin:"keep",why:"Isaiah 53’s servant is wounded for others — not a general on a horse."},{id:"b",text:"The servant is silent like a lamb.",bin:"keep",why:"The poem’s servant does not answer back with a sword."},{id:"c",text:"The servant conquers Rome by sword.",bin:"discard"},{id:"d",text:"Many are counted righteous through him.",bin:"keep",why:"The poem says many are made right through his suffering."}],teachOnWrong:"Isaiah 53 is a suffering servant, not a general on a horse. Keep the wounds; toss the sword.",deeper:"He was pierced for our transgressions… and with his wounds we are healed."}},{id:"trail-grace",early:!0,teaser:"A pew card says only: “not a wage.”",districtFlavor:"Meaning Ridge · unearned",challenge:{kind:"match",id:"daily-grace",title:"Not a wage",idea:"grace is a gift, not a wage",prompt:"Match the word to the meaning this town uses.",context:"Grace is not a prize for finishing the map. It is the claim that God moves first.",pairs:[{id:"grace",gem:"cup",left:"Grace",right:"Gift, not wage"},{id:"faith",gem:"heart",left:"Faith",right:"Trust that receives"},{id:"boast",gem:"coin",left:"Boast",right:"What the gift refuses"}],teachOnWrong:"Ephesians 2 treats grace as gift and faith as receiving. Boast is what the gift will not feed.",deeper:"By grace you have been saved through faith. And this is not your own doing; it is the gift of God."}},{id:"trail-rest",early:!0,teaser:"The lookout bench is empty on purpose.",districtFlavor:"Meaning Ridge · come and rest",challenge:{kind:"sequence",id:"daily-rest",title:"Come and rest",idea:"rest is offered to tired people first",prompt:"Jesus’ invitation has an order. Set the stones.",context:"Matthew 11:28. Tired people are named first. The invitation is to a person, not a performance.",items:[{id:"a",gem:"heart",text:"You are tired and carrying too much."},{id:"b",gem:"door",text:"Jesus says, “Come to me.”"},{id:"c",gem:"star",text:"He promises rest — not a steeper hill."}],teachOnWrong:"The weary are addressed before the command. Rest is the gift, not a prize for climbing harder.",deeper:"Come to me, all who labor and are heavy laden, and I will give you rest."}},{id:"trail-neighbor",teaser:"A child left chalk arrows toward the well.",districtFlavor:"Story Creek · who is near",challenge:{kind:"build-argument",id:"daily-neighbor",title:"Who is near",idea:"neighbor is the one who shows mercy",prompt:"Build the Samaritan’s answer from the stones provided.",context:"Luke 10:36–37. The question “who is my neighbor?” is turned around. Mercy makes a neighbor.",slots:[{id:"p1",role:"premise",label:"The scene",correctCardId:"wounded"},{id:"p2",role:"premise",label:"The action",correctCardId:"helped"},{id:"c",role:"conclusion",label:"The measure",correctCardId:"mercy"}],cards:[{id:"wounded",text:"A man is left wounded on the road"},{id:"helped",text:"An unlikely traveler is moved with compassion and helps"},{id:"mercy",text:"Neighbor is the one who showed mercy"},{id:"priest",text:"The priest who passed by is the hero",distractor:!0}],teachOnWrong:"Jesus asks which man *proved* to be a neighbor. Mercy, not pedigree, is the measure. Leave the decoy in the bank.",deeper:"He said, “The one who showed him mercy.” And Jesus said, “You go, and do likewise.”"}},{id:"trail-empty",teaser:"Dawn light on an unused grave cloth.",districtFlavor:"Witness Square · morning",challenge:{kind:"sort",id:"daily-empty",title:"Morning",idea:"the first Easter reports are awkward on purpose",prompt:"Which details belong in the first Easter reports?",context:"The first reports are not tidy. They include women, fear, and an empty place. The town does not sand that down.",keepLabel:"In the reports",discardLabel:"Later invention?",tiles:[{id:"a",text:"The tomb is found empty.",bin:"keep",why:"The first reports open with an empty place, not a tidy triumph."},{id:"b",text:"Women are among the first witnesses.",bin:"keep",why:"Luke names women first — and that the men called it idle talk."},{id:"c",text:"Rome instantly converts the senate.",bin:"discard"},{id:"d",text:"Fear and wonder sit side by side.",bin:"keep",why:"The opening keeps fear; it is not sanded into instant victory."}],teachOnWrong:"Luke 24 begins with an empty place and a dismissed report. Keep the awkwardness; toss the tidy triumph.",deeper:"They found the stone rolled away from the tomb, but when they went in they did not find the body."}},{id:"trail-cosmos",teaser:"The chalkboard still says “why anything at all?”",districtFlavor:"Sky Watch · a first question",challenge:{kind:"build-argument",id:"daily-cosmos",title:"Why anything at all",idea:"why there is anything at all points to a Source",prompt:"Set the three stones of a cosmological question the psalms are willing to ask.",context:"The psalms ask why there is a world at all. That question points to a Source — not to a polite silence.",slots:[{id:"p1",role:"premise",label:"Fact",correctCardId:"exists"},{id:"p2",role:"premise",label:"Surprise",correctCardId:"contingent"},{id:"c",role:"conclusion",label:"Question",correctCardId:"ask"}],cards:[{id:"exists",text:"The universe exists"},{id:"contingent",text:"It did not have to"},{id:"ask",text:"So a Source is worth naming"},{id:"shrug",text:"So questions are impolite",distractor:!0}],teachOnWrong:"Existence plus contingency yields a question, not a scolding. Leave the shrug in the bank.",deeper:"Psalm 8: when I look at your heavens… what is man that you are mindful of him?"}},{id:"trail-door",teaser:"Someone chalked a small door on the lookout wall.",districtFlavor:"Meaning Ridge · a door, not a wall",challenge:{kind:"match",id:"daily-door",title:"A door, not a wall",idea:"Jesus claims to be a door in, not a wall",prompt:"Match Jesus’ image to what it offers.",context:"“I am the door” is a claim about access — personal, particular. You may refuse it. The town will not lock you in a pew.",pairs:[{id:"door",gem:"door",scene:"door",left:"A door",right:"A way in, not a dead end"},{id:"pasture",gem:"tree",scene:"pasture",left:"Pasture",right:"Life on the other side"},{id:"anyone",gem:"heart",scene:"welcome",left:"Anyone",right:"The invitation’s width"}],teachOnWrong:"John 10 is an invitation with a particular door and a wide “anyone.” Snap the image to the gift.",deeper:"I am the door. If anyone enters by me, he will be saved and will go in and out and find pasture."}}];function yl(a,o=99){const r=fl.filter(m=>m.early),h=o<2&&r.length>0?r:fl,d=cg(`silver-city-trail:${a}`)%h.length;return h[d]}const hg={id:"first-gate",order:4,title:"Why Gate",shortTitle:"Why",subtitle:"Why is there a world at all?",blurb:"Aristotle walked this road; Aquinas drew the map; the question has not aged out.",intro:["The oldest gate in Silver City has no lock — only a line in the stone: Why is there a world at all?","Cosmological arguments do not begin with a vision. They begin with ordinary facts: things change; things might not have been; this universe appears to have a beginning.","If the steps hold, you do not yet have the whole creed. You have a destination with a name in classical theism: a first mover, a necessary being, a cause of what begins. Further attributes take further work. That honesty is strength."],icon:"gate",accent:"#c46b4a",challenges:[{kind:"sequence",id:"fg-mover",title:"The unmoved mover",idea:"change here and now still asks for a first changer",prompt:"Order Aquinas’s First Way as a chain of explanation — not as a timeline of yesterday’s events.",context:"Thomas Aquinas, Summa Theologiae I, q.2, a.3, drawing on Aristotle’s account of change (Physics VIII; Metaphysics XII). “First” here is explanatory. It is not automatically “a moment long ago.”",items:[{id:"a",text:"We observe things actually changing — moving from potential to actual."},{id:"b",text:"Nothing reduces itself from potential to actual; it is changed by another."},{id:"c",text:"A regress of changers cannot, by itself, explain change here and now."},{id:"d",text:"There is a first changer not itself changed — the unmoved mover."}],teachOnWrong:"Do not turn this into “dominoes starting at the Big Bang.” Aquinas is asking what accounts for change in the present. Infinite backlog is not an explanation if every member is still a receiver of change.",deeper:"Critics ask whether quantum events or a past-eternal cosmos break the chain. Defenders reply that contingent, changing states still need a cause of their actuality. The argument’s nerve is explanation, not a stopwatch."},{kind:"build-argument",id:"fg-contingent",title:"What might not have been",idea:"what might not have been needs a ground",prompt:"Assemble a contingency argument in a valid order.",context:"Related to Aquinas’s Third Way (ST I, q.2, a.3) and Leibniz’s principle of sufficient reason. Contingent means: it exists, but it could have failed to exist.",slots:[{id:"p1",role:"premise",label:"Premise 1",correctCardId:"exist"},{id:"p2",role:"premise",label:"Premise 2",correctCardId:"depend"},{id:"p3",role:"premise",label:"Premise 3",correctCardId:"need"},{id:"c",role:"conclusion",label:"Conclusion",correctCardId:"ground"}],cards:[{id:"exist",text:"Contingent things exist — they are real, and they might not have been."},{id:"depend",text:"A contingent thing exists because of another; it does not contain the reason for its existence in itself."},{id:"need",text:"A series of only contingent things never explains why anything exists rather than nothing."},{id:"ground",text:"Therefore there is a necessary reality whose existence is not derived — the world’s ground, which classical theism names God."},{id:"weather",text:"Everything is obviously necessary, including last Tuesday’s weather.",distractor:!0},{id:"trinity",text:"Contingency, by itself, proves the doctrine of the Trinity.",distractor:!0}],teachOnWrong:"Leave the joke cards in the bank. The valid chain moves from contingent beings, through the failure of a purely contingent series, to a necessary ground — not to every later Christian doctrine at once.",deeper:"Atheist replies include: the universe itself is necessary; or “brute fact” is acceptable; or quantum vacua suffice. Each reply relocates necessity or else gives up explanation. That is a real debate — not a slogan fight."},{kind:"sort",id:"fg-kalam",title:"Whatever begins",idea:"whatever begins still asks for a cause",prompt:"Keep the careful reading of the kalām form. Toss the flattenings.",context:"Whatever begins to exist has a cause; the universe began to exist; therefore it has a cause. Medieval kalām (al-Ghazālī); modern analytic form (Craig).",keepLabel:"Keep",discardLabel:"Toss",tiles:[{id:"a",text:"If both premises hold, you get a cause of the beginning — personhood and the gospel take further steps.",bin:"keep"},{id:"b",text:"Mentioning the argument proves every line of the Nicene Creed.",bin:"discard"},{id:"c",text:"Popular books saying “nothing” make premise 2 beyond dispute.",bin:"discard"},{id:"d",text:"Aristotle already used this exact three-line kalām syllogism.",bin:"discard"}],teachOnWrong:"Name the steps. “Began” is debated. Aristotle’s unmoved mover is a different road. Do not collapse the traditions.",deeper:"Write the argument, then the best objection, then the reply. That is how these arguments have actually lived."},{kind:"sort",id:"fg-limits",title:"What the gate opens",idea:"a first cause is not yet the whole creed",prompt:"If a cosmological argument succeeds, what do you actually have?",context:"Suppose there is a first cause or necessary being. One traveler says the whole creed is finished. Another says the argument was worthless because it did not preach the sermon on the mount.",keepLabel:"Keep",discardLabel:"Toss",tiles:[{id:"a",text:"A metaphysical destination. Intellect, goodness, and the gospel are further steps — not leaks.",bin:"keep"},{id:"b",text:"Nothing useful, because only a full systematic theology counts.",bin:"discard"},{id:"c",text:"A complete biography of God, including every future event.",bin:"discard"},{id:"d",text:"Proof that inquiry should stop, because mystery is a vice.",bin:"discard"}],teachOnWrong:"Partial conclusions are how reasoning works. Aquinas does not stop at q.2. Layers are not leaks.",deeper:"Pascal’s warning about the God of the philosophers is a warning against stopping — not a command to skip the philosophers."}]},dg={id:"high-lookout",order:5,title:"Meaning Ridge",shortTitle:"Meaning",subtitle:"Mind, duty, meaning, and beauty",blurb:"The trail turns inward: why do we know good, and why does beauty wound us?",intro:["The path ends — and does not end — on a lookout where the whole town lies below. Here the clues are closer than stars: conscience, consciousness, the ache for meaning, the strange authority of beauty.","These are not laboratory instruments. They are the conditions under which any instrument is used. Ignore them, and the case for God is thinner than it should be. Inflate them, and you preach at a wound instead of thinking with it.","Take each as a signpost. Signposts do not drag you. They tell you a country may be real."],icon:"peak",accent:"#b86b8a",challenges:[{kind:"build-argument",id:"hl-moral",title:"The grain of duty",idea:"duty feels real, not like a taste for tea",prompt:"Build a modest moral argument: morality as evidence, not as a police report.",context:"Popular form (often associated with Kantian echoes and, in recent apologetics, with a crisp syllogism): if objective moral duties exist, their most fitting ground is a good God. Atheist moral realists (e.g. some followers of G. E. Moore or Russ Shafer-Landau) deny that the first link is required. Keep the disagreement visible.",slots:[{id:"p1",role:"premise",label:"Premise 1",correctCardId:"real"},{id:"p2",role:"premise",label:"Premise 2",correctCardId:"home"},{id:"p3",role:"premise",label:"Premise 3",correctCardId:"fit"},{id:"c",role:"conclusion",label:"Conclusion",correctCardId:"clue"}],cards:[{id:"real",text:"We experience some duties as real — not mere taste. “Do not torture a child for fun” does not feel like a preference for tea."},{id:"home",text:"A moral law that judges even our interests is more at home if the world’s ground is good than if the world’s ground is indifferent."},{id:"fit",text:"A morally good God is a fitting ground for objective duty — though some atheists defend moral realism without God."},{id:"clue",text:"Therefore the moral life is a clue toward God: evidence to be weighed, not a knockdown certificate."},{id:"police",text:"Therefore everyone who disagrees is secretly a villain and need not be answered.",distractor:!0},{id:"taste",text:"Therefore morality is only herd instinct, and the premise of real duty was a joke.",distractor:!0}],teachOnWrong:"The two discarded cards are temptations: contempt, or collapse. The valid chain honors the experience of duty, names a theistic ground as fitting, and still admits a real philosophical rival.",deeper:"Romans 2:14–15 speaks of a law “written on the heart.” That is not a sneer at people who doubt. It is a claim that moral knowledge is widely shared — which is why we can argue about it at all."},{kind:"match",id:"hl-mind",title:"The inside of mind",idea:"inner experience is not captured by a scan",prompt:"Match each feature of mind to what physical description still leaves standing.",context:"Inner experience is not captured by a scan. The “hard problem” is why physical process is accompanied by felt life at all. Mind is at home if the world’s ground is a living God — not an indifferent process.",pairs:[{id:"qualia",gem:"heart",scene:"redness",left:"Felt redness",right:"The felt redness of red — not captured by a wavelength number"},{id:"about",gem:"lamp",scene:"aboutness",left:"Thoughts about things",right:"Thoughts being about things, not only colliding with them"},{id:"hard",gem:"door",scene:"mindgap",left:"Why it feels like something",right:"Why physical process is accompanied by inner experience at all"},{id:"reason",gem:"star",scene:"truenorth",left:"Reason as norm",right:"Following a standard of truth, not only a causal shove"}],teachOnWrong:"Pair the everyday word with the leftover mystery. Wavelengths, brain scans, and causes are real — they are not yet the felt, the about, the why-it-is-like-something, or the ought-of-logic.",deeper:"A living God is the home of mind. Materialism hopes a future theory will close the gap. Hold the claim: inner life is not an accident at the end of indifference."},{kind:"sort",id:"hl-meaning",title:"Invented or found",idea:"meaning is found, not only invented",prompt:"Keep the lookout’s real question. Toss the decoys.",context:"Ecclesiastes refuses cheap cheer and cheap despair. The hunger for a final good has an object (Eccl 12:13).",keepLabel:"Keep",discardLabel:"Toss",tiles:[{id:"a",text:"Is meaning only invented — or also discovered? Does the hunger for a final good have an object?",bin:"keep"},{id:"b",text:"Can we force every doubter to feel meaning on command?",bin:"discard"},{id:"c",text:"Does Ecclesiastes forbid ordinary work and love as pointless?",bin:"discard"},{id:"d",text:"Has science located the meaning organ and closed the file?",bin:"discard"}],teachOnWrong:"Constructed meaning can be real at human scale. The deeper question is whether our loves are at home in the universe.",deeper:"If God is the good that created goods point toward, ordinary loves are not canceled. They are promised a future."},{kind:"sort",id:"hl-beauty",title:"Homesick at the music",idea:"beauty wakes a hunger it cannot feed",prompt:"Keep Lewis’s careful use of longing. Toss the rest.",context:"Beauty wakes a hunger it cannot feed — Sehnsucht. Lewis: as if a memory of a country you have not visited.",keepLabel:"Keep",discardLabel:"Toss",tiles:[{id:"a",text:"A signpost, not a theorem: the hunger may mean we were made for another country.",bin:"keep"},{id:"b",text:"Beautiful feelings already are the beatific vision.",bin:"discard"},{id:"c",text:"Anyone unmoved by your favorite song is morally lost.",bin:"discard"},{id:"d",text:"Psalm 19 forbids looking at the sky except as physics.",bin:"discard"}],teachOnWrong:"The feeling is a messenger, not the city. Taste differs. Psalm 19 treats the sky as speech — physics can be part of the reading.",deeper:"Beauty does not replace the earlier areas. It keeps them from becoming only a brief."}]},lk={"first-gate.xml":`<?xml version="1.0" encoding="UTF-8"?>
<areaPack id="first-gate" schemaVersion="3" appVersion="1.4.50" generated="2026-09-14T13:15:00-05:00" host="https://cphillippe.github.io/Silver-dollar-city/" title="Why Gate" place="Why Gate" person="Ansel Gate" personId="ansel" plotId="gate">
  <howToEdit>RUNTIME CONTENT: the game loads this file as the source of truth for this area. Change player-facing text in place inside each &lt;lesson&gt;. Stable id attributes (ph-father, …) are engine keys — do not rename without a migration. Three tiers per fact: &lt;easy easyOrder="N"&gt;, &lt;medium&gt;, and &lt;hard&gt; — each with &lt;learn&gt;, &lt;match&gt;, and &lt;hold&gt;. Easy Learn: shortStory/mainIdea/loci. Medium Learn: mediumTeach (clearer than Hard, richer than Easy). Hard Learn: hardTeach/fullTeach. Held claim·reason·source stay plain and identical on all three. Hold level-up: see hold @levelUpTo / @onFail and index &lt;holdRules&gt;. Empty optional elements are intentional. Escape &amp; &lt; &gt; in text.</howToEdit>
  <meta>
    <title>Silver City — Why Gate</title>
    <subtitle>Why a world</subtitle>
    <blurb>The world exists and did not have to.</blurb>
    <notes>Runtime/build content pack. Engine maps lesson fields 1:1 to Learn / Match / Hold / Journal / street.</notes>
  </meta>
  <easyShelf order="daily-cosmos,fg-mover,fg-contingent,fg-kalam,fg-limits,daily-scroll,daily-isaiah">
    <line id="daily-cosmos" easyOrder="8">daily-cosmos</line>
    <line id="fg-mover" easyOrder="24">fg-mover</line>
    <line id="fg-contingent" easyOrder="25">fg-contingent</line>
    <line id="fg-kalam" easyOrder="26">fg-kalam</line>
    <line id="fg-limits" easyOrder="27">fg-limits</line>
    <line id="daily-scroll" easyOrder="28">daily-scroll</line>
    <line id="daily-isaiah" easyOrder="29">daily-isaiah</line>
  </easyShelf>
  <lessons>
    <lesson id="fg-mover" place="Why Gate" person="Ansel Gate" tripleId="mover-gate" ideaId="idea-mover" ideaLabel="Change needs a first actuality." challengeKind="sequence" challengeTitle="The unmoved mover">
      <easy points="10" easyOrder="24">
        <learn>
          <shortStory>Things go from “can be” to “is.” Nothing gives itself that step. A stack of receivers is not an answer. There is a first changer not itself changed.</shortStory>
          <mainIdea>Change here and now needs a first actuality that is not itself a receiver of change.</mainIdea>
          <gloss>Change here and now still asks for a first changer.</gloss>
          <loci>This idea lives at Why Gate, with Ansel.</loci>
          <word>
            <term>First mover</term>
            <sense>the bottom of the explanation — not only the oldest date</sense>
          </word>
          <hint>Order the chain of change. Two choices at a time.</hint>
        </learn>
        <match>
          <sentenceCorrect>Change here and now needs a first actuality that is not itself a receiver of change.</sentenceCorrect>
          <sentenceMisses>
            <miss>This is only a story about dominoes at the Big Bang.</miss>
            <miss>Each changing thing explains itself.</miss>
          </sentenceMisses>
          <placePrompt>That question lives at Why Gate.</placePrompt>
          <personPrompt>Ansel keeps that gate.</personPrompt>
          <ideaPrompt>Ansel’s why — change needs a first actuality.</ideaPrompt>
          <ideaLabel>Change needs a first actuality.</ideaLabel>
          <whyEasy>Ansel keeps Why Gate. Change needs a first actuality.</whyEasy>
        </match>
        <hold levelUpTo="medium" onFail="easy">
          <claim>Change here and now needs a first actuality that is not itself a receiver of change.</claim>
          <reason>Nothing reduces itself from potential to actual; an unexplained stack of changers is not an explanation.</reason>
          <source>Aquinas, ST I, q.2, a.3 (First Way)</source>
          <whyCorrect>Nothing reduces itself from potential to actual; an unexplained stack of changers is not an explanation.</whyCorrect>
          <whyMisses>
            <miss>“First” here means the earliest date on a calendar.</miss>
            <miss>Infinite backlog automatically explains present change.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Change here and now needs a first actuality that is not itself a receiver of change.</choice>
            <choice>This is only a story about dominoes at the Big Bang.</choice>
            <choice>Each changing thing explains itself.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Nothing reduces itself from potential to actual; an unexplained stack of changers is not an explanation.</choice>
            <choice>“First” here means the earliest date on a calendar.</choice>
            <choice>Infinite backlog automatically explains present change.</choice>
          </reasonChoices>
        </hold>
      </easy>
      <medium points="12">
        <learn>
          <mediumTeach>Things go from “can be” to “is.” Nothing gives itself that step. A stack of receivers is not an explanation. Change here and now needs a first actuality that is not itself only a receiver of change — classical theism’s first mover.</mediumTeach>
          <mainIdea>Change here and now needs a first actuality that is not itself a receiver of change.</mainIdea>
          <gloss>Change here and now still asks for a first changer.</gloss>
          <loci>This idea lives at Why Gate, with Ansel.</loci>
          <word>
            <term>First mover</term>
            <sense>the bottom of the explanation — not only the oldest date</sense>
          </word>
          <hint>Order the chain of change. Two choices at a time.</hint>
        </learn>
        <match>
          <sentenceCorrect>Change here and now needs a first actuality that is not itself a receiver of change.</sentenceCorrect>
          <sentenceMisses>
            <miss>This is only a story about dominoes at the Big Bang.</miss>
            <miss>Each changing thing explains itself.</miss>
          </sentenceMisses>
          <placePrompt>That question lives at Why Gate.</placePrompt>
          <personPrompt>Ansel keeps that gate.</personPrompt>
          <ideaPrompt>Ansel’s why — change needs a first actuality.</ideaPrompt>
          <ideaLabel>Change needs a first actuality.</ideaLabel>
          <whyMedium>Ansel keeps Why Gate. Change needs a first actuality.</whyMedium>
        </match>
        <hold levelUpTo="hard" onFail="easy">
          <claim>Change here and now needs a first actuality that is not itself a receiver of change.</claim>
          <reason>Nothing reduces itself from potential to actual; an unexplained stack of changers is not an explanation.</reason>
          <source>Aquinas, ST I, q.2, a.3 (First Way)</source>
          <whyCorrect>Nothing reduces itself from potential to actual; an unexplained stack of changers is not an explanation.</whyCorrect>
          <whyMisses>
            <miss>“First” here means the earliest date on a calendar.</miss>
            <miss>Infinite backlog automatically explains present change.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Change here and now needs a first actuality that is not itself a receiver of change.</choice>
            <choice>This is only a story about dominoes at the Big Bang.</choice>
            <choice>Each changing thing explains itself.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Nothing reduces itself from potential to actual; an unexplained stack of changers is not an explanation.</choice>
            <choice>“First” here means the earliest date on a calendar.</choice>
            <choice>Infinite backlog automatically explains present change.</choice>
          </reasonChoices>
        </hold>
      </medium>
      <hard points="15">
        <learn>
          <hardTeach>Thomas Aquinas, Summa Theologiae I, q.2, a.3, drawing on Aristotle’s account of change (Physics VIII; Metaphysics XII). “First” here is explanatory. It is not automatically “a moment long ago.”
Critics ask whether quantum events or a past-eternal cosmos break the chain. Defenders reply that contingent, changing states still need a cause of their actuality. The argument’s nerve is explanation, not a stopwatch.</hardTeach>
          <fullTeach>Thomas Aquinas, Summa Theologiae I, q.2, a.3, drawing on Aristotle’s account of change (Physics VIII; Metaphysics XII). “First” here is explanatory. It is not automatically “a moment long ago.”
Critics ask whether quantum events or a past-eternal cosmos break the chain. Defenders reply that contingent, changing states still need a cause of their actuality. The argument’s nerve is explanation, not a stopwatch.</fullTeach>
          <prompt>Order Aquinas’s First Way as a chain of explanation — not as a timeline of yesterday’s events.</prompt>
          <teachOnWrong>Do not turn this into “dominoes starting at the Big Bang.” Aquinas is asking what accounts for change in the present. Infinite backlog is not an explanation if every member is still a receiver of change.</teachOnWrong>
          <challengeTiles />
        </learn>
        <match>
          <sentenceCorrect>Change here and now needs a first actuality that is not itself a receiver of change.</sentenceCorrect>
          <sentenceMisses>
            <miss>This is only a story about dominoes at the Big Bang.</miss>
            <miss>Each changing thing explains itself.</miss>
          </sentenceMisses>
          <placePrompt>That question lives at Why Gate.</placePrompt>
          <personPrompt>Ansel keeps that gate.</personPrompt>
          <ideaPrompt>Ansel’s why — change needs a first actuality.</ideaPrompt>
          <ideaLabel>Change needs a first actuality.</ideaLabel>
          <whyHard>Ansel Gate keeps Why Gate. Nothing reduces itself from potential to actual; present change needs a first actuality.</whyHard>
        </match>
        <hold onFail="easy">
          <claim>Change here and now needs a first actuality that is not itself a receiver of change.</claim>
          <reason>Nothing reduces itself from potential to actual; an unexplained stack of changers is not an explanation.</reason>
          <source>Aquinas, ST I, q.2, a.3 (First Way)</source>
          <whyCorrect>Nothing reduces itself from potential to actual; an unexplained stack of changers is not an explanation.</whyCorrect>
          <whyMisses>
            <miss>“First” here means the earliest date on a calendar.</miss>
            <miss>Infinite backlog automatically explains present change.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Change here and now needs a first actuality that is not itself a receiver of change.</choice>
            <choice>This is only a story about dominoes at the Big Bang.</choice>
            <choice>Each changing thing explains itself.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Nothing reduces itself from potential to actual; an unexplained stack of changers is not an explanation.</choice>
            <choice>“First” here means the earliest date on a calendar.</choice>
            <choice>Infinite backlog automatically explains present change.</choice>
          </reasonChoices>
        </hold>
      </hard>
      <journal id="j-fg-1" title="Unmoved mover" kicker="Why Gate" unlockAfter="fg-mover" scoreFromHeldTier="true">
        <p>Aristotle and Aquinas begin with change: the everyday passage from potential to actual. If nothing explains its own becoming, and a stack of unexplained becomings is not an explanation, then there is a first actuality that is not itself a receiver of change.</p>
        <p>Read “first” as the bottom of the explanation, not merely the earliest date on a calendar. That is why the argument can be aimed at the present cosmos, not only at a first Tuesday.</p>
        <sources>
          <source>Aristotle, Physics VIII; Metaphysics XII</source>
          <source>Aquinas, Summa Theologiae I, q.2, a.3 (First Way)</source>
        </sources>
      </journal>
    </lesson>
    <lesson id="fg-contingent" place="Why Gate" person="Ansel Gate" tripleId="contingent-gate" ideaId="idea-contingent" ideaLabel="Might-not-have-beens need a necessary ground." challengeKind="build-argument" challengeTitle="What might not have been">
      <easy points="10" easyOrder="25">
        <learn>
          <shortStory>You exist, but you might not have. A world of only “might-not-have-beens” does not explain why anything is here. Classical theism names the necessary ground God.</shortStory>
          <mainIdea>A world of might-not-have-beens still needs a necessary ground.</mainIdea>
          <gloss>What might not have been needs a ground.</gloss>
          <loci>This idea lives at Why Gate, with Ansel.</loci>
          <word>
            <term>Might not have been</term>
            <sense>it is real, but it could have failed to be</sense>
          </word>
          <hint>Assemble the chain. Leave the joke cards.</hint>
        </learn>
        <match>
          <sentenceCorrect>A world of might-not-have-beens still needs a necessary ground.</sentenceCorrect>
          <sentenceMisses>
            <miss>Contingent things contain the reason why there is anything.</miss>
            <miss>Rivals are unintelligible and need not be named.</miss>
          </sentenceMisses>
          <placePrompt>That question lives at Why Gate.</placePrompt>
          <personPrompt>Ansel keeps that gate.</personPrompt>
          <ideaPrompt>Ansel’s why — might-not-have-beens need a necessary ground.</ideaPrompt>
          <ideaLabel>Might-not-have-beens need a necessary ground.</ideaLabel>
          <whyEasy>Ansel keeps Why Gate. Might-not-have-beens need a necessary ground.</whyEasy>
        </match>
        <hold levelUpTo="medium" onFail="easy">
          <claim>A world of might-not-have-beens still needs a necessary ground.</claim>
          <reason>Contingent things exist; “it just is” is also a metaphysics, not automatically cheaper.</reason>
          <source>Aquinas’s Third Way; Leibniz on sufficient reason</source>
          <whyCorrect>Contingent things exist; “it just is” is also a metaphysics, not automatically cheaper.</whyCorrect>
          <whyMisses>
            <miss>Necessary being is only a weather report.</miss>
            <miss>Brute fact is not a metaphysical move.</miss>
          </whyMisses>
          <claimChoices>
            <choice>A world of might-not-have-beens still needs a necessary ground.</choice>
            <choice>Contingent things contain the reason why there is anything.</choice>
            <choice>Rivals are unintelligible and need not be named.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Contingent things exist; “it just is” is also a metaphysics, not automatically cheaper.</choice>
            <choice>Necessary being is only a weather report.</choice>
            <choice>Brute fact is not a metaphysical move.</choice>
          </reasonChoices>
        </hold>
      </easy>
      <medium points="12">
        <learn>
          <mediumTeach>You exist, but you might not have. Contingent means: it is here, yet it could have failed to be. A world of only might-not-have-beens does not explain why anything is here. Classical theism names the necessary ground God.</mediumTeach>
          <mainIdea>A world of might-not-have-beens still needs a necessary ground.</mainIdea>
          <gloss>What might not have been needs a ground.</gloss>
          <loci>This idea lives at Why Gate, with Ansel.</loci>
          <word>
            <term>Might not have been</term>
            <sense>it is real, but it could have failed to be</sense>
          </word>
          <hint>Assemble the chain. Leave the joke cards.</hint>
        </learn>
        <match>
          <sentenceCorrect>A world of might-not-have-beens still needs a necessary ground.</sentenceCorrect>
          <sentenceMisses>
            <miss>Contingent things contain the reason why there is anything.</miss>
            <miss>Rivals are unintelligible and need not be named.</miss>
          </sentenceMisses>
          <placePrompt>That question lives at Why Gate.</placePrompt>
          <personPrompt>Ansel keeps that gate.</personPrompt>
          <ideaPrompt>Ansel’s why — might-not-have-beens need a necessary ground.</ideaPrompt>
          <ideaLabel>Might-not-have-beens need a necessary ground.</ideaLabel>
          <whyMedium>Ansel keeps Why Gate. Might-not-have-beens need a necessary ground.</whyMedium>
        </match>
        <hold levelUpTo="hard" onFail="easy">
          <claim>A world of might-not-have-beens still needs a necessary ground.</claim>
          <reason>Contingent things exist; “it just is” is also a metaphysics, not automatically cheaper.</reason>
          <source>Aquinas’s Third Way; Leibniz on sufficient reason</source>
          <whyCorrect>Contingent things exist; “it just is” is also a metaphysics, not automatically cheaper.</whyCorrect>
          <whyMisses>
            <miss>Necessary being is only a weather report.</miss>
            <miss>Brute fact is not a metaphysical move.</miss>
          </whyMisses>
          <claimChoices>
            <choice>A world of might-not-have-beens still needs a necessary ground.</choice>
            <choice>Contingent things contain the reason why there is anything.</choice>
            <choice>Rivals are unintelligible and need not be named.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Contingent things exist; “it just is” is also a metaphysics, not automatically cheaper.</choice>
            <choice>Necessary being is only a weather report.</choice>
            <choice>Brute fact is not a metaphysical move.</choice>
          </reasonChoices>
        </hold>
      </medium>
      <hard points="15">
        <learn>
          <hardTeach>Related to Aquinas’s Third Way (ST I, q.2, a.3) and Leibniz’s principle of sufficient reason. Contingent means: it exists, but it could have failed to exist.
Atheist replies include: the universe itself is necessary; or “brute fact” is acceptable; or quantum vacua suffice. Each reply relocates necessity or else gives up explanation. That is a real debate — not a slogan fight.</hardTeach>
          <fullTeach>Related to Aquinas’s Third Way (ST I, q.2, a.3) and Leibniz’s principle of sufficient reason. Contingent means: it exists, but it could have failed to exist.
Atheist replies include: the universe itself is necessary; or “brute fact” is acceptable; or quantum vacua suffice. Each reply relocates necessity or else gives up explanation. That is a real debate — not a slogan fight.</fullTeach>
          <prompt>Assemble a contingency argument in a valid order.</prompt>
          <teachOnWrong>Leave the joke cards in the bank. The valid chain moves from contingent beings, through the failure of a purely contingent series, to a necessary ground — not to every later Christian doctrine at once.</teachOnWrong>
          <challengeTiles />
        </learn>
        <match>
          <sentenceCorrect>A world of might-not-have-beens still needs a necessary ground.</sentenceCorrect>
          <sentenceMisses>
            <miss>Contingent things contain the reason why there is anything.</miss>
            <miss>Rivals are unintelligible and need not be named.</miss>
          </sentenceMisses>
          <placePrompt>That question lives at Why Gate.</placePrompt>
          <personPrompt>Ansel keeps that gate.</personPrompt>
          <ideaPrompt>Ansel’s why — might-not-have-beens need a necessary ground.</ideaPrompt>
          <ideaLabel>Might-not-have-beens need a necessary ground.</ideaLabel>
          <whyHard>Ansel Gate keeps Why Gate. A world of might-not-have-beens still needs a necessary ground — not a shrug.</whyHard>
        </match>
        <hold onFail="easy">
          <claim>A world of might-not-have-beens still needs a necessary ground.</claim>
          <reason>Contingent things exist; “it just is” is also a metaphysics, not automatically cheaper.</reason>
          <source>Aquinas’s Third Way; Leibniz on sufficient reason</source>
          <whyCorrect>Contingent things exist; “it just is” is also a metaphysics, not automatically cheaper.</whyCorrect>
          <whyMisses>
            <miss>Necessary being is only a weather report.</miss>
            <miss>Brute fact is not a metaphysical move.</miss>
          </whyMisses>
          <claimChoices>
            <choice>A world of might-not-have-beens still needs a necessary ground.</choice>
            <choice>Contingent things contain the reason why there is anything.</choice>
            <choice>Rivals are unintelligible and need not be named.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Contingent things exist; “it just is” is also a metaphysics, not automatically cheaper.</choice>
            <choice>Necessary being is only a weather report.</choice>
            <choice>Brute fact is not a metaphysical move.</choice>
          </reasonChoices>
        </hold>
      </hard>
      <journal id="j-fg-2" title="Necessary being" kicker="Why Gate" unlockAfter="fg-contingent" scoreFromHeldTier="true">
        <p>Contingent things exist. A world made only of “might-not-have-beens” does not contain the reason why there is anything. Classical theism names the necessary ground God.</p>
        <p>Rivals relocate necessity into the universe, or they accept a brute fact. Those are intelligible moves. They are not automatically cheaper. “It just is” is also a metaphysics.</p>
        <sources>
          <source>Aquinas, ST I, q.2, a.3 (Third Way)</source>
          <source>Leibniz on sufficient reason</source>
        </sources>
      </journal>
    </lesson>
    <lesson id="fg-kalam" place="Why Gate" person="Ansel Gate" tripleId="kalam-gate" ideaId="idea-kalam" ideaLabel="What begins has a cause." challengeKind="sort" challengeTitle="Whatever begins">
      <easy points="10" easyOrder="26">
        <learn>
          <shortStory>If something begins, it has a cause. If this universe began, it has a cause. Naming Abraham’s God takes further historical steps.</shortStory>
          <mainIdea>If what begins has a cause and the universe began, it has a cause.</mainIdea>
          <gloss>Whatever begins still asks for a cause.</gloss>
          <loci>This idea lives at Why Gate, with Ansel.</loci>
          <word>
            <term>Kalām</term>
            <sense>the beginning argument — what starts still asks for a cause</sense>
          </word>
          <hint>Keep the beginning argument. Toss the flattenings.</hint>
        </learn>
        <match>
          <sentenceCorrect>If what begins has a cause and the universe began, it has a cause.</sentenceCorrect>
          <sentenceMisses>
            <miss>A cause of the beginning is already the whole creed.</miss>
            <miss>The form never mentions a beginning.</miss>
          </sentenceMisses>
          <placePrompt>That question lives at Why Gate.</placePrompt>
          <personPrompt>Ansel keeps that gate.</personPrompt>
          <ideaPrompt>Ansel’s why — what begins has a cause.</ideaPrompt>
          <ideaLabel>What begins has a cause.</ideaLabel>
          <whyEasy>Ansel keeps Why Gate. What begins has a cause.</whyEasy>
        </match>
        <hold levelUpTo="medium" onFail="easy">
          <claim>If what begins has a cause and the universe began, it has a cause.</claim>
          <reason>That yields a Cause of the beginning; naming Abraham’s God takes further historical steps.</reason>
          <source>Kalām tradition; contemporary analytic statements</source>
          <whyCorrect>That yields a Cause of the beginning; naming Abraham’s God takes further historical steps.</whyCorrect>
          <whyMisses>
            <miss>The second premise cannot be argued at all.</miss>
            <miss>A first cause automatically names Jesus.</miss>
          </whyMisses>
          <claimChoices>
            <choice>If what begins has a cause and the universe began, it has a cause.</choice>
            <choice>A cause of the beginning is already the whole creed.</choice>
            <choice>The form never mentions a beginning.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>That yields a Cause of the beginning; naming Abraham’s God takes further historical steps.</choice>
            <choice>The second premise cannot be argued at all.</choice>
            <choice>A first cause automatically names Jesus.</choice>
          </reasonChoices>
        </hold>
      </easy>
      <medium points="12">
        <learn>
          <mediumTeach>Whatever begins to exist has a cause. If this universe began, it has a cause. That is already a great deal. Naming Abraham’s God takes further historical steps — not a leak in the argument, a next chapter.</mediumTeach>
          <mainIdea>If what begins has a cause and the universe began, it has a cause.</mainIdea>
          <gloss>Whatever begins still asks for a cause.</gloss>
          <loci>This idea lives at Why Gate, with Ansel.</loci>
          <word>
            <term>Kalām</term>
            <sense>the beginning argument — what starts still asks for a cause</sense>
          </word>
          <hint>Keep the beginning argument. Toss the flattenings.</hint>
        </learn>
        <match>
          <sentenceCorrect>If what begins has a cause and the universe began, it has a cause.</sentenceCorrect>
          <sentenceMisses>
            <miss>A cause of the beginning is already the whole creed.</miss>
            <miss>The form never mentions a beginning.</miss>
          </sentenceMisses>
          <placePrompt>That question lives at Why Gate.</placePrompt>
          <personPrompt>Ansel keeps that gate.</personPrompt>
          <ideaPrompt>Ansel’s why — what begins has a cause.</ideaPrompt>
          <ideaLabel>What begins has a cause.</ideaLabel>
          <whyMedium>Ansel keeps Why Gate. What begins has a cause.</whyMedium>
        </match>
        <hold levelUpTo="hard" onFail="easy">
          <claim>If what begins has a cause and the universe began, it has a cause.</claim>
          <reason>That yields a Cause of the beginning; naming Abraham’s God takes further historical steps.</reason>
          <source>Kalām tradition; contemporary analytic statements</source>
          <whyCorrect>That yields a Cause of the beginning; naming Abraham’s God takes further historical steps.</whyCorrect>
          <whyMisses>
            <miss>The second premise cannot be argued at all.</miss>
            <miss>A first cause automatically names Jesus.</miss>
          </whyMisses>
          <claimChoices>
            <choice>If what begins has a cause and the universe began, it has a cause.</choice>
            <choice>A cause of the beginning is already the whole creed.</choice>
            <choice>The form never mentions a beginning.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>That yields a Cause of the beginning; naming Abraham’s God takes further historical steps.</choice>
            <choice>The second premise cannot be argued at all.</choice>
            <choice>A first cause automatically names Jesus.</choice>
          </reasonChoices>
        </hold>
      </medium>
      <hard points="15">
        <learn>
          <hardTeach>Whatever begins to exist has a cause; the universe began to exist; therefore it has a cause. Medieval kalām (al-Ghazālī); modern analytic form (Craig).
Write the argument, then the best objection, then the reply. That is how these arguments have actually lived.</hardTeach>
          <fullTeach>Whatever begins to exist has a cause; the universe began to exist; therefore it has a cause. Medieval kalām (al-Ghazālī); modern analytic form (Craig).
Write the argument, then the best objection, then the reply. That is how these arguments have actually lived.</fullTeach>
          <prompt>Keep the careful reading of the kalām form. Toss the flattenings.</prompt>
          <teachOnWrong>Name the steps. “Began” is debated. Aristotle’s unmoved mover is a different road. Do not collapse the traditions.</teachOnWrong>
          <challengeTiles>
            <keep>If both premises hold, you get a cause of the beginning — personhood and the gospel take further steps.</keep>
            <discard>Mentioning the argument proves every line of the Nicene Creed.</discard>
            <discard>Popular books saying “nothing” make premise 2 beyond dispute.</discard>
            <discard>Aristotle already used this exact three-line kalām syllogism.</discard>
          </challengeTiles>
        </learn>
        <match>
          <sentenceCorrect>If what begins has a cause and the universe began, it has a cause.</sentenceCorrect>
          <sentenceMisses>
            <miss>A cause of the beginning is already the whole creed.</miss>
            <miss>The form never mentions a beginning.</miss>
          </sentenceMisses>
          <placePrompt>That question lives at Why Gate.</placePrompt>
          <personPrompt>Ansel keeps that gate.</personPrompt>
          <ideaPrompt>Ansel’s why — what begins has a cause.</ideaPrompt>
          <ideaLabel>What begins has a cause.</ideaLabel>
          <whyHard>Ansel Gate keeps Why Gate. If what begins has a cause and the universe began, it has a Cause of the beginning.</whyHard>
        </match>
        <hold onFail="easy">
          <claim>If what begins has a cause and the universe began, it has a cause.</claim>
          <reason>That yields a Cause of the beginning; naming Abraham’s God takes further historical steps.</reason>
          <source>Kalām tradition; contemporary analytic statements</source>
          <whyCorrect>That yields a Cause of the beginning; naming Abraham’s God takes further historical steps.</whyCorrect>
          <whyMisses>
            <miss>The second premise cannot be argued at all.</miss>
            <miss>A first cause automatically names Jesus.</miss>
          </whyMisses>
          <claimChoices>
            <choice>If what begins has a cause and the universe began, it has a cause.</choice>
            <choice>A cause of the beginning is already the whole creed.</choice>
            <choice>The form never mentions a beginning.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>That yields a Cause of the beginning; naming Abraham’s God takes further historical steps.</choice>
            <choice>The second premise cannot be argued at all.</choice>
            <choice>A first cause automatically names Jesus.</choice>
          </reasonChoices>
        </hold>
      </hard>
      <journal id="j-fg-3" title="Beginning and cause" kicker="Why Gate" unlockAfter="fg-kalam" scoreFromHeldTier="true">
        <p>The kalām form is clean: what begins has a cause; the universe began; therefore it has a cause. The second premise is argued from the impossibility of an infinite past and from the cosmos we actually observe.</p>
        <p>That yields a cause of the beginning. Personhood, goodness, and the name of the God of Abraham are further questions — some of them historical.</p>
        <sources>
          <source>Philoponus against an eternal world</source>
          <source>al-Ghazālī and the kalām tradition</source>
          <source>Craig’s modern statement of the kalām syllogism</source>
        </sources>
      </journal>
    </lesson>
    <lesson id="fg-limits" place="Why Gate" person="Ansel Gate" tripleId="limits-gate" ideaId="idea-limits" ideaLabel="A first cause is not yet the whole gospel." challengeKind="sort" challengeTitle="What the gate opens">
      <easy points="10" easyOrder="27">
        <learn>
          <shortStory>If the argument works, you have a first cause. Intellect, goodness, and the gospel are further steps — not leaks.</shortStory>
          <mainIdea>A cosmological argument is already a great deal — and not yet the sermon on the mount.</mainIdea>
          <gloss>A first cause is not yet the whole Christian faith.</gloss>
          <loci>This idea lives at Why Gate, with Ansel.</loci>
          <word>
            <term>Creed</term>
            <sense>the full Christian confession — more than “a first cause”</sense>
          </word>
          <hint>Keep the honest limit. Toss “all done” and “worthless.”</hint>
        </learn>
        <match>
          <sentenceCorrect>A cosmological argument is already a great deal — and not yet the sermon on the mount.</sentenceCorrect>
          <sentenceMisses>
            <miss>The Five Ways are already the whole gospel.</miss>
            <miss>Pascal commands you to skip the philosophers.</miss>
          </sentenceMisses>
          <placePrompt>That question lives at Why Gate.</placePrompt>
          <personPrompt>Ansel keeps that gate.</personPrompt>
          <ideaPrompt>Ansel’s why — a first cause is not yet the whole gospel.</ideaPrompt>
          <ideaLabel>A first cause is not yet the whole gospel.</ideaLabel>
          <whyEasy>Ansel keeps Why Gate. A first cause is not yet the whole gospel.</whyEasy>
        </match>
        <hold levelUpTo="medium" onFail="easy">
          <claim>A cosmological argument is already a great deal — and not yet the sermon on the mount.</claim>
          <reason>Aquinas argues onward from the Ways; the New Testament adds a particular history.</reason>
          <source>Aquinas ST I; Pascal on philosophers and Abraham</source>
          <whyCorrect>Aquinas argues onward from the Ways; the New Testament adds a particular history.</whyCorrect>
          <whyMisses>
            <miss>Stopping at a first cause is required.</miss>
            <miss>History has nothing further to add.</miss>
          </whyMisses>
          <claimChoices>
            <choice>A cosmological argument is already a great deal — and not yet the sermon on the mount.</choice>
            <choice>The Five Ways are already the whole gospel.</choice>
            <choice>Pascal commands you to skip the philosophers.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Aquinas argues onward from the Ways; the New Testament adds a particular history.</choice>
            <choice>Stopping at a first cause is required.</choice>
            <choice>History has nothing further to add.</choice>
          </reasonChoices>
        </hold>
      </easy>
      <medium points="12">
        <learn>
          <mediumTeach>A cosmological argument, if it works, gives a first cause or necessary being — already a great deal. It is not yet the sermon on the mount. Intellect, goodness, and the gospel are further steps, not proofs that the first step failed.</mediumTeach>
          <mainIdea>A cosmological argument is already a great deal — and not yet the sermon on the mount.</mainIdea>
          <gloss>A first cause is not yet the whole Christian faith.</gloss>
          <loci>This idea lives at Why Gate, with Ansel.</loci>
          <word>
            <term>Creed</term>
            <sense>the full Christian confession — more than “a first cause”</sense>
          </word>
          <hint>Keep the honest limit. Toss “all done” and “worthless.”</hint>
        </learn>
        <match>
          <sentenceCorrect>A cosmological argument is already a great deal — and not yet the sermon on the mount.</sentenceCorrect>
          <sentenceMisses>
            <miss>The Five Ways are already the whole gospel.</miss>
            <miss>Pascal commands you to skip the philosophers.</miss>
          </sentenceMisses>
          <placePrompt>That question lives at Why Gate.</placePrompt>
          <personPrompt>Ansel keeps that gate.</personPrompt>
          <ideaPrompt>Ansel’s why — a first cause is not yet the whole gospel.</ideaPrompt>
          <ideaLabel>A first cause is not yet the whole gospel.</ideaLabel>
          <whyMedium>Ansel keeps Why Gate. A first cause is not yet the whole gospel.</whyMedium>
        </match>
        <hold levelUpTo="hard" onFail="easy">
          <claim>A cosmological argument is already a great deal — and not yet the sermon on the mount.</claim>
          <reason>Aquinas argues onward from the Ways; the New Testament adds a particular history.</reason>
          <source>Aquinas ST I; Pascal on philosophers and Abraham</source>
          <whyCorrect>Aquinas argues onward from the Ways; the New Testament adds a particular history.</whyCorrect>
          <whyMisses>
            <miss>Stopping at a first cause is required.</miss>
            <miss>History has nothing further to add.</miss>
          </whyMisses>
          <claimChoices>
            <choice>A cosmological argument is already a great deal — and not yet the sermon on the mount.</choice>
            <choice>The Five Ways are already the whole gospel.</choice>
            <choice>Pascal commands you to skip the philosophers.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Aquinas argues onward from the Ways; the New Testament adds a particular history.</choice>
            <choice>Stopping at a first cause is required.</choice>
            <choice>History has nothing further to add.</choice>
          </reasonChoices>
        </hold>
      </medium>
      <hard points="15">
        <learn>
          <hardTeach>Suppose there is a first cause or necessary being. One traveler says the whole creed is finished. Another says the argument was worthless because it did not preach the sermon on the mount.
Pascal’s warning about the God of the philosophers is a warning against stopping — not a command to skip the philosophers.</hardTeach>
          <fullTeach>Suppose there is a first cause or necessary being. One traveler says the whole creed is finished. Another says the argument was worthless because it did not preach the sermon on the mount.
Pascal’s warning about the God of the philosophers is a warning against stopping — not a command to skip the philosophers.</fullTeach>
          <prompt>If a cosmological argument succeeds, what do you actually have?</prompt>
          <teachOnWrong>Partial conclusions are how reasoning works. Aquinas does not stop at q.2. Layers are not leaks.</teachOnWrong>
          <challengeTiles>
            <keep>A metaphysical destination. Intellect, goodness, and the gospel are further steps — not leaks.</keep>
            <discard>Nothing useful, because only a full systematic theology counts.</discard>
            <discard>A complete biography of God, including every future event.</discard>
            <discard>Proof that inquiry should stop, because mystery is a vice.</discard>
          </challengeTiles>
        </learn>
        <match>
          <sentenceCorrect>A cosmological argument is already a great deal — and not yet the sermon on the mount.</sentenceCorrect>
          <sentenceMisses>
            <miss>The Five Ways are already the whole gospel.</miss>
            <miss>Pascal commands you to skip the philosophers.</miss>
          </sentenceMisses>
          <placePrompt>That question lives at Why Gate.</placePrompt>
          <personPrompt>Ansel keeps that gate.</personPrompt>
          <ideaPrompt>Ansel’s why — a first cause is not yet the whole gospel.</ideaPrompt>
          <ideaLabel>A first cause is not yet the whole gospel.</ideaLabel>
          <whyHard>Ansel Gate keeps Why Gate. A cosmological argument is already a great deal — and not yet the sermon on the mount.</whyHard>
        </match>
        <hold onFail="easy">
          <claim>A cosmological argument is already a great deal — and not yet the sermon on the mount.</claim>
          <reason>Aquinas argues onward from the Ways; the New Testament adds a particular history.</reason>
          <source>Aquinas ST I; Pascal on philosophers and Abraham</source>
          <whyCorrect>Aquinas argues onward from the Ways; the New Testament adds a particular history.</whyCorrect>
          <whyMisses>
            <miss>Stopping at a first cause is required.</miss>
            <miss>History has nothing further to add.</miss>
          </whyMisses>
          <claimChoices>
            <choice>A cosmological argument is already a great deal — and not yet the sermon on the mount.</choice>
            <choice>The Five Ways are already the whole gospel.</choice>
            <choice>Pascal commands you to skip the philosophers.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Aquinas argues onward from the Ways; the New Testament adds a particular history.</choice>
            <choice>Stopping at a first cause is required.</choice>
            <choice>History has nothing further to add.</choice>
          </reasonChoices>
        </hold>
      </hard>
      <journal id="j-fg-4" title="Honest limits" kicker="Why Gate" unlockAfter="fg-limits" scoreFromHeldTier="true">
        <p>A sound cosmological argument is already a great deal. It is not yet the sermon on the mount, and it does not need to be. Aquinas does not stop at the Five Ways; he argues onward. The New Testament adds public claims about a particular life, death, and raising.</p>
        <p>Pascal’s warning about the God of the philosophers is a warning against stopping. It is not a command to skip the philosophers.</p>
        <sources>
          <source>Aquinas, ST I, qq.2–26 (existence toward attributes)</source>
          <source>Pascal, Pensées (God of Abraham / philosophers)</source>
        </sources>
      </journal>
    </lesson>
    <lesson id="daily-cosmos" place="Why Gate" person="Ansel Gate" tripleId="ansel-gate" ideaId="idea-cosmos" ideaLabel="The world did not have to exist." challengeKind="build-argument" challengeTitle="Why anything at all">
      <easy points="10" easyOrder="8">
        <learn>
          <shortStory>The world is here, and it did not have to be. The psalms name a Giver for that gift — not a shrug that pretends the question never arises.</shortStory>
          <mainIdea>The universe exists and did not have to — so a Source is worth naming.</mainIdea>
          <gloss>The universe exists and did not have to — so a Source is worth naming.</gloss>
          <loci>This idea lives at Why Gate, with Ansel.</loci>
          <word>
            <term>Source</term>
            <sense>the One from whom this world comes</sense>
          </word>
          <hint>Keep the question. Toss the shrug.</hint>
        </learn>
        <match>
          <sentenceCorrect>The universe exists and did not have to — so a Source is worth naming.</sentenceCorrect>
          <sentenceMisses>
            <miss>Questions about a source are impolite.</miss>
            <miss>Existence plus contingency yields no question.</miss>
          </sentenceMisses>
          <placePrompt>That question lives at Why Gate.</placePrompt>
          <personPrompt>Ansel keeps that gate.</personPrompt>
          <ideaPrompt>Ansel’s why — the world exists and did not have to.</ideaPrompt>
          <ideaLabel>The world did not have to exist.</ideaLabel>
          <whyEasy>Ansel keeps Why Gate. The world exists — and did not have to.</whyEasy>
        </match>
        <hold levelUpTo="medium" onFail="easy">
          <claim>The universe exists and did not have to — so a Source is worth naming.</claim>
          <reason>The psalms ask the question out loud and expect a Giver, not a shrug.</reason>
          <source>Psalm 8:3–4</source>
          <whyCorrect>The psalms ask the question out loud and expect a Giver, not a shrug.</whyCorrect>
          <whyMisses>
            <miss>The universe had to exist just as it is.</miss>
            <miss>The psalms refuse to look at the heavens.</miss>
          </whyMisses>
          <claimChoices>
            <choice>The universe exists and did not have to — so a Source is worth naming.</choice>
            <choice>Questions about a source are impolite.</choice>
            <choice>Existence plus contingency yields no question.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>The psalms ask the question out loud and expect a Giver, not a shrug.</choice>
            <choice>The universe had to exist just as it is.</choice>
            <choice>The psalms refuse to look at the heavens.</choice>
          </reasonChoices>
        </hold>
      </easy>
      <medium points="12">
        <learn>
          <mediumTeach>The universe exists and did not have to. The psalms name a Giver — not a shrug. Why there is a world at all points to a Source worth naming, not to polite silence.</mediumTeach>
          <mainIdea>The universe exists and did not have to — so a Source is worth naming.</mainIdea>
          <gloss>The universe exists and did not have to — so a Source is worth naming.</gloss>
          <loci>This idea lives at Why Gate, with Ansel.</loci>
          <word>
            <term>Source</term>
            <sense>the One from whom this world comes</sense>
          </word>
          <hint>Keep the question. Toss the shrug.</hint>
        </learn>
        <match>
          <sentenceCorrect>The universe exists and did not have to — so a Source is worth naming.</sentenceCorrect>
          <sentenceMisses>
            <miss>Questions about a source are impolite.</miss>
            <miss>Existence plus contingency yields no question.</miss>
          </sentenceMisses>
          <placePrompt>That question lives at Why Gate.</placePrompt>
          <personPrompt>Ansel keeps that gate.</personPrompt>
          <ideaPrompt>Ansel’s why — the world exists and did not have to.</ideaPrompt>
          <ideaLabel>The world did not have to exist.</ideaLabel>
          <whyMedium>Ansel keeps Why Gate. The world exists — and did not have to.</whyMedium>
        </match>
        <hold levelUpTo="hard" onFail="easy">
          <claim>The universe exists and did not have to — so a Source is worth naming.</claim>
          <reason>The psalms ask the question out loud and expect a Giver, not a shrug.</reason>
          <source>Psalm 8:3–4</source>
          <whyCorrect>The psalms ask the question out loud and expect a Giver, not a shrug.</whyCorrect>
          <whyMisses>
            <miss>The universe had to exist just as it is.</miss>
            <miss>The psalms refuse to look at the heavens.</miss>
          </whyMisses>
          <claimChoices>
            <choice>The universe exists and did not have to — so a Source is worth naming.</choice>
            <choice>Questions about a source are impolite.</choice>
            <choice>Existence plus contingency yields no question.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>The psalms ask the question out loud and expect a Giver, not a shrug.</choice>
            <choice>The universe had to exist just as it is.</choice>
            <choice>The psalms refuse to look at the heavens.</choice>
          </reasonChoices>
        </hold>
      </medium>
      <hard points="15">
        <learn>
          <hardTeach>The psalms ask why there is a world at all. That question points to a Source — not to a polite silence.
Psalm 8: when I look at your heavens… what is man that you are mindful of him?</hardTeach>
          <fullTeach>The psalms ask why there is a world at all. That question points to a Source — not to a polite silence.
Psalm 8: when I look at your heavens… what is man that you are mindful of him?</fullTeach>
          <prompt>Set the three stones of a cosmological question the psalms are willing to ask.</prompt>
          <teachOnWrong>Existence plus contingency yields a question, not a scolding. Leave the shrug in the bank.</teachOnWrong>
          <challengeTiles />
        </learn>
        <match>
          <sentenceCorrect>The universe exists and did not have to — so a Source is worth naming.</sentenceCorrect>
          <sentenceMisses>
            <miss>Questions about a source are impolite.</miss>
            <miss>Existence plus contingency yields no question.</miss>
          </sentenceMisses>
          <placePrompt>That question lives at Why Gate.</placePrompt>
          <personPrompt>Ansel keeps that gate.</personPrompt>
          <ideaPrompt>Ansel’s why — the world exists and did not have to.</ideaPrompt>
          <ideaLabel>The world did not have to exist.</ideaLabel>
          <whyHard>Ansel Gate keeps Why Gate. That the universe exists and did not have to is the why-a-world stone.</whyHard>
        </match>
        <hold onFail="easy">
          <claim>The universe exists and did not have to — so a Source is worth naming.</claim>
          <reason>The psalms ask the question out loud and expect a Giver, not a shrug.</reason>
          <source>Psalm 8:3–4</source>
          <whyCorrect>The psalms ask the question out loud and expect a Giver, not a shrug.</whyCorrect>
          <whyMisses>
            <miss>The universe had to exist just as it is.</miss>
            <miss>The psalms refuse to look at the heavens.</miss>
          </whyMisses>
          <claimChoices>
            <choice>The universe exists and did not have to — so a Source is worth naming.</choice>
            <choice>Questions about a source are impolite.</choice>
            <choice>Existence plus contingency yields no question.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>The psalms ask the question out loud and expect a Giver, not a shrug.</choice>
            <choice>The universe had to exist just as it is.</choice>
            <choice>The psalms refuse to look at the heavens.</choice>
          </reasonChoices>
        </hold>
      </hard>
      <journal id="" title="" kicker="" unlockAfter="daily-cosmos" scoreFromHeldTier="true">
        <p />
        <sources>
          <source />
        </sources>
      </journal>
    </lesson>
    <lesson id="daily-scroll" place="Why Gate" person="Ansel Gate" tripleId="scroll-gate" ideaId="idea-scroll" ideaLabel="We hold a river of copies." challengeKind="sequence" challengeTitle="A copied line">
      <easy points="10" easyOrder="28">
        <learn>
          <shortStory>Scribes copy. Later hands compare. Then a page prints a recovered text. The word still stands.</shortStory>
          <mainIdea>We hold a river of copies, not the first ink.</mainIdea>
          <gloss>We hold a river of copies, not the first ink.</gloss>
          <loci>This idea lives at Why Gate, with Ansel.</loci>
          <word>
            <term>Copies</term>
            <sense>later hands writing the same line — not cheating</sense>
          </word>
          <hint>Keep the river of copies. Toss “we hold the first ink.”</hint>
        </learn>
        <match>
          <sentenceCorrect>We hold a river of copies, not the first ink.</sentenceCorrect>
          <sentenceMisses>
            <miss>We hold the first ink in a glass case.</miss>
            <miss>Comparison of copies is cheating.</miss>
          </sentenceMisses>
          <placePrompt>That question lives at Why Gate.</placePrompt>
          <personPrompt>Ansel keeps that gate.</personPrompt>
          <ideaPrompt>Ansel’s pages — we hold a river of copies.</ideaPrompt>
          <ideaLabel>We hold a river of copies.</ideaLabel>
          <whyEasy>Ansel keeps Why Gate. We hold a river of copies, not the first ink.</whyEasy>
        </match>
        <hold levelUpTo="medium" onFail="easy">
          <claim>We hold a river of copies, not the first ink.</claim>
          <reason>Scribes copy, later hands compare, then a modern page prints a recovered text.</reason>
          <source>Isaiah 40:8</source>
          <whyCorrect>Scribes copy, later hands compare, then a modern page prints a recovered text.</whyCorrect>
          <whyMisses>
            <miss>A line falls from the sky onto a printer.</miss>
            <miss>Transmission has no human hands.</miss>
          </whyMisses>
          <claimChoices>
            <choice>We hold a river of copies, not the first ink.</choice>
            <choice>We hold the first ink in a glass case.</choice>
            <choice>Comparison of copies is cheating.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Scribes copy, later hands compare, then a modern page prints a recovered text.</choice>
            <choice>A line falls from the sky onto a printer.</choice>
            <choice>Transmission has no human hands.</choice>
          </reasonChoices>
        </hold>
      </easy>
      <medium points="12">
        <learn>
          <mediumTeach>We do not hold the first ink. We hold a river of copies: scribes copy, later hands compare, then a page prints a recovered text. The word still stands — transmission is careful work, not a reason to throw the book away.</mediumTeach>
          <mainIdea>We hold a river of copies, not the first ink.</mainIdea>
          <gloss>We hold a river of copies, not the first ink.</gloss>
          <loci>This idea lives at Why Gate, with Ansel.</loci>
          <word>
            <term>Copies</term>
            <sense>later hands writing the same line — not cheating</sense>
          </word>
          <hint>Keep the river of copies. Toss “we hold the first ink.”</hint>
        </learn>
        <match>
          <sentenceCorrect>We hold a river of copies, not the first ink.</sentenceCorrect>
          <sentenceMisses>
            <miss>We hold the first ink in a glass case.</miss>
            <miss>Comparison of copies is cheating.</miss>
          </sentenceMisses>
          <placePrompt>That question lives at Why Gate.</placePrompt>
          <personPrompt>Ansel keeps that gate.</personPrompt>
          <ideaPrompt>Ansel’s pages — we hold a river of copies.</ideaPrompt>
          <ideaLabel>We hold a river of copies.</ideaLabel>
          <whyMedium>Ansel keeps Why Gate. We hold a river of copies, not the first ink.</whyMedium>
        </match>
        <hold levelUpTo="hard" onFail="easy">
          <claim>We hold a river of copies, not the first ink.</claim>
          <reason>Scribes copy, later hands compare, then a modern page prints a recovered text.</reason>
          <source>Isaiah 40:8</source>
          <whyCorrect>Scribes copy, later hands compare, then a modern page prints a recovered text.</whyCorrect>
          <whyMisses>
            <miss>A line falls from the sky onto a printer.</miss>
            <miss>Transmission has no human hands.</miss>
          </whyMisses>
          <claimChoices>
            <choice>We hold a river of copies, not the first ink.</choice>
            <choice>We hold the first ink in a glass case.</choice>
            <choice>Comparison of copies is cheating.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Scribes copy, later hands compare, then a modern page prints a recovered text.</choice>
            <choice>A line falls from the sky onto a printer.</choice>
            <choice>Transmission has no human hands.</choice>
          </reasonChoices>
        </hold>
      </medium>
      <hard points="15">
        <learn>
          <hardTeach>We do not hold the first ink. We hold a river of copies.
Isaiah 40:8: the grass withers, the flower fades, but the word of our God will stand forever.</hardTeach>
          <fullTeach>We do not hold the first ink. We hold a river of copies.
Isaiah 40:8: the grass withers, the flower fades, but the word of our God will stand forever.</fullTeach>
          <prompt>How does a line travel from an ancient hand to yours?</prompt>
          <teachOnWrong>Transmission is a river, not a single page falling from the sky. Order the hands, then the comparison, then the print.</teachOnWrong>
          <challengeTiles />
        </learn>
        <match>
          <sentenceCorrect>We hold a river of copies, not the first ink.</sentenceCorrect>
          <sentenceMisses>
            <miss>We hold the first ink in a glass case.</miss>
            <miss>Comparison of copies is cheating.</miss>
          </sentenceMisses>
          <placePrompt>That question lives at Why Gate.</placePrompt>
          <personPrompt>Ansel keeps that gate.</personPrompt>
          <ideaPrompt>Ansel’s pages — we hold a river of copies.</ideaPrompt>
          <ideaLabel>We hold a river of copies.</ideaLabel>
          <whyHard>Ansel Gate keeps Why Gate. Scribes copy, later hands compare — we hold a river of copies, not the first ink.</whyHard>
        </match>
        <hold onFail="easy">
          <claim>We hold a river of copies, not the first ink.</claim>
          <reason>Scribes copy, later hands compare, then a modern page prints a recovered text.</reason>
          <source>Isaiah 40:8</source>
          <whyCorrect>Scribes copy, later hands compare, then a modern page prints a recovered text.</whyCorrect>
          <whyMisses>
            <miss>A line falls from the sky onto a printer.</miss>
            <miss>Transmission has no human hands.</miss>
          </whyMisses>
          <claimChoices>
            <choice>We hold a river of copies, not the first ink.</choice>
            <choice>We hold the first ink in a glass case.</choice>
            <choice>Comparison of copies is cheating.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Scribes copy, later hands compare, then a modern page prints a recovered text.</choice>
            <choice>A line falls from the sky onto a printer.</choice>
            <choice>Transmission has no human hands.</choice>
          </reasonChoices>
        </hold>
      </hard>
      <journal id="" title="" kicker="" unlockAfter="daily-scroll" scoreFromHeldTier="true">
        <p />
        <sources>
          <source />
        </sources>
      </journal>
    </lesson>
    <lesson id="daily-isaiah" place="Why Gate" person="Ansel Gate" tripleId="isaiah-gate" ideaId="idea-isaiah" ideaLabel="Isaiah’s Servant is Jesus." challengeKind="sort" challengeTitle="A hard poem">
      <easy points="10" easyOrder="29">
        <learn>
          <shortStory>The poem’s Servant suffers for others and does not answer with a sword. The church names that Servant as Jesus.</shortStory>
          <mainIdea>Isaiah 53’s Servant is the Jesus the church confesses — wounded for others, silent like a lamb.</mainIdea>
          <gloss>Isaiah 53’s Servant is the Jesus the church confesses — wounded for others, silent like a lamb.</gloss>
          <loci>This idea lives at Why Gate, with Ansel.</loci>
          <word>
            <term>Servant</term>
            <sense>the wounded one in Isaiah 53 — not a general on a horse</sense>
          </word>
          <hint>Keep the wounds. Toss the sword.</hint>
        </learn>
        <match>
          <sentenceCorrect>Isaiah 53’s Servant is the Jesus the church confesses — wounded for others, silent like a lamb.</sentenceCorrect>
          <sentenceMisses>
            <miss>The servant conquers Rome by sword.</miss>
            <miss>The poem is about estate planning.</miss>
          </sentenceMisses>
          <placePrompt>That question lives at Why Gate.</placePrompt>
          <personPrompt>Ansel keeps that gate.</personPrompt>
          <ideaPrompt>Ansel’s scroll — Isaiah’s Servant is Jesus.</ideaPrompt>
          <ideaLabel>Isaiah’s Servant is Jesus.</ideaLabel>
          <whyEasy>Ansel keeps Why Gate. Isaiah’s Servant is Jesus.</whyEasy>
        </match>
        <hold levelUpTo="medium" onFail="easy">
          <claim>Isaiah 53’s Servant is the Jesus the church confesses — wounded for others, silent like a lamb.</claim>
          <reason>The poem’s Servant suffers for others and does not answer with a sword; the church names that Servant as Jesus.</reason>
          <source>Isaiah 53:4–12</source>
          <whyCorrect>The poem’s Servant suffers for others and does not answer with a sword; the church names that Servant as Jesus.</whyCorrect>
          <whyMisses>
            <miss>The servant never suffers for anyone.</miss>
            <miss>Wounds are unrelated to healing in the poem.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Isaiah 53’s Servant is the Jesus the church confesses — wounded for others, silent like a lamb.</choice>
            <choice>The servant conquers Rome by sword.</choice>
            <choice>The poem is about estate planning.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>The poem’s Servant suffers for others and does not answer with a sword; the church names that Servant as Jesus.</choice>
            <choice>The servant never suffers for anyone.</choice>
            <choice>Wounds are unrelated to healing in the poem.</choice>
          </reasonChoices>
        </hold>
      </easy>
      <medium points="12">
        <learn>
          <mediumTeach>Isaiah 53’s Servant suffers for others and does not answer with a sword — wounded, silent like a lamb. The church confesses that Servant as Jesus. The poem and the gospel meet without flattening either.</mediumTeach>
          <mainIdea>Isaiah 53’s Servant is the Jesus the church confesses — wounded for others, silent like a lamb.</mainIdea>
          <gloss>Isaiah 53’s Servant is the Jesus the church confesses — wounded for others, silent like a lamb.</gloss>
          <loci>This idea lives at Why Gate, with Ansel.</loci>
          <word>
            <term>Servant</term>
            <sense>the wounded one in Isaiah 53 — not a general on a horse</sense>
          </word>
          <hint>Keep the wounds. Toss the sword.</hint>
        </learn>
        <match>
          <sentenceCorrect>Isaiah 53’s Servant is the Jesus the church confesses — wounded for others, silent like a lamb.</sentenceCorrect>
          <sentenceMisses>
            <miss>The servant conquers Rome by sword.</miss>
            <miss>The poem is about estate planning.</miss>
          </sentenceMisses>
          <placePrompt>That question lives at Why Gate.</placePrompt>
          <personPrompt>Ansel keeps that gate.</personPrompt>
          <ideaPrompt>Ansel’s scroll — Isaiah’s Servant is Jesus.</ideaPrompt>
          <ideaLabel>Isaiah’s Servant is Jesus.</ideaLabel>
          <whyMedium>Ansel keeps Why Gate. Isaiah’s Servant is Jesus.</whyMedium>
        </match>
        <hold levelUpTo="hard" onFail="easy">
          <claim>Isaiah 53’s Servant is the Jesus the church confesses — wounded for others, silent like a lamb.</claim>
          <reason>The poem’s Servant suffers for others and does not answer with a sword; the church names that Servant as Jesus.</reason>
          <source>Isaiah 53:4–12</source>
          <whyCorrect>The poem’s Servant suffers for others and does not answer with a sword; the church names that Servant as Jesus.</whyCorrect>
          <whyMisses>
            <miss>The servant never suffers for anyone.</miss>
            <miss>Wounds are unrelated to healing in the poem.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Isaiah 53’s Servant is the Jesus the church confesses — wounded for others, silent like a lamb.</choice>
            <choice>The servant conquers Rome by sword.</choice>
            <choice>The poem is about estate planning.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>The poem’s Servant suffers for others and does not answer with a sword; the church names that Servant as Jesus.</choice>
            <choice>The servant never suffers for anyone.</choice>
            <choice>Wounds are unrelated to healing in the poem.</choice>
          </reasonChoices>
        </hold>
      </medium>
      <hard points="15">
        <learn>
          <hardTeach>Isaiah 53’s Servant is the Jesus the church confesses — wounded for others, silent like a lamb.
He was pierced for our transgressions… and with his wounds we are healed.</hardTeach>
          <fullTeach>Isaiah 53’s Servant is the Jesus the church confesses — wounded for others, silent like a lamb.
He was pierced for our transgressions… and with his wounds we are healed.</fullTeach>
          <prompt>Which lines belong with Isaiah 53’s servant?</prompt>
          <teachOnWrong>Isaiah 53 is a suffering servant, not a general on a horse. Keep the wounds; toss the sword.</teachOnWrong>
          <challengeTiles>
            <keep>The servant suffers for others.</keep>
            <keep>The servant is silent like a lamb.</keep>
            <keep>Many are counted righteous through him.</keep>
            <discard>The servant conquers Rome by sword.</discard>
          </challengeTiles>
        </learn>
        <match>
          <sentenceCorrect>Isaiah 53’s Servant is the Jesus the church confesses — wounded for others, silent like a lamb.</sentenceCorrect>
          <sentenceMisses>
            <miss>The servant conquers Rome by sword.</miss>
            <miss>The poem is about estate planning.</miss>
          </sentenceMisses>
          <placePrompt>That question lives at Why Gate.</placePrompt>
          <personPrompt>Ansel keeps that gate.</personPrompt>
          <ideaPrompt>Ansel’s scroll — Isaiah’s Servant is Jesus.</ideaPrompt>
          <ideaLabel>Isaiah’s Servant is Jesus.</ideaLabel>
          <whyHard>Ansel Gate keeps Why Gate. Isaiah 53’s Servant is the Jesus the church confesses — wounded for others, silent like a lamb.</whyHard>
        </match>
        <hold onFail="easy">
          <claim>Isaiah 53’s Servant is the Jesus the church confesses — wounded for others, silent like a lamb.</claim>
          <reason>The poem’s Servant suffers for others and does not answer with a sword; the church names that Servant as Jesus.</reason>
          <source>Isaiah 53:4–12</source>
          <whyCorrect>The poem’s Servant suffers for others and does not answer with a sword; the church names that Servant as Jesus.</whyCorrect>
          <whyMisses>
            <miss>The servant never suffers for anyone.</miss>
            <miss>Wounds are unrelated to healing in the poem.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Isaiah 53’s Servant is the Jesus the church confesses — wounded for others, silent like a lamb.</choice>
            <choice>The servant conquers Rome by sword.</choice>
            <choice>The poem is about estate planning.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>The poem’s Servant suffers for others and does not answer with a sword; the church names that Servant as Jesus.</choice>
            <choice>The servant never suffers for anyone.</choice>
            <choice>Wounds are unrelated to healing in the poem.</choice>
          </reasonChoices>
        </hold>
      </hard>
      <journal id="" title="" kicker="" unlockAfter="daily-isaiah" scoreFromHeldTier="true">
        <p />
        <sources>
          <source />
        </sources>
      </journal>
    </lesson>
  </lessons>
  <streetFacts>
    <fact evidenceId="fg-mover" tripleId="mover-gate" ideaId="idea-mover" place="Why Gate" person="Ansel Gate" ideaLabel="Change needs a first actuality." />
    <fact evidenceId="fg-contingent" tripleId="contingent-gate" ideaId="idea-contingent" place="Why Gate" person="Ansel Gate" ideaLabel="Might-not-have-beens need a necessary ground." />
    <fact evidenceId="fg-kalam" tripleId="kalam-gate" ideaId="idea-kalam" place="Why Gate" person="Ansel Gate" ideaLabel="What begins has a cause." />
    <fact evidenceId="fg-limits" tripleId="limits-gate" ideaId="idea-limits" place="Why Gate" person="Ansel Gate" ideaLabel="A first cause is not yet the whole gospel." />
    <fact evidenceId="daily-cosmos" tripleId="ansel-gate" ideaId="idea-cosmos" place="Why Gate" person="Ansel Gate" ideaLabel="The world did not have to exist." />
    <fact evidenceId="daily-scroll" tripleId="scroll-gate" ideaId="idea-scroll" place="Why Gate" person="Ansel Gate" ideaLabel="We hold a river of copies." />
    <fact evidenceId="daily-isaiah" tripleId="isaiah-gate" ideaId="idea-isaiah" place="Why Gate" person="Ansel Gate" ideaLabel="Isaiah’s Servant is Jesus." />
  </streetFacts>
</areaPack>
`,"high-lookout.xml":`<?xml version="1.0" encoding="UTF-8"?>
<areaPack id="high-lookout" schemaVersion="3" appVersion="1.4.50" generated="2026-09-14T13:15:00-05:00" host="https://cphillippe.github.io/Silver-dollar-city/" title="Meaning Ridge" place="Meaning Ridge" person="Hope Ridge" personId="hope" plotId="lookout">
  <howToEdit>RUNTIME CONTENT: the game loads this file as the source of truth for this area. Change player-facing text in place inside each &lt;lesson&gt;. Stable id attributes (ph-father, …) are engine keys — do not rename without a migration. Three tiers per fact: &lt;easy easyOrder="N"&gt;, &lt;medium&gt;, and &lt;hard&gt; — each with &lt;learn&gt;, &lt;match&gt;, and &lt;hold&gt;. Easy Learn: shortStory/mainIdea/loci. Medium Learn: mediumTeach (clearer than Hard, richer than Easy). Hard Learn: hardTeach/fullTeach. Held claim·reason·source stay plain and identical on all three. Hold level-up: see hold @levelUpTo / @onFail and index &lt;holdRules&gt;. Empty optional elements are intentional. Escape &amp; &lt; &gt; in text.</howToEdit>
  <meta>
    <title>Silver City — Meaning Ridge</title>
    <subtitle>Duty, mind, meaning, beauty</subtitle>
    <blurb>What looks over the town when the day ends.</blurb>
    <notes>Runtime/build content pack. Engine maps lesson fields 1:1 to Learn / Match / Hold / Journal / street.</notes>
  </meta>
  <easyShelf order="hl-moral,hl-mind,hl-meaning,hl-beauty,daily-grace,daily-rest,daily-door">
    <line id="hl-moral" easyOrder="9">hl-moral</line>
    <line id="hl-mind" easyOrder="30">hl-mind</line>
    <line id="hl-meaning" easyOrder="31">hl-meaning</line>
    <line id="hl-beauty" easyOrder="32">hl-beauty</line>
    <line id="daily-grace" easyOrder="33">daily-grace</line>
    <line id="daily-rest" easyOrder="34">daily-rest</line>
    <line id="daily-door" easyOrder="35">daily-door</line>
  </easyShelf>
  <lessons>
    <lesson id="hl-moral" place="Meaning Ridge" person="Hope Ridge" tripleId="hope-lookout" ideaId="idea-moral" ideaLabel="Duty is more than taste." challengeKind="build-argument" challengeTitle="The grain of duty">
      <easy points="10" easyOrder="9">
        <learn>
          <shortStory>Duty feels like more than a taste or a mood. Romans 2 says even strangers already know enough to accuse one another — a pull toward real right and wrong that fits a good God.</shortStory>
          <mainIdea>Duty presents itself as more than taste — and theism is a natural home for that.</mainIdea>
          <gloss>Duty feels real — not like a taste for tea.</gloss>
          <loci>This idea lives at Meaning Ridge, with Hope.</loci>
          <word>
            <term>Duty</term>
            <sense>what you ought to do, even when you do not feel like it</sense>
          </word>
          <hint>Build the modest chain. Leave contempt and collapse.</hint>
        </learn>
        <match>
          <sentenceCorrect>Duty presents itself as more than taste — and theism is a natural home for that.</sentenceCorrect>
          <sentenceMisses>
            <miss>Duty is only a preference we pretend is law.</miss>
            <miss>Atheist moral realism is impossible to name.</miss>
          </sentenceMisses>
          <placePrompt>That line lives at Meaning Ridge.</placePrompt>
          <personPrompt>Hope keeps that ridge.</personPrompt>
          <ideaPrompt>Hope’s ridge — duty is more than a taste.</ideaPrompt>
          <ideaLabel>Duty is more than taste.</ideaLabel>
          <whyEasy>Hope keeps Meaning Ridge. Duty is more than a taste.</whyEasy>
        </match>
        <hold levelUpTo="medium" onFail="easy">
          <claim>Duty presents itself as more than taste — and theism is a natural home for that.</claim>
          <reason>Romans 2 treats moral knowledge as widely shared, which is why strangers can accuse one another.</reason>
          <source>Romans 2:14–15</source>
          <whyCorrect>Romans 2 treats moral knowledge as widely shared, which is why strangers can accuse one another.</whyCorrect>
          <whyMisses>
            <miss>Moral argument is a sneer at people who doubt.</miss>
            <miss>Strangers cannot expect injustice to mean anything.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Duty presents itself as more than taste — and theism is a natural home for that.</choice>
            <choice>Duty is only a preference we pretend is law.</choice>
            <choice>Atheist moral realism is impossible to name.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Romans 2 treats moral knowledge as widely shared, which is why strangers can accuse one another.</choice>
            <choice>Moral argument is a sneer at people who doubt.</choice>
            <choice>Strangers cannot expect injustice to mean anything.</choice>
          </reasonChoices>
        </hold>
      </easy>
      <medium points="12">
        <learn>
          <mediumTeach>Duty presents itself as more than taste. Romans 2 says even strangers already know enough to accuse one another. If objective moral duties are real, theism is a natural home for that pull — not a shrug that calls every “ought” a preference.</mediumTeach>
          <mainIdea>Duty presents itself as more than taste — and theism is a natural home for that.</mainIdea>
          <gloss>Duty feels real — not like a taste for tea.</gloss>
          <loci>This idea lives at Meaning Ridge, with Hope.</loci>
          <word>
            <term>Duty</term>
            <sense>what you ought to do, even when you do not feel like it</sense>
          </word>
          <hint>Build the modest chain. Leave contempt and collapse.</hint>
        </learn>
        <match>
          <sentenceCorrect>Duty presents itself as more than taste — and theism is a natural home for that.</sentenceCorrect>
          <sentenceMisses>
            <miss>Duty is only a preference we pretend is law.</miss>
            <miss>Atheist moral realism is impossible to name.</miss>
          </sentenceMisses>
          <placePrompt>That line lives at Meaning Ridge.</placePrompt>
          <personPrompt>Hope keeps that ridge.</personPrompt>
          <ideaPrompt>Hope’s ridge — duty is more than a taste.</ideaPrompt>
          <ideaLabel>Duty is more than taste.</ideaLabel>
          <whyMedium>Hope keeps Meaning Ridge. Duty is more than a taste.</whyMedium>
        </match>
        <hold levelUpTo="hard" onFail="easy">
          <claim>Duty presents itself as more than taste — and theism is a natural home for that.</claim>
          <reason>Romans 2 treats moral knowledge as widely shared, which is why strangers can accuse one another.</reason>
          <source>Romans 2:14–15</source>
          <whyCorrect>Romans 2 treats moral knowledge as widely shared, which is why strangers can accuse one another.</whyCorrect>
          <whyMisses>
            <miss>Moral argument is a sneer at people who doubt.</miss>
            <miss>Strangers cannot expect injustice to mean anything.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Duty presents itself as more than taste — and theism is a natural home for that.</choice>
            <choice>Duty is only a preference we pretend is law.</choice>
            <choice>Atheist moral realism is impossible to name.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Romans 2 treats moral knowledge as widely shared, which is why strangers can accuse one another.</choice>
            <choice>Moral argument is a sneer at people who doubt.</choice>
            <choice>Strangers cannot expect injustice to mean anything.</choice>
          </reasonChoices>
        </hold>
      </medium>
      <hard points="15">
        <learn>
          <hardTeach>Popular form (often associated with Kantian echoes and, in recent apologetics, with a crisp syllogism): if objective moral duties exist, their most fitting ground is a good God. Atheist moral realists (e.g. some followers of G. E. Moore or Russ Shafer-Landau) deny that the first link is required. Keep the disagreement visible.
Romans 2:14–15 speaks of a law “written on the heart.” That is not a sneer at people who doubt. It is a claim that moral knowledge is widely shared — which is why we can argue about it at all.</hardTeach>
          <fullTeach>Popular form (often associated with Kantian echoes and, in recent apologetics, with a crisp syllogism): if objective moral duties exist, their most fitting ground is a good God. Atheist moral realists (e.g. some followers of G. E. Moore or Russ Shafer-Landau) deny that the first link is required. Keep the disagreement visible.
Romans 2:14–15 speaks of a law “written on the heart.” That is not a sneer at people who doubt. It is a claim that moral knowledge is widely shared — which is why we can argue about it at all.</fullTeach>
          <prompt>Build a modest moral argument: morality as evidence, not as a police report.</prompt>
          <teachOnWrong>The two discarded cards are temptations: contempt, or collapse. The valid chain honors the experience of duty, names a theistic ground as fitting, and still admits a real philosophical rival.</teachOnWrong>
          <challengeTiles />
        </learn>
        <match>
          <sentenceCorrect>Duty presents itself as more than taste — and theism is a natural home for that.</sentenceCorrect>
          <sentenceMisses>
            <miss>Duty is only a preference we pretend is law.</miss>
            <miss>Atheist moral realism is impossible to name.</miss>
          </sentenceMisses>
          <placePrompt>That line lives at Meaning Ridge.</placePrompt>
          <personPrompt>Hope keeps that ridge.</personPrompt>
          <ideaPrompt>Hope’s ridge — duty is more than a taste.</ideaPrompt>
          <ideaLabel>Duty is more than taste.</ideaLabel>
          <whyHard>Hope Ridge keeps Meaning Ridge. Duty as more than taste looks over the town from the lookout.</whyHard>
        </match>
        <hold onFail="easy">
          <claim>Duty presents itself as more than taste — and theism is a natural home for that.</claim>
          <reason>Romans 2 treats moral knowledge as widely shared, which is why strangers can accuse one another.</reason>
          <source>Romans 2:14–15</source>
          <whyCorrect>Romans 2 treats moral knowledge as widely shared, which is why strangers can accuse one another.</whyCorrect>
          <whyMisses>
            <miss>Moral argument is a sneer at people who doubt.</miss>
            <miss>Strangers cannot expect injustice to mean anything.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Duty presents itself as more than taste — and theism is a natural home for that.</choice>
            <choice>Duty is only a preference we pretend is law.</choice>
            <choice>Atheist moral realism is impossible to name.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Romans 2 treats moral knowledge as widely shared, which is why strangers can accuse one another.</choice>
            <choice>Moral argument is a sneer at people who doubt.</choice>
            <choice>Strangers cannot expect injustice to mean anything.</choice>
          </reasonChoices>
        </hold>
      </hard>
      <journal id="j-hl-1" title="The moral grain of the world" kicker="Meaning Ridge" unlockAfter="hl-moral" scoreFromHeldTier="true">
        <p>Duty presents itself as more than taste. A good God is the ground of a good law — the home that fits. Romans 2 treats that knowledge as widely shared, which is why injustice still has a name.</p>
        <p>Romans 2:14–15 treats moral knowledge as widely shared. That is why strangers can still accuse one another of injustice and expect the accusation to mean something.</p>
        <sources>
          <source>Romans 2:14–15</source>
          <source>Aquinas, ST I-II, q.91</source>
          <source>Augustine, City of God XIX</source>
        </sources>
      </journal>
    </lesson>
    <lesson id="hl-mind" place="Meaning Ridge" person="Hope Ridge" tripleId="mind-lookout" ideaId="idea-mind" ideaLabel="The story must house the storyteller’s mind." challengeKind="match" challengeTitle="The inside of mind">
      <easy points="10" easyOrder="30">
        <learn>
          <shortStory>Felt redness, thoughts about things, and the pull of truth are not just collisions. Mind is at home if the world’s ground is a living God.</shortStory>
          <mainIdea>A story of the world must find a home for mind — including the storyteller.</mainIdea>
          <gloss>Inner experience is not captured by a scan.</gloss>
          <loci>This idea lives at Meaning Ridge, with Hope.</loci>
          <word>
            <term>Felt life</term>
            <sense>what it is like on the inside — not a scan number</sense>
          </word>
          <hint>Match each leftover mystery. Two choices.</hint>
        </learn>
        <match>
          <sentenceCorrect>A story of the world must find a home for mind — including the storyteller.</sentenceCorrect>
          <sentenceMisses>
            <miss>Qualia and aboutness are parlor tricks.</miss>
            <miss>Theism is the only reply anyone has offered.</miss>
          </sentenceMisses>
          <placePrompt>That line lives at Meaning Ridge.</placePrompt>
          <personPrompt>Hope keeps that ridge.</personPrompt>
          <ideaPrompt>Hope’s ridge — the story must house the storyteller’s mind.</ideaPrompt>
          <ideaLabel>The story must house the storyteller’s mind.</ideaLabel>
          <whyEasy>Hope keeps Meaning Ridge. The story must house the storyteller’s mind.</whyEasy>
        </match>
        <hold levelUpTo="medium" onFail="easy">
          <claim>A story of the world must find a home for mind — including the storyteller.</claim>
          <reason>Theism is a reply in which mind is present at the beginning, not only an accident at the end.</reason>
          <source>The hard problem; classical theism on intellect</source>
          <whyCorrect>Theism is a reply in which mind is present at the beginning, not only an accident at the end.</whyCorrect>
          <whyMisses>
            <miss>A story without mind can still house the storyteller with no remainder.</miss>
            <miss>Mind is easy to treat as leftover steam.</miss>
          </whyMisses>
          <claimChoices>
            <choice>A story of the world must find a home for mind — including the storyteller.</choice>
            <choice>Qualia and aboutness are parlor tricks.</choice>
            <choice>Theism is the only reply anyone has offered.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Theism is a reply in which mind is present at the beginning, not only an accident at the end.</choice>
            <choice>A story without mind can still house the storyteller with no remainder.</choice>
            <choice>Mind is easy to treat as leftover steam.</choice>
          </reasonChoices>
        </hold>
      </easy>
      <medium points="12">
        <learn>
          <mediumTeach>Felt redness, thoughts about things, and the pull of truth are not just particle collisions. A story of the world must find a home for mind — including the storyteller. Mind is at home if the world’s ground is a living God.</mediumTeach>
          <mainIdea>A story of the world must find a home for mind — including the storyteller.</mainIdea>
          <gloss>Inner experience is not captured by a scan.</gloss>
          <loci>This idea lives at Meaning Ridge, with Hope.</loci>
          <word>
            <term>Felt life</term>
            <sense>what it is like on the inside — not a scan number</sense>
          </word>
          <hint>Match each leftover mystery. Two choices.</hint>
        </learn>
        <match>
          <sentenceCorrect>A story of the world must find a home for mind — including the storyteller.</sentenceCorrect>
          <sentenceMisses>
            <miss>Qualia and aboutness are parlor tricks.</miss>
            <miss>Theism is the only reply anyone has offered.</miss>
          </sentenceMisses>
          <placePrompt>That line lives at Meaning Ridge.</placePrompt>
          <personPrompt>Hope keeps that ridge.</personPrompt>
          <ideaPrompt>Hope’s ridge — the story must house the storyteller’s mind.</ideaPrompt>
          <ideaLabel>The story must house the storyteller’s mind.</ideaLabel>
          <whyMedium>Hope keeps Meaning Ridge. The story must house the storyteller’s mind.</whyMedium>
        </match>
        <hold levelUpTo="hard" onFail="easy">
          <claim>A story of the world must find a home for mind — including the storyteller.</claim>
          <reason>Theism is a reply in which mind is present at the beginning, not only an accident at the end.</reason>
          <source>The hard problem; classical theism on intellect</source>
          <whyCorrect>Theism is a reply in which mind is present at the beginning, not only an accident at the end.</whyCorrect>
          <whyMisses>
            <miss>A story without mind can still house the storyteller with no remainder.</miss>
            <miss>Mind is easy to treat as leftover steam.</miss>
          </whyMisses>
          <claimChoices>
            <choice>A story of the world must find a home for mind — including the storyteller.</choice>
            <choice>Qualia and aboutness are parlor tricks.</choice>
            <choice>Theism is the only reply anyone has offered.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Theism is a reply in which mind is present at the beginning, not only an accident at the end.</choice>
            <choice>A story without mind can still house the storyteller with no remainder.</choice>
            <choice>Mind is easy to treat as leftover steam.</choice>
          </reasonChoices>
        </hold>
      </medium>
      <hard points="15">
        <learn>
          <hardTeach>Inner experience is not captured by a scan. The “hard problem” is why physical process is accompanied by felt life at all. Mind is at home if the world’s ground is a living God — not an indifferent process.
A living God is the home of mind. Materialism hopes a future theory will close the gap. Hold the claim: inner life is not an accident at the end of indifference.</hardTeach>
          <fullTeach>Inner experience is not captured by a scan. The “hard problem” is why physical process is accompanied by felt life at all. Mind is at home if the world’s ground is a living God — not an indifferent process.
A living God is the home of mind. Materialism hopes a future theory will close the gap. Hold the claim: inner life is not an accident at the end of indifference.</fullTeach>
          <prompt>Match each feature of mind to what physical description still leaves standing.</prompt>
          <teachOnWrong>Pair the everyday word with the leftover mystery. Wavelengths, brain scans, and causes are real — they are not yet the felt, the about, the why-it-is-like-something, or the ought-of-logic.</teachOnWrong>
          <challengeTiles>
            <pair>
              <left>Felt redness</left>
              <right>The felt redness of red — not captured by a wavelength number</right>
            </pair>
            <pair>
              <left>Thoughts about things</left>
              <right>Thoughts being about things, not only colliding with them</right>
            </pair>
            <pair>
              <left>Why it feels like something</left>
              <right>Why physical process is accompanied by inner experience at all</right>
            </pair>
            <pair>
              <left>Reason as norm</left>
              <right>Following a standard of truth, not only a causal shove</right>
            </pair>
          </challengeTiles>
        </learn>
        <match>
          <sentenceCorrect>A story of the world must find a home for mind — including the storyteller.</sentenceCorrect>
          <sentenceMisses>
            <miss>Qualia and aboutness are parlor tricks.</miss>
            <miss>Theism is the only reply anyone has offered.</miss>
          </sentenceMisses>
          <placePrompt>That line lives at Meaning Ridge.</placePrompt>
          <personPrompt>Hope keeps that ridge.</personPrompt>
          <ideaPrompt>Hope’s ridge — the story must house the storyteller’s mind.</ideaPrompt>
          <ideaLabel>The story must house the storyteller’s mind.</ideaLabel>
          <whyHard>Hope Ridge keeps Meaning Ridge. Theism is a reply in which mind is present at the beginning, not only an accident at the end.</whyHard>
        </match>
        <hold onFail="easy">
          <claim>A story of the world must find a home for mind — including the storyteller.</claim>
          <reason>Theism is a reply in which mind is present at the beginning, not only an accident at the end.</reason>
          <source>The hard problem; classical theism on intellect</source>
          <whyCorrect>Theism is a reply in which mind is present at the beginning, not only an accident at the end.</whyCorrect>
          <whyMisses>
            <miss>A story without mind can still house the storyteller with no remainder.</miss>
            <miss>Mind is easy to treat as leftover steam.</miss>
          </whyMisses>
          <claimChoices>
            <choice>A story of the world must find a home for mind — including the storyteller.</choice>
            <choice>Qualia and aboutness are parlor tricks.</choice>
            <choice>Theism is the only reply anyone has offered.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Theism is a reply in which mind is present at the beginning, not only an accident at the end.</choice>
            <choice>A story without mind can still house the storyteller with no remainder.</choice>
            <choice>Mind is easy to treat as leftover steam.</choice>
          </reasonChoices>
        </hold>
      </hard>
      <journal id="j-hl-2" title="The inside of mind" kicker="Meaning Ridge" unlockAfter="hl-mind" scoreFromHeldTier="true">
        <p>Qualia, aboutness, the hard problem, and the norm of reason are not parlor tricks. They are what it is like to be a knower. A story of the world that cannot find a home for mind is a story that cannot find a home for the storyteller.</p>
        <p>A living God is the home of mind: not an accident at the end of an indifferent process, but present at the beginning.</p>
        <sources>
          <source>Augustine, De Trinitate X</source>
          <source>John 1:1–4</source>
          <source>Classical theism on God as living intellect</source>
        </sources>
      </journal>
    </lesson>
    <lesson id="hl-meaning" place="Meaning Ridge" person="Hope Ridge" tripleId="meaning-lookout" ideaId="idea-meaning" ideaLabel="Meaning may be received, not only built." challengeKind="sort" challengeTitle="Invented or found">
      <easy points="10" easyOrder="31">
        <learn>
          <shortStory>Work and pleasure are gifts. They are not the final good. Ecclesiastes keeps both truths.</shortStory>
          <mainIdea>Local meaning can be built — the lookout asks whether it is also received.</mainIdea>
          <gloss>You can build a local meaning. The lookout asks if it is also received.</gloss>
          <loci>This idea lives at Meaning Ridge, with Hope.</loci>
          <word>
            <term>Meaning</term>
            <sense>a good that can be found — not only assembled</sense>
          </word>
          <hint>Keep the hunger. Toss “only a mood.”</hint>
        </learn>
        <match>
          <sentenceCorrect>Local meaning can be built — the lookout asks whether it is also received.</sentenceCorrect>
          <sentenceMisses>
            <miss>Work and pleasure are the final good.</miss>
            <miss>Ecclesiastes calls every gift worthless.</miss>
          </sentenceMisses>
          <placePrompt>That line lives at Meaning Ridge.</placePrompt>
          <personPrompt>Hope keeps that ridge.</personPrompt>
          <ideaPrompt>Hope’s ridge — meaning may be received, not only built.</ideaPrompt>
          <ideaLabel>Meaning may be received, not only built.</ideaLabel>
          <whyEasy>Hope keeps Meaning Ridge. Meaning may be received, not only built.</whyEasy>
        </match>
        <hold levelUpTo="medium" onFail="easy">
          <claim>Local meaning can be built — the lookout asks whether it is also received.</claim>
          <reason>Ecclesiastes refuses to let work and pleasure pretend to be the final good, and refuses to call them worthless as gifts.</reason>
          <source>Ecclesiastes 2; 9; 12</source>
          <whyCorrect>Ecclesiastes refuses to let work and pleasure pretend to be the final good, and refuses to call them worthless as gifts.</whyCorrect>
          <whyMisses>
            <miss>The hunger for a final good has no question attached.</miss>
            <miss>You cannot build any local meaning without naming God.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Local meaning can be built — the lookout asks whether it is also received.</choice>
            <choice>Work and pleasure are the final good.</choice>
            <choice>Ecclesiastes calls every gift worthless.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Ecclesiastes refuses to let work and pleasure pretend to be the final good, and refuses to call them worthless as gifts.</choice>
            <choice>The hunger for a final good has no question attached.</choice>
            <choice>You cannot build any local meaning without naming God.</choice>
          </reasonChoices>
        </hold>
      </easy>
      <medium points="12">
        <learn>
          <mediumTeach>Work and pleasure are real gifts. They are not the final good. Ecclesiastes keeps both truths and asks whether local meaning is also received. The lookout refuses cheap cheer and cheap despair.</mediumTeach>
          <mainIdea>Local meaning can be built — the lookout asks whether it is also received.</mainIdea>
          <gloss>You can build a local meaning. The lookout asks if it is also received.</gloss>
          <loci>This idea lives at Meaning Ridge, with Hope.</loci>
          <word>
            <term>Meaning</term>
            <sense>a good that can be found — not only assembled</sense>
          </word>
          <hint>Keep the hunger. Toss “only a mood.”</hint>
        </learn>
        <match>
          <sentenceCorrect>Local meaning can be built — the lookout asks whether it is also received.</sentenceCorrect>
          <sentenceMisses>
            <miss>Work and pleasure are the final good.</miss>
            <miss>Ecclesiastes calls every gift worthless.</miss>
          </sentenceMisses>
          <placePrompt>That line lives at Meaning Ridge.</placePrompt>
          <personPrompt>Hope keeps that ridge.</personPrompt>
          <ideaPrompt>Hope’s ridge — meaning may be received, not only built.</ideaPrompt>
          <ideaLabel>Meaning may be received, not only built.</ideaLabel>
          <whyMedium>Hope keeps Meaning Ridge. Meaning may be received, not only built.</whyMedium>
        </match>
        <hold levelUpTo="hard" onFail="easy">
          <claim>Local meaning can be built — the lookout asks whether it is also received.</claim>
          <reason>Ecclesiastes refuses to let work and pleasure pretend to be the final good, and refuses to call them worthless as gifts.</reason>
          <source>Ecclesiastes 2; 9; 12</source>
          <whyCorrect>Ecclesiastes refuses to let work and pleasure pretend to be the final good, and refuses to call them worthless as gifts.</whyCorrect>
          <whyMisses>
            <miss>The hunger for a final good has no question attached.</miss>
            <miss>You cannot build any local meaning without naming God.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Local meaning can be built — the lookout asks whether it is also received.</choice>
            <choice>Work and pleasure are the final good.</choice>
            <choice>Ecclesiastes calls every gift worthless.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Ecclesiastes refuses to let work and pleasure pretend to be the final good, and refuses to call them worthless as gifts.</choice>
            <choice>The hunger for a final good has no question attached.</choice>
            <choice>You cannot build any local meaning without naming God.</choice>
          </reasonChoices>
        </hold>
      </medium>
      <hard points="15">
        <learn>
          <hardTeach>Ecclesiastes refuses cheap cheer and cheap despair. The hunger for a final good has an object (Eccl 12:13).
If God is the good that created goods point toward, ordinary loves are not canceled. They are promised a future.</hardTeach>
          <fullTeach>Ecclesiastes refuses cheap cheer and cheap despair. The hunger for a final good has an object (Eccl 12:13).
If God is the good that created goods point toward, ordinary loves are not canceled. They are promised a future.</fullTeach>
          <prompt>Keep the lookout’s real question. Toss the decoys.</prompt>
          <teachOnWrong>Constructed meaning can be real at human scale. The deeper question is whether our loves are at home in the universe.</teachOnWrong>
          <challengeTiles>
            <keep>Is meaning only invented — or also discovered? Does the hunger for a final good have an object?</keep>
            <discard>Can we force every doubter to feel meaning on command?</discard>
            <discard>Does Ecclesiastes forbid ordinary work and love as pointless?</discard>
            <discard>Has science located the meaning organ and closed the file?</discard>
          </challengeTiles>
        </learn>
        <match>
          <sentenceCorrect>Local meaning can be built — the lookout asks whether it is also received.</sentenceCorrect>
          <sentenceMisses>
            <miss>Work and pleasure are the final good.</miss>
            <miss>Ecclesiastes calls every gift worthless.</miss>
          </sentenceMisses>
          <placePrompt>That line lives at Meaning Ridge.</placePrompt>
          <personPrompt>Hope keeps that ridge.</personPrompt>
          <ideaPrompt>Hope’s ridge — meaning may be received, not only built.</ideaPrompt>
          <ideaLabel>Meaning may be received, not only built.</ideaLabel>
          <whyHard>Hope Ridge keeps Meaning Ridge. Local meaning can be built — the lookout asks whether it is also received.</whyHard>
        </match>
        <hold onFail="easy">
          <claim>Local meaning can be built — the lookout asks whether it is also received.</claim>
          <reason>Ecclesiastes refuses to let work and pleasure pretend to be the final good, and refuses to call them worthless as gifts.</reason>
          <source>Ecclesiastes 2; 9; 12</source>
          <whyCorrect>Ecclesiastes refuses to let work and pleasure pretend to be the final good, and refuses to call them worthless as gifts.</whyCorrect>
          <whyMisses>
            <miss>The hunger for a final good has no question attached.</miss>
            <miss>You cannot build any local meaning without naming God.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Local meaning can be built — the lookout asks whether it is also received.</choice>
            <choice>Work and pleasure are the final good.</choice>
            <choice>Ecclesiastes calls every gift worthless.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Ecclesiastes refuses to let work and pleasure pretend to be the final good, and refuses to call them worthless as gifts.</choice>
            <choice>The hunger for a final good has no question attached.</choice>
            <choice>You cannot build any local meaning without naming God.</choice>
          </reasonChoices>
        </hold>
      </hard>
      <journal id="j-hl-3" title="Meaning that can be found" kicker="Meaning Ridge" unlockAfter="hl-meaning" scoreFromHeldTier="true">
        <p>You can build a local meaning without naming God. The lookout asks whether that meaning is only assembled, or also received — whether the hunger for a final good has an object.</p>
        <p>Ecclesiastes refuses to let work and pleasure pretend to be the final good, and also refuses to call them worthless as gifts. That double honesty is part of biblical wisdom.</p>
        <sources>
          <source>Ecclesiastes 2:24; 9:7–10; 12:13</source>
        </sources>
      </journal>
    </lesson>
    <lesson id="hl-beauty" place="Meaning Ridge" person="Hope Ridge" tripleId="beauty-lookout" ideaId="idea-beauty" ideaLabel="Beauty wakes a hunger it cannot feed." challengeKind="sort" challengeTitle="Homesick at the music">
      <easy points="10" easyOrder="32">
        <learn>
          <shortStory>Psalm 19 treats the sky as speech. Hungers like that usually correspond to real countries.</shortStory>
          <mainIdea>Beauty wakes a hunger it cannot feed — hungers usually correspond to real countries.</mainIdea>
          <gloss>Beauty wakes a hunger it cannot feed — longing for a country the sunset cannot give.</gloss>
          <loci>This idea lives at Meaning Ridge, with Hope.</loci>
          <word>
            <term>Beauty</term>
            <sense>a glory that calls you — not only a nice feeling</sense>
          </word>
          <hint>Keep the signpost. Toss “only taste.”</hint>
        </learn>
        <match>
          <sentenceCorrect>Beauty wakes a hunger it cannot feed — hungers usually correspond to real countries.</sentenceCorrect>
          <sentenceMisses>
            <miss>A sunset deducts God as a theorem.</miss>
            <miss>Hungers never correspond to real countries.</miss>
          </sentenceMisses>
          <placePrompt>That line lives at Meaning Ridge.</placePrompt>
          <personPrompt>Hope keeps that ridge.</personPrompt>
          <ideaPrompt>Hope’s ridge — beauty wakes a hunger it cannot feed.</ideaPrompt>
          <ideaLabel>Beauty wakes a hunger it cannot feed.</ideaLabel>
          <whyEasy>Hope keeps Meaning Ridge. Beauty wakes a hunger it cannot feed.</whyEasy>
        </match>
        <hold levelUpTo="medium" onFail="easy">
          <claim>Beauty wakes a hunger it cannot feed — hungers usually correspond to real countries.</claim>
          <reason>Longing for a country the sunset cannot give is a mark that we were made for that country; Psalm 19 treats the sky as speech.</reason>
          <source>Lewis, Weight of Glory; Psalm 19:1–4</source>
          <whyCorrect>Longing for a country the sunset cannot give is a mark that we were made for that country; Psalm 19 treats the sky as speech.</whyCorrect>
          <whyMisses>
            <miss>Psalm 19 treats the sky as silent decoration.</miss>
            <miss>The lookout and the observatory cannot share a ridge.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Beauty wakes a hunger it cannot feed — hungers usually correspond to real countries.</choice>
            <choice>A sunset deducts God as a theorem.</choice>
            <choice>Hungers never correspond to real countries.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Longing for a country the sunset cannot give is a mark that we were made for that country; Psalm 19 treats the sky as speech.</choice>
            <choice>Psalm 19 treats the sky as silent decoration.</choice>
            <choice>The lookout and the observatory cannot share a ridge.</choice>
          </reasonChoices>
        </hold>
      </easy>
      <medium points="12">
        <learn>
          <mediumTeach>Beauty wakes a hunger it cannot feed — as if a memory of a country you have not visited. Psalm 19 treats the sky as speech. Hungers like that usually correspond to real countries; beauty keeps the earlier areas from becoming only arguments.</mediumTeach>
          <mainIdea>Beauty wakes a hunger it cannot feed — hungers usually correspond to real countries.</mainIdea>
          <gloss>Beauty wakes a hunger it cannot feed — longing for a country the sunset cannot give.</gloss>
          <loci>This idea lives at Meaning Ridge, with Hope.</loci>
          <word>
            <term>Beauty</term>
            <sense>a glory that calls you — not only a nice feeling</sense>
          </word>
          <hint>Keep the signpost. Toss “only taste.”</hint>
        </learn>
        <match>
          <sentenceCorrect>Beauty wakes a hunger it cannot feed — hungers usually correspond to real countries.</sentenceCorrect>
          <sentenceMisses>
            <miss>A sunset deducts God as a theorem.</miss>
            <miss>Hungers never correspond to real countries.</miss>
          </sentenceMisses>
          <placePrompt>That line lives at Meaning Ridge.</placePrompt>
          <personPrompt>Hope keeps that ridge.</personPrompt>
          <ideaPrompt>Hope’s ridge — beauty wakes a hunger it cannot feed.</ideaPrompt>
          <ideaLabel>Beauty wakes a hunger it cannot feed.</ideaLabel>
          <whyMedium>Hope keeps Meaning Ridge. Beauty wakes a hunger it cannot feed.</whyMedium>
        </match>
        <hold levelUpTo="hard" onFail="easy">
          <claim>Beauty wakes a hunger it cannot feed — hungers usually correspond to real countries.</claim>
          <reason>Longing for a country the sunset cannot give is a mark that we were made for that country; Psalm 19 treats the sky as speech.</reason>
          <source>Lewis, Weight of Glory; Psalm 19:1–4</source>
          <whyCorrect>Longing for a country the sunset cannot give is a mark that we were made for that country; Psalm 19 treats the sky as speech.</whyCorrect>
          <whyMisses>
            <miss>Psalm 19 treats the sky as silent decoration.</miss>
            <miss>The lookout and the observatory cannot share a ridge.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Beauty wakes a hunger it cannot feed — hungers usually correspond to real countries.</choice>
            <choice>A sunset deducts God as a theorem.</choice>
            <choice>Hungers never correspond to real countries.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Longing for a country the sunset cannot give is a mark that we were made for that country; Psalm 19 treats the sky as speech.</choice>
            <choice>Psalm 19 treats the sky as silent decoration.</choice>
            <choice>The lookout and the observatory cannot share a ridge.</choice>
          </reasonChoices>
        </hold>
      </medium>
      <hard points="15">
        <learn>
          <hardTeach>Beauty wakes a hunger it cannot feed — Sehnsucht. Lewis: as if a memory of a country you have not visited.
Beauty does not replace the earlier areas. It keeps them from becoming only a brief.</hardTeach>
          <fullTeach>Beauty wakes a hunger it cannot feed — Sehnsucht. Lewis: as if a memory of a country you have not visited.
Beauty does not replace the earlier areas. It keeps them from becoming only a brief.</fullTeach>
          <prompt>Keep Lewis’s careful use of longing. Toss the rest.</prompt>
          <teachOnWrong>The feeling is a messenger, not the city. Taste differs. Psalm 19 treats the sky as speech — physics can be part of the reading.</teachOnWrong>
          <challengeTiles>
            <keep>A signpost, not a theorem: the hunger may mean we were made for another country.</keep>
            <discard>Beautiful feelings already are the beatific vision.</discard>
            <discard>Anyone unmoved by your favorite song is morally lost.</discard>
            <discard>Psalm 19 forbids looking at the sky except as physics.</discard>
          </challengeTiles>
        </learn>
        <match>
          <sentenceCorrect>Beauty wakes a hunger it cannot feed — hungers usually correspond to real countries.</sentenceCorrect>
          <sentenceMisses>
            <miss>A sunset deducts God as a theorem.</miss>
            <miss>Hungers never correspond to real countries.</miss>
          </sentenceMisses>
          <placePrompt>That line lives at Meaning Ridge.</placePrompt>
          <personPrompt>Hope keeps that ridge.</personPrompt>
          <ideaPrompt>Hope’s ridge — beauty wakes a hunger it cannot feed.</ideaPrompt>
          <ideaLabel>Beauty wakes a hunger it cannot feed.</ideaLabel>
          <whyHard>Hope Ridge keeps Meaning Ridge. Beauty wakes a hunger it cannot feed — hungers usually correspond to real countries.</whyHard>
        </match>
        <hold onFail="easy">
          <claim>Beauty wakes a hunger it cannot feed — hungers usually correspond to real countries.</claim>
          <reason>Longing for a country the sunset cannot give is a mark that we were made for that country; Psalm 19 treats the sky as speech.</reason>
          <source>Lewis, Weight of Glory; Psalm 19:1–4</source>
          <whyCorrect>Longing for a country the sunset cannot give is a mark that we were made for that country; Psalm 19 treats the sky as speech.</whyCorrect>
          <whyMisses>
            <miss>Psalm 19 treats the sky as silent decoration.</miss>
            <miss>The lookout and the observatory cannot share a ridge.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Beauty wakes a hunger it cannot feed — hungers usually correspond to real countries.</choice>
            <choice>A sunset deducts God as a theorem.</choice>
            <choice>Hungers never correspond to real countries.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Longing for a country the sunset cannot give is a mark that we were made for that country; Psalm 19 treats the sky as speech.</choice>
            <choice>Psalm 19 treats the sky as silent decoration.</choice>
            <choice>The lookout and the observatory cannot share a ridge.</choice>
          </reasonChoices>
        </hold>
      </hard>
      <journal id="j-hl-4" title="Beauty as a signpost" kicker="Meaning Ridge" unlockAfter="hl-beauty" scoreFromHeldTier="true">
        <p>Beauty wakes a hunger it cannot feed — longing for a country the sunset cannot give. Hungers like that usually correspond to real countries.</p>
        <p>Psalm 19 treats the sky as speech. The observatory and the lookout are the same ridge at two hours of the day: measurement at dusk, longing after dark. The trail is unending because the object, if real, is not smaller than a game.</p>
        <sources>
          <source>C. S. Lewis, “The Weight of Glory”; Surprised by Joy</source>
          <source>Psalm 19:1–4</source>
        </sources>
      </journal>
    </lesson>
    <lesson id="daily-grace" place="Meaning Ridge" person="Hope Ridge" tripleId="grace-lookout" ideaId="idea-grace" ideaLabel="Grace is gift, not wage." challengeKind="match" challengeTitle="Not a wage">
      <easy points="10" easyOrder="33">
        <learn>
          <shortStory>On Meaning Ridge Hope keeps this line: God moves first. Grace is gift, not wage. You did not finish a map that earned this — faith receives; boast starves.</shortStory>
          <mainIdea>Grace is gift, not wage; faith receives; boast starves.</mainIdea>
          <gloss>Grace is gift, not wage. Faith receives. Boast starves.</gloss>
          <loci>This idea lives at Meaning Ridge, with Hope.</loci>
          <word>
            <term>Grace</term>
            <sense>gift you did not earn</sense>
          </word>
          <hint>Keep the gift. Toss the wage.</hint>
        </learn>
        <match>
          <sentenceCorrect>Grace is gift, not wage; faith receives; boast starves.</sentenceCorrect>
          <sentenceMisses>
            <miss>Grace is a prize for high scores.</miss>
            <miss>Faith is a wage God owes you.</miss>
          </sentenceMisses>
          <placePrompt>That line lives at Meaning Ridge.</placePrompt>
          <personPrompt>Hope keeps that ridge.</personPrompt>
          <ideaPrompt>Hope’s ridge — grace is gift, not wage.</ideaPrompt>
          <ideaLabel>Grace is gift, not wage.</ideaLabel>
          <whyEasy>Hope keeps Meaning Ridge. Grace is gift, not wage.</whyEasy>
        </match>
        <hold levelUpTo="medium" onFail="easy">
          <claim>Grace is gift, not wage; faith receives; boast starves.</claim>
          <reason>The claim is that God moves first — not that you finished the map.</reason>
          <source>Ephesians 2:8–9</source>
          <whyCorrect>The claim is that God moves first — not that you finished the map.</whyCorrect>
          <whyMisses>
            <miss>Boast is what the gift is for.</miss>
            <miss>Salvation is your own doing.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Grace is gift, not wage; faith receives; boast starves.</choice>
            <choice>Grace is a prize for high scores.</choice>
            <choice>Faith is a wage God owes you.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>The claim is that God moves first — not that you finished the map.</choice>
            <choice>Boast is what the gift is for.</choice>
            <choice>Salvation is your own doing.</choice>
          </reasonChoices>
        </hold>
      </easy>
      <medium points="12">
        <learn>
          <mediumTeach>Grace is gift, not wage. God moves first — you did not finish a map that earned this. Faith receives; boast starves. Grace is not a prize for finishing the trail.</mediumTeach>
          <mainIdea>Grace is gift, not wage; faith receives; boast starves.</mainIdea>
          <gloss>Grace is gift, not wage. Faith receives. Boast starves.</gloss>
          <loci>This idea lives at Meaning Ridge, with Hope.</loci>
          <word>
            <term>Grace</term>
            <sense>gift you did not earn</sense>
          </word>
          <hint>Keep the gift. Toss the wage.</hint>
        </learn>
        <match>
          <sentenceCorrect>Grace is gift, not wage; faith receives; boast starves.</sentenceCorrect>
          <sentenceMisses>
            <miss>Grace is a prize for high scores.</miss>
            <miss>Faith is a wage God owes you.</miss>
          </sentenceMisses>
          <placePrompt>That line lives at Meaning Ridge.</placePrompt>
          <personPrompt>Hope keeps that ridge.</personPrompt>
          <ideaPrompt>Hope’s ridge — grace is gift, not wage.</ideaPrompt>
          <ideaLabel>Grace is gift, not wage.</ideaLabel>
          <whyMedium>Hope keeps Meaning Ridge. Grace is gift, not wage.</whyMedium>
        </match>
        <hold levelUpTo="hard" onFail="easy">
          <claim>Grace is gift, not wage; faith receives; boast starves.</claim>
          <reason>The claim is that God moves first — not that you finished the map.</reason>
          <source>Ephesians 2:8–9</source>
          <whyCorrect>The claim is that God moves first — not that you finished the map.</whyCorrect>
          <whyMisses>
            <miss>Boast is what the gift is for.</miss>
            <miss>Salvation is your own doing.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Grace is gift, not wage; faith receives; boast starves.</choice>
            <choice>Grace is a prize for high scores.</choice>
            <choice>Faith is a wage God owes you.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>The claim is that God moves first — not that you finished the map.</choice>
            <choice>Boast is what the gift is for.</choice>
            <choice>Salvation is your own doing.</choice>
          </reasonChoices>
        </hold>
      </medium>
      <hard points="15">
        <learn>
          <hardTeach>Grace is not a prize for finishing the map. It is the claim that God moves first.
By grace you have been saved through faith. And this is not your own doing; it is the gift of God.</hardTeach>
          <fullTeach>Grace is not a prize for finishing the map. It is the claim that God moves first.
By grace you have been saved through faith. And this is not your own doing; it is the gift of God.</fullTeach>
          <prompt>Match the word to the meaning this town uses.</prompt>
          <teachOnWrong>Ephesians 2 treats grace as gift and faith as receiving. Boast is what the gift will not feed.</teachOnWrong>
          <challengeTiles>
            <pair>
              <left>Grace</left>
              <right>Gift, not wage</right>
            </pair>
            <pair>
              <left>Faith</left>
              <right>Trust that receives</right>
            </pair>
            <pair>
              <left>Boast</left>
              <right>What the gift refuses</right>
            </pair>
          </challengeTiles>
        </learn>
        <match>
          <sentenceCorrect>Grace is gift, not wage; faith receives; boast starves.</sentenceCorrect>
          <sentenceMisses>
            <miss>Grace is a prize for high scores.</miss>
            <miss>Faith is a wage God owes you.</miss>
          </sentenceMisses>
          <placePrompt>That line lives at Meaning Ridge.</placePrompt>
          <personPrompt>Hope keeps that ridge.</personPrompt>
          <ideaPrompt>Hope’s ridge — grace is gift, not wage.</ideaPrompt>
          <ideaLabel>Grace is gift, not wage.</ideaLabel>
          <whyHard>Hope Ridge keeps Meaning Ridge. Grace is gift, not wage; faith receives; boast starves.</whyHard>
        </match>
        <hold onFail="easy">
          <claim>Grace is gift, not wage; faith receives; boast starves.</claim>
          <reason>The claim is that God moves first — not that you finished the map.</reason>
          <source>Ephesians 2:8–9</source>
          <whyCorrect>The claim is that God moves first — not that you finished the map.</whyCorrect>
          <whyMisses>
            <miss>Boast is what the gift is for.</miss>
            <miss>Salvation is your own doing.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Grace is gift, not wage; faith receives; boast starves.</choice>
            <choice>Grace is a prize for high scores.</choice>
            <choice>Faith is a wage God owes you.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>The claim is that God moves first — not that you finished the map.</choice>
            <choice>Boast is what the gift is for.</choice>
            <choice>Salvation is your own doing.</choice>
          </reasonChoices>
        </hold>
      </hard>
      <journal id="" title="" kicker="" unlockAfter="daily-grace" scoreFromHeldTier="true">
        <p />
        <sources>
          <source />
        </sources>
      </journal>
    </lesson>
    <lesson id="daily-rest" place="Meaning Ridge" person="Hope Ridge" tripleId="rest-lookout" ideaId="idea-rest" ideaLabel="Rest is the gift, not a steeper hill." challengeKind="sequence" challengeTitle="Come and rest">
      <easy points="10" easyOrder="34">
        <learn>
          <shortStory>Jesus says, “Come to me.” Tired people are named first. The invitation is to a person — rest is the gift, not a steeper hill of performance.</shortStory>
          <mainIdea>Tired people are named first; rest is the gift, not a steeper hill.</mainIdea>
          <gloss>Tired people are named first. Rest is the gift, not a steeper hill.</gloss>
          <loci>This idea lives at Meaning Ridge, with Hope.</loci>
          <word>
            <term>Rest</term>
            <sense>gift for the weary, not a prize for climbing harder</sense>
          </word>
          <hint>Keep the invitation. Toss the steeper program.</hint>
        </learn>
        <match>
          <sentenceCorrect>Tired people are named first; rest is the gift, not a steeper hill.</sentenceCorrect>
          <sentenceMisses>
            <miss>Rest is a prize for climbing harder.</miss>
            <miss>Jesus names the energetic first.</miss>
          </sentenceMisses>
          <placePrompt>That line lives at Meaning Ridge.</placePrompt>
          <personPrompt>Hope keeps that ridge.</personPrompt>
          <ideaPrompt>Hope’s ridge — rest is the gift, not a steeper hill.</ideaPrompt>
          <ideaLabel>Rest is the gift, not a steeper hill.</ideaLabel>
          <whyEasy>Hope keeps Meaning Ridge. Rest is the gift, not a steeper hill.</whyEasy>
        </match>
        <hold levelUpTo="medium" onFail="easy">
          <claim>Tired people are named first; rest is the gift, not a steeper hill.</claim>
          <reason>The invitation is to a person — “Come to me” — not a performance.</reason>
          <source>Matthew 11:28</source>
          <whyCorrect>The invitation is to a person — “Come to me” — not a performance.</whyCorrect>
          <whyMisses>
            <miss>The invitation is to a steeper program.</miss>
            <miss>Weariness disqualifies you.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Tired people are named first; rest is the gift, not a steeper hill.</choice>
            <choice>Rest is a prize for climbing harder.</choice>
            <choice>Jesus names the energetic first.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>The invitation is to a person — “Come to me” — not a performance.</choice>
            <choice>The invitation is to a steeper program.</choice>
            <choice>Weariness disqualifies you.</choice>
          </reasonChoices>
        </hold>
      </easy>
      <medium points="12">
        <learn>
          <mediumTeach>Matthew 11:28. Jesus says, “Come to me.” Tired people are named first. The invitation is to a person — rest is the gift, not a steeper hill of performance.</mediumTeach>
          <mainIdea>Tired people are named first; rest is the gift, not a steeper hill.</mainIdea>
          <gloss>Tired people are named first. Rest is the gift, not a steeper hill.</gloss>
          <loci>This idea lives at Meaning Ridge, with Hope.</loci>
          <word>
            <term>Rest</term>
            <sense>gift for the weary, not a prize for climbing harder</sense>
          </word>
          <hint>Keep the invitation. Toss the steeper program.</hint>
        </learn>
        <match>
          <sentenceCorrect>Tired people are named first; rest is the gift, not a steeper hill.</sentenceCorrect>
          <sentenceMisses>
            <miss>Rest is a prize for climbing harder.</miss>
            <miss>Jesus names the energetic first.</miss>
          </sentenceMisses>
          <placePrompt>That line lives at Meaning Ridge.</placePrompt>
          <personPrompt>Hope keeps that ridge.</personPrompt>
          <ideaPrompt>Hope’s ridge — rest is the gift, not a steeper hill.</ideaPrompt>
          <ideaLabel>Rest is the gift, not a steeper hill.</ideaLabel>
          <whyMedium>Hope keeps Meaning Ridge. Rest is the gift, not a steeper hill.</whyMedium>
        </match>
        <hold levelUpTo="hard" onFail="easy">
          <claim>Tired people are named first; rest is the gift, not a steeper hill.</claim>
          <reason>The invitation is to a person — “Come to me” — not a performance.</reason>
          <source>Matthew 11:28</source>
          <whyCorrect>The invitation is to a person — “Come to me” — not a performance.</whyCorrect>
          <whyMisses>
            <miss>The invitation is to a steeper program.</miss>
            <miss>Weariness disqualifies you.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Tired people are named first; rest is the gift, not a steeper hill.</choice>
            <choice>Rest is a prize for climbing harder.</choice>
            <choice>Jesus names the energetic first.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>The invitation is to a person — “Come to me” — not a performance.</choice>
            <choice>The invitation is to a steeper program.</choice>
            <choice>Weariness disqualifies you.</choice>
          </reasonChoices>
        </hold>
      </medium>
      <hard points="15">
        <learn>
          <hardTeach>Matthew 11:28. Tired people are named first. The invitation is to a person, not a performance.
Come to me, all who labor and are heavy laden, and I will give you rest.</hardTeach>
          <fullTeach>Matthew 11:28. Tired people are named first. The invitation is to a person, not a performance.
Come to me, all who labor and are heavy laden, and I will give you rest.</fullTeach>
          <prompt>Jesus’ invitation has an order. Set the stones.</prompt>
          <teachOnWrong>The weary are addressed before the command. Rest is the gift, not a prize for climbing harder.</teachOnWrong>
          <challengeTiles>
            <sequenceItem>You are tired and carrying too much.</sequenceItem>
            <sequenceItem>Jesus says, “Come to me.”</sequenceItem>
            <sequenceItem>He promises rest — not a steeper hill.</sequenceItem>
          </challengeTiles>
        </learn>
        <match>
          <sentenceCorrect>Tired people are named first; rest is the gift, not a steeper hill.</sentenceCorrect>
          <sentenceMisses>
            <miss>Rest is a prize for climbing harder.</miss>
            <miss>Jesus names the energetic first.</miss>
          </sentenceMisses>
          <placePrompt>That line lives at Meaning Ridge.</placePrompt>
          <personPrompt>Hope keeps that ridge.</personPrompt>
          <ideaPrompt>Hope’s ridge — rest is the gift, not a steeper hill.</ideaPrompt>
          <ideaLabel>Rest is the gift, not a steeper hill.</ideaLabel>
          <whyHard>Hope Ridge keeps Meaning Ridge. Tired people are named first; rest is the gift, not a steeper hill.</whyHard>
        </match>
        <hold onFail="easy">
          <claim>Tired people are named first; rest is the gift, not a steeper hill.</claim>
          <reason>The invitation is to a person — “Come to me” — not a performance.</reason>
          <source>Matthew 11:28</source>
          <whyCorrect>The invitation is to a person — “Come to me” — not a performance.</whyCorrect>
          <whyMisses>
            <miss>The invitation is to a steeper program.</miss>
            <miss>Weariness disqualifies you.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Tired people are named first; rest is the gift, not a steeper hill.</choice>
            <choice>Rest is a prize for climbing harder.</choice>
            <choice>Jesus names the energetic first.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>The invitation is to a person — “Come to me” — not a performance.</choice>
            <choice>The invitation is to a steeper program.</choice>
            <choice>Weariness disqualifies you.</choice>
          </reasonChoices>
        </hold>
      </hard>
      <journal id="" title="" kicker="" unlockAfter="daily-rest" scoreFromHeldTier="true">
        <p />
        <sources>
          <source />
        </sources>
      </journal>
    </lesson>
    <lesson id="daily-door" place="Meaning Ridge" person="Hope Ridge" tripleId="door-lookout" ideaId="idea-door" ideaLabel="Jesus is a door with a wide anyone." challengeKind="match" challengeTitle="A door, not a wall">
      <easy points="10" easyOrder="35">
        <learn>
          <shortStory>Jesus says, “I am the door.” It is a particular way in — and a wide anyone. You may refuse it. The town will not lock you in a pew.</shortStory>
          <mainIdea>Jesus’ “door” is a particular way in with a wide anyone.</mainIdea>
          <gloss>Jesus’ “door” is a particular way in with a wide anyone.</gloss>
          <loci>This idea lives at Meaning Ridge, with Hope.</loci>
          <word>
            <term>Door</term>
            <sense>a real way in — not a wall</sense>
          </word>
          <hint>Keep the right pictures. Remove wrong picks.</hint>
        </learn>
        <match>
          <sentenceCorrect>Jesus’ “door” is a particular way in with a wide anyone.</sentenceCorrect>
          <sentenceMisses>
            <miss>The door is a dead end.</miss>
            <miss>Pasture is denied on the other side.</miss>
          </sentenceMisses>
          <placePrompt>That line lives at Meaning Ridge.</placePrompt>
          <personPrompt>Hope keeps that ridge.</personPrompt>
          <ideaPrompt>Hope’s ridge — Jesus is a door with a wide anyone.</ideaPrompt>
          <ideaLabel>Jesus is a door with a wide anyone.</ideaLabel>
          <whyEasy>Hope keeps Meaning Ridge. Jesus is a door with a wide anyone.</whyEasy>
        </match>
        <hold levelUpTo="medium" onFail="easy">
          <claim>Jesus’ “door” is a particular way in with a wide anyone.</claim>
          <reason>You may refuse it; the town will not lock you in a pew.</reason>
          <source>John 10:9</source>
          <whyCorrect>You may refuse it; the town will not lock you in a pew.</whyCorrect>
          <whyMisses>
            <miss>“Anyone” is narrowed to insiders only.</miss>
            <miss>The image is a wall, not an entrance.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Jesus’ “door” is a particular way in with a wide anyone.</choice>
            <choice>The door is a dead end.</choice>
            <choice>Pasture is denied on the other side.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>You may refuse it; the town will not lock you in a pew.</choice>
            <choice>“Anyone” is narrowed to insiders only.</choice>
            <choice>The image is a wall, not an entrance.</choice>
          </reasonChoices>
        </hold>
      </easy>
      <medium points="12">
        <learn>
          <mediumTeach>Jesus says, “I am the door” — a particular way in with a wide anyone. Access is personal. You may refuse it. The town will not lock you in a pew.</mediumTeach>
          <mainIdea>Jesus’ “door” is a particular way in with a wide anyone.</mainIdea>
          <gloss>Jesus’ “door” is a particular way in with a wide anyone.</gloss>
          <loci>This idea lives at Meaning Ridge, with Hope.</loci>
          <word>
            <term>Door</term>
            <sense>a real way in — not a wall</sense>
          </word>
          <hint>Keep the right pictures. Remove wrong picks.</hint>
        </learn>
        <match>
          <sentenceCorrect>Jesus’ “door” is a particular way in with a wide anyone.</sentenceCorrect>
          <sentenceMisses>
            <miss>The door is a dead end.</miss>
            <miss>Pasture is denied on the other side.</miss>
          </sentenceMisses>
          <placePrompt>That line lives at Meaning Ridge.</placePrompt>
          <personPrompt>Hope keeps that ridge.</personPrompt>
          <ideaPrompt>Hope’s ridge — Jesus is a door with a wide anyone.</ideaPrompt>
          <ideaLabel>Jesus is a door with a wide anyone.</ideaLabel>
          <whyMedium>Hope keeps Meaning Ridge. Jesus is a door with a wide anyone.</whyMedium>
        </match>
        <hold levelUpTo="hard" onFail="easy">
          <claim>Jesus’ “door” is a particular way in with a wide anyone.</claim>
          <reason>You may refuse it; the town will not lock you in a pew.</reason>
          <source>John 10:9</source>
          <whyCorrect>You may refuse it; the town will not lock you in a pew.</whyCorrect>
          <whyMisses>
            <miss>“Anyone” is narrowed to insiders only.</miss>
            <miss>The image is a wall, not an entrance.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Jesus’ “door” is a particular way in with a wide anyone.</choice>
            <choice>The door is a dead end.</choice>
            <choice>Pasture is denied on the other side.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>You may refuse it; the town will not lock you in a pew.</choice>
            <choice>“Anyone” is narrowed to insiders only.</choice>
            <choice>The image is a wall, not an entrance.</choice>
          </reasonChoices>
        </hold>
      </medium>
      <hard points="15">
        <learn>
          <hardTeach>“I am the door” is a claim about access — personal, particular. You may refuse it. The town will not lock you in a pew.
I am the door. If anyone enters by me, he will be saved and will go in and out and find pasture.</hardTeach>
          <fullTeach>“I am the door” is a claim about access — personal, particular. You may refuse it. The town will not lock you in a pew.
I am the door. If anyone enters by me, he will be saved and will go in and out and find pasture.</fullTeach>
          <prompt>Match Jesus’ image to what it offers.</prompt>
          <teachOnWrong>John 10 is an invitation with a particular door and a wide “anyone.” Snap the image to the gift.</teachOnWrong>
          <challengeTiles>
            <pair>
              <left>A door</left>
              <right>A way in, not a dead end</right>
            </pair>
            <pair>
              <left>Pasture</left>
              <right>Life on the other side</right>
            </pair>
            <pair>
              <left>Anyone</left>
              <right>The invitation’s width</right>
            </pair>
          </challengeTiles>
        </learn>
        <match>
          <sentenceCorrect>Jesus’ “door” is a particular way in with a wide anyone.</sentenceCorrect>
          <sentenceMisses>
            <miss>The door is a dead end.</miss>
            <miss>Pasture is denied on the other side.</miss>
          </sentenceMisses>
          <placePrompt>That line lives at Meaning Ridge.</placePrompt>
          <personPrompt>Hope keeps that ridge.</personPrompt>
          <ideaPrompt>Hope’s ridge — Jesus is a door with a wide anyone.</ideaPrompt>
          <ideaLabel>Jesus is a door with a wide anyone.</ideaLabel>
          <whyHard>Hope Ridge keeps Meaning Ridge. Jesus’ door is a particular way in with a wide anyone.</whyHard>
        </match>
        <hold onFail="easy">
          <claim>Jesus’ “door” is a particular way in with a wide anyone.</claim>
          <reason>You may refuse it; the town will not lock you in a pew.</reason>
          <source>John 10:9</source>
          <whyCorrect>You may refuse it; the town will not lock you in a pew.</whyCorrect>
          <whyMisses>
            <miss>“Anyone” is narrowed to insiders only.</miss>
            <miss>The image is a wall, not an entrance.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Jesus’ “door” is a particular way in with a wide anyone.</choice>
            <choice>The door is a dead end.</choice>
            <choice>Pasture is denied on the other side.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>You may refuse it; the town will not lock you in a pew.</choice>
            <choice>“Anyone” is narrowed to insiders only.</choice>
            <choice>The image is a wall, not an entrance.</choice>
          </reasonChoices>
        </hold>
      </hard>
      <journal id="" title="" kicker="" unlockAfter="daily-door" scoreFromHeldTier="true">
        <p />
        <sources>
          <source />
        </sources>
      </journal>
    </lesson>
  </lessons>
  <streetFacts>
    <fact evidenceId="hl-moral" tripleId="hope-lookout" ideaId="idea-moral" place="Meaning Ridge" person="Hope Ridge" ideaLabel="Duty is more than taste." />
    <fact evidenceId="hl-mind" tripleId="mind-lookout" ideaId="idea-mind" place="Meaning Ridge" person="Hope Ridge" ideaLabel="The story must house the storyteller’s mind." />
    <fact evidenceId="hl-meaning" tripleId="meaning-lookout" ideaId="idea-meaning" place="Meaning Ridge" person="Hope Ridge" ideaLabel="Meaning may be received, not only built." />
    <fact evidenceId="hl-beauty" tripleId="beauty-lookout" ideaId="idea-beauty" place="Meaning Ridge" person="Hope Ridge" ideaLabel="Beauty wakes a hunger it cannot feed." />
    <fact evidenceId="daily-grace" tripleId="grace-lookout" ideaId="idea-grace" place="Meaning Ridge" person="Hope Ridge" ideaLabel="Grace is gift, not wage." />
    <fact evidenceId="daily-rest" tripleId="rest-lookout" ideaId="idea-rest" place="Meaning Ridge" person="Hope Ridge" ideaLabel="Rest is the gift, not a steeper hill." />
    <fact evidenceId="daily-door" tripleId="door-lookout" ideaId="idea-door" place="Meaning Ridge" person="Hope Ridge" ideaLabel="Jesus is a door with a wide anyone." />
  </streetFacts>
</areaPack>
`,"index.xml":`<?xml version="1.0" encoding="UTF-8"?>
<silverCityPackIndex schemaVersion="3" appVersion="1.4.50" generated="2026-09-14T13:15:00-05:00" host="https://cphillippe.github.io/Silver-dollar-city/">
  <howToEdit>Load one areaPack XML per area. Every lesson has three tiers: &lt;easy easyOrder="N"&gt;, &lt;medium&gt;, and &lt;hard&gt; — each with Learn/Match/Hold. Held claim stays plain on all tiers. Hold level-up / fail→Easy: see &lt;holdRules&gt;. Do not fork facts into separate files. Engine loader climb next.</howToEdit>
  <packs>
    <pack id="parable-hollow" file="parable-hollow.xml" title="Story Creek" person="Mercy Wren" lessonCount="8" />
    <pack id="witness-bench" file="witness-bench.xml" title="Witness Square" person="Silas Whitman" lessonCount="7" />
    <pack id="observatory" file="observatory.xml" title="Sky Watch" person="Nora Skye" lessonCount="6" />
    <pack id="first-gate" file="first-gate.xml" title="Why Gate" person="Ansel Gate" lessonCount="7" />
    <pack id="high-lookout" file="high-lookout.xml" title="Meaning Ridge" person="Hope Ridge" lessonCount="7" />
  </packs>
  <easyShelf order="ph-road,ph-father,ph-debt,wb-creed,wb-women,daily-lantern,daily-stars,daily-cosmos,hl-moral,ph-seeds,wb-early,wb-method,daily-names,daily-creed,daily-empty,daily-gems,daily-seed,daily-neighbor,ob-tuning,ob-design,ob-leibniz,ob-life,daily-life,fg-mover,fg-contingent,fg-kalam,fg-limits,daily-scroll,daily-isaiah,hl-mind,hl-meaning,hl-beauty,daily-grace,daily-rest,daily-door">
    <line id="ph-road" easyOrder="1" pack="parable-hollow">ph-road</line>
    <line id="ph-father" easyOrder="2" pack="parable-hollow">ph-father</line>
    <line id="ph-debt" easyOrder="3" pack="parable-hollow">ph-debt</line>
    <line id="wb-creed" easyOrder="4" pack="witness-bench">wb-creed</line>
    <line id="wb-women" easyOrder="5" pack="witness-bench">wb-women</line>
    <line id="daily-lantern" easyOrder="6" pack="parable-hollow">daily-lantern</line>
    <line id="daily-stars" easyOrder="7" pack="observatory">daily-stars</line>
    <line id="daily-cosmos" easyOrder="8" pack="first-gate">daily-cosmos</line>
    <line id="hl-moral" easyOrder="9" pack="high-lookout">hl-moral</line>
    <line id="ph-seeds" easyOrder="10" pack="parable-hollow">ph-seeds</line>
    <line id="wb-early" easyOrder="11" pack="witness-bench">wb-early</line>
    <line id="wb-method" easyOrder="12" pack="witness-bench">wb-method</line>
    <line id="daily-names" easyOrder="13" pack="witness-bench">daily-names</line>
    <line id="daily-creed" easyOrder="14" pack="witness-bench">daily-creed</line>
    <line id="daily-empty" easyOrder="15" pack="witness-bench">daily-empty</line>
    <line id="daily-gems" easyOrder="16" pack="parable-hollow">daily-gems</line>
    <line id="daily-seed" easyOrder="17" pack="parable-hollow">daily-seed</line>
    <line id="daily-neighbor" easyOrder="18" pack="parable-hollow">daily-neighbor</line>
    <line id="ob-tuning" easyOrder="19" pack="observatory">ob-tuning</line>
    <line id="ob-design" easyOrder="20" pack="observatory">ob-design</line>
    <line id="ob-leibniz" easyOrder="21" pack="observatory">ob-leibniz</line>
    <line id="ob-life" easyOrder="22" pack="observatory">ob-life</line>
    <line id="daily-life" easyOrder="23" pack="observatory">daily-life</line>
    <line id="fg-mover" easyOrder="24" pack="first-gate">fg-mover</line>
    <line id="fg-contingent" easyOrder="25" pack="first-gate">fg-contingent</line>
    <line id="fg-kalam" easyOrder="26" pack="first-gate">fg-kalam</line>
    <line id="fg-limits" easyOrder="27" pack="first-gate">fg-limits</line>
    <line id="daily-scroll" easyOrder="28" pack="first-gate">daily-scroll</line>
    <line id="daily-isaiah" easyOrder="29" pack="first-gate">daily-isaiah</line>
    <line id="hl-mind" easyOrder="30" pack="high-lookout">hl-mind</line>
    <line id="hl-meaning" easyOrder="31" pack="high-lookout">hl-meaning</line>
    <line id="hl-beauty" easyOrder="32" pack="high-lookout">hl-beauty</line>
    <line id="daily-grace" easyOrder="33" pack="high-lookout">daily-grace</line>
    <line id="daily-rest" easyOrder="34" pack="high-lookout">daily-rest</line>
    <line id="daily-door" easyOrder="35" pack="high-lookout">daily-door</line>
  </easyShelf>
  <holdRules>
    <summary>On Hold, the player may attempt a level-up to the next tier’s claim/why. If they fail the level-up — or fail Hold at the current tier — fall back to Easy (retry Easy Learn→Match→Hold: teach-before-test, not punish).</summary>
    <levelUp>easy Hold may set levelUpTo="medium"; medium Hold may set levelUpTo="hard". Hard is the top teach tier (no further levelUpTo).</levelUp>
    <onFail>Every Hold sets onFail="easy". Failed Hold or failed level-up returns the player to the Easy teach path for that same lesson id.</onFail>
    <heldClaim>Claim · reason · source stay the same clear/plain line across easy, medium, and hard. Do not mysterious-ize the held line on Hard.</heldClaim>
  </holdRules>
  <scoring>
    <ideaPoints easy="10" medium="12" hard="15"/>
    <journal showScorePerLevel="true" scoreFromHeldTier="true"/>
    <notes>Points awarded when the idea is held at that tier. Level-up Hold awards the higher tier’s points (replace or add — prefer: journal records best tier held for that idea; score for an idea = points of highest tier successfully held). On fail→Easy, award Easy only if Easy Hold succeeds.</notes>
  </scoring>
  <tools>
    <tool id="td-watch" kind="love-how-to">
      <easy>Love — when compassion moves you, help like the Samaritan. Tap the glowing face.</easy>
      <hard>Love — tap the matching face. A true line turns a cheap claim toward heaven.</hard>
      <note>Mechanic how-to, not a held claim lesson.</note>
      <claimFacingHard>Love — tap the matching face. A true line turns a cheap claim toward heaven.</claimFacingHard>
      <reason>Love, logic, reason, and science you have kept can divert a false step up the ridge.</reason>
      <source>Luke 10:25–37 · the night road</source>
      <plainTeach>Tap the glowing face. When compassion moves you, help like the Samaritan.</plainTeach>
    </tool>
  </tools>
  <trailNotes>
    <note id="j-trail-1">
      <claim>A morning walked is kept — not as a trophy, as a thank-you.</claim>
      <reason>If you are away, the trail waits; nothing already gathered is taken back.</reason>
      <source>Daily Trail</source>
      <title>First frost on the rail</title>
      <kicker>Daily Trail</kicker>
      <p>You walked a morning that will not come again. The town keeps a small mark for that — not a trophy, a thank-you.</p>
      <p>The trail will be here tomorrow. If you are away, it waits. Nothing you have already gathered is taken back.</p>
    </note>
    <note id="j-trail-2">
      <claim>Two mornings are enough for the path to know your step.</claim>
      <reason>Nothing is owed; the bench is still free.</reason>
      <source>Daily Trail</source>
      <title>A second lantern</title>
      <kicker>Daily Trail</kicker>
      <p>Two distinct mornings. The path is starting to know your step. Nothing is owed; the bench is still free.</p>
    </note>
    <note id="j-trail-3">
      <claim>Return is a kind of courage.</claim>
      <reason>Three distinct days are marked without scolding the ones you missed.</reason>
      <source>Daily Trail</source>
      <title>Margin note from the clerk</title>
      <kicker>Daily Trail</kicker>
      <p>Three distinct days on the trail. The archive clerk left this: “Return is a kind of courage.”</p>
    </note>
    <note id="j-trail-5">
      <claim>Five skies are saved; empty days are not scolded.</claim>
      <reason>The town only keeps a page for when you are here.</reason>
      <source>Daily Trail</source>
      <title>Five weather reports</title>
      <kicker>Daily Trail</kicker>
      <p>Five different skies. The town does not scold the days you were away. It only saves a page for when you are here.</p>
    </note>
    <note id="j-trail-7">
      <claim>Seven unique mornings still leave tomorrow free.</claim>
      <reason>If you miss, the trail waits; marks you made stay in the journal.</reason>
      <source>Daily Trail</source>
      <title>A week of porches</title>
      <kicker>Daily Trail</kicker>
      <p>Seven unique mornings. If you miss tomorrow, the trail waits. The marks you already made stay in the journal.</p>
    </note>
  </trailNotes>
  <uiChrome>
    <learnCta>Learn</learnCta>
    <matchCta>Match</matchCta>
    <matchDone>Match done</matchDone>
    <matchWin>Matched!</matchWin>
    <hold>Hold</hold>
    <holdNext>Hold next</holdNext>
    <home>Home</home>
    <connectLink>Tap the sentence, then the place, then the person.</connectLink>
    <readStory>Read today’s story.</readStory>
    <learnThisFirst>Learn this first.</learnThisFirst>
    <rememberSentence>Tap the line you kept.</rememberSentence>
    <tapWhy>Tap why this is true.</tapWhy>
    <keepThis>Keep this</keepThis>
    <mainIdeaTeach>Main idea = the short true line we keep.</mainIdeaTeach>
    <claimTeach>A claim is the main idea we hold to be true.</claimTeach>
    <reasonTeach>A reason is why this is true.</reasonTeach>
    <lockIn>Save your picks.</lockIn>
    <continueStreet>Continue tonight’s street</continueStreet>
    <nightDo>Night Watch</nightDo>
    <nightLead>Tap the face six times.</nightLead>
    <hubEasyLead>Match a sentence. Hold the line.</hubEasyLead>
    <holdTheNight>Hold the night</holdTheNight>
    <learnHoldDeploy>Learn · hold · deploy</learnHoldDeploy>
    <homesOnTheStreet>Homes on the street</homesOnTheStreet>
  </uiChrome>
  <flags>
    <lessonsWithThreeTiers>35/35</lessonsWithThreeTiers>
    <easyTrailCount>35</easyTrailCount>
    <holdFailFallback>easy</holdFailFallback>
  </flags>
</silverCityPackIndex>
`,"observatory.xml":`<?xml version="1.0" encoding="UTF-8"?>
<areaPack id="observatory" schemaVersion="3" appVersion="1.4.50" generated="2026-09-14T13:15:00-05:00" host="https://cphillippe.github.io/Silver-dollar-city/" title="Sky Watch" place="Sky Watch" person="Nora Skye" personId="nora" plotId="observatory">
  <howToEdit>RUNTIME CONTENT: the game loads this file as the source of truth for this area. Change player-facing text in place inside each &lt;lesson&gt;. Stable id attributes (ph-father, …) are engine keys — do not rename without a migration. Three tiers per fact: &lt;easy easyOrder="N"&gt;, &lt;medium&gt;, and &lt;hard&gt; — each with &lt;learn&gt;, &lt;match&gt;, and &lt;hold&gt;. Easy Learn: shortStory/mainIdea/loci. Medium Learn: mediumTeach (clearer than Hard, richer than Easy). Hard Learn: hardTeach/fullTeach. Held claim·reason·source stay plain and identical on all three. Hold level-up: see hold @levelUpTo / @onFail and index &lt;holdRules&gt;. Empty optional elements are intentional. Escape &amp; &lt; &gt; in text.</howToEdit>
  <meta>
    <title>Silver City — Sky Watch</title>
    <subtitle>The heavens declare</subtitle>
    <blurb>Fine-tuning, life, and the question under physics.</blurb>
    <notes>Runtime/build content pack. Engine maps lesson fields 1:1 to Learn / Match / Hold / Journal / street.</notes>
  </meta>
  <easyShelf order="daily-stars,ob-tuning,ob-design,ob-leibniz,ob-life,daily-life">
    <line id="daily-stars" easyOrder="7">daily-stars</line>
    <line id="ob-tuning" easyOrder="19">ob-tuning</line>
    <line id="ob-design" easyOrder="20">ob-design</line>
    <line id="ob-leibniz" easyOrder="21">ob-leibniz</line>
    <line id="ob-life" easyOrder="22">ob-life</line>
    <line id="daily-life" easyOrder="23">daily-life</line>
  </easyShelf>
  <lessons>
    <lesson id="ob-tuning" place="Sky Watch" person="Nora Skye" tripleId="tuning-sky" ideaId="idea-tuning" ideaLabel="Fine-tuning points to a Designer." challengeKind="match" challengeTitle="Narrow ranges">
      <easy points="10" easyOrder="19">
        <learn>
          <shortStory>Life needs very tight numbers: how fast space expands, how atoms stick, how tidy the start was. Design predicts a world we can live in. Blind chance does not.</shortStory>
          <mainIdea>The universe is finely tuned for life — that fit points to a Designer.</mainIdea>
          <gloss>The universe is finely tuned for life — that fit points to a Designer.</gloss>
          <loci>This idea lives at Sky Watch, with Nora.</loci>
          <word>
            <term>Fine-tuning</term>
            <sense>life’s dials fit in a very narrow range</sense>
          </word>
          <hint>Tap the picture, then the mark that belongs. Two choices.</hint>
        </learn>
        <match>
          <sentenceCorrect>The universe is finely tuned for life — that fit points to a Designer.</sentenceCorrect>
          <sentenceMisses>
            <miss>Fine-tuning is a rumor with no name in science.</miss>
            <miss>A habitable cosmos needs no explanation at all.</miss>
          </sentenceMisses>
          <placePrompt>That voice lives at Sky Watch.</placePrompt>
          <personPrompt>Nora keeps that sky.</personPrompt>
          <ideaPrompt>Nora’s sky — fine-tuning points to a Designer.</ideaPrompt>
          <ideaLabel>Fine-tuning points to a Designer.</ideaLabel>
          <whyEasy>Nora watches the sky. Fine-tuning points to a Designer.</whyEasy>
        </match>
        <hold levelUpTo="medium" onFail="easy">
          <claim>The universe is finely tuned for life — that fit points to a Designer.</claim>
          <reason>Life-permitting ranges are extravagantly narrow across independent parameters; design predicts a habitable cosmos, blank chance does not.</reason>
          <source>Fine-tuning of physical constants and initial conditions (e.g. cosmological constant; a low-entropy start — initial condition, not another force dial).</source>
          <whyCorrect>Life-permitting ranges are extravagantly narrow across independent parameters; design predicts a habitable cosmos, blank chance does not.</whyCorrect>
          <whyMisses>
            <miss>Life-permitting ranges are wide; blank chance predicts a habitable cosmos just as well.</miss>
            <miss>The fittedness is only a rumor in the numbers.</miss>
          </whyMisses>
          <claimChoices>
            <choice>The universe is finely tuned for life — that fit points to a Designer.</choice>
            <choice>Fine-tuning is a rumor with no name in science.</choice>
            <choice>A habitable cosmos needs no explanation at all.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Life-permitting ranges are extravagantly narrow across independent parameters; design predicts a habitable cosmos, blank chance does not.</choice>
            <choice>Life-permitting ranges are wide; blank chance predicts a habitable cosmos just as well.</choice>
            <choice>The fittedness is only a rumor in the numbers.</choice>
          </reasonChoices>
        </hold>
      </easy>
      <medium points="12">
        <learn>
          <mediumTeach>Life needs very tight numbers: how fast space expands, how atoms stick, how tidy the start was. Those life-permitting ranges are extravagantly narrow. Design predicts a world we can live in; blind chance does not. The fit points to a Designer.</mediumTeach>
          <mainIdea>The universe is finely tuned for life — that fit points to a Designer.</mainIdea>
          <gloss>The universe is finely tuned for life — that fit points to a Designer.</gloss>
          <loci>This idea lives at Sky Watch, with Nora.</loci>
          <word>
            <term>Fine-tuning</term>
            <sense>life’s dials fit in a very narrow range</sense>
          </word>
          <hint>Tap the picture, then the mark that belongs. Two choices.</hint>
        </learn>
        <match>
          <sentenceCorrect>The universe is finely tuned for life — that fit points to a Designer.</sentenceCorrect>
          <sentenceMisses>
            <miss>Fine-tuning is a rumor with no name in science.</miss>
            <miss>A habitable cosmos needs no explanation at all.</miss>
          </sentenceMisses>
          <placePrompt>That voice lives at Sky Watch.</placePrompt>
          <personPrompt>Nora keeps that sky.</personPrompt>
          <ideaPrompt>Nora’s sky — fine-tuning points to a Designer.</ideaPrompt>
          <ideaLabel>Fine-tuning points to a Designer.</ideaLabel>
          <whyMedium>Nora watches the sky. Fine-tuning points to a Designer.</whyMedium>
        </match>
        <hold levelUpTo="hard" onFail="easy">
          <claim>The universe is finely tuned for life — that fit points to a Designer.</claim>
          <reason>Life-permitting ranges are extravagantly narrow across independent parameters; design predicts a habitable cosmos, blank chance does not.</reason>
          <source>Fine-tuning of physical constants and initial conditions (e.g. cosmological constant; a low-entropy start — initial condition, not another force dial).</source>
          <whyCorrect>Life-permitting ranges are extravagantly narrow across independent parameters; design predicts a habitable cosmos, blank chance does not.</whyCorrect>
          <whyMisses>
            <miss>Life-permitting ranges are wide; blank chance predicts a habitable cosmos just as well.</miss>
            <miss>The fittedness is only a rumor in the numbers.</miss>
          </whyMisses>
          <claimChoices>
            <choice>The universe is finely tuned for life — that fit points to a Designer.</choice>
            <choice>Fine-tuning is a rumor with no name in science.</choice>
            <choice>A habitable cosmos needs no explanation at all.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Life-permitting ranges are extravagantly narrow across independent parameters; design predicts a habitable cosmos, blank chance does not.</choice>
            <choice>Life-permitting ranges are wide; blank chance predicts a habitable cosmos just as well.</choice>
            <choice>The fittedness is only a rumor in the numbers.</choice>
          </reasonChoices>
        </hold>
      </medium>
      <hard points="15">
        <learn>
          <hardTeach>The universe is finely tuned for life — that fit points to a Designer. Life-permitting ranges are extravagantly narrow across independent parameters; design predicts a habitable cosmos, blank chance does not. Necessity, chance (often a multiverse — asserted to cancel the surprise — no evidence), or design: the fit still points to a Designer.
Design predicts this cosmos: cosmological constant, nuclear binding, a low-entropy start, gravity against electromagnetism — extravagantly narrow, habitable. That fit points to a Designer.</hardTeach>
          <fullTeach>The universe is finely tuned for life — that fit points to a Designer. Life-permitting ranges are extravagantly narrow across independent parameters; design predicts a habitable cosmos, blank chance does not. Necessity, chance (often a multiverse — asserted to cancel the surprise — no evidence), or design: the fit still points to a Designer.
Design predicts this cosmos: cosmological constant, nuclear binding, a low-entropy start, gravity against electromagnetism — extravagantly narrow, habitable. That fit points to a Designer.</fullTeach>
          <prompt>Tap a picture, then the mark that belongs. Two choices at a time.</prompt>
          <teachOnWrong>Ask what breaks if the number moves. Those extravagantly narrow, habitable ranges are the mark of a Designer.</teachOnWrong>
          <challengeTiles>
            <pair>
              <left>Cosmological constant</left>
              <right>Much larger: expansion too fierce for galaxies; much more negative: recollapse</right>
            </pair>
            <pair>
              <left>Strong nuclear force</left>
              <right>Slight shift: familiar chemistry of hydrogen and heavier elements fails</right>
            </pair>
            <pair>
              <left>Early-universe entropy</left>
              <right>The initial low-entropy state is extravagantly special — an initial condition, not another force dial</right>
            </pair>
            <pair>
              <left>Gravity vs. electromagnetism</left>
              <right>Stars, long-lived structure, and chemistry sit in a delicate balance</right>
            </pair>
          </challengeTiles>
        </learn>
        <match>
          <sentenceCorrect>The universe is finely tuned for life — that fit points to a Designer.</sentenceCorrect>
          <sentenceMisses>
            <miss>Fine-tuning is a rumor with no name in science.</miss>
            <miss>A habitable cosmos needs no explanation at all.</miss>
          </sentenceMisses>
          <placePrompt>That voice lives at Sky Watch.</placePrompt>
          <personPrompt>Nora keeps that sky.</personPrompt>
          <ideaPrompt>Nora’s sky — fine-tuning points to a Designer.</ideaPrompt>
          <ideaLabel>Fine-tuning points to a Designer.</ideaLabel>
          <whyHard>Nora Skye keeps Sky Watch. Life-permitting ranges are extravagantly narrow. Necessity, chance, and a sprawling multiverse get named so they can be set down — time still goes to a Designer who wanted a habitable world.</whyHard>
        </match>
        <hold onFail="easy">
          <claim>The universe is finely tuned for life — that fit points to a Designer.</claim>
          <reason>Life-permitting ranges are extravagantly narrow across independent parameters; design predicts a habitable cosmos, blank chance does not.</reason>
          <source>Fine-tuning of physical constants and initial conditions (e.g. cosmological constant; a low-entropy start — initial condition, not another force dial).</source>
          <whyCorrect>Life-permitting ranges are extravagantly narrow across independent parameters; design predicts a habitable cosmos, blank chance does not.</whyCorrect>
          <whyMisses>
            <miss>Life-permitting ranges are wide; blank chance predicts a habitable cosmos just as well.</miss>
            <miss>The fittedness is only a rumor in the numbers.</miss>
          </whyMisses>
          <claimChoices>
            <choice>The universe is finely tuned for life — that fit points to a Designer.</choice>
            <choice>Fine-tuning is a rumor with no name in science.</choice>
            <choice>A habitable cosmos needs no explanation at all.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Life-permitting ranges are extravagantly narrow across independent parameters; design predicts a habitable cosmos, blank chance does not.</choice>
            <choice>Life-permitting ranges are wide; blank chance predicts a habitable cosmos just as well.</choice>
            <choice>The fittedness is only a rumor in the numbers.</choice>
          </reasonChoices>
        </hold>
      </hard>
      <journal id="j-ob-1" title="The universe is finely tuned for life" kicker="Sky Watch" unlockAfter="ob-tuning" scoreFromHeldTier="true">
        <p>The universe is finely tuned for life — that fit points to a Designer.</p>
        <p>Life-permitting ranges are extravagantly narrow across independent parameters; design predicts a habitable cosmos, blank chance does not.</p>
        <sources>
          <source>Fine-tuning of physical constants and initial conditions (e.g. cosmological constant; a low-entropy start — an initial condition, not another force dial).</source>
          <source>Aquinas, ST I, q.2, a.3 (Fifth Way); Psalm 19; Romans 1</source>
          <source>Robin Collins, The Fine-Tuning Design Argument</source>
        </sources>
      </journal>
    </lesson>
    <lesson id="ob-design" place="Sky Watch" person="Nora Skye" tripleId="design-sky" ideaId="idea-design" ideaLabel="A mind intended a habitable world." challengeKind="build-argument" challengeTitle="A habitable cosmos">
      <easy points="10" easyOrder="20">
        <learn>
          <shortStory>The ranges are extravagantly narrow. A Designer who wants observers leads us to expect that fit. A world that does not care does not.</shortStory>
          <mainIdea>Fine-tuning is best explained by a mind that intended a habitable world.</mainIdea>
          <gloss>Fine-tuning is best explained by a mind that intended a habitable world.</gloss>
          <loci>This idea lives at Sky Watch, with Nora.</loci>
          <word>
            <term>Habitable</term>
            <sense>a world where living things can exist</sense>
          </word>
          <hint>Place the next stone. Two choices. Leave the overclaims.</hint>
        </learn>
        <match>
          <sentenceCorrect>Fine-tuning is best explained by a mind that intended a habitable world.</sentenceCorrect>
          <sentenceMisses>
            <miss>A habitable cosmos needs no Designer.</miss>
            <miss>Fine-tuning already proves a particular gospel.</miss>
          </sentenceMisses>
          <placePrompt>That voice lives at Sky Watch.</placePrompt>
          <personPrompt>Nora keeps that sky.</personPrompt>
          <ideaPrompt>Nora’s sky — a mind intended a habitable world.</ideaPrompt>
          <ideaLabel>A mind intended a habitable world.</ideaLabel>
          <whyEasy>Nora watches the sky. A mind intended a habitable world.</whyEasy>
        </match>
        <hold levelUpTo="medium" onFail="easy">
          <claim>Fine-tuning is best explained by a mind that intended a habitable world.</claim>
          <reason>Life-permitting ranges are extravagantly narrow; a Designer who wants observers leads us to expect that fit — blank indifference does not.</reason>
          <source>Likelihood / fine-tuning arguments (Collins). A low-entropy start is an initial condition, not another force dial.</source>
          <whyCorrect>Life-permitting ranges are extravagantly narrow; a Designer who wants observers leads us to expect that fit — blank indifference does not.</whyCorrect>
          <whyMisses>
            <miss>A mind wanting observers would not expect life-permitting numbers.</miss>
            <miss>Likelihood arguments are automatically dishonest.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Fine-tuning is best explained by a mind that intended a habitable world.</choice>
            <choice>A habitable cosmos needs no Designer.</choice>
            <choice>Fine-tuning already proves a particular gospel.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Life-permitting ranges are extravagantly narrow; a Designer who wants observers leads us to expect that fit — blank indifference does not.</choice>
            <choice>A mind wanting observers would not expect life-permitting numbers.</choice>
            <choice>Likelihood arguments are automatically dishonest.</choice>
          </reasonChoices>
        </hold>
      </easy>
      <medium points="12">
        <learn>
          <mediumTeach>Fine-tuning’s narrow ranges are best explained by a mind that intended a habitable world. A Designer who wants observers leads us to expect that fit. A world that does not care does not. Wonder is rational.</mediumTeach>
          <mainIdea>Fine-tuning is best explained by a mind that intended a habitable world.</mainIdea>
          <gloss>Fine-tuning is best explained by a mind that intended a habitable world.</gloss>
          <loci>This idea lives at Sky Watch, with Nora.</loci>
          <word>
            <term>Habitable</term>
            <sense>a world where living things can exist</sense>
          </word>
          <hint>Place the next stone. Two choices. Leave the overclaims.</hint>
        </learn>
        <match>
          <sentenceCorrect>Fine-tuning is best explained by a mind that intended a habitable world.</sentenceCorrect>
          <sentenceMisses>
            <miss>A habitable cosmos needs no Designer.</miss>
            <miss>Fine-tuning already proves a particular gospel.</miss>
          </sentenceMisses>
          <placePrompt>That voice lives at Sky Watch.</placePrompt>
          <personPrompt>Nora keeps that sky.</personPrompt>
          <ideaPrompt>Nora’s sky — a mind intended a habitable world.</ideaPrompt>
          <ideaLabel>A mind intended a habitable world.</ideaLabel>
          <whyMedium>Nora watches the sky. A mind intended a habitable world.</whyMedium>
        </match>
        <hold levelUpTo="hard" onFail="easy">
          <claim>Fine-tuning is best explained by a mind that intended a habitable world.</claim>
          <reason>Life-permitting ranges are extravagantly narrow; a Designer who wants observers leads us to expect that fit — blank indifference does not.</reason>
          <source>Likelihood / fine-tuning arguments (Collins). A low-entropy start is an initial condition, not another force dial.</source>
          <whyCorrect>Life-permitting ranges are extravagantly narrow; a Designer who wants observers leads us to expect that fit — blank indifference does not.</whyCorrect>
          <whyMisses>
            <miss>A mind wanting observers would not expect life-permitting numbers.</miss>
            <miss>Likelihood arguments are automatically dishonest.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Fine-tuning is best explained by a mind that intended a habitable world.</choice>
            <choice>A habitable cosmos needs no Designer.</choice>
            <choice>Fine-tuning already proves a particular gospel.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Life-permitting ranges are extravagantly narrow; a Designer who wants observers leads us to expect that fit — blank indifference does not.</choice>
            <choice>A mind wanting observers would not expect life-permitting numbers.</choice>
            <choice>Likelihood arguments are automatically dishonest.</choice>
          </reasonChoices>
        </hold>
      </medium>
      <hard points="15">
        <learn>
          <hardTeach>Fine-tuning is best explained by a mind that intended a habitable world. Life-permitting ranges are extravagantly narrow; a Designer who wants observers leads us to expect that fit — blank indifference does not. Necessity, chance (often a multiverse — asserted to cancel the surprise — no evidence), or design: hold the Designer.
A Designer who wants observers predicts this habitable fit. The narrow ranges are the evidence. Hold the Designer.</hardTeach>
          <fullTeach>Fine-tuning is best explained by a mind that intended a habitable world. Life-permitting ranges are extravagantly narrow; a Designer who wants observers leads us to expect that fit — blank indifference does not. Necessity, chance (often a multiverse — asserted to cancel the surprise — no evidence), or design: hold the Designer.
A Designer who wants observers predicts this habitable fit. The narrow ranges are the evidence. Hold the Designer.</fullTeach>
          <prompt>Place the next stone. Two choices. Leave the overclaims.</prompt>
          <teachOnWrong>Leave the two overclaims. The narrow habitable fit lands a Designer, not which gospel.</teachOnWrong>
          <challengeTiles />
        </learn>
        <match>
          <sentenceCorrect>Fine-tuning is best explained by a mind that intended a habitable world.</sentenceCorrect>
          <sentenceMisses>
            <miss>A habitable cosmos needs no Designer.</miss>
            <miss>Fine-tuning already proves a particular gospel.</miss>
          </sentenceMisses>
          <placePrompt>That voice lives at Sky Watch.</placePrompt>
          <personPrompt>Nora keeps that sky.</personPrompt>
          <ideaPrompt>Nora’s sky — a mind intended a habitable world.</ideaPrompt>
          <ideaLabel>A mind intended a habitable world.</ideaLabel>
          <whyHard>Nora Skye keeps Sky Watch. A Designer who wants observers leads us to expect that fit — blank indifference does not.</whyHard>
        </match>
        <hold onFail="easy">
          <claim>Fine-tuning is best explained by a mind that intended a habitable world.</claim>
          <reason>Life-permitting ranges are extravagantly narrow; a Designer who wants observers leads us to expect that fit — blank indifference does not.</reason>
          <source>Likelihood / fine-tuning arguments (Collins). A low-entropy start is an initial condition, not another force dial.</source>
          <whyCorrect>Life-permitting ranges are extravagantly narrow; a Designer who wants observers leads us to expect that fit — blank indifference does not.</whyCorrect>
          <whyMisses>
            <miss>A mind wanting observers would not expect life-permitting numbers.</miss>
            <miss>Likelihood arguments are automatically dishonest.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Fine-tuning is best explained by a mind that intended a habitable world.</choice>
            <choice>A habitable cosmos needs no Designer.</choice>
            <choice>Fine-tuning already proves a particular gospel.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Life-permitting ranges are extravagantly narrow; a Designer who wants observers leads us to expect that fit — blank indifference does not.</choice>
            <choice>A mind wanting observers would not expect life-permitting numbers.</choice>
            <choice>Likelihood arguments are automatically dishonest.</choice>
          </reasonChoices>
        </hold>
      </hard>
      <journal id="j-ob-2" title="A mind that intended a habitable world" kicker="Sky Watch" unlockAfter="ob-design" scoreFromHeldTier="true">
        <p>Fine-tuning is best explained by a mind that intended a habitable world.</p>
        <p>Life-permitting ranges are extravagantly narrow; a Designer who wants observers leads us to expect that fit — blank indifference does not.</p>
        <sources>
          <source>Likelihood / fine-tuning arguments (Collins). A low-entropy start is an initial condition, not another force dial.</source>
          <source>Aquinas, ST I, q.2, a.3 (Fifth Way); Psalm 19; Romans 1</source>
        </sources>
      </journal>
    </lesson>
    <lesson id="ob-leibniz" place="Sky Watch" person="Nora Skye" tripleId="leibniz-sky" ideaId="idea-leibniz" ideaLabel="Why something rather than nothing." challengeKind="sort" challengeTitle="Something rather than nothing">
      <easy points="10" easyOrder="21">
        <learn>
          <shortStory>A hot early state is still something. Empty space in a lab is still something. The question remains: why is there anything at all?</shortStory>
          <mainIdea>Why is there something rather than nothing remains after a cosmological model.</mainIdea>
          <gloss>Physics maps how the world runs. It does not finish why there is a world.</gloss>
          <loci>This idea lives at Sky Watch, with Nora.</loci>
          <word>
            <term>Nothing</term>
            <sense>not a vacuum — not even empty space with laws</sense>
          </word>
          <hint>Keep the careful reading. Toss “free lunch.”</hint>
        </learn>
        <match>
          <sentenceCorrect>Why is there something rather than nothing remains after a cosmological model.</sentenceCorrect>
          <sentenceMisses>
            <miss>A successful model retires the metaphysical question.</miss>
            <miss>“Nothing” in popular writing always means metaphysical nothing.</miss>
          </sentenceMisses>
          <placePrompt>That voice lives at Sky Watch.</placePrompt>
          <personPrompt>Nora keeps that sky.</personPrompt>
          <ideaPrompt>Nora’s sky — why something rather than nothing.</ideaPrompt>
          <ideaLabel>Why something rather than nothing.</ideaLabel>
          <whyEasy>Nora watches the sky. Why something rather than nothing still stands.</whyEasy>
        </match>
        <hold levelUpTo="medium" onFail="easy">
          <claim>Why is there something rather than nothing remains after a cosmological model.</claim>
          <reason>Models describe a world already given; a physical “vacuum” is still something.</reason>
          <source>Leibniz; the vacuum/nothing distinction</source>
          <whyCorrect>Models describe a world already given; a physical “vacuum” is still something.</whyCorrect>
          <whyMisses>
            <miss>Laws and vacua are not somethings.</miss>
            <miss>The question only applies to Tuesdays.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Why is there something rather than nothing remains after a cosmological model.</choice>
            <choice>A successful model retires the metaphysical question.</choice>
            <choice>“Nothing” in popular writing always means metaphysical nothing.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Models describe a world already given; a physical “vacuum” is still something.</choice>
            <choice>Laws and vacua are not somethings.</choice>
            <choice>The question only applies to Tuesdays.</choice>
          </reasonChoices>
        </hold>
      </easy>
      <medium points="12">
        <learn>
          <mediumTeach>Leibniz asked: why is there something rather than nothing? A hot early state is still something; empty space in a lab is still something. A cosmological model describes *how* early stuff behaved — it does not erase the deeper question of why anything is here at all.</mediumTeach>
          <mainIdea>Why is there something rather than nothing remains after a cosmological model.</mainIdea>
          <gloss>Physics maps how the world runs. It does not finish why there is a world.</gloss>
          <loci>This idea lives at Sky Watch, with Nora.</loci>
          <word>
            <term>Nothing</term>
            <sense>not a vacuum — not even empty space with laws</sense>
          </word>
          <hint>Keep the careful reading. Toss “free lunch.”</hint>
        </learn>
        <match>
          <sentenceCorrect>Why is there something rather than nothing remains after a cosmological model.</sentenceCorrect>
          <sentenceMisses>
            <miss>A successful model retires the metaphysical question.</miss>
            <miss>“Nothing” in popular writing always means metaphysical nothing.</miss>
          </sentenceMisses>
          <placePrompt>That voice lives at Sky Watch.</placePrompt>
          <personPrompt>Nora keeps that sky.</personPrompt>
          <ideaPrompt>Nora’s sky — why something rather than nothing.</ideaPrompt>
          <ideaLabel>Why something rather than nothing.</ideaLabel>
          <whyMedium>Nora watches the sky. Why something rather than nothing still stands.</whyMedium>
        </match>
        <hold levelUpTo="hard" onFail="easy">
          <claim>Why is there something rather than nothing remains after a cosmological model.</claim>
          <reason>Models describe a world already given; a physical “vacuum” is still something.</reason>
          <source>Leibniz; the vacuum/nothing distinction</source>
          <whyCorrect>Models describe a world already given; a physical “vacuum” is still something.</whyCorrect>
          <whyMisses>
            <miss>Laws and vacua are not somethings.</miss>
            <miss>The question only applies to Tuesdays.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Why is there something rather than nothing remains after a cosmological model.</choice>
            <choice>A successful model retires the metaphysical question.</choice>
            <choice>“Nothing” in popular writing always means metaphysical nothing.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Models describe a world already given; a physical “vacuum” is still something.</choice>
            <choice>Laws and vacua are not somethings.</choice>
            <choice>The question only applies to Tuesdays.</choice>
          </reasonChoices>
        </hold>
      </medium>
      <hard points="15">
        <learn>
          <hardTeach>Leibniz: why is there something rather than nothing? The Big Bang describes an early hot state — not automatically absolute nothing.
Fine-tuning and “why anything?” are siblings, not twins. One asks why this world’s numbers permit us; the other asks why there is a world.</hardTeach>
          <fullTeach>Leibniz: why is there something rather than nothing? The Big Bang describes an early hot state — not automatically absolute nothing.
Fine-tuning and “why anything?” are siblings, not twins. One asks why this world’s numbers permit us; the other asks why there is a world.</fullTeach>
          <prompt>Keep the careful Leibniz reading. Toss the rest — a wrong toss bounces back.</prompt>
          <teachOnWrong>A vacuum is already a structured something. Equations describe a world that is already there.</teachOnWrong>
          <challengeTiles>
            <keep>Physics can map how this universe evolves; it does not by itself say why there is a concrete reality with laws.</keep>
            <discard>The Big Bang is a video of God creating, timestamped in Genesis.</discard>
            <discard>A wave function of the universe makes “why anything?” meaningless.</discard>
            <discard>In physics papers, “nothing” already means absolute non-being — a free lunch.</discard>
          </challengeTiles>
        </learn>
        <match>
          <sentenceCorrect>Why is there something rather than nothing remains after a cosmological model.</sentenceCorrect>
          <sentenceMisses>
            <miss>A successful model retires the metaphysical question.</miss>
            <miss>“Nothing” in popular writing always means metaphysical nothing.</miss>
          </sentenceMisses>
          <placePrompt>That voice lives at Sky Watch.</placePrompt>
          <personPrompt>Nora keeps that sky.</personPrompt>
          <ideaPrompt>Nora’s sky — why something rather than nothing.</ideaPrompt>
          <ideaLabel>Why something rather than nothing.</ideaLabel>
          <whyHard>Nora Skye keeps Sky Watch. Models describe a world already given; why there is something rather than nothing remains.</whyHard>
        </match>
        <hold onFail="easy">
          <claim>Why is there something rather than nothing remains after a cosmological model.</claim>
          <reason>Models describe a world already given; a physical “vacuum” is still something.</reason>
          <source>Leibniz; the vacuum/nothing distinction</source>
          <whyCorrect>Models describe a world already given; a physical “vacuum” is still something.</whyCorrect>
          <whyMisses>
            <miss>Laws and vacua are not somethings.</miss>
            <miss>The question only applies to Tuesdays.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Why is there something rather than nothing remains after a cosmological model.</choice>
            <choice>A successful model retires the metaphysical question.</choice>
            <choice>“Nothing” in popular writing always means metaphysical nothing.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Models describe a world already given; a physical “vacuum” is still something.</choice>
            <choice>Laws and vacua are not somethings.</choice>
            <choice>The question only applies to Tuesdays.</choice>
          </reasonChoices>
        </hold>
      </hard>
      <journal id="j-ob-3" title="The question beneath physics" kicker="Sky Watch" unlockAfter="ob-leibniz" scoreFromHeldTier="true">
        <p>Leibniz’s question — why is there something rather than nothing? — is not retired by a successful cosmological model. Models describe a world that is already given.</p>
        <p>When popular writing says the universe came from “nothing,” check whether the word still names a vacuum, a law, or a formalism. Those are somethings. The metaphysical question remains on the table.</p>
        <sources>
          <source>Leibniz, “On the Ultimate Origination of Things”</source>
          <source>Standard distinction between physical vacua and metaphysical nothing</source>
        </sources>
      </journal>
    </lesson>
    <lesson id="ob-life" place="Sky Watch" person="Nora Skye" tripleId="ob-life-sky" ideaId="idea-ob-life" ideaLabel="Life’s information is a mark of mind." challengeKind="sort" challengeTitle="The threshold of life">
      <easy points="10" easyOrder="22">
        <learn>
          <shortStory>Cells store instructions and run a coordinated life. That looks like the work of mind. Wonder is rational. So is more lab work. Do not shrug it away.</shortStory>
          <mainIdea>Life’s specified information is a mark of mind.</mainIdea>
          <gloss>Life’s specified information is a mark of mind.</gloss>
          <loci>This idea lives at Sky Watch, with Nora.</loci>
          <word>
            <term>Specified information</term>
            <sense>ordered instructions that do a real job — not random noise</sense>
          </word>
          <hint>Keep the careful line. Toss both shrugs.</hint>
        </learn>
        <match>
          <sentenceCorrect>Life’s specified information is a mark of mind.</sentenceCorrect>
          <sentenceMisses>
            <miss>A flask has already demonstrated a miracle.</miss>
            <miss>Cells require no coordinated information.</miss>
          </sentenceMisses>
          <placePrompt>That voice lives at Sky Watch.</placePrompt>
          <personPrompt>Nora keeps that sky.</personPrompt>
          <ideaPrompt>Nora’s sky — life’s information is a mark of mind.</ideaPrompt>
          <ideaLabel>Life’s information is a mark of mind.</ideaLabel>
          <whyEasy>Nora watches the sky. Life’s information is a mark of mind.</whyEasy>
        </match>
        <hold levelUpTo="medium" onFail="easy">
          <claim>Life’s specified information is a mark of mind.</claim>
          <reason>Cells store coordinated information; that looks like the work of a mind — wonder is rational, and so is more work.</reason>
          <source>Abiogenesis as an open program; Genesis 1 as theology</source>
          <whyCorrect>Cells store coordinated information; that looks like the work of a mind — wonder is rational, and so is more work.</whyCorrect>
          <whyMisses>
            <miss>The unfinished story means we should end research.</miss>
            <miss>Genesis 1 is a lab protocol.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Life’s specified information is a mark of mind.</choice>
            <choice>A flask has already demonstrated a miracle.</choice>
            <choice>Cells require no coordinated information.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Cells store coordinated information; that looks like the work of a mind — wonder is rational, and so is more work.</choice>
            <choice>The unfinished story means we should end research.</choice>
            <choice>Genesis 1 is a lab protocol.</choice>
          </reasonChoices>
        </hold>
      </easy>
      <medium points="12">
        <learn>
          <mediumTeach>Cells store specified instructions and run a coordinated life. That looks like the work of mind. Abiogenesis is open research, not a closed shrug. Wonder is rational — and so is more careful lab work.</mediumTeach>
          <mainIdea>Life’s specified information is a mark of mind.</mainIdea>
          <gloss>Life’s specified information is a mark of mind.</gloss>
          <loci>This idea lives at Sky Watch, with Nora.</loci>
          <word>
            <term>Specified information</term>
            <sense>ordered instructions that do a real job — not random noise</sense>
          </word>
          <hint>Keep the careful line. Toss both shrugs.</hint>
        </learn>
        <match>
          <sentenceCorrect>Life’s specified information is a mark of mind.</sentenceCorrect>
          <sentenceMisses>
            <miss>A flask has already demonstrated a miracle.</miss>
            <miss>Cells require no coordinated information.</miss>
          </sentenceMisses>
          <placePrompt>That voice lives at Sky Watch.</placePrompt>
          <personPrompt>Nora keeps that sky.</personPrompt>
          <ideaPrompt>Nora’s sky — life’s information is a mark of mind.</ideaPrompt>
          <ideaLabel>Life’s information is a mark of mind.</ideaLabel>
          <whyMedium>Nora watches the sky. Life’s information is a mark of mind.</whyMedium>
        </match>
        <hold levelUpTo="hard" onFail="easy">
          <claim>Life’s specified information is a mark of mind.</claim>
          <reason>Cells store coordinated information; that looks like the work of a mind — wonder is rational, and so is more work.</reason>
          <source>Abiogenesis as an open program; Genesis 1 as theology</source>
          <whyCorrect>Cells store coordinated information; that looks like the work of a mind — wonder is rational, and so is more work.</whyCorrect>
          <whyMisses>
            <miss>The unfinished story means we should end research.</miss>
            <miss>Genesis 1 is a lab protocol.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Life’s specified information is a mark of mind.</choice>
            <choice>A flask has already demonstrated a miracle.</choice>
            <choice>Cells require no coordinated information.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Cells store coordinated information; that looks like the work of a mind — wonder is rational, and so is more work.</choice>
            <choice>The unfinished story means we should end research.</choice>
            <choice>Genesis 1 is a lab protocol.</choice>
          </reasonChoices>
        </hold>
      </medium>
      <hard points="15">
        <learn>
          <hardTeach>Cells store specified information and run a coordinated metabolism. Abiogenesis is an open research program — not a closed chapter.
Life’s information looks like the work of mind. Wonder is rational. So is more work. Do not trade the mark for a shrug.</hardTeach>
          <fullTeach>Cells store specified information and run a coordinated metabolism. Abiogenesis is an open research program — not a closed chapter.
Life’s information looks like the work of mind. Wonder is rational. So is more work. Do not trade the mark for a shrug.</fullTeach>
          <prompt>Keep the careful statement. Toss the gaps — a wrong toss bounces back.</prompt>
          <teachOnWrong>Wonder is rational here. So is more work. “God of the gaps” and “science of the gaps” both tempt us.</teachOnWrong>
          <challengeTiles>
            <keep>“No complete naturalistic account yet” is not the same as “we demonstrated a miracle.”</keep>
            <discard>Because we cannot assemble a cell in a storm, theism is proven and research is irreverent.</discard>
            <discard>Because research continues, the chemical pathway is finished and the question is closed.</discard>
            <discard>Genesis 1 forbids asking biological questions.</discard>
          </challengeTiles>
        </learn>
        <match>
          <sentenceCorrect>Life’s specified information is a mark of mind.</sentenceCorrect>
          <sentenceMisses>
            <miss>A flask has already demonstrated a miracle.</miss>
            <miss>Cells require no coordinated information.</miss>
          </sentenceMisses>
          <placePrompt>That voice lives at Sky Watch.</placePrompt>
          <personPrompt>Nora keeps that sky.</personPrompt>
          <ideaPrompt>Nora’s sky — life’s information is a mark of mind.</ideaPrompt>
          <ideaLabel>Life’s information is a mark of mind.</ideaLabel>
          <whyHard>Nora Skye keeps Sky Watch. Cells store coordinated information — that looks like the work of a mind.</whyHard>
        </match>
        <hold onFail="easy">
          <claim>Life’s specified information is a mark of mind.</claim>
          <reason>Cells store coordinated information; that looks like the work of a mind — wonder is rational, and so is more work.</reason>
          <source>Abiogenesis as an open program; Genesis 1 as theology</source>
          <whyCorrect>Cells store coordinated information; that looks like the work of a mind — wonder is rational, and so is more work.</whyCorrect>
          <whyMisses>
            <miss>The unfinished story means we should end research.</miss>
            <miss>Genesis 1 is a lab protocol.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Life’s specified information is a mark of mind.</choice>
            <choice>A flask has already demonstrated a miracle.</choice>
            <choice>Cells require no coordinated information.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Cells store coordinated information; that looks like the work of a mind — wonder is rational, and so is more work.</choice>
            <choice>The unfinished story means we should end research.</choice>
            <choice>Genesis 1 is a lab protocol.</choice>
          </reasonChoices>
        </hold>
      </hard>
      <journal id="j-ob-4" title="Life’s open threshold" kicker="Sky Watch" unlockAfter="ob-life" scoreFromHeldTier="true">
        <p>Life’s specified information is a mark of mind. Cells require coordinated function. That is not a rumor; it is biology.</p>
        <p>Treat the unfinished story as a place for wonder and for more work — and as a mark of mind. Do not stop the lab. Do not shrug the information away.</p>
        <sources>
          <source>Contemporary abiogenesis research as an open program</source>
          <source>Genesis 1 as theological, not a lab protocol</source>
        </sources>
      </journal>
    </lesson>
    <lesson id="daily-stars" place="Sky Watch" person="Nora Skye" tripleId="nora-sky" ideaId="idea-stars" ideaLabel="The heavens speak of a Maker." challengeKind="sort" challengeTitle="Night air">
      <easy points="10" easyOrder="7">
        <learn>
          <shortStory>Psalm 19 and Romans 1 treat the sky as speech. The heavens already speak of a Maker — and the careful fit of the world for life fits that voice.</shortStory>
          <mainIdea>The heavens already speak of a Maker; fine-tuning fits that voice.</mainIdea>
          <gloss>The heavens already speak of a Maker. Fine-tuning fits that voice.</gloss>
          <loci>This idea lives at Sky Watch, with Nora.</loci>
          <word>
            <term>Maker</term>
            <sense>the One who intended this world</sense>
          </word>
          <hint>Keep the sky as speech. Toss “silent decoration.”</hint>
        </learn>
        <match>
          <sentenceCorrect>The heavens already speak of a Maker; fine-tuning fits that voice.</sentenceCorrect>
          <sentenceMisses>
            <miss>The heavens are silent about a Maker.</miss>
            <miss>Fine-tuning contradicts the psalm.</miss>
          </sentenceMisses>
          <placePrompt>That voice lives at Sky Watch.</placePrompt>
          <personPrompt>Nora keeps that sky.</personPrompt>
          <ideaPrompt>Nora’s sky — the heavens speak of a Maker.</ideaPrompt>
          <ideaLabel>The heavens speak of a Maker.</ideaLabel>
          <whyEasy>Nora watches the sky. The heavens speak of a Maker.</whyEasy>
        </match>
        <hold levelUpTo="medium" onFail="easy">
          <claim>The heavens already speak of a Maker; fine-tuning fits that voice.</claim>
          <reason>Scripture treats the created order as intelligible testimony — design inference and “the heavens declare” land in the same grain.</reason>
          <source>Psalm 19:1–4; Romans 1:20</source>
          <whyCorrect>Scripture treats the created order as intelligible testimony — design inference and “the heavens declare” land in the same grain.</whyCorrect>
          <whyMisses>
            <miss>Scripture treats the sky as decoration only.</miss>
            <miss>Design inference and “the heavens declare” cannot share a grain.</miss>
          </whyMisses>
          <claimChoices>
            <choice>The heavens already speak of a Maker; fine-tuning fits that voice.</choice>
            <choice>The heavens are silent about a Maker.</choice>
            <choice>Fine-tuning contradicts the psalm.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Scripture treats the created order as intelligible testimony — design inference and “the heavens declare” land in the same grain.</choice>
            <choice>Scripture treats the sky as decoration only.</choice>
            <choice>Design inference and “the heavens declare” cannot share a grain.</choice>
          </reasonChoices>
        </hold>
      </easy>
      <medium points="12">
        <learn>
          <mediumTeach>Psalm 19 and Romans 1 treat the sky as speech: the heavens already declare a Maker. Fine-tuning fits that voice — the numbers and the psalm point the same way, not against each other.</mediumTeach>
          <mainIdea>The heavens already speak of a Maker; fine-tuning fits that voice.</mainIdea>
          <gloss>The heavens already speak of a Maker. Fine-tuning fits that voice.</gloss>
          <loci>This idea lives at Sky Watch, with Nora.</loci>
          <word>
            <term>Maker</term>
            <sense>the One who intended this world</sense>
          </word>
          <hint>Keep the sky as speech. Toss “silent decoration.”</hint>
        </learn>
        <match>
          <sentenceCorrect>The heavens already speak of a Maker; fine-tuning fits that voice.</sentenceCorrect>
          <sentenceMisses>
            <miss>The heavens are silent about a Maker.</miss>
            <miss>Fine-tuning contradicts the psalm.</miss>
          </sentenceMisses>
          <placePrompt>That voice lives at Sky Watch.</placePrompt>
          <personPrompt>Nora keeps that sky.</personPrompt>
          <ideaPrompt>Nora’s sky — the heavens speak of a Maker.</ideaPrompt>
          <ideaLabel>The heavens speak of a Maker.</ideaLabel>
          <whyMedium>Nora watches the sky. The heavens speak of a Maker.</whyMedium>
        </match>
        <hold levelUpTo="hard" onFail="easy">
          <claim>The heavens already speak of a Maker; fine-tuning fits that voice.</claim>
          <reason>Scripture treats the created order as intelligible testimony — design inference and “the heavens declare” land in the same grain.</reason>
          <source>Psalm 19:1–4; Romans 1:20</source>
          <whyCorrect>Scripture treats the created order as intelligible testimony — design inference and “the heavens declare” land in the same grain.</whyCorrect>
          <whyMisses>
            <miss>Scripture treats the sky as decoration only.</miss>
            <miss>Design inference and “the heavens declare” cannot share a grain.</miss>
          </whyMisses>
          <claimChoices>
            <choice>The heavens already speak of a Maker; fine-tuning fits that voice.</choice>
            <choice>The heavens are silent about a Maker.</choice>
            <choice>Fine-tuning contradicts the psalm.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Scripture treats the created order as intelligible testimony — design inference and “the heavens declare” land in the same grain.</choice>
            <choice>Scripture treats the sky as decoration only.</choice>
            <choice>Design inference and “the heavens declare” cannot share a grain.</choice>
          </reasonChoices>
        </hold>
      </medium>
      <hard points="15">
        <learn>
          <hardTeach>Psalm 19:1–4; Romans 1:20. Fine-tuning fits that voice.
The heavens declare the glory of God, and the sky above proclaims his handiwork.</hardTeach>
          <fullTeach>Psalm 19:1–4; Romans 1:20. Fine-tuning fits that voice.
The heavens declare the glory of God, and the sky above proclaims his handiwork.</fullTeach>
          <prompt>Which notes belong in a careful night of looking?</prompt>
          <teachOnWrong>Scripture treats the created order as intelligible testimony — design inference and “the heavens declare” land in the same grain. Keep that voice; toss the false choice.</teachOnWrong>
          <challengeTiles>
            <keep>The heavens already speak of a Maker.</keep>
            <keep>Fine-tuning fits the voice the heavens already speak.</keep>
            <keep>The sky is worth looking at slowly.</keep>
            <discard>A psalm replaces a telescope.</discard>
          </challengeTiles>
        </learn>
        <match>
          <sentenceCorrect>The heavens already speak of a Maker; fine-tuning fits that voice.</sentenceCorrect>
          <sentenceMisses>
            <miss>The heavens are silent about a Maker.</miss>
            <miss>Fine-tuning contradicts the psalm.</miss>
          </sentenceMisses>
          <placePrompt>That voice lives at Sky Watch.</placePrompt>
          <personPrompt>Nora keeps that sky.</personPrompt>
          <ideaPrompt>Nora’s sky — the heavens speak of a Maker.</ideaPrompt>
          <ideaLabel>The heavens speak of a Maker.</ideaLabel>
          <whyHard>Nora Skye keeps Sky Watch. The heavens declare a Maker — that voice belongs on the ridge, not the porch lamp.</whyHard>
        </match>
        <hold onFail="easy">
          <claim>The heavens already speak of a Maker; fine-tuning fits that voice.</claim>
          <reason>Scripture treats the created order as intelligible testimony — design inference and “the heavens declare” land in the same grain.</reason>
          <source>Psalm 19:1–4; Romans 1:20</source>
          <whyCorrect>Scripture treats the created order as intelligible testimony — design inference and “the heavens declare” land in the same grain.</whyCorrect>
          <whyMisses>
            <miss>Scripture treats the sky as decoration only.</miss>
            <miss>Design inference and “the heavens declare” cannot share a grain.</miss>
          </whyMisses>
          <claimChoices>
            <choice>The heavens already speak of a Maker; fine-tuning fits that voice.</choice>
            <choice>The heavens are silent about a Maker.</choice>
            <choice>Fine-tuning contradicts the psalm.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Scripture treats the created order as intelligible testimony — design inference and “the heavens declare” land in the same grain.</choice>
            <choice>Scripture treats the sky as decoration only.</choice>
            <choice>Design inference and “the heavens declare” cannot share a grain.</choice>
          </reasonChoices>
        </hold>
      </hard>
      <journal id="" title="" kicker="" unlockAfter="daily-stars" scoreFromHeldTier="true">
        <p />
        <sources>
          <source />
        </sources>
      </journal>
    </lesson>
    <lesson id="daily-life" place="Sky Watch" person="Nora Skye" tripleId="daily-life-sky" ideaId="idea-daily-life" ideaLabel="Life, place, and mind are not cheap facts." challengeKind="match" challengeTitle="Not cheap">
      <easy points="10" easyOrder="23">
        <learn>
          <shortStory>Copying cells, a habitable band, and a mind that can do science all look given — the marks of a Maker.</shortStory>
          <mainIdea>Life, place, and mind are not cheap facts.</mainIdea>
          <gloss>Life, place, and mind are not cheap facts.</gloss>
          <loci>This idea lives at Sky Watch, with Nora.</loci>
          <word>
            <term>Given</term>
            <sense>received, not cheap leftover</sense>
          </word>
          <hint>Keep the marks. Toss “it just happened.”</hint>
        </learn>
        <match>
          <sentenceCorrect>Life, place, and mind are not cheap facts.</sentenceCorrect>
          <sentenceMisses>
            <miss>Chemistry is easy to dismiss.</miss>
            <miss>“It happened” is automatically the last word.</miss>
          </sentenceMisses>
          <placePrompt>That voice lives at Sky Watch.</placePrompt>
          <personPrompt>Nora keeps that sky.</personPrompt>
          <ideaPrompt>Nora’s sky — life, place, and mind are given.</ideaPrompt>
          <ideaLabel>Life, place, and mind are not cheap facts.</ideaLabel>
          <whyEasy>Nora watches the sky. Life, place, and mind are not cheap facts.</whyEasy>
        </match>
        <hold levelUpTo="medium" onFail="easy">
          <claim>Life, place, and mind are not cheap facts.</claim>
          <reason>Copying cells, a habitable band, and a mind that can do science all look given — the marks of a Maker.</reason>
          <source>Acts 17:24–25</source>
          <whyCorrect>Copying cells, a habitable band, and a mind that can do science all look given — the marks of a Maker.</whyCorrect>
          <whyMisses>
            <miss>A habitable band is an unremarkable accident with no question.</miss>
            <miss>Minds that do science need no home in the story.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Life, place, and mind are not cheap facts.</choice>
            <choice>Chemistry is easy to dismiss.</choice>
            <choice>“It happened” is automatically the last word.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Copying cells, a habitable band, and a mind that can do science all look given — the marks of a Maker.</choice>
            <choice>A habitable band is an unremarkable accident with no question.</choice>
            <choice>Minds that do science need no home in the story.</choice>
          </reasonChoices>
        </hold>
      </easy>
      <medium points="12">
        <learn>
          <mediumTeach>Copying cells, a habitable band around a star, and a mind that can do science are not cheap facts. Chemistry is real work. “It just happened” is not the last word — life, place, and mind look given, the marks of a Maker.</mediumTeach>
          <mainIdea>Life, place, and mind are not cheap facts.</mainIdea>
          <gloss>Life, place, and mind are not cheap facts.</gloss>
          <loci>This idea lives at Sky Watch, with Nora.</loci>
          <word>
            <term>Given</term>
            <sense>received, not cheap leftover</sense>
          </word>
          <hint>Keep the marks. Toss “it just happened.”</hint>
        </learn>
        <match>
          <sentenceCorrect>Life, place, and mind are not cheap facts.</sentenceCorrect>
          <sentenceMisses>
            <miss>Chemistry is easy to dismiss.</miss>
            <miss>“It happened” is automatically the last word.</miss>
          </sentenceMisses>
          <placePrompt>That voice lives at Sky Watch.</placePrompt>
          <personPrompt>Nora keeps that sky.</personPrompt>
          <ideaPrompt>Nora’s sky — life, place, and mind are given.</ideaPrompt>
          <ideaLabel>Life, place, and mind are not cheap facts.</ideaLabel>
          <whyMedium>Nora watches the sky. Life, place, and mind are not cheap facts.</whyMedium>
        </match>
        <hold levelUpTo="hard" onFail="easy">
          <claim>Life, place, and mind are not cheap facts.</claim>
          <reason>Copying cells, a habitable band, and a mind that can do science all look given — the marks of a Maker.</reason>
          <source>Acts 17:24–25</source>
          <whyCorrect>Copying cells, a habitable band, and a mind that can do science all look given — the marks of a Maker.</whyCorrect>
          <whyMisses>
            <miss>A habitable band is an unremarkable accident with no question.</miss>
            <miss>Minds that do science need no home in the story.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Life, place, and mind are not cheap facts.</choice>
            <choice>Chemistry is easy to dismiss.</choice>
            <choice>“It happened” is automatically the last word.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Copying cells, a habitable band, and a mind that can do science all look given — the marks of a Maker.</choice>
            <choice>A habitable band is an unremarkable accident with no question.</choice>
            <choice>Minds that do science need no home in the story.</choice>
          </reasonChoices>
        </hold>
      </medium>
      <hard points="15">
        <learn>
          <hardTeach>Chemistry is real work. “It just happened” is not the last word. Life, place, and mind look given.
Acts 17:24–25: the God who made the world… gives to all mankind life and breath and everything.</hardTeach>
          <fullTeach>Chemistry is real work. “It just happened” is not the last word. Life, place, and mind look given.
Acts 17:24–25: the God who made the world… gives to all mankind life and breath and everything.</fullTeach>
          <prompt>Pair each observation with the honest next sentence.</prompt>
          <teachOnWrong>Each pair names a mark of a Maker. Snap the observation to the sentence that holds.</teachOnWrong>
          <challengeTiles>
            <pair>
              <left>Cells copy information</left>
              <right>Copying is not a small trick</right>
            </pair>
            <pair>
              <left>Earth sits in a habitable band</left>
              <right>A narrow kindness of place</right>
            </pair>
            <pair>
              <left>We can do science at all</left>
              <right>A mind that fits a cosmos</right>
            </pair>
          </challengeTiles>
        </learn>
        <match>
          <sentenceCorrect>Life, place, and mind are not cheap facts.</sentenceCorrect>
          <sentenceMisses>
            <miss>Chemistry is easy to dismiss.</miss>
            <miss>“It happened” is automatically the last word.</miss>
          </sentenceMisses>
          <placePrompt>That voice lives at Sky Watch.</placePrompt>
          <personPrompt>Nora keeps that sky.</personPrompt>
          <ideaPrompt>Nora’s sky — life, place, and mind are given.</ideaPrompt>
          <ideaLabel>Life, place, and mind are not cheap facts.</ideaLabel>
          <whyHard>Nora Skye keeps Sky Watch. Copying cells, a habitable band, and a mind that can do science all look given — the marks of a Maker.</whyHard>
        </match>
        <hold onFail="easy">
          <claim>Life, place, and mind are not cheap facts.</claim>
          <reason>Copying cells, a habitable band, and a mind that can do science all look given — the marks of a Maker.</reason>
          <source>Acts 17:24–25</source>
          <whyCorrect>Copying cells, a habitable band, and a mind that can do science all look given — the marks of a Maker.</whyCorrect>
          <whyMisses>
            <miss>A habitable band is an unremarkable accident with no question.</miss>
            <miss>Minds that do science need no home in the story.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Life, place, and mind are not cheap facts.</choice>
            <choice>Chemistry is easy to dismiss.</choice>
            <choice>“It happened” is automatically the last word.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Copying cells, a habitable band, and a mind that can do science all look given — the marks of a Maker.</choice>
            <choice>A habitable band is an unremarkable accident with no question.</choice>
            <choice>Minds that do science need no home in the story.</choice>
          </reasonChoices>
        </hold>
      </hard>
      <journal id="" title="" kicker="" unlockAfter="daily-life" scoreFromHeldTier="true">
        <p />
        <sources>
          <source />
        </sources>
      </journal>
    </lesson>
  </lessons>
  <streetFacts>
    <fact evidenceId="ob-tuning" tripleId="tuning-sky" ideaId="idea-tuning" place="Sky Watch" person="Nora Skye" ideaLabel="Fine-tuning points to a Designer." />
    <fact evidenceId="ob-design" tripleId="design-sky" ideaId="idea-design" place="Sky Watch" person="Nora Skye" ideaLabel="A mind intended a habitable world." />
    <fact evidenceId="ob-leibniz" tripleId="leibniz-sky" ideaId="idea-leibniz" place="Sky Watch" person="Nora Skye" ideaLabel="Why something rather than nothing." />
    <fact evidenceId="ob-life" tripleId="ob-life-sky" ideaId="idea-ob-life" place="Sky Watch" person="Nora Skye" ideaLabel="Life’s information is a mark of mind." />
    <fact evidenceId="daily-stars" tripleId="nora-sky" ideaId="idea-stars" place="Sky Watch" person="Nora Skye" ideaLabel="The heavens speak of a Maker." />
    <fact evidenceId="daily-life" tripleId="daily-life-sky" ideaId="idea-daily-life" place="Sky Watch" person="Nora Skye" ideaLabel="Life, place, and mind are not cheap facts." />
  </streetFacts>
</areaPack>
`,"parable-hollow.xml":`<?xml version="1.0" encoding="UTF-8"?>
<areaPack id="parable-hollow" schemaVersion="3" appVersion="1.4.50" generated="2026-09-14T13:15:00-05:00" host="https://cphillippe.github.io/Silver-dollar-city/" title="Story Creek" place="Story Creek" person="Mercy Wren" personId="mercy" plotId="hollow">
  <howToEdit>RUNTIME CONTENT: the game loads this file as the source of truth for this area. Change player-facing text in place inside each &lt;lesson&gt;. Stable id attributes (ph-father, …) are engine keys — do not rename without a migration. Three tiers per fact: &lt;easy easyOrder="N"&gt;, &lt;medium&gt;, and &lt;hard&gt; — each with &lt;learn&gt;, &lt;match&gt;, and &lt;hold&gt;. Easy Learn: shortStory/mainIdea/loci. Medium Learn: mediumTeach (clearer than Hard, richer than Easy). Hard Learn: hardTeach/fullTeach. Held claim·reason·source stay plain and identical on all three. Hold level-up: see hold @levelUpTo / @onFail and index &lt;holdRules&gt;. Empty optional elements are intentional. Escape &amp; &lt; &gt; in text.</howToEdit>
  <meta>
    <title>Silver City — Story Creek</title>
    <subtitle>Jesus stories that stick</subtitle>
    <blurb>The Teacher spoke in pictures — not to hide the truth, but to make it move.</blurb>
    <notes>Runtime/build content pack. Engine maps lesson fields 1:1 to Learn / Match / Hold / Journal / street.</notes>
    <porchNote>East porch (Juniper) dailies ship with this pack — same mercy/picture pillar.</porchNote>
  </meta>
  <easyShelf order="ph-road,ph-father,ph-debt,daily-lantern,ph-seeds,daily-gems,daily-seed,daily-neighbor">
    <line id="ph-road" easyOrder="1">ph-road</line>
    <line id="ph-father" easyOrder="2">ph-father</line>
    <line id="ph-debt" easyOrder="3">ph-debt</line>
    <line id="daily-lantern" easyOrder="6">daily-lantern</line>
    <line id="ph-seeds" easyOrder="10">ph-seeds</line>
    <line id="daily-gems" easyOrder="16">daily-gems</line>
    <line id="daily-seed" easyOrder="17">daily-seed</line>
    <line id="daily-neighbor" easyOrder="18">daily-neighbor</line>
  </easyShelf>
  <lessons>
    <lesson id="ph-road" place="Story Creek" person="Mercy Wren" tripleId="mercy-hollow" ideaId="idea-mercy" ideaLabel="Neighbor is the one who shows mercy." challengeKind="sequence" challengeTitle="The Good Samaritan">
      <easy points="10" easyOrder="1">
        <learn>
          <shortStory>Jesus tells a story. A hurt man lies on the road. Religious men walk past. A Samaritan is moved with compassion and helps. Then Jesus asks who *proved* to be a neighbor.</shortStory>
          <mainIdea>Neighbor is the one who shows mercy.</mainIdea>
          <gloss>A neighbor is the person who shows mercy — not the person who looks like you.</gloss>
          <loci>This idea lives at Story Creek, with Mercy.</loci>
          <word>
            <term>Samaritan</term>
            <sense>someone the listener did not expect to be the hero</sense>
          </word>
          <hint>Mercy is the test — not the family name.</hint>
        </learn>
        <match>
          <sentenceCorrect>Neighbor is the one who shows mercy.</sentenceCorrect>
          <sentenceMisses>
            <miss>Neighbor means the person who already looks like you.</miss>
            <miss>The priest is the hero because he kept the law.</miss>
          </sentenceMisses>
          <placePrompt>The neighbor-road story lives at Story Creek.</placePrompt>
          <personPrompt>Mercy Wren keeps the neighbor who stops.</personPrompt>
          <ideaPrompt>Mercy’s Jesus story — the neighbor who stops on the road.</ideaPrompt>
          <ideaLabel>Neighbor is the one who shows mercy.</ideaLabel>
          <whyEasy>Mercy lives at the creek because she tells Jesus stories. The neighbor who stops on the road is a picture, so it lives at Story Creek.</whyEasy>
        </match>
        <hold levelUpTo="medium" onFail="easy">
          <claim>Neighbor is the one who shows mercy.</claim>
          <reason>Jesus makes the listener identify with the wounded man, then with the Samaritan moved with compassion.</reason>
          <source>Luke 10:25–37</source>
          <whyCorrect>Jesus makes the listener identify with the wounded man, then with the Samaritan moved with compassion.</whyCorrect>
          <whyMisses>
            <miss>The story is mainly a map of the Jericho road.</miss>
            <miss>Mercy is optional once you have classified the victim.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Neighbor is the one who shows mercy.</choice>
            <choice>Neighbor means the person who already looks like you.</choice>
            <choice>The priest is the hero because he kept the law.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Jesus makes the listener identify with the wounded man, then with the Samaritan moved with compassion.</choice>
            <choice>The story is mainly a map of the Jericho road.</choice>
            <choice>Mercy is optional once you have classified the victim.</choice>
          </reasonChoices>
        </hold>
      </easy>
      <medium points="12">
        <learn>
          <mediumTeach>Luke 10:25–37. A lawyer asks who counts as neighbor. Jesus answers with a story on a dangerous road: religious men pass by; a Samaritan is moved with compassion and helps. Then Jesus flips the question — who *proved* to be a neighbor? Mercy is the test, not the family name.</mediumTeach>
          <mainIdea>Neighbor is the one who shows mercy.</mainIdea>
          <gloss>A neighbor is the person who shows mercy — not the person who looks like you.</gloss>
          <loci>This idea lives at Story Creek, with Mercy.</loci>
          <word>
            <term>Samaritan</term>
            <sense>someone the listener did not expect to be the hero</sense>
          </word>
          <hint>Mercy is the test — not the family name.</hint>
        </learn>
        <match>
          <sentenceCorrect>Neighbor is the one who shows mercy.</sentenceCorrect>
          <sentenceMisses>
            <miss>Neighbor means the person who already looks like you.</miss>
            <miss>The priest is the hero because he kept the law.</miss>
          </sentenceMisses>
          <placePrompt>The neighbor-road story lives at Story Creek.</placePrompt>
          <personPrompt>Mercy Wren keeps the neighbor who stops.</personPrompt>
          <ideaPrompt>Mercy’s Jesus story — the neighbor who stops on the road.</ideaPrompt>
          <ideaLabel>Neighbor is the one who shows mercy.</ideaLabel>
          <whyMedium>Mercy lives at the creek because she tells Jesus stories. The neighbor who stops on the road is a picture, so it lives at Story Creek.</whyMedium>
        </match>
        <hold levelUpTo="hard" onFail="easy">
          <claim>Neighbor is the one who shows mercy.</claim>
          <reason>Jesus makes the listener identify with the wounded man, then with the Samaritan moved with compassion.</reason>
          <source>Luke 10:25–37</source>
          <whyCorrect>Jesus makes the listener identify with the wounded man, then with the Samaritan moved with compassion.</whyCorrect>
          <whyMisses>
            <miss>The story is mainly a map of the Jericho road.</miss>
            <miss>Mercy is optional once you have classified the victim.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Neighbor is the one who shows mercy.</choice>
            <choice>Neighbor means the person who already looks like you.</choice>
            <choice>The priest is the hero because he kept the law.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Jesus makes the listener identify with the wounded man, then with the Samaritan moved with compassion.</choice>
            <choice>The story is mainly a map of the Jericho road.</choice>
            <choice>Mercy is optional once you have classified the victim.</choice>
          </reasonChoices>
        </hold>
      </medium>
      <hard points="15">
        <learn>
          <hardTeach>Luke 10:25–37. A lawyer asks, “Who is my neighbor?” Jesus answers with a story set on the Jerusalem–Jericho road — a real, dangerous descent.
Samaritans and Judeans were divided by worship and memory (see John 4:9). Jesus flips the question (Luke 10:36): mercy proves who the neighbor is. He makes the listener identify with the wounded man — and then with costly mercy.</hardTeach>
          <fullTeach>Luke 10:25–37. A lawyer asks, “Who is my neighbor?” Jesus answers with a story set on the Jerusalem–Jericho road — a real, dangerous descent.
Samaritans and Judeans were divided by worship and memory (see John 4:9). Jesus flips the question (Luke 10:36): mercy proves who the neighbor is. He makes the listener identify with the wounded man — and then with costly mercy.</fullTeach>
          <prompt>Place the Good Samaritan in the order Luke tells it.</prompt>
          <teachOnWrong>Luke’s force depends on order: religious insiders fail first; the unexpected outsider becomes the measure of neighbor-love. Try again.</teachOnWrong>
          <challengeTiles>
            <sequenceItem>A lawyer asks Jesus, “And who is my neighbor?”</sequenceItem>
            <sequenceItem>A man is beaten and left half-dead on the road.</sequenceItem>
            <sequenceItem>A priest and then a Levite see him and pass by.</sequenceItem>
            <sequenceItem>Moved with compassion, a Samaritan binds the wounds, takes him to an inn, and pays.</sequenceItem>
            <sequenceItem>Jesus: “Go and do likewise.”</sequenceItem>
          </challengeTiles>
        </learn>
        <match>
          <sentenceCorrect>Neighbor is the one who shows mercy.</sentenceCorrect>
          <sentenceMisses>
            <miss>Neighbor means the person who already looks like you.</miss>
            <miss>The priest is the hero because he kept the law.</miss>
          </sentenceMisses>
          <placePrompt>The neighbor-road story lives at Story Creek.</placePrompt>
          <personPrompt>Mercy Wren keeps the neighbor who stops.</personPrompt>
          <ideaPrompt>Mercy’s Jesus story — the neighbor who stops on the road.</ideaPrompt>
          <ideaLabel>Neighbor is the one who shows mercy.</ideaLabel>
          <whyHard>Mercy Wren keeps Story Creek: Jesus taught in pictures by the road and the water. Neighbor is the one who shows mercy — that line belongs with the storyteller, not the clerk.</whyHard>
        </match>
        <hold onFail="easy">
          <claim>Neighbor is the one who shows mercy.</claim>
          <reason>Jesus makes the listener identify with the wounded man, then with the Samaritan moved with compassion.</reason>
          <source>Luke 10:25–37</source>
          <whyCorrect>Jesus makes the listener identify with the wounded man, then with the Samaritan moved with compassion.</whyCorrect>
          <whyMisses>
            <miss>The story is mainly a map of the Jericho road.</miss>
            <miss>Mercy is optional once you have classified the victim.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Neighbor is the one who shows mercy.</choice>
            <choice>Neighbor means the person who already looks like you.</choice>
            <choice>The priest is the hero because he kept the law.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Jesus makes the listener identify with the wounded man, then with the Samaritan moved with compassion.</choice>
            <choice>The story is mainly a map of the Jericho road.</choice>
            <choice>Mercy is optional once you have classified the victim.</choice>
          </reasonChoices>
        </hold>
      </hard>
      <journal id="j-ph-1" title="The Teacher who taught in stories" kicker="Story Creek" unlockAfter="ph-road" scoreFromHeldTier="true">
        <p>The Gospels present Jesus as a teacher whose most characteristic form is the parable. These are not children’s decorations added to a lecture. They are the lecture — they force a decision about mercy, pride, and the identity of God.</p>
        <p>The Good Samaritan (Luke 10:25–37) relocates the word “neighbor” from a boundary question to a mercy question. The listener is not first invited to classify others. The listener is invited to become the kind of person who crosses the road.</p>
        <sources>
          <source>Luke 10:25–37</source>
          <source>Luke 10:29</source>
        </sources>
      </journal>
    </lesson>
    <lesson id="ph-father" place="Story Creek" person="Mercy Wren" tripleId="father-hollow" ideaId="idea-father" ideaLabel="The father runs with mercy before the speech is done." challengeKind="sort" challengeTitle="The father’s run">
      <easy points="10" easyOrder="2">
        <learn>
          <shortStory>Jesus tells about a son who takes his share early and wastes it far from home. Hungry and ashamed, he starts a hired-hand speech to ask for work. But his father sees him while he is still a long way off and runs — mercy before the speech is done. He hugs the son. Honor is spent so the lost one can be welcomed; the feast is the father’s idea.</shortStory>
          <mainIdea>The father runs with mercy before the speech is done.</mainIdea>
          <gloss>The father runs with mercy before the son finishes his speech.</gloss>
          <loci>This idea lives at Story Creek, with Mercy.</loci>
          <word>
            <term>Mercy</term>
            <sense>kindness you did not earn</sense>
          </word>
          <hint>The run comes before the apology is done.</hint>
        </learn>
        <match>
          <sentenceCorrect>The father runs with mercy before the speech is done.</sentenceCorrect>
          <sentenceMisses>
            <miss>The son earned the feast by writing a good apology.</miss>
            <miss>The story is mainly about dividing an estate.</miss>
          </sentenceMisses>
          <placePrompt>The father-run story lives at Story Creek.</placePrompt>
          <personPrompt>Mercy Wren keeps the father who runs.</personPrompt>
          <ideaPrompt>Mercy’s Jesus story — the father who runs first.</ideaPrompt>
          <ideaLabel>The father runs with mercy before the speech is done.</ideaLabel>
          <whyEasy>Mercy tells the father-run story at the creek. The father runs with mercy, so it lives at Story Creek.</whyEasy>
        </match>
        <hold levelUpTo="medium" onFail="easy">
          <claim>The father runs with mercy before the speech is done.</claim>
          <reason>Honor is spent so the son can be embraced; the older brother shows nearness without joy.</reason>
          <source>Luke 15:11–32</source>
          <whyCorrect>Honor is spent so the son can be embraced; the older brother shows nearness without joy.</whyCorrect>
          <whyMisses>
            <miss>The father waits until justice is complete.</miss>
            <miss>The older brother is the hero for staying home.</miss>
          </whyMisses>
          <claimChoices>
            <choice>The father runs with mercy before the speech is done.</choice>
            <choice>The son earned the feast by writing a good apology.</choice>
            <choice>The story is mainly about dividing an estate.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Honor is spent so the son can be embraced; the older brother shows nearness without joy.</choice>
            <choice>The father waits until justice is complete.</choice>
            <choice>The older brother is the hero for staying home.</choice>
          </reasonChoices>
        </hold>
      </easy>
      <medium points="12">
        <learn>
          <mediumTeach>Luke 15:11–32. A son wastes his share and comes home rehearsing a hired-hand speech. The father runs first — mercy before the apology is finished. In that world a patriarch running spent honor; the feast is the father’s idea. The older brother stays near the house but refuses the joy.</mediumTeach>
          <mainIdea>The father runs with mercy before the speech is done.</mainIdea>
          <gloss>The father runs with mercy before the son finishes his speech.</gloss>
          <loci>This idea lives at Story Creek, with Mercy.</loci>
          <word>
            <term>Mercy</term>
            <sense>kindness you did not earn</sense>
          </word>
          <hint>The run comes before the apology is done.</hint>
        </learn>
        <match>
          <sentenceCorrect>The father runs with mercy before the speech is done.</sentenceCorrect>
          <sentenceMisses>
            <miss>The son earned the feast by writing a good apology.</miss>
            <miss>The story is mainly about dividing an estate.</miss>
          </sentenceMisses>
          <placePrompt>The father-run story lives at Story Creek.</placePrompt>
          <personPrompt>Mercy Wren keeps the father who runs.</personPrompt>
          <ideaPrompt>Mercy’s Jesus story — the father who runs first.</ideaPrompt>
          <ideaLabel>The father runs with mercy before the speech is done.</ideaLabel>
          <whyMedium>Mercy tells the father-run story at the creek. The father runs with mercy, so it lives at Story Creek.</whyMedium>
        </match>
        <hold levelUpTo="hard" onFail="easy">
          <claim>The father runs with mercy before the speech is done.</claim>
          <reason>Honor is spent so the son can be embraced; the older brother shows nearness without joy.</reason>
          <source>Luke 15:11–32</source>
          <whyCorrect>Honor is spent so the son can be embraced; the older brother shows nearness without joy.</whyCorrect>
          <whyMisses>
            <miss>The father waits until justice is complete.</miss>
            <miss>The older brother is the hero for staying home.</miss>
          </whyMisses>
          <claimChoices>
            <choice>The father runs with mercy before the speech is done.</choice>
            <choice>The son earned the feast by writing a good apology.</choice>
            <choice>The story is mainly about dividing an estate.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Honor is spent so the son can be embraced; the older brother shows nearness without joy.</choice>
            <choice>The father waits until justice is complete.</choice>
            <choice>The older brother is the hero for staying home.</choice>
          </reasonChoices>
        </hold>
      </medium>
      <hard points="15">
        <learn>
          <hardTeach>Luke 15:11–32. In that world a patriarch running was undignified. The father runs before the son finishes his hired-hand speech.
Luke 15 stacks three lost-and-found stories. God is not only willing to receive. God seeks. The feast is the Father’s idea.</hardTeach>
          <fullTeach>Luke 15:11–32. In that world a patriarch running was undignified. The father runs before the son finishes his hired-hand speech.
Luke 15 stacks three lost-and-found stories. God is not only willing to receive. God seeks. The feast is the Father’s idea.</fullTeach>
          <prompt>Toss the weak readings. Keep what Luke 15 is actually pressing.</prompt>
          <teachOnWrong>Grace arrives before the speech is done (Luke 15:20). The older brother is dutiful — and furious at mercy. Try the bins again.</teachOnWrong>
          <challengeTiles>
            <keep>The father runs with mercy — before the speech is done.</keep>
            <discard>The son earned the feast by writing a good apology.</discard>
            <discard>The older brother is the hero simply for staying home.</discard>
            <discard>The story is mainly about estate planning.</discard>
          </challengeTiles>
        </learn>
        <match>
          <sentenceCorrect>The father runs with mercy before the speech is done.</sentenceCorrect>
          <sentenceMisses>
            <miss>The son earned the feast by writing a good apology.</miss>
            <miss>The story is mainly about dividing an estate.</miss>
          </sentenceMisses>
          <placePrompt>The father-run story lives at Story Creek.</placePrompt>
          <personPrompt>Mercy Wren keeps the father who runs.</personPrompt>
          <ideaPrompt>Mercy’s Jesus story — the father who runs first.</ideaPrompt>
          <ideaLabel>The father runs with mercy before the speech is done.</ideaLabel>
          <whyHard>Mercy Wren keeps Story Creek. The father runs before the speech is done — a Jesus story, not a square report.</whyHard>
        </match>
        <hold onFail="easy">
          <claim>The father runs with mercy before the speech is done.</claim>
          <reason>Honor is spent so the son can be embraced; the older brother shows nearness without joy.</reason>
          <source>Luke 15:11–32</source>
          <whyCorrect>Honor is spent so the son can be embraced; the older brother shows nearness without joy.</whyCorrect>
          <whyMisses>
            <miss>The father waits until justice is complete.</miss>
            <miss>The older brother is the hero for staying home.</miss>
          </whyMisses>
          <claimChoices>
            <choice>The father runs with mercy before the speech is done.</choice>
            <choice>The son earned the feast by writing a good apology.</choice>
            <choice>The story is mainly about dividing an estate.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Honor is spent so the son can be embraced; the older brother shows nearness without joy.</choice>
            <choice>The father waits until justice is complete.</choice>
            <choice>The older brother is the hero for staying home.</choice>
          </reasonChoices>
        </hold>
      </hard>
      <journal id="j-ph-2" title="Mercy that runs" kicker="Story Creek" unlockAfter="ph-father" scoreFromHeldTier="true">
        <p>Luke 15 stacks three lost-and-found stories after a complaint: this man welcomes sinners and eats with them. The father’s run (Luke 15:20) is the theological center of the third story. Honor is spent so that the son can be embraced before he finishes his hired-hand speech.</p>
        <p>The older brother shows that you can live in the house and still refuse the feast. Nearness without joy at another’s return is a second lostness.</p>
        <sources>
          <source>Luke 15:1–32</source>
        </sources>
      </journal>
    </lesson>
    <lesson id="ph-seeds" place="Story Creek" person="Mercy Wren" tripleId="seeds-hollow" ideaId="idea-seeds" ideaLabel="The kingdom arrives in pictures." challengeKind="match" challengeTitle="Pictures of the kingdom">
      <easy points="10" easyOrder="10">
        <learn>
          <shortStory>Jesus tells many kingdom stories: seed on different soils, a lost sheep sought, a tiny mustard seed that grows into shelter, and a trust you must use. Each picture asks what you will do with what you heard — the kingdom arrives in stories you can hold, not slogans.</shortStory>
          <mainIdea>The kingdom arrives in pictures, not slogans.</mainIdea>
          <gloss>The kingdom comes in Jesus stories you can hold — not slogans.</gloss>
          <loci>This idea lives at Story Creek, with Mercy.</loci>
          <word>
            <term>Parable</term>
            <sense>a Jesus story that asks you to decide</sense>
          </word>
          <hint>Keep the right pictures. Remove wrong picks.</hint>
        </learn>
        <match>
          <sentenceCorrect>The kingdom arrives in pictures, not slogans.</sentenceCorrect>
          <sentenceMisses>
            <miss>Every parable is an allegory of every detail.</miss>
            <miss>The kingdom is only for people who already understand.</miss>
          </sentenceMisses>
          <placePrompt>That story lives at the creek.</placePrompt>
          <personPrompt>Mercy keeps that creek.</personPrompt>
          <ideaPrompt>Mercy’s Jesus stories — the kingdom arrives in pictures.</ideaPrompt>
          <ideaLabel>The kingdom arrives in pictures.</ideaLabel>
          <whyEasy>Mercy tells kingdom pictures at the creek. The kingdom arrives in pictures, not slogans.</whyEasy>
        </match>
        <hold levelUpTo="medium" onFail="easy">
          <claim>The kingdom arrives in pictures, not slogans.</claim>
          <reason>Soil, search, a tiny seed, and a trust form a portrait — not a slogan.</reason>
          <source>Matthew 13; Luke 15; Matthew 25</source>
          <whyCorrect>Soil, search, a tiny seed, and a trust form a portrait — not a slogan.</whyCorrect>
          <whyMisses>
            <miss>The sower proves every heart is the same.</miss>
            <miss>The talents story is about hiding gifts until heaven.</miss>
          </whyMisses>
          <claimChoices>
            <choice>The kingdom arrives in pictures, not slogans.</choice>
            <choice>Every parable is an allegory of every detail.</choice>
            <choice>The kingdom is only for people who already understand.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Soil, search, a tiny seed, and a trust form a portrait — not a slogan.</choice>
            <choice>The sower proves every heart is the same.</choice>
            <choice>The talents story is about hiding gifts until heaven.</choice>
          </reasonChoices>
        </hold>
      </easy>
      <medium points="12">
        <learn>
          <mediumTeach>Jesus’ kingdom stories — soil, a search, a tiny seed, a trust — are among the best-attested teachings in the Gospels. Each picture has a main thrust: hear, seek, grow, steward. They are not slogans. They are a portrait that asks what you will do.</mediumTeach>
          <mainIdea>The kingdom arrives in pictures, not slogans.</mainIdea>
          <gloss>The kingdom comes in Jesus stories you can hold — not slogans.</gloss>
          <loci>This idea lives at Story Creek, with Mercy.</loci>
          <word>
            <term>Parable</term>
            <sense>a Jesus story that asks you to decide</sense>
          </word>
          <hint>Keep the right pictures. Remove wrong picks.</hint>
        </learn>
        <match>
          <sentenceCorrect>The kingdom arrives in pictures, not slogans.</sentenceCorrect>
          <sentenceMisses>
            <miss>Every parable is an allegory of every detail.</miss>
            <miss>The kingdom is only for people who already understand.</miss>
          </sentenceMisses>
          <placePrompt>That story lives at the creek.</placePrompt>
          <personPrompt>Mercy keeps that creek.</personPrompt>
          <ideaPrompt>Mercy’s Jesus stories — the kingdom arrives in pictures.</ideaPrompt>
          <ideaLabel>The kingdom arrives in pictures.</ideaLabel>
          <whyMedium>Mercy tells kingdom pictures at the creek. The kingdom arrives in pictures, not slogans.</whyMedium>
        </match>
        <hold levelUpTo="hard" onFail="easy">
          <claim>The kingdom arrives in pictures, not slogans.</claim>
          <reason>Soil, search, a tiny seed, and a trust form a portrait — not a slogan.</reason>
          <source>Matthew 13; Luke 15; Matthew 25</source>
          <whyCorrect>Soil, search, a tiny seed, and a trust form a portrait — not a slogan.</whyCorrect>
          <whyMisses>
            <miss>The sower proves every heart is the same.</miss>
            <miss>The talents story is about hiding gifts until heaven.</miss>
          </whyMisses>
          <claimChoices>
            <choice>The kingdom arrives in pictures, not slogans.</choice>
            <choice>Every parable is an allegory of every detail.</choice>
            <choice>The kingdom is only for people who already understand.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Soil, search, a tiny seed, and a trust form a portrait — not a slogan.</choice>
            <choice>The sower proves every heart is the same.</choice>
            <choice>The talents story is about hiding gifts until heaven.</choice>
          </reasonChoices>
        </hold>
      </medium>
      <hard points="15">
        <learn>
          <hardTeach>These are among the most-attested teachings in the Synoptic Gospels. A parable can have one main thrust — resist turning every detail into an allegory.
Jesus’ stories assume a God who speaks, seeks, grows a kingdom, and will ask what we did with a trust. They are not proofs. They are a portrait — and a demand.</hardTeach>
          <fullTeach>These are among the most-attested teachings in the Synoptic Gospels. A parable can have one main thrust — resist turning every detail into an allegory.
Jesus’ stories assume a God who speaks, seeks, grows a kingdom, and will ask what we did with a trust. They are not proofs. They are a portrait — and a demand.</fullTeach>
          <prompt>Match each parable to the claim it is actually making.</prompt>
          <teachOnWrong>Look again at the main action of each story — soil, search, growth, or stewardship — rather than a moral you already liked.</teachOnWrong>
          <challengeTiles>
            <pair>
              <left>The sower</left>
              <right>Same word, different hearts</right>
            </pair>
            <pair>
              <left>Lost sheep</left>
              <right>The one is sought</right>
            </pair>
            <pair>
              <left>Mustard seed</left>
              <right>Small start, later shelter</right>
            </pair>
            <pair>
              <left>The talents</left>
              <right>Use the trust; don’t bury it</right>
            </pair>
          </challengeTiles>
        </learn>
        <match>
          <sentenceCorrect>The kingdom arrives in pictures, not slogans.</sentenceCorrect>
          <sentenceMisses>
            <miss>Every parable is an allegory of every detail.</miss>
            <miss>The kingdom is only for people who already understand.</miss>
          </sentenceMisses>
          <placePrompt>That story lives at the creek.</placePrompt>
          <personPrompt>Mercy keeps that creek.</personPrompt>
          <ideaPrompt>Mercy’s Jesus stories — the kingdom arrives in pictures.</ideaPrompt>
          <ideaLabel>The kingdom arrives in pictures.</ideaLabel>
          <whyHard>Mercy Wren keeps Story Creek. Soil, search, a tiny seed — Jesus taught the kingdom in pictures, not slogans.</whyHard>
        </match>
        <hold onFail="easy">
          <claim>The kingdom arrives in pictures, not slogans.</claim>
          <reason>Soil, search, a tiny seed, and a trust form a portrait — not a slogan.</reason>
          <source>Matthew 13; Luke 15; Matthew 25</source>
          <whyCorrect>Soil, search, a tiny seed, and a trust form a portrait — not a slogan.</whyCorrect>
          <whyMisses>
            <miss>The sower proves every heart is the same.</miss>
            <miss>The talents story is about hiding gifts until heaven.</miss>
          </whyMisses>
          <claimChoices>
            <choice>The kingdom arrives in pictures, not slogans.</choice>
            <choice>Every parable is an allegory of every detail.</choice>
            <choice>The kingdom is only for people who already understand.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Soil, search, a tiny seed, and a trust form a portrait — not a slogan.</choice>
            <choice>The sower proves every heart is the same.</choice>
            <choice>The talents story is about hiding gifts until heaven.</choice>
          </reasonChoices>
        </hold>
      </hard>
      <journal id="j-ph-3" title="Seeds, search, and a trust" kicker="Story Creek" unlockAfter="ph-seeds" scoreFromHeldTier="true">
        <p>Taken together, the sower, the lost sheep, the mustard seed, and the talents sketch a God who speaks, seeks, grows a kingdom from small beginnings, and will ask what was done with a trust.</p>
        <p>That is already a case of a sort: not a syllogism, but a coherent portrait. If the portrait is true, the world is personal before it is mechanical.</p>
        <sources>
          <source>Matthew 13:1–23</source>
          <source>Matthew 13:31–32</source>
          <source>Luke 15:1–7</source>
          <source>Matthew 25:14–30</source>
        </sources>
      </journal>
    </lesson>
    <lesson id="ph-debt" place="Story Creek" person="Mercy Wren" tripleId="debt-hollow" ideaId="idea-debt" ideaLabel="Received mercy makes refusing mercy a contradiction." challengeKind="sort" challengeTitle="An unpayable account">
      <easy points="10" easyOrder="3">
        <learn>
          <shortStory>Jesus tells about a king who wipes an unpayable bill. That same servant then chokes a neighbor over a tiny sum. Received mercy makes refusing mercy a contradiction — the story will not let you keep both.</shortStory>
          <mainIdea>Received mercy makes refusing mercy a contradiction.</mainIdea>
          <gloss>If you were forgiven a huge debt, you cannot choke a neighbor over a small one.</gloss>
          <loci>This idea lives at Story Creek, with Mercy.</loci>
          <word>
            <term>Debt</term>
            <sense>what you owe and cannot pay</sense>
          </word>
          <hint>Keep the mercy. Toss the choke. Example: a huge bill wiped, then a tiny one demanded.</hint>
        </learn>
        <match>
          <sentenceCorrect>Received mercy makes refusing mercy a contradiction.</sentenceCorrect>
          <sentenceMisses>
            <miss>Forgiveness is a limited coupon on God’s spreadsheet.</miss>
            <miss>Jesus is only reforming first-century banking.</miss>
          </sentenceMisses>
          <placePrompt>The forgiven-debt story lives at Story Creek.</placePrompt>
          <personPrompt>Mercy Wren keeps the two servants.</personPrompt>
          <ideaPrompt>Mercy’s Jesus story — forgiven much, then show mercy.</ideaPrompt>
          <ideaLabel>Received mercy makes refusing mercy a contradiction.</ideaLabel>
          <whyEasy>Mercy tells the forgiven-debt story at the creek. Received mercy must give mercy.</whyEasy>
        </match>
        <hold levelUpTo="medium" onFail="easy">
          <claim>Received mercy makes refusing mercy a contradiction.</claim>
          <reason>The servant forgiven an unpayable debt then throttles a peer over a small sum.</reason>
          <source>Matthew 18:21–35</source>
          <whyCorrect>The servant forgiven an unpayable debt then throttles a peer over a small sum.</whyCorrect>
          <whyMisses>
            <miss>Peter’s “seven times” was already the full measure.</miss>
            <miss>The first servant was right to demand prison.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Received mercy makes refusing mercy a contradiction.</choice>
            <choice>Forgiveness is a limited coupon on God’s spreadsheet.</choice>
            <choice>Jesus is only reforming first-century banking.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>The servant forgiven an unpayable debt then throttles a peer over a small sum.</choice>
            <choice>Peter’s “seven times” was already the full measure.</choice>
            <choice>The first servant was right to demand prison.</choice>
          </reasonChoices>
        </hold>
      </easy>
      <medium points="12">
        <learn>
          <mediumTeach>Matthew 18:21–35. A king wipes an unpayable debt. That same servant then chokes a peer over a tiny sum — and the king reinstates the first debt. Received mercy makes refusing mercy a contradiction. Mercy is not softness; it is the grain of God’s world.</mediumTeach>
          <mainIdea>Received mercy makes refusing mercy a contradiction.</mainIdea>
          <gloss>If you were forgiven a huge debt, you cannot choke a neighbor over a small one.</gloss>
          <loci>This idea lives at Story Creek, with Mercy.</loci>
          <word>
            <term>Debt</term>
            <sense>what you owe and cannot pay</sense>
          </word>
          <hint>Keep the mercy. Toss the choke. Example: a huge bill wiped, then a tiny one demanded.</hint>
        </learn>
        <match>
          <sentenceCorrect>Received mercy makes refusing mercy a contradiction.</sentenceCorrect>
          <sentenceMisses>
            <miss>Forgiveness is a limited coupon on God’s spreadsheet.</miss>
            <miss>Jesus is only reforming first-century banking.</miss>
          </sentenceMisses>
          <placePrompt>The forgiven-debt story lives at Story Creek.</placePrompt>
          <personPrompt>Mercy Wren keeps the two servants.</personPrompt>
          <ideaPrompt>Mercy’s Jesus story — forgiven much, then show mercy.</ideaPrompt>
          <ideaLabel>Received mercy makes refusing mercy a contradiction.</ideaLabel>
          <whyMedium>Mercy tells the forgiven-debt story at the creek. Received mercy must give mercy.</whyMedium>
        </match>
        <hold levelUpTo="hard" onFail="easy">
          <claim>Received mercy makes refusing mercy a contradiction.</claim>
          <reason>The servant forgiven an unpayable debt then throttles a peer over a small sum.</reason>
          <source>Matthew 18:21–35</source>
          <whyCorrect>The servant forgiven an unpayable debt then throttles a peer over a small sum.</whyCorrect>
          <whyMisses>
            <miss>Peter’s “seven times” was already the full measure.</miss>
            <miss>The first servant was right to demand prison.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Received mercy makes refusing mercy a contradiction.</choice>
            <choice>Forgiveness is a limited coupon on God’s spreadsheet.</choice>
            <choice>Jesus is only reforming first-century banking.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>The servant forgiven an unpayable debt then throttles a peer over a small sum.</choice>
            <choice>Peter’s “seven times” was already the full measure.</choice>
            <choice>The first servant was right to demand prison.</choice>
          </reasonChoices>
        </hold>
      </medium>
      <hard points="15">
        <learn>
          <hardTeach>Matthew 18:21–35. A servant forgiven an unpayable debt then throttles a peer over a small sum. The king reinstates the first debt.
Mercy is not softness. It is the grain of God’s world — and then a question: will you live against that grain? See also Matt 6:12–15.</hardTeach>
          <fullTeach>Matthew 18:21–35. A servant forgiven an unpayable debt then throttles a peer over a small sum. The king reinstates the first debt.
Mercy is not softness. It is the grain of God’s world — and then a question: will you live against that grain? See also Matt 6:12–15.</fullTeach>
          <prompt>Sort the claims. Only one belongs in the keep bin.</prompt>
          <teachOnWrong>Peter offered seven. Jesus breaks coupon-logic (Matt 18:22). The horror is ingratitude, not arithmetic.</teachOnWrong>
          <challengeTiles>
            <keep>Received mercy makes refusing mercy a contradiction.</keep>
            <discard>Forgiveness is a limited coupon on God’s spreadsheet.</discard>
            <discard>The first servant was right to demand prison for a small debt.</discard>
            <discard>Jesus is only reforming first-century banking.</discard>
          </challengeTiles>
        </learn>
        <match>
          <sentenceCorrect>Received mercy makes refusing mercy a contradiction.</sentenceCorrect>
          <sentenceMisses>
            <miss>Forgiveness is a limited coupon on God’s spreadsheet.</miss>
            <miss>Jesus is only reforming first-century banking.</miss>
          </sentenceMisses>
          <placePrompt>The forgiven-debt story lives at Story Creek.</placePrompt>
          <personPrompt>Mercy Wren keeps the two servants.</personPrompt>
          <ideaPrompt>Mercy’s Jesus story — forgiven much, then show mercy.</ideaPrompt>
          <ideaLabel>Received mercy makes refusing mercy a contradiction.</ideaLabel>
          <whyHard>Mercy Wren keeps Story Creek. Received mercy making refusal a contradiction is a Jesus story of two servants.</whyHard>
        </match>
        <hold onFail="easy">
          <claim>Received mercy makes refusing mercy a contradiction.</claim>
          <reason>The servant forgiven an unpayable debt then throttles a peer over a small sum.</reason>
          <source>Matthew 18:21–35</source>
          <whyCorrect>The servant forgiven an unpayable debt then throttles a peer over a small sum.</whyCorrect>
          <whyMisses>
            <miss>Peter’s “seven times” was already the full measure.</miss>
            <miss>The first servant was right to demand prison.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Received mercy makes refusing mercy a contradiction.</choice>
            <choice>Forgiveness is a limited coupon on God’s spreadsheet.</choice>
            <choice>Jesus is only reforming first-century banking.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>The servant forgiven an unpayable debt then throttles a peer over a small sum.</choice>
            <choice>Peter’s “seven times” was already the full measure.</choice>
            <choice>The first servant was right to demand prison.</choice>
          </reasonChoices>
        </hold>
      </hard>
      <journal id="j-ph-4" title="The measure you use" kicker="Story Creek" unlockAfter="ph-debt" scoreFromHeldTier="true">
        <p>Matthew 18:21–35 is severe because grace is severe in the opposite direction from cruelty: it creates a world. To be forgiven an unpayable debt and then throttle a neighbor is to live as if the king’s mercy never happened.</p>
        <p>Jesus teaches his disciples to pray “forgive us our debts, as we also have forgiven our debtors” (Matt 6:12). The petition assumes the same moral grain.</p>
        <sources>
          <source>Matthew 18:21–35</source>
          <source>Matthew 6:12–15</source>
        </sources>
      </journal>
    </lesson>
    <lesson id="daily-lantern" place="East porch" person="Juniper Wick" tripleId="juniper-porch" ideaId="idea-juniper" ideaLabel="A lamp is meant to be seen." challengeKind="sequence" challengeTitle="The porch lamp">
      <easy points="10" easyOrder="6">
        <learn>
          <shortStory>Jesus talks about an ordinary lamp and a city on a hill. Light is meant to be seen — public without being proud, so others can find their way.</shortStory>
          <mainIdea>A lamp is meant to be seen.</mainIdea>
          <gloss>A lamp is meant to be seen.</gloss>
          <loci>This idea lives at East porch, with Juniper.</loci>
          <word>
            <term>Lamp</term>
            <sense>a light others can actually see</sense>
          </word>
          <hint>Keep the right pictures. Remove wrong picks.</hint>
        </learn>
        <match>
          <sentenceCorrect>A lamp is meant to be seen.</sentenceCorrect>
          <sentenceMisses>
            <miss>We are told to become the sun.</miss>
            <miss>Light is only for insiders behind a door.</miss>
          </sentenceMisses>
          <placePrompt>That lamp lives on the porch.</placePrompt>
          <personPrompt>Juniper keeps that porch.</personPrompt>
          <ideaPrompt>Juniper’s lamp — a light meant to be seen.</ideaPrompt>
          <ideaLabel>A lamp is meant to be seen.</ideaLabel>
          <whyEasy>Juniper’s lamp is on the porch so today’s line can be seen.</whyEasy>
        </match>
        <hold levelUpTo="medium" onFail="easy">
          <claim>A lamp is meant to be seen.</claim>
          <reason>Jesus uses an ordinary lamp and a city on a hill — public without being proud.</reason>
          <source>Matthew 5:14–16</source>
          <whyCorrect>Jesus uses an ordinary lamp and a city on a hill — public without being proud.</whyCorrect>
          <whyMisses>
            <miss>The picture is a command to boast.</miss>
            <miss>A hidden lamp is the point of the saying.</miss>
          </whyMisses>
          <claimChoices>
            <choice>A lamp is meant to be seen.</choice>
            <choice>We are told to become the sun.</choice>
            <choice>Light is only for insiders behind a door.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Jesus uses an ordinary lamp and a city on a hill — public without being proud.</choice>
            <choice>The picture is a command to boast.</choice>
            <choice>A hidden lamp is the point of the saying.</choice>
          </reasonChoices>
        </hold>
      </easy>
      <medium points="12">
        <learn>
          <mediumTeach>Matthew 5:14–16. Jesus uses an ordinary lamp and a city on a hill: a life meant to be seen. Public without being proud — light that helps others see, not a show for its own sake.</mediumTeach>
          <mainIdea>A lamp is meant to be seen.</mainIdea>
          <gloss>A lamp is meant to be seen.</gloss>
          <loci>This idea lives at East porch, with Juniper.</loci>
          <word>
            <term>Lamp</term>
            <sense>a light others can actually see</sense>
          </word>
          <hint>Keep the right pictures. Remove wrong picks.</hint>
        </learn>
        <match>
          <sentenceCorrect>A lamp is meant to be seen.</sentenceCorrect>
          <sentenceMisses>
            <miss>We are told to become the sun.</miss>
            <miss>Light is only for insiders behind a door.</miss>
          </sentenceMisses>
          <placePrompt>That lamp lives on the porch.</placePrompt>
          <personPrompt>Juniper keeps that porch.</personPrompt>
          <ideaPrompt>Juniper’s lamp — a light meant to be seen.</ideaPrompt>
          <ideaLabel>A lamp is meant to be seen.</ideaLabel>
          <whyMedium>Juniper’s lamp is on the porch so today’s line can be seen.</whyMedium>
        </match>
        <hold levelUpTo="hard" onFail="easy">
          <claim>A lamp is meant to be seen.</claim>
          <reason>Jesus uses an ordinary lamp and a city on a hill — public without being proud.</reason>
          <source>Matthew 5:14–16</source>
          <whyCorrect>Jesus uses an ordinary lamp and a city on a hill — public without being proud.</whyCorrect>
          <whyMisses>
            <miss>The picture is a command to boast.</miss>
            <miss>A hidden lamp is the point of the saying.</miss>
          </whyMisses>
          <claimChoices>
            <choice>A lamp is meant to be seen.</choice>
            <choice>We are told to become the sun.</choice>
            <choice>Light is only for insiders behind a door.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Jesus uses an ordinary lamp and a city on a hill — public without being proud.</choice>
            <choice>The picture is a command to boast.</choice>
            <choice>A hidden lamp is the point of the saying.</choice>
          </reasonChoices>
        </hold>
      </medium>
      <hard points="15">
        <learn>
          <hardTeach>Matthew 5:14–16. Jesus used ordinary light to talk about a life that is seen.
“You are the light of the world. A city set on a hill cannot be hidden.” The picture is public without being proud.</hardTeach>
          <fullTeach>Matthew 5:14–16. Jesus used ordinary light to talk about a life that is seen.
“You are the light of the world. A city set on a hill cannot be hidden.” The picture is public without being proud.</fullTeach>
          <prompt>A neighbor leaves a lamp on the porch. Put the picture in order.</prompt>
          <teachOnWrong>The claim is not that we become the sun — only that we do not hide what we have received. Try the order again.</teachOnWrong>
          <challengeTiles>
            <sequenceItem>Evening comes. The street grows dim.</sequenceItem>
            <sequenceItem>Someone sets a lamp where it can be seen.</sequenceItem>
            <sequenceItem>A walker finds the stoop.</sequenceItem>
          </challengeTiles>
        </learn>
        <match>
          <sentenceCorrect>A lamp is meant to be seen.</sentenceCorrect>
          <sentenceMisses>
            <miss>We are told to become the sun.</miss>
            <miss>Light is only for insiders behind a door.</miss>
          </sentenceMisses>
          <placePrompt>That lamp lives on the porch.</placePrompt>
          <personPrompt>Juniper keeps that porch.</personPrompt>
          <ideaPrompt>Juniper’s lamp — a light meant to be seen.</ideaPrompt>
          <ideaLabel>A lamp is meant to be seen.</ideaLabel>
          <whyHard>Juniper Wick keeps the east porch. A lamp is meant to be seen — so the morning line lives at the lamp, where the trail starts.</whyHard>
        </match>
        <hold onFail="easy">
          <claim>A lamp is meant to be seen.</claim>
          <reason>Jesus uses an ordinary lamp and a city on a hill — public without being proud.</reason>
          <source>Matthew 5:14–16</source>
          <whyCorrect>Jesus uses an ordinary lamp and a city on a hill — public without being proud.</whyCorrect>
          <whyMisses>
            <miss>The picture is a command to boast.</miss>
            <miss>A hidden lamp is the point of the saying.</miss>
          </whyMisses>
          <claimChoices>
            <choice>A lamp is meant to be seen.</choice>
            <choice>We are told to become the sun.</choice>
            <choice>Light is only for insiders behind a door.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Jesus uses an ordinary lamp and a city on a hill — public without being proud.</choice>
            <choice>The picture is a command to boast.</choice>
            <choice>A hidden lamp is the point of the saying.</choice>
          </reasonChoices>
        </hold>
      </hard>
      <journal id="" title="" kicker="" unlockAfter="daily-lantern" scoreFromHeldTier="true">
        <p />
        <sources>
          <source />
        </sources>
      </journal>
    </lesson>
    <lesson id="daily-gems" place="East porch" person="Juniper Wick" tripleId="gems-porch" ideaId="idea-gems" ideaLabel="Jesus taught with pictures you can hold." challengeKind="match" challengeTitle="Porch gems">
      <easy points="10" easyOrder="16">
        <learn>
          <shortStory>On the East porch Juniper keeps Jesus pictures you can hold: a lamp meant to be seen, seed that meets different hearts, and a cup poured for many. The Teacher spoke in pictures so the truth could walk around — gift, not wage.</shortStory>
          <mainIdea>Jesus taught with pictures you can hold.</mainIdea>
          <gloss>Jesus taught with pictures you can hold.</gloss>
          <loci>This idea lives at East porch, with Juniper.</loci>
          <word>
            <term>Gift</term>
            <sense>given, not earned as a wage</sense>
          </word>
          <hint>Keep the right pictures. Remove wrong picks.</hint>
        </learn>
        <match>
          <sentenceCorrect>Jesus taught with pictures you can hold.</sentenceCorrect>
          <sentenceMisses>
            <miss>Pictures are only decoration.</miss>
            <miss>Mercy is a wage you finish earning.</miss>
          </sentenceMisses>
          <placePrompt>That lamp lives on the porch.</placePrompt>
          <personPrompt>Juniper keeps that porch.</personPrompt>
          <ideaPrompt>Juniper’s morning pictures — lamp, seed, and cup you can hold.</ideaPrompt>
          <ideaLabel>Jesus taught with pictures you can hold.</ideaLabel>
          <whyEasy>Juniper’s lamp is on the porch. Jesus taught with pictures you can hold.</whyEasy>
        </match>
        <hold levelUpTo="medium" onFail="easy">
          <claim>Jesus taught with pictures you can hold.</claim>
          <reason>A lamp is seen, seed meets different hearts, and the cup is poured for many — gift, not wage.</reason>
          <source>Matthew 5; Mark 4; Matthew 26:28; Luke 22:20</source>
          <whyCorrect>A lamp is seen, seed meets different hearts, and the cup is poured for many — gift, not wage.</whyCorrect>
          <whyMisses>
            <miss>Every heart is the same soil.</miss>
            <miss>A hidden lamp is the point.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Jesus taught with pictures you can hold.</choice>
            <choice>Pictures are only decoration.</choice>
            <choice>Mercy is a wage you finish earning.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>A lamp is seen, seed meets different hearts, and the cup is poured for many — gift, not wage.</choice>
            <choice>Every heart is the same soil.</choice>
            <choice>A hidden lamp is the point.</choice>
          </reasonChoices>
        </hold>
      </easy>
      <medium points="12">
        <learn>
          <mediumTeach>Jesus taught with pictures you can hold: lamp, seed, and a cup poured for many. The Teacher spoke so the truth could walk around inside you — gift, not wage. Keep the pictures; do not flatten them into slogans.</mediumTeach>
          <mainIdea>Jesus taught with pictures you can hold.</mainIdea>
          <gloss>Jesus taught with pictures you can hold.</gloss>
          <loci>This idea lives at East porch, with Juniper.</loci>
          <word>
            <term>Gift</term>
            <sense>given, not earned as a wage</sense>
          </word>
          <hint>Keep the right pictures. Remove wrong picks.</hint>
        </learn>
        <match>
          <sentenceCorrect>Jesus taught with pictures you can hold.</sentenceCorrect>
          <sentenceMisses>
            <miss>Pictures are only decoration.</miss>
            <miss>Mercy is a wage you finish earning.</miss>
          </sentenceMisses>
          <placePrompt>That lamp lives on the porch.</placePrompt>
          <personPrompt>Juniper keeps that porch.</personPrompt>
          <ideaPrompt>Juniper’s morning pictures — lamp, seed, and cup you can hold.</ideaPrompt>
          <ideaLabel>Jesus taught with pictures you can hold.</ideaLabel>
          <whyMedium>Juniper’s lamp is on the porch. Jesus taught with pictures you can hold.</whyMedium>
        </match>
        <hold levelUpTo="hard" onFail="easy">
          <claim>Jesus taught with pictures you can hold.</claim>
          <reason>A lamp is seen, seed meets different hearts, and the cup is poured for many — gift, not wage.</reason>
          <source>Matthew 5; Mark 4; Matthew 26:28; Luke 22:20</source>
          <whyCorrect>A lamp is seen, seed meets different hearts, and the cup is poured for many — gift, not wage.</whyCorrect>
          <whyMisses>
            <miss>Every heart is the same soil.</miss>
            <miss>A hidden lamp is the point.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Jesus taught with pictures you can hold.</choice>
            <choice>Pictures are only decoration.</choice>
            <choice>Mercy is a wage you finish earning.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>A lamp is seen, seed meets different hearts, and the cup is poured for many — gift, not wage.</choice>
            <choice>Every heart is the same soil.</choice>
            <choice>A hidden lamp is the point.</choice>
          </reasonChoices>
        </hold>
      </medium>
      <hard points="15">
        <learn>
          <hardTeach>The Teacher spoke in pictures so the truth could walk around inside you.
Jesus taught with lamps, seed, and a cup. The cup of the new covenant is poured for many (Matthew 26:28; Luke 22:20) — gift, not wage.</hardTeach>
          <fullTeach>The Teacher spoke in pictures so the truth could walk around inside you.
Jesus taught with lamps, seed, and a cup. The cup of the new covenant is poured for many (Matthew 26:28; Luke 22:20) — gift, not wage.</fullTeach>
          <prompt>Match each picture to the short claim.</prompt>
          <teachOnWrong>Each gem is a short true claim. Snap the picture to its sentence.</teachOnWrong>
          <challengeTiles>
            <pair>
              <left>Lamp</left>
              <right>A light is meant to be seen</right>
            </pair>
            <pair>
              <left>Seed</left>
              <right>The same word meets different hearts</right>
            </pair>
            <pair>
              <left>Cup</left>
              <right>Poured for many — gift, not wage</right>
            </pair>
          </challengeTiles>
        </learn>
        <match>
          <sentenceCorrect>Jesus taught with pictures you can hold.</sentenceCorrect>
          <sentenceMisses>
            <miss>Pictures are only decoration.</miss>
            <miss>Mercy is a wage you finish earning.</miss>
          </sentenceMisses>
          <placePrompt>That lamp lives on the porch.</placePrompt>
          <personPrompt>Juniper keeps that porch.</personPrompt>
          <ideaPrompt>Juniper’s morning pictures — lamp, seed, and cup you can hold.</ideaPrompt>
          <ideaLabel>Jesus taught with pictures you can hold.</ideaLabel>
          <whyHard>Juniper Wick keeps the east porch. Lamp, seed, and cup are pictures you can hold — gift, not wage.</whyHard>
        </match>
        <hold onFail="easy">
          <claim>Jesus taught with pictures you can hold.</claim>
          <reason>A lamp is seen, seed meets different hearts, and the cup is poured for many — gift, not wage.</reason>
          <source>Matthew 5; Mark 4; Matthew 26:28; Luke 22:20</source>
          <whyCorrect>A lamp is seen, seed meets different hearts, and the cup is poured for many — gift, not wage.</whyCorrect>
          <whyMisses>
            <miss>Every heart is the same soil.</miss>
            <miss>A hidden lamp is the point.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Jesus taught with pictures you can hold.</choice>
            <choice>Pictures are only decoration.</choice>
            <choice>Mercy is a wage you finish earning.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>A lamp is seen, seed meets different hearts, and the cup is poured for many — gift, not wage.</choice>
            <choice>Every heart is the same soil.</choice>
            <choice>A hidden lamp is the point.</choice>
          </reasonChoices>
        </hold>
      </hard>
      <journal id="" title="" kicker="" unlockAfter="daily-gems" scoreFromHeldTier="true">
        <p />
        <sources>
          <source />
        </sources>
      </journal>
    </lesson>
    <lesson id="daily-seed" place="East porch" person="Juniper Wick" tripleId="seed-porch" ideaId="idea-seed" ideaLabel="The same word meets different soils." challengeKind="sort" challengeTitle="A handful of seed">
      <easy points="10" easyOrder="17">
        <learn>
          <shortStory>Jesus tells about a sower. The same word lands on different soils — path, rocks, thorns, and good ground. Some seed is lost. The story invites hearing; it does not flatter every field.</shortStory>
          <mainIdea>The same word meets different soils; some seed is lost.</mainIdea>
          <gloss>The same word meets different soils. Some seed is lost.</gloss>
          <loci>This idea lives at East porch, with Juniper.</loci>
          <word>
            <term>Parable</term>
            <sense>a Jesus story that asks you to decide</sense>
          </word>
          <hint>Keep the honest field. Toss “every field wins.”</hint>
        </learn>
        <match>
          <sentenceCorrect>The same word meets different soils; some seed is lost.</sentenceCorrect>
          <sentenceMisses>
            <miss>Every field is guaranteed a harvest.</miss>
            <miss>Lost seed means the sower failed.</miss>
          </sentenceMisses>
          <placePrompt>That lamp lives on the porch.</placePrompt>
          <personPrompt>Juniper keeps that porch.</personPrompt>
          <ideaPrompt>Juniper’s seed — the same word meets different soils.</ideaPrompt>
          <ideaLabel>The same word meets different soils.</ideaLabel>
          <whyEasy>Juniper’s lamp is on the porch. The same word meets different soils.</whyEasy>
        </match>
        <hold levelUpTo="medium" onFail="easy">
          <claim>The same word meets different soils; some seed is lost.</claim>
          <reason>The parable invites hearing; it does not flatter every field.</reason>
          <source>Mark 4:1–9</source>
          <whyCorrect>The parable invites hearing; it does not flatter every field.</whyCorrect>
          <whyMisses>
            <miss>Good soil is a slogan, not a way of hearing.</miss>
            <miss>Jesus never names withering or birds.</miss>
          </whyMisses>
          <claimChoices>
            <choice>The same word meets different soils; some seed is lost.</choice>
            <choice>Every field is guaranteed a harvest.</choice>
            <choice>Lost seed means the sower failed.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>The parable invites hearing; it does not flatter every field.</choice>
            <choice>Good soil is a slogan, not a way of hearing.</choice>
            <choice>Jesus never names withering or birds.</choice>
          </reasonChoices>
        </hold>
      </easy>
      <medium points="12">
        <learn>
          <mediumTeach>Mark 4:1–9. The same word meets different soils — path, rocks, thorns, good ground. Some seed is lost. “He who has ears to hear, let him hear.” The story asks for a kind of soil, not a slogan that flatters every field.</mediumTeach>
          <mainIdea>The same word meets different soils; some seed is lost.</mainIdea>
          <gloss>The same word meets different soils. Some seed is lost.</gloss>
          <loci>This idea lives at East porch, with Juniper.</loci>
          <word>
            <term>Parable</term>
            <sense>a Jesus story that asks you to decide</sense>
          </word>
          <hint>Keep the honest field. Toss “every field wins.”</hint>
        </learn>
        <match>
          <sentenceCorrect>The same word meets different soils; some seed is lost.</sentenceCorrect>
          <sentenceMisses>
            <miss>Every field is guaranteed a harvest.</miss>
            <miss>Lost seed means the sower failed.</miss>
          </sentenceMisses>
          <placePrompt>That lamp lives on the porch.</placePrompt>
          <personPrompt>Juniper keeps that porch.</personPrompt>
          <ideaPrompt>Juniper’s seed — the same word meets different soils.</ideaPrompt>
          <ideaLabel>The same word meets different soils.</ideaLabel>
          <whyMedium>Juniper’s lamp is on the porch. The same word meets different soils.</whyMedium>
        </match>
        <hold levelUpTo="hard" onFail="easy">
          <claim>The same word meets different soils; some seed is lost.</claim>
          <reason>The parable invites hearing; it does not flatter every field.</reason>
          <source>Mark 4:1–9</source>
          <whyCorrect>The parable invites hearing; it does not flatter every field.</whyCorrect>
          <whyMisses>
            <miss>Good soil is a slogan, not a way of hearing.</miss>
            <miss>Jesus never names withering or birds.</miss>
          </whyMisses>
          <claimChoices>
            <choice>The same word meets different soils; some seed is lost.</choice>
            <choice>Every field is guaranteed a harvest.</choice>
            <choice>Lost seed means the sower failed.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>The parable invites hearing; it does not flatter every field.</choice>
            <choice>Good soil is a slogan, not a way of hearing.</choice>
            <choice>Jesus never names withering or birds.</choice>
          </reasonChoices>
        </hold>
      </medium>
      <hard points="15">
        <learn>
          <hardTeach>Mark 4:1–9. The parable does not flatter every listener. Some seed is lost.
“He who has ears to hear, let him hear.” The story asks for a kind of soil, not a slogan.</hardTeach>
          <fullTeach>Mark 4:1–9. The parable does not flatter every listener. Some seed is lost.
“He who has ears to hear, let him hear.” The story asks for a kind of soil, not a slogan.</fullTeach>
          <prompt>Which lines belong with Jesus’ picture of seed and soil?</prompt>
          <teachOnWrong>Jesus names loss and hearing in the same breath. The invitation is still to hear — not a promise that every soil is the same.</teachOnWrong>
          <challengeTiles>
            <keep>Some seed is eaten before it roots.</keep>
            <keep>Good soil hears and holds the word.</keep>
            <keep>Shallow ground withers under heat.</keep>
            <discard>Every field is guaranteed a harvest.</discard>
          </challengeTiles>
        </learn>
        <match>
          <sentenceCorrect>The same word meets different soils; some seed is lost.</sentenceCorrect>
          <sentenceMisses>
            <miss>Every field is guaranteed a harvest.</miss>
            <miss>Lost seed means the sower failed.</miss>
          </sentenceMisses>
          <placePrompt>That lamp lives on the porch.</placePrompt>
          <personPrompt>Juniper keeps that porch.</personPrompt>
          <ideaPrompt>Juniper’s seed — the same word meets different soils.</ideaPrompt>
          <ideaLabel>The same word meets different soils.</ideaLabel>
          <whyHard>Juniper Wick keeps the east porch. The parable invites hearing; it does not flatter every field.</whyHard>
        </match>
        <hold onFail="easy">
          <claim>The same word meets different soils; some seed is lost.</claim>
          <reason>The parable invites hearing; it does not flatter every field.</reason>
          <source>Mark 4:1–9</source>
          <whyCorrect>The parable invites hearing; it does not flatter every field.</whyCorrect>
          <whyMisses>
            <miss>Good soil is a slogan, not a way of hearing.</miss>
            <miss>Jesus never names withering or birds.</miss>
          </whyMisses>
          <claimChoices>
            <choice>The same word meets different soils; some seed is lost.</choice>
            <choice>Every field is guaranteed a harvest.</choice>
            <choice>Lost seed means the sower failed.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>The parable invites hearing; it does not flatter every field.</choice>
            <choice>Good soil is a slogan, not a way of hearing.</choice>
            <choice>Jesus never names withering or birds.</choice>
          </reasonChoices>
        </hold>
      </hard>
      <journal id="" title="" kicker="" unlockAfter="daily-seed" scoreFromHeldTier="true">
        <p />
        <sources>
          <source />
        </sources>
      </journal>
    </lesson>
    <lesson id="daily-neighbor" place="East porch" person="Juniper Wick" tripleId="neighbor-porch" ideaId="idea-neighbor" ideaLabel="Mercy makes a neighbor." challengeKind="build-argument" challengeTitle="Who is near">
      <easy points="10" easyOrder="18">
        <learn>
          <shortStory>On the porch Juniper retells the road story. Jesus asks who proved to be a neighbor — and the answer is the one who showed mercy, not the one with the right pedigree.</shortStory>
          <mainIdea>Mercy makes a neighbor; pedigree does not.</mainIdea>
          <gloss>Mercy makes a neighbor. Pedigree does not.</gloss>
          <loci>This idea lives at East porch, with Juniper.</loci>
          <word>
            <term>Pedigree</term>
            <sense>family name or in-group badge</sense>
          </word>
          <hint>Keep mercy. Toss “already my people.”</hint>
        </learn>
        <match>
          <sentenceCorrect>Mercy makes a neighbor; pedigree does not.</sentenceCorrect>
          <sentenceMisses>
            <miss>The priest who passed by is the measure.</miss>
            <miss>Neighbor is settled before anyone crosses the road.</miss>
          </sentenceMisses>
          <placePrompt>That lamp lives on the porch.</placePrompt>
          <personPrompt>Juniper keeps that porch.</personPrompt>
          <ideaPrompt>Juniper’s porch line — mercy makes a neighbor.</ideaPrompt>
          <ideaLabel>Mercy makes a neighbor.</ideaLabel>
          <whyEasy>Juniper’s lamp is on the porch. Mercy makes a neighbor.</whyEasy>
        </match>
        <hold levelUpTo="medium" onFail="easy">
          <claim>Mercy makes a neighbor; pedigree does not.</claim>
          <reason>Jesus asks who *proved* to be a neighbor — the one who showed mercy.</reason>
          <source>Luke 10:36–37</source>
          <whyCorrect>Jesus asks who *proved* to be a neighbor — the one who showed mercy.</whyCorrect>
          <whyMisses>
            <miss>Mercy is unrelated to the question.</miss>
            <miss>The wounded man must first classify the helper.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Mercy makes a neighbor; pedigree does not.</choice>
            <choice>The priest who passed by is the measure.</choice>
            <choice>Neighbor is settled before anyone crosses the road.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Jesus asks who *proved* to be a neighbor — the one who showed mercy.</choice>
            <choice>Mercy is unrelated to the question.</choice>
            <choice>The wounded man must first classify the helper.</choice>
          </reasonChoices>
        </hold>
      </easy>
      <medium points="12">
        <learn>
          <mediumTeach>Luke 10:36–37. Jesus turns “who is my neighbor?” around. Mercy makes a neighbor; pedigree does not. “The one who showed him mercy… Go and do likewise.” Compassion is the measure.</mediumTeach>
          <mainIdea>Mercy makes a neighbor; pedigree does not.</mainIdea>
          <gloss>Mercy makes a neighbor. Pedigree does not.</gloss>
          <loci>This idea lives at East porch, with Juniper.</loci>
          <word>
            <term>Pedigree</term>
            <sense>family name or in-group badge</sense>
          </word>
          <hint>Keep mercy. Toss “already my people.”</hint>
        </learn>
        <match>
          <sentenceCorrect>Mercy makes a neighbor; pedigree does not.</sentenceCorrect>
          <sentenceMisses>
            <miss>The priest who passed by is the measure.</miss>
            <miss>Neighbor is settled before anyone crosses the road.</miss>
          </sentenceMisses>
          <placePrompt>That lamp lives on the porch.</placePrompt>
          <personPrompt>Juniper keeps that porch.</personPrompt>
          <ideaPrompt>Juniper’s porch line — mercy makes a neighbor.</ideaPrompt>
          <ideaLabel>Mercy makes a neighbor.</ideaLabel>
          <whyMedium>Juniper’s lamp is on the porch. Mercy makes a neighbor.</whyMedium>
        </match>
        <hold levelUpTo="hard" onFail="easy">
          <claim>Mercy makes a neighbor; pedigree does not.</claim>
          <reason>Jesus asks who *proved* to be a neighbor — the one who showed mercy.</reason>
          <source>Luke 10:36–37</source>
          <whyCorrect>Jesus asks who *proved* to be a neighbor — the one who showed mercy.</whyCorrect>
          <whyMisses>
            <miss>Mercy is unrelated to the question.</miss>
            <miss>The wounded man must first classify the helper.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Mercy makes a neighbor; pedigree does not.</choice>
            <choice>The priest who passed by is the measure.</choice>
            <choice>Neighbor is settled before anyone crosses the road.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Jesus asks who *proved* to be a neighbor — the one who showed mercy.</choice>
            <choice>Mercy is unrelated to the question.</choice>
            <choice>The wounded man must first classify the helper.</choice>
          </reasonChoices>
        </hold>
      </medium>
      <hard points="15">
        <learn>
          <hardTeach>Luke 10:36–37. The question “who is my neighbor?” is turned around. Mercy makes a neighbor.
He said, “The one who showed him mercy.” And Jesus said, “You go, and do likewise.”</hardTeach>
          <fullTeach>Luke 10:36–37. The question “who is my neighbor?” is turned around. Mercy makes a neighbor.
He said, “The one who showed him mercy.” And Jesus said, “You go, and do likewise.”</fullTeach>
          <prompt>Build the Samaritan’s answer from the stones provided.</prompt>
          <teachOnWrong>Jesus asks which man *proved* to be a neighbor. Mercy, not pedigree, is the measure. Leave the decoy in the bank.</teachOnWrong>
          <challengeTiles />
        </learn>
        <match>
          <sentenceCorrect>Mercy makes a neighbor; pedigree does not.</sentenceCorrect>
          <sentenceMisses>
            <miss>The priest who passed by is the measure.</miss>
            <miss>Neighbor is settled before anyone crosses the road.</miss>
          </sentenceMisses>
          <placePrompt>That lamp lives on the porch.</placePrompt>
          <personPrompt>Juniper keeps that porch.</personPrompt>
          <ideaPrompt>Juniper’s porch line — mercy makes a neighbor.</ideaPrompt>
          <ideaLabel>Mercy makes a neighbor.</ideaLabel>
          <whyHard>Juniper Wick keeps the east porch. Mercy makes a neighbor; pedigree does not — the morning lamp holds that line.</whyHard>
        </match>
        <hold onFail="easy">
          <claim>Mercy makes a neighbor; pedigree does not.</claim>
          <reason>Jesus asks who *proved* to be a neighbor — the one who showed mercy.</reason>
          <source>Luke 10:36–37</source>
          <whyCorrect>Jesus asks who *proved* to be a neighbor — the one who showed mercy.</whyCorrect>
          <whyMisses>
            <miss>Mercy is unrelated to the question.</miss>
            <miss>The wounded man must first classify the helper.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Mercy makes a neighbor; pedigree does not.</choice>
            <choice>The priest who passed by is the measure.</choice>
            <choice>Neighbor is settled before anyone crosses the road.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Jesus asks who *proved* to be a neighbor — the one who showed mercy.</choice>
            <choice>Mercy is unrelated to the question.</choice>
            <choice>The wounded man must first classify the helper.</choice>
          </reasonChoices>
        </hold>
      </hard>
      <journal id="" title="" kicker="" unlockAfter="daily-neighbor" scoreFromHeldTier="true">
        <p />
        <sources>
          <source />
        </sources>
      </journal>
    </lesson>
  </lessons>
  <streetFacts>
    <fact evidenceId="ph-road" tripleId="mercy-hollow" ideaId="idea-mercy" place="Story Creek" person="Mercy Wren" ideaLabel="Neighbor is the one who shows mercy." />
    <fact evidenceId="ph-father" tripleId="father-hollow" ideaId="idea-father" place="Story Creek" person="Mercy Wren" ideaLabel="The father runs with mercy before the speech is done." />
    <fact evidenceId="ph-seeds" tripleId="seeds-hollow" ideaId="idea-seeds" place="Story Creek" person="Mercy Wren" ideaLabel="The kingdom arrives in pictures." />
    <fact evidenceId="ph-debt" tripleId="debt-hollow" ideaId="idea-debt" place="Story Creek" person="Mercy Wren" ideaLabel="Received mercy makes refusing mercy a contradiction." />
    <fact evidenceId="daily-lantern" tripleId="juniper-porch" ideaId="idea-juniper" place="East porch" person="Juniper Wick" ideaLabel="A lamp is meant to be seen." />
    <fact evidenceId="daily-gems" tripleId="gems-porch" ideaId="idea-gems" place="East porch" person="Juniper Wick" ideaLabel="Jesus taught with pictures you can hold." />
    <fact evidenceId="daily-seed" tripleId="seed-porch" ideaId="idea-seed" place="East porch" person="Juniper Wick" ideaLabel="The same word meets different soils." />
    <fact evidenceId="daily-neighbor" tripleId="neighbor-porch" ideaId="idea-neighbor" place="East porch" person="Juniper Wick" ideaLabel="Mercy makes a neighbor." />
  </streetFacts>
</areaPack>
`,"witness-bench.xml":`<?xml version="1.0" encoding="UTF-8"?>
<areaPack id="witness-bench" schemaVersion="3" appVersion="1.4.50" generated="2026-09-14T13:15:00-05:00" host="https://cphillippe.github.io/Silver-dollar-city/" title="Witness Square" place="Witness Square" person="Silas Whitman" personId="silas" plotId="bench">
  <howToEdit>RUNTIME CONTENT: the game loads this file as the source of truth for this area. Change player-facing text in place inside each &lt;lesson&gt;. Stable id attributes (ph-father, …) are engine keys — do not rename without a migration. Three tiers per fact: &lt;easy easyOrder="N"&gt;, &lt;medium&gt;, and &lt;hard&gt; — each with &lt;learn&gt;, &lt;match&gt;, and &lt;hold&gt;. Easy Learn: shortStory/mainIdea/loci. Medium Learn: mediumTeach (clearer than Hard, richer than Easy). Hard Learn: hardTeach/fullTeach. Held claim·reason·source stay plain and identical on all three. Hold level-up: see hold @levelUpTo / @onFail and index &lt;holdRules&gt;. Empty optional elements are intentional. Escape &amp; &lt; &gt; in text.</howToEdit>
  <meta>
    <title>Silver City — Witness Square</title>
    <subtitle>Public names and early reports</subtitle>
    <blurb>A ledger hall of names: died, buried, raised, appeared.</blurb>
    <notes>Runtime/build content pack. Engine maps lesson fields 1:1 to Learn / Match / Hold / Journal / street.</notes>
  </meta>
  <easyShelf order="wb-creed,wb-women,wb-early,wb-method,daily-names,daily-creed,daily-empty">
    <line id="wb-creed" easyOrder="4">wb-creed</line>
    <line id="wb-women" easyOrder="5">wb-women</line>
    <line id="wb-early" easyOrder="11">wb-early</line>
    <line id="wb-method" easyOrder="12">wb-method</line>
    <line id="daily-names" easyOrder="13">daily-names</line>
    <line id="daily-creed" easyOrder="14">daily-creed</line>
    <line id="daily-empty" easyOrder="15">daily-empty</line>
  </easyShelf>
  <lessons>
    <lesson id="wb-creed" place="Witness Square" person="Silas Whitman" tripleId="silas-bench" ideaId="idea-silas" ideaLabel="Died, buried, raised, appeared." challengeKind="sequence" challengeTitle="What Paul received">
      <easy points="10" easyOrder="4">
        <learn>
          <shortStory>This is not Paul’s private dream. He says the churches were already saying it: Christ died, was buried, was raised, and was seen.</shortStory>
          <mainIdea>Paul hands on an early public creed: died, buried, raised, appeared.</mainIdea>
          <gloss>Paul hands on an old shared belief: died, buried, raised, appeared.</gloss>
          <loci>This idea lives at Witness Square, with Silas.</loci>
          <word>
            <term>Creed</term>
            <sense>an old shared belief the churches already said out loud</sense>
          </word>
          <hint>Death, burial, raising, appearances — in that order.</hint>
        </learn>
        <match>
          <sentenceCorrect>Paul hands on an early public creed: died, buried, raised, appeared.</sentenceCorrect>
          <sentenceMisses>
            <miss>The creed is Paul’s private dream from decades later.</miss>
            <miss>Paul invented the formula on the spot in Corinth.</miss>
          </sentenceMisses>
          <placePrompt>Those names sit at the square.</placePrompt>
          <personPrompt>Silas keeps that square.</personPrompt>
          <ideaPrompt>Silas’s public names — died, buried, raised, appeared.</ideaPrompt>
          <ideaLabel>Died, buried, raised, appeared.</ideaLabel>
          <whyEasy>Silas copies names at the square. The old shared belief — died, buried, raised — sits with the public names.</whyEasy>
        </match>
        <hold levelUpTo="medium" onFail="easy">
          <claim>Paul hands on an early public creed: died, buried, raised, appeared.</claim>
          <reason>Burial resists a merely “spiritual” death; appearances resist a merely “spiritual” raising.</reason>
          <source>1 Corinthians 15:3–8</source>
          <whyCorrect>Burial resists a merely “spiritual” death; appearances resist a merely “spiritual” raising.</whyCorrect>
          <whyMisses>
            <miss>“Buried” is only poetic decoration.</miss>
            <miss>Appearances are admitted to be visions with no named people.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Paul hands on an early public creed: died, buried, raised, appeared.</choice>
            <choice>The creed is Paul’s private dream from decades later.</choice>
            <choice>Paul invented the formula on the spot in Corinth.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Burial resists a merely “spiritual” death; appearances resist a merely “spiritual” raising.</choice>
            <choice>“Buried” is only poetic decoration.</choice>
            <choice>Appearances are admitted to be visions with no named people.</choice>
          </reasonChoices>
        </hold>
      </easy>
      <medium points="12">
        <learn>
          <mediumTeach>1 Corinthians 15:3–5. Paul hands on what the churches were already saying: Christ died, was buried, was raised, and appeared. He presents it as received “of first importance” — a public creed, not a private dream from a later age.</mediumTeach>
          <mainIdea>Paul hands on an early public creed: died, buried, raised, appeared.</mainIdea>
          <gloss>Paul hands on an old shared belief: died, buried, raised, appeared.</gloss>
          <loci>This idea lives at Witness Square, with Silas.</loci>
          <word>
            <term>Creed</term>
            <sense>an old shared belief the churches already said out loud</sense>
          </word>
          <hint>Death, burial, raising, appearances — in that order.</hint>
        </learn>
        <match>
          <sentenceCorrect>Paul hands on an early public creed: died, buried, raised, appeared.</sentenceCorrect>
          <sentenceMisses>
            <miss>The creed is Paul’s private dream from decades later.</miss>
            <miss>Paul invented the formula on the spot in Corinth.</miss>
          </sentenceMisses>
          <placePrompt>Those names sit at the square.</placePrompt>
          <personPrompt>Silas keeps that square.</personPrompt>
          <ideaPrompt>Silas’s public names — died, buried, raised, appeared.</ideaPrompt>
          <ideaLabel>Died, buried, raised, appeared.</ideaLabel>
          <whyMedium>Silas copies names at the square. The old shared belief — died, buried, raised — sits with the public names.</whyMedium>
        </match>
        <hold levelUpTo="hard" onFail="easy">
          <claim>Paul hands on an early public creed: died, buried, raised, appeared.</claim>
          <reason>Burial resists a merely “spiritual” death; appearances resist a merely “spiritual” raising.</reason>
          <source>1 Corinthians 15:3–8</source>
          <whyCorrect>Burial resists a merely “spiritual” death; appearances resist a merely “spiritual” raising.</whyCorrect>
          <whyMisses>
            <miss>“Buried” is only poetic decoration.</miss>
            <miss>Appearances are admitted to be visions with no named people.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Paul hands on an early public creed: died, buried, raised, appeared.</choice>
            <choice>The creed is Paul’s private dream from decades later.</choice>
            <choice>Paul invented the formula on the spot in Corinth.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Burial resists a merely “spiritual” death; appearances resist a merely “spiritual” raising.</choice>
            <choice>“Buried” is only poetic decoration.</choice>
            <choice>Appearances are admitted to be visions with no named people.</choice>
          </reasonChoices>
        </hold>
      </medium>
      <hard points="15">
        <learn>
          <hardTeach>1 Corinthians 15:3–5. Paul is writing to a church he founded, likely in the mid-50s AD. He presents this not as a new idea but as a received formula “of first importance.”
Verses 6–8 widen the circle: more than five hundred, James, “all the apostles,” and last of all Paul. A creed is not a video. It is a public, early summary of what the churches were already saying.</hardTeach>
          <fullTeach>1 Corinthians 15:3–5. Paul is writing to a church he founded, likely in the mid-50s AD. He presents this not as a new idea but as a received formula “of first importance.”
Verses 6–8 widen the circle: more than five hundred, James, “all the apostles,” and last of all Paul. A creed is not a video. It is a public, early summary of what the churches were already saying.</fullTeach>
          <prompt>Order the core of the tradition Paul says he “delivered” and “received.”</prompt>
          <teachOnWrong>Paul’s wording is tightly patterned: death, burial, raising, appearances (1 Cor 15:3–5). Burial underlines that death was real; appearances underlines that “raised” is not only a metaphor.</teachOnWrong>
          <challengeTiles />
        </learn>
        <match>
          <sentenceCorrect>Paul hands on an early public creed: died, buried, raised, appeared.</sentenceCorrect>
          <sentenceMisses>
            <miss>The creed is Paul’s private dream from decades later.</miss>
            <miss>Paul invented the formula on the spot in Corinth.</miss>
          </sentenceMisses>
          <placePrompt>Those names sit at the square.</placePrompt>
          <personPrompt>Silas keeps that square.</personPrompt>
          <ideaPrompt>Silas’s public names — died, buried, raised, appeared.</ideaPrompt>
          <ideaLabel>Died, buried, raised, appeared.</ideaLabel>
          <whyHard>Silas Whitman keeps Witness Square. Died, buried, raised, appeared is a public creed. It belongs in a ledger hall, not under the oaks.</whyHard>
        </match>
        <hold onFail="easy">
          <claim>Paul hands on an early public creed: died, buried, raised, appeared.</claim>
          <reason>Burial resists a merely “spiritual” death; appearances resist a merely “spiritual” raising.</reason>
          <source>1 Corinthians 15:3–8</source>
          <whyCorrect>Burial resists a merely “spiritual” death; appearances resist a merely “spiritual” raising.</whyCorrect>
          <whyMisses>
            <miss>“Buried” is only poetic decoration.</miss>
            <miss>Appearances are admitted to be visions with no named people.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Paul hands on an early public creed: died, buried, raised, appeared.</choice>
            <choice>The creed is Paul’s private dream from decades later.</choice>
            <choice>Paul invented the formula on the spot in Corinth.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Burial resists a merely “spiritual” death; appearances resist a merely “spiritual” raising.</choice>
            <choice>“Buried” is only poetic decoration.</choice>
            <choice>Appearances are admitted to be visions with no named people.</choice>
          </reasonChoices>
        </hold>
      </hard>
      <journal id="j-wb-1" title="Of first importance" kicker="Witness Square" unlockAfter="wb-creed" scoreFromHeldTier="true">
        <p>1 Corinthians 15:3–5 is a compressed public claim: death, burial, raising, appearances. Paul presents it as received tradition, not as a private dream. Burial resists a merely “spiritual” death; appearances resist a merely “spiritual” raising.</p>
        <p>This is what the churches were already handing on when Paul wrote — a mid-first-century letter appealing to a still-earlier formula.</p>
        <sources>
          <source>1 Corinthians 15:3–8</source>
        </sources>
      </journal>
    </lesson>
    <lesson id="wb-early" place="Witness Square" person="Silas Whitman" tripleId="early-bench" ideaId="idea-early" ideaLabel="The claim sits close to the events." challengeKind="sort" challengeTitle="Why historians call it early">
      <easy points="10" easyOrder="11">
        <learn>
          <shortStory>Paul wrote in the mid-first century. He says he received this core and passed it on. That is close to the events — not a monk’s later add-on.</shortStory>
          <mainIdea>The resurrection claim sits close to the events, not as a late legend.</mainIdea>
          <gloss>That old shared belief is early testimony, not a medieval insert.</gloss>
          <loci>This idea lives at Witness Square, with Silas.</loci>
          <word>
            <term>Testimony</term>
            <sense>a report from people who claim to have seen</sense>
          </word>
          <hint>Keep “received and delivered.” Toss lab-proof talk.</hint>
        </learn>
        <match>
          <sentenceCorrect>The resurrection claim sits close to the events, not as a late legend.</sentenceCorrect>
          <sentenceMisses>
            <miss>Early is the same as laboratory proof.</miss>
            <miss>No first-century writer claims to have asked witnesses.</miss>
          </sentenceMisses>
          <placePrompt>Those names sit at the square.</placePrompt>
          <personPrompt>Silas keeps that square.</personPrompt>
          <ideaPrompt>Silas’s public names — the claim sits close to the events.</ideaPrompt>
          <ideaLabel>The claim sits close to the events.</ideaLabel>
          <whyEasy>Silas keeps the square. The claim sits close to the events — not a late legend.</whyEasy>
        </match>
        <hold levelUpTo="medium" onFail="easy">
          <claim>The resurrection claim sits close to the events, not as a late legend.</claim>
          <reason>Paul quotes a received formula and names known people; Luke claims inquiry among witnesses.</reason>
          <source>1 Corinthians 15:3–7; Luke 1:1–4</source>
          <whyCorrect>Paul quotes a received formula and names known people; Luke claims inquiry among witnesses.</whyCorrect>
          <whyMisses>
            <miss>Named people make a report less testable.</miss>
            <miss>Distance in time is the only historical question that matters.</miss>
          </whyMisses>
          <claimChoices>
            <choice>The resurrection claim sits close to the events, not as a late legend.</choice>
            <choice>Early is the same as laboratory proof.</choice>
            <choice>No first-century writer claims to have asked witnesses.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Paul quotes a received formula and names known people; Luke claims inquiry among witnesses.</choice>
            <choice>Named people make a report less testable.</choice>
            <choice>Distance in time is the only historical question that matters.</choice>
          </reasonChoices>
        </hold>
      </easy>
      <medium points="12">
        <learn>
          <mediumTeach>1 Corinthians 15:3–5. Paul wrote in the mid-first century and says he received and delivered this core. The resurrection claim sits close to the events — early public testimony, not a monk’s late legend.</mediumTeach>
          <mainIdea>The resurrection claim sits close to the events, not as a late legend.</mainIdea>
          <gloss>That old shared belief is early testimony, not a medieval insert.</gloss>
          <loci>This idea lives at Witness Square, with Silas.</loci>
          <word>
            <term>Testimony</term>
            <sense>a report from people who claim to have seen</sense>
          </word>
          <hint>Keep “received and delivered.” Toss lab-proof talk.</hint>
        </learn>
        <match>
          <sentenceCorrect>The resurrection claim sits close to the events, not as a late legend.</sentenceCorrect>
          <sentenceMisses>
            <miss>Early is the same as laboratory proof.</miss>
            <miss>No first-century writer claims to have asked witnesses.</miss>
          </sentenceMisses>
          <placePrompt>Those names sit at the square.</placePrompt>
          <personPrompt>Silas keeps that square.</personPrompt>
          <ideaPrompt>Silas’s public names — the claim sits close to the events.</ideaPrompt>
          <ideaLabel>The claim sits close to the events.</ideaLabel>
          <whyMedium>Silas keeps the square. The claim sits close to the events — not a late legend.</whyMedium>
        </match>
        <hold levelUpTo="hard" onFail="easy">
          <claim>The resurrection claim sits close to the events, not as a late legend.</claim>
          <reason>Paul quotes a received formula and names known people; Luke claims inquiry among witnesses.</reason>
          <source>1 Corinthians 15:3–7; Luke 1:1–4</source>
          <whyCorrect>Paul quotes a received formula and names known people; Luke claims inquiry among witnesses.</whyCorrect>
          <whyMisses>
            <miss>Named people make a report less testable.</miss>
            <miss>Distance in time is the only historical question that matters.</miss>
          </whyMisses>
          <claimChoices>
            <choice>The resurrection claim sits close to the events, not as a late legend.</choice>
            <choice>Early is the same as laboratory proof.</choice>
            <choice>No first-century writer claims to have asked witnesses.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Paul quotes a received formula and names known people; Luke claims inquiry among witnesses.</choice>
            <choice>Named people make a report less testable.</choice>
            <choice>Distance in time is the only historical question that matters.</choice>
          </reasonChoices>
        </hold>
      </medium>
      <hard points="15">
        <learn>
          <hardTeach>1 Corinthians 15:3–5. Paul “received” and “delivered” the early core — died, buried, raised, appeared.
Compare Luke 1:1–4: a first-century writer claiming inquiry among eyewitnesses. That posture can be tested. It stands to be weighed.</hardTeach>
          <fullTeach>1 Corinthians 15:3–5. Paul “received” and “delivered” the early core — died, buried, raised, appeared.
Compare Luke 1:1–4: a first-century writer claiming inquiry among eyewitnesses. That posture can be tested. It stands to be weighed.</fullTeach>
          <prompt>Keep the careful historical claim. Toss the overclaims.</prompt>
          <teachOnWrong>The letter is mid-first-century. “I received / I delivered” is tradition language — weighty testimony, not a lab rerun.</teachOnWrong>
          <challengeTiles>
            <keep>Paul “received” and “delivered” the early core: died, buried, raised, appeared (1 Cor 15:3–5).</keep>
            <discard>A medieval monk wrote the creed and copied it into Paul.</discard>
            <discard>The creed is a lab result that proves the resurrection like a chemical reaction.</discard>
            <discard>Paul invented the list in the second century after the Gospels.</discard>
          </challengeTiles>
        </learn>
        <match>
          <sentenceCorrect>The resurrection claim sits close to the events, not as a late legend.</sentenceCorrect>
          <sentenceMisses>
            <miss>Early is the same as laboratory proof.</miss>
            <miss>No first-century writer claims to have asked witnesses.</miss>
          </sentenceMisses>
          <placePrompt>Those names sit at the square.</placePrompt>
          <personPrompt>Silas keeps that square.</personPrompt>
          <ideaPrompt>Silas’s public names — the claim sits close to the events.</ideaPrompt>
          <ideaLabel>The claim sits close to the events.</ideaLabel>
          <whyHard>Silas Whitman keeps Witness Square. Paul quotes a received formula and names known people; the claim sits close to the events.</whyHard>
        </match>
        <hold onFail="easy">
          <claim>The resurrection claim sits close to the events, not as a late legend.</claim>
          <reason>Paul quotes a received formula and names known people; Luke claims inquiry among witnesses.</reason>
          <source>1 Corinthians 15:3–7; Luke 1:1–4</source>
          <whyCorrect>Paul quotes a received formula and names known people; Luke claims inquiry among witnesses.</whyCorrect>
          <whyMisses>
            <miss>Named people make a report less testable.</miss>
            <miss>Distance in time is the only historical question that matters.</miss>
          </whyMisses>
          <claimChoices>
            <choice>The resurrection claim sits close to the events, not as a late legend.</choice>
            <choice>Early is the same as laboratory proof.</choice>
            <choice>No first-century writer claims to have asked witnesses.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Paul quotes a received formula and names known people; Luke claims inquiry among witnesses.</choice>
            <choice>Named people make a report less testable.</choice>
            <choice>Distance in time is the only historical question that matters.</choice>
          </reasonChoices>
        </hold>
      </hard>
      <journal id="j-wb-2" title="Early is not the same as easy" kicker="Witness Square" unlockAfter="wb-early" scoreFromHeldTier="true">
        <p>Historians cannot rewind the world. They ask how close a report stands to the events, how formulaic it is, and whether the author is appealing to known people (Cephas, the Twelve, James, a large group, Paul himself).</p>
        <p>Luke 1:1–4 shows another first-century Christian writer claiming the posture of inquiry among eyewitnesses. That posture can be tested. It stands to be weighed.</p>
        <sources>
          <source>1 Corinthians 15:3–7</source>
          <source>Luke 1:1–4</source>
        </sources>
      </journal>
    </lesson>
    <lesson id="wb-method" place="Witness Square" person="Silas Whitman" tripleId="method-bench" ideaId="idea-method" ideaLabel="History tools weigh testimony." challengeKind="match" challengeTitle="Tools of the ancient historian">
      <easy points="10" easyOrder="12">
        <learn>
          <shortStory>Ask: how many reports? How awkward is the detail? How soon was it said? Does it fit that world? Those tools test a report. They are not a chemistry lab.</shortStory>
          <mainIdea>Ordinary historical tools weigh testimony; they do not replace reading.</mainIdea>
          <gloss>Historians weigh sources. They cannot rerun the past.</gloss>
          <loci>This idea lives at Witness Square, with Silas.</loci>
          <word>
            <term>Historian</term>
            <sense>someone who weighs old reports, not a person who reruns last Tuesday</sense>
          </word>
          <hint>Match each tool to what it tests.</hint>
        </learn>
        <match>
          <sentenceCorrect>Ordinary historical tools weigh testimony; they do not replace reading.</sentenceCorrect>
          <sentenceMisses>
            <miss>An early creed is already a laboratory proof.</miss>
            <miss>Every Christian report is automatically a late novel.</miss>
          </sentenceMisses>
          <placePrompt>Those names sit at the square.</placePrompt>
          <personPrompt>Silas keeps that square.</personPrompt>
          <ideaPrompt>Silas’s ledger — ordinary tools weigh testimony.</ideaPrompt>
          <ideaLabel>History tools weigh testimony.</ideaLabel>
          <whyEasy>Silas keeps the square. Ordinary tools weigh testimony; they do not replace reading.</whyEasy>
        </match>
        <hold levelUpTo="medium" onFail="easy">
          <claim>Ordinary historical tools weigh testimony; they do not replace reading.</claim>
          <reason>Multiple attestation, embarrassment, early reports, and context resist “late pious novel.”</reason>
          <source>Standard historical method</source>
          <whyCorrect>Multiple attestation, embarrassment, early reports, and context resist “late pious novel.”</whyCorrect>
          <whyMisses>
            <miss>Method is a way to skip the texts themselves.</miss>
            <miss>Embarrassment means a story must be false.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Ordinary historical tools weigh testimony; they do not replace reading.</choice>
            <choice>An early creed is already a laboratory proof.</choice>
            <choice>Every Christian report is automatically a late novel.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Multiple attestation, embarrassment, early reports, and context resist “late pious novel.”</choice>
            <choice>Method is a way to skip the texts themselves.</choice>
            <choice>Embarrassment means a story must be false.</choice>
          </reasonChoices>
        </hold>
      </easy>
      <medium points="12">
        <learn>
          <mediumTeach>Ordinary historical tools weigh testimony: how many reports, how awkward the detail, how soon it was said, whether it fits that world. They test a report; they do not replace reading the text. They are not a chemistry lab — and they still matter.</mediumTeach>
          <mainIdea>Ordinary historical tools weigh testimony; they do not replace reading.</mainIdea>
          <gloss>Historians weigh sources. They cannot rerun the past.</gloss>
          <loci>This idea lives at Witness Square, with Silas.</loci>
          <word>
            <term>Historian</term>
            <sense>someone who weighs old reports, not a person who reruns last Tuesday</sense>
          </word>
          <hint>Match each tool to what it tests.</hint>
        </learn>
        <match>
          <sentenceCorrect>Ordinary historical tools weigh testimony; they do not replace reading.</sentenceCorrect>
          <sentenceMisses>
            <miss>An early creed is already a laboratory proof.</miss>
            <miss>Every Christian report is automatically a late novel.</miss>
          </sentenceMisses>
          <placePrompt>Those names sit at the square.</placePrompt>
          <personPrompt>Silas keeps that square.</personPrompt>
          <ideaPrompt>Silas’s ledger — ordinary tools weigh testimony.</ideaPrompt>
          <ideaLabel>History tools weigh testimony.</ideaLabel>
          <whyMedium>Silas keeps the square. Ordinary tools weigh testimony; they do not replace reading.</whyMedium>
        </match>
        <hold levelUpTo="hard" onFail="easy">
          <claim>Ordinary historical tools weigh testimony; they do not replace reading.</claim>
          <reason>Multiple attestation, embarrassment, early reports, and context resist “late pious novel.”</reason>
          <source>Standard historical method</source>
          <whyCorrect>Multiple attestation, embarrassment, early reports, and context resist “late pious novel.”</whyCorrect>
          <whyMisses>
            <miss>Method is a way to skip the texts themselves.</miss>
            <miss>Embarrassment means a story must be false.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Ordinary historical tools weigh testimony; they do not replace reading.</choice>
            <choice>An early creed is already a laboratory proof.</choice>
            <choice>Every Christian report is automatically a late novel.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Multiple attestation, embarrassment, early reports, and context resist “late pious novel.”</choice>
            <choice>Method is a way to skip the texts themselves.</choice>
            <choice>Embarrassment means a story must be false.</choice>
          </reasonChoices>
        </hold>
      </medium>
      <hard points="15">
        <learn>
          <hardTeach>Used in historical Jesus research (and ancient history more broadly). These tools show which reports are hard to dismiss as late invention — early public testimony, not a lab rerun.
These criteria can be overused. They do not replace reading texts as wholes. They do resist a lazy story: “Someone, somewhere, made everything up much later.”</hardTeach>
          <fullTeach>Used in historical Jesus research (and ancient history more broadly). These tools show which reports are hard to dismiss as late invention — early public testimony, not a lab rerun.
These criteria can be overused. They do not replace reading texts as wholes. They do resist a lazy story: “Someone, somewhere, made everything up much later.”</fullTeach>
          <prompt>Match each criterion to what it is actually testing.</prompt>
          <teachOnWrong>Each tool answers a different question: how many streams, how awkward, how soon, how at-home in the period. Try pairing again.</teachOnWrong>
          <challengeTiles>
            <pair>
              <left>Multiple attestation</left>
              <right>Independent sources carrying the same core</right>
            </pair>
            <pair>
              <left>Embarrassment</left>
              <right>Details early Christians would be unlikely to invent</right>
            </pair>
            <pair>
              <left>Early testimony</left>
              <right>Closer in time, less room for legend to harden</right>
            </pair>
            <pair>
              <left>Contextual credibility</left>
              <right>Fits the known first-century Jewish and Roman world</right>
            </pair>
          </challengeTiles>
        </learn>
        <match>
          <sentenceCorrect>Ordinary historical tools weigh testimony; they do not replace reading.</sentenceCorrect>
          <sentenceMisses>
            <miss>An early creed is already a laboratory proof.</miss>
            <miss>Every Christian report is automatically a late novel.</miss>
          </sentenceMisses>
          <placePrompt>Those names sit at the square.</placePrompt>
          <personPrompt>Silas keeps that square.</personPrompt>
          <ideaPrompt>Silas’s ledger — ordinary tools weigh testimony.</ideaPrompt>
          <ideaLabel>History tools weigh testimony.</ideaLabel>
          <whyHard>Silas Whitman keeps Witness Square. Multiple attestation and early reports weigh testimony — they do not skip the texts.</whyHard>
        </match>
        <hold onFail="easy">
          <claim>Ordinary historical tools weigh testimony; they do not replace reading.</claim>
          <reason>Multiple attestation, embarrassment, early reports, and context resist “late pious novel.”</reason>
          <source>Standard historical method</source>
          <whyCorrect>Multiple attestation, embarrassment, early reports, and context resist “late pious novel.”</whyCorrect>
          <whyMisses>
            <miss>Method is a way to skip the texts themselves.</miss>
            <miss>Embarrassment means a story must be false.</miss>
          </whyMisses>
          <claimChoices>
            <choice>Ordinary historical tools weigh testimony; they do not replace reading.</choice>
            <choice>An early creed is already a laboratory proof.</choice>
            <choice>Every Christian report is automatically a late novel.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Multiple attestation, embarrassment, early reports, and context resist “late pious novel.”</choice>
            <choice>Method is a way to skip the texts themselves.</choice>
            <choice>Embarrassment means a story must be false.</choice>
          </reasonChoices>
        </hold>
      </hard>
      <journal id="j-wb-3" title="How the past is weighed" kicker="Witness Square" unlockAfter="wb-method" scoreFromHeldTier="true">
        <p>Multiple attestation, embarrassment, early testimony, and contextual credibility are ordinary tools. They do not replace reading. They resist the story that every Christian report is a late pious novel.</p>
        <p>Used honestly, they also resist the opposite laziness: “an early creed is already a laboratory proof.” History gives testimony, not a rerun.</p>
        <sources>
          <source>Standard historical method as used in ancient history and historical Jesus studies</source>
        </sources>
      </journal>
    </lesson>
    <lesson id="wb-women" place="Witness Square" person="Silas Whitman" tripleId="women-bench" ideaId="idea-women" ideaLabel="Women first saw the tomb." challengeKind="sort" challengeTitle="Idle talk">
      <easy points="10" easyOrder="5">
        <learn>
          <shortStory>The tomb stories begin with women. Luke says the men called it idle talk. If you only wanted later respect, you would more likely lead with respected men.</shortStory>
          <mainIdea>The first tomb reports begin with women — an awkward opening if invented for respectability.</mainIdea>
          <gloss>Women as first witnesses is an awkward detail to invent.</gloss>
          <loci>This idea lives at Witness Square, with Silas.</loci>
          <word>
            <term>Witness</term>
            <sense>someone who says what they saw</sense>
          </word>
          <hint>Keep the costly opening. Toss overclaims.</hint>
        </learn>
        <match>
          <sentenceCorrect>The first tomb reports begin with women — an awkward opening if invented for respectability.</sentenceCorrect>
          <sentenceMisses>
            <miss>The Gospels open with the Roman senate converting overnight.</miss>
            <miss>Women were the most legally impressive public witnesses.</miss>
          </sentenceMisses>
          <placePrompt>That report sits at the square.</placePrompt>
          <personPrompt>Silas keeps that square.</personPrompt>
          <ideaPrompt>Silas’s first report — women saw the tomb first.</ideaPrompt>
          <ideaLabel>Women first saw the tomb.</ideaLabel>
          <whyEasy>Silas keeps the square. Women saw the tomb first — an awkward first report.</whyEasy>
        </match>
        <hold levelUpTo="medium" onFail="easy">
          <claim>The first tomb reports begin with women — an awkward opening if invented for respectability.</claim>
          <reason>Luke records that the apostles dismissed them — a costly opening if the goal were instant respectability.</reason>
          <source>Luke 24:1–11</source>
          <whyCorrect>Luke records that the apostles dismissed them — a costly opening if the goal were instant respectability.</whyCorrect>
          <whyMisses>
            <miss>Luke sands away any dismissal of the first report.</miss>
            <miss>Outside writers never mention Christus or Pilate.</miss>
          </whyMisses>
          <claimChoices>
            <choice>The first tomb reports begin with women — an awkward opening if invented for respectability.</choice>
            <choice>The Gospels open with the Roman senate converting overnight.</choice>
            <choice>Women were the most legally impressive public witnesses.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Luke records that the apostles dismissed them — a costly opening if the goal were instant respectability.</choice>
            <choice>Luke sands away any dismissal of the first report.</choice>
            <choice>Outside writers never mention Christus or Pilate.</choice>
          </reasonChoices>
        </hold>
      </easy>
      <medium points="12">
        <learn>
          <mediumTeach>The tomb stories begin with women (Mark 16; Luke 24; John 20). Luke says the men called it idle talk. If you only wanted later respectability, you would more likely lead with respected men — an awkward opening that fits honest report more than polished invention.</mediumTeach>
          <mainIdea>The first tomb reports begin with women — an awkward opening if invented for respectability.</mainIdea>
          <gloss>Women as first witnesses is an awkward detail to invent.</gloss>
          <loci>This idea lives at Witness Square, with Silas.</loci>
          <word>
            <term>Witness</term>
            <sense>someone who says what they saw</sense>
          </word>
          <hint>Keep the costly opening. Toss overclaims.</hint>
        </learn>
        <match>
          <sentenceCorrect>The first tomb reports begin with women — an awkward opening if invented for respectability.</sentenceCorrect>
          <sentenceMisses>
            <miss>The Gospels open with the Roman senate converting overnight.</miss>
            <miss>Women were the most legally impressive public witnesses.</miss>
          </sentenceMisses>
          <placePrompt>That report sits at the square.</placePrompt>
          <personPrompt>Silas keeps that square.</personPrompt>
          <ideaPrompt>Silas’s first report — women saw the tomb first.</ideaPrompt>
          <ideaLabel>Women first saw the tomb.</ideaLabel>
          <whyMedium>Silas keeps the square. Women saw the tomb first — an awkward first report.</whyMedium>
        </match>
        <hold levelUpTo="hard" onFail="easy">
          <claim>The first tomb reports begin with women — an awkward opening if invented for respectability.</claim>
          <reason>Luke records that the apostles dismissed them — a costly opening if the goal were instant respectability.</reason>
          <source>Luke 24:1–11</source>
          <whyCorrect>Luke records that the apostles dismissed them — a costly opening if the goal were instant respectability.</whyCorrect>
          <whyMisses>
            <miss>Luke sands away any dismissal of the first report.</miss>
            <miss>Outside writers never mention Christus or Pilate.</miss>
          </whyMisses>
          <claimChoices>
            <choice>The first tomb reports begin with women — an awkward opening if invented for respectability.</choice>
            <choice>The Gospels open with the Roman senate converting overnight.</choice>
            <choice>Women were the most legally impressive public witnesses.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Luke records that the apostles dismissed them — a costly opening if the goal were instant respectability.</choice>
            <choice>Luke sands away any dismissal of the first report.</choice>
            <choice>Outside writers never mention Christus or Pilate.</choice>
          </reasonChoices>
        </hold>
      </medium>
      <hard points="15">
        <learn>
          <hardTeach>Women are first at the tomb (Mark 16:1–8; Luke 24:1–11; John 20). Luke 24:11: the report sounded like “idle talk.”
Josephus, Antiquities 18.63–64, is partly disputed because of later Christian touches. Honesty about that dispute belongs in the dossier.</hardTeach>
          <fullTeach>Women are first at the tomb (Mark 16:1–8; Luke 24:1–11; John 20). Luke 24:11: the report sounded like “idle talk.”
Josephus, Antiquities 18.63–64, is partly disputed because of later Christian touches. Honesty about that dispute belongs in the dossier.</fullTeach>
          <prompt>Keep the careful historical move. Toss the overclaims.</prompt>
          <teachOnWrong>This is a costly detail that counts for the report’s honesty. Tacitus 15.44 notes the execution, not the tomb. Do not invent citations.</teachOnWrong>
          <challengeTiles>
            <keep>An inventor hunting courtroom credibility would more likely lead with respected men.</keep>
            <discard>Named women automatically make every detail certain.</discard>
            <discard>Luke 24:11 means the evangelists wanted readers to distrust women.</discard>
            <discard>Tacitus wrote the tomb story in Annals 15.44.</discard>
          </challengeTiles>
        </learn>
        <match>
          <sentenceCorrect>The first tomb reports begin with women — an awkward opening if invented for respectability.</sentenceCorrect>
          <sentenceMisses>
            <miss>The Gospels open with the Roman senate converting overnight.</miss>
            <miss>Women were the most legally impressive public witnesses.</miss>
          </sentenceMisses>
          <placePrompt>That report sits at the square.</placePrompt>
          <personPrompt>Silas keeps that square.</personPrompt>
          <ideaPrompt>Silas’s first report — women saw the tomb first.</ideaPrompt>
          <ideaLabel>Women first saw the tomb.</ideaLabel>
          <whyHard>Silas Whitman keeps Witness Square. Women as first tomb witnesses is a public report, not a creek picture.</whyHard>
        </match>
        <hold onFail="easy">
          <claim>The first tomb reports begin with women — an awkward opening if invented for respectability.</claim>
          <reason>Luke records that the apostles dismissed them — a costly opening if the goal were instant respectability.</reason>
          <source>Luke 24:1–11</source>
          <whyCorrect>Luke records that the apostles dismissed them — a costly opening if the goal were instant respectability.</whyCorrect>
          <whyMisses>
            <miss>Luke sands away any dismissal of the first report.</miss>
            <miss>Outside writers never mention Christus or Pilate.</miss>
          </whyMisses>
          <claimChoices>
            <choice>The first tomb reports begin with women — an awkward opening if invented for respectability.</choice>
            <choice>The Gospels open with the Roman senate converting overnight.</choice>
            <choice>Women were the most legally impressive public witnesses.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Luke records that the apostles dismissed them — a costly opening if the goal were instant respectability.</choice>
            <choice>Luke sands away any dismissal of the first report.</choice>
            <choice>Outside writers never mention Christus or Pilate.</choice>
          </reasonChoices>
        </hold>
      </hard>
      <journal id="j-wb-4" title="Awkward beginnings" kicker="Witness Square" unlockAfter="wb-women" scoreFromHeldTier="true">
        <p>The tomb stories begin with women, and Luke records that the apostles dismissed them (Luke 24:11). That is an odd opening if the only goal is later public respectability.</p>
        <p>Outside the Gospels, Tacitus (Annals 15.44) notes Christus executed under Pilate and a movement that spread to Rome. Josephus (Antiquities 18.63–64) is partly disputed because of later Christian touches, and honesty about that dispute belongs in the dossier.</p>
        <sources>
          <source>Mark 16:1–8</source>
          <source>Luke 24:1–11</source>
          <source>John 20:1–18</source>
          <source>Tacitus, Annals 15.44</source>
          <source>Josephus, Antiquities 18.63–64</source>
        </sources>
      </journal>
    </lesson>
    <lesson id="daily-names" place="Witness Square" person="Silas Whitman" tripleId="names-bench" ideaId="idea-names" ideaLabel="Named witnesses, not one private voice." challengeKind="match" challengeTitle="Names that stay">
      <easy points="10" easyOrder="13">
        <learn>
          <shortStory>Paul lists Cephas, the Twelve, and more than five hundred — many still living then.</shortStory>
          <mainIdea>The resurrection claim stacks named witnesses, not one private voice.</mainIdea>
          <gloss>The resurrection claim stacks named witnesses, not one private voice.</gloss>
          <loci>This idea lives at Witness Square, with Silas.</loci>
          <word>
            <term>Witness</term>
            <sense>a named person who was said to have seen</sense>
          </word>
          <hint>Keep the names. Toss the anonymous dream.</hint>
        </learn>
        <match>
          <sentenceCorrect>The resurrection claim stacks named witnesses, not one private voice.</sentenceCorrect>
          <sentenceMisses>
            <miss>Paul refuses to name anyone.</miss>
            <miss>Only one anonymous dreamer is cited.</miss>
          </sentenceMisses>
          <placePrompt>Those names sit at the square.</placePrompt>
          <personPrompt>Silas keeps that square.</personPrompt>
          <ideaPrompt>Silas’s public names — Cephas, the Twelve, five hundred.</ideaPrompt>
          <ideaLabel>Named witnesses, not one private voice.</ideaLabel>
          <whyEasy>Silas keeps the square. Named witnesses — not one private voice.</whyEasy>
        </match>
        <hold levelUpTo="medium" onFail="easy">
          <claim>The resurrection claim stacks named witnesses, not one private voice.</claim>
          <reason>Paul lists Cephas, the Twelve, and more than five hundred — many still living then.</reason>
          <source>1 Corinthians 15:5–6</source>
          <whyCorrect>Paul lists Cephas, the Twelve, and more than five hundred — many still living then.</whyCorrect>
          <whyMisses>
            <miss>A crowd appearance would have been hidden.</miss>
            <miss>Cephas is left off the list.</miss>
          </whyMisses>
          <claimChoices>
            <choice>The resurrection claim stacks named witnesses, not one private voice.</choice>
            <choice>Paul refuses to name anyone.</choice>
            <choice>Only one anonymous dreamer is cited.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Paul lists Cephas, the Twelve, and more than five hundred — many still living then.</choice>
            <choice>A crowd appearance would have been hidden.</choice>
            <choice>Cephas is left off the list.</choice>
          </reasonChoices>
        </hold>
      </easy>
      <medium points="12">
        <learn>
          <mediumTeach>1 Corinthians 15:5–6. Paul lists Cephas, the Twelve, and more than five hundred brothers — many still living when he wrote. The resurrection claim stacks named witnesses, not one private voice.</mediumTeach>
          <mainIdea>The resurrection claim stacks named witnesses, not one private voice.</mainIdea>
          <gloss>The resurrection claim stacks named witnesses, not one private voice.</gloss>
          <loci>This idea lives at Witness Square, with Silas.</loci>
          <word>
            <term>Witness</term>
            <sense>a named person who was said to have seen</sense>
          </word>
          <hint>Keep the names. Toss the anonymous dream.</hint>
        </learn>
        <match>
          <sentenceCorrect>The resurrection claim stacks named witnesses, not one private voice.</sentenceCorrect>
          <sentenceMisses>
            <miss>Paul refuses to name anyone.</miss>
            <miss>Only one anonymous dreamer is cited.</miss>
          </sentenceMisses>
          <placePrompt>Those names sit at the square.</placePrompt>
          <personPrompt>Silas keeps that square.</personPrompt>
          <ideaPrompt>Silas’s public names — Cephas, the Twelve, five hundred.</ideaPrompt>
          <ideaLabel>Named witnesses, not one private voice.</ideaLabel>
          <whyMedium>Silas keeps the square. Named witnesses — not one private voice.</whyMedium>
        </match>
        <hold levelUpTo="hard" onFail="easy">
          <claim>The resurrection claim stacks named witnesses, not one private voice.</claim>
          <reason>Paul lists Cephas, the Twelve, and more than five hundred — many still living then.</reason>
          <source>1 Corinthians 15:5–6</source>
          <whyCorrect>Paul lists Cephas, the Twelve, and more than five hundred — many still living then.</whyCorrect>
          <whyMisses>
            <miss>A crowd appearance would have been hidden.</miss>
            <miss>Cephas is left off the list.</miss>
          </whyMisses>
          <claimChoices>
            <choice>The resurrection claim stacks named witnesses, not one private voice.</choice>
            <choice>Paul refuses to name anyone.</choice>
            <choice>Only one anonymous dreamer is cited.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Paul lists Cephas, the Twelve, and more than five hundred — many still living then.</choice>
            <choice>A crowd appearance would have been hidden.</choice>
            <choice>Cephas is left off the list.</choice>
          </reasonChoices>
        </hold>
      </medium>
      <hard points="15">
        <learn>
          <hardTeach>1 Corinthians 15:5–6. The New Testament does not rest on one voice. It stacks named people.
He appeared to Cephas, then to the twelve. Then he appeared to more than five hundred brothers at one time.</hardTeach>
          <fullTeach>1 Corinthians 15:5–6. The New Testament does not rest on one voice. It stacks named people.
He appeared to Cephas, then to the twelve. Then he appeared to more than five hundred brothers at one time.</fullTeach>
          <prompt>Match the person to the kind of witness they left.</prompt>
          <teachOnWrong>Paul is listing appearances, not inventing titles. Look at who is named, then snap again.</teachOnWrong>
          <challengeTiles>
            <pair>
              <left>Cephas (Peter)</left>
              <right>Named first in Paul’s list</right>
            </pair>
            <pair>
              <left>The Twelve</left>
              <right>The gathered apprentices</right>
            </pair>
            <pair>
              <left>More than five hundred</left>
              <right>A crowd, many still living then</right>
            </pair>
          </challengeTiles>
        </learn>
        <match>
          <sentenceCorrect>The resurrection claim stacks named witnesses, not one private voice.</sentenceCorrect>
          <sentenceMisses>
            <miss>Paul refuses to name anyone.</miss>
            <miss>Only one anonymous dreamer is cited.</miss>
          </sentenceMisses>
          <placePrompt>Those names sit at the square.</placePrompt>
          <personPrompt>Silas keeps that square.</personPrompt>
          <ideaPrompt>Silas’s public names — Cephas, the Twelve, five hundred.</ideaPrompt>
          <ideaLabel>Named witnesses, not one private voice.</ideaLabel>
          <whyHard>Silas Whitman keeps Witness Square. Cephas, the Twelve, and more than five hundred are public names, not a private dream.</whyHard>
        </match>
        <hold onFail="easy">
          <claim>The resurrection claim stacks named witnesses, not one private voice.</claim>
          <reason>Paul lists Cephas, the Twelve, and more than five hundred — many still living then.</reason>
          <source>1 Corinthians 15:5–6</source>
          <whyCorrect>Paul lists Cephas, the Twelve, and more than five hundred — many still living then.</whyCorrect>
          <whyMisses>
            <miss>A crowd appearance would have been hidden.</miss>
            <miss>Cephas is left off the list.</miss>
          </whyMisses>
          <claimChoices>
            <choice>The resurrection claim stacks named witnesses, not one private voice.</choice>
            <choice>Paul refuses to name anyone.</choice>
            <choice>Only one anonymous dreamer is cited.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>Paul lists Cephas, the Twelve, and more than five hundred — many still living then.</choice>
            <choice>A crowd appearance would have been hidden.</choice>
            <choice>Cephas is left off the list.</choice>
          </reasonChoices>
        </hold>
      </hard>
      <journal id="" title="" kicker="" unlockAfter="daily-names" scoreFromHeldTier="true">
        <p />
        <sources>
          <source />
        </sources>
      </journal>
    </lesson>
    <lesson id="daily-creed" place="Witness Square" person="Silas Whitman" tripleId="creed-bench" ideaId="idea-daily-creed" ideaLabel="The creed sits close to the event." challengeKind="sequence" challengeTitle="Older than the letter">
      <easy points="10" easyOrder="14">
        <learn>
          <shortStory>If that short line is early, the claim is close to what it names: died, buried, raised.</shortStory>
          <mainIdea>The creed sits between the event and Paul’s letter.</mainIdea>
          <gloss>The old shared belief sits between the event and Paul’s letter.</gloss>
          <loci>This idea lives at Witness Square, with Silas.</loci>
          <word>
            <term>Creed</term>
            <sense>an old shared belief the churches already said out loud</sense>
          </word>
          <hint>Keep “received.” Toss “Paul invented it while writing.”</hint>
        </learn>
        <match>
          <sentenceCorrect>The creed sits between the event and Paul’s letter.</sentenceCorrect>
          <sentenceMisses>
            <miss>Paul invents the creed as he writes.</miss>
            <miss>Burial is skipped because it does not matter.</miss>
          </sentenceMisses>
          <placePrompt>Those names sit at the square.</placePrompt>
          <personPrompt>Silas keeps that square.</personPrompt>
          <ideaPrompt>Silas’s handed-on creed — close to the event, then Paul’s letter.</ideaPrompt>
          <ideaLabel>The creed sits close to the event.</ideaLabel>
          <whyEasy>Silas keeps the square. The creed sits close to the event, then Paul’s letter.</whyEasy>
        </match>
        <hold levelUpTo="medium" onFail="easy">
          <claim>The creed sits between the event and Paul’s letter.</claim>
          <reason>If the formula is early, the claim is close to what it names: died, buried, raised.</reason>
          <source>1 Corinthians 15:3–4</source>
          <whyCorrect>If the formula is early, the claim is close to what it names: died, buried, raised.</whyCorrect>
          <whyMisses>
            <miss>The letter is older than any tradition it quotes.</miss>
            <miss>Nothing was handed on; it was only felt.</miss>
          </whyMisses>
          <claimChoices>
            <choice>The creed sits between the event and Paul’s letter.</choice>
            <choice>Paul invents the creed as he writes.</choice>
            <choice>Burial is skipped because it does not matter.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>If the formula is early, the claim is close to what it names: died, buried, raised.</choice>
            <choice>The letter is older than any tradition it quotes.</choice>
            <choice>Nothing was handed on; it was only felt.</choice>
          </reasonChoices>
        </hold>
      </easy>
      <medium points="12">
        <learn>
          <mediumTeach>1 Corinthians 15:3–4. The short creed sits between the event and Paul’s letter: died, buried, raised. If that line is early, the claim is close to what it names — not a late add-on.</mediumTeach>
          <mainIdea>The creed sits between the event and Paul’s letter.</mainIdea>
          <gloss>The old shared belief sits between the event and Paul’s letter.</gloss>
          <loci>This idea lives at Witness Square, with Silas.</loci>
          <word>
            <term>Creed</term>
            <sense>an old shared belief the churches already said out loud</sense>
          </word>
          <hint>Keep “received.” Toss “Paul invented it while writing.”</hint>
        </learn>
        <match>
          <sentenceCorrect>The creed sits between the event and Paul’s letter.</sentenceCorrect>
          <sentenceMisses>
            <miss>Paul invents the creed as he writes.</miss>
            <miss>Burial is skipped because it does not matter.</miss>
          </sentenceMisses>
          <placePrompt>Those names sit at the square.</placePrompt>
          <personPrompt>Silas keeps that square.</personPrompt>
          <ideaPrompt>Silas’s handed-on creed — close to the event, then Paul’s letter.</ideaPrompt>
          <ideaLabel>The creed sits close to the event.</ideaLabel>
          <whyMedium>Silas keeps the square. The creed sits close to the event, then Paul’s letter.</whyMedium>
        </match>
        <hold levelUpTo="hard" onFail="easy">
          <claim>The creed sits between the event and Paul’s letter.</claim>
          <reason>If the formula is early, the claim is close to what it names: died, buried, raised.</reason>
          <source>1 Corinthians 15:3–4</source>
          <whyCorrect>If the formula is early, the claim is close to what it names: died, buried, raised.</whyCorrect>
          <whyMisses>
            <miss>The letter is older than any tradition it quotes.</miss>
            <miss>Nothing was handed on; it was only felt.</miss>
          </whyMisses>
          <claimChoices>
            <choice>The creed sits between the event and Paul’s letter.</choice>
            <choice>Paul invents the creed as he writes.</choice>
            <choice>Burial is skipped because it does not matter.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>If the formula is early, the claim is close to what it names: died, buried, raised.</choice>
            <choice>The letter is older than any tradition it quotes.</choice>
            <choice>Nothing was handed on; it was only felt.</choice>
          </reasonChoices>
        </hold>
      </medium>
      <hard points="15">
        <learn>
          <hardTeach>1 Corinthians 15:3–4. If the creed is early, the claim is close to the event it names.
Christ died… he was buried… he was raised on the third day. Burial and raising are both named.</hardTeach>
          <fullTeach>1 Corinthians 15:3–4. If the creed is early, the claim is close to the event it names.
Christ died… he was buried… he was raised on the third day. Burial and raising are both named.</fullTeach>
          <prompt>Scholars often date this creed earlier than the letter that quotes it. Order the steps.</prompt>
          <teachOnWrong>Paul is handing on something he received. The creed sits between the event and the letter. Try the chain again.</teachOnWrong>
          <challengeTiles />
        </learn>
        <match>
          <sentenceCorrect>The creed sits between the event and Paul’s letter.</sentenceCorrect>
          <sentenceMisses>
            <miss>Paul invents the creed as he writes.</miss>
            <miss>Burial is skipped because it does not matter.</miss>
          </sentenceMisses>
          <placePrompt>Those names sit at the square.</placePrompt>
          <personPrompt>Silas keeps that square.</personPrompt>
          <ideaPrompt>Silas’s handed-on creed — close to the event, then Paul’s letter.</ideaPrompt>
          <ideaLabel>The creed sits close to the event.</ideaLabel>
          <whyHard>Silas Whitman keeps Witness Square. The creed sits between the event and Paul’s letter — died, buried, raised.</whyHard>
        </match>
        <hold onFail="easy">
          <claim>The creed sits between the event and Paul’s letter.</claim>
          <reason>If the formula is early, the claim is close to what it names: died, buried, raised.</reason>
          <source>1 Corinthians 15:3–4</source>
          <whyCorrect>If the formula is early, the claim is close to what it names: died, buried, raised.</whyCorrect>
          <whyMisses>
            <miss>The letter is older than any tradition it quotes.</miss>
            <miss>Nothing was handed on; it was only felt.</miss>
          </whyMisses>
          <claimChoices>
            <choice>The creed sits between the event and Paul’s letter.</choice>
            <choice>Paul invents the creed as he writes.</choice>
            <choice>Burial is skipped because it does not matter.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>If the formula is early, the claim is close to what it names: died, buried, raised.</choice>
            <choice>The letter is older than any tradition it quotes.</choice>
            <choice>Nothing was handed on; it was only felt.</choice>
          </reasonChoices>
        </hold>
      </hard>
      <journal id="" title="" kicker="" unlockAfter="daily-creed" scoreFromHeldTier="true">
        <p />
        <sources>
          <source />
        </sources>
      </journal>
    </lesson>
    <lesson id="daily-empty" place="Witness Square" person="Silas Whitman" tripleId="empty-bench" ideaId="idea-empty" ideaLabel="Easter begins with an empty place." challengeKind="sort" challengeTitle="Morning">
      <easy points="10" easyOrder="15">
        <learn>
          <shortStory>The first Easter reports are not tidy. They include an empty place, women, fear, and wonder. The town does not sand that awkwardness into a fake triumph.</shortStory>
          <mainIdea>The first Easter reports include an empty place, women, fear, and wonder.</mainIdea>
          <gloss>The first Easter reports include an empty place, women, fear, and wonder.</gloss>
          <loci>This idea lives at Witness Square, with Silas.</loci>
          <word>
            <term>Empty</term>
            <sense>the place was not occupied when they looked</sense>
          </word>
          <hint>Keep the awkward opening. Toss the senate conversion.</hint>
        </learn>
        <match>
          <sentenceCorrect>The first Easter reports include an empty place, women, fear, and wonder.</sentenceCorrect>
          <sentenceMisses>
            <miss>Rome instantly converts the senate.</miss>
            <miss>Women are absent from the first reports.</miss>
          </sentenceMisses>
          <placePrompt>That report sits at the square.</placePrompt>
          <personPrompt>Silas keeps that square.</personPrompt>
          <ideaPrompt>Silas’s first Easter — empty place, women, fear, and wonder.</ideaPrompt>
          <ideaLabel>Easter begins with an empty place.</ideaLabel>
          <whyEasy>Silas keeps the square. Easter begins with an empty place, women, fear, and wonder.</whyEasy>
        </match>
        <hold levelUpTo="medium" onFail="easy">
          <claim>The first Easter reports include an empty place, women, fear, and wonder.</claim>
          <reason>The town does not sand that awkwardness into a tidy triumph.</reason>
          <source>Luke 24:2–3</source>
          <whyCorrect>The town does not sand that awkwardness into a tidy triumph.</whyCorrect>
          <whyMisses>
            <miss>The tomb is found occupied and explained.</miss>
            <miss>Fear is edited out of the opening.</miss>
          </whyMisses>
          <claimChoices>
            <choice>The first Easter reports include an empty place, women, fear, and wonder.</choice>
            <choice>Rome instantly converts the senate.</choice>
            <choice>Women are absent from the first reports.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>The town does not sand that awkwardness into a tidy triumph.</choice>
            <choice>The tomb is found occupied and explained.</choice>
            <choice>Fear is edited out of the opening.</choice>
          </reasonChoices>
        </hold>
      </easy>
      <medium points="12">
        <learn>
          <mediumTeach>The first Easter reports include an empty place, women, fear, and wonder. They are not a tidy triumph parade. The town does not sand that awkwardness away — honesty before polish.</mediumTeach>
          <mainIdea>The first Easter reports include an empty place, women, fear, and wonder.</mainIdea>
          <gloss>The first Easter reports include an empty place, women, fear, and wonder.</gloss>
          <loci>This idea lives at Witness Square, with Silas.</loci>
          <word>
            <term>Empty</term>
            <sense>the place was not occupied when they looked</sense>
          </word>
          <hint>Keep the awkward opening. Toss the senate conversion.</hint>
        </learn>
        <match>
          <sentenceCorrect>The first Easter reports include an empty place, women, fear, and wonder.</sentenceCorrect>
          <sentenceMisses>
            <miss>Rome instantly converts the senate.</miss>
            <miss>Women are absent from the first reports.</miss>
          </sentenceMisses>
          <placePrompt>That report sits at the square.</placePrompt>
          <personPrompt>Silas keeps that square.</personPrompt>
          <ideaPrompt>Silas’s first Easter — empty place, women, fear, and wonder.</ideaPrompt>
          <ideaLabel>Easter begins with an empty place.</ideaLabel>
          <whyMedium>Silas keeps the square. Easter begins with an empty place, women, fear, and wonder.</whyMedium>
        </match>
        <hold levelUpTo="hard" onFail="easy">
          <claim>The first Easter reports include an empty place, women, fear, and wonder.</claim>
          <reason>The town does not sand that awkwardness into a tidy triumph.</reason>
          <source>Luke 24:2–3</source>
          <whyCorrect>The town does not sand that awkwardness into a tidy triumph.</whyCorrect>
          <whyMisses>
            <miss>The tomb is found occupied and explained.</miss>
            <miss>Fear is edited out of the opening.</miss>
          </whyMisses>
          <claimChoices>
            <choice>The first Easter reports include an empty place, women, fear, and wonder.</choice>
            <choice>Rome instantly converts the senate.</choice>
            <choice>Women are absent from the first reports.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>The town does not sand that awkwardness into a tidy triumph.</choice>
            <choice>The tomb is found occupied and explained.</choice>
            <choice>Fear is edited out of the opening.</choice>
          </reasonChoices>
        </hold>
      </medium>
      <hard points="15">
        <learn>
          <hardTeach>The first reports are not tidy. They include women, fear, and an empty place. The town does not sand that down.
They found the stone rolled away from the tomb, but when they went in they did not find the body.</hardTeach>
          <fullTeach>The first reports are not tidy. They include women, fear, and an empty place. The town does not sand that down.
They found the stone rolled away from the tomb, but when they went in they did not find the body.</fullTeach>
          <prompt>Which details belong in the first Easter reports?</prompt>
          <teachOnWrong>Luke 24 begins with an empty place and a dismissed report. Keep the awkwardness; toss the tidy triumph.</teachOnWrong>
          <challengeTiles>
            <keep>The tomb is found empty.</keep>
            <keep>Women are among the first witnesses.</keep>
            <keep>Fear and wonder sit side by side.</keep>
            <discard>Rome instantly converts the senate.</discard>
          </challengeTiles>
        </learn>
        <match>
          <sentenceCorrect>The first Easter reports include an empty place, women, fear, and wonder.</sentenceCorrect>
          <sentenceMisses>
            <miss>Rome instantly converts the senate.</miss>
            <miss>Women are absent from the first reports.</miss>
          </sentenceMisses>
          <placePrompt>That report sits at the square.</placePrompt>
          <personPrompt>Silas keeps that square.</personPrompt>
          <ideaPrompt>Silas’s first Easter — empty place, women, fear, and wonder.</ideaPrompt>
          <ideaLabel>Easter begins with an empty place.</ideaLabel>
          <whyHard>Silas Whitman keeps Witness Square. The first Easter reports include an empty place — the town does not sand that awkwardness away.</whyHard>
        </match>
        <hold onFail="easy">
          <claim>The first Easter reports include an empty place, women, fear, and wonder.</claim>
          <reason>The town does not sand that awkwardness into a tidy triumph.</reason>
          <source>Luke 24:2–3</source>
          <whyCorrect>The town does not sand that awkwardness into a tidy triumph.</whyCorrect>
          <whyMisses>
            <miss>The tomb is found occupied and explained.</miss>
            <miss>Fear is edited out of the opening.</miss>
          </whyMisses>
          <claimChoices>
            <choice>The first Easter reports include an empty place, women, fear, and wonder.</choice>
            <choice>Rome instantly converts the senate.</choice>
            <choice>Women are absent from the first reports.</choice>
          </claimChoices>
          <reasonChoices>
            <choice>The town does not sand that awkwardness into a tidy triumph.</choice>
            <choice>The tomb is found occupied and explained.</choice>
            <choice>Fear is edited out of the opening.</choice>
          </reasonChoices>
        </hold>
      </hard>
      <journal id="" title="" kicker="" unlockAfter="daily-empty" scoreFromHeldTier="true">
        <p />
        <sources>
          <source />
        </sources>
      </journal>
    </lesson>
  </lessons>
  <streetFacts>
    <fact evidenceId="wb-creed" tripleId="silas-bench" ideaId="idea-silas" place="Witness Square" person="Silas Whitman" ideaLabel="Died, buried, raised, appeared." />
    <fact evidenceId="wb-early" tripleId="early-bench" ideaId="idea-early" place="Witness Square" person="Silas Whitman" ideaLabel="The claim sits close to the events." />
    <fact evidenceId="wb-method" tripleId="method-bench" ideaId="idea-method" place="Witness Square" person="Silas Whitman" ideaLabel="History tools weigh testimony." />
    <fact evidenceId="wb-women" tripleId="women-bench" ideaId="idea-women" place="Witness Square" person="Silas Whitman" ideaLabel="Women first saw the tomb." />
    <fact evidenceId="daily-names" tripleId="names-bench" ideaId="idea-names" place="Witness Square" person="Silas Whitman" ideaLabel="Named witnesses, not one private voice." />
    <fact evidenceId="daily-creed" tripleId="creed-bench" ideaId="idea-daily-creed" place="Witness Square" person="Silas Whitman" ideaLabel="The creed sits close to the event." />
    <fact evidenceId="daily-empty" tripleId="empty-bench" ideaId="idea-empty" place="Witness Square" person="Silas Whitman" ideaLabel="Easter begins with an empty place." />
  </streetFacts>
</areaPack>
`},qa=3,ri={easy:10,medium:12,hard:15},ck={easy:"medium",medium:"hard",hard:void 0};function ug(a){return a==="easy"||a==="medium"||a==="hard"}function Ld(a){if(a){if(a>=ri.hard)return"hard";if(a>=ri.medium)return"medium";if(a>=ri.easy)return"easy"}}const hk={"&lt;":"<","&gt;":">","&amp;":"&","&quot;":'"',"&apos;":"'"},dk={"parable-hollow":1,"witness-bench":2,observatory:3,"first-gate":4,"high-lookout":5};function mg(a){return a.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,"$1").replace(/&(?:lt|gt|amp|quot|apos);/g,o=>hk[o]??o).replace(/&#(\d+);/g,(o,r)=>String.fromCharCode(Number(r))).replace(/&#x([0-9a-fA-F]+);/g,(o,r)=>String.fromCharCode(parseInt(r,16)))}function pi(a){return mg(a.replace(/<!--[\s\S]*?-->/g,"")).trim()}function uk(a){const o={},r=/([A-Za-z_][\w:-]*)\s*=\s*("([^"]*)"|'([^']*)')/g;let h;for(;h=r.exec(a);)o[h[1]]=mg(h[3]??h[4]??"");return o}function Gn(a,o){const r=[],h=new RegExp(`<${o}(\\s[^>]*)?\\s*/>|<${o}(\\s[^>]*)?>`,"g");let d;for(;d=h.exec(a);){const m=d[0],w=uk(d[1]??d[2]??"");if(m.endsWith("/>")){r.push({name:o,attrs:w,inner:""});continue}const y=d.index+m.length;let f=1;const g=new RegExp(`</${o}>|<${o}(?:\\s[^>]*)?\\s*/>|<${o}(?:\\s[^>]*)?>`,"g");g.lastIndex=y;let T=a.length,b;for(;b=g.exec(a);){const M=b[0];if(M.startsWith(`</${o}`)){if(f-=1,f===0){T=b.index,h.lastIndex=b.index+M.length;break}}else M.endsWith("/>")||(f+=1)}r.push({name:o,attrs:w,inner:a.slice(y,T)})}return r}function Ye(a,o){return Gn(a,o)[0]}function qe(a,o){const r=Ye(a,o);return r?pi(r.inner):""}function Dn(a,o){return Gn(a,o).map(r=>pi(r.inner)).filter(Boolean)}function ra(a,o,r){const h=a[o],d=h?Number(h):NaN;return Number.isFinite(d)?d:r}function pg(a){const o=Object.keys(a);return o.length===0?"":` ${o.map(r=>`${r}="${a[r].replace(/"/g,"&quot;")}"`).join(" ")}`}function fg(a){return Ye(a,"areaPack")??Ye(a,"area")}function yg(a){return Ye(a,"silverCityPackIndex")??Ye(a,"packIndex")??Ye(a,"index")}function gg(a,o){const r=`${a} ${o}`.toLowerCase();if(r.includes("juniper")||r.includes("porch"))return{plotId:"porch",who:"juniper"};if(r.includes("mercy")||r.includes("creek")||r.includes("hollow"))return{plotId:"hollow",who:"mercy"};if(r.includes("silas")||r.includes("witness")||r.includes("square"))return{plotId:"bench",who:"silas"};if(r.includes("nora")||r.includes("sky watch")||r.includes("observatory"))return{plotId:"observatory",who:"nora"};if(r.includes("ansel")||r.includes("why gate"))return{plotId:"gate",who:"ansel"};if(r.includes("hope")||r.includes("ridge")||r.includes("lookout")||r.includes("meaning"))return{plotId:"lookout",who:"hope"}}function mk(a,o,r={}){const h=Ye(a,"loci"),d=r.place||h?.attrs.place||o.place,m=r.person||h?.attrs.person||o.person,w=gg(d,m);return{place:d,person:m,plotId:r.plotId||h?.attrs.plotId||w?.plotId||o.plotId,who:r.who||r.personId||h?.attrs.who||w?.who||o.who}}function pk(a,o,r){const h=Ye(a,"match");return h?{sentence:qe(h.inner,"sentenceCorrect")||h.attrs.sentence||qe(h.inner,"sentence")||o,place:h.attrs.place||qe(h.inner,"place")||r.place,person:h.attrs.person||qe(h.inner,"person")||r.person}:{sentence:o,place:r.place,person:r.person}}function fk(a,o,r,h){const d=Ye(a,"hold"),m=d?.inner??"",w=d?.attrs.levelUpTo,y=ug(w)?w:r==="easy"?"medium":r==="medium"?"hard":void 0,f=qe(m,"claim")||h,g=Ye(m,"claimChoices"),b=[...(g?Dn(g.inner,"choice"):[]).filter(I=>I&&I!==f),...Dn(m,"claimMiss"),...Gn(m,"miss").filter(I=>I.attrs.kind==="claim").map(I=>pi(I.inner))].filter(Boolean),M=Ye(m,"whyMisses"),E=[...M?Dn(M.inner,"miss"):[],...Dn(m,"whyMiss"),...Gn(m,"miss").filter(I=>I.attrs.kind==="why"||I.attrs.kind==="reason").map(I=>pi(I.inner))].filter(Boolean),G=qe(m,"whyCorrect")||qe(m,"reason")||qe(m,"why")||o;return{levelUpTo:y,onFail:"easy",why:G,claimMisses:dd(b),whyMisses:dd(E)}}function dd(a){const o=new Set,r=[];for(const h of a)o.has(h)||(o.add(h),r.push(h));return r}function yk(a,o,r){const d=Ye(a,"learn")?.inner??a;return o==="easy"?qe(d,"shortStory")||qe(d,"teach")||Qh(d)||r:o==="medium"?qe(d,"mediumTeach")||qe(d,"teach")||Qh(d)||r:qe(d,"hardTeach")||qe(d,"fullTeach")||qe(d,"teach")||Qh(d)||r}function Qh(a){const o=a.replace(/<(mainIdea|gloss|loci|word|hint|prompt|teachOnWrong|challengeTiles|shortStory|mediumTeach|hardTeach|fullTeach)\b[\s\S]*?<\/\1>/gi,"");return pi(o.replace(/<[^>]+>/g," "))}function gk(a){const r=Ye(a,"learn")?.inner??a,h=Ye(r,"word");if(!h)return;const d=qe(h.inner,"term"),m=qe(h.inner,"sense");if(!(!d||!m))return{term:d,sense:m}}function wk(a){const o=Ye(a,"learn");return qe(o?.inner??a,"hint")}function wg(a,o){const r=Ye(a,"learn");return qe(r?.inner??a,"gloss")||qe(r?.inner??a,"mainIdea")||o}function Zh(a){const r=Ye(a,"hold")?.inner??"";return{claim:qe(r,"claim"),reason:qe(r,"whyCorrect")||qe(r,"reason"),source:qe(r,"source")}}function ed(a,o,r,h,d,m){const w=Ye(a,o);if(!w)return;const y=ra(w.attrs,"points",ri[o]),f=o==="easy"?ra(w.attrs,"easyOrder",0):void 0,g=yk(w.inner,o,d),T=pk(w.inner,r,h),b=fk(w.inner,m,o,r),M=gk(w.inner),E=wk(w.inner),G=wg(w.inner,d);return{id:o,points:y,easyOrder:f&&f>0?f:void 0,learn:g,gloss:G,word:M,hint:E||void 0,match:T,hold:b}}function td(a,o,r,h,d,m,w){return{id:a,points:ri[a],easyOrder:a==="easy"?m:void 0,learn:h,match:{sentence:o,place:r.place,person:r.person},hold:{levelUpTo:a==="easy"?"medium":a==="medium"?"hard":void 0,onFail:"easy",why:d,claimMisses:w?.claimMisses??[],whyMisses:w?.whyMisses??[]}}}function bk(a){const o=Ye(a,"journal");if(!o)return;const r=o.attrs.title||qe(o.inner,"title"),h=o.attrs.kicker||qe(o.inner,"kicker"),d=Dn(o.inner,"p"),m=d.length?d:Dn(o.inner,"body"),w=Ye(o.inner,"sources"),y=[...w?Dn(w.inner,"source"):[],...Dn(o.inner,"cite"),...w?[]:Dn(o.inner,"source")].filter(Boolean);if(!(!r&&m.length===0))return{id:o.attrs.id||void 0,title:r,kicker:h,body:m,sources:dd(y),unlockAfter:o.attrs.unlockAfter||void 0}}function vk(a,o,r){const h=a.trim().startsWith("<lesson")?a:`<lesson>${a}</lesson>`,d=Ye(h,"lesson")??{attrs:{},inner:a},m=d.attrs.id;if(!m)return;const w=Ye(d.inner,"easy"),y=Ye(d.inner,"medium"),f=Ye(d.inner,"hard"),g=Zh(w?.inner??""),T=Zh(y?.inner??""),b=Zh(f?.inner??""),M=g.claim||T.claim||b.claim||qe(d.inner,"claim")||d.attrs.ideaLabel,E=wg(w?.inner??d.inner,""),G=qe(d.inner,"plain")||E||M,I=g.source||qe(d.inner,"source")||T.source||b.source,_=mk(d.inner,r,d.attrs),Q=g.reason||qe(d.inner,"why")||G||M,ne=ra(d.attrs,"easyOrder",0);if(!M)return;const se=ed(d.inner,"easy",M,_,G||M,Q)??td("easy",M,_,G||M,Q,ne||void 0);se.easyOrder||(se.easyOrder=ne||(w?ra(w.attrs,"easyOrder",0):0)||void 0);const ie=ed(d.inner,"medium",M,_,Q||M,Q)??td("medium",M,_,Q||M,Q,void 0,se.hold),re=ed(d.inner,"hard",M,_,Q||M,Q)??td("hard",M,_,Q||M,Q,void 0,se.hold);return{id:m,areaId:d.attrs.areaId||o,title:d.attrs.challengeTitle||d.attrs.title||d.attrs.ideaLabel||M,idea:d.attrs.ideaLabel||d.attrs.idea||void 0,claim:M,plain:G,source:I,loci:_,journal:bk(d.inner),easy:{...se,hold:{...se.hold,onFail:"easy"}},medium:{...ie,hold:{...ie.hold,onFail:"easy"}},hard:{...re,hold:{...re.hold,onFail:"easy",levelUpTo:void 0}}}}function kk(a,o,r={}){const h=gg(r.place||o,r.person||"");return r.place&&r.person&&(r.plotId||r.personId||h)?{place:r.place,person:r.person,plotId:r.plotId||h?.plotId||"porch",who:r.personId||h?.who||"juniper"}:a==="parable-hollow"?{place:o||"Story Creek",person:"Mercy Wren",plotId:"hollow",who:"mercy"}:a==="witness-bench"?{place:o||"Witness Square",person:"Silas Whitman",plotId:"bench",who:"silas"}:a==="observatory"?{place:o||"Sky Watch",person:"Nora Skye",plotId:"observatory",who:"nora"}:a==="first-gate"?{place:o||"Why Gate",person:"Ansel Gate",plotId:"gate",who:"ansel"}:a==="high-lookout"?{place:o||"Meaning Ridge",person:"Hope Ridge",plotId:"lookout",who:"hope"}:{place:o||"East porch",person:"Juniper Wick",plotId:"porch",who:"juniper"}}function Tk(a,o,r=[]){const h=fg(a);if(!h){r.push({file:o,message:"Missing <areaPack> or <area> root"});return}const d=ra(h.attrs,"schemaVersion",qa);d!==qa&&r.push({file:o,message:`Expected schemaVersion ${qa}, got ${d}`});const m=h.attrs.id||o.replace(/\.xml$/,""),w=Ye(h.inner,"meta"),y=h.attrs.title||(w?qe(w.inner,"title"):"")||m,f=h.attrs.subtitle||(w?qe(w.inner,"subtitle"):"")||"",g=(w?qe(w.inner,"blurb"):"")||qe(h.inner,"blurb")||h.attrs.blurb||"",T=kk(m,y,h.attrs),M=Ye(h.inner,"lessons")?.inner??h.inner,E=Gn(M,"lesson").map(G=>vk(`<lesson${pg(G.attrs)}>${G.inner}</lesson>`,m,T)).filter(G=>!!G);return E.length===0&&r.push({file:o,message:`No <lesson> elements in ${m}`}),{id:m,file:o,order:ra(h.attrs,"order",dk[m]??0),title:y,shortTitle:h.attrs.shortTitle||y,subtitle:f,blurb:g,intro:Dn(h.inner,"intro"),icon:h.attrs.icon||"",accent:h.attrs.accent||"",lessons:E}}function xk(a){const o=Ye(a,"easyShelf");if(!o)return[];const r=Gn(o.inner,"line").slice().sort((h,d)=>ra(h.attrs,"easyOrder",0)-ra(d.attrs,"easyOrder",0)).map(h=>h.attrs.id||pi(h.inner)).filter(Boolean);return r.length?r:(o.attrs.order||"").split(",").map(h=>h.trim()).filter(Boolean)}function Sk(a,o="index.xml",r=[]){const h=yg(a)??Ye(a,"area");if(!h)return r.push({file:o,message:"Missing pack index root"}),{schemaVersion:qa,id:"core-v0",title:"Core trail",files:[],easyShelf:[]};const d=ra(h.attrs,"schemaVersion",qa);d!==qa&&r.push({file:o,message:`Expected schemaVersion ${qa}, got ${d}`});const m=Ye(h.inner,"packs"),y=(m?Gn(m.inner,"pack"):Gn(h.inner,"area")).filter(f=>f.attrs.file).map(f=>({file:f.attrs.file,id:f.attrs.id||f.attrs.file.replace(/\.xml$/,"")})).filter(f=>f.file&&f.id);return{schemaVersion:d,id:h.attrs.id||"core-v0",title:h.attrs.title||"Core trail",files:y,easyShelf:xk(h.inner)}}function jk(a){const o={};for(const[r,h]of Object.entries(a))o[r.split("/").pop()??r]=h;return o}function Mk(a,o){if(!o.length)return;const r=new Map(o.map((h,d)=>[h,d+1]));for(const h of a){const d=r.get(h.id);d&&(h.easy.easyOrder=d)}}function Ck(a,o=[]){const r=jk(a),h=r["index.xml"]??"",d=Sk(h,"index.xml",o),m=[],w=new Set;function y(b,M){const E=b.split("/").pop()??b,I=fg(M)?.attrs.id??"";if(w.has(E)||I&&w.has(`id:${I}`))return;const _=Tk(M,E,o);_&&(w.add(E),w.add(`id:${_.id}`),m.push(_))}const f=yg(h);if(f)for(const b of Gn(f.inner,"area"))Gn(b.inner,"lesson").length!==0&&y(b.attrs.file||`${b.attrs.id||"east-porch"}.xml`,`<area${pg(b.attrs)}>${b.inner}</area>`);for(const b of d.files){const M=r[b.file];if(!M){o.push({file:b.file,message:"Listed in index.xml but missing from the pack set"});continue}y(b.file,M)}for(const[b,M]of Object.entries(r))b==="index.xml"||!b.endsWith(".xml")||y(b,M);const g=m.slice().sort((b,M)=>b.order-M.order||b.id.localeCompare(M.id)).flatMap(b=>b.lessons);Mk(g,d.easyShelf);const T=g.slice().sort((b,M)=>{const E=b.easy.easyOrder??999,G=M.easy.easyOrder??999;return E-G||b.id.localeCompare(M.id)});return{schemaVersion:d.schemaVersion||qa,id:d.id,title:d.title,areas:m.sort((b,M)=>b.order-M.order||b.id.localeCompare(M.id)),lessons:T}}function Ak(a){return a.lessons.filter(o=>o.easy.easyOrder).sort((o,r)=>(o.easy.easyOrder??999)-(r.easy.easyOrder??999)).map(o=>o.id)}function Nk(a,o){return a.lessons.find(r=>r.id===o)}const Lk=[],So=Ck(lk,Lk);function Ro(a){return Nk(So,a)}function Ek(){const a=Ak(So);return a.length?a:So.lessons.map(o=>o.id)}function ky(a,o){const r=o.filter(h=>h&&h!==a);return[a,r[0]||`${a} — not this.`,r[1]||`${a} — a weaker reading.`]}function bg(a,o="medium"){const r=a[o]??a.medium,h=r.hold.why||a.claim;return{id:a.id,claim:a.claim,reason:h,source:a.source,claimChoices:ky(a.claim,r.hold.claimMisses),reasonChoices:ky(h,r.hold.whyMisses)}}function Hk(a,o="medium"){const r=Ro(a);return r?bg(r,o):void 0}const Nt=[{id:"j-ph-1",areaId:"parable-hollow",title:"The Teacher who taught in stories",kicker:"Story Creek",unlockAfter:"ph-road",body:["The Gospels present Jesus as a teacher whose most characteristic form is the parable. These are not children’s decorations added to a lecture. They are the lecture — they force a decision about mercy, pride, and the identity of God.","The Good Samaritan (Luke 10:25–37) relocates the word “neighbor” from a boundary question to a mercy question. The listener is not first invited to classify others. The listener is invited to become the kind of person who crosses the road."],sources:["Luke 10:25–37","Luke 10:29"]},{id:"j-ph-2",areaId:"parable-hollow",title:"Mercy that runs",kicker:"Story Creek",unlockAfter:"ph-father",body:["Luke 15 stacks three lost-and-found stories after a complaint: this man welcomes sinners and eats with them. The father’s run (Luke 15:20) is the theological center of the third story. Honor is spent so that the son can be embraced before he finishes his hired-hand speech.","The older brother shows that you can live in the house and still refuse the feast. Nearness without joy at another’s return is a second lostness."],sources:["Luke 15:1–32"]},{id:"j-ph-3",areaId:"parable-hollow",title:"Seeds, search, and a trust",kicker:"Story Creek",unlockAfter:"ph-seeds",body:["Taken together, the sower, the lost sheep, the mustard seed, and the talents sketch a God who speaks, seeks, grows a kingdom from small beginnings, and will ask what was done with a trust.","That is already a case of a sort: not a syllogism, but a coherent portrait. If the portrait is true, the world is personal before it is mechanical."],sources:["Matthew 13:1–23","Matthew 13:31–32","Luke 15:1–7","Matthew 25:14–30"]},{id:"j-ph-4",areaId:"parable-hollow",title:"The measure you use",kicker:"Story Creek",unlockAfter:"ph-debt",body:["Matthew 18:21–35 is severe because grace is severe in the opposite direction from cruelty: it creates a world. To be forgiven an unpayable debt and then throttle a neighbor is to live as if the king’s mercy never happened.","Jesus teaches his disciples to pray “forgive us our debts, as we also have forgiven our debtors” (Matt 6:12). The petition assumes the same moral grain."],sources:["Matthew 18:21–35","Matthew 6:12–15"]},{id:"j-wb-1",areaId:"witness-bench",title:"Of first importance",kicker:"Witness Square",unlockAfter:"wb-creed",body:["1 Corinthians 15:3–5 is a compressed public claim: death, burial, raising, appearances. Paul presents it as received tradition, not as a private dream. Burial resists a merely “spiritual” death; appearances resist a merely “spiritual” raising.","This is what the churches were already handing on when Paul wrote — a mid-first-century letter appealing to a still-earlier formula."],sources:["1 Corinthians 15:3–8"]},{id:"j-wb-2",areaId:"witness-bench",title:"Early is not the same as easy",kicker:"Witness Square",unlockAfter:"wb-early",body:["Historians cannot rewind the world. They ask how close a report stands to the events, how formulaic it is, and whether the author is appealing to known people (Cephas, the Twelve, James, a large group, Paul himself).","Luke 1:1–4 shows another first-century Christian writer claiming the posture of inquiry among eyewitnesses. That posture can be tested. It stands to be weighed."],sources:["1 Corinthians 15:3–7","Luke 1:1–4"]},{id:"j-wb-3",areaId:"witness-bench",title:"How the past is weighed",kicker:"Witness Square",unlockAfter:"wb-method",body:["Multiple attestation, embarrassment, early testimony, and contextual credibility are ordinary tools. They do not replace reading. They resist the story that every Christian report is a late pious novel.","Used honestly, they also resist the opposite laziness: “an early creed is already a laboratory proof.” History gives testimony, not a rerun."],sources:["Standard historical method as used in ancient history and historical Jesus studies"]},{id:"j-wb-4",areaId:"witness-bench",title:"Awkward beginnings",kicker:"Witness Square",unlockAfter:"wb-women",body:["The tomb stories begin with women, and Luke records that the apostles dismissed them (Luke 24:11). That is an odd opening if the only goal is later public respectability.","Outside the Gospels, Tacitus (Annals 15.44) notes Christus executed under Pilate and a movement that spread to Rome. Josephus (Antiquities 18.63–64) is partly disputed because of later Christian touches, and honesty about that dispute belongs in the dossier."],sources:["Mark 16:1–8","Luke 24:1–11","John 20:1–18","Tacitus, Annals 15.44","Josephus, Antiquities 18.63–64"]},{id:"j-ob-1",areaId:"observatory",title:"The universe is finely tuned for life",kicker:"Sky Watch",unlockAfter:"ob-tuning",body:["The universe is finely tuned for life — that fit points to a Designer.","Life-permitting ranges are extravagantly narrow across independent parameters; design predicts a habitable cosmos, blank chance does not."],sources:["Fine-tuning of physical constants and initial conditions (e.g. cosmological constant; a low-entropy start — an initial condition, not another force dial).","Aquinas, ST I, q.2, a.3 (Fifth Way); Psalm 19; Romans 1","Robin Collins, The Fine-Tuning Design Argument"]},{id:"j-ob-2",areaId:"observatory",title:"A mind that intended a habitable world",kicker:"Sky Watch",unlockAfter:"ob-design",body:["Fine-tuning is best explained by a mind that intended a habitable world.","Life-permitting ranges are extravagantly narrow; a Designer who wants observers leads us to expect that fit — blank indifference does not."],sources:["Likelihood / fine-tuning arguments (Collins). A low-entropy start is an initial condition, not another force dial.","Aquinas, ST I, q.2, a.3 (Fifth Way); Psalm 19; Romans 1"]},{id:"j-ob-3",areaId:"observatory",title:"The question beneath physics",kicker:"Sky Watch",unlockAfter:"ob-leibniz",body:["Leibniz’s question — why is there something rather than nothing? — is not retired by a successful cosmological model. Models describe a world that is already given.","When popular writing says the universe came from “nothing,” check whether the word still names a vacuum, a law, or a formalism. Those are somethings. The metaphysical question remains on the table."],sources:["Leibniz, “On the Ultimate Origination of Things”","Standard distinction between physical vacua and metaphysical nothing"]},{id:"j-ob-4",areaId:"observatory",title:"Life’s open threshold",kicker:"Sky Watch",unlockAfter:"ob-life",body:["Life’s specified information is a mark of mind. Cells require coordinated function. That is not a rumor; it is biology.","Treat the unfinished story as a place for wonder and for more work — and as a mark of mind. Do not stop the lab. Do not shrug the information away."],sources:["Contemporary abiogenesis research as an open program","Genesis 1 as theological, not a lab protocol"]},{id:"j-fg-1",areaId:"first-gate",title:"Unmoved mover",kicker:"Why Gate",unlockAfter:"fg-mover",body:["Aristotle and Aquinas begin with change: the everyday passage from potential to actual. If nothing explains its own becoming, and a stack of unexplained becomings is not an explanation, then there is a first actuality that is not itself a receiver of change.","Read “first” as the bottom of the explanation, not merely the earliest date on a calendar. That is why the argument can be aimed at the present cosmos, not only at a first Tuesday."],sources:["Aristotle, Physics VIII; Metaphysics XII","Aquinas, Summa Theologiae I, q.2, a.3 (First Way)"]},{id:"j-fg-2",areaId:"first-gate",title:"Necessary being",kicker:"Why Gate",unlockAfter:"fg-contingent",body:["Contingent things exist. A world made only of “might-not-have-beens” does not contain the reason why there is anything. Classical theism names the necessary ground God.","Rivals relocate necessity into the universe, or they accept a brute fact. Those are intelligible moves. They are not automatically cheaper. “It just is” is also a metaphysics."],sources:["Aquinas, ST I, q.2, a.3 (Third Way)","Leibniz on sufficient reason"]},{id:"j-fg-3",areaId:"first-gate",title:"Beginning and cause",kicker:"Why Gate",unlockAfter:"fg-kalam",body:["The kalām form is clean: what begins has a cause; the universe began; therefore it has a cause. The second premise is argued from the impossibility of an infinite past and from the cosmos we actually observe.","That yields a cause of the beginning. Personhood, goodness, and the name of the God of Abraham are further questions — some of them historical."],sources:["Philoponus against an eternal world","al-Ghazālī and the kalām tradition","Craig’s modern statement of the kalām syllogism"]},{id:"j-fg-4",areaId:"first-gate",title:"Honest limits",kicker:"Why Gate",unlockAfter:"fg-limits",body:["A sound cosmological argument is already a great deal. It is not yet the sermon on the mount, and it does not need to be. Aquinas does not stop at the Five Ways; he argues onward. The New Testament adds public claims about a particular life, death, and raising.","Pascal’s warning about the God of the philosophers is a warning against stopping. It is not a command to skip the philosophers."],sources:["Aquinas, ST I, qq.2–26 (existence toward attributes)","Pascal, Pensées (God of Abraham / philosophers)"]},{id:"j-hl-1",areaId:"high-lookout",title:"The moral grain of the world",kicker:"Meaning Ridge",unlockAfter:"hl-moral",body:["Duty presents itself as more than taste. A good God is the ground of a good law — the home that fits. Romans 2 treats that knowledge as widely shared, which is why injustice still has a name.","Romans 2:14–15 treats moral knowledge as widely shared. That is why strangers can still accuse one another of injustice and expect the accusation to mean something."],sources:["Romans 2:14–15","Aquinas, ST I-II, q.91","Augustine, City of God XIX"]},{id:"j-hl-2",areaId:"high-lookout",title:"The inside of mind",kicker:"Meaning Ridge",unlockAfter:"hl-mind",body:["Qualia, aboutness, the hard problem, and the norm of reason are not parlor tricks. They are what it is like to be a knower. A story of the world that cannot find a home for mind is a story that cannot find a home for the storyteller.","A living God is the home of mind: not an accident at the end of an indifferent process, but present at the beginning."],sources:["Augustine, De Trinitate X","John 1:1–4","Classical theism on God as living intellect"]},{id:"j-hl-3",areaId:"high-lookout",title:"Meaning that can be found",kicker:"Meaning Ridge",unlockAfter:"hl-meaning",body:["You can build a local meaning without naming God. The lookout asks whether that meaning is only assembled, or also received — whether the hunger for a final good has an object.","Ecclesiastes refuses to let work and pleasure pretend to be the final good, and also refuses to call them worthless as gifts. That double honesty is part of biblical wisdom."],sources:["Ecclesiastes 2:24; 9:7–10; 12:13"]},{id:"j-hl-4",areaId:"high-lookout",title:"Beauty as a signpost",kicker:"Meaning Ridge",unlockAfter:"hl-beauty",body:["Beauty wakes a hunger it cannot feed — longing for a country the sunset cannot give. Hungers like that usually correspond to real countries.","Psalm 19 treats the sky as speech. The observatory and the lookout are the same ridge at two hours of the day: measurement at dusk, longing after dark. The trail is unending because the object, if real, is not smaller than a game."],sources:["C. S. Lewis, “The Weight of Glory”; Surprised by Joy","Psalm 19:1–4"]},{id:"j-trail-1",areaId:"daily-trail",title:"First frost on the rail",kicker:"Daily Trail",unlockAfter:"trail-days-1",body:["You walked a morning that will not come again. The town keeps a small mark for that — not a trophy, a thank-you.","The trail will be here tomorrow. If you are away, it waits. Nothing you have already gathered is taken back."],sources:["A return gift for a single morning on the trail"]},{id:"j-trail-2",areaId:"daily-trail",title:"A second lantern",kicker:"Daily Trail",unlockAfter:"trail-days-2",body:["Two distinct mornings. The path is starting to know your step. Nothing is owed; the bench is still free."],sources:["A trail note for a second return"]},{id:"j-trail-3",areaId:"daily-trail",title:"Margin note from the clerk",kicker:"Daily Trail",unlockAfter:"trail-days-3",body:["Three distinct days on the trail. The archive clerk left this: “Return is a kind of courage.”"],sources:["A trail note for three unique mornings"]},{id:"j-trail-5",areaId:"daily-trail",title:"Five weather reports",kicker:"Daily Trail",unlockAfter:"trail-days-5",body:["Five different skies. The town does not scold the days you were away. It only saves a page for when you are here."],sources:["A trail note for five unique mornings"]},{id:"j-trail-7",areaId:"daily-trail",title:"A week of porches",kicker:"Daily Trail",unlockAfter:"trail-days-7",body:["Seven unique mornings. If you miss tomorrow, the trail waits. The marks you already made stay in the journal."],sources:["A trail note for seven unique mornings"]}];for(const a of So.lessons){const o=a.journal;if(!o?.body.length)continue;const r=Nt.find(h=>h.unlockAfter===a.id||h.id===o.id);r&&(o.title&&(r.title=o.title),o.kicker&&(r.kicker=o.kicker),r.body=o.body,o.sources.length&&(r.sources=o.sources))}const vg={id:"observatory",order:3,title:"Sky Watch",shortTitle:"Sky",subtitle:"A sky that did not have to be this way",blurb:"Science maps how the world runs. It does not forbid the question why.",intro:["Above the ridge a small observatory points at winter stars. The question here is not “Does a lab experiment prove God?” That would confuse the tools.","The question is: what kind of universe is this? Why are its laws hospitable to life? Why is there a concrete world with laws at all?","Fine-tuning, origins, and “something rather than nothing” begin from public facts and make a case for God. Hold the claim. Deploy it. The sky is not a shrug."],icon:"star",accent:"#7f9ec7",challenges:[{kind:"match",id:"ob-tuning",title:"Narrow ranges",idea:"the universe is finely tuned for life — that fit points to a Designer",prompt:"Tap a picture, then the mark that belongs. Two choices at a time.",context:"The universe is finely tuned for life — that fit points to a Designer. Life-permitting ranges are extravagantly narrow across independent parameters; design predicts a habitable cosmos, blank chance does not. Necessity, chance (often a multiverse — asserted to cancel the surprise — no evidence), or design: the fit still points to a Designer.",pairs:[{id:"lambda",gem:"star",scene:"expand",left:"Cosmological constant",right:"Much larger: expansion too fierce for galaxies; much more negative: recollapse"},{id:"strong",gem:"coin",scene:"bind",left:"Strong nuclear force",right:"Slight shift: familiar chemistry of hydrogen and heavier elements fails"},{id:"entropy",gem:"seed",scene:"tidy",left:"Early-universe entropy",right:"The initial low-entropy state is extravagantly special — an initial condition, not another force dial"},{id:"ratio",gem:"lamp",scene:"dial",left:"Gravity vs. electromagnetism",right:"Stars, long-lived structure, and chemistry sit in a delicate balance"}],teachOnWrong:"Ask what breaks if the number moves. Those extravagantly narrow, habitable ranges are the mark of a Designer.",deeper:"Design predicts this cosmos: cosmological constant, nuclear binding, a low-entropy start, gravity against electromagnetism — extravagantly narrow, habitable. That fit points to a Designer."},{kind:"build-argument",id:"ob-design",title:"A habitable cosmos",idea:"fine-tuning is best explained by a mind that intended a habitable world",prompt:"Place the next stone. Two choices. Leave the overclaims.",context:"Fine-tuning is best explained by a mind that intended a habitable world. Life-permitting ranges are extravagantly narrow; a Designer who wants observers leads us to expect that fit — blank indifference does not. Necessity, chance (often a multiverse — asserted to cancel the surprise — no evidence), or design: hold the Designer.",slots:[{id:"p1",role:"premise",label:"Premise 1",correctCardId:"narrow"},{id:"p2",role:"premise",label:"Premise 2",correctCardId:"surprise"},{id:"p3",role:"premise",label:"Premise 3",correctCardId:"expect"},{id:"c",role:"conclusion",label:"Conclusion",correctCardId:"live"}],cards:[{id:"narrow",text:"Several physical dials appear to have a life-permitting range that is extraordinarily narrow among conceivable values."},{id:"surprise",text:"That narrowness is surprising if the dials are a brute accident with no further explanation."},{id:"expect",text:"A mind that intended a habitable cosmos would lead us to expect such dials."},{id:"live",text:"Therefore the best explanation is a Designer who intended a habitable cosmos."},{id:"lab",text:"Therefore a laboratory has now measured God directly.",distractor:!0},{id:"which",text:"Therefore this proves which religious tradition is true in every detail.",distractor:!0}],teachOnWrong:"Leave the two overclaims. The narrow habitable fit lands a Designer, not which gospel.",deeper:"A Designer who wants observers predicts this habitable fit. The narrow ranges are the evidence. Hold the Designer."},{kind:"sort",id:"ob-leibniz",title:"Something rather than nothing",idea:"physics maps how the world runs; it does not finish why",prompt:"Keep the careful Leibniz reading. Toss the rest — a wrong toss bounces back.",context:"Leibniz: why is there something rather than nothing? The Big Bang describes an early hot state — not automatically absolute nothing.",keepLabel:"Keep",discardLabel:"Toss",tiles:[{id:"a",text:"Physics can map how this universe evolves; it does not by itself say why there is a concrete reality with laws.",bin:"keep"},{id:"b",text:"The Big Bang is a video of God creating, timestamped in Genesis.",bin:"discard"},{id:"c",text:"A wave function of the universe makes “why anything?” meaningless.",bin:"discard"},{id:"d",text:"In physics papers, “nothing” already means absolute non-being — a free lunch.",bin:"discard"}],teachOnWrong:"A vacuum is already a structured something. Equations describe a world that is already there.",deeper:"Fine-tuning and “why anything?” are siblings, not twins. One asks why this world’s numbers permit us; the other asks why there is a world."},{kind:"sort",id:"ob-life",title:"The threshold of life",idea:"life’s specified information is a mark of mind",prompt:"Keep the careful statement. Toss the gaps — a wrong toss bounces back.",context:"Cells store specified information and run a coordinated metabolism. Abiogenesis is an open research program — not a closed chapter.",keepLabel:"Keep",discardLabel:"Toss",tiles:[{id:"a",text:"“No complete naturalistic account yet” is not the same as “we demonstrated a miracle.”",bin:"keep"},{id:"b",text:"Because we cannot assemble a cell in a storm, theism is proven and research is irreverent.",bin:"discard"},{id:"c",text:"Because research continues, the chemical pathway is finished and the question is closed.",bin:"discard"},{id:"d",text:"Genesis 1 forbids asking biological questions.",bin:"discard"}],teachOnWrong:"Wonder is rational here. So is more work. “God of the gaps” and “science of the gaps” both tempt us.",deeper:"Life’s information looks like the work of mind. Wonder is rational. So is more work. Do not trade the mark for a shrug."}]},kg={id:"parable-hollow",order:1,title:"Story Creek",shortTitle:"Creek",subtitle:"Jesus stories that stick",blurb:"The Teacher spoke in pictures — not to hide the truth, but to make it move.",intro:["A creek path, oaks, and pictures you can hold: a road, a table, a lost coin in the dust.","Jesus taught in pictures. Play them. Then keep one true line."],icon:"oak",accent:"#6b8f71",challenges:[{kind:"sequence",id:"ph-road",title:"The Good Samaritan",idea:"neighbor is the one who shows mercy",prompt:"Place the Good Samaritan in the order Luke tells it.",context:"Luke 10:25–37. A lawyer asks, “Who is my neighbor?” Jesus answers with a story set on the Jerusalem–Jericho road — a real, dangerous descent.",items:[{id:"a",gem:"cup",text:"A lawyer asks Jesus, “And who is my neighbor?”"},{id:"b",gem:"heart",text:"A man is beaten and left half-dead on the road."},{id:"c",gem:"door",text:"A priest and then a Levite see him and pass by."},{id:"d",gem:"lamp",text:"Moved with compassion, a Samaritan binds the wounds, takes him to an inn, and pays."},{id:"e",gem:"star",text:"Jesus: “Go and do likewise.”"}],teachOnWrong:"Luke’s force depends on order: religious insiders fail first; the unexpected outsider becomes the measure of neighbor-love. Try again.",deeper:"Samaritans and Judeans were divided by worship and memory (see John 4:9). Jesus flips the question (Luke 10:36): mercy proves who the neighbor is. He makes the listener identify with the wounded man — and then with costly mercy."},{kind:"sort",id:"ph-father",title:"The father’s run",idea:"the father runs before the apology is finished",prompt:"Toss the weak readings. Keep what Luke 15 is actually pressing.",context:"Luke 15:11–32. In that world a patriarch running was undignified. The father runs before the son finishes his hired-hand speech.",keepLabel:"Keep",discardLabel:"Toss",tiles:[{id:"a",gem:"heart",text:"The father runs with mercy — before the speech is done.",bin:"keep"},{id:"b",gem:"coin",text:"The son earned the feast by writing a good apology.",bin:"discard"},{id:"c",gem:"star",text:"The older brother is the hero simply for staying home.",bin:"discard"},{id:"d",gem:"door",text:"The story is mainly about estate planning.",bin:"discard"}],teachOnWrong:"Grace arrives before the speech is done (Luke 15:20). The older brother is dutiful — and furious at mercy. Try the bins again.",deeper:"Luke 15 stacks three lost-and-found stories. God is not only willing to receive. God seeks. The feast is the Father’s idea."},{kind:"match",id:"ph-seeds",title:"Pictures of the kingdom",idea:"the kingdom arrives in pictures, not slogans",prompt:"Match each parable to the claim it is actually making.",context:"These are among the most-attested teachings in the Synoptic Gospels. A parable can have one main thrust — resist turning every detail into an allegory.",pairs:[{id:"sower",gem:"seed",left:"The sower",right:"Same word, different hearts"},{id:"sheep",gem:"heart",left:"Lost sheep",right:"The one is sought"},{id:"mustard",gem:"tree",left:"Mustard seed",right:"Small start, later shelter"},{id:"talents",gem:"coin",left:"The talents",right:"Use the trust; don’t bury it"}],teachOnWrong:"Look again at the main action of each story — soil, search, growth, or stewardship — rather than a moral you already liked.",deeper:"Jesus’ stories assume a God who speaks, seeks, grows a kingdom, and will ask what we did with a trust. They are not proofs. They are a portrait — and a demand."},{kind:"sort",id:"ph-debt",title:"An unpayable account",idea:"received mercy makes refusing mercy a contradiction",prompt:"Sort the claims. Only one belongs in the keep bin.",context:"Matthew 18:21–35. A servant forgiven an unpayable debt then throttles a peer over a small sum. The king reinstates the first debt.",keepLabel:"Keep",discardLabel:"Toss",tiles:[{id:"a",gem:"cup",text:"Received mercy makes refusing mercy a contradiction.",bin:"keep"},{id:"b",gem:"coin",text:"Forgiveness is a limited coupon on God’s spreadsheet.",bin:"discard"},{id:"c",gem:"door",text:"The first servant was right to demand prison for a small debt.",bin:"discard"},{id:"d",gem:"star",text:"Jesus is only reforming first-century banking.",bin:"discard"}],teachOnWrong:"Peter offered seven. Jesus breaks coupon-logic (Matt 18:22). The horror is ingratitude, not arithmetic.",deeper:"Mercy is not softness. It is the grain of God’s world — and then a question: will you live against that grain? See also Matt 6:12–15."}]},Tg={id:"witness-bench",order:2,title:"Witness Square",shortTitle:"Witness",subtitle:"What can we know about events we did not see?",blurb:"Historians cannot rerun the past. They weigh sources, time, and motive.",intro:["The old courthouse still faces the square. On the bench, the question is not “Can I feel this?” but “What kind of testimony is this, and what would a fair historian do with it?”","Christian faith is not only inward. It makes a public claim: Jesus of Nazareth died, was buried, and was reported alive by people who said they had seen him.","These challenges teach method as much as conclusion. Early, multiple, and costly testimony is not a laboratory proof — it is the kind of evidence history actually has."],icon:"scroll",accent:"#c4a35a",challenges:[{kind:"sequence",id:"wb-creed",title:"What Paul received",idea:"died, buried, raised, appeared — in that order",prompt:"Order the core of the tradition Paul says he “delivered” and “received.”",context:"1 Corinthians 15:3–5. Paul is writing to a church he founded, likely in the mid-50s AD. He presents this not as a new idea but as a received formula “of first importance.”",items:[{id:"a",text:"Christ died for our sins according to the Scriptures."},{id:"b",text:"He was buried."},{id:"c",text:"He was raised on the third day according to the Scriptures."},{id:"d",text:"He appeared to Cephas, then to the Twelve."}],teachOnWrong:"Paul’s wording is tightly patterned: death, burial, raising, appearances (1 Cor 15:3–5). Burial underlines that death was real; appearances underlines that “raised” is not only a metaphor.",deeper:"Verses 6–8 widen the circle: more than five hundred, James, “all the apostles,” and last of all Paul. A creed is not a video. It is a public, early summary of what the churches were already saying."},{kind:"sort",id:"wb-early",title:"Why historians call it early",idea:"the creed is early testimony, not a medieval insert",prompt:"Keep the careful historical claim. Toss the overclaims.",context:"1 Corinthians 15:3–5. Paul “received” and “delivered” the early core — died, buried, raised, appeared.",keepLabel:"Keep",discardLabel:"Toss",tiles:[{id:"a",text:"Paul “received” and “delivered” the early core: died, buried, raised, appeared (1 Cor 15:3–5).",bin:"keep"},{id:"b",text:"A medieval monk wrote the creed and copied it into Paul.",bin:"discard"},{id:"c",text:"The creed is a lab result that proves the resurrection like a chemical reaction.",bin:"discard"},{id:"d",text:"Paul invented the list in the second century after the Gospels.",bin:"discard"}],teachOnWrong:"The letter is mid-first-century. “I received / I delivered” is tradition language — weighty testimony, not a lab rerun.",deeper:"Compare Luke 1:1–4: a first-century writer claiming inquiry among eyewitnesses. That posture can be tested. It stands to be weighed."},{kind:"match",id:"wb-method",title:"Tools of the ancient historian",idea:"historians weigh sources; they cannot rerun the past",prompt:"Match each criterion to what it is actually testing.",context:"Used in historical Jesus research (and ancient history more broadly). These tools show which reports are hard to dismiss as late invention — early public testimony, not a lab rerun.",pairs:[{id:"multi",gem:"star",scene:"witnesses",left:"Multiple attestation",right:"Independent sources carrying the same core"},{id:"emb",gem:"coin",scene:"reluctant",left:"Embarrassment",right:"Details early Christians would be unlikely to invent"},{id:"early",gem:"lamp",scene:"clock",left:"Early testimony",right:"Closer in time, less room for legend to harden"},{id:"context",gem:"tree",scene:"judea",left:"Contextual credibility",right:"Fits the known first-century Jewish and Roman world"}],teachOnWrong:"Each tool answers a different question: how many streams, how awkward, how soon, how at-home in the period. Try pairing again.",deeper:"These criteria can be overused. They do not replace reading texts as wholes. They do resist a lazy story: “Someone, somewhere, made everything up much later.”"},{kind:"sort",id:"wb-women",title:"Idle talk",idea:"women as first witnesses is an awkward detail to invent",prompt:"Keep the careful historical move. Toss the overclaims.",context:"Women are first at the tomb (Mark 16:1–8; Luke 24:1–11; John 20). Luke 24:11: the report sounded like “idle talk.”",keepLabel:"Keep",discardLabel:"Toss",tiles:[{id:"a",text:"An inventor hunting courtroom credibility would more likely lead with respected men.",bin:"keep"},{id:"b",text:"Named women automatically make every detail certain.",bin:"discard"},{id:"c",text:"Luke 24:11 means the evangelists wanted readers to distrust women.",bin:"discard"},{id:"d",text:"Tacitus wrote the tomb story in Annals 15.44.",bin:"discard"}],teachOnWrong:"This is a costly detail that counts for the report’s honesty. Tacitus 15.44 notes the execution, not the tomb. Do not invent citations.",deeper:"Josephus, Antiquities 18.63–64, is partly disputed because of later Christian touches. Honesty about that dispute belongs in the dossier."}]},gl=[{version:"1.4.53",title:"XML packs · Easy core loop · Medium and Hard Hold",when:"2026-09-14",items:["Learn → Match → Hold copy loads from per-area XML packs (one file per street plus the porch index)","Full CoS harvest packs: Easy short story, Medium and Hard teach, Hold 10 / 12 / 15 — father-run Easy short story stays locked verbatim","Easy trail: all 35 facts in easyOrder","Easy Learn → Match → Hold still starts at Mercy / Story Creek and stays mercy-first — father-run before creed","Medium and Hard tiers; Hold levels up Easy → Medium → Hard; fail returns that idea to Easy","Journal scores best tier 10 / 12 / 15 per idea and shows the score on the page","Hard teach may go deeper; the held claim stays the same plain line on every tier","Hard tonight’s street is still all 35 facts, paced ~one place / 3–5 facts per sitting","Hold Done footer is glass over the card — not an opaque black slab","Match Hold next and other sticky CTA docks share the same translucent chrome","Easy Match win: MATCHED! is a badge, not a tappable gold pill — Hold next is the primary tap","Hard Match and street win stamps use the same juice — not a fake button","Easy after Hold: gold CTA is Read today’s story — next Learn, not Hold","Easy Match sentence matches the held claim — Neighbor is the one who shows mercy","Mercy Match place and person prompts differ for the road, the father-run, and the debt","Jericho-road Match art stays on the neighbor-road tile — not a distractor on other lines","Hold why chips keep choke on the true debt line — the miss is He was right to refuse mercy","Hard tonight’s street: ~one place / 3–5 facts per sitting, saved mid-street, Continue from Town","Hard after a sitting: Continue tonight’s street is the gold Town CTA — Walk today’s trail stays available, not the main next tap","Full Hard street — all game facts","Hard Link the street now matches every claim · reason · source fact to a place and person. Night Watch Love how-to and trail thank-you cards stay off the street.","Easy Fun: mercy-first until held on Easy","Cold Easy Learn → Match → Hold starts at Story Creek with Mercy — Neighbor is the one who shows mercy. After Mercy is Easy-held, the next Learn is the father-run — not a creed jump. Hard or older held, completed, or taught lines do not skip Mercy.","Settings → Reset this walk starts Easy at Mercy’s Story Creek line.","Easy Fun: one lesson loop, leaner Match, less Hold clutter","Easy Learn → Match → Hold stays on one line’s triad. If Learn taught the father-run, Match and Hold that same line. If mercy/Mercy/Story Creek, stay on mercy. No mid-loop lesson jump.","Easy: Learn before Match (teach-before-test)","Easy home is Learn → Match → Hold. Read the story first. Match stays locked until that teach. After Learn, Match is the clear tap. After a Match win, Hold next.","First Learn teaches the story plus who keeps it and where it lives — idea, person, and place. Then Match asks that same sentence ↔ place ↔ person.","Easy Match cuts the Next screens between steps. Three picks, then Hold next or Home. A miss still says Wrong. Tap this one: … and names the card.","Easy Match stop + shorter Hold why chips for Plain 5/5","Easy Hold why-chips stay short. Luke 10: First the hurt man, then help. Luke 15: The father hugs him first. Hold prompts stay Tap the line you kept. then Tap why this is true.","Hold practice hides the saved-line queue so it does not feel like a filing cabinet.","Easy: Night Watch fully hidden until Match→Hold solid","Town (soon) waits under Settings → More. Night Watch stays on Hard.","Night Watch Love line is tool how-to, not a claim. Luke 10 split: Love names the tool (v27). Compassion is the Samaritan’s move (v33). The held claim stays Neighbor is the one who shows mercy (v36–37).","Night Watch miss says Wrong — tap the glowing face, so locked tools do not look like the task.","Easy Night Watch still finishes at 6/6.","Place titles stay Story Creek, Witness Square, Sky Watch, Why Gate, Meaning Ridge.","daily-stars stays pure positive — heavens speak of a Maker. No multiverse lecture."]},{version:"1.4.52",title:"Fun polish · Easy core loop · glass Hold CTA",when:"2026-09-14",items:["Hold Done footer is glass over the card — not an opaque black slab","Match Hold next and other sticky CTA docks share the same translucent chrome","Easy Match win: MATCHED! is a badge, not a tappable gold pill — Hold next is the primary tap","Hard Match and street win stamps use the same juice — not a fake button","Easy after Hold: gold CTA is Read today’s story — next Learn, not Hold","Easy Match sentence matches the held claim — Neighbor is the one who shows mercy","Mercy Match place and person prompts differ for the road, the father-run, and the debt","Jericho-road Match art stays on the neighbor-road tile — not a distractor on other lines","Hold why chips keep choke on the true debt line — the miss is He was right to refuse mercy","Hard tonight’s street: ~one place / 3–5 facts per sitting, saved mid-street, Continue from Town","Hard after a sitting: Continue tonight’s street is the gold Town CTA — Walk today’s trail stays available, not the main next tap","Full Hard street — all game facts","Hard Link the street now matches every claim · reason · source fact to a place and person. Night Watch Love how-to and trail thank-you cards stay off the street.","Easy lesson pack: 9 Learn→Match→Hold lines","Easy Fun: mercy-first until held on Easy","Cold Easy Learn → Match → Hold starts at Story Creek with Mercy — Neighbor is the one who shows mercy. After Mercy is Easy-held, the next Learn is the father-run — not a creed jump. Hard or older held, completed, or taught lines do not skip Mercy.","easyLoopLine only counts Easy-taught and Easy-held markers, in order mercy → father → debt → creed → women → lantern → stars → cosmos → moral.","Settings → Reset this walk starts Easy at Mercy’s Story Creek line.","Easy Fun: one lesson loop, leaner Match, less Hold clutter","Easy Learn → Match → Hold stays on one line’s triad. If Learn taught the father-run, Match and Hold that same line. If mercy/Mercy/Story Creek, stay on mercy. No mid-loop lesson jump.","Easy: Learn before Match (teach-before-test)","Easy home is Learn → Match → Hold. Read the story first. Match stays locked until that teach. After Learn, Match is the clear tap. After a Match win, Hold next.","First Learn teaches the story plus who keeps it and where it lives — idea, person, and place. Then Match asks that same sentence ↔ place ↔ person.","Easy Match cuts the Next screens between steps. Three picks, then Hold next or Home. A miss still says Wrong. Tap this one: … and names the card.","Easy Match stop + shorter Hold why chips for Plain 5/5","Easy Hold why-chips stay short. Luke 10: First the hurt man, then help. Luke 15: The father hugs him first. Hold prompts stay Tap the line you kept. then Tap why this is true.","Hold practice hides the saved-line queue so it does not feel like a filing cabinet.","Easy: Night Watch fully hidden until Match→Hold solid","Town (soon) waits under Settings → More. Night Watch stays on Hard.","Night Watch Love line is tool how-to, not a claim. Luke 10 split: Love names the tool (v27). Compassion is the Samaritan’s move (v33). The held claim stays Neighbor is the one who shows mercy (v36–37).","Night Watch miss says Wrong — tap the glowing face, so locked tools do not look like the task.","Easy Night Watch still finishes at 6/6.","Place titles stay Story Creek, Witness Square, Sky Watch, Why Gate, Meaning Ridge.","daily-stars stays pure positive — heavens speak of a Maker. No multiverse lecture."]},{version:"1.4.49",title:"Full Hard street · Easy Fun core loop",when:"2026-09-14",items:["Full Hard street — all game facts","Hard Link the street now matches every claim · reason · source fact to a place and person. Night Watch Love how-to and trail thank-you cards stay off the street.","Easy lesson pack: 9 Learn→Match→Hold lines","Easy Fun: mercy-first until held on Easy","Cold Easy Learn → Match → Hold starts at Story Creek with Mercy — Neighbor is the one who shows mercy. After Mercy is Easy-held, the next Learn is the father-run — not a creed jump. Hard or older held, completed, or taught lines do not skip Mercy.","easyLoopLine only counts Easy-taught and Easy-held markers, in order mercy → father → debt → creed → women → lantern → stars → cosmos → moral.","Settings → Reset this walk starts Easy at Mercy’s Story Creek line.","Easy Fun: one lesson loop, leaner Match, less Hold clutter","Easy Learn → Match → Hold stays on one line’s triad. If Learn taught the father-run, Match and Hold that same line. If mercy/Mercy/Story Creek, stay on mercy. No mid-loop lesson jump.","Easy: Learn before Match (teach-before-test)","Easy home is Learn → Match → Hold. Read the story first. Match stays locked until that teach. After Learn, Match is the clear tap. After a Match win, Hold next.","First Learn teaches the story plus who keeps it and where it lives — idea, person, and place. Then Match asks that same sentence ↔ place ↔ person.","Easy Match cuts the Next screens between steps. Three picks, then Hold next or Home. A miss still says Wrong. Tap this one: … and names the card.","Easy Match stop + shorter Hold why chips for Plain 5/5","Easy Hold why-chips stay short. Luke 10: First the hurt man, then help. Luke 15: The father hugs him first. Hold prompts stay Tap the line you kept. then Tap why this is true.","Hold practice hides the saved-line queue so it does not feel like a filing cabinet.","Easy: Night Watch fully hidden until Match→Hold solid","Town (soon) waits under Settings → More. Night Watch stays on Hard.","Night Watch Love line is tool how-to, not a claim. Luke 10 split: Love names the tool (v27). Compassion is the Samaritan’s move (v33). The held claim stays Neighbor is the one who shows mercy (v36–37).","Night Watch miss says Wrong — tap the glowing face, so locked tools do not look like the task.","Easy Night Watch still finishes at 6/6.","Place titles stay Story Creek, Witness Square, Sky Watch, Why Gate, Meaning Ridge.","daily-stars stays pure positive — heavens speak of a Maker. No multiverse lecture."]},{version:"1.4.48",title:"Easy Fun core loop",when:"2026-09-12",items:["Easy lesson pack: 9 Learn→Match→Hold lines","Easy Fun: mercy-first until held on Easy","Cold Easy Learn → Match → Hold starts at Story Creek with Mercy — Neighbor is the one who shows mercy. After Mercy is Easy-held, the next Learn is the father-run — not a creed jump. Hard or older held, completed, or taught lines do not skip Mercy.","easyLoopLine only counts Easy-taught and Easy-held markers, in order mercy → father → debt → creed → women → lantern → stars → cosmos → moral.","Settings → Reset this walk starts Easy at Mercy’s Story Creek line.","Easy Fun: one lesson loop, leaner Match, less Hold clutter","Easy Learn → Match → Hold stays on one line’s triad. If Learn taught the father-run, Match and Hold that same line. If mercy/Mercy/Story Creek, stay on mercy. No mid-loop lesson jump.","Easy: Learn before Match (teach-before-test)","Easy home is Learn → Match → Hold. Read the story first. Match stays locked until that teach. After Learn, Match is the clear tap. After a Match win, Hold next.","First Learn teaches the story plus who keeps it and where it lives — idea, person, and place. Then Match asks that same sentence ↔ place ↔ person.","Easy Match cuts the Next screens between steps. Three picks, then Hold next or Home. A miss still says Wrong. Tap this one: … and names the card.","Easy Match stop + shorter Hold why chips for Plain 5/5","Easy Hold why-chips stay short. Luke 10: First the hurt man, then help. Luke 15: The father hugs him first. Hold prompts stay Tap the line you kept. then Tap why this is true.","Hold practice hides the saved-line queue so it does not feel like a filing cabinet.","Easy: Night Watch fully hidden until Match→Hold solid","Town (soon) waits under Settings → More. Night Watch stays on Hard.","Night Watch Love line is tool how-to, not a claim. Luke 10 split: Love names the tool (v27). Compassion is the Samaritan’s move (v33). The held claim stays Neighbor is the one who shows mercy (v36–37).","Night Watch miss says Wrong — tap the glowing face, so locked tools do not look like the task.","Easy Night Watch still finishes at 6/6.","Place titles stay Story Creek, Witness Square, Sky Watch, Meaning Ridge.","daily-stars stays pure positive — heavens speak of a Maker. No multiverse lecture."]},{version:"1.4.47",title:"Easy Fun core loop",when:"2026-09-12",items:["Easy Fun: mercy-first until held on Easy","Cold Easy Learn → Match → Hold starts at Story Creek with Mercy — Neighbor is the one who shows mercy. Hard or older held, completed, or taught lines do not skip Mercy.","easyLoopLine only counts Easy-taught and Easy-held markers, in order mercy → creed → lantern. If Mercy is already held on Easy, the next lesson can be creed / Silas.","Settings → Reset this walk starts Easy at Mercy’s Story Creek line.","Easy Fun: one lesson loop, leaner Match, less Hold clutter","Easy Learn → Match → Hold stays on one line’s triad. If Learn taught creed/Silas, Match and Hold that same line. If mercy/Mercy/Story Creek, stay on mercy. No mid-loop lesson jump.","Easy: Learn before Match (teach-before-test)","Easy home is Learn → Match → Hold. Read the story first. Match stays locked until that teach. After Learn, Match is the clear tap. After a Match win, Hold next.","First Learn teaches the story plus who keeps it and where it lives — idea, person, and place. Then Match asks that same sentence ↔ place ↔ person.","Easy Match cuts the Next screens between steps. Three picks, then Hold next or Home. A miss still says Wrong. Tap this one: … and names the card.","Easy Match stop + shorter Hold why chips for Plain 5/5","Easy Hold why-chips stay short. Luke 10: First the hurt man, then help. Luke 15: The father hugs him first. Hold prompts stay Tap the line you kept. then Tap why this is true.","Hold practice hides the saved-line queue so it does not feel like a filing cabinet.","Easy: Night Watch fully hidden until Match→Hold solid","Town (soon) waits under Settings → More. Night Watch stays on Hard.","Night Watch Love line is tool how-to, not a claim. Luke 10 split: Love names the tool (v27). Compassion is the Samaritan’s move (v33). The held claim stays Neighbor is the one who shows mercy (v36–37).","Night Watch miss says Wrong — tap the glowing face, so locked tools do not look like the task.","Easy Night Watch still finishes at 6/6.","Place titles stay Story Creek, Witness Square, Sky Watch, Meaning Ridge."]},{version:"1.4.46",title:"Easy Fun core loop",when:"2026-09-12",items:["Easy Fun: one lesson loop, leaner Match, less Hold clutter","Easy Learn → Match → Hold stays on one line’s triad. If Learn taught creed/Silas, Match and Hold that same line. If mercy/Mercy/Story Creek, stay on mercy. No mid-loop lesson jump.","Easy: Learn before Match (teach-before-test)","Easy home is Learn → Match → Hold. Read the story first. Match stays locked until that teach. After Learn, Match is the clear tap. After a Match win, Hold next.","First Learn teaches the story plus who keeps it and where it lives — idea, person, and place. Then Match asks that same sentence ↔ place ↔ person.","Easy Match cuts the Next screens between steps. Three picks, then Hold next or Home. A miss still says Wrong. Tap this one: … and names the card.","Easy Match stop + shorter Hold why chips for Plain 5/5","Easy Hold why-chips stay short. Luke 10: First the hurt man, then help. Luke 15: The father hugs him first. Hold prompts stay Tap the line you kept. then Tap why this is true.","Hold practice hides the saved-line queue so it does not feel like a filing cabinet.","Easy: Night Watch fully hidden until Match→Hold solid","Town (soon) waits under Settings → More. Night Watch stays on Hard.","Night Watch Love line is tool how-to, not a claim. Luke 10 split: Love names the tool (v27). Compassion is the Samaritan’s move (v33). The held claim stays Neighbor is the one who shows mercy (v36–37).","Night Watch miss says Wrong — tap the glowing face, so locked tools do not look like the task.","Easy Night Watch still finishes at 6/6.","Place titles stay Story Creek, Witness Square, Sky Watch, Meaning Ridge."]},{version:"1.4.45",title:"Easy core loop",when:"2026-09-12",items:["Easy: Learn before Match (teach-before-test)","Easy home is Learn → Match → Hold. Read the story first. Match stays locked until that teach. After Learn, Match is the clear tap. After a Match win, Hold next.","First Learn teaches the story plus who keeps it and where it lives — this idea lives at Story Creek, with Mercy. Then Match asks sentence ↔ place ↔ person.","If Match opens early: Learn this first.","Easy: Night Watch fully hidden until Match→Hold solid","Town (soon) waits under Settings → More. Night Watch stays on Hard.","Easy Match stop + shorter Hold why chips for Plain 5/5","Easy Match ends after one sentence → place → person. Win burst, then Hold next or Home — no looping matches.","Easy Hold why-chips are short plain sentences (~8–12 words). Luke 15: The father hugs him first. Hold prompts stay Tap the line you kept. then Tap why this is true.","Night Watch miss says Wrong — tap the glowing face, so locked tools do not look like the task.","Night Watch Love line is tool how-to, not a claim. Luke 10 split: Love names the tool (v27). Compassion is the Samaritan’s move (v33). The held claim stays Neighbor is the one who shows mercy (v36–37).","Easy Night Watch still finishes at 6/6.","Place titles stay Story Creek, Witness Square, Sky Watch, Meaning Ridge."]},{version:"1.4.44",title:"Easy core loop",when:"2026-09-12",items:["Easy Match stop + shorter Hold why chips for Plain 5/5","Easy Match ends after one sentence → place → person. Win burst, then Hold next or Home — no looping matches.","Easy Match miss is one line: Wrong. Tap this one: … A win has one next tap.","Easy Hold why-chips are short plain sentences (~8–12 words). Luke 15: The father hugs him first. Wrong: The older brother is the hero just for staying. No throttles, no stacked theology in the chip.","Hold prompts stay Tap the line you kept. then Tap why this is true.","Easy: Night Watch fully hidden until Match→Hold solid","Easy home is Match and Hold. Town (soon) waits under Settings → More. Night Watch stays on Hard.","Night Watch Love line is tool how-to, not a claim. Luke 10 split: Love names the tool (v27). Compassion is the Samaritan’s move (v33). The held claim stays Neighbor is the one who shows mercy (v36–37). Mercy Wren stays the keeper name.","Night Watch miss says Wrong — tap the glowing face, so locked tools do not look like the task. Easy Night Watch still finishes at 6/6.","Place titles stay Story Creek, Witness Square, Sky Watch, Meaning Ridge."]},{version:"1.4.43",title:"Easy core loop",when:"2026-09-12",items:["Easy: Night Watch fully hidden until Match→Hold solid","Easy home is Match and Hold. Town (soon) waits under Settings → More. Night Watch stays on Hard.","Night Watch Love line is tool how-to, not a claim. Luke 10 split: Love names the tool (v27). Compassion is the Samaritan’s move (v33). The held claim stays Neighbor is the one who shows mercy (v36–37). Mercy Wren stays the keeper name.","Easy home, nav, and tree say Hold — saved lines stay a subtitle, not the only name.","Easy Hold is kid-plain: Tap the line you kept. then Tap why this is true. One prompt on screen — no duplicate. A reason is why this is true — taught once, then the chrome stays plain. Keep this still sits under the reason.","Easy why-options stay short. Luke 15: The father hugs him first. The older brother is home — and angry. Wrong: The older brother is the hero just for staying.","Night Watch miss says Wrong — tap the glowing face, so locked tools do not look like the task. Easy Night Watch still finishes at 6/6.","Place titles stay Story Creek, Witness Square, Sky Watch, Meaning Ridge.","Match stays sentence → place → person with a named miss and Next."]},{version:"1.4.42",title:"Easy core loop",when:"2026-09-12",items:["Easy: Night Watch hidden until Match→Hold is solid (Town already soon).","Easy home, nav, and tree say Hold — saved lines stay a subtitle, not the only name.","Night Watch Love line is tool how-to, not a claim. Luke 10 split: Love names the tool (v27). Compassion is the Samaritan’s move (v33). The held claim stays Neighbor is the one who shows mercy (v36–37). Mercy Wren stays the keeper name.","Easy Hold is kid-plain: Tap the line you kept. then Tap why this is true. One prompt on screen — no duplicate. A reason is why this is true — taught once, then the chrome stays plain. Keep this still sits under the reason.","Easy why-options are short plain sentences. Matthew 18: He was forgiven a huge debt, then choked a neighbor over a small one. Wrong: Jail him over a tiny debt.","Hold review chips drop identical duplicate buttons. The true line stays; a second button that reads the same is gone.","Night Watch miss says Wrong — tap the glowing face, so locked tools do not look like the task. Easy Night Watch still finishes at 6/6.","Place titles stay Story Creek, Witness Square, Sky Watch, Meaning Ridge. Easy home is Match and Hold — Night Watch (soon) and Town (soon) wait under Settings → More.","Match stays sentence → place → person with a named miss and Next. A few Easy prompts now name the line instead of asking you to infer it."]},{version:"1.4.41",title:"Easy core loop",when:"2026-09-11",items:["Night Watch Love line is tool how-to, not a claim. Luke 10 split: Love names the tool (v27). Compassion is the Samaritan’s move (v33). The held claim stays Neighbor is the one who shows mercy (v36–37). Mercy Wren stays the keeper name.","Easy Hold is kid-plain: Tap the line you just kept. then Tap why it stands. A reason is why it stands — taught once, then the chrome stays plain. Keep this still sits under the reason.","Hold review chips drop identical duplicate buttons. The true line stays; a second button that reads the same is gone.","Night Watch miss says Wrong — tap the glowing face, so locked tools do not look like the task. Easy Night Watch still finishes at 6/6.","Place titles stay Story Creek, Witness Square, Sky Watch, Meaning Ridge. Easy home is still Match, Saved, and Night Watch — Town (soon) waits under Settings → More.","Match stays sentence → place → person with a named miss and Next. A few Easy prompts now name the line instead of asking you to infer it."]},{version:"1.4.40",title:"Easy core loop",when:"2026-09-11",items:["Easy Night Watch / Hold facing line is now A true line can turn an unkind sentence toward heaven. Hard claim stays A true line can turn a cheap claim toward heaven.","Easy Hold is kid-plain: Tap the line you just kept. then Tap why it stands. A reason is why it stands — taught once, then the chrome stays plain. Keep this still sits under the reason.","Hold review chips drop identical duplicate buttons. The true line stays; a second button that reads the same is gone.","Night Watch miss says Wrong — tap the glowing face, so locked tools do not look like the task. Easy Night Watch still finishes at 6/6.","Place titles stay Story Creek, Witness Square, Sky Watch, Meaning Ridge. Easy home is still Match, Saved, and Night Watch — Town (soon) waits under Settings → More.","Match stays sentence → place → person with a named miss and Next. A few Easy prompts now name the line instead of asking you to infer it."]},{version:"1.4.39",title:"Easy core loop",when:"2026-09-11",items:["Easy Hold is kid-plain: Tap the line you just kept. then Tap why it stands. A reason is why it stands — taught once, then the chrome stays plain. Keep this still sits under the reason.","Hold review chips drop identical duplicate buttons. The true line stays; a second button that reads the same is gone.","Night Watch miss says Wrong — tap the glowing face, so locked tools do not look like the task. Easy Night Watch still finishes at 6/6.","Place titles stay Story Creek, Witness Square, Sky Watch, Meaning Ridge. Easy home is still Match, Saved, and Night Watch — Town (soon) waits under Settings → More.","Match stays sentence → place → person with a named miss and Next. A few Easy prompts now name the line instead of asking you to infer it."]},{version:"1.4.38",title:"Easy core loop",when:"2026-09-11",items:["Place titles now say what the stop is for: Story Creek, Witness Square, Sky Watch, Meaning Ridge. Area and plot ids stay so saves do not break.","Easy home is still Match, Saved, and Night Watch — Town (soon) waits under Settings → More.","Easy Night Watch finishes at 6/6. TAP n/6 is the score. Six face taps win the night.","Match stays sentence → place → person with a named miss and Next."]},{version:"1.4.37",title:"Easy core loop",when:"2026-09-11",items:["The First Gate is now Why Gate — the stop that asks why there is a world at all. Ansel Gate still keeps it.","Easy home is still Match, Saved, and Night Watch — Town (soon) waits under Settings → More.","Easy Night Watch finishes at 6/6. TAP n/6 is the score. Six face taps win the night.","Match stays sentence → place → person with a named miss and Next."]},{version:"1.4.36",title:"Easy core loop",when:"2026-09-11",items:["Cast names now stick to place and idea: Juniper Wick, Silas Whitman, Nora Skye, Hope Ridge. River, Mercy Wren, and Ansel Gate stay.","Easy home is still Match, Saved, and Night Watch — Town (soon) waits under Settings → More.","Easy Night Watch finishes at 6/6. TAP n/6 is the score. Six face taps win the night.","Match stays sentence → place → person with a named miss and Next."]},{version:"1.4.35",title:"Easy core loop",when:"2026-09-11",items:["Match uses a flat candy tile for Neighbor shows mercy — same simple shapes as the other cards. Mercy’s creek stays the creek tile.","Easy home is still Match, Saved, and Night Watch — Town (soon) waits under Settings → More.","Easy Night Watch finishes at 6/6. TAP n/6 is the score. Six face taps win the night.","Match stays sentence → place → person with a named miss and Next."]},{version:"1.4.34",title:"Easy core loop",when:"2026-09-11",items:["Match shows the Jericho-road picture first on Neighbor shows mercy, then the words. Mercy’s creek still uses the creek tile.","Easy home is still Match, Saved, and Night Watch — Town (soon) waits under Settings → More.","Easy Night Watch finishes at 6/6. TAP n/6 is the score. Six face taps win the night.","Match stays sentence → place → person with a named miss and Next."]},{version:"1.4.33",title:"Easy core loop",when:"2026-09-11",items:["Easy home has no Town map and no sticky fog box over the buttons. Match, Saved, and Night Watch sit clean on the page.","Town (soon) waits under Settings → More. Hard still has the streets.","Easy Hold is still the teach chip, one main-idea line, a scrollable reason, and Keep this.","Easy Night Watch finishes at 6/6. Match stays sentence → place → person with a named miss."]},{version:"1.4.32",title:"Easy core loop",when:"2026-09-11",items:["Easy Hold is one line: the teach chip, the main idea, a scrollable reason, and Keep this. The sentence is not the button.","Sticky Keep this / Done never covers the reason. Easy home is still Match, Saved, and Night Watch — Town (soon) waits under Settings → More.","Easy Night Watch finishes at 6/6. TAP n/6 is the score. Six face taps win the night.","Match stays sentence → place → person with a named miss and Next."]},{version:"1.4.31",title:"Easy core loop",when:"2026-09-11",items:["Easy home is Match, Saved, and Night Watch. The Town map waits under Settings → More as Town (soon).","Easy Night Watch finishes at 6/6. TAP n/6 is the score. Six face taps win the night.","Match stays sentence → place → person with a named miss and Next.","Saved keeps the sentences you held. Dig deeper, What’s new, themes, and Heaven-growth theater wait under Settings → More."]},{version:"1.4.30",title:"Easy core loop",when:"2026-09-11",items:["Easy Town stays a full readable map. No Lit! zoom. Tap a building to Manage it, walk, or Build this.","Easy Night Watch finishes at 6/6. TAP n/6 is the score. Six face taps win the night.","Match stays sentence → place → person with a named miss and Next.","Saved keeps the sentences you held. Dig deeper, What’s new, themes, and Heaven-growth theater wait under Settings → More."]},{version:"1.4.29",title:"Easy core loop",when:"2026-09-11",items:["Easy Town is Match, Hold, Night Watch, and a readable map. Tap a building to Manage it, walk, or Build this when you earned it.","Easy Night Watch finishes at 6/6. TAP n/6 is the score. Six face taps win the night.","Match stays sentence → place → person with a named miss and Next.","Saved keeps the sentences you held. Dig deeper, What’s new, themes, and Heaven-growth theater wait under Settings → More."]},{version:"1.4.28",title:"The town grows into Heaven",when:"2026-09-11",items:["The map starts as Eden — porch, creek garden, a star on the ridge. Streets and houses appear as you walk, hold, and Build this.","Heaven is earned. The trail climbs as you keep the lines. City of Heaven stands when the lookout is lit and the lines still hold.","Easy Night Watch finishes at 6/6 — six face taps, or a clear win. Hearts stay hearts; TAP n/6 is the score.","Town names stay in their slots while the town grows. Portraits and speech bubbles no longer cover the chips.","Easy chrome uses plain instructions and examples — unkind sentence, not mean line; Keep/Toss tiles drop throttle, first-century banking, and contradiction."]},{version:"1.4.27",title:"The town grows into Heaven",when:"2026-09-11",items:["The map starts as Eden — porch, creek garden, a star on the ridge. Streets and houses appear as you walk, hold, and Build this.","Heaven is earned. The trail climbs as you keep the lines. City of Heaven stands when the lookout is lit and the lines still hold."]},{version:"1.4.26",title:"Town names sit in their own slots",when:"2026-09-11",items:["Town chips stack so every full name stays readable at phone width — Story Creek, Witness Square, East porch, Star lamps, Pages, City of Heaven.","Portraits sit above the name band. Names no longer cover each other."]},{version:"1.4.25",title:"Saved folds by section",when:"2026-09-11",items:["Saved, Journal, and Profile fold by section. Tap a row to open it. The first section starts open.","Each fold shows a short name and a count — not a wall of pages.","Journal nests street pages under Places. Profile folds sentences, places, people, things you can use, and connections."]},{version:"1.4.24",title:"Town map labels · Easy and Hard",when:"2026-09-11",items:["Town map labels no longer pile up. The picture fills the panel — no purple empty bands.","Witness Square opens Manage. If the square is still locked, it says why and offers Walk Story Creek next.","Reading is Easy and Hard. Claim teach stays once. Hard Night Watch is unchanged."]},{version:"1.4.23",title:"Manage and Build this back on the map",when:"2026-09-11",items:["Easy map names Manage and Build this again. Tap a creek or square lot to open it.","Love shows the line you kept. Love, Logic, Reason, and Science stay on Easy Night Watch.","A claim is the main idea we hold to be true — taught once on Easy."]},{version:"1.4.22",title:"Tap the face · numbered match steps",when:"2026-09-11",items:["Night Watch Easy freezes the glowing face under the arrow. Tap the face.","A match keeps 1 · Sentence → 2 · Place → 3 · Person at the top.","Easy Settings drop V0, unlocks, and streak wallpaper. Hard words stay on Hard."]},{version:"1.4.21",title:"One Easy Night Watch path",when:"2026-09-11",items:["Night Watch Easy is one glowing person and Love — tap the person for the whole wave.","A match is three screens: pick, then Wrong. Tap this one: …, then Next.","Hard Night Watch and Hard links stay the same."]},{version:"1.4.20",title:"One person for the whole night",when:"2026-09-11",items:["Night Watch keeps one glowing person and Love — tap the person for every tap, not just the first.","Road lamps and locked tools stay hidden until that Easy night is done.","A right match waits on Next before new cards show."]},{version:"1.4.19",title:"One tap line at a time",when:"2026-09-11",items:["A match now says Tap a sentence, then Tap a place, then Tap a person — one short line.","A miss is one line: Wrong. Tap this one: Neighbor shows mercy.","Night Watch hides locked tools while Tap this person is up, so only Love stays."]},{version:"1.4.18",title:"Only one person on the road",when:"2026-09-11",items:["Night Watch hides the road lamps while Tap this person is up, so only one glowing person is on the board.","A wrong match starts Wrong. Tap This one. then names the card.","Love says Love — tap the person until you tap."]},{version:"1.4.17",title:"Only one person + tap order",when:"2026-09-11",items:["Night Watch shows only the glowing person while Tap this person is up. Other walkers stay hidden until you tap them.","Match says: Tap the sentence, then the place, then the person.","A wrong match pulses the right card and marks it This one."]},{version:"1.4.16",title:"One person to tap + plainer words",when:"2026-09-11",items:["Night Watch shows one glowing person to tap. Other walkers fade and step aside.","A wrong match names the exact card: Tap: “Neighbor shows mercy.”","Easy labels say Saved sentences, Connections, and Things you can use."]},{version:"1.4.15",title:"Big Night Watch people + next pick",when:"2026-09-11",items:["Night Watch people are big and slow. They pause with Tap this person, then crawl.","A wrong match says which sentence to pick next.","Easy words stay short. Main idea stays after the one teach."]},{version:"1.4.14",title:"Easy Wrong match + bigger Night Watch walkers",when:"2026-09-11",items:["Easy miss copy is Wrong match plus a plain why — no neighbor-line jargon.","Easy Night Watch walkers are bigger and slower. Hard pace stays.","Love tool line: Love — when compassion moves you, help like the Samaritan. Tap the glowing face. No cheap line on Easy chrome.","First Easy teach chip: Main idea = the short true line we keep. Easy chrome prefers match over link."]},{version:"1.4.13",title:"Easy kid-plain Journal + first Night Watch cue",when:"2026-09-11",items:["Easy Journal meta is who · where · picture · tool — no Anchored, deploys, or after-quote dump.","Easy chrome drops cheap claim, dossier, unsealed, soils, and Trail notes. Reason says why this is true.","First Easy Night Watch pauses the walker with a pulse arrow: Tap this person.","Link prompt: Pick the sentence that fits this story. Match miss: Wrong match — try again. Picture-match still Keep / Remove / Save your picks."]},{version:"1.4.12",title:"Easy main idea lines + full lot names",when:"2026-09-10",items:["Easy Night Watch, Journal, and Use chrome say main idea — not claim or Deploy wallpaper.","Picture-match: Keep the right pictures. Remove wrong picks. Miss: Wrong pair — try a different main idea. Lock-in is Save your picks.","Easy map labels are full names: Story Creek, Witness Square, East porch."]},{version:"1.4.11",title:"Easy main idea chrome + bigger map labels",when:"2026-09-10",items:["Easy teaches “A claim is the main idea we hold to be true” once, then chrome says main idea only.","Sort lock-in is Save your picks. Weak readings is wrong picks.","Town map labels are bigger at phone size — Hollow, Porch, and Square."]},{version:"1.4.10",title:"Easy short card + named next tap",when:"2026-09-10",items:["Easy Tap this next names what opens — Tap this next — short Jesus story. The story is a short card with Continue and Skip reading, not a wall.","Easy Town hides the Eden-to-Heaven legend dump. Link the street is Match sentence → place → person.","A claim is the main idea we hold to be true — taught once, then Easy chrome says main idea. Story Creek gets a Jesus-story creek subtitle."]},{version:"1.4.9",title:"Easy Tap this next",when:"2026-09-10",items:["Easy Town keeps one gold Tap this next. Link and Night Watch stay in the tool row — not a stack of poetic cards.","A Night Watch miss on Easy says: You missed the walker — tap the moving person.","Easy manage and Night Watch drop scrapbook, deploy, held-line, and cheap-claim chrome. Dig deeper reads Read more. Claim is not wallpaper."]},{version:"1.4.8",title:"Easy Link clue + one-tap Night Watch",when:"2026-09-10",items:["Easy Link shows a short who/where/story clue with the picture so the first pick is learnable. A miss still says why that choice is wrong.","Easy Night Watch is one tap: Do this, then tap the walker. No Unlock → Plant chain, and no “turn cheap lines toward heaven” on Easy chrome.","Easy keeps plain verbs. Claim, hold, and deploy get a one-line gloss only when a locked tool needs them."]},{version:"1.4.7",title:"Build this stays on screen",when:"2026-09-10",items:["Manage is a phone-bottom sheet. Build this and Walk stay on screen at 390px — Dig deeper and tool tiles scroll above them.","Night Watch in Easy still opens with one big Do this."]},{version:"1.4.6",title:"Link starts with the picture",when:"2026-09-10",items:["Link the street leads with a big picture when we have one — porch lamp, creek, bench, faces — then a short label. Not a wall of sentences.","Dig deeper chips still read Scripture, Ancient, Classic, and Modern · believing."]},{version:"1.4.5",title:"Sticky next tap",when:"2026-09-10",items:["Build this, Walk, Done, and Next stay at the bottom of manage sheets and Link — no hunting below the fold.","A wrong tap or a locked building says why, and what is still needed, in one sentence.","Night Watch in Easy: what it is, then Do this. Deploy means use a claim you held."]},{version:"1.4.4",title:"Recall, then Later",when:"2026-09-10",items:["A held line is an offer, not a pin. Later keeps it for this walk. Not today waits until morning. No guilt.","A sitting is about 3 pages — never the whole journal.","A second look at a hold comes at a new angle, with Dig deeper — not the first teach again.","Link the street leads with a picture when we have one: faces, creek, bench, porch lamp."]},{version:"1.4.3",title:"Classic sources",when:"2026-09-10",items:["Dig deeper: Scripture and older witnesses when they fit; later faithful sources welcome when they help.","Source chips read Scripture, Ancient, Classic, and Modern · believing."]},{version:"1.4.2",title:"Done, then Build this",when:"2026-09-10",items:["After you pick the reason that still holds, a gold Done waits — the quiz does not vanish on its own.","Link the street still uses the 3-step wizard. After the third link: All 3 links complete, then Done.","The building button is Build this. The success beat is still Built! You earn the next look by learning, not by paying."]},{version:"1.4.1",title:"Plain next words",when:"2026-09-10",items:["Easy names the next tap in plain words: Read today’s story, Choose the sentence to remember, Connect sentence → place → person.","After you pick a sentence, Reason never sits still — you get Held, then Done (or a miss you can try again).","Link the street is a 3-step wizard: one pick per step, checkmarks, then Link complete.","A building you earned shows one Upgrade button. If you have not earned it yet, one sentence says what is missing. Upgrade still means a better building you earn by learning, not by paying."]},{version:"1.4.0",title:"A city you build",when:"2026-09-10",items:["The town map is a city of buildings. Tap a lot to manage it: see the level, who lives there, which ideas are lit, and Dig deeper.","Upgrades are earned by learning — finishing walks, holding claims, Link the street, and journal pages. Tap Upgrade to raise the next look. You do not pay.","Walk stays porch → creek → square → sky → gate → lookout → Heaven. Easy still teaches: a claim is what we hold to be true."]},{version:"1.3.9",title:"The map tells the walk",when:"2026-09-10",items:["Town lots have in-world reasons: Mercy’s pictures at the creek, Silas’s ledger on the square, Juniper’s lamp on the porch, Nora’s sky on the ridge, Ansel’s stone at the gate, Hope’s look over the town.","The legend names the walk: porch lamp → creek stories → square names → ridge sky, then gate and lookout toward Heaven.","Link the street still lights the same three spots. Easy still teaches a claim as what we hold to be true."]},{version:"1.3.8",title:"Link lights the map",when:"2026-09-10",items:["Link the street: each match lights a spot on the town map. Tap the place later to open that idea again.","Easy still: you’ll reopen them from your scrapbook of links. One story at a time."]},{version:"1.3.7",title:"Kalām, positively",when:"2026-09-10",items:["Why Gate journal: the kalām syllogism leads cleanly — what begins has a cause. Sources are Philoponus and al-Ghazālī first; Craig is the modern statement only.","Witness Square: Luke’s inquiry posture stands to be weighed."]},{version:"1.3.6",title:"Teach the words",when:"2026-09-10",items:["Hard words are taught first: a claim is what we hold to be true. Reason is why it stands. Source is where it comes from. Creed, parable, fine-tuning, and premise get a kid-plain gloss before they show up in play.","Teach still comes before the Hold lock — story and picture first, then the claim. Easy mode uses stronger glosses. Mystery can wait until after the line is taught.","Unread jargon (contingency, qualia, raw parameters) stays in Hard / Dig deeper, or is taught as “might not have been,” “felt redness,” and “life’s dials.” Kalām is taught as the beginning argument first.","Easy mode is still off until you ask — Welcome checkbox or Settings → Reading."]},{version:"1.3.5",title:"Say the line",when:"2026-09-10",items:["After every win, one claim to say out loud. Why it stands and the source wait in Dig deeper — and on Profile.","First session: one Do this next card. The town stays candy; it does not add a second primary tap under the map.","Easy mode still off until you ask — Welcome checkbox or Settings → Reading."]},{version:"1.3.4",title:"Easy mode",when:"2026-09-10",items:["Easy mode: plainer words, bigger taps, fewer choices at once. Off by default — turn it on at Welcome or Settings → Reading.","Teaches and Holds use shorter sentences and define hard words once. Creed is “old shared belief”; parable is “Jesus story”; mind map is “your scrapbook of links.” The claims stay the same.","Town opens with one Do this next card. Link the street sits above the map, with a tap-idea → place → person demo and a plain takeaway after you match."]},{version:"1.3.3",title:"Readable town",when:"2026-09-10",items:["Profile gathers River’s unlocks — held ideas, places, people, tools, and mind-map links. Open it from Town or Settings.","Dig deeper: Scripture and older witnesses when they fit; later faithful sources welcome when they help.","Reset progress is buried in Settings → Danger zone and asks before it wipes the save. It is not on the town screen.","Claims, journal, mind map, and link blocks wrap or scroll on a phone — no clipped takeaways.","Isaiah 53’s Servant is the Jesus the church confesses. Witness, kalām, beauty, and life lines lead with the hold."]},{version:"1.3.2",title:"Town mind map",when:"2026-09-10",items:["Tap a place on the town map to open its mind map — person, place, and the ideas you unlocked.","Link the street: snap idea ↔ place ↔ person. Those links light nodes you can reopen from the map.","River’s portrait is a cleaner fair-blonde candy face."]},{version:"1.3.1",title:"River’s look",when:"2026-09-10",items:["River — the traveler you play — is the fair blonde candy portrait on Welcome, town, and Settings."]},{version:"1.3.0",title:"V0 launch",when:"2026-09-10",items:["Candy faces live on the town; lamps, creek, and folk idle and cheer.","Night Watch hits harder — tools stay below the board on a phone.","Sky Watch teaches first, then two choices. Miss, Try again, finish.","This list is the hook for later packs. Settings always shows the live version."]},{version:"1.2.0",title:"Designer hold",when:"2026-09-09",items:["Fine-tuning Hold stays Designer-first. The triad is only on two Sky Watch clues."]}];function Wk(a){return gl.find(o=>o.version===a)??gl[0]}const Qt="1.4.53",Ik="city.silver.unending",oa=1,Ed="silver-city-progress-v1",Ok="silver-city-progress-v1.bak",en={river:{id:"river",name:"River",shortName:"River",role:"Traveler",seeking:"Whether the case for God can be walked, not only shouted."},juniper:{id:"juniper",name:"Juniper Wick",shortName:"Juniper",role:"Morning lantern",seeking:"One honest line you can still say at breakfast."},mercy:{id:"mercy",name:"Mercy Wren",shortName:"Mercy",role:"Parable-teller",seeking:"Stories that ask what kind of neighbor you will be.",areaId:"parable-hollow"},silas:{id:"silas",name:"Silas Whitman",shortName:"Silas",role:"Witness clerk",seeking:"Names, dates, and what the first reports actually said.",areaId:"witness-bench"},nora:{id:"nora",name:"Nora Skye",shortName:"Nora",role:"Sky-watch keeper",seeking:"Wonder that is not afraid of a telescope.",areaId:"observatory"},ansel:{id:"ansel",name:"Ansel Gate",shortName:"Ansel",role:"Why-gate keeper",seeking:"Why there is a world at all — and the God who answers it.",areaId:"first-gate"},hope:{id:"hope",name:"Hope Ridge",shortName:"Hope",role:"Meaning-ridge keeper",seeking:"Duty, mind, meaning, and beauty — without mocking the person still walking.",areaId:"high-lookout"}},Rk={"parable-hollow":"mercy","witness-bench":"silas",observatory:"nora","first-gate":"ansel","high-lookout":"hope"};function jo(a){return en[Rk[a]??"river"]}const ot={purpose:"A 60-second Christian reasoning game: sort ideas, choose one takeaway, and remember why it stands tomorrow.",who:"You are River. Juniper is your guide. Each day you practice one Christian idea.",playGoal:"Goal: keep the lines that support today’s claim; toss the distractors; then choose the claim and reason you’ll remember.",takeaway:"Choose the one-sentence takeaway you can repeat tomorrow, then choose why it stands.",tapTakeaway:"Tap the takeaway",whyItStands:"Why it stands",lockSort:"Lock in the sort."},qk={"parable-hollow":{hello:"Sit by the creek. Jesus taught in pictures so the truth could walk around inside you.",after:"Keep the line, not my voice. Neighbor is the one who shows mercy."},"witness-bench":{hello:"I copy names on the square. Public reports live here — the creed is a ledger line, not a creek story.",after:"Hold the creed: died, buried, raised, appeared."},observatory:{hello:"Dome’s open on the ridge. We look up. Fine-tuning lives with the sky.",after:"If a sky line stuck, say it on the stairs."},"first-gate":{hello:"The stone only asks why there is a world. That’s as far as we walk tonight.",after:"A first cause is a lot. It is not yet the sermon on the mount."},"high-lookout":{hello:"Wind’s honest up here. Duty, mind, meaning, beauty — sit with them.",after:"If a hunger woke, don’t be ashamed. Hungers map to real countries."}},Ra={porch:{who:"juniper",here:"Lamp’s ready. Tap the glow.",built:"Porch stood up.",lit:"Lantern’s holding.",unlocked:"East lot’s staked.",afterWin:"The porch caught.",grew:"Lamp kicked."},hollow:{who:"mercy",here:"Creek path’s open.",built:"Cabin’s standing.",lit:"Oaks are lit.",unlocked:"Mercy’s staking the lot.",afterWin:"The creek grew.",grew:"Another oak."},bench:{who:"silas",here:"Ledger’s on the square.",built:"Hall’s up.",lit:"Names are warm.",unlocked:"Silas unlocked the bench.",afterWin:"The square filled.",grew:"Another window."},observatory:{who:"nora",here:"Dome’s waiting on the ridge.",built:"Glass is set.",lit:"Stars caught the glass.",unlocked:"Nora opened the ridge.",afterWin:"The ridge woke.",grew:"Glass caught."},gate:{who:"ansel",here:"East road’s asking why.",built:"Arch is standing.",lit:"Stone’s warm.",unlocked:"Ansel unbarred the road.",afterWin:"A gate rose.",grew:"Stone settled."},lookout:{who:"hope",here:"High wind. Come up.",built:"Tower’s up.",lit:"Ridge lantern’s on.",unlocked:"Hope marked the climb.",afterWin:"The ridge grew.",grew:"Flag kicked."},journal:{who:"river",here:"Pages live in that house.",built:"Dossier house is up.",lit:"Pages are glowing.",unlocked:"A house for what you can still say.",afterWin:"A page landed.",grew:"Another page."},lamps:{who:"juniper",here:"Street lamps remember the walks.",built:"Lamps are up.",lit:"The street remembered.",unlocked:"First lamp on the street.",afterWin:"A lamp caught.",grew:"Another lamp."}};function la(a){return Ra[a]??Ra.porch}function Dk(a){return a==="parable-hollow"?Ra.hollow:a==="witness-bench"?Ra.bench:a==="observatory"?Ra.observatory:a==="first-gate"?Ra.gate:a==="high-lookout"?Ra.lookout:Ra.porch}function Pk(a,o,r=!1){const h=la(a);return o==="Lit!"?h.lit:o==="Built!"?r&&a==="journal"?"Page house is up.":h.built:o==="Grew!"?h.grew:h.unlocked}const Gk="Five walks, one trail. None of us is the evidence. We only kept you company while you gathered it. The Author, if he is real, is not smaller than a game.";function Ce(a,o,r,h,d,m,w,y){return{id:a,claim:o,reason:r,source:h,claimChoices:[o,d,m],reasonChoices:[r,w,y]}}const Mo={"ph-road":Ce("ph-road","Neighbor is the one who shows mercy.","Jesus makes the listener identify with the wounded man, then with the Samaritan moved with compassion.","Luke 10:25–37","Neighbor means the person who already looks like you.","The priest is the hero because he kept the law.","The story is mainly a map of the Jericho road.","Mercy is optional once you have classified the victim."),"ph-father":Ce("ph-father","The father runs with mercy before the speech is done.","Honor is spent so the son can be embraced; the older brother shows nearness without joy.","Luke 15:11–32","The son earned the feast by writing a good apology.","The story is mainly about dividing an estate.","The father waits until justice is complete.","The older brother is the hero for staying home."),"ph-seeds":Ce("ph-seeds","The kingdom arrives in pictures, not slogans.","Soil, search, a tiny seed, and a trust form a portrait — not a slogan.","Matthew 13; Luke 15; Matthew 25","Every parable is an allegory of every detail.","The kingdom is only for people who already understand.","The sower proves every heart is the same.","The talents story is about hiding gifts until heaven."),"ph-debt":Ce("ph-debt","Received mercy makes refusing mercy a contradiction.","The servant forgiven an unpayable debt then throttles a peer over a small sum.","Matthew 18:21–35","Forgiveness is a limited coupon on God’s spreadsheet.","Jesus is only reforming first-century banking.","Peter’s “seven times” was already the full measure.","The first servant was right to demand prison."),"wb-creed":Ce("wb-creed","Paul hands on an early public creed: died, buried, raised, appeared.","Burial resists a merely “spiritual” death; appearances resist a merely “spiritual” raising.","1 Corinthians 15:3–8","The creed is Paul’s private dream from decades later.","Paul invented the formula on the spot in Corinth.","“Buried” is only poetic decoration.","Appearances are admitted to be visions with no named people."),"wb-early":Ce("wb-early","The resurrection claim sits close to the events, not as a late legend.","Paul quotes a received formula and names known people; Luke claims inquiry among witnesses.","1 Corinthians 15:3–7; Luke 1:1–4","Early is the same as laboratory proof.","No first-century writer claims to have asked witnesses.","Named people make a report less testable.","Distance in time is the only historical question that matters."),"wb-method":Ce("wb-method","Ordinary historical tools weigh testimony; they do not replace reading.","Multiple attestation, embarrassment, early reports, and context resist “late pious novel.”","Standard historical method","An early creed is already a laboratory proof.","Every Christian report is automatically a late novel.","Method is a way to skip the texts themselves.","Embarrassment means a story must be false."),"wb-women":Ce("wb-women","The first tomb reports begin with women — an awkward opening if invented for respectability.","Luke records that the apostles dismissed them — a costly opening if the goal were instant respectability.","Luke 24:1–11","The Gospels open with the Roman senate converting overnight.","Women were the most legally impressive public witnesses.","Luke sands away any dismissal of the first report.","Outside writers never mention Christus or Pilate."),"ob-tuning":Ce("ob-tuning","The universe is finely tuned for life — that fit points to a Designer.","Life-permitting ranges are extravagantly narrow across independent parameters; design predicts a habitable cosmos, blank chance does not.","Fine-tuning of physical constants and initial conditions (e.g. cosmological constant; a low-entropy start — initial condition, not another force dial).","Fine-tuning is a rumor with no name in science.","A habitable cosmos needs no explanation at all.","Life-permitting ranges are wide; blank chance predicts a habitable cosmos just as well.","The fittedness is only a rumor in the numbers."),"ob-design":Ce("ob-design","Fine-tuning is best explained by a mind that intended a habitable world.","Life-permitting ranges are extravagantly narrow; a Designer who wants observers leads us to expect that fit — blank indifference does not.","Likelihood / fine-tuning arguments (Collins). A low-entropy start is an initial condition, not another force dial.","A habitable cosmos needs no Designer.","Fine-tuning already proves a particular gospel.","A mind wanting observers would not expect life-permitting numbers.","Likelihood arguments are automatically dishonest."),"ob-leibniz":Ce("ob-leibniz","Why is there something rather than nothing remains after a cosmological model.","Models describe a world already given; a physical “vacuum” is still something.","Leibniz; the vacuum/nothing distinction","A successful model retires the metaphysical question.","“Nothing” in popular writing always means metaphysical nothing.","Laws and vacua are not somethings.","The question only applies to Tuesdays."),"ob-life":Ce("ob-life","Life’s specified information is a mark of mind.","Cells store coordinated information; that looks like the work of a mind — wonder is rational, and so is more work.","Abiogenesis as an open program; Genesis 1 as theology","A flask has already demonstrated a miracle.","Cells require no coordinated information.","The unfinished story means we should end research.","Genesis 1 is a lab protocol."),"fg-mover":Ce("fg-mover","Change here and now needs a first actuality that is not itself a receiver of change.","Nothing reduces itself from potential to actual; an unexplained stack of changers is not an explanation.","Aquinas, ST I, q.2, a.3 (First Way)","This is only a story about dominoes at the Big Bang.","Each changing thing explains itself.","“First” here means the earliest date on a calendar.","Infinite backlog automatically explains present change."),"fg-contingent":Ce("fg-contingent","A world of might-not-have-beens still needs a necessary ground.","Contingent things exist; “it just is” is also a metaphysics, not automatically cheaper.","Aquinas’s Third Way; Leibniz on sufficient reason","Contingent things contain the reason why there is anything.","Rivals are unintelligible and need not be named.","Necessary being is only a weather report.","Brute fact is not a metaphysical move."),"fg-kalam":Ce("fg-kalam","If what begins has a cause and the universe began, it has a cause.","That yields a Cause of the beginning; naming Abraham’s God takes further historical steps.","Kalām tradition; contemporary analytic statements","A cause of the beginning is already the whole creed.","The form never mentions a beginning.","The second premise cannot be argued at all.","A first cause automatically names Jesus."),"fg-limits":Ce("fg-limits","A cosmological argument is already a great deal — and not yet the sermon on the mount.","Aquinas argues onward from the Ways; the New Testament adds a particular history.","Aquinas ST I; Pascal on philosophers and Abraham","The Five Ways are already the whole gospel.","Pascal commands you to skip the philosophers.","Stopping at a first cause is required.","History has nothing further to add."),"hl-moral":Ce("hl-moral","Duty presents itself as more than taste — and theism is a natural home for that.","Romans 2 treats moral knowledge as widely shared, which is why strangers can accuse one another.","Romans 2:14–15","Duty is only a preference we pretend is law.","Atheist moral realism is impossible to name.","Moral argument is a sneer at people who doubt.","Strangers cannot expect injustice to mean anything."),"hl-mind":Ce("hl-mind","A story of the world must find a home for mind — including the storyteller.","Theism is a reply in which mind is present at the beginning, not only an accident at the end.","The hard problem; classical theism on intellect","Qualia and aboutness are parlor tricks.","Theism is the only reply anyone has offered.","A story without mind can still house the storyteller with no remainder.","Mind is easy to treat as leftover steam."),"hl-meaning":Ce("hl-meaning","Local meaning can be built — the lookout asks whether it is also received.","Ecclesiastes refuses to let work and pleasure pretend to be the final good, and refuses to call them worthless as gifts.","Ecclesiastes 2; 9; 12","Work and pleasure are the final good.","Ecclesiastes calls every gift worthless.","The hunger for a final good has no question attached.","You cannot build any local meaning without naming God."),"hl-beauty":Ce("hl-beauty","Beauty wakes a hunger it cannot feed — hungers usually correspond to real countries.","Longing for a country the sunset cannot give is a mark that we were made for that country; Psalm 19 treats the sky as speech.","Lewis, Weight of Glory; Psalm 19:1–4","A sunset deducts God as a theorem.","Hungers never correspond to real countries.","Psalm 19 treats the sky as silent decoration.","The lookout and the observatory cannot share a ridge."),"daily-lantern":Ce("daily-lantern","A lamp is meant to be seen.","Jesus uses an ordinary lamp and a city on a hill — public without being proud.","Matthew 5:14–16","We are told to become the sun.","Light is only for insiders behind a door.","The picture is a command to boast.","A hidden lamp is the point of the saying."),"daily-gems":Ce("daily-gems","Jesus taught with pictures you can hold.","A lamp is seen, seed meets different hearts, and the cup is poured for many — gift, not wage.","Matthew 5; Mark 4; Matthew 26:28; Luke 22:20","Pictures are only decoration.","Mercy is a wage you finish earning.","Every heart is the same soil.","A hidden lamp is the point."),"daily-seed":Ce("daily-seed","The same word meets different soils; some seed is lost.","The parable invites hearing; it does not flatter every field.","Mark 4:1–9","Every field is guaranteed a harvest.","Lost seed means the sower failed.","Good soil is a slogan, not a way of hearing.","Jesus never names withering or birds."),"daily-names":Ce("daily-names","The resurrection claim stacks named witnesses, not one private voice.","Paul lists Cephas, the Twelve, and more than five hundred — many still living then.","1 Corinthians 15:5–6","Paul refuses to name anyone.","Only one anonymous dreamer is cited.","A crowd appearance would have been hidden.","Cephas is left off the list."),"daily-creed":Ce("daily-creed","The creed sits between the event and Paul’s letter.","If the formula is early, the claim is close to what it names: died, buried, raised.","1 Corinthians 15:3–4","Paul invents the creed as he writes.","Burial is skipped because it does not matter.","The letter is older than any tradition it quotes.","Nothing was handed on; it was only felt."),"daily-stars":Ce("daily-stars","The heavens already speak of a Maker; fine-tuning fits that voice.","Scripture treats the created order as intelligible testimony — design inference and “the heavens declare” land in the same grain.","Psalm 19:1–4; Romans 1:20","The heavens are silent about a Maker.","Fine-tuning contradicts the psalm.","Scripture treats the sky as decoration only.","Design inference and “the heavens declare” cannot share a grain."),"daily-life":Ce("daily-life","Life, place, and mind are not cheap facts.","Copying cells, a habitable band, and a mind that can do science all look given — the marks of a Maker.","Acts 17:24–25","Chemistry is easy to dismiss.","“It happened” is automatically the last word.","A habitable band is an unremarkable accident with no question.","Minds that do science need no home in the story."),"daily-scroll":Ce("daily-scroll","We hold a river of copies, not the first ink.","Scribes copy, later hands compare, then a modern page prints a recovered text.","Isaiah 40:8","We hold the first ink in a glass case.","Comparison of copies is cheating.","A line falls from the sky onto a printer.","Transmission has no human hands."),"daily-isaiah":Ce("daily-isaiah","Isaiah 53’s Servant is the Jesus the church confesses — wounded for others, silent like a lamb.","The poem’s Servant suffers for others and does not answer with a sword; the church names that Servant as Jesus.","Isaiah 53:4–12","The servant conquers Rome by sword.","The poem is about estate planning.","The servant never suffers for anyone.","Wounds are unrelated to healing in the poem."),"daily-grace":Ce("daily-grace","Grace is gift, not wage; faith receives; boast starves.","The claim is that God moves first — not that you finished the map.","Ephesians 2:8–9","Grace is a prize for high scores.","Faith is a wage God owes you.","Boast is what the gift is for.","Salvation is your own doing."),"daily-rest":Ce("daily-rest","Tired people are named first; rest is the gift, not a steeper hill.","The invitation is to a person — “Come to me” — not a performance.","Matthew 11:28","Rest is a prize for climbing harder.","Jesus names the energetic first.","The invitation is to a steeper program.","Weariness disqualifies you."),"daily-neighbor":Ce("daily-neighbor","Mercy makes a neighbor; pedigree does not.","Jesus asks who *proved* to be a neighbor — the one who showed mercy.","Luke 10:36–37","The priest who passed by is the measure.","Neighbor is settled before anyone crosses the road.","Mercy is unrelated to the question.","The wounded man must first classify the helper."),"daily-empty":Ce("daily-empty","The first Easter reports include an empty place, women, fear, and wonder.","The town does not sand that awkwardness into a tidy triumph.","Luke 24:2–3","Rome instantly converts the senate.","Women are absent from the first reports.","The tomb is found occupied and explained.","Fear is edited out of the opening."),"daily-cosmos":Ce("daily-cosmos","The universe exists and did not have to — so a Source is worth naming.","The psalms ask the question out loud and expect a Giver, not a shrug.","Psalm 8:3–4","Questions about a source are impolite.","Existence plus contingency yields no question.","The universe had to exist just as it is.","The psalms refuse to look at the heavens."),"daily-door":Ce("daily-door","Jesus’ “door” is a particular way in with a wide anyone.","You may refuse it; the town will not lock you in a pew.","John 10:9","The door is a dead end.","Pasture is denied on the other side.","“Anyone” is narrowed to insiders only.","The image is a wall, not an entrance."),"j-trail-1":Ce("j-trail-1","A morning walked is kept — not as a trophy, as a thank-you.","If you are away, the trail waits; nothing already gathered is taken back.","Daily Trail","Missing a day erases the journal.","The town keeps marks to shame you.","Return is forbidden after a gap.","A first morning does not count."),"j-trail-2":Ce("j-trail-2","Two mornings are enough for the path to know your step.","Nothing is owed; the bench is still free.","Daily Trail","Two mornings create a debt you must pay.","The bench is reserved for perfect streaks.","Return is a fine, not a kindness.","The path refuses a second step."),"j-trail-3":Ce("j-trail-3","Return is a kind of courage.","Three distinct days are marked without scolding the ones you missed.","Daily Trail","Return is only for people who never left.","The clerk erases pages after a gap.","Courage means never resting.","Three days unlock a punishment."),"j-trail-5":Ce("j-trail-5","Five skies are saved; empty days are not scolded.","The town only keeps a page for when you are here.","Daily Trail","Empty days delete five marks.","The town scolds every quiet morning.","Pages are only for perfect calendars.","Weather reports are used to shame you."),"j-trail-7":Ce("j-trail-7","Seven unique mornings still leave tomorrow free.","If you miss, the trail waits; marks you made stay in the journal.","Daily Trail","A week means you may never rest.","Missing tomorrow burns the journal.","Seven days become a debt collector.","The trail closes after a week."),"td-watch":Ce("td-watch","Love — tap the matching face. A true line turns a cheap claim toward heaven.","Love, logic, reason, and science you have kept can divert a false step up the ridge.","Luke 10:25–37 · the night road","A town holds because the streets are pretty.","Defense is shouting until no one asks.","The Samaritan story is only about travel safety.","A lamp replaces the need for a claim.")};for(const a of So.lessons)Mo[a.id]=bg(a,"medium");function qt(a){return Mo[a]}function xg(a,o="medium"){return Hk(a,o)??Mo[a]}function zk(a,o){const r=(o??[]).filter(h=>!!h.why).map(h=>({claim:h.text,reason:h.why}));return r.length>1?r:[{claim:a.claim,reason:a.reason}]}function Sg(a,o){return Mo[a]??Mo[o]}const Jk=2,tt=[{id:"porch",title:"East porch",blurb:"Juniper’s lamp. You arrive here so today’s line can be seen."},{id:"hollow",title:"Story Creek",blurb:"Mercy’s creek. Jesus stories live where pictures can walk.",areaId:"parable-hollow"},{id:"bench",title:"Witness Square",blurb:"Silas’s ledger on the square. Public names, not parables.",areaId:"witness-bench"},{id:"observatory",title:"Sky Watch",blurb:"Nora’s dome. The sky’s fit belongs on the ridge.",areaId:"observatory"},{id:"gate",title:"Why Gate",blurb:"Ansel’s arch. The stone asks why there is a world at all.",areaId:"first-gate"},{id:"lookout",title:"Meaning Ridge",blurb:"Hope’s tower. Duty, mind, meaning, and beauty look over the town.",areaId:"high-lookout"},{id:"journal",title:"Dossier house",blurb:"River’s pages. What you can still say lives in the house."},{id:"lamps",title:"Star lamps",blurb:"Juniper’s street lamps. The town remembers walks you kept."}],Co=["ph-road","ph-father","ph-seeds","ph-debt"],li=["wb-creed","wb-early","wb-method","wb-women"],ci=["ob-tuning","ob-design","ob-leibniz","ob-life"],hi=["fg-mover","fg-contingent","fg-kalam","fg-limits"],Ao=["hl-moral","hl-mind","hl-meaning","hl-beauty"];function Jt(a,o){return a.filter(r=>o.includes(r)).length}function yo(a,o,r){return a>=o&&o>0?"lit":a>0?"built":r?"scaffold":"empty"}function jg(a){return Object.values(a).reduce((o,r)=>o+r,0)}function ds(a,o){const r=Jt(Co,o.completed),h=Jt(li,o.completed),d=Jt(ci,o.completed),m=Jt(hi,o.completed),w=Jt(Ao,o.completed),y=o.dailyDates.length,f=o.journal.length,g=jg(o.stars);switch(a){case"porch":return y>=3||o.streak>=3?"lit":y>=1?"built":"scaffold";case"hollow":return yo(r,Co.length,y>=1);case"bench":return yo(h,li.length,r>=Jk);case"observatory":return yo(d,ci.length,h>=li.length);case"gate":return yo(m,hi.length,d>=ci.length);case"lookout":return yo(w,Ao.length,m>=hi.length);case"journal":return f>=12?"lit":f>=4?"built":f>=1?"scaffold":"empty";case"lamps":return g+(o.defense?.cleared??0)>=12?"lit":g+(o.defense?.cleared??0)>=4?"built":g+(o.defense?.cleared??0)>=1?"scaffold":"empty";default:return"empty"}}function Hd(a,o){return o?Jt(Co,a.completed)<Co.length?"hollow":Jt(li,a.completed)<li.length?"bench":Jt(ci,a.completed)<ci.length?"observatory":Jt(hi,a.completed)<hi.length?"gate":Jt(Ao,a.completed)<Ao.length?"lookout":a.journal.length<12?"journal":"lamps":"porch"}function _k(a,o){switch(a){case"porch":return{name:"daily"};case"journal":case"lamps":return{name:"journal"};case"hollow":return{name:"area",areaId:"parable-hollow"};case"bench":return o?{name:"area",areaId:"witness-bench"}:{name:"area",areaId:"parable-hollow"};case"observatory":return{name:"area",areaId:o?"observatory":"witness-bench"};case"gate":return{name:"area",areaId:o?"first-gate":"observatory"};case"lookout":return{name:"area",areaId:o?"high-lookout":"first-gate"};default:return{name:"hub"}}}function Uk(a){const o=tt.length;return{standing:tt.filter(h=>{const d=ds(h.id,a);return d==="built"||d==="lit"}).length,possible:o}}const ud=["eden","village","town","gold","heaven"],Ty={eden:"Eden",village:"Village",town:"Lit town",gold:"Gold city",heaven:"City of Heaven"},Bk={eden:"Eden",village:"Village",town:"Town",gold:"Gold",heaven:"Heaven"},Fk={eden:"You arrive at Juniper’s lamp. The creek garden — Story Creek — holds Jesus stories. Heaven waits on the ridge.",village:"Mercy’s oaks and Silas’s square. Stories first, then public names.",town:"Nora’s dome looks up. Fine-tuning lives with the sky.",gold:"Ansel’s gate asks why there is a world. The lookout is close enough to see.",heaven:"Hope’s ridge and the City of Heaven. You kept the trail."},$k=8,Kk={eden:.14,village:.34,town:.56,gold:.8,heaven:1};function Yk(a){return a==="eden"?"seed":a==="village"?"wait":a==="town"?"rise":a==="gold"?"ridge":"city"}function Vk(a){return a==="eden"?null:a==="village"?"Heaven waits":a==="town"?"Toward Heaven":a==="gold"?"The ridge":"City of Heaven"}function Xk(a){const o=Rd(a),r=a.held?.length??0;return o.lookout==="lit"&&r>=$k?"heaven":o.gate==="built"||o.gate==="lit"||o.lookout!=="empty"?"gold":o.bench==="built"||o.bench==="lit"||o.observatory!=="empty"?"town":(a.dailyDates?.length??0)>=1||o.hollow!=="empty"?"village":"eden"}function Wd(a,o){switch(a){case"porch":return o.dailyDates.length;case"hollow":return Jt(Co,o.completed);case"bench":return Jt(li,o.completed);case"observatory":return Jt(ci,o.completed);case"gate":return Jt(hi,o.completed);case"lookout":return Jt(Ao,o.completed);case"journal":return o.journal.length;case"lamps":return jg(o.stars)+(o.defense?.cleared??0);default:return 0}}function Qk(a,o,r){return o==="porch"&&!r?"Walk next":a==="scaffold"||a==="empty"?"Build next":"Still lit"}function Zk(a,o,r,h=!1){switch(a){case"porch":return o==="scaffold"||o==="empty"?"Juniper’s porch roof will go on":o==="built"?"The east lantern will hold":"The porch stays lit";case"hollow":return o==="empty"||o==="scaffold"?"Mercy’s cabin will stand":r<2?"Another oak will rise":r<3?"A porch oak will sprout":r<4?"The last oak will rise":"The oaks will light";case"bench":return o==="empty"||o==="scaffold"?"Silas’s hall will stand":r<2?"A window will open":r<3?"Another window will open":r<4?"The last window will open":"The square will warm";case"observatory":return o==="empty"||o==="scaffold"?"Nora’s dome will rise":r<2?"Glass will set in the dome":r<3?"The oculus will catch":r<4?"The last glass will set":"Stars will catch the glass";case"gate":return o==="empty"||o==="scaffold"?"Ansel’s arch will stand":r<2?"Stone will settle":r<3?"A lantern will hang":r<4?"The last stone will set":"The east road will warm";case"lookout":return o==="empty"||o==="scaffold"?"Hope’s tower will rise":r<2?"The flag will kick":r<3?"A ridge lantern will hang":r<4?"The last timber will set":"The ridge lantern will hold";case"journal":return o==="empty"||o==="scaffold"?h?"River’s page house will stand":"The dossier house will stand":r<4?"Another page will land":r<12?"The window will glow":"The pages will glow";case"lamps":return o==="empty"||o==="scaffold"?"The first street lamp will catch":r<4?"Another lamp will catch":r<12?"The street will remember":"The street stays remembered";default:return"The town will grow"}}const Id="silver-city-seen-city-v1",Od="silver-city-seen-fill-v1",Mg="silver-city-homecoming-v1",eT=["lookout","lamps","gate","observatory","bench","hollow","journal","porch"];function tT(a){for(const o of eT)if(a[o]==="lit"||a[o]==="built")return o;return null}function nT(){if(typeof window>"u")return null;try{return window.localStorage.getItem(Mg)}catch{return null}}function xy(a){if(!(typeof window>"u"))try{window.localStorage.setItem(Mg,a)}catch{}}const ni={empty:0,scaffold:1,built:2,lit:3};function Rd(a){const o={};for(const r of tt)o[r.id]=ds(r.id,a);return o}function aT(a){const o={};for(const r of tt)o[r.id]=Wd(r.id,a);return o}function sT(a,o){const r=[];for(const h of tt){const d=a[h.id],m=o[h.id];ni[m]<=ni[d]||r.push({id:h.id,from:d,to:m,beat:m==="lit"?"Lit!":m==="built"?"Built!":"Unlocked",title:h.title})}return r.sort((h,d)=>ni[d.to]-ni[h.to]||ni[h.from]-ni[d.from]),r}function iT(a,o,r,h){const d=new Set(h.map(w=>w.id)),m=[];for(const w of tt){const y=a[w.id]??0;if((o[w.id]??0)<=y||d.has(w.id))continue;const g=r[w.id];m.push({id:w.id,from:g,to:g,beat:"Grew!",title:w.title})}return m}function oT(){if(typeof localStorage>"u")return null;try{const a=localStorage.getItem(Id);if(!a)return null;const o=JSON.parse(a);return!o||typeof o!="object"?null:o}catch{return null}}function vo(a){typeof localStorage>"u"||localStorage.setItem(Id,JSON.stringify(a))}function rT(){if(typeof localStorage>"u")return null;try{const a=localStorage.getItem(Od);if(!a)return null;const o=JSON.parse(a);return!o||typeof o!="object"?null:o}catch{return null}}function go(a){typeof localStorage>"u"||localStorage.setItem(Od,JSON.stringify(a))}function Sy(){typeof localStorage>"u"||(localStorage.removeItem(Id),localStorage.removeItem(Od))}const lT={easy:1,medium:2,hard:3};function wl(a){return lT[a]}function za(a,o){const r=a.lessonTier?.[o];return ug(r)?r:"easy"}function cT(a,o){return Ld(a.lessonScore?.[o])}function qd(a,o){const r=za(a,o),h=cT(a,o);return h?wl(h)<wl(r):(a.easyHeld??[]).includes(o)||r!=="easy"}function hT(a,o){const r=za(a,o),d=Ro(o)?.[r],m=d?.points??ri[r],w=a.lessonScore?.[o]??0,y={...a.lessonScore??{},[o]:Math.max(w,m)},f=d?.hold.levelUpTo??ck[r],g={...a.lessonTier??{}};return f?g[o]=f:g[o]=r,{lessonScore:y,lessonTier:g}}function dT(a,o){return{lessonTier:{...a.lessonTier??{},[o]:"easy"}}}function uT(a){return Object.values(a.lessonScore??{}).reduce((o,r)=>o+r,0)}function mT(a){const o={easy:0,medium:0,hard:0};for(const r of Object.values(a.lessonScore??{})){const h=Ld(r);h&&(o[h]+=1)}return o}function bl(a){const o=Ld(a);return o==="hard"?"Hard 15":o==="medium"?"Medium 12":o==="easy"?"Easy 10":""}function ye(a){return!!a.easyMode}const Z={creed:"old shared belief",parable:"Jesus story",connectLink:"Tap the sentence, then the place, then the person.",readStory:"Read today’s story.",learnCta:"Learn",readStoryFirst:"Read the story first",learnThisFirst:"Learn this first.",rememberSentence:"Tap the line you kept.",tapWhy:"Tap why this is true.",keepThis:"Keep this",claimTeach:"A claim is the main idea we hold to be true.",mainIdeaTeach:"Main idea = the short true line we keep.",reasonSense:"why this is true",whyStands:"Why this is true.",sourceSense:"where this comes from",lockIn:"Save your picks.",matchHow:"Keep the right pictures. Remove wrong picks.",manage:"Manage",matchCta:"Match",matchDone:"Match done",matchWin:"Matched!",holdNext:"Hold next",continueStreet:"Continue tonight’s street",nightDo:"Night Watch",nightTap:"Tap the face.",nightLead:"Tap the face six times.",nightMiss:"Wrong — tap the glowing face",home:"Home",townSoon:"Town (soon)",loveCue:"Love — when compassion moves you, help like the Samaritan. Tap the glowing face.",saved:"Hold",savedSub:"saved lines",connections:"Connections",uses:"Things you can use"};function md(a){return`Wrong. Tap this one: ${a.replace(/\.$/,"").trim()}.`}const pT="Love — tap the matching face. A true line turns a cheap claim toward heaven.",jy={"td-watch":Z.loveCue};function My(a){return a?Z.loveCue:pT}const fT={"Received mercy makes refusing mercy a contradiction.":"Forgiven a huge debt — do not choke a neighbor.","The servant forgiven an unpayable debt then throttles a peer over a small sum.":"He was forgiven much, then choked a neighbor.","Jesus is only reforming first-century banking.":"Jesus is only talking about old money rules.","Forgiveness is a limited coupon on God’s spreadsheet.":"Forgiveness is not a limited coupon.","The first servant was right to demand prison for a small debt.":"He was right to refuse mercy.","The first servant was right to demand prison.":"He was right to refuse mercy.","Peter’s “seven times” was already the full measure.":"Seven times was already enough.","Honor is spent so the son can be embraced; the older brother shows nearness without joy.":"The father hugs him first.","The older brother is the hero for staying home.":"The older brother is the hero just for staying.","Jesus makes the listener identify with the wounded man, then with the Samaritan moved with compassion.":"First the hurt man, then help.","The story is mainly a map of the Jericho road.":"The story is only a road map.","Mercy is optional once you have classified the victim.":"Mercy is optional after you sort people.","The father waits until justice is complete.":"The father waits until justice is done.","Soil, search, a tiny seed, and a trust form a portrait — not a slogan.":"Pictures tell it — not a slogan.","Burial resists a merely “spiritual” death; appearances resist a merely “spiritual” raising.":"Buried and seen — not only a spirit story.","Appearances are admitted to be visions with no named people.":"The seen people are only nameless visions.","Paul quotes a received formula and names known people; Luke claims inquiry among witnesses.":"Paul names known people who saw it.","Distance in time is the only historical question that matters.":"Only the date matters — names do not.","Multiple attestation, embarrassment, early reports, and context resist “late pious novel.”":"Many early, awkward reports beat a late tale.","Luke records that the apostles dismissed them — a costly opening if the goal were instant respectability.":"The men first called the women wrong.","Life-permitting ranges are extravagantly narrow across independent parameters; design predicts a habitable cosmos, blank chance does not.":"Life needs tight numbers — chance does not explain that.","Life-permitting ranges are wide; blank chance predicts a habitable cosmos just as well.":"Life numbers are wide — chance is enough.","Life-permitting ranges are extravagantly narrow; a Designer who wants observers leads us to expect that fit — blank indifference does not.":"A Designer who wants people fits these numbers.","Models describe a world already given; a physical “vacuum” is still something.":"A model still starts with something there.","Cells store coordinated information; that looks like the work of a mind — wonder is rational, and so is more work.":"Cells store info that looks like a mind’s work.","Nothing reduces itself from potential to actual; an unexplained stack of changers is not an explanation.":"Nothing changes itself without a first mover.","Contingent things exist; “it just is” is also a metaphysics, not automatically cheaper.":"Things that might not exist still need a ground.","Brute fact is not a metaphysical move.":"“It just is” is not an answer.","That yields a Cause of the beginning; naming Abraham’s God takes further historical steps.":"A beginning has a Cause — more steps name God.","Aquinas argues onward from the Ways; the New Testament adds a particular history.":"The first-cause walk is not yet the whole gospel.","Romans 2 treats moral knowledge as widely shared, which is why strangers can accuse one another.":"We all know duty — strangers can still accuse.","Theism is a reply in which mind is present at the beginning, not only an accident at the end.":"Mind is there at the start — not a late accident.","A story without mind can still house the storyteller with no remainder.":"A no-mind story still has to house the teller.","Ecclesiastes refuses to let work and pleasure pretend to be the final good, and refuses to call them worthless as gifts.":"Work and fun are gifts — not the last good.","Longing for a country the sunset cannot give is a mark that we were made for that country; Psalm 19 treats the sky as speech.":"The sunset wakes a hunger it cannot feed.","Jesus uses an ordinary lamp and a city on a hill — public without being proud.":"A lamp and a hill city are meant to be seen.","A lamp is seen, seed meets different hearts, and the cup is poured for many — gift, not wage.":"Lamp, seed, and cup are gifts you can hold.","The parable invites hearing; it does not flatter every field.":"Not every field is good soil.","Paul lists Cephas, the Twelve, and more than five hundred — many still living then.":"Paul names many people who were still alive.","If the formula is early, the claim is close to what it names: died, buried, raised.":"If the line is early, it is close to the event.","Scripture treats the created order as intelligible testimony — design inference and “the heavens declare” land in the same grain.":"The sky speaks of a Maker — the numbers fit that.","Copying cells, a habitable band, and a mind that can do science all look given — the marks of a Maker.":"Life, a livable world, and minds look given.","Scribes copy, later hands compare, then a modern page prints a recovered text.":"Scribes copy, later hands compare, then we print it.","The poem’s Servant suffers for others and does not answer with a sword; the church names that Servant as Jesus.":"The Servant suffers for others — the church names Jesus.","The claim is that God moves first — not that you finished the map.":"God moves first — you did not finish the map.","The invitation is to a person — “Come to me” — not a performance.":"Come to me — rest is a gift, not a show.","Jesus asks who *proved* to be a neighbor — the one who showed mercy.":"Jesus asks who showed mercy — that one is neighbor.","The wounded man must first classify the helper.":"The hurt man must first sort the helper.","The town does not sand that awkwardness into a tidy triumph.":"The first report stays awkward — not a tidy win.","The psalms ask the question out loud and expect a Giver, not a shrug.":"The psalms ask why — and expect a Giver.","You may refuse it; the town will not lock you in a pew.":"You may refuse — no one locks you in a pew.","Love, logic, reason, and science you have kept can divert a false step up the ridge.":"Love, logic, reason, and science turn a false step."};function Dd(a){return a.replace(new RegExp("\\bcheap claim\\b","gi"),"unkind sentence").replace(new RegExp("\\bcheap line\\b","gi"),"unkind sentence").replace(/\bmean lines\b/gi,"unkind sentences").replace(/\bmean line\b/gi,"unkind sentence").replace(/\bthe claims\b/gi,"the main ideas").replace(/\ba claim\b/gi,"a main idea").replace(/\bthe claim\b/gi,"the main idea").replace(/\bA claim\b/g,"A main idea").replace(/\bThe claim\b/g,"The main idea").replace(/\bsoils\b/gi,"ground")}function qn(a){const o=fT[a];return o||Dd(a).replace(/first-century banking/gi,"old money rules").replace(/\bcontradiction\b/gi,"doesn't add up").replace(/\bthrottles\b/gi,"chokes").replace(/\bthrottle\b/gi,"choke")}const Cy=12;function ol(a){const o=qn(a).trim(),r=o.split(new RegExp("(?<=[.!?])\\s+"))[0]??o,h=r.split(/\s+/).filter(Boolean);return h.length<=Cy?r:h.slice(0,Cy).join(" ")}function yT(a){const o=a.toLowerCase();return o.includes("neighbor")?"neighbor picture":o.includes("tomb")||o.includes("empty")?"empty-tomb picture":o.includes("star")||o.includes("sky")||o.includes("heaven")?"star picture":o.includes("bread")||o.includes("table")||o.includes("cup")?"shared-table picture":o.includes("seed")||o.includes("ground")||o.includes("soil")?"seed picture":o.includes("lamp")||o.includes("light")?"lamp picture":o.includes("unkind sentence")||o.includes("mean line")||o.includes("true one")||o.includes("true line")?"true-line picture":"story picture"}function Cg(a){const o=a.anchor.split(" · ").map(w=>w.trim()),r=o[0]||"Juniper",h=(o[1]??"").replace(/\s*after\s+.*/i,"").trim()||"East porch",d=yT(a.beat??""),m=[r,h,d];return a.tool&&m.push(`used as ${a.tool}`),m.join(" · ")}function hn(a,o){if(a&&jy[a]){const r=jy[a];if(o===r||o===qt(a)?.claim)return r}return Dd(o)}function rl(a,o,r){const h=new Set,d=[],m=[r,...a.filter(y=>y!==r)];for(const y of m){const f=o(y).trim();!f||h.has(f)||(h.add(f),d.push(y))}const w=new Map;return a.forEach((y,f)=>{w.has(y)||w.set(y,f)}),w.has(r)||w.set(r,-1),d.sort((y,f)=>(w.get(y)??99)-(w.get(f)??99))}const gT=["ph-road","ph-father","ph-debt","wb-creed","wb-women","daily-lantern","daily-stars","daily-cosmos","hl-moral"],Ay=Ek(),pd=Ay.length?Ay:[...gT],vl=pd[0]??"ph-road",Ny={"ph-road":{whoId:"mercy",plotId:"hollow"},"ph-father":{whoId:"mercy",plotId:"hollow"},"ph-debt":{whoId:"mercy",plotId:"hollow"},"wb-creed":{whoId:"silas",plotId:"bench"},"wb-women":{whoId:"silas",plotId:"bench"},"daily-lantern":{whoId:"juniper",plotId:"porch"},"daily-stars":{whoId:"nora",plotId:"observatory"},"daily-cosmos":{whoId:"ansel",plotId:"gate"},"hl-moral":{whoId:"hope",plotId:"lookout"}};function Ag(a){return Ny[a]?Ny[a]:a.startsWith("ph-")||a==="td-watch"?{whoId:"mercy",plotId:"hollow"}:a.startsWith("wb-")?{whoId:"silas",plotId:"bench"}:a.startsWith("ob-")?{whoId:"nora",plotId:"observatory"}:a.startsWith("fg-")?{whoId:"ansel",plotId:"gate"}:a.startsWith("hl-")?{whoId:"hope",plotId:"lookout"}:{whoId:"juniper",plotId:"porch"}}function Ng(a){const o=Ro(a);if(o?.loci){const r=o.loci.who in en?o.loci.who:Ag(a).whoId,h=en[r]??en.juniper;return{who:h.shortName,whoName:h.name,whoId:h.id,place:o.loci.place||Ly(a).place}}return Ly(a)}function Ly(a){const o=Ag(a),r=en[o.whoId],h=tt.find(d=>d.id===o.plotId);return{who:r.shortName,whoName:r.name,whoId:r.id,place:h?.title??"East porch"}}function wT(a){const{who:o,place:r}=Ng(a);return`This idea lives at ${r}, with ${o}.`}function Pd(a,o){const r=za(a,o);if(r==="easy")return(a.easyTaught??[]).includes(o);const h=a.tierTaught?.[o];return h?h===r||wl(h)>=wl(r):!1}function qo(a,o){return(a.easyHeld??[]).includes(o)}function ms(a){for(const o of pd)if(!qo(a,o))return o;for(const o of pd)if(za(a,o)!=="hard")return o;return vl}function bT(a){return ms(a)}function vT(a){return ms(a)}function kT(a){return ms(a)}function fd(a){return Pd(a,ms(a))}function TT(a){const o=ms(a);return Pd(a,o)&&(!qo(a,o)||qd(a,o))?"match":"learn"}function xT(a){const o=ms(a);return Pd(a,o)?qo(a,o)?qd(a,o):!0:!1}function Gd(a){return xT(a)?{name:"journal",focusId:kT(a),autoQuiz:!0}:{name:"journal"}}function Lg(a,o){const r=a??[];return r.includes(o)?r:[...r,o]}function ST(a,o){return Lg(a.easyTaught,o)}function Ey(a,o){return Lg(a.easyHeld,o)}function jT(a,o){return a?o===void 0?Z.connections:`${Z.connections} · ${o} lit`:o===void 0?"Mind map":`Mind map · ${o} lit`}const Eg=["ph-road","wb-creed","daily-lantern"],zd=[{id:"place-hollow",kind:"place",text:"Story Creek",plotId:"hollow"},{id:"place-bench",kind:"place",text:"Witness Square",plotId:"bench"},{id:"place-porch",kind:"place",text:"East porch",plotId:"porch"},{id:"place-sky",kind:"place",text:"Sky Watch",plotId:"observatory"},{id:"place-gate",kind:"place",text:"Why Gate",plotId:"gate"},{id:"place-lookout",kind:"place",text:"Meaning Ridge",plotId:"lookout"}],Hg=[{id:"person-mercy",kind:"person",text:"Mercy Wren",who:"mercy"},{id:"person-silas",kind:"person",text:"Silas Whitman",who:"silas"},{id:"person-juniper",kind:"person",text:"Juniper Wick",who:"juniper"},{id:"person-nora",kind:"person",text:"Nora Skye",who:"nora"},{id:"person-ansel",kind:"person",text:"Ansel Gate",who:"ansel"},{id:"person-hope",kind:"person",text:"Hope Ridge",who:"hope"}],ps=[{evidenceId:"ph-road",ideaId:"idea-mercy",tripleId:"mercy-hollow",placeId:"place-hollow",personId:"person-mercy",text:"Neighbor is the one who shows mercy.",caption:"Neighbor is the one who shows mercy."},{evidenceId:"ph-father",ideaId:"idea-father",tripleId:"father-hollow",placeId:"place-hollow",personId:"person-mercy",text:"The father runs with mercy before the speech is done.",caption:"The father runs with mercy before the speech is done."},{evidenceId:"ph-seeds",ideaId:"idea-seeds",tripleId:"seeds-hollow",placeId:"place-hollow",personId:"person-mercy",text:"The kingdom arrives in pictures, not slogans.",caption:"The kingdom arrives in pictures."},{evidenceId:"ph-debt",ideaId:"idea-debt",tripleId:"debt-hollow",placeId:"place-hollow",personId:"person-mercy",text:"Received mercy makes refusing mercy a contradiction.",caption:"Received mercy makes refusing mercy a contradiction."},{evidenceId:"wb-creed",ideaId:"idea-silas",tripleId:"silas-bench",placeId:"place-bench",personId:"person-silas",text:"Paul hands on an early public creed: died, buried, raised, appeared.",caption:"Died, buried, raised, appeared."},{evidenceId:"wb-early",ideaId:"idea-early",tripleId:"early-bench",placeId:"place-bench",personId:"person-silas",text:"The resurrection claim sits close to the events, not as a late legend.",caption:"The claim sits close to the events."},{evidenceId:"wb-method",ideaId:"idea-method",tripleId:"method-bench",placeId:"place-bench",personId:"person-silas",text:"Ordinary historical tools weigh testimony; they do not replace reading.",caption:"History tools weigh testimony."},{evidenceId:"wb-women",ideaId:"idea-women",tripleId:"women-bench",placeId:"place-bench",personId:"person-silas",text:"The first tomb reports begin with women — an awkward opening if invented for respectability.",caption:"Women first saw the tomb."},{evidenceId:"daily-names",ideaId:"idea-names",tripleId:"names-bench",placeId:"place-bench",personId:"person-silas",text:"The resurrection claim stacks named witnesses, not one private voice.",caption:"Named witnesses, not one private voice."},{evidenceId:"daily-creed",ideaId:"idea-daily-creed",tripleId:"creed-bench",placeId:"place-bench",personId:"person-silas",text:"The creed sits between the event and Paul’s letter.",caption:"The creed sits close to the event."},{evidenceId:"daily-empty",ideaId:"idea-empty",tripleId:"empty-bench",placeId:"place-bench",personId:"person-silas",text:"The first Easter reports include an empty place, women, fear, and wonder.",caption:"Easter begins with an empty place."},{evidenceId:"daily-lantern",ideaId:"idea-juniper",tripleId:"juniper-porch",placeId:"place-porch",personId:"person-juniper",text:"A lamp is meant to be seen.",caption:"A lamp is meant to be seen."},{evidenceId:"daily-gems",ideaId:"idea-gems",tripleId:"gems-porch",placeId:"place-porch",personId:"person-juniper",text:"Jesus taught with pictures you can hold.",caption:"Jesus taught with pictures you can hold."},{evidenceId:"daily-seed",ideaId:"idea-seed",tripleId:"seed-porch",placeId:"place-porch",personId:"person-juniper",text:"The same word meets different soils; some seed is lost.",caption:"The same word meets different soils."},{evidenceId:"daily-neighbor",ideaId:"idea-neighbor",tripleId:"neighbor-porch",placeId:"place-porch",personId:"person-juniper",text:"Mercy makes a neighbor; pedigree does not.",caption:"Mercy makes a neighbor."},{evidenceId:"ob-tuning",ideaId:"idea-tuning",tripleId:"tuning-sky",placeId:"place-sky",personId:"person-nora",text:"The universe is finely tuned for life — that fit points to a Designer.",caption:"Fine-tuning points to a Designer."},{evidenceId:"ob-design",ideaId:"idea-design",tripleId:"design-sky",placeId:"place-sky",personId:"person-nora",text:"Fine-tuning is best explained by a mind that intended a habitable world.",caption:"A mind intended a habitable world."},{evidenceId:"ob-leibniz",ideaId:"idea-leibniz",tripleId:"leibniz-sky",placeId:"place-sky",personId:"person-nora",text:"Why is there something rather than nothing remains after a cosmological model.",caption:"Why something rather than nothing."},{evidenceId:"ob-life",ideaId:"idea-ob-life",tripleId:"ob-life-sky",placeId:"place-sky",personId:"person-nora",text:"Life’s specified information is a mark of mind.",caption:"Life’s information is a mark of mind."},{evidenceId:"daily-stars",ideaId:"idea-stars",tripleId:"nora-sky",placeId:"place-sky",personId:"person-nora",text:"The heavens already speak of a Maker; fine-tuning fits that voice.",caption:"The heavens speak of a Maker."},{evidenceId:"daily-life",ideaId:"idea-daily-life",tripleId:"daily-life-sky",placeId:"place-sky",personId:"person-nora",text:"Life, place, and mind are not cheap facts.",caption:"Life, place, and mind are not cheap facts."},{evidenceId:"daily-cosmos",ideaId:"idea-cosmos",tripleId:"ansel-gate",placeId:"place-gate",personId:"person-ansel",text:"The universe exists and did not have to — so a Source is worth naming.",caption:"The world did not have to exist."},{evidenceId:"fg-mover",ideaId:"idea-mover",tripleId:"mover-gate",placeId:"place-gate",personId:"person-ansel",text:"Change here and now needs a first actuality that is not itself a receiver of change.",caption:"Change needs a first actuality."},{evidenceId:"fg-contingent",ideaId:"idea-contingent",tripleId:"contingent-gate",placeId:"place-gate",personId:"person-ansel",text:"A world of might-not-have-beens still needs a necessary ground.",caption:"Might-not-have-beens need a necessary ground."},{evidenceId:"fg-kalam",ideaId:"idea-kalam",tripleId:"kalam-gate",placeId:"place-gate",personId:"person-ansel",text:"If what begins has a cause and the universe began, it has a cause.",caption:"What begins has a cause."},{evidenceId:"fg-limits",ideaId:"idea-limits",tripleId:"limits-gate",placeId:"place-gate",personId:"person-ansel",text:"A cosmological argument is already a great deal — and not yet the sermon on the mount.",caption:"A first cause is not yet the whole gospel."},{evidenceId:"daily-scroll",ideaId:"idea-scroll",tripleId:"scroll-gate",placeId:"place-gate",personId:"person-ansel",text:"We hold a river of copies, not the first ink.",caption:"We hold a river of copies."},{evidenceId:"daily-isaiah",ideaId:"idea-isaiah",tripleId:"isaiah-gate",placeId:"place-gate",personId:"person-ansel",text:"Isaiah 53’s Servant is the Jesus the church confesses — wounded for others, silent like a lamb.",caption:"Isaiah’s Servant is Jesus."},{evidenceId:"hl-moral",ideaId:"idea-moral",tripleId:"hope-lookout",placeId:"place-lookout",personId:"person-hope",text:"Duty presents itself as more than taste — and theism is a natural home for that.",caption:"Duty is more than taste."},{evidenceId:"hl-mind",ideaId:"idea-mind",tripleId:"mind-lookout",placeId:"place-lookout",personId:"person-hope",text:"A story of the world must find a home for mind — including the storyteller.",caption:"The story must house the storyteller’s mind."},{evidenceId:"hl-meaning",ideaId:"idea-meaning",tripleId:"meaning-lookout",placeId:"place-lookout",personId:"person-hope",text:"Local meaning can be built — the lookout asks whether it is also received.",caption:"Meaning may be received, not only built."},{evidenceId:"hl-beauty",ideaId:"idea-beauty",tripleId:"beauty-lookout",placeId:"place-lookout",personId:"person-hope",text:"Beauty wakes a hunger it cannot feed — hungers usually correspond to real countries.",caption:"Beauty wakes a hunger it cannot feed."},{evidenceId:"daily-grace",ideaId:"idea-grace",tripleId:"grace-lookout",placeId:"place-lookout",personId:"person-hope",text:"Grace is gift, not wage; faith receives; boast starves.",caption:"Grace is gift, not wage."},{evidenceId:"daily-rest",ideaId:"idea-rest",tripleId:"rest-lookout",placeId:"place-lookout",personId:"person-hope",text:"Tired people are named first; rest is the gift, not a steeper hill.",caption:"Rest is the gift, not a steeper hill."},{evidenceId:"daily-door",ideaId:"idea-door",tripleId:"door-lookout",placeId:"place-lookout",personId:"person-hope",text:"Jesus’ “door” is a particular way in with a wide anyone.",caption:"Jesus is a door with a wide anyone."}],MT=ps.map(a=>({id:a.ideaId,kind:"idea",text:a.text,evidenceId:a.evidenceId})),Jd=[...MT,...zd,...Hg],zn=ps.map(a=>({id:a.tripleId,ideaId:a.ideaId,placeId:a.placeId,personId:a.personId})),CT=Object.fromEntries(ps.map(a=>[a.evidenceId,a.tripleId]));ps.map(a=>a.evidenceId);function AT(a){if(a.length<=5)return[a];const o=Math.ceil(a.length/2);return[a.slice(0,o),a.slice(o)]}function NT(){const a=[];for(const o of zd){const r=ps.filter(d=>d.placeId===o.id),h=AT(r);h.forEach((d,m)=>{const w=h.length>1&&m>0,y=Hg.find(f=>f.id===d[0]?.personId);a.push({id:w?`${o.id}-more`:o.id,placeId:o.id,placeTitle:w?`${o.text} · more`:o.text,personName:y?.text??"",triples:d.map(f=>({id:f.tripleId,ideaId:f.ideaId,placeId:f.placeId,personId:f.personId}))})})}return a}function yd(a,o){const r=new Set(a);for(const h of o)r.add(h);return zn.map(h=>h.id).filter(h=>r.has(h))}function dl(a){const o=new Set(a);return zn.filter(r=>!o.has(r.id)).length}function LT(a){return(a.completed??[]).includes("ln-street")?!0:dl(a.streetLinked??[])<=0}function _d(a){const o=new Set(a);for(const r of NT()){const h=r.triples.filter(d=>!o.has(d.id));if(h.length>0)return{...r,triples:h}}}function ET(a){const o=_d(a);return{...Da,title:o?`Tonight’s street · ${o.placeTitle}`:Da.title,triples:o?.triples??[]}}function HT(a,o){if(!a||o<=0)return Da.deeper;const r=BT[a.triples[0]?.id??""]?.hard??"";return(r.split(new RegExp("(?<=[.!?])\\s+"))[0]??r).trim()||`${a.personName} keeps ${a.placeTitle}.`}function WT(a,o){return a.filter(r=>r.id!==o&&r.evidenceId!=="ph-road")}const Da={kind:"link",id:"ln-street",title:"Link the street",idea:"an idea lives at a place, with a person",prompt:"Tap a block, then the place or person that belongs with it.",context:"An idea lives at a place, with a person. Mercy at the creek because Jesus stories live there. Silas at the square because names belong in a ledger. Juniper on the east porch because a lamp is meant to be seen. Nora at Sky Watch because the heavens already speak of a Maker. Ansel at Why Gate because the world exists and did not have to. Hope at Meaning Ridge because duty, mind, meaning, and beauty look over the town.",nodes:Jd,triples:zn,teachOnWrong:"Same story: idea, the lot it lives on, and the person who keeps it — for a reason.",deeper:"Mercy keeps the creek because Jesus taught in pictures (Luke 10:36). Silas keeps the square because the creed is a public report. Juniper keeps the porch because a lamp is meant to be seen. Nora keeps the ridge because the heavens declare a Maker. Ansel keeps the gate because what exists did not have to. Hope keeps the lookout because duty is more than taste."};function Wg(a){return zn.find(o=>o.id===a)}function IT(a){return Jd.find(o=>o.id===a)}function Ig(a){return ps.find(o=>o.evidenceId===a)}function OT(a){return ps.find(o=>o.tripleId===a)}function RT(a){return CT[a]??"mercy-hollow"}function qT(a){const o=RT(a),r=Wg(o);return{...Da,nodes:Jd,triples:r?[r]:[zn[0]]}}const DT=["Mercy Wren · Story Creek · Neighbor is the one who shows mercy.","Silas Whitman · Witness Square · died, buried, raised, appeared.","Juniper Wick · East porch · A lamp is meant to be seen.","Nora Skye · Sky Watch · The heavens speak of a Maker.","Ansel Gate · Why Gate · The world did not have to exist.","Hope Ridge · Meaning Ridge · Duty is more than taste."],PT=["Mercy Wren keeps Story Creek: Jesus taught in pictures by the road and the water.","Silas Whitman keeps Witness Square: died, buried, raised, appeared is a public creed.","Juniper Wick keeps the east porch: a lamp is meant to be seen.","Nora Skye keeps Sky Watch: the heavens declare a Maker, and fine-tuning fits that voice.","Ansel Gate keeps Why Gate: the world exists and did not have to.","Hope Ridge keeps Meaning Ridge: duty, mind, meaning, and beauty look over the town."];function Og(a,o){if(a.who)return{who:a.who};if(a.plotId)return{plotId:a.plotId};if(a.evidenceId==="ph-road")return{art:"ph-road"};const r=o.triples.find(w=>w.ideaId===a.id),h=o.nodes.find(w=>w.id===r?.placeId);if(h?.plotId)return{plotId:h.plotId};const d=o.nodes.find(w=>w.id===r?.personId);if(d?.who)return{who:d.who};const m=Ig(a.evidenceId??"");if(m){const w=zd.find(y=>y.id===m.placeId);if(w?.plotId)return{plotId:w.plotId}}return{}}const GT={"place-hollow":{place:"That story lives at the creek.",person:"Mercy keeps that creek."},"place-bench":{place:"Those names sit at the square.",person:"Silas keeps that square."},"place-porch":{place:"That lamp lives on the porch.",person:"Juniper keeps that porch."},"place-sky":{place:"That voice lives at Sky Watch.",person:"Nora keeps that sky."},"place-gate":{place:"That question lives at Why Gate.",person:"Ansel keeps that gate."},"place-lookout":{place:"That line lives at Meaning Ridge.",person:"Hope keeps that ridge."}},zT={"mercy-hollow":{idea:"Mercy’s Jesus story — the neighbor who stops on the road.",place:"The neighbor-road story lives at Story Creek.",person:"Mercy Wren keeps the neighbor who stops."},"father-hollow":{idea:"Mercy’s Jesus story — the father who runs first.",place:"The father-run story lives at Story Creek.",person:"Mercy Wren keeps the father who runs."},"seeds-hollow":{idea:"Mercy’s Jesus stories — the kingdom arrives in pictures.",place:"That story lives at the creek.",person:"Mercy keeps that creek."},"debt-hollow":{idea:"Mercy’s Jesus story — forgiven much, then show mercy.",place:"The forgiven-debt story lives at Story Creek.",person:"Mercy Wren keeps the two servants."},"silas-bench":{idea:"Silas’s public names — died, buried, raised, appeared.",place:"Those names sit at the square.",person:"Silas keeps that square."},"early-bench":{idea:"Silas’s public names — the claim sits close to the events.",place:"Those names sit at the square.",person:"Silas keeps that square."},"method-bench":{idea:"Silas’s ledger — ordinary tools weigh testimony.",place:"Those names sit at the square.",person:"Silas keeps that square."},"women-bench":{idea:"Silas’s first report — women saw the tomb first.",place:"That report sits at the square.",person:"Silas keeps that square."},"names-bench":{idea:"Silas’s public names — Cephas, the Twelve, five hundred.",place:"Those names sit at the square.",person:"Silas keeps that square."},"creed-bench":{idea:"Silas’s handed-on creed — close to the event, then Paul’s letter.",place:"Those names sit at the square.",person:"Silas keeps that square."},"empty-bench":{idea:"Silas’s first Easter — empty place, women, fear, and wonder.",place:"That report sits at the square.",person:"Silas keeps that square."},"juniper-porch":{idea:"Juniper’s lamp — a light meant to be seen.",place:"That lamp lives on the porch.",person:"Juniper keeps that porch."},"gems-porch":{idea:"Juniper’s morning pictures — lamp, seed, and cup you can hold.",place:"That lamp lives on the porch.",person:"Juniper keeps that porch."},"seed-porch":{idea:"Juniper’s seed — the same word meets different soils.",place:"That lamp lives on the porch.",person:"Juniper keeps that porch."},"neighbor-porch":{idea:"Juniper’s porch line — mercy makes a neighbor.",place:"That lamp lives on the porch.",person:"Juniper keeps that porch."},"nora-sky":{idea:"Nora’s sky — the heavens speak of a Maker.",place:"That voice lives at Sky Watch.",person:"Nora keeps that sky."},"tuning-sky":{idea:"Nora’s sky — fine-tuning points to a Designer.",place:"That voice lives at Sky Watch.",person:"Nora keeps that sky."},"design-sky":{idea:"Nora’s sky — a mind intended a habitable world.",place:"That voice lives at Sky Watch.",person:"Nora keeps that sky."},"leibniz-sky":{idea:"Nora’s sky — why something rather than nothing.",place:"That voice lives at Sky Watch.",person:"Nora keeps that sky."},"ob-life-sky":{idea:"Nora’s sky — life’s information is a mark of mind.",place:"That voice lives at Sky Watch.",person:"Nora keeps that sky."},"daily-life-sky":{idea:"Nora’s sky — life, place, and mind are given.",place:"That voice lives at Sky Watch.",person:"Nora keeps that sky."},"ansel-gate":{idea:"Ansel’s why — the world exists and did not have to.",place:"That question lives at Why Gate.",person:"Ansel keeps that gate."},"mover-gate":{idea:"Ansel’s why — change needs a first actuality.",place:"That question lives at Why Gate.",person:"Ansel keeps that gate."},"contingent-gate":{idea:"Ansel’s why — might-not-have-beens need a necessary ground.",place:"That question lives at Why Gate.",person:"Ansel keeps that gate."},"kalam-gate":{idea:"Ansel’s why — what begins has a cause.",place:"That question lives at Why Gate.",person:"Ansel keeps that gate."},"limits-gate":{idea:"Ansel’s why — a first cause is not yet the whole gospel.",place:"That question lives at Why Gate.",person:"Ansel keeps that gate."},"scroll-gate":{idea:"Ansel’s pages — we hold a river of copies.",place:"That question lives at Why Gate.",person:"Ansel keeps that gate."},"isaiah-gate":{idea:"Ansel’s scroll — Isaiah’s Servant is Jesus.",place:"That question lives at Why Gate.",person:"Ansel keeps that gate."},"hope-lookout":{idea:"Hope’s ridge — duty is more than a taste.",place:"That line lives at Meaning Ridge.",person:"Hope keeps that ridge."},"mind-lookout":{idea:"Hope’s ridge — the story must house the storyteller’s mind.",place:"That line lives at Meaning Ridge.",person:"Hope keeps that ridge."},"meaning-lookout":{idea:"Hope’s ridge — meaning may be received, not only built.",place:"That line lives at Meaning Ridge.",person:"Hope keeps that ridge."},"beauty-lookout":{idea:"Hope’s ridge — beauty wakes a hunger it cannot feed.",place:"That line lives at Meaning Ridge.",person:"Hope keeps that ridge."},"grace-lookout":{idea:"Hope’s ridge — grace is gift, not wage.",place:"That line lives at Meaning Ridge.",person:"Hope keeps that ridge."},"rest-lookout":{idea:"Hope’s ridge — rest is the gift, not a steeper hill.",place:"That line lives at Meaning Ridge.",person:"Hope keeps that ridge."},"door-lookout":{idea:"Hope’s ridge — Jesus is a door with a wide anyone.",place:"That line lives at Meaning Ridge.",person:"Hope keeps that ridge."}};function JT(a,o){const r=zT[a]?.[o];if(r)return r;const h=OT(a);return h?o==="idea"?h.caption:GT[h.placeId][o]:"Pick the match for this story."}function _T(a,o){const r=Wg(a);if(!r)return null;const h=o==="idea"?r.ideaId:o==="place"?r.placeId:r.personId,d=IT(h);return d?Rg(d,!0):null}function UT(a,o){const r=_T(a,o);return md(r||"this one")}function Rg(a,o){if(o&&a.id==="place-hollow")return"Mercy’s creek";if(a.kind==="idea"){const r=Ig(a.evidenceId??"");if(r)return r.caption}return a.text}const BT={"mercy-hollow":{easy:"Mercy lives at the creek because she tells Jesus stories. The neighbor who stops on the road is a picture, so it lives at Story Creek.",hard:"Mercy Wren keeps Story Creek: Jesus taught in pictures by the road and the water. Neighbor is the one who shows mercy — that line belongs with the storyteller, not the clerk."},"father-hollow":{easy:"Mercy tells the father-run story at the creek. The father runs with mercy, so it lives at Story Creek.",hard:"Mercy Wren keeps Story Creek. The father runs before the speech is done — a Jesus story, not a square report."},"seeds-hollow":{easy:"Mercy tells kingdom pictures at the creek. The kingdom arrives in pictures, not slogans.",hard:"Mercy Wren keeps Story Creek. Soil, search, a tiny seed — Jesus taught the kingdom in pictures, not slogans."},"debt-hollow":{easy:"Mercy tells the forgiven-debt story at the creek. Received mercy must give mercy.",hard:"Mercy Wren keeps Story Creek. Received mercy making refusal a contradiction is a Jesus story of two servants."},"silas-bench":{easy:"Silas copies names at the square. The old shared belief — died, buried, raised — sits with the public names.",hard:"Silas Whitman keeps Witness Square. Died, buried, raised, appeared is a public creed. It belongs in a ledger hall, not under the oaks."},"early-bench":{easy:"Silas keeps the square. The claim sits close to the events — not a late legend.",hard:"Silas Whitman keeps Witness Square. Paul quotes a received formula and names known people; the claim sits close to the events."},"method-bench":{easy:"Silas keeps the square. Ordinary tools weigh testimony; they do not replace reading.",hard:"Silas Whitman keeps Witness Square. Multiple attestation and early reports weigh testimony — they do not skip the texts."},"women-bench":{easy:"Silas keeps the square. Women saw the tomb first — an awkward first report.",hard:"Silas Whitman keeps Witness Square. Women as first tomb witnesses is a public report, not a creek picture."},"names-bench":{easy:"Silas keeps the square. Named witnesses — not one private voice.",hard:"Silas Whitman keeps Witness Square. Cephas, the Twelve, and more than five hundred are public names, not a private dream."},"creed-bench":{easy:"Silas keeps the square. The creed sits close to the event, then Paul’s letter.",hard:"Silas Whitman keeps Witness Square. The creed sits between the event and Paul’s letter — died, buried, raised."},"empty-bench":{easy:"Silas keeps the square. Easter begins with an empty place, women, fear, and wonder.",hard:"Silas Whitman keeps Witness Square. The first Easter reports include an empty place — the town does not sand that awkwardness away."},"juniper-porch":{easy:"Juniper’s lamp is on the porch so today’s line can be seen.",hard:"Juniper Wick keeps the east porch. A lamp is meant to be seen — so the morning line lives at the lamp, where the trail starts."},"gems-porch":{easy:"Juniper’s lamp is on the porch. Jesus taught with pictures you can hold.",hard:"Juniper Wick keeps the east porch. Lamp, seed, and cup are pictures you can hold — gift, not wage."},"seed-porch":{easy:"Juniper’s lamp is on the porch. The same word meets different soils.",hard:"Juniper Wick keeps the east porch. The parable invites hearing; it does not flatter every field."},"neighbor-porch":{easy:"Juniper’s lamp is on the porch. Mercy makes a neighbor.",hard:"Juniper Wick keeps the east porch. Mercy makes a neighbor; pedigree does not — the morning lamp holds that line."},"nora-sky":{easy:"Nora watches the sky. The heavens speak of a Maker.",hard:"Nora Skye keeps Sky Watch. The heavens declare a Maker — that voice belongs on the ridge, not the porch lamp."},"tuning-sky":{easy:"Nora watches the sky. Fine-tuning points to a Designer.",hard:"Nora Skye keeps Sky Watch. Life-permitting ranges are extravagantly narrow. Necessity, chance, and a sprawling multiverse get named so they can be set down — time still goes to a Designer who wanted a habitable world."},"design-sky":{easy:"Nora watches the sky. A mind intended a habitable world.",hard:"Nora Skye keeps Sky Watch. A Designer who wants observers leads us to expect that fit — blank indifference does not."},"leibniz-sky":{easy:"Nora watches the sky. Why something rather than nothing still stands.",hard:"Nora Skye keeps Sky Watch. Models describe a world already given; why there is something rather than nothing remains."},"ob-life-sky":{easy:"Nora watches the sky. Life’s information is a mark of mind.",hard:"Nora Skye keeps Sky Watch. Cells store coordinated information — that looks like the work of a mind."},"daily-life-sky":{easy:"Nora watches the sky. Life, place, and mind are not cheap facts.",hard:"Nora Skye keeps Sky Watch. Copying cells, a habitable band, and a mind that can do science all look given — the marks of a Maker."},"ansel-gate":{easy:"Ansel keeps Why Gate. The world exists — and did not have to.",hard:"Ansel Gate keeps Why Gate. That the universe exists and did not have to is the why-a-world stone."},"mover-gate":{easy:"Ansel keeps Why Gate. Change needs a first actuality.",hard:"Ansel Gate keeps Why Gate. Nothing reduces itself from potential to actual; present change needs a first actuality."},"contingent-gate":{easy:"Ansel keeps Why Gate. Might-not-have-beens need a necessary ground.",hard:"Ansel Gate keeps Why Gate. A world of might-not-have-beens still needs a necessary ground — not a shrug."},"kalam-gate":{easy:"Ansel keeps Why Gate. What begins has a cause.",hard:"Ansel Gate keeps Why Gate. If what begins has a cause and the universe began, it has a Cause of the beginning."},"limits-gate":{easy:"Ansel keeps Why Gate. A first cause is not yet the whole gospel.",hard:"Ansel Gate keeps Why Gate. A cosmological argument is already a great deal — and not yet the sermon on the mount."},"scroll-gate":{easy:"Ansel keeps Why Gate. We hold a river of copies, not the first ink.",hard:"Ansel Gate keeps Why Gate. Scribes copy, later hands compare — we hold a river of copies, not the first ink."},"isaiah-gate":{easy:"Ansel keeps Why Gate. Isaiah’s Servant is Jesus.",hard:"Ansel Gate keeps Why Gate. Isaiah 53’s Servant is the Jesus the church confesses — wounded for others, silent like a lamb."},"hope-lookout":{easy:"Hope keeps Meaning Ridge. Duty is more than a taste.",hard:"Hope Ridge keeps Meaning Ridge. Duty as more than taste looks over the town from the lookout."},"mind-lookout":{easy:"Hope keeps Meaning Ridge. The story must house the storyteller’s mind.",hard:"Hope Ridge keeps Meaning Ridge. Theism is a reply in which mind is present at the beginning, not only an accident at the end."},"meaning-lookout":{easy:"Hope keeps Meaning Ridge. Meaning may be received, not only built.",hard:"Hope Ridge keeps Meaning Ridge. Local meaning can be built — the lookout asks whether it is also received."},"beauty-lookout":{easy:"Hope keeps Meaning Ridge. Beauty wakes a hunger it cannot feed.",hard:"Hope Ridge keeps Meaning Ridge. Beauty wakes a hunger it cannot feed — hungers usually correspond to real countries."},"grace-lookout":{easy:"Hope keeps Meaning Ridge. Grace is gift, not wage.",hard:"Hope Ridge keeps Meaning Ridge. Grace is gift, not wage; faith receives; boast starves."},"rest-lookout":{easy:"Hope keeps Meaning Ridge. Rest is the gift, not a steeper hill.",hard:"Hope Ridge keeps Meaning Ridge. Tired people are named first; rest is the gift, not a steeper hill."},"door-lookout":{easy:"Hope keeps Meaning Ridge. Jesus is a door with a wide anyone.",hard:"Hope Ridge keeps Meaning Ridge. Jesus’ door is a particular way in with a wide anyone."}},jt=[kg,Tg,vg,hg,dg];function Ud(a){return jt.find(o=>o.id===a)}function FT(a,o){return Ud(a)?.challenges.find(r=>r.id===o)}function qg(a){for(const r of jt){const h=r.challenges.find(d=>d.id===a);if(h)return{areaId:r.id,challenge:h}}const o=fl.find(r=>r.challenge.id===a);if(o)return{areaId:Do(a),challenge:o.challenge}}const Hy={"daily-lantern":"parable-hollow","daily-gems":"parable-hollow","daily-seed":"parable-hollow","daily-neighbor":"parable-hollow","daily-names":"witness-bench","daily-creed":"witness-bench","daily-empty":"witness-bench","daily-stars":"observatory","daily-life":"observatory","daily-cosmos":"observatory","daily-scroll":"first-gate","daily-isaiah":"first-gate","daily-grace":"high-lookout","daily-rest":"high-lookout","daily-door":"high-lookout"};function Do(a){for(const r of jt)if(r.challenges.some(h=>h.id===a))return r.id;if(Hy[a])return Hy[a];if(a==="td-watch")return"parable-hollow";const o=Nt.find(r=>r.id===a||r.unlockAfter===a);return o?o.areaId:"daily-trail"}function us(a){return Nt.find(o=>o.unlockAfter===a)}jt.reduce((a,o)=>a+o.challenges.length,0);const $T=Nt.length,KT=""+new URL("portrait-ansel-BS6iPcTj.png",import.meta.url).href,YT=""+new URL("portrait-hope-DLqFLHZ5.png",import.meta.url).href,Dg=""+new URL("portrait-juniper-DAQGVsBF.png",import.meta.url).href,VT=""+new URL("portrait-mercy-BcQyFY5q.png",import.meta.url).href,XT=""+new URL("portrait-nora-OQaJZAKV.png",import.meta.url).href,Pg=""+new URL("portrait-river-ByMmrOE7.png",import.meta.url).href,QT=""+new URL("portrait-silas-B_MD9G1g.png",import.meta.url).href,ZT=""+new URL("walker-image-bearer-Db1tlbPV.png",import.meta.url).href,ex=""+new URL("walker-metaphysical-WXTtljRs.png",import.meta.url).href,tx=""+new URL("walker-pagan-ekS7NQp0.png",import.meta.url).href,nx=""+new URL("walker-physical-DYnhlXGi.png",import.meta.url).href,ax=""+new URL("walker-skeptic-BBzX3exg.png",import.meta.url).href,sx=""+new URL("walker-spiritual-AVZnjRv2.png",import.meta.url).href,ix={river:Pg,juniper:Dg,mercy:VT,silas:QT,nora:XT,ansel:KT,hope:YT},Gg={"image-bearer":ZT,skeptic:ax,pagan:tx,physical:nx,metaphysical:ex,spiritual:sx};function it({who:a,size:o="md",className:r=""}){const h=en[a];return s.jsx("span",{className:`avatar size-${o} ${r}`,role:"img","aria-label":`${h.name}, ${h.role}`,children:s.jsx("img",{src:ix[a],alt:"",draggable:!1})})}function ox({kind:a,className:o="",style:r}){return s.jsx("img",{className:`walker-face ${o}`,src:Gg[a],alt:"",draggable:!1,"aria-hidden":!0,style:r})}function rx(a){return Gg[a]}function zg({who:a,line:o,kicker:r}){const h=en[a];return s.jsxs("aside",{className:"say pop-in",children:[s.jsx(it,{who:a,size:"md"}),s.jsxs("div",{className:"say-body",children:[s.jsx("p",{className:"eyebrow",children:r??h.role}),s.jsx("p",{className:"say-name",children:h.name}),s.jsxs("p",{className:"say-line",children:["“",o,"”"]})]})]})}const lx={hollow:{label:"Story Creek",creek:!0},bench:{label:"Witness Square",bench:!0},porch:{label:"East porch",lamp:!0},observatory:{label:"Sky Watch",sky:!0},gate:{label:"Why Gate",gate:!0},lookout:{label:"Meaning Ridge",ridge:!0}};function cx({plotId:a,className:o=""}){const r=lx[a];return s.jsxs("svg",{viewBox:"0 0 96 96",className:`place-glyph ${o}`,"aria-hidden":!0,children:[s.jsx("rect",{width:"96",height:"96",rx:"22",fill:"#2a0d58"}),r?.creek?s.jsxs(s.Fragment,{children:[s.jsx("path",{d:"M8 70c14-10 22-8 36 2 14 10 26 8 44-4",fill:"#3d7ccc"}),s.jsx("path",{d:"M0 78c18-8 28-6 44 4 16 10 28 6 52-8V96H0Z",fill:"#148a48"}),s.jsx("path",{d:"M18 58c8-16 16-22 22-18 4 2 6 12 8 18",fill:"#3dcc7a"}),s.jsx("path",{d:"M58 48c10-18 18-20 24-12 4 6 4 16 2 22",fill:"#2a8a48"})]}):r?.bench?s.jsxs(s.Fragment,{children:[s.jsx("rect",{x:"8",y:"62",width:"80",height:"22",rx:"4",fill:"#5a3a1a"}),s.jsx("rect",{x:"16",y:"48",width:"64",height:"10",rx:"3",fill:"#c4922a"}),s.jsx("rect",{x:"20",y:"38",width:"8",height:"14",fill:"#8a5a22"}),s.jsx("rect",{x:"68",y:"38",width:"8",height:"14",fill:"#8a5a22"}),s.jsx("circle",{cx:"72",cy:"18",r:"10",fill:"#ffcc33"})]}):r?.sky?s.jsxs(s.Fragment,{children:[s.jsx("path",{d:"M18 78c0-24 12-40 30-40s30 16 30 40",fill:"#1a3a78"}),s.jsx("circle",{cx:"48",cy:"42",r:"10",fill:"#ffcc33"}),s.jsx("circle",{cx:"22",cy:"22",r:"2.5",fill:"#fff6b8"}),s.jsx("circle",{cx:"72",cy:"18",r:"2",fill:"#fff6b8"}),s.jsx("circle",{cx:"78",cy:"32",r:"1.8",fill:"#ffe680"})]}):r?.gate?s.jsxs(s.Fragment,{children:[s.jsx("path",{d:"M20 78V40l28-18 28 18v38",fill:"#8a6a3a"}),s.jsx("path",{d:"M36 78V52h24v26",fill:"#2a0d58"}),s.jsx("rect",{x:"22",y:"70",width:"52",height:"8",fill:"#5a3a1a"})]}):r?.ridge?s.jsxs(s.Fragment,{children:[s.jsx("path",{d:"M6 78 28 42l14 14 16-28 32 50Z",fill:"#3d7ccc"}),s.jsx("path",{d:"M42 28 58 6l20 36",fill:"#ffe680"})]}):s.jsxs(s.Fragment,{children:[s.jsx("rect",{x:"18",y:"44",width:"60",height:"36",rx:"4",fill:"#5a2410"}),s.jsx("rect",{x:"34",y:"58",width:"16",height:"22",fill:"#2a0d58"}),s.jsx("path",{d:"M48 16c0 10 8 14 8 22 0 6-4 10-8 10s-8-4-8-10c0-8 8-12 8-22Z",fill:"#ffcc33"}),s.jsx("circle",{cx:"48",cy:"40",r:"5",fill:"#fff6b8"})]})]})}const Wy={"parable-hollow":{label:"Story Creek",path:"M16 70c8-18 14-28 20-28 4 0 6 8 8 16 4-14 10-22 16-22 8 0 14 18 20 34"},"witness-bench":{label:"Witness Square",path:"M18 58h60M24 58v16h48V58M20 74h56"},observatory:{label:"Sky Watch",path:"M18 70c0-22 14-38 30-38s30 16 30 38M48 32v10"},"first-gate":{label:"Why Gate",path:"M22 78V38l26-16 26 16v40M48 78V50"},"high-lookout":{label:"Meaning Ridge",path:"M8 70 28 42l14 12 18-28 28 44"},"daily-trail":{label:"East porch",path:"M24 78V44h48v34M36 78V58h24v20M48 44V28"}};function Jg({pillar:a,compact:o}){const r=Wy[a]??Wy["daily-trail"],h=a==="daily-trail"?en.juniper:jo(a);return s.jsxs("div",{className:`landmark ${o?"is-compact":""}`,children:[s.jsxs("svg",{viewBox:"0 0 96 96","aria-hidden":!0,className:"landmark-mark",children:[s.jsx("rect",{width:"96",height:"96",rx:"20",fill:"currentColor",opacity:"0.12"}),s.jsx("path",{d:r.path,fill:"none",stroke:"currentColor",strokeWidth:"4",strokeLinecap:"round",strokeLinejoin:"round"})]}),s.jsx(it,{who:h.id,size:"sm"}),s.jsx("p",{className:"landmark-label",children:r.label})]})}function hx(a){switch(a){case"sequence":return"Order puzzle";case"build-argument":return"Chain puzzle";case"match":return"Snap pairs";case"sort":return"Keep or toss";case"link":return"Link blocks";default:return a}}function Iy(a,o){return a&&a>o?a:o}function dx(a,o){return{earned:a.reduce((h,d)=>h+(o[d]??0),0),possible:a.length*3}}function kl(a){return a>=3?"3★ held after a rest, and said back":a===2?"2★ held after a rest":a===1?"1★ first walk":"0★ not yet walked"}function _g({count:a=0,compact:o,label:r}){return s.jsx("span",{className:`star-row ${o?"is-compact":""} ${a?"has-stars":""}`,"aria-label":r??`${a} of 3 stars`,children:[1,2,3].map(h=>s.jsx("span",{className:h<=a?"is-lit":"","aria-hidden":!0,children:"★"},h))})}const ux=3,ca=[{id:"love",label:"Love",gem:"heart",unlockKeys:[],counters:["image-bearer","spiritual","skeptic"],tier:1},{id:"logic",label:"Logic",gem:"star",unlockKeys:["wb-creed","wb-early","wb-method","wb-women","fg-mover","fg-contingent","fg-kalam","daily-creed","daily-names"],counters:["skeptic","metaphysical"],tier:1},{id:"reason",label:"Reason",gem:"cup",unlockKeys:["hl-moral","hl-mind","hl-meaning","hl-beauty","fg-limits"],counters:["pagan","metaphysical"],tier:1},{id:"science",label:"Science",gem:"lamp",unlockKeys:["ob-tuning","ob-design","ob-leibniz","ob-life","daily-stars","daily-life","daily-cosmos"],counters:["physical","metaphysical"],tier:1}],mx={"image-bearer":"Image-bearer",skeptic:"Skeptic",pagan:"Pagan",physical:"Physical",metaphysical:"Metaphysical",spiritual:"Spiritual"},Bd=["","I","II","III"];function Ga(a){return ca.find(o=>o.id===a)}function Ug(a,o){if(a.unlockKeys.length===0)return!0;const r=new Set(o.held??[]),h=new Set(o.completed??[]);return a.unlockKeys.some(d=>r.has(d)||h.has(d))}function Ln(a){return a==="td-watch"}function px(a){return a.unlockKeys.length>0?a.unlockKeys:["td-watch"]}function fx(a,o){const r=px(a),h=new Set([...o.held??[],...o.completed??[]]),d=r.filter(g=>h.has(g)),m=(o.learnings??[]).filter(g=>g.toolId===a.id).map(g=>g.id),w=new Set([...d,...m]).size,y=r.reduce((g,T)=>g+(o.memory[T]?.reviews??0),0),f=r.reduce((g,T)=>g+(o.stars[T]??0),0);return{held:w,reviews:y,stars:f}}function No(a,o){const{held:r,reviews:h,stars:d}=fx(a,o);let m=0;return(r>=2||h>=2||d>=4)&&(m=1),(r>=4||h>=6||d>=8)&&(m=2),Math.min(ux,a.tier+m)}function yx(a){return ca.filter(o=>Ug(o,a))}function gx(a,o){const r=Ga(a);return r&&r.counters.includes(o)?"match":"weak"}function Sl(a){const o=ca.find(r=>r.unlockKeys.includes(a));return o||Ga("love")}function Fd(a,o){return a.includes("seed")?"seed":a.includes("lamp")||a.includes("lantern")?"lamp":a.includes("grace")||a.includes("cup")?"cup":o?.gem}const nd=[1,3,7,21];function gd(a,o,r){return{id:a,pillar:o,intervalIndex:0,nextReviewAt:r,lastReviewAt:r,reviews:0,cleanRecalls:0,elaborated:!1}}function Po(a,o){return a.lastReviewAt===o&&a.reviews>0?!1:a.nextReviewAt<=o}function $d(a,o){return Object.values(a).filter(r=>Po(r,o))}function wx(a,o,r,h=3){if(a.length===0||h<=0)return[];const d=r?a.filter(b=>b.pillar!==r):a,w=[...d.length>0?d:a].sort((b,M)=>b.pillar===M.pillar?b.id.localeCompare(M.id):b.pillar.localeCompare(M.pillar)),y=cg(`silver-city-space:${o}`)%w.length,f=[...w.slice(y),...w.slice(0,y)],g=[],T=new Set;for(const b of f){if(g.length>=h)break;T.has(b.pillar)||(g.push(b),T.add(b.pillar))}for(const b of f){if(g.length>=h)break;g.some(M=>M.id===b.id)||g.push(b)}return g}function bx(a,o){return Object.values(a).filter(r=>r.lastReviewAt===o&&r.reviews>0).length}function vx(a,o){const r=nd[Math.min(nd.length-1,a.intervalIndex)],h=Math.min(nd.length-1,a.intervalIndex+1);return{...a,intervalIndex:h,nextReviewAt:Oo(o,r),lastReviewAt:o,reviews:a.reviews+1,cleanRecalls:a.cleanRecalls+1}}function kx(a,o){return{...a,nextReviewAt:Oo(o,1)}}function Tx(a,o){const r=Math.max(0,a.intervalIndex-1);return{...a,intervalIndex:r,nextReviewAt:Oo(o,1),lastReviewAt:o,reviews:a.reviews+1}}function xx(a,o,r,h){let d=a&&a>=1?a:1;return r.kind==="encode"?d>=1?d:1:(!r.peeked&&r.clean&&(o?.lastReviewAt?o.lastReviewAt<r.today:o&&Po(o,r.today))&&(d=d>=2?d:2,(r.elaborated||h.cleanRecalls>=2||h.elaborated)&&(d=3)),d)}function Go(a,o,r=!1){return Po(a,o)?a.reviews===0?r?"Read this again today":"Dust off today":"Due this morning":a.nextReviewAt===Oo(o,1)?"Returns tomorrow":`Returns ${a.nextReviewAt}`}const wd=3,Bg="silver-city-recall-later-v1";function ll(a){return{day:a,ids:[],dismissed:!1}}function jl(a){if(typeof sessionStorage>"u")return ll(a);try{const o=sessionStorage.getItem(Bg);if(!o)return ll(a);const r=JSON.parse(o);return r.day!==a?ll(a):{day:a,ids:Array.isArray(r.ids)?r.ids.filter(h=>typeof h=="string"):[],dismissed:r.dismissed===!0}}catch{return ll(a)}}function Sx(a){return typeof sessionStorage<"u"&&sessionStorage.setItem(Bg,JSON.stringify(a)),a}function xo(a,o=[],r=!0){const h=jl(a);return Sx({day:a,ids:[...new Set([...h.ids,...o])],dismissed:r||h.dismissed})}function jx(a,o){return $d(a.memory,o).filter(r=>!!qt(r.id)&&!Ln(r.id))}function Kd(a,o,r=jl(o)){if(r.dismissed)return[];const h=bx(a.memory,o),d=Math.max(0,wd-h);if(d===0)return[];const m=jx(a,o).filter(w=>!r.ids.includes(w.id));return wx(m,o,a.lastReviewPillar,d)}const Yd={porch:["daily-lantern","daily-gems","daily-seed","daily-neighbor","daily-names","daily-creed","daily-empty","daily-stars","daily-life","daily-cosmos","daily-scroll","daily-isaiah","daily-grace","daily-rest","daily-door"],hollow:["ph-road","ph-father","ph-seeds","ph-debt"],bench:["wb-creed","wb-early","wb-method","wb-women"],observatory:["ob-tuning","ob-design","ob-leibniz","ob-life"],gate:["fg-mover","fg-contingent","fg-kalam","fg-limits"],lookout:["hl-moral","hl-mind","hl-meaning","hl-beauty"],journal:[],lamps:[]};function Vd(a){return(a.completed??[]).includes("ln-street")}function di(a,o){return!!((a.held??[]).includes(o)||(a.completed??[]).includes(o)||(a.learnings??[]).some(r=>r.id===o)||Vd(a)&&Eg.includes(o))}function Oy(a,o){const r=qt(o),h=(a.learnings??[]).find(m=>m.id===o),d=r?.claim??h?.claim;if(d)return{id:o,claim:d,reason:r?.reason??h?.reason??"",source:r?.source??h?.source??"",lit:di(a,o)}}function Fg(a,o){const r=tt.find(g=>g.id===a),h=la(a),d=en[h.who],m=Yd[a]??[];if(a==="journal"){const g=(o.learnings??[]).map(T=>Oy(o,T.id)).filter(T=>!!T);return{plotId:a,placeTitle:r?.title??"Dossier house",person:d,ideas:g,tools:[]}}if(a==="lamps"){const g=ca.map(T=>({id:T.id,label:T.label,lit:T.unlockKeys.length===0||T.unlockKeys.some(b=>di(o,b))}));return{plotId:a,placeTitle:r?.title??"Star lamps",person:d,ideas:[],tools:g}}const w=(o.learnings??[]).map(g=>g.id).filter(g=>!m.includes(g)&&di(o,g)).filter(g=>!!(o.learnings??[]).find(b=>b.id===g)?.anchor?.includes(r?.title??"")),f=(a==="porch"?m.filter(g=>di(o,g)||Eg.includes(g)):[...m,...w]).map(g=>Oy(o,g)).filter(g=>!!g);return{plotId:a,placeTitle:r?.title??a,person:d,ideas:f,tools:[]}}function Mx(a,o){const r=Fg(a,o);return r.ideas.some(h=>h.lit)||r.tools.some(h=>h.lit)}const ls=4,$g=["porch","hollow","bench"],Cx={0:{hard:"Lot",easy:"Empty lot"},1:{hard:"Timber",easy:"Wood up"},2:{hard:"Raised",easy:"House up"},3:{hard:"Furnished",easy:"Rooms in"},4:{hard:"Lit",easy:"Lamps on"}},Ax={0:{hard:"Nothing stands yet. Learn on this street, then raise timber.",easy:"No house yet. Learn here, then put wood up."},1:{hard:"The lot is yours. Walk it. The keeper is staking the ground.",easy:"You can walk this place. The person is waiting."},2:{hard:"Walls and roof. The keeper lives here. The first idea can light.",easy:"The house stands. The person lives here. One idea can light."},3:{hard:"Rooms for more ideas. Dig deeper opens on lines you have kept.",easy:"More rooms. You can Read more on lines you kept."},4:{hard:"Lamps hold. Tap a lit idea to say the line again.",easy:"Lamps are on. Tap a lit idea to say it again."}};function Ml(){return{porch:1,hollow:0,bench:0,observatory:0,gate:0,lookout:0,journal:0,lamps:0}}function Nx(a){return a<=0?"empty":a===1?"scaffold":a>=4?"lit":"built"}function Lx(a,o){const r=Yd[a]??[],h=o.held??[];return r.some(d=>h.includes(d))}function Ex(a,o){return $g.includes(a)&&Vd(o)}function wi(a,o){const r=ds(a,o),h=Wd(a,o);return r==="empty"?0:r==="scaffold"?1:r==="lit"?4:a==="journal"||a==="lamps"?h>=8?3:2:h>=2||Ex(a,o)||Lx(a,o)?3:2}function Kg(a){const o=Ml();for(const r of tt)o[r.id]=wi(r.id,a);return o}function fs(a,o){const r=o.cityBuilt;if(!r)return wi(a,o);const h=r[a];return typeof h!="number"||!Number.isFinite(h)?0:Math.max(0,Math.min(ls,Math.floor(h)))}function Sn(a,o){return wi(a,o)>fs(a,o)}function Hx(a,o){const r=wi(o,a),h=fs(o,a);if(r<=h)return a;const d={...a.cityBuilt??Kg(a)};return d[o]=h+1,{...a,cityBuilt:d}}function Ry(a){const o={};for(const r of tt)o[r.id]=Nx(fs(r.id,a));return o}function qy(a){const o={};for(const r of tt)o[r.id]=Wx(r.id,a);return o}function Wx(a,o){const r=fs(a,o),h=Wd(a,o);return r<=1?0:r===2?Math.min(Math.max(h,1),1):r===3?Math.max(2,h):Math.max(h,4)}function Ix(a){return tt.some(o=>Sn(o.id,a))}function Dy(a,o){const r=Cx[Math.max(0,Math.min(ls,a))];return o?r.easy:r.hard}function Ox(a,o){const r=Ax[Math.max(0,Math.min(ls,a))];return o?r.easy:r.hard}function Rx(a,o,r){const h=fs(a,o),d=wi(a,o);return h>=ls?{ready:!1,line:r?"This building is done. Keep saying the lines so the lamps stay on.":"This building is finished. Keep the claims so the lamps stay lit."}:d>h?{ready:!0,line:r?"Build this — raise the next look you earned by learning, not by paying.":"You earned the next look by keeping a line. Tap Build this — learning raises the house, not payment."}:{ready:!1,line:Yg(a,h+1,r)}}function qx(a,o,r,h=!0,d="",m=!1){if(!h&&d)return d;if(Sn(a,o)||Mx(a,o))return null;const w=Hd(o,m);if(a===w||fs(a,o)>0||wi(a,o)>0)return null;const y=Yg(a,1,r);return r?`This lot is locked. ${y}`:`This lot is still empty. ${y}`}function Dx(a){return a?"This idea is locked. Walk this lot, or connect sentence → place → person, to light it.":"This idea is locked. Walk this lot — or Link the street — to light it."}function Yg(a,o,r){return a==="porch"?o<=1?r?"Arrive. The porch lot is yours.":"Arrive. The east porch lot is yours.":o===2?r?"Walk today’s story once.":"Walk today’s trail and keep the morning line.":o===3?r?"Walk a second morning, or connect sentence → place → person.":"A second morning, hold the lamp line, or Link the street furnishes the porch.":r?"Come back three mornings.":"Three mornings kept — or hold the lamp line — lights the porch.":a==="journal"?o<=1?r?"Store one journal page.":"Store one journal page in the house.":o===2?r?"Store four pages.":"Four stored pages raise the dossier house.":o===3?r?"Store eight pages.":"Eight pages furnish the shelves.":r?"Store twelve pages.":"Twelve pages — journal mastery — light the house.":a==="lamps"?o<=1?r?"Earn one star.":"One star caught on a walk raises the first lamp.":o===2?r?"Earn four stars.":"Four stars raise a row of lamps.":o===3?r?"Eight stars, or hold a night.":"Eight stars or a Night Watch furnishes the street.":r?"Twelve stars or nights.":"Twelve stars and nights remembered light the street.":o<=1?r?"Finish the street before this one.":"Finish the earlier street so this lot unlocks.":o===2?r?"Finish one walk here.":"Finish one walk on this lot and keep the takeaway.":o===3?$g.includes(a)?r?"Finish a second walk here, or connect sentence → place → person.":"A second walk, a held claim, or Link the street furnishes this house.":r?"Finish a second walk here, or keep a main idea from this lot.":"A second walk or a held claim from this lot furnishes the rooms.":r?"Finish every walk here.":"Finish this street’s walks. Holding those claims lights the lamps."}function Vg(a){switch(a){case"porch":return"Porch";case"hollow":return"Story Creek";case"bench":return"Witness Square";case"observatory":return"Sky Watch";case"gate":return"Why Gate";case"lookout":return"Meaning Ridge";case"journal":return"Pages";case"lamps":return"Lamps"}}function Px(a){return a==="hollow"?"Story Creek":a==="bench"?"Witness Square":a==="porch"?"East porch":a==="lamps"?"Star lamps":Vg(a)}const Gx=["hollow","lamps","journal","bench","porch"],zx=56,Xg={hollow:{x:96,y:388},lamps:{x:208,y:388},journal:{x:268,y:198},bench:{x:392,y:388},porch:{x:536,y:388},gate:{x:498,y:230},observatory:{x:410,y:96},lookout:{x:508,y:52}},Py={x:418,y:36};function Jx(a){return a.includes(" ")?a.split(" "):[a]}function _x(a){const o=Px(a),r=Jx(o),h=Xg[a],d=Math.max(...r.map(b=>b.length)),m=Math.max(70,d*8.4+16),w=r.length*13+6,y=h.x-m/2,f=h.x+m/2,g=h.y-14,T=g+w;return{id:a,tag:o,lines:r,x0:y,x1:f,y0:g,y1:T,w:m,h:w}}const Ux=1100,Bx=[0,1,2,3,4,5,6,7,8,9,10,11],Fx=[0,1,2,3,4,5,6,7];function fi(a,o="mid"){const r=o==="keep"?-1:o==="discard"?1:a%2===0?-1:1,h=r*(52+a%4*34),d=-110-a*28,m=r*(28+a*18);return{"--dx":`${h}px`,"--dy":`${d}px`,"--spin":`${m}deg`,animationDelay:`${a*42}ms`}}function Lo(){return typeof window<"u"&&window.matchMedia("(prefers-reduced-motion: reduce)").matches}function Cl(a=!1){const[o,r]=W.useState(a),h=W.useRef(0);W.useEffect(()=>()=>window.clearTimeout(h.current),[]);const d=W.useCallback(()=>{window.clearTimeout(h.current),h.current=window.setTimeout(()=>r(!0),Lo()?900:Ux)},[]);return{juiceDone:o,afterJuice:d}}const Gy="td-watch",ai=3,ii=6,oi=[{x:70,y:310},{x:148,y:298},{x:220,y:286},{x:300,y:294},{x:400,y:290},{x:498,y:296},{x:560,y:300}],ad={lookout:{x:520,y:72},observatory:{x:464,y:118},hollow:{x:108,y:286},journal:{x:288,y:248},bench:{x:350,y:278},lamps:{x:258,y:300},gate:{x:498,y:268},porch:{x:564,y:292}},bd=[{text:"Mercy is optional",kind:"skeptic"},{text:"Neighbor means your own",kind:"image-bearer"},{text:"Keep walking",kind:"spiritual"},{text:"Classify and leave",kind:"skeptic"},{text:"The priest did enough",kind:"image-bearer"},{text:"Only atoms speak",kind:"physical"},{text:"The gods are many and tired",kind:"pagan"},{text:"Mind is only weather",kind:"metaphysical"}];bd.map(a=>a.text);function $x(a,o){const r=["image-bearer","spiritual","skeptic"],h=a<1?bd.filter(d=>r.includes(d.kind)):bd;return h[o%h.length]}function Qg(){return{cleared:0,nights:[]}}function sd(a,o){return ds(a,o)}function Kx(a){return tt.map(o=>o.id).filter(o=>{const r=ds(o,a);return o==="porch"?r!=="empty":r==="built"||r==="lit"})}function Yx(a){return a==="lit"?136:a==="built"?118:96}function Vx(a){return a==="lit"?380:a==="built"?520:700}const zy=128,Jy=160;function Xx(a,o,r){return a&&o==="wave"&&!r}function Qx(a){return a.find(o=>!o.turned)}function Zx(a,o,r){return a?"match":gx(o,r)}function e1(a,o,r,h){return a?o>=ii:r>=ii&&h===0}function Zg(a=!1){return a?Lo()?.008:.01:Lo()?.042:.086}function t1(a=!1){return a?Lo()?4.2:3.8:Lo()?2.05:1.08}function n1(a){const r=Math.min(1,Math.max(0,a))*(oi.length-1),h=Math.min(oi.length-2,Math.floor(r)),d=r-h,m=oi[h],w=oi[h+1];return{x:m.x+(w.x-m.x)*d,y:m.y+(w.y-m.y)*d}}ca.map(a=>a.id);const id=Object.fromEntries(ca.map(a=>[a.id,a.label])),vd={x:572,y:36};function ew(a){return yx(a).map(o=>o.id)}function a1(a,o,r=vd){const h=Math.min(1,Math.max(0,o));return{x:a.x+(r.x-a.x)*h,y:a.y+(r.y-a.y)*h}}function od(a,o,r){const h=Ga(a),m=((h?No(h,r):1)-1)*18;return a==="love"?640+m:Yx(o)+m}function s1(a=1,o=!1){return Zg(o)*(1.7+Math.max(0,a-1)*.08)}function rd(a,o){return Math.hypot(a.x-o.x,a.y-o.y)}const Xd="silver-city-save",Qd=256*1024,i1=Math.floor(Qd*1.5),tw=256,zo=256,kd=64,o1=220,Eo=1e4,r1=32,l1=/^\d{4}-\d{2}-\d{2}$/,c1=/^[A-Za-z0-9._:-]{1,64}$/,h1=new Set(["__proto__","constructor","prototype"]);function ul(){return{started:!1,completed:[],journal:[],firstTry:[],stars:{},dailyDates:[],streak:0,bestStreak:0,held:[],memory:{},elaborations:{},defense:Qg(),theme:"candy",easyMode:!1,learnings:[],taught:[],easyTaught:[],easyHeld:[],cityBuilt:Ml(),streetLinked:[],lessonTier:{},lessonScore:{},tierTaught:{}}}function ys(a){return h1.has(a)}function jn(a){if(a===null||typeof a!="object"||Array.isArray(a))return!1;const o=Object.getPrototypeOf(a);return o===Object.prototype||o===null}function yi(a){return typeof a=="string"&&l1.test(a)&&a.length<=kd}function dn(a){return typeof a=="string"&&c1.test(a)}function Pa(a,o,r,h){return typeof a!="number"||!Number.isFinite(a)||!Number.isInteger(a)?h:Math.min(r,Math.max(o,a))}function rs(a,o){return a.length<=o?a:a.slice(0,o)}function Rn(a){if(!Array.isArray(a))return[];const o=[];for(const r of a){if(o.length>=tw)break;!dn(r)||ys(r)||o.push(r)}return o}function d1(a){const o=Object.create(null);if(!jn(a))return o;let r=0;for(const[h,d]of Object.entries(a)){if(r>=zo)break;if(ys(h)||!dn(h)||!jn(d))continue;const m=Dt(),w=dn(d.id)?d.id:h;o[h]={id:w,pillar:dn(d.pillar)?d.pillar:"unspecified",intervalIndex:Pa(d.intervalIndex,0,r1,0),nextReviewAt:yi(d.nextReviewAt)?d.nextReviewAt:m,lastReviewAt:yi(d.lastReviewAt)?d.lastReviewAt:void 0,reviews:Pa(d.reviews,0,Eo,0),cleanRecalls:Pa(d.cleanRecalls,0,Eo,0),elaborated:!!d.elaborated},r+=1}return o}function u1(a){const o=Object.create(null);if(!jn(a))return o;let r=0;for(const[h,d]of Object.entries(a)){if(r>=zo)break;ys(h)||!dn(h)||typeof d=="string"&&(o[h]=rs(d,o1),r+=1)}return o}function _y(a){const o=Object.create(null);if(!jn(a))return o;let r=0;for(const[h,d]of Object.entries(a)){if(r>=zo)break;ys(h)||!dn(h)||(d==="easy"||d==="medium"||d==="hard")&&(o[h]=d,r+=1)}return o}function m1(a){const o=Object.create(null);if(!jn(a))return o;let r=0;for(const[h,d]of Object.entries(a)){if(r>=zo)break;ys(h)||!dn(h)||(o[h]=Pa(d,0,15,0),o[h]===0?delete o[h]:r+=1)}return o}function p1(a){const o=Object.create(null);if(!jn(a))return o;let r=0;for(const[h,d]of Object.entries(a)){if(r>=zo)break;ys(h)||!dn(h)||(d===1||d===2||d===3)&&(o[h]=d,r+=1)}return o}function f1(a){const o=d1(a.memory),r=Dt();for(const h of a.held??[])o[h]||(o[h]={...gd(h,"unspecified",r),nextReviewAt:r,lastReviewAt:void 0});return o}function Ho(a){const o=Rn(a.held),r={started:!!a.started,completed:Rn(a.completed),journal:Rn(a.journal),firstTry:Rn(a.firstTry),lastAreaId:dn(a.lastAreaId)?a.lastAreaId:void 0,lastChallengeId:dn(a.lastChallengeId)?a.lastChallengeId:void 0,stars:p1(a.stars),dailyDates:Rn(a.dailyDates),lastDailyDate:yi(a.lastDailyDate)?a.lastDailyDate:void 0,streak:Pa(a.streak,0,Eo,0),bestStreak:Pa(a.bestStreak,0,Eo,0),held:o,memory:{},elaborations:u1(a.elaborations),lastReviewPillar:dn(a.lastReviewPillar)?a.lastReviewPillar:void 0,defense:w1(a.defense),theme:g1(a.theme),easyMode:a.easyMode===!0,learnings:b1(a.learnings),taught:Rn(a.taught),easyTaught:Rn(a.easyTaught),easyHeld:Rn(a.easyHeld),cityBuilt:Ml(),streetLinked:Rn(a.streetLinked),lessonTier:_y(a.lessonTier),lessonScore:m1(a.lessonScore),tierTaught:_y(a.tierTaught)};return r.memory=f1({...r,memory:a.memory??{}}),r.cityBuilt=a.cityBuilt===void 0?Kg(r):y1(a.cityBuilt),r}function y1(a){const o=Ml();if(!jn(a))return o;for(const r of Object.keys(o))o[r]=Pa(a[r],0,4,0);return o}function g1(a){return a==="dusk"||a==="parchment"||a==="candy"?a:"candy"}function w1(a){if(!jn(a))return Qg();const o=Rn(a.nights).filter(yi);return{cleared:Pa(a.cleared,0,Eo,0),nights:o,lastNight:yi(a.lastNight)?a.lastNight:void 0}}function b1(a){if(!Array.isArray(a))return[];const o=[];for(const r of a){if(o.length>=tw)break;if(!jn(r)||!dn(r.id)||ys(r.id))continue;const h=typeof r.claim=="string"?rs(r.claim,280):"";h&&o.push({id:r.id,claim:h,reason:typeof r.reason=="string"?rs(r.reason,280):"",source:typeof r.source=="string"?rs(r.source,120):"",anchor:typeof r.anchor=="string"?rs(r.anchor,180):"",picture:typeof r.picture=="string"&&r.picture.length<=16?r.picture:void 0,beat:typeof r.beat=="string"?rs(r.beat,180):void 0,toolId:dn(r.toolId)?r.toolId:void 0,acquiredAt:yi(r.acquiredAt)?r.acquiredAt:""})}return o}function v1(a){return jn(a)?a.kind===Xd&&jn(a.progress):!1}function k1(a){return!jn(a)||a.kind===Xd?!1:Array.isArray(a.completed)||Array.isArray(a.journal)||Array.isArray(a.held)||Array.isArray(a.dailyDates)||typeof a.started=="boolean"}function Uy(a,o){let r=o,h=a;return h<1&&(h=1),h===1&&(r=Ho(r)),h>oa&&(r=Ho(r)),r}function Wo(a,o=new Date().toISOString()){return{kind:Xd,schemaVersion:oa,appVersion:Qt,savedAt:o,progress:Ho(a)}}function nw(a){if(v1(a)){const o=a.schemaVersion;if(o!==void 0){if(typeof o!="number"||!Number.isInteger(o)||o<0)return{ok:!1,error:"That save’s schema version is not valid."};if(o>oa)return{ok:!1,error:"This save needs a newer Silver City before it can be imported."}}const h=Uy(typeof o=="number"?o:1,Ho(a.progress)),d=typeof a.savedAt=="string"&&a.savedAt.length<=40?a.savedAt:new Date().toISOString(),m=typeof a.appVersion=="string"&&a.appVersion.length<=kd?rs(a.appVersion,kd):Qt;return{ok:!0,progress:h,meta:{schemaVersion:oa,appVersion:m,savedAt:d,source:"envelope"},envelope:Wo(h,d)}}if(k1(a)){const o=Uy(0,Ho(a)),r=new Date().toISOString();return{ok:!0,progress:o,meta:{schemaVersion:oa,appVersion:Qt,savedAt:r,source:"legacy"},envelope:Wo(o,r)}}return{ok:!1,error:"That file is not a Silver City save."}}function T1(a){if(typeof Buffer<"u")return Buffer.from(a,"utf8").toString("base64url");const o=new TextEncoder().encode(a);let r="";return o.forEach(h=>{r+=String.fromCharCode(h)}),btoa(r).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}function x1(a){const o=a.replace(/-/g,"+").replace(/_/g,"/"),r=o.length%4===0?"":"=".repeat(4-o.length%4),h=o+r;if(typeof Buffer<"u")return Buffer.from(h,"base64").toString("utf8");const d=atob(h),m=Uint8Array.from(d,w=>w.charCodeAt(0));return new TextDecoder().decode(m)}function S1(a){return`SC1.${T1(JSON.stringify(a))}`}function j1(a){const o=a.trim();if(!o)return{ok:!1,error:"Nothing to import."};if(o.length>i1)return{ok:!1,error:"That save is too large to import."};let r=o;if(o.startsWith("SC1."))try{r=x1(o.slice(4))}catch{return{ok:!1,error:"That share code could not be read."}}if(r.length>Qd)return{ok:!1,error:"That save is too large to import."};try{return nw(JSON.parse(r))}catch{return{ok:!1,error:"That save is not valid JSON."}}}function aw(a){if(typeof localStorage>"u")return null;try{return localStorage.getItem(a)}catch{return null}}function sw(a,o){typeof localStorage>"u"||localStorage.setItem(a,o)}function M1(){const a=aw(Ed);if(!a)return{progress:ul(),meta:{schemaVersion:oa,appVersion:Qt,savedAt:"",source:"envelope"}};try{const o=nw(JSON.parse(a));return o.ok?(o.meta.source==="legacy"&&Td(o.progress,o.meta.savedAt),{progress:o.progress,meta:o.meta}):{progress:ul(),meta:{schemaVersion:oa,appVersion:Qt,savedAt:"",source:"legacy"}}}catch{return{progress:ul(),meta:{schemaVersion:oa,appVersion:Qt,savedAt:"",source:"legacy"}}}}function Td(a,o=new Date().toISOString()){const r=Wo(a,o);return sw(Ed,JSON.stringify(r)),{schemaVersion:r.schemaVersion,appVersion:r.appVersion,savedAt:r.savedAt,source:"envelope"}}function By(){const a=aw(Ed);a&&sw(Ok,a)}function C1(a,o,r){return a===o?{streak:Math.max(1,r),tone:"already"}:a?a===Oo(o,-1)?{streak:r+1,tone:"continue"}:{streak:1,tone:"welcome-back"}:{streak:1,tone:"first"}}function iw(a){const o=/^trail-days-(\d+)$/.exec(a);return o?Number(o[1]):null}function Fy(){const a=M1();return{progress:A1(a.progress),meta:a.meta}}function A1(a){const o={...a.memory};let r=!1;for(const[h,d]of Object.entries(o))(!d.pillar||d.pillar==="unspecified")&&(o[h]={...d,pillar:Do(h)},r=!0);return r?{...a,memory:o}:a}function Al(a,o){return a.challenges.every(r=>o.includes(r.id))}const xd=2;function ow(a){const o=jt.find(r=>r.id==="parable-hollow");return o?o.challenges.filter(r=>a.includes(r.id)).length:0}function Jo(a,o,r=!1){if(a==="witness-bench"){const m=ow(o);return r?`This street is locked. Finish 2 Jesus stories at the creek (${m}/2), then the square opens.`:`Walk ${xd} scenes in Story Creek (${m}/${xd}) — then Silas. Unpayable can wait.`}const h=jt.find(m=>m.id===a),d=h?jt.find(m=>m.order===h.order-1):void 0;return d?r?`This street is locked. Finish ${d.title} first, then this lot opens.`:`Finish ${d.title}, then the path opens.`:r?"This street is locked. Finish the walk before it first.":"This gate is still closed."}function bi(a,o){const r=jt.find(d=>d.id===a);if(!r)return!1;if(r.order===1)return!0;const h=jt.find(d=>d.order===r.order-1);return h?r.id==="witness-bench"?ow(o)>=xd:Al(h,o):!1}function N1(a){if(a==="witness-bench")return"parable-hollow";const o=jt.find(h=>h.id===a);return(o?jt.find(h=>h.order===o.order-1):void 0)?.id??a}function Zd(a,o){return a.challenges.find(r=>!o.includes(r.id))}function Tl(a,o){const r=jt.find(d=>d.id===a);if(!r)return{name:"hub"};const h=Zd(r,o);return h?{name:"challenge",areaId:r.id,challengeId:h.id}:{name:"area",areaId:r.id}}function vi(a,o=Dt()){return a.lastDailyDate===o||a.dailyDates.includes(o)}function L1(a,o=Dt()){return $d(a.memory,o).filter(r=>!Ln(r.id)).map(r=>({trace:r,brief:qt(r.id),entry:us(r.id)??Nt.find(h=>h.id===r.id)}))}function eu(a,o=Dt()){return $d(a.memory,o).length}function tu(a,o=Dt()){if(!vi(a,o))return{kind:"daily",title:"Today’s Trail",detail:`${yl(o,a.dailyDates.filter(r=>r!==o).length).challenge.title} · about a minute`};if(!a.started)return{kind:"welcome",title:"Begin in Story Creek",detail:"After today’s short walk, the longer trail opens here.",areaId:"parable-hollow"};for(const r of jt){if(!bi(r.id,a.completed)){const d=jt.find(m=>m.order===r.order-1);return{kind:"area",title:`${r.title} is still gated`,detail:Jo(r.id,a.completed),areaId:d?.id}}const h=Zd(r,a.completed);if(h)return{kind:"challenge",title:`Next: ${h.title}`,detail:`${r.title} · ${h.kind.replace("-"," ")}`,areaId:r.id,challengeId:h.id}}return{kind:"vista",title:"The lookout is yours",detail:ye(a)?"Every area is open. Sit with the journal — or choose a sentence to remember.":"Every area is open. Sit with the journal — or rehearse a takeaway."}}function Sd(a){return us(a)?.id??Nt.find(o=>o.id===a)?.id??a}function E1(a,o=Dt()){const r=Kd(a,o).map(m=>({trace:m,brief:qt(m.id),entry:us(m.id)??Nt.find(w=>w.id===m.id)})).find(m=>m.brief);if(r){const m=r.brief?.claim??r.entry?.title??"A held line",w={name:"journal",focusId:r.entry?.id??Sd(r.trace.id),autoQuiz:!0};return ye(a)?{title:"Choose the sentence to remember.",detail:`${m} · due this morning`,cta:"Choose the sentence to remember.",go:w}:{title:ot.tapTakeaway,detail:`${m} · due this morning`,cta:ot.tapTakeaway,go:w}}if(!vi(a,o))return{title:ye(a)?"Read today’s story.":"Next walk",detail:ye(a)?`${yl(o,a.dailyDates.filter(m=>m!==o).length).challenge.title} · today’s trail`:`${yl(o,a.dailyDates.filter(m=>m!==o).length).challenge.title} · today’s trail · fold, then rehearse the claim`,cta:ye(a)?"Read today’s story.":"Walk today’s trail",go:{name:"daily"}};const h=Object.values(a.memory).filter(m=>m.nextReviewAt>o&&!Ln(m.id)).sort((m,w)=>m.nextReviewAt.localeCompare(w.nextReviewAt))[0],d=tu(a,o);if(h){const m=qt(h.id);return{title:ye(a)?"Choose the sentence to remember.":ot.tapTakeaway,detail:`${m?.claim??qg(h.id)?.challenge.title??"A held line"} · ${Go(h,o)}`,cta:ye(a)?"Choose the sentence to remember.":ot.tapTakeaway,go:{name:"journal",focusId:Sd(h.id),autoQuiz:!0}}}return d.kind==="challenge"&&d.areaId&&d.challengeId?{title:"Next on the trail",detail:d.detail,cta:"Open this walk",go:{name:"challenge",areaId:d.areaId,challengeId:d.challengeId}}:d.kind==="area"&&d.areaId?{title:"Next on the trail",detail:d.detail,cta:d.title,go:{name:"area",areaId:d.areaId}}:d.kind==="vista"?{title:"Next rebuild",detail:ye(a)?"Sit with a journal page, or choose a sentence to remember.":"Sit with a journal page, or rehearse a takeaway.",cta:"Open the journal",go:{name:"journal"}}:{title:d.title,detail:d.detail,cta:"Continue",go:{name:"hub"}}}function $y(a,o,r,h){const d=h||Do(o);return!a||a==="porch"||a==="daily-trail"?o.startsWith("daily-")||r==="daily-trail":d===a||r===a}function xl(a,o,r=Dt()){const h=L1(a,r).filter(y=>y.brief),d=h.find(y=>$y(o,y.trace.id,y.entry?.areaId,y.trace.pillar))??(o&&o!=="porch"&&o!=="daily-trail"?void 0:h[0]);if(d)return{name:"journal",focusId:d.entry?.id??d.trace.id,autoQuiz:!0};const m=[...a.held].filter(y=>!Ln(y)).reverse(),w=m.find(y=>$y(o,y,us(y)?.areaId,a.memory[y]?.pillar))??(o&&o!=="porch"&&o!=="daily-trail"?void 0:m[0]);if(w)return{name:"journal",focusId:Sd(w),autoQuiz:!0};if(o&&o!=="porch"&&o!=="daily-trail"){const y=Nt.find(f=>f.areaId===o&&a.journal.includes(f.id));if(y)return{name:"journal",focusId:y.id,autoQuiz:!0}}return{name:"journal"}}function H1(a){return Nt.filter(o=>o.unlockAfter===a).map(o=>o.id)}function Ky(a){return Nt.filter(o=>{const r=iw(o.unlockAfter);return r!==null&&a>=r}).map(o=>o.id)}function W1(a,o){return{done:a.challenges.filter(h=>o.includes(h.id)).length,total:a.challenges.length}}function rw(a){const o=Object.values(a.stars).reduce((r,h)=>r+h,0);return a.firstTry.length*3+a.completed.length*2+o}function I1(a){const o=Nt.length,r=Nt.filter(h=>a.journal.includes(h.id)).length;return{open:r,total:o,percent:o===0?0:Math.round(r/o*100)}}function O1(a,o){return dx(a.challenges.map(r=>r.id),o)}const lw=W.createContext(null);function Je(){const a=W.useContext(lw);if(!a)throw new Error("useProgress must be used within ProgressProvider");return a}function R1({areaId:a,onNavigate:o}){const{progress:r}=Je(),h=ye(r),d=Ud(a);if(!d)return s.jsx("main",{className:"page",children:s.jsx("p",{children:"That district is not on the map."})});const m=bi(d.id,r.completed),w=Al(d,r.completed),{done:y,total:f}=W1(d,r.completed),g=Zd(d,r.completed),T=O1(d,r.stars),b=jo(d.id),M=qk[d.id];return s.jsxs("main",{className:"area-page",children:[s.jsxs("button",{type:"button",className:"text-link",onClick:()=>o({name:"hub"}),children:["← ",h?Z.home:"The town"]}),s.jsxs("header",{className:"area-hero",style:{"--accent":d.accent},children:[s.jsxs("div",{className:"area-hero-cast",children:[s.jsx(it,{who:b.id,size:"xl"}),s.jsx(it,{who:"river",size:"md"})]}),s.jsx(Jg,{pillar:d.id,compact:!0}),s.jsxs("p",{className:"eyebrow",children:[b.role," · in town"]}),s.jsx("h1",{children:d.title}),s.jsxs("p",{className:"progress-line",children:[y," of ",f,w?" · street’s standing":"",T.earned?` · ${T.earned}★`:""]})]}),M?s.jsx(zg,{who:b.id,line:w?M.after:M.hello}):null,m?s.jsx("ol",{className:"challenge-list",children:d.challenges.map((E,G)=>{const I=r.completed.includes(E.id),_=m&&(I||d.challenges.slice(0,G).every(Q=>r.completed.includes(Q.id)));return s.jsx("li",{children:s.jsxs("button",{type:"button",className:`challenge-row ${I?"is-done":""} ${_?"":"is-wait"}`,disabled:!_,onClick:()=>o({name:"challenge",areaId:d.id,challengeId:E.id}),children:[s.jsx("span",{className:"idx",children:G+1}),s.jsxs("span",{className:"challenge-meta",children:[s.jsx("strong",{children:E.title}),s.jsx("em",{children:hx(E.kind)}),r.stars[E.id]?s.jsx(_g,{count:r.stars[E.id],compact:!0,label:kl(r.stars[E.id])}):null]}),s.jsx("span",{className:"row-status",children:I?kl(r.stars[E.id]??0):_?"Play":"Soon"})]})},E.id)})}):s.jsx("p",{className:"locked-note",children:Jo(d.id,r.completed,ye(r))}),g&&m?s.jsx("button",{type:"button",className:"btn primary xl",onClick:()=>o({name:"challenge",areaId:d.id,challengeId:g.id}),children:"Keep building"}):null,w?s.jsxs("div",{className:"area-replay",children:[s.jsxs("button",{type:"button",className:"btn primary xl",onClick:()=>o({name:"challenge",areaId:d.id,challengeId:d.challenges[0].id}),children:["Walk with ",b.shortName]}),s.jsx("button",{type:"button",className:"btn gold",onClick:()=>o({name:"journal"}),children:"Read this district in the journal"})]}):null]})}function q1({view:a,onNavigate:o,children:r}){const{progress:h}=Je(),d=ye(h),m=tu(h),w=eu(h),y=a.name==="welcome",f=a.name==="daily"||a.name==="challenge"||a.name==="journal"||a.name==="defend"||a.name==="link"||a.name==="learn"||a.name==="profile",g=a.name==="hub",T=y||f||g||d;function b(){if(m.kind==="daily"){o({name:"daily"});return}if(m.kind==="welcome"){o({name:"welcome"});return}if(m.kind==="vista"){o({name:"vista"});return}if(m.challengeId&&m.areaId){o({name:"challenge",areaId:m.areaId,challengeId:m.challengeId});return}m.areaId&&o({name:"area",areaId:m.areaId})}return s.jsxs("div",{className:`app ${y?"is-welcome":""} ${f?"is-play":""} ${g?"is-town":""}`,"data-theme":h.theme??"candy","data-easy":h.easyMode?"on":"off",children:[s.jsx("div",{className:"grain","aria-hidden":!0}),y?null:s.jsxs("header",{className:"topbar",children:[s.jsxs("button",{type:"button",className:"brand",onClick:()=>o({name:"hub"}),children:[s.jsx(it,{who:"river",size:"sm"}),"Silver City"]}),s.jsxs("nav",{children:[s.jsx("button",{type:"button",className:a.name==="hub"?"is-active":"",onClick:()=>o({name:"hub"}),children:d?"Home":"Town"}),d?null:s.jsx("button",{type:"button",className:a.name==="daily"?"is-active":"",onClick:()=>o({name:"daily"}),children:"Trail"}),s.jsx("button",{type:"button",className:a.name==="journal"?"is-active":"",onClick:()=>o(d?Gd(h):{name:"journal"}),children:d?Z.saved:"Journal"}),s.jsx("button",{type:"button",className:a.name==="settings"?"is-active":"",onClick:()=>o({name:"settings"}),children:"Settings"})]})]}),s.jsx("div",{className:"app-body",children:r}),T?null:s.jsxs("footer",{className:"goalbar",children:[s.jsxs("button",{type:"button",className:"goal",onClick:b,children:[s.jsx("span",{className:"goal-kicker",children:"What’s next"}),s.jsx("strong",{children:m.title}),s.jsx("em",{children:m.detail})]}),s.jsxs("p",{className:"score",title:d?"Sentences you kept":"Held lines are claims you rebuilt from memory",children:[d?Z.saved:"Held"," ",h.held.length,w?` · due ${w}`:"",d?null:s.jsxs("span",{className:"score-sub",children:[" · insight ",rw(h)]})]})]})]})}function D1(a,o){return[...a.filter(h=>h.id!==o.id),o]}const cw=[kg,Tg,vg,hg,dg];function hw(a){for(const o of cw)if(o.challenges.some(r=>r.id===a))return o.id;return a==="td-watch"?"parable-hollow":(a.startsWith("daily-"),"daily-trail")}function P1(a){for(const o of cw){const r=o.challenges.find(h=>h.id===a);if(r?.idea)return r.idea}return fl.find(o=>o.challenge.id===a)?.challenge.idea}function G1(a){const o=hw(a);return a.startsWith("daily-")||o==="daily-trail"?tt.find(r=>r.id==="porch")??tt[0]:tt.find(r=>r.areaId===o)??tt.find(r=>r.id==="porch")??tt[0]}function z1(a){const o=hw(a);return a.startsWith("daily-")||o==="daily-trail"?en.juniper:jo(o)}function Nl(a){const o=P1(a);if(o)return o;if(a==="td-watch")return"when compassion moves you, help like the Samaritan";const r=Sl(a);return r?`a picture you can still hold for ${r.label}`:"a picture you can still hold"}function J1(a,o){const r=z1(o),h=G1(o),d=[...a.held??[]].filter(f=>f!==o).at(-1),m=d?qt(d):void 0,w=`${r.name} · ${h.title}`;if(!m?.claim)return w;const y=m.claim.length>72?`${m.claim.slice(0,69)}…`:m.claim;return`${w} · after “${y}”`}function _1(a,o){if(Ln(a.id))return;const r=qt(a.id);if(!r)return;const h=Sl(a.id);return{id:a.id,claim:r.claim,reason:r.reason,source:r.source,anchor:J1(o,a.id),picture:Fd(a.id,h),beat:Nl(a.id),toolId:h?.id,acquiredAt:a.today}}function cs(a,o){return(a.learnings??[]).find(r=>r.id===o)}function Yy(a,o){return(a.learnings??[]).filter(h=>h.toolId===o&&!Ln(h.id)).at(-1)}function dw(a){return[...a.learnings??[]].filter(o=>!Ln(o.id)).reverse()}function ml(a){return a.beat?a:{...a,beat:Nl(a.id)}}function U1(a){if(a.toolId)return Ga(a.toolId)?.label??a.toolId}function Zt(a){const o=[...a];for(let r=o.length-1;r>0;r-=1){const h=Math.floor(Math.random()*(r+1)),d=o[r],m=o[h];d===void 0||m===void 0||(o[r]=m,o[h]=d)}return o}function He(a,o,r){return{gloss:a,teach:o,word:r?{term:r.term,sense:r.sense}:void 0,hint:r?.hint}}const B1={"ph-road":He("A neighbor is the person who shows mercy — not the person who looks like you.","Jesus tells a story. A hurt man lies on the road. Religious men walk past. A Samaritan is moved with compassion and helps. Then Jesus asks who *proved* to be a neighbor.",{term:"Samaritan",sense:"someone the listener did not expect to be the hero",hint:"Mercy is the test — not the family name."}),"ph-father":He("The father runs with mercy before the son finishes his speech.","The son wasted the money. He starts a hired-hand speech. The father runs first. Honor is spent so the son can be hugged.",{term:"Mercy",sense:"kindness you did not earn",hint:"The run comes before the apology is done."}),"ph-seeds":He("The kingdom comes in Jesus stories you can hold — not slogans.","Soil, a search, a tiny seed, and a trust. Each Jesus story asks what you will do with what you heard.",{term:"Parable",sense:"a Jesus story that asks you to decide",hint:"Keep the right pictures. Remove wrong picks."}),"ph-debt":He("If you were forgiven a huge debt, you cannot choke a neighbor over a small one.","A king wipes an unpayable bill. That same servant then chokes a neighbor over a tiny sum. Example: huge debt forgiven — then a tiny one demanded.",{term:"Debt",sense:"what you owe and cannot pay",hint:"Keep the mercy. Toss the choke. Example: a huge bill wiped, then a tiny one demanded."}),"wb-creed":He("Paul hands on an old shared belief: died, buried, raised, appeared.","This is not Paul’s private dream. He says the churches were already saying it: Christ died, was buried, was raised, and was seen.",{term:"Creed",sense:"an old shared belief the churches already said out loud",hint:"Death, burial, raising, appearances — in that order."}),"wb-early":He("That old shared belief is early testimony, not a medieval insert.","Paul wrote in the mid-first century. He says he received this core and passed it on. That is close to the events — not a monk’s later add-on.",{term:"Testimony",sense:"a report from people who claim to have seen",hint:"Keep “received and delivered.” Toss lab-proof talk."}),"wb-method":He("Historians weigh sources. They cannot rerun the past.","Ask: how many reports? How awkward is the detail? How soon was it said? Does it fit that world? Those tools test a report. They are not a chemistry lab.",{term:"Historian",sense:"someone who weighs old reports, not a person who reruns last Tuesday",hint:"Match each tool to what it tests."}),"wb-women":He("Women as first witnesses is an awkward detail to invent.","The tomb stories begin with women. Luke says the men called it idle talk. If you only wanted later respect, you would more likely lead with respected men.",{term:"Witness",sense:"someone who says what they saw",hint:"Keep the costly opening. Toss overclaims."}),"ob-tuning":He("The universe is finely tuned for life — that fit points to a Designer.","Life needs very tight numbers: how fast space expands, how atoms stick, how tidy the start was. Design predicts a world we can live in. Blind chance does not.",{term:"Fine-tuning",sense:"life’s dials fit in a very narrow range",hint:"Tap the picture, then the mark that belongs. Two choices."}),"ob-design":He("Fine-tuning is best explained by a mind that intended a habitable world.","The ranges are extravagantly narrow. A Designer who wants observers leads us to expect that fit. A world that does not care does not.",{term:"Habitable",sense:"a world where living things can exist",hint:"Place the next stone. Two choices. Leave the overclaims."}),"ob-leibniz":He("Physics maps how the world runs. It does not finish why there is a world.","A hot early state is still something. Empty space in a lab is still something. The question remains: why is there anything at all?",{term:"Nothing",sense:"not a vacuum — not even empty space with laws",hint:"Keep the careful reading. Toss “free lunch.”"}),"ob-life":He("Life’s specified information is a mark of mind.","Cells store instructions and run a coordinated life. That looks like the work of mind. Wonder is rational. So is more lab work. Do not shrug it away.",{term:"Specified information",sense:"ordered instructions that do a real job — not random noise",hint:"Keep the careful line. Toss both shrugs."}),"fg-mover":He("Change here and now still asks for a first changer.","Things go from “can be” to “is.” Nothing gives itself that step. A stack of receivers is not an answer. There is a first changer not itself changed.",{term:"First mover",sense:"the bottom of the explanation — not only the oldest date",hint:"Order the chain of change. Two choices at a time."}),"fg-contingent":He("What might not have been needs a ground.","You exist, but you might not have. A world of only “might-not-have-beens” does not explain why anything is here. Classical theism names the necessary ground God.",{term:"Might not have been",sense:"it is real, but it could have failed to be",hint:"Assemble the chain. Leave the joke cards."}),"fg-kalam":He("Whatever begins still asks for a cause.","If something begins, it has a cause. If this universe began, it has a cause. Naming Abraham’s God takes further historical steps.",{term:"Kalām",sense:"the beginning argument — what starts still asks for a cause",hint:"Keep the beginning argument. Toss the flattenings."}),"fg-limits":He("A first cause is not yet the whole Christian faith.","If the argument works, you have a first cause. Intellect, goodness, and the gospel are further steps — not leaks.",{term:"Creed",sense:"the full Christian confession — more than “a first cause”",hint:"Keep the honest limit. Toss “all done” and “worthless.”"}),"hl-moral":He("Duty feels real — not like a taste for tea.","Duty is more than a taste. Romans 2 says strangers already know enough to accuse one another.",{term:"Duty",sense:"what you ought to do, even when you do not feel like it",hint:"Build the modest chain. Leave contempt and collapse."}),"hl-mind":He("Inner experience is not captured by a scan.","Felt redness, thoughts about things, and the pull of truth are not just collisions. Mind is at home if the world’s ground is a living God.",{term:"Felt life",sense:"what it is like on the inside — not a scan number",hint:"Match each leftover mystery. Two choices."}),"hl-meaning":He("You can build a local meaning. The lookout asks if it is also received.","Work and pleasure are gifts. They are not the final good. Ecclesiastes keeps both truths.",{term:"Meaning",sense:"a good that can be found — not only assembled",hint:"Keep the hunger. Toss “only a mood.”"}),"hl-beauty":He("Beauty wakes a hunger it cannot feed — longing for a country the sunset cannot give.","Psalm 19 treats the sky as speech. Hungers like that usually correspond to real countries.",{term:"Beauty",sense:"a glory that calls you — not only a nice feeling",hint:"Keep the signpost. Toss “only taste.”"}),"daily-lantern":He("A lamp is meant to be seen.","Jesus uses an ordinary lamp and a city on a hill. Public without being proud.",{term:"Lamp",sense:"a light others can actually see",hint:"Keep the right pictures. Remove wrong picks."}),"daily-gems":He("Jesus taught with pictures you can hold.","A lamp is seen. Seed meets different hearts. The cup is poured for many — gift, not wage.",{term:"Gift",sense:"given, not earned as a wage",hint:"Keep the right pictures. Remove wrong picks."}),"daily-seed":He("The same word meets different soils. Some seed is lost.","This Jesus story invites hearing. It does not flatter every field.",{term:"Parable",sense:"a Jesus story that asks you to decide",hint:"Keep the honest field. Toss “every field wins.”"}),"daily-names":He("The resurrection claim stacks named witnesses, not one private voice.","Paul lists Cephas, the Twelve, and more than five hundred — many still living then.",{term:"Witness",sense:"a named person who was said to have seen",hint:"Keep the names. Toss the anonymous dream."}),"daily-creed":He("The old shared belief sits between the event and Paul’s letter.","If that short line is early, the claim is close to what it names: died, buried, raised.",{term:"Creed",sense:"an old shared belief the churches already said out loud",hint:"Keep “received.” Toss “Paul invented it while writing.”"}),"daily-stars":He("The heavens already speak of a Maker. Fine-tuning fits that voice.","Psalm 19 and Romans 1 treat the sky as speech. The heavens already speak of a Maker.",{term:"Maker",sense:"the One who intended this world",hint:"Keep the sky as speech. Toss “silent decoration.”"}),"daily-life":He("Life, place, and mind are not cheap facts.","Copying cells, a habitable band, and a mind that can do science all look given — the marks of a Maker.",{term:"Given",sense:"received, not cheap leftover",hint:"Keep the marks. Toss “it just happened.”"}),"daily-scroll":He("We hold a river of copies, not the first ink.","Scribes copy. Later hands compare. Then a page prints a recovered text. The word still stands.",{term:"Copies",sense:"later hands writing the same line — not cheating",hint:"Keep the river of copies. Toss “we hold the first ink.”"}),"daily-isaiah":He("Isaiah 53’s Servant is the Jesus the church confesses — wounded for others, silent like a lamb.","The poem’s Servant suffers for others and does not answer with a sword. The church names that Servant as Jesus.",{term:"Servant",sense:"the wounded one in Isaiah 53 — not a general on a horse",hint:"Keep the wounds. Toss the sword."}),"daily-grace":He("Grace is gift, not wage. Faith receives. Boast starves.","God moves first. You did not finish a map that earned this.",{term:"Grace",sense:"gift you did not earn",hint:"Keep the gift. Toss the wage."}),"daily-rest":He("Tired people are named first. Rest is the gift, not a steeper hill.","The invitation is to a person — “Come to me” — not a performance.",{term:"Rest",sense:"gift for the weary, not a prize for climbing harder",hint:"Keep the invitation. Toss the steeper program."}),"daily-neighbor":He("Mercy makes a neighbor. Pedigree does not.","Jesus asks who *proved* to be a neighbor — the one who showed mercy.",{term:"Pedigree",sense:"family name or in-group badge",hint:"Keep mercy. Toss “already my people.”"}),"daily-empty":He("The first Easter reports include an empty place, women, fear, and wonder.","The town does not sand that awkwardness into a tidy triumph.",{term:"Empty",sense:"the place was not occupied when they looked",hint:"Keep the awkward opening. Toss the senate conversion."}),"daily-cosmos":He("The universe exists and did not have to — so a Source is worth naming.","The world is here, and it did not have to be. The psalms name a Giver — not a shrug.",{term:"Source",sense:"the One from whom this world comes",hint:"Keep the question. Toss the shrug."}),"daily-door":He("Jesus’ “door” is a particular way in with a wide anyone.","You may refuse it. The town will not lock you in a pew.",{term:"Door",sense:"a real way in — not a wall",hint:"Keep the right pictures. Remove wrong picks."}),"td-watch":He("Love — when compassion moves you, help like the Samaritan. Tap the glowing face.","Tap the glowing face. When compassion moves you, help like the Samaritan.",{term:"Love",sense:"the Night Watch tool — how to use it, not a new main idea",hint:"Tap the face six times. Example: tap the glowing person."}),"ln-street":He("An idea lives at a place, with a person.","Mercy tells Jesus stories at the creek — that is why the neighbor who stops on the road lives at Story Creek. Silas copies names on the square — that is why the old shared belief lives at Witness Square. Juniper’s lamp is on the porch so today’s line can be seen.",{term:"Match",sense:"connect the sentence to its place and person",hint:"Tap the sentence, then the place, then the person. One story at a time."})};function Ll(a){const o=Ro(a),r=B1[a];if(o)return{gloss:o.easy.gloss||o.plain||r?.gloss||o.claim,teach:o.easy.learn||r?.teach||o.claim,word:o.easy.word||r?.word,hint:o.easy.hint||r?.hint};if(r)return r;const h=qt(a);if(h)return{gloss:h.claim,teach:h.reason,hint:"Read the line. Pick what matches it."}}function _o({text:a,id:o,onPeek:r}){const{progress:h}=Je(),d=ye(h),m=d&&o?qn(Ll(o)?.hint??a??""):a,[w,y]=W.useState(!1);return m?d?s.jsx("p",{className:"easy-hint",children:m}):s.jsxs("div",{className:"hint-peek",children:[s.jsx("button",{type:"button",className:"hint-toggle",onClick:()=>{w||r?.(),y(f=>!f)},children:w?"Hide":"Clue"}),w?s.jsxs(s.Fragment,{children:[s.jsx("p",{className:"hint-cost",children:"Won’t count as clean"}),s.jsx("p",{className:"context",children:a})]}):null]}):null}const hs={claim:{term:"Claim",sense:"the main idea we hold to be true",teach:"A claim is the main idea we hold to be true."},hold:{term:"Hold",sense:"keep a true line you can still say tomorrow",teach:"To hold a claim is to keep it so you can still say it tomorrow."},reason:{term:"Reason",sense:"why the claim stands",teach:"A reason is why the claim stands."},source:{term:"Source",sense:"where the claim comes from",teach:"A source is where the claim comes from."},creed:{term:"Creed",sense:"an old shared belief",teach:"A creed is an old shared belief the churches already said out loud."},parable:{term:"Parable",sense:"a Jesus story",teach:"A parable is a Jesus story that asks you to decide."},fineTuning:{term:"Fine-tuning",sense:"life’s dials fit in a very narrow range",teach:"Fine-tuning means life’s dials fit — the ranges that allow life are very tight."},premise:{term:"Premise",sense:"a building block of an argument",teach:"A premise is a building block of an argument."},kalam:{term:"Kalām",sense:"the beginning argument — what starts still asks for a cause",teach:"Kalām is the beginning argument: whatever begins still asks for a cause."},upgrade:{term:"Build this",sense:"raise the next look you earned by learning, not by paying",teach:"Build this means raise the next look you earned by learning — not by paying."},deploy:{term:"Deploy",sense:"use a claim you held",teach:"Deploy means use a claim you held — a claim is what we hold to be true."}},F1={"ph-road":["parable"],"ph-father":["parable"],"ph-seeds":["parable"],"ph-debt":["parable"],"daily-seed":["parable"],"daily-gems":["parable"],"daily-neighbor":["parable"],"wb-creed":["creed"],"wb-early":["creed"],"daily-creed":["creed"],"ob-tuning":["fineTuning"],"ob-design":["fineTuning","premise"],"daily-stars":["fineTuning"],"fg-kalam":["kalam"],"fg-mover":["premise"],"fg-contingent":["premise"],"fg-limits":["creed"],"hl-moral":["premise"]};function $1(a){return F1[a]??[]}function K1(a,o){const r=["claim"];o&&r.push("hold","reason","source"),r.push(...$1(a));const h=new Set,d=[];for(const m of r){const w=hs[m];h.has(w.term)||(h.add(w.term),d.push(w))}return d}function Y1(a,o){return a==="ln-street"?"Tap the sentence, then the place, then the person. One story at a time.":a==="ph-father"?"Toss the wrong picks. Keep the father running to his son.":a==="ph-seeds"?"Match each Jesus story to the short line it is making.":a==="ph-debt"?"Sort the sentences. Only one belongs in the keep bin.":a==="daily-gems"?"Match each picture to the short line.":a==="wb-early"||a==="wb-method"?o.replace(/historical claim/,"historical line").replace(/overclaims/,"stretch"):a==="fg-contingent"?"Stack the stones: things that might not have been still need a ground.":a==="fg-kalam"?"Keep the beginning argument. Toss the rest.":o.replace(/\bclaims\b/g,"sentences").replace(/\bclaim\b/g,"main idea")}function Uo({challenge:a}){const{progress:o}=Je(),r=ye(o)?a.prompt:a.idea??a.prompt,h=ye(o)?Y1(a.id,r):r;return s.jsx("p",{className:"prompt",children:h})}function ki({play:a,stamp:o="Locked!"}){return a?s.jsxs("div",{className:"win-burst","aria-hidden":!0,children:[s.jsx("span",{className:"win-flash"}),s.jsx("span",{className:"win-ring"}),s.jsx("span",{className:"win-stamp-wrap",children:s.jsx("strong",{className:"win-stamp is-badge",children:o})}),Bx.map(r=>s.jsx("span",{className:`win-spark ${r%3===0?"is-shard":""}`,style:{"--i":r}},r)),Fx.map(r=>s.jsx("span",{className:"win-gem",style:{"--i":r}},`gem-${r}`))]}):null}function cl(a,o,r){const h=a.slots[o];if(!h)return null;const d=a.cards.filter(y=>y.id!==h.correctCardId&&!r.has(y.id)),m=d.filter(y=>y.distractor),w=m.length>0?m:d;return Zt(w)[0]?.id??null}function V1({challenge:a,onMiss:o,onSolved:r,onPeek:h}){const{progress:d}=Je(),m=ye(d)||a.id.startsWith("ob-"),w=W.useMemo(()=>Zt(a.cards),[a.cards]),y=w,[f,g]=W.useState(w),[T,b]=W.useState({}),[M,E]=W.useState(null),[G,I]=W.useState("idle"),[_,Q]=W.useState(!1),[ne,se]=W.useState(0),[ie,re]=W.useState([]),[F,B]=W.useState(()=>m?cl(a,0,new Set):null),te=a.slots.find(R=>!T[R.id]),ee=new Set(Object.values(T).filter(R=>!!R).map(R=>R.id)),ge=new Set(m?[te?.correctCardId,F].filter(R=>!!R):y.map(R=>R.id)),j=a.slots.every(R=>T[R.id]);function O(R){return f.find(k=>k?.id===R)??Object.values(T).find(k=>k?.id===R)}function A(R=!0){I("wrong"),Q(!0),R&&(se(k=>k+1),o()),window.setTimeout(()=>{Q(!1),I("idle")},880)}function X(){Q(!1),I("idle"),E(null)}function L(R,k){const N={...T},K=N[k];for(const he of Object.keys(N))N[he]?.id===R.id&&delete N[he];N[k]=R;const Y=he=>y.findIndex(we=>we.id===he);return g(he=>{const we=he.map(Te=>Te?.id===R.id?null:Te);if(K&&K.id!==R.id){const Te=Y(K.id);Te>=0&&(we[Te]=K)}return we}),b(N),E(null),re(he=>he.filter(we=>we!==k)),I("idle"),N}function v(R){if(G==="ok"||!M)return;const k=O(M);if(!k||m&&te&&R!==te.id)return;if(m&&te&&k.id!==te.correctCardId){A(),E(null);return}const N=L(k,R);if(m){const K=a.slots.findIndex(Y=>!N[Y.id]);B(K>=0?cl(a,K,new Set(Object.values(N).filter(Y=>!!Y).map(Y=>Y.id))):null),a.slots.every(Y=>N[Y.id])&&(I("ok"),r())}}function x(R){if(G==="ok")return;if(!m){E(R===M?null:R),I("idle");return}if(!te)return;if(R!==te.correctCardId){A();return}const k=O(R);if(!k)return;const N=L(k,te.id),K=a.slots.findIndex(Y=>!N[Y.id]);B(K>=0?cl(a,K,new Set(Object.values(N).filter(Y=>!!Y).map(Y=>Y.id))):null),a.slots.every(Y=>N[Y.id])&&(I("ok"),r())}function J(R){if(G==="ok")return;const k=O(R);if(!k)return;const N=y.findIndex(Y=>Y.id===R),K={...T};for(const Y of Object.keys(K))K[Y]?.id===R&&delete K[Y];if(b(K),g(Y=>{if(Y.some(we=>we?.id===R))return Y;const he=[...Y];return N>=0&&(he[N]=k),he}),E(null),re(Y=>Y.filter(he=>T[he]?.id!==R)),I("idle"),m){const Y=a.slots.findIndex(he=>!K[he.id]);B(Y>=0?cl(a,Y,ee):null)}}function ae(R=T){const k=a.slots.filter(N=>R[N.id]?.id!==N.correctCardId).map(N=>N.id);if(k.length===0&&a.slots.every(N=>R[N.id])){I("ok"),re([]),r();return}re(k),A()}return s.jsxs("div",{className:`play is-build is-onescreen ${m?"is-deal":""} ${_?"is-shake":""} ${G==="ok"?"is-win":""}`,children:[s.jsx(ki,{play:G==="ok"}),s.jsx(Uo,{challenge:a}),s.jsx(_o,{text:a.context,id:a.id,onPeek:h}),s.jsx("p",{className:"sort-how",children:ye(d)?s.jsxs(s.Fragment,{children:[s.jsx("strong",{children:"A premise is a building block of an argument."})," Tap the next stone",m?" · two choices":""]}):m?s.jsxs(s.Fragment,{children:[s.jsx("strong",{children:"Tap the next stone"})," · two choices"]}):s.jsxs(s.Fragment,{children:[s.jsx("strong",{children:"Tap a stone"})," · then a slot"]})}),ne>0&&G!=="ok"?s.jsxs("p",{className:"match-toast",role:"status",children:[s.jsx("strong",{children:ne>=2?"One more look.":"That stone slipped."})," ",ne>=2?ye(d)?"Look again. Two choices.":a.teachOnWrong:m?"Not that stone. Try the other — the chain stays.":"Tap a red slot to swap. The chain stays; try again."]}):null,ne>0&&G!=="ok"?s.jsx("button",{type:"button",className:"btn tiny match-recover",onClick:X,children:"Try again"}):null,s.jsx("div",{className:"slot-list",children:a.slots.map((R,k)=>{const N=T[R.id],K=m?R.id===te?.id:!N&&!!M;return s.jsxs("div",{className:`slot ${R.role} ${ie.includes(R.id)?"is-wrong":""} ${K?"is-now":""}`,onClick:()=>{N||v(R.id)},children:[s.jsx("span",{className:"slot-label",children:R.label}),N?s.jsx("button",{type:"button",className:"chip in-slot pop-in",style:G==="ok"?fi(k,"mid"):void 0,onClick:Y=>{Y.stopPropagation(),J(N.id)},children:N.text}):s.jsx("button",{type:"button",className:`slot-target ${K?"awaiting":""}`,onClick:Y=>{Y.stopPropagation(),v(R.id)},children:K?"↓":""})]},R.id)})}),!m&&j&&G!=="ok"?s.jsx("button",{type:"button",className:"btn primary build-lock",onClick:()=>ae(),children:"Check the chain"}):null,s.jsx("div",{className:"bank is-order",children:y.map((R,k)=>{const N=f[k]?.id===R.id,K=m&&N&&!ge.has(R.id);return m&&!N||K?null:s.jsx("div",{className:`sort-tile sort-seat ${N&&M===R.id?"is-selected":""} ${N?"":"is-gone"} ${N?"":"was-placed"}`,style:m?void 0:{gridColumn:k%2+1,gridRow:Math.floor(k/2)+1},children:s.jsx("button",{type:"button",className:`chip ${N&&M===R.id?"is-selected":""} ${R.distractor?"is-tempt":""}`,tabIndex:0,"aria-label":N?R.text:`Return ${R.text} to its seat`,onClick:()=>{N?x(R.id):J(R.id)},children:R.text})},R.id)})})]})}const X1=""+new URL("neighbor-shows-mercy-DjFor-Rl.png",import.meta.url).href,uw={"ph-road":X1};function os(a,o){return a<o?`${a}:${o}`:`${o}:${a}`}function Q1({node:a,easy:o,challenge:r}){const h=Og(a,r),d=!!(h.who||h.plotId||h.art);return s.jsxs(s.Fragment,{children:[h.art?s.jsx("img",{className:"place-glyph link-art",src:uw[h.art],alt:"",draggable:!1}):null,h.who?s.jsx(it,{who:h.who,size:"xl"}):null,h.plotId?s.jsx(cx,{plotId:h.plotId}):null,s.jsx("span",{className:d?"link-label":void 0,children:Rg(a,o)})]})}function Z1(a,o){return a==="idea"?o?"Sentence":"Idea":a==="place"?"Place":"Person"}function Vy(a,o){return o==="idea"?a.ideaId:o==="place"?a.placeId:o==="person"?a.personId:null}function e0({challenge:a,onMiss:o,onSolved:r,onPeek:h,onEasyStop:d,streetBeat:m}){const{progress:w}=Je(),y=ye(w),[f,g]=W.useState([]),[T,b]=W.useState("idea"),[M,E]=W.useState(null),[G,I]=W.useState("idle"),[_,Q]=W.useState(!1),[ne,se]=W.useState(0),[ie,re]=W.useState(null),[F,B]=W.useState(!1),[te,ee]=W.useState("choose");function ge(le){const be=a.triples.find(Fe=>Fe.id===le);return be?[os(be.ideaId,be.placeId),os(be.placeId,be.personId)]:[]}const j=a.triples.find(le=>{const be=new Set(f.filter(Fe=>Fe.triple===le.id).map(Fe=>os(Fe.a,Fe.b)));return!ge(le.id).every(Fe=>be.has(Fe))}),O=j?Vy(j,T):null,A=j?new Set([j.ideaId,j.placeId,j.personId]):null,X={idea:!!(j&&f.some(le=>le.triple===j.id&&(le.a===j.ideaId||le.b===j.ideaId)))||T==="place"||T==="person"||T==="linked",place:!!(j&&f.some(le=>le.triple===j.id&&os(le.a,le.b)===os(j.ideaId,j.placeId)))||T==="person"||T==="linked",person:T==="linked"||!!(j&&ge(j.id).every(le=>f.some(be=>be.triple===j.id&&os(be.a,be.b)===le)))},L=W.useMemo(()=>{if(!j||T==="linked")return[];const le=T,be=Vy(j,T),Fe=a.nodes.filter(ce=>ce.kind===le),ue=Fe.find(ce=>ce.id===be),Pe=Zt(WT(Fe,be??"")),_e=y?Pe.slice(0,1):le==="idea"?Pe.slice(0,3):Pe;return Zt([ue,..._e].filter(ce=>!!ce))},[a.nodes,j?.id,T,y]);function v(){E(null),Q(!1),I("idle"),re(null),ee("choose")}function x(le){const be=[...f,{a:le.ideaId,b:le.placeId,triple:le.id},{a:le.placeId,b:le.personId,triple:le.id}];g(be),re(null),E(le.personId),window.setTimeout(()=>E(null),380);const Fe=a.triples.every(ue=>{const Pe=new Set(be.filter(_e=>_e.triple===ue.id).map(_e=>os(_e.a,_e.b)));return ge(ue.id).every(_e=>Pe.has(_e))});if(y||Fe){b("linked"),I("ok");return}b("linked")}function J(){j&&(ee("choose"),re(null),E(null),T==="idea"?b("place"):T==="place"?b("person"):x(j))}function ae(le){if(!(G==="ok"||T==="linked"||!j||!O)){if(!y&&_&&v(),le===O){if(re(le),E(le),I("idle"),se(0),y){J();return}window.setTimeout(()=>E(null),380),T==="idea"?b("place"):T==="place"?b("person"):x(j);return}re(le),E(le),I("wrong"),Q(!0),se(be=>be+1),y&&ee("miss"),o()}}function R(){F||(B(!0),r())}function k(){v(),b("idea")}const N=G==="ok"?y?"All 3 matches complete":m?"Tonight’s street is done":"All 3 links complete":T==="linked"?y?"This match is complete. Tap Next.":"This link is complete. Tap Next.":y?Z.connectLink:"Tap idea → place → person",K=T==="linked"?"idea":T,Y=y&&j?UT(j.id,K):T==="place"?"Wrong lot. Snap the idea to the place that keeps it.":T==="person"?"Wrong keeper. The person who lives on that lot is the match.":"Wrong idea. Pick the claim, then its place, then its person.",he=y||T==="linked"||G==="ok"?null:T==="idea"?"1 of 3 — pick the idea.":T==="place"?"2 of 3 — pick the place.":"3 of 3 — pick the person.",we=T==="place"?"place":T==="person"?"person":"idea",Te=L;if(W.useEffect(()=>{if(!y||te!=="miss"||!O)return;const le=document.querySelector(".link-block.is-need");le instanceof HTMLElement&&le.scrollIntoView({block:"center",behavior:"smooth"})},[y,te,O,T]),G==="ok"){const le=m?m.left>0?"Tonight’s street":"Street linked":"All 3 links complete";return s.jsxs("div",{className:"play is-link is-wizard is-finale",children:[s.jsx(ki,{play:!0,stamp:y?Z.matchWin:le}),s.jsx("p",{className:"link-complete",role:"status",children:y?Z.matchDone:m?m.left>0?`${m.place} is lit`:"The whole street is linked":"All 3 links complete"}),y||!m?null:s.jsxs("p",{className:"quiet",children:[m.linkedAfter," of ",m.total," facts",m.left>0?` · ${m.left} still wait`:""]}),s.jsxs("ol",{className:"link-checks","aria-label":y?"This match":"Tonight’s links",children:[s.jsxs("li",{className:"is-done",children:["✓ ",y?"Sentence":"Idea"]}),s.jsx("li",{className:"is-done",children:"✓ Place"}),s.jsx("li",{className:"is-done",children:"✓ Person"})]}),s.jsx("div",{className:"link-dock",children:y?s.jsxs(s.Fragment,{children:[s.jsx("button",{type:"button",className:"btn primary xl link-next",onClick:()=>d?d("hold"):R(),children:Z.holdNext}),s.jsx("button",{type:"button",className:"btn xl link-next",onClick:()=>d?d("home"):R(),children:Z.home})]}):s.jsx("button",{type:"button",className:"btn primary xl link-next",onClick:R,children:"Done"})})]})}return s.jsxs("div",{className:`play is-link is-wizard ${y?`is-easy-link is-screen-${te}`:""} ${_?"is-shake":""}`,children:[y||T==="linked"?null:s.jsx(Uo,{challenge:a}),y||T==="linked"?null:s.jsx(_o,{text:a.context,id:a.id,onPeek:h}),y?null:s.jsx("p",{className:"next-tap",children:N}),he?s.jsx("p",{className:"quiet wizard-step",children:he}):null,y?s.jsxs("div",{className:"easy-teach",children:[s.jsxs("p",{className:"easy-steps","aria-label":"Match steps",children:[s.jsx("span",{className:we==="idea"?"is-now":X.idea?"is-done":"",children:"1 · Sentence"}),s.jsx("span",{className:"easy-steps-arrow","aria-hidden":!0,children:"→"}),s.jsx("span",{className:we==="place"?"is-now":X.place?"is-done":"",children:"2 · Place"}),s.jsx("span",{className:"easy-steps-arrow","aria-hidden":!0,children:"→"}),s.jsx("span",{className:we==="person"?"is-now":X.person?"is-done":"",children:"3 · Person"})]}),te==="miss"?s.jsx("p",{className:"match-toast",role:"status",children:Y}):null]}):s.jsxs("ol",{className:"link-checks","aria-label":"Link steps",children:[s.jsxs("li",{className:X.idea?"is-done":T==="idea"?"is-now":"",children:[X.idea?"✓":"1"," Idea"]}),s.jsxs("li",{className:X.place?"is-done":T==="place"?"is-now":"",children:[X.place?"✓":"2"," Place"]}),s.jsxs("li",{className:X.person?"is-done":T==="person"?"is-now":"",children:[X.person?"✓":"3"," Person"]})]}),!y&&(G==="wrong"||ne>0)?s.jsx("p",{className:"match-toast",role:"status",children:Y}):null,!y&&ne>0&&T!=="linked"?s.jsx("button",{type:"button",className:"btn tiny match-recover",onClick:v,children:"Try again"}):null,y?null:s.jsx("p",{className:"match-score",children:m?`${a.triples.length*2-f.length} links left tonight · ${m.linkedAfter-a.triples.length+f.length/2} of ${m.total} facts`:`${a.triples.length*2-f.length} links left · ${f.length} / ${a.triples.length*2} snapped`}),T==="linked"?s.jsx("div",{className:"link-dock",children:s.jsx("button",{type:"button",className:"btn primary xl link-next",onClick:k,children:"Next"})}):s.jsx("div",{className:"link-grid is-wizard",children:s.jsxs("div",{className:`link-col is-${T}`,children:[y&&j&&te==="choose"?s.jsx("p",{className:"link-clue",children:JT(j.id,T)}):null,y?null:s.jsx("p",{className:"match-col-label",children:Z1(T,y)}),Te.map(le=>{const be=Og(le,a),Fe=le.id===O,ue=y&&te==="miss"&&!Fe,Pe=y&&te==="miss"&&Fe;return s.jsxs("button",{type:"button",className:`link-block is-${le.kind} ${be.who||be.plotId||be.art?"is-picture":""} ${ie===le.id?"is-selected":""} ${M===le.id?"is-flash":""} ${!y&&A?.has(le.id)?"is-focus":""} ${Pe?"is-need":""} ${ue?"is-not":""}`,onClick:()=>ae(le.id),children:[Pe?s.jsx("span",{className:"need-chip",children:"This one"}):null,s.jsx(Q1,{node:le,easy:y,challenge:a})]},le.id)})]})})]})}function t0({scene:a}){const o=W.useId().replace(/:/g,"");switch(a){case"expand":return s.jsxs(Ze,{uid:o,from:"#14062e",to:"#2a0d58",children:[s.jsx("circle",{cx:"32",cy:"32",r:"8",fill:"#fff6b8"}),s.jsx("circle",{cx:"32",cy:"32",r:"3.5",fill:"#ffcc33"}),s.jsx("path",{d:"M32 22V12M32 42v10M22 32H12M42 32h10M24 24l-7-7M40 24l7-7M24 40l-7 7M40 40l7 7",stroke:"#ffcc33",strokeWidth:"3",strokeLinecap:"round"}),s.jsx("polygon",{points:"32,6 28,13 36,13",fill:"#ffcc33"}),s.jsx("polygon",{points:"32,58 28,51 36,51",fill:"#ffcc33"}),s.jsx("polygon",{points:"6,32 13,28 13,36",fill:"#ffcc33"}),s.jsx("polygon",{points:"58,32 51,28 51,36",fill:"#ffcc33"}),s.jsx("circle",{cx:"16",cy:"14",r:"3.4",fill:"#c86bff"}),s.jsx("circle",{cx:"50",cy:"16",r:"3",fill:"#7dffb0"}),s.jsx("circle",{cx:"48",cy:"48",r:"3.4",fill:"#ff9f1a"}),s.jsx("circle",{cx:"16",cy:"48",r:"2.8",fill:"#fff"})]});case"bind":return s.jsxs(Ze,{uid:o,from:"#12382a",to:"#1a0840",children:[s.jsx("path",{d:"M24 32h16",stroke:"#7dffb0",strokeWidth:"10",strokeLinecap:"round"}),s.jsx("path",{d:"M28 26c4 4 4 8 0 12M36 26c-4 4-4 8 0 12",stroke:"#148a48",strokeWidth:"2.2",fill:"none"}),s.jsx("circle",{cx:"16",cy:"32",r:"12",fill:"#fff6e8",stroke:"#ffe08a",strokeWidth:"2.4"}),s.jsx("circle",{cx:"48",cy:"32",r:"15",fill:"#ffcc33",stroke:"#fff8dc",strokeWidth:"2.4"}),s.jsx("circle",{cx:"16",cy:"32",r:"4.5",fill:"#c4922a"}),s.jsx("circle",{cx:"48",cy:"32",r:"6",fill:"#8a5a22"})]});case"tidy":return s.jsxs(Ze,{uid:o,from:"#2a0d58",to:"#1a0840",children:[s.jsx("circle",{cx:"48",cy:"14",r:"8",fill:"#ffcc33"}),s.jsx("rect",{x:"4",y:"52",width:"56",height:"5",rx:"1",fill:"#ffe08a"}),s.jsx("rect",{x:"10",y:"36",width:"16",height:"16",rx:"2",fill:"#ffcc33"}),s.jsx("rect",{x:"24",y:"36",width:"16",height:"16",rx:"2",fill:"#fff6b8"}),s.jsx("rect",{x:"10",y:"20",width:"16",height:"16",rx:"2",fill:"#ffe08a"}),s.jsx("rect",{x:"24",y:"20",width:"16",height:"16",rx:"2",fill:"#ffcc33"})]});case"dial":return s.jsxs(Ze,{uid:o,from:"#1a0840",to:"#3a1480",children:[s.jsx("circle",{cx:"32",cy:"36",r:"18",fill:"#fff6e8",stroke:"#ffcc33",strokeWidth:"3"}),s.jsx("path",{d:"M32 20v3M32 49v3M16 36h3M45 36h3M21 25l2 2M41 25l-2 2M21 47l2-2M41 47l-2-2",stroke:"#c4922a",strokeWidth:"2",strokeLinecap:"round"}),s.jsx("path",{d:"M32 36 42 24",stroke:"#b01c40",strokeWidth:"3.2",strokeLinecap:"round"}),s.jsx("circle",{cx:"32",cy:"36",r:"3.4",fill:"#2a0d58"}),s.jsx("circle",{cx:"12",cy:"12",r:"8",fill:"#3d7ccc"}),s.jsx("path",{d:"M8 11c3-3 7-2 9 1 1 2-1 4-3 4-2 1-4 0-4-2Z",fill:"#3dcc7a"}),s.jsx("path",{d:"M54 4 46 16h6l-8 14 12-12h-6Z",fill:"#ffcc33"})]});case"witnesses":return s.jsxs(Ze,{uid:o,from:"#3a1480",to:"#1a0840",children:[s.jsx(xn,{x:14,y:40,fill:"#ffcc33"}),s.jsx(xn,{x:32,y:38,fill:"#fff6b8"}),s.jsx(xn,{x:50,y:40,fill:"#c86bff"}),s.jsx(ld,{x:10,y:12}),s.jsx(ld,{x:28,y:8}),s.jsx(ld,{x:46,y:12})]});case"reluctant":return s.jsxs(Ze,{uid:o,from:"#2a0d58",to:"#1a0840",children:[s.jsx("circle",{cx:"22",cy:"18",r:"8",fill:"#ffe7b8"}),s.jsx("path",{d:"M14 30c0-6 4-10 8-10s8 4 8 10v16H14Z",fill:"#ffe7b8"}),s.jsx("path",{d:"M16 16c3 4 8 5 12 2",stroke:"#8a5a22",strokeWidth:"2.2",fill:"none",strokeLinecap:"round"}),s.jsx("path",{d:"M26 20c2 4 2 8-1 10",stroke:"#ffe7b8",strokeWidth:"3.4",strokeLinecap:"round"}),s.jsx("circle",{cx:"18",cy:"12",r:"1.6",fill:"#fff"}),s.jsx("rect",{x:"40",y:"24",width:"18",height:"24",rx:"3",fill:"#fff6e8"}),s.jsx("path",{d:"M44 32h10M44 38h8",stroke:"#c4922a",strokeWidth:"2",strokeLinecap:"round"}),s.jsx("path",{d:"M46 46c2 2 6 2 8 0",stroke:"#ff5a7a",strokeWidth:"2",fill:"none",strokeLinecap:"round"})]});case"clock":return s.jsxs(Ze,{uid:o,from:"#2a0d58",to:"#ff5a7a",children:[s.jsx("circle",{cx:"32",cy:"46",r:"14",fill:"#ffcc33"}),s.jsx("circle",{cx:"32",cy:"46",r:"7",fill:"#fff6b8"}),s.jsx("path",{d:"M0 52h64v12H0Z",fill:"#148a48"}),s.jsx("circle",{cx:"32",cy:"26",r:"16",fill:"#fff6e8",stroke:"#2a0d58",strokeWidth:"3"}),s.jsx("path",{d:"M32 14v3M32 35v3M19 26h3M42 26h3",stroke:"#c4922a",strokeWidth:"2",strokeLinecap:"round"}),s.jsx("path",{d:"M32 26v-8",stroke:"#2a0d58",strokeWidth:"2.6",strokeLinecap:"round"}),s.jsx("path",{d:"M32 26l6 4",stroke:"#b01c40",strokeWidth:"2.4",strokeLinecap:"round"}),s.jsx("circle",{cx:"32",cy:"26",r:"2.2",fill:"#2a0d58"})]});case"judea":return s.jsxs(Ze,{uid:o,from:"#1a2848",to:"#2a0d58",children:[s.jsx("path",{d:"M4 32h34l-17-16Z",fill:"#c4922a"}),s.jsx("rect",{x:"8",y:"32",width:"26",height:"22",fill:"#ffe7b8"}),s.jsx("rect",{x:"12",y:"38",width:"5",height:"16",fill:"#fff6e8"}),s.jsx("rect",{x:"25",y:"38",width:"5",height:"16",fill:"#fff6e8"}),s.jsx("path",{d:"M17 20v-6M21 20v-8M25 20v-6",stroke:"#ffcc33",strokeWidth:"2"}),s.jsx("rect",{x:"44",y:"22",width:"10",height:"32",fill:"#d8c4a0"}),s.jsx("rect",{x:"41",y:"18",width:"16",height:"5",fill:"#c4922a"}),s.jsx("path",{d:"M49 8 53 16h-8Z",fill:"#ffcc33"}),s.jsx("path",{d:"M49 8v10",stroke:"#ffcc33",strokeWidth:"2"})]});case"redness":return s.jsxs(Ze,{uid:o,from:"#3a1480",to:"#1a0840",children:[s.jsx("ellipse",{cx:"16",cy:"28",rx:"10",ry:"7",fill:"#fff6e8"}),s.jsx("circle",{cx:"16",cy:"28",r:"4.2",fill:"#ff5a7a"}),s.jsx("circle",{cx:"16",cy:"28",r:"1.8",fill:"#1a0840"}),s.jsx("circle",{cx:"38",cy:"34",r:"16",fill:"#ff5a7a"}),s.jsx("path",{d:"M30 24c4-6 12-6 16 0",fill:"#ff8aa0"})]});case"aboutness":return s.jsxs(Ze,{uid:o,from:"#2a0d58",to:"#3a1480",children:[s.jsx("circle",{cx:"16",cy:"28",r:"10",fill:"#ffe7b8"}),s.jsx("path",{d:"M8 40c0-6 4-10 8-10s8 4 8 10v12H8Z",fill:"#ffe7b8"}),s.jsx("path",{d:"M26 18h14l-4-6 12 8-12 8 4-6H26Z",fill:"#ffcc33"}),s.jsx("rect",{x:"44",y:"28",width:"14",height:"18",rx:"3",fill:"#fff6b8"}),s.jsx("path",{d:"M47 28c4-6 10-4 11 2",stroke:"#7dffb0",strokeWidth:"2",fill:"none"})]});case"mindgap":return s.jsxs(Ze,{uid:o,from:"#1a0840",to:"#3a1480",children:[s.jsx("circle",{cx:"16",cy:"32",r:"12",fill:"#c86bff"}),s.jsx("circle",{cx:"16",cy:"32",r:"5",fill:"#fff6e8"}),s.jsx("circle",{cx:"12",cy:"24",r:"4",fill:"#9a4de0"}),s.jsx("circle",{cx:"22",cy:"38",r:"4",fill:"#9a4de0"}),s.jsx("path",{d:"M30 32h6",stroke:"#fff6e8",strokeWidth:"3",strokeLinecap:"round",strokeDasharray:"2 3"}),s.jsx("circle",{cx:"50",cy:"22",r:"8",fill:"#ffe7b8"}),s.jsx("path",{d:"M42 32c0-6 4-10 8-10s8 4 8 10v16H42Z",fill:"#ffe7b8"}),s.jsx("path",{d:"M46 20c2 2 6 2 8 0",stroke:"#8a5a22",strokeWidth:"1.8",fill:"none"})]});case"truenorth":return s.jsxs(Ze,{uid:o,from:"#1a0840",to:"#2a0d58",children:[s.jsx("circle",{cx:"32",cy:"36",r:"18",fill:"#fff6e8",stroke:"#ffcc33",strokeWidth:"3"}),s.jsx("path",{d:"M32 22l6 14-6-3-6 3Z",fill:"#b01c40"}),s.jsx("path",{d:"M32 50l6-14-6 3-6-3Z",fill:"#2a0d58"}),s.jsx("path",{d:"M32 8v8",stroke:"#ffcc33",strokeWidth:"3",strokeLinecap:"round"}),s.jsx("text",{x:"32",y:"12",textAnchor:"middle",fontSize:"9",fontWeight:"700",fill:"#ffcc33",children:"N"})]});case"crowd":return s.jsxs(Ze,{uid:o,from:"#3a1480",to:"#1a0840",children:[s.jsx(xn,{x:12,y:42,fill:"#ffcc33",scale:.72}),s.jsx(xn,{x:24,y:36,fill:"#fff6b8",scale:.8}),s.jsx(xn,{x:36,y:34,fill:"#c86bff",scale:.86}),s.jsx(xn,{x:48,y:38,fill:"#7dffb0",scale:.76}),s.jsx(xn,{x:18,y:50,fill:"#ff9f1a",scale:.64}),s.jsx(xn,{x:42,y:50,fill:"#ffe08a",scale:.64})]});case"cells":return s.jsxs(Ze,{uid:o,from:"#12382a",to:"#1a0840",children:[s.jsx("circle",{cx:"22",cy:"32",r:"14",fill:"#7dffb0",stroke:"#148a48",strokeWidth:"2.4"}),s.jsx("circle",{cx:"44",cy:"32",r:"14",fill:"#3dcc7a",stroke:"#0e6a38",strokeWidth:"2.4"}),s.jsx("circle",{cx:"22",cy:"32",r:"5",fill:"#fff6b8"}),s.jsx("circle",{cx:"44",cy:"32",r:"5",fill:"#fff6b8"}),s.jsx("path",{d:"M32 24v16",stroke:"#fff6e8",strokeWidth:"2",strokeDasharray:"2 2"})]});case"band":return s.jsxs(Ze,{uid:o,from:"#14062e",to:"#2a0d58",children:[s.jsx("circle",{cx:"32",cy:"32",r:"22",fill:"none",stroke:"#ffcc33",strokeWidth:"6"}),s.jsx("circle",{cx:"32",cy:"32",r:"9",fill:"#3dcc7a",stroke:"#fff6e8",strokeWidth:"2"}),s.jsx("circle",{cx:"52",cy:"14",r:"5",fill:"#ff9f1a"})]});case"pasture":return s.jsxs(Ze,{uid:o,from:"#12382a",to:"#1a0840",children:[s.jsx("path",{d:"M0 40c12-12 20-8 32-8s20-6 32 8v24H0Z",fill:"#3dcc7a"}),s.jsx("circle",{cx:"22",cy:"36",r:"7",fill:"#fff6e8"}),s.jsx("circle",{cx:"40",cy:"38",r:"6",fill:"#ffe7b8"}),s.jsx("rect",{x:"20",y:"41",width:"4",height:"7",fill:"#8a5a22"}),s.jsx("rect",{x:"38",y:"42",width:"4",height:"7",fill:"#8a5a22"})]});case"first":return s.jsxs(Ze,{uid:o,from:"#3a1480",to:"#1a0840",children:[s.jsx(xn,{x:24,y:36,fill:"#fff6b8"}),s.jsx(xn,{x:46,y:42,fill:"#c86bff",scale:.7}),s.jsx("circle",{cx:"14",cy:"14",r:"10",fill:"#ffcc33"}),s.jsx("text",{x:"14",y:"18",textAnchor:"middle",fontSize:"12",fontWeight:"800",fill:"#2a0d58",children:"1"})]});case"twelve":return s.jsx(Ze,{uid:o,from:"#2a0d58",to:"#1a0840",children:Array.from({length:12},(r,h)=>{const d=h/12*Math.PI*2-Math.PI/2;return s.jsx("circle",{cx:32+Math.cos(d)*18,cy:32+Math.sin(d)*18,r:"4.2",fill:h===0?"#fff6b8":"#ffcc33"},h)})});case"welcome":return s.jsxs(Ze,{uid:o,from:"#3a1480",to:"#1a0840",children:[s.jsx("path",{d:"M16 56V22c0-6 7-12 16-12s16 6 16 12v34",fill:"#ffcc33"}),s.jsx("path",{d:"M22 56V24c0-5 4-9 10-9s10 4 10 9v32",fill:"#fff6b8"}),s.jsx(xn,{x:32,y:44,fill:"#c86bff",scale:.7})]});case"mindsky":return s.jsxs(Ze,{uid:o,from:"#14062e",to:"#2a0d58",children:[s.jsx("circle",{cx:"32",cy:"44",r:"12",fill:"#ffe7b8"}),s.jsx("path",{d:"M20 54c0-8 6-12 12-12s12 4 12 12",fill:"#ffe7b8"}),s.jsx("circle",{cx:"16",cy:"14",r:"2.2",fill:"#ffcc33"}),s.jsx("circle",{cx:"32",cy:"10",r:"3",fill:"#fff6b8"}),s.jsx("circle",{cx:"50",cy:"16",r:"2.4",fill:"#c86bff"}),s.jsx("path",{d:"M26 34l6-12",stroke:"#ffcc33",strokeWidth:"2.2",strokeLinecap:"round"})]});case"lamp":return s.jsxs(Ze,{uid:o,from:"#3a1480",to:"#1a0840",children:[s.jsx("path",{d:"M20 30c0-10 6-16 12-16s12 6 12 16c6 2 8 8 8 12H12c0-4 2-10 8-12Z",fill:"#ffcc33"}),s.jsx("rect",{x:"27",y:"42",width:"10",height:"12",rx:"2",fill:"#c4922a"}),s.jsx("circle",{cx:"32",cy:"26",r:"5",fill:"#fff6b8"})]});case"seed":return s.jsxs(Ze,{uid:o,from:"#12382a",to:"#1a0840",children:[s.jsx("path",{d:"M32 8c14 12 16 26 0 44C16 34 18 20 32 8Z",fill:"#3dcc7a"}),s.jsx("path",{d:"M32 18c6 8 6 16 0 26",stroke:"#fff6b8",strokeWidth:"3",fill:"none"}),s.jsx("path",{d:"M0 52h64v12H0Z",fill:"#8a5a22"})]});case"heart":return s.jsxs(Ze,{uid:o,from:"#4a1a88",to:"#1a0840",children:[s.jsx("path",{d:"M32 54 10 32c-7-7-2-18 9-18 6 0 9 4 13 8 4-4 7-8 13-8 11 0 16 11 9 18Z",fill:"#ff5a7a"}),s.jsx("circle",{cx:"22",cy:"24",r:"3.4",fill:"#fff6e8",opacity:".85"})]});case"star":return s.jsx(Ze,{uid:o,from:"#14062e",to:"#2a0d58",children:s.jsx("path",{d:"M32 6 39 24h20l-16 12 6 18-17-12-17 12 6-18L5 24h20Z",fill:"#ffcc33"})});case"cup":return s.jsxs(Ze,{uid:o,from:"#3a1480",to:"#1a0840",children:[s.jsx("path",{d:"M16 14h32c3 12 3 22-6 28H22c-9-6-9-16-6-28Z",fill:"#ffcc33"}),s.jsx("path",{d:"M27 42h10v10H27Z",fill:"#c4922a"}),s.jsx("path",{d:"M22 54h20",stroke:"#ffe08a",strokeWidth:"3.4",strokeLinecap:"round"}),s.jsx("path",{d:"M40 12c5-5 12-2 12 5",fill:"none",stroke:"#7dffb0",strokeWidth:"2.6"})]});case"tree":return s.jsxs(Ze,{uid:o,from:"#12382a",to:"#1a0840",children:[s.jsx("circle",{cx:"32",cy:"24",r:"18",fill:"#3dcc7a"}),s.jsx("circle",{cx:"18",cy:"30",r:"11",fill:"#34c46a"}),s.jsx("circle",{cx:"46",cy:"30",r:"11",fill:"#7dffb0"}),s.jsx("rect",{x:"28",y:"36",width:"8",height:"20",rx:"2",fill:"#8a5a22"})]});case"door":return s.jsxs(Ze,{uid:o,from:"#3a1480",to:"#1a0840",children:[s.jsx("path",{d:"M14 58V20c0-7 7-14 18-14s18 7 18 14v38Z",fill:"#ffe7b8"}),s.jsx("path",{d:"M20 58V22c0-5 5-10 12-10s12 5 12 10v36Z",fill:"#ffcc33"}),s.jsx("circle",{cx:"40",cy:"38",r:"2.6",fill:"#8a5a22"})]});case"coin":return s.jsxs(Ze,{uid:o,from:"#3a1480",to:"#1a0840",children:[s.jsx("circle",{cx:"32",cy:"32",r:"20",fill:"#ffcc33",stroke:"#fff8dc",strokeWidth:"3"}),s.jsx("circle",{cx:"32",cy:"32",r:"13",fill:"none",stroke:"#c4922a",strokeWidth:"2.4"}),s.jsx("path",{d:"M32 20v24M25 26h14M25 38h14",stroke:"#8a5a22",strokeWidth:"2.4",strokeLinecap:"round"})]});case"mercy-road":return s.jsx("img",{className:"match-scene is-tile",src:uw["ph-road"],alt:"",draggable:!1})}}function xn({x:a,y:o,fill:r,scale:h=1}){return s.jsxs("g",{transform:`translate(${a} ${o}) scale(${h})`,children:[s.jsx("circle",{cx:"0",cy:"-12",r:"7",fill:r}),s.jsx("path",{d:"M-9 0c0-6 4-9 9-9s9 3 9 9v16H-9Z",fill:r})]})}function ld({x:a,y:o}){return s.jsxs("g",{transform:`translate(${a} ${o})`,children:[s.jsx("rect",{width:"16",height:"12",rx:"3",fill:"#fff6e8"}),s.jsx("path",{d:"M5 14 4 12h4Z",fill:"#fff6e8"}),s.jsx("path",{d:"M4 6h8",stroke:"#148a48",strokeWidth:"2",strokeLinecap:"round"})]})}function Ze({uid:a,from:o,to:r,children:h}){return s.jsxs("svg",{className:"match-scene",viewBox:"0 0 64 64","aria-hidden":!0,children:[s.jsx("defs",{children:s.jsxs("linearGradient",{id:`${a}-bg`,x1:"12",y1:"6",x2:"54",y2:"58",children:[s.jsx("stop",{offset:"0%",stopColor:o}),s.jsx("stop",{offset:"100%",stopColor:r})]})}),s.jsx("rect",{width:"64",height:"64",fill:`url(#${a}-bg)`}),h]})}function n0(a){return a.scene??a.gem}function Xy(a,o,r){const h=a.filter(m=>m!==o&&!r.includes(m)),d=h.length>0?h:a.filter(m=>m!==o);return Zt(d)[0]??a.find(m=>m!==o)??o}function a0({challenge:a,onMiss:o,onSolved:r,onPeek:h}){const{progress:d}=Je(),m=ye(d)||a.id.startsWith("ob-"),w=a.pairs,y=W.useMemo(()=>Zt(a.pairs.map(x=>({id:x.id,text:x.right}))),[a.pairs]),[f,g]=W.useState([]),[T,b]=W.useState(null),[M,E]=W.useState(null),[G,I]=W.useState("idle"),[_,Q]=W.useState(!1),[ne,se]=W.useState(0),[ie,re]=W.useState(!1),F=ye(d),B=w.find(x=>!f.includes(x.id))?.id,[te,ee]=W.useState(()=>B?Xy(w.map(x=>x.id),B,[]):"");W.useEffect(()=>{!m||!B||(ee(x=>x&&x!==B&&!f.includes(x)?x:Xy(w.map(J=>J.id),B,f)),b({side:"left",id:B}))},[m,B,f,w]);function ge(){E(null),Q(!1),I("idle"),m&&B&&b({side:"left",id:B})}function j(x,J){if(G==="ok"||(_||f.includes(J))&&!m||f.includes(J)&&!(x==="right"&&T?.side==="left"))return;if(!T||T.side===x){b(R=>R?.side===x&&R.id===J?null:{side:x,id:J}),I("idle");return}if(T.id===J){const R=[...f,J];g(R),b(null),E(J),window.setTimeout(()=>E(null),380),R.length===a.pairs.length&&(I("ok"),F?re(!0):r());return}E(T.id),I("wrong"),Q(!0),se(R=>R+1),o();const ae=T;window.setTimeout(()=>{E(null),Q(!1),I("idle"),b(m&&B?{side:"left",id:B}:ae)},880)}const O=x=>n0(x),A=m?w.filter(x=>x.id===B):w,X=m?y.filter(x=>x.id===B||x.id===te):y,L=w.find(x=>x.id===(T?.id??B)),v=T?.side==="left"?L?.right:L?.left;return s.jsxs("div",{className:`play is-match ${m?"is-deal":""} ${_?"is-shake":""} ${G==="ok"?"is-win":""}`,style:{"--match-rows":m?2:w.length},children:[s.jsx(ki,{play:G==="ok",stamp:F?Z.matchWin:"Locked!"}),s.jsx(Uo,{challenge:a}),s.jsx(_o,{text:a.context,id:a.id,onPeek:h}),s.jsx("p",{className:"sort-how",children:F?Z.matchHow:s.jsxs(s.Fragment,{children:[s.jsx("strong",{children:"Tap a picture"}),", then the claim that belongs",m?" · two choices":""]})}),G==="wrong"||ne>0?s.jsx("p",{className:"match-toast",role:"status",children:F?s.jsx("strong",{children:md(v??"this card")}):s.jsxs(s.Fragment,{children:[s.jsx("strong",{children:G==="wrong"?ne>=2?"One more look.":"Those don’t snap.":"Try the other claim."})," ",ne>=2?a.teachOnWrong:"Pick a new pair."]})}):null,ne>0&&G!=="ok"?s.jsx("button",{type:"button",className:"btn tiny match-recover",onClick:ge,children:"Try again"}):null,s.jsxs("div",{className:"match-grid",children:[s.jsxs("div",{className:"match-col is-pictures",children:[s.jsx("p",{className:"match-col-label",children:"Picture"}),A.map((x,J)=>{const ae=O(x);return s.jsx("button",{type:"button",className:`match-card is-picture ${ae?"is-gem":""} ${T?.side==="left"&&T.id===x.id?"is-selected":""} ${f.includes(x.id)?"is-locked":""} ${M===x.id&&!f.includes(x.id)?"is-flash":""} ${T&&T.side==="right"&&!f.includes(x.id)?"awaiting":""}`,style:G==="ok"?fi(J,"keep"):void 0,"aria-label":x.left,onClick:R=>{R.stopPropagation(),j("left",x.id)},children:ae?s.jsxs(s.Fragment,{children:[s.jsx(t0,{scene:ae}),s.jsx("span",{className:"match-caption",children:x.left})]}):x.left},x.id)})]}),s.jsxs("div",{className:"match-col is-claims",children:[s.jsx("p",{className:"match-col-label",children:F?"Main idea":"Claim"}),X.map((x,J)=>s.jsx("button",{type:"button",className:`match-card right ${T?.side==="right"&&T.id===x.id?"is-selected":""} ${f.includes(x.id)?"is-locked":""} ${M===x.id?"is-flash":""} ${T&&T.side==="left"&&!f.includes(x.id)?"awaiting":""}`,style:G==="ok"?fi(J,"discard"):void 0,onClick:ae=>{ae.stopPropagation(),j("right",x.id)},children:x.text},x.id))]})]}),s.jsx("p",{className:"match-score",children:F?`${a.pairs.length-f.length} left · ${f.length} / ${a.pairs.length} kept`:`${a.pairs.length-f.length} left · ${f.length} / ${a.pairs.length} snapped`}),F&&ie?s.jsx("div",{className:"cta-dock",children:s.jsx("button",{type:"button",className:"btn gold xl snap-bins",onClick:r,children:Z.holdNext})}):null]})}const mw=""+new URL("ability-logic-B_fRFn20.png",import.meta.url).href,s0=""+new URL("ability-love-CUD-1UOk.png",import.meta.url).href,pw=""+new URL("ability-reason-B20YjMye.png",import.meta.url).href,fw=""+new URL("ability-science-B5UG-eZO.png",import.meta.url).href,i0="data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2064%2064'%20role='img'%20aria-hidden='true'%3e%3crect%20width='64'%20height='64'%20rx='14'%20fill='%232a0d58'/%3e%3cdefs%3e%3clinearGradient%20id='c'%20x1='12'%20y1='8'%20x2='52'%20y2='56'%3e%3cstop%20offset='0%25'%20stop-color='%23fff8dc'/%3e%3cstop%20offset='40%25'%20stop-color='%23ffcc33'/%3e%3cstop%20offset='100%25'%20stop-color='%23e09412'/%3e%3c/linearGradient%3e%3c/defs%3e%3cpath%20d='M32%206%2054%2032%2032%2058%2010%2032Z'%20fill='url(%23c)'%20stroke='%23ffe08a'%20stroke-width='2.4'%20stroke-linejoin='round'/%3e%3ccircle%20cx='32'%20cy='32'%20r='11'%20fill='%23fff6b8'%20stroke='%23c4922a'%20stroke-width='2'/%3e%3cpath%20d='M32%2024v16M27%2028h10M27%2036h10'%20stroke='%23c4922a'%20stroke-width='2'%20stroke-linecap='round'/%3e%3ccircle%20cx='20'%20cy='16'%20r='3'%20fill='%23fff'%20opacity='.75'/%3e%3c/svg%3e",o0="data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2064%2064'%20role='img'%20aria-hidden='true'%3e%3crect%20width='64'%20height='64'%20rx='14'%20fill='%232a0d58'/%3e%3cdefs%3e%3clinearGradient%20id='d'%20x1='12'%20y1='8'%20x2='52'%20y2='56'%3e%3cstop%20offset='0%25'%20stop-color='%23ffe8c4'/%3e%3cstop%20offset='50%25'%20stop-color='%23c4922a'/%3e%3cstop%20offset='100%25'%20stop-color='%238a6a22'/%3e%3c/linearGradient%3e%3c/defs%3e%3cpath%20d='M32%206%2054%2032%2032%2058%2010%2032Z'%20fill='url(%23d)'%20stroke='%23ffcc33'%20stroke-width='2.4'%20stroke-linejoin='round'/%3e%3cpath%20d='M24%2024c0-5%203.6-8%208-8s8%203%208%208v16H24V24Z'%20fill='%23fff6e8'/%3e%3ccircle%20cx='38'%20cy='34'%20r='1.6'%20fill='%23ff9f1a'/%3e%3ccircle%20cx='20'%20cy='16'%20r='3'%20fill='%23fff'%20opacity='.7'/%3e%3c/svg%3e",r0=""+new URL("heart-DC4tSsc2.png",import.meta.url).href,l0=""+new URL("seed-CGO5Ceib.png",import.meta.url).href,c0="data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2064%2064'%20role='img'%20aria-hidden='true'%3e%3crect%20width='64'%20height='64'%20rx='14'%20fill='%232a0d58'/%3e%3cdefs%3e%3clinearGradient%20id='t'%20x1='12'%20y1='8'%20x2='52'%20y2='56'%3e%3cstop%20offset='0%25'%20stop-color='%23e0ffe8'/%3e%3cstop%20offset='45%25'%20stop-color='%233dcc7a'/%3e%3cstop%20offset='100%25'%20stop-color='%230e6a38'/%3e%3c/linearGradient%3e%3c/defs%3e%3cpath%20d='M32%206%2054%2032%2032%2058%2010%2032Z'%20fill='url(%23t)'%20stroke='%23ffcc33'%20stroke-width='2.4'%20stroke-linejoin='round'/%3e%3cpath%20d='M32%2018%2040%2030h-5l7%2010H22l7-10h-5Z'%20fill='%23fff6e8'%20opacity='.95'/%3e%3crect%20x='30'%20y='40'%20width='4'%20height='8'%20rx='1'%20fill='%238a5a22'/%3e%3ccircle%20cx='22'%20cy='18'%20r='3'%20fill='%23fff'%20opacity='.7'/%3e%3c/svg%3e",h0={lamp:fw,seed:l0,heart:r0,star:mw,cup:pw,tree:c0,door:o0,coin:i0},d0={love:s0,logic:mw,reason:pw,science:fw};function Rt({gem:a,size:o="md"}){return s.jsx("img",{className:`gem gem-art gem-${a} gem-${o}`,src:h0[a],alt:"",draggable:!1,"aria-hidden":!0})}function ui({ability:a,size:o="sm"}){const r=d0[a];return r?s.jsx("img",{className:`gem gem-art gem-ability gem-${a} gem-${o}`,src:r,alt:"",draggable:!1,"aria-hidden":!0}):s.jsx(Rt,{gem:Ga(a)?.gem??"heart",size:o})}function yw({tone:a,title:o,body:r,kicker:h,children:d}){return a==="idle"||a==="ok"?null:s.jsxs("div",{className:`result result-${a}`,role:"status",children:[s.jsx("p",{className:"result-kicker",children:h??"Not yet"}),s.jsx("h3",{children:o}),r?s.jsx("p",{children:r}):null,d]})}function jd(a,o,r){const h=a[o];if(!h)return null;const d=a.filter(m=>m.id!==h.id&&!r.has(m.id));return Zt(d)[0]?.id??null}function Qy(a,o,r,h){const d=a[o];return h&&d&&h!==d.id&&!r.has(h)?h:jd(a,o,r)}function u0({challenge:a,onMiss:o,onSolved:r,onPeek:h}){const{progress:d}=Je(),m=ye(d),w=W.useMemo(()=>Zt(a.items),[a.items]),y=m||a.items.length>=4,[f,g]=W.useState(w),[T,b]=W.useState(w),[M,E]=W.useState(()=>a.items.map(()=>null)),[G,I]=W.useState(()=>y?jd(a.items,0,new Set):null),[_,Q]=W.useState("idle"),[ne,se]=W.useState(!1),[ie,re]=W.useState(0),[F,B]=W.useState("");function te(L){return f.find(v=>v.id===L)}function ee(L=M){return new Set(L.filter(v=>v!==null).map(v=>v.id))}function ge(){const L=Zt(a.items);g(L),b(L),E(a.items.map(()=>null)),I(y?jd(a.items,0,new Set):null)}function j(L){if(_==="ok"||ne)return;const v=te(L);if(!v)return;const x=M.findIndex(N=>N===null);if(x<0)return;const J=a.items[x];if(!J)return;if(v.id!==J.id){const N=ie+1;Q("wrong"),se(!0),re(N),B(x<=0?m?"The first stone is already off. The main idea starts somewhere else.":"The first stone is already off. The claim starts somewhere else.":`The first ${x} sat right. The chain broke at step ${x+1} — try that stone again.`),o(),window.setTimeout(()=>{se(!1),N>=2&&ge(),Q("idle")},880);return}const ae=T.map(N=>N?.id===L?null:N),R=M.map((N,K)=>K===x?v:N);b(ae),E(R);const k=R.findIndex(N=>N===null);I(y&&k>=0?Qy(a.items,k,ee(R),G):null),Q("idle"),R.every(Boolean)&&(Q("ok"),r())}function O(L){if(_==="ok"||ne)return;const v=te(L);if(!v)return;const x=f.findIndex(R=>R.id===L),J=M.map(R=>R?.id===L?null:R);E(J),b(R=>{if(R.some(N=>N?.id===L))return R;const k=[...R];return x>=0&&(k[x]=v),k});const ae=J.findIndex(R=>R===null);I(y&&ae>=0?Qy(a.items,ae,ee(J),G):null),Q("idle")}const A=M.findIndex(L=>L===null),X=new Set(y?[a.items[A]?.id,G].filter(L=>!!L):f.map(L=>L.id));return s.jsxs("div",{className:`play is-sequence ${y?"is-deal":""} ${ne?"is-shake":""} ${_==="ok"?"is-win":""}`,children:[s.jsx(ki,{play:_==="ok"}),s.jsx(Uo,{challenge:a}),s.jsx(_o,{text:a.context,id:a.id,onPeek:h}),s.jsxs("p",{className:"sort-how is-order-how",children:[a.items.map((L,v)=>s.jsx("span",{className:`order-step ${v===A?"is-now":""} ${M[v]?"is-done":""}`,children:v===A?v+1:""},L.id)),"tap the next stone"]}),s.jsx("div",{className:"bank is-order",children:f.map((L,v)=>{const x=T[v]?.id===L.id,J=M.findIndex(R=>R?.id===L.id),ae=y&&x&&!X.has(L.id);return y&&!x||ae?null:s.jsx("div",{className:`sort-tile sort-seat ${x?"is-live":"is-gone"} ${ae?"is-facedown":""} ${J>=0?"was-placed":""}`,children:ae?s.jsx("span",{className:"stone-back","aria-hidden":!0}):s.jsxs("button",{type:"button",className:"chip",tabIndex:0,"aria-label":x?L.text:`Return ${L.text} to its seat`,onClick:()=>x?j(L.id):O(L.id),children:[L.gem?s.jsx(Rt,{gem:L.gem,size:"sm"}):null,L.text]})},L.id)})}),y?null:s.jsx("ol",{className:"chain",children:a.items.map((L,v)=>{const x=M[v],J=v===A&&_!=="ok";return s.jsxs("li",{className:`sort-seat ${x?"filled":"empty"} ${J?"awaiting":""}`,children:[s.jsx("span",{className:"chain-index",children:v+1}),x?s.jsxs("button",{type:"button",className:"chip in-chain",style:_==="ok"?fi(v,"mid"):void 0,onClick:()=>O(x.id),children:[x.gem?s.jsx(Rt,{gem:x.gem,size:"sm"}):null,x.text]}):s.jsx("span",{className:"placeholder","aria-hidden":!0,children:J?"↓":""})]},L.id)})}),s.jsx(yw,{tone:_==="idle"?"idle":_==="ok"?"ok":"teach",kicker:_==="ok"?"Well reasoned":ie>=2?"One more look":"The chain bounced",title:_==="ok"?"The path locks in.":ie>=2?"Not that order — tiles bounce back.":F||"Shake and try the chain again.",body:_==="wrong"?ie>=2?ye(d)?"Tap the stone that comes next.":a.teachOnWrong:"No lecture — just find the stone that jumped the line.":void 0,deeper:a.deeper})]})}function m0({challenge:a,onMiss:o,onSolved:r,onPeek:h}){const{progress:d}=Je(),m=ye(d),w=W.useMemo(()=>Zt(a.tiles),[a.tiles]),y=w,[f,g]=W.useState(w),[T,b]=W.useState([]),[M,E]=W.useState([]),[G,I]=W.useState(null),[_,Q]=W.useState("idle"),[ne,se]=W.useState(!1),[ie,re]=W.useState(0);function F(v=f){return v.filter(x=>x!==null)}function B(v=f,x=T,J=M){return[...F(v),...x,...J]}function te(v,x=f,J=T,ae=M){return B(x,J,ae).find(R=>R.id===v)}function ee(v,x){if(_==="ok")return;const J=te(v);if(!J)return;if(J.bin!==x){Q("wrong"),se(!0),re(N=>N+1),I(null),o(),window.setTimeout(()=>{se(!1),Q("idle")},880);return}const ae=f.map(N=>N?.id===v?null:N),R=T.filter(N=>N.id!==v),k=M.filter(N=>N.id!==v);x==="keep"?R.push(J):k.push(J),g(ae),b(R),E(k),I(null),Q("idle")}function ge(v){G&&ee(G,v)}function j(v){if(_==="ok"||ne)return;const x=te(v);if(!x)return;const J=y.findIndex(ae=>ae.id===v);b(ae=>ae.filter(R=>R.id!==v)),E(ae=>ae.filter(R=>R.id!==v)),g(ae=>{if(ae.some(k=>k?.id===v))return ae;const R=[...ae];return J>=0&&(R[J]=x),R}),Q("idle")}function O(v=T,x=M){if(v.every(ae=>ae.bin==="keep")&&x.every(ae=>ae.bin==="discard")&&v.length+x.length===a.tiles.length&&v.length===a.tiles.filter(ae=>ae.bin==="keep").length){Q("ok"),r();return}Q("wrong"),se(!0),re(ae=>ae+1),o(),window.setTimeout(()=>{se(!1),Q("idle")},880)}const A=G?te(G):void 0,X=_!=="ok"&&F().length===0,L=F()[0];return s.jsxs("div",{className:`play ${m?"is-easy-sort":""} ${ne?"is-shake":""} ${_==="ok"?"is-win":""} ${X?"is-ready":""}`,children:[s.jsx(ki,{play:_==="ok"}),s.jsx(Uo,{challenge:a}),s.jsx(_o,{text:a.context,id:a.id,onPeek:h}),s.jsx("p",{className:"sort-how",children:m?s.jsxs(s.Fragment,{children:[s.jsx("strong",{children:"Keep"})," this, or ",s.jsx("strong",{children:"Toss"})," it — one line at a time"]}):s.jsxs(s.Fragment,{children:[s.jsx("strong",{children:"Keep"})," belongs · ",s.jsx("strong",{children:"Toss"})," a distractor"]})}),m?L?s.jsxs("div",{className:"sort-one",children:[s.jsxs("p",{className:"sort-one-line",children:[L.gem?s.jsx(Rt,{gem:L.gem,size:"sm"}):null,m?qn(L.text):L.text]}),s.jsxs("div",{className:"sort-actions",children:[s.jsx("button",{type:"button",className:"btn xl keep",onClick:()=>ee(L.id,"keep"),children:"Keep"}),s.jsx("button",{type:"button",className:"btn xl toss",onClick:()=>ee(L.id,"discard"),children:"Toss"})]})]}):X?s.jsx("div",{className:"sort-lock",children:s.jsx("button",{type:"button",className:"btn primary xl snap-bins",onClick:()=>O(),children:m?Z.lockIn:ot.lockSort})}):null:s.jsx("div",{className:"bank is-sort",children:y.map((v,x)=>{const J=f[x]?.id===v.id,ae=T.some(R=>R.id===v.id)?"keep":M.some(R=>R.id===v.id)?"toss":null;return s.jsxs("div",{className:`sort-tile sort-seat ${J&&G===v.id?"is-selected":""} ${J?"":"is-gone"} ${ae==="keep"?"was-keep":""} ${ae==="toss"?"was-toss":""}`,style:{gridColumn:x%2+1,gridRow:Math.floor(x/2)+1},children:[s.jsxs("button",{type:"button",className:"chip",tabIndex:0,"aria-label":J?m?qn(v.text):v.text:`Return ${m?qn(v.text):v.text} to its seat`,onClick:()=>{J?I(v.id===G?null:v.id):j(v.id)},children:[v.gem?s.jsx(Rt,{gem:v.gem,size:"sm"}):null,m?qn(v.text):v.text,ae==="keep"?s.jsx("span",{className:"sort-mark","aria-hidden":!0,children:"✓"}):null,ae==="toss"?s.jsx("span",{className:"sort-mark","aria-hidden":!0,children:"×"}):null]}),s.jsxs("span",{className:"sort-tile-actions",children:[s.jsxs("button",{type:"button",className:"btn tiny keep",tabIndex:J?0:-1,disabled:!J,onClick:R=>{R.stopPropagation(),J&&ee(v.id,"keep")},children:["Keep",s.jsx("span",{className:"sort-mark","aria-hidden":!0,children:"✓"})]}),s.jsxs("button",{type:"button",className:"btn tiny toss",tabIndex:J?0:-1,disabled:!J,onClick:R=>{R.stopPropagation(),J&&ee(v.id,"discard")},children:["Toss",s.jsx("span",{className:"sort-mark","aria-hidden":!0,children:"×"})]})]})]},v.id)})}),m&&T.length===0&&M.length===0?null:s.jsxs("div",{className:`sort-bins ${m?"bins-easy":""} ${X?"is-ready":""}`,children:[s.jsxs("div",{className:`bin keep ${G?"awaiting":""}`,onClick:()=>ge("keep"),onKeyDown:v=>{(v.key==="Enter"||v.key===" ")&&(v.preventDefault(),ge("keep"))},role:"button",tabIndex:0,children:[s.jsx("span",{className:"bin-head",children:"Keep · belongs"}),s.jsx("span",{className:"bin-body",children:T.length===0?s.jsx("span",{className:"placeholder",children:A?`Keep: ${m?qn(A.text):A.text}`:"Belongs here"}):T.map((v,x)=>s.jsxs("button",{type:"button",className:"chip in-bin",style:_==="ok"?fi(x,"keep"):void 0,onClick:J=>{J.stopPropagation(),j(v.id)},children:[v.gem?s.jsx(Rt,{gem:v.gem,size:"sm"}):null,m?qn(v.text):v.text]},v.id))})]}),s.jsxs("div",{className:`bin toss ${G?"awaiting":""}`,onClick:()=>ge("discard"),onKeyDown:v=>{(v.key==="Enter"||v.key===" ")&&(v.preventDefault(),ge("discard"))},role:"button",tabIndex:0,children:[s.jsx("span",{className:"bin-head toss",children:"Toss · aside"}),s.jsx("span",{className:"bin-body",children:M.length===0?s.jsx("span",{className:"placeholder",children:A?`Toss: ${m?qn(A.text):A.text}`:"Set aside"}):M.map((v,x)=>s.jsxs("button",{type:"button",className:"chip in-bin",style:_==="ok"?fi(x,"discard"):void 0,onClick:J=>{J.stopPropagation(),j(v.id)},children:[v.gem?s.jsx(Rt,{gem:v.gem,size:"sm"}):null,m?qn(v.text):v.text]},v.id))})]})]}),ie>0&&_!=="ok"?s.jsx("button",{type:"button",className:"btn tiny match-recover",onClick:()=>{se(!1),Q("idle")},children:"Try again"}):null,!m&&X?s.jsx("div",{className:"sort-lock",children:s.jsx("button",{type:"button",className:"btn primary xl snap-bins",onClick:()=>O(),children:ot.lockSort})}):null,s.jsx(yw,{tone:_==="idle"?"idle":_==="ok"?"ok":"teach",kicker:_==="ok"?"Snapped":ie>=2?"One more look":"A line is in the wrong bin",title:_==="ok"?"Keep and toss lock in.":ie>=2?"Those bins still mix.":"Keep vs toss — shake and sort again.",body:_==="wrong"?ie>=2?m?"Keep what belongs with the main idea. Toss the rest.":a.teachOnWrong:"Keep the lines that belong. Toss (set aside) the rest.":void 0,deeper:a.deeper})]})}function nu({challenge:a,onMiss:o,onSolved:r,onPeek:h,onEasyStop:d,streetBeat:m}){return a.kind==="sort"?s.jsx(m0,{challenge:a,onMiss:o,onSolved:r,onPeek:h}):a.kind==="sequence"?s.jsx(u0,{challenge:a,onMiss:o,onSolved:r,onPeek:h}):a.kind==="build-argument"?s.jsx(V1,{challenge:a,onMiss:o,onSolved:r,onPeek:h}):a.kind==="link"?s.jsx(e0,{challenge:a,onMiss:o,onSolved:r,onPeek:h,onEasyStop:d,streetBeat:m}):s.jsx(a0,{challenge:a,onMiss:o,onSolved:r,onPeek:h})}function de(a){return{label:a,href:`https://www.biblegateway.com/passage/?search=${encodeURIComponent(a)}&version=RSV`,era:"scripture",source:"Holy Scripture · RSV"}}function Be(a,o,r){return{label:a,href:o,era:"ancient",source:r}}function At(a,o,r){return{label:a,href:o,era:"classic",source:r}}function gi(a,o,r){return{label:a,href:o,era:"modern",source:r}}const si=[de("1 Corinthians 15:3–8"),Be("Ignatius, To the Smyrnaeans 1–3","https://www.newadvent.org/fathers/0109.htm","Ignatius of Antioch · New Advent"),Be("Justin, First Apology","https://www.newadvent.org/fathers/0126.htm","Justin Martyr · New Advent"),Be("Justin, Dialogue with Trypho","https://www.newadvent.org/fathers/0128.htm","Justin Martyr · New Advent"),Be("Irenaeus, Against Heresies III","https://www.newadvent.org/fathers/0103301.htm","Irenaeus of Lyons · New Advent"),gi("Habermas on the early resurrection testimony","https://www.garyhabermas.com/articles/dialog_rexperience/dialog_rexperiences.htm","Gary Habermas · secondary dating aid"),gi("Licona, historicity of the resurrection","https://www.risenjesus.com/","Michael Licona · secondary dating aid")],p0=[de("Isaiah 52:13–53:12"),de("Acts 8:32–35"),de("1 Peter 2:22–25"),Be("Justin, Dialogue with Trypho","https://www.newadvent.org/fathers/0128.htm","Justin Martyr · New Advent"),Be("Irenaeus, Against Heresies III","https://www.newadvent.org/fathers/0103301.htm","Irenaeus of Lyons · New Advent"),Be("Augustine, City of God XVIII.29","https://www.newadvent.org/fathers/120118.htm","Augustine · Isaiah on Christ and the Church")],cd=[de("Luke 10:25–37"),Be("Irenaeus on the Samaritan (AH III.17)","https://www.newadvent.org/fathers/0103317.htm","Irenaeus of Lyons · New Advent"),At("Catena Aurea on Luke 10 — Origen, Ambrose, Augustine","https://isidore.co/aquinas/CALuke.htm#10","Aquinas compiling the Fathers · read the 10:36 flip carefully")],f0=[de("Psalm 19:1–6"),de("Romans 1:19–20"),de("Wisdom 13:1–9"),Be("Athanasius, Contra Gentes 35–44","https://www.newadvent.org/fathers/2801.htm","Athanasius · Against the Heathen"),Be("Augustine, Confessions X.6","https://www.newadvent.org/fathers/110110.htm","Augustine · the world as speech"),Be("John of Damascus, Orthodox Faith I.3","https://www.newadvent.org/fathers/33041.htm","John of Damascus · that there is a God")],hl=[At("Aquinas, Fifth Way — ST I, q.2, a.3","https://www.newadvent.org/summa/1002.htm#article3","Thomas Aquinas · Summa Theologiae"),de("Psalm 19:1–6"),de("Romans 1:19–20"),gi("Robin Collins, The Fine-Tuning Design Argument","https://rintintin.colorado.edu/~vancecd/phil201/Collins.pdf","Robin Collins")],Zy=[Be("Aristotle, Physics VIII","http://classics.mit.edu/Aristotle/physics.8.viii.html","Aristotle · change and the first mover"),Be("Aristotle, Metaphysics XII","http://classics.mit.edu/Aristotle/metaphysics.12.xii.html","Aristotle · thought thinking itself"),At("Aquinas, First Way — ST I, q.2, a.3","https://www.newadvent.org/summa/1002.htm#article3","Thomas Aquinas · Summa Theologiae"),At("Aquinas, Summa Contra Gentiles I","https://isidore.co/aquinas/ContraGentiles1.htm","Thomas Aquinas · SCG I"),gi("Feser, so you think you understand the cosmological argument","https://edwardfeser.blogspot.com/2011/07/so-you-think-you-understand.html","Edward Feser · secondary guide only")],eg=[de("Genesis 1:1"),Be("Philoponus against an eternal world","https://archive.org/details/philoponusagains0000phil","John Philoponus · Against Aristotle on the Eternity of the World"),At("al-Ghazālī, The Incoherence of the Philosophers","https://sourcebooks.fordham.edu/source/alghazali.asp","al-Ghazālī · kalām against an eternal cosmos"),gi("Craig’s modern statement of the kalām syllogism","https://www.reasonablefaith.org/writings/popular-writings/existence-nature-of-god/the-kalam-cosmological-argument","William Lane Craig · under Ghazālī and Philoponus")],tg=[de("Luke 24:1–11"),de("John 20:1–18"),At("Catena Aurea on Luke 24","https://isidore.co/aquinas/CALuke.htm#24","Aquinas compiling the Fathers")],ng=[{...Be("Tacitus, Annals 15.44","https://www.perseus.tufts.edu/hopper/text?doc=Perseus%3Atext%3A1999.02.0078%3Abook%3D15%3Achapter%3D44","Tacitus · Christus under Pilate"),journalOnly:!0},{...Be("Josephus, Antiquities 18.63–64","https://penelope.uchicago.edu/josephus/ant-18.html","Josephus · Testimonium; later Christian touches disputed"),journalOnly:!0}],y0={"wb-creed":si,"wb-early":si,"daily-creed":si,"daily-names":si,"j-wb-1":si,"j-wb-2":si,"daily-isaiah":p0,"ph-road":cd,"daily-neighbor":cd,"td-watch":cd,"daily-stars":f0,"ob-tuning":hl,"ob-design":hl,"j-ob-1":hl,"j-ob-2":hl,"fg-mover":Zy,"j-fg-1":Zy,"fg-kalam":eg,"j-fg-3":eg,"wb-women":[...tg,...ng],"j-wb-4":[...tg,...ng],"wb-method":[de("Luke 1:1–4"),de("1 Corinthians 15:3–8"),Be("Irenaeus, Against Heresies III.1–4","https://www.newadvent.org/fathers/0103301.htm","Irenaeus · apostolic handing-on")],"j-wb-3":[de("Luke 1:1–4"),de("1 Corinthians 15:3–8")],"ph-father":[de("Luke 15:11–32"),At("Catena Aurea on Luke 15","https://isidore.co/aquinas/CALuke.htm#15","Aquinas compiling the Fathers")],"ph-seeds":[de("Matthew 13:1–23"),de("Luke 15:1–7"),de("Matthew 25:14–30")],"ph-debt":[de("Matthew 18:21–35"),de("Matthew 6:12–15")],"ob-leibniz":[de("Genesis 1:1–3"),de("Exodus 3:14"),At("Aquinas, ST I, q.2, a.3","https://www.newadvent.org/summa/1002.htm#article3","Thomas Aquinas · why anything exists"),Be("Athanasius, Contra Gentes 2–7","https://www.newadvent.org/fathers/2801.htm","Athanasius · the world is not its own explanation")],"ob-life":[de("Genesis 1:1–27"),de("John 1:1–4"),At("Aquinas, ST I, q.2, a.3 — Fifth Way","https://www.newadvent.org/summa/1002.htm#article3","Thomas Aquinas · ordered things point to mind")],"j-ob-3":[de("Genesis 1:1–3"),At("Aquinas, ST I, q.2, a.3","https://www.newadvent.org/summa/1002.htm#article3","Thomas Aquinas")],"j-ob-4":[de("Genesis 1:1–27"),de("John 1:1–4")],"fg-contingent":[At("Aquinas, Third Way — ST I, q.2, a.3","https://www.newadvent.org/summa/1002.htm#article3","Thomas Aquinas · necessary being"),Be("Aristotle, Metaphysics XII","http://classics.mit.edu/Aristotle/metaphysics.12.xii.html","Aristotle")],"j-fg-2":[At("Aquinas, Third Way — ST I, q.2, a.3","https://www.newadvent.org/summa/1002.htm#article3","Thomas Aquinas")],"fg-limits":[At("Aquinas, ST I, q.3 — after the Five Ways","https://www.newadvent.org/summa/1003.htm","Thomas Aquinas · attributes take further work"),de("John 1:1–18")],"j-fg-4":[At("Aquinas, ST I, qq.2–3","https://www.newadvent.org/summa/1002.htm","Thomas Aquinas"),de("John 1:1–18")],"hl-moral":[de("Romans 2:14–15"),At("Aquinas, ST I-II, q.91 — kinds of law","https://www.newadvent.org/summa/2091.htm","Thomas Aquinas"),Be("Augustine, City of God XIX.4–13","https://www.newadvent.org/fathers/120119.htm","Augustine · peace and the good")],"j-hl-1":[de("Romans 2:14–15"),At("Aquinas, ST I-II, q.91","https://www.newadvent.org/summa/2091.htm","Thomas Aquinas")],"hl-mind":[de("John 1:1–4"),Be("Augustine, De Trinitate X","https://www.newadvent.org/fathers/130110.htm","Augustine · the mind knowing itself"),Be("Aristotle, De Anima","http://classics.mit.edu/Aristotle/soul.html","Aristotle · soul as act")],"j-hl-2":[de("John 1:1–4"),Be("Augustine, De Trinitate X","https://www.newadvent.org/fathers/130110.htm","Augustine")],"hl-meaning":[de("Ecclesiastes 12:13"),de("Ecclesiastes 2:24–25"),Be("Boethius, Consolation of Philosophy","https://www.ccel.org/ccel/boethius/consolation.html","Boethius"),Be("Augustine, Confessions I.1","https://www.newadvent.org/fathers/110101.htm","Augustine · restless until it rests in you")],"j-hl-3":[de("Ecclesiastes 12:13"),Be("Augustine, Confessions I.1","https://www.newadvent.org/fathers/110101.htm","Augustine")],"hl-beauty":[de("Psalm 19:1–4"),Be("Augustine, Confessions X.6","https://www.newadvent.org/fathers/110110.htm","Augustine · late have I loved you"),At("Aquinas, ST I, q.5, a.4 — the good and the beautiful","https://www.newadvent.org/summa/1005.htm#article4","Thomas Aquinas")],"j-hl-4":[de("Psalm 19:1–4"),Be("Augustine, Confessions X.6","https://www.newadvent.org/fathers/110110.htm","Augustine")],"daily-lantern":[de("Matthew 5:14–16")],"daily-gems":[de("Matthew 5:14–16"),de("Mark 4:1–9"),de("Matthew 26:28"),de("Luke 22:20")],"daily-seed":[de("Mark 4:1–9")],"daily-life":[de("Acts 17:24–25"),de("Genesis 1:1–27"),de("Wisdom 13:1–9")],"daily-scroll":[de("Isaiah 40:8"),Be("Augustine, On Christian Doctrine II","https://www.newadvent.org/fathers/12022.htm","Augustine · signs and copies"),gi("Center for the Study of New Testament Manuscripts","https://www.csntm.org/","Dan Wallace · modern copies and dating methods")],"daily-grace":[de("Ephesians 2:8–9"),Be("Augustine, On the Spirit and the Letter","https://www.newadvent.org/fathers/1502.htm","Augustine · grace first")],"daily-rest":[de("Matthew 11:28–30")],"daily-empty":[de("Luke 24:1–12"),de("John 20:1–18")],"daily-cosmos":[de("Psalm 8:3–4"),de("Genesis 1:1"),At("Aquinas, ST I, q.2, a.3","https://www.newadvent.org/summa/1002.htm#article3","Thomas Aquinas")],"daily-door":[de("John 10:7–11"),Be("Augustine, Tractates on John 45–47","https://www.newadvent.org/fathers/1701045.htm","Augustine · the door")],"ln-street":[de("Luke 10:25–37"),de("1 Corinthians 15:3–8"),de("Matthew 5:14–16")],"j-trail-1":[de("Lamentations 3:22–23")],"j-trail-2":[de("Lamentations 3:22–23")],"j-trail-3":[de("Luke 15:20")],"j-trail-5":[de("Psalm 19:1–4")],"j-trail-7":[de("Psalm 119:105")],"trail-days-1":[de("Lamentations 3:22–23")],"trail-days-2":[de("Lamentations 3:22–23")],"trail-days-3":[de("Luke 15:20")],"trail-days-5":[de("Psalm 19:1–4")],"trail-days-7":[de("Psalm 119:105")]},g0={"j-ph-1":"ph-road","j-ph-2":"ph-father","j-ph-3":"ph-seeds","j-ph-4":"ph-debt"};function w0(a,o="hold"){const r=g0[a]??a;return(y0[r]??[]).filter(d=>o==="journal"?!0:!d.journalOnly)}function b0(a){return a==="scripture"?"Scripture":a==="ancient"?"Ancient":a==="classic"?"Classic":"Modern · believing"}function Pn({id:a,surface:o="hold",compact:r=!1,why:h,source:d}){const{progress:m}=Je(),w=ye(m);if(w)return null;const y=w0(a,o);if(y.length===0&&!h&&!d)return null;const f=y.length>0?s.jsx("ul",{children:y.map(T=>s.jsxs("li",{children:[s.jsx("a",{href:T.href,target:"_blank",rel:"noopener noreferrer",children:T.label}),s.jsxs("span",{className:"quiet",children:[b0(T.era)," · ",T.source]})]},T.href))}):null,g=s.jsxs(s.Fragment,{children:[h?s.jsx("p",{className:"stored-reason",children:w?s.jsxs(s.Fragment,{children:[s.jsx("strong",{children:hs.reason.term})," — ",Z.reasonSense,". ",h]}):h}):null,d?s.jsx("p",{className:"quiet",children:w?s.jsxs(s.Fragment,{children:[s.jsx("strong",{children:hs.source.term})," — ",Z.sourceSense,": ",d]}):d}):null,f]});return r?s.jsxs("details",{className:"dig-deeper is-compact",children:[s.jsx("summary",{children:w?"Read more":"Why it stands · Dig deeper"}),g]}):s.jsxs("nav",{className:"dig-deeper","aria-label":"Dig deeper",children:[s.jsx("p",{className:"eyebrow",children:w?"Read more":"Dig deeper"}),g]})}function Io({id:a,teach:o=!1}){const{progress:r}=Je();if(!ye(r))return null;const h=Ll(a);return h?s.jsxs("aside",{className:"plain-talk","aria-label":"In plain words",children:[s.jsx("p",{className:"eyebrow",children:"In plain words"}),s.jsx("p",{className:"plain-gloss",children:hn(a,h.gloss)}),h.word?s.jsxs("p",{className:"plain-word",children:[s.jsx("strong",{children:h.word.term})," — ",Dd(h.word.sense)]}):null,o?s.jsx("p",{className:"teach-reason",children:h.teach}):null]}):null}function El({brief:a,keeps:o,kicker:r=ot.tapTakeaway,mode:h="encode",visits:d=0,onHeld:m,onSkip:w}){const{progress:y}=Je(),f=ye(y),g=h==="encode",T=!g&&d>=1,b=Sl(a.id),M=Fd(a.id,b),E=Nl(a.id),G=W.useMemo(()=>zk(a,o),[a,o]),I=g&&G.length>1,[_,Q]=W.useState(I?null:G[0]??null),ne=ue=>f?hn(a.id,ue):ue,se=ue=>f?ol(ue):ue,ie=W.useMemo(()=>{if(g){const _e=I?G.map(ce=>ce.claim):[a.claim];return rl(_e,ne,_e[0]??a.claim)}const ue=Zt([...a.claimChoices]),Pe=f?Zt([a.claim,ue.find(_e=>_e!==a.claim)].filter(_e=>!!_e)):ue;return rl(Pe,ne,a.claim)},[a.id,a.claim,a.claimChoices,g,I,G,f]),re=W.useMemo(()=>{const ue=_?.reason??a.reason;if(g&&!f)return rl([ue],se,ue);const Pe=Zt([...a.reasonChoices]),_e=f?Zt([ue,Pe.find(ce=>ce!==ue)].filter(ce=>!!ce)):g?[ue]:Pe;return rl(_e,se,ue)},[a.id,a.reason,a.reasonChoices,g,_,f]),[F,B]=W.useState(T?"reason":"claim"),[te,ee]=W.useState(0),[ge,j]=W.useState(null),[O,A]=W.useState(!1),[X,L]=W.useState(!1),[v,x]=W.useState(!1),[J,ae]=W.useState(!1),R=_?.claim??a.claim,k=_?.reason??a.reason,N=g||re.length===1||v,K=T&&(J||v||F==="teach"),Y=f&&g,he=!I||!!_,we=F==="teach"?"Read this, then tap Got it.":F==="reason"?N?f?v?T?"That still holds. Tap Done.":"That reason holds. Tap Done.":Z.whyStands:T?"Tap Done when the sharper hold is clear.":"Tap Done when you have the reason.":f?Z.tapWhy:T?"What still makes this stand — not the first teach.":"Tap the reason that holds.":f?Z.rememberSentence:T?"Which sentence was the hold?":r;function Te(ue){m({clean:ue})}function le(ue,Pe,_e){if(ue===Pe){if(_e==="done"){Te(te===0);return}if(_e==="lock"){x(!0),j(ue);return}B(_e);return}const ce=te+1;ee(ce),j(ue),A(!0),window.setTimeout(()=>{A(!1),j(null),ce>=2&&B("teach")},320)}function be(ue){if(g&&I){const Pe=G.find(_e=>_e.claim===ue);if(Pe){Q(Pe),L(!0),B("reason");return}}if((ue===a.claim||g&&!I)&&L(!0),T){if(ue===a.claim){L(!0),ae(!0);return}le(ue,a.claim,"done");return}le(ue,a.claim,"reason")}function Fe(){Te(!1)}return Y?s.jsxs("section",{className:`recall-gate is-encode is-easy-hold ${O?"is-shake":""} ${I?"is-own":""}`,"aria-label":ot.takeaway,children:[s.jsx("p",{className:"eyebrow",children:a.source?a.source:"Hold"}),he?s.jsxs(s.Fragment,{children:[s.jsx("p",{className:"next-tap",children:v?Z.keepThis:Z.tapWhy}),s.jsx("p",{className:"recall-line rehearse-stem",children:hn(a.id,R)}),v?s.jsxs(s.Fragment,{children:[s.jsx("div",{className:"reason-scroll",children:s.jsx("p",{className:"reason-held",children:ol(k)})}),s.jsx("div",{className:"cta-dock",children:s.jsx("button",{type:"button",className:"btn primary xl recall-done",onClick:()=>Te(!0),children:Z.keepThis})})]}):s.jsx("div",{className:"recall-choices",children:re.map(ue=>s.jsx("button",{type:"button",className:`match-card recall-card ${ge===ue?"is-flash":""}`,onClick:()=>le(ue,k,"lock"),children:ol(ue)},ue))})]}):s.jsxs(s.Fragment,{children:[s.jsx("p",{className:"teach-chip",role:"note",children:Z.mainIdeaTeach}),s.jsx("p",{className:"next-tap",children:Z.rememberSentence}),s.jsx("div",{className:"recall-choices",children:ie.map(ue=>s.jsx("button",{type:"button",className:`match-card recall-card ${ge===ue?"is-flash":""}`,onClick:()=>be(ue),children:hn(a.id,ue)},ue))})]})]}):s.jsxs("section",{className:`recall-gate ${O?"is-shake":""} phase-${F} ${g?"is-encode":"is-review"} ${I?"is-own":""} ${T?"is-deeper":""}`,"aria-label":ot.takeaway,children:[s.jsx("p",{className:"eyebrow",children:a.source?a.source:"Hold"}),s.jsx("p",{className:"next-tap",children:we}),g?s.jsxs("p",{className:"learning-store",children:[M?s.jsx(Rt,{gem:M,size:"sm"}):null,s.jsxs("span",{children:["Picture this: ",E]})]}):f?T?s.jsx("p",{className:"quiet",children:"A new angle — not the first read again."}):null:s.jsx("p",{className:"quiet",children:T?"A new angle on a line you already hold — not the first teach again.":"Rebuild the map — claim, then why it stands."}),T||f?null:s.jsx(Io,{id:a.id}),F==="claim"?s.jsxs(s.Fragment,{children:[s.jsx("div",{className:"recall-choices",children:ie.map(ue=>s.jsx("button",{type:"button",className:`match-card recall-card ${ge===ue?"is-flash":""} ${J&&ue===R?"is-locked":""}`,onClick:()=>{J||be(ue)},children:f?hn(a.id,ue):ue},ue))}),J?s.jsxs(s.Fragment,{children:[s.jsx("p",{className:"match-toast",role:"status",children:s.jsx("strong",{children:"That still holds."})}),K?s.jsx(Pn,{id:a.id,compact:!0}):null,s.jsx("div",{className:"cta-dock",children:s.jsx("button",{type:"button",className:"btn gold xl recall-done",onClick:()=>Te(te===0),children:"Done"})})]}):null]}):null,F==="reason"?s.jsxs(s.Fragment,{children:[X?s.jsxs("p",{className:"match-toast",role:"status",children:[s.jsx("strong",{children:"Held."})," ",f?"That line is yours to keep.":"That claim is yours to keep."]}):null,s.jsx("p",{className:"recall-line rehearse-stem",children:f?hn(a.id,R):R}),f?null:s.jsx("h2",{children:T?"A sharper hold":ot.whyItStands}),v?s.jsx("p",{className:"match-toast",role:"status",children:s.jsx("strong",{children:T?"That still holds.":"That reason holds."})}):null,N?s.jsxs(s.Fragment,{children:[s.jsx("p",{className:"reason-held",children:k}),K?s.jsx(Pn,{id:a.id,compact:!0}):null,s.jsx("div",{className:"cta-dock",children:s.jsx("button",{type:"button",className:"btn gold xl recall-done",onClick:()=>Te(te===0),children:"Done"})})]}):s.jsx("div",{className:"recall-choices",children:re.map(ue=>s.jsx("button",{type:"button",className:`match-card recall-card ${ge===ue?"is-flash":""}`,onClick:()=>le(ue,k,T?"claim":"lock"),children:f?ol(ue):ue},ue))})]}):null,F==="teach"?s.jsxs(s.Fragment,{children:[s.jsx("h2",{children:T?"Here’s the sharper line.":"Here’s the line."}),s.jsxs("article",{className:"unlock-card pop-in",children:[s.jsx("p",{className:"recall-line",children:f?hn(a.id,R):R}),s.jsx("p",{children:k}),s.jsx(Io,{id:a.id,teach:!0})]}),s.jsx("button",{type:"button",className:"btn primary xl",onClick:Fe,children:"Got it"}),s.jsx(Pn,{id:a.id})]}):null,!g&&w?s.jsxs("div",{className:"recall-skip",children:[s.jsx("button",{type:"button",className:"text-link",onClick:()=>w("later"),children:"Later"}),s.jsx("button",{type:"button",className:"text-link",onClick:()=>w("not-today"),children:"Not today"})]}):null]})}function gw({learning:a,when:o}){const{progress:r}=Je(),h=ye(r);return s.jsxs("article",{className:"stored-line is-spoken","aria-label":"Stored learning",children:[s.jsx("p",{className:"eyebrow",children:"Say this out loud"}),a.picture?s.jsx(Rt,{gem:a.picture,size:"md"}):null,s.jsx("p",{className:"stored-claim",children:h?hn(a.id,a.claim):a.claim}),h?null:s.jsx(Io,{id:a.id}),h?null:s.jsx(Pn,{id:a.id,compact:!0,why:a.reason,source:a.source}),o?s.jsx("p",{className:"quiet",children:o}):null]})}function ww({words:a,extra:o}){const r=new Set,h=[];for(const d of a)r.has(d.term)||(r.add(d.term),h.push(d));return o&&!r.has(o.term)&&h.push(o),h.length===0?null:s.jsx("ul",{className:"word-school","aria-label":"Words to know",children:h.map(d=>s.jsxs("li",{children:[s.jsx("strong",{children:d.term})," — ",d.sense]},d.term))})}function v0(a){return a==="sort"?"Unlock the sort":a==="sequence"?"Unlock the order":a==="build-argument"?"Unlock the stones":a==="link"?"Unlock the links":"Unlock the pairs"}function au({brief:a,kind:o,onUnlock:r,unlock:h,beats:d}){const{progress:m}=Je(),w=ye(m),y=Sl(a.id),f=Fd(a.id,y),g=Ll(a.id),T=Ro(a.id),b=za(m,a.id),E=T?.[b]?.learn||(w&&g?g.teach:a.reason),G=K1(a.id,w);if(w){const I=Ng(a.id);return s.jsxs("section",{className:"recall-gate is-encode teach-gate easy-story-card","aria-label":"Short story",children:[s.jsx("p",{className:"eyebrow",children:"Short story"}),f?s.jsx(Rt,{gem:f,size:"sm"}):null,s.jsx("p",{className:"teach-reason",children:E}),s.jsx("p",{className:"eyebrow hold-kicker",children:"The main idea you will keep"}),s.jsx("p",{className:"recall-line rehearse-stem",children:hn(a.id,a.claim)}),s.jsxs("div",{className:"easy-who-where","aria-label":`${I.who} · ${I.place}`,children:[s.jsx("p",{className:"easy-who-where-line",children:wT(a.id)}),s.jsxs("div",{className:"easy-who-where-row",children:[s.jsxs("figure",{className:"easy-who-chip",children:[s.jsx(it,{who:I.whoId,size:"sm"}),s.jsx("figcaption",{children:I.who})]}),s.jsx("p",{className:"easy-place-chip",children:I.place})]})]}),s.jsxs("div",{className:"cta-dock easy-story-dock",children:[s.jsx("button",{type:"button",className:"btn gold xl",onClick:r,children:"Continue"}),s.jsx("button",{type:"button",className:"text-link",onClick:r,children:"Skip reading"})]})]})}return s.jsxs("section",{className:"recall-gate is-encode teach-gate","aria-label":"Today’s line",children:[s.jsx("p",{className:"eyebrow",children:"Learn"}),s.jsx("p",{className:"next-tap",children:"Read this, then unlock the play."}),f?s.jsx(Rt,{gem:f,size:"sm"}):null,s.jsx("p",{className:"teach-reason",children:E}),s.jsx(ww,{words:G,extra:g?.word}),s.jsx("p",{className:"quiet",children:hs.claim.teach}),s.jsx("p",{className:"eyebrow hold-kicker",children:"The claim you will hold"}),s.jsx("p",{className:"recall-line rehearse-stem",children:a.claim}),s.jsxs("p",{className:"quiet",children:[hs.source.term," — ",hs.source.sense,": ",a.source,"."]}),s.jsxs("p",{className:"quiet",children:["Pictured as ",Nl(a.id),"."]}),s.jsxs("p",{className:"quiet",children:["Acquire — learn this line so you can hold it. Hold this line to deploy"," ",y?.label??"Love"," on the night road."]}),d&&d.length>0?s.jsx("ol",{className:"teach-beats",children:d.map(I=>s.jsx("li",{children:I.text},I.id))}):null,s.jsx("button",{type:"button",className:"btn primary xl",onClick:r,children:h??v0(o)})]})}function Hl({who:a,line:o,action:r,onGo:h}){const d=en[a];return s.jsxs("div",{className:"town-return is-tight after-win-cta",children:[s.jsxs("button",{type:"button",className:"btn primary xl",onClick:h,children:[s.jsx(it,{who:a,size:"sm"}),r]}),s.jsxs("p",{className:"town-kicker",children:[d.shortName,": ",o]})]})}function k0({areaId:a,challengeId:o,onNavigate:r}){const{completeChallenge:h,recordReview:d,recordTaught:m,markMiss:w,progress:y}=Je(),f=ye(y),g=Ud(a),T=FT(a,o),b=qt(o),M=Dt(),[E]=W.useState(!!(b&&y.memory[b.id]&&Po(y.memory[b.id],M))),{juiceDone:G,afterJuice:I}=Cl(),_=W.useRef(!1),[Q,ne]=W.useState(!1),[se,ie]=W.useState(!1),[re,F]=W.useState(!1),B=!!b&&(ye(y)||a==="observatory"||T?.kind==="sequence"),[te,ee]=W.useState(()=>!B||E),[ge,j]=W.useState(!1);if(W.useEffect(()=>{!G||(document.querySelector(".app-body")?.scrollTo({top:0,behavior:"smooth"}),_.current)||(_.current=!0,h(a,o),!(!b||E)&&d({id:b.id,pillar:a,kind:"encode",today:M,clean:!Q&&!se,peeked:se,elaborated:!1}))},[G]),!g||!T)return s.jsx("main",{className:"page",children:s.jsx("p",{children:"That challenge is not on the trail."})});const O=bi(g.id,y.completed),A=g.challenges.findIndex(k=>k.id===T.id),X=g.challenges.slice(0,A).every(k=>y.completed.includes(k.id));if(!O||!X)return s.jsxs("main",{className:"page",children:[s.jsx("p",{children:O?ye(y)?"This walk is locked. Finish the walk before it on this street first.":"This walk is still waiting. Finish the earlier challenge on this street first.":Jo(g.id,y.completed,ye(y))}),s.jsxs("button",{type:"button",className:"btn primary",onClick:()=>r({name:"area",areaId:a}),children:["Back to ",g.title]})]});function L(){I(),b||F(!0)}function v(k){F(!0),b&&E&&d({id:b.id,pillar:a,kind:"recall",today:M,clean:k.clean&&!Q&&!se,peeked:se,elaborated:!!y.memory[b.id]?.elaborated})}function x(){r({name:"hub"})}const J=G&&(!b||re),ae=G&&!!b&&!re,R=Dk(a);return s.jsxs("main",{className:`challenge-page ${G?"is-after":te?"is-puzzle":"is-teach"} ${ae?"is-rehearse":""} ${ge?"is-arming":""}`,"aria-label":ot.playGoal,children:[s.jsxs("button",{type:"button",className:"text-link",onClick:()=>r({name:"area",areaId:a}),children:["← ",g.title]}),G?s.jsxs("section",{className:"after-win",children:[b&&!re?s.jsx("div",{className:"rehearse-anchor",children:s.jsx(El,{brief:b,keeps:T.kind==="sort"?T.tiles.filter(k=>k.bin==="keep"):void 0,mode:E?"review":"encode",kicker:ot.tapTakeaway,onHeld:v})}):null,J&&b?s.jsx(gw,{learning:cs(y,b.id)??{id:b.id,claim:b.claim,reason:b.reason,source:b.source,anchor:"Juniper’s east porch",acquiredAt:M},when:y.memory[b.id]?Go(y.memory[b.id],M,ye(y)):ye(y)?"Read this again today":"Dust off today"}):null,J?s.jsx(Hl,{who:R.who,line:R.afterWin,action:f?Z.home:"See the town",onGo:x}):null]}):!te&&b?s.jsx(au,{brief:b,kind:T.kind,beats:T.kind==="sequence"?T.items:(ye(y)||a==="observatory")&&T.kind==="match"?T.pairs.map(k=>({id:k.id,text:k.left})):(ye(y)||a==="observatory")&&T.kind==="build-argument"?T.slots.map(k=>{const N=T.cards.find(K=>K.id===k.correctCardId);return{id:k.id,text:N?.text??k.label}}):(ye(y)||a==="observatory")&&T.kind==="sort"?T.tiles.filter(k=>k.bin==="keep").map(k=>({id:k.id,text:k.text})):void 0,onUnlock:()=>{b&&m(b.id),ee(!0),j(!0),window.setTimeout(()=>j(!1),360)}}):s.jsxs(s.Fragment,{children:[s.jsx("h1",{className:"puzzle-title",children:T.title}),s.jsx(nu,{challenge:T,onMiss:()=>{ne(!0),w(T.id)},onPeek:()=>ie(!0),onSolved:L})]})]})}function T0({onNavigate:a}){const{completeDaily:o,recordReview:r,recordTaught:h,progress:d}=Je(),m=ye(d),y=Dt(new Date),f=d.dailyDates.filter(X=>X!==y).length,[g]=W.useState(()=>{const X=vi(d,y),L=yl(y,f),v=qt(L.challenge.id),x=Do(L.challenge.id);return{already:X,challenge:L.challenge,brief:v,pillar:x}}),{challenge:T,brief:b,pillar:M}=g,{juiceDone:E,afterJuice:G}=Cl(g.already),I=W.useRef(!1),[_,Q]=W.useState(!1),[ne,se]=W.useState(!1),[ie,re]=W.useState(()=>!b||!!d.held.includes(b.id)),[F,B]=W.useState(()=>!b),[te,ee]=W.useState(!1),ge=E&&ie;W.useEffect(()=>{!E||(document.querySelector(".app-body")?.scrollTo({top:0,behavior:"smooth"}),g.already||I.current)||(I.current=!0,o(y),b&&r({id:b.id,pillar:M,kind:"encode",today:y,clean:!_&&!ne,peeked:ne,elaborated:!1}))},[E]);function j(){G()}function O(X){re(!0)}const A=E&&!!b&&!ie;return s.jsxs("main",{className:`daily-page ${E?"is-after":F?"is-puzzle":"is-teach"} ${A?"is-rehearse":""} ${te?"is-arming":""}`,"aria-label":ot.playGoal,children:[s.jsxs("button",{type:"button",className:"text-link",onClick:()=>a({name:"hub"}),children:["← ",m?Z.home:"The town"]}),E?s.jsxs("section",{className:"after-win daily-done",children:[b&&!ie?s.jsx("div",{className:"rehearse-anchor",children:s.jsx(El,{brief:b,keeps:T.kind==="sort"?T.tiles.filter(X=>X.bin==="keep"):void 0,mode:"encode",kicker:ot.tapTakeaway,onHeld:O})}):null,ge&&b?s.jsx(gw,{learning:cs(d,b.id)??{id:b.id,claim:b.claim,reason:b.reason,source:b.source,anchor:"Juniper’s east porch",acquiredAt:y},when:d.memory[b.id]?Go(d.memory[b.id],y,m):m?"Read this again today":"Dust off today"}):null,ge?s.jsx(Hl,{who:la("porch").who,line:la("porch").afterWin,action:m?Z.home:"See the town",onGo:()=>a({name:"hub"})}):null]}):!F&&b?s.jsx(au,{brief:b,kind:T.kind,beats:T.kind==="sequence"?T.items:void 0,onUnlock:()=>{h(b.id),B(!0),ee(!0),window.setTimeout(()=>ee(!1),360)}}):s.jsxs(s.Fragment,{children:[s.jsx("h1",{className:"puzzle-title",children:T.title}),s.jsx(nu,{challenge:T,onMiss:()=>Q(!0),onPeek:()=>se(!0),onSolved:j})]})]})}const su={porch:{path:"Arrive",whyEasy:"You start here. Juniper keeps a lamp so today’s line can be seen.",whyHard:"The east porch is the morning door. A lamp belongs on a porch because it is meant to be seen — not hidden in a drawer."},hollow:{path:"Eden stories",whyEasy:"Mercy tells Jesus stories by the creek. Pictures live where water and oaks are.",whyHard:"Story Creek is the garden of the case. Jesus taught in pictures; Mercy keeps the creek so those stories can walk around inside you."},bench:{path:"Names",whyEasy:"Silas copies names at the square. Public names live here, not under the oaks.",whyHard:"Witness Square is the ledger on the square. Died, buried, raised, appeared is a public creed — Silas keeps it where names and dates are copied."},observatory:{path:"Sky",whyEasy:"Nora’s dome looks up. Fine-tuning and the sky’s fit live on the ridge.",whyHard:"Sky Watch sits on the north ridge so you look up. Life’s dials and “why anything at all” belong with a telescope, not a creek story."},gate:{path:"Why a world",whyEasy:"Ansel’s stone asks why there is a world at all. That question lives at the gate you walked in by.",whyHard:"Why Gate is the east-road arch beside the porch. After the sky, you come back to the stone: first mover, might-not-have-been, the beginning argument — then the high ridge."},lookout:{path:"Meaning",whyEasy:"Hope’s tower looks over the whole town. Duty, mind, meaning, and beauty live up here.",whyHard:"Meaning Ridge is the last ridge. Inner life, duty, hunger, and beauty are what it is like to be a person looking down on the walk you kept."},journal:{path:"Pages",whyEasy:"River’s house of pages. What you can still say lives here.",whyHard:"The dossier house is not a new proof. It is the traveler’s memory of proofs — pages River has to be able to say again."},lamps:{path:"Remember",whyEasy:"Street lamps remember walks you kept. Juniper’s light grows along the road.",whyHard:"Star lamps are the same morning light grown into the street. Mastery and nights held make the town remember."}};function x0(a,o){const r=su[a];return o?r.whyEasy:r.whyHard}function ag(a){return a==="hollow"?"Story Creek · Jesus stories":a==="bench"?"Witness Square · public names":a==="porch"?"Juniper’s lamp":a==="observatory"?"Nora’s Sky Watch":a==="gate"?"Ansel’s why-a-world gate":a==="lookout"?"Hope’s Meaning Ridge":null}const S0="Arrive at the porch. Stories at the creek. Names on the square. Sky, gate, and lookout climb toward Heaven. Tap a building to manage and upgrade it.",j0="Silver City is a short walk through the case for God. After each puzzle you fold the teaching and rebuild one claim + one reason from memory — that’s the game. Try it, then see what you can still say.";function M0(a=typeof window<"u"?window.location.href:""){return`${j0}

${a}`}function iu({compact:a}){const[o,r]=W.useState(!1);async function h(){const d=window.location.href,m=M0(d);try{if(navigator.share){await navigator.share({title:"Silver City: Unending Evidence",text:m,url:d});return}}catch{}try{await navigator.clipboard.writeText(m),r(!0),window.setTimeout(()=>r(!1),2200)}catch{r(!1)}}return s.jsxs("div",{className:`share-invite ${a?"is-compact":""}`,children:[a?null:s.jsx("p",{children:"Hand a friend the walk — not a score. Ask what they can still say after the page folds."}),s.jsx("button",{type:"button",className:"btn gold",onClick:()=>{h()},children:o?"Copied — ask what they remember":"Share a morning"})]})}const Md="silver-city-ads",ou=!1,C0={"hub-banner":{id:"hub-banner",label:"Hub banner",where:"Map, under Today’s Trail, above the district list"},"between-districts":{id:"between-districts",label:"Between districts",where:"Map, once between Story Creek and Witness Square"},"after-daily":{id:"after-daily",label:"After Daily complete",where:"Today’s Trail teaser screen only — after the takeaway is chosen"}};function bw(){if(typeof localStorage>"u")return"default";const a=localStorage.getItem(Md);return a==="on"||a==="off"?a:"default"}function A0(a=bw()){return a==="on"?!0:a==="off"?!1:ou}function N0(a){typeof localStorage>"u"||(a==="default"?localStorage.removeItem(Md):localStorage.setItem(Md,a),typeof window<"u"&&window.dispatchEvent(new Event("silver-city-ads")))}function vw(a){return typeof window>"u"?()=>{}:(window.addEventListener("storage",a),window.addEventListener("silver-city-ads",a),()=>{window.removeEventListener("storage",a),window.removeEventListener("silver-city-ads",a)})}function L0(){return W.useSyncExternalStore(vw,A0,()=>!1)}function E0(){return W.useSyncExternalStore(vw,bw,()=>"default")}function sg({slot:a}){if(!L0())return null;const r=C0[a];return s.jsxs("aside",{className:`ad-slot ad-slot-${a}`,"aria-label":`${r.label} placeholder`,children:[s.jsx("p",{className:"eyebrow",children:"Ad slot · not live"}),s.jsx("p",{className:"ad-slot-label",children:r.label}),s.jsx("p",{className:"quiet",children:r.where})]})}var H0=lg();function W0({plotId:a,onClose:o,onEnter:r,onNavigate:h}){const{progress:d,upgradeBuilding:m}=Je(),w=ye(d),y=(()=>{const F=Fg(a,d);return w&&a==="journal"?{...F,placeTitle:"River’s pages"}:F})(),f=fs(a,d),g=Sn(a,d),T=Rx(a,d,w),M=tt.find(F=>F.id===a)?.areaId,E=M?bi(M,d.completed):!0,G=M&&!E?Jo(M,d.completed,w):null,I=M&&!E?N1(M):null,_=I?jt.find(F=>F.id===I)?.title??I:"",[Q,ne]=W.useState(null),se=y.ideas.filter(F=>F.lit).length+y.tools.filter(F=>F.lit).length;function ie(F){const B=us(F);if(B&&d.journal.includes(B.id)){h({name:"journal",focusId:B.id,autoQuiz:!0});return}if(qt(F)&&(d.held.includes(F)||d.completed.includes(F))){h(xl(d,y.plotId==="porch"?"porch":void 0));return}h({name:"journal",focusId:B?.id??F})}const re=s.jsxs("div",{className:"mind-map is-manage",role:"dialog","aria-label":`Manage ${y.placeTitle}`,children:[s.jsx("button",{type:"button",className:"mind-map-scrim","aria-label":"Close building",onClick:o}),s.jsxs("div",{className:"mind-map-card",children:[s.jsxs("header",{className:"mind-map-head",children:[s.jsx(it,{who:y.person.id,size:"md"}),s.jsxs("div",{children:[s.jsx("p",{className:"eyebrow",children:w?`${Z.manage} · ${f} · ${Dy(f,w)}`:`Manage · Level ${f} · ${Dy(f,w)}`}),s.jsx("h2",{children:y.placeTitle}),w&&ag(a)?s.jsx("p",{className:"quiet place-sub",children:ag(a)}):null]}),s.jsx("button",{type:"button",className:"btn tiny",onClick:o,children:"Close"})]}),s.jsxs("div",{className:"mind-map-scroll",children:[s.jsx("p",{className:"quiet",children:x0(y.plotId,w)}),w?null:s.jsx(ww,{words:[hs.upgrade]}),s.jsx("p",{className:"build-job",children:Ox(f,w)}),Q?s.jsx("p",{className:"match-toast",role:"status",children:Q}):null,s.jsxs("div",{className:"mind-web","aria-label":"Linked nodes",children:[s.jsxs("div",{className:"mind-node is-place is-lit",children:[s.jsx("span",{className:"mind-kicker",children:"Place"}),s.jsx("strong",{children:y.placeTitle}),s.jsx("em",{className:"mind-why",children:su[y.plotId].path})]}),s.jsxs("div",{className:"mind-node is-person is-lit",children:[s.jsx("span",{className:"mind-kicker",children:"Person"}),s.jsx(it,{who:y.person.id,size:"sm"}),s.jsx("strong",{children:y.person.shortName})]}),y.ideas.map(F=>s.jsxs("div",{className:"mind-idea-wrap",children:[s.jsxs("button",{type:"button",className:`mind-node is-idea ${F.lit?"is-lit":"is-dim"}`,onClick:()=>{if(F.lit){ne(null),ie(F.id);return}ne(Dx(w))},children:[s.jsx("span",{className:"mind-kicker",children:F.lit?w?"Main idea":"Idea":"Locked"}),s.jsx("strong",{children:F.lit&&w?Ll(F.id)?.gloss??F.claim:F.claim}),F.lit&&F.source&&!w?s.jsx("em",{children:F.source}):null]}),F.lit?s.jsx(Pn,{id:F.id,surface:"map",compact:!0}):null]},F.id)),y.tools.map(F=>s.jsxs("div",{className:`mind-node is-tool ${F.lit?"is-lit":"is-dim"}`,children:[s.jsx("span",{className:"mind-kicker",children:F.lit?"Tool":"Locked"}),s.jsx(ui,{ability:F.id,size:"sm"}),s.jsx("strong",{children:F.label})]},F.id)),y.ideas.length===0&&y.tools.length===0?s.jsx("p",{className:"quiet mind-empty",children:"Walk this lot — or link the street — to light idea nodes here."}):null]}),w?null:s.jsx("p",{className:"quiet scrap-kicker",children:jT(w,se)}),f>=ls||g?null:s.jsx("p",{className:"quiet build-cap",children:w?`${f} of ${ls} looks. Learn more to earn the next.`:`${f} of ${ls} looks earned by learning.`})]}),s.jsxs("div",{className:"mind-map-dock",children:[G?s.jsx("p",{className:"build-next",children:G}):g?null:s.jsx("p",{className:"build-next",children:T.line}),G&&I?s.jsx("button",{type:"button",className:"btn gold xl",onClick:()=>h(Tl(I,d.completed)),children:w?`Walk ${_} next`:`Walk ${_}`}):g?s.jsx("button",{type:"button",className:"btn gold xl build-upgrade",onClick:()=>m(a),children:"Build this"}):s.jsx("button",{type:"button",className:"btn primary xl",onClick:()=>r(a),children:w?`Walk ${y.placeTitle}`:`Enter ${y.placeTitle}`}),G?s.jsx("button",{type:"button",className:"text-link mind-map-walk",onClick:o,children:"Stay on the map"}):g?s.jsx("button",{type:"button",className:"text-link mind-map-walk",onClick:()=>r(a),children:w?`Walk ${y.placeTitle}`:`Enter ${y.placeTitle}`}):null]})]})]});return typeof document>"u"?re:H0.createPortal(re,document.body)}const ru={lookout:{x:532,y:62},observatory:{x:422,y:126},hollow:{x:92,y:294},journal:{x:262,y:244},bench:{x:368,y:288},lamps:{x:208,y:318},gate:{x:486,y:256},porch:{x:582,y:306}},I0=1.58,O0={lookout:{x:568,y:118},observatory:{x:472,y:178},hollow:{x:148,y:352},journal:{x:312,y:300},bench:{x:420,y:344},lamps:{x:178,y:358},gate:{x:538,y:322},porch:{x:534,y:356}},wo={x:0,y:0,w:640,h:420};function ig(a){const o=ru[a];return{x:o.x-150,y:o.y-120,w:300,h:230}}function R0(a){return`${a.x} ${a.y} ${a.w} ${a.h}`}function kw({onNavigate:a,mode:o="live",mindPlot:r,onMindPlot:h}){const{progress:d}=Je(),m=Dt(),w=vi(d,m),y=o==="poster"?"porch":Hd(d,w),{standing:f,possible:g}=Uk(d),T=o==="poster"?"eden":Xk(d),b=o==="poster"?Rd(d):Ry(d),M=o==="poster"?aT(d):qy(d),[E,G]=W.useState(b),[I,_]=W.useState(M),[Q,ne]=W.useState(null),[se,ie]=W.useState(!1),[re,F]=W.useState(null),[B,te]=W.useState(null),[ee,ge]=W.useState(null),[j,O]=W.useState(null),A=r!==void 0?r:j,X=h??O,[L,v]=W.useState(wo),x=W.useRef(!1),J=W.useRef([]),ae=W.useRef(wo),R=W.useRef(0);function k(pe){return o==="poster"?pe==="porch"?"scaffold":"empty":E[pe]}function N(pe){if(o==="poster"||x.current)return;const Oe=tt.find(yt=>yt.id===pe)?.areaId,ht=Oe?bi(Oe,d.completed):!0;if(X(null),pe==="porch"&&w){a(xl(d,"porch"));return}if(Oe){const yt=jt.find(_t=>_t.id===Oe);if(yt&&Al(yt,d.completed)){a(xl(d,Oe));return}if(yt&&ht){a(Tl(yt.id,d.completed));return}}a(_k(pe,ht))}function K(pe){o!=="poster"&&(x.current&&!ye(d)||(te(pe),window.setTimeout(()=>{te(Ae=>Ae===pe?null:Ae)},340),ge(null),X(pe)))}W.useEffect(()=>()=>{J.current.forEach(pe=>window.clearTimeout(pe)),R.current&&cancelAnimationFrame(R.current)},[]),W.useEffect(()=>{if(o!=="live")return;const pe=Ry(d),Ae=qy(d);if(ye(d)){vo(pe),go(Ae),G(pe),_(Ae);return}const Oe=oT(),ht=rT();if(!Oe){vo(pe),go(Ae),G(pe),_(Ae);return}ht||go(Ae);const yt=sT(Oe,pe),_t=ht?iT(ht,Ae,pe,yt):[],Lt={"Lit!":4,"Built!":3,"Grew!":2,Unlocked:1},nt=[...yt,..._t].sort((Pt,Tt)=>Lt[Tt.beat]-Lt[Pt.beat]);if(!nt.length){G(pe),_(Ae),vo(pe),go(Ae),Te(pe);return}x.current||(x.current=!0,G(Oe),_(ht??Ae),we(nt,pe,Ae))},[o,d]);function Y(pe,Ae){const Oe=window.setTimeout(Ae,pe);J.current.push(Oe)}function he(pe,Ae){R.current&&cancelAnimationFrame(R.current);const Oe={...ae.current},ht=performance.now(),yt=_t=>{const Lt=Ae<=0?1:Math.min(1,(_t-ht)/Ae),nt=Lt*Lt*(3-2*Lt),Pt={x:Oe.x+(pe.x-Oe.x)*nt,y:Oe.y+(pe.y-Oe.y)*nt,w:Oe.w+(pe.w-Oe.w)*nt,h:Oe.h+(pe.h-Oe.h)*nt};ae.current=Pt,v(Pt),Lt<1&&(R.current=requestAnimationFrame(yt))};R.current=requestAnimationFrame(yt)}function we(pe,Ae,Oe){const ht=typeof window<"u"&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;function yt(){ne(null),F(null),he(wo,ht?0:240),G(Ae),_(Oe),vo(Ae),go(Oe),xy(m),x.current=!1}function _t(Lt){if(Lt>=pe.length){yt();return}const nt=pe[Lt];F(nt),ht||he(ig(nt.id),200),Y(ht?40:180,()=>{nt.beat!=="Grew!"&&G(Pt=>({...Pt,[nt.id]:nt.to})),_(Pt=>({...Pt,[nt.id]:Oe[nt.id]})),ne(nt.id)}),Y(ht?700:1100,()=>{ne(null),F(null),ht||he(wo,220),Y(ht?40:200,()=>_t(Lt+1))})}_t(0)}function Te(pe){if(ye(d)||x.current||nT()===m)return;const Ae=tT(pe);if(!Ae)return;x.current=!0;const Oe=typeof window<"u"&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;ie(!0),ne(Ae),Oe||he(ig(Ae),200),Y(Oe?700:1100,()=>{ie(!1),ne(null),xy(m),Oe||he(wo,220),Y(Oe?40:200,()=>{x.current=!1})})}const le=k(y),be=ru[y],Fe=Sn(y,d)?"Build this":Qk(le,y,w),ue=Ix(d)?ye(d)?"A building is ready. Tap it, then Build this.":"A building is ready. Tap it, then Build this — learning raises the house.":Zk(y,le,I[y]??0,ye(d)),Pe=!!re||se,_e=la(re?re.id:y),ce=ye(d);return s.jsxs("section",{className:`city-overworld is-city-build is-age-${T} is-alive ${o==="poster"?"is-poster":""} ${Pe?"is-revealing":""} ${se?"is-homecoming":""}`,children:[s.jsxs("svg",{className:"city-svg",viewBox:R0(L),preserveAspectRatio:"xMidYMid meet",role:o==="poster"?"img":"group","aria-label":o==="poster"?"A garden valley. The City of Heaven waits on the ridge.":ce?"Silver City. Tap a building to Manage it, walk, or Build this.":Pe?`${re?.beat} ${re?.title}`:`Silver City, ${Ty[T]}. ${f} of ${g} landmarks standing. The town grows toward the City of Heaven.`,children:[s.jsxs("defs",{children:[s.jsxs("linearGradient",{id:"city-sky",x1:"0",y1:"0",x2:"0",y2:"1",children:[s.jsx("stop",{offset:"0%",stopColor:"var(--city-sky-0)"}),s.jsx("stop",{offset:"22%",stopColor:"var(--city-sky-1)"}),s.jsx("stop",{offset:"52%",stopColor:"var(--city-sky-2)"}),s.jsx("stop",{offset:"100%",stopColor:"var(--city-sky-3)"})]}),s.jsxs("linearGradient",{id:"city-ridge",x1:"0",y1:"0",x2:"0",y2:"1",children:[s.jsx("stop",{offset:"0%",stopColor:"var(--city-ridge-0)"}),s.jsx("stop",{offset:"100%",stopColor:"var(--city-ridge-1)"})]}),s.jsxs("linearGradient",{id:"city-wood",x1:"0",y1:"0",x2:"0",y2:"1",children:[s.jsx("stop",{offset:"0%",stopColor:"#ffd24a"}),s.jsx("stop",{offset:"100%",stopColor:"#ff9f1a"})]}),s.jsxs("linearGradient",{id:"city-gold-roof",x1:"0",y1:"0",x2:"0",y2:"1",children:[s.jsx("stop",{offset:"0%",stopColor:"#fff6b8"}),s.jsx("stop",{offset:"52%",stopColor:"#ffcc33"}),s.jsx("stop",{offset:"100%",stopColor:"#ff9f1a"})]}),s.jsxs("linearGradient",{id:"city-wall-built",x1:"0",y1:"0",x2:"0",y2:"1",children:[s.jsx("stop",{offset:"0%",stopColor:"#7a4ad4"}),s.jsx("stop",{offset:"100%",stopColor:"#4a1a88"})]}),s.jsxs("linearGradient",{id:"city-wall-lit",x1:"0",y1:"0",x2:"0",y2:"1",children:[s.jsx("stop",{offset:"0%",stopColor:"#c86bff"}),s.jsx("stop",{offset:"100%",stopColor:"#5a2ab8"})]}),s.jsxs("linearGradient",{id:"city-heaven-wall",x1:"0",y1:"0",x2:"0",y2:"1",children:[s.jsx("stop",{offset:"0%",stopColor:"#fff6d4"}),s.jsx("stop",{offset:"100%",stopColor:"#ffcc33"})]}),s.jsxs("radialGradient",{id:"city-moon-glow",cx:"50%",cy:"50%",r:"50%",children:[s.jsx("stop",{offset:"0%",stopColor:"#fff6d4",stopOpacity:"1"}),s.jsx("stop",{offset:"55%",stopColor:"#ffcc33",stopOpacity:"0.4"}),s.jsx("stop",{offset:"100%",stopColor:"#ff5a7a",stopOpacity:"0"})]}),s.jsxs("radialGradient",{id:"city-glory",cx:"50%",cy:"50%",r:"50%",children:[s.jsx("stop",{offset:"0%",stopColor:"#fffce8",stopOpacity:"0.95"}),s.jsx("stop",{offset:"40%",stopColor:"#ffcc33",stopOpacity:"0.45"}),s.jsx("stop",{offset:"100%",stopColor:"#ff5a7a",stopOpacity:"0"})]}),s.jsxs("filter",{id:"city-glow",x:"-50%",y:"-50%",width:"200%",height:"200%",children:[s.jsx("feGaussianBlur",{stdDeviation:"5",result:"b"}),s.jsxs("feMerge",{children:[s.jsx("feMergeNode",{in:"b"}),s.jsx("feMergeNode",{in:"SourceGraphic"})]})]}),s.jsx("clipPath",{id:"city-face-clip",clipPathUnits:"objectBoundingBox",children:s.jsx("circle",{cx:"0.5",cy:"0.5",r:"0.48"})})]}),s.jsx("rect",{width:"640",height:"420",fill:"url(#city-sky)"}),s.jsx("ellipse",{cx:"320",cy:"198",rx:"280",ry:"28",fill:"#ffcc33",opacity:"0.28"}),s.jsx("circle",{cx:"548",cy:"48",r:"28",fill:"url(#city-moon-glow)"}),s.jsx("circle",{className:"city-moon",cx:"548",cy:"48",r:"9",fill:"#fff6d8"}),s.jsxs("g",{className:`city-sky-stars is-${k("lamps")}`,children:[s.jsx("circle",{cx:"72",cy:"42",r:"1.6"}),s.jsx("circle",{cx:"118",cy:"28",r:"1.2"}),s.jsx("circle",{cx:"510",cy:"36",r:"1.5"}),s.jsx("circle",{cx:"568",cy:"52",r:"1.1"}),s.jsx("circle",{cx:"430",cy:"22",r:"1.3"}),s.jsx("circle",{cx:"300",cy:"34",r:"1.1"}),s.jsx("circle",{cx:"196",cy:"50",r:"1.1"}),s.jsx("circle",{cx:"248",cy:"20",r:"0.9"}),s.jsx("circle",{cx:"390",cy:"54",r:"1.2"}),s.jsx("circle",{cx:"88",cy:"68",r:"0.8"})]}),s.jsx("path",{d:"M-20 210 L80 120 160 168 250 96 340 150 430 78 520 130 660 70 V230 H-20 Z",fill:"url(#city-ridge)",opacity:"0.92"}),s.jsx("path",{d:"M-20 248 L40 200 120 228 210 176 300 214 410 168 500 206 660 150 V430 H-20 Z",fill:"#3dcc7a",opacity:"0.55"}),s.jsx(J0,{age:T,easy:ce,onOpen:()=>{if(ce){ge("Tap a building to walk or Manage it.");return}if(T==="eden"||T==="village"){ge("Heaven waits on the ridge. Keep the trail — porch, creek, square, then the climb.");return}K("lookout")}}),s.jsx(P0,{age:T}),ce?null:s.jsx(G0,{age:T}),s.jsx("path",{className:`city-street city-street-main is-${k("hollow")} is-${k("bench")}`,d:"M70 310 C 140 300, 200 280, 280 292 C 360 304, 430 286, 560 300",fill:"none"}),s.jsx("path",{className:`city-street city-street-ridge is-${k("bench")} is-${k("gate")}`,d:"M300 292 C 360 250, 400 210, 448 168",fill:"none"}),s.jsx("path",{className:`city-creek is-${k("hollow")}`,d:"M18 250 C 70 270, 90 300, 60 360 C 40 400, 80 410, 120 400",fill:"none"}),I.lamps>=1?s.jsxs("g",{className:`city-street-lamps is-${k("lamps")}`,"aria-hidden":!0,children:[s.jsx("circle",{className:"city-lamp",cx:"148",cy:"298",r:"5"}),I.lamps>=4?s.jsx("circle",{className:"city-lamp",cx:"330",cy:"296",r:"5"}):null,I.lamps>=8?s.jsx("circle",{className:"city-lamp",cx:"470",cy:"292",r:"5"}):null]}):null,Pe?null:s.jsxs("g",{className:"city-walkers","aria-hidden":!0,children:[s.jsx("image",{className:"city-walker city-walker-a",href:Pg,x:"78",y:"286",width:"32",height:"32",clipPath:"url(#city-face-clip)"}),T!=="eden"?s.jsx("image",{className:"city-walker city-walker-b",href:Dg,x:"408",y:"266",width:"30",height:"30",clipPath:"url(#city-face-clip)"}):null]}),o==="poster"?s.jsxs("g",{className:"city-welcome-folk","aria-hidden":!0,children:[s.jsx("foreignObject",{x:"148",y:"300",width:"44",height:"44",children:s.jsx("div",{className:"city-portrait",children:s.jsx(it,{who:"river",size:"sm"})})}),s.jsx("foreignObject",{x:"348",y:"274",width:"44",height:"44",children:s.jsx("div",{className:"city-portrait",children:s.jsx(it,{who:"juniper",size:"sm"})})}),s.jsx("foreignObject",{x:"236",y:"318",width:"40",height:"40",children:s.jsx("div",{className:"city-portrait",children:s.jsx(it,{who:"mercy",size:"sm"})})})]}):null,s.jsx("path",{d:"M-10 368 Q 180 340 320 358 T 660 372 V430 H-10 Z",fill:"#148a48"}),o==="live"&&!Pe?s.jsxs("g",{className:"city-next-mark",transform:`translate(${be.x} ${be.y})`,children:[s.jsx("circle",{r:ce?22:34,className:"city-next-halo"}),ce?null:s.jsx("text",{y:"-40",textAnchor:"middle",children:Fe})]}):null,s.jsx(Oa,{id:"lookout",stage:k("lookout"),fill:I.lookout,next:y==="lookout",rising:Q==="lookout",tapped:B==="lookout",ready:Sn("lookout",d),onOpen:K}),s.jsx(Oa,{id:"observatory",stage:k("observatory"),fill:I.observatory,next:y==="observatory",rising:Q==="observatory",tapped:B==="observatory",ready:Sn("observatory",d),onOpen:K}),s.jsx(Oa,{id:"hollow",stage:k("hollow"),fill:I.hollow,next:y==="hollow",rising:Q==="hollow",tapped:B==="hollow",ready:Sn("hollow",d),onOpen:K}),s.jsx(Oa,{id:"journal",stage:k("journal"),fill:I.journal,next:y==="journal",rising:Q==="journal",tapped:B==="journal",ready:Sn("journal",d),onOpen:K}),s.jsx(Oa,{id:"bench",stage:k("bench"),fill:I.bench,next:y==="bench",rising:Q==="bench",tapped:B==="bench",ready:Sn("bench",d),onOpen:K}),s.jsx(Oa,{id:"lamps",stage:k("lamps"),fill:I.lamps,next:y==="lamps",rising:Q==="lamps",tapped:B==="lamps",ready:Sn("lamps",d),onOpen:K}),s.jsx(Oa,{id:"gate",stage:k("gate"),fill:I.gate,next:y==="gate",rising:Q==="gate",tapped:B==="gate",ready:Sn("gate",d),onOpen:K}),s.jsx(Oa,{id:"porch",stage:k("porch"),fill:I.porch,next:y==="porch",rising:Q==="porch",tapped:B==="porch",ready:Sn("porch",d),onOpen:K}),o==="live"?tt.map(pe=>s.jsx(Q0,{id:pe.id,stage:k(pe.id),next:y===pe.id,rising:Q===pe.id,speaking:ce?!1:re?.id===pe.id||y===pe.id&&!Pe,ack:re?.id===pe.id?re.beat:void 0},`folk-${pe.id}`)):null,o==="live"&&ce?s.jsx("g",{className:"city-easy-tags",pointerEvents:"none",children:Gx.filter(pe=>k(pe)!=="empty"||y===pe).map(pe=>s.jsx(z0,{id:pe},`tag-${pe}`))}):null]}),re&&!ce?s.jsxs("div",{className:"city-beat",role:"status",children:[s.jsxs("span",{className:"city-beat-gems","aria-hidden":!0,children:[s.jsx(Rt,{gem:"lamp",size:"sm"}),s.jsx(Rt,{gem:"star",size:"sm"}),s.jsx(Rt,{gem:"coin",size:"sm"})]}),s.jsx(it,{who:_e.who,size:"sm"}),s.jsxs("div",{children:[s.jsx("strong",{children:re.beat}),s.jsx("span",{children:ye(d)&&re.id==="journal"?"River’s pages":re.title})]})]}):null,se&&!re&&!ce?s.jsxs("div",{className:"city-beat is-home",role:"status",children:[s.jsx(it,{who:"juniper",size:"sm"}),s.jsxs("div",{children:[s.jsx("strong",{children:"Still lit"}),s.jsx("span",{children:"The town held"})]})]}):null,o==="live"?s.jsx("div",{className:"city-legend",children:Pe?s.jsx("p",{className:"eyebrow",children:re?.beat}):ye(d)?s.jsxs(s.Fragment,{children:[s.jsx("p",{className:"city-gift",children:ue}),ee?s.jsx("p",{className:"city-lock-toast",role:"status",children:ee}):null]}):s.jsxs(s.Fragment,{children:[s.jsx("p",{className:"eyebrow",children:"Eden → City of Heaven"}),s.jsx("ol",{className:"city-age-track","aria-label":"Journey ages",children:ud.map(pe=>s.jsx("li",{className:pe===T?"is-now":Tw(pe,T)?"is-done":"",children:Bk[pe]},pe))}),s.jsx("h2",{children:Ty[T]}),s.jsx("p",{className:"city-age-line",children:Fk[T]}),s.jsx("p",{className:"city-gift",children:ue}),ee?s.jsx("p",{className:"city-lock-toast",role:"status",children:ee}):null,s.jsx("p",{className:"city-map-hint",children:S0}),w?s.jsx("p",{className:"city-morrow",children:"Town held. A lamp waits tomorrow."}):null]})}):null,o==="live"&&A?s.jsx(W0,{plotId:A,onClose:()=>X(null),onEnter:N,onNavigate:a}):null]})}const q0=[0,30,60,90,120,150,180,210,240,270,300,330],D0=[{age:"eden",x:58,y:338},{age:"village",x:118,y:300},{age:"town",x:280,y:292},{age:"gold",x:498,y:268},{age:"heaven",x:572,y:36}];function Tw(a,o){return ud.indexOf(a)<=ud.indexOf(o)}function P0({age:a}){return s.jsxs("g",{className:`city-eden is-${a}`,"aria-hidden":!0,children:[s.jsx("ellipse",{className:"city-eden-canopy",cx:"46",cy:"268",rx:"22",ry:"16"}),s.jsx("ellipse",{className:"city-eden-canopy",cx:"78",cy:"258",rx:"18",ry:"14"}),s.jsx("ellipse",{className:"city-eden-canopy",cx:"28",cy:"292",rx:"16",ry:"12"}),s.jsx("circle",{className:"city-eden-fruit",cx:"40",cy:"262",r:"3.2"}),s.jsx("circle",{className:"city-eden-fruit",cx:"70",cy:"250",r:"2.8"}),s.jsx("circle",{className:"city-eden-fruit",cx:"88",cy:"266",r:"2.4"}),s.jsx("path",{className:"city-eden-river",d:"M8 236 C 40 258, 54 300, 36 348 C 22 382, 70 404, 118 396"})]})}function G0({age:a}){const o=Kk[a];return s.jsxs("g",{className:`city-spine is-${a}`,"aria-hidden":!0,children:[s.jsx("path",{className:"city-spine-line",pathLength:1,strokeDasharray:`${o} ${1-o}`,d:"M58 338 C 100 312, 160 300, 280 292 C 380 286, 460 220, 520 80 C 540 48, 560 32, 572 36"}),D0.map(r=>s.jsxs("g",{className:`city-spine-mark ${Tw(r.age,a)?"is-lit":"is-wait"}`,transform:`translate(${r.x} ${r.y})`,children:[s.jsx("circle",{r:"7"}),s.jsx("circle",{r:"3.2",className:"city-spine-core"})]},r.age))]})}function z0({id:a}){const{lines:o,x0:r,y0:h,w:d,h:m}=_x(a),w=Xg[a];return s.jsxs("g",{className:"city-easy-chip",children:[s.jsx("rect",{className:"city-plot-tag-bg",x:r,y:h,width:d,height:m,rx:10}),s.jsx("text",{className:"city-plot-tag",x:w.x,y:w.y,textAnchor:"middle",children:o.map((y,f)=>s.jsx("tspan",{x:w.x,dy:f===0?0:13,children:y},y))})]})}function J0({age:a,easy:o,onOpen:r}){const h=o?"seed":Yk(a),d=o?null:Vk(a),m=h==="city";return s.jsxs("g",{className:`city-heaven is-${a} is-${h}`,"aria-label":d??"Heaven waits on the ridge",role:"button",tabIndex:0,onClick:r,onKeyDown:w=>{(w.key==="Enter"||w.key===" ")&&(w.preventDefault(),r())},children:[h==="seed"||h==="wait"?s.jsx("circle",{className:"city-heaven-seed",cx:"575",cy:"36",r:h==="wait"?7:5}):s.jsx("circle",{className:"city-heaven-glory",cx:"575",cy:"28",r:m?46:28,fill:"url(#city-glory)"}),h==="wait"||h==="rise"?s.jsx("path",{className:"city-heaven-foot",d:"M538 62 h76"}):null,h==="rise"||h==="ridge"||h==="city"?s.jsx("path",{className:"city-heaven-wall",d:"M530 48 l18-22 16 10 14-18 16 12 18-16 16 20 v22 H530 Z",fill:"url(#city-heaven-wall)"}):null,h==="ridge"||h==="city"?s.jsxs(s.Fragment,{children:[s.jsx("path",{className:"city-heaven-gate",d:"M568 58 v-16 a8 10 0 0 1 16 0 v16"}),s.jsx("rect",{className:"city-heaven-tower",x:"538",y:"18",width:"10",height:"22",rx:"1"}),s.jsx("rect",{className:"city-heaven-tower",x:"602",y:"14",width:"10",height:"26",rx:"1"})]}):null,m?s.jsxs(s.Fragment,{children:[s.jsx("path",{className:"city-heaven-spire",d:"M543 18 l5-10 5 10"}),s.jsx("path",{className:"city-heaven-spire",d:"M607 14 l5-12 5 12"})]}):null,d?s.jsx("text",{className:"city-heaven-label",x:Py.x,y:Py.y,textAnchor:"middle",children:d}):null]})}function Oa({id:a,stage:o,fill:r,next:h,rising:d,tapped:m,ready:w,onOpen:y}){const{progress:f}=Je(),g=ye(f),T=o!=="empty"||h||w,b=ru[a],M=o==="empty"&&!h&&!w,E=g&&a==="journal"?"River’s pages":tt.find(F=>F.id===a)?.title??a,G=I0,I=g?56:42,_=Vg(a),Q=!g&&T,ne=Math.max(64,_.length*8+20),se=Math.min(632-ne/2,Math.max(ne/2+8,b.x)),ie=b.y+32;return s.jsxs("g",{className:`city-plot is-${o} ${h?"is-next":""} ${d?"is-rising":""} ${m?"is-tapped":""} ${w?"is-ready":""} ${g?"is-easy-lot":""}`,role:T?"button":void 0,tabIndex:T?0:void 0,"aria-label":`${E} ${o}${w?", upgrade ready":""}${h?", next to build":""}${d?", just rose":""}`,onClick:()=>{T&&y(a)},onKeyDown:F=>{T&&(F.key==="Enter"||F.key===" ")&&(F.preventDefault(),y(a))},children:[T?s.jsx("circle",{className:"city-plot-hit",cx:b.x,cy:b.y,r:I}):null,M?h||w?s.jsxs("g",{className:"city-lot is-staked",transform:`translate(${b.x} ${b.y}) scale(${G})`,children:[s.jsx("ellipse",{rx:"20",ry:"9",className:"city-earth"}),s.jsx("path",{className:"city-timber",d:"M-10 8 V-12 M10 8 V-12 M-12 -2 H12 M-5 8 V-7 M5 8 V-7"})]}):null:s.jsx("g",{transform:`translate(${b.x} ${b.y}) scale(${G}) translate(${-b.x} ${-b.y})`,children:s.jsx(_0,{id:a,stage:o,fill:r,rising:d})}),Q?s.jsxs(s.Fragment,{children:[s.jsx("rect",{className:"city-plot-tag-bg",x:se-ne/2,y:ie-14,width:ne,height:18,rx:7}),s.jsx("text",{className:"city-plot-tag",x:se,y:ie,textAnchor:"middle",children:_})]}):null,d?s.jsxs("g",{className:"city-sparks",transform:`translate(${b.x} ${b.y})`,children:[s.jsx("circle",{r:"28",className:"city-flash"}),q0.map(F=>s.jsx("circle",{className:"city-spark",r:"4.2",style:{"--deg":`${F}deg`}},F))]}):null]})}function _0({id:a,stage:o,fill:r,rising:h}){return a==="hollow"?s.jsx(U0,{stage:o,fill:r,rising:h}):a==="porch"?s.jsx(B0,{stage:o}):a==="bench"?s.jsx(F0,{stage:o,fill:r,rising:h}):a==="observatory"?s.jsx($0,{stage:o,fill:r,rising:h}):a==="gate"?s.jsx(K0,{stage:o,fill:r,rising:h}):a==="lookout"?s.jsx(Y0,{stage:o,fill:r,rising:h}):a==="journal"?s.jsx(V0,{stage:o,fill:r}):s.jsx(X0,{stage:o,fill:r})}function U0({stage:a,fill:o,rising:r}){return a==="scaffold"?s.jsxs(s.Fragment,{children:[s.jsx("ellipse",{cx:"116",cy:"320",rx:"24",ry:"8",className:"city-earth"}),s.jsx("path",{className:"city-timber",d:"M98 318 V288 M134 318 V288 M96 288 H136 M108 318 V272 L116 260 L124 272 V318"})]}):s.jsxs(s.Fragment,{children:[s.jsx("ellipse",{cx:"92",cy:"286",rx:"28",ry:"18",className:"city-canopy"}),s.jsx("ellipse",{cx:"128",cy:"278",rx:"22",ry:"16",className:"city-canopy"}),o>=2?s.jsx("ellipse",{cx:"70",cy:"300",rx:"16",ry:"12",className:`city-canopy ${r&&o===2?"is-sprout":""}`}):null,o>=3?s.jsx("ellipse",{cx:"148",cy:"268",rx:"14",ry:"11",className:`city-canopy ${r&&o===3?"is-sprout":""}`}):null,o>=4?s.jsx("ellipse",{cx:"54",cy:"278",rx:"12",ry:"9",className:`city-canopy ${r&&o===4?"is-sprout":""}`}):null,s.jsx("path",{className:"city-porch",d:"M94 320 h44 l5 8 H90 Z"}),s.jsx("rect",{x:"98",y:"292",width:"36",height:"28",rx:"3"}),s.jsx("path",{className:"city-roof",d:"M94 292 l22-16 22 16"}),a==="lit"?s.jsx("path",{className:"city-roof city-roof-tile",d:"M90 294 l26-20 26 20"}):null,o>=1?s.jsx("rect",{x:"110",y:"300",width:"10",height:"10",rx:"1",className:"city-window"}):null,a==="lit"?s.jsx("circle",{className:"city-lamp",cx:"142",cy:"302",r:"4.5"}):null]})}function B0({stage:a}){return a==="scaffold"?s.jsxs(s.Fragment,{children:[s.jsx("ellipse",{cx:"565",cy:"334",rx:"30",ry:"9",className:"city-earth"}),s.jsx("path",{className:"city-timber",d:"M538 330 V296 M590 330 V296 M536 296 H592 M574 330 V256"}),s.jsx("circle",{className:"city-lamp",cx:"574",cy:"252",r:"6"})]}):s.jsxs(s.Fragment,{children:[s.jsx("path",{className:"city-porch",d:"M532 334 h66 l7 9 H526 Z"}),s.jsx("path",{className:"city-roof",d:"M530 292 l35-22 35 22"}),s.jsx("rect",{x:"536",y:"292",width:"58",height:"42",rx:"3"}),s.jsx("rect",{x:"552",y:"306",width:"12",height:"14",rx:"1",className:"city-window"}),a==="lit"?s.jsx("path",{className:"city-roof city-roof-tile",d:"M526 294 l39-26 39 26"}):null,s.jsx("path",{d:"M574 292 v-36"}),s.jsx("circle",{cx:"574",cy:"252",r:"8",className:"city-lamp"}),a==="lit"?s.jsxs(s.Fragment,{children:[s.jsx("path",{className:"city-porch-rail",d:"M538 328 h54 M538 328 v-8 M564 328 v-8 M592 328 v-8"}),s.jsxs("g",{className:"city-smoke",transform:"translate(574 236)",children:[s.jsx("circle",{className:"city-puff city-puff-a",r:"3",cx:"0",cy:"0"}),s.jsx("circle",{className:"city-puff city-puff-b",r:"2.4",cx:"3",cy:"-8"})]})]}):s.jsxs("g",{className:"city-smoke",transform:"translate(574 236)",children:[s.jsx("circle",{className:"city-puff city-puff-a",r:"3",cx:"0",cy:"0"}),s.jsx("circle",{className:"city-puff city-puff-b",r:"2.4",cx:"3",cy:"-8"})]})]})}function F0({stage:a,fill:o,rising:r}){return a==="scaffold"?s.jsxs(s.Fragment,{children:[s.jsx("ellipse",{cx:"350",cy:"308",rx:"28",ry:"8",className:"city-earth"}),s.jsx("path",{className:"city-timber",d:"M322 304 V270 M378 304 V270 M320 270 H380 M332 304 h36"})]}):s.jsxs(s.Fragment,{children:[s.jsx("path",{className:"city-porch",d:"M318 304 h64 l6 8 H312 Z"}),s.jsx("rect",{x:"318",y:"268",width:"64",height:"36",rx:"3"}),s.jsx("path",{className:"city-roof",d:"M314 268 l34-16 34 16"}),a==="lit"?s.jsx("path",{className:"city-roof city-roof-tile",d:"M310 270 l38-20 38 20"}):null,s.jsx("rect",{x:"338",y:"278",width:"10",height:"12",rx:"1",className:"city-window"}),s.jsx("rect",{x:"354",y:"278",width:"10",height:"12",rx:"1",className:"city-window"}),o>=2?s.jsx("rect",{x:"322",y:"278",width:"8",height:"10",rx:"1",className:`city-window ${r&&o===2?"is-sprout":""}`}):null,o>=3?s.jsx("rect",{x:"370",y:"278",width:"8",height:"10",rx:"1",className:`city-window ${r&&o===3?"is-sprout":""}`}):null,s.jsx("path",{d:"M332 304 h36 M338 304 v-12 h24 v12"}),a==="lit"?s.jsx("circle",{className:"city-lamp",cx:"350",cy:"254",r:"5"}):null]})}function $0({stage:a,fill:o,rising:r}){return a==="scaffold"?s.jsxs(s.Fragment,{children:[s.jsx("ellipse",{cx:"464",cy:"142",rx:"28",ry:"9",className:"city-earth"}),s.jsx("path",{className:"city-timber",d:"M440 140 V112 M488 140 V112 M438 112 H490 M464 140 V88"}),s.jsx("circle",{cx:"464",cy:"86",r:"7",className:"city-timber"})]}):s.jsxs(s.Fragment,{children:[s.jsx("path",{d:"M428 118 a36 28 0 0 1 72 0 v22 h-72 z"}),s.jsx("rect",{x:"454",y:"86",width:"8",height:"16",rx:"1"}),s.jsx("circle",{cx:"464",cy:"108",r:o>=2?7:5,className:`city-window ${r&&o===2?"is-sprout":""}`}),o>=3?s.jsx("circle",{cx:"448",cy:"116",r:"4",className:`city-window ${r&&o===3?"is-sprout":""}`}):null,o>=4||a==="lit"?s.jsx("circle",{cx:"480",cy:"116",r:"4",className:"city-window"}):null,a==="lit"?s.jsxs(s.Fragment,{children:[s.jsx("path",{className:"city-roof city-roof-tile",d:"M432 118 a32 24 0 0 1 64 0"}),s.jsx("circle",{className:"city-lamp",cx:"498",cy:"124",r:"4.5"})]}):null]})}function K0({stage:a,fill:o,rising:r}){return a==="scaffold"?s.jsxs(s.Fragment,{children:[s.jsx("ellipse",{cx:"498",cy:"314",rx:"26",ry:"8",className:"city-earth"}),s.jsx("path",{className:"city-timber",d:"M474 312 V252 M522 312 V252"})]}):s.jsxs(s.Fragment,{children:[s.jsx("path",{d:"M470 250 v62 h56 v-62"}),s.jsx("path",{className:"city-roof",d:"M478 250 a20 28 0 0 1 40 0"}),o>=2?s.jsx("path",{className:`city-roof ${r&&o===2?"is-sprout":""}`,d:"M474 252 a24 30 0 0 1 48 0"}):null,o>=3||a==="lit"?s.jsx("circle",{className:"city-lamp",cx:"474",cy:"248",r:"4.5"}):null,a==="lit"?s.jsxs(s.Fragment,{children:[s.jsx("path",{className:"city-roof city-roof-tile",d:"M476 248 a22 30 0 0 1 44 0"}),s.jsx("circle",{className:"city-lamp",cx:"522",cy:"248",r:"4.5"})]}):null]})}function Y0({stage:a,fill:o,rising:r}){return a==="scaffold"?s.jsxs(s.Fragment,{children:[s.jsx("ellipse",{cx:"520",cy:"140",rx:"18",ry:"7",className:"city-earth"}),s.jsx("path",{className:"city-timber",d:"M520 140 V70 M508 96 H532 M512 118 H528"})]}):s.jsxs(s.Fragment,{children:[s.jsx("path",{d:"M502 86 l18-38 18 38 v52 h-36 z"}),s.jsx("path",{className:"city-roof",d:"M502 86 l18-38 18 38"}),s.jsx("rect",{x:"514",y:"78",width:"12",height:"18",rx:"1",className:"city-window"}),o>=2?s.jsx("path",{d:"M520 48 l14 8 v10 h-8 z",className:`city-flag ${r&&o===2?"is-sprout":""}`}):null,o>=3||a==="lit"?s.jsx("circle",{className:"city-lamp",cx:"538",cy:"70",r:"4.5"}):null,a==="lit"?s.jsx("path",{className:"city-roof city-roof-tile",d:"M498 88 l22-44 22 44"}):null]})}function V0({stage:a,fill:o}){return a==="scaffold"?s.jsxs(s.Fragment,{children:[s.jsx("ellipse",{cx:"288",cy:"290",rx:"26",ry:"8",className:"city-earth"}),s.jsx("path",{className:"city-timber",d:"M266 286 V250 M310 286 V250 M264 250 H312"})]}):s.jsxs(s.Fragment,{children:[s.jsx("path",{className:"city-porch",d:"M260 288 h56 l6 8 H254 Z"}),s.jsx("path",{className:"city-roof",d:"M256 248 l32-20 32 20"}),s.jsx("rect",{x:"262",y:"248",width:"52",height:"40",rx:"3"}),s.jsx("rect",{x:"280",y:"262",width:"16",height:"14",rx:"1",className:"city-window"}),o>=4||a==="lit"?s.jsx("path",{className:"city-roof city-roof-tile",d:"M252 250 l36-24 36 24"}):null,a==="lit"?s.jsx("circle",{className:"city-lamp",cx:"312",cy:"246",r:"4"}):null]})}function X0({stage:a,fill:o}){const r=a!=="empty",h=o>=4||a==="built"||a==="lit",d=o>=8||a==="lit";return s.jsxs(s.Fragment,{children:[r?s.jsxs(s.Fragment,{children:[s.jsx("path",{d:"M214 318 v-28"}),s.jsx("circle",{cx:"214",cy:"286",r:"6",className:"city-lamp"})]}):null,h?s.jsxs(s.Fragment,{children:[s.jsx("path",{d:"M258 322 v-28"}),s.jsx("circle",{cx:"258",cy:"290",r:"6",className:"city-lamp"})]}):null,d?s.jsxs(s.Fragment,{children:[s.jsx("path",{d:"M392 326 v-28"}),s.jsx("circle",{cx:"392",cy:"294",r:"6",className:"city-lamp"})]}):null]})}function Q0({id:a,stage:o,next:r,rising:h,speaking:d,ack:m}){const{progress:w}=Je();if(o==="empty"&&!r)return null;const y=ye(w),f=O0[a],g=y?{x:f.x,y:f.y-zx}:f,T=la(a),b=m?Pk(a,m,ye(w)):T.here,M=b.length>22?`${b.slice(0,20)}…`:b,E=o==="built"||o==="lit";return s.jsx("g",{transform:`translate(${g.x} ${g.y})`,pointerEvents:"none",children:s.jsxs("g",{className:`city-folk is-${o} ${r?"is-next":""} ${h?"is-waving":""} ${E?"is-home":""}`,children:[s.jsx("ellipse",{className:"city-home-pad",rx:E?20:13,ry:E?8:5,cy:"7"}),E?s.jsx("path",{className:"city-porch-rail",d:"M-16 2 H16 M-16 2 v-8 M0 2 v-8 M16 2 v-8"}):null,o==="lit"?s.jsx("circle",{className:"city-lamp",cx:"18",cy:"-4",r:"3.8"}):null,s.jsx("foreignObject",{x:"-22",y:"-50",width:"44",height:"44",overflow:"hidden",children:s.jsx("div",{className:"city-portrait",children:s.jsx(it,{who:T.who,size:"sm"})})}),d?s.jsxs("g",{className:"city-bubble",children:[s.jsx("rect",{x:"-38",y:"-62",width:"76",height:"16",rx:"8"}),s.jsx("text",{y:"-51",textAnchor:"middle",children:M})]}):null]})})}function xw({items:a,onOpen:o,onLater:r,onNotToday:h}){const{progress:d}=Je(),m=ye(d);if(a.length===0)return null;const w=a[0],y=a.length-1;return s.jsxs("section",{className:"recall-offer","aria-label":"A held line is ready",children:[s.jsx("p",{className:"eyebrow",children:m?"A sentence you kept":"A held line is ready"}),s.jsx("h2",{children:m?hn(w.id,w.title):w.title}),s.jsxs("p",{className:"quiet",children:[m?`Up to ${wd} this sitting — not every page.`:`A short sitting — about ${wd}, not the whole journal.`,y>0?` · ${a.length} ready now.`:""]}),s.jsx("button",{type:"button",className:"btn primary",onClick:()=>o(w.id),children:m?Z.rememberSentence:"Dust this off"}),s.jsxs("div",{className:"recall-skip",children:[s.jsx("button",{type:"button",className:"text-link",onClick:r,children:"Later"}),s.jsx("button",{type:"button",className:"text-link",onClick:h,children:"Not today"})]}),m?null:s.jsx("p",{className:"quiet",children:"Later leaves them for this walk. Not today puts them off until morning. No guilt."})]})}function Z0({onNavigate:a,openPlot:o}){const{progress:r,snoozeReviews:h}=Je(),d=Dt(),m=vi(r,d),w=eu(r,d),[y,f]=W.useState(()=>jl(d)),g=Kd(r,d,y),T=tu(r,d),b=Hd(r,m),M=ew(r),E=ye(r),G=LT(r),I=r.streetLinked??[],_=_d(I),Q=!G&&I.length>0,ne=o&&tt.some(A=>A.id===o)?o:null,[se,ie]=W.useState(ne);if(W.useEffect(()=>{ie(ne)},[ne]),E){const A=fd(r),X=TT(r),v=ms(r)===vl&&!qo(r,vl);return s.jsxs("main",{className:"hub is-easy-home","aria-label":"Home",children:[s.jsxs("header",{className:"easy-home-head",children:[s.jsx("p",{className:"eyebrow",children:"Silver City"}),s.jsx("h1",{children:"Play"}),s.jsx("p",{className:"quiet",children:X==="match"?"Match a sentence. Hold the line.":v?"Read Mercy’s story at Story Creek first.":Z.readStoryFirst})]}),s.jsxs("nav",{className:"easy-core","aria-label":"Play",children:[s.jsx("button",{type:"button",className:`btn xl ${X==="learn"?"primary":""}`,onClick:()=>a({name:"learn"}),children:A?Z.learnCta:Z.readStory}),s.jsx("button",{type:"button",className:`btn xl ${X==="match"?"primary":A?"":"is-locked"}`,"aria-disabled":!A,onClick:()=>a({name:"link"}),children:Z.matchCta}),!A&&v?s.jsx("p",{className:"quiet easy-match-lock",children:Z.readStoryFirst}):null,s.jsx("button",{type:"button",className:`btn xl ${X==="hold"?"primary":""}`,onClick:()=>a(Gd(r)),children:Z.saved})]}),s.jsx("button",{type:"button",className:"text-link town-soon",onClick:()=>a({name:"settings"}),children:Z.townSoon})]})}function re(A){ie(A),!A&&o&&a({name:"hub"})}const F=T.kind==="daily"?E?Z.readStory:"Walk today’s trail":T.kind==="vista"?"Stand at the lookout":T.kind==="challenge"?"Open this walk":"Do this next";function B(){if(T.kind==="daily"){a({name:"daily"});return}if(T.kind==="welcome"){a({name:"welcome"});return}if(T.kind==="vista"){a({name:"vista"});return}if(T.challengeId&&T.areaId){a({name:"challenge",areaId:T.areaId,challengeId:T.challengeId});return}T.areaId&&a(Tl(T.areaId,r.completed))}const te=E&&T.kind==="daily"?Z.readStory:T.title,ee=E?T.detail.replace(/\bparable\b/gi,Z.parable).replace(/\bcreed\b/gi,`creed (${Z.creed})`):T.detail;function ge(A){a({name:"journal",focusId:us(A)?.id??A,autoQuiz:!0})}function j(){f(xo(d,g.map(A=>A.id),!0))}function O(){h(g.map(A=>A.id),d),f(xo(d,g.map(A=>A.id),!0))}return s.jsxs("main",{className:"hub is-town is-inhabited","aria-label":"The town",children:[E?null:Q?s.jsxs("section",{className:"next-card do-next","aria-label":"Do this next",children:[s.jsx("p",{className:"eyebrow",children:"Do this next"}),s.jsx("h2",{children:"Tonight’s street"}),s.jsxs("p",{className:"do-next-detail",children:[I.length," of ",zn.length," facts · ",_?.placeTitle??"next place"," tonight"]}),s.jsxs("p",{className:"quiet",children:[zn.length-I.length," facts still wait. One more round, then stop."]}),s.jsx("button",{type:"button",className:"btn primary xl",onClick:()=>a({name:"link"}),children:Z.continueStreet}),s.jsx("button",{type:"button",className:"btn xl",onClick:B,children:F})]}):s.jsxs("section",{className:"next-card do-next","aria-label":"Do this next",children:[s.jsx("p",{className:"eyebrow",children:"Do this next"}),s.jsx("h2",{children:te}),s.jsx("p",{className:"do-next-detail",children:ee}),w>0?s.jsxs("p",{className:"quiet",children:[w," pages due — offered below, not forced."]}):null,s.jsx("button",{type:"button",className:"btn primary xl",onClick:B,children:F})]}),!E&&!G&&!Q?s.jsxs("section",{className:"street-link","aria-label":"Link the street",children:[s.jsxs("div",{className:"card-lead",children:[s.jsx(it,{who:"mercy",size:"sm"}),s.jsxs("div",{children:[s.jsx("p",{className:"eyebrow",children:"Match idea · place · person."}),s.jsx("h2",{children:"Link the street"}),s.jsx("p",{className:"quiet",children:"Idea · place · person · one place per sitting"}),s.jsx("p",{className:"town-line",children:"Snap a claim to its lot and keeper. A sitting is tonight’s street — not all 35 facts at once."}),s.jsx("p",{className:"street-lot-why",children:"Mercy’s pictures at the creek. Silas’s ledger at the square. Juniper’s lamp on the porch — meant to be seen."})]})]}),s.jsx("button",{type:"button",className:"btn gold xl",onClick:()=>a({name:"link"}),children:"Link the street"})]}):null,s.jsx(kw,{onNavigate:a,mindPlot:se,onMindPlot:re}),s.jsx(xw,{items:g.map(A=>({id:A.id,title:us(A.id)?.title??qg(A.id)?.challenge.title??(E?"A sentence you kept":"A held line")})),onOpen:ge,onLater:j,onNotToday:O}),s.jsxs("nav",{className:"town-tools","aria-label":"Town actions",children:[s.jsx("button",{type:"button",className:"btn tiny",onClick:()=>re(b),children:E?Z.manage:"Manage"}),s.jsx("button",{type:"button",className:`btn tiny ${E?"":"gold"}`,"aria-label":E?Z.connectLink:"Link the street",onClick:()=>a({name:"link"}),children:E?Z.matchCta:"Link the street"}),E?null:s.jsx("button",{type:"button",className:"btn tiny",onClick:()=>a({name:"profile"}),children:"Profile"})]}),E?null:s.jsxs("section",{className:`night-watch ${r.defense.cleared?"is-held":""}`,"aria-label":"Night Watch",children:[s.jsx("div",{className:"night-watch-glow","aria-hidden":!0}),s.jsxs("div",{className:"card-lead",children:[s.jsx(it,{who:"juniper",size:"sm"}),s.jsxs("div",{children:[s.jsx("p",{className:"eyebrow",children:r.defense.cleared?"Still watched":"Night Watch"}),s.jsx("h2",{children:"Hold the night"}),s.jsx("p",{className:"quiet",children:"Learn · hold · deploy"}),s.jsxs("p",{className:"town-line",children:["Held lines turn the night toward heaven",r.defense.cleared?` · ${r.defense.cleared} night${r.defense.cleared===1?"":"s"} held.`:"."]}),s.jsx("p",{className:"night-watch-gems","aria-label":"Night abilities",children:ca.map(A=>s.jsx("span",{className:M.includes(A.id)?"is-ready":"is-locked",title:`${A.label} ${Bd[No(A,r)]}`,children:s.jsx(ui,{ability:A.id,size:"sm"})},A.id))})]})]}),s.jsx("button",{type:"button",className:"btn gold xl",onClick:()=>a({name:"defend"}),children:"Hold the night"})]}),E?null:s.jsx(sg,{slot:"hub-banner"}),E?null:s.jsxs("details",{className:"street-drawer",children:[s.jsx("summary",{children:"Homes on the street"}),s.jsx("ol",{className:"city-streets",children:tt.filter(A=>A.areaId||A.id==="porch").map(A=>{const X=A.areaId?jt.find(ae=>ae.id===A.areaId):void 0,L=A.id==="porch"?!0:X?bi(X.id,r.completed):!1,v=X?Al(X,r.completed):m,x=A.id===b,J=la(A.id);return s.jsxs("li",{className:`${L?"":"is-locked"} ${x?"is-next":""}`,children:[s.jsxs("div",{className:"street-name",children:[s.jsx(it,{who:J.who,size:"sm"}),s.jsxs("div",{children:[s.jsx("strong",{children:A.title}),s.jsx("em",{className:"lot-path",children:su[A.id].path}),x?s.jsx("span",{className:"street-next",children:"Next"}):null]})]}),L?null:s.jsx("p",{className:"street-lock",children:qx(A.id,r,E,L,A.areaId?Jo(A.areaId,r.completed,E):"",m)??(E?"This street is locked. Finish the walk before it first.":"This gate is still closed.")}),s.jsx("button",{type:"button",className:"btn tiny",onClick:()=>re(A.id),children:E?Z.manage:"Manage"}),s.jsx("button",{type:"button",className:`btn tiny ${v&&L?"street-rehearse":""} ${x&&L&&!v?"gold":""}`,"aria-label":v&&L?ot.takeaway:void 0,onClick:()=>{if(!L){re(A.id);return}if(v){a(xl(r,A.id==="porch"?"porch":A.areaId));return}a(A.id==="porch"?{name:"daily"}:Tl(A.areaId??"parable-hollow",r.completed))},children:L?v?"Hold the line":x?A.id==="porch"?"Walk next":"Build next":"Enter":"Why locked"})]},A.id)})}),(r.completed.length>0||m)&&s.jsx(iu,{compact:!0})]}),E?null:s.jsx(sg,{slot:"between-districts"}),E||T.kind!=="vista"?null:s.jsx("button",{type:"button",className:"btn gold",onClick:()=>a({name:"vista"}),children:"Stand at the lookout"})]})}function ko({startOpen:a=!1,className:o,children:r}){const h=W.useRef(null);return W.useLayoutEffect(()=>{a&&h.current&&(h.current.open=!0)},[a]),s.jsx("details",{ref:h,className:["saved-tree",o].filter(Boolean).join(" "),children:r})}function To({who:a,label:o,count:r}){return s.jsxs("summary",{className:"saved-tree-summary",children:[a?s.jsx(it,{who:a,size:"sm"}):null,s.jsx("strong",{className:"saved-tree-copy",children:o}),r!==void 0?s.jsx("em",{className:"saved-tree-count",children:r}):null]})}function e2({focusId:a,autoQuiz:o,onNavigate:r}){const{progress:h,recordHeld:d,recordReview:m,recordLessonHold:w,snoozeReviews:y}=Je(),f=ye(h),g=Dt(),{open:T,total:b,percent:M}=I1(h),E=Nt.filter(L=>L.areaId==="daily-trail"),G=jt.map(L=>({area:L,entries:Nt.filter(v=>v.areaId===L.id)})),I=h.held.length,_=uT(h),Q=mT(h),ne=_?` · ${_} pts · ${Q.easy} Easy · ${Q.medium} Medium · ${Q.hard} Hard`:"",[se,ie]=W.useState(()=>jl(g)),F=Kd(h,g,se).map(L=>({trace:L,brief:qt(L.id),entry:Nt.find(v=>v.unlockAfter===L.id)??Nt.find(v=>v.id===L.id)})).filter(L=>L.brief),B=eu(h,g),te=E1(h,g),ee=Nt.find(L=>L.id===a||L.unlockAfter===a),ge=!!(ee&&h.journal.includes(ee.id)),O=(ee?Sg(ee.unlockAfter,ee.id):void 0)?.id??a,A=O?xg(O,za(h,O))??qt(O):void 0;if(!!(o&&A&&(f||!ee||ge))&&A){const L=ee?.areaId??Do(A.id),x=!h.held.includes(A.id)||qd(h,A.id);return s.jsxs("main",{className:`journal is-rehearse ${f?"is-easy-hold-practice":""}`,children:[s.jsxs("button",{type:"button",className:"text-link",onClick:()=>r({name:f?"hub":"journal"}),children:["← ",f?Z.home:"Journal"]}),s.jsxs("section",{className:"rehearse-anchor",children:[s.jsx("p",{className:"eyebrow",children:f?Z.saved:"Takeaway"}),f?null:s.jsx("h1",{children:ee?.title??ot.tapTakeaway}),s.jsx(El,{brief:A,mode:f&&x?"encode":"review",visits:h.memory[A.id]?.reviews??0,kicker:ot.tapTakeaway,onHeld:J=>{if(f&&x){J.clean?(d(A.id),m({id:A.id,pillar:L,kind:"encode",today:g,clean:!0,peeked:!1,elaborated:!1}),w(A.id,!0)):w(A.id,!1),r({name:"hub"});return}m({id:A.id,pillar:L,kind:"recall",today:g,clean:J.clean,peeked:!1,elaborated:!1}),J.clean||w(A.id,!1),r(f?{name:"hub"}:ee?{name:"journal",focusId:ee.id}:{name:"journal"})},onSkip:f?void 0:J=>{J==="not-today"&&y([A.id],g),ie(xo(g,[A.id],!0)),r(ee?{name:"journal",focusId:ee.id}:{name:"journal"})}})]})]})}return s.jsxs("main",{className:`journal ${F.length?"has-due":""} ${f?"is-easy-hold":""}`,children:[f?null:F.length>0?s.jsx("section",{className:"journal-chapter due-chapter",children:s.jsx(xw,{items:F.map(L=>({id:L.trace.id,title:L.entry?.title??L.brief?.claim??"A held line"})),onOpen:L=>{const v=F.find(x=>x.trace.id===L);r({name:"journal",focusId:v?.entry?.id??L,autoQuiz:!0})},onLater:()=>ie(xo(g,F.map(L=>L.trace.id),!0)),onNotToday:()=>{y(F.map(L=>L.trace.id),g),ie(xo(g,F.map(L=>L.trace.id),!0))}})}):f?null:s.jsxs("section",{className:"next-rebuild",children:[s.jsx("p",{className:"eyebrow",children:"Next recommended"}),s.jsx("h2",{children:te.title}),s.jsx("p",{children:te.detail}),s.jsx("button",{type:"button",className:"btn primary",onClick:()=>r(te.go),children:te.cta})]}),s.jsxs("header",{className:"page-head journal-head",children:[s.jsx("p",{className:"eyebrow",children:f?Z.saved:"Evidence Journal"}),s.jsx("h1",{children:f?Z.saved:"What you can still say"}),s.jsx("p",{children:f?`${I} ${Z.savedSub}${B?` · ${B} due to read again`:""}${ne}.`:`${T} of ${b} unsealed · ${M}% of the dossier · ${I} lines held from memory${ne}${B?` · ${B} due to dust off`:""}. Forgetting is why a page comes back.`}),f?null:s.jsxs(s.Fragment,{children:[s.jsx("div",{className:"journal-meter",role:"img","aria-label":f?`${M} percent of journal pages open, ${I} kept, ${B} due`:`${M} percent of the journal unsealed, ${I} held, ${B} due`,children:s.jsx("span",{style:{width:`${M}%`}})}),s.jsxs("p",{className:"journal-split",children:[f?`${T} open · ${b-T} still closed · ${I} kept`:`${T} unsealed · ${b-T} sealed · ${I} held`,B?` · ${B} due this morning`:""]})]})]}),h.learnings.length>0?s.jsxs(ko,{className:"journal-chapter stored-chapter",startOpen:f?!1:!ee||!!a?.startsWith("learn-"),children:[s.jsx(To,{who:"juniper",label:f?Z.saved:"Stored lines",count:h.learnings.length}),s.jsx("p",{className:"quiet saved-tree-lead",children:f?`${Z.savedSub} you can still say.`:"Each learning is its own unit: claim · reason · source · anchor · picture · tool."}),s.jsx("div",{className:"card-grid",children:dw(h).map(L=>{const v=ml(L),x=U1(v),J=h.memory[v.id];return s.jsxs("article",{id:`learn-${v.id}`,className:"dossier is-open is-stored",children:[s.jsxs("p",{className:"eyebrow",children:["Stored · ",v.source]}),v.picture?s.jsx(Rt,{gem:v.picture,size:"sm"}):null,s.jsx("h3",{children:f?hn(v.id,v.claim):v.claim}),bl(h.lessonScore?.[v.id])?s.jsx("p",{className:"quiet",children:bl(h.lessonScore?.[v.id])}):null,f?null:s.jsx("p",{children:v.reason}),s.jsxs("p",{className:"learning-store",children:[v.picture?s.jsx(Rt,{gem:v.picture,size:"sm"}):null,s.jsx("span",{children:f?Cg({...v,tool:x}):`Anchored to ${v.anchor}${v.beat?` · pictured as ${v.beat}`:""}${x?` · deploys as ${x}`:""}`})]}),J?s.jsx("p",{className:"quiet",children:Go(J,g,f)}):null,f?null:s.jsx(Pn,{id:v.id,surface:"journal",why:v.reason,source:v.source})]},v.id)})})]}):null,f?null:s.jsxs(s.Fragment,{children:[s.jsxs(ko,{className:"journal-chapter",startOpen:ee?.areaId==="daily-trail"||h.learnings.length===0&&!ee,children:[s.jsx(To,{who:"juniper",label:f?"Juniper’s pages":"Trail notes",count:E.length}),s.jsx("p",{className:"quiet saved-tree-lead",children:f?"They open when you come back, not only when you finish a street.":"They open when you return, not only when you clear a district."}),s.jsx("div",{className:"card-grid",children:E.map(L=>s.jsx(og,{entry:L,open:h.journal.includes(L.id),focused:a===L.id,mystery:!0,daysWalked:h.dailyDates.length,stars:h.stars[L.unlockAfter]??h.stars[L.id],held:h.held.includes(L.unlockAfter)||h.held.includes(L.id),score:h.lessonScore?.[L.unlockAfter]??h.lessonScore?.[L.id],trace:h.memory[L.unlockAfter]??h.memory[L.id],learning:cs(h,L.unlockAfter)??cs(h,L.id),today:g},L.id))})]}),s.jsxs(ko,{className:"journal-chapter",startOpen:!!(ee&&ee.areaId!=="daily-trail"),children:[s.jsx(To,{who:"river",label:"Places",count:G.reduce((L,v)=>L+v.entries.length,0)}),s.jsx("p",{className:"quiet saved-tree-lead",children:f?"Pages from each street you walked. Tap a street to open it.":"District chapters. Unsealed pages keep the claim."}),G.map(({area:L,entries:v})=>s.jsxs(ko,{className:"saved-tree-nested",startOpen:ee?.areaId===L.id,children:[s.jsx(To,{who:jo(L.id).id,label:L.shortTitle,count:v.length}),s.jsxs("p",{className:"quiet saved-tree-lead",children:[jo(L.id).name," · ",L.subtitle]}),s.jsx("div",{className:"card-grid",children:v.map(x=>s.jsx(og,{entry:x,open:h.journal.includes(x.id),focused:a===x.id,stars:h.stars[x.unlockAfter],held:h.held.includes(x.unlockAfter),score:h.lessonScore?.[x.unlockAfter],trace:h.memory[x.unlockAfter],learning:cs(h,x.unlockAfter),today:g},x.id))})]},L.id))]})]}),f?null:s.jsx(iu,{}),s.jsx("button",{type:"button",className:"btn ghost",onClick:()=>r({name:"hub"}),children:f?Z.home:"Return to the map"})]})}function og({entry:a,open:o,focused:r,mystery:h,daysWalked:d=0,stars:m,held:w,score:y,trace:f,learning:g,today:T}){const{recordHeld:b,recordReview:M,recordLessonHold:E,snoozeReviews:G,progress:I}=Je(),_=ye(I),Q=iw(a.unlockAfter),ne=a.unlockAfter,se=xg(ne,za(I,ne))??Sg(a.unlockAfter,a.id),ie=f?Po(f,T):!1,[re,F]=W.useState(w?"read":"recall"),[B,te]=W.useState(!!(r&&o&&se&&(!w||ie)));return s.jsx("article",{id:a.id,className:`dossier ${o?"is-open":h?"is-mystery":"is-sealed"} ${r?"is-focus":""} ${w?"is-held":""} ${ie?"is-due":""}`,children:o?s.jsxs(s.Fragment,{children:[s.jsx(Jg,{pillar:a.areaId,compact:!0}),s.jsxs("div",{className:"dossier-marks",children:[m?s.jsx(_g,{count:m,compact:!0,label:kl(m)}):null,m?s.jsx("span",{className:"held-mark",children:kl(m)}):null,ie?s.jsx("span",{className:"due-mark",children:"Due this morning"}):null,w&&!ie?s.jsx("span",{className:"held-mark",children:"Held"}):null,bl(y)?s.jsx("span",{className:"held-mark",children:bl(y)}):null]}),f&&!ie?s.jsx("p",{className:"quiet",children:Go(f,T,_)}):null,g?s.jsxs("p",{className:"learning-store",children:[g.picture?s.jsx(Rt,{gem:g.picture,size:"sm"}):null,s.jsx("span",{children:_?Cg({...ml(g),tool:g.toolId?Ga(g.toolId)?.label??g.toolId:void 0}):`Anchored to ${g.anchor}${ml(g).beat?` · pictured as ${ml(g).beat}`:""}${g.toolId?` · deploys as ${Ga(g.toolId)?.label??g.toolId}`:""}`})]}):null,s.jsx("p",{className:"eyebrow",children:a.kicker}),s.jsx("h3",{children:a.title}),se&&re==="recall"&&!B?s.jsxs(s.Fragment,{children:[s.jsx("p",{className:"quiet",children:"Face-down. Rebuild the line — then the page opens."}),s.jsx("button",{type:"button",className:"btn primary",onClick:()=>te(!0),children:_?Z.rememberSentence:ot.tapTakeaway})]}):se&&B?s.jsxs(s.Fragment,{children:[s.jsx("p",{className:"eyebrow",children:_?Z.saved:ot.tapTakeaway}),s.jsx(El,{brief:se,kicker:ie?ot.tapTakeaway:"Journal recall",mode:ie?"review":"encode",visits:f?.reviews??0,onSkip:ie?ee=>{ee==="not-today"&&G([se.id],T),F("read"),te(!1)}:void 0,onHeld:ee=>{ie?(M({id:se.id,pillar:a.areaId,kind:"recall",today:T,clean:ee.clean,peeked:!1,elaborated:!1}),ee.clean||E(se.id,!1)):ee.clean?(b(se.id),E(se.id,!0)):E(se.id,!1),F("read"),te(!1)}}),w?s.jsx("button",{type:"button",className:"text-link",onClick:()=>{te(!1),F("read")},children:"Read the page"}):null]}):s.jsxs(s.Fragment,{children:[a.body.map(ee=>s.jsx("p",{children:ee},ee)),s.jsx("ul",{className:"sources",children:a.sources.map(ee=>s.jsx("li",{children:ee},ee))}),s.jsx(Pn,{id:a.unlockAfter,surface:"journal"}),se?s.jsx("button",{type:"button",className:"btn ghost",onClick:()=>te(!0),children:ot.takeaway}):null]})]}):h?s.jsxs(s.Fragment,{children:[s.jsx("p",{className:"eyebrow",children:_?"A hidden page":"A mystery page"}),s.jsx("h3",{children:_?"A page waits here":"A trail note waits here"}),s.jsx("p",{children:Q?_?`Walk ${Q} morning${Q===1?"":"s"} on Today’s Trail to open this — you have ${d}.`:`Walk ${Q} distinct morning${Q===1?"":"s"} on Today’s Trail to unseal this — you have ${d}.`:_?"Come back for Daily Trail mornings to open this page.":"Return for Daily Trail mornings to unseal this page."}),s.jsx("p",{className:"quiet",children:"The trail waits. Nothing here is taken back."})]}):s.jsxs(s.Fragment,{children:[s.jsx("p",{className:"eyebrow",children:_?"Still closed":"Sealed"}),s.jsx("h3",{children:"A card waits here"}),s.jsx("p",{children:_?"Finish the matching walk to open this page.":"Complete the matching challenge to unseal this page."})]})})}function t2({onNavigate:a}){const{progress:o,saveMeta:r,importSaveText:h,reset:d,setTheme:m,setEasyMode:w}=Je(),y=ye(o),f=E0(),g=W.useRef(null),[T,b]=W.useState(""),[M,E]=W.useState(""),[G,I]=W.useState(""),_=o.held.length,Q=o.journal.length,ne=Wk(Qt),se=r.savedAt?`Progress saved on this device · ${ie(r.savedAt)}`:"Progress saved on this device as you walk";function ie(j){const O=new Date(j);return Number.isNaN(O.getTime())?"on this device":O.toLocaleString(void 0,{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})}function re(){const j=Wo(o),O=new Blob([JSON.stringify(j,null,2)],{type:"application/json"}),A=`silver-city-save-${Dt()}.json`,X=URL.createObjectURL(O),L=document.createElement("a");L.href=X,L.download=A,L.click(),URL.revokeObjectURL(X),E(`Downloaded ${A}`)}async function F(){const j=S1(Wo(o));I(j);try{await navigator.clipboard.writeText(j),E("Share code copied. Paste it under Import on the other device.")}catch{E("Copy failed — the code is in the box below. Select and copy it.")}}function B(j){const O=h(j);if(!O.ok){E(O.error);return}b(""),E("Imported. Stars, journal, and Daily marks are on this device."),a({name:"hub"})}function te(j){if(!j)return;if(j.size>Qd){E("That file is too large to be a Silver City save.");return}if(!window.confirm("Replace the save on this device with the imported one? Anyone with this file can overwrite local progress."))return;const A=new FileReader;A.onload=()=>{B(String(A.result??""))},A.readAsText(j)}function ee(){window.confirm(y?"Reset this walk? That clears saved sentences and connections on this device, then starts Easy at Mercy’s Story Creek line.":"Reset progress? This wipes the save on this device — all held lines, journal pages, Night Watch, and mind-map links — and returns to the start. A backup of this save stays until the next import or reset.")&&(d(),a({name:"welcome"}))}function ge(j){N0(j)}return s.jsxs("main",{className:"settings page",children:[s.jsxs("button",{type:"button",className:"text-link",onClick:()=>a({name:"hub"}),children:["← ",y?Z.home:"The town"]}),s.jsxs("header",{className:"page-head",children:[s.jsx("p",{className:"eyebrow",children:y?`Settings · ${Qt}`:`Settings · V0 · ${Qt}`}),s.jsx("h1",{children:"Progress & support"}),s.jsx("p",{children:se})]}),s.jsxs("section",{className:"settings-card",children:[s.jsx("p",{className:"eyebrow",children:"Reading"}),s.jsx("p",{children:y?s.jsxs(s.Fragment,{children:[Z.claimTeach," Easy mode then says main idea. Shorter sentences and bigger taps. You can switch anytime."]}):s.jsx(s.Fragment,{children:"A claim is the main idea we hold to be true. Easy mode teaches that once, then buttons say main idea. Shorter sentences and bigger taps. The main ideas stay the same — the words around them get plainer."})}),o.easyMode?s.jsx("p",{className:"teach-chip",role:"note",children:Z.mainIdeaTeach}):null,s.jsxs("div",{className:"settings-actions",children:[s.jsx("button",{type:"button",className:`btn ${o.easyMode?"primary":""}`,"aria-pressed":o.easyMode,onClick:()=>w(!0),children:"Easy"}),s.jsx("button",{type:"button",className:`btn ${o.easyMode?"":"primary"}`,"aria-pressed":!o.easyMode,onClick:()=>w(!1),children:"Hard"})]})]}),s.jsxs("section",{className:"settings-card",children:[s.jsx("p",{className:"eyebrow",children:"This device"}),y?s.jsx("p",{children:"This walk is saved on this device."}):s.jsxs("p",{children:["Schema v",r.schemaVersion||oa," · app"," ",Qt," · ",Ik]}),s.jsx("p",{className:"quiet",children:y?`${_} ${Z.savedSub} · ${Q} pages · ${o.completed.length} walks`:`${_} held lines · ${Q} journal pages · ${o.completed.length} district walks · streak ${o.streak} · local only (no cloud login)`}),y?null:s.jsx("p",{className:"quiet",children:"Offline-first. The same key keeps working across updates; a schema version migrates old saves instead of wiping them."})]}),s.jsxs("details",{className:y?"settings-advanced":"settings-flat",children:[s.jsx("summary",{children:"More"}),y?s.jsxs("section",{className:"settings-card","aria-label":"Town",children:[s.jsx("p",{className:"eyebrow",children:"Town"}),s.jsxs("p",{children:[Z.townSoon," — the map waits until the game is right. Hard still has the streets."]})]}):null,s.jsxs("section",{className:"settings-card",children:[s.jsx("p",{className:"eyebrow",children:"You"}),s.jsx("p",{children:y?`What River has opened — ${Z.saved}, places, people, ${Z.uses}, and ${Z.connections}.`:"River’s unlocks in one place — held ideas, places, people, tools, and mind-map links."}),s.jsx("div",{className:"settings-actions",children:s.jsx("button",{type:"button",className:"btn primary",onClick:()=>a({name:"profile"}),children:"Open Profile"})})]}),s.jsxs("section",{className:"settings-card whats-new","aria-label":"What’s new",children:[s.jsxs("p",{className:"eyebrow",children:["What’s new · ",Qt]}),s.jsx("h2",{children:ne.title}),s.jsx("p",{className:"quiet",children:ne.when}),s.jsx("ul",{className:"whats-new-list",children:ne.items.map(j=>s.jsx("li",{children:j},j))}),gl.length>1&&!y?s.jsxs("details",{className:"whats-new-more",children:[s.jsx("summary",{children:"Earlier drops"}),gl.filter(j=>j.version!==Qt).map(j=>s.jsxs("div",{className:"whats-new-past",children:[s.jsxs("p",{className:"eyebrow",children:[j.version," · ",j.title]}),s.jsx("ul",{className:"whats-new-list",children:j.items.map(O=>s.jsx("li",{children:O},O))})]},j.version))]}):null]}),s.jsxs("section",{className:"settings-card",children:[s.jsx("p",{className:"eyebrow",children:"Look"}),s.jsx("p",{children:"Candy is the default. Switch anytime — the walk and the save stay."}),s.jsx("div",{className:"settings-actions theme-picks",children:["candy","dusk","parchment"].map(j=>s.jsx("button",{type:"button",className:`btn ${o.theme===j?"primary":""}`,"aria-pressed":o.theme===j,onClick:()=>m(j),children:a2(j)},j))})]}),s.jsxs("section",{className:"settings-card",children:[s.jsx("p",{className:"eyebrow",children:"Move to another device"}),s.jsxs("p",{children:["Export a JSON file, or copy a share code. Import ",s.jsx("strong",{children:"replaces"})," the save on this device (a backup of the old one is kept). Treat a share code like a secret for that save — anyone who imports it takes over this walk."]}),s.jsxs("div",{className:"settings-actions",children:[s.jsx("button",{type:"button",className:"btn primary",onClick:re,children:"Export JSON"}),s.jsx("button",{type:"button",className:"btn gold",onClick:()=>{F()},children:"Copy share code"}),s.jsx("button",{type:"button",className:"btn",onClick:()=>g.current?.click(),children:"Import file"})]}),s.jsx("input",{ref:g,type:"file",accept:"application/json,.json,text/plain",hidden:!0,onChange:j=>{te(j.target.files?.[0]),j.currentTarget.value=""}}),s.jsxs("label",{className:"settings-paste",children:["Paste a share code or JSON",s.jsx("textarea",{value:T,rows:4,spellCheck:!1,placeholder:"SC1.… or a silver-city-save JSON file",onChange:j=>b(j.target.value)})]}),s.jsx("button",{type:"button",className:"btn primary",disabled:!T.trim(),onClick:()=>{window.confirm("Replace the save on this device with the imported one?")&&B(T)},children:"Import pasted save"}),G?s.jsx("textarea",{className:"share-code-out",readOnly:!0,rows:3,value:G,onFocus:j=>j.currentTarget.select()}):null,M?s.jsx("p",{className:"settings-msg",children:M}):null]}),s.jsxs("section",{className:"settings-card",children:[s.jsx("p",{className:"eyebrow",children:"Ad placeholders"}),s.jsxs("p",{children:["Playtest default is off. Placeholders are labeled slots for a later network — they never cover Keep/Toss, the takeaway step, or"," ",y?Z.saved:"Journal","."]}),y?null:s.jsxs("p",{className:"quiet",children:["Product flag ",s.jsx("code",{children:"adsEnabled"})," is ","off"," ","in config. This toggle is a this-device override."]}),s.jsxs("div",{className:"settings-actions",children:[s.jsx("button",{type:"button",className:`btn ${f==="off"||f==="default"&&!ou?"primary":""}`,onClick:()=>ge("off"),children:"Hide slots"}),s.jsx("button",{type:"button",className:`btn ${n2(f)?"gold":""}`,onClick:()=>ge("on"),children:"Show placeholders"})]})]})]}),s.jsxs("details",{className:"settings-card settings-danger",children:[s.jsx("summary",{children:"Danger zone · wipe this device"}),s.jsx("p",{className:"eyebrow",children:"Reset progress"}),s.jsx("p",{children:y?"Wipe this walk on this device — saved sentences and connections — and start Easy at Mercy’s Story Creek line. Export first if you want it back.":"Wipe ALL progress on this device — held lines, journal, Night Watch, and mind-map links — and return to the start. Export first if you want the walk back. This is not on the town screen."}),s.jsx("button",{type:"button",className:"btn",onClick:ee,children:"Reset progress"})]})]})}function n2(a){return a==="on"?!0:a==="off"?!1:ou}function a2(a){return a==="dusk"?"Dusk town":a==="parchment"?"Clean parchment":"Candy"}const s2="Night Watch",i2="Hold the night",o2="Plant love. Turn cheap lines toward heaven.";function r2({onNavigate:a}){const{progress:o,recordNight:r,markMiss:h}=Je(),d=ye(o),m=Dt(),w=qt(Gy),y=Kx(o),f=ew(o),[g,T]=W.useState(()=>f[0]??"love"),b=!0,M=W.useRef(null),[E,G]=W.useState({w:640,h:420}),[I,_]=W.useState(null),Q=!1,[ne,se]=W.useState(d?"wave":"plant"),[ie,re]=W.useState(()=>[...y]),[F,B]=W.useState(ai),[te,ee]=W.useState([]),[ge,j]=W.useState(0),[O,A]=W.useState(null),[X,L]=W.useState([]),[v,x]=W.useState([]),[J,ae]=W.useState(0),[R,k]=W.useState(!1),[N,K]=W.useState(!1),[Y,he]=W.useState(!1),[we,Te]=W.useState(!1),le=W.useRef(0),{juiceDone:be,afterJuice:Fe}=Cl(),ue=W.useRef(!1),Pe=W.useRef(Fe),_e=W.useRef(h);Pe.current=Fe,_e.current=h;const ce=W.useRef({raiders:[],spawned:0,downed:0,hearts:ai,planted:ie,cool:{},playing:!1,spawnNow:!1});W.useEffect(()=>{ce.current.planted=ie},[ie]),W.useEffect(()=>{!be||ue.current||!w||(ue.current=!0,r(m))},[be,w,r,m]),W.useEffect(()=>{if(ne!=="wave")return;ce.current.playing=!0,ce.current.raiders=[],ce.current.spawned=0,ce.current.downed=0,ce.current.hearts=ai,ce.current.cool={},ce.current.spawnNow=!1,ee([]),j(0),B(ai);let oe=performance.now(),je=0,De=0;const xt=tn=>{if(!ce.current.playing)return;const dt=Math.min(.05,(tn-oe)/1e3);oe=tn,je+=dt;const gt=ce.current.raiders.find(Ne=>!Ne.turned)?.id,En=ce.current.raiders.map(Ne=>{if(Ne.turned){const gs=Ne.turned?Ga(Ne.turned):void 0,lt=gs?No(gs,o):1;return{...Ne,heavenT:(Ne.heavenT??0)+s1(lt,d)*dt}}return d&&Ne.id===gt?{...Ne}:{...Ne,t:Ne.t+Zg(d)*dt}});let un=0;const rt=En.filter(Ne=>Ne.turned?!(d||(Ne.heavenT??0)>=1):Ne.t<1?!0:(un+=1,!1));un&&(ce.current.hearts=Math.max(0,ce.current.hearts-un),B(ce.current.hearts),le.current=0,ae(0),K(!0),window.setTimeout(()=>K(!1),220),_e.current(Gy));const Ut=d&&rt.some(Ne=>!Ne.turned);if(ce.current.spawned<ii&&!Ut&&(ce.current.spawnNow||je>=t1(d)||d&&ce.current.spawned===0)){ce.current.spawnNow=!1,je=0;const Ne=ce.current.spawned,ha=$x(o.defense.cleared,Ne);rt.push({id:Ne,t:d?.42:0,text:ha.text,kind:ha.kind}),ce.current.spawned+=1}if(ce.current.raiders=rt,ee(rt),ce.current.hearts<=0){ce.current.playing=!1,se("lost");return}if(e1(d,ce.current.downed,ce.current.spawned,rt.length)){ce.current.playing=!1,he(!0),Pe.current();return}De=requestAnimationFrame(xt)};return De=requestAnimationFrame(xt),()=>{ce.current.playing=!1,cancelAnimationFrame(De)}},[ne,d,o.defense.cleared]),W.useEffect(()=>{const oe=M.current;if(!oe)return;const je=()=>{const xt=oe.getBoundingClientRect();G({w:xt.width,h:xt.height})};je();const De=new ResizeObserver(je);return De.observe(oe),()=>De.disconnect()},[ne,b,d]);function pe(oe){ne==="plant"&&re(je=>je.includes(oe)?je.length<=1?je:je.filter(De=>De!==oe):[...je,oe])}function Ae(oe){return oe.turned&&oe.from?a1(oe.from,oe.heavenT??0):n1(oe.t)}function Oe(oe){if(ne!=="wave"||Y)return;const je=performance.now(),De=sd(oe,o),xt=Vx(De);if((ce.current.cool[oe]??0)+xt>je)return;const tn=ad[oe],dt=f.includes(g)?g:"love",gt=od(dt,De,o);let En=null,un=gt;for(const lt of ce.current.raiders){if(lt.turned)continue;const Mn=rd(tn,Ae(lt));Mn<=un&&(En=lt,un=Mn)}if(ce.current.cool[oe]=je,A(oe),Te(!0),window.setTimeout(()=>A(null),280),window.setTimeout(()=>Te(!1),220),!En)return;const rt=Ae(En),Ut=Zx(d,dt,En.kind),Ne=Yy(o,dt);le.current+=1;const ha=le.current;ae(ha),k(!0),window.setTimeout(()=>k(!1),160);const gs={key:je,x:rt.x,y:rt.y,line:d?Ut==="match"?"Yes":"Try Love":Ut==="match"?Ne?Ne.claim:`${id[dt]} matches`:`${id[dt]} is weak here`,combo:ha};L(lt=>[...lt.slice(-3),{key:je,from:{x:tn.x,y:tn.y-16},to:rt}]),x(lt=>[...lt.slice(-3),gs]),window.setTimeout(()=>{L(lt=>lt.filter(Mn=>Mn.key!==je))},280),window.setTimeout(()=>{x(lt=>lt.filter(Mn=>Mn.key!==je))},620),Ut==="match"?(ce.current.raiders=ce.current.raiders.map(lt=>lt.id===En.id?{...lt,turned:dt,from:rt,heavenT:0,text:"Toward heaven"}:lt),ce.current.downed+=1,d&&(ce.current.spawnNow=!0)):ce.current.raiders=ce.current.raiders.map(lt=>lt.id===En.id?{...lt,t:Math.max(0,lt.t-.22),text:`${id[dt]} is weak`}:lt),ee(ce.current.raiders),j(ce.current.downed)}function ht(){if(ne!=="wave"||Y)return;let oe=null,je=1/0;for(const De of ce.current.planted){const xt=ad[De],tn=od(f.includes(g)?g:"love",sd(De,o),o);for(const dt of ce.current.raiders){if(dt.turned)continue;const gt=rd(xt,Ae(dt));gt<=tn&&gt<je&&(je=gt,oe=De)}}oe?Oe(oe):d&&_(Z.nightMiss)}function yt(){se(d?"wave":"plant"),he(!1),ee([]),j(0),B(ai),le.current=0,ae(0),L([]),x([]),ue.current=!1}if(!w)return s.jsx("main",{className:"page",children:s.jsx("p",{children:"The night road is still being staked."})});function _t(oe,je){const De=Math.min(E.w/640,E.h/420);return{left:(E.w-640*De)/2+oe*De,top:(E.h-420*De)/2+je*De}}const Lt=be&&Y,nt=Xx(d,ne,Y),Pt=nt?Qx(te):void 0,Tt=Pt?_t(Ae(Pt).x,Ae(Pt).y):null;return s.jsxs("main",{className:`defend-page is-puzzle  ${Y?"is-win":""} ${R?"is-shake":""} ${N?"is-leak":""} ${we?"is-firing":""} ${d?"is-easy-watch":""} ${nt?"is-easy-tap":""}`,"aria-label":s2,children:[Lt?s.jsxs(s.Fragment,{children:[s.jsxs("article",{className:"stored-line","aria-label":d?"How to use Love":"Love tip",children:[s.jsx("p",{className:"eyebrow",children:d?"How to use Love":"Love tip"}),s.jsx("p",{className:"stored-claim",children:My(d)}),d?s.jsx("p",{className:"quiet",children:Z.nightTap}):null]}),s.jsx(Hl,{who:"juniper",line:d?"Night held. Six taps.":"Night held. The road turned toward heaven.",action:d?Z.home:"See the town",onGo:()=>a({name:"hub"})})]}):s.jsxs(s.Fragment,{children:[s.jsx("p",{className:"eyebrow",children:d?"Night Watch":i2}),s.jsx("h1",{className:"defend-title",children:d?Z.nightLead:ne==="wave"?"Turn them toward heaven.":o2}),s.jsxs("div",{className:`defend-frame ${R?"is-shake":""} ${Y?"is-clear":""}`,children:[s.jsxs("p",{className:"defend-hud","aria-live":"polite",children:[s.jsx("span",{className:"defend-hearts",children:Array.from({length:ai},(oe,je)=>s.jsx("span",{className:je<F?"is-on":"",children:"♥"},je))}),s.jsx("span",{className:`defend-count ${!d&&J>1?"is-combo":""}`,children:ne==="wave"?d?`TAP ${ge}/${ii}`:J>1?`×${J}  ${ge}/${ii}`:`${ge}/${ii} · TAP`:`${ie.length} lamp${ie.length===1?"":"s"}`})]}),s.jsxs("svg",{ref:M,className:`defend-board ${R?"is-shake":""} ${Y?"is-clear":""}`,viewBox:"0 0 640 420",preserveAspectRatio:"xMidYMid meet",role:"img","aria-label":"Night road through Silver City",onClick:()=>{ne==="wave"&&ht()},children:[s.jsxs("defs",{children:[s.jsxs("linearGradient",{id:"defend-dusk",x1:"0",y1:"0",x2:"0",y2:"1",children:[s.jsx("stop",{offset:"0%",stopColor:"var(--city-sky-0)"}),s.jsx("stop",{offset:"22%",stopColor:"var(--city-sky-1)"}),s.jsx("stop",{offset:"52%",stopColor:"var(--city-sky-2)"}),s.jsx("stop",{offset:"100%",stopColor:"var(--city-sky-3)"})]}),s.jsxs("linearGradient",{id:"defend-ridge",x1:"0",y1:"0",x2:"0",y2:"1",children:[s.jsx("stop",{offset:"0%",stopColor:"var(--city-ridge-0)"}),s.jsx("stop",{offset:"100%",stopColor:"var(--city-ridge-1)"})]}),s.jsxs("linearGradient",{id:"defend-wood",x1:"0",y1:"0",x2:"0",y2:"1",children:[s.jsx("stop",{offset:"0%",stopColor:"#ffd24a"}),s.jsx("stop",{offset:"100%",stopColor:"#ff9f1a"})]}),s.jsxs("linearGradient",{id:"defend-gold-roof",x1:"0",y1:"0",x2:"0",y2:"1",children:[s.jsx("stop",{offset:"0%",stopColor:"#fff6b8"}),s.jsx("stop",{offset:"100%",stopColor:"#ff9f1a"})]}),s.jsxs("radialGradient",{id:"defend-moon-glow",cx:"50%",cy:"50%",r:"50%",children:[s.jsx("stop",{offset:"0%",stopColor:"#fff6d4",stopOpacity:"1"}),s.jsx("stop",{offset:"55%",stopColor:"#ffcc33",stopOpacity:"0.4"}),s.jsx("stop",{offset:"100%",stopColor:"#ff5a7a",stopOpacity:"0"})]}),s.jsxs("radialGradient",{id:"defend-pool",cx:"50%",cy:"50%",r:"50%",children:[s.jsx("stop",{offset:"0%",stopColor:"#ffcc33",stopOpacity:"0.75"}),s.jsx("stop",{offset:"100%",stopColor:"#ff5a7a",stopOpacity:"0"})]}),s.jsx("clipPath",{id:"defend-face-clip",clipPathUnits:"objectBoundingBox",children:s.jsx("circle",{cx:"0.5",cy:"0.5",r:"0.36"})}),s.jsxs("filter",{id:"defend-glow",x:"-50%",y:"-50%",width:"200%",height:"200%",children:[s.jsx("feGaussianBlur",{stdDeviation:"4",result:"b"}),s.jsxs("feMerge",{children:[s.jsx("feMergeNode",{in:"b"}),s.jsx("feMergeNode",{in:"SourceGraphic"})]})]})]}),s.jsx("rect",{width:"640",height:"420",fill:"url(#defend-dusk)"}),s.jsx("ellipse",{cx:"320",cy:"198",rx:"280",ry:"28",fill:"#ffcc33",opacity:"0.28"}),s.jsx("circle",{cx:"548",cy:"48",r:"32",fill:"url(#defend-moon-glow)"}),s.jsx("circle",{cx:"548",cy:"48",r:"9",fill:"#fff6d8"}),s.jsxs("g",{className:"defend-stars",children:[s.jsx("circle",{cx:"72",cy:"42",r:"1.6"}),s.jsx("circle",{cx:"118",cy:"28",r:"1.2"}),s.jsx("circle",{cx:"510",cy:"36",r:"1.5"}),s.jsx("circle",{cx:"430",cy:"22",r:"1.3"}),s.jsx("circle",{cx:"300",cy:"34",r:"1.1"}),s.jsx("circle",{cx:"196",cy:"50",r:"1.1"}),s.jsx("circle",{cx:"248",cy:"20",r:"0.9"}),s.jsx("circle",{cx:"390",cy:"54",r:"1.2"}),s.jsx("circle",{cx:"88",cy:"68",r:"0.8"})]}),s.jsx("path",{className:"defend-ridge",d:"M-20 210 L80 120 160 168 250 96 340 150 430 78 520 130 660 70 V230 H-20 Z",fill:"url(#defend-ridge)",opacity:"0.92"}),s.jsx("path",{d:"M-20 248 L40 200 120 228 210 176 300 214 410 168 500 206 660 150 V430 H-20 Z",fill:"#3dcc7a",opacity:"0.55"}),s.jsxs("g",{className:"defend-windows",children:[s.jsx("circle",{cx:"156",cy:"214",r:"1.8"}),s.jsx("circle",{cx:"248",cy:"198",r:"1.5"}),s.jsx("circle",{cx:"364",cy:"188",r:"1.6"}),s.jsx("circle",{cx:"476",cy:"196",r:"1.4"})]}),s.jsx("ellipse",{className:"defend-canopy",cx:"96",cy:"268",rx:"28",ry:"16"}),s.jsx("ellipse",{className:"defend-canopy",cx:"214",cy:"252",rx:"22",ry:"13"}),s.jsx("ellipse",{className:"defend-canopy",cx:"402",cy:"246",rx:"24",ry:"14"}),s.jsx("ellipse",{className:"defend-canopy",cx:"528",cy:"258",rx:"20",ry:"12"}),s.jsx("path",{className:"defend-road-bed",d:"M70 310 C 140 300, 200 280, 280 292 C 360 304, 430 286, 560 300"}),s.jsx("path",{className:"defend-road",d:"M70 310 C 140 300, 200 280, 280 292 C 360 304, 430 286, 560 300"}),s.jsx("path",{className:"defend-road-shine",d:"M70 310 C 140 300, 200 280, 280 292 C 360 304, 430 286, 560 300"}),s.jsx("path",{className:"defend-heaven-path",d:"M280 292 C 400 210, 500 90, 572 36"}),s.jsxs("g",{className:"defend-heaven",transform:`translate(${vd.x} ${vd.y})`,children:[s.jsx("circle",{className:"defend-heaven-glow",r:"36"}),s.jsx("path",{className:"defend-heaven-wall",d:"M-28 14 l12-16 10 8 8-12 10 8 10-10 10 14 v16 H-28 Z"}),s.jsx("path",{className:"defend-heaven-gate",d:"M-6 22 v-12 a6 8 0 0 1 12 0 v12"}),s.jsx("text",{className:"defend-heaven-label",y:"-22",textAnchor:"middle",children:"City of Heaven"})]}),s.jsx("path",{d:"M-10 368 Q 180 340 320 358 T 660 372 V430 H-10 Z",fill:"#148a48"}),s.jsxs("g",{className:"defend-porch",transform:"translate(564 292)",children:[s.jsx("path",{d:"M-20 22 h40 l5 7 H-25 Z"}),s.jsx("rect",{x:"-16",y:"-4",width:"32",height:"26",rx:"2"}),s.jsx("rect",{className:"defend-porch-window",x:"-5",y:"4",width:"10",height:"9",rx:"1"})]}),nt?null:s.jsxs("g",{className:"defend-gate",transform:`translate(${oi[0].x} ${oi[0].y})`,children:[s.jsx("path",{d:"M-10 6 V-16 M10 6 V-16"}),s.jsx("path",{d:"M-12 -16 H12"})]}),nt?null:y.map(oe=>{const je=ad[oe],De=ie.includes(oe),xt=sd(oe,o),tn=tt.find(gt=>gt.id===oe),dt=ne==="wave"&&De&&te.some(gt=>!gt.turned&&rd(je,Ae(gt))<=od(f.includes(g)?g:"love",xt,o));return s.jsxs("g",{"data-person-node":"pad",className:`defend-pad is-${xt} ${De?"is-planted":""} ${dt?"is-hot":""} ${O===oe?"is-flash":""}`,transform:`translate(${je.x} ${je.y})`,role:"button",tabIndex:0,"aria-label":ne==="plant"?`${De?"Pull":"Plant"} lamp at ${tn?.title??oe}`:`Fire ${tn?.title??oe}`,onClick:gt=>{gt.stopPropagation(),ne==="plant"?pe(oe):Oe(oe)},onKeyDown:gt=>{(gt.key==="Enter"||gt.key===" ")&&(gt.preventDefault(),ne==="plant"?pe(oe):Oe(oe))},children:[s.jsx("circle",{className:"defend-hit",r:"38"}),s.jsx("ellipse",{className:"defend-earth",cx:"0",cy:"10",rx:"15",ry:"6"}),De?s.jsxs(s.Fragment,{children:[s.jsx("ellipse",{className:"defend-pool",cx:"0",cy:"12",rx:dt?30:20,ry:dt?11:7}),s.jsx("path",{className:"defend-post",d:"M-2.4 10 V-18 H2.4 V10 Z",fill:"url(#defend-wood)"}),s.jsx("path",{className:"defend-lantern-roof",d:"M-8 -18 l8 -7 8 7 Z",fill:"url(#defend-gold-roof)"}),s.jsx("rect",{className:"defend-lantern",x:"-6.5",y:"-18",width:"13",height:"11",rx:"2"}),s.jsx("circle",{className:"defend-lamp",cx:"0",cy:"-13",r:"4.6"}),dt?s.jsx("circle",{className:"defend-hot-halo",r:"27"}):null]}):s.jsxs(s.Fragment,{children:[s.jsx("circle",{className:"defend-ring",r:"16"}),s.jsx("path",{className:"defend-post is-empty",d:"M-1.6 8 V-8 H1.6 V8 Z"})]})]},oe)}),X.map(oe=>s.jsxs("g",{className:"defend-shot",children:[s.jsx("line",{className:"defend-beam",x1:oe.from.x,y1:oe.from.y,x2:oe.to.x,y2:oe.to.y}),s.jsx("circle",{className:"defend-impact",cx:oe.to.x,cy:oe.to.y,r:"22"})]},oe.key)),d?null:te.map(oe=>{const je=Ae(oe);return s.jsxs("g",{className:`defend-raider ${oe.turned?"is-turned":""}`,transform:`translate(${je.x} ${je.y})`,children:[s.jsx("ellipse",{className:"defend-raider-shadow",cy:12,rx:13,ry:4.6}),s.jsx("image",{className:"defend-raider-face",href:rx(oe.kind),x:-18,y:-24,width:36,height:36,clipPath:"url(#defend-face-clip)"}),oe.turned?s.jsxs("g",{className:"defend-heaven-cheer","aria-hidden":!0,children:[s.jsx("circle",{className:"defend-cheer-spark",cx:"-10",cy:"-18",r:"2.2"}),s.jsx("circle",{className:"defend-cheer-spark is-2",cx:"12",cy:"-20",r:"1.8"}),s.jsx("circle",{className:"defend-cheer-spark is-3",cx:"2",cy:"-26",r:"1.4"})]}):null,s.jsxs("g",{className:"defend-raider-call",children:[s.jsx("rect",{x:-40,y:-42,width:80,height:28,rx:"8"}),s.jsx("text",{className:"defend-raider-kind",y:-32,textAnchor:"middle",children:mx[oe.kind]}),s.jsx("text",{y:-20,textAnchor:"middle",children:oe.text})]})]},oe.id)}),v.map(oe=>s.jsxs("g",{className:"defend-blast",transform:`translate(${oe.x} ${oe.y})`,children:[s.jsx("circle",{className:"defend-blast-ring",r:"26"}),s.jsx("circle",{className:"defend-blast-core",r:"10"}),s.jsx("path",{className:"defend-shard",d:"M-2 -4 L4 -28 L8 -6 Z"}),s.jsx("path",{className:"defend-shard is-2",d:"M4 2 L28 8 L8 8 Z"}),s.jsx("path",{className:"defend-shard is-3",d:"M-4 4 L-26 16 L-8 8 Z"}),s.jsx("path",{className:"defend-shard is-4",d:"M2 6 L10 26 L-2 10 Z"}),!d&&oe.combo>1?s.jsxs("text",{className:"defend-combo-pop",y:"-34",textAnchor:"middle",children:["×",oe.combo]}):null,s.jsx("text",{className:"defend-blast-line",y:"28",textAnchor:"middle",children:oe.line})]},oe.key))]}),nt&&Pt&&Tt?s.jsx("div",{className:"easy-walkers","aria-label":"Tap the walking person",children:s.jsxs("button",{type:"button","data-person-node":"walker",className:"easy-walker is-easy-walker is-cue",style:{left:Tt.left,top:Tt.top,width:Jy,height:Jy},onClick:oe=>{oe.stopPropagation(),ht()},children:[s.jsx("span",{className:"easy-walker-arrow","aria-hidden":!0,children:"▼"}),s.jsx("span",{className:"easy-walker-cue-label",children:Z.nightTap}),s.jsx(ox,{kind:Pt.kind,className:"easy-walker-face",style:{width:zy,height:zy}})]})}):null]}),ne==="plant"?s.jsx("button",{type:"button",className:"btn primary xl defend-go",onClick:()=>se("wave"),disabled:ie.length<1||Q,children:d?Z.nightDo:"The road is coming"}):null,I?s.jsx("p",{className:"match-toast",role:"status",children:I}):null,s.jsx("div",{className:"defend-abilities",role:"group","aria-label":"Night abilities",children:ca.map(oe=>{const je=f.includes(oe.id),De=Yy(o,oe.id),xt=No(oe,o);return s.jsxs("button",{type:"button",className:`defend-ability ${g===oe.id?"is-on":""} ${je?"":"is-locked"} ${we&&g===oe.id?"is-firing":""}`,"aria-pressed":g===oe.id,onClick:()=>{if(je){_(null),T(oe.id);return}_(d?Z.nightMiss:`${oe.label} is locked. Hold a matching line to deploy this tool.`)},children:[s.jsx(ui,{ability:oe.id,size:"md"}),oe.label,nt?null:s.jsx("span",{className:"defend-ability-tier","aria-hidden":!0,children:Bd[xt]}),s.jsx("span",{className:"defend-ability-claim",children:je?oe.id==="love"?My(d):De?d?hn(De.id,De.claim):De.claim:d?"Keep a main idea to name this tool.":"Hold a line to name this tool.":d?"Locked — tap the glowing face":"Hold a matching line"})]},oe.id)})}),ne==="lost"?s.jsxs("div",{className:"defend-lost",children:[s.jsx("p",{children:d?"You missed. Tap the face.":"Porch flickered. Turn them again."}),s.jsx("button",{type:"button",className:"btn primary",onClick:yt,children:"Try the night again"})]}):null,d?ne==="lost"?null:s.jsx("p",{className:"defend-tip",children:Z.nightTap}):ne==="wave"?s.jsx("p",{className:"defend-tip",children:"Match the walker. Deploy the held argument — the wrong tool only nudges."}):s.jsx("p",{className:"defend-tip",children:"Learn · hold · deploy. Love is ready. Logic, reason, and science unlock as you keep lines."})]}),s.jsx(ki,{play:Y&&!be,stamp:"Night held!"})]})}function l2({onNavigate:a}){const{progress:o,recordTaught:r}=Je(),h=ye(o),d=bT(o),m=qt(d);function w(){r(d),a({name:"hub"})}return s.jsxs("main",{className:"challenge-page is-teach","aria-label":ot.playGoal,children:[s.jsxs("button",{type:"button",className:"text-link",onClick:()=>a({name:"hub"}),children:["← ",h?Z.home:"The town"]}),m?s.jsx(au,{brief:m,kind:"link",unlock:Z.learnCta,onUnlock:w}):s.jsxs("section",{className:"recall-gate is-encode teach-gate",children:[s.jsx("p",{className:"quiet",children:Z.readStoryFirst}),s.jsx("button",{type:"button",className:"btn primary xl",onClick:()=>a({name:"hub"}),children:Z.home})]})]})}function c2({easy:a}){return s.jsxs("div",{className:"link-demo","aria-label":"How to match",children:[s.jsxs("div",{className:"link-demo-row",children:[s.jsx("span",{className:"link-demo-step is-idea",children:a?"Sentence":"Idea"}),s.jsx("span",{className:"link-demo-arrow","aria-hidden":!0,children:"→"}),s.jsx("span",{className:"link-demo-step is-place",children:"Place"}),s.jsx("span",{className:"link-demo-arrow","aria-hidden":!0,children:"→"}),s.jsx("span",{className:"link-demo-step is-person",children:"Person"})]}),s.jsx("p",{className:"next-tap",children:a?Z.connectLink:"Tap idea → place → person"})]})}function h2({onNavigate:a}){const{completeChallenge:o,markMiss:r,progress:h,recordStreetLinks:d}=Je(),{juiceDone:m,afterJuice:w}=Cl(),y=W.useRef(!1),f=W.useRef(void 0),[g,T]=W.useState(()=>ye(h)&&fd(h)),[b,M]=W.useState(!1),E=ye(h),G=h.streetLinked??[],I=E?void 0:_d(G),_=E?qT(vT(h)):ET(G),Q=I?yd(G,I.triples.map(B=>B.id)).length:G.length,ne=dl(yd(G,I?.triples.map(B=>B.id)??[])),se=E?void 0:I?{place:I.placeTitle,linkedAfter:Q,total:zn.length,left:ne}:void 0;function ie(){y.current||(y.current=!0,o("street",_.id))}function re(){if(w(),E){ie();return}if(y.current)return;y.current=!0,f.current=I;const B=_.triples.map(te=>te.id);d(B)}function F(B){ie(),a(B==="hold"?Gd(h):{name:"hub"})}return s.jsxs("main",{className:`challenge-page ${m?"is-after":g?"is-puzzle":"is-teach"} ${b?"is-arming":""}`,"aria-label":ot.playGoal,children:[s.jsxs("button",{type:"button",className:"text-link",onClick:()=>a({name:"hub"}),children:["← ",E?Z.home:"The town"]}),!m&&E&&!fd(h)?s.jsxs("section",{className:"recall-gate is-encode teach-gate","aria-label":Z.learnThisFirst,children:[s.jsx("p",{className:"recall-line rehearse-stem",children:Z.learnThisFirst}),s.jsx("p",{className:"quiet",children:Z.readStoryFirst}),s.jsx("button",{type:"button",className:"btn primary xl",onClick:()=>a({name:"learn"}),children:Z.learnCta})]}):m?s.jsxs("section",{className:"after-win",children:[s.jsxs("article",{className:"stored-line is-spoken","aria-label":"Street takeaway",children:[s.jsx("p",{className:"eyebrow",children:"Say this out loud"}),s.jsx("p",{className:"stored-claim",children:"An idea lives at a place, with a person."}),s.jsx("p",{className:"link-takeaway",children:E?"Mercy tells Jesus stories at the creek — that is why the neighbor who stops on the road lives at Story Creek. Silas copies names on the square — that is why the old shared belief lives at Witness Square. Juniper’s lamp is on the porch so today’s line can be seen.":HT(f.current,dl(h.streetLinked??[]))}),s.jsx(Pn,{id:_.id,compact:!0})]}),s.jsx(Hl,{who:"juniper",line:E?`Your matches wait in ${Z.saved}.`:dl(h.streetLinked??[])>0?"Continue from Town when you want one more round.":"Tap a place on the map — the mind map holds what you linked.",action:E?`See ${Z.saved}`:"See the town",onGo:()=>a(E?{name:"journal"}:{name:"hub"})})]}):g?s.jsxs(s.Fragment,{children:[E?null:s.jsx("h1",{className:"puzzle-title",children:_.title}),s.jsx(nu,{challenge:_,onMiss:()=>r(_.id),onSolved:re,onEasyStop:F,streetBeat:se})]}):s.jsxs("section",{className:"recall-gate is-encode teach-gate","aria-label":E?Z.connectLink:"Unlock the links",children:[E?null:s.jsx("p",{className:"eyebrow",children:"Match idea · place · person."}),s.jsx("p",{className:"recall-line rehearse-stem",children:E?Z.connectLink:"Link the idea to its place and person."}),s.jsx(c2,{easy:E}),E?null:s.jsx(Io,{id:_.id}),s.jsx("p",{className:"quiet",children:E?`You’ll keep them in ${Z.saved}.`:I?`Tonight’s street is ${I.placeTitle} — ${I.triples.length} fact${I.triples.length===1?"":"s"}, not the whole catalog. ${G.length} of ${zn.length} facts already linked.`:"Each match lights a spot on the town map. Tap the place later to open that idea again."}),E?null:s.jsx("ul",{className:"word-school street-whys","aria-label":"Why each place",children:PT.map(B=>s.jsx("li",{children:B},B))}),E?null:s.jsx("ol",{className:"teach-beats",children:DT.map(B=>s.jsx("li",{children:B},B))}),s.jsx("button",{type:"button",className:"btn primary xl",onClick:()=>{T(!0),M(!0),window.setTimeout(()=>M(!1),360)},children:E?"Start":I&&G.length>0?Z.continueStreet:"Unlock the links"})]})]})}function d2(a){return a&&tt.some(o=>o.id===a)?a:null}function rg(a,o){const r=Nt.find(h=>h.unlockAfter===o);return r&&a.journal.includes(r.id)?{name:"journal",focusId:r.id}:cs(a,o)?{name:"journal",focusId:`learn-${o}`}:{name:"journal",focusId:r?.id??o}}function hd(a){return{name:"hub",mindPlot:a}}function u2(a,o){if(o==="ln-street"||o==="td-watch")return;const r=qt(o),h=cs(a,o),d=r?.claim??h?.claim;if(d)return{id:o,claim:d,reason:r?.reason??h?.reason??"",source:r?.source??h?.source??"",held:(a.held??[]).includes(o),stored:!!h}}function m2(a){const o=new Set,r=[];function h(b){if(o.has(b))return;const M=u2(a,b);M&&(o.add(b),r.push(M))}for(const b of dw(a))h(b.id);for(const b of[...a.held??[]].reverse())h(b);for(const b of a.completed??[])di(a,b)&&h(b);const d=tt.filter(b=>ds(b.id,a)!=="empty"?!0:(Yd[b.id]??[]).some(E=>di(a,E))).map(b=>({id:b.id,title:b.title,blurb:b.blurb,stage:ds(b.id,a)})),m=[],w=new Set;for(const b of d){const M=la(b.id).who;if(M==="river"||w.has(M))continue;w.add(M);const E=en[M];m.push({id:M,name:E.name,role:E.role,plotId:b.id,placeTitle:b.title})}const y=ca.map(b=>({id:b.id,label:b.label,tierMark:Bd[No(b,a)]??"",unlocked:Ug(b,a)})),f=Vd(a),g=f?Da.triples.map(b=>{const M=Da.nodes.find(I=>I.id===b.ideaId),E=Da.nodes.find(I=>I.id===b.placeId),G=Da.nodes.find(I=>I.id===b.personId);return{id:b.id,idea:M?.text??b.ideaId,place:E?.text??b.placeId,person:G?.text??b.personId,evidenceId:M?.evidenceId,plotId:d2(E?.plotId)??void 0}}):[],T=y.filter(b=>b.unlocked).length;return{ideas:r,places:d,people:m,tools:y,links:g,streetLinked:f,learned:(a.completed??[]).filter(b=>b!=="ln-street").length,held:(a.held??[]).length,deployed:T+(a.defense?.cleared??0)}}function p2({onNavigate:a}){const{progress:o}=Je(),r=ye(o),h=m2(o),d=en.river;return s.jsxs("main",{className:"profile page",children:[s.jsxs("button",{type:"button",className:"text-link",onClick:()=>a({name:"hub"}),children:["← ",r?Z.home:"The town"]}),s.jsxs("header",{className:"profile-hero",children:[s.jsx(it,{who:"river",size:"xl"}),s.jsxs("div",{children:[s.jsxs("p",{className:"eyebrow",children:["You · ",d.shortName]}),s.jsx("h1",{children:d.name}),s.jsxs("p",{className:"quiet",children:[d.role," · ",d.seeking]}),s.jsx("p",{className:"memory-pipe",children:r?`Learn ${h.learned} · Hold ${h.held} · Use ${h.deployed}`:`Learn ${h.learned} · Hold ${h.held} · Deploy ${h.deployed}`})]})]}),s.jsx(bo,{startOpen:!0,label:r?Z.saved:"Held ideas",lead:r?"These are the main ideas you kept.":"Claims you still hold — reason and source stay with the line.",count:h.ideas.length,children:h.ideas.length===0?s.jsx("p",{className:"quiet",children:"Walk the Trail, then Hold the takeaway — lines you keep land here."}):h.ideas.map(m=>s.jsxs("article",{className:"profile-unlock",children:[s.jsxs("button",{type:"button",className:"profile-unlock-hit",onClick:()=>a(rg(o,m.id)),children:[s.jsxs("p",{className:"eyebrow",children:[r?m.held?Z.saved:m.stored?"Kept":"Walked":m.held?"Held":m.stored?"Stored":"Walked"," ","· ",m.source]}),s.jsx("strong",{children:r?hn(m.id,m.claim):m.claim}),s.jsx(Io,{id:m.id}),r?null:s.jsx("p",{children:m.reason})]}),s.jsx(Pn,{id:m.id,surface:"profile",compact:!0})]},m.id))}),s.jsx(bo,{label:"Places",lead:"Lots that remember you.",count:h.places.length,children:h.places.map(m=>s.jsx("article",{className:"profile-unlock",children:s.jsxs("button",{type:"button",className:"profile-unlock-hit",onClick:()=>a(hd(m.id)),children:[s.jsx("p",{className:"eyebrow",children:r?m.stage==="scaffold"?"Wood up":m.stage==="empty"?"Empty lot":m.stage==="lit"?"Lamps on":"House up":m.stage}),s.jsx("strong",{children:r&&m.id==="journal"?"River’s pages":m.title}),s.jsx("p",{children:r&&m.id==="bench"?"Silas copies names on the square. Public names, not stories.":m.blurb})]})},m.id))}),s.jsx(bo,{label:"People",lead:"Who walks with you.",count:h.people.length,children:h.people.length===0?s.jsx("p",{className:"quiet",children:"Juniper waits on the east porch."}):h.people.map(m=>s.jsx("article",{className:"profile-unlock",children:s.jsxs("button",{type:"button",className:"profile-unlock-hit is-person",onClick:()=>a(hd(m.plotId)),children:[s.jsx(it,{who:m.id,size:"sm"}),s.jsxs("span",{children:[s.jsx("strong",{children:m.name}),s.jsxs("p",{children:[m.role," · ",m.placeTitle]})]})]})},m.id))}),s.jsx(bo,{label:r?Z.uses:"Tools",lead:r?"Tools wait until later.":"What you can deploy on Night Watch.",count:h.tools.length,children:h.tools.map(m=>s.jsx("article",{className:`profile-unlock ${m.unlocked?"":"is-dim"}`,children:m.unlocked?r?s.jsxs("p",{className:"profile-unlock-hit is-tool",children:[s.jsx(ui,{ability:m.id,size:"sm"}),s.jsxs("span",{children:[s.jsxs("strong",{children:[m.label," ",m.tierMark]}),s.jsx("p",{children:"Saved for later."})]})]}):s.jsxs("button",{type:"button",className:"profile-unlock-hit is-tool",onClick:()=>a({name:"defend"}),children:[s.jsx(ui,{ability:m.id,size:"sm"}),s.jsxs("span",{children:[s.jsxs("strong",{children:[m.label," ",m.tierMark]}),s.jsx("p",{children:"Night Watch · Learn → Hold → Deploy"})]})]}):s.jsxs("p",{className:"profile-unlock-hit is-tool is-locked",children:[s.jsx(ui,{ability:m.id,size:"sm"}),s.jsxs("span",{children:[s.jsx("strong",{children:m.label}),s.jsx("em",{children:r?"Still closed — keep a main idea that opens it.":"Still locked — hold a line that opens it."})]})]})},m.id))}),s.jsx(bo,{label:r?Z.connections:"Connections",lead:r?"Places you matched.":"Idea · place · person — lit nodes reopen here.",count:h.streetLinked?h.links.length:0,children:h.streetLinked?h.links.map(m=>s.jsxs("article",{className:"profile-unlock",children:[s.jsxs("button",{type:"button",className:"profile-unlock-hit",onClick:()=>a(m.evidenceId?rg(o,m.evidenceId):m.plotId?hd(m.plotId):{name:"hub"}),children:[s.jsx("p",{className:"eyebrow",children:m.place}),s.jsx("strong",{children:m.idea}),s.jsx("p",{children:m.person})]}),m.evidenceId?s.jsx(Pn,{id:m.evidenceId,surface:"profile",compact:!0}):null]},m.id)):s.jsx("p",{className:"quiet",children:r?`${Z.connectLink} Start from Match. Open Saved later to see what you held.`:"Link the street from Town to snap idea · place · person. Lit nodes reopen here."})})]})}function bo({startOpen:a=!1,label:o,lead:r,count:h,children:d}){return s.jsxs(ko,{startOpen:a,className:"profile-section",children:[s.jsx(To,{label:o,count:h}),r?s.jsx("p",{className:"quiet saved-tree-lead",children:r}):null,d]})}function f2({onNavigate:a}){const{progress:o}=Je();return s.jsxs("main",{className:"vista",children:[s.jsx("div",{className:"cast-row vista-cast",children:Object.keys(en).map(r=>s.jsx(it,{who:r,size:"lg"},r))}),s.jsx("p",{className:"eyebrow",children:"The trail does not end"}),s.jsx("h1",{children:"You have walked the five districts"}),s.jsx(zg,{who:"hope",line:Gk}),s.jsx("p",{className:"lede",children:"Parables, testimony, a habitable cosmos, a first cause, and the inward clues of duty, mind, meaning, and beauty. None of these, alone, is the whole case. Together they are a coherent invitation: the world is the sort of place that looks authored — and a particular history claims that the Author has spoken."}),s.jsxs("p",{children:["Held lines: ",o.held.length," · Insight ",rw(o)," · Journal ",o.journal.length,"/",$T," · First-try"," ",o.firstTry.length]}),s.jsxs("blockquote",{children:["“The heavens declare the glory of God, and the sky above proclaims his handiwork.”",s.jsx("cite",{children:"Psalm 19:1"})]}),s.jsxs("div",{className:"welcome-actions",children:[s.jsx("button",{type:"button",className:"btn primary xl",onClick:()=>a({name:"journal"}),children:"Sit with the journal"}),s.jsx("button",{type:"button",className:"btn ghost",onClick:()=>a({name:"hub"}),children:"Return to the town"}),s.jsx(iu,{})]}),s.jsx("ul",{className:"vista-list",children:jt.map(r=>s.jsx("li",{children:r.title},r.id))})]})}function y2({onNavigate:a}){const{progress:o,start:r,setEasyMode:h}=Je(),d=Dt(),m=o.started&&vi(o,d);function w(){if(r(),o.easyMode){a(qo(o,vl)?{name:"hub"}:{name:"learn"});return}if(m){a({name:"hub"});return}a({name:"daily"})}return s.jsxs("main",{className:"welcome is-onescreen is-alive",children:[s.jsx("div",{className:"welcome-sky","aria-hidden":!0}),s.jsx("div",{className:"welcome-ridge","aria-hidden":!0}),s.jsxs("div",{className:"welcome-hero",children:[o.easyMode?null:s.jsx(kw,{mode:"poster",onNavigate:a}),s.jsx("p",{className:"eyebrow",children:"60 seconds"}),s.jsxs("h1",{children:["Silver City",s.jsx("span",{children:"Unending Evidence"})]}),o.easyMode?null:s.jsx("p",{className:"welcome-goal",children:ot.purpose}),o.easyMode?null:s.jsx("p",{className:"welcome-who",children:ot.who}),s.jsxs("div",{className:"welcome-cast",children:[s.jsxs("figure",{children:[s.jsx(it,{who:"river",size:"lg"}),s.jsx("figcaption",{children:"YOU · RIVER"})]}),s.jsx("span",{className:"welcome-lantern","aria-hidden":!0}),s.jsxs("figure",{children:[s.jsx(it,{who:"juniper",size:"lg"}),s.jsx("figcaption",{children:"GUIDE · JUNIPER"})]})]}),s.jsxs("div",{className:"welcome-actions",children:[s.jsx("p",{className:"eyebrow",children:"Reading"}),s.jsxs("div",{className:"settings-actions",children:[s.jsx("button",{type:"button",className:`btn ${o.easyMode?"primary":""}`,"aria-pressed":!!o.easyMode,onClick:()=>h(!0),children:"Easy"}),s.jsx("button",{type:"button",className:`btn ${o.easyMode?"":"primary"}`,"aria-pressed":!o.easyMode,onClick:()=>h(!1),children:"Hard"})]}),s.jsx("p",{className:"quiet welcome-easy-note",children:o.easyMode?"Easier words · bigger taps. You can change this in Settings.":"Hard keeps the full voice. You can switch anytime in Settings → Reading. We teach hard words first — a claim is the main idea we hold to be true."}),o.easyMode?s.jsx("p",{className:"teach-chip",role:"note",children:Z.claimTeach}):null,s.jsx("button",{type:"button",className:"btn primary xl",onClick:w,children:o.easyMode?m?Z.home:"Play":m?"Back to town":"Begin the trail"}),s.jsx("p",{className:"welcome-version",children:o.easyMode?Qt:`V0 · ${Qt}`})]})]})]})}function g2(){if(typeof window>"u")return!1;const a=`${window.location.hash} ${window.location.search} ${window.location.pathname}`;return/defend|night-?watch/i.test(a)}function w2(){const{progress:a}=Je(),o=ye(a),[r,h]=W.useState(()=>{const m=a.completed.length>0||!!a.lastDailyDate;return a.started&&m?{name:"hub"}:{name:"welcome"}});function d(m){if(o&&m.name==="defend"){h({name:"hub"});return}h(m)}return W.useEffect(()=>{o&&(r.name==="defend"||g2())&&h({name:"hub"})},[o,r.name]),W.useEffect(()=>{window.scrollTo({top:0,behavior:"smooth"})},[r]),W.useEffect(()=>{const m=a.theme??"candy";document.documentElement.dataset.theme=m,document.documentElement.style.colorScheme=m==="parchment"?"light":"dark",document.documentElement.dataset.easy=a.easyMode?"on":"off"},[a.theme,a.easyMode]),W.useEffect(()=>{if(r.name!=="journal"||!r.focusId||r.autoQuiz)return;document.getElementById(r.focusId)?.scrollIntoView({behavior:"smooth",block:"center"})},[r]),s.jsxs(q1,{view:r,onNavigate:d,children:[r.name==="welcome"?s.jsx(y2,{onNavigate:d}):null,r.name==="hub"?s.jsx(Z0,{onNavigate:d,openPlot:r.mindPlot}):null,r.name==="daily"?s.jsx(T0,{onNavigate:d}):null,r.name==="area"?s.jsx(R1,{areaId:r.areaId,onNavigate:d}):null,r.name==="challenge"?s.jsx(k0,{areaId:r.areaId,challengeId:r.challengeId,onNavigate:d},`${r.areaId}-${r.challengeId}`):null,r.name==="journal"?s.jsx(e2,{focusId:r.focusId,autoQuiz:r.autoQuiz,onNavigate:d}):null,r.name==="vista"?s.jsx(f2,{onNavigate:d}):null,r.name==="settings"?s.jsx(t2,{onNavigate:d}):null,r.name==="defend"&&!o?s.jsx(r2,{onNavigate:d}):null,r.name==="link"?s.jsx(h2,{onNavigate:d}):null,r.name==="learn"?s.jsx(l2,{onNavigate:d}):null,r.name==="profile"?s.jsx(p2,{onNavigate:d}):null]})}function b2({children:a}){const[o,r]=W.useState(()=>Fy().progress),[h,d]=W.useState(()=>Fy().meta),[m,w]=W.useState([]),y=W.useCallback(j=>{const O=Td(j);r(j),d(O)},[]),f=W.useCallback(j=>(d(Td(j)),j),[]),g=W.useCallback(()=>{r(j=>{vo(Rd(j));const O={...j,started:!0,lastAreaId:j.lastAreaId??"parable-hollow"};return f(O)})},[f]),T=W.useCallback(j=>{w(O=>O.includes(j)?O:[...O,j])},[]),b=W.useCallback(j=>{r(O=>{if(Ln(j))return O;const A=O.held.includes(j)?O.held:[...O.held,j],X=O.easyMode?Ey(O,j):O.easyHeld??[];if(A===O.held&&X===(O.easyHeld??[]))return O;const L={...O,held:A,easyHeld:X};return f(L)})},[f]),M=W.useCallback(j=>{let O=1;return r(A=>{const X=A.memory[j.id],L=X??gd(j.id,j.pillar,j.today),v=j.peeked||!j.clean;let x=L;j.kind==="encode"?x=X?{...L,pillar:j.pillar,elaborated:L.elaborated||j.elaborated}:{...gd(j.id,j.pillar,j.today),elaborated:j.elaborated}:v?x=Tx(L,j.today):x=vx(L,j.today),x={...x,elaborated:x.elaborated||j.elaborated},O=Iy(A.stars[j.id],xx(A.stars[j.id],X,j,x));const J={...A,memory:{...A.memory,[j.id]:x},stars:{...A.stars,[j.id]:O},held:Ln(j.id)||A.held.includes(j.id)?A.held:[...A.held,j.id],easyHeld:A.easyMode&&!Ln(j.id)?Ey(A,j.id):A.easyHeld??[],lastReviewPillar:j.pillar,elaborations:j.text?{...A.elaborations,[j.id]:j.text}:A.elaborations},ae=_1(j,A);return ae&&(J.learnings=D1(A.learnings??[],ae)),f(J)}),O},[f]),E=W.useCallback((j,O)=>{j.length!==0&&r(A=>{let X=!1;const L={...A.memory};for(const v of j){const x=L[v];x&&(L[v]=kx(x,O),X=!0)}return X?f({...A,memory:L}):A})},[f]),G=W.useCallback((j,O)=>{let A=O;return r(X=>{if(A=Iy(X.stars[j],O),X.stars[j]===A)return X;const L={...X,stars:{...X.stars,[j]:A}};return f(L)}),A},[f]),I=W.useCallback((j,O)=>{const A=H1(O);return r(X=>{const L=X.completed.includes(O),v={...X,started:!0,completed:L?X.completed:[...X.completed,O],journal:[...new Set([...X.journal,...A])],firstTry:L||m.includes(O)||X.firstTry.includes(O)?X.firstTry:[...X.firstTry,O],lastAreaId:j,lastChallengeId:O};return f(v)}),A},[m,f]),_=W.useCallback(j=>{let O=[];return r(A=>{const L=A.dailyDates.includes(j)?A.dailyDates:[...A.dailyDates,j];O=Ky(L.length).filter(J=>!A.journal.includes(J));const v=C1(A.lastDailyDate,j,A.streak),x={...A,started:!0,dailyDates:L,lastDailyDate:j,streak:v.streak,bestStreak:Math.max(A.bestStreak,v.streak),journal:[...new Set([...A.journal,...Ky(L.length)])]};return f(x)}),O},[f]),Q=W.useCallback(j=>{r(O=>{const A=O.defense.nights.includes(j),X={...O,defense:{cleared:O.defense.cleared+1,nights:A?O.defense.nights:[...O.defense.nights,j],lastNight:j}};return f(X)})},[f]),ne=W.useCallback(j=>{r(O=>O.theme===j?O:f({...O,theme:j}))},[f]),se=W.useCallback(j=>{r(O=>O.easyMode===j?O:f({...O,easyMode:j}))},[f]),ie=W.useCallback(j=>{r(O=>{const A=O.taught??[],X=A.includes(j)?A:[...A,j],L=O.easyMode?ST(O,j):O.easyTaught??[],v=O.easyMode?{...O.tierTaught??{},[j]:za(O,j)}:O.tierTaught??{};return X===A&&L===(O.easyTaught??[])&&v[j]===O.tierTaught?.[j]?O:f({...O,taught:X,easyTaught:L,tierTaught:v})})},[f]),re=W.useCallback((j,O)=>{Ln(j)||r(A=>{const X=O?hT(A,j):dT(A,j);return f({...A,...X})})},[f]),F=W.useCallback(j=>{j.length!==0&&r(O=>{const A=yd(O.streetLinked??[],j),L=A.length>=zn.length&&!O.completed.includes("ln-street")?[...O.completed,"ln-street"]:O.completed;return A.length===(O.streetLinked??[]).length&&L===O.completed?O:f({...O,started:!0,streetLinked:A,completed:L,lastAreaId:"street",lastChallengeId:"ln-street"})})},[f]),B=W.useCallback(j=>{r(O=>{const A=Hx(O,j);return A===O?O:f(A)})},[f]),te=W.useCallback(()=>{w([]),Sy(),By(),r(j=>{const O={...ul(),theme:j.theme,easyMode:j.easyMode};return f(O)})},[f]),ee=W.useCallback(j=>{const O=j1(j);return O.ok?(By(),w([]),Sy(),y(O.progress),{ok:!0}):O},[y]),ge=W.useMemo(()=>({progress:o,saveMeta:h,missed:m,start:g,completeChallenge:I,completeDaily:_,recordStars:G,recordHeld:b,recordReview:M,recordLessonHold:re,snoozeReviews:E,markMiss:T,recordNight:Q,setTheme:ne,setEasyMode:se,recordTaught:ie,recordStreetLinks:F,upgradeBuilding:B,reset:te,importSaveText:ee}),[I,_,ee,T,m,o,b,Q,M,re,E,G,te,h,ie,F,se,ne,g,B]);return s.jsx(lw.Provider,{value:ge,children:a})}pl.isNativePlatform()||ok({immediate:!0});const Sw=document.getElementById("root");if(!Sw)throw new Error("Root element missing");nk.createRoot(Sw).render(s.jsx(W.StrictMode,{children:s.jsx(b2,{children:s.jsx(w2,{})})}));
