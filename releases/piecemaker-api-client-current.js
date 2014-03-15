/**
 *	Piecemaker 2 API client (JavaScript version) for Motion Bank.
 *
 *	See: 
 *	  https://github.com/motionbank/piecemaker2-api
 *	  https://github.com/motionbank/piecemaker-api-client
 *
 *	Project:
 *	  http://piecemaker.org
 *	  http://motionbank.org
 *
 *	Version: 0.0.18, build: 826
 */
 (function(){var t=function(i){var e=function(a,b,c){this.context=this.api_key=this.host=void 0;var d=arguments[0];if(1===arguments.length&&"object"==typeof d)this.context=d.context||{},this.api_key=d.api_key||!1,this.host=d.host||d.base_url||"http://localhost:3000";else if(a&&"object"==typeof a&&(this.context=a),b&&"string"==typeof b&&(this.host=b),c&&"string"==typeof c)this.api_key=c;this.host+="/api/v1"};e.prototype.login=function(a,b,c){var d=c||g;if(!a||!b)throw"PieceMakerApi: need name and password to log user in";
var f=this;o(this,{url:f.host+"/user/login",data:{email:a,password:b},success:function(a){var b=null;a&&("api_access_key"in a&&a.api_access_key)&&(f.api_key=a.api_access_key,b=f.api_key);d.call(f.context||c,b)}})};e.prototype.logout=function(a){(a||g).call(this.context||a,null)};e.prototype.listUsers=function(a){var b=a||g,c=this;h(this,{url:c.host+"/users",success:function(d){b.call(c.context||a,d)}})};e.prototype.whoAmI=function(a){var b=a||g,c=this;h(this,{url:c.host+"/user/me",success:function(d){b.call(c.context||
a,d)}})};e.prototype.createUser=function(a,b,c,d){3===arguments.length&&(d=c,c="user");var f=d||g,r=this;o(r,{url:r.host+"/user",data:{name:a,email:b,user_role_id:c},success:function(a){f.call(r.context||d,a)}})};e.prototype.getUser=function(a,b){var c=b||g,d=this;h(this,{url:d.host+"/user/"+a,success:function(a){c.call(d.context||b,a)}})};e.prototype.updateUser=function(a,b,c,d,f,r,e){if(4===arguments.length)e=d;else if(7!==arguments.length)throw"Parameter exception: updateUser() expects 4 or 7 params";
var h=e||g,j=this,i={name:b,email:c};7===arguments.length&&(d&&(i.user_role_id=d),i.is_disabled=f?!0:!1,i.new_password=r?!0:!1);p(j,{url:j.host+"/user/"+a,data:i,success:function(a){h.call(j.context||e,a)}})};e.prototype.deleteUser=function(a,b){var c=b||g,d=this;q(this,{url:d.host+"/user/"+a,success:function(){c.call(d.context||b)}})};e.prototype.listGroups=function(a){var b=a||g,c=this;h(this,{url:c.host+"/groups",success:function(d){b.call(c.context||a,d)}})};e.prototype.listAllGroups=function(a){var b=
a||g,c=this;h(this,{url:c.host+"/groups/all",success:function(d){b.call(c.context||a,d)}})};e.prototype.createGroup=function(a,b,c){var d=c||g,f=this;if(!a)throw"createGroup(): title can not be empty";o(f,{url:f.host+"/group",data:{title:a,text:b||""},success:function(a){d.call(f.context||c,a)}})};e.prototype.getGroup=function(a,b){var c=b||g,d=this;h(this,{url:d.host+"/group/"+a,success:function(a){c.call(d.context||b,a)}})};e.prototype.updateGroup=function(a,b,c){var b=l(b),d=c||g,f=this;p(f,{url:f.host+
"/group/"+a,data:b,success:function(a){d.call(f.context||c,a)}})};e.prototype.deleteGroup=function(a,b){var c=b||g,d=this;q(this,{url:d.host+"/group/"+a,success:function(){c.call(d.context||b)}})};e.prototype.listGroupUsers=function(a,b){var c=b||g,d=this;h(this,{url:d.host+"/group/"+a+"/users",success:function(a){c.call(d.context||b,a)}})};e.prototype.addUserToGroup=function(a,b,c,d){var f=d||g,e=this;o(this,{url:e.host+"/group/"+a+"/user/"+b,data:{user_role_id:c},success:function(a){f.call(e.context||
d,a)}})};e.prototype.updateUserGroupRole=function(a,b,c,d){var f=d||g,e=this;p(this,{url:e.host+"/group/"+a+"/user/"+b,data:{user_role_id:c},success:function(a){f.call(e.context||d,a)}})};e.prototype.removeUserFromGroup=function(a,b,c){var d=c||g,f=this;q(this,{url:f.host+"/group/"+a+"/user/"+b,success:function(a){d.call(f.context||c,a)}})};e.prototype.listRoles=function(a){var b=a||g,c=this;h(this,{url:c.host+"/roles",success:function(d){b.call(c.context||a,d)}})};e.prototype.createRole=function(a,
b,c,d){2===arguments.length?(d=b,b=void 0):3===arguments.length&&(d=c,c=void 0);var f={id:a};b&&(f.inherit_from_id=b);c&&(f.text=c);var e=d||g,h=this;o(this,{url:h.host+"/role",data:f,success:function(a){e.call(h.context||d,a)}})};e.prototype.updateRole=function(a,b,c,d){2===arguments.length?(d=b,b=void 0):3===arguments.length&&(d=c,c=void 0);var f={};b&&(f.inherit_from_id=b);c&&(f.text=c);var e=d||g,h=this;p(this,{url:h.host+"/role/"+a,data:f,success:function(a){e.call(h.context||d,a)}})};e.prototype.deleteRole=
function(a,b){var c=b||g,d=this;q(this,{url:d.host+"/role/"+a,success:function(a){c.call(d.context||b,a)}})};e.prototype.getRole=function(a,b){var c=b||g,d=this;h(this,{url:d.host+"/role/"+a,success:function(a){c.call(d.context||b,a)}})};e.prototype.listPermissions=function(a){var b=a||g,c=this;h(this,{url:c.host+"/permissions",success:function(d){b.call(c.context||a,d)}})};e.prototype.addPermissionToRole=function(a,b,c,d){3===arguments.length&&(d=c);2==arguments.length&&(c="allow");var f=d||g,e=
this;o(this,{url:e.host+"/role/"+a+"/permission",data:{entity:b,permission:c},success:function(a){f.call(e.context||d,a)}})};e.prototype.updatePermissionForRole=function(a,b,c,d){var f=d||g,e=this;p(this,{url:e.host+"/role/"+a+"/permission/"+b,data:{permission:c},success:function(a){f.call(e.context||d,a)}})};e.prototype.removePermissionFromRole=function(a,b,c){var d=c||g,f=this;q(this,{url:f.host+"/role/"+a+"/permission/"+b,success:function(a){d.call(f.context||c,a)}})};e.prototype.getPermissionFromRole=
function(a,b,c){var d=c||g,f=this;h(this,{url:f.host+"/role/"+a+"/permission/"+b,success:function(a){d.call(f.context||c,a)}})};e.prototype.listEvents=function(a,b){var c=b||g,d=this;h(this,{url:d.host+"/group/"+a+"/events",success:function(a){c.call(d.context||b,j(a))}})};e.prototype.listEventsOfType=function(a,b,c){var d=c||g,f=this;h(this,{url:f.host+"/group/"+a+"/events",data:{type:b},success:function(a){d.call(f.context||c,j(a))}})};e.prototype.listEventsWithFields=function(){var a=arguments[0],
b={};if(3<arguments.length)for(var c=1;c<arguments.length-1;c+=2)b[arguments[c]]=arguments[c+1];else if("object"===typeof arguments[1])for(c in arguments[1])arguments[1].hasOwnProperty(c)&&(b[c]=arguments[1][c]);else throw"Wrong parameter count";var d=arguments[arguments.length-1],f=d||g,e=this;h(e,{url:e.host+"/group/"+a+"/events",data:{fields:b},success:function(a){f.call(e.context||d,j(a))}})};e.prototype.listEventsForTimespan=function(a,b,c,d,f){4===arguments.length&&(f=d);var e=f||g,i=this,k=
{from:null!==b?m(b):null,to:null!==c?m(c):null};5===arguments.length&&null!==d&&(d=d.toLowerCase(),-1===["utc_timestamp","intersect","contain"].indexOf(d)&&(d="intersect"),k.fromto_query=d);h(i,{url:i.host+"/group/"+a+"/events",data:k,success:function(a){e.call(i.context||f,j(a))}})};e.prototype.findEvents=function(a,b,c){var d=c||g,e=this;h(e,{url:e.host+"/group/"+a+"/events",data:l(b),success:function(a){d.call(e.context||c,j(a))}})};e.prototype.getEvent=function(a,b,c){var d=c||g,e=this;h(e,{url:e.host+
"/event/"+b,success:function(a){d.call(e.context||c,n(k(a)))}})};e.prototype.createEvent=function(a,b,c){var b=l(b),d=c||g,e=this;o(this,{url:e.host+"/group/"+a+"/event",data:b,success:function(a){d.call(e.context||c,n(k(a)))}})};e.prototype.updateEvent=function(a,b,c,d){c=l(c);c.event_group_id=a;var e=d||g,h=this;p(this,{url:h.host+"/event/"+b,data:c,success:function(a){e.call(h.context||d,n(k(a)))}})};e.prototype.deleteEvent=function(a,b,c){var d=c||g,e=this;"object"===typeof b&&"id"in b&&(b=b.id);
q(this,{url:e.host+"/event/"+b,success:function(a){d.call(e.context||c,n(k(a)))}})};e.prototype.getSystemTime=function(a){var b=a||g,c=this;h(this,{url:c.host+"/system/utc_timestamp",success:function(d){b.call(c.context||a,new Date(1E3*d.utc_timestamp))}})};e.prototype.createCallback=function(){if(1===arguments.length)return this.context[arguments[0]];if(2<=arguments.length){var a=1,b=this.context,c=arguments[0];if("string"!==typeof arguments[0]){b=arguments[0];if("string"!==typeof arguments[1])throw"createCallback(): if first argument is a target then the second needs to be a method name";
c=arguments[1];a=2}if(arguments.length>a){for(var d=[];a<arguments.length;a++)d.push(arguments[a]);var e=b,g=c;return function(a){a&&d.unshift(a);e[g].apply(e,d)}}return b[c]}throw"createCallback(): wrong number of arguments";};var g=function(){},l=function(a){if(!a||"object"!==typeof a)return a;if("entrySet"in a&&"function"===typeof a.entrySet){var b=a.entrySet();if(!b)return a;a={};for(b=b.iterator();b.hasNext();){var c=b.next(),d=c.getValue();d&&("object"===typeof d&&"entrySet"in d&&"function"===
typeof d.entrySet)&&(d=l(d));var e=c.getKey();if(!e)throw"Field key is not valid: "+e;a[c.getKey()]=d}return a}"utc_timestamp"in a&&(a.utc_timestamp=m(a.utc_timestamp));"created_at"in a&&(a.created_at=m(a.created_at));return a},j=function(a){if(a instanceof Array){for(var b=[],c=0;c<a.length;c++)b.push(n(k(a[c])));return b}return a},k=function(a){var b=a.event;b.fields={};for(var c=0,a=a.fields;c<a.length;c++)b.fields[a[c].id]=a[c].value;return b},n=function(a){a.fields.get=function(b){return a.fields[b]};
a.utc_timestamp=new Date(1E3*a.utc_timestamp);return a},m=function(a){return a instanceof Date?a.getTime()/1E3:9999999999<a?a/1E3:a},s=function(a,b,c,d,e){if(!a.api_key&&!b.match(/\/user\/login$/))throw"PieceMakerApi: need an API_KEY, please login first to obtain one";var g=(new Date).getTime(),h=b+".json";i({url:h,type:c,dataType:"json",data:d||{},context:a,success:function(){arguments&&(arguments[0]&&"object"===typeof arguments[0]&&!(arguments[0]instanceof Array)&&!("queryTime"in arguments[0]))&&
(arguments[0].queryTime=(new Date).getTime()-g);e.apply(a,arguments)},error:function(b){var d=-1,e="";b&&(d=b.status||b.statusCode,e=b.statusText||b.message||"No error message",b.responseText&&(e+=" "+b.responseText));if(a&&"piecemakerError"in a&&"function"==typeof a.piecemakerError)a.piecemakerError(d,e,c.toUpperCase()+" "+h);else throw"undefined"!==typeof console&&console.log&&console.log(d,e,h,c,b),b;},headers:{"X-Access-Key":a.api_key}})},h=function(a,b){s(a,b.url,"get",b.data,b.success)},p=function(a,
b){s(a,b.url,"put",b.data,b.success)},o=function(a,b){s(a,b.url,"post",b.data,b.success)},q=function(a,b){s(a,b.url,"delete",null,b.success)};return e};if("undefined"!==typeof module&&module.exports){var u=function(){throw"Seems like you are running in neither a browser nor Node. Can't help you there.";};if("undefined"!==typeof global)var v=require("url"),w=require("querystring"),x=require("http"),u=function(i){var e=v.parse(i.url),g=JSON.stringify(i.data),l=i.headers||{};l["Content-Type"]="application/json";
var j=null;if("get"!==i.type)l["Content-Length"]=Buffer.byteLength(g,"utf-8");else{var j=i.data||{},k;for(k in j)if(j.hasOwnProperty(k)&&"object"===typeof j[k]){var n=j[k],m;for(m in n)j[k+"["+m+"]"]=n[m];delete j[k]}j=w.stringify(j)}e=x.request({host:e.hostname,port:e.port||80,path:e.path+("get"===i.type&&j?"?"+j:""),method:i.type,headers:l},function(e){if(302===e.statusCode||300>=e.statusCode){var g="";e.on("data",function(e){g+=e});e.on("end",function(){i.success.apply(i.context,[JSON.parse(g)])})}else i.error.apply(null,
[e])});e.on("error",function(e){i.error&&i.error.apply(null,[e])});"get"!==i.type&&e.write(g);e.end()};module.exports=t(u)}else window&&!("PieceMakerApi"in window)&&(window.PieceMakerApi=t($.ajax))})();