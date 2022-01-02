// MUST have this Event Listener for any of our Cordova code to work:
// Listen for the event of "deviceready" to confirm the infrastructure of our app has loaded
document.addEventListener("deviceready", onDeviceReady, false);

// Define the onDeviceReady Function, where ALL our future code needs to be
function onDeviceReady() {
  console.log("NOW we're ready to rock!");

// ----------------- Variables ----------------- 
// Objects for the Sign Up, Log In, Log Out buttons
// $ for a jQuery powered Variable (Object)
// el representing an HTML Element
// FmSignUp is the name
// $() jQuery search string to find
// An HTML Element with an ID of formSignUp
// DO NOT FORGET THE # SIGN!
const $elFmSignUp = $("#formSignUp"),
      $elFmLogIn = $("#formLogIn"),
      $elBtnLogOut = $("#btnLogOut");
// Variable for the Save Comic Form
const $elFmSaveComic = $("#formSaveComic");

// Variable to keep track of who last logged in
// When app is new, this is junk data
// When app has been used, there should be data here (from log in or log out actions)
let uid = localStorage.getItem("whoIsLoggedIn");

// Variable that is the pattern of a strong password, based on Regular Expressions - RegExp() is built-in JS
// can be const? ... 
let strongPassword = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$\^&\*])(?=.{7,})");

// Create a new PouchDB database. Version 1: all Users access the same DB; Version 2: each has their own
// let myComicsDB = new PouchDB("db");

// Version 2 of creating the Db:
// Create a Variable not assigned to a specific Database, yet
let myComicsDB;

// Vraiable fo rthe Dlete collection button
const $elBtnDeleteCollection = $("#btnDeleteCollection");

// Variable to keep track of which Comic we've clicked on
let comicWIP = "";

// Variable for the button to take a photo
const $elBtnTakePhoto = $("#btnTakePhoto");

// ----------------- Auto-login Code ----------------- 
// Function to initial a Database per user
function fnInitDB() {
  console.log("fnInitDB() is running");

  // Read whoIsLoggedIn to get their email
  // Note: uid doesn't always work because of the workflow
  let emailForDB = localStorage.getItem("whoIsLoggedIn");
  // new PouchDB() is 'smart' enough to either CREATE or LOAD a Database
  myComicsDB = new PouchDB(emailForDB);
  
  // Return our initialized database back to the rest of the app
  return myComicsDB;
} // END fnInitDB()

// Conditional Statement to check the value in whoIsLoggedIn
if(uid === "" || uid === null || uid === undefined) { 
  console.log("No one is logged in, so keep them at #pgWelcome");
} else {
  console.log("Someone last logged in. Move them to #pgHome " + uid);

  // So move them to #pgHome
  $(":mobile-pagecontainer").pagecontainer("change", "#pgHome");
  // Set the <footer>
  $(".userEmail").html(uid);
  // Initialize Database for this User
  fnInitDB();
  // Load current set of comics
  fnViewComics();
} // END If..Else Auto-login code

