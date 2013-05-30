function EventWidget( name , sandbox ) {
	this.name = name;
	this.input = null;
	this.lastSearch = "";
	this.container = null;
	this.mainContainer = null;
	this.friendContainer = null;
	this.ready = false;
	this.init.call( this, sandbox );
}
EventWidget.prototype = function(){
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
		, _showAutocomplete = function( results ){
			var _this = this;
			this.autoComplete.stop(true,true);
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

				this.autoComplete.css({
					top: this.locationField.position().top + this.locationField.outerHeight(true)
					, left: this.locationField.position().left
					, width: this.locationField.outerWidth(true)
				});

				this.autoComplete.find("li:first-child").addClass("active");
				this.autoComplete.show('fast');

				this.autoComplete.find("li").off("click").on("click.SetLocationId",function(e){
					var span = $(this).find("span")
						, id = span.attr("rel")
						, label = span.html()
					_this.eventForm.find("input[name=location_id]").val(id);
					_this.locationField.val(label);
					_this.autoComplete.hide("fast");
				});
			} else {
				this.autoComplete.hide("fast");
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

		,_filterFriends = function (value) {
			this.ulFriends.find('label:Contains('+ value +')').parent().removeClass('hide');
			this.ulFriends.find('label:not(:Contains('+ value +'))').parent().addClass('hide');
		}

		, _show = function() {
			var _this = this;
			this.mainContainer.addClass("add").show("fast", function() {
				$("html,body").animate({ scrollTop : _this.mainContainer.offset().top - 100 },"fast");
			});
		}
		, _hide = function() {
			this.mainContainer.hide("fast",function() {
				$(this).removeClass();
			});
		}
		, _bindEvents = function(){
			var _this = this;

			this.locationField.bind("keyup.GetLocations", function( e ) {
				e.stopPropagation();
				if(e.keyCode == 40 ) {
					e.preventDefault();
					var next = _this.autoComplete.find("li.active").next("li");
					_this.autoComplete.find("li.active").removeClass("active");
					if( next.length ){
						next.addClass("active");
						_this.autoComplete.scrollTop(next.position().top);
					} else
						_this.autoComplete.find("li:last-child").addClass("active");
				} else if ( e.keyCode == 38 ){
					e.preventDefault();
					var prev = _this.autoComplete.find("li.active").prev("li");
					_this.autoComplete.find("li.active").removeClass("active");
					if( prev.length ) {
						prev.addClass("active");
						_this.autoComplete.scrollTop(prev.position().top);
					} else
						_this.autoComplete.find("li:first-child").addClass("active");
				} else if ( e.keyCode == 13 ){
					e.preventDefault();
					e.stopPropagation();
					_this.autoComplete.find("li.active span").trigger("click");
				} else {
					if( e.keyCode != 9 )
						_getLocations.call(_this, this.value );
				}
			});
			this.searchFriends.bind("keyup.FilterFriends", function( e ) {
				e.stopPropagation();
				_filterFriends.call(_this, this.value );
			});

			this.toggleButton.unbind("click.Toggle").bind("click.Toggle",function( e ) {
				if(!_this.mainContainer.is(":visible"))
					_show.call(_this);
				else
					_hide.call(_this);
			})
		}
		, _start = function( data ){
			if(data.ready){
				this.ready = true;
				this.subscribe( "locations", "facebook", _showAutocomplete );
				this.unsubscribe("socket","status");
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
			this.searchFriends = this.friendsForm.find("input[name=search-friends]");
			this.ulFriends = this.friendsForm.find("ul.friends-list");


			this.eventForm.bind("submit",function(e){
				e.preventDefault();
				e.stopPropagation();
				var errors = []
					, inputs = _this.eventForm.find("input[type=text]")


				inputs.removeClass("validation-error").each( function( i, obj) {
					if( obj.value == "" )
						errors.push(obj.id);
					else if ( $(obj).is(".date-field") ){
						var date = obj.value.split("-")
							, month = date[0]
							, day = date[1]
							, year = date[2]
							, finalDate = new Date(year,parseInt(month)-1,day);

						if( parseInt(finalDate.getDate()) != parseInt(day))
							errors.push(obj.id);
						else if( parseInt(finalDate.getMonth())+1 != parseInt(month) )
							errors.push(obj.id);
						else if( finalDate.getFullYear() != year )
							errors.push(obj.id);
					}
				})

				if( errors.length > 0 ){ 

					while(errors.length){
						var field = errors.shift();
						_this.eventForm.find("#"+field).addClass("validation-error");
					}

				} else {
					_sandbox.ajax({
						url : "/event"
						, type: "POST"
						, data: _this.eventForm.serialize()
						, dataType: "json"
						, beforeSend: function(){
							_this.mainContainer.removeClass().addClass("loading");
						}
						, success: function(data){
							_showFriends.call(_this,data);
						}
						, statusCode: {
							403: function(){
								document.location.href = '/auth/facebook';
							}
						}
						, error: function(xhr,status,errorThrown){
							log.error(status);
						}
						, complete: function(){
							_this.mainContainer.removeClass("loading");
						}
					})
				}
			});

			this.friendsForm.bind("submit",function(e){
				e.preventDefault();
				e.stopPropagation();
				_sandbox.ajax({
					url : _this.friendsForm.attr("action")
					, type: "POST"
					, data: _this.friendsForm.serialize()
					, beforeSend: function(){
						_this.mainContainer.removeClass().addClass("loading");
					}
					, success: function(data){
						_showComplete.call(_this);
					}
					, statusCode: {
						403: function(){
							document.location.href = '/auth/facebook';
						}
					}
					, error: function(xhr,status,errorThrown){
						log.error(status);
					}
					, complete: function(){
						_this.mainContainer.removeClass("loading");
					}
				})
			});

			_sandbox.install( this );

			_bindEvents.call(this);

			this.subscribe( "socket" , "connect" , _bind );
		}
		, destroy : function() {
			_sandbox.clean( this.name );
		}
	};
}();


core.register( "eventwidget" , EventWidget );