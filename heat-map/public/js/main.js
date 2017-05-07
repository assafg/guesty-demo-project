var map, heatmap;

var center = (points) => {
    const { lat, lng } = points.reduce((acc, curr) => {
        return { lat: acc.lat + curr.lat(), lng: acc.lng + curr.lng() }
    }, { lat: 0, lng: 0 });
    return { lat: lat / points.length, lng: lng / points.length }
}
function initMap() {
    getPoints().then(points => {
        console.log('center', center(points));
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 10,
            center: center(points),
            mapTypeId: 'roadmap'
        });
        heatmap = new google.maps.visualization.HeatmapLayer({
            data: points,
            map: map
        });
    });
}

function toggleHeatmap() {
    heatmap.setMap(heatmap.getMap() ? null : map);
}

function changeGradient() {
    var gradient = [
        'rgba(0, 255, 255, 0)',
        'rgba(0, 255, 255, 1)',
        'rgba(0, 191, 255, 1)',
        'rgba(0, 127, 255, 1)',
        'rgba(0, 63, 255, 1)',
        'rgba(0, 0, 255, 1)',
        'rgba(0, 0, 223, 1)',
        'rgba(0, 0, 191, 1)',
        'rgba(0, 0, 159, 1)',
        'rgba(0, 0, 127, 1)',
        'rgba(63, 0, 91, 1)',
        'rgba(127, 0, 63, 1)',
        'rgba(191, 0, 31, 1)',
        'rgba(255, 0, 0, 1)'
    ]
    heatmap.set('gradient', heatmap.get('gradient') ? null : gradient);
}

function changeRadius() {
    heatmap.set('radius', heatmap.get('radius') ? null : 20);
}

function changeOpacity() {
    heatmap.set('opacity', heatmap.get('opacity') ? null : 0.2);
}

var accent = response => {
    const value = response.map((r, index) => {
        const arr = [];
        for (var i = (response.length - index); i > 0; i--) {
            arr.push(r);
        }
        return arr;
    });
    return _.flattenDeep(value);
}

function getPoints() {
    return fetch(`/listings/${window.LOCATION}`)
        .then(response => response.json())
        .then(response => response.map(r => ({ lat: r.lat, lng: r.lng })))
        .then(accent)
        .then(points => points.map(p => (new google.maps.LatLng(p.lat, p.lng))));
}