/* Translate between the roles form and the roles list in the sidebar. This can
 * be achieved more efficiently than here by translating into some intermediate
 * structure, but this way is more readable and debuggable. */

var roles = new Array('authors', 'maintainers', 'copyright', 'editors', 'translators');
var required_roles = new Array('authors', 'maintainers', 'copyright');

/* TODO: Check that required roles are specified */

function get_user_list() {
    var userlist = new Array();
    for (var i in roles) {
       var users = $('#'+roles[i]).val().split(',');
       for (var j in users) {
           if ( $.inArray(users[j], userlist) == -1 && users[j] != '') {
               userlist.push(users[j]);
           }
       }
    }
    return userlist;
};

/* Create rows for the roles form.*/
function create_row(user_id) {
    id_list = roles.concat(["user", "remove"]);
    for (i in id_list) {
	var last_row_td = $('#roles-last-row-' + id_list[i]);
	if(last_row_td.attr("class") == "table-row-bottom")
	    last_row_td.attr("class", "table-row-general");
	last_row_td.attr("id", "");
    }
    var row = $('<tr class="roles-row" user_id="'+user_id+'">');
    if ( user_id ) {
        $('<td id="roles-last-row-user" class="table-row-bottom">').html(user_id).appendTo(row);
    } else {
        // Get a text input field to add a new role.
        $('<td id="roles-last-row-user" class="table-row-bottom">')
	    .append($('<input id="edit-new-username" type="text">').blur(fix_role_checkboxes))
	    .appendTo(row);
    };
    for (i in roles) {
        $('<td id="roles-last-row-' + roles[i] + '" class="table-row-bottom" style="text-align:center;">')
        .append($('<input type="checkbox" id="checkbox-'
                  +roles[i]+'-'+user_id+'">'))
        .appendTo(row);
    };
    $('<td id="roles-last-row-remove" style="text-align:center;">')
//	.append($('<img src="/static/images/delete_icon.png" alt="Delete" id="remove-'+user_id+'">').click(clear_role_checkboxes))
	.append($('<img src="helper_files/delete_icon.png" alt="Delete" id="remove-'+user_id+'">').click(clear_role_checkboxes))
	.appendTo(row);
    return row;
};

/* Once the checkboxes are created, check them. */
function populate_roles_checkboxes() {
    // Populate all the roles checkboxes from the hidden fields.
    for (var i in roles) {
       var users = $('#'+roles[i]).val().split(',');
       for (var j in users) {
           $('#checkbox-'+roles[i]+'-'+users[j]).attr('checked', 'checked');
       }
    }
};

/* Get the values for the roles fields from the checkboxes */
function populate_roles_fields () {
    // Populate the fields from the roles table
    for (var i in roles) {
       var current_role = new Array();
       $('.roles-row').each(function(index) {
           user = $(this).attr('user_id');
           if ($('#checkbox-'+roles[i]+'-'+user).is(':checked')) {
               current_role.push(user);
           };
       });
       $('#'+roles[i]).val(current_role.join(','));
       $('#list-'+roles[i]+' span').html(current_role.join(', '));
    }
};

/* Clear the roles form after hiding it. */
function clear_roles_form () {
    $.modal.close();
    //$('#roles-picker').slideUp('slow', function() {
        // Clear all the role form fields.
        $('.roles-row').remove();
    //});
};

// After adding a user role, fix it and get the checkboxes sorted
function fix_role_checkboxes(e) {
    var user_id = $(this).val();
    $(this)
        .parent()
        .html(user_id)
        .parent()
        .attr('user_id', user_id);
    for (var i in roles) {
       $('#checkbox-'+roles[i]+'-')
       .attr('id', 'checkbox-'+roles[i]+'-'+user_id);
    }
    $('#remove-')
	.attr('id', 'remove-'+user_id);
};

// Clear all role checkboxes in a row
function clear_role_checkboxes(e) {
    var user_id = $(this).attr('id').substr(7);
    for (var i in roles) {
       $('#checkbox-'+roles[i]+'-'+user_id).attr('checked', false);
    }
};

