/** Matrices 
 * Coefficients are stored by COLUMN, so access is made using ROW+COLUMN*4 ...
 */
Matrix.prototype = new Object();
Matrix.prototype.constructor = Matrix;

/* The type of array (for best performances, if possible) */
var MAT_ARRAY_TYPE = (typeof Float32Array == 'undefined' ) ? Array : Float32Array ;

// General constructor
function Matrix() {
    // A 4x4 matrix contains 16 floats ...
    switch (arguments.length) {
    case 0: 
	return this.defaultConstructor();
    case 1: 
	return this.copyConstructor(arguments[0]);
    case 3:
	return this.createLookAt(arguments[0], arguments[1], arguments[2]);
    case 4: 
	return this.createPerspective(arguments[0], arguments[1],
				      arguments[2], arguments[3]);
    default: throw "Bad Matrix constructor call";
    };
    return this;
};

// getter
Matrix.prototype.get = function(i,j) {
    if( i<0 || i>=4 ) throw("Matrix getter: bad line value ("+i+")");
    if( j<0 || j>=4 ) throw("Matrix getter: bad column value ("+j+")");
    return this.m[i+4*j];
};
// setter
Matrix.prototype.set = function(i,j,v) {
    if( i<0 || i>=4 ) throw("Matrix setter: bad line value ("+i+")");
    if( j<0 || j>=4 ) throw("Matrix setter: bad column value ("+j+")");
    this.m[i+j*4] = v; 
};

// utilitary function
Matrix.prototype.deg_to_rad = function( arad )
{
    return ((arad) * 0.017453292519943295769236907684886127134428718885417254560971914401710091146034494436822415696345094823 ) ;
};

// Returns the data to the GPU
Matrix.prototype.getGLVector = function()
{
  return this.m ; 
} ;

// to print a matrix ...
Matrix.prototype.toString = function() {
    var ch = "";
    for(l=0;l<4;++l){
	ch+="[ ";
	for(c=0;c<3;++c) {
	    ch+=this.get(l,c)+", ";
	}
	ch+=this.get(l,3)+" ]\n";
    }
    return ch;
};

// Retourne la matrice de look at
Matrix.prototype.createLookAt = function( eye, center, _up )
{    
    if((!eye instanceof Vector) 
       || (!center instanceof Vector) 
       || (!_up instanceof Vector))
	throw("createLookAt: bad parameter");
    
    var   dst = new Vector(center).subtract(eye).normalize(); // Z
    var right = dst.cross(_up).normalize();              // X
    var    up = right.cross(dst).normalize();            // Y

    this.m = new MAT_ARRAY_TYPE(16);
    this.m[ 0] = right.x();
    this.m[ 1] =    up.x() ;
    this.m[ 2] = - dst.x() ;
    this.m[ 3] =     0.0 ; 
    
    this.m[ 4] = right.y() ;
    this.m[ 5] =    up.y() ; 
    this.m[ 6] = - dst.y() ; 
    this.m[ 7] =     0.0 ;
    
    this.m[ 8] = right.z() ;
    this.m[ 9] =    up.z() ;
    this.m[10] = - dst.z() ; 
    this.m[11] =     0.0 ;
    
    this.m[12] = - right.dot(eye);
    this.m[13] = -    up.dot(eye);
    this.m[14] =     dst.dot(eye);
    this.m[15] =       1.0 ; 
    
    return this ; 
};


// ================================================================
// transform a matrix to a normal matrix ...
Matrix.prototype.toNormal = function( ) 
{
    // set last column to 0
    this.m[3] = this.m[7] = this.m[11] = 0.0;
    // set last line to 0
    this.m[12] = this.m[13] = this.m[14] = this.m[15] = 0.0;
    
    // compute the 3x3 invert, and transpose it ...
    var a = this.m[0]; var b = this.m[4]; var c = this.m[8];
    var d = this.m[1]; var e = this.m[5]; var f = this.m[9];
    var g = this.m[2]; var h = this.m[6]; var i = this.m[10];
    
    var inv_det = 1.0 / (a*(e*i-h*f) + d*(c*h-i*b) + g*(b*f-e*c));
    // compute directly the transpose matrix
    this.m[0] = (e*i-f*h)*inv_det;
    this.m[1] = (c*h-b*i)*inv_det;
    this.m[2] = (b*f-c*e)*inv_det;
    
    this.m[4] = (f*g-d*i)*inv_det;
    this.m[5] = (a*i-c*g)*inv_det;
    this.m[6] = (c*d-a*f)*inv_det;
    
    this.m[8] = (d*h-e*g)*inv_det;
    this.m[9] = (b*g-a*h)*inv_det;
    this.m[10]= (a*e-b*d)*inv_det;
    
    // and returns
    return this;
} ;


