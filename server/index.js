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

const validStates = ["open", "closed"];

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
    console.log(req.user);
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const ticket = req.body;
    ticket.owner = req.user.id;
    //Check user existance on db
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
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const block = req.body;
    block.author = req.user.id;
    //Check user existance on db
    if (!userDao.getUserById(block.author)) {
      return res.status(400).json({ error: "User does not exist" });
    }
    //check ticket existance on db
    if (!ticketDao.getTicketById(block.ticketId)) {
      return res.status(400).json({ error: "Ticket does not exist" });
    }
    ticketDao
      .createBlock(block)
      .then((response) => res.json(response))
      .catch((err) => res.status(500).json(err));
  }
);

//create a route to patch a ticket, is possible to pass category and/or state, the missing paraemters are get from an old ticket stored on the database
// app.patch(
//   "/api/ticket",
//   [
//     body("id")
//       .not()
//       .isEmpty()
//       .withMessage("Id should not be empty")
//       .isInt()
//       .withMessage("Id should be an integer"),
//     isLoggedIn,
//   ],
//   (req, res) => {
//     if (req.user.role !== "admin" && req.body.category) {
//       return res.status(403).json({ error: "Not authorized" });
//     }
//     if (req.user.role !== "admin" && (req.body.state === 'open')) {
//       return res.status(403).json({ error: "Not authorized" });
//     }
//     if(req.body.category && !req.body.category.isIn(validCategories)){
//       return res.status(400).json({ error: "Bad request" });
//     }
//     // Fetch the ticket from the database
//     ticketDao.getTicketById(req.body.id)
//       .then((fetchedTicket) => {
//         // Check if the user id matches the ticket owner id
//         if (req.user.id !== fetchedTicket.owner) {
//           return res.status(403).json({ error: "Not authorized" });
//         }
//         // Continue with the ticket patching logic
//         const ticket = req.body;
//         ticketDao
//           .patchTicket(ticket)
//           .then((response) => {return res.json(response)})
//           .catch((err) => {return (res.status(500).json(err))});
//       })
//       .catch((err) => {return res.status(500).json(err)});
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }
//     const ticket = req.body;
//     ticketDao
//       .patchTicket(ticket)
//       .then((response) => {return res.json(response)})
//     .catch((err) => {return res.status(500).json(err)});
//   }
// )

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
    //populate category and state with old ticket values if not provided
    if (!oldTicket) {
      return res.status(400).json({ error: "Ticket does not exist" });
    }
    if (req.user.role !== "admin" && req.body.category) {
      return res.status(403).json({ error: "Not authorized" });
    }
    if (req.user.role !== "admin" && req.body.state === "open") {
      return res.status(403).json({ error: "Not authorized" });
    }
    if (oldTicket.owner !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }
    oldTicket.category = req.body.category || oldTicket.category;
    oldTicket.state = req.body.state || oldTicket.state;
    ticketDao
      .patchTicket(oldTicket)
      .then((response) => res.json(response))
      .catch((err) => res.status(500).json(err));
  }
);

// app.put(
//   "/api/categoryTicket",
//   [
//     body("id")
//       .not()
//       .isEmpty()
//       .withMessage("Id should not be empty")
//       .isInt()
//       .withMessage("Id should be an integer"),
//     body("category")
//       .isIn(validCategories)
//       .withMessage(
//         `Category must be one of the following: ${validCategories.join(", ")}`
//       ),
//     isLoggedIn,
//   ],
//   (req, res) => {
//     //Better to use patch??
//     if (req.user.role !== "admin") {
//       return res.status(403).json({ error: "Not authorized" });
//     }
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }
//     const ticket = req.body;
//     //check ticket existance on db
//     if(!ticketDao.getTicketById(ticket.id)){
//       return res.status(400).json({ error: "Ticket does not exist" });
//     }
//     ticketDao
//       .patchTicketCategory(ticket)
//       .then((response) => res.json(response))
//       .catch((err) => res.status(500).json(err));
//   }
// );

// app.put(
//   "/api/openTicket",
//   [
//     body("id")
//       .not()
//       .isEmpty()
//       .withMessage("Id should not be empty")
//       .isInt()
//       .withMessage("Id should be an integer"),
//     isLoggedIn,
//   ],
//   (req, res) => {
//     if (req.user.role !== "admin") {
//       return res.status(403).json({ error: "Not authorized" });
//     }
//     //Better to use patch??
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }
//     const ticket = req.body;
//     //check ticket existance on db
//     if(!ticketDao.getTicketById(ticket.id)){
//       return res.status(400).json({ error: "Ticket does not exist" });
//     }
//     ticketDao
//       .setTicketOpened(ticket)
//       .then((response) => res.json(response))
//       .catch((err) => res.status(500).json(err));
//   }
// );

// app.put(
//   "/api/closeTicket",
//   [
//     body("id")
//       .not()
//       .isEmpty()
//       .withMessage("Id should not be empty")
//       .isInt()
//       .withMessage("Id should be an integer"),
//       isLoggedIn,
//   ],
//   (req, res) => {
//     if(ticket.owner !== req.user.id){
//       return res.status(403).json({ error: "Not authorized" });
//     }
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }
//     const ticket = req.body;
//     //check ticket existance on db
//     if(!ticketDao.getTicketById(ticket.id)){
//       return res.status(400).json({ error: "Ticket does not exist" });
//     }
//     ticketDao
//       .setTicketClosed(ticket)
//       .then((response) => res.json(response))
//       .catch((err) => res.status(500).json(err));
//   }
// );

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
