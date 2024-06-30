"use strict";

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const { expressjwt: jwt } = require("express-jwt");

const jwtSecret = '201362858dd0d0e5e5c4105228dd54b8be10aba87f4992aa428c0f93aed74ebc';


// init express
const app = new express();
const port = 3002;

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions));

app.use(morgan('dev'));
app.use(express.json());

app.use(jwt({
  secret: jwtSecret,
  algorithms: ["HS256"],
})
);


app.use( function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json("Invalid token");
  } else {
    next();
  }
} );


app.post("/estimations", (req, res) => {
  const authJwt = req.auth;
  let estimation;
  if(!authJwt){
    res.status(401).json("Invalid token");
  }
  try {  const { tickets } = req.body;
  const ticketValue = tickets.map(ticket => {
    if(!ticket.title || !ticket.category){
      estimation = 0;
      return { estimation };
    }
    estimation = (((ticket.title.replace(/\s/g, '').length + ticket.category.replace(/\s/g, '').length)) * 10) +(Math.floor(Math.random() * 240) + 1);

    if(req.auth.role !== 'admin'){
      return { estimation: Math.round(estimation/24)  + 'day(s)' }
    }
    if(req.auth.role === 'admin'){
      return { estimation: Math.round(estimation/24) + 'day(s)' + estimation%24 + 'hour(s)'}
    }
    
  });

  res.status(200).json(ticketValue);}
  catch{
    res.status(500).json("Internal server error")}

});




// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
