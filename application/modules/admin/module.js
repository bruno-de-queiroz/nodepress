module.exports = {
	name : "admin"
	, title : "Admin"
	, theme : "default"
	, controllers : MODULES_PATH + "/admin/controllers"
	, middlewares : MODULES_PATH + "/admin/middlewares"
	, views : MODULES_PATH + "/admin/views/themes"
	, express : {
		development : {
			domain: "admin."
			, secret : "nodepress"
		}
		, test : {
			domain: "admin."
			, secret : "nodepress"
		}
		, production : {
			domain: "admin."
			, secret : "nodepress"
		}
	}
	, auth : {
		model : "UserAdmin"
		, strategies : [ "local" ]
	}
};