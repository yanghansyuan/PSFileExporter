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
    groupAmount = app.activeDocument.layerSets.length    
    originalWidth = app.activeDocument.width;
    originalHeight = app.activeDocument.height;
    originalDocMode = app.activeDocument.mode
    pathCorrect = true
    
    //window
    var myWindow = new Window("dialog","YHS's PS File_Exporter  v1.3"); 
    myWindow.orientation = "row" 
    //radioBut
    var rdiGroup = myWindow.add("group"); 
    rdiGroup.orientation = "row"
    var rdi_RGB = rdiGroup.add("radiobutton",undefined,"RGB")
    var rdi_CMYK = rdiGroup.add("radiobutton",undefined,"CMYK")
    if(originalDocMode == DocumentMode.RGB)
    {
        rdi_RGB.value = true
    }
    else{
        rdi_CMYK.value = true
    }

    //editText
    var myPathGroup = myWindow.add("group");
    myPathGroup.orientation = "column"
    //save path preference

    //defined prefence
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

    // myRoot = myPathGroup.add("edittext",undefined,"/Users/yhs/Desktop/export/") 
    myRoot.characters =30;
    myRoot.active = true
    //button
    var mybutGroup = myWindow.add("group");
    mybutGroup.orientation = "column"
    var but_export = mybutGroup.add('button',undefined,"Export");
    mybutGroup.add('button',undefined,"Cancel");  

    but_export.onClick =function(){
        
        callProcess();
    }

    myWindow.show();
 
}

function callProcess()
{
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
    if(originalDocMode == DocumentMode.RGB)
    {
        var newDoc = app.documents.add(originalWidth,originalHeight,300,"Untitled-1" +_index, NewDocumentMode.RGB) //add new doc  
    }
    else
    {
        var newDoc = app.documents.add(originalWidth,originalHeight,300,"Untitled-1" +_index, NewDocumentMode.CMYK) //add new doc  
    }

    app.activeDocument = originalDoc
    var sourceGroup = app.activeDocument.layerSets[_index]//get group
    var fileName = sourceGroup.name 

    sourceGroup.duplicate ( newDoc );//dupilicate to new doc

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