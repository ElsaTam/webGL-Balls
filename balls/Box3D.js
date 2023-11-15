// =====================================================
// CLASSE BOITE 3D, permet de garder toutes les boules
// et de gerer la dynamique de la boite (l'animation)
// =====================================================

class Box3D
{
	constructor(rangeX, rangeY, rangeZ, elasticity, lambda, gravity, deltaT)
	{
		this.rangeX = rangeX;
		this.rangeY = rangeY;
		this.rangeZ = rangeZ;

		if(elasticity)
			this.elasticity = elasticity;
		else
			this.elasticity = 0.8;

		if(lambda)
			this.lambda = lambda;
		else
			this.lambda = 2;

		if(gravity && (gravity.length == 3))
			this.gravity = gravity;
		else
			this.gravity = [0.0, 0.0, -9.81];
		
		this.gravityWithCamera = false;

		if(deltaT)
			this.deltaT = deltaT;
		else
			this.deltaT = 0.001;

		this.balls = [];
		this.players = [];
	}

	// =====================================================
	// Ajoute une boule dans la boite, en queue de liste
	addBall(ball)
	{
		this.balls.push(ball);
		return this.balls.length;
	}

	// =====================================================
	// Enleve la dernire boule de la boite
	removeBall()
	{
		this.balls.pop();
		return this.balls.length;
	}

	// =====================================================
	// Ajoute une boule joueur dans la boite
	addPlayer(ball)
	{
		this.players.push(ball);
		return this.players.length;
	}

	// =====================================================
	// Gere toutes les forces et les differents calculs
	// lors d'une iteration
	applyDynamics()
	{
		// puisqu'on peut déplacer les boules joueurs en
		// modifiant leurs vitesses, on commence par mettre
		// à jour leurs positions.
		for(var i = 0; i < this.players.length; ++i){
			this.players[i].updatePos(this.deltaT);
			this.solvePlayerWalls(this.players[i]);
		}

		for(var i = 0; i < this.balls.length; ++i){
			let ball = this.balls[i];
			this.solveCollisionsFromBall(ball, i, -1);
			this.solveGravity(ball);
			this.solveFriction(ball);
			ball.updatePos(this.deltaT);
			this.solveWalls(ball);
		}
	}

	// =====================================================
	// Garde la boule joueur dans la boite, sans changer
	// sa vitesse
	solvePlayerWalls(player)
	{
		var pos = player.pos;
		var r = player.radius;
		if(pos[0] < this.rangeX[0] + r) // left
			player.pos[0] = this.rangeX[0] + r;
		if(pos[0] > this.rangeX[1] - r) // right
			player.pos[0] = this.rangeX[1] - r;
		if(pos[1] < this.rangeY[0] + r) // front
			player.pos[1] = this.rangeY[0] + r;
		if(pos[1] > this.rangeY[1] - r) // back
			player.pos[1] = this.rangeY[1] - r;
		if(pos[2] < this.rangeZ[0] + r) // bottom
			player.pos[2] = this.rangeZ[0] + r;
	}

	// =====================================================
	// Garde la boule dans la boite et inverse sa vitesse
	// selon un des axes an fonction du mur rencontré.
	solveWalls(ball)
	{
		var pos = ball.pos;
		var vel = ball.vel;
		var r = ball.radius;
		var e = this.elasticity;

		// left
		if(pos[0] < this.rangeX[0] + r){
			ball.pos[0] = this.rangeX[0] + r;
			ball.setVel([-vel[0]*e, vel[1], vel[2]]);
		}

		// right
		if(pos[0] > this.rangeX[1] - r){
			ball.pos[0] = this.rangeX[1] - r;
			ball.setVel([-vel[0]*e, vel[1], vel[2]]);
		}

		// front
		if(pos[1] < this.rangeY[0] + r){
			ball.pos[1] = this.rangeY[0] + r;
			ball.setVel([vel[0], -vel[1]*e, vel[2]]);
		}

		// back
		if(pos[1] > this.rangeY[1] - r){
			ball.pos[1] = this.rangeY[1] - r;
			ball.setVel([vel[0], -vel[1]*e, vel[2]]);
		}

		// bottom
		if(pos[2] < this.rangeZ[0] + r){
			ball.pos[2] = this.rangeZ[0] + r;
			ball.setVel([vel[0], vel[1], -vel[2]*e]);
		}
	}

