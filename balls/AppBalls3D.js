// =====================================================
// APP BOULES 3D, Application gérant les shaders et les
// objets liés aux boules.
// =====================================================

var Balls3D = { fname:'balls', loaded:-1, shader:null};


// =====================================================
// INITIALISATION
// =====================================================
// =====================================================
// Initialise la boite contenant les boules
Balls3D.initBox = function()
{
	// Taille de la boîte
	var boxX = [-0.7, 0.7];
	var boxY = [-0.7, 0.7];
	var boxZ = [0.0, 0.7];
	// Création de la boîte.
	this.box = new Box3D(boxX, boxY, boxZ);
}

// =====================================================
// Boules controlees par l'utilisateur. Pour l'instant,
// une seule est gerable.
Balls3D.initPlayers = function()
{
	this.numberOfPlayers = 1;
	this.playersPalette = ColorsEnum.grey;
	for(var i = 0; i < this.numberOfPlayers; ++i){
		var playerCenter = [0.0, 0.0, 0.5];
		this.centers.push(playerCenter[0]);
		this.centers.push(playerCenter[1]);
		this.centers.push(playerCenter[2]);
		var playerVel = [0.0, 0.0, 0.0];
		var playerRadius = 0.15;
		this.radius.push(playerRadius);
		var playerMass = playerRadius*playerRadius*playerRadius;
		this.box.addPlayer(new BallPlayer3D(playerCenter, playerVel, playerRadius, playerMass));
		var rgb = ColorGenerator.randomColor(this.playersPalette);
		this.colors.push(rgb[0]); // r
		this.colors.push(rgb[1]); // g
		this.colors.push(rgb[2]); // b
		this.colors.push(1.0); // a

		this.niList.push(1.0);
		this.sigmaList.push(0.5);
	}
}

// =====================================================
// Boules soumises à la gravité et forces de collisions
Balls3D.initBalls = function()
{
	this.numberOfBalls = 1;
	this.ballsPalette = ColorsEnum.bright;
	this.addBallsToArray(this.numberOfBalls);
}

// =====================================================
// Initialisiation globale
Balls3D.initAll = function(){
	this.displayMode = 1; // mode d'affichage (couleur, brdf, normale, position, ...)

	this.initBox();

	this.centers = [];
	this.radius = [];
	this.colors = [];

	this.niList = [];
	this.sigmaList = [];

	this.initPlayers();
	this.initBalls();

	this.vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.centers), gl.DYNAMIC_DRAW);
	//gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.centers), gl.STATIC_DRAW);
	this.vBuffer.itemSize = 3;
	this.vBuffer.numItems = this.numberOfPlayers + this.numberOfBalls;

	this.rBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.rBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.radius), gl.STATIC_DRAW);
	this.rBuffer.itemSize = 1;
	this.rBuffer.numItems = this.numberOfPlayers + this.numberOfBalls;

	this.cBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW);
	this.cBuffer.itemSize = 4;
	this.cBuffer.numItems = this.numberOfPlayers + this.numberOfBalls;

	this.niListBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.niListBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.niList), gl.STATIC_DRAW);
	this.niListBuffer.itemSize = 1;
	this.niListBuffer.numItems = this.numberOfPlayers + this.numberOfBalls;

	this.sigmaListBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.sigmaListBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.sigmaList), gl.STATIC_DRAW);
	this.sigmaListBuffer.itemSize = 1;
	this.sigmaListBuffer.numItems = this.numberOfPlayers + this.numberOfBalls;

	this.sigmaFactor = 1.0;
	this.niFactor = 1.0;

	console.log("Balls3D : init buffers ok.");

	loadShaders(this);

	console.log("Balls3D : shaders loading...");
}

// =====================================================
// Reinitialisation des boules dans la boite.
Balls3D.reset = function()
{
	this.removeBalls(this.numberOfBalls);
	this.addBalls(1);
}

