// db.js (or db/index.js if you prefer a directory)
const mysql = require('mysql2');
const dbConfig = require('./db.config.js');

let connection;

function handleDisconnect() {
  connection = mysql.createConnection(dbConfig); // Recreate the connection

  connection.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow the server time to restart.
    else{
        console.log("Database reconnected")
    }
  });

  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is lost:
      handleDisconnect();                         // Automatic reconnect
    } else {                                      // Handle other errors appropriately
      throw err;
    }
  });
}

function connectToDatabase() {
  connection = mysql.createConnection(dbConfig);

  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to database:', err);
      return handleDisconnect(); // Handle initial connection error by trying to reconnect
    }
    console.log('Connected to MySQL database');
  });

    connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is lost:
      handleDisconnect();                         // Automatic reconnect
    } else {                                      // Handle other errors appropriately
      throw err;
    }
  });
}

function getConnection() {
  return connection;
}

module.exports = {
  connectToDatabase,
  getConnection
};