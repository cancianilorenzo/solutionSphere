"use strict";

const dayjs = require("dayjs");
const db = require("./db");

const convertTicketFromDbRecord = (dbRecord) => {
  const ticket = {};
  ticket.id = dbRecord.id;
  ticket.owner = dbRecord.owner;
  ticket.state = dbRecord.state;
  ticket.category = dbRecord.category;
  ticket.timestamp = dbRecord.timestamp;
  return ticket;
};

//Removes block.id, is not useful for our goal (in ticket is necessary to obtain blocks list)
const convertBlockFromDbRecord = (dbRecord) => {
  const block = {};
  block.author = dbRecord.author;
  block.ticketId = dbRecord.timestamp;
  return block;
};

exports.listTickets = () => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM tickets";
    db.all(sql, (err, rows) => {
      if (err) {
        reject(err);
      }
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
    const sql = "SELECT * FROM blocks WHERE ticket = ?";
    db.all(sql, [id], (err, rows) => {
      if (err) {
        reject(err);
      }
      const blocks = rows.map((e) => {
        const block = convertBlockFromDbRecord(e);
        return block;
      });
      resolve(blocks);
    });
  });
};

exports.createTicket = (ticket) => {
  return new Promise((resolve, reject) => {
    console.log(ticket);
    const {owner, title, text, category} = ticket;
    if( !!owner && !!title && !!text && !!category){

    db.serialize(() => {
      db.run("BEGIN TRANSACTION", (err) => {
        if (err) {
          reject("Failed to start transaction", err.message);
        }
        ticket.timestamp = dayjs().format("YYYY-MM-DD HH:mm:ss");
        ticket.state = "open";

        const sqlTicket =
          "INSERT INTO tickets (owner, state, title, timestamp, category) VALUES (?, ?, ?, ?, ?)";
        db.run(
          sqlTicket,
          [
            ticket.owner,
            ticket.state,
            ticket.title,
            ticket.timestamp,
            ticket.category
          ],
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

            const sqlBlock =
              "INSERT INTO blocks (ticket, author, timestamp, text) VALUES (?, ?, ?, ?)";
            db.run(
              sqlBlock,
              [ticket.id, ticket.author, ticket.timestamp, ticket.text],
              function (err) {
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
                    reject(
                      "Failed to commit transaction",
                      commitErr.message
                    );
                  } else {
                    resolve("Transaction committed successfully.");
                  }
                });
              }
            );
          }
        );
      });
    });
    }
    else{
      reject("Missing required fields");
    }
  });
};

exports.createBlock = (block, ticketId, userId) => {
  return new Promise((resolve, reject) => {
    const sql =
      "INSERT INTO blocks (ticket, author, timestamp, text) VALUES (?, ?, ?, ?)";
    block.ticket = ticketId;
    block.author = userId;
    block.timestamp = dayjs().format("YYYY-MM-DD HH:mm:ss");
    db.run(
      sql,
      [block.ticket, block.author, block.timestamp, block.text],
      function (err, row) {
        if (err) {
          reject(err);
        }
        resolve(row);
      }
    );
  });
};

exports.setTicketClosed = (ticket) => {
  return new Promise((resolve, reject) => {
    const sql = "UPDATE tickets SET state = ? WHERE id = ?";
    db.run(sql, ["close", ticket.id], function (err) {
      if (err) {
        reject(err);
      }
      resolve("Ticket updated");
    });
  });
};

exports.setTicketOpened = (ticket) => {
  return new Promise((resolve, reject) => {
    const sql = "UPDATE tickets SET state = ? WHERE id = ?";
    db.run(sql, ["open", ticket.id], function (err) {
      if (err) {
        reject(err);
      }
      resolve("Ticket updated");
    });
  });
};

exports.patchTicketCategory = (ticket, category) => {
  return new Promise((resolve, reject) => {
    const sql = "UPDATE tickets SET category = ? WHERE id = ?";
    db.run(sql, [category, ticket.id], function (err) {
      if (err) {
        reject(err);
      }
      resolve("Category changed");
    });
  });
};
