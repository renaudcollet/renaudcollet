<template>
    <div>
        <div id="lv-guide" ref="lvGuide"></div>
        <div class="scene-container">
            <canvas id="three-canvas"></canvas>
        </div>
        <span id="scene-controls"></span>
        <img :style="{'display': showScrollArrow ? 'block' : 'none'}" id="scroll-cta" src="~~/assets/svg/scroll.svg" width="50px" height="50px" alt="">
    </div>
</template>

<script>
    import {
        Scene,
        PerspectiveCamera,
        WebGLRenderer,
        InstancedMesh,
        MeshMatcapMaterial,
        Object3D,
        BoxGeometry,
        DynamicDrawUsage,
        Mesh,
        MeshBasicMaterial,
        Raycaster,
        Vector2,
        Vector3,
        Quaternion,
        // Matrix4
    } from 'three'

    import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
    import { TextureLoader } from 'three/src/loaders/TextureLoader.js'

    import cubeModel from '~/assets/cube.glb'
    import cubeSimpleModel from '~/assets/cube_simple.glb'
    import heartModel from '~/assets/heart.glb'

    import matcapTexture1 from '~/assets/textures/matcap_8.jpg'
    // import matcapTexture2 from '~/assets/textures/matcap_10.jpg'
    import matcapTexture2 from '~/assets/textures/matcap_14.jpg'

    import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
    import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
    // import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
    import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js'
    import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
    // import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
    // import { SAOPass } from 'three/examples/jsm/postprocessing/SAOPass.js'

    export default {
        props: {
            position: {
                type: String,
                default: 'center'
            },
            showScrollArrow: {
                type: Boolean,
                default: true
            }
        },

        mounted () {
            this.init()
        },

        unmounted () {
            if (this.renderer) {
                this.renderer.dispose()
            }
            
            if (this.effectComposer) {
                this.effectComposer.dispose()
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

        watch: {
            position (val) {
                if(!this.camera) return
                this.setCameraPosition(val)
            }
        },

        methods:{
            init(){
                this.lvGuide = this.$refs.lvGuide
                this.canvas = document.querySelector('#three-canvas')
                this.scrollCta = document.querySelector('#scroll-cta')
                this.scene = new Scene()
                this.camera = new PerspectiveCamera(15, window.innerWidth / window.innerHeight, 0.1, 1000)
                this.cameraPositionTarget = new Vector3()
                this.setCameraPosition(this.position)
                this.camera.position.copy(this.cameraPositionTarget)
                this.renderer = new WebGLRenderer({canvas: this.canvas, antialias: true})
                // this.renderer.setPixelRatio(window.devicePixelRatio)

                this.screenRatio = window.innerWidth / window.innerHeight

                this.effectComposer = new EffectComposer(this.renderer)
                // this.bloomPass = new UnrealBloomPass(new Vector2(window.innerWidth, window.innerHeight), 0.5, 0.4, 0.8)
                
                this.bokehPass = new BokehPass(this.scene, this.camera, {
                    focus: 11,
                    aperture: 0.002,
                    maxblur: 0.01,
                    width: window.innerWidth,
                    height: window.innerHeight
                })

                this.shaderPass = new ShaderPass({
                    uniforms: {
                        tDiffuse: { value: null },
                        time: { value: 0. },
                        resolution: { value: new Vector2(window.innerWidth, window.innerHeight) },
                        scroll: { value: 0. }
                    },
                    vertexShader: `
                        varying vec2 vUv;
                        void main() {
                            vUv = uv;
                            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                        }
                    `,
                    fragmentShader: `
                        uniform sampler2D tDiffuse;
                        uniform float time;
                        uniform vec2 resolution;
                        uniform float scroll;
                        varying vec2 vUv;
                        void main() {
                            vec3 color = vec3(0.);

                            color += 0.09 + vUv.y*0.04;
                            float d = distance(vUv, vec2(0.5));
                            float v = smoothstep(0.8, 0.2, d);
                            vec3 tex = texture2D(tDiffuse, vUv).rgb;
                            vec2 st = vUv;
                            st -= 0.5;
                            st.x *= resolution.x / resolution.y;
                            st += 0.5;
                            d = distance(st, vec2(0.5));
                            color += vec3(188., 26., 77.)/255. * smoothstep(0.8, 0., d) * 0.2;
                            color =  mix(color, tex.rgb, smoothstep(0.01, 0.1, length(tex)) ).rgb;
                            color *= v;
                            color *= 1. + (1. - d) * 0.3;
                            color = mix(color,vec3(length(color)/5.), smoothstep(0.5, 1., scroll));
                            gl_FragColor = vec4(color, 1.);
                        }
                    `
                })
                // this.saoPass = new SAOPass(this.scene, this.camera)
                // this.saoPass.params.saoBias = 1
                // this.saoPass.params.saoIntensity = 0.01
                // this.saoPass.params.saoScale = 16
                // this.saoPass.params.saoKernelRadius = 100
                // this.saoPass.params.saoMinResolution = 0
                // this.saoPass.params.saoBlur = true
                // this.saoPass.params.saoBlurRadius = 16
                // this.saoPass.params.saoBlurStdDev = 4
                // this.saoPass.params.saoBlurDepthCutoff = 0.01       
                
                // this.fxaaPass = new ShaderPass(FXAAShader)
                // this.fxaaPass.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight)

                this.effectComposer.addPass(new RenderPass(this.scene, this.camera))
                
                this.effectComposer.addPass(this.shaderPass)
                if(!this.isMobile()){
                    // this.effectComposer.addPass(this.fxaaPass)
                    // this.effectComposer.addPass(this.bloomPass)
                    // this.effectComposer.addPass(this.shaderPass)
                    // this.effectComposer.addPass(this.saoPass)
                    this.effectComposer.addPass(this.bokehPass)
                }

                this.dummy = new Object3D()

                const textureLoader = new TextureLoader()
                const matcap1 = textureLoader.load(matcapTexture1)
                const matcap2 = textureLoader.load(matcapTexture2)

                const gltfLoader = new GLTFLoader()
                this.heartGhost = new Mesh()

                gltfLoader.load(
                    heartModel,
                    (gltf) => {
                        let heartGeo = gltf.scene.children[0].geometry.clone()

                        this.positions = heartGeo.attributes.position
                        
                        // remove half of the positions
                        let positions = this.positions.array
                        let newPositions = []
                        let amountMultiplier = this.isMobile() ? 2 : 3
                        for(let j = 0; j < amountMultiplier; j++){
                            for(let i = 0; i < positions.length; i+=3){
                                let depth = j/amountMultiplier
                                if(Math.random() > 0.){
                                    newPositions.push(positions[i+0] * (1 - depth * 0.3) + (depth) * (Math.random() - 0.5) * 0.1)
                                    newPositions.push(positions[i+1] * (1 - depth * 0.3) + (depth) * (Math.random() - 0.5) * 0.1)
                                    newPositions.push(positions[i+2] * (1 - depth * 0.3) + (depth) * (Math.random() - 0.5) * 0.1)
                                }
                            }
                        }

                        this.positions.array = newPositions
                        
                        this.heart = new InstancedMesh(
                            new BoxGeometry(0.1, 0.1, 0.1),
                            new MeshMatcapMaterial({matcap: matcap1}),
                            this.positions.count * amountMultiplier
                        )
                        
                        gltfLoader.load(
                            cubeSimpleModel,
                            (gltf) => {
                                this.heart.geometry = gltf.scene.children[0].geometry.clone()
                            }
                        )
                        this.heartGhost.geometry = gltf.scene.children[0].geometry.clone(),
                        this.heartGhost.material = new MeshBasicMaterial({visible: false})
                        
                        this.heartGhost.rotateZ(-Math.PI/2)

                        this.heart.instanceMatrix.setUsage(DynamicDrawUsage)
                        this.scene.add(this.heart, this.heartGhost)
                        this.updateTransform(0)
                        this.heart.scale.set(2.3,2.3,2.3)
                        let heartGhostScale = this.isMobile() ? 5 : 1.9
                        this.heartGhost.scale.set(heartGhostScale, heartGhostScale, heartGhostScale)
                    }
                )
                gltfLoader.load(
                    cubeModel,
                    (gltf) => {
                        this.cube = gltf.scene.children[0]
                        this.cube.material = new MeshMatcapMaterial({matcap: matcap1})
                        this.cube.scale.set(10, 10, 10)
                        this.cube.rotation.x = 0.5
                        this.scene.add(this.cube)
                    }
                )

                this.controlElem = document.querySelector('#scene-controls')

                this.raycaster = new Raycaster()
                this.mouse = new Vector2()
                this.prevMouse = new Vector2()
                this.mouse.x = 0
                this.mouse.y = 0
                this.intersection = new Vector3()
                this.intersectionTarget = new Vector3()
                this.origin = new Vector3(0, 0, 0)
                this.identity = new Quaternion()
                this.heartLookAt = new Vector3(0, 0, 0)

                this.controlElem.addEventListener('mousedown', this.onMouseDown)
                document.addEventListener('mouseup', this.onMouseUp)

                this.controlElem.addEventListener('touchstart', this.onMouseDown)
                document.addEventListener('touchend', this.onTouchEnd)

                this.controlCube = new Object3D()
                this.controlCube.rotation.x = Math.PI/2
                this.controlHeart = new Object3D()


                this.forward = new Vector3(1, 0, 0)
                this.up = new Vector3(0, 1, 0)

                this.rotateSpeed = 0
                this.controlElem.addEventListener('pointermove', this.onPointerMove, { passive: false })

                this.setSize()
                window.addEventListener('resize', this.setSize)
                
                this.appear = 0
                this.scroll = window.scrollY / window.innerHeight
                this.raf = requestAnimationFrame(this.animate)
            },

            setCameraPosition(val){
                let x, y, z = 0

                switch(val) {
                    case 'left':
                        x = this.isMobile() ? 0 : 2.5
                        y = this.isMobile() ? -2 : 0
                        z = this.isMobile() ? 20 : 14
                        break
                    default:
                        x = 0
                        y = this.isMobile() ? -0.6 : 0
                        z = this.isMobile() ? 20 : 12
                }
                this.cameraPositionTarget.set(x, y, z)
            },

            onMouseDown(){
                this.mousedown = true
            },
            
            onMouseUp(){
                this.mousedown = false
            },

            onTouchEnd(){
                this.mousedown = false
                this.intersectionTarget.set(0,0,0)
            },

            onPointerMove(e){
                e.preventDefault();
                e.stopPropagation();
                this.prevMouse.x = this.mouse.x
                this.prevMouse.y = this.mouse.y
                // console.log('pointer moving', (e.clientX / window.innerWidth) * 2 - 1)
                if(this.appear < 0.8 ) return
                this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1
                this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
                this.raycaster.setFromCamera(this.mouse, this.camera)
                let intersects = this.raycaster.intersectObject(this.heartGhost)
                let intersecting = intersects.length > 0
                if(intersecting){
                    this.intersectionTarget = intersects[0].point
                }else{
                    this.intersectionTarget.set(0,0,0)
                }

                if(this.mousedown){
                    let deltaX, deltaY = 0
                    if(e.movementX || e.movementY){
                        deltaX = e.movementX
                        deltaY = e.movementY
                    } else {
                        deltaX = (this.mouse.x - this.prevMouse.x) * 100
                        deltaY = -(this.mouse.y - this.prevMouse.y) * 100
                    }
                    
                    this.controlCube.rotateOnWorldAxis(this.up, deltaX * this.rotateSpeed)
                    this.controlCube.rotateOnWorldAxis(this.forward, deltaY * this.rotateSpeed)
                    this.controlHeart.rotateOnWorldAxis(this.up, deltaX * this.rotateSpeed)
                    this.controlHeart.rotateOnWorldAxis(this.forward, deltaY * this.rotateSpeed)
                }
            },

            isMobile() {
                return window.matchMedia("(pointer:coarse)").matches || window.innerWidth < 769 || window.innerHeight > window.innerWidth
            },

            setSize(){
                let w = window.innerWidth
                let h = this.lvGuide.offsetHeight
                this.renderer.setSize(w, h)
                this.canvas.style.width = '100vw'
                this.canvas.style.height = '100vh'
                this.effectComposer.setSize(w, h)

                this.bokehPass.uniforms[ 'aspect' ].value = w / h
                this.shaderPass.uniforms[ 'resolution' ].value = new Vector2(w, h)

                this.camera.aspect = w / h
                this.camera.updateProjectionMatrix()
                this.screenRatio = w / h
                let scale =  Math.min(1, Math.sqrt(this.screenRatio * 0.8))
                this.scene.scale.set(scale, scale, scale)
                this.setCameraPosition(this.position)
            },

            updateTransform(t, scroll){
                for(let i = 0; i < this.heart.count; i++){
                    let x = this.positions.getY(i)
                    let y = -this.positions.getX(i)
                    let z = this.positions.getZ(i)
                    let p = new Vector3(x,y,z)
                    let d = 1.5 - p.distanceTo(this.intersection)*(this.isMobile() ? 0.3 : 0.5 )
                    d = d * d
                    d *= this.intersection.distanceTo(this.origin)
                    d *= 2
                    d += this.smoothstep(0.3, 0.8, scroll)*3.
                    let xR = x * 1000 + t * 0.00015
                    let yR = y * 1000 + t * 0.0001
                    let zR = z * 1000 + t * 0.00012
                    d += this.getBeat(t * 0.01) * 0.0002 * zR

                    this.dummy.position.set(
                        this.positions.getY(i) * (1 + d),
                        -this.positions.getX(i) * (1 + d),
                        this.positions.getZ(i) * (1 + d)
                    )

                    this.dummy.rotation.set(
                        xR,
                        yR,
                        zR
                    )

                    let s = 0.3 + ((Math.abs(x)*Math.abs(y)*Math.abs(z)*1000)%1) * 0.5
                    s *= 0.03 * (1 + d * 0.1)
                    s *= this.easeOut(this.smoothstep(0.1, 0.4, this.appear))
                    this.dummy.scale.set(
                        s,s,s
                    )

                    this.dummy.updateMatrix()
                    this.heart.setMatrixAt(i, this.dummy.matrix)
                }
				this.heart.instanceMatrix.needsUpdate = true;
            },

            animate(t){
                this.appear += 0.01;
                let deltaT = t - this.shaderPass.material.uniforms.time.value
                this.rotateSpeed = (this.isMobile() ? 0.02 : 0.01) * deltaT / 30
                this.shaderPass.material.uniforms.time.value = t
                this.intersection.lerp(this.intersectionTarget, 0.1)
                this.camera.position.lerp(this.cameraPositionTarget, 0.1)
                let d = this.intersection.distanceTo(this.origin) * (this.isMobile() ? 0.3 : 1 )
                this.scroll = this.lerp(this.scroll, window.scrollY / window.innerHeight, 0.1);
                let s = this.smoothstep(0.3, 0.8, this.scroll)
                if(this.isMobile())
                    this.canvas.style.filter = `grayscale(${s}) brightness(${0.333 + 0.667 * (1-s)})`
                    
                if(this.scroll < 1)
                    this.scrollCta.style.opacity = this.smoothstep(0.3, 0.1, this.scroll) * this.smoothstep(4, 4.1, this.appear)
                this.bokehPass.uniforms.aperture.value = this.lerp(0.002, 0.006, d + s)
                this.bokehPass.uniforms.maxblur.value = this.lerp(0., 0.01, d + s)
                this.bokehPass.uniforms.focus.value = this.lerp(12, 11, d + s)
                // this.bloomPass.strength = this.lerp(0.3, 0.5, d + s)
                // this.bloomPass.radius = this.lerp(0.4, 0.8, d + s)
                this.shaderPass.material.uniforms.scroll.value = this.scroll
                if(this.cube){
                    this.controlCube.rotation.z += 0.0025
                    this.controlCube.rotation.y -= 0.002
                    this.cube.scale.set( 
                        (10 + d*8) * this.smoothstep(0.8, 0.5, s) * this.easeOut(this.smoothstep(0.2, 0.3, this.appear)),
                        (10 + d*8) * this.smoothstep(0.8, 0.5, s) * this.easeOut(this.smoothstep(0.2, 0.3, this.appear)),
                        (10 + d*8) * this.smoothstep(0.8, 0.5, s) * this.easeOut(this.smoothstep(0.2, 0.3, this.appear)),
                    )
                    this.cube.quaternion.slerp(this.controlCube.quaternion, 0.1)
                }
                if(this.heart){
                    this.updateTransform(t, this.scroll)
                    this.heart.scale.set(
                        2.3 * this.easeOut(this.smoothstep(0.1, 0.4, this.appear)),
                        2.3 * this.easeOut(this.smoothstep(0.1, 0.4, this.appear)),
                        2.3 * this.easeOut(this.smoothstep(0.1, 0.4, this.appear)),
                    )
                    if(this.intersectionTarget.equals(this.origin)){
                        this.controlHeart.quaternion.slerp(this.identity, 0.5)
                    }
                    this.heart.quaternion.slerp(this.controlHeart.quaternion, 0.1)
                }
                

                this.effectComposer.render()
                    
                this.raf = requestAnimationFrame(this.animate)
            },

            smoothstep (min, max, value) {
                var x = Math.max(0, Math.min(1, (value-min)/(max-min)));
                return x*x*(3 - 2*x);
            },

            lerp(a, b, n) {
                return (1 - n) * a + n * b;
            },

            getBeat(t){
                let f1 = Math.sin(t) / 2 + 0.5
                let f2 = Math.sin(t + Math.PI * 0.7) / 2 + 0.5
                let f3 = Math.sin((t)/2 + 1.35) /2. + 0.5
                let f4 = this.smoothstep(0.4, 0.7, f3)
                let f5 = Math.max(f1, f2) * f4
                return f5
            },
            
            easeOut(t) {
                return t * (2 - t);
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