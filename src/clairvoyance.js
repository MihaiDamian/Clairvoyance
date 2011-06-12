"use strict";

var CLAIRVOYANCE = CLAIRVOYANCE || function(canvasID, sceneFilePath) {
		var canvas = document.getElementById(canvasID);
		var renderer = new CLAIRVOYANCE.Renderer(canvas);
		var scene = new CLAIRVOYANCE.Scene(renderer);
		scene.load(sceneFilePath);
		var controller = new CLAIRVOYANCE.Controller(canvas, document, scene);
};
