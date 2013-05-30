function PlaceWidget( name , sandbox ) {
	this.name = name;
	this.input = null;
	this.lastSearch = "";
	this.container = null;
	this.mainContainer = null;
	this.friendContainer = null;
	this.ready = false;
	this.init.call( this, sandbox );
}
PlaceWidget.prototype = function(){
	var _sandbox = null
		, _template = {
			completion: '<li><span rel="%id%">%title%</span></li>'
			, friends : '<li><label><input type="checkbox" name="users[]" value="%id%"><img width="30" height="30" src="https://graph.facebook.com/%id%/picture?width=30&height=30">%name%</label></li>'
		}
		, _showComplete = function() {
			this.mainContainer.removeClass("friends add");
			this.mainContainer.addClass("complete");
		}
		, _showFriends = function( results ){
			var _this = this;

			_this.friendsForm.attr("action","/invite/"+ results.event_id );

			if( results.friends.data.length > 0 ){
				var docFrag = document.createDocumentFragment()
					, results = results.friends.data
					, html = ""
					, data;

				while( results.length ){
					data = results.shift()
					html += _template.friends.replace(/\%id\%/g,data.id).replace(/\%name\%/g,data.name);
				}

				this.friendsForm.find("ul").html(html);
				this.mainContainer.addClass("friends");

			} else {
				_showComplete.call(this);
			}

			this.ready = true;
		}
		, _viewData = function( results ){
			var _this = this;
			if( results.data.length > 0 ){
				var docFrag = document.createDocumentFragment()
					, results = results.data
					, html = ""
					, data;

				while( results.length ){
					data = results.shift()
					html += _template.completion.replace(/\%id\%/g,data.id).replace(/\%title\%/g,data.name);
				}

				this.autoComplete.html(html);
				this.autoComplete.show('fast');

				this.autoComplete.find("li span").off("click").on("click.SetLocationId",function(e){
					var id = $(this).attr("rel")
						, label = $(this).html()
					_this.eventForm.find("input[name=location_id]").val(id);
					_this.locationField.val(label);
					_this.autoComplete.hide("fast");
				});

			} else {
				this.autoComplete.html("");
				this.autoComplete.hide('fast');
			}

			this.ready = true;
		}
		, _getLocations = function ( value ) {
			if(this.ready && value.length > 5){
				if(this.lastSearch != value){
					this.ready = false;
					this.lastSearch = value;
					this.publish("socket", "event", { channel : "get-locations" , data : value });
				} else {
					this.autoComplete.show('fast');
				}
			}
		}
		, _show = function() {
			console.log("Show");
			this.mainContainer.addClass("add").show("fast");
		}
		, _hide = function() {
			console.log("Hide");
			this.mainContainer.hide("fast",function() {
				$(this).removeClass();
			});
		}
		, _bindEvents = function(){
			var _this = this;

			this.locationField.bind("keyup.GetLocations", function( e ) {
				e.stopPropagation();
				_getLocations.call(_this, this.value );
			});

			this.toggleButton.bind("click.Toggle",function( e ) {
				console.log(_this.mainContainer.is(":visible"));
				if(!_this.mainContainer.is(":visible"))
					_show.call(_this);
				else
					_hide.call(_this);
			})
		}
		, _start = function( data ){
			if(data.ready){
				this.ready = true;
				this.subscribe( "locations", "facebook", _viewData );
				_bindEvents.call(this);
			}
		}
		, _bind = function() {
			this.subscribe( "socket", "status", _start );
		}
	return {
		init : function( sandbox ) {
			_sandbox = sandbox;

			var _this = this;

			this.mainContainer = _sandbox.get("#make-event");
			this.toggleButton = _sandbox.get(".toggle-event");
			this.eventForm = _sandbox.get("#event-form");
			this.friendsForm = _sandbox.get("#invite-form");
			this.autoComplete = this.eventForm.find("#location-helper");
			this.locationField = this.eventForm.find("input[name=location]");

			this.autoComplete.css({
				top: this.locationField.position().top + this.locationField.outerHeight(true)
				, left: this.locationField.position().left
				, width: this.locationField.outerWidth(true)
			})

			this.eventForm.find("button[type=submit]").bind("click",function(e){
				e.preventDefault();
				_sandbox.ajax({
					url : "/event"
					, type: "POST"
					, data: _this.eventForm.serialize()
					, dataType: "json"
					, success: function(data){
						_showFriends.call(_this,data);
					}
					, error: function(xhr,status,errorThrown){
						log.error(status);
					}
				})
			});

			this.friendsForm.find("button[type=submit]").bind("click",function(e){
				e.preventDefault();
				_sandbox.ajax({
					url : _this.friendsForm.attr("action")
					, type: "POST"
					, data: _this.friendsForm.serialize()
					, dataType: "json"
					, success: function(data){
						_showComplete.call(_this);
					}
					, error: function(xhr,status,errorThrown){
						log.error(status);
					}
				})
			});

			_sandbox.install( this );

			this.subscribe( "socket" , "connect" , _bind );
		}
		, destroy : function() {
			_sandbox.clean( this.name );
		}
	};
}();


core.register( "placeswidget" , PlaceWidget );