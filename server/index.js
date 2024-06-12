"use strict";

const express = require("express");
const morgan = require("morgan");

const ticketDao = require("./dao-tickets");
const app = new express();
const port = 3001;

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded());

app.get("/api/tickets", (req, res) => {
  ticketDao
    .listTickets()
    .then((tickets) => res.json(tickets))
    .catch((err) => res.status(500).json(err));
});

app.get("/api/blocks", (req, res) => {
  const { id } = req.body;
  ticketDao
    .listBlocksByTicket(id)
    .then((blocks) => res.json(blocks))
    .catch((err) => res.status(500).json(err));
});

app.post("/api/tickets", (req, res) => {
  ticketDao
    .createTicket(req.body)
    .then((response) => res.json(response))
    .catch((err) => res.status(500).json(err));
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
