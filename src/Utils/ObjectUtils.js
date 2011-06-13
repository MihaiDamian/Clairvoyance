//TODO: these functions should also be part of the library namespace

/*
 * Shallow copies all public properties from the source to the target. The target object will then become a wrapper over the source object
*/
function exposeProperties(target, source) {
	var property;
	target = target || {};
	for(property in source) {
		if(source.hasOwnProperty(property)) {
			target[property] = source[property];
		}
	}
	return target;
}

/*
 * Set an event handler as an annonymous function that wraps the old handler and the new one;
 * useful for out of library events where you can't be sure if someone registered a handler before or not
*/
function addEventHandler(targetObj, eventName, eventHandler) {
	var oldHandler = targetObj[eventName] || function (){};
	targetObj[eventName] = function () {
		oldHandler.apply(targetObj, arguments);
		eventHandler.apply(targetObj, arguments);
	};
}