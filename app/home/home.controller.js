(function () {
    'use strict';

    angular
        .module('app')
        .controller('Home.IndexController', Controller);

    function Controller(UserService,PostService,FlashService,$rootScope,$scope) {
        var vm = this;
        var likes = 0;
        $scope.newPost = $scope.postarea= $scope.comment= '';
        $scope.posts   = [] ;
        $scope.users = [];
        $scope.like = true;

        vm.user = null;
        vm.savePost = savePost;
        vm.clearAll = clearAll;
        vm.loadPosts = loadPosts;

        initController();

        function initController() {
            // get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;                
                loadPosts ();
            });

            UserService.GetAll().then(function(response){
                if(response.length >0){
                    angular.forEach(response,function(item){                        
                        $scope.users.push(item);
                    })
                }
            });         
        }

        function loadPosts () {                         
            $scope.posts = []; 
            PostService.GetPosts(vm.user.username).then(function(response) {  
                if(response.length >0){
                    angular.forEach(response,function(item){                      
                        $scope.posts.unshift(item);
                    })
                }
            })
            .catch(function (error) {
                FlashService.Error(error);
            });
        }

        function savePost(){
            var postObj = {
                username : vm.user.username,
                post : $scope.newPost , 
                lc : [{
                    username : vm.user.username,
                    like : false ,
                    comment : ''
                }]
            }

            // save post of the user
            PostService.SaveUserPost(postObj).then(function(response) {      
                $scope.posts.unshift(response);
                $scope.newPost='';
            })
            .catch(function (error) {
                FlashService.Error(error);
            });
            
        }

        $scope.deletePost = function(post){
            PostService.DeleteUserPost(post._id).then(function(response) { 
                if(response){
                    loadPosts();
                }
            })
            .catch(function (error) {
                FlashService.Error(error);
            });
        }

        $scope.editPost = function(post , action){
            !$scope.like;
            var postObj = {};
            if(action === 'lc'){
                postObj = {
                    action : action ,
                    post : post,
                    lc : {
                        username : vm.user.username,
                        like : $scope.like,
                        comment: $scope.comment
                    }
                }
            }
            if(action === 'edit'){
                postObj = {
                    action : action ,
                    post : post
                }
            }            
            PostService.UpdateUserPost(postObj).then(function(response){
                if(response){
                    $scope.post = response;
                }
            })
            .catch(function (error) {
                FlashService.Error(error);
            });
        }

        $scope.follower =function(user){
            var userObj = {
                id: vm.user.username,
                user: user
            }
            UserService.FollowUser(userObj).then(function(){
                FlashService.Success('Now Following:'+user.firstName);
            })
            .catch(function (error) {
                FlashService.Error(error);
            });
        }

        function clearAll () {        
            $scope.newPost = '';         
        }
    }

})();