import * as THREE from "../node_modules/three/build/three.module.js"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js"
import TWEEN from "@tweenjs/tween.js"

const scene = new THREE.Scene()
const loader = new GLTFLoader()

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
camera.position.z = 30

const dogsArray = []

// Create renderer object and specify its size
const canvas = document.querySelector(".webgl")
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
})
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

// Create a dog
function createdog(
  scale,
  texturePath,
  distance,
  speed,
  orbitAngle,
  name,
  gltfPath
) {
  const segments = 32

  // load a texture, set wrap mode to repeat
  const texture = new THREE.TextureLoader().load(texturePath)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(4, 4)

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
      dog.scale.set(scale, scale, scale)

      dogsArray.push(dog)

      dog.isRotating = true
      scene.add(dog)

      dog.name = "Dog"
      // positionner sur l'anneau
      dog.position.set(
        distance * Math.cos(orbitAngle),
        distance * Math.sin(orbitAngle),
        0
      )

      dog.traverse((child) => {
        // Vérifier si l'objet est un maillage (mesh)
        if (child.isMesh) {
          // Appliquer la texture au matériau de l'objet
          child.material.map = texture
        }
      })

      // Add rotation animation to the dog
      dog.animate = function (delta) {
        const angle = speed * delta // Calculate the rotation angle based on the speed and delta time
        dog.rotation.y += angle // Apply the rotation

        dog.position.set(
          distance * Math.cos(orbitAngle),
          distance * Math.sin(orbitAngle)
        ) // Update the position in the circular orbit
        orbitAngle += angle // Update the orbit angle
      }

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

const dogs = [
  createdog(
    1, //Scale
    "textures/mercure.jpg",
    7,
    0.47,
    0,
    "Mercure", // Name
    "assets/bond_forger_from_spy__family/scene.gltf"
  ), // dog 1: Radius: 0.5, Color: Red, Distance: 5, Speed: 0.02
  createdog(
    1,
    "textures/earth.jpg",
    10,
    0.35,
    Math.PI / 4,
    "Venus",
    "/assets/dog/scene.gltf"
  ), // dog 2: Radius: 0.7, Color: Green, Distance: 7, Speed: 0.015
  createdog(
    3,
    "textures/earth.jpg",
    13,
    0.29,
    Math.PI / 2,
    "Terre",
    "/assets/balloon_dog/scene.gltf"
  ), // dog 3: Radius: 0.9, Color: Blue, Distance: 9, Speed: 0.01
  createdog(
    4,
    "textures/mars.jpg",
    20,
    0.24,
    Math.PI / 6,
    "Mars",
    "/assets/dog_skate/scene.gltf"
  ), // dog 1: Radius: 0.5, Color: Red, Distance: 5, Speed: 0.02
  createdog(
    5,
    "textures/jupiter.jpg",
    42,
    0.13,
    Math.PI / 9,
    "Jupiter",
    "/assets/bond_forger_from_spy__family/scene.gltf"
  ), // dog 2: Radius: 0.7, Color: Green, Distance: 7, Speed: 0.015
  createdog(
    6,
    "textures/saturn.jpg",
    69,
    0.09,
    Math.PI,
    "Saturne",
    "/assets/dog/scene.gltf"
  ), // dog 3: Radius: 0.9, Color: Blue, Distance: 9, Speed: 0.01
  createdog(
    15,
    "textures/uranus.jpg",
    127,
    0.06,
    (3 * Math.PI) / 4,
    "Uranus",
    "/assets/dog/scene.gltf"
  ), // dog 1: Radius: 0.5, Color: Red, Distance: 5, Speed: 0.02
  createdog(
    30,
    "/assets/zombie_dog/textures/M_Wasteland_hound_normal.jpeg",
    256,
    0.05,
    (5 * Math.PI) / 6,
    "Neptune",
    "/assets/dog/scene.gltf"
  ), // dog 2: Radius: 0.7, Color: Green, Distance: 7, Speed: 0.015
]

const clock = new THREE.Clock() //

// Raycaster
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

// Eventlistener (onClick)
canvas.addEventListener("click", onClick)

let isDragging = false // Track dragging state

function onMouseDown(event) {
  isDragging = false
}

function onMouseMove(event) {
  isDragging = true
}

canvas.addEventListener("mousedown", onMouseDown, false)
canvas.addEventListener("mousemove", onMouseMove, false)

function onClick(event) {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  const y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  mouse.x = x
  mouse.y = y

  raycaster.setFromCamera(mouse, camera)

  const intersects = raycaster.intersectObjects(dogsArray, true)

  if (isDragging) {
    return // Ignore the click event if dragging occurred
  }

  // Get the text container element
  const textContainer = document.getElementById("text-container")

  // Clear previous text content
  textContainer.innerHTML = ""

  // Declare a flag to track the zoom state
  if (intersects.length > 0) {
    const object = intersects[0].object
    console.log(`dog clicked: ${object.name}`)

    // Display dog information
    const dogInfo = document.createElement("p")
    dogInfo.textContent = `dog: ${object.name}`
    dogInfo.textContent = `LA GROSSE DARONNE A HUGO PROUT PROUT PROUT`
    textContainer.appendChild(dogInfo)

    // Zoom
    const targetPosition = object.position.clone()
    const distanceFromdog = object.geometry.parameters.radius * 4
    const cameraPosition = targetPosition
      .clone()
      .add(new THREE.Vector3(0, 0, distanceFromdog))
    const tweenDuration = 1000

    new TWEEN.Tween(camera.position)
      .to(cameraPosition, tweenDuration)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .start()

    new TWEEN.Tween(camera.lookAt)
      .to(targetPosition, tweenDuration)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .start()

    // Stop rotation
    dogsArray.forEach((dog) => {
      dog.isRotating = false
    })
  } else {
    // Unzoom
    const zoomOutPosition = new THREE.Vector3(0, 0, 200) // Adjust the unzoomed camera position
    const tweenDuration = 1000

    new TWEEN.Tween(camera.position)
      .to(zoomOutPosition, tweenDuration)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onComplete(() => {
        // Make dogsArray rotate again
        dogsArray.forEach((dog) => {
          dog.isRotating = true
        })
      })
      .start()

    new TWEEN.Tween(camera.lookAt)
      .to(new THREE.Vector3(0, 0, 0), tweenDuration)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .start()
  }
}

function animate() {
  requestAnimationFrame(animate)

  const delta = clock.getDelta() // Get the time difference since the last frame

  // scene.children[numeroDeLenfant]

  const dog = scene.children[20009]
  if (dog) {
    dog.rotation.y += 0.1
  }

  dogsArray.forEach((dog) => {
    if (dog.isRotating) {
      dog.animate(delta)
    }
  })

  TWEEN.update()

  renderer.render(scene, camera)
}

animate()