// =====================================================
Balls3D.setShadersParams = function()
{
	//console.log("Balls3D : setting shader parameters...")

	gl.useProgram(this.shader);

	this.shader.vAttrib = gl.getAttribLocation(this.shader, "aVertexPosition");
	gl.enableVertexAttribArray(this.shader.vAttrib);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
	gl.vertexAttribPointer(this.shader.vAttrib, this.vBuffer.itemSize, gl.FLOAT, false, 0, 0);

	this.shader.rAttrib = gl.getAttribLocation(this.shader, "aRadius");
	gl.enableVertexAttribArray(this.shader.rAttrib);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.rBuffer);
	gl.vertexAttribPointer(this.shader.rAttrib, this.rBuffer.itemSize, gl.FLOAT, false, 0, 0);

	this.shader.cAttrib = gl.getAttribLocation(this.shader, "aColor");
	gl.enableVertexAttribArray(this.shader.cAttrib);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
	gl.vertexAttribPointer(this.shader.cAttrib, this.cBuffer.itemSize, gl.FLOAT, false, 0, 0);

	this.shader.niAttrib = gl.getAttribLocation(this.shader, "aNi");
	gl.enableVertexAttribArray(this.shader.niAttrib);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.niListBuffer);
	gl.vertexAttribPointer(this.shader.niAttrib, this.niListBuffer.itemSize, gl.FLOAT, false, 0, 0);

	this.shader.sigmaAttrib = gl.getAttribLocation(this.shader, "aSigma");
	gl.enableVertexAttribArray(this.shader.sigmaAttrib);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.sigmaListBuffer);
	gl.vertexAttribPointer(this.shader.sigmaAttrib, this.sigmaListBuffer.itemSize, gl.FLOAT, false, 0, 0);

	this.shader.scaleUniform = gl.getUniformLocation(this.shader, "uScale");
	gl.uniform1f(this.shader.scaleUniform, gl.viewportWidth);

	this.shader.displayModeUniform = gl.getUniformLocation(this.shader, "uDisplayMode");
	gl.uniform1i(this.shader.displayModeUniform, this.displayMode);

	this.shader.lightPosUniform = gl.getUniformLocation(this.shader, "uLightPos");
	this.shader.lightColorUniform = gl.getUniformLocation(this.shader, "uLightColor");
	this.shader.lightIntensityUniform = gl.getUniformLocation(this.shader, "uLightIntensity");

	this.shader.sigmaFactorUniform = gl.getUniformLocation(this.shader, "uSigmaFactor");
	gl.uniform1f(this.shader.sigmaFactorUniform, this.sigmaFactor);
	this.shader.niFactorUniform = gl.getUniformLocation(this.shader, "uNiFactor");
	gl.uniform1f(this.shader.niFactorUniform, this.niFactor);

	//this.shader.mvTransposedMatrixUniform = gl.getUniformLocation(this.shader, "uMVMatrixT");

	this.shader.pMatrixUniform = gl.getUniformLocation(this.shader, "uPMatrix");
	this.shader.mvMatrixUniform = gl.getUniformLocation(this.shader, "uMVMatrix");


	//console.log("Balls3D : parameters ok.")
}

// =====================================================
// METHODES APPELEES A CHAQUE TICK
// =====================================================
// =====================================================
Balls3D.draw = function()
{
	if(this.shader) {		
		this.setShadersParams();
		setMatrixUniforms(this);
		setUniformLight(this);
		gl.drawArrays(gl.POINTS, 0, this.vBuffer.numItems);
	}
}

// =====================================================
// Gère la boucle temporelle durant laquelle la physique
// est calculée
Balls3D.animate = function()
{
	for(var i = 0; i < 1000/60; ++i){
		this.box.applyDynamics();
	}

	for(var i = 0; i < this.numberOfPlayers; ++i){
		this.centers[i*3+0] = this.box.players[i].pos[0];
		this.centers[i*3+1] = this.box.players[i].pos[1];
		this.centers[i*3+2] = this.box.players[i].pos[2];
	}
	for(var i = this.numberOfPlayers; i < this.numberOfPlayers + this.numberOfBalls; ++i){
		var ball = this.box.balls[i - this.numberOfPlayers];
		this.centers[i*3+0] = ball.pos[0];
		this.centers[i*3+1] = ball.pos[1];
		this.centers[i*3+2] = ball.pos[2];
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
	//gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.centers), gl.STATIC_DRAW);
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(this.centers));
}

// =====================================================
// GESTION DES BOULES JOUEURS (pour l'instant, une seule
// est gérée)
// =====================================================
// =====================================================
// Change la vitesse de déplacement du joueur
Balls3D.movePlayer = function(velx, vely)
{
	this.box.players[0].vel[0] = velx * 5;
	this.box.players[0].vel[1] = vely * 5;
}
// =====================================================
// Déplace la boule du joueur dans une direction donnée
// par le vec3 dep
Balls3D.move = function(dep)
{
	this.box.players[0].pos[0] += dep[0];
	this.box.players[0].pos[1] += dep[1];
	this.box.players[0].pos[2] += dep[2];
}

