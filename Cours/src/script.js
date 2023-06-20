import * as THREE from '../node_modules/three/build/three.module.js';
import {
    OrbitControls
} from 'three/examples/jsm/controls/OrbitControls.js';
import TWEEN from '@tweenjs/tween.js'

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 30;

// Create renderer object and specify its size
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


function createStars() {
    const starCount = 20000; // Adjust this value as per your requirements

    const starGeometry = new THREE.SphereGeometry(0.1, 10, 10); // Adjust the size of the star

    const starMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff
    }); // Adjust the color of the star

    for (let i = 0; i < starCount; i++) {
        const star = new THREE.Mesh(starGeometry, starMaterial);

        // Randomly position the star within a range
        const x = THREE.MathUtils.randFloatSpread(1000);
        const y = THREE.MathUtils.randFloatSpread(1000);
        const z = THREE.MathUtils.randFloatSpread(1000);

        star.position.set(x, y, z);

        scene.add(star);
    }
}

createStars();


function createSun() {
    const sunGeometry = new THREE.SphereGeometry(3, 50, 50); // Adjust the size of the sun
    // Create a shiny material for the sun
    const sunMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff00, // Color of the sun
        emissive: 0xffff00, // Emissive color (for additional glow)
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);
    return sun;
}


// createSun();


// Create a planet
function createPlanet(radius, texturePath, distance, speed, orbitAngle) {
    const planetGeometry = new THREE.SphereGeometry(radius, 32, 32); // Adjust the size of the planet
    // Load the texture
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(texturePath);

    // Create the material with the texture
    const planetMaterial = new THREE.MeshBasicMaterial({
        map: texture
    });
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    planet.position.set(distance * Math.cos(orbitAngle), distance * Math.sin(orbitAngle)); // Set the position of the planet (x, y, z)
    scene.add(planet);


    function rgba(r, g, b, a) {
        return `rgb(${r}, ${g}, ${b}, ${a})`;
    }

    // Create the orbit path as a line
    const orbitPathRadius = distance;
    const orbitPathGeometry = new THREE.BufferGeometry();
    const orbitPathMaterial = new THREE.LineBasicMaterial({
        color: rgba(128, 128, 128, 0.15)
    });
    const orbitPathPoints = [];

    // Add points on the orbit path that pass through the planet
    const numPoints = 360; // Adjust the number of points for a smoother circle
    for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        const x = orbitPathRadius * Math.cos(angle);
        const y = orbitPathRadius * Math.sin(angle);
        const z = 0; // Adjust the Z position as needed
        orbitPathPoints.push(x, y, z);
    }

    orbitPathGeometry.setAttribute('position', new THREE.Float32BufferAttribute(orbitPathPoints, 3));
    const orbitPath = new THREE.Line(orbitPathGeometry, orbitPathMaterial);
    scene.add(orbitPath);

    // Add rotation animation to the planet
    planet.animate = function (delta) {
        const angle = speed * delta; // Calculate the rotation angle based on the speed and delta time
        planet.rotation.y += angle; // Apply the rotation

        planet.position.set(distance * Math.cos(orbitAngle), distance * Math.sin(orbitAngle)); // Update the position in the circular orbit
        orbitAngle += angle; // Update the orbit angle
    };

    return planet;
}

// Create OrbitControls and enable camera movement
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Enable smooth camera movement
controls.dampingFactor = 0.05; // Adjust damping factor as per your preference

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta(); // Get the time difference since the last frame

    // Animate each planet
    planets.forEach((planet) => {
        planet.animate(delta);
    });

    renderer.render(scene, camera);
}

// Update renderer and camera on window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const sun = createSun();

function rgb(r, g, b) {
    return `rgb(${r}, ${g}, ${b})`;
}

const planets = [
    createPlanet(0.7, 'textures/mercure.jpg', 7, 0.1, 0), // Planet 1: Radius: 0.5, Color: Red, Distance: 5, Speed: 0.02
    createPlanet(1.8, 'textures/venus.jpg', 10, 0.015, Math.PI / 4), // Planet 2: Radius: 0.7, Color: Green, Distance: 7, Speed: 0.015
    createPlanet(1.9, 'textures/earth.jpg', 13, 0.09, Math.PI / 2), // Planet 3: Radius: 0.9, Color: Blue, Distance: 9, Speed: 0.01
    createPlanet(1.1, 'textures/mars.jpg', 20, 0.04, Math.PI / 6), // Planet 1: Radius: 0.5, Color: Red, Distance: 5, Speed: 0.02
    createPlanet(15, 'textures/jupiter.jpg', 42, 0.07, Math.PI / 9), // Planet 2: Radius: 0.7, Color: Green, Distance: 7, Speed: 0.015
    createPlanet(11, 'textures/saturn.jpg', 69, 0.01, Math.PI), // Planet 3: Radius: 0.9, Color: Blue, Distance: 9, Speed: 0.01
    createPlanet(7.5, 'textures/uranus.jpg', 127, 0.02, (3 * Math.PI) / 4), // Planet 1: Radius: 0.5, Color: Red, Distance: 5, Speed: 0.02
    createPlanet(7.5, 'textures/neptune.jpg', 256, 0.08, (5 * Math.PI) / 6), // Planet 2: Radius: 0.7, Color: Green, Distance: 7, Speed: 0.015
];

const clock = new THREE.Clock(); //

animate();