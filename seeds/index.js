const mongoose = require('mongoose')
const Campground = require('../models/campground')
const cities = require('./cities')
const { descriptors, places } = require('./seedHelpers')
const { error } = require('console')

mongoose.connect('mongodb://localhost:27017/yelp-camp')
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
	for (let i = 0; i < 300; i++) {
		const randomCity = random(cities)
		const campground = new Campground({
			title: `${random(descriptors)} ${random(places)}`,
			price: Math.floor(Math.random() * 20),
			description: 'Beautiful campground',
			location: `${randomCity.city}, ${randomCity.province_id}`,
			images: [
				{
					url: 'https://res.cloudinary.com/damprmonl/image/upload/v1701045747/YelpCamp/oaq6lpkoqu596c6os7yf.jpg',
					filename: 'YelpCamp/oaq6lpkoqu596c6os7yf',
				},
			],
			geometry: {
				type: 'Point',
				coordinates: [randomCity.lng, randomCity.lat],
			},
			author: '655568a9601a10b2a39fc819',
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
