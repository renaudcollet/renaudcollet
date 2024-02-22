// From threejs
// vec3 position;

uniform float uTime;
uniform vec2 uLacMouse;
uniform float uLacGrid;
varying vec2 vUv;
varying float vSquish;
attribute vec2 aPos;

void main() {
    vec3 transformed = position;

    vec2 mousePos = (uLacMouse - 0.5) * uLacGrid;
    float len = length(aPos - mousePos);
    float amplitude = len * 0.8;
    float speed = uTime * 0.3;
    float activation = sin( amplitude - speed); // -1 to 1
    float squish = smoothstep(-1.0, 1.0, activation); // 0 to 1

    transformed.y = transformed.y * 0.2 + transformed.y * 0.8 * squish; // 0.2 to 1.0

    transformed.xz += aPos;
    
    vUv = uv;
    vSquish = squish;

    // Fixing uvs for the top and bottom, monkey patch, see video 3 at 10:53
    if (position.y < 0.49999) {
        vUv.y = 1.0;
    } else if (position.y < -0.49999) {
        vUv.y = 0.0;
    }

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}
