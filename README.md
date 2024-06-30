[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/Y8bW3OQP)
# Exam #1: "Ticketing System"
## Student: s317836 CANCIANI LORENZO

## React Client Application Routes

- Route `/`: Homepage, shows the list of all tickets. Logged users can also add ticket and see responses.
- Route `/login`: Login form, allows users to login. After a successful login, the user is redirected to the main route ("/").
- Route `/create`: Ticket creation page, allows an authenticated user to create a ticket.
- Route `*`: Page for nonexisting URLs (Not Found page) that allows user to move to `/` with a click.


## API Server

- **GET `/api/tickets`**: get all the tickets as a JSON list
  - **Response body**: JSON object with the list of tickets, or description of the error(s):
    ```
    [
    {
      "id": 1,
      "owner": 1,
      "state": "open",
      "title": "Clarification Needed on New Account Features",
      "timestamp": "2024-06-29 18:12:04",
      "category": "inquiry",
      "owner_username": "admin1"
    },
    {
      "id": 2,
      "owner": 1,
      "state": "closed",
      "title": "Scheduled server downtime for routine maintenance on monday morning",
      "timestamp": "2024-06-29 18:14:37",
      "category": "maintenance",
      "owner_username": "admin1"
    } ...]
    ```

  - **Codes**: `200 OK`, `500 Internal Server Error`.



- **GET `/api/blocks`**: get all the tickets as a JSON list if the user is logged in
  - **Response body**: JSON object with the list of tickets, or description of the error
    ```
    [
    {
      "id": 1,
      "ticket": 1,
      "author": 1,
      "timestamp": "2024-06-29 18:12:04",
      "text": "As title, clarification needed on new account features\nPlease, asap",
      "author_username": "admin1"
    },
    {
      "id": 2,
      "ticket": 2,
      "author": 3,
      "timestamp": "2024-06-29 18:14:37",
      "text": "Scheduled server downtime for routine maintenance? Really?? On monday morning?\nPlease, do it in the we",
      "author_username": "user4"
    }...]
    ```

  - **Codes**: `200 OK`, `401 Unauthorized`, `500 Internal Server Error`.




- **POST `/api/tickets`**: create a new ticket if the user is logged in
  - **Request**: JSON object with ticket object that contains __title__, __text__, __category__
    ```
    {
        "title": "Ticket from HTTP request",
        "text": "This is a ticket",
        "category": "payment"
    }
    ```

  - **Response body**: JSON object with the id of the new inserted ticket
    
    ```
    {
    "id": 10
    }
    ```

  - **Codes**: `200 OK`, `401 Unauthorized`, `400 Bad Request`, `500 Internal Server Error`.




- **POST `/api/blocks`**: create one new block for a ticket if the user is logged in
  - **Request**: JSON object with block object that contains __title__, __ticketId__

    ```
    {
      "text": "This is a block",
      "ticketId": 5
    }
    ```

  - **Response body**: JSON object with the id of the new inserted block
  
    ```
    {
      "id": 18
    }
    ```

  - **Codes**: `200 OK`, `401 Unauthorized`, `400 Bad Request`, `500 Internal Server Error`.



- **PATCH `/api/tickets/:id`**: patch category and/or state of an already existing ticket
  - **Request**: JSON object with block object that contains [ __state__ ], [ __category__ ]. Admin can reopen closed tickets and/or change category, user can only change owned tickets.
    ```
    {
      "state": "closed",
      "category": "new feature"
    }
    ```
  - **Response body**: JSON object with the new ticket
    ```
    {
      "id": 4,
      "owner": 4,
      "state": "closed",
      "title": "Proposal for enhanced reporting dashboard",
      "timestamp": "2024-06-29 18:38:47",
      "category": "new feature"
    }
    ```
  - **Codes**: `200 OK`, `401 Unauthorized`, `403 Forbidden`, `400 Bad Request`, `500 Internal Server Error`.

- **POST `/api/sessions`**: Authenticate and login the user.
  - **Request**: JSON object with __username__ and __password__:

    ```
    {
      "username": "admin1",
      "password": "password1",
      "credentials": "include"
    }
    ```

  - **Response body**: JSON object with the user's info if success, otherwise a description of the errors:

    ```
    {
      "id": 1,
      "username": "admin1",
      "role": "admin"
    }
    ```

  - **Codes**: `200 OK`, `401 Unauthorized`, `400 Bad Request`, `500 Internal Server Error`.


- **GET `/api/sessions`**: Get info on the logged in user.

  - **Response body**: JSON object with the user's info:

    ```
    {
      "id": 1,
      "username": "admin1",
      "role": "admin"
    }
    ```

  - **Codes**: `200 OK`, `401 Unauthorized`, `500 Internal Server Error`.

