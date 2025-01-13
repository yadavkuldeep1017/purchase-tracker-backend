// routes/login.js
module.exports = (connection) => {
    const loginRoute = (req, res) => {
        const { username, password } = req.body;

        connection.query(
            'SELECT username, isAdmin FROM users WHERE username = ? AND password = ?',
            [username, password],
            (err, results) => {
                if (err) {
                    console.error("Database error:", err);
                    return res.status(500).json({ message: 'Database error' });
                }

                if (results.length === 1) {
                    // const isAdminBoolean = results[0].isAdmin ? true : false; // Ternary operator
                    // req.session.user = { username: results[0].username, isAdmin: isAdminBoolean };
                    res.json({ message: 'Login successful', isAdmin: results[0].isAdmin });
                } else {
                    res.status(401).json({ message: 'Invalid credentials' });
                }
            }
        );
    };

    const checkAuthRoute = (req, res) => {
        if (req.session.user) {
            res.json({ isAuthenticated: true, isAdmin: req.session.user.isAdmin });
        } else {
            res.json({ isAuthenticated: false });
        }
    };

    const logoutRoute = (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.error("Error destroying session:", err);
                return res.status(500).json({ message: "Logout failed" });
            }
            res.json({ message: "Logout successful" });
        });
    };

    const forgotPasswordRoute = (req, res) => {
        const { mobileNumber } = req.body;
        connection.query('SELECT mobile FROM users WHERE mobile=?', [mobileNumber], (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: 'Database error' });
            }
            if (results.length === 1) {
                res.json({ message: 'Mobile number found' });
            } else {
                res.status(404).json({ message: 'Mobile number not found' });
            }
        });
    }

    const resetPasswordRoute = (req, res) => {
        const { mobileNumber, newPassword } = req.body;
        connection.query('UPDATE users SET password=? WHERE mobile=?', [newPassword, mobileNumber], (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: 'Database error' });
            }
            if (results.affectedRows === 1) {
                res.json({ message: 'Password reset successfully' });
            } else {
                res.status(404).json({ message: 'Mobile number not found' });
            }
        })
    }

    return {
        login: loginRoute,
        checkAuth: checkAuthRoute,
        logout: logoutRoute,
        forgotPassword: forgotPasswordRoute,
        resetPassword: resetPasswordRoute
    };
};