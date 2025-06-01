const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config(); // Ensure .env variables are loaded

// Use the provided connection string directly
const uri = "mongodb+srv://Lockinex:UnoDos12@tiendaanime.pn9hdpr.mongodb.net/";
const dbName = "tienda_anime"; // As specified by the user

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let db;

async function connectDB() {
  if (db) {
    return db;
  }
  try {
    await client.connect();
    console.log('Conexión a MongoDB exitosa.');
    db = client.db(dbName);
    return db;
  } catch (err) {
    console.error('Error al conectar a MongoDB:', err);
    process.exit(1); // Exit process with failure
  }
}

module.exports = connectDB;