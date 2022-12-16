mapboxgl.accessToken = mapToken
const map = new mapboxgl.Map({
container: 'map', // container ID
// style: 'mapbox://styles/mapbox/streets-v12', // style URL
style: 'mapbox://styles/mapbox/light-v11', // style URL
// center: [-74.5, 40], 
center: campground.geometry.coordinates, // starting position [lng, lat]
zoom: 8, // starting zoom

});
map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

console.log(campground.geometry.coordinates)

new mapboxgl.Marker()
.setLngLat(campground.geometry.coordinates)
.setPopup(
    new mapboxgl.Popup({offset: 25})
    .setHTML(
        `<h3>${campground.title}</h3> <p>${campground.location}</p>`
    )
)
.addTo(map)

