// function to wrap around async methods so that
// errors will be capped and sent to app.use() error handlers
module.exports = (fn) => {
	return (req, res, next) => {
		fn(req, res, next).catch((e) => next(e))
	}
}
