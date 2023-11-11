<template>
    <div class="scene-container">
        <canvas id="three-canvas"></canvas>
    </div>
</template>

<script setup>
import GUI from 'lil-gui';

import * as THREE from 'three'
import { REVISION } from 'three'

import gsap from 'gsap';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

import sweepFrag from '~/shaders/sweep.frag'
import coverFrag from '~/shaders/cover.frag'
import coverVert from '~/shaders/cover.vert'

import modelNature from '~/assets/3d/nature-scene.glb'
import lethargy from 'lethargy'
import VirtualScroll from 'virtual-scroll'

import bg1 from '~/assets/textures/matcap_2.png'
import bg2 from '~/assets/textures/matcap_3.png'

let bDebugGUI = false
let gui

const config = {
  cameraLookAt: new THREE.Vector3(0, 0, 0),
  progress: 0,
  camera: {
    fov: 45,
    near: 0.1,
    far: 1000,
    x: 0,
    y: 3,
    z: 35
  },
  camera2: {
    fov: 45,
    near: 0.1,
    far: 1000,
    x: 10,
    y: 37,
    z: 35
  },
  showPostProcessing: true,
  shader: {
    progress: 0,
    simpleSweep: true
  }
}

let canvas
let width
let height
let scene, postScene
let renderer
let camera, camera2, postCamera
let pixelRatio
let renderTarget1, renderTarget2
let dracoLoader, gltfLoader
let controls
let scroll
let scroller
let raf

