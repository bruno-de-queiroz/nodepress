// User
var mongoose = require( 'mongoose' )
	, Schema = mongoose.Schema;

var UserSchema = new Schema(
	{
		name: { type: String, default: '', required: true }
		, email: { type: String, default: '', unique:true, required: true, lowercase: true, trim: true }
		, username: { type: String, default: '', unique:true, required: true, trim:true  }
		, provider: { type: String, default: '', required: true }
		, facebook : {}
		, picture : {
				small: String,
				medium: String,
				large: String
		}
		, oauthToken : { type: String, required : true }
		, lastConnected : { type: Date, default: Date.now }
	});


mongoose.model('User', UserSchema);