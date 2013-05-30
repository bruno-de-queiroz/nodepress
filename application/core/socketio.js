module.exports = function( app , config, sessions ){

	log.debug( "Creating socket.io instance" );

	var server = require( 'http' ).Server( app )
		, io = require( "socket.io" ).listen( server )
		, generateToken = function( token ){
			var newToken = Math.round( (new Date().valueOf() * Math.random()) );
			return newToken == token ? generateToken() : newToken ;
		}
		, instances = {}

	io.on( 'connection', function( socket ){
		log.ok( "SOCKETIO: Connected" );

		var token = Math.round((new Date().valueOf() * Math.random()));

		instances[ socket.id ] = {
			token: token
			, socket: socket.id
		};

		socket.emit( 'csrf' , instance.token );

		socket.on( 'event' , function( request ){

			var instance = instances[ socket.id ]
				, token = instance.token;

			if( request.token == token ){

				log.ok( "SOCKETIO: Publishing to mediator :");
				log.debug( request );
				Mediator.publish( request.channel, instance, request.data );

				token = generateToken( token );

				instance.token = token;

				log.debug( "SOCKETIO: Sending new csrf token" );
				socket.emit( 'csrf' , token );

			} else {
				log.error( "SOCKETIO: Not valid token.");
			}
		});

	});

	server.listen( config.core.port , function(){
		log.ok("Express server listening on port "+config.core.port+" in "+app.settings.env+" mode");
	});

	io.set('log level', 1);

	return io;
};