// precision highp float;
precision mediump float;

#define PI 3.14159265

// default mandatory variables
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

varying float yPos;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

// uniform mat4 uTextureMatrix0; // texture matrix of my-image-1.jpg
// uniform mat4 uTextureMatrix1; // texture matrix of my-image-2.jpg

// custom variables
varying vec3 vVertexPosition;
varying vec2 vTextureCoord;

uniform float uPlaneDeformation;
// uniform float hovered;
uniform float uZPos;
// uniform float isText;

void main() {
  vec3 vertexPosition = aVertexPosition;

  // cool effect on scroll
  // vertexPosition.y += cos(vertexPosition.x*PI/2.) * uPlaneDeformation * 0.08;

  // vertexPosition.x *= 1. + abs(uPlaneDeformation) * 0.15;
  // vertexPosition.y *= 1. + abs(uPlaneDeformation) * 0.5;

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