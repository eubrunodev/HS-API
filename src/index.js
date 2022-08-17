const express = require("express");

require('dotenv').config()
const PORT = process.env.PORT

const app = express();


app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.get('/', (req, res) => {
    res.send('Ok');
})


require('./app/controllers/index')(app);

app.listen(PORT, () => {
    console.log('Estou rodando na port '+PORT);
});