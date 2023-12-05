const express = require('express');
const jwt = require('jsonwebtoken');
let books = require('./booksdb.js');
const regd_users = express.Router();

let users = [
  { username: 'bradd', password: 'bradd' },
  { username: 'jamesd', password: 'jamesd' },
];

// Verify username and password are present
const hasUsernamePassword = (username, password) => {
  return username && password;
};

// Validate credentials
const authenticatedUser = (username, password) => {
  return users.filter((u) => u.username === username && u.password === password)
    .length;
};

// Only registered users can login
regd_users.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (hasUsernamePassword(username, password)) {
    if (authenticatedUser(username, password)) {
      const accessToken = jwt.sign(
        {
          data: username,
        },
        'access',
        { expiresIn: 60 * 60 }
      );

      req.session.authorization = {
        accessToken,
      };

      return res
        .status(200)
        .send({ message: `User: ${username} successfully logged in` });
    } else {
      return res.status(400).send({ message: 'Invalid login credentials' });
    }
  } else {
    return res
      .status(400)
      .json({ message: 'Error: username and password are required' });
  }
});

// Add or update a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const newReview = req.body.review;

  if (req.session.authorization) {
    const token = req.session.authorization['accessToken'];

    jwt.verify(token, 'access', (err, user) => {
      if (!err) {
        let isbnReviews = books.filter((b) => b.isbn === isbn)[0].reviews;

        const objIdx = isbnReviews.findIndex(
          (obj) => obj.username === user.data
        );

        if (objIdx > -1) {
          isbnReviews[objIdx].review = newReview;
          res.status(200).json({ message: 'User review updated' });
        } else {
          isbnReviews.push({ username: user.data, review: newReview });
          res.status(200).json({ message: 'User review added' });
        }
      } else {
        return res.status(403).json({ message: 'User not authenticated' });
      }
    });
  } else {
    return res.status(403).json({ message: 'User not logged in' });
  }
});

// Delete a book review
regd_users.delete('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;

  if (req.session.authorization) {
    const token = req.session.authorization['accessToken'];

    jwt.verify(token, 'access', (err, user) => {
      if (!err) {
        const objIdx = books
          .filter((b) => b.isbn === isbn)[0]
          .reviews.findIndex((obj) => obj.username === user.data);

        if (objIdx > -1) {
          books.filter((b) => b.isbn === isbn)[0].reviews.splice(objIdx, 1);
          return res.status(200).json({ message: 'User review deleted' });
        } else {
          return res.status(400).json({ message: 'User review not found' });
        }
      } else {
        return res.status(403).json({ message: 'User not authenticated' });
      }
    });
  } else {
    return res.status(403).json({ message: 'User not logged in' });
  }
});

module.exports.authenticated = regd_users;
module.exports.hasUsernamePassword = hasUsernamePassword;
module.exports.users = users;
