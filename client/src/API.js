"use strict";

const SERVER_URL = "http://localhost:3001/api/";
const SERVER_SUPPORT = "http://localhost:3002/";

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
      throw error;
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
      blocks.sort((a, b) => {
        return new dayjs(a.timestamp) - new dayjs(b.timestamp);
      });
      return blocks;
    })
    .catch(error => {
      throw error
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
      throw error;
    });
}

function createBlock(block) {
  const data = {
    ticketId: block.id,
    text: block.text
  };
  return fetch(SERVER_URL + "blocks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
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
      throw error;
    });
}

function patchTicket(ticket) {
  return fetch(SERVER_URL + "tickets/" + ticket.id, {
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
      throw error;
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
      throw error
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
      throw error;
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
      throw  error;
    });
}


function getAuthToken() {
  return fetch(SERVER_URL + 'token', {
    credentials: 'include'
  })
  .then(response => response.json().then(token => {
    if (response.ok) {
      return token;
    } else {
      throw token;
    }
  }))
  .catch(error => {
    throw error;
  });
}


function getEstimation(authToken, tickets) {
  return fetch(SERVER_SUPPORT + 'estimations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tickets: tickets }),
  })
  .then(response => response.json().then(info => {
    if (response.ok) {
      return info;
    } else {
      throw info;
    }
  }))
  .catch(error => {
    throw error;
  });
}


const API = { getTickets, getBlocks, login, logout, createTicket, createBlock, getInfo, patchTicket, getAuthToken, getEstimation};
export default API;
