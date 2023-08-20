function addFastQueryClickLatlng(e){
    var clickGeoPoint = {
        "type": "Feature",
        "properties": {
        },
        "geometry": {
            "type": "Point",
            "coordinates": [e.latlng.lng, e.latlng.lat]
        }
    };
    if (geoJsonlayersGroup!=undefined||geoJsonlayersGroup!=null) geoJsonlayersGroup.clearLayers();
    queryByDistance(clickGeoPoint);
}

function queryByDistance(clickGeoPoint) {
    var paramJingshi = new SuperMap.FilterParameter({
        name: "井室@给水构筑物#1"
    });
    var paramShuichang = new SuperMap.FilterParameter({
        name: "水厂@给水构筑物#1"
    });
    var paramGouzhuwu = new SuperMap.FilterParameter({
        name: "构筑物@给水构筑物#1"
    });
    var paramBengzhan = new SuperMap.FilterParameter({
        name: "泵站@给水构筑物#1"
    });
    var paramJiancedian = new SuperMap.FilterParameter({
        name: "监测点@事件点#1"
    });
    var paramWeixiudian = new SuperMap.FilterParameter({
        name: "维修点@事件点#1"
    });
    var paramJiliangdian = new SuperMap.FilterParameter({
        name: "计量点@管网设施#1"
    });
    var paramGuanjian = new SuperMap.FilterParameter({
        name: "管件@管网设施#1"
    });
    var paramKongzhifa = new SuperMap.FilterParameter({
        name: "控制阀@管网设施#1"
    });
    var paramXiaofangshuan = new SuperMap.FilterParameter({
        name: "消防栓@管网设施#1"
    });
    var paramTiaojiefa = new SuperMap.FilterParameter({
        name: "调节阀@管网设施#1"
    });
    var paramShupeishuiguan = new SuperMap.FilterParameter({
        name: "输配水管@管网管线#1"
    });
    var paramYuanshuiguan = new SuperMap.FilterParameter({
        name: "原水管@管网管线"
    });
    var paramXunishuiguan = new SuperMap.FilterParameter({
        name: "虚拟水管@管网管线"
    });
    var paramFeiqishuiguan = new SuperMap.FilterParameter({
        name: "废弃水管@管网管线"
    });

    var allLayerFilterParameters =
        {
            0.0 : paramJingshi,//P
            0.1 : paramShuichang,//P
            0.2 : paramGouzhuwu,//P
            0.3 : paramBengzhan,//P
            1.0 : paramJiancedian,//P
            1.1 : paramWeixiudian,//P
            2.0 : paramJiliangdian,//P
            2.1 : paramGuanjian,//P
            2.2 : paramKongzhifa,//P
            2.3 : paramXiaofangshuan,//P
            2.4 : paramTiaojiefa,//P
            3.0 : paramShupeishuiguan,//L
            3.1 : paramYuanshuiguan,//L
            3.2 : paramXunishuiguan,//L
            4.0 : paramFeiqishuiguan//L
        };

    var str = globalLayersStr;
    if(str.length>0){
        str = str.replace("[0:","").replace("]","");
    }
    var layersArray = str.split(",");
    var queryParamsArray = [];
    for(var i=0;i<layersArray.length;i++){
        queryParamsArray.push(allLayerFilterParameters[parseFloat(layersArray[i])]);
    }

    var param = new SuperMap.QueryByDistanceParameters({
        // queryParams:[paramJingshi,paramShuichang,paramGouzhuwu,paramBengzhan,paramJiancedian,paramWeixiudian,paramJiliangdian,paramGuanjian,paramKongzhifa,paramXiaofangshuan,paramTiaojiefa,paramShupeishuiguan,paramYuanshuiguan,paramXunishuiguan,paramFeiqishuiguan],
        queryParams:queryParamsArray,
        distance: 0.00001,
        geometry: clickGeoPoint,
        isNearest:true
    });

    //查询最近的线
    L.supermap
        .queryService(url_distance)
        .queryByDistance(param, function (serviceResult) {
            var result = serviceResult.result;
            console.log(result);
            var feature = null;
            for(var i=0;i<result.recordsets.length;i++){
                if(result.recordsets[i].features.features.length>0){
                    feature = result.recordsets[i].features.features[0];
                    break;
                }
            }
            if(feature==null){
                alert("未选中对象！");
                return;
            }

            //弹出气泡
            var resultfeatureProps = feature.properties;
            var arr = [{field:'ID',title:'ID',align:'center'}];
            for (var j in resultfeatureProps) {
                if (resultfeatureProps.hasOwnProperty(j)) {
                    if(j.indexOf('Sm')!=-1||j.indexOf('ID')!=-1)continue;
                    var obj = {field:j,title:j,width:110,align:'center'};
                    arr.push(obj);
                }
            }
            var popupText = "<div class='left_scrollBar' style='height: 193px;'>";
            for (var j = 0; j < arr.length; j++) {
                popupText += arr[j].title + ":<b>" + feature.properties[arr[j].title] + "</b><br>";
            }
            popupText += "</div>";
            var latlng = null;
            var offset = null;
            if(feature.geometry.type == "Point"){
                var circle = L.circle([feature.properties["SmY"],feature.properties["SmX"]], {
                    radius: 0.001
                });
                geoJsonlayersGroup.addLayer(circle);
                latlng = L.latLng(feature.properties["SmY"], feature.properties["SmX"]);
                offset = new L.Point(0, 0);
            }else if(feature.geometry.type == "LineString"){
                var resultLayer = L.geoJSON(feature).addTo(map);
                geoJsonlayersGroup.addLayer(resultLayer);
                var corner1 = L.latLng(feature.properties["SmSdriS"], feature.properties["SmSdriW"]),
                    corner2 = L.latLng(feature.properties["SmSdriN"], feature.properties["SmSdriE"]),
                    bounds = L.latLngBounds(corner1, corner2);
                latlng = bounds.getCenter();
                offset = new L.Point(-1, 8);
            }

            map.closePopup();
            L.popup({offset: offset,minWidth:200,maxWidth:300})
                .setLatLng(latlng)
                .setContent(popupText)
                .openOn(map);
            $(".left_scrollBar").mCustomScrollbar({
                setHeight: 180,
                theme: "minimal-dark"
            });
        });
}