// =====================================================
// ACTIONS SUPPLEMENTAIRES d'interaction
// =====================================================
// =====================================================
// Fait rebondir les boules qui sont au sol
Balls3D.bounce = function()
{
	this.box.bounce();
}

// =====================================================
// Tire un laser de la caméra jusqu'au centre du plan.
// Ce laser divise toutes les boules rencontrées en 2.
Balls3D.shootLaser = function()
{
	this.box.shootLaser(camera.pos, camera.lookAt, camera.right);
}

// =====================================================
// MODIFICATION DU CONTENU de la boite
// =====================================================
// =====================================================
// Ajoute un certain nombre de boules dans la boîte et
// les tableaux. (les buffers ne sont pas gérés)
Balls3D.addBallsToArray = function(n)
{
	for(var i = 0; i < n; ++i){
		var pos = [0.7-1.4*Math.random(), 0.7-1.4*Math.random(), 0.7*Math.random()];
		this.centers.push(pos[0]); // x
		this.centers.push(pos[1]); // y
		this.centers.push(pos[2]); // z

		var vel = [3.0 - 6.0*Math.random(), 3.0 - 6.0*Math.random(), 3.0*Math.random()];

		var r = 0.05 + Math.random() * 0.05; // [0.05, 0.1]
		//var r = 0.3;
		this.radius.push(r);

		var m = r*r*r;

		var ball = new Ball3D(pos, vel, r, m);
		this.box.addBall(ball);
		//ball.toConsole();

		var rgb = ColorGenerator.randomColor(this.ballsPalette);
		this.colors.push(rgb[0]); // r
		this.colors.push(rgb[1]); // g
		this.colors.push(rgb[2]); // b
		this.colors.push(1.0); // a

		var ni = 1.0 + Math.random() * 3.0;
		this.niList.push(ni);
		var sigma = 0.000001 + Math.random() * 1.0;
		this.sigmaList.push(sigma);
	}
}

// =====================================================
// Ajoute des boules dans la boite, met à jour les
// buffers
Balls3D.addBalls = function(number)
{
	var n;
	if(number)
		n = number;
	else
		n = 20;
	
	this.addBallsToArray(n);
	this.numberOfBalls += n;

	this.vBuffer.numItems += n;
	this.rBuffer.numItems += n;
	this.cBuffer.numItems += n;

	this.niListBuffer.numItems += n;
	this.sigmaListBuffer.numItems += n;

	this.rebaseBuffers();
}

// =====================================================
// Supprime des boules de la boite et met à jour les
// buffers.
Balls3D.removeBalls = function(number)
{
	var n;
	if(number)
		n = number;
	else
		n = 20;
	n = Math.min(n, this.numberOfBalls);
	for(var i = 0; i < n; ++i){
		this.centers.pop(); // x
		this.centers.pop(); // y
		this.centers.pop(); // z
		this.radius.pop();
		this.box.removeBall();
		this.colors.pop(); // r
		this.colors.pop(); // g
		this.colors.pop(); // b
		this.colors.pop(); // a
		this.niList.pop();
		this.sigmaList.pop();
	}
	this.numberOfBalls -= n;
	this.vBuffer.numItems -= n;
	this.rBuffer.numItems -= n;
	this.cBuffer.numItems -= n;
	this.niListBuffer.numItems -= n;
	this.sigmaListBuffer.numItems -= n;

	this.rebaseBuffers();
}

// =====================================================
// Met a jour les buffers avec modification des tailles
// de tableaux.
Balls3D.rebaseBuffers = function()
{
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.centers), gl.DYNAMIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.rBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.radius), gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.niListBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.niList), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.sigmaListBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.sigmaList), gl.STATIC_DRAW);
}

// =====================================================
// Met a jour les buffers sans reallocation mémoire.
Balls3D.updateBuffers = function(vertices, radius, colors)
{
	if(vertices){
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(this.centers));
	}

	if(radius){
		gl.bindBuffer(gl.ARRAY_BUFFER, this.rBuffer);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(this.radius));
	}

	if(colors){
		gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(this.colors));
	}
}

// =====================================================
// Méthode appelée lorsqu'une boule de la boîte a été
// modifiée, mais pas encore dans les tableaux et buffers
Balls3D.ballChangedAtIndex = function(i, ball)
{
	var ind = this.numberOfPlayers + i;
	this.radius[ind] = ball.radius;
	this.centers[ind*3] = ball.pos[0];
	this.centers[ind*3+1] = ball.pos[1];
	this.centers[ind*3+2] = ball.pos[2];

	this.updateBuffers(true, true, false);
}

