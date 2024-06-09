'use strict';

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