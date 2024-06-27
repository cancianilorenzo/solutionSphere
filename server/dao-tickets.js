"use strict";

const dayjs = require("dayjs");
const db = require("./db");

exports.listTickets = () => {
  return new Promise((resolve, reject) => {

    const sql = `
    SELECT tickets.*, users.username AS owner_username 
    FROM tickets 
    INNER JOIN users ON tickets.owner = users.id
  `;
    db.all(sql, (err, rows) => {
      if (err) {
        reject(err);
      }
      const tickets = rows.map((e) => {
        return e;
      });
      resolve(tickets);
    });
  });
};

// exports.listBlocksByTicket = (id) => {
//   return new Promise((resolve, reject) => {
//     const sql = "SELECT * FROM blocks WHERE ticket = ?";
//     db.all(sql, [id], (err, rows) => {
//       if (err) {
//         reject(err);
//       }
//       if(rows.length === 0){
//         reject("No blocks found for that ticket");
//       }
//       const blocks = rows.map((e) => {
//         return e;
//       });
//       resolve(blocks);
//     });
//   });
// };

exports.listBlocks = () => {
  return new Promise((resolve, reject) => {
    const sql = `
    SELECT blocks.*, users.username AS author_username 
    FROM blocks 
    INNER JOIN users ON blocks.author = users.id
  `;
    db.all(sql, (err, rows) => {
      if (err) {
        return reject(err);
      }
      const blocks = rows.map((e) => {
        return e;
      });
      resolve(blocks);
    });
  });
};

exports.createTicket = (ticket) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("BEGIN TRANSACTION", (err) => {
        if (err) {
          reject("Failed to start transaction", err.message);
        }
        ticket.timestamp = dayjs().format("YYYY-MM-DD HH:mm:ss");
        ticket.state = "open";
        const { owner, state, title, timestamp, category } = ticket;

        const sqlTicket =
          "INSERT INTO tickets (owner, state, title, timestamp, category) VALUES (?, ?, ?, ?, ?)";
        db.run(
          sqlTicket,
          [owner, state, title, timestamp, category],
          function (err) {
            if (err) {
              db.run("ROLLBACK", (rollbackErr) => {
                if (rollbackErr) {
                  return reject("Failed to rollback transaction", rollbackErr.message);
                }
              });
              return reject("Failed to insert into tickets");
            }
            ticket.id = this.lastID;
            const { id, owner, timestamp, text } = ticket;
            const sqlBlock =
              "INSERT INTO blocks (ticket, author, timestamp, text) VALUES (?, ?, ?, ?)";
            db.run(sqlBlock, [id, owner, timestamp, text], function (err) {
              if (err) {
                db.run("ROLLBACK", (rollbackErr) => {
                  if (rollbackErr) {
                    return reject(
                      "Failed to rollback transaction",
                      rollbackErr.message
                    );
                  }
                });
                return reject("Failed to insert into blocks", err.message);
              }

              db.run("COMMIT", (commitErr) => {
                if (commitErr) {
                  return reject("Failed to commit transaction", commitErr.message);
                } else {
                  return resolve("Transaction committed successfully.");
                }
              });
            });
          }
        );
      });
    });
  });
};

//TODO add control for user existance
exports.createBlock = (block) => {
  return new Promise((resolve, reject) => {
    block.timestamp = dayjs().format("YYYY-MM-DD HH:mm:ss");
    const { ticketId, author, timestamp, text } = block;
    //Check if ticket with that id exist
    const sqlCheck = "SELECT * FROM tickets WHERE id = ?";
    db.get(sqlCheck, [ticketId], (err, row) => {
      if (err) {
        return reject(err);
      }
      if (!row) {
        return reject("Ticket with that id does not exist");
      }
    });
    const sql =
      "INSERT INTO blocks (ticket, author, timestamp, text) VALUES (?, ?, ?, ?)";
    db.run(sql, [ticketId, author, timestamp, text], function (err, row) {
      if (err) {
        reject(err);
      }
      resolve("Ticket block created successfully");
    });
  });
};

//edit ticket
exports.patchTicket = async (ticket) => {
  return new Promise((resolve, reject) => {
    const sql = "UPDATE tickets SET category = ?, state = ? WHERE id = ?";
    db.run(sql, [ticket.category, ticket.state, ticket.id], function (err) {
      if (err) {
        reject(err);
      }
      resolve("Ticket updated");
    });
  });
};

exports.getTicketById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM tickets WHERE id = ?";
    db.get(sql, [id], (err, row) => {
      if (err) {
        reject(err);
      }
      if (!row) {
        reject("Ticket with that id does not exist");
      }
      resolve(row);
    });
  });
};
