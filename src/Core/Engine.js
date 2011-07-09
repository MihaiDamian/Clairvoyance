/*
 * Each engine uses a single canvas, each engine maintains an independent scene graph
 *
 * Params:
 * canvasID - the HTML id of a canvas element
 * sceneFilePath - the URL of the JSON file containing the scene
*/
CLAIRVOYANCE.Engine = function Engine(canvasID, sceneFilePath) {
	var controller,
		scene;

	(function() {
		var canvas = document.getElementById(canvasID),
		renderer = new CLAIRVOYANCE.Renderer(canvas);
		
		controller = new CLAIRVOYANCE.Controller(canvas, document);
		scene = new CLAIRVOYANCE.Scene(renderer, controller);
		// TODO: don't load a scene on init; make a method for this and allow the engine to reload scenes
		scene.load(sceneFilePath);
	}());
};