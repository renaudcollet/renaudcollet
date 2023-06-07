<template>
  <div>
    <canvas ref="myCanvas"></canvas>
    <span ref="overlay" class="overlay">
      <h3><a href="">Test 1</a></h3>
      <h3><a href="">Test 2</a></h3>
      <h3><a href="">Test 3</a></h3>
      <h3><a href="">Test 4</a></h3>
      <h3><a href="">Test 5</a></h3>
    </span>
  </div>
</template>

<script>
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  ShaderMaterial,
  Points,
  Color,
  Sprite,
  SpriteMaterial,
  Object3D,
  Mesh,
  Vector2,
  BufferAttribute,
  BufferGeometry,
  MeshBasicMaterial,
  SphereGeometry,
  Vector3,
  TextureLoader,
  MeshMatcapMaterial
} from "three";
import GUI from 'lil-gui'

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";


import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer.js";


import oilTexture from "~~/assets/oil_matcap.png";
import cubeModel from "~~/assets/heart.glb";

export default {
  setup() {
    return {};
  },

  mounted() {
    this.canvas = this.$refs.myCanvas;
    this.overlay = this.$refs.overlay;
    //init js
    this.scene = new Scene();
  
    this.camera = new PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new WebGLRenderer({ canvas: this.canvas });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.antialias = true;
    this.camera.position.z = 1.5;


    this.renderPass = new RenderPass(this.scene, this.camera);
    this.renderPass.renderPass = 0x000000
    this.bloomPass = new UnrealBloomPass(
      new Vector2(window.innerWidth, window.innerHeight),
      0.27,
      0.7,
      0.1
    );

    this.shaderPass = new ShaderPass({
      uniforms: {
        tDiffuse: { value: null },
        resolution: { value: new Vector2(window.innerWidth, window.innerHeight) },
        time: { value: 0 },
        vignette: { value: true },
        vignetteAmount: { value: 1 },
        grain: { value: true },
        grainAmount: { value: 0.2 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec2 resolution;
        uniform float time;
        uniform bool vignette;
        uniform float vignetteAmount;
        uniform bool grain;
        uniform float grainAmount;
        varying vec2 vUv;
        float random (vec2 st) {
            return fract(sin(dot(st.xy,
                                vec2(12.9898,78.233)))*
                43758.5453123);
        }
        void main() {
          vec2 uv = vUv;
          vec4 color = texture2D(tDiffuse, uv);
          uv -= 0.5;
          uv.x *= resolution.x / resolution.y;
          uv += 0.5;
          float d = distance(uv, vec2(0.5));
          float v =  mix(1., smoothstep(0.8, 0.2, d), vignetteAmount);
          color.rgb += uv.y*0.05 + 0.05;
          if(vignette == true)
            color.rgb *= vec3(v);
          if(grain == true)
            color.rgb *= 1. + random(uv + time) * grainAmount;

          gl_FragColor = vec4(color);
        }
      `,
    });

    this.effectComposer = new EffectComposer(this.renderer);
    this.effectComposer.addPass(this.renderPass);
    this.effectComposer.addPass(this.bloomPass);
    this.effectComposer.addPass(this.shaderPass);

    this.dots = []
    this.dotsContainer = new Object3D()
    this.dotsMaterial = new SpriteMaterial()
    this.dotsMaterial.transparent = true
    this.dotsMaterial.onBeforeCompile = (s) => {
      s.vertexShader = s.vertexShader.replace(
        '#include <uv_pars_vertex>',
        `varying vec2 vUv;
          uniform mat3 uvTransform;`
      )
      s.vertexShader = s.vertexShader.replace(
        '#include <uv_vertex>',
        'vUv = ( uvTransform * vec3( uv, 1 ) ).xy;'
      )
      s.fragmentShader = s.fragmentShader.replace(
        '#include <uv_pars_fragment>',
        'varying vec2 vUv;'
      )
      s.fragmentShader = s.fragmentShader.replace(
        'void main() {',
        `void main() {
          float d = distance(vUv, vec2(0.5));
          if(d > 0.5) discard;`
      )
      s.fragmentShader = s.fragmentShader.replace(
        'vec4 diffuseColor = vec4( diffuse, opacity );',
        `vec4 diffuseColor = vec4( diffuse, smoothstep(0.5,0.45, d) * opacity );`
      )

    }
    let overlayLength = this.overlay.children.length
    let amount = 16
    for (let i = 0; i < amount + overlayLength * 2; i++) {
      let d = new Sprite(this.dotsMaterial)
      let s = (i > amount ? 1.5 : 1) * Math.random() * 0.01 + 0.01
      d.scale.set(s, s, s)
      let x, y, z = 0
      if (i >= (amount + overlayLength)) {
        x = -this.dots[i - overlayLength].position.x
        y = -this.dots[i - overlayLength].position.y
        z = -this.dots[i - overlayLength].position.z
      }
      else {
        x = Math.random() * 2 - 1
        y = Math.random() * 2 - 1
        z = Math.random() * 2 - 1
        if (i >= amount) {
          y *= 0.5
        }
        let n = 1 / Math.sqrt(x * x + y * y + z * z)

        let r = Math.random() * 0.5 + 0.5
        x *= n * r
        y *= n * r
        z *= n * r
      }

      d.position.set(x, y, z)
      this.dots.push(d)
      this.dotsContainer.add(d)
    }
    for (let i = 0; i < overlayLength; i++) {
      let e1 = this.overlay.children[i]
      let e2 = e1.cloneNode(true)
      this.overlay.appendChild(e2)
    }
    this.scene.add(this.dotsContainer)
    this.mouseObject = new Mesh(new SphereGeometry(0.01, 32, 32), new MeshBasicMaterial({ color: 0xffffff}))
    this.mouseObject = new Sprite(new SpriteMaterial())
    this.mouseObject.scale.set(0.08, 0.08, 0.08)
    this.mouseObject.material.onBeforeCompile = (s) => {
      s.vertexShader = s.vertexShader.replace(
        '#include <uv_pars_vertex>',
        `varying vec2 vUv;`
      )
      s.vertexShader = s.vertexShader.replace(
        '#include <uv_vertex>',
        'vUv = uv;'
      )
      s.fragmentShader = s.fragmentShader.replace(
        '#include <uv_pars_fragment>',
        'varying vec2 vUv;'
      )
      s.fragmentShader = s.fragmentShader.replace(
        'void main() {',
        `void main() {
          float d = distance(vUv, vec2(0.5));
          if(d > 0.45 || d < 0.4) discard;`
      )
    }
    this.mouseObject = new Object3D()
    addEventListener('mousemove', this.onMouseMove.bind(this))
    this.scene.add(this.mouseObject)

    //init particles
    this.detail = 512
    this.gpuCompute = new GPUComputationRenderer(this.detail, this.detail, this.renderer);

    this.dtStartPosition = this.gpuCompute.createTexture();
    this.dtPosition = this.gpuCompute.createTexture();
    this.dtVelocity = this.gpuCompute.createTexture();

    let startPosArray = this.dtStartPosition.image.data;
    let posArray = this.dtPosition.image.data;
    let velArray = this.dtVelocity.image.data;

    for (let k = 0; k < posArray.length; k += 4) {
      let x = Math.random() * 2 - 1
      let y = Math.random() * 2 - 1
      let z = Math.random() * 2 - 1
      let d = Math.sqrt(x * x + y * y + z * z)
      d = Math.random() / d
      x *= d
      y *= d
      z *= d

      startPosArray[k + 0] = x
      startPosArray[k + 1] = y
      startPosArray[k + 2] = z
      startPosArray[k + 3] = Math.random()

      posArray[k + 0] = x
      posArray[k + 1] = y
      posArray[k + 2] = z
      posArray[k + 3] = Math.random()

      velArray[k + 0] = 0
      velArray[k + 1] = 0
      velArray[k + 2] = 0
      velArray[k + 3] = Math.random() * 2
    }

    this.startPositionVariable = this.gpuCompute.addVariable("textureStartPos", /*glsl*/`
      // precision highp float;
      // uniform float time;
      // uniform float scroll;
      // uniform sampler2D texturePosition;
      // uniform sampler2D textureStartPos;

      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec4 pos = texture2D(texturePosition, uv);
        vec4 startPos = texture2D(textureStartPos, uv);
        gl_FragColor = vec4(startPos.xyz, 0.0);
      }
    `, this.dtStartPosition);

    this.velocityVariable = this.gpuCompute.addVariable("textureVelocity", /*glsl*/`
      // precision highp float;
      uniform float time;
      uniform float delta;
      // uniform float scroll;
      // uniform sampler2D texturePosition;
      uniform vec3 dots[${this.dots.length}];
      uniform vec3 mouse;
      uniform vec3 mouseDelta;

      uniform float noiseFreq;
      uniform float noiseSpeed;
      uniform float noiseStrengthBase;
      uniform float noiseStrengthMass;
      uniform float dotsAttractionStrengthLimit;
      uniform float dotsAttractionDistanceMax;
      uniform float dotsAttractionDistanceMin;
      uniform float mousePhysicsDistanceMax;
      uniform float mousePhysicsDistanceMin;
      uniform float mousePhysicsStrength;
      uniform float mousePhysicsStrengthLimit;
      uniform float mouseFieldDistanceMax;
      uniform float mouseFieldDistanceMin;
      uniform float mouseFieldStrength;

      float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
      vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
      vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}

      float noise(vec3 p){
          vec3 a = floor(p);
          vec3 d = p - a;
          d = d * d * (3.0 - 2.0 * d);

          vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
          vec4 k1 = perm(b.xyxy);
          vec4 k2 = perm(k1.xyxy + b.zzww);

          vec4 c = k2 + a.zzzz;
          vec4 k3 = perm(c);
          vec4 k4 = perm(c + 1.0);

          vec4 o1 = fract(k3 * (1.0 / 41.0));
          vec4 o2 = fract(k4 * (1.0 / 41.0));

          vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
          vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

          return o4.y * d.y + o4.x * (1.0 - d.y);
      }

      vec3 noiseVec3( vec3 x ){
          float s  = noise(vec3( x ));
          float s1 = noise(vec3( x.y - 19.1 , x.z + 33.4 , x.x + 47.2 ));
          float s2 = noise(vec3( x.z + 74.2 , x.x - 124.5 , x.y + 99.4 ));
          vec3 c = vec3( s , s1 , s2 );
          return c;
      }

      
      vec3 curlNoise( vec3 p ){
          const float e = .1;
          vec3 dx = vec3( e   , 0.0 , 0.0 );
          vec3 dy = vec3( 0.0 , e   , 0.0 );
          vec3 dz = vec3( 0.0 , 0.0 , e   );

          vec3 p_x0 = noiseVec3( p - dx );
          vec3 p_x1 = noiseVec3( p + dx );
          vec3 p_y0 = noiseVec3( p - dy );
          vec3 p_y1 = noiseVec3( p + dy );
          vec3 p_z0 = noiseVec3( p - dz );
          vec3 p_z1 = noiseVec3( p + dz );

          float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
          float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
          float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;

          const float divisor = 1.0 / ( 2.0 * e );
          return normalize( vec3( x , y , z ) * divisor );
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec4 pos = texture2D(texturePosition, uv);
        vec4 startPos = texture2D(textureStartPos, uv);
        vec4 vel = texture2D(textureVelocity, uv);
        float d = distance(pos.xyz, startPos.xyz) * 1.;
        vec3 n = curlNoise(pos.xyz*noiseFreq + vec3(0., time * noiseSpeed, 0.));
        vel.xyz += (noiseStrengthBase + sqrt(vel.w) * noiseStrengthMass) * n / delta;
        
        for(int i = 0; i < ${this.dots.length}; i++){
          vec3 dot = dots[i];
          float dist = distance(pos.xyz, dot);
          float force = 1. / delta / (dist * dist);
          vec3 dir = normalize(dot - pos.xyz);
          vel.xyz += max(vec3(-dotsAttractionStrengthLimit), min(smoothstep(dotsAttractionDistanceMax, dotsAttractionDistanceMin, dist) * dir * force / delta, vec3(dotsAttractionStrengthLimit)));
        }
        float dist = distance(pos.xyz, mouse);
        float force = 1. / delta / sqrt(dist * dist);
        vec3 dir = max(vec3(-mousePhysicsStrengthLimit), min(mouseDelta, vec3(mousePhysicsStrengthLimit)));
        vel.xyz += smoothstep(mousePhysicsDistanceMax, mousePhysicsDistanceMin, dist) * mousePhysicsStrength * dir * force / delta;
        dir = normalize(mouse - pos.xyz);
        vel.xyz -= smoothstep(mouseFieldDistanceMax, mouseFieldDistanceMin, dist) * mouseFieldStrength * dir * force / delta;

        // vel.xyz = max(vec3(-1.), min(vel.xyz, vec3(1.)));
        vel.xyz *= 10. / delta;
        if(pos.w == 1.)
          vel.xyz = vec3(0.);
        gl_FragColor = vel;
      }
    `, this.dtVelocity);


    this.positionVariable = this.gpuCompute.addVariable("texturePosition", /*glsl*/`
      // precision highp float;
      uniform float time;
      uniform float delta;
      // uniform float scroll;
      // uniform sampler2D textureVelocity;
      uniform vec3 dots[${this.dots.length}];


      float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
            vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
            vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}

            float noise(vec3 p){
                vec3 a = floor(p);
                vec3 d = p - a;
                d = d * d * (3.0 - 2.0 * d);

                vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
                vec4 k1 = perm(b.xyxy);
                vec4 k2 = perm(k1.xyxy + b.zzww);

                vec4 c = k2 + a.zzzz;
                vec4 k3 = perm(c);
                vec4 k4 = perm(c + 1.0);

                vec4 o1 = fract(k3 * (1.0 / 41.0));
                vec4 o2 = fract(k4 * (1.0 / 41.0));

                vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
                vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

                return o4.y * d.y + o4.x * (1.0 - d.y);
            }

      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec4 vel = texture2D(textureVelocity, uv);
        vec4 pos = texture2D(texturePosition, uv);
        vec4 startPos = texture2D(textureStartPos, uv);
        pos.xyz += vel.xyz * (1. / delta);
        float n = noise(pos.xyz*5. - vec3(0., time*3., 0.));
        pos.w -= 0.01 * n * vel.w;
        for(int i = 0; i < ${this.dots.length}; i++){
          vec3 dot = dots[i];
          float dist = distance(pos.xyz, dot);
          if(dist < 0.01) {
            pos.xyz = startPos.xyz;
            pos.w = 1.;
          }
        }
        if(pos.w < 0. ){
          pos.xyz = startPos.xyz;
          pos.w = 1.;
        }
        pos.xyz = mix(pos.xyz, normalize(pos.xyz) * (0.8 + n * 0.1 - pos.w*0.1 - vel.w * 0.1), smoothstep(0., 0.2, pos.w));
        gl_FragColor = pos;
      }
    `, this.dtPosition);

    this.velocityVariable.material.uniforms.time = { value: 0.0 };
    this.positionVariable.material.uniforms.time = { value: 0.0 };
    this.velocityVariable.material.uniforms.delta = { value: 0.0 };
    this.positionVariable.material.uniforms.delta = { value: 0.0 };
    let dotsPosition = [];
    for(let i = 0; i < this.dots.length; i++){
      dotsPosition.push(this.dots[i].position);
    }
    this.velocityVariable.material.uniforms.noiseFreq = { value: 1.5};
    this.velocityVariable.material.uniforms.noiseSpeed = { value: 1.5};
    this.velocityVariable.material.uniforms.noiseStrengthBase = { value: 0.3};
    this.velocityVariable.material.uniforms.noiseStrengthMass = { value: 0.5};

    this.velocityVariable.material.uniforms.dotsAttractionStrengthLimit = { value: 0.03};
    this.velocityVariable.material.uniforms.dotsAttractionDistanceMax = { value: 0.8};
    this.velocityVariable.material.uniforms.dotsAttractionDistanceMin = { value: 0.5};

    this.velocityVariable.material.uniforms.mousePhysicsDistanceMax = { value: 0.3};
    this.velocityVariable.material.uniforms.mousePhysicsDistanceMin = { value: 0.1};
    this.velocityVariable.material.uniforms.mousePhysicsStrength = { value: 100};
    this.velocityVariable.material.uniforms.mousePhysicsStrengthLimit = { value: 0.4};

    this.velocityVariable.material.uniforms.mouseFieldDistanceMax = { value: 0.3};
    this.velocityVariable.material.uniforms.mouseFieldDistanceMin = { value: 0.1};
    this.velocityVariable.material.uniforms.mouseFieldStrength = { value: 10};
    
    this.velocityVariable.material.uniforms.dots = { value: dotsPosition };
    this.positionVariable.material.uniforms.dots = { value: dotsPosition };

    this.velocityVariable.material.uniforms.mouse = { value: this.mouseObject.position };
    this.positionVariable.material.uniforms.mouse = { value: this.mouseObject.position };

    this.velocityVariable.material.uniforms.mouseDelta = { value: new Vector3(0,0,0) };
    this.positionVariable.material.uniforms.mouseDelta = { value: new Vector3(0,0,0) };

    this.gpuCompute.setVariableDependencies(this.velocityVariable, [this.startPositionVariable, this.positionVariable, this.velocityVariable]);
    this.gpuCompute.setVariableDependencies(this.positionVariable, [this.startPositionVariable, this.positionVariable, this.velocityVariable]);
    this.gpuCompute.setVariableDependencies(this.startPositionVariable, [this.startPositionVariable, this.positionVariable, this.velocityVariable]);

    this.positionUniforms = this.positionVariable.material.uniforms;
    this.velocityUniforms = this.velocityVariable.material.uniforms;
    const error = this.gpuCompute.init();

    if (error !== null) {
      console.error(error);
    } else {
      console.warn(`GPGPU init 😎: ${this.detail * this.detail} particles`)
    }

    this.geometry = new BufferGeometry();
    
    const positions = new Float32Array(this.detail * this.detail * 3);
    let p = 0;

    for (let i = 0; i < this.detail * this.detail; i++) {
      let x = this.dtStartPosition.image.data[i * 4 + 0]
      let y = this.dtStartPosition.image.data[i * 4 + 1]
      let z = this.dtStartPosition.image.data[i * 4 + 2]
      positions[p++] = x
      positions[p++] = y
      positions[p++] = z
    }



    const uvs = new Float32Array(this.detail * this.detail * 2);
    p = 0;

    for (let j = 0; j < this.detail; j++) {

      for (let i = 0; i < this.detail; i++) {

        uvs[p++] = i / (this.detail - 1);
        uvs[p++] = j / (this.detail - 1);

      }
    }
    this.geometry.setAttribute('position', new BufferAttribute(this.dtStartPosition.image.data, 4));
    this.geometry.setAttribute('uv', new BufferAttribute(uvs, 2));

    this.material = new ShaderMaterial({
      transparent: true,
      uniforms: {
        textureStartPosition: { value: null },
        texturePosition: { value: null },
        textureVelocity: { value: null },
        time: { value: 0 },
        scroll: { value: 0 },
        color1: { value: new Color(0xff0000) },
        color2: { value: new Color(0x00ff00) },
        color3: { value: new Color(0x0000ff) },
        particleSizeBase: { value: 0.25 },
        particleSizeSpeed: { value: 1.5 },
        particleSizeMass: { value: 0.5 },
      },
      vertexShader: /*glsl*/`
        uniform float time;
        uniform float scroll;
        uniform sampler2D textureStartPosition;
        uniform sampler2D texturePosition;
        uniform sampler2D textureVelocity;
        uniform float particleSizeBase;
        uniform float particleSizeSpeed;
        uniform float particleSizeMass;
        varying vec2 vUv;
        varying vec3 vStartPos;
        varying vec3 vPos;
        varying vec3 vVel;
        varying float vLife;
        varying float vMass;
        void main() {
          vUv = uv;
          vec4 startPos = texture2D(textureStartPosition, uv);
          vec4 pos = texture2D(texturePosition, uv);
          vec4 vel = texture2D(textureVelocity, uv);
          vStartPos = startPos.xyz;
          vPos = pos.xyz;
          vVel = vel.xyz;
          vLife = pos.w;
          vMass = vel.w;
          vec4 mvPosition = modelViewMatrix * vec4(pos.xyz, 1.0);
          gl_PointSize = (particleSizeBase + length(vel.xyz) * particleSizeSpeed + vel.w * particleSizeMass) / - mvPosition.z;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: /*glsl*/`
        uniform float time;
        uniform float scroll;
        uniform sampler2D texturePosition;
        uniform sampler2D textureVelocity;
        uniform vec3 color1;
        uniform vec3 color2;
        uniform vec3 color3;

        varying vec2 vUv;
        varying vec3 vPos;
        varying vec3 vVel;
        varying float vLife;
        varying float vMass;

        void main() {
          vec2 uv = gl_PointCoord.xy;
          if (distance(uv, vec2(0.5)) > 0.5) discard;
          float d = length(vVel);
          vec3 v = normalize(vVel);
          vec3 color = vec3(0.);

          color = mix(color, color1, smoothstep(0.9, 0.6, vLife));
          color = mix(color, color2, smoothstep(0.7, 0.3, vLife));
          color = mix(color, color3, smoothstep(0.4, 0.1, vLife));  
          float alpha = min(length(vVel.xyz),2.);
          alpha *= sqrt(smoothstep(1., 0.9, vLife)) * sqrt(smoothstep(0., 0.2, vLife - vMass * 0.1));
          alpha += 0.04;
          alpha *= smoothstep( 0.3, 0.6, time*2. - vLife);
          color = mix(color, vec3(length(color)), min(scroll + length(vVel)*0.5, 1.));
          alpha = mix(alpha, alpha * 0.4, smoothstep(0.9, 1.2, scroll));

          gl_FragColor = vec4(color, alpha);
        }
      `,
    })
    this.material.extensions.drawBuffers = true;
    this.particles = new Points(this.geometry, this.material);
    this.particles.matrixAutoUpadte = false
    this.particles.updateMatrix()

    this.scene.add(this.particles);

    

    let loader = new TextureLoader()
    console.log(oilTexture)
    let texture = loader.load(oilTexture, 
    (t) => {console.log(t)}, 
    (e) => {console.error(e),
    (p) => {console.log(p)}
    })

    this.blobGeo = new SphereGeometry(0.9, 512, 512)
    let gltfLoader = new GLTFLoader()

    this.blobGeo.computeTangents()
    this.blobMat = new ShaderMaterial({
      side: 2,
      uniforms: {
        tex: { value: texture },
        time: { value: 0 },
        uSubdivision: { value: new Vector2(this.blobGeo.parameters.widthSegments, this.blobGeo.parameters.heightSegments)},
        mouse: { value: new Vector3(0, 0, 0)},
        mouseDelta: { value: new Vector3(0, 0, 0)},
        scroll: {value: 0},
        noiseSizeBase : {value: 0.4},
        noiseFreqBase : {value: 2},
        noiseFreqMouse : {value: 1},
        noiseSpeed : {value: 1},
        noiseAmpBase : {value: 0.25},
        noiseAmpMouse : {value: 0.2},
      },
      defines:
      {
          USE_TANGENT: '',

      },
      vertexShader: /*glsl*/`
        #define PI 3.1415926535897932384626433832795

        varying vec2 vUv;
        varying vec3 vColor;

        uniform sampler2D tex;
        uniform float time;
        uniform vec2 uSubdivision;
        uniform vec3 mouse;
        uniform vec3 mouseDelta;
        uniform float scroll;
        uniform float noiseSizeBase;
        uniform float noiseFreqBase;
        uniform float noiseFreqMouse;
        uniform float noiseSpeed;
        uniform float noiseAmpBase;
        uniform float noiseAmpMouse;

        float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
        vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
        vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}

        float noise(vec3 p){
            vec3 a = floor(p);
            vec3 d = p - a;
            d = d * d * (3.0 - 2.0 * d);

            vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
            vec4 k1 = perm(b.xyxy);
            vec4 k2 = perm(k1.xyxy + b.zzww);

            vec4 c = k2 + a.zzzz;
            vec4 k3 = perm(c);
            vec4 k4 = perm(c + 1.0);

            vec4 o1 = fract(k3 * (1.0 / 41.0));
            vec4 o2 = fract(k4 * (1.0 / 41.0));

            vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
            vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

            return o4.y * d.y + o4.x * (1.0 - d.y);
        }

        vec3 getDisplacedPosition(vec3 p) {
          float appear = sin(smoothstep(0.1, 0.8, time) * PI/2. * 1.2);
          float md = distance(p, mouse + mouseDelta*2.);

          float s = smoothstep(0.5  + length(mouseDelta)*1.5, 0., md) * (0.5 + length(mouseDelta) * 1.5);
          s *= (5. - appear * 4.);
          return p * (noiseSizeBase * (5. - appear * 4.) + noise(p * (3. - appear * 2.) * (noiseFreqBase - s * noiseFreqMouse) + time * noiseSpeed) * (s * noiseAmpBase + noiseAmpMouse)) * appear;
        }

        void main() {
          vec3 displacedPosition = position;
          displacedPosition = getDisplacedPosition(position);
          vec4 mvPosition = modelViewMatrix * vec4(displacedPosition, 1.0);
          gl_Position = projectionMatrix * mvPosition;

          // Bi tangents
          float distanceA = (PI * 2.0) / uSubdivision.x;
          float distanceB = PI / uSubdivision.x;

          vec3 biTangent = cross(normal, tangent.xyz);

          vec3 positionA = position + tangent.xyz * distanceA;
          vec3 displacedPositionA = getDisplacedPosition(positionA);

          vec3 positionB = position + biTangent.xyz * distanceB;
          vec3 displacedPositionB = getDisplacedPosition(positionB);

          vec3 computedNormal = cross(displacedPositionA - displacedPosition.xyz, displacedPositionB - displacedPosition.xyz);
          computedNormal = normalize(computedNormal);
          
          vec3 viewDir = normalize(displacedPosition.xyz - cameraPosition);
          vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
          vec3 y = cross( viewDir, x );
          vec2 uv = vec2( dot( x, computedNormal ), dot( y, computedNormal ) ) * 0.49 + 0.5; // 0.495 to remove artifacts caused by undersized matcap disks
          vColor = vec3(uv, 0.);
          vColor = texture2D( tex, uv ).rgb;
          vColor = mix(vColor, vec3(length(vColor)/8.), smoothstep(0.9, 1.2, scroll));
        }
      `,
      fragmentShader: /*glsl*/`
        varying vec3 vColor;

        void main() {
          gl_FragColor = vec4(vColor, 1.0);
        }
      `,
    })
    this.blob = new Mesh(this.blobGeo, this.blobMat)
    // this.scene.add(this.blob)
    

    gltfLoader.load(cubeModel, (s) => {
      this.cube = s.scene.children[0]
      this.cube.scale.set(8,8,8)
      // this.cube.material = new MeshBasicMaterial({color: 0x000000})
      this.cube.material = new MeshMatcapMaterial({ matcap: texture});
      this.scene.add(this.cube)
    })



    let orbitZone = document.createElement('span')

    orbitZone.style.position = 'absolute'
    orbitZone.style.top = '0'
    orbitZone.style.left = '0'
    orbitZone.style.width = '100vw'
    orbitZone.style.height = '100vh'
    orbitZone.style.zIndex = '100'
    document.body.appendChild(orbitZone)

    this.orbitControls = new OrbitControls(this.camera, orbitZone);
    this.orbitControls.enableDamping = true;
    this.orbitControls.dampingFactor = 0.1;
    this.orbitControls.enableZoom = false;
    this.orbitControls.enablePan = false;
    this.orbitControls.autoRotate = true;
    this.orbitControls.autoRotateSpeed = -0.4;
    this.orbitControls.maxPolarAngle = 5 * Math.PI / 6;
    this.orbitControls.minPolarAngle = 1 * Math.PI / 6;

    window.addEventListener("resize", this.onWindowResize, false);
    window.addEventListener('scroll', () => {
      this.material.uniforms.scroll.value = window.scrollY / window.innerHeight
      this.blob.material.uniforms.scroll.value = window.scrollY / window.innerHeight
    })
    this.material.uniforms.scroll.value = window.scrollY / window.innerHeight
    this.blob.material.uniforms.scroll.value = window.scrollY / window.innerHeight

    setTimeout(() => {
      if (window.location.hash == '#config') {
        this.guiParticles = new GUI({ container: document.querySelector('#config') }).title('Particles').close()

        this.guiParticles.addColor(this.material.uniforms.color1, 'value').name('Color 1')
        this.guiParticles.addColor(this.material.uniforms.color2, 'value').name('Color 2')
        this.guiParticles.addColor(this.material.uniforms.color3, 'value').name('Color 3')
        
        this.guiParticles.add(this.material.uniforms.particleSizeBase, 'value').name('Particle Size Base')
          .min(0)
          .max(5)
          .step(0.01)
        this.guiParticles.add(this.material.uniforms.particleSizeSpeed, 'value').name('Particle Size Speed')
          .min(0)
          .max(5)
          .step(0.01)
        this.guiParticles.add(this.material.uniforms.particleSizeMass, 'value').name('Particle Size Mass')
          .min(0)
          .max(5)
          .step(0.01)


        this.guiParticles.add(this.velocityVariable.material.uniforms.noiseFreq, 'value').name('Noise Frequency')
          .min(0)
          .max(10)
          .step(0.01)
        this.guiParticles.add(this.velocityVariable.material.uniforms.noiseSpeed, 'value').name('Noise Speed')
          .min(0)
          .max(10)
          .step(0.01)
        this.guiParticles.add(this.velocityVariable.material.uniforms.noiseStrengthBase, 'value').name('Noise Strength Base')
          .min(0)
          .max(10)
          .step(0.01)
        this.guiParticles.add(this.velocityVariable.material.uniforms.noiseStrengthMass, 'value').name('Noise Strength Mass')
          .min(0)
          .max(10)
          .step(0.01)
        this.guiParticles.add(this.velocityVariable.material.uniforms.dotsAttractionStrengthLimit, 'value').name('Dots Attraction Strength Limit')
          .min(0)
          .max(1)
          .step(0.001)
        this.guiParticles.add(this.velocityVariable.material.uniforms.dotsAttractionDistanceMin, 'value').name('Dots Attraction Distance Min')
          .min(0)
          .max(2)
          .step(0.01)
        this.guiParticles.add(this.velocityVariable.material.uniforms.dotsAttractionDistanceMax, 'value').name('Dots Attraction Distance Max')
          .min(0)
          .max(2)
          .step(0.01)
          
        this.guiParticles.add(this.velocityVariable.material.uniforms.mousePhysicsStrength, 'value').name('Mouse Physics Strength')
          .min(0)
          .max(200)
          .step(0.1)
        this.guiParticles.add(this.velocityVariable.material.uniforms.dotsAttractionDistanceMin, 'value').name('Dots Attraction Distance Min')
          .min(0)
          .max(2)
          .step(0.01)
        this.guiParticles.add(this.velocityVariable.material.uniforms.dotsAttractionDistanceMax, 'value').name('Dots Attraction Distance Max')
          .min(0)
          .max(2)
          .step(0.01)
        this.guiParticles.add(this.velocityVariable.material.uniforms.mousePhysicsStrength, 'value').name('Mouse Physics Strength')
          .min(0)
          .max(200)
          .step(0.1)
        this.guiParticles.add(this.velocityVariable.material.uniforms.mousePhysicsStrengthLimit, 'value').name('Mouse Physics Strength Limit')
          .min(0)
          .max(2)
          .step(0.01)
        this.guiParticles.add(this.velocityVariable.material.uniforms.mousePhysicsDistanceMin, 'value').name('Mouse Physics Distance Min')
          .min(0)
          .max(2)
          .step(0.01)
        this.guiParticles.add(this.velocityVariable.material.uniforms.mousePhysicsDistanceMax, 'value').name('Mouse Physics Distance Max')
          .min(0)
          .max(2)
          .step(0.01)
        this.guiParticles.add(this.velocityVariable.material.uniforms.mouseFieldDistanceMin, 'value').name('Mouse Field Distance Min')
          .min(0)
          .max(2)
          .step(0.01)
        this.guiParticles.add(this.velocityVariable.material.uniforms.mouseFieldDistanceMax, 'value').name('Mouse Field Distance Max')
          .min(0)
          .max(2)
          .step(0.01)
        this.guiParticles.add(this.velocityVariable.material.uniforms.mouseFieldStrength, 'value').name('Mouse Field Strength')
          .min(0)
          .max(50)
          .step(0.01)


        this.guiBlob = new GUI({ container: document.querySelector('#config') }).title('Blob').close()
        this.guiBlob.add(this.blob.material.uniforms.noiseSizeBase, 'value').name('Noise Size Base')
          .min(0)
          .max(5)
          .step(0.01)
        this.guiBlob.add(this.blob.material.uniforms.noiseFreqBase, 'value').name('Noise Frequency Base')
          .min(0)
          .max(50)
          .step(0.01)
        this.guiBlob.add(this.blob.material.uniforms.noiseSpeed, 'value').name('Noise Speed')
          .min(0)
          .max(5)
          .step(0.01)
        this.guiBlob.add(this.blob.material.uniforms.noiseFreqMouse, 'value').name('Noise Frequency Mouse')
          .min(-50)
          .max(50)
          .step(0.01)
        this.guiBlob.add(this.blob.material.uniforms.noiseAmpBase, 'value').name('Noise Amplitude Base')
          .min(0)
          .max(5)
          .step(0.01)
        this.guiBlob.add(this.blob.material.uniforms.noiseAmpMouse, 'value').name('Noise Amplitude Mouse')
          .min(-5)
          .max(5)
          .step(0.01)

        this.guiPostProcessing = new GUI({ container: document.querySelector('#config') }).title('Post Processing').close()
        this.guiPostProcessing.add(this.bloomPass, 'enabled').name('Bloom Enabled')
        this.guiPostProcessing.add(this.bloomPass, 'strength').name('Bloom Strength')
          .min(0)
          .max(5)
          .step(0.01)
        this.guiPostProcessing.add(this.bloomPass, 'radius').name('Bloom Radius')
          .min(0)
          .max(5)
          .step(0.01)
        this.guiPostProcessing.add(this.bloomPass, 'threshold').name('Bloom Threshold')
          .min(0)
          .max(1)
          .step(0.01)

          this.guiPostProcessing.add(this.shaderPass.uniforms.vignette, 'value').name('Vignette')
        this.guiPostProcessing.add(this.shaderPass.uniforms.vignetteAmount, 'value').name('Vignette Amount')
          .min(0)
          .max(1)
          .step(0.01)
        this.guiPostProcessing.add(this.shaderPass.uniforms.grain, 'value').name('Grain')
        this.guiPostProcessing.add(this.shaderPass.uniforms.grainAmount, 'value').name('Grain Amount')
          .min(0)
          .max(3)
          .step(0.01)
        

        
      }
    }, 1000)

    
    // this.start 
    this.now = Date.now()
    this.delta = 1000/60
    this.mousePos = new Vector2(0, 0)
    this.mouse = new Vector3(0, 0, 0)
    this.mouseDelta = new Vector3(0, 0, 0)
    this.origin = new Vector3(0, 0, 0)
    this.animate();

  },

  methods: {
    animate() {
      this.material.uniforms.time.value += 0.0003 * this.delta;
      this.velocityVariable.material.uniforms.time.value += 0.0003 * this.delta;
      this.positionVariable.material.uniforms.time.value += 0.0003 * this.delta;
      this.blob.material.uniforms.time.value += 0.0003 * this.delta;
      this.shaderPass.uniforms.time.value += 0.0003 * this.delta;
      this.velocityVariable.material.uniforms.delta.value = this.delta;
      this.positionVariable.material.uniforms.delta.value = this.delta;
      this.orbitControls.update();

      this.overlay.style.opacity = 1 - (window.scrollY / window.innerHeight) * 5;
      this.dotsMaterial.opacity = 1 - (window.scrollY / window.innerHeight) * 5;
      this.dotsContainer.position.y = (window.scrollY / window.innerHeight) * 2;
      for (let i = 0; i < this.overlay.children.length; i++) {
        let c = this.overlay.children[i]
        let p = this.dots[this.dots.length - 1 - i].position.clone()
        let d = p.distanceTo(this.camera.position)
        c.style.opacity = d > 2 ? 0 : 1
        let pos = this.getScreenPosition(p)
        c.style.transform = `translate3D(${pos.x}px, ${pos.y}px, 0) scale(${2 - Math.sqrt(d)})`
      }

      this.gpuCompute.compute();
      this.gpuCompute.getCurrentRenderTarget(this.velocityVariable).texture.generateMipmaps = true;
      this.gpuCompute.getCurrentRenderTarget(this.positionVariable).texture.generateMipmaps = true;
      this.material.uniforms['textureStartPosition'].value = this.gpuCompute.getCurrentRenderTarget(this.startPositionVariable).texture;
      this.material.uniforms['texturePosition'].value = this.gpuCompute.getCurrentRenderTarget(this.positionVariable).texture;
      this.material.uniforms['textureVelocity'].value = this.gpuCompute.getCurrentRenderTarget(this.velocityVariable).texture;
      this.effectComposer.render();

      let vector = new Vector3(this.mousePos.x, this.mousePos.y, 0.7 ).unproject( this.camera );
      let md = this.mouseDelta.clone()
      md.subVectors(vector, this.mouseObject.position)
      this.mouseDelta.lerp(md, 0.5)
      // this.mouseDelta.lerp(this.origin, 0.1)
      this.mouse.copy(vector)
      this.mouseObject.position.lerp(this.mouse, 0.15)

      this.velocityVariable.material.uniforms.mouse.value = this.mouseObject.position;
      this.positionVariable.material.uniforms.mouse.value = this.mouseObject.position;
      this.blob.material.uniforms.mouse.value = this.mouseObject.position;

      this.velocityVariable.material.uniforms.mouseDelta.value = this.mouseDelta;
      this.positionVariable.material.uniforms.mouseDelta.value = this.mouseDelta;
      this.blob.material.uniforms.mouseDelta.value = this.mouseDelta;
      
      this.blob.position.lerp(this.mouseDelta, 0.04)
      this.blob.position.lerp(this.origin, 0.08)
      
      this.delta = this.lerp(this.delta, -this.now + (this.now = Date.now()), 0.1);
      requestAnimationFrame(this.animate);
    },

    lerp(a, b, t) {
      return a + (b - a) * t
    },

    onWindowResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.effectComposer.setSize(window.innerWidth, window.innerHeight);
    },

    onMouseMove(e){
      let x = e.clientX / window.innerWidth * 2 - 1;
      let y = -e.clientY / window.innerHeight * 2 + 1;
      this.mousePos.set(x, y)
    },

    getScreenPosition(p) {
      p.project(this.camera)
      return {
        x: (p.x + 1) / 2 * window.innerWidth,
        y: (1 - p.y) / 2 * window.innerHeight
      }
    }
  },
};
</script>

<style scoped>
canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  /* mix-blend-mode: screen; */
}

.overlay>* {
  position: absolute;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 100000;
  width: 200px;
  margin: 1rem 0 0 -100px;
  text-align: center;
}

a {
  color: white;
  text-decoration: none;
}
</style>