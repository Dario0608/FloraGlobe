let rotationTimeout;

//Handle smart globe rotation
function startGlobeRotation(globeInstance) {
    const controls = globeInstance.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    //Stop rotation on user interaction
    controls.addEventListener('start', () => {
        clearTimeout(rotationTimeout);
        controls.autoRotate = false;
    });

    //Resume rotation after 5 seconds of inactivity
    controls.addEventListener('end', () => {
        clearTimeout(rotationTimeout);
        rotationTimeout = setTimeout(() => {
            controls.autoRotate = true;
        }, 10000);
    });
}

//Favorite Section
//Load the favorites saved in browser; ohterwise, start with an empty array
let favoritePlants = JSON.parse(localStorage.getItem('globeFavorites')) || [];
let currentActivePlant = null;

//Save the plant object to localStorage and update the UI
function saveToFavorites(plant) {
    // Check if the plant is already in the list to avoid duplicates
    const alreadyExists = favoritePlants.some(p => p.key === plant.key);
    
    if (!alreadyExists) {
        //Add new plant to the array
        favoritePlants.push(plant);
        
        //Save the updated array to browser's Local Storage
        localStorage.setItem('globeFavorites', JSON.stringify(favoritePlants));
        
        //Refresh the visual list in the sidebar
        if (typeof renderFavoritesList === 'function') {
            renderFavoritesList();
        }
    }
}


//Function to update the lateral panel
function renderFavoritesList() {
    const container = document.getElementById('favoritesContainer');
    container.innerHTML = '';

    if (favoritePlants.length === 0) {
        container.innerHTML = '<p style="font-size:0.9rem; color:#aaa; text-align:center;">There is no favorites plants</p>';
        return;
    }

    favoritePlants.forEach(plant => {
        const item = document.createElement('div');
        item.className = 'favorite-item';
        
        const name = plant.scientificName || "Unknown Species";
        item.innerHTML = `
            <div>
                <strong style="display:block; font-size:0.9rem;">${name}</strong>
                <span style="font-size:0.8rem; color:#ccc;">${plant.country || 'Unknown'}</span>
            </div>
            <i class="fa-solid fa-star" style="color: #f1c40f;"></i>
        `;

        //Click to go search for the plant in globe
        item.addEventListener('click', () => {
            world.pointOfView({ lat: plant.decimalLatitude, lng: plant.decimalLongitude, altitude: 0.4 }, 2500);
            world.controls().autoRotate = false;
            openPlantModal(plant);
        });

        container.appendChild(item);
    });
}

//Function to add/delete plants from favorite
function toggleFavorite() {
    if (!currentActivePlant) return;

    //Check if it is already in the list by its ID
    const index = favoritePlants.findIndex(p => p.key === currentActivePlant.key);
    const btn = document.getElementById('btnToggleFavorite');

    if (index === -1) {
        favoritePlants.push(currentActivePlant);
        btn.innerHTML = '<i class="fa-solid fa-star" style="color: #f1c40f;"></i> Remove from favorites';
    } else {
        favoritePlants.splice(index, 1);
        btn.innerHTML = '<i class="fa-regular fa-star"></i> Add to favorites';
    }

    localStorage.setItem('globeFavorites', JSON.stringify(favoritePlants));
    
    renderFavoritesList();
}

function updateModalFavoriteButton(plant) {
    currentActivePlant = plant;
    const btn = document.getElementById('btnToggleFavorite');
    const isFavorite = favoritePlants.some(p => p.key === plant.key);

    if (isFavorite) {
        btn.innerHTML = '<i class="fa-solid fa-star" style="color: #f1c40f;"></i> Remove from favorites';
    } else {
        btn.innerHTML = '<i class="fa-regular fa-star"></i> Add to favorites';
    }
}

document.getElementById('btnToggleFavorite').addEventListener('click', toggleFavorite);

document.addEventListener('DOMContentLoaded', renderFavoritesList);

//Function to trigger the bubble morphing animation for the sidebar
function revealSidebarBubble() {
    const sidebar = document.getElementById('glassSidebar');
    if (sidebar) {
        setTimeout(() => {
            sidebar.classList.add('visible');
        }, 600);
    }
}