// ----------------- Functions ----------------- 
// Function for Sign Up subroutine
function fmSignUp(event) {
  // Stop the refresh - don't kick us out of the app
  event.preventDefault();
  console.log("fmSignUp(event) is running");

  // Object to read the <inputs> in the <form>
  let $elInEmailSignUp = $("#inputEmailSignUp"),
      $elInPasswordSignUp = $("#inputPasswordSignUp"),
      $elInPasswordConfirmSignUp = $("#inputPasswordConfirmSignUp");

  // First, a Conditional Statement to check if password is strong, and then the rest of the code as normal
  if(strongPassword.test($elInPasswordSignUp.val())) {
    console.log("Password is strong enough: " + $elInPasswordSignUp.val());

    // Conditional Statement (If..Else Statement) to check if something is true or not
    // Check if the Password and the Password Conform <inputs> match (before checking if account exists)
    if($elInPasswordSignUp.val() != $elInPasswordConfirmSignUp.val()) {
      console.log("Passwords do not match!");
      // On-screen popup for the user
      window.alert("Passwords do not match!");
      // Clear the Password <inputs> so they can try again
      // NOTE: .val("") has NO space in between ""
      // .val(" ") with a space would INSERT a byte of data
      $elInPasswordSignUp.val("");
      $elInPasswordConfirmSignUp.val("");
      // Add set focus to PasswordSignUp for ease of use
    } else {
      console.log("Passwords DO match!"); 
      // Read the values of the email and password fields to confirm if account already exists or not
      // Note: the email is UPPERCASED so there is no problem in the future
      let $tmpValInEmailSignUp = $elInEmailSignUp.val().toUpperCase(), 
          $tmpValInPasswordSignup = $elInPasswordSignUp.val();

      // Conditional statement to confirm if account has been saved to localStorage or not
      // localStorage.setItem("memorylocale01", "victor@campos.com");
      // localStorage.setItem(email, password);
      if(localStorage.getItem($tmpValInEmailSignUp) === null) {
        console.log("New User detected");
        // Now that we've confirmed they are a new user, store their data (thus creating an account)
        localStorage.setItem($tmpValInEmailSignUp, $tmpValInPasswordSignup);
        window.alert("Welcome new user!");  
        // Then clear the <form> for a new user
        $elFmSignUp[0].reset();
        console.log("User saved: " + $tmpValInEmailSignUp);
      } else {
        console.log("Returning user");
        window.alert("You already have an account!");
      } // END If..Else user check
    } // END If..Else password matching 

  } else {
    console.log("Password is weak: " + $elInPasswordSignUp.val());
    window.alert("Password should have uppercase, lowercase letters, numbers, symbols, and be at least seven characters long!");
    $elInPasswordSignUp.val("");
    $elInPasswordConfirmSignUp.val("");
  } // END If..Else for strong password

} // END fmSignUp(event)

// Function for Log In subroutine
function fmLogIn(event) {
  event.preventDefault();
  console.log("fmLogIn(event) is running");

  // Objects for Email & Password, plus their Values
  let $elInEmailLogIn = $("#inputEmailLogIn"),
      $elInPasswordLogIn = $("#inputPasswordLogIn"),
      $tmpValInEmailLogIn = $elInEmailLogIn.val().toUpperCase(),
      $tmpValInPasswordLogIn = $elInPasswordLogIn.val();

  // Condtional Statement to check if account exists or not
  if(localStorage.getItem($tmpValInEmailLogIn) === null) { 
    console.log("Account doesn't exist");
    window.alert("You don't have an account yet");
  } else {
    console.log("Accound DOES exist");

    // Conditional Statement to check if the current password matches saved password
    if($tmpValInPasswordLogIn === localStorage.getItem($tmpValInEmailLogIn)) { 
      console.log("Passwords DO match!");
      // Move them from current screen to a new screen
      $(":mobile-pagecontainer").pagecontainer("change", "#pgHome");
      console.log("Moved to #pgHome as " + $tmpValInEmailLogIn);
      // Set whoIsLoggedIn for the auto-login system
      localStorage.setItem("whoIsLoggedIn", $tmpValInEmailLogIn);
      // Write their email on-screen to show who is logged in
      $(".userEmail").html($tmpValInEmailLogIn);
      // Initialize Database for this User
      fnInitDB();
      // Load current set of comics
      fnViewComics();
    } else {
      console.log("Wrong password!");
      window.alert("Wrong password!");
      $elInPasswordLogIn.val("");
    } // END If..Else password matching
  } // END If..Else if User exists
} // END fmLogIn(event)

// Function for Logging Out
function fnLogOut() {
  console.log("fnLogOut() is running");

  // Conditional Statement (a Switch) to confirm if they really want to log out
  switch(window.confirm("Do you want to log out?")) {
    case true:
      console.log("They DO want to log out");
      $elFmSignUp[0].reset();
      $elFmLogIn[0].reset();
        $(":mobile-pagecontainer").pagecontainer("change", "#kittycat"); // Obviously write YOUR #pgWelcome
        // Set whoIsLoggedIn as no one for the auto-login system
        localStorage.setItem("whoIsLoggedIn", "");  // Maybe look up .clearItem()...
      break;
    case false:
      console.log("They don't want to log out");
      break;
    case "Admin":
      console.log("Hello admin!");
      break;
    default:
      console.log("Unkown error");
      break;
  } // END Switch to log out out or not
} // END fnLogOut()

