// TODO: activate this for debug builds only
"use strict";

var CLAIRVOYANCE = CLAIRVOYANCE || function(canvasID, sceneFilePath) {
		var canvas = document.getElementById(canvasID),
			renderer = new CLAIRVOYANCE.Renderer(canvas),
			scene = new CLAIRVOYANCE.Scene(renderer);
			
		CLAIRVOYANCE.Controller(canvas, document, scene);
		scene.load(sceneFilePath); 
};
