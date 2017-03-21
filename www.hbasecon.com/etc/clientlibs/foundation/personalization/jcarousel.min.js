/*! jCarousel - v0.3.0-beta.5 - 2013-08-20
* http://sorgalla.com/jcarousel
* Copyright (c) 2013 Jan Sorgalla; Licensed MIT */
(function(c){var a=c.jCarousel={};
a.version="0.3.0-beta.5";
var b=/^([+\-]=)?(.+)$/;
a.parseTarget=function(f){var d=false,e=typeof f!=="object"?b.exec(f):null;
if(e){f=parseInt(e[2],10)||0;
if(e[1]){d=true;
if(e[1]==="-="){f*=-1
}}}else{if(typeof f!=="object"){f=parseInt(f,10)||0
}}return{target:f,relative:d}
};
a.detectCarousel=function(d){var e;
while(d.size()>0){e=d.filter("[data-jcarousel]");
if(e.size()>0){return e
}e=d.find("[data-jcarousel]");
if(e.size()>0){return e
}d=d.parent()
}return null
};
a.base=function(d){return{version:a.version,_options:{},_element:null,_carousel:null,_init:c.noop,_create:c.noop,_destroy:c.noop,_reload:c.noop,create:function(){this._element.attr("data-"+d.toLowerCase(),true).data(d,this);
if(false===this._trigger("create")){return this
}this._create();
this._trigger("createend");
return this
},destroy:function(){if(false===this._trigger("destroy")){return this
}this._destroy();
this._trigger("destroyend");
this._element.removeData(d).removeAttr("data-"+d.toLowerCase());
return this
},reload:function(e){if(false===this._trigger("reload")){return this
}if(e){this.options(e)
}this._reload();
this._trigger("reloadend");
return this
},element:function(){return this._element
},options:function(e,f){if(arguments.length===0){return c.extend({},this._options)
}if(typeof e==="string"){if(typeof f==="undefined"){return typeof this._options[e]==="undefined"?null:this._options[e]
}this._options[e]=f
}else{this._options=c.extend({},this._options,e)
}return this
},carousel:function(){if(!this._carousel){this._carousel=a.detectCarousel(this.options("carousel")||this._element);
if(!this._carousel){c.error('Could not detect carousel for plugin "'+d+'"')
}}return this._carousel
},_trigger:function(g,f,i){var h,e=false;
i=[this].concat(i||[]);
(f||this._element).each(function(){h=c.Event((g+"."+d).toLowerCase());
c(this).trigger(h,i);
if(h.isDefaultPrevented()){e=true
}});
return !e
}}
};
a.plugin=function(f,d){var e=c[f]=function(h,g){this._element=c(h);
this.options(g);
this._init();
this.create()
};
e.fn=e.prototype=c.extend({},a.base(f),d);
c.fn[f]=function(h){var g=Array.prototype.slice.call(arguments,1),i=this;
if(typeof h==="string"){this.each(function(){var j=c(this).data(f);
if(!j){return c.error("Cannot call methods on "+f+' prior to initialization; attempted to call method "'+h+'"')
}if(!c.isFunction(j[h])||h.charAt(0)==="_"){return c.error('No such method "'+h+'" for '+f+" instance")
}var k=j[h].apply(j,g);
if(k!==j&&typeof k!=="undefined"){i=k;
return false
}})
}else{this.each(function(){var j=c(this).data(f);
if(j instanceof e){j.reload(h)
}else{new e(this,h)
}})
}return i
};
return e
}
}(jQuery));
(function(c,b){var a=function(d){return parseFloat(d)||0
};
c.jCarousel.plugin("jcarousel",{animating:false,tail:0,inTail:false,resizeTimer:null,lt:null,vertical:false,rtl:false,circular:false,underflow:false,_options:{list:function(){return this.element().children().eq(0)
},items:function(){return this.list().children()
},animation:400,transitions:false,wrap:null,vertical:null,rtl:null,center:false},_list:null,_items:null,_target:null,_first:null,_last:null,_visible:null,_fullyvisible:null,_init:function(){var d=this;
this.onWindowResize=function(){if(d.resizeTimer){clearTimeout(d.resizeTimer)
}d.resizeTimer=setTimeout(function(){d.reload()
},100)
};
return this
},_create:function(){this._reload();
c(b).on("resize.jcarousel",this.onWindowResize)
},_destroy:function(){c(b).off("resize.jcarousel",this.onWindowResize)
},_reload:function(){this.vertical=this.options("vertical");
if(this.vertical==null){this.vertical=this.list().height()>this.list().width()
}this.rtl=this.options("rtl");
if(this.rtl==null){this.rtl=(function(f){if((""+f.attr("dir")).toLowerCase()==="rtl"){return true
}var g=false;
f.parents("[dir]").each(function(){if((/rtl/i).test(c(this).attr("dir"))){g=true;
return false
}});
return g
}(this._element))
}this.lt=this.vertical?"top":"left";
this._list=null;
this._items=null;
var e=this._target&&this.index(this._target)>=0?this._target:this.closest();
this.circular=this.options("wrap")==="circular";
this.underflow=false;
var d={left:0,top:0};
if(e.size()>0){this._prepare(e);
this.list().find("[data-jcarousel-clone]").remove();
this._items=null;
this.underflow=this._fullyvisible.size()>=this.items().size();
this.circular=this.circular&&!this.underflow;
d[this.lt]=this._position(e)+"px"
}this.move(d);
return this
},list:function(){if(this._list===null){var d=this.options("list");
this._list=c.isFunction(d)?d.call(this):this._element.find(d)
}return this._list
},items:function(){if(this._items===null){var d=this.options("items");
this._items=(c.isFunction(d)?d.call(this):this.list().find(d)).not("[data-jcarousel-clone]")
}return this._items
},index:function(d){return this.items().index(d)
},closest:function(){var d=this,i=this.list().position()[this.lt],h=c(),e=false,g=this.vertical?"bottom":(this.rtl?"left":"right"),f;
if(this.rtl&&!this.vertical){i=(i+this.list().width()-this.clipping())*-1
}this.items().each(function(){h=c(this);
if(e){return false
}var j=d.dimension(h);
i+=j;
if(i>=0){f=j-a(h.css("margin-"+g));
if((Math.abs(i)-j+(f/2))<=0){e=true
}else{return false
}}});
return h
},target:function(){return this._target
},first:function(){return this._first
},last:function(){return this._last
},visible:function(){return this._visible
},fullyvisible:function(){return this._fullyvisible
},hasNext:function(){if(false===this._trigger("hasnext")){return true
}var e=this.options("wrap"),d=this.items().size()-1;
return d>=0&&((e&&e!=="first")||(this.index(this._last)<d)||(this.tail&&!this.inTail))?true:false
},hasPrev:function(){if(false===this._trigger("hasprev")){return true
}var d=this.options("wrap");
return this.items().size()>0&&((d&&d!=="last")||(this.index(this._first)>0)||(this.tail&&this.inTail))?true:false
},clipping:function(){return this._element["inner"+(this.vertical?"Height":"Width")]()
},dimension:function(d){return d["outer"+(this.vertical?"Height":"Width")](true)
},scroll:function(v,j,h){if(this.animating){return this
}if(false===this._trigger("scroll",null,[v,j])){return this
}if(c.isFunction(j)){h=j;
j=true
}var p=c.jCarousel.parseTarget(v);
if(p.relative){var f=this.items().size()-1,d=Math.abs(p.target),o=this.options("wrap"),q,m,l,g,u,r,e,t;
if(p.target>0){var n=this.index(this._last);
if(n>=f&&this.tail){if(!this.inTail){this._scrollTail(j,h)
}else{if(o==="both"||o==="last"){this._scroll(0,j,h)
}else{this._scroll(Math.min(this.index(this._target)+d,f),j,h)
}}}else{q=this.index(this._target);
if((this.underflow&&q===f&&(o==="circular"||o==="both"||o==="last"))||(!this.underflow&&n===f&&(o==="both"||o==="last"))){this._scroll(0,j,h)
}else{l=q+d;
if(this.circular&&l>f){t=f;
u=this.items().get(-1);
while(t++<l){u=this.items().eq(0);
r=this._visible.index(u)>=0;
if(r){u.after(u.clone(true).attr("data-jcarousel-clone",true))
}this.list().append(u);
if(!r){e={};
e[this.lt]=this.dimension(u)*(this.rtl?-1:1);
this.moveBy(e)
}this._items=null
}this._scroll(u,j,h)
}else{this._scroll(Math.min(l,f),j,h)
}}}}else{if(this.inTail){this._scroll(Math.max((this.index(this._first)-d)+1,0),j,h)
}else{m=this.index(this._first);
q=this.index(this._target);
g=this.underflow?q:m;
l=g-d;
if(g<=0&&((this.underflow&&o==="circular")||o==="both"||o==="first")){this._scroll(f,j,h)
}else{if(this.circular&&l<0){t=l;
u=this.items().get(0);
while(t++<0){u=this.items().eq(-1);
r=this._visible.index(u)>=0;
if(r){u.after(u.clone(true).attr("data-jcarousel-clone",true))
}this.list().prepend(u);
this._items=null;
var k=a(this.list().position()[this.lt]),s=this.dimension(u);
if(this.rtl&&!this.vertical){k+=s
}else{k-=s
}e={};
e[this.lt]=k+"px";
this.move(e)
}this._scroll(u,j,h)
}else{this._scroll(Math.max(l,0),j,h)
}}}}}else{this._scroll(p.target,j,h)
}this._trigger("scrollend");
return this
},moveBy:function(e,f){var d=this.list().position();
if(e.left){e.left=d.left+a(e.left)+"px"
}if(e.top){e.top=d.top+a(e.top)+"px"
}return this.move(e,f)
},move:function(m,d){d=d||{};
var h=this.options("transitions"),o=!!h,l=!!h.transforms,n=!!h.transforms3d,f=d.duration||0,k=this.list();
if(!o&&f>0){k.animate(m,d);
return
}var e=d.complete||c.noop,j={};
if(o){var i=k.css(["transitionDuration","transitionTimingFunction","transitionProperty"]),g=e;
e=function(){c(this).css(i);
g.call(this)
};
j={transitionDuration:(f>0?f/1000:0)+"s",transitionTimingFunction:h.easing||d.easing,transitionProperty:f>0?(function(){if(l||n){return"all"
}return m.left?"left":"top"
})():"none",transform:"none"}
}if(n){j.transform="translate3d("+(m.left||0)+","+(m.top||0)+",0)"
}else{if(l){j.transform="translate("+(m.left||0)+","+(m.top||0)+")"
}else{c.extend(j,m)
}}if(o&&f>0){k.one("transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd",e)
}k.css(j);
if(f<=0){k.each(function(){e.call(this)
})
}},_scroll:function(f,d,i){if(this.animating){if(c.isFunction(i)){i.call(this,false)
}return this
}if(typeof f!=="object"){f=this.items().eq(f)
}else{if(typeof f.jquery==="undefined"){f=c(f)
}}if(f.size()===0){if(c.isFunction(i)){i.call(this,false)
}return this
}this.inTail=false;
this._prepare(f);
var h=this._position(f),g=a(this.list().position()[this.lt]);
if(h===g){if(c.isFunction(i)){i.call(this,false)
}return this
}var e={};
e[this.lt]=h+"px";
this._animate(e,d,i);
return this
},_scrollTail:function(d,g){if(this.animating||!this.tail){if(c.isFunction(g)){g.call(this,false)
}return this
}var f=this.list().position()[this.lt];
if(this.rtl){f+=this.tail
}else{f-=this.tail
}this.inTail=true;
var e={};
e[this.lt]=f+"px";
this._update({target:this._target.next(),fullyvisible:this._fullyvisible.slice(1).add(this._visible.last())});
this._animate(e,d,g);
return this
},_animate:function(f,e,j){j=j||c.noop;
if(false===this._trigger("animate")){j.call(this,false);
return this
}this.animating=true;
var i=this.options("animation"),d=c.proxy(function(){this.animating=false;
var k=this.list().find("[data-jcarousel-clone]");
if(k.size()>0){k.remove();
this._reload()
}this._trigger("animateend");
j.call(this,true)
},this);
var h=typeof i==="object"?c.extend({},i):{duration:i},g=h.complete||c.noop;
if(e===false){h.duration=0
}else{if(typeof c.fx.speeds[h.duration]!=="undefined"){h.duration=c.fx.speeds[h.duration]
}}h.complete=function(){d();
g.call(this)
};
this.move(f,h);
return this
},_prepare:function(n){var k=this.index(n),m=k,e=this.dimension(n),f=this.clipping(),j=this.vertical?"bottom":(this.rtl?"left":"right"),d=this.options("center"),h={target:n,first:n,last:n,visible:n,fullyvisible:e<=f?n:c()},o,i,g;
if(d){e/=2;
f/=2
}if(e<f){while(true){o=this.items().eq(++m);
if(o.size()===0){if(!this.circular){break
}o=this.items().eq(0);
if(n.get(0)===o.get(0)){break
}i=this._visible.index(o)>=0;
if(i){o.after(o.clone(true).attr("data-jcarousel-clone",true))
}this.list().append(o);
if(!i){var l={};
l[this.lt]=this.dimension(o)*(this.rtl?-1:1);
this.moveBy(l)
}this._items=null
}e+=this.dimension(o);
h.last=o;
h.visible=h.visible.add(o);
g=a(o.css("margin-"+j));
if((e-g)<=f){h.fullyvisible=h.fullyvisible.add(o)
}if(e>=f){break
}}}if(!this.circular&&!d&&e<f){m=k;
while(true){if(--m<0){break
}o=this.items().eq(m);
if(o.size()===0){break
}e+=this.dimension(o);
h.first=o;
h.visible=h.visible.add(o);
g=a(o.css("margin-"+j));
if((e-g)<=f){h.fullyvisible=h.fullyvisible.add(o)
}if(e>=f){break
}}}this._update(h);
this.tail=0;
if(!d&&this.options("wrap")!=="circular"&&this.options("wrap")!=="custom"&&this.index(h.last)===(this.items().size()-1)){e-=a(h.last.css("margin-"+j));
if(e>f){this.tail=e-f
}}return this
},_position:function(f){var g=this._first,h=g.position()[this.lt],e=this.options("center"),d=e?(this.clipping()/2)-(this.dimension(g)/2):0;
if(this.rtl&&!this.vertical){h-=this.clipping()-this.dimension(g);
h+=d
}else{h-=d
}if(!e&&(this.index(f)>this.index(g)||this.inTail)&&this.tail){h=this.rtl?h-this.tail:h+this.tail;
this.inTail=true
}else{this.inTail=false
}return -h
},_update:function(i){var e=this,g={target:this._target||c(),first:this._first||c(),last:this._last||c(),visible:this._visible||c(),fullyvisible:this._fullyvisible||c()},d=this.index(i.first||g.first)<this.index(g.first),f,h=function(k){var j=[],l=[];
i[k].each(function(){if(g[k].index(this)<0){j.push(this)
}});
g[k].each(function(){if(i[k].index(this)<0){l.push(this)
}});
if(d){j=j.reverse()
}else{l=l.reverse()
}e._trigger("item"+k+"in",c(j));
e._trigger("item"+k+"out",c(l));
e["_"+k]=i[k]
};
for(f in i){h(f)
}return this
}})
}(jQuery,window));
(function(a){a.jcarousel.fn.scrollIntoView=function(i,c,m){var k=a.jCarousel.parseTarget(i),f=this.index(this._fullyvisible.first()),l=this.index(this._fullyvisible.last()),h;
if(k.relative){h=k.target<0?Math.max(0,f+k.target):l+k.target
}else{h=typeof k.target!=="object"?k.target:this.index(k.target)
}if(h<f){return this.scroll(h,c,m)
}if(h>=f&&h<=l){if(a.isFunction(m)){m.call(this,false)
}return this
}var j=this.items(),d=this.clipping(),g=this.vertical?"bottom":(this.rtl?"left":"right"),b=0,n;
while(true){n=j.eq(h);
if(n.size()===0){break
}b+=this.dimension(n);
if(b>=d){var e=parseFloat(n.css("margin-"+g))||0;
if((b-e)!==d){h++
}break
}if(h<=0){break
}h--
}return this.scroll(h,c,m)
}
}(jQuery));
(function(a){a.jCarousel.plugin("jcarouselControl",{_options:{target:"+=1",event:"click",method:"scroll"},_active:null,_init:function(){this.onDestroy=a.proxy(function(){this._destroy();
this.carousel().one("createend.jcarousel",a.proxy(this._create,this))
},this);
this.onReload=a.proxy(this._reload,this);
this.onEvent=a.proxy(function(b){b.preventDefault();
var c=this.options("method");
if(a.isFunction(c)){c.call(this)
}else{this.carousel().jcarousel(this.options("method"),this.options("target"))
}},this)
},_create:function(){this.carousel().one("destroy.jcarousel",this.onDestroy).on("reloadend.jcarousel scrollend.jcarousel",this.onReload);
this._element.on(this.options("event")+".jcarouselcontrol",this.onEvent);
this._reload()
},_destroy:function(){this._element.off(".jcarouselcontrol",this.onEvent);
this.carousel().off("destroy.jcarousel",this.onDestroy).off("reloadend.jcarousel scrollend.jcarousel",this.onReload)
},_reload:function(){var b=a.jCarousel.parseTarget(this.options("target")),e=this.carousel(),d;
if(b.relative){d=e.jcarousel(b.target>0?"hasNext":"hasPrev")
}else{var c=typeof b.target!=="object"?e.jcarousel("items").eq(b.target):b.target;
d=e.jcarousel("target").index(c)>=0
}if(this._active!==d){this._trigger(d?"active":"inactive");
this._active=d
}return this
}})
}(jQuery));
(function(a){a.jCarousel.plugin("jcarouselPagination",{_options:{perPage:null,item:function(b){return'<a href="#'+b+'">'+b+"</a>"
},event:"click",method:"scroll"},_pages:{},_items:{},_currentPage:null,_init:function(){this.onDestroy=a.proxy(function(){this._destroy();
this.carousel().one("createend.jcarousel",a.proxy(this._create,this))
},this);
this.onReload=a.proxy(this._reload,this);
this.onScroll=a.proxy(this._update,this)
},_create:function(){this.carousel().one("destroy.jcarousel",this.onDestroy).on("reloadend.jcarousel",this.onReload).on("scrollend.jcarousel",this.onScroll);
this._reload()
},_destroy:function(){this._clear();
this.carousel().off("destroy.jcarousel",this.onDestroy).off("reloadend.jcarousel",this.onReload).off("scrollend.jcarousel",this.onScroll)
},_reload:function(){var g=this.options("perPage");
this._pages={};
this._items={};
if(a.isFunction(g)){g=g.call(this)
}if(g==null){this._pages=this._calculatePages()
}else{var b=parseInt(g,10)||0,f=this.carousel().jcarousel("items"),e=1,d=0,l;
while(true){l=f.eq(d++);
if(l.size()===0){break
}if(!this._pages[e]){this._pages[e]=l
}else{this._pages[e]=this._pages[e].add(l)
}if(d%b===0){e++
}}}this._clear();
var k=this,j=this.carousel().data("jcarousel"),c=this._element,h=this.options("item");
a.each(this._pages,function(n,m){var i=k._items[n]=a(h.call(k,n,m));
i.on(k.options("event")+".jcarouselpagination",a.proxy(function(){var q=m.eq(0);
if(j.circular){var o=j.index(j.target()),p=j.index(q);
if(parseFloat(n)>parseFloat(k._currentPage)){if(p<o){q="+="+(j.items().size()-o+p)
}}else{if(p>o){q="-="+(o+(j.items().size()-p))
}}}j[this.options("method")](q)
},k));
c.append(i)
});
this._update()
},_update:function(){var c=this.carousel().jcarousel("target"),b;
a.each(this._pages,function(e,d){d.each(function(){if(c.is(this)){b=e;
return false
}});
if(b){return false
}});
if(this._currentPage!==b){this._trigger("inactive",this._items[this._currentPage]);
this._trigger("active",this._items[b])
}this._currentPage=b
},items:function(){return this._items
},_clear:function(){this._element.empty();
this._currentPage=null
},_calculatePages:function(){var i=this.carousel().data("jcarousel"),e=i.items(),f=i.clipping(),d=0,c=0,g=1,b={},h;
while(true){h=e.eq(c++);
if(h.size()===0){break
}if(!b[g]){b[g]=h
}else{b[g]=b[g].add(h)
}d+=i.dimension(h);
if(d>=f){g++;
d=0
}}return b
}})
}(jQuery));
(function(a){a.jCarousel.plugin("jcarouselAutoscroll",{_options:{target:"+=1",interval:3000,autostart:true},_timer:null,_init:function(){this.onDestroy=a.proxy(function(){this._destroy();
this.carousel().one("createend.jcarousel",a.proxy(this._create,this))
},this);
this.onAnimateEnd=a.proxy(this.start,this)
},_create:function(){this.carousel().one("destroy.jcarousel",this.onDestroy);
if(this.options("autostart")){this.start()
}},_destroy:function(){this.stop();
this.carousel().off("destroy.jcarousel",this.onDestroy)
},start:function(){this.stop();
this.carousel().one("animateend.jcarousel",this.onAnimateEnd);
this._timer=setTimeout(a.proxy(function(){this.carousel().jcarousel("scroll",this.options("target"))
},this),this.options("interval"));
return this
},stop:function(){if(this._timer){this._timer=clearTimeout(this._timer)
}this.carousel().off("animateend.jcarousel",this.onAnimateEnd);
return this
}})
}(jQuery));