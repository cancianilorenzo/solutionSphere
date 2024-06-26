// const request = require("supertest");
// const app = require("../index");
const ticketDao = require("../dao-tickets");
const db = require("../db");
const dayjs = require("dayjs");
// const { isLoggedIn } = require("../index");

jest.mock("../index");
jest.mock("../db");

// jest.mock("../dao-tickets");

beforeEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
});

describe("listTickets", () => {
  it("Should retrive list of tickets", async () => {
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

  it("Should reject with DB error", async () => {
    const errorMessage = "Database error";

    db.all.mockImplementation((sql, callback) => {
      callback(new Error(errorMessage), null);
    });

    await expect(ticketDao.listTickets()).rejects.toThrow(errorMessage);
  });
});

describe("createTicket", () => {
  it('should resolve when the transaction is committed successfully', async () => {

    db.serialize = jest.fn((callback) => callback());
    db.run = jest.fn()
      .mockImplementationOnce((sql, callback) => callback(null))
      .mockImplementationOnce((sql, params, callback) => callback.call({ lastID: 1 }, null))
      .mockImplementationOnce((sql, params, callback) => callback(null))
      .mockImplementationOnce((sql, callback) => callback(null));

    const ticket = { owner: 1, title: 'MockedTicketTitle', category: 'payment', text: 'MockedText' };

    await expect(ticketDao.createTicket(ticket)).resolves.toEqual('Transaction committed successfully.');
  });
  it('should reject when BEGIN TRANSACTION fails', async () => {
    db.serialize = jest.fn((callback) => callback());
    db.run = jest.fn((sql, callback) => callback(new Error('BEGIN TRANSACTION error')));

    const ticket = { owner: 1, title: 'Test Ticket', category: 'General', text: 'Test Text' };

    await expect(ticketDao.createTicket(ticket)).rejects.toEqual('Failed to start transaction');

  });
  it('should reject when inserting into tickets fails', async () => {
    db.serialize = jest.fn((callback) => callback());
    db.run = jest.fn()
      .mockImplementationOnce((sql, callback) => callback(null))
      .mockImplementationOnce((sql, params, callback) => callback(new Error('INSERT INTO tickets error')), null); // INSERT INTO tickets

    const ticket = { owner: 1, title: 'Test Ticket', category: 'General', text: 'Test Text' };

    await expect(ticketDao.createTicket(ticket)).rejects.toEqual('Failed to insert into tickets');

  });
}
);
