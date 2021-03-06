/**
 * Trigger Happy - Cross Browser Event Triggering
 * https://github.com/larrymyers/trigger-happy
 */
(function() {
    
    var isIE = function() {
        var ua = navigator.userAgent;
        
        if (ua.toLowerCase().indexOf('msie') > -1) {
            return true;
        }
        
        return false;
    }();
    
    function setButton(buttonStr) {
        buttonStr = buttonStr ? buttonStr.toLowerCase() : 'left';
        
        if (buttonStr === 'right') {
            return 2;
        }
        
        if (buttonStr === 'middle') {
            return isIE ? 4 : 1 ;
        }
        
        return isIE ? 1 : 0;
    }
    
    function getElementPosition(elt) {
        var position = { top: 0, left: 0 },
            box;
        
        if (elt.getBoundingClientRect) {
            box = elt.getBoundingClientRect();
            
            position = {
                top: box.top,
                left: box.left
            };
        }
        
        return position;
    }
    
    window.Trigger = {
        /**
         * Triggers a mouse event on a DOM element. 
         * 
         * If no event name is provided, it will default to 'click'.
         *
         * If no options are provided, it defaults to no modifier keys, one click of the
         * left button, positioned on the top left corner of the target element.
         *
         * elt - The DOM element to trigger the mouse event on (required).
         * evtName - Optional W3C style event name (ex: click, dblclick, mousedown).
         * options - An optional object that contains the configuration options for the event.
         *   keys: {Array} string values representing key modifiers: 'ctrl', 'alt', 'shift', 'meta'.
         *   button: {String} which mouse button triggered the event: 'left', 'middle', 'right'.
         *   clickCount: {Number} the number of button clicks that triggered the event.
         *   relPosition: {Array} two element array that contains the x,y position of the event,
         *                relative to the element the event is triggered on.
         *   absPosition: {Array} two element array that contains the x,y position of the event,
         *                relative to the browser window. Takes precedence over relPosition.
         */
        mouse: function(elt, evtName, options) {
            options = options || {};
            evtName = evtName || 'click';
            
            var keys = options.keys ? options.keys.join(' ') : "",
                ctrlKey = keys.indexOf('ctrl') > -1 ? true : false,
                altKey = keys.indexOf('alt') > -1 ? true : false,
                shiftKey = keys.indexOf('shift') > -1 ? true : false,
                metaKey = keys.indexOf('meta') > -1 ? true : false,
                button = setButton(options.button),
                detail = options.clickCount || 0,
                box = getElementPosition(elt),
                evt;
                
            if (options.absPosition) {
                box.left = options.absPosition[0];
                box.top = options.absPosition[1];
            } else if (options.relPosition) {
                box.left += options.relPosition[0];
                box.top += options.relPosition[1];
            }
            
            if (isIE) {
                evtName = 'on' + evtName.toLowerCase();
                
                evt = document.createEventObject();
                evt.ctrlKey = ctrlKey;
                evt.altKey = altKey;
                evt.shiftKey = shiftKey;
                evt.metaKey = metaKey;
                evt.button = button;
                evt.detail = detail;
                evt.clientX = box.left;
                evt.clientY = box.top;
                
                return elt.fireEvent(evtName, evt);
            }
            
            evt = document.createEvent("MouseEvents");
            evt.initMouseEvent(evtName, true, true, window, detail, 0, 0, box.left, box.top, ctrlKey, altKey, shiftKey, metaKey, button, null);
            
            return elt.dispatchEvent(evt);
        },
        
        /**
         * Triggers a keyboard event on a DOM element.
         *
         * If no options are provided, it defaults to no modifier keys, one click of the
         * left button, positioned on the top left corner of the target element.
         *
         * elt - The DOM element to trigger the mouse event on (required).
         * evtName - Optional W3C style event name (required) (ex: keypress, keydown, keyup).
         * options - An optional object that contains the configuration options for the event.
         *   keys: {Array} string values representing key modifiers: 'ctrl', 'alt', 'shift', 'meta'.
         *   keyCode: {Number} The numeric keycode for the corresponding key firing the event
         *
         *   KeyCode Reference: https://developer.mozilla.org/en/DOM/Event/UIEvent/KeyEvent
         *
         */
        key: function(elt, evtName, options) {
            options = options || {};
            evtName = evtName || 'keypress';
            
            var keyCode = options.keyCode || 0,
                charCode = options.charCode || 0,
                keys = options.keys ? options.keys.join(' ') : "",
                ctrlKey = keys.indexOf('ctrl') > -1 ? true : false,
                altKey = keys.indexOf('alt') > -1 ? true : false,
                shiftKey = keys.indexOf('shift') > -1 ? true : false,
                metaKey = keys.indexOf('meta') > -1 ? true : false,
                evtMethod,
                evt;
            
            if (isIE) {
                evtName = 'on' + evtName.toLowerCase();
                
                evt = document.createEventObject();
                evt.ctrlKey = ctrlKey;
                evt.altKey = altKey;
                evt.shiftKey = shiftKey;
                evt.metaKey = metaKey;
                evt.keyCode = keyCode;
                
                return elt.fireEvent(evtName, evt);
            }
            
            evt = document.createEvent("KeyboardEvent");
            evtMethod = evt.initKeyEvent ? "initKeyEvent" : "initKeyboardEvent";
            evt[evtMethod](evtName, true, true, null, ctrlKey, altKey, shiftKey, metaKey, keyCode, charCode);
            
            return elt.dispatchEvent(evt);
        }
    };
})();