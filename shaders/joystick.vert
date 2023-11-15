attribute vec2 aVertexPosition;

varying vec2 vCoord;

void main(void) {
	vCoord = aVertexPosition;
	gl_Position = vec4(aVertexPosition, 0.0, 1.0);
}