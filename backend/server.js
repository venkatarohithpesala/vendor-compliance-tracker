import app from "./src/app.js";
import { initializeDatabase } from "./src/database/init.js";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT;

(async () => {
  try {
    // Initialize database (includes connection, sync, and seeding)
    await initializeDatabase();

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Server initialization failed:', error);
    process.exit(1);
  }
})();
