function MapWidget( name , sandbox ) {
	this.name = name;
	this.container = sandbox.get("#map-canvas");
	this.counter = sandbox.get("#eletric-straws-countdown p");
	this.opened = false;
	this.geolocation = false;
	this.map = null;
	this.active = null;
	this.helper = sandbox.get("#event-info");
	this.points = locations;
	this.markers = {};
	this.bounds = new google.maps.LatLngBounds();
	this.mousePosition = {}
	this.config = {
		name : "Eletric Map"
		, icon: "/final/images/ico_map_pin.png"
		, style :[{
			featureType: "all"
			, stylers: [{ saturation: -100 }]
		}]
		, zoom : 12
		, options : {
			scrollwheel: false,
			disableDefaultUI: true,
			zoomControl: true,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		}
	}
	this.init.call( this, sandbox );
}
MapWidget.prototype = function(){
	var _sandbox = null
		, _updateCounter = function ( data ){
			_total = 20000-parseInt(data)

			var parts = _total.toString().split("")
				, last = parts.pop()
				, text = parts.join("") + "<strong>" + last + "</strong>";
			this.counter.html(text);
		}
		, _viewData = function( data ){
			if(data.counter)
				_updateCounter.call(this,data.counter)

			if(data.model && data.action != "remove")
				_addMapPoint.call(this,data.model)
			else
				_removeMarker.call(this,data.model.facebook);
		}
		, _addMapPoint = function( data ){

			if ( !this.markers.hasOwnProperty( data.facebook ) ){
				this.points[data.facebook] = data;
				_addMarker.call(this,data,_refresh);
			} else {
				this.points[ data.facebook ] = data;
			}

		}
		, _refresh = function( position ){
			this.map.panTo(position);
		}
		, _addMarker = function( point , callback) {
			var _this = this
				, marker = new google.maps.Marker({
					position: new google.maps.LatLng(point.address.latitude, point.address.longitude),
					map: this.map,
					icon: this.config.icon,
					animation: google.maps.Animation.DROP,
					title: point.name
				});

			this.bounds.extend(marker.position);

			this.markers[ point.facebook ] = marker;

			if(callback)
				callback.call(this,marker.position);

			google.maps.event.addListener( marker , 'click', (function( point ){
				return function() {
					_this.active = point;
					_getMousePosition.call(_this,point.facebook);
				}
			})( point ));

		}
		, _removeMarker = function( id ){
			if(this.markers[ id ]){
				this.markers[ id ].setMap(null);
				this.markers[ id ] = null;
			}
		}
		, _createMarkers = function () {
			var bounds = new google.maps.LatLngBounds()
				, i = 0 , j = this.points.length
				, points = []
				, pointsMap = {}
				, point;

			for ( ; i < j ; i++ ) {

				point = this.points[i];
				pointsMap[ point.facebook ] = point;

				_addMarker.call(this,point);
			}

			this.points = pointsMap;

		}
		, _mount = function(){
			var _this = this
				, infowindow = new google.maps.InfoWindow()
				, browserSupportFlag =  new Boolean()
				, style = new google.maps.StyledMapType(this.config.style, {name: this.config.name })
				, initialLocation = new google.maps.LatLng(_this.points[0].address.latitude.toString(),_this.points[0].address.longitude.toString());

		 	google.maps.visualRefresh = true;

			this.map = new google.maps.Map(this.container[0], this.config.options );

			this.map.mapTypes.set('map_style', style);
			this.map.setMapTypeId('map_style');

			this.map.panTo(initialLocation);
			if(navigator.geolocation) {
				browserSupportFlag = true;
				navigator.geolocation.getCurrentPosition( function( position ) {
					initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
					_this.map.panTo(initialLocation);
				}, function() {
					_this.geolocation = true;
				});
			} else {
				browserSupportFlag = false;
				_this.geolocation = false;
				_this.map.panTo(initialLocation);
			}

			this.map.setZoom(_this.config.zoom);

			_createMarkers.call(this);

			// google.maps.event.addListener( this.map , 'center_changed', function(){
			// 	_getDeltaPan.call(_this);
			// });
		}
		, _getMousePosition = function( point ) {
			this.open( point );
		}
		, _getDeltaPan = function () {
			var _this = this
				, x = this.mousePosition.x
				, y = this.mousePosition.y;

			window.addEventListener( "mousemove" , function( e ) {
				var delta = { x: x - e.pageX, y : y - e.pageY };
				_this.moveTo( delta );
				window.removeEventListener( "mousemove", arguments.callee, false );
			}, false);
		}
		, _bindToWindow = function( point ) {
			var _this = this;
			window.addEventListener( "mousemove" , function( e ) {
				_this.mousePosition = { x : e.pageX,  y : e.pageY };
			}, false );
		}
		, _bindEvents = function(){
			var _this = this;
		}
		, _start = function( data ){
			if(data.ready){
				this.subscribe( "update", "events", _viewData );
				this.unsubscribe("socket","status");
				_bindEvents.call(this);
			}
		}
		, _bind = function() {
			this.subscribe( "socket", "status", _start );
		}
	return {
		open : function( point ){
			var _this = this
				, point = this.points[ point ]
				, holder = this.helper
				, x = this.mousePosition.x
				, y = this.mousePosition.y - this.container.offset().top
				, xPos = "right"
				, yPos = "top"

			holder.hide("fast", function() {
				var image = holder.find("img")
					, username = holder.find("figcaption")
					, name = holder.find("h1")
					, date = holder.find("ul li:first-child")
					, location = holder.find("ul li:eq(1)")
					, total = holder.find("ul li:eq(2) span")
					, start_time = new Date(point.start_time).format("mmm d, yyyy") + ' <span>'+new Date(point.start_time).format("HH:MM")+'</span>'
					, action = holder.find(".event-action a")

				image[0].src = 'https://graph.facebook.com/' + point.user.facebook.id + '/picture?width=90&height=90';
				username.html( point.user.name );
				date.html( start_time + ( point.end_time ? " - " + new Date(point.end_time).format("yyyy-mm-dd HH:MM") : "" ));
				location.html( "<span>@</span>" + point.address.name.charAt(0).toUpperCase() + point.address.name.substring(1,point.address.name.length) );
				total.html( point.summary.attending_count );
				name.html( point.name.charAt(0).toUpperCase() + point.name.substring(1,point.name.length) )
				action.attr("href", "http://facebook.com/"+point.facebook)

				holder.css({
					"visibility": "hidden",
					"display": "block"
				});

				if(y - holder.outerHeight(true) < 160)
					yPos = "bottom";

				if(x + holder.outerWidth(true) > $(window).width()/2)
					xPos = "left";

				holder.css({
					"left" : xPos == "left" ? x - holder.outerWidth(true) - 35 :  x + holder.outerWidth(true),
					"top" : yPos == "top" ? y - holder.outerHeight(true) - 70: y + holder.outerHeight(true) + 30,
					"visibility": "visible",
					"display": "none"
				});

				holder.removeClass().addClass(yPos).addClass(xPos);

				holder.show("fast", function() {
					$("html,body").animate({ scrollTop : holder.offset().top - 100 }, "fast" );
				});
			});

		}
		, moveTo : function( delta ) {
			var options = {
				left : parseInt(this.helper.css("left")) + delta.x
				, top: parseInt(this.helper.css("top")) - delta.y
			}
			this.helper.css(options)

		}
		, init : function( sandbox ) {
			_sandbox = sandbox;

			_sandbox.install( this );

			_mount.call(this);

			var _this = this;

			this.helper.find(".close-event-info").on("click",function(){
				_this.helper.hide("fast");
			})

			_bindToWindow.call(this);

			this.subscribe( "socket" , "connect" , _bind );
			setTimeout(function(){
				_removeMarker.call(_this);
			},30000);
		}
		, destroy : function() {
			window.removeEventListener( "mousemove" );
			_sandbox.clean( this.name );
		}
	};
}();


core.register( "mapwidget" , MapWidget );