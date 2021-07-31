
//creat a accessToken from mapboxgl
mapboxgl.accessToken = 'pk.eyJ1IjoiZmF0aGlsYSIsImEiOiJja3ExZ2RkNjEwYTJoMndtZTQwdWs2YnZ6In0.6e550PuFYa6XnDM3djkP4w';

//The coordinates of the models
let origindolmene = [7.2140994, 36.5141094];
let originsetif = [5.404884, 36.18936];

//creat a map
let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v9',
    center: [-1.28978, 34.87764],
    zoom: 15,
    pitch: 40,
    bearing: 20,
    antialias: true, hash: true
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());
map.addControl(
    new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true
    })
);

// we can add Threebox to mapbox to add built-in mouseover/mouseout and click behaviors and Lights
window.tb = new Threebox(
    map,
    map.getCanvas().getContext('webgl'),
    {    
        defaultLights: true,
    }
);

//Add The Layers
map.on('load', function () {

    map.addSource('floorplan', {
        'type': 'geojson',
        'generateId': true,
        'data': './json/3dindoormap.json'
    });
    map.addSource('coordmodel', {
        'type': 'geojson',
        'data': './json/coordmodel.json'
    });

    //Add a layer to the map that contains *Medersa KHALDOUNIA* & *Hammam El-Eubad* & *Mosque Sidi Boumediene*
    map.addLayer({
        'id': 'room-extrusion',
        'type': 'fill-extrusion',
        'source': 'floorplan',
        'minzoom': 18,
        'paint': {
            'fill-extrusion-color': ['get', 'color'],
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-base': ['get', 'base_height'],
            'fill-extrusion-opacity': 1
        }
    });

    //Add a layer to the map that contains the coordinates of the 3D models 
    map.addLayer(
        {
            'id': 'coordmodel-heat',
            'type': 'heatmap',
            'source': 'coordmodel',
            'maxzoom': 18,
            'paint': {
                'heatmap-weight': ['interpolate', ['linear'], ['get', 'mag'], 0, 0, 6, 1],
                'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
                'heatmap-color': ['interpolate', ['linear'], ['heatmap-density'], 0, 'rgba(33,102,172,0)', 0.2, 'rgb(103,169,207)', 0.4, 'rgb(209,229,240)', 0.6, 'rgb(253,219,199)', 0.8, 'rgb(239,138,98)', 1, 'rgb(178,24,43)'],
                'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 9, 20],
                'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 7, 1, 9, 0]
            }
        },
        'waterway-label'
    );
    map.addLayer(
        {
            'id': 'coordmodel-point',
            'type': 'circle',
            'source': 'coordmodel',
            'minzoom': 7,
            'maxzoom': 18,
            'paint': {
                'circle-radius': ['interpolate', ['linear'], ['zoom'], 7, ['interpolate', ['linear'], ['get', 'mag'], 1, 1, 6, 4], 16, ['interpolate', ['linear'], ['get', 'mag'], 1, 5, 6, 50]],
                'circle-color': ['interpolate', ['linear'], ['get', 'mag'], 1, 'rgba(33,102,172,0)', 2, 'rgb(103,169,207)', 3, 'rgb(209,229,240)', 4, 'rgb(253,219,199)', 5, 'rgb(239,138,98)', 6, 'rgb(178,24,43)'],
                'circle-stroke-color': 'white',
                'circle-stroke-width': 1,
                'circle-opacity': ['interpolate', ['linear'], ['zoom'], 7, 0, 8, 1]
            }
        },
        'waterway-label'
    );

    //Add a custom layer containing 3D models to the map 
    map.addLayer({
        id: 'custom_layer',
        type: 'custom',
        renderingMode: '3d',
        onAdd: function (map, mbxContext) {

            //Model 01
            let dolmene = {
                type: 'gltf',
                obj: './asset/model/dolmene.gltf', //model url
                units: 'meters', //units in the default values are always in meters
                scale: 1,
                rotation: { x: 90, y: 180, z: 0 }, //default rotation
                anchor: 'center'
            }
            tb.loadObj(dolmene, function (model) {
                model.setCoords([origindolmene[0], origindolmene[1], -4]);
                model.castShadow = false;
                tb.add(model);
            });

            //Model 02
            let setif = {
                type: 'gltf',
                obj: './asset/model/setif.gltf', //model url
                units: 'meters', //units in the default values are always in meters
                scale: 0.8,
                rotation: { x: 90, y: 90, z: 0 }, //default rotation
                anchor: 'center'
            }
            tb.loadObj(setif, function (model) {
                model.setCoords(originsetif);
                model.castShadow = false;
                tb.add(model);
            });

        },
        render: function (gl, matrix) {
            tb.update();
        }
    }, 'room-extrusion');
});
