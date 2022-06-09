const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });
const app = require('./app');
//console.log(process.env.PORT);

const database = process.env.MONGODB_URL.replace('<PASSWORD>', process.env.PASSWORD);
mongoose.connect(database, {})

mongoose.connection.once('open', () => console.log('DB connection successfully established....'));
mongoose.connection.on('error', () => console.log('DB connection error'));

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`listening on port ${port}...`);
});
