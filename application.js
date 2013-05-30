/* Setting global vars */

GLOBAL.APP_PATH = __dirname + "/application";
GLOBAL.PUBLIC_PATH = __dirname + "/public";
GLOBAL.CONFIG_PATH = APP_PATH + "/config";
GLOBAL.LIB_PATH = APP_PATH + "/lib";
GLOBAL.MODULES_PATH = APP_PATH + "/modules";
GLOBAL.MODELS_PATH = APP_PATH + "/models";
GLOBAL.HELPERS_PATH = APP_PATH + "/helpers";
GLOBAL.CORE_PATH = APP_PATH + "/core";
GLOBAL.ENVIROMENT = process.env.NODE_ENV || 'development';

var fs = require( "fs" )
	, express = require( "express" )
	, io = require( "socket.io" )
	, config = {}
	, lib = {}
	, modules = []
	, sessions = {}
	, include = function( path , type , done ){
		var callback, args;

		if ( done )
			callback = Array.prototype.pop.call( arguments );

		args = arguments;

		fs.readdirSync( path ).forEach(function( file ){

			var filename = path + "/" + file
				, parent = /\/(\w+)$/.exec( path )[ 1 ]
				, stats = fs.lstatSync( filename )
				, _args = Array.prototype.slice.call( args , 1 );

			if( stats.isDirectory() ){

				if( type != "modules" ) {

					Array.prototype.splice.call( _args , 0 , 0 , filename );
					return include.apply( this , _args );

				} else {

					console.log( "Loading module : " + file );
					modules.push( require(filename + "/module.js") );

				}

			} else {

				var key = file.replace(".js","");

				switch(type){

					case "config":

						console.log( "Loading config : " + key );
						config[ key ] = require( filename )[ ENVIROMENT ];
						break;

					case "models":

						console.log( "Loading model : " + key );
						require( filename );
						break;

					default:

						console.log( "Loading library : " + parent + "." + key );
						if( !lib.hasOwnProperty( parent ) )
							lib[ parent ] = {};
						lib[ parent ][ key ] = require( filename );
						break;
				}

			}

		});

		if ( callback )
			callback.call( this );

	}
	, init = function( main , modules, done ){
		/* Creating modules applications */
		while( modules.length ){

			var module = modules.shift()
				, moduleApp;

				require( CORE_PATH + "/passport.js" )( config, module , function( p ){

					moduleApp = express();
					moduleApp.set( 'name' , module.name );

					require( CORE_PATH + "/express.js" )( moduleApp , module , config,  p  , sessions);

					main.use( express.vhost( module.express[ ENVIROMENT ].domain + config.core.domain , moduleApp ) );

					if(modules.length == 0){
						done( main );
						delete modules;
					}
				});

		}
	}
	, main = express()
	, redirect = express()
	, images = express();

include( CONFIG_PATH , "config" );
include( MODULES_PATH , "modules" );
include( MODELS_PATH , "models" );
include( LIB_PATH , "lib" , function() {

	require( CORE_PATH + "/mongoose.js" )(config);
	require( CORE_PATH + "/static.js" )( main , config );

	/* Starting main application */
	init( main , modules , function( main ) {

		var io = require( CORE_PATH + "/socketio.js" )( main , config , sessions );

		require( CORE_PATH + "/mediator.js" )( io  , config );

	});

});


