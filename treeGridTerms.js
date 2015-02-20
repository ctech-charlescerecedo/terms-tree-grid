/*
 * termGridTree v1.0.0
 * Homepage: https://github.com/ctech-charlescerecedo/terms-tree-grid
 * Copyright 2015 Chen Tech, Inc.
*/


/*
 * Controller
*/
(function() {
  var app, deps;

  deps = ['treeGrid', 'ngStorage'];

  app = angular.module('treeGridTest', deps);

  app.factory('termService', function($http){
	console.log("termService Called");
  });

  app.controller('treeGridController', function($http, $scope, $timeout, $localStorage, termService) {
    var tree;
    var rawTreeData =[{}];
    var search_array = [];
	
    $scope.favorite = "fav";	
    $scope.page = 0;
    $scope.limit1 = 1;
    $scope.limit2 = 10;
 
    $scope.next = function(){
	$scope.page++;
	//$localStorage.terms = $scope.terms;
	$scope.limit1 = $scope.limit1 + 10;
	$scope.limit2 = $scope.limit2 + 10;
	$scope.searchTerm();
	
    }
    $scope.prev = function(){
	if($scope.page == 1){
		alert("Already at the begining!");
	}else{
		$scope.page--;
		$scope.limit1 = $scope.limit1 - 10;
		$scope.limit2 = $scope.limit2 - 10;
		$scope.searchTerm();
	}
    }

    // Call Term Service
    $scope.fn_search = function(){
  	$http.defaults.useXDomain = true;  // Enable CORS cross domains
	$scope.loading = true; // Let loading button know we are starting
	if($scope.page == 0){
		$scope.page = 1;
		$scope.limit1 = 1;
		$scope.limit2 = 10;
	}

	if($scope.favorite == "fav"){
		//console.log("favorite selected");
		var reg = /^\d+[.]+\d+$/;
		if(reg.test($scope.searchValue)){
			return $http.get("http://terms.azurewebsites.net/api/term/" + $scope.searchValue + "/codenumber/" + $scope.limit1 + "/" + $scope.limit2).
                                success(function(data){
                                        return data;
                                }).
                                error(function(data, status, headers, config){
                                        console.log(status);
                                        console.log(data);
                                        console.log(headers);
                                        console.log(config);
                                        $scope.loading = false;  // Let loading button know we are done 
                                });
		}else{
			return $http.get("http://terms.azurewebsites.net/api/term/" + $scope.searchValue + "/codename/" + $scope.limit1 + "/" + $scope.limit2).
                                success(function(data){
                                        return data;
                                }).
                                error(function(data, status, headers, config){
                                        console.log(status);
                                        console.log(data);
                                        console.log(headers);
                                        console.log(config);
                                        $scope.loading = false;  // Let loading button know we are done 
                                });
		}
	}else{
		//console.log("imo selected");
		return $http.get("http://terms.azurewebsites.net/api/term/" + $scope.searchValue + "/10/" + $scope.page).
			success(function(data){
				return data;
			}).
                         error(function(data, status, headers, config){
                                console.log(status);
                                console.log(data);
                                console.log(headers);
                                console.log(config);
                         	$scope.loading = false;  // Let loading button know we are done 
                         });
	}
    }

    // Search Function
    $scope.searchTerm = function(actionText){
	
	
	// Reset the search string and page number
	if(typeof actionText !== 'undefined'){
		actionText = actionText.replace(/[:<>;\^+-_!&*='`~@#\$)(,%\/\\]/g,'');
		actionText = actionText.trim();
		console.log(actionText);
		$scope.searchValue = actionText;
		$scope.page = 0;
	}

	if(typeof search_array[$scope.page] == 'undefined'){	
	    $scope.fn_search().then(function(resp){
		$scope.terms = resp.data.terms;
        	rawTreeData = $scope.terms;
		//console.log(rawTreeData);
    		myTreeData = getTree(rawTreeData, 'Id', 'ParentTermId');
    		$scope.tree_data = myTreeData;
		$scope.loading = false;  // Let loading button know we are done 
		console.log($scope.tree_data);
		search_array[$scope.page] = $scope.tree_data;   
    	    });
	}else{
		$scope.tree_data = search_array[$scope.page];
	}
    }

    var myTreeData = getTree(rawTreeData, 'Id', 'ParentTermId');
    $scope.tree_data = myTreeData;    
    $scope.my_tree = tree = {};
    $scope.expanding_property = "Code";
    
    //{ field: "CodeSystemId"},
    $scope.col_defs = [
	{ field: "CodeName"},
    	{ field: "Description"}
    ];
    $scope.my_tree_handler = function(branch){
    	console.log('you clicked on', branch);
	$scope.branch = branch;
    }
   

function getTree(data, primaryIdName, parentIdName){
	if(!data || data.length==0 || !primaryIdName ||!parentIdName)
		return [];
	var tree = [],
		rootIds = [],
		item = data[0],
		primaryKey = item[primaryIdName],
		treeObjs = {},
		parentId,
		parent,
		len = data.length,
		i = 0;


	// Do Root Nodes first	
	while(i<len){
		item = data[i++];  // object
		primaryKey = item[primaryIdName]; // Id Guid			
		treeObjs[primaryKey] = item; // use Id key to store object
		parentId = item[parentIdName]; // ParentTermId Guid or empty string
		item = getCodeName(item);
		if(!parentId){
			rootIds.push(primaryKey);
		}
	}
	i=0;
	// Do child nodes
	while(i<len){
		item = data[i++];  // object
		primaryKey = item[primaryIdName]; // Id Guid			
		treeObjs[primaryKey] = item; // use Id key to store object
		parentId = item[parentIdName]; // ParentTermId Guid or empty string
		item = getCodeName(item);
		if(parentId){
			parent = treeObjs[parentId];  // bug parentId is "" has multiple	
			if(parent.children){
				parent.children.push(item);
				//console.log(item.CodeSystemId);
			}
			else{
				parent.children = [item];
				//console.log(item.CodeSystemId);
			}
		}

	}

	for (var i = 0; i < rootIds.length; i++) {
		tree.push(treeObjs[rootIds[i]]);
	};

	return tree;
}

 

function getCodeName(item){

		if(item.CodeSystemId == 70){
			item.CodeName = "IMO LEXICAL Code";
		}else if(item.CodeSystemId == 71){
			item.CodeName = "ICD-9";
		}else if(item.CodeSystemId == 72){
			item.CodeName = "SNOMED CT";
		}else if(item.CodeSystemId == 73){
			item.CodeName = "ICD-10";
		}else if(item.CodeSystemId == 74){
			item.CodeName = "ICD-10CM_NON_SPECIFIC_CODE";
		}else if(item.CodeSystemId == 75){
			item.CodeName = "ICD-9_SECONDARY-1";
		}else if(item.CodeSystemId == 76){
			item.CodeName = "ICD-9_SECONDARY-2";
		}else if(item.CodeSystemId == 77){
			item.CodeName = "ICD-9_SECONDARY-3";
		}else if(item.CodeSystemId == 78){
			item.CodeName = "ICD-9_SECONDARY-4";
		}else if(item.CodeSystemId == 79){
			item.CodeName = "ICD-10_SECONDARY-1";
		}else if(item.CodeSystemId == 80){
			item.CodeName = "ICD-10_SECONDARY-2";
		}else if(item.CodeSystemId == 81){
			item.CodeName = "OBSTERMS_CHENMEDICAL";
		}else if(item.CodeSystemId == 82){
			item.CodeName = "ICD-10_SECONDARY-3";
		}else if(item.CodeSystemId == 83){
			item.CodeName = "ICD-10_SECONDARY-4";
		}else if(item.CodeSystemId == 84){
			item.CodeName = "MeSH";
		}else if(item.CodeSystemId == 85){
			item.CodeName = "LOINC - Logical Observation Identifiers Names and Codes";
		}else if(item.CodeSystemId == 86){
			item.CodeName = "RxNorm";
		}else if(item.CodeSystemId == 87){
			item.CodeName = "IMO Classes";
		}else if(item.CodeSystemId == 88){
			item.CodeName = "Definition of Lexcial Code";
		}else{
			item.CodeName = "N/A";
		}
	return item;
}





  });

}).call(this);



/*
 *
 * jQuery Ladda Button Loader
 *
*/

//Ladda.bind('.progress-loading button', {timeout:7000});
Ladda.bind('input[type=submit]');

// Loading Timer, done when scope.loading set to false
function loading_timer(ladda){
		ladda.start();
		setTimeout(function(){
	            var runTimes = 0;
		    function wait(){
			if(angular.element("#angular_treeGridController").scope().loading == true){
				setTimeout(function(){
					runTimes++;
					//console.log(runTimes);
					wait();
				}, 300);
			}else{
				ladda.stop();	
			}	
		    }
		    wait();
		}, 100);
}

// Buttons for Searching, Next and Previous
$(function(){
	$('#search_text').keypress(function(handler) {
		//console.log(handler);
		// User pressed the Enter Key to Search
		if(handler.keyCode == 13){
			$('#search_submit').trigger("click");
		}
	});
	$('#search_submit').click(function() {
		var l = Ladda.create(this);
		var search_text = $('#search_text').val();
		console.log(search_text.length);
		if(search_text.length == 0){
			alert("No search term string entered.");
		}else{
			console.log("start searching...");
			angular.element("#angular_treeGridController").scope().searchTerm(search_text);
			loading_timer(l);	
		}
	});
	$('#search_next_submit').click(function(){
		var l = Ladda.create(this);
		//console.log("calling next...");
		loading_timer(l);
	});
	$('#search_prev_submit').click(function(){
		var l = Ladda.create(this);
		//console.log("calling prev...");
		loading_timer(l);
	});
});
