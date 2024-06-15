var conn = require('./database');

var common = {

    //check is email is already exits or not
    checkEmail : function(email,callback){

       var  q = `select id from tbl_users where email = ? and is_active = 1 and is_deleted = 0;`

        conn.query(q,email,function(error,result){
            if(!error && result.length > 0){
                callback(true);
            }
            else{
                callback(false);
            }
        })

    },

    //GET USER DETAILS
    getUser : function(id,callback){
        var user = `Select * from tbl_users where id = ?;`

        conn.query(user,id,function(error,result){
            if(!error && result.length > 0){
                callback(result[0]);
            }else{
                callback(null);
            }
        })
    },
    

};


module.exports = common;