// Max: added this for the swooshy wait message
jQuery.fn.center = function () {
    this.css("position","fixed");
//  this.css("top", (($(window).height() - this.outerHeight()) / 2) + $(window).scrollTop() + "px");
    this.css("top", $("#content h1").offset().top + "px");
    this.css("left", (($(window).width() - this.outerWidth()) / 2) + $(window).scrollLeft() + "px");
    return this;
}

$(document).ready(function()
{

    // Slide in the service document picker on the login page.
    $('#pick-sd').click(function(e) {
        e.preventDefault();
        $('#login-line').slideUp('slow');
        $('#sd-picker').slideDown('slow');
    });

    // Return to the default service document url if cancelled.
    $('#sd-cancel').click(function(e) {
        e.preventDefault();
        $('#service_document_url').val($('#service_document_url').attr('default_val'));
        $('#sd-picker').slideUp('slow');
        $('#login-line').slideDown('slow');
    });

    // A friendly message confirming that the upload is happening.
// Max: added #url-submit and .forward-button (metadata page) too
    $('#file-submit, #url-submit, #metadata .forward-button').click(function(e) {
        $('#upload-wait').center();
        $('#upload-wait').slideDown('slow');
    });

    // URL import upload field, enter pressed
    //$("#url_text").keyup(function(event){
    //  if(event.keyCode == 13){
    //    $('#file-submit').removeAttr('disabled');
    //    $('#file-submit').click();
    //  }
    //});

////////////////////////////////////
// Max's additions to .ready() here:
////////////////////////////////////

/* Moved this portion back directly into the file because 'headerh' wasn't always correctly calculated when done from th external file.

  var winh = $(window).height();
  var headerh = $("#header-container").outerHeight();
  var wfnh = $("#workflownav-wrap").outerHeight();
  var contentp = parseInt($("#content").css("paddingTop"));
  var contentp = contentp + parseInt($("#content").css("paddingBottom"));
  var phwh = $("#pageheader-wrap").outerHeight();

  // Make the iframe fit exactly inside the remaining space
  $("iframe").height(winh - headerh - wfnh - contentp - phwh + 5);
  $("iframe").width($(window).width() - 53);

  // Give the page's header the correct top margin (since the elements above it are in a fixed position)
  $("#content").css({'margin-top': headerh + wfnh})

*/
  var ma = $("#module-actions .advanced").outerWidth();

  // Truncate the title if it gets too long
  if ($("iframe").length != 0) {
    $("#page-title").css({'white-space': 'nowrap', 'max-width': $(window).width() - ma - 100});
  }

  // Toggle advanced mode explanation on hover
  $("#expertmode").mouseover(function(){
    if ($("#advanced-message").css("display") == 'none') {
      $("#basic-message").show();
      $(this).addClass("expert-activated");
    }
  }).mouseout(function(){
    if ($("#advanced-message").css("display") == 'none') {
      $("#basic-message").hide();
      $(this).removeClass("expert-activated");
    }
  });

  // Display advanced mode notice on click
  $("#expertmode").toggle(function(){
    $("#advanced-message").show();
    $("#basic-message").hide();
    $(this).addClass("expert-activated");
    $(".advanced").show();
    $("#expand-advanced").hide();
  }, function(){
    $("#advanced-message").hide();
    $("#expand-advanced").show();
    $(this).removeClass("expert-activated");
    $(".advanced").hide();
  });

  // Main landing page ("choose"): Make each of the upload/import boxes the same width (i.e. basically no wider than the URL option)
  // (Cloning due to lack of width when #url-submit has 'display' set to 'none' (this is a total hack ... better suggestions welcome))
  var clone = $("#url-submit").clone().css({"visibility":"hidden","height":"1px"}).appendTo('body');
  var clonew = $(clone).outerWidth();         
  $('body>#url-submit').remove();
  $(".upload-form").width($("#url_text").width() + clonew + 20);

  // Confirm if user really wants to sign out before work is uploaded
  var confirmMsg1 = "Are you sure you want to sign out? \n\nYour module has not been uploaded and any work on it will be lost if you sign out now.";
  var confirmMsg2 = "Are you sure you want to leave this page? \n\nYour module has not been uploaded and any work on it will be lost if you return to the beginning.";
  var confirmMsg3 = "Are you sure you want to leave this page? \n\nYour changes have not been saved and any work will be lost if you leave this page.";
  var confirmMsg4 = "Are you sure you want to leave this page? \n\nYour module has not been uploaded and any work on it will be lost if you leave. \n\nTo attempt the upload again, click 'Cancel' and 'Try to upload again'.";
  var fp = "http://mountainbunker.org/~maxwell/oerpub/front-page-06.html";
  var hp = "http://mountainbunker.org/~maxwell/oerpub/choose-27.html";
  var pp = "http://mountainbunker.org/~maxwell/oerpub/preview-gdoc-03.html";
  $("#status a").click(function(){
    if ($("#edit-frame").length != 0) {
      var c = confirm(confirmMsg3);
      if (c == true) { 
        window.location = pp;
        return false;
      } else {
        return false;
      }
    } else if ($("#see-error").length != 0) {
      var c = confirm(confirmMsg4);
      if (c == true) { 
        window.location = fp;
        return false;
      } else {
        return false;
      }
    } else if ($("iframe").length != 0 || $("#metadata").length != 0) {
      var c = confirm(confirmMsg1);
      if (c == true) { 
        window.location = fp;
        return false;
      } else {
        return false;
      }
    } else {
      window.location = fp;
      return false;
    }
  });
  $("#back-to-chooser, #header h1 a, #start-over input").click(function(){
    if ($("#edit-frame").length != 0 || $("#metadata").length != 0 && $(this).attr("id") == 'back-to-chooser') {
      var c = confirm(confirmMsg3);
      if (c == true) { 
        window.location = pp;
        return false;
      } else {
        return false;
      }
    } else if ($("#see-error").length != 0) {
      var c = confirm(confirmMsg4);
      if (c == true) { 
        window.location = hp;
        return false;
      } else {
        return false;
      }
    } else if ($("iframe").length != 0 || $("#metadata").length != 0) {
      var c = confirm(confirmMsg2);
      if (c == true) { 
        window.location = hp;
        return false;
      } else {
        return false;
      }
    } else {
      window.location = hp;
        return false;
    }
  });


  // To reveal the "Not finding your module?" link
  $("#not-finding-link").toggle(function(){
    $("#not-finding").show();
  }, function(){                                  
    $("#not-finding").hide();
  });

  // Row highlighting for the table containing workarea contents
  $("#workarea-contents tbody tr").hover(function(){
    $(this).addClass('hovered-row');
  }, function(){
    $(this).removeClass('hovered-row');
  });

  // In table containing workarea contents, allow a user to select anywhere in the row in order to select the associated radio button.
  // Unless they're just cliking on the little icon that links to the module.
  // Also set that row's background color to be highlighted.
  $("#workarea-contents tbody tr").click(function(e){
    if( !$(e.target).is(".review-module-link, .review-module-link *") ) {
      $(this).find("input[type='radio']").attr("checked","checked");
      $("#workarea-contents tbody tr").removeClass("selected-row");
      $(this).addClass("selected-row");
      $(".forward-button").removeAttr("disabled");
    }
  });


  // Show error examples on "Describe your module" page (for mock-ups)
  $("#workflownav-container .forward-button").click(function(){
    if ($("#metadata").length != 0) {
      $("input[name='title']").val("(Untitled)")
      $("#formentry-title").addClass("error");
      $("#formentry-title .errortext").show();
      $("#ga-field").show();
      $("input[name='google_code_opener']").attr('checked', true);
      $("#formentry-ga").addClass("error");
      $("input[name='google_code']").val("AA-7654321")
      $("#formentry-ga .errortext").show();
    }
  });

  // Workgroup menu ("Describe your module" and "Choose module" pages) derived from Aaron Miller's work at http://www.awmcreative.com/blog/jquery/jquery-pop-menu/ 
  $("a.popMenu").click(function(event){
    var popOut = $(this).closest("ul.popMenu").find("ul.popOut");
    var popMenuLi = $(this).closest("ul.popMenu").children("li");
    if (popOut.css("display") == 'none') {
      popOut.show();
      popMenuLi.addClass("hover");
    } else {
      popOut.hide();
      popMenuLi.removeClass("hover");
    }
    return false;
  });
  $("html").click(function(event){
    var popOut = $(this).closest("ul.popMenu").find("ul.popOut");
    var popMenuLi = $(this).closest("ul.popMenu").children("li");
    popOut.hide();
    popMenuLi.removeClass("hover");
  });
  // Show the chosen workgroup as selected when it's been clicked
  $(".popOut li").has("a").click(function(){
    var popMenu = $(this).closest("li.popMenu");
    popMenu.find(".workarea-choice").text($(this).find("a").text());
    popMenu.find("ul.popOut").hide();
    popMenu.removeClass("hover");
  });

  // "Finish: Upload" button ("Describe your module" page)
  $("#metadata .forward-button").click(function(){
    $('.forward-button').attr('disabled','disabled');
    $('.forward-button').val('Uploading to Connexions ...');
    $('#back-steps .button').attr('disabled','disabled');
  });

  // Reveal Google Analtyics field ("Describe your module" page).  If it already has a value and they want to uncheck the checkbox, 
  // confirm this action, and if confirmed, remove the value.
  $("input[name=google_code_opener]").click(function(){
    var opener = $("input[name=google_code_opener]");
    var code = $("input[name=google_code]");
    var fielddisplay = $("#ga-field").css("display");
    if (fielddisplay != 'none' && code.val() !='') {
      var c = confirm("Are you sure you want to remove this Google Analytics Tracking Code?  \n\nYou can add another code later.");
      if (c == true) {
        code.val("");
        $("#ga-field").hide();
        opener.attr("checked", false);
      } else {
        return false;
      }
    } else if (fielddisplay != 'none') {
        $("#ga-field").hide();
        opener.attr("checked", false);
    } else {
        $("#ga-field").show();
        opener.attr("checked", true);
    }
  });

  // Reveal Featured Links field ("Describe your module" page)
  $("input[name=fl_opener]").click(function(){
    var opener = $("input[name=fl_opener]");
    var table = $("#featured-links-table");
    var fielddisplay = $("#fl-field").css("display");
    if (fielddisplay != 'none' && table.length) {
        table.remove();
        $("#fl-field").hide();
        opener.attr("checked", false);
    } else {
        $('#featuredlinks').modal();
    }
  });

  // Remove individual Featured Links ("Describe your module" page). When they're all gone, you can click the checkbox / hide the div again.
  $(".remove-link").click(function(){
    var c = confirm("Are you sure you want to remove this link?\n\nYou cannot undo its removal, but you can always manually add it again.");
    if (c == true) {
      $(this).closest("tr").hide('fast', function(){
        $(this).remove();
        if ($("#featured-links-table tr").length == 0) {
          $("input[name=fl_opener]").removeAttr("disabled");
          $("input[name=fl_opener]").removeAttr("title");
        }
      });
    } else {
      return false;
    }
  });

  // Reveal error message ("Failure" page)
  $("#see-error").click(function(){
    if ($("#error_message").css('display') == 'none') {
      $("#error_message").show();
      $("#see-error input").attr('checked', true);
    } else {
      $("#error_message").hide();
      $("#see-error input").attr('checked', false);
    }
  });


    // Show the edit roles form.
    $('#edit-roles').click(function(e) {
        // Populate the fields from the data.
        e.preventDefault();
        var users = get_user_list();
        for (var i in users) {
            $('#roles-table tbody').append(create_row(users[i]));
        };
        populate_roles_checkboxes();
        $('#roles-picker').modal();
    });

    // Hide the edit roles form.
    $('#cancel-roles').click(function(e) {
        e.preventDefault();
        clear_roles_form();
    });

    // Apply the changed roles.
    $('#submit-roles').click(function(e) {
        // Get the roles form data into the right fields
        e.preventDefault();
        populate_roles_fields();
        // Clear the form.
        clear_roles_form();
    });

    // Add a role.
    $('#add-role').click(function(e) {
        e.preventDefault();
        $('#roles-table tbody').append(create_row(''));
        $('#simplemodal-container').css('height', 'auto');
        $(window).trigger('resize.simplemodal');
	$('#edit-new-username').focus();
    });

    // Show the "New or existing module?" overlay.
    $('#show-neworexisting').click(function(e) {
        e.preventDefault();
        $('#neworexisting').modal();
    });

    // Hide the "New or existing module?" overlay.
    $('#cancel-neworexisting').click(function(e) {
        e.preventDefault();
        $.modal.close();
    });

    // Apply the "New or existing module?" overlay.
    $('#submit-neworexisting').click(function(e) {
        e.preventDefault();
        $.modal.close();
    });

    // Show the "Add Featured Links" form.
    $('#show-featuredlinks').click(function(e) {
        e.preventDefault();
        $('#featuredlinks').modal();
    });

    // Hide the "Add Featured Link" form.
    $('#cancel-featuredlinks').click(function(e) {
        e.preventDefault();
        $.modal.close();
    });

    // Apply the "Add Featured Link" form (this is just for the mock-up ... closing it really needs to add the .forminfo <p>, the table (or table row), and the "+ Create a new link" link).
    $('#submit-featuredlinks').click(function(e) {
        e.preventDefault();
        $.modal.close();
    });

    // Show the "Edit Featured Link" form.
    $('.edit-link').click(function(e) {
        e.preventDefault();
        $('#featuredlinks-edit').modal();
    });

    // Cancel the "Edit Featured Link" form.
    $('#cancel-featuredlinks-edit').click(function(e) {
        e.preventDefault();
        $.modal.close();
    });

    // Apply the "Edit Featured Link" form (this is just for the mock-up ... closing it really needs to display the new values in the links table).
    $('#submit-featuredlinks-edit').click(function(e) {
        e.preventDefault();
        $.modal.close();
    });

    // Show the "About Featured Links" overlay
    $('#show-featuredlinks-help').click(function(e) {
        e.preventDefault();
        $('#featuredlinks-help').modal();
    });
    // Close the "About Featured Links" overlay
    $('#close-featuredlinks-help').click(function(e) {
        e.preventDefault();
        $.modal.close();
    });



});

