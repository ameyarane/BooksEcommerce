import React, { useState } from 'react';
import { addBook } from '../services/bookService';
import './AddBookForm.css'; // Be sure to create this CSS file!

export default function AddBookForm({ onBookAdded }) {
  const [form, setForm] = useState({ title: '', author: '', price: '' });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await addBook({ title: form.title, author: form.author, price: parseFloat(form.price) });
    setForm({ title: '', author: '', price: '' });
    if (onBookAdded) onBookAdded();
  }

  return (
    <form className="add-book-form" onSubmit={handleSubmit}>
      <h2>Add New Book</h2>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input name="title" id="title" value={form.title} onChange={handleChange} placeholder="Book Title" required />
        </div>
        <div className="form-group">
          <label htmlFor="author">Author</label>
          <input name="author" id="author" value={form.author} onChange={handleChange} placeholder="Author Name" required />
        </div>
        <div className="form-group">
          <label htmlFor="price">Price</label>
          <input name="price" id="price" value={form.price} type="number" step="0.01" onChange={handleChange} placeholder="Price" required />
        </div>
        <button type="submit" className="add-btn">Add Book</button>
      </div>
    </form>
  );
}
