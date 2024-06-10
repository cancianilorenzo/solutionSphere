'use strict';

const dayjs = require('dayjs');
const db = require('./db');

const convertTicketFromDbRecord = (dbRecord) => {
    const ticket = {};
    ticket.id = dbRecord.id;
    ticket.owner = dbRecord.owner;
    ticket.state = dbRecord.state;
    ticket.category = dbRecord.category;
    ticket.timestamp = dbRecord.timestamp;
    ticket.text = dbRecord.text;
    return ticket;
  }

  //Removes block.id, is not useful for our goal (in ticket is necessary to obtain blocks list)
  const convertBlockFromDbRecord = (dbRecord) => {
    const block = {};
    block.author = dbRecord.author;
    block.text = dbRecord.text;
    block.ticketId = dbRecord.timestamp;
    block.text = dbRecord.text;
    return block;
  }


exports.listTickets = () => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM tickets';
      db.all(sql, (err, rows) => {
        if (err) { reject(err); }
        const tickets = rows.map((e) => {
          const ticket = convertTicketFromDbRecord(e);
          return ticket;
        });
        resolve(tickets);
      });
    });
  };

  exports.listBlocksByTicket = (id) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM blocks WHERE ticket = ?';
      db.all(sql, [id], (err, rows) => {
        if (err) { reject(err); }
        const blocks = rows.map((e) => {
          const block = convertBlockFromDbRecord(e);
          return block;
        });
        resolve(blocks);
      });
    });
  };

  exports.createTicket = (ticket, userId) => {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO tickets (owner, state, title, timestamp, text, category) VALUES(?, ?, ?, ?, ?, ?)';
      ticket.timestamp = dayjs().format('YYYY-MM-DD HH:mm:ss');
      ticket.state = 'open';
      ticket.owner = userId;
      db.run(sql, [ticket.owner, ticket.state, ticket.title, ticket.timestamp, ticket.text, ticket.category], function (err) {
        if (err) {
          reject(err);
        }
        resolve(this);
      });
    });
  };

  exports.createBlock = (block, ticketId, userId) => {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO blocks (ticket, author, timestamp, text) VALUES (?, ?, ?, ?)';
      block.ticket = ticketId;
      block.author = userId;
      block.timestamp = dayjs().format('YYYY-MM-DD HH:mm:ss');
      db.run(sql, [block.ticket, block.author, block.timestamp, block.text], function (err, row) {
        if (err) {
          reject(err);
        }
        resolve(row);
      });
    });
  };

  exports.setTicketClosed = (ticket) => {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE tickets SET state = ? WHERE id = ?';
      db.run(sql, ['close', ticket.id], function (err) {
        if (err) {
          reject(err);
        }
        resolve('Ticket updated');
      });
    });
  };

  exports.setTicketOpened = (ticket) => {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE tickets SET state = ? WHERE id = ?';
      db.run(sql, ['open', ticket.id], function (err) {
        if (err) {
          reject(err);
        }
        resolve('Ticket updated');
      });
    });
  };