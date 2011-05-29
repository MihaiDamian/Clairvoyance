var CLAIRVOYANCE = CLAIRVOYANCE || function(canvasID, sceneFilePath) {
		function tick() {
			requestAnimFrame(tick);
			renderer.drawScene();
		};
		
		function onSceneLoaded(data) {
			renderer.onSceneLoaded(data);
			tick();
		};

		var canvas = document.getElementById(canvasID);
		var renderer = new CLAIRVOYANCE.WebglRenderer(canvas);
		var controller = new CLAIRVOYANCE.Controller(canvas, document, renderer);
		var scene = new CLAIRVOYANCE.Scene();
		scene.load(sceneFilePath, onSceneLoaded);
};
