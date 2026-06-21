//Initialize Globe
const world = Globe()
    (document.getElementById("globeViz"))
    .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
    .backgroundImageUrl("https://unpkg.com/three-globe/example/img/night-sky.png");

world.controls().autoRotate = false;

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
        renderPlantsOnGlobe(data.results);
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

            const leaves = new THREE.Mesh(leavesGeo, leavesMat);
            leaves.position.z = 1.4;

            treeGroup.add(trunk);
            treeGroup.add(leaves);
            treeGroup.scale.set(1.2, 1.2, 1.2);

            return treeGroup;
        })

        .objectLabel(d => {
            const name = d.scientificName || 'Unknown Species';
            //Glass Design
            return `<div style="
                font-size: 1.5rem; 
                font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
                color: white; 
                background: rgba(255, 255, 255, 0.15); 
                backdrop-filter: blur(10px); 
                -webkit-backdrop-filter: blur(10px);
                border-radius: 15px; 
                border: 1px solid rgba(255, 255, 255, 0.2); 
                
                padding: 10px 20px; 
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                pointer-events: none;
            ">
                ${name}
            </div>`;
        })
        .onObjectClick(plantData => openPlantModal(plantData));
}

//Open modal container with API details
async function openPlantModal(data) {
    document.getElementById("plantName").innerText = data.scientificName || "Unknown Species";
    
    //Common Name
    const commonNameStr = data.vernacularName ? data.vernacularName : "Unknown Common Name";
    
    document.getElementById("plantCommonName").innerText = commonNameStr.charAt(0).toUpperCase() + commonNameStr.slice(1);

    document.getElementById("plantFamily").innerText = data.family || "Data Missing";
    document.getElementById("plantCountry").innerText = data.country || "Location unknown";
    
    const lat = data.decimalLatitude ? data.decimalLatitude.toFixed(4) : '--';
    const lng = data.decimalLongitude ? data.decimalLongitude.toFixed(4) : '--';
    document.getElementById("plantCoords").innerText = `${lat}, ${lng}`;
    
    const imgElement = document.getElementById("plantImage");
    const noImageMsg = document.getElementById("noImageMessage");
    const descElement = document.getElementById("plantDescription");
    
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
            //Put an image if exists
            if (wikiData.imageUrl) {
                imgElement.src = wikiData.imageUrl;
                imgElement.style.display = "block";
            } else {
                noImageMsg.style.display = "block";
            }

            //Put a description if exists
            if (wikiData.description) {
                //If the description is long. we cut it
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