const init = () => {
  bDebugGUI = window.location.hash === '#debug'

  canvas = document.querySelector('#three-canvas')
  width = canvas.offsetWidth;
  height = canvas.offsetHeight;
  scene = new THREE.Scene()
  // scene.fog = new THREE.FogExp2(0xcccccc, 0.002);
  // scene.background = new Color(0xff0000);
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
  camera.position.set(0, 3, 35)
  camera.lookAt(config.cameraLookAt)

  camera2 = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
  camera2.position.set(10, 37, 35)
  camera2.lookAt(config.cameraLookAt)

  // gsap.to(camera.position, {x: 0, y: 5, z: 20, duration: 1.5, delay: 0.5, repeat: -1, yoyo: true})

  // THREE.ColorManagement.enabled = false

  // TODO: Probleme de colorspace avec les textures utilisées dans le ShaderMaterial
  // TODO:  Créer un codepen pour reproduire le problème
  pixelRatio = Math.min(window.devicePixelRatio, 2)
  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true })
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.LinearToneMapping // ACESFilmicToneMapping
  renderer.setSize(width, height)
  renderer.setPixelRatio(pixelRatio)
  renderer.setClearColor(0xeeeeee, 1)

  // Render Targets
  renderTarget1 = new THREE.WebGLRenderTarget(width * pixelRatio, height * pixelRatio, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    colorSpace: THREE.SRGBColorSpace
  })
  renderTarget2 = new THREE.WebGLRenderTarget(width * pixelRatio, height * pixelRatio, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    colorSpace: THREE.SRGBColorSpace
  })

  // Env Map
  // https://github.com/mrdoob/three.js/blob/master/examples/webgl_materials_envmaps.html
  // const loader = new THREE.CubeTextureLoader()
  // loader.setPath( 'assets/textures/' )
  // this.backgroundTexture = loader.load( [ 'px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg' ] )
  // this.backgroundTexture.encoding = sRGBEncoding
  // scene.background = this.backgroundTexture
  // scene.background = new Color(0xffffff)
  // this.environmentTexture = loader.load( [ 'px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg' ] )
  // // this.environmentTexture = loader.load( [ 'nx-fef8e7.jpg', 'nx-fef8e7.jpg', 'nx-fef8e7.jpg', 'nx-fef8e7.jpg', 'nx-fef8e7.jpg', 'nx-fef8e7.jpg' ] )
  // this.environmentTexture.encoding = THREE.SRGBColorSpace
  // scene.environment = this.environmentTexture

  // KTX2 Loader
  // this.ktx2Loader = new KTX2Loader()
  // this.ktx2Loader.setTranscoderPath(window.theme_path + 'js/libs/basis/')
  // this.ktx2Loader.setResourcePath(window.theme_path + 'js/libs/basis/')
  // this.ktx2Loader.detectSupport(renderer)

  // Draco
  const THREE_PATH = `https://unpkg.com/three@0.${REVISION}.x`
  dracoLoader = new DRACOLoader( new THREE.LoadingManager() ).setDecoderPath( `${THREE_PATH}/examples/jsm/libs/draco/gltf/` );
  gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);

  if (bDebugGUI) {
    gui = new GUI().title('Cover 3D').open()
    const guiDebugObject = {}
    guiDebugObject.envMapIntensity = 1
    // gui = gui.addFolder('Cover 3D') // redefine gui to add folder
    gui.add(guiDebugObject, 'envMapIntensity', 0, 10, 0.001).onChange(updateAllMaterials.bind(this))

    gui
      .add(renderer, 'toneMapping', {
        No: THREE.NoToneMapping,
        Linear: THREE.LinearToneMapping,
        Reinhard: THREE.ReinhardToneMapping,
        Cineon: THREE.CineonToneMapping,
        ACESFilmic: THREE.ACESFilmicToneMapping
      })
      .onFinishChange(() => {
        renderer.toneMapping = Number(renderer.toneMapping)
        updateAllMaterials()
      })

    gui.add(renderer, 'toneMappingExposure', 0, 10, 0.001)

    let folder = gui.addFolder('CAMERA')
    folder.add(camera.position, 'x', -100, 100, 0.001)
    folder.add(camera.position, 'y', -100, 100, 0.001)
    folder.add(camera.position, 'z', -100, 100, 0.001)

    folder = gui.addFolder('CAMERA TARGET')
    const onCameraLookAtChange = () => {
      camera.lookAt(config.cameraLookAt)
    }
    folder.add(config.cameraLookAt, "x", -200, 200, 0.01).onChange(() => onCameraLookAtChange)
    folder.add(config.cameraLookAt, "y", -200, 200, 0.01).onChange(() => onCameraLookAtChange)
    folder.add(config.cameraLookAt, "z", -200, 200, 0.01).onChange(() => onCameraLookAtChange)
  }

  gltfLoader.load(
    modelNature,
    (gltf) => {
      scene.add(gltf.scene)
      gltf.scene.scale.set(1, 1, 1)
      console.log('GlTF loaded and added to scene.');
      updateMaterial()
    }
  )

  initPostprocessing()
  addLights()

  controls = new OrbitControls(camera, renderer.domElement);
  controls.update();

  window.addEventListener('resize', resize)

  scroll = window.scrollY / window.innerHeight
  raf = requestAnimationFrame(render)
}

let material
let quad

const initPostprocessing = () => {
  postScene = new THREE.Scene()
  const frustumSize = 1
  const aspect = 1
  postCamera = new THREE.OrthographicCamera(frustumSize * aspect / -2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );

  material = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms: {
      progress : { type: "f", value: 0 },
      uTexture1: { type: "t", value: null },
      uTexture2: { type: "t", value: null },
    },
    // wireframe: true,
    // transparent: true,
    vertexShader: coverVert,
    // fragmentShader: coverFrag,
    fragmentShader: sweepFrag,
  })

  quad = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    material
  )

  postScene.add(quad)

  if (bDebugGUI) {
    const folder = gui.addFolder('SHADER')
    folder.add(config, "progress", 0, 1, 0.01).onChange((val)=>{
      updateMaterial()
    })
    folder.add(config, 'showPostProcessing').onChange(() => {
      updateMaterial()
    })
    folder.add(config.shader, 'simpleSweep').onChange(() => {
      material.fragmentShader = config.shader.simpleSweep ? sweepFrag : coverFrag
      material.needsUpdate = true
      updateMaterial()
    })
  }
}

const updateMaterial = () => {
  console.log('updateMaterial', config.progress);

  renderer.setRenderTarget(renderTarget1)
  renderer.render(scene, camera)

  renderer.setRenderTarget(renderTarget2)
  renderer.render(scene, camera2)

  renderer.setRenderTarget(null)

  renderTarget1.texture.format = THREE.RGBAFormat
  renderTarget2.texture.format = THREE.RGBAFormat

  material.uniforms.uTexture1.value = renderTarget1.texture
  material.uniforms.uTexture2.value = renderTarget2.texture
  material.uniforms.progress.value = config.progress
}