// =====================================================
// Méthode appelée lorsqu'une boule a été ajoutée dans
// la boîte mais pas encore dans les tableaux et buffers
Balls3D.ballAddedAtIndex = function(i, ball)
{
	var ind = this.numberOfPlayers + i;
	this.centers.splice(ind*3, 0, ball.pos[0]);
	this.centers.splice(ind*3+1, 0, ball.pos[1]);
	this.centers.splice(ind*3+2, 0, ball.pos[2]);
	this.vBuffer.numItems++;

	this.radius.splice(ind, 0, ball.radius);
	this.rBuffer.numItems++;

	var r = this.colors[(ind)*4];
	var g = this.colors[(ind)*4+1];
	var b = this.colors[(ind)*4+2];
	var a = this.colors[(ind)*4+3];
	this.colors.splice(ind*4, 0, r);
	this.colors.splice(ind*4+1, 0, g);
	this.colors.splice(ind*4+2, 0, b);
	this.colors.splice(ind*4+3, 0, a);
	this.cBuffer.numItems++;

	var ni = this.niList[ind];
	this.niList.splice(ind, 0, ni);
	this.niListBuffer.numItems++;

	var sigma = this.sigmaList[ind];
	this.sigmaList.splice(ind, 0, sigma);
	this.sigmaListBuffer.numItems++;

	this.numberOfBalls++;

	this.rebaseBuffers();
}

Balls3D.ballRemovedAtIndex = function(i)
{
	var ind = this.numberOfPlayers + i;
	this.centers.splice(ind*3, 3);
	this.vBuffer.numItems--;

	this.radius.splice(ind, 1);
	this.rBuffer.numItems--;

	this.colors.splice(ind*4, 4);
	this.cBuffer.numItems--;

	this.niList.splice(ind, 1);
	this.niListBuffer.numItems--;

	this.sigmaList.splice(ind, 1);
	this.sigmaListBuffer.numItems--;

	this.numberOfBalls--;

	this.rebaseBuffers();
}

// =====================================================
// GESTION DES COULEURS
// =====================================================
// =====================================================
// Recolore les boules de la boite selon une palette de
// couleurs
// Buffers et shaders ne sont pas gérés.
// updateBuffers(false, false, true) devrait être
// appelée pour prendre les modifications en compte.
Balls3D.colorizeBalls = function(palette)
{
	this.ballsPalette = palette;
	for(var i = this.numberOfPlayers; i < this.numberOfPlayers + this.numberOfBalls; ++i){
		var rgb = ColorGenerator.randomColor(palette);
		this.colors[i*4+0] = rgb[0]; // r
		this.colors[i*4+1] = rgb[1]; // g
		this.colors[i*4+2] = rgb[2]; // b
	}
}

// =====================================================
// Recolore les boules joueurs de la boite selon une
// palette de couleurs.
// Buffers et shaders ne sont pas gérés.
// updateBuffers(false, false, true) devrait être appelée
// pour prendre les modifications en compte.
Balls3D.colorizePlayers = function(palette)
{
	this.playersPalette = palette;
	for(var i = 0; i < this.numberOfPlayers; ++i){
		var rgb = ColorGenerator.randomColor(palette);
		this.colors[i*4+0] = rgb[0]; // r
		this.colors[i*4+1] = rgb[1]; // g
		this.colors[i*4+2] = rgb[2]; // b
	}
}


// =====================================================
// Change le mode d'affichage (couleur, brdf, normales,...)
Balls3D.setDisplayMode = function(i)
{
	this.displayMode = i;
}

// =====================================================
// SETTERS sur les parametres de la boite
// =====================================================
// =====================================================
// Change la vitesse de calcul
Balls3D.setDeltaT = function(value)
{
	this.box.deltaT = value;
}
// =====================================================
// Change l'elasticité des murs
Balls3D.setElasticity = function(value)
{
	this.box.elasticity = value;
}
// =====================================================
// Change l'épaisseur de l'air
Balls3D.setLambda = function(value)
{
	this.box.lambda = value;
}
// =====================================================
// Change le coefficient de rugosité des boules 
Balls3D.setSigma = function(value)
{
	this.sigmaFactor = value;
	gl.useProgram(this.shader);
	gl.uniform1f(this.shader.sigmaFactorUniform, value);
}
// =====================================================
// Change l'indice de refraction des boules
Balls3D.setNi = function(value)
{
	this.niFactor = value;
	gl.useProgram(this.shader);
	gl.uniform1f(this.shader.niFactorUniform, value);
}