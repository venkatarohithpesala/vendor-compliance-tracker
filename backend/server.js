import app from "./src/app.js";
import sequelize from "./src/config/db.js";

const PORT = process.env.PORT;

(async () => {
    try {
        // Database Connection
        await sequelize.authenticate();
        console.log("MySql Connected Successfully");

        //Start server
        app.listen(PORT, () => {
            console.log(`Server running at ${PORT}`);
        });
    } catch (error) {
        console.error("Database Connection Failed", error);
    }
} 
)();