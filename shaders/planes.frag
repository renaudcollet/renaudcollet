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
uniform float uCoverProgress; // 0 -> 1
uniform float uOpenProgress; // 0 -> 1

#include "/lygia/math/const.glsl";
#include "/lygia/math/lerp.glsl";
#include "/lygia/draw/rect.glsl";
#include "/lygia/math/rotate2d.glsl";

// #include "/lygia/color/blend/luminosity.glsl";
// #include "/lygia/color/levels/outputRange.glsl";
// #include "/lygia/color/hueShift.glsl";
#include "/lygia/color/exposure.glsl";

#include "/lygia/space/scale.glsl";

// Scale from center
// https://www.shadertoy.com/view/wtKfWt

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
  vec2 uv = vTextureCoord; // From 0 to 1 

  vec2 cover_uv = uvCover(uv, uSize, uResolution);

  float _scale = lerp(uScale, 1.0, uCoverProgress);
  cover_uv = scale(cover_uv, _scale);

  vec4 color = texture2D(uTexture, cover_uv);

  // color = levelsOutputRange(color, 0.5, 0.1);
  // color = hueShift(color, 0.05);
  // float _exposureFactor = lerp(-0.5, 0.0, _scale);
  // color = exposure(color, 0.5);

  // Deformation / Distortion
  // Question : https://stackoverflow.com/questions/63651405/fish-eye-warping-about-mouse-position-fragment-shader
  // Linking to : https://www.geeks3d.com/20140213/glsl-shader-library-fish-eye-and-dome-and-barrel-distortion-post-processing-filters/
  // float aperture = 178.0;
  // float apertureHalf = 0.5 * aperture * (PI / 180.0);
  // float maxFactor = sin(apertureHalf);
  // vec2 xy = 2.0 * cover_uv.xy - 1.0; // Position par rapport au centre
  // float d = length(xy); // longueur du vecteur
  // if (d < (2.0-maxFactor))
  // {
  //   d = length(xy * maxFactor);
  //   float z = sqrt(1.0 - d * d);
  //   float r = atan(d, z) / PI;
  //   float phi = atan(xy.y, xy.x);
    
  //   uv.x = r * cos(phi) + 0.5;
  //   uv.y = r * sin(phi) + 0.5;
  // }
  // else
  // {
  //   uv = cover_uv.xy;
  // }
  // // vec4 c = texture2D(tex0, uv);

  // Draw texture
  // vec4 color = texture2D(uTexture, uv);

  // Rotate
  vec2 center_uv = uv - 0.5; // translate
  vec2 rotate_uv = center_uv * rotate2d(-HALF_PI * 0.52); // rotate
  rotate_uv += 0.5; // translate back

  // Rect
  float rect_mask = rect(rotate_uv, vec2(1.5, 1.5 * uOpenProgress));
  color.rgba *= rect_mask;

  // Prevent black flash just before opening
  // if (uOpenProgress == 0.0) {
  //   color.a = 0.0;
  // }

  // color.r = 1.0;

  // gl_FragColor = colorNoise * color;
  gl_FragColor = color;
}
