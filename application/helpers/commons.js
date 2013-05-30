module.exports = {
	getMessages : function( req ) {
		return {
			"error" : req.flash("error")
			, "success" : req.flash("success")
			, "warning" : req.flash("warnings")
			, "info" : req.flash("info")
		}

	}
	, createPagination : function( req, res ){
		return function( pages, page ) {
			var qs = require('querystring')
				, params = qs.parse(url.parse(req.url).query)
				, str = ''
				, p = 1
				, klass;

			params.page = 0;

			klass = page == 0 ? "active" : "no";

			str += '<li class="' + klass + '"><a href="?' + qs.stringify( params ) + '">' + res.locals.lang("First") + '</a></li>';

			for ( ; p < pages ; p++) {
				params.page = p;
				klass = page == p ? "active" : "no";
				str += '<li class="' + klass + '"><a href="?' + qs.stringify(params) + '">'+ p +'</a></li>';
			}

			params.page = --p;

			klass = page == params.page ? "active" : "no";

			str += '<li class="' + klass + '"><a href="?' + qs.stringify( params ) + '">' + res.locals.lang("Last") + '</a></li>';

			return str;
		};
	}
	, escape : function( params ) {
		var _escape = function( params ) {
			var keys = Object.keys( params )
				, key;

			while( keys.length ){
				key = keys.shift();

				if( typeof(params[ key ]) === 'object' )
					params[ key ] = _escape( params[ key ] );
				else
					params[ key ] = params[ key ].toString("utf8");

			}

			return params;
		};
		return _escape( params );
	}
};