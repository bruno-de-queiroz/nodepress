// User Admin
var mongoose = require( 'mongoose' )
	, Schema = mongoose.Schema
	, crypto = require( 'crypto' )

var UserAdminSchema = new Schema(
	{
		name: { type: String, default: '', required: true }
		, email: { type: String, default: '', unique:true, required: true, lowercase: true, trim: true }
		, username: { type: String, default: '', unique:true, required: true, trim:true  }
		, hashed_password: { type: String }
		, events: [{ type: Schema.ObjectId, ref : 'Event' }]
		, salt: { type: String }
	});

UserAdminSchema
	.virtual( 'password' )
	.set(function( password ){
		this._password = password;
		this.salt = this.makeSalt();
		this.hashed_password = this.encryptPassword( password );
	})
	.get(function() {
		return this._password || "";
	});

UserAdminSchema
	.virtual( 'password_confirmation' )
	.set(function( password ){
		this._passwordConfirmation = password;
	})
	.get(function() {
		return this._passwordConfirmation || "";
	});

function isEmpty( string ){
	return !(string && string.length);
}

UserAdminSchema.pre( 'validate', function( next ) {
	if ( !this.isNew ) return next();

	if ( isEmpty( this.password ) ) {
		this.invalidate("password","required");
	} else if ( isEmpty( this.password_confirmation ) || ( this.password != this.password_confirmation ) ) {
		this.invalidate("password_confirmation","mismatch");
	}

	next();
});

UserAdminSchema.method('authenticate', function(plainText) {
	return this.encryptPassword(plainText) === this.hashed_password;
});

UserAdminSchema.method('makeSalt', function() {
	return Math.round((new Date().valueOf() * Math.random())) + '';
});

UserAdminSchema.method('encryptPassword', function(password) {
	if (!password) return '';
	return crypto.createHmac( 'sha1', this.salt ).update( password ).digest('hex');
});

mongoose.model('UserAdmin', UserAdminSchema);