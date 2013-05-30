module.exports = {
	development : {
		driver : "mongoose"
		, uri : "mongodb://localhost/nodepress"
	}
	, test : {
		driver : "mongoose"
		, uri : process.env.MONGOHQ_URL || 'mongodb://localhost/mydb'
	}
	, production : {
		driver : "mongoose"
		, uri : process.env.MONGOHQ_URL || 'mongodb://localhost/mydb'
	}
}