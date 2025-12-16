import React, { useState } from 'react';
import BookList from './components/BookList';
import AddBookForm from './components/AddBookForm';
import './App.css';

function App() {
  const [refresh, setRefresh] = useState(false);

  function handleBookAdded() {
    setRefresh(!refresh); // Toggle to refresh BookList
  }

  return (
    <div className="App">
      <h1>BooksEcommerce Store</h1>
      <AddBookForm onBookAdded={handleBookAdded} />
      <BookList key={refresh} />
    </div>
  );
}

export default App;
