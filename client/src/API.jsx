"use strict";

import dayjs from "dayjs";

const SERVER_URL = "http://localhost:3001/api/";

function parseJson(apiResult) {
  return new Promise((resolve, reject) => {
    apiResult.then((response) => {
      if (response.ok) {
        response
          .json()
          .then((json) => resolve(json))
          .catch((err) => reject({ error: "Error while parsing" }));
      } else {
        reject({ error: "Error in retrieving json" });
      }
    });
  });
}

const getTickets = async () => {
    return getJson( fetch(SERVER_URL + 'tickets')
    ).then( json => {
      return json.map((ticket) => {
        const resultTicket = {
          id: ticket.id,
          title: ticket.title,
          timestamp: ticket.timestamp,
          owner: ticket.owner,
          state: ticket.state
        }
        return resultTicket;
      })
    })
  }

const API = { getTickets };
export default API;


