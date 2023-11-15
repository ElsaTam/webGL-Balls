// =====================================================
// Classe CAMERA. Permet de calculer à tout moment la
// position fictive de la caméra, ainsi que son
// orientation, dans un repère où la scène est centrée
// en (0, 0, 0) et non pas la caméra.
// =====================================================

class Camera
{

	constructor(eyePos, lookAt, width, height, fovInRad, near, far)
	{
		this.pos = eyePos;
		this.lookAt = lookAt;
		this.direction = new Vector(lookAt).subtract(eyePos);
		this.radius = this.direction.length();
		//console.log(this.radius);
		this.direction = this.direction.normalize();
		var up = new Vector(0, 0, 1);
		var epsilon = 0.00001;
		if(up.dot(this.direction) > (1 - epsilon) || up.dot(this.direction) < (1 + epsilon)){
			this.right = new Vector(1, 0, 0);
		}
		else{
			this.right = this.direction.cross(up).normalize();
		}
		this.up = this.right.cross(this.direction).normalize();

		//console.log(this.up.getGLVector());
		this.width = width;
		this.height = height;
		this.fov = fovInRad;
		this.near = near;
		this.far = far;

		this.theta = 0;
		this.phi = 0;

		this.toSphericalCoord();
		this.setCameraPos();
	}

	// =================================================
	// Calcule les coordonnees sphériques à partir des
	// coordonnées cartésiennes.
	toSphericalCoord()
	{
		this.radius = (this.pos.subtract(this.lookAt)).length();
		this.phi = Math.acos(this.pos.z()/this.radius);
		if(this.pos.x() == 0 && this.pos.y() == 0)
			this.theta = 0;
		else if(this.pos.y() >= 0)
			this.theta = Math.acos(this.pos.x() / (Math.sqrt(this.pos.x()*this.pos.x()+this.pos.y()*this.pos.y())));
		else
			this.theta = 2*Math.PI - Math.acos(this.pos.x() / (Math.sqrt(this.pos.x()*this.pos.x()+this.pos.y()*this.pos.y())));
	}

	// =================================================
	// Calcule les coordonnees cartésiennes à partir des
	// coordonnées sphériques.
	toCartesianCoord(theta, phi, radius)
	{
		var x = radius * Math.sin(phi) * Math.sin(theta);
		var y = radius * Math.sin(phi) * Math.cos(theta);
		var z = radius * Math.cos(phi);
		return (new Vector(x, y, z));
	};

	// =================================================
	// Calcule la nouvelle position et orientation de la
	// caméra
	setCameraPos()
	{
		var newPos = this.toCartesianCoord(this.theta, this.phi, this.radius);
		var newUp = this.toCartesianCoord(this.theta, this.phi - Math.PI/2, this.radius);
		for (var i = 0; i < 3; i++){
			this.pos.m[i] = newPos.m[i];
			this.up.m[i] = newUp.m[i];
		}
		this.up.normalize();
		this.direction = new Vector(this.lookAt).subtract(this.pos).normalize();
		this.right = this.direction.cross(this.up).normalize();
	};

	// =================================================
	// Tourne la caméra autour de l'axe Z
	addRotateTheta(val){
		this.theta += val;
		this.setCameraPos(); 
	};

	// =================================================
	// Tourne la caméra autour de l'axe X
	addRotatePhi(val){
		this.phi += val;
		this.setCameraPos();
	};

	// =================================================
	// Avance ou recule la caméra
	zoom(val){
		this.radius += val;
		this.setCameraPos(); 
	};

	// =================================================
	// Affiche les infos de la caméra dans la console
	toConsole()
	{
		console.log("========= Camera =========");
		console.log("Position : " + this.pos.toString());
		console.log("LookAt : " + this.lookAt.toString());
		console.log("Direction : " + this.direction.toString());
		console.log("Up : " + this.up.toString());
		console.log("Right : " + this.right.toString());
		console.log("Radius : " + this.radius);
		console.log("Phi : " + this.phi);
		console.log("Theta : " + this.theta);
		console.log("==========================");
	}

}