
let lat = 48.852969
let lon = 2.349903
let macarte = null

let restos = {
    Paris: { lat: 48.852969, lon: 2.349903 },
    Pso: { lat: 48.8596531, lon: 2.3449069 },
    Truc: { lat: 48.8531063, lon: 2.3364693 },
}
let arrayResto = []

let persos = {
    Arthur: { lat: 48.8747091, lon: 2.2900717 },
    Mathis: { lat: 48.8756766, lon: 2.3455138 },
    Kélian: { lat: 48.8536624, lon: 2.3453838 },
}


let pointArrive = {
    lat: 48.8456778, lon: 2.3338596,
}

let latResto    =  restos.Paris.lat;
let latPerso    =  persos.Arthur.lat;
let lonResto    =  restos.Paris.lon;
let lonPerso    =  persos.Arthur.lon;
let latPa       =  pointArrive.lat;
let lonPa       =  pointArrive.lon;

let polyline    = null
let markerPA    = null
let markerResto = ""
let markerPerso = null
let distanceTotal = ""

let btn = document.getElementById('button');

var request = new XMLHttpRequest()

request.open('GET', 'https://opendata.paris.fr/api/records/1.0/search/?dataset=restaurants-casvp&q=&facet=code&facet=nom_restaurant&facet=types', true)
request.onload = function () {
  // Begin accessing JSON data here
    let data = JSON.parse(this.response)
    let tab = 
            ``;

    if (request.status >= 200 && request.status < 400) {
    data.records.forEach(movie => {
        // console.log(movie)
        if(movie.geometry !== undefined){
            let coord = movie.geometry.coordinates
            tab += 
                `<li class="mt-3 card p-2"> ${movie.fields['nom_restaurant']} <br>
                ${movie.fields['adresse']} <br>
                ${coord[0]} / ${coord[1]}</li>
                
                `;
                let obj = {};
                let name = movie.fields['nom_restaurant']
                obj['name'] = name;
                let lon = coord[0]
                obj['lon'] = lon;
                let lat = coord[1]
                obj['lat'] = lat;
                // console.log(obj);
                // console.log(arrayResto);
                arrayResto.push(obj);
            }
        })
    } else {
        console.log('error')
    }
    document.getElementById("resto").innerHTML = tab;
    // function show(data) {
    //     let tab = 
    //         ``;
        
    //     // Loop to access all rows 
    //     for (let r of data.records) {
    //         tab += 
    //         `<li>${r['datasetid']}</li>
    //         <li>${r.geometry['coordinates']}</li>`;
    //     }
    //     // Setting innerHTML as tab variable
    //     document.getElementById("resto").innerHTML = tab;
    // }
    // console.log(arrayResto[1].lat)
}



function initMap() {
    var icon = L.icon({
        iconUrl: "assets/blackPin.png",
        iconSize: [50, 50],
        iconAnchor: [25, 50],
    })
    var iconBlue = L.icon({
        iconUrl: "assets/bluePin.png",
        iconSize: [50, 50],
        iconAnchor: [25, 50],
    })
    macarte = new L.map("map").setView([lat, lon], 11)
    L.tileLayer("https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png", {
        attribution: "données © OpenStreetMap/ODbL - rendu OSM France",
        minZoom: 1,
        maxZoom: 20,
    }).addTo(macarte)
    for (resto in restos) {
        console.log(resto[1])
        markerResto = L.marker([restos[resto].lat, restos[resto].lon],{
            autoPan: true
        }).addTo(macarte)
        clickAndSelect()
        markerResto.bindPopup(resto);
        console.log('Resto:',resto)
    }
    for (perso in persos) {
        markerPerso = L.marker([persos[perso].lat, persos[perso].lon],{
            icon : icon,
            autoPan: true
        }).addTo(macarte);
        markerPerso.bindPopup(perso);
    }
    markerPA = L.marker([pointArrive.lat, pointArrive.lon],{
        icon : iconBlue,
        draggable : true,
        pan : true
    }
    ).addTo(macarte)
    
    distancePersoResto()
	distanceRestoPA()
    dragAndDrop()
    clickAndSelect()
    lignes()
    
    
}

