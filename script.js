var img1 = new Img();
img1.linkCanvas('canvas1');
img1.addImportListener('inputImage');

var img2 = new Img();
img2.linkCanvas('canvas2');
img2.addImportListener('inputImage');

function contrastImage()
{
    img2.raw = img1.contrastImage();
    img2.putImageData();
}