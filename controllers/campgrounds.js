const { cloudinary } = require('../cloudinary')
const Campground = require('../models/campground')
const catchAsyncError = require('../utils/catchAsyncError')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })

module.exports.renderNewForm = (req, res) => {
	res.render('campgrounds/new')
}

module.exports.createCampground = catchAsyncError(async (req, res, next) => {
	const campground = new Campground(req.body.campground)
	campground.author = req.user._id
	campground.images = req.files.map((file) => ({
		url: file.path,
		filename: file.filename,
	}))
	const geoData = await geocoder
		.forwardGeocode({
			query: req.body.campground.location,
			limit: 1,
		})
		.send()
	campground.geometry = geoData.body.features[0].geometry
	await campground.save()
	req.flash('success', 'Successfully created a new campground')
	res.redirect(`/campgrounds/${campground._id}`)
})

module.exports.showCampground = catchAsyncError(async (req, res, next) => {
	const campground = await Campground.findById(req.params.id)
		.populate({ path: 'reviews', populate: 'author' })
		.populate('author')
	if (!campground) {
		req.flash('error', 'Can not find campground')
		res.redirect('/campgrounds')
	}
	res.render('campgrounds/show', { campground })
})

module.exports.renderEditForm = catchAsyncError(async (req, res) => {
	const campground = await Campground.findById(req.params.id)
	if (!campground) {
		req.flash('error', 'Can not find campground')
		res.redirect('/campgrounds')
	}
	res.render('campgrounds/edit', { campground })
})

module.exports.editCampground = catchAsyncError(async (req, res) => {
	const { id } = req.params
	const campground = await Campground.findByIdAndUpdate(id, {
		...req.body.campground,
	})
	campground.images.push(
		...req.files.map((file) => ({
			url: file.path,
			filename: file.filename,
		})),
	)
	await campground.save()

	const deleteFileNames = req.body.deleteImages
	if (deleteFileNames) {
		// Pull images where filename in deleteFileNames
		await campground.updateOne({
			$pull: { images: { filename: { $in: deleteFileNames } } },
		})
		// destroy each image on Cloudinary
		for (let filename of deleteFileNames) {
			cloudinary.uploader.destroy(filename)
		}
	}

	req.flash('success', 'Successfully updated the campground')
	res.redirect(`/campgrounds/${campground._id}`)
})

module.exports.deleteCampground = catchAsyncError(async (req, res) => {
	await Campground.findByIdAndDelete(req.params.id)
	req.flash('success', 'Successfully deleted the campground')
	res.redirect('/campgrounds')
})

module.exports.index = catchAsyncError(async (req, res) => {
	const campgrounds = await Campground.find({})
	res.render('campgrounds/index', { campgrounds })
})
