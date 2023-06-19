import * as THREE from '../node_modules/three/build/three.module.js';
import {
    OrbitControls
} from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

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

// Create OrbitControls and enable camera movement
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Enable smooth camera movement
controls.dampingFactor = 0.05; // Adjust damping factor as per your preference

function animate() {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
}

// Update renderer and camera on window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();