define([ 'aloha/plugin', 'jquery', 'ui/ui', 'ui/button', 'ui/port-helper-attribute-field', 'ui/scopes' ],
function( plugin, $, ui, button, attributeField, scopes, floatingMenu ) 
{
    "use strict";
    
    var cntEq = 0;
    
    return plugin.create( 'mathedit', 
    {
        defaults: 
        {
            wrapPrefix: 'eqprefix-'
        },
        hotKey: { insertTexMath: 'ctrl+m', insertAsciiMath: 'ctrl+j', insertMLMath: 'ctrl+k' },
        init: function() 
        {
            var editableObj = null;
            var self = this,
                wrapPrefix = this.settings.wrapPrefix;
            
            // MathJax init
            var script0 = document.createElement("script");
            script0.type = "text/x-mathjax-config";
            $(script0).html( 'MathJax.Hub.Config({'
                    + 'jax: ["input/MathML", "input/TeX", "input/AsciiMath", "output/NativeMML"],'
                    + 'extensions: ["asciimath2jax.js", "tex2jax.js","mml2jax.js","MathMenu.js","MathZoom.js"],'
                    + 'tex2jax: { inlineMath: [["$","$"]] },'
                    + 'asciimath2jax: { inlineMath: [["`", "`"]], delimiters: [["`","`"]] },'
                    + 'TeX: {'
                        + 'extensions: ["AMSmath.js","AMSsymbols.js","noErrors.js","noUndefined.js"], noErrors: { disabled: true }'
                    + '},'
                    + 'AsciiMath: { noErrors: { disabled: true } }'
                    + '});');
            
            var script = document.createElement("script");
            script.type = "text/javascript";
            script.src  = "http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=default";
            var config = 'MathJax.Hub.Startup.onload();';
            $(script).html(config);
            
            document.getElementsByTagName("head")[0].appendChild(script0);
            document.getElementsByTagName("head")[0].appendChild(script);

            var inChange = false;

            var Inserted = [];
            var currentEditor = null;
            var currentLength = -1;
            var editorToOffset = { };
            // Holds the user preferences for rendering math
            var aolDictionary = { };
            var aol = 'radio_latex';

            function convertToConcrete(character, element, leVal, currentOffset) {
                for(var i = 0; i < Inserted.length; i++) {
                    if(Inserted[i].loc == currentOffset+1 && Inserted[i].character == character) {
                        Inserted.splice(i, 1);
                        if(element.val() == leVal) {
                            element.val(leVal.slice(0,currentOffset+1)+leVal.slice(currentOffset+2));
                            leVal = element.val();
                        } else {
                            element.text(leVal.slice(0,currentOffset+1)+leVal.slice(currentOffset+2));
                            leVal = element.text();
                        }
                        window.getSelection().getRangeAt(0).setStart(window.getSelection().focusNode.childNodes[0], currentOffset+1);
                        break;
                    }
                }
                return leVal;
            }

            function generateInserted(element, leVal, offset, character) {
                if(element.val() == leVal) {
                    element.val(leVal.slice(0,offset+1)+character+leVal.slice(offset+1));
                    leVal = element.val();
                } else {
                    element.text(leVal.slice(0,offset+1)+character+leVal.slice(offset+1));
                    leVal = element.text();
                }
                window.getSelection().getRangeAt(0).setStart(window.getSelection().focusNode.childNodes[0], offset+1);
                Inserted.push({ start: offset, loc: offset+1, character: character });
                return leVal;
            }
           
            function onTexCharChange(evt, mathEditorContainer, eqId) {
                console.log("Updating LaTex, Id is: " + eqId);
                //if(inChange) return;
                inChange = true;

                var range = window.getSelection().getRangeAt(0);
                var offset = range.startOffset;
                /*console.log(Inserted);
                console.log(range.startOffset+" "+range.endOffset);*/
                /*var eqId = evt.currentTarget.id.substring(5);
                var element = $('#'+evt.currentTarget.id);*/
                //var leVal = element.val() || element.text();
                // Retrieves the original math from the 'editable'
                var mathEditBox = mathEditorContainer.find(".math-source");
                //var eqId = evt.currentTarget.id.substring(5);
                var leVal = mathEditBox.text() || mathEditBox.val();
                console.log("leVal is: " + leVal);
                var ch = leVal[offset];
                var diff = 1;

                var didRemove = false;
                for(var i = 0; i < Inserted.length; i++) {

                    // if this was a delete or backspace that removed a character
                    if(leVal.length < currentLength) {
                        // if this delete was on the opening character of a virtual closing character and there is no content in between
                        if(offset == Inserted[i].start && Inserted[i].loc == Inserted[i].start + 1) {
                            diff = diff + 1;

                           if(mathEditBox.val() == leVal) {
                                mathEditBox.val(leVal.slice(0,offset)+leVal.slice(offset+1));
                                leVal = mathEditBox.val();
                            } else {
                                mathEditBox.text(leVal.slice(0,offset)+leVal.slice(offset+1));
                                leVal = mathEditBox.text();
                            }
                            Inserted.splice(i, 1);
                            window.getSelection().getRangeAt(0).setStart(window.getSelection().focusNode.childNodes[0], offset);
                            // this can only occur once
                            didRemove = true;
                            break;
                        }
                    }
                }

                if(!didRemove) {
                    var i = 0;
                    while(i < Inserted.length) {
                        if(offset > Inserted[i].loc || offset <= Inserted[i].start) {
                            Inserted.splice(i, 1);
                        } else {
                            i = i + 1;
                        }
                    }
                }

                for(var i = 0; i < Inserted.length; i++) {

                    if(Inserted[i].start >= offset) {
                        if(leVal.length < currentLength) {
                            Inserted[i].start = Inserted[i].start - diff;
                        } else {
                            Inserted[i].start = Inserted[i].start + diff;
                        }
                    }

                    if(Inserted[i].loc >= offset) {
                        if(leVal.length < currentLength) {
                            Inserted[i].loc = Inserted[i].loc - diff;
                        } else {
                            Inserted[i].loc = Inserted[i].loc + diff;
                        }
                   } 
                }

                switch(ch) {
                    case(')'):
                    case('}'):
                        leVal = convertToConcrete(ch, mathEditBox, leVal, offset);
                        break;
                    case('{'):
                        leVal = generateInserted(mathEditBox, leVal, offset, '}');
                        break;
                    case('('):
                        leVal = generateInserted(mathEditBox, leVal, offset, ')');
                        break;
                }
                // Updates the mathjax element with the new text
                MathJax.Hub.queue.Push(["Text", MathJax.Hub.getAllJax(eqId)[0],"\\displaystyle{"+leVal+"}"]);
                inChange = false;
                currentLength = leVal.length;
            }

            function onAsciiCharChange(evt,  mathEditorContainer, eqId) {
                // var eqId = evt.currentTarget.id.substring(5);
                console.log("Refreshing ascii rendering");
                var mathEditBox = mathEditorContainer.find(".math-source");
                //var eqId = evt.currentTarget.id.substring(5);
                // var mathEditBox = $('#'+evt.currentTarget.id);
                // var leVal = mathEditBox.val() || mathEditBox.text();
                var leVal = mathEditBox.text() || mathEditBox.val();
                console.log("The ascii eqid is: " + eqId);
                console.log("The retrieved value is: " + leVal);
                MathJax.Hub.queue.Push(["Text", MathJax.Hub.getAllJax(eqId)[0],leVal]);
            }

            function enableEditor(editor, length) {
                if(currentEditor != null && currentEditor[0] != editor[0]) {
                    disableEditor();
                }
                currentEditor = editor;
                currentLength = length;
                GENTICS.Utils.Dom.setCursorInto( editor[0] );
                if(editorToOffset[editor[0].id] != null) {
                    window.getSelection().getRangeAt(0).setStart(window.getSelection().focusNode.childNodes[0], editorToOffset[editor[0].id]);
                }
                editor.show();
            }

            function disableEditor() {
                if(currentEditor != null) {
                    editorToOffset[currentEditor[0].id] = window.getSelection().getRangeAt(0).startOffset;
                    currentEditor.hide();
                    currentEditor = null;
                }
            }

            function generateMathContainer(openDelimiter, closeDelimiter, charChangeFunction, equation, editableObj, newMathEditContainer) {
                var newElId = wrapPrefix+cntEq;
                var range = Aloha.Selection.getRangeObject();
                //pasteHtmlAtCaret('<span id="" class="MathJax selected MathBoxNew" contenteditable="false">' + exText + '</span>');
                var newMathContainer = $('<div id="'+newElId+'" class="MathBox MathBoxNew selected">'+openDelimiter + closeDelimiter+'</div>');
                //class="MathBoxNew"
                //class="MathBox selected MathBoxNew"
                //var newMathEditContainer = $(buildMathEditor());
                // Sets the id of the math editor
                //newMathEditContainer.attr("id", "edit-'+newElId+'");
                //pasteHtmlAtCaret(newMathContainer);
                //var newMathEditContainer = $('<div id="edit-'+newElId+'" style="padding:2px;min-height:28px;border:1px solid green;-moz-border-radius: 4px;-webkit-border-radius: 4px;-khtml-border-radius: 4px;border-radius: 4px;background-color:white;">'+initValue+'</div>');
                // var newMathContainer = $('<div id="'+newElId+'" class="MathBox selected" style="left;border:1px dotted grey">'+openDelimiter+closeDelimiter+'</div>');

               /* Generates the math editor */ 
                GENTICS.Utils.Dom.insertIntoDOM( newMathContainer, range, $( Aloha.activeEditable.obj ) ); // Inserts the math container into the aloha 'editable' object
               // GENTICS.Utils.Dom.insertIntoDOM( newMathEditContainer, range, $( Aloha.activeEditable.obj ) );
               // GENTICS.Utils.Dom.setCursorInto( newMathEditContainer[0] );
        
                //newMathEditContainer.hide();
               console.log("ID is: " + newElId);
                if(equation == '' || equation == "&nbsp\;") {
                    MathJax.Hub.queue.Push(["Typeset", MathJax.Hub, newElId, function() { 
                        console.log("Finished typsetting");
                        //enableEditor(newMathEditContainer, 0);
                    }]);
                } 
                else {

                    if(openDelimiter == '${') {

                        MathJax.Hub.queue.Push(["Typeset", MathJax.Hub, newElId, function() { 
                               //enableEditor(newMathEditContainer, initValue.length);
                               MathJax.Hub.queue.Push(["Text", MathJax.Hub.getAllJax(newElId)[0],"\\displaystyle{"+equation+"}"]);
                        }]);
                    } 
                    else {

                        MathJax.Hub.queue.Push(["Typeset", MathJax.Hub, newElId, function() { 
                               // enableEditor(newMathEditContainer, initValue.length);
                               MathJax.Hub.queue.Push(["Text", MathJax.Hub.getAllJax(newElId)[0],equation]);
                        }]);
                    }
                }
                                    
               /* var blurout = function()
                {
                    Inserted = [];
                    disableEditor();
                };

                var editableClickBlurout = function(evt) {
                    if(currentEditor != null) {
                        var id = evt.target.id;
                        if(id == null) {
                            return;
                        }
                        if(id.length > 8) {
                            if(id.substring(0, 8) == 'eqprefix-') {
                                return;
                            }
                        }
                        if(id.length > 13) {
                            if(id.substring(0, 13) == 'edit-eqprefix-') {
                                return;
                            }
                        }
                        disableEditor();
                    }
                };*/

/*
                $(editableObj).on('blur focusout', blurout);
                $(editableObj).on('click', editableClickBlurout);
*/
                // newMathEditContainer.on('focusout', blurout);
                // newMathEditContainer.on('blur', blurout);
                
                /*newMathContainer.on('click', function()
                {
                    Inserted = [];
                    enableEditor(newMathEditContainer, newMathEditContainer.val() ? newMathEditContainer.val().length : newMathEditContainer.text().length );
                });*/

                cntEq++;
                return newElId; // Returns the id of the newly inserted math element

            }

            function toggleMath()
            {
                if( Aloha.activeEditable ) 
                {
                    var range = Aloha.Selection.getRangeObject()
                    if ( !( range.startContainer && range.endContainer ) ) {
                        return;
                    }
                    
                    // get text from selection
                    var leText = range.getText();
                    
                    if( $.trim(leText) === '' ) return;
                    
                    GENTICS.Utils.Dom.removeRange(range);
                    // make a new placeholder for the new equation

                    generateMathContainer('${','}$', onTexCharChange, leText, editableObj);
                }
            }
 function insertToolbar() {
    var popOutHtml = buildMathEditor();
    popOutHtml = '<span id="" class="MathBox selected MathBoxNew" contenteditable="false"' + popOutHtml + '</span>';
    $("#content").append(popOutHtml);
    //$(document.body).append(popOUt);
    //pasteHtmlAtCaret(popOUt);
}
// Inserts html where the caret is in the html
function pasteHtmlAtCaret(html) { // From Tim Down at http://stackoverflow.com/questions/6690752/insert-html-at-cursor-in-a-contenteditable-div
    var sel, range;
    if (window.getSelection) {
        // IE9 and non-IE
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();

            // Range.createContextualFragment() would be useful here but is
            // non-standard and not supported in all browsers (IE9, for one)
            var el = document.createElement("div");
            el.innerHTML = html;
            var frag = document.createDocumentFragment(), node, lastNode;
            while ( (node = el.firstChild) ) {
                lastNode = frag.appendChild(node);
            }
            range.insertNode(frag);

            // Preserve the selection
            if (lastNode) {
                range = range.cloneRange();
                range.setStartAfter(lastNode);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    } else if (document.selection && document.selection.type != "Control") {
        // IE < 9
        document.selection.createRange().pasteHTML(html);
    }
  }


  // Adds a new editor every time the math button is entered

/* 
 * Converts text to ASCII math or LaTex if the user selected some text.
 * If not it provides the user with a math-editor
*/
  function mathClickNew(openDelimiter, closeDelimiter, charChangeFunction) {
    console.log("mathClickNew ");
    var equation = getSelectionText();
    // Pops up the math-editor if the user hasn't selected text
    if (equation == '') {
      equation = "&nbsp\;";

     /* $("[class*='-header']").die("mouseenter mouseleave"); // Turning hovers off (temporarily)
      $(".canvas-wrap").die("mouseenter mouseleave"); // Have to do this one separately from above, apparently
      $(".MathBox").die("mouseenter mouseleave");
      $("table caption").die("mouseenter mouseleave");*/
      // cwLeave($(".canvas-wrap"),"special");

      // Changes status of math button to selected
      $('button[title="Math"]').addClass("selected");
    
      console.log("Building the math editor");
      var mathEditor = buildMathEditor();
      console.log("Delimiter is: " + openDelimiter);
    // pasteHtmlAtCaret('<span id="" class="MathBox selected MathBoxNew" contenteditable="false">' + exText + '</span>');
     var newElId = generateMathContainer(openDelimiter, closeDelimiter, charChangeFunction, equation, editableObj)
      // Retrieves the html element(which has the selected text) it just inserted to the document
      var mathEditorContainer = $(".MathBoxNew");
      // Inserts the math editor
      mathEditorContainer.prepend(mathEditor);
      console.log("Editor text is: " + $(".math-editor").find(".math-source").text());
      //console.log("The radio button is currently: " + aol);
      // Sets the radio button depending on the saved global preferences. Optional if Kathi wants this feature
      if (aol == 'radio_latex') {
        console.log("Checking latex radio");
        mathEditorContainer.find("#radio_latex").attr('checked','checked');
      } 

      else {
        console.log("Checking ascii radio");
        mathEditorContainer.find("#radio_ascii").attr('checked','checked');
        // mathEditorContainer.find("#radio_latex").attr("checked",false);

      }
      //mathEditorContainer.removeClass("temporarily-hide");
      var newB = mathEditorContainer.outerHeight() + 14; // 14 = approx. positive value of :after's "bottom" property
      var newL = mathEditorContainer.outerWidth() / 2 - parseInt($(".math-editor").css("width")) / 2 - 7; // 7 for mysterious good measure
      $(".math-editor").css("bottom", newB + "px");
      $(".math-editor").css("left", newL + "px");

       /* Changes the update function based on what radio button is chosen */
       mathEditorContainer.find("#radio_latex").on("click", function(e){
            console.log("Changing update function");
            charChangeFunction = onTexCharChange;
            /* Updates the current equation */
            charChangeFunction(e, $(".math-editor"), newElId);

        });
       mathEditorContainer.find("#radio_ascii").on("click", function(e){
            console.log("Changing the update function");
            charChangeFunction = onAsciiCharChange;
            /* Updates the current equation */
            charChangeFunction(e, $(".math-editor"), newElId);
        });
      // Updates the generated math as the user modifies it
      $(".math-editor").find(".math-source-wrap").on('DOMCharacterDataModified', function(e) {
        /* Replaces the current text with a '&nbsp;' if the user removes all the text */
        var text = $(".math-editor").find(".math-source").text();
        if (text == '') {
            $(".math-editor").find(".math-source").append("&nbsp\;");
            console.log("Inserted nbsp");
        }
        else {
            console.log("Text is:" + text);
        }

        console.log("Editor text is: " + $(".math-editor").find(".math-source").text());
        charChangeFunction(e, $(".math-editor"), newElId);
       });
      $(".math-editor").find(".math-source-wrap").on('DOMNodeInserted', function(e) {
        console.log("Editor text is: " + $(".math-editor").find(".math-source").text());
        charChangeFunction(e, $(".math-editor"), newElId);
    });
      /* If the math-editor is empty then it's replaced w/ default text */
      if (equation == "&nbsp\;") {
        mathEditorContainer.find(".math-source").append('<span class="math-source-hint-text">Enter your math notation here</span>');
      } 
      else {
        /* Appends the equation to the text in the editor */
        mathEditorContainer.find(".math-source").append(equation);
        placeCaretAtEnd($(".math-source").get(0));
      }
      /*if ( $("#cheat-sheet").css("display") != 'none' ) $("#cheat-sheet-activator").attr("checked",true);
      $("#cheat-sheet-wrap").slideUp("fast", function(){
        $(this).show();
      });*/


    } 
    /* If the user selects text then that text is converted to whatever was selected */
    else {

      // pasteHtmlAtCaret('<span id="" class="MathBox MathBoxNew" contenteditable="false"><span class="MathJaxText">' + exText + '</span></span>');
      generateMathContainer(openDelimiter, closeDelimiter, charChangeFunction, equation, editableObj, null);
      // Changes status of math button to be 'unselected'
      $('button[title="Math"]').removeClass("selected");
      $(".MathBoxNew").removeAttr("id").effect("highlight", { color: "#E5EEF5" }, 1000);

    }
    // e.stopPropagation();
    //e.preventDefault();

  }

  function mathEditorRemove(override) {
      console.log("mathEditorRemove, override is: " + override);
      // If the new math element is empty then unselect and unhover it
      $(".MathBox").removeClass("selected");
      $(".MathBox").removeClass("hovered");
      // This is only related to the math cheat sheet
      /*if ($("#cheat-sheet-wrap").css("display") != 'none') {
        $("#cheat-sheet-wrap").slideDown("fast", function(e){
          $(this).hide();
        });
      }*/
      // Retrieves the closest mathjax element
      var mathJax = $(".math-editor").closest(".MathBox");
      // Retrieves the math editor's text
      var mathSource = $(".math-editor").find(".math-source").text();
      /* Checks if the override's string length is non zero or the 'radio button(I don't know which yet) is checked' 
         And that  the hint text is zero
        */
     // Sets the user preferences to the id of which radio button is checked {}
      var newAol = $(".math-editor").find('input[name="math-type"]:checked').attr("id");
      // Saves the preference of the rendering to the global aolDictionary so that their preferenc will be saved depending on which equation they're editing
      if (newAol != null && mathJax != null) {
        aol = newAol;      
        aolDictionary[mathJax.attr("id")] = aol;
        console.log("Adding a new aol: " + aol + " with id: " + mathJax.attr("id"));

    }
    
      if ((override.length || $("#radio_regular").is(":checked")) && !$(".math-source-hint-text").length) {
        if (mathSource == "&nbsp\;") {
            // If the math source only has a 'standard space' simply replace it with empty text?
          //mathJax.replaceWith("");
        } 
        else {
            // Otherwise update it with the next text
          // /mathJax.replaceWith(mathSource);
        }
      } 
      else {
        // Removes the mathjax element if the editor is empty
        if (!mathJax.find(".asciimath").length) { 
          if (!mathSource.trim().length || $(".MathBoxNew").find(".math-source-hint-text").length) {
            mathJax.remove();
          } 
          else {
            //mathJax.html('<span class="MathJaxText">' + mathSource + '</span>');
          }
        }
      }

      // Removes every math editor open
      $(".math-editor").remove();
      $('button[title="Math"]').removeClass("selected"); //Unselects the button
      // For every math element it removes the 'MathBoxNew' class from the element
      $(".MathBox").each(function(){
        if ($(this).hasClass('MathBoxNew')) {
          $(this).removeClass("MathBoxNew"); // Removes its 'new status from it'
        }
      });
    }
    /* Sets a callback on the aloha button by looking for an element whose title=math,
     * This is used to prevent the math editor being closed by another callback function keyed on the entire html document. 
     * it does this by calling e.stopPropogation()
     */

    $('button[title="Math"]').live("click", function(e) {
        console.log("Button being clicked");
        e.stopPropagation();
    });
    /* Generates events everytime the inserted equation is being interacted with */
  $(".MathBox").live("mouseenter", function(e){
    console.log("Editor being entered");
    mathEnter($(this),e);
  });
  $(".MathBox").live("mouseleave", function(e){
    console.log("Editor being left");    
    mathLeave($(this),e);
  });
  $(".MathBox:not(.selected)").live("click", function(e){
    console.log("Editor not selected?");    
    mathClick($(this),e);

  });
  $(".math-editor").live("click", function(e){
    console.log("math editor being clicked");
//  e.stopPropagation();
    meClick($(this),e);
  });


  function removeMathWrapper(mathText) {
    /*var latexRegexPattern = "(?<=\\displaystyle{)(.*)(?=})";
    latexRegexPattern = "\\displaystyle{.*}";*/
    var latexRegex = /\\displaystyle{(.*)}/;
    var asciiRegex = /`(.*)`}/; 
    var actualMathTextFromLatex = latexRegex.exec(mathText);
    var actualMathTextFromAscii = asciiRegex.exec(mathText);
    var actualMathText = actualMathTextFromLatex || actualMathTextFromAscii;
    if (actualMathText == null) {
        return mathText;       
    }
    return actualMathText[1];
  }
  function meClick(me,e) {
    e.stopPropagation();
  };
function mathClick(mathEditorContainer, e) {

   /* $("[class*='-header']").die("mouseenter mouseleave"); // Turning hovers off (temporarily)
   // $(".canvas-wrap").die("mouseenter mouseleave"); // Have to do this one separately from above, apparently
    $(".MathBox").die("mouseenter mouseleave");
    $("table caption").die("mouseenter mouseleave");*/
    console.log("Math click being called");
   /* cwLeave($(".canvas-wrap"),"special");*/
    var charChangeFunction, elementId;
    if(!mathEditorContainer.find(".math-editor").length) {
      mathEditorRemove("");
      mathEditorContainer.find('#math-icon-edit').remove();
      mathEditorContainer.find('#math-icon-clear').remove();
      mathEditorContainer.removeAttr("title");
      mathEditorContainer.addClass("selected");
      // Changes status of button to selected
      $('button[title="Math"]').addClass("selected");
      /* Inserts the math editor */
      var mathEditor = buildMathEditor(mathEditorContainer,e);
      mathEditorContainer.prepend(mathEditor);
      var mathtext = mathEditorContainer.find(".asciimath").text(); // Don't quite know what this is supposed to do
      // Retrieves the  id of the mathjax element
      elementId = mathEditorContainer.closest(".MathBox").attr("id");
      console.log("Actual math text is: " + actualMathText);
      // Retrieves the original math text by searching for the mathjax element
      var actualMathText = mathEditorContainer.find('[id^="MathJax-Element-*"], [type^="math/"]').text();
      // Retrieves the user rendering preferences for the selected mathjax element. If it can't find it's value then it uses the default value
      var savedAol = aolDictionary[elementId] || 'radio_latex';
      console.log("Retrieved aol with an id of: " + elementId + " is: " + savedAol);

    // Checks the radio button based on what was last chosen, then sets the update function based on what the user chooses
      if ( savedAol == 'radio_latex') {
        mathEditorContainer.find("#radio_latex").attr('checked','checked');
        charChangeFunction = onTexCharChange;
        actualMathText = removeMathWrapper(actualMathText);
      } 
      else 
      {
        mathEditorContainer.find("#radio_ascii").attr('checked','checked');
        charChangeFunction = onAsciiCharChange;
        console.log("Setting the onAsciiCharChange");
        actualMathText = removeMathWrapper(actualMathText);
        console.log("The retrieved math looks like: " + actualMathText);
      }
      if (mathtext.length) {
        console.log("themathtext is not empty");
        mathEditorContainer.find(".math-source").append(mathtext);
      } 
      else if (actualMathText.length) {
        // Drops the text into the math editor if the text is non-empty
        mathEditorContainer.find(".math-source").append(actualMathText);
      } 
      else {
        // Otherwise  it just appends nbsp
        mathEditorContainer.find(".math-source").append("&nbsp\;");
      }
    
      // Repositions the editor next to the mathjax
      var newB = mathEditorContainer.outerHeight() + 14; // 14 = approx. positive value of :after's "bottom" property
      var newL = mathEditorContainer.outerWidth() / 2 - parseInt($(".math-editor").css("width")) / 2 - 7; // 7 for mysterious good measure
      $(".math-editor").css("bottom", newB + "px");
      $(".math-editor").css("left", newL + "px");
      placeCaretAtEnd($(".math-source").get(0));
    } 
    else {
      /*elementId = $("#content").find('[id^="eqprefix-"]').attr("id");
             // Retrieves the user rendering preferences for the selected mathjax element. If it can't find it's value then it uses the default value
      var savedAol = aolDictionary[elementId] || 'radio_latex';
      console.log("Retrieved aol with an id of: " + elementId + " is: " + savedAol);
    // Checks the radio button based on what was last chosen, then sets the update function based on what the user chooses
      if ( savedAol == 'radio_latex') {
        mathEditorContainer.find("#radio_latex").attr("checked",true);
        charChangeFunction = onTexCharChange;
      } 
      else {
        mathEditorContainer.find("#radio_ascii").attr("checked",true);
        charChangeFunction = onAsciiCharChange;
      }*/
      placeCaretAtEnd($(".math-source").get(0));
    }
    /* Changes the update function based on what radio button is chosen */
    mathEditorContainer.find("#radio_latex").on("click", function(e){
        console.log("changing update function");
        charChangeFunction = onTexCharChange;
        /* Updates the current equation */
        charChangeFunction(e, $(".math-editor"), elementId);

    });
   mathEditorContainer.find("#radio_ascii").on("click", function(e){
        console.log("changing update function");
        charChangeFunction = onAsciiCharChange;
        /* Updates the current equation */
        charChangeFunction(e, $(".math-editor"), elementId);
    });
    // Updates the generated math as the user modifies it
      $(".math-editor").find(".math-source-wrap").on('DOMCharacterDataModified', function(e) {
        /* Replaces the current text with a '&nbsp;' if the user removes all the text */
        var text = $(".math-editor").find(".math-source").text();
        if (text == '') {
            $(".math-editor").find(".math-source").append("&nbsp\;");
            console.log("Inserted nbsp");
        }
        console.log("Editor text is: " + $(".math-editor").find(".math-source").text());
        charChangeFunction(e, $(".math-editor"), elementId);
    });
      $(".math-editor").find(".math-source-wrap").on('DOMNodeInserted', function(e) {
        console.log("Editor text is: " + $(".math-editor").find(".math-source").text());
        charChangeFunction(e, $(".math-editor"), elementId);
    });
     
    /*if ( $("#cheat-sheet").css("display") != 'none' ) $("#cheat-sheet-activator").attr("checked",true);
    $("#cheat-sheet-wrap").slideUp("fast", function(e){
      $(this).show();
    });*/
    e.stopPropagation();
  }

  $(".math-source").live("click", function(e){
    $(this).find(".math-source-hint-text").replaceWith("&nbsp\;");
  });
function getSelectionText() { // from Tim Down at http://stackoverflow.com/questions/5379120/jquery-get-the-highlighted-text
    var text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }
    return text;
  }
  function placeCaretAtEnd(el) { // From Tim Down at http://stackoverflow.com/questions/4233265/contenteditable-set-caret-at-the-end-of-the-text-cross-browser
    el.focus();
    if (typeof window.getSelection != "undefined"
            && typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (typeof document.body.createTextRange != "undefined") {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
    }
  }
    function mathLeave(mathEditorContainer,e) {
    if(!mathEditorContainer.find(".math-editor").length) {
      mathEditorContainer.removeClass("selected");
    }
    mathEditorContainer.removeClass("hovered");
    mathEditorContainer.removeAttr("title");
    mathEditorContainer.find('#math-icon-edit').remove();
    mathEditorContainer.find('#math-icon-clear').remove();
  /*  if ( !mathEditorContainer.parents().closest(".active").length) {
      mathEditorContainer.parent().closest('.canvas-wrap').each(function(){
        $(this).children().children().children('.canvas-buddy, .canvas-buddy-2').show();
        $(this).children().children().children().children().children('.canvas-buddy, .canvas-buddy-2').show();
        $(this).children('.canvas').addClass("canvas-hovered");
      });
    }*/
  }

   function mathEnter(mathEditorContainer,e) {
    
    /* Wraps the text */
    /*$('.canvas-wrap').each(function(){
      $(this).children().children().children('.canvas-buddy, .canvas-buddy-2').hide();
      $(this).children().children().children().children().children('.canvas-buddy, .canvas-buddy-2').hide();
      $(this).children('.canvas').removeClass("canvas-hovered");
    });*/
    console.log("Entering math");
    mathEditorContainer.addClass("hovered");
    // If the length is zero then add the original text back
    if(!mathEditorContainer.find(".math-editor").length) {
      mathEditorContainer.attr("title","Click anywhere on the math to edit it");
      mathEditorContainer.append('<span class="math-icon" id="math-icon-edit"><span class="math-icon-message">Click anywhere on the math to edit it</span></span>');
      mathEditorContainer.append('<span class="math-icon" id="math-icon-clear"><span class="math-icon-message"><span class="math-icon-message-close">X</span> Remove math formatting (revert to plain text)</span></span>');
    }
    e.stopPropagation();
  }
  // Removes the math editor when the html document is clicked. I don't know where the '.math-done' class is used b/c  I don't see it used in the page
   $("html, .math-editor-close, .math-done").live("click", function(e){
      console.log("Removing the math editor");
      mathEditorRemove("");
    /* Establishes a listener for mouse movements to on the math mathjax box */
    $(".MathBox").live("mouseenter", function(e){
      mathEnter($(this),e);
    });
    $(".MathBox").live("mouseleave", function(e){
      mathLeave($(this),e);
    });

   });

  $(".math-editor").live("click", function(e){
        console.log("Stopping propagation");
        meClick($(this),e);
  });
  /* Builds the math editor html */

  function buildMathEditor(mathEditorContainer,e) {
    var ed = '<div class="math-editor" contenteditable="false" id="meditor">\
        <span class="math-editor-close">\
          <img src="http://mountainbunker.org/~maxwell/oerpub/editor-ideas/content_files/remove-element-01.png">\
        </span>\
        <div class="math-source-wrap">\
          <span class="math-source" contenteditable="true"></span>\
          <div id="math-error" contentEditable="false">\
            <strong>LaTeX error:</strong> <br/>sqrt requires initial backslash: \\sqrt\
          </div>\
        </div>\
        <div class="math-options-activate">\
          This is:\
          <input type="radio" name="math-type" id="radio_ascii" value="ascii" checked="checked"> <label for="radio_ascii">ASCIIMath</label>\
          <input type="radio" name="math-type" id="radio_latex" value="latex" checked=""> <label for="radio_latex">LaTeX</label>\
          <span id="math-type-help" class="math-help" style="display: none\;">(<a href="#asdfasdf">what\'s this?</a>)</span>\
        </div>\
        <div id="cheat-sheet-activate" style="text-align: right\; display: block\;">\
          <input type="checkbox" name="cheat-sheet-activator" id="cheat-sheet-activator">\
          <label for="cheat-sheet-activator" style="font-weight: normal\; padding-right: .4em\;">Show cheat sheet</label>\
          <span id="math-editor-help" class="math-editor-help" style="border-left: 1px solid #7D8B94\; padding-left: .6em\;">\
            <a href="#asdfasdfasdf">See help</a>\
          </span>\
        </div>\
        <div id="math-advanced" style="clear: both\;">\
        </div>\
        <div class="math-help-text-wrap">\
          <div class="math-help-text" id="math-type">\
            <span class="math-help-text-close">x</span>\
            ASCIIMath and LaTeX transform plain text into mathematics format.\
            <ul>\
              <li>\
                <strong>ASCIIMath</strong> is a simple input notation similar to that of a graphing calculator.\
                For example, <span style="font-family: courier new">x^(ab)</span> would render as \
                <span class="math-style">x<sup style="line-height: .5em; vertical-align: .3em;">ab</sup></span>.\
                <a href="http\:\/\/www1.chapman.edu\/\~jipsen\/asciimath.html" target="_blank" class="external">Learn more.</a>\
              </li>\
              <li>\
                <strong>LaTeX</strong>, while similar to ASCIIMath, includes some more complex notation for advanced math.\
                <a href="http\:\/\/en.wikibooks.org/wiki/LaTeX/Mathematics" target="_blank" class="external">Learn more.</a>\
              </li>\
            </ul>\
            Click the "<strong>Show cheat sheet</strong>" box to see examples of each.\
          </div>\
          <div class="math-help-text" id="math-editor-help-text">\
            <span class="math-help-text-close">x</span>\
            To add math to your document, type math in the text field using either \
            <a href="#asd" id="math-type-help-2">ASCIIMath or LaTeX notation</a>.\
            The display math will be rendered below in real time.  When you\'re done, just click anywhere outside the blue box.\
            <ul>\
              <li>\
                <strong>Show cheat sheet</strong>.  Use this to see common examples of notation and their respective display.\
              </li>\
              <li>\
                <strong>Show advanced options</strong>.  Use this to switch between your choice of ASCIIMath or LaTeX.\
              </li>\
            </ul>\
          </div>\
        </div>\
      </div>';
    return ed;
  }
            
            scopes.createScope('math', 'Aloha.empty');
            /* Configure the 'insert latex' math */
            self._mathCtrl = ui.adopt( 'characterPicker'/*"math"*/, button, 
            {
                tooltip: 'Math', /*i18n.t('button.addmath.tooltip'),*/
                icon: "mathEditorContainer",
                click: function() {
                    console.log("Math button being clicked");
                    // Generates a new math editor
                    mathClickNew('${','}$', onTexCharChange);
                    aol = radio_latex;
                    // e.stopPropagation();
                }
                /*onclick: function() {
                    console.log("Test");
                }*/
            });
            
            var parsedJax = false; 
            Aloha.bind('aloha-editable-activated', function (event, data) 
            {
                
                !parsedJax && (function()
                {
                    parsedJax = true;
                    MathJax.Hub.Queue(["Typeset",MathJax.Hub, null, function()
                    { 
                        $(MathJax.Hub.getAllJax()).each(function()
                        { 
                            console.log("Initializing...?");
                            var elfr = $('#'+this.inputID+'-Frame'),
                                el = $('#'+this.inputID),
                                elpr = $('#'+this.inputID+'-Frame').prevAll('.MathJax_Preview').eq(0),
                                eqWrapper = $('<span id="'+wrapPrefix+cntEq+'" />').insertBefore(elpr)
                                    .append(elpr).append(elfr).append(el)
                                    .data('equation', this.originalText);
                           console.log("elfr is: " + elfr) ;
                           console.log("el is: " + el );
                           console.log("elpr is: " + elpr);
                            
                           cntEq++;
                        }); 
                    }]);
                })();
                self._mathCtrl.show();
            });
            
           
            Aloha.bind('aloha-editable-created', function (event, editable) 
            {
                editableObj = editable.obj;
                
                editable.obj.bind('keydown', self.hotKey.insertTexMath, function() 
                {
                    //generateMathContainer('${','}$', onTexCharChange, '', editable.obj);
                    aol = 'radio_latex';
                    mathClickNew('${','}$', onTexCharChange); // Generates a new math container and binds the 'latex' callback function
                });

                editable.obj.bind('keydown', self.hotKey.insertAsciiMath, function() 
                {
                    //generateMathContainer('`','`', onAsciiCharChange, '', editable.obj);
                    aol = 'radio_ascii';
                    mathClickNew('`','`', onAsciiCharChange); // Generates a new math container and binds the 'asciimath' callback functoin
                    console.log("Setting the radio default");
                });
                editable.obj.bind('keydown', self.hotKey.insertMLMath, function() 
                {
                    // generateMathContainer('<math>','</math>', onAsciiCharChange, '', editable.obj);
                    aol = 'radio_mathml';
                    mathClickNew('<math>','</math>', onAsciiCharChange); // Generates a new math container and binds the 'asciimathml' callback functoin
                });
            });

        }
    });
});
    