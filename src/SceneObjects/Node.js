/*
 * Params:
 * args - an object specifier for creating nodes (e.g.: {parent: optional, another Node object,
														renderer: optional, a Renderer object
														location: optional, a coordinates array,
														name: optional,
														rotation: optional, an Euler XYZ rotation array with angles in radians,
														vertices: optional, an array with mesh vertex coordinates})
*/
CLAIRVOYANCE.Node = function Node(args) {
	var self = this,
		parent = args.parent,
		gl,
		mvMatrix = mat4.create(),
		vertexPositionBuffer,
		location = [0, 0, 0],
		rotation = [0, 0, 0],
		children = [];
	
	this.setParent = function(node) {
		parent = node;
	};

	this.renderer = args.renderer;
	
	this.addChild = function(child) {
		children.push(child);
		child.setParent(self);
		child.onEnter();
	};
	
	function setMatrixUniforms() {
		var shaderProgram = self.renderer.shaderProgram();
		gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
	}
	
	this.gl = function() {
		return gl;
	};
	
	this.mvMatrix = function() {
		return mvMatrix;
	};
	
	function drawChildren() {
		var i;
		for(i = 0;i < children.length;i++) {
			children[i].draw();
		}
	}
	
	this.draw = function() {
		if(typeof parent !== 'undefined') {
			mat4.set(parent.mvMatrix(), mvMatrix);
		}
		
		mat4.translate(mvMatrix, location);
		mat4.rotateX(mvMatrix, rotation[0]);
		mat4.rotateY(mvMatrix, rotation[1]);
		mat4.rotateZ(mvMatrix, rotation[2]);
	
		if(typeof vertexPositionBuffer !== 'undefined') {
			gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
			gl.vertexAttribPointer(self.renderer.shaderProgram().vertexPositionAttribute, vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

			setMatrixUniforms();
			gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numItems);
		}
		
		drawChildren();
	};
	
	function setupVertexData() {
		if(args.hasOwnProperty('vertices')) {
			vertexPositionBuffer = gl.createBuffer();
			var vertexPositions = args.vertices;
			gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositions), gl.STATIC_DRAW);
			vertexPositionBuffer.itemSize = 3;
			vertexPositionBuffer.numItems = vertexPositions.length / 3;
		}
	}
	
	this.onEnter = function() {
		self.renderer = args.renderer || parent.renderer;
		gl = self.renderer.gl();
		
		setupVertexData();
	};
	
	(function() {
		if(args.hasOwnProperty('location')) {
			location = args.location;
		}
		
		if(args.hasOwnProperty('rotation')) {
			rotation = args.rotation;
		}
	}());
};