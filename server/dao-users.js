'use strict';


const db = require('./db');
const crypto = require('crypto');


const keyLength = 64;
const costFactor = 16384;
const blockSize = 8;
const parallelizationFactor = 1;

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

        crypto.scrypt(password, Buffer.from(row.salt, 'hex'), keyLength, { N: costFactor, r: blockSize, p: parallelizationFactor }, function (err, hashedPassword) {
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