export const vertexShader = `
  precision highp float;
  
  #define PI 3.14159265

  // default mandatory variables
  attribute vec3 aVertexPosition;
  attribute vec2 aTextureCoord;

  varying float yPos;

  uniform mat4 uMVMatrix;
  uniform mat4 uPMatrix;

  uniform mat4 uTextureMatrix;

  // custom variables
  varying vec3 vVertexPosition;
  varying vec2 vTextureCoord;

  uniform float uPlaneDeformation;
  uniform float hovered;
  uniform float uZPos;
  uniform float isText;

  void main() {
    vec3 vertexPosition = aVertexPosition;
    // cool effect on scroll
    // vertexPosition.y += cos(vertexPosition.x*PI/2.) * uPlaneDeformation * 0.08;

    vertexPosition.x *= 1. - abs(uPlaneDeformation) * 0.15;
    vertexPosition.y *= 1. + abs(uPlaneDeformation) * 0.15;

    // parallax effect
    vertexPosition.z -= uZPos;

    vec4 finalPos = uPMatrix * uMVMatrix * vec4(vertexPosition, 1.0);
    // finalPos.y += sin(finalPos.y);
    gl_Position = finalPos;
    // varyings
    vVertexPosition = vertexPosition;
    vTextureCoord = aTextureCoord;
    yPos = gl_Position.y;
  }
`;



export const fragmentShader = `
  precision highp float;

  varying vec3 vVertexPosition;
  varying vec2 vTextureCoord;
  varying float yPos;
  
  uniform sampler2D uTexture;
  uniform vec2 uResolution;
  uniform float uNeedsRatio;
  uniform float uRatio;
  uniform float uNaturalRatio;
  uniform float hovered;
  uniform float isText;
  uniform float uScale;

  void main() {
    vec2 uv = vTextureCoord;

    float rect1 = step(distance(uv.x, 0.5), 0.5) * step(distance(uv.y, 0.5), 0.5);

    uv -= 0.5;
    uv /= 1. - uScale;
    if(uNeedsRatio == 1.){
      if(uNaturalRatio > 1.){
        uv.x *= uRatio;
        uv.x /= uNaturalRatio;
      } else { 
        uv.y /= uRatio;
        uv.y *= uNaturalRatio;
      }
      uv /= 1. + max(0., uRatio - uNaturalRatio);
    }
    uv += 0.5;
    // float rect2 = step(distance(uv.x, 0.5), 0.25) * step(distance(uv.y, 0.5), 0.25);

    vec4 color = texture2D(uTexture, uv);
    
    color.rgb = mix(color.rgb, vec3(step(0.1, color.a)), isText);

    // color.ra += rect1 * 0.8;
    // color.ga += rect2* 1.;

    // color.a += step(0.0, 0.0);

    // if(uv.x < 0. || uv.x > 1. || uv.y < 0. || uv.y > 1.) discard;
    gl_FragColor = color;
  }
`;
