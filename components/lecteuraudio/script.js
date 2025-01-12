function loadHTML(baseUrl, htmlRelativeUrl) {
    const htmlUrl = new URL(htmlRelativeUrl, baseUrl).href;
    return fetch(htmlUrl)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to load HTML: ${response.statusText}`);
            }
            return response.text();
        })
        .catch((error) => {
            console.error("Error in loadHTML:", error);
            return "";
        });
}

function getBaseURL() {
    return new URL('.', import.meta.url).href;
}

export class MyAudioPlayer extends HTMLElement {
    constructor() {
        super();
        this.shadowroot = this.attachShadow({ mode: 'open' });
        this.src = this.getAttribute('src');
        this.audioContext = new AudioContext();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.audioNodes = [];
        this.baseURL = getBaseURL();
    }

    getAudioElement() {
        return this.shadowroot.querySelector("#player");
    }

    getAudioContext() {
        return this.audioContext;
    }

    getanalyser() {
        return this.analyser;
    }

    addAudioNode(audioNode, name) {
        if (!audioNode) {
            console.error("Invalid audio node.");
            return;
        }

        audioNode.name = name;
        const length = this.audioNodes.length;
        if (length > 0) {
            const previousNode = this.audioNodes[length - 1];
            previousNode.disconnect();
            previousNode.connect(audioNode);
        }
        audioNode.connect(this.audioContext.destination);
        this.audioNodes.push(audioNode);
        console.log(`Linked ${audioNode.name || 'input'} to destination.`);
    }

    async connectedCallback() {
        try {
            const STYLE = `<link rel="stylesheet" href="${this.baseURL + 'style.css'}">`;
            const HTML = await loadHTML(this.baseURL, `index.html`);
            this.shadowroot.innerHTML = `${STYLE}${HTML}`;
        } catch (error) {
            console.error("Error loading HTML or CSS:", error);
            return;
        }

        const player = this.shadowroot.querySelector('#player');
        if (!player) {
            console.error("Player element not found in Shadow DOM.");
            return;
        }

        this.defineListeners();
        this.buildAudioGraph();

        document.addEventListener('click', () => this.audioContext.resume());

        setTimeout(() => {
            this.dispatchEvent(new CustomEvent("analyserReady", {
                detail: { analyser: this.analyser },
                bubbles: true,
                composed: true
            }));
            console.log("analyserReady event dispatched with analyser:", this.analyser);
        }, 500);
    }

    static get observedAttributes() {
        return ['src'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'src' && newValue !== oldValue) {
            const player = this.shadowroot.querySelector('#player');
            if (player) {
                player.src = newValue;
                player.load();
                console.log("src changed to", newValue);
            } else {
                console.warn("Player element not found in Shadow DOM");
            }
        }
    }

    buildAudioGraph() {
        const player = this.shadowroot.querySelector('#player');
        if (!player) {
            console.error("Player element not found in Shadow DOM.");
            return;
        }

        try {
            const source = this.audioContext.createMediaElementSource(player);
            this.stereoPanner = this.audioContext.createStereoPanner();
            source.connect(this.stereoPanner);

            this.analyser = this.audioContext.createAnalyser();
            this.stereoPanner.connect(this.analyser);

            this.analyser.connect(this.audioContext.destination);

            this.audioNodes = [source, this.stereoPanner, this.analyser];

            console.log("Audio graph successfully built:", this.audioNodes);
        } catch (error) {
            console.error("Error in building audio graph:", error);
        }
    }

    defineListeners() {
        const player = this.shadowroot.querySelector('#player');
        if (!player) {
            console.error("Player element not found in Shadow DOM.");
            return;
        }

        const controls = {
            playPauseButton: this.shadowroot.querySelector('#play-pause'),
            rewindButton: this.shadowroot.querySelector('#rewind'),
            fastForwardButton: this.shadowroot.querySelector('#fast-forward'),
            volumeSlider: this.shadowroot.querySelector('#volume'),
            stereoSlider: this.shadowroot.querySelector('#stereo'),
            speedSelector: this.shadowroot.querySelector('#speed'),
            progressBar: this.shadowroot.querySelector('#progress'),
        };

        for (const [key, control] of Object.entries(controls)) {
            if (!control) console.warn(`${key} not found in Shadow DOM.`);
        }

        // Play/Pause Button
        controls.playPauseButton?.addEventListener('click', () => {
            if (player.paused || player.ended) {
                player.play();
                controls.playPauseButton.textContent = '⏹️'; // Switch to Stop icon
            } else {
                player.pause();
                controls.playPauseButton.textContent = '▶️'; // Switch to Play icon
            }
        });

        // Rewind Button
        controls.rewindButton?.addEventListener('click', () => {
            player.currentTime -= 10;
        });

        // Fast-Forward Button
        controls.fastForwardButton?.addEventListener('click', () => {
            player.currentTime += 10;
        });

        // Volume Slider
        controls.volumeSlider?.addEventListener('change', () => {
            player.volume = controls.volumeSlider.value;
        });

        // Stereo Slider
        controls.stereoSlider?.addEventListener('change', () => {
            this.stereoPanner.pan.value = controls.stereoSlider.value;
        });

        // Speed Selector
        controls.speedSelector?.addEventListener('change', (event) => {
            player.playbackRate = parseFloat(event.target.value);
        });

        // Progress Bar
        controls.progressBar?.addEventListener('click', (event) => {
            const position = event.offsetX / controls.progressBar.offsetWidth;
            player.currentTime = position * player.duration;
        });

        // Update Progress Bar and Button State
        player.addEventListener('timeupdate', () => {
            if (!isNaN(player.duration)) {
                controls.progressBar.value = (player.currentTime / player.duration) * 100;
                this.shadowroot.querySelector('#current-time').textContent = this.formatTime(player.currentTime);
                this.shadowroot.querySelector('#duration').textContent = this.formatTime(player.duration);
            }

            // Update the button state dynamically
            if (player.paused) {
                controls.playPauseButton.textContent = '▶️'; // Switch to Play icon
            } else {
                controls.playPauseButton.textContent = '⏹️'; // Switch to Stop icon
            }
        });

        player.addEventListener('ended', () => {
            // Reset the button to Play when the track ends
            controls.playPauseButton.textContent = '▶️';
        });
    }

    animateBackground() {
        const updateBackground = () => {
            if (!this.analyser || !this.dataArray) {
                console.error("Analyser or dataArray not initialized.");
                return;
            }

            this.analyser.getByteFrequencyData(this.dataArray);

            const average = this.dataArray.reduce((sum, value) => sum + value, 0) / this.dataArray.length;
            const hue = (average / 256) * 360;
            const lightness = 50 + (average / 512) * 50;

            this.shadowroot.host.style.backgroundColor = `hsl(${hue}, 100%, ${lightness}%)`;

            requestAnimationFrame(updateBackground);
        };

        updateBackground();
    }

    formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    }
}

// Define the custom element <my-audio-player>
customElements.define('my-audio-player', MyAudioPlayer);
