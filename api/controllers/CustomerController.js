/**
 * CustomerController
 *
 * @description :: Server-side logic for managing customers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	login:function(req,res){
		res.view("login");
	},
	signin:function(req,res){
		var allParams=req.allParams();
		console.log(allParams);
		if(allParams.username=="Aman" && allParams.password=="123456"){
			req.session.Customer="Aman";
			return res.redirect("/upload-image")
		}else{
			return res.redirect('/');
		}
	},
	logout:function(req,res){
		req.session.Customer='';
		return res.redirect("/");
	}
};

