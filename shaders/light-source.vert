attribute vec3 aVertexPosition;
attribute float aRadius;
attribute vec3 aColor;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform float uScale;

varying vec4 vCoord;
varying float vRadius;
varying vec3 vColor;

void main(void) {
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
	vCoord = uMVMatrix * vec4(aVertexPosition, 1.0);
	vRadius = aRadius;
	gl_PointSize = vRadius*uScale*uPMatrix[0][0];
	vColor = aColor;
}