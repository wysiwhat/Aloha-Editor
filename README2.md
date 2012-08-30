What is This?
=========

Educational content doesn't quite match the HTML model (especially educational books).
For example, HTML has no notion of glossary terms and definitions, exercise problems and solutions, equations, etc.

This editor provides a WYSIWYG way of editing such material.

It also supports collaborative editing via a small nodejs server.

Under the hood it uses http://aloha-editor.org

 How can I contribute?
=======================

 Developing the client side Javascript
---------------------------------------

Fork it and optionally compile the coffee files using http://coffeescript.org

    cd .. && git clone https://github.com/alohaeditor/Aloha-Editor.git # We need aloha right next to oerpub.editor
    coffee -c -w *.coffee toolbar/lib/*.coffee appmenu/*.coffee

Then, drop both directories into an apache webserver and point your browser to the oerpub.editor.
(This is how we host it on github)

 Running the Collaboration server
----------------------------------

This one's easy:

    npm install . # Downloads all the dependencies
    node server.js