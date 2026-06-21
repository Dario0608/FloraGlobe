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
        }, 5000);
    });
}