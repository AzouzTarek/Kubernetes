
const express = require('express');
const { Pool } = require('pg');
const axios = require('axios');

const app = express();

// ----------- Config Book Service (dyn via ConfigMap) -----------
const BOOK_SERVICE_URL = process.env.BOOK_SERVICE_URL || 'http://book-service:5001';

// Client Axios configuré avec baseURL + timeout
const bookClient = axios.create({
  baseURL: BOOK_SERVICE_URL,
  timeout: 5000, // éviter les attentes infinies
});

// (Optionnel) Interceptor pour logs simples
bookClient.interceptors.response.use(
  (resp) => resp,
  (err) => {
    console.error('[bookClient] error:', err?.message || err);
    return Promise.reject(err);
  }
);

// ----------- PostgreSQL -----------
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DB_NAME,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT || 5432,
  ssl: process.env.PG_SSLMODE === 'require',
});

app.use(express.json());

// ----------- Endpoint: créer une commande -----------
app.post('/api/orders', async (req, res) => {
  const { customer_name, book_id, quantity } = req.body;

  if (!customer_name || !book_id || !quantity) {
    return res.status(400).json({ error: 'Missing fields: customer_name, book_id, quantity' });
  }

  try {
    // 1) Récupérer le livre depuis Book Service
    const bookResponse = await bookClient.get(`/api/books/${book_id}`);
    const book = bookResponse.data;

    // 2) Vérifier le stock
    if (Number(book.stock) < Number(quantity)) {
      return res.status(400).json({ error: 'Not enough stock' });
    }

    // 3) Réserver le livre
    const reserveResponse = await bookClient.post(`/api/books/${book_id}/reserve`);
    if (reserveResponse.status !== 200) {
      return res.status(500).json({ error: 'Failed to reserve book' });
    }

    // 4) Calculer le prix total
    const total_price = parseFloat(book.price) * Number(quantity);

    // 5) Insérer la commande dans la base
    await pool.query(
      'INSERT INTO orders (customer_name, book_id, book_title, quantity, total_price) VALUES ($1, $2, $3, $4, $5)',
      [customer_name, book_id, book.title, quantity, total_price]
    );

    res.status(201).json({ message: 'Order placed successfully' });
  } catch (err) {
    console.error('Error processing order:', err?.message || err);
    console.error('BOOK_SERVICE_URL =', BOOK_SERVICE_URL);
    res.status(500).send('Internal Server Error');
  }
});

// ----------- Healthcheck -----------
app.get('/healthz', (req, res) => res.status(200).send('ok'));

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Order Service listening on port ${PORT}`);
  console.log(`Using BOOK_SERVICE_URL: ${BOOK_SERVICE_URL}`);
});
