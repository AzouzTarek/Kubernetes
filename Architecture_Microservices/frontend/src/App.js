import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "./App.css";

function App() {
  const [books, setBooks] = useState([]);
  const [order, setOrder] = useState({ bookId: '', customerName: '', quantity: 1 });
  const [orderStatus, setOrderStatus] = useState('');
  const [statusType, setStatusType] = useState('');
  const NGINX_API = window.__RUNTIME_CONFIG__?.NGINX_API || "";

  useEffect(() => {
    axios.get(`${NGINX_API}/api/books`)
      .then(response => setBooks(response.data))
      .catch(() => {
        setStatusType('error');
        setOrderStatus('❌ Erreur lors du chargement des livres');
      });
  }, []);

  const handleOrderSubmit = (e) => {
    e.preventDefault();

    
const orderData = {
    customer_name: order.customerName,
    book_id: parseInt(order.bookId, 10),
    quantity: parseInt(order.quantity, 10),
  };


    axios.post(`${NGINX_API}/api/orders`, orderData)
      .then(() => {
        setStatusType('success');
        setOrderStatus('✔ Commande réussie 🎉');
        setOrder({ bookId: '', customerName: '', quantity: 1 });
      })
      .catch((error) => {
        setStatusType('error');
        if (error.response?.data?.error)
          setOrderStatus(error.response.data.error);
        else setOrderStatus('❌ Erreur de connexion');
      });
  };

  return (
    <div className="container">
      <h1 className="title">📚 Bookstore</h1>

      <h2 className="section-title">Livres disponibles</h2>
      <div className="books-grid">
        {books.map((book) => (
          <div key={book.id} className="book-card">
            <h3 className="book-title">{book.title}</h3>
            <p className="author">{book.author}</p>
            <p className="price">{book.price} TND</p>
            <p className="stock">{book.stock} en stock</p>
          </div>
        ))}
      </div>

      <h2 className="section-title">🛒 Passer une commande</h2>
      <form className="order-form" onSubmit={handleOrderSubmit}>
        <label>Livre</label>
        <select
          value={order.bookId}
          onChange={(e) => setOrder({ ...order, bookId: e.target.value })}
          required
        >
          <option value="">-- Sélectionnez un livre --</option>
          {books.map((book) => (
            <option key={book.id} value={book.id}>
              {book.title} — {book.price} TND
            </option>
          ))}
        </select>

        <label>Nom du client</label>
        <input
          type="text"
          value={order.customerName}
          onChange={(e) => setOrder({ ...order, customerName: e.target.value })}
          placeholder="Votre nom"
          required
        />

        <label>Quantité</label>
        <input
          type="number"
          value={order.quantity}
          min="1"
          onChange={(e) => setOrder({ ...order, quantity: e.target.value })}
          required
        />

        <button type="submit">✔ Valider la commande</button>
      </form>

      {orderStatus && (
        <p className={`status-msg ${statusType}`}>
          {orderStatus}
        </p>
      )}
    </div>
  );
}

export default App;
