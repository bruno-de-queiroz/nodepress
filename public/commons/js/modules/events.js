function EventWidget( name , sandbox ) {
	this.name = name;
	this.button = null;
	this.container = null;
	this.form = null;
	this.opened = false;
	this.init.call( this, sandbox );
}
EventWidget.prototype = function(){
	var _sandbox = null
		, _viewData = function( data ){
			console.log(data);
			_updateCounter(data.counter)

			if(data.model)
				_addMapPoint(data.model)
		}
		, _bindEvents = function(){
			var _this = this;
			if(this.button)
				this.button.bind("click.Toogle", function() {
					_this.container[ _this.opened ? "slideUp" : "slideDown" ]("fast", function() {
						_this.container[ _this.opened ? "addClass" : "removeClass" ]("hide");
						_this.opened = !_this.opened;
					});
				})
		}
		, _start = function( data ){
			if(data.ready){
				this.subscribe( "update", "events", _viewData );
				this.subscribe( "update", "counter", _viewData );
				_bindEvents.call(this);
			}
		}
		, _bind = function() {
			this.subscribe( "socket", "status", _start );
		}
	return {
		init : function( sandbox ) {
			_sandbox = sandbox;

			this.button = _sandbox.get("#create-event");
			this.container = _sandbox.get(".form-modal");
			this.form = _sandbox.get("#event-form");

			_sandbox.install( this );

			this.subscribe( "socket" , "connect" , _bind );
		}
		, destroy : function() {
			_sandbox.clean( this.name );
		}
	};
}();


core.register( "eventswidget" , EventWidget );