myInput();

var originalDoc
var targetDoc

var originalWidth 
var originalHeight 

var groupAmount
var mySectionRoot



function myInput(){

    originalDoc = app.activeDocument
    groupAmount = app.activeDocument.layerSets.length    
    originalWidth = app.activeDocument.width;
    originalHeight = app.activeDocument.height;
    //
    var myWindow = new Window("dialog","YHS's File_Exporter  v1.0"); 
    myWindow.orientation = "row" 

    var myPathGroup = myWindow.add("group");
    myPathGroup.orientation = "column"
    // mySectionRoot = myPathGroup.add("edittext",undefined,"/Users/yhs/Desktop/export/") 
    mySectionRoot = myPathGroup.add("edittext",undefined,"D:/MyWorkFolder/Escape/PS_Action/Export/")
    // mySectionRoot = myPathGroup.add("edittext",undefined,"/Users/mac/Desktop/詩特莉/2018_婚約禮盒/02完稿/") 
    
    mySectionRoot.characters =30;
    mySectionRoot.active = true

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
        mainProcess(index.toString());
    }    
}


function mainProcess(_index){
    

    //-----duplicat and merge------
    var newDoc = app.documents.add(originalWidth,originalHeight,300,"Untitled-1" +_index, NewDocumentMode.CMYK) //add new doc  \

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
    catch(err)
    {

    }
    
    try
    {
        var bk = docLay.getByName ("Background")
        bk.remove()

    }
    catch(err)
    {
    }


    //-----save-----   
    app.activeDocument = newDoc //swtich back to target doc 
    fileRef = File( mySectionRoot.text +  _index + "_" + fileName);    
    var psdOpts = new PhotoshopSaveOptions;
    app.activeDocument.saveAs(fileRef,psdOpts,true);

    //-----close document-----
    app.activeDocument = newDoc
    app.activeDocument.close(SaveOptions.DONOTSAVECHANGES)
    app.activeDocument = originalDoc

}

    
//test
// var artLayerRef = activeDocument.artLayers.add()
// artLayerRef.kind = LayerKind.TEXT
// var textItemRef = artLayerRef.textItem.contents = mySectionRoot.text;