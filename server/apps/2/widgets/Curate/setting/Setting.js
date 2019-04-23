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
      if(config.hasOwnProperty("uncuratedLayerIndex")){
        this.uncuratedLayerDropdown.value = config.uncuratedLayerIndex;
      }
    },

    getConfig: function(){
      //To return the config data input by the user
      return {
        uncuratedLayerIndex: this.uncuratedLayerDropdown.value,
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
        var clone = option.cloneNode(true);
        this.uncuratedLayerDropdown.appendChild(clone);
      }));
      this.setConfig(this.config);
    }

  });
});
