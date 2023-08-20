function registerBufferClick() {
    map.on('click', addClickLatlng);
    // L.DomUtil.addClass(map._container,'default-cursor-enabled');
    $('.leaflet-container').css('cursor','default');
   
}
function addClickLatlng(e){
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
    var latLng = L.CRS.EPSG4326.unproject(L.point([e.latlng.lng, e.latlng.lat]));
    var burstplusemarkers = [];
    
    burstplusemarkers.push(L.marker(latLng, {icon: pulseIcon}))
    iconLayer = L.featureGroup(burstplusemarkers).addTo(map);
    beforebuffer(e);
}

function beforebuffer(e) {
    $('#dgParent').show();
    $('#queryByBufferPanel').removeClass("layui-show");
    $('#bufferdgwrap').addClass("layui-show");
    $('#buffertabtitle1').removeClass("layui-this");
    $('#buffertabtitle2').addClass("layui-this");
    destroyAllDatagrid();  
    geoBufferAnalystProcess(e);
}
function geoBufferAnalystProcess(e) {    
    var bufferdistance = 0.00001;
    if(typeof(parseFloat($("#bufferR").val())) == "number"){
        bufferdistance = parseFloat($("#bufferR").val());
    }else{
        alert("请输入规范的缓冲半径值！");
        return;
    }

    //根据点和半径绘制缓冲圆
     //计算正72边形代替圆
     let radius = bufferdistance * 1.0364200698897908453189564927571e-5;
     let centerX = e.latlng.lng;
     let centerY = e.latlng.lat;
     let x, y, corner;
     if (radius <= 0 || !centerX || !centerY) {
       return;
     }

     let circlePoints = [];
     for (var i = 0; i <= 360; i += 2.5) {
       corner = (i * Math.PI) / 180;
       x = radius * Math.cos(corner) + centerX;
       y = radius * Math.sin(corner) + centerY;
       circlePoints.push([y, x]);
     }
     console.log(circlePoints);
     circlePoints.push(circlePoints[0]);
     console.log("++++++++++++++++++++");

     console.log(circlePoints);
     let circle144 = L.polygon(circlePoints, {
       stroke: true,
       color: "#cc0000",
       weight: 4,
       opacity: 0.5,
       fill: true,
       fillColor: null,
       fillOpacity: 0.1,
       clickable: true,
       zIndexOffset: 2000,
    });
    
    layersGroupCir = new L.LayerGroup([circle144]);
    map.addLayer(layersGroupCir);
    //得到缓冲区

        var selectValue = $("#queryByBufferSelect").val();
        var dataset = selectValue.split("@")[0];
        var datasource = selectValue.split("@")[1];
        //var queryParamlayerName = dataset + "@" + datasource;
        var queryDatasetName = datasource + ":" + dataset;
        //查询出缓冲区内的消防栓
        var param = new SuperMap.GetFeaturesByGeometryParameters ({
            geometry: circle144,
            // datasetNames:["管网设施:消防栓"],
            datasetNames:[queryDatasetName],
            spatialQueryMode: SuperMap.SpatialQueryMode.INTERSECT,
            fromIndex:0,
            toIndex:1000
        });
        console.log(queryDatasetName);
        console.log(queryServerUrl);
        L.supermap
            .featureService(queryServerUrl)
            .getFeaturesByGeometry(param, function (serviceResult) {
                var result = serviceResult.result;
                console.log(serviceResult);
                if(result.featureCount == 0){
                    alert("无查询结果！");
                    return;
                }
                $("#bufferdgwrap").html("<div style=\"cursor: pointer;color: #3385ff; margin-top: -10px; height: 26px;\"  onclick=\"Prints()\">导出查询结果</div><table id=\"dg\" title=\"查询结果\" style=\"width:100%;height:324px;\" data-options=\"\n" +
                    "                rownumbers:true,\n" +
                    "                singleSelect:true,\n" +
                    "                autoRowHeight:false,\n" +
                    "                pagination:true,\n" +
                    "                pageSize:10\">\n" +
                    "                </table>");

                var firstFeature = serviceResult.result.features.features[0].properties;
                var arr = [{field:'ID',title:'ID',align:'center'}];
                for (var j in firstFeature) {
                    if (firstFeature.hasOwnProperty(j)) {
                        if(j.indexOf('SM')!=-1||j.indexOf('ID')!=-1)continue;
                        var obj = {field:j,title:j,width:110,align:'center'};
                        arr.push(obj);
                    }
                }
                $('#dg').datagrid({
                    columns:[
                        arr
                    ]
                });

                $('#dg').datagrid({
                    data:getData(serviceResult.result.features),//双击事件
                    onDblClickRow: function (index, row) {
                        var popupText = "<div class='left_scrollBar' style='height: 193px;'>";
                        for (var j = 0; j < arr.length; j++) {
                            popupText += arr[j].title + ":<b>" + row[arr[j].title] + "</b><br>";
                        }
                        popupText += "</div>";

                        var latlng = L.latLng(row.SMY, row.SMX);
                        map.closePopup();
                        L.popup({offset: new L.Point(0, -28),minWidth:200,maxWidth:300})
                            .setLatLng(latlng)
                            .setContent(popupText)
                            .openOn(map);
                        map.setView([row.SMY, row.SMX], 19);
                        $(".left_scrollBar").mCustomScrollbar({
                            setHeight: 180,
                            theme: "minimal-dark"
                        });
                    }
                }).datagrid('clientPaging');
                $('.panel-header').hide();
                geoJsonLayer = L.geoJson(serviceResult.result.features, {
                    onEachFeature: function( feature, layer) {
                        var popupText = "<div class='left_scrollBar' style='height: 193px;'>";
                        for (var j = 0; j < arr.length; j++) {
                            popupText += arr[j].title + ":<b>" + feature.properties[arr[j].title] + "</b><br>";
                        }
                        popupText += "</div>";
                        layer.bindPopup(popupText,{'maxWidth':'300','minWidth':'200'});

                        layer.on('click', function () {
                            $(".left_scrollBar").mCustomScrollbar({
                                setHeight: 180,
                                theme: "minimal-dark"
                            });
                        });
                    }
                });
                geoJsonlayersGroup.addLayer(geoJsonLayer);
            });
}