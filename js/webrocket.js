/* Copyright 2010-2011 Rolf Timmermans */
(function(){var g=null;
function j(){function b(e,i){switch(c){case 0:(e===1?f:h).push(i);break;case e:i(d)}}function a(e,i){c=e;d=i;(e==1?f:h).forEach(function(p){p.apply(p,d)});h=f=g}var c=0,d,f=[],h=[],m,k;m={g:function(e){k.g(e);return this},i:function(e){k.i(e);return this}};return k={g:function(e){b(1,e);return this},i:function(e){b(2,e);return this},c:function(){var e=Array.prototype.slice.call(arguments);a(1,e);return m},d:function(){var e=Array.prototype.slice.call(arguments);a(2,e);return m},status:function(){return c},t:function(){return m}}}
function l(b){function a(k,e,i){h=h&&i;f[e]=k;d-=1;if(0===d)if(m)h?c.c.call(c.c,f):c.d.call(c.d,f);else h?c.c.apply(c.c,f):c.d.apply(c.d,f)}var c=j(),d=0,f=[],h=true,m;if(Array.isArray(b))m=true;else b=Array.prototype.slice.call(arguments);d=b.length;b.forEach(function(k,e){f.push(undefined);k.g(function(i){a(i,e,true)});k.i(function(i){a(i,e,false)})});return c}var n,o,q;function r(b,a){return function(){return b.apply(a,arguments)}}var s=Array.prototype.slice,t=Object.prototype.hasOwnProperty;
function u(b,a){function c(){this.constructor=b}for(var d in a)if(t.call(a,d))b[d]=a[d];c.prototype=a.prototype;b.prototype=new c;b.p=a.prototype}
n=function(){function b(a){this.q=a;this.s=0;this.l={}}b.prototype.onmessage=function(a){var c,d;c=JSON.parse(a.data);a=c.id;d=c.result;c=c.error;return c!=g?this.l[a].d(c):this.l[a].c(d)};b.prototype.f=function(a){this.e=new WebSocket(this.q);this.e.onopen=function(){return a.c(g)};this.e.onerror=function(){return a.d(g)};this.e.onclose=function(){return a.d(g)};return this.e.onmessage=r(function(c){return this.onmessage(c)},this)};b.prototype.close=function(){return this.e.close()};b.prototype.k=
function(){return this.e.readyState===1};b.prototype.send=function(a,c,d,f){this.l[a.id]=a.b;return this.e.send(JSON.stringify({id:a.id,receiver:c,method:d,args:f}))};return b}();
o=function(){function b(a){this.a=a;this.id=this.a.s++;this.n()}b.prototype.send=function(){var a,c;c=arguments[0];a=2<=arguments.length?s.call(arguments,1):[];return this.o(c,a)};b.prototype.o=function(a,c){return this.m(c,r(function(d){return this.a.send(d,this.value,a,c)},this))};b.prototype.r=function(a){return this.h=a};b.prototype.j=function(a){var c,d,f,h;d=[];if(Array.isArray(a)){f=0;for(h=a.length;f<h;f++){c=a[f];d=d.concat(this.j(c))}}else if(a.constructor===b)d.push(a.b);else if(a.constructor===
Object)for(c in a){f=a[c];d=d.concat(this.j(f))}return d};b.prototype.m=function(a,c){var d;d=new b(this.a);l(this.j(a).concat(this.b)).g(function(){return c(d)});return d};b.prototype.n=function(){this.b=j();this.b.g(r(function(a){this.value=a;if(this.h)return this.h(this)},this));this.b.i(r(function(a){this.error=a;if(this.h)return this.h(this)},this))};b.prototype.toString=function(){var a;return(a=this.value)!=g&&a._ref?"[object "+(this.value._class||"(Class)")+":"+this.value._ref+">":JSON.stringify(this.value)};
b.prototype.toJSON=function(){if(this.value==g)throw Error("Object not complete");return this.value};return b}();q=function(){function b(a){this.a=a;b.p.constructor.apply(this,arguments);this.a.f(this.b)}u(b,o);b.prototype.f=function(){this.n();this.a.f(this.b);return this};b.prototype.close=function(){return this.a.close()};b.prototype.k=function(){return this.a.k()};b.prototype.object=function(a){return this.m(a,r(function(c){return c.b.c(a)},this))};return b}();q.f=function(b){return new q(new n(b))};
window.WebRocket=q;q.connect=q.f;q.prototype.connect=q.prototype.f;q.prototype.close=q.prototype.close;q.prototype.connected=q.prototype.k;q.prototype.object=q.prototype.object;o.prototype.send=o.prototype.send;o.prototype.returned=o.prototype.r;o.prototype.toJSON=o.prototype.toJSON;o.prototype.__noSuchMethod__=o.prototype.o;})()