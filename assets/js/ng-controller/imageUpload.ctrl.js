(function () {
  app.controller('imageUploadController', ['$scope', '$http', 'BASE_URL','widgetServices', 'Upload', '$timeout',
    function ($scope,  $http, BASE_URL,widgetServices,Upload, $timeout) {
    console.log("imageUploadController");
    var ViewModel=this;
    ViewModel.photoSelected = false;
    ViewModel.photoUploadInProgress = false;
    ViewModel.closeDialog = closeDialog;
    $scope.startUpload=startUpload;
     ViewModel.photoDetail = {
      path: []
    };
    
    ViewModel.paths = [];

    $scope.active=true;

    //   function initWatch() {
    //   $scope.$watch('ViewModel.photo', function() {
    //     console.log("photos",ViewModel.photo);
    //    // console.log(ViewModel.paths.length, ViewModel.isForEdit);
    //     if (ViewModel.photo && ViewModel.photo.length) {
    //       ViewModel.photoSelected = true;
    //       if (ViewModel.isForEdit && ViewModel.paths.length >= 1 && localsData.$$isForPhoto) {
    //         ToastService.info('Only one photo can upload in edit mode');
    //         return;
    //       } else {
    //         console.log(ViewModel.photo);
    //         if (ViewModel.isForEdit && ViewModel.photo.length >= 2 && localsData.$$isForPhoto) {
    //           ToastService.info('Only one photo can upload in edit mode');
    //           return;
    //         } else {
    //           startUpload(ViewModel.photo);
    //         }
    //       }
    //     }
    //   });
    // }

    function startUpload(photos) {
      console.log(photos.length);
      ViewModel.photoUploadInProgress = true;


      for (var i = 0; i < photos.length; i++) {

        Upload.upload({
            url: 'http://localhost:1338/upload',
            data: { file: photos[i] }
          })
          .then(function(res) {
            console.log("res:", res);
            ViewModel.url="https://deliverydon-dev.s3-ap-southeast-1.amazonaws.com/catalog/xs_"+res.data.imagePath;
            
            // console.log('File uploaded successfully', res.data.data[0].fd);
            // path_array = (res.data.data[0].fd).split('/');
            // = path_array[7] + '/' + path_array[8] || ""
            ViewModel.paths.push({ path: res.data.data });
            
          })
          .catch(function(err) {

          })
          .finally(function() {
            ViewModel.photoUploadInProgress = false;
          });

      }

    }

     function closeDialog() {
      ViewModel.paths = [];
      DialogService.cancel();
    }

    $scope.submit=function () {
       console.log("djfhdg",ViewModel.paths);
      if (ViewModel.paths && ViewModel.paths.length > 0) {

        ViewModel.paths.forEach(function(path) {
          if (path.$$isEdit) {
            ViewModel.photoDetail.$$isEdit = true;
            ViewModel.photoDetail.path = path.path;
          } else {
            if (ViewModel.isForEdit) {
              ViewModel.photoDetail.path = path.path;
            } else {
              ViewModel.photoDetail.path.push(path.path);
            }

          }
        });

        // if (ViewModel.isDBEdit && ViewModel.paths[0].sm != undefined) {
        //   ViewModel.photoDetail.$$isEdit = true;
        //   ViewModel.photoDetail.path = ViewModel.paths[0];
        // } else {
        //   ViewModel.photoDetail.path = ViewModel.paths;
        // }

        $http.post('http://localhost:1338/submit',ViewModel.photoDetail).then(function(response){
          $scope.url=response.data;
          if(response.data){
            $scope.active=false;
            toastr.success("Download Excel");
          }
        }).catch(function(err){

         });
        
      } else {
        return;
      }


    }
    $scope.csvSubmit=function(url){
      window.location.href=url;
    }
}]);
})(); // IIFE