// Function to prepare the comic data before saving
function fnPrepComic() {
  console.log("fnPrepComic() is running");

  // Variables about the Comic
  let $valInTitleSave = $("#inputTitleSave").val(),
      $valInNumberSave = $("#inputNumberSave").val(),
      $valInYearSave = $("#inputYearSave").val(),
      $valInPublisherSave = $("#inputPublisherSave").val(),
      $valInNotesSave = $("#inputNotesSave").val(),
      $valInPhotoSave = $("#inPhotoSaveComic").val();

    // Bundle that data into one Variable in JSON format (for PouchDB)
    let tmpComic = {
      "_id" : $valInTitleSave.replace(/\W/g, "") + $valInYearSave + $valInNumberSave, 
      "title" : $valInTitleSave,
      "number" : $valInNumberSave,
      "year" : $valInYearSave,
      "publisher" : $valInPublisherSave,
      "notes" : $valInNotesSave,
      "photo" : $valInPhotoSave
    }; // JSON data

    // After, return the bundle of data for further use
    return tmpComic;
} // END fnPrepComic()

// Function to Save a Comic
function fnSaveComic(event) {
  event.preventDefault();
  console.log("fnSaveComic() is running");

  // Run the Function to get and prepare the data
  let aComic = fnPrepComic();

  // Attempt to save the data the database
  myComicsDB.put(aComic, function(failure, success){
    if(failure) {
      // If the JSON Object returned is "failure"...
      console.log("Error: " + failure.message);
      window.alert("Comic already saved!");
    } else {
      // If the JSON Object returned is "success"...
      console.log("Saved the comic: " + success.ok);
      window.alert("Comic saved!");
      // Clear the Form for a new entry
      $elFmSaveComic[0].reset();
      // Hide the image placeholder
      $("#inPhotoSaveImg").hide();
      // Update the View comics screen
      fnViewComics();
    } // END If..Else Failure/Success
  }); // END .put()
} // END fnSaveComic(event)

// Function to display the Comics
function fnViewComics() {
  console.log("fnViewComics() is running");

  // Retrieve all the comic data [.allDocs() gets all _id data]. 
  // {} - Options = Sort A - Z (based on _id) and also get each Field of each entry (Doc)
  myComicsDB.allDocs({"ascending":true, "include_docs":true}, function(failure, success){
    if(failure) {
      console.log("Error: " + failure.message);
    } else {
      // Result is an Object (Variable) that is the whole database: success
      // There are rows of comics (that we refer to via Array Syntax): .rows[x]
      // There IS a document here: .doc
      // Then read whatever property you created: .title
      // console.log("Success: " + success.rows[0].doc.title); move it into the next if/else

      // Check if there is data to display
      if(success.rows[0] === undefined) {
        console.log("No comics saved yet");
        // No data at Row 1, so write the message on-screen
        $("#divViewComics").html("No comics saved, yet!");
      } else {
        // There IS data at Row 1, so tell us how many exist
        console.log("Number of comics to display: " + success.rows.length);
        console.log("First comic: " + success.rows[0].doc.title);

        // To display the data, we'll create a <table> and populate it with the comics
        // Create a Variable (Object) to store the HTML code
        let comicData = "<table> <tr> <th>Title</th> <th>#</th> <th>Year</th> </tr>";
        
        // Conditional Statement to iternate through the data
        for(let i = 0; i < success.rows.length; i++) {
          // Build a String with JavaScript code, alternating and ADD it to the waiting Variable
          // Attach a Class to each row so it's clickable via Event Listner. NOTE the use of single quote (') versus double-quite (")
          // Attach an ID to each row, for later when we tap it view it/edit it, based on the _id
          comicData += "<tr class='btnShowComicInfo' id='" + success.rows[i].doc._id + "'> <td>" + success.rows[i].doc.title + "</td> <td>" + success.rows[i].doc.number + "</td> <td>" + success.rows[i].doc.year + "</td> </tr>";
        }  // END For loop
        
        // ADD to the Variable the end of the <table> via += 
          comicData += "</table>";

        // After the dynamic Table is generated, display it on-screen
        $("#divViewComics").html(comicData);
      } // END If..Else for data-checking
    } // END If..Else .allDocs()
  }); // END .allDocs()
} // END fnViewComics()

