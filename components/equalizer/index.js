import './libs/webaudio-controls.js';

const getBaseUrl = () => {
    return new URL('.', import.meta.url).href;
};

const template = document.createElement("template");
template.innerHTML = /*html*/ `
    <style>
    :host {
        display: flex;
        justify-content: center; /* Center the equalizer horizontally */
        align-items: center; /* Center the equalizer vertically */
        gap: 20px;
        width: 100%;
        padding: 10px;
        background: linear-gradient(135deg, #121212, #1e1e1e);
        border-radius: 12px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    }

    .equalizer {
        display: grid;
        grid-template-columns: repeat(6, 1fr); /* Three sliders per row */
        grid-template-rows: repeat(1, auto); /* Two rows for sliders */
        gap: 1rem; /* Space between sliders */
        width: 100%; /* Full width for the equalizer */
        justify-items: center; /* Center sliders horizontally */
        align-items: center; /* Center sliders vertically */
    }

    .slider-container {
        display: flex;
        flex-direction: column; /* Stack the slider and its label */
        align-items: center;
        gap: 0.5rem;
    }

    webaudio-slider {
        width: 24px; /* Slider width */
        height: 120px; /* Adjusted slider height for compact layout */
    }

    p {
        margin: 0.5;
        font-size: 0.8rem;
        color: #1db954; /* Harmonize with design */
        text-align: center;
    }
</style>

    <div class="equalizer">
        <div class="slider-container">
            <webaudio-slider id="freq_60" src="${getBaseUrl()}assets/img/vsliderbody.png"
                knobsrc="${getBaseUrl()}/assets/img/vsliderknob.png" value="1" min="-30" max="30" step="0.1">
            </webaudio-slider>
            <p id="label_0">60 Hz</p>
        </div>
        <div class="slider-container">
            <webaudio-slider id="freq_170" src="${getBaseUrl()}assets/img/vsliderbody.png"
                knobsrc="${getBaseUrl()}/assets/img/vsliderknob.png" value="1" min="-30" max="30" step="0.1">
            </webaudio-slider>
            <p id="label_1">170 Hz</p>
        </div>
        <div class="slider-container">
            <webaudio-slider id="freq_350" src="${getBaseUrl()}assets/img/vsliderbody.png"
                knobsrc="${getBaseUrl()}/assets/img/vsliderknob.png" value="1" min="-30" max="30" step="0.1">
            </webaudio-slider>
            <p id="label_2">350 Hz</p>
        </div>
        <div class="slider-container">
            <webaudio-slider id="freq_1000" src="${getBaseUrl()}assets/img/vsliderbody.png"
                knobsrc="${getBaseUrl()}/assets/img/vsliderknob.png" value="1" min="-30" max="30" step="0.1">
            </webaudio-slider>
            <p id="label_3">1 kHz</p>
        </div>
        <div class="slider-container">
            <webaudio-slider id="freq_3500" src="${getBaseUrl()}assets/img/vsliderbody.png"
                knobsrc="${getBaseUrl()}/assets/img/vsliderknob.png" value="1" min="-30" max="30" step="0.1">
            </webaudio-slider>
            <p id="label_4">3.5 kHz</p>
        </div>
        <div class="slider-container">
            <webaudio-slider id="freq_10000" src="${getBaseUrl()}assets/img/vsliderbody.png"
                knobsrc="${getBaseUrl()}/assets/img/vsliderknob.png" value="1" min="-30" max="30" step="0.1">
            </webaudio-slider>
            <p id="label_5">10 kHz</p>
        </div>
    </div>
`;


class Equalizer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.createIds();
        this.filters = [];
        this.audioPlayer = null;
    }

    connectedCallback() {
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.getElements();
        this.audioContext = this.getAudioContext();

        document.addEventListener('analyserReady', (event) => {
            this.audioPlayer = event.target; // Référence à `my-audio-player`
            this.audioContext = this.audioPlayer.getAudioContext();
            if (this.audioPlayer) {
                console.log("Audio player connected:", this.audioPlayer);
            } else {
                console.error("Audio player not found in the DOM.");
            }
        });

        this.init();
        this.setListeners();
    }

    init() {
        const interval = setInterval(() => {
            if (this.audioContext && this.audioPlayer && typeof this.audioPlayer.addAudioNode === 'function') {
                [60, 170, 350, 1000, 3500, 10000].forEach((freq, i) => {
                    const eq = this.audioContext.createBiquadFilter();
                    eq.frequency.value = freq;
                    eq.type = "peaking";
                    eq.gain.value = 0;
                    this.filters.push(eq);
                });

                this.filters.forEach((filter) => {
                    this.audioPlayer.addAudioNode(filter);
                });

                console.log("Filters added to audio graph:", this.filters);
                clearInterval(interval);
            } else if (!this.audioPlayer) {
                console.error("Audio player is not available yet.");
            }
        }, 500);
    }

    getAudioContext() {
        const audioPlayer = document.querySelector('my-audio-player');
        if (!audioPlayer) {
            console.error("my-audio-player not found in the DOM");
            return null;
        }
        const context = audioPlayer.getAudioContext();
        if (!context) {
            console.error("AudioContext not available from my-audio-player");
        }
        console.log("AudioContext retrieved from my-audio-player:", context);
        return context;
    }

    changeGain(nbFilter, sliderVal) {
        if (this.filters[nbFilter]) {
            this.filters[nbFilter].gain.value = parseFloat(sliderVal);

            const output = this.shadowRoot.getElementById(`label_${nbFilter}`);
            if (output) {
                output.innerHTML = `${parseFloat(sliderVal).toFixed(2)} dB`;
            }
        }
    }

    createIds() {
        this.ids = {
            FREQ_60: 'freq_60',
            FREQ_170: 'freq_170',
            FREQ_350: 'freq_350',
            FREQ_1000: 'freq_1000',
            FREQ_3500: 'freq_3500',
            FREQ_10000: 'freq_10000',
        };
    }

    getElements() {
        this.freq_60 = this.shadowRoot.getElementById(this.ids.FREQ_60);
        this.freq_170 = this.shadowRoot.getElementById(this.ids.FREQ_170);
        this.freq_350 = this.shadowRoot.getElementById(this.ids.FREQ_350);
        this.freq_1000 = this.shadowRoot.getElementById(this.ids.FREQ_1000);
        this.freq_3500 = this.shadowRoot.getElementById(this.ids.FREQ_3500);
        this.freq_10000 = this.shadowRoot.getElementById(this.ids.FREQ_10000);
    }

    setListeners() {
        if (this.freq_60) {
            this.freq_60.addEventListener('input', (e) => this.changeGain(0, e.target.value));
        }
        if (this.freq_170) {
            this.freq_170.addEventListener('input', (e) => this.changeGain(1, e.target.value));
        }
        if (this.freq_350) {
            this.freq_350.addEventListener('input', (e) => this.changeGain(2, e.target.value));
        }
        if (this.freq_1000) {
            this.freq_1000.addEventListener('input', (e) => this.changeGain(3, e.target.value));
        }
        if (this.freq_3500) {
            this.freq_3500.addEventListener('input', (e) => this.changeGain(4, e.target.value));
        }
        if (this.freq_10000) {
            this.freq_10000.addEventListener('input', (e) => this.changeGain(5, e.target.value));
        }
    }
}

customElements.define("my-equalizer", Equalizer);
