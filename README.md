# Three.js STL Model Selector

## Overview

This project is a Three.js-based application that allows you to load an STL model and interact with it in two modes: **move** and **select**. In "move" mode, you can rotate and zoom the model. In "select" mode, you can select portions of the STL model by drawing a selection rectangle.

## Features

- Load and display an STL model
- Real-time model rotation and zooming
- Vertex color changing based on selection
- Keyboard shortcuts for mode toggling and selection clearing

## Technologies Used

- Three.js for WebGL rendering
- JavaScript for client-side logic
- HTML & CSS for basic layout
- Vite for build tooling and development

## Prerequisites

You'll need Node.js and npm installed on your computer to run this project.

## Setup

1. Clone this repository: 
git clone https://github.com/talharehmanabid1999/mesh_triangles.git

3. Navigate into the project directory:
cd your-project-name

4. Install Three.js:
npm install --save three

5. Install Vite:
npm install --save-dev vite

6. Start the development server:
npx vite

6. Open `http://localhost:3000` in a web browser.

## How to Use

- **Move Mode**: Rotate and zoom the model by dragging the mouse.
- **Select Mode**: Draw a selection rectangle to select specific areas of the model.
- **Toggle Modes**: Press 'T' to toggle between "move" and "select" modes.
- **Clear Selection**: Press 'C' to clear the current selection.

## Code Snippets

```javascript
// To initialize a scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
const renderer = new THREE.WebGLRenderer({ antialias: true });

// To load the STL model
const loader = new STLLoader();
loader.load('./capsule.stl', function (geometry) {
// ... (geometry manipulation and addition to scene)
});

// For mode toggling
function onKeyDown(event) {
if (event.key === 't' || event.key === 'T') {
 // ... (toggle logic)
}
}
```
#License
This project is licensed under the MIT License.

Hope this covers everything! Let me know if you want to tweak anything.






