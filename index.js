require('dotenv').config()

const express = require('express')
const app = express()
const fetch = require('node-fetch')
const cookieParser = require('cookie-parser')
const CryptoJS = require('crypto-js')
const MongoClient = require('mongodb').MongoClient;
const uri = process.env.MONGO_URI
const client = new MongoClient(uri, { useUnifiedTopology: true }, { useNewUrlParser: true });
const stripe = require('stripe')(process.env.STRIPE_API_TOKEN)
const { Decimal128 } = require('bson');

app.set('views', './views')
app.set('view engine', 'ejs') // use ejs engine to help client-server communication (middleware)
app.use(express.static('public'))
app.use(cookieParser()) //parse cookies to retrieve refresh token

client.connect(err => {
    if (err) throw err;
});

app.get('/', (req, res) => {
	res.redirect('/index')
})

app.get('/shop', async (req, res) => {
    const { code } = req.query //discord redirect code
	if (!code) { //not redirected from discord
		if (req.cookies.refreshTokenCookie) {
			try {

				let encCookie = req.cookies.refreshTokenCookie
				let dec = CryptoJS.AES.decrypt(encCookie, process.env.ENCRYPTION_KEY)
				let stringLit = dec.toString(CryptoJS.enc.Utf8)
		
				oauthResult = await fetch('https://discord.com/api/oauth2/token', {
					method: "POST",
					body: new URLSearchParams({
						client_id: process.env.CLIENT_ID,
						client_secret: process.env.CLIENT_SECRET,
						grant_type: 'refresh_token',
						refresh_token: stringLit
					})
				})
				
				const oauthData = await oauthResult.json()
				if (oauthData.error) { //invalid cookie
					res.redirect("https://discord.com/api/oauth2/authorize?client_id=864733251166797835&redirect_uri=https%3A%2F%2Facraffle.ribru17.repl.co%2Fshop%2F&response_type=code&scope=identify")
					return
				}
				
				const userResult = await fetch('https://discord.com/api/users/@me', {
					headers: {
						authorization: `${oauthData.token_type} ${oauthData.access_token}`,
					}
				})

				const jsonResult = await userResult.json()
				//console.log(oauthData);
				if (jsonResult.message) { //cache is gone, session timeout
					console.log('message detected')
					res.status(200).set('Content-Type', 'text/html')
					res.render('timeout')
					return
				}

				let encryptedRefresh = CryptoJS.AES.encrypt(oauthData.refresh_token, process.env.ENCRYPTION_KEY).toString()
				res.status(200).set('Content-Type', 'text/html')
				res.render('shop', { data: {...jsonResult, refreshToken: encryptedRefresh, mainurl: process.env.MAIN_URL} })
				return
				
			} catch (err) {
				console.error(err)
				res.status(200).set('Content-Type', 'text/html')
				res.render('timeout')
				return
			}
		}
		// res.status(200).set('Content-Type', 'text/html')
		// res.render('timeout')
		res.redirect("https://discord.com/api/oauth2/authorize?client_id=864733251166797835&redirect_uri=https%3A%2F%2Facraffle.ribru17.repl.co%2Fshop%2F&response_type=code&scope=identify")
		return
	}
	try {

		let oauthResult
		let oauthData

		if (req.cookies.refreshTokenCookie) { //refresh token stored in cookie

			let encCookie = req.cookies.refreshTokenCookie
			let dec = CryptoJS.AES.decrypt(encCookie, process.env.ENCRYPTION_KEY)
			let stringLit = dec.toString(CryptoJS.enc.Utf8)

			oauthResult = await fetch('https://discord.com/api/oauth2/token', { //validate refresh token
				method: "POST",
				body: new URLSearchParams({
					client_id: process.env.CLIENT_ID,
					client_secret: process.env.CLIENT_SECRET,
					grant_type: 'refresh_token',
					refresh_token: stringLit
				})
			})

			oauthData = await oauthResult.json()
			console.log(oauthData)
			if (oauthData.error) {
				oauthResult = await fetch('https://discord.com/api/oauth2/token', { //validate initial token
					method: 'POST',
					body: new URLSearchParams({
						client_id: process.env.CLIENT_ID,
						client_secret: process.env.CLIENT_SECRET,
						code,
						grant_type: 'authorization_code',
						redirect_uri: process.env.MAIN_URL + '/shop/',
						scope: 'identify',
					}),
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
				})
				oauthData = await oauthResult.json()
			}
		} else {
			oauthResult = await fetch('https://discord.com/api/oauth2/token', { //validate initial token
				method: 'POST',
				body: new URLSearchParams({
					client_id: process.env.CLIENT_ID,
					client_secret: process.env.CLIENT_SECRET,
					code,
					grant_type: 'authorization_code',
					redirect_uri: process.env.MAIN_URL + '/shop/',
					scope: 'identify',
				}),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
			})
			oauthData = await oauthResult.json()
		}

		// oauthData = await oauthResult.json()
		console.log(oauthResult)
		
		const userResult = await fetch('https://discord.com/api/users/@me', { //getting user info via discord
			headers: {
				authorization: `${oauthData.token_type} ${oauthData.access_token}`,
			}
		})

		const jsonResult = await userResult.json()
		
		if (jsonResult.message) { //cache is gone, session timeout
			console.log(jsonResult, "message detected")
			res.status(200).set('Content-Type', 'text/html')
			res.render('timeout')
			return
		}

		let encryptedRefresh = CryptoJS.AES.encrypt(oauthData.refresh_token, process.env.ENCRYPTION_KEY).toString()

		res.status(200).set('Content-Type', 'text/html')
		res.render('shop', { data: {...jsonResult, refreshToken: encryptedRefresh, mainurl: process.env.MAIN_URL} }) //send user data along with refresh token to the server
		return
	} catch (err) {
		console.error(err)
		res.status(200).set('Content-Type', 'text/html')
		res.render('cancel') //purchase failed, redirect to cancel page
		return
	}
})

