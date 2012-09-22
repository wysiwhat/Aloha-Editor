 function insertToolbar() {
    var popOutHtml = buildMathEditor();
    popOutHtml = '<span id="MathJaxNew" class="MathJax selected" contenteditable="false"' + popOutHtml + '</span>';
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

  function mathClickNew(aol,e) {
    console.log("math Click new ");
    var exText = getSelectionText();
    if (exText == '') {
      exText = '&nbsp\;';
      pasteHtmlAtCaret('<span id="MathJaxNew" class="MathJax selected" contenteditable="false">' + exText + '</span>');

     /* $("[class*='-header']").die("mouseenter mouseleave"); // Turning hovers off (temporarily)
      $(".canvas-wrap").die("mouseenter mouseleave"); // Have to do this one separately from above, apparently
      $(".MathJax").die("mouseenter mouseleave");
      $("table caption").die("mouseenter mouseleave");
      cwLeave($(".canvas-wrap"),"special");
      $("#toolbar-math").addClass("selected");
      */

      mec = buildMathEditor();
      
      var m = $("#MathJaxNew")
      m.prepend(mec)
      if (aol == 'aol-latex') {
        m.find("#radio_latex").attr("checked",true);
      } else {
        m.find("#radio_ascii").attr("checked",true);
      }
      //m.removeClass("temporarily-hide");
      newB = m.outerHeight() + 14; // 14 = approx. positive value of :after's "bottom" property
      newL = m.outerWidth() / 2 - parseInt($(".math-editor").css("width")) / 2 - 7; // 7 for mysterious good measure
      $(".math-editor").css("bottom", newB + "px");
      $(".math-editor").css("left", newL + "px");
      if (exText == '&nbsp;') {
        m.find(".math-source").append('<span class="math-source-hint-text">Enter your math notation here</span>');
      } else {
        m.find(".math-source").append(exText);
        placeCaretAtEnd($(".math-source").get(0));
      }
      if ( $("#cheat-sheet").css("display") != 'none' ) $("#cheat-sheet-activator").attr("checked",true);
      $("#cheat-sheet-wrap").slideUp("fast", function(){
        $(this).show();
      });


    } else {

      pasteHtmlAtCaret('<span id="MathJaxNew" class="MathJax" contenteditable="false"><span class="MathJaxText">' + exText + '</span></span>');
      $("#toolbar-math").removeClass("selected");
      $("#MathJaxNew").removeAttr("id").effect("highlight", { color: "#E5EEF5" }, 1000);

    }

    e.stopPropagation();
    e.preventDefault();

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
  function buildMathEditor(m,e) {
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
          <input type="radio" name="math-type" id="radio_latex" value="latex"> <label for="radio_latex">LaTeX</label>\
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
$(document).ready(insertToolbar);