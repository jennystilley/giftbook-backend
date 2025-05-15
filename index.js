import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import db from './db.js'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const app = express()

// Enable CORS for Shopify
app.use(cors({
  origin: 'https://shoppressie.com'
}))

app.use(express.json())

const __dirname = path.dirname(fileURLToPath(import.meta.url))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// GET /giftbook → Render page with saved recipients
app.get('/giftbook', async (req, res) => {
  try {
    const email = req.query.customer_email
    if (!email) return res.status(400).send('Missing customer_email')

    const user = await db.getOrCreateCustomer(email)
    const recipients = await db.getRecipients(user.id)

res.json({ recipients })  } catch (err) {
    console.error('Error rendering giftbook:', err)
    res.status(500).send('Something went wrong.')
  }
})

// POST /giftbook → Add new recipient
app.post('/giftbook', async (req, res) => {
  const {
    email,
    first_name,
    last_name,
    address_line1,
    city,
    state,
    zip_code,
    occasion,
    important_date,
    notes
  } = req.body

  if (!email || !first_name || !last_name || !address_line1) {
    return res.status(400).send('Missing required fields')
  }

  try {
    const user = await db.getOrCreateCustomer(email)

    await db.addRecipient(
  user.id,
  first_name,
  last_name,
  address_line1,
  city,
  state,
  zip_code,
  occasion,
  important_date,
  notes
) // You can extend `addRecipient` to accept all fields if needed

    res.status(201).send('Recipient saved')
  } catch (err) {
    console.error('Error saving recipient:', err)
    res.status(500).send('Error saving recipient')
  }
})

app.listen(process.env.PORT || 3000, () => {
  console.log('✅ Server running')
})
