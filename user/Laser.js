// =====================================================
// LASER. Permet d'afficher une droite représentant un
// tir de laser.
// =====================================================


var Laser = { fname:'laser', loaded:-1, shader:null};

// =====================================================
// Initialisation
Laser.initAll = function()
{
    this.tick = -1;

    var vertices = [0, 0, 0,
                0, 0, 0];
    this.vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    this.vBuffer.itemSize = 3;
    this.vBuffer.numItems = 2;

    loadShaders(this);
}

// =====================================================
// Indique le début et la fin de la ligne à tracer.
Laser.setLine = function(begin, end)
{
    var vertices = [
        begin[0], begin[1], begin[2],
        end[0], end[1], end[2]
    ];
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(vertices));

    this.tick = 0;
}

// =====================================================
Laser.setShadersParams = function()
{
    gl.useProgram(this.shader);
    this.shader.vAttrib = gl.getAttribLocation(this.shader, "aVertexPosition");
    gl.enableVertexAttribArray(this.shader.vAttrib);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
    gl.vertexAttribPointer(this.shader.vAttrib, this.vBuffer.itemSize, gl.FLOAT, false, 0, 0);
}

// =====================================================
Laser.draw = function()
{
    if(this.tick >= 0 && this.tick < 10)
    {
        this.tick++;
        if(this.shader) {		
            this.setShadersParams();
            gl.drawArrays(gl.LINES, 0, this.vBuffer.numItems);
        }
    }
}