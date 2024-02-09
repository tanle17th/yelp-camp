process.env.NODE_ENV !== 'production' && require('dotenv').config()
const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const methodOverride = require('method-override')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const flash = require('connect-flash')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')
const AppError = require('./utils/AppError')

const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')

const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')

// connect to the database
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'
mongoose.connect(dbUrl)
// call mongoose.connection to check on connection status
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
	console.log('Database connected')
})

const app = express()

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.engine('ejs', ejsMate)
app.use(express.static(path.join(__dirname, 'public')))
// To remove data using these defaults:
app.use(mongoSanitize())

// This whole piece is to improve security of the app
// using helmet
// Define allowed apis to fetch data from
const scriptSrcUrls = [
	'https://stackpath.bootstrapcdn.com/',
	'https://api.tiles.mapbox.com/',
	'https://api.mapbox.com/',
	'https://kit.fontawesome.com/',
	'https://cdnjs.cloudflare.com/',
	'https://cdn.jsdelivr.net',
]
const styleSrcUrls = [
	'https://kit-free.fontawesome.com/',
	'https://stackpath.bootstrapcdn.com/',
	'https://api.mapbox.com/',
	'https://api.tiles.mapbox.com/',
	'https://fonts.googleapis.com/',
	'https://use.fontawesome.com/',
	'https://cdn.jsdelivr.net',
]
const connectSrcUrls = [
	'https://api.mapbox.com/',
	'https://a.tiles.mapbox.com/',
	'https://b.tiles.mapbox.com/',
	'https://events.mapbox.com/',
]
const fontSrcUrls = []
app.use(
	helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: [],
			connectSrc: ["'self'", ...connectSrcUrls],
			scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
			styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
			workerSrc: ["'self'", 'blob:'],
			objectSrc: [],
			imgSrc: [
				"'self'",
				'blob:',
				'data:',
				'https://res.cloudinary.com/damprmonl/', //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
				'https://images.unsplash.com/',
			],
			fontSrc: ["'self'", ...fontSrcUrls],
		},
	}),
)

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

// MongoDB session store for Connect and Express
const store = MongoStore.create({
	mongoUrl: dbUrl,
	touchAfter: 24 * 60 * 60, // time period in seconds
	crypto: {
		secret: 'thisismysecret!',
	},
})
app.use(
	session({
		store,
		name: 'session',
		secret: 'thisismysecret!',
		saveUninitialized: false, // don't create session until something stored
		resave: false, //don't save session if unmodified
		cookie: {
			// Prevent the cookie from client-side scripting
			httpOnly: true,
			// secure: true, // this will be set in the future when HTTPS is required
			// Set the cookie to expire in 1 week
			expires: Date.now() * 1000 * 60 * 60 * 24 * 7,
			maxAge: 1000 * 60 * 60 * 24 * 7,
		},
	}),
)

app.use(flash())
// initialize passport
app.use(passport.initialize())
// use persistent session
app.use(passport.session())
// tell passport to use User schema as LocalStrategy authentication
// authenticate() comes from passport local mongoose
passport.use(new LocalStrategy(User.authenticate()))

// these methods is to tell how to store and unstore
// user's data in the session
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// This middleware is to set the success flash
// to locals object as a key success
// So all views have access to this locals
app.use((req, res, next) => {
	res.locals.currentUser = req.user
	res.locals.success = req.flash('success')
	res.locals.error = req.flash('error')
	next()
})

app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

app.get('/', (req, res) => {
	res.render('home')
})

app.all('*', (req, res) => {
	throw new AppError('Page not found', 404)
})

app.use(function (err, req, res, next) {
	if (!err.message) err.message = 'Page not found'
	req.flash('error', err.message)
	const redirectPath =
		err.message === 'Page not found' ? '/campgrounds' : req.path
	res.redirect(redirectPath)
})

app.listen(3000, () => {
	console.log('Serving on port 3000 http://localhost:3000')
})
