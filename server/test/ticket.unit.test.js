const ticketDao = require("../dao-tickets");
const db = require("../db");
jest.mock("../db");

beforeEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
});

describe("listTickets", () => {
  test("Should retrive list of tickets", async () => {
    const mockTickets = [
      {
        title: "Ticket from HTTP request",
        text: "This is a ticket",
        state: "closed",
        category: "payment",
        owner: 3,
        id: 1,
      },
      {
        title: "Ticket from Test request",
        text: "This is a ticket",
        state: "open",
        category: "payment",
        owner: 3,
        id: 1,
      },
    ];

    db.all.mockImplementation((sql, callback) => {
      callback(null, mockTickets);
    });

    const result = await ticketDao.listTickets();

    expect(result).toEqual(mockTickets);
  });

  test("Should reject with DB error", async () => {
    const errorMessage = "Database error";

    db.all.mockImplementation((sql, callback) => {
      callback(new Error(errorMessage), null);
    });

    await expect(ticketDao.listTickets()).rejects.toThrow(errorMessage);
  });
});

//CreateTicket test
// Success, fail to create transaction, fail to create ticket, fail to create block, fail to commit transaction

describe("createTicket", () => {
  test("Should resolve succesfluuy", async () => {
    db.serialize = jest.fn((callback) => callback());
    db.run = jest
      .fn()
      .mockImplementationOnce((sql, callback) => callback(null))
      .mockImplementationOnce((sql, params, callback) =>
        callback.call({ lastID: 1 }, null)
      )
      .mockImplementationOnce((sql, params, callback) => callback(null))
      .mockImplementationOnce((sql, callback) => callback(null));

    const ticket = {
      owner: 1,
      title: "MockedTicketTitle",
      category: "payment",
      text: "MockedText",
    };

    await expect(ticketDao.createTicket(ticket)).resolves.toEqual(
      {"id": 1}
    );
  });

  test("Should reject when BEGIN TRANSACTION fails", async () => {
    db.serialize = jest.fn((callback) => callback());
    db.run = jest.fn((sql, callback) =>
      callback(new Error("BEGIN TRANSACTION error"))
    );

    const ticket = {
      owner: 1,
      title: "MockedTicketTitle",
      category: "payment",
      text: "MockedText",
    };

    await expect(ticketDao.createTicket(ticket)).rejects.toEqual(
      "Failed to start transaction"
    );
  });

  test("Should reject when insert into tickets fails", async () => {
    db.serialize = jest.fn((callback) => callback());
    db.run = jest
      .fn()
      .mockImplementationOnce((sql, callback) => callback(null))
      .mockImplementationOnce(
        (sql, params, callback) =>
          callback(new Error("INSERT INTO tickets error")),
        null
      );

    const ticket = {
      owner: 1,
      title: "MockedTicketTitle",
      category: "payment",
      text: "MockedText",
    };

    await expect(ticketDao.createTicket(ticket)).rejects.toEqual(
      "Failed to insert into tickets"
    );
  });

  test("Should reject when inserting into blocks fails", async () => {
    db.serialize = jest.fn((callback) => callback());
    db.run = jest
      .fn()
      .mockImplementationOnce((sql, callback) => callback(null))
      .mockImplementationOnce((sql, params, callback) =>
        callback.call({ lastID: 1 }, null)
      )
      .mockImplementationOnce((sql, params, callback) =>
        callback(new Error("INSERT INTO blocks error"))
      );

    const ticket = {
      owner: 1,
      title: "MockedTicketTitle",
      category: "payment",
      text: "MockedText",
    };

    await expect(ticketDao.createTicket(ticket)).rejects.toEqual(
      "Failed to insert into blocks"
    );
  });

  test("Should reject if COMMIT fails", async () => {
    db.serialize = jest.fn((callback) => callback());

    db.run = jest
      .fn()
      .mockImplementationOnce((sql, callback) => callback(null))
      .mockImplementationOnce(
        (sql, params, callback) => callback.call({ lastID: 1 }, null) //To mock correctly the this item!
      )
      .mockImplementationOnce((sql, params, callback) => callback(null))
      .mockImplementationOnce((sql, callback) =>
        callback(new Error("Failed to commit transaction"))
      );

    const ticket = {
      owner: 1,
      title: "MockedTicketTitle",
      category: "payment",
      text: "MockedText",
    };

    await expect(ticketDao.createTicket(ticket)).rejects.toEqual(
      "Failed to commit transaction"
    );
  });
});