const render = (t) => {
  controls.update();      
  if (config.showPostProcessing)
    renderer.render(postScene, postCamera);
  else 
    renderer.render(scene, camera);

  raf = requestAnimationFrame(render)
}

const addLights = () => {
  // const hemisphereLight = new THREE.HemisphereLight(0xf9fcc3, 0xa2a2a2) // Cast no shadows
  // hemisphereLight.position.set(0, 10, 0)
  // hemisphereLight.name = 'light-hemisphere'
  // scene.add( hemisphereLight )

  // Hemisphere Light Helper
  // const helper = new HemisphereLightHelper( hemisphereLight, 5 )
  // scene.add( helper )

  const ambientLight = new THREE.AmbientLight(0xffffff, 2)
  scene.add(ambientLight)

  // Directional Light
  // See this https://stackoverflow.com/questions/65655433/why-is-three-js-cast-shadow-not-working-on-a-3d-model
  const directionalLight = new THREE.DirectionalLight(0xffffff, 5)
  directionalLight.position.set(101, 35, 9)
  directionalLight.target.position.set(0, 0, 0)
  directionalLight.castShadow = true
  // directionalLight.visible = false

  // directionalLight.shadow.radius = 2// Not working with PCFSoftShadowMap
  directionalLight.shadow.camera.left = -120;
  directionalLight.shadow.camera.right = 175;
  directionalLight.shadow.camera.top = 50;
  directionalLight.shadow.camera.bottom = - 30;
  directionalLight.shadow.camera.near = 0.1
  directionalLight.shadow.camera.far = 160
  directionalLight.shadow.mapSize.set(512, 512)
  directionalLight.name = 'light-direction'
  // // directionalLight.shadow.bias = 0.007
  // directionalLight.shadow.normalBias = 1

  scene.add(directionalLight)
  scene.add(directionalLight.target)

  // Directional Light Camera Helper
  // const directionalLightCameraHelper = new CameraHelper(directionalLight.shadow.camera)
  // scene.add(directionalLightCameraHelper)

  // Directional Light Helper
  // const lightHelper = new DirectionalLightHelper(directionalLight, 5, 0xffff00)
  // scene.add( lightHelper )

  // Point Light
  // const light_point:PointLight = new PointLight(0xffffff, 8, 100, 1)
  // light_point.position.set(200, 78, 186)
  // light_point.intensity = 0.9
  // light_point.decay = 0
  // light_point.distance = 0
  // scene.add(light_point)

  if (bDebugGUI) {
    // const hemisphereLightFolder = gui.addFolder("Light Hemisphere")
    // hemisphereLightFolder.add(hemisphereLight, "visible", false)
    // hemisphereLightFolder.add(hemisphereLight, "intensity", 0, 10, 0.0001)

    // Ambient Light
    const ambientLightFolder = gui.addFolder("LIGHT AMBIENT")
    ambientLightFolder.add(directionalLight, "visible", false)
    ambientLightFolder.add(directionalLight, "intensity", 0, 10, 0.0001)

    // Directional Light
    const onDirectionalLightChange = () => {
      directionalLight.target.updateMatrixWorld()
      // lightHelper.update()
    }

    // light1Folder.open()
    const light2Folder = gui.addFolder("LIGHT DIRECTIONAL")
    light2Folder.add(directionalLight, "visible", false)
    light2Folder.add(directionalLight.position, "x", -200, 200, 0.01).onChange(() => onDirectionalLightChange)
    light2Folder.add(directionalLight.position, "y", -200, 200, 0.01).onChange(() => onDirectionalLightChange)
    light2Folder.add(directionalLight.position, "z", -200, 200, 0.01).onChange(() => onDirectionalLightChange)
    light2Folder.add(directionalLight, "intensity", 0, 10, 0.0001)

    const light3Folder = gui.addFolder("LIGHT DIR. TARGET")
    light3Folder.add(directionalLight.target.position, "x", -200, 200, 0.01).onChange(() => onDirectionalLightChange)
    light3Folder.add(directionalLight.target.position, "y", -200, 200, 0.01).onChange(() => onDirectionalLightChange)
    light3Folder.add(directionalLight.target.position, "z", -200, 200, 0.01).onChange(() => onDirectionalLightChange)

    // Point Light
    // const lightPointFolder = gui.addFolder("light point")
    // lightPointFolder.add(light_point, "visible", false)
    // lightPointFolder.add(light_point.position, "x", -300, 300, 0.01)
    // lightPointFolder.add(light_point.position, "y", -300, 300, 0.01)
    // lightPointFolder.add(light_point.position, "z", -300, 300, 0.01)
    // lightPointFolder.add(light_point, "intensity", 0, 10, 0.001)
    // lightPointFolder.add(light_point, "decay", 0, 10, 0.001)
    // lightPointFolder.add(light_point, "distance", 0, 20, 0.001)
  }
}

