CLAIRVOYANCE.Scene = function(renderer){
	var self = this;

	var nodes = new Array();
	
	var mvMatrix = mat4.create();
	
	this.mvMatrix = function() {
		return mvMatrix;
	};
	
	var pMatrix = mat4.create();
	
	var rotationMatrix = mat4.create();
	mat4.identity(rotationMatrix);

	function draw() {
		var gl = renderer.gl();
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

		mat4.identity(mvMatrix);

		mat4.translate(mvMatrix, [0, 0, -20]);
		
		mat4.multiply(mvMatrix, rotationMatrix);
		
		gl.uniformMatrix4fv(renderer.shaderProgram().pMatrixUniform, false, pMatrix);
		
		for(var i = 0;i < nodes.length;i++) {
			nodes[i].draw();
		}
	};
	
	function tick() {
		requestAnimFrame(tick);
		draw();
	};
	
	function onSceneLoaded(data) {
		for(var i = 0;i < data.meshes.length;i++) {
			var node = new CLAIRVOYANCE.Node(data.meshes[i], renderer, self);
			nodes.push(node);
		}

		tick();
	};

	this.load = function(filePath){
		var request = new XMLHttpRequest();
		request.open("GET", filePath);
		request.onreadystatechange = function() {
		  if (request.readyState == 4) {
			onSceneLoaded(JSON.parse(request.responseText));
		  }
		}
		request.send();
	};
	
	this.rotate = function(rotationM) {
		mat4.multiply(rotationM, rotationMatrix, rotationMatrix);
	};
};