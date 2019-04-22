define([
    'dojo/on',
    'dojo/_base/declare', 
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/dom-class',
    'dojo/request',
    'esri/request',
    'esri/graphic',
    'dojo/Deferred',
    'jimu/BaseWidget',
    './jimu/LayerInfos/LayerInfos',
    './jimu/LayerStructure',
    // 'jimu/LayerInfos/LayerInfos',
    // 'jimu/LayerStructure',
    "esri/tasks/query",
    "esri/tasks/QueryTask",
    'esri/tasks/Geoprocessor',
    'dijit/Tooltip',
    ],
function(
    on, 
    declare,
    lang, 
    array,
    domClass,
    request,
    esriRequest,
    Graphic,
    Deferred,
    BaseWidget,
    LayerInfos,
    LayerStructure,
    Query,
    QueryTask,
    Geoprocessor,
    Tooltip,
) {
  const ERROR_LAYER_CONFIG = "Failed to configure Address Layer or Uncurated Address Layer. Please contact app admin.";
  const ERROR_GPSERVICE = "Geoprocessing service failed. Please contact app admin."

  return declare([BaseWidget], {

    name: 'Curate',
    baseClass: "curate",

    addressLayer: null,
    uncuratedLayer: null,
    curateGpUrl: null,
    curateNoCopyGpUrl: null,

    selected: [], // {objectId, fasId} pairs

    postCreate: function() {
      this.inherited(arguments);

      this._setLayers().then(lang.hitch(this, function(){
        this._updateSelection();
        this.dummyLoader.classList.add("hidden");
      }), lang.hitch(this, function(){
        this.dummyLoader.innerHTML(ERROR_LAYER_CONFIG);
      }));

      if(this.config.hasOwnProperty('curateGpUrl')){
        this.curateGpUrl = this.config.curateGpUrl;
        console.log('Curate GP URL: ' + this.curateGpUrl);
      }
      if(this.config.hasOwnProperty('curateNoCopyGpUrl')){
        this.curateNoCopyGpUrl = this.config.curateNoCopyGpUrl;
        console.log('Curate w/o Copy GP URL: ' + this.curateNoCopyGpUrl);
      }

      this.own(on(this.curateBtn, "click", lang.hitch(this, this._onCurate)));
      this.own(on(this.curateNoCopyBtn, "click", lang.hitch(this, this._curateWithoutCopy)));

      const TOOLTIP_CONTENT = "<div class='tooltipContent'>" + 
      "<b>Curate</b> appends your selected uncurated addresses to the design address table.<br>" + 
      "<b>Curate without Copying</b> only updates the curation status of selected uncurated addresses to be TRUE.</div>";

      const curateTooltip = new Tooltip({
        connectId: [this.curateTooltip],
        label: TOOLTIP_CONTENT,
        position: ["below"],
        style: "width:400px"
      });

    },

    _getSelectedAddresses(){
        if(this.uncuratedLayer !== null){
            selected = [];
            this.uncuratedLayer.getSelectedFeatures().forEach(function(graphic){
                if(graphic.attributes.hasOwnProperty("OBJECTID") && graphic.attributes.hasOwnProperty("FASID")){
                    selected.push({
                        objectId: graphic.attributes["OBJECTID"],
                        fasId: graphic.attributes["FASID"],
                        streetAddress: graphic.attributes["STREETADDRESS"],
                        unitNumber: graphic.attributes["UNITNUMBER"],
                        zipcode: graphic.attributes["ZIPCODE"]
                    });
                }
            });
            this.selected = selected;
        }
    },

    // CURATE WITHOUT COPY - only update the CURATION_STATUS of selected uncurated addresses to be true

    _curateWithoutCopy: function(){
        this._showLoader();
        this._hideTransactionMessage();
        this._getSelectedAddresses();
        this._runCurateNoCopyTask();
    },

    _runCurateNoCopyTask: function(){
        if(this.curateNoCopyGpUrl !== null){
            const gp = new Geoprocessor(this.curateNoCopyGpUrl);
            let expression = "OBJECTID IN (";
            this.selected.forEach(function(item){
                expression += item.objectId + ",";
            });
            expression = expression.substring(0, expression.length-1) + ")";
            const params = {
                expression: expression
            };
            gp.submitJob(params, lang.hitch(this, this._curateNoCopyGPComplete), lang.hitch(this, this._gpJobStatus), lang.hitch(this, this._gpJobFailed)); 
        } else {
            console.log("Curate w/o Copy GP endpoint was not configured correctly. Please contact app admin.");
        }
    },

    _curateNoCopyGPComplete: function(){
        console.log("SUCCESSFUL CURATION!");
        this.transactionSuccessCt.innerHTML = this.selected.length; 
        this._printDetails(this.selected, this.transactionSuccessMsg);
        domClass.remove(this.transactionSuccess, "hidden");
        this._hideLoader();
    },

    // CURATE - selected uncurated addresses will be appended to the design address table

    _onCurate: function(){
        this._showLoader();
        this._hideTransactionMessage();
        if(this.addressLayer !== null){
            this._getSelectedAddresses();
            this._validateSelected();
        } else {
            this._showError(ERROR_LAYER_CONFIG);
        }
    },

    _validateSelected: function(){
        // where1: FASID of uncurated addresses
        // where2: STREETADDRESS, UNITNUMBER, ZIPCODE of uncurated addresses
        let query = new Query();
        let where1 = "FASID IN (";
        let len1 = where1.length;
        let where2 = "";
        let invalid = [];
        this.selected.forEach(function(s){
            if(s.fasId !== null && s.fasId.replace(/\s+/g, '').length !== 0){
                where1 += "'" + s.fasId + "',"
            } else if(s.streetAddress !== null && s.zipcode !== null){
                where2 += "(STREETADDRESS='" + s.streetAddress + "' AND ZIPCODE='" + s.zipcode + "'";
                if(s.unitNumber !== null && s.unitNumber.replace(/\s+/g, '').length !== 0){
                    where2 += " AND UNITNUMBER='" + s.unitNumber + "'"
                } else {
                    where2 += " AND UNITNUMBER='null'"
                }
                where2 += ") OR ";
            }
            else {
                invalid.push(s.objectId);
            } 
        });
        if(where1.length > len1){
            where1 = where1.substring(0, where1.length-1) + ")";
            query.where = where2 + where1;
        } else {
            query.where = where2.substring(0, where2.length-4);
        }
        query.outFields = ["OBJECTID", "FASID", "STREETADDRESS", "UNITNUMBER", "ZIPCODE"];
        if(this.addressLayer !== null){
            this.addressLayer.queryFeatures(query, lang.hitch(this, this._validateSelectedCallback) , function(err){
                console.log("Fail to validate transaction by FASID.");
            });
        }
    },

    _validateSelectedCallback: function(featureSet){
        // where1: FASID of returned design addresses
        // where2: STREETADDRESS, UNITNUMBER, ZIPCODE of returned design addresses
        // where3: OBJECTID of uncurated addresses

        let query = new Query();
        let where1 = "FASID IN (";
        let where2 = "";

        // let selectedObjectIds = [];
        let where3 = "OBJECTID IN(";
        this.selected.forEach(function(s){
            // selectedObjectIds.push(s.objectId);
            where3 += "'" + s.objectId + "',"
        });
        // this.selectedObjectIds = selectedObjectIds;
        where3 = where3.substring(0, where3.length-1) + ")";


        if(featureSet.features){
            // console.log(featureSet.features);
            if(featureSet.features.length > 0){
                featureSet.features.forEach(function(f){
                    let fasId = f.attributes["FASID"];
                    let streetAddress = f.attributes["STREETADDRESS"];
                    let unitNumber = f.attributes["UNITNUMBER"];
                    let zipcode = f.attributes["ZIPCODE"];
                    if(fasId !== null && fasId.replace(/\s+/g, '').length !== 0){
                        where1 += "'" + fasId + "',"
                    } 
                    if(streetAddress !== null && zipcode !== null){
                        where2 += "(STREETADDRESS='" + streetAddress + "' AND ZIPCODE='" + zipcode + "'";
                        if(unitNumber !== null && unitNumber.replace(/\s+/g, '').length !== 0){
                            where2 += " AND UNITNUMBER='" + unitNumber + "'"
                        } else {
                            where2 += " AND UNITNUMBER='null'"
                        }
                        where2 += ") OR ";
                    }
                });

                where1 = where1.substring(0, where1.length-1) + ")";
                query.where = "(" + where2 + where1 +") AND " + where3;
                // console.log(query.where);
                query.outFields = ["OBJECTID", "FASID", "STREETADDRESS", "UNITNUMBER", "ZIPCODE"];
                this.uncuratedLayer.queryFeatures(query, lang.hitch(this, this._queryUncuratedCallback) , function(err){
                    console.log("Fail to query the uncurated address layer. [Err ref: 101]");
                });
                // this.selected.forEach(function(s){
                //     let objectId = s.objectId;
                //     let fasId = s.fasId;
                //     let streetAddress = s.streetAddress;
                //     let unitNumber = s.unitNumber;
                //     let zipcode = s.zipcode;

                //     if (fasId !== null){
                //         if(invalidFasid.indexOf(fasId) >= 0){
                //             existed.push(s);
                //         }
                //         else{
                //             nonexisted.push(s);
                //         }
                //     }
                //     else if(streetAddress !== null && unitNumber !== null && zipcode !== null){

                //     }
                //     else {
                //         cannotValidate.push(s);
                //     }
                // });
            }
            else{
                existed = [];
                nonexisted = this.selected;
                this.transactionSuccessCt.innerHTML = nonexisted.length; //count won't show up until curate GP is done.
                this.transactionWarningCt.innerHTML = existed.length;
                this.nonexisted = nonexisted;
                this._runCurateGPTask();
            }   
        }
    },

    _queryUncuratedCallback: function(featureSet){
        let existed = []; // will not be curated
        let nonexisted = []; // will be curated
        let existedObjectIds = [];
        if(featureSet.features){
            let features = featureSet.features;
            console.log(features);
            featureSet.features.forEach(function(f){
                let objectId = f.attributes['OBJECTID'];
                // let fasId = f.attributes["FASID"];
                // let streetAddress = f.attributes["STREETADDRESS"];
                // let unitNumber = f.attributes["UNITNUMBER"];
                // let zipcode = f.attributes["ZIPCODE"];
                existedObjectIds.push(objectId);
            });
        }
        this.selected.forEach(function(s){
            let objectId = s.objectId;
            if(existedObjectIds.indexOf(objectId) >= 0){
                existed.push(s);
            } else {
                nonexisted.push(s);
            }
        });

        this.transactionSuccessCt.innerHTML = nonexisted.length; //count won't show up until curate GP is done.
        this.transactionWarningCt.innerHTML = existed.length;
        if(existed.length > 0){
            this._warnExistence(existed);
        }
        if(nonexisted.length > 0){
            this.nonexisted = nonexisted;
            this._runCurateGPTask();
        } else {
            console.log("There's NOTHING to curate.");
            this._hideLoader();
        } 
    },

    _runCurateGPTask: function(){
        if(this.curateGpUrl !== null){
            const gp = new Geoprocessor(this.curateGpUrl);
            let expression = "OBJECTID IN (";
            this.nonexisted.forEach(function(item){
                expression += item.objectId + ",";
            });
            expression = expression.substring(0, expression.length-1) + ")";
            const params = {
                expression: expression
            };
            gp.submitJob(params, lang.hitch(this, this._curateGPComplete), lang.hitch(this, this._gpJobStatus), lang.hitch(this, this._gpJobFailed)); 
        } else {
            console.log("Curate GP endpoint was not configured correctly. Please contact app admin.");
        }
    },

    _curateGPComplete: function(){
        console.log("SUCCESSFUL CURATION!");
        this._printDetails(this.nonexisted, this.transactionSuccessMsg);
        domClass.remove(this.transactionSuccess, "hidden");
        this._hideLoader();
    },

    _gpJobStatus: function(){
      console.log('statusCallback here');
    },

    _gpJobFailed: function(res){
      console.log('gpErrback here');
      this._showError(ERROR_GPSERVICE);
      this._hideLoader();
    },
 
    _warnExistence: function(existed){
        this._printDetails(existed, this.transactionWarningMsg);
        domClass.remove(this.transactionWarning, 'hidden');
    },

    _setLayers: function(){
        let deferred = new Deferred();
        if(this.map && this.map.itemInfo){
            LayerInfos.getInstance(this.map, this.map.itemInfo).then(lang.hitch(this, function(layerInfosObject){
                let layers = layerInfosObject.getLayerInfoArray();
                if(this.config.hasOwnProperty("addressLayerIndex")){
                    this.addressLayer = layers[this.config.addressLayerIndex].layerObject;
                }
                if(this.config.hasOwnProperty("uncuratedLayerIndex")){
                    this.uncuratedLayer = layers[this.config.uncuratedLayerIndex].layerObject;
                    this.uncuratedLayer.on("selection-complete", lang.hitch(this, this._updateSelection));
                    this.uncuratedLayer.on("selection-clear", lang.hitch(this, this._updateSelection));
                }
                if(this.addressLayer !== null && this.uncuratedLayer !== null){
                    deferred.resolve();
                } else {
                    deferred.reject();
                }
            }));
        } else {
            console.log("Cannot access map itemInfo.")
            deferred.reject();
        } 
        return deferred.promise;
    },

    _updateSelection: function(){
        var selected = this.uncuratedLayer.getSelectedFeatures();
        if(this.selectionCt){
            this.selectionCt.innerHTML = selected.length;
        }
        if(selected.length > 0){
            domClass.remove(this.curateBtn, 'disabled');
            domClass.remove(this.curateNoCopyBtn, 'disabled');
        } else {
            domClass.add(this.curateBtn, 'disabled');
            domClass.add(this.curateNoCopyBtn, 'disabled');
            this._hideTransactionMessage();
        }
    },

    // **** TRANSACTION RESULT ****

    _showTransactionPreview: function(){
        var len = this.transaction.length > 3? 3: this.transaction.length;
        for(var i=0; i< len; i++){
            var div = document.createElement("div");
            div.innerHTML = "FASID - "  + this.transaction[i].attributes.FASID;
            this.transactionPreview.appendChild(div);
        }
        if(this.transaction.length > 3){
            var div = document.createElement("div");
            div.innerHTML = "And " + (this.transaction.length - 3) + " more..."
            this.transactionPreview.appendChild(div);
        }
    },

    _hideTransactionPreview: function(){
        while(this.transactionPreview.firstChild){
            this.transactionPreview.removeChild(this.transactionPreview.firstChild);
        }
    },

    _showLoader: function(){
        domClass.remove(this.transactionLoader, 'hidden');
    },

    _hideLoader: function(){
        domClass.add(this.transactionLoader, 'hidden');
    },

    _hideTransactionMessage: function(){
        domClass.add(this.transactionSuccess, 'hidden');
        domClass.add(this.transactionWarning, 'hidden');
        domClass.add(this.transactionError, 'hidden');
    },

    _printDetails: function(msgArray, dom){
        while(dom.firstChild){
            dom.removeChild(dom.firstChild);
        }
        var len = msgArray.length > 3? 3: msgArray.length;
        for(var i=0; i< len; i++){
            var div = document.createElement("div");
            div.innerHTML = "OBJECTID: " + msgArray[i].objectId + ", ";
            div.innerHTML += "FASID: "  + msgArray[i].fasId ;
            dom.appendChild(div);
        }
        if(msgArray.length > 3){
            var div = document.createElement("div");
            div.innerHTML = "And " + (msgArray.length - 3) + " more..."
            dom.appendChild(div);
        }
    },

    _showError: function(err){
        this.transactionErrorMsg.innerHTML = err == undefined? "ERR_MESSAGE" : err;
        if(this.transactionError.classList.contains("hidden")){
            this.transactionError.classList.remove("hidden");
        }
    },

    // startup: function() {
    //   this.inherited(arguments);
    //   console.log('Curate::startup');
    // },

    // onOpen: function(){
    //   console.log('Curate::onOpen');
    // },

    // onClose: function(){
    //   console.log('Curate::onClose');
    // },

    // onMinimize: function(){
    //   console.log('Curate::onMinimize');
    // },

    // onMaximize: function(){
    //   console.log('Curate::onMaximize');
    // },

    // onSignIn: function(credential){
    //   console.log('Curate::onSignIn', credential);
    // },

    // onSignOut: function(){
    //   console.log('Curate::onSignOut');
    // }

    // onPositionChange: function(){
    //   console.log('Curate::onPositionChange');
    // },

    // resize: function(){
    //   console.log('Curate::resize');
    // }

  });

});
