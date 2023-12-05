const express = require('express');
const books = require('./booksdb.js');
const users = require('./auth_users.js').users;
const hasUsernamePassword = require('./auth_users.js').hasUsernamePassword;
const public_users = express.Router();

public_users.post('/register', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Verify username & password are provided, if not, send error
  if (!hasUsernamePassword(username, password)) {
    return res
      .status(400)
      .json({ message: 'Error: username and password are required' });
  }

  // Ensure this is a new username, if not, send error
  if (users.filter((u) => u.username === username).length !== 0) {
    return res.status(400).json({
      message: `Error: username: ${username} has already been registered`,
    });
  }

  // Add username to users
  users.push({ username: username, password: password });

  // Send success
  return res
    .status(200)
    .json({ message: `Username: ${username} successfully registered` });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(books);
    }, 2000);
  });

  promise.then((results) => {
    res.status(200).send(JSON.stringify({ results }, null, 4));
  });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      const filtered = books.filter((b) => b.isbn === isbn);
      resolve(filtered);
    }, 2000);
  });

  promise.then((results) => {
    return res.status(200).send(JSON.stringify({ results }, null, 4));
  });
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;

  const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      const filtered = books.filter((b) => b.author === author);
      resolve(filtered);
    }, 2000);
  });

  promise.then((results) => {
    return res.status(200).send(JSON.stringify({ results }, null, 4));
  });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;

  const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      const filtered = books.filter((b) => b.title === title);
      resolve(filtered);
    }, 2000);
  });

  promise.then((results) => {
    return res.status(200).send(JSON.stringify({ results }, null, 4));
  });
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const filtered = books.filter((b) => b.isbn == isbn);
  const reviews = filtered[0].reviews;
  return res.status(200).send(JSON.stringify({ reviews }, null, 4));
});

module.exports.general = public_users;
