CLAIRVOYANCE.Scene = function(){
	this.load = function(filePath, onSceneLoaded){
		var request = new XMLHttpRequest();
		request.open("GET", filePath);
		request.onreadystatechange = function() {
		  if (request.readyState == 4) {
			onSceneLoaded(JSON.parse(request.responseText));
		  }
		}
		request.send();
	};
};