	// =====================================================
	// Modifie la vitesse pour prendre en compte la gravité.
	solveGravity(ball)
	{
		if(this.gravityWithCamera){
			ball.vel[0] += this.deltaT * camera.up.x() * 9.81;
			ball.vel[1] += this.deltaT * camera.up.y() * 9.81;
			ball.vel[2] += this.deltaT * camera.up.z() * 9.81;
		} else{
			ball.vel[0] += this.deltaT * this.gravity[0];
			ball.vel[1] += this.deltaT * this.gravity[1];
			ball.vel[2] += this.deltaT * this.gravity[2];
		}
	}

	// =====================================================
	// Modifie la vitesse pour prendre en compte la force
	// de friction de l'air.
	solveFriction(ball)
	{
		ball.vel[0] -= this.deltaT * this.lambda * ball.vel[0];
		ball.vel[1] -= this.deltaT * this.lambda * ball.vel[1];
		ball.vel[2] -= this.deltaT * this.lambda * ball.vel[2];
	}

	// =====================================================
	// Itere sur toutes les boules pour calculer les forces
	// de collisions
	solveCollisionsFromBall(ball, indexBall)
	{
		for(var i = indexBall+1; i < this.balls.length; ++i){
			ball.collideWithBall(this.balls[i]);
		}
		for(var i = 0; i < this.players.length; ++i){
			// ici on appelle la méthode de la boule joueur
			// qui n'applique pas de modification de la
			// position sur celle-ci.
			this.players[i].collideWithBall(ball);
		}
		ball.updateVel(this.deltaT);
	}


	// =====================================================
	// Fait sauter les boules au sol
	bounce()
	{
		for(var i = 0; i < this.balls.length; ++i){
			var ball = this.balls[i];
			if(this.ballOnTheGround(ball)){
				var dx = Math.random() - 0.5; // [-0.5, 0.5]
				var dy = Math.random() - 0.5; // [-0.5, 0.5]
				var dz = Math.random() * 4.0 + 1.0; // [1.0, 5.0]
				ball.setVel([ball.vel[0] + dx, ball.vel[1] + dy, ball.vel[2] + dz]);
			}
		}
	}

	// =====================================================
	// Tire un laser de from vers to. Sépare en deux les
	// boules rencontrées selon l'axe ortho.
	shootLaser(from, to, ortho)
	{
		var size = 0.02;
		Laser.setLine([0.0, -1, 0.0], [0, 0, 0]);
		var dir = new Vector(to).subtract(from).normalize();
		for(var i = 0; i < this.balls.length; ++i)
		{
			var ball = this.balls[i];
			var pos = new Vector(ball.pos[0], ball.pos[1], ball.pos[2]);
			var vecFromToBall = new Vector(pos).subtract(from);
			var dist = vecFromToBall.cross(dir).length();
			if (dist-size/2 < ball.radius){
				if(ball.radius > 0.02){
					this.splitBall(i, ball, ortho);
					Balls3D.ballChangedAtIndex(i, ball);
					Balls3D.ballAddedAtIndex(i, ball);
					i++;
				} else{
					// remove ball
					this.balls.splice(i, 1);
					Balls3D.ballRemovedAtIndex(i);
				}
			}
		}
	}

	// =====================================================
	// Sépare une balle en deux selon le vecteur dir
	splitBall(i, ball, dir)
	{
		var newPos = [	ball.pos[0] - ball.radius * dir.x(),
						ball.pos[1] - ball.radius * dir.y(),
						ball.pos[2] - ball.radius * dir.z()];
		var newVel = ball.vel.slice();
		var newBall = new Ball3D(newPos, newVel, ball.radius/2, ball.mass/2);
		this.balls.splice(i, 0, newBall);

		ball.radius /= 2;
		ball.mass /= 2;
		ball.pos[0] += ball.radius * dir.x();
		ball.pos[1] += ball.radius * dir.y();
		ball.pos[2] += ball.radius * dir.z();
	}

	// =====================================================
	// Teste si une boule est sur le sol ou non.
	ballOnTheGround(ball)
	{
		var epsilon = 0.00;
		return ball.pos[2] <= ball.radius + epsilon;
	}
}