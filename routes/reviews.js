const express = require('express')
const router = express.Router({ mergeParams: true })

const reviews = require('../controllers/reviews')

const {
	isAuthenticated,
	validateReview,
	isReviewAuthor,
} = require('../utils/middleware')

router.post('/', isAuthenticated, validateReview, reviews.createReview)

router.delete(
	'/:reviewID',
	isAuthenticated,
	isReviewAuthor,
	reviews.deleteReview,
)

module.exports = router
