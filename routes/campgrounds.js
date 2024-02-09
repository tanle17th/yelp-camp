process.env.NODE_ENV !== 'production' && require('dotenv').config()
const express = require('express')
const router = express.Router({ mergeParams: true })
const campgrounds = require('../controllers/campgrounds')
const {
	isAuthenticated,
	isAuthor,
	validateCampground,
} = require('../utils/middleware')
const { storage } = require('../cloudinary')
const multer = require('multer')
const upload = multer({ storage })

router
	.route('/new')
	.get(isAuthenticated, campgrounds.renderNewForm)
	.post(
		isAuthenticated,
		upload.array('image'),
		validateCampground,
		campgrounds.createCampground,
	)

router
	.route('/:id')
	.get(campgrounds.showCampground)
	.put(
		isAuthenticated,
		isAuthor,
		upload.array('image'),
		validateCampground,
		campgrounds.editCampground,
	)
	.delete(isAuthenticated, isAuthor, campgrounds.deleteCampground)

router.get('/:id/edit', isAuthenticated, isAuthor, campgrounds.renderEditForm)

router.get('/', campgrounds.index)

module.exports = router
