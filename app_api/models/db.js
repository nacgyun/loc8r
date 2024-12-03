const mongoose = require('mongoose');
const readline = require('readline')
mongoose.set("strictQuery", false);

const dbPassword = process.env.MONGODB_PASSWORD;
const dbURI = `mongodb+srv://nacgyun01:1234@cluster0.yya38tn.mongodb.net/Loc8r`


mongoose.connect(dbURI);
mongoose.connection.on('connected', () => {
 console.log(`Mongoose connected to ${dbURI}`);
});
mongoose.connection.on('error', err => {
 console.log(`Mongoose connection error: ${err}`);
});
mongoose.connection.on('disconnected', () => {
 console.log('Mongoose disconnected');
});
const gracefulShutdown = async(msg) => {
    try {
        await mongoose.connection.close(); // 비동기적으로 연결 종료
        console.log(`Mongoose disconnected through ${msg}`);
    } catch (error) {
        console.error(`Error during Mongoose disconnection: ${error}`);
    }
};
// For nodemon restarts
process.once('SIGUSR2', () => {
 gracefulShutdown('nodemon restart', () => {
 process.kill(process.pid, 'SIGUSR2');
 });
});
// For app termination
process.on('SIGINT', () => {
 gracefulShutdown('app termination', () => {
 process.exit(0);
 });
});
// For Heroku app termination
process.on('SIGTERM', () => {
 gracefulShutdown('Heroku app shutdown', () => {
 process.exit(0);
 });
});

require('./locations');
require('./users')