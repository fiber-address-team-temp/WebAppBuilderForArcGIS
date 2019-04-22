define([
    'dojo/on',
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/dom-class',
    'dojo/json',
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
    "dojox/grid/DataGrid",
    "dojox/grid/cells",
    "dojox/grid/cells/dijit",
    "dojo/store/Memory",
    "dojo/data/ObjectStore",
    "dojo/date/locale",
    "dojo/currency",
    "dijit/form/DateTextBox",
    "dijit/form/TextBox",
    "dijit/form/HorizontalSlider",
    'dojo/data/ItemFileWriteStore',
    'dojox/uuid/generateRandomUuid',
    'dijit/form/Select',
    "dijit/form/TextBox",
    "dijit/registry",
    "dojo/number",
    ],
function(
    on,
    declare,
    lang,
    array,
    domClass,
    json,
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
    DataGrid,
    cells,
    cellsDijit,
    Memory,
    ObjectStore,
    locale,
    currency,
    DateTextBox,
    TextBox,
    HorizontalSlider,
    ItemFileWriteStore,
    generateRandomUuid,
    Select,
    TextBox,
    registry,
    num
) {
  const ERROR_LAYER_CONFIG = "Failed to configure Address Layer or Uncurated Address Layer. Please contact app admin.";
  const ERROR_GPSERVICE = "Geoprocessing service failed. Please contact app admin."

  return declare([BaseWidget], {

    name: 'Curate',
    baseClass: "curate",

    addressLayer: null,
    uncuratedLayer: null,
    curateGpUrl: null,

    selected: [], // {objectId, fasId} pairs

    grid: null,
    itemsAlreadyExist: [],
    id: 0,
    store: new ItemFileWriteStore({data: {identifier: "GLOBALID", items: []}}),

    gridLayout: [[
          {name: 'GLOBALID', field: 'GLOBALID', editable: false, width: 20},
          {
              name: 'ADDRESSTYPE',
              field: 'ADDRESSTYPE',
              editable: true,
              width: 15,
              type: cells.Select,
              options: ["ADDRESS_TYPE_SFU",
                        "ADDRESS_TYPE_TLC",
                        "ADDRESS_TYPE_NYU"]
          },
          {name: 'CITY', field: 'CITY', width: 10, editable: true},
          {name: 'STATE', field: 'STATE', width: 10, editable: true},
          {name: 'LATITUDE', field: 'LATITUDE', width: 10, editable: true},
          {name: 'LONGITUDE', field: 'LONGITUDE', width: 10, editable: true},
          {name: 'ZIPCODE', field: 'ZIPCODE', width: 10, editable: true},
          {
              name: 'PHYSICAL_ADDRESS_STATUS',
              styles: 'text-align: center;',
              field: 'PHYSICAL_ADDRESS_STATUS',
              width: 15,
              editable: true,
              type: cells.Select,
              options: ["PHYSICAL_STATUS_CURATE"]
          }
        ]],
    /*
    gridLayout: [{
        defaultCell: {editable: true, type: cells._Widget, styles: 'text-align: right;'},
        cells: [
            {name: 'Address Id', field: 'id', editable: false , width: 15},
            {
                name: 'Fiber Market', styles: 'text-align: center;', field: 'fiber_market', width: 10,
                type: cells.Select,
                options: ["FIBER_MARKET_ATL", "FIBER_MARKET_AUG", "FIBER_MARKET_NYU"]
            },
            {name: 'Street', field: 'street', width: 10},
            {name: 'Unit Number', field: 'unit_number', width: 10},
            {name: 'City', field: 'city', width: 10},
            {name: 'State', field: 'state', width: 10},
            {name: 'Zip Code', field: 'zip_code', width: 10},
            {
                name: 'Curation Reason', styles: 'text-align: center;', field: 'curation_reason', width: 10,
                type: cells.Select,
                options: ["CURATE_REASON_INVALID", "CURATE_REASON_ACCURACY", "CURATE_REASON_OUT_OF_MARKET", "CURATE_REASON_BAD_FORMAT"]
            }
        ]
    }],

    data: [
        {
            id: "{8476DCFB-551C-678D-E053-0334300AF2FA}",
            fiber_market: "FIBER_MARKET_ATL",
            street: "1600 Amphitheatre Parkway",
            unit_number: "1600",
            city: 'Mountain View',
            state: "CA",
            zip_code: "95014",
            curation_reason: "CURATE_REASON_INVALID",
        },
        {
            id: "{8476DCFB-551C-678D-E053-03343WESDWE}",
            fiber_market: "FIBER_MARKET_AUG",
            street: "1965 Woody Court",
            unit_number: "1878",
            city: 'San Jose',
            state: "CA",
            zip_code: "95134",
            curation_reason: "CURATE_REASON_ACCURACY",
        },
        {
            id: "{8476DCFB-551C-678D-EWEF3-03343WESDWE}",
            fiber_market: "FIBER_MARKET_NYU",
            street: "37234 Spruce Ter",
            unit_number: "8853",
            city: 'Fremont',
            state: "CA",
            zip_code: "94536",
            curation_reason: "CURATE_REASON_ACCURACY",
        },
        {
            id: "{8476DCFB-551C-678D-EWEF3-03343WESDWE}",
            fiber_market: "FIBER_MARKET_NYU",
            street: "38233 Crown Line Dr",
            unit_number: "2223",
            city: 'San Jose',
            state: "CA",
            zip_code: "94536",
            curation_reason: "CURATE_REASON_OUT_OF_MARKET",
        },
        {
            id: "{8476DCFB-551C-678D-EWEF3-03343WETWEE}",
            fiber_market: "FIBER_MARKET_NYU",
            street: "1746 View Dr",
            unit_number: "1746",
            city: 'San Jose',
            state: "CA",
            zip_code: "95035",
            curation_reason: "CURATE_REASON_OUT_OF_MARKET",
        },

    ],
    */
    postCreate: function() {
        this.inherited(arguments);

        this._setLayers().then(lang.hitch(this, function () {
            //this._updateSelection();
            this.dummyLoader.classList.add("hidden");
        }), lang.hitch(this, function () {
            this.dummyLoader.innerHTML(ERROR_LAYER_CONFIG);
        }));

        if (this.config.hasOwnProperty('curateGpUrl')) {
            this.curateGpUrl = this.config.curateGpUrl;
            console.log('Curate GP URL: ' + this.curateGpUrl);
        }

        this.own(on(this.createBtn, "click", lang.hitch(this, this._onCreate)));
        this.own(on(this.updateBtn, "click", lang.hitch(this, this._onUpdate)));
        this.own(on(this.deleteBtn, "click", lang.hitch(this, this._onDelete)));
        this.own(on(this.clearBtn, "click", lang.hitch(this, this._clearItems)));
        this.own(on(this.addAddressBtn, "click", lang.hitch(this, this._addAddressToStore)));

        const TOOLTIP_CONTENT = "<div class='tooltipContent'>" +
            "<b>Curate</b> appends your selected uncurated addresses to the design address table.</div>";

        const curateTooltip = new Tooltip({
            connectId: [this.curateTooltip],
            label: TOOLTIP_CONTENT,
            position: ["below"],
            style: "width:400px"
        });
    },

    startup: function () {
      this._initGrid();
      this._initInputBox();
      this._initSelectBox();
    },

    onOpen: function () {
        const panel = this.getPanel();
        panel.position.width = 1300;
        panel.position.height = 800;
        panel.setPosition(panel.position);
        panel.panelManager.normalizePanel(panel);
        console.log('onOpen');
    },

    _initGrid() {
      this.grid = new DataGrid({
          store: this.store,
          structure: this.gridLayout,
          autoHeight: true,
          autoWidth: true,
      }, this.gridDiv);
      this.grid.startup();
      this.grid.on("SelectionChanged", lang.hitch(this, this._selectionChange));
    },

    // _initInputBox() {
    //   const globalIdBox = registry.byId("globalId");
    //   const cityBox = registry.byId("city");
    //   const stateBox = registry.byId("state");
    //   const latitudeBox = registry.byId("latitude");
    //   const longitudeBox = registry.byId("longitude");
    //   const zipCodeBox = registry.byId("zipcode");
    //
    //   this.own(on(globalIdBox, "change", function() {
    //     console.log("value", globalIdBox.get("value") + " modified");
    //   }));
    //   /*
    //   on(box0, "change", function(){
    //     box1.set("value", box0.get("value") + " modified");
    //   });
    //   on(box0, "change", function(){
    //     box1.set("value", box0.get("value") + " modified");
    //   });
    //   on(box0, "change", function(){
    //     box1.set("value", box0.get("value") + " modified");
    //   });
    //   on(box0, "change", function(){
    //     box1.set("value", box0.get("value") + " modified");
    //   });
    //   on(box0, "change", function(){
    //     box1.set("value", box0.get("value") + " modified");
    //   });
    //   */
    // },
    _initInputBox() {
      const globalIdBox = new TextBox({
        id: "globalId",
      }, this.globalIdContainer)
      globalIdBox.startup()

      const cityBox = new TextBox({
        id: "city",
      }, this.cityContainer)
      cityBox.startup()

      const stateBox = new TextBox({
        id: "state",
      }, this.stateContainer)
      stateBox.startup()

      const latitudeBox = new TextBox({
        id: "latitude",
      }, this.latitudeContainer)
      latitudeBox.startup()

      const longitudeBox = new TextBox({
        id: "longitude",
      }, this.longitudeContainer)
      longitudeBox.startup()

      const zipCodeBox = new TextBox({
        id: "zipCode",
      }, this.zipCodeContainer)
      zipCodeBox.startup()
      // globalIdBox.on("change", function(){
      //   // console.log(globalIdBox.get("value"));
      //   //this.newAddressItem = lang.mixin(this.newAddressItem, { GLOBALID: globalIdBox.get("value")})
      //   // console.log(this.newAddressItem)
      // })
    },

    _initSelectBox() {
      const selectBox1 = new Select({
        name: "addressType",
        id: "addressType",
        options: [
            { label: "SFU", value: "Single Family Unit", selected: true},
            { label: "MDU", value: "Mutiple Dex Unit" },
        ]
      }, this.addressTypeContainer)
      selectBox1.startup()

      const selectBox2 = new Select({
          name: "physicalAddressStatus",
          id: "physicalAddressStatus",
          options: [
              { label: "Curated", value: "Curated", selected: true},
              { label: "Uncrated", value: "Uncurated" },
          ]
      }, this.physicalAddressStatusContainer)
      selectBox2.startup()
    },

    _selectionChange(){
      this.selectedCount.innerHTML = this.grid.selection.getSelected().length;
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

    // CURATE - selected uncurated addresses will be appended to the design address table
    _onUpdate: function(){
        this._updateAddressesInSpanner(this._deleteSelectedItems())
    },

    _onDelete: function(){
        this._deleteAddressesInSpanner(this._deleteSelectedItems());
    },

    _addAddressToStore: function() {
      const globalIdValue = registry.byId("globalId").get("value");
      const cityValue = registry.byId("city").get("value");
      const stateValue = registry.byId("state").get("value");
      const latitudeValue = registry.byId("latitude").get("value");
      const longitudeValue = registry.byId("longitude").get("value");
      const zipCodeValue = registry.byId("zipCode").get("value");

      const addressTypeValue = registry.byId("addressType").get("value");
      const physicalAddressStatusValue = registry.byId("physicalAddressStatus").get("value");

      const item = {
        GLOBALID: globalIdValue,
        CITY: cityValue,
        STATE: stateValue,
        LATITUDE: latitudeValue,
        LONGITUDE: longitudeValue,
        ZIPCODE: zipCodeValue,
        ADDRESSTYPE: addressTypeValue,
        PHYSICAL_ADDRESS_STATUS: physicalAddressStatusValue
      };
      this._addItem(globalIdValue, item);
    },

    _deleteSelectedItems: function() {
      const items = this.grid.selection.getSelected();
      const deleteCount = items.length
      console.log(`Delete ${deleteCount} item(s) from store.`)
      if(deleteCount){
        for (let i = 0; i < items.length; i ++) {
          const item = items[i];
          if(item !== null){
            /* Delete the item from the data store: */
            this.store.deleteItem(item);
          }
        }
        this.store.save()
      }
      this.recordCount.innerHTML -= deleteCount;
      return items;
    },

    _clearItems: function() {
      const allCount = this.grid.rowCount;
      console.log(`Clear all ${allCount} item(s) from store.`)
      // if(this.grid.rowCount){
      //   for (let i = 0; i < this.grid.rowCount; i ++) {
      //     var item = this.grid.getItem(i);
      //     console.log(item)
      //     this.store.deleteItem(item);
      //   }
      //   //this.store.save()
      // }
      this.store = new ItemFileWriteStore({data: {identifier: "GLOBALID", items: []}}),
      this.grid.setStore(this.store);
      // Reset record count
      this.recordCount.innerHTML = 0;
    },

    _addItem: function(checkedKey, item){
      this.store.fetch({query: { GLOBALID: checkedKey}, onComplete: lang.hitch(this, function(data){
        if(data.length === 0){
          this.store.newItem(item);
          this.recordCount.innerHTML ++;
        }
      })})
    },

    _updateAddressesInSpanner: function(items){
        console.log(items)
        // this._convertStoreDataToApiData(items);
        console.log("Send UPDATE request to one platform api.")
        // Implements delete table in spanner
        const getURL = "https://dog.ceo/api/breeds/image/random"
        const postURL = "https://httpbin.org/post"
        const postData = {name: "Yan Zhang", email: "zhayan@google.com"}
        request.get(getURL, {
            headers: {
              "X-Requested-With": null
            }
        }).then(function(response){
            console.log(`Test GET rest api: ${getURL}, Response: `, response);
        });

        request.post(postURL, {
            data: postData,
            headers: {
              "X-Requested-With": null
            }
        }).then(function(response){
            console.log(`Test POST rest api: ${postURL}, for POST data: ${json.stringify(postData)}, Response: `, response);
        });
    },

    _deleteAddressesInSpanner: function(items){
        console.log(items)
        //this._convertStoreDataToApiData(items);
        console.log("Send DELETE request to one platform api.")
        // Implements delete table in spanner
        const getURL = "https://dog.ceo/api/breeds/image/random"
        const postURL = "https://httpbin.org/post"
        const postData = {name: "Yan Zhang", email: "zhayan@google.com"}
        request.get(getURL, {
            headers: {
              "X-Requested-With": null
            }
        }).then(function(response){
            console.log(`Test GET rest api: ${getURL}, Response: `, response);
        });

        request.post(postURL, {
            data: postData,
            headers: {
              "X-Requested-With": null
            }
        }).then(function(response){
            console.log(`Test POST rest api: ${postURL}, for POST data: ${json.stringify(postData)}, Response: `, response);
        });
    },

    // _convertStoreDataToApiData: function(items){
    //     console.log("Convert dgrid store data to data posted for REST api.")
    //     // This method is to convet store data to json data posted for REST apis.
    //     // TODO: Implement it.
    //
    //     console.log(this.store)
    // },

    // CURATE - curate process
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
                    //this.uncuratedLayer.on("selection-clear", lang.hitch(this, this._updateSelection));
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
        const selected = this.uncuratedLayer.getSelectedFeatures();
        this._updateRecordCount();
        if(!!selected.length){
            for (let i = 0; i < selected.length; i ++) {
              //data.items.push(lang.mixin({ id: i + 1 }, selected[i]))
              const item = selected[i].attributes;
              const key = item['GLOBALID']
              // console.log(this.store.fetch({query: { GLOBALID: key}}))
              // if(this.store.fetchItemByIdentity(item['GLOBALID'])){
              //   this.store.newItem(item);
              // }
              this._addItem(key, item);
              // this.store.save();
              // console.log(this.store)
              // console.log(this.store)
              // //if(!this.itemsAlreadyExist.includes(item)) {
              //   const newItem  = lang.mixin({ id: generateRandomUuid()}, item)
              //   this.store.newItem(newItem);
              //   this.itemsAlreadyExist.push(item);
              // //}
              // console.log(this.store)
              // if(this.store.query(item).length === 0){
                // Extend id column
              // console.log(this.store)
              // console.log(item)
              // this.store.newItem(item);
              // this.store.save();
              // console.log(this.store)
              //}
            }
            // let store = new ItemFileWriteStore({data: data});
            // this.grid.setStore(store)
            domClass.remove(this.createBtn, 'disabled');
            domClass.remove(this.updateBtn, 'disabled');
            domClass.remove(this.deleteBtn, 'disabled');
            domClass.remove(this.clearBtn, 'disabled');
        } else {
            domClass.add(this.updateBtn, 'disabled');
            this._hideTransactionMessage();
        }
    },

    _updateRecordCount: function(){
      if(this.recordCount){
          this.recordCount.innerHTML = this.store._arrayOfAllItems.length;
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
