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

    const panelSettings = document.getElementById('panelSettings');
    const btnSettings = document.getElementById('btnSettings');

    const allPanels = [panelSearch, panelZones, panelFavorites, panelSettings];
    const allButtons = [btnSearch, btnZones, btnFavorites, btnSettings];

    //If clicking the active panel, close it
    if (panelToToggle.style.display === "block") {
        panelToToggle.style.display = "none";
        buttonClicked.classList.remove('active');
        return;
    }

    allPanels.forEach(panel => {
        if(panel) panel.style.display = "none";
    });
    allButtons.forEach(btn => {
        if(btn) btn.classList.remove('active');
    });

    // Show selected panel and highlight its button
    panelToToggle.style.display = "block";
    buttonClicked.classList.add('active');
}
//Assign click event to settings gear button
const btnSettings = document.getElementById('btnSettings');
const panelSettings = document.getElementById('panelSettings');

if (btnSettings && panelSettings) {
    btnSettings.addEventListener('click', () => togglePanel(panelSettings, btnSettings));
}

btnSearch.addEventListener('click', () => togglePanel(panelSearch, btnSearch));
btnZones.addEventListener('click', () => togglePanel(panelZones, btnZones));
btnFavorites.addEventListener('click', () => togglePanel(panelFavorites, btnFavorites));

//Identify search elements
const btnExecuteSearch = document.getElementById('btnExecuteSearch');
const searchInput = document.getElementById('searchInput');
const searchFeedback = document.getElementById('searchFeedback');

function executeSearchUI() {
    const customTrigger = document.getElementById('customCountryTrigger');
    if (customTrigger) customTrigger.removeAttribute('data-selected-country');
    const triggerText = document.getElementById('selectedCountryText');
    if (triggerText) triggerText.innerText = 'Select a Country';
    const zoneFeedback = document.getElementById('zoneFeedback');
    if (zoneFeedback) {
        zoneFeedback.innerText = '';
        zoneFeedback.className = 'feedback-text';
    }

    const query = searchInput.value.trim();

    if (!query) {
        if(searchFeedback) {
            searchFeedback.innerText = "";
            searchFeedback.className = "feedback-text";
        }
        if (typeof clearHighlights === 'function') clearHighlights();
        if (typeof filterAndRenderPlants === 'function') filterAndRenderPlants();
        return;
    }

    let results = [];
    if (typeof filterAndRenderPlants === 'function') {
        results = filterAndRenderPlants();
    }

    if (results.length > 0) {
        searchFeedback.innerText = `Found ${results.length} matches!`;
        searchFeedback.className = "feedback-text feedback-success";
        
        if (typeof setHighlightedPlants === 'function') setHighlightedPlants(results);
        
        world.pointOfView({ lat: results[0].decimalLatitude, lng: results[0].decimalLongitude, altitude: 0.7 }, 2000);
        world.controls().autoRotate = false;
    } else {
        searchFeedback.innerText = "No occurrences found for that name.";
        searchFeedback.className = "feedback-text feedback-error";
        if (typeof clearHighlights === 'function') clearHighlights();
    }
}

if (btnExecuteSearch) btnExecuteSearch.addEventListener('click', executeSearchUI);
if (searchInput) searchInput.addEventListener('input', executeSearchUI);


