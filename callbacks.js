// =====================================================
var mouseDownOnJoystick = false;
var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;
var rotZ = 0;
var rotX = 0;//-Math.PI /2;
var button = 0;
var ctrlLight = false;


// =====================================================
function startGL() {
	webGLStart();
	webGLStartJoystick();
	tick();
}

// =====================================================
window.requestAnimFrame = (function()
{
	return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function(/* function FrameRequestCallback */ callback,
									/* DOMElement Element */ element)
         {
            window.setTimeout(callback, 1000/60);
         };
})();

// ==========================================
function tick() {
	requestAnimFrame(tick);
	if(shadersOk())
		Balls3D.animate();
	drawScene();
	drawJoystick();
}

// =====================================================
function degToRad(degrees) {
	return degrees * Math.PI / 180;
}

// =====================================================
// Zoom
function handleWheelEvent(event) {
	translate[2] -= event.deltaY * 0.005;
	event.preventDefault();
}

// =====================================================
// Fait descendre ou monter la boule
function handleWheelEventOnJoystick(event) {
	if(event.deltaY < 0)
		Balls3D.move([0, 0, 0.05]);
	else
		Balls3D.move([0, 0, -0.05]);
	event.preventDefault();
}


// =====================================================
function handleMouseDown(event) {
	button = event.button;
	if(button == 1){
		event.preventDefault();
	}
	mouseDown = true;
	lastMouseX = event.clientX;
	lastMouseY = event.clientY;
}

// =====================================================
// Clic sur le joystick bleu
function handleMouseDownOnJoystick(event) {
	if(mouseDown)
		return;
	//drawJoystick();
	mouseDownOnJoystick = true;
	lastMouseX = event.clientX;
	lastMouseY = event.clientY;
}

// =====================================================
function handleMouseUp(event) {
	if(mouseDownOnJoystick){ // clic sur le joystick
		Balls3D.movePlayer(0, 0);
		Joystick2D.moveClic(glJoystick.viewportWidth/2, glJoystick.viewportHeight/2);
	}
	mouseDown = false;
	mouseDownOnJoystick = false;
}


// =====================================================
// Déplacement de la vue ou de la source lumineuse
function handleMouseMove(event) {
	if (!mouseDown) {
		return;
	}

	var newX = event.clientX;
	var newY = event.clientY;

	var deltaX = newX - lastMouseX;
	var deltaY = newY - lastMouseY;

	if(mouseDown){ // clic sur la boite a boules
		if(ctrlLight){ // clic avec Ctrl pushed : on bouge la lumière
			LightSource.move(newX, newY);
		} else
		{
			dX = degToRad(deltaY / 2);
			dZ = degToRad(deltaX / 2);
			rotX += dX;
			rotZ += dZ;

			camera.addRotateTheta(dZ);
			camera.addRotatePhi(dX);

			mat4.identity(objMatrix);
			mat4.rotate(objMatrix, rotX, [1, 0, 0]);
			mat4.rotate(objMatrix, rotZ, [0, 0, 1]);
		}
	}

	lastMouseX = newX
	lastMouseY = newY;
}

// =====================================================
// Déplacement de la boule joueur
function handleMouseMoveOnJoystick(event) {
	if (!mouseDownOnJoystick) {
		return;
	}

	var target = target || event.target;
	var rect = target.getBoundingClientRect();
	var X = (event.clientX - rect.left) * target.width / target.clientWidth;
	var Y = (event.clientY - rect.top) * target.height / target.clientHeight;
	Joystick2D.moveClic(X, Y);
	
	X = X / glJoystick.viewportWidth * 2 - 1;
	Y = Y / glJoystick.viewportHeight * -2 + 1;

	var dep = [X*0.5, Y*0.5, 0];
    var rotMatrix = mat4.create();
    mat4.identity(rotMatrix);
    mat4.rotate(rotMatrix, -rotZ, [0, 0, 1]);
    mat4.multiplyVec3(rotMatrix, dep);

	Balls3D.movePlayer(dep[0], dep[1]);
}


// =====================================================
// KEYBOARD MANAGEMENT
// =====================================================

// =====================================================
// Ctrl appuyé --> déplacement de la source lumineuse
function handleKeyDown(event) {
	switch(event.code){
		case 'ControlLeft': ctrlLight = true; break;
	}
}

