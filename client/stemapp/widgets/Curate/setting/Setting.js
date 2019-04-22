define([
  'dojo/_base/array',
  'dojo/_base/declare',
  'dojo/_base/lang',
  'jimu/BaseWidgetSetting',
  'jimu/LayerInfos/LayerInfos',
],
function(
  array,
  declare, 
  lang,
  BaseWidgetSetting,
  LayerInfos
  ) 
{

  return declare([BaseWidgetSetting], {
    baseClass: 'my-widget-setting',

    postCreate: function(){
      //the config object is passed in - in this case, config is set in _createLayerSelectionDropdown();
      // this.setConfig(this.config);
      if(this.map && this.map.itemInfo){
        LayerInfos.getInstance(this.map, this.map.itemInfo).then(lang.hitch(this, this._createLayerSelectionDropdown));
      } 

    },

    setConfig: function(config){
      //To initialize the widget setting page depending on the widget config data
      if(config.hasOwnProperty("addressLayerIndex")){
        this.addressLayerDropdown.value = config.addressLayerIndex;
      }
      if(config.hasOwnProperty("uncuratedLayerIndex")){
        this.uncuratedLayerDropdown.value = config.uncuratedLayerIndex;
      }
      if(config.hasOwnProperty("curateGpUrl")){
        this.curateGpUrl.value = config.curateGpUrl;
      }
      if(config.hasOwnProperty("curateNoCopyGpUrl")){
        this.curateNoCopyGpUrl.value = config.curateNoCopyGpUrl;
      }
    },

    getConfig: function(){
      //To return the config data input by the user
      return {
        addressLayerIndex: this.addressLayerDropdown.value,
        uncuratedLayerIndex: this.uncuratedLayerDropdown.value,
        curateGpUrl: this.curateGpUrl.value,
        curateNoCopyGpUrl: this.curateNoCopyGpUrl.value,
      };
    },

    _createLayerSelectionDropdown: function(layerInfosObject){
      this.layers = layerInfosObject.getLayerInfoArray();
      array.forEach(this.layers, lang.hitch(this, function(layerInfo, index){
        var layerid = layerInfo.id;
        var option = document.createElement("option");
        option.innerHTML = layerInfo.title;
        option.setAttribute("layerid", layerid);
        option.setAttribute("value", index);
        this.addressLayerDropdown.appendChild(option);
        var clone = option.cloneNode(true);
        this.uncuratedLayerDropdown.appendChild(clone);
      }));
      this.setConfig(this.config);
    }

  });
});
