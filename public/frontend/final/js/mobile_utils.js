/**
* Mobile utils v 0.1
* 
* For handlers, follow the usage:
*	var _e = getNativeEvent(e);
*	_e.pageX; //Or getOffsetX(_e) - which will test for the existence of offsetX
*/


/***
 * Picking right events (whether they are touch-family or not)
 */
var supportTouch = ('ontouchstart' in document.documentElement),
	scrollEvent = "touchmove scroll",
	gestureStartEvent = "gesturestart",
	gestureEndEvent = "gestureend",
	tapEvent = supportTouch ? "tap" : "click",
	touchStartEvent = supportTouch ? "touchstart" : "mousedown",
	touchEndEvent = supportTouch ? "touchend" : "mouseup",
	touchMoveEvent = supportTouch ? "touchmove" : "mousemove";
/***************************************************************/








//Retrieves the offsetX of the event independently if it's mobile event or not
function getOffsetX(e) {
	return e.offsetX ? e.offsetX : e.pageX;
}

//Retrieves the offsetY of the event independently if it's mobile event or not
function getOffsetY(e) {
	return e.offsetY ? e.offsetY : e.pageY;
}

//Retrieves the native event (mobile/desktop) - extracted from JQueryMobile
function getNativeEvent(event) {

	while(event && typeof event.originalEvent !== "undefined") {
		event = event.originalEvent;
	}
	return supportTouch ? getFirstChangedTouoch(event) : event;

}

//Retrieves the first point representing the touches (which means only one point)
function getFirstChangedTouoch(event) {
	return event.changedTouches[0];
}
