var q = require('q');
var gm = require('gm'); // Working on Local
var path = require('path');
var AWS = require('aws-sdk');
var mime = require('mime');
var json2csv = require('json2csv');
var fs = require('fs');
AWS.config.loadFromPath('config/aws_config.json');
var s3bucket = new AWS.S3({ params: { Bucket: 'images' } });




function DbService() {

  return {
    
    jsontoExcel: jsontoExcel,
    uploadImages:_uploadImages,
    savePhotosToAws:_savePhotosToAws

    };


  function jsontoExcel(export_data) {
    var dataArray=[];
    export_data.path.forEach(function(data,index){
      var t={
        index:index,
        path:data
      };
      dataArray.push(t);
    });
    console.log(dataArray);
    var export_fields = ['index','path'];
    var randomString = function (length) {
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
    };

    var filename = randomString(5);

    var csv = json2csv({ data: dataArray, fields: export_fields });
    console.log(csv);
    fs.writeFile('.tmp/public/uploads/' + filename + '.csv', csv, function (err) {
      if (err) {

        throw err;
      }
    });
    var filepath =  filename + '.csv';
    var file={};
    file.name=filepath;
    file.path=path.resolve(sails.config.appPath, '.tmp/public')+"/uploads/"  + filepath;
    _uploadDocToAWS(file);
    var r='https://s3.ap-south-1.amazonaws.com/raghu-upload/uploads/'+filepath;
    return r;
  }




  
     function _uploadImages(file) {
    var deferred = q.defer();
    file.upload({
      dirname: path.resolve(sails.config.appPath, '.tmp/public/uploads')
    }, function(err, files) {
      if (err) {
        deferred.reject(err);
      }
      var imgpath = path.parse(files[0].fd);
      deferred.resolve('uploads/' + imgpath.base);
    });
    return deferred.promise;
  }
    function _savePhotosToAws(details) {
    var deferred = q.defer();
    var uploadImageData = {};
    // photos
    if (details && details.path.length) {
      for (var i = 0; i < details.path.length; i++) {

          var phtPath = {};
          uploadImageData.filePath = path.resolve(sails.config.appPath, '.tmp/public') + '/' + details.path[i];
          uploadImageData.modelName = 'images';
          // var fileName = (details.photos[i].path).split('/');
          var fileName = path.parse(details.path[i]);
          // uploadImageData.uploadFileName = fileName[fileName.length - 1];
          uploadImageData.uploadFileName = fileName.base;
          phtPath = 'https://s3.ap-south-1.amazonaws.com/raghu-upload/images/'+uploadImageData.uploadFileName;

          details.path[i] = phtPath;

          // console.log(details.photos);

          // save photos to aws
          _uploadImagesToAWS(uploadImageData);

          // blank tmp objects
          uploadImageData = {};
          phtPath = {};
        
      }

      // console.log("final photo array: ", details.photo);
    }



    // console.log("ENd AWS");
    deferred.resolve(details);

    return deferred.promise;

  }
 function _uploadImagesToAWS(data) {
  console.log("jhgd",data);
    var data = data;
    var successCount = 0;
    var failureCount = 0;
    
      gm(data.filePath)
        .stream(function(err, stdout, stderr) {
          var buf = new Buffer('');
          stdout.on('data', function(data) {
            buf = Buffer.concat([buf, data]);
          });
          stdout.on('end', function(res) {
            var data1 = {
              Bucket: "raghu-upload",
              Key:data.modelName+'/'+data.uploadFileName,
              ACL: 'public-read',
              Body: buf,
              ContentType: mime.lookup(data.uploadFileName)
            };
            
            s3bucket.putObject(data1, function(err, rese) {

              if (!err) {
                successCount++;
              }
              if (err) {
                console.log(err);
                failureCount++;
              }
              
            });
          });
        });
       
    
    // return deferred.promise;
    return;
  }
  function _uploadDocToAWS(data) {
  console.log("jhgd",data);
    var data = data;
    var successCount = 0;
    var failureCount = 0;
    
      gm(data.path)
        .noProfile()
        .stream(function(err, stdout, stderr) {
          var buf = new Buffer('');
          stdout.on('data', function(data) {
            buf = Buffer.concat([buf, data]);
          });
          stdout.on('end', function(res) {
            var data1 = {
              Bucket: "raghu-upload",
              Key:"uploads/"+data.name,
              ACL: 'public-read',
              Body: buf,
              ContentType: mime.lookup(data.name)
            };
            console.log(data1);
            s3bucket.putObject(data1, function(err, rese) {
              console.log(rese);
              if (!err) {
                successCount++;
                console.log(successCount,"fdfd");
              }
              if (err) {
                console.log(err);
                failureCount++;
              }
              
            });
            
          });
        });
       
    
    // return deferred.promise;
    return;
  }




}
module.exports = DbService();
