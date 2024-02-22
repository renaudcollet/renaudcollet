import * as THREE from 'three';

export default {
  lenis: false,
  envMapIntensity: 1.0,
  controls: {
    enableDamping: true,
    dampingFactor: 0.03, //0.05,
    minDistance: 8 / 10,
    maxDistance: 12 / 10,
    panSpeed: 2.5,
    perimeter: 2,
    limitL: -3.0,
    limitR: 3.0,
    limitT: 3.0,
    limitB: -3.0,
  },
  progress: 0,
  camera: {
    fov: 45,
    near: 0.1,
    far: 500,
    start: { x: 0, y: 16, z: 35, lookAt: new THREE.Vector3(0, 2, 35) },
    rise: { x: 0, y: 70, z: 35, lookAt: new THREE.Vector3(0, 2, 35) },
    end: { x: -5, y: 15, z: 50, position: new THREE.Vector3(-5, 15, 50), lookAt: new THREE.Vector3(0, 6, 0) },
  },
  camera2: {
    fov: 45,
    near: 0.1,
    far: 500,
    start: { x: 10, y: 24, z: 35, },
    lookAt: new THREE.Vector3(25, 0, 0),
  },
  showPostProcessing: true,
  shader: {
    simpleSweep: false
  },
  fog: {
    enable: true,
    enableFog2: false,
    fogExp2: 0.8,
    // fogColor: 0xfdf0bc, // creme
    // fogColor: 0xb1432f, // reddish warm
    // fogColor: 0xc37e1d, // golden warm
    fogColor: 0x11444b, // blueish
    fogNear: 48,
    fogFar: 140,
  },
  light: {
    helpers: true,
    ambient: {
      color: 0xffffff,
      intensity: 2
    },
    directional: {
      color: 0xffffff,
      intensity: 2,
      position: {
        x: 6,
        y: 59,
        z: 48,
      },
      target: {
        x: -4,
        y: 0,
        z: 0,
      },
      shadow: {
        visible: true,
        width: 512,
        height: 512,
        near: 0.1,
        far: 140,
        top: 34,
        right: 66,
        bottom: -36,
        left: -47,
        bias: -0.0002, //-0.0015, //-0.005, // Usually is 0.0002,
        blurSamples: 11, //25,
      },
    },
    point: {
      x: 0,
      y: 0.16, //0.05,
      z: 0,
      color: 0xffffff,
      intensity: 1,
      distance: 0.25,
      decay: 0.9,
    }
  },
}