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
    './jimu/dijit/TabContainer',
    './jimu/utils',
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
    TabContainer,
    jimuUtils,
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

    uncuratedLayer: null,

    selected: [],
    selTab: null,
    grid: null,
    tabContainer: null,
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

        this._setLayers();

        this.own(on(this.updateBtn, "click", lang.hitch(this, this._onCurationUpdate)));
        this.own(on(this.deleteBtnUpdateTable, "click", lang.hitch(this, this._onCurationDelete)));
        this.own(on(this.clearBtnUpdateTable, "click", lang.hitch(this, this._clearItems)));
        this.own(on(this.createBtn, "click", lang.hitch(this, this._onCurationCreate)));
        this.own(on(this.deleteBtnCreateTable, "click", lang.hitch(this, this._onCurationDelete)));
        this.own(on(this.clearBtnCreateTable, "click", lang.hitch(this, this._clearItems)));
        this.own(on(this.addAddressBtnUpdate, "click", lang.hitch(this, this._addAddressToStore)));
        this.own(on(this.addAddressBtnCreate, "click", lang.hitch(this, this._addAddressToStore)));

        const TOOLTIP_CONTENT = "<div class='tooltipContent'>" +
            "<b>Curate</b> appends your selected uncurated addresses to the design address table.</div>";

        const curateTooltip = new Tooltip({
            connectId: [this.curateTooltipUpdate],
            label: TOOLTIP_CONTENT,
            position: ["below"],
            style: "width:400px"
        });

        const curateTooltipCreate = new Tooltip({
            connectId: [this.curateTooltipCreate],
            label: TOOLTIP_CONTENT,
            position: ["below"],
            style: "width:400px"
        });
    },

    startup: function () {
      this._initTabContainer();
      this._initGrid();
      this._initInputBox();
      this._initSelectBox();
    },

    onOpen: function () {
        const panel = this.getPanel();
        panel.position.width = 1300;
        panel.position.height = 500;
        panel.setPosition(panel.position);
        panel.panelManager.normalizePanel(panel);
        console.log('onOpen');
    },

    _initTabContainer: function () {
      let tabs = [];
      tabs.push({
        title: "Update Addresses Curation Table",
        content: this.tabNode1
      });
      tabs.push({
        title: "Create Addresses Curation Table",
        content: this.tabNode2
      });
      tabs.push({
        title: "Create Single Address Entry",
        content: this.tabNode3
      });
      this.tabContainer = new TabContainer({
        tabs: tabs,
        selected: this.selTab
      }, this.tabCurationTable);

      this.tabContainer.startup();
      this.own(on(this.tabContainer, "tabChanged", lang.hitch(this, function (title) {
        if (title !== "Results") {
          this.selTab = title;
        }
        // Refresh and render the store when tab change.
        this.grid.render();
      })));
      // jimuUtils.setVerticalCenter(this.tabContainer.domNode);
    },

    _initGrid() {
      this.grid = new DataGrid({
          store: this.store,
          structure: this.gridLayout,
          autoHeight: true,
          autoWidth: true,
      }, this.gridDivUpdateTable);
      this.grid.startup();
      this.grid.on("SelectionChanged", lang.hitch(this, this._selectionChange));
    },

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
      this.selectedCountUpdate.innerHTML = this.grid.selection.getSelected().length;
    },

    _onCurationCreate: function(){
        this._createAddressesInSpanner(this._deleteSelectedItems())
    },

    _onCurationUpdate: function(){
        this._updateAddressesInSpanner(this._deleteSelectedItems())
    },

    _onCurationDelete: function(){
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
            this.store.deleteItem(item);
          }
        }
        this.store.save()
      }
      this.recordCountUpdate.innerHTML -= deleteCount;
      return items;
    },

    _clearItems: function() {
      const allCount = this.grid.rowCount;
      console.log(`Clear all ${allCount} item(s) from store.`)
      this.store = new ItemFileWriteStore({data: {identifier: "GLOBALID", items: []}}),
      this.grid.setStore(this.store);
      this.recordCountUpdate.innerHTML = 0;
    },

    _addItem: function(checkedKey, item){
      this.store.fetch({query: { GLOBALID: checkedKey}, onComplete: lang.hitch(this, function(data){
        if(data.length === 0){
          this.store.newItem(item);
          this.recordCountUpdate.innerHTML ++;
        }
      })})
      this.grid.render();
    },

    _createAddressesInSpanner: function(items){
        console.log("Create items:" + items)
        console.log("Send CREATE request to one platform api.")
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

    _updateAddressesInSpanner: function(items){
        console.log("Update items:" + items)
        console.log("Send UPDATE request to one platform api.")
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
        console.log("Send DELETE request to one platform api.")
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

    _setLayers: function(){
        let deferred = new Deferred();
        if(this.map && this.map.itemInfo){
            LayerInfos.getInstance(this.map, this.map.itemInfo).then(lang.hitch(this, function(layerInfosObject){
                let layers = layerInfosObject.getLayerInfoArray();
                console.log(layers)
                if(this.config.hasOwnProperty("uncuratedLayerIndex")){
                    this.uncuratedLayer = layers[this.config.uncuratedLayerIndex].layerObject;
                    this.uncuratedLayer.on("selection-complete", lang.hitch(this, this._updateSelection));
                    //this.uncuratedLayer.on("selection-clear", lang.hitch(this, this._updateSelection));
                }
                if(this.uncuratedLayer !== null){
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
        this._updateRecordCountUpdate();
        if(!!selected.length){
            for (let i = 0; i < selected.length; i ++) {
              //data.items.push(lang.mixin({ id: i + 1 }, selected[i]))
              const item = selected[i].attributes;
              const key = item['GLOBALID']
              this._addItem(key, item);
            }
            domClass.remove(this.createBtn, 'disabled');
            domClass.remove(this.updateBtn, 'disabled');
            domClass.remove(this.deleteBtnUpdateTable, 'disabled');
            domClass.remove(this.clearBtnUpdateTable, 'disabled');
        } else {
            domClass.add(this.updateBtn, 'disabled');
            this._hideTransactionMessage();
        }
    },

    _updateRecordCountUpdate: function(){
      if(this.recordCountUpdate){
          this.recordCountUpdate.innerHTML = this.store._arrayOfAllItems.length;
      }
    },

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
