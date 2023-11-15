
// =====================================================
var gl;
// =====================================================
var mvMatrix = mat4.create();
var pMatrix = mat4.create();
var objMatrix = mat4.create();
var affiche = 0;
var translate = [0.0, 0.0, -2.0];
var camera;
// =====================================================

// =====================================================
// PLAN 3D, Support géométrique
// =====================================================

var Plane3D = { fname:'plane', loaded:-1, shader:null };

// =====================================================
Plane3D.initAll = function()
{

	vertices = [
		-0.7, -0.7, 0.0,
		 0.7, -0.7, 0.0,
		 0.7,  0.7, 0.0,
		-0.7,  0.7, 0.0
	];

	texcoords = [
		0.0,0.0,
		0.0,1.0,
		1.0,1.0,
		1.0,0.0
	];

	this.vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	this.vBuffer.itemSize = 3;
	this.vBuffer.numItems = 4;

	this.tBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);
	this.tBuffer.itemSize = 2;
	this.tBuffer.numItems = 4;

	console.log("Plane3D : init buffers ok.");

	loadShaders(this);

	console.log("Plane3D : shaders loading...");
}


// =====================================================
Plane3D.setShadersParams = function()
{
	//console.log("Plane3D : setting shader parameters...")

	gl.useProgram(this.shader);

	this.shader.vAttrib = gl.getAttribLocation(this.shader, "aVertexPosition");
	gl.enableVertexAttribArray(this.shader.vAttrib);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
	gl.vertexAttribPointer(this.shader.vAttrib, this.vBuffer.itemSize, gl.FLOAT, false, 0, 0);

	this.shader.tAttrib = gl.getAttribLocation(this.shader, "aTexCoords");
	gl.enableVertexAttribArray(this.shader.tAttrib);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
	gl.vertexAttribPointer(this.shader.tAttrib,this.tBuffer.itemSize, gl.FLOAT, false, 0, 0);

	this.shader.pMatrixUniform = gl.getUniformLocation(this.shader, "uPMatrix");
	this.shader.mvMatrixUniform = gl.getUniformLocation(this.shader, "uMVMatrix");

	//console.log("Plane3D : parameters ok.")

}


// =====================================================
Plane3D.draw = function()
{
	if(this.shader) {		
		this.setShadersParams();
		setMatrixUniforms(this);
		gl.drawArrays(gl.TRIANGLE_FAN, 0, this.vBuffer.numItems);
		gl.drawArrays(gl.LINE_LOOP, 0, this.vBuffer.numItems);
	}
}




// =====================================================
// FONCTIONS GENERALES, INITIALISATIONS
// =====================================================

// =====================================================
function webGLStart() {
	var canvas = document.getElementById("WebGL-test");

	mat4.identity(objMatrix);
	mat4.rotate(objMatrix, rotX, [1, 0, 0]);
	mat4.rotate(objMatrix, rotZ, [0, 0, 1]);

	canvas.onwheel = handleWheelEvent;
	canvas.onmousedown = handleMouseDown;
	document.onmouseup = handleMouseUp;
	document.onmousemove = handleMouseMove;

	document.onkeydown = handleKeyDown;
	document.onkeypress = handleKeyPress;
	document.onkeyup = handleKeyUp;


	initGL(canvas);
	//initJoystick(joystick);
	//initGLBis(joystick);

	//tick();
}

// =====================================================
function initGL(canvas)
{
	try {
		gl = canvas.getContext("experimental-webgl");
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
		gl.viewport(0, 0, canvas.width, canvas.height);

		var rotMatrix = mat4.create();
		mat4.identity(rotMatrix);
		mat4.rotate(rotMatrix, rotX, [1, 0, 0]);
		mat4.rotate(rotMatrix, rotZ, [0, 0, 1]);
		mat4.transpose(rotMatrix);
		var cameraPos = [0, 0, 0];
		mat4.identity(mvMatrix);
		mat4.translate(mvMatrix, [-translate[0], -translate[1], -translate[2]]);
		mat4.multiply(mvMatrix, rotMatrix);
		mat4.multiplyVec3(mvMatrix, cameraPos);
		camera = new Camera(new Vector(cameraPos[0], cameraPos[1], cameraPos[2]), new Vector(0, 0, 0), gl.viewportWidth, gl.viewportHeight, degToRad(45), 0.1, 100.0);

		gl.clearColor(0.7, 0.7, 0.7, 1.0);
		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK); 

	} catch (e) {}
	if (!gl) {
		console.log("Could not initialise WebGL");
	}
}

// =====================================================
function loadShaders(Obj3D) {
	loadShaderText(Obj3D,'.vert');
	loadShaderText(Obj3D,'.frag');
}

