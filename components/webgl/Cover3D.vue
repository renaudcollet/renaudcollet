<template>
    <div class="scene-container">
        <canvas id="three-canvas"></canvas>
    </div>
</template>

<script>
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



export default {
  mounted() {
    
    this.init()

    // Use a virtual scroll while the scroll is locked untill cover 3d animations are finished
    // Once the animations are finished, the scroll is unlocked and the virtual scroll is disabled
    this.currentState = 0;
    this.scroller = new VirtualScroll()
    this.scroller.on(event => {
      console.log(this.currentState)
      this.currentState -= event.deltaY / 4000;
      this.currentState = (this.currentState + 3000) % 3;
    })
  },

  unmounted() {
    if (this.renderer) {
      this.renderer.dispose()
    }

    if (this.controlElem) {
      this.controlElem.removeEventListener('mousedown', this.onMouseDown)
      this.controlElem.removeEventListener('touchstart', this.onMouseDown)
      this.controlElem.removeEventListener('pointermove', this.onPointerMove)
    }

    if (this.gui) {
      this.gui.destroy()
    }

    document.removeEventListener('mouseup', this.onMouseUp)
    document.removeEventListener('touchend', this.onTouchEnd)
    window.removeEventListener('resize', this.setSize)

    window.cancelAnimationFrame(this.raf)
  },

  methods: {
    init() {
      this.bDebugGUI = window.location.hash === '#debug'

      this.config = {
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

      this.canvas = document.querySelector('#three-canvas')
      this.width = this.canvas.offsetWidth;
      this.height = this.canvas.offsetHeight;
      this.scene = new THREE.Scene()
      this.scene.fog = new THREE.FogExp2(0xcccccc, 0.002);
      // this.scene.background = new Color(0xff0000);
      this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 1000)
      this.camera.position.set(0, 3, 35)
      this.camera.lookAt(this.config.cameraLookAt)

      this.camera2 = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 1000)
      this.camera2.position.set(10, 37, 35)
      this.camera2.lookAt(this.config.cameraLookAt)

      // gsap.to(this.camera.position, {x: 0, y: 5, z: 20, duration: 1.5, delay: 0.5, repeat: -1, yoyo: true})

      this.pixelRatio = Math.min(window.devicePixelRatio, 2)
      this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true })
      this.renderer.outputColorSpace = THREE.SRGBColorSpace
      this.renderer.toneMapping = THREE.LinearToneMapping // ACESFilmicToneMapping
      this.renderer.setSize(this.width, this.height)
      this.renderer.setPixelRatio(this.pixelRatio)
      this.renderer.setClearColor(0xeeeeee, 1)

      // Render Targets
      this.renderTarget1 = new THREE.WebGLRenderTarget(this.width * this.pixelRatio, this.height * this.pixelRatio)
      this.renderTarget2 = new THREE.WebGLRenderTarget(this.width * this.pixelRatio, this.height * this.pixelRatio)
      this.renderTarget1.outputColorSpace = THREE.SRGBColorSpace
      this.renderTarget1.toneMapping = THREE.LinearToneMapping

      // Draco
      const THREE_PATH = `https://unpkg.com/three@0.${REVISION}.x`
      this.dracoLoader = new DRACOLoader( new THREE.LoadingManager() ).setDecoderPath( `${THREE_PATH}/examples/jsm/libs/draco/gltf/` );
      this.gltfLoader = new GLTFLoader();
      this.gltfLoader.setDRACOLoader(this.dracoLoader);

      if (this.bDebugGUI) {
        this.gui = new GUI().title('Cover 3D').open()
        this.guiDebugObject = {}
        this.guiDebugObject.envMapIntensity = 1
        // this.gui = this.gui.addFolder('Cover 3D') // redefine gui to add folder
        this.gui.add(this.guiDebugObject, 'envMapIntensity', 0, 10, 0.001).onChange(this.updateAllMaterials.bind(this))

        this.gui
          .add(this.renderer, 'toneMapping', {
            No: THREE.NoToneMapping,
            Linear: THREE.LinearToneMapping,
            Reinhard: THREE.ReinhardToneMapping,
            Cineon: THREE.CineonToneMapping,
            ACESFilmic: THREE.ACESFilmicToneMapping
          })
          .onFinishChange(() => {
            this.renderer.toneMapping = Number(this.renderer.toneMapping)
            this.updateAllMaterials()
          })

        this.gui.add(this.renderer, 'toneMappingExposure', 0, 10, 0.001)

        let folder = this.gui.addFolder('Camera')
        folder.add(this.camera.position, 'x', -100, 100, 0.001)
        folder.add(this.camera.position, 'y', -100, 100, 0.001)
        folder.add(this.camera.position, 'z', -100, 100, 0.001)

        folder = this.gui.addFolder('Camera Target')
        const onCameraLookAtChange = () => {
          console.log('onCameraLookAtChange')
          this.camera.lookAt(this.config.cameraLookAt)
        }
        folder.add(this.config.cameraLookAt, "x", -200, 200, 0.01).onChange(() => onCameraLookAtChange)
        folder.add(this.config.cameraLookAt, "y", -200, 200, 0.01).onChange(() => onCameraLookAtChange)
        folder.add(this.config.cameraLookAt, "z", -200, 200, 0.01).onChange(() => onCameraLookAtChange)
      }

      this.gltfLoader.load(
        modelNature,
        (gltf) => {
          this.scene.add(gltf.scene)
          gltf.scene.scale.set(1, 1, 1)
          console.log('GlTF loaded and added to scene.');
        }
      )

      this.initPostprocessing()
      this.addLights()

      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.update();

      window.addEventListener('resize', this.setSize)

      this.appear = 0
      this.scroll = window.scrollY / window.innerHeight
      this.raf = requestAnimationFrame(this.render)
    },

    initPostprocessing() {
      this.postScene = new THREE.Scene()
      const frustumSize = 1
      const aspect = 1
      this.postCamera = new THREE.OrthographicCamera(frustumSize * aspect / -2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );

      this.material = new THREE.ShaderMaterial({
        side: THREE.DoubleSide,
        uniforms: {
          progress : { type: "f", value: 0 },
          uTexture1: { type: "t", value: new THREE.TextureLoader().load(bg1) },
          uTexture2: { type: "t", value: new THREE.TextureLoader().load(bg2) },
        },
        // wireframe: true,
        // transparent: true,
        vertexShader: coverVert,
        // fragmentShader: coverFrag,
        fragmentShader: sweepFrag,
      })

      this.quad = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        this.material
      )

      this.postScene.add(this.quad)

      if (this.bDebugGUI) {
        const folder = this.gui.addFolder('SHADER')
        folder.add(this.config, "progress", 0, 1, 0.01).onChange((val)=>{})
        folder.add(this.config, 'showPostProcessing')
        folder.add(this.config.shader, 'simpleSweep').onChange(() => {
          this.material.fragmentShader = this.config.shader.simpleSweep ? sweepFrag : coverFrag
          this.material.needsUpdate = true
        })
      }
    },

    render(t) {
      this.controls.update();

      this.progress = this.config.progress

      this.renderer.setRenderTarget(this.renderTarget1)
      this.renderer.render(this.scene, this.camera)

      this.renderer.setRenderTarget(this.renderTarget2)
      this.renderer.render(this.scene, this.camera2)

      this.renderer.setRenderTarget(null)

      this.material.uniforms.uTexture1.value = this.renderTarget1.texture
      this.material.uniforms.uTexture2.value = this.renderTarget2.texture
      this.material.uniforms.progress.value = this.progress

      
      if (this.config.showPostProcessing)
        this.renderer.render(this.postScene, this.postCamera);
      else 
        this.renderer.render(this.scene, this.camera);

      this.raf = requestAnimationFrame(this.render)
    },

    addLights() {
      // const hemisphereLight = new THREE.HemisphereLight(0xf9fcc3, 0xa2a2a2) // Cast no shadows
      // hemisphereLight.position.set(0, 10, 0)
      // hemisphereLight.name = 'light-hemisphere'
      // this.scene.add( hemisphereLight )

      // Hemisphere Light Helper
      // const helper = new HemisphereLightHelper( hemisphereLight, 5 )
      // this.scene.add( helper )

      const ambientLight = new THREE.AmbientLight(0xffffff, 2)
      this.scene.add(ambientLight)

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

      this.scene.add(directionalLight)
      this.scene.add(directionalLight.target)

      // Directional Light Camera Helper
      // const directionalLightCameraHelper = new CameraHelper(directionalLight.shadow.camera)
      // this.scene.add(directionalLightCameraHelper)

      // Directional Light Helper
      // const lightHelper = new DirectionalLightHelper(directionalLight, 5, 0xffff00)
      // this.scene.add( lightHelper )

      // Point Light
      // const light_point:PointLight = new PointLight(0xffffff, 8, 100, 1)
      // light_point.position.set(200, 78, 186)
      // light_point.intensity = 0.9
      // light_point.decay = 0
      // light_point.distance = 0
      // this.scene.add(light_point)

      if (this.bDebugGUI) {
        // const hemisphereLightFolder = this.gui.addFolder("Light Hemisphere")
        // hemisphereLightFolder.add(hemisphereLight, "visible", false)
        // hemisphereLightFolder.add(hemisphereLight, "intensity", 0, 10, 0.0001)

        // Ambient Light
        const ambientLightFolder = this.gui.addFolder("Light Ambient")
        ambientLightFolder.add(directionalLight, "visible", false)
        ambientLightFolder.add(directionalLight, "intensity", 0, 10, 0.0001)

        // Directional Light
        const onDirectionalLightChange = () => {
          directionalLight.target.updateMatrixWorld()
          // lightHelper.update()
        }

        // light1Folder.open()
        const light2Folder = this.gui.addFolder("Light Directional")
        light2Folder.add(directionalLight, "visible", false)
        light2Folder.add(directionalLight.position, "x", -200, 200, 0.01).onChange(() => onDirectionalLightChange)
        light2Folder.add(directionalLight.position, "y", -200, 200, 0.01).onChange(() => onDirectionalLightChange)
        light2Folder.add(directionalLight.position, "z", -200, 200, 0.01).onChange(() => onDirectionalLightChange)
        light2Folder.add(directionalLight, "intensity", 0, 10, 0.0001)

        const light3Folder = this.gui.addFolder("Light Dir. target")
        light3Folder.add(directionalLight.target.position, "x", -200, 200, 0.01).onChange(() => onDirectionalLightChange)
        light3Folder.add(directionalLight.target.position, "y", -200, 200, 0.01).onChange(() => onDirectionalLightChange)
        light3Folder.add(directionalLight.target.position, "z", -200, 200, 0.01).onChange(() => onDirectionalLightChange)

        // Point Light
        // const lightPointFolder = this.gui.addFolder("light point")
        // lightPointFolder.add(light_point, "visible", false)
        // lightPointFolder.add(light_point.position, "x", -300, 300, 0.01)
        // lightPointFolder.add(light_point.position, "y", -300, 300, 0.01)
        // lightPointFolder.add(light_point.position, "z", -300, 300, 0.01)
        // lightPointFolder.add(light_point, "intensity", 0, 10, 0.001)
        // lightPointFolder.add(light_point, "decay", 0, 10, 0.001)
        // lightPointFolder.add(light_point, "distance", 0, 20, 0.001)
      }
    },

    updateAllMaterials() {
      this.scene.traverse((child) => {
        if (child instanceof Mesh && child.material instanceof MeshStandardMaterial) {
          child.material.envMapIntensity = this.guiDebugObject.envMapIntensity
          child.material.needsUpdate = true
          child.castShadow = true
          child.receiveShadow = true
        }
      })
    },

    isMobile() {
      return window.matchMedia("(pointer:coarse)").matches || window.innerWidth < 769 || window.innerHeight > window.innerWidth
    },

    resize() {
      this.width = this.canvas.offsetWidth;
      this.height = this.canvas.offsetHeight;
      this.renderer.setSize(this.width, this.height);
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
    }
  }
}
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