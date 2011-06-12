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