// Initialize the 3D Globe instance and link it to the HTML container
const world = Globe()

(document.getElementById("globeViz"))
.globeImageUrl("https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
.backgroundImageUrl("https://unpkg.com/three-globe/example/img/night-sky.png");

// Asynchronous function to fetch biodiversity data from the GBIF API
async function getPlantData() {
const apiUrl = "https://api.gbif.org/v1/occurrence/search?kingdomKey=6&hasCoordinate=true&limit=500";
try{
    const response = await fetch(apiUrl)
    const data = await response.json(); 

    //Pass the array of plant results to the visualization funciton
    rednerPLantsOnGlobe(data.results);
    console.log(data.results);

}catch(error){
    console.log(error);
}
}

// Function to render plant markers onto the globe surface
function rednerPLantsOnGlobe(plants){
    world
    // Feed the array of plants to the globe
        .pointsData(plants)

        // Map the latitude and longitude from GBIF data
        .pointLat(d => d.decimalLatitude)
        .pointLng(d => d.decimalLongitude)

        .pointColor(() => "#22c55e") 

        // Define the visual thickness of each point and elevate the points slightly above the surface
        .pointRadius(0.25)
        .pointAltitude(0.01)

        //Show the scientific name on hover
        .pointLabel(d => d.scientificName);
}

getPlantData();