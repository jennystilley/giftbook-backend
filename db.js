import pkg from 'pg'
const { Pool } = pkg
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export default {
  async getCustomer(email) {
    const res = await pool.query('SELECT * FROM customers WHERE email = $1 LIMIT 1', [email])
    return res.rows[0]
  },
  async getOrCreateCustomer(email) {
    let res = await pool.query('SELECT * FROM customers WHERE email = $1', [email])
    if (res.rowCount > 0) return res.rows[0]
    res = await pool.query('INSERT INTO customers(email) VALUES($1) RETURNING *', [email])
    return res.rows[0]
  },
  async getRecipients(customer_id) {
    const res = await pool.query('SELECT * FROM recipients WHERE customer_id = $1', [customer_id])
    return res.rows
  },
  async addRecipient(customer_id, name, address, city, dates) {
    const res = await pool.query(
      `INSERT INTO recipients (customer_id, full_name, address_line1, city) VALUES ($1, $2, $3, $4) RETURNING id`,
      [customer_id, name, address, city]
    )
    return res.rows[0].id
  }
}
