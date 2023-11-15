// =====================================================
var glJoystick;

// =====================================================
// JOYSTICK 2D, Permet de controler la boule joueur
// =====================================================
var Joystick2D = { fname:'joystick', loaded:-1, shader:null};

Joystick2D.initAll = function(){
	this.clic = [0.0, 0.0];

	var noOfFans = 50;
	var radius = 1;
    var anglePerFan = (2*Math.PI) / noOfFans;
    var vertices = [0, 0];

    for(var i = 0; i <= noOfFans; i++)
    {
        var angle = anglePerFan * (i+1);
        var x = 0.0 + Math.cos(angle) * radius;
        var y = 0.0 + Math.sin(angle) * radius;
        vertices.push(x);
        vertices.push(y);
   	}
   	vertices.push(vertices[2]);
    vertices.push(vertices[3]);

	this.vBuffer = glJoystick.createBuffer();
	glJoystick.bindBuffer(glJoystick.ARRAY_BUFFER, this.vBuffer);
	glJoystick.bufferData(glJoystick.ARRAY_BUFFER, new Float32Array(vertices), glJoystick.STATIC_DRAW);
	this.vBuffer.itemSize = 2;
	this.vBuffer.numItems = noOfFans + 2;

	console.log("Joystick2D : init buffers ok.");

	loadJoystickShaders(this);

	console.log("Joystick2D : shaders loading...");
}

// =====================================================
Joystick2D.setShadersParams = function()
{
	//console.log("Joystick2D : setting shader parameters...")

	glJoystick.useProgram(this.shader);

	this.shader.vAttrib = glJoystick.getAttribLocation(this.shader, "aVertexPosition");
	glJoystick.enableVertexAttribArray(this.shader.vAttrib);
	glJoystick.bindBuffer(glJoystick.ARRAY_BUFFER, this.vBuffer);
	glJoystick.vertexAttribPointer(this.shader.vAttrib, this.vBuffer.itemSize, glJoystick.FLOAT, false, 0, 0);


	this.shader.clicUniform = glJoystick.getUniformLocation(this.shader, "uClic");

	//console.log("Joystick2D : parameters ok.")
}

// =====================================================
Joystick2D.draw = function()
{
	if(this.shader) {
		glJoystick.clear( glJoystick.COLOR_BUFFER_BIT );
		this.setShadersParams();
		glJoystick.drawArrays(glJoystick.TRIANGLE_FAN, 0, this.vBuffer.numItems);
		//console.log(this.vBuffer.numItems + " point drawn");
	}
}

// =====================================================
// Change la variable uniforme indiquant la position du
// curseur sur le joystick 
Joystick2D.moveClic = function(x, y)
{
	x = x / glJoystick.viewportWidth * 2 - 1;
	y = y / glJoystick.viewportHeight * -2 + 1;
	this.clic = [x, y];
	if (this.shader) {
		glJoystick.uniform2fv(this.shader.clicUniform, this.clic);
	}
}


// =====================================================
// FONCTIONS GENERALES, INITIALISATIONS
// =====================================================

// =====================================================
function webGLStartJoystick() {
	var joystick = document.getElementById("WebGL-joystick");
	joystick.onmousedown = handleMouseDownOnJoystick;
	joystick.onmousemove = handleMouseMoveOnJoystick;
	joystick.onwheel = handleWheelEventOnJoystick;
	initJoystick(joystick);
}

// =====================================================
function initJoystick(joystick)
{
	try {
		glJoystick = joystick.getContext("experimental-webgl");
		glJoystick.viewportWidth = joystick.width;
		glJoystick.viewportHeight = joystick.height;
		glJoystick.viewport(0, 0, joystick.width, joystick.height);

		glJoystick.clearColor(1.0, 1.0, 1.0, 1.0);
		glJoystick.enable(glJoystick.DEPTH_TEST);
		glJoystick.enable(glJoystick.CULL_FACE);
		glJoystick.cullFace(glJoystick.BACK); 

	} catch (e) {}
	if (!glJoystick) {
		console.log("Could not initialise WebGL");
	}
}

// =====================================================
function loadJoystickShaders(Obj3D) {
	loadJoystickShaderText(Obj3D,'.vert');
	loadJoystickShaderText(Obj3D,'.frag');
}

// =====================================================
function loadJoystickShaderText(Obj3D,ext) {   // lecture asynchrone...
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
		if(ext=='.vert') { Obj3D.vsTxt = xhttp.responseText; Obj3D.loaded ++; }
		if(ext=='.frag') { Obj3D.fsTxt = xhttp.responseText; Obj3D.loaded ++; }
		if(Obj3D.loaded==2) {
			Obj3D.loaded ++;
			compileJoystickShaders(Obj3D);
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
function compileJoystickShaders(Obj3D)
{
	//console.log("compiling vshader "+Obj3D.fname);

	Obj3D.vshader = glJoystick.createShader(glJoystick.VERTEX_SHADER);
	glJoystick.shaderSource(Obj3D.vshader, Obj3D.vsTxt);
	glJoystick.compileShader(Obj3D.vshader);
	if (!glJoystick.getShaderParameter(Obj3D.vshader, glJoystick.COMPILE_STATUS)) {
		console.log("Vertex Shader FAILED... "+Obj3D.fname+".vs");
		console.log(Obj3D.vsTxt);
		console.log(glJoystick.getShaderInfoLog(Obj3D.vshader));
		return null;
	}

	//console.log("compiling fshader "+Obj3D.fname);

	Obj3D.fshader = glJoystick.createShader(glJoystick.FRAGMENT_SHADER);
	glJoystick.shaderSource(Obj3D.fshader, Obj3D.fsTxt);
	glJoystick.compileShader(Obj3D.fshader);
	if (!glJoystick.getShaderParameter(Obj3D.fshader, glJoystick.COMPILE_STATUS)) {
		console.log("Fragment Shader FAILED... "+Obj3D.fname+".fs");
		return null;
	}

	//console.log("linking ("+Obj3D.fname+") shader");

	Obj3D.shader = glJoystick.createProgram();

	glJoystick.attachShader(Obj3D.shader, Obj3D.vshader);
	glJoystick.attachShader(Obj3D.shader, Obj3D.fshader);

	glJoystick.linkProgram(Obj3D.shader);
	if (!glJoystick.getProgramParameter(Obj3D.shader, glJoystick.LINK_STATUS)) {
		console.log("Could not initialise shaders");
	}

	//console.log("Compilation performed for ("+Obj3D.fname+") shader");

}

// =====================================================
function joystickShadersOk()
{
	if(Joystick2D.loaded == 4) return true;

	if(Joystick2D.loaded < 0){
		Joystick2D.loaded = 0;
		Joystick2D.initAll();
		Joystick2D.moveClic(glJoystick.viewportWidth/2, glJoystick.viewportHeight/2);
	}
	return false;
}

// =====================================================
function drawJoystick() {

	glJoystick.clear(glJoystick.COLOR_BUFFER_BIT);
	if(joystickShadersOk()) {
		Joystick2D.draw();
		drawOk = true;
	}

}