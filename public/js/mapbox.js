/* eslint-disable no-undef */

// eslint-disable-next-line no-undef
//- const pop = document.getElementsByClassName('popup')
//- var popup = new ol.Overlay({
//- element: pop
//- });

export const displayMap = (locations) => {
    const map = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([...locations[0].coordinates]),
            zoom: 7,
        }),
        interactions: ol.interaction.defaults({ mouseWheelZoom: false })
    });

    // map.getInteractions().forEach(x => x.setActive(false));

    const markers = new ol.layer.Vector({
        source: new ol.source.Vector(),
        style: new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 1],
                src: '/img/pin.png',
                scale: 0.07
            })
        })
    });

    map.addLayer(markers);

    locations.forEach((location) => {
        const marker = new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat([...location.coordinates])));
        markers.getSource().addFeature(marker)
    });
        //- var location = new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat([...location.coordinates])));
        //- map.addOverlay(popup);
        //- popup.setPosition(location);  
}