// =====================================================
// Déplace la boule joueur avec le clavier, ou tire un
// un laser (touche X)
function handleKeyPress(event) {
	var d = 0.01;
	console.log(event.code);
    switch(event.code){
    	case 'KeyW': event.preventDefault(); var dep = [0,d,0]; break; // backward
    	case 'KeyS': event.preventDefault(); var dep = [0,-d,0]; break; // forward
    	case 'KeyD': event.preventDefault(); var dep = [d,0,0]; break; // right
    	case 'KeyA': event.preventDefault(); var dep = [-d,0,0]; break; // left
    	case 'NumpadAdd': event.preventDefault(); var dep = [0,0,d]; break; // up
		case 'NumpadSubtract': event.preventDefault(); var dep = [0,0,-d]; break; // down
		case 'KeyX': event.preventDefault(); Balls3D.shootLaser(); break; // laser
    }
    if (dep) {
	    var rotMatrix = mat4.create();
	    mat4.identity(rotMatrix);
	    mat4.rotate(rotMatrix, -rotZ, [0, 0, 1]);
        mat4.multiplyVec3(rotMatrix, dep);
        Balls3D.move(dep);
    }
}

// =====================================================
function handleKeyUp(event) {
	switch(event.code){
		case 'ControlLeft': ctrlLight = false; break;
	}
}

// =====================================================
// MODIFICATION DE LA COULEUR
// =====================================================

// =====================================================
function colorBright()
{
	Balls3D.colorizeBalls(ColorsEnum.bright);
	Balls3D.colorizePlayers(ColorsEnum.grey);
	Balls3D.updateBuffers(false, false, true);
}

// =====================================================
function colorPastel()
{
	Balls3D.colorizeBalls(ColorsEnum.pastel);
	Balls3D.colorizePlayers(ColorsEnum.dark);
	Balls3D.updateBuffers(false, false, true);
}

// =====================================================
function colorDark()
{
	Balls3D.colorizeBalls(ColorsEnum.dark);
	Balls3D.colorizePlayers(ColorsEnum.light);
	Balls3D.updateBuffers(false, false, true);
}

// =====================================================
function colorLight()
{
	Balls3D.colorizeBalls(ColorsEnum.light);
	Balls3D.colorizePlayers(ColorsEnum.dark);
	Balls3D.updateBuffers(false, false, true);
}

// =====================================================
function colorRed()
{
	Balls3D.colorizeBalls(ColorsEnum.red);
	Balls3D.colorizePlayers(ColorsEnum.green);
	Balls3D.updateBuffers(false, false, true);
}

// =====================================================
function colorGreen()
{
	Balls3D.colorizeBalls(ColorsEnum.green);
	Balls3D.colorizePlayers(ColorsEnum.blue);
	Balls3D.updateBuffers(false, false, true);
}

// =====================================================
function colorBlue()
{
	Balls3D.colorizeBalls(ColorsEnum.blue);
	Balls3D.colorizePlayers(ColorsEnum.red);
	Balls3D.updateBuffers(false, false, true);
}

// =====================================================
function colorWarm()
{
	Balls3D.colorizeBalls(ColorsEnum.warm);
	Balls3D.colorizePlayers(ColorsEnum.cold);
	Balls3D.updateBuffers(false, false, true);
}

// =====================================================
function colorCold()
{
	Balls3D.colorizeBalls(ColorsEnum.cold);
	Balls3D.colorizePlayers(ColorsEnum.warm);
	Balls3D.updateBuffers(false, false, true);
}

// =====================================================
function colorGrey()
{
	Balls3D.colorizeBalls(ColorsEnum.grey);
	Balls3D.colorizePlayers(ColorsEnum.bright);
	Balls3D.updateBuffers(false, false, true);
}

// =====================================================
// MODIFICATION DE L'AFFICHAGE
// =====================================================

function colorGradient()
{
	Balls3D.setDisplayMode(0);
}

// =====================================================
function colorBRDFLambert()
{
	Balls3D.setDisplayMode(1);
}

// =====================================================
function colorBRDFCookTorrance()
{
	Balls3D.setDisplayMode(2);
}

// =====================================================
function colorNormal()
{
	Balls3D.setDisplayMode(3);
}

