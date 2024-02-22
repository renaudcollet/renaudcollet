<template>
    <div class="scene-container">
        <canvas ref="canvas" id="three-canvas"></canvas>
    </div>
</template>

<script setup>
import GUI from 'lil-gui';
// import { useDatasStore } from '~/stores/datas';
import * as debug from '~/js/debug.ts';
import config3d from '~/js/config3d.js'

import * as THREE from 'three'
// import { REVISION } from 'three'
// import Stats from 'three/examples/jsm/libs/stats.module'

import gsap from 'gsap';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OrbitControls } from '~/js/three/OrbitControls.js';
// import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

import sweepFrag from '~/shaders/sweep.frag'
import coverFrag from '~/shaders/cover.frag'
import coverVert from '~/shaders/cover.vert'
import coverLacVert from '~/shaders/cover-lac.vert'
import coverLacFrag from '~/shaders/cover-lac.frag'
import { palettes, sinPalettes } from "~/js/palettes.js";

import bg from '~/assets/textures/background.jpg'
// import px from '~/assets/textures/px.png'
// import nx from '~/assets/textures/nx.png'
// import py from '~/assets/textures/py.png'
// import ny from '~/assets/textures/ny.png'
// import pz from '~/assets/textures/pz.png'
// import nz from '~/assets/textures/nz.png'

import modelNature from '~/assets/3d/nature-scene.glb'
// import lethargy from 'lethargy'
// import VirtualScroll from 'virtual-scroll'
import { toRef } from '@vueuse/core';

const canvas = ref(null)
let width
let height
let scene, postScene
let renderer
let lightCameraHelper
let camera, camera2, postCamera
let pixelRatio
let renderTarget1, renderTarget2
let dracoLoader, gltfLoader
let controls
let raf

// const storeDatas = useDatasStore();

const props = defineProps({
  showCover: {
    type: Boolean,
    default: false
  },
  scrollZone: {
    type: Object,
    default: null
  }
})

const scrollZone = toRef(props, 'scrollZone')
watch(scrollZone, (newVal, oldVal) => {
  // console.log('//// scrollZone in cover3d', newVal);
  if (newVal) {
    zoneHeight = scrollZone.value.offsetHeight
    if (zoneHeight === 0) {
      // I have a bug where height is 0 after unmount and remount
      zoneHeight = parseInt(scrollZone.value.style.height, 10);
    }
    // console.log('zoneHeight =', zoneHeight);
  }
})

let bDebugGUI = false
let gui

let stats
let animationStarted = false
let introAnimationComplete = false
let tlAnimation
let tlSkate

// Play start animation
const startAnimation = () => {  

  reInit()
        
  // console.log('COVER3D - Start RAF');
  window.addEventListener('resize', resize)
  raf = requestAnimationFrame(render)

  animationStarted = true
  const { start } = config3d.camera
  const { rise } = config3d.camera
  const { end } = config3d.camera

  tlAnimation.kill()
  tlAnimation = gsap.timeline()
  if (debug.SKIP_INTRO) tlAnimation.timeScale(5)
  tlAnimation
    .to(canvas.value, { delay: 0.5, autoAlpha: 1, duration: 1 })
    .to(camera.position, {
      x: rise.x, y: rise.y, z: rise.z, duration: 1,
      ease: 'power2.outIn',
      // onUpdate: () => {
      //   // updateRendererAndShaderMaterial()
      // }
    }, '+=0.5')
    .to(camera.position, {
      x: end.x, y: end.y, z: end.z, 
      duration: 2, 
      ease: 'power2.inOut',
      onUpdate: function() {
        const lerpX = THREE.MathUtils.lerp(start.lookAt.x, end.lookAt.x, this.progress())
        const lerpZ = THREE.MathUtils.lerp(start.lookAt.z, end.lookAt.z, this.progress())
        camera.lookAt(lerpX, end.lookAt.y, lerpZ)
        // updateRendererAndShaderMaterial()
      },
      onComplete: () => {
        introAnimationComplete = true
        initOrbitControls()
      }
    })
}

const stopAnimation = () => {
  if (animationStarted) {
    animationStarted = false
    tlAnimation.kill()
    tlAnimation = gsap.timeline()
    tlAnimation
      .to(canvas.value, { autoAlpha: 0, duration: 1, onComplete: () => {
        config3d.progress = 0
        resetControls()
        // updateRendererAndShaderMaterial()
        // console.log('COVER3D - Stop RAF');
        window.removeEventListener('resize', resize)
        window.cancelAnimationFrame(raf)
      } })
  }
}

const showCover = toRef(props, 'showCover')
watch(showCover, (newVal, oldVal) => {
  // console.log('WATCH - showCover', newVal);
  if (newVal) { 
    startAnimation()     
  } else {
    stopAnimation()
  }
})

const resetControls = () => {
  if (controls) {
    controls.enabled = false
    controls.dispose()
    controls = null
  }
}

// For debug purpose
const initOrbitControls = () => {
  if (bDebugGUI) {
    controls = new OrbitControls(camera, renderer.domElement);
    renderer.domElement.parentElement.style.zIndex = 1000
    controls.addEventListener('change', () => {
      // console.log('controls change');
      updateRendererAndShaderMaterial()
    })
    controls.enabled = true
    controls.update()
  }
}

