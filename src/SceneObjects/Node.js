/*
 * Params:
 * args - an object specifier for creating nodes (e.g.: {parent: optional, another Node object,
														renderer: a Renderer object,
														location: optional, a coordinates array,
														name: optional,
														rotation: optional, an Euler XYZ rotation array with angles in radians,
														vertices: optional, an array with mesh vertex coordinates})
*/
CLAIRVOYANCE.Node = function(args) {
	var renderer = args.renderer;
	var gl = renderer.gl();
	
	var mvMatrix = mat4.create();

	var vertexPositionBuffer = null;
	
	var location = new Array(0, 0, 0);
	var rotation = new Array(0, 0, 0);
	
	var children = new Array();
	
	this.addChild = function(child) {
		children.push(child);
	};
	
	function setMatrixUniforms() {
		var shaderProgram = renderer.shaderProgram();
		gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
	};
	
	this.gl = function() {
		return gl;
	};
	
	this.mvMatrix = function() {
		return mvMatrix;
	};
	
	this.draw = function() {
		if(args.hasOwnProperty('parent')) {
			mat4.set(args.parent.mvMatrix(), mvMatrix);
		}
		
		mat4.translate(mvMatrix, location);
		mat4.rotateX(mvMatrix, rotation[0]);
		mat4.rotateY(mvMatrix, rotation[1]);
		mat4.rotateZ(mvMatrix, rotation[2]);
	
		if(vertexPositionBuffer != null) {
			gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
			gl.vertexAttribPointer(renderer.shaderProgram().vertexPositionAttribute, vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

			setMatrixUniforms();
			gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numItems);
		}
		
		for(var i = 0;i < children.length;i++) {
			children[i].draw();
		}
	};
	
	(function() {
		if(args.hasOwnProperty('location')) {
			location = args.location;
		}
		if(args.hasOwnProperty('rotation')) {
			rotation = args.rotation;
		}
		if(args.hasOwnProperty('vertices')) {
			vertexPositionBuffer = gl.createBuffer();
			var vertexPositions = args.vertices;
			gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositions), gl.STATIC_DRAW);
			vertexPositionBuffer.itemSize = 3;
			vertexPositionBuffer.numItems = vertexPositions.length / 3;
		}
	}());
};