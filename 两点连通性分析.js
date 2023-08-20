function AnalysisConnectivity(e) {
  //获取当前点击位置的经纬度坐标
  var latlng = e.latlng
  // 根据标记数量决定是否执行某些操作
  if (clickCount < 2) {
    //添加点
    let marker = L.marker(latlng).addTo(map)
    Analymarkers.push(marker)
    Analypaths.push({
      x: latlng.lng,
      y: latlng.lat,
    })
    ++clickCount
  } else if (clickCount >= 2) {
    // //移除第一个对象
    // var firstMarker = markers.shift();
    // paths.shift();
    // map.removeLayer(firstMarker);
    // //添加新点
    // let marker = L.marker(latlng).addTo(map);
    // paths.push({
    //     "x": latlng.lng,
    //     "y": latlng.lat
    // });
    // markers.push(marker);
    for (var i = 0; i < 2; i++) {
      var firstMarker = Analymarkers.shift()
      Analypaths.shift()
      map.removeLayer(firstMarker)
    }
    clickCount = 0
  }
  if (Analypaths.length == 2) {
    var resultSetting = {
      returnEdgeFeatures: true,
      returnEdgeGeometry: true,
      returnEdgeIDs: true,
      returnNodeFeatures: true,
      returnNodeGeometry: true,
      returnNodeIDs: true,
      returnPathGuides: true,
      returnRoutes: true,
    }
    var analystParameter = new SuperMap.TransportationAnalystParameter({
      resultSetting: resultSetting,
    })
    console.log(JSON.stringify([paths[0], paths[1]]))

    var resultSetting = {
      returnEdgeFeatures: true,
      returnEdgeGeometry: true,
      returnEdgeIDs: true,
      returnNodeFeatures: true,
      returnNodeGeometry: true,
      returnNodeIDs: true,
      returnPathGuides: true,
      returnRoutes: true,
    }
    var analystParameter = new SuperMap.TransportationAnalystParameter({
      resultSetting: resultSetting,
    })
    findPathParameter = new SuperMap.FindPathParameters({
      isAnalyzeById: false,
      nodes: Analypaths,
      parameter: analystParameter,
    })
    console.log(findPathParameter)
    findPathService = new L.supermap.networkAnalystService(AnalaysUrl)
    //进行查找
    findPathService.findPath(findPathParameter, function (serviceResult) {
      console.log(serviceResult)
      var result = serviceResult.result
      if (result == undefined) {
        layer.msg('两点不连通', {
          icon: 0,
          offset: 't',
          time: 1800,
        })
      } else {
        console.log(result)
        result.pathList.map(function (result) {
          layer.msg('两点连通', {
            icon: 1,
            offset: 't',
            time: 1800,
          })
          var resultLayer = L.geoJSON(result.route, { color: 'red' }).addTo(map)
          geoJsonlayersGroup.addLayer(resultLayer)
          //L.geoJSON(result.route, { style: { color: "red" } }).addTo(map);
        })
        if (result == undefined) {
          layer.msg('两点不连通', {
            icon: 0,
            offset: 't',
            time: 1800,
            shade: 0.3,
          })
        }
      }
    })
  }
}