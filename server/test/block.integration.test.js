const request = require("supertest");
const app = require("../index"); // Adjust the path as per your project structure
const db = require("../db"); // Adjust the path as per your project structure

describe("POST /api/blocks", () => {
  beforeAll((done) => {
    // Setup test database or in-memory SQLite database
    //User should be already populated!
    db.serialize(() => {
      db.run(
        "CREATE TABLE tickets (id INTEGER PRIMARY KEY AUTOINCREMENT,owner INTEGER NOT NULL,state TEXT NOT NULL,title TEXT NOT NULL,timestamp INTEGER NOT NULL,category TEXT CHECK(category IN ('inquiry', 'maintenance', 'new feature', 'administrative', 'payment')),FOREIGN KEY(owner) REFERENCES users(id)"
      );
      db.run(
        "CREATE TABLE blocks (id INTEGER PRIMARY KEY AUTOINCREMENT,ticket INTEGER,author INTEGER,timestamp INTEGER,text TEXT,FOREIGN KEY(ticket) REFERENCES tickets(id),FOREIGN KEY(author) REFERENCES users(id)",
        done
      );
    });
  });

  afterAll((done) => {
    // Cleanup test database
    db.serialize(() => {
      db.run("DROP TABLE blocks");
      db.run("DROP TABLE tickets", done);
    });
  });

  it("should create a block successfully", async () => {
    const block = {
      text: "Integration Test Ticket",
      ticketId: 5,
      author: 5,
    };

    const response = await request(app)
      .post("/api/blocks")
      .send(block)
      .expect("Content-Type", /json/)
      .expect(201);

    expect(response.body).toHaveProperty(
      "message",
      "Ticket block created successfully"
    );
  });

  // it("should return 500 if ticket does not exist", async () => {
  //   const block = { ticketId: 999, author: 1, text: "Test Block" };

  //   const response = await request(app)
  //     .post("/api/blocks")
  //     .send(block)
  //     .expect("Content-Type", /json/)
  //     .expect(500);

  //   expect(response.body).toHaveProperty(
  //     "error",
  //     "Ticket with that id does not exist"
  //   );
  // });

  // it("should return 500 if there is a database error", async () => {
  //   // Simulate database error by closing the database connection
  //   db.close();

  //   const block = { ticketId: 1, author: 1, text: "Test Block" };

  //   const response = await request(app)
  //     .post("/api/blocks")
  //     .send(block)
  //     .expect("Content-Type", /json/)
  //     .expect(500);

  //   expect(response.body).toHaveProperty("error");

  //   // Reopen the database connection for other tests
  //   db.open();
  // });
});
