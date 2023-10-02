#ifdef GL_ES
precision mediump float;
#endif


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

uniform float uOpenProgress;

#include "/lygia/math/const.glsl";
#include "/lygia/draw/rect.glsl";
#include "/lygia/math/rotate2d.glsl";

void main() {
  vec2 uv = vTextureCoord;

  // Cover / Contain
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

  // Draw texture
  vec4 color = texture2D(uTexture, uv);

  // Rotate
  vec2 center_uv = uv - 0.5; // translate
  vec2 rotate_uv = center_uv * rotate2d(-HALF_PI * 0.52); // rotate
  rotate_uv += 0.5; // translate back

  // Rect
  float rectAlpha = rect(rotate_uv, vec2(1.5, 1.5 * uOpenProgress));
  color.rgba *= rectAlpha;

  // if(uv.x < 0. || uv.x > 1. || uv.y < 0. || uv.y > 1.) discard;
  gl_FragColor = color;
}
