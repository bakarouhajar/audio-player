class AudioVisualizer3D extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.canvas = document.createElement("canvas");
        this.shadowRoot.appendChild(this.canvas);
    }

    connectedCallback() {
        this.initThree();
        const audioPlayer = document.querySelector("my-audio-player");

        if (audioPlayer) {
            this.audioContext = audioPlayer.getAudioContext();
            this.analyser = audioPlayer.getanalyser();
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

            // Démarrer l'animation une fois que tout est initialisé
            this.animate();
        } else {
            console.error("my-audio-player not found. Retrying...");
            setTimeout(() => this.connectedCallback(), 500); // Réessaie après un délai
        }
    }

    initThree() {
        // Dimensions
        this.width = this.offsetWidth || 600;
        this.height = this.offsetHeight || 400;

        // Scène
        this.scene = new THREE.Scene();

        // Caméra
        this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000);
        this.camera.position.set(0, 15, 25);
        this.camera.lookAt(0, 0, 0);

        // Rendu
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
        this.renderer.setSize(this.width, this.height);

        // Lumières
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        const pointLight = new THREE.PointLight(0xff4400, 1, 100);
        pointLight.position.set(10, 20, 10);
        this.scene.add(ambientLight, pointLight);

        // Grille 3D dynamique
        this.createWaveSphere();
    }

    createWaveSphere() {
        const sphereRadius = 15; // Rayon de la sphère
        const segmentCount = 64;

        // Géométrie en forme de sphère
        this.geometry = new THREE.SphereGeometry(sphereRadius, segmentCount, segmentCount);

        // Matériau dynamique
        const material = new THREE.MeshPhongMaterial({
            color: 0x00ff88,
            emissive: 0x000000,
            shininess: 50,
            wireframe: false,
        });

        this.waveSphere = new THREE.Mesh(this.geometry, material);
        this.scene.add(this.waveSphere);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.analyser && this.dataArray) {
            this.analyser.getByteFrequencyData(this.dataArray);

            const vertices = this.waveSphere.geometry.attributes.position.array;

            for (let i = 0; i < vertices.length; i += 3) {
                const distance = Math.sqrt(
                    vertices[i] ** 2 + vertices[i + 1] ** 2 + vertices[i + 2] ** 2
                );
                const frequencyIndex = Math.floor(i / 3) % this.dataArray.length;
                const scaleFactor = this.dataArray[frequencyIndex] / 255;

                vertices[i] = (vertices[i] / distance) * (15 + scaleFactor * 5); // Modifie le rayon
                vertices[i + 1] = (vertices[i + 1] / distance) * (15 + scaleFactor * 5);
                vertices[i + 2] = (vertices[i + 2] / distance) * (15 + scaleFactor * 5);
            }

            this.waveSphere.geometry.attributes.position.needsUpdate = true;
        }

        // Ajouter une légère rotation pour l'effet dynamique
        this.waveSphere.rotation.y += 0.01;

        // Rendu
        this.renderer.render(this.scene, this.camera);
    }
}

customElements.define("audio-visualizer-3d", AudioVisualizer3D);
