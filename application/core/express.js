module.exports = function ( app, module, config, passport, sessions) {

	log.debug( "Creating express instance for module :" + module.name );

	var fs = require( 'fs' )
		, url = require('url')
		, i18n = require( 'i18n' )
		, express = require( 'express' )
		, mongoStore = require( 'connect-mongo' )(express)
		, flash = require( 'connect-flash' )
		, stylus = require( 'stylus' )
		, nib = require( 'nib' )
		, bootstrap = require( 'bootstylus' )
		, helpers = require( APP_PATH + '/helpers/commons.js' )
		, public_path = PUBLIC_PATH + '/' + module.name


	sessions[ module.name ] =  new mongoStore({
		url : config.database.uri
		, collection : module.name + '_sessions'
	});

	i18n.configure({
		locales: config.core.locales
	});

	app.configure(function () {

		app.use( express.logger('tiny') );
		app.use( i18n.init );

		app.use( express.compress({
			filter: function (req, res) {
				return /json|text|javascript|css/.test(res.getHeader('Content-Type'));
			},
			level: 9
		}));

		if( ENVIROMENT == "development" ){
			app.use( stylus.middleware({
				src: public_path,
				compile: function ( str , path ) {
					return stylus( str ).set( 'filename' , path )
										.use( nib() )
										.use( bootstrap() )
										.set( 'compress' , true );
				}
			}));
		}

		app.use( express.static( public_path,{
			maxAge : config.express.maxAge
		}));

		app.set( 'views' , module.views );
		app.set( 'view engine' , 'jade' );


		app.use( express.cookieParser() );
		app.use( express.bodyParser() );

		app.use( express.methodOverride() );

		app.use( express.session({
			secret: config.express.secret
			, maxAge  : new Date(Date.now() + 600000)
			, expires : new Date(Date.now() + 600000)
			, store : sessions[ module.name ]
			, key : config.express.key
		}));

		app.use( flash() );

		app.use( passport.initialize() );
		app.use( passport.session() );
		app.use( express.favicon( PUBLIC_PATH + "/images/favicon.ico") );


		app.use( function ( req , res , next ) {
			var render =  res.render;

			res.locals.appName = config.core.name;
			res.locals.title = module.title;
			res.locals.req = req;
			res.locals.lang = i18n.__;
			res.locals.theme = module.theme;
			res.render = function(){
				var args = arguments;
				args[0] = module.theme + "/" + args[0];
				return render.apply(this,args);
			};

			res.locals.baseURL = config.core.protocol + config.core.domain;
			res.locals.imagePath = config.core.protocol + config.core.images + config.core.domain;

			res.locals.getImage = function( path , size ) {
				return res.locals.imagePath + "/" + path + ( size ? "?width=" + size.toLowerCase().split("x")[0] + "&height=" + size.toLowerCase().split("x")[1] : "");
			};

			res.locals.messages = helpers.getMessages( req );
			res.locals.createPagination = helpers.createPagination( req, res );
			next();
		});

		app.use(app.router);

		app.use( function( err, req, res, next ){
			if ( ~err.message.indexOf('not found') ) return next();
			console.error(err.stack);
			res.status(500).render( '500' , { error: err.stack, pageName: '500' } );
		});

		app.use( function( req, res, next ){
			res.status(404).render( '404' , { url: req.originalUrl, pageName: '404' } );
		});


	});

	app.set( 'showStackError' , true );

	fs.readdirSync( module.controllers ).forEach( function( file ){
		require( module.controllers + '/' + file )( app , passport , config );
	});
};