import './style.css';
import gsap from 'gsap';
import * as THREE from 'three'
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'

import atmosphereVertexShader from './shaders/atmosphereVertex.glsl'
import atmosphereFragmentShader from './shaders/atmosphereFragment.glsl'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


console.log(vertexShader);

const mainContent = document.getElementById('main-content');
const bg = document.getElementById('bg');
mainContent.style.display = 'none';
bg.style.display = 'none';

// Loading Manager
THREE.DefaultLoadingManager.onStart = function ( url, itemsLoaded, itemsTotal ) {
    console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
};

const progressBar = document.getElementById('progress-bar');
THREE.DefaultLoadingManager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
  progressBar.value = (itemsLoaded / itemsTotal) * 100;
  console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
};

const progressBarContainer = document.querySelector('.progress-bar-container');
THREE.DefaultLoadingManager.onLoad = function ( ) {
  progressBarContainer.style.display = 'none';
  mainContent.style.display = 'flex';
  bg.style.display = 'block';
  console.log( 'Loading Complete!');
};

THREE.DefaultLoadingManager.onError = function ( url ) {
    console.log( 'There was an error loading ' + url );
};


const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
    75,
    innerWidth / innerHeight,
    0.1,
    1000
)

// Locacion
function convertLatLngToCartesian(p) {

    let lat = (90 - p.lat) * (Math.PI/180);
    let lng = (p.lng +180) * (Math.PI/180);
    let radius = 50;

    let x = -(radius * Math.sin(lat)*Math.cos(lng));
    let y = (radius * Math.sin(lat)*Math.sin(lng));
    let z = (radius * Math.cos(lat));

    return {
        x,y,z
    }
}


let pointMesh = new THREE.Mesh(
    new THREE.SphereBufferGeometry(0.3,20,20),
    new THREE.MeshBasicMaterial({color: 0xff0000})
)

//
let mazunte = {
    lat: 15.6677,
    lng: 96.5545
}

let pichilemu = {
    lat: 52.3919,
    lng: 63.5545
}

let losAngeles = {
    lat: 34.0522,
    lng: -120.2437
}



let nyork = {
    lat: 51.0522,
    lng: -70.2437
}


let lima = {
    lat: -12.04318,
    lng: 77.02824
}

//let lat = -12.04318 * Math.PI/180;
//let lng = -77.02824 * Math.PI/180;

//let lat = 34.0522 * Math.PI/180;
//let lng = 118.2437 * Math.PI/180;


let pos = convertLatLngToCartesian(pichilemu);
console.log(pos);

pointMesh.position.set(pos.x, pos.y, pos.z)


const renderer = new THREE.WebGLRenderer(
    {
        antialias: true,
        canvas: document.querySelector('#bg')
    }
)
renderer.setSize(innerWidth, innerHeight)
// mejorar performance en dispositivos móviles limitando pixel ratio
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
document.body.appendChild(renderer.domElement)

// Sphere
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(50, 50, 50),
    new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms:{
            globeTexture: {
                value: new THREE.TextureLoader().load('/img/globe4k.jpg')
            }
        }
    })
)

// Atmosphere
const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(54, 50, 50),
    new THREE.ShaderMaterial({
        vertexShader: atmosphereVertexShader,
        fragmentShader: atmosphereFragmentShader,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
    })
)

atmosphere.scale.set(1.1, 1.1, 1.1)

// Detectar mobile y ajustar parámetros
const isMobile = /Mobi|Android/i.test(navigator.userAgent)
if (isMobile) {
    // cámara un poco más cerca en móviles
    camera.position.z = -160
} else {
    camera.position.z = -140
}

// generar estrellas: menos cantidad en mobile para mejorar rendimiento
// Se descartan las que quedan a menos de 300 unidades del planeta
const starVertices = []
const starCount = isMobile ? 10000 : 20000
const MIN_STAR_DIST = 300
while (starVertices.length < starCount * 3) {
    const x = (Math.random() - 0.5) * 2000
    const y = (Math.random() - 0.5) * 2000
    const z = (Math.random() - 0.5) * 2000
    if (x*x + y*y + z*z > MIN_STAR_DIST * MIN_STAR_DIST) {
        starVertices.push(x, y, z)
    }
}

const starGeometry = new THREE.BufferGeometry()
const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff
})
starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3))
const stars = new THREE.Points(starGeometry, starMaterial)



const group = new THREE.Group()
group.add(sphere)
group.add(atmosphere)
group.add(pointMesh)
group.add(stars)
scene.add(group)



//Controls
const controls = new OrbitControls( camera, renderer.domElement );
// controls.maxPolarAngle = Math.PI * 0.495;
// controls.target.set( 0, 10, 0 );
controls.minDistance = 2.0;
controls.maxDistance = 2000.0;
// ajustes para mobile: suavizar o limitar algunos movimientos
if (isMobile) {
    controls.enablePan = false
    controls.rotateSpeed = 0.6
    controls.zoomSpeed = 0.8
} else {
    controls.rotateSpeed = 1.0
}
controls.update();


const mouse = {
    x: undefined,
    y: undefined
}

function animate() {
    requestAnimationFrame(animate)
    group.rotation.y += 0.001;
    renderer.render(scene, camera)
}

animate()

addEventListener('mousemove', (event) => {
        if (isMobile) return
        mouse.x = (event.clientX / innerWidth) * 2 - 1
        mouse.y = -(event.clientY / innerHeight) * 2 + 1
    gsap.to(group.rotation,{
        x: -mouse.y * 0.3,
        y: mouse.x * 0.5,
        duration: 1.5
    })
})

// touch controls: permitir pequeñas rotaciones con swipe
let lastTouch = null
addEventListener('touchstart', (e) => {
    if (e.touches && e.touches[0]) lastTouch = {x: e.touches[0].clientX, y: e.touches[0].clientY}
})
addEventListener('touchmove', (e) => {
    if (!isMobile) return
    if (e.touches && e.touches[0] && lastTouch) {
        const dx = e.touches[0].clientX - lastTouch.x
        const dy = e.touches[0].clientY - lastTouch.y
        // rotar el grupo suavemente según el swipe - aumentar multiplicador Y para mayor rotación
        gsap.to(group.rotation, { 
            x: group.rotation.x + dy * 0.003,
            y: group.rotation.y + dx * 0.004,
            duration: 0.5
        })
        lastTouch = {x: e.touches[0].clientX, y: e.touches[0].clientY}
    }
})

// Scroll: zoom-out del planeta + fade del hero
// El zoom ocurre en los primeros 100vh de scroll
const CAMERA_START_Z = isMobile ? -160 : -140
const CAMERA_END_Z = -600

window.addEventListener('scroll', () => {
    const progress = Math.min(window.scrollY / window.innerHeight, 1)

    // Zoom out rápido
    gsap.to(camera.position, {
        z: CAMERA_START_Z + (CAMERA_END_Z - CAMERA_START_Z) * progress,
        duration: 0.3,
        ease: 'power2.out'
    })

    // Fade del hero (desaparece en el primer 50% del scroll)
    const heroOpacity = Math.max(1 - progress * 2, 0)
    mainContent.style.opacity = heroOpacity
    mainContent.style.pointerEvents = heroOpacity === 0 ? 'none' : 'auto'
})

// Reveal sections on scroll via IntersectionObserver
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
        }
    })
}, { threshold: 0.15 })

document.querySelectorAll('.reveal').forEach(el => observer.observe(el))

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}
