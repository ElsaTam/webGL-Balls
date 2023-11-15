precision mediump float;

uniform vec2 uClic;

varying vec2 vCoord;

void main(void)
{
    vec2 v = vCoord - uClic;
    float dist2 = v.x*v.x + v.y*v.y;
	gl_FragColor = vec4(0.0, 0.0, 1.0 - 0.8*dist2, 1.0);
}