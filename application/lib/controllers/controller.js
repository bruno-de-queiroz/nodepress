var _ = require("lodash")
	, Controller = function(){
		this.routes = {};
		this.virtuals = [];
		this.filters = {};
		this.constructor.call(this,arguments)
	}

Controller.prototype = function() {
	var _constructors = {
		"Function,Object,Array" : function(app,routes,virtuals) {
			this.app = app;
			this.routes = routes;
			this.virtuals = virtuals;
			this.init();
		}
		, "Function,Object" : function(app,routes) {
			this.app = app;
			this.routes = routes;
			this.init();
		}
		, "Function" : function(app) {
			this.app = app;
		}
		, "String,Function,Object,Array" : function(name,app,routes,virtuals) {
			this.name = name;
			this.app = app;
			this.routes = routes;
			this.virtuals = virtuals;
			this.init();
		}
		, "String,Function,Object" : function(name,app,routes) {
			this.name = name;
			this.app = app;
			this.routes = routes;
			this.init();
		}
		, "String,Function" : function(name,app) {
			this.name = name;
			this.app = app;
		}
	}

	return {
		constructor: function(){
			var args = [];
			for( var i = 0,j=arguments.length;i<j;i++)
				args.push(arguments[i].constructor.toString().match(/function\s+(\w+)s*/)[1])

			if(_constructors.hasOwnProperty(args.toString()))
				_constructors[args.toString()].apply(this,arguments);
			else {
				console.log("Controller: Undefined params");
				return false;
			}
		}
		, action : function(name,route) {
			if(!this.routes.hasOwnProperty(name)){
				_.merge(this.routes,{ name : route });
				this.addRoute(route);
			} else {
				console.log("Controller: Route already started");
				return false;
			}
		}
		, addRoute : function(obj) {

			var args = [];

			if(!obj.mapping) return false;

			args.push(obj.mapping);

			if(obj.filters){
				for(var n=0,m=obj.filters.length;n<m;n++)
					args.push(obj.filters[n]);
			}

			args.push(obj.render);

			this.app[ (obj.method ? obj.method : 'get') ].apply(this.app,args);

		}
		, addVirtual : function(obj){

			var args = [];

			if(!obj.mapping) return false;

			args.push(obj.mapping);

			if(obj.filters){
				for(var n=0,m=obj.filters.length;n<m;n++)
					args.push(obj.filters[n]);
			}

			if(!this.routes.hasOwnProperty(obj.action)) return false;

			args.push(this.routes[obj.action].render);

			this.app[ (obj.method ? obj.method : 'get') ].apply(this.app,args);

		}
		, addFilter : function(param,callback){

			this.app.param(param, callback);

		}
		, init : function(){

			for (var obj in this.routes)
				this.addRoute(this.routes[obj]);

			for (var obj in this.virtuals)
				this.addVirtual(this.virtuals[obj]);

			for (var filter in this.filters)
				this.addFilter(filter, this.filters[filter])

		}
	}
}();

GLOBAL.Controller = Controller;