
class SolarSystem {
    constructor() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('solar-system-canvas'), antialias: true });
        
        // Animation and control variables
        this.clock = new THREE.Clock();
        this.isPaused = false;
        this.isLightTheme = false;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Planet data with realistic relative distances and speeds
        this.planetData = [
            { name: 'Mercury', color: 0x8C7853, size: 0.3, distance: 8, speed: 4.74, info: 'Closest planet to the Sun' },
            { name: 'Venus', color: 0xFFA500, size: 0.4, distance: 12, speed: 3.50, info: 'Hottest planet in our solar system' },
            { name: 'Earth', color: 0x4169E1, size: 0.5, distance: 16, speed: 2.98, info: 'Our home planet with abundant life' },
            { name: 'Mars', color: 0xFF6347, size: 0.4, distance: 20, speed: 2.41, info: 'The Red Planet with polar ice caps' },
            { name: 'Jupiter', color: 0xD2691E, size: 1.2, distance: 28, speed: 1.31, info: 'Largest planet with Great Red Spot' },
            { name: 'Saturn', color: 0xFFD700, size: 1.0, distance: 36, speed: 0.97, info: 'Beautiful ring system around the planet' },
            { name: 'Uranus', color: 0x4FD0E7, size: 0.8, distance: 44, speed: 0.68, info: 'Ice giant tilted on its side' },
            { name: 'Neptune', color: 0x4169E1, size: 0.8, distance: 52, speed: 0.54, info: 'Windiest planet in the solar system' }
        ];
        
        // Store planet objects and controls
        this.planets = [];
        this.sun = null;
        this.controls = null;
        this.stars = [];
        
        this.init();
    }
    
    init() {
        this.setupRenderer();
        this.setupCamera();
        this.setupLighting();
        this.setupControls();
        this.createSun();
        this.createPlanets();
        this.createStars();
        this.setupEventListeners();
        this.createControlPanel();
        this.animate();
        
        // Hide loading screen
        setTimeout(() => {
            document.getElementById('loading').style.display = 'none';
        }, 1000);
    }
    
    setupRenderer() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setClearColor(0x000000, 0);
    }
    
    setupCamera() {
        this.camera.position.set(0, 20, 40);
        this.camera.lookAt(0, 0, 0);
    }
    
    setupLighting() {
        // Ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        
        // Point light from the sun
        this.sunLight = new THREE.PointLight(0xFFFFFF, 2, 200);
        this.sunLight.position.set(0, 0, 0);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.scene.add(this.sunLight);
    }
    
    setupControls() {
        // OrbitControls for camera movement
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = true;
        this.controls.minDistance = 10;
        this.controls.maxDistance = 100;
    }
    
    createSun() {
        const sunGeometry = new THREE.SphereGeometry(2, 64, 64);
        
        // Create glowing sun material
        const sunMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFFF00,
            transparent: true,
            opacity: 0.9
        });
        
        this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
        this.sun.userData = { name: 'Sun', info: 'The star at the center of our solar system' };
        this.scene.add(this.sun);
        
        // Add sun glow effect
        const glowGeometry = new THREE.SphereGeometry(2.5, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFAA00,
            transparent: true,
            opacity: 0.3
        });
        const sunGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.sun.add(sunGlow);
    }
    
    createPlanets() {
        this.planetData.forEach((data, index) => {
            // Create planet geometry and material
            const planetGeometry = new THREE.SphereGeometry(data.size, 32, 32);
            const planetMaterial = new THREE.MeshLambertMaterial({ color: data.color });
            
            const planet = new THREE.Mesh(planetGeometry, planetMaterial);
            planet.position.x = data.distance;
            planet.castShadow = true;
            planet.receiveShadow = true;
            
            // Store planet data
            planet.userData = {
                name: data.name,
                distance: data.distance,
                speed: data.speed,
                baseSpeed: data.speed,
                angle: Math.random() * Math.PI * 2, // Random starting position
                info: data.info,
                index: index
            };
            
            this.planets.push(planet);
            this.scene.add(planet);
            
            // Create orbit line
            this.createOrbitLine(data.distance);
        });
    }
    
    createOrbitLine(distance) {
        const orbitGeometry = new THREE.BufferGeometry();
        const orbitPoints = [];
        
        for (let i = 0; i <= 360; i++) {
            const angle = (i * Math.PI) / 180;
            orbitPoints.push(new THREE.Vector3(
                Math.cos(angle) * distance,
                0,
                Math.sin(angle) * distance
            ));
        }
        
        orbitGeometry.setFromPoints(orbitPoints);
        const orbitMaterial = new THREE.LineBasicMaterial({
            color: 0x444444,
            transparent: true,
            opacity: 0.3
        });
        
        const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
        this.scene.add(orbitLine);
    }
    
    createStars() {
        const starGeometry = new THREE.BufferGeometry();
        const starVertices = [];
        
        // Create 1000 random stars
        for (let i = 0; i < 1000; i++) {
            const x = (Math.random() - 0.5) * 200;
            const y = (Math.random() - 0.5) * 200;
            const z = (Math.random() - 0.5) * 200;
            starVertices.push(x, y, z);
        }
        
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        
        const starMaterial = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 0.5,
            transparent: true,
            opacity: 0.8
        });
        
        this.stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(this.stars);
    }
    
    createControlPanel() {
        const controlsContainer = document.getElementById('planet-controls');
        
        this.planetData.forEach((data, index) => {
            const controlDiv = document.createElement('div');
            controlDiv.className = 'planet-control';
            
            controlDiv.innerHTML = `
                <h4>
                    <span class="planet-color" style="background-color: #${data.color.toString(16).padStart(6, '0')}"></span>
                    ${data.name}
                </h4>
                <div class="speed-control">
                    <input 
                        type="range" 
                        class="speed-slider" 
                        id="speed-${index}"
                        min="0" 
                        max="10" 
                        step="0.1" 
                        value="${data.speed}"
                    >
                    <span class="speed-value" id="value-${index}">${data.speed.toFixed(1)}</span>
                </div>
            `;
            
            controlsContainer.appendChild(controlDiv);
            
            // Add event listener for speed control
            const slider = controlDiv.querySelector(`#speed-${index}`);
            const valueDisplay = controlDiv.querySelector(`#value-${index}`);
            
            slider.addEventListener('input', (e) => {
                const newSpeed = parseFloat(e.target.value);
                this.planets[index].userData.speed = newSpeed;
                valueDisplay.textContent = newSpeed.toFixed(1);
            });
        });
    }
    
    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Mouse events for planet selection
        this.renderer.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.renderer.domElement.addEventListener('click', (e) => this.onMouseClick(e));
        
        // Pause/Resume button
        document.getElementById('pause-resume-btn').addEventListener('click', () => {
            this.togglePause();
        });
        
        // Theme toggle button
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Touch events for mobile
        this.renderer.domElement.addEventListener('touchstart', (e) => this.onTouchStart(e));
    }
    
    onWindowResize() {
        const container = document.querySelector('.scene-container');
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
    
    onMouseMove(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        this.checkIntersections();
    }
    
    onMouseClick(event) {
        this.checkIntersections(true);
    }
    
    onTouchStart(event) {
        if (event.touches.length === 1) {
            const rect = this.renderer.domElement.getBoundingClientRect();
            this.mouse.x = ((event.touches[0].clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((event.touches[0].clientY - rect.top) / rect.height) * 2 + 1;
            
            this.checkIntersections(true);
        }
    }
    
    checkIntersections(clicked = false) {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        const intersects = this.raycaster.intersectObjects([this.sun, ...this.planets]);
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            this.showPlanetInfo(object.userData);
            
            if (clicked) {
                this.focusOnPlanet(object);
            }
            
            document.body.style.cursor = 'pointer';
        } else {
            this.hidePlanetInfo();
            document.body.style.cursor = 'default';
        }
    }
    
    showPlanetInfo(planetData) {
        const infoPanel = document.getElementById('info-panel');
        const planetName = document.getElementById('planet-name');
        const planetDetails = document.getElementById('planet-details');
        
        planetName.textContent = planetData.name;
        planetDetails.innerHTML = `
            <p><strong>Info:</strong> ${planetData.info}</p>
            ${planetData.distance ? `<p><strong>Distance from Sun:</strong> ${planetData.distance} AU</p>` : ''}
            ${planetData.speed ? `<p><strong>Orbital Speed:</strong> ${planetData.speed.toFixed(1)} km/s</p>` : ''}
        `;
        
        infoPanel.classList.add('show');
    }
    
    hidePlanetInfo() {
        const infoPanel = document.getElementById('info-panel');
        infoPanel.classList.remove('show');
    }
    
    focusOnPlanet(planet) {
        if (planet === this.sun) {
            // Focus on sun
            this.controls.target.set(0, 0, 0);
        } else {
            // Focus on planet
            this.controls.target.copy(planet.position);
        }
        this.controls.update();
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        const button = document.getElementById('pause-resume-btn');
        button.textContent = this.isPaused ? '▶️ Resume' : '⏸️ Pause';
        button.classList.toggle('primary');
        button.classList.toggle('secondary');
    }
    
    toggleTheme() {
        this.isLightTheme = !this.isLightTheme;
        document.body.classList.toggle('light-theme', this.isLightTheme);
        
        const button = document.getElementById('theme-toggle');
        button.textContent = this.isLightTheme ? '🌞 Light Mode' : '🌙 Dark Mode';
        
        // Update scene background
        if (this.isLightTheme) {
            this.renderer.setClearColor(0xf0f0f0, 1);
            this.stars.material.opacity = 0.3;
        } else {
            this.renderer.setClearColor(0x000000, 0);
            this.stars.material.opacity = 0.8;
        }
    }
    
    updatePlanets() {
        if (this.isPaused) return;
        
        const deltaTime = this.clock.getDelta();
        
        this.planets.forEach((planet) => {
            // Update planet rotation around its axis
            planet.rotation.y += deltaTime * 0.5;
            
            // Update orbital position
            planet.userData.angle += deltaTime * planet.userData.speed * 0.1;
            
            planet.position.x = Math.cos(planet.userData.angle) * planet.userData.distance;
            planet.position.z = Math.sin(planet.userData.angle) * planet.userData.distance;
        });
        
        // Rotate the sun
        if (this.sun) {
            this.sun.rotation.y += deltaTime * 0.2;
        }
        
        // Subtle star animation
        if (this.stars) {
            this.stars.rotation.y += deltaTime * 0.01;
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.updatePlanets();
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the solar system when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.solarSystem = new SolarSystem();
});

// Handle page visibility change for performance
document.addEventListener('visibilitychange', () => {
    if (window.solarSystem) {
        if (document.hidden) {
            window.solarSystem.isPaused = true;
        }
    }
});
