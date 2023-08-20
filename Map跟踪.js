function queryData_html1() {
  DianxColsk()
  console.log('123')
  let JSONData = []
  jQuery.support.cors = true
  let querydata = {
    page: 1,
    limit: 300,
  }
  $.ajax({
    type: 'post',
    async: false,
    dataType: 'json',
    data: JSON.stringify(querydata),
    contentType: 'application/json',
    url: host2 + '/onemap/PersonInfo/GetList', //要访问的后台地址
    beforeSend: function () {
      //显示正在加载数据
      loadIndex = layer.load(1, {
        shade: [0.1, '#fff'],
      })
    },
    success: function (resultone) {
      //data为返回的数据，在这里做数据绑定
      //console.log(result.data.Table)
      let num = 0
      let state = 0
      console.log(resultone)
      themeData = []
      for (var i = 0; i < resultone.data.length; i++) {
        //var sonm = obpo(resultone.data.Table[i].EN_User_ID)
        //console.log(sonm);
        jQuery.support.cors = true
        $.ajax({
          type: 'post',
          async: false,
          contentType: 'application/json',
          url: host2 + '/onemap/PersonCurrStatus/GetOneStatusData',
          data: JSON.stringify({ personid: resultone.data[i].Id }), //要访问的后台地址
          beforeSend: function () {
            //显示正在加载数据
            loadIndex = layer.load(1, {
              shade: [0.1, '#fff'],
            })
          },
          success: function (resulton) {
            //data为返回的数据，在这里做数据绑定
            console.log(resulton)
            if (resulton.data != null) {
              state = resulton.state
              let currentDate = new Date()
              currentDate.setHours(0, 0, 0, 0)
              let targetTime = new Date(resulton.data.gpsdate)
              //resultone.data[i].state = resultone.data[i].state
              // 判断指定时间是否大于当前时间
              let isAfterToday = targetTime >= currentDate
              if (isAfterToday) {
                num = 1
              } else {
                console.log('上传时间不大于今天')
                num = 0
              }
            } else {
              state = 0
              num = 0
            }
            console.log(resultone.data[i])
            themeData.push({
              Id: resultone.data[i].Id,
              姓名: resultone.data[i].name,
              部门名称: resultone.data[i].deptname,
              人员类别名称: resultone.data[i].persontypename,
              职务名称: resultone.data[i].positionname,
              工作手机号: resultone.data[i].workphone,
              人员工号: resultone.data[i].jobnumber,
              //用户状态: state,
              状态: num,
            })
            // if (resulton.data.Table[0].count != 0) {
            //   console.log(i)
            //   op = true
            //   console.log(resulton)
            //   resultone.data.Table[i].状态 = '1'
            //   resultone.data.Table[i].用户状态 = '1'
            // } else {
            //   resultone.data.Table[i].状态 = '0'
            //   resultone.data.Table[i].用户状态 = '0'
            // }
          },
        })
        //console.log(op);
        if (op) {
          //console.log(resultone.data.Table[i])
          //resultone.data.Table[i].状态 = "1";
          //resultone.data.Table[i].用户状态 = "1";
        }
      }
      console.log(themeData)
      //loadIndex.close();
      sessionStorage.setItem('StatisticsJson', JSON.stringify(themeData)) //将获取到的json字符串，保存到键为StatisticsJson中。
      //   console.log(themeData)
      //alert(result.data);
      //initThemeLayer("XiaoFangShuanHandler1");
      //layer.close(loadIndex)
      //console.log("--------Map跟踪--------");
      layer.open({
        type: 2,
        title: '巡检人员',
        shadeClose: true,
        shade: 0.8,
        area: ['80%', '80%'],
        content: './PDA_V_EN_PatrolMan_All_List.html', //iframe的url
        yes: function (index, layero) {
          var tem = $(layero).find('iframe')[0].contentWindow.getUrls()
          console.log(tem)
          //PicCallBack(tem);
          parent.layer.close(index)
        },
        cancel: function () {
          return true
        },
      })
      layer.close(loadIndex)
    },
  })
}