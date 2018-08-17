/*
Made by: yang.hansyuan@gmail.com
version: v1.6 2018/08/17
update:
1.add basic fileformats

Todo:
1.mac path's slash. add empty path check

*/

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
var formatDpd

var processCount


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
    groupAmount = app.activeDocument.artLayers.length     //default 
    originalWidth = app.activeDocument.width;
    originalHeight = app.activeDocument.height;
    originalDocMode = app.activeDocument.mode
    pathCorrect = true
    processCount =0

    //window
    var myWindow = new Window("dialog","YHS's PS File_Exporter  v1.6"); 
    var mainGroup = myWindow.add("group");
    mainGroup.orientation = "row"
    var firstRowGroup = mainGroup.add("group");
    firstRowGroup.orientation = "column"
    firstRowGroup.alignChildren = "left"
    //radioBut:color
    var rdiGroup = firstRowGroup.add("group"); 
    rdiGroup.orientation = "row"
    rdiGroup.alignChildren = "left";
    rdiGroup.add("statictext", undefined, "Color Mode: " + originalDocMode.toString().split(".")[1])
    //radioBut:Export target
    var rdiTarget = firstRowGroup.add("group"); 
    rdiTarget.orientation = "row"
    rdiTarget.alignChildren = "left";
    // var myPanel = rdiTarget.add("panel", undefined, "export every")
    rdiTarget.add("statictext", undefined, "Export every:")
    rdi_artLayers = rdiTarget.add("radiobutton",undefined,"Layer")
    rdi_layerSets = rdiTarget.add("radiobutton",undefined,"Group")
    rdi_artLayers.value = true
    
    //radioBut:Resize
    var rdiResize = firstRowGroup.add("group"); 
    rdiResize.orientation = "row"
    rdiResize.alignChildren = "left";
    // var myPanel = rdiTarget.add("panel", undefined, "export every")
    rdiResize.add("statictext", undefined, "Resize and crop:")
    rdi_resize = rdiResize.add("radiobutton",undefined,"Yes")
    rdi_resizeNo = rdiResize.add("radiobutton",undefined,"No")
    rdi_resizeNo.value = true
    
    //file format
    var formatDpdG = firstRowGroup.add("group"); 
    formatDpdG.add("statictext", undefined, "Export format:")
    formatDpd =  formatDpdG.add("dropdownlist", undefined, ["psd","png","jpg","tiff","targa","pdf"])
    formatDpd.selection = 0

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
        if((processCount==groupAmount)&&(groupAmount!=0)) alert("Complete") //todo:check is sussce or not
        processCount=0
    }

    myWindow.show();
 
}

function callProcess()
{
    processCount = 0
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

    //export format
    var nowFormat = formatDpd.selection.text
    var exFormat
    var formatCorrect = true
    switch(nowFormat)
    {
        case "png":
            if(originalDocMode==DocumentMode.CMYK)
            {
                alert("png only work in RGB mode")
                formatCorrect = false //todo:change to specific bool 
            }
            else
            {
                exFormat = new PNGSaveOptions()
            }
            break;
            
        case "jpg":
            exFormat = new JPEGSaveOptions()
            exFormat.quality = 12
            break;

        case "tiff": exFormat = new TiffSaveOptions(); break;

        case "targa":
            if(originalDocMode==DocumentMode.CMYK)
            {
                alert("targa only work in RGB mode")
                formatCorrect = false
            }
            else
            {
                exFormat = new TargaSaveOptions()
            }
            break;

        case "pdf": exFormat = new PDFSaveOptions(); break;

        case "psd": exFormat = new PhotoshopSaveOptions(); break;
    }

    //looping all layers or groups and call main function
    for (var index = 0; index < groupAmount; index++) {
        
        if((pathCorrect)&&(formatCorrect))
        {    
            
            mainProcess(index.toString(), exFormat);
        }
        else if(!pathCorrect)
        {
            alert("Please check your path.")            
            break
        }
        else if(!formatCorrect)
        {
            alert("Please check your format.")            
            break
        }

        processCount++
    }

    pathCorrect=true //set true true for next excution
    formatCorrect = true
}


function mainProcess(_index,_exFormat){
    
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
    
    if(rdi_resize.value) app.activeDocument.trim(TrimType.TRANSPARENT,true,true,true,true)
        

    //-----save file-----   
    app.activeDocument = newDoc //swtich back to target doc 
    fileRef = File( myRoot.text + "\\" + _index + "_" + fileName);       
    var psdOpts = new PhotoshopSaveOptions;
    try{
        app.activeDocument.saveAs(fileRef,_exFormat,true);
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