- **GET `/api/token`**: Get jwt token for the logged user.
  - **Response body**: JSON object with the user's jwt and role:   
    ```
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpZCI6MSwiaWF0IjoxNzE5NzEwNzgyLCJleHAiOjE3MTk3MTA4MTJ9.E8E5u3dyvD73hkQXryHTK974KpRU4EzQR4yrcu-v-fQ",
      "role": "admin"
    }
    ```

  - **Codes**: `200 OK`, `401 Unauthorized`, `500 Internal Server Error`.

- **DELETE `/api/sessions`**
  - **Codes**: `200 OK`, `401 Unauthorized`.

## API Server2

* **POST `/api/estimations`** : Returns the estimated closing time for each ticket
  - **Request Headers**: JWT token 
  - **Request**: JSON object as a list of tickets with title and category for each ticket   
    ```
    {
    "tickets": [
        {
            "category": "payment",
            "title": "Ticket 1"
        },
        {
            "category": "mainteinance",
            "title": "Ticket 2"
        },
        {
            "category": "feature",
            "title": "Ticket 3"
        }
      ]
    }
    ```
  - **Response body**: JSON object with the estimation in days and hour for admin, only days for normal user
    ```
    [
      {
        "estimation": "6day(s)8hour(s)"
      },
      {
        "estimation": "14day(s)6hour(s)"
      },
      {
        "estimation": "15day(s)23hour(s)"
      }
    ]
    ```
  - **Codes**: `200 OK`, `401 Unauthorized`, `500 Internal Server Error`.


## Database Tables

- Table `users`:  
    - __id__ INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    - __username__ TEXT NOT NULL UNIQUE,
    - __role__ TEXT DEFAULT "user" CHECK(role IN ('user', 'admin')) NOT NULL,
    - __password__ TEXT NOT NULL,
    - __salt__ TEXT NOT NULL
- Table `tickets`:   
    - __id__ INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    - __owner__ INTEGER NOT NULL,
    - __state__ TEXT NOT NULL,
    - __title__ TEXT NOT NULL,
    - __timestamp__ INTEGER NOT NULL,
    - __category__ TEXT CHECK(__category__ IN (__inquiry__, __maintenance__, __new feature__, __administrative__, __payment__)) NOT NULL,
    - FOREIGN KEY(__owner__) REFERENCES `users`(__id__) ON DELETE CASCADE
- Table `blocks`:   
    - __id__ INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    - __ticket__ INTEGER NOT NULL,
    - __author__ INTEGER NOT NULL,
    - __timestamp__ INTEGER NOT NULL,
    - __text__ TEXT,
    - FOREIGN KEY(__ticket__) REFERENCES `tickets`(__id__) ON DELETE CASCADE,
    - FOREIGN KEY(__author__) REFERENCES `users`(__id__) ON DELETE CASCADE

## Main React Components

- `App` (in `App.jsx`): is rendered inside a Router to be able to use the useNavigate hook. This maintains most of the state of the app.
- `TicketRoute` (in `/components/Ticket.jsx`): is rendered in `/` route, it is a wrapper around a Bootstrap Accordion component to render tickets.
- `Ticket` (in `/components/Ticket.jsx`): is rendered by `TicketRoute` and contains ticket title, owner, date, category and, in case of admin, also the closing time estimation. Contains also management options for tickets and blocks if teh user is logged in.
- `Block` (in `/components/Ticket.jsx`): is rendered by `Ticket` and contains blocks content.
- `CreateTicket` (in `/components/Manager.jsx`): is rendered starting from the `Add ticket` button in `/` for the logged user and redirect user to `/create` route. It allows to insert ticket title, category and first block of text. User can check ticket before submitting in a non-edit fashion and can decide to submit or return to edit mode. When submitting (or pre-submitting) a ticket, user get estimation closing time.
- `AddResponse` (in `/components/Manager.jsx`): allows logged user, through a Bootstrap Modal, to insert new response to a ticket.
- `EditCategory` (in `/components/Manager.jsx`): allows logged admin to change category through a Bootsrtap Modal, admin can choose from a category list and must confirm selection.
- `ButtonCloseTicket` & `ButtonReopenTIcket` (in `/components/Manager.jsx`): handle ticket reopen and close operations, reopen is usable only by admins, close only from admin or ticket owner.
- `MyNavbar` (in `/components/Layout.jsx`): renders custom navbar that contains login/logout button, username of logged user (if present), app name that contains a link to the `/` route.
- `Layout` (in `/components/Layout.jsx`): renders the basic layout present in each route, renders MyNavbar and MyFooter.
- `LoginForm` (in `/components/Login.jsx`): the login form that user can use to login into the app. This is responsible for the client-side validation of the login credentials (non-empty username and non-empty password).

## Screenshot
![Initial page](./img/ticketExpandAdmin.png)
![Ticket creation](./img/ticketCreateAdmin.png)

## Users Credentials

| username | password  | role   |
|-----------|-----------|--------|
| admin1    | password1 |  admin |
| admin2    | password2 |  admin |
| user3     | password3 |  user  |
| user4     | password4 |  user  |
| user5     | password5 |  user  |
| user6     | password6 |  user  |

