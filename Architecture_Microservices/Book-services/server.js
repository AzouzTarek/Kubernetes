const express = require('express');
const { Client } = require('pg'); // Utilisation de Client pour une connexion directe
const app = express();


// Connexion à PostgreSQL en utilisant les variables d'environnement
const client = new Client({
  user: process.env.PG_USER, // Utilisation de la variable d'environnement pour l'utilisateur PostgreSQL
  host: process.env.PG_HOST, // Utilisation de la variable d'environnement pour l'hôte PostgreSQL
  database: process.env.PG_DB_NAME, // Utilisation de la variable d'environnement pour le nom de la base de données
  password: process.env.PG_PASSWORD, // Utilisation de la variable d'environnement pour le mot de passe
  port: process.env.PG_PORT || 5432, // Utilisation de la variable d'environnement pour le port, ou 5432 par défaut
  ssl: process.env.PG_SSLMODE === 'require' // Utilisation de la variable d'environnement pour le mode SSL
});

client.connect(); // Connexion directe à PostgreSQL




// Récupérer la liste des livres
app.get('/api/books', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM books');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching books:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Réserver un livre (réduire le stock)
app.post('/api/books/:id/reserve', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('UPDATE books SET stock = stock - 1 WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found or already reserved' });
    }
    res.status(200).json({ message: 'Book reserved successfully' });
  } catch (err) {
    console.error('Error reserving book:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Récupérer un livre par ID (vérification de la disponibilité)
app.get('/api/books/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('SELECT * FROM books WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching book by ID:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(5001, () => {
  console.log('Book Service listening on port 5001');
});
