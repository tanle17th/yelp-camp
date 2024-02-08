const express = require('express')
const router = express.Router({ mergeParams: true })
const passport = require('passport')
const { setReturnTo } = require('../utils/middleware')
const users = require('../controllers/users')

router.route('/register').get(users.renderRegister).post(users.register)

router
	.route('/login')
	.get(users.renderLogin)
	.post(
		// use the storeReturnTo middleware to save the returnTo value from session to res.locals
		setReturnTo,
		// passport.authenticate logs the user in and clears req.session
		passport.authenticate('local', {
			failureFlash: true,
			failureRedirect: '/login',
		}),
		users.login,
	)

router.get('/logout', users.logout)

module.exports = router