app.get('/index', (req, res) => {
	res.status(200).set('Content-Type', 'text/html')
	res.render('index')
})

app.get('/success', (req, res) => {
    res.status(200).set('Content-Type', 'text/html')
    res.render('success')
})

app.get('/cancel', (req, res) => {
    res.status(200).set('Content-Type', 'text/html')
    res.render('cancel')
})

async function giveProduct(id, amt) {
	// console.log(BigInt(id))
	id = Decimal128.fromString(id)
	amt = parseInt(amt)
	client.db("acrafflebot").collection("users").findOne({ id: id }, (err, result) => {
		if (err) throw err
		if (!result) {
			console.log(`User with id: ${id} not found in database.`)
			return
		}
		// console.log(result)
	})
	client.db("acrafflebot").collection("users").updateOne({ id: id }, { $inc: { packs: amt }}, (err, result) => { //incement packs value by the integer
		if (err) {
			console.log(`Error giving user with id: ${id} their pack(s)`)
			console.log(err)
			return
		}
		// console.log(result);
	})
}

app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => { //handle stripe webhooks
    const payload = req.body
    const sig = req.headers['stripe-signature']
    let event

    // let session = payload.data.object //maybe important later
    
    try {
        event = stripe.webhooks.constructEvent(payload, sig, process.env.ENDPOINT_SECRET) //verify webhook is secure
    } catch (err) {
        return res.status(400).send(`Webhook error: ${err.message}`)
    }
	
    let id = event.data.object.metadata.id //discord id
		let amt = event.data.object.metadata.amt
		
    switch (event.type) {
			case "checkout.session.completed":
				console.log("session complete!");
				if (event.data.object.payment_status === 'paid') {
					giveProduct(id, amt)
					console.log("role given")
				} else {
					console.log("Waiting on funds");
				}
				break;
			case "checkout.session.async_payment_succeeded":
				giveProduct(id, amt)
					console.log("role given")
				break;
			case "checkout.session.async_payment_failed":
				console.log("Payment failure");
				break;
			default: //do nothing
    }
    res.json({received: true}) //webhook received. DO NOT REPLACE THIS WITH res.status(200).end()
})

app.post("/create-checkout-session", express.json({type: 'application/json'}), async (req, res) => {
    try {
		if (req.body.quantity.indexOf('e') !== -1) {
			res.render("/timeout")
			return
		}
		let parsedQuant = parseInt(req.body.quantity)
		if (isNaN(parsedQuant) || parsedQuant < 1 || parsedQuant > 100 || parsedQuant !== parseFloat(req.body.quantity)) {
			res.render("/timeout")
			return
		}
        const stripeUser = await stripe.customers.create()
        const session = await stripe.checkout.sessions.create( //stripe session
            {
                payment_method_types: ["card"],
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            product: process.env.TEST_PROD_ID,
                            unit_amount: parseInt(process.env.TEST_PROD_PRICE) 
                        },
                        quantity: parsedQuant
                    },
                ],
                //customer: stripeUser.Discord,
                mode: "payment",
                success_url: `${process.env.MAIN_URL}/success`,
                cancel_url: `${process.env.MAIN_URL}/cancel`,
                metadata: {id: req.body.id, amt: parsedQuant}
            }
        )
        res.json({ url: session.url })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// TODO ??
// app.get('/faq', (req, res) => {
// 	res.status(200).set('Content-Type', 'text/html')
// 	res.render('faq')
// })

app.get('/suggestions', (req, res) => {
	res.status(200).set('Content-Type', 'text/html')
	res.render('suggestions')
})

// app.get('/success', (req, res) => {
// 	res.status(200).set('Content-Type', 'text/html')
// 	res.render('success')
// })

// app.get('/cancel', (req, res) => {
// 	res.status(200).set('Content-Type', 'text/html')
// 	res.render('cancel')
// })

// app.get('/timeout', (req, res) => {
// 	res.status(200).set('Content-Type', 'text/html')
// 	res.render('timeout')
// })

app.listen(process.env.PORT || 3000, () => {
	console.log('Listening')
})