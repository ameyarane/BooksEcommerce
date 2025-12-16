import React, { useEffect, useState } from 'react';
import { fetchBooks } from '../services/bookService';

export default function BookList() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks().then(data => {
      setBooks(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading books...</div>;

  return (
    <div>
      <div className="books-catalog-title">Books Catalog</div>
      <table className="books-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {books.map(book => (
            <tr key={book.id}>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{book.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
