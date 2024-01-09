#ifdef GL_ES
precision mediump float;
#endif

varying vec3 vVertexPosition;
varying vec2 vTextureCoord;
varying float yPos;

uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform vec2 uSize;
// uniform float hovered;
// uniform float isText;
uniform float uScale;

uniform float uOpenProgress;

#include "/lygia/math/const.glsl";
#include "/lygia/draw/rect.glsl";
#include "/lygia/math/rotate2d.glsl";
// #include "/lygia/generative/psrdnoise.glsl";

// Source : https://gist.github.com/raphaelameaume/d1731132ef01efd948e67c0778770981
vec2 uvCover (vec2 uv, vec2 size, vec2 resolution) {
    vec2 coverUv = uv;
    vec2 s = resolution; // Screen
    vec2 i = size; // Image

    float rs = s.x / s.y;
    float ri = i.x / i.y;
    vec2 new = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x);
    vec2 offset = (rs < ri ? vec2((new.x - s.x) / 2.0, 0.0) : vec2(0.0, (new.y - s.y) / 2.0)) / new;
    
    coverUv = coverUv * s / new + offset;

    return coverUv;
}

void main() {
  vec2 uv = vTextureCoord;

  vec2 cover_uv = uvCover(uv, uSize, uResolution);

  // Draw texture
  vec4 color = texture2D(uTexture, cover_uv);

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
