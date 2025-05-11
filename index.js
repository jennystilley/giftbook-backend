import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import db from './db.js'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const app = express()

// ✅ Enable CORS for your Shopify storefront
app.use(cors({
  origin: 'https://shoppressie.com'  // <-- Replace with your real domain if needed
}))

app.use(express.json())

const __dirname = path.dirname(fileURLToPath(import.meta.url))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// 🧠 Load customer data + render giftbook
app.get('/giftbook', async (req, res) => {
  try {
    const email = req.query.customer_email
    if (!email) return res.status(400).send('Missing customer_email')

    const user = await db.getOrCreateCustomer(email)
    const recipients = await db.getRecipients(user.id)

    res.render('giftbook', { user, recipients })
  } catch (err) {
    console.error('Error rendering giftbook:', err)
    res.status(500).send('Something went wrong.')
  }
})

// ✏️ Add new recipient (POST)
app.post('/api/recipients', async (req, res) => {
  try {
    const { email, name, address, city } = req.body
    if (!email || !name) return res.status(400).send('Missing required fields')

    const user = await db.getOrCreateCustomer(email)
    const id = await db.addRecipient(user.id, name, address, city)

    res.json({ success: true, id })
  } catch (err) {
    console.error('Error adding recipient:', err)
    res.status(500).send('Could not save recipient.')
  }
})

app.listen(process.env.PORT || 3000, () => {
  console.log('✅ Server running')
})
