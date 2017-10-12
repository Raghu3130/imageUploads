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
      var tran={};

      for (var i = 0; i < photos.length; i++) {
        Upload.upload({
            url: 'https://image-mandar.herokuapp.com/upload',
            data: { file: photos[i] }
          })
          .then(function(res) {
            console.log(res);
            ViewModel.paths.push({ path: res.data.data.path,
            name:res.data.data.name });
            
          })
          .catch(function(err) {

          });
          
          

      }

    }

     function closeDialog() {
      ViewModel.paths = [];
      DialogService.cancel();
    }

    $scope.submit=function () {
       console.log(ViewModel.paths);
      if (ViewModel.paths && ViewModel.paths.length > 0) {

        ViewModel.paths.forEach(function(path) {
              ViewModel.photoDetail.path.push(path);
          
        });

        // if (ViewModel.isDBEdit && ViewModel.paths[0].sm != undefined) {
        //   ViewModel.photoDetail.$$isEdit = true;
        //   ViewModel.photoDetail.path = ViewModel.paths[0];
        // } else {
        //   ViewModel.photoDetail.path = ViewModel.paths;
        // }

        $http.post('https://image-mandar.herokuapp.com/submit',ViewModel.photoDetail).then(function(response){
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
