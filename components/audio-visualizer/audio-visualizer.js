class AudioVisualizer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.canvas = document.createElement("canvas");
        this.shadowRoot.appendChild(this.canvas);
    }

    connectedCallback() {
        const audioPlayer = document.querySelector("my-audio-player");

        if (!audioPlayer) {
            console.error("my-audio-player component not found.");
            return;
        }

        // Wait for the analyserReady event
        audioPlayer.addEventListener("analyserReady", (event) => {
            this.audioContext = audioPlayer.getAudioContext();
            this.analyser = event.detail.analyser;

            if (!this.audioContext || !this.analyser) {
                console.error("AudioContext or AnalyserNode not found.");
                return;
            }

            this.bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(this.bufferLength);

            this.canvasContext = this.canvas.getContext("2d");
            this.resizeCanvas();
            window.addEventListener("resize", () => this.resizeCanvas());

            this.draw();
        });
    }

    resizeCanvas() {
        const rect = this.getBoundingClientRect();
        this.canvas.width = rect.width || 300;
        this.canvas.height = rect.height || 150;
    }

    draw() {
        requestAnimationFrame(() => this.draw());

        this.analyser.getByteFrequencyData(this.dataArray);
        const ctx = this.canvasContext;
        const width = this.canvas.width;
        const height = this.canvas.height;

        ctx.clearRect(0, 0, width, height);

        const barWidth = (width / this.bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < this.bufferLength; i++) {
            const barHeight = this.dataArray[i];
            const r = barHeight + 25;
            const g = 50;
            const b = 150;

            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(x, height - barHeight / 2, barWidth, barHeight / 2);
            x += barWidth + 1;
        }
    }
}

customElements.define("audio-visualizer", AudioVisualizer);
