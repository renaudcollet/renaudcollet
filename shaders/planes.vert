// precision highp float;
precision mediump float;

#define PI 3.14159265

// default mandatory variables
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

varying float yPos;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 planeTextureMatrix;

// uniform mat4 uTextureMatrix0; // texture matrix of my-image-1.jpg
// uniform mat4 uTextureMatrix1; // texture matrix of my-image-2.jpg

// custom variables
varying vec3 vVertexPosition;
varying vec2 vTextureCoord;

uniform float uPlaneDeformation;

uniform vec2 uMousePosition;

// uniform float hovered;
// uniform float isText;

// #include "/lygia/math/lerp.glsl";

void main() {
  vec3 vertexPosition = aVertexPosition;

  vec4 finalPos = uPMatrix * uMVMatrix * vec4(vertexPosition, 1.0);

  // finalPos.y += sin(finalPos.y);
  gl_Position = finalPos;

  // varyings
  vVertexPosition = vertexPosition;
  vTextureCoord = aTextureCoord;
  // vTextureCoord = (planeTextureMatrix * vec4(aTextureCoord, 0.0, 1.0)).xy;
  yPos = gl_Position.y;
}