function dragAndDrop(){
    markerPA.on("dragend", function (event) {
        var marker = event.target
        var result = marker.getLatLng()
        latPa = result.lat
        lonPa = result.lng
        macarte.removeLayer(polyline)
        distancePersoResto()
        distanceRestoPA()
        calculDistanceTotal()
        calculTemps()
        lignes()
        
    })
}
function clickAndSelect(){
    markerResto.on("click", function (event) {
        var markerResto = event.target
        var result = markerResto.getLatLng()
        latResto = result.lat
        lonResto = result.lng
        macarte.removeLayer(polyline)
        distancePersoResto()
        distanceRestoPA()
        calculDistanceTotal()
        calculTemps()
        lignes()
        
    })
}
function distancePersoResto(latResto,
    latPerso, lonResto, lonPerso)
    {
        // The math module contains a function
        // named toRadians which converts from
        // degrees to radians.
        lonResto = lonResto * Math.PI / 180;
        lonPerso = lonPerso * Math.PI / 180;
        latResto = latResto * Math.PI / 180;
        latPerso = latPerso * Math.PI / 180;
        // Haversine formula
        let dlon = lonPerso - lonResto;
        let dlat = latPerso - latResto;
        let a = Math.pow(Math.sin(dlat / 2), 2)
        + Math.cos(latResto) * Math.cos(latPerso)
        * Math.pow(Math.sin(dlon / 2),2);
        let c = 2 * Math.asin(Math.sqrt(a));
        // Radius of earth in kilometers. Use 3956
        // for miles
        let r = 6371;
        // calculate the result
        return(c * r);
    }
    function distanceRestoPA(latResto,
        latPa, lonResto, lonPa)
        {
            // The math module contains a function
            // named toRadians which converts from
            // degrees to radians.
            lonResto = lonResto * Math.PI / 180;
            lonPa = lonPa * Math.PI / 180;
            latResto = latResto * Math.PI / 180;
            latPa = latPa * Math.PI / 180;
            // Haversine formula
            let dlon = lonPa - lonResto;
            let dlat = latPa - latResto;
            let a = Math.pow(Math.sin(dlat / 2), 2)
            + Math.cos(latResto) * Math.cos(latPa)
            * Math.pow(Math.sin(dlon / 2),2);
            let c = 2 * Math.asin(Math.sqrt(a));
            // Radius of earth in kilometers. Use 3956
            // for miles
            let r = 6371;
            // calculate the result
            return(c * r);
        }
        //array des 3 position
        function lignes(){ 
            
            var pointsForJson = [
                [latPa, lonPa],
                [latResto, lonResto],
                [latPerso, lonPerso],
            ];
            pointsForJson.forEach(function(lngLat) {
                L.marker(lngLatToLatLng(lngLat)).addTo(macarte);
            });
            polyline = L.polyline(lngLatArrayToLatLng(pointsForJson)).addTo(macarte);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' 
            }).addTo(macarte);
macarte.fitBounds(polyline.getBounds());
function lngLatArrayToLatLng(lngLatArray) {
    return lngLatArray.map(lngLatToLatLng);
}
function lngLatToLatLng(lngLat) {
    return [lngLat[1], lngLat[0]];
}
polyline = L.polyline(pointsForJson, {color: 'red'}).addTo(macarte);
macarte.fitBounds(polyline.getBounds());

}

function calculDistanceTotal() {
    distanceTotal =
    distancePersoResto(latResto, latPerso, lonResto, lonPerso) +
    distanceRestoPA(latResto, latPa, lonResto, lonPa)
    console.log(distanceTotal + " K.M")
}
//Calcul Temps
let tempsH = ""
function calculTemps() {
    const speed = 5
    const tempsDecimal = distanceTotal / speed
    const tempsMin = Math.round(tempsDecimal * 60)
    
    // Temps en heure et min
    if (tempsMin > 59) {
        var heure = Math.trunc(tempsMin / 60)
        var min = tempsMin % 60
        tempsH = heure + " h " + min + " min "
    }
    // console.log(tempsH);
}


window.onload = function () {
    initMap()
}


request.send()
