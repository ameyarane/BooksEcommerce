import React, { useState } from 'react';
import BookList from './components/BookList';
import AddBookForm from './components/AddBookForm';

function App() {
  const [refresh, setRefresh] = useState(false);

  const handleBookAdded = () => {
    setRefresh(!refresh);
  };

  return (
    <div className="App">
      <h1>BooksEcommerce Store</h1>
      <AddBookForm onBookAdded={handleBookAdded} />
      {/* Use refresh as key to re-mount BookList on book addition */}
      <BookList key={refresh.toString()} />
    </div>
  );
}

export default App;
