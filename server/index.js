"use strict";

/*
Constrains:
-> Ticket:
  -owner: int
  -title: string
  -category: string PRECISE LIST
-> Block:
  -id: int NOT NULL
  -text: string NOT NULL

*/

const express = require("express");
const morgan = require("morgan");
const { body, query, validationResult } = require("express-validator"); // validation middleware

const ticketDao = require("./dao-tickets");
const app = new express();
const port = 3001;

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded());

const validCategories = [
  "inquiry",
  "maintenance",
  "new feature",
  "administrative",
  "payment",
];

app.get("/api/tickets", (req, res) => {
  ticketDao
    .listTickets()
    .then((tickets) => res.json(tickets))
    .catch((err) => res.status(500).json(err));
});

app.get(
  "/api/blocks",
  [
    query("id")
      .not()
      .isEmpty()
      .withMessage("Id should not be empty")
      .isInt()
      .withMessage("Id should be an integer"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.query;
    ticketDao
      .listBlocksByTicket(id)
      .then((blocks) => res.json(blocks))
      .catch((err) => res.status(500).json(err));
  }
);

app.post(
  "/api/tickets",
  [
    body("owner")
      .not()
      .isEmpty()
      .withMessage("Owner should not be empty")
      .isInt()
      .withMessage("Owner should be an integer"),
    body("title")
      .not()
      .isEmpty()
      .withMessage("Title should not be empty")
      .isString()
      .withMessage("Title should be a string"),
    body("category")
      .isIn(validCategories)
      .withMessage(
        `Category must be one of the following: ${validCategories.join(", ")}`
      ),
    body("text")
      .not()
      .isEmpty()
      .withMessage("Text should not be empty")
      .isString()
      .withMessage("Text should be a string"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const ticket = req.body;
    ticketDao
      .createTicket(ticket)
      .then((response) => res.json(response))
      .catch((err) => res.status(500).json(err));
  }
);

app.post(
  "/api/blocks",
  [
    body("author")
      .not()
      .isEmpty()
      .withMessage("Author should not be empty")
      .isInt()
      .withMessage("Author should be an integer"),
    body("text")
      .not()
      .isEmpty()
      .withMessage("Text should not be empty")
      .isString()
      .withMessage("Text should be a string"),
    body("ticketId")
      .not()
      .isEmpty()
      .withMessage("Id should not be empty")
      .isInt()
      .withMessage("Id should be an integer"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const block = req.body;
    ticketDao
      .createBlock(block)
      .then((response) => res.json(response))
      .catch((err) => res.status(500).json(err));
  }
);

app.put(
  "/api/categoryTicket",
  [
    body("id")
      .not()
      .isEmpty()
      .withMessage("Id should not be empty")
      .isInt()
      .withMessage("Id should be an integer"),
    body("category")
      .isIn(validCategories)
      .withMessage(
        `Category must be one of the following: ${validCategories.join(", ")}`
      ),
  ],
  (req, res) => {
    //Better to use patch??
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const ticket = req.body;
    ticketDao
      .patchTicketCategory(ticket)
      .then((response) => res.json(response))
      .catch((err) => res.status(500).json(err));
  }
);

app.put(
  "/api/openTicket",
  [
    body("id")
      .not()
      .isEmpty()
      .withMessage("Id should not be empty")
      .isInt()
      .withMessage("Id should be an integer"),
  ],
  (req, res) => {
    //Better to use patch??
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const ticket = req.body;
    ticketDao
      .setTicketOpened(ticket)
      .then((response) => res.json(response))
      .catch((err) => res.status(500).json(err));
  }
);

app.put(
  "/api/closeTicket",
  [
    body("id")
      .not()
      .isEmpty()
      .withMessage("Id should not be empty")
      .isInt()
      .withMessage("Id should be an integer"),
  ],
  (req, res) => {
    //Better to use patch??
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const ticket = req.body;
    ticketDao
      .setTicketClosed(ticket)
      .then((response) => res.json(response))
      .catch((err) => res.status(500).json(err));
  }
);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
