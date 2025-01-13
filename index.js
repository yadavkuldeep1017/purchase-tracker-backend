const express = require('express');
const cors = require('cors');
const session = require('express-session');
const loginRoutes = require('./src/login_api.js');
const productsRoutes = require('./src/product.js')
const db = require('./src/db.connection.js'); // Import the database module
const corsOptions = require('./src/cors.js');
const XLSX = require('xlsx');
const signupRoute = require('./src/signup.js');

const app = express();
const port = process.env.PORT || 5000; // Use environment variable or default

app.use(express.json());
app.use(cors(corsOptions));
app.use(session({
  secret: 'kuldeep',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Connect to the database
db.connectToDatabase();
const connection = db.getConnection(); // Get the connection object

// Mount the login route handler (passing the connection)
const login = loginRoutes(connection);
const signup = signupRoute(connection);

app.post('/login', login.login);
app.get('/check-auth', login.checkAuth);
app.get('/logout', login.logout);
app.post('/forgot-password', login.forgotPassword);
app.post('/reset-password', login.resetPassword);
app.post('/signup',signup.signup)


const products = productsRoutes(connection); // Mount product routes
app.get('/api/products', products.getAllProducts); // Define the /api/products route

app.post('/api/purchase_details', products.insertProducts);

// Add a new product
app.post('/api/products', (req, res) => {
  const { prod_name, prod_desc } = req.body; // Use prod_desc
  if (!prod_name || !prod_desc) { // Check for prod_desc
    return res.status(400).json({ message: 'Please provide product name and description' });
  }
  connection.query('INSERT INTO product_details (prod_name, prod_desc) VALUES (?, ?)', [prod_name, prod_desc], (err, result) => { // Insert prod_desc
    if (err) return res.status(500).json({ message: err.message });
    res.status(201).json({ message: 'Product added', productId: result.insertId });
  });
});

// Uppurchase_purchase_date a product
app.put('/api/products/:id', (req, res) => {
  const { prod_name, prod_desc } = req.body; // Use prod_desc
  const productId = req.params.id;
  connection.query('UPDATE product_details SET prod_name = ?, prod_desc = ? WHERE prod_id = ?', [prod_name, prod_desc, productId], (err) => { // Uppurchase_purchase_date prod_desc
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: 'Product uppurchase_purchase_dated' });
  });
});

// Delete a product
app.delete('/api/products/:id', (req, res) => {
  const productId = req.params.id;
  connection.query('DELETE FROM product_details WHERE prod_id = ?', [productId], (err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: 'Product deleted' });
  });
});

app.get('/api/reports', (req, res) => {
  const { startDate, endDate, month, productName, reportType, productScope, download } = req.query;
  let query = '';
  let params = [];

  switch (reportType) {
    case 'custom':
      if (productScope === 'specific') {
        query = `SELECT p.prod_name, pur.quantity, pur.total_price, pur.purchase_date
                       FROM purchase_details pur
                       JOIN product_details p ON pur.prod_id = p.prod_id
                       WHERE pur.purchase_date BETWEEN ? AND ? AND p.prod_name = ?`; // Search by name
        params = [startDate, endDate, productName];
      } else {
        query = `SELECT distinct p.prod_name, sum(pur.quantity) AS total_quantity, sum(pur.total_price) AS total_amount
                       FROM purchase_details pur
                       JOIN product_details p ON pur.prod_id = p.prod_id
                       WHERE pur.purchase_date BETWEEN ? AND ?
                       GROUP BY p.prod_name`;
        params = [startDate, endDate];
      }
      break;
    case 'monthly':
      if (!month) {
        return res.status(400).json({ message: 'Please select a month.' });
      }
      const [year, monthNum] = month.split('-'); // Split the year and month
      if (productScope === 'specific') {
        query = `SELECT p.prod_name, pur.quantity, pur.total_price, pur.purchase_date
                   FROM purchase_details pur
                   JOIN product_details p ON pur.prod_id = p.prod_id
                   WHERE MONTH(pur.purchase_date) = ? AND YEAR(pur.purchase_date) = ? AND p.prod_name = ?`;
        params = [parseInt(monthNum, 10), parseInt(year, 10), productName];
      } else {
        query = `SELECT p.prod_name, SUM(pur.quantity) AS total_quantity, SUM(pur.total_price) AS total_amount
                   FROM purchase_details pur
                   JOIN product_details p ON pur.prod_id = p.prod_id
                   WHERE MONTH(pur.purchase_date) = ? AND YEAR(pur.purchase_date) = ?
                   GROUP BY p.prod_name`;
        params = [parseInt(monthNum, 10), parseInt(year, 10)];
      }
      break;
    case 'all':
      if (productScope === 'specific') {
        query = `SELECT p.prod_name, pur.quantity,  pur.total_price
                       FROM purchase_details pur
                       JOIN product_details p ON pur.prod_id = p.prod_id
                       WHERE p.prod_name = ?
                       GROUP BY p.prod_name`; // Search by name
        params = [productName];
      } else {
        query = `SELECT p.prod_name, SUM(pur.quantity) AS total_quantity, SUM(pur.total_price) AS total_amount
                       FROM purchase_details pur
                       JOIN product_details p ON pur.prod_id = p.prod_id
                       GROUP BY p.prod_name`;
      }
      break;
    default:
      return res.status(400).json({ message: 'Invalid report type' });
  }

  connection.query(query, params, (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ message: 'Error fetching report data' });
    }

    if (download === 'excel') {
      if (results.length > 0) {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(results);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=report.xlsx');
        res.send(excelBuffer);
      } else {
        return res.status(404).json({ message: 'No data to export' });
      }
    } else {
      res.json(results);
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
