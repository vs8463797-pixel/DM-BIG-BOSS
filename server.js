const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '.')));

// Setup SQLite Database
const db = new sqlite3.Database('./lottery.db', (err) => {
    if (err) {
        console.error('Database opening error: ' + err.message);
    } else {
        console.log('Connected to SQLite Database.');
        db.run(`CREATE TABLE IF NOT EXISTS results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            state_name TEXT,
            draw_name TEXT,
            prize_number TEXT,
            draw_time TEXT,
            date TEXT
        )`, () => {
            db.get(`SELECT COUNT(*) as count FROM results`, (err, row) => {
                if (row.count === 0) {
                    const initialLotteries = [
                        ['Nagaland State Lottery', 'DEAR FALCON MORNING', '92K 54321', '1:00 PM', '2026-10-24'],
                        ['Nagaland State Lottery', 'DEAR SUNNY DAY', '45A 12345', '6:00 PM', '2026-10-24'],
                        ['Kerala State Lottery', 'STREE SHAKTI (SS-390)', 'SB 987654', '3:00 PM', '2026-10-24'],
                        ['Kerala State Lottery', 'WIN WIN (W-750)', 'WN 456789', '3:00 PM', '2026-10-24'],
                        ['West Bengal Lottery', 'DEAR BANGALAKSHMI', '74K 12345', '4:00 PM', '2026-10-24'],
                        ['West Bengal Lottery', 'DEAR STARTING', '12A 98765', '1:00 PM', '2026-10-24'],
                        ['Punjab State Lottery', 'DEAR DEEPALI', 'PB 11223', '5:00 PM', '2026-10-24'],
                        ['Goa State Lottery', 'RAJSHREE GOA', 'RG 88776', '2:30 PM', '2026-10-24'],
                        ['Sikkim State Lottery', 'DEAR CHERISH', 'SK 55443', '11:55 AM', '2026-10-24'],
                        ['Meghalaya Lottery', 'SHILLONG TEER', '3456', '4:15 PM', '2026-10-24'],
                        ['Mizoram State Lottery', 'GOLDEN KING', 'MZ 99881', '7:00 PM', '2026-10-24'],
                        ['Assam State Lottery', 'ASSAM FUTURE', 'AS 11002', '12:00 PM', '2026-10-24'],
                        ['Manipur State Lottery', 'MANIPUR SINGAM', 'MN 77889', '3:30 PM', '2026-10-24'],
                        ['Arunachal Pradesh', 'ARUNACHAL VISHWAS', 'AP 33221', '1:30 PM', '2026-10-24'],
                        ['Maharashtra State Lottery', 'MAHARASHTRA GAURAV', 'MH 44332', '4:30 PM', '2026-10-24']
                    ];

                    const stmt = db.prepare(`INSERT INTO results (state_name, draw_name, prize_number, draw_time, date) VALUES (?, ?, ?, ?, ?)`);
                    initialLotteries.forEach(lottery => {
                        stmt.run(lottery);
                    });
                    stmt.finalize();
                }
            });
        });
    }
});

// API: Get all results
app.get('/api/results', (req, res) => {
    db.all(`SELECT * FROM results ORDER BY id DESC`, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: "success", data: rows });
    });
});

// API: Admin Manual Update
app.post('/api/update-result', (req, res) => {
    const { state_name, draw_name, prize_number, draw_time, date } = req.body;
    const query = `INSERT INTO results (state_name, draw_name, prize_number, draw_time, date) VALUES (?, ?, ?, ?, ?)`;
    
    db.run(query, [state_name, draw_name, prize_number, draw_time, date], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: "Success", id: this.lastID });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
