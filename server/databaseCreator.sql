BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "users" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "username" TEXT NOT NULL UNIQUE,
    "role" TEXT DEFAULT "user" CHECK(role IN ('user', 'admin')) NOT NULL,
    "password" TEXT NOT NULL,
    "salt" TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS "tickets" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "owner" INTEGER NOT NULL,
    "state" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "timestamp" INTEGER NOT NULL,
    "category" TEXT CHECK(category IN ('inquiry', 'maintenance', 'new feature', 'administrative', 'payment')) NOT NULL,
    FOREIGN KEY("owner") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "blocks" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "ticket" INTEGER NOT NULL,
    "author" INTEGER NOT NULL,
    "timestamp" INTEGER NOT NULL,
    "text" TEXT,
    FOREIGN KEY("ticket") REFERENCES "tickets"("id") ON DELETE CASCADE,
    FOREIGN KEY("author") REFERENCES "users"("id") ON DELETE CASCADE
);
COMMIT;