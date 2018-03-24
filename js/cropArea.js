/**

Limitations:
When the scrollbar position or any zooming are change, then the crop area could draw on the wrong place.

**/
function showCropArea(elementId, heightToCut) {

    let cropContentElement = document.getElementById(CROP_CONTENT_PREFIX + elementId);
    if (cropContentElement) {
        cropContentElement.remove();
        return;
    }

    let element = document.getElementById(elementId);

    cropContentElement = document.createElement("div");
    cropContentElement.setAttribute('id', CROP_CONTENT_PREFIX + elementId);

    let elementRect = element.children[0].getBoundingClientRect();
    console.log(elementRect);

    cropContentElement.style.position = "absolute";
    cropContentElement.style.border = "2px dotted #FFA500";
    cropContentElement.style.zIndex = "100";
    cropContentElement.style.opacity = "0.9";
    cropContentElement.style.width = elementRect.width + "px"; // TODO check unit of measure
    cropContentElement.style.height = heightToCut + "px"; // TODO check unit of measure

    
    // minus two - border
    cropContentElement.style.top = elementRect.top - 2 + "px"; // TODO check unit of measure
    cropContentElement.style.right = elementRect.right + "px"; // TODO check unit of measure
    cropContentElement.style.left = elementRect.left - 2 + "px"; // TODO check unit of measure
    cropContentElement.style.bottom = elementRect.bottom + "px"; // TODO check unit of measure
   


    cropContentElement.style.position = "element(#" + elementId + ")";


    document.body.appendChild(cropContentElement);

}