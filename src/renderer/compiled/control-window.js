"use strict";angular.module("app.core",[]);
"use strict";angular.module("app.projectionControl",[]).constant("SUPPORTED_IMAGE_TYPES",new Set(["apng","bmp","gif","jpe","jpeg","jpg","png","webp"]));
"use strict";angular.module("app",["ngSanitize","app.core","app.projectionControl"]).decorator("$rootScope",function decorateRootScope($delegate){$delegate.__proto__.safeApply=function safeApplyChange(expression){if($delegate.$$phase){this.$evalAsync(expression)}else{this.$apply(expression)}};return $delegate});
"use strict";angular.module("app.core").factory("ImageForProjection",[function ImageForProjectionModel(){function equals(expected){const actual=this;let areEqual=actual.src===expected.src;return areEqual}function makeImageForProjection(file){return{src:path.normalize(file.path),preset:null,equals}}return makeImageForProjection}]);
"use strict";angular.module("app.projectionControl").component("configurationPanel",{controller:"ConfigurationPanelController",templateUrl:"projection-control/configuration-panel/configuration-panel.tpl.html"});
"use strict";angular.module("app.projectionControl").controller("ConfigurationPanelController",["$scope","ProjectionControlService",function ConfigurationPanelCtrl($scope,ProjectionControlService){const vm=this,{ipcRenderer}=electron;vm.isProjectionEnabled=false;vm.ctrlPnlSvcData=ProjectionControlService.data;vm.objectFitOptions=[{label:"Contain",value:"contain"},{label:"Cover",value:"cover"},{label:"Fill",value:"fill"},{label:"Scale down",value:"scale-down"}];vm.positionPresets=[{label:"Centered",value:"50% 50%"},{label:"Center top",value:"center top"},{label:"Advanced",value:"custom"}];vm.objectFitPreset=vm.positionPresets[0];vm.toggleProjection=toggleProjection;vm.imagePositionPresetChanged=imagePositionPresetChanged;function toggleProjection(){ipcRenderer.send("toggleProjection",vm.isProjectionEnabled);if(vm.isProjectionEnabled){ipcRenderer.once("projectionCanvasInitialized",()=>{ipcRenderer.send("setProjectedImage",ProjectionControlService.data.imageProjected)})}}function imagePositionPresetChanged(){const{objectFitPreset,positionPresets}=vm;if(objectFitPreset!==positionPresets[positionPresets.length-1]){ProjectionControlService.data.imageProjected.objectPosition=objectFitPreset}}}]);
"use strict";angular.module("app.projectionControl").component("imagePreview",{controller:"ImagePreviewController",templateUrl:"projection-control/image-preview/image-preview.tpl.html"});
"use strict";angular.module("app.projectionControl").controller("ImagePreviewController",["$scope","$element","ProjectionControlService",function ImagePreviewCtrl($scope,$element,ProjectionControlService){const vm=this,{ipcRenderer}=electron;let screenFrameElm=null;vm.$onInit=$onInit;vm.ctrlPnlSvcData=ProjectionControlService.data;vm.canvasHeight=null;function $onInit(){screenFrameElm=$element[0].querySelector("#screenFrame")}function _handleCanvasDimensionChange(canvasDimensions){const{height:originalHeight,width:originalWidth}=canvasDimensions;vm.canvasHeight=originalHeight/originalWidth*screenFrameElm.offsetWidth+"px";vm.canvasWidth=originalWidth/originalHeight*screenFrameElm.offsetHeight+"px"}$scope.$on("projectionCanvasDimensionChanged",_handleCanvasDimensionChange);ipcRenderer.on("projectionCanvasInitialized",(event,canvasDimensions)=>{$scope.safeApply(()=>{_handleCanvasDimensionChange(canvasDimensions)})})}]);
"use strict";angular.module("app.projectionControl").component("imageThumbnails",{controller:"ImageThumbnailsController",templateUrl:"projection-control/image-thumbnails/image-thumbnails.tpl.html"});
"use strict";angular.module("app.projectionControl").controller("ImageThumbnailsController",["$element","ProjectionControlService",function ImageThumbnailsCtrl($element,ProjectionControlService){const vm=this,element=$element[0],projectionCtrlSvc=ProjectionControlService.data;vm.imagesToProject=projectionCtrlSvc.imagesToProject;vm.$postLink=$postLink;vm.removeImageForProjection=ProjectionControlService.removeImageForProjection;vm.thumbnailClicked=thumbnailClicked;function _setUpScrollWheelHelper(){let scrollableAreaElement=element.querySelector("#scrollableArea");scrollableAreaElement.addEventListener("wheel",function wheelEventForElement(event){const{deltaY}=event;if(deltaY!==0){scrollableAreaElement.scrollLeft+=deltaY}})}function _setUpNativeDragAndDrop(){let thumbnailListElement=element.querySelector("#thumbnailList"),itemCurrentlyDragged=null;const CSS_CLASSES={BEING_DRAGGED:"is-dragged",ACCEPTS_DROP:"accepts-drop"};thumbnailListElement.addEventListener("dragstart",function dragStartListener(event){const{target}=event;itemCurrentlyDragged=target;event.stopPropagation();target.classList.add(CSS_CLASSES.BEING_DRAGGED);event.dataTransfer.effectAllowed="move"});thumbnailListElement.addEventListener("dragend",function dragEndListener(event){itemCurrentlyDragged=null;const{target}=event;target.classList.remove(CSS_CLASSES.BEING_DRAGGED)});thumbnailListElement.addEventListener("dragover",function dragOverListener(event){if(event.target===itemCurrentlyDragged){return}event.preventDefault();event.dataTransfer.dropEffect="move"});thumbnailListElement.addEventListener("dragenter",function dragEnterListener(event){const{target}=event;if(target===itemCurrentlyDragged){return}target.classList.add(CSS_CLASSES.ACCEPTS_DROP)});thumbnailListElement.addEventListener("dragleave",function dragLeaveListener(event){let{target}=event;target.classList.remove(CSS_CLASSES.ACCEPTS_DROP)});thumbnailListElement.addEventListener("drop",function dropListener(event){const{target}=event;let sourceImg=itemCurrentlyDragged.querySelector("img"),targetImg=target.querySelector("img"),targetImgUrl=targetImg.src;targetImg.src=sourceImg.src;sourceImg.src=targetImgUrl;target.classList.remove(CSS_CLASSES.ACCEPTS_DROP)})}function $postLink(){_setUpScrollWheelHelper();_setUpNativeDragAndDrop()}function thumbnailClicked(image){projectionCtrlSvc.imageProjected=image}}]);
"use strict";angular.module("app.projectionControl").component("projectionControl",{controller:"ProjectionControlController",templateUrl:"projection-control/projection-control.tpl.html"});
"use strict";angular.module("app.projectionControl").controller("ProjectionControlController",["$scope","$element","ProjectionControlService","SUPPORTED_IMAGE_TYPES",function ProjectionControlCtrl($scope,$element,ProjectionControlService,SUPPORTED_IMAGE_TYPES){const vm=this,DYNAMIC_CSS_CLASSES={DROP_DATA_SUPPORTED:"can-take-drop"};let floatingAlerts=[];vm.showDropSupportedMessage=false;vm.floatingAlerts=floatingAlerts;vm.$onInit=$onInit;vm.$doCheck=$doCheck;function _isASupportedImageType(MIMEType){return SUPPORTED_IMAGE_TYPES.has(mime.getExtension(MIMEType))}function _isDropDataSupported(dataTransfer){const{items}=dataTransfer;let itemsIdx=items.length,isSupported=itemsIdx>0;while(itemsIdx-->0&&isSupported){const item=items[itemsIdx];isSupported=item.kind==="file"&&_isASupportedImageType(item.type)}return isSupported}function _showDropSupportedMessage(){vm.showDropSupportedMessage=true;$element.addClass(DYNAMIC_CSS_CLASSES.DROP_DATA_SUPPORTED)}function _hideDropSupportedMessage(){vm.showDropSupportedMessage=false;$element.removeClass(DYNAMIC_CSS_CLASSES.DROP_DATA_SUPPORTED)}function _setUpDropBehaviour(){let dragOverCounter=0;$element.on("dragenter",function dragEnterListener(event){++dragOverCounter;const{dataTransfer}=event;if(_isDropDataSupported(dataTransfer)){event.preventDefault();dataTransfer.effectAllowed=dataTransfer.dropEffect="link";$scope.safeApply(_showDropSupportedMessage)}}).on("dragover",function dragOverListener(event){const{dataTransfer}=event;if(_isDropDataSupported(dataTransfer)){event.preventDefault();dataTransfer.effectAllowed=dataTransfer.dropEffect="link"}}).on("dragleave",function dragLeaveListener(){--dragOverCounter;if(dragOverCounter===0){$scope.safeApply(_hideDropSupportedMessage)}}).on("drop",function dropEventListener(event){event.preventDefault();dragOverCounter=0;const{dataTransfer}=event;if(_isDropDataSupported(dataTransfer)){$scope.safeApply(()=>{_hideDropSupportedMessage();ProjectionControlService.addFileListToImagesForProjection(dataTransfer.files)})}})}function $onInit(){_setUpDropBehaviour()}function $doCheck(){}}]);
"use strict";angular.module("app.projectionControl").service("ProjectionControlService",[function ProjectionControlSvc(){const svc=new EventEmitter,{ipcRenderer}=electron,imagesToProject=[],dataToExpose={imageProjected:null,imagesToProject},serviceData=new Proxy(dataToExpose,{set(target,property,value){switch(property){case"imageProjected":ipcRenderer.send("setProjectedImage",value);break;}return Reflect.set(...arguments)}});svc.data=serviceData;svc.addFileListToImagesForProjection=addFileListToImagesForProjection;svc.addImagesForProjection=addImagesForProjection;svc.removeImageForProjection=removeImageForProjection;function _fileListToImageForProjection(files){return Array.from(files).map(file=>{return new Proxy({src:path.normalize(file.path),objectFit:"contain",objectPosition:"50% 50%"},{set(target){let result=Reflect.set(...arguments);ipcRenderer.send("setProjectedImage",target);return result}})})}function addImagesForProjection(images){imagesToProject.push(...images)}function addFileListToImagesForProjection(files){let images=_fileListToImageForProjection(files);addImagesForProjection(images)}function removeImageForProjection(image){let indexOfImageToRemove=imagesToProject.indexOf(image);if(indexOfImageToRemove>-1){let imageToRemove=imagesToProject[indexOfImageToRemove];imagesToProject.splice(indexOfImageToRemove,1);if(dataToExpose.imageProjected===imageToRemove){dataToExpose.imageProjected=null}}}return svc}]);
//# sourceMappingURL=control-window.js.map