///////////////////////////////////
// Max's .resize() javascript here:
///////////////////////////////////

$(window).resize(function(){               

  var winh = $(window).height();
  var headerh = $("#header-container").outerHeight();
  var wfnh = $("#workflownav-wrap").outerHeight();
  var contentp = parseInt($("#content").css("paddingTop"));
  var contentp = contentp + parseInt($("#content").css("paddingBottom"));
  var phwh = $("#pageheader-wrap").outerHeight();
  var ma = $("#module-actions .advanced").outerWidth();

  // Make the iframe fit exactly inside the remaining space
  $("iframe").height(winh - headerh - wfnh - contentp - phwh + 5);
  $("iframe").width($(window).width() - 53);

  // Truncate the title if it gets too long
  if ($("iframe").length != 0) {
    $("#page-title").css({'white-space': 'nowrap', 'max-width': $(window).width() - ma - 100});
  }

});



// Google Picker API for the Google Docs import
function newPicker() {
google.load('picker', '1', {"callback" : createPicker});
}       

// Create and render a Picker object for selecting documents
function createPicker() {
var picker = new google.picker.PickerBuilder().
    addView(google.picker.ViewId.DOCUMENTS).
    setCallback(pickerCallback).
    build();
picker.setVisible(true);
}

// A simple callback implementation for Picker.
function pickerCallback(data) {
if(data.action == google.picker.Action.PICKED){
    document.getElementById('gdocs_resource_id').value = google.picker.ResourceId.generate(data.docs[0]);
    document.getElementById('gdocs_access_token').value = data.docs[0].accessToken;
    $('#file-submit').removeAttr('disabled');
    $('#file-submit').click();
}
}

