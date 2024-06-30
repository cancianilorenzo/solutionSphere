const ticketDao = require("../dao-tickets");
const db = require("../db");

jest.mock("../db");

beforeEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
});

//Test clock listing
describe("listBlocks", () => {
  test("Should retrive list of blocks", async () => {
    const mockBlocks = [
      {
        id: 1,
        ticket: 1,
        text: "This is a block",
        date: "2024-05-06T00:00:00.000Z",
      },
      {
        id: 2,
        ticket: 1,
        text: "This is another block",
        date: "2023-06-03T00:00:00.000Z",
      },
    ];

    db.all.mockImplementation((sql, callback) => {
      callback(null, mockBlocks);
    });

    const result = await ticketDao.listBlocks();

    expect(result).toEqual(mockBlocks);
  });


  test("Should retrive list of blocks", async () => {
    const errorMessage = "Database error";
    db.all.mockImplementation((sql, callback) => {
      callback(new Error(errorMessage), null);
    });

    await expect(ticketDao.listBlocks()).rejects.toThrow(errorMessage);
  });
});

//Test block creation
describe("createBlock", () => {
  test("Should resolve successfully and create block", async () => {
    //Check ticket existence
    db.get.mockImplementation((sql, params, callback) => {
      callback(null, { id: 1 });
    });

    //Create block
    db.run.mockImplementation((sql, params, callback) => {
      callback.call({ lastID: 1 }, null);
    });

    const block = {
      text: "This is a ticket00",
      ticketId: 5,
      author: 5,
    };

    await expect(ticketDao.createBlock(block)).resolves.toEqual(
      { id: 1 }
    );

  });
});
