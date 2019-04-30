define([
    'dojo/on',
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/dom-class',
    'dojo/json',
    'dojo/request',
    'dojo/Deferred',
    'jimu/BaseWidget',
    './jimu/LayerInfos/LayerInfos',
    './jimu/dijit/TabContainer',
    'dijit/Tooltip',
    "dojox/grid/DataGrid",
    "dojox/grid/cells",
    "dojox/grid/cells/dijit",
    "dojo/store/Memory",
    "dojo/data/ObjectStore",
    "dijit/form/DateTextBox",
    "dijit/form/TextBox",
    'dojo/data/ItemFileWriteStore',
    'dijit/form/Select',
    "dijit/form/TextBox",
    "dijit/form/Button",
    "dijit/ConfirmDialog",
    "dijit/registry",
    ],
function(
    on,
    declare,
    lang,
    domClass,
    json,
    request,
    Deferred,
    BaseWidget,
    LayerInfos,
    TabContainer,
    Tooltip,
    DataGrid,
    cells,
    cellsDijit,
    Memory,
    ObjectStore,
    DateTextBox,
    TextBox,
    ItemFileWriteStore,
    Select,
    TextBox,
    Button,
    ConfirmDialog,
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
    createTableGrid: null,
    updateTableStore: new ItemFileWriteStore({data: {identifier: "GLOBALID", items: []}}),
    createTableStore: new ItemFileWriteStore({data: {identifier: "GLOBALID", items: []}}),
    GridName: Object.freeze({UPDATE: "UPDATE", CREATE:  "CREATE"}),
    gridLayoutUpdateTable: [[
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
    gridLayoutCreateTable: lang.clone(this.gridLayoutUpdateTable),

    postCreate() {
        this.inherited(arguments);
        this._setLayers();

        // Update Addresses Table.
        this.own(on(this.updateBtn, "click", lang.hitch(this, function(){
          if(!domClass.contains(this.updateBtn, "disabled") && !!this.updateTableGrid.selection.getSelected().length){
            this.updateDialog.show();
          }
        })));
        this.own(on(this.deleteBtnUpdateTable, "click", lang.hitch(this, function(){
          if(!domClass.contains(this.deleteBtnUpdateTable, "disabled") && !!this.updateTableGrid.selection.getSelected().length){
            this.deleteDialog.show();
          }
        })));
        this.own(on(this.clearBtnUpdateTable, "click", lang.hitch(this, function(){
          if(!domClass.contains(this.clearBtnUpdateTable, "disabled")){
            this.clearItemsDialog.show();
          }
        })));

        // Create Addresses Table.
        this.own(on(this.createBtn, "click", lang.hitch(this, function(){
          if(!domClass.contains(this.createBtn, "disabled") && !!this.createTableGrid.selection.getSelected().length){
            this.createDialog.show();
          }
        })));
        this.own(on(this.deleteBtnCreateTable, "click", lang.hitch(this, function(){
          if(!domClass.contains(this.deleteBtnCreateTable, "disabled") && !!this.createTableGrid.selection.getSelected().length){
            this.deleteDialogTwo.show();
          }
        })));
        this.own(on(this.clearBtnCreateTable, "click", lang.hitch(this, function(){
          if(!domClass.contains(this.clearBtnCreateTable, "disabled")){
            this.clearItemsDialogTwo.show();
          }
        })));

        // Create Single Address Entry.
        this.own(on(this.addAddressBtnUpdate, "click", lang.hitch(this, function(){
          this._addItem(this._fetchAddressItemInForm(), this.GridName.UPDATE);
        })));
        this.own(on(this.addAddressBtnCreate, "click", lang.hitch(this, function(){
          this._addItem(this._fetchAddressItemInForm(), this.GridName.CREATE);
        })));

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

    startup() {
      this._initConfirmationDialog();
      this._initTabContainer();
      this._initGrid();
      this._initInputBox();
      this._initSelectBox();
    },

    _initConfirmationDialog() {
      this.updateDialog = new ConfirmDialog({
        title: "Curate Update Confirmation Dialog",
        content: "Are you sure to CURATE UPDATE selected item(s)?",
        style: "width: 300px",
        onExecute: lang.hitch(this, function(){
          this._updateAddressesInSpanner(this.updateTableGrid.selection.getSelected(), this.GridName.UPDATE);
        })
      })
      this.deleteDialog = new ConfirmDialog({
        title: "Curate Delete Confirmation Dialog",
        content: "Are you sure to CURATE DELETE selected item(s)?",
        style: "width: 300px",
        onExecute: lang.hitch(this, function(){
          this._deleteAddressesInSpanner(this.updateTableGrid.selection.getSelected(), this.GridName.UPDATE);
        })
      })
      this.clearItemsDialog = new ConfirmDialog({
        title: "Clear Item(s) Confirmation Dialog",
        content: "Are you sure to clear all item(s) in the table?",
        style: "width: 300px",
        onExecute: lang.hitch(this, function(){
          this._clearItems(this.GridName.UPDATE);
        })
      })
      this.createDialog = new ConfirmDialog({
        title: "Curate Create Confirmation Dialog",
        content: "Are you sure to CURATE CREATE selected item(s)?",
        style: "width: 300px",
        onExecute: lang.hitch(this, function(){
          this._updateAddressesInSpanner(this.createTableGrid.selection.getSelected(), this.GridName.CREATE);
        })
      })
      this.deleteDialogTwo = new ConfirmDialog({
        title: "Curate Delete Confirmation Dialog",
        content: "Are you sure to CURATE DELETE selected item(s)?",
        style: "width: 300px",
        onExecute: lang.hitch(this, function(){
          this._deleteAddressesInSpanner(this.createTableGrid.selection.getSelected(), this.GridName.CREATE);
        })
      })
      this.clearItemsDialogTwo = new ConfirmDialog({
        title: "Clear Item(s) Confirmation Dialog",
        content: "Are you sure to clear all item(s) in the table?",
        style: "width: 300px",
        onExecute: lang.hitch(this, function(){
          this._clearItems(this.GridName.CREATE);
        })
      })
    },

    onOpen() {
        const panel = this.getPanel();
        panel.position.width = 1300;
        panel.position.height = 415;
        panel.setPosition(panel.position);
        panel.panelManager.normalizePanel(panel);
    },

    _initTabContainer() {
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
        this.createTableGrid.render();
      })));
    },

    _initGrid() {
      this.updateTableGrid = new DataGrid({
          store: this.updateTableStore,
          structure: this.gridLayoutUpdateTable,
          autoHeight: true,
          autoWidth: true,
      }, this.gridDivUpdateTable);
      this.updateTableGrid.startup();
      this.updateTableGrid.on("SelectionChanged", lang.hitch(this, function(){
        this._selectionChange(this.GridName.UPDATE);
      }));

      this.createTableGrid = new DataGrid({
          store: this.createTableStore,
          structure: this.gridLayoutCreateTable,
          autoHeight: true,
          autoWidth: true,
      }, this.gridDivCreateTable);
      this.createTableGrid.startup();
      this.createTableGrid.on("SelectionChanged", lang.hitch(this, function(){
        this._selectionChange(this.GridName.CREATE);
      }));
    },

    _initInputBox() {
      const globalIdBox = new TextBox({
        id: "globalId",
      }, this.globalIdContainer);
      globalIdBox.startup();

      const cityBox = new TextBox({
        id: "city",
      }, this.cityContainer);
      cityBox.startup();

      const stateBox = new TextBox({
        id: "state",
      }, this.stateContainer);
      stateBox.startup();

      const latitudeBox = new TextBox({
        id: "latitude",
      }, this.latitudeContainer);
      latitudeBox.startup();

      const longitudeBox = new TextBox({
        id: "longitude",
      }, this.longitudeContainer);
      longitudeBox.startup();

      const zipCodeBox = new TextBox({
        id: "zipCode",
      }, this.zipCodeContainer);
      zipCodeBox.startup();
    },

    _initSelectBox() {
      const selectBox1 = new Select({
        name: "addressType",
        id: "addressType",
        options: [
            { label: "SFU", value: "Single Family Unit", selected: true},
            { label: "MDU", value: "Mutiple Dex Unit" },
        ]
      }, this.addressTypeContainer);
      selectBox1.startup();

      const selectBox2 = new Select({
          name: "physicalAddressStatus",
          id: "physicalAddressStatus",
          options: [
              { label: "Curated", value: "Curated", selected: true},
              { label: "Uncrated", value: "Uncurated" },
          ]
      }, this.physicalAddressStatusContainer);
      selectBox2.startup();
    },

    _selectionChange(gridName) {
      if(gridName === this.GridName.UPDATE){
        this.selectedCountInUpdateTable.innerHTML = this.updateTableGrid.selection.getSelected().length;
      } else {
        this.selectedCountInCreateTable.innerHTML = this.createTableGrid.selection.getSelected().length;
      }
    },

    _fetchAddressItemInForm() {
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

    _deleteSelectedItemsInTable(items, gridName) {
      if(gridName === this.GridName.UPDATE) {
        const updateTableDeletionCount = items.length
        console.log(`Delete ${updateTableDeletionCount} item(s) from store.`)
        if(updateTableDeletionCount){
          for (let i = 0; i < items.length; i ++) {
            const item = items[i];
            if(item !== null){
              this.updateTableStore.deleteItem(item);
            }
          }
          this.updateTableStore.save();
        }
        this.recordCountInUpdateTable.innerHTML -= updateTableDeletionCount;
        if(this.recordCountInUpdateTable.innerHTML === "0") {
          this._disableBtns(this.GridName.UPDATE);
        }
      } else {
        const createTableDeletionCount = items.length
        console.log(`Delete ${createTableDeletionCount} item(s) from store.`)
        if(createTableDeletionCount){
          for (let i = 0; i < items.length; i ++) {
            const item = items[i];
            if(item !== null){
              this.createTableStore.deleteItem(item);
            }
          }
          this.createTableStore.save();
        }
        this.recordCountInCreateTable.innerHTML -= createTableDeletionCount;
        if(this.recordCountInCreateTable.innerHTML === "0") {
          this._disableBtns(this.GridName.CREATE);
        }
      }
    },

    _clearItems(gridName) {
      if(gridName === this.GridName.UPDATE) {
        const updateTableAllCount = this.updateTableGrid.rowCount;
        console.log(`Clear all ${updateTableAllCount} item(s) from store.`);
        this.updateTableStore = new ItemFileWriteStore({data: {identifier: "GLOBALID", items: []}}),
        this.updateTableGrid.setStore(this.updateTableStore);
        this.recordCountInUpdateTable.innerHTML = 0;
        this._disableBtns(this.GridName.UPDATE)
      } else {
        const createTableAllCount = this.createTableGrid.rowCount;
        console.log(`Clear all ${createTableAllCount} item(s) from store.`);
        this.createTableStore = new ItemFileWriteStore({data: {identifier: "GLOBALID", items: []}}),
        this.createTableGrid.setStore(this.createTableStore);
        this.recordCountInCreateTable.innerHTML = 0;
        this._disableBtns(this.GridName.CREATE)
      }
    },

    _disableBtns(gridName) {
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

    _addItem(item, gridName) {
      if(gridName === this.GridName.UPDATE) {
        this.updateTableStore.fetch({query: { GLOBALID: item.GLOBALID}, onComplete: lang.hitch(this, function(data){
          if(data.length === 0){
            this.updateTableStore.newItem(item);
            this.recordCountInUpdateTable.innerHTML ++;
          }
        })})
        this.updateTableGrid.render();
      } else {
        this.createTableStore.fetch({query: { GLOBALID: item.GLOBALID}, onComplete: lang.hitch(this, function(data){
          if(data.length === 0){
            this.createTableStore.newItem(item);
            this.recordCountInCreateTable.innerHTML ++;
          }
        })})
        this.createTableGrid.render();
      }
    },

    _createAddressesInSpanner: function(items){
      console.log("Create items in spanner:" + items);
      const getURL = "https://dog.ceo/api/breeds/image/random";
      const postURL = "https://httpbin.org/post";
      const postData = {items};
      request.get(getURL, {
          headers: {
            "X-Requested-With": null
          }
      }).then(lang.hitch(this, function(response) {
          console.log(`Test GET rest api: ${getURL}, Response: `, response);
      }));
      request.post(postURL, {
          data: postData,
          headers: {
            "X-Requested-With": null
          }
      }).then(lang.hitch(this, function(response) {
        this._deleteSelectedItemsInTable(items, gridName);
        console.log(`Test POST rest api: ${postURL}, for POST data: ${json.stringify(postData)}, Response: `, response);
      }));
    },

    _updateAddressesInSpanner: function(items, gridName){
        console.log("Update items in spanner:" + items);
        const getURL = "https://dog.ceo/api/breeds/image/random";
        const postURL = "https://httpbin.org/post";
        const postData = {items};
        request.get(getURL, {
            headers: {
              "X-Requested-With": null
            }
        }).then(lang.hitch(this, function(response) {
            console.log(`Test GET rest api: ${getURL}, Response: `, response);
        }));
        request.post(postURL, {
            data: postData,
            headers: {
              "X-Requested-With": null
            }
        }).then(lang.hitch(this, function(response) {
          this._deleteSelectedItemsInTable(items, gridName);
          console.log(`Test POST rest api: ${postURL}, for POST data: ${json.stringify(postData)}, Response: `, response);
        }));
    },

    _deleteAddressesInSpanner(items, gridName) {
      console.log("Delete items in spanner:" + items);
      const getURL = "https://dog.ceo/api/breeds/image/random";
      const postURL = "https://httpbin.org/post";
      const postData = {items};
      request.get(getURL, {
          headers: {
            "X-Requested-With": null
          }
      }).then(lang.hitch(this, function(response) {
          console.log(`Test GET rest api: ${getURL}, Response: `, response);
      }));
      request.post(postURL, {
          data: postData,
          headers: {
            "X-Requested-With": null
          }
      }).then(lang.hitch(this, function(response) {
        this._deleteSelectedItemsInTable(items, gridName);
        console.log(`Test POST rest api: ${postURL}, for POST data: ${json.stringify(postData)}, Response: `, response);
      }));
    },

    _setLayers() {
        let deferred = new Deferred();
        if(this.map && this.map.itemInfo){
            LayerInfos.getInstance(this.map, this.map.itemInfo).then(lang.hitch(this, function(layerInfosObject){
                let layers = layerInfosObject.getLayerInfoArray();
                console.log(layers);
                if(this.config.hasOwnProperty("uncuratedLayerIndex")){
                    this.uncuratedLayer = layers[this.config.uncuratedLayerIndex].layerObject;
                    this.uncuratedLayer.on("selection-complete", lang.hitch(this, this._updateSelectionUpdateTable));
                    this.uncuratedLayer.on("selection-complete", lang.hitch(this, this._updateSelectionCreateTable));
                }
                if(this.uncuratedLayer !== null){
                    deferred.resolve();
                } else {
                    deferred.reject();
                }
            }));
        } else {
            console.log("Cannot access map itemInfo.");
            deferred.reject();
        }
        return deferred.promise;
    },

    _updateSelectionUpdateTable() {
        const selected = this.uncuratedLayer.getSelectedFeatures();
        if(this.recordCountInUpdateTable){
            this.recordCountInUpdateTable.innerHTML = this.updateTableStore._arrayOfAllItems.length;
        }
        if(!!selected.length){
            for (let i = 0; i < selected.length; i ++) {
              const item = selected[i].attributes;
              this._addItem(item, this.GridName.UPDATE);
            }
            domClass.remove(this.updateBtn, 'disabled');
            domClass.remove(this.deleteBtnUpdateTable, 'disabled');
            domClass.remove(this.clearBtnUpdateTable, 'disabled');
        } else {
            domClass.add(this.updateBtn, 'disabled');
        }
    },

    _updateSelectionCreateTable() {
        const selected = this.uncuratedLayer.getSelectedFeatures();
        if(this.recordCountInCreateTable){
            this.recordCountInCreateTable.innerHTML = this.createTableStore._arrayOfAllItems.length;
        }
        if(!!selected.length){
            for (let i = 0; i < selected.length; i ++) {
              const item = selected[i].attributes;
              this._addItem(item, this.GridName.CREATE);
            }
            domClass.remove(this.createBtn, 'disabled');
            domClass.remove(this.deleteBtnCreateTable, 'disabled');
            domClass.remove(this.clearBtnCreateTable, 'disabled');
        } else {
            domClass.add(this.createBtn, 'disabled');
        }
    },
  });
});
