import * as THREE from 'three'
import gsap, { Power2 } from 'gsap'
import { arrayMoveImmutable } from 'array-move'

const R = 100
const ITEMS = 12
const ANGLE = 360 / ITEMS * Math.PI / 180
const MOVE_STEP = 1
const ANIMATION_DURATION = 2

const containersData = Array(ITEMS).fill(undefined).map((_, i) => {
  return {
    position: getItemPosition(i + 1)
  }
})

const appEl = document.getElementById('app')
const moveLeftEl = document.getElementById('move_left')
const moveRightEl = document.getElementById('move_right')

let camera,
  scene,
  renderer,
  meshes = [],
  isAnimationRunning = false

init()
animate()

function init() {
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000)
  camera.position.z = 200

  scene = new THREE.Scene()

  const texture = new THREE.TextureLoader().load('Ghost_Container_Full.png');

  containersData.forEach(container => {
    const geometry = new THREE.PlaneGeometry(47.1, 87)
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true })
    const mesh = new THREE.Mesh(geometry, material)
    const { x, y, z } = container.position

    mesh.position.set(x, y, z)

    meshes.push(mesh)
    scene.add(mesh)
  })

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  appEl.appendChild(renderer.domElement);

  window.addEventListener('resize', onWindowResize);
  moveLeftEl.addEventListener('click', () => moveItems('LEFT'))
  moveRightEl.addEventListener('click', () => moveItems('RIGHT'))
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

function getItemPosition(index) {
  return {
    x: R * Math.cos(ANGLE * index),
    y: 0,
    z: R * Math.sin(ANGLE * index)
  }
}

function moveItems(direction) {
  if (isAnimationRunning) return

  const getNextIndex = (i) => (i - MOVE_STEP + meshes.length) % meshes.length + 1
  const getPrevIndex = (i) => (i + 1 + MOVE_STEP) % meshes.length
  const getIndex = direction === 'RIGHT' ? getNextIndex : getPrevIndex
  const timeline = gsap.timeline()

  timeline.eventCallback('onStart', () => {
    isAnimationRunning = true
  })

  timeline.eventCallback('onComplete', () => {
    isAnimationRunning = false
  })

  meshes.forEach((mesh, i) => {
    const newPosition = getItemPosition(getIndex(i))
    timeline.to(mesh.position, {
      ease: Power2.easeIn,
      duration: ANIMATION_DURATION,
      x: newPosition.x,
      z: newPosition.z
    }, 0)
  })

  timeline.play()

  const resetFromIndex = direction === 'RIGHT' ? 0 : -1
  const resetToIndex = direction === 'RIGHT' ? -1 : 0
  for (let j = 0; MOVE_STEP > j; j++) {
    meshes = arrayMoveImmutable(meshes, resetFromIndex, resetToIndex)
  }
}