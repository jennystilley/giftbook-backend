import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import db from './db.js'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()
const app = express()
app.use(cors({
  origin: 'https://shoppressie.com'  // <-- your actual domain
}))
app.use(express.json())
const __dirname = path.dirname(fileURLToPath(import.meta.url))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.get('/giftbook', async (req, res) => {
  const email = req.query.customer_email
  const user = await db.getCustomer(email)
  const recipients = await db.getRecipients(user.id)
  res.render('giftbook', { user, recipients })
})

app.post('/api/recipients', async (req, res) => {
  const { email, name, address, city, dates } = req.body
  const user = await db.getOrCreateCustomer(email)
  const id = await db.addRecipient(user.id, name, address, city, dates)
  res.json({ success: true, id })
})

app.listen(process.env.PORT || 3000, () => {
  console.log('Server running')
})
