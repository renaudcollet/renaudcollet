import GUI from 'lil-gui';
import { firstPassFs } from "../shaders/post-fx";

export default function useCurtainsShader() {

  const firstPassProps = {
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
        value: 0.0, // 0.06
      },
      squish: {
        name: "squish",
        type: "1f",
        value: 0.0, // 0.06
      },
      noiseFreq: {
        name: "noiseFreq",
        type: "1f",
        value: 0.0, // 2
      },
    },
  }

  let scrollVelocity = 0;
  let shaderPass = null;
  let gui = null;

  const onRender = (plane) => {
    let planeDeformation = plane.uniforms.planeDeformation.value;
    plane.uniforms.planeDeformation.value = lerp(planeDeformation, scrollVelocity * 0.01, 0.2);
  }

  const regularLerp = (a, b, n) => {
    return (1 - n) * a + n * b;
  }

  const lerp = (source, target, rate, frameDelta = 1/60, targetFps = 60) => {      
    const relativeDelta = frameDelta / (1 / targetFps)
    const smoothing = 1 - rate
    return regularLerp(source, target, 1 - Math.pow(smoothing, relativeDelta));
  }

  const onFirstPassRender = (shaderPass) => {
    // let d = new Date()
    // shaderPass.uniforms.timer.value = d.getTime() / 1000;
    // shaderPass.uniforms.timer.value++;
    let displacement = shaderPass.uniforms.displacement.value
    shaderPass.uniforms.displacement.value = lerp(displacement, scrollVelocity * 0.01, 0.2);
    // console.log('onFirstPassRender', scrollVelocity);
  }

  const onFirstPassReady = (shaderPass) => {
    shaderPass = shaderPass;
    // console.log('onFirstPassReady', shaderPass);

  if(window.location.hash == '#config'){
    setTimeout(() => {
      gui = new GUI({container: document.querySelector('#config')}).title('Curtains').close()
    
      gui.add( shaderPass.uniforms.rgbShift, 'value').name('RGB Shift')
      .min(0.01)
      .max(1)

      gui.add( shaderPass.uniforms.stretch, 'value').name('Stretch')
      .min(0.01)
      .max(3)
      gui.add( shaderPass.uniforms.squish, 'value').name('Squish')
      .min(0.01)
      .max(3)
      gui.add( shaderPass.uniforms.noiseFreq, 'value').name('Noise Frequency')
      .min(0.01)
      .max(50)
    
    }, 1000);
  }
  }

  const updateScrollVelocity = (velocity) => {
    scrollVelocity = velocity;
  }

  return {
    firstPassProps,
    updateScrollVelocity,
    onRender,
    onFirstPassRender,
    onFirstPassReady,
  }
}