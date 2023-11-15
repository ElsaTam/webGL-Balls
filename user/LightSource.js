// =====================================================
// SUN. Permet de représenter la source lumineuse
// =====================================================
var LightSource = { fname:'light-source', loaded:-1, shader:null};

LightSource.initAll = function()
{

	this.pos = [0.0, 0.0, 2];
	this.intensity = [3.0];
	this.color = [1, 1, 1];

    radius = [0.01];

	this.vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.pos), gl.DYNAMIC_DRAW);
	this.vBuffer.itemSize = 3;
	this.vBuffer.numItems = 1;

	this.rBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.rBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(radius), gl.STATIC_DRAW);
	this.rBuffer.itemSize = 1;
    this.rBuffer.numItems = 1;
    
    this.cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.color), gl.DYNAMIC_DRAW);
    this.cBuffer.itemSize = 3;
    this.cBuffer.numItems = 1;

	//console.log("LightSource : init buffers ok.");

	loadShaders(this);

	//console.log("LightSource : shaders loading...");
}

// =====================================================
LightSource.setShadersParams = function()
{
	gl.useProgram(this.shader);

	this.shader.vAttrib = gl.getAttribLocation(this.shader, "aVertexPosition");
	gl.enableVertexAttribArray(this.shader.vAttrib);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
	gl.vertexAttribPointer(this.shader.vAttrib, this.vBuffer.itemSize, gl.FLOAT, false, 0, 0);

	this.shader.rAttrib = gl.getAttribLocation(this.shader, "aRadius");
	gl.enableVertexAttribArray(this.shader.rAttrib);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.rBuffer);
    gl.vertexAttribPointer(this.shader.rAttrib,this.rBuffer.itemSize, gl.FLOAT, false, 0, 0);
    
	this.shader.cAttrib = gl.getAttribLocation(this.shader, "aColor");
	gl.enableVertexAttribArray(this.shader.cAttrib);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
	gl.vertexAttribPointer(this.shader.cAttrib,this.cBuffer.itemSize, gl.FLOAT, false, 0, 0);
    
    this.shader.scaleUniform = gl.getUniformLocation(this.shader, "uScale");
	gl.uniform1f(this.shader.scaleUniform, gl.viewportWidth);

	this.shader.pMatrixUniform = gl.getUniformLocation(this.shader, "uPMatrix");
	this.shader.mvMatrixUniform = gl.getUniformLocation(this.shader, "uMVMatrix");
}

// =====================================================
LightSource.draw = function()
{
	if(this.shader) {		
		this.setShadersParams();
		setMatrixUniforms(this);
		gl.drawArrays(gl.POINTS, 0, this.vBuffer.numItems);
	}
}

// =====================================================
// Bouge la source sous le curseur, sur le plan de la
// camera.
// N.B. : je n'ai pas réussi à gérer la perspective de
// sorte à ce que la source se trouve sous le curseur.
LightSource.move = function(x, y)
{
	var xv = (2*x-gl.viewportWidth)/gl.viewportWidth;
	var yv = (2*y-gl.viewportHeight)/gl.viewportHeight;
	//console.log("y : " + y + " --> " + yv);
	// f = 1/(2*tan(fov/2))
	var f = 1 / (2 * Math.tan(degToRad(45)/2));
	//console.log(" f --> " + f);

	//console.log("sun monde : " + vec3.str(sun));
	var posLightSource = vec3.create(this.pos);
	mat4.multiplyVec3(mvMatrix, posLightSource);
	//console.log("sun mv : " + vec3.str(posLightSource));

	var newZ = posLightSource[2];
	var newX = -xv * newZ / f;
	var newY = yv * newZ / f;
	//console.log("x : " + x + " --> " + xv + " --> " + newX);
	this.pos = [newX, newY, newZ];
	//console.log("new pos view : " + vec3.str(sun));

    var rotMatrix = mat4.create(objMatrix);
	mat4.transpose(rotMatrix);
	
	var inverseMVMatrix = mat4.create();
	mat4.identity(inverseMVMatrix);
	mat4.multiply(inverseMVMatrix, rotMatrix);
	mat4.translate(inverseMVMatrix, [-translate[0], -translate[1], -translate[2]]);
	
	mat4.multiplyVec3(inverseMVMatrix, this.pos);
	//console.log("new pos monde : " + vec3.str(sun));

    //mat4.multiplyVec3(rotMatrix, dep);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(this.pos));
}

// =====================================================
// Met à jour le buffer de couleur.
LightSource.updateColor = function()
{
	gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(this.color));
}