import app from "./app.js";
import sequelize from "./config/db.js";

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