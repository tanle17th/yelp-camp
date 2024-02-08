const AppError = require('./AppError')
const Campground = require('../models/campground')
const Review = require('../models/review')
const { campgroundJoiSchema, reviewJoiSchema } = require('../schemas')

module.exports.isAuthenticated = (req, res, next) => {
	if (!req.isAuthenticated()) {
		req.session.returnTo = req.originalUrl
		req.flash('error', 'You must sign in first')
		return res.redirect('/login')
	}
	next()
}

module.exports.isAuthor = async (req, res, next) => {
	const { id } = req.params
	const campground = await Campground.findById(id)
	if (!campground.author.equals(req.user._id)) {
		req.flash('error', 'You do not have permission to do that')
		return res.redirect(`/campgrounds/${id}`)
	}
	next()
}

module.exports.isReviewAuthor = async (req, res, next) => {
	const { id, reviewID } = req.params
	const review = await Review.findById(reviewID)
	if (!review.author.equals(req.user._id)) {
		req.flash('error', 'You do not have permission to do that')
		return res.redirect(`/campgrounds/${id}`)
	}
	next()
}

module.exports.setReturnTo = (req, res, next) => {
	if (req.session.returnTo) {
		res.locals.returnTo = req.session.returnTo
	}
	next()
}

// Validate backend Campground data
module.exports.validateCampground = (req, res, next) => {
	const { error } = campgroundJoiSchema.validate(req.body)
	if (error) {
		const message = error.details.map((err) => err.message).join(', ')
		throw new AppError(message, 400)
	} else {
		next()
	}
}

// Validate backend Review data
module.exports.validateReview = (req, res, next) => {
	const { error } = reviewJoiSchema.validate(req.body)
	if (error) {
		const message = error.details.map((err) => err.message).join(', ')
		throw new AppError(message, 400)
	} else {
		next()
	}
}