/**
 * 
 * RAYCASTER
 * 
 */

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()
let sItemRollOvered = null
let sItemRollOveredPrevious = null
let aDeerMaterialColors = [0xfdf0bc, 0xFF0000, 0x00FF00, 0x11444b, 0x0000FF, 0xFFFF00, 0xc37e1d, 0xFF00FF, 0x00FFFF, 0xb1432f]

const updateRaycaster = () => {
  raycaster.setFromCamera(mouse, camera)
  // const intersects = raycaster.intersectObjects(scene.children, true)
  const intersects = raycaster.intersectObjects(aHitMesh, true)
  if (intersects.length > 0) {
    // console.log('COVER3D - intersectObjects', intersects.length, intersects);
    for ( let i = 0; i < intersects.length; i ++ ) {

      // intersects[ i ].object.material.color.set( 0xff0000 );
      const hitMesh = intersects[ i ].object
      const type = hitMesh.userData.type

      // console.log('COVER3D - intersectObjects', hitMesh.userData.name, hitMesh.userData.type, hitMesh.userData.isMoving);

      if (type === TYPE_LAC) {
          const uv = intersects[i].uv
          // uLacMouse.value.set(uv.x, uv.y)
          gsap.killTweensOf(uLacMouse.value)
          gsap.to(uLacMouse.value, {
            x: uv.x,
            y: uv.y,
            delay: 0.0,
            duration: 0.5,
            onComplete: () => {
              gsap.to(uLacMouse.value, {
                x: 0.5,
                y: 0.5,
                duration: 2,
                delay: 1,
                ease: 'power2.outIn'
              })
            }
          })
      } else {
        sItemRollOvered = hitMesh.userData.name
      }

      // Here are all the hit we don't want to repet in a loop
      if (sItemRollOvered !== sItemRollOveredPrevious) {
        if (!hitMesh.userData.isMoving) {

          const object3d = hitMesh.userData.instance
          hitMesh.userData.isMoving = true

          if (type === TYPE_SHEEP) {
            // Sheep
            gsap.to(object3d.position, {
              y: object3d.position.y + 0.5,
              duration: 0.2,
              ease: 'back.out',
              onCompleteParams: [hitMesh, object3d],
              onComplete: (_hitMesh, _object3d) => {
                gsap.to(_object3d.position, {
                  y: _object3d.position.y - 0.5,
                  duration: 0.1,
                  ease: 'back.out',
                  onCompleteParams: [_hitMesh],
                  onComplete: (__hitMesh) => {
                    __hitMesh.userData.isMoving = false
                  }
                })
              }
            })
          } 

          else if (type === TYPE_THUMB) {
            gsap.to(object3d.rotation, {
              z: Math.PI / 8,
              duration: 0.2,
              ease: 'power2.outIn',
              onCompleteParams: [hitMesh, object3d],
              onComplete: (_hitMesh, _object3d) => {
                gsap.to(_object3d.rotation, {
                  z: 0,
                  duration: 0.1,
                  ease: 'power2.outIn',
                  onCompleteParams: [_hitMesh],
                  onComplete: (__hitMesh) => {
                    __hitMesh.userData.isMoving = false
                  }
                })
              }
            }) 
          }

          else if (type === TYPE_DEER) {
            console.log('DEER', hitMesh);
            const color = new THREE.Color(aDeerMaterialColors[Math.floor(Math.random() * (aDeerMaterialColors.length - 1))])
            gsap.to(hitMesh.material.color, {
              r: color.r, // Math.random(),
              g: color.g, // Math.random(),
              b: color.b, //Math.random(),
              duration: 1,
              onComplete: () => {
                hitMesh.userData.isMoving = false
              }
            })
          }

          else if (type === TYPE_LOTUS) {
            hitMesh.userData.isMoving = false
            gsap.killTweensOf(object3d.rotation)
            gsap.killTweensOf(object3d.position)
            const delta = Math.random()
            gsap.to(object3d.rotation, {
              y: `+=${Math.PI * delta}`,
              duration: 0.5,
              ease: 'power2.outIn'
            }) 
            gsap.to(object3d.position, {
              x: hitMesh.userData.initX + 1.3 * (delta - 0.5),
              z: hitMesh.userData.initZ + 1.3 * (delta - 0.5),
              duration: 0.5,
              ease: 'power2.outIn'
            })
          }

          else if (type === TYPE_SKATE) {
            tlSkate
              .to(object3d.children[0].rotation, { // Skate à plat
                x: Math.PI / 2,
                duration: 0.2,
                ease: 'power2.outIn'
              })
              .to(object3d.position, {
                y: 2,
                delay: 0.1,
                duration: 0.2,
                ease: 'bounce.outIn'
              })
              // .to(object3d.rotation, {
              //   z: Math.PI / 6,
              //   duration: 0.2,
              //   ease: 'bounce.outIn'
              // }, '-=0.2')
              // .to(object3d.rotation, {
              //   z: 0,
              //   duration: 0.2,
              //   ease: 'linear'
              // })
              .to(object3d.children[0].rotation, {
                x: `+=${Math.PI * 2}`,
                duration: 1,
                // ease: 'power2.outIn',
                onCompleteParams: [hitMesh, object3d],
                onComplete: (_hitMesh, _object3d) => {
                  // Needed to reset the rotation
                  _object3d.children[0].rotation.x = Math.PI / 2
                }
              }, '-=0.2')
              .to(object3d.rotation, {
                y: `+=${Math.PI * 2}`,
                duration: 1,
                // ease: 'power2.outIn',
                onCompleteParams: [hitMesh, object3d],
                onComplete: (_hitMesh, _object3d) => {
                  // Needed to reset the rotation
                  // _object3d.rotation.y = 0
                }
              }, '-=1')
              .to(object3d.position, {
                y: hitMesh.userData.initY,
                duration: 0.2,
                ease: 'power2.outIn',
              })
              .to(object3d.children[0].rotation, { // Skate à plat
                x: 0,
                delay: 0.3,
                duration: 0.1,
                ease: 'power2.outIn',
                onCompleteParams: [hitMesh, object3d],
                onComplete: (_hitMesh, _object3d) => {
                  _hitMesh.userData.isMoving = false
                }
              })
          }
          //
        }
      }
      sItemRollOveredPrevious = sItemRollOvered
    }
  } else {
    sItemRollOveredPrevious = sItemRollOvered
    sItemRollOvered = null
  }
}