// Then run the Function to view Comics - remove once we have multi databases 
// fnViewComics();

// Function to delete whole collection, and reiniitze the database
function fnDeleteCollection() {
  console.log("fnDeleteCollection() is running");

  // Confirm deletion with User
  if(window.confirm("Are you sure you want to delete the whole collection?")) {
    console.log("They do want to delete...");
    // Confirm deletion with User AGAIN
    if(window.confirm("Are you sure? there is NO undue!")) {
      console.log("They really want to delete...");
      // Delete the PouchDB memory location and re-init it so data can be stored again
      myComicsDB.destroy(function(failure, success){
        if(failure) {
          console.log("Error deleting Db: " + failure.message);
        } else {
          console.log("Db deleted: " + success.ok);
          fnInitDB(); // Note: PPTX has old code 
          fnViewComics();
          window.alert("All comics are gone!");
        } // END If..Else .destroy()
      }); // END .destroy()
    } else {
      console.log("They had second thoughts");
    } // END If..else second confirm delete
  } else {
    console.log("They DO NOT want to delete.");
  } // END If..Else confirm delete
} // END fnDeleteCollection()

// Function Edit (update) a comic
function fnEditComic(thisComic) {
  console.log("fnEditComic() is running: " + thisComic.context.id);

  // Get the all the Fields of the current comic  to show on screen an set comicWIP
  myComicsDB.get(thisComic.context.id, function(failure, success){
    if(failure) {
      console.log("Error getting the comic: " + failure.message);
    } else {
      console.log("Success getting the comic: " + success.title, success._rev);
      $("#inTitleEdit").val(success.title);
      $("#inNumberEdit").val(success.number);
      $("#inYearEdit").val(success.year);
      $("#inPublisherEdit").val(success.publisher);
      $("#inNotesEdit").val(success.notes);
      // Condtional Statement to show (or hide) the <img> if there is (or isn't) a photo saved in PouchDB
      if(success.photo === undefined) {
        console.log("No photo");
        // So hide the <img>
        $("#imgPhotoEdit").hide();
      } else {
        console.log("Current photo: " + success.photo);
        // So SHOW the <img>
        $("#imgPhotoEdit").show();
        // .attr() Method can read or write any Attribute of HTML
        $("#imgPhotoEdit").attr("src", success.photo);
        // Set the path when resaving
        $("#inPhotoEdit").val(success.photo);
      } // END If..Else load photo
      comicWIP = success._id;
    } // END If..Else .get()
  }); // END .get()
  $(":mobile-pagecontainer").pagecontainer("change", "#pgComicViewEdit", {"role":"dialog"});
} // END fnEditComic()

