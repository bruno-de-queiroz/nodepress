var Application = {};

/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

var dateFormat = function () {
	var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
		timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
		timezoneClip = /[^-+\dA-Z]/g,
		pad = function (val, len) {
			val = String(val);
			len = len || 2;
			while (val.length < len) val = "0" + val;
			return val;
		};

	// Regexes and supporting functions are cached through closure
	return function (date, mask, utc) {
		var dF = dateFormat;

		// You can't provide utc if you skip other args (use the "UTC:" mask prefix)
		if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
			mask = date;
			date = undefined;
		}

		// Passing date through Date applies Date.parse, if necessary
		date = date ? new Date(date) : new Date;
		if (isNaN(date)) throw SyntaxError("invalid date");

		mask = String(dF.masks[mask] || mask || dF.masks["default"]);

		// Allow setting the utc argument via the mask
		if (mask.slice(0, 4) == "UTC:") {
			mask = mask.slice(4);
			utc = true;
		}

		var	_ = utc ? "getUTC" : "get",
			d = date[_ + "Date"](),
			D = date[_ + "Day"](),
			m = date[_ + "Month"](),
			y = date[_ + "FullYear"](),
			H = date[_ + "Hours"](),
			M = date[_ + "Minutes"](),
			s = date[_ + "Seconds"](),
			L = date[_ + "Milliseconds"](),
			o = utc ? 0 : date.getTimezoneOffset(),
			flags = {
				d:    d,
				dd:   pad(d),
				ddd:  dF.i18n.dayNames[D],
				dddd: dF.i18n.dayNames[D + 7],
				m:    m + 1,
				mm:   pad(m + 1),
				mmm:  dF.i18n.monthNames[m],
				mmmm: dF.i18n.monthNames[m + 12],
				yy:   String(y).slice(2),
				yyyy: y,
				h:    H % 12 || 12,
				hh:   pad(H % 12 || 12),
				H:    H,
				HH:   pad(H),
				M:    M,
				MM:   pad(M),
				s:    s,
				ss:   pad(s),
				l:    pad(L, 3),
				L:    pad(L > 99 ? Math.round(L / 10) : L),
				t:    H < 12 ? "a"  : "p",
				tt:   H < 12 ? "am" : "pm",
				T:    H < 12 ? "A"  : "P",
				TT:   H < 12 ? "AM" : "PM",
				Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
				o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
				S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
			};

		return mask.replace(token, function ($0) {
			return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
		});
	};
}();

// Some common format strings
dateFormat.masks = {
	"default":      "ddd mmm dd yyyy HH:MM:ss",
	shortDate:      "m/d/yy",
	mediumDate:     "mmm d, yyyy",
	longDate:       "mmmm d, yyyy",
	fullDate:       "dddd, mmmm d, yyyy",
	shortTime:      "h:MM TT",
	mediumTime:     "h:MM:ss TT",
	longTime:       "h:MM:ss TT Z",
	isoDate:        "yyyy-mm-dd",
	isoTime:        "HH:MM:ss",
	isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
	isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
	dayNames: [
		"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
		"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
	],
	monthNames: [
		"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
		"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
	]
};

// For convenience...
Date.prototype.format = function (mask, utc) {
	return dateFormat(this, mask, utc);
};

function Logger() { 
	this.enabled = false;
	this.mode = [ "error", "info" , "debug" , "success" ]
}

Logger.prototype = function() {
	var _log = function( type , message ) {
			if( this.enabled && typeof(console.log) == "function" ) {
				if( !!(~this.mode.indexOf(type)) ) {
					var date = new Date().toTimeString()
						, type = type.toUpperCase()


					if( typeof message == "string" )
						console.log( date + " - " +  type + ": " + message);
					else {
						console.log( date + " - " + type + ": " );
						console.log( message );
					}
				}
			}
		}

	return {
		setMode : function( mode ){
			if( typeof(mode) == "string" ){
				this.mode = [ mode ];
			} else 
				this.mode = mode;
		}
		, enable : function( ) {
			this.enabled = true;
		}
		, disable : function( ) {
			this.enabled = false;
		}
		, debug : function( message ) {
			_log.call(this,"debug",message);
		}
		, info : function( message ) {
			_log.call(this,"info",message);
		}
		, error : function( message ) {
			_log.call(this,"error",message);
		}
		, ok : function( message ) {
			_log.call(this,"success",message);
		}
	}
}();

var log = new Logger();