//Dropdown Countries Logic with API Real-Time Fetching
const countryData = {
    "Afghanistan": "AF", "Albania": "AL", "Algeria": "DZ", "Andorra": "AD", "Angola": "AO",
    "Antigua and Barbuda": "AG", "Argentina": "AR", "Armenia": "AM", "Australia": "AU",
    "Austria": "AT", "Azerbaijan": "AZ", "Bahamas": "BS", "Bahrain": "BH", "Bangladesh": "BD",
    "Barbados": "BB", "Belarus": "BY", "Belgium": "BE", "Belize": "BZ", "Benin": "BJ",
    "Bhutan": "BT", "Bolivia": "BO", "Bosnia and Herzegovina": "BA", "Botswana": "BW",
    "Brazil": "BR", "Brunei": "BN", "Bulgaria": "BG", "Burkina Faso": "BF", "Burundi": "BI",
    "Cabo Verde": "CV", "Cambodia": "KH", "Cameroon": "CM", "Canada": "CA",
    "Central African Republic": "CF", "Chad": "TD", "Chile": "CL", "China": "CN",
    "Colombia": "CO", "Comoros": "KM", "Congo": "CG", "Costa Rica": "CR", "Croatia": "HR",
    "Cuba": "CU", "Cyprus": "CY", "Czechia": "CZ", "Denmark": "DK", "Djibouti": "DJ",
    "Dominica": "DM", "Dominican Republic": "DO", "Ecuador": "EC", "Egypt": "EG",
    "El Salvador": "SV", "Equatorial Guinea": "GQ", "Eritrea": "ER", "Estonia": "EE",
    "Eswatini": "SZ", "Ethiopia": "ET", "Fiji": "FJ", "Finland": "FI", "France": "FR",
    "Gabon": "GA", "Gambia": "GM", "Georgia": "GE", "Germany": "DE", "Ghana": "GH",
    "Greece": "GR", "Greenland": "GL", "Grenada": "GD", "Guatemala": "GT", "Guinea": "GN",
    "Guinea-Bissau": "GW", "Guyana": "GY", "Haiti": "HT", "Honduras": "HN", "Hungary": "HU",
    "Iceland": "IS", "India": "IN", "Indonesia": "ID", "Iran": "IR", "Iraq": "IQ",
    "Ireland": "IE", "Israel": "IL", "Italy": "IT", "Jamaica": "JM", "Japan": "JP",
    "Jordan": "JO", "Kazakhstan": "KZ", "Kenya": "KE", "Kiribati": "KI", "Kuwait": "KW",
    "Kyrgyzstan": "KG", "Laos": "LA", "Latvia": "LV", "Lebanon": "LB", "Lesotho": "LS",
    "Liberia": "LR", "Libya": "LY", "Liechtenstein": "LI", "Lithuania": "LT",
    "Luxembourg": "LU", "Madagascar": "MG", "Malawi": "MW", "Malaysia": "MY",
    "Maldives": "MV", "Mali": "ML", "Malta": "MT", "Marshall Islands": "MH",
    "Mauritania": "MR", "Mauritius": "MU", "Mexico": "MX", "Micronesia": "FM",
    "Moldova": "MD", "Monaco": "MC", "Mongolia": "MN", "Montenegro": "ME", "Morocco": "MA",
    "Mozambique": "MZ", "Myanmar": "MM", "Namibia": "NA", "Nauru": "NR", "Nepal": "NP",
    "Netherlands": "NL", "New Zealand": "NZ", "Nicaragua": "NI", "Niger": "NE",
    "Nigeria": "NG", "North Korea": "KP", "North Macedonia": "MK", "Norway": "NO",
    "Oman": "OM", "Pakistan": "PK", "Palau": "PW", "Panama": "PA", "Papua New Guinea": "PG",
    "Paraguay": "PY", "Peru": "PE", "Philippines": "PH", "Poland": "PL", "Portugal": "PT",
    "Puerto Rico": "PR", "Qatar": "QA", "Romania": "RO", "Russia": "RU", "Rwanda": "RW",
    "Saint Kitts and Nevis": "KN", "Saint Lucia": "LC",
    "Saint Vincent and the Grenadines": "VC", "Samoa": "WS", "San Marino": "SM",
    "Sao Tome and Principe": "ST", "Saudi Arabia": "SA", "Senegal": "SN", "Serbia": "RS",
    "Seychelles": "SC", "Sierra Leone": "SL", "Singapore": "SG", "Slovakia": "SK",
    "Slovenia": "SI", "Solomon Islands": "SB", "Somalia": "SO", "South Africa": "ZA",
    "South Korea": "KR", "South Sudan": "SS", "Spain": "ES", "Sri Lanka": "LK",
    "Sudan": "SD", "Suriname": "SR", "Sweden": "SE", "Switzerland": "CH", "Syria": "SY",
    "Taiwan": "TW", "Tajikistan": "TJ", "Tanzania": "TZ", "Thailand": "TH", "Timor-Leste": "TL",
    "Togo": "TG", "Tonga": "TO", "Trinidad and Tobago": "TT", "Tunisia": "TN", "Turkey": "TR",
    "Turkmenistan": "TM", "Tuvalu": "TV", "Uganda": "UG", "Ukraine": "UA",
    "United Arab Emirates": "AE", "United Kingdom": "GB", "United States": "US",
    "Uruguay": "UY", "Uzbekistan": "UZ", "Vanuatu": "VU", "Vatican City": "VA",
    "Venezuela": "VE", "Vietnam": "VN", "Yemen": "YE", "Zambia": "ZM", "Zimbabwe": "ZW"
};

