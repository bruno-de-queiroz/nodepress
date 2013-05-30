module.exports = function ( config , module , done ) {

	log.debug( "Creating passport instance for module :" + module.name );

	var passport = new require("passport")
		, core = config.core
		, config = config.passport
		, model = module.auth.model
		, mongoose = require('mongoose')
		, User = mongoose.model(model)
		, LocalStrategy = require('passport-local').Strategy
		, TwitterStrategy = require('passport-twitter').Strategy
		, FacebookStrategy = require('passport-facebook').Strategy
		, FoursquareStrategy = require('passport-foursquare').Strategy
		, GoogleStrategy = require('passport-google-oauth').Strategy
		, helpers = require( HELPERS_PATH + "/commons.js" )
		, pssport = new passport.Passport()
		, baseURL = core.protocol + core.domain

	pssport.serializeUser(function( user , done ) {
		log.debug( "PASSPORT: Serialize user: " + user.id );
		done( null , user.id );
	});

	pssport.deserializeUser(function( id , done ) {
		log.debug( "PASSPORT: Deserialize user: " + id );
		User.findOne({ _id: id }).exec(function ( err , user ){
			done( err , user );
		});
	});

	if( !!(~module.auth.strategies.indexOf("local")) ) {
		pssport.use(
			new LocalStrategy({
				usernameField: 'username'
				, passwordField: 'password'
				, passReqToCallback: true
			},
			function( req, username , password , done ){
				User.findOne({ username: username }, function( err , user ){
					if( err ){
						log.error( err );
						return done( err );
					}

					if( !user ) {
						log.error( "Unknown user" );
						return done( null , false , { message: 'Unknown user' } );
					}

					if( !user.authenticate( password ) ){
						log.error( "Invalid password" );
						return done( null , false , { message: 'Invalid password' } );
					}

					return done( null , user );
				})

			}
		))
	}

	if( !!(~module.auth.strategies.indexOf("twitter")) ){
		pssport.use(
			new TwitterStrategy({
				consumerKey: config.twitter.clientID
				, consumerSecret: config.twitter.clientSecret
				, callbackURL: baseURL + "/" + config.twitter.callbackURL
				, passReqToCallback: true
			},
			function( req, token, tokenSecret, profile, done ){

				if( req.user ){

					User.findOne({ '_id': req.user._id }, function( err, user ){

						if( err )
							return done( err );

						user.twitter = profile._json;

						user.save( function( err ){
							if( err )
								log.debug( err );

							return done( err , user );
						});

					})
				} else {

					User.findOne({ 'twitter.id': profile.id }, function( err , user ){

						if( err )
							return done( err );

						var end_profile = profile._json;

						if( !user ){

							user = new User({
									name: profile.displayName
									, username: profile.username
									, provider: 'twitter'
									, twitter: end_profile
									, picture : {
										small : 'https://api.twitter.com/1/users/profile_image?screen_name='+end_profile.screen_name+'&size=normal'
										, medium : 'https://api.twitter.com/1/users/profile_image?screen_name='+end_profile.screen_name+'&size=bigger'
										, large : 'https://api.twitter.com/1/users/profile_image?screen_name='+end_profile.screen_name+'&size=original'
									}
								});

							user.save( function( err ){
								if( err )
									log.debug( err );

								return done( err , user );
							});

						} else
							return done( err , user );

					})
				}
			}
		))
	}

	if( !!(~module.auth.strategies.indexOf("facebook")) ){
		pssport.use(
			new FacebookStrategy({
				clientID: config.facebook.clientID
				, clientSecret: config.facebook.clientSecret
				, callbackURL: baseURL + "/" + config.facebook.callbackURL
				, passReqToCallback: true
			},
			function( req , accessToken , refreshToken , profile , done ) {

				if( req.user ){

					User.findOne({ '_id': req.user._id }, function( err, user ){

						if( err )
							return done( err );

						user.facebook = profile._json;

						user.save( function( err ){
							if( err )
								log.debug( err );

							return done( err , user );
						});

					})
				} else {

					User.findOne({ 'facebook.id': profile.id }, function( err , user ){

						if( err )
							return done( err );

						var end_profile = profile._json;

						if( !user ){

							user = new User({
									name: profile.displayName
									, username: profile.username
									, provider: 'facebook'
									, facebook: end_profile
									, picture : {
										small : 'https://api.twitter.com/1/users/profile_image?screen_name='+end_profile.screen_name+'&size=normal'
										, medium : 'https://api.twitter.com/1/users/profile_image?screen_name='+end_profile.screen_name+'&size=bigger'
										, large : 'https://api.twitter.com/1/users/profile_image?screen_name='+end_profile.screen_name+'&size=original'
									}
								});

							user.save( function( err ){
								if( err )
									log.debug( err );

								return done( err , user );
							});

						} else
							return done( err , user );

					})
				}
			}
		))
	}

	if( !!(~module.auth.strategies.indexOf("google")) ){
		pssport.use(
			new GoogleStrategy({
				consumerKey: config.google.clientID
				, consumerSecret: config.google.clientSecret
				, callbackURL: baseURL + "/" + config.google.callbackURL
				, passReqToCallback: true
			},
			function(req, accessToken, refreshToken, profile, done) {

				if( req.user ){

					User.findOne({ '_id': req.user.id }, function (err, user) {

						if( err )
							return done( err );

						var new_profile = {
							id : profile.id
							, displayName : profile.displayName
							, emails : profile.emails
							, image : profile.image
						};

						user.google = new_profile;

						user.save( function( err ){
							if( err )
								log.debug( err );

							return done( err , user );
						});
					})

				} else {

					User.findOne({ 'google.id': profile.id }, function (err, user) {
						if (!user) {
							var end_profile = {
								id : profile.id
								, displayName : profile.displayName
								, emails : profile.emails
								, image : profile.image
							};

							user = new User({
								name: profile.displayName
								, email: profile.emails[0].value
								, provider: 'google'
								, google: end_profile
								, picture : {
									small : end_profile.image.url+'?sz=50x50'
									, medium : end_profile.image.url+'?sz=92x92'
									, large : end_profile.image.url+'?sz=200x200'
								}
							});

							user.save( function( err ){
								if( err )
									log.debug( err );

								return done( err , user );
							});

						} else
							return done( err , user );

					})

				}
			}
		));
	}

	done( pssport );
}