// =====================================================
function colorPosition()
{
	Balls3D.setDisplayMode(4);
}

// =====================================================
function colorPosToEye()
{
	Balls3D.setDisplayMode(5);
}

// =====================================================
function colorPosToLight()
{
	Balls3D.setDisplayMode(6);
}

// =====================================================
// MODIFICATION DES PARAMETRES
// =====================================================

// =====================================================
// Ajoute des boules
function addButtonClicked()
{
	Balls3D.addBalls();
}

// =====================================================
// Enleve des boules
function removeButtonClicked()
{
	Balls3D.removeBalls();
}

// =====================================================
// Modifie le dt
function speedChanged()
{
	var spanValue = document.getElementById("speedValue");
	var slider = document.getElementById("speedSlider");
	spanValue.innerHTML = Number(slider.value).toFixed(4);
	if(drawOk)
		Balls3D.setDeltaT(slider.value);
}

// =====================================================
// Modifie l'élasticité des murs
function elasticityChanged()
{
	var spanValue = document.getElementById("elasticityValue");
	var slider = document.getElementById("elasticitySlider");
	spanValue.innerHTML = Number(slider.value).toFixed(2);
	if(drawOk)
		Balls3D.setElasticity(slider.value);
}

// =====================================================
// Modifie le coefficient de friction de l'air
function lambdaChanged()
{
	var spanValue = document.getElementById("lambdaValue");
	var slider = document.getElementById("lambdaSlider");
	spanValue.innerHTML = Number(slider.value).toFixed(1);
	if(drawOk)
		Balls3D.setLambda(slider.value);
}

// =====================================================
// Modifie le facteur de multiplication du coefficient
// de rugosité
function sigmaChanged()
{
	var spanValue = document.getElementById("sigmaValue");
	var slider = document.getElementById("sigmaSlider");
	spanValue.innerHTML = Number(slider.value).toFixed(1);
	if(drawOk)
		Balls3D.setSigma(slider.value);
}

// =====================================================
// Modifie le facteur de multiplication de l'indice de
// réfraction
function niChanged()
{
	var spanValue = document.getElementById("niValue");
	var slider = document.getElementById("niSlider");
	spanValue.innerHTML = Number(slider.value).toFixed(1);
	if(drawOk)
		Balls3D.setNi(slider.value);
}


// =====================================================
// INTERACTION AVEC LES BOULES
// =====================================================

// =====================================================
// Fait rebondir les boules qui sont au sol
function bounce()
{
	if(drawOk)
		Balls3D.bounce();
}

// =====================================================
// Ré-initialise le contenue de la boîte.
function reset()
{
	Balls3D.reset();
}

// =====================================================
function gravityWithCamera()
{
	Balls3D.box.gravityWithCamera =  document.getElementById("switch-gravity").checked;
}

// =====================================================
// MODIFICATION DE LA LUMIERE
// =====================================================

// =====================================================
// Modification de la composante rouge de la lumière
function rLightChanged()
{
	var spanValue = document.getElementById("rLightValue");
	var slider = document.getElementById("rLightSlider");
	spanValue.innerHTML = slider.value;
	if(drawOk){
		LightSource.color[0] = slider.value / 255;
		LightSource.updateColor();
	}
}

// =====================================================
// Modification de la composante verte de la lumière
function gLightChanged()
{
	var spanValue = document.getElementById("gLightValue");
	var slider = document.getElementById("gLightSlider");
	spanValue.innerHTML = slider.value;
	if(drawOk){
		LightSource.color[1] = slider.value / 255;
		LightSource.updateColor();
	}
}

// =====================================================
// Modification de la composante bleue de la lumière
function bLightChanged()
{
	var spanValue = document.getElementById("bLightValue");
	var slider = document.getElementById("bLightSlider");
	spanValue.innerHTML = slider.value;
	if(drawOk){
		LightSource.color[2] = slider.value / 255;
		LightSource.updateColor();
	}
}

// =====================================================
// Modification de l'intensité de la lumière
function intensityChanged()
{
	var spanValue = document.getElementById("intensityValue");
	var slider = document.getElementById("intensitySlider");
	spanValue.innerHTML = slider.value;
	if(drawOk)
		LightSource.intensity = slider.value;
}