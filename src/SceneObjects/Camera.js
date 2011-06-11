/*
 * Params:
 * data - an object literal from which to create a Camera
 * scene - a Scene object
*/
CLAIRVOYANCE.Camera = function(data, scene) {
	var clipStart = data.clipStart;
	var clipEnd = data.clipEnd;
	var fov = CLAIRVOYANCE.MathUtils.radToDeg(data.fov);
	var location = data.location;
	var rotation = data.rotation;
	
	this.draw = function() {
		var gl = scene.gl();
		mat4.perspective(fov, gl.viewportWidth / gl.viewportHeight, clipStart, clipEnd, scene.pMatrix());
		//TODO: use translation and rotation from data
		mat4.translate(scene.mvMatrix(), [0, 0, -20]);
	};
};