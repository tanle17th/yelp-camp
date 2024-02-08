const csv = require('csv-parser')
const fs = require('fs')
const results = []

fs.createReadStream('canadacities.csv')
	.pipe(
		csv({
			mapHeaders: ({ header, index }) => {
				if (
					header == 'postal' ||
					header == 'density' ||
					header == 'city_ascii'
				)
					return null
				return header
			},
			mapValues: ({ header, index, value }) => {
				if (
					header == 'lat' ||
					header == 'lng' ||
					header == 'population'
				)
					return Number(value)
				return value
			},
		}),
	)
	.on('data', (data) => results.push(data))
	.on('end', () => {
		console.log(results)
		fs.writeFile('cities.js', JSON.stringify(results), (err) => {
			if (err) {
				console.error('Error writing file:', err)
			} else {
				console.log('Data has been written to data.js')
			}
		})
	})
