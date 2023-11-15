precision mediump float;

varying vec4 vCoord;
varying float vRadius;
varying vec3 vColor;

void main(void)
{
	vec2 posInQuad = 2.0 * gl_PointCoord - 1.0;
	float dist = dot(posInQuad, posInQuad);

	if (dist > 1.0) {
        discard;
    }

    gl_FragColor = vec4(vColor, 1.0) * (dist/2.0 + 0.5);
}