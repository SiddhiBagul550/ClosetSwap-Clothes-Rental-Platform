const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../config.env") });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

async function run() {
  await mongoose.connect(DB);
  console.log("Connected to:", mongoose.connection.name);

  const collections = await mongoose.connection.db.collections();

  for (const collection of collections) {
    const result = await collection.deleteMany({});
    console.log(`Cleared ${collection.collectionName}: ${result.deletedCount} documents removed`);
  }

  await mongoose.disconnect();
  console.log("Done.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
