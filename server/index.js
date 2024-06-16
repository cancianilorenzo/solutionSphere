"use strict";

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

//Tickets
const { body, query, validationResult } = require("express-validator");
const ticketDao = require("./dao-tickets");

//AuthN
const passport = require("passport");
const LocalStrategy = require("passport-local");
const userDao = require("./dao-users");

//Server
const app = new express();
const port = 3001;

//Cors options
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions));

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded());

passport.use(
  new LocalStrategy(async function verify(username, password, callback) {
    const user = await userDao.getUser(username, password);
    if (!user) return callback(null, false, "Wrong username or password");

    return callback(null, user);
  })
);

passport.serializeUser(function (user, callback) {
  callback(null, user);
});

passport.deserializeUser(function (user, callback) {
  return callback(null, user);
});

const session = require("express-session");

app.use(
  session({
    secret: "Mamma, anche quest'anno niente vacanze", //TODO
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: app.get("env") === "production" ? true : false,
    },
  })
);

app.use(passport.authenticate("session"));

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: "Not authenticated" });
};

const validCategories = [
  "inquiry",
  "maintenance",
  "new feature",
  "administrative",
  "payment",
];

const validStates = ["open", "closed"];

app.get("/api/tickets", (req, res) => {
  ticketDao
    .listTickets()
    .then((tickets) => res.json(tickets))
    .catch((err) => res.status(500).json(err));
});

app.get("/api/blocks", [isLoggedIn], (req, res) => {
  ticketDao
    .listBlocks()
    .then((blocks) => res.json(blocks))
    .catch((err) => res.status(500).json(err));
});

app.post(
  "/api/tickets",
  [
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
    isLoggedIn,
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const ticket = req.body;
    ticket.owner = req.user.id;
    if (!userDao.getUserById(ticket.owner)) {
      return res.status(400).json({ error: "User does not exist" });
    }
    ticketDao
      .createTicket(ticket)
      .then((response) => res.json(response))
      .catch((err) => res.status(500).json(err));
  }
);

app.post(
  "/api/blocks",
  [
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
    isLoggedIn,
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const block = req.body;
    block.author = req.user.id;
    if (!userDao.getUserById(block.author)) {
      return res.status(400).json({ error: "User does not exist" });
    }
    if (!ticketDao.getTicketById(block.ticketId)) {
      return res.status(400).json({ error: "Ticket does not exist" });
    }
    ticketDao
      .createBlock(block)
      .then((response) => res.json(response))
      .catch((err) => res.status(500).json(err));
  }
);

app.patch(
  "/api/ticket",
  [
    body("id")
      .not()
      .isEmpty()
      .withMessage("Id should not be empty")
      .isInt()
      .withMessage("Id should be an integer"),
    body("category")
      .optional()
      .isIn(validCategories)
      .withMessage(
        `Category must be one of the following: ${validCategories.join(", ")}`
      ),
    body("state")
      .optional()
      .isIn(validStates)
      .withMessage(
        `State must be one of the following: ${validStates.join(", ")}`
      ),
    isLoggedIn,
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const oldTicket = await ticketDao.getTicketById(req.body.id);
    if (!oldTicket) {
      return res.status(400).json({ error: "Ticket does not exist" });
    }
    if (req.user.role !== "admin" && (req.body.category!== oldTicket.category)) {
      return res.status(403).json({ error: "Not authorized to change category" });
    }
    if (req.user.role !== "admin" && req.body.state === "open") {
      return res.status(403).json({ error: "Not authorized to put a open" });
    }
    if (oldTicket.owner !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized, id different" });
    }
    oldTicket.category = req.body.category || oldTicket.category;
    oldTicket.state = req.body.state || oldTicket.state;
    ticketDao
      .patchTicket(oldTicket)
      .then((response) => res.json(response))
      .catch((err) => res.status(500).json(err));
  }
);

app.post("/api/sessions", function (req, res, next) {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ error: info });
    }
    req.login(user, (err) => {
      if (err) return next(err);
      return res.json(req.user);
    });
  })(req, res, next);
});

app.get("/api/sessions/current", (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  } else res.status(401).json({ error: "Not authenticated" });
});

app.delete("/api/sessions/current", (req, res) => {
  req.logout(() => {
    res.status(200).json({});
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});