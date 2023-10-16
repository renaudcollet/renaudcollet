<template>
    <div class="scene-container">
        <canvas id="three-canvas"></canvas>
    </div>
</template>

<script>
    import GUI from 'lil-gui';

    import * as THREE from 'three'

    import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
    import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

    import modelNature from '~/assets/3d/nature-scene.glb'

    export default {
        mounted () {
            this.init()
        },

        unmounted () {
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

        methods:{
            init(){
                this.debugGUI = window.location.hash === '#debug'

                this.config = {
                    cameraTarget: new THREE.Vector3(0, 0, 0),
                }

                this.canvas = document.querySelector('#three-canvas')
                this.scene = new THREE.Scene()
				this.scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );
                // this.scene.background = new Color(0xff0000);
                this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)
                this.camera.position.set(0, 3, 35)
                this.camera.lookAt(this.config.cameraTarget)
                this.renderer = new THREE.WebGLRenderer({canvas: this.canvas, antialias: true})
                this.renderer.outputColorSpace = THREE.SRGBColorSpace
                this.renderer.toneMapping = THREE.LinearToneMapping // ACESFilmicToneMapping
                this.renderer.setSize(window.innerWidth, window.innerHeight)
                this.renderer.setPixelRatio(window.devicePixelRatio)

                if (this.debugGUI) {
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
                    const onCameraTargetChange = () => {
                        console.log('onCameraTargetChange')
                        this.camera.lookAt(this.config.cameraTarget)
                    }
                    folder.add(this.config.cameraTarget, "x", -200, 200, 0.01).onChange(() => onCameraTargetChange)
                    folder.add(this.config.cameraTarget, "y", -200, 200, 0.01).onChange(() => onCameraTargetChange)
                    folder.add(this.config.cameraTarget, "z", -200, 200, 0.01).onChange(() => onCameraTargetChange)
                }

                const gltfLoader = new GLTFLoader()

                gltfLoader.load(
                    modelNature,
                    (gltf) => {
                        this.scene.add(gltf.scene)
                        gltf.scene.scale.set(1, 1, 1)
                        console.log('GlTF loaded and added to scene.');
                    }
                )

                this.addLights()

                this.controls = new OrbitControls( this.camera, this.renderer.domElement );
                this.controls.update();

                window.addEventListener('resize', this.setSize)
                
                this.appear = 0
                this.scroll = window.scrollY / window.innerHeight
                this.raf = requestAnimationFrame(this.animate)

                
            },

            addLights() {
                // LIGHTS
                const hemisphereLight = new THREE.HemisphereLight( 0xf9fcc3, 0xa2a2a2 ) // Cast no shadows
                hemisphereLight.position.set( 0, 10, 0 )
                hemisphereLight.name = 'light-hemisphere'
                // this.scene.add( hemisphereLight )
                
                // Hemisphere Light Helper
                // const helper = new HemisphereLightHelper( hemisphereLight, 5 )
                // this.scene.add( helper )

                const ambientLight = new THREE.AmbientLight(0xffffff, 2)
                this.scene.add(ambientLight)

                // Directional Light
                // See this https://stackoverflow.com/questions/65655433/why-is-three-js-cast-shadow-not-working-on-a-3d-model
                const directionalLight = new THREE.DirectionalLight(0xffffff, 5)
                directionalLight.position.set( 101, 35, 9 )
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
                
                this.scene.add( directionalLight )
                this.scene.add( directionalLight.target )

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

                if (this.debugGUI) {
                const hemisphereLightFolder = this.gui.addFolder("Light Hemisphere")
                hemisphereLightFolder.add(hemisphereLight, "visible", false)
                hemisphereLightFolder.add(hemisphereLight, "intensity", 0, 10, 0.0001)

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

            animate(t){
                this.controls.update();
	            this.renderer.render( this.scene, this.camera );
                this.raf = requestAnimationFrame(this.animate)
            },
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