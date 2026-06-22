//Identify the buttons and panels
const btnSearch = document.getElementById('btnSearch');
const btnZones = document.getElementById('btnZones');
const btnFavorites = document.getElementById('btnFavorites');

const panelSearch = document.getElementById('panelSearch');
const panelZones = document.getElementById('panelZones');
const panelFavorites = document.getElementById('panelFavorites');

//Function to open and close panels
function togglePanel(panelToToggle) {
    if (panelToToggle.style.display === "block") {
        panelToToggle.style.display = "none";
        return;
    }

    panelSearch.style.display = "none";
    panelZones.style.display = "none";
    panelFavorites.style.display = "none";

    panelToToggle.style.display = "block";
}

btnSearch.addEventListener('click', () => togglePanel(panelSearch));
btnZones.addEventListener('click', () => togglePanel(panelZones));
btnFavorites.addEventListener('click', () => togglePanel(panelFavorites));

//Identify search elements
const btnExecuteSearch = document.getElementById('btnExecuteSearch');
const searchInput = document.getElementById('searchInput');
const searchFeedback = document.getElementById('searchFeedback');

//Function to search
async function handleSearch() {
    const query = searchInput.value.trim().toLowerCase();
    
    if (!query) {
        searchFeedback.innerText = "Please, enter a plant name";
        searchFeedback.style.color = "#ffcc00";
        return;
    }
    
    searchFeedback.innerText = "Searching...";
    searchFeedback.style.color = "#2ecc71";

    //Look for information of plants
    const foundPlant = cachedPlants.find(plant => {
        const name = (plant.scientificName || "").toLowerCase();
        const common = (plant.vernacularName || "").toLowerCase();
        return name.includes(query) || common.includes(query);
    });

    if (foundPlant) {
        searchFeedback.innerText = `Found it`;
        
        const lat = foundPlant.decimalLatitude;
        const lng = foundPlant.decimalLongitude;

        //lat, lng = position | 0.4 = height/zoom | 2500 milliseconds
        world.pointOfView({ lat: lat, lng: lng, altitude: 0.4 }, 2500);
        world.controls().autoRotate = false;
        
        openPlantModal(foundPlant);

    } else {
        searchFeedback.innerText = "No plants found with this name on globe";
        searchFeedback.style.color = "#ff7675";
    }
}

btnExecuteSearch.addEventListener('click', handleSearch);

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});


//Fill the dropdown with countries
function populateCountryDropdown() {
    const countrySelect = document.getElementById('countrySelect');
    
    //Default option
    countrySelect.innerHTML = '<option value="">Select a Country</option>';
    
    const uniqueCountries = [...new Set(cachedPlants.map(plant => plant.country).filter(Boolean))];
    
    //Order by Alphabet
    uniqueCountries.sort();
    
    //Add to HTML
    uniqueCountries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.innerText = country;
        countrySelect.appendChild(option);
    });
}

//Country selector event
document.getElementById('countrySelect').addEventListener('change', (e) => {
    const selectedCountry = e.target.value;
    const zoneFeedback = document.getElementById('zoneFeedback');
    
    if (!selectedCountry) {
        zoneFeedback.innerText = "";
        return;
    }
    
    //Filter by plants that belongs to x country
    const plantsInCountry = cachedPlants.filter(plant => plant.country === selectedCountry);
    
    if (plantsInCountry.length > 0) {
        zoneFeedback.innerText = `Showing ${plantsInCountry.length} plants in ${selectedCountry}`;
        
        const targetPlant = plantsInCountry[0];
        
        world.pointOfView({ 
            lat: targetPlant.decimalLatitude, 
            lng: targetPlant.decimalLongitude, 
            altitude: 0.7
        }, 2000);
        
        world.controls().autoRotate = false;
    }
});