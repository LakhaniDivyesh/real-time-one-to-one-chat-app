require('dotenv').config();
var conn = require("./config/database")
var express = require('express');
let app = express();

app.use(express.json());
app.use(express.urlencoded({extended : true}));

//ejs for html
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');


const bodyParser = require('body-parser')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}));

const session = require('express-session');
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
}));

//socket.io
const http = require("http").createServer(app);
const io = require("socket.io")(http);

io.on("connection",(socket)=>{
    socket.on("message",(msg)=>{
        var queryData = {
            sender_id : msg.sender_id,
            receiver_id : msg.receiver_id,
            msg : msg.message
        }
        var msg_insert = `insert into tbl_message set ?`

        conn.query(msg_insert,queryData,function (error, userData) {
            if (!error) {
                socket.broadcast.emit("message",msg);
            }
        })

    })
})


app.use('/public/images', express.static(__dirname + '/public/images'));

var auth = require("./modules/route");
app.use('', auth);


try {
    http.listen(process.env.PORT)
    console.log("server : " + process.env.PORT);
} catch (error) {
    console.log("failed" + error);
}