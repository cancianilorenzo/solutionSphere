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
  origin: 'http://localhost:5173',
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

//Session creation
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
    isLoggedIn,
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
    isLoggedIn,
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const ticket = req.body;
    ticket.owner = req.user.id;
    //Check user existance on db
    if(!userDao.getUserById(ticket.owner)){
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
    isLoggedIn,
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const block = req.body;
    block.author = req.user.id;
    //Check user existance on db
    if(!userDao.getUserById(block.author)){
      return res.status(400).json({ error: "User does not exist" });
    }
    //check ticket existance on db
    if(!ticketDao.getTicketById(block.ticketId)){
      return res.status(400).json({ error: "Ticket does not exist" });
    }
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
    isLoggedIn,
  ],
  (req, res) => {
    //Better to use patch??
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const ticket = req.body;
    //check ticket existance on db
    if(!ticketDao.getTicketById(ticket.id)){
      return res.status(400).json({ error: "Ticket does not exist" });
    }
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
    isLoggedIn,
  ],
  (req, res) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }
    //Better to use patch??
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const ticket = req.body;
    //check ticket existance on db
    if(!ticketDao.getTicketById(ticket.id)){
      return res.status(400).json({ error: "Ticket does not exist" });
    }
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
      isLoggedIn,
  ],
  (req, res) => {
    if(ticket.owner !== req.user.id){
      return res.status(403).json({ error: "Not authorized" });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const ticket = req.body;
    //check ticket existance on db
    if(!ticketDao.getTicketById(ticket.id)){
      return res.status(400).json({ error: "Ticket does not exist" });
    }
    ticketDao
      .setTicketClosed(ticket)
      .then((response) => res.json(response))
      .catch((err) => res.status(500).json(err));
  }
);

app.post("/api/sessions", function (req, res, next) {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      // display wrong login messages
      return res.status(401).json({ error: info });
    }
    // success, perform the login and extablish a login session
    req.login(user, (err) => {
      if (err) return next(err);

      // req.user contains the authenticated user, we send all the user info back
      // this is coming from userDao.getUser() in LocalStratecy Verify Fn
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
