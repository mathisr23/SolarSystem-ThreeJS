import * as THREE from "../node_modules/three/build/three.module.js"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js"

const scene = new THREE.Scene()
const loader = new GLTFLoader()
//const gltfPath = "/assets/bond_forger_from_spy__family/scene.gltf"

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
camera.position.z = 30

// Create renderer object and specify its size
const canvas = document.querySelector(".webgl")
const renderer = new THREE.WebGLRenderer({ canvas: canvas })
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

function createStars() {
  const starCount = 20000 // Adjust this value as per your requirements

  const starGeometry = new THREE.SphereGeometry(0.1, 10, 10) // Adjust the size of the star

  const starMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
  }) // Adjust the color of the star

  for (let i = 0; i < starCount; i++) {
    const star = new THREE.Mesh(starGeometry, starMaterial)

    // Randomly position the star within a range
    const x = THREE.MathUtils.randFloatSpread(1000)
    const y = THREE.MathUtils.randFloatSpread(1000)
    const z = THREE.MathUtils.randFloatSpread(1000)

    star.position.set(x, y, z)

    scene.add(star)
  }
}

createStars()

function createSun() {
  const sunGeometry = new THREE.SphereGeometry(3, 50, 50) // Adjust the size of the sun
  // Create a shiny material for the sun
  const sunMaterial = new THREE.MeshBasicMaterial({
    color: 0xffff00, // Color of the sun
    emissive: 0xffff00, // Emissive color (for additional glow)
  })
  const sun = new THREE.Mesh(sunGeometry, sunMaterial)
  scene.add(sun)
  return sun
}

// createSun();

// Create a planet
function createPlanet(
  radius,
  texturePath,
  distance,
  speed,
  orbitAngle,
  name,
  gltfPath
) {
  const segments = 32
  const planetGeometry = new THREE.SphereGeometry(radius, 32, 32)
  //const textureLoader = new THREE.TextureLoader()
  //const texture = textureLoader.load(texturePath)
  //const planetMaterial = new THREE.MeshBasicMaterial({
  //  map: texture,
  //})

  const planet = new THREE.Mesh(planetGeometry) // , planetMaterial)
  planet.position.set(
    distance * Math.cos(orbitAngle),
    distance * Math.sin(orbitAngle),
    0
  )
  scene.add(planet)

  function rgba(r, g, b, a) {
    return `rgb(${r}, ${g}, ${b}, ${a})`
  }

  const orbitPathRadius = distance
  const orbitPathGeometry = new THREE.BufferGeometry()
  const orbitPathMaterial = new THREE.LineBasicMaterial({
    color: rgba(128, 128, 128, 0.15),
  })
  const orbitPathPoints = []

  const numPoints = 360
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2
    const x = orbitPathRadius * Math.cos(angle)
    const y = orbitPathRadius * Math.sin(angle)
    const z = 0
    orbitPathPoints.push(x, y, z)
  }

  orbitPathGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(orbitPathPoints, 3)
  )
  const orbitPath = new THREE.Line(orbitPathGeometry, orbitPathMaterial)
  scene.add(orbitPath)

  planet.animate = function (delta) {
    const angle = speed * delta
    planet.rotation.y += angle

    planet.position.set(
      distance * Math.cos(orbitAngle),
      distance * Math.sin(orbitAngle),
      0
    )
    orbitAngle += angle
  }

  const loader = new GLTFLoader()

  // Optional: Provide a DRACOLoader instance to decode compressed mesh data
  const dracoLoader = new DRACOLoader()
  loader.setDRACOLoader(dracoLoader)

  var dog = null
  // Load a glTF resource
  loader.load(
    // resource URL
    gltfPath,
    // called when the resource is loaded
    function (gltf) {
      dog = gltf.scene
      scene.add(dog)

      dog.name = "firstDog"
      // positionner sur l'anneau
      dog.position.set(
        distance * Math.cos(orbitAngle),
        distance * Math.sin(orbitAngle),
        0
      )

      processLoadedModel(dog)

      gltf.animations // Array<THREE.AnimationClip>
      gltf.scene // THREE.Group
      gltf.scenes // Array<THREE.Group>
      gltf.cameras // Array<THREE.Camera>
      gltf.asset // Object
    },
    // called while loading is progressing
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded")
    },
    // called when loading has errors
    function (error) {
      console.log("An error happened")
    }
  )

  console.log(scene.children)

  planet.name = name
  return planet
}