/**
 * 
 * MOUSE MOVE / TOUCH MOVE
 * 
 */

const onMouseMove = (e) => {
  // console.log('COVER3D - onMouseMove');
  mouse.x = (e.clientX / width) * 2 - 1
  mouse.y = -(e.clientY / height) * 2 + 1   
}

const onTouchMove = (e) => {
  // console.log('COVER3D - onTouchMove');
  mouse.x = (e.touches[0].clientX / width) * 2 - 1
  mouse.y = -(e.touches[0].clientY / height) * 2 + 1 
}

const offset = new THREE.Vector3();
const distance = 5;

// rotateAroundPoint - Example usage:
// const point = new THREE.Vector3(1, 1, 1); // Point around which to rotate
// const objectPosition = new THREE.Vector3(2, 2, 2); // Initial position of the object
const axis = new THREE.Vector3(0, 1, 0); // Rotation axis (for example, rotating around the y-axis)
// const angle = Math.PI / 2; // Angle in radians
// const newObjectPosition = rotateAroundPoint(point, objectPosition, axis, angle);

let translatedObject = new THREE.Vector3()
let rotatedObject = new THREE.Vector3()
let newObjectPosition = new THREE.Vector3()
const rotateAroundPoint = (point, objectPosition, axis, angle) => {

    // Translate the object to the origin
    translatedObject.set(0, 0, 0).subVectors(objectPosition, point);

    // Compute the sine and cosine of the angle
    const c = Math.cos(angle);
    const s = Math.sin(angle);

    // Compute the components of the rotation matrix
    const [ux, uy, uz] = axis;
    const rotationMatrix = [
        [c + ux * ux * (1 - c), ux * uy * (1 - c) - uz * s, ux * uz * (1 - c) + uy * s],
        [uy * ux * (1 - c) + uz * s, c + uy * uy * (1 - c), uy * uz * (1 - c) - ux * s],
        [uz * ux * (1 - c) - uy * s, uz * uy * (1 - c) + ux * s, c + uz * uz * (1 - c)]
    ];

    // Apply rotation to the translated object
    rotatedObject.set(
        rotationMatrix[0][0] * translatedObject.x + rotationMatrix[0][1] * translatedObject.y + rotationMatrix[0][2] * translatedObject.z,
        rotationMatrix[1][0] * translatedObject.x + rotationMatrix[1][1] * translatedObject.y + rotationMatrix[1][2] * translatedObject.z,
        rotationMatrix[2][0] * translatedObject.x + rotationMatrix[2][1] * translatedObject.y + rotationMatrix[2][2] * translatedObject.z
    );

    // Translate the object back to its original position
    return newObjectPosition.set(0, 0, 0).addVectors(rotatedObject, point);
}

const updateCameraPosition = () => {  
    // const radX = THREE.MathUtils.degToRad(e.clientX / width * 80 - 40)
    const radX = THREE.MathUtils.degToRad(mouse.x * 35)
    const radY = THREE.MathUtils.degToRad(mouse.y * 3)

    offset.x = distance * Math.cos( radX );
    offset.y = distance * Math.sin( radY );
    offset.z = distance * Math.sin( radY );

    const newObjectPosition = rotateAroundPoint(config3d.camera.end.lookAt, config3d.camera.end.position, axis, radX);

    gsap.to(camera.position, {
      x: newObjectPosition.x, 
      y: newObjectPosition.y, 
      z: newObjectPosition.z,
      duration: 1, 
      ease: 'power2.outIn',
      onUpdate: () => {
        camera.lookAt(config3d.camera.end.lookAt)
      }
    })

    const newObjectPosition2 = rotateAroundPoint(config3d.camera2.lookAt, config3d.camera2.start, axis, radX);

    gsap.to(camera2.position, {
      x: newObjectPosition2.x, 
      y: newObjectPosition2.y, 
      z: newObjectPosition2.z,
      duration: 1, 
      ease: 'power2.outIn',
      onUpdate: () => {
        camera2.lookAt(config3d.camera2.lookAt)
      }
    })
}

