//Identify the buttons and panels
const btnSearch = document.getElementById('btnSearch');
const btnZones = document.getElementById('btnZones');
const btnFavorites = document.getElementById('btnFavorites');

const panelSearch = document.getElementById('panelSearch');
const panelZones = document.getElementById('panelZones');
const panelFavorites = document.getElementById('panelFavorites');

//Function to open and close panels
function togglePanel(panelToToggle, buttonClicked) {
    if (typeof clearHighlights === 'function') clearHighlights();

    const allPanels = [panelSearch, panelZones, panelFavorites];
    const allButtons = [btnSearch, btnZones, btnFavorites];

    if (panelToToggle.style.display === "block") {
        panelToToggle.style.display = "none";
        buttonClicked.classList.remove('active');
        return;
    }

    allPanels.forEach(panel => panel.style.display = "none");
    allButtons.forEach(btn => btn.classList.remove('active'));

    panelToToggle.style.display = "block";
    buttonClicked.classList.add('active');
}

btnSearch.addEventListener('click', () => togglePanel(panelSearch, btnSearch));
btnZones.addEventListener('click', () => togglePanel(panelZones, btnZones));
btnFavorites.addEventListener('click', () => togglePanel(panelFavorites, btnFavorites));

//Identify search elements
const btnExecuteSearch = document.getElementById('btnExecuteSearch');
const searchInput = document.getElementById('searchInput');
const searchFeedback = document.getElementById('searchFeedback');

//Function to search
async function handleSearch() {
    const query = searchInput.value.trim().toLowerCase();
    searchFeedback.className = "feedback-text";

    if (!query) {
        searchFeedback.innerText = "Please, enter a plant name";
        searchFeedback.classList.add("feedback-error");
        if (typeof clearHighlights === 'function') clearHighlights();
        return;
    }

    searchFeedback.innerText = "Searching on globe...";
    searchFeedback.classList.add("feedback-success");

    if (typeof filterAndRenderPlants === 'function') {
        filterAndRenderPlants();
    }

    const results = cachedPlants.filter(plant => {
        const sciName = (plant.scientificName || "").toLowerCase();
        const genericName = (plant.genericName || "").toLowerCase();
        return sciName.includes(query) || genericName.includes(query);
    });

    searchFeedback.className = "feedback-text";

    if (results.length > 0) {
        searchFeedback.innerText = `Found ${results.length} matches!`;
        searchFeedback.classList.add("feedback-success");

        setHighlightedPlants(results);

        const target = results[0];
        world.pointOfView({ lat: target.decimalLatitude, lng: target.decimalLongitude, altitude: 0.5 }, 2000);
        world.controls().autoRotate = false;
    } else {
        searchFeedback.innerText = "No occurrences found for that name.";
        searchFeedback.classList.add("feedback-error");
        if (typeof clearHighlights === 'function') clearHighlights();
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
    const list = document.getElementById('customCountryList');
    if (!list) return;
    list.innerHTML = '';

    const uniqueCountries = [...new Set(cachedPlants.map(plant => plant.country).filter(Boolean))];
    uniqueCountries.sort();

    uniqueCountries.forEach(country => {
        const li = document.createElement('li');
        li.className = 'custom-option';
        li.innerText = country;

        li.addEventListener('click', () => {
            document.getElementById('selectedCountryText').innerText = country;

            const triggerBtn = document.getElementById('customCountryTrigger');
            if (triggerBtn) {
                triggerBtn.setAttribute('data-selected-country', country);
            }

            const searchInput = document.getElementById('searchInput');
            if (searchInput) searchInput.value = '';
            const searchFeedback = document.getElementById('searchFeedback');
            if (searchFeedback) searchFeedback.innerText = '';

            document.getElementById('customOptionsContainer').classList.remove('open');

            if (typeof filterAndRenderPlants === 'function') {
                filterAndRenderPlants();
            }

            handleCountrySelection(country);
        });

        list.appendChild(li);
    });
}

//Open and close dropdown when clicked
const trigger = document.getElementById('customCountryTrigger');
if (trigger) {
    trigger.addEventListener('click', () => {
        document.getElementById('customOptionsContainer').classList.toggle('open');
    });
}

function handleCountrySelection(selectedCountry) {
    const zoneFeedback = document.getElementById('zoneFeedback');
    zoneFeedback.className = "feedback-text";

    if (!selectedCountry) {
        zoneFeedback.innerText = "";
        if (typeof clearHighlights === 'function') clearHighlights();
        return;
    }

    const plantsInCountry = cachedPlants.filter(plant => plant.country === selectedCountry);

    if (plantsInCountry.length > 0) {
        zoneFeedback.innerText = `Showing ${plantsInCountry.length} plants in ${selectedCountry}`;
        zoneFeedback.classList.add("feedback-success");

        setHighlightedPlants(plantsInCountry);

        const targetPlant = plantsInCountry[0];
        world.pointOfView({
            lat: targetPlant.decimalLatitude,
            lng: targetPlant.decimalLongitude,
            altitude: 0.7
        }, 2000);
        world.controls().autoRotate = false;
    } else {
        zoneFeedback.innerText = "No occurrences in this region.";
        zoneFeedback.classList.add("feedback-error");
        if (typeof clearHighlights === 'function') clearHighlights();
    }
}