const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
      child.material.envMapIntensity = guiDebugObject.envMapIntensity
      child.material.needsUpdate = true
      child.castShadow = true
      child.receiveShadow = true
    }
  })
}

const isMobile = () => {
  return window.matchMedia("(pointer:coarse)").matches || window.innerWidth < 769 || window.innerHeight > window.innerWidth
}

const resize = () => {
  width = canvas.offsetWidth;
  height = canvas.offsetHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}


onMounted(() => {    
    init()

    // Use a virtual scroll while the scroll is locked untill cover 3d animations are finished
    // Once the animations are finished, the scroll is unlocked and the virtual scroll is disabled
    let currentState = 0;
    scroller = new VirtualScroll()
    scroller.on(event => {
      // console.log(event, currentState)
      currentState -= event.deltaY / 4000;
      // currentState = (currentState + 3000) % 3;
      gsap.to(config, {progress: currentState, duration: 1, onUpdate: () => {
        updateMaterial()
      }})
      console.log(progress)
      if (currentState > 1) {
        scroller.destroy()
        currentState = 1
        document.querySelector('html').classList.remove('scroll-locked')
      }
    })
})

onUnmounted(() => {
  if (renderer) {
    renderer.dispose()
  }

  if (gui) {
    gui.destroy()
  }

  // TODO: Handle resize
  window.removeEventListener('resize', this.resize)

  window.cancelAnimationFrame(raf)
})
</script>

<style lang="scss">
    .scene-container {
        width: 100vw;
        height: 100vh;
        position: fixed;
        top: 0;
        left: 0;
        z-index: $z-3d-scene-container;
    }

    #three-canvas {
        width: 100%;
        height: 100%;
        // mix-blend-mode: screen; // MAYBE ADD THIS BACK IN ?
    }

    #scene-controls {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 60%;
        top: 0%;
        z-index: $z-3d-scene-controls;
        touch-action: none;

        .page-contact &, .page-agence &, .page-work &, .page-legal & {
            height: 38%;
        }

        .page-work-id & {
            display: none;
        }
    }

    #lv-guide{
        position: absolute;
        top: 0;
        left: 0;
        width: 0;
        height: 100vh;
        height: 100lvh;
        touch-action: none;
        visibility: hidden;
        z-index: -9999999;
    }
    
    @include media-breakpoint-up(xl) {
        #scene-controls {
            height: 100%;
            touch-action: auto;
            .page-contact &, .page-agence & {
                height: 100%;
                width: 40%;
            }

        }
    }

    #scroll-cta {
        width: 50px;
        height: 50px;
        transform: rotate(-180deg) translateX(50%);
        position: absolute;
        bottom: 5%;
        left: 50%;
        opacity: 0;
        animation: infinite 1.25s scroll-cta;
        user-select: none;
    }

    @keyframes scroll-cta {
        0% {
            transform: rotate(-180deg) translate(50%, 0%);
        }
        75% {
            transform: rotate(-180deg) translate(50%, 20%);
        }
        100% {
            transform: rotate(-180deg) translate(50%, 0%);
        }
    }
</style>