let zoneHeight = 0
let prc = 0

const onScroll = () => {
    // console.log('   onScroll cover3d', zoneHeight);
    if (zoneHeight === 0) return

    prc = window.scrollY / zoneHeight
    // console.log(`cover3d onScroll, scrollY: ${window.scrollY}, zone: ${zoneHeight}`, prc);
    if (prc < 1.01) {
      config3d.progress = prc
      // updateRendererAndShaderMaterial()
    }
}

defineExpose({
  onScroll,
  onMouseMove,
  onTouchMove,
})

onMounted(() => {
    tlAnimation = gsap.timeline()
    tlSkate = gsap.timeline()
    init()

    // stats = new Stats()
    // document.body.appendChild(stats.dom)

    // For hmr reload
    if (showCover.value || props.showCover) { 
      // console.log('COVER3D - showCover.value || props.showCover');
      startAnimation()
    }
})

const reInit = () => {
  // console.log('COVER3D - reInit');
  const { start } = config3d.camera 
  camera.position.set(start.x, start.y, start.z)
  camera.lookAt(start.lookAt) 
  
  camera2.position.set(config3d.camera2.start.x, config3d.camera2.start.y, config3d.camera2.start.z)
  camera2.lookAt(config3d.camera2.lookAt)

  // updateRendererAndShaderMaterial()
}


/********
 * LAC
 */
let matLac
let meshLac
let radius = 1/5 //2/3
let grid = 66 // 30
let cellSize = .5 // 1.0
let totalGridSize = grid * cellSize
let uTime = { value: 0 }
let uLacMouse = { value: new THREE.Vector2(0.5, 0.5) }
let uLacGrid = { value: grid / 2 }
let paletteKey = "lac"
let palette = palettes[paletteKey]
let sinPalette = sinPalettes[paletteKey]
const initLac = () => {
  let geoLac = new THREE.CylinderGeometry(radius, radius, 1, 5, 2)
  let instancedGeoLac = (new THREE.InstancedBufferGeometry()).copy(geoLac)
  let instanceCount = grid * grid
  instancedGeoLac.instanceCount = instanceCount

  let pos = new Float32Array(instanceCount * 2) // * 2 because we only need x, y
  let i = 0
  for (let x = 0; x < grid; x++) {
    for (let y = 0; y < grid; y++) {
      pos[i++] = x * cellSize - totalGridSize / 2 + cellSize / 2
      pos[i++] = y * cellSize - totalGridSize / 2 + cellSize / 2
    }
  }

  instancedGeoLac.setAttribute('aPos', new THREE.InstancedBufferAttribute(pos, 2, false))


  matLac = new THREE.ShaderMaterial({
    vertexShader: coverLacVert,
    fragmentShader: coverLacFrag,
    uniforms: {
      uTime: uTime,
      uLacMouse: uLacMouse,
      uLacGrid: uLacGrid,
      uBackground:    { value: palette.BG },
      uPalette0:      { value: sinPalette.c0},
      uPalette1:      { value: sinPalette.c1},
      uPalette2:      { value: sinPalette.c2},
      uPalette3:      { value: sinPalette.c3},
      uPaletteOffset: { value: sinPalette.offset},
    },
    // side: THREE.FrontSide,
    // transparent: true,
    // depthTest: false,
    // depthWrite: false,
    // blending: THREE.AdditiveBlending,
  })

  meshLac = new THREE.Mesh(instancedGeoLac, matLac);
  // mesh.scale.y = 10
  // mesh.rotation.z = -Math.PI / 2
  meshLac.position.x = 0 // -totalGridSize /2
  meshLac.position.y = -0.4 // -totalGridSize /2
  // scene.add(mesh)
}




const TYPE_SHEEP = 'sheep'
const TYPE_SKATE = 'skate'
const TYPE_THUMB = 'thumb'
const TYPE_LOTUS = 'lotus'
const TYPE_LAC = 'lac'
const TYPE_DEER = 'deer'

