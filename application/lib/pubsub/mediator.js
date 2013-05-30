var Mediator = function() {
	this.channels = {};
};

Mediator.prototype = function() {
	var _subscribe = function( channel , fn ){

			if( typeof fn != "function" )
				throw new Error( "You must specify a function as callback" );

			if( !this.channels.hasOwnProperty( channel ) )
				this.channels[ channel ] = [];

			this.channels[ channel ].push({ context: this, callback: fn });

		}
		, _unsubscribe = function( channel ){
			if( this.channels.hasOwnProperty( channel ) ){
				for( var i=0,j=this.channels[ channel ].length; i<j; i++){
					var subscriber = this.channels[ channel ][ i ];
					if( subscriber.context === this ) {
						this.channels[ channel ].splice(i,1);
					}
				}
			}
		}
		, _publish = function( channel ){

			if( !this.channels.hasOwnProperty( channel ) )
				return false;

			var args = Array.prototype.slice.call( arguments , 1 )
				, i = j = 0 , subscription;

			for ( j = this.channels[ channel ].length ; i < j ; i++ ){

				subscription = this.channels[ channel ][ i ];

				subscription.callback.apply( subscription.context , args );
			}
		}
	return {
		publish : _publish
		, subscribe : _subscribe
		, unsubscribe : _unsubscribe
		, install : function ( obj ) {
			obj.publish = this.publish
			obj.subscribe = this.subscribe
			obj.unsubscribe = this.unsubscribe
		}
	};
}();

GLOBAL.Mediator = new Mediator();