const API_BASE = process.env.REACT_APP_API_BASE;

export async function fetchBooks() {
  const response = await fetch(API_BASE);
  if (!response.ok) throw new Error('Failed to fetch books');
  return response.json();
}

export async function addBook(book) {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(book),
  });
  if (!response.ok) throw new Error('Failed to add book');
  return response.json();
}
