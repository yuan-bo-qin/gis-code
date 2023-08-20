function getBurstLineAndAnalyze() {
    if (geoJsonlayersGroup!=undefined||geoJsonlayersGroup!=null) geoJsonlayersGroup.clearLayers();
    var clickGeoPoint = {
        "type": "Feature",
        "properties": {
        },
        "geometry": {
            "type": "Point",
            "coordinates": [burstplusemarkers[0]._latlng.lng, burstplusemarkers[0]._latlng.lat]
        }
    };
    var param = new SuperMap.QueryByDistanceParameters({
        queryParams: {name: "输配水管@管网管线"},
        distance: 0.00001,
        geometry: clickGeoPoint
    });
    var lineGeometry = null;
    var baseMapUrl = "http://192.168.8.193:8090/iserver/services/map-DiTu/rest/maps/%E7%AE%A1%E7%82%B9%E7%AE%A1%E7%BA%BF";
    //查询最近的线
    L.supermap
        .queryService(baseMapUrl)
        .queryByDistance(param, function (serviceResult) {
            var result = serviceResult.result;
            if(result.currentCount == 0){
                alert("未选中管线，请重新选择！");
                return;
            }
            lineGeometry = result.recordsets[0].features.features[0];
            var edgeid = lineGeometry.properties["SmID"];
            console.log(edgeid);
            _burstPipelineAnalyst_zhafa(edgeid);
        });
}

function _burstPipelineAnalyst_zhafa(edgeid) {
    networkAnalystService_zhafa = L.supermap.networkAnalystService(analysisService_url);
    burstPipelineAnalystParam_zhafa = new SuperMap.BurstPipelineAnalystParameters({
        sourceNodeIDs: zhafaNodesArray,
        edgeID: edgeid,
        isUncertainDirectionValid: true
    });
    //闸阀
    networkAnalystService_zhafa.burstPipelineAnalyst(burstPipelineAnalystParam_zhafa, function (serviceResult) {
        var result = serviceResult.result;
       // var edgeIDs = result.edges;
       var edgeIDs = result.criticalNodes;
        $("#guanfaliebiaoValues").empty();
        for(var i=0;i<edgeIDs.length;i++){
            $("#guanfaliebiaoValues").append("<span class=\"fieldSpan\">"+edgeIDs[i]+"</span>")
        }
        queryBySQL_Zhafa(edgeIDs);
    });
}
function queryBySQL_Zhafa(edgeIDs) {
    var str="(";
    for(var i=0;i<edgeIDs.length;i++){
        if(i!=edgeIDs.length-1){
            str+=edgeIDs[i]+",";
        }
        else{
            str+=edgeIDs[i]+")";
        }
    }

    var param = new SuperMap.QueryBySQLParameters({
        queryParams: {
            name: "管点管线_Node@Result",
            attributeFilter: "SmID in "+ str
        }
    });
    L.supermap
        .queryService(networkmapUrl)
        .queryBySQL(param, function (serviceResult) {
            burstAnalysegeoJsonLayer = L.geoJson(serviceResult.result.recordsets[0].features, {
                onEachFeature: function( feature, layer) {
                }
            });
            geoJsonlayersGroup.addLayer(burstAnalysegeoJsonLayer);
        });
}