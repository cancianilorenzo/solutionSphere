"use strict";

const SERVER_URL = "http://localhost:3001/api/";

import dayjs from "dayjs";

function getTickets(id) {
  return fetch(SERVER_URL + "tickets")
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(tickets => {
      tickets.sort((a, b) => {
        return new dayjs(b.timestamp) - new dayjs(a.timestamp);
      });
      return tickets;
    })
    .catch(error => {
      console.error("Failed to fetch blocks", error);
      return [];
    });
}

function getBlocks() {
  return fetch(SERVER_URL + "blocks", {
    method: "GET",
    credentials: "include",
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(blocks => {
      return blocks;
    })
    .catch(error => {
      console.error("Failed to fetch blocks", error);
      return []; // Ritorna un array vuoto in caso di errore
    });
}


function createTicket(ticket) {
  return fetch(SERVER_URL + "tickets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ticket),
    credentials: "include",
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        return res.json().then((err) => {
          throw err;
        });
      }
    }
    )
    .then((ticket) => {
      return ticket;
    })
    .catch((error) => {
      console.error("Failed to create ticket", error);
      return null;
    });
}

function createBlock(block) {
  return fetch(SERVER_URL + "blocks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(block),
    credentials: "include",
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        return res.json().then((err) => {
          throw err;
        });
      }
    })
    .then((block) => {
      return block;
    })
    .catch((error) => {
      console.error("Failed to create block", error);
      return null;
    });
}

function patchTicket(ticket) {
  return fetch(SERVER_URL + "ticket", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ticket),
    credentials: "include",
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        return res.json().then((err) => {
          throw err;
        });
      }
    })
    .then((ticket) => {
      return ticket;
    })
    .catch((error) => {
      console.error("Failed to patch ticket", error);
      return null;
    });
}

function login(username, password) {
  return fetch(SERVER_URL + "sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
    credentials: "include",
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        return res.json().then((err) => {
          throw err;
        });
      }
    })
    .then((user) => {
      return user;
    })
    .catch((error) => {
      console.error("Failed to log in", error);
      return null;
    });
}


function logout() {
  return fetch(SERVER_URL + "sessions/current", {
    method: "DELETE",
    credentials: "include",
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        return res.json().then((err) => {
          throw err;
        });
      }
    })
    .then(() => {
      return null;
    })
    .catch((error) => {
      console.error("Failed to log out", error);
      return null;
    });
}

function getInfo() {
  return fetch(SERVER_URL + "sessions/current", {
    method: "GET",
    credentials: "include",
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        return res.json().then((err) => {
          throw err;
        });
      }
    })
    .then((user) => {
      return user;
    })
    .catch((error) => {
      console.error("Failed to get user info", error);
      return null;
    });
}


const API = { getTickets, getBlocks, login, logout, createTicket, createBlock, getInfo, patchTicket };
export default API;
