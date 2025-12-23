const API_BASE = 'http://a6c0460e27f1e40389b810fc80e27d59-1379318519.eu-west-1.elb.amazonaws.com/api/books'; // Change to your API address if needed

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
