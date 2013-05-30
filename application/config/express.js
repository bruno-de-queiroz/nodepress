module.exports = {
	development : {
		key: "express.sid"
		, secret: "nodepress"
		, gzip : true
		, maxAge: 0
	}
	, test : {
		key: "express.sid"
		, secret: "nodepress"
		, gzip : true
		, maxAge: 365 * 24 * 60 * 60 * 1000
	}
	, production : {
		key: "express.sid"
		, secret: "nodepress"
		, gzip : true
		, maxAge: 365 * 24 * 60 * 60 * 1000
	}
}