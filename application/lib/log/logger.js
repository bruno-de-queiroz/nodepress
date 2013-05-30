function Logger() {
	this.mode = [ "error", "info" , "debug" , "success" ];
	this.colors = true;
}

Logger.prototype = function() {
	var colors = {
			error  : '\033[31m'
			, info  : '\033[34m'
			, success : '\033[32m'
			, debug : '\033[1;37m'
			, reset : '\033[0m'
			, black : '\033[30m'
		}
		, _log = function( type , message ) {
			if( !!(~this.mode.indexOf(type)) ) {
				var date = new Date().toTimeString()
					, color = this.colors ? colors[ type ] : ""
					, reset = this.colors ? colors.reset : ""
					, black = this.colors ? colors.black : ""
					, type = type.toUpperCase()


				if( typeof message != "string" )
					message = JSON.stringify(message);

				console.log( black + date + " - " +  color + type + ": " + reset + message);
			}
			return this;
		};

	return {
		setMode : function( mode ){
			if( typeof(mode) == "string" ){
				this.mode = [ mode ];
			} else
				this.mode = mode;
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
	};
}();

GLOBAL.log = new Logger();