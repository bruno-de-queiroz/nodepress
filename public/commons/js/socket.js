function SocketHandler( name , sandbox ) {
	this.name = name;
	this.init.call( this, sandbox );
}
SocketHandler.prototype = function(){
	var _sandbox = null
		, _token = null
		, _saveToken = function(data){
			_token = data;
			this.publish("socket" , "status" , { ready : true });
		}
		, _send = function(data){
			var data = _sandbox.merge( data , { token : _token } );
			console.log( data );
			this.socket.emit("event", data);
		}
		, _bind = function(success,token) {
			var _this = this;
			if(success){

				_this.subscribe( "socket", "csrf", _saveToken );

				_this.subscribe( "socket", "event", _send );

				this.socket.on( "error",function( response ){
					_this.publish("socket", "error" , response);
				});

				this.socket.on( "event" , function( response ){
					console.log(response);
					_this.publish( response.channel , response.subchannel , { action: response.action , data : response.data });
				});

				this.socket.on( "csrf" , function( token ){
					_this.publish( "socket" , "csrf" , token );
				});

				this.socket.on( 'disconnect' , function(){
					_this.publish( "socket", "disconnect" , true );
				});

			} else {
				_this.publish( "socket" , "error" , "Error connection to socket" );
			}
		}
	return {
		init: function( sandbox ) {
			var _this = this;

			_sandbox = sandbox;

			_sandbox.install( this );

			this.socket = io.connect('/');

			this.subscribe( "socket" , "connect" , _bind );

			this.socket.on( "connect" , function(){
				_this.publish( "socket", "connect", true );
			})
		}
		, destroy: function(){
			_sandbox.clean( this.name );
		}
	};
}();


core.register( "socket" , SocketHandler );