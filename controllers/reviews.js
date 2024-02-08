const Campground = require('../models/campground')
const Review = require('../models/review')
const catchAsyncError = require('../utils/catchAsyncError')

module.exports.createReview = catchAsyncError(async (req, res) => {
	const campground = await Campground.findById(req.params.id)
	const review = new Review(req.body.review)
	review.author = req.user._id
	campground.reviews.push(review)
	await review.save()
	await campground.save()
	req.flash('success', 'Successfully created the review')
	res.redirect(`/campgrounds/${campground._id}`)
})

module.exports.deleteReview = catchAsyncError(async (req, res) => {
	const { id, reviewID } = req.params
	await Review.findByIdAndDelete(reviewID)
	await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewID } })
	req.flash('success', 'Successfully deleted the review')
	res.redirect(`/campgrounds/${id}`)
})
