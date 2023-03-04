import gsap from 'gsap';
import * as THREE from 'three'
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'

import atmosphereVertexShader from './shaders/atmosphereVertex.glsl'
import atmosphereFragmentShader from './shaders/atmosphereFragment.glsl'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


console.log(vertexShader);


// Loading Manager
THREE.DefaultLoadingManager.onStart = function ( url, itemsLoaded, itemsTotal ) {
    console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
};

THREE.DefaultLoadingManager.onLoad = function ( ) {
    console.log( 'Loading Complete!');
};

THREE.DefaultLoadingManager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
    console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
};

THREE.DefaultLoadingManager.onError = function ( url ) {
    console.log( 'There was an error loading ' + url );
};


const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
    75,
    innerWidth / innerHeight,
    0.1,
    100000
)
camera.position.z = 1;
camera.rotation.x = 1.16;
camera.rotation.y = -0.12;
camera.rotation.z = 0.27;
//camera.position.z = 15


// Render
const renderer = new THREE.WebGLRenderer(
    {
        antialias: true
    }
)
//scene.fog = new THREE.FogExp2(0x00111f, 0.002);
//renderer.setClearColor(scene.fog.color);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement)


// Lights
let cloudParticles = [], flash, rain, rainGeo, rainCount = 25000, cloud;
const ambient = new THREE.AmbientLight(0x555555);
scene.add(ambient);

const directionalLight = new THREE.DirectionalLight(0xffeedd);
directionalLight.position.set(0,0,1);
scene.add(directionalLight);

flash = new THREE.PointLight(0x062d89, 30, 500 ,1.7);
flash.position.set(200,300,100);
scene.add(flash);

//Rain
const vertex = new THREE.Vector3();
rainGeo = new THREE.BufferGeometry();
const vertices = [];
for (let i = 0; i < rainCount; i++) {
    vertices.push(
        Math.random() * 520 - 160,
        Math.random() * 1500 - 150,
        Math.random() * 230 - 160
    );
}
rainGeo.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
const rainMaterial = new THREE.PointsMaterial({
    color: 0xaaaaaa,
    size: 0.1,
    transparent: true
});
rain = new THREE.Points(rainGeo,rainMaterial);
console.log(rain);
scene.add(rain);

// Nube
let loader = new THREE.TextureLoader();
loader.load("./img/smoke.png", function(texture){
    const cloudGeo = new THREE.PlaneBufferGeometry(500,500);
    const cloudMaterial = new THREE.MeshLambertMaterial({
        map: texture,
        transparent: true
    });

    for(let p=0; p<40; p++) {
        cloud = new THREE.Mesh(cloudGeo,cloudMaterial);
        cloud.position.set(
            Math.random()*800 - 400,
            200,
            Math.random()*700 - 450
        );
        cloud.rotation.x = 1.16;
        cloud.rotation.y = -0.12;
        cloud.rotation.z = Math.random()*360;
        cloud.material.opacity = 0.6;
        cloudParticles.push(cloud);
        scene.add(cloud);
    }
    animate();
});

function rainVariation() {
    let positionAttribute = rain.geometry.getAttribute( 'position' );
    for ( let i = 0; i < positionAttribute.count; i ++ ) {
        vertex.fromBufferAttribute( positionAttribute, i );
        vertex.y -= 1;
        if (vertex.y < - 60) {
            vertex.y = 90;
        }
        positionAttribute.setXYZ( i, vertex.x, vertex.y, vertex.z );
    }
    positionAttribute.needsUpdate = true;
}












// -- EARTH --
// Sphere
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(600, 50, 50),
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
    new THREE.SphereGeometry(600, 50, 50),
    new THREE.ShaderMaterial({
        vertexShader: atmosphereVertexShader,
        fragmentShader: atmosphereFragmentShader,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
    })
)
atmosphere.scale.set(1.1, 1.1, 1.1)

// Stars
const starVertices = []
for (let i = 0; i < 15000; i++) {
    const x = (Math.random() - 0.5) * 20000
    const y = (Math.random() - 0.5) * 20000
    const z = -Math.random() * 20000
    starVertices.push(x, y, z)
}
const starGeometry = new THREE.BufferGeometry()
const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff
})
starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3))
const stars = new THREE.Points(starGeometry, starMaterial)

// Locacion
function convertLatLngToCartesian(p) {
    let lat = (90 - p.lat) * (Math.PI/180);
    let lng = (p.lng +180) * (Math.PI/180);
    let radius = 600;

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

let pos = convertLatLngToCartesian(pichilemu);
console.log(pos);
pointMesh.position.set(pos.x, pos.y, pos.z)

// Earth
const group = new THREE.Group()

group.add(sphere)
group.add(atmosphere)
group.add(pointMesh)
group.add(stars)
scene.add(group)
// Controls
//const controls = new OrbitControls( camera, renderer.domElement );
//// controls.maxPolarAngle = Math.PI * 0.495;
//// controls.target.set( 0, 10, 0 );
//controls.minDistance = 2.0;
//controls.maxDistance = 2000.0;
//controls.update();

const mouse = {
    x: undefined,
    y: undefined
}

function animate() {

    // Animacion LLuvia
    rainVariation()
    cloudParticles.forEach(p => {
        p.rotation.z -=0.001;
    });
    rain.rotation.y +=0.002;
    if(Math.random() > 0.95 || flash.power > 100) {
        if(flash.power < 100)
            flash.position.set(
                Math.random()*400,
                300 + Math.random() *200,
                100
            );
        flash.power = 50 + Math.random() * 500;
    }

    requestAnimationFrame(animate)
    renderer.render(scene, camera)

    //gsap.to(group.rotation, {
    //    x: -mouse.y * 0.3,
    //    y: mouse.x * 0.3,
    //    duration: 2
    //})


    console.log('camera.position:::',camera.position)
    console.log('camera.rotation:::',camera.rotation)
   const timeline = new gsap.timeline();

   timeline.from(camera.position, { y: -20, duration: 2 }, "<")
     .to(camera.position,{
         x: 455,
         y: -305,
         z: 1220,
         duration: 2
     },'start')
     .to(camera.rotation,{
         x: 0.20,
         y: 0.50,
         z: 0.16,
         duration: 2
     },'start');


}

animate()

addEventListener('mousemove', () => {
    mouse.x = (event.clientX / innerWidth) * 2 - 1
    mouse.y = -(event.clientY / innerHeight) * 2 + 1
    console.log(mouse);
})