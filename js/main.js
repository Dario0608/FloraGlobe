//Initialize Globe
const world = Globe()
    (document.getElementById("globeViz"))
    .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
    .backgroundImageUrl("https://unpkg.com/three-globe/example/img/night-sky.png");

world.controls().autoRotate = false;

//Global variable to store plants data
let cachedPlants = [];


const treeMaterials = {}; 
let highlightedPlants = []; 
let blinkClock = new THREE.Clock();

//Base 3D geometries and materials
const trunkGeo = new THREE.CylinderGeometry(0.1, 0.2, 1, 8);
trunkGeo.rotateX(Math.PI / 2);
const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5c4033 });

const leavesGeo = new THREE.DodecahedronGeometry(0.8);
const leavesMat = new THREE.MeshLambertMaterial({ color: 0x2ecc71 });

//Fetch API data
async function getPlantData() {
    const apiUrl = "https://api.gbif.org/v1/occurrence/search?kingdomKey=6&hasCoordinate=true&limit=300";
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        cachedPlants = data.results;
        
        renderPlantsOnGlobe(cachedPlants);

        populateCountryDropdown();
    } catch (error) {
        console.error("API Fetch Error:", error);
    }
}

//Render 3D objects and map actions
function renderPlantsOnGlobe(plants) {
    world
        .objectsData(plants)
        .objectLat(d => d.decimalLatitude)
        .objectLng(d => d.decimalLongitude)
        .objectAltitude(0)
        .objectThreeObject(d => {
            const treeGroup = new THREE.Group();

            const trunk = new THREE.Mesh(trunkGeo, trunkMat);
            trunk.position.z = 0.5;

            const individualLeavesMat = leavesMat.clone();
            const leaves = new THREE.Mesh(leavesGeo, individualLeavesMat);
            leaves.position.z = 1.4;

            treeGroup.add(trunk);
            treeGroup.add(leaves);
            treeGroup.scale.set(1.2, 1.2, 1.2);

            if (d.key) {
                treeMaterials[d.key] = individualLeavesMat;
            }

            return treeGroup;
        })
        .onObjectClick(plantData => openPlantModal(plantData));
}


function animateBlink() {
    if (highlightedPlants.length > 0) {
        const time = blinkClock.getElapsedTime() * 5; 
        const cycle = (Math.sin(time) + 1) / 2; 
        
        const currentColor = new THREE.Color(0x2ecc71).lerp(new THREE.Color(0xff0000), cycle);

        highlightedPlants.forEach(plant => {
            if (treeMaterials[plant.key]) {
                treeMaterials[plant.key].color.copy(currentColor);
            }
        });
    }
    requestAnimationFrame(animateBlink);
}
animateBlink();


function clearHighlights() {
    if (highlightedPlants.length > 0) {
        highlightedPlants.forEach(plant => {
            if (treeMaterials[plant.key]) {
                treeMaterials[plant.key].color.setHex(0x2ecc71);
            }
        });
        highlightedPlants = [];
    }
}

function setHighlightedPlants(plantsList) {
    clearHighlights(); 
    highlightedPlants = plantsList;
}

//Open modal container with API details
async function openPlantModal(data) {
    document.getElementById("plantName").innerText = data.scientificName || "Unknown Species";
    
    //Common Name
    const commonNameStr = data.vernacularName ? data.vernacularName : "Unknown Common Name";
    
    document.getElementById("plantCommonName").innerText = commonNameStr.charAt(0).toUpperCase() + commonNameStr.slice(1);

    document.getElementById("plantFamily").innerText = data.family || "Data Missing";
    
    const genusElement = document.getElementById("plantGenus");
    if(genusElement) genusElement.innerText = data.genus || "Data Missing";
    
    document.getElementById("plantCountry").innerText = data.country || "Location unknown";
    
    const lat = data.decimalLatitude ? data.decimalLatitude.toFixed(4) : '--';
    const lng = data.decimalLongitude ? data.decimalLongitude.toFixed(4) : '--';
    document.getElementById("plantCoords").innerText = `${lat}, ${lng}`;
    
    const imgElement = document.getElementById("modalImage");
    const noImageMsg = document.getElementById("noImageMsg");
    const descElement = document.getElementById("modalDescription");
    
    //Reset
    imgElement.style.display = "none";
    noImageMsg.style.display = "none";
    descElement.style.display = "none";
    imgElement.src = "";
    descElement.innerText = "";

    document.getElementById("plantModal").style.display = "flex"; 
    world.controls().autoRotate = false;

    //Ask Wikipedia for info
    if (data.scientificName) {
        const wikiData = await fetchPlantInfo(data.scientificName);
        
        if (wikiData) {
            if (wikiData.imageUrl) {
                imgElement.src = wikiData.imageUrl;
                imgElement.style.display = "block";
            } else {
                noImageMsg.style.display = "block";
            }

            if (wikiData.description) {
                const shortDesc = wikiData.description.length > 300 
                    ? wikiData.description.substring(0, 300) + "..." 
                    : wikiData.description;
                
                descElement.innerText = shortDesc;
                descElement.style.display = "block";
            }
        } else {
            noImageMsg.style.display = "block";
        }
    } else {
        noImageMsg.style.display = "block";
    }

    updateModalFavoriteButton(data);
}

//Close modal handler
document.getElementById("closeModal").addEventListener("click", () => {
    document.getElementById("plantModal").style.display = "none";
    world.controls().autoRotate = true;
});

//Start application sequences on click
document.getElementById("introOverlay").addEventListener("click", () => {
    const overlay = document.getElementById("introOverlay");
    overlay.style.opacity = "0";
    setTimeout(() => { overlay.style.display = "none"; }, 2500);

    playAmbientAudio();
    startGlobeRotation(world);
    getPlantData();
});