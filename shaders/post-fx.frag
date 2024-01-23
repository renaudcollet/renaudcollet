#ifdef GL_ES
precision mediump float;
#endif


#define PI 3.14159265

varying vec3 vVertexPosition;
varying vec2 vTextureCoord;

uniform sampler2D uRenderTexture;

uniform float uDisplacement;
uniform float rgbShift;
uniform float stretch;
uniform float squish;
uniform float noiseFreq;

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

mat2 rotation2d(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    
    return mat2(
        c, -s,
        s, c
    );
}
      
void main( void ) {
    vec4 color = vec4(0.);
    vec2 textureCoords = vTextureCoord;
    textureCoords -= 0.5;
    textureCoords.x *= 1. + textureCoords.y * uDisplacement* squish;
    textureCoords.y *= 1. - abs(uDisplacement)* stretch;
    textureCoords += 0.5;


    float a = 0.;
    float n = 0.;
    vec2 st = vec2(0.);


    //RGB SHIFT
    st = textureCoords;
    st -= 0.5;
    n = noise(vec3(st * noiseFreq * uDisplacement, 0.))-0.5;
    st *= rotation2d(n*uDisplacement*rgbShift);
    st += 0.5;
    vec2 ra = texture2D(uRenderTexture, st).ra;
    color.r = ra.r;
    a = max(a, ra.g);

    st = textureCoords;
    st -= 0.5;
    n = noise(vec3(st * noiseFreq * uDisplacement, .5))-0.5;
    st *= rotation2d(n*uDisplacement*rgbShift);
    st += 0.5;
    vec2 ga = texture2D(uRenderTexture, st).ga;
    color.g = ga.r;
    a = max(a, ga.g);

    st = textureCoords;
    st -= 0.5;
    n = noise(vec3(st * noiseFreq * uDisplacement, 1.))-0.5;
    st *= rotation2d(n*uDisplacement*rgbShift);
    st += 0.5;
    vec2 ba = texture2D(uRenderTexture, st).ba;
    color.b = ba.r;
    a = max(a, ba.g);

    color.a = a;

    // st = textureCoords;
    // st -= 0.5;
    // n = noise(vec3(st * noiseFreq * uDisplacement, 0.))-0.5;
    // st *= rotation2d(n*uDisplacement*rgbShift);
    // st += 0.5;
    // color = texture2D(uRenderTexture, st);

    gl_FragColor = color;
}