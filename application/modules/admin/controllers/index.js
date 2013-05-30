module.exports = function ( app , passport ) {
	var indexController =  new Controller("index", app , {
		index : {
			mapping : "/"
			, method : "get"
			, filters : []
			, render : function( req , res ){
				res.render( 'home', {
					title: 'Events'
					, pageName: "index"
				});
			}
		}

		, login : {
			mapping : "/login"
			, method : "get"
			, filters : []
			, render: function( req, res ) {
				res.render( 'login', {
					title: res.locals.lang( 'Login' )
					, message: req.flash( 'error' )
					, pageName: "login"
				});
			}
		}

		, loginPost: {
			mapping : "/login"
			, method: "post"
			, filters : [ passport.authenticate( 'local' , { failureRedirect: '/', failureFlash: 'Invalid username or password.'}) ]
			, render : function( req , res ){
				res.redirect("/");
			}
		}

		, logout = function ( req , res ){
			req.logout();
			req.session.destroy();
			res.redirect('/login');
		};

	});

	return indexController;
};