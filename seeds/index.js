process.env.NODE_ENV !== 'production' && require('dotenv').config()
const mongoose = require('mongoose')
const Campground = require('../models/campground')
const cities = require('./cities')
const defaultImages = require('./defaultImages')
const { descriptors, places } = require('./seedHelpers')

// connect to the database
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'
mongoose.connect(dbUrl)
// call mongoose.connection to check on connection status
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
	console.log('Database connected')
})

// function to get a random object from an array
const random = (array) => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
	await Campground.deleteMany({})
	for (let i = 0; i < 20; i++) {
		const randomCity = random(cities)
		const defaultImage = random(defaultImages)
		const campground = new Campground({
			title: `${random(descriptors)} ${random(places)}`,
			price: Math.floor(Math.random() * 20),
			description: 'Beautiful campground',
			location: `${randomCity.city}, ${randomCity.province_id}`,
			images: [
				{
					url: defaultImage.url,
					filename: defaultImage.public_id,
				},
			],
			geometry: {
				type: 'Point',
				coordinates: [randomCity.lng, randomCity.lat],
			},
			author: '65c055bc6e6629101d26fda7',
		})
		await campground.save()
	}
	console.log('Successfully seed database')
}

seedDB()
	.then(() => {
		console.log('Database closed')
		mongoose.connection.close()
	})
	.catch((error) => {
		console.log(error)
	})
