// ===============================
// 🌐 LANGUAGE SYSTEM (Dynamic Path Version)
// ===============================
let currentTranslations = {};
const langToggleBtn = document.getElementById("lang-toggle");

async function setLanguage(lang) {
  try {
    // Check if we are inside the 'templates' folder
    const isTemplatePage = window.location.pathname.includes('/templates/');
    const pathPrefix = isTemplatePage ? '../' : './';
    
    // Fetch from the correct relative path
    const res = await fetch(`${pathPrefix}static/lang/${lang}.json`);
    
    if (!res.ok) throw new Error("File not found");
    
    currentTranslations = await res.json();
    localStorage.setItem("lang", lang);
    
    applyTranslations();
    updateLangButton(lang);
  } catch (err) {
    console.error("Language load failed:", err);
  }
}

function getValue(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

function applyTranslations() {
  document.querySelectorAll("[data-key]").forEach(el => {
    const key = el.dataset.key;
    const value = getValue(currentTranslations, key);
    if (value) {
        // Use innerHTML if you want to support <strong> tags in your JSON
        el.innerHTML = value; 
    }
  });
}

function updateLangButton(lang) {
  if (langToggleBtn) langToggleBtn.innerText = lang.toUpperCase();
}

if (langToggleBtn) {
  langToggleBtn.addEventListener("click", () => {
    const current = localStorage.getItem("lang") || "en";
    const next = current === "en" ? "vi" : "en";
    setLanguage(next);
  });
}

// Initial load
window.addEventListener("DOMContentLoaded", () => {
  const savedLang = localStorage.getItem("lang") || "en";
  setLanguage(savedLang);
});

// ===============================
// 🧬 THREE.JS SETUP (DNA & SPHERE)
// ===============================
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setClearColor(0x000000, 0); 
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById('canvas-container').appendChild(renderer.domElement);

// --- GROUP 1: DNA (For Timeline) ---
const dnaGroup = new THREE.Group();
const strandMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 });
const strandGeom = new THREE.SphereGeometry(0.25, 8, 8);

for (let i = 0; i < 1000; i++) {
    const y = (i * 0.5) - 30; 
    const angle = i * 0.3;     
    const radius = 4 + (i * 0.02);        

    const dot1 = new THREE.Mesh(strandGeom, strandMat);
    dot1.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
    dnaGroup.add(dot1);

    const dot2 = new THREE.Mesh(strandGeom, strandMat);
    dot2.position.set(Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius);
    dnaGroup.add(dot2);
}
scene.add(dnaGroup);

// --- GROUP 2: WIREFRAME SPHERE (For About Section) ---
const aboutGroup = new THREE.Group();
const sphereGeom = new THREE.IcosahedronGeometry(15, 1);
const sphereMat = new THREE.MeshBasicMaterial({ 
    color: 0xffffff, 
    wireframe: true, 
    transparent: true, 
    opacity: 0.2 
});
const aboutMesh = new THREE.Mesh(sphereGeom, sphereMat);
aboutGroup.add(aboutMesh);
scene.add(aboutGroup);

camera.position.z = 20;

// ===============================
// 🔄 DYNAMIC ANIMATION LOGIC
// ===============================
let scrollPercent = 0;
window.addEventListener('scroll', () => {
    scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
});

function animate() {
    requestAnimationFrame(animate);
    
    // Constant spin
    dnaGroup.rotation.y += 0.01; 

    // This makes the DNA "track" with your scroll so it's always behind the cards
    // We match the DNA's movement to how much the page has scrolled
    dnaGroup.position.y = -10 + (scrollPercent * 45); 

    // About Sphere
    aboutGroup.rotation.x += 0.002;
    aboutGroup.rotation.y += 0.002;

    renderer.render(scene, camera);
}
animate();

// ===============================
// 🔄 UI TOGGLE LOGIC
// ===============================
const timelineBtn = document.getElementById('view-timeline');
const aboutBtn = document.getElementById('view-about');
const timelineCont = document.getElementById('timeline-container');
const aboutCont = document.getElementById('about-container');
const canvasElement = document.getElementById('canvas-container');

function switchTo(view) {
    canvasElement.classList.add('show-visual'); // Ensure background is visible

    if (view === 'about') {
        timelineCont.classList.add('hidden');
        aboutCont.classList.remove('hidden');
        aboutBtn.classList.add('active');
        timelineBtn.classList.remove('active');

        // Toggle 3D Visibility
        dnaGroup.visible = false;
        aboutGroup.visible = true;
    } else {
        timelineCont.classList.remove('hidden');
        aboutCont.classList.add('hidden');
        timelineBtn.classList.add('active');
        aboutBtn.classList.remove('active');

        // Toggle 3D Visibility
        dnaGroup.visible = true;
        aboutGroup.visible = false;
    }
}

// Event Listeners
timelineBtn.addEventListener('click', () => switchTo('timeline'));
aboutBtn.addEventListener('click', () => switchTo('about'));

// Dropdown Support
window.showTimeline = function() { switchTo('timeline'); };

// Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initial Start State
switchTo('timeline');

// Add this to your main.js
document.querySelectorAll('.dropdown-content a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        // 1. Switch back to timeline view if they are on the "About" page
        if (typeof switchTo === 'function') {
            switchTo('timeline');
        }

        // 2. Get the target ID
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            // 3. Calculate position minus header height (approx 70px)
            const headerOffset = 70;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    });
});