'use strict';

const db = require('./db');
const crypto = require('crypto');
const dayjs = require('dayjs');


const keyLength = 64;
const costFactor = 16384;
const blockSize = 8;
const parallelizationFactor = 1;

async function insertUser(){
    const users = [
        { username: 'admin1', password: 'password1', role: 'admin' },
        { username: 'admin2', password: 'password2', role: 'admin' },
        { username: 'user3', password: 'password3', role: 'user' },
        { username: 'user4', password: 'password4', role: 'user' },
        { username: 'user5', password: 'password5', role: 'user' }
    ];
    
    const insertUserQuery = `INSERT INTO users (username, password, role, salt) VALUES (?, ?, ?, ?)`;
    
    users.forEach(user => {
        const salt = crypto.randomBytes(32);
        crypto.scrypt(user.password, salt, keyLength, { N: costFactor, r: blockSize, p: parallelizationFactor }, (err, derivedKey) => {
            if (err) throw err;
            const newUser = {
                username: user.username,
                password: derivedKey.toString('hex'),
                role: user.role,
                salt: salt.toString('hex')
            };
            db.run(insertUserQuery, [newUser.username, newUser.password, newUser.role, newUser.salt], (err) => {
                if (err) throw err;
                else {
                    console.log('User inserted successfully');
                }
            });
        });
    });
}

async function insertTicket(){
    const insertTicketQuery = `INSERT INTO tickets (owner, state, title, timestamp, text, category) VALUES (?, ?, ?, ?, ?, ?)`;

    const tickets = [
        { owner: 1, state: 'open', title: 'Inquiry Ticket', timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'), text: 'This is an inquiry ticket', category: 'inquiry' },
        { owner: 2, state: 'open', title: 'Maintenance Ticket', timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'), text: 'This is a maintenance ticket', category: 'maintenance' },
        { owner: 3, state: 'open', title: 'New Feature Ticket', timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'), text: 'This is a new feature ticket', category: 'new feature' },
        { owner: 4, state: 'open', title: 'Administrative Ticket', timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'), text: 'This is an administrative ticket', category: 'administrative' },
        { owner: 5, state: 'open', title: 'Payment Ticket', timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'), text: 'This is a payment ticket', category: 'payment' }
    ];

    tickets.forEach(ticket => {
        db.run(insertTicketQuery, [ticket.owner, ticket.state, ticket.title, ticket.timestamp, ticket.text, ticket.category], (err) => {
            if (err) throw err;
            else {
                console.log('Ticket inserted successfully');
            }
        });
    });
}

async function insertBlock(){
    const insertBlockQuery = `INSERT INTO blocks (ticket, author, timestamp, text) VALUES (?, ?, ?, ?)`;
    const blocks = [
        { ticket: 1, author: 1, timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'), text: 'This is block 1' },
        { ticket: 1, author: 2, timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'), text: 'This is block 2' },
        { ticket: 2, author: 3, timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'), text: 'This is block 3' },
        { ticket: 2, author: 4, timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'), text: 'This is block 4' },
        { ticket: 3, author: 5, timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'), text: 'This is block 5' }
    ];
    blocks.forEach(block => {
        db.run(insertBlockQuery, [block.ticket, block.author, block.timestamp, block.text], (err) => {
            if (err) throw err;
            else {
                console.log('Block inserted successfully');
            }
        });
    });
}


async function main(){
    await insertUser();
    await insertBlock();
    await insertTicket();
}

main();
