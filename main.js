import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
let mode = 'move';
const renderer = new THREE.WebGLRenderer({
  antialias: true
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const fov = 75;
const aspect = window.innerWidth / window.innerHeight;
const near = 0.1; // adjusted near plane
const far = 1000; // adjusted far plane
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0, 0, 10); // adjusted camera position

const controls = new OrbitControls(camera, renderer.domElement);

const scene = new THREE.Scene();

const loader = new STLLoader();
let isMouseDown = false;
let mouseDownPosition = new THREE.Vector2();
let currentMousePosition = new THREE.Vector2();

let selectionRectangleDiv = document.createElement('div');
selectionRectangleDiv.id = 'selectionRectangle';
document.body.appendChild(selectionRectangleDiv);

loader.load('./capsule.stl', function(geometry) {
    geometry.center();
    const boundingBox = new THREE.Box3().setFromObject(new THREE.Mesh(geometry));
    const boundingBoxSize = boundingBox.getSize(new THREE.Vector3());
    const maxAxisLength = Math.max(boundingBoxSize.x, boundingBoxSize.y, boundingBoxSize.z);
    const scale = 5 / maxAxisLength; // adjust this as needed
    geometry.scale(scale, scale, scale);
    const positionAttribute = geometry.getAttribute('position');
    const colors = [];

    for (let i = 0; i < positionAttribute.count; i++) {
  
      colors.push(1, 1, 1); // add for each vertex color data
  
    }
    const colorAttribute = new THREE.Float32BufferAttribute(colors, 3);
    geometry.setAttribute('color', colorAttribute);
    const material = new THREE.MeshStandardMaterial({
        vertexColors: true
      });
    const stlMesh = new THREE.Mesh(geometry, material);
    scene.add(stlMesh);
  });
  
scene.add(new THREE.AmbientLight("white", 1));

const light = new THREE.DirectionalLight("yellow", 1);
light.position.set(0.7, 0.7, 0.7);
scene.add(light);

//THIS IS THE SINGLE TRIANGLE SELECTION IMPLEMENTATION
// function onClick(event) {
//     if(mode =='select'){
//   event.preventDefault();

//   mouse.x = (event.clientX / renderer.domElement.offsetWidth) * 2 - 1;
//   mouse.y = -(event.clientY / renderer.domElement.offsetHeight) * 2 + 1;

//   caster.setFromCamera(mouse, camera);

//   const intersects = caster.intersectObjects(scene.children);

//   if (intersects.length > 0) {

//     const intersection = intersects[0];
//     const colorAttribute = intersection.object.geometry.attributes.color
//     const face = intersection.face;

//     const color = new THREE.Color(Math.random() * 0xff0000);
//     colorAttribute.setXYZ(face.a, color.r, color.g, color.b);
//     colorAttribute.setXYZ(face.b, color.r, color.g, color.b);
//     colorAttribute.setXYZ(face.c, color.r, color.g, color.b);

//     colorAttribute.needsUpdate = true;

//   }
//     }
// }

function render() {
    controls.update(); // this line needed for OrbitControls to work
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }


function drawSelectionRectangle(startPosition, endPosition) {
    // Convert back to CSS coordinates
    const minPosX = (Math.min(startPosition.x, endPosition.x) + 1) / 2 * window.innerWidth;
    const maxPosX = (Math.max(startPosition.x, endPosition.x) + 1) / 2 * window.innerWidth;
    const minPosY = (1 - Math.max(startPosition.y, endPosition.y)) / 2 * window.innerHeight;
    const maxPosY = (1 - Math.min(startPosition.y, endPosition.y)) / 2 * window.innerHeight;
  
    selectionRectangleDiv.style.left = `${minPosX}px`;
    selectionRectangleDiv.style.top = `${minPosY}px`;
    selectionRectangleDiv.style.width = `${maxPosX - minPosX}px`;
    selectionRectangleDiv.style.height = `${maxPosY - minPosY}px`;
  }
  function getRandomDarkColor() {
    const min = 0;
    const max = 128; // Limit to darker half of the RGB spectrum

    // Generate random red, green, and blue values
    const red = Math.floor(Math.random() * (max - min + 1)) + min;
    const green = Math.floor(Math.random() * (max - min + 1)) + min;
    const blue = Math.floor(Math.random() * (max - min + 1)) + min;

    return new THREE.Color(`rgb(${red}, ${green}, ${blue})`);
}
  function selectTrianglesWithinRectangle(startPosition, endPosition) {
    const minPosX = Math.min(startPosition.x, endPosition.x);
    const maxPosX = Math.max(startPosition.x, endPosition.x);
    const minPosY = Math.min(startPosition.y, endPosition.y);
    const maxPosY = Math.max(startPosition.y, endPosition.y);
  
  
    scene.traverse(function (object) {
      if (object instanceof THREE.Mesh) {
        const geometry = object.geometry;
        const colorAttribute = geometry.attributes.color;
        const positionAttribute = geometry.attributes.position;
  
        for (let i = 0; i < positionAttribute.count; i += 3) {
          const vertices = [
            new THREE.Vector3().fromBufferAttribute(positionAttribute, i),
            new THREE.Vector3().fromBufferAttribute(positionAttribute, i + 1),
            new THREE.Vector3().fromBufferAttribute(positionAttribute, i + 2),
          ];
  
          const allVerticesInside = vertices.every(v => {
            v.project(camera);
            return v.x >= minPosX && v.x <= maxPosX && v.y >= minPosY && v.y <= maxPosY;
          });
  
          if (allVerticesInside) {
            const color = getRandomDarkColor();
            colorAttribute.setXYZ(i, color.r, color.g, color.b);
            colorAttribute.setXYZ(i + 1, color.r, color.g, color.b);
            colorAttribute.setXYZ(i + 2, color.r, color.g, color.b);
        }
    }
        colorAttribute.needsUpdate = true;
      }
    });
  
    // Hide the selection rectangle
    selectionRectangleDiv.style.width = '0px';
    selectionRectangleDiv.style.height = '0px';
  }
  
  

  function onMouseDown(event) {
    if (mode === 'select' && event.button === 0) { // Right mouse button
      isMouseDown = true;
      mouseDownPosition.x = (event.clientX / renderer.domElement.offsetWidth) * 2 - 1;
      mouseDownPosition.y = -(event.clientY / renderer.domElement.offsetHeight) * 2 + 1;
    }
  }
  
  function onMouseMove(event) {
    if (mode === 'select' && isMouseDown) {
      currentMousePosition.x = (event.clientX / renderer.domElement.offsetWidth) * 2 - 1;
      currentMousePosition.y = -(event.clientY / renderer.domElement.offsetHeight) * 2 + 1;
      drawSelectionRectangle(mouseDownPosition, currentMousePosition);
    }
  }
  
  function onMouseUp(event) {
    if (mode === 'select' && isMouseDown) {
      isMouseDown = false;
      selectTrianglesWithinRectangle(mouseDownPosition, currentMousePosition);
    }
  }

  function onKeyDown(event) {
    // Get the checkbox and the text
    var modeSwitchCheckbox = document.getElementById('modeSwitch');
    var modeText = document.querySelector('.mode-text');
  
    if (event.key === 't' || event.key === 'T') {
      if (mode === 'move') {
        mode = 'select';
        controls.enabled = false;
        // Change the checkbox state and the text

        modeText.textContent = 'Press T to toggle - Selection On';
      } else {
        mode = 'move';
        controls.enabled = true;
        // Change the checkbox state and the text
        modeText.textContent = 'Press T to toggle - Rotation On';
        // Also reset selection rectangle
        selectionRectangleDiv.style.width = '0px';
        selectionRectangleDiv.style.height = '0px';
      }
    }

    if (event.key === 'c' || event.key === 'C') {
      
      scene.traverse(function (object) {
        if (object instanceof THREE.Mesh) {
          const geometry = object.geometry;
          const positionAttribute = geometry.attributes.position;
          const colors = [];
      
          for (let i = 0; i < positionAttribute.count; i++) {
        
            colors.push(1, 1, 1); // add for each vertex color data
        
          }
          const colorAttribute = new THREE.Float32BufferAttribute(colors, 3);
 
          geometry.setAttribute('color', colorAttribute);
          colorAttribute.needsUpdate = true;}})}}
  window.addEventListener('keydown', onKeyDown, false);
  window.addEventListener('mousedown', onMouseDown, false);
  window.addEventListener('mousemove', onMouseMove, false);
  window.addEventListener('mouseup', onMouseUp, false);
//   window.addEventListener("click", onClick, false);
window.addEventListener('resize', function() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});
  render();