const init = () => {
  bDebugGUI = window.location.hash === '#debug'

  width = window.innerWidth;
  height = window.innerHeight;
  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(window.innerWidth < 1024 ? 60 : 45, width / height, 0.1, 1000)
  const { start } = config3d.camera
  camera.position.set(start.x, start.y, start.z)
  camera.lookAt(start.lookAt)

  camera2 = new THREE.PerspectiveCamera(window.innerWidth < 1024 ? 60 : 45, width / height, 0.1, 1000)
  camera2.position.set(config3d.camera2.start.x, config3d.camera2.start.y, config3d.camera2.start.z)
  camera2.lookAt(config3d.camera2.lookAt)

  // THREE.ColorManagement.enabled = false

  // TODO: Probleme de colorspace avec les textures utilisées dans le ShaderMaterial
  // TODO:  Créer un codepen pour reproduire le problème
  // TODO: SMAA PASS to smooth render
  pixelRatio = Math.min(window.devicePixelRatio, debug.DEVICE_PIXEL_RATIO_MAX)
  renderer = new THREE.WebGLRenderer({ canvas: canvas.value, antialias: true, alpha: false, preserveDrawingBuffer: true})
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.LinearToneMapping // ACESFilmicToneMapping
  renderer.setSize(width, height)
  renderer.setPixelRatio(pixelRatio)
  renderer.setClearColor(0xeeeeee, 1)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

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

  // const loader = new THREE.CubeTextureLoader()
  // const backgroundTexture = loader.load( [ px, nx, py, ny, pz, nz ] )
  // // // backgroundTexture.encoding = sRGBEncoding
  // scene.background = backgroundTexture
  
  // Background
  // const bgTex = new THREE.TextureLoader().load(bg)
  // // bgTex.wrapS = THREE.RepeatWrapping;
  // // bgTex.wrapT = THREE.RepeatWrapping;
  // scene.background = bgTex
  // // scene.backgroundBlurriness = 0.5

  const updateFog = () => {
    if (config3d.fog.enable) {
      const {fogColor, fogNear, fogFar} = config3d.fog
      if (config3d.fog.enableFog2) {
        scene.fog = new THREE.FogExp2(fogColor, config3d.fog.fogExp2)
      } else {
        scene.fog = new THREE.Fog(fogColor, fogNear, fogFar)
      }
      scene.background = new THREE.Color(fogColor)
    } else {
      scene.fog = null
    }
  }

  updateFog()

  // KTX2 Loader
  // this.ktx2Loader = new KTX2Loader()
  // this.ktx2Loader.setTranscoderPath(window.theme_path + 'js/libs/basis/')
  // this.ktx2Loader.setResourcePath(window.theme_path + 'js/libs/basis/')
  // this.ktx2Loader.detectSupport(renderer)

  // Draco
  // const THREE_PATH = `https://unpkg.com/three@0.${REVISION}.x`
  // dracoLoader = new DRACOLoader( new THREE.LoadingManager() ).setDecoderPath( `${THREE_PATH}/examples/jsm/libs/draco/gltf/` );
  gltfLoader = new GLTFLoader();
  // gltfLoader.setDRACOLoader(dracoLoader);

  if (bDebugGUI) {

    gui = new GUI().title('Cover 3D').open()
    
    const updateLenis = () => config3d.lenis ? window.lenis.start() : window.lenis.stop()
    setTimeout(() => {
      updateLenis()
    }, 500)
    gui.add(config3d, 'lenis', false).onChange(updateLenis)
    gui.add(config3d, 'envMapIntensity', 0, 10, 0.001).onChange(updateAllMaterials.bind(this))

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

    
    let controlsGUI = gui.addFolder('FOG').close()
    controlsGUI.add(config3d.fog, 'enable').onChange(() => { updateFog() })
    controlsGUI.add(config3d.fog, 'fogNear', 0, 100, 1).name('Near').onChange(() => { updateFog() })
    controlsGUI.add(config3d.fog, 'fogFar', 0, 250, 1).name('Far').onChange(() => { updateFog() })
    controlsGUI.addColor(config3d.fog, 'fogColor').name('fog color').onChange(() => { updateFog() })
    controlsGUI.add(config3d.fog, 'enableFog2').onChange(() => { updateFog() })
    controlsGUI.add(config3d.fog, 'fogExp2', 0, 1, 0.01).name('fog density').onChange(() => { updateFog() })

    let folder = gui.addFolder('CAMERA')
    folder.add(camera.position, 'x', -100, 100, 0.001)
    folder.add(camera.position, 'y', -100, 100, 0.001)
    folder.add(camera.position, 'z', -100, 100, 0.001)

    folder = gui.addFolder('CAMERA TARGET')
    const onCameraLookAtChange = () => {
      controls.enabled = false
      controls.target.copy(config3d.camera.end.lookAt)
      controls.update()
      controls.enabled = true
      // camera.lookAt(config3d.camera.end.lookAt)
    }
    folder.add(config3d.camera.end.lookAt, "x", -200, 200, 0.01).onChange(() => onCameraLookAtChange)
    folder.add(config3d.camera.end.lookAt, "y", -200, 200, 0.01).onChange(() => onCameraLookAtChange)
    folder.add(config3d.camera.end.lookAt, "z", -200, 200, 0.01).onChange(() => onCameraLookAtChange)
  }

  initLac()
  
  const matHitZone = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.0 })

  gltfLoader.load(
    modelNature,
    (gltf) => {
      scene.add(gltf.scene)
      gltf.scene.scale.set(1, 1, 1)
      // updateRendererAndShaderMaterial()

      gltf.scene.traverse((child) => {
        // if (child.isMesh) {
        //   child.castShadow = true
        //   // child.receiveShadow = true
        // }
        
        if (child.name.indexOf('SheepItemRef') > -1) {
          const box = new THREE.Box3().setFromObject(child) // Because child is a group or has several mesh children
          const hitMesh = new THREE.Mesh(new THREE.BoxGeometry(box.max.x - box.min.x, box.max.y - box.min.y, box.max.z - box.min.z), matHitZone)
          // Let's ad hitmesh inside the sheep, but in a later loop to avoid changing the order of the children in the scene
          hitMesh.userData.type = TYPE_SHEEP
          aHitMesh.push(hitMesh)
          aHitObjects.push(child)
        }

        else if (child.name.indexOf('Sheep') > -1) {
          child.castShadow = true
        }
        
        else if (child.name.indexOf('Skate') > -1 && child.isGroup) {
          child.castShadow = true
          const box = new THREE.Box3().setFromObject(child) // Because child is a group or has several mesh children
          const hitMesh = new THREE.Mesh(new THREE.BoxGeometry(box.max.x - box.min.x, box.max.y - box.min.y, box.max.z - box.min.z), matHitZone)
          hitMesh.userData.type = TYPE_SKATE
          hitMesh.userData.initY = child.position.y
          aHitMesh.push(hitMesh)
          aHitObjects.push(child)
        }

        else if (child.name.indexOf('Skate') > -1) {
          child.castShadow = true
        }

        else if (child.name.indexOf('Lac') > -1) {
          child.material.transparent = true
          child.material.opacity = 0.5
          // child.material.visible = false
          child.add(meshLac)
          child.userData.type = TYPE_LAC
          aHitMesh.push(child)
          aHitObjects.push(child)
        }

        else if (child.name.indexOf('Thumb') > -1) {
          child.castShadow = true
          const box = child.geometry.boundingBox
          const hitMesh = new THREE.Mesh(new THREE.BoxGeometry(box.max.x - box.min.x, box.max.y - box.min.y, box.max.z - box.min.z), matHitZone)
          hitMesh.position.x = 1
          hitMesh.position.y = 0.3
          hitMesh.userData.type = TYPE_THUMB
          aHitMesh.push(hitMesh)
          aHitObjects.push(child)
        }

        else if (child.name.indexOf('Lotus') > -1) {
          const box = child.geometry.boundingBox // Because child is one mesh
          const hitMesh = new THREE.Mesh(new THREE.BoxGeometry(box.max.x - box.min.x, box.max.y - box.min.y, box.max.z - box.min.z), matHitZone)
          hitMesh.userData.type = TYPE_LOTUS
          hitMesh.userData.initX = child.position.x
          hitMesh.userData.initY = child.position.y
          hitMesh.userData.initZ = child.position.z
          aHitMesh.push(hitMesh)
          aHitObjects.push(child)
        }
        
        else if (child.name.indexOf('Deer') > -1) {
          child.castShadow = true
          child.receiveShadow = true
          child.userData.type = TYPE_DEER
          aHitMesh.push(child)
          aHitObjects.push(child)
        }

        else if (child.name.indexOf('Ground') > -1) {
          child.receiveShadow = true
        }

        else if (child.name.indexOf('Tree') > -1) {
          child.castShadow = true
        }

        else if (child.name.indexOf('Rock') > -1) {
          child.castShadow = true
        }

        else if (child.name.indexOf('Transat') > -1) {
          child.castShadow = true
        }

        else if (child.name.indexOf('Surf') > -1) {
          child.castShadow = true
        }
      })

      // Modify scene after the traverse
      aHitMesh.forEach((hitMesh, index) => {
        const object3d = aHitObjects[index]

        if (hitMesh.userData.type !== TYPE_LAC 
            && hitMesh.userData.type !== TYPE_DEER) {
          object3d.add(hitMesh)
          hitMesh.userData = { ...hitMesh.userData, name: object3d.name, instance: object3d }
        }

        if (hitMesh.userData.type === TYPE_SKATE) {
          // Move skate into a group which is easier for rotations for 360 flip
          const group = new THREE.Group()
          group.add(object3d)
          // group.add(new THREE.AxesHelper(1))
          group.position.copy(object3d.position)
          // group.rotation.copy(object3d.rotation)
          group.rotation.set(0, 0, 0)
          object3d.position.set(0, 0, 0)
          object3d.rotation.set(0, 0, 0)
          aHitObjects[index] = group
          scene.add(group)
          hitMesh.userData.instance = group
        }
      })
    }
  )

  initPostprocessing()
  addLights()
}

