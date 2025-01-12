function loadHTML(baseUrl, htmlRelativeUrl) {
    const htmlUrl = new URL(htmlRelativeUrl, baseUrl).href;
    return fetch(htmlUrl).then((response) => response.text());
}

function getBaseURL() {
    return new URL('.', import.meta.url).href;
}

export class PlayList extends HTMLElement {
    constructor() {
        super();
        this.shadowroot = this.attachShadow({ mode: 'open' });
        this.playlist = [];
        this.baseURL = getBaseURL();
        this.currentPlaying = null;

        // Connexion au lecteur audio via l'événement 'analyserReady'
        document.addEventListener('analyserReady', (event) => {
            this.audioPlayer = event.target;
            if (!this.audioPlayer) {
                console.error("Audio player not found in the DOM.");
            } else {
                console.log("Audio player connected:", this.audioPlayer);
            }
        });
        
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

        await this.loadPlaylist();
        this.render();
    }

    async loadPlaylist() {
        try {
            const response = await fetch(this.baseURL + 'playlist.json');
            if (!response.ok) {
                throw new Error(`Failed to load playlist: ${response.status}`);
            }
            this.playlist = await response.json();
            console.log("Playlist loaded:", this.playlist);
        } catch (error) {
            console.error("Error loading playlist:", error);
            this.playlist = []; // Définit une playlist vide en cas d'erreur
        }
    }

    render() {
        const container = this.shadowroot.querySelector('.playlist-container');
        if (!container) {
            console.error("Playlist container not found in Shadow DOM.");
            return;
        }

        if (!this.playlist.length) {
            container.innerHTML = `
                <p style="text-align: center; color: #b3b3b3;">Aucune piste disponible</p>
            `;
            return;
        }

        container.innerHTML = `
            <h2>My Playlist</h2>
            <ul>
                ${this.playlist.map((track, index) => `
                    <li>
                        <button id="id-${index}" class="play-track ${this.currentPlaying === index ? 'active' : ''}" data-index="${index}">
                            ${track.title}
                        </button>
                    </li>
                `).join('')}
            </ul>
        `;
        this.defineListeners();
    }

    defineListeners() {
        const buttons = this.shadowroot.querySelectorAll('.play-track');
        if (!buttons.length) {
            console.error("No play-track buttons found.");
            return;
        }

        buttons.forEach(button => {
            button.addEventListener('click', (event) => {
                const trackIndex = event.currentTarget.dataset.index;
                console.log("Track clicked:", trackIndex);
                this.playTrack(trackIndex);
            });
        });
    }

    playTrack(index) {
        const track = this.playlist[index];
        if (track && this.audioPlayer) {
            this.audioPlayer.setAttribute('src', this.baseURL + track.src);

            const player = this.audioPlayer.shadowroot.querySelector('#player');
            if (player) {
                player.play();
                this.audioPlayer.syncButtonState();
            } else {
                console.error("Player element not found in Shadow DOM.");
            }

            this.shadowroot.querySelectorAll('.play-track').forEach(button => button.classList.remove('active'));
            this.shadowroot.querySelector(`#id-${index}`).classList.add('active');
            this.currentPlaying = index;
        } else {
            console.error("Audio player not found or track is invalid.");
        }
    }
}

customElements.define('play-list', PlayList);
