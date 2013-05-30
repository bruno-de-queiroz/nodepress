module.exports = function(config){
	log.debug( "Initiating database" );
	var mongoose = require("mongoose");
	mongoose.connect(config.database.uri);
};