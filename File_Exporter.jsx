myInput();

var originalDoc
var targetDoc

var originalWidth 
var originalHeight 

var groupAmount
var myRoot

var desc
var descCheck 

var pathCorrect

var rdi_artLayers
var rdi_layerSets
var srcCopyTrgt


function myInput(){

    try
    {
        originalDoc = app.activeDocument
    }
    catch(err)
    {
        alert("Please open document first!")
        return
    }

    //set default variable
    groupAmount = app.activeDocument.layerSets.length     //default 
    originalWidth = app.activeDocument.width;
    originalHeight = app.activeDocument.height;
    originalDocMode = app.activeDocument.mode
    pathCorrect = true
    
    //window
    var myWindow = new Window("dialog","YHS's PS File_Exporter  v1.4"); 
    var mainGroup = myWindow.add("group");
    mainGroup.orientation = "row"
    var firstRowGroup = mainGroup.add("group");
    firstRowGroup.orientation = "column"
    firstRowGroup.alignChildren = "left"
    //radioBut:color
    var rdiGroup = firstRowGroup.add("group"); 
    rdiGroup.orientation = "row"
    rdiGroup.alignChildren = "left";
    rdiGroup.add("statictext", undefined, "Now color:   ")
    var rdi_RGB = rdiGroup.add("radiobutton",undefined,"RGB")
    var rdi_CMYK = rdiGroup.add("radiobutton",undefined,"CMYK")
    if(originalDocMode == DocumentMode.RGB)
    {
        rdi_RGB.value = true
    }
    else{
        rdi_CMYK.value = true
    }
    //radioBut:Export target
    var rdiTarget = firstRowGroup.add("group"); 
    rdiTarget.orientation = "row"
    rdiTarget.alignChildren = "left";
    // var myPanel = rdiTarget.add("panel", undefined, "export every")
    rdiTarget.add("statictext", undefined, "Export every:")
    rdi_artLayers = rdiTarget.add("radiobutton",undefined,"Layer")
    rdi_layerSets = rdiTarget.add("radiobutton",undefined,"Group")
    rdi_layerSets.value = true
    
    //radioBut:Resize
    var rdiResize = firstRowGroup.add("group"); 
    rdiResize.orientation = "row"
    rdiResize.alignChildren = "left";
    // var myPanel = rdiTarget.add("panel", undefined, "export every")
    rdiResize.add("statictext", undefined, "Resize and crop:")
    rdi_resize = rdiResize.add("radiobutton",undefined,"Yes")
    rdi_resizeNo = rdiResize.add("radiobutton",undefined,"No")
    rdi_resize.value = true
    

    //editText
    var myPathGroup = mainGroup.add("group");
    myPathGroup.orientation = "column"
    //save path preference

    //defined preference
    desc = new ActionDescriptor();
    
    try
    {
        descCheck = app.getCustomOptions("myPSSetting")
        newPath = descCheck.getString(1)
        myRoot = myPathGroup.add("edittext",undefined,newPath) //show path with saved preference     
    }
    catch(err)
    {
        myRoot = myPathGroup.add("edittext",undefined,"/Users/yhs/Desktop/export/") 
    }

    myRoot.characters =30;
    myRoot.active = true

    //button
    var mybutGroup = mainGroup.add("group");
    mybutGroup.orientation = "column"
    var but_export = mybutGroup.add('button',undefined,"Export");
    mybutGroup.add('button',undefined,"Cancel");  

    but_export.onClick =function(){
        
        callProcess();
        alert("Complete") //todo:check is sussce or not
    }

    myWindow.show();
 
}

function callProcess()
{
    
    //export layer or group
    if(rdi_artLayers.value)
    {
        groupAmount = app.activeDocument.artLayers.length    
    }   
    else
    {
        groupAmount = app.activeDocument.layerSets.length        
    }

    if(groupAmount==0)
    {
        if(rdi_artLayers.value) alert("There's no layer to export.")
        if(rdi_layerSets.value) alert("There's no group to export.")
    }

    //looping all layers or groups and call main function
    for (var index = 0; index < groupAmount; index++) {
        
        if(pathCorrect==true)
        {    
            
            mainProcess(index.toString());
        }
        else
        {
            alert("Please check your path.")            
            break
        }
    }

    pathCorrect=true //set true true for next excution
}


function mainProcess(_index){
    
    //-----duplicat and merge------
    var newDoc
    if(originalDocMode == DocumentMode.RGB)
    {
        newDoc = app.documents.add(originalWidth,originalHeight,300,"Untitled-1" +_index, NewDocumentMode.RGB) //add new doc  
    }
    else
    {
        //todo:use original resolution
        newDoc = app.documents.add(originalWidth,originalHeight,300,"Untitled-1" +_index, NewDocumentMode.CMYK) //add new doc  
    }
    app.activeDocument = originalDoc
    
    //layer or group
    if(rdi_artLayers.value==true)
    {
        srcCopyTrgt = app.activeDocument.artLayers[_index]//get layer
    }else
    {
        srcCopyTrgt = app.activeDocument.layerSets[_index]//get group            
    }
    
    var fileName = srcCopyTrgt.name 
    srcCopyTrgt.duplicate ( newDoc );//duplicate to new doc
    
    //-----del background layer-----
    app.activeDocument = newDoc //swtich back to target doc
    docLay = app.activeDocument.layers
    
    try
    {
        var bk = docLay.getByName ("背景")
        bk.remove()
    }
    catch(err){}
  
    
    try
    {
        var bk = docLay.getByName ("Background")
        bk.remove()
    }
    catch(err){}
    

    

    //-----Resize-----
    if(rdi_resize) 
    {
        app.activeDocument.trim(TrimType.TRANSPARENT,true,true,true,true)
    }
    

    //-----save file-----   
    app.activeDocument = newDoc //swtich back to target doc 
    fileRef = File( myRoot.text + "\\" + _index + "_" + fileName);    
    var psdOpts = new PhotoshopSaveOptions;
    try{
        app.activeDocument.saveAs(fileRef,psdOpts,true);
    }
    catch(err)
    {        
        pathCorrect = false //make stop loop
        app.activeDocument.close(SaveOptions.DONOTSAVECHANGES) //close extra new doc
        app.activeDocument = originalDoc //back to original doc
        return //make exit loop
    }

    //save path
    desc.putString(1,myRoot.text)
    app.putCustomOptions("myPSSetting",desc,true)

    //-----close document-----
    app.activeDocument = newDoc
    app.activeDocument.close(SaveOptions.DONOTSAVECHANGES)
    app.activeDocument = originalDoc

}

    
//test
// var artLayerRef = activeDocument.artLayers.add()
// artLayerRef.kind = LayerKind.TEXT
// var textItemRef = artLayerRef.textItem.contents = myRoot.text;