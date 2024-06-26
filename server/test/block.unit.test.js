const ticketDao = require("../dao-tickets");
const db = require("../db");

jest.mock("../index");
jest.mock("../db");

beforeEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
});

describe("listBlocks", () => {
  it("Should retrive list of blocks", async () => {
    const mockBlocks = [
      {
        id: 1,
        ticket: 1,
        text: "This is a block",
        date: "2021-01-01T00:00:00.000Z",
      },
      {
        id: 2,
        ticket: 1,
        text: "This is another block",
        date: "2021-01-01T00:00:00.000Z",
      },
    ];

    db.all.mockImplementation((sql, callback) => {
      callback(null, mockBlocks);
    });

    const result = await ticketDao.listBlocks();

    expect(result).toEqual(mockBlocks);
  });
  it("Should retrive list of blocks", async () => {
    const errorMessage = "Database error";
    db.all.mockImplementation((sql, callback) => {
      callback(new Error(errorMessage), null);
    });

    await expect(ticketDao.listBlocks()).rejects.toThrow(errorMessage);
  });
});