let material
let quad
  
let aHitObjects = []
let aHitMesh = []

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
    fragmentShader: config3d.shader.simpleSweep ? sweepFrag : coverFrag,
  })

  quad = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    material
  )

  postScene.add(quad)

  if (bDebugGUI) {
    const folder = gui.addFolder('SHADER')
    folder.add(config3d, "progress", 0, 1, 0.01).onChange((val)=>{
      // updateRendererAndShaderMaterial()
    })
    folder.add(config3d, 'showPostProcessing').onChange(() => {
      // updateRendererAndShaderMaterial()
    })
    folder.add(config3d.shader, 'simpleSweep').onChange(() => {
      material.fragmentShader = config3d.shader.simpleSweep ? sweepFrag : coverFrag
      material.needsUpdate = true
      // updateRendererAndShaderMaterial()
    })
  }
}

const updateRendererAndShaderMaterial = () => {
  // Render the first camera if progress is < 1
  if (config3d.progress < 1) {
    renderer.setRenderTarget(renderTarget1)
    renderer.render(scene, camera)
    material.uniforms.uTexture1.value = renderTarget1.texture
  }

  // Render the second camera only if progress is > 0
  if (config3d.progress > 0) {
    renderer.setRenderTarget(renderTarget2)
    renderer.render(scene, camera2)
    material.uniforms.uTexture2.value = renderTarget2.texture
  }

  renderer.setRenderTarget(null)

  renderTarget1.texture.format = THREE.RGBAFormat
  renderTarget2.texture.format = THREE.RGBAFormat

  material.uniforms.progress.value = config3d.progress
}

