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

        if (!audioPlayer) {
            console.error("my-audio-player not found.");
            return;
        }

        audioPlayer.addEventListener("analyserReady", (event) => {
            this.audioContext = event.detail.audioContext;
            this.analyser = event.detail.analyser;

            if (!this.analyser) {
                console.error("AnalyserNode not found.");
                return;
            }

            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

            // Commence l'animation
            this.animate();
        });
    }

    initThree() {
        const rect = this.getBoundingClientRect();
        this.width = rect.width || 300;
        this.height = rect.height || 300;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000);
        this.camera.position.set(0, 15, 25);

        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        const light = new THREE.PointLight(0xffffff, 1, 100);
        light.position.set(10, 10, 10);
        this.scene.add(light);
// Lumières
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Intensité augmentée
this.scene.add(ambientLight);

const spotLight = new THREE.SpotLight(0xffffff, 1.5); // Plus puissant
spotLight.position.set(15, 40, 35);
this.scene.add(spotLight);

        this.createWaveSphere();

        window.addEventListener("resize", () => this.onResize());
    }

    onResize() {
        const rect = this.getBoundingClientRect();
        this.width = rect.width || 300;
        this.height = rect.height || 300;

        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
    }

    createWaveSphere() {
        const sphereRadius = 15;
        const segmentCount = 64;

        this.geometry = new THREE.SphereGeometry(sphereRadius, segmentCount, segmentCount);

        const material = new THREE.MeshPhongMaterial({
            color: 0xff0000, // Rouge vif
            emissive: 0x550000,
            shininess: 80,
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

                vertices[i] = (vertices[i] / distance) * (15 + scaleFactor * 5);
                vertices[i + 1] = (vertices[i + 1] / distance) * (15 + scaleFactor * 5);
                vertices[i + 2] = (vertices[i + 2] / distance) * (15 + scaleFactor * 5);
            }

            this.waveSphere.geometry.attributes.position.needsUpdate = true;
        }

        this.renderer.render(this.scene, this.camera);
    }
}

customElements.define("audio-visualizer-3d", AudioVisualizer3D);
