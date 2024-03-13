//formatting bytes to MB/KB/GB for UI.
function formatSizeUnits(fileSize) {

    if (fileSize >=1073741824 ) { fileSize = (fileSize / 1073741824).toFixed(2) + "GB"; }
    else if(fileSize >= 1048576) { fileSize = (fileSize / 1048576).toFixed(2) + "MB"; }
    else if (fileSize >= 1024) {fileSize = (fileSize / 1024).toFixed(2) + "KB"; }
    else if (fileSize > 1) { fileSize = fileSize + "bytes"; }
    else if (fileSize == 1) { fileSize = fileSize + "byte"; }
    else {fileSize = "0 bytes"; }
    return fileSize;
    
   }
//shrinking the file name for UI.   
function shrinkFileName(fileName) {
    if (fileName <= 7) 
    { 
        return fileName;
    }
    return fileName.slice(0,7) + "...";
   }
function updateLocalStorage() {

    const storedFiles = JSON.parse(window.localStorage.getItem("selectedFiles")) || []; //holding the selected file as JSON object
    console.log(storedFiles); //self-checking
    // As I was struggling with the CSS I tried to dynamically resize my container (lines 28-32)
    const fileCount = storedFiles.length;
    const containerHeight = 7 + fileCount * 1.25;
    const containerWidth = Math.max(24,12 + fileCount * 2);
    document.querySelector(".uploaded-images").style.height = `${containerHeight}rem`;
    document.querySelector(".uploaded-images").style.width = `${containerWidth}rem`;
    //creating the list items (uploaded images)
    const currentUploaded = document.getElementById("localStorage-current");
    currentUploaded.innerHTML = "";
    storedFiles.forEach(file => {
        const li = document.createElement("li");
        li.classList.add("file-box");
        //image details to be shown inside the container - for UI (creating and implementing)
        const fileName = document.createElement("span");
        fileName.textContent = shrinkFileName(file.name);
        const fileSize = document.createElement("span");
        fileSize.textContent = formatSizeUnits(file.size);

        //creating the removal option and handling the removing scenario 
        const removeButton = document.createElement("button");
        removeButton.textContent = "X";
        removeButton.addEventListener("click", function () {
            removeFile(file);
            updateLocalStorage(); //updating the localStorage upon removal
    });

    //populating new elements and inserting new elements into the list of files
    li.appendChild(fileName);
    li.appendChild(fileSize);
    li.appendChild(removeButton);
    currentUploaded.appendChild(li);
});
   }
//removing files option
function removeFile(fileToRemove) {

    console.log("File to remove:", fileToRemove); //self-checking
    
    const storedFiles = JSON.parse(window.localStorage.getItem("selectedFiles")) || []; //holding the array of items upon removal
    console.log("Stored files:", storedFiles); //self-checking
    const updatedFiles = storedFiles.filter(file => file.name !== fileToRemove.name); //holding the array of items after removal
    console.log("Updated files:", updatedFiles); //self-checking

    const totalSize = calcTotalSize(updatedFiles); //keeping track of the size (for progress-bar)
    console.log("Total new size:", totalSize); //self-checking
    updateProgressBar(totalSize); //updating progress bar after removal

    window.localStorage.setItem("selectedFiles", JSON.stringify(updatedFiles)); //updating the local storage with the new set of items
}
//function that sums the size in bytes for each selected file
function calcTotalSize(files) {
    let totalSize = 0;
    for (const file of files) {
        totalSize += parseFloat(file.size);
    }
    console.log("Total size (in bytes):", totalSize);
    return totalSize;
}
//function that initializes the progress bar to avoid the default display.
function initProgressBar() {
    const storedFiles = JSON.parse(localStorage.getItem("selectedFiles")) || [] ;
    const totalSize = calcTotalSize(storedFiles);

    updateProgressBar(totalSize);
}
function updateProgressBar(totalSize) {
    const progressBar = document.querySelector(".gradient-bar"); //setting the progress bar as variant according to its class in HTML file - to change width
    //setting both the text and the space used as variants so I can later use the dynamic data for display.
    const text = document.getElementById("mb-left-num");
    const usage = document.getElementById("storage-used");

    const maxStorage = 100 * 1024 * 1024; //setting the max storage to 100MB.
    //handling the case where there's not enough memory left
    if (totalSize > maxStorage) { 
    alert("Not enough memory, please remove file/s and try again");
    }
    //validations
    let percentage;
    if (totalSize > 0) {
        percentage = (totalSize / maxStorage) * 100; 
    } else {
        percentage = 0;
    }
    //self-checking
    console.log("Total size (in bytes):", totalSize);
    console.log("Max storage (in bytes):", maxStorage);
    console.log("Percentage:", percentage);
    progressBar.style.width = percentage + "%"; //changing the width of the progress bar according to variant.
    //validations
    let formattedSize;
    if (totalSize > 0) {
        formattedSize = formatSizeUnits(totalSize);
    } else {
        formattedSize = "100 MB";
    }
    //changing the static text that was previously set to a dynamic one based on our results. 
    usage.textContent = formattedSize;
    text.textContent = formatSizeUnits(maxStorage - totalSize) + ' LEFT';
}
document.addEventListener("DOMContentLoaded", function() {
var fileSelector = document.getElementById("fileSelector");
initProgressBar(); //initializing progress bar to 0 and 100MB.


fileSelector.addEventListener("change", (event) => {
    const files = event.target.files;
    //allowed formats validation

    const allowedFormats = ["image/png", "image/jpeg", "image/jpg"];
for (const file of files) {
    if (!allowedFormats.includes(file.type)) {
        alert("Invalid file type! Please select a Supported file type (JPG/PNG/JPEG");
        fileSelector.value = null;
        return;
    }
}
    //creating an array of files; The array holds the name and the size of the file that is selected.
  if (files.length > 0) {
    const selectedFiles = JSON.parse(window.localStorage.getItem("selectedFiles")) || []; //wether there are already files or not
    
    const newFiles = Array.from(files).map(file => ({
        name: file.name,
        size:file.size, 
    }));
    selectedFiles.push(...newFiles); //this assures that even if there are multiple choices of a single file, it'll be inserted to the array.
    //calculating the total size and updating the progress bar accordingly
    const totalSize = calcTotalSize(selectedFiles);
    console.log(totalSize);
    updateProgressBar(totalSize);
    
    window.localStorage.setItem("selectedFiles", JSON.stringify(selectedFiles));
   
    updateLocalStorage(); //calling the function to update accordingly when adding a new file/files
  }
  //handling the case where user wants to remove a file/files
  document.getElementById("localStorage-current").addEventListener("click",function(e) {
    if (e.target.tagName === "BUTTON" && e.target.textContent === "X") {
        const fileName = e.target.dataset.fileName;
        const fileToRemove = JSON.parse(window.localStorage.getItem("selectedFiles")).find(file => file.name === fileName);
        if (fileToRemove) {
            removeFile(fileToRemove);
            updateLocalStorage();
        }

     }   
});

});

updateLocalStorage();
});