// ================================================================
Matrix.prototype.apply = function( v ) 
{
    if(!v instanceof Vector)
	throw("Matrix.apply: bad parameter");
    var inv = 1.0 / this.m[15]; // do not forget!
    var x=v.m[0]*inv;
    var y=v.m[1]*inv;
    var z=v.m[2]*inv;
    return new Vector( this.m[0]*x + this.m[4]*y + this.m[ 8]*z + this.m[12]*inv,
		       this.m[1]*x + this.m[5]*y + this.m[ 9]*z + this.m[13]*inv,
		       this.m[2]*x + this.m[6]*y + this.m[10]*z + this.m[14]*inv );
};
					      
// ================================================================
Matrix.prototype.toConsole = function() 
{
    // print line by line ...
    for(var id=0; id<4; id++) 
	console.log(" [ "+this.m[id]+" "+this.m[4+id]+" "+this.m[8+id]+" "+this.m[12+id]+" ]");    
};


// ================================================================
Matrix.prototype.equals = function(that)
{
    var epsilon = (arguments.length==2)?arguments[1]:0; 
    if((!that instanceof Matrix) || (!isFinite(epsilon)))
	throw("Matrix equals: bad parameter");
    for(var i=0;i<16;++i)
	if(Math.abs(this.m[i]-that.m[i])>epsilon)
	    return false;
    return true;
};

// ================================================================
// STUDENT WORK BEGIN HERE ...

// ================================================================
// Identity constructor
Matrix.prototype.defaultConstructor = function() {
    this.m = new MAT_ARRAY_TYPE( 16 );
    for(var i=0; i<4; ++i) {
	for(var j=0; j<4; ++j) {
	    this.set( i, j, i==j? 1 : 0 );
	}
    }
};

// ================================================================
// Copy constructor
Matrix.prototype.copyConstructor = function(that) {
    if( that instanceof Matrix ) {
	this.m = new MAT_ARRAY_TYPE( 16 );
	for(var i=0; i<16; ++i) 
	    this.m[i] = that.m[i];
    }
    else
	throw "Matrix: bad copy constructor call";
};

// ================================================================
// Addition of two matrices (+=)
Matrix.prototype.add = function(that) {
    if(!(that instanceof Matrix))
	throw("Matrix addition: bad parameter!");
    for(var i=0;i<16;++i) this.m[i] += that.m[i];
    // mandatory: let the following line survive!
    return this;
};

// ================================================================
// Multiplication of two matrices (*=)
Matrix.prototype.mul = function(that) {
    if(!(that instanceof Matrix))
	throw("Matrix multiplication: bad parameter!");
    var t=new MAT_ARRAY_TYPE(this.m);
    for(var i=0;i<4;++i) {
	for(var j=0;j<4;++j) {
	    var v = 0;
	    for(var k=0;k<4;++k)
		v += t[i+4*k]*that.get(k,j);
	    this.set(i,j,v);
	}
    }
    // mandatory: let the following line survive!
    return this;
};

// ================================================================
// This becomes the transposition of this
Matrix.prototype.transpose = function(a)
{
    for(var l=0;l<4;++l) {
	for(var c=l+1;c<4;++c) {
	    var v = this.get(l,c);
	    this.set(l,c,this.get(c,l));
	    this.set(c,l,v);
	}
    }
    return this;
};


// ================================================================
// inverts a matrix
Matrix.prototype.invert = function()
{
    var a00 = this.m[0],  a01 = this.m[1],  a02 = this.m[2],  a03 = this.m[3];
    var a10 = this.m[4],  a11 = this.m[5],  a12 = this.m[6],  a13 = this.m[7];
    var a20 = this.m[8],  a21 = this.m[9],  a22 = this.m[10], a23 = this.m[11];
    var a30 = this.m[12], a31 = this.m[13], a32 = this.m[14], a33 = this.m[15];
    
    var b00 = a00*a11 - a01*a10;
    var b01 = a00*a12 - a02*a10;
    var b02 = a00*a13 - a03*a10;
    var b03 = a01*a12 - a02*a11;
    var b04 = a01*a13 - a03*a11;
    var b05 = a02*a13 - a03*a12;
    var b06 = a20*a31 - a21*a30;
    var b07 = a20*a32 - a22*a30;
    var b08 = a20*a33 - a23*a30;
    var b09 = a21*a32 - a22*a31;
    var b10 = a21*a33 - a23*a31;
    var b11 = a22*a33 - a23*a32;
    
    var invDet = 1 / (b00*b11 - b01*b10 + b02*b09 + b03*b08 - b04*b07 + b05*b06);
    
    this.m[0]  = ( a11*b11 - a12*b10 + a13*b09)*invDet;
    this.m[1]  = (-a01*b11 + a02*b10 - a03*b09)*invDet;
    this.m[2]  = ( a31*b05 - a32*b04 + a33*b03)*invDet;
    this.m[3]  = (-a21*b05 + a22*b04 - a23*b03)*invDet;
    this.m[4]  = (-a10*b11 + a12*b08 - a13*b07)*invDet;
    this.m[5]  = ( a00*b11 - a02*b08 + a03*b07)*invDet;
    this.m[6]  = (-a30*b05 + a32*b02 - a33*b01)*invDet;
    this.m[7]  = ( a20*b05 - a22*b02 + a23*b01)*invDet;
    this.m[8]  = ( a10*b10 - a11*b08 + a13*b06)*invDet;
    this.m[9]  = (-a00*b10 + a01*b08 - a03*b06)*invDet;
    this.m[10] = ( a30*b04 - a31*b02 + a33*b00)*invDet;
    this.m[11] = (-a20*b04 + a21*b02 - a23*b00)*invDet;
    this.m[12] = (-a10*b09 + a11*b07 - a12*b06)*invDet;
    this.m[13] = ( a00*b09 - a01*b07 + a02*b06)*invDet;
    this.m[14] = (-a30*b03 + a31*b01 - a32*b00)*invDet;
    this.m[15] = ( a20*b03 - a21*b01 + a22*b00)*invDet;
    
    return this;
};

