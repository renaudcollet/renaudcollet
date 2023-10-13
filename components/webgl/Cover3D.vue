<template>
    <div class="scene-container">
        <canvas id="three-canvas"></canvas>
    </div>
</template>

<script>
    import {
        Scene,
        PerspectiveCamera,
        WebGLRenderer,
        Color,
        AmbientLight,
        DirectionalLight,
        sRGBEncoding,
        LinearToneMapping
    } from 'three'

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
            
            document.removeEventListener('mouseup', this.onMouseUp)
            document.removeEventListener('touchend', this.onTouchEnd)
            window.removeEventListener('resize', this.setSize)
            
            window.cancelAnimationFrame(this.raf)
        },

        methods:{
            init(){
                this.canvas = document.querySelector('#three-canvas')
                this.scene = new Scene()
                // this.scene.background = new Color(0xff0000);
                this.camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)
                this.camera.position.set(0, 3, 35)
                this.camera.lookAt(0, 0, 0)
                this.renderer = new WebGLRenderer({canvas: this.canvas, antialias: true})
                this.renderer.outputEncoding = sRGBEncoding
                this.renderer.physicallyCorrectLights = true
                this.renderer.toneMapping = LinearToneMapping // ACESFilmicToneMapping
                this.renderer.setPixelRatio(window.devicePixelRatio)

                this.screenRatio = window.innerWidth / window.innerHeight

                const gltfLoader = new GLTFLoader()

                gltfLoader.load(
                    modelNature,
                    (gltf) => {
                        this.scene.add(gltf.scene)
                        gltf.scene.scale.set(1, 1, 1)
                        console.log('GlTF loaded and added to scene.');
                    }
                )

                this.ambiantLight = new AmbientLight(0xffffff, 0.5);
                this.directionalLight = new DirectionalLight(0xffffff, 1);
                this.scene.add(this.directionalLight);

                this.controls = new OrbitControls( this.camera, this.renderer.domElement );
                this.controls.update();

                window.addEventListener('resize', this.setSize)
                
                this.appear = 0
                this.scroll = window.scrollY / window.innerHeight
                this.raf = requestAnimationFrame(this.animate)
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