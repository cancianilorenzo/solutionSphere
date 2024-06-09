BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "users" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL UNIQUE,
    "role" TEXT DEFAULT "user",
    "password" TEXT,
    "salt" TEXT
);
CREATE TABLE IF NOT EXISTS "tickets" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "owner" INTEGER NOT NULL,
    "state" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "timestamp" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "category" TEXT CHECK(category IN ('inquiry', 'maintenance', 'new feature', 'administrative', 'payment')),
    FOREIGN KEY("owner") REFERENCES "users"("id")
);
CREATE TABLE IF NOT EXISTS "blocks" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "ticket" INTEGER,
    "author" INTEGER,
    "timestamp" INTEGER,
    "text" TEXT,
    FOREIGN KEY("ticket") REFERENCES "tickets"("id"),
    FOREIGN KEY("author") REFERENCES "users"("id")
);
COMMIT;