function startCinematicDescent(globeInstance) {
    //Go down to 2.5 and takes 6000 miliseconds (6 seconds)
    globeInstance.pointOfView({ alt: 2.5 }, 6000); 

    setTimeout(() => {
        globeInstance.controls().autoRotate = true;
        globeInstance.controls().autoRotateSpeed = 0.5;
    }, 6000);
}