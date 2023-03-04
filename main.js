import gsap from 'gsap';
import * as THREE from 'three'
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'

import atmosphereVertexShader from './shaders/atmosphereVertex.glsl'
import atmosphereFragmentShader from './shaders/atmosphereFragment.glsl'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


console.log(vertexShader);

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
    75,
    innerWidth / innerHeight,
    0.1,
    1000
)

const renderer = new THREE.WebGLRenderer(
    {
        antialias: true
    }
)
renderer.setSize(innerWidth, innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)
document.body.appendChild(renderer.domElement)

// Sphere
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(5, 50, 50),
    new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms:{
            globeTexture: {
                value: new THREE.TextureLoader().load('./img/globe4k.jpg')
            }
        }
    })
)

// Atmosphere
const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(5, 50, 50),
    new THREE.ShaderMaterial({
        vertexShader: atmosphereVertexShader,
        fragmentShader: atmosphereFragmentShader,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
    })
)

atmosphere.scale.set(1.1, 1.1, 1.1)

scene.add(atmosphere)
camera.position.z = 15

const group = new THREE.Group()
group.add(sphere)
scene.add(group)

const starGeometry = new THREE.BufferGeometry()
const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff
})

const starVertices = []
for (let i = 0; i < 10000; i++) {
    const x = (Math.random() - 0.5) * 2000
    const y = (Math.random() - 0.5) * 2000
    const z = -Math.random() * 2000
    starVertices.push(x, y, z)
}
console.log(starVertices);

starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3))
const stars = new THREE.Points(starGeometry, starMaterial)
scene.add(stars)


// Locacion
function convertLatLngToCartesian(p) {

    let lat = (90 - p.lat) * (Math.PI/180);
    let lng = (p.lng +180) * (Math.PI/180);
    let radius = 5;

    let x = -(radius * Math.sin(lat)*Math.cos(lng));
    let y = (radius * Math.sin(lat)*Math.sin(lng));
    let z = (radius * Math.cos(lat));

    return {
        x,y,z
    }
}


let pointMesh = new THREE.Mesh(
    new THREE.SphereBufferGeometry(0.05,20,20),
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

scene.add(pointMesh);

//Controls
const controls = new OrbitControls( camera, renderer.domElement );
// controls.maxPolarAngle = Math.PI * 0.495;
// controls.target.set( 0, 10, 0 );
controls.minDistance = 2.0;
controls.maxDistance = 2000.0;
controls.update();


const mouse = {
    x: undefined,
    y: undefined
}

function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
 //   sphere.rotation.y += 0.003
 //   gsap.to(group.rotation,{
 //       x: -mouse.y * 0.3,
 //       y: mouse.x * 0.5,
 //       duration: 1.5
 //   })
}

animate()


addEventListener('mousemove', () => {
    mouse.x = (event.clientX / innerWidth) * 2 - 1
    mouse.y = -(event.clientY / innerHeight) * 2 + 1
   // console.log(mouse);
})