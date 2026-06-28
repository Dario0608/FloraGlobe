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
    cachedPlants = [];

    const offsets = [0, 2000, 5000, 9000];
    const limitPerPage = 300;

    try {
        for (const offset of offsets) {
            const apiUrl = `https://api.gbif.org/v1/occurrence/search?kingdomKey=6&hasCoordinate=true&limit=${limitPerPage}&offset=${offset}`;
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.results) {
                cachedPlants.push(...data.results);
            }
        }
        populateCountryDropdown();

    } catch (error) {
        console.error("API Fetch Error:", error);
    }
}

//Render 3D objects and map actions
function renderPlantsOnGlobe(plants) {
    world
        .objectsData(plants)
        .objectLat(d => {
            if (d.__jitterLat === undefined) d.__jitterLat = (Math.random() - 0.5) * 1.5;
            return d.decimalLatitude + d.__jitterLat;
        })
        .objectLng(d => {
            if (d.__jitterLng === undefined) d.__jitterLng = (Math.random() - 0.5) * 1.5;
            return d.decimalLongitude + d.__jitterLng;
        })
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
            d.__threeObj = treeGroup;

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
    //Force hide the glass tooltip when modal opens
    const tooltip = document.getElementById('glass-tooltip');
    if (tooltip) {
        tooltip.style.opacity = '0';
        tooltip.style.transform = 'scale(0.9)';
    }

    window.currentActivePlant = data;

    document.getElementById("plantName").innerText = data.scientificName || "Unknown Species";

    //Common Name
    const commonNameStr = data.vernacularName ? data.vernacularName : "Unknown Common Name";

    document.getElementById("plantCommonName").innerText = commonNameStr.charAt(0).toUpperCase() + commonNameStr.slice(1);

    document.getElementById("plantFamily").innerText = data.family || "Data Missing";

    const genusElement = document.getElementById("plantGenus");
    if (genusElement) genusElement.innerText = data.genus || "Data Missing";

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

    if (typeof revealSidebarBubble === 'function') {
        revealSidebarBubble();
    }
});

//Uprooting mechanic and glass tooltip
let hoveredPlant = null;
let grabbedPlant = null;
let startMouseY = 0;

//Create the tooltip dynamically if it doesn't exist
let glassTooltip = document.getElementById('glass-tooltip');
if (!glassTooltip) {
    glassTooltip = document.createElement('div');
    glassTooltip.id = 'glass-tooltip';

    Object.assign(glassTooltip.style, {
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: '999999',
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        color: '#ffffff',
        padding: '8px 16px',
        borderRadius: '8px',
        fontFamily: 'sans-serif',
        fontSize: '0.95rem',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
        opacity: '0',
        transform: 'scale(0.9)',
        transition: 'opacity 0.2s ease, transform 0.2s ease',
        left: '-1000px',
        top: '-1000px'
    });

    document.body.appendChild(glassTooltip);
}

//Detect hover and update tooltip content
world.onObjectHover(plant => {
    hoveredPlant = plant;
    document.body.style.cursor = plant ? 'grab' : 'default';

    if (plant && !grabbedPlant) {
        glassTooltip.innerHTML = `<strong>${plant.scientificName || 'Unknown Species'}</strong>`;
        glassTooltip.style.opacity = '1';
        glassTooltip.style.transform = 'scale(1)';
    } else {
        glassTooltip.style.opacity = '0';
        glassTooltip.style.transform = 'scale(0.9)';
    }
});

//Detect the grab action
const canvasContainer = document.getElementById('globeViz');
if (canvasContainer) {
    canvasContainer.addEventListener('mousedown', (e) => {
        if (hoveredPlant) {
            grabbedPlant = hoveredPlant;
            startMouseY = e.clientY;
            world.controls().enabled = false;
            document.body.style.cursor = 'grabbing';
        }
    });
}

window.addEventListener('mousemove', (e) => {
    //Make the tooltip follow the cursor with a slight offset
    if (hoveredPlant && !grabbedPlant) {
        glassTooltip.style.left = (e.clientX + 15) + 'px';
        glassTooltip.style.top = (e.clientY + 15) + 'px';
    }

    //Physics for stretching the plant
    if (grabbedPlant && grabbedPlant.__threeObj) {
        glassTooltip.classList.remove('visible'); //Hide tooltip while uprooting

        let deltaY = startMouseY - e.clientY;
        if (deltaY < 0) deltaY = 0;

        const mesh = grabbedPlant.__threeObj;

        let stretch = 1.2 + (deltaY / 150);
        let squish = 1.2 - (deltaY / 300);
        if (squish < 0.4) squish = 0.4;

        mesh.scale.set(squish, squish, stretch);
    }
});

