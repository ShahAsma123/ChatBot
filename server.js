const express = require('express');
const app = express();

app.use(express.static(__dirname)); // Serve static files

app.listen(5500, () => {
    console.log("Server running at http://127.0.0.1:5500/");
});