// ================================================================
// Translation constructor: this = T x this
Matrix.prototype.translate = function(that) {
    if(!that instanceof Vector) 
	throw "Matrix translate: bad parameter";
    
    this.m[12] += that.m[0]*this.m[15];
    this.m[13] += that.m[1]*this.m[15];
    this.m[14] += that.m[2]*this.m[15];
    
    return this;
};


// ================================================================
// Scaling constructor
Matrix.prototype.scale = function(that) {
    if(!isFinite(that)) 
	throw "Matrix scale: bad parameter";
   
    for(var i=0;i<3;++i) {
	for(var j=0;j<4; ++j) {
	    this.m[i+j*4] *= that;
	}
    }
    return this;
};


// ================================================================
// return this=RotateX(ange_rad)*this 
Matrix.prototype.rotateX = function( angle_rad )
{
    var c = Math.cos( angle_rad ) ; 
    var s = Math.sin( angle_rad ) ;
    
    // only the second and third lines are modified
    for(var i=0; i<4; ++i) {
	var a1 = this.get(1,i);
	var a2 = this.get(2,i);
	this.set(1, i, c*a1-s*a2 );
	this.set(2, i, s*a1+c*a2 );
    }

    return this; 
};

// ================================================================
// return this=RotateY(ange_rad)*this 
Matrix.prototype.rotateY = function( angle_rad )
{
    var c = Math.cos( angle_rad ) ; 
    var s = Math.sin( angle_rad ) ;

    // only the first and third lines are modified ...
    for(var i=0;i<4;i++) {
	var a0 = this.get(0, i);
	var a2 = this.get(2, i);
	this.set(0, i, c*a0 + s*a2);
	this.set(2, i,-s*a0 + c*a2);
    }

    return this; 
};

// ================================================================
// return this=RotateZ(ange_rad)*this 
Matrix.prototype.rotateZ = function( angle_rad )
{
    var c = Math.cos( angle_rad ) ; 
    var s = Math.sin( angle_rad ) ;

    // only the first two lines are modified ...
    for(var i=0; i<4; ++i) {
	var a0 = this.get(0, i);
	var a1 = this.get(1, i);
	this.set(0, i, c*a0-s*a1);
	this.set(1, i, s*a0+c*a1);
    }
    return this; 
};



// ================================================================
// Retourne une matrice de vue en perspective (centrée en O !)
Matrix.prototype.createPerspective = function( fov , aspect , near , far )
{
    var halfHeight  = Math.tan( fov ) * near ; 
    var halfWidth   = halfHeight * aspect ; 
    
    this.m = new MAT_ARRAY_TYPE( 16 ) ;
    
    this.m[0] = near / halfWidth ;
    this.m[1] = 0.0 ;
    this.m[2] = 0.0 ;
    this.m[3] = 0.0 ; 
    
    this.m[4] = 0.0 ;
    this.m[5] = near / halfHeight ;
    this.m[6] = 0.0 ;
    this.m[7] = 0.0 ;
    
    this.m[8] = 0.0;
    this.m[9] = 0.0;
    this.m[10] = - (far + near ) / ( far - near ) ;
    this.m[11] = - 1.0 ;
    
    this.m[12] = 0.0 ;
    this.m[13] = 0.0 ;
    this.m[14] = - ( 2.0 * far * near ) / ( far - near ) ;
    this.m[15] = 0.0 ; 
    
    return this ; 
};


// ================================================================
// which: which coordinate is changed
// from:  using this one
// value: multiplication factor
Matrix.prototype.shearing = function( which, from, value ) {
    if(from<0 || from>3 || which<0 || which>3 || from==which)
	throw("Matrix shearing: bad parameter");
    // same matrice, except the line "which"
    for(var c=0;c<4;++c)
	this.set(from, c, this.get(from,c) + value*this.get(which, from));
    // mandatory
    return this;
};
