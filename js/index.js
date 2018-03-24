/**

Simple experimental code for cut text in div which contains another html elements.
Append dots if some content is to big for specified height.

Limitations:
- It works for the same line height in inner DOM elements. Differents elements heights it cause problem with correct crop.
- It works in Chrome, FF, Safari, IE, Edge

**/


const CROP_CONTENT_PREFIX = "cropContent_";
const DOTS = "...";
// for IE hook
const ATTRIBUTES_SEPERATOR = "_~_"; 

function DomTextElement(element, parent) {
    this.element = element;
    this.parent = parent;
    this.preparedElement = null;
    this.parentAttributes = new Array();
    this.shouldBeRemove = false;

     var __construct = function() {
    }();

};

function cropContent(elementId, heightToCut) {
    let element = document.getElementById(elementId);

    if (!element) {
        throw new Error("Can not find element for " + elementId);
    }
    
    if (!heightToCut || heightToCut < 1) {
        throw new Error("Height should be greater than 0.");
    }


    cropContentLoop(element, heightToCut, null, false);
}


function cropContentLoop(element, heightToCut, removedElement, forceSlice) {

    let currentElementHeight = element.children[0].getBoundingClientRect().height;
    let tmp = (currentElementHeight > heightToCut);

    if ( (currentElementHeight > heightToCut && forceSlice === false) || ( removedElement !== null && removedElement.shouldBeRemove === true) ) {

        let lastTextNode = getLastTextNode(element, new DomTextElement(null, element)); // perhaps enough will be one DomTextElement
        if (lastTextNode === null || lastTextNode.element === null) {
            return;
        }

        alignParentAttributes(removedElement, lastTextNode);  

        let innerRemovedElement = removeElementFromParent(lastTextNode);
        cropContentLoop(element, heightToCut, innerRemovedElement, false);
    } else if (!removedElement) {
        console.debug("Removed element is null - perhaps the element is lower than " + heightToCut);
        return;
    } else {               
        
        sliceLastCharacterFromContent(removedElement);
      
        
        removedElement.preparedElement.nodeValue += DOTS;
        removedElement.parent.appendChild(removedElement.preparedElement);

        let innerForceSlice = element.children[0].getBoundingClientRect().height > heightToCut;
        let innerForceStop = (forceSlice === true && innerForceSlice === false);

        if(innerForceSlice) {
            
            removedElement.preparedElement.nodeValue = removedElement.preparedElement.nodeValue.slice(0, -(DOTS.length));

            let emptyPreparedElement = removedElement.preparedElement.nodeValue.length < 1;
            if(emptyPreparedElement) {
                removedElement.shouldBeRemove = true;
            }
            
        }
        else {
            retrieveParentCachedAttributes(removedElement);
            return;
        }
        

        cropContentLoop(element, heightToCut, removedElement, innerForceSlice);

    }
}

/**
    Handling two depth in DOM for retrieve style
    i.e. <strong style="XXX">text <em>in<em> text<strong>
    If <em> element will be on the edge without below solution the style in <strong> will missing.

    TODO Quick solutoion - loop for parent: lastTextNode.parent.parentNode, lastTextNode.parent.parentNode.parentNode ...
**/
function alignParentAttributes(removedElement, lastTextNode) {
        
    if(removedElement !== null) {
        
        if(removedElement.parent === lastTextNode.parent) {
            retrieveParentCachedAttributes(removedElement);
        }
        else if(lastTextNode.parent.parentNode !== null && removedElement.parent === lastTextNode.parent.parentNode) {
            retrieveParentCachedAttributes(removedElement);
        }

    }
}

function retrieveParentCachedAttributes(element) {

    for (i = 0; i < element.parentAttributes.length; i++) {
        let attrMix = element.parentAttributes[i].split(ATTRIBUTES_SEPERATOR);

        let attrName = attrMix[0];
        let attrValue = attrMix[1];

        element.parent.setAttribute(attrName, attrValue);                 
    }

}

function clearAndCacheParentAttributes(element) {
    let parentElement = element.parent;
    for (i = 0; i < parentElement.attributes.length; i++) {
        var attr = parentElement.attributes[i];
        element.parentAttributes.push(attr.name + ATTRIBUTES_SEPERATOR + attr.value);
        parentElement.removeAttribute(attr.name);
    }
}


function sliceLastCharacterFromContent(domTextElement) {
    if (domTextElement.preparedElement === null) {
        domTextElement.preparedElement = domTextElement.element;
    }
    domTextElement.preparedElement.nodeValue = domTextElement.preparedElement.nodeValue.slice(0, -1);
    return domTextElement;
}


function removeElementFromParent(element) {
    // below works, but not in IE
    // element.element.remove();
    element.parent.removeChild(element.element);
    
    clearAndCacheParentAttributes(element);

    return element;
};

function getLastTextNode(node, outerLastTextNode) {

    let nodes = node.childNodes;
    for (let i = 0; i < nodes.length; i++) {
        let innerNode = nodes[i];

        if (innerNode.nodeType === Node.TEXT_NODE) {

            if (innerNode.nodeValue.trim().length === 0) {
                continue;
            }

            outerLastTextNode.element = innerNode;
            outerLastTextNode.parent = innerNode.parentNode;

            continue;
        }

        outerLastTextNode = getLastTextNode(innerNode, outerLastTextNode);
    }

    return outerLastTextNode;
}