// =====================================================
function loadShaderText(Obj3D,ext) {   // lecture asynchrone...
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
		if(ext=='.vert') { Obj3D.vsTxt = xhttp.responseText; Obj3D.loaded ++; }
		if(ext=='.frag') { Obj3D.fsTxt = xhttp.responseText; Obj3D.loaded ++; }
		if(Obj3D.loaded==2) {
			Obj3D.loaded ++;
			compileShaders(Obj3D);
			Obj3D.setShadersParams();
			console.log("Shader ok : "+Obj3D.fname+".");
			Obj3D.loaded ++;
		}
    }
  }
  Obj3D.loaded = 0;
  xhttp.open("GET", "shaders/"+Obj3D.fname+ext, true);
  xhttp.send();
}

// =====================================================
function compileShaders(Obj3D)
{
	//console.log("compiling vshader "+Obj3D.fname);

	Obj3D.vshader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(Obj3D.vshader, Obj3D.vsTxt);
	gl.compileShader(Obj3D.vshader);
	if (!gl.getShaderParameter(Obj3D.vshader, gl.COMPILE_STATUS)) {
		console.log("Vertex Shader FAILED... "+Obj3D.fname+".vs");
		console.log(Obj3D.vsTxt);
		console.log(gl.getShaderInfoLog(Obj3D.vshader));
		return null;
	}

	//console.log("compiling fshader "+Obj3D.fname);

	Obj3D.fshader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(Obj3D.fshader, Obj3D.fsTxt);
	gl.compileShader(Obj3D.fshader);
	if (!gl.getShaderParameter(Obj3D.fshader, gl.COMPILE_STATUS)) {
		console.log("Fragment Shader FAILED... "+Obj3D.fname+".fs");
		return null;
	}

	//console.log("linking ("+Obj3D.fname+") shader");

	Obj3D.shader = gl.createProgram();

	gl.attachShader(Obj3D.shader, Obj3D.vshader);
	gl.attachShader(Obj3D.shader, Obj3D.fshader);

	gl.linkProgram(Obj3D.shader);
	if (!gl.getProgramParameter(Obj3D.shader, gl.LINK_STATUS)) {
		console.log("Could not initialise shaders");
	}

	//console.log("Compilation performed for ("+Obj3D.fname+") shader");

}




// =====================================================
function setMatrixUniforms(Obj3D) {
	mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
	mat4.identity(mvMatrix);
	mat4.translate(mvMatrix, translate);
	mat4.multiply(mvMatrix, objMatrix);
	gl.uniformMatrix4fv(Obj3D.shader.pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(Obj3D.shader.mvMatrixUniform, false, mvMatrix);
}

function setUniformLight(Obj3D) {
	var lightPos = [LightSource.pos[0], LightSource.pos[1], LightSource.pos[2], 1.0]; // position de la source lumineuse
	gl.uniform4fv(Obj3D.shader.lightPosUniform, lightPos);

	gl.uniform3fv(Obj3D.shader.lightColorUniform, LightSource.color);

	gl.uniform1f(Obj3D.shader.lightIntensityUniform, LightSource.intensity);
}


// =====================================================
function shadersOk()
{
	if(Plane3D.loaded == 4 && Balls3D.loaded == 4 && LightSource.loaded == 4) return true;

	if(Plane3D.loaded < 0){
		Plane3D.loaded = 0;
		Plane3D.initAll();
	}
	if(Balls3D.loaded < 0) {
		Balls3D.loaded = 0;
		Balls3D.initAll();
		document.getElementById("speedValue").innerHTML = Number(Balls3D.box.deltaT).toFixed(4);
		document.getElementById("speedSlider").value = Balls3D.box.deltaT;
		document.getElementById("elasticityValue").innerHTML = Number(Balls3D.box.elasticity).toFixed(2);
		document.getElementById("elasticitySlider").value = Balls3D.box.elasticity;
		document.getElementById("lambdaValue").innerHTML = Number(Balls3D.box.lambda).toFixed(1);
		document.getElementById("lambdaSlider").value = Balls3D.box.lambda;

		document.getElementById("sigmaValue").innerHTML = Number(1).toFixed(1);
		document.getElementById("sigmaSlider").value = 1;
		document.getElementById("niValue").innerHTML = Number(1).toFixed(1);
		document.getElementById("niSlider").value = 1;

		document.getElementById("rLightValue").innerHTML = 255;
		document.getElementById("rLightSlider").value = 255;
		document.getElementById("gLightValue").innerHTML = 255;
		document.getElementById("gLightSlider").value = 255;
		document.getElementById("bLightValue").innerHTML = 255;
		document.getElementById("bLightSlider").value = 255;
		document.getElementById("intensityValue").innerHTML = 3;
		document.getElementById("intensitySlider").value = 3;
	}
	if(LightSource.loaded < 0){
		LightSource.loaded = 0;
		LightSource.initAll();
	}
	if (Laser.loaded < 0) {
		Laser.loaded = 0;
		Laser.initAll();
	}
	return false;

}

// =====================================================
function drawScene() {

	gl.clear(gl.COLOR_BUFFER_BIT);
	if(shadersOk()) {
		Plane3D.draw();
		Balls3D.draw();
		LightSource.draw();
		Laser.draw();
		drawOk = true;
	}

}