//Release mouse and decide if plant is uprooted or snaps back
window.addEventListener('mouseup', (e) => {
    if (grabbedPlant) {
        let deltaY = startMouseY - e.clientY;
        const mesh = grabbedPlant.__threeObj;

        if (deltaY > 120) {
            //The uproot threshold was passed
            if (mesh) {
                mesh.visible = false; // Hide temporarily

                //Respawn the plant after 1.5 seconds
                setTimeout(() => {
                    mesh.scale.set(1.2, 1.2, 1.2);
                    mesh.visible = true;
                }, 1500);
            }

            grabbedPlant.__wasUprooted = true;
            triggerUprootSuccess(grabbedPlant, e.clientX, e.clientY);
        } else {
            //Snap back to original size elastically
            if (mesh) {
                mesh.scale.set(1.2, 1.2, 1.2);
            }
        }

        world.controls().enabled = true;
        document.body.style.cursor = hoveredPlant ? 'grab' : 'default';

        setTimeout(() => grabbedPlant = null, 50);
    }
});

//Modifier for the click event to ignore uprooted plants and open modal
world.onObjectClick(plantData => {
    //If we just uprooted it ignore the click
    if (plantData.__wasUprooted) {
        plantData.__wasUprooted = false;
        return;
    }

    // Hide the glass tooltip immediately when clicking to prevent it from getting stuck
    if (glassTooltip) {
        glassTooltip.style.opacity = '0';
        glassTooltip.style.transform = 'scale(0.9)';
    }

    openPlantModal(plantData);
});

//Also make sure to hide the tooltip if the window loses focus or user presses Escape
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && glassTooltip) {
        glassTooltip.style.opacity = '0';
        glassTooltip.style.transform = 'scale(0.9)';
    }
});

//Transition between 3D world and 2D UI
function triggerUprootSuccess(plant, startX, startY) {
    const ghost = document.createElement('div');
    ghost.className = 'uprooted-token';
    ghost.innerHTML = `<i class="fa-solid fa-seedling"></i> <span>${plant.scientificName || 'Saved!'}</span>`;

    //Place it exactly where the mouse was
    ghost.style.left = startX + 'px';
    ghost.style.top = startY + 'px';
    document.body.appendChild(ghost);

    const sidebarBtn = document.getElementById('btnFavorites');
    const targetRect = sidebarBtn.getBoundingClientRect();

    //Fly to the favorites bar
    requestAnimationFrame(() => {
        ghost.style.left = (targetRect.left + targetRect.width / 2) + 'px';
        ghost.style.top = (targetRect.top + targetRect.height / 2) + 'px';
        ghost.style.transform = 'translate(-50%, -50%) scale(0.2)';
        ghost.style.opacity = '0';
        sidebarBtn.classList.add('pulse-glow');
    });

    //Finish animation and save data
    setTimeout(() => {
        ghost.remove();
        sidebarBtn.classList.remove('pulse-glow');

        //Open favorites panel
        const panelFavorites = document.getElementById('panelFavorites');
        if (panelFavorites.style.display !== "block" && typeof togglePanel === 'function') {
            togglePanel(panelFavorites, sidebarBtn);
        }

        //SAVE TO FAVORITES LOGIC
        if (typeof saveToFavorites === 'function') {
            saveToFavorites(plant);
        }

    }, 700);
}

//Filter plants based on search inputs and update the globe
function filterAndRenderPlants() {
    const searchInput = document.getElementById('searchInput');

    const customTrigger = document.getElementById('customCountryTrigger');
    const selectedCountry = customTrigger ? customTrigger.getAttribute('data-selected-country') : '';

    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    const filtered = cachedPlants.filter(plant => {
        const matchesSearch = !query ||
            (plant.scientificName && plant.scientificName.toLowerCase().includes(query)) ||
            (plant.vernacularName && plant.vernacularName.toLowerCase().includes(query)) ||
            (plant.family && plant.family.toLowerCase().includes(query)) ||
            (plant.genus && plant.genus.toLowerCase().includes(query));

        const matchesCountry = !selectedCountry || plant.country === selectedCountry;

        return matchesSearch && matchesCountry;
    });

    const searchFeedback = document.getElementById('searchFeedback');
    const zoneFeedback = document.getElementById('zoneFeedback');
    const feedbackText = filtered.length > 0 ? `Found ${filtered.length} species.` : 'No species found.';

    if (searchFeedback) searchFeedback.innerText = feedbackText;
    if (zoneFeedback) zoneFeedback.innerText = feedbackText;

    renderPlantsOnGlobe(filtered);
}

//Event listeners for real-time filtering and custom UI handling
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const btnExecuteSearch = document.getElementById('btnExecuteSearch');

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const customTrigger = document.getElementById('customCountryTrigger');
            if (customTrigger) customTrigger.removeAttribute('data-selected-country');
            const triggerText = document.getElementById('selectedCountryText');
            if (triggerText) triggerText.innerText = 'Select a Country';
            const zoneFeedback = document.getElementById('zoneFeedback');
            if (zoneFeedback) zoneFeedback.innerText = '';

            filterAndRenderPlants();
        });
    }

    if (btnExecuteSearch) {
        btnExecuteSearch.addEventListener('click', filterAndRenderPlants);
    }
});