function fnEditComicConfirm(event) {
  event.preventDefault();
  console.log("fneditcomicconfirm() is running: " + comicWIP);

  // Read any data that changed (or not) to resave to DB
  let $valInTitleEdit = $("#inTitleEdit").val(),
      $valInNumberEdit = $("#inNumberEdit").val(),
      $valInYearEdit = $("#inYearEdit").val(),
      $valInPublisherEdit = $("#inPublisherEdit").val(),
      $valInNotesEdit = $("#inNotesEdit").val(),
      $valInPhotoEdit = $("#inPhotoEdit").val();

  // First get the data about to be updated, then reinstert with new _rev
  myComicsDB.get(comicWIP, function(failure, success){
    if(failure) {
      console.log("Error: " + failure.message);
    } else {
      console.log("About to update " + success._id);
      // Re-insert ALL fields including _id & _rev back to PouchDB
      myComicsDB.put({
          "_id": success._id,
          "_rev": success._rev,
          "title": $valInTitleEdit,
          "number": $valInNumberEdit,
          "year": $valInYearEdit,
          "publisher": $valInPublisherEdit,
          "notes": $valInNotesEdit,
          "photo": $valInPhotoEdit
        }, function(failure, success){
          if(failure) {
              console.log("Error: " + failure.message);
          } else {
              console.log("Updated: " + success.id, success.rev);
              fnViewComics();
              $("#pgComicViewEdit").dialog("close");
          } // END If..Else .put()
      }); // END .put()
    } // END If..Else .get()
  }); // END .get() for udpate
} // END FNeDITCONFIRM()

function fnEditComicDelete() {
  console.log("fnEditComicDelete() is running");

  // Before .remove() the one entry, first confirm it exists in the DB, and then ask User to confirm delete
  myComicsDB.get(comicWIP, function(failure, success){
    if(failure) {
      console.log("Error: " + failure.message);
    } else {
      console.log("Deleting: " + success._id);
      if(window.confirm("Are you sure you wish to delete this comic?")) {
        console.log("They do want to delete");

        myComicsDB.remove(success, function(failure, success){
          if(failure) {
            console.log("Couldn't dlete: " + failure.message);
          } else {
            console.log("Deleted comic: " + success.ok);
            fnViewComics();
            $("#pgComicViewEdit").dialog("close");
            comicWIP = "";
          } // END ifelse.remove() 
        }); // END .remove()
      } else {
        console.log("They DO NOT want to delete");
      } // END If..Else Confirm
    } // END If..Else .get()
  }); // END .get()
} // fnEditcomicDelete

function fnEditComicCancel() {
  console.log("fnEditComicCancel() is running");

  $("#pgComicViewEdit").dialog("close");
  console.log("Closed Edit screen");
} // END fneditcomiccancel

function fnTakePhoto() {
  console.log("fnTakePhoto() is running"); 

  // Use the .getPicture() Method of the camera Object (exposed by the Plugin)
  navigator.camera.getPicture(
    function(success){
      console.log("Got photo: " + success);
      // Store that photo path in the waiting <input> so it can be read, when we save the comic
      $("#inPhotoSaveComic").val(success);
      // Show the <img> placeholder
      $("#inPhotoSaveImg").show();
      // Set the image path
      $("#inPhotoSaveImg").attr("src", success);
    }, 
    function(failure){
      console.log("Photo error: " +  failure);
    },
    {
      "quality": 55,
      "saveToPhotoAlbum": true,
      "targetWidth": 768,
      "targetHeight": 1024
    } 
    ); // END .getPicture()
} // END fnTakePhoto

// ----------------- Event Listners ----------------- 
// Event Listeners (EL) to wait for interaction with Objects
// For ELs related to <forms>, we need to capture the event to stop the refresh
$elFmSignUp.submit(function(){ fmSignUp(event); }); 
$elFmLogIn.submit(function(){ fmLogIn(event); });
// Note how the EL for the simple button does not need to capture the event (to prvent refresh)
$elBtnLogOut.on("click", fnLogOut); 
// Listen for Save Comic Form Submission
$elFmSaveComic.submit(function(){ fnSaveComic(event); });
// Listen for deleting the collection
$elBtnDeleteCollection.on("click", fnDeleteCollection);
// Listen for clicking a row of comics and pass the _id to the Function
$("#divViewComics").on("click", "tr.btnShowComicInfo", function(){fnEditComic( $(this) )});
$("#fmEditComicInfo").submit(function(){ fnEditComicConfirm(event); });
$("#btnDeleteComic").on("click", fnEditComicDelete);
$("#btnEditCancel").on("click", fnEditComicCancel);
// Listen for taking a photo
$elBtnTakePhoto.on("click", fnTakePhoto);
} // END onDeviceReady()