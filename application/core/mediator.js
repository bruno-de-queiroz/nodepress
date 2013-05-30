module.exports = function( io , config ){

	log.debug( "Configuring mediator" );

	var config = config.core
		, helpers = require( HELPERS_PATH + "/commons.js" )


	/** Mediator Socket Emitter **/
	Mediator.subscribe( "send" , function( client , data ){

		log.debug( "MEDIATOR: Emiting to client "+ client );
		io.sockets.socket( client ).emit( "event" , data );

	});

};