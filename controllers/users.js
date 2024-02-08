const User = require('../models/user')
const catchAsyncError = require('../utils/catchAsyncError')

module.exports.renderRegister = (req, res) => {
	res.render('users/register')
}

module.exports.register = catchAsyncError(async (req, res) => {
	const { username, email, password } = req.body
	const user = new User({ email, username })
	const registeredUser = await User.register(user, password)
	req.login(registeredUser, (err) => {
		if (err) return next(err)
		req.flash('success', 'Welcome to Yelpcamp!')
		res.redirect('/campgrounds')
	})
})

module.exports.renderLogin = (req, res) => {
	res.render('users/login')
}

module.exports.login = (req, res) => {
	const redirectUrl = res.locals.returnTo || '/campgrounds'
	req.flash('success', 'Welcome back!')
	res.redirect(redirectUrl)
}

module.exports.logout = (req, res) => {
	req.logout((err) => {
		if (err) {
			return next(err)
		}
		req.flash('success', 'Goodbye!')
		res.redirect('/campgrounds')
	})
}
