
import GUI from 'lil-gui';
import { firstPassFs } from "../shaders/post-fx";

export default {
  data() {
    return {
      firstPassProps: {
        fragmentShader: firstPassFs,
        uniforms: {
          timer: {
            name: "uTimer",
            type: "1f",
            value: 0,
          },
          displacement: {
            name: "uDisplacement",
            type: "1f",
            value: 0.,
          },
          rgbShift: {
            name: "rgbShift",
            type: "1f",
            value: 0.1,
          },
          stretch: {
            name: "stretch",
            type: "1f",
            value: 0.06,
          },
          squish: {
            name: "squish",
            type: "1f",
            value: 0.06,
          },
          noiseFreq: {
            name: "noiseFreq",
            type: "1f",
            value: 2,
          },
        },
      },
    }
  },

  props: {
    scrollVelocity: {
      type: Number,
    },
  },

  mounted() {
    if(window.location.hash == '#config'){
      setTimeout(() => {
        this.gui = new GUI({container: document.querySelector('#config')}).title('Curtains').close()
      
        this.gui.add( this.shaderPass.uniforms.rgbShift, 'value').name('RGB Shift')
        .min(0.01)
        .max(1)

        this.gui.add( this.shaderPass.uniforms.stretch, 'value').name('Stretch')
        .min(0.01)
        .max(3)
        this.gui.add( this.shaderPass.uniforms.squish, 'value').name('Squish')
        .min(0.01)
        .max(3)
        this.gui.add( this.shaderPass.uniforms.noiseFreq, 'value').name('Noise Frequency')
        .min(0.01)
        .max(50)
      
      }, 1000);
    }
  },

  methods: {
    onRender(plane) {
      // update the uniform
      let planeDeformation = plane.uniforms.planeDeformation.value;
      plane.uniforms.planeDeformation.value = this.lerp(planeDeformation, this.scrollVelocity * 0.01, 0.2);
    },
    regularLerp(a, b, n) {
      return (1 - n) * a + n * b;
    },
    lerp(source, target, rate, frameDelta = 1/60, targetFps = 60){

      const relativeDelta = frameDelta / (1 / targetFps)
      const smoothing = 1 - rate

      return this.regularLerp(source, target, 1 - Math.pow(smoothing, relativeDelta));
    },
    // onFirstPassRender(shaderPass) {
    //   shaderPass.uniforms.timer.value++;
    //   let displacement = shaderPass.uniforms.displacement.value
    //   shaderPass.uniforms.displacement.value = this.lerp(displacement, this.scrollVelocity * 0.01, 0.2);
    // },  
    onFirstPassRender(shaderPass) {
      // let d = new Date()
      // shaderPass.uniforms.timer.value = d.getTime() / 1000;
      // shaderPass.uniforms.timer.value++;
      let displacement = shaderPass.uniforms.displacement.value
      shaderPass.uniforms.displacement.value = this.lerp(displacement, this.scrollVelocity * 0.01, 0.2);
    },
    onFirstPassReady(shaderPass) {
      this.shaderPass = shaderPass;
    }
  }
}