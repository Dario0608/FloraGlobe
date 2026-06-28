async function fetchPlantInfo(scientificName) {
    const nameParts = scientificName.split(" ");
    let binomialName = nameParts[0];
    if (nameParts.length > 1) {
        binomialName += " " + nameParts[1];
    }

    const endpoint = `https://en.wikipedia.org/w/api.php?action=query&titles=${binomialName.replace(/ /g, "_")}&prop=pageimages|extracts&exintro=1&explaintext=1&format=json&pithumbsize=1000&origin=*`;
    
    try {
        const response = await fetch(endpoint);
        if (!response.ok) return null; 
        
        const data = await response.json();
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        const pageData = pages[pageId];

        return {
            imageUrl: (pageData.thumbnail && pageData.thumbnail.source) ? pageData.thumbnail.source : null,
            description: pageData.extract ? pageData.extract : null
        };
        
    } catch (error) {
        console.error("Wikipedia Error Connection:", error);
        return null;
    }
}