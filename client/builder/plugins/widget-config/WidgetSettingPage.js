// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See http://js.arcgis.com/3.15/esri/copyright.txt and http://www.arcgis.com/apps/webappbuilder/copyright.txt for details.
//>>built
require({cache:{"url:builder/plugins/widget-config/WidgetSettingPage.html":'\x3cdiv class\x3d"widget-setting-page"\x3e\r\n  \x3cdiv class\x3d"section common-setting" data-dojo-attach-point\x3d"commonSettingNode"\x3e\r\n    \x3cdiv class\x3d"basic"\x3e\r\n      \x3cdiv class\x3d"icon jimu-float-leading"\x3e\r\n        \x3cimg class\x3d"real-icon"  data-dojo-attach-point\x3d"iconNode"\x3e\r\n      \x3c/div\x3e\r\n      \x3cdiv class\x3d"right jimu-float-trailing jimu-leading-margin1"\x3e\r\n        \x3cinput data-dojo-type\x3d"dijit/form/ValidationTextBox" data-dojo-attach-point\x3d"labelNode" placeholder\x3d"${nls.widgetLabel}" required\x3d"true" class\x3d"widget-setting-input" tabindex\x3d"0"\x3e\r\n        \x3cdiv class\x3d"right-foot" data-dojo-attach-point\x3d"rightFooterNode"\x3e\r\n          \x3cdiv class\x3d"image-container"\x3e\r\n            \x3cdiv data-dojo-attach-point\x3d"imageChooserPlaceholder"\x3e\x3c/div\x3e\r\n            \x3c!-- \x3cspan nowrap class\x3d"change-icon" data-dojo-attach-point\x3d"changeNode"\x3e${nls.changeIcon}\x3c/span\x3e --\x3e\r\n            \x3ca class\x3d"help-link jimu-float-trailing" target\x3d"_blank" data-dojo-attach-point\x3d"helpNode"\x3e${nls.more}\x3c/a\x3e\r\n          \x3c/div\x3e\r\n        \x3c/div\x3e\r\n      \x3c/div\x3e\r\n    \x3c/div\x3e\r\n    \x3cdiv class\x3d"layout"\x3e\r\n    \x3c/div\x3e\r\n  \x3c/div\x3e\r\n  \x3cdiv class\x3d"section widget-setting" data-dojo-attach-point\x3d"widgetSettingNode"\x3e\x3c/div\x3e\r\n\x3c/div\x3e'}});
define("dojo/_base/declare dojo/_base/lang dojo/_base/html dojo/_base/array dojo/_base/config dojo/Deferred dojo/request dojo/topic dojo/aspect dojo/on dojo/mouse dojo/query dojo/string dojo/NodeList-dom dijit/_WidgetBase dijit/_TemplatedMixin dijit/_WidgetsInTemplateMixin dojo/text!./WidgetSettingPage.html ./WidgetDefaultSettingPage jimu/utils jimu/WidgetManager jimu/portalUrlUtils jimu/portalUtils jimu/dijit/ViewStack jimu/dijit/ImageChooser jimu/dijit/LoadingIndicator jimu/dijit/Message dijit/form/CheckBox esri/request".split(" "),
function(t,c,d,H,l,u,m,v,I,p,J,K,w,L,x,y,z,A,B,h,q,r,M,N,f,C,D,O,E){var F="en de es fr ja ru zh-cn zh-tw zh-hk ar it ko pl pt-br pt-pt ro".split(" "),G=[],n=null;return t([x,y,z],{templateString:A,startup:function(){this.inherited(arguments);this.own(m("builder/widgethelp.json",{handleAs:"json"}).then(function(a){n=a},function(a){console.error(a)}).always(c.hitch(this,function(){this.domNode&&(this.own(p(window,"resize",c.hitch(this,this.resize))),this.init())})))},init:function(){this.loading=new C;
d.addClass(this.loading.domNode,"load-widget-setting");this.loading.placeAt(this.widgetSettingNode);this.initCommonAttr();this.initWidgetAttr();this.resize()},resize:function(){var a=d.getContentBox(this.domNode);d.setStyle(this.widgetSettingNode,{height:a.h-94+"px"})},onCancel:function(){this.onClose();this.popup.close()},onOk:function(){var a=this._checkLabelExist();if(a)return new D({message:a}),!1;this.imageChooser.imageData&&(this.setting.icon=this.imageChooser.imageData);this.setting.label=
h.sanitizeHTML(this.labelNode.get("value"));if(this.settingDijit){var b=this.settingDijit.getConfig(!0);if(!1===b)return!1;b&&"function"===typeof b.then?b.then(c.hitch(this,function(a){if(!1===a)return!1;var b=this.settingDijit.getDataSources();b&&"function"===typeof b.then?b.then(c.hitch(this,function(b){this.setting.config=a;this.setting.provideDataSources=b;this._closeSettingPopup()})):(this.setting.config=a,this.setting.provideDataSources=b,this._closeSettingPopup())})):(a=this.settingDijit.getDataSources())&&
"function"===typeof a.then?a.then(c.hitch(this,function(a){this.setting.config=b;this.setting.provideDataSources=a;this._closeSettingPopup()})):(this.setting.config=b,this.setting.provideDataSources=a,this._closeSettingPopup())}else this._closeSettingPopup()},_closeSettingPopup:function(){delete this.setting.isDefaultConfig;v.publish("widgetSettingPageOk",this.setting,this.fromNode);this.onClose();this.popup.close()},_checkLabelExist:function(){var a=0,b=this.labelNode.get("value");if(""===w.trim(b))return this.nls.labelRequired;
var d=h.getControllerWidgets(this.appConfig);this.appConfig.visitElement(c.hitch(this,function(c){this.setting.id!==c.id&&c.label===b&&(0<d.length?a++:c.isOnScreen&&a++)}));return 0<a?this.nls.labelExists:""},onClose:function(){this.settingViewStack?(this.settingDijitUI.destroy(),this.settingDijitJSON.destroy(),this.settingViewStack.destroy()):this.settingDijit&&this.settingDijit.destroy()},_getHelpLink:function(a,b){var d=new u,e=null;a=a.toLowerCase();b="html"===(b||"html").toLowerCase()?"widgets2d":
"widgets3d";if(window.isXT)m("/webappbuilder/help/exists",{handleAs:"json"}).then(c.hitch(this,function(g){g&&g.exists?m("/webappbuilder/help/cxhelp.js",{handleAs:"json"}).then(c.hitch(this,function(g){var f="#";e=c.getObject("dev."+b+"."+a,!1,n);g&&g.m&&e&&g.m[e]?f="/webappbuilder/help/"+g.m[e]:e&&(f="/webappbuilder/help/"+e);d.resolve(f)}),c.hitch(this,function(a){console.warn(a);d.resolve("#")})):d.resolve("#")}),function(a){console.error(a);d.resolve("#")});else{var k=r.getPortalUrlFromLocation();
if(-1<k.indexOf("arcgis.com")){var f="#",e=c.getObject("online."+b+"."+a,!1,n);"widgets3d"===b||l.locale.toLowerCase().startWith("en")||-1<G.indexOf(a)||-1===F.indexOf(l.locale.toLowerCase())?(e&&(f="http://"+(-1<k.indexOf("maps.arcgis.com")?"doc":"docdev")+".arcgis.com/en/web-appbuilder/create-apps/"+e),d.resolve(f)):(f={url:r.getPortalSelfInfoUrl(k),content:{f:"json",culture:l.locale},handleAs:"json",callbackParamName:"callback",preventCache:!0},E(f).then(c.hitch(this,function(a){var b="#";if(a&&
a.helpBase&&e)try{b=a.helpBase.split("/").slice(0,4).join("/")+"/web-appbuilder/create-apps/"+e}catch(P){b="http://doc.arcgis.com/en/web-appbuilder/create-apps/"+e}d.resolve(b)}),c.hitch(this,function(a){console.warn(a);d.resolve("#")})))}else{var h=l.locale||"en",e=c.getObject("portal."+b+"."+a,!1,n);m(k+"sharing/rest/portals/helpmap?f\x3djson",{handleAs:"json"}).then(c.hitch(this,function(a){var b="#";a&&a.helpMap&&a.helpMap.m&&e&&a.helpMap.m[e]&&(b=k+"portalhelp/"+h+"/"+a.helpMap.m[e]);d.resolve(b)}),
c.hitch(this,function(a){console.warn(a);d.resolve("#")}))}}return d},initCommonAttr:function(){var a=h.processUrlInAppConfig(this.setting.icon);d.setAttr(this.iconNode,"src",a);window.isRTL&&this.setting.mirrorIconForRTL&&d.addClass(this.iconNode,"jimu-flipx");this.labelNode.set("value",this.setting.label);this._getHelpLink(this.setting.name,c.getObject("manifest.platform",!1,this.setting)).then(c.hitch(this,function(a){"#"!==a&&(d.setStyle(this.helpNode,"display","inline-block"),d.setAttr(this.helpNode,
"href",a))}));this.imageChooser=new f({goldenWidth:24,goldenHeight:24,format:[f.GIF,f.JPEG,f.PNG],label:this.nls.changeIcon},this.imageChooserPlaceholder);d.addClass(this.imageChooser.domNode,"jimu-float-leading");!1===this.setting.inPanel&&!0===this.setting.isOnScreen&&!0!==this.setting.closeable?(this.imageChooser.disableChooseImage(),d.setAttr(this.imageChooser.domNode,"title",this.nls.unableChangeIcon)):(this.imageChooser.enableChooseImage(),this.own(p(this.imageChooser,"imageChange",c.hitch(this,
function(a){this.iconNode.src=a;this.setting.icon=a}))))},initWidgetAttr:function(){!1===this.setting.hasConfig?this.widgetSettingNode.innerHTML='\x3cdiv class\x3d"noconfig-info"\x3e'+this.nls.noConfig+"\x3c/div\x3e":q.getInstance().tryLoadWidgetConfig(this.setting).then(c.hitch(this,function(a){this.setting.hasSettingPage?q.getInstance().loadWidgetSettingPage(this.setting).then(c.hitch(this,function(a){this.widgetSettingNode?(this.settingDijit=a,d.place(this.settingDijit.domNode,this.widgetSettingNode),
this.settingDijit.startup(),this.loading.destroy(),d.setAttr(this.widgetSettingNode,"data-widget-loaded","true")):a.destroy()})):this.widgetSettingNode&&(this.settingDijit=new B({config:this.setting.config}),d.place(this.settingDijit.domNode,this.widgetSettingNode),this.settingDijit.startup(),this.loading.destroy())}))},setAppConfig:function(a){this.appConfig=a}})});