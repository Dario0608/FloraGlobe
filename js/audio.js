//Audio interaction
const ambientAudio = document.getElementById('ambientSound');
const hoverSound = document.getElementById('hoverSound');
const favSound = document.getElementById('favSound');

//Initial Mixer values (Synced with HTML default values)
let levels = {
    master: 0.8,
    ambient: 0.5,
    fx: 0.6
};

function applyVolumeSettings() {
    //Formula: (Base category volume) * (Master Volume)
    
    if (ambientAudio) {
        ambientAudio.volume = levels.master * levels.ambient;
    }
    
    hoverSound.volume = levels.master * levels.fx * 0.3;
    favSound.volume = levels.master * levels.fx * 0.8;
}

//Global quick-play functions
function playHoverSound() {
    hoverSound.currentTime = 0;
    hoverSound.play().catch(() => {});
}

function playFavoriteSound() {
    if (!favSound) return;
    favSound.currentTime = 0;
    favSound.play().catch(e => console.log('Reproducción de audio bloqueada:', e));
}

function playAmbientAudio() {
    if (ambientAudio) {
        ambientAudio.play().catch(err => console.log("Autoplay blocked by browser until interaction:", err));
    }
}

// 5. Bind UI Sliders when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const sliderMaster = document.getElementById('volumeMaster');
    const sliderAmbient = document.getElementById('volumeAmbient');
    const sliderFX = document.getElementById('volumeFX');

    if (sliderMaster) {
        sliderMaster.addEventListener('input', (e) => {
            levels.master = parseFloat(e.target.value);
            applyVolumeSettings();
        });
    }

    if (sliderAmbient) {
        sliderAmbient.addEventListener('input', (e) => {
            levels.ambient = parseFloat(e.target.value);
            applyVolumeSettings();
        });
    }

    if (sliderFX) {
        sliderFX.addEventListener('input', (e) => {
            levels.fx = parseFloat(e.target.value);
            applyVolumeSettings();
        });
    }

    applyVolumeSettings();
});