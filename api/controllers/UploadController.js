/**
 * UploadController
 *
 * @description :: Server-side logic for managing uploads
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	uploadFiles: function (req, res) {
  
      console.log("dfd");
    file = req.file('file');


    DbService.uploadImages(file)
      .then(function(response) {
        
        return res.ok(ResponseService._customResponse(true, 'Files saved successfully', response, response.length));
      })
      .catch(function(err) {
        console.log(err);
        return res.badRequest(ResponseService._customResponse(false, 'Files does not exist', err));
      });

    // req.file('files').upload({

    //  dirname: path.resolve(sails.config.appPath, 'assets/images')

    // } ,function(err, files) {

    //   if (err) {
    //     return res.badRequest(ResponseService._customResponse(false, 'Files does not exist', err));
    //   }

    //   return res.ok(ResponseService._customResponse(true, 'File/s saved successfully', files, files.length));

    // });
  },
  submit:function(req,res){
    var allParams=req.allParams();
    console.log(allParams);
    DbService.savePhotosToAws(allParams).then(function(response){
      return DbService.jsontoExcel(response);
    }).then(function(response){
      res.send(response);
    })
    .catch(function(err){
      console.log(err);
    });

  },
  index:function(req,res){
    console.log("err");

   return res.view('index');
  }
};

