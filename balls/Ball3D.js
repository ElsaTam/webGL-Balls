// =====================================================
// CLASSE BOULE, permet de garder les donnees d'une boule
// et de gerer les forces de collisions
// =====================================================
class Ball3D
{
	constructor(pos, vel, radius, mass){
		this.pos = pos;
		this.vel = vel;
		this.radius = radius;
		this.mass = mass;

		this.force = [0, 0, 0];

		this.k = 10.0;
	}

	// =====================================================
	// Teste s'il y a collision entre this et otherBall.
	// Si oui, calcule les deux forces induites.
	collideWithBall(otherBall)
	{
		var u = [this.pos[0] - otherBall.pos[0],
				 this.pos[1] - otherBall.pos[1],
				 this.pos[2] - otherBall.pos[2]]
		var dist = vec3.length(u);
		var sumRadius = this.radius + otherBall.radius;
		if(dist < sumRadius){
			var d = sumRadius - dist;

			var fx = this.k * d * u[0]/dist;
			var fy = this.k * d * u[1]/dist;
			var fz = this.k * d * u[2]/dist;
			this.addForce(fx, fy, fz);
			otherBall.addForce(-fx, -fy, -fz);

			// Decaler les positions des boules pour qu'elles ne
			// soient plus fusionnees l'une dans l'autre permet
			// de stabiliser plus rapidement l'animation.
			// Donc meme si cela peut entraîner des interactions
			// qui ne seraient pas prises en compte, on le garde.
			this.pos[0] += u[0]/dist * d/2;
			this.pos[1] += u[1]/dist * d/2;
			this.pos[2] += u[2]/dist * d/2;

			otherBall.pos[0] -= u[0]/dist * d/2;
			otherBall.pos[1] -= u[1]/dist * d/2;
			otherBall.pos[2] -= u[2]/dist * d/2;
		}
	}

	// =====================================================
	// Change la vélocité d'une boule.
	setVel(newVel)
	{
		this.vel[0] = newVel[0];
		this.vel[1] = newVel[1];
		this.vel[2] = newVel[2];
	}

	// =====================================================
	// Met a jour position et velocite d'une boule en fonction
	// des forces qui s'y appliquent.
	updatePos(deltaT)
	{
		this.pos[0] += deltaT * this.vel[0];
		this.pos[1] += deltaT * this.vel[1];
		this.pos[2] += deltaT * this.vel[2];
	}

	updateVel(deltaT)
	{
		this.vel[0] += deltaT * this.force[0]/this.mass;
		this.vel[1] += deltaT * this.force[1]/this.mass;
		this.vel[2] += deltaT * this.force[2]/this.mass;
		this.force = [0, 0, 0];
	}

	// =====================================================
	// Ajoute une force appliquee sur la boule.
	addForce(fx, fy, fz)
	{
		this.force[0] += fx;
		this.force[1] += fy;
		this.force[2] += fz;
	}

	// =====================================================
	// Renvoie une copie de la boule.
	copy()
	{
		return new Ball3D(this.pos.slice(), this.vel.slice(), this.radius, this.mass);
	}

	// =====================================================
	// Affiche dans la console les informations de la boule.
	toConsole()
	{
		console.log("+=========================================");
		console.log("|                 Boule");
		console.log("+-----------------------------------------");
		console.log("| position | " + this.pos[0] + ", " + this.pos[1] + ", " + this.pos[2]);
		console.log("+----------+------------------------------");
		console.log("| velocite | " + this.vel[0] + ", " + this.vel[1] + ", " + this.vel[2]);
		console.log("+----------+------------------------------");
		console.log("| radius   | " + this.radius);
		console.log("+----------+------------------------------");
		console.log("| masse    | " + this.mass);
		console.log("+----------+------------------------------");
		console.log("| forces   | " + this.force[0] + ", " + this.force[1] + ", " + this.force[2]);
		console.log("+=========================================");
	}
}


// =====================================================
// CLASSE BOULE JOUEUR, permet de garder les donnees
// d'une boule controlee par le joueur qui n'est soumise
// a aucune force de collision.
// =====================================================

class BallPlayer3D extends Ball3D
{
	constructor(pos, vel, radius, mass){
		super(pos, vel, radius, mass);
	}

	collideWithBall(otherBall)
	{
		var u = [this.pos[0] - otherBall.pos[0],
				 this.pos[1] - otherBall.pos[1],
				 this.pos[2] - otherBall.pos[2]]
		var dist = vec3.length(u);
		var sumRadius = this.radius + otherBall.radius;
		if(dist < sumRadius){
			var fx = this.k * (sumRadius - dist) * u[0]/dist;
			var fy = this.k * (sumRadius - dist) * u[1]/dist;
			var fz = this.k * (sumRadius - dist) * u[2]/dist;
			otherBall.addForce(-fx, -fy, -fz);

			otherBall.pos[0] -= u[0]/dist * (sumRadius - dist);
			otherBall.pos[1] -= u[1]/dist * (sumRadius - dist);
			otherBall.pos[2] -= u[2]/dist * (sumRadius - dist);
		}
	}

	updateVel()
	{
		
	}

	addForce(fx, fy, fz)
	{

	}

	copy(){
		return new BallPlayer3D(this.pos.slice(), this.vel.slice(), this.radius, this.mass);
	}
}