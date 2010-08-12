Sai={};Sai.util={};Sai.imagePath=typeof Sai.imagePath!=="undefined"&&Sai.imagePath!==null?Sai.imagePath:"/static/images/sai/";Sai.util.roundToMag=function(l,n){var f;n=typeof n!=="undefined"&&n!==null?n:0;f=Math.pow(10,n);return parseFloat((Math.round(l/f)*f).toFixed(Math.max(0,n)))};Sai.util.round=function(l,n){return parseFloat((Math.round(l/n)*n).toFixed(Math.max(0,Math.ceil(-1*Math.log(n)/Math.LN10))))};
Sai.util.sumArray=function(l){var n,f,a;a=0;n=l.length;for(f=0;0<=n?f<n:f>n;0<=n?f+=1:f-=1)a+=typeof l[f]==="number"?l[f]:0;return a};Sai.util.prettystr=function(l,n){var f;n=typeof n!=="undefined"&&n!==null?n:2;if(typeof l==="number"){if(Math.abs(l)>=1E12){f="t";l/=1E12}else if(Math.abs(l)>=1E9){f="b";l/=1E9}else if(Math.abs(l)>=1E6){f="m";l/=1E6}else if(Math.abs(l)>=1E3){f="k";l/=1E3}else return String(parseFloat(l.toFixed(n)));return parseFloat(l.toFixed(1))+f}return l};
Sai.util.infoSetters=function(l,n){return[function(){return l(n)},function(){return l()}]};Sai.util.transformCoords=function(l,n){var f;if(n.getScreenCTM){f=n.createSVGPoint();f.x=l.clientX;f.y=l.clientY;f=f.matrixTransform(n.getScreenCTM().inverse());if(navigator.userAgent.toLowerCase().indexOf("chrome")!==-1||navigator.userAgent.toLowerCase().indexOf("safari")!==-1)f.x+=document.body.scrollLeft;return{x:f.x,y:f.y}}else return{x:event.x,y:event.y}};
Sai.util.multiplyColor=function(l,n,f,a){a=typeof a!=="undefined"&&a!==null?a:0;n=a+(1-a)*n;a=Raphael.getRGB(l);if(f){l=a.r+(255-a.r)*(1-n);f=a.g+(255-a.g)*(1-n);n=a.b+(255-a.b)*(1-n)}else{l=a.r*n;f=a.g*n;n=a.b*n}return{r:l,g:f,b:n,str:"rgb("+l+", "+f+", "+n+")"}};
Sai.util.reflectColor=function(l,n){var f,a,b,c,e,g,d,h,i;g=Raphael.getRGB(l);h=Raphael.getRGB(n);i={};a=["r","g","b"];f=0;for(b=a.length;f<b;f++){e=a[f];c=g[e];d=h[e];i[e]=c===d?c:c>d?d*((255-c)/(255-d)):(255*(d-c)+d*c)/d}return"rgb("+i.r+", "+i.g+", "+i.b+")"};Sai.data=typeof Sai.data!=="undefined"&&Sai.data!==null?Sai.data:{};Sai.data.map=typeof Sai.data.map!=="undefined"&&Sai.data.map!==null?Sai.data.map:{};
Raphael.fn.sai=typeof Raphael.fn.sai!=="undefined"&&Raphael.fn.sai!==null?Raphael.fn.sai:{};Raphael.fn.sai.chart=function(l,n,f,a,b,c){b={line:Sai.LineChart}[b]||b;b=typeof b!=="undefined"&&b!==null?b:Sai.Chart;return(new b(this,l,n,f,a,c)).render()};(function(){var l,n=Object.prototype.hasOwnProperty;Raphael.fn.sai.prim=typeof Raphael.fn.sai.prim!=="undefined"&&Raphael.fn.sai.prim!==null?Raphael.fn.sai.prim:{};l=function(f,a,b,c){return[function(){f.attr(a);return c?c[0](f):null},function(){f.attr(b);return c?c[1](f):null}]};Raphael.fn.sai.prim.candlestick=function(f,a,b,c,e,g,d,h,i,j,k){d=typeof d!=="undefined"&&d!==null?d:"#000000";g%2||g++;g=this.rect(f-g/2,a,g,b-a||1).attr("stroke",d);c=this.path("M"+f+" "+c+"L"+f+" "+a+"M"+f+" "+b+"L"+f+
" "+e).attr("stroke",d);g.attr("fill",h?d:"#ffffff");d=this.set().push(g,c);if(i){f=l(d,{scale:"1.5,1.5,"+f+","+(a+(b-a)/2),"fill-opacity":0.5},{scale:"1.0,1.0,"+f+","+(a+(b-a)/2),"fill-opacity":1},k);d.hover(f[0],f[1])}return d};Raphael.fn.sai.prim.line=function(f,a,b){var c,e,g,d;a=typeof a!=="undefined"&&a!==null?a:"#000000";b=typeof b!=="undefined"&&b!==null?b:1;c=0;for(e=f.length;c<e;c++){g=f[c];if(typeof g!=="undefined"&&g!==null)if(typeof d!=="undefined"&&d!==null)d+="L"+g[0]+" "+g[1];else d=
"M"+g[0]+" "+g[1]}return this.path(d).attr({stroke:a,"stroke-width":b})};Raphael.fn.sai.prim.area=function(f,a,b,c){var e,g,d,h,i;if(f.length<2)return this.set();a=typeof a!=="undefined"&&a!==null?a:"#000000";b=typeof b!=="undefined"&&b!==null?b:1;e=0;for(g=f.length;e<g;e++){h=f[e];if(typeof h!=="undefined"&&h!==null)if(typeof i!=="undefined"&&i!==null){i+="L"+h[0]+" "+h[1];d+="L"+h[0]+" "+h[1]}else{i="M"+h[0]+" "+h[1];d="M"+h[0]+" "+h[1]}}for(f=c.length-1;c.length-1<=0?f<=0:f>=0;f+=-1)d+="L"+c[f][0]+
","+c[f][1];c=this.path(d).attr({fill:a,"stroke-width":0,"stroke-opacity":0,"fill-opacity":0.35});a=this.path(i).attr({stroke:a,"stroke-width":b});return this.set().push(c,a)};Raphael.fn.sai.prim.stackedBar=function(f,a,b,c,e,g,d){var h,i,j,k,m,o,q,p;if(e&&typeof(h=f[f.length-1])!=="undefined"&&h!==null)p=c-f[f.length-1][1];b*=0.67;q=this.set();k=c;i=f.length;for(h=0;0<=i?h<i:h>i;0<=i?h+=1:h-=1){o=h;if(typeof(j=f[o])!=="undefined"&&j!==null&&f[o][1]!==c){m=k-f[o][1];k=o===0?1:0;q.push(k=this.rect(f[o][0]-
b/2,f[o][1],b,m-k).attr("fill",(a==undefined?undefined:a[o])||"#000000").attr("stroke",(a==undefined?undefined:a[o])||"#000000"));if(e){m=l(k,{"fill-opacity":"0.75"},{"fill-opacity":"1.0"},[function(r){return function(){d[0]&&d[0]();return g({"(selected)":Sai.util.prettystr(r)+"%"},false)}}(100*m/p),d[1]]);k.hover(m[0],m[1])}k=f[o][1]}}return q};Raphael.fn.sai.prim.groupedBar=function(f,a,b,c,e,g,d){var h,i,j,k;g=this.set();i=b/(f.length+1);k=(b-i)/2;b=f.length;for(j=0;0<=b?j<b:j>b;0<=b?j+=1:j-=1)if(typeof(h=
f[j]==undefined?undefined:f[j][0])!=="undefined"&&h!==null)g.push(this.rect(f[j][0]-k+j*i,f[j][1],i-1,c-f[j][1]-0.5).attr("fill",(a==undefined?undefined:a[j])||"#000000").attr("stroke",(a==undefined?undefined:a[j])||"#000000"));if(e){f=l(g,{"fill-opacity":"0.75"},{"fill-opacity":"1.0"},d);g.hover(f[0],f[1])}return g};Raphael.fn.sai.prim.haxis=function(f,a,b,c,e,g,d){var h,i,j,k,m,o;d=typeof d!=="undefined"&&d!==null?d:[10,5];g=typeof g!=="undefined"&&g!==null?g:"#000000";j=this.path("M"+a+" "+b+"l"+
c+" 0").attr("stroke",g);k=this.set();e=this.set();c=c/(f.length-1);o=a;a=0;for(h=f.length;a<h;a++){m=f[a];if(typeof m!=="undefined"&&m!==null){i=d[String(m)?0:1];k.push(this.path("M"+o+" "+b+"l0 "+i).attr("stroke",g));if(m!==""){i=this.text(o,b+i+2,Sai.util.prettystr(m));i.attr("y",i.attr("y")+i.getBBox().height/2);e.push(i)}}o+=c}return this.set().push(j,k,e)};Raphael.fn.sai.prim.vaxis=function(f,a,b,c,e,g,d){var h,i,j,k,m,o;d=typeof d!=="undefined"&&d!==null?d:[10,5];g=typeof g!=="undefined"&&
g!==null?g:"#000000";j=this.path("M"+a+" "+b+"l0 "+-c).attr("stroke",g);k=this.set();e=this.set();c=c/(f.length-1);o=b;b=0;for(h=f.length;b<h;b++){m=f[b];if(m!==null){i=d[String(m)?0:1];k.push(this.path("M"+a+" "+o+"l"+-i+" 0").attr("stroke",g));i=this.text(a-i-2,o,Sai.util.prettystr(m));i.attr("x",i.attr("x")-i.getBBox().width/2);e.push(i)}o-=c}return this.set().push(j,k,e)};Raphael.fn.sai.prim.popup=function(f,a,b){var c,e,g,d,h,i;this.set();i=this.set();e=0;g=a+5+5;if("__HEAD__"in b){c=this.text(f,
g,b.__HEAD__).attr({fill:"#cfc","font-size":"12","font-weight":"bold"});e=Math.max(e,c.getBBox().width);i.push(c);g+=17}for(h in b)if(n.call(b,h))if(h!=="__HEAD__"){d=this.text(f+5,g,h+" = "+b[h]).attr({fill:"#ffffff","font-weight":"bold"});d.translate(d.getBBox().width/2,0);e=Math.max(e,d.getBBox().width);g+=10;i.push(d)}b=e+10;this.rect(f,a,b,g-a,5).attr({fill:"#000000","fill-opacity":".85",stroke:"#000000"});typeof c==="undefined"||c==undefined||c.translate(b/2);return i.toFront()};Raphael.fn.sai.prim.legend=
function(f,a,b,c){var e,g,d,h,i,j,k;a-=14;i=this.set();d=f;h=a;for(k in c)if(n.call(c,k)){j=this.text(d+14,h,k);j.translate(j.getBBox().width/2,j.getBBox().height/2);g=this.rect(d,h,9,9).attr({fill:typeof(e=c[k])!=="undefined"&&e!==null?c[k]:"black"});g=this.set().push(j,g);if(d-f+15+g.getBBox().width>b){i.translate(0,-14);g.translate(f-d,a-h);d=f;h=a}d+=g.getBBox().width+15;i.push(g)}return i};Raphael.fn.sai.prim.info=function(f,a,b,c){var e,g,d,h,i;d=this.set();g=f;a=a;for(e in c)if(n.call(c,e))if(c[e]!==
null){h=this.text(g,a,e+(e===""?"":": ")+Sai.util.prettystr(c[e]));i=h.getBBox();h.translate(i.width/2,i.height/2);if(g-f+15+i.width>b){h.translate(f-g,14);g=f;a+=14}g+=i.width+15;d.push(h)}return d};Raphael.fn.sai.prim.hoverShape=function(f,a,b,c){f=f(this).attr(a);b=l(f,c&&c[0]||{},c&&c[1]||{},b);f.mouseover(b[0]);f.mouseout(b[1]);return f};Raphael.fn.sai.prim.histogram=function(f,a,b,c,e,g,d,h,i,j,k,m){var o,q,p,r;j=typeof j!=="undefined"&&j!==null?j:"#ffffff";m=typeof m!=="undefined"&&m!==null?
m:10;r=this.set();r.push(this.rect(f,a-c,b,c).attr({"stroke-width":0,"stroke-opacity":0,fill:j}));c=a-(c-12);a-=5;g=typeof g!=="undefined"&&g!==null?g:0;d=typeof d!=="undefined"&&d!==null?d:1;r.push(g=this.text(f,a,Sai.util.prettystr(g)));g.translate(g.getBBox().width/2,0);r.push(d=this.text(f+b,a,Sai.util.prettystr(d)));d.translate(-d.getBBox().width/2,0);a-=7;d={};j=g=0;for(o=e.length;j<o;j++){p=e[j];p=Math.min(m-1,Math.floor(m*p/1));if(p in d)d[p]+=1;else d[p]=1;g=Math.max(g,d[p])}r.push(this.path("M"+
f+","+a+" l"+b+", 0").attr("stroke",i));a-=1;j=b/m;for(q in d)if(n.call(d,q)){e=(a-c)*(d[q]/g);r.push(this.rect(f+(parseInt(q)+0.2)*j,a-e,j*0.6,e).attr({fill:Sai.util.multiplyColor(i,(parseInt(q)+0.5)/m,k,0.2).str,"stroke-width":k?0.35:0,"stroke-opacity":k?1:0,stroke:"#000000"}))}r.push(this.text(f+b/2,c-6,Sai.util.prettystr(h)));return r}})();(function(){var l=Object.prototype.hasOwnProperty,n=function(f,a){var b=function(){};b.prototype=a.prototype;f.prototype=new b;f.prototype.constructor=f;typeof a.extended==="function"&&a.extended(f);f.__superClass__=a.prototype};Sai.Plot=function(f,a,b,c,e,g,d,h){this.opts=h;this.rawdata=d;this.data=g;this.h=e;this.w=c;this.y=b;this.x=a;this.r=f;this.opts=typeof this.opts!=="undefined"&&this.opts!==null?this.opts:{};this.setDenormalizedData();this.set=this.r.set();return this};Sai.Plot.prototype.setDenormalizedData=
function(){var f,a,b,c,e,g,d,h,i,j;if(this.data instanceof Array){f=[];b=this.data;a=0;for(c=b.length;a<c;a++){i=b[a];f.push(this.denormalize(i))}return this.dndata=f}else{this.dndata=typeof this.dndata!=="undefined"&&this.dndata!==null?this.dndata:{};f=[];a=this.data;for(j in a)if(l.call(a,j))f.push(this.dndata[j]=function(){e=[];d=this.data[j];g=0;for(h=d.length;g<h;g++){i=d[g];e.push(this.denormalize(i))}return e}.call(this));return f}};Sai.Plot.prototype.denormalize=function(f){if(f instanceof
Array)return[this.x+this.w*f[0],this.y-this.h*f[1]]};Sai.Plot.prototype.render=function(){this.set.push(this.r.rect(20,20,20,20).attr("fill","red"),this.r.circle(40,40,10).attr("fill","blue"));return this};Sai.LinePlot=function(){return Sai.Plot.apply(this,arguments)};n(Sai.LinePlot,Sai.Plot);Sai.LinePlot.prototype.setDenormalizedData=function(){var f,a,b;Sai.LinePlot.__superClass__.setDenormalizedData.apply(this,arguments);f=[];a=this.dndata;for(b in a)if(l.call(a,b))f.push(this.dndata[b].length===
1&&(this.dndata[b]==undefined?undefined:this.dndata[b][0]==undefined?undefined:this.dndata[b][0][0])===this.x?this.dndata[b].push([this.x+this.w,this.dndata[b][0][1]]):null);return f};Sai.LinePlot.prototype.render=function(f,a){var b,c;this.set.remove();b=this.dndata;for(c in b)if(l.call(b,c))c.match("^__")||this.set.push(this.r.sai.prim.line(this.dndata[c],(f==undefined?undefined:f[c])||"black",a||1));return this};Sai.AreaPlot=function(){return Sai.LinePlot.apply(this,arguments)};n(Sai.AreaPlot,
Sai.LinePlot);Sai.AreaPlot.prototype.render=function(f,a,b){var c,e,g,d,h,i,j;this.set.remove();c=this.dndata;for(j in c)if(l.call(c,j))if(!j.match("^__")){e=typeof e!=="undefined"&&e!==null?e:[this.denormalize([0,0]),this.denormalize([1,0])];this.set.push(this.r.sai.prim.area(this.dndata[j],(f==undefined?undefined:f[j])||"black",a||1,e));if(b){e=[];d=this.dndata[j];g=0;for(h=d.length;g<h;g++){i=d[g];e.push([i[0],i[1]-a/2])}e=e}}return this};Sai.CandlestickPlot=function(){return Sai.Plot.apply(this,
arguments)};n(Sai.CandlestickPlot,Sai.Plot);Sai.CandlestickPlot.prototype.render=function(f,a,b,c){var e,g,d,h,i,j,k,m,o;this.set.remove();i=(f==undefined?undefined:f.up)||"black";h=(f==undefined?undefined:f.down)||"red";a=typeof a!=="undefined"&&a!==null?a:5;f=this.dndata.open.length;for(j=0;0<=f?j<f:j>f;0<=f?j+=1:j-=1)if(typeof(e=this.dndata.close[j])!=="undefined"&&e!==null){o=this.dndata.close[j][1]<this.dndata.open[j][1];k={};g=this.rawdata;for(m in g)if(l.call(g,m))k[m]=this.rawdata[m][j];this.set.push(this.r.sai.prim.candlestick(this.dndata.open[j][0],
o&&this.dndata.close[j][1]||this.dndata.open[j][1],o&&this.dndata.open[j][1]||this.dndata.close[j][1],this.dndata.high[j][1],this.dndata.low[j][1],a||5,j&&typeof(d=this.dndata.close[j-1])!=="undefined"&&d!==null&&this.dndata.close[j-1][1]<this.dndata.close[j][1]?h:i,!o,b,c,Sai.util.infoSetters(c,k)))}return this};Sai.BarPlot=function(){return Sai.Plot.apply(this,arguments)};n(Sai.BarPlot,Sai.Plot);Sai.BarPlot.prototype.render=function(f,a,b,c){var e,g,d,h,i,j,k;this.set.remove();i=0;d=[];f=f?this.r.sai.prim.stackedBar:
this.r.sai.prim.groupedBar;e=this.dndata;for(k in e)if(l.call(e,k)){i=this.dndata[k].length;d.push((a==undefined?undefined:a[k])||"black")}for(e=0;0<=i?e<i:e>i;0<=i?e+=1:e-=1){a=[];g=this.dndata;for(k in g)l.call(g,k)&&a.push(this.dndata[k][e]);h={};g=this.rawdata;for(j in g)if(l.call(g,j))h[j]=this.rawdata[j][e];this.set.push(f(a,d,this.w/i,this.y,b,c,Sai.util.infoSetters(c,h)))}return this};Sai.GeoPlot=function(){return Sai.Plot.apply(this,arguments)};n(Sai.GeoPlot,Sai.Plot);Sai.GeoPlot.prototype.getRegionColor=
function(f,a,b){return Sai.util.multiplyColor(f[b],(this.data[b][a]==undefined?undefined:this.data[b][a][1])||0,this.opts.fromWhite,this.opts.fromWhite?0.2:0).str};Sai.GeoPlot.prototype.getRegionOpacity=function(f,a){var b;return typeof(b=this.data[a][f]==undefined?undefined:this.data[a][f][1])!=="undefined"&&b!==null?1:this.opts.fromWhite?0.15:0.25};Sai.GeoPlot.prototype.render=function(f,a,b,c,e,g){var d,h,i,j,k;this.set.remove();j=this.rawdata.__LABELS__;k={};d=j.length;for(i=0;0<=d?i<d:i>d;0<=
d?i+=1:i-=1)k[j[i]]=i;d=a.paths;for(h in d)l.call(d,h)&&function(){var m,o,q,p,r,s=h;r=k[s];q=a.name[s];q={region:typeof q!=="undefined"&&q!==null?q:s};m=this.rawdata;for(o in m)if(l.call(m,o))q[o]=this.rawdata[o][r];o=this.getRegionColor(f,r,b);r=this.getRegionOpacity(r,b);p=Sai.util.infoSetters(g,q);return this.set.push(this.r.sai.prim.hoverShape(function(v,u,w,t){return function(x){return x.path(v).translate(w,t).scale(u,u,w,t)}}(a.paths[s],Math.min(this.w/a.width,this.h/a.height),this.x,this.y-
this.h),{fill:o,stroke:this.opts.fromWhite?"black":c,"stroke-width":0.5,opacity:r},e?[function(v){navigator.userAgent.toLowerCase().indexOf("msie")!==-1||navigator.userAgent.toLowerCase().indexOf("opera")!==-1||v.toFront();return p[0]()},p[1]]:null,e?[{"fill-opacity":0.75,"stroke-width":this.opts.fromWhite?2:0.5},{"fill-opacity":1,"stroke-width":0.5}]:null))}.call(this);d=this.set.getBBox();this.set.translate((this.w-d.width)/2,(this.h-d.height)/2);return this};Sai.ChromaticGeoPlot=function(){return Sai.GeoPlot.apply(this,
arguments)};n(Sai.ChromaticGeoPlot,Sai.GeoPlot);Sai.ChromaticGeoPlot.prototype.getRegionColor=function(f,a){var b,c,e,g,d,h;g=e=c=0;b=this.data;for(h in b)if(l.call(b,h)){d=Sai.util.multiplyColor(f[h],(this.data[h][a]==undefined?undefined:this.data[h][a][1])||0,this.opts.fromWhite);g+=d.r;e+=d.g;c+=d.b}return"rgb("+g+", "+e+", "+c+")"};Sai.ChromaticGeoPlot.prototype.getRegionOpacity=function(f){var a,b,c;a=this.data;for(c in a)if(l.call(a,c))if(typeof(b=this.data[c][f]==undefined?undefined:this.data[c][f][1])!==
"undefined"&&b!==null)return 1;return 0.25}})();(function(){var l=Object.prototype.hasOwnProperty,n=function(a,b){return function(){return a.apply(b,arguments)}},f=function(a,b){var c=function(){};c.prototype=b.prototype;a.prototype=new c;a.prototype.constructor=a;typeof b.extended==="function"&&b.extended(a);a.__superClass__=b.prototype};Sai.Chart=function(a,b,c,e,g,d,h){var i;this.opts=h;this.h=g;this.w=e;this.y=c;this.x=b;this.r=a;i=this;this.drawInfo=function(){return Sai.Chart.prototype.drawInfo.apply(i,arguments)};this.opts=typeof this.opts!==
"undefined"&&this.opts!==null?this.opts:{};this.opts.bgcolor=typeof this.opts.bgcolor!=="undefined"&&this.opts.bgcolor!==null?this.opts.bgcolor:"white";this.setData(d);this.padding={left:2,right:2,top:2,bottom:2};return this};Sai.Chart.prototype.groupsToNullPad=function(){return[]};Sai.Chart.prototype.nonNegativeGroups=function(){return[]};Sai.Chart.prototype.setData=function(a){var b,c,e,g,d,h,i,j,k;this.data={};for(k in a)if(l.call(a,k))this.data[k]=a[k]instanceof Array?a[k].slice(0):a[k];a=this.dataGroups(a);
j=this.nonNegativeGroups();for(i in a)if(l.call(a,i))if(function(){for(var m=0,o=j.length;m<o;m++)if(j[m]===i)return true;return false}.call(this)){c=a[i];b=0;for(e=c.length;b<e;b++){k=c[b];if(typeof(d=this.data[k])!=="undefined"&&d!==null){g=this.data[k].length;for(h=0;0<=g?h<g:h>g;0<=g?h+=1:h-=1)if(this.data[k][h]<0)this.data[k][h]*=-1}}}b=this.groupsToNullPad();d=0;for(c=b.length;d<c;d++){i=b[d];g=a[i];e=0;for(h=g.length;e<h;e++){k=g[e];this.nullPad(k)}}return this.normalize(this.data)};Sai.Chart.prototype.nullPad=
function(a){return a in this.data?this.data[a]=[null].concat(this.data[a].concat([null])):null};Sai.Chart.prototype.caresAbout=function(a){return!a.match("^__")};Sai.Chart.prototype.dataGroups=function(a){var b,c,e;b=[];for(e in a)l.call(a,e)&&this.caresAbout(e)&&b.push(e);c=[];for(e in a)l.call(a,e)&&e.match("^__")&&c.push(e);return{all:b,__META__:c}};Sai.Chart.prototype.getYAxisVals=function(a,b,c){var e,g,d;if(a===b)return[0,b,b*2];c=typeof c!=="undefined"&&c!==null?c:false;for(e=1;(b-a)*e<10;)e*=
10;a*=e;b*=e;d=Math.floor(g=Math.log(b-a)/Math.LN10-0.4);d=Math.pow(10,d);if(g%1>0.7&&!c)d*=4;else if(g%1>0.35&&!c)d*=2;g=Sai.util.round(a-(c?d/2.1:d/1.9),d);if(g<=0&&0<=a)g=0;a=Sai.util.round(b+(c?d/2.1:d/1.9),d);g/=e;a/=e;d/=e;e=[];for(b=g;g<=a?b<=a:b>=a;b+=d)e.push(Sai.util.round(b,d));return e};Sai.Chart.prototype.getMax=function(a,b){var c,e,g,d,h,i,j,k,m,o;return Math.max.apply(Math,function(){c=[];e=0;for(g=b.length;e<g;e++){o=b[e];if(typeof(k=a[o])!=="undefined"&&k!==null)c.push(Math.max.apply(Math,
function(){d=[];i=a[o];h=0;for(j=i.length;h<j;h++){m=i[h];typeof m!=="undefined"&&m!==null&&typeof m==="number"&&d.push(m)}return d}()))}return c}())};Sai.Chart.prototype.getMin=function(a,b){var c,e,g,d,h,i,j,k,m,o;return Math.min.apply(Math,function(){c=[];e=0;for(g=b.length;e<g;e++){o=b[e];if(typeof(k=a[o])!=="undefined"&&k!==null)c.push(Math.min.apply(Math,function(){d=[];i=a[o];h=0;for(j=i.length;h<j;h++){m=i[h];typeof m!=="undefined"&&m!==null&&typeof m==="number"&&d.push(m)}return d}()))}return c}())};
Sai.Chart.prototype.getStackedMax=function(a,b){var c,e,g,d,h,i,j;return Math.max.apply(Math,function(){c=[];e=this.data.__LABELS__.length;for(i=0;0<=e?i<e:i>e;0<=e?i+=1:i-=1)c.push(Sai.util.sumArray(function(){g=[];d=0;for(h=b.length;d<h;d++){j=b[d];g.push(a[j][i])}return g}()));return c}.call(this))};Sai.Chart.prototype.getStackedMin=function(){return 0};Sai.Chart.prototype.normalize=function(a){var b,c,e,g,d,h,i,j,k,m,o,q,p,r,s,v,u,w,t,x;r=this.dataGroups(a);this.ndata={};if(typeof(b=this.opts.stacked)!==
"undefined"&&b!==null)this.stackedNdata={};b=function(z,y,A){if(typeof z==="number")return y===A?1:(z-y)/(A-y);return null};for(p in r)if(l.call(r,p))if(!p.match("^__")){this.ndata[p]={};if(typeof(c=this.opts.stacked)!=="undefined"&&c!==null){this.stackedNdata[p]={};q={}}u=this.opts.stacked?this.getStackedMin:this.getMin;e=this.opts.stacked?this.getStackedMax:this.getMax;u=u(a,r[p]);v=e(a,r[p]);x=this.getYAxisVals(u,v);u=x[0];v=x[x.length-1];g=r[p];e=0;for(d=g.length;e<d;e++){t=g[e];if(typeof(h=a[t])!==
"undefined"&&h!==null){var B=this.ndata[p],C=t;i=[];j=a[t].length;for(s=0;0<=j?s<j:s>j;0<=j?s+=1:s-=1)i.push(typeof(k=a[t][s])!=="undefined"&&k!==null&&(w=b(a[t][s],u,v))!==null?[s/(a[t].length-1||1),w]:null);B[C]=i;if(typeof(o=this.opts.stacked)!=="undefined"&&o!==null){this.stackedNdata[p][t]=[];i=a[t].length;for(s=0;0<=i?s<i:s>i;0<=i?s+=1:s-=1){j=q[s]||0;j=[s/(a[t].length-1||1),typeof(m=a[t][s])!=="undefined"&&m!==null&&(w=b(a[t][s],u,v))!==null?w+j:j];this.stackedNdata[p][t].push(j);if(j!==null)q[s]=
j[1]}}this.ndata[p].__YVALS__=x}}}return[]};Sai.Chart.prototype.addAxes=function(a){var b,c;this.axisWidth=1.5;this.padding.top+=5;for(c=this.data.__LABELS__.length-1;this.data.__LABELS__.length-1<=0?c<=0:c>=0;this.data.__LABELS__.length-1<=0?c+=1:c-=1)if(typeof(b=this.data.__LABELS__[c])!=="undefined"&&b!==null){b=this.r.text(0,0,Sai.util.prettystr(this.data.__LABELS__[c]));this.padding.right+=b.getBBox().width/2;b.remove();break}this.vaxis=this.r.sai.prim.vaxis(this.ndata[a].__YVALS__,this.x+this.padding.left,
this.y-(this.padding.bottom+22),this.h-(this.padding.bottom+22+this.padding.top),this.axisWidth);this.vaxis.translate(this.vaxis.getBBox().width,0);this.padding.left+=this.vaxis.getBBox().width;this.haxis=this.r.sai.prim.haxis(this.data.__LABELS__,this.x+this.padding.left,this.y-this.padding.bottom,this.w-this.padding.left-this.padding.right,this.axisWidth);this.haxis.translate(0,-22);this.padding.bottom+=22;this.setPlotCoords();return this.r.set().push(this.haxis).push(this.vaxis)};Sai.Chart.prototype.setPlotCoords=
function(){this.px=this.x+this.padding.left;this.py=this.y-this.padding.bottom;this.pw=this.w-this.padding.left-this.padding.right;return this.ph=this.h-this.padding.bottom-this.padding.top};Sai.Chart.prototype.drawBG=function(){var a,b,c,e;return this.bg=this.r.rect(typeof(a=this.px)!=="undefined"&&a!==null&&this.px||this.x,typeof(b=this.py)!=="undefined"&&b!==null&&this.py-this.ph||this.y-this.h,typeof(c=this.pw)!=="undefined"&&c!==null&&this.pw||this.w,typeof(e=this.ph)!=="undefined"&&e!==null&&
this.ph||this.h).attr({fill:this.opts.bgcolor,"stroke-width":0,"stroke-opacity":0}).toBack()};Sai.Chart.prototype.logoPos=function(){return[this.px+this.pw-160-5,this.py-this.ph+5,160,34]};Sai.Chart.prototype.drawLogo=function(){var a;a=this.logoPos();return this.logo=this.r.image(Sai.imagePath+"logo.png",a[0],a[1],a[2],a[3]).attr({opacity:0.25})};Sai.Chart.prototype.render=function(){this.plot=typeof this.plot!=="undefined"&&this.plot!==null?this.plot:new Sai.Plot(this.r);this.plot.render();return this};
Sai.Chart.prototype.setColors=function(a){var b;this.colors=typeof this.colors!=="undefined"&&this.colors!==null?this.colors:{};for(b in a)if(l.call(a,b))if(b in this.data)this.colors[b]=a[b];return this};Sai.Chart.prototype.setColor=function(a,b){this.colors=typeof this.colors!=="undefined"&&this.colors!==null?this.colors:{};this.colors[a]=b;return this};Sai.Chart.prototype.drawGuideline=function(a,b){var c;b=typeof b!=="undefined"&&b!==null?b:"all";c=this.ndata[b].__YVALS__[0];if(!(a>c))return null;
c=(a-c)/(this.ndata[b].__YVALS__[this.ndata[b].__YVALS__.length-1]-c);this.guidelines=typeof this.guidelines!=="undefined"&&this.guidelines!==null?this.guidelines:this.r.set();c=new Sai.LinePlot(this.r,this.px,this.py,this.pw,this.ph,{guideline:[[0,c],[1,c]]});c.render({guideline:"#ccc"});return this.guidelines.push(c.set)};Sai.Chart.prototype.drawLegend=function(a){if(a=typeof a!=="undefined"&&a!==null?a:this.colors){this.legend=this.r.sai.prim.legend(this.x,this.y-this.padding.bottom,this.w,a);
this.padding.bottom+=this.legend.getBBox().height+15;return this.legend.translate((this.w-this.legend.getBBox().width)/2,0)}};Sai.Chart.prototype.drawTitle=function(){var a;if(typeof(a=this.opts.title)!=="undefined"&&a!==null){this.title=this.r.text(this.x+this.w/2,this.y-this.h,this.opts.title).attr({"font-size":20});this.title.translate(0,this.title.getBBox().height/2);return this.padding.top+=this.title.getBBox().height+5}};Sai.Chart.prototype.setupInfoSpace=function(){this.info_y=this.y-this.h+
this.padding.top;this.info_x=this.x+this.padding.left;this.info_w=this.w-this.padding.left-this.padding.right;return this.padding.top+=30};Sai.Chart.prototype.drawInfo=function(a,b){var c,e;b=typeof b!=="undefined"&&b!==null?b:true;a=typeof a!=="undefined"&&a!==null?a:typeof(c=this.default_info)!=="undefined"&&c!==null?this.default_info():{};if(b)this.info_data={};this.info&&this.info.remove();c=a;for(e in c)if(l.call(c,e))e.match("^__")||(this.info_data[e]=a[e]||"(no data)");return this.info=this.r.sai.prim.info(this.info_x,
this.info_y,this.info_w,this.info_data)};Sai.Chart.prototype.getIndex=function(a){a=Sai.util.transformCoords(a,this.r.canvas).x;return Math.round((this.data.__LABELS__.length-1)*(a-this.px)/this.pw)};Sai.LineChart=function(){return Sai.Chart.apply(this,arguments)};f(Sai.LineChart,Sai.Chart);Sai.LineChart.prototype.nonNegativeGroups=function(){return this.opts.stacked?["all"]:[]};Sai.LineChart.prototype.render=function(){var a,b,c,e;this.drawTitle();this.setupInfoSpace();this.drawLegend();this.addAxes("all");
this.drawBG();this.drawLogo();this.drawGuideline(0);this.lines=[];this.dots=this.r.set();c=typeof(a=this.opts.stacked)!=="undefined"&&a!==null?this.stackedNdata:this.ndata;this.plot=(new (this.opts.area?Sai.AreaPlot:Sai.LinePlot)(this.r,this.px,this.py,this.pw,this.ph,c.all)).render(this.colors,2,this.opts.stacked);a=c.all;for(e in a)if(l.call(a,e))if(e!=="__YVALS__"){b=this.colors&&this.colors[e]||"black";this.dots.push(this.r.circle(0,0,4).attr({fill:b}).hide())}this.r.set().push(this.bg,this.plot.set,
this.dots,this.logo,this.guidelines).mousemove(n(function(g){var d,h,i,j,k;i=this.getIndex(g);j={};g=c.all;for(e in g)if(l.call(g,e))if(typeof(d=this.data[e])!=="undefined"&&d!==null)j[e]=this.data[e][i];this.drawInfo(j);h=0;d=[];g=this.plot.dndata;for(e in g)if(l.call(g,e))e.match("^__")||d.push(function(){k=this.plot.dndata[e][i];typeof k!=="undefined"&&k!==null?this.dots[h].attr({cx:k[0],cy:k[1]}).show().toFront():this.dots[h].hide();return h++}.call(this));return d},this)).mouseout(n(function(){this.drawInfo({},
true);return this.dots.hide()},this));this.logo==undefined||this.logo.toFront();return this};Sai.Sparkline=function(){return Sai.Chart.apply(this,arguments)};f(Sai.Sparkline,Sai.Chart);Sai.Sparkline.prototype.dataGroups=function(){return{data:["data"]}};Sai.Sparkline.prototype.render=function(){this.drawBG();this.plots=this.r.set();this.plots.push((new Sai.LinePlot(this.r,this.x,this.y,this.w,this.h,this.ndata.data)).render({data:this.colors&&this.colors[series]||"black"},1).set);return this};Sai.BarChart=
function(){return Sai.Chart.apply(this,arguments)};f(Sai.BarChart,Sai.Chart);Sai.BarChart.prototype.getMin=function(){return 0};Sai.BarChart.prototype.groupsToNullPad=function(){var a,b,c;a=[];b=this.dataGroups();for(c in b)l.call(b,c)&&a.push(c);return a};Sai.BarChart.prototype.nonNegativeGroups=function(){var a,b,c;a=[];b=this.dataGroups();for(c in b)l.call(b,c)&&a.push(c);return a};Sai.BarChart.prototype.render=function(){var a,b,c,e,g,d,h;this.drawTitle();this.setupInfoSpace();this.drawLegend();
this.addAxes("all");this.drawLogo();this.drawBG();this.guidelines=this.r.set();b=this.ndata.all.__YVALS__;a=0;for(c=b.length;a<c;a++){h=b[a];this.drawGuideline(h)}this.plots=this.r.set();a={};c={};b=typeof(e=this.opts.stacked)!=="undefined"&&e!==null?this.stackedNdata:this.ndata;e=b.all;for(d in e)if(l.call(e,d))if(!d.match("^__")){a[d]=b.all[d];c[d]=this.data[d]}this.plots.push((new Sai.BarPlot(this.r,this.px,this.py,this.pw,this.ph,a,c)).render(typeof(g=this.opts.stacked)!=="undefined"&&g!==null,
this.colors,this.opts.interactive,this.drawInfo).set);this.logo==undefined||this.logo.toFront();return this};Sai.StockChart=function(){return Sai.Chart.apply(this,arguments)};f(Sai.StockChart,Sai.Chart);Sai.StockChart.prototype.groupsToNullPad=function(){var a,b,c;a=[];b=this.dataGroups();for(c in b)l.call(b,c)&&a.push(c);return a};Sai.StockChart.prototype.dataGroups=function(a){var b,c;b=[];for(c in a)if(l.call(a,c))if(this.caresAbout(c)&&!("__LABELS__"===c||"volume"===c))b.push(c);return{__META__:["__LABELS__"],
volume:["volume"],prices:b}};Sai.StockChart.prototype.nonNegativeGroups=function(){return["volume"]};Sai.StockChart.prototype.render=function(){var a,b,c,e,g,d,h;this.drawTitle();this.setupInfoSpace();e={};b=false;a=this.ndata.prices;for(h in a)if(l.call(a,h))if(!("open"===h||"close"===h||"high"===h||"low"===h)&&!h.match("^__")){e[h]=(this.colors==undefined?undefined:this.colors[h])||"black";b=true}b&&this.drawLegend(e);this.colors=typeof this.colors!=="undefined"&&this.colors!==null?this.colors:
{};this.colors.up=typeof this.colors.up!=="undefined"&&this.colors.up!==null?this.colors.up:"black";this.colors.down=typeof this.colors.down!=="undefined"&&this.colors.down!==null?this.colors.down:"red";this.colors.vol_up=typeof this.colors.vol_up!=="undefined"&&this.colors.vol_up!==null?this.colors.vol_up:"#666666";this.colors.vol_down=typeof this.colors.vol_down!=="undefined"&&this.colors.vol_down!==null?this.colors.vol_down:"#cc6666";this.addAxes("prices");this.drawLogo();this.drawBG();this.drawGuideline(0,
"prices");this.plots=this.r.set();e={up:[],down:[]};a={};b=this.ndata.prices;for(g in b)if(l.call(b,g))g.match("^__")||(a[g]=this.data[g]);if(typeof(c=this.data.volume)!=="undefined"&&c!==null)a.vol=this.data.volume;if("volume"in this.ndata.volume){c=this.ndata.volume.volume.length;for(g=0;0<=c?g<c:g>c;0<=c?g+=1:g-=1)if(this.ndata.volume.volume[g]!==null)if(g&&this.ndata.prices.close[g-1]&&this.ndata.prices.close[g][1]<this.ndata.prices.close[g-1][1]){e.down.push(this.ndata.volume.volume[g]);e.up.push([this.ndata.volume.volume[g][0],
0])}else{e.up.push(this.ndata.volume.volume[g]);e.down.push([this.ndata.volume.volume[g][0],0])}else{e.up.push([0,0]);e.down.push([0,0])}this.plots.push((new Sai.BarPlot(this.r,this.px,this.py,this.pw,this.ph*0.2,e,a)).render(true,{up:this.colors.vol_up,down:this.colors.vol_down}).set)}this.plots.push((new Sai.CandlestickPlot(this.r,this.px,this.py,this.pw,this.ph,{open:this.ndata.prices.open,close:this.ndata.prices.close,high:this.ndata.prices.high,low:this.ndata.prices.low},a)).render(this.colors,
Math.min(5,this.pw/this.ndata.prices.open.length-2)).set);g={};c=this.ndata.prices;for(h in c)if(l.call(c,h))"open"===h||"close"===h||"high"===h||"low"===h||h.match("^__")||(g[h]=this.ndata.prices[h]);this.plots.push((new Sai.LinePlot(this.r,this.px,this.py,this.pw,this.ph,g)).render(this.colors).set);d=this.pw/(this.data.__LABELS__.length-1);this.glow=this.r.rect(this.px-d/2,this.py-this.ph,d,this.ph).attr({fill:"0-"+this.opts.bgcolor+"-#DDAA99-"+this.opts.bgcolor,"stroke-width":0,"stroke-opacity":0}).toBack().hide();
this.bg.toBack();this.r.set().push(this.bg,this.plots,this.logo,this.glow,this.guidelines).mousemove(n(function(i){var j,k,m,o,q;m=this.getIndex(i);o={};q=false;i=this.ndata.prices;for(h in i)if(l.call(i,h))if(!h.match("^__"))if(typeof(j=this.data[h]==undefined?undefined:this.data[h][m])!=="undefined"&&j!==null){o[h]=this.data[h][m];q=true}if(typeof(k=this.data.volume==undefined?undefined:this.data.volume[m])!=="undefined"&&k!==null){o.volume=this.data.volume[m];q=true}this.drawInfo(o);return q?this.glow.attr({x:this.px+
d*(m-0.5)}).show():null},this)).mouseout(n(function(){this.drawInfo({},true);return this.glow.hide()},this));this.logo==undefined||this.logo.toFront();return this};Sai.GeoChart=function(){var a;a=this;this.renderPlot=function(){return Sai.GeoChart.prototype.renderPlot.apply(a,arguments)};return Sai.Chart.apply(this,arguments)};f(Sai.GeoChart,Sai.Chart);Sai.GeoChart.prototype.plotType=Sai.GeoPlot;Sai.GeoChart.prototype.interactiveHistogram=true;Sai.GeoChart.prototype.getMax=function(a){return Math.max.apply(Math,
a)};Sai.GeoChart.prototype.getMin=function(a){return Math.min.apply(Math,a)};Sai.GeoChart.prototype.normalize=function(a){var b,c,e,g,d,h,i,j,k,m,o,q,p;this.ndata={};this.bounds={};k={};m={};for(p in a)if(l.call(a,p))if(!p.match("^__"))if(typeof(b=a[p])!=="undefined"&&b!==null){c=[];g=a[p];e=0;for(d=g.length;e<d;e++){j=g[e];typeof j!=="undefined"&&j!==null&&c.push(j)}c=c;k[p]=this.getMax(c,p);if(!(typeof o!=="undefined"&&o!==null)||k[p]>o)o=k[p];m[p]=this.getMin(c,p);if(!(typeof q!=="undefined"&&
q!==null)||m[p]<q)q=m[p]}for(p in a)if(l.call(a,p))if(!p.match("^__"))if(typeof(h=a[p])!=="undefined"&&h!==null){if(this.opts.groupedNormalization){g=o;d=q}else{g=k[p];d=m[p]}this.bounds[p]=[d,g];j=this.ndata;var r=p;b=[];c=a[p].length;for(e=0;0<=c?e<c:e>c;0<=c?e+=1:e-=1)b.push(typeof(i=a[p][e])!=="undefined"&&i!==null?[e/(a[p].length-1),(a[p][e]-d)/(g-d)]:null);j[r]=b}return[]};Sai.GeoChart.prototype.dataGroups=function(a){var b,c;b=[];for(c in a)l.call(a,c)&&c.match("^__")&&b.push(c);b={__META__:b};
for(c in a)if(l.call(a,c))c.match("^__")||(b[c]=[c]);return b};Sai.GeoChart.prototype.drawHistogramLegend=function(a){var b,c,e,g,d,h,i,j,k,m,o,q,p,r;this.histogramLegend=this.r.set();k=Math.max(0.1*(this.h-this.padding.bottom-this.padding.top),50);p=Math.min(150,(this.w-this.padding.left-this.padding.right-20)/a.length);b=a.length;for(o=0;0<=b?o<b:o>b;0<=b?o+=1:o-=1){q=a[o];m=this.x+o*p;c=[];e=this.ndata[q].length;for(d=0;0<=e?d<e:d>e;0<=e?d+=1:d-=1)if(typeof(g=this.ndata[q][d])!=="undefined"&&g!==
null)c.push(this.ndata[q][d][1]);c=c;if(typeof(h=this.bounds==undefined?undefined:this.bounds[q])!=="undefined"&&h!==null){d=this.bounds[q];e=d[0];d=d[1]}else{e=[];i=this.data[q];d=0;for(j=i.length;d<j;d++){r=i[d];typeof r!=="undefined"&&r!==null&&e.push(r)}e=e;d=[Math.min.apply(Math,e),Math.max.apply(Math,e)];e=d[0];d=d[1]}d=this.getYAxisVals(e,d,true);e=d[0];d=d[d.length-1];this.histogramLegend.push(m=this.r.sai.prim.histogram(m,this.y-this.padding.bottom,p*0.8,k,c,e,d,q,this.colors[q],"white",
this.opts.fromWhite));this.opts.interactive&&this.setupHistogramInteraction(m,q)}this.histogramLegend.translate((this.w-this.padding.left-this.padding.right-this.histogramLegend.getBBox().width)/2,0);return this.padding.bottom+=k+5};Sai.GeoChart.prototype.setupHistogramInteraction=function(a,b){return a.click(n(function(){return this.renderPlot(b)},this)).hover(n(function(c){return n(function(){c.attr({"fill-opacity":0.75});return this.drawInfo({"Click to display on map":b})},this)},this)(a),n(function(c){return n(function(){c.attr({"fill-opacity":1});
return this.drawInfo()},this)},this)(a))};Sai.GeoChart.prototype.renderPlot=function(a){this.geoPlot==undefined||this.geoPlot.set.remove();this.geoPlot=(new this.plotType(this.r,this.px,this.py,this.pw,this.ph,this.ndata,this.data,{fromWhite:this.opts.fromWhite})).render(this.colors||{},this.data.__MAP__,a,this.opts.bgcolor,this.opts.interactive,this.drawInfo);return this.logo==undefined?undefined:this.logo.toFront()};Sai.GeoChart.prototype.default_info=function(){return{"":this.opts.interactive?
"Click histogram below to change map display":""}};Sai.GeoChart.prototype.render=function(){var a,b,c;this.drawTitle();this.setupInfoSpace();this.drawHistogramLegend(function(){a=[];b=this.data;for(c in b)if(l.call(b,c))c.match("^__")||a.push(c);return a}.call(this));this.setPlotCoords();this.drawLogo();this.drawBG();this.drawInfo();this.renderPlot(this.data.__DEFAULT__);return this};Sai.ChromaticGeoChart=function(){return Sai.GeoChart.apply(this,arguments)};f(Sai.ChromaticGeoChart,Sai.GeoChart);
Sai.ChromaticGeoChart.prototype.plotType=Sai.ChromaticGeoPlot;Sai.ChromaticGeoChart.prototype.interactiveHistogram=false;Sai.ChromaticGeoChart.prototype.default_info=function(){return{}};Sai.ChromaticGeoChart.prototype.setupHistogramInteraction=function(){return false}})();
