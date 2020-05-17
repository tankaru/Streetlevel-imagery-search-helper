
const client_id = 'NEh3V0ZjaE1fT1Nkdk9jMnJlSGNQQToyNzlmZjQxM2U2MjBjMGUy';

let map;
let poi_markers;

function check(){

	const bbox = map.getBounds().getSouth() + ',' + map.getBounds().getWest() + ',' + map.getBounds().getNorth() + ',' + map.getBounds().getEast();

    const key_string = document.getElementById('query').value;

	const query =
	`[out:json][timeout:25];
	(
		node[${key_string}](${bbox});
        way[${key_string}](${bbox});
        relation[${key_string}](${bbox});
	);
	out center;`;


	const encoded_query = encodeURI(query);
	
	const url = 'https://overpass-api.de/api/interpreter?data=' + encoded_query;


	console.log(url);
	let request = new XMLHttpRequest();
	request.open('GET', url , true);
	request.onload = function () {
        if(poi_markers) poi_markers.clearLayers();
		data = this.response;
        overpassjson = JSON.parse(data).elements;
        console.log(JSON.stringify(overpassjson, null, 2));
        let markers = [];
		for (let i=0; i<overpassjson.length; i++){
            const item = overpassjson[i];
            let lat, lon;
            if (item.type == "node"){
                lat = item.lat;
                lon = item.lon;
            } else if (item.type == "way" || item.type == "relation"){
                lat = item.center.lat;
                lon = item.center.lon;
            } else {
                continue;
            }
            const marker = L.marker([Number(lat), Number(lon)]);
            const popup = `<a href="https://www.mapillary.com/app/?lat=${lat}&lng=${lon}&z=19" target="_blank"><pre>${JSON.stringify(item.tags, null, 2)}</pre></a>`;
            marker.bindPopup(popup).openPopup();
            markers.push(marker);

		}
        poi_markers = L.layerGroup(markers).addTo(map);
		//drawGrid();

	}
	request.send();
}

//http://ktgis.net/service/leafletlearn/index.html
function initMap() {
  
  //地図を表示するdiv要素のidを設定
  map = L.map('mapcontainer');
  //url末尾に座標を付ける
	var hash = new L.Hash(map);
	
	//URLに座標が付いていたらその場所を初期位置にする。
	const url = location.href;
	const match = url.match(/#(\d{1,2})\/(-?\d[0-9.]*)\/(-?\d[0-9.]*)/);
	if (match){
		const [, zoom, lat, lon] = match;
		map.setView([lat, lon], zoom);
	} else {
		map.setView([37.9243912, 139.045191], 15);
	}

  //表示するタイルレイヤのURLとAttributionコントロールの記述を設定して、地図に追加する
  let osmLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	  attribution: "(C)<a href='https://www.openstreetmap.org/copyright' target='_blank'>OpenStreetMap contributors</a>",
	  maxZoom: 21,
	  maxNativeZoom: 19,
	  minZoom: 1,
	  //maxBounds: [[35.47, 139.62], [35.45, 139.64]],
  }).addTo(map);

/*
  var kokudoLayer = L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/ort/{z}/{x}/{y}.jpg',{
    attribution: '© <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院</a>',
	});
*/
	let baseMap = {
		"OpenStreetMap":osmLayer,
		//"国土地理院オルソ":kokudoLayer,
	};
 
	var mapillaryLayer = L.tileLayer('https://raster-tiles.mapillary.com/v0.1/{z}/{x}/{y}.png',{
		attribution: '(C)<a href="https://www.mapillary.com/">Mapillary</a>, CC BY',
	  maxZoom: 21,
	  maxNativeZoom: 17,
	});
	//デフォルトでMapillaryレイヤを表示
	mapillaryLayer.setOpacity(0.65).addTo(map);
	var overlayLayer = {
		"Mapillary":mapillaryLayer,
	}

	//レイヤ設定
	var layerControl = L.control.layers(baseMap,overlayLayer,{"collapsed":true,});
	layerControl.addTo(map);

}