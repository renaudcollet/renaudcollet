#ifdef GL_ES
	precision mediump float;
#endif

varying vec2 vUv;
varying float vSquish;

// Background color
uniform vec3 uBackground;

// Cosine palette
uniform vec3 uPalette0;
uniform vec3 uPalette1;
uniform vec3 uPalette2;
uniform vec3 uPalette3;
uniform float uPaletteOffset;

float PI = 3.141592653589793238;

/*
 * Cosine palette function
 * t: time
 * a: base color,
 * b: amplitude,
 * c: frequency,
 * d: offset
*/
vec3 palette(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d) {
	return a + b * cos(2.0 * PI * (c * t + d));
}

void main()	{
	vec3 color = vec3(0.0);
	// color = vec3(vUv.y);

	vec3 paletteColor = palette(vSquish + uPaletteOffset, uPalette0, uPalette1, uPalette2, uPalette3);
	// color = vec3(paletteColor);
	color = mix(paletteColor, uBackground, cos(vSquish * PI * 2.0));
	color = mix(uBackground, color, vUv.y);


	gl_FragColor = vec4(color, 1.0);
}