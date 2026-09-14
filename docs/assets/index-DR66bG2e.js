(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const d of document.querySelectorAll('link[rel="modulepreload"]'))c(d);new MutationObserver(d=>{for(const u of d)if(u.type==="childList")for(const g of u.addedNodes)g.tagName==="LINK"&&g.rel==="modulepreload"&&c(g)}).observe(document,{childList:!0,subtree:!0});function r(d){const u={};return d.integrity&&(u.integrity=d.integrity),d.referrerPolicy&&(u.referrerPolicy=d.referrerPolicy),d.crossOrigin==="use-credentials"?u.credentials="include":d.crossOrigin==="anonymous"?u.credentials="omit":u.credentials="same-origin",u}function c(d){if(d.ep)return;d.ep=!0;const u=r(d);fetch(d.href,u)}})();var Yh={exports:{}},go={};var my;function tk(){if(my)return go;my=1;var a=Symbol.for("react.transitional.element"),o=Symbol.for("react.fragment");function r(c,d,u){var g=null;if(u!==void 0&&(g=""+u),d.key!==void 0&&(g=""+d.key),"key"in d){u={};for(var y in d)y!=="key"&&(u[y]=d[y])}else u=d;return d=u.ref,{$$typeof:a,type:c,key:g,ref:d!==void 0?d:null,props:u}}return go.Fragment=o,go.jsx=r,go.jsxs=r,go}var py;function nk(){return py||(py=1,Yh.exports=tk()),Yh.exports}var s=nk();var fi;(function(a){a.Unimplemented="UNIMPLEMENTED",a.Unavailable="UNAVAILABLE"})(fi||(fi={}));class Vh extends Error{constructor(o,r,c){super(o),this.message=o,this.code=r,this.data=c}}const ak=a=>{var o,r;return a?.androidBridge?"android":!((r=(o=a?.webkit)===null||o===void 0?void 0:o.messageHandlers)===null||r===void 0)&&r.bridge?"ios":"web"},sk=a=>{const o=a.CapacitorCustomPlatform||null,r=a.Capacitor||{},c=r.Plugins=r.Plugins||{},d=()=>o!==null?o.name:ak(a),u=()=>d()!=="web",g=b=>{const x=w.get(b);return!!(x?.platforms.has(d())||y(b))},y=b=>{var x;return(x=r.PluginHeaders)===null||x===void 0?void 0:x.find(N=>N.name===b)},p=b=>a.console.error(b),w=new Map,T=(b,x={})=>{const N=w.get(b);if(N)return console.warn(`Capacitor plugin "${b}" already registered. Cannot register plugins twice.`),N.proxy;const z=d(),I=y(b);let $;const X=async()=>(!$&&z in x?$=typeof x[z]=="function"?$=await x[z]():$=x[z]:o!==null&&!$&&"web"in x&&($=typeof x.web=="function"?$=await x.web():$=x.web),$),te=(ne,Q)=>{var ge,C;if(I){const O=I?.methods.find(E=>Q===E.name);if(O)return O.rtype==="promise"?E=>r.nativePromise(b,Q.toString(),E):(E,Z)=>r.nativeCallback(b,Q.toString(),E,Z);if(ne)return(ge=ne[Q])===null||ge===void 0?void 0:ge.bind(ne)}else{if(ne)return(C=ne[Q])===null||C===void 0?void 0:C.bind(ne);throw new Vh(`"${b}" plugin is not implemented on ${z}`,fi.Unimplemented)}},se=ne=>{let Q;const ge=(...C)=>{const O=X().then(E=>{const Z=te(E,ne);if(Z){const L=Z(...C);return Q=L?.remove,L}else throw new Vh(`"${b}.${ne}()" is not implemented on ${z}`,fi.Unimplemented)});return ne==="addListener"&&(O.remove=async()=>Q()),O};return ge.toString=()=>`${ne.toString()}() { [capacitor code] }`,Object.defineProperty(ge,"name",{value:ne,writable:!1,configurable:!1}),ge},oe=se("addListener"),re=se("removeListener"),B=(ne,Q)=>{const ge=oe({eventName:ne},Q),C=async()=>{const E=await ge;re({eventName:ne,callbackId:E},Q)},O=new Promise(E=>ge.then(()=>E({remove:C})));return O.remove=async()=>{console.warn("Using addListener() without 'await' is deprecated."),await C()},O},F=new Proxy({},{get(ne,Q){switch(Q){case"$$typeof":return;case"toJSON":return()=>({});case"addListener":return I?B:oe;case"removeListener":return re;default:return se(Q)}}});return c[b]=F,w.set(b,{name:b,proxy:F,platforms:new Set([...Object.keys(x),...I?[z]:[]])}),F};return r.convertFileSrc||(r.convertFileSrc=b=>b),r.getPlatform=d,r.handleError=p,r.isNativePlatform=u,r.isPluginAvailable=g,r.registerPlugin=T,r.Exception=Vh,r.DEBUG=!!r.DEBUG,r.isLoggingEnabled=!!r.isLoggingEnabled,r},ik=a=>a.Capacitor=sk(a),gl=ik(typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{}),Id=gl.registerPlugin;class Rd{constructor(){this.listeners={},this.retainedEventArguments={},this.windowListeners={}}addListener(o,r){let c=!1;this.listeners[o]||(this.listeners[o]=[],c=!0),this.listeners[o].push(r);const u=this.windowListeners[o];u&&!u.registered&&this.addWindowListener(u),c&&this.sendRetainedArgumentsForEvent(o);const g=async()=>this.removeListener(o,r);return Promise.resolve({remove:g})}async removeAllListeners(){this.listeners={};for(const o in this.windowListeners)this.removeWindowListener(this.windowListeners[o]);this.windowListeners={}}notifyListeners(o,r,c){const d=this.listeners[o];if(!d){if(c){let u=this.retainedEventArguments[o];u||(u=[]),u.push(r),this.retainedEventArguments[o]=u}return}d.forEach(u=>u(r))}hasListeners(o){var r;return!!(!((r=this.listeners[o])===null||r===void 0)&&r.length)}registerWindowListener(o,r){this.windowListeners[r]={registered:!1,windowEventName:o,pluginEventName:r,handler:c=>{this.notifyListeners(r,c)}}}unimplemented(o="not implemented"){return new gl.Exception(o,fi.Unimplemented)}unavailable(o="not available"){return new gl.Exception(o,fi.Unavailable)}async removeListener(o,r){const c=this.listeners[o];if(!c)return;const d=c.indexOf(r);d!==-1&&this.listeners[o].splice(d,1),this.listeners[o].length||this.removeWindowListener(this.windowListeners[o])}addWindowListener(o){window.addEventListener(o.windowEventName,o.handler),o.registered=!0}removeWindowListener(o){o&&(window.removeEventListener(o.windowEventName,o.handler),o.registered=!1)}sendRetainedArgumentsForEvent(o){const r=this.retainedEventArguments[o];r&&(delete this.retainedEventArguments[o],r.forEach(c=>{this.notifyListeners(o,c)}))}}const fy=a=>encodeURIComponent(a).replace(/%(2[346B]|5E|60|7C)/g,decodeURIComponent).replace(/[()]/g,escape),yy=a=>a.replace(/(%[\dA-F]{2})+/gi,decodeURIComponent);class ok extends Rd{async getCookies(){const o=document.cookie,r={};return o.split(";").forEach(c=>{if(c.length<=0)return;let[d,u]=c.replace(/=/,"CAP_COOKIE").split("CAP_COOKIE");d=yy(d).trim(),u=yy(u).trim(),r[d]=u}),r}async setCookie(o){try{const r=fy(o.key),c=fy(o.value),d=o.expires?`; expires=${o.expires.replace("expires=","")}`:"",u=(o.path||"/").replace("path=",""),g=o.url!=null&&o.url.length>0?`domain=${o.url}`:"";document.cookie=`${r}=${c||""}${d}; path=${u}; ${g};`}catch(r){return Promise.reject(r)}}async deleteCookie(o){try{document.cookie=`${o.key}=; Max-Age=0`}catch(r){return Promise.reject(r)}}async clearCookies(){try{const o=document.cookie.split(";")||[];for(const r of o)document.cookie=r.replace(/^ +/,"").replace(/=.*/,`=;expires=${new Date().toUTCString()};path=/`)}catch(o){return Promise.reject(o)}}async clearAllCookies(){try{await this.clearCookies()}catch(o){return Promise.reject(o)}}}Id("CapacitorCookies",{web:()=>new ok});const rk=async a=>new Promise((o,r)=>{const c=new FileReader;c.onload=()=>{const d=c.result;o(d.indexOf(",")>=0?d.split(",")[1]:d)},c.onerror=d=>r(d),c.readAsDataURL(a)}),lk=(a={})=>{const o=Object.keys(a);return Object.keys(a).map(d=>d.toLocaleLowerCase()).reduce((d,u,g)=>(d[u]=a[o[g]],d),{})},ck=(a,o=!0)=>a?Object.entries(a).reduce((c,d)=>{const[u,g]=d;let y,p;return Array.isArray(g)?(p="",g.forEach(w=>{y=o?encodeURIComponent(w):w,p+=`${u}=${y}&`}),p.slice(0,-1)):(y=o?encodeURIComponent(g):g,p=`${u}=${y}`),`${c}&${p}`},"").substr(1):null,hk=(a,o={})=>{const r=Object.assign({method:a.method||"GET",headers:a.headers},o),d=lk(a.headers)["content-type"]||"";if(typeof a.data=="string")r.body=a.data;else if(d.includes("application/x-www-form-urlencoded")){const u=new URLSearchParams;for(const[g,y]of Object.entries(a.data||{}))u.set(g,y);r.body=u.toString()}else if(d.includes("multipart/form-data")||a.data instanceof FormData){const u=new FormData;if(a.data instanceof FormData)a.data.forEach((y,p)=>{u.append(p,y)});else for(const y of Object.keys(a.data))u.append(y,a.data[y]);r.body=u;const g=new Headers(r.headers);g.delete("content-type"),r.headers=g}else(d.includes("application/json")||typeof a.data=="object")&&(r.body=JSON.stringify(a.data));return r};class dk extends Rd{async request(o){const r=hk(o,o.webFetchExtra),c=ck(o.params,o.shouldEncodeUrlParams),d=c?`${o.url}?${c}`:o.url,u=await fetch(d,r),g=u.headers.get("content-type")||"";let{responseType:y="text"}=u.ok?o:{};g.includes("application/json")&&(y="json");let p,w;switch(y){case"arraybuffer":case"blob":w=await u.blob(),p=await rk(w);break;case"json":p=await u.json();break;default:p=await u.text()}const T={};return u.headers.forEach((b,x)=>{T[x]=b}),{data:p,headers:T,status:u.status,url:u.url}}async get(o){return this.request(Object.assign(Object.assign({},o),{method:"GET"}))}async post(o){return this.request(Object.assign(Object.assign({},o),{method:"POST"}))}async put(o){return this.request(Object.assign(Object.assign({},o),{method:"PUT"}))}async patch(o){return this.request(Object.assign(Object.assign({},o),{method:"PATCH"}))}async delete(o){return this.request(Object.assign(Object.assign({},o),{method:"DELETE"}))}}Id("CapacitorHttp",{web:()=>new dk});var gy;(function(a){a.Dark="DARK",a.Light="LIGHT",a.Default="DEFAULT"})(gy||(gy={}));var wy;(function(a){a.StatusBar="StatusBar",a.NavigationBar="NavigationBar"})(wy||(wy={}));class uk extends Rd{async setStyle(){this.unavailable("not available for web")}async setAnimation(){this.unavailable("not available for web")}async show(){this.unavailable("not available for web")}async hide(){this.unavailable("not available for web")}}Id("SystemBars",{web:()=>new uk});var Xh={exports:{}},xe={};var by;function mk(){if(by)return xe;by=1;var a=Symbol.for("react.transitional.element"),o=Symbol.for("react.portal"),r=Symbol.for("react.fragment"),c=Symbol.for("react.strict_mode"),d=Symbol.for("react.profiler"),u=Symbol.for("react.consumer"),g=Symbol.for("react.context"),y=Symbol.for("react.forward_ref"),p=Symbol.for("react.suspense"),w=Symbol.for("react.memo"),T=Symbol.for("react.lazy"),b=Symbol.for("react.activity"),x=Symbol.iterator;function N(k){return k===null||typeof k!="object"?null:(k=x&&k[x]||k["@@iterator"],typeof k=="function"?k:null)}var z={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},I=Object.assign,$={};function X(k,M,G){this.props=k,this.context=M,this.refs=$,this.updater=G||z}X.prototype.isReactComponent={},X.prototype.setState=function(k,M){if(typeof k!="object"&&typeof k!="function"&&k!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,k,M,"setState")},X.prototype.forceUpdate=function(k){this.updater.enqueueForceUpdate(this,k,"forceUpdate")};function te(){}te.prototype=X.prototype;function se(k,M,G){this.props=k,this.context=M,this.refs=$,this.updater=G||z}var oe=se.prototype=new te;oe.constructor=se,I(oe,X.prototype),oe.isPureReactComponent=!0;var re=Array.isArray;function B(){}var F={H:null,A:null,T:null,S:null},ne=Object.prototype.hasOwnProperty;function Q(k,M,G){var J=G.ref;return{$$typeof:a,type:k,key:M,ref:J!==void 0?J:null,props:G}}function ge(k,M){return Q(k.type,M,k.props)}function C(k){return typeof k=="object"&&k!==null&&k.$$typeof===a}function O(k){var M={"=":"=0",":":"=2"};return"$"+k.replace(/[=:]/g,function(G){return M[G]})}var E=/\/+/g;function Z(k,M){return typeof k=="object"&&k!==null&&k.key!=null?O(""+k.key):M.toString(36)}function L(k){switch(k.status){case"fulfilled":return k.value;case"rejected":throw k.reason;default:switch(typeof k.status=="string"?k.then(B,B):(k.status="pending",k.then(function(M){k.status==="pending"&&(k.status="fulfilled",k.value=M)},function(M){k.status==="pending"&&(k.status="rejected",k.reason=M)})),k.status){case"fulfilled":return k.value;case"rejected":throw k.reason}}throw k}function v(k,M,G,J,ie){var me=typeof k;(me==="undefined"||me==="boolean")&&(k=null);var ve=!1;if(k===null)ve=!0;else switch(me){case"bigint":case"string":case"number":ve=!0;break;case"object":switch(k.$$typeof){case a:case o:ve=!0;break;case T:return ve=k._init,v(ve(k._payload),M,G,J,ie)}}if(ve)return ie=ie(k),ve=J===""?"."+Z(k,0):J,re(ie)?(G="",ve!=null&&(G=ve.replace(E,"$&/")+"/"),v(ie,M,G,"",function(Se){return Se})):ie!=null&&(C(ie)&&(ie=ge(ie,G+(ie.key==null||k&&k.key===ie.key?"":(""+ie.key).replace(E,"$&/")+"/")+ve)),M.push(ie)),1;ve=0;var ce=J===""?".":J+":";if(re(k))for(var be=0;be<k.length;be++)J=k[be],me=ce+Z(J,be),ve+=v(J,M,G,me,ie);else if(be=N(k),typeof be=="function")for(k=be.call(k),be=0;!(J=k.next()).done;)J=J.value,me=ce+Z(J,be++),ve+=v(J,M,G,me,ie);else if(me==="object"){if(typeof k.then=="function")return v(L(k),M,G,J,ie);throw M=String(k),Error("Objects are not valid as a React child (found: "+(M==="[object Object]"?"object with keys {"+Object.keys(k).join(", ")+"}":M)+"). If you meant to render a collection of children, use an array instead.")}return ve}function S(k,M,G){if(k==null)return k;var J=[],ie=0;return v(k,J,"","",function(me){return M.call(G,me,ie++)}),J}function _(k){if(k._status===-1){var M=k._result;M=M(),M.then(function(G){(k._status===0||k._status===-1)&&(k._status=1,k._result=G)},function(G){(k._status===0||k._status===-1)&&(k._status=2,k._result=G)}),k._status===-1&&(k._status=0,k._result=M)}if(k._status===1)return k._result.default;throw k._result}var ae=typeof reportError=="function"?reportError:function(k){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var M=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof k=="object"&&k!==null&&typeof k.message=="string"?String(k.message):String(k),error:k});if(!window.dispatchEvent(M))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",k);return}console.error(k)},R={map:S,forEach:function(k,M,G){S(k,function(){M.apply(this,arguments)},G)},count:function(k){var M=0;return S(k,function(){M++}),M},toArray:function(k){return S(k,function(M){return M})||[]},only:function(k){if(!C(k))throw Error("React.Children.only expected to receive a single React element child.");return k}};return xe.Activity=b,xe.Children=R,xe.Component=X,xe.Fragment=r,xe.Profiler=d,xe.PureComponent=se,xe.StrictMode=c,xe.Suspense=p,xe.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=F,xe.__COMPILER_RUNTIME={__proto__:null,c:function(k){return F.H.useMemoCache(k)}},xe.cache=function(k){return function(){return k.apply(null,arguments)}},xe.cacheSignal=function(){return null},xe.cloneElement=function(k,M,G){if(k==null)throw Error("The argument must be a React element, but you passed "+k+".");var J=I({},k.props),ie=k.key;if(M!=null)for(me in M.key!==void 0&&(ie=""+M.key),M)!ne.call(M,me)||me==="key"||me==="__self"||me==="__source"||me==="ref"&&M.ref===void 0||(J[me]=M[me]);var me=arguments.length-2;if(me===1)J.children=G;else if(1<me){for(var ve=Array(me),ce=0;ce<me;ce++)ve[ce]=arguments[ce+2];J.children=ve}return Q(k.type,ie,J)},xe.createContext=function(k){return k={$$typeof:g,_currentValue:k,_currentValue2:k,_threadCount:0,Provider:null,Consumer:null},k.Provider=k,k.Consumer={$$typeof:u,_context:k},k},xe.createElement=function(k,M,G){var J,ie={},me=null;if(M!=null)for(J in M.key!==void 0&&(me=""+M.key),M)ne.call(M,J)&&J!=="key"&&J!=="__self"&&J!=="__source"&&(ie[J]=M[J]);var ve=arguments.length-2;if(ve===1)ie.children=G;else if(1<ve){for(var ce=Array(ve),be=0;be<ve;be++)ce[be]=arguments[be+2];ie.children=ce}if(k&&k.defaultProps)for(J in ve=k.defaultProps,ve)ie[J]===void 0&&(ie[J]=ve[J]);return Q(k,me,ie)},xe.createRef=function(){return{current:null}},xe.forwardRef=function(k){return{$$typeof:y,render:k}},xe.isValidElement=C,xe.lazy=function(k){return{$$typeof:T,_payload:{_status:-1,_result:k},_init:_}},xe.memo=function(k,M){return{$$typeof:w,type:k,compare:M===void 0?null:M}},xe.startTransition=function(k){var M=F.T,G={};F.T=G;try{var J=k(),ie=F.S;ie!==null&&ie(G,J),typeof J=="object"&&J!==null&&typeof J.then=="function"&&J.then(B,ae)}catch(me){ae(me)}finally{M!==null&&G.types!==null&&(M.types=G.types),F.T=M}},xe.unstable_useCacheRefresh=function(){return F.H.useCacheRefresh()},xe.use=function(k){return F.H.use(k)},xe.useActionState=function(k,M,G){return F.H.useActionState(k,M,G)},xe.useCallback=function(k,M){return F.H.useCallback(k,M)},xe.useContext=function(k){return F.H.useContext(k)},xe.useDebugValue=function(){},xe.useDeferredValue=function(k,M){return F.H.useDeferredValue(k,M)},xe.useEffect=function(k,M){return F.H.useEffect(k,M)},xe.useEffectEvent=function(k){return F.H.useEffectEvent(k)},xe.useId=function(){return F.H.useId()},xe.useImperativeHandle=function(k,M,G){return F.H.useImperativeHandle(k,M,G)},xe.useInsertionEffect=function(k,M){return F.H.useInsertionEffect(k,M)},xe.useLayoutEffect=function(k,M){return F.H.useLayoutEffect(k,M)},xe.useMemo=function(k,M){return F.H.useMemo(k,M)},xe.useOptimistic=function(k,M){return F.H.useOptimistic(k,M)},xe.useReducer=function(k,M,G){return F.H.useReducer(k,M,G)},xe.useRef=function(k){return F.H.useRef(k)},xe.useState=function(k){return F.H.useState(k)},xe.useSyncExternalStore=function(k,M,G){return F.H.useSyncExternalStore(k,M,G)},xe.useTransition=function(){return F.H.useTransition()},xe.version="19.2.8",xe}var vy;function Od(){return vy||(vy=1,Xh.exports=mk()),Xh.exports}var H=Od(),Qh={exports:{}},wo={},Zh={exports:{}},ed={};var ky;function pk(){return ky||(ky=1,(function(a){function o(v,S){var _=v.length;v.push(S);e:for(;0<_;){var ae=_-1>>>1,R=v[ae];if(0<d(R,S))v[ae]=S,v[_]=R,_=ae;else break e}}function r(v){return v.length===0?null:v[0]}function c(v){if(v.length===0)return null;var S=v[0],_=v.pop();if(_!==S){v[0]=_;e:for(var ae=0,R=v.length,k=R>>>1;ae<k;){var M=2*(ae+1)-1,G=v[M],J=M+1,ie=v[J];if(0>d(G,_))J<R&&0>d(ie,G)?(v[ae]=ie,v[J]=_,ae=J):(v[ae]=G,v[M]=_,ae=M);else if(J<R&&0>d(ie,_))v[ae]=ie,v[J]=_,ae=J;else break e}}return S}function d(v,S){var _=v.sortIndex-S.sortIndex;return _!==0?_:v.id-S.id}if(a.unstable_now=void 0,typeof performance=="object"&&typeof performance.now=="function"){var u=performance;a.unstable_now=function(){return u.now()}}else{var g=Date,y=g.now();a.unstable_now=function(){return g.now()-y}}var p=[],w=[],T=1,b=null,x=3,N=!1,z=!1,I=!1,$=!1,X=typeof setTimeout=="function"?setTimeout:null,te=typeof clearTimeout=="function"?clearTimeout:null,se=typeof setImmediate<"u"?setImmediate:null;function oe(v){for(var S=r(w);S!==null;){if(S.callback===null)c(w);else if(S.startTime<=v)c(w),S.sortIndex=S.expirationTime,o(p,S);else break;S=r(w)}}function re(v){if(I=!1,oe(v),!z)if(r(p)!==null)z=!0,B||(B=!0,O());else{var S=r(w);S!==null&&L(re,S.startTime-v)}}var B=!1,F=-1,ne=5,Q=-1;function ge(){return $?!0:!(a.unstable_now()-Q<ne)}function C(){if($=!1,B){var v=a.unstable_now();Q=v;var S=!0;try{e:{z=!1,I&&(I=!1,te(F),F=-1),N=!0;var _=x;try{t:{for(oe(v),b=r(p);b!==null&&!(b.expirationTime>v&&ge());){var ae=b.callback;if(typeof ae=="function"){b.callback=null,x=b.priorityLevel;var R=ae(b.expirationTime<=v);if(v=a.unstable_now(),typeof R=="function"){b.callback=R,oe(v),S=!0;break t}b===r(p)&&c(p),oe(v)}else c(p);b=r(p)}if(b!==null)S=!0;else{var k=r(w);k!==null&&L(re,k.startTime-v),S=!1}}break e}finally{b=null,x=_,N=!1}S=void 0}}finally{S?O():B=!1}}}var O;if(typeof se=="function")O=function(){se(C)};else if(typeof MessageChannel<"u"){var E=new MessageChannel,Z=E.port2;E.port1.onmessage=C,O=function(){Z.postMessage(null)}}else O=function(){X(C,0)};function L(v,S){F=X(function(){v(a.unstable_now())},S)}a.unstable_IdlePriority=5,a.unstable_ImmediatePriority=1,a.unstable_LowPriority=4,a.unstable_NormalPriority=3,a.unstable_Profiling=null,a.unstable_UserBlockingPriority=2,a.unstable_cancelCallback=function(v){v.callback=null},a.unstable_forceFrameRate=function(v){0>v||125<v?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):ne=0<v?Math.floor(1e3/v):5},a.unstable_getCurrentPriorityLevel=function(){return x},a.unstable_next=function(v){switch(x){case 1:case 2:case 3:var S=3;break;default:S=x}var _=x;x=S;try{return v()}finally{x=_}},a.unstable_requestPaint=function(){$=!0},a.unstable_runWithPriority=function(v,S){switch(v){case 1:case 2:case 3:case 4:case 5:break;default:v=3}var _=x;x=v;try{return S()}finally{x=_}},a.unstable_scheduleCallback=function(v,S,_){var ae=a.unstable_now();switch(typeof _=="object"&&_!==null?(_=_.delay,_=typeof _=="number"&&0<_?ae+_:ae):_=ae,v){case 1:var R=-1;break;case 2:R=250;break;case 5:R=1073741823;break;case 4:R=1e4;break;default:R=5e3}return R=_+R,v={id:T++,callback:S,priorityLevel:v,startTime:_,expirationTime:R,sortIndex:-1},_>ae?(v.sortIndex=_,o(w,v),r(p)===null&&v===r(w)&&(I?(te(F),F=-1):I=!0,L(re,_-ae))):(v.sortIndex=R,o(p,v),z||N||(z=!0,B||(B=!0,O()))),v},a.unstable_shouldYield=ge,a.unstable_wrapCallback=function(v){var S=x;return function(){var _=x;x=S;try{return v.apply(this,arguments)}finally{x=_}}}})(ed)),ed}var Ty;function fk(){return Ty||(Ty=1,Zh.exports=pk()),Zh.exports}var td={exports:{}},Gt={};var xy;function yk(){if(xy)return Gt;xy=1;var a=Od();function o(p){var w="https://react.dev/errors/"+p;if(1<arguments.length){w+="?args[]="+encodeURIComponent(arguments[1]);for(var T=2;T<arguments.length;T++)w+="&args[]="+encodeURIComponent(arguments[T])}return"Minified React error #"+p+"; visit "+w+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function r(){}var c={d:{f:r,r:function(){throw Error(o(522))},D:r,C:r,L:r,m:r,X:r,S:r,M:r},p:0,findDOMNode:null},d=Symbol.for("react.portal");function u(p,w,T){var b=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:d,key:b==null?null:""+b,children:p,containerInfo:w,implementation:T}}var g=a.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function y(p,w){if(p==="font")return"";if(typeof w=="string")return w==="use-credentials"?w:""}return Gt.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=c,Gt.createPortal=function(p,w){var T=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!w||w.nodeType!==1&&w.nodeType!==9&&w.nodeType!==11)throw Error(o(299));return u(p,w,null,T)},Gt.flushSync=function(p){var w=g.T,T=c.p;try{if(g.T=null,c.p=2,p)return p()}finally{g.T=w,c.p=T,c.d.f()}},Gt.preconnect=function(p,w){typeof p=="string"&&(w?(w=w.crossOrigin,w=typeof w=="string"?w==="use-credentials"?w:"":void 0):w=null,c.d.C(p,w))},Gt.prefetchDNS=function(p){typeof p=="string"&&c.d.D(p)},Gt.preinit=function(p,w){if(typeof p=="string"&&w&&typeof w.as=="string"){var T=w.as,b=y(T,w.crossOrigin),x=typeof w.integrity=="string"?w.integrity:void 0,N=typeof w.fetchPriority=="string"?w.fetchPriority:void 0;T==="style"?c.d.S(p,typeof w.precedence=="string"?w.precedence:void 0,{crossOrigin:b,integrity:x,fetchPriority:N}):T==="script"&&c.d.X(p,{crossOrigin:b,integrity:x,fetchPriority:N,nonce:typeof w.nonce=="string"?w.nonce:void 0})}},Gt.preinitModule=function(p,w){if(typeof p=="string")if(typeof w=="object"&&w!==null){if(w.as==null||w.as==="script"){var T=y(w.as,w.crossOrigin);c.d.M(p,{crossOrigin:T,integrity:typeof w.integrity=="string"?w.integrity:void 0,nonce:typeof w.nonce=="string"?w.nonce:void 0})}}else w==null&&c.d.M(p)},Gt.preload=function(p,w){if(typeof p=="string"&&typeof w=="object"&&w!==null&&typeof w.as=="string"){var T=w.as,b=y(T,w.crossOrigin);c.d.L(p,T,{crossOrigin:b,integrity:typeof w.integrity=="string"?w.integrity:void 0,nonce:typeof w.nonce=="string"?w.nonce:void 0,type:typeof w.type=="string"?w.type:void 0,fetchPriority:typeof w.fetchPriority=="string"?w.fetchPriority:void 0,referrerPolicy:typeof w.referrerPolicy=="string"?w.referrerPolicy:void 0,imageSrcSet:typeof w.imageSrcSet=="string"?w.imageSrcSet:void 0,imageSizes:typeof w.imageSizes=="string"?w.imageSizes:void 0,media:typeof w.media=="string"?w.media:void 0})}},Gt.preloadModule=function(p,w){if(typeof p=="string")if(w){var T=y(w.as,w.crossOrigin);c.d.m(p,{as:typeof w.as=="string"&&w.as!=="script"?w.as:void 0,crossOrigin:T,integrity:typeof w.integrity=="string"?w.integrity:void 0})}else c.d.m(p)},Gt.requestFormReset=function(p){c.d.r(p)},Gt.unstable_batchedUpdates=function(p,w){return p(w)},Gt.useFormState=function(p,w,T){return g.H.useFormState(p,w,T)},Gt.useFormStatus=function(){return g.H.useHostTransitionStatus()},Gt.version="19.2.8",Gt}var Sy;function kg(){if(Sy)return td.exports;Sy=1;function a(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(a)}catch(o){console.error(o)}}return a(),td.exports=yk(),td.exports}var My;function gk(){if(My)return wo;My=1;var a=fk(),o=Od(),r=kg();function c(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)t+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function d(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function u(e){var t=e,n=e;if(e.alternate)for(;t.return;)t=t.return;else{e=t;do t=e,(t.flags&4098)!==0&&(n=t.return),e=t.return;while(e)}return t.tag===3?n:null}function g(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function y(e){if(e.tag===31){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function p(e){if(u(e)!==e)throw Error(c(188))}function w(e){var t=e.alternate;if(!t){if(t=u(e),t===null)throw Error(c(188));return t!==e?null:e}for(var n=e,i=t;;){var l=n.return;if(l===null)break;var h=l.alternate;if(h===null){if(i=l.return,i!==null){n=i;continue}break}if(l.child===h.child){for(h=l.child;h;){if(h===n)return p(l),e;if(h===i)return p(l),t;h=h.sibling}throw Error(c(188))}if(n.return!==i.return)n=l,i=h;else{for(var m=!1,f=l.child;f;){if(f===n){m=!0,n=l,i=h;break}if(f===i){m=!0,i=l,n=h;break}f=f.sibling}if(!m){for(f=h.child;f;){if(f===n){m=!0,n=h,i=l;break}if(f===i){m=!0,i=h,n=l;break}f=f.sibling}if(!m)throw Error(c(189))}}if(n.alternate!==i)throw Error(c(190))}if(n.tag!==3)throw Error(c(188));return n.stateNode.current===n?e:t}function T(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e;for(e=e.child;e!==null;){if(t=T(e),t!==null)return t;e=e.sibling}return null}var b=Object.assign,x=Symbol.for("react.element"),N=Symbol.for("react.transitional.element"),z=Symbol.for("react.portal"),I=Symbol.for("react.fragment"),$=Symbol.for("react.strict_mode"),X=Symbol.for("react.profiler"),te=Symbol.for("react.consumer"),se=Symbol.for("react.context"),oe=Symbol.for("react.forward_ref"),re=Symbol.for("react.suspense"),B=Symbol.for("react.suspense_list"),F=Symbol.for("react.memo"),ne=Symbol.for("react.lazy"),Q=Symbol.for("react.activity"),ge=Symbol.for("react.memo_cache_sentinel"),C=Symbol.iterator;function O(e){return e===null||typeof e!="object"?null:(e=C&&e[C]||e["@@iterator"],typeof e=="function"?e:null)}var E=Symbol.for("react.client.reference");function Z(e){if(e==null)return null;if(typeof e=="function")return e.$$typeof===E?null:e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case I:return"Fragment";case X:return"Profiler";case $:return"StrictMode";case re:return"Suspense";case B:return"SuspenseList";case Q:return"Activity"}if(typeof e=="object")switch(e.$$typeof){case z:return"Portal";case se:return e.displayName||"Context";case te:return(e._context.displayName||"Context")+".Consumer";case oe:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case F:return t=e.displayName||null,t!==null?t:Z(e.type)||"Memo";case ne:t=e._payload,e=e._init;try{return Z(e(t))}catch{}}return null}var L=Array.isArray,v=o.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,S=r.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,_={pending:!1,data:null,method:null,action:null},ae=[],R=-1;function k(e){return{current:e}}function M(e){0>R||(e.current=ae[R],ae[R]=null,R--)}function G(e,t){R++,ae[R]=e.current,e.current=t}var J=k(null),ie=k(null),me=k(null),ve=k(null);function ce(e,t){switch(G(me,t),G(ie,e),G(J,null),t.nodeType){case 9:case 11:e=(e=t.documentElement)&&(e=e.namespaceURI)?Of(e):0;break;default:if(e=t.tagName,t=t.namespaceURI)t=Of(t),e=qf(t,e);else switch(e){case"svg":e=1;break;case"math":e=2;break;default:e=0}}M(J),G(J,e)}function be(){M(J),M(ie),M(me)}function Se(e){e.memoizedState!==null&&G(ve,e);var t=J.current,n=qf(t,e.type);t!==n&&(G(ie,e),G(J,n))}function he(e){ie.current===e&&(M(J),M(ie)),ve.current===e&&(M(ve),mo._currentValue=_)}var ze,Ue;function de(e){if(ze===void 0)try{throw Error()}catch(n){var t=n.stack.trim().match(/\n( *(at )?)/);ze=t&&t[1]||"",Ue=-1<n.stack.indexOf(`
    at`)?" (<anonymous>)":-1<n.stack.indexOf("@")?"@unknown:0:0":""}return`
`+ze+e+Ue}var fe=!1;function Ne(e,t){if(!e||fe)return"";fe=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var i={DetermineComponentFrameRoot:function(){try{if(t){var V=function(){throw Error()};if(Object.defineProperty(V.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(V,[])}catch(U){var P=U}Reflect.construct(e,[],V)}else{try{V.call()}catch(U){P=U}e.call(V.prototype)}}else{try{throw Error()}catch(U){P=U}(V=e())&&typeof V.catch=="function"&&V.catch(function(){})}}catch(U){if(U&&P&&typeof U.stack=="string")return[U.stack,P.stack]}return[null,null]}};i.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var l=Object.getOwnPropertyDescriptor(i.DetermineComponentFrameRoot,"name");l&&l.configurable&&Object.defineProperty(i.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var h=i.DetermineComponentFrameRoot(),m=h[0],f=h[1];if(m&&f){var j=m.split(`
`),D=f.split(`
`);for(l=i=0;i<j.length&&!j[i].includes("DetermineComponentFrameRoot");)i++;for(;l<D.length&&!D[l].includes("DetermineComponentFrameRoot");)l++;if(i===j.length||l===D.length)for(i=j.length-1,l=D.length-1;1<=i&&0<=l&&j[i]!==D[l];)l--;for(;1<=i&&0<=l;i--,l--)if(j[i]!==D[l]){if(i!==1||l!==1)do if(i--,l--,0>l||j[i]!==D[l]){var K=`
`+j[i].replace(" at new "," at ");return e.displayName&&K.includes("<anonymous>")&&(K=K.replace("<anonymous>",e.displayName)),K}while(1<=i&&0<=l);break}}}finally{fe=!1,Error.prepareStackTrace=n}return(n=e?e.displayName||e.name:"")?de(n):""}function Oe(e,t){switch(e.tag){case 26:case 27:case 5:return de(e.type);case 16:return de("Lazy");case 13:return e.child!==t&&t!==null?de("Suspense Fallback"):de("Suspense");case 19:return de("SuspenseList");case 0:case 15:return Ne(e.type,!1);case 11:return Ne(e.type.render,!1);case 1:return Ne(e.type,!0);case 31:return de("Activity");default:return""}}function ht(e){try{var t="",n=null;do t+=Oe(e,n),n=e,e=e.return;while(e);return t}catch(i){return`
Error generating stack: `+i.message+`
`+i.stack}}var yt=Object.prototype.hasOwnProperty,_t=a.unstable_scheduleCallback,Lt=a.unstable_cancelCallback,nt=a.unstable_shouldYield,Pt=a.unstable_requestPaint,Tt=a.unstable_now,le=a.unstable_getCurrentPriorityLevel,je=a.unstable_ImmediatePriority,Pe=a.unstable_UserBlockingPriority,xt=a.unstable_NormalPriority,tn=a.unstable_LowPriority,dt=a.unstable_IdlePriority,gt=a.log,Hn=a.unstable_setDisableYieldValue,un=null,rt=null;function Ut(e){if(typeof gt=="function"&&Hn(e),rt&&typeof rt.setStrictMode=="function")try{rt.setStrictMode(un,e)}catch{}}var Ee=Math.clz32?Math.clz32:lt,ha=Math.log,bs=Math.LN2;function lt(e){return e>>>=0,e===0?32:31-(ha(e)/bs|0)|0}var jn=256,Ko=262144,Yo=4194304;function Ja(e){var t=e&42;if(t!==0)return t;switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return e&261888;case 262144:case 524288:case 1048576:case 2097152:return e&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return e&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return e}}function Vo(e,t,n){var i=e.pendingLanes;if(i===0)return 0;var l=0,h=e.suspendedLanes,m=e.pingedLanes;e=e.warmLanes;var f=i&134217727;return f!==0?(i=f&~h,i!==0?l=Ja(i):(m&=f,m!==0?l=Ja(m):n||(n=f&~e,n!==0&&(l=Ja(n))))):(f=i&~h,f!==0?l=Ja(f):m!==0?l=Ja(m):n||(n=i&~e,n!==0&&(l=Ja(n)))),l===0?0:t!==0&&t!==l&&(t&h)===0&&(h=l&-l,n=t&-t,h>=n||h===32&&(n&4194048)!==0)?t:l}function Mi(e,t){return(e.pendingLanes&~(e.suspendedLanes&~e.pingedLanes)&t)===0}function Jw(e,t){switch(e){case 1:case 2:case 4:case 8:case 64:return t+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function yu(){var e=Yo;return Yo<<=1,(Yo&62914560)===0&&(Yo=4194304),e}function ql(e){for(var t=[],n=0;31>n;n++)t.push(e);return t}function ji(e,t){e.pendingLanes|=t,t!==268435456&&(e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0)}function _w(e,t,n,i,l,h){var m=e.pendingLanes;e.pendingLanes=n,e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0,e.expiredLanes&=n,e.entangledLanes&=n,e.errorRecoveryDisabledLanes&=n,e.shellSuspendCounter=0;var f=e.entanglements,j=e.expirationTimes,D=e.hiddenUpdates;for(n=m&~n;0<n;){var K=31-Ee(n),V=1<<K;f[K]=0,j[K]=-1;var P=D[K];if(P!==null)for(D[K]=null,K=0;K<P.length;K++){var U=P[K];U!==null&&(U.lane&=-536870913)}n&=~V}i!==0&&gu(e,i,0),h!==0&&l===0&&e.tag!==0&&(e.suspendedLanes|=h&~(m&~t))}function gu(e,t,n){e.pendingLanes|=t,e.suspendedLanes&=~t;var i=31-Ee(t);e.entangledLanes|=t,e.entanglements[i]=e.entanglements[i]|1073741824|n&261930}function wu(e,t){var n=e.entangledLanes|=t;for(e=e.entanglements;n;){var i=31-Ee(n),l=1<<i;l&t|e[i]&t&&(e[i]|=t),n&=~l}}function bu(e,t){var n=t&-t;return n=(n&42)!==0?1:Dl(n),(n&(e.suspendedLanes|t))!==0?0:n}function Dl(e){switch(e){case 2:e=1;break;case 8:e=4;break;case 32:e=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:e=128;break;case 268435456:e=134217728;break;default:e=0}return e}function Pl(e){return e&=-e,2<e?8<e?(e&134217727)!==0?32:268435456:8:2}function vu(){var e=S.p;return e!==0?e:(e=window.event,e===void 0?32:oy(e.type))}function ku(e,t){var n=S.p;try{return S.p=e,t()}finally{S.p=n}}var da=Math.random().toString(36).slice(2),Ht="__reactFiber$"+da,Bt="__reactProps$"+da,vs="__reactContainer$"+da,Gl="__reactEvents$"+da,Uw="__reactListeners$"+da,Bw="__reactHandles$"+da,Tu="__reactResources$"+da,Ci="__reactMarker$"+da;function zl(e){delete e[Ht],delete e[Bt],delete e[Gl],delete e[Uw],delete e[Bw]}function ks(e){var t=e[Ht];if(t)return t;for(var n=e.parentNode;n;){if(t=n[vs]||n[Ht]){if(n=t.alternate,t.child!==null||n!==null&&n.child!==null)for(e=Uf(e);e!==null;){if(n=e[Ht])return n;e=Uf(e)}return t}e=n,n=e.parentNode}return null}function Ts(e){if(e=e[Ht]||e[vs]){var t=e.tag;if(t===5||t===6||t===13||t===31||t===26||t===27||t===3)return e}return null}function Ai(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e.stateNode;throw Error(c(33))}function xs(e){var t=e[Tu];return t||(t=e[Tu]={hoistableStyles:new Map,hoistableScripts:new Map}),t}function jt(e){e[Ci]=!0}var xu=new Set,Su={};function _a(e,t){Ss(e,t),Ss(e+"Capture",t)}function Ss(e,t){for(Su[e]=t,e=0;e<t.length;e++)xu.add(t[e])}var Fw=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),Mu={},ju={};function $w(e){return yt.call(ju,e)?!0:yt.call(Mu,e)?!1:Fw.test(e)?ju[e]=!0:(Mu[e]=!0,!1)}function Xo(e,t,n){if($w(t))if(n===null)e.removeAttribute(t);else{switch(typeof n){case"undefined":case"function":case"symbol":e.removeAttribute(t);return;case"boolean":var i=t.toLowerCase().slice(0,5);if(i!=="data-"&&i!=="aria-"){e.removeAttribute(t);return}}e.setAttribute(t,""+n)}}function Qo(e,t,n){if(n===null)e.removeAttribute(t);else{switch(typeof n){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(t);return}e.setAttribute(t,""+n)}}function Jn(e,t,n,i){if(i===null)e.removeAttribute(n);else{switch(typeof i){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(n);return}e.setAttributeNS(t,n,""+i)}}function mn(e){switch(typeof e){case"bigint":case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function Cu(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function Kw(e,t,n){var i=Object.getOwnPropertyDescriptor(e.constructor.prototype,t);if(!e.hasOwnProperty(t)&&typeof i<"u"&&typeof i.get=="function"&&typeof i.set=="function"){var l=i.get,h=i.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return l.call(this)},set:function(m){n=""+m,h.call(this,m)}}),Object.defineProperty(e,t,{enumerable:i.enumerable}),{getValue:function(){return n},setValue:function(m){n=""+m},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function Jl(e){if(!e._valueTracker){var t=Cu(e)?"checked":"value";e._valueTracker=Kw(e,t,""+e[t])}}function Au(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var n=t.getValue(),i="";return e&&(i=Cu(e)?e.checked?"true":"false":e.value),e=i,e!==n?(t.setValue(e),!0):!1}function Zo(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}var Yw=/[\n"\\]/g;function pn(e){return e.replace(Yw,function(t){return"\\"+t.charCodeAt(0).toString(16)+" "})}function _l(e,t,n,i,l,h,m,f){e.name="",m!=null&&typeof m!="function"&&typeof m!="symbol"&&typeof m!="boolean"?e.type=m:e.removeAttribute("type"),t!=null?m==="number"?(t===0&&e.value===""||e.value!=t)&&(e.value=""+mn(t)):e.value!==""+mn(t)&&(e.value=""+mn(t)):m!=="submit"&&m!=="reset"||e.removeAttribute("value"),t!=null?Ul(e,m,mn(t)):n!=null?Ul(e,m,mn(n)):i!=null&&e.removeAttribute("value"),l==null&&h!=null&&(e.defaultChecked=!!h),l!=null&&(e.checked=l&&typeof l!="function"&&typeof l!="symbol"),f!=null&&typeof f!="function"&&typeof f!="symbol"&&typeof f!="boolean"?e.name=""+mn(f):e.removeAttribute("name")}function Nu(e,t,n,i,l,h,m,f){if(h!=null&&typeof h!="function"&&typeof h!="symbol"&&typeof h!="boolean"&&(e.type=h),t!=null||n!=null){if(!(h!=="submit"&&h!=="reset"||t!=null)){Jl(e);return}n=n!=null?""+mn(n):"",t=t!=null?""+mn(t):n,f||t===e.value||(e.value=t),e.defaultValue=t}i=i??l,i=typeof i!="function"&&typeof i!="symbol"&&!!i,e.checked=f?e.checked:!!i,e.defaultChecked=!!i,m!=null&&typeof m!="function"&&typeof m!="symbol"&&typeof m!="boolean"&&(e.name=m),Jl(e)}function Ul(e,t,n){t==="number"&&Zo(e.ownerDocument)===e||e.defaultValue===""+n||(e.defaultValue=""+n)}function Ms(e,t,n,i){if(e=e.options,t){t={};for(var l=0;l<n.length;l++)t["$"+n[l]]=!0;for(n=0;n<e.length;n++)l=t.hasOwnProperty("$"+e[n].value),e[n].selected!==l&&(e[n].selected=l),l&&i&&(e[n].defaultSelected=!0)}else{for(n=""+mn(n),t=null,l=0;l<e.length;l++){if(e[l].value===n){e[l].selected=!0,i&&(e[l].defaultSelected=!0);return}t!==null||e[l].disabled||(t=e[l])}t!==null&&(t.selected=!0)}}function Eu(e,t,n){if(t!=null&&(t=""+mn(t),t!==e.value&&(e.value=t),n==null)){e.defaultValue!==t&&(e.defaultValue=t);return}e.defaultValue=n!=null?""+mn(n):""}function Lu(e,t,n,i){if(t==null){if(i!=null){if(n!=null)throw Error(c(92));if(L(i)){if(1<i.length)throw Error(c(93));i=i[0]}n=i}n==null&&(n=""),t=n}n=mn(t),e.defaultValue=n,i=e.textContent,i===n&&i!==""&&i!==null&&(e.value=i),Jl(e)}function js(e,t){if(t){var n=e.firstChild;if(n&&n===e.lastChild&&n.nodeType===3){n.nodeValue=t;return}}e.textContent=t}var Vw=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function Hu(e,t,n){var i=t.indexOf("--")===0;n==null||typeof n=="boolean"||n===""?i?e.setProperty(t,""):t==="float"?e.cssFloat="":e[t]="":i?e.setProperty(t,n):typeof n!="number"||n===0||Vw.has(t)?t==="float"?e.cssFloat=n:e[t]=(""+n).trim():e[t]=n+"px"}function Wu(e,t,n){if(t!=null&&typeof t!="object")throw Error(c(62));if(e=e.style,n!=null){for(var i in n)!n.hasOwnProperty(i)||t!=null&&t.hasOwnProperty(i)||(i.indexOf("--")===0?e.setProperty(i,""):i==="float"?e.cssFloat="":e[i]="");for(var l in t)i=t[l],t.hasOwnProperty(l)&&n[l]!==i&&Hu(e,l,i)}else for(var h in t)t.hasOwnProperty(h)&&Hu(e,h,t[h])}function Bl(e){if(e.indexOf("-")===-1)return!1;switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var Xw=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),Qw=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function er(e){return Qw.test(""+e)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":e}function _n(){}var Fl=null;function $l(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var Cs=null,As=null;function Iu(e){var t=Ts(e);if(t&&(e=t.stateNode)){var n=e[Bt]||null;e:switch(e=t.stateNode,t.type){case"input":if(_l(e,n.value,n.defaultValue,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name),t=n.name,n.type==="radio"&&t!=null){for(n=e;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll('input[name="'+pn(""+t)+'"][type="radio"]'),t=0;t<n.length;t++){var i=n[t];if(i!==e&&i.form===e.form){var l=i[Bt]||null;if(!l)throw Error(c(90));_l(i,l.value,l.defaultValue,l.defaultValue,l.checked,l.defaultChecked,l.type,l.name)}}for(t=0;t<n.length;t++)i=n[t],i.form===e.form&&Au(i)}break e;case"textarea":Eu(e,n.value,n.defaultValue);break e;case"select":t=n.value,t!=null&&Ms(e,!!n.multiple,t,!1)}}}var Kl=!1;function Ru(e,t,n){if(Kl)return e(t,n);Kl=!0;try{var i=e(t);return i}finally{if(Kl=!1,(Cs!==null||As!==null)&&(zr(),Cs&&(t=Cs,e=As,As=Cs=null,Iu(t),e)))for(t=0;t<e.length;t++)Iu(e[t])}}function Ni(e,t){var n=e.stateNode;if(n===null)return null;var i=n[Bt]||null;if(i===null)return null;n=i[t];e:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(i=!i.disabled)||(e=e.type,i=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!i;break e;default:e=!1}if(e)return null;if(n&&typeof n!="function")throw Error(c(231,t,typeof n));return n}var Un=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),Yl=!1;if(Un)try{var Ei={};Object.defineProperty(Ei,"passive",{get:function(){Yl=!0}}),window.addEventListener("test",Ei,Ei),window.removeEventListener("test",Ei,Ei)}catch{Yl=!1}var ua=null,Vl=null,tr=null;function Ou(){if(tr)return tr;var e,t=Vl,n=t.length,i,l="value"in ua?ua.value:ua.textContent,h=l.length;for(e=0;e<n&&t[e]===l[e];e++);var m=n-e;for(i=1;i<=m&&t[n-i]===l[h-i];i++);return tr=l.slice(e,1<i?1-i:void 0)}function nr(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function ar(){return!0}function qu(){return!1}function Ft(e){function t(n,i,l,h,m){this._reactName=n,this._targetInst=l,this.type=i,this.nativeEvent=h,this.target=m,this.currentTarget=null;for(var f in e)e.hasOwnProperty(f)&&(n=e[f],this[f]=n?n(h):h[f]);return this.isDefaultPrevented=(h.defaultPrevented!=null?h.defaultPrevented:h.returnValue===!1)?ar:qu,this.isPropagationStopped=qu,this}return b(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=ar)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=ar)},persist:function(){},isPersistent:ar}),t}var Ua={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},sr=Ft(Ua),Li=b({},Ua,{view:0,detail:0}),Zw=Ft(Li),Xl,Ql,Hi,ir=b({},Li,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:ec,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==Hi&&(Hi&&e.type==="mousemove"?(Xl=e.screenX-Hi.screenX,Ql=e.screenY-Hi.screenY):Ql=Xl=0,Hi=e),Xl)},movementY:function(e){return"movementY"in e?e.movementY:Ql}}),Du=Ft(ir),eb=b({},ir,{dataTransfer:0}),tb=Ft(eb),nb=b({},Li,{relatedTarget:0}),Zl=Ft(nb),ab=b({},Ua,{animationName:0,elapsedTime:0,pseudoElement:0}),sb=Ft(ab),ib=b({},Ua,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),ob=Ft(ib),rb=b({},Ua,{data:0}),Pu=Ft(rb),lb={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},cb={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},hb={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function db(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=hb[e])?!!t[e]:!1}function ec(){return db}var ub=b({},Li,{key:function(e){if(e.key){var t=lb[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=nr(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?cb[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:ec,charCode:function(e){return e.type==="keypress"?nr(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?nr(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),mb=Ft(ub),pb=b({},ir,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Gu=Ft(pb),fb=b({},Li,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:ec}),yb=Ft(fb),gb=b({},Ua,{propertyName:0,elapsedTime:0,pseudoElement:0}),wb=Ft(gb),bb=b({},ir,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),vb=Ft(bb),kb=b({},Ua,{newState:0,oldState:0}),Tb=Ft(kb),xb=[9,13,27,32],tc=Un&&"CompositionEvent"in window,Wi=null;Un&&"documentMode"in document&&(Wi=document.documentMode);var Sb=Un&&"TextEvent"in window&&!Wi,zu=Un&&(!tc||Wi&&8<Wi&&11>=Wi),Ju=" ",_u=!1;function Uu(e,t){switch(e){case"keyup":return xb.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Bu(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var Ns=!1;function Mb(e,t){switch(e){case"compositionend":return Bu(t);case"keypress":return t.which!==32?null:(_u=!0,Ju);case"textInput":return e=t.data,e===Ju&&_u?null:e;default:return null}}function jb(e,t){if(Ns)return e==="compositionend"||!tc&&Uu(e,t)?(e=Ou(),tr=Vl=ua=null,Ns=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return zu&&t.locale!=="ko"?null:t.data;default:return null}}var Cb={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Fu(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!Cb[e.type]:t==="textarea"}function $u(e,t,n,i){Cs?As?As.push(i):As=[i]:Cs=i,t=Kr(t,"onChange"),0<t.length&&(n=new sr("onChange","change",null,n,i),e.push({event:n,listeners:t}))}var Ii=null,Ri=null;function Ab(e){Ef(e,0)}function or(e){var t=Ai(e);if(Au(t))return e}function Ku(e,t){if(e==="change")return t}var Yu=!1;if(Un){var nc;if(Un){var ac="oninput"in document;if(!ac){var Vu=document.createElement("div");Vu.setAttribute("oninput","return;"),ac=typeof Vu.oninput=="function"}nc=ac}else nc=!1;Yu=nc&&(!document.documentMode||9<document.documentMode)}function Xu(){Ii&&(Ii.detachEvent("onpropertychange",Qu),Ri=Ii=null)}function Qu(e){if(e.propertyName==="value"&&or(Ri)){var t=[];$u(t,Ri,e,$l(e)),Ru(Ab,t)}}function Nb(e,t,n){e==="focusin"?(Xu(),Ii=t,Ri=n,Ii.attachEvent("onpropertychange",Qu)):e==="focusout"&&Xu()}function Eb(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return or(Ri)}function Lb(e,t){if(e==="click")return or(t)}function Hb(e,t){if(e==="input"||e==="change")return or(t)}function Wb(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var nn=typeof Object.is=="function"?Object.is:Wb;function Oi(e,t){if(nn(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var n=Object.keys(e),i=Object.keys(t);if(n.length!==i.length)return!1;for(i=0;i<n.length;i++){var l=n[i];if(!yt.call(t,l)||!nn(e[l],t[l]))return!1}return!0}function Zu(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function em(e,t){var n=Zu(e);e=0;for(var i;n;){if(n.nodeType===3){if(i=e+n.textContent.length,e<=t&&i>=t)return{node:n,offset:t-e};e=i}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=Zu(n)}}function tm(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?tm(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function nm(e){e=e!=null&&e.ownerDocument!=null&&e.ownerDocument.defaultView!=null?e.ownerDocument.defaultView:window;for(var t=Zo(e.document);t instanceof e.HTMLIFrameElement;){try{var n=typeof t.contentWindow.location.href=="string"}catch{n=!1}if(n)e=t.contentWindow;else break;t=Zo(e.document)}return t}function sc(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}var Ib=Un&&"documentMode"in document&&11>=document.documentMode,Es=null,ic=null,qi=null,oc=!1;function am(e,t,n){var i=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;oc||Es==null||Es!==Zo(i)||(i=Es,"selectionStart"in i&&sc(i)?i={start:i.selectionStart,end:i.selectionEnd}:(i=(i.ownerDocument&&i.ownerDocument.defaultView||window).getSelection(),i={anchorNode:i.anchorNode,anchorOffset:i.anchorOffset,focusNode:i.focusNode,focusOffset:i.focusOffset}),qi&&Oi(qi,i)||(qi=i,i=Kr(ic,"onSelect"),0<i.length&&(t=new sr("onSelect","select",null,t,n),e.push({event:t,listeners:i}),t.target=Es)))}function Ba(e,t){var n={};return n[e.toLowerCase()]=t.toLowerCase(),n["Webkit"+e]="webkit"+t,n["Moz"+e]="moz"+t,n}var Ls={animationend:Ba("Animation","AnimationEnd"),animationiteration:Ba("Animation","AnimationIteration"),animationstart:Ba("Animation","AnimationStart"),transitionrun:Ba("Transition","TransitionRun"),transitionstart:Ba("Transition","TransitionStart"),transitioncancel:Ba("Transition","TransitionCancel"),transitionend:Ba("Transition","TransitionEnd")},rc={},sm={};Un&&(sm=document.createElement("div").style,"AnimationEvent"in window||(delete Ls.animationend.animation,delete Ls.animationiteration.animation,delete Ls.animationstart.animation),"TransitionEvent"in window||delete Ls.transitionend.transition);function Fa(e){if(rc[e])return rc[e];if(!Ls[e])return e;var t=Ls[e],n;for(n in t)if(t.hasOwnProperty(n)&&n in sm)return rc[e]=t[n];return e}var im=Fa("animationend"),om=Fa("animationiteration"),rm=Fa("animationstart"),Rb=Fa("transitionrun"),Ob=Fa("transitionstart"),qb=Fa("transitioncancel"),lm=Fa("transitionend"),cm=new Map,lc="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");lc.push("scrollEnd");function Cn(e,t){cm.set(e,t),_a(t,[e])}var rr=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)},fn=[],Hs=0,cc=0;function lr(){for(var e=Hs,t=cc=Hs=0;t<e;){var n=fn[t];fn[t++]=null;var i=fn[t];fn[t++]=null;var l=fn[t];fn[t++]=null;var h=fn[t];if(fn[t++]=null,i!==null&&l!==null){var m=i.pending;m===null?l.next=l:(l.next=m.next,m.next=l),i.pending=l}h!==0&&hm(n,l,h)}}function cr(e,t,n,i){fn[Hs++]=e,fn[Hs++]=t,fn[Hs++]=n,fn[Hs++]=i,cc|=i,e.lanes|=i,e=e.alternate,e!==null&&(e.lanes|=i)}function hc(e,t,n,i){return cr(e,t,n,i),hr(e)}function $a(e,t){return cr(e,null,null,t),hr(e)}function hm(e,t,n){e.lanes|=n;var i=e.alternate;i!==null&&(i.lanes|=n);for(var l=!1,h=e.return;h!==null;)h.childLanes|=n,i=h.alternate,i!==null&&(i.childLanes|=n),h.tag===22&&(e=h.stateNode,e===null||e._visibility&1||(l=!0)),e=h,h=h.return;return e.tag===3?(h=e.stateNode,l&&t!==null&&(l=31-Ee(n),e=h.hiddenUpdates,i=e[l],i===null?e[l]=[t]:i.push(t),t.lane=n|536870912),h):null}function hr(e){if(50<io)throw io=0,bh=null,Error(c(185));for(var t=e.return;t!==null;)e=t,t=e.return;return e.tag===3?e.stateNode:null}var Ws={};function Db(e,t,n,i){this.tag=e,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=i,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function an(e,t,n,i){return new Db(e,t,n,i)}function dc(e){return e=e.prototype,!(!e||!e.isReactComponent)}function Bn(e,t){var n=e.alternate;return n===null?(n=an(e.tag,t,e.key,e.mode),n.elementType=e.elementType,n.type=e.type,n.stateNode=e.stateNode,n.alternate=e,e.alternate=n):(n.pendingProps=t,n.type=e.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=e.flags&65011712,n.childLanes=e.childLanes,n.lanes=e.lanes,n.child=e.child,n.memoizedProps=e.memoizedProps,n.memoizedState=e.memoizedState,n.updateQueue=e.updateQueue,t=e.dependencies,n.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},n.sibling=e.sibling,n.index=e.index,n.ref=e.ref,n.refCleanup=e.refCleanup,n}function dm(e,t){e.flags&=65011714;var n=e.alternate;return n===null?(e.childLanes=0,e.lanes=t,e.child=null,e.subtreeFlags=0,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.stateNode=null):(e.childLanes=n.childLanes,e.lanes=n.lanes,e.child=n.child,e.subtreeFlags=0,e.deletions=null,e.memoizedProps=n.memoizedProps,e.memoizedState=n.memoizedState,e.updateQueue=n.updateQueue,e.type=n.type,t=n.dependencies,e.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),e}function dr(e,t,n,i,l,h){var m=0;if(i=e,typeof e=="function")dc(e)&&(m=1);else if(typeof e=="string")m=_v(e,n,J.current)?26:e==="html"||e==="head"||e==="body"?27:5;else e:switch(e){case Q:return e=an(31,n,t,l),e.elementType=Q,e.lanes=h,e;case I:return Ka(n.children,l,h,t);case $:m=8,l|=24;break;case X:return e=an(12,n,t,l|2),e.elementType=X,e.lanes=h,e;case re:return e=an(13,n,t,l),e.elementType=re,e.lanes=h,e;case B:return e=an(19,n,t,l),e.elementType=B,e.lanes=h,e;default:if(typeof e=="object"&&e!==null)switch(e.$$typeof){case se:m=10;break e;case te:m=9;break e;case oe:m=11;break e;case F:m=14;break e;case ne:m=16,i=null;break e}m=29,n=Error(c(130,e===null?"null":typeof e,"")),i=null}return t=an(m,n,t,l),t.elementType=e,t.type=i,t.lanes=h,t}function Ka(e,t,n,i){return e=an(7,e,i,t),e.lanes=n,e}function uc(e,t,n){return e=an(6,e,null,t),e.lanes=n,e}function um(e){var t=an(18,null,null,0);return t.stateNode=e,t}function mc(e,t,n){return t=an(4,e.children!==null?e.children:[],e.key,t),t.lanes=n,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}var mm=new WeakMap;function yn(e,t){if(typeof e=="object"&&e!==null){var n=mm.get(e);return n!==void 0?n:(t={value:e,source:t,stack:ht(t)},mm.set(e,t),t)}return{value:e,source:t,stack:ht(t)}}var Is=[],Rs=0,ur=null,Di=0,gn=[],wn=0,ma=null,Wn=1,In="";function Fn(e,t){Is[Rs++]=Di,Is[Rs++]=ur,ur=e,Di=t}function pm(e,t,n){gn[wn++]=Wn,gn[wn++]=In,gn[wn++]=ma,ma=e;var i=Wn;e=In;var l=32-Ee(i)-1;i&=~(1<<l),n+=1;var h=32-Ee(t)+l;if(30<h){var m=l-l%5;h=(i&(1<<m)-1).toString(32),i>>=m,l-=m,Wn=1<<32-Ee(t)+l|n<<l|i,In=h+e}else Wn=1<<h|n<<l|i,In=e}function pc(e){e.return!==null&&(Fn(e,1),pm(e,1,0))}function fc(e){for(;e===ur;)ur=Is[--Rs],Is[Rs]=null,Di=Is[--Rs],Is[Rs]=null;for(;e===ma;)ma=gn[--wn],gn[wn]=null,In=gn[--wn],gn[wn]=null,Wn=gn[--wn],gn[wn]=null}function fm(e,t){gn[wn++]=Wn,gn[wn++]=In,gn[wn++]=ma,Wn=t.id,In=t.overflow,ma=e}var Wt=null,at=null,qe=!1,pa=null,bn=!1,yc=Error(c(519));function fa(e){var t=Error(c(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw Pi(yn(t,e)),yc}function ym(e){var t=e.stateNode,n=e.type,i=e.memoizedProps;switch(t[Ht]=e,t[Bt]=i,n){case"dialog":He("cancel",t),He("close",t);break;case"iframe":case"object":case"embed":He("load",t);break;case"video":case"audio":for(n=0;n<ro.length;n++)He(ro[n],t);break;case"source":He("error",t);break;case"img":case"image":case"link":He("error",t),He("load",t);break;case"details":He("toggle",t);break;case"input":He("invalid",t),Nu(t,i.value,i.defaultValue,i.checked,i.defaultChecked,i.type,i.name,!0);break;case"select":He("invalid",t);break;case"textarea":He("invalid",t),Lu(t,i.value,i.defaultValue,i.children)}n=i.children,typeof n!="string"&&typeof n!="number"&&typeof n!="bigint"||t.textContent===""+n||i.suppressHydrationWarning===!0||If(t.textContent,n)?(i.popover!=null&&(He("beforetoggle",t),He("toggle",t)),i.onScroll!=null&&He("scroll",t),i.onScrollEnd!=null&&He("scrollend",t),i.onClick!=null&&(t.onclick=_n),t=!0):t=!1,t||fa(e,!0)}function gm(e){for(Wt=e.return;Wt;)switch(Wt.tag){case 5:case 31:case 13:bn=!1;return;case 27:case 3:bn=!0;return;default:Wt=Wt.return}}function Os(e){if(e!==Wt)return!1;if(!qe)return gm(e),qe=!0,!1;var t=e.tag,n;if((n=t!==3&&t!==27)&&((n=t===5)&&(n=e.type,n=!(n!=="form"&&n!=="button")||Ih(e.type,e.memoizedProps)),n=!n),n&&at&&fa(e),gm(e),t===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(c(317));at=_f(e)}else if(t===31){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(c(317));at=_f(e)}else t===27?(t=at,Na(e.type)?(e=Ph,Ph=null,at=e):at=t):at=Wt?kn(e.stateNode.nextSibling):null;return!0}function Ya(){at=Wt=null,qe=!1}function gc(){var e=pa;return e!==null&&(Vt===null?Vt=e:Vt.push.apply(Vt,e),pa=null),e}function Pi(e){pa===null?pa=[e]:pa.push(e)}var wc=k(null),Va=null,$n=null;function ya(e,t,n){G(wc,t._currentValue),t._currentValue=n}function Kn(e){e._currentValue=wc.current,M(wc)}function bc(e,t,n){for(;e!==null;){var i=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,i!==null&&(i.childLanes|=t)):i!==null&&(i.childLanes&t)!==t&&(i.childLanes|=t),e===n)break;e=e.return}}function vc(e,t,n,i){var l=e.child;for(l!==null&&(l.return=e);l!==null;){var h=l.dependencies;if(h!==null){var m=l.child;h=h.firstContext;e:for(;h!==null;){var f=h;h=l;for(var j=0;j<t.length;j++)if(f.context===t[j]){h.lanes|=n,f=h.alternate,f!==null&&(f.lanes|=n),bc(h.return,n,e),i||(m=null);break e}h=f.next}}else if(l.tag===18){if(m=l.return,m===null)throw Error(c(341));m.lanes|=n,h=m.alternate,h!==null&&(h.lanes|=n),bc(m,n,e),m=null}else m=l.child;if(m!==null)m.return=l;else for(m=l;m!==null;){if(m===e){m=null;break}if(l=m.sibling,l!==null){l.return=m.return,m=l;break}m=m.return}l=m}}function qs(e,t,n,i){e=null;for(var l=t,h=!1;l!==null;){if(!h){if((l.flags&524288)!==0)h=!0;else if((l.flags&262144)!==0)break}if(l.tag===10){var m=l.alternate;if(m===null)throw Error(c(387));if(m=m.memoizedProps,m!==null){var f=l.type;nn(l.pendingProps.value,m.value)||(e!==null?e.push(f):e=[f])}}else if(l===ve.current){if(m=l.alternate,m===null)throw Error(c(387));m.memoizedState.memoizedState!==l.memoizedState.memoizedState&&(e!==null?e.push(mo):e=[mo])}l=l.return}e!==null&&vc(t,e,n,i),t.flags|=262144}function mr(e){for(e=e.firstContext;e!==null;){if(!nn(e.context._currentValue,e.memoizedValue))return!0;e=e.next}return!1}function Xa(e){Va=e,$n=null,e=e.dependencies,e!==null&&(e.firstContext=null)}function It(e){return wm(Va,e)}function pr(e,t){return Va===null&&Xa(e),wm(e,t)}function wm(e,t){var n=t._currentValue;if(t={context:t,memoizedValue:n,next:null},$n===null){if(e===null)throw Error(c(308));$n=t,e.dependencies={lanes:0,firstContext:t},e.flags|=524288}else $n=$n.next=t;return n}var Pb=typeof AbortController<"u"?AbortController:function(){var e=[],t=this.signal={aborted:!1,addEventListener:function(n,i){e.push(i)}};this.abort=function(){t.aborted=!0,e.forEach(function(n){return n()})}},Gb=a.unstable_scheduleCallback,zb=a.unstable_NormalPriority,wt={$$typeof:se,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function kc(){return{controller:new Pb,data:new Map,refCount:0}}function Gi(e){e.refCount--,e.refCount===0&&Gb(zb,function(){e.controller.abort()})}var zi=null,Tc=0,Ds=0,Ps=null;function Jb(e,t){if(zi===null){var n=zi=[];Tc=0,Ds=Mh(),Ps={status:"pending",value:void 0,then:function(i){n.push(i)}}}return Tc++,t.then(bm,bm),t}function bm(){if(--Tc===0&&zi!==null){Ps!==null&&(Ps.status="fulfilled");var e=zi;zi=null,Ds=0,Ps=null;for(var t=0;t<e.length;t++)(0,e[t])()}}function _b(e,t){var n=[],i={status:"pending",value:null,reason:null,then:function(l){n.push(l)}};return e.then(function(){i.status="fulfilled",i.value=t;for(var l=0;l<n.length;l++)(0,n[l])(t)},function(l){for(i.status="rejected",i.reason=l,l=0;l<n.length;l++)(0,n[l])(void 0)}),i}var vm=v.S;v.S=function(e,t){af=Tt(),typeof t=="object"&&t!==null&&typeof t.then=="function"&&Jb(e,t),vm!==null&&vm(e,t)};var Qa=k(null);function xc(){var e=Qa.current;return e!==null?e:et.pooledCache}function fr(e,t){t===null?G(Qa,Qa.current):G(Qa,t.pool)}function km(){var e=xc();return e===null?null:{parent:wt._currentValue,pool:e}}var Gs=Error(c(460)),Sc=Error(c(474)),yr=Error(c(542)),gr={then:function(){}};function Tm(e){return e=e.status,e==="fulfilled"||e==="rejected"}function xm(e,t,n){switch(n=e[n],n===void 0?e.push(t):n!==t&&(t.then(_n,_n),t=n),t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,Mm(e),e;default:if(typeof t.status=="string")t.then(_n,_n);else{if(e=et,e!==null&&100<e.shellSuspendCounter)throw Error(c(482));e=t,e.status="pending",e.then(function(i){if(t.status==="pending"){var l=t;l.status="fulfilled",l.value=i}},function(i){if(t.status==="pending"){var l=t;l.status="rejected",l.reason=i}})}switch(t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,Mm(e),e}throw es=t,Gs}}function Za(e){try{var t=e._init;return t(e._payload)}catch(n){throw n!==null&&typeof n=="object"&&typeof n.then=="function"?(es=n,Gs):n}}var es=null;function Sm(){if(es===null)throw Error(c(459));var e=es;return es=null,e}function Mm(e){if(e===Gs||e===yr)throw Error(c(483))}var zs=null,Ji=0;function wr(e){var t=Ji;return Ji+=1,zs===null&&(zs=[]),xm(zs,e,t)}function _i(e,t){t=t.props.ref,e.ref=t!==void 0?t:null}function br(e,t){throw t.$$typeof===x?Error(c(525)):(e=Object.prototype.toString.call(t),Error(c(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)))}function jm(e){function t(W,A){if(e){var q=W.deletions;q===null?(W.deletions=[A],W.flags|=16):q.push(A)}}function n(W,A){if(!e)return null;for(;A!==null;)t(W,A),A=A.sibling;return null}function i(W){for(var A=new Map;W!==null;)W.key!==null?A.set(W.key,W):A.set(W.index,W),W=W.sibling;return A}function l(W,A){return W=Bn(W,A),W.index=0,W.sibling=null,W}function h(W,A,q){return W.index=q,e?(q=W.alternate,q!==null?(q=q.index,q<A?(W.flags|=67108866,A):q):(W.flags|=67108866,A)):(W.flags|=1048576,A)}function m(W){return e&&W.alternate===null&&(W.flags|=67108866),W}function f(W,A,q,Y){return A===null||A.tag!==6?(A=uc(q,W.mode,Y),A.return=W,A):(A=l(A,q),A.return=W,A)}function j(W,A,q,Y){var ke=q.type;return ke===I?K(W,A,q.props.children,Y,q.key):A!==null&&(A.elementType===ke||typeof ke=="object"&&ke!==null&&ke.$$typeof===ne&&Za(ke)===A.type)?(A=l(A,q.props),_i(A,q),A.return=W,A):(A=dr(q.type,q.key,q.props,null,W.mode,Y),_i(A,q),A.return=W,A)}function D(W,A,q,Y){return A===null||A.tag!==4||A.stateNode.containerInfo!==q.containerInfo||A.stateNode.implementation!==q.implementation?(A=mc(q,W.mode,Y),A.return=W,A):(A=l(A,q.children||[]),A.return=W,A)}function K(W,A,q,Y,ke){return A===null||A.tag!==7?(A=Ka(q,W.mode,Y,ke),A.return=W,A):(A=l(A,q),A.return=W,A)}function V(W,A,q){if(typeof A=="string"&&A!==""||typeof A=="number"||typeof A=="bigint")return A=uc(""+A,W.mode,q),A.return=W,A;if(typeof A=="object"&&A!==null){switch(A.$$typeof){case N:return q=dr(A.type,A.key,A.props,null,W.mode,q),_i(q,A),q.return=W,q;case z:return A=mc(A,W.mode,q),A.return=W,A;case ne:return A=Za(A),V(W,A,q)}if(L(A)||O(A))return A=Ka(A,W.mode,q,null),A.return=W,A;if(typeof A.then=="function")return V(W,wr(A),q);if(A.$$typeof===se)return V(W,pr(W,A),q);br(W,A)}return null}function P(W,A,q,Y){var ke=A!==null?A.key:null;if(typeof q=="string"&&q!==""||typeof q=="number"||typeof q=="bigint")return ke!==null?null:f(W,A,""+q,Y);if(typeof q=="object"&&q!==null){switch(q.$$typeof){case N:return q.key===ke?j(W,A,q,Y):null;case z:return q.key===ke?D(W,A,q,Y):null;case ne:return q=Za(q),P(W,A,q,Y)}if(L(q)||O(q))return ke!==null?null:K(W,A,q,Y,null);if(typeof q.then=="function")return P(W,A,wr(q),Y);if(q.$$typeof===se)return P(W,A,pr(W,q),Y);br(W,q)}return null}function U(W,A,q,Y,ke){if(typeof Y=="string"&&Y!==""||typeof Y=="number"||typeof Y=="bigint")return W=W.get(q)||null,f(A,W,""+Y,ke);if(typeof Y=="object"&&Y!==null){switch(Y.$$typeof){case N:return W=W.get(Y.key===null?q:Y.key)||null,j(A,W,Y,ke);case z:return W=W.get(Y.key===null?q:Y.key)||null,D(A,W,Y,ke);case ne:return Y=Za(Y),U(W,A,q,Y,ke)}if(L(Y)||O(Y))return W=W.get(q)||null,K(A,W,Y,ke,null);if(typeof Y.then=="function")return U(W,A,q,wr(Y),ke);if(Y.$$typeof===se)return U(W,A,q,pr(A,Y),ke);br(A,Y)}return null}function pe(W,A,q,Y){for(var ke=null,Je=null,we=A,Ce=A=0,Re=null;we!==null&&Ce<q.length;Ce++){we.index>Ce?(Re=we,we=null):Re=we.sibling;var _e=P(W,we,q[Ce],Y);if(_e===null){we===null&&(we=Re);break}e&&we&&_e.alternate===null&&t(W,we),A=h(_e,A,Ce),Je===null?ke=_e:Je.sibling=_e,Je=_e,we=Re}if(Ce===q.length)return n(W,we),qe&&Fn(W,Ce),ke;if(we===null){for(;Ce<q.length;Ce++)we=V(W,q[Ce],Y),we!==null&&(A=h(we,A,Ce),Je===null?ke=we:Je.sibling=we,Je=we);return qe&&Fn(W,Ce),ke}for(we=i(we);Ce<q.length;Ce++)Re=U(we,W,Ce,q[Ce],Y),Re!==null&&(e&&Re.alternate!==null&&we.delete(Re.key===null?Ce:Re.key),A=h(Re,A,Ce),Je===null?ke=Re:Je.sibling=Re,Je=Re);return e&&we.forEach(function(Ia){return t(W,Ia)}),qe&&Fn(W,Ce),ke}function Te(W,A,q,Y){if(q==null)throw Error(c(151));for(var ke=null,Je=null,we=A,Ce=A=0,Re=null,_e=q.next();we!==null&&!_e.done;Ce++,_e=q.next()){we.index>Ce?(Re=we,we=null):Re=we.sibling;var Ia=P(W,we,_e.value,Y);if(Ia===null){we===null&&(we=Re);break}e&&we&&Ia.alternate===null&&t(W,we),A=h(Ia,A,Ce),Je===null?ke=Ia:Je.sibling=Ia,Je=Ia,we=Re}if(_e.done)return n(W,we),qe&&Fn(W,Ce),ke;if(we===null){for(;!_e.done;Ce++,_e=q.next())_e=V(W,_e.value,Y),_e!==null&&(A=h(_e,A,Ce),Je===null?ke=_e:Je.sibling=_e,Je=_e);return qe&&Fn(W,Ce),ke}for(we=i(we);!_e.done;Ce++,_e=q.next())_e=U(we,W,Ce,_e.value,Y),_e!==null&&(e&&_e.alternate!==null&&we.delete(_e.key===null?Ce:_e.key),A=h(_e,A,Ce),Je===null?ke=_e:Je.sibling=_e,Je=_e);return e&&we.forEach(function(ek){return t(W,ek)}),qe&&Fn(W,Ce),ke}function Qe(W,A,q,Y){if(typeof q=="object"&&q!==null&&q.type===I&&q.key===null&&(q=q.props.children),typeof q=="object"&&q!==null){switch(q.$$typeof){case N:e:{for(var ke=q.key;A!==null;){if(A.key===ke){if(ke=q.type,ke===I){if(A.tag===7){n(W,A.sibling),Y=l(A,q.props.children),Y.return=W,W=Y;break e}}else if(A.elementType===ke||typeof ke=="object"&&ke!==null&&ke.$$typeof===ne&&Za(ke)===A.type){n(W,A.sibling),Y=l(A,q.props),_i(Y,q),Y.return=W,W=Y;break e}n(W,A);break}else t(W,A);A=A.sibling}q.type===I?(Y=Ka(q.props.children,W.mode,Y,q.key),Y.return=W,W=Y):(Y=dr(q.type,q.key,q.props,null,W.mode,Y),_i(Y,q),Y.return=W,W=Y)}return m(W);case z:e:{for(ke=q.key;A!==null;){if(A.key===ke)if(A.tag===4&&A.stateNode.containerInfo===q.containerInfo&&A.stateNode.implementation===q.implementation){n(W,A.sibling),Y=l(A,q.children||[]),Y.return=W,W=Y;break e}else{n(W,A);break}else t(W,A);A=A.sibling}Y=mc(q,W.mode,Y),Y.return=W,W=Y}return m(W);case ne:return q=Za(q),Qe(W,A,q,Y)}if(L(q))return pe(W,A,q,Y);if(O(q)){if(ke=O(q),typeof ke!="function")throw Error(c(150));return q=ke.call(q),Te(W,A,q,Y)}if(typeof q.then=="function")return Qe(W,A,wr(q),Y);if(q.$$typeof===se)return Qe(W,A,pr(W,q),Y);br(W,q)}return typeof q=="string"&&q!==""||typeof q=="number"||typeof q=="bigint"?(q=""+q,A!==null&&A.tag===6?(n(W,A.sibling),Y=l(A,q),Y.return=W,W=Y):(n(W,A),Y=uc(q,W.mode,Y),Y.return=W,W=Y),m(W)):n(W,A)}return function(W,A,q,Y){try{Ji=0;var ke=Qe(W,A,q,Y);return zs=null,ke}catch(we){if(we===Gs||we===yr)throw we;var Je=an(29,we,null,W.mode);return Je.lanes=Y,Je.return=W,Je}}}var ts=jm(!0),Cm=jm(!1),ga=!1;function Mc(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function jc(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,callbacks:null})}function wa(e){return{lane:e,tag:0,payload:null,callback:null,next:null}}function ba(e,t,n){var i=e.updateQueue;if(i===null)return null;if(i=i.shared,(Be&2)!==0){var l=i.pending;return l===null?t.next=t:(t.next=l.next,l.next=t),i.pending=t,t=hr(e),hm(e,null,n),t}return cr(e,i,t,n),hr(e)}function Ui(e,t,n){if(t=t.updateQueue,t!==null&&(t=t.shared,(n&4194048)!==0)){var i=t.lanes;i&=e.pendingLanes,n|=i,t.lanes=n,wu(e,n)}}function Cc(e,t){var n=e.updateQueue,i=e.alternate;if(i!==null&&(i=i.updateQueue,n===i)){var l=null,h=null;if(n=n.firstBaseUpdate,n!==null){do{var m={lane:n.lane,tag:n.tag,payload:n.payload,callback:null,next:null};h===null?l=h=m:h=h.next=m,n=n.next}while(n!==null);h===null?l=h=t:h=h.next=t}else l=h=t;n={baseState:i.baseState,firstBaseUpdate:l,lastBaseUpdate:h,shared:i.shared,callbacks:i.callbacks},e.updateQueue=n;return}e=n.lastBaseUpdate,e===null?n.firstBaseUpdate=t:e.next=t,n.lastBaseUpdate=t}var Ac=!1;function Bi(){if(Ac){var e=Ps;if(e!==null)throw e}}function Fi(e,t,n,i){Ac=!1;var l=e.updateQueue;ga=!1;var h=l.firstBaseUpdate,m=l.lastBaseUpdate,f=l.shared.pending;if(f!==null){l.shared.pending=null;var j=f,D=j.next;j.next=null,m===null?h=D:m.next=D,m=j;var K=e.alternate;K!==null&&(K=K.updateQueue,f=K.lastBaseUpdate,f!==m&&(f===null?K.firstBaseUpdate=D:f.next=D,K.lastBaseUpdate=j))}if(h!==null){var V=l.baseState;m=0,K=D=j=null,f=h;do{var P=f.lane&-536870913,U=P!==f.lane;if(U?(Ie&P)===P:(i&P)===P){P!==0&&P===Ds&&(Ac=!0),K!==null&&(K=K.next={lane:0,tag:f.tag,payload:f.payload,callback:null,next:null});e:{var pe=e,Te=f;P=t;var Qe=n;switch(Te.tag){case 1:if(pe=Te.payload,typeof pe=="function"){V=pe.call(Qe,V,P);break e}V=pe;break e;case 3:pe.flags=pe.flags&-65537|128;case 0:if(pe=Te.payload,P=typeof pe=="function"?pe.call(Qe,V,P):pe,P==null)break e;V=b({},V,P);break e;case 2:ga=!0}}P=f.callback,P!==null&&(e.flags|=64,U&&(e.flags|=8192),U=l.callbacks,U===null?l.callbacks=[P]:U.push(P))}else U={lane:P,tag:f.tag,payload:f.payload,callback:f.callback,next:null},K===null?(D=K=U,j=V):K=K.next=U,m|=P;if(f=f.next,f===null){if(f=l.shared.pending,f===null)break;U=f,f=U.next,U.next=null,l.lastBaseUpdate=U,l.shared.pending=null}}while(!0);K===null&&(j=V),l.baseState=j,l.firstBaseUpdate=D,l.lastBaseUpdate=K,h===null&&(l.shared.lanes=0),Sa|=m,e.lanes=m,e.memoizedState=V}}function Am(e,t){if(typeof e!="function")throw Error(c(191,e));e.call(t)}function Nm(e,t){var n=e.callbacks;if(n!==null)for(e.callbacks=null,e=0;e<n.length;e++)Am(n[e],t)}var Js=k(null),vr=k(0);function Em(e,t){e=aa,G(vr,e),G(Js,t),aa=e|t.baseLanes}function Nc(){G(vr,aa),G(Js,Js.current)}function Ec(){aa=vr.current,M(Js),M(vr)}var sn=k(null),vn=null;function va(e){var t=e.alternate;G(pt,pt.current&1),G(sn,e),vn===null&&(t===null||Js.current!==null||t.memoizedState!==null)&&(vn=e)}function Lc(e){G(pt,pt.current),G(sn,e),vn===null&&(vn=e)}function Lm(e){e.tag===22?(G(pt,pt.current),G(sn,e),vn===null&&(vn=e)):ka()}function ka(){G(pt,pt.current),G(sn,sn.current)}function on(e){M(sn),vn===e&&(vn=null),M(pt)}var pt=k(0);function kr(e){for(var t=e;t!==null;){if(t.tag===13){var n=t.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||qh(n)||Dh(n)))return t}else if(t.tag===19&&(t.memoizedProps.revealOrder==="forwards"||t.memoizedProps.revealOrder==="backwards"||t.memoizedProps.revealOrder==="unstable_legacy-backwards"||t.memoizedProps.revealOrder==="together")){if((t.flags&128)!==0)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var Yn=0,Me=null,Ve=null,bt=null,Tr=!1,_s=!1,ns=!1,xr=0,$i=0,Us=null,Ub=0;function ut(){throw Error(c(321))}function Hc(e,t){if(t===null)return!1;for(var n=0;n<t.length&&n<e.length;n++)if(!nn(e[n],t[n]))return!1;return!0}function Wc(e,t,n,i,l,h){return Yn=h,Me=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,v.H=e===null||e.memoizedState===null?pp:Kc,ns=!1,h=n(i,l),ns=!1,_s&&(h=Wm(t,n,i,l)),Hm(e),h}function Hm(e){v.H=Vi;var t=Ve!==null&&Ve.next!==null;if(Yn=0,bt=Ve=Me=null,Tr=!1,$i=0,Us=null,t)throw Error(c(300));e===null||vt||(e=e.dependencies,e!==null&&mr(e)&&(vt=!0))}function Wm(e,t,n,i){Me=e;var l=0;do{if(_s&&(Us=null),$i=0,_s=!1,25<=l)throw Error(c(301));if(l+=1,bt=Ve=null,e.updateQueue!=null){var h=e.updateQueue;h.lastEffect=null,h.events=null,h.stores=null,h.memoCache!=null&&(h.memoCache.index=0)}v.H=fp,h=t(n,i)}while(_s);return h}function Bb(){var e=v.H,t=e.useState()[0];return t=typeof t.then=="function"?Ki(t):t,e=e.useState()[0],(Ve!==null?Ve.memoizedState:null)!==e&&(Me.flags|=1024),t}function Ic(){var e=xr!==0;return xr=0,e}function Rc(e,t,n){t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~n}function Oc(e){if(Tr){for(e=e.memoizedState;e!==null;){var t=e.queue;t!==null&&(t.pending=null),e=e.next}Tr=!1}Yn=0,bt=Ve=Me=null,_s=!1,$i=xr=0,Us=null}function zt(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return bt===null?Me.memoizedState=bt=e:bt=bt.next=e,bt}function ft(){if(Ve===null){var e=Me.alternate;e=e!==null?e.memoizedState:null}else e=Ve.next;var t=bt===null?Me.memoizedState:bt.next;if(t!==null)bt=t,Ve=e;else{if(e===null)throw Me.alternate===null?Error(c(467)):Error(c(310));Ve=e,e={memoizedState:Ve.memoizedState,baseState:Ve.baseState,baseQueue:Ve.baseQueue,queue:Ve.queue,next:null},bt===null?Me.memoizedState=bt=e:bt=bt.next=e}return bt}function Sr(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function Ki(e){var t=$i;return $i+=1,Us===null&&(Us=[]),e=xm(Us,e,t),t=Me,(bt===null?t.memoizedState:bt.next)===null&&(t=t.alternate,v.H=t===null||t.memoizedState===null?pp:Kc),e}function Mr(e){if(e!==null&&typeof e=="object"){if(typeof e.then=="function")return Ki(e);if(e.$$typeof===se)return It(e)}throw Error(c(438,String(e)))}function qc(e){var t=null,n=Me.updateQueue;if(n!==null&&(t=n.memoCache),t==null){var i=Me.alternate;i!==null&&(i=i.updateQueue,i!==null&&(i=i.memoCache,i!=null&&(t={data:i.data.map(function(l){return l.slice()}),index:0})))}if(t==null&&(t={data:[],index:0}),n===null&&(n=Sr(),Me.updateQueue=n),n.memoCache=t,n=t.data[t.index],n===void 0)for(n=t.data[t.index]=Array(e),i=0;i<e;i++)n[i]=ge;return t.index++,n}function Vn(e,t){return typeof t=="function"?t(e):t}function jr(e){var t=ft();return Dc(t,Ve,e)}function Dc(e,t,n){var i=e.queue;if(i===null)throw Error(c(311));i.lastRenderedReducer=n;var l=e.baseQueue,h=i.pending;if(h!==null){if(l!==null){var m=l.next;l.next=h.next,h.next=m}t.baseQueue=l=h,i.pending=null}if(h=e.baseState,l===null)e.memoizedState=h;else{t=l.next;var f=m=null,j=null,D=t,K=!1;do{var V=D.lane&-536870913;if(V!==D.lane?(Ie&V)===V:(Yn&V)===V){var P=D.revertLane;if(P===0)j!==null&&(j=j.next={lane:0,revertLane:0,gesture:null,action:D.action,hasEagerState:D.hasEagerState,eagerState:D.eagerState,next:null}),V===Ds&&(K=!0);else if((Yn&P)===P){D=D.next,P===Ds&&(K=!0);continue}else V={lane:0,revertLane:D.revertLane,gesture:null,action:D.action,hasEagerState:D.hasEagerState,eagerState:D.eagerState,next:null},j===null?(f=j=V,m=h):j=j.next=V,Me.lanes|=P,Sa|=P;V=D.action,ns&&n(h,V),h=D.hasEagerState?D.eagerState:n(h,V)}else P={lane:V,revertLane:D.revertLane,gesture:D.gesture,action:D.action,hasEagerState:D.hasEagerState,eagerState:D.eagerState,next:null},j===null?(f=j=P,m=h):j=j.next=P,Me.lanes|=V,Sa|=V;D=D.next}while(D!==null&&D!==t);if(j===null?m=h:j.next=f,!nn(h,e.memoizedState)&&(vt=!0,K&&(n=Ps,n!==null)))throw n;e.memoizedState=h,e.baseState=m,e.baseQueue=j,i.lastRenderedState=h}return l===null&&(i.lanes=0),[e.memoizedState,i.dispatch]}function Pc(e){var t=ft(),n=t.queue;if(n===null)throw Error(c(311));n.lastRenderedReducer=e;var i=n.dispatch,l=n.pending,h=t.memoizedState;if(l!==null){n.pending=null;var m=l=l.next;do h=e(h,m.action),m=m.next;while(m!==l);nn(h,t.memoizedState)||(vt=!0),t.memoizedState=h,t.baseQueue===null&&(t.baseState=h),n.lastRenderedState=h}return[h,i]}function Im(e,t,n){var i=Me,l=ft(),h=qe;if(h){if(n===void 0)throw Error(c(407));n=n()}else n=t();var m=!nn((Ve||l).memoizedState,n);if(m&&(l.memoizedState=n,vt=!0),l=l.queue,Jc(qm.bind(null,i,l,e),[e]),l.getSnapshot!==t||m||bt!==null&&bt.memoizedState.tag&1){if(i.flags|=2048,Bs(9,{destroy:void 0},Om.bind(null,i,l,n,t),null),et===null)throw Error(c(349));h||(Yn&127)!==0||Rm(i,t,n)}return n}function Rm(e,t,n){e.flags|=16384,e={getSnapshot:t,value:n},t=Me.updateQueue,t===null?(t=Sr(),Me.updateQueue=t,t.stores=[e]):(n=t.stores,n===null?t.stores=[e]:n.push(e))}function Om(e,t,n,i){t.value=n,t.getSnapshot=i,Dm(t)&&Pm(e)}function qm(e,t,n){return n(function(){Dm(t)&&Pm(e)})}function Dm(e){var t=e.getSnapshot;e=e.value;try{var n=t();return!nn(e,n)}catch{return!0}}function Pm(e){var t=$a(e,2);t!==null&&Xt(t,e,2)}function Gc(e){var t=zt();if(typeof e=="function"){var n=e;if(e=n(),ns){Ut(!0);try{n()}finally{Ut(!1)}}}return t.memoizedState=t.baseState=e,t.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Vn,lastRenderedState:e},t}function Gm(e,t,n,i){return e.baseState=n,Dc(e,Ve,typeof i=="function"?i:Vn)}function Fb(e,t,n,i,l){if(Nr(e))throw Error(c(485));if(e=t.action,e!==null){var h={payload:l,action:e,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(m){h.listeners.push(m)}};v.T!==null?n(!0):h.isTransition=!1,i(h),n=t.pending,n===null?(h.next=t.pending=h,zm(t,h)):(h.next=n.next,t.pending=n.next=h)}}function zm(e,t){var n=t.action,i=t.payload,l=e.state;if(t.isTransition){var h=v.T,m={};v.T=m;try{var f=n(l,i),j=v.S;j!==null&&j(m,f),Jm(e,t,f)}catch(D){zc(e,t,D)}finally{h!==null&&m.types!==null&&(h.types=m.types),v.T=h}}else try{h=n(l,i),Jm(e,t,h)}catch(D){zc(e,t,D)}}function Jm(e,t,n){n!==null&&typeof n=="object"&&typeof n.then=="function"?n.then(function(i){_m(e,t,i)},function(i){return zc(e,t,i)}):_m(e,t,n)}function _m(e,t,n){t.status="fulfilled",t.value=n,Um(t),e.state=n,t=e.pending,t!==null&&(n=t.next,n===t?e.pending=null:(n=n.next,t.next=n,zm(e,n)))}function zc(e,t,n){var i=e.pending;if(e.pending=null,i!==null){i=i.next;do t.status="rejected",t.reason=n,Um(t),t=t.next;while(t!==i)}e.action=null}function Um(e){e=e.listeners;for(var t=0;t<e.length;t++)(0,e[t])()}function Bm(e,t){return t}function Fm(e,t){if(qe){var n=et.formState;if(n!==null){e:{var i=Me;if(qe){if(at){t:{for(var l=at,h=bn;l.nodeType!==8;){if(!h){l=null;break t}if(l=kn(l.nextSibling),l===null){l=null;break t}}h=l.data,l=h==="F!"||h==="F"?l:null}if(l){at=kn(l.nextSibling),i=l.data==="F!";break e}}fa(i)}i=!1}i&&(t=n[0])}}return n=zt(),n.memoizedState=n.baseState=t,i={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Bm,lastRenderedState:t},n.queue=i,n=dp.bind(null,Me,i),i.dispatch=n,i=Gc(!1),h=$c.bind(null,Me,!1,i.queue),i=zt(),l={state:t,dispatch:null,action:e,pending:null},i.queue=l,n=Fb.bind(null,Me,l,h,n),l.dispatch=n,i.memoizedState=e,[t,n,!1]}function $m(e){var t=ft();return Km(t,Ve,e)}function Km(e,t,n){if(t=Dc(e,t,Bm)[0],e=jr(Vn)[0],typeof t=="object"&&t!==null&&typeof t.then=="function")try{var i=Ki(t)}catch(m){throw m===Gs?yr:m}else i=t;t=ft();var l=t.queue,h=l.dispatch;return n!==t.memoizedState&&(Me.flags|=2048,Bs(9,{destroy:void 0},$b.bind(null,l,n),null)),[i,h,e]}function $b(e,t){e.action=t}function Ym(e){var t=ft(),n=Ve;if(n!==null)return Km(t,n,e);ft(),t=t.memoizedState,n=ft();var i=n.queue.dispatch;return n.memoizedState=e,[t,i,!1]}function Bs(e,t,n,i){return e={tag:e,create:n,deps:i,inst:t,next:null},t=Me.updateQueue,t===null&&(t=Sr(),Me.updateQueue=t),n=t.lastEffect,n===null?t.lastEffect=e.next=e:(i=n.next,n.next=e,e.next=i,t.lastEffect=e),e}function Vm(){return ft().memoizedState}function Cr(e,t,n,i){var l=zt();Me.flags|=e,l.memoizedState=Bs(1|t,{destroy:void 0},n,i===void 0?null:i)}function Ar(e,t,n,i){var l=ft();i=i===void 0?null:i;var h=l.memoizedState.inst;Ve!==null&&i!==null&&Hc(i,Ve.memoizedState.deps)?l.memoizedState=Bs(t,h,n,i):(Me.flags|=e,l.memoizedState=Bs(1|t,h,n,i))}function Xm(e,t){Cr(8390656,8,e,t)}function Jc(e,t){Ar(2048,8,e,t)}function Kb(e){Me.flags|=4;var t=Me.updateQueue;if(t===null)t=Sr(),Me.updateQueue=t,t.events=[e];else{var n=t.events;n===null?t.events=[e]:n.push(e)}}function Qm(e){var t=ft().memoizedState;return Kb({ref:t,nextImpl:e}),function(){if((Be&2)!==0)throw Error(c(440));return t.impl.apply(void 0,arguments)}}function Zm(e,t){return Ar(4,2,e,t)}function ep(e,t){return Ar(4,4,e,t)}function tp(e,t){if(typeof t=="function"){e=e();var n=t(e);return function(){typeof n=="function"?n():t(null)}}if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function np(e,t,n){n=n!=null?n.concat([e]):null,Ar(4,4,tp.bind(null,t,e),n)}function _c(){}function ap(e,t){var n=ft();t=t===void 0?null:t;var i=n.memoizedState;return t!==null&&Hc(t,i[1])?i[0]:(n.memoizedState=[e,t],e)}function sp(e,t){var n=ft();t=t===void 0?null:t;var i=n.memoizedState;if(t!==null&&Hc(t,i[1]))return i[0];if(i=e(),ns){Ut(!0);try{e()}finally{Ut(!1)}}return n.memoizedState=[i,t],i}function Uc(e,t,n){return n===void 0||(Yn&1073741824)!==0&&(Ie&261930)===0?e.memoizedState=t:(e.memoizedState=n,e=of(),Me.lanes|=e,Sa|=e,n)}function ip(e,t,n,i){return nn(n,t)?n:Js.current!==null?(e=Uc(e,n,i),nn(e,t)||(vt=!0),e):(Yn&42)===0||(Yn&1073741824)!==0&&(Ie&261930)===0?(vt=!0,e.memoizedState=n):(e=of(),Me.lanes|=e,Sa|=e,t)}function op(e,t,n,i,l){var h=S.p;S.p=h!==0&&8>h?h:8;var m=v.T,f={};v.T=f,$c(e,!1,t,n);try{var j=l(),D=v.S;if(D!==null&&D(f,j),j!==null&&typeof j=="object"&&typeof j.then=="function"){var K=_b(j,i);Yi(e,t,K,cn(e))}else Yi(e,t,i,cn(e))}catch(V){Yi(e,t,{then:function(){},status:"rejected",reason:V},cn())}finally{S.p=h,m!==null&&f.types!==null&&(m.types=f.types),v.T=m}}function Yb(){}function Bc(e,t,n,i){if(e.tag!==5)throw Error(c(476));var l=rp(e).queue;op(e,l,t,_,n===null?Yb:function(){return lp(e),n(i)})}function rp(e){var t=e.memoizedState;if(t!==null)return t;t={memoizedState:_,baseState:_,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Vn,lastRenderedState:_},next:null};var n={};return t.next={memoizedState:n,baseState:n,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Vn,lastRenderedState:n},next:null},e.memoizedState=t,e=e.alternate,e!==null&&(e.memoizedState=t),t}function lp(e){var t=rp(e);t.next===null&&(t=e.alternate.memoizedState),Yi(e,t.next.queue,{},cn())}function Fc(){return It(mo)}function cp(){return ft().memoizedState}function hp(){return ft().memoizedState}function Vb(e){for(var t=e.return;t!==null;){switch(t.tag){case 24:case 3:var n=cn();e=wa(n);var i=ba(t,e,n);i!==null&&(Xt(i,t,n),Ui(i,t,n)),t={cache:kc()},e.payload=t;return}t=t.return}}function Xb(e,t,n){var i=cn();n={lane:i,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},Nr(e)?up(t,n):(n=hc(e,t,n,i),n!==null&&(Xt(n,e,i),mp(n,t,i)))}function dp(e,t,n){var i=cn();Yi(e,t,n,i)}function Yi(e,t,n,i){var l={lane:i,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null};if(Nr(e))up(t,l);else{var h=e.alternate;if(e.lanes===0&&(h===null||h.lanes===0)&&(h=t.lastRenderedReducer,h!==null))try{var m=t.lastRenderedState,f=h(m,n);if(l.hasEagerState=!0,l.eagerState=f,nn(f,m))return cr(e,t,l,0),et===null&&lr(),!1}catch{}if(n=hc(e,t,l,i),n!==null)return Xt(n,e,i),mp(n,t,i),!0}return!1}function $c(e,t,n,i){if(i={lane:2,revertLane:Mh(),gesture:null,action:i,hasEagerState:!1,eagerState:null,next:null},Nr(e)){if(t)throw Error(c(479))}else t=hc(e,n,i,2),t!==null&&Xt(t,e,2)}function Nr(e){var t=e.alternate;return e===Me||t!==null&&t===Me}function up(e,t){_s=Tr=!0;var n=e.pending;n===null?t.next=t:(t.next=n.next,n.next=t),e.pending=t}function mp(e,t,n){if((n&4194048)!==0){var i=t.lanes;i&=e.pendingLanes,n|=i,t.lanes=n,wu(e,n)}}var Vi={readContext:It,use:Mr,useCallback:ut,useContext:ut,useEffect:ut,useImperativeHandle:ut,useLayoutEffect:ut,useInsertionEffect:ut,useMemo:ut,useReducer:ut,useRef:ut,useState:ut,useDebugValue:ut,useDeferredValue:ut,useTransition:ut,useSyncExternalStore:ut,useId:ut,useHostTransitionStatus:ut,useFormState:ut,useActionState:ut,useOptimistic:ut,useMemoCache:ut,useCacheRefresh:ut};Vi.useEffectEvent=ut;var pp={readContext:It,use:Mr,useCallback:function(e,t){return zt().memoizedState=[e,t===void 0?null:t],e},useContext:It,useEffect:Xm,useImperativeHandle:function(e,t,n){n=n!=null?n.concat([e]):null,Cr(4194308,4,tp.bind(null,t,e),n)},useLayoutEffect:function(e,t){return Cr(4194308,4,e,t)},useInsertionEffect:function(e,t){Cr(4,2,e,t)},useMemo:function(e,t){var n=zt();t=t===void 0?null:t;var i=e();if(ns){Ut(!0);try{e()}finally{Ut(!1)}}return n.memoizedState=[i,t],i},useReducer:function(e,t,n){var i=zt();if(n!==void 0){var l=n(t);if(ns){Ut(!0);try{n(t)}finally{Ut(!1)}}}else l=t;return i.memoizedState=i.baseState=l,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:l},i.queue=e,e=e.dispatch=Xb.bind(null,Me,e),[i.memoizedState,e]},useRef:function(e){var t=zt();return e={current:e},t.memoizedState=e},useState:function(e){e=Gc(e);var t=e.queue,n=dp.bind(null,Me,t);return t.dispatch=n,[e.memoizedState,n]},useDebugValue:_c,useDeferredValue:function(e,t){var n=zt();return Uc(n,e,t)},useTransition:function(){var e=Gc(!1);return e=op.bind(null,Me,e.queue,!0,!1),zt().memoizedState=e,[!1,e]},useSyncExternalStore:function(e,t,n){var i=Me,l=zt();if(qe){if(n===void 0)throw Error(c(407));n=n()}else{if(n=t(),et===null)throw Error(c(349));(Ie&127)!==0||Rm(i,t,n)}l.memoizedState=n;var h={value:n,getSnapshot:t};return l.queue=h,Xm(qm.bind(null,i,h,e),[e]),i.flags|=2048,Bs(9,{destroy:void 0},Om.bind(null,i,h,n,t),null),n},useId:function(){var e=zt(),t=et.identifierPrefix;if(qe){var n=In,i=Wn;n=(i&~(1<<32-Ee(i)-1)).toString(32)+n,t="_"+t+"R_"+n,n=xr++,0<n&&(t+="H"+n.toString(32)),t+="_"}else n=Ub++,t="_"+t+"r_"+n.toString(32)+"_";return e.memoizedState=t},useHostTransitionStatus:Fc,useFormState:Fm,useActionState:Fm,useOptimistic:function(e){var t=zt();t.memoizedState=t.baseState=e;var n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return t.queue=n,t=$c.bind(null,Me,!0,n),n.dispatch=t,[e,t]},useMemoCache:qc,useCacheRefresh:function(){return zt().memoizedState=Vb.bind(null,Me)},useEffectEvent:function(e){var t=zt(),n={impl:e};return t.memoizedState=n,function(){if((Be&2)!==0)throw Error(c(440));return n.impl.apply(void 0,arguments)}}},Kc={readContext:It,use:Mr,useCallback:ap,useContext:It,useEffect:Jc,useImperativeHandle:np,useInsertionEffect:Zm,useLayoutEffect:ep,useMemo:sp,useReducer:jr,useRef:Vm,useState:function(){return jr(Vn)},useDebugValue:_c,useDeferredValue:function(e,t){var n=ft();return ip(n,Ve.memoizedState,e,t)},useTransition:function(){var e=jr(Vn)[0],t=ft().memoizedState;return[typeof e=="boolean"?e:Ki(e),t]},useSyncExternalStore:Im,useId:cp,useHostTransitionStatus:Fc,useFormState:$m,useActionState:$m,useOptimistic:function(e,t){var n=ft();return Gm(n,Ve,e,t)},useMemoCache:qc,useCacheRefresh:hp};Kc.useEffectEvent=Qm;var fp={readContext:It,use:Mr,useCallback:ap,useContext:It,useEffect:Jc,useImperativeHandle:np,useInsertionEffect:Zm,useLayoutEffect:ep,useMemo:sp,useReducer:Pc,useRef:Vm,useState:function(){return Pc(Vn)},useDebugValue:_c,useDeferredValue:function(e,t){var n=ft();return Ve===null?Uc(n,e,t):ip(n,Ve.memoizedState,e,t)},useTransition:function(){var e=Pc(Vn)[0],t=ft().memoizedState;return[typeof e=="boolean"?e:Ki(e),t]},useSyncExternalStore:Im,useId:cp,useHostTransitionStatus:Fc,useFormState:Ym,useActionState:Ym,useOptimistic:function(e,t){var n=ft();return Ve!==null?Gm(n,Ve,e,t):(n.baseState=e,[e,n.queue.dispatch])},useMemoCache:qc,useCacheRefresh:hp};fp.useEffectEvent=Qm;function Yc(e,t,n,i){t=e.memoizedState,n=n(i,t),n=n==null?t:b({},t,n),e.memoizedState=n,e.lanes===0&&(e.updateQueue.baseState=n)}var Vc={enqueueSetState:function(e,t,n){e=e._reactInternals;var i=cn(),l=wa(i);l.payload=t,n!=null&&(l.callback=n),t=ba(e,l,i),t!==null&&(Xt(t,e,i),Ui(t,e,i))},enqueueReplaceState:function(e,t,n){e=e._reactInternals;var i=cn(),l=wa(i);l.tag=1,l.payload=t,n!=null&&(l.callback=n),t=ba(e,l,i),t!==null&&(Xt(t,e,i),Ui(t,e,i))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var n=cn(),i=wa(n);i.tag=2,t!=null&&(i.callback=t),t=ba(e,i,n),t!==null&&(Xt(t,e,n),Ui(t,e,n))}};function yp(e,t,n,i,l,h,m){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(i,h,m):t.prototype&&t.prototype.isPureReactComponent?!Oi(n,i)||!Oi(l,h):!0}function gp(e,t,n,i){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(n,i),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(n,i),t.state!==e&&Vc.enqueueReplaceState(t,t.state,null)}function as(e,t){var n=t;if("ref"in t){n={};for(var i in t)i!=="ref"&&(n[i]=t[i])}if(e=e.defaultProps){n===t&&(n=b({},n));for(var l in e)n[l]===void 0&&(n[l]=e[l])}return n}function wp(e){rr(e)}function bp(e){console.error(e)}function vp(e){rr(e)}function Er(e,t){try{var n=e.onUncaughtError;n(t.value,{componentStack:t.stack})}catch(i){setTimeout(function(){throw i})}}function kp(e,t,n){try{var i=e.onCaughtError;i(n.value,{componentStack:n.stack,errorBoundary:t.tag===1?t.stateNode:null})}catch(l){setTimeout(function(){throw l})}}function Xc(e,t,n){return n=wa(n),n.tag=3,n.payload={element:null},n.callback=function(){Er(e,t)},n}function Tp(e){return e=wa(e),e.tag=3,e}function xp(e,t,n,i){var l=n.type.getDerivedStateFromError;if(typeof l=="function"){var h=i.value;e.payload=function(){return l(h)},e.callback=function(){kp(t,n,i)}}var m=n.stateNode;m!==null&&typeof m.componentDidCatch=="function"&&(e.callback=function(){kp(t,n,i),typeof l!="function"&&(Ma===null?Ma=new Set([this]):Ma.add(this));var f=i.stack;this.componentDidCatch(i.value,{componentStack:f!==null?f:""})})}function Qb(e,t,n,i,l){if(n.flags|=32768,i!==null&&typeof i=="object"&&typeof i.then=="function"){if(t=n.alternate,t!==null&&qs(t,n,l,!0),n=sn.current,n!==null){switch(n.tag){case 31:case 13:return vn===null?Jr():n.alternate===null&&mt===0&&(mt=3),n.flags&=-257,n.flags|=65536,n.lanes=l,i===gr?n.flags|=16384:(t=n.updateQueue,t===null?n.updateQueue=new Set([i]):t.add(i),Th(e,i,l)),!1;case 22:return n.flags|=65536,i===gr?n.flags|=16384:(t=n.updateQueue,t===null?(t={transitions:null,markerInstances:null,retryQueue:new Set([i])},n.updateQueue=t):(n=t.retryQueue,n===null?t.retryQueue=new Set([i]):n.add(i)),Th(e,i,l)),!1}throw Error(c(435,n.tag))}return Th(e,i,l),Jr(),!1}if(qe)return t=sn.current,t!==null?((t.flags&65536)===0&&(t.flags|=256),t.flags|=65536,t.lanes=l,i!==yc&&(e=Error(c(422),{cause:i}),Pi(yn(e,n)))):(i!==yc&&(t=Error(c(423),{cause:i}),Pi(yn(t,n))),e=e.current.alternate,e.flags|=65536,l&=-l,e.lanes|=l,i=yn(i,n),l=Xc(e.stateNode,i,l),Cc(e,l),mt!==4&&(mt=2)),!1;var h=Error(c(520),{cause:i});if(h=yn(h,n),so===null?so=[h]:so.push(h),mt!==4&&(mt=2),t===null)return!0;i=yn(i,n),n=t;do{switch(n.tag){case 3:return n.flags|=65536,e=l&-l,n.lanes|=e,e=Xc(n.stateNode,i,e),Cc(n,e),!1;case 1:if(t=n.type,h=n.stateNode,(n.flags&128)===0&&(typeof t.getDerivedStateFromError=="function"||h!==null&&typeof h.componentDidCatch=="function"&&(Ma===null||!Ma.has(h))))return n.flags|=65536,l&=-l,n.lanes|=l,l=Tp(l),xp(l,e,n,i),Cc(n,l),!1}n=n.return}while(n!==null);return!1}var Qc=Error(c(461)),vt=!1;function Rt(e,t,n,i){t.child=e===null?Cm(t,null,n,i):ts(t,e.child,n,i)}function Sp(e,t,n,i,l){n=n.render;var h=t.ref;if("ref"in i){var m={};for(var f in i)f!=="ref"&&(m[f]=i[f])}else m=i;return Xa(t),i=Wc(e,t,n,m,h,l),f=Ic(),e!==null&&!vt?(Rc(e,t,l),Xn(e,t,l)):(qe&&f&&pc(t),t.flags|=1,Rt(e,t,i,l),t.child)}function Mp(e,t,n,i,l){if(e===null){var h=n.type;return typeof h=="function"&&!dc(h)&&h.defaultProps===void 0&&n.compare===null?(t.tag=15,t.type=h,jp(e,t,h,i,l)):(e=dr(n.type,null,i,t,t.mode,l),e.ref=t.ref,e.return=t,t.child=e)}if(h=e.child,!oh(e,l)){var m=h.memoizedProps;if(n=n.compare,n=n!==null?n:Oi,n(m,i)&&e.ref===t.ref)return Xn(e,t,l)}return t.flags|=1,e=Bn(h,i),e.ref=t.ref,e.return=t,t.child=e}function jp(e,t,n,i,l){if(e!==null){var h=e.memoizedProps;if(Oi(h,i)&&e.ref===t.ref)if(vt=!1,t.pendingProps=i=h,oh(e,l))(e.flags&131072)!==0&&(vt=!0);else return t.lanes=e.lanes,Xn(e,t,l)}return Zc(e,t,n,i,l)}function Cp(e,t,n,i){var l=i.children,h=e!==null?e.memoizedState:null;if(e===null&&t.stateNode===null&&(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),i.mode==="hidden"){if((t.flags&128)!==0){if(h=h!==null?h.baseLanes|n:n,e!==null){for(i=t.child=e.child,l=0;i!==null;)l=l|i.lanes|i.childLanes,i=i.sibling;i=l&~h}else i=0,t.child=null;return Ap(e,t,h,n,i)}if((n&536870912)!==0)t.memoizedState={baseLanes:0,cachePool:null},e!==null&&fr(t,h!==null?h.cachePool:null),h!==null?Em(t,h):Nc(),Lm(t);else return i=t.lanes=536870912,Ap(e,t,h!==null?h.baseLanes|n:n,n,i)}else h!==null?(fr(t,h.cachePool),Em(t,h),ka(),t.memoizedState=null):(e!==null&&fr(t,null),Nc(),ka());return Rt(e,t,l,n),t.child}function Xi(e,t){return e!==null&&e.tag===22||t.stateNode!==null||(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),t.sibling}function Ap(e,t,n,i,l){var h=xc();return h=h===null?null:{parent:wt._currentValue,pool:h},t.memoizedState={baseLanes:n,cachePool:h},e!==null&&fr(t,null),Nc(),Lm(t),e!==null&&qs(e,t,i,!0),t.childLanes=l,null}function Lr(e,t){return t=Wr({mode:t.mode,children:t.children},e.mode),t.ref=e.ref,e.child=t,t.return=e,t}function Np(e,t,n){return ts(t,e.child,null,n),e=Lr(t,t.pendingProps),e.flags|=2,on(t),t.memoizedState=null,e}function Zb(e,t,n){var i=t.pendingProps,l=(t.flags&128)!==0;if(t.flags&=-129,e===null){if(qe){if(i.mode==="hidden")return e=Lr(t,i),t.lanes=536870912,Xi(null,e);if(Lc(t),(e=at)?(e=Jf(e,bn),e=e!==null&&e.data==="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:ma!==null?{id:Wn,overflow:In}:null,retryLane:536870912,hydrationErrors:null},n=um(e),n.return=t,t.child=n,Wt=t,at=null)):e=null,e===null)throw fa(t);return t.lanes=536870912,null}return Lr(t,i)}var h=e.memoizedState;if(h!==null){var m=h.dehydrated;if(Lc(t),l)if(t.flags&256)t.flags&=-257,t=Np(e,t,n);else if(t.memoizedState!==null)t.child=e.child,t.flags|=128,t=null;else throw Error(c(558));else if(vt||qs(e,t,n,!1),l=(n&e.childLanes)!==0,vt||l){if(i=et,i!==null&&(m=bu(i,n),m!==0&&m!==h.retryLane))throw h.retryLane=m,$a(e,m),Xt(i,e,m),Qc;Jr(),t=Np(e,t,n)}else e=h.treeContext,at=kn(m.nextSibling),Wt=t,qe=!0,pa=null,bn=!1,e!==null&&fm(t,e),t=Lr(t,i),t.flags|=4096;return t}return e=Bn(e.child,{mode:i.mode,children:i.children}),e.ref=t.ref,t.child=e,e.return=t,e}function Hr(e,t){var n=t.ref;if(n===null)e!==null&&e.ref!==null&&(t.flags|=4194816);else{if(typeof n!="function"&&typeof n!="object")throw Error(c(284));(e===null||e.ref!==n)&&(t.flags|=4194816)}}function Zc(e,t,n,i,l){return Xa(t),n=Wc(e,t,n,i,void 0,l),i=Ic(),e!==null&&!vt?(Rc(e,t,l),Xn(e,t,l)):(qe&&i&&pc(t),t.flags|=1,Rt(e,t,n,l),t.child)}function Ep(e,t,n,i,l,h){return Xa(t),t.updateQueue=null,n=Wm(t,i,n,l),Hm(e),i=Ic(),e!==null&&!vt?(Rc(e,t,h),Xn(e,t,h)):(qe&&i&&pc(t),t.flags|=1,Rt(e,t,n,h),t.child)}function Lp(e,t,n,i,l){if(Xa(t),t.stateNode===null){var h=Ws,m=n.contextType;typeof m=="object"&&m!==null&&(h=It(m)),h=new n(i,h),t.memoizedState=h.state!==null&&h.state!==void 0?h.state:null,h.updater=Vc,t.stateNode=h,h._reactInternals=t,h=t.stateNode,h.props=i,h.state=t.memoizedState,h.refs={},Mc(t),m=n.contextType,h.context=typeof m=="object"&&m!==null?It(m):Ws,h.state=t.memoizedState,m=n.getDerivedStateFromProps,typeof m=="function"&&(Yc(t,n,m,i),h.state=t.memoizedState),typeof n.getDerivedStateFromProps=="function"||typeof h.getSnapshotBeforeUpdate=="function"||typeof h.UNSAFE_componentWillMount!="function"&&typeof h.componentWillMount!="function"||(m=h.state,typeof h.componentWillMount=="function"&&h.componentWillMount(),typeof h.UNSAFE_componentWillMount=="function"&&h.UNSAFE_componentWillMount(),m!==h.state&&Vc.enqueueReplaceState(h,h.state,null),Fi(t,i,h,l),Bi(),h.state=t.memoizedState),typeof h.componentDidMount=="function"&&(t.flags|=4194308),i=!0}else if(e===null){h=t.stateNode;var f=t.memoizedProps,j=as(n,f);h.props=j;var D=h.context,K=n.contextType;m=Ws,typeof K=="object"&&K!==null&&(m=It(K));var V=n.getDerivedStateFromProps;K=typeof V=="function"||typeof h.getSnapshotBeforeUpdate=="function",f=t.pendingProps!==f,K||typeof h.UNSAFE_componentWillReceiveProps!="function"&&typeof h.componentWillReceiveProps!="function"||(f||D!==m)&&gp(t,h,i,m),ga=!1;var P=t.memoizedState;h.state=P,Fi(t,i,h,l),Bi(),D=t.memoizedState,f||P!==D||ga?(typeof V=="function"&&(Yc(t,n,V,i),D=t.memoizedState),(j=ga||yp(t,n,j,i,P,D,m))?(K||typeof h.UNSAFE_componentWillMount!="function"&&typeof h.componentWillMount!="function"||(typeof h.componentWillMount=="function"&&h.componentWillMount(),typeof h.UNSAFE_componentWillMount=="function"&&h.UNSAFE_componentWillMount()),typeof h.componentDidMount=="function"&&(t.flags|=4194308)):(typeof h.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=i,t.memoizedState=D),h.props=i,h.state=D,h.context=m,i=j):(typeof h.componentDidMount=="function"&&(t.flags|=4194308),i=!1)}else{h=t.stateNode,jc(e,t),m=t.memoizedProps,K=as(n,m),h.props=K,V=t.pendingProps,P=h.context,D=n.contextType,j=Ws,typeof D=="object"&&D!==null&&(j=It(D)),f=n.getDerivedStateFromProps,(D=typeof f=="function"||typeof h.getSnapshotBeforeUpdate=="function")||typeof h.UNSAFE_componentWillReceiveProps!="function"&&typeof h.componentWillReceiveProps!="function"||(m!==V||P!==j)&&gp(t,h,i,j),ga=!1,P=t.memoizedState,h.state=P,Fi(t,i,h,l),Bi();var U=t.memoizedState;m!==V||P!==U||ga||e!==null&&e.dependencies!==null&&mr(e.dependencies)?(typeof f=="function"&&(Yc(t,n,f,i),U=t.memoizedState),(K=ga||yp(t,n,K,i,P,U,j)||e!==null&&e.dependencies!==null&&mr(e.dependencies))?(D||typeof h.UNSAFE_componentWillUpdate!="function"&&typeof h.componentWillUpdate!="function"||(typeof h.componentWillUpdate=="function"&&h.componentWillUpdate(i,U,j),typeof h.UNSAFE_componentWillUpdate=="function"&&h.UNSAFE_componentWillUpdate(i,U,j)),typeof h.componentDidUpdate=="function"&&(t.flags|=4),typeof h.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof h.componentDidUpdate!="function"||m===e.memoizedProps&&P===e.memoizedState||(t.flags|=4),typeof h.getSnapshotBeforeUpdate!="function"||m===e.memoizedProps&&P===e.memoizedState||(t.flags|=1024),t.memoizedProps=i,t.memoizedState=U),h.props=i,h.state=U,h.context=j,i=K):(typeof h.componentDidUpdate!="function"||m===e.memoizedProps&&P===e.memoizedState||(t.flags|=4),typeof h.getSnapshotBeforeUpdate!="function"||m===e.memoizedProps&&P===e.memoizedState||(t.flags|=1024),i=!1)}return h=i,Hr(e,t),i=(t.flags&128)!==0,h||i?(h=t.stateNode,n=i&&typeof n.getDerivedStateFromError!="function"?null:h.render(),t.flags|=1,e!==null&&i?(t.child=ts(t,e.child,null,l),t.child=ts(t,null,n,l)):Rt(e,t,n,l),t.memoizedState=h.state,e=t.child):e=Xn(e,t,l),e}function Hp(e,t,n,i){return Ya(),t.flags|=256,Rt(e,t,n,i),t.child}var eh={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function th(e){return{baseLanes:e,cachePool:km()}}function nh(e,t,n){return e=e!==null?e.childLanes&~n:0,t&&(e|=ln),e}function Wp(e,t,n){var i=t.pendingProps,l=!1,h=(t.flags&128)!==0,m;if((m=h)||(m=e!==null&&e.memoizedState===null?!1:(pt.current&2)!==0),m&&(l=!0,t.flags&=-129),m=(t.flags&32)!==0,t.flags&=-33,e===null){if(qe){if(l?va(t):ka(),(e=at)?(e=Jf(e,bn),e=e!==null&&e.data!=="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:ma!==null?{id:Wn,overflow:In}:null,retryLane:536870912,hydrationErrors:null},n=um(e),n.return=t,t.child=n,Wt=t,at=null)):e=null,e===null)throw fa(t);return Dh(e)?t.lanes=32:t.lanes=536870912,null}var f=i.children;return i=i.fallback,l?(ka(),l=t.mode,f=Wr({mode:"hidden",children:f},l),i=Ka(i,l,n,null),f.return=t,i.return=t,f.sibling=i,t.child=f,i=t.child,i.memoizedState=th(n),i.childLanes=nh(e,m,n),t.memoizedState=eh,Xi(null,i)):(va(t),ah(t,f))}var j=e.memoizedState;if(j!==null&&(f=j.dehydrated,f!==null)){if(h)t.flags&256?(va(t),t.flags&=-257,t=sh(e,t,n)):t.memoizedState!==null?(ka(),t.child=e.child,t.flags|=128,t=null):(ka(),f=i.fallback,l=t.mode,i=Wr({mode:"visible",children:i.children},l),f=Ka(f,l,n,null),f.flags|=2,i.return=t,f.return=t,i.sibling=f,t.child=i,ts(t,e.child,null,n),i=t.child,i.memoizedState=th(n),i.childLanes=nh(e,m,n),t.memoizedState=eh,t=Xi(null,i));else if(va(t),Dh(f)){if(m=f.nextSibling&&f.nextSibling.dataset,m)var D=m.dgst;m=D,i=Error(c(419)),i.stack="",i.digest=m,Pi({value:i,source:null,stack:null}),t=sh(e,t,n)}else if(vt||qs(e,t,n,!1),m=(n&e.childLanes)!==0,vt||m){if(m=et,m!==null&&(i=bu(m,n),i!==0&&i!==j.retryLane))throw j.retryLane=i,$a(e,i),Xt(m,e,i),Qc;qh(f)||Jr(),t=sh(e,t,n)}else qh(f)?(t.flags|=192,t.child=e.child,t=null):(e=j.treeContext,at=kn(f.nextSibling),Wt=t,qe=!0,pa=null,bn=!1,e!==null&&fm(t,e),t=ah(t,i.children),t.flags|=4096);return t}return l?(ka(),f=i.fallback,l=t.mode,j=e.child,D=j.sibling,i=Bn(j,{mode:"hidden",children:i.children}),i.subtreeFlags=j.subtreeFlags&65011712,D!==null?f=Bn(D,f):(f=Ka(f,l,n,null),f.flags|=2),f.return=t,i.return=t,i.sibling=f,t.child=i,Xi(null,i),i=t.child,f=e.child.memoizedState,f===null?f=th(n):(l=f.cachePool,l!==null?(j=wt._currentValue,l=l.parent!==j?{parent:j,pool:j}:l):l=km(),f={baseLanes:f.baseLanes|n,cachePool:l}),i.memoizedState=f,i.childLanes=nh(e,m,n),t.memoizedState=eh,Xi(e.child,i)):(va(t),n=e.child,e=n.sibling,n=Bn(n,{mode:"visible",children:i.children}),n.return=t,n.sibling=null,e!==null&&(m=t.deletions,m===null?(t.deletions=[e],t.flags|=16):m.push(e)),t.child=n,t.memoizedState=null,n)}function ah(e,t){return t=Wr({mode:"visible",children:t},e.mode),t.return=e,e.child=t}function Wr(e,t){return e=an(22,e,null,t),e.lanes=0,e}function sh(e,t,n){return ts(t,e.child,null,n),e=ah(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function Ip(e,t,n){e.lanes|=t;var i=e.alternate;i!==null&&(i.lanes|=t),bc(e.return,t,n)}function ih(e,t,n,i,l,h){var m=e.memoizedState;m===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:i,tail:n,tailMode:l,treeForkCount:h}:(m.isBackwards=t,m.rendering=null,m.renderingStartTime=0,m.last=i,m.tail=n,m.tailMode=l,m.treeForkCount=h)}function Rp(e,t,n){var i=t.pendingProps,l=i.revealOrder,h=i.tail;i=i.children;var m=pt.current,f=(m&2)!==0;if(f?(m=m&1|2,t.flags|=128):m&=1,G(pt,m),Rt(e,t,i,n),i=qe?Di:0,!f&&e!==null&&(e.flags&128)!==0)e:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&Ip(e,n,t);else if(e.tag===19)Ip(e,n,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}switch(l){case"forwards":for(n=t.child,l=null;n!==null;)e=n.alternate,e!==null&&kr(e)===null&&(l=n),n=n.sibling;n=l,n===null?(l=t.child,t.child=null):(l=n.sibling,n.sibling=null),ih(t,!1,l,n,h,i);break;case"backwards":case"unstable_legacy-backwards":for(n=null,l=t.child,t.child=null;l!==null;){if(e=l.alternate,e!==null&&kr(e)===null){t.child=l;break}e=l.sibling,l.sibling=n,n=l,l=e}ih(t,!0,n,null,h,i);break;case"together":ih(t,!1,null,null,void 0,i);break;default:t.memoizedState=null}return t.child}function Xn(e,t,n){if(e!==null&&(t.dependencies=e.dependencies),Sa|=t.lanes,(n&t.childLanes)===0)if(e!==null){if(qs(e,t,n,!1),(n&t.childLanes)===0)return null}else return null;if(e!==null&&t.child!==e.child)throw Error(c(153));if(t.child!==null){for(e=t.child,n=Bn(e,e.pendingProps),t.child=n,n.return=t;e.sibling!==null;)e=e.sibling,n=n.sibling=Bn(e,e.pendingProps),n.return=t;n.sibling=null}return t.child}function oh(e,t){return(e.lanes&t)!==0?!0:(e=e.dependencies,!!(e!==null&&mr(e)))}function ev(e,t,n){switch(t.tag){case 3:ce(t,t.stateNode.containerInfo),ya(t,wt,e.memoizedState.cache),Ya();break;case 27:case 5:Se(t);break;case 4:ce(t,t.stateNode.containerInfo);break;case 10:ya(t,t.type,t.memoizedProps.value);break;case 31:if(t.memoizedState!==null)return t.flags|=128,Lc(t),null;break;case 13:var i=t.memoizedState;if(i!==null)return i.dehydrated!==null?(va(t),t.flags|=128,null):(n&t.child.childLanes)!==0?Wp(e,t,n):(va(t),e=Xn(e,t,n),e!==null?e.sibling:null);va(t);break;case 19:var l=(e.flags&128)!==0;if(i=(n&t.childLanes)!==0,i||(qs(e,t,n,!1),i=(n&t.childLanes)!==0),l){if(i)return Rp(e,t,n);t.flags|=128}if(l=t.memoizedState,l!==null&&(l.rendering=null,l.tail=null,l.lastEffect=null),G(pt,pt.current),i)break;return null;case 22:return t.lanes=0,Cp(e,t,n,t.pendingProps);case 24:ya(t,wt,e.memoizedState.cache)}return Xn(e,t,n)}function Op(e,t,n){if(e!==null)if(e.memoizedProps!==t.pendingProps)vt=!0;else{if(!oh(e,n)&&(t.flags&128)===0)return vt=!1,ev(e,t,n);vt=(e.flags&131072)!==0}else vt=!1,qe&&(t.flags&1048576)!==0&&pm(t,Di,t.index);switch(t.lanes=0,t.tag){case 16:e:{var i=t.pendingProps;if(e=Za(t.elementType),t.type=e,typeof e=="function")dc(e)?(i=as(e,i),t.tag=1,t=Lp(null,t,e,i,n)):(t.tag=0,t=Zc(null,t,e,i,n));else{if(e!=null){var l=e.$$typeof;if(l===oe){t.tag=11,t=Sp(null,t,e,i,n);break e}else if(l===F){t.tag=14,t=Mp(null,t,e,i,n);break e}}throw t=Z(e)||e,Error(c(306,t,""))}}return t;case 0:return Zc(e,t,t.type,t.pendingProps,n);case 1:return i=t.type,l=as(i,t.pendingProps),Lp(e,t,i,l,n);case 3:e:{if(ce(t,t.stateNode.containerInfo),e===null)throw Error(c(387));i=t.pendingProps;var h=t.memoizedState;l=h.element,jc(e,t),Fi(t,i,null,n);var m=t.memoizedState;if(i=m.cache,ya(t,wt,i),i!==h.cache&&vc(t,[wt],n,!0),Bi(),i=m.element,h.isDehydrated)if(h={element:i,isDehydrated:!1,cache:m.cache},t.updateQueue.baseState=h,t.memoizedState=h,t.flags&256){t=Hp(e,t,i,n);break e}else if(i!==l){l=yn(Error(c(424)),t),Pi(l),t=Hp(e,t,i,n);break e}else for(e=t.stateNode.containerInfo,e.nodeType===9?e=e.body:e=e.nodeName==="HTML"?e.ownerDocument.body:e,at=kn(e.firstChild),Wt=t,qe=!0,pa=null,bn=!0,n=Cm(t,null,i,n),t.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling;else{if(Ya(),i===l){t=Xn(e,t,n);break e}Rt(e,t,i,n)}t=t.child}return t;case 26:return Hr(e,t),e===null?(n=Kf(t.type,null,t.pendingProps,null))?t.memoizedState=n:qe||(n=t.type,e=t.pendingProps,i=Yr(me.current).createElement(n),i[Ht]=t,i[Bt]=e,Ot(i,n,e),jt(i),t.stateNode=i):t.memoizedState=Kf(t.type,e.memoizedProps,t.pendingProps,e.memoizedState),null;case 27:return Se(t),e===null&&qe&&(i=t.stateNode=Bf(t.type,t.pendingProps,me.current),Wt=t,bn=!0,l=at,Na(t.type)?(Ph=l,at=kn(i.firstChild)):at=l),Rt(e,t,t.pendingProps.children,n),Hr(e,t),e===null&&(t.flags|=4194304),t.child;case 5:return e===null&&qe&&((l=i=at)&&(i=Ev(i,t.type,t.pendingProps,bn),i!==null?(t.stateNode=i,Wt=t,at=kn(i.firstChild),bn=!1,l=!0):l=!1),l||fa(t)),Se(t),l=t.type,h=t.pendingProps,m=e!==null?e.memoizedProps:null,i=h.children,Ih(l,h)?i=null:m!==null&&Ih(l,m)&&(t.flags|=32),t.memoizedState!==null&&(l=Wc(e,t,Bb,null,null,n),mo._currentValue=l),Hr(e,t),Rt(e,t,i,n),t.child;case 6:return e===null&&qe&&((e=n=at)&&(n=Lv(n,t.pendingProps,bn),n!==null?(t.stateNode=n,Wt=t,at=null,e=!0):e=!1),e||fa(t)),null;case 13:return Wp(e,t,n);case 4:return ce(t,t.stateNode.containerInfo),i=t.pendingProps,e===null?t.child=ts(t,null,i,n):Rt(e,t,i,n),t.child;case 11:return Sp(e,t,t.type,t.pendingProps,n);case 7:return Rt(e,t,t.pendingProps,n),t.child;case 8:return Rt(e,t,t.pendingProps.children,n),t.child;case 12:return Rt(e,t,t.pendingProps.children,n),t.child;case 10:return i=t.pendingProps,ya(t,t.type,i.value),Rt(e,t,i.children,n),t.child;case 9:return l=t.type._context,i=t.pendingProps.children,Xa(t),l=It(l),i=i(l),t.flags|=1,Rt(e,t,i,n),t.child;case 14:return Mp(e,t,t.type,t.pendingProps,n);case 15:return jp(e,t,t.type,t.pendingProps,n);case 19:return Rp(e,t,n);case 31:return Zb(e,t,n);case 22:return Cp(e,t,n,t.pendingProps);case 24:return Xa(t),i=It(wt),e===null?(l=xc(),l===null&&(l=et,h=kc(),l.pooledCache=h,h.refCount++,h!==null&&(l.pooledCacheLanes|=n),l=h),t.memoizedState={parent:i,cache:l},Mc(t),ya(t,wt,l)):((e.lanes&n)!==0&&(jc(e,t),Fi(t,null,null,n),Bi()),l=e.memoizedState,h=t.memoizedState,l.parent!==i?(l={parent:i,cache:i},t.memoizedState=l,t.lanes===0&&(t.memoizedState=t.updateQueue.baseState=l),ya(t,wt,i)):(i=h.cache,ya(t,wt,i),i!==l.cache&&vc(t,[wt],n,!0))),Rt(e,t,t.pendingProps.children,n),t.child;case 29:throw t.pendingProps}throw Error(c(156,t.tag))}function Qn(e){e.flags|=4}function rh(e,t,n,i,l){if((t=(e.mode&32)!==0)&&(t=!1),t){if(e.flags|=16777216,(l&335544128)===l)if(e.stateNode.complete)e.flags|=8192;else if(hf())e.flags|=8192;else throw es=gr,Sc}else e.flags&=-16777217}function qp(e,t){if(t.type!=="stylesheet"||(t.state.loading&4)!==0)e.flags&=-16777217;else if(e.flags|=16777216,!Zf(t))if(hf())e.flags|=8192;else throw es=gr,Sc}function Ir(e,t){t!==null&&(e.flags|=4),e.flags&16384&&(t=e.tag!==22?yu():536870912,e.lanes|=t,Ys|=t)}function Qi(e,t){if(!qe)switch(e.tailMode){case"hidden":t=e.tail;for(var n=null;t!==null;)t.alternate!==null&&(n=t),t=t.sibling;n===null?e.tail=null:n.sibling=null;break;case"collapsed":n=e.tail;for(var i=null;n!==null;)n.alternate!==null&&(i=n),n=n.sibling;i===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:i.sibling=null}}function st(e){var t=e.alternate!==null&&e.alternate.child===e.child,n=0,i=0;if(t)for(var l=e.child;l!==null;)n|=l.lanes|l.childLanes,i|=l.subtreeFlags&65011712,i|=l.flags&65011712,l.return=e,l=l.sibling;else for(l=e.child;l!==null;)n|=l.lanes|l.childLanes,i|=l.subtreeFlags,i|=l.flags,l.return=e,l=l.sibling;return e.subtreeFlags|=i,e.childLanes=n,t}function tv(e,t,n){var i=t.pendingProps;switch(fc(t),t.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return st(t),null;case 1:return st(t),null;case 3:return n=t.stateNode,i=null,e!==null&&(i=e.memoizedState.cache),t.memoizedState.cache!==i&&(t.flags|=2048),Kn(wt),be(),n.pendingContext&&(n.context=n.pendingContext,n.pendingContext=null),(e===null||e.child===null)&&(Os(t)?Qn(t):e===null||e.memoizedState.isDehydrated&&(t.flags&256)===0||(t.flags|=1024,gc())),st(t),null;case 26:var l=t.type,h=t.memoizedState;return e===null?(Qn(t),h!==null?(st(t),qp(t,h)):(st(t),rh(t,l,null,i,n))):h?h!==e.memoizedState?(Qn(t),st(t),qp(t,h)):(st(t),t.flags&=-16777217):(e=e.memoizedProps,e!==i&&Qn(t),st(t),rh(t,l,e,i,n)),null;case 27:if(he(t),n=me.current,l=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==i&&Qn(t);else{if(!i){if(t.stateNode===null)throw Error(c(166));return st(t),null}e=J.current,Os(t)?ym(t):(e=Bf(l,i,n),t.stateNode=e,Qn(t))}return st(t),null;case 5:if(he(t),l=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==i&&Qn(t);else{if(!i){if(t.stateNode===null)throw Error(c(166));return st(t),null}if(h=J.current,Os(t))ym(t);else{var m=Yr(me.current);switch(h){case 1:h=m.createElementNS("http://www.w3.org/2000/svg",l);break;case 2:h=m.createElementNS("http://www.w3.org/1998/Math/MathML",l);break;default:switch(l){case"svg":h=m.createElementNS("http://www.w3.org/2000/svg",l);break;case"math":h=m.createElementNS("http://www.w3.org/1998/Math/MathML",l);break;case"script":h=m.createElement("div"),h.innerHTML="<script><\/script>",h=h.removeChild(h.firstChild);break;case"select":h=typeof i.is=="string"?m.createElement("select",{is:i.is}):m.createElement("select"),i.multiple?h.multiple=!0:i.size&&(h.size=i.size);break;default:h=typeof i.is=="string"?m.createElement(l,{is:i.is}):m.createElement(l)}}h[Ht]=t,h[Bt]=i;e:for(m=t.child;m!==null;){if(m.tag===5||m.tag===6)h.appendChild(m.stateNode);else if(m.tag!==4&&m.tag!==27&&m.child!==null){m.child.return=m,m=m.child;continue}if(m===t)break e;for(;m.sibling===null;){if(m.return===null||m.return===t)break e;m=m.return}m.sibling.return=m.return,m=m.sibling}t.stateNode=h;e:switch(Ot(h,l,i),l){case"button":case"input":case"select":case"textarea":i=!!i.autoFocus;break e;case"img":i=!0;break e;default:i=!1}i&&Qn(t)}}return st(t),rh(t,t.type,e===null?null:e.memoizedProps,t.pendingProps,n),null;case 6:if(e&&t.stateNode!=null)e.memoizedProps!==i&&Qn(t);else{if(typeof i!="string"&&t.stateNode===null)throw Error(c(166));if(e=me.current,Os(t)){if(e=t.stateNode,n=t.memoizedProps,i=null,l=Wt,l!==null)switch(l.tag){case 27:case 5:i=l.memoizedProps}e[Ht]=t,e=!!(e.nodeValue===n||i!==null&&i.suppressHydrationWarning===!0||If(e.nodeValue,n)),e||fa(t,!0)}else e=Yr(e).createTextNode(i),e[Ht]=t,t.stateNode=e}return st(t),null;case 31:if(n=t.memoizedState,e===null||e.memoizedState!==null){if(i=Os(t),n!==null){if(e===null){if(!i)throw Error(c(318));if(e=t.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(c(557));e[Ht]=t}else Ya(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;st(t),e=!1}else n=gc(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=n),e=!0;if(!e)return t.flags&256?(on(t),t):(on(t),null);if((t.flags&128)!==0)throw Error(c(558))}return st(t),null;case 13:if(i=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(l=Os(t),i!==null&&i.dehydrated!==null){if(e===null){if(!l)throw Error(c(318));if(l=t.memoizedState,l=l!==null?l.dehydrated:null,!l)throw Error(c(317));l[Ht]=t}else Ya(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;st(t),l=!1}else l=gc(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=l),l=!0;if(!l)return t.flags&256?(on(t),t):(on(t),null)}return on(t),(t.flags&128)!==0?(t.lanes=n,t):(n=i!==null,e=e!==null&&e.memoizedState!==null,n&&(i=t.child,l=null,i.alternate!==null&&i.alternate.memoizedState!==null&&i.alternate.memoizedState.cachePool!==null&&(l=i.alternate.memoizedState.cachePool.pool),h=null,i.memoizedState!==null&&i.memoizedState.cachePool!==null&&(h=i.memoizedState.cachePool.pool),h!==l&&(i.flags|=2048)),n!==e&&n&&(t.child.flags|=8192),Ir(t,t.updateQueue),st(t),null);case 4:return be(),e===null&&Nh(t.stateNode.containerInfo),st(t),null;case 10:return Kn(t.type),st(t),null;case 19:if(M(pt),i=t.memoizedState,i===null)return st(t),null;if(l=(t.flags&128)!==0,h=i.rendering,h===null)if(l)Qi(i,!1);else{if(mt!==0||e!==null&&(e.flags&128)!==0)for(e=t.child;e!==null;){if(h=kr(e),h!==null){for(t.flags|=128,Qi(i,!1),e=h.updateQueue,t.updateQueue=e,Ir(t,e),t.subtreeFlags=0,e=n,n=t.child;n!==null;)dm(n,e),n=n.sibling;return G(pt,pt.current&1|2),qe&&Fn(t,i.treeForkCount),t.child}e=e.sibling}i.tail!==null&&Tt()>Pr&&(t.flags|=128,l=!0,Qi(i,!1),t.lanes=4194304)}else{if(!l)if(e=kr(h),e!==null){if(t.flags|=128,l=!0,e=e.updateQueue,t.updateQueue=e,Ir(t,e),Qi(i,!0),i.tail===null&&i.tailMode==="hidden"&&!h.alternate&&!qe)return st(t),null}else 2*Tt()-i.renderingStartTime>Pr&&n!==536870912&&(t.flags|=128,l=!0,Qi(i,!1),t.lanes=4194304);i.isBackwards?(h.sibling=t.child,t.child=h):(e=i.last,e!==null?e.sibling=h:t.child=h,i.last=h)}return i.tail!==null?(e=i.tail,i.rendering=e,i.tail=e.sibling,i.renderingStartTime=Tt(),e.sibling=null,n=pt.current,G(pt,l?n&1|2:n&1),qe&&Fn(t,i.treeForkCount),e):(st(t),null);case 22:case 23:return on(t),Ec(),i=t.memoizedState!==null,e!==null?e.memoizedState!==null!==i&&(t.flags|=8192):i&&(t.flags|=8192),i?(n&536870912)!==0&&(t.flags&128)===0&&(st(t),t.subtreeFlags&6&&(t.flags|=8192)):st(t),n=t.updateQueue,n!==null&&Ir(t,n.retryQueue),n=null,e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(n=e.memoizedState.cachePool.pool),i=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(i=t.memoizedState.cachePool.pool),i!==n&&(t.flags|=2048),e!==null&&M(Qa),null;case 24:return n=null,e!==null&&(n=e.memoizedState.cache),t.memoizedState.cache!==n&&(t.flags|=2048),Kn(wt),st(t),null;case 25:return null;case 30:return null}throw Error(c(156,t.tag))}function nv(e,t){switch(fc(t),t.tag){case 1:return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return Kn(wt),be(),e=t.flags,(e&65536)!==0&&(e&128)===0?(t.flags=e&-65537|128,t):null;case 26:case 27:case 5:return he(t),null;case 31:if(t.memoizedState!==null){if(on(t),t.alternate===null)throw Error(c(340));Ya()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 13:if(on(t),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(c(340));Ya()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return M(pt),null;case 4:return be(),null;case 10:return Kn(t.type),null;case 22:case 23:return on(t),Ec(),e!==null&&M(Qa),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 24:return Kn(wt),null;case 25:return null;default:return null}}function Dp(e,t){switch(fc(t),t.tag){case 3:Kn(wt),be();break;case 26:case 27:case 5:he(t);break;case 4:be();break;case 31:t.memoizedState!==null&&on(t);break;case 13:on(t);break;case 19:M(pt);break;case 10:Kn(t.type);break;case 22:case 23:on(t),Ec(),e!==null&&M(Qa);break;case 24:Kn(wt)}}function Zi(e,t){try{var n=t.updateQueue,i=n!==null?n.lastEffect:null;if(i!==null){var l=i.next;n=l;do{if((n.tag&e)===e){i=void 0;var h=n.create,m=n.inst;i=h(),m.destroy=i}n=n.next}while(n!==l)}}catch(f){Ke(t,t.return,f)}}function Ta(e,t,n){try{var i=t.updateQueue,l=i!==null?i.lastEffect:null;if(l!==null){var h=l.next;i=h;do{if((i.tag&e)===e){var m=i.inst,f=m.destroy;if(f!==void 0){m.destroy=void 0,l=t;var j=n,D=f;try{D()}catch(K){Ke(l,j,K)}}}i=i.next}while(i!==h)}}catch(K){Ke(t,t.return,K)}}function Pp(e){var t=e.updateQueue;if(t!==null){var n=e.stateNode;try{Nm(t,n)}catch(i){Ke(e,e.return,i)}}}function Gp(e,t,n){n.props=as(e.type,e.memoizedProps),n.state=e.memoizedState;try{n.componentWillUnmount()}catch(i){Ke(e,t,i)}}function eo(e,t){try{var n=e.ref;if(n!==null){switch(e.tag){case 26:case 27:case 5:var i=e.stateNode;break;case 30:i=e.stateNode;break;default:i=e.stateNode}typeof n=="function"?e.refCleanup=n(i):n.current=i}}catch(l){Ke(e,t,l)}}function Rn(e,t){var n=e.ref,i=e.refCleanup;if(n!==null)if(typeof i=="function")try{i()}catch(l){Ke(e,t,l)}finally{e.refCleanup=null,e=e.alternate,e!=null&&(e.refCleanup=null)}else if(typeof n=="function")try{n(null)}catch(l){Ke(e,t,l)}else n.current=null}function zp(e){var t=e.type,n=e.memoizedProps,i=e.stateNode;try{e:switch(t){case"button":case"input":case"select":case"textarea":n.autoFocus&&i.focus();break e;case"img":n.src?i.src=n.src:n.srcSet&&(i.srcset=n.srcSet)}}catch(l){Ke(e,e.return,l)}}function lh(e,t,n){try{var i=e.stateNode;Sv(i,e.type,n,t),i[Bt]=t}catch(l){Ke(e,e.return,l)}}function Jp(e){return e.tag===5||e.tag===3||e.tag===26||e.tag===27&&Na(e.type)||e.tag===4}function ch(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||Jp(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.tag===27&&Na(e.type)||e.flags&2||e.child===null||e.tag===4)continue e;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function hh(e,t,n){var i=e.tag;if(i===5||i===6)e=e.stateNode,t?(n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n).insertBefore(e,t):(t=n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n,t.appendChild(e),n=n._reactRootContainer,n!=null||t.onclick!==null||(t.onclick=_n));else if(i!==4&&(i===27&&Na(e.type)&&(n=e.stateNode,t=null),e=e.child,e!==null))for(hh(e,t,n),e=e.sibling;e!==null;)hh(e,t,n),e=e.sibling}function Rr(e,t,n){var i=e.tag;if(i===5||i===6)e=e.stateNode,t?n.insertBefore(e,t):n.appendChild(e);else if(i!==4&&(i===27&&Na(e.type)&&(n=e.stateNode),e=e.child,e!==null))for(Rr(e,t,n),e=e.sibling;e!==null;)Rr(e,t,n),e=e.sibling}function _p(e){var t=e.stateNode,n=e.memoizedProps;try{for(var i=e.type,l=t.attributes;l.length;)t.removeAttributeNode(l[0]);Ot(t,i,n),t[Ht]=e,t[Bt]=n}catch(h){Ke(e,e.return,h)}}var Zn=!1,kt=!1,dh=!1,Up=typeof WeakSet=="function"?WeakSet:Set,Ct=null;function av(e,t){if(e=e.containerInfo,Hh=nl,e=nm(e),sc(e)){if("selectionStart"in e)var n={start:e.selectionStart,end:e.selectionEnd};else e:{n=(n=e.ownerDocument)&&n.defaultView||window;var i=n.getSelection&&n.getSelection();if(i&&i.rangeCount!==0){n=i.anchorNode;var l=i.anchorOffset,h=i.focusNode;i=i.focusOffset;try{n.nodeType,h.nodeType}catch{n=null;break e}var m=0,f=-1,j=-1,D=0,K=0,V=e,P=null;t:for(;;){for(var U;V!==n||l!==0&&V.nodeType!==3||(f=m+l),V!==h||i!==0&&V.nodeType!==3||(j=m+i),V.nodeType===3&&(m+=V.nodeValue.length),(U=V.firstChild)!==null;)P=V,V=U;for(;;){if(V===e)break t;if(P===n&&++D===l&&(f=m),P===h&&++K===i&&(j=m),(U=V.nextSibling)!==null)break;V=P,P=V.parentNode}V=U}n=f===-1||j===-1?null:{start:f,end:j}}else n=null}n=n||{start:0,end:0}}else n=null;for(Wh={focusedElem:e,selectionRange:n},nl=!1,Ct=t;Ct!==null;)if(t=Ct,e=t.child,(t.subtreeFlags&1028)!==0&&e!==null)e.return=t,Ct=e;else for(;Ct!==null;){switch(t=Ct,h=t.alternate,e=t.flags,t.tag){case 0:if((e&4)!==0&&(e=t.updateQueue,e=e!==null?e.events:null,e!==null))for(n=0;n<e.length;n++)l=e[n],l.ref.impl=l.nextImpl;break;case 11:case 15:break;case 1:if((e&1024)!==0&&h!==null){e=void 0,n=t,l=h.memoizedProps,h=h.memoizedState,i=n.stateNode;try{var pe=as(n.type,l);e=i.getSnapshotBeforeUpdate(pe,h),i.__reactInternalSnapshotBeforeUpdate=e}catch(Te){Ke(n,n.return,Te)}}break;case 3:if((e&1024)!==0){if(e=t.stateNode.containerInfo,n=e.nodeType,n===9)Oh(e);else if(n===1)switch(e.nodeName){case"HEAD":case"HTML":case"BODY":Oh(e);break;default:e.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;default:if((e&1024)!==0)throw Error(c(163))}if(e=t.sibling,e!==null){e.return=t.return,Ct=e;break}Ct=t.return}}function Bp(e,t,n){var i=n.flags;switch(n.tag){case 0:case 11:case 15:ta(e,n),i&4&&Zi(5,n);break;case 1:if(ta(e,n),i&4)if(e=n.stateNode,t===null)try{e.componentDidMount()}catch(m){Ke(n,n.return,m)}else{var l=as(n.type,t.memoizedProps);t=t.memoizedState;try{e.componentDidUpdate(l,t,e.__reactInternalSnapshotBeforeUpdate)}catch(m){Ke(n,n.return,m)}}i&64&&Pp(n),i&512&&eo(n,n.return);break;case 3:if(ta(e,n),i&64&&(e=n.updateQueue,e!==null)){if(t=null,n.child!==null)switch(n.child.tag){case 27:case 5:t=n.child.stateNode;break;case 1:t=n.child.stateNode}try{Nm(e,t)}catch(m){Ke(n,n.return,m)}}break;case 27:t===null&&i&4&&_p(n);case 26:case 5:ta(e,n),t===null&&i&4&&zp(n),i&512&&eo(n,n.return);break;case 12:ta(e,n);break;case 31:ta(e,n),i&4&&Kp(e,n);break;case 13:ta(e,n),i&4&&Yp(e,n),i&64&&(e=n.memoizedState,e!==null&&(e=e.dehydrated,e!==null&&(n=uv.bind(null,n),Hv(e,n))));break;case 22:if(i=n.memoizedState!==null||Zn,!i){t=t!==null&&t.memoizedState!==null||kt,l=Zn;var h=kt;Zn=i,(kt=t)&&!h?na(e,n,(n.subtreeFlags&8772)!==0):ta(e,n),Zn=l,kt=h}break;case 30:break;default:ta(e,n)}}function Fp(e){var t=e.alternate;t!==null&&(e.alternate=null,Fp(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&zl(t)),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}var ct=null,$t=!1;function ea(e,t,n){for(n=n.child;n!==null;)$p(e,t,n),n=n.sibling}function $p(e,t,n){if(rt&&typeof rt.onCommitFiberUnmount=="function")try{rt.onCommitFiberUnmount(un,n)}catch{}switch(n.tag){case 26:kt||Rn(n,t),ea(e,t,n),n.memoizedState?n.memoizedState.count--:n.stateNode&&(n=n.stateNode,n.parentNode.removeChild(n));break;case 27:kt||Rn(n,t);var i=ct,l=$t;Na(n.type)&&(ct=n.stateNode,$t=!1),ea(e,t,n),co(n.stateNode),ct=i,$t=l;break;case 5:kt||Rn(n,t);case 6:if(i=ct,l=$t,ct=null,ea(e,t,n),ct=i,$t=l,ct!==null)if($t)try{(ct.nodeType===9?ct.body:ct.nodeName==="HTML"?ct.ownerDocument.body:ct).removeChild(n.stateNode)}catch(h){Ke(n,t,h)}else try{ct.removeChild(n.stateNode)}catch(h){Ke(n,t,h)}break;case 18:ct!==null&&($t?(e=ct,Gf(e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,n.stateNode),ai(e)):Gf(ct,n.stateNode));break;case 4:i=ct,l=$t,ct=n.stateNode.containerInfo,$t=!0,ea(e,t,n),ct=i,$t=l;break;case 0:case 11:case 14:case 15:Ta(2,n,t),kt||Ta(4,n,t),ea(e,t,n);break;case 1:kt||(Rn(n,t),i=n.stateNode,typeof i.componentWillUnmount=="function"&&Gp(n,t,i)),ea(e,t,n);break;case 21:ea(e,t,n);break;case 22:kt=(i=kt)||n.memoizedState!==null,ea(e,t,n),kt=i;break;default:ea(e,t,n)}}function Kp(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null))){e=e.dehydrated;try{ai(e)}catch(n){Ke(t,t.return,n)}}}function Yp(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null&&(e=e.dehydrated,e!==null))))try{ai(e)}catch(n){Ke(t,t.return,n)}}function sv(e){switch(e.tag){case 31:case 13:case 19:var t=e.stateNode;return t===null&&(t=e.stateNode=new Up),t;case 22:return e=e.stateNode,t=e._retryCache,t===null&&(t=e._retryCache=new Up),t;default:throw Error(c(435,e.tag))}}function Or(e,t){var n=sv(e);t.forEach(function(i){if(!n.has(i)){n.add(i);var l=mv.bind(null,e,i);i.then(l,l)}})}function Kt(e,t){var n=t.deletions;if(n!==null)for(var i=0;i<n.length;i++){var l=n[i],h=e,m=t,f=m;e:for(;f!==null;){switch(f.tag){case 27:if(Na(f.type)){ct=f.stateNode,$t=!1;break e}break;case 5:ct=f.stateNode,$t=!1;break e;case 3:case 4:ct=f.stateNode.containerInfo,$t=!0;break e}f=f.return}if(ct===null)throw Error(c(160));$p(h,m,l),ct=null,$t=!1,h=l.alternate,h!==null&&(h.return=null),l.return=null}if(t.subtreeFlags&13886)for(t=t.child;t!==null;)Vp(t,e),t=t.sibling}var An=null;function Vp(e,t){var n=e.alternate,i=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:Kt(t,e),Yt(e),i&4&&(Ta(3,e,e.return),Zi(3,e),Ta(5,e,e.return));break;case 1:Kt(t,e),Yt(e),i&512&&(kt||n===null||Rn(n,n.return)),i&64&&Zn&&(e=e.updateQueue,e!==null&&(i=e.callbacks,i!==null&&(n=e.shared.hiddenCallbacks,e.shared.hiddenCallbacks=n===null?i:n.concat(i))));break;case 26:var l=An;if(Kt(t,e),Yt(e),i&512&&(kt||n===null||Rn(n,n.return)),i&4){var h=n!==null?n.memoizedState:null;if(i=e.memoizedState,n===null)if(i===null)if(e.stateNode===null){e:{i=e.type,n=e.memoizedProps,l=l.ownerDocument||l;t:switch(i){case"title":h=l.getElementsByTagName("title")[0],(!h||h[Ci]||h[Ht]||h.namespaceURI==="http://www.w3.org/2000/svg"||h.hasAttribute("itemprop"))&&(h=l.createElement(i),l.head.insertBefore(h,l.querySelector("head > title"))),Ot(h,i,n),h[Ht]=e,jt(h),i=h;break e;case"link":var m=Xf("link","href",l).get(i+(n.href||""));if(m){for(var f=0;f<m.length;f++)if(h=m[f],h.getAttribute("href")===(n.href==null||n.href===""?null:n.href)&&h.getAttribute("rel")===(n.rel==null?null:n.rel)&&h.getAttribute("title")===(n.title==null?null:n.title)&&h.getAttribute("crossorigin")===(n.crossOrigin==null?null:n.crossOrigin)){m.splice(f,1);break t}}h=l.createElement(i),Ot(h,i,n),l.head.appendChild(h);break;case"meta":if(m=Xf("meta","content",l).get(i+(n.content||""))){for(f=0;f<m.length;f++)if(h=m[f],h.getAttribute("content")===(n.content==null?null:""+n.content)&&h.getAttribute("name")===(n.name==null?null:n.name)&&h.getAttribute("property")===(n.property==null?null:n.property)&&h.getAttribute("http-equiv")===(n.httpEquiv==null?null:n.httpEquiv)&&h.getAttribute("charset")===(n.charSet==null?null:n.charSet)){m.splice(f,1);break t}}h=l.createElement(i),Ot(h,i,n),l.head.appendChild(h);break;default:throw Error(c(468,i))}h[Ht]=e,jt(h),i=h}e.stateNode=i}else Qf(l,e.type,e.stateNode);else e.stateNode=Vf(l,i,e.memoizedProps);else h!==i?(h===null?n.stateNode!==null&&(n=n.stateNode,n.parentNode.removeChild(n)):h.count--,i===null?Qf(l,e.type,e.stateNode):Vf(l,i,e.memoizedProps)):i===null&&e.stateNode!==null&&lh(e,e.memoizedProps,n.memoizedProps)}break;case 27:Kt(t,e),Yt(e),i&512&&(kt||n===null||Rn(n,n.return)),n!==null&&i&4&&lh(e,e.memoizedProps,n.memoizedProps);break;case 5:if(Kt(t,e),Yt(e),i&512&&(kt||n===null||Rn(n,n.return)),e.flags&32){l=e.stateNode;try{js(l,"")}catch(pe){Ke(e,e.return,pe)}}i&4&&e.stateNode!=null&&(l=e.memoizedProps,lh(e,l,n!==null?n.memoizedProps:l)),i&1024&&(dh=!0);break;case 6:if(Kt(t,e),Yt(e),i&4){if(e.stateNode===null)throw Error(c(162));i=e.memoizedProps,n=e.stateNode;try{n.nodeValue=i}catch(pe){Ke(e,e.return,pe)}}break;case 3:if(Qr=null,l=An,An=Vr(t.containerInfo),Kt(t,e),An=l,Yt(e),i&4&&n!==null&&n.memoizedState.isDehydrated)try{ai(t.containerInfo)}catch(pe){Ke(e,e.return,pe)}dh&&(dh=!1,Xp(e));break;case 4:i=An,An=Vr(e.stateNode.containerInfo),Kt(t,e),Yt(e),An=i;break;case 12:Kt(t,e),Yt(e);break;case 31:Kt(t,e),Yt(e),i&4&&(i=e.updateQueue,i!==null&&(e.updateQueue=null,Or(e,i)));break;case 13:Kt(t,e),Yt(e),e.child.flags&8192&&e.memoizedState!==null!=(n!==null&&n.memoizedState!==null)&&(Dr=Tt()),i&4&&(i=e.updateQueue,i!==null&&(e.updateQueue=null,Or(e,i)));break;case 22:l=e.memoizedState!==null;var j=n!==null&&n.memoizedState!==null,D=Zn,K=kt;if(Zn=D||l,kt=K||j,Kt(t,e),kt=K,Zn=D,Yt(e),i&8192)e:for(t=e.stateNode,t._visibility=l?t._visibility&-2:t._visibility|1,l&&(n===null||j||Zn||kt||ss(e)),n=null,t=e;;){if(t.tag===5||t.tag===26){if(n===null){j=n=t;try{if(h=j.stateNode,l)m=h.style,typeof m.setProperty=="function"?m.setProperty("display","none","important"):m.display="none";else{f=j.stateNode;var V=j.memoizedProps.style,P=V!=null&&V.hasOwnProperty("display")?V.display:null;f.style.display=P==null||typeof P=="boolean"?"":(""+P).trim()}}catch(pe){Ke(j,j.return,pe)}}}else if(t.tag===6){if(n===null){j=t;try{j.stateNode.nodeValue=l?"":j.memoizedProps}catch(pe){Ke(j,j.return,pe)}}}else if(t.tag===18){if(n===null){j=t;try{var U=j.stateNode;l?zf(U,!0):zf(j.stateNode,!1)}catch(pe){Ke(j,j.return,pe)}}}else if((t.tag!==22&&t.tag!==23||t.memoizedState===null||t===e)&&t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break e;for(;t.sibling===null;){if(t.return===null||t.return===e)break e;n===t&&(n=null),t=t.return}n===t&&(n=null),t.sibling.return=t.return,t=t.sibling}i&4&&(i=e.updateQueue,i!==null&&(n=i.retryQueue,n!==null&&(i.retryQueue=null,Or(e,n))));break;case 19:Kt(t,e),Yt(e),i&4&&(i=e.updateQueue,i!==null&&(e.updateQueue=null,Or(e,i)));break;case 30:break;case 21:break;default:Kt(t,e),Yt(e)}}function Yt(e){var t=e.flags;if(t&2){try{for(var n,i=e.return;i!==null;){if(Jp(i)){n=i;break}i=i.return}if(n==null)throw Error(c(160));switch(n.tag){case 27:var l=n.stateNode,h=ch(e);Rr(e,h,l);break;case 5:var m=n.stateNode;n.flags&32&&(js(m,""),n.flags&=-33);var f=ch(e);Rr(e,f,m);break;case 3:case 4:var j=n.stateNode.containerInfo,D=ch(e);hh(e,D,j);break;default:throw Error(c(161))}}catch(K){Ke(e,e.return,K)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function Xp(e){if(e.subtreeFlags&1024)for(e=e.child;e!==null;){var t=e;Xp(t),t.tag===5&&t.flags&1024&&t.stateNode.reset(),e=e.sibling}}function ta(e,t){if(t.subtreeFlags&8772)for(t=t.child;t!==null;)Bp(e,t.alternate,t),t=t.sibling}function ss(e){for(e=e.child;e!==null;){var t=e;switch(t.tag){case 0:case 11:case 14:case 15:Ta(4,t,t.return),ss(t);break;case 1:Rn(t,t.return);var n=t.stateNode;typeof n.componentWillUnmount=="function"&&Gp(t,t.return,n),ss(t);break;case 27:co(t.stateNode);case 26:case 5:Rn(t,t.return),ss(t);break;case 22:t.memoizedState===null&&ss(t);break;case 30:ss(t);break;default:ss(t)}e=e.sibling}}function na(e,t,n){for(n=n&&(t.subtreeFlags&8772)!==0,t=t.child;t!==null;){var i=t.alternate,l=e,h=t,m=h.flags;switch(h.tag){case 0:case 11:case 15:na(l,h,n),Zi(4,h);break;case 1:if(na(l,h,n),i=h,l=i.stateNode,typeof l.componentDidMount=="function")try{l.componentDidMount()}catch(D){Ke(i,i.return,D)}if(i=h,l=i.updateQueue,l!==null){var f=i.stateNode;try{var j=l.shared.hiddenCallbacks;if(j!==null)for(l.shared.hiddenCallbacks=null,l=0;l<j.length;l++)Am(j[l],f)}catch(D){Ke(i,i.return,D)}}n&&m&64&&Pp(h),eo(h,h.return);break;case 27:_p(h);case 26:case 5:na(l,h,n),n&&i===null&&m&4&&zp(h),eo(h,h.return);break;case 12:na(l,h,n);break;case 31:na(l,h,n),n&&m&4&&Kp(l,h);break;case 13:na(l,h,n),n&&m&4&&Yp(l,h);break;case 22:h.memoizedState===null&&na(l,h,n),eo(h,h.return);break;case 30:break;default:na(l,h,n)}t=t.sibling}}function uh(e,t){var n=null;e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(n=e.memoizedState.cachePool.pool),e=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(e=t.memoizedState.cachePool.pool),e!==n&&(e!=null&&e.refCount++,n!=null&&Gi(n))}function mh(e,t){e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&Gi(e))}function Nn(e,t,n,i){if(t.subtreeFlags&10256)for(t=t.child;t!==null;)Qp(e,t,n,i),t=t.sibling}function Qp(e,t,n,i){var l=t.flags;switch(t.tag){case 0:case 11:case 15:Nn(e,t,n,i),l&2048&&Zi(9,t);break;case 1:Nn(e,t,n,i);break;case 3:Nn(e,t,n,i),l&2048&&(e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&Gi(e)));break;case 12:if(l&2048){Nn(e,t,n,i),e=t.stateNode;try{var h=t.memoizedProps,m=h.id,f=h.onPostCommit;typeof f=="function"&&f(m,t.alternate===null?"mount":"update",e.passiveEffectDuration,-0)}catch(j){Ke(t,t.return,j)}}else Nn(e,t,n,i);break;case 31:Nn(e,t,n,i);break;case 13:Nn(e,t,n,i);break;case 23:break;case 22:h=t.stateNode,m=t.alternate,t.memoizedState!==null?h._visibility&2?Nn(e,t,n,i):to(e,t):h._visibility&2?Nn(e,t,n,i):(h._visibility|=2,Fs(e,t,n,i,(t.subtreeFlags&10256)!==0||!1)),l&2048&&uh(m,t);break;case 24:Nn(e,t,n,i),l&2048&&mh(t.alternate,t);break;default:Nn(e,t,n,i)}}function Fs(e,t,n,i,l){for(l=l&&((t.subtreeFlags&10256)!==0||!1),t=t.child;t!==null;){var h=e,m=t,f=n,j=i,D=m.flags;switch(m.tag){case 0:case 11:case 15:Fs(h,m,f,j,l),Zi(8,m);break;case 23:break;case 22:var K=m.stateNode;m.memoizedState!==null?K._visibility&2?Fs(h,m,f,j,l):to(h,m):(K._visibility|=2,Fs(h,m,f,j,l)),l&&D&2048&&uh(m.alternate,m);break;case 24:Fs(h,m,f,j,l),l&&D&2048&&mh(m.alternate,m);break;default:Fs(h,m,f,j,l)}t=t.sibling}}function to(e,t){if(t.subtreeFlags&10256)for(t=t.child;t!==null;){var n=e,i=t,l=i.flags;switch(i.tag){case 22:to(n,i),l&2048&&uh(i.alternate,i);break;case 24:to(n,i),l&2048&&mh(i.alternate,i);break;default:to(n,i)}t=t.sibling}}var no=8192;function $s(e,t,n){if(e.subtreeFlags&no)for(e=e.child;e!==null;)Zp(e,t,n),e=e.sibling}function Zp(e,t,n){switch(e.tag){case 26:$s(e,t,n),e.flags&no&&e.memoizedState!==null&&Uv(n,An,e.memoizedState,e.memoizedProps);break;case 5:$s(e,t,n);break;case 3:case 4:var i=An;An=Vr(e.stateNode.containerInfo),$s(e,t,n),An=i;break;case 22:e.memoizedState===null&&(i=e.alternate,i!==null&&i.memoizedState!==null?(i=no,no=16777216,$s(e,t,n),no=i):$s(e,t,n));break;default:$s(e,t,n)}}function ef(e){var t=e.alternate;if(t!==null&&(e=t.child,e!==null)){t.child=null;do t=e.sibling,e.sibling=null,e=t;while(e!==null)}}function ao(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var n=0;n<t.length;n++){var i=t[n];Ct=i,nf(i,e)}ef(e)}if(e.subtreeFlags&10256)for(e=e.child;e!==null;)tf(e),e=e.sibling}function tf(e){switch(e.tag){case 0:case 11:case 15:ao(e),e.flags&2048&&Ta(9,e,e.return);break;case 3:ao(e);break;case 12:ao(e);break;case 22:var t=e.stateNode;e.memoizedState!==null&&t._visibility&2&&(e.return===null||e.return.tag!==13)?(t._visibility&=-3,qr(e)):ao(e);break;default:ao(e)}}function qr(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var n=0;n<t.length;n++){var i=t[n];Ct=i,nf(i,e)}ef(e)}for(e=e.child;e!==null;){switch(t=e,t.tag){case 0:case 11:case 15:Ta(8,t,t.return),qr(t);break;case 22:n=t.stateNode,n._visibility&2&&(n._visibility&=-3,qr(t));break;default:qr(t)}e=e.sibling}}function nf(e,t){for(;Ct!==null;){var n=Ct;switch(n.tag){case 0:case 11:case 15:Ta(8,n,t);break;case 23:case 22:if(n.memoizedState!==null&&n.memoizedState.cachePool!==null){var i=n.memoizedState.cachePool.pool;i!=null&&i.refCount++}break;case 24:Gi(n.memoizedState.cache)}if(i=n.child,i!==null)i.return=n,Ct=i;else e:for(n=e;Ct!==null;){i=Ct;var l=i.sibling,h=i.return;if(Fp(i),i===n){Ct=null;break e}if(l!==null){l.return=h,Ct=l;break e}Ct=h}}}var iv={getCacheForType:function(e){var t=It(wt),n=t.data.get(e);return n===void 0&&(n=e(),t.data.set(e,n)),n},cacheSignal:function(){return It(wt).controller.signal}},ov=typeof WeakMap=="function"?WeakMap:Map,Be=0,et=null,Le=null,Ie=0,$e=0,rn=null,xa=!1,Ks=!1,ph=!1,aa=0,mt=0,Sa=0,is=0,fh=0,ln=0,Ys=0,so=null,Vt=null,yh=!1,Dr=0,af=0,Pr=1/0,Gr=null,Ma=null,St=0,ja=null,Vs=null,sa=0,gh=0,wh=null,sf=null,io=0,bh=null;function cn(){return(Be&2)!==0&&Ie!==0?Ie&-Ie:v.T!==null?Mh():vu()}function of(){if(ln===0)if((Ie&536870912)===0||qe){var e=Ko;Ko<<=1,(Ko&3932160)===0&&(Ko=262144),ln=e}else ln=536870912;return e=sn.current,e!==null&&(e.flags|=32),ln}function Xt(e,t,n){(e===et&&($e===2||$e===9)||e.cancelPendingCommit!==null)&&(Xs(e,0),Ca(e,Ie,ln,!1)),ji(e,n),((Be&2)===0||e!==et)&&(e===et&&((Be&2)===0&&(is|=n),mt===4&&Ca(e,Ie,ln,!1)),On(e))}function rf(e,t,n){if((Be&6)!==0)throw Error(c(327));var i=!n&&(t&127)===0&&(t&e.expiredLanes)===0||Mi(e,t),l=i?cv(e,t):kh(e,t,!0),h=i;do{if(l===0){Ks&&!i&&Ca(e,t,0,!1);break}else{if(n=e.current.alternate,h&&!rv(n)){l=kh(e,t,!1),h=!1;continue}if(l===2){if(h=t,e.errorRecoveryDisabledLanes&h)var m=0;else m=e.pendingLanes&-536870913,m=m!==0?m:m&536870912?536870912:0;if(m!==0){t=m;e:{var f=e;l=so;var j=f.current.memoizedState.isDehydrated;if(j&&(Xs(f,m).flags|=256),m=kh(f,m,!1),m!==2){if(ph&&!j){f.errorRecoveryDisabledLanes|=h,is|=h,l=4;break e}h=Vt,Vt=l,h!==null&&(Vt===null?Vt=h:Vt.push.apply(Vt,h))}l=m}if(h=!1,l!==2)continue}}if(l===1){Xs(e,0),Ca(e,t,0,!0);break}e:{switch(i=e,h=l,h){case 0:case 1:throw Error(c(345));case 4:if((t&4194048)!==t)break;case 6:Ca(i,t,ln,!xa);break e;case 2:Vt=null;break;case 3:case 5:break;default:throw Error(c(329))}if((t&62914560)===t&&(l=Dr+300-Tt(),10<l)){if(Ca(i,t,ln,!xa),Vo(i,0,!0)!==0)break e;sa=t,i.timeoutHandle=Df(lf.bind(null,i,n,Vt,Gr,yh,t,ln,is,Ys,xa,h,"Throttled",-0,0),l);break e}lf(i,n,Vt,Gr,yh,t,ln,is,Ys,xa,h,null,-0,0)}}break}while(!0);On(e)}function lf(e,t,n,i,l,h,m,f,j,D,K,V,P,U){if(e.timeoutHandle=-1,V=t.subtreeFlags,V&8192||(V&16785408)===16785408){V={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:_n},Zp(t,h,V);var pe=(h&62914560)===h?Dr-Tt():(h&4194048)===h?af-Tt():0;if(pe=Bv(V,pe),pe!==null){sa=h,e.cancelPendingCommit=pe(yf.bind(null,e,t,h,n,i,l,m,f,j,K,V,null,P,U)),Ca(e,h,m,!D);return}}yf(e,t,h,n,i,l,m,f,j)}function rv(e){for(var t=e;;){var n=t.tag;if((n===0||n===11||n===15)&&t.flags&16384&&(n=t.updateQueue,n!==null&&(n=n.stores,n!==null)))for(var i=0;i<n.length;i++){var l=n[i],h=l.getSnapshot;l=l.value;try{if(!nn(h(),l))return!1}catch{return!1}}if(n=t.child,t.subtreeFlags&16384&&n!==null)n.return=t,t=n;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function Ca(e,t,n,i){t&=~fh,t&=~is,e.suspendedLanes|=t,e.pingedLanes&=~t,i&&(e.warmLanes|=t),i=e.expirationTimes;for(var l=t;0<l;){var h=31-Ee(l),m=1<<h;i[h]=-1,l&=~m}n!==0&&gu(e,n,t)}function zr(){return(Be&6)===0?(oo(0),!1):!0}function vh(){if(Le!==null){if($e===0)var e=Le.return;else e=Le,$n=Va=null,Oc(e),zs=null,Ji=0,e=Le;for(;e!==null;)Dp(e.alternate,e),e=e.return;Le=null}}function Xs(e,t){var n=e.timeoutHandle;n!==-1&&(e.timeoutHandle=-1,Cv(n)),n=e.cancelPendingCommit,n!==null&&(e.cancelPendingCommit=null,n()),sa=0,vh(),et=e,Le=n=Bn(e.current,null),Ie=t,$e=0,rn=null,xa=!1,Ks=Mi(e,t),ph=!1,Ys=ln=fh=is=Sa=mt=0,Vt=so=null,yh=!1,(t&8)!==0&&(t|=t&32);var i=e.entangledLanes;if(i!==0)for(e=e.entanglements,i&=t;0<i;){var l=31-Ee(i),h=1<<l;t|=e[l],i&=~h}return aa=t,lr(),n}function cf(e,t){Me=null,v.H=Vi,t===Gs||t===yr?(t=Sm(),$e=3):t===Sc?(t=Sm(),$e=4):$e=t===Qc?8:t!==null&&typeof t=="object"&&typeof t.then=="function"?6:1,rn=t,Le===null&&(mt=1,Er(e,yn(t,e.current)))}function hf(){var e=sn.current;return e===null?!0:(Ie&4194048)===Ie?vn===null:(Ie&62914560)===Ie||(Ie&536870912)!==0?e===vn:!1}function df(){var e=v.H;return v.H=Vi,e===null?Vi:e}function uf(){var e=v.A;return v.A=iv,e}function Jr(){mt=4,xa||(Ie&4194048)!==Ie&&sn.current!==null||(Ks=!0),(Sa&134217727)===0&&(is&134217727)===0||et===null||Ca(et,Ie,ln,!1)}function kh(e,t,n){var i=Be;Be|=2;var l=df(),h=uf();(et!==e||Ie!==t)&&(Gr=null,Xs(e,t)),t=!1;var m=mt;e:do try{if($e!==0&&Le!==null){var f=Le,j=rn;switch($e){case 8:vh(),m=6;break e;case 3:case 2:case 9:case 6:sn.current===null&&(t=!0);var D=$e;if($e=0,rn=null,Qs(e,f,j,D),n&&Ks){m=0;break e}break;default:D=$e,$e=0,rn=null,Qs(e,f,j,D)}}lv(),m=mt;break}catch(K){cf(e,K)}while(!0);return t&&e.shellSuspendCounter++,$n=Va=null,Be=i,v.H=l,v.A=h,Le===null&&(et=null,Ie=0,lr()),m}function lv(){for(;Le!==null;)mf(Le)}function cv(e,t){var n=Be;Be|=2;var i=df(),l=uf();et!==e||Ie!==t?(Gr=null,Pr=Tt()+500,Xs(e,t)):Ks=Mi(e,t);e:do try{if($e!==0&&Le!==null){t=Le;var h=rn;t:switch($e){case 1:$e=0,rn=null,Qs(e,t,h,1);break;case 2:case 9:if(Tm(h)){$e=0,rn=null,pf(t);break}t=function(){$e!==2&&$e!==9||et!==e||($e=7),On(e)},h.then(t,t);break e;case 3:$e=7;break e;case 4:$e=5;break e;case 7:Tm(h)?($e=0,rn=null,pf(t)):($e=0,rn=null,Qs(e,t,h,7));break;case 5:var m=null;switch(Le.tag){case 26:m=Le.memoizedState;case 5:case 27:var f=Le;if(m?Zf(m):f.stateNode.complete){$e=0,rn=null;var j=f.sibling;if(j!==null)Le=j;else{var D=f.return;D!==null?(Le=D,_r(D)):Le=null}break t}}$e=0,rn=null,Qs(e,t,h,5);break;case 6:$e=0,rn=null,Qs(e,t,h,6);break;case 8:vh(),mt=6;break e;default:throw Error(c(462))}}hv();break}catch(K){cf(e,K)}while(!0);return $n=Va=null,v.H=i,v.A=l,Be=n,Le!==null?0:(et=null,Ie=0,lr(),mt)}function hv(){for(;Le!==null&&!nt();)mf(Le)}function mf(e){var t=Op(e.alternate,e,aa);e.memoizedProps=e.pendingProps,t===null?_r(e):Le=t}function pf(e){var t=e,n=t.alternate;switch(t.tag){case 15:case 0:t=Ep(n,t,t.pendingProps,t.type,void 0,Ie);break;case 11:t=Ep(n,t,t.pendingProps,t.type.render,t.ref,Ie);break;case 5:Oc(t);default:Dp(n,t),t=Le=dm(t,aa),t=Op(n,t,aa)}e.memoizedProps=e.pendingProps,t===null?_r(e):Le=t}function Qs(e,t,n,i){$n=Va=null,Oc(t),zs=null,Ji=0;var l=t.return;try{if(Qb(e,l,t,n,Ie)){mt=1,Er(e,yn(n,e.current)),Le=null;return}}catch(h){if(l!==null)throw Le=l,h;mt=1,Er(e,yn(n,e.current)),Le=null;return}t.flags&32768?(qe||i===1?e=!0:Ks||(Ie&536870912)!==0?e=!1:(xa=e=!0,(i===2||i===9||i===3||i===6)&&(i=sn.current,i!==null&&i.tag===13&&(i.flags|=16384))),ff(t,e)):_r(t)}function _r(e){var t=e;do{if((t.flags&32768)!==0){ff(t,xa);return}e=t.return;var n=tv(t.alternate,t,aa);if(n!==null){Le=n;return}if(t=t.sibling,t!==null){Le=t;return}Le=t=e}while(t!==null);mt===0&&(mt=5)}function ff(e,t){do{var n=nv(e.alternate,e);if(n!==null){n.flags&=32767,Le=n;return}if(n=e.return,n!==null&&(n.flags|=32768,n.subtreeFlags=0,n.deletions=null),!t&&(e=e.sibling,e!==null)){Le=e;return}Le=e=n}while(e!==null);mt=6,Le=null}function yf(e,t,n,i,l,h,m,f,j){e.cancelPendingCommit=null;do Ur();while(St!==0);if((Be&6)!==0)throw Error(c(327));if(t!==null){if(t===e.current)throw Error(c(177));if(h=t.lanes|t.childLanes,h|=cc,_w(e,n,h,m,f,j),e===et&&(Le=et=null,Ie=0),Vs=t,ja=e,sa=n,gh=h,wh=l,sf=i,(t.subtreeFlags&10256)!==0||(t.flags&10256)!==0?(e.callbackNode=null,e.callbackPriority=0,pv(xt,function(){return kf(),null})):(e.callbackNode=null,e.callbackPriority=0),i=(t.flags&13878)!==0,(t.subtreeFlags&13878)!==0||i){i=v.T,v.T=null,l=S.p,S.p=2,m=Be,Be|=4;try{av(e,t,n)}finally{Be=m,S.p=l,v.T=i}}St=1,gf(),wf(),bf()}}function gf(){if(St===1){St=0;var e=ja,t=Vs,n=(t.flags&13878)!==0;if((t.subtreeFlags&13878)!==0||n){n=v.T,v.T=null;var i=S.p;S.p=2;var l=Be;Be|=4;try{Vp(t,e);var h=Wh,m=nm(e.containerInfo),f=h.focusedElem,j=h.selectionRange;if(m!==f&&f&&f.ownerDocument&&tm(f.ownerDocument.documentElement,f)){if(j!==null&&sc(f)){var D=j.start,K=j.end;if(K===void 0&&(K=D),"selectionStart"in f)f.selectionStart=D,f.selectionEnd=Math.min(K,f.value.length);else{var V=f.ownerDocument||document,P=V&&V.defaultView||window;if(P.getSelection){var U=P.getSelection(),pe=f.textContent.length,Te=Math.min(j.start,pe),Qe=j.end===void 0?Te:Math.min(j.end,pe);!U.extend&&Te>Qe&&(m=Qe,Qe=Te,Te=m);var W=em(f,Te),A=em(f,Qe);if(W&&A&&(U.rangeCount!==1||U.anchorNode!==W.node||U.anchorOffset!==W.offset||U.focusNode!==A.node||U.focusOffset!==A.offset)){var q=V.createRange();q.setStart(W.node,W.offset),U.removeAllRanges(),Te>Qe?(U.addRange(q),U.extend(A.node,A.offset)):(q.setEnd(A.node,A.offset),U.addRange(q))}}}}for(V=[],U=f;U=U.parentNode;)U.nodeType===1&&V.push({element:U,left:U.scrollLeft,top:U.scrollTop});for(typeof f.focus=="function"&&f.focus(),f=0;f<V.length;f++){var Y=V[f];Y.element.scrollLeft=Y.left,Y.element.scrollTop=Y.top}}nl=!!Hh,Wh=Hh=null}finally{Be=l,S.p=i,v.T=n}}e.current=t,St=2}}function wf(){if(St===2){St=0;var e=ja,t=Vs,n=(t.flags&8772)!==0;if((t.subtreeFlags&8772)!==0||n){n=v.T,v.T=null;var i=S.p;S.p=2;var l=Be;Be|=4;try{Bp(e,t.alternate,t)}finally{Be=l,S.p=i,v.T=n}}St=3}}function bf(){if(St===4||St===3){St=0,Pt();var e=ja,t=Vs,n=sa,i=sf;(t.subtreeFlags&10256)!==0||(t.flags&10256)!==0?St=5:(St=0,Vs=ja=null,vf(e,e.pendingLanes));var l=e.pendingLanes;if(l===0&&(Ma=null),Pl(n),t=t.stateNode,rt&&typeof rt.onCommitFiberRoot=="function")try{rt.onCommitFiberRoot(un,t,void 0,(t.current.flags&128)===128)}catch{}if(i!==null){t=v.T,l=S.p,S.p=2,v.T=null;try{for(var h=e.onRecoverableError,m=0;m<i.length;m++){var f=i[m];h(f.value,{componentStack:f.stack})}}finally{v.T=t,S.p=l}}(sa&3)!==0&&Ur(),On(e),l=e.pendingLanes,(n&261930)!==0&&(l&42)!==0?e===bh?io++:(io=0,bh=e):io=0,oo(0)}}function vf(e,t){(e.pooledCacheLanes&=t)===0&&(t=e.pooledCache,t!=null&&(e.pooledCache=null,Gi(t)))}function Ur(){return gf(),wf(),bf(),kf()}function kf(){if(St!==5)return!1;var e=ja,t=gh;gh=0;var n=Pl(sa),i=v.T,l=S.p;try{S.p=32>n?32:n,v.T=null,n=wh,wh=null;var h=ja,m=sa;if(St=0,Vs=ja=null,sa=0,(Be&6)!==0)throw Error(c(331));var f=Be;if(Be|=4,tf(h.current),Qp(h,h.current,m,n),Be=f,oo(0,!1),rt&&typeof rt.onPostCommitFiberRoot=="function")try{rt.onPostCommitFiberRoot(un,h)}catch{}return!0}finally{S.p=l,v.T=i,vf(e,t)}}function Tf(e,t,n){t=yn(n,t),t=Xc(e.stateNode,t,2),e=ba(e,t,2),e!==null&&(ji(e,2),On(e))}function Ke(e,t,n){if(e.tag===3)Tf(e,e,n);else for(;t!==null;){if(t.tag===3){Tf(t,e,n);break}else if(t.tag===1){var i=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof i.componentDidCatch=="function"&&(Ma===null||!Ma.has(i))){e=yn(n,e),n=Tp(2),i=ba(t,n,2),i!==null&&(xp(n,i,t,e),ji(i,2),On(i));break}}t=t.return}}function Th(e,t,n){var i=e.pingCache;if(i===null){i=e.pingCache=new ov;var l=new Set;i.set(t,l)}else l=i.get(t),l===void 0&&(l=new Set,i.set(t,l));l.has(n)||(ph=!0,l.add(n),e=dv.bind(null,e,t,n),t.then(e,e))}function dv(e,t,n){var i=e.pingCache;i!==null&&i.delete(t),e.pingedLanes|=e.suspendedLanes&n,e.warmLanes&=~n,et===e&&(Ie&n)===n&&(mt===4||mt===3&&(Ie&62914560)===Ie&&300>Tt()-Dr?(Be&2)===0&&Xs(e,0):fh|=n,Ys===Ie&&(Ys=0)),On(e)}function xf(e,t){t===0&&(t=yu()),e=$a(e,t),e!==null&&(ji(e,t),On(e))}function uv(e){var t=e.memoizedState,n=0;t!==null&&(n=t.retryLane),xf(e,n)}function mv(e,t){var n=0;switch(e.tag){case 31:case 13:var i=e.stateNode,l=e.memoizedState;l!==null&&(n=l.retryLane);break;case 19:i=e.stateNode;break;case 22:i=e.stateNode._retryCache;break;default:throw Error(c(314))}i!==null&&i.delete(t),xf(e,n)}function pv(e,t){return _t(e,t)}var Br=null,Zs=null,xh=!1,Fr=!1,Sh=!1,Aa=0;function On(e){e!==Zs&&e.next===null&&(Zs===null?Br=Zs=e:Zs=Zs.next=e),Fr=!0,xh||(xh=!0,yv())}function oo(e,t){if(!Sh&&Fr){Sh=!0;do for(var n=!1,i=Br;i!==null;){if(e!==0){var l=i.pendingLanes;if(l===0)var h=0;else{var m=i.suspendedLanes,f=i.pingedLanes;h=(1<<31-Ee(42|e)+1)-1,h&=l&~(m&~f),h=h&201326741?h&201326741|1:h?h|2:0}h!==0&&(n=!0,Cf(i,h))}else h=Ie,h=Vo(i,i===et?h:0,i.cancelPendingCommit!==null||i.timeoutHandle!==-1),(h&3)===0||Mi(i,h)||(n=!0,Cf(i,h));i=i.next}while(n);Sh=!1}}function fv(){Sf()}function Sf(){Fr=xh=!1;var e=0;Aa!==0&&jv()&&(e=Aa);for(var t=Tt(),n=null,i=Br;i!==null;){var l=i.next,h=Mf(i,t);h===0?(i.next=null,n===null?Br=l:n.next=l,l===null&&(Zs=n)):(n=i,(e!==0||(h&3)!==0)&&(Fr=!0)),i=l}St!==0&&St!==5||oo(e),Aa!==0&&(Aa=0)}function Mf(e,t){for(var n=e.suspendedLanes,i=e.pingedLanes,l=e.expirationTimes,h=e.pendingLanes&-62914561;0<h;){var m=31-Ee(h),f=1<<m,j=l[m];j===-1?((f&n)===0||(f&i)!==0)&&(l[m]=Jw(f,t)):j<=t&&(e.expiredLanes|=f),h&=~f}if(t=et,n=Ie,n=Vo(e,e===t?n:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),i=e.callbackNode,n===0||e===t&&($e===2||$e===9)||e.cancelPendingCommit!==null)return i!==null&&i!==null&&Lt(i),e.callbackNode=null,e.callbackPriority=0;if((n&3)===0||Mi(e,n)){if(t=n&-n,t===e.callbackPriority)return t;switch(i!==null&&Lt(i),Pl(n)){case 2:case 8:n=Pe;break;case 32:n=xt;break;case 268435456:n=dt;break;default:n=xt}return i=jf.bind(null,e),n=_t(n,i),e.callbackPriority=t,e.callbackNode=n,t}return i!==null&&i!==null&&Lt(i),e.callbackPriority=2,e.callbackNode=null,2}function jf(e,t){if(St!==0&&St!==5)return e.callbackNode=null,e.callbackPriority=0,null;var n=e.callbackNode;if(Ur()&&e.callbackNode!==n)return null;var i=Ie;return i=Vo(e,e===et?i:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),i===0?null:(rf(e,i,t),Mf(e,Tt()),e.callbackNode!=null&&e.callbackNode===n?jf.bind(null,e):null)}function Cf(e,t){if(Ur())return null;rf(e,t,!0)}function yv(){Av(function(){(Be&6)!==0?_t(je,fv):Sf()})}function Mh(){if(Aa===0){var e=Ds;e===0&&(e=jn,jn<<=1,(jn&261888)===0&&(jn=256)),Aa=e}return Aa}function Af(e){return e==null||typeof e=="symbol"||typeof e=="boolean"?null:typeof e=="function"?e:er(""+e)}function Nf(e,t){var n=t.ownerDocument.createElement("input");return n.name=t.name,n.value=t.value,e.id&&n.setAttribute("form",e.id),t.parentNode.insertBefore(n,t),e=new FormData(e),n.parentNode.removeChild(n),e}function gv(e,t,n,i,l){if(t==="submit"&&n&&n.stateNode===l){var h=Af((l[Bt]||null).action),m=i.submitter;m&&(t=(t=m[Bt]||null)?Af(t.formAction):m.getAttribute("formAction"),t!==null&&(h=t,m=null));var f=new sr("action","action",null,i,l);e.push({event:f,listeners:[{instance:null,listener:function(){if(i.defaultPrevented){if(Aa!==0){var j=m?Nf(l,m):new FormData(l);Bc(n,{pending:!0,data:j,method:l.method,action:h},null,j)}}else typeof h=="function"&&(f.preventDefault(),j=m?Nf(l,m):new FormData(l),Bc(n,{pending:!0,data:j,method:l.method,action:h},h,j))},currentTarget:l}]})}}for(var jh=0;jh<lc.length;jh++){var Ch=lc[jh],wv=Ch.toLowerCase(),bv=Ch[0].toUpperCase()+Ch.slice(1);Cn(wv,"on"+bv)}Cn(im,"onAnimationEnd"),Cn(om,"onAnimationIteration"),Cn(rm,"onAnimationStart"),Cn("dblclick","onDoubleClick"),Cn("focusin","onFocus"),Cn("focusout","onBlur"),Cn(Rb,"onTransitionRun"),Cn(Ob,"onTransitionStart"),Cn(qb,"onTransitionCancel"),Cn(lm,"onTransitionEnd"),Ss("onMouseEnter",["mouseout","mouseover"]),Ss("onMouseLeave",["mouseout","mouseover"]),Ss("onPointerEnter",["pointerout","pointerover"]),Ss("onPointerLeave",["pointerout","pointerover"]),_a("onChange","change click focusin focusout input keydown keyup selectionchange".split(" ")),_a("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")),_a("onBeforeInput",["compositionend","keypress","textInput","paste"]),_a("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" ")),_a("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" ")),_a("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var ro="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),vv=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(ro));function Ef(e,t){t=(t&4)!==0;for(var n=0;n<e.length;n++){var i=e[n],l=i.event;i=i.listeners;e:{var h=void 0;if(t)for(var m=i.length-1;0<=m;m--){var f=i[m],j=f.instance,D=f.currentTarget;if(f=f.listener,j!==h&&l.isPropagationStopped())break e;h=f,l.currentTarget=D;try{h(l)}catch(K){rr(K)}l.currentTarget=null,h=j}else for(m=0;m<i.length;m++){if(f=i[m],j=f.instance,D=f.currentTarget,f=f.listener,j!==h&&l.isPropagationStopped())break e;h=f,l.currentTarget=D;try{h(l)}catch(K){rr(K)}l.currentTarget=null,h=j}}}}function He(e,t){var n=t[Gl];n===void 0&&(n=t[Gl]=new Set);var i=e+"__bubble";n.has(i)||(Lf(t,e,2,!1),n.add(i))}function Ah(e,t,n){var i=0;t&&(i|=4),Lf(n,e,i,t)}var $r="_reactListening"+Math.random().toString(36).slice(2);function Nh(e){if(!e[$r]){e[$r]=!0,xu.forEach(function(n){n!=="selectionchange"&&(vv.has(n)||Ah(n,!1,e),Ah(n,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[$r]||(t[$r]=!0,Ah("selectionchange",!1,t))}}function Lf(e,t,n,i){switch(oy(t)){case 2:var l=Kv;break;case 8:l=Yv;break;default:l=Uh}n=l.bind(null,t,n,e),l=void 0,!Yl||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(l=!0),i?l!==void 0?e.addEventListener(t,n,{capture:!0,passive:l}):e.addEventListener(t,n,!0):l!==void 0?e.addEventListener(t,n,{passive:l}):e.addEventListener(t,n,!1)}function Eh(e,t,n,i,l){var h=i;if((t&1)===0&&(t&2)===0&&i!==null)e:for(;;){if(i===null)return;var m=i.tag;if(m===3||m===4){var f=i.stateNode.containerInfo;if(f===l)break;if(m===4)for(m=i.return;m!==null;){var j=m.tag;if((j===3||j===4)&&m.stateNode.containerInfo===l)return;m=m.return}for(;f!==null;){if(m=ks(f),m===null)return;if(j=m.tag,j===5||j===6||j===26||j===27){i=h=m;continue e}f=f.parentNode}}i=i.return}Ru(function(){var D=h,K=$l(n),V=[];e:{var P=cm.get(e);if(P!==void 0){var U=sr,pe=e;switch(e){case"keypress":if(nr(n)===0)break e;case"keydown":case"keyup":U=mb;break;case"focusin":pe="focus",U=Zl;break;case"focusout":pe="blur",U=Zl;break;case"beforeblur":case"afterblur":U=Zl;break;case"click":if(n.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":U=Du;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":U=tb;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":U=yb;break;case im:case om:case rm:U=sb;break;case lm:U=wb;break;case"scroll":case"scrollend":U=Zw;break;case"wheel":U=vb;break;case"copy":case"cut":case"paste":U=ob;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":U=Gu;break;case"toggle":case"beforetoggle":U=Tb}var Te=(t&4)!==0,Qe=!Te&&(e==="scroll"||e==="scrollend"),W=Te?P!==null?P+"Capture":null:P;Te=[];for(var A=D,q;A!==null;){var Y=A;if(q=Y.stateNode,Y=Y.tag,Y!==5&&Y!==26&&Y!==27||q===null||W===null||(Y=Ni(A,W),Y!=null&&Te.push(lo(A,Y,q))),Qe)break;A=A.return}0<Te.length&&(P=new U(P,pe,null,n,K),V.push({event:P,listeners:Te}))}}if((t&7)===0){e:{if(P=e==="mouseover"||e==="pointerover",U=e==="mouseout"||e==="pointerout",P&&n!==Fl&&(pe=n.relatedTarget||n.fromElement)&&(ks(pe)||pe[vs]))break e;if((U||P)&&(P=K.window===K?K:(P=K.ownerDocument)?P.defaultView||P.parentWindow:window,U?(pe=n.relatedTarget||n.toElement,U=D,pe=pe?ks(pe):null,pe!==null&&(Qe=u(pe),Te=pe.tag,pe!==Qe||Te!==5&&Te!==27&&Te!==6)&&(pe=null)):(U=null,pe=D),U!==pe)){if(Te=Du,Y="onMouseLeave",W="onMouseEnter",A="mouse",(e==="pointerout"||e==="pointerover")&&(Te=Gu,Y="onPointerLeave",W="onPointerEnter",A="pointer"),Qe=U==null?P:Ai(U),q=pe==null?P:Ai(pe),P=new Te(Y,A+"leave",U,n,K),P.target=Qe,P.relatedTarget=q,Y=null,ks(K)===D&&(Te=new Te(W,A+"enter",pe,n,K),Te.target=q,Te.relatedTarget=Qe,Y=Te),Qe=Y,U&&pe)t:{for(Te=kv,W=U,A=pe,q=0,Y=W;Y;Y=Te(Y))q++;Y=0;for(var ke=A;ke;ke=Te(ke))Y++;for(;0<q-Y;)W=Te(W),q--;for(;0<Y-q;)A=Te(A),Y--;for(;q--;){if(W===A||A!==null&&W===A.alternate){Te=W;break t}W=Te(W),A=Te(A)}Te=null}else Te=null;U!==null&&Hf(V,P,U,Te,!1),pe!==null&&Qe!==null&&Hf(V,Qe,pe,Te,!0)}}e:{if(P=D?Ai(D):window,U=P.nodeName&&P.nodeName.toLowerCase(),U==="select"||U==="input"&&P.type==="file")var Je=Ku;else if(Fu(P))if(Yu)Je=Hb;else{Je=Eb;var we=Nb}else U=P.nodeName,!U||U.toLowerCase()!=="input"||P.type!=="checkbox"&&P.type!=="radio"?D&&Bl(D.elementType)&&(Je=Ku):Je=Lb;if(Je&&(Je=Je(e,D))){$u(V,Je,n,K);break e}we&&we(e,P,D),e==="focusout"&&D&&P.type==="number"&&D.memoizedProps.value!=null&&Ul(P,"number",P.value)}switch(we=D?Ai(D):window,e){case"focusin":(Fu(we)||we.contentEditable==="true")&&(Es=we,ic=D,qi=null);break;case"focusout":qi=ic=Es=null;break;case"mousedown":oc=!0;break;case"contextmenu":case"mouseup":case"dragend":oc=!1,am(V,n,K);break;case"selectionchange":if(Ib)break;case"keydown":case"keyup":am(V,n,K)}var Ce;if(tc)e:{switch(e){case"compositionstart":var Re="onCompositionStart";break e;case"compositionend":Re="onCompositionEnd";break e;case"compositionupdate":Re="onCompositionUpdate";break e}Re=void 0}else Ns?Uu(e,n)&&(Re="onCompositionEnd"):e==="keydown"&&n.keyCode===229&&(Re="onCompositionStart");Re&&(zu&&n.locale!=="ko"&&(Ns||Re!=="onCompositionStart"?Re==="onCompositionEnd"&&Ns&&(Ce=Ou()):(ua=K,Vl="value"in ua?ua.value:ua.textContent,Ns=!0)),we=Kr(D,Re),0<we.length&&(Re=new Pu(Re,e,null,n,K),V.push({event:Re,listeners:we}),Ce?Re.data=Ce:(Ce=Bu(n),Ce!==null&&(Re.data=Ce)))),(Ce=Sb?Mb(e,n):jb(e,n))&&(Re=Kr(D,"onBeforeInput"),0<Re.length&&(we=new Pu("onBeforeInput","beforeinput",null,n,K),V.push({event:we,listeners:Re}),we.data=Ce)),gv(V,e,D,n,K)}Ef(V,t)})}function lo(e,t,n){return{instance:e,listener:t,currentTarget:n}}function Kr(e,t){for(var n=t+"Capture",i=[];e!==null;){var l=e,h=l.stateNode;if(l=l.tag,l!==5&&l!==26&&l!==27||h===null||(l=Ni(e,n),l!=null&&i.unshift(lo(e,l,h)),l=Ni(e,t),l!=null&&i.push(lo(e,l,h))),e.tag===3)return i;e=e.return}return[]}function kv(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5&&e.tag!==27);return e||null}function Hf(e,t,n,i,l){for(var h=t._reactName,m=[];n!==null&&n!==i;){var f=n,j=f.alternate,D=f.stateNode;if(f=f.tag,j!==null&&j===i)break;f!==5&&f!==26&&f!==27||D===null||(j=D,l?(D=Ni(n,h),D!=null&&m.unshift(lo(n,D,j))):l||(D=Ni(n,h),D!=null&&m.push(lo(n,D,j)))),n=n.return}m.length!==0&&e.push({event:t,listeners:m})}var Tv=/\r\n?/g,xv=/\u0000|\uFFFD/g;function Wf(e){return(typeof e=="string"?e:""+e).replace(Tv,`
`).replace(xv,"")}function If(e,t){return t=Wf(t),Wf(e)===t}function Xe(e,t,n,i,l,h){switch(n){case"children":typeof i=="string"?t==="body"||t==="textarea"&&i===""||js(e,i):(typeof i=="number"||typeof i=="bigint")&&t!=="body"&&js(e,""+i);break;case"className":Qo(e,"class",i);break;case"tabIndex":Qo(e,"tabindex",i);break;case"dir":case"role":case"viewBox":case"width":case"height":Qo(e,n,i);break;case"style":Wu(e,i,h);break;case"data":if(t!=="object"){Qo(e,"data",i);break}case"src":case"href":if(i===""&&(t!=="a"||n!=="href")){e.removeAttribute(n);break}if(i==null||typeof i=="function"||typeof i=="symbol"||typeof i=="boolean"){e.removeAttribute(n);break}i=er(""+i),e.setAttribute(n,i);break;case"action":case"formAction":if(typeof i=="function"){e.setAttribute(n,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof h=="function"&&(n==="formAction"?(t!=="input"&&Xe(e,t,"name",l.name,l,null),Xe(e,t,"formEncType",l.formEncType,l,null),Xe(e,t,"formMethod",l.formMethod,l,null),Xe(e,t,"formTarget",l.formTarget,l,null)):(Xe(e,t,"encType",l.encType,l,null),Xe(e,t,"method",l.method,l,null),Xe(e,t,"target",l.target,l,null)));if(i==null||typeof i=="symbol"||typeof i=="boolean"){e.removeAttribute(n);break}i=er(""+i),e.setAttribute(n,i);break;case"onClick":i!=null&&(e.onclick=_n);break;case"onScroll":i!=null&&He("scroll",e);break;case"onScrollEnd":i!=null&&He("scrollend",e);break;case"dangerouslySetInnerHTML":if(i!=null){if(typeof i!="object"||!("__html"in i))throw Error(c(61));if(n=i.__html,n!=null){if(l.children!=null)throw Error(c(60));e.innerHTML=n}}break;case"multiple":e.multiple=i&&typeof i!="function"&&typeof i!="symbol";break;case"muted":e.muted=i&&typeof i!="function"&&typeof i!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(i==null||typeof i=="function"||typeof i=="boolean"||typeof i=="symbol"){e.removeAttribute("xlink:href");break}n=er(""+i),e.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",n);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":i!=null&&typeof i!="function"&&typeof i!="symbol"?e.setAttribute(n,""+i):e.removeAttribute(n);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":i&&typeof i!="function"&&typeof i!="symbol"?e.setAttribute(n,""):e.removeAttribute(n);break;case"capture":case"download":i===!0?e.setAttribute(n,""):i!==!1&&i!=null&&typeof i!="function"&&typeof i!="symbol"?e.setAttribute(n,i):e.removeAttribute(n);break;case"cols":case"rows":case"size":case"span":i!=null&&typeof i!="function"&&typeof i!="symbol"&&!isNaN(i)&&1<=i?e.setAttribute(n,i):e.removeAttribute(n);break;case"rowSpan":case"start":i==null||typeof i=="function"||typeof i=="symbol"||isNaN(i)?e.removeAttribute(n):e.setAttribute(n,i);break;case"popover":He("beforetoggle",e),He("toggle",e),Xo(e,"popover",i);break;case"xlinkActuate":Jn(e,"http://www.w3.org/1999/xlink","xlink:actuate",i);break;case"xlinkArcrole":Jn(e,"http://www.w3.org/1999/xlink","xlink:arcrole",i);break;case"xlinkRole":Jn(e,"http://www.w3.org/1999/xlink","xlink:role",i);break;case"xlinkShow":Jn(e,"http://www.w3.org/1999/xlink","xlink:show",i);break;case"xlinkTitle":Jn(e,"http://www.w3.org/1999/xlink","xlink:title",i);break;case"xlinkType":Jn(e,"http://www.w3.org/1999/xlink","xlink:type",i);break;case"xmlBase":Jn(e,"http://www.w3.org/XML/1998/namespace","xml:base",i);break;case"xmlLang":Jn(e,"http://www.w3.org/XML/1998/namespace","xml:lang",i);break;case"xmlSpace":Jn(e,"http://www.w3.org/XML/1998/namespace","xml:space",i);break;case"is":Xo(e,"is",i);break;case"innerText":case"textContent":break;default:(!(2<n.length)||n[0]!=="o"&&n[0]!=="O"||n[1]!=="n"&&n[1]!=="N")&&(n=Xw.get(n)||n,Xo(e,n,i))}}function Lh(e,t,n,i,l,h){switch(n){case"style":Wu(e,i,h);break;case"dangerouslySetInnerHTML":if(i!=null){if(typeof i!="object"||!("__html"in i))throw Error(c(61));if(n=i.__html,n!=null){if(l.children!=null)throw Error(c(60));e.innerHTML=n}}break;case"children":typeof i=="string"?js(e,i):(typeof i=="number"||typeof i=="bigint")&&js(e,""+i);break;case"onScroll":i!=null&&He("scroll",e);break;case"onScrollEnd":i!=null&&He("scrollend",e);break;case"onClick":i!=null&&(e.onclick=_n);break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":break;case"innerText":case"textContent":break;default:if(!Su.hasOwnProperty(n))e:{if(n[0]==="o"&&n[1]==="n"&&(l=n.endsWith("Capture"),t=n.slice(2,l?n.length-7:void 0),h=e[Bt]||null,h=h!=null?h[n]:null,typeof h=="function"&&e.removeEventListener(t,h,l),typeof i=="function")){typeof h!="function"&&h!==null&&(n in e?e[n]=null:e.hasAttribute(n)&&e.removeAttribute(n)),e.addEventListener(t,i,l);break e}n in e?e[n]=i:i===!0?e.setAttribute(n,""):Xo(e,n,i)}}}function Ot(e,t,n){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":He("error",e),He("load",e);var i=!1,l=!1,h;for(h in n)if(n.hasOwnProperty(h)){var m=n[h];if(m!=null)switch(h){case"src":i=!0;break;case"srcSet":l=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(c(137,t));default:Xe(e,t,h,m,n,null)}}l&&Xe(e,t,"srcSet",n.srcSet,n,null),i&&Xe(e,t,"src",n.src,n,null);return;case"input":He("invalid",e);var f=h=m=l=null,j=null,D=null;for(i in n)if(n.hasOwnProperty(i)){var K=n[i];if(K!=null)switch(i){case"name":l=K;break;case"type":m=K;break;case"checked":j=K;break;case"defaultChecked":D=K;break;case"value":h=K;break;case"defaultValue":f=K;break;case"children":case"dangerouslySetInnerHTML":if(K!=null)throw Error(c(137,t));break;default:Xe(e,t,i,K,n,null)}}Nu(e,h,f,j,D,m,l,!1);return;case"select":He("invalid",e),i=m=h=null;for(l in n)if(n.hasOwnProperty(l)&&(f=n[l],f!=null))switch(l){case"value":h=f;break;case"defaultValue":m=f;break;case"multiple":i=f;default:Xe(e,t,l,f,n,null)}t=h,n=m,e.multiple=!!i,t!=null?Ms(e,!!i,t,!1):n!=null&&Ms(e,!!i,n,!0);return;case"textarea":He("invalid",e),h=l=i=null;for(m in n)if(n.hasOwnProperty(m)&&(f=n[m],f!=null))switch(m){case"value":i=f;break;case"defaultValue":l=f;break;case"children":h=f;break;case"dangerouslySetInnerHTML":if(f!=null)throw Error(c(91));break;default:Xe(e,t,m,f,n,null)}Lu(e,i,l,h);return;case"option":for(j in n)n.hasOwnProperty(j)&&(i=n[j],i!=null)&&(j==="selected"?e.selected=i&&typeof i!="function"&&typeof i!="symbol":Xe(e,t,j,i,n,null));return;case"dialog":He("beforetoggle",e),He("toggle",e),He("cancel",e),He("close",e);break;case"iframe":case"object":He("load",e);break;case"video":case"audio":for(i=0;i<ro.length;i++)He(ro[i],e);break;case"image":He("error",e),He("load",e);break;case"details":He("toggle",e);break;case"embed":case"source":case"link":He("error",e),He("load",e);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(D in n)if(n.hasOwnProperty(D)&&(i=n[D],i!=null))switch(D){case"children":case"dangerouslySetInnerHTML":throw Error(c(137,t));default:Xe(e,t,D,i,n,null)}return;default:if(Bl(t)){for(K in n)n.hasOwnProperty(K)&&(i=n[K],i!==void 0&&Lh(e,t,K,i,n,void 0));return}}for(f in n)n.hasOwnProperty(f)&&(i=n[f],i!=null&&Xe(e,t,f,i,n,null))}function Sv(e,t,n,i){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var l=null,h=null,m=null,f=null,j=null,D=null,K=null;for(U in n){var V=n[U];if(n.hasOwnProperty(U)&&V!=null)switch(U){case"checked":break;case"value":break;case"defaultValue":j=V;default:i.hasOwnProperty(U)||Xe(e,t,U,null,i,V)}}for(var P in i){var U=i[P];if(V=n[P],i.hasOwnProperty(P)&&(U!=null||V!=null))switch(P){case"type":h=U;break;case"name":l=U;break;case"checked":D=U;break;case"defaultChecked":K=U;break;case"value":m=U;break;case"defaultValue":f=U;break;case"children":case"dangerouslySetInnerHTML":if(U!=null)throw Error(c(137,t));break;default:U!==V&&Xe(e,t,P,U,i,V)}}_l(e,m,f,j,D,K,h,l);return;case"select":U=m=f=P=null;for(h in n)if(j=n[h],n.hasOwnProperty(h)&&j!=null)switch(h){case"value":break;case"multiple":U=j;default:i.hasOwnProperty(h)||Xe(e,t,h,null,i,j)}for(l in i)if(h=i[l],j=n[l],i.hasOwnProperty(l)&&(h!=null||j!=null))switch(l){case"value":P=h;break;case"defaultValue":f=h;break;case"multiple":m=h;default:h!==j&&Xe(e,t,l,h,i,j)}t=f,n=m,i=U,P!=null?Ms(e,!!n,P,!1):!!i!=!!n&&(t!=null?Ms(e,!!n,t,!0):Ms(e,!!n,n?[]:"",!1));return;case"textarea":U=P=null;for(f in n)if(l=n[f],n.hasOwnProperty(f)&&l!=null&&!i.hasOwnProperty(f))switch(f){case"value":break;case"children":break;default:Xe(e,t,f,null,i,l)}for(m in i)if(l=i[m],h=n[m],i.hasOwnProperty(m)&&(l!=null||h!=null))switch(m){case"value":P=l;break;case"defaultValue":U=l;break;case"children":break;case"dangerouslySetInnerHTML":if(l!=null)throw Error(c(91));break;default:l!==h&&Xe(e,t,m,l,i,h)}Eu(e,P,U);return;case"option":for(var pe in n)P=n[pe],n.hasOwnProperty(pe)&&P!=null&&!i.hasOwnProperty(pe)&&(pe==="selected"?e.selected=!1:Xe(e,t,pe,null,i,P));for(j in i)P=i[j],U=n[j],i.hasOwnProperty(j)&&P!==U&&(P!=null||U!=null)&&(j==="selected"?e.selected=P&&typeof P!="function"&&typeof P!="symbol":Xe(e,t,j,P,i,U));return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var Te in n)P=n[Te],n.hasOwnProperty(Te)&&P!=null&&!i.hasOwnProperty(Te)&&Xe(e,t,Te,null,i,P);for(D in i)if(P=i[D],U=n[D],i.hasOwnProperty(D)&&P!==U&&(P!=null||U!=null))switch(D){case"children":case"dangerouslySetInnerHTML":if(P!=null)throw Error(c(137,t));break;default:Xe(e,t,D,P,i,U)}return;default:if(Bl(t)){for(var Qe in n)P=n[Qe],n.hasOwnProperty(Qe)&&P!==void 0&&!i.hasOwnProperty(Qe)&&Lh(e,t,Qe,void 0,i,P);for(K in i)P=i[K],U=n[K],!i.hasOwnProperty(K)||P===U||P===void 0&&U===void 0||Lh(e,t,K,P,i,U);return}}for(var W in n)P=n[W],n.hasOwnProperty(W)&&P!=null&&!i.hasOwnProperty(W)&&Xe(e,t,W,null,i,P);for(V in i)P=i[V],U=n[V],!i.hasOwnProperty(V)||P===U||P==null&&U==null||Xe(e,t,V,P,i,U)}function Rf(e){switch(e){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function Mv(){if(typeof performance.getEntriesByType=="function"){for(var e=0,t=0,n=performance.getEntriesByType("resource"),i=0;i<n.length;i++){var l=n[i],h=l.transferSize,m=l.initiatorType,f=l.duration;if(h&&f&&Rf(m)){for(m=0,f=l.responseEnd,i+=1;i<n.length;i++){var j=n[i],D=j.startTime;if(D>f)break;var K=j.transferSize,V=j.initiatorType;K&&Rf(V)&&(j=j.responseEnd,m+=K*(j<f?1:(f-D)/(j-D)))}if(--i,t+=8*(h+m)/(l.duration/1e3),e++,10<e)break}}if(0<e)return t/e/1e6}return navigator.connection&&(e=navigator.connection.downlink,typeof e=="number")?e:5}var Hh=null,Wh=null;function Yr(e){return e.nodeType===9?e:e.ownerDocument}function Of(e){switch(e){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function qf(e,t){if(e===0)switch(t){case"svg":return 1;case"math":return 2;default:return 0}return e===1&&t==="foreignObject"?0:e}function Ih(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.children=="bigint"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var Rh=null;function jv(){var e=window.event;return e&&e.type==="popstate"?e===Rh?!1:(Rh=e,!0):(Rh=null,!1)}var Df=typeof setTimeout=="function"?setTimeout:void 0,Cv=typeof clearTimeout=="function"?clearTimeout:void 0,Pf=typeof Promise=="function"?Promise:void 0,Av=typeof queueMicrotask=="function"?queueMicrotask:typeof Pf<"u"?function(e){return Pf.resolve(null).then(e).catch(Nv)}:Df;function Nv(e){setTimeout(function(){throw e})}function Na(e){return e==="head"}function Gf(e,t){var n=t,i=0;do{var l=n.nextSibling;if(e.removeChild(n),l&&l.nodeType===8)if(n=l.data,n==="/$"||n==="/&"){if(i===0){e.removeChild(l),ai(t);return}i--}else if(n==="$"||n==="$?"||n==="$~"||n==="$!"||n==="&")i++;else if(n==="html")co(e.ownerDocument.documentElement);else if(n==="head"){n=e.ownerDocument.head,co(n);for(var h=n.firstChild;h;){var m=h.nextSibling,f=h.nodeName;h[Ci]||f==="SCRIPT"||f==="STYLE"||f==="LINK"&&h.rel.toLowerCase()==="stylesheet"||n.removeChild(h),h=m}}else n==="body"&&co(e.ownerDocument.body);n=l}while(n);ai(t)}function zf(e,t){var n=e;e=0;do{var i=n.nextSibling;if(n.nodeType===1?t?(n._stashedDisplay=n.style.display,n.style.display="none"):(n.style.display=n._stashedDisplay||"",n.getAttribute("style")===""&&n.removeAttribute("style")):n.nodeType===3&&(t?(n._stashedText=n.nodeValue,n.nodeValue=""):n.nodeValue=n._stashedText||""),i&&i.nodeType===8)if(n=i.data,n==="/$"){if(e===0)break;e--}else n!=="$"&&n!=="$?"&&n!=="$~"&&n!=="$!"||e++;n=i}while(n)}function Oh(e){var t=e.firstChild;for(t&&t.nodeType===10&&(t=t.nextSibling);t;){var n=t;switch(t=t.nextSibling,n.nodeName){case"HTML":case"HEAD":case"BODY":Oh(n),zl(n);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(n.rel.toLowerCase()==="stylesheet")continue}e.removeChild(n)}}function Ev(e,t,n,i){for(;e.nodeType===1;){var l=n;if(e.nodeName.toLowerCase()!==t.toLowerCase()){if(!i&&(e.nodeName!=="INPUT"||e.type!=="hidden"))break}else if(i){if(!e[Ci])switch(t){case"meta":if(!e.hasAttribute("itemprop"))break;return e;case"link":if(h=e.getAttribute("rel"),h==="stylesheet"&&e.hasAttribute("data-precedence"))break;if(h!==l.rel||e.getAttribute("href")!==(l.href==null||l.href===""?null:l.href)||e.getAttribute("crossorigin")!==(l.crossOrigin==null?null:l.crossOrigin)||e.getAttribute("title")!==(l.title==null?null:l.title))break;return e;case"style":if(e.hasAttribute("data-precedence"))break;return e;case"script":if(h=e.getAttribute("src"),(h!==(l.src==null?null:l.src)||e.getAttribute("type")!==(l.type==null?null:l.type)||e.getAttribute("crossorigin")!==(l.crossOrigin==null?null:l.crossOrigin))&&h&&e.hasAttribute("async")&&!e.hasAttribute("itemprop"))break;return e;default:return e}}else if(t==="input"&&e.type==="hidden"){var h=l.name==null?null:""+l.name;if(l.type==="hidden"&&e.getAttribute("name")===h)return e}else return e;if(e=kn(e.nextSibling),e===null)break}return null}function Lv(e,t,n){if(t==="")return null;for(;e.nodeType!==3;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!n||(e=kn(e.nextSibling),e===null))return null;return e}function Jf(e,t){for(;e.nodeType!==8;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!t||(e=kn(e.nextSibling),e===null))return null;return e}function qh(e){return e.data==="$?"||e.data==="$~"}function Dh(e){return e.data==="$!"||e.data==="$?"&&e.ownerDocument.readyState!=="loading"}function Hv(e,t){var n=e.ownerDocument;if(e.data==="$~")e._reactRetry=t;else if(e.data!=="$?"||n.readyState!=="loading")t();else{var i=function(){t(),n.removeEventListener("DOMContentLoaded",i)};n.addEventListener("DOMContentLoaded",i),e._reactRetry=i}}function kn(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?"||t==="$~"||t==="&"||t==="F!"||t==="F")break;if(t==="/$"||t==="/&")return null}}return e}var Ph=null;function _f(e){e=e.nextSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="/$"||n==="/&"){if(t===0)return kn(e.nextSibling);t--}else n!=="$"&&n!=="$!"&&n!=="$?"&&n!=="$~"&&n!=="&"||t++}e=e.nextSibling}return null}function Uf(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="$"||n==="$!"||n==="$?"||n==="$~"||n==="&"){if(t===0)return e;t--}else n!=="/$"&&n!=="/&"||t++}e=e.previousSibling}return null}function Bf(e,t,n){switch(t=Yr(n),e){case"html":if(e=t.documentElement,!e)throw Error(c(452));return e;case"head":if(e=t.head,!e)throw Error(c(453));return e;case"body":if(e=t.body,!e)throw Error(c(454));return e;default:throw Error(c(451))}}function co(e){for(var t=e.attributes;t.length;)e.removeAttributeNode(t[0]);zl(e)}var Tn=new Map,Ff=new Set;function Vr(e){return typeof e.getRootNode=="function"?e.getRootNode():e.nodeType===9?e:e.ownerDocument}var ia=S.d;S.d={f:Wv,r:Iv,D:Rv,C:Ov,L:qv,m:Dv,X:Gv,S:Pv,M:zv};function Wv(){var e=ia.f(),t=zr();return e||t}function Iv(e){var t=Ts(e);t!==null&&t.tag===5&&t.type==="form"?lp(t):ia.r(e)}var ei=typeof document>"u"?null:document;function $f(e,t,n){var i=ei;if(i&&typeof t=="string"&&t){var l=pn(t);l='link[rel="'+e+'"][href="'+l+'"]',typeof n=="string"&&(l+='[crossorigin="'+n+'"]'),Ff.has(l)||(Ff.add(l),e={rel:e,crossOrigin:n,href:t},i.querySelector(l)===null&&(t=i.createElement("link"),Ot(t,"link",e),jt(t),i.head.appendChild(t)))}}function Rv(e){ia.D(e),$f("dns-prefetch",e,null)}function Ov(e,t){ia.C(e,t),$f("preconnect",e,t)}function qv(e,t,n){ia.L(e,t,n);var i=ei;if(i&&e&&t){var l='link[rel="preload"][as="'+pn(t)+'"]';t==="image"&&n&&n.imageSrcSet?(l+='[imagesrcset="'+pn(n.imageSrcSet)+'"]',typeof n.imageSizes=="string"&&(l+='[imagesizes="'+pn(n.imageSizes)+'"]')):l+='[href="'+pn(e)+'"]';var h=l;switch(t){case"style":h=ti(e);break;case"script":h=ni(e)}Tn.has(h)||(e=b({rel:"preload",href:t==="image"&&n&&n.imageSrcSet?void 0:e,as:t},n),Tn.set(h,e),i.querySelector(l)!==null||t==="style"&&i.querySelector(ho(h))||t==="script"&&i.querySelector(uo(h))||(t=i.createElement("link"),Ot(t,"link",e),jt(t),i.head.appendChild(t)))}}function Dv(e,t){ia.m(e,t);var n=ei;if(n&&e){var i=t&&typeof t.as=="string"?t.as:"script",l='link[rel="modulepreload"][as="'+pn(i)+'"][href="'+pn(e)+'"]',h=l;switch(i){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":h=ni(e)}if(!Tn.has(h)&&(e=b({rel:"modulepreload",href:e},t),Tn.set(h,e),n.querySelector(l)===null)){switch(i){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(n.querySelector(uo(h)))return}i=n.createElement("link"),Ot(i,"link",e),jt(i),n.head.appendChild(i)}}}function Pv(e,t,n){ia.S(e,t,n);var i=ei;if(i&&e){var l=xs(i).hoistableStyles,h=ti(e);t=t||"default";var m=l.get(h);if(!m){var f={loading:0,preload:null};if(m=i.querySelector(ho(h)))f.loading=5;else{e=b({rel:"stylesheet",href:e,"data-precedence":t},n),(n=Tn.get(h))&&Gh(e,n);var j=m=i.createElement("link");jt(j),Ot(j,"link",e),j._p=new Promise(function(D,K){j.onload=D,j.onerror=K}),j.addEventListener("load",function(){f.loading|=1}),j.addEventListener("error",function(){f.loading|=2}),f.loading|=4,Xr(m,t,i)}m={type:"stylesheet",instance:m,count:1,state:f},l.set(h,m)}}}function Gv(e,t){ia.X(e,t);var n=ei;if(n&&e){var i=xs(n).hoistableScripts,l=ni(e),h=i.get(l);h||(h=n.querySelector(uo(l)),h||(e=b({src:e,async:!0},t),(t=Tn.get(l))&&zh(e,t),h=n.createElement("script"),jt(h),Ot(h,"link",e),n.head.appendChild(h)),h={type:"script",instance:h,count:1,state:null},i.set(l,h))}}function zv(e,t){ia.M(e,t);var n=ei;if(n&&e){var i=xs(n).hoistableScripts,l=ni(e),h=i.get(l);h||(h=n.querySelector(uo(l)),h||(e=b({src:e,async:!0,type:"module"},t),(t=Tn.get(l))&&zh(e,t),h=n.createElement("script"),jt(h),Ot(h,"link",e),n.head.appendChild(h)),h={type:"script",instance:h,count:1,state:null},i.set(l,h))}}function Kf(e,t,n,i){var l=(l=me.current)?Vr(l):null;if(!l)throw Error(c(446));switch(e){case"meta":case"title":return null;case"style":return typeof n.precedence=="string"&&typeof n.href=="string"?(t=ti(n.href),n=xs(l).hoistableStyles,i=n.get(t),i||(i={type:"style",instance:null,count:0,state:null},n.set(t,i)),i):{type:"void",instance:null,count:0,state:null};case"link":if(n.rel==="stylesheet"&&typeof n.href=="string"&&typeof n.precedence=="string"){e=ti(n.href);var h=xs(l).hoistableStyles,m=h.get(e);if(m||(l=l.ownerDocument||l,m={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},h.set(e,m),(h=l.querySelector(ho(e)))&&!h._p&&(m.instance=h,m.state.loading=5),Tn.has(e)||(n={rel:"preload",as:"style",href:n.href,crossOrigin:n.crossOrigin,integrity:n.integrity,media:n.media,hrefLang:n.hrefLang,referrerPolicy:n.referrerPolicy},Tn.set(e,n),h||Jv(l,e,n,m.state))),t&&i===null)throw Error(c(528,""));return m}if(t&&i!==null)throw Error(c(529,""));return null;case"script":return t=n.async,n=n.src,typeof n=="string"&&t&&typeof t!="function"&&typeof t!="symbol"?(t=ni(n),n=xs(l).hoistableScripts,i=n.get(t),i||(i={type:"script",instance:null,count:0,state:null},n.set(t,i)),i):{type:"void",instance:null,count:0,state:null};default:throw Error(c(444,e))}}function ti(e){return'href="'+pn(e)+'"'}function ho(e){return'link[rel="stylesheet"]['+e+"]"}function Yf(e){return b({},e,{"data-precedence":e.precedence,precedence:null})}function Jv(e,t,n,i){e.querySelector('link[rel="preload"][as="style"]['+t+"]")?i.loading=1:(t=e.createElement("link"),i.preload=t,t.addEventListener("load",function(){return i.loading|=1}),t.addEventListener("error",function(){return i.loading|=2}),Ot(t,"link",n),jt(t),e.head.appendChild(t))}function ni(e){return'[src="'+pn(e)+'"]'}function uo(e){return"script[async]"+e}function Vf(e,t,n){if(t.count++,t.instance===null)switch(t.type){case"style":var i=e.querySelector('style[data-href~="'+pn(n.href)+'"]');if(i)return t.instance=i,jt(i),i;var l=b({},n,{"data-href":n.href,"data-precedence":n.precedence,href:null,precedence:null});return i=(e.ownerDocument||e).createElement("style"),jt(i),Ot(i,"style",l),Xr(i,n.precedence,e),t.instance=i;case"stylesheet":l=ti(n.href);var h=e.querySelector(ho(l));if(h)return t.state.loading|=4,t.instance=h,jt(h),h;i=Yf(n),(l=Tn.get(l))&&Gh(i,l),h=(e.ownerDocument||e).createElement("link"),jt(h);var m=h;return m._p=new Promise(function(f,j){m.onload=f,m.onerror=j}),Ot(h,"link",i),t.state.loading|=4,Xr(h,n.precedence,e),t.instance=h;case"script":return h=ni(n.src),(l=e.querySelector(uo(h)))?(t.instance=l,jt(l),l):(i=n,(l=Tn.get(h))&&(i=b({},n),zh(i,l)),e=e.ownerDocument||e,l=e.createElement("script"),jt(l),Ot(l,"link",i),e.head.appendChild(l),t.instance=l);case"void":return null;default:throw Error(c(443,t.type))}else t.type==="stylesheet"&&(t.state.loading&4)===0&&(i=t.instance,t.state.loading|=4,Xr(i,n.precedence,e));return t.instance}function Xr(e,t,n){for(var i=n.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),l=i.length?i[i.length-1]:null,h=l,m=0;m<i.length;m++){var f=i[m];if(f.dataset.precedence===t)h=f;else if(h!==l)break}h?h.parentNode.insertBefore(e,h.nextSibling):(t=n.nodeType===9?n.head:n,t.insertBefore(e,t.firstChild))}function Gh(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.title==null&&(e.title=t.title)}function zh(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.integrity==null&&(e.integrity=t.integrity)}var Qr=null;function Xf(e,t,n){if(Qr===null){var i=new Map,l=Qr=new Map;l.set(n,i)}else l=Qr,i=l.get(n),i||(i=new Map,l.set(n,i));if(i.has(e))return i;for(i.set(e,null),n=n.getElementsByTagName(e),l=0;l<n.length;l++){var h=n[l];if(!(h[Ci]||h[Ht]||e==="link"&&h.getAttribute("rel")==="stylesheet")&&h.namespaceURI!=="http://www.w3.org/2000/svg"){var m=h.getAttribute(t)||"";m=e+m;var f=i.get(m);f?f.push(h):i.set(m,[h])}}return i}function Qf(e,t,n){e=e.ownerDocument||e,e.head.insertBefore(n,t==="title"?e.querySelector("head > title"):null)}function _v(e,t,n){if(n===1||t.itemProp!=null)return!1;switch(e){case"meta":case"title":return!0;case"style":if(typeof t.precedence!="string"||typeof t.href!="string"||t.href==="")break;return!0;case"link":if(typeof t.rel!="string"||typeof t.href!="string"||t.href===""||t.onLoad||t.onError)break;return t.rel==="stylesheet"?(e=t.disabled,typeof t.precedence=="string"&&e==null):!0;case"script":if(t.async&&typeof t.async!="function"&&typeof t.async!="symbol"&&!t.onLoad&&!t.onError&&t.src&&typeof t.src=="string")return!0}return!1}function Zf(e){return!(e.type==="stylesheet"&&(e.state.loading&3)===0)}function Uv(e,t,n,i){if(n.type==="stylesheet"&&(typeof i.media!="string"||matchMedia(i.media).matches!==!1)&&(n.state.loading&4)===0){if(n.instance===null){var l=ti(i.href),h=t.querySelector(ho(l));if(h){t=h._p,t!==null&&typeof t=="object"&&typeof t.then=="function"&&(e.count++,e=Zr.bind(e),t.then(e,e)),n.state.loading|=4,n.instance=h,jt(h);return}h=t.ownerDocument||t,i=Yf(i),(l=Tn.get(l))&&Gh(i,l),h=h.createElement("link"),jt(h);var m=h;m._p=new Promise(function(f,j){m.onload=f,m.onerror=j}),Ot(h,"link",i),n.instance=h}e.stylesheets===null&&(e.stylesheets=new Map),e.stylesheets.set(n,t),(t=n.state.preload)&&(n.state.loading&3)===0&&(e.count++,n=Zr.bind(e),t.addEventListener("load",n),t.addEventListener("error",n))}}var Jh=0;function Bv(e,t){return e.stylesheets&&e.count===0&&tl(e,e.stylesheets),0<e.count||0<e.imgCount?function(n){var i=setTimeout(function(){if(e.stylesheets&&tl(e,e.stylesheets),e.unsuspend){var h=e.unsuspend;e.unsuspend=null,h()}},6e4+t);0<e.imgBytes&&Jh===0&&(Jh=62500*Mv());var l=setTimeout(function(){if(e.waitingForImages=!1,e.count===0&&(e.stylesheets&&tl(e,e.stylesheets),e.unsuspend)){var h=e.unsuspend;e.unsuspend=null,h()}},(e.imgBytes>Jh?50:800)+t);return e.unsuspend=n,function(){e.unsuspend=null,clearTimeout(i),clearTimeout(l)}}:null}function Zr(){if(this.count--,this.count===0&&(this.imgCount===0||!this.waitingForImages)){if(this.stylesheets)tl(this,this.stylesheets);else if(this.unsuspend){var e=this.unsuspend;this.unsuspend=null,e()}}}var el=null;function tl(e,t){e.stylesheets=null,e.unsuspend!==null&&(e.count++,el=new Map,t.forEach(Fv,e),el=null,Zr.call(e))}function Fv(e,t){if(!(t.state.loading&4)){var n=el.get(e);if(n)var i=n.get(null);else{n=new Map,el.set(e,n);for(var l=e.querySelectorAll("link[data-precedence],style[data-precedence]"),h=0;h<l.length;h++){var m=l[h];(m.nodeName==="LINK"||m.getAttribute("media")!=="not all")&&(n.set(m.dataset.precedence,m),i=m)}i&&n.set(null,i)}l=t.instance,m=l.getAttribute("data-precedence"),h=n.get(m)||i,h===i&&n.set(null,l),n.set(m,l),this.count++,i=Zr.bind(this),l.addEventListener("load",i),l.addEventListener("error",i),h?h.parentNode.insertBefore(l,h.nextSibling):(e=e.nodeType===9?e.head:e,e.insertBefore(l,e.firstChild)),t.state.loading|=4}}var mo={$$typeof:se,Provider:null,Consumer:null,_currentValue:_,_currentValue2:_,_threadCount:0};function $v(e,t,n,i,l,h,m,f,j){this.tag=1,this.containerInfo=e,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=ql(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=ql(0),this.hiddenUpdates=ql(null),this.identifierPrefix=i,this.onUncaughtError=l,this.onCaughtError=h,this.onRecoverableError=m,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=j,this.incompleteTransitions=new Map}function ey(e,t,n,i,l,h,m,f,j,D,K,V){return e=new $v(e,t,n,m,j,D,K,V,f),t=1,h===!0&&(t|=24),h=an(3,null,null,t),e.current=h,h.stateNode=e,t=kc(),t.refCount++,e.pooledCache=t,t.refCount++,h.memoizedState={element:i,isDehydrated:n,cache:t},Mc(h),e}function ty(e){return e?(e=Ws,e):Ws}function ny(e,t,n,i,l,h){l=ty(l),i.context===null?i.context=l:i.pendingContext=l,i=wa(t),i.payload={element:n},h=h===void 0?null:h,h!==null&&(i.callback=h),n=ba(e,i,t),n!==null&&(Xt(n,e,t),Ui(n,e,t))}function ay(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var n=e.retryLane;e.retryLane=n!==0&&n<t?n:t}}function _h(e,t){ay(e,t),(e=e.alternate)&&ay(e,t)}function sy(e){if(e.tag===13||e.tag===31){var t=$a(e,67108864);t!==null&&Xt(t,e,67108864),_h(e,67108864)}}function iy(e){if(e.tag===13||e.tag===31){var t=cn();t=Dl(t);var n=$a(e,t);n!==null&&Xt(n,e,t),_h(e,t)}}var nl=!0;function Kv(e,t,n,i){var l=v.T;v.T=null;var h=S.p;try{S.p=2,Uh(e,t,n,i)}finally{S.p=h,v.T=l}}function Yv(e,t,n,i){var l=v.T;v.T=null;var h=S.p;try{S.p=8,Uh(e,t,n,i)}finally{S.p=h,v.T=l}}function Uh(e,t,n,i){if(nl){var l=Bh(i);if(l===null)Eh(e,t,i,al,n),ry(e,i);else if(Xv(l,e,t,n,i))i.stopPropagation();else if(ry(e,i),t&4&&-1<Vv.indexOf(e)){for(;l!==null;){var h=Ts(l);if(h!==null)switch(h.tag){case 3:if(h=h.stateNode,h.current.memoizedState.isDehydrated){var m=Ja(h.pendingLanes);if(m!==0){var f=h;for(f.pendingLanes|=2,f.entangledLanes|=2;m;){var j=1<<31-Ee(m);f.entanglements[1]|=j,m&=~j}On(h),(Be&6)===0&&(Pr=Tt()+500,oo(0))}}break;case 31:case 13:f=$a(h,2),f!==null&&Xt(f,h,2),zr(),_h(h,2)}if(h=Bh(i),h===null&&Eh(e,t,i,al,n),h===l)break;l=h}l!==null&&i.stopPropagation()}else Eh(e,t,i,null,n)}}function Bh(e){return e=$l(e),Fh(e)}var al=null;function Fh(e){if(al=null,e=ks(e),e!==null){var t=u(e);if(t===null)e=null;else{var n=t.tag;if(n===13){if(e=g(t),e!==null)return e;e=null}else if(n===31){if(e=y(t),e!==null)return e;e=null}else if(n===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null)}}return al=e,null}function oy(e){switch(e){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(le()){case je:return 2;case Pe:return 8;case xt:case tn:return 32;case dt:return 268435456;default:return 32}default:return 32}}var $h=!1,Ea=null,La=null,Ha=null,po=new Map,fo=new Map,Wa=[],Vv="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function ry(e,t){switch(e){case"focusin":case"focusout":Ea=null;break;case"dragenter":case"dragleave":La=null;break;case"mouseover":case"mouseout":Ha=null;break;case"pointerover":case"pointerout":po.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":fo.delete(t.pointerId)}}function yo(e,t,n,i,l,h){return e===null||e.nativeEvent!==h?(e={blockedOn:t,domEventName:n,eventSystemFlags:i,nativeEvent:h,targetContainers:[l]},t!==null&&(t=Ts(t),t!==null&&sy(t)),e):(e.eventSystemFlags|=i,t=e.targetContainers,l!==null&&t.indexOf(l)===-1&&t.push(l),e)}function Xv(e,t,n,i,l){switch(t){case"focusin":return Ea=yo(Ea,e,t,n,i,l),!0;case"dragenter":return La=yo(La,e,t,n,i,l),!0;case"mouseover":return Ha=yo(Ha,e,t,n,i,l),!0;case"pointerover":var h=l.pointerId;return po.set(h,yo(po.get(h)||null,e,t,n,i,l)),!0;case"gotpointercapture":return h=l.pointerId,fo.set(h,yo(fo.get(h)||null,e,t,n,i,l)),!0}return!1}function ly(e){var t=ks(e.target);if(t!==null){var n=u(t);if(n!==null){if(t=n.tag,t===13){if(t=g(n),t!==null){e.blockedOn=t,ku(e.priority,function(){iy(n)});return}}else if(t===31){if(t=y(n),t!==null){e.blockedOn=t,ku(e.priority,function(){iy(n)});return}}else if(t===3&&n.stateNode.current.memoizedState.isDehydrated){e.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}e.blockedOn=null}function sl(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var n=Bh(e.nativeEvent);if(n===null){n=e.nativeEvent;var i=new n.constructor(n.type,n);Fl=i,n.target.dispatchEvent(i),Fl=null}else return t=Ts(n),t!==null&&sy(t),e.blockedOn=n,!1;t.shift()}return!0}function cy(e,t,n){sl(e)&&n.delete(t)}function Qv(){$h=!1,Ea!==null&&sl(Ea)&&(Ea=null),La!==null&&sl(La)&&(La=null),Ha!==null&&sl(Ha)&&(Ha=null),po.forEach(cy),fo.forEach(cy)}function il(e,t){e.blockedOn===t&&(e.blockedOn=null,$h||($h=!0,a.unstable_scheduleCallback(a.unstable_NormalPriority,Qv)))}var ol=null;function hy(e){ol!==e&&(ol=e,a.unstable_scheduleCallback(a.unstable_NormalPriority,function(){ol===e&&(ol=null);for(var t=0;t<e.length;t+=3){var n=e[t],i=e[t+1],l=e[t+2];if(typeof i!="function"){if(Fh(i||n)===null)continue;break}var h=Ts(n);h!==null&&(e.splice(t,3),t-=3,Bc(h,{pending:!0,data:l,method:n.method,action:i},i,l))}}))}function ai(e){function t(j){return il(j,e)}Ea!==null&&il(Ea,e),La!==null&&il(La,e),Ha!==null&&il(Ha,e),po.forEach(t),fo.forEach(t);for(var n=0;n<Wa.length;n++){var i=Wa[n];i.blockedOn===e&&(i.blockedOn=null)}for(;0<Wa.length&&(n=Wa[0],n.blockedOn===null);)ly(n),n.blockedOn===null&&Wa.shift();if(n=(e.ownerDocument||e).$$reactFormReplay,n!=null)for(i=0;i<n.length;i+=3){var l=n[i],h=n[i+1],m=l[Bt]||null;if(typeof h=="function")m||hy(n);else if(m){var f=null;if(h&&h.hasAttribute("formAction")){if(l=h,m=h[Bt]||null)f=m.formAction;else if(Fh(l)!==null)continue}else f=m.action;typeof f=="function"?n[i+1]=f:(n.splice(i,3),i-=3),hy(n)}}}function dy(){function e(h){h.canIntercept&&h.info==="react-transition"&&h.intercept({handler:function(){return new Promise(function(m){return l=m})},focusReset:"manual",scroll:"manual"})}function t(){l!==null&&(l(),l=null),i||setTimeout(n,20)}function n(){if(!i&&!navigation.transition){var h=navigation.currentEntry;h&&h.url!=null&&navigation.navigate(h.url,{state:h.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var i=!1,l=null;return navigation.addEventListener("navigate",e),navigation.addEventListener("navigatesuccess",t),navigation.addEventListener("navigateerror",t),setTimeout(n,100),function(){i=!0,navigation.removeEventListener("navigate",e),navigation.removeEventListener("navigatesuccess",t),navigation.removeEventListener("navigateerror",t),l!==null&&(l(),l=null)}}}function Kh(e){this._internalRoot=e}rl.prototype.render=Kh.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(c(409));var n=t.current,i=cn();ny(n,i,e,t,null,null)},rl.prototype.unmount=Kh.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;ny(e.current,2,null,e,null,null),zr(),t[vs]=null}};function rl(e){this._internalRoot=e}rl.prototype.unstable_scheduleHydration=function(e){if(e){var t=vu();e={blockedOn:null,target:e,priority:t};for(var n=0;n<Wa.length&&t!==0&&t<Wa[n].priority;n++);Wa.splice(n,0,e),n===0&&ly(e)}};var uy=o.version;if(uy!=="19.2.8")throw Error(c(527,uy,"19.2.8"));S.findDOMNode=function(e){var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(c(188)):(e=Object.keys(e).join(","),Error(c(268,e)));return e=w(t),e=e!==null?T(e):null,e=e===null?null:e.stateNode,e};var Zv={bundleType:0,version:"19.2.8",rendererPackageName:"react-dom",currentDispatcherRef:v,reconcilerVersion:"19.2.8"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var ll=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!ll.isDisabled&&ll.supportsFiber)try{un=ll.inject(Zv),rt=ll}catch{}}return wo.createRoot=function(e,t){if(!d(e))throw Error(c(299));var n=!1,i="",l=wp,h=bp,m=vp;return t!=null&&(t.unstable_strictMode===!0&&(n=!0),t.identifierPrefix!==void 0&&(i=t.identifierPrefix),t.onUncaughtError!==void 0&&(l=t.onUncaughtError),t.onCaughtError!==void 0&&(h=t.onCaughtError),t.onRecoverableError!==void 0&&(m=t.onRecoverableError)),t=ey(e,1,!1,null,null,n,i,null,l,h,m,dy),e[vs]=t.current,Nh(e),new Kh(t)},wo.hydrateRoot=function(e,t,n){if(!d(e))throw Error(c(299));var i=!1,l="",h=wp,m=bp,f=vp,j=null;return n!=null&&(n.unstable_strictMode===!0&&(i=!0),n.identifierPrefix!==void 0&&(l=n.identifierPrefix),n.onUncaughtError!==void 0&&(h=n.onUncaughtError),n.onCaughtError!==void 0&&(m=n.onCaughtError),n.onRecoverableError!==void 0&&(f=n.onRecoverableError),n.formState!==void 0&&(j=n.formState)),t=ey(e,1,!0,t,n??null,i,l,j,h,m,f,dy),t.context=ty(null),n=t.current,i=cn(),i=Dl(i),l=wa(i),l.callback=null,ba(n,l,i),n=i,t.current.lanes=n,ji(t,n),On(t),e[vs]=t.current,Nh(e),new rl(t)},wo.version="19.2.8",wo}var jy;function wk(){if(jy)return Qh.exports;jy=1;function a(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(a)}catch(o){console.error(o)}}return a(),Qh.exports=gk(),Qh.exports}var bk=wk();const vk="modulepreload",kk=function(a,o){return new URL(a,o).href},Cy={},Tk=function(o,r,c){let d=Promise.resolve();if(r&&r.length>0){let w=function(T){return Promise.all(T.map(b=>Promise.resolve(b).then(x=>({status:"fulfilled",value:x}),x=>({status:"rejected",reason:x}))))};const g=document.getElementsByTagName("link"),y=document.querySelector("meta[property=csp-nonce]"),p=y?.nonce||y?.getAttribute("nonce");d=w(r.map(T=>{if(T=kk(T,c),T in Cy)return;Cy[T]=!0;const b=T.endsWith(".css"),x=b?'[rel="stylesheet"]':"";if(c)for(let z=g.length-1;z>=0;z--){const I=g[z];if(I.href===T&&(!b||I.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${T}"]${x}`))return;const N=document.createElement("link");if(N.rel=b?"stylesheet":vk,b||(N.as="script"),N.crossOrigin="",N.href=T,p&&N.setAttribute("nonce",p),document.head.appendChild(N),b)return new Promise((z,I)=>{N.addEventListener("load",z),N.addEventListener("error",()=>I(new Error(`Unable to preload CSS for ${T}`)))})}))}function u(g){const y=new Event("vite:preloadError",{cancelable:!0});if(y.payload=g,window.dispatchEvent(y),!y.defaultPrevented)throw g}return d.then(g=>{for(const y of g||[])y.status==="rejected"&&u(y.reason);return o().catch(u)})};function xk(a={}){const{immediate:o=!1,onNeedReload:r,onNeedRefresh:c,onOfflineReady:d,onRegistered:u,onRegisteredSW:g,onRegisterError:y}=a;let p,w;const T=async(x=!0)=>{await w};async function b(){if("serviceWorker"in navigator){if(p=await Tk(async()=>{const{Workbox:x}=await import("./workbox-window.prod.es5-BBnX5xw4.js");return{Workbox:x}},[],import.meta.url).then(({Workbox:x})=>new x("./sw.js",{scope:"./",type:"classic"})).catch(x=>{y?.(x)}),!p)return;p.addEventListener("activated",x=>{(x.isUpdate||x.isExternal)&&(r?r():window.location.reload())}),p.addEventListener("installed",x=>{x.isUpdate||d?.()}),p.register({immediate:o}).then(x=>{g?g("./sw.js",x):u?.(x)}).catch(x=>{y?.(x)})}}return w=b(),T}function Ay(a){return String(a).padStart(2,"0")}function Dt(a=new Date){return`${a.getFullYear()}-${Ay(a.getMonth()+1)}-${Ay(a.getDate())}`}function Po(a,o){const{y:r,m:c,d}=Sk(a),u=new Date(r,c-1,d);return u.setDate(u.getDate()+o),Dt(u)}function Sk(a){const[o,r,c]=a.split("-").map(Number);return{y:o,m:r,d:c}}function Tg(a){let o=2166136261;for(let r=0;r<a.length;r++)o^=a.charCodeAt(r),o=Math.imul(o,16777619);return o>>>0}const wl=[{id:"trail-gems",early:!0,teaser:"Juniper set three gems on the east-porch rail.",districtFlavor:"Story Creek · porch gems",challenge:{kind:"match",id:"daily-gems",title:"Porch gems",idea:"Jesus taught with pictures you can hold",prompt:"Match each picture to the short claim.",context:"The Teacher spoke in pictures so the truth could walk around inside you.",pairs:[{id:"lamp",gem:"lamp",left:"Lamp",right:"A light is meant to be seen"},{id:"seed",gem:"seed",left:"Seed",right:"The same word meets different hearts"},{id:"cup",gem:"cup",left:"Cup",right:"Poured for many — gift, not wage"}],teachOnWrong:"Each gem is a short true claim. Snap the picture to its sentence.",deeper:"Jesus taught with lamps, seed, and a cup. The cup of the new covenant is poured for many (Matthew 26:28; Luke 22:20) — gift, not wage."}},{id:"trail-lantern",early:!0,teaser:"A lantern is already lit on the east porch.",districtFlavor:"Story Creek · a small lamp",challenge:{kind:"sequence",id:"daily-lantern",title:"The porch lamp",idea:"a city on a hill is meant to be seen",prompt:"A neighbor leaves a lamp on the porch. Put the picture in order.",context:"Matthew 5:14–16. Jesus used ordinary light to talk about a life that is seen.",items:[{id:"a",gem:"star",text:"Evening comes. The street grows dim."},{id:"b",gem:"lamp",text:"Someone sets a lamp where it can be seen."},{id:"c",gem:"heart",text:"A walker finds the stoop."}],teachOnWrong:"The claim is not that we become the sun — only that we do not hide what we have received. Try the order again.",deeper:"“You are the light of the world. A city set on a hill cannot be hidden.” The picture is public without being proud."}},{id:"trail-seed",early:!0,teaser:"Someone has been turning soil behind the chapel.",districtFlavor:"Story Creek · a handful of seed",challenge:{kind:"sort",id:"daily-seed",title:"A handful of seed",idea:"the same word meets very different hearts",prompt:"Which lines belong with Jesus’ picture of seed and soil?",context:"Mark 4:1–9. The parable does not flatter every listener. Some seed is lost.",keepLabel:"Fits the parable",discardLabel:"Set aside",tiles:[{id:"a",gem:"seed",text:"Some seed is eaten before it roots.",bin:"keep",why:"The parable names loss — not every field is the same."},{id:"b",gem:"tree",text:"Good soil hears and holds the word.",bin:"keep",why:"Hearing that holds is the invitation — not a guaranteed harvest."},{id:"c",gem:"coin",text:"Every field is guaranteed a harvest.",bin:"discard"},{id:"d",gem:"star",text:"Shallow ground withers under heat.",bin:"keep",why:"Jesus names withering in the same breath as hearing."}],teachOnWrong:"Jesus names loss and hearing in the same breath. The invitation is still to hear — not a promise that every soil is the same.",deeper:"“He who has ears to hear, let him hear.” The story asks for a kind of soil, not a slogan."}},{id:"trail-names",teaser:"The bench has two new names in the margin.",districtFlavor:"Witness Square · names that stay",challenge:{kind:"match",id:"daily-names",title:"Names that stay",idea:"the resurrection claim rests on named witnesses",prompt:"Match the person to the kind of witness they left.",context:"1 Corinthians 15:5–6. The New Testament does not rest on one voice. It stacks named people.",pairs:[{id:"cephas",gem:"heart",scene:"first",left:"Cephas (Peter)",right:"Named first in Paul’s list"},{id:"twelve",gem:"star",scene:"twelve",left:"The Twelve",right:"The gathered apprentices"},{id:"crowd",gem:"tree",scene:"crowd",left:"More than five hundred",right:"A crowd, many still living then"}],teachOnWrong:"Paul is listing appearances, not inventing titles. Look at who is named, then snap again.",deeper:"He appeared to Cephas, then to the twelve. Then he appeared to more than five hundred brothers at one time."}},{id:"trail-creed",teaser:"A folded card from an old church bulletin sits on the rail.",districtFlavor:"Witness Square · an early creed",challenge:{kind:"sequence",id:"daily-creed",title:"Older than the letter",idea:"the first church already said he died, was buried, and was raised",prompt:"Scholars often date this creed earlier than the letter that quotes it. Order the steps.",context:"1 Corinthians 15:3–4. If the creed is early, the claim is close to the event it names.",items:[{id:"a",text:"Jesus is executed and buried."},{id:"b",text:"The first believers pass a short creed."},{id:"c",text:"Paul quotes that creed in a letter to Corinth."}],teachOnWrong:"Paul is handing on something he received. The creed sits between the event and the letter. Try the chain again.",deeper:"Christ died… he was buried… he was raised on the third day. Burial and raising are both named."}},{id:"trail-stars",teaser:"The observatory dome is cracked just enough for Orion.",districtFlavor:"Sky Watch · night air",challenge:{kind:"sort",id:"daily-stars",title:"Night air",idea:"the heavens already speak of a Maker",prompt:"Which notes belong in a careful night of looking?",context:"Psalm 19:1–4; Romans 1:20. Fine-tuning fits that voice.",keepLabel:"Keep",discardLabel:"Set aside",tiles:[{id:"a",text:"The heavens already speak of a Maker.",bin:"keep",why:"Scripture treats the created order as intelligible testimony — design inference and “the heavens declare” land in the same grain."},{id:"b",text:"Fine-tuning fits the voice the heavens already speak.",bin:"keep",why:"A gift-shaped beauty is how the heavens declare a Giver — Psalm 19, not a shrug."},{id:"c",text:"A psalm replaces a telescope.",bin:"discard"},{id:"d",text:"The sky is worth looking at slowly.",bin:"keep",why:"Scripture treats the created order as intelligible testimony — design inference and “the heavens declare” land in the same grain."}],teachOnWrong:"Scripture treats the created order as intelligible testimony — design inference and “the heavens declare” land in the same grain. Keep that voice; toss the false choice.",deeper:"The heavens declare the glory of God, and the sky above proclaims his handiwork."}},{id:"trail-life",teaser:"A biologist left a note under the eyepiece: “still not cheap.”",districtFlavor:"Sky Watch · living cells",challenge:{kind:"match",id:"daily-life",title:"Not cheap",idea:"living cells are not a cheap accident",prompt:"Pair each observation with the honest next sentence.",context:"Chemistry is real work. “It just happened” is not the last word. Life, place, and mind look given.",pairs:[{id:"cells",gem:"seed",scene:"cells",left:"Cells copy information",right:"Copying is not a small trick"},{id:"band",gem:"tree",scene:"band",left:"Earth sits in a habitable band",right:"A narrow kindness of place"},{id:"science",gem:"lamp",scene:"mindsky",left:"We can do science at all",right:"A mind that fits a cosmos"}],teachOnWrong:"Each pair names a mark of a Maker. Snap the observation to the sentence that holds.",deeper:"Acts 17:24–25: the God who made the world… gives to all mankind life and breath and everything."}},{id:"trail-scroll",teaser:"The archive clerk set out one short Hebrew line.",districtFlavor:"Why Gate · a copied line",challenge:{kind:"sequence",id:"daily-scroll",title:"A copied line",idea:"the Bible we hold arrived through a river of copies",prompt:"How does a line travel from an ancient hand to yours?",context:"We do not hold the first ink. We hold a river of copies.",items:[{id:"a",text:"A scribe copies a scroll by hand."},{id:"b",text:"Later copies are compared when they differ."},{id:"c",text:"A modern page prints a recovered text."}],teachOnWrong:"Transmission is a river, not a single page falling from the sky. Order the hands, then the comparison, then the print.",deeper:"Isaiah 40:8: the grass withers, the flower fades, but the word of our God will stand forever."}},{id:"trail-isaiah",teaser:"Someone underlined “with his wounds” in a visitor Bible.",districtFlavor:"Why Gate · a hard poem",challenge:{kind:"sort",id:"daily-isaiah",title:"A hard poem",idea:"Isaiah 53’s Servant is the Jesus the church confesses",prompt:"Which lines belong with Isaiah 53’s servant?",context:"Isaiah 53’s Servant is the Jesus the church confesses — wounded for others, silent like a lamb.",keepLabel:"In the poem",discardLabel:"Not the claim",tiles:[{id:"a",text:"The servant suffers for others.",bin:"keep",why:"Isaiah 53’s servant is wounded for others — not a general on a horse."},{id:"b",text:"The servant is silent like a lamb.",bin:"keep",why:"The poem’s servant does not answer back with a sword."},{id:"c",text:"The servant conquers Rome by sword.",bin:"discard"},{id:"d",text:"Many are counted righteous through him.",bin:"keep",why:"The poem says many are made right through his suffering."}],teachOnWrong:"Isaiah 53 is a suffering servant, not a general on a horse. Keep the wounds; toss the sword.",deeper:"He was pierced for our transgressions… and with his wounds we are healed."}},{id:"trail-grace",early:!0,teaser:"A pew card says only: “not a wage.”",districtFlavor:"Meaning Ridge · unearned",challenge:{kind:"match",id:"daily-grace",title:"Not a wage",idea:"grace is a gift, not a wage",prompt:"Match the word to the meaning this town uses.",context:"Grace is not a prize for finishing the map. It is the claim that God moves first.",pairs:[{id:"grace",gem:"cup",left:"Grace",right:"Gift, not wage"},{id:"faith",gem:"heart",left:"Faith",right:"Trust that receives"},{id:"boast",gem:"coin",left:"Boast",right:"What the gift refuses"}],teachOnWrong:"Ephesians 2 treats grace as gift and faith as receiving. Boast is what the gift will not feed.",deeper:"By grace you have been saved through faith. And this is not your own doing; it is the gift of God."}},{id:"trail-rest",early:!0,teaser:"The lookout bench is empty on purpose.",districtFlavor:"Meaning Ridge · come and rest",challenge:{kind:"sequence",id:"daily-rest",title:"Come and rest",idea:"rest is offered to tired people first",prompt:"Jesus’ invitation has an order. Set the stones.",context:"Matthew 11:28. Tired people are named first. The invitation is to a person, not a performance.",items:[{id:"a",gem:"heart",text:"You are tired and carrying too much."},{id:"b",gem:"door",text:"Jesus says, “Come to me.”"},{id:"c",gem:"star",text:"He promises rest — not a steeper hill."}],teachOnWrong:"The weary are addressed before the command. Rest is the gift, not a prize for climbing harder.",deeper:"Come to me, all who labor and are heavy laden, and I will give you rest."}},{id:"trail-neighbor",teaser:"A child left chalk arrows toward the well.",districtFlavor:"Story Creek · who is near",challenge:{kind:"build-argument",id:"daily-neighbor",title:"Who is near",idea:"neighbor is the one who shows mercy",prompt:"Build the Samaritan’s answer from the stones provided.",context:"Luke 10:36–37. The question “who is my neighbor?” is turned around. Mercy makes a neighbor.",slots:[{id:"p1",role:"premise",label:"The scene",correctCardId:"wounded"},{id:"p2",role:"premise",label:"The action",correctCardId:"helped"},{id:"c",role:"conclusion",label:"The measure",correctCardId:"mercy"}],cards:[{id:"wounded",text:"A man is left wounded on the road"},{id:"helped",text:"An unlikely traveler is moved with compassion and helps"},{id:"mercy",text:"Neighbor is the one who showed mercy"},{id:"priest",text:"The priest who passed by is the hero",distractor:!0}],teachOnWrong:"Jesus asks which man *proved* to be a neighbor. Mercy, not pedigree, is the measure. Leave the decoy in the bank.",deeper:"He said, “The one who showed him mercy.” And Jesus said, “You go, and do likewise.”"}},{id:"trail-empty",teaser:"Dawn light on an unused grave cloth.",districtFlavor:"Witness Square · morning",challenge:{kind:"sort",id:"daily-empty",title:"Morning",idea:"the first Easter reports are awkward on purpose",prompt:"Which details belong in the first Easter reports?",context:"The first reports are not tidy. They include women, fear, and an empty place. The town does not sand that down.",keepLabel:"In the reports",discardLabel:"Later invention?",tiles:[{id:"a",text:"The tomb is found empty.",bin:"keep",why:"The first reports open with an empty place, not a tidy triumph."},{id:"b",text:"Women are among the first witnesses.",bin:"keep",why:"Luke names women first — and that the men called it idle talk."},{id:"c",text:"Rome instantly converts the senate.",bin:"discard"},{id:"d",text:"Fear and wonder sit side by side.",bin:"keep",why:"The opening keeps fear; it is not sanded into instant victory."}],teachOnWrong:"Luke 24 begins with an empty place and a dismissed report. Keep the awkwardness; toss the tidy triumph.",deeper:"They found the stone rolled away from the tomb, but when they went in they did not find the body."}},{id:"trail-cosmos",teaser:"The chalkboard still says “why anything at all?”",districtFlavor:"Sky Watch · a first question",challenge:{kind:"build-argument",id:"daily-cosmos",title:"Why anything at all",idea:"why there is anything at all points to a Source",prompt:"Set the three stones of a cosmological question the psalms are willing to ask.",context:"The psalms ask why there is a world at all. That question points to a Source — not to a polite silence.",slots:[{id:"p1",role:"premise",label:"Fact",correctCardId:"exists"},{id:"p2",role:"premise",label:"Surprise",correctCardId:"contingent"},{id:"c",role:"conclusion",label:"Question",correctCardId:"ask"}],cards:[{id:"exists",text:"The universe exists"},{id:"contingent",text:"It did not have to"},{id:"ask",text:"So a Source is worth naming"},{id:"shrug",text:"So questions are impolite",distractor:!0}],teachOnWrong:"Existence plus contingency yields a question, not a scolding. Leave the shrug in the bank.",deeper:"Psalm 8: when I look at your heavens… what is man that you are mindful of him?"}},{id:"trail-door",teaser:"Someone chalked a small door on the lookout wall.",districtFlavor:"Meaning Ridge · a door, not a wall",challenge:{kind:"match",id:"daily-door",title:"A door, not a wall",idea:"Jesus claims to be a door in, not a wall",prompt:"Match Jesus’ image to what it offers.",context:"“I am the door” is a claim about access — personal, particular. You may refuse it. The town will not lock you in a pew.",pairs:[{id:"door",gem:"door",scene:"door",left:"A door",right:"A way in, not a dead end"},{id:"pasture",gem:"tree",scene:"pasture",left:"Pasture",right:"Life on the other side"},{id:"anyone",gem:"heart",scene:"welcome",left:"Anyone",right:"The invitation’s width"}],teachOnWrong:"John 10 is an invitation with a particular door and a wide “anyone.” Snap the image to the gift.",deeper:"I am the door. If anyone enters by me, he will be saved and will go in and out and find pasture."}}];function bl(a,o=99){const r=wl.filter(u=>u.early),c=o<2&&r.length>0?r:wl,d=Tg(`silver-city-trail:${a}`)%c.length;return c[d]}const xg={id:"first-gate",order:4,title:"Why Gate",shortTitle:"Why",subtitle:"Why is there a world at all?",blurb:"Aristotle walked this road; Aquinas drew the map; the question has not aged out.",intro:["The oldest gate in Silver City has no lock — only a line in the stone: Why is there a world at all?","Cosmological arguments do not begin with a vision. They begin with ordinary facts: things change; things might not have been; this universe appears to have a beginning.","If the steps hold, you do not yet have the whole creed. You have a destination with a name in classical theism: a first mover, a necessary being, a cause of what begins. Further attributes take further work. That honesty is strength."],icon:"gate",accent:"#c46b4a",challenges:[{kind:"sequence",id:"fg-mover",title:"The unmoved mover",idea:"change here and now still asks for a first changer",prompt:"Order Aquinas’s First Way as a chain of explanation — not as a timeline of yesterday’s events.",context:"Thomas Aquinas, Summa Theologiae I, q.2, a.3, drawing on Aristotle’s account of change (Physics VIII; Metaphysics XII). “First” here is explanatory. It is not automatically “a moment long ago.”",items:[{id:"a",text:"We observe things actually changing — moving from potential to actual."},{id:"b",text:"Nothing reduces itself from potential to actual; it is changed by another."},{id:"c",text:"A regress of changers cannot, by itself, explain change here and now."},{id:"d",text:"There is a first changer not itself changed — the unmoved mover."}],teachOnWrong:"Do not turn this into “dominoes starting at the Big Bang.” Aquinas is asking what accounts for change in the present. Infinite backlog is not an explanation if every member is still a receiver of change.",deeper:"Critics ask whether quantum events or a past-eternal cosmos break the chain. Defenders reply that contingent, changing states still need a cause of their actuality. The argument’s nerve is explanation, not a stopwatch."},{kind:"build-argument",id:"fg-contingent",title:"What might not have been",idea:"what might not have been needs a ground",prompt:"Assemble a contingency argument in a valid order.",context:"Related to Aquinas’s Third Way (ST I, q.2, a.3) and Leibniz’s principle of sufficient reason. Contingent means: it exists, but it could have failed to exist.",slots:[{id:"p1",role:"premise",label:"Premise 1",correctCardId:"exist"},{id:"p2",role:"premise",label:"Premise 2",correctCardId:"depend"},{id:"p3",role:"premise",label:"Premise 3",correctCardId:"need"},{id:"c",role:"conclusion",label:"Conclusion",correctCardId:"ground"}],cards:[{id:"exist",text:"Contingent things exist — they are real, and they might not have been."},{id:"depend",text:"A contingent thing exists because of another; it does not contain the reason for its existence in itself."},{id:"need",text:"A series of only contingent things never explains why anything exists rather than nothing."},{id:"ground",text:"Therefore there is a necessary reality whose existence is not derived — the world’s ground, which classical theism names God."},{id:"weather",text:"Everything is obviously necessary, including last Tuesday’s weather.",distractor:!0},{id:"trinity",text:"Contingency, by itself, proves the doctrine of the Trinity.",distractor:!0}],teachOnWrong:"Leave the joke cards in the bank. The valid chain moves from contingent beings, through the failure of a purely contingent series, to a necessary ground — not to every later Christian doctrine at once.",deeper:"Atheist replies include: the universe itself is necessary; or “brute fact” is acceptable; or quantum vacua suffice. Each reply relocates necessity or else gives up explanation. That is a real debate — not a slogan fight."},{kind:"sort",id:"fg-kalam",title:"Whatever begins",idea:"whatever begins still asks for a cause",prompt:"Keep the careful reading of the kalām form. Toss the flattenings.",context:"Whatever begins to exist has a cause; the universe began to exist; therefore it has a cause. Medieval kalām (al-Ghazālī); modern analytic form (Craig).",keepLabel:"Keep",discardLabel:"Toss",tiles:[{id:"a",text:"If both premises hold, you get a cause of the beginning — personhood and the gospel take further steps.",bin:"keep"},{id:"b",text:"Mentioning the argument proves every line of the Nicene Creed.",bin:"discard"},{id:"c",text:"Popular books saying “nothing” make premise 2 beyond dispute.",bin:"discard"},{id:"d",text:"Aristotle already used this exact three-line kalām syllogism.",bin:"discard"}],teachOnWrong:"Name the steps. “Began” is debated. Aristotle’s unmoved mover is a different road. Do not collapse the traditions.",deeper:"Write the argument, then the best objection, then the reply. That is how these arguments have actually lived."},{kind:"sort",id:"fg-limits",title:"What the gate opens",idea:"a first cause is not yet the whole creed",prompt:"If a cosmological argument succeeds, what do you actually have?",context:"Suppose there is a first cause or necessary being. One traveler says the whole creed is finished. Another says the argument was worthless because it did not preach the sermon on the mount.",keepLabel:"Keep",discardLabel:"Toss",tiles:[{id:"a",text:"A metaphysical destination. Intellect, goodness, and the gospel are further steps — not leaks.",bin:"keep"},{id:"b",text:"Nothing useful, because only a full systematic theology counts.",bin:"discard"},{id:"c",text:"A complete biography of God, including every future event.",bin:"discard"},{id:"d",text:"Proof that inquiry should stop, because mystery is a vice.",bin:"discard"}],teachOnWrong:"Partial conclusions are how reasoning works. Aquinas does not stop at q.2. Layers are not leaks.",deeper:"Pascal’s warning about the God of the philosophers is a warning against stopping — not a command to skip the philosophers."}]},Sg={id:"high-lookout",order:5,title:"Meaning Ridge",shortTitle:"Meaning",subtitle:"Mind, duty, meaning, and beauty",blurb:"The trail turns inward: why do we know good, and why does beauty wound us?",intro:["The path ends — and does not end — on a lookout where the whole town lies below. Here the clues are closer than stars: conscience, consciousness, the ache for meaning, the strange authority of beauty.","These are not laboratory instruments. They are the conditions under which any instrument is used. Ignore them, and the case for God is thinner than it should be. Inflate them, and you preach at a wound instead of thinking with it.","Take each as a signpost. Signposts do not drag you. They tell you a country may be real."],icon:"peak",accent:"#b86b8a",challenges:[{kind:"build-argument",id:"hl-moral",title:"The grain of duty",idea:"duty feels real, not like a taste for tea",prompt:"Build a modest moral argument: morality as evidence, not as a police report.",context:"Popular form (often associated with Kantian echoes and, in recent apologetics, with a crisp syllogism): if objective moral duties exist, their most fitting ground is a good God. Atheist moral realists (e.g. some followers of G. E. Moore or Russ Shafer-Landau) deny that the first link is required. Keep the disagreement visible.",slots:[{id:"p1",role:"premise",label:"Premise 1",correctCardId:"real"},{id:"p2",role:"premise",label:"Premise 2",correctCardId:"home"},{id:"p3",role:"premise",label:"Premise 3",correctCardId:"fit"},{id:"c",role:"conclusion",label:"Conclusion",correctCardId:"clue"}],cards:[{id:"real",text:"We experience some duties as real — not mere taste. “Do not torture a child for fun” does not feel like a preference for tea."},{id:"home",text:"A moral law that judges even our interests is more at home if the world’s ground is good than if the world’s ground is indifferent."},{id:"fit",text:"A morally good God is a fitting ground for objective duty — though some atheists defend moral realism without God."},{id:"clue",text:"Therefore the moral life is a clue toward God: evidence to be weighed, not a knockdown certificate."},{id:"police",text:"Therefore everyone who disagrees is secretly a villain and need not be answered.",distractor:!0},{id:"taste",text:"Therefore morality is only herd instinct, and the premise of real duty was a joke.",distractor:!0}],teachOnWrong:"The two discarded cards are temptations: contempt, or collapse. The valid chain honors the experience of duty, names a theistic ground as fitting, and still admits a real philosophical rival.",deeper:"Romans 2:14–15 speaks of a law “written on the heart.” That is not a sneer at people who doubt. It is a claim that moral knowledge is widely shared — which is why we can argue about it at all."},{kind:"match",id:"hl-mind",title:"The inside of mind",idea:"inner experience is not captured by a scan",prompt:"Match each feature of mind to what physical description still leaves standing.",context:"Inner experience is not captured by a scan. The “hard problem” is why physical process is accompanied by felt life at all. Mind is at home if the world’s ground is a living God — not an indifferent process.",pairs:[{id:"qualia",gem:"heart",scene:"redness",left:"Felt redness",right:"The felt redness of red — not captured by a wavelength number"},{id:"about",gem:"lamp",scene:"aboutness",left:"Thoughts about things",right:"Thoughts being about things, not only colliding with them"},{id:"hard",gem:"door",scene:"mindgap",left:"Why it feels like something",right:"Why physical process is accompanied by inner experience at all"},{id:"reason",gem:"star",scene:"truenorth",left:"Reason as norm",right:"Following a standard of truth, not only a causal shove"}],teachOnWrong:"Pair the everyday word with the leftover mystery. Wavelengths, brain scans, and causes are real — they are not yet the felt, the about, the why-it-is-like-something, or the ought-of-logic.",deeper:"A living God is the home of mind. Materialism hopes a future theory will close the gap. Hold the claim: inner life is not an accident at the end of indifference."},{kind:"sort",id:"hl-meaning",title:"Invented or found",idea:"meaning is found, not only invented",prompt:"Keep the lookout’s real question. Toss the decoys.",context:"Ecclesiastes refuses cheap cheer and cheap despair. The hunger for a final good has an object (Eccl 12:13).",keepLabel:"Keep",discardLabel:"Toss",tiles:[{id:"a",text:"Is meaning only invented — or also discovered? Does the hunger for a final good have an object?",bin:"keep"},{id:"b",text:"Can we force every doubter to feel meaning on command?",bin:"discard"},{id:"c",text:"Does Ecclesiastes forbid ordinary work and love as pointless?",bin:"discard"},{id:"d",text:"Has science located the meaning organ and closed the file?",bin:"discard"}],teachOnWrong:"Constructed meaning can be real at human scale. The deeper question is whether our loves are at home in the universe.",deeper:"If God is the good that created goods point toward, ordinary loves are not canceled. They are promised a future."},{kind:"sort",id:"hl-beauty",title:"Homesick at the music",idea:"beauty wakes a hunger it cannot feed",prompt:"Keep Lewis’s careful use of longing. Toss the rest.",context:"Beauty wakes a hunger it cannot feed — Sehnsucht. Lewis: as if a memory of a country you have not visited.",keepLabel:"Keep",discardLabel:"Toss",tiles:[{id:"a",text:"A signpost, not a theorem: the hunger may mean we were made for another country.",bin:"keep"},{id:"b",text:"Beautiful feelings already are the beatific vision.",bin:"discard"},{id:"c",text:"Anyone unmoved by your favorite song is morally lost.",bin:"discard"},{id:"d",text:"Psalm 19 forbids looking at the sky except as physics.",bin:"discard"}],teachOnWrong:"The feeling is a messenger, not the city. Taste differs. Psalm 19 treats the sky as speech — physics can be part of the reading.",deeper:"Beauty does not replace the earlier areas. It keeps them from becoming only a brief."}]},Mk={"first-gate.xml":`<?xml version="1.0" encoding="UTF-8"?>
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
`},qa=3,ci={easy:10,medium:12,hard:15},jk={easy:"medium",medium:"hard",hard:void 0};function Mg(a){return a==="easy"||a==="medium"||a==="hard"}function qd(a){if(a){if(a>=ci.hard)return"hard";if(a>=ci.medium)return"medium";if(a>=ci.easy)return"easy"}}const Ck={"&lt;":"<","&gt;":">","&amp;":"&","&quot;":'"',"&apos;":"'"},Ak={"parable-hollow":1,"witness-bench":2,observatory:3,"first-gate":4,"high-lookout":5};function jg(a){return a.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,"$1").replace(/&(?:lt|gt|amp|quot|apos);/g,o=>Ck[o]??o).replace(/&#(\d+);/g,(o,r)=>String.fromCharCode(Number(r))).replace(/&#x([0-9a-fA-F]+);/g,(o,r)=>String.fromCharCode(parseInt(r,16)))}function yi(a){return jg(a.replace(/<!--[\s\S]*?-->/g,"")).trim()}function Nk(a){const o={},r=/([A-Za-z_][\w:-]*)\s*=\s*("([^"]*)"|'([^']*)')/g;let c;for(;c=r.exec(a);)o[c[1]]=jg(c[3]??c[4]??"");return o}function Gn(a,o){const r=[],c=new RegExp(`<${o}(\\s[^>]*)?\\s*/>|<${o}(\\s[^>]*)?>`,"g");let d;for(;d=c.exec(a);){const u=d[0],g=Nk(d[1]??d[2]??"");if(u.endsWith("/>")){r.push({name:o,attrs:g,inner:""});continue}const y=d.index+u.length;let p=1;const w=new RegExp(`</${o}>|<${o}(?:\\s[^>]*)?\\s*/>|<${o}(?:\\s[^>]*)?>`,"g");w.lastIndex=y;let T=a.length,b;for(;b=w.exec(a);){const x=b[0];if(x.startsWith(`</${o}`)){if(p-=1,p===0){T=b.index,c.lastIndex=b.index+x.length;break}}else x.endsWith("/>")||(p+=1)}r.push({name:o,attrs:g,inner:a.slice(y,T)})}return r}function Ye(a,o){return Gn(a,o)[0]}function De(a,o){const r=Ye(a,o);return r?yi(r.inner):""}function Dn(a,o){return Gn(a,o).map(r=>yi(r.inner)).filter(Boolean)}function ra(a,o,r){const c=a[o],d=c?Number(c):NaN;return Number.isFinite(d)?d:r}function Cg(a){const o=Object.keys(a);return o.length===0?"":` ${o.map(r=>`${r}="${a[r].replace(/"/g,"&quot;")}"`).join(" ")}`}function Ag(a){return Ye(a,"areaPack")??Ye(a,"area")}function Ng(a){return Ye(a,"silverCityPackIndex")??Ye(a,"packIndex")??Ye(a,"index")}function Eg(a,o){const r=`${a} ${o}`.toLowerCase();if(r.includes("juniper")||r.includes("porch"))return{plotId:"porch",who:"juniper"};if(r.includes("mercy")||r.includes("creek")||r.includes("hollow"))return{plotId:"hollow",who:"mercy"};if(r.includes("silas")||r.includes("witness")||r.includes("square"))return{plotId:"bench",who:"silas"};if(r.includes("nora")||r.includes("sky watch")||r.includes("observatory"))return{plotId:"observatory",who:"nora"};if(r.includes("ansel")||r.includes("why gate"))return{plotId:"gate",who:"ansel"};if(r.includes("hope")||r.includes("ridge")||r.includes("lookout")||r.includes("meaning"))return{plotId:"lookout",who:"hope"}}function Ek(a,o,r={}){const c=Ye(a,"loci"),d=r.place||c?.attrs.place||o.place,u=r.person||c?.attrs.person||o.person,g=Eg(d,u);return{place:d,person:u,plotId:r.plotId||c?.attrs.plotId||g?.plotId||o.plotId,who:r.who||r.personId||c?.attrs.who||g?.who||o.who}}function Lk(a,o,r){const c=Ye(a,"match");return c?{sentence:De(c.inner,"sentenceCorrect")||c.attrs.sentence||De(c.inner,"sentence")||o,place:c.attrs.place||De(c.inner,"place")||r.place,person:c.attrs.person||De(c.inner,"person")||r.person}:{sentence:o,place:r.place,person:r.person}}function Hk(a,o,r,c){const d=Ye(a,"hold"),u=d?.inner??"",g=d?.attrs.levelUpTo,y=Mg(g)?g:r==="easy"?"medium":r==="medium"?"hard":void 0,p=De(u,"claim")||c,w=Ye(u,"claimChoices"),b=[...(w?Dn(w.inner,"choice"):[]).filter(I=>I&&I!==p),...Dn(u,"claimMiss"),...Gn(u,"miss").filter(I=>I.attrs.kind==="claim").map(I=>yi(I.inner))].filter(Boolean),x=Ye(u,"whyMisses"),N=[...x?Dn(x.inner,"miss"):[],...Dn(u,"whyMiss"),...Gn(u,"miss").filter(I=>I.attrs.kind==="why"||I.attrs.kind==="reason").map(I=>yi(I.inner))].filter(Boolean),z=De(u,"whyCorrect")||De(u,"reason")||De(u,"why")||o;return{levelUpTo:y,onFail:"easy",why:z,claimMisses:yd(b),whyMisses:yd(N)}}function yd(a){const o=new Set,r=[];for(const c of a)o.has(c)||(o.add(c),r.push(c));return r}function Wk(a,o,r){const d=Ye(a,"learn")?.inner??a;return o==="easy"?De(d,"shortStory")||De(d,"teach")||nd(d)||r:o==="medium"?De(d,"mediumTeach")||De(d,"teach")||nd(d)||r:De(d,"hardTeach")||De(d,"fullTeach")||De(d,"teach")||nd(d)||r}function nd(a){const o=a.replace(/<(mainIdea|gloss|loci|word|hint|prompt|teachOnWrong|challengeTiles|shortStory|mediumTeach|hardTeach|fullTeach)\b[\s\S]*?<\/\1>/gi,"");return yi(o.replace(/<[^>]+>/g," "))}function Ik(a){const r=Ye(a,"learn")?.inner??a,c=Ye(r,"word");if(!c)return;const d=De(c.inner,"term"),u=De(c.inner,"sense");if(!(!d||!u))return{term:d,sense:u}}function Rk(a){const o=Ye(a,"learn");return De(o?.inner??a,"hint")}function Lg(a,o){const r=Ye(a,"learn");return De(r?.inner??a,"gloss")||De(r?.inner??a,"mainIdea")||o}function ad(a){const r=Ye(a,"hold")?.inner??"";return{claim:De(r,"claim"),reason:De(r,"whyCorrect")||De(r,"reason"),source:De(r,"source")}}function sd(a,o,r,c,d,u){const g=Ye(a,o);if(!g)return;const y=ra(g.attrs,"points",ci[o]),p=o==="easy"?ra(g.attrs,"easyOrder",0):void 0,w=Wk(g.inner,o,d),T=Lk(g.inner,r,c),b=Hk(g.inner,u,o,r),x=Ik(g.inner),N=Rk(g.inner),z=Lg(g.inner,d);return{id:o,points:y,easyOrder:p&&p>0?p:void 0,learn:w,gloss:z,word:x,hint:N||void 0,match:T,hold:b}}function id(a,o,r,c,d,u,g){return{id:a,points:ci[a],easyOrder:a==="easy"?u:void 0,learn:c,match:{sentence:o,place:r.place,person:r.person},hold:{levelUpTo:a==="easy"?"medium":a==="medium"?"hard":void 0,onFail:"easy",why:d,claimMisses:g?.claimMisses??[],whyMisses:g?.whyMisses??[]}}}function Ok(a){const o=Ye(a,"journal");if(!o)return;const r=o.attrs.title||De(o.inner,"title"),c=o.attrs.kicker||De(o.inner,"kicker"),d=Dn(o.inner,"p"),u=d.length?d:Dn(o.inner,"body"),g=Ye(o.inner,"sources"),y=[...g?Dn(g.inner,"source"):[],...Dn(o.inner,"cite"),...g?[]:Dn(o.inner,"source")].filter(Boolean);if(!(!r&&u.length===0))return{id:o.attrs.id||void 0,title:r,kicker:c,body:u,sources:yd(y),unlockAfter:o.attrs.unlockAfter||void 0}}function qk(a,o,r){const c=a.trim().startsWith("<lesson")?a:`<lesson>${a}</lesson>`,d=Ye(c,"lesson")??{attrs:{},inner:a},u=d.attrs.id;if(!u)return;const g=Ye(d.inner,"easy"),y=Ye(d.inner,"medium"),p=Ye(d.inner,"hard"),w=ad(g?.inner??""),T=ad(y?.inner??""),b=ad(p?.inner??""),x=w.claim||T.claim||b.claim||De(d.inner,"claim")||d.attrs.ideaLabel,N=Lg(g?.inner??d.inner,""),z=De(d.inner,"plain")||N||x,I=w.source||De(d.inner,"source")||T.source||b.source,$=Ek(d.inner,r,d.attrs),X=w.reason||De(d.inner,"why")||z||x,te=ra(d.attrs,"easyOrder",0);if(!x)return;const se=sd(d.inner,"easy",x,$,z||x,X)??id("easy",x,$,z||x,X,te||void 0);se.easyOrder||(se.easyOrder=te||(g?ra(g.attrs,"easyOrder",0):0)||void 0);const oe=sd(d.inner,"medium",x,$,X||x,X)??id("medium",x,$,X||x,X,void 0,se.hold),re=sd(d.inner,"hard",x,$,X||x,X)??id("hard",x,$,X||x,X,void 0,se.hold);return{id:u,areaId:d.attrs.areaId||o,title:d.attrs.challengeTitle||d.attrs.title||d.attrs.ideaLabel||x,idea:d.attrs.ideaLabel||d.attrs.idea||void 0,claim:x,plain:z,source:I,loci:$,journal:Ok(d.inner),easy:{...se,hold:{...se.hold,onFail:"easy"}},medium:{...oe,hold:{...oe.hold,onFail:"easy"}},hard:{...re,hold:{...re.hold,onFail:"easy",levelUpTo:void 0}}}}function Dk(a,o,r={}){const c=Eg(r.place||o,r.person||"");return r.place&&r.person&&(r.plotId||r.personId||c)?{place:r.place,person:r.person,plotId:r.plotId||c?.plotId||"porch",who:r.personId||c?.who||"juniper"}:a==="parable-hollow"?{place:o||"Story Creek",person:"Mercy Wren",plotId:"hollow",who:"mercy"}:a==="witness-bench"?{place:o||"Witness Square",person:"Silas Whitman",plotId:"bench",who:"silas"}:a==="observatory"?{place:o||"Sky Watch",person:"Nora Skye",plotId:"observatory",who:"nora"}:a==="first-gate"?{place:o||"Why Gate",person:"Ansel Gate",plotId:"gate",who:"ansel"}:a==="high-lookout"?{place:o||"Meaning Ridge",person:"Hope Ridge",plotId:"lookout",who:"hope"}:{place:o||"East porch",person:"Juniper Wick",plotId:"porch",who:"juniper"}}function Pk(a,o,r=[]){const c=Ag(a);if(!c){r.push({file:o,message:"Missing <areaPack> or <area> root"});return}const d=ra(c.attrs,"schemaVersion",qa);d!==qa&&r.push({file:o,message:`Expected schemaVersion ${qa}, got ${d}`});const u=c.attrs.id||o.replace(/\.xml$/,""),g=Ye(c.inner,"meta"),y=c.attrs.title||(g?De(g.inner,"title"):"")||u,p=c.attrs.subtitle||(g?De(g.inner,"subtitle"):"")||"",w=(g?De(g.inner,"blurb"):"")||De(c.inner,"blurb")||c.attrs.blurb||"",T=Dk(u,y,c.attrs),x=Ye(c.inner,"lessons")?.inner??c.inner,N=Gn(x,"lesson").map(z=>qk(`<lesson${Cg(z.attrs)}>${z.inner}</lesson>`,u,T)).filter(z=>!!z);return N.length===0&&r.push({file:o,message:`No <lesson> elements in ${u}`}),{id:u,file:o,order:ra(c.attrs,"order",Ak[u]??0),title:y,shortTitle:c.attrs.shortTitle||y,subtitle:p,blurb:w,intro:Dn(c.inner,"intro"),icon:c.attrs.icon||"",accent:c.attrs.accent||"",lessons:N}}function Gk(a){const o=Ye(a,"easyShelf");if(!o)return[];const r=Gn(o.inner,"line").slice().sort((c,d)=>ra(c.attrs,"easyOrder",0)-ra(d.attrs,"easyOrder",0)).map(c=>c.attrs.id||yi(c.inner)).filter(Boolean);return r.length?r:(o.attrs.order||"").split(",").map(c=>c.trim()).filter(Boolean)}function zk(a,o="index.xml",r=[]){const c=Ng(a)??Ye(a,"area");if(!c)return r.push({file:o,message:"Missing pack index root"}),{schemaVersion:qa,id:"core-v0",title:"Core trail",files:[],easyShelf:[]};const d=ra(c.attrs,"schemaVersion",qa);d!==qa&&r.push({file:o,message:`Expected schemaVersion ${qa}, got ${d}`});const u=Ye(c.inner,"packs"),y=(u?Gn(u.inner,"pack"):Gn(c.inner,"area")).filter(p=>p.attrs.file).map(p=>({file:p.attrs.file,id:p.attrs.id||p.attrs.file.replace(/\.xml$/,"")})).filter(p=>p.file&&p.id);return{schemaVersion:d,id:c.attrs.id||"core-v0",title:c.attrs.title||"Core trail",files:y,easyShelf:Gk(c.inner)}}function Jk(a){const o={};for(const[r,c]of Object.entries(a))o[r.split("/").pop()??r]=c;return o}function _k(a,o){if(!o.length)return;const r=new Map(o.map((c,d)=>[c,d+1]));for(const c of a){const d=r.get(c.id);d&&(c.easy.easyOrder=d)}}function Uk(a,o=[]){const r=Jk(a),c=r["index.xml"]??"",d=zk(c,"index.xml",o),u=[],g=new Set;function y(b,x){const N=b.split("/").pop()??b,I=Ag(x)?.attrs.id??"";if(g.has(N)||I&&g.has(`id:${I}`))return;const $=Pk(x,N,o);$&&(g.add(N),g.add(`id:${$.id}`),u.push($))}const p=Ng(c);if(p)for(const b of Gn(p.inner,"area"))Gn(b.inner,"lesson").length!==0&&y(b.attrs.file||`${b.attrs.id||"east-porch"}.xml`,`<area${Cg(b.attrs)}>${b.inner}</area>`);for(const b of d.files){const x=r[b.file];if(!x){o.push({file:b.file,message:"Listed in index.xml but missing from the pack set"});continue}y(b.file,x)}for(const[b,x]of Object.entries(r))b==="index.xml"||!b.endsWith(".xml")||y(b,x);const w=u.slice().sort((b,x)=>b.order-x.order||b.id.localeCompare(x.id)).flatMap(b=>b.lessons);_k(w,d.easyShelf);const T=w.slice().sort((b,x)=>{const N=b.easy.easyOrder??999,z=x.easy.easyOrder??999;return N-z||b.id.localeCompare(x.id)});return{schemaVersion:d.schemaVersion||qa,id:d.id,title:d.title,areas:u.sort((b,x)=>b.order-x.order||b.id.localeCompare(x.id)),lessons:T}}function Bk(a){return a.lessons.filter(o=>o.easy.easyOrder).sort((o,r)=>(o.easy.easyOrder??999)-(r.easy.easyOrder??999)).map(o=>o.id)}function Fk(a,o){return a.lessons.find(r=>r.id===o)}const $k=[],No=Uk(Mk,$k);function ki(a){return Fk(No,a)}function Kk(){const a=Bk(No);return a.length?a:No.lessons.map(o=>o.id)}function Ny(a,o){const r=o.filter(c=>c&&c!==a);return[a,r[0]||`${a} — not this.`,r[1]||`${a} — a weaker reading.`]}function Hg(a,o="medium"){const r=a[o]??a.medium,c=r.hold.why||a.claim;return{id:a.id,claim:a.claim,reason:c,source:a.source,claimChoices:Ny(a.claim,r.hold.claimMisses),reasonChoices:Ny(c,r.hold.whyMisses)}}function Yk(a,o="medium"){const r=ki(a);return r?Hg(r,o):void 0}const Nt=[{id:"j-ph-1",areaId:"parable-hollow",title:"The Teacher who taught in stories",kicker:"Story Creek",unlockAfter:"ph-road",body:["The Gospels present Jesus as a teacher whose most characteristic form is the parable. These are not children’s decorations added to a lecture. They are the lecture — they force a decision about mercy, pride, and the identity of God.","The Good Samaritan (Luke 10:25–37) relocates the word “neighbor” from a boundary question to a mercy question. The listener is not first invited to classify others. The listener is invited to become the kind of person who crosses the road."],sources:["Luke 10:25–37","Luke 10:29"]},{id:"j-ph-2",areaId:"parable-hollow",title:"Mercy that runs",kicker:"Story Creek",unlockAfter:"ph-father",body:["Luke 15 stacks three lost-and-found stories after a complaint: this man welcomes sinners and eats with them. The father’s run (Luke 15:20) is the theological center of the third story. Honor is spent so that the son can be embraced before he finishes his hired-hand speech.","The older brother shows that you can live in the house and still refuse the feast. Nearness without joy at another’s return is a second lostness."],sources:["Luke 15:1–32"]},{id:"j-ph-3",areaId:"parable-hollow",title:"Seeds, search, and a trust",kicker:"Story Creek",unlockAfter:"ph-seeds",body:["Taken together, the sower, the lost sheep, the mustard seed, and the talents sketch a God who speaks, seeks, grows a kingdom from small beginnings, and will ask what was done with a trust.","That is already a case of a sort: not a syllogism, but a coherent portrait. If the portrait is true, the world is personal before it is mechanical."],sources:["Matthew 13:1–23","Matthew 13:31–32","Luke 15:1–7","Matthew 25:14–30"]},{id:"j-ph-4",areaId:"parable-hollow",title:"The measure you use",kicker:"Story Creek",unlockAfter:"ph-debt",body:["Matthew 18:21–35 is severe because grace is severe in the opposite direction from cruelty: it creates a world. To be forgiven an unpayable debt and then throttle a neighbor is to live as if the king’s mercy never happened.","Jesus teaches his disciples to pray “forgive us our debts, as we also have forgiven our debtors” (Matt 6:12). The petition assumes the same moral grain."],sources:["Matthew 18:21–35","Matthew 6:12–15"]},{id:"j-wb-1",areaId:"witness-bench",title:"Of first importance",kicker:"Witness Square",unlockAfter:"wb-creed",body:["1 Corinthians 15:3–5 is a compressed public claim: death, burial, raising, appearances. Paul presents it as received tradition, not as a private dream. Burial resists a merely “spiritual” death; appearances resist a merely “spiritual” raising.","This is what the churches were already handing on when Paul wrote — a mid-first-century letter appealing to a still-earlier formula."],sources:["1 Corinthians 15:3–8"]},{id:"j-wb-2",areaId:"witness-bench",title:"Early is not the same as easy",kicker:"Witness Square",unlockAfter:"wb-early",body:["Historians cannot rewind the world. They ask how close a report stands to the events, how formulaic it is, and whether the author is appealing to known people (Cephas, the Twelve, James, a large group, Paul himself).","Luke 1:1–4 shows another first-century Christian writer claiming the posture of inquiry among eyewitnesses. That posture can be tested. It stands to be weighed."],sources:["1 Corinthians 15:3–7","Luke 1:1–4"]},{id:"j-wb-3",areaId:"witness-bench",title:"How the past is weighed",kicker:"Witness Square",unlockAfter:"wb-method",body:["Multiple attestation, embarrassment, early testimony, and contextual credibility are ordinary tools. They do not replace reading. They resist the story that every Christian report is a late pious novel.","Used honestly, they also resist the opposite laziness: “an early creed is already a laboratory proof.” History gives testimony, not a rerun."],sources:["Standard historical method as used in ancient history and historical Jesus studies"]},{id:"j-wb-4",areaId:"witness-bench",title:"Awkward beginnings",kicker:"Witness Square",unlockAfter:"wb-women",body:["The tomb stories begin with women, and Luke records that the apostles dismissed them (Luke 24:11). That is an odd opening if the only goal is later public respectability.","Outside the Gospels, Tacitus (Annals 15.44) notes Christus executed under Pilate and a movement that spread to Rome. Josephus (Antiquities 18.63–64) is partly disputed because of later Christian touches, and honesty about that dispute belongs in the dossier."],sources:["Mark 16:1–8","Luke 24:1–11","John 20:1–18","Tacitus, Annals 15.44","Josephus, Antiquities 18.63–64"]},{id:"j-ob-1",areaId:"observatory",title:"The universe is finely tuned for life",kicker:"Sky Watch",unlockAfter:"ob-tuning",body:["The universe is finely tuned for life — that fit points to a Designer.","Life-permitting ranges are extravagantly narrow across independent parameters; design predicts a habitable cosmos, blank chance does not."],sources:["Fine-tuning of physical constants and initial conditions (e.g. cosmological constant; a low-entropy start — an initial condition, not another force dial).","Aquinas, ST I, q.2, a.3 (Fifth Way); Psalm 19; Romans 1","Robin Collins, The Fine-Tuning Design Argument"]},{id:"j-ob-2",areaId:"observatory",title:"A mind that intended a habitable world",kicker:"Sky Watch",unlockAfter:"ob-design",body:["Fine-tuning is best explained by a mind that intended a habitable world.","Life-permitting ranges are extravagantly narrow; a Designer who wants observers leads us to expect that fit — blank indifference does not."],sources:["Likelihood / fine-tuning arguments (Collins). A low-entropy start is an initial condition, not another force dial.","Aquinas, ST I, q.2, a.3 (Fifth Way); Psalm 19; Romans 1"]},{id:"j-ob-3",areaId:"observatory",title:"The question beneath physics",kicker:"Sky Watch",unlockAfter:"ob-leibniz",body:["Leibniz’s question — why is there something rather than nothing? — is not retired by a successful cosmological model. Models describe a world that is already given.","When popular writing says the universe came from “nothing,” check whether the word still names a vacuum, a law, or a formalism. Those are somethings. The metaphysical question remains on the table."],sources:["Leibniz, “On the Ultimate Origination of Things”","Standard distinction between physical vacua and metaphysical nothing"]},{id:"j-ob-4",areaId:"observatory",title:"Life’s open threshold",kicker:"Sky Watch",unlockAfter:"ob-life",body:["Life’s specified information is a mark of mind. Cells require coordinated function. That is not a rumor; it is biology.","Treat the unfinished story as a place for wonder and for more work — and as a mark of mind. Do not stop the lab. Do not shrug the information away."],sources:["Contemporary abiogenesis research as an open program","Genesis 1 as theological, not a lab protocol"]},{id:"j-fg-1",areaId:"first-gate",title:"Unmoved mover",kicker:"Why Gate",unlockAfter:"fg-mover",body:["Aristotle and Aquinas begin with change: the everyday passage from potential to actual. If nothing explains its own becoming, and a stack of unexplained becomings is not an explanation, then there is a first actuality that is not itself a receiver of change.","Read “first” as the bottom of the explanation, not merely the earliest date on a calendar. That is why the argument can be aimed at the present cosmos, not only at a first Tuesday."],sources:["Aristotle, Physics VIII; Metaphysics XII","Aquinas, Summa Theologiae I, q.2, a.3 (First Way)"]},{id:"j-fg-2",areaId:"first-gate",title:"Necessary being",kicker:"Why Gate",unlockAfter:"fg-contingent",body:["Contingent things exist. A world made only of “might-not-have-beens” does not contain the reason why there is anything. Classical theism names the necessary ground God.","Rivals relocate necessity into the universe, or they accept a brute fact. Those are intelligible moves. They are not automatically cheaper. “It just is” is also a metaphysics."],sources:["Aquinas, ST I, q.2, a.3 (Third Way)","Leibniz on sufficient reason"]},{id:"j-fg-3",areaId:"first-gate",title:"Beginning and cause",kicker:"Why Gate",unlockAfter:"fg-kalam",body:["The kalām form is clean: what begins has a cause; the universe began; therefore it has a cause. The second premise is argued from the impossibility of an infinite past and from the cosmos we actually observe.","That yields a cause of the beginning. Personhood, goodness, and the name of the God of Abraham are further questions — some of them historical."],sources:["Philoponus against an eternal world","al-Ghazālī and the kalām tradition","Craig’s modern statement of the kalām syllogism"]},{id:"j-fg-4",areaId:"first-gate",title:"Honest limits",kicker:"Why Gate",unlockAfter:"fg-limits",body:["A sound cosmological argument is already a great deal. It is not yet the sermon on the mount, and it does not need to be. Aquinas does not stop at the Five Ways; he argues onward. The New Testament adds public claims about a particular life, death, and raising.","Pascal’s warning about the God of the philosophers is a warning against stopping. It is not a command to skip the philosophers."],sources:["Aquinas, ST I, qq.2–26 (existence toward attributes)","Pascal, Pensées (God of Abraham / philosophers)"]},{id:"j-hl-1",areaId:"high-lookout",title:"The moral grain of the world",kicker:"Meaning Ridge",unlockAfter:"hl-moral",body:["Duty presents itself as more than taste. A good God is the ground of a good law — the home that fits. Romans 2 treats that knowledge as widely shared, which is why injustice still has a name.","Romans 2:14–15 treats moral knowledge as widely shared. That is why strangers can still accuse one another of injustice and expect the accusation to mean something."],sources:["Romans 2:14–15","Aquinas, ST I-II, q.91","Augustine, City of God XIX"]},{id:"j-hl-2",areaId:"high-lookout",title:"The inside of mind",kicker:"Meaning Ridge",unlockAfter:"hl-mind",body:["Qualia, aboutness, the hard problem, and the norm of reason are not parlor tricks. They are what it is like to be a knower. A story of the world that cannot find a home for mind is a story that cannot find a home for the storyteller.","A living God is the home of mind: not an accident at the end of an indifferent process, but present at the beginning."],sources:["Augustine, De Trinitate X","John 1:1–4","Classical theism on God as living intellect"]},{id:"j-hl-3",areaId:"high-lookout",title:"Meaning that can be found",kicker:"Meaning Ridge",unlockAfter:"hl-meaning",body:["You can build a local meaning without naming God. The lookout asks whether that meaning is only assembled, or also received — whether the hunger for a final good has an object.","Ecclesiastes refuses to let work and pleasure pretend to be the final good, and also refuses to call them worthless as gifts. That double honesty is part of biblical wisdom."],sources:["Ecclesiastes 2:24; 9:7–10; 12:13"]},{id:"j-hl-4",areaId:"high-lookout",title:"Beauty as a signpost",kicker:"Meaning Ridge",unlockAfter:"hl-beauty",body:["Beauty wakes a hunger it cannot feed — longing for a country the sunset cannot give. Hungers like that usually correspond to real countries.","Psalm 19 treats the sky as speech. The observatory and the lookout are the same ridge at two hours of the day: measurement at dusk, longing after dark. The trail is unending because the object, if real, is not smaller than a game."],sources:["C. S. Lewis, “The Weight of Glory”; Surprised by Joy","Psalm 19:1–4"]},{id:"j-trail-1",areaId:"daily-trail",title:"First frost on the rail",kicker:"Daily Trail",unlockAfter:"trail-days-1",body:["You walked a morning that will not come again. The town keeps a small mark for that — not a trophy, a thank-you.","The trail will be here tomorrow. If you are away, it waits. Nothing you have already gathered is taken back."],sources:["A return gift for a single morning on the trail"]},{id:"j-trail-2",areaId:"daily-trail",title:"A second lantern",kicker:"Daily Trail",unlockAfter:"trail-days-2",body:["Two distinct mornings. The path is starting to know your step. Nothing is owed; the bench is still free."],sources:["A trail note for a second return"]},{id:"j-trail-3",areaId:"daily-trail",title:"Margin note from the clerk",kicker:"Daily Trail",unlockAfter:"trail-days-3",body:["Three distinct days on the trail. The archive clerk left this: “Return is a kind of courage.”"],sources:["A trail note for three unique mornings"]},{id:"j-trail-5",areaId:"daily-trail",title:"Five weather reports",kicker:"Daily Trail",unlockAfter:"trail-days-5",body:["Five different skies. The town does not scold the days you were away. It only saves a page for when you are here."],sources:["A trail note for five unique mornings"]},{id:"j-trail-7",areaId:"daily-trail",title:"A week of porches",kicker:"Daily Trail",unlockAfter:"trail-days-7",body:["Seven unique mornings. If you miss tomorrow, the trail waits. The marks you already made stay in the journal."],sources:["A trail note for seven unique mornings"]}];for(const a of No.lessons){const o=a.journal;if(!o?.body.length)continue;const r=Nt.find(c=>c.unlockAfter===a.id||c.id===o.id);r&&(o.title&&(r.title=o.title),o.kicker&&(r.kicker=o.kicker),r.body=o.body,o.sources.length&&(r.sources=o.sources))}const Wg={id:"observatory",order:3,title:"Sky Watch",shortTitle:"Sky",subtitle:"A sky that did not have to be this way",blurb:"Science maps how the world runs. It does not forbid the question why.",intro:["Above the ridge a small observatory points at winter stars. The question here is not “Does a lab experiment prove God?” That would confuse the tools.","The question is: what kind of universe is this? Why are its laws hospitable to life? Why is there a concrete world with laws at all?","Fine-tuning, origins, and “something rather than nothing” begin from public facts and make a case for God. Hold the claim. Deploy it. The sky is not a shrug."],icon:"star",accent:"#7f9ec7",challenges:[{kind:"match",id:"ob-tuning",title:"Narrow ranges",idea:"the universe is finely tuned for life — that fit points to a Designer",prompt:"Tap a picture, then the mark that belongs. Two choices at a time.",context:"The universe is finely tuned for life — that fit points to a Designer. Life-permitting ranges are extravagantly narrow across independent parameters; design predicts a habitable cosmos, blank chance does not. Necessity, chance (often a multiverse — asserted to cancel the surprise — no evidence), or design: the fit still points to a Designer.",pairs:[{id:"lambda",gem:"star",scene:"expand",left:"Cosmological constant",right:"Much larger: expansion too fierce for galaxies; much more negative: recollapse"},{id:"strong",gem:"coin",scene:"bind",left:"Strong nuclear force",right:"Slight shift: familiar chemistry of hydrogen and heavier elements fails"},{id:"entropy",gem:"seed",scene:"tidy",left:"Early-universe entropy",right:"The initial low-entropy state is extravagantly special — an initial condition, not another force dial"},{id:"ratio",gem:"lamp",scene:"dial",left:"Gravity vs. electromagnetism",right:"Stars, long-lived structure, and chemistry sit in a delicate balance"}],teachOnWrong:"Ask what breaks if the number moves. Those extravagantly narrow, habitable ranges are the mark of a Designer.",deeper:"Design predicts this cosmos: cosmological constant, nuclear binding, a low-entropy start, gravity against electromagnetism — extravagantly narrow, habitable. That fit points to a Designer."},{kind:"build-argument",id:"ob-design",title:"A habitable cosmos",idea:"fine-tuning is best explained by a mind that intended a habitable world",prompt:"Place the next stone. Two choices. Leave the overclaims.",context:"Fine-tuning is best explained by a mind that intended a habitable world. Life-permitting ranges are extravagantly narrow; a Designer who wants observers leads us to expect that fit — blank indifference does not. Necessity, chance (often a multiverse — asserted to cancel the surprise — no evidence), or design: hold the Designer.",slots:[{id:"p1",role:"premise",label:"Premise 1",correctCardId:"narrow"},{id:"p2",role:"premise",label:"Premise 2",correctCardId:"surprise"},{id:"p3",role:"premise",label:"Premise 3",correctCardId:"expect"},{id:"c",role:"conclusion",label:"Conclusion",correctCardId:"live"}],cards:[{id:"narrow",text:"Several physical dials appear to have a life-permitting range that is extraordinarily narrow among conceivable values."},{id:"surprise",text:"That narrowness is surprising if the dials are a brute accident with no further explanation."},{id:"expect",text:"A mind that intended a habitable cosmos would lead us to expect such dials."},{id:"live",text:"Therefore the best explanation is a Designer who intended a habitable cosmos."},{id:"lab",text:"Therefore a laboratory has now measured God directly.",distractor:!0},{id:"which",text:"Therefore this proves which religious tradition is true in every detail.",distractor:!0}],teachOnWrong:"Leave the two overclaims. The narrow habitable fit lands a Designer, not which gospel.",deeper:"A Designer who wants observers predicts this habitable fit. The narrow ranges are the evidence. Hold the Designer."},{kind:"sort",id:"ob-leibniz",title:"Something rather than nothing",idea:"physics maps how the world runs; it does not finish why",prompt:"Keep the careful Leibniz reading. Toss the rest — a wrong toss bounces back.",context:"Leibniz: why is there something rather than nothing? The Big Bang describes an early hot state — not automatically absolute nothing.",keepLabel:"Keep",discardLabel:"Toss",tiles:[{id:"a",text:"Physics can map how this universe evolves; it does not by itself say why there is a concrete reality with laws.",bin:"keep"},{id:"b",text:"The Big Bang is a video of God creating, timestamped in Genesis.",bin:"discard"},{id:"c",text:"A wave function of the universe makes “why anything?” meaningless.",bin:"discard"},{id:"d",text:"In physics papers, “nothing” already means absolute non-being — a free lunch.",bin:"discard"}],teachOnWrong:"A vacuum is already a structured something. Equations describe a world that is already there.",deeper:"Fine-tuning and “why anything?” are siblings, not twins. One asks why this world’s numbers permit us; the other asks why there is a world."},{kind:"sort",id:"ob-life",title:"The threshold of life",idea:"life’s specified information is a mark of mind",prompt:"Keep the careful statement. Toss the gaps — a wrong toss bounces back.",context:"Cells store specified information and run a coordinated metabolism. Abiogenesis is an open research program — not a closed chapter.",keepLabel:"Keep",discardLabel:"Toss",tiles:[{id:"a",text:"“No complete naturalistic account yet” is not the same as “we demonstrated a miracle.”",bin:"keep"},{id:"b",text:"Because we cannot assemble a cell in a storm, theism is proven and research is irreverent.",bin:"discard"},{id:"c",text:"Because research continues, the chemical pathway is finished and the question is closed.",bin:"discard"},{id:"d",text:"Genesis 1 forbids asking biological questions.",bin:"discard"}],teachOnWrong:"Wonder is rational here. So is more work. “God of the gaps” and “science of the gaps” both tempt us.",deeper:"Life’s information looks like the work of mind. Wonder is rational. So is more work. Do not trade the mark for a shrug."}]},Ig={id:"parable-hollow",order:1,title:"Story Creek",shortTitle:"Creek",subtitle:"Jesus stories that stick",blurb:"The Teacher spoke in pictures — not to hide the truth, but to make it move.",intro:["A creek path, oaks, and pictures you can hold: a road, a table, a lost coin in the dust.","Jesus taught in pictures. Play them. Then keep one true line."],icon:"oak",accent:"#6b8f71",challenges:[{kind:"sequence",id:"ph-road",title:"The Good Samaritan",idea:"neighbor is the one who shows mercy",prompt:"Place the Good Samaritan in the order Luke tells it.",context:"Luke 10:25–37. A lawyer asks, “Who is my neighbor?” Jesus answers with a story set on the Jerusalem–Jericho road — a real, dangerous descent.",items:[{id:"a",gem:"cup",text:"A lawyer asks Jesus, “And who is my neighbor?”"},{id:"b",gem:"heart",text:"A man is beaten and left half-dead on the road."},{id:"c",gem:"door",text:"A priest and then a Levite see him and pass by."},{id:"d",gem:"lamp",text:"Moved with compassion, a Samaritan binds the wounds, takes him to an inn, and pays."},{id:"e",gem:"star",text:"Jesus: “Go and do likewise.”"}],teachOnWrong:"Luke’s force depends on order: religious insiders fail first; the unexpected outsider becomes the measure of neighbor-love. Try again.",deeper:"Samaritans and Judeans were divided by worship and memory (see John 4:9). Jesus flips the question (Luke 10:36): mercy proves who the neighbor is. He makes the listener identify with the wounded man — and then with costly mercy."},{kind:"sort",id:"ph-father",title:"The father’s run",idea:"the father runs before the apology is finished",prompt:"Toss the weak readings. Keep what Luke 15 is actually pressing.",context:"Luke 15:11–32. In that world a patriarch running was undignified. The father runs before the son finishes his hired-hand speech.",keepLabel:"Keep",discardLabel:"Toss",tiles:[{id:"a",gem:"heart",text:"The father runs with mercy — before the speech is done.",bin:"keep"},{id:"b",gem:"coin",text:"The son earned the feast by writing a good apology.",bin:"discard"},{id:"c",gem:"star",text:"The older brother is the hero simply for staying home.",bin:"discard"},{id:"d",gem:"door",text:"The story is mainly about estate planning.",bin:"discard"}],teachOnWrong:"Grace arrives before the speech is done (Luke 15:20). The older brother is dutiful — and furious at mercy. Try the bins again.",deeper:"Luke 15 stacks three lost-and-found stories. God is not only willing to receive. God seeks. The feast is the Father’s idea."},{kind:"match",id:"ph-seeds",title:"Pictures of the kingdom",idea:"the kingdom arrives in pictures, not slogans",prompt:"Match each parable to the claim it is actually making.",context:"These are among the most-attested teachings in the Synoptic Gospels. A parable can have one main thrust — resist turning every detail into an allegory.",pairs:[{id:"sower",gem:"seed",left:"The sower",right:"Same word, different hearts"},{id:"sheep",gem:"heart",left:"Lost sheep",right:"The one is sought"},{id:"mustard",gem:"tree",left:"Mustard seed",right:"Small start, later shelter"},{id:"talents",gem:"coin",left:"The talents",right:"Use the trust; don’t bury it"}],teachOnWrong:"Look again at the main action of each story — soil, search, growth, or stewardship — rather than a moral you already liked.",deeper:"Jesus’ stories assume a God who speaks, seeks, grows a kingdom, and will ask what we did with a trust. They are not proofs. They are a portrait — and a demand."},{kind:"sort",id:"ph-debt",title:"An unpayable account",idea:"received mercy makes refusing mercy a contradiction",prompt:"Sort the claims. Only one belongs in the keep bin.",context:"Matthew 18:21–35. A servant forgiven an unpayable debt then throttles a peer over a small sum. The king reinstates the first debt.",keepLabel:"Keep",discardLabel:"Toss",tiles:[{id:"a",gem:"cup",text:"Received mercy makes refusing mercy a contradiction.",bin:"keep"},{id:"b",gem:"coin",text:"Forgiveness is a limited coupon on God’s spreadsheet.",bin:"discard"},{id:"c",gem:"door",text:"The first servant was right to demand prison for a small debt.",bin:"discard"},{id:"d",gem:"star",text:"Jesus is only reforming first-century banking.",bin:"discard"}],teachOnWrong:"Peter offered seven. Jesus breaks coupon-logic (Matt 18:22). The horror is ingratitude, not arithmetic.",deeper:"Mercy is not softness. It is the grain of God’s world — and then a question: will you live against that grain? See also Matt 6:12–15."}]},Rg={id:"witness-bench",order:2,title:"Witness Square",shortTitle:"Witness",subtitle:"What can we know about events we did not see?",blurb:"Historians cannot rerun the past. They weigh sources, time, and motive.",intro:["The old courthouse still faces the square. On the bench, the question is not “Can I feel this?” but “What kind of testimony is this, and what would a fair historian do with it?”","Christian faith is not only inward. It makes a public claim: Jesus of Nazareth died, was buried, and was reported alive by people who said they had seen him.","These challenges teach method as much as conclusion. Early, multiple, and costly testimony is not a laboratory proof — it is the kind of evidence history actually has."],icon:"scroll",accent:"#c4a35a",challenges:[{kind:"sequence",id:"wb-creed",title:"What Paul received",idea:"died, buried, raised, appeared — in that order",prompt:"Order the core of the tradition Paul says he “delivered” and “received.”",context:"1 Corinthians 15:3–5. Paul is writing to a church he founded, likely in the mid-50s AD. He presents this not as a new idea but as a received formula “of first importance.”",items:[{id:"a",text:"Christ died for our sins according to the Scriptures."},{id:"b",text:"He was buried."},{id:"c",text:"He was raised on the third day according to the Scriptures."},{id:"d",text:"He appeared to Cephas, then to the Twelve."}],teachOnWrong:"Paul’s wording is tightly patterned: death, burial, raising, appearances (1 Cor 15:3–5). Burial underlines that death was real; appearances underlines that “raised” is not only a metaphor.",deeper:"Verses 6–8 widen the circle: more than five hundred, James, “all the apostles,” and last of all Paul. A creed is not a video. It is a public, early summary of what the churches were already saying."},{kind:"sort",id:"wb-early",title:"Why historians call it early",idea:"the creed is early testimony, not a medieval insert",prompt:"Keep the careful historical claim. Toss the overclaims.",context:"1 Corinthians 15:3–5. Paul “received” and “delivered” the early core — died, buried, raised, appeared.",keepLabel:"Keep",discardLabel:"Toss",tiles:[{id:"a",text:"Paul “received” and “delivered” the early core: died, buried, raised, appeared (1 Cor 15:3–5).",bin:"keep"},{id:"b",text:"A medieval monk wrote the creed and copied it into Paul.",bin:"discard"},{id:"c",text:"The creed is a lab result that proves the resurrection like a chemical reaction.",bin:"discard"},{id:"d",text:"Paul invented the list in the second century after the Gospels.",bin:"discard"}],teachOnWrong:"The letter is mid-first-century. “I received / I delivered” is tradition language — weighty testimony, not a lab rerun.",deeper:"Compare Luke 1:1–4: a first-century writer claiming inquiry among eyewitnesses. That posture can be tested. It stands to be weighed."},{kind:"match",id:"wb-method",title:"Tools of the ancient historian",idea:"historians weigh sources; they cannot rerun the past",prompt:"Match each criterion to what it is actually testing.",context:"Used in historical Jesus research (and ancient history more broadly). These tools show which reports are hard to dismiss as late invention — early public testimony, not a lab rerun.",pairs:[{id:"multi",gem:"star",scene:"witnesses",left:"Multiple attestation",right:"Independent sources carrying the same core"},{id:"emb",gem:"coin",scene:"reluctant",left:"Embarrassment",right:"Details early Christians would be unlikely to invent"},{id:"early",gem:"lamp",scene:"clock",left:"Early testimony",right:"Closer in time, less room for legend to harden"},{id:"context",gem:"tree",scene:"judea",left:"Contextual credibility",right:"Fits the known first-century Jewish and Roman world"}],teachOnWrong:"Each tool answers a different question: how many streams, how awkward, how soon, how at-home in the period. Try pairing again.",deeper:"These criteria can be overused. They do not replace reading texts as wholes. They do resist a lazy story: “Someone, somewhere, made everything up much later.”"},{kind:"sort",id:"wb-women",title:"Idle talk",idea:"women as first witnesses is an awkward detail to invent",prompt:"Keep the careful historical move. Toss the overclaims.",context:"Women are first at the tomb (Mark 16:1–8; Luke 24:1–11; John 20). Luke 24:11: the report sounded like “idle talk.”",keepLabel:"Keep",discardLabel:"Toss",tiles:[{id:"a",text:"An inventor hunting courtroom credibility would more likely lead with respected men.",bin:"keep"},{id:"b",text:"Named women automatically make every detail certain.",bin:"discard"},{id:"c",text:"Luke 24:11 means the evangelists wanted readers to distrust women.",bin:"discard"},{id:"d",text:"Tacitus wrote the tomb story in Annals 15.44.",bin:"discard"}],teachOnWrong:"This is a costly detail that counts for the report’s honesty. Tacitus 15.44 notes the execution, not the tomb. Do not invent citations.",deeper:"Josephus, Antiquities 18.63–64, is partly disputed because of later Christian touches. Honesty about that dispute belongs in the dossier."}]},vl=[{version:"1.4.55",title:"Easy Match gems · Easy core loop",when:"2026-09-14",items:["Easy Match is a gem word-search: swipe candy letter gems to find today’s person, place, and idea words from the lesson","Finding a word explodes those gems — tile clear, flash, particles. Miss recovery names the word to try, not a dead end","MATCHED! is a badge, not a tappable gold pill — Hold next is the primary tap","Learn → Match → Hold still starts at Mercy / Story Creek. Night Watch and Town stay hidden on Easy","Easy Learn short story drops the gold card frame around the whole block — story, main idea, person, and place sit on the page. Continue and Skip reading stay. The Story Creek chip stays a small chip.","Learn → Match → Hold copy loads from per-area XML packs (one file per street plus the porch index)","Full CoS harvest packs: Easy short story, Medium and Hard teach, Hold 10 / 12 / 15 — father-run Easy short story stays locked verbatim","Easy trail: all 35 facts in easyOrder","Easy Learn → Match → Hold still starts at Mercy / Story Creek and stays mercy-first — father-run before creed","Medium and Hard tiers; Hold levels up Easy → Medium → Hard; fail returns that idea to Easy","Journal scores best tier 10 / 12 / 15 per idea and shows the score on the page","Hard teach may go deeper; the held claim stays the same plain line on every tier","Hard tonight’s street is still all 35 facts, paced ~one place / 3–5 facts per sitting","Hold Done footer is glass over the card — not an opaque black slab","Match Hold next and other sticky CTA docks share the same translucent chrome","Easy Match win: MATCHED! is a badge, not a tappable gold pill — Hold next is the primary tap","Hard Match and street win stamps use the same juice — not a fake button","Easy after Hold: gold CTA is Read today’s story — next Learn, not Hold","Easy Match sentence matches the held claim — Neighbor is the one who shows mercy","Mercy Match place and person prompts differ for the road, the father-run, and the debt","Jericho-road Match art stays on the neighbor-road tile — not a distractor on other lines","Hold why chips keep choke on the true debt line — the miss is He was right to refuse mercy","Hard tonight’s street: ~one place / 3–5 facts per sitting, saved mid-street, Continue from Town","Hard after a sitting: Continue tonight’s street is the gold Town CTA — Walk today’s trail stays available, not the main next tap","Full Hard street — all game facts","Hard Link the street now matches every claim · reason · source fact to a place and person. Night Watch Love how-to and trail thank-you cards stay off the street.","Easy Fun: mercy-first until held on Easy","Cold Easy Learn → Match → Hold starts at Story Creek with Mercy — Neighbor is the one who shows mercy. After Mercy is Easy-held, the next Learn is the father-run — not a creed jump. Hard or older held, completed, or taught lines do not skip Mercy.","Settings → Reset this walk starts Easy at Mercy’s Story Creek line.","Easy Fun: one lesson loop, leaner Match, less Hold clutter","Easy Learn → Match → Hold stays on one line’s triad. If Learn taught the father-run, Match and Hold that same line. If mercy/Mercy/Story Creek, stay on mercy. No mid-loop lesson jump.","Easy: Learn before Match (teach-before-test)","Easy home is Learn → Match → Hold. Read the story first. Match stays locked until that teach. After Learn, Match is the clear tap. After a Match win, Hold next.","First Learn teaches the story plus who keeps it and where it lives — idea, person, and place. Then Match asks that same sentence ↔ place ↔ person.","Easy Match cuts the Next screens between steps. Three picks, then Hold next or Home. A miss still says Wrong. Tap this one: … and names the card.","Easy Match stop + shorter Hold why chips for Plain 5/5","Easy Hold why-chips stay short. Luke 10: First the hurt man, then help. Luke 15: The father hugs him first. Hold prompts stay Tap the line you kept. then Tap why this is true.","Hold practice hides the saved-line queue so it does not feel like a filing cabinet.","Easy: Night Watch fully hidden until Match→Hold solid","Town (soon) waits under Settings → More. Night Watch stays on Hard.","Night Watch Love line is tool how-to, not a claim. Luke 10 split: Love names the tool (v27). Compassion is the Samaritan’s move (v33). The held claim stays Neighbor is the one who shows mercy (v36–37).","Night Watch miss says Wrong — tap the glowing face, so locked tools do not look like the task.","Easy Night Watch still finishes at 6/6.","Place titles stay Story Creek, Witness Square, Sky Watch, Why Gate, Meaning Ridge.","daily-stars stays pure positive — heavens speak of a Maker. No multiverse lecture."]},{version:"1.4.54",title:"Easy Learn chrome · Easy core loop",when:"2026-09-14",items:["Easy Learn short story drops the gold card frame around the whole block — story, main idea, person, and place sit on the page. Continue and Skip reading stay. The Story Creek chip stays a small chip.","Learn → Match → Hold copy loads from per-area XML packs (one file per street plus the porch index)","Full CoS harvest packs: Easy short story, Medium and Hard teach, Hold 10 / 12 / 15 — father-run Easy short story stays locked verbatim","Easy trail: all 35 facts in easyOrder","Easy Learn → Match → Hold still starts at Mercy / Story Creek and stays mercy-first — father-run before creed","Medium and Hard tiers; Hold levels up Easy → Medium → Hard; fail returns that idea to Easy","Journal scores best tier 10 / 12 / 15 per idea and shows the score on the page","Hard teach may go deeper; the held claim stays the same plain line on every tier","Hard tonight’s street is still all 35 facts, paced ~one place / 3–5 facts per sitting","Hold Done footer is glass over the card — not an opaque black slab","Match Hold next and other sticky CTA docks share the same translucent chrome","Easy Match win: MATCHED! is a badge, not a tappable gold pill — Hold next is the primary tap","Hard Match and street win stamps use the same juice — not a fake button","Easy after Hold: gold CTA is Read today’s story — next Learn, not Hold","Easy Match sentence matches the held claim — Neighbor is the one who shows mercy","Mercy Match place and person prompts differ for the road, the father-run, and the debt","Jericho-road Match art stays on the neighbor-road tile — not a distractor on other lines","Hold why chips keep choke on the true debt line — the miss is He was right to refuse mercy","Hard tonight’s street: ~one place / 3–5 facts per sitting, saved mid-street, Continue from Town","Hard after a sitting: Continue tonight’s street is the gold Town CTA — Walk today’s trail stays available, not the main next tap","Full Hard street — all game facts","Hard Link the street now matches every claim · reason · source fact to a place and person. Night Watch Love how-to and trail thank-you cards stay off the street.","Easy Fun: mercy-first until held on Easy","Cold Easy Learn → Match → Hold starts at Story Creek with Mercy — Neighbor is the one who shows mercy. After Mercy is Easy-held, the next Learn is the father-run — not a creed jump. Hard or older held, completed, or taught lines do not skip Mercy.","Settings → Reset this walk starts Easy at Mercy’s Story Creek line.","Easy Fun: one lesson loop, leaner Match, less Hold clutter","Easy Learn → Match → Hold stays on one line’s triad. If Learn taught the father-run, Match and Hold that same line. If mercy/Mercy/Story Creek, stay on mercy. No mid-loop lesson jump.","Easy: Learn before Match (teach-before-test)","Easy home is Learn → Match → Hold. Read the story first. Match stays locked until that teach. After Learn, Match is the clear tap. After a Match win, Hold next.","First Learn teaches the story plus who keeps it and where it lives — idea, person, and place. Then Match asks that same sentence ↔ place ↔ person.","Easy Match cuts the Next screens between steps. Three picks, then Hold next or Home. A miss still says Wrong. Tap this one: … and names the card.","Easy Match stop + shorter Hold why chips for Plain 5/5","Easy Hold why-chips stay short. Luke 10: First the hurt man, then help. Luke 15: The father hugs him first. Hold prompts stay Tap the line you kept. then Tap why this is true.","Hold practice hides the saved-line queue so it does not feel like a filing cabinet.","Easy: Night Watch fully hidden until Match→Hold solid","Town (soon) waits under Settings → More. Night Watch stays on Hard.","Night Watch Love line is tool how-to, not a claim. Luke 10 split: Love names the tool (v27). Compassion is the Samaritan’s move (v33). The held claim stays Neighbor is the one who shows mercy (v36–37).","Night Watch miss says Wrong — tap the glowing face, so locked tools do not look like the task.","Easy Night Watch still finishes at 6/6.","Place titles stay Story Creek, Witness Square, Sky Watch, Why Gate, Meaning Ridge.","daily-stars stays pure positive — heavens speak of a Maker. No multiverse lecture."]},{version:"1.4.53",title:"XML packs · Easy core loop · Medium and Hard Hold",when:"2026-09-14",items:["Learn → Match → Hold copy loads from per-area XML packs (one file per street plus the porch index)","Full CoS harvest packs: Easy short story, Medium and Hard teach, Hold 10 / 12 / 15 — father-run Easy short story stays locked verbatim","Easy trail: all 35 facts in easyOrder","Easy Learn → Match → Hold still starts at Mercy / Story Creek and stays mercy-first — father-run before creed","Medium and Hard tiers; Hold levels up Easy → Medium → Hard; fail returns that idea to Easy","Journal scores best tier 10 / 12 / 15 per idea and shows the score on the page","Hard teach may go deeper; the held claim stays the same plain line on every tier","Hard tonight’s street is still all 35 facts, paced ~one place / 3–5 facts per sitting","Hold Done footer is glass over the card — not an opaque black slab","Match Hold next and other sticky CTA docks share the same translucent chrome","Easy Match win: MATCHED! is a badge, not a tappable gold pill — Hold next is the primary tap","Hard Match and street win stamps use the same juice — not a fake button","Easy after Hold: gold CTA is Read today’s story — next Learn, not Hold","Easy Match sentence matches the held claim — Neighbor is the one who shows mercy","Mercy Match place and person prompts differ for the road, the father-run, and the debt","Jericho-road Match art stays on the neighbor-road tile — not a distractor on other lines","Hold why chips keep choke on the true debt line — the miss is He was right to refuse mercy","Hard tonight’s street: ~one place / 3–5 facts per sitting, saved mid-street, Continue from Town","Hard after a sitting: Continue tonight’s street is the gold Town CTA — Walk today’s trail stays available, not the main next tap","Full Hard street — all game facts","Hard Link the street now matches every claim · reason · source fact to a place and person. Night Watch Love how-to and trail thank-you cards stay off the street.","Easy Fun: mercy-first until held on Easy","Cold Easy Learn → Match → Hold starts at Story Creek with Mercy — Neighbor is the one who shows mercy. After Mercy is Easy-held, the next Learn is the father-run — not a creed jump. Hard or older held, completed, or taught lines do not skip Mercy.","Settings → Reset this walk starts Easy at Mercy’s Story Creek line.","Easy Fun: one lesson loop, leaner Match, less Hold clutter","Easy Learn → Match → Hold stays on one line’s triad. If Learn taught the father-run, Match and Hold that same line. If mercy/Mercy/Story Creek, stay on mercy. No mid-loop lesson jump.","Easy: Learn before Match (teach-before-test)","Easy home is Learn → Match → Hold. Read the story first. Match stays locked until that teach. After Learn, Match is the clear tap. After a Match win, Hold next.","First Learn teaches the story plus who keeps it and where it lives — idea, person, and place. Then Match asks that same sentence ↔ place ↔ person.","Easy Match cuts the Next screens between steps. Three picks, then Hold next or Home. A miss still says Wrong. Tap this one: … and names the card.","Easy Match stop + shorter Hold why chips for Plain 5/5","Easy Hold why-chips stay short. Luke 10: First the hurt man, then help. Luke 15: The father hugs him first. Hold prompts stay Tap the line you kept. then Tap why this is true.","Hold practice hides the saved-line queue so it does not feel like a filing cabinet.","Easy: Night Watch fully hidden until Match→Hold solid","Town (soon) waits under Settings → More. Night Watch stays on Hard.","Night Watch Love line is tool how-to, not a claim. Luke 10 split: Love names the tool (v27). Compassion is the Samaritan’s move (v33). The held claim stays Neighbor is the one who shows mercy (v36–37).","Night Watch miss says Wrong — tap the glowing face, so locked tools do not look like the task.","Easy Night Watch still finishes at 6/6.","Place titles stay Story Creek, Witness Square, Sky Watch, Why Gate, Meaning Ridge.","daily-stars stays pure positive — heavens speak of a Maker. No multiverse lecture."]},{version:"1.4.52",title:"Fun polish · Easy core loop · glass Hold CTA",when:"2026-09-14",items:["Hold Done footer is glass over the card — not an opaque black slab","Match Hold next and other sticky CTA docks share the same translucent chrome","Easy Match win: MATCHED! is a badge, not a tappable gold pill — Hold next is the primary tap","Hard Match and street win stamps use the same juice — not a fake button","Easy after Hold: gold CTA is Read today’s story — next Learn, not Hold","Easy Match sentence matches the held claim — Neighbor is the one who shows mercy","Mercy Match place and person prompts differ for the road, the father-run, and the debt","Jericho-road Match art stays on the neighbor-road tile — not a distractor on other lines","Hold why chips keep choke on the true debt line — the miss is He was right to refuse mercy","Hard tonight’s street: ~one place / 3–5 facts per sitting, saved mid-street, Continue from Town","Hard after a sitting: Continue tonight’s street is the gold Town CTA — Walk today’s trail stays available, not the main next tap","Full Hard street — all game facts","Hard Link the street now matches every claim · reason · source fact to a place and person. Night Watch Love how-to and trail thank-you cards stay off the street.","Easy lesson pack: 9 Learn→Match→Hold lines","Easy Fun: mercy-first until held on Easy","Cold Easy Learn → Match → Hold starts at Story Creek with Mercy — Neighbor is the one who shows mercy. After Mercy is Easy-held, the next Learn is the father-run — not a creed jump. Hard or older held, completed, or taught lines do not skip Mercy.","easyLoopLine only counts Easy-taught and Easy-held markers, in order mercy → father → debt → creed → women → lantern → stars → cosmos → moral.","Settings → Reset this walk starts Easy at Mercy’s Story Creek line.","Easy Fun: one lesson loop, leaner Match, less Hold clutter","Easy Learn → Match → Hold stays on one line’s triad. If Learn taught the father-run, Match and Hold that same line. If mercy/Mercy/Story Creek, stay on mercy. No mid-loop lesson jump.","Easy: Learn before Match (teach-before-test)","Easy home is Learn → Match → Hold. Read the story first. Match stays locked until that teach. After Learn, Match is the clear tap. After a Match win, Hold next.","First Learn teaches the story plus who keeps it and where it lives — idea, person, and place. Then Match asks that same sentence ↔ place ↔ person.","Easy Match cuts the Next screens between steps. Three picks, then Hold next or Home. A miss still says Wrong. Tap this one: … and names the card.","Easy Match stop + shorter Hold why chips for Plain 5/5","Easy Hold why-chips stay short. Luke 10: First the hurt man, then help. Luke 15: The father hugs him first. Hold prompts stay Tap the line you kept. then Tap why this is true.","Hold practice hides the saved-line queue so it does not feel like a filing cabinet.","Easy: Night Watch fully hidden until Match→Hold solid","Town (soon) waits under Settings → More. Night Watch stays on Hard.","Night Watch Love line is tool how-to, not a claim. Luke 10 split: Love names the tool (v27). Compassion is the Samaritan’s move (v33). The held claim stays Neighbor is the one who shows mercy (v36–37).","Night Watch miss says Wrong — tap the glowing face, so locked tools do not look like the task.","Easy Night Watch still finishes at 6/6.","Place titles stay Story Creek, Witness Square, Sky Watch, Why Gate, Meaning Ridge.","daily-stars stays pure positive — heavens speak of a Maker. No multiverse lecture."]},{version:"1.4.49",title:"Full Hard street · Easy Fun core loop",when:"2026-09-14",items:["Full Hard street — all game facts","Hard Link the street now matches every claim · reason · source fact to a place and person. Night Watch Love how-to and trail thank-you cards stay off the street.","Easy lesson pack: 9 Learn→Match→Hold lines","Easy Fun: mercy-first until held on Easy","Cold Easy Learn → Match → Hold starts at Story Creek with Mercy — Neighbor is the one who shows mercy. After Mercy is Easy-held, the next Learn is the father-run — not a creed jump. Hard or older held, completed, or taught lines do not skip Mercy.","easyLoopLine only counts Easy-taught and Easy-held markers, in order mercy → father → debt → creed → women → lantern → stars → cosmos → moral.","Settings → Reset this walk starts Easy at Mercy’s Story Creek line.","Easy Fun: one lesson loop, leaner Match, less Hold clutter","Easy Learn → Match → Hold stays on one line’s triad. If Learn taught the father-run, Match and Hold that same line. If mercy/Mercy/Story Creek, stay on mercy. No mid-loop lesson jump.","Easy: Learn before Match (teach-before-test)","Easy home is Learn → Match → Hold. Read the story first. Match stays locked until that teach. After Learn, Match is the clear tap. After a Match win, Hold next.","First Learn teaches the story plus who keeps it and where it lives — idea, person, and place. Then Match asks that same sentence ↔ place ↔ person.","Easy Match cuts the Next screens between steps. Three picks, then Hold next or Home. A miss still says Wrong. Tap this one: … and names the card.","Easy Match stop + shorter Hold why chips for Plain 5/5","Easy Hold why-chips stay short. Luke 10: First the hurt man, then help. Luke 15: The father hugs him first. Hold prompts stay Tap the line you kept. then Tap why this is true.","Hold practice hides the saved-line queue so it does not feel like a filing cabinet.","Easy: Night Watch fully hidden until Match→Hold solid","Town (soon) waits under Settings → More. Night Watch stays on Hard.","Night Watch Love line is tool how-to, not a claim. Luke 10 split: Love names the tool (v27). Compassion is the Samaritan’s move (v33). The held claim stays Neighbor is the one who shows mercy (v36–37).","Night Watch miss says Wrong — tap the glowing face, so locked tools do not look like the task.","Easy Night Watch still finishes at 6/6.","Place titles stay Story Creek, Witness Square, Sky Watch, Why Gate, Meaning Ridge.","daily-stars stays pure positive — heavens speak of a Maker. No multiverse lecture."]},{version:"1.4.48",title:"Easy Fun core loop",when:"2026-09-12",items:["Easy lesson pack: 9 Learn→Match→Hold lines","Easy Fun: mercy-first until held on Easy","Cold Easy Learn → Match → Hold starts at Story Creek with Mercy — Neighbor is the one who shows mercy. After Mercy is Easy-held, the next Learn is the father-run — not a creed jump. Hard or older held, completed, or taught lines do not skip Mercy.","easyLoopLine only counts Easy-taught and Easy-held markers, in order mercy → father → debt → creed → women → lantern → stars → cosmos → moral.","Settings → Reset this walk starts Easy at Mercy’s Story Creek line.","Easy Fun: one lesson loop, leaner Match, less Hold clutter","Easy Learn → Match → Hold stays on one line’s triad. If Learn taught the father-run, Match and Hold that same line. If mercy/Mercy/Story Creek, stay on mercy. No mid-loop lesson jump.","Easy: Learn before Match (teach-before-test)","Easy home is Learn → Match → Hold. Read the story first. Match stays locked until that teach. After Learn, Match is the clear tap. After a Match win, Hold next.","First Learn teaches the story plus who keeps it and where it lives — idea, person, and place. Then Match asks that same sentence ↔ place ↔ person.","Easy Match cuts the Next screens between steps. Three picks, then Hold next or Home. A miss still says Wrong. Tap this one: … and names the card.","Easy Match stop + shorter Hold why chips for Plain 5/5","Easy Hold why-chips stay short. Luke 10: First the hurt man, then help. Luke 15: The father hugs him first. Hold prompts stay Tap the line you kept. then Tap why this is true.","Hold practice hides the saved-line queue so it does not feel like a filing cabinet.","Easy: Night Watch fully hidden until Match→Hold solid","Town (soon) waits under Settings → More. Night Watch stays on Hard.","Night Watch Love line is tool how-to, not a claim. Luke 10 split: Love names the tool (v27). Compassion is the Samaritan’s move (v33). The held claim stays Neighbor is the one who shows mercy (v36–37).","Night Watch miss says Wrong — tap the glowing face, so locked tools do not look like the task.","Easy Night Watch still finishes at 6/6.","Place titles stay Story Creek, Witness Square, Sky Watch, Meaning Ridge.","daily-stars stays pure positive — heavens speak of a Maker. No multiverse lecture."]},{version:"1.4.47",title:"Easy Fun core loop",when:"2026-09-12",items:["Easy Fun: mercy-first until held on Easy","Cold Easy Learn → Match → Hold starts at Story Creek with Mercy — Neighbor is the one who shows mercy. Hard or older held, completed, or taught lines do not skip Mercy.","easyLoopLine only counts Easy-taught and Easy-held markers, in order mercy → creed → lantern. If Mercy is already held on Easy, the next lesson can be creed / Silas.","Settings → Reset this walk starts Easy at Mercy’s Story Creek line.","Easy Fun: one lesson loop, leaner Match, less Hold clutter","Easy Learn → Match → Hold stays on one line’s triad. If Learn taught creed/Silas, Match and Hold that same line. If mercy/Mercy/Story Creek, stay on mercy. No mid-loop lesson jump.","Easy: Learn before Match (teach-before-test)","Easy home is Learn → Match → Hold. Read the story first. Match stays locked until that teach. After Learn, Match is the clear tap. After a Match win, Hold next.","First Learn teaches the story plus who keeps it and where it lives — idea, person, and place. Then Match asks that same sentence ↔ place ↔ person.","Easy Match cuts the Next screens between steps. Three picks, then Hold next or Home. A miss still says Wrong. Tap this one: … and names the card.","Easy Match stop + shorter Hold why chips for Plain 5/5","Easy Hold why-chips stay short. Luke 10: First the hurt man, then help. Luke 15: The father hugs him first. Hold prompts stay Tap the line you kept. then Tap why this is true.","Hold practice hides the saved-line queue so it does not feel like a filing cabinet.","Easy: Night Watch fully hidden until Match→Hold solid","Town (soon) waits under Settings → More. Night Watch stays on Hard.","Night Watch Love line is tool how-to, not a claim. Luke 10 split: Love names the tool (v27). Compassion is the Samaritan’s move (v33). The held claim stays Neighbor is the one who shows mercy (v36–37).","Night Watch miss says Wrong — tap the glowing face, so locked tools do not look like the task.","Easy Night Watch still finishes at 6/6.","Place titles stay Story Creek, Witness Square, Sky Watch, Meaning Ridge."]},{version:"1.4.46",title:"Easy Fun core loop",when:"2026-09-12",items:["Easy Fun: one lesson loop, leaner Match, less Hold clutter","Easy Learn → Match → Hold stays on one line’s triad. If Learn taught creed/Silas, Match and Hold that same line. If mercy/Mercy/Story Creek, stay on mercy. No mid-loop lesson jump.","Easy: Learn before Match (teach-before-test)","Easy home is Learn → Match → Hold. Read the story first. Match stays locked until that teach. After Learn, Match is the clear tap. After a Match win, Hold next.","First Learn teaches the story plus who keeps it and where it lives — idea, person, and place. Then Match asks that same sentence ↔ place ↔ person.","Easy Match cuts the Next screens between steps. Three picks, then Hold next or Home. A miss still says Wrong. Tap this one: … and names the card.","Easy Match stop + shorter Hold why chips for Plain 5/5","Easy Hold why-chips stay short. Luke 10: First the hurt man, then help. Luke 15: The father hugs him first. Hold prompts stay Tap the line you kept. then Tap why this is true.","Hold practice hides the saved-line queue so it does not feel like a filing cabinet.","Easy: Night Watch fully hidden until Match→Hold solid","Town (soon) waits under Settings → More. Night Watch stays on Hard.","Night Watch Love line is tool how-to, not a claim. Luke 10 split: Love names the tool (v27). Compassion is the Samaritan’s move (v33). The held claim stays Neighbor is the one who shows mercy (v36–37).","Night Watch miss says Wrong — tap the glowing face, so locked tools do not look like the task.","Easy Night Watch still finishes at 6/6.","Place titles stay Story Creek, Witness Square, Sky Watch, Meaning Ridge."]},{version:"1.4.45",title:"Easy core loop",when:"2026-09-12",items:["Easy: Learn before Match (teach-before-test)","Easy home is Learn → Match → Hold. Read the story first. Match stays locked until that teach. After Learn, Match is the clear tap. After a Match win, Hold next.","First Learn teaches the story plus who keeps it and where it lives — this idea lives at Story Creek, with Mercy. Then Match asks sentence ↔ place ↔ person.","If Match opens early: Learn this first.","Easy: Night Watch fully hidden until Match→Hold solid","Town (soon) waits under Settings → More. Night Watch stays on Hard.","Easy Match stop + shorter Hold why chips for Plain 5/5","Easy Match ends after one sentence → place → person. Win burst, then Hold next or Home — no looping matches.","Easy Hold why-chips are short plain sentences (~8–12 words). Luke 15: The father hugs him first. Hold prompts stay Tap the line you kept. then Tap why this is true.","Night Watch miss says Wrong — tap the glowing face, so locked tools do not look like the task.","Night Watch Love line is tool how-to, not a claim. Luke 10 split: Love names the tool (v27). Compassion is the Samaritan’s move (v33). The held claim stays Neighbor is the one who shows mercy (v36–37).","Easy Night Watch still finishes at 6/6.","Place titles stay Story Creek, Witness Square, Sky Watch, Meaning Ridge."]},{version:"1.4.44",title:"Easy core loop",when:"2026-09-12",items:["Easy Match stop + shorter Hold why chips for Plain 5/5","Easy Match ends after one sentence → place → person. Win burst, then Hold next or Home — no looping matches.","Easy Match miss is one line: Wrong. Tap this one: … A win has one next tap.","Easy Hold why-chips are short plain sentences (~8–12 words). Luke 15: The father hugs him first. Wrong: The older brother is the hero just for staying. No throttles, no stacked theology in the chip.","Hold prompts stay Tap the line you kept. then Tap why this is true.","Easy: Night Watch fully hidden until Match→Hold solid","Easy home is Match and Hold. Town (soon) waits under Settings → More. Night Watch stays on Hard.","Night Watch Love line is tool how-to, not a claim. Luke 10 split: Love names the tool (v27). Compassion is the Samaritan’s move (v33). The held claim stays Neighbor is the one who shows mercy (v36–37). Mercy Wren stays the keeper name.","Night Watch miss says Wrong — tap the glowing face, so locked tools do not look like the task. Easy Night Watch still finishes at 6/6.","Place titles stay Story Creek, Witness Square, Sky Watch, Meaning Ridge."]},{version:"1.4.43",title:"Easy core loop",when:"2026-09-12",items:["Easy: Night Watch fully hidden until Match→Hold solid","Easy home is Match and Hold. Town (soon) waits under Settings → More. Night Watch stays on Hard.","Night Watch Love line is tool how-to, not a claim. Luke 10 split: Love names the tool (v27). Compassion is the Samaritan’s move (v33). The held claim stays Neighbor is the one who shows mercy (v36–37). Mercy Wren stays the keeper name.","Easy home, nav, and tree say Hold — saved lines stay a subtitle, not the only name.","Easy Hold is kid-plain: Tap the line you kept. then Tap why this is true. One prompt on screen — no duplicate. A reason is why this is true — taught once, then the chrome stays plain. Keep this still sits under the reason.","Easy why-options stay short. Luke 15: The father hugs him first. The older brother is home — and angry. Wrong: The older brother is the hero just for staying.","Night Watch miss says Wrong — tap the glowing face, so locked tools do not look like the task. Easy Night Watch still finishes at 6/6.","Place titles stay Story Creek, Witness Square, Sky Watch, Meaning Ridge.","Match stays sentence → place → person with a named miss and Next."]},{version:"1.4.42",title:"Easy core loop",when:"2026-09-12",items:["Easy: Night Watch hidden until Match→Hold is solid (Town already soon).","Easy home, nav, and tree say Hold — saved lines stay a subtitle, not the only name.","Night Watch Love line is tool how-to, not a claim. Luke 10 split: Love names the tool (v27). Compassion is the Samaritan’s move (v33). The held claim stays Neighbor is the one who shows mercy (v36–37). Mercy Wren stays the keeper name.","Easy Hold is kid-plain: Tap the line you kept. then Tap why this is true. One prompt on screen — no duplicate. A reason is why this is true — taught once, then the chrome stays plain. Keep this still sits under the reason.","Easy why-options are short plain sentences. Matthew 18: He was forgiven a huge debt, then choked a neighbor over a small one. Wrong: Jail him over a tiny debt.","Hold review chips drop identical duplicate buttons. The true line stays; a second button that reads the same is gone.","Night Watch miss says Wrong — tap the glowing face, so locked tools do not look like the task. Easy Night Watch still finishes at 6/6.","Place titles stay Story Creek, Witness Square, Sky Watch, Meaning Ridge. Easy home is Match and Hold — Night Watch (soon) and Town (soon) wait under Settings → More.","Match stays sentence → place → person with a named miss and Next. A few Easy prompts now name the line instead of asking you to infer it."]},{version:"1.4.41",title:"Easy core loop",when:"2026-09-11",items:["Night Watch Love line is tool how-to, not a claim. Luke 10 split: Love names the tool (v27). Compassion is the Samaritan’s move (v33). The held claim stays Neighbor is the one who shows mercy (v36–37). Mercy Wren stays the keeper name.","Easy Hold is kid-plain: Tap the line you just kept. then Tap why it stands. A reason is why it stands — taught once, then the chrome stays plain. Keep this still sits under the reason.","Hold review chips drop identical duplicate buttons. The true line stays; a second button that reads the same is gone.","Night Watch miss says Wrong — tap the glowing face, so locked tools do not look like the task. Easy Night Watch still finishes at 6/6.","Place titles stay Story Creek, Witness Square, Sky Watch, Meaning Ridge. Easy home is still Match, Saved, and Night Watch — Town (soon) waits under Settings → More.","Match stays sentence → place → person with a named miss and Next. A few Easy prompts now name the line instead of asking you to infer it."]},{version:"1.4.40",title:"Easy core loop",when:"2026-09-11",items:["Easy Night Watch / Hold facing line is now A true line can turn an unkind sentence toward heaven. Hard claim stays A true line can turn a cheap claim toward heaven.","Easy Hold is kid-plain: Tap the line you just kept. then Tap why it stands. A reason is why it stands — taught once, then the chrome stays plain. Keep this still sits under the reason.","Hold review chips drop identical duplicate buttons. The true line stays; a second button that reads the same is gone.","Night Watch miss says Wrong — tap the glowing face, so locked tools do not look like the task. Easy Night Watch still finishes at 6/6.","Place titles stay Story Creek, Witness Square, Sky Watch, Meaning Ridge. Easy home is still Match, Saved, and Night Watch — Town (soon) waits under Settings → More.","Match stays sentence → place → person with a named miss and Next. A few Easy prompts now name the line instead of asking you to infer it."]},{version:"1.4.39",title:"Easy core loop",when:"2026-09-11",items:["Easy Hold is kid-plain: Tap the line you just kept. then Tap why it stands. A reason is why it stands — taught once, then the chrome stays plain. Keep this still sits under the reason.","Hold review chips drop identical duplicate buttons. The true line stays; a second button that reads the same is gone.","Night Watch miss says Wrong — tap the glowing face, so locked tools do not look like the task. Easy Night Watch still finishes at 6/6.","Place titles stay Story Creek, Witness Square, Sky Watch, Meaning Ridge. Easy home is still Match, Saved, and Night Watch — Town (soon) waits under Settings → More.","Match stays sentence → place → person with a named miss and Next. A few Easy prompts now name the line instead of asking you to infer it."]},{version:"1.4.38",title:"Easy core loop",when:"2026-09-11",items:["Place titles now say what the stop is for: Story Creek, Witness Square, Sky Watch, Meaning Ridge. Area and plot ids stay so saves do not break.","Easy home is still Match, Saved, and Night Watch — Town (soon) waits under Settings → More.","Easy Night Watch finishes at 6/6. TAP n/6 is the score. Six face taps win the night.","Match stays sentence → place → person with a named miss and Next."]},{version:"1.4.37",title:"Easy core loop",when:"2026-09-11",items:["The First Gate is now Why Gate — the stop that asks why there is a world at all. Ansel Gate still keeps it.","Easy home is still Match, Saved, and Night Watch — Town (soon) waits under Settings → More.","Easy Night Watch finishes at 6/6. TAP n/6 is the score. Six face taps win the night.","Match stays sentence → place → person with a named miss and Next."]},{version:"1.4.36",title:"Easy core loop",when:"2026-09-11",items:["Cast names now stick to place and idea: Juniper Wick, Silas Whitman, Nora Skye, Hope Ridge. River, Mercy Wren, and Ansel Gate stay.","Easy home is still Match, Saved, and Night Watch — Town (soon) waits under Settings → More.","Easy Night Watch finishes at 6/6. TAP n/6 is the score. Six face taps win the night.","Match stays sentence → place → person with a named miss and Next."]},{version:"1.4.35",title:"Easy core loop",when:"2026-09-11",items:["Match uses a flat candy tile for Neighbor shows mercy — same simple shapes as the other cards. Mercy’s creek stays the creek tile.","Easy home is still Match, Saved, and Night Watch — Town (soon) waits under Settings → More.","Easy Night Watch finishes at 6/6. TAP n/6 is the score. Six face taps win the night.","Match stays sentence → place → person with a named miss and Next."]},{version:"1.4.34",title:"Easy core loop",when:"2026-09-11",items:["Match shows the Jericho-road picture first on Neighbor shows mercy, then the words. Mercy’s creek still uses the creek tile.","Easy home is still Match, Saved, and Night Watch — Town (soon) waits under Settings → More.","Easy Night Watch finishes at 6/6. TAP n/6 is the score. Six face taps win the night.","Match stays sentence → place → person with a named miss and Next."]},{version:"1.4.33",title:"Easy core loop",when:"2026-09-11",items:["Easy home has no Town map and no sticky fog box over the buttons. Match, Saved, and Night Watch sit clean on the page.","Town (soon) waits under Settings → More. Hard still has the streets.","Easy Hold is still the teach chip, one main-idea line, a scrollable reason, and Keep this.","Easy Night Watch finishes at 6/6. Match stays sentence → place → person with a named miss."]},{version:"1.4.32",title:"Easy core loop",when:"2026-09-11",items:["Easy Hold is one line: the teach chip, the main idea, a scrollable reason, and Keep this. The sentence is not the button.","Sticky Keep this / Done never covers the reason. Easy home is still Match, Saved, and Night Watch — Town (soon) waits under Settings → More.","Easy Night Watch finishes at 6/6. TAP n/6 is the score. Six face taps win the night.","Match stays sentence → place → person with a named miss and Next."]},{version:"1.4.31",title:"Easy core loop",when:"2026-09-11",items:["Easy home is Match, Saved, and Night Watch. The Town map waits under Settings → More as Town (soon).","Easy Night Watch finishes at 6/6. TAP n/6 is the score. Six face taps win the night.","Match stays sentence → place → person with a named miss and Next.","Saved keeps the sentences you held. Dig deeper, What’s new, themes, and Heaven-growth theater wait under Settings → More."]},{version:"1.4.30",title:"Easy core loop",when:"2026-09-11",items:["Easy Town stays a full readable map. No Lit! zoom. Tap a building to Manage it, walk, or Build this.","Easy Night Watch finishes at 6/6. TAP n/6 is the score. Six face taps win the night.","Match stays sentence → place → person with a named miss and Next.","Saved keeps the sentences you held. Dig deeper, What’s new, themes, and Heaven-growth theater wait under Settings → More."]},{version:"1.4.29",title:"Easy core loop",when:"2026-09-11",items:["Easy Town is Match, Hold, Night Watch, and a readable map. Tap a building to Manage it, walk, or Build this when you earned it.","Easy Night Watch finishes at 6/6. TAP n/6 is the score. Six face taps win the night.","Match stays sentence → place → person with a named miss and Next.","Saved keeps the sentences you held. Dig deeper, What’s new, themes, and Heaven-growth theater wait under Settings → More."]},{version:"1.4.28",title:"The town grows into Heaven",when:"2026-09-11",items:["The map starts as Eden — porch, creek garden, a star on the ridge. Streets and houses appear as you walk, hold, and Build this.","Heaven is earned. The trail climbs as you keep the lines. City of Heaven stands when the lookout is lit and the lines still hold.","Easy Night Watch finishes at 6/6 — six face taps, or a clear win. Hearts stay hearts; TAP n/6 is the score.","Town names stay in their slots while the town grows. Portraits and speech bubbles no longer cover the chips.","Easy chrome uses plain instructions and examples — unkind sentence, not mean line; Keep/Toss tiles drop throttle, first-century banking, and contradiction."]},{version:"1.4.27",title:"The town grows into Heaven",when:"2026-09-11",items:["The map starts as Eden — porch, creek garden, a star on the ridge. Streets and houses appear as you walk, hold, and Build this.","Heaven is earned. The trail climbs as you keep the lines. City of Heaven stands when the lookout is lit and the lines still hold."]},{version:"1.4.26",title:"Town names sit in their own slots",when:"2026-09-11",items:["Town chips stack so every full name stays readable at phone width — Story Creek, Witness Square, East porch, Star lamps, Pages, City of Heaven.","Portraits sit above the name band. Names no longer cover each other."]},{version:"1.4.25",title:"Saved folds by section",when:"2026-09-11",items:["Saved, Journal, and Profile fold by section. Tap a row to open it. The first section starts open.","Each fold shows a short name and a count — not a wall of pages.","Journal nests street pages under Places. Profile folds sentences, places, people, things you can use, and connections."]},{version:"1.4.24",title:"Town map labels · Easy and Hard",when:"2026-09-11",items:["Town map labels no longer pile up. The picture fills the panel — no purple empty bands.","Witness Square opens Manage. If the square is still locked, it says why and offers Walk Story Creek next.","Reading is Easy and Hard. Claim teach stays once. Hard Night Watch is unchanged."]},{version:"1.4.23",title:"Manage and Build this back on the map",when:"2026-09-11",items:["Easy map names Manage and Build this again. Tap a creek or square lot to open it.","Love shows the line you kept. Love, Logic, Reason, and Science stay on Easy Night Watch.","A claim is the main idea we hold to be true — taught once on Easy."]},{version:"1.4.22",title:"Tap the face · numbered match steps",when:"2026-09-11",items:["Night Watch Easy freezes the glowing face under the arrow. Tap the face.","A match keeps 1 · Sentence → 2 · Place → 3 · Person at the top.","Easy Settings drop V0, unlocks, and streak wallpaper. Hard words stay on Hard."]},{version:"1.4.21",title:"One Easy Night Watch path",when:"2026-09-11",items:["Night Watch Easy is one glowing person and Love — tap the person for the whole wave.","A match is three screens: pick, then Wrong. Tap this one: …, then Next.","Hard Night Watch and Hard links stay the same."]},{version:"1.4.20",title:"One person for the whole night",when:"2026-09-11",items:["Night Watch keeps one glowing person and Love — tap the person for every tap, not just the first.","Road lamps and locked tools stay hidden until that Easy night is done.","A right match waits on Next before new cards show."]},{version:"1.4.19",title:"One tap line at a time",when:"2026-09-11",items:["A match now says Tap a sentence, then Tap a place, then Tap a person — one short line.","A miss is one line: Wrong. Tap this one: Neighbor shows mercy.","Night Watch hides locked tools while Tap this person is up, so only Love stays."]},{version:"1.4.18",title:"Only one person on the road",when:"2026-09-11",items:["Night Watch hides the road lamps while Tap this person is up, so only one glowing person is on the board.","A wrong match starts Wrong. Tap This one. then names the card.","Love says Love — tap the person until you tap."]},{version:"1.4.17",title:"Only one person + tap order",when:"2026-09-11",items:["Night Watch shows only the glowing person while Tap this person is up. Other walkers stay hidden until you tap them.","Match says: Tap the sentence, then the place, then the person.","A wrong match pulses the right card and marks it This one."]},{version:"1.4.16",title:"One person to tap + plainer words",when:"2026-09-11",items:["Night Watch shows one glowing person to tap. Other walkers fade and step aside.","A wrong match names the exact card: Tap: “Neighbor shows mercy.”","Easy labels say Saved sentences, Connections, and Things you can use."]},{version:"1.4.15",title:"Big Night Watch people + next pick",when:"2026-09-11",items:["Night Watch people are big and slow. They pause with Tap this person, then crawl.","A wrong match says which sentence to pick next.","Easy words stay short. Main idea stays after the one teach."]},{version:"1.4.14",title:"Easy Wrong match + bigger Night Watch walkers",when:"2026-09-11",items:["Easy miss copy is Wrong match plus a plain why — no neighbor-line jargon.","Easy Night Watch walkers are bigger and slower. Hard pace stays.","Love tool line: Love — when compassion moves you, help like the Samaritan. Tap the glowing face. No cheap line on Easy chrome.","First Easy teach chip: Main idea = the short true line we keep. Easy chrome prefers match over link."]},{version:"1.4.13",title:"Easy kid-plain Journal + first Night Watch cue",when:"2026-09-11",items:["Easy Journal meta is who · where · picture · tool — no Anchored, deploys, or after-quote dump.","Easy chrome drops cheap claim, dossier, unsealed, soils, and Trail notes. Reason says why this is true.","First Easy Night Watch pauses the walker with a pulse arrow: Tap this person.","Link prompt: Pick the sentence that fits this story. Match miss: Wrong match — try again. Picture-match still Keep / Remove / Save your picks."]},{version:"1.4.12",title:"Easy main idea lines + full lot names",when:"2026-09-10",items:["Easy Night Watch, Journal, and Use chrome say main idea — not claim or Deploy wallpaper.","Picture-match: Keep the right pictures. Remove wrong picks. Miss: Wrong pair — try a different main idea. Lock-in is Save your picks.","Easy map labels are full names: Story Creek, Witness Square, East porch."]},{version:"1.4.11",title:"Easy main idea chrome + bigger map labels",when:"2026-09-10",items:["Easy teaches “A claim is the main idea we hold to be true” once, then chrome says main idea only.","Sort lock-in is Save your picks. Weak readings is wrong picks.","Town map labels are bigger at phone size — Hollow, Porch, and Square."]},{version:"1.4.10",title:"Easy short card + named next tap",when:"2026-09-10",items:["Easy Tap this next names what opens — Tap this next — short Jesus story. The story is a short card with Continue and Skip reading, not a wall.","Easy Town hides the Eden-to-Heaven legend dump. Link the street is Match sentence → place → person.","A claim is the main idea we hold to be true — taught once, then Easy chrome says main idea. Story Creek gets a Jesus-story creek subtitle."]},{version:"1.4.9",title:"Easy Tap this next",when:"2026-09-10",items:["Easy Town keeps one gold Tap this next. Link and Night Watch stay in the tool row — not a stack of poetic cards.","A Night Watch miss on Easy says: You missed the walker — tap the moving person.","Easy manage and Night Watch drop scrapbook, deploy, held-line, and cheap-claim chrome. Dig deeper reads Read more. Claim is not wallpaper."]},{version:"1.4.8",title:"Easy Link clue + one-tap Night Watch",when:"2026-09-10",items:["Easy Link shows a short who/where/story clue with the picture so the first pick is learnable. A miss still says why that choice is wrong.","Easy Night Watch is one tap: Do this, then tap the walker. No Unlock → Plant chain, and no “turn cheap lines toward heaven” on Easy chrome.","Easy keeps plain verbs. Claim, hold, and deploy get a one-line gloss only when a locked tool needs them."]},{version:"1.4.7",title:"Build this stays on screen",when:"2026-09-10",items:["Manage is a phone-bottom sheet. Build this and Walk stay on screen at 390px — Dig deeper and tool tiles scroll above them.","Night Watch in Easy still opens with one big Do this."]},{version:"1.4.6",title:"Link starts with the picture",when:"2026-09-10",items:["Link the street leads with a big picture when we have one — porch lamp, creek, bench, faces — then a short label. Not a wall of sentences.","Dig deeper chips still read Scripture, Ancient, Classic, and Modern · believing."]},{version:"1.4.5",title:"Sticky next tap",when:"2026-09-10",items:["Build this, Walk, Done, and Next stay at the bottom of manage sheets and Link — no hunting below the fold.","A wrong tap or a locked building says why, and what is still needed, in one sentence.","Night Watch in Easy: what it is, then Do this. Deploy means use a claim you held."]},{version:"1.4.4",title:"Recall, then Later",when:"2026-09-10",items:["A held line is an offer, not a pin. Later keeps it for this walk. Not today waits until morning. No guilt.","A sitting is about 3 pages — never the whole journal.","A second look at a hold comes at a new angle, with Dig deeper — not the first teach again.","Link the street leads with a picture when we have one: faces, creek, bench, porch lamp."]},{version:"1.4.3",title:"Classic sources",when:"2026-09-10",items:["Dig deeper: Scripture and older witnesses when they fit; later faithful sources welcome when they help.","Source chips read Scripture, Ancient, Classic, and Modern · believing."]},{version:"1.4.2",title:"Done, then Build this",when:"2026-09-10",items:["After you pick the reason that still holds, a gold Done waits — the quiz does not vanish on its own.","Link the street still uses the 3-step wizard. After the third link: All 3 links complete, then Done.","The building button is Build this. The success beat is still Built! You earn the next look by learning, not by paying."]},{version:"1.4.1",title:"Plain next words",when:"2026-09-10",items:["Easy names the next tap in plain words: Read today’s story, Choose the sentence to remember, Connect sentence → place → person.","After you pick a sentence, Reason never sits still — you get Held, then Done (or a miss you can try again).","Link the street is a 3-step wizard: one pick per step, checkmarks, then Link complete.","A building you earned shows one Upgrade button. If you have not earned it yet, one sentence says what is missing. Upgrade still means a better building you earn by learning, not by paying."]},{version:"1.4.0",title:"A city you build",when:"2026-09-10",items:["The town map is a city of buildings. Tap a lot to manage it: see the level, who lives there, which ideas are lit, and Dig deeper.","Upgrades are earned by learning — finishing walks, holding claims, Link the street, and journal pages. Tap Upgrade to raise the next look. You do not pay.","Walk stays porch → creek → square → sky → gate → lookout → Heaven. Easy still teaches: a claim is what we hold to be true."]},{version:"1.3.9",title:"The map tells the walk",when:"2026-09-10",items:["Town lots have in-world reasons: Mercy’s pictures at the creek, Silas’s ledger on the square, Juniper’s lamp on the porch, Nora’s sky on the ridge, Ansel’s stone at the gate, Hope’s look over the town.","The legend names the walk: porch lamp → creek stories → square names → ridge sky, then gate and lookout toward Heaven.","Link the street still lights the same three spots. Easy still teaches a claim as what we hold to be true."]},{version:"1.3.8",title:"Link lights the map",when:"2026-09-10",items:["Link the street: each match lights a spot on the town map. Tap the place later to open that idea again.","Easy still: you’ll reopen them from your scrapbook of links. One story at a time."]},{version:"1.3.7",title:"Kalām, positively",when:"2026-09-10",items:["Why Gate journal: the kalām syllogism leads cleanly — what begins has a cause. Sources are Philoponus and al-Ghazālī first; Craig is the modern statement only.","Witness Square: Luke’s inquiry posture stands to be weighed."]},{version:"1.3.6",title:"Teach the words",when:"2026-09-10",items:["Hard words are taught first: a claim is what we hold to be true. Reason is why it stands. Source is where it comes from. Creed, parable, fine-tuning, and premise get a kid-plain gloss before they show up in play.","Teach still comes before the Hold lock — story and picture first, then the claim. Easy mode uses stronger glosses. Mystery can wait until after the line is taught.","Unread jargon (contingency, qualia, raw parameters) stays in Hard / Dig deeper, or is taught as “might not have been,” “felt redness,” and “life’s dials.” Kalām is taught as the beginning argument first.","Easy mode is still off until you ask — Welcome checkbox or Settings → Reading."]},{version:"1.3.5",title:"Say the line",when:"2026-09-10",items:["After every win, one claim to say out loud. Why it stands and the source wait in Dig deeper — and on Profile.","First session: one Do this next card. The town stays candy; it does not add a second primary tap under the map.","Easy mode still off until you ask — Welcome checkbox or Settings → Reading."]},{version:"1.3.4",title:"Easy mode",when:"2026-09-10",items:["Easy mode: plainer words, bigger taps, fewer choices at once. Off by default — turn it on at Welcome or Settings → Reading.","Teaches and Holds use shorter sentences and define hard words once. Creed is “old shared belief”; parable is “Jesus story”; mind map is “your scrapbook of links.” The claims stay the same.","Town opens with one Do this next card. Link the street sits above the map, with a tap-idea → place → person demo and a plain takeaway after you match."]},{version:"1.3.3",title:"Readable town",when:"2026-09-10",items:["Profile gathers River’s unlocks — held ideas, places, people, tools, and mind-map links. Open it from Town or Settings.","Dig deeper: Scripture and older witnesses when they fit; later faithful sources welcome when they help.","Reset progress is buried in Settings → Danger zone and asks before it wipes the save. It is not on the town screen.","Claims, journal, mind map, and link blocks wrap or scroll on a phone — no clipped takeaways.","Isaiah 53’s Servant is the Jesus the church confesses. Witness, kalām, beauty, and life lines lead with the hold."]},{version:"1.3.2",title:"Town mind map",when:"2026-09-10",items:["Tap a place on the town map to open its mind map — person, place, and the ideas you unlocked.","Link the street: snap idea ↔ place ↔ person. Those links light nodes you can reopen from the map.","River’s portrait is a cleaner fair-blonde candy face."]},{version:"1.3.1",title:"River’s look",when:"2026-09-10",items:["River — the traveler you play — is the fair blonde candy portrait on Welcome, town, and Settings."]},{version:"1.3.0",title:"V0 launch",when:"2026-09-10",items:["Candy faces live on the town; lamps, creek, and folk idle and cheer.","Night Watch hits harder — tools stay below the board on a phone.","Sky Watch teaches first, then two choices. Miss, Try again, finish.","This list is the hook for later packs. Settings always shows the live version."]},{version:"1.2.0",title:"Designer hold",when:"2026-09-09",items:["Fine-tuning Hold stays Designer-first. The triad is only on two Sky Watch clues."]}];function Vk(a){return vl.find(o=>o.version===a)??vl[0]}const Qt="1.4.55",Xk="city.silver.unending",oa=1,Dd="silver-city-progress-v1",Qk="silver-city-progress-v1.bak",en={river:{id:"river",name:"River",shortName:"River",role:"Traveler",seeking:"Whether the case for God can be walked, not only shouted."},juniper:{id:"juniper",name:"Juniper Wick",shortName:"Juniper",role:"Morning lantern",seeking:"One honest line you can still say at breakfast."},mercy:{id:"mercy",name:"Mercy Wren",shortName:"Mercy",role:"Parable-teller",seeking:"Stories that ask what kind of neighbor you will be.",areaId:"parable-hollow"},silas:{id:"silas",name:"Silas Whitman",shortName:"Silas",role:"Witness clerk",seeking:"Names, dates, and what the first reports actually said.",areaId:"witness-bench"},nora:{id:"nora",name:"Nora Skye",shortName:"Nora",role:"Sky-watch keeper",seeking:"Wonder that is not afraid of a telescope.",areaId:"observatory"},ansel:{id:"ansel",name:"Ansel Gate",shortName:"Ansel",role:"Why-gate keeper",seeking:"Why there is a world at all — and the God who answers it.",areaId:"first-gate"},hope:{id:"hope",name:"Hope Ridge",shortName:"Hope",role:"Meaning-ridge keeper",seeking:"Duty, mind, meaning, and beauty — without mocking the person still walking.",areaId:"high-lookout"}},Zk={"parable-hollow":"mercy","witness-bench":"silas",observatory:"nora","first-gate":"ansel","high-lookout":"hope"};function Eo(a){return en[Zk[a]??"river"]}const ot={purpose:"A 60-second Christian reasoning game: sort ideas, choose one takeaway, and remember why it stands tomorrow.",who:"You are River. Juniper is your guide. Each day you practice one Christian idea.",playGoal:"Goal: keep the lines that support today’s claim; toss the distractors; then choose the claim and reason you’ll remember.",takeaway:"Choose the one-sentence takeaway you can repeat tomorrow, then choose why it stands.",tapTakeaway:"Tap the takeaway",whyItStands:"Why it stands",lockSort:"Lock in the sort."},eT={"parable-hollow":{hello:"Sit by the creek. Jesus taught in pictures so the truth could walk around inside you.",after:"Keep the line, not my voice. Neighbor is the one who shows mercy."},"witness-bench":{hello:"I copy names on the square. Public reports live here — the creed is a ledger line, not a creek story.",after:"Hold the creed: died, buried, raised, appeared."},observatory:{hello:"Dome’s open on the ridge. We look up. Fine-tuning lives with the sky.",after:"If a sky line stuck, say it on the stairs."},"first-gate":{hello:"The stone only asks why there is a world. That’s as far as we walk tonight.",after:"A first cause is a lot. It is not yet the sermon on the mount."},"high-lookout":{hello:"Wind’s honest up here. Duty, mind, meaning, beauty — sit with them.",after:"If a hunger woke, don’t be ashamed. Hungers map to real countries."}},Oa={porch:{who:"juniper",here:"Lamp’s ready. Tap the glow.",built:"Porch stood up.",lit:"Lantern’s holding.",unlocked:"East lot’s staked.",afterWin:"The porch caught.",grew:"Lamp kicked."},hollow:{who:"mercy",here:"Creek path’s open.",built:"Cabin’s standing.",lit:"Oaks are lit.",unlocked:"Mercy’s staking the lot.",afterWin:"The creek grew.",grew:"Another oak."},bench:{who:"silas",here:"Ledger’s on the square.",built:"Hall’s up.",lit:"Names are warm.",unlocked:"Silas unlocked the bench.",afterWin:"The square filled.",grew:"Another window."},observatory:{who:"nora",here:"Dome’s waiting on the ridge.",built:"Glass is set.",lit:"Stars caught the glass.",unlocked:"Nora opened the ridge.",afterWin:"The ridge woke.",grew:"Glass caught."},gate:{who:"ansel",here:"East road’s asking why.",built:"Arch is standing.",lit:"Stone’s warm.",unlocked:"Ansel unbarred the road.",afterWin:"A gate rose.",grew:"Stone settled."},lookout:{who:"hope",here:"High wind. Come up.",built:"Tower’s up.",lit:"Ridge lantern’s on.",unlocked:"Hope marked the climb.",afterWin:"The ridge grew.",grew:"Flag kicked."},journal:{who:"river",here:"Pages live in that house.",built:"Dossier house is up.",lit:"Pages are glowing.",unlocked:"A house for what you can still say.",afterWin:"A page landed.",grew:"Another page."},lamps:{who:"juniper",here:"Street lamps remember the walks.",built:"Lamps are up.",lit:"The street remembered.",unlocked:"First lamp on the street.",afterWin:"A lamp caught.",grew:"Another lamp."}};function la(a){return Oa[a]??Oa.porch}function tT(a){return a==="parable-hollow"?Oa.hollow:a==="witness-bench"?Oa.bench:a==="observatory"?Oa.observatory:a==="first-gate"?Oa.gate:a==="high-lookout"?Oa.lookout:Oa.porch}function nT(a,o,r=!1){const c=la(a);return o==="Lit!"?c.lit:o==="Built!"?r&&a==="journal"?"Page house is up.":c.built:o==="Grew!"?c.grew:c.unlocked}const aT="Five walks, one trail. None of us is the evidence. We only kept you company while you gathered it. The Author, if he is real, is not smaller than a game.";function Ae(a,o,r,c,d,u,g,y){return{id:a,claim:o,reason:r,source:c,claimChoices:[o,d,u],reasonChoices:[r,g,y]}}const Lo={"ph-road":Ae("ph-road","Neighbor is the one who shows mercy.","Jesus makes the listener identify with the wounded man, then with the Samaritan moved with compassion.","Luke 10:25–37","Neighbor means the person who already looks like you.","The priest is the hero because he kept the law.","The story is mainly a map of the Jericho road.","Mercy is optional once you have classified the victim."),"ph-father":Ae("ph-father","The father runs with mercy before the speech is done.","Honor is spent so the son can be embraced; the older brother shows nearness without joy.","Luke 15:11–32","The son earned the feast by writing a good apology.","The story is mainly about dividing an estate.","The father waits until justice is complete.","The older brother is the hero for staying home."),"ph-seeds":Ae("ph-seeds","The kingdom arrives in pictures, not slogans.","Soil, search, a tiny seed, and a trust form a portrait — not a slogan.","Matthew 13; Luke 15; Matthew 25","Every parable is an allegory of every detail.","The kingdom is only for people who already understand.","The sower proves every heart is the same.","The talents story is about hiding gifts until heaven."),"ph-debt":Ae("ph-debt","Received mercy makes refusing mercy a contradiction.","The servant forgiven an unpayable debt then throttles a peer over a small sum.","Matthew 18:21–35","Forgiveness is a limited coupon on God’s spreadsheet.","Jesus is only reforming first-century banking.","Peter’s “seven times” was already the full measure.","The first servant was right to demand prison."),"wb-creed":Ae("wb-creed","Paul hands on an early public creed: died, buried, raised, appeared.","Burial resists a merely “spiritual” death; appearances resist a merely “spiritual” raising.","1 Corinthians 15:3–8","The creed is Paul’s private dream from decades later.","Paul invented the formula on the spot in Corinth.","“Buried” is only poetic decoration.","Appearances are admitted to be visions with no named people."),"wb-early":Ae("wb-early","The resurrection claim sits close to the events, not as a late legend.","Paul quotes a received formula and names known people; Luke claims inquiry among witnesses.","1 Corinthians 15:3–7; Luke 1:1–4","Early is the same as laboratory proof.","No first-century writer claims to have asked witnesses.","Named people make a report less testable.","Distance in time is the only historical question that matters."),"wb-method":Ae("wb-method","Ordinary historical tools weigh testimony; they do not replace reading.","Multiple attestation, embarrassment, early reports, and context resist “late pious novel.”","Standard historical method","An early creed is already a laboratory proof.","Every Christian report is automatically a late novel.","Method is a way to skip the texts themselves.","Embarrassment means a story must be false."),"wb-women":Ae("wb-women","The first tomb reports begin with women — an awkward opening if invented for respectability.","Luke records that the apostles dismissed them — a costly opening if the goal were instant respectability.","Luke 24:1–11","The Gospels open with the Roman senate converting overnight.","Women were the most legally impressive public witnesses.","Luke sands away any dismissal of the first report.","Outside writers never mention Christus or Pilate."),"ob-tuning":Ae("ob-tuning","The universe is finely tuned for life — that fit points to a Designer.","Life-permitting ranges are extravagantly narrow across independent parameters; design predicts a habitable cosmos, blank chance does not.","Fine-tuning of physical constants and initial conditions (e.g. cosmological constant; a low-entropy start — initial condition, not another force dial).","Fine-tuning is a rumor with no name in science.","A habitable cosmos needs no explanation at all.","Life-permitting ranges are wide; blank chance predicts a habitable cosmos just as well.","The fittedness is only a rumor in the numbers."),"ob-design":Ae("ob-design","Fine-tuning is best explained by a mind that intended a habitable world.","Life-permitting ranges are extravagantly narrow; a Designer who wants observers leads us to expect that fit — blank indifference does not.","Likelihood / fine-tuning arguments (Collins). A low-entropy start is an initial condition, not another force dial.","A habitable cosmos needs no Designer.","Fine-tuning already proves a particular gospel.","A mind wanting observers would not expect life-permitting numbers.","Likelihood arguments are automatically dishonest."),"ob-leibniz":Ae("ob-leibniz","Why is there something rather than nothing remains after a cosmological model.","Models describe a world already given; a physical “vacuum” is still something.","Leibniz; the vacuum/nothing distinction","A successful model retires the metaphysical question.","“Nothing” in popular writing always means metaphysical nothing.","Laws and vacua are not somethings.","The question only applies to Tuesdays."),"ob-life":Ae("ob-life","Life’s specified information is a mark of mind.","Cells store coordinated information; that looks like the work of a mind — wonder is rational, and so is more work.","Abiogenesis as an open program; Genesis 1 as theology","A flask has already demonstrated a miracle.","Cells require no coordinated information.","The unfinished story means we should end research.","Genesis 1 is a lab protocol."),"fg-mover":Ae("fg-mover","Change here and now needs a first actuality that is not itself a receiver of change.","Nothing reduces itself from potential to actual; an unexplained stack of changers is not an explanation.","Aquinas, ST I, q.2, a.3 (First Way)","This is only a story about dominoes at the Big Bang.","Each changing thing explains itself.","“First” here means the earliest date on a calendar.","Infinite backlog automatically explains present change."),"fg-contingent":Ae("fg-contingent","A world of might-not-have-beens still needs a necessary ground.","Contingent things exist; “it just is” is also a metaphysics, not automatically cheaper.","Aquinas’s Third Way; Leibniz on sufficient reason","Contingent things contain the reason why there is anything.","Rivals are unintelligible and need not be named.","Necessary being is only a weather report.","Brute fact is not a metaphysical move."),"fg-kalam":Ae("fg-kalam","If what begins has a cause and the universe began, it has a cause.","That yields a Cause of the beginning; naming Abraham’s God takes further historical steps.","Kalām tradition; contemporary analytic statements","A cause of the beginning is already the whole creed.","The form never mentions a beginning.","The second premise cannot be argued at all.","A first cause automatically names Jesus."),"fg-limits":Ae("fg-limits","A cosmological argument is already a great deal — and not yet the sermon on the mount.","Aquinas argues onward from the Ways; the New Testament adds a particular history.","Aquinas ST I; Pascal on philosophers and Abraham","The Five Ways are already the whole gospel.","Pascal commands you to skip the philosophers.","Stopping at a first cause is required.","History has nothing further to add."),"hl-moral":Ae("hl-moral","Duty presents itself as more than taste — and theism is a natural home for that.","Romans 2 treats moral knowledge as widely shared, which is why strangers can accuse one another.","Romans 2:14–15","Duty is only a preference we pretend is law.","Atheist moral realism is impossible to name.","Moral argument is a sneer at people who doubt.","Strangers cannot expect injustice to mean anything."),"hl-mind":Ae("hl-mind","A story of the world must find a home for mind — including the storyteller.","Theism is a reply in which mind is present at the beginning, not only an accident at the end.","The hard problem; classical theism on intellect","Qualia and aboutness are parlor tricks.","Theism is the only reply anyone has offered.","A story without mind can still house the storyteller with no remainder.","Mind is easy to treat as leftover steam."),"hl-meaning":Ae("hl-meaning","Local meaning can be built — the lookout asks whether it is also received.","Ecclesiastes refuses to let work and pleasure pretend to be the final good, and refuses to call them worthless as gifts.","Ecclesiastes 2; 9; 12","Work and pleasure are the final good.","Ecclesiastes calls every gift worthless.","The hunger for a final good has no question attached.","You cannot build any local meaning without naming God."),"hl-beauty":Ae("hl-beauty","Beauty wakes a hunger it cannot feed — hungers usually correspond to real countries.","Longing for a country the sunset cannot give is a mark that we were made for that country; Psalm 19 treats the sky as speech.","Lewis, Weight of Glory; Psalm 19:1–4","A sunset deducts God as a theorem.","Hungers never correspond to real countries.","Psalm 19 treats the sky as silent decoration.","The lookout and the observatory cannot share a ridge."),"daily-lantern":Ae("daily-lantern","A lamp is meant to be seen.","Jesus uses an ordinary lamp and a city on a hill — public without being proud.","Matthew 5:14–16","We are told to become the sun.","Light is only for insiders behind a door.","The picture is a command to boast.","A hidden lamp is the point of the saying."),"daily-gems":Ae("daily-gems","Jesus taught with pictures you can hold.","A lamp is seen, seed meets different hearts, and the cup is poured for many — gift, not wage.","Matthew 5; Mark 4; Matthew 26:28; Luke 22:20","Pictures are only decoration.","Mercy is a wage you finish earning.","Every heart is the same soil.","A hidden lamp is the point."),"daily-seed":Ae("daily-seed","The same word meets different soils; some seed is lost.","The parable invites hearing; it does not flatter every field.","Mark 4:1–9","Every field is guaranteed a harvest.","Lost seed means the sower failed.","Good soil is a slogan, not a way of hearing.","Jesus never names withering or birds."),"daily-names":Ae("daily-names","The resurrection claim stacks named witnesses, not one private voice.","Paul lists Cephas, the Twelve, and more than five hundred — many still living then.","1 Corinthians 15:5–6","Paul refuses to name anyone.","Only one anonymous dreamer is cited.","A crowd appearance would have been hidden.","Cephas is left off the list."),"daily-creed":Ae("daily-creed","The creed sits between the event and Paul’s letter.","If the formula is early, the claim is close to what it names: died, buried, raised.","1 Corinthians 15:3–4","Paul invents the creed as he writes.","Burial is skipped because it does not matter.","The letter is older than any tradition it quotes.","Nothing was handed on; it was only felt."),"daily-stars":Ae("daily-stars","The heavens already speak of a Maker; fine-tuning fits that voice.","Scripture treats the created order as intelligible testimony — design inference and “the heavens declare” land in the same grain.","Psalm 19:1–4; Romans 1:20","The heavens are silent about a Maker.","Fine-tuning contradicts the psalm.","Scripture treats the sky as decoration only.","Design inference and “the heavens declare” cannot share a grain."),"daily-life":Ae("daily-life","Life, place, and mind are not cheap facts.","Copying cells, a habitable band, and a mind that can do science all look given — the marks of a Maker.","Acts 17:24–25","Chemistry is easy to dismiss.","“It happened” is automatically the last word.","A habitable band is an unremarkable accident with no question.","Minds that do science need no home in the story."),"daily-scroll":Ae("daily-scroll","We hold a river of copies, not the first ink.","Scribes copy, later hands compare, then a modern page prints a recovered text.","Isaiah 40:8","We hold the first ink in a glass case.","Comparison of copies is cheating.","A line falls from the sky onto a printer.","Transmission has no human hands."),"daily-isaiah":Ae("daily-isaiah","Isaiah 53’s Servant is the Jesus the church confesses — wounded for others, silent like a lamb.","The poem’s Servant suffers for others and does not answer with a sword; the church names that Servant as Jesus.","Isaiah 53:4–12","The servant conquers Rome by sword.","The poem is about estate planning.","The servant never suffers for anyone.","Wounds are unrelated to healing in the poem."),"daily-grace":Ae("daily-grace","Grace is gift, not wage; faith receives; boast starves.","The claim is that God moves first — not that you finished the map.","Ephesians 2:8–9","Grace is a prize for high scores.","Faith is a wage God owes you.","Boast is what the gift is for.","Salvation is your own doing."),"daily-rest":Ae("daily-rest","Tired people are named first; rest is the gift, not a steeper hill.","The invitation is to a person — “Come to me” — not a performance.","Matthew 11:28","Rest is a prize for climbing harder.","Jesus names the energetic first.","The invitation is to a steeper program.","Weariness disqualifies you."),"daily-neighbor":Ae("daily-neighbor","Mercy makes a neighbor; pedigree does not.","Jesus asks who *proved* to be a neighbor — the one who showed mercy.","Luke 10:36–37","The priest who passed by is the measure.","Neighbor is settled before anyone crosses the road.","Mercy is unrelated to the question.","The wounded man must first classify the helper."),"daily-empty":Ae("daily-empty","The first Easter reports include an empty place, women, fear, and wonder.","The town does not sand that awkwardness into a tidy triumph.","Luke 24:2–3","Rome instantly converts the senate.","Women are absent from the first reports.","The tomb is found occupied and explained.","Fear is edited out of the opening."),"daily-cosmos":Ae("daily-cosmos","The universe exists and did not have to — so a Source is worth naming.","The psalms ask the question out loud and expect a Giver, not a shrug.","Psalm 8:3–4","Questions about a source are impolite.","Existence plus contingency yields no question.","The universe had to exist just as it is.","The psalms refuse to look at the heavens."),"daily-door":Ae("daily-door","Jesus’ “door” is a particular way in with a wide anyone.","You may refuse it; the town will not lock you in a pew.","John 10:9","The door is a dead end.","Pasture is denied on the other side.","“Anyone” is narrowed to insiders only.","The image is a wall, not an entrance."),"j-trail-1":Ae("j-trail-1","A morning walked is kept — not as a trophy, as a thank-you.","If you are away, the trail waits; nothing already gathered is taken back.","Daily Trail","Missing a day erases the journal.","The town keeps marks to shame you.","Return is forbidden after a gap.","A first morning does not count."),"j-trail-2":Ae("j-trail-2","Two mornings are enough for the path to know your step.","Nothing is owed; the bench is still free.","Daily Trail","Two mornings create a debt you must pay.","The bench is reserved for perfect streaks.","Return is a fine, not a kindness.","The path refuses a second step."),"j-trail-3":Ae("j-trail-3","Return is a kind of courage.","Three distinct days are marked without scolding the ones you missed.","Daily Trail","Return is only for people who never left.","The clerk erases pages after a gap.","Courage means never resting.","Three days unlock a punishment."),"j-trail-5":Ae("j-trail-5","Five skies are saved; empty days are not scolded.","The town only keeps a page for when you are here.","Daily Trail","Empty days delete five marks.","The town scolds every quiet morning.","Pages are only for perfect calendars.","Weather reports are used to shame you."),"j-trail-7":Ae("j-trail-7","Seven unique mornings still leave tomorrow free.","If you miss, the trail waits; marks you made stay in the journal.","Daily Trail","A week means you may never rest.","Missing tomorrow burns the journal.","Seven days become a debt collector.","The trail closes after a week."),"td-watch":Ae("td-watch","Love — tap the matching face. A true line turns a cheap claim toward heaven.","Love, logic, reason, and science you have kept can divert a false step up the ridge.","Luke 10:25–37 · the night road","A town holds because the streets are pretty.","Defense is shouting until no one asks.","The Samaritan story is only about travel safety.","A lamp replaces the need for a claim.")};for(const a of No.lessons)Lo[a.id]=Hg(a,"medium");function Et(a){return Lo[a]}function Og(a,o="medium"){return Yk(a,o)??Lo[a]}function sT(a,o){const r=(o??[]).filter(c=>!!c.why).map(c=>({claim:c.text,reason:c.why}));return r.length>1?r:[{claim:a.claim,reason:a.reason}]}function qg(a,o){return Lo[a]??Lo[o]}const iT=2,tt=[{id:"porch",title:"East porch",blurb:"Juniper’s lamp. You arrive here so today’s line can be seen."},{id:"hollow",title:"Story Creek",blurb:"Mercy’s creek. Jesus stories live where pictures can walk.",areaId:"parable-hollow"},{id:"bench",title:"Witness Square",blurb:"Silas’s ledger on the square. Public names, not parables.",areaId:"witness-bench"},{id:"observatory",title:"Sky Watch",blurb:"Nora’s dome. The sky’s fit belongs on the ridge.",areaId:"observatory"},{id:"gate",title:"Why Gate",blurb:"Ansel’s arch. The stone asks why there is a world at all.",areaId:"first-gate"},{id:"lookout",title:"Meaning Ridge",blurb:"Hope’s tower. Duty, mind, meaning, and beauty look over the town.",areaId:"high-lookout"},{id:"journal",title:"Dossier house",blurb:"River’s pages. What you can still say lives in the house."},{id:"lamps",title:"Star lamps",blurb:"Juniper’s street lamps. The town remembers walks you kept."}],Ho=["ph-road","ph-father","ph-seeds","ph-debt"],hi=["wb-creed","wb-early","wb-method","wb-women"],di=["ob-tuning","ob-design","ob-leibniz","ob-life"],ui=["fg-mover","fg-contingent","fg-kalam","fg-limits"],Wo=["hl-moral","hl-mind","hl-meaning","hl-beauty"];function Jt(a,o){return a.filter(r=>o.includes(r)).length}function bo(a,o,r){return a>=o&&o>0?"lit":a>0?"built":r?"scaffold":"empty"}function Dg(a){return Object.values(a).reduce((o,r)=>o+r,0)}function us(a,o){const r=Jt(Ho,o.completed),c=Jt(hi,o.completed),d=Jt(di,o.completed),u=Jt(ui,o.completed),g=Jt(Wo,o.completed),y=o.dailyDates.length,p=o.journal.length,w=Dg(o.stars);switch(a){case"porch":return y>=3||o.streak>=3?"lit":y>=1?"built":"scaffold";case"hollow":return bo(r,Ho.length,y>=1);case"bench":return bo(c,hi.length,r>=iT);case"observatory":return bo(d,di.length,c>=hi.length);case"gate":return bo(u,ui.length,d>=di.length);case"lookout":return bo(g,Wo.length,u>=ui.length);case"journal":return p>=12?"lit":p>=4?"built":p>=1?"scaffold":"empty";case"lamps":return w+(o.defense?.cleared??0)>=12?"lit":w+(o.defense?.cleared??0)>=4?"built":w+(o.defense?.cleared??0)>=1?"scaffold":"empty";default:return"empty"}}function Pd(a,o){return o?Jt(Ho,a.completed)<Ho.length?"hollow":Jt(hi,a.completed)<hi.length?"bench":Jt(di,a.completed)<di.length?"observatory":Jt(ui,a.completed)<ui.length?"gate":Jt(Wo,a.completed)<Wo.length?"lookout":a.journal.length<12?"journal":"lamps":"porch"}function oT(a,o){switch(a){case"porch":return{name:"daily"};case"journal":case"lamps":return{name:"journal"};case"hollow":return{name:"area",areaId:"parable-hollow"};case"bench":return o?{name:"area",areaId:"witness-bench"}:{name:"area",areaId:"parable-hollow"};case"observatory":return{name:"area",areaId:o?"observatory":"witness-bench"};case"gate":return{name:"area",areaId:o?"first-gate":"observatory"};case"lookout":return{name:"area",areaId:o?"high-lookout":"first-gate"};default:return{name:"hub"}}}function rT(a){const o=tt.length;return{standing:tt.filter(c=>{const d=us(c.id,a);return d==="built"||d==="lit"}).length,possible:o}}const gd=["eden","village","town","gold","heaven"],Ey={eden:"Eden",village:"Village",town:"Lit town",gold:"Gold city",heaven:"City of Heaven"},lT={eden:"Eden",village:"Village",town:"Town",gold:"Gold",heaven:"Heaven"},cT={eden:"You arrive at Juniper’s lamp. The creek garden — Story Creek — holds Jesus stories. Heaven waits on the ridge.",village:"Mercy’s oaks and Silas’s square. Stories first, then public names.",town:"Nora’s dome looks up. Fine-tuning lives with the sky.",gold:"Ansel’s gate asks why there is a world. The lookout is close enough to see.",heaven:"Hope’s ridge and the City of Heaven. You kept the trail."},hT=8,dT={eden:.14,village:.34,town:.56,gold:.8,heaven:1};function uT(a){return a==="eden"?"seed":a==="village"?"wait":a==="town"?"rise":a==="gold"?"ridge":"city"}function mT(a){return a==="eden"?null:a==="village"?"Heaven waits":a==="town"?"Toward Heaven":a==="gold"?"The ridge":"City of Heaven"}function pT(a){const o=_d(a),r=a.held?.length??0;return o.lookout==="lit"&&r>=hT?"heaven":o.gate==="built"||o.gate==="lit"||o.lookout!=="empty"?"gold":o.bench==="built"||o.bench==="lit"||o.observatory!=="empty"?"town":(a.dailyDates?.length??0)>=1||o.hollow!=="empty"?"village":"eden"}function Gd(a,o){switch(a){case"porch":return o.dailyDates.length;case"hollow":return Jt(Ho,o.completed);case"bench":return Jt(hi,o.completed);case"observatory":return Jt(di,o.completed);case"gate":return Jt(ui,o.completed);case"lookout":return Jt(Wo,o.completed);case"journal":return o.journal.length;case"lamps":return Dg(o.stars)+(o.defense?.cleared??0);default:return 0}}function fT(a,o,r){return o==="porch"&&!r?"Walk next":a==="scaffold"||a==="empty"?"Build next":"Still lit"}function yT(a,o,r,c=!1){switch(a){case"porch":return o==="scaffold"||o==="empty"?"Juniper’s porch roof will go on":o==="built"?"The east lantern will hold":"The porch stays lit";case"hollow":return o==="empty"||o==="scaffold"?"Mercy’s cabin will stand":r<2?"Another oak will rise":r<3?"A porch oak will sprout":r<4?"The last oak will rise":"The oaks will light";case"bench":return o==="empty"||o==="scaffold"?"Silas’s hall will stand":r<2?"A window will open":r<3?"Another window will open":r<4?"The last window will open":"The square will warm";case"observatory":return o==="empty"||o==="scaffold"?"Nora’s dome will rise":r<2?"Glass will set in the dome":r<3?"The oculus will catch":r<4?"The last glass will set":"Stars will catch the glass";case"gate":return o==="empty"||o==="scaffold"?"Ansel’s arch will stand":r<2?"Stone will settle":r<3?"A lantern will hang":r<4?"The last stone will set":"The east road will warm";case"lookout":return o==="empty"||o==="scaffold"?"Hope’s tower will rise":r<2?"The flag will kick":r<3?"A ridge lantern will hang":r<4?"The last timber will set":"The ridge lantern will hold";case"journal":return o==="empty"||o==="scaffold"?c?"River’s page house will stand":"The dossier house will stand":r<4?"Another page will land":r<12?"The window will glow":"The pages will glow";case"lamps":return o==="empty"||o==="scaffold"?"The first street lamp will catch":r<4?"Another lamp will catch":r<12?"The street will remember":"The street stays remembered";default:return"The town will grow"}}const zd="silver-city-seen-city-v1",Jd="silver-city-seen-fill-v1",Pg="silver-city-homecoming-v1",gT=["lookout","lamps","gate","observatory","bench","hollow","journal","porch"];function wT(a){for(const o of gT)if(a[o]==="lit"||a[o]==="built")return o;return null}function bT(){if(typeof window>"u")return null;try{return window.localStorage.getItem(Pg)}catch{return null}}function Ly(a){if(!(typeof window>"u"))try{window.localStorage.setItem(Pg,a)}catch{}}const si={empty:0,scaffold:1,built:2,lit:3};function _d(a){const o={};for(const r of tt)o[r.id]=us(r.id,a);return o}function vT(a){const o={};for(const r of tt)o[r.id]=Gd(r.id,a);return o}function kT(a,o){const r=[];for(const c of tt){const d=a[c.id],u=o[c.id];si[u]<=si[d]||r.push({id:c.id,from:d,to:u,beat:u==="lit"?"Lit!":u==="built"?"Built!":"Unlocked",title:c.title})}return r.sort((c,d)=>si[d.to]-si[c.to]||si[c.from]-si[d.from]),r}function TT(a,o,r,c){const d=new Set(c.map(g=>g.id)),u=[];for(const g of tt){const y=a[g.id]??0;if((o[g.id]??0)<=y||d.has(g.id))continue;const w=r[g.id];u.push({id:g.id,from:w,to:w,beat:"Grew!",title:g.title})}return u}function xT(){if(typeof localStorage>"u")return null;try{const a=localStorage.getItem(zd);if(!a)return null;const o=JSON.parse(a);return!o||typeof o!="object"?null:o}catch{return null}}function So(a){typeof localStorage>"u"||localStorage.setItem(zd,JSON.stringify(a))}function ST(){if(typeof localStorage>"u")return null;try{const a=localStorage.getItem(Jd);if(!a)return null;const o=JSON.parse(a);return!o||typeof o!="object"?null:o}catch{return null}}function vo(a){typeof localStorage>"u"||localStorage.setItem(Jd,JSON.stringify(a))}function Hy(){typeof localStorage>"u"||(localStorage.removeItem(zd),localStorage.removeItem(Jd))}const MT={easy:1,medium:2,hard:3};function kl(a){return MT[a]}function za(a,o){const r=a.lessonTier?.[o];return Mg(r)?r:"easy"}function jT(a,o){return qd(a.lessonScore?.[o])}function Ud(a,o){const r=za(a,o),c=jT(a,o);return c?kl(c)<kl(r):(a.easyHeld??[]).includes(o)||r!=="easy"}function CT(a,o){const r=za(a,o),d=ki(o)?.[r],u=d?.points??ci[r],g=a.lessonScore?.[o]??0,y={...a.lessonScore??{},[o]:Math.max(g,u)},p=d?.hold.levelUpTo??jk[r],w={...a.lessonTier??{}};return p?w[o]=p:w[o]=r,{lessonScore:y,lessonTier:w}}function AT(a,o){return{lessonTier:{...a.lessonTier??{},[o]:"easy"}}}function NT(a){return Object.values(a.lessonScore??{}).reduce((o,r)=>o+r,0)}function ET(a){const o={easy:0,medium:0,hard:0};for(const r of Object.values(a.lessonScore??{})){const c=qd(r);c&&(o[c]+=1)}return o}function Tl(a){const o=qd(a);return o==="hard"?"Hard 15":o==="medium"?"Medium 12":o==="easy"?"Easy 10":""}function ye(a){return!!a.easyMode}const ee={creed:"old shared belief",parable:"Jesus story",connectLink:"Tap the sentence, then the place, then the person.",matchHunt:"Swipe or tap the gems. Find today’s words.",readStory:"Read today’s story.",learnCta:"Learn",readStoryFirst:"Read the story first",learnThisFirst:"Learn this first.",rememberSentence:"Tap the line you kept.",tapWhy:"Tap why this is true.",keepThis:"Keep this",claimTeach:"A claim is the main idea we hold to be true.",mainIdeaTeach:"Main idea = the short true line we keep.",reasonSense:"why this is true",whyStands:"Why this is true.",sourceSense:"where this comes from",lockIn:"Save your picks.",matchHow:"Keep the right pictures. Remove wrong picks.",manage:"Manage",matchCta:"Match",matchDone:"Match done",matchWin:"Matched!",holdNext:"Hold next",continueStreet:"Continue tonight’s street",nightDo:"Night Watch",nightTap:"Tap the face.",nightLead:"Tap the face six times.",nightMiss:"Wrong — tap the glowing face",home:"Home",townSoon:"Town (soon)",loveCue:"Love — when compassion moves you, help like the Samaritan. Tap the glowing face.",saved:"Hold",savedSub:"saved lines",connections:"Connections",uses:"Things you can use"};function wd(a){return`Wrong. Tap this one: ${a.replace(/\.$/,"").trim()}.`}const LT="Love — tap the matching face. A true line turns a cheap claim toward heaven.",Wy={"td-watch":ee.loveCue};function Iy(a){return a?ee.loveCue:LT}const HT={"Received mercy makes refusing mercy a contradiction.":"Forgiven a huge debt — do not choke a neighbor.","The servant forgiven an unpayable debt then throttles a peer over a small sum.":"He was forgiven much, then choked a neighbor.","Jesus is only reforming first-century banking.":"Jesus is only talking about old money rules.","Forgiveness is a limited coupon on God’s spreadsheet.":"Forgiveness is not a limited coupon.","The first servant was right to demand prison for a small debt.":"He was right to refuse mercy.","The first servant was right to demand prison.":"He was right to refuse mercy.","Peter’s “seven times” was already the full measure.":"Seven times was already enough.","Honor is spent so the son can be embraced; the older brother shows nearness without joy.":"The father hugs him first.","The older brother is the hero for staying home.":"The older brother is the hero just for staying.","Jesus makes the listener identify with the wounded man, then with the Samaritan moved with compassion.":"First the hurt man, then help.","The story is mainly a map of the Jericho road.":"The story is only a road map.","Mercy is optional once you have classified the victim.":"Mercy is optional after you sort people.","The father waits until justice is complete.":"The father waits until justice is done.","Soil, search, a tiny seed, and a trust form a portrait — not a slogan.":"Pictures tell it — not a slogan.","Burial resists a merely “spiritual” death; appearances resist a merely “spiritual” raising.":"Buried and seen — not only a spirit story.","Appearances are admitted to be visions with no named people.":"The seen people are only nameless visions.","Paul quotes a received formula and names known people; Luke claims inquiry among witnesses.":"Paul names known people who saw it.","Distance in time is the only historical question that matters.":"Only the date matters — names do not.","Multiple attestation, embarrassment, early reports, and context resist “late pious novel.”":"Many early, awkward reports beat a late tale.","Luke records that the apostles dismissed them — a costly opening if the goal were instant respectability.":"The men first called the women wrong.","Life-permitting ranges are extravagantly narrow across independent parameters; design predicts a habitable cosmos, blank chance does not.":"Life needs tight numbers — chance does not explain that.","Life-permitting ranges are wide; blank chance predicts a habitable cosmos just as well.":"Life numbers are wide — chance is enough.","Life-permitting ranges are extravagantly narrow; a Designer who wants observers leads us to expect that fit — blank indifference does not.":"A Designer who wants people fits these numbers.","Models describe a world already given; a physical “vacuum” is still something.":"A model still starts with something there.","Cells store coordinated information; that looks like the work of a mind — wonder is rational, and so is more work.":"Cells store info that looks like a mind’s work.","Nothing reduces itself from potential to actual; an unexplained stack of changers is not an explanation.":"Nothing changes itself without a first mover.","Contingent things exist; “it just is” is also a metaphysics, not automatically cheaper.":"Things that might not exist still need a ground.","Brute fact is not a metaphysical move.":"“It just is” is not an answer.","That yields a Cause of the beginning; naming Abraham’s God takes further historical steps.":"A beginning has a Cause — more steps name God.","Aquinas argues onward from the Ways; the New Testament adds a particular history.":"The first-cause walk is not yet the whole gospel.","Romans 2 treats moral knowledge as widely shared, which is why strangers can accuse one another.":"We all know duty — strangers can still accuse.","Theism is a reply in which mind is present at the beginning, not only an accident at the end.":"Mind is there at the start — not a late accident.","A story without mind can still house the storyteller with no remainder.":"A no-mind story still has to house the teller.","Ecclesiastes refuses to let work and pleasure pretend to be the final good, and refuses to call them worthless as gifts.":"Work and fun are gifts — not the last good.","Longing for a country the sunset cannot give is a mark that we were made for that country; Psalm 19 treats the sky as speech.":"The sunset wakes a hunger it cannot feed.","Jesus uses an ordinary lamp and a city on a hill — public without being proud.":"A lamp and a hill city are meant to be seen.","A lamp is seen, seed meets different hearts, and the cup is poured for many — gift, not wage.":"Lamp, seed, and cup are gifts you can hold.","The parable invites hearing; it does not flatter every field.":"Not every field is good soil.","Paul lists Cephas, the Twelve, and more than five hundred — many still living then.":"Paul names many people who were still alive.","If the formula is early, the claim is close to what it names: died, buried, raised.":"If the line is early, it is close to the event.","Scripture treats the created order as intelligible testimony — design inference and “the heavens declare” land in the same grain.":"The sky speaks of a Maker — the numbers fit that.","Copying cells, a habitable band, and a mind that can do science all look given — the marks of a Maker.":"Life, a livable world, and minds look given.","Scribes copy, later hands compare, then a modern page prints a recovered text.":"Scribes copy, later hands compare, then we print it.","The poem’s Servant suffers for others and does not answer with a sword; the church names that Servant as Jesus.":"The Servant suffers for others — the church names Jesus.","The claim is that God moves first — not that you finished the map.":"God moves first — you did not finish the map.","The invitation is to a person — “Come to me” — not a performance.":"Come to me — rest is a gift, not a show.","Jesus asks who *proved* to be a neighbor — the one who showed mercy.":"Jesus asks who showed mercy — that one is neighbor.","The wounded man must first classify the helper.":"The hurt man must first sort the helper.","The town does not sand that awkwardness into a tidy triumph.":"The first report stays awkward — not a tidy win.","The psalms ask the question out loud and expect a Giver, not a shrug.":"The psalms ask why — and expect a Giver.","You may refuse it; the town will not lock you in a pew.":"You may refuse — no one locks you in a pew.","Love, logic, reason, and science you have kept can divert a false step up the ridge.":"Love, logic, reason, and science turn a false step."};function Bd(a){return a.replace(new RegExp("\\bcheap claim\\b","gi"),"unkind sentence").replace(new RegExp("\\bcheap line\\b","gi"),"unkind sentence").replace(/\bmean lines\b/gi,"unkind sentences").replace(/\bmean line\b/gi,"unkind sentence").replace(/\bthe claims\b/gi,"the main ideas").replace(/\ba claim\b/gi,"a main idea").replace(/\bthe claim\b/gi,"the main idea").replace(/\bA claim\b/g,"A main idea").replace(/\bThe claim\b/g,"The main idea").replace(/\bsoils\b/gi,"ground")}function En(a){const o=HT[a];return o||Bd(a).replace(/first-century banking/gi,"old money rules").replace(/\bcontradiction\b/gi,"doesn't add up").replace(/\bthrottles\b/gi,"chokes").replace(/\bthrottle\b/gi,"choke")}const Ry=12;function cl(a){const o=En(a).trim(),r=o.split(new RegExp("(?<=[.!?])\\s+"))[0]??o,c=r.split(/\s+/).filter(Boolean);return c.length<=Ry?r:c.slice(0,Ry).join(" ")}function WT(a){const o=a.toLowerCase();return o.includes("neighbor")?"neighbor picture":o.includes("tomb")||o.includes("empty")?"empty-tomb picture":o.includes("star")||o.includes("sky")||o.includes("heaven")?"star picture":o.includes("bread")||o.includes("table")||o.includes("cup")?"shared-table picture":o.includes("seed")||o.includes("ground")||o.includes("soil")?"seed picture":o.includes("lamp")||o.includes("light")?"lamp picture":o.includes("unkind sentence")||o.includes("mean line")||o.includes("true one")||o.includes("true line")?"true-line picture":"story picture"}function Gg(a){const o=a.anchor.split(" · ").map(g=>g.trim()),r=o[0]||"Juniper",c=(o[1]??"").replace(/\s*after\s+.*/i,"").trim()||"East porch",d=WT(a.beat??""),u=[r,c,d];return a.tool&&u.push(`used as ${a.tool}`),u.join(" · ")}function hn(a,o){if(a&&Wy[a]){const r=Wy[a];if(o===r||o===Et(a)?.claim)return r}return Bd(o)}function hl(a,o,r){const c=new Set,d=[],u=[r,...a.filter(y=>y!==r)];for(const y of u){const p=o(y).trim();!p||c.has(p)||(c.add(p),d.push(y))}const g=new Map;return a.forEach((y,p)=>{g.has(y)||g.set(y,p)}),g.has(r)||g.set(r,-1),d.sort((y,p)=>(g.get(y)??99)-(g.get(p)??99))}const IT=["ph-road","ph-father","ph-debt","wb-creed","wb-women","daily-lantern","daily-stars","daily-cosmos","hl-moral"],Oy=Kk(),bd=Oy.length?Oy:[...IT],xl=bd[0]??"ph-road",qy={"ph-road":{whoId:"mercy",plotId:"hollow"},"ph-father":{whoId:"mercy",plotId:"hollow"},"ph-debt":{whoId:"mercy",plotId:"hollow"},"wb-creed":{whoId:"silas",plotId:"bench"},"wb-women":{whoId:"silas",plotId:"bench"},"daily-lantern":{whoId:"juniper",plotId:"porch"},"daily-stars":{whoId:"nora",plotId:"observatory"},"daily-cosmos":{whoId:"ansel",plotId:"gate"},"hl-moral":{whoId:"hope",plotId:"lookout"}};function zg(a){return qy[a]?qy[a]:a.startsWith("ph-")||a==="td-watch"?{whoId:"mercy",plotId:"hollow"}:a.startsWith("wb-")?{whoId:"silas",plotId:"bench"}:a.startsWith("ob-")?{whoId:"nora",plotId:"observatory"}:a.startsWith("fg-")?{whoId:"ansel",plotId:"gate"}:a.startsWith("hl-")?{whoId:"hope",plotId:"lookout"}:{whoId:"juniper",plotId:"porch"}}function Fd(a){const o=ki(a);if(o?.loci){const r=o.loci.who in en?o.loci.who:zg(a).whoId,c=en[r]??en.juniper;return{who:c.shortName,whoName:c.name,whoId:c.id,place:o.loci.place||Dy(a).place}}return Dy(a)}function Dy(a){const o=zg(a),r=en[o.whoId],c=tt.find(d=>d.id===o.plotId);return{who:r.shortName,whoName:r.name,whoId:r.id,place:c?.title??"East porch"}}function RT(a){const{who:o,place:r}=Fd(a);return`This idea lives at ${r}, with ${o}.`}function $d(a,o){const r=za(a,o);if(r==="easy")return(a.easyTaught??[]).includes(o);const c=a.tierTaught?.[o];return c?c===r||kl(c)>=kl(r):!1}function Go(a,o){return(a.easyHeld??[]).includes(o)}function ps(a){for(const o of bd)if(!Go(a,o))return o;for(const o of bd)if(za(a,o)!=="hard")return o;return xl}function OT(a){return ps(a)}function Jg(a){return ps(a)}function qT(a){return ps(a)}function vd(a){return $d(a,ps(a))}function DT(a){const o=ps(a);return $d(a,o)&&(!Go(a,o)||Ud(a,o))?"match":"learn"}function PT(a){const o=ps(a);return $d(a,o)?Go(a,o)?Ud(a,o):!0:!1}function Kd(a){return PT(a)?{name:"journal",focusId:qT(a),autoQuiz:!0}:{name:"journal"}}function _g(a,o){const r=a??[];return r.includes(o)?r:[...r,o]}function GT(a,o){return _g(a.easyTaught,o)}function Py(a,o){return _g(a.easyHeld,o)}function zT(a,o){return a?o===void 0?ee.connections:`${ee.connections} · ${o} lit`:o===void 0?"Mind map":`Mind map · ${o} lit`}const Ug=["ph-road","wb-creed","daily-lantern"],Yd=[{id:"place-hollow",kind:"place",text:"Story Creek",plotId:"hollow"},{id:"place-bench",kind:"place",text:"Witness Square",plotId:"bench"},{id:"place-porch",kind:"place",text:"East porch",plotId:"porch"},{id:"place-sky",kind:"place",text:"Sky Watch",plotId:"observatory"},{id:"place-gate",kind:"place",text:"Why Gate",plotId:"gate"},{id:"place-lookout",kind:"place",text:"Meaning Ridge",plotId:"lookout"}],Bg=[{id:"person-mercy",kind:"person",text:"Mercy Wren",who:"mercy"},{id:"person-silas",kind:"person",text:"Silas Whitman",who:"silas"},{id:"person-juniper",kind:"person",text:"Juniper Wick",who:"juniper"},{id:"person-nora",kind:"person",text:"Nora Skye",who:"nora"},{id:"person-ansel",kind:"person",text:"Ansel Gate",who:"ansel"},{id:"person-hope",kind:"person",text:"Hope Ridge",who:"hope"}],fs=[{evidenceId:"ph-road",ideaId:"idea-mercy",tripleId:"mercy-hollow",placeId:"place-hollow",personId:"person-mercy",text:"Neighbor is the one who shows mercy.",caption:"Neighbor is the one who shows mercy."},{evidenceId:"ph-father",ideaId:"idea-father",tripleId:"father-hollow",placeId:"place-hollow",personId:"person-mercy",text:"The father runs with mercy before the speech is done.",caption:"The father runs with mercy before the speech is done."},{evidenceId:"ph-seeds",ideaId:"idea-seeds",tripleId:"seeds-hollow",placeId:"place-hollow",personId:"person-mercy",text:"The kingdom arrives in pictures, not slogans.",caption:"The kingdom arrives in pictures."},{evidenceId:"ph-debt",ideaId:"idea-debt",tripleId:"debt-hollow",placeId:"place-hollow",personId:"person-mercy",text:"Received mercy makes refusing mercy a contradiction.",caption:"Received mercy makes refusing mercy a contradiction."},{evidenceId:"wb-creed",ideaId:"idea-silas",tripleId:"silas-bench",placeId:"place-bench",personId:"person-silas",text:"Paul hands on an early public creed: died, buried, raised, appeared.",caption:"Died, buried, raised, appeared."},{evidenceId:"wb-early",ideaId:"idea-early",tripleId:"early-bench",placeId:"place-bench",personId:"person-silas",text:"The resurrection claim sits close to the events, not as a late legend.",caption:"The claim sits close to the events."},{evidenceId:"wb-method",ideaId:"idea-method",tripleId:"method-bench",placeId:"place-bench",personId:"person-silas",text:"Ordinary historical tools weigh testimony; they do not replace reading.",caption:"History tools weigh testimony."},{evidenceId:"wb-women",ideaId:"idea-women",tripleId:"women-bench",placeId:"place-bench",personId:"person-silas",text:"The first tomb reports begin with women — an awkward opening if invented for respectability.",caption:"Women first saw the tomb."},{evidenceId:"daily-names",ideaId:"idea-names",tripleId:"names-bench",placeId:"place-bench",personId:"person-silas",text:"The resurrection claim stacks named witnesses, not one private voice.",caption:"Named witnesses, not one private voice."},{evidenceId:"daily-creed",ideaId:"idea-daily-creed",tripleId:"creed-bench",placeId:"place-bench",personId:"person-silas",text:"The creed sits between the event and Paul’s letter.",caption:"The creed sits close to the event."},{evidenceId:"daily-empty",ideaId:"idea-empty",tripleId:"empty-bench",placeId:"place-bench",personId:"person-silas",text:"The first Easter reports include an empty place, women, fear, and wonder.",caption:"Easter begins with an empty place."},{evidenceId:"daily-lantern",ideaId:"idea-juniper",tripleId:"juniper-porch",placeId:"place-porch",personId:"person-juniper",text:"A lamp is meant to be seen.",caption:"A lamp is meant to be seen."},{evidenceId:"daily-gems",ideaId:"idea-gems",tripleId:"gems-porch",placeId:"place-porch",personId:"person-juniper",text:"Jesus taught with pictures you can hold.",caption:"Jesus taught with pictures you can hold."},{evidenceId:"daily-seed",ideaId:"idea-seed",tripleId:"seed-porch",placeId:"place-porch",personId:"person-juniper",text:"The same word meets different soils; some seed is lost.",caption:"The same word meets different soils."},{evidenceId:"daily-neighbor",ideaId:"idea-neighbor",tripleId:"neighbor-porch",placeId:"place-porch",personId:"person-juniper",text:"Mercy makes a neighbor; pedigree does not.",caption:"Mercy makes a neighbor."},{evidenceId:"ob-tuning",ideaId:"idea-tuning",tripleId:"tuning-sky",placeId:"place-sky",personId:"person-nora",text:"The universe is finely tuned for life — that fit points to a Designer.",caption:"Fine-tuning points to a Designer."},{evidenceId:"ob-design",ideaId:"idea-design",tripleId:"design-sky",placeId:"place-sky",personId:"person-nora",text:"Fine-tuning is best explained by a mind that intended a habitable world.",caption:"A mind intended a habitable world."},{evidenceId:"ob-leibniz",ideaId:"idea-leibniz",tripleId:"leibniz-sky",placeId:"place-sky",personId:"person-nora",text:"Why is there something rather than nothing remains after a cosmological model.",caption:"Why something rather than nothing."},{evidenceId:"ob-life",ideaId:"idea-ob-life",tripleId:"ob-life-sky",placeId:"place-sky",personId:"person-nora",text:"Life’s specified information is a mark of mind.",caption:"Life’s information is a mark of mind."},{evidenceId:"daily-stars",ideaId:"idea-stars",tripleId:"nora-sky",placeId:"place-sky",personId:"person-nora",text:"The heavens already speak of a Maker; fine-tuning fits that voice.",caption:"The heavens speak of a Maker."},{evidenceId:"daily-life",ideaId:"idea-daily-life",tripleId:"daily-life-sky",placeId:"place-sky",personId:"person-nora",text:"Life, place, and mind are not cheap facts.",caption:"Life, place, and mind are not cheap facts."},{evidenceId:"daily-cosmos",ideaId:"idea-cosmos",tripleId:"ansel-gate",placeId:"place-gate",personId:"person-ansel",text:"The universe exists and did not have to — so a Source is worth naming.",caption:"The world did not have to exist."},{evidenceId:"fg-mover",ideaId:"idea-mover",tripleId:"mover-gate",placeId:"place-gate",personId:"person-ansel",text:"Change here and now needs a first actuality that is not itself a receiver of change.",caption:"Change needs a first actuality."},{evidenceId:"fg-contingent",ideaId:"idea-contingent",tripleId:"contingent-gate",placeId:"place-gate",personId:"person-ansel",text:"A world of might-not-have-beens still needs a necessary ground.",caption:"Might-not-have-beens need a necessary ground."},{evidenceId:"fg-kalam",ideaId:"idea-kalam",tripleId:"kalam-gate",placeId:"place-gate",personId:"person-ansel",text:"If what begins has a cause and the universe began, it has a cause.",caption:"What begins has a cause."},{evidenceId:"fg-limits",ideaId:"idea-limits",tripleId:"limits-gate",placeId:"place-gate",personId:"person-ansel",text:"A cosmological argument is already a great deal — and not yet the sermon on the mount.",caption:"A first cause is not yet the whole gospel."},{evidenceId:"daily-scroll",ideaId:"idea-scroll",tripleId:"scroll-gate",placeId:"place-gate",personId:"person-ansel",text:"We hold a river of copies, not the first ink.",caption:"We hold a river of copies."},{evidenceId:"daily-isaiah",ideaId:"idea-isaiah",tripleId:"isaiah-gate",placeId:"place-gate",personId:"person-ansel",text:"Isaiah 53’s Servant is the Jesus the church confesses — wounded for others, silent like a lamb.",caption:"Isaiah’s Servant is Jesus."},{evidenceId:"hl-moral",ideaId:"idea-moral",tripleId:"hope-lookout",placeId:"place-lookout",personId:"person-hope",text:"Duty presents itself as more than taste — and theism is a natural home for that.",caption:"Duty is more than taste."},{evidenceId:"hl-mind",ideaId:"idea-mind",tripleId:"mind-lookout",placeId:"place-lookout",personId:"person-hope",text:"A story of the world must find a home for mind — including the storyteller.",caption:"The story must house the storyteller’s mind."},{evidenceId:"hl-meaning",ideaId:"idea-meaning",tripleId:"meaning-lookout",placeId:"place-lookout",personId:"person-hope",text:"Local meaning can be built — the lookout asks whether it is also received.",caption:"Meaning may be received, not only built."},{evidenceId:"hl-beauty",ideaId:"idea-beauty",tripleId:"beauty-lookout",placeId:"place-lookout",personId:"person-hope",text:"Beauty wakes a hunger it cannot feed — hungers usually correspond to real countries.",caption:"Beauty wakes a hunger it cannot feed."},{evidenceId:"daily-grace",ideaId:"idea-grace",tripleId:"grace-lookout",placeId:"place-lookout",personId:"person-hope",text:"Grace is gift, not wage; faith receives; boast starves.",caption:"Grace is gift, not wage."},{evidenceId:"daily-rest",ideaId:"idea-rest",tripleId:"rest-lookout",placeId:"place-lookout",personId:"person-hope",text:"Tired people are named first; rest is the gift, not a steeper hill.",caption:"Rest is the gift, not a steeper hill."},{evidenceId:"daily-door",ideaId:"idea-door",tripleId:"door-lookout",placeId:"place-lookout",personId:"person-hope",text:"Jesus’ “door” is a particular way in with a wide anyone.",caption:"Jesus is a door with a wide anyone."}],JT=fs.map(a=>({id:a.ideaId,kind:"idea",text:a.text,evidenceId:a.evidenceId})),Vd=[...JT,...Yd,...Bg],zn=fs.map(a=>({id:a.tripleId,ideaId:a.ideaId,placeId:a.placeId,personId:a.personId})),_T=Object.fromEntries(fs.map(a=>[a.evidenceId,a.tripleId]));fs.map(a=>a.evidenceId);function UT(a){if(a.length<=5)return[a];const o=Math.ceil(a.length/2);return[a.slice(0,o),a.slice(o)]}function BT(){const a=[];for(const o of Yd){const r=fs.filter(d=>d.placeId===o.id),c=UT(r);c.forEach((d,u)=>{const g=c.length>1&&u>0,y=Bg.find(p=>p.id===d[0]?.personId);a.push({id:g?`${o.id}-more`:o.id,placeId:o.id,placeTitle:g?`${o.text} · more`:o.text,personName:y?.text??"",triples:d.map(p=>({id:p.tripleId,ideaId:p.ideaId,placeId:p.placeId,personId:p.personId}))})})}return a}function kd(a,o){const r=new Set(a);for(const c of o)r.add(c);return zn.map(c=>c.id).filter(c=>r.has(c))}function pl(a){const o=new Set(a);return zn.filter(r=>!o.has(r.id)).length}function FT(a){return(a.completed??[]).includes("ln-street")?!0:pl(a.streetLinked??[])<=0}function Xd(a){const o=new Set(a);for(const r of BT()){const c=r.triples.filter(d=>!o.has(d.id));if(c.length>0)return{...r,triples:c}}}function $T(a){const o=Xd(a);return{...Da,title:o?`Tonight’s street · ${o.placeTitle}`:Da.title,triples:o?.triples??[]}}function KT(a,o){if(!a||o<=0)return Da.deeper;const r=rx[a.triples[0]?.id??""]?.hard??"";return(r.split(new RegExp("(?<=[.!?])\\s+"))[0]??r).trim()||`${a.personName} keeps ${a.placeTitle}.`}function YT(a,o){return a.filter(r=>r.id!==o&&r.evidenceId!=="ph-road")}const Da={kind:"link",id:"ln-street",title:"Link the street",idea:"an idea lives at a place, with a person",prompt:"Tap a block, then the place or person that belongs with it.",context:"An idea lives at a place, with a person. Mercy at the creek because Jesus stories live there. Silas at the square because names belong in a ledger. Juniper on the east porch because a lamp is meant to be seen. Nora at Sky Watch because the heavens already speak of a Maker. Ansel at Why Gate because the world exists and did not have to. Hope at Meaning Ridge because duty, mind, meaning, and beauty look over the town.",nodes:Vd,triples:zn,teachOnWrong:"Same story: idea, the lot it lives on, and the person who keeps it — for a reason.",deeper:"Mercy keeps the creek because Jesus taught in pictures (Luke 10:36). Silas keeps the square because the creed is a public report. Juniper keeps the porch because a lamp is meant to be seen. Nora keeps the ridge because the heavens declare a Maker. Ansel keeps the gate because what exists did not have to. Hope keeps the lookout because duty is more than taste."};function Fg(a){return zn.find(o=>o.id===a)}function VT(a){return Vd.find(o=>o.id===a)}function $g(a){return fs.find(o=>o.evidenceId===a)}function XT(a){return fs.find(o=>o.tripleId===a)}function QT(a){return _T[a]??"mercy-hollow"}function ZT(a){const o=QT(a),r=Fg(o);return{...Da,nodes:Vd,triples:r?[r]:[zn[0]]}}const ex=["Mercy Wren · Story Creek · Neighbor is the one who shows mercy.","Silas Whitman · Witness Square · died, buried, raised, appeared.","Juniper Wick · East porch · A lamp is meant to be seen.","Nora Skye · Sky Watch · The heavens speak of a Maker.","Ansel Gate · Why Gate · The world did not have to exist.","Hope Ridge · Meaning Ridge · Duty is more than taste."],tx=["Mercy Wren keeps Story Creek: Jesus taught in pictures by the road and the water.","Silas Whitman keeps Witness Square: died, buried, raised, appeared is a public creed.","Juniper Wick keeps the east porch: a lamp is meant to be seen.","Nora Skye keeps Sky Watch: the heavens declare a Maker, and fine-tuning fits that voice.","Ansel Gate keeps Why Gate: the world exists and did not have to.","Hope Ridge keeps Meaning Ridge: duty, mind, meaning, and beauty look over the town."];function Kg(a,o){if(a.who)return{who:a.who};if(a.plotId)return{plotId:a.plotId};if(a.evidenceId==="ph-road")return{art:"ph-road"};const r=o.triples.find(g=>g.ideaId===a.id),c=o.nodes.find(g=>g.id===r?.placeId);if(c?.plotId)return{plotId:c.plotId};const d=o.nodes.find(g=>g.id===r?.personId);if(d?.who)return{who:d.who};const u=$g(a.evidenceId??"");if(u){const g=Yd.find(y=>y.id===u.placeId);if(g?.plotId)return{plotId:g.plotId}}return{}}const nx={"place-hollow":{place:"That story lives at the creek.",person:"Mercy keeps that creek."},"place-bench":{place:"Those names sit at the square.",person:"Silas keeps that square."},"place-porch":{place:"That lamp lives on the porch.",person:"Juniper keeps that porch."},"place-sky":{place:"That voice lives at Sky Watch.",person:"Nora keeps that sky."},"place-gate":{place:"That question lives at Why Gate.",person:"Ansel keeps that gate."},"place-lookout":{place:"That line lives at Meaning Ridge.",person:"Hope keeps that ridge."}},ax={"mercy-hollow":{idea:"Mercy’s Jesus story — the neighbor who stops on the road.",place:"The neighbor-road story lives at Story Creek.",person:"Mercy Wren keeps the neighbor who stops."},"father-hollow":{idea:"Mercy’s Jesus story — the father who runs first.",place:"The father-run story lives at Story Creek.",person:"Mercy Wren keeps the father who runs."},"seeds-hollow":{idea:"Mercy’s Jesus stories — the kingdom arrives in pictures.",place:"That story lives at the creek.",person:"Mercy keeps that creek."},"debt-hollow":{idea:"Mercy’s Jesus story — forgiven much, then show mercy.",place:"The forgiven-debt story lives at Story Creek.",person:"Mercy Wren keeps the two servants."},"silas-bench":{idea:"Silas’s public names — died, buried, raised, appeared.",place:"Those names sit at the square.",person:"Silas keeps that square."},"early-bench":{idea:"Silas’s public names — the claim sits close to the events.",place:"Those names sit at the square.",person:"Silas keeps that square."},"method-bench":{idea:"Silas’s ledger — ordinary tools weigh testimony.",place:"Those names sit at the square.",person:"Silas keeps that square."},"women-bench":{idea:"Silas’s first report — women saw the tomb first.",place:"That report sits at the square.",person:"Silas keeps that square."},"names-bench":{idea:"Silas’s public names — Cephas, the Twelve, five hundred.",place:"Those names sit at the square.",person:"Silas keeps that square."},"creed-bench":{idea:"Silas’s handed-on creed — close to the event, then Paul’s letter.",place:"Those names sit at the square.",person:"Silas keeps that square."},"empty-bench":{idea:"Silas’s first Easter — empty place, women, fear, and wonder.",place:"That report sits at the square.",person:"Silas keeps that square."},"juniper-porch":{idea:"Juniper’s lamp — a light meant to be seen.",place:"That lamp lives on the porch.",person:"Juniper keeps that porch."},"gems-porch":{idea:"Juniper’s morning pictures — lamp, seed, and cup you can hold.",place:"That lamp lives on the porch.",person:"Juniper keeps that porch."},"seed-porch":{idea:"Juniper’s seed — the same word meets different soils.",place:"That lamp lives on the porch.",person:"Juniper keeps that porch."},"neighbor-porch":{idea:"Juniper’s porch line — mercy makes a neighbor.",place:"That lamp lives on the porch.",person:"Juniper keeps that porch."},"nora-sky":{idea:"Nora’s sky — the heavens speak of a Maker.",place:"That voice lives at Sky Watch.",person:"Nora keeps that sky."},"tuning-sky":{idea:"Nora’s sky — fine-tuning points to a Designer.",place:"That voice lives at Sky Watch.",person:"Nora keeps that sky."},"design-sky":{idea:"Nora’s sky — a mind intended a habitable world.",place:"That voice lives at Sky Watch.",person:"Nora keeps that sky."},"leibniz-sky":{idea:"Nora’s sky — why something rather than nothing.",place:"That voice lives at Sky Watch.",person:"Nora keeps that sky."},"ob-life-sky":{idea:"Nora’s sky — life’s information is a mark of mind.",place:"That voice lives at Sky Watch.",person:"Nora keeps that sky."},"daily-life-sky":{idea:"Nora’s sky — life, place, and mind are given.",place:"That voice lives at Sky Watch.",person:"Nora keeps that sky."},"ansel-gate":{idea:"Ansel’s why — the world exists and did not have to.",place:"That question lives at Why Gate.",person:"Ansel keeps that gate."},"mover-gate":{idea:"Ansel’s why — change needs a first actuality.",place:"That question lives at Why Gate.",person:"Ansel keeps that gate."},"contingent-gate":{idea:"Ansel’s why — might-not-have-beens need a necessary ground.",place:"That question lives at Why Gate.",person:"Ansel keeps that gate."},"kalam-gate":{idea:"Ansel’s why — what begins has a cause.",place:"That question lives at Why Gate.",person:"Ansel keeps that gate."},"limits-gate":{idea:"Ansel’s why — a first cause is not yet the whole gospel.",place:"That question lives at Why Gate.",person:"Ansel keeps that gate."},"scroll-gate":{idea:"Ansel’s pages — we hold a river of copies.",place:"That question lives at Why Gate.",person:"Ansel keeps that gate."},"isaiah-gate":{idea:"Ansel’s scroll — Isaiah’s Servant is Jesus.",place:"That question lives at Why Gate.",person:"Ansel keeps that gate."},"hope-lookout":{idea:"Hope’s ridge — duty is more than a taste.",place:"That line lives at Meaning Ridge.",person:"Hope keeps that ridge."},"mind-lookout":{idea:"Hope’s ridge — the story must house the storyteller’s mind.",place:"That line lives at Meaning Ridge.",person:"Hope keeps that ridge."},"meaning-lookout":{idea:"Hope’s ridge — meaning may be received, not only built.",place:"That line lives at Meaning Ridge.",person:"Hope keeps that ridge."},"beauty-lookout":{idea:"Hope’s ridge — beauty wakes a hunger it cannot feed.",place:"That line lives at Meaning Ridge.",person:"Hope keeps that ridge."},"grace-lookout":{idea:"Hope’s ridge — grace is gift, not wage.",place:"That line lives at Meaning Ridge.",person:"Hope keeps that ridge."},"rest-lookout":{idea:"Hope’s ridge — rest is the gift, not a steeper hill.",place:"That line lives at Meaning Ridge.",person:"Hope keeps that ridge."},"door-lookout":{idea:"Hope’s ridge — Jesus is a door with a wide anyone.",place:"That line lives at Meaning Ridge.",person:"Hope keeps that ridge."}};function sx(a,o){const r=ax[a]?.[o];if(r)return r;const c=XT(a);return c?o==="idea"?c.caption:nx[c.placeId][o]:"Pick the match for this story."}function ix(a,o){const r=Fg(a);if(!r)return null;const c=o==="idea"?r.ideaId:o==="place"?r.placeId:r.personId,d=VT(c);return d?Yg(d,!0):null}function ox(a,o){const r=ix(a,o);return wd(r||"this one")}function Yg(a,o){if(o&&a.id==="place-hollow")return"Mercy’s creek";if(a.kind==="idea"){const r=$g(a.evidenceId??"");if(r)return r.caption}return a.text}const rx={"mercy-hollow":{easy:"Mercy lives at the creek because she tells Jesus stories. The neighbor who stops on the road is a picture, so it lives at Story Creek.",hard:"Mercy Wren keeps Story Creek: Jesus taught in pictures by the road and the water. Neighbor is the one who shows mercy — that line belongs with the storyteller, not the clerk."},"father-hollow":{easy:"Mercy tells the father-run story at the creek. The father runs with mercy, so it lives at Story Creek.",hard:"Mercy Wren keeps Story Creek. The father runs before the speech is done — a Jesus story, not a square report."},"seeds-hollow":{easy:"Mercy tells kingdom pictures at the creek. The kingdom arrives in pictures, not slogans.",hard:"Mercy Wren keeps Story Creek. Soil, search, a tiny seed — Jesus taught the kingdom in pictures, not slogans."},"debt-hollow":{easy:"Mercy tells the forgiven-debt story at the creek. Received mercy must give mercy.",hard:"Mercy Wren keeps Story Creek. Received mercy making refusal a contradiction is a Jesus story of two servants."},"silas-bench":{easy:"Silas copies names at the square. The old shared belief — died, buried, raised — sits with the public names.",hard:"Silas Whitman keeps Witness Square. Died, buried, raised, appeared is a public creed. It belongs in a ledger hall, not under the oaks."},"early-bench":{easy:"Silas keeps the square. The claim sits close to the events — not a late legend.",hard:"Silas Whitman keeps Witness Square. Paul quotes a received formula and names known people; the claim sits close to the events."},"method-bench":{easy:"Silas keeps the square. Ordinary tools weigh testimony; they do not replace reading.",hard:"Silas Whitman keeps Witness Square. Multiple attestation and early reports weigh testimony — they do not skip the texts."},"women-bench":{easy:"Silas keeps the square. Women saw the tomb first — an awkward first report.",hard:"Silas Whitman keeps Witness Square. Women as first tomb witnesses is a public report, not a creek picture."},"names-bench":{easy:"Silas keeps the square. Named witnesses — not one private voice.",hard:"Silas Whitman keeps Witness Square. Cephas, the Twelve, and more than five hundred are public names, not a private dream."},"creed-bench":{easy:"Silas keeps the square. The creed sits close to the event, then Paul’s letter.",hard:"Silas Whitman keeps Witness Square. The creed sits between the event and Paul’s letter — died, buried, raised."},"empty-bench":{easy:"Silas keeps the square. Easter begins with an empty place, women, fear, and wonder.",hard:"Silas Whitman keeps Witness Square. The first Easter reports include an empty place — the town does not sand that awkwardness away."},"juniper-porch":{easy:"Juniper’s lamp is on the porch so today’s line can be seen.",hard:"Juniper Wick keeps the east porch. A lamp is meant to be seen — so the morning line lives at the lamp, where the trail starts."},"gems-porch":{easy:"Juniper’s lamp is on the porch. Jesus taught with pictures you can hold.",hard:"Juniper Wick keeps the east porch. Lamp, seed, and cup are pictures you can hold — gift, not wage."},"seed-porch":{easy:"Juniper’s lamp is on the porch. The same word meets different soils.",hard:"Juniper Wick keeps the east porch. The parable invites hearing; it does not flatter every field."},"neighbor-porch":{easy:"Juniper’s lamp is on the porch. Mercy makes a neighbor.",hard:"Juniper Wick keeps the east porch. Mercy makes a neighbor; pedigree does not — the morning lamp holds that line."},"nora-sky":{easy:"Nora watches the sky. The heavens speak of a Maker.",hard:"Nora Skye keeps Sky Watch. The heavens declare a Maker — that voice belongs on the ridge, not the porch lamp."},"tuning-sky":{easy:"Nora watches the sky. Fine-tuning points to a Designer.",hard:"Nora Skye keeps Sky Watch. Life-permitting ranges are extravagantly narrow. Necessity, chance, and a sprawling multiverse get named so they can be set down — time still goes to a Designer who wanted a habitable world."},"design-sky":{easy:"Nora watches the sky. A mind intended a habitable world.",hard:"Nora Skye keeps Sky Watch. A Designer who wants observers leads us to expect that fit — blank indifference does not."},"leibniz-sky":{easy:"Nora watches the sky. Why something rather than nothing still stands.",hard:"Nora Skye keeps Sky Watch. Models describe a world already given; why there is something rather than nothing remains."},"ob-life-sky":{easy:"Nora watches the sky. Life’s information is a mark of mind.",hard:"Nora Skye keeps Sky Watch. Cells store coordinated information — that looks like the work of a mind."},"daily-life-sky":{easy:"Nora watches the sky. Life, place, and mind are not cheap facts.",hard:"Nora Skye keeps Sky Watch. Copying cells, a habitable band, and a mind that can do science all look given — the marks of a Maker."},"ansel-gate":{easy:"Ansel keeps Why Gate. The world exists — and did not have to.",hard:"Ansel Gate keeps Why Gate. That the universe exists and did not have to is the why-a-world stone."},"mover-gate":{easy:"Ansel keeps Why Gate. Change needs a first actuality.",hard:"Ansel Gate keeps Why Gate. Nothing reduces itself from potential to actual; present change needs a first actuality."},"contingent-gate":{easy:"Ansel keeps Why Gate. Might-not-have-beens need a necessary ground.",hard:"Ansel Gate keeps Why Gate. A world of might-not-have-beens still needs a necessary ground — not a shrug."},"kalam-gate":{easy:"Ansel keeps Why Gate. What begins has a cause.",hard:"Ansel Gate keeps Why Gate. If what begins has a cause and the universe began, it has a Cause of the beginning."},"limits-gate":{easy:"Ansel keeps Why Gate. A first cause is not yet the whole gospel.",hard:"Ansel Gate keeps Why Gate. A cosmological argument is already a great deal — and not yet the sermon on the mount."},"scroll-gate":{easy:"Ansel keeps Why Gate. We hold a river of copies, not the first ink.",hard:"Ansel Gate keeps Why Gate. Scribes copy, later hands compare — we hold a river of copies, not the first ink."},"isaiah-gate":{easy:"Ansel keeps Why Gate. Isaiah’s Servant is Jesus.",hard:"Ansel Gate keeps Why Gate. Isaiah 53’s Servant is the Jesus the church confesses — wounded for others, silent like a lamb."},"hope-lookout":{easy:"Hope keeps Meaning Ridge. Duty is more than a taste.",hard:"Hope Ridge keeps Meaning Ridge. Duty as more than taste looks over the town from the lookout."},"mind-lookout":{easy:"Hope keeps Meaning Ridge. The story must house the storyteller’s mind.",hard:"Hope Ridge keeps Meaning Ridge. Theism is a reply in which mind is present at the beginning, not only an accident at the end."},"meaning-lookout":{easy:"Hope keeps Meaning Ridge. Meaning may be received, not only built.",hard:"Hope Ridge keeps Meaning Ridge. Local meaning can be built — the lookout asks whether it is also received."},"beauty-lookout":{easy:"Hope keeps Meaning Ridge. Beauty wakes a hunger it cannot feed.",hard:"Hope Ridge keeps Meaning Ridge. Beauty wakes a hunger it cannot feed — hungers usually correspond to real countries."},"grace-lookout":{easy:"Hope keeps Meaning Ridge. Grace is gift, not wage.",hard:"Hope Ridge keeps Meaning Ridge. Grace is gift, not wage; faith receives; boast starves."},"rest-lookout":{easy:"Hope keeps Meaning Ridge. Rest is the gift, not a steeper hill.",hard:"Hope Ridge keeps Meaning Ridge. Tired people are named first; rest is the gift, not a steeper hill."},"door-lookout":{easy:"Hope keeps Meaning Ridge. Jesus is a door with a wide anyone.",hard:"Hope Ridge keeps Meaning Ridge. Jesus’ door is a particular way in with a wide anyone."}},Mt=[Ig,Rg,Wg,xg,Sg];function Qd(a){return Mt.find(o=>o.id===a)}function lx(a,o){return Qd(a)?.challenges.find(r=>r.id===o)}function Vg(a){for(const r of Mt){const c=r.challenges.find(d=>d.id===a);if(c)return{areaId:r.id,challenge:c}}const o=wl.find(r=>r.challenge.id===a);if(o)return{areaId:zo(a),challenge:o.challenge}}const Gy={"daily-lantern":"parable-hollow","daily-gems":"parable-hollow","daily-seed":"parable-hollow","daily-neighbor":"parable-hollow","daily-names":"witness-bench","daily-creed":"witness-bench","daily-empty":"witness-bench","daily-stars":"observatory","daily-life":"observatory","daily-cosmos":"observatory","daily-scroll":"first-gate","daily-isaiah":"first-gate","daily-grace":"high-lookout","daily-rest":"high-lookout","daily-door":"high-lookout"};function zo(a){for(const r of Mt)if(r.challenges.some(c=>c.id===a))return r.id;if(Gy[a])return Gy[a];if(a==="td-watch")return"parable-hollow";const o=Nt.find(r=>r.id===a||r.unlockAfter===a);return o?o.areaId:"daily-trail"}function ms(a){return Nt.find(o=>o.unlockAfter===a)}Mt.reduce((a,o)=>a+o.challenges.length,0);const cx=Nt.length,hx=""+new URL("portrait-ansel-BS6iPcTj.png",import.meta.url).href,dx=""+new URL("portrait-hope-DLqFLHZ5.png",import.meta.url).href,Xg=""+new URL("portrait-juniper-DAQGVsBF.png",import.meta.url).href,ux=""+new URL("portrait-mercy-BcQyFY5q.png",import.meta.url).href,mx=""+new URL("portrait-nora-OQaJZAKV.png",import.meta.url).href,Qg=""+new URL("portrait-river-ByMmrOE7.png",import.meta.url).href,px=""+new URL("portrait-silas-B_MD9G1g.png",import.meta.url).href,fx=""+new URL("walker-image-bearer-Db1tlbPV.png",import.meta.url).href,yx=""+new URL("walker-metaphysical-WXTtljRs.png",import.meta.url).href,gx=""+new URL("walker-pagan-ekS7NQp0.png",import.meta.url).href,wx=""+new URL("walker-physical-DYnhlXGi.png",import.meta.url).href,bx=""+new URL("walker-skeptic-BBzX3exg.png",import.meta.url).href,vx=""+new URL("walker-spiritual-AVZnjRv2.png",import.meta.url).href,kx={river:Qg,juniper:Xg,mercy:ux,silas:px,nora:mx,ansel:hx,hope:dx},Zg={"image-bearer":fx,skeptic:bx,pagan:gx,physical:wx,metaphysical:yx,spiritual:vx};function it({who:a,size:o="md",className:r=""}){const c=en[a];return s.jsx("span",{className:`avatar size-${o} ${r}`,role:"img","aria-label":`${c.name}, ${c.role}`,children:s.jsx("img",{src:kx[a],alt:"",draggable:!1})})}function Tx({kind:a,className:o="",style:r}){return s.jsx("img",{className:`walker-face ${o}`,src:Zg[a],alt:"",draggable:!1,"aria-hidden":!0,style:r})}function xx(a){return Zg[a]}function ew({who:a,line:o,kicker:r}){const c=en[a];return s.jsxs("aside",{className:"say pop-in",children:[s.jsx(it,{who:a,size:"md"}),s.jsxs("div",{className:"say-body",children:[s.jsx("p",{className:"eyebrow",children:r??c.role}),s.jsx("p",{className:"say-name",children:c.name}),s.jsxs("p",{className:"say-line",children:["“",o,"”"]})]})]})}const Sx={hollow:{label:"Story Creek",creek:!0},bench:{label:"Witness Square",bench:!0},porch:{label:"East porch",lamp:!0},observatory:{label:"Sky Watch",sky:!0},gate:{label:"Why Gate",gate:!0},lookout:{label:"Meaning Ridge",ridge:!0}};function Mx({plotId:a,className:o=""}){const r=Sx[a];return s.jsxs("svg",{viewBox:"0 0 96 96",className:`place-glyph ${o}`,"aria-hidden":!0,children:[s.jsx("rect",{width:"96",height:"96",rx:"22",fill:"#2a0d58"}),r?.creek?s.jsxs(s.Fragment,{children:[s.jsx("path",{d:"M8 70c14-10 22-8 36 2 14 10 26 8 44-4",fill:"#3d7ccc"}),s.jsx("path",{d:"M0 78c18-8 28-6 44 4 16 10 28 6 52-8V96H0Z",fill:"#148a48"}),s.jsx("path",{d:"M18 58c8-16 16-22 22-18 4 2 6 12 8 18",fill:"#3dcc7a"}),s.jsx("path",{d:"M58 48c10-18 18-20 24-12 4 6 4 16 2 22",fill:"#2a8a48"})]}):r?.bench?s.jsxs(s.Fragment,{children:[s.jsx("rect",{x:"8",y:"62",width:"80",height:"22",rx:"4",fill:"#5a3a1a"}),s.jsx("rect",{x:"16",y:"48",width:"64",height:"10",rx:"3",fill:"#c4922a"}),s.jsx("rect",{x:"20",y:"38",width:"8",height:"14",fill:"#8a5a22"}),s.jsx("rect",{x:"68",y:"38",width:"8",height:"14",fill:"#8a5a22"}),s.jsx("circle",{cx:"72",cy:"18",r:"10",fill:"#ffcc33"})]}):r?.sky?s.jsxs(s.Fragment,{children:[s.jsx("path",{d:"M18 78c0-24 12-40 30-40s30 16 30 40",fill:"#1a3a78"}),s.jsx("circle",{cx:"48",cy:"42",r:"10",fill:"#ffcc33"}),s.jsx("circle",{cx:"22",cy:"22",r:"2.5",fill:"#fff6b8"}),s.jsx("circle",{cx:"72",cy:"18",r:"2",fill:"#fff6b8"}),s.jsx("circle",{cx:"78",cy:"32",r:"1.8",fill:"#ffe680"})]}):r?.gate?s.jsxs(s.Fragment,{children:[s.jsx("path",{d:"M20 78V40l28-18 28 18v38",fill:"#8a6a3a"}),s.jsx("path",{d:"M36 78V52h24v26",fill:"#2a0d58"}),s.jsx("rect",{x:"22",y:"70",width:"52",height:"8",fill:"#5a3a1a"})]}):r?.ridge?s.jsxs(s.Fragment,{children:[s.jsx("path",{d:"M6 78 28 42l14 14 16-28 32 50Z",fill:"#3d7ccc"}),s.jsx("path",{d:"M42 28 58 6l20 36",fill:"#ffe680"})]}):s.jsxs(s.Fragment,{children:[s.jsx("rect",{x:"18",y:"44",width:"60",height:"36",rx:"4",fill:"#5a2410"}),s.jsx("rect",{x:"34",y:"58",width:"16",height:"22",fill:"#2a0d58"}),s.jsx("path",{d:"M48 16c0 10 8 14 8 22 0 6-4 10-8 10s-8-4-8-10c0-8 8-12 8-22Z",fill:"#ffcc33"}),s.jsx("circle",{cx:"48",cy:"40",r:"5",fill:"#fff6b8"})]})]})}const zy={"parable-hollow":{label:"Story Creek",path:"M16 70c8-18 14-28 20-28 4 0 6 8 8 16 4-14 10-22 16-22 8 0 14 18 20 34"},"witness-bench":{label:"Witness Square",path:"M18 58h60M24 58v16h48V58M20 74h56"},observatory:{label:"Sky Watch",path:"M18 70c0-22 14-38 30-38s30 16 30 38M48 32v10"},"first-gate":{label:"Why Gate",path:"M22 78V38l26-16 26 16v40M48 78V50"},"high-lookout":{label:"Meaning Ridge",path:"M8 70 28 42l14 12 18-28 28 44"},"daily-trail":{label:"East porch",path:"M24 78V44h48v34M36 78V58h24v20M48 44V28"}};function tw({pillar:a,compact:o}){const r=zy[a]??zy["daily-trail"],c=a==="daily-trail"?en.juniper:Eo(a);return s.jsxs("div",{className:`landmark ${o?"is-compact":""}`,children:[s.jsxs("svg",{viewBox:"0 0 96 96","aria-hidden":!0,className:"landmark-mark",children:[s.jsx("rect",{width:"96",height:"96",rx:"20",fill:"currentColor",opacity:"0.12"}),s.jsx("path",{d:r.path,fill:"none",stroke:"currentColor",strokeWidth:"4",strokeLinecap:"round",strokeLinejoin:"round"})]}),s.jsx(it,{who:c.id,size:"sm"}),s.jsx("p",{className:"landmark-label",children:r.label})]})}function jx(a){switch(a){case"sequence":return"Order puzzle";case"build-argument":return"Chain puzzle";case"match":return"Snap pairs";case"sort":return"Keep or toss";case"link":return"Link blocks";default:return a}}function Jy(a,o){return a&&a>o?a:o}function Cx(a,o){return{earned:a.reduce((c,d)=>c+(o[d]??0),0),possible:a.length*3}}function Sl(a){return a>=3?"3★ held after a rest, and said back":a===2?"2★ held after a rest":a===1?"1★ first walk":"0★ not yet walked"}function nw({count:a=0,compact:o,label:r}){return s.jsx("span",{className:`star-row ${o?"is-compact":""} ${a?"has-stars":""}`,"aria-label":r??`${a} of 3 stars`,children:[1,2,3].map(c=>s.jsx("span",{className:c<=a?"is-lit":"","aria-hidden":!0,children:"★"},c))})}const Ax=3,ca=[{id:"love",label:"Love",gem:"heart",unlockKeys:[],counters:["image-bearer","spiritual","skeptic"],tier:1},{id:"logic",label:"Logic",gem:"star",unlockKeys:["wb-creed","wb-early","wb-method","wb-women","fg-mover","fg-contingent","fg-kalam","daily-creed","daily-names"],counters:["skeptic","metaphysical"],tier:1},{id:"reason",label:"Reason",gem:"cup",unlockKeys:["hl-moral","hl-mind","hl-meaning","hl-beauty","fg-limits"],counters:["pagan","metaphysical"],tier:1},{id:"science",label:"Science",gem:"lamp",unlockKeys:["ob-tuning","ob-design","ob-leibniz","ob-life","daily-stars","daily-life","daily-cosmos"],counters:["physical","metaphysical"],tier:1}],Nx={"image-bearer":"Image-bearer",skeptic:"Skeptic",pagan:"Pagan",physical:"Physical",metaphysical:"Metaphysical",spiritual:"Spiritual"},Zd=["","I","II","III"];function Ga(a){return ca.find(o=>o.id===a)}function aw(a,o){if(a.unlockKeys.length===0)return!0;const r=new Set(o.held??[]),c=new Set(o.completed??[]);return a.unlockKeys.some(d=>r.has(d)||c.has(d))}function Ln(a){return a==="td-watch"}function Ex(a){return a.unlockKeys.length>0?a.unlockKeys:["td-watch"]}function Lx(a,o){const r=Ex(a),c=new Set([...o.held??[],...o.completed??[]]),d=r.filter(w=>c.has(w)),u=(o.learnings??[]).filter(w=>w.toolId===a.id).map(w=>w.id),g=new Set([...d,...u]).size,y=r.reduce((w,T)=>w+(o.memory[T]?.reviews??0),0),p=r.reduce((w,T)=>w+(o.stars[T]??0),0);return{held:g,reviews:y,stars:p}}function Io(a,o){const{held:r,reviews:c,stars:d}=Lx(a,o);let u=0;return(r>=2||c>=2||d>=4)&&(u=1),(r>=4||c>=6||d>=8)&&(u=2),Math.min(Ax,a.tier+u)}function Hx(a){return ca.filter(o=>aw(o,a))}function Wx(a,o){const r=Ga(a);return r&&r.counters.includes(o)?"match":"weak"}function Al(a){const o=ca.find(r=>r.unlockKeys.includes(a));return o||Ga("love")}function eu(a,o){return a.includes("seed")?"seed":a.includes("lamp")||a.includes("lantern")?"lamp":a.includes("grace")||a.includes("cup")?"cup":o?.gem}const od=[1,3,7,21];function Td(a,o,r){return{id:a,pillar:o,intervalIndex:0,nextReviewAt:r,lastReviewAt:r,reviews:0,cleanRecalls:0,elaborated:!1}}function Jo(a,o){return a.lastReviewAt===o&&a.reviews>0?!1:a.nextReviewAt<=o}function tu(a,o){return Object.values(a).filter(r=>Jo(r,o))}function Ix(a,o,r,c=3){if(a.length===0||c<=0)return[];const d=r?a.filter(b=>b.pillar!==r):a,g=[...d.length>0?d:a].sort((b,x)=>b.pillar===x.pillar?b.id.localeCompare(x.id):b.pillar.localeCompare(x.pillar)),y=Tg(`silver-city-space:${o}`)%g.length,p=[...g.slice(y),...g.slice(0,y)],w=[],T=new Set;for(const b of p){if(w.length>=c)break;T.has(b.pillar)||(w.push(b),T.add(b.pillar))}for(const b of p){if(w.length>=c)break;w.some(x=>x.id===b.id)||w.push(b)}return w}function Rx(a,o){return Object.values(a).filter(r=>r.lastReviewAt===o&&r.reviews>0).length}function Ox(a,o){const r=od[Math.min(od.length-1,a.intervalIndex)],c=Math.min(od.length-1,a.intervalIndex+1);return{...a,intervalIndex:c,nextReviewAt:Po(o,r),lastReviewAt:o,reviews:a.reviews+1,cleanRecalls:a.cleanRecalls+1}}function qx(a,o){return{...a,nextReviewAt:Po(o,1)}}function Dx(a,o){const r=Math.max(0,a.intervalIndex-1);return{...a,intervalIndex:r,nextReviewAt:Po(o,1),lastReviewAt:o,reviews:a.reviews+1}}function Px(a,o,r,c){let d=a&&a>=1?a:1;return r.kind==="encode"?d>=1?d:1:(!r.peeked&&r.clean&&(o?.lastReviewAt?o.lastReviewAt<r.today:o&&Jo(o,r.today))&&(d=d>=2?d:2,(r.elaborated||c.cleanRecalls>=2||c.elaborated)&&(d=3)),d)}function _o(a,o,r=!1){return Jo(a,o)?a.reviews===0?r?"Read this again today":"Dust off today":"Due this morning":a.nextReviewAt===Po(o,1)?"Returns tomorrow":`Returns ${a.nextReviewAt}`}const xd=3,sw="silver-city-recall-later-v1";function dl(a){return{day:a,ids:[],dismissed:!1}}function Nl(a){if(typeof sessionStorage>"u")return dl(a);try{const o=sessionStorage.getItem(sw);if(!o)return dl(a);const r=JSON.parse(o);return r.day!==a?dl(a):{day:a,ids:Array.isArray(r.ids)?r.ids.filter(c=>typeof c=="string"):[],dismissed:r.dismissed===!0}}catch{return dl(a)}}function Gx(a){return typeof sessionStorage<"u"&&sessionStorage.setItem(sw,JSON.stringify(a)),a}function Ao(a,o=[],r=!0){const c=Nl(a);return Gx({day:a,ids:[...new Set([...c.ids,...o])],dismissed:r||c.dismissed})}function zx(a,o){return tu(a.memory,o).filter(r=>!!Et(r.id)&&!Ln(r.id))}function nu(a,o,r=Nl(o)){if(r.dismissed)return[];const c=Rx(a.memory,o),d=Math.max(0,xd-c);if(d===0)return[];const u=zx(a,o).filter(g=>!r.ids.includes(g.id));return Ix(u,o,a.lastReviewPillar,d)}const au={porch:["daily-lantern","daily-gems","daily-seed","daily-neighbor","daily-names","daily-creed","daily-empty","daily-stars","daily-life","daily-cosmos","daily-scroll","daily-isaiah","daily-grace","daily-rest","daily-door"],hollow:["ph-road","ph-father","ph-seeds","ph-debt"],bench:["wb-creed","wb-early","wb-method","wb-women"],observatory:["ob-tuning","ob-design","ob-leibniz","ob-life"],gate:["fg-mover","fg-contingent","fg-kalam","fg-limits"],lookout:["hl-moral","hl-mind","hl-meaning","hl-beauty"],journal:[],lamps:[]};function su(a){return(a.completed??[]).includes("ln-street")}function mi(a,o){return!!((a.held??[]).includes(o)||(a.completed??[]).includes(o)||(a.learnings??[]).some(r=>r.id===o)||su(a)&&Ug.includes(o))}function _y(a,o){const r=Et(o),c=(a.learnings??[]).find(u=>u.id===o),d=r?.claim??c?.claim;if(d)return{id:o,claim:d,reason:r?.reason??c?.reason??"",source:r?.source??c?.source??"",lit:mi(a,o)}}function iw(a,o){const r=tt.find(w=>w.id===a),c=la(a),d=en[c.who],u=au[a]??[];if(a==="journal"){const w=(o.learnings??[]).map(T=>_y(o,T.id)).filter(T=>!!T);return{plotId:a,placeTitle:r?.title??"Dossier house",person:d,ideas:w,tools:[]}}if(a==="lamps"){const w=ca.map(T=>({id:T.id,label:T.label,lit:T.unlockKeys.length===0||T.unlockKeys.some(b=>mi(o,b))}));return{plotId:a,placeTitle:r?.title??"Star lamps",person:d,ideas:[],tools:w}}const g=(o.learnings??[]).map(w=>w.id).filter(w=>!u.includes(w)&&mi(o,w)).filter(w=>!!(o.learnings??[]).find(b=>b.id===w)?.anchor?.includes(r?.title??"")),p=(a==="porch"?u.filter(w=>mi(o,w)||Ug.includes(w)):[...u,...g]).map(w=>_y(o,w)).filter(w=>!!w);return{plotId:a,placeTitle:r?.title??a,person:d,ideas:p,tools:[]}}function Jx(a,o){const r=iw(a,o);return r.ideas.some(c=>c.lit)||r.tools.some(c=>c.lit)}const cs=4,ow=["porch","hollow","bench"],_x={0:{hard:"Lot",easy:"Empty lot"},1:{hard:"Timber",easy:"Wood up"},2:{hard:"Raised",easy:"House up"},3:{hard:"Furnished",easy:"Rooms in"},4:{hard:"Lit",easy:"Lamps on"}},Ux={0:{hard:"Nothing stands yet. Learn on this street, then raise timber.",easy:"No house yet. Learn here, then put wood up."},1:{hard:"The lot is yours. Walk it. The keeper is staking the ground.",easy:"You can walk this place. The person is waiting."},2:{hard:"Walls and roof. The keeper lives here. The first idea can light.",easy:"The house stands. The person lives here. One idea can light."},3:{hard:"Rooms for more ideas. Dig deeper opens on lines you have kept.",easy:"More rooms. You can Read more on lines you kept."},4:{hard:"Lamps hold. Tap a lit idea to say the line again.",easy:"Lamps are on. Tap a lit idea to say it again."}};function El(){return{porch:1,hollow:0,bench:0,observatory:0,gate:0,lookout:0,journal:0,lamps:0}}function Bx(a){return a<=0?"empty":a===1?"scaffold":a>=4?"lit":"built"}function Fx(a,o){const r=au[a]??[],c=o.held??[];return r.some(d=>c.includes(d))}function $x(a,o){return ow.includes(a)&&su(o)}function Ti(a,o){const r=us(a,o),c=Gd(a,o);return r==="empty"?0:r==="scaffold"?1:r==="lit"?4:a==="journal"||a==="lamps"?c>=8?3:2:c>=2||$x(a,o)||Fx(a,o)?3:2}function rw(a){const o=El();for(const r of tt)o[r.id]=Ti(r.id,a);return o}function ys(a,o){const r=o.cityBuilt;if(!r)return Ti(a,o);const c=r[a];return typeof c!="number"||!Number.isFinite(c)?0:Math.max(0,Math.min(cs,Math.floor(c)))}function Sn(a,o){return Ti(a,o)>ys(a,o)}function Kx(a,o){const r=Ti(o,a),c=ys(o,a);if(r<=c)return a;const d={...a.cityBuilt??rw(a)};return d[o]=c+1,{...a,cityBuilt:d}}function Uy(a){const o={};for(const r of tt)o[r.id]=Bx(ys(r.id,a));return o}function By(a){const o={};for(const r of tt)o[r.id]=Yx(r.id,a);return o}function Yx(a,o){const r=ys(a,o),c=Gd(a,o);return r<=1?0:r===2?Math.min(Math.max(c,1),1):r===3?Math.max(2,c):Math.max(c,4)}function Vx(a){return tt.some(o=>Sn(o.id,a))}function Fy(a,o){const r=_x[Math.max(0,Math.min(cs,a))];return o?r.easy:r.hard}function Xx(a,o){const r=Ux[Math.max(0,Math.min(cs,a))];return o?r.easy:r.hard}function Qx(a,o,r){const c=ys(a,o),d=Ti(a,o);return c>=cs?{ready:!1,line:r?"This building is done. Keep saying the lines so the lamps stay on.":"This building is finished. Keep the claims so the lamps stay lit."}:d>c?{ready:!0,line:r?"Build this — raise the next look you earned by learning, not by paying.":"You earned the next look by keeping a line. Tap Build this — learning raises the house, not payment."}:{ready:!1,line:lw(a,c+1,r)}}function Zx(a,o,r,c=!0,d="",u=!1){if(!c&&d)return d;if(Sn(a,o)||Jx(a,o))return null;const g=Pd(o,u);if(a===g||ys(a,o)>0||Ti(a,o)>0)return null;const y=lw(a,1,r);return r?`This lot is locked. ${y}`:`This lot is still empty. ${y}`}function e1(a){return a?"This idea is locked. Walk this lot, or connect sentence → place → person, to light it.":"This idea is locked. Walk this lot — or Link the street — to light it."}function lw(a,o,r){return a==="porch"?o<=1?r?"Arrive. The porch lot is yours.":"Arrive. The east porch lot is yours.":o===2?r?"Walk today’s story once.":"Walk today’s trail and keep the morning line.":o===3?r?"Walk a second morning, or connect sentence → place → person.":"A second morning, hold the lamp line, or Link the street furnishes the porch.":r?"Come back three mornings.":"Three mornings kept — or hold the lamp line — lights the porch.":a==="journal"?o<=1?r?"Store one journal page.":"Store one journal page in the house.":o===2?r?"Store four pages.":"Four stored pages raise the dossier house.":o===3?r?"Store eight pages.":"Eight pages furnish the shelves.":r?"Store twelve pages.":"Twelve pages — journal mastery — light the house.":a==="lamps"?o<=1?r?"Earn one star.":"One star caught on a walk raises the first lamp.":o===2?r?"Earn four stars.":"Four stars raise a row of lamps.":o===3?r?"Eight stars, or hold a night.":"Eight stars or a Night Watch furnishes the street.":r?"Twelve stars or nights.":"Twelve stars and nights remembered light the street.":o<=1?r?"Finish the street before this one.":"Finish the earlier street so this lot unlocks.":o===2?r?"Finish one walk here.":"Finish one walk on this lot and keep the takeaway.":o===3?ow.includes(a)?r?"Finish a second walk here, or connect sentence → place → person.":"A second walk, a held claim, or Link the street furnishes this house.":r?"Finish a second walk here, or keep a main idea from this lot.":"A second walk or a held claim from this lot furnishes the rooms.":r?"Finish every walk here.":"Finish this street’s walks. Holding those claims lights the lamps."}function cw(a){switch(a){case"porch":return"Porch";case"hollow":return"Story Creek";case"bench":return"Witness Square";case"observatory":return"Sky Watch";case"gate":return"Why Gate";case"lookout":return"Meaning Ridge";case"journal":return"Pages";case"lamps":return"Lamps"}}function t1(a){return a==="hollow"?"Story Creek":a==="bench"?"Witness Square":a==="porch"?"East porch":a==="lamps"?"Star lamps":cw(a)}const n1=["hollow","lamps","journal","bench","porch"],a1=56,hw={hollow:{x:96,y:388},lamps:{x:208,y:388},journal:{x:268,y:198},bench:{x:392,y:388},porch:{x:536,y:388},gate:{x:498,y:230},observatory:{x:410,y:96},lookout:{x:508,y:52}},$y={x:418,y:36};function s1(a){return a.includes(" ")?a.split(" "):[a]}function i1(a){const o=t1(a),r=s1(o),c=hw[a],d=Math.max(...r.map(b=>b.length)),u=Math.max(70,d*8.4+16),g=r.length*13+6,y=c.x-u/2,p=c.x+u/2,w=c.y-14,T=w+g;return{id:a,tag:o,lines:r,x0:y,x1:p,y0:w,y1:T,w:u,h:g}}const o1=1100,r1=[0,1,2,3,4,5,6,7,8,9,10,11],dw=[0,1,2,3,4,5,6,7];function gi(a,o="mid"){const r=o==="keep"?-1:o==="discard"?1:a%2===0?-1:1,c=r*(52+a%4*34),d=-110-a*28,u=r*(28+a*18);return{"--dx":`${c}px`,"--dy":`${d}px`,"--spin":`${u}deg`,animationDelay:`${a*42}ms`}}function wi(){return typeof window<"u"&&window.matchMedia("(prefers-reduced-motion: reduce)").matches}let Ky=null;function Yy(a="find"){if(!(typeof window>"u"||wi())){try{Ky??=new AudioContext;const o=Ky;o.resume();const r=o.currentTime,c=o.createOscillator(),d=o.createGain();c.type=a==="miss"?"sawtooth":"triangle";const u=a==="win"?660:a==="miss"?180:880,g=a==="win"?1320:a==="miss"?90:240;c.frequency.setValueAtTime(u,r),c.frequency.exponentialRampToValueAtTime(g,r+(a==="win"?.28:.16)),d.gain.setValueAtTime(a==="miss"?.04:.11,r),d.gain.exponentialRampToValueAtTime(.001,r+(a==="win"?.32:.18)),c.connect(d),d.connect(o.destination),c.start(r),c.stop(r+.34)}catch{}try{a!=="miss"&&window.navigator.vibrate?.(a==="win"?[18,40,24]:16)}catch{}}}function Ll(a=!1){const[o,r]=H.useState(a),c=H.useRef(0);H.useEffect(()=>()=>window.clearTimeout(c.current),[]);const d=H.useCallback(()=>{window.clearTimeout(c.current),c.current=window.setTimeout(()=>r(!0),wi()?900:o1)},[]);return{juiceDone:o,afterJuice:d}}const Vy="td-watch",ii=3,ri=6,li=[{x:70,y:310},{x:148,y:298},{x:220,y:286},{x:300,y:294},{x:400,y:290},{x:498,y:296},{x:560,y:300}],rd={lookout:{x:520,y:72},observatory:{x:464,y:118},hollow:{x:108,y:286},journal:{x:288,y:248},bench:{x:350,y:278},lamps:{x:258,y:300},gate:{x:498,y:268},porch:{x:564,y:292}},Sd=[{text:"Mercy is optional",kind:"skeptic"},{text:"Neighbor means your own",kind:"image-bearer"},{text:"Keep walking",kind:"spiritual"},{text:"Classify and leave",kind:"skeptic"},{text:"The priest did enough",kind:"image-bearer"},{text:"Only atoms speak",kind:"physical"},{text:"The gods are many and tired",kind:"pagan"},{text:"Mind is only weather",kind:"metaphysical"}];Sd.map(a=>a.text);function l1(a,o){const r=["image-bearer","spiritual","skeptic"],c=a<1?Sd.filter(d=>r.includes(d.kind)):Sd;return c[o%c.length]}function uw(){return{cleared:0,nights:[]}}function ld(a,o){return us(a,o)}function c1(a){return tt.map(o=>o.id).filter(o=>{const r=us(o,a);return o==="porch"?r!=="empty":r==="built"||r==="lit"})}function h1(a){return a==="lit"?136:a==="built"?118:96}function d1(a){return a==="lit"?380:a==="built"?520:700}const Xy=128,Qy=160;function u1(a,o,r){return a&&o==="wave"&&!r}function m1(a){return a.find(o=>!o.turned)}function p1(a,o,r){return a?"match":Wx(o,r)}function f1(a,o,r,c){return a?o>=ri:r>=ri&&c===0}function mw(a=!1){return a?wi()?.008:.01:wi()?.042:.086}function y1(a=!1){return a?wi()?4.2:3.8:wi()?2.05:1.08}function g1(a){const r=Math.min(1,Math.max(0,a))*(li.length-1),c=Math.min(li.length-2,Math.floor(r)),d=r-c,u=li[c],g=li[c+1];return{x:u.x+(g.x-u.x)*d,y:u.y+(g.y-u.y)*d}}ca.map(a=>a.id);const cd=Object.fromEntries(ca.map(a=>[a.id,a.label])),Md={x:572,y:36};function pw(a){return Hx(a).map(o=>o.id)}function w1(a,o,r=Md){const c=Math.min(1,Math.max(0,o));return{x:a.x+(r.x-a.x)*c,y:a.y+(r.y-a.y)*c}}function hd(a,o,r){const c=Ga(a),u=((c?Io(c,r):1)-1)*18;return a==="love"?640+u:h1(o)+u}function b1(a=1,o=!1){return mw(o)*(1.7+Math.max(0,a-1)*.08)}function dd(a,o){return Math.hypot(a.x-o.x,a.y-o.y)}const iu="silver-city-save",ou=256*1024,v1=Math.floor(ou*1.5),fw=256,Uo=256,jd=64,k1=220,Ro=1e4,T1=32,x1=/^\d{4}-\d{2}-\d{2}$/,S1=/^[A-Za-z0-9._:-]{1,64}$/,M1=new Set(["__proto__","constructor","prototype"]);function fl(){return{started:!1,completed:[],journal:[],firstTry:[],stars:{},dailyDates:[],streak:0,bestStreak:0,held:[],memory:{},elaborations:{},defense:uw(),theme:"candy",easyMode:!1,learnings:[],taught:[],easyTaught:[],easyHeld:[],cityBuilt:El(),streetLinked:[],lessonTier:{},lessonScore:{},tierTaught:{}}}function gs(a){return M1.has(a)}function Mn(a){if(a===null||typeof a!="object"||Array.isArray(a))return!1;const o=Object.getPrototypeOf(a);return o===Object.prototype||o===null}function bi(a){return typeof a=="string"&&x1.test(a)&&a.length<=jd}function dn(a){return typeof a=="string"&&S1.test(a)}function Pa(a,o,r,c){return typeof a!="number"||!Number.isFinite(a)||!Number.isInteger(a)?c:Math.min(r,Math.max(o,a))}function ls(a,o){return a.length<=o?a:a.slice(0,o)}function qn(a){if(!Array.isArray(a))return[];const o=[];for(const r of a){if(o.length>=fw)break;!dn(r)||gs(r)||o.push(r)}return o}function j1(a){const o=Object.create(null);if(!Mn(a))return o;let r=0;for(const[c,d]of Object.entries(a)){if(r>=Uo)break;if(gs(c)||!dn(c)||!Mn(d))continue;const u=Dt(),g=dn(d.id)?d.id:c;o[c]={id:g,pillar:dn(d.pillar)?d.pillar:"unspecified",intervalIndex:Pa(d.intervalIndex,0,T1,0),nextReviewAt:bi(d.nextReviewAt)?d.nextReviewAt:u,lastReviewAt:bi(d.lastReviewAt)?d.lastReviewAt:void 0,reviews:Pa(d.reviews,0,Ro,0),cleanRecalls:Pa(d.cleanRecalls,0,Ro,0),elaborated:!!d.elaborated},r+=1}return o}function C1(a){const o=Object.create(null);if(!Mn(a))return o;let r=0;for(const[c,d]of Object.entries(a)){if(r>=Uo)break;gs(c)||!dn(c)||typeof d=="string"&&(o[c]=ls(d,k1),r+=1)}return o}function Zy(a){const o=Object.create(null);if(!Mn(a))return o;let r=0;for(const[c,d]of Object.entries(a)){if(r>=Uo)break;gs(c)||!dn(c)||(d==="easy"||d==="medium"||d==="hard")&&(o[c]=d,r+=1)}return o}function A1(a){const o=Object.create(null);if(!Mn(a))return o;let r=0;for(const[c,d]of Object.entries(a)){if(r>=Uo)break;gs(c)||!dn(c)||(o[c]=Pa(d,0,15,0),o[c]===0?delete o[c]:r+=1)}return o}function N1(a){const o=Object.create(null);if(!Mn(a))return o;let r=0;for(const[c,d]of Object.entries(a)){if(r>=Uo)break;gs(c)||!dn(c)||(d===1||d===2||d===3)&&(o[c]=d,r+=1)}return o}function E1(a){const o=j1(a.memory),r=Dt();for(const c of a.held??[])o[c]||(o[c]={...Td(c,"unspecified",r),nextReviewAt:r,lastReviewAt:void 0});return o}function Oo(a){const o=qn(a.held),r={started:!!a.started,completed:qn(a.completed),journal:qn(a.journal),firstTry:qn(a.firstTry),lastAreaId:dn(a.lastAreaId)?a.lastAreaId:void 0,lastChallengeId:dn(a.lastChallengeId)?a.lastChallengeId:void 0,stars:N1(a.stars),dailyDates:qn(a.dailyDates),lastDailyDate:bi(a.lastDailyDate)?a.lastDailyDate:void 0,streak:Pa(a.streak,0,Ro,0),bestStreak:Pa(a.bestStreak,0,Ro,0),held:o,memory:{},elaborations:C1(a.elaborations),lastReviewPillar:dn(a.lastReviewPillar)?a.lastReviewPillar:void 0,defense:W1(a.defense),theme:H1(a.theme),easyMode:a.easyMode===!0,learnings:I1(a.learnings),taught:qn(a.taught),easyTaught:qn(a.easyTaught),easyHeld:qn(a.easyHeld),cityBuilt:El(),streetLinked:qn(a.streetLinked),lessonTier:Zy(a.lessonTier),lessonScore:A1(a.lessonScore),tierTaught:Zy(a.tierTaught)};return r.memory=E1({...r,memory:a.memory??{}}),r.cityBuilt=a.cityBuilt===void 0?rw(r):L1(a.cityBuilt),r}function L1(a){const o=El();if(!Mn(a))return o;for(const r of Object.keys(o))o[r]=Pa(a[r],0,4,0);return o}function H1(a){return a==="dusk"||a==="parchment"||a==="candy"?a:"candy"}function W1(a){if(!Mn(a))return uw();const o=qn(a.nights).filter(bi);return{cleared:Pa(a.cleared,0,Ro,0),nights:o,lastNight:bi(a.lastNight)?a.lastNight:void 0}}function I1(a){if(!Array.isArray(a))return[];const o=[];for(const r of a){if(o.length>=fw)break;if(!Mn(r)||!dn(r.id)||gs(r.id))continue;const c=typeof r.claim=="string"?ls(r.claim,280):"";c&&o.push({id:r.id,claim:c,reason:typeof r.reason=="string"?ls(r.reason,280):"",source:typeof r.source=="string"?ls(r.source,120):"",anchor:typeof r.anchor=="string"?ls(r.anchor,180):"",picture:typeof r.picture=="string"&&r.picture.length<=16?r.picture:void 0,beat:typeof r.beat=="string"?ls(r.beat,180):void 0,toolId:dn(r.toolId)?r.toolId:void 0,acquiredAt:bi(r.acquiredAt)?r.acquiredAt:""})}return o}function R1(a){return Mn(a)?a.kind===iu&&Mn(a.progress):!1}function O1(a){return!Mn(a)||a.kind===iu?!1:Array.isArray(a.completed)||Array.isArray(a.journal)||Array.isArray(a.held)||Array.isArray(a.dailyDates)||typeof a.started=="boolean"}function eg(a,o){let r=o,c=a;return c<1&&(c=1),c===1&&(r=Oo(r)),c>oa&&(r=Oo(r)),r}function qo(a,o=new Date().toISOString()){return{kind:iu,schemaVersion:oa,appVersion:Qt,savedAt:o,progress:Oo(a)}}function yw(a){if(R1(a)){const o=a.schemaVersion;if(o!==void 0){if(typeof o!="number"||!Number.isInteger(o)||o<0)return{ok:!1,error:"That save’s schema version is not valid."};if(o>oa)return{ok:!1,error:"This save needs a newer Silver City before it can be imported."}}const c=eg(typeof o=="number"?o:1,Oo(a.progress)),d=typeof a.savedAt=="string"&&a.savedAt.length<=40?a.savedAt:new Date().toISOString(),u=typeof a.appVersion=="string"&&a.appVersion.length<=jd?ls(a.appVersion,jd):Qt;return{ok:!0,progress:c,meta:{schemaVersion:oa,appVersion:u,savedAt:d,source:"envelope"},envelope:qo(c,d)}}if(O1(a)){const o=eg(0,Oo(a)),r=new Date().toISOString();return{ok:!0,progress:o,meta:{schemaVersion:oa,appVersion:Qt,savedAt:r,source:"legacy"},envelope:qo(o,r)}}return{ok:!1,error:"That file is not a Silver City save."}}function q1(a){if(typeof Buffer<"u")return Buffer.from(a,"utf8").toString("base64url");const o=new TextEncoder().encode(a);let r="";return o.forEach(c=>{r+=String.fromCharCode(c)}),btoa(r).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}function D1(a){const o=a.replace(/-/g,"+").replace(/_/g,"/"),r=o.length%4===0?"":"=".repeat(4-o.length%4),c=o+r;if(typeof Buffer<"u")return Buffer.from(c,"base64").toString("utf8");const d=atob(c),u=Uint8Array.from(d,g=>g.charCodeAt(0));return new TextDecoder().decode(u)}function P1(a){return`SC1.${q1(JSON.stringify(a))}`}function G1(a){const o=a.trim();if(!o)return{ok:!1,error:"Nothing to import."};if(o.length>v1)return{ok:!1,error:"That save is too large to import."};let r=o;if(o.startsWith("SC1."))try{r=D1(o.slice(4))}catch{return{ok:!1,error:"That share code could not be read."}}if(r.length>ou)return{ok:!1,error:"That save is too large to import."};try{return yw(JSON.parse(r))}catch{return{ok:!1,error:"That save is not valid JSON."}}}function gw(a){if(typeof localStorage>"u")return null;try{return localStorage.getItem(a)}catch{return null}}function ww(a,o){typeof localStorage>"u"||localStorage.setItem(a,o)}function z1(){const a=gw(Dd);if(!a)return{progress:fl(),meta:{schemaVersion:oa,appVersion:Qt,savedAt:"",source:"envelope"}};try{const o=yw(JSON.parse(a));return o.ok?(o.meta.source==="legacy"&&Cd(o.progress,o.meta.savedAt),{progress:o.progress,meta:o.meta}):{progress:fl(),meta:{schemaVersion:oa,appVersion:Qt,savedAt:"",source:"legacy"}}}catch{return{progress:fl(),meta:{schemaVersion:oa,appVersion:Qt,savedAt:"",source:"legacy"}}}}function Cd(a,o=new Date().toISOString()){const r=qo(a,o);return ww(Dd,JSON.stringify(r)),{schemaVersion:r.schemaVersion,appVersion:r.appVersion,savedAt:r.savedAt,source:"envelope"}}function tg(){const a=gw(Dd);a&&ww(Qk,a)}function J1(a,o,r){return a===o?{streak:Math.max(1,r),tone:"already"}:a?a===Po(o,-1)?{streak:r+1,tone:"continue"}:{streak:1,tone:"welcome-back"}:{streak:1,tone:"first"}}function bw(a){const o=/^trail-days-(\d+)$/.exec(a);return o?Number(o[1]):null}function ng(){const a=z1();return{progress:_1(a.progress),meta:a.meta}}function _1(a){const o={...a.memory};let r=!1;for(const[c,d]of Object.entries(o))(!d.pillar||d.pillar==="unspecified")&&(o[c]={...d,pillar:zo(c)},r=!0);return r?{...a,memory:o}:a}function Hl(a,o){return a.challenges.every(r=>o.includes(r.id))}const Ad=2;function vw(a){const o=Mt.find(r=>r.id==="parable-hollow");return o?o.challenges.filter(r=>a.includes(r.id)).length:0}function Bo(a,o,r=!1){if(a==="witness-bench"){const u=vw(o);return r?`This street is locked. Finish 2 Jesus stories at the creek (${u}/2), then the square opens.`:`Walk ${Ad} scenes in Story Creek (${u}/${Ad}) — then Silas. Unpayable can wait.`}const c=Mt.find(u=>u.id===a),d=c?Mt.find(u=>u.order===c.order-1):void 0;return d?r?`This street is locked. Finish ${d.title} first, then this lot opens.`:`Finish ${d.title}, then the path opens.`:r?"This street is locked. Finish the walk before it first.":"This gate is still closed."}function xi(a,o){const r=Mt.find(d=>d.id===a);if(!r)return!1;if(r.order===1)return!0;const c=Mt.find(d=>d.order===r.order-1);return c?r.id==="witness-bench"?vw(o)>=Ad:Hl(c,o):!1}function U1(a){if(a==="witness-bench")return"parable-hollow";const o=Mt.find(c=>c.id===a);return(o?Mt.find(c=>c.order===o.order-1):void 0)?.id??a}function ru(a,o){return a.challenges.find(r=>!o.includes(r.id))}function Ml(a,o){const r=Mt.find(d=>d.id===a);if(!r)return{name:"hub"};const c=ru(r,o);return c?{name:"challenge",areaId:r.id,challengeId:c.id}:{name:"area",areaId:r.id}}function Si(a,o=Dt()){return a.lastDailyDate===o||a.dailyDates.includes(o)}function B1(a,o=Dt()){return tu(a.memory,o).filter(r=>!Ln(r.id)).map(r=>({trace:r,brief:Et(r.id),entry:ms(r.id)??Nt.find(c=>c.id===r.id)}))}function lu(a,o=Dt()){return tu(a.memory,o).length}function cu(a,o=Dt()){if(!Si(a,o))return{kind:"daily",title:"Today’s Trail",detail:`${bl(o,a.dailyDates.filter(r=>r!==o).length).challenge.title} · about a minute`};if(!a.started)return{kind:"welcome",title:"Begin in Story Creek",detail:"After today’s short walk, the longer trail opens here.",areaId:"parable-hollow"};for(const r of Mt){if(!xi(r.id,a.completed)){const d=Mt.find(u=>u.order===r.order-1);return{kind:"area",title:`${r.title} is still gated`,detail:Bo(r.id,a.completed),areaId:d?.id}}const c=ru(r,a.completed);if(c)return{kind:"challenge",title:`Next: ${c.title}`,detail:`${r.title} · ${c.kind.replace("-"," ")}`,areaId:r.id,challengeId:c.id}}return{kind:"vista",title:"The lookout is yours",detail:ye(a)?"Every area is open. Sit with the journal — or choose a sentence to remember.":"Every area is open. Sit with the journal — or rehearse a takeaway."}}function Nd(a){return ms(a)?.id??Nt.find(o=>o.id===a)?.id??a}function F1(a,o=Dt()){const r=nu(a,o).map(u=>({trace:u,brief:Et(u.id),entry:ms(u.id)??Nt.find(g=>g.id===u.id)})).find(u=>u.brief);if(r){const u=r.brief?.claim??r.entry?.title??"A held line",g={name:"journal",focusId:r.entry?.id??Nd(r.trace.id),autoQuiz:!0};return ye(a)?{title:"Choose the sentence to remember.",detail:`${u} · due this morning`,cta:"Choose the sentence to remember.",go:g}:{title:ot.tapTakeaway,detail:`${u} · due this morning`,cta:ot.tapTakeaway,go:g}}if(!Si(a,o))return{title:ye(a)?"Read today’s story.":"Next walk",detail:ye(a)?`${bl(o,a.dailyDates.filter(u=>u!==o).length).challenge.title} · today’s trail`:`${bl(o,a.dailyDates.filter(u=>u!==o).length).challenge.title} · today’s trail · fold, then rehearse the claim`,cta:ye(a)?"Read today’s story.":"Walk today’s trail",go:{name:"daily"}};const c=Object.values(a.memory).filter(u=>u.nextReviewAt>o&&!Ln(u.id)).sort((u,g)=>u.nextReviewAt.localeCompare(g.nextReviewAt))[0],d=cu(a,o);if(c){const u=Et(c.id);return{title:ye(a)?"Choose the sentence to remember.":ot.tapTakeaway,detail:`${u?.claim??Vg(c.id)?.challenge.title??"A held line"} · ${_o(c,o)}`,cta:ye(a)?"Choose the sentence to remember.":ot.tapTakeaway,go:{name:"journal",focusId:Nd(c.id),autoQuiz:!0}}}return d.kind==="challenge"&&d.areaId&&d.challengeId?{title:"Next on the trail",detail:d.detail,cta:"Open this walk",go:{name:"challenge",areaId:d.areaId,challengeId:d.challengeId}}:d.kind==="area"&&d.areaId?{title:"Next on the trail",detail:d.detail,cta:d.title,go:{name:"area",areaId:d.areaId}}:d.kind==="vista"?{title:"Next rebuild",detail:ye(a)?"Sit with a journal page, or choose a sentence to remember.":"Sit with a journal page, or rehearse a takeaway.",cta:"Open the journal",go:{name:"journal"}}:{title:d.title,detail:d.detail,cta:"Continue",go:{name:"hub"}}}function ag(a,o,r,c){const d=c||zo(o);return!a||a==="porch"||a==="daily-trail"?o.startsWith("daily-")||r==="daily-trail":d===a||r===a}function jl(a,o,r=Dt()){const c=B1(a,r).filter(y=>y.brief),d=c.find(y=>ag(o,y.trace.id,y.entry?.areaId,y.trace.pillar))??(o&&o!=="porch"&&o!=="daily-trail"?void 0:c[0]);if(d)return{name:"journal",focusId:d.entry?.id??d.trace.id,autoQuiz:!0};const u=[...a.held].filter(y=>!Ln(y)).reverse(),g=u.find(y=>ag(o,y,ms(y)?.areaId,a.memory[y]?.pillar))??(o&&o!=="porch"&&o!=="daily-trail"?void 0:u[0]);if(g)return{name:"journal",focusId:Nd(g),autoQuiz:!0};if(o&&o!=="porch"&&o!=="daily-trail"){const y=Nt.find(p=>p.areaId===o&&a.journal.includes(p.id));if(y)return{name:"journal",focusId:y.id,autoQuiz:!0}}return{name:"journal"}}function $1(a){return Nt.filter(o=>o.unlockAfter===a).map(o=>o.id)}function sg(a){return Nt.filter(o=>{const r=bw(o.unlockAfter);return r!==null&&a>=r}).map(o=>o.id)}function K1(a,o){return{done:a.challenges.filter(c=>o.includes(c.id)).length,total:a.challenges.length}}function kw(a){const o=Object.values(a.stars).reduce((r,c)=>r+c,0);return a.firstTry.length*3+a.completed.length*2+o}function Y1(a){const o=Nt.length,r=Nt.filter(c=>a.journal.includes(c.id)).length;return{open:r,total:o,percent:o===0?0:Math.round(r/o*100)}}function V1(a,o){return Cx(a.challenges.map(r=>r.id),o)}const Tw=H.createContext(null);function Ge(){const a=H.useContext(Tw);if(!a)throw new Error("useProgress must be used within ProgressProvider");return a}function X1({areaId:a,onNavigate:o}){const{progress:r}=Ge(),c=ye(r),d=Qd(a);if(!d)return s.jsx("main",{className:"page",children:s.jsx("p",{children:"That district is not on the map."})});const u=xi(d.id,r.completed),g=Hl(d,r.completed),{done:y,total:p}=K1(d,r.completed),w=ru(d,r.completed),T=V1(d,r.stars),b=Eo(d.id),x=eT[d.id];return s.jsxs("main",{className:"area-page",children:[s.jsxs("button",{type:"button",className:"text-link",onClick:()=>o({name:"hub"}),children:["← ",c?ee.home:"The town"]}),s.jsxs("header",{className:"area-hero",style:{"--accent":d.accent},children:[s.jsxs("div",{className:"area-hero-cast",children:[s.jsx(it,{who:b.id,size:"xl"}),s.jsx(it,{who:"river",size:"md"})]}),s.jsx(tw,{pillar:d.id,compact:!0}),s.jsxs("p",{className:"eyebrow",children:[b.role," · in town"]}),s.jsx("h1",{children:d.title}),s.jsxs("p",{className:"progress-line",children:[y," of ",p,g?" · street’s standing":"",T.earned?` · ${T.earned}★`:""]})]}),x?s.jsx(ew,{who:b.id,line:g?x.after:x.hello}):null,u?s.jsx("ol",{className:"challenge-list",children:d.challenges.map((N,z)=>{const I=r.completed.includes(N.id),$=u&&(I||d.challenges.slice(0,z).every(X=>r.completed.includes(X.id)));return s.jsx("li",{children:s.jsxs("button",{type:"button",className:`challenge-row ${I?"is-done":""} ${$?"":"is-wait"}`,disabled:!$,onClick:()=>o({name:"challenge",areaId:d.id,challengeId:N.id}),children:[s.jsx("span",{className:"idx",children:z+1}),s.jsxs("span",{className:"challenge-meta",children:[s.jsx("strong",{children:N.title}),s.jsx("em",{children:jx(N.kind)}),r.stars[N.id]?s.jsx(nw,{count:r.stars[N.id],compact:!0,label:Sl(r.stars[N.id])}):null]}),s.jsx("span",{className:"row-status",children:I?Sl(r.stars[N.id]??0):$?"Play":"Soon"})]})},N.id)})}):s.jsx("p",{className:"locked-note",children:Bo(d.id,r.completed,ye(r))}),w&&u?s.jsx("button",{type:"button",className:"btn primary xl",onClick:()=>o({name:"challenge",areaId:d.id,challengeId:w.id}),children:"Keep building"}):null,g?s.jsxs("div",{className:"area-replay",children:[s.jsxs("button",{type:"button",className:"btn primary xl",onClick:()=>o({name:"challenge",areaId:d.id,challengeId:d.challenges[0].id}),children:["Walk with ",b.shortName]}),s.jsx("button",{type:"button",className:"btn gold",onClick:()=>o({name:"journal"}),children:"Read this district in the journal"})]}):null]})}function Q1({view:a,onNavigate:o,children:r}){const{progress:c}=Ge(),d=ye(c),u=cu(c),g=lu(c),y=a.name==="welcome",p=a.name==="daily"||a.name==="challenge"||a.name==="journal"||a.name==="defend"||a.name==="link"||a.name==="learn"||a.name==="profile",w=a.name==="hub",T=y||p||w||d;function b(){if(u.kind==="daily"){o({name:"daily"});return}if(u.kind==="welcome"){o({name:"welcome"});return}if(u.kind==="vista"){o({name:"vista"});return}if(u.challengeId&&u.areaId){o({name:"challenge",areaId:u.areaId,challengeId:u.challengeId});return}u.areaId&&o({name:"area",areaId:u.areaId})}return s.jsxs("div",{className:`app ${y?"is-welcome":""} ${p?"is-play":""} ${w?"is-town":""}`,"data-theme":c.theme??"candy","data-easy":c.easyMode?"on":"off",children:[s.jsx("div",{className:"grain","aria-hidden":!0}),y?null:s.jsxs("header",{className:"topbar",children:[s.jsxs("button",{type:"button",className:"brand",onClick:()=>o({name:"hub"}),children:[s.jsx(it,{who:"river",size:"sm"}),"Silver City"]}),s.jsxs("nav",{children:[s.jsx("button",{type:"button",className:a.name==="hub"?"is-active":"",onClick:()=>o({name:"hub"}),children:d?"Home":"Town"}),d?null:s.jsx("button",{type:"button",className:a.name==="daily"?"is-active":"",onClick:()=>o({name:"daily"}),children:"Trail"}),s.jsx("button",{type:"button",className:a.name==="journal"?"is-active":"",onClick:()=>o(d?Kd(c):{name:"journal"}),children:d?ee.saved:"Journal"}),s.jsx("button",{type:"button",className:a.name==="settings"?"is-active":"",onClick:()=>o({name:"settings"}),children:"Settings"})]})]}),s.jsx("div",{className:"app-body",children:r}),T?null:s.jsxs("footer",{className:"goalbar",children:[s.jsxs("button",{type:"button",className:"goal",onClick:b,children:[s.jsx("span",{className:"goal-kicker",children:"What’s next"}),s.jsx("strong",{children:u.title}),s.jsx("em",{children:u.detail})]}),s.jsxs("p",{className:"score",title:d?"Sentences you kept":"Held lines are claims you rebuilt from memory",children:[d?ee.saved:"Held"," ",c.held.length,g?` · due ${g}`:"",d?null:s.jsxs("span",{className:"score-sub",children:[" · insight ",kw(c)]})]})]})]})}function Z1(a,o){return[...a.filter(c=>c.id!==o.id),o]}const xw=[Ig,Rg,Wg,xg,Sg];function Sw(a){for(const o of xw)if(o.challenges.some(r=>r.id===a))return o.id;return a==="td-watch"?"parable-hollow":(a.startsWith("daily-"),"daily-trail")}function e0(a){for(const o of xw){const r=o.challenges.find(c=>c.id===a);if(r?.idea)return r.idea}return wl.find(o=>o.challenge.id===a)?.challenge.idea}function t0(a){const o=Sw(a);return a.startsWith("daily-")||o==="daily-trail"?tt.find(r=>r.id==="porch")??tt[0]:tt.find(r=>r.areaId===o)??tt.find(r=>r.id==="porch")??tt[0]}function n0(a){const o=Sw(a);return a.startsWith("daily-")||o==="daily-trail"?en.juniper:Eo(o)}function Wl(a){const o=e0(a);if(o)return o;if(a==="td-watch")return"when compassion moves you, help like the Samaritan";const r=Al(a);return r?`a picture you can still hold for ${r.label}`:"a picture you can still hold"}function a0(a,o){const r=n0(o),c=t0(o),d=[...a.held??[]].filter(p=>p!==o).at(-1),u=d?Et(d):void 0,g=`${r.name} · ${c.title}`;if(!u?.claim)return g;const y=u.claim.length>72?`${u.claim.slice(0,69)}…`:u.claim;return`${g} · after “${y}”`}function s0(a,o){if(Ln(a.id))return;const r=Et(a.id);if(!r)return;const c=Al(a.id);return{id:a.id,claim:r.claim,reason:r.reason,source:r.source,anchor:a0(o,a.id),picture:eu(a.id,c),beat:Wl(a.id),toolId:c?.id,acquiredAt:a.today}}function hs(a,o){return(a.learnings??[]).find(r=>r.id===o)}function ig(a,o){return(a.learnings??[]).filter(c=>c.toolId===o&&!Ln(c.id)).at(-1)}function Mw(a){return[...a.learnings??[]].filter(o=>!Ln(o.id)).reverse()}function yl(a){return a.beat?a:{...a,beat:Wl(a.id)}}function i0(a){if(a.toolId)return Ga(a.toolId)?.label??a.toolId}function Zt(a){const o=[...a];for(let r=o.length-1;r>0;r-=1){const c=Math.floor(Math.random()*(r+1)),d=o[r],u=o[c];d===void 0||u===void 0||(o[r]=u,o[c]=d)}return o}function We(a,o,r){return{gloss:a,teach:o,word:r?{term:r.term,sense:r.sense}:void 0,hint:r?.hint}}const o0={"ph-road":We("A neighbor is the person who shows mercy — not the person who looks like you.","Jesus tells a story. A hurt man lies on the road. Religious men walk past. A Samaritan is moved with compassion and helps. Then Jesus asks who *proved* to be a neighbor.",{term:"Samaritan",sense:"someone the listener did not expect to be the hero",hint:"Mercy is the test — not the family name."}),"ph-father":We("The father runs with mercy before the son finishes his speech.","The son wasted the money. He starts a hired-hand speech. The father runs first. Honor is spent so the son can be hugged.",{term:"Mercy",sense:"kindness you did not earn",hint:"The run comes before the apology is done."}),"ph-seeds":We("The kingdom comes in Jesus stories you can hold — not slogans.","Soil, a search, a tiny seed, and a trust. Each Jesus story asks what you will do with what you heard.",{term:"Parable",sense:"a Jesus story that asks you to decide",hint:"Keep the right pictures. Remove wrong picks."}),"ph-debt":We("If you were forgiven a huge debt, you cannot choke a neighbor over a small one.","A king wipes an unpayable bill. That same servant then chokes a neighbor over a tiny sum. Example: huge debt forgiven — then a tiny one demanded.",{term:"Debt",sense:"what you owe and cannot pay",hint:"Keep the mercy. Toss the choke. Example: a huge bill wiped, then a tiny one demanded."}),"wb-creed":We("Paul hands on an old shared belief: died, buried, raised, appeared.","This is not Paul’s private dream. He says the churches were already saying it: Christ died, was buried, was raised, and was seen.",{term:"Creed",sense:"an old shared belief the churches already said out loud",hint:"Death, burial, raising, appearances — in that order."}),"wb-early":We("That old shared belief is early testimony, not a medieval insert.","Paul wrote in the mid-first century. He says he received this core and passed it on. That is close to the events — not a monk’s later add-on.",{term:"Testimony",sense:"a report from people who claim to have seen",hint:"Keep “received and delivered.” Toss lab-proof talk."}),"wb-method":We("Historians weigh sources. They cannot rerun the past.","Ask: how many reports? How awkward is the detail? How soon was it said? Does it fit that world? Those tools test a report. They are not a chemistry lab.",{term:"Historian",sense:"someone who weighs old reports, not a person who reruns last Tuesday",hint:"Match each tool to what it tests."}),"wb-women":We("Women as first witnesses is an awkward detail to invent.","The tomb stories begin with women. Luke says the men called it idle talk. If you only wanted later respect, you would more likely lead with respected men.",{term:"Witness",sense:"someone who says what they saw",hint:"Keep the costly opening. Toss overclaims."}),"ob-tuning":We("The universe is finely tuned for life — that fit points to a Designer.","Life needs very tight numbers: how fast space expands, how atoms stick, how tidy the start was. Design predicts a world we can live in. Blind chance does not.",{term:"Fine-tuning",sense:"life’s dials fit in a very narrow range",hint:"Tap the picture, then the mark that belongs. Two choices."}),"ob-design":We("Fine-tuning is best explained by a mind that intended a habitable world.","The ranges are extravagantly narrow. A Designer who wants observers leads us to expect that fit. A world that does not care does not.",{term:"Habitable",sense:"a world where living things can exist",hint:"Place the next stone. Two choices. Leave the overclaims."}),"ob-leibniz":We("Physics maps how the world runs. It does not finish why there is a world.","A hot early state is still something. Empty space in a lab is still something. The question remains: why is there anything at all?",{term:"Nothing",sense:"not a vacuum — not even empty space with laws",hint:"Keep the careful reading. Toss “free lunch.”"}),"ob-life":We("Life’s specified information is a mark of mind.","Cells store instructions and run a coordinated life. That looks like the work of mind. Wonder is rational. So is more lab work. Do not shrug it away.",{term:"Specified information",sense:"ordered instructions that do a real job — not random noise",hint:"Keep the careful line. Toss both shrugs."}),"fg-mover":We("Change here and now still asks for a first changer.","Things go from “can be” to “is.” Nothing gives itself that step. A stack of receivers is not an answer. There is a first changer not itself changed.",{term:"First mover",sense:"the bottom of the explanation — not only the oldest date",hint:"Order the chain of change. Two choices at a time."}),"fg-contingent":We("What might not have been needs a ground.","You exist, but you might not have. A world of only “might-not-have-beens” does not explain why anything is here. Classical theism names the necessary ground God.",{term:"Might not have been",sense:"it is real, but it could have failed to be",hint:"Assemble the chain. Leave the joke cards."}),"fg-kalam":We("Whatever begins still asks for a cause.","If something begins, it has a cause. If this universe began, it has a cause. Naming Abraham’s God takes further historical steps.",{term:"Kalām",sense:"the beginning argument — what starts still asks for a cause",hint:"Keep the beginning argument. Toss the flattenings."}),"fg-limits":We("A first cause is not yet the whole Christian faith.","If the argument works, you have a first cause. Intellect, goodness, and the gospel are further steps — not leaks.",{term:"Creed",sense:"the full Christian confession — more than “a first cause”",hint:"Keep the honest limit. Toss “all done” and “worthless.”"}),"hl-moral":We("Duty feels real — not like a taste for tea.","Duty is more than a taste. Romans 2 says strangers already know enough to accuse one another.",{term:"Duty",sense:"what you ought to do, even when you do not feel like it",hint:"Build the modest chain. Leave contempt and collapse."}),"hl-mind":We("Inner experience is not captured by a scan.","Felt redness, thoughts about things, and the pull of truth are not just collisions. Mind is at home if the world’s ground is a living God.",{term:"Felt life",sense:"what it is like on the inside — not a scan number",hint:"Match each leftover mystery. Two choices."}),"hl-meaning":We("You can build a local meaning. The lookout asks if it is also received.","Work and pleasure are gifts. They are not the final good. Ecclesiastes keeps both truths.",{term:"Meaning",sense:"a good that can be found — not only assembled",hint:"Keep the hunger. Toss “only a mood.”"}),"hl-beauty":We("Beauty wakes a hunger it cannot feed — longing for a country the sunset cannot give.","Psalm 19 treats the sky as speech. Hungers like that usually correspond to real countries.",{term:"Beauty",sense:"a glory that calls you — not only a nice feeling",hint:"Keep the signpost. Toss “only taste.”"}),"daily-lantern":We("A lamp is meant to be seen.","Jesus uses an ordinary lamp and a city on a hill. Public without being proud.",{term:"Lamp",sense:"a light others can actually see",hint:"Keep the right pictures. Remove wrong picks."}),"daily-gems":We("Jesus taught with pictures you can hold.","A lamp is seen. Seed meets different hearts. The cup is poured for many — gift, not wage.",{term:"Gift",sense:"given, not earned as a wage",hint:"Keep the right pictures. Remove wrong picks."}),"daily-seed":We("The same word meets different soils. Some seed is lost.","This Jesus story invites hearing. It does not flatter every field.",{term:"Parable",sense:"a Jesus story that asks you to decide",hint:"Keep the honest field. Toss “every field wins.”"}),"daily-names":We("The resurrection claim stacks named witnesses, not one private voice.","Paul lists Cephas, the Twelve, and more than five hundred — many still living then.",{term:"Witness",sense:"a named person who was said to have seen",hint:"Keep the names. Toss the anonymous dream."}),"daily-creed":We("The old shared belief sits between the event and Paul’s letter.","If that short line is early, the claim is close to what it names: died, buried, raised.",{term:"Creed",sense:"an old shared belief the churches already said out loud",hint:"Keep “received.” Toss “Paul invented it while writing.”"}),"daily-stars":We("The heavens already speak of a Maker. Fine-tuning fits that voice.","Psalm 19 and Romans 1 treat the sky as speech. The heavens already speak of a Maker.",{term:"Maker",sense:"the One who intended this world",hint:"Keep the sky as speech. Toss “silent decoration.”"}),"daily-life":We("Life, place, and mind are not cheap facts.","Copying cells, a habitable band, and a mind that can do science all look given — the marks of a Maker.",{term:"Given",sense:"received, not cheap leftover",hint:"Keep the marks. Toss “it just happened.”"}),"daily-scroll":We("We hold a river of copies, not the first ink.","Scribes copy. Later hands compare. Then a page prints a recovered text. The word still stands.",{term:"Copies",sense:"later hands writing the same line — not cheating",hint:"Keep the river of copies. Toss “we hold the first ink.”"}),"daily-isaiah":We("Isaiah 53’s Servant is the Jesus the church confesses — wounded for others, silent like a lamb.","The poem’s Servant suffers for others and does not answer with a sword. The church names that Servant as Jesus.",{term:"Servant",sense:"the wounded one in Isaiah 53 — not a general on a horse",hint:"Keep the wounds. Toss the sword."}),"daily-grace":We("Grace is gift, not wage. Faith receives. Boast starves.","God moves first. You did not finish a map that earned this.",{term:"Grace",sense:"gift you did not earn",hint:"Keep the gift. Toss the wage."}),"daily-rest":We("Tired people are named first. Rest is the gift, not a steeper hill.","The invitation is to a person — “Come to me” — not a performance.",{term:"Rest",sense:"gift for the weary, not a prize for climbing harder",hint:"Keep the invitation. Toss the steeper program."}),"daily-neighbor":We("Mercy makes a neighbor. Pedigree does not.","Jesus asks who *proved* to be a neighbor — the one who showed mercy.",{term:"Pedigree",sense:"family name or in-group badge",hint:"Keep mercy. Toss “already my people.”"}),"daily-empty":We("The first Easter reports include an empty place, women, fear, and wonder.","The town does not sand that awkwardness into a tidy triumph.",{term:"Empty",sense:"the place was not occupied when they looked",hint:"Keep the awkward opening. Toss the senate conversion."}),"daily-cosmos":We("The universe exists and did not have to — so a Source is worth naming.","The world is here, and it did not have to be. The psalms name a Giver — not a shrug.",{term:"Source",sense:"the One from whom this world comes",hint:"Keep the question. Toss the shrug."}),"daily-door":We("Jesus’ “door” is a particular way in with a wide anyone.","You may refuse it. The town will not lock you in a pew.",{term:"Door",sense:"a real way in — not a wall",hint:"Keep the right pictures. Remove wrong picks."}),"td-watch":We("Love — when compassion moves you, help like the Samaritan. Tap the glowing face.","Tap the glowing face. When compassion moves you, help like the Samaritan.",{term:"Love",sense:"the Night Watch tool — how to use it, not a new main idea",hint:"Tap the face six times. Example: tap the glowing person."}),"ln-street":We("An idea lives at a place, with a person.","Mercy tells Jesus stories at the creek — that is why the neighbor who stops on the road lives at Story Creek. Silas copies names on the square — that is why the old shared belief lives at Witness Square. Juniper’s lamp is on the porch so today’s line can be seen.",{term:"Match",sense:"connect the sentence to its place and person",hint:"Tap the sentence, then the place, then the person. One story at a time."})};function Il(a){const o=ki(a),r=o0[a];if(o)return{gloss:o.easy.gloss||o.plain||r?.gloss||o.claim,teach:o.easy.learn||r?.teach||o.claim,word:o.easy.word||r?.word,hint:o.easy.hint||r?.hint};if(r)return r;const c=Et(a);if(c)return{gloss:c.claim,teach:c.reason,hint:"Read the line. Pick what matches it."}}function Fo({text:a,id:o,onPeek:r}){const{progress:c}=Ge(),d=ye(c),u=d&&o?En(Il(o)?.hint??a??""):a,[g,y]=H.useState(!1);return u?d?s.jsx("p",{className:"easy-hint",children:u}):s.jsxs("div",{className:"hint-peek",children:[s.jsx("button",{type:"button",className:"hint-toggle",onClick:()=>{g||r?.(),y(p=>!p)},children:g?"Hide":"Clue"}),g?s.jsxs(s.Fragment,{children:[s.jsx("p",{className:"hint-cost",children:"Won’t count as clean"}),s.jsx("p",{className:"context",children:a})]}):null]}):null}const ds={claim:{term:"Claim",sense:"the main idea we hold to be true",teach:"A claim is the main idea we hold to be true."},hold:{term:"Hold",sense:"keep a true line you can still say tomorrow",teach:"To hold a claim is to keep it so you can still say it tomorrow."},reason:{term:"Reason",sense:"why the claim stands",teach:"A reason is why the claim stands."},source:{term:"Source",sense:"where the claim comes from",teach:"A source is where the claim comes from."},creed:{term:"Creed",sense:"an old shared belief",teach:"A creed is an old shared belief the churches already said out loud."},parable:{term:"Parable",sense:"a Jesus story",teach:"A parable is a Jesus story that asks you to decide."},fineTuning:{term:"Fine-tuning",sense:"life’s dials fit in a very narrow range",teach:"Fine-tuning means life’s dials fit — the ranges that allow life are very tight."},premise:{term:"Premise",sense:"a building block of an argument",teach:"A premise is a building block of an argument."},kalam:{term:"Kalām",sense:"the beginning argument — what starts still asks for a cause",teach:"Kalām is the beginning argument: whatever begins still asks for a cause."},upgrade:{term:"Build this",sense:"raise the next look you earned by learning, not by paying",teach:"Build this means raise the next look you earned by learning — not by paying."},deploy:{term:"Deploy",sense:"use a claim you held",teach:"Deploy means use a claim you held — a claim is what we hold to be true."}},r0={"ph-road":["parable"],"ph-father":["parable"],"ph-seeds":["parable"],"ph-debt":["parable"],"daily-seed":["parable"],"daily-gems":["parable"],"daily-neighbor":["parable"],"wb-creed":["creed"],"wb-early":["creed"],"daily-creed":["creed"],"ob-tuning":["fineTuning"],"ob-design":["fineTuning","premise"],"daily-stars":["fineTuning"],"fg-kalam":["kalam"],"fg-mover":["premise"],"fg-contingent":["premise"],"fg-limits":["creed"],"hl-moral":["premise"]};function l0(a){return r0[a]??[]}function c0(a,o){const r=["claim"];o&&r.push("hold","reason","source"),r.push(...l0(a));const c=new Set,d=[];for(const u of r){const g=ds[u];c.has(g.term)||(c.add(g.term),d.push(g))}return d}function h0(a,o){return a==="ln-street"?"Tap the sentence, then the place, then the person. One story at a time.":a==="ph-father"?"Toss the wrong picks. Keep the father running to his son.":a==="ph-seeds"?"Match each Jesus story to the short line it is making.":a==="ph-debt"?"Sort the sentences. Only one belongs in the keep bin.":a==="daily-gems"?"Match each picture to the short line.":a==="wb-early"||a==="wb-method"?o.replace(/historical claim/,"historical line").replace(/overclaims/,"stretch"):a==="fg-contingent"?"Stack the stones: things that might not have been still need a ground.":a==="fg-kalam"?"Keep the beginning argument. Toss the rest.":o.replace(/\bclaims\b/g,"sentences").replace(/\bclaim\b/g,"main idea")}function $o({challenge:a}){const{progress:o}=Ge(),r=ye(o)?a.prompt:a.idea??a.prompt,c=ye(o)?h0(a.id,r):r;return s.jsx("p",{className:"prompt",children:c})}function ws({play:a,stamp:o="Locked!"}){return a?s.jsxs("div",{className:"win-burst","aria-hidden":!0,children:[s.jsx("span",{className:"win-flash"}),s.jsx("span",{className:"win-ring"}),s.jsx("span",{className:"win-stamp-wrap",children:s.jsx("strong",{className:"win-stamp is-badge",children:o})}),r1.map(r=>s.jsx("span",{className:`win-spark ${r%3===0?"is-shard":""}`,style:{"--i":r}},r)),dw.map(r=>s.jsx("span",{className:"win-gem",style:{"--i":r}},`gem-${r}`))]}):null}function ul(a,o,r){const c=a.slots[o];if(!c)return null;const d=a.cards.filter(y=>y.id!==c.correctCardId&&!r.has(y.id)),u=d.filter(y=>y.distractor),g=u.length>0?u:d;return Zt(g)[0]?.id??null}function d0({challenge:a,onMiss:o,onSolved:r,onPeek:c}){const{progress:d}=Ge(),u=ye(d)||a.id.startsWith("ob-"),g=H.useMemo(()=>Zt(a.cards),[a.cards]),y=g,[p,w]=H.useState(g),[T,b]=H.useState({}),[x,N]=H.useState(null),[z,I]=H.useState("idle"),[$,X]=H.useState(!1),[te,se]=H.useState(0),[oe,re]=H.useState([]),[B,F]=H.useState(()=>u?ul(a,0,new Set):null),ne=a.slots.find(R=>!T[R.id]),Q=new Set(Object.values(T).filter(R=>!!R).map(R=>R.id)),ge=new Set(u?[ne?.correctCardId,B].filter(R=>!!R):y.map(R=>R.id)),C=a.slots.every(R=>T[R.id]);function O(R){return p.find(k=>k?.id===R)??Object.values(T).find(k=>k?.id===R)}function E(R=!0){I("wrong"),X(!0),R&&(se(k=>k+1),o()),window.setTimeout(()=>{X(!1),I("idle")},880)}function Z(){X(!1),I("idle"),N(null)}function L(R,k){const M={...T},G=M[k];for(const ie of Object.keys(M))M[ie]?.id===R.id&&delete M[ie];M[k]=R;const J=ie=>y.findIndex(me=>me.id===ie);return w(ie=>{const me=ie.map(ve=>ve?.id===R.id?null:ve);if(G&&G.id!==R.id){const ve=J(G.id);ve>=0&&(me[ve]=G)}return me}),b(M),N(null),re(ie=>ie.filter(me=>me!==k)),I("idle"),M}function v(R){if(z==="ok"||!x)return;const k=O(x);if(!k||u&&ne&&R!==ne.id)return;if(u&&ne&&k.id!==ne.correctCardId){E(),N(null);return}const M=L(k,R);if(u){const G=a.slots.findIndex(J=>!M[J.id]);F(G>=0?ul(a,G,new Set(Object.values(M).filter(J=>!!J).map(J=>J.id))):null),a.slots.every(J=>M[J.id])&&(I("ok"),r())}}function S(R){if(z==="ok")return;if(!u){N(R===x?null:R),I("idle");return}if(!ne)return;if(R!==ne.correctCardId){E();return}const k=O(R);if(!k)return;const M=L(k,ne.id),G=a.slots.findIndex(J=>!M[J.id]);F(G>=0?ul(a,G,new Set(Object.values(M).filter(J=>!!J).map(J=>J.id))):null),a.slots.every(J=>M[J.id])&&(I("ok"),r())}function _(R){if(z==="ok")return;const k=O(R);if(!k)return;const M=y.findIndex(J=>J.id===R),G={...T};for(const J of Object.keys(G))G[J]?.id===R&&delete G[J];if(b(G),w(J=>{if(J.some(me=>me?.id===R))return J;const ie=[...J];return M>=0&&(ie[M]=k),ie}),N(null),re(J=>J.filter(ie=>T[ie]?.id!==R)),I("idle"),u){const J=a.slots.findIndex(ie=>!G[ie.id]);F(J>=0?ul(a,J,Q):null)}}function ae(R=T){const k=a.slots.filter(M=>R[M.id]?.id!==M.correctCardId).map(M=>M.id);if(k.length===0&&a.slots.every(M=>R[M.id])){I("ok"),re([]),r();return}re(k),E()}return s.jsxs("div",{className:`play is-build is-onescreen ${u?"is-deal":""} ${$?"is-shake":""} ${z==="ok"?"is-win":""}`,children:[s.jsx(ws,{play:z==="ok"}),s.jsx($o,{challenge:a}),s.jsx(Fo,{text:a.context,id:a.id,onPeek:c}),s.jsx("p",{className:"sort-how",children:ye(d)?s.jsxs(s.Fragment,{children:[s.jsx("strong",{children:"A premise is a building block of an argument."})," Tap the next stone",u?" · two choices":""]}):u?s.jsxs(s.Fragment,{children:[s.jsx("strong",{children:"Tap the next stone"})," · two choices"]}):s.jsxs(s.Fragment,{children:[s.jsx("strong",{children:"Tap a stone"})," · then a slot"]})}),te>0&&z!=="ok"?s.jsxs("p",{className:"match-toast",role:"status",children:[s.jsx("strong",{children:te>=2?"One more look.":"That stone slipped."})," ",te>=2?ye(d)?"Look again. Two choices.":a.teachOnWrong:u?"Not that stone. Try the other — the chain stays.":"Tap a red slot to swap. The chain stays; try again."]}):null,te>0&&z!=="ok"?s.jsx("button",{type:"button",className:"btn tiny match-recover",onClick:Z,children:"Try again"}):null,s.jsx("div",{className:"slot-list",children:a.slots.map((R,k)=>{const M=T[R.id],G=u?R.id===ne?.id:!M&&!!x;return s.jsxs("div",{className:`slot ${R.role} ${oe.includes(R.id)?"is-wrong":""} ${G?"is-now":""}`,onClick:()=>{M||v(R.id)},children:[s.jsx("span",{className:"slot-label",children:R.label}),M?s.jsx("button",{type:"button",className:"chip in-slot pop-in",style:z==="ok"?gi(k,"mid"):void 0,onClick:J=>{J.stopPropagation(),_(M.id)},children:M.text}):s.jsx("button",{type:"button",className:`slot-target ${G?"awaiting":""}`,onClick:J=>{J.stopPropagation(),v(R.id)},children:G?"↓":""})]},R.id)})}),!u&&C&&z!=="ok"?s.jsx("button",{type:"button",className:"btn primary build-lock",onClick:()=>ae(),children:"Check the chain"}):null,s.jsx("div",{className:"bank is-order",children:y.map((R,k)=>{const M=p[k]?.id===R.id,G=u&&M&&!ge.has(R.id);return u&&!M||G?null:s.jsx("div",{className:`sort-tile sort-seat ${M&&x===R.id?"is-selected":""} ${M?"":"is-gone"} ${M?"":"was-placed"}`,style:u?void 0:{gridColumn:k%2+1,gridRow:Math.floor(k/2)+1},children:s.jsx("button",{type:"button",className:`chip ${M&&x===R.id?"is-selected":""} ${R.distractor?"is-tempt":""}`,tabIndex:0,"aria-label":M?R.text:`Return ${R.text} to its seat`,onClick:()=>{M?S(R.id):_(R.id)},children:R.text})},R.id)})})]})}const u0=new Set(["THE","AND","FOR","THAT","THIS","WITH","FROM","WHO","ONE","WAS","ARE","NOT","BUT","HIS","HER","HIM","YOU","YOUR","OUR","ITS","HAD","HAS","HAVE","BEEN","THEY","THEM","THEN","THAN","ALSO","INTO","ONLY","JUST","LIKE","OVER","AFTER","BEFORE","ABOUT","WHEN","WHAT","WHICH","WHILE","WHERE","THERE","THEIR","STILL","DOES","DID","CAN","MAY","WILL","WOULD","COULD","SHOULD","BEING","BECAUSE","THEN","THAN","OFF","OUT","OWN","HOW","WHY","ALL","ANY","EACH","MORE","MOST","SOME","SUCH","VERY","MUCH","MANY","TELLS","TELL","SAYS","SAID","ASKS","ASK","LIVES","LIVE","LINE","MAIN","IDEA","TRUE","SHORT"]),og="AEIOURSTLNCMDHPYGBKWFVJX".split(""),m0=[{r:0,c:1},{r:1,c:0},{r:1,c:1}],p0=8,jw=3,Cw=8,ud=4;function f0(a){return a.toUpperCase().replace(/[^A-Z]/g,"")}function y0(a){const o=a.trim();return o&&o.charAt(0).toUpperCase()+o.slice(1).toLowerCase()}function ko(a){return a.split(/[^A-Za-z]+/).map(o=>o.toUpperCase()).filter(o=>o.length>=jw&&o.length<=Cw&&!u0.has(o))}function g0(a){let o=2166136261;for(let r=0;r<a.length;r+=1)o=Math.imul(o^a.charCodeAt(r),16777619);return o>>>0}function w0(a){let o=a||1;return()=>(o=Math.imul(o,1664525)+1013904223>>>0,o/4294967296)}function rg(a,o){const r=[...a];for(let c=r.length-1;c>0;c-=1){const d=Math.floor(o()*(c+1)),u=r[c],g=r[d];u===void 0||g===void 0||(r[c]=g,r[d]=u)}return r}function os(a,o,r){const c=f0(o);c.length<jw||c.length>Cw||a.some(d=>d.text===c)||a.push({id:`${r}-${c.toLowerCase()}`,text:c,label:y0(c),kind:r})}function b0(a){const o=ki(a),r=Fd(a),c=o?.claim||Et(a)?.claim||"",d=[];os(d,r.who,"person");const u=r.place.split(/\s+/).filter(Boolean);os(d,u[u.length-1]??r.place,"place");const g=ko(c),y=g.filter(x=>x.length>=7).sort((x,N)=>N.length-x.length),p=g.filter(x=>x.length<=6).sort((x,N)=>N.length-x.length);y[0]&&os(d,y[0],"idea");for(const x of p){if(d.length>=ud)break;os(d,x,"idea")}const w=o?.easy.word?.term,T=En(c),b=[...ko(T),...ko(o?.easy.learn??""),...ko(o?.easy.gloss??""),...ko(w??"")].filter(x=>x.length<=6);for(const x of b){if(d.length>=ud)break;os(d,x,"idea")}return d.length<3&&(os(d,"KEEP","idea"),os(d,"TRUE","idea")),d.slice(0,ud)}function v0(a){return Array.from({length:a},()=>Array.from({length:a},()=>""))}function Ed(a,o,r,c){const d=a.length;for(let u=0;u<o.length;u+=1){const g=r.r+c.r*u,y=r.c+c.c*u;if(g<0||y<0||g>=d||y>=d)return!1;const p=a[g]?.[y],w=o[u];if(p&&p!==w)return!1}return!0}function Ld(a,o,r,c){const d=[];for(let u=0;u<o.length;u+=1){const g=r.r+c.r*u,y=r.c+c.c*u,p=a[g];p&&(p[y]=o[u]??"",d.push({r:g,c:y}))}return d}function k0(a,o){const r={r:0,c:1};for(let c=0;c<a.length;c+=1){const d={r:c,c:0};if(Ed(a,o,d,r))return Ld(a,o,d,r)}for(let c=0;c<a.length;c+=1)for(let d=0;d<a.length;d+=1){const u={r:c,c:d};if(Ed(a,o,u,r))return Ld(a,o,u,r)}return null}function T0(a,o,r){return(a.charCodeAt(0)+o*3+r*5)%6}function x0(a){const o=b0(a),r=p0,c=w0(g0(a)),d=v0(r),u={},g=[];for(let p=0;p<r;p+=1)for(let w=0;w<r;w+=1)g.push({r:p,c:w});o.slice().sort((p,w)=>w.text.length-p.text.length).forEach(p=>{const w=rg(m0,c),T=rg(g,c);let b=null;for(const x of w){for(const N of T)if(Ed(d,p.text,N,x)){b=Ld(d,p.text,N,x);break}if(b)break}u[p.id]=b??k0(d,p.text)??[]});const y=d.map(p=>p.map(w=>w||(og[Math.floor(c()*og.length)]??"A")));return{id:a,size:r,words:o,letters:y,paths:u}}function Cl(a,o){return a.r===o.r&&a.c===o.c}function Mo(a){return`${a.r}:${a.c}`}function S0(a,o){const r=o.r-a.r,c=o.c-a.c;return r>=-1&&r<=1&&c>=-1&&c<=1&&!(r===0&&c===0)}function Aw(a){if(a.length<2)return!1;const o=a[0],r=a[1];if(!o||!r)return!1;const c=r.r-o.r,d=r.c-o.c;if(c===0&&d===0||Math.abs(c)>1||Math.abs(d)>1)return!1;for(let u=2;u<a.length;u+=1){const g=a[u-1],y=a[u];if(!g||!y||y.r-g.r!==c||y.c-g.c!==d)return!1}return!0}function M0(a,o){return a.map(r=>o[r.r]?.[r.c]??"").join("")}function j0(a,o){if(a.some(d=>Cl(d,o)))return a.length>=2&&Cl(a[a.length-2],o)?a.slice(0,-1):a;const r=a[a.length-1];if(!r)return[o];if(!S0(r,o))return a;const c=[...a,o];return c.length>=3&&!Aw(c)?a:c}function lg(a,o,r){if(!Aw(a))return null;const c=M0(a,o.letters);return o.words.find(d=>d.text===c&&!r.includes(d.id))??null}function C0(a,o){const r=new Set;for(const c of a.words)if(!o.includes(c.id))for(const d of a.paths[c.id]??[])r.add(Mo(d));return r}const A0=[0,1,2,3,4,5,6,7];function N0(a,o){const r=document.elementFromPoint(a,o),c=r instanceof Element?r.closest("[data-gem-cell]"):null;if(!(c instanceof HTMLElement)||c.classList.contains("is-clear"))return null;const d=Number(c.dataset.r),u=Number(c.dataset.c);return!Number.isFinite(d)||!Number.isFinite(u)?null:{r:d,c:u}}function E0({lineId:a,onMiss:o,onEasyStop:r}){const c=H.useMemo(()=>x0(a),[a]),[d,u]=H.useState([]),[g,y]=H.useState([]),[p,w]=H.useState([]),[T,b]=H.useState([]),[x,N]=H.useState(0),[z,I]=H.useState(!1),[$,X]=H.useState(""),[te,se]=H.useState("play"),oe=H.useRef(!1),re=H.useRef(!1),B=H.useRef([]),F=H.useRef([]),ne=C0(c,d),Q=c.words.find(M=>!d.includes(M.id)),ge=c.words.length-d.length;function C(M){y(G=>{const J=typeof M=="function"?M(G):M;return B.current=J,J})}H.useEffect(()=>{u([]),F.current=[],B.current=[],y([]),w([]),b([]),N(0),X(""),se("play")},[a]);function O(M){X(M),window.setTimeout(()=>X(G=>G===M?"":G),1600)}function E(M,G,J){const ie=M.map(Mo);w(ie),Yy(J?"win":"find"),O(`${G}!`),J&&window.setTimeout(()=>{const me=[];c.letters.forEach((ve,ce)=>{ve.forEach((be,Se)=>{const he=`${ce}:${Se}`;ie.includes(he)||me.push(he)})}),w([...ie,...me])},160),window.setTimeout(()=>w([]),J?880:520)}function Z(M){if(!Q)return;const G=c.paths[Q.id]??[];if(M>=4&&G.length){b(G.map(Mo)),O(`Try this word: ${Q.label}.`);return}if(M>=2){const J=G[0];b(J?[Mo(J)]:[]),O(`Try this word: ${Q.label}.`)}}function L(M){const G=lg(M,c,F.current);if(G){const J=[...F.current,G.id];F.current=J;const ie=J.length===c.words.length;return u(J),C([]),b([]),N(0),E(M,G.label,ie),ie&&se("ok"),!0}return!1}function v(M){if(L(M))return;if(M.length<3){C([]);return}I(!0),Yy("miss");const G=x+1;N(G),o(),Z(G),window.setTimeout(()=>{I(!1),C([])},420)}function S(M,G){if(te==="ok")return;const J=B.current;let ie=J;if(!J.length)ie=[M];else if(Cl(J[J.length-1],M))ie=J;else{const me=j0(J,M);me.length>J.length?ie=me:G==="tap"&&(ie=[M])}C(ie),L(ie)}function _(M,G){te!=="ok"&&(M.preventDefault(),M.stopPropagation(),oe.current=!0,re.current=!1,I(!1),S(G,"tap"))}function ae(M){if(!oe.current||te==="ok")return;const G=N0(M.clientX,M.clientY);if(!G)return;const J=B.current[B.current.length-1];J&&Cl(J,G)||(re.current=!0,S(G,"drag"))}function R(){oe.current&&(oe.current=!1,re.current&&!lg(B.current,c,F.current)&&v(B.current))}const k=new Set(g.map(Mo));return s.jsxs("div",{className:`play is-gem-search ${z?"is-shake":""} ${te==="ok"?"is-win":""} ${p.length?"is-boom":""}`,style:{"--gem-size":c.size},onPointerUp:R,onPointerCancel:R,children:[s.jsx(ws,{play:te==="ok",stamp:ee.matchWin}),s.jsx("p",{className:"sort-how",children:ee.matchHunt}),s.jsx("ul",{className:"gem-words","aria-label":"Words to find",children:c.words.map(M=>s.jsxs("li",{className:`gem-word is-${M.kind} ${d.includes(M.id)?"is-found":""} ${Q?.id===M.id&&x>=2?"is-hint":""}`,children:[s.jsx("span",{className:"gem-word-label",children:M.label}),s.jsx("span",{className:"gem-word-kind",children:M.kind==="person"?"person":M.kind==="place"?"place":"idea"})]},M.id))}),$?s.jsx("p",{className:"match-toast gem-toast",role:"status",children:s.jsx("strong",{children:$})}):null,s.jsx("div",{className:"gem-board",role:"grid","aria-label":"Letter gems",onPointerMove:ae,onPointerUp:R,onPointerCancel:R,children:c.letters.flatMap((M,G)=>M.map((J,ie)=>{const me=`${G}:${ie}`,ve=p.includes(me),ce=ne.has(me),be=!ce&&c.words.some(Se=>d.includes(Se.id)?(c.paths[Se.id]??[]).some(he=>he.r===G&&he.c===ie):!1);return s.jsxs("div",{role:"gridcell","data-gem-cell":!0,"data-r":G,"data-c":ie,onPointerDown:Se=>_(Se,{r:G,c:ie}),className:`gem-cell hue-${T0(J,G,ie)} ${k.has(me)?"is-sel":""} ${ve?"is-burst":""} ${be?"is-clear":""} ${ce&&d.length>0&&!k.has(me)?"is-live":""} ${T.includes(me)?"is-hint":""}`,children:[s.jsx("span",{className:"gem-letter",children:J}),ve?A0.map(Se=>s.jsx("span",{className:"gem-shard",style:{"--i":Se}},Se)):null,ve?dw.slice(0,4).map(Se=>s.jsx("span",{className:"gem-pop",style:{"--i":Se}},`p-${Se}`)):null]},me)}))}),s.jsxs("p",{className:"match-score",children:[ge," left · ",d.length," / ",c.words.length," found"]}),te==="ok"?s.jsxs("div",{className:"cta-dock",children:[s.jsx("button",{type:"button",className:"btn primary xl snap-bins",onClick:()=>r?.("hold"),children:ee.holdNext}),s.jsx("button",{type:"button",className:"btn xl",onClick:()=>r?.("home"),children:ee.home})]}):null]})}const L0=""+new URL("neighbor-shows-mercy-DjFor-Rl.png",import.meta.url).href,Nw={"ph-road":L0};function rs(a,o){return a<o?`${a}:${o}`:`${o}:${a}`}function H0({node:a,easy:o,challenge:r}){const c=Kg(a,r),d=!!(c.who||c.plotId||c.art);return s.jsxs(s.Fragment,{children:[c.art?s.jsx("img",{className:"place-glyph link-art",src:Nw[c.art],alt:"",draggable:!1}):null,c.who?s.jsx(it,{who:c.who,size:"xl"}):null,c.plotId?s.jsx(Mx,{plotId:c.plotId}):null,s.jsx("span",{className:d?"link-label":void 0,children:Yg(a,o)})]})}function W0(a,o){return a==="idea"?o?"Sentence":"Idea":a==="place"?"Place":"Person"}function cg(a,o){return o==="idea"?a.ideaId:o==="place"?a.placeId:o==="person"?a.personId:null}function I0({challenge:a,onMiss:o,onSolved:r,onPeek:c,onEasyStop:d,streetBeat:u}){const{progress:g}=Ge(),y=ye(g),[p,w]=H.useState([]),[T,b]=H.useState("idea"),[x,N]=H.useState(null),[z,I]=H.useState("idle"),[$,X]=H.useState(!1),[te,se]=H.useState(0),[oe,re]=H.useState(null),[B,F]=H.useState(!1),[ne,Q]=H.useState("choose");function ge(ce){const be=a.triples.find(Se=>Se.id===ce);return be?[rs(be.ideaId,be.placeId),rs(be.placeId,be.personId)]:[]}const C=a.triples.find(ce=>{const be=new Set(p.filter(Se=>Se.triple===ce.id).map(Se=>rs(Se.a,Se.b)));return!ge(ce.id).every(Se=>be.has(Se))}),O=C?cg(C,T):null,E=C?new Set([C.ideaId,C.placeId,C.personId]):null,Z={idea:!!(C&&p.some(ce=>ce.triple===C.id&&(ce.a===C.ideaId||ce.b===C.ideaId)))||T==="place"||T==="person"||T==="linked",place:!!(C&&p.some(ce=>ce.triple===C.id&&rs(ce.a,ce.b)===rs(C.ideaId,C.placeId)))||T==="person"||T==="linked",person:T==="linked"||!!(C&&ge(C.id).every(ce=>p.some(be=>be.triple===C.id&&rs(be.a,be.b)===ce)))},L=H.useMemo(()=>{if(!C||T==="linked")return[];const ce=T,be=cg(C,T),Se=a.nodes.filter(de=>de.kind===ce),he=Se.find(de=>de.id===be),ze=Zt(YT(Se,be??"")),Ue=y?ze.slice(0,1):ce==="idea"?ze.slice(0,3):ze;return Zt([he,...Ue].filter(de=>!!de))},[a.nodes,C?.id,T,y]);function v(){N(null),X(!1),I("idle"),re(null),Q("choose")}function S(ce){const be=[...p,{a:ce.ideaId,b:ce.placeId,triple:ce.id},{a:ce.placeId,b:ce.personId,triple:ce.id}];w(be),re(null),N(ce.personId),window.setTimeout(()=>N(null),380);const Se=a.triples.every(he=>{const ze=new Set(be.filter(Ue=>Ue.triple===he.id).map(Ue=>rs(Ue.a,Ue.b)));return ge(he.id).every(Ue=>ze.has(Ue))});if(y||Se){b("linked"),I("ok");return}b("linked")}function _(){C&&(Q("choose"),re(null),N(null),T==="idea"?b("place"):T==="place"?b("person"):S(C))}function ae(ce){if(!(z==="ok"||T==="linked"||!C||!O)){if(!y&&$&&v(),ce===O){if(re(ce),N(ce),I("idle"),se(0),y){_();return}window.setTimeout(()=>N(null),380),T==="idea"?b("place"):T==="place"?b("person"):S(C);return}re(ce),N(ce),I("wrong"),X(!0),se(be=>be+1),y&&Q("miss"),o()}}function R(){B||(F(!0),r())}function k(){v(),b("idea")}const M=z==="ok"?y?"All 3 matches complete":u?"Tonight’s street is done":"All 3 links complete":T==="linked"?y?"This match is complete. Tap Next.":"This link is complete. Tap Next.":y?ee.connectLink:"Tap idea → place → person",G=T==="linked"?"idea":T,J=y&&C?ox(C.id,G):T==="place"?"Wrong lot. Snap the idea to the place that keeps it.":T==="person"?"Wrong keeper. The person who lives on that lot is the match.":"Wrong idea. Pick the claim, then its place, then its person.",ie=y||T==="linked"||z==="ok"?null:T==="idea"?"1 of 3 — pick the idea.":T==="place"?"2 of 3 — pick the place.":"3 of 3 — pick the person.",me=T==="place"?"place":T==="person"?"person":"idea",ve=L;if(H.useEffect(()=>{if(!y||ne!=="miss"||!O)return;const ce=document.querySelector(".link-block.is-need");ce instanceof HTMLElement&&ce.scrollIntoView({block:"center",behavior:"smooth"})},[y,ne,O,T]),z==="ok"){const ce=u?u.left>0?"Tonight’s street":"Street linked":"All 3 links complete";return s.jsxs("div",{className:"play is-link is-wizard is-finale",children:[s.jsx(ws,{play:!0,stamp:y?ee.matchWin:ce}),s.jsx("p",{className:"link-complete",role:"status",children:y?ee.matchDone:u?u.left>0?`${u.place} is lit`:"The whole street is linked":"All 3 links complete"}),y||!u?null:s.jsxs("p",{className:"quiet",children:[u.linkedAfter," of ",u.total," facts",u.left>0?` · ${u.left} still wait`:""]}),s.jsxs("ol",{className:"link-checks","aria-label":y?"This match":"Tonight’s links",children:[s.jsxs("li",{className:"is-done",children:["✓ ",y?"Sentence":"Idea"]}),s.jsx("li",{className:"is-done",children:"✓ Place"}),s.jsx("li",{className:"is-done",children:"✓ Person"})]}),s.jsx("div",{className:"link-dock",children:y?s.jsxs(s.Fragment,{children:[s.jsx("button",{type:"button",className:"btn primary xl link-next",onClick:()=>d?d("hold"):R(),children:ee.holdNext}),s.jsx("button",{type:"button",className:"btn xl link-next",onClick:()=>d?d("home"):R(),children:ee.home})]}):s.jsx("button",{type:"button",className:"btn primary xl link-next",onClick:R,children:"Done"})})]})}return s.jsxs("div",{className:`play is-link is-wizard ${y?`is-easy-link is-screen-${ne}`:""} ${$?"is-shake":""}`,children:[y||T==="linked"?null:s.jsx($o,{challenge:a}),y||T==="linked"?null:s.jsx(Fo,{text:a.context,id:a.id,onPeek:c}),y?null:s.jsx("p",{className:"next-tap",children:M}),ie?s.jsx("p",{className:"quiet wizard-step",children:ie}):null,y?s.jsxs("div",{className:"easy-teach",children:[s.jsxs("p",{className:"easy-steps","aria-label":"Match steps",children:[s.jsx("span",{className:me==="idea"?"is-now":Z.idea?"is-done":"",children:"1 · Sentence"}),s.jsx("span",{className:"easy-steps-arrow","aria-hidden":!0,children:"→"}),s.jsx("span",{className:me==="place"?"is-now":Z.place?"is-done":"",children:"2 · Place"}),s.jsx("span",{className:"easy-steps-arrow","aria-hidden":!0,children:"→"}),s.jsx("span",{className:me==="person"?"is-now":Z.person?"is-done":"",children:"3 · Person"})]}),ne==="miss"?s.jsx("p",{className:"match-toast",role:"status",children:J}):null]}):s.jsxs("ol",{className:"link-checks","aria-label":"Link steps",children:[s.jsxs("li",{className:Z.idea?"is-done":T==="idea"?"is-now":"",children:[Z.idea?"✓":"1"," Idea"]}),s.jsxs("li",{className:Z.place?"is-done":T==="place"?"is-now":"",children:[Z.place?"✓":"2"," Place"]}),s.jsxs("li",{className:Z.person?"is-done":T==="person"?"is-now":"",children:[Z.person?"✓":"3"," Person"]})]}),!y&&(z==="wrong"||te>0)?s.jsx("p",{className:"match-toast",role:"status",children:J}):null,!y&&te>0&&T!=="linked"?s.jsx("button",{type:"button",className:"btn tiny match-recover",onClick:v,children:"Try again"}):null,y?null:s.jsx("p",{className:"match-score",children:u?`${a.triples.length*2-p.length} links left tonight · ${u.linkedAfter-a.triples.length+p.length/2} of ${u.total} facts`:`${a.triples.length*2-p.length} links left · ${p.length} / ${a.triples.length*2} snapped`}),T==="linked"?s.jsx("div",{className:"link-dock",children:s.jsx("button",{type:"button",className:"btn primary xl link-next",onClick:k,children:"Next"})}):s.jsx("div",{className:"link-grid is-wizard",children:s.jsxs("div",{className:`link-col is-${T}`,children:[y&&C&&ne==="choose"?s.jsx("p",{className:"link-clue",children:sx(C.id,T)}):null,y?null:s.jsx("p",{className:"match-col-label",children:W0(T,y)}),ve.map(ce=>{const be=Kg(ce,a),Se=ce.id===O,he=y&&ne==="miss"&&!Se,ze=y&&ne==="miss"&&Se;return s.jsxs("button",{type:"button",className:`link-block is-${ce.kind} ${be.who||be.plotId||be.art?"is-picture":""} ${oe===ce.id?"is-selected":""} ${x===ce.id?"is-flash":""} ${!y&&E?.has(ce.id)?"is-focus":""} ${ze?"is-need":""} ${he?"is-not":""}`,onClick:()=>ae(ce.id),children:[ze?s.jsx("span",{className:"need-chip",children:"This one"}):null,s.jsx(H0,{node:ce,easy:y,challenge:a})]},ce.id)})]})})]})}function R0({scene:a}){const o=H.useId().replace(/:/g,"");switch(a){case"expand":return s.jsxs(Ze,{uid:o,from:"#14062e",to:"#2a0d58",children:[s.jsx("circle",{cx:"32",cy:"32",r:"8",fill:"#fff6b8"}),s.jsx("circle",{cx:"32",cy:"32",r:"3.5",fill:"#ffcc33"}),s.jsx("path",{d:"M32 22V12M32 42v10M22 32H12M42 32h10M24 24l-7-7M40 24l7-7M24 40l-7 7M40 40l7 7",stroke:"#ffcc33",strokeWidth:"3",strokeLinecap:"round"}),s.jsx("polygon",{points:"32,6 28,13 36,13",fill:"#ffcc33"}),s.jsx("polygon",{points:"32,58 28,51 36,51",fill:"#ffcc33"}),s.jsx("polygon",{points:"6,32 13,28 13,36",fill:"#ffcc33"}),s.jsx("polygon",{points:"58,32 51,28 51,36",fill:"#ffcc33"}),s.jsx("circle",{cx:"16",cy:"14",r:"3.4",fill:"#c86bff"}),s.jsx("circle",{cx:"50",cy:"16",r:"3",fill:"#7dffb0"}),s.jsx("circle",{cx:"48",cy:"48",r:"3.4",fill:"#ff9f1a"}),s.jsx("circle",{cx:"16",cy:"48",r:"2.8",fill:"#fff"})]});case"bind":return s.jsxs(Ze,{uid:o,from:"#12382a",to:"#1a0840",children:[s.jsx("path",{d:"M24 32h16",stroke:"#7dffb0",strokeWidth:"10",strokeLinecap:"round"}),s.jsx("path",{d:"M28 26c4 4 4 8 0 12M36 26c-4 4-4 8 0 12",stroke:"#148a48",strokeWidth:"2.2",fill:"none"}),s.jsx("circle",{cx:"16",cy:"32",r:"12",fill:"#fff6e8",stroke:"#ffe08a",strokeWidth:"2.4"}),s.jsx("circle",{cx:"48",cy:"32",r:"15",fill:"#ffcc33",stroke:"#fff8dc",strokeWidth:"2.4"}),s.jsx("circle",{cx:"16",cy:"32",r:"4.5",fill:"#c4922a"}),s.jsx("circle",{cx:"48",cy:"32",r:"6",fill:"#8a5a22"})]});case"tidy":return s.jsxs(Ze,{uid:o,from:"#2a0d58",to:"#1a0840",children:[s.jsx("circle",{cx:"48",cy:"14",r:"8",fill:"#ffcc33"}),s.jsx("rect",{x:"4",y:"52",width:"56",height:"5",rx:"1",fill:"#ffe08a"}),s.jsx("rect",{x:"10",y:"36",width:"16",height:"16",rx:"2",fill:"#ffcc33"}),s.jsx("rect",{x:"24",y:"36",width:"16",height:"16",rx:"2",fill:"#fff6b8"}),s.jsx("rect",{x:"10",y:"20",width:"16",height:"16",rx:"2",fill:"#ffe08a"}),s.jsx("rect",{x:"24",y:"20",width:"16",height:"16",rx:"2",fill:"#ffcc33"})]});case"dial":return s.jsxs(Ze,{uid:o,from:"#1a0840",to:"#3a1480",children:[s.jsx("circle",{cx:"32",cy:"36",r:"18",fill:"#fff6e8",stroke:"#ffcc33",strokeWidth:"3"}),s.jsx("path",{d:"M32 20v3M32 49v3M16 36h3M45 36h3M21 25l2 2M41 25l-2 2M21 47l2-2M41 47l-2-2",stroke:"#c4922a",strokeWidth:"2",strokeLinecap:"round"}),s.jsx("path",{d:"M32 36 42 24",stroke:"#b01c40",strokeWidth:"3.2",strokeLinecap:"round"}),s.jsx("circle",{cx:"32",cy:"36",r:"3.4",fill:"#2a0d58"}),s.jsx("circle",{cx:"12",cy:"12",r:"8",fill:"#3d7ccc"}),s.jsx("path",{d:"M8 11c3-3 7-2 9 1 1 2-1 4-3 4-2 1-4 0-4-2Z",fill:"#3dcc7a"}),s.jsx("path",{d:"M54 4 46 16h6l-8 14 12-12h-6Z",fill:"#ffcc33"})]});case"witnesses":return s.jsxs(Ze,{uid:o,from:"#3a1480",to:"#1a0840",children:[s.jsx(xn,{x:14,y:40,fill:"#ffcc33"}),s.jsx(xn,{x:32,y:38,fill:"#fff6b8"}),s.jsx(xn,{x:50,y:40,fill:"#c86bff"}),s.jsx(md,{x:10,y:12}),s.jsx(md,{x:28,y:8}),s.jsx(md,{x:46,y:12})]});case"reluctant":return s.jsxs(Ze,{uid:o,from:"#2a0d58",to:"#1a0840",children:[s.jsx("circle",{cx:"22",cy:"18",r:"8",fill:"#ffe7b8"}),s.jsx("path",{d:"M14 30c0-6 4-10 8-10s8 4 8 10v16H14Z",fill:"#ffe7b8"}),s.jsx("path",{d:"M16 16c3 4 8 5 12 2",stroke:"#8a5a22",strokeWidth:"2.2",fill:"none",strokeLinecap:"round"}),s.jsx("path",{d:"M26 20c2 4 2 8-1 10",stroke:"#ffe7b8",strokeWidth:"3.4",strokeLinecap:"round"}),s.jsx("circle",{cx:"18",cy:"12",r:"1.6",fill:"#fff"}),s.jsx("rect",{x:"40",y:"24",width:"18",height:"24",rx:"3",fill:"#fff6e8"}),s.jsx("path",{d:"M44 32h10M44 38h8",stroke:"#c4922a",strokeWidth:"2",strokeLinecap:"round"}),s.jsx("path",{d:"M46 46c2 2 6 2 8 0",stroke:"#ff5a7a",strokeWidth:"2",fill:"none",strokeLinecap:"round"})]});case"clock":return s.jsxs(Ze,{uid:o,from:"#2a0d58",to:"#ff5a7a",children:[s.jsx("circle",{cx:"32",cy:"46",r:"14",fill:"#ffcc33"}),s.jsx("circle",{cx:"32",cy:"46",r:"7",fill:"#fff6b8"}),s.jsx("path",{d:"M0 52h64v12H0Z",fill:"#148a48"}),s.jsx("circle",{cx:"32",cy:"26",r:"16",fill:"#fff6e8",stroke:"#2a0d58",strokeWidth:"3"}),s.jsx("path",{d:"M32 14v3M32 35v3M19 26h3M42 26h3",stroke:"#c4922a",strokeWidth:"2",strokeLinecap:"round"}),s.jsx("path",{d:"M32 26v-8",stroke:"#2a0d58",strokeWidth:"2.6",strokeLinecap:"round"}),s.jsx("path",{d:"M32 26l6 4",stroke:"#b01c40",strokeWidth:"2.4",strokeLinecap:"round"}),s.jsx("circle",{cx:"32",cy:"26",r:"2.2",fill:"#2a0d58"})]});case"judea":return s.jsxs(Ze,{uid:o,from:"#1a2848",to:"#2a0d58",children:[s.jsx("path",{d:"M4 32h34l-17-16Z",fill:"#c4922a"}),s.jsx("rect",{x:"8",y:"32",width:"26",height:"22",fill:"#ffe7b8"}),s.jsx("rect",{x:"12",y:"38",width:"5",height:"16",fill:"#fff6e8"}),s.jsx("rect",{x:"25",y:"38",width:"5",height:"16",fill:"#fff6e8"}),s.jsx("path",{d:"M17 20v-6M21 20v-8M25 20v-6",stroke:"#ffcc33",strokeWidth:"2"}),s.jsx("rect",{x:"44",y:"22",width:"10",height:"32",fill:"#d8c4a0"}),s.jsx("rect",{x:"41",y:"18",width:"16",height:"5",fill:"#c4922a"}),s.jsx("path",{d:"M49 8 53 16h-8Z",fill:"#ffcc33"}),s.jsx("path",{d:"M49 8v10",stroke:"#ffcc33",strokeWidth:"2"})]});case"redness":return s.jsxs(Ze,{uid:o,from:"#3a1480",to:"#1a0840",children:[s.jsx("ellipse",{cx:"16",cy:"28",rx:"10",ry:"7",fill:"#fff6e8"}),s.jsx("circle",{cx:"16",cy:"28",r:"4.2",fill:"#ff5a7a"}),s.jsx("circle",{cx:"16",cy:"28",r:"1.8",fill:"#1a0840"}),s.jsx("circle",{cx:"38",cy:"34",r:"16",fill:"#ff5a7a"}),s.jsx("path",{d:"M30 24c4-6 12-6 16 0",fill:"#ff8aa0"})]});case"aboutness":return s.jsxs(Ze,{uid:o,from:"#2a0d58",to:"#3a1480",children:[s.jsx("circle",{cx:"16",cy:"28",r:"10",fill:"#ffe7b8"}),s.jsx("path",{d:"M8 40c0-6 4-10 8-10s8 4 8 10v12H8Z",fill:"#ffe7b8"}),s.jsx("path",{d:"M26 18h14l-4-6 12 8-12 8 4-6H26Z",fill:"#ffcc33"}),s.jsx("rect",{x:"44",y:"28",width:"14",height:"18",rx:"3",fill:"#fff6b8"}),s.jsx("path",{d:"M47 28c4-6 10-4 11 2",stroke:"#7dffb0",strokeWidth:"2",fill:"none"})]});case"mindgap":return s.jsxs(Ze,{uid:o,from:"#1a0840",to:"#3a1480",children:[s.jsx("circle",{cx:"16",cy:"32",r:"12",fill:"#c86bff"}),s.jsx("circle",{cx:"16",cy:"32",r:"5",fill:"#fff6e8"}),s.jsx("circle",{cx:"12",cy:"24",r:"4",fill:"#9a4de0"}),s.jsx("circle",{cx:"22",cy:"38",r:"4",fill:"#9a4de0"}),s.jsx("path",{d:"M30 32h6",stroke:"#fff6e8",strokeWidth:"3",strokeLinecap:"round",strokeDasharray:"2 3"}),s.jsx("circle",{cx:"50",cy:"22",r:"8",fill:"#ffe7b8"}),s.jsx("path",{d:"M42 32c0-6 4-10 8-10s8 4 8 10v16H42Z",fill:"#ffe7b8"}),s.jsx("path",{d:"M46 20c2 2 6 2 8 0",stroke:"#8a5a22",strokeWidth:"1.8",fill:"none"})]});case"truenorth":return s.jsxs(Ze,{uid:o,from:"#1a0840",to:"#2a0d58",children:[s.jsx("circle",{cx:"32",cy:"36",r:"18",fill:"#fff6e8",stroke:"#ffcc33",strokeWidth:"3"}),s.jsx("path",{d:"M32 22l6 14-6-3-6 3Z",fill:"#b01c40"}),s.jsx("path",{d:"M32 50l6-14-6 3-6-3Z",fill:"#2a0d58"}),s.jsx("path",{d:"M32 8v8",stroke:"#ffcc33",strokeWidth:"3",strokeLinecap:"round"}),s.jsx("text",{x:"32",y:"12",textAnchor:"middle",fontSize:"9",fontWeight:"700",fill:"#ffcc33",children:"N"})]});case"crowd":return s.jsxs(Ze,{uid:o,from:"#3a1480",to:"#1a0840",children:[s.jsx(xn,{x:12,y:42,fill:"#ffcc33",scale:.72}),s.jsx(xn,{x:24,y:36,fill:"#fff6b8",scale:.8}),s.jsx(xn,{x:36,y:34,fill:"#c86bff",scale:.86}),s.jsx(xn,{x:48,y:38,fill:"#7dffb0",scale:.76}),s.jsx(xn,{x:18,y:50,fill:"#ff9f1a",scale:.64}),s.jsx(xn,{x:42,y:50,fill:"#ffe08a",scale:.64})]});case"cells":return s.jsxs(Ze,{uid:o,from:"#12382a",to:"#1a0840",children:[s.jsx("circle",{cx:"22",cy:"32",r:"14",fill:"#7dffb0",stroke:"#148a48",strokeWidth:"2.4"}),s.jsx("circle",{cx:"44",cy:"32",r:"14",fill:"#3dcc7a",stroke:"#0e6a38",strokeWidth:"2.4"}),s.jsx("circle",{cx:"22",cy:"32",r:"5",fill:"#fff6b8"}),s.jsx("circle",{cx:"44",cy:"32",r:"5",fill:"#fff6b8"}),s.jsx("path",{d:"M32 24v16",stroke:"#fff6e8",strokeWidth:"2",strokeDasharray:"2 2"})]});case"band":return s.jsxs(Ze,{uid:o,from:"#14062e",to:"#2a0d58",children:[s.jsx("circle",{cx:"32",cy:"32",r:"22",fill:"none",stroke:"#ffcc33",strokeWidth:"6"}),s.jsx("circle",{cx:"32",cy:"32",r:"9",fill:"#3dcc7a",stroke:"#fff6e8",strokeWidth:"2"}),s.jsx("circle",{cx:"52",cy:"14",r:"5",fill:"#ff9f1a"})]});case"pasture":return s.jsxs(Ze,{uid:o,from:"#12382a",to:"#1a0840",children:[s.jsx("path",{d:"M0 40c12-12 20-8 32-8s20-6 32 8v24H0Z",fill:"#3dcc7a"}),s.jsx("circle",{cx:"22",cy:"36",r:"7",fill:"#fff6e8"}),s.jsx("circle",{cx:"40",cy:"38",r:"6",fill:"#ffe7b8"}),s.jsx("rect",{x:"20",y:"41",width:"4",height:"7",fill:"#8a5a22"}),s.jsx("rect",{x:"38",y:"42",width:"4",height:"7",fill:"#8a5a22"})]});case"first":return s.jsxs(Ze,{uid:o,from:"#3a1480",to:"#1a0840",children:[s.jsx(xn,{x:24,y:36,fill:"#fff6b8"}),s.jsx(xn,{x:46,y:42,fill:"#c86bff",scale:.7}),s.jsx("circle",{cx:"14",cy:"14",r:"10",fill:"#ffcc33"}),s.jsx("text",{x:"14",y:"18",textAnchor:"middle",fontSize:"12",fontWeight:"800",fill:"#2a0d58",children:"1"})]});case"twelve":return s.jsx(Ze,{uid:o,from:"#2a0d58",to:"#1a0840",children:Array.from({length:12},(r,c)=>{const d=c/12*Math.PI*2-Math.PI/2;return s.jsx("circle",{cx:32+Math.cos(d)*18,cy:32+Math.sin(d)*18,r:"4.2",fill:c===0?"#fff6b8":"#ffcc33"},c)})});case"welcome":return s.jsxs(Ze,{uid:o,from:"#3a1480",to:"#1a0840",children:[s.jsx("path",{d:"M16 56V22c0-6 7-12 16-12s16 6 16 12v34",fill:"#ffcc33"}),s.jsx("path",{d:"M22 56V24c0-5 4-9 10-9s10 4 10 9v32",fill:"#fff6b8"}),s.jsx(xn,{x:32,y:44,fill:"#c86bff",scale:.7})]});case"mindsky":return s.jsxs(Ze,{uid:o,from:"#14062e",to:"#2a0d58",children:[s.jsx("circle",{cx:"32",cy:"44",r:"12",fill:"#ffe7b8"}),s.jsx("path",{d:"M20 54c0-8 6-12 12-12s12 4 12 12",fill:"#ffe7b8"}),s.jsx("circle",{cx:"16",cy:"14",r:"2.2",fill:"#ffcc33"}),s.jsx("circle",{cx:"32",cy:"10",r:"3",fill:"#fff6b8"}),s.jsx("circle",{cx:"50",cy:"16",r:"2.4",fill:"#c86bff"}),s.jsx("path",{d:"M26 34l6-12",stroke:"#ffcc33",strokeWidth:"2.2",strokeLinecap:"round"})]});case"lamp":return s.jsxs(Ze,{uid:o,from:"#3a1480",to:"#1a0840",children:[s.jsx("path",{d:"M20 30c0-10 6-16 12-16s12 6 12 16c6 2 8 8 8 12H12c0-4 2-10 8-12Z",fill:"#ffcc33"}),s.jsx("rect",{x:"27",y:"42",width:"10",height:"12",rx:"2",fill:"#c4922a"}),s.jsx("circle",{cx:"32",cy:"26",r:"5",fill:"#fff6b8"})]});case"seed":return s.jsxs(Ze,{uid:o,from:"#12382a",to:"#1a0840",children:[s.jsx("path",{d:"M32 8c14 12 16 26 0 44C16 34 18 20 32 8Z",fill:"#3dcc7a"}),s.jsx("path",{d:"M32 18c6 8 6 16 0 26",stroke:"#fff6b8",strokeWidth:"3",fill:"none"}),s.jsx("path",{d:"M0 52h64v12H0Z",fill:"#8a5a22"})]});case"heart":return s.jsxs(Ze,{uid:o,from:"#4a1a88",to:"#1a0840",children:[s.jsx("path",{d:"M32 54 10 32c-7-7-2-18 9-18 6 0 9 4 13 8 4-4 7-8 13-8 11 0 16 11 9 18Z",fill:"#ff5a7a"}),s.jsx("circle",{cx:"22",cy:"24",r:"3.4",fill:"#fff6e8",opacity:".85"})]});case"star":return s.jsx(Ze,{uid:o,from:"#14062e",to:"#2a0d58",children:s.jsx("path",{d:"M32 6 39 24h20l-16 12 6 18-17-12-17 12 6-18L5 24h20Z",fill:"#ffcc33"})});case"cup":return s.jsxs(Ze,{uid:o,from:"#3a1480",to:"#1a0840",children:[s.jsx("path",{d:"M16 14h32c3 12 3 22-6 28H22c-9-6-9-16-6-28Z",fill:"#ffcc33"}),s.jsx("path",{d:"M27 42h10v10H27Z",fill:"#c4922a"}),s.jsx("path",{d:"M22 54h20",stroke:"#ffe08a",strokeWidth:"3.4",strokeLinecap:"round"}),s.jsx("path",{d:"M40 12c5-5 12-2 12 5",fill:"none",stroke:"#7dffb0",strokeWidth:"2.6"})]});case"tree":return s.jsxs(Ze,{uid:o,from:"#12382a",to:"#1a0840",children:[s.jsx("circle",{cx:"32",cy:"24",r:"18",fill:"#3dcc7a"}),s.jsx("circle",{cx:"18",cy:"30",r:"11",fill:"#34c46a"}),s.jsx("circle",{cx:"46",cy:"30",r:"11",fill:"#7dffb0"}),s.jsx("rect",{x:"28",y:"36",width:"8",height:"20",rx:"2",fill:"#8a5a22"})]});case"door":return s.jsxs(Ze,{uid:o,from:"#3a1480",to:"#1a0840",children:[s.jsx("path",{d:"M14 58V20c0-7 7-14 18-14s18 7 18 14v38Z",fill:"#ffe7b8"}),s.jsx("path",{d:"M20 58V22c0-5 5-10 12-10s12 5 12 10v36Z",fill:"#ffcc33"}),s.jsx("circle",{cx:"40",cy:"38",r:"2.6",fill:"#8a5a22"})]});case"coin":return s.jsxs(Ze,{uid:o,from:"#3a1480",to:"#1a0840",children:[s.jsx("circle",{cx:"32",cy:"32",r:"20",fill:"#ffcc33",stroke:"#fff8dc",strokeWidth:"3"}),s.jsx("circle",{cx:"32",cy:"32",r:"13",fill:"none",stroke:"#c4922a",strokeWidth:"2.4"}),s.jsx("path",{d:"M32 20v24M25 26h14M25 38h14",stroke:"#8a5a22",strokeWidth:"2.4",strokeLinecap:"round"})]});case"mercy-road":return s.jsx("img",{className:"match-scene is-tile",src:Nw["ph-road"],alt:"",draggable:!1})}}function xn({x:a,y:o,fill:r,scale:c=1}){return s.jsxs("g",{transform:`translate(${a} ${o}) scale(${c})`,children:[s.jsx("circle",{cx:"0",cy:"-12",r:"7",fill:r}),s.jsx("path",{d:"M-9 0c0-6 4-9 9-9s9 3 9 9v16H-9Z",fill:r})]})}function md({x:a,y:o}){return s.jsxs("g",{transform:`translate(${a} ${o})`,children:[s.jsx("rect",{width:"16",height:"12",rx:"3",fill:"#fff6e8"}),s.jsx("path",{d:"M5 14 4 12h4Z",fill:"#fff6e8"}),s.jsx("path",{d:"M4 6h8",stroke:"#148a48",strokeWidth:"2",strokeLinecap:"round"})]})}function Ze({uid:a,from:o,to:r,children:c}){return s.jsxs("svg",{className:"match-scene",viewBox:"0 0 64 64","aria-hidden":!0,children:[s.jsx("defs",{children:s.jsxs("linearGradient",{id:`${a}-bg`,x1:"12",y1:"6",x2:"54",y2:"58",children:[s.jsx("stop",{offset:"0%",stopColor:o}),s.jsx("stop",{offset:"100%",stopColor:r})]})}),s.jsx("rect",{width:"64",height:"64",fill:`url(#${a}-bg)`}),c]})}function O0(a){return a.scene??a.gem}function hg(a,o,r){const c=a.filter(u=>u!==o&&!r.includes(u)),d=c.length>0?c:a.filter(u=>u!==o);return Zt(d)[0]??a.find(u=>u!==o)??o}function q0({challenge:a,onMiss:o,onSolved:r,onPeek:c}){const{progress:d}=Ge(),u=ye(d)||a.id.startsWith("ob-"),g=a.pairs,y=H.useMemo(()=>Zt(a.pairs.map(S=>({id:S.id,text:S.right}))),[a.pairs]),[p,w]=H.useState([]),[T,b]=H.useState(null),[x,N]=H.useState(null),[z,I]=H.useState("idle"),[$,X]=H.useState(!1),[te,se]=H.useState(0),[oe,re]=H.useState(!1),B=ye(d),F=g.find(S=>!p.includes(S.id))?.id,[ne,Q]=H.useState(()=>F?hg(g.map(S=>S.id),F,[]):"");H.useEffect(()=>{!u||!F||(Q(S=>S&&S!==F&&!p.includes(S)?S:hg(g.map(_=>_.id),F,p)),b({side:"left",id:F}))},[u,F,p,g]);function ge(){N(null),X(!1),I("idle"),u&&F&&b({side:"left",id:F})}function C(S,_){if(z==="ok"||($||p.includes(_))&&!u||p.includes(_)&&!(S==="right"&&T?.side==="left"))return;if(!T||T.side===S){b(R=>R?.side===S&&R.id===_?null:{side:S,id:_}),I("idle");return}if(T.id===_){const R=[...p,_];w(R),b(null),N(_),window.setTimeout(()=>N(null),380),R.length===a.pairs.length&&(I("ok"),B?re(!0):r());return}N(T.id),I("wrong"),X(!0),se(R=>R+1),o();const ae=T;window.setTimeout(()=>{N(null),X(!1),I("idle"),b(u&&F?{side:"left",id:F}:ae)},880)}const O=S=>O0(S),E=u?g.filter(S=>S.id===F):g,Z=u?y.filter(S=>S.id===F||S.id===ne):y,L=g.find(S=>S.id===(T?.id??F)),v=T?.side==="left"?L?.right:L?.left;return s.jsxs("div",{className:`play is-match ${u?"is-deal":""} ${$?"is-shake":""} ${z==="ok"?"is-win":""}`,style:{"--match-rows":u?2:g.length},children:[s.jsx(ws,{play:z==="ok",stamp:B?ee.matchWin:"Locked!"}),s.jsx($o,{challenge:a}),s.jsx(Fo,{text:a.context,id:a.id,onPeek:c}),s.jsx("p",{className:"sort-how",children:B?ee.matchHow:s.jsxs(s.Fragment,{children:[s.jsx("strong",{children:"Tap a picture"}),", then the claim that belongs",u?" · two choices":""]})}),z==="wrong"||te>0?s.jsx("p",{className:"match-toast",role:"status",children:B?s.jsx("strong",{children:wd(v??"this card")}):s.jsxs(s.Fragment,{children:[s.jsx("strong",{children:z==="wrong"?te>=2?"One more look.":"Those don’t snap.":"Try the other claim."})," ",te>=2?a.teachOnWrong:"Pick a new pair."]})}):null,te>0&&z!=="ok"?s.jsx("button",{type:"button",className:"btn tiny match-recover",onClick:ge,children:"Try again"}):null,s.jsxs("div",{className:"match-grid",children:[s.jsxs("div",{className:"match-col is-pictures",children:[s.jsx("p",{className:"match-col-label",children:"Picture"}),E.map((S,_)=>{const ae=O(S);return s.jsx("button",{type:"button",className:`match-card is-picture ${ae?"is-gem":""} ${T?.side==="left"&&T.id===S.id?"is-selected":""} ${p.includes(S.id)?"is-locked":""} ${x===S.id&&!p.includes(S.id)?"is-flash":""} ${T&&T.side==="right"&&!p.includes(S.id)?"awaiting":""}`,style:z==="ok"?gi(_,"keep"):void 0,"aria-label":S.left,onClick:R=>{R.stopPropagation(),C("left",S.id)},children:ae?s.jsxs(s.Fragment,{children:[s.jsx(R0,{scene:ae}),s.jsx("span",{className:"match-caption",children:S.left})]}):S.left},S.id)})]}),s.jsxs("div",{className:"match-col is-claims",children:[s.jsx("p",{className:"match-col-label",children:B?"Main idea":"Claim"}),Z.map((S,_)=>s.jsx("button",{type:"button",className:`match-card right ${T?.side==="right"&&T.id===S.id?"is-selected":""} ${p.includes(S.id)?"is-locked":""} ${x===S.id?"is-flash":""} ${T&&T.side==="left"&&!p.includes(S.id)?"awaiting":""}`,style:z==="ok"?gi(_,"discard"):void 0,onClick:ae=>{ae.stopPropagation(),C("right",S.id)},children:S.text},S.id))]})]}),s.jsx("p",{className:"match-score",children:B?`${a.pairs.length-p.length} left · ${p.length} / ${a.pairs.length} kept`:`${a.pairs.length-p.length} left · ${p.length} / ${a.pairs.length} snapped`}),B&&oe?s.jsx("div",{className:"cta-dock",children:s.jsx("button",{type:"button",className:"btn gold xl snap-bins",onClick:r,children:ee.holdNext})}):null]})}const Ew=""+new URL("ability-logic-B_fRFn20.png",import.meta.url).href,D0=""+new URL("ability-love-CUD-1UOk.png",import.meta.url).href,Lw=""+new URL("ability-reason-B20YjMye.png",import.meta.url).href,Hw=""+new URL("ability-science-B5UG-eZO.png",import.meta.url).href,P0="data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2064%2064'%20role='img'%20aria-hidden='true'%3e%3crect%20width='64'%20height='64'%20rx='14'%20fill='%232a0d58'/%3e%3cdefs%3e%3clinearGradient%20id='c'%20x1='12'%20y1='8'%20x2='52'%20y2='56'%3e%3cstop%20offset='0%25'%20stop-color='%23fff8dc'/%3e%3cstop%20offset='40%25'%20stop-color='%23ffcc33'/%3e%3cstop%20offset='100%25'%20stop-color='%23e09412'/%3e%3c/linearGradient%3e%3c/defs%3e%3cpath%20d='M32%206%2054%2032%2032%2058%2010%2032Z'%20fill='url(%23c)'%20stroke='%23ffe08a'%20stroke-width='2.4'%20stroke-linejoin='round'/%3e%3ccircle%20cx='32'%20cy='32'%20r='11'%20fill='%23fff6b8'%20stroke='%23c4922a'%20stroke-width='2'/%3e%3cpath%20d='M32%2024v16M27%2028h10M27%2036h10'%20stroke='%23c4922a'%20stroke-width='2'%20stroke-linecap='round'/%3e%3ccircle%20cx='20'%20cy='16'%20r='3'%20fill='%23fff'%20opacity='.75'/%3e%3c/svg%3e",G0="data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2064%2064'%20role='img'%20aria-hidden='true'%3e%3crect%20width='64'%20height='64'%20rx='14'%20fill='%232a0d58'/%3e%3cdefs%3e%3clinearGradient%20id='d'%20x1='12'%20y1='8'%20x2='52'%20y2='56'%3e%3cstop%20offset='0%25'%20stop-color='%23ffe8c4'/%3e%3cstop%20offset='50%25'%20stop-color='%23c4922a'/%3e%3cstop%20offset='100%25'%20stop-color='%238a6a22'/%3e%3c/linearGradient%3e%3c/defs%3e%3cpath%20d='M32%206%2054%2032%2032%2058%2010%2032Z'%20fill='url(%23d)'%20stroke='%23ffcc33'%20stroke-width='2.4'%20stroke-linejoin='round'/%3e%3cpath%20d='M24%2024c0-5%203.6-8%208-8s8%203%208%208v16H24V24Z'%20fill='%23fff6e8'/%3e%3ccircle%20cx='38'%20cy='34'%20r='1.6'%20fill='%23ff9f1a'/%3e%3ccircle%20cx='20'%20cy='16'%20r='3'%20fill='%23fff'%20opacity='.7'/%3e%3c/svg%3e",z0=""+new URL("heart-DC4tSsc2.png",import.meta.url).href,J0=""+new URL("seed-CGO5Ceib.png",import.meta.url).href,_0="data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2064%2064'%20role='img'%20aria-hidden='true'%3e%3crect%20width='64'%20height='64'%20rx='14'%20fill='%232a0d58'/%3e%3cdefs%3e%3clinearGradient%20id='t'%20x1='12'%20y1='8'%20x2='52'%20y2='56'%3e%3cstop%20offset='0%25'%20stop-color='%23e0ffe8'/%3e%3cstop%20offset='45%25'%20stop-color='%233dcc7a'/%3e%3cstop%20offset='100%25'%20stop-color='%230e6a38'/%3e%3c/linearGradient%3e%3c/defs%3e%3cpath%20d='M32%206%2054%2032%2032%2058%2010%2032Z'%20fill='url(%23t)'%20stroke='%23ffcc33'%20stroke-width='2.4'%20stroke-linejoin='round'/%3e%3cpath%20d='M32%2018%2040%2030h-5l7%2010H22l7-10h-5Z'%20fill='%23fff6e8'%20opacity='.95'/%3e%3crect%20x='30'%20y='40'%20width='4'%20height='8'%20rx='1'%20fill='%238a5a22'/%3e%3ccircle%20cx='22'%20cy='18'%20r='3'%20fill='%23fff'%20opacity='.7'/%3e%3c/svg%3e",U0={lamp:Hw,seed:J0,heart:z0,star:Ew,cup:Lw,tree:_0,door:G0,coin:P0},B0={love:D0,logic:Ew,reason:Lw,science:Hw};function qt({gem:a,size:o="md"}){return s.jsx("img",{className:`gem gem-art gem-${a} gem-${o}`,src:U0[a],alt:"",draggable:!1,"aria-hidden":!0})}function pi({ability:a,size:o="sm"}){const r=B0[a];return r?s.jsx("img",{className:`gem gem-art gem-ability gem-${a} gem-${o}`,src:r,alt:"",draggable:!1,"aria-hidden":!0}):s.jsx(qt,{gem:Ga(a)?.gem??"heart",size:o})}function Ww({tone:a,title:o,body:r,kicker:c,children:d}){return a==="idle"||a==="ok"?null:s.jsxs("div",{className:`result result-${a}`,role:"status",children:[s.jsx("p",{className:"result-kicker",children:c??"Not yet"}),s.jsx("h3",{children:o}),r?s.jsx("p",{children:r}):null,d]})}function Hd(a,o,r){const c=a[o];if(!c)return null;const d=a.filter(u=>u.id!==c.id&&!r.has(u.id));return Zt(d)[0]?.id??null}function dg(a,o,r,c){const d=a[o];return c&&d&&c!==d.id&&!r.has(c)?c:Hd(a,o,r)}function F0({challenge:a,onMiss:o,onSolved:r,onPeek:c}){const{progress:d}=Ge(),u=ye(d),g=H.useMemo(()=>Zt(a.items),[a.items]),y=u||a.items.length>=4,[p,w]=H.useState(g),[T,b]=H.useState(g),[x,N]=H.useState(()=>a.items.map(()=>null)),[z,I]=H.useState(()=>y?Hd(a.items,0,new Set):null),[$,X]=H.useState("idle"),[te,se]=H.useState(!1),[oe,re]=H.useState(0),[B,F]=H.useState("");function ne(L){return p.find(v=>v.id===L)}function Q(L=x){return new Set(L.filter(v=>v!==null).map(v=>v.id))}function ge(){const L=Zt(a.items);w(L),b(L),N(a.items.map(()=>null)),I(y?Hd(a.items,0,new Set):null)}function C(L){if($==="ok"||te)return;const v=ne(L);if(!v)return;const S=x.findIndex(M=>M===null);if(S<0)return;const _=a.items[S];if(!_)return;if(v.id!==_.id){const M=oe+1;X("wrong"),se(!0),re(M),F(S<=0?u?"The first stone is already off. The main idea starts somewhere else.":"The first stone is already off. The claim starts somewhere else.":`The first ${S} sat right. The chain broke at step ${S+1} — try that stone again.`),o(),window.setTimeout(()=>{se(!1),M>=2&&ge(),X("idle")},880);return}const ae=T.map(M=>M?.id===L?null:M),R=x.map((M,G)=>G===S?v:M);b(ae),N(R);const k=R.findIndex(M=>M===null);I(y&&k>=0?dg(a.items,k,Q(R),z):null),X("idle"),R.every(Boolean)&&(X("ok"),r())}function O(L){if($==="ok"||te)return;const v=ne(L);if(!v)return;const S=p.findIndex(R=>R.id===L),_=x.map(R=>R?.id===L?null:R);N(_),b(R=>{if(R.some(M=>M?.id===L))return R;const k=[...R];return S>=0&&(k[S]=v),k});const ae=_.findIndex(R=>R===null);I(y&&ae>=0?dg(a.items,ae,Q(_),z):null),X("idle")}const E=x.findIndex(L=>L===null),Z=new Set(y?[a.items[E]?.id,z].filter(L=>!!L):p.map(L=>L.id));return s.jsxs("div",{className:`play is-sequence ${y?"is-deal":""} ${te?"is-shake":""} ${$==="ok"?"is-win":""}`,children:[s.jsx(ws,{play:$==="ok"}),s.jsx($o,{challenge:a}),s.jsx(Fo,{text:a.context,id:a.id,onPeek:c}),s.jsxs("p",{className:"sort-how is-order-how",children:[a.items.map((L,v)=>s.jsx("span",{className:`order-step ${v===E?"is-now":""} ${x[v]?"is-done":""}`,children:v===E?v+1:""},L.id)),"tap the next stone"]}),s.jsx("div",{className:"bank is-order",children:p.map((L,v)=>{const S=T[v]?.id===L.id,_=x.findIndex(R=>R?.id===L.id),ae=y&&S&&!Z.has(L.id);return y&&!S||ae?null:s.jsx("div",{className:`sort-tile sort-seat ${S?"is-live":"is-gone"} ${ae?"is-facedown":""} ${_>=0?"was-placed":""}`,children:ae?s.jsx("span",{className:"stone-back","aria-hidden":!0}):s.jsxs("button",{type:"button",className:"chip",tabIndex:0,"aria-label":S?L.text:`Return ${L.text} to its seat`,onClick:()=>S?C(L.id):O(L.id),children:[L.gem?s.jsx(qt,{gem:L.gem,size:"sm"}):null,L.text]})},L.id)})}),y?null:s.jsx("ol",{className:"chain",children:a.items.map((L,v)=>{const S=x[v],_=v===E&&$!=="ok";return s.jsxs("li",{className:`sort-seat ${S?"filled":"empty"} ${_?"awaiting":""}`,children:[s.jsx("span",{className:"chain-index",children:v+1}),S?s.jsxs("button",{type:"button",className:"chip in-chain",style:$==="ok"?gi(v,"mid"):void 0,onClick:()=>O(S.id),children:[S.gem?s.jsx(qt,{gem:S.gem,size:"sm"}):null,S.text]}):s.jsx("span",{className:"placeholder","aria-hidden":!0,children:_?"↓":""})]},L.id)})}),s.jsx(Ww,{tone:$==="idle"?"idle":$==="ok"?"ok":"teach",kicker:$==="ok"?"Well reasoned":oe>=2?"One more look":"The chain bounced",title:$==="ok"?"The path locks in.":oe>=2?"Not that order — tiles bounce back.":B||"Shake and try the chain again.",body:$==="wrong"?oe>=2?ye(d)?"Tap the stone that comes next.":a.teachOnWrong:"No lecture — just find the stone that jumped the line.":void 0,deeper:a.deeper})]})}function $0({challenge:a,onMiss:o,onSolved:r,onPeek:c}){const{progress:d}=Ge(),u=ye(d),g=H.useMemo(()=>Zt(a.tiles),[a.tiles]),y=g,[p,w]=H.useState(g),[T,b]=H.useState([]),[x,N]=H.useState([]),[z,I]=H.useState(null),[$,X]=H.useState("idle"),[te,se]=H.useState(!1),[oe,re]=H.useState(0);function B(v=p){return v.filter(S=>S!==null)}function F(v=p,S=T,_=x){return[...B(v),...S,..._]}function ne(v,S=p,_=T,ae=x){return F(S,_,ae).find(R=>R.id===v)}function Q(v,S){if($==="ok")return;const _=ne(v);if(!_)return;if(_.bin!==S){X("wrong"),se(!0),re(M=>M+1),I(null),o(),window.setTimeout(()=>{se(!1),X("idle")},880);return}const ae=p.map(M=>M?.id===v?null:M),R=T.filter(M=>M.id!==v),k=x.filter(M=>M.id!==v);S==="keep"?R.push(_):k.push(_),w(ae),b(R),N(k),I(null),X("idle")}function ge(v){z&&Q(z,v)}function C(v){if($==="ok"||te)return;const S=ne(v);if(!S)return;const _=y.findIndex(ae=>ae.id===v);b(ae=>ae.filter(R=>R.id!==v)),N(ae=>ae.filter(R=>R.id!==v)),w(ae=>{if(ae.some(k=>k?.id===v))return ae;const R=[...ae];return _>=0&&(R[_]=S),R}),X("idle")}function O(v=T,S=x){if(v.every(ae=>ae.bin==="keep")&&S.every(ae=>ae.bin==="discard")&&v.length+S.length===a.tiles.length&&v.length===a.tiles.filter(ae=>ae.bin==="keep").length){X("ok"),r();return}X("wrong"),se(!0),re(ae=>ae+1),o(),window.setTimeout(()=>{se(!1),X("idle")},880)}const E=z?ne(z):void 0,Z=$!=="ok"&&B().length===0,L=B()[0];return s.jsxs("div",{className:`play ${u?"is-easy-sort":""} ${te?"is-shake":""} ${$==="ok"?"is-win":""} ${Z?"is-ready":""}`,children:[s.jsx(ws,{play:$==="ok"}),s.jsx($o,{challenge:a}),s.jsx(Fo,{text:a.context,id:a.id,onPeek:c}),s.jsx("p",{className:"sort-how",children:u?s.jsxs(s.Fragment,{children:[s.jsx("strong",{children:"Keep"})," this, or ",s.jsx("strong",{children:"Toss"})," it — one line at a time"]}):s.jsxs(s.Fragment,{children:[s.jsx("strong",{children:"Keep"})," belongs · ",s.jsx("strong",{children:"Toss"})," a distractor"]})}),u?L?s.jsxs("div",{className:"sort-one",children:[s.jsxs("p",{className:"sort-one-line",children:[L.gem?s.jsx(qt,{gem:L.gem,size:"sm"}):null,u?En(L.text):L.text]}),s.jsxs("div",{className:"sort-actions",children:[s.jsx("button",{type:"button",className:"btn xl keep",onClick:()=>Q(L.id,"keep"),children:"Keep"}),s.jsx("button",{type:"button",className:"btn xl toss",onClick:()=>Q(L.id,"discard"),children:"Toss"})]})]}):Z?s.jsx("div",{className:"sort-lock",children:s.jsx("button",{type:"button",className:"btn primary xl snap-bins",onClick:()=>O(),children:u?ee.lockIn:ot.lockSort})}):null:s.jsx("div",{className:"bank is-sort",children:y.map((v,S)=>{const _=p[S]?.id===v.id,ae=T.some(R=>R.id===v.id)?"keep":x.some(R=>R.id===v.id)?"toss":null;return s.jsxs("div",{className:`sort-tile sort-seat ${_&&z===v.id?"is-selected":""} ${_?"":"is-gone"} ${ae==="keep"?"was-keep":""} ${ae==="toss"?"was-toss":""}`,style:{gridColumn:S%2+1,gridRow:Math.floor(S/2)+1},children:[s.jsxs("button",{type:"button",className:"chip",tabIndex:0,"aria-label":_?u?En(v.text):v.text:`Return ${u?En(v.text):v.text} to its seat`,onClick:()=>{_?I(v.id===z?null:v.id):C(v.id)},children:[v.gem?s.jsx(qt,{gem:v.gem,size:"sm"}):null,u?En(v.text):v.text,ae==="keep"?s.jsx("span",{className:"sort-mark","aria-hidden":!0,children:"✓"}):null,ae==="toss"?s.jsx("span",{className:"sort-mark","aria-hidden":!0,children:"×"}):null]}),s.jsxs("span",{className:"sort-tile-actions",children:[s.jsxs("button",{type:"button",className:"btn tiny keep",tabIndex:_?0:-1,disabled:!_,onClick:R=>{R.stopPropagation(),_&&Q(v.id,"keep")},children:["Keep",s.jsx("span",{className:"sort-mark","aria-hidden":!0,children:"✓"})]}),s.jsxs("button",{type:"button",className:"btn tiny toss",tabIndex:_?0:-1,disabled:!_,onClick:R=>{R.stopPropagation(),_&&Q(v.id,"discard")},children:["Toss",s.jsx("span",{className:"sort-mark","aria-hidden":!0,children:"×"})]})]})]},v.id)})}),u&&T.length===0&&x.length===0?null:s.jsxs("div",{className:`sort-bins ${u?"bins-easy":""} ${Z?"is-ready":""}`,children:[s.jsxs("div",{className:`bin keep ${z?"awaiting":""}`,onClick:()=>ge("keep"),onKeyDown:v=>{(v.key==="Enter"||v.key===" ")&&(v.preventDefault(),ge("keep"))},role:"button",tabIndex:0,children:[s.jsx("span",{className:"bin-head",children:"Keep · belongs"}),s.jsx("span",{className:"bin-body",children:T.length===0?s.jsx("span",{className:"placeholder",children:E?`Keep: ${u?En(E.text):E.text}`:"Belongs here"}):T.map((v,S)=>s.jsxs("button",{type:"button",className:"chip in-bin",style:$==="ok"?gi(S,"keep"):void 0,onClick:_=>{_.stopPropagation(),C(v.id)},children:[v.gem?s.jsx(qt,{gem:v.gem,size:"sm"}):null,u?En(v.text):v.text]},v.id))})]}),s.jsxs("div",{className:`bin toss ${z?"awaiting":""}`,onClick:()=>ge("discard"),onKeyDown:v=>{(v.key==="Enter"||v.key===" ")&&(v.preventDefault(),ge("discard"))},role:"button",tabIndex:0,children:[s.jsx("span",{className:"bin-head toss",children:"Toss · aside"}),s.jsx("span",{className:"bin-body",children:x.length===0?s.jsx("span",{className:"placeholder",children:E?`Toss: ${u?En(E.text):E.text}`:"Set aside"}):x.map((v,S)=>s.jsxs("button",{type:"button",className:"chip in-bin",style:$==="ok"?gi(S,"discard"):void 0,onClick:_=>{_.stopPropagation(),C(v.id)},children:[v.gem?s.jsx(qt,{gem:v.gem,size:"sm"}):null,u?En(v.text):v.text]},v.id))})]})]}),oe>0&&$!=="ok"?s.jsx("button",{type:"button",className:"btn tiny match-recover",onClick:()=>{se(!1),X("idle")},children:"Try again"}):null,!u&&Z?s.jsx("div",{className:"sort-lock",children:s.jsx("button",{type:"button",className:"btn primary xl snap-bins",onClick:()=>O(),children:ot.lockSort})}):null,s.jsx(Ww,{tone:$==="idle"?"idle":$==="ok"?"ok":"teach",kicker:$==="ok"?"Snapped":oe>=2?"One more look":"A line is in the wrong bin",title:$==="ok"?"Keep and toss lock in.":oe>=2?"Those bins still mix.":"Keep vs toss — shake and sort again.",body:$==="wrong"?oe>=2?u?"Keep what belongs with the main idea. Toss the rest.":a.teachOnWrong:"Keep the lines that belong. Toss (set aside) the rest.":void 0,deeper:a.deeper})]})}function hu({challenge:a,onMiss:o,onSolved:r,onPeek:c,onEasyStop:d,streetBeat:u}){const{progress:g}=Ge();return a.kind==="sort"?s.jsx($0,{challenge:a,onMiss:o,onSolved:r,onPeek:c}):a.kind==="sequence"?s.jsx(F0,{challenge:a,onMiss:o,onSolved:r,onPeek:c}):a.kind==="build-argument"?s.jsx(d0,{challenge:a,onMiss:o,onSolved:r,onPeek:c}):a.kind==="link"?ye(g)?s.jsx(E0,{lineId:Jg(g),onMiss:o,onEasyStop:d}):s.jsx(I0,{challenge:a,onMiss:o,onSolved:r,onPeek:c,onEasyStop:d,streetBeat:u}):s.jsx(q0,{challenge:a,onMiss:o,onSolved:r,onPeek:c})}function ue(a){return{label:a,href:`https://www.biblegateway.com/passage/?search=${encodeURIComponent(a)}&version=RSV`,era:"scripture",source:"Holy Scripture · RSV"}}function Fe(a,o,r){return{label:a,href:o,era:"ancient",source:r}}function At(a,o,r){return{label:a,href:o,era:"classic",source:r}}function vi(a,o,r){return{label:a,href:o,era:"modern",source:r}}const oi=[ue("1 Corinthians 15:3–8"),Fe("Ignatius, To the Smyrnaeans 1–3","https://www.newadvent.org/fathers/0109.htm","Ignatius of Antioch · New Advent"),Fe("Justin, First Apology","https://www.newadvent.org/fathers/0126.htm","Justin Martyr · New Advent"),Fe("Justin, Dialogue with Trypho","https://www.newadvent.org/fathers/0128.htm","Justin Martyr · New Advent"),Fe("Irenaeus, Against Heresies III","https://www.newadvent.org/fathers/0103301.htm","Irenaeus of Lyons · New Advent"),vi("Habermas on the early resurrection testimony","https://www.garyhabermas.com/articles/dialog_rexperience/dialog_rexperiences.htm","Gary Habermas · secondary dating aid"),vi("Licona, historicity of the resurrection","https://www.risenjesus.com/","Michael Licona · secondary dating aid")],K0=[ue("Isaiah 52:13–53:12"),ue("Acts 8:32–35"),ue("1 Peter 2:22–25"),Fe("Justin, Dialogue with Trypho","https://www.newadvent.org/fathers/0128.htm","Justin Martyr · New Advent"),Fe("Irenaeus, Against Heresies III","https://www.newadvent.org/fathers/0103301.htm","Irenaeus of Lyons · New Advent"),Fe("Augustine, City of God XVIII.29","https://www.newadvent.org/fathers/120118.htm","Augustine · Isaiah on Christ and the Church")],pd=[ue("Luke 10:25–37"),Fe("Irenaeus on the Samaritan (AH III.17)","https://www.newadvent.org/fathers/0103317.htm","Irenaeus of Lyons · New Advent"),At("Catena Aurea on Luke 10 — Origen, Ambrose, Augustine","https://isidore.co/aquinas/CALuke.htm#10","Aquinas compiling the Fathers · read the 10:36 flip carefully")],Y0=[ue("Psalm 19:1–6"),ue("Romans 1:19–20"),ue("Wisdom 13:1–9"),Fe("Athanasius, Contra Gentes 35–44","https://www.newadvent.org/fathers/2801.htm","Athanasius · Against the Heathen"),Fe("Augustine, Confessions X.6","https://www.newadvent.org/fathers/110110.htm","Augustine · the world as speech"),Fe("John of Damascus, Orthodox Faith I.3","https://www.newadvent.org/fathers/33041.htm","John of Damascus · that there is a God")],ml=[At("Aquinas, Fifth Way — ST I, q.2, a.3","https://www.newadvent.org/summa/1002.htm#article3","Thomas Aquinas · Summa Theologiae"),ue("Psalm 19:1–6"),ue("Romans 1:19–20"),vi("Robin Collins, The Fine-Tuning Design Argument","https://rintintin.colorado.edu/~vancecd/phil201/Collins.pdf","Robin Collins")],ug=[Fe("Aristotle, Physics VIII","http://classics.mit.edu/Aristotle/physics.8.viii.html","Aristotle · change and the first mover"),Fe("Aristotle, Metaphysics XII","http://classics.mit.edu/Aristotle/metaphysics.12.xii.html","Aristotle · thought thinking itself"),At("Aquinas, First Way — ST I, q.2, a.3","https://www.newadvent.org/summa/1002.htm#article3","Thomas Aquinas · Summa Theologiae"),At("Aquinas, Summa Contra Gentiles I","https://isidore.co/aquinas/ContraGentiles1.htm","Thomas Aquinas · SCG I"),vi("Feser, so you think you understand the cosmological argument","https://edwardfeser.blogspot.com/2011/07/so-you-think-you-understand.html","Edward Feser · secondary guide only")],mg=[ue("Genesis 1:1"),Fe("Philoponus against an eternal world","https://archive.org/details/philoponusagains0000phil","John Philoponus · Against Aristotle on the Eternity of the World"),At("al-Ghazālī, The Incoherence of the Philosophers","https://sourcebooks.fordham.edu/source/alghazali.asp","al-Ghazālī · kalām against an eternal cosmos"),vi("Craig’s modern statement of the kalām syllogism","https://www.reasonablefaith.org/writings/popular-writings/existence-nature-of-god/the-kalam-cosmological-argument","William Lane Craig · under Ghazālī and Philoponus")],pg=[ue("Luke 24:1–11"),ue("John 20:1–18"),At("Catena Aurea on Luke 24","https://isidore.co/aquinas/CALuke.htm#24","Aquinas compiling the Fathers")],fg=[{...Fe("Tacitus, Annals 15.44","https://www.perseus.tufts.edu/hopper/text?doc=Perseus%3Atext%3A1999.02.0078%3Abook%3D15%3Achapter%3D44","Tacitus · Christus under Pilate"),journalOnly:!0},{...Fe("Josephus, Antiquities 18.63–64","https://penelope.uchicago.edu/josephus/ant-18.html","Josephus · Testimonium; later Christian touches disputed"),journalOnly:!0}],V0={"wb-creed":oi,"wb-early":oi,"daily-creed":oi,"daily-names":oi,"j-wb-1":oi,"j-wb-2":oi,"daily-isaiah":K0,"ph-road":pd,"daily-neighbor":pd,"td-watch":pd,"daily-stars":Y0,"ob-tuning":ml,"ob-design":ml,"j-ob-1":ml,"j-ob-2":ml,"fg-mover":ug,"j-fg-1":ug,"fg-kalam":mg,"j-fg-3":mg,"wb-women":[...pg,...fg],"j-wb-4":[...pg,...fg],"wb-method":[ue("Luke 1:1–4"),ue("1 Corinthians 15:3–8"),Fe("Irenaeus, Against Heresies III.1–4","https://www.newadvent.org/fathers/0103301.htm","Irenaeus · apostolic handing-on")],"j-wb-3":[ue("Luke 1:1–4"),ue("1 Corinthians 15:3–8")],"ph-father":[ue("Luke 15:11–32"),At("Catena Aurea on Luke 15","https://isidore.co/aquinas/CALuke.htm#15","Aquinas compiling the Fathers")],"ph-seeds":[ue("Matthew 13:1–23"),ue("Luke 15:1–7"),ue("Matthew 25:14–30")],"ph-debt":[ue("Matthew 18:21–35"),ue("Matthew 6:12–15")],"ob-leibniz":[ue("Genesis 1:1–3"),ue("Exodus 3:14"),At("Aquinas, ST I, q.2, a.3","https://www.newadvent.org/summa/1002.htm#article3","Thomas Aquinas · why anything exists"),Fe("Athanasius, Contra Gentes 2–7","https://www.newadvent.org/fathers/2801.htm","Athanasius · the world is not its own explanation")],"ob-life":[ue("Genesis 1:1–27"),ue("John 1:1–4"),At("Aquinas, ST I, q.2, a.3 — Fifth Way","https://www.newadvent.org/summa/1002.htm#article3","Thomas Aquinas · ordered things point to mind")],"j-ob-3":[ue("Genesis 1:1–3"),At("Aquinas, ST I, q.2, a.3","https://www.newadvent.org/summa/1002.htm#article3","Thomas Aquinas")],"j-ob-4":[ue("Genesis 1:1–27"),ue("John 1:1–4")],"fg-contingent":[At("Aquinas, Third Way — ST I, q.2, a.3","https://www.newadvent.org/summa/1002.htm#article3","Thomas Aquinas · necessary being"),Fe("Aristotle, Metaphysics XII","http://classics.mit.edu/Aristotle/metaphysics.12.xii.html","Aristotle")],"j-fg-2":[At("Aquinas, Third Way — ST I, q.2, a.3","https://www.newadvent.org/summa/1002.htm#article3","Thomas Aquinas")],"fg-limits":[At("Aquinas, ST I, q.3 — after the Five Ways","https://www.newadvent.org/summa/1003.htm","Thomas Aquinas · attributes take further work"),ue("John 1:1–18")],"j-fg-4":[At("Aquinas, ST I, qq.2–3","https://www.newadvent.org/summa/1002.htm","Thomas Aquinas"),ue("John 1:1–18")],"hl-moral":[ue("Romans 2:14–15"),At("Aquinas, ST I-II, q.91 — kinds of law","https://www.newadvent.org/summa/2091.htm","Thomas Aquinas"),Fe("Augustine, City of God XIX.4–13","https://www.newadvent.org/fathers/120119.htm","Augustine · peace and the good")],"j-hl-1":[ue("Romans 2:14–15"),At("Aquinas, ST I-II, q.91","https://www.newadvent.org/summa/2091.htm","Thomas Aquinas")],"hl-mind":[ue("John 1:1–4"),Fe("Augustine, De Trinitate X","https://www.newadvent.org/fathers/130110.htm","Augustine · the mind knowing itself"),Fe("Aristotle, De Anima","http://classics.mit.edu/Aristotle/soul.html","Aristotle · soul as act")],"j-hl-2":[ue("John 1:1–4"),Fe("Augustine, De Trinitate X","https://www.newadvent.org/fathers/130110.htm","Augustine")],"hl-meaning":[ue("Ecclesiastes 12:13"),ue("Ecclesiastes 2:24–25"),Fe("Boethius, Consolation of Philosophy","https://www.ccel.org/ccel/boethius/consolation.html","Boethius"),Fe("Augustine, Confessions I.1","https://www.newadvent.org/fathers/110101.htm","Augustine · restless until it rests in you")],"j-hl-3":[ue("Ecclesiastes 12:13"),Fe("Augustine, Confessions I.1","https://www.newadvent.org/fathers/110101.htm","Augustine")],"hl-beauty":[ue("Psalm 19:1–4"),Fe("Augustine, Confessions X.6","https://www.newadvent.org/fathers/110110.htm","Augustine · late have I loved you"),At("Aquinas, ST I, q.5, a.4 — the good and the beautiful","https://www.newadvent.org/summa/1005.htm#article4","Thomas Aquinas")],"j-hl-4":[ue("Psalm 19:1–4"),Fe("Augustine, Confessions X.6","https://www.newadvent.org/fathers/110110.htm","Augustine")],"daily-lantern":[ue("Matthew 5:14–16")],"daily-gems":[ue("Matthew 5:14–16"),ue("Mark 4:1–9"),ue("Matthew 26:28"),ue("Luke 22:20")],"daily-seed":[ue("Mark 4:1–9")],"daily-life":[ue("Acts 17:24–25"),ue("Genesis 1:1–27"),ue("Wisdom 13:1–9")],"daily-scroll":[ue("Isaiah 40:8"),Fe("Augustine, On Christian Doctrine II","https://www.newadvent.org/fathers/12022.htm","Augustine · signs and copies"),vi("Center for the Study of New Testament Manuscripts","https://www.csntm.org/","Dan Wallace · modern copies and dating methods")],"daily-grace":[ue("Ephesians 2:8–9"),Fe("Augustine, On the Spirit and the Letter","https://www.newadvent.org/fathers/1502.htm","Augustine · grace first")],"daily-rest":[ue("Matthew 11:28–30")],"daily-empty":[ue("Luke 24:1–12"),ue("John 20:1–18")],"daily-cosmos":[ue("Psalm 8:3–4"),ue("Genesis 1:1"),At("Aquinas, ST I, q.2, a.3","https://www.newadvent.org/summa/1002.htm#article3","Thomas Aquinas")],"daily-door":[ue("John 10:7–11"),Fe("Augustine, Tractates on John 45–47","https://www.newadvent.org/fathers/1701045.htm","Augustine · the door")],"ln-street":[ue("Luke 10:25–37"),ue("1 Corinthians 15:3–8"),ue("Matthew 5:14–16")],"j-trail-1":[ue("Lamentations 3:22–23")],"j-trail-2":[ue("Lamentations 3:22–23")],"j-trail-3":[ue("Luke 15:20")],"j-trail-5":[ue("Psalm 19:1–4")],"j-trail-7":[ue("Psalm 119:105")],"trail-days-1":[ue("Lamentations 3:22–23")],"trail-days-2":[ue("Lamentations 3:22–23")],"trail-days-3":[ue("Luke 15:20")],"trail-days-5":[ue("Psalm 19:1–4")],"trail-days-7":[ue("Psalm 119:105")]},X0={"j-ph-1":"ph-road","j-ph-2":"ph-father","j-ph-3":"ph-seeds","j-ph-4":"ph-debt"};function Q0(a,o="hold"){const r=X0[a]??a;return(V0[r]??[]).filter(d=>o==="journal"?!0:!d.journalOnly)}function Z0(a){return a==="scripture"?"Scripture":a==="ancient"?"Ancient":a==="classic"?"Classic":"Modern · believing"}function Pn({id:a,surface:o="hold",compact:r=!1,why:c,source:d}){const{progress:u}=Ge(),g=ye(u);if(g)return null;const y=Q0(a,o);if(y.length===0&&!c&&!d)return null;const p=y.length>0?s.jsx("ul",{children:y.map(T=>s.jsxs("li",{children:[s.jsx("a",{href:T.href,target:"_blank",rel:"noopener noreferrer",children:T.label}),s.jsxs("span",{className:"quiet",children:[Z0(T.era)," · ",T.source]})]},T.href))}):null,w=s.jsxs(s.Fragment,{children:[c?s.jsx("p",{className:"stored-reason",children:g?s.jsxs(s.Fragment,{children:[s.jsx("strong",{children:ds.reason.term})," — ",ee.reasonSense,". ",c]}):c}):null,d?s.jsx("p",{className:"quiet",children:g?s.jsxs(s.Fragment,{children:[s.jsx("strong",{children:ds.source.term})," — ",ee.sourceSense,": ",d]}):d}):null,p]});return r?s.jsxs("details",{className:"dig-deeper is-compact",children:[s.jsx("summary",{children:g?"Read more":"Why it stands · Dig deeper"}),w]}):s.jsxs("nav",{className:"dig-deeper","aria-label":"Dig deeper",children:[s.jsx("p",{className:"eyebrow",children:g?"Read more":"Dig deeper"}),w]})}function Do({id:a,teach:o=!1}){const{progress:r}=Ge();if(!ye(r))return null;const c=Il(a);return c?s.jsxs("aside",{className:"plain-talk","aria-label":"In plain words",children:[s.jsx("p",{className:"eyebrow",children:"In plain words"}),s.jsx("p",{className:"plain-gloss",children:hn(a,c.gloss)}),c.word?s.jsxs("p",{className:"plain-word",children:[s.jsx("strong",{children:c.word.term})," — ",Bd(c.word.sense)]}):null,o?s.jsx("p",{className:"teach-reason",children:c.teach}):null]}):null}function Rl({brief:a,keeps:o,kicker:r=ot.tapTakeaway,mode:c="encode",visits:d=0,onHeld:u,onSkip:g}){const{progress:y}=Ge(),p=ye(y),w=c==="encode",T=!w&&d>=1,b=Al(a.id),x=eu(a.id,b),N=Wl(a.id),z=H.useMemo(()=>sT(a,o),[a,o]),I=w&&z.length>1,[$,X]=H.useState(I?null:z[0]??null),te=he=>p?hn(a.id,he):he,se=he=>p?cl(he):he,oe=H.useMemo(()=>{if(w){const Ue=I?z.map(de=>de.claim):[a.claim];return hl(Ue,te,Ue[0]??a.claim)}const he=Zt([...a.claimChoices]),ze=p?Zt([a.claim,he.find(Ue=>Ue!==a.claim)].filter(Ue=>!!Ue)):he;return hl(ze,te,a.claim)},[a.id,a.claim,a.claimChoices,w,I,z,p]),re=H.useMemo(()=>{const he=$?.reason??a.reason;if(w&&!p)return hl([he],se,he);const ze=Zt([...a.reasonChoices]),Ue=p?Zt([he,ze.find(de=>de!==he)].filter(de=>!!de)):w?[he]:ze;return hl(Ue,se,he)},[a.id,a.reason,a.reasonChoices,w,$,p]),[B,F]=H.useState(T?"reason":"claim"),[ne,Q]=H.useState(0),[ge,C]=H.useState(null),[O,E]=H.useState(!1),[Z,L]=H.useState(!1),[v,S]=H.useState(!1),[_,ae]=H.useState(!1),R=$?.claim??a.claim,k=$?.reason??a.reason,M=w||re.length===1||v,G=T&&(_||v||B==="teach"),J=p&&w,ie=!I||!!$,me=B==="teach"?"Read this, then tap Got it.":B==="reason"?M?p?v?T?"That still holds. Tap Done.":"That reason holds. Tap Done.":ee.whyStands:T?"Tap Done when the sharper hold is clear.":"Tap Done when you have the reason.":p?ee.tapWhy:T?"What still makes this stand — not the first teach.":"Tap the reason that holds.":p?ee.rememberSentence:T?"Which sentence was the hold?":r;function ve(he){u({clean:he})}function ce(he,ze,Ue){if(he===ze){if(Ue==="done"){ve(ne===0);return}if(Ue==="lock"){S(!0),C(he);return}F(Ue);return}const de=ne+1;Q(de),C(he),E(!0),window.setTimeout(()=>{E(!1),C(null),de>=2&&F("teach")},320)}function be(he){if(w&&I){const ze=z.find(Ue=>Ue.claim===he);if(ze){X(ze),L(!0),F("reason");return}}if((he===a.claim||w&&!I)&&L(!0),T){if(he===a.claim){L(!0),ae(!0);return}ce(he,a.claim,"done");return}ce(he,a.claim,"reason")}function Se(){ve(!1)}return J?s.jsxs("section",{className:`recall-gate is-encode is-easy-hold ${O?"is-shake":""} ${I?"is-own":""}`,"aria-label":ot.takeaway,children:[s.jsx("p",{className:"eyebrow",children:a.source?a.source:"Hold"}),ie?s.jsxs(s.Fragment,{children:[s.jsx("p",{className:"next-tap",children:v?ee.keepThis:ee.tapWhy}),s.jsx("p",{className:"recall-line rehearse-stem",children:hn(a.id,R)}),v?s.jsxs(s.Fragment,{children:[s.jsx("div",{className:"reason-scroll",children:s.jsx("p",{className:"reason-held",children:cl(k)})}),s.jsx("div",{className:"cta-dock",children:s.jsx("button",{type:"button",className:"btn primary xl recall-done",onClick:()=>ve(!0),children:ee.keepThis})})]}):s.jsx("div",{className:"recall-choices",children:re.map(he=>s.jsx("button",{type:"button",className:`match-card recall-card ${ge===he?"is-flash":""}`,onClick:()=>ce(he,k,"lock"),children:cl(he)},he))})]}):s.jsxs(s.Fragment,{children:[s.jsx("p",{className:"teach-chip",role:"note",children:ee.mainIdeaTeach}),s.jsx("p",{className:"next-tap",children:ee.rememberSentence}),s.jsx("div",{className:"recall-choices",children:oe.map(he=>s.jsx("button",{type:"button",className:`match-card recall-card ${ge===he?"is-flash":""}`,onClick:()=>be(he),children:hn(a.id,he)},he))})]})]}):s.jsxs("section",{className:`recall-gate ${O?"is-shake":""} phase-${B} ${w?"is-encode":"is-review"} ${I?"is-own":""} ${T?"is-deeper":""}`,"aria-label":ot.takeaway,children:[s.jsx("p",{className:"eyebrow",children:a.source?a.source:"Hold"}),s.jsx("p",{className:"next-tap",children:me}),w?s.jsxs("p",{className:"learning-store",children:[x?s.jsx(qt,{gem:x,size:"sm"}):null,s.jsxs("span",{children:["Picture this: ",N]})]}):p?T?s.jsx("p",{className:"quiet",children:"A new angle — not the first read again."}):null:s.jsx("p",{className:"quiet",children:T?"A new angle on a line you already hold — not the first teach again.":"Rebuild the map — claim, then why it stands."}),T||p?null:s.jsx(Do,{id:a.id}),B==="claim"?s.jsxs(s.Fragment,{children:[s.jsx("div",{className:"recall-choices",children:oe.map(he=>s.jsx("button",{type:"button",className:`match-card recall-card ${ge===he?"is-flash":""} ${_&&he===R?"is-locked":""}`,onClick:()=>{_||be(he)},children:p?hn(a.id,he):he},he))}),_?s.jsxs(s.Fragment,{children:[s.jsx("p",{className:"match-toast",role:"status",children:s.jsx("strong",{children:"That still holds."})}),G?s.jsx(Pn,{id:a.id,compact:!0}):null,s.jsx("div",{className:"cta-dock",children:s.jsx("button",{type:"button",className:"btn gold xl recall-done",onClick:()=>ve(ne===0),children:"Done"})})]}):null]}):null,B==="reason"?s.jsxs(s.Fragment,{children:[Z?s.jsxs("p",{className:"match-toast",role:"status",children:[s.jsx("strong",{children:"Held."})," ",p?"That line is yours to keep.":"That claim is yours to keep."]}):null,s.jsx("p",{className:"recall-line rehearse-stem",children:p?hn(a.id,R):R}),p?null:s.jsx("h2",{children:T?"A sharper hold":ot.whyItStands}),v?s.jsx("p",{className:"match-toast",role:"status",children:s.jsx("strong",{children:T?"That still holds.":"That reason holds."})}):null,M?s.jsxs(s.Fragment,{children:[s.jsx("p",{className:"reason-held",children:k}),G?s.jsx(Pn,{id:a.id,compact:!0}):null,s.jsx("div",{className:"cta-dock",children:s.jsx("button",{type:"button",className:"btn gold xl recall-done",onClick:()=>ve(ne===0),children:"Done"})})]}):s.jsx("div",{className:"recall-choices",children:re.map(he=>s.jsx("button",{type:"button",className:`match-card recall-card ${ge===he?"is-flash":""}`,onClick:()=>ce(he,k,T?"claim":"lock"),children:p?cl(he):he},he))})]}):null,B==="teach"?s.jsxs(s.Fragment,{children:[s.jsx("h2",{children:T?"Here’s the sharper line.":"Here’s the line."}),s.jsxs("article",{className:"unlock-card pop-in",children:[s.jsx("p",{className:"recall-line",children:p?hn(a.id,R):R}),s.jsx("p",{children:k}),s.jsx(Do,{id:a.id,teach:!0})]}),s.jsx("button",{type:"button",className:"btn primary xl",onClick:Se,children:"Got it"}),s.jsx(Pn,{id:a.id})]}):null,!w&&g?s.jsxs("div",{className:"recall-skip",children:[s.jsx("button",{type:"button",className:"text-link",onClick:()=>g("later"),children:"Later"}),s.jsx("button",{type:"button",className:"text-link",onClick:()=>g("not-today"),children:"Not today"})]}):null]})}function Iw({learning:a,when:o}){const{progress:r}=Ge(),c=ye(r);return s.jsxs("article",{className:"stored-line is-spoken","aria-label":"Stored learning",children:[s.jsx("p",{className:"eyebrow",children:"Say this out loud"}),a.picture?s.jsx(qt,{gem:a.picture,size:"md"}):null,s.jsx("p",{className:"stored-claim",children:c?hn(a.id,a.claim):a.claim}),c?null:s.jsx(Do,{id:a.id}),c?null:s.jsx(Pn,{id:a.id,compact:!0,why:a.reason,source:a.source}),o?s.jsx("p",{className:"quiet",children:o}):null]})}function Rw({words:a,extra:o}){const r=new Set,c=[];for(const d of a)r.has(d.term)||(r.add(d.term),c.push(d));return o&&!r.has(o.term)&&c.push(o),c.length===0?null:s.jsx("ul",{className:"word-school","aria-label":"Words to know",children:c.map(d=>s.jsxs("li",{children:[s.jsx("strong",{children:d.term})," — ",d.sense]},d.term))})}function e2(a){return a==="sort"?"Unlock the sort":a==="sequence"?"Unlock the order":a==="build-argument"?"Unlock the stones":a==="link"?"Unlock the links":"Unlock the pairs"}function du({brief:a,kind:o,onUnlock:r,unlock:c,beats:d}){const{progress:u}=Ge(),g=ye(u),y=Al(a.id),p=eu(a.id,y),w=Il(a.id),T=ki(a.id),b=za(u,a.id),N=T?.[b]?.learn||(g&&w?w.teach:a.reason),z=c0(a.id,g);if(g){const I=Fd(a.id);return s.jsxs("section",{className:"recall-gate is-encode teach-gate easy-story-card","aria-label":"Short story",children:[s.jsx("p",{className:"eyebrow",children:"Short story"}),p?s.jsx(qt,{gem:p,size:"sm"}):null,s.jsx("p",{className:"teach-reason",children:N}),s.jsx("p",{className:"eyebrow hold-kicker",children:"The main idea you will keep"}),s.jsx("p",{className:"recall-line rehearse-stem",children:hn(a.id,a.claim)}),s.jsxs("div",{className:"easy-who-where","aria-label":`${I.who} · ${I.place}`,children:[s.jsx("p",{className:"easy-who-where-line",children:RT(a.id)}),s.jsxs("div",{className:"easy-who-where-row",children:[s.jsxs("figure",{className:"easy-who-chip",children:[s.jsx(it,{who:I.whoId,size:"sm"}),s.jsx("figcaption",{children:I.who})]}),s.jsx("p",{className:"easy-place-chip",children:I.place})]})]}),s.jsxs("div",{className:"cta-dock easy-story-dock",children:[s.jsx("button",{type:"button",className:"btn gold xl",onClick:r,children:"Continue"}),s.jsx("button",{type:"button",className:"text-link",onClick:r,children:"Skip reading"})]})]})}return s.jsxs("section",{className:"recall-gate is-encode teach-gate","aria-label":"Today’s line",children:[s.jsx("p",{className:"eyebrow",children:"Learn"}),s.jsx("p",{className:"next-tap",children:"Read this, then unlock the play."}),p?s.jsx(qt,{gem:p,size:"sm"}):null,s.jsx("p",{className:"teach-reason",children:N}),s.jsx(Rw,{words:z,extra:w?.word}),s.jsx("p",{className:"quiet",children:ds.claim.teach}),s.jsx("p",{className:"eyebrow hold-kicker",children:"The claim you will hold"}),s.jsx("p",{className:"recall-line rehearse-stem",children:a.claim}),s.jsxs("p",{className:"quiet",children:[ds.source.term," — ",ds.source.sense,": ",a.source,"."]}),s.jsxs("p",{className:"quiet",children:["Pictured as ",Wl(a.id),"."]}),s.jsxs("p",{className:"quiet",children:["Acquire — learn this line so you can hold it. Hold this line to deploy"," ",y?.label??"Love"," on the night road."]}),d&&d.length>0?s.jsx("ol",{className:"teach-beats",children:d.map(I=>s.jsx("li",{children:I.text},I.id))}):null,s.jsx("button",{type:"button",className:"btn primary xl",onClick:r,children:c??e2(o)})]})}function Ol({who:a,line:o,action:r,onGo:c}){const d=en[a];return s.jsxs("div",{className:"town-return is-tight after-win-cta",children:[s.jsxs("button",{type:"button",className:"btn primary xl",onClick:c,children:[s.jsx(it,{who:a,size:"sm"}),r]}),s.jsxs("p",{className:"town-kicker",children:[d.shortName,": ",o]})]})}function t2({areaId:a,challengeId:o,onNavigate:r}){const{completeChallenge:c,recordReview:d,recordTaught:u,markMiss:g,progress:y}=Ge(),p=ye(y),w=Qd(a),T=lx(a,o),b=Et(o),x=Dt(),[N]=H.useState(!!(b&&y.memory[b.id]&&Jo(y.memory[b.id],x))),{juiceDone:z,afterJuice:I}=Ll(),$=H.useRef(!1),[X,te]=H.useState(!1),[se,oe]=H.useState(!1),[re,B]=H.useState(!1),F=!!b&&(ye(y)||a==="observatory"||T?.kind==="sequence"),[ne,Q]=H.useState(()=>!F||N),[ge,C]=H.useState(!1);if(H.useEffect(()=>{!z||(document.querySelector(".app-body")?.scrollTo({top:0,behavior:"smooth"}),$.current)||($.current=!0,c(a,o),!(!b||N)&&d({id:b.id,pillar:a,kind:"encode",today:x,clean:!X&&!se,peeked:se,elaborated:!1}))},[z]),!w||!T)return s.jsx("main",{className:"page",children:s.jsx("p",{children:"That challenge is not on the trail."})});const O=xi(w.id,y.completed),E=w.challenges.findIndex(k=>k.id===T.id),Z=w.challenges.slice(0,E).every(k=>y.completed.includes(k.id));if(!O||!Z)return s.jsxs("main",{className:"page",children:[s.jsx("p",{children:O?ye(y)?"This walk is locked. Finish the walk before it on this street first.":"This walk is still waiting. Finish the earlier challenge on this street first.":Bo(w.id,y.completed,ye(y))}),s.jsxs("button",{type:"button",className:"btn primary",onClick:()=>r({name:"area",areaId:a}),children:["Back to ",w.title]})]});function L(){I(),b||B(!0)}function v(k){B(!0),b&&N&&d({id:b.id,pillar:a,kind:"recall",today:x,clean:k.clean&&!X&&!se,peeked:se,elaborated:!!y.memory[b.id]?.elaborated})}function S(){r({name:"hub"})}const _=z&&(!b||re),ae=z&&!!b&&!re,R=tT(a);return s.jsxs("main",{className:`challenge-page ${z?"is-after":ne?"is-puzzle":"is-teach"} ${ae?"is-rehearse":""} ${ge?"is-arming":""}`,"aria-label":ot.playGoal,children:[s.jsxs("button",{type:"button",className:"text-link",onClick:()=>r({name:"area",areaId:a}),children:["← ",w.title]}),z?s.jsxs("section",{className:"after-win",children:[b&&!re?s.jsx("div",{className:"rehearse-anchor",children:s.jsx(Rl,{brief:b,keeps:T.kind==="sort"?T.tiles.filter(k=>k.bin==="keep"):void 0,mode:N?"review":"encode",kicker:ot.tapTakeaway,onHeld:v})}):null,_&&b?s.jsx(Iw,{learning:hs(y,b.id)??{id:b.id,claim:b.claim,reason:b.reason,source:b.source,anchor:"Juniper’s east porch",acquiredAt:x},when:y.memory[b.id]?_o(y.memory[b.id],x,ye(y)):ye(y)?"Read this again today":"Dust off today"}):null,_?s.jsx(Ol,{who:R.who,line:R.afterWin,action:p?ee.home:"See the town",onGo:S}):null]}):!ne&&b?s.jsx(du,{brief:b,kind:T.kind,beats:T.kind==="sequence"?T.items:(ye(y)||a==="observatory")&&T.kind==="match"?T.pairs.map(k=>({id:k.id,text:k.left})):(ye(y)||a==="observatory")&&T.kind==="build-argument"?T.slots.map(k=>{const M=T.cards.find(G=>G.id===k.correctCardId);return{id:k.id,text:M?.text??k.label}}):(ye(y)||a==="observatory")&&T.kind==="sort"?T.tiles.filter(k=>k.bin==="keep").map(k=>({id:k.id,text:k.text})):void 0,onUnlock:()=>{b&&u(b.id),Q(!0),C(!0),window.setTimeout(()=>C(!1),360)}}):s.jsxs(s.Fragment,{children:[s.jsx("h1",{className:"puzzle-title",children:T.title}),s.jsx(hu,{challenge:T,onMiss:()=>{te(!0),g(T.id)},onPeek:()=>oe(!0),onSolved:L})]})]})}function n2({onNavigate:a}){const{completeDaily:o,recordReview:r,recordTaught:c,progress:d}=Ge(),u=ye(d),y=Dt(new Date),p=d.dailyDates.filter(Z=>Z!==y).length,[w]=H.useState(()=>{const Z=Si(d,y),L=bl(y,p),v=Et(L.challenge.id),S=zo(L.challenge.id);return{already:Z,challenge:L.challenge,brief:v,pillar:S}}),{challenge:T,brief:b,pillar:x}=w,{juiceDone:N,afterJuice:z}=Ll(w.already),I=H.useRef(!1),[$,X]=H.useState(!1),[te,se]=H.useState(!1),[oe,re]=H.useState(()=>!b||!!d.held.includes(b.id)),[B,F]=H.useState(()=>!b),[ne,Q]=H.useState(!1),ge=N&&oe;H.useEffect(()=>{!N||(document.querySelector(".app-body")?.scrollTo({top:0,behavior:"smooth"}),w.already||I.current)||(I.current=!0,o(y),b&&r({id:b.id,pillar:x,kind:"encode",today:y,clean:!$&&!te,peeked:te,elaborated:!1}))},[N]);function C(){z()}function O(Z){re(!0)}const E=N&&!!b&&!oe;return s.jsxs("main",{className:`daily-page ${N?"is-after":B?"is-puzzle":"is-teach"} ${E?"is-rehearse":""} ${ne?"is-arming":""}`,"aria-label":ot.playGoal,children:[s.jsxs("button",{type:"button",className:"text-link",onClick:()=>a({name:"hub"}),children:["← ",u?ee.home:"The town"]}),N?s.jsxs("section",{className:"after-win daily-done",children:[b&&!oe?s.jsx("div",{className:"rehearse-anchor",children:s.jsx(Rl,{brief:b,keeps:T.kind==="sort"?T.tiles.filter(Z=>Z.bin==="keep"):void 0,mode:"encode",kicker:ot.tapTakeaway,onHeld:O})}):null,ge&&b?s.jsx(Iw,{learning:hs(d,b.id)??{id:b.id,claim:b.claim,reason:b.reason,source:b.source,anchor:"Juniper’s east porch",acquiredAt:y},when:d.memory[b.id]?_o(d.memory[b.id],y,u):u?"Read this again today":"Dust off today"}):null,ge?s.jsx(Ol,{who:la("porch").who,line:la("porch").afterWin,action:u?ee.home:"See the town",onGo:()=>a({name:"hub"})}):null]}):!B&&b?s.jsx(du,{brief:b,kind:T.kind,beats:T.kind==="sequence"?T.items:void 0,onUnlock:()=>{c(b.id),F(!0),Q(!0),window.setTimeout(()=>Q(!1),360)}}):s.jsxs(s.Fragment,{children:[s.jsx("h1",{className:"puzzle-title",children:T.title}),s.jsx(hu,{challenge:T,onMiss:()=>X(!0),onPeek:()=>se(!0),onSolved:C})]})]})}const uu={porch:{path:"Arrive",whyEasy:"You start here. Juniper keeps a lamp so today’s line can be seen.",whyHard:"The east porch is the morning door. A lamp belongs on a porch because it is meant to be seen — not hidden in a drawer."},hollow:{path:"Eden stories",whyEasy:"Mercy tells Jesus stories by the creek. Pictures live where water and oaks are.",whyHard:"Story Creek is the garden of the case. Jesus taught in pictures; Mercy keeps the creek so those stories can walk around inside you."},bench:{path:"Names",whyEasy:"Silas copies names at the square. Public names live here, not under the oaks.",whyHard:"Witness Square is the ledger on the square. Died, buried, raised, appeared is a public creed — Silas keeps it where names and dates are copied."},observatory:{path:"Sky",whyEasy:"Nora’s dome looks up. Fine-tuning and the sky’s fit live on the ridge.",whyHard:"Sky Watch sits on the north ridge so you look up. Life’s dials and “why anything at all” belong with a telescope, not a creek story."},gate:{path:"Why a world",whyEasy:"Ansel’s stone asks why there is a world at all. That question lives at the gate you walked in by.",whyHard:"Why Gate is the east-road arch beside the porch. After the sky, you come back to the stone: first mover, might-not-have-been, the beginning argument — then the high ridge."},lookout:{path:"Meaning",whyEasy:"Hope’s tower looks over the whole town. Duty, mind, meaning, and beauty live up here.",whyHard:"Meaning Ridge is the last ridge. Inner life, duty, hunger, and beauty are what it is like to be a person looking down on the walk you kept."},journal:{path:"Pages",whyEasy:"River’s house of pages. What you can still say lives here.",whyHard:"The dossier house is not a new proof. It is the traveler’s memory of proofs — pages River has to be able to say again."},lamps:{path:"Remember",whyEasy:"Street lamps remember walks you kept. Juniper’s light grows along the road.",whyHard:"Star lamps are the same morning light grown into the street. Mastery and nights held make the town remember."}};function a2(a,o){const r=uu[a];return o?r.whyEasy:r.whyHard}function yg(a){return a==="hollow"?"Story Creek · Jesus stories":a==="bench"?"Witness Square · public names":a==="porch"?"Juniper’s lamp":a==="observatory"?"Nora’s Sky Watch":a==="gate"?"Ansel’s why-a-world gate":a==="lookout"?"Hope’s Meaning Ridge":null}const s2="Arrive at the porch. Stories at the creek. Names on the square. Sky, gate, and lookout climb toward Heaven. Tap a building to manage and upgrade it.",i2="Silver City is a short walk through the case for God. After each puzzle you fold the teaching and rebuild one claim + one reason from memory — that’s the game. Try it, then see what you can still say.";function o2(a=typeof window<"u"?window.location.href:""){return`${i2}

${a}`}function mu({compact:a}){const[o,r]=H.useState(!1);async function c(){const d=window.location.href,u=o2(d);try{if(navigator.share){await navigator.share({title:"Silver City: Unending Evidence",text:u,url:d});return}}catch{}try{await navigator.clipboard.writeText(u),r(!0),window.setTimeout(()=>r(!1),2200)}catch{r(!1)}}return s.jsxs("div",{className:`share-invite ${a?"is-compact":""}`,children:[a?null:s.jsx("p",{children:"Hand a friend the walk — not a score. Ask what they can still say after the page folds."}),s.jsx("button",{type:"button",className:"btn gold",onClick:()=>{c()},children:o?"Copied — ask what they remember":"Share a morning"})]})}const Wd="silver-city-ads",pu=!1,r2={"hub-banner":{id:"hub-banner",label:"Hub banner",where:"Map, under Today’s Trail, above the district list"},"between-districts":{id:"between-districts",label:"Between districts",where:"Map, once between Story Creek and Witness Square"},"after-daily":{id:"after-daily",label:"After Daily complete",where:"Today’s Trail teaser screen only — after the takeaway is chosen"}};function Ow(){if(typeof localStorage>"u")return"default";const a=localStorage.getItem(Wd);return a==="on"||a==="off"?a:"default"}function l2(a=Ow()){return a==="on"?!0:a==="off"?!1:pu}function c2(a){typeof localStorage>"u"||(a==="default"?localStorage.removeItem(Wd):localStorage.setItem(Wd,a),typeof window<"u"&&window.dispatchEvent(new Event("silver-city-ads")))}function qw(a){return typeof window>"u"?()=>{}:(window.addEventListener("storage",a),window.addEventListener("silver-city-ads",a),()=>{window.removeEventListener("storage",a),window.removeEventListener("silver-city-ads",a)})}function h2(){return H.useSyncExternalStore(qw,l2,()=>!1)}function d2(){return H.useSyncExternalStore(qw,Ow,()=>"default")}function gg({slot:a}){if(!h2())return null;const r=r2[a];return s.jsxs("aside",{className:`ad-slot ad-slot-${a}`,"aria-label":`${r.label} placeholder`,children:[s.jsx("p",{className:"eyebrow",children:"Ad slot · not live"}),s.jsx("p",{className:"ad-slot-label",children:r.label}),s.jsx("p",{className:"quiet",children:r.where})]})}var u2=kg();function m2({plotId:a,onClose:o,onEnter:r,onNavigate:c}){const{progress:d,upgradeBuilding:u}=Ge(),g=ye(d),y=(()=>{const B=iw(a,d);return g&&a==="journal"?{...B,placeTitle:"River’s pages"}:B})(),p=ys(a,d),w=Sn(a,d),T=Qx(a,d,g),x=tt.find(B=>B.id===a)?.areaId,N=x?xi(x,d.completed):!0,z=x&&!N?Bo(x,d.completed,g):null,I=x&&!N?U1(x):null,$=I?Mt.find(B=>B.id===I)?.title??I:"",[X,te]=H.useState(null),se=y.ideas.filter(B=>B.lit).length+y.tools.filter(B=>B.lit).length;function oe(B){const F=ms(B);if(F&&d.journal.includes(F.id)){c({name:"journal",focusId:F.id,autoQuiz:!0});return}if(Et(B)&&(d.held.includes(B)||d.completed.includes(B))){c(jl(d,y.plotId==="porch"?"porch":void 0));return}c({name:"journal",focusId:F?.id??B})}const re=s.jsxs("div",{className:"mind-map is-manage",role:"dialog","aria-label":`Manage ${y.placeTitle}`,children:[s.jsx("button",{type:"button",className:"mind-map-scrim","aria-label":"Close building",onClick:o}),s.jsxs("div",{className:"mind-map-card",children:[s.jsxs("header",{className:"mind-map-head",children:[s.jsx(it,{who:y.person.id,size:"md"}),s.jsxs("div",{children:[s.jsx("p",{className:"eyebrow",children:g?`${ee.manage} · ${p} · ${Fy(p,g)}`:`Manage · Level ${p} · ${Fy(p,g)}`}),s.jsx("h2",{children:y.placeTitle}),g&&yg(a)?s.jsx("p",{className:"quiet place-sub",children:yg(a)}):null]}),s.jsx("button",{type:"button",className:"btn tiny",onClick:o,children:"Close"})]}),s.jsxs("div",{className:"mind-map-scroll",children:[s.jsx("p",{className:"quiet",children:a2(y.plotId,g)}),g?null:s.jsx(Rw,{words:[ds.upgrade]}),s.jsx("p",{className:"build-job",children:Xx(p,g)}),X?s.jsx("p",{className:"match-toast",role:"status",children:X}):null,s.jsxs("div",{className:"mind-web","aria-label":"Linked nodes",children:[s.jsxs("div",{className:"mind-node is-place is-lit",children:[s.jsx("span",{className:"mind-kicker",children:"Place"}),s.jsx("strong",{children:y.placeTitle}),s.jsx("em",{className:"mind-why",children:uu[y.plotId].path})]}),s.jsxs("div",{className:"mind-node is-person is-lit",children:[s.jsx("span",{className:"mind-kicker",children:"Person"}),s.jsx(it,{who:y.person.id,size:"sm"}),s.jsx("strong",{children:y.person.shortName})]}),y.ideas.map(B=>s.jsxs("div",{className:"mind-idea-wrap",children:[s.jsxs("button",{type:"button",className:`mind-node is-idea ${B.lit?"is-lit":"is-dim"}`,onClick:()=>{if(B.lit){te(null),oe(B.id);return}te(e1(g))},children:[s.jsx("span",{className:"mind-kicker",children:B.lit?g?"Main idea":"Idea":"Locked"}),s.jsx("strong",{children:B.lit&&g?Il(B.id)?.gloss??B.claim:B.claim}),B.lit&&B.source&&!g?s.jsx("em",{children:B.source}):null]}),B.lit?s.jsx(Pn,{id:B.id,surface:"map",compact:!0}):null]},B.id)),y.tools.map(B=>s.jsxs("div",{className:`mind-node is-tool ${B.lit?"is-lit":"is-dim"}`,children:[s.jsx("span",{className:"mind-kicker",children:B.lit?"Tool":"Locked"}),s.jsx(pi,{ability:B.id,size:"sm"}),s.jsx("strong",{children:B.label})]},B.id)),y.ideas.length===0&&y.tools.length===0?s.jsx("p",{className:"quiet mind-empty",children:"Walk this lot — or link the street — to light idea nodes here."}):null]}),g?null:s.jsx("p",{className:"quiet scrap-kicker",children:zT(g,se)}),p>=cs||w?null:s.jsx("p",{className:"quiet build-cap",children:g?`${p} of ${cs} looks. Learn more to earn the next.`:`${p} of ${cs} looks earned by learning.`})]}),s.jsxs("div",{className:"mind-map-dock",children:[z?s.jsx("p",{className:"build-next",children:z}):w?null:s.jsx("p",{className:"build-next",children:T.line}),z&&I?s.jsx("button",{type:"button",className:"btn gold xl",onClick:()=>c(Ml(I,d.completed)),children:g?`Walk ${$} next`:`Walk ${$}`}):w?s.jsx("button",{type:"button",className:"btn gold xl build-upgrade",onClick:()=>u(a),children:"Build this"}):s.jsx("button",{type:"button",className:"btn primary xl",onClick:()=>r(a),children:g?`Walk ${y.placeTitle}`:`Enter ${y.placeTitle}`}),z?s.jsx("button",{type:"button",className:"text-link mind-map-walk",onClick:o,children:"Stay on the map"}):w?s.jsx("button",{type:"button",className:"text-link mind-map-walk",onClick:()=>r(a),children:g?`Walk ${y.placeTitle}`:`Enter ${y.placeTitle}`}):null]})]})]});return typeof document>"u"?re:u2.createPortal(re,document.body)}const fu={lookout:{x:532,y:62},observatory:{x:422,y:126},hollow:{x:92,y:294},journal:{x:262,y:244},bench:{x:368,y:288},lamps:{x:208,y:318},gate:{x:486,y:256},porch:{x:582,y:306}},p2=1.58,f2={lookout:{x:568,y:118},observatory:{x:472,y:178},hollow:{x:148,y:352},journal:{x:312,y:300},bench:{x:420,y:344},lamps:{x:178,y:358},gate:{x:538,y:322},porch:{x:534,y:356}},To={x:0,y:0,w:640,h:420};function wg(a){const o=fu[a];return{x:o.x-150,y:o.y-120,w:300,h:230}}function y2(a){return`${a.x} ${a.y} ${a.w} ${a.h}`}function Dw({onNavigate:a,mode:o="live",mindPlot:r,onMindPlot:c}){const{progress:d}=Ge(),u=Dt(),g=Si(d,u),y=o==="poster"?"porch":Pd(d,g),{standing:p,possible:w}=rT(d),T=o==="poster"?"eden":pT(d),b=o==="poster"?_d(d):Uy(d),x=o==="poster"?vT(d):By(d),[N,z]=H.useState(b),[I,$]=H.useState(x),[X,te]=H.useState(null),[se,oe]=H.useState(!1),[re,B]=H.useState(null),[F,ne]=H.useState(null),[Q,ge]=H.useState(null),[C,O]=H.useState(null),E=r!==void 0?r:C,Z=c??O,[L,v]=H.useState(To),S=H.useRef(!1),_=H.useRef([]),ae=H.useRef(To),R=H.useRef(0);function k(fe){return o==="poster"?fe==="porch"?"scaffold":"empty":N[fe]}function M(fe){if(o==="poster"||S.current)return;const Oe=tt.find(yt=>yt.id===fe)?.areaId,ht=Oe?xi(Oe,d.completed):!0;if(Z(null),fe==="porch"&&g){a(jl(d,"porch"));return}if(Oe){const yt=Mt.find(_t=>_t.id===Oe);if(yt&&Hl(yt,d.completed)){a(jl(d,Oe));return}if(yt&&ht){a(Ml(yt.id,d.completed));return}}a(oT(fe,ht))}function G(fe){o!=="poster"&&(S.current&&!ye(d)||(ne(fe),window.setTimeout(()=>{ne(Ne=>Ne===fe?null:Ne)},340),ge(null),Z(fe)))}H.useEffect(()=>()=>{_.current.forEach(fe=>window.clearTimeout(fe)),R.current&&cancelAnimationFrame(R.current)},[]),H.useEffect(()=>{if(o!=="live")return;const fe=Uy(d),Ne=By(d);if(ye(d)){So(fe),vo(Ne),z(fe),$(Ne);return}const Oe=xT(),ht=ST();if(!Oe){So(fe),vo(Ne),z(fe),$(Ne);return}ht||vo(Ne);const yt=kT(Oe,fe),_t=ht?TT(ht,Ne,fe,yt):[],Lt={"Lit!":4,"Built!":3,"Grew!":2,Unlocked:1},nt=[...yt,..._t].sort((Pt,Tt)=>Lt[Tt.beat]-Lt[Pt.beat]);if(!nt.length){z(fe),$(Ne),So(fe),vo(Ne),ve(fe);return}S.current||(S.current=!0,z(Oe),$(ht??Ne),me(nt,fe,Ne))},[o,d]);function J(fe,Ne){const Oe=window.setTimeout(Ne,fe);_.current.push(Oe)}function ie(fe,Ne){R.current&&cancelAnimationFrame(R.current);const Oe={...ae.current},ht=performance.now(),yt=_t=>{const Lt=Ne<=0?1:Math.min(1,(_t-ht)/Ne),nt=Lt*Lt*(3-2*Lt),Pt={x:Oe.x+(fe.x-Oe.x)*nt,y:Oe.y+(fe.y-Oe.y)*nt,w:Oe.w+(fe.w-Oe.w)*nt,h:Oe.h+(fe.h-Oe.h)*nt};ae.current=Pt,v(Pt),Lt<1&&(R.current=requestAnimationFrame(yt))};R.current=requestAnimationFrame(yt)}function me(fe,Ne,Oe){const ht=typeof window<"u"&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;function yt(){te(null),B(null),ie(To,ht?0:240),z(Ne),$(Oe),So(Ne),vo(Oe),Ly(u),S.current=!1}function _t(Lt){if(Lt>=fe.length){yt();return}const nt=fe[Lt];B(nt),ht||ie(wg(nt.id),200),J(ht?40:180,()=>{nt.beat!=="Grew!"&&z(Pt=>({...Pt,[nt.id]:nt.to})),$(Pt=>({...Pt,[nt.id]:Oe[nt.id]})),te(nt.id)}),J(ht?700:1100,()=>{te(null),B(null),ht||ie(To,220),J(ht?40:200,()=>_t(Lt+1))})}_t(0)}function ve(fe){if(ye(d)||S.current||bT()===u)return;const Ne=wT(fe);if(!Ne)return;S.current=!0;const Oe=typeof window<"u"&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;oe(!0),te(Ne),Oe||ie(wg(Ne),200),J(Oe?700:1100,()=>{oe(!1),te(null),Ly(u),Oe||ie(To,220),J(Oe?40:200,()=>{S.current=!1})})}const ce=k(y),be=fu[y],Se=Sn(y,d)?"Build this":fT(ce,y,g),he=Vx(d)?ye(d)?"A building is ready. Tap it, then Build this.":"A building is ready. Tap it, then Build this — learning raises the house.":yT(y,ce,I[y]??0,ye(d)),ze=!!re||se,Ue=la(re?re.id:y),de=ye(d);return s.jsxs("section",{className:`city-overworld is-city-build is-age-${T} is-alive ${o==="poster"?"is-poster":""} ${ze?"is-revealing":""} ${se?"is-homecoming":""}`,children:[s.jsxs("svg",{className:"city-svg",viewBox:y2(L),preserveAspectRatio:"xMidYMid meet",role:o==="poster"?"img":"group","aria-label":o==="poster"?"A garden valley. The City of Heaven waits on the ridge.":de?"Silver City. Tap a building to Manage it, walk, or Build this.":ze?`${re?.beat} ${re?.title}`:`Silver City, ${Ey[T]}. ${p} of ${w} landmarks standing. The town grows toward the City of Heaven.`,children:[s.jsxs("defs",{children:[s.jsxs("linearGradient",{id:"city-sky",x1:"0",y1:"0",x2:"0",y2:"1",children:[s.jsx("stop",{offset:"0%",stopColor:"var(--city-sky-0)"}),s.jsx("stop",{offset:"22%",stopColor:"var(--city-sky-1)"}),s.jsx("stop",{offset:"52%",stopColor:"var(--city-sky-2)"}),s.jsx("stop",{offset:"100%",stopColor:"var(--city-sky-3)"})]}),s.jsxs("linearGradient",{id:"city-ridge",x1:"0",y1:"0",x2:"0",y2:"1",children:[s.jsx("stop",{offset:"0%",stopColor:"var(--city-ridge-0)"}),s.jsx("stop",{offset:"100%",stopColor:"var(--city-ridge-1)"})]}),s.jsxs("linearGradient",{id:"city-wood",x1:"0",y1:"0",x2:"0",y2:"1",children:[s.jsx("stop",{offset:"0%",stopColor:"#ffd24a"}),s.jsx("stop",{offset:"100%",stopColor:"#ff9f1a"})]}),s.jsxs("linearGradient",{id:"city-gold-roof",x1:"0",y1:"0",x2:"0",y2:"1",children:[s.jsx("stop",{offset:"0%",stopColor:"#fff6b8"}),s.jsx("stop",{offset:"52%",stopColor:"#ffcc33"}),s.jsx("stop",{offset:"100%",stopColor:"#ff9f1a"})]}),s.jsxs("linearGradient",{id:"city-wall-built",x1:"0",y1:"0",x2:"0",y2:"1",children:[s.jsx("stop",{offset:"0%",stopColor:"#7a4ad4"}),s.jsx("stop",{offset:"100%",stopColor:"#4a1a88"})]}),s.jsxs("linearGradient",{id:"city-wall-lit",x1:"0",y1:"0",x2:"0",y2:"1",children:[s.jsx("stop",{offset:"0%",stopColor:"#c86bff"}),s.jsx("stop",{offset:"100%",stopColor:"#5a2ab8"})]}),s.jsxs("linearGradient",{id:"city-heaven-wall",x1:"0",y1:"0",x2:"0",y2:"1",children:[s.jsx("stop",{offset:"0%",stopColor:"#fff6d4"}),s.jsx("stop",{offset:"100%",stopColor:"#ffcc33"})]}),s.jsxs("radialGradient",{id:"city-moon-glow",cx:"50%",cy:"50%",r:"50%",children:[s.jsx("stop",{offset:"0%",stopColor:"#fff6d4",stopOpacity:"1"}),s.jsx("stop",{offset:"55%",stopColor:"#ffcc33",stopOpacity:"0.4"}),s.jsx("stop",{offset:"100%",stopColor:"#ff5a7a",stopOpacity:"0"})]}),s.jsxs("radialGradient",{id:"city-glory",cx:"50%",cy:"50%",r:"50%",children:[s.jsx("stop",{offset:"0%",stopColor:"#fffce8",stopOpacity:"0.95"}),s.jsx("stop",{offset:"40%",stopColor:"#ffcc33",stopOpacity:"0.45"}),s.jsx("stop",{offset:"100%",stopColor:"#ff5a7a",stopOpacity:"0"})]}),s.jsxs("filter",{id:"city-glow",x:"-50%",y:"-50%",width:"200%",height:"200%",children:[s.jsx("feGaussianBlur",{stdDeviation:"5",result:"b"}),s.jsxs("feMerge",{children:[s.jsx("feMergeNode",{in:"b"}),s.jsx("feMergeNode",{in:"SourceGraphic"})]})]}),s.jsx("clipPath",{id:"city-face-clip",clipPathUnits:"objectBoundingBox",children:s.jsx("circle",{cx:"0.5",cy:"0.5",r:"0.48"})})]}),s.jsx("rect",{width:"640",height:"420",fill:"url(#city-sky)"}),s.jsx("ellipse",{cx:"320",cy:"198",rx:"280",ry:"28",fill:"#ffcc33",opacity:"0.28"}),s.jsx("circle",{cx:"548",cy:"48",r:"28",fill:"url(#city-moon-glow)"}),s.jsx("circle",{className:"city-moon",cx:"548",cy:"48",r:"9",fill:"#fff6d8"}),s.jsxs("g",{className:`city-sky-stars is-${k("lamps")}`,children:[s.jsx("circle",{cx:"72",cy:"42",r:"1.6"}),s.jsx("circle",{cx:"118",cy:"28",r:"1.2"}),s.jsx("circle",{cx:"510",cy:"36",r:"1.5"}),s.jsx("circle",{cx:"568",cy:"52",r:"1.1"}),s.jsx("circle",{cx:"430",cy:"22",r:"1.3"}),s.jsx("circle",{cx:"300",cy:"34",r:"1.1"}),s.jsx("circle",{cx:"196",cy:"50",r:"1.1"}),s.jsx("circle",{cx:"248",cy:"20",r:"0.9"}),s.jsx("circle",{cx:"390",cy:"54",r:"1.2"}),s.jsx("circle",{cx:"88",cy:"68",r:"0.8"})]}),s.jsx("path",{d:"M-20 210 L80 120 160 168 250 96 340 150 430 78 520 130 660 70 V230 H-20 Z",fill:"url(#city-ridge)",opacity:"0.92"}),s.jsx("path",{d:"M-20 248 L40 200 120 228 210 176 300 214 410 168 500 206 660 150 V430 H-20 Z",fill:"#3dcc7a",opacity:"0.55"}),s.jsx(T2,{age:T,easy:de,onOpen:()=>{if(de){ge("Tap a building to walk or Manage it.");return}if(T==="eden"||T==="village"){ge("Heaven waits on the ridge. Keep the trail — porch, creek, square, then the climb.");return}G("lookout")}}),s.jsx(b2,{age:T}),de?null:s.jsx(v2,{age:T}),s.jsx("path",{className:`city-street city-street-main is-${k("hollow")} is-${k("bench")}`,d:"M70 310 C 140 300, 200 280, 280 292 C 360 304, 430 286, 560 300",fill:"none"}),s.jsx("path",{className:`city-street city-street-ridge is-${k("bench")} is-${k("gate")}`,d:"M300 292 C 360 250, 400 210, 448 168",fill:"none"}),s.jsx("path",{className:`city-creek is-${k("hollow")}`,d:"M18 250 C 70 270, 90 300, 60 360 C 40 400, 80 410, 120 400",fill:"none"}),I.lamps>=1?s.jsxs("g",{className:`city-street-lamps is-${k("lamps")}`,"aria-hidden":!0,children:[s.jsx("circle",{className:"city-lamp",cx:"148",cy:"298",r:"5"}),I.lamps>=4?s.jsx("circle",{className:"city-lamp",cx:"330",cy:"296",r:"5"}):null,I.lamps>=8?s.jsx("circle",{className:"city-lamp",cx:"470",cy:"292",r:"5"}):null]}):null,ze?null:s.jsxs("g",{className:"city-walkers","aria-hidden":!0,children:[s.jsx("image",{className:"city-walker city-walker-a",href:Qg,x:"78",y:"286",width:"32",height:"32",clipPath:"url(#city-face-clip)"}),T!=="eden"?s.jsx("image",{className:"city-walker city-walker-b",href:Xg,x:"408",y:"266",width:"30",height:"30",clipPath:"url(#city-face-clip)"}):null]}),o==="poster"?s.jsxs("g",{className:"city-welcome-folk","aria-hidden":!0,children:[s.jsx("foreignObject",{x:"148",y:"300",width:"44",height:"44",children:s.jsx("div",{className:"city-portrait",children:s.jsx(it,{who:"river",size:"sm"})})}),s.jsx("foreignObject",{x:"348",y:"274",width:"44",height:"44",children:s.jsx("div",{className:"city-portrait",children:s.jsx(it,{who:"juniper",size:"sm"})})}),s.jsx("foreignObject",{x:"236",y:"318",width:"40",height:"40",children:s.jsx("div",{className:"city-portrait",children:s.jsx(it,{who:"mercy",size:"sm"})})})]}):null,s.jsx("path",{d:"M-10 368 Q 180 340 320 358 T 660 372 V430 H-10 Z",fill:"#148a48"}),o==="live"&&!ze?s.jsxs("g",{className:"city-next-mark",transform:`translate(${be.x} ${be.y})`,children:[s.jsx("circle",{r:de?22:34,className:"city-next-halo"}),de?null:s.jsx("text",{y:"-40",textAnchor:"middle",children:Se})]}):null,s.jsx(Ra,{id:"lookout",stage:k("lookout"),fill:I.lookout,next:y==="lookout",rising:X==="lookout",tapped:F==="lookout",ready:Sn("lookout",d),onOpen:G}),s.jsx(Ra,{id:"observatory",stage:k("observatory"),fill:I.observatory,next:y==="observatory",rising:X==="observatory",tapped:F==="observatory",ready:Sn("observatory",d),onOpen:G}),s.jsx(Ra,{id:"hollow",stage:k("hollow"),fill:I.hollow,next:y==="hollow",rising:X==="hollow",tapped:F==="hollow",ready:Sn("hollow",d),onOpen:G}),s.jsx(Ra,{id:"journal",stage:k("journal"),fill:I.journal,next:y==="journal",rising:X==="journal",tapped:F==="journal",ready:Sn("journal",d),onOpen:G}),s.jsx(Ra,{id:"bench",stage:k("bench"),fill:I.bench,next:y==="bench",rising:X==="bench",tapped:F==="bench",ready:Sn("bench",d),onOpen:G}),s.jsx(Ra,{id:"lamps",stage:k("lamps"),fill:I.lamps,next:y==="lamps",rising:X==="lamps",tapped:F==="lamps",ready:Sn("lamps",d),onOpen:G}),s.jsx(Ra,{id:"gate",stage:k("gate"),fill:I.gate,next:y==="gate",rising:X==="gate",tapped:F==="gate",ready:Sn("gate",d),onOpen:G}),s.jsx(Ra,{id:"porch",stage:k("porch"),fill:I.porch,next:y==="porch",rising:X==="porch",tapped:F==="porch",ready:Sn("porch",d),onOpen:G}),o==="live"?tt.map(fe=>s.jsx(H2,{id:fe.id,stage:k(fe.id),next:y===fe.id,rising:X===fe.id,speaking:de?!1:re?.id===fe.id||y===fe.id&&!ze,ack:re?.id===fe.id?re.beat:void 0},`folk-${fe.id}`)):null,o==="live"&&de?s.jsx("g",{className:"city-easy-tags",pointerEvents:"none",children:n1.filter(fe=>k(fe)!=="empty"||y===fe).map(fe=>s.jsx(k2,{id:fe},`tag-${fe}`))}):null]}),re&&!de?s.jsxs("div",{className:"city-beat",role:"status",children:[s.jsxs("span",{className:"city-beat-gems","aria-hidden":!0,children:[s.jsx(qt,{gem:"lamp",size:"sm"}),s.jsx(qt,{gem:"star",size:"sm"}),s.jsx(qt,{gem:"coin",size:"sm"})]}),s.jsx(it,{who:Ue.who,size:"sm"}),s.jsxs("div",{children:[s.jsx("strong",{children:re.beat}),s.jsx("span",{children:ye(d)&&re.id==="journal"?"River’s pages":re.title})]})]}):null,se&&!re&&!de?s.jsxs("div",{className:"city-beat is-home",role:"status",children:[s.jsx(it,{who:"juniper",size:"sm"}),s.jsxs("div",{children:[s.jsx("strong",{children:"Still lit"}),s.jsx("span",{children:"The town held"})]})]}):null,o==="live"?s.jsx("div",{className:"city-legend",children:ze?s.jsx("p",{className:"eyebrow",children:re?.beat}):ye(d)?s.jsxs(s.Fragment,{children:[s.jsx("p",{className:"city-gift",children:he}),Q?s.jsx("p",{className:"city-lock-toast",role:"status",children:Q}):null]}):s.jsxs(s.Fragment,{children:[s.jsx("p",{className:"eyebrow",children:"Eden → City of Heaven"}),s.jsx("ol",{className:"city-age-track","aria-label":"Journey ages",children:gd.map(fe=>s.jsx("li",{className:fe===T?"is-now":Pw(fe,T)?"is-done":"",children:lT[fe]},fe))}),s.jsx("h2",{children:Ey[T]}),s.jsx("p",{className:"city-age-line",children:cT[T]}),s.jsx("p",{className:"city-gift",children:he}),Q?s.jsx("p",{className:"city-lock-toast",role:"status",children:Q}):null,s.jsx("p",{className:"city-map-hint",children:s2}),g?s.jsx("p",{className:"city-morrow",children:"Town held. A lamp waits tomorrow."}):null]})}):null,o==="live"&&E?s.jsx(m2,{plotId:E,onClose:()=>Z(null),onEnter:M,onNavigate:a}):null]})}const g2=[0,30,60,90,120,150,180,210,240,270,300,330],w2=[{age:"eden",x:58,y:338},{age:"village",x:118,y:300},{age:"town",x:280,y:292},{age:"gold",x:498,y:268},{age:"heaven",x:572,y:36}];function Pw(a,o){return gd.indexOf(a)<=gd.indexOf(o)}function b2({age:a}){return s.jsxs("g",{className:`city-eden is-${a}`,"aria-hidden":!0,children:[s.jsx("ellipse",{className:"city-eden-canopy",cx:"46",cy:"268",rx:"22",ry:"16"}),s.jsx("ellipse",{className:"city-eden-canopy",cx:"78",cy:"258",rx:"18",ry:"14"}),s.jsx("ellipse",{className:"city-eden-canopy",cx:"28",cy:"292",rx:"16",ry:"12"}),s.jsx("circle",{className:"city-eden-fruit",cx:"40",cy:"262",r:"3.2"}),s.jsx("circle",{className:"city-eden-fruit",cx:"70",cy:"250",r:"2.8"}),s.jsx("circle",{className:"city-eden-fruit",cx:"88",cy:"266",r:"2.4"}),s.jsx("path",{className:"city-eden-river",d:"M8 236 C 40 258, 54 300, 36 348 C 22 382, 70 404, 118 396"})]})}function v2({age:a}){const o=dT[a];return s.jsxs("g",{className:`city-spine is-${a}`,"aria-hidden":!0,children:[s.jsx("path",{className:"city-spine-line",pathLength:1,strokeDasharray:`${o} ${1-o}`,d:"M58 338 C 100 312, 160 300, 280 292 C 380 286, 460 220, 520 80 C 540 48, 560 32, 572 36"}),w2.map(r=>s.jsxs("g",{className:`city-spine-mark ${Pw(r.age,a)?"is-lit":"is-wait"}`,transform:`translate(${r.x} ${r.y})`,children:[s.jsx("circle",{r:"7"}),s.jsx("circle",{r:"3.2",className:"city-spine-core"})]},r.age))]})}function k2({id:a}){const{lines:o,x0:r,y0:c,w:d,h:u}=i1(a),g=hw[a];return s.jsxs("g",{className:"city-easy-chip",children:[s.jsx("rect",{className:"city-plot-tag-bg",x:r,y:c,width:d,height:u,rx:10}),s.jsx("text",{className:"city-plot-tag",x:g.x,y:g.y,textAnchor:"middle",children:o.map((y,p)=>s.jsx("tspan",{x:g.x,dy:p===0?0:13,children:y},y))})]})}function T2({age:a,easy:o,onOpen:r}){const c=o?"seed":uT(a),d=o?null:mT(a),u=c==="city";return s.jsxs("g",{className:`city-heaven is-${a} is-${c}`,"aria-label":d??"Heaven waits on the ridge",role:"button",tabIndex:0,onClick:r,onKeyDown:g=>{(g.key==="Enter"||g.key===" ")&&(g.preventDefault(),r())},children:[c==="seed"||c==="wait"?s.jsx("circle",{className:"city-heaven-seed",cx:"575",cy:"36",r:c==="wait"?7:5}):s.jsx("circle",{className:"city-heaven-glory",cx:"575",cy:"28",r:u?46:28,fill:"url(#city-glory)"}),c==="wait"||c==="rise"?s.jsx("path",{className:"city-heaven-foot",d:"M538 62 h76"}):null,c==="rise"||c==="ridge"||c==="city"?s.jsx("path",{className:"city-heaven-wall",d:"M530 48 l18-22 16 10 14-18 16 12 18-16 16 20 v22 H530 Z",fill:"url(#city-heaven-wall)"}):null,c==="ridge"||c==="city"?s.jsxs(s.Fragment,{children:[s.jsx("path",{className:"city-heaven-gate",d:"M568 58 v-16 a8 10 0 0 1 16 0 v16"}),s.jsx("rect",{className:"city-heaven-tower",x:"538",y:"18",width:"10",height:"22",rx:"1"}),s.jsx("rect",{className:"city-heaven-tower",x:"602",y:"14",width:"10",height:"26",rx:"1"})]}):null,u?s.jsxs(s.Fragment,{children:[s.jsx("path",{className:"city-heaven-spire",d:"M543 18 l5-10 5 10"}),s.jsx("path",{className:"city-heaven-spire",d:"M607 14 l5-12 5 12"})]}):null,d?s.jsx("text",{className:"city-heaven-label",x:$y.x,y:$y.y,textAnchor:"middle",children:d}):null]})}function Ra({id:a,stage:o,fill:r,next:c,rising:d,tapped:u,ready:g,onOpen:y}){const{progress:p}=Ge(),w=ye(p),T=o!=="empty"||c||g,b=fu[a],x=o==="empty"&&!c&&!g,N=w&&a==="journal"?"River’s pages":tt.find(B=>B.id===a)?.title??a,z=p2,I=w?56:42,$=cw(a),X=!w&&T,te=Math.max(64,$.length*8+20),se=Math.min(632-te/2,Math.max(te/2+8,b.x)),oe=b.y+32;return s.jsxs("g",{className:`city-plot is-${o} ${c?"is-next":""} ${d?"is-rising":""} ${u?"is-tapped":""} ${g?"is-ready":""} ${w?"is-easy-lot":""}`,role:T?"button":void 0,tabIndex:T?0:void 0,"aria-label":`${N} ${o}${g?", upgrade ready":""}${c?", next to build":""}${d?", just rose":""}`,onClick:()=>{T&&y(a)},onKeyDown:B=>{T&&(B.key==="Enter"||B.key===" ")&&(B.preventDefault(),y(a))},children:[T?s.jsx("circle",{className:"city-plot-hit",cx:b.x,cy:b.y,r:I}):null,x?c||g?s.jsxs("g",{className:"city-lot is-staked",transform:`translate(${b.x} ${b.y}) scale(${z})`,children:[s.jsx("ellipse",{rx:"20",ry:"9",className:"city-earth"}),s.jsx("path",{className:"city-timber",d:"M-10 8 V-12 M10 8 V-12 M-12 -2 H12 M-5 8 V-7 M5 8 V-7"})]}):null:s.jsx("g",{transform:`translate(${b.x} ${b.y}) scale(${z}) translate(${-b.x} ${-b.y})`,children:s.jsx(x2,{id:a,stage:o,fill:r,rising:d})}),X?s.jsxs(s.Fragment,{children:[s.jsx("rect",{className:"city-plot-tag-bg",x:se-te/2,y:oe-14,width:te,height:18,rx:7}),s.jsx("text",{className:"city-plot-tag",x:se,y:oe,textAnchor:"middle",children:$})]}):null,d?s.jsxs("g",{className:"city-sparks",transform:`translate(${b.x} ${b.y})`,children:[s.jsx("circle",{r:"28",className:"city-flash"}),g2.map(B=>s.jsx("circle",{className:"city-spark",r:"4.2",style:{"--deg":`${B}deg`}},B))]}):null]})}function x2({id:a,stage:o,fill:r,rising:c}){return a==="hollow"?s.jsx(S2,{stage:o,fill:r,rising:c}):a==="porch"?s.jsx(M2,{stage:o}):a==="bench"?s.jsx(j2,{stage:o,fill:r,rising:c}):a==="observatory"?s.jsx(C2,{stage:o,fill:r,rising:c}):a==="gate"?s.jsx(A2,{stage:o,fill:r,rising:c}):a==="lookout"?s.jsx(N2,{stage:o,fill:r,rising:c}):a==="journal"?s.jsx(E2,{stage:o,fill:r}):s.jsx(L2,{stage:o,fill:r})}function S2({stage:a,fill:o,rising:r}){return a==="scaffold"?s.jsxs(s.Fragment,{children:[s.jsx("ellipse",{cx:"116",cy:"320",rx:"24",ry:"8",className:"city-earth"}),s.jsx("path",{className:"city-timber",d:"M98 318 V288 M134 318 V288 M96 288 H136 M108 318 V272 L116 260 L124 272 V318"})]}):s.jsxs(s.Fragment,{children:[s.jsx("ellipse",{cx:"92",cy:"286",rx:"28",ry:"18",className:"city-canopy"}),s.jsx("ellipse",{cx:"128",cy:"278",rx:"22",ry:"16",className:"city-canopy"}),o>=2?s.jsx("ellipse",{cx:"70",cy:"300",rx:"16",ry:"12",className:`city-canopy ${r&&o===2?"is-sprout":""}`}):null,o>=3?s.jsx("ellipse",{cx:"148",cy:"268",rx:"14",ry:"11",className:`city-canopy ${r&&o===3?"is-sprout":""}`}):null,o>=4?s.jsx("ellipse",{cx:"54",cy:"278",rx:"12",ry:"9",className:`city-canopy ${r&&o===4?"is-sprout":""}`}):null,s.jsx("path",{className:"city-porch",d:"M94 320 h44 l5 8 H90 Z"}),s.jsx("rect",{x:"98",y:"292",width:"36",height:"28",rx:"3"}),s.jsx("path",{className:"city-roof",d:"M94 292 l22-16 22 16"}),a==="lit"?s.jsx("path",{className:"city-roof city-roof-tile",d:"M90 294 l26-20 26 20"}):null,o>=1?s.jsx("rect",{x:"110",y:"300",width:"10",height:"10",rx:"1",className:"city-window"}):null,a==="lit"?s.jsx("circle",{className:"city-lamp",cx:"142",cy:"302",r:"4.5"}):null]})}function M2({stage:a}){return a==="scaffold"?s.jsxs(s.Fragment,{children:[s.jsx("ellipse",{cx:"565",cy:"334",rx:"30",ry:"9",className:"city-earth"}),s.jsx("path",{className:"city-timber",d:"M538 330 V296 M590 330 V296 M536 296 H592 M574 330 V256"}),s.jsx("circle",{className:"city-lamp",cx:"574",cy:"252",r:"6"})]}):s.jsxs(s.Fragment,{children:[s.jsx("path",{className:"city-porch",d:"M532 334 h66 l7 9 H526 Z"}),s.jsx("path",{className:"city-roof",d:"M530 292 l35-22 35 22"}),s.jsx("rect",{x:"536",y:"292",width:"58",height:"42",rx:"3"}),s.jsx("rect",{x:"552",y:"306",width:"12",height:"14",rx:"1",className:"city-window"}),a==="lit"?s.jsx("path",{className:"city-roof city-roof-tile",d:"M526 294 l39-26 39 26"}):null,s.jsx("path",{d:"M574 292 v-36"}),s.jsx("circle",{cx:"574",cy:"252",r:"8",className:"city-lamp"}),a==="lit"?s.jsxs(s.Fragment,{children:[s.jsx("path",{className:"city-porch-rail",d:"M538 328 h54 M538 328 v-8 M564 328 v-8 M592 328 v-8"}),s.jsxs("g",{className:"city-smoke",transform:"translate(574 236)",children:[s.jsx("circle",{className:"city-puff city-puff-a",r:"3",cx:"0",cy:"0"}),s.jsx("circle",{className:"city-puff city-puff-b",r:"2.4",cx:"3",cy:"-8"})]})]}):s.jsxs("g",{className:"city-smoke",transform:"translate(574 236)",children:[s.jsx("circle",{className:"city-puff city-puff-a",r:"3",cx:"0",cy:"0"}),s.jsx("circle",{className:"city-puff city-puff-b",r:"2.4",cx:"3",cy:"-8"})]})]})}function j2({stage:a,fill:o,rising:r}){return a==="scaffold"?s.jsxs(s.Fragment,{children:[s.jsx("ellipse",{cx:"350",cy:"308",rx:"28",ry:"8",className:"city-earth"}),s.jsx("path",{className:"city-timber",d:"M322 304 V270 M378 304 V270 M320 270 H380 M332 304 h36"})]}):s.jsxs(s.Fragment,{children:[s.jsx("path",{className:"city-porch",d:"M318 304 h64 l6 8 H312 Z"}),s.jsx("rect",{x:"318",y:"268",width:"64",height:"36",rx:"3"}),s.jsx("path",{className:"city-roof",d:"M314 268 l34-16 34 16"}),a==="lit"?s.jsx("path",{className:"city-roof city-roof-tile",d:"M310 270 l38-20 38 20"}):null,s.jsx("rect",{x:"338",y:"278",width:"10",height:"12",rx:"1",className:"city-window"}),s.jsx("rect",{x:"354",y:"278",width:"10",height:"12",rx:"1",className:"city-window"}),o>=2?s.jsx("rect",{x:"322",y:"278",width:"8",height:"10",rx:"1",className:`city-window ${r&&o===2?"is-sprout":""}`}):null,o>=3?s.jsx("rect",{x:"370",y:"278",width:"8",height:"10",rx:"1",className:`city-window ${r&&o===3?"is-sprout":""}`}):null,s.jsx("path",{d:"M332 304 h36 M338 304 v-12 h24 v12"}),a==="lit"?s.jsx("circle",{className:"city-lamp",cx:"350",cy:"254",r:"5"}):null]})}function C2({stage:a,fill:o,rising:r}){return a==="scaffold"?s.jsxs(s.Fragment,{children:[s.jsx("ellipse",{cx:"464",cy:"142",rx:"28",ry:"9",className:"city-earth"}),s.jsx("path",{className:"city-timber",d:"M440 140 V112 M488 140 V112 M438 112 H490 M464 140 V88"}),s.jsx("circle",{cx:"464",cy:"86",r:"7",className:"city-timber"})]}):s.jsxs(s.Fragment,{children:[s.jsx("path",{d:"M428 118 a36 28 0 0 1 72 0 v22 h-72 z"}),s.jsx("rect",{x:"454",y:"86",width:"8",height:"16",rx:"1"}),s.jsx("circle",{cx:"464",cy:"108",r:o>=2?7:5,className:`city-window ${r&&o===2?"is-sprout":""}`}),o>=3?s.jsx("circle",{cx:"448",cy:"116",r:"4",className:`city-window ${r&&o===3?"is-sprout":""}`}):null,o>=4||a==="lit"?s.jsx("circle",{cx:"480",cy:"116",r:"4",className:"city-window"}):null,a==="lit"?s.jsxs(s.Fragment,{children:[s.jsx("path",{className:"city-roof city-roof-tile",d:"M432 118 a32 24 0 0 1 64 0"}),s.jsx("circle",{className:"city-lamp",cx:"498",cy:"124",r:"4.5"})]}):null]})}function A2({stage:a,fill:o,rising:r}){return a==="scaffold"?s.jsxs(s.Fragment,{children:[s.jsx("ellipse",{cx:"498",cy:"314",rx:"26",ry:"8",className:"city-earth"}),s.jsx("path",{className:"city-timber",d:"M474 312 V252 M522 312 V252"})]}):s.jsxs(s.Fragment,{children:[s.jsx("path",{d:"M470 250 v62 h56 v-62"}),s.jsx("path",{className:"city-roof",d:"M478 250 a20 28 0 0 1 40 0"}),o>=2?s.jsx("path",{className:`city-roof ${r&&o===2?"is-sprout":""}`,d:"M474 252 a24 30 0 0 1 48 0"}):null,o>=3||a==="lit"?s.jsx("circle",{className:"city-lamp",cx:"474",cy:"248",r:"4.5"}):null,a==="lit"?s.jsxs(s.Fragment,{children:[s.jsx("path",{className:"city-roof city-roof-tile",d:"M476 248 a22 30 0 0 1 44 0"}),s.jsx("circle",{className:"city-lamp",cx:"522",cy:"248",r:"4.5"})]}):null]})}function N2({stage:a,fill:o,rising:r}){return a==="scaffold"?s.jsxs(s.Fragment,{children:[s.jsx("ellipse",{cx:"520",cy:"140",rx:"18",ry:"7",className:"city-earth"}),s.jsx("path",{className:"city-timber",d:"M520 140 V70 M508 96 H532 M512 118 H528"})]}):s.jsxs(s.Fragment,{children:[s.jsx("path",{d:"M502 86 l18-38 18 38 v52 h-36 z"}),s.jsx("path",{className:"city-roof",d:"M502 86 l18-38 18 38"}),s.jsx("rect",{x:"514",y:"78",width:"12",height:"18",rx:"1",className:"city-window"}),o>=2?s.jsx("path",{d:"M520 48 l14 8 v10 h-8 z",className:`city-flag ${r&&o===2?"is-sprout":""}`}):null,o>=3||a==="lit"?s.jsx("circle",{className:"city-lamp",cx:"538",cy:"70",r:"4.5"}):null,a==="lit"?s.jsx("path",{className:"city-roof city-roof-tile",d:"M498 88 l22-44 22 44"}):null]})}function E2({stage:a,fill:o}){return a==="scaffold"?s.jsxs(s.Fragment,{children:[s.jsx("ellipse",{cx:"288",cy:"290",rx:"26",ry:"8",className:"city-earth"}),s.jsx("path",{className:"city-timber",d:"M266 286 V250 M310 286 V250 M264 250 H312"})]}):s.jsxs(s.Fragment,{children:[s.jsx("path",{className:"city-porch",d:"M260 288 h56 l6 8 H254 Z"}),s.jsx("path",{className:"city-roof",d:"M256 248 l32-20 32 20"}),s.jsx("rect",{x:"262",y:"248",width:"52",height:"40",rx:"3"}),s.jsx("rect",{x:"280",y:"262",width:"16",height:"14",rx:"1",className:"city-window"}),o>=4||a==="lit"?s.jsx("path",{className:"city-roof city-roof-tile",d:"M252 250 l36-24 36 24"}):null,a==="lit"?s.jsx("circle",{className:"city-lamp",cx:"312",cy:"246",r:"4"}):null]})}function L2({stage:a,fill:o}){const r=a!=="empty",c=o>=4||a==="built"||a==="lit",d=o>=8||a==="lit";return s.jsxs(s.Fragment,{children:[r?s.jsxs(s.Fragment,{children:[s.jsx("path",{d:"M214 318 v-28"}),s.jsx("circle",{cx:"214",cy:"286",r:"6",className:"city-lamp"})]}):null,c?s.jsxs(s.Fragment,{children:[s.jsx("path",{d:"M258 322 v-28"}),s.jsx("circle",{cx:"258",cy:"290",r:"6",className:"city-lamp"})]}):null,d?s.jsxs(s.Fragment,{children:[s.jsx("path",{d:"M392 326 v-28"}),s.jsx("circle",{cx:"392",cy:"294",r:"6",className:"city-lamp"})]}):null]})}function H2({id:a,stage:o,next:r,rising:c,speaking:d,ack:u}){const{progress:g}=Ge();if(o==="empty"&&!r)return null;const y=ye(g),p=f2[a],w=y?{x:p.x,y:p.y-a1}:p,T=la(a),b=u?nT(a,u,ye(g)):T.here,x=b.length>22?`${b.slice(0,20)}…`:b,N=o==="built"||o==="lit";return s.jsx("g",{transform:`translate(${w.x} ${w.y})`,pointerEvents:"none",children:s.jsxs("g",{className:`city-folk is-${o} ${r?"is-next":""} ${c?"is-waving":""} ${N?"is-home":""}`,children:[s.jsx("ellipse",{className:"city-home-pad",rx:N?20:13,ry:N?8:5,cy:"7"}),N?s.jsx("path",{className:"city-porch-rail",d:"M-16 2 H16 M-16 2 v-8 M0 2 v-8 M16 2 v-8"}):null,o==="lit"?s.jsx("circle",{className:"city-lamp",cx:"18",cy:"-4",r:"3.8"}):null,s.jsx("foreignObject",{x:"-22",y:"-50",width:"44",height:"44",overflow:"hidden",children:s.jsx("div",{className:"city-portrait",children:s.jsx(it,{who:T.who,size:"sm"})})}),d?s.jsxs("g",{className:"city-bubble",children:[s.jsx("rect",{x:"-38",y:"-62",width:"76",height:"16",rx:"8"}),s.jsx("text",{y:"-51",textAnchor:"middle",children:x})]}):null]})})}function Gw({items:a,onOpen:o,onLater:r,onNotToday:c}){const{progress:d}=Ge(),u=ye(d);if(a.length===0)return null;const g=a[0],y=a.length-1;return s.jsxs("section",{className:"recall-offer","aria-label":"A held line is ready",children:[s.jsx("p",{className:"eyebrow",children:u?"A sentence you kept":"A held line is ready"}),s.jsx("h2",{children:u?hn(g.id,g.title):g.title}),s.jsxs("p",{className:"quiet",children:[u?`Up to ${xd} this sitting — not every page.`:`A short sitting — about ${xd}, not the whole journal.`,y>0?` · ${a.length} ready now.`:""]}),s.jsx("button",{type:"button",className:"btn primary",onClick:()=>o(g.id),children:u?ee.rememberSentence:"Dust this off"}),s.jsxs("div",{className:"recall-skip",children:[s.jsx("button",{type:"button",className:"text-link",onClick:r,children:"Later"}),s.jsx("button",{type:"button",className:"text-link",onClick:c,children:"Not today"})]}),u?null:s.jsx("p",{className:"quiet",children:"Later leaves them for this walk. Not today puts them off until morning. No guilt."})]})}function W2({onNavigate:a,openPlot:o}){const{progress:r,snoozeReviews:c}=Ge(),d=Dt(),u=Si(r,d),g=lu(r,d),[y,p]=H.useState(()=>Nl(d)),w=nu(r,d,y),T=cu(r,d),b=Pd(r,u),x=pw(r),N=ye(r),z=FT(r),I=r.streetLinked??[],$=Xd(I),X=!z&&I.length>0,te=o&&tt.some(E=>E.id===o)?o:null,[se,oe]=H.useState(te);if(H.useEffect(()=>{oe(te)},[te]),N){const E=vd(r),Z=DT(r),v=ps(r)===xl&&!Go(r,xl);return s.jsxs("main",{className:"hub is-easy-home","aria-label":"Home",children:[s.jsxs("header",{className:"easy-home-head",children:[s.jsx("p",{className:"eyebrow",children:"Silver City"}),s.jsx("h1",{children:"Play"}),s.jsx("p",{className:"quiet",children:Z==="match"?"Find the words. Hold the line.":v?"Read Mercy’s story at Story Creek first.":ee.readStoryFirst})]}),s.jsxs("nav",{className:"easy-core","aria-label":"Play",children:[s.jsx("button",{type:"button",className:`btn xl ${Z==="learn"?"primary":""}`,onClick:()=>a({name:"learn"}),children:E?ee.learnCta:ee.readStory}),s.jsx("button",{type:"button",className:`btn xl ${Z==="match"?"primary":E?"":"is-locked"}`,"aria-disabled":!E,onClick:()=>a({name:"link"}),children:ee.matchCta}),!E&&v?s.jsx("p",{className:"quiet easy-match-lock",children:ee.readStoryFirst}):null,s.jsx("button",{type:"button",className:`btn xl ${Z==="hold"?"primary":""}`,onClick:()=>a(Kd(r)),children:ee.saved})]}),s.jsx("button",{type:"button",className:"text-link town-soon",onClick:()=>a({name:"settings"}),children:ee.townSoon})]})}function re(E){oe(E),!E&&o&&a({name:"hub"})}const B=T.kind==="daily"?N?ee.readStory:"Walk today’s trail":T.kind==="vista"?"Stand at the lookout":T.kind==="challenge"?"Open this walk":"Do this next";function F(){if(T.kind==="daily"){a({name:"daily"});return}if(T.kind==="welcome"){a({name:"welcome"});return}if(T.kind==="vista"){a({name:"vista"});return}if(T.challengeId&&T.areaId){a({name:"challenge",areaId:T.areaId,challengeId:T.challengeId});return}T.areaId&&a(Ml(T.areaId,r.completed))}const ne=N&&T.kind==="daily"?ee.readStory:T.title,Q=N?T.detail.replace(/\bparable\b/gi,ee.parable).replace(/\bcreed\b/gi,`creed (${ee.creed})`):T.detail;function ge(E){a({name:"journal",focusId:ms(E)?.id??E,autoQuiz:!0})}function C(){p(Ao(d,w.map(E=>E.id),!0))}function O(){c(w.map(E=>E.id),d),p(Ao(d,w.map(E=>E.id),!0))}return s.jsxs("main",{className:"hub is-town is-inhabited","aria-label":"The town",children:[N?null:X?s.jsxs("section",{className:"next-card do-next","aria-label":"Do this next",children:[s.jsx("p",{className:"eyebrow",children:"Do this next"}),s.jsx("h2",{children:"Tonight’s street"}),s.jsxs("p",{className:"do-next-detail",children:[I.length," of ",zn.length," facts · ",$?.placeTitle??"next place"," tonight"]}),s.jsxs("p",{className:"quiet",children:[zn.length-I.length," facts still wait. One more round, then stop."]}),s.jsx("button",{type:"button",className:"btn primary xl",onClick:()=>a({name:"link"}),children:ee.continueStreet}),s.jsx("button",{type:"button",className:"btn xl",onClick:F,children:B})]}):s.jsxs("section",{className:"next-card do-next","aria-label":"Do this next",children:[s.jsx("p",{className:"eyebrow",children:"Do this next"}),s.jsx("h2",{children:ne}),s.jsx("p",{className:"do-next-detail",children:Q}),g>0?s.jsxs("p",{className:"quiet",children:[g," pages due — offered below, not forced."]}):null,s.jsx("button",{type:"button",className:"btn primary xl",onClick:F,children:B})]}),!N&&!z&&!X?s.jsxs("section",{className:"street-link","aria-label":"Link the street",children:[s.jsxs("div",{className:"card-lead",children:[s.jsx(it,{who:"mercy",size:"sm"}),s.jsxs("div",{children:[s.jsx("p",{className:"eyebrow",children:"Match idea · place · person."}),s.jsx("h2",{children:"Link the street"}),s.jsx("p",{className:"quiet",children:"Idea · place · person · one place per sitting"}),s.jsx("p",{className:"town-line",children:"Snap a claim to its lot and keeper. A sitting is tonight’s street — not all 35 facts at once."}),s.jsx("p",{className:"street-lot-why",children:"Mercy’s pictures at the creek. Silas’s ledger at the square. Juniper’s lamp on the porch — meant to be seen."})]})]}),s.jsx("button",{type:"button",className:"btn gold xl",onClick:()=>a({name:"link"}),children:"Link the street"})]}):null,s.jsx(Dw,{onNavigate:a,mindPlot:se,onMindPlot:re}),s.jsx(Gw,{items:w.map(E=>({id:E.id,title:ms(E.id)?.title??Vg(E.id)?.challenge.title??(N?"A sentence you kept":"A held line")})),onOpen:ge,onLater:C,onNotToday:O}),s.jsxs("nav",{className:"town-tools","aria-label":"Town actions",children:[s.jsx("button",{type:"button",className:"btn tiny",onClick:()=>re(b),children:N?ee.manage:"Manage"}),s.jsx("button",{type:"button",className:`btn tiny ${N?"":"gold"}`,"aria-label":N?ee.connectLink:"Link the street",onClick:()=>a({name:"link"}),children:N?ee.matchCta:"Link the street"}),N?null:s.jsx("button",{type:"button",className:"btn tiny",onClick:()=>a({name:"profile"}),children:"Profile"})]}),N?null:s.jsxs("section",{className:`night-watch ${r.defense.cleared?"is-held":""}`,"aria-label":"Night Watch",children:[s.jsx("div",{className:"night-watch-glow","aria-hidden":!0}),s.jsxs("div",{className:"card-lead",children:[s.jsx(it,{who:"juniper",size:"sm"}),s.jsxs("div",{children:[s.jsx("p",{className:"eyebrow",children:r.defense.cleared?"Still watched":"Night Watch"}),s.jsx("h2",{children:"Hold the night"}),s.jsx("p",{className:"quiet",children:"Learn · hold · deploy"}),s.jsxs("p",{className:"town-line",children:["Held lines turn the night toward heaven",r.defense.cleared?` · ${r.defense.cleared} night${r.defense.cleared===1?"":"s"} held.`:"."]}),s.jsx("p",{className:"night-watch-gems","aria-label":"Night abilities",children:ca.map(E=>s.jsx("span",{className:x.includes(E.id)?"is-ready":"is-locked",title:`${E.label} ${Zd[Io(E,r)]}`,children:s.jsx(pi,{ability:E.id,size:"sm"})},E.id))})]})]}),s.jsx("button",{type:"button",className:"btn gold xl",onClick:()=>a({name:"defend"}),children:"Hold the night"})]}),N?null:s.jsx(gg,{slot:"hub-banner"}),N?null:s.jsxs("details",{className:"street-drawer",children:[s.jsx("summary",{children:"Homes on the street"}),s.jsx("ol",{className:"city-streets",children:tt.filter(E=>E.areaId||E.id==="porch").map(E=>{const Z=E.areaId?Mt.find(ae=>ae.id===E.areaId):void 0,L=E.id==="porch"?!0:Z?xi(Z.id,r.completed):!1,v=Z?Hl(Z,r.completed):u,S=E.id===b,_=la(E.id);return s.jsxs("li",{className:`${L?"":"is-locked"} ${S?"is-next":""}`,children:[s.jsxs("div",{className:"street-name",children:[s.jsx(it,{who:_.who,size:"sm"}),s.jsxs("div",{children:[s.jsx("strong",{children:E.title}),s.jsx("em",{className:"lot-path",children:uu[E.id].path}),S?s.jsx("span",{className:"street-next",children:"Next"}):null]})]}),L?null:s.jsx("p",{className:"street-lock",children:Zx(E.id,r,N,L,E.areaId?Bo(E.areaId,r.completed,N):"",u)??(N?"This street is locked. Finish the walk before it first.":"This gate is still closed.")}),s.jsx("button",{type:"button",className:"btn tiny",onClick:()=>re(E.id),children:N?ee.manage:"Manage"}),s.jsx("button",{type:"button",className:`btn tiny ${v&&L?"street-rehearse":""} ${S&&L&&!v?"gold":""}`,"aria-label":v&&L?ot.takeaway:void 0,onClick:()=>{if(!L){re(E.id);return}if(v){a(jl(r,E.id==="porch"?"porch":E.areaId));return}a(E.id==="porch"?{name:"daily"}:Ml(E.areaId??"parable-hollow",r.completed))},children:L?v?"Hold the line":S?E.id==="porch"?"Walk next":"Build next":"Enter":"Why locked"})]},E.id)})}),(r.completed.length>0||u)&&s.jsx(mu,{compact:!0})]}),N?null:s.jsx(gg,{slot:"between-districts"}),N||T.kind!=="vista"?null:s.jsx("button",{type:"button",className:"btn gold",onClick:()=>a({name:"vista"}),children:"Stand at the lookout"})]})}function jo({startOpen:a=!1,className:o,children:r}){const c=H.useRef(null);return H.useLayoutEffect(()=>{a&&c.current&&(c.current.open=!0)},[a]),s.jsx("details",{ref:c,className:["saved-tree",o].filter(Boolean).join(" "),children:r})}function Co({who:a,label:o,count:r}){return s.jsxs("summary",{className:"saved-tree-summary",children:[a?s.jsx(it,{who:a,size:"sm"}):null,s.jsx("strong",{className:"saved-tree-copy",children:o}),r!==void 0?s.jsx("em",{className:"saved-tree-count",children:r}):null]})}function I2({focusId:a,autoQuiz:o,onNavigate:r}){const{progress:c,recordHeld:d,recordReview:u,recordLessonHold:g,snoozeReviews:y}=Ge(),p=ye(c),w=Dt(),{open:T,total:b,percent:x}=Y1(c),N=Nt.filter(L=>L.areaId==="daily-trail"),z=Mt.map(L=>({area:L,entries:Nt.filter(v=>v.areaId===L.id)})),I=c.held.length,$=NT(c),X=ET(c),te=$?` · ${$} pts · ${X.easy} Easy · ${X.medium} Medium · ${X.hard} Hard`:"",[se,oe]=H.useState(()=>Nl(w)),B=nu(c,w,se).map(L=>({trace:L,brief:Et(L.id),entry:Nt.find(v=>v.unlockAfter===L.id)??Nt.find(v=>v.id===L.id)})).filter(L=>L.brief),F=lu(c,w),ne=F1(c,w),Q=Nt.find(L=>L.id===a||L.unlockAfter===a),ge=!!(Q&&c.journal.includes(Q.id)),O=(Q?qg(Q.unlockAfter,Q.id):void 0)?.id??a,E=O?Og(O,za(c,O))??Et(O):void 0;if(!!(o&&E&&(p||!Q||ge))&&E){const L=Q?.areaId??zo(E.id),S=!c.held.includes(E.id)||Ud(c,E.id);return s.jsxs("main",{className:`journal is-rehearse ${p?"is-easy-hold-practice":""}`,children:[s.jsxs("button",{type:"button",className:"text-link",onClick:()=>r({name:p?"hub":"journal"}),children:["← ",p?ee.home:"Journal"]}),s.jsxs("section",{className:"rehearse-anchor",children:[s.jsx("p",{className:"eyebrow",children:p?ee.saved:"Takeaway"}),p?null:s.jsx("h1",{children:Q?.title??ot.tapTakeaway}),s.jsx(Rl,{brief:E,mode:p&&S?"encode":"review",visits:c.memory[E.id]?.reviews??0,kicker:ot.tapTakeaway,onHeld:_=>{if(p&&S){_.clean?(d(E.id),u({id:E.id,pillar:L,kind:"encode",today:w,clean:!0,peeked:!1,elaborated:!1}),g(E.id,!0)):g(E.id,!1),r({name:"hub"});return}u({id:E.id,pillar:L,kind:"recall",today:w,clean:_.clean,peeked:!1,elaborated:!1}),_.clean||g(E.id,!1),r(p?{name:"hub"}:Q?{name:"journal",focusId:Q.id}:{name:"journal"})},onSkip:p?void 0:_=>{_==="not-today"&&y([E.id],w),oe(Ao(w,[E.id],!0)),r(Q?{name:"journal",focusId:Q.id}:{name:"journal"})}})]})]})}return s.jsxs("main",{className:`journal ${B.length?"has-due":""} ${p?"is-easy-hold":""}`,children:[p?null:B.length>0?s.jsx("section",{className:"journal-chapter due-chapter",children:s.jsx(Gw,{items:B.map(L=>({id:L.trace.id,title:L.entry?.title??L.brief?.claim??"A held line"})),onOpen:L=>{const v=B.find(S=>S.trace.id===L);r({name:"journal",focusId:v?.entry?.id??L,autoQuiz:!0})},onLater:()=>oe(Ao(w,B.map(L=>L.trace.id),!0)),onNotToday:()=>{y(B.map(L=>L.trace.id),w),oe(Ao(w,B.map(L=>L.trace.id),!0))}})}):p?null:s.jsxs("section",{className:"next-rebuild",children:[s.jsx("p",{className:"eyebrow",children:"Next recommended"}),s.jsx("h2",{children:ne.title}),s.jsx("p",{children:ne.detail}),s.jsx("button",{type:"button",className:"btn primary",onClick:()=>r(ne.go),children:ne.cta})]}),s.jsxs("header",{className:"page-head journal-head",children:[s.jsx("p",{className:"eyebrow",children:p?ee.saved:"Evidence Journal"}),s.jsx("h1",{children:p?ee.saved:"What you can still say"}),s.jsx("p",{children:p?`${I} ${ee.savedSub}${F?` · ${F} due to read again`:""}${te}.`:`${T} of ${b} unsealed · ${x}% of the dossier · ${I} lines held from memory${te}${F?` · ${F} due to dust off`:""}. Forgetting is why a page comes back.`}),p?null:s.jsxs(s.Fragment,{children:[s.jsx("div",{className:"journal-meter",role:"img","aria-label":p?`${x} percent of journal pages open, ${I} kept, ${F} due`:`${x} percent of the journal unsealed, ${I} held, ${F} due`,children:s.jsx("span",{style:{width:`${x}%`}})}),s.jsxs("p",{className:"journal-split",children:[p?`${T} open · ${b-T} still closed · ${I} kept`:`${T} unsealed · ${b-T} sealed · ${I} held`,F?` · ${F} due this morning`:""]})]})]}),c.learnings.length>0?s.jsxs(jo,{className:"journal-chapter stored-chapter",startOpen:p?!1:!Q||!!a?.startsWith("learn-"),children:[s.jsx(Co,{who:"juniper",label:p?ee.saved:"Stored lines",count:c.learnings.length}),s.jsx("p",{className:"quiet saved-tree-lead",children:p?`${ee.savedSub} you can still say.`:"Each learning is its own unit: claim · reason · source · anchor · picture · tool."}),s.jsx("div",{className:"card-grid",children:Mw(c).map(L=>{const v=yl(L),S=i0(v),_=c.memory[v.id];return s.jsxs("article",{id:`learn-${v.id}`,className:"dossier is-open is-stored",children:[s.jsxs("p",{className:"eyebrow",children:["Stored · ",v.source]}),v.picture?s.jsx(qt,{gem:v.picture,size:"sm"}):null,s.jsx("h3",{children:p?hn(v.id,v.claim):v.claim}),Tl(c.lessonScore?.[v.id])?s.jsx("p",{className:"quiet",children:Tl(c.lessonScore?.[v.id])}):null,p?null:s.jsx("p",{children:v.reason}),s.jsxs("p",{className:"learning-store",children:[v.picture?s.jsx(qt,{gem:v.picture,size:"sm"}):null,s.jsx("span",{children:p?Gg({...v,tool:S}):`Anchored to ${v.anchor}${v.beat?` · pictured as ${v.beat}`:""}${S?` · deploys as ${S}`:""}`})]}),_?s.jsx("p",{className:"quiet",children:_o(_,w,p)}):null,p?null:s.jsx(Pn,{id:v.id,surface:"journal",why:v.reason,source:v.source})]},v.id)})})]}):null,p?null:s.jsxs(s.Fragment,{children:[s.jsxs(jo,{className:"journal-chapter",startOpen:Q?.areaId==="daily-trail"||c.learnings.length===0&&!Q,children:[s.jsx(Co,{who:"juniper",label:p?"Juniper’s pages":"Trail notes",count:N.length}),s.jsx("p",{className:"quiet saved-tree-lead",children:p?"They open when you come back, not only when you finish a street.":"They open when you return, not only when you clear a district."}),s.jsx("div",{className:"card-grid",children:N.map(L=>s.jsx(bg,{entry:L,open:c.journal.includes(L.id),focused:a===L.id,mystery:!0,daysWalked:c.dailyDates.length,stars:c.stars[L.unlockAfter]??c.stars[L.id],held:c.held.includes(L.unlockAfter)||c.held.includes(L.id),score:c.lessonScore?.[L.unlockAfter]??c.lessonScore?.[L.id],trace:c.memory[L.unlockAfter]??c.memory[L.id],learning:hs(c,L.unlockAfter)??hs(c,L.id),today:w},L.id))})]}),s.jsxs(jo,{className:"journal-chapter",startOpen:!!(Q&&Q.areaId!=="daily-trail"),children:[s.jsx(Co,{who:"river",label:"Places",count:z.reduce((L,v)=>L+v.entries.length,0)}),s.jsx("p",{className:"quiet saved-tree-lead",children:p?"Pages from each street you walked. Tap a street to open it.":"District chapters. Unsealed pages keep the claim."}),z.map(({area:L,entries:v})=>s.jsxs(jo,{className:"saved-tree-nested",startOpen:Q?.areaId===L.id,children:[s.jsx(Co,{who:Eo(L.id).id,label:L.shortTitle,count:v.length}),s.jsxs("p",{className:"quiet saved-tree-lead",children:[Eo(L.id).name," · ",L.subtitle]}),s.jsx("div",{className:"card-grid",children:v.map(S=>s.jsx(bg,{entry:S,open:c.journal.includes(S.id),focused:a===S.id,stars:c.stars[S.unlockAfter],held:c.held.includes(S.unlockAfter),score:c.lessonScore?.[S.unlockAfter],trace:c.memory[S.unlockAfter],learning:hs(c,S.unlockAfter),today:w},S.id))})]},L.id))]})]}),p?null:s.jsx(mu,{}),s.jsx("button",{type:"button",className:"btn ghost",onClick:()=>r({name:"hub"}),children:p?ee.home:"Return to the map"})]})}function bg({entry:a,open:o,focused:r,mystery:c,daysWalked:d=0,stars:u,held:g,score:y,trace:p,learning:w,today:T}){const{recordHeld:b,recordReview:x,recordLessonHold:N,snoozeReviews:z,progress:I}=Ge(),$=ye(I),X=bw(a.unlockAfter),te=a.unlockAfter,se=Og(te,za(I,te))??qg(a.unlockAfter,a.id),oe=p?Jo(p,T):!1,[re,B]=H.useState(g?"read":"recall"),[F,ne]=H.useState(!!(r&&o&&se&&(!g||oe)));return s.jsx("article",{id:a.id,className:`dossier ${o?"is-open":c?"is-mystery":"is-sealed"} ${r?"is-focus":""} ${g?"is-held":""} ${oe?"is-due":""}`,children:o?s.jsxs(s.Fragment,{children:[s.jsx(tw,{pillar:a.areaId,compact:!0}),s.jsxs("div",{className:"dossier-marks",children:[u?s.jsx(nw,{count:u,compact:!0,label:Sl(u)}):null,u?s.jsx("span",{className:"held-mark",children:Sl(u)}):null,oe?s.jsx("span",{className:"due-mark",children:"Due this morning"}):null,g&&!oe?s.jsx("span",{className:"held-mark",children:"Held"}):null,Tl(y)?s.jsx("span",{className:"held-mark",children:Tl(y)}):null]}),p&&!oe?s.jsx("p",{className:"quiet",children:_o(p,T,$)}):null,w?s.jsxs("p",{className:"learning-store",children:[w.picture?s.jsx(qt,{gem:w.picture,size:"sm"}):null,s.jsx("span",{children:$?Gg({...yl(w),tool:w.toolId?Ga(w.toolId)?.label??w.toolId:void 0}):`Anchored to ${w.anchor}${yl(w).beat?` · pictured as ${yl(w).beat}`:""}${w.toolId?` · deploys as ${Ga(w.toolId)?.label??w.toolId}`:""}`})]}):null,s.jsx("p",{className:"eyebrow",children:a.kicker}),s.jsx("h3",{children:a.title}),se&&re==="recall"&&!F?s.jsxs(s.Fragment,{children:[s.jsx("p",{className:"quiet",children:"Face-down. Rebuild the line — then the page opens."}),s.jsx("button",{type:"button",className:"btn primary",onClick:()=>ne(!0),children:$?ee.rememberSentence:ot.tapTakeaway})]}):se&&F?s.jsxs(s.Fragment,{children:[s.jsx("p",{className:"eyebrow",children:$?ee.saved:ot.tapTakeaway}),s.jsx(Rl,{brief:se,kicker:oe?ot.tapTakeaway:"Journal recall",mode:oe?"review":"encode",visits:p?.reviews??0,onSkip:oe?Q=>{Q==="not-today"&&z([se.id],T),B("read"),ne(!1)}:void 0,onHeld:Q=>{oe?(x({id:se.id,pillar:a.areaId,kind:"recall",today:T,clean:Q.clean,peeked:!1,elaborated:!1}),Q.clean||N(se.id,!1)):Q.clean?(b(se.id),N(se.id,!0)):N(se.id,!1),B("read"),ne(!1)}}),g?s.jsx("button",{type:"button",className:"text-link",onClick:()=>{ne(!1),B("read")},children:"Read the page"}):null]}):s.jsxs(s.Fragment,{children:[a.body.map(Q=>s.jsx("p",{children:Q},Q)),s.jsx("ul",{className:"sources",children:a.sources.map(Q=>s.jsx("li",{children:Q},Q))}),s.jsx(Pn,{id:a.unlockAfter,surface:"journal"}),se?s.jsx("button",{type:"button",className:"btn ghost",onClick:()=>ne(!0),children:ot.takeaway}):null]})]}):c?s.jsxs(s.Fragment,{children:[s.jsx("p",{className:"eyebrow",children:$?"A hidden page":"A mystery page"}),s.jsx("h3",{children:$?"A page waits here":"A trail note waits here"}),s.jsx("p",{children:X?$?`Walk ${X} morning${X===1?"":"s"} on Today’s Trail to open this — you have ${d}.`:`Walk ${X} distinct morning${X===1?"":"s"} on Today’s Trail to unseal this — you have ${d}.`:$?"Come back for Daily Trail mornings to open this page.":"Return for Daily Trail mornings to unseal this page."}),s.jsx("p",{className:"quiet",children:"The trail waits. Nothing here is taken back."})]}):s.jsxs(s.Fragment,{children:[s.jsx("p",{className:"eyebrow",children:$?"Still closed":"Sealed"}),s.jsx("h3",{children:"A card waits here"}),s.jsx("p",{children:$?"Finish the matching walk to open this page.":"Complete the matching challenge to unseal this page."})]})})}function R2({onNavigate:a}){const{progress:o,saveMeta:r,importSaveText:c,reset:d,setTheme:u,setEasyMode:g}=Ge(),y=ye(o),p=d2(),w=H.useRef(null),[T,b]=H.useState(""),[x,N]=H.useState(""),[z,I]=H.useState(""),$=o.held.length,X=o.journal.length,te=Vk(Qt),se=r.savedAt?`Progress saved on this device · ${oe(r.savedAt)}`:"Progress saved on this device as you walk";function oe(C){const O=new Date(C);return Number.isNaN(O.getTime())?"on this device":O.toLocaleString(void 0,{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})}function re(){const C=qo(o),O=new Blob([JSON.stringify(C,null,2)],{type:"application/json"}),E=`silver-city-save-${Dt()}.json`,Z=URL.createObjectURL(O),L=document.createElement("a");L.href=Z,L.download=E,L.click(),URL.revokeObjectURL(Z),N(`Downloaded ${E}`)}async function B(){const C=P1(qo(o));I(C);try{await navigator.clipboard.writeText(C),N("Share code copied. Paste it under Import on the other device.")}catch{N("Copy failed — the code is in the box below. Select and copy it.")}}function F(C){const O=c(C);if(!O.ok){N(O.error);return}b(""),N("Imported. Stars, journal, and Daily marks are on this device."),a({name:"hub"})}function ne(C){if(!C)return;if(C.size>ou){N("That file is too large to be a Silver City save.");return}if(!window.confirm("Replace the save on this device with the imported one? Anyone with this file can overwrite local progress."))return;const E=new FileReader;E.onload=()=>{F(String(E.result??""))},E.readAsText(C)}function Q(){window.confirm(y?"Reset this walk? That clears saved sentences and connections on this device, then starts Easy at Mercy’s Story Creek line.":"Reset progress? This wipes the save on this device — all held lines, journal pages, Night Watch, and mind-map links — and returns to the start. A backup of this save stays until the next import or reset.")&&(d(),a({name:"welcome"}))}function ge(C){c2(C)}return s.jsxs("main",{className:"settings page",children:[s.jsxs("button",{type:"button",className:"text-link",onClick:()=>a({name:"hub"}),children:["← ",y?ee.home:"The town"]}),s.jsxs("header",{className:"page-head",children:[s.jsx("p",{className:"eyebrow",children:y?`Settings · ${Qt}`:`Settings · V0 · ${Qt}`}),s.jsx("h1",{children:"Progress & support"}),s.jsx("p",{children:se})]}),s.jsxs("section",{className:"settings-card",children:[s.jsx("p",{className:"eyebrow",children:"Reading"}),s.jsx("p",{children:y?s.jsxs(s.Fragment,{children:[ee.claimTeach," Easy mode then says main idea. Shorter sentences and bigger taps. You can switch anytime."]}):s.jsx(s.Fragment,{children:"A claim is the main idea we hold to be true. Easy mode teaches that once, then buttons say main idea. Shorter sentences and bigger taps. The main ideas stay the same — the words around them get plainer."})}),o.easyMode?s.jsx("p",{className:"teach-chip",role:"note",children:ee.mainIdeaTeach}):null,s.jsxs("div",{className:"settings-actions",children:[s.jsx("button",{type:"button",className:`btn ${o.easyMode?"primary":""}`,"aria-pressed":o.easyMode,onClick:()=>g(!0),children:"Easy"}),s.jsx("button",{type:"button",className:`btn ${o.easyMode?"":"primary"}`,"aria-pressed":!o.easyMode,onClick:()=>g(!1),children:"Hard"})]})]}),s.jsxs("section",{className:"settings-card",children:[s.jsx("p",{className:"eyebrow",children:"This device"}),y?s.jsx("p",{children:"This walk is saved on this device."}):s.jsxs("p",{children:["Schema v",r.schemaVersion||oa," · app"," ",Qt," · ",Xk]}),s.jsx("p",{className:"quiet",children:y?`${$} ${ee.savedSub} · ${X} pages · ${o.completed.length} walks`:`${$} held lines · ${X} journal pages · ${o.completed.length} district walks · streak ${o.streak} · local only (no cloud login)`}),y?null:s.jsx("p",{className:"quiet",children:"Offline-first. The same key keeps working across updates; a schema version migrates old saves instead of wiping them."})]}),s.jsxs("details",{className:y?"settings-advanced":"settings-flat",children:[s.jsx("summary",{children:"More"}),y?s.jsxs("section",{className:"settings-card","aria-label":"Town",children:[s.jsx("p",{className:"eyebrow",children:"Town"}),s.jsxs("p",{children:[ee.townSoon," — the map waits until the game is right. Hard still has the streets."]})]}):null,s.jsxs("section",{className:"settings-card",children:[s.jsx("p",{className:"eyebrow",children:"You"}),s.jsx("p",{children:y?`What River has opened — ${ee.saved}, places, people, ${ee.uses}, and ${ee.connections}.`:"River’s unlocks in one place — held ideas, places, people, tools, and mind-map links."}),s.jsx("div",{className:"settings-actions",children:s.jsx("button",{type:"button",className:"btn primary",onClick:()=>a({name:"profile"}),children:"Open Profile"})})]}),s.jsxs("section",{className:"settings-card whats-new","aria-label":"What’s new",children:[s.jsxs("p",{className:"eyebrow",children:["What’s new · ",Qt]}),s.jsx("h2",{children:te.title}),s.jsx("p",{className:"quiet",children:te.when}),s.jsx("ul",{className:"whats-new-list",children:te.items.map(C=>s.jsx("li",{children:C},C))}),vl.length>1&&!y?s.jsxs("details",{className:"whats-new-more",children:[s.jsx("summary",{children:"Earlier drops"}),vl.filter(C=>C.version!==Qt).map(C=>s.jsxs("div",{className:"whats-new-past",children:[s.jsxs("p",{className:"eyebrow",children:[C.version," · ",C.title]}),s.jsx("ul",{className:"whats-new-list",children:C.items.map(O=>s.jsx("li",{children:O},O))})]},C.version))]}):null]}),s.jsxs("section",{className:"settings-card",children:[s.jsx("p",{className:"eyebrow",children:"Look"}),s.jsx("p",{children:"Candy is the default. Switch anytime — the walk and the save stay."}),s.jsx("div",{className:"settings-actions theme-picks",children:["candy","dusk","parchment"].map(C=>s.jsx("button",{type:"button",className:`btn ${o.theme===C?"primary":""}`,"aria-pressed":o.theme===C,onClick:()=>u(C),children:q2(C)},C))})]}),s.jsxs("section",{className:"settings-card",children:[s.jsx("p",{className:"eyebrow",children:"Move to another device"}),s.jsxs("p",{children:["Export a JSON file, or copy a share code. Import ",s.jsx("strong",{children:"replaces"})," the save on this device (a backup of the old one is kept). Treat a share code like a secret for that save — anyone who imports it takes over this walk."]}),s.jsxs("div",{className:"settings-actions",children:[s.jsx("button",{type:"button",className:"btn primary",onClick:re,children:"Export JSON"}),s.jsx("button",{type:"button",className:"btn gold",onClick:()=>{B()},children:"Copy share code"}),s.jsx("button",{type:"button",className:"btn",onClick:()=>w.current?.click(),children:"Import file"})]}),s.jsx("input",{ref:w,type:"file",accept:"application/json,.json,text/plain",hidden:!0,onChange:C=>{ne(C.target.files?.[0]),C.currentTarget.value=""}}),s.jsxs("label",{className:"settings-paste",children:["Paste a share code or JSON",s.jsx("textarea",{value:T,rows:4,spellCheck:!1,placeholder:"SC1.… or a silver-city-save JSON file",onChange:C=>b(C.target.value)})]}),s.jsx("button",{type:"button",className:"btn primary",disabled:!T.trim(),onClick:()=>{window.confirm("Replace the save on this device with the imported one?")&&F(T)},children:"Import pasted save"}),z?s.jsx("textarea",{className:"share-code-out",readOnly:!0,rows:3,value:z,onFocus:C=>C.currentTarget.select()}):null,x?s.jsx("p",{className:"settings-msg",children:x}):null]}),s.jsxs("section",{className:"settings-card",children:[s.jsx("p",{className:"eyebrow",children:"Ad placeholders"}),s.jsxs("p",{children:["Playtest default is off. Placeholders are labeled slots for a later network — they never cover Keep/Toss, the takeaway step, or"," ",y?ee.saved:"Journal","."]}),y?null:s.jsxs("p",{className:"quiet",children:["Product flag ",s.jsx("code",{children:"adsEnabled"})," is ","off"," ","in config. This toggle is a this-device override."]}),s.jsxs("div",{className:"settings-actions",children:[s.jsx("button",{type:"button",className:`btn ${p==="off"||p==="default"&&!pu?"primary":""}`,onClick:()=>ge("off"),children:"Hide slots"}),s.jsx("button",{type:"button",className:`btn ${O2(p)?"gold":""}`,onClick:()=>ge("on"),children:"Show placeholders"})]})]})]}),s.jsxs("details",{className:"settings-card settings-danger",children:[s.jsx("summary",{children:"Danger zone · wipe this device"}),s.jsx("p",{className:"eyebrow",children:"Reset progress"}),s.jsx("p",{children:y?"Wipe this walk on this device — saved sentences and connections — and start Easy at Mercy’s Story Creek line. Export first if you want it back.":"Wipe ALL progress on this device — held lines, journal, Night Watch, and mind-map links — and return to the start. Export first if you want the walk back. This is not on the town screen."}),s.jsx("button",{type:"button",className:"btn",onClick:Q,children:"Reset progress"})]})]})}function O2(a){return a==="on"?!0:a==="off"?!1:pu}function q2(a){return a==="dusk"?"Dusk town":a==="parchment"?"Clean parchment":"Candy"}const D2="Night Watch",P2="Hold the night",G2="Plant love. Turn cheap lines toward heaven.";function z2({onNavigate:a}){const{progress:o,recordNight:r,markMiss:c}=Ge(),d=ye(o),u=Dt(),g=Et(Vy),y=c1(o),p=pw(o),[w,T]=H.useState(()=>p[0]??"love"),b=!0,x=H.useRef(null),[N,z]=H.useState({w:640,h:420}),[I,$]=H.useState(null),X=!1,[te,se]=H.useState(d?"wave":"plant"),[oe,re]=H.useState(()=>[...y]),[B,F]=H.useState(ii),[ne,Q]=H.useState([]),[ge,C]=H.useState(0),[O,E]=H.useState(null),[Z,L]=H.useState([]),[v,S]=H.useState([]),[_,ae]=H.useState(0),[R,k]=H.useState(!1),[M,G]=H.useState(!1),[J,ie]=H.useState(!1),[me,ve]=H.useState(!1),ce=H.useRef(0),{juiceDone:be,afterJuice:Se}=Ll(),he=H.useRef(!1),ze=H.useRef(Se),Ue=H.useRef(c);ze.current=Se,Ue.current=c;const de=H.useRef({raiders:[],spawned:0,downed:0,hearts:ii,planted:oe,cool:{},playing:!1,spawnNow:!1});H.useEffect(()=>{de.current.planted=oe},[oe]),H.useEffect(()=>{!be||he.current||!g||(he.current=!0,r(u))},[be,g,r,u]),H.useEffect(()=>{if(te!=="wave")return;de.current.playing=!0,de.current.raiders=[],de.current.spawned=0,de.current.downed=0,de.current.hearts=ii,de.current.cool={},de.current.spawnNow=!1,Q([]),C(0),F(ii);let le=performance.now(),je=0,Pe=0;const xt=tn=>{if(!de.current.playing)return;const dt=Math.min(.05,(tn-le)/1e3);le=tn,je+=dt;const gt=de.current.raiders.find(Ee=>!Ee.turned)?.id,Hn=de.current.raiders.map(Ee=>{if(Ee.turned){const bs=Ee.turned?Ga(Ee.turned):void 0,lt=bs?Io(bs,o):1;return{...Ee,heavenT:(Ee.heavenT??0)+b1(lt,d)*dt}}return d&&Ee.id===gt?{...Ee}:{...Ee,t:Ee.t+mw(d)*dt}});let un=0;const rt=Hn.filter(Ee=>Ee.turned?!(d||(Ee.heavenT??0)>=1):Ee.t<1?!0:(un+=1,!1));un&&(de.current.hearts=Math.max(0,de.current.hearts-un),F(de.current.hearts),ce.current=0,ae(0),G(!0),window.setTimeout(()=>G(!1),220),Ue.current(Vy));const Ut=d&&rt.some(Ee=>!Ee.turned);if(de.current.spawned<ri&&!Ut&&(de.current.spawnNow||je>=y1(d)||d&&de.current.spawned===0)){de.current.spawnNow=!1,je=0;const Ee=de.current.spawned,ha=l1(o.defense.cleared,Ee);rt.push({id:Ee,t:d?.42:0,text:ha.text,kind:ha.kind}),de.current.spawned+=1}if(de.current.raiders=rt,Q(rt),de.current.hearts<=0){de.current.playing=!1,se("lost");return}if(f1(d,de.current.downed,de.current.spawned,rt.length)){de.current.playing=!1,ie(!0),ze.current();return}Pe=requestAnimationFrame(xt)};return Pe=requestAnimationFrame(xt),()=>{de.current.playing=!1,cancelAnimationFrame(Pe)}},[te,d,o.defense.cleared]),H.useEffect(()=>{const le=x.current;if(!le)return;const je=()=>{const xt=le.getBoundingClientRect();z({w:xt.width,h:xt.height})};je();const Pe=new ResizeObserver(je);return Pe.observe(le),()=>Pe.disconnect()},[te,b,d]);function fe(le){te==="plant"&&re(je=>je.includes(le)?je.length<=1?je:je.filter(Pe=>Pe!==le):[...je,le])}function Ne(le){return le.turned&&le.from?w1(le.from,le.heavenT??0):g1(le.t)}function Oe(le){if(te!=="wave"||J)return;const je=performance.now(),Pe=ld(le,o),xt=d1(Pe);if((de.current.cool[le]??0)+xt>je)return;const tn=rd[le],dt=p.includes(w)?w:"love",gt=hd(dt,Pe,o);let Hn=null,un=gt;for(const lt of de.current.raiders){if(lt.turned)continue;const jn=dd(tn,Ne(lt));jn<=un&&(Hn=lt,un=jn)}if(de.current.cool[le]=je,E(le),ve(!0),window.setTimeout(()=>E(null),280),window.setTimeout(()=>ve(!1),220),!Hn)return;const rt=Ne(Hn),Ut=p1(d,dt,Hn.kind),Ee=ig(o,dt);ce.current+=1;const ha=ce.current;ae(ha),k(!0),window.setTimeout(()=>k(!1),160);const bs={key:je,x:rt.x,y:rt.y,line:d?Ut==="match"?"Yes":"Try Love":Ut==="match"?Ee?Ee.claim:`${cd[dt]} matches`:`${cd[dt]} is weak here`,combo:ha};L(lt=>[...lt.slice(-3),{key:je,from:{x:tn.x,y:tn.y-16},to:rt}]),S(lt=>[...lt.slice(-3),bs]),window.setTimeout(()=>{L(lt=>lt.filter(jn=>jn.key!==je))},280),window.setTimeout(()=>{S(lt=>lt.filter(jn=>jn.key!==je))},620),Ut==="match"?(de.current.raiders=de.current.raiders.map(lt=>lt.id===Hn.id?{...lt,turned:dt,from:rt,heavenT:0,text:"Toward heaven"}:lt),de.current.downed+=1,d&&(de.current.spawnNow=!0)):de.current.raiders=de.current.raiders.map(lt=>lt.id===Hn.id?{...lt,t:Math.max(0,lt.t-.22),text:`${cd[dt]} is weak`}:lt),Q(de.current.raiders),C(de.current.downed)}function ht(){if(te!=="wave"||J)return;let le=null,je=1/0;for(const Pe of de.current.planted){const xt=rd[Pe],tn=hd(p.includes(w)?w:"love",ld(Pe,o),o);for(const dt of de.current.raiders){if(dt.turned)continue;const gt=dd(xt,Ne(dt));gt<=tn&&gt<je&&(je=gt,le=Pe)}}le?Oe(le):d&&$(ee.nightMiss)}function yt(){se(d?"wave":"plant"),ie(!1),Q([]),C(0),F(ii),ce.current=0,ae(0),L([]),S([]),he.current=!1}if(!g)return s.jsx("main",{className:"page",children:s.jsx("p",{children:"The night road is still being staked."})});function _t(le,je){const Pe=Math.min(N.w/640,N.h/420);return{left:(N.w-640*Pe)/2+le*Pe,top:(N.h-420*Pe)/2+je*Pe}}const Lt=be&&J,nt=u1(d,te,J),Pt=nt?m1(ne):void 0,Tt=Pt?_t(Ne(Pt).x,Ne(Pt).y):null;return s.jsxs("main",{className:`defend-page is-puzzle  ${J?"is-win":""} ${R?"is-shake":""} ${M?"is-leak":""} ${me?"is-firing":""} ${d?"is-easy-watch":""} ${nt?"is-easy-tap":""}`,"aria-label":D2,children:[Lt?s.jsxs(s.Fragment,{children:[s.jsxs("article",{className:"stored-line","aria-label":d?"How to use Love":"Love tip",children:[s.jsx("p",{className:"eyebrow",children:d?"How to use Love":"Love tip"}),s.jsx("p",{className:"stored-claim",children:Iy(d)}),d?s.jsx("p",{className:"quiet",children:ee.nightTap}):null]}),s.jsx(Ol,{who:"juniper",line:d?"Night held. Six taps.":"Night held. The road turned toward heaven.",action:d?ee.home:"See the town",onGo:()=>a({name:"hub"})})]}):s.jsxs(s.Fragment,{children:[s.jsx("p",{className:"eyebrow",children:d?"Night Watch":P2}),s.jsx("h1",{className:"defend-title",children:d?ee.nightLead:te==="wave"?"Turn them toward heaven.":G2}),s.jsxs("div",{className:`defend-frame ${R?"is-shake":""} ${J?"is-clear":""}`,children:[s.jsxs("p",{className:"defend-hud","aria-live":"polite",children:[s.jsx("span",{className:"defend-hearts",children:Array.from({length:ii},(le,je)=>s.jsx("span",{className:je<B?"is-on":"",children:"♥"},je))}),s.jsx("span",{className:`defend-count ${!d&&_>1?"is-combo":""}`,children:te==="wave"?d?`TAP ${ge}/${ri}`:_>1?`×${_}  ${ge}/${ri}`:`${ge}/${ri} · TAP`:`${oe.length} lamp${oe.length===1?"":"s"}`})]}),s.jsxs("svg",{ref:x,className:`defend-board ${R?"is-shake":""} ${J?"is-clear":""}`,viewBox:"0 0 640 420",preserveAspectRatio:"xMidYMid meet",role:"img","aria-label":"Night road through Silver City",onClick:()=>{te==="wave"&&ht()},children:[s.jsxs("defs",{children:[s.jsxs("linearGradient",{id:"defend-dusk",x1:"0",y1:"0",x2:"0",y2:"1",children:[s.jsx("stop",{offset:"0%",stopColor:"var(--city-sky-0)"}),s.jsx("stop",{offset:"22%",stopColor:"var(--city-sky-1)"}),s.jsx("stop",{offset:"52%",stopColor:"var(--city-sky-2)"}),s.jsx("stop",{offset:"100%",stopColor:"var(--city-sky-3)"})]}),s.jsxs("linearGradient",{id:"defend-ridge",x1:"0",y1:"0",x2:"0",y2:"1",children:[s.jsx("stop",{offset:"0%",stopColor:"var(--city-ridge-0)"}),s.jsx("stop",{offset:"100%",stopColor:"var(--city-ridge-1)"})]}),s.jsxs("linearGradient",{id:"defend-wood",x1:"0",y1:"0",x2:"0",y2:"1",children:[s.jsx("stop",{offset:"0%",stopColor:"#ffd24a"}),s.jsx("stop",{offset:"100%",stopColor:"#ff9f1a"})]}),s.jsxs("linearGradient",{id:"defend-gold-roof",x1:"0",y1:"0",x2:"0",y2:"1",children:[s.jsx("stop",{offset:"0%",stopColor:"#fff6b8"}),s.jsx("stop",{offset:"100%",stopColor:"#ff9f1a"})]}),s.jsxs("radialGradient",{id:"defend-moon-glow",cx:"50%",cy:"50%",r:"50%",children:[s.jsx("stop",{offset:"0%",stopColor:"#fff6d4",stopOpacity:"1"}),s.jsx("stop",{offset:"55%",stopColor:"#ffcc33",stopOpacity:"0.4"}),s.jsx("stop",{offset:"100%",stopColor:"#ff5a7a",stopOpacity:"0"})]}),s.jsxs("radialGradient",{id:"defend-pool",cx:"50%",cy:"50%",r:"50%",children:[s.jsx("stop",{offset:"0%",stopColor:"#ffcc33",stopOpacity:"0.75"}),s.jsx("stop",{offset:"100%",stopColor:"#ff5a7a",stopOpacity:"0"})]}),s.jsx("clipPath",{id:"defend-face-clip",clipPathUnits:"objectBoundingBox",children:s.jsx("circle",{cx:"0.5",cy:"0.5",r:"0.36"})}),s.jsxs("filter",{id:"defend-glow",x:"-50%",y:"-50%",width:"200%",height:"200%",children:[s.jsx("feGaussianBlur",{stdDeviation:"4",result:"b"}),s.jsxs("feMerge",{children:[s.jsx("feMergeNode",{in:"b"}),s.jsx("feMergeNode",{in:"SourceGraphic"})]})]})]}),s.jsx("rect",{width:"640",height:"420",fill:"url(#defend-dusk)"}),s.jsx("ellipse",{cx:"320",cy:"198",rx:"280",ry:"28",fill:"#ffcc33",opacity:"0.28"}),s.jsx("circle",{cx:"548",cy:"48",r:"32",fill:"url(#defend-moon-glow)"}),s.jsx("circle",{cx:"548",cy:"48",r:"9",fill:"#fff6d8"}),s.jsxs("g",{className:"defend-stars",children:[s.jsx("circle",{cx:"72",cy:"42",r:"1.6"}),s.jsx("circle",{cx:"118",cy:"28",r:"1.2"}),s.jsx("circle",{cx:"510",cy:"36",r:"1.5"}),s.jsx("circle",{cx:"430",cy:"22",r:"1.3"}),s.jsx("circle",{cx:"300",cy:"34",r:"1.1"}),s.jsx("circle",{cx:"196",cy:"50",r:"1.1"}),s.jsx("circle",{cx:"248",cy:"20",r:"0.9"}),s.jsx("circle",{cx:"390",cy:"54",r:"1.2"}),s.jsx("circle",{cx:"88",cy:"68",r:"0.8"})]}),s.jsx("path",{className:"defend-ridge",d:"M-20 210 L80 120 160 168 250 96 340 150 430 78 520 130 660 70 V230 H-20 Z",fill:"url(#defend-ridge)",opacity:"0.92"}),s.jsx("path",{d:"M-20 248 L40 200 120 228 210 176 300 214 410 168 500 206 660 150 V430 H-20 Z",fill:"#3dcc7a",opacity:"0.55"}),s.jsxs("g",{className:"defend-windows",children:[s.jsx("circle",{cx:"156",cy:"214",r:"1.8"}),s.jsx("circle",{cx:"248",cy:"198",r:"1.5"}),s.jsx("circle",{cx:"364",cy:"188",r:"1.6"}),s.jsx("circle",{cx:"476",cy:"196",r:"1.4"})]}),s.jsx("ellipse",{className:"defend-canopy",cx:"96",cy:"268",rx:"28",ry:"16"}),s.jsx("ellipse",{className:"defend-canopy",cx:"214",cy:"252",rx:"22",ry:"13"}),s.jsx("ellipse",{className:"defend-canopy",cx:"402",cy:"246",rx:"24",ry:"14"}),s.jsx("ellipse",{className:"defend-canopy",cx:"528",cy:"258",rx:"20",ry:"12"}),s.jsx("path",{className:"defend-road-bed",d:"M70 310 C 140 300, 200 280, 280 292 C 360 304, 430 286, 560 300"}),s.jsx("path",{className:"defend-road",d:"M70 310 C 140 300, 200 280, 280 292 C 360 304, 430 286, 560 300"}),s.jsx("path",{className:"defend-road-shine",d:"M70 310 C 140 300, 200 280, 280 292 C 360 304, 430 286, 560 300"}),s.jsx("path",{className:"defend-heaven-path",d:"M280 292 C 400 210, 500 90, 572 36"}),s.jsxs("g",{className:"defend-heaven",transform:`translate(${Md.x} ${Md.y})`,children:[s.jsx("circle",{className:"defend-heaven-glow",r:"36"}),s.jsx("path",{className:"defend-heaven-wall",d:"M-28 14 l12-16 10 8 8-12 10 8 10-10 10 14 v16 H-28 Z"}),s.jsx("path",{className:"defend-heaven-gate",d:"M-6 22 v-12 a6 8 0 0 1 12 0 v12"}),s.jsx("text",{className:"defend-heaven-label",y:"-22",textAnchor:"middle",children:"City of Heaven"})]}),s.jsx("path",{d:"M-10 368 Q 180 340 320 358 T 660 372 V430 H-10 Z",fill:"#148a48"}),s.jsxs("g",{className:"defend-porch",transform:"translate(564 292)",children:[s.jsx("path",{d:"M-20 22 h40 l5 7 H-25 Z"}),s.jsx("rect",{x:"-16",y:"-4",width:"32",height:"26",rx:"2"}),s.jsx("rect",{className:"defend-porch-window",x:"-5",y:"4",width:"10",height:"9",rx:"1"})]}),nt?null:s.jsxs("g",{className:"defend-gate",transform:`translate(${li[0].x} ${li[0].y})`,children:[s.jsx("path",{d:"M-10 6 V-16 M10 6 V-16"}),s.jsx("path",{d:"M-12 -16 H12"})]}),nt?null:y.map(le=>{const je=rd[le],Pe=oe.includes(le),xt=ld(le,o),tn=tt.find(gt=>gt.id===le),dt=te==="wave"&&Pe&&ne.some(gt=>!gt.turned&&dd(je,Ne(gt))<=hd(p.includes(w)?w:"love",xt,o));return s.jsxs("g",{"data-person-node":"pad",className:`defend-pad is-${xt} ${Pe?"is-planted":""} ${dt?"is-hot":""} ${O===le?"is-flash":""}`,transform:`translate(${je.x} ${je.y})`,role:"button",tabIndex:0,"aria-label":te==="plant"?`${Pe?"Pull":"Plant"} lamp at ${tn?.title??le}`:`Fire ${tn?.title??le}`,onClick:gt=>{gt.stopPropagation(),te==="plant"?fe(le):Oe(le)},onKeyDown:gt=>{(gt.key==="Enter"||gt.key===" ")&&(gt.preventDefault(),te==="plant"?fe(le):Oe(le))},children:[s.jsx("circle",{className:"defend-hit",r:"38"}),s.jsx("ellipse",{className:"defend-earth",cx:"0",cy:"10",rx:"15",ry:"6"}),Pe?s.jsxs(s.Fragment,{children:[s.jsx("ellipse",{className:"defend-pool",cx:"0",cy:"12",rx:dt?30:20,ry:dt?11:7}),s.jsx("path",{className:"defend-post",d:"M-2.4 10 V-18 H2.4 V10 Z",fill:"url(#defend-wood)"}),s.jsx("path",{className:"defend-lantern-roof",d:"M-8 -18 l8 -7 8 7 Z",fill:"url(#defend-gold-roof)"}),s.jsx("rect",{className:"defend-lantern",x:"-6.5",y:"-18",width:"13",height:"11",rx:"2"}),s.jsx("circle",{className:"defend-lamp",cx:"0",cy:"-13",r:"4.6"}),dt?s.jsx("circle",{className:"defend-hot-halo",r:"27"}):null]}):s.jsxs(s.Fragment,{children:[s.jsx("circle",{className:"defend-ring",r:"16"}),s.jsx("path",{className:"defend-post is-empty",d:"M-1.6 8 V-8 H1.6 V8 Z"})]})]},le)}),Z.map(le=>s.jsxs("g",{className:"defend-shot",children:[s.jsx("line",{className:"defend-beam",x1:le.from.x,y1:le.from.y,x2:le.to.x,y2:le.to.y}),s.jsx("circle",{className:"defend-impact",cx:le.to.x,cy:le.to.y,r:"22"})]},le.key)),d?null:ne.map(le=>{const je=Ne(le);return s.jsxs("g",{className:`defend-raider ${le.turned?"is-turned":""}`,transform:`translate(${je.x} ${je.y})`,children:[s.jsx("ellipse",{className:"defend-raider-shadow",cy:12,rx:13,ry:4.6}),s.jsx("image",{className:"defend-raider-face",href:xx(le.kind),x:-18,y:-24,width:36,height:36,clipPath:"url(#defend-face-clip)"}),le.turned?s.jsxs("g",{className:"defend-heaven-cheer","aria-hidden":!0,children:[s.jsx("circle",{className:"defend-cheer-spark",cx:"-10",cy:"-18",r:"2.2"}),s.jsx("circle",{className:"defend-cheer-spark is-2",cx:"12",cy:"-20",r:"1.8"}),s.jsx("circle",{className:"defend-cheer-spark is-3",cx:"2",cy:"-26",r:"1.4"})]}):null,s.jsxs("g",{className:"defend-raider-call",children:[s.jsx("rect",{x:-40,y:-42,width:80,height:28,rx:"8"}),s.jsx("text",{className:"defend-raider-kind",y:-32,textAnchor:"middle",children:Nx[le.kind]}),s.jsx("text",{y:-20,textAnchor:"middle",children:le.text})]})]},le.id)}),v.map(le=>s.jsxs("g",{className:"defend-blast",transform:`translate(${le.x} ${le.y})`,children:[s.jsx("circle",{className:"defend-blast-ring",r:"26"}),s.jsx("circle",{className:"defend-blast-core",r:"10"}),s.jsx("path",{className:"defend-shard",d:"M-2 -4 L4 -28 L8 -6 Z"}),s.jsx("path",{className:"defend-shard is-2",d:"M4 2 L28 8 L8 8 Z"}),s.jsx("path",{className:"defend-shard is-3",d:"M-4 4 L-26 16 L-8 8 Z"}),s.jsx("path",{className:"defend-shard is-4",d:"M2 6 L10 26 L-2 10 Z"}),!d&&le.combo>1?s.jsxs("text",{className:"defend-combo-pop",y:"-34",textAnchor:"middle",children:["×",le.combo]}):null,s.jsx("text",{className:"defend-blast-line",y:"28",textAnchor:"middle",children:le.line})]},le.key))]}),nt&&Pt&&Tt?s.jsx("div",{className:"easy-walkers","aria-label":"Tap the walking person",children:s.jsxs("button",{type:"button","data-person-node":"walker",className:"easy-walker is-easy-walker is-cue",style:{left:Tt.left,top:Tt.top,width:Qy,height:Qy},onClick:le=>{le.stopPropagation(),ht()},children:[s.jsx("span",{className:"easy-walker-arrow","aria-hidden":!0,children:"▼"}),s.jsx("span",{className:"easy-walker-cue-label",children:ee.nightTap}),s.jsx(Tx,{kind:Pt.kind,className:"easy-walker-face",style:{width:Xy,height:Xy}})]})}):null]}),te==="plant"?s.jsx("button",{type:"button",className:"btn primary xl defend-go",onClick:()=>se("wave"),disabled:oe.length<1||X,children:d?ee.nightDo:"The road is coming"}):null,I?s.jsx("p",{className:"match-toast",role:"status",children:I}):null,s.jsx("div",{className:"defend-abilities",role:"group","aria-label":"Night abilities",children:ca.map(le=>{const je=p.includes(le.id),Pe=ig(o,le.id),xt=Io(le,o);return s.jsxs("button",{type:"button",className:`defend-ability ${w===le.id?"is-on":""} ${je?"":"is-locked"} ${me&&w===le.id?"is-firing":""}`,"aria-pressed":w===le.id,onClick:()=>{if(je){$(null),T(le.id);return}$(d?ee.nightMiss:`${le.label} is locked. Hold a matching line to deploy this tool.`)},children:[s.jsx(pi,{ability:le.id,size:"md"}),le.label,nt?null:s.jsx("span",{className:"defend-ability-tier","aria-hidden":!0,children:Zd[xt]}),s.jsx("span",{className:"defend-ability-claim",children:je?le.id==="love"?Iy(d):Pe?d?hn(Pe.id,Pe.claim):Pe.claim:d?"Keep a main idea to name this tool.":"Hold a line to name this tool.":d?"Locked — tap the glowing face":"Hold a matching line"})]},le.id)})}),te==="lost"?s.jsxs("div",{className:"defend-lost",children:[s.jsx("p",{children:d?"You missed. Tap the face.":"Porch flickered. Turn them again."}),s.jsx("button",{type:"button",className:"btn primary",onClick:yt,children:"Try the night again"})]}):null,d?te==="lost"?null:s.jsx("p",{className:"defend-tip",children:ee.nightTap}):te==="wave"?s.jsx("p",{className:"defend-tip",children:"Match the walker. Deploy the held argument — the wrong tool only nudges."}):s.jsx("p",{className:"defend-tip",children:"Learn · hold · deploy. Love is ready. Logic, reason, and science unlock as you keep lines."})]}),s.jsx(ws,{play:J&&!be,stamp:"Night held!"})]})}function J2({onNavigate:a}){const{progress:o,recordTaught:r}=Ge(),c=ye(o),d=OT(o),u=Et(d);function g(){r(d),a({name:"hub"})}return s.jsxs("main",{className:"challenge-page is-teach","aria-label":ot.playGoal,children:[s.jsxs("button",{type:"button",className:"text-link",onClick:()=>a({name:"hub"}),children:["← ",c?ee.home:"The town"]}),u?s.jsx(du,{brief:u,kind:"link",unlock:ee.learnCta,onUnlock:g}):s.jsxs("section",{className:"recall-gate is-encode teach-gate",children:[s.jsx("p",{className:"quiet",children:ee.readStoryFirst}),s.jsx("button",{type:"button",className:"btn primary xl",onClick:()=>a({name:"hub"}),children:ee.home})]})]})}function _2({easy:a}){return s.jsxs("div",{className:"link-demo","aria-label":"How to match",children:[s.jsxs("div",{className:"link-demo-row",children:[s.jsx("span",{className:"link-demo-step is-idea",children:a?"Sentence":"Idea"}),s.jsx("span",{className:"link-demo-arrow","aria-hidden":!0,children:"→"}),s.jsx("span",{className:"link-demo-step is-place",children:"Place"}),s.jsx("span",{className:"link-demo-arrow","aria-hidden":!0,children:"→"}),s.jsx("span",{className:"link-demo-step is-person",children:"Person"})]}),s.jsx("p",{className:"next-tap",children:a?ee.connectLink:"Tap idea → place → person"})]})}function U2({onNavigate:a}){const{completeChallenge:o,markMiss:r,progress:c,recordStreetLinks:d}=Ge(),{juiceDone:u,afterJuice:g}=Ll(),y=H.useRef(!1),p=H.useRef(void 0),[w,T]=H.useState(()=>ye(c)&&vd(c)),[b,x]=H.useState(!1),N=ye(c),z=c.streetLinked??[],I=N?void 0:Xd(z),$=N?ZT(Jg(c)):$T(z),X=I?kd(z,I.triples.map(F=>F.id)).length:z.length,te=pl(kd(z,I?.triples.map(F=>F.id)??[])),se=N?void 0:I?{place:I.placeTitle,linkedAfter:X,total:zn.length,left:te}:void 0;function oe(){y.current||(y.current=!0,o("street",$.id))}function re(){if(g(),N){oe();return}if(y.current)return;y.current=!0,p.current=I;const F=$.triples.map(ne=>ne.id);d(F)}function B(F){oe(),a(F==="hold"?Kd(c):{name:"hub"})}return s.jsxs("main",{className:`challenge-page ${u?"is-after":w?"is-puzzle":"is-teach"} ${b?"is-arming":""}`,"aria-label":ot.playGoal,children:[s.jsxs("button",{type:"button",className:"text-link",onClick:()=>a({name:"hub"}),children:["← ",N?ee.home:"The town"]}),!u&&N&&!vd(c)?s.jsxs("section",{className:"recall-gate is-encode teach-gate","aria-label":ee.learnThisFirst,children:[s.jsx("p",{className:"recall-line rehearse-stem",children:ee.learnThisFirst}),s.jsx("p",{className:"quiet",children:ee.readStoryFirst}),s.jsx("button",{type:"button",className:"btn primary xl",onClick:()=>a({name:"learn"}),children:ee.learnCta})]}):u?s.jsxs("section",{className:"after-win",children:[s.jsxs("article",{className:"stored-line is-spoken","aria-label":"Street takeaway",children:[s.jsx("p",{className:"eyebrow",children:"Say this out loud"}),s.jsx("p",{className:"stored-claim",children:"An idea lives at a place, with a person."}),s.jsx("p",{className:"link-takeaway",children:N?"Mercy tells Jesus stories at the creek — that is why the neighbor who stops on the road lives at Story Creek. Silas copies names on the square — that is why the old shared belief lives at Witness Square. Juniper’s lamp is on the porch so today’s line can be seen.":KT(p.current,pl(c.streetLinked??[]))}),s.jsx(Pn,{id:$.id,compact:!0})]}),s.jsx(Ol,{who:"juniper",line:N?`Your matches wait in ${ee.saved}.`:pl(c.streetLinked??[])>0?"Continue from Town when you want one more round.":"Tap a place on the map — the mind map holds what you linked.",action:N?`See ${ee.saved}`:"See the town",onGo:()=>a(N?{name:"journal"}:{name:"hub"})})]}):w?s.jsxs(s.Fragment,{children:[N?null:s.jsx("h1",{className:"puzzle-title",children:$.title}),s.jsx(hu,{challenge:$,onMiss:()=>r($.id),onSolved:re,onEasyStop:B,streetBeat:se})]}):s.jsxs("section",{className:"recall-gate is-encode teach-gate","aria-label":N?ee.connectLink:"Unlock the links",children:[N?null:s.jsx("p",{className:"eyebrow",children:"Match idea · place · person."}),s.jsx("p",{className:"recall-line rehearse-stem",children:N?ee.connectLink:"Link the idea to its place and person."}),s.jsx(_2,{easy:N}),N?null:s.jsx(Do,{id:$.id}),s.jsx("p",{className:"quiet",children:N?`You’ll keep them in ${ee.saved}.`:I?`Tonight’s street is ${I.placeTitle} — ${I.triples.length} fact${I.triples.length===1?"":"s"}, not the whole catalog. ${z.length} of ${zn.length} facts already linked.`:"Each match lights a spot on the town map. Tap the place later to open that idea again."}),N?null:s.jsx("ul",{className:"word-school street-whys","aria-label":"Why each place",children:tx.map(F=>s.jsx("li",{children:F},F))}),N?null:s.jsx("ol",{className:"teach-beats",children:ex.map(F=>s.jsx("li",{children:F},F))}),s.jsx("button",{type:"button",className:"btn primary xl",onClick:()=>{T(!0),x(!0),window.setTimeout(()=>x(!1),360)},children:N?"Start":I&&z.length>0?ee.continueStreet:"Unlock the links"})]})]})}function B2(a){return a&&tt.some(o=>o.id===a)?a:null}function vg(a,o){const r=Nt.find(c=>c.unlockAfter===o);return r&&a.journal.includes(r.id)?{name:"journal",focusId:r.id}:hs(a,o)?{name:"journal",focusId:`learn-${o}`}:{name:"journal",focusId:r?.id??o}}function fd(a){return{name:"hub",mindPlot:a}}function F2(a,o){if(o==="ln-street"||o==="td-watch")return;const r=Et(o),c=hs(a,o),d=r?.claim??c?.claim;if(d)return{id:o,claim:d,reason:r?.reason??c?.reason??"",source:r?.source??c?.source??"",held:(a.held??[]).includes(o),stored:!!c}}function $2(a){const o=new Set,r=[];function c(b){if(o.has(b))return;const x=F2(a,b);x&&(o.add(b),r.push(x))}for(const b of Mw(a))c(b.id);for(const b of[...a.held??[]].reverse())c(b);for(const b of a.completed??[])mi(a,b)&&c(b);const d=tt.filter(b=>us(b.id,a)!=="empty"?!0:(au[b.id]??[]).some(N=>mi(a,N))).map(b=>({id:b.id,title:b.title,blurb:b.blurb,stage:us(b.id,a)})),u=[],g=new Set;for(const b of d){const x=la(b.id).who;if(x==="river"||g.has(x))continue;g.add(x);const N=en[x];u.push({id:x,name:N.name,role:N.role,plotId:b.id,placeTitle:b.title})}const y=ca.map(b=>({id:b.id,label:b.label,tierMark:Zd[Io(b,a)]??"",unlocked:aw(b,a)})),p=su(a),w=p?Da.triples.map(b=>{const x=Da.nodes.find(I=>I.id===b.ideaId),N=Da.nodes.find(I=>I.id===b.placeId),z=Da.nodes.find(I=>I.id===b.personId);return{id:b.id,idea:x?.text??b.ideaId,place:N?.text??b.placeId,person:z?.text??b.personId,evidenceId:x?.evidenceId,plotId:B2(N?.plotId)??void 0}}):[],T=y.filter(b=>b.unlocked).length;return{ideas:r,places:d,people:u,tools:y,links:w,streetLinked:p,learned:(a.completed??[]).filter(b=>b!=="ln-street").length,held:(a.held??[]).length,deployed:T+(a.defense?.cleared??0)}}function K2({onNavigate:a}){const{progress:o}=Ge(),r=ye(o),c=$2(o),d=en.river;return s.jsxs("main",{className:"profile page",children:[s.jsxs("button",{type:"button",className:"text-link",onClick:()=>a({name:"hub"}),children:["← ",r?ee.home:"The town"]}),s.jsxs("header",{className:"profile-hero",children:[s.jsx(it,{who:"river",size:"xl"}),s.jsxs("div",{children:[s.jsxs("p",{className:"eyebrow",children:["You · ",d.shortName]}),s.jsx("h1",{children:d.name}),s.jsxs("p",{className:"quiet",children:[d.role," · ",d.seeking]}),s.jsx("p",{className:"memory-pipe",children:r?`Learn ${c.learned} · Hold ${c.held} · Use ${c.deployed}`:`Learn ${c.learned} · Hold ${c.held} · Deploy ${c.deployed}`})]})]}),s.jsx(xo,{startOpen:!0,label:r?ee.saved:"Held ideas",lead:r?"These are the main ideas you kept.":"Claims you still hold — reason and source stay with the line.",count:c.ideas.length,children:c.ideas.length===0?s.jsx("p",{className:"quiet",children:"Walk the Trail, then Hold the takeaway — lines you keep land here."}):c.ideas.map(u=>s.jsxs("article",{className:"profile-unlock",children:[s.jsxs("button",{type:"button",className:"profile-unlock-hit",onClick:()=>a(vg(o,u.id)),children:[s.jsxs("p",{className:"eyebrow",children:[r?u.held?ee.saved:u.stored?"Kept":"Walked":u.held?"Held":u.stored?"Stored":"Walked"," ","· ",u.source]}),s.jsx("strong",{children:r?hn(u.id,u.claim):u.claim}),s.jsx(Do,{id:u.id}),r?null:s.jsx("p",{children:u.reason})]}),s.jsx(Pn,{id:u.id,surface:"profile",compact:!0})]},u.id))}),s.jsx(xo,{label:"Places",lead:"Lots that remember you.",count:c.places.length,children:c.places.map(u=>s.jsx("article",{className:"profile-unlock",children:s.jsxs("button",{type:"button",className:"profile-unlock-hit",onClick:()=>a(fd(u.id)),children:[s.jsx("p",{className:"eyebrow",children:r?u.stage==="scaffold"?"Wood up":u.stage==="empty"?"Empty lot":u.stage==="lit"?"Lamps on":"House up":u.stage}),s.jsx("strong",{children:r&&u.id==="journal"?"River’s pages":u.title}),s.jsx("p",{children:r&&u.id==="bench"?"Silas copies names on the square. Public names, not stories.":u.blurb})]})},u.id))}),s.jsx(xo,{label:"People",lead:"Who walks with you.",count:c.people.length,children:c.people.length===0?s.jsx("p",{className:"quiet",children:"Juniper waits on the east porch."}):c.people.map(u=>s.jsx("article",{className:"profile-unlock",children:s.jsxs("button",{type:"button",className:"profile-unlock-hit is-person",onClick:()=>a(fd(u.plotId)),children:[s.jsx(it,{who:u.id,size:"sm"}),s.jsxs("span",{children:[s.jsx("strong",{children:u.name}),s.jsxs("p",{children:[u.role," · ",u.placeTitle]})]})]})},u.id))}),s.jsx(xo,{label:r?ee.uses:"Tools",lead:r?"Tools wait until later.":"What you can deploy on Night Watch.",count:c.tools.length,children:c.tools.map(u=>s.jsx("article",{className:`profile-unlock ${u.unlocked?"":"is-dim"}`,children:u.unlocked?r?s.jsxs("p",{className:"profile-unlock-hit is-tool",children:[s.jsx(pi,{ability:u.id,size:"sm"}),s.jsxs("span",{children:[s.jsxs("strong",{children:[u.label," ",u.tierMark]}),s.jsx("p",{children:"Saved for later."})]})]}):s.jsxs("button",{type:"button",className:"profile-unlock-hit is-tool",onClick:()=>a({name:"defend"}),children:[s.jsx(pi,{ability:u.id,size:"sm"}),s.jsxs("span",{children:[s.jsxs("strong",{children:[u.label," ",u.tierMark]}),s.jsx("p",{children:"Night Watch · Learn → Hold → Deploy"})]})]}):s.jsxs("p",{className:"profile-unlock-hit is-tool is-locked",children:[s.jsx(pi,{ability:u.id,size:"sm"}),s.jsxs("span",{children:[s.jsx("strong",{children:u.label}),s.jsx("em",{children:r?"Still closed — keep a main idea that opens it.":"Still locked — hold a line that opens it."})]})]})},u.id))}),s.jsx(xo,{label:r?ee.connections:"Connections",lead:r?"Places you matched.":"Idea · place · person — lit nodes reopen here.",count:c.streetLinked?c.links.length:0,children:c.streetLinked?c.links.map(u=>s.jsxs("article",{className:"profile-unlock",children:[s.jsxs("button",{type:"button",className:"profile-unlock-hit",onClick:()=>a(u.evidenceId?vg(o,u.evidenceId):u.plotId?fd(u.plotId):{name:"hub"}),children:[s.jsx("p",{className:"eyebrow",children:u.place}),s.jsx("strong",{children:u.idea}),s.jsx("p",{children:u.person})]}),u.evidenceId?s.jsx(Pn,{id:u.evidenceId,surface:"profile",compact:!0}):null]},u.id)):s.jsx("p",{className:"quiet",children:r?`${ee.matchHunt} Then Hold the line.`:"Link the street from Town to snap idea · place · person. Lit nodes reopen here."})})]})}function xo({startOpen:a=!1,label:o,lead:r,count:c,children:d}){return s.jsxs(jo,{startOpen:a,className:"profile-section",children:[s.jsx(Co,{label:o,count:c}),r?s.jsx("p",{className:"quiet saved-tree-lead",children:r}):null,d]})}function Y2({onNavigate:a}){const{progress:o}=Ge();return s.jsxs("main",{className:"vista",children:[s.jsx("div",{className:"cast-row vista-cast",children:Object.keys(en).map(r=>s.jsx(it,{who:r,size:"lg"},r))}),s.jsx("p",{className:"eyebrow",children:"The trail does not end"}),s.jsx("h1",{children:"You have walked the five districts"}),s.jsx(ew,{who:"hope",line:aT}),s.jsx("p",{className:"lede",children:"Parables, testimony, a habitable cosmos, a first cause, and the inward clues of duty, mind, meaning, and beauty. None of these, alone, is the whole case. Together they are a coherent invitation: the world is the sort of place that looks authored — and a particular history claims that the Author has spoken."}),s.jsxs("p",{children:["Held lines: ",o.held.length," · Insight ",kw(o)," · Journal ",o.journal.length,"/",cx," · First-try"," ",o.firstTry.length]}),s.jsxs("blockquote",{children:["“The heavens declare the glory of God, and the sky above proclaims his handiwork.”",s.jsx("cite",{children:"Psalm 19:1"})]}),s.jsxs("div",{className:"welcome-actions",children:[s.jsx("button",{type:"button",className:"btn primary xl",onClick:()=>a({name:"journal"}),children:"Sit with the journal"}),s.jsx("button",{type:"button",className:"btn ghost",onClick:()=>a({name:"hub"}),children:"Return to the town"}),s.jsx(mu,{})]}),s.jsx("ul",{className:"vista-list",children:Mt.map(r=>s.jsx("li",{children:r.title},r.id))})]})}function V2({onNavigate:a}){const{progress:o,start:r,setEasyMode:c}=Ge(),d=Dt(),u=o.started&&Si(o,d);function g(){if(r(),o.easyMode){a(Go(o,xl)?{name:"hub"}:{name:"learn"});return}if(u){a({name:"hub"});return}a({name:"daily"})}return s.jsxs("main",{className:"welcome is-onescreen is-alive",children:[s.jsx("div",{className:"welcome-sky","aria-hidden":!0}),s.jsx("div",{className:"welcome-ridge","aria-hidden":!0}),s.jsxs("div",{className:"welcome-hero",children:[o.easyMode?null:s.jsx(Dw,{mode:"poster",onNavigate:a}),s.jsx("p",{className:"eyebrow",children:"60 seconds"}),s.jsxs("h1",{children:["Silver City",s.jsx("span",{children:"Unending Evidence"})]}),o.easyMode?null:s.jsx("p",{className:"welcome-goal",children:ot.purpose}),o.easyMode?null:s.jsx("p",{className:"welcome-who",children:ot.who}),s.jsxs("div",{className:"welcome-cast",children:[s.jsxs("figure",{children:[s.jsx(it,{who:"river",size:"lg"}),s.jsx("figcaption",{children:"YOU · RIVER"})]}),s.jsx("span",{className:"welcome-lantern","aria-hidden":!0}),s.jsxs("figure",{children:[s.jsx(it,{who:"juniper",size:"lg"}),s.jsx("figcaption",{children:"GUIDE · JUNIPER"})]})]}),s.jsxs("div",{className:"welcome-actions",children:[s.jsx("p",{className:"eyebrow",children:"Reading"}),s.jsxs("div",{className:"settings-actions",children:[s.jsx("button",{type:"button",className:`btn ${o.easyMode?"primary":""}`,"aria-pressed":!!o.easyMode,onClick:()=>c(!0),children:"Easy"}),s.jsx("button",{type:"button",className:`btn ${o.easyMode?"":"primary"}`,"aria-pressed":!o.easyMode,onClick:()=>c(!1),children:"Hard"})]}),s.jsx("p",{className:"quiet welcome-easy-note",children:o.easyMode?"Easier words · bigger taps. You can change this in Settings.":"Hard keeps the full voice. You can switch anytime in Settings → Reading. We teach hard words first — a claim is the main idea we hold to be true."}),o.easyMode?s.jsx("p",{className:"teach-chip",role:"note",children:ee.claimTeach}):null,s.jsx("button",{type:"button",className:"btn primary xl",onClick:g,children:o.easyMode?u?ee.home:"Play":u?"Back to town":"Begin the trail"}),s.jsx("p",{className:"welcome-version",children:o.easyMode?Qt:`V0 · ${Qt}`})]})]})]})}function X2(){if(typeof window>"u")return!1;const a=`${window.location.hash} ${window.location.search} ${window.location.pathname}`;return/defend|night-?watch/i.test(a)}function Q2(){const{progress:a}=Ge(),o=ye(a),[r,c]=H.useState(()=>{const u=a.completed.length>0||!!a.lastDailyDate;return a.started&&u?{name:"hub"}:{name:"welcome"}});function d(u){if(o&&u.name==="defend"){c({name:"hub"});return}c(u)}return H.useEffect(()=>{o&&(r.name==="defend"||X2())&&c({name:"hub"})},[o,r.name]),H.useEffect(()=>{window.scrollTo({top:0,behavior:"smooth"})},[r]),H.useEffect(()=>{const u=a.theme??"candy";document.documentElement.dataset.theme=u,document.documentElement.style.colorScheme=u==="parchment"?"light":"dark",document.documentElement.dataset.easy=a.easyMode?"on":"off"},[a.theme,a.easyMode]),H.useEffect(()=>{if(r.name!=="journal"||!r.focusId||r.autoQuiz)return;document.getElementById(r.focusId)?.scrollIntoView({behavior:"smooth",block:"center"})},[r]),s.jsxs(Q1,{view:r,onNavigate:d,children:[r.name==="welcome"?s.jsx(V2,{onNavigate:d}):null,r.name==="hub"?s.jsx(W2,{onNavigate:d,openPlot:r.mindPlot}):null,r.name==="daily"?s.jsx(n2,{onNavigate:d}):null,r.name==="area"?s.jsx(X1,{areaId:r.areaId,onNavigate:d}):null,r.name==="challenge"?s.jsx(t2,{areaId:r.areaId,challengeId:r.challengeId,onNavigate:d},`${r.areaId}-${r.challengeId}`):null,r.name==="journal"?s.jsx(I2,{focusId:r.focusId,autoQuiz:r.autoQuiz,onNavigate:d}):null,r.name==="vista"?s.jsx(Y2,{onNavigate:d}):null,r.name==="settings"?s.jsx(R2,{onNavigate:d}):null,r.name==="defend"&&!o?s.jsx(z2,{onNavigate:d}):null,r.name==="link"?s.jsx(U2,{onNavigate:d}):null,r.name==="learn"?s.jsx(J2,{onNavigate:d}):null,r.name==="profile"?s.jsx(K2,{onNavigate:d}):null]})}function Z2({children:a}){const[o,r]=H.useState(()=>ng().progress),[c,d]=H.useState(()=>ng().meta),[u,g]=H.useState([]),y=H.useCallback(C=>{const O=Cd(C);r(C),d(O)},[]),p=H.useCallback(C=>(d(Cd(C)),C),[]),w=H.useCallback(()=>{r(C=>{So(_d(C));const O={...C,started:!0,lastAreaId:C.lastAreaId??"parable-hollow"};return p(O)})},[p]),T=H.useCallback(C=>{g(O=>O.includes(C)?O:[...O,C])},[]),b=H.useCallback(C=>{r(O=>{if(Ln(C))return O;const E=O.held.includes(C)?O.held:[...O.held,C],Z=O.easyMode?Py(O,C):O.easyHeld??[];if(E===O.held&&Z===(O.easyHeld??[]))return O;const L={...O,held:E,easyHeld:Z};return p(L)})},[p]),x=H.useCallback(C=>{let O=1;return r(E=>{const Z=E.memory[C.id],L=Z??Td(C.id,C.pillar,C.today),v=C.peeked||!C.clean;let S=L;C.kind==="encode"?S=Z?{...L,pillar:C.pillar,elaborated:L.elaborated||C.elaborated}:{...Td(C.id,C.pillar,C.today),elaborated:C.elaborated}:v?S=Dx(L,C.today):S=Ox(L,C.today),S={...S,elaborated:S.elaborated||C.elaborated},O=Jy(E.stars[C.id],Px(E.stars[C.id],Z,C,S));const _={...E,memory:{...E.memory,[C.id]:S},stars:{...E.stars,[C.id]:O},held:Ln(C.id)||E.held.includes(C.id)?E.held:[...E.held,C.id],easyHeld:E.easyMode&&!Ln(C.id)?Py(E,C.id):E.easyHeld??[],lastReviewPillar:C.pillar,elaborations:C.text?{...E.elaborations,[C.id]:C.text}:E.elaborations},ae=s0(C,E);return ae&&(_.learnings=Z1(E.learnings??[],ae)),p(_)}),O},[p]),N=H.useCallback((C,O)=>{C.length!==0&&r(E=>{let Z=!1;const L={...E.memory};for(const v of C){const S=L[v];S&&(L[v]=qx(S,O),Z=!0)}return Z?p({...E,memory:L}):E})},[p]),z=H.useCallback((C,O)=>{let E=O;return r(Z=>{if(E=Jy(Z.stars[C],O),Z.stars[C]===E)return Z;const L={...Z,stars:{...Z.stars,[C]:E}};return p(L)}),E},[p]),I=H.useCallback((C,O)=>{const E=$1(O);return r(Z=>{const L=Z.completed.includes(O),v={...Z,started:!0,completed:L?Z.completed:[...Z.completed,O],journal:[...new Set([...Z.journal,...E])],firstTry:L||u.includes(O)||Z.firstTry.includes(O)?Z.firstTry:[...Z.firstTry,O],lastAreaId:C,lastChallengeId:O};return p(v)}),E},[u,p]),$=H.useCallback(C=>{let O=[];return r(E=>{const L=E.dailyDates.includes(C)?E.dailyDates:[...E.dailyDates,C];O=sg(L.length).filter(_=>!E.journal.includes(_));const v=J1(E.lastDailyDate,C,E.streak),S={...E,started:!0,dailyDates:L,lastDailyDate:C,streak:v.streak,bestStreak:Math.max(E.bestStreak,v.streak),journal:[...new Set([...E.journal,...sg(L.length)])]};return p(S)}),O},[p]),X=H.useCallback(C=>{r(O=>{const E=O.defense.nights.includes(C),Z={...O,defense:{cleared:O.defense.cleared+1,nights:E?O.defense.nights:[...O.defense.nights,C],lastNight:C}};return p(Z)})},[p]),te=H.useCallback(C=>{r(O=>O.theme===C?O:p({...O,theme:C}))},[p]),se=H.useCallback(C=>{r(O=>O.easyMode===C?O:p({...O,easyMode:C}))},[p]),oe=H.useCallback(C=>{r(O=>{const E=O.taught??[],Z=E.includes(C)?E:[...E,C],L=O.easyMode?GT(O,C):O.easyTaught??[],v=O.easyMode?{...O.tierTaught??{},[C]:za(O,C)}:O.tierTaught??{};return Z===E&&L===(O.easyTaught??[])&&v[C]===O.tierTaught?.[C]?O:p({...O,taught:Z,easyTaught:L,tierTaught:v})})},[p]),re=H.useCallback((C,O)=>{Ln(C)||r(E=>{const Z=O?CT(E,C):AT(E,C);return p({...E,...Z})})},[p]),B=H.useCallback(C=>{C.length!==0&&r(O=>{const E=kd(O.streetLinked??[],C),L=E.length>=zn.length&&!O.completed.includes("ln-street")?[...O.completed,"ln-street"]:O.completed;return E.length===(O.streetLinked??[]).length&&L===O.completed?O:p({...O,started:!0,streetLinked:E,completed:L,lastAreaId:"street",lastChallengeId:"ln-street"})})},[p]),F=H.useCallback(C=>{r(O=>{const E=Kx(O,C);return E===O?O:p(E)})},[p]),ne=H.useCallback(()=>{g([]),Hy(),tg(),r(C=>{const O={...fl(),theme:C.theme,easyMode:C.easyMode};return p(O)})},[p]),Q=H.useCallback(C=>{const O=G1(C);return O.ok?(tg(),g([]),Hy(),y(O.progress),{ok:!0}):O},[y]),ge=H.useMemo(()=>({progress:o,saveMeta:c,missed:u,start:w,completeChallenge:I,completeDaily:$,recordStars:z,recordHeld:b,recordReview:x,recordLessonHold:re,snoozeReviews:N,markMiss:T,recordNight:X,setTheme:te,setEasyMode:se,recordTaught:oe,recordStreetLinks:B,upgradeBuilding:F,reset:ne,importSaveText:Q}),[I,$,Q,T,u,o,b,X,x,re,N,z,ne,c,oe,B,se,te,w,F]);return s.jsx(Tw.Provider,{value:ge,children:a})}gl.isNativePlatform()||xk({immediate:!0});const zw=document.getElementById("root");if(!zw)throw new Error("Root element missing");bk.createRoot(zw).render(s.jsx(H.StrictMode,{children:s.jsx(Z2,{children:s.jsx(Q2,{})})}));
