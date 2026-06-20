//Initialize the 3D Globe instance and link it to the HTML container
const world = Globe()
    (document.getElementById("globeViz"))
    .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
    .backgroundImageUrl("https://unpkg.com/three-globe/example/img/night-sky.png");

world.controls().autoRotate = false; 
//Set initial POV in stars
world.pointOfView({ alt: 20 });    

//URL for the plant icon with transparent background
const plantIconUrl = "https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/72x72/1f33f.png";

//Asynchronous function to fetch biodiversity data from the GBIF API
async function getPlantData() {
    const apiUrl = "https://api.gbif.org/v1/occurrence/search?kingdomKey=6&hasCoordinate=true&limit=300";
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        //Pass the array of plant results to the visualization funciton
        renderPlantsOnGlobe(data.results);
        console.log(data.results);

    } catch (error) {
        console.log(error);
    }
}

//Function to render plant markers onto the globe surface
function renderPlantsOnGlobe(plants) {

    //Load the image plant from internet to use it in 3D
    const loader = new THREE.TextureLoader();

    //Ask Three.js for CORS permission
    loader.setCrossOrigin("anonymous");

    const texture = loader.load(plantIconUrl);

    //Use Three.js custom objects for billboarding images instead of default points
    world
        .objectsData(plants)
        .objectLat(d => d.decimalLatitude)
        .objectLng(d => d.decimalLongitude)
        .objectAltitude(0.01)

        .objectThreeObject(d => {
            //Make material that supports transparency and use the image 
            //Then, create the 2D sprite that always look the camera
            const material = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(material);

            //Scale the image
            sprite.scale.set(1.5, 2.0, 1.0);
            return sprite;
        })
        .objectLabel(d => d.scientificName); 
}

document.getElementById("introOverlay").addEventListener("click", () => {
    const overlay = document.getElementById("introOverlay");
    overlay.style.opacity = "0";
    setTimeout(() => { overlay.style.display = "none"; }, 2500); 

    playAmbientAudio();
    startCinematicDescent(world);
    
    getPlantData();
});