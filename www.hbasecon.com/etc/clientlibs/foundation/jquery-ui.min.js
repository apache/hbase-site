(function(b,a){(function(k,h){var v=k.fn.domManip,j="_tmplitem",w=/^[^<]*(<[\w\W]+>)[^>]*$|\{\{\! /,r={},g={},A,z={key:0,data:{}},y=0,s=0,i=[];
function m(D,C,F,G){var E={data:G||(C?C.data:{}),_wrap:C?C._wrap:null,tmpl:null,parent:C||null,nodes:[],calls:e,nest:d,wrap:p,html:t,update:B};
if(D){k.extend(E,D,{nodes:[],parent:C})
}if(F){E.tmpl=F;
E._ctnt=E._ctnt||E.tmpl(k,E);
E.key=++y;
(i.length?g:r)[y]=E
}return E
}k.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(C,D){k.fn[C]=function(E){var H=[],K=k(E),G,I,F,L,J=this.length===1&&this[0].parentNode;
A=r||{};
if(J&&J.nodeType===11&&J.childNodes.length===1&&K.length===1){K[D](this[0]);
H=this
}else{for(I=0,F=K.length;
I<F;
I++){s=I;
G=(I>0?this.clone(true):this).get();
k.fn[D].apply(k(K[I]),G);
H=H.concat(G)
}s=0;
H=this.pushStack(H,C,K.selector)
}L=A;
A=null;
k.tmpl.complete(L);
return H
}
});
k.fn.extend({tmpl:function(E,D,C){return k.tmpl(this[0],E,D,C)
},tmplItem:function(){return k.tmplItem(this[0])
},template:function(C){return k.template(C,this[0])
},domManip:function(E,I,J,D){if(E[0]&&E[0].nodeType){var H=k.makeArray(arguments),G=E.length,F=0,C;
while(F<G&&!(C=k.data(E[F++],"tmplItem"))){}if(G>1){H[0]=[k.makeArray(E)]
}if(C&&s){H[2]=function(K){k.tmpl.afterManip(this,K,J)
}
}v.apply(this,H)
}else{v.apply(this,arguments)
}s=0;
if(!A){k.tmpl.complete(r)
}return this
}});
k.extend({tmpl:function(E,H,G,D){var F,C=!D;
if(C){D=z;
E=k.template[E]||k.template(null,E);
g={}
}else{if(!E){E=D.tmpl;
r[D.key]=D;
D.nodes=[];
if(D.wrapped){u(D,D.wrapped)
}return k(o(D,null,D.tmpl(k,D)))
}}if(!E){return[]
}if(typeof H==="function"){H=H.call(D||{})
}if(G&&G.wrapped){u(G,G.wrapped)
}F=k.isArray(H)?k.map(H,function(I){return I?m(G,D,E,I):null
}):[m(G,D,E,H)];
return C?k(o(D,null,F)):F
},tmplItem:function(D){var C;
if(D instanceof k){D=D[0]
}while(D&&D.nodeType===1&&!(C=k.data(D,"tmplItem"))&&(D=D.parentNode)){}return C||z
},template:function(D,C){if(C){if(typeof C==="string"){C=n(C)
}else{if(C instanceof k){C=C[0]||{}
}}if(C.nodeType){C=k.data(C,"tmpl")||k.data(C,"tmpl",n(C.innerHTML))
}return typeof D==="string"?(k.template[D]=C):C
}return D?(typeof D!=="string"?k.template(null,D):(k.template[D]||k.template(null,w.test(D)?D:k(D)))):null
},encode:function(C){return(""+C).split("<").join("&lt;").split(">").join("&gt;").split('"').join("&#34;").split("'").join("&#39;")
}});
k.extend(k.tmpl,{tag:{tmpl:{_default:{$2:"null"},open:"if($notnull_1){_=_.concat($item.nest($1,$2));}"},wrap:{_default:{$2:"null"},open:"$item.calls(_,$1,$2);_=[];",close:"call=$item.calls();_=call._.concat($item.wrap(call,_));"},each:{_default:{$2:"$index, $value"},open:"if($notnull_1){$.each($1a,function($2){with(this){",close:"}});}"},"if":{open:"if(($notnull_1) && $1a){",close:"}"},"else":{_default:{$1:"true"},open:"}else if(($notnull_1) && $1a){"},html:{open:"if($notnull_1){_.push($1a);}"},"=":{_default:{$1:"$data"},open:"if($notnull_1){_.push($.encode($1a));}"},"!":{open:""}},complete:function(C){r={}
},afterManip:function x(E,C,F){var D=C.nodeType===11?k.makeArray(C.childNodes):C.nodeType===1?[C]:[];
F.call(E,C);
q(D);
s++
}});
function o(C,G,E){var F,D=E?k.map(E,function(H){return(typeof H==="string")?(C.key?H.replace(/(<\w+)(?=[\s>])(?![^>]*_tmplitem)([^>]*)/g,"$1 "+j+'="'+C.key+'" $2'):H):o(H,C,H._ctnt)
}):C;
if(G){return D
}D=D.join("");
D.replace(/^\s*([^<\s][^<]*)?(<[\w\W]+>)([^>]*[^>\s])?\s*$/,function(I,J,H,K){F=k(H).get();
q(F);
if(J){F=c(J).concat(F)
}if(K){F=F.concat(c(K))
}});
return F?F:c(D)
}function c(D){var C=document.createElement("div");
C.innerHTML=D;
return k.makeArray(C.childNodes)
}function n(C){return new Function("jQuery","$item","var $=jQuery,call,_=[],$data=$item.data;with($data){_.push('"+k.trim(C).replace(/([\\'])/g,"\\$1").replace(/[\r\t\n]/g," ").replace(/\$\{([^\}]*)\}/g,"{{= $1}}").replace(/\{\{(\/?)(\w+|.)(?:\(((?:[^\}]|\}(?!\}))*?)?\))?(?:\s+(.*?)?)?(\(((?:[^\}]|\}(?!\}))*?)\))?\s*\}\}/g,function(K,E,I,F,G,L,H){var N=k.tmpl.tag[I],D,J,M;
if(!N){throw"Template command not found: "+I
}D=N._default||[];
if(L&&!/\w$/.test(G)){G+=L;
L=""
}if(G){G=l(G);
H=H?(","+l(H)+")"):(L?")":"");
J=L?(G.indexOf(".")>-1?G+L:("("+G+").call($item"+H)):G;
M=L?J:"(typeof("+G+")==='function'?("+G+").call($item):("+G+"))"
}else{M=J=D.$1||"null"
}F=l(F);
return"');"+N[E?"close":"open"].split("$notnull_1").join(G?"typeof("+G+")!=='undefined' && ("+G+")!=null":"true").split("$1a").join(M).split("$1").join(J).split("$2").join(F?F.replace(/\s*([^\(]+)\s*(\((.*?)\))?/g,function(P,O,Q,R){R=R?(","+R+")"):(Q?")":"");
return R?("("+O+").call($item"+R):P
}):(D.$2||""))+"_.push('"
})+"');}return _;")
}function u(D,C){D._wrap=o(D,true,k.isArray(C)?C:[w.test(C)?C:k(C).html()]).join("")
}function l(C){return C?C.replace(/\\'/g,"'").replace(/\\\\/g,"\\"):null
}function f(C){var D=document.createElement("div");
D.appendChild(C.cloneNode(true));
return D.innerHTML
}function q(I){var K="_"+s,D,C,G={},H,F,E;
for(H=0,F=I.length;
H<F;
H++){if((D=I[H]).nodeType!==1){continue
}C=D.getElementsByTagName("*");
for(E=C.length-1;
E>=0;
E--){J(C[E])
}J(D)
}function J(Q){var N,P=Q,O,L,M;
if((M=Q.getAttribute(j))){while(P.parentNode&&(P=P.parentNode).nodeType===1&&!(N=P.getAttribute(j))){}if(N!==M){P=P.parentNode?(P.nodeType===11?0:(P.getAttribute(j)||0)):0;
if(!(L=r[M])){L=g[M];
L=m(L,r[P]||g[P],null,true);
L.key=++y;
r[y]=L
}if(s){R(M)
}}Q.removeAttribute(j)
}else{if(s&&(L=k.data(Q,"tmplItem"))){R(L.key);
r[L.key]=L;
P=k.data(Q.parentNode,"tmplItem");
P=P?P.key:0
}}if(L){O=L;
while(O&&O.key!=P){O.nodes.push(Q);
O=O.parent
}delete L._ctnt;
delete L._wrap;
k.data(Q,"tmplItem",L)
}function R(S){S=S+K;
L=G[S]=(G[S]||m(L,r[L.parent.key+K]||L.parent,null,true))
}}}function e(E,C,F,D){if(!E){return i.pop()
}i.push({_:E,tmpl:C,item:this,data:F,options:D})
}function d(C,E,D){return k.tmpl(k.template(C),E,D,this)
}function p(E,C){var D=E.options||{};
D.wrapped=C;
return k.tmpl(k.template(E.tmpl),E.data,D,E.item)
}function t(D,E){var C=this._wrap;
return k.map(k(k.isArray(C)?C.join(""):C).filter(D||"*"),function(F){return E?F.innerText||F.textContent:F.outerHTML||f(F)
})
}function B(){var C=this.nodes;
k.tmpl(null,null,null,this).insertBefore(C[0]);
k(C).remove()
}})(b)
})(window.$CQ||window.$||function(){throw new Error("jQuery is not defined")
}(),window.$CQ||window.$);