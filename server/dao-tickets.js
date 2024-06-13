"use strict";

const dayjs = require("dayjs");
const db = require("./db");

exports.listTickets = () => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM tickets";
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

exports.listBlocksByTicket = (id) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM blocks WHERE ticket = ?";
    db.all(sql, [id], (err, rows) => {
      if (err) {
        reject(err);
      }
      const blocks = rows.map((e) => {
        return e;
      });
      resolve(blocks);
    });
  });
};


//TODO add control for user existance
exports.createTicket = (ticket) => {
  return new Promise((resolve, reject) => {
    console.log(ticket);

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
              console.error("Failed to insert into tickets", err.message);
              db.run("ROLLBACK", (rollbackErr) => {
                if (rollbackErr) {
                  reject("Failed to rollback transaction", rollbackErr.message);
                }
              });
            }
            console.log(`Inserted into tickets with ID: ${this.lastID}`);
            ticket.id = this.lastID;
            const { id, owner, timestamp, text } = ticket;
            const sqlBlock =
              "INSERT INTO blocks (ticket, author, timestamp, text) VALUES (?, ?, ?, ?)";
            db.run(sqlBlock, [id, owner, timestamp, text], function (err) {
              if (err) {
                reject("Failed to insert into blocks", err.message);
                db.run("ROLLBACK", (rollbackErr) => {
                  if (rollbackErr) {
                    reject(
                      "Failed to rollback transaction",
                      rollbackErr.message
                    );
                  }
                });
              }
              console.log(`Inserted into blocks with ID: ${this.lastID}`);

              db.run("COMMIT", (commitErr) => {
                if (commitErr) {
                  reject("Failed to commit transaction", commitErr.message);
                } else {
                  resolve("Transaction committed successfully.");
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
        reject(err);
      }
      if (!row) {
        reject("Ticket with that id does not exist");
      }
    });
    const sql =
      "INSERT INTO blocks (ticket, author, timestamp, text) VALUES (?, ?, ?, ?)";
    db.run(sql, [ticketId, author, timestamp, text], function (err, row) {
      if (err) {
        reject(err);
      }
      resolve(row);
    });
  });
};

exports.setTicketClosed = (ticket) => {
  const { id } = ticket;
  return new Promise((resolve, reject) => {
    //Check if ticket with that id exist
    const sqlCheck = "SELECT * FROM tickets WHERE id = ?";
    db.get(sqlCheck, [id], (err, row) => {
      if (err) {
        reject(err);
      }
      if (!row) {
        reject("Ticket with that id does not exist");
      }
    });
    const sql = "UPDATE tickets SET state = ? WHERE id = ?";
    db.run(sql, ["close", id], function (err) {
      if (err) {
        reject(err);
      }
      resolve("Ticket updated");
    });
  });
};

exports.setTicketOpened = (ticket) => {
  const { id } = ticket;
  return new Promise((resolve, reject) => {
    //Check if ticket with that id exist
    const sqlCheck = "SELECT * FROM tickets WHERE id = ?";
    db.get(sqlCheck, [id], (err, row) => {
      if (err) {
        reject(err);
      }
      if (!row) {
        reject("Ticket with that id does not exist");
      }
    });
    const sql = "UPDATE tickets SET state = ? WHERE id = ?";
    db.run(sql, ["open", id], function (err) {
      if (err) {
        reject(err);
      }
      resolve("Ticket updated");
    });
  });
};

exports.patchTicketCategory = (ticket) => {
  const { category, id } = ticket;
  //Check if ticket with that id exist
  const sqlCheck = "SELECT * FROM tickets WHERE id = ?";
  db.get(sqlCheck, [id], (err, row) => {
    if (err) {
      reject(err);
    }
    if (!row) {
      reject("Ticket with that id does not exist");
    }
  });
  return new Promise((resolve, reject) => {
    const sql = "UPDATE tickets SET category = ? WHERE id = ?";
    db.run(sql, [category, id], function (err) {
      if (err) {
        reject(err);
      }
      resolve("Category changed");
    });
  });
};
