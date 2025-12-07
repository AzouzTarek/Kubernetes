const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques du frontend
app.use(express.static(path.join(__dirname, "public")));


// Connexion MongoDB
const MONGO_URI = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB_NAME}?authSource=admin&replicaSet=rs0`;



mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// Définir le modèle
const DataSchema = new mongoose.Schema({
  name: String,
  email: String
});
const Data = mongoose.model("Data", DataSchema);

// API Routes

app.get("/api/list", async (req, res) => {
  try {
    const items = await Data.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Error fetching data" });
  }
});

app.post("/api/submit", async (req, res) => {
  const { name, email } = req.body;
  try {
    const newItem = new Data({ name, email });
    await newItem.save();
    res.status(201).json({ message: "Data saved successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error saving data" });
  }
});



// Servir index.html pour toute autre route
// ✅ Compatible Express 5 et Node 22
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


// Lancer le serveur
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