// Create OrbitControls and enable camera movement
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true // Enable smooth camera movement
controls.dampingFactor = 0.05 // Adjust damping factor as per your preference

// Update renderer and camera on window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

const sun = createSun()

function rgb(r, g, b) {
  return `rgb(${r}, ${g}, ${b})`
}

const planets = [
  createPlanet(
    0.7,
    "textures/mercure.jpg",
    7,
    0.47,
    0,
    "Mercure",
    "assets/bond_forger_from_spy__family/scene.gltf"
  ), // Planet 1: Radius: 0.5, Color: Red, Distance: 5, Speed: 0.02
  createPlanet(
    1.8,
    "textures/venus.jpg",
    10,
    0.35,
    Math.PI / 4,
    "Venus",
    "/assets/bond_forger_from_spy__family/scene.gltf"
  ), // Planet 2: Radius: 0.7, Color: Green, Distance: 7, Speed: 0.015
  createPlanet(
    1.9,
    "textures/earth.jpg",
    13,
    0.29,
    Math.PI / 2,
    "Terre",
    "/assets/bond_forger_from_spy__family/scene.gltf"
  ), // Planet 3: Radius: 0.9, Color: Blue, Distance: 9, Speed: 0.01
  createPlanet(
    1.1,
    "textures/mars.jpg",
    20,
    0.24,
    Math.PI / 6,
    "Mars",
    "/assets/bond_forger_from_spy__family/scene.gltf"
  ), // Planet 1: Radius: 0.5, Color: Red, Distance: 5, Speed: 0.02
  createPlanet(
    15,
    "textures/jupiter.jpg",
    42,
    0.13,
    Math.PI / 9,
    "Jupiter",
    "/assets/bond_forger_from_spy__family/scene.gltf"
  ), // Planet 2: Radius: 0.7, Color: Green, Distance: 7, Speed: 0.015
  createPlanet(
    11,
    "textures/saturn.jpg",
    69,
    0.09,
    Math.PI,
    "Saturne",
    "/assets/bond_forger_from_spy__family/scene.gltf"
  ), // Planet 3: Radius: 0.9, Color: Blue, Distance: 9, Speed: 0.01
  createPlanet(
    7.5,
    "textures/uranus.jpg",
    127,
    0.06,
    (3 * Math.PI) / 4,
    "Uranus",
    "/assets/bond_forger_from_spy__family/scene.gltf"
  ), // Planet 1: Radius: 0.5, Color: Red, Distance: 5, Speed: 0.02
  createPlanet(
    7.5,
    "textures/neptune.jpg",
    256,
    0.05,
    (5 * Math.PI) / 6,
    "Neptune",
    "/assets/bond_forger_from_spy__family/scene.gltf"
  ), // Planet 2: Radius: 0.7, Color: Green, Distance: 7, Speed: 0.015
]

const clock = new THREE.Clock() //

// Raycaster
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

// Eventlistener (onClick)
canvas.addEventListener("click", onClick)

function onClick(event) {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  const y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  mouse.x = x
  mouse.y = y

  raycaster.setFromCamera(mouse, camera)

  const intersects = raycaster.intersectObjects(planets, true)

  if (intersects.length > 0) {
    const object = intersects[0].object
    console.log(`Planete touchée : ${object.name}`)

    // Zoom

    console.log(object)
    //camera.position.set(object.position)

    // modifier le centre de ma scene
    // au clique centre de gravité change soit centre de gravité se refresh soit arreter les planetes
    // lerp / gsap
  }
}

function animate() {
  requestAnimationFrame(animate)

  const delta = clock.getDelta() // Get the time difference since the last frame

  // Animate each planet
  planets.forEach((planet) => {
    planet.animate(delta)
  })
  // scene.children[numeroDeLenfant]

  renderer.render(scene, camera)
}

animate()
