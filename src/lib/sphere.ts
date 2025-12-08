import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function createSphereScene(canvas: HTMLElement) {
  // inner solid sphere
  const innerRadius = 0.6

  // outer wireframe
  const radius = 1;
  const widthSegments = 16;
  const heightSegments = 12;

  // scene
  const scene = new THREE.Scene();

  // camera
  const aspectRatio = canvas.clientWidth / canvas.clientHeight;
  const camera = new THREE.PerspectiveCamera(45, aspectRatio, 0.1, 6);
  camera.position.z = 3;

  // renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.setPixelRatio(window.devicePixelRatio);

  // lights
  const hemi = new THREE.HemisphereLight(0xffffff, 0x888888, 0.6);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xffffff, 0.7);
  dir.position.set(5, 10, 7);
  scene.add(dir);

  const innerSphereGeometry = new THREE.SphereGeometry(innerRadius, 32, 16);
  const innerMaterial = new THREE.MeshStandardMaterial({
    color: 0xbef264,
    roughness: 0.5,
    // metalness: 0.2,
  });
  const innerSphere = new THREE.Mesh(innerSphereGeometry, innerMaterial);
  scene.add(innerSphere);

  const sphereGeometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
  const wireMaterial = new THREE.MeshBasicMaterial({
    color: 0x495565,
    wireframe: true,
  });
  const sphereWireframe = new THREE.Mesh(sphereGeometry, wireMaterial);
  scene.add(sphereWireframe);

  // handle resizing
  window.addEventListener('resize', () => {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  });

  // animation
  function animate() {
    requestAnimationFrame(animate);
    sphereWireframe.rotation.y += 0.002;
    renderer.render(scene, camera);
  }
  animate();
}
