# Audio Player

Ce projet a été réalisé par **Hajar BAKAROU** et **Ayoub Hofr**. Il s'agit d'une interface interactive, immersive et modulaire développée avec des **Web Components**. Le projet combine un lecteur audio avancé, une playlist dynamique, un égaliseur en temps réel, des visualisations audio (1D et 3D), et une animation 3D d'un avatar dansant synchronisé avec la musique grâce à **Babylon.js**.

Ce projet met en avant des concepts avancés, notamment l'utilisation de la **Web Audio API** pour analyser et manipuler le son, ainsi que des bibliothèques 3D modernes comme **Three.js** et **Babylon.js** pour des visualisations dynamiques.

---

## 🌟 Fonctionnalités principales

### Lecteur audio
- Contrôles intuitifs : lecture, pause, arrêt, contrôle du volume, et réglage de la vitesse de lecture.
- Fonctionnement basé sur un **Web Component** (`<my-audio-player>`), réutilisable dans n'importe quel projet.
- Intégration avec les visualiseurs et l'égaliseur audio via la **Web Audio API**.

### Playlist 
- Gestion interactive d'une liste de pistes.
- Synchronisation directe avec le lecteur audio pour lire une piste sélectionnée.
- Interface graphique conviviale.

### Égaliseur audio
- Contrôle précis des fréquences sonores (60 Hz, 170 Hz, 350 Hz, 1 kHz, 3.5 kHz, 10 kHz).
- Basé sur des **BiquadFilterNodes** de la Web Audio API.
- Visualisation en temps réel des ajustements effectués.

### Visualisation audio 1D
- Affichage linéaire des fréquences audio en temps réel.
- Utilise les données du **AnalyserNode** pour générer une représentation graphique dynamique.

### Visualisation audio 3D
- Une sphère interactive créée avec **Three.js**, réagissant aux fréquences audio.
- Les sommets de la sphère sont animés dynamiquement pour refléter les amplitudes des fréquences.

### Avatar dansant
- Animation 3D synchronisée avec la musique grâce à **Babylon.js**.
- Représente une fille qui danse en fonction des variations audio.

---

## 🎧 Pipeline audio

Le flux audio est traité grâce à la **Web Audio API**, qui permet d'analyser et de manipuler le son en temps réel. Voici le pipeline utilisé :

1. **Création du contexte audio** : 
   Chaque instance de lecteur audio initialise un `AudioContext`.

2. **Nœuds audio utilisés** :
   - **MediaElementAudioSourceNode** : Connecte l'élément `<audio>` au pipeline.
   - **AnalyserNode** : Analyse les fréquences audio en temps réel pour produire des données utilisées dans les visualisations.
   - **BiquadFilterNode** : Implémente l'égaliseur pour ajuster les fréquences.
   - **GainNode** : Contrôle le volume global.

3. **Flux complet** :
<audio> → MediaElementAudioSourceNode → AnalyserNode → BiquadFilterNode → GainNode → AudioContext.destination

## 🌐 Technologies utilisées

| **Technologie**        | **Rôle**                                                                                |
|-------------------------|-----------------------------------------------------------------------------------------|
| **HTML5/CSS3/JavaScript** | Base du projet pour la structure, le style, et les fonctionnalités.                  |
| **Web Components**      | Modularité et encapsulation des composants (`my-audio-player`, `audio-visualizer`, etc.). |
| **Web Audio API**       | Analyse et manipulation du son en temps réel.                                          |
| **Three.js**            | Génération de la visualisation 3D (sphère interactive).                                |
| **Babylon.js**          | Animation de l'avatar dansant.                                                         |
| **GitHub Pages**        | Hébergement des Web Components et du projet.                                           |

---

## 📂 Structure du projet

```plaintext
audio-player/
│
├── index.html           # Fichier principal (interface utilisateur)
├── style.css            # Styles globaux
├── components/          # Dossier contenant les Web Components
│   ├── lecteuraudio/    # Composant : Lecteur audio
│   ├── playlist/        # Composant : Playlist dynamique
│   ├── equalizer/       # Composant : Égaliseur audio
│   ├── audio-visualizer/ # Visualisation 1D des fréquences audio
│   ├── audio-visualizer-3d/ # Visualisation 3D des fréquences audio
│   └── 3d-visualisation/ # Avatar dansant (Babylon.js)
│
├── assets/              # Images et autres ressources
└── README.md            # Documentation
```

---

## 🛠️ Installation
Localement
Clonez le dépôt :
git clone https://github.com/bakarouhajar/audio-player.git
Accédez au dossier du projet :
cd audio-player

Lancez un serveur local :
python -m http.server 8000

Live Server (VS Code).
Accédez à votre navigateur : http://localhost:8000

En ligne
Le projet est déployé sur GitHub Pages :
👉 https://bakarouhajar.github.io/audio-player/
