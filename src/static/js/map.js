// var map = new BMap.Map("my_map");          // 创建地图实例
// var point = new BMap.Point(116.404, 39.915);  // 创建点坐标
// map.centerAndZoom(point, 15);

const image = 'static/img/bus.png';


$(document).ready(function () {
    let socket = io.connect('http://' + document.domain + ':' + location.port + '/bus');

    let map = new BMap.Map("my_map");
    map.centerAndZoom(new BMap.Point(114.215614,22.695166), 17);
    map.enableAutoResize();
    map.enableScrollWheelZoom(true);

    // 添加比例尺
    map.addControl(new BMap.NavigationControl({
        anchor: BMAP_ANCHOR_TOP_RIGHT,
        type: BMAP_NAVIGATION_CONTROL_SMALL
    }));


    // ============================================================================================================
    let ac = new BMap.Autocomplete(    //建立一个自动完成的对象
        {
            "input": "suggestId"
            , "location": map
        });

    ac.addEventListener("onhighlight", function (e) {  //鼠标放在下拉列表上的事件
        let str = "";
        let _value = e.fromitem.value;
        let value = "";
        if (e.fromitem.index > -1) {
            value = _value.province + _value.city + _value.district + _value.street + _value.business;
        }
        str = "FromItem<br />index = " + e.fromitem.index + "<br />value = " + value;

        value = "";
        if (e.toitem.index > -1) {
            _value = e.toitem.value;
            value = _value.province + _value.city + _value.district + _value.street + _value.business;
        }
        str += "<br />ToItem<br />index = " + e.toitem.index + "<br />value = " + value;
        G("searchResultPanel").innerHTML = str;
    });

    var myValue;
    ac.addEventListener("onconfirm", function (e) {    //鼠标点击下拉列表后的事件
        let _value = e.item.value;
        myValue = _value.province + _value.city + _value.district + _value.street + _value.business;
        G("searchResultPanel").innerHTML = "onconfirm<br />index = " + e.item.index + "<br />myValue = " + myValue;

        setPlace();
    });

    function G(id) {
        return document.getElementById(id);
    }

    function setPlace() {
        map.clearOverlays();    //清除地图上所有覆盖物
        function myFun() {
            let pp = local.getResults().getPoi(0).point;    //获取第一个智能搜索的结果
            map.centerAndZoom(pp, 20);
            map.addOverlay(new BMap.Marker(pp));    //添加标注
            get_spots()
        }

        let local = new BMap.LocalSearch(map, { //智能搜索
            onSearchComplete: myFun
        });
        local.search(myValue);
    }


    // 监听拖拽
    map.addEventListener("dragend", function showInfo() {
        get_spots()
    });
    // 放大缩小监听
    map.addEventListener("zoomend", function showInfo() {
        get_spots()
    });
    map.addEventListener("moveend", function showInfo() {
        get_spots()
    });

    // ============================================================================================================

    function fill_form(i, bus, next_stop, arrival_time) {
        G('bus' + i).innerHTML = bus
        G('next_stop' + i).innerHTML = next_stop
        G('arrival_time' + i).innerHTML = arrival_time
    }

    function get_spots() {
        map.clearOverlays();
        for (let i = 0; i < 3; i++) {
            fill_form(i, 0, 0, 0, 0, 0, 0)
        }
        let bounds = map.getBounds()
        let bounds_json = JSON.stringify(bounds)
        socket.emit('get_spots', bounds_json)
        console.log(bounds_json)
    }

    socket.on('connect', function (msg) {
        get_spots()
    })

    //waiting for updates, if yes, send bounds and request bounds.
    socket.on('updates', function (msg) {
        get_spots()

    })

    socket.on('get_spots', function (msg) {
        json_msg = JSON.parse(msg)
        console.log("total: " + json_msg.length + " spots")
        // draw spots
        for (let i = 0; i < json_msg.length; i++) {
            let lng = json_msg[i].loc[0]
            let lat = json_msg[i].loc[1]
            let next_stop = json_msg[i].next_stop
            let time = json_msg[i].arrival_time.$date
            let arrival_time = new Date(time).toLocaleString()
            let bus = json_msg[i].bus
            if ((lng != "") && (lat != "")) {
                let pt = new BMap.Point(lng, lat);
                let myIcon = new BMap.Icon(image, new BMap.Size(30, 30));//new BMap.Size(26, 16)
                let marker = new BMap.Marker(pt, {icon: myIcon});  // 创建标注
                let label = new BMap.Label(bus, {offset: new BMap.Size(30, 3)})
                marker.setLabel(label)
                map.addOverlay(marker);
            }
            // fill table
            if (i < 3) {
                fill_form(i, bus, next_stop, arrival_time)
            }
        }
    })

    socket.on('clear_map', function (msg) {
        map.clearOverlays();
        console.log("clear all spots")
        for (let i = 0; i < 3; i++) {
            fill_form(i, 0, 0, 0)
        }
    })
})