const render = (t) => {
  raf = requestAnimationFrame(render)

  uTime.value = t / 100
  // uLacMouse.value.set(mouse.x, mouse.y)
  updateRendererAndShaderMaterial()

  if (bDebugGUI && controls && controls.enabled) {
    controls.update()
    lightCameraHelper.update()
  }

  if (!bDebugGUI && animationStarted && introAnimationComplete) {
    updateCameraPosition()
    updateRaycaster()
  }

  // if (config3d.showPostProcessing)
    renderer.render(postScene, postCamera);
  // else
  //   renderer.render(scene, camera);

  // stats.update()
}

const addLights = () => {

  const { ambient } = config3d.light
  const ambientLight = new THREE.AmbientLight(ambient.color, ambient.intensity)
  scene.add(ambientLight)

  // Directional Light
  // https://stackoverflow.com/questions/65655433/why-is-three-js-cast-shadow-not-working-on-a-3d-model
  const { position, target, shadow, color, intensity } = config3d.light.directional
  
  const directionalLight = new THREE.DirectionalLight(color, intensity)
  directionalLight.position.set(position.x, position.y, position.z)  // default
  directionalLight.target.position.set(target.x, target.y, target.z)  // default
  directionalLight.castShadow = true

  directionalLight.name = 'light-direction'
  directionalLight.shadow.mapSize.width = shadow.width  // default
  directionalLight.shadow.mapSize.height = shadow.height  // default
  directionalLight.shadow.camera.near = shadow.near  // default
  directionalLight.shadow.camera.far = shadow.far  // default
  directionalLight.shadow.camera.top = shadow.top  // default
  directionalLight.shadow.camera.bottom = shadow.bottom  // default
  directionalLight.shadow.camera.left = shadow.left  // default
  directionalLight.shadow.camera.right = shadow.right  // default
  directionalLight.shadow.bias = shadow.bias
  directionalLight.shadow.blurSamples = shadow.blurSamples
  scene.add(directionalLight)
  scene.add(directionalLight.target)

  // Directional Light Camera Helper
  // const directionalLightCameraHelper = new CameraHelper(directionalLight.shadow.camera)
  // scene.add(directionalLightCameraHelper)

  // Directional Light Helper
  // const lightHelper = new DirectionalLightHelper(directionalLight, 5, 0xffff00)
  // scene.add( lightHelper )

  // const hemisphereLight = new THREE.HemisphereLight(0xf9fcc3, 0xa2a2a2) // Cast no shadows
  // hemisphereLight.position.set(0, 10, 0)
  // hemisphereLight.name = 'light-hemisphere'
  // scene.add( hemisphereLight )

  // Hemisphere Light Helper
  // const helper = new HemisphereLightHelper( hemisphereLight, 5 )
  // scene.add( helper )

  // Point Light
  // const light_point:PointLight = new PointLight(0xffffff, 8, 100, 1)
  // light_point.position.set(200, 78, 186)
  // light_point.intensity = 0.9
  // light_point.decay = 0
  // light_point.distance = 0
  // scene.add(light_point)

  if (bDebugGUI) {

    // Light Helpers
    const lightHelper = new THREE.DirectionalLightHelper(directionalLight, 5, 0xff0000);
    lightHelper.visible = config3d.light.helpers
    scene.add(lightHelper)

    lightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
    lightCameraHelper.visible = config3d.light.helpers
    scene.add(lightCameraHelper)

    const lightFolder = gui.addFolder('LIGHTS').close()

    // Show Helpers
    lightFolder.add(config3d.light, 'helpers').onChange(() => {
      lightHelper.visible = config3d.light.helpers
      lightCameraHelper.visible = config3d.light.helpers
    })

    // Ambient Light
    const ambientLightFolder = lightFolder.addFolder('AMBIENT').close()
    ambientLightFolder.add(ambientLight, 'visible')
    ambientLightFolder.addColor(ambient, 'color').onChange(() => {
      ambientLight.color = new THREE.Color(ambient.color)
    })
    ambientLightFolder.add(ambient, 'intensity', 0, 10, 0.0001).onChange(() => {
      ambientLight.intensity = ambient.intensity
    })

    // Directional Light
    const directionalFolder = lightFolder.addFolder('DIRECTIONAL').close()
    directionalFolder.add(directionalLight, 'visible')
    directionalFolder.addColor(config3d.light.directional, 'color').onChange(() => {
      directionalLight.color = new THREE.Color(config3d.light.directional.color)
      renderer.shadowMap.needsUpdate = true;
    })
    directionalFolder.add(config3d.light.directional, 'intensity', 0, 10, 0.1).onChange(() => {
      directionalLight.intensity = config3d.light.directional.intensity
      renderer.shadowMap.needsUpdate = true;
    })

    directionalFolder.add(directionalLight.position, 'x', -200, 200, 1.0).onChange(() => { onDirectionalLightChange() })
    directionalFolder.add(directionalLight.position, 'y', -200, 200, 1.0).onChange(() => { onDirectionalLightChange() })
    directionalFolder.add(directionalLight.position, 'z', -200, 200, 1.0).onChange(() => { onDirectionalLightChange() })
    
    directionalFolder.add(directionalLight.target.position, "x", -200, 200, 0.01).name('target x').onChange(() => { onDirectionalLightChange() })
    directionalFolder.add(directionalLight.target.position, "y", -200, 200, 0.01).name('target y').onChange(() => { onDirectionalLightChange() })
    directionalFolder.add(directionalLight.target.position, "z", -200, 200, 0.01).name('target z').onChange(() => { onDirectionalLightChange() })

    const lightShadowFolder = gui.addFolder('SHADOW').close()
    const onDirectionalLightChange = () => {
      directionalLight.shadow.camera.near = shadow.near
      directionalLight.shadow.camera.far = shadow.far
      directionalLight.shadow.camera.top = shadow.top
      directionalLight.shadow.camera.bottom = shadow.bottom
      directionalLight.shadow.camera.left = shadow.left
      directionalLight.shadow.camera.right = shadow.right
      directionalLight.shadow.bias = shadow.bias
      directionalLight.shadow.blurSamples = shadow.blurSamples
      
      directionalLight.shadow.camera.updateProjectionMatrix()
      lightCameraHelper.update()
      
      renderer.shadowMap.needsUpdate = true;
    }

    const lightTargetFolder = lightFolder.addFolder("LIGHT DIR. TARGET")
    lightTargetFolder.add(directionalLight.target.position, "x", -200, 200, 0.01).onChange(() => onDirectionalLightChange)
    lightTargetFolder.add(directionalLight.target.position, "y", -200, 200, 0.01).onChange(() => onDirectionalLightChange)
    lightTargetFolder.add(directionalLight.target.position, "z", -200, 200, 0.01).onChange(() => onDirectionalLightChange)

    const updateShadowMapSize = () => {
      directionalLight.shadow.mapSize.width = shadow.width
      directionalLight.shadow.mapSize.height = shadow.height
      directionalLight.shadow.map = null;
      renderer.shadowMap.needsUpdate = true;
    }
    lightShadowFolder.add(shadow, "width", [256, 512, 1024, 2048, 4096, 8192]).onChange(() => updateShadowMapSize())
    lightShadowFolder.add(shadow, "height", [256, 512, 1024, 2048, 4096, 8192]).onChange(() => updateShadowMapSize())
    lightShadowFolder.add(shadow, 'near', 0, 10, 0.1).onChange(() => { onDirectionalLightChange() })
    lightShadowFolder.add(shadow, 'far', 0, 150, 0.1).onChange(() => { onDirectionalLightChange() })
    lightShadowFolder.add(shadow, 'top', 0, 100, 0.1).onChange(() => { onDirectionalLightChange() })
    lightShadowFolder.add(shadow, 'right', 0, 100, 0.1).onChange(() => { onDirectionalLightChange() })
    lightShadowFolder.add(shadow, 'bottom', -100, 0, 0.1).onChange(() => { onDirectionalLightChange() })
    lightShadowFolder.add(shadow, 'left', -100, 0, 0.1).onChange(() => { onDirectionalLightChange() })
    lightShadowFolder.add(shadow, 'bias', -0.008, 0.008, 0.0001).onChange(() => { onDirectionalLightChange() })
    lightShadowFolder.add(shadow, 'blurSamples', 1, 25, 1).onChange(() => { onDirectionalLightChange() })


    // const hemisphereLightFolder = gui.addFolder("Light Hemisphere")
    // hemisphereLightFolder.add(hemisphereLight, "visible", false)
    // hemisphereLightFolder.add(hemisphereLight, "intensity", 0, 10, 0.0001)

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
      child.material.envMapIntensity = config3d.envMapIntensity
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
  width = window.innerWidth;
  height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  zoneHeight = scrollZone.value.offsetHeight
}

// NOTE: The component is never unMounted, so this is never called
// onUnmounted(() => {
//   if (renderer) {
//     renderer.dispose()
//   }

//   if (gui) {
//     gui.destroy()
//   }

//   window.removeEventListener('resize', resize)
//   window.cancelAnimationFrame(raf)
// })
</script>

<style lang="scss">
    .scene-container {
        width: 100vw;
        height: 100vh;
        position: fixed;
        top: 0;
        left: 0;
        z-index: $z-3d-scene-container;
        // display: none;
    }

    #three-canvas {
        // width: 100%;
        // height: 100%;
        // mix-blend-mode: screen; // MAYBE ADD THIS BACK IN ?
        opacity: 0;
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