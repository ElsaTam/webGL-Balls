attribute vec3 aVertexPosition;
attribute float aRadius;
attribute vec4 aColor;

attribute float aNi;
attribute float aSigma;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform float uScale;
uniform vec4 uLightPos;

uniform float uSigmaFactor;
uniform float uNiFactor;

varying vec4 vCoord;
varying float vRadius;
varying vec4 vColor;
varying vec4 vLight;

varying float vNi;
varying float vSigma;

void main(void) {
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
	vCoord = uMVMatrix * vec4(aVertexPosition, 1.0);
	vRadius = aRadius;
	//glPointParameterf(GL_POINT_SPRITE_COORD_ORIGIN, GL_LOWER_LEFT);
	gl_PointSize = vRadius * uScale * uPMatrix[0][0] / gl_Position.w;
	vColor = aColor;
	vLight = uMVMatrix * uLightPos;

	vNi = aNi * uNiFactor;
	vSigma = aSigma * uSigmaFactor;
}