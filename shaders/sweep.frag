#ifdef GL_ES
	precision mediump float;
#endif

// uniform float time;
uniform float progress;
uniform sampler2D uTexture1;
uniform sampler2D uTexture2;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;
float PI = 3.141592653589793238;

void main()	{
	// vec2 newUV = (vUv - vec2(0.5))*resolution.zw + vec2(0.5);
	vec4 t = texture2D(uTexture1, vUv);
	vec4 t1 = texture2D(uTexture2, vUv);
	float sweep = step(1.0 - vUv.y * vUv.x, progress);
	vec4 finalTexture = mix(t, t1, sweep);

	gl_FragColor = finalTexture;
}