// routes/products.js (or api/products.js)
module.exports = (connection) => {
    const getAllProducts = (req, res) => {
        connection.query('SELECT prod_id,prod_name,prod_desc FROM product_details', (err, results) => {
            if (err) {
                console.error("Error fetching products:", err);
                return res.status(500).json({ message: 'Error fetching products' });
            }
            res.json(results); // Send the products as JSON
        });
    };

    const insertProducts = (req, res) => {
        const { quantity, price, prod_id, username } = req.body;
        console.log(prod_id)
        let purchaseDate;

        // if (!quantity || !price || !prod_id || !username) {
        //     return res.status(400).json({ message: "Please provide all required fields"+req.body });
        // }

        // Check if date is provided in the request body
        if (req.body.date) {
            // Validate the provided date format (optional)
            // You can use a library like moment.js for date validation
            purchaseDate = req.body.date; // Use the provided date
        } else {
            // Get the current date in YYYY-MM-DD format
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');

            purchaseDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
        }

        connection.query(
            'INSERT INTO purchase_details (purchase_date, quantity, total_price, prod_id, username) VALUES (?, ?, ?, ?, ?)',
            [purchaseDate, parseInt(quantity), parseFloat(price), parseInt(prod_id), username],
            (err, result) => {
                if (err) {
                    console.error("Error adding purchase:", err);
                    return res.status(500).json({ message: 'Failed to add purchase', error: err.message });
                }
                res.status(201).json({ message: 'Purchase added successfully', purchaseId: result.insertId });
            }
        );
    }

    return {
        getAllProducts,
        insertProducts,
    };
};
;