Application.Library = function() {
	"use strict";
	var dom = {};
		dom.query = jQuery;

	var	_getClass = function(obj){
			if (typeof obj === "undefined")
				return "undefined";
			if (obj === null)
				return "null";
				return Object.prototype.toString.call(obj).match(/^\[object\s(.*)\]$/)[1];
		}
		, _find = function(parent,object){
			return dom.query(parent).find(object);
		}
		, _new = function(id,type,attr,html){
			var obj = dom.query("<"+type+"></"+type+">");
			obj.attr("id",id);
			if(attr)
				obj.attr(attr);
			if(html)
				obj.html(html);

			return _treatReturn(obj[0]);
		}
		, _merge = function(a,b){
			return dom.query.extend({},a,b);
		}
		, _attr = function(el,attr,value){
			var result;
			if(value){
				dom.query(el).attr(attr,value);
				result = _treatReturn(dom.query(el)[0]);
			} else {
				if(typeof attr != "object" ) throw new Error("Invalid arguments");
				result = dom.query(el).attr(attr);
			}
			return result;
		}
		, _remove = function(selector){
			dom.query(selector).remove();
		}
		, _animate = function(type,obj,callback,time){
			var obj = dom.query(obj);
			obj[type](time ? time : "fast",callback);
			return _treatReturn(obj[0]);
		}
		, _append = function(a,b) {
			dom.query(a).append(b);
		}
		, _get = function(selector) {
			return dom.query(selector);
		}
		, _html = function(selector,html){
			var query = dom.query(selector);
			query.html(html);
			return _treatReturn(query[0]);
		}
		, _bind = function(selector,event,callback){
			dom.query(selector).on(event,callback);
		}
		, _unbind = function(selector,event){
			dom.query(selector).off(event);
		}
		, _treatMutiples = function(array){
			var objs = []
			for(var i = 0, j= array.length; i<j; i++){
				var obj = array[i];
				objs.push(_treatReturn(obj));
			}

			return objs;
		}
		, _ajax = function(options){
			dom.query.ajax(options);
		}
		, _treatReturn = function(obj){

			var wrapper = {
				selector : obj
				, find : function(query){
					return _find.call(this,obj,query)
				}
				, attr : function(attr,value) {
					return _attr.call(this,obj,attr,value);
				}
				, bind : function(e,callback){
					return _bind.call(this,obj,e,callback);
				}
				, addClass : function(klass){
					dom.query(obj).addClass(klass);
					return this;
				}
				, val : function( value ){
					obj.value = value;
					return this;
				}
				, removeClass : function(klass){
					dom.query(obj).removeClass(klass);
					return this;
				}
				, append : function(object){
					return _append.call(this,obj,object);
				}
				, show : function(time,callback){
					 dom.query(obj).show(time,callback);
				}
				, offset: function() {
					return dom.query(obj).offset();
				}
				, position: function() {
					return dom.query(obj).position();
				}
				, css : function(){
					dom.query(obj).css(arguments);
				}
				, hide : function(time,callback){
					 dom.query(obj).hide(time,callback);
				}, slideDown : function(time,callback){
					 dom.query(obj).slideDown(time,callback);
				}
				, slideUp : function(time,callback){
					 dom.query(obj).slideUp(time,callback);
				}
				, animate : function(type,time,callback){
					 _animate.call(this,type,obj,callback,time);
				}
				, html : function(string){
					return _html.call(this,obj,string);
				}
				, on : function(event,callback){
					return _bind.call(this,obj,event,callback);
				}
				, off : function(event){
					return _unbind.call(this,obj,event);
				}
			}

			return wrapper;
		}

	return {
		getClass: _getClass
		, create: _new
		, merge : _merge
		, attr: _attr
		, remove: _remove
		, animate: _animate
		, append: _append
		, get: _get
		, find : _find
		, html: _html
		, bind: _bind
		, unbind: _unbind
		, ajax : _ajax
	};
};

