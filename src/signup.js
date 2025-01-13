// routes/signup.js
module.exports = (connection) => {
    const signupRoute = (req, res) => {
        const { username, password, isAdmin } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Please provide username and password.' });
        }

        connection.query(
            'SELECT * FROM users WHERE username = ?',
            [username],
            (err, rows) => {
                if (err) {
                    console.error("Database error:", err);
                    return res.status(500).json({ message: 'Database error' });
                }

                if (rows.length > 0) {
                    return res.status(409).json({ message: 'Username already exists.' });
                }

                // Store password in plain text (EXTREMELY INSECURE)
                connection.query(
                    'INSERT INTO users (username, password, isAdmin) VALUES (?, ?, ?)',
                    [username, password, isAdmin || 0],
                    (err, result) => {
                        if (err) {
                            console.error("Insert error:", err);
                            return res.status(500).json({ message: 'Error during user creation.' });
                        }
                        res.status(201).json({ message: 'User created successfully.' });
                    }
                );
            }
        );
    };
    return {signup: signupRoute}
}