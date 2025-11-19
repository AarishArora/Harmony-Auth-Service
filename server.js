import app from "./src/app.js";
import connectDB from "./src/db/db.js";
import {connect} from "./src/broker/rabbit.js"
import config from "./src/config/config.js"

connectDB();
connect();

const PORT = config.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Auth Server is running on port ${PORT}`);
})