function populateCountryDropdown() {
    const list = document.getElementById('customCountryList');
    if (!list) return;

    list.innerHTML = ''; 

    const countries = Object.keys(countryData).sort();

    countries.forEach(country => {
        const li = document.createElement('li');
        li.className = 'custom-option';
        li.innerText = country;

        li.addEventListener("mouseenter", () =>{
            if(typeof playHoverSound === "function"){
                playHoverSound();
            }
        });

        li.addEventListener('click', async () => {
            const searchInput = document.getElementById('searchInput');
            const searchFeedback = document.getElementById('searchFeedback');
            if (searchInput) searchInput.value = '';
            if (searchFeedback) {
                searchFeedback.innerText = '';
                searchFeedback.className = 'feedback-text';
            }

            const triggerText = document.getElementById('selectedCountryText');
            triggerText.innerHTML = `<i class="fa-solid fa-spinner fa-spin" style="margin-right: 8px;"></i>${country}...`;
            document.getElementById('customCountryTrigger').setAttribute('data-selected-country', country);
            document.getElementById('customOptionsContainer').classList.remove('open');

            const zoneFeedback = document.getElementById('zoneFeedback');
            if(zoneFeedback) {
                zoneFeedback.innerHTML = `<i class="fa-solid fa-spinner fa-spin" style="margin-right: 8px;"></i> Fetching data from ${country}...`;
                zoneFeedback.className = "feedback-text";
            }

            const isoCode = countryData[country];
            let results = [];
            
            if (typeof fetchAndRenderCountry === 'function') {
                results = await fetchAndRenderCountry(country, isoCode);
            }

            triggerText.innerText = country;

            if (results.length > 0) {
                if(zoneFeedback) {
                    zoneFeedback.innerText = `Showing ${results.length} plants in ${country}`;
                    zoneFeedback.className = "feedback-text feedback-success";
                }
                
                if (typeof setHighlightedPlants === 'function') setHighlightedPlants(results);
                
                world.pointOfView({ 
                    lat: results[0].decimalLatitude, 
                    lng: results[0].decimalLongitude, 
                    altitude: 0.7
                }, 2000);
                world.controls().autoRotate = false;
            } else {
                if(zoneFeedback) {
                    zoneFeedback.innerText = "No occurrences found in this region.";
                    zoneFeedback.className = "feedback-text feedback-error";
                }
                if (typeof clearHighlights === 'function') clearHighlights();
            }
        });

        list.appendChild(li);
    });

    const triggerText = document.getElementById('selectedCountryText');
    const chevron = document.getElementById('dropdownChevron');
    
    if (triggerText) triggerText.innerHTML = "Select a Country";
    if (chevron) chevron.style.display = "block"; 
}

//Open and close dropdown when clicked
const trigger = document.getElementById('customCountryTrigger');
if (trigger) {
    trigger.addEventListener('click', () => {
        document.getElementById('customOptionsContainer').classList.toggle('open');
    });
}