Application.Mediator = function() {
	var self = this,
		_channels = {},
		_ = function(object, arguments){
			var args = [];
			for (var i = 0, j = arguments.length; i < j; i++) {
				args.push(arguments[i].constructor.toString().match(/function\s+(\w+)s*/)[1]);
			}
			args.pop();
			return object[args.toString()].apply(this, arguments);
		},
		_s = {
			"String" : function(channel,fn){

				if(typeof fn != "function") throw new Error("You must specify a function as callback");
				if(!_channels[channel]) _channels[channel] = { listeners: {}, subchannels: {} };
				_channels[channel].listeners[this.instance.name] = { context: this, callback: fn };
				return this;
			},
			"String,String" : function(channel,subchannel,fn){
				if(typeof fn != "function") throw new Error("You must specify a function as callback");
				if(!_channels[channel]) _channels[channel] = { listeners: {}, subchannels: {} };
				if(!_channels[channel].subchannels[subchannel]) _channels[channel].subchannels[subchannel] = { listeners: {} };
				_channels[channel].subchannels[subchannel].listeners[this.name] = { context: this, callback: fn };
				return this;
			}
		},
		_p = {
			"String" : function(channel){
				if(!_channels[channel]) return false;
				var args = Array.prototype.slice.call(arguments, 1);
				for (var i in _channels[channel].listeners){
					var subscription = _channels[channel].listeners[i];
					subscription.callback.apply(subscription.context, args);
				}
				return this;
			},
			"String,String" : function(channel,subchannel){
				if(!_channels[channel]) return false;
				if(!_channels[channel].subchannels[subchannel]) return false;
				var args = Array.prototype.slice.call(arguments, 2);
				for (var i in _channels[channel].subchannels[subchannel].listeners){
					var subscription = _channels[channel].subchannels[subchannel].listeners[i];
					subscription.callback.apply(subscription.context, args);
				}
				return this;
			}
		},
		_u = function() {
			var overloads = {
				"String" : function(channel){
					if(_channels[channel].listeners.hasOwnProperty(this.instance.name))
						delete _channels[channel].listeners[this.instance.name]
				},
				"String,String" : function(channel,subchannel) {
					if(_channels[channel].subchannels[subchannel].listeners.hasOwnProperty(this.instance.name))
						delete _channels[channel].subchannels[subchannel].listeners[this.instance.name]
				}
			}
			var args = [];
			for (var i = 0, j = arguments.length; i < j; i++) {
				args.push(arguments[i].constructor.toString().match(/function\s+(\w+)s*/)[1]);
			}
			return overloads[args.toString()].apply(this, arguments);
		},
		_subscribe = function() {
			_.call(this,_s,arguments);
		},
		_publish = function() {
			_.call(this,_p,arguments);
		},
		_unsubscribe = function() {
			_u.apply(this,arguments);
		},
		_clean = function(channels,module){
			for ( var i in channels ) {
				var channel = channels[i];
				if(channel.listeners.hasOwnProperty(module))
					delete channel.listeners[module];

				if(channel.hasOwnProperty("subchannels"))
					_clean(channel.subchannels,module);
			}
		}
	return {
		channels: _channels,
		publish: _publish,
		subscribe: _subscribe,
		unsubscribe: _unsubscribe,
		clean: _clean,
		install: function(obj){
			obj.subscribe = _subscribe;
			obj.publish = _publish;
			obj.unsubscribe = _unsubscribe;
		}
	};
};

Application.Sandbox = function (){
	var lib = new Application.Library(),
		mediator = new Application.Mediator(),
		el = lib.get("#content"),
		_ = function(fn, arguments){
			var args = [];
			for (var i = 0, j = arguments.length; i < j; i++) {
				args.push(arguments[i].constructor.toString().match(/function\s+(\w+)s*/)[1]);
			}

			return fn[args.toString()].apply(this, arguments);
		},
		_remove = {
			"Object,String" : function(el,m) {
				lib.remove(el);
				this.unsubscribe(m);
			},
			"String" : function(m) {
				this.unsubscribe(m);
			}
		};
	return {
		append: function(a,b) {
			if(b){
				lib.append(a,b);
			} else {
				lib.append(el,a);
			}
		},
		getClass: lib.getClass,
		new: lib.new,
		remove: function(name) {
			this.unsubscribe(name);
		},
		attr: lib.attr,
		get: lib.get,
		ajax: lib.ajax,
		find: lib.find,
		animate: lib.animate,
		html: lib.html,
		bind: lib.bind,
		unbind: lib.unbind,
		merge: lib.merge,
		publish: mediator.publish,
		subscribe: mediator.subscribe,
		unsubscribe: mediator.unsubscribe,
		clean: mediator.clean,
		install: mediator.install
	};
};

var core = Application.Core = (function() {
	var modules = {},
		sandbox = new Application.Sandbox(),
		_register = function(m,creator){
			modules[m] = {
				creator: creator,
				instance: null
			};
		},
		_init = function() {
			console.log(modules);
			for(var i in modules){
				try {
					console.log(i);
					_start(i);
				} catch(err){
					log.debug(err.message);
				}
			}
		},
		_start = function(m) {
			try {
				if(!modules.hasOwnProperty(m)) return false;
				var module = modules[m];
				module.instance = new (module.creator)( m , sandbox );
				log.debug( module.instance.name.toUpperCase() + ": Initiating widget");
			} catch(err){
				log.error(err.stack);
			}
		},
		_stop = function(m){
			try {
				if(!modules.hasOwnProperty(m)) return false;
				var module = modules[m];
				if(module.instance){
					module.instance.destroy();
					module.instance = null;
				}
			} catch(err){
				log.error(err.getStack());
			}
		};
	return {
		register: _register,
		init: _init,
		stop: _stop,
		start: _start
	};
}());