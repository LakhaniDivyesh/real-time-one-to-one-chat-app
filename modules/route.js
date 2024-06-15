var express = require('express');
var router = express.Router();
var common = require("../config/common");
var conn = require("../config/database")
const md5 = require("md5")

//upload image
const multer = require('multer');


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});

var upload = multer({
    storage: storage
});

//APIs

//Login
router.get("/login", function (req, res) {

    res.render("../html/login.html", { error: [], email: "" });
    
});

//Login
router.post("/login-user", function (req, res) {
    var request = req.body

    var login = `select * from tbl_users where email = ? and password = ? and is_active = 1 and is_deleted = 0;`
    condition = [request.email, md5(request.password)]


    conn.query(login, condition, function (error, result) {
        if (error) {
            res.render("../html/login.html", { error: ["Oops, something want to wrong in login"], email: request.email })
        } else {
            if (result.length > 0) {
                req.session.email = request.email
                req.session.user_id = result[0].id
                res.redirect('/home')
            } else {
                res.render("../html/login.html", { error: ["Invalid email or password"], email: request.email })
            }
        }
    })

});

//signup
router.get("/signup", function (req, res) {

    res.render("../html/signup.html",{error:[],queryData:{}});

});

//signup
router.post("/signup-user",upload.single('profile_image'), function (req, res) {
    var request = req.body
    var queryData = {
        first_name: request.firstName,
        last_name: request.lastName,
        email: request.email,
        password: md5(request.password),
        profile_image: req.file.filename
    }

    common.checkEmail(request.email, function (response) {

        if (response) {
            res.render("../html/signup.html", { error: ["Email already exist!"], queryData: queryData })
        } else {

            var signup = `INSERT INTO tbl_users SET ?;`

            conn.query(signup, queryData, function (error, userData) {
                if (error) {
                    res.render("../html/signup.html", { error: ['Oops, something want to wrong in signup'],queryData:queryData});
                } else {
                    res.redirect('/login');
                }
            })
        }
    });


});

//home
router.get("/home", function (req, res) {

    if(req.session.email != undefined && req.session.email != "" && req.session.user_id != undefined && req.session.user_id != ""){
        var user = `select id,CONCAT(first_name," ",last_name) as name,profile_image from tbl_users where is_active = 1 and is_deleted = 0`
        conn.query(user,function (error, userData) {
            if (error) {
                console.log(error)
                res.redirect('/login');
            } else {
                res.redirect("/home/"+userData[0].id)
                // res.render("../html/home.html",{userData:userData});
            }
        })
        
    }else{
        res.redirect('/login');
    }
    

});

router.get("/home/:receiver_id", function (req, res) {

    if(req.session.email != undefined && req.session.email != "" && req.session.user_id != undefined && req.session.user_id != ""){
        var user = `select id,CONCAT(first_name," ",last_name) as name,profile_image from tbl_users where is_active = 1 and is_deleted = 0;
        select id,CONCAT(first_name," ",last_name) as name,profile_image from tbl_users where id = ${req.params.receiver_id} and is_active = 1 and is_deleted = 0;
        select (select CONCAT(u.first_name," ",u.last_name) as name from tbl_users u where m.sender_id = u.id) as sender_name,
        (select CONCAT(u.first_name," ",u.last_name) as name from tbl_users u where m.receiver_id = u.id) as receiver_name,DATE_FORMAT(m.created_at, "%d-%M-%Y %l:%i %p") as msg_time,m.*
        from tbl_message m where (m.sender_id = ${req.session.user_id} and m.receiver_id = ${req.params.receiver_id}) or (m.sender_id = ${req.params.receiver_id } and m.receiver_id = ${req.session.user_id});
        select id,CONCAT(first_name," ",last_name) as name,profile_image from tbl_users where id = ${req.session.user_id} and is_active = 1 and is_deleted = 0;`
        conn.query(user,function (error, userData) {
            if (error) {
                res.redirect('/login');
            } else {
                // req.redirect("/home/"+userData[0].id)
                res.render("../html/home.html",{userData:userData});
            }
        })
        
    }else{
        res.redirect('/login');
    }
    

});

router.get("/logout", function (req, res) {

    if(req.session.email != undefined && req.session.email != "" && req.session.user_id != undefined && req.session.user_id != ""){
        
        req.session.email = " ";
        req.session.user_id = " ";

        res.redirect('/login');
    }else{
        res.redirect('/login');
    }
    

});

// //home
// router.get("/home", function (req, res) {

//     if(req.session.email != undefined && req.session.email != "" && req.session.user_id != undefined && req.session.user_id != ""){
//         res.render("../html/home.html",);
//     }else{
//         res.redirect('/login');
//     }
    

// });



module.exports = router