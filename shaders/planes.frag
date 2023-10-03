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
// #include "/lygia/generative/psrdnoise.glsl";

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
  float rect_mask = rect(rotate_uv, vec2(1.5, 1.5 * uOpenProgress));
  color.rgba *= rect_mask;

  // Noise
  // const float scale = 50.0;
  // vec2 v = scale * uv;
  // const vec2 p = vec2(0.0, 0.0);
  // float alpha = uOpenProgress * 10.;
  // vec2 g;
  // float n = 0.5 + 0.5 * psrdnoise(v, p, alpha, g);
  // vec4 colorNoise = vec4(n);
  
  // Gradient

  // gl_FragColor = colorNoise * color;
  gl_FragColor = color;
}
