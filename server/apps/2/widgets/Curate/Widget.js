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
    registry
) {

  return declare([BaseWidget], {

    name: 'Curate',
    baseClass: "curate",

    uncuratedLayer: null,

    selected: [],
    selTab: null,
    tabContainer: null,
    updateTableGrid: null,
    updateTableStore: new ItemFileWriteStore({data: {identifier: "GLOBALID", items: []}}),
    GridName: Object.freeze({UPDATE: "UPDATE", CREATE:  "CREATE"}),

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

    postCreate: function() {
        this.inherited(arguments);

        this._setLayers();

        this.own(on(this.updateBtn, "click", lang.hitch(this, this._onCurationUpdate)));
        this.own(on(this.deleteBtnUpdateTable, "click", lang.hitch(this, this._onCurationDeleteInUpdateTable)));
        this.own(on(this.clearBtnUpdateTable, "click", lang.hitch(this, this._clearItemsInUpdateTable)));

        this.own(on(this.createBtn, "click", lang.hitch(this, this._onCurationCreate)));
        this.own(on(this.deleteBtnCreateTable, "click", lang.hitch(this, this._onCurationDeleteInCreateTable)));
        this.own(on(this.clearBtnCreateTable, "click", lang.hitch(this, this._clearItemsInCreateTable)));

        this.own(on(this.addAddressBtnUpdate, "click", lang.hitch(this, this._addAddressToUpdateTableStore)));
        this.own(on(this.addAddressBtnCreate, "click", lang.hitch(this, this._addAddressToCreateTableStore)));

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
        panel.position.height = 415;
        panel.setPosition(panel.position);
        panel.panelManager.normalizePanel(panel);
    },

    _initTabContainer: function () {
      let tabs = [];
      tabs.push({
        title: "Update Addresses",
        content: this.tabNode1
      });
      tabs.push({
        title: "Create Addresses",
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
        this.updateTableGrid.render();
      })));
    },

    _initGrid() {
      this.updateTableGrid = new DataGrid({
          store: this.updateTableStore,
          structure: this.gridLayout,
          autoHeight: true,
          autoWidth: true,
      }, this.gridDivUpdateTable);
      this.updateTableGrid.startup();
      this.updateTableGrid.on("SelectionChanged", lang.hitch(this, this._selectionChange));
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
      this.selectedCountInUpdateTable.innerHTML = this.updateTableGrid.selection.getSelected().length;
    },

    _onCurationUpdate: function(){
        this._updateAddressesInSpanner(this._deleteSelectedItemsInTable(this.GridName.UPDATE))
    },

    _onCurationCreate: function(){
        this._createAddressesInSpanner(this._deleteSelectedItemsInTable(this.GridName.CREATE))
    },

    _onCurationDeleteInUpdateTable: function(){
        this._deleteAddressesInSpanner(this._deleteSelectedItemsInTable(this.GridName.UPDATE));
    },

    _onCurationDeleteInCreateTable: function(){
        this._deleteAddressesInSpanner(this._deleteSelectedItemsInTable(this.GridName.CREATE));
    },

    _fetchAddressItemInForm: function() {
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
      return item
    },

    _addAddressToUpdateTableStore: function() {
      this._addItem(this._fetchAddressItemInForm(), this.GridName.UPDATE);
    },

    _addAddressToCreateTableStore: function() {
      this._addItem(this._fetchAddressItemInForm(), this.GridName.UPDATE);
    },

    _deleteSelectedItemsInTable: function(gridName) {
      if(gridName === this.GridName.UPDATE) {
        const items = this.updateTableGrid.selection.getSelected();
        const updateTableDeletionCount = items.length
        console.log(`Delete ${updateTableDeletionCount} item(s) from store.`)
        if(updateTableDeletionCount){
          for (let i = 0; i < items.length; i ++) {
            const item = items[i];
            if(item !== null){
              this.updateTableStore.deleteItem(item);
            }
          }
          this.updateTableStore.save()
        }
        this.recordCountInUpdateTable.innerHTML -= updateTableDeletionCount;
        if(this.recordCountInUpdateTable.innerHTML === "0") {
          this._disableBtns(this.GridName.UPDATE);
        }
        return items;
      } else if (gridName === this.GridName.CREATE) {
        // TODO(XXX): Implement it.
      }
      return {};
    },

    _clearItemsInUpdateTable: function() {
      const updateTableAllCount = this.updateTableGrid.rowCount;
      console.log(`Clear all ${updateTableAllCount} item(s) from store.`)
      this.updateTableStore = new ItemFileWriteStore({data: {identifier: "GLOBALID", items: []}}),
      this.updateTableGrid.setStore(this.updateTableStore);
      this.recordCountInUpdateTable.innerHTML = 0;
      this._disableBtns(this.GridName.UPDATE)
    },

    _clearItemsInCreateTable: function() {
      // TODO(XXX): Implement it.
    },

    _disableBtns: function(gridName) {
      if(gridName === this.GridName.UPDATE){
        domClass.add(this.updateBtn, 'disabled');
        domClass.add(this.deleteBtnUpdateTable, 'disabled');
        domClass.add(this.clearBtnUpdateTable, 'disabled');
      } else {
        domClass.add(this.createBtn, 'disabled');
        domClass.add(this.deleteBtnCreateTable, 'disabled');
        domClass.add(this.clearBtnCreateTable, 'disabled');
      }
    },

    _addItem: function(item, gridName){
      if(gridName === this.GridName.UPDATE) {
        this.updateTableStore.fetch({query: { GLOBALID: item.GLOBALID}, onComplete: lang.hitch(this, function(data){
          if(data.length === 0){
            this.updateTableStore.newItem(item);
            this.recordCountInUpdateTable.innerHTML ++;
          }
        })})
        this.updateTableGrid.render();
      }
    },

    _createAddressesInSpanner: function(items){
        console.log("Create items:" + items)
        console.log("Send CREATE request to one platform api.")
        const getURL = "https://dog.ceo/api/breeds/image/random"
        const postURL = "https://httpbin.org/post"
        const postData = {items: items}
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
        const postData = {items: items}
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
        console.log("Send DELETE request to one platform api.")
        const getURL = "https://dog.ceo/api/breeds/image/random"
        const postURL = "https://httpbin.org/post"
        const postData = {items: items}
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
        if(this.recordCountInUpdateTable){
            this.recordCountInUpdateTable.innerHTML = this.updateTableStore._arrayOfAllItems.length;
        }
        if(!!selected.length){
            for (let i = 0; i < selected.length; i ++) {
              const item = selected[i].attributes;
              this._addItem(item, this.GridName.UPDATE);
            }
            domClass.remove(this.createBtn, 'disabled');
            domClass.remove(this.updateBtn, 'disabled');
            domClass.remove(this.deleteBtnUpdateTable, 'disabled');
            domClass.remove(this.clearBtnUpdateTable, 'disabled');
        } else {
            domClass.add(this.updateBtn, 'disabled');
        }
    },
  });
});
