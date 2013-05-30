module.exports = function ( app , config ) {
	var express = require( "express" )
		, url = require( "url" )
		, fs = require( "fs" )
		, static = express();

	static.use(express.compress());

	static.use(express.static( PUBLIC_PATH + "/images/" , {
		maxAge: config.express.maxAge
	}));

	log.ok( "STATIC: Initiating static domain on : "+ config.core.images + config.core.domain );
	app.use( express.vhost( config.core.images + config.core.domain, static) );

};