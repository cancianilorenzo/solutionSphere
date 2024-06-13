'use strict';

/* Data Access Object (DAO) module for accessing users data */

const db = require('./db');
const crypto = require('crypto');


const keyLength = 64;
const costFactor = 16384;
const blockSize = 8;
const parallelizationFactor = 1;

// This function returns user's information given its id.
exports.getUserById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE id=?';
    db.get(sql, [id], (err, row) => {
      if (err)
        reject(err);
      else if (row === undefined)
        resolve({ error: 'User not found.' });
      else {
        const user = { id: row.id, username: row.username }
        resolve(user);
      }
    });
  });
};

// This function is used at log-in time to verify username and password.
exports.getUser = (username, password) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE username=?';
    db.get(sql, [username], (err, row) => {
      if (err) {
        reject(err);
      } else if (row === undefined) {
        resolve(false);
      }
      else {
        const user = { id: row.id, username: row.username, role: row.role };

        // Check the hashes with an async call, this operation may be CPU-intensive (and we don't want to block the server)
        crypto.scrypt(password, Buffer.from(row.salt, 'hex'), keyLength, { N: costFactor, r: blockSize, p: parallelizationFactor }, function (err, hashedPassword) {
            // console.log("Salt" + Buffer.from(row.salt, 'hex'), '\n', "Hashed" + hashedPassword.toString('hex'), '\n' , "DbPassword" + row.password, '\n', "Password" + password);
          if (err) reject(err);
          if (!crypto.timingSafeEqual(Buffer.from(row.password, 'hex'), Buffer.from(hashedPassword, 'hex')))
            resolve(false);
          else
            resolve(user);
        });
      }
    });
  });
};