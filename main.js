import './style.css';
import gsap from 'gsap';
import * as THREE from 'three';
import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';
import atmosphereVertexShader from './shaders/atmosphereVertex.glsl';
import atmosphereFragmentShader from './shaders/atmosphereFragment.glsl';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ─── DOM refs ──────────────────────────────────────────────────────
const mainContent = document.getElementById('main-content');
const progressBar = document.getElementById('progress-bar');
const progressBarContainer = document.querySelector('.progress-bar-container');

mainContent.style.display = 'none';
document.getElementById('bg').style.display = 'none';

// ─── Loading manager ───────────────────────────────────────────────
THREE.DefaultLoadingManager.onProgress = (_, loaded, total) => {
    progressBar.value = (loaded / total) * 100;
};

THREE.DefaultLoadingManager.onLoad = () => {
    progressBarContainer.style.display = 'none';
    mainContent.style.display = 'flex';
    document.getElementById('bg').style.display = 'block';
};

// ─── Scene setup ───────────────────────────────────────────────────
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: document.querySelector('#bg')
});

renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

const isMobile = /Mobi|Android/i.test(navigator.userAgent);
camera.position.z = isMobile ? -160 : -140;

// ─── Globe ─────────────────────────────────────────────────────────
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(50, 50, 50),
    new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            globeTexture: { value: new THREE.TextureLoader().load('/img/globe4k.jpg') }
        }
    })
);

const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(54, 50, 50),
    new THREE.ShaderMaterial({
        vertexShader: atmosphereVertexShader,
        fragmentShader: atmosphereFragmentShader,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
    })
);
atmosphere.scale.set(1.1, 1.1, 1.1);

// ─── Stars ─────────────────────────────────────────────────────────
const MIN_STAR_DIST = 300;
const starVertices = [];
const starCount = isMobile ? 10000 : 20000;

while (starVertices.length < starCount * 3) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    if (x * x + y * y + z * z > MIN_STAR_DIST * MIN_STAR_DIST) {
        starVertices.push(x, y, z);
    }
}

const starGeometry = new THREE.BufferGeometry();
starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
const stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0xffffff }));

// ─── Group ─────────────────────────────────────────────────────────
const group = new THREE.Group();
group.add(sphere, atmosphere, stars);
scene.add(group);

// ─── Controls ──────────────────────────────────────────────────────
const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 2.0;
controls.maxDistance = 2000.0;

if (isMobile) {
    controls.enablePan = false;
    controls.rotateSpeed = 0.6;
    controls.zoomSpeed = 0.8;
}
controls.update();

// ─── Animation loop ────────────────────────────────────────────────
function animate() {
    requestAnimationFrame(animate);
    group.rotation.y += 0.001;
    renderer.render(scene, camera);
}
animate();

// ─── Mouse rotation (desktop only) ────────────────────────────────
window.addEventListener('mousemove', (e) => {
    if (isMobile) return;
    const x = (e.clientX / innerWidth) * 2 - 1;
    const y = -(e.clientY / innerHeight) * 2 + 1;
    gsap.to(group.rotation, { x: -y * 0.3, y: x * 0.5, duration: 1.5 });
});

// ─── Touch rotation (mobile only) ─────────────────────────────────
let lastTouch = null;
window.addEventListener('touchstart', (e) => {
    if (e.touches[0]) lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
});
window.addEventListener('touchmove', (e) => {
    if (!isMobile || !e.touches[0] || !lastTouch) return;
    const dx = e.touches[0].clientX - lastTouch.x;
    const dy = e.touches[0].clientY - lastTouch.y;
    gsap.to(group.rotation, {
        x: group.rotation.x + dy * 0.003,
        y: group.rotation.y + dx * 0.004,
        duration: 0.5
    });
    lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
});

// ─── Scroll: zoom-out + hero fade ─────────────────────────────────
const CAMERA_START_Z = isMobile ? -160 : -140;
const CAMERA_END_Z = -600;

window.addEventListener('scroll', () => {
    const progress = Math.min(window.scrollY / window.innerHeight, 1);
    gsap.to(camera.position, {
        z: CAMERA_START_Z + (CAMERA_END_Z - CAMERA_START_Z) * progress,
        duration: 0.3,
        ease: 'power2.out'
    });
    const opacity = Math.max(1 - progress * 2, 0);
    mainContent.style.opacity = opacity;
    mainContent.style.pointerEvents = opacity === 0 ? 'none' : 'auto';
});

// ─── Language switcher ─────────────────────────────────────────────
function applyLang(lang) {
    document.querySelectorAll('[data-es][data-en]').forEach(el => {
        el.textContent = el.dataset[lang];
    });
    document.querySelectorAll('.lang-only-es').forEach(el => {
        el.style.display = lang === 'es' ? '' : 'none';
    });
    document.querySelectorAll('.lang-only-en').forEach(el => {
        el.style.display = lang === 'en' ? '' : 'none';
    });
    document.documentElement.lang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
}

document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => applyLang(btn.dataset.lang));
});

// ─── Timeline accordion ────────────────────────────────────────────
document.querySelectorAll('[data-toggle]').forEach(header => {
    header.addEventListener('click', () => {
        header.closest('.tl-card').classList.toggle('open');
    });
});

// ─── Scroll reveal ─────────────────────────────────────────────────
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ─── Resize ────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
