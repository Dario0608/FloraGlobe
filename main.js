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
            return `<div style="font-size: 1.8rem; font-family: -apple-system, sans-serif; color: white; background: rgba(10,10,10,0.95); padding: 10px 15px; border-radius: 8px; border-left: 4px solid #2ecc71;">
                ${name}
            </div>`;
        })
        .onObjectClick(plantData => openPlantModal(plantData));
}

//Open modal container with API details
function openPlantModal(data) {
    document.getElementById("plantName").innerText = data.scientificName || "Unknown Species";
    document.getElementById("plantFamily").innerText = data.family || "Data Missing";
    document.getElementById("plantCountry").innerText = data.country || "Location unknown";

    const lat = data.decimalLatitude ? data.decimalLatitude.toFixed(4) : '--';
    const lng = data.decimalLongitude ? data.decimalLongitude.toFixed(4) : '--';
    document.getElementById("plantCoords").innerText = `${lat}, ${lng}`;

    const imgElement = document.getElementById("plantImage");
    if (data.media && data.media.length > 0 && data.media[0].identifier) {
        imgElement.src = data.media[0].identifier;
        imgElement.style.display = "block";
    } else {
        imgElement.src = "";
        imgElement.style.display = "none";
    }

    document.getElementById("plantModal").style.display = "flex";
    world.controls().autoRotate = false;
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