///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 - 2018 Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////
define({
  "units": {
    "feetUnit": "Láb / négyzetláb",
    "milesUnit": "Mérföld / acre",
    "metersUnit": "Méter / négyzetméter",
    "kilometersUnit": "Kilométer / négyzetkilométer",
    "hectaresUnit": "Kilométer / hektár"
  },
  "analysisTab": {
    "analysisTabLabel": "Elemzés",
    "selectAnalysisLayerLabel": "Válasszon elemzési rétegeket",
    "addLayerLabel": "Rétegek hozzáadása",
    "noValidLayersForAnalysis": "Nincsenek érvényes rétegek a kiválasztott webtérképen.",
    "noValidFieldsForAnalysis": "Nincsenek érvényes mezők a kiválasztott webtérképen. Távolítsa el a kiválasztott réteget.",
    "addLayersHintText": "Tipp: Válassza ki az elemezni és jelentésben megjeleníteni kívánt rétegeket és mezőket",
    "addLayerNameTitle": "Réteg neve",
    "addFieldsLabel": "Mező hozzáadása",
    "addFieldsPopupTitle": "Mezők kiválasztása",
    "addFieldsNameTitle": "Mezőnevek",
    "aoiToolsLegendLabel": "Vizsgálati terület eszközei",
    "aoiToolsDescriptionLabel": "Eszközök engedélyezése a vizsgálati területek létrehozásához és felirataik megadásához",
    "placenameLabel": "Hely neve",
    "drawToolsLabel": "Rajzolóeszközök",
    "uploadShapeFileLabel": "Shapefile feltöltése",
    "coordinatesLabel": "Koordináták",
    "coordinatesDrpDwnHintText": "Tipp: Válassza ki a megadott sokszögelések megjelenítési mértékegységét",
    "coordinatesBearingDrpDwnHintText": "Tipp: Válassza ki a megadott sokszögelések megjelenítési irányszögét",
    "allowShapefilesUploadLabel": "Shapefile-ok feltöltésének engedélyezése az elemzéshez",
    "allowShapefilesUploadLabelHintText": "Tipp: A „Shapefile feltöltése az elemzésben” beállítás megjelenítése a Jelentés fülön",
    "allowVisibleLayerAnalysisLabel": "A nem látható rétegeket ne elemezze és ne jelenítse meg az eredményeiket",
    "allowVisibleLayerAnalysisHintText": "Tipp: A kikapcsolt vagy a méretarányhoz kapcsolódó láthatósági beállítások miatt nem látható rétegekről nem készül elemzés, illetve nem fognak szerepelni a nyomtatott vagy letöltött eredményekben.",
    "areaUnitsLabel": "Elemzési eredmények megjelenítése itt:",
    "maxFeatureForAnalysisLabel": "Elemzés vektoros elemeinek maximális száma",
    "maxFeatureForAnalysisHintText": "Tipp: Állítsa be az elemzés vektoros elemeinek maximális számát",
    "searchToleranceLabelText": "Keresési tolerancia",
    "searchToleranceHint": "Tipp: A keresési tolerancia csak pont- és vonalbemenetek elemzésénél használható",
    "placenameButtonText": "Hely neve",
    "drawToolsButtonText": "Rajzolás",
    "shapefileButtonText": "Shapefile",
    "coordinatesButtonText": "Koordináták",
    "invalidLayerErrorMsg": "Konfigurálja a mezőket a következőhöz:",
    "drawToolSelectableLayersLabel": "Jelölje ki a rajzeszköz kijelölési rétegeit",
    "drawToolSelectableLayersHint": "Tipp: Jelölje ki azokat a rétegeket, amelyek majd hozzáférhetők lesznek kijelölésre a rajzeszköz réteglistájában"
  },
  "downloadTab": {
    "downloadLegend": "Letöltési beállítások",
    "reportLegend": "Jelentésbeállítások",
    "downloadTabLabel": "Letöltés",
    "syncEnableOptionLabel": "Vektoros rétegek",
    "syncEnableOptionHint": "Tipp: Olyan vektoros elemek adatainak letöltésére szolgál, amelyek a feltüntetett formátumokban átfedésben vannak a vizsgálati területtel.",
    "syncEnableOptionNote": "Megjegyzés: A Fájl-geoadatbázis és Shapefile beállításokhoz olyan vektoros adatszolgáltatások szükségesek, amelyeknél engedélyezve van a szinkronizálás. A Shapefile formátumot csak az ArcGIS Online-alapú vektoros rétegek támogatják.",
    "extractDataTaskOptionLabel": "Adatkinyerési feladat téradatfeldolgozási szolgáltatás",
    "extractDataTaskOptionHint": "Tipp: Közzétett Adatkinyerési feladat geoprocessing szolgáltatás használata olyan vektoros elemek letöltéséhez, amelyek a File-geoadatbázis vagy Shapefile formátumokban átfedésben vannak a vizsgálati területtel.",
    "cannotDownloadOptionLabel": "Letöltés tiltása",
    "syncEnableTableHeaderTitle": {
      "layerNameLabel": "Réteg neve",
      "csvFileFormatLabel": "CSV",
      "fileGDBFormatLabel": "Fájl-geoadatbázis",
      "ShapefileFormatLabel": "Shapefile",
      "allowDownloadLabel": "Letöltés engedélyezése"
    },
    "setButtonLabel": "Beállítás",
    "GPTaskLabel": "Adja meg a téradatfeldolgozási szolgáltatás URL-jét",
    "printGPServiceLabel": "Nyomtatási szolgáltatás URL-címe",
    "setGPTaskTitle": "Adja meg a kötelező téradatfeldolgozó szolgáltatás URL-jét",
    "logoLabel": "Logó",
    "logoChooserHint": "Tipp: Kattintson a kép ikonra a kép cseréjéhez",
    "footnoteLabel": "Lábjegyzet",
    "columnTitleColorPickerLabel": "Oszlopcímek színe",
    "reportTitleLabel": "Jelentés címe",
    "errorMessages": {
      "invalidGPTaskURL": "Érvénytelen téradatfeldolgozási szolgáltatás. Válasszon olyan téradatfeldolgozási szolgáltatást, amely tartalmazza az Adatkinyerési feladatot.",
      "noExtractDataTaskURL": "Válasszon ki olyan téradat szolgáltatást, amely tartalmazza az Adatkinyerési feladatot.",
      "duplicateCustomOption": "Ismétlődő bejegyzés található a(z) ${duplicateValueSizeName} esetében.",
      "invalidLayoutWidth": "A(z) ${customLayoutOptionValue} értékhez megadott szélesség érvénytelen.",
      "invalidLayoutHeight": "A(z) ${customLayoutOptionValue} értékhez megadott magasság érvénytelen.",
      "invalidLayoutPageUnits": "A(z) ${customLayoutOptionValue} értékhez megadott térképlap-mértékegység érvénytelen.",
      "failtofetchbuddyTaskDimension": "Hiba történt a társfeladat méretinformációinak lekérése közben. Próbálja meg újra.",
      "failtofetchbuddyTaskName": "Hiba történt a társfeladat nevének lekérése közben. Próbálja meg újra.",
      "failtofetchChoiceList": "Hiba történt a választéklistának a nyomtatási szolgáltatásból való lekérése közben. Próbálja meg újra.",
      "invalidWidth": "Érvénytelen szélesség.",
      "invalidHeight": "Érvénytelen magasság."
    },
    "addCustomLayoutTitle": "Egyéni elrendezés hozzáadása",
    "customLayoutOptionHint": "Tipp: Adjon hozzá egyéni elrendezési beállítást a nyomtatási szolgáltatásból a nyomtatási beállításokhoz.",
    "reportDefaultOptionLabel": "Alapértelmezett elrendezés",
    "pageSizeUnits": {
      "millimeters": "Milliméter",
      "points": "Pontok"
    }
  },
  "generalTab": {
    "generalTabLabel": "Általános",
    "tabLabelsLegend": "Panelfeliratok",
    "tabLabelsHint": "Tipp: Adja meg a feliratokat",
    "AOITabLabel": "Vizsgálati terület panel",
    "ReportTabLabel": "Jelentés panel",
    "bufferSettingsLegend": "Bufferbeállítások",
    "defaultBufferDistanceLabel": "Alapértelmezett buffertávolság",
    "defaultBufferUnitsLabel": "Bufferegységek",
    "generalBufferSymbologyHint": "Tipp: Állítsa be a bufferek megjelenítéséhez használni kívánt szimbólumrendszert a meghatározott AOI területek körül",
    "aoiGraphicsSymbologyLegend": "Viszgálati terület grafikai szimbólumrendszere",
    "aoiGraphicsSymbologyHint": "Tipp: Állítsa be a pont, vonal és polygon típusú vizsgálati területek meghatározásához használni kívánt szimbólumrendszert",
    "pointSymbologyLabel": "Pont",
    "previewLabel": "Előnézet",
    "lineSymbologyLabel": "Vonal",
    "polygonSymbologyLabel": "Polygon",
    "aoiBufferSymbologyLabel": "Buffer-szimbólumrendszer",
    "pointSymbolChooserPopupTitle": "Cím vagy hely szimbóluma",
    "polygonSymbolChooserPopupTitle": "Polygon kiemeléséhez használt szimbólum kiválasztása",
    "lineSymbolChooserPopupTitle": "Vonal kiemeléséhez használt szimbólum kiválasztása",
    "aoiSymbolChooserPopupTitle": "Buffer szimbólumának beállítása",
    "aoiTabText": "Vizsgálati terület",
    "reportTabText": "Jelentés",
    "invalidSymbolValue": "Érvénytelen szimbólumérték."
  },
  "searchSourceSetting": {
    "searchSourceSettingTabTitle": "Keresési forrás beállításai",
    "searchSourceSettingTitle": "Keresési forrás beállításai",
    "searchSourceSettingTitleHintText": "Geokódoló szolgáltatások vagy vektoros rétegek hozzáadása és konfigurálása keresési forrásként. Ezek a megadott források határozzák meg, mi kereshető a keresőmezőben",
    "addSearchSourceLabel": "Keresési forrás hozzáadása",
    "featureLayerLabel": "Vektoros réteg",
    "geocoderLabel": "Geokódoló",
    "generalSettingLabel": "Általános beállítás",
    "allPlaceholderLabel": "Helyőrző szöveg az összes kereséséhez:",
    "allPlaceholderHintText": "Tipp: Adja meg az összes réteg és geokódoló keresésekor helyőrzőként megjelenítendő szöveget",
    "generalSettingCheckboxLabel": "Felugró ablak megjelenítése a megtalált vektoros elemhez vagy helyhez",
    "countryCode": "Ország- vagy régiókód(ok)",
    "countryCodeEg": "pl. ",
    "countryCodeHint": "Ha üresen hagyja ezt az értéket, a keresés minden országra és régióra ki fog terjedni",
    "questionMark": "?",
    "searchInCurrentMapExtent": "Csak az aktuális térképkiterjedésen belül keressen",
    "locatorUrl": "Geokódoló URL-címe",
    "locatorName": "Geokódoló neve",
    "locatorExample": "Példa",
    "locatorWarning": "A geokódoló szolgáltatás ezen verziója nem támogatott. A widget csak a 10.0 és újabb verziójú geokódoló szolgáltatást támogatja.",
    "locatorTips": "Nem érhetők el a javaslatok, mert a geokódoló szolgáltatás nem támogatja ezt a funkciót.",
    "layerSource": "Rétegforrás",
    "setLayerSource": "Rétegforrás beállítása",
    "setGeocoderURL": "Geokódoló URL-címének beállítása",
    "searchLayerTips": "Nem érhetők el a javaslatok, mert a vektoros adatszolgáltatás nem támogatja az oldalszámozást.",
    "placeholder": "Helyőrző szöveg",
    "searchFields": "Mezők keresése",
    "displayField": "Megjelenítési mező",
    "exactMatch": "Pontos találat",
    "maxSuggestions": "Javaslatok maximális száma",
    "maxResults": "Találatok maximális száma",
    "enableLocalSearch": "Helyi keresés engedélyezése",
    "minScale": "Min. méretarány",
    "minScaleHint": "Ha a térkép méretaránya nagyobb, mint ez a méretarány, akkor a helyi keresés lesz aktív",
    "radius": "Sugár",
    "radiusHint": "A térkép aktuális középpontja körül annak a területnek a sugarát határozza meg, amelyen belül megnő a geokódoló jelöltjeinek prioritása, hogy az adott helyhez legközelebb lévő jelöltek elsőbbséget élvezzenek",
    "setSearchFields": "Keresőmezők beállítása",
    "set": "Beállítás",
    "invalidUrlTip": "A(z) ${URL} URL-cím érvénytelen vagy nem érhető el.",
    "invalidSearchSources": "A keresési forrás beállításai érvénytelenek"
  },
  "errorMsg": {
    "textboxFieldsEmptyErrorMsg": "Töltse ki a kötelező mezőket",
    "bufferDistanceFieldsErrorMsg": "Adjon meg érvényes értékeket",
    "invalidSearchToleranceErrorMsg": "Adjon meg érvényes értéket a keresési toleranciához",
    "atLeastOneCheckboxCheckedErrorMsg": "Érvénytelen konfiguráció: Legalább egy vizsgálati terület eszköz szükséges.",
    "noLayerAvailableErrorMsg": "Nincsenek elérhető rétegek",
    "layerNotSupportedErrorMsg": "Nem támogatott ",
    "noFieldSelected": "Használja a szerkesztési műveletet az elemzéshez szükséges mezők kiválasztásához.",
    "duplicateFieldsLabels": "A(z) „${labelText}” címke többször van hozzáadva a következőhöz: „${itemNames}”",
    "noLayerSelected": "Válasszon legalább egy réteget az elemzéshez",
    "errorInSelectingLayer": "Nem sikerült befejezni a réteg kiválasztási műveletét. Próbálkozzon újra.",
    "errorInMaxFeatureCount": "Adjon meg érvényes értéket a maximális vektoros elemszámot az elemzéshez."
  }
});