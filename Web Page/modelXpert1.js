//login & sign in form
const formOpenBtn = document.querySelector("#form-open"),
    home = document.querySelector(".home"),
    formContainer = document.querySelector(".form_container"),
    formCloseBtn = document.querySelector(".form_close"),
    signupBtn = document.querySelector("#signup"),
    loginBtn = document.querySelector("#login"),
    pwShowHide = document.querySelectorAll(".pw_hide");

formOpenBtn.addEventListener("click", () => home.classList.add("show"));
formCloseBtn.addEventListener("click", () => home.classList.remove("show"));

pwShowHide.forEach((icon) => {
    icon.addEventListener("click", () => {
        let getPwInput = icon.parentElement.querySelector("input");
        if (getPwInput.type === "password") {
            getPwInput.type = "text";
            icon.classList.replace("uil-eye-slash", "uil-eye");
        } else {
            getPwInput.type = "password";
            icon.classList.replace("uil-eye", "uil-eye-slash");
        }
    });
});

signupBtn.addEventListener("click", (e) => {
    e.preventDefault();
    formContainer.classList.add("active");
});
loginBtn.addEventListener("click", (e) => {
    e.preventDefault();
    formContainer.classList.remove("active");
});



//file upload button
// function myFunction() {
//     var x = document.getElementById("myFile");
//     var txt = "";
//     if ('files' in x) {
//         if (x.files.length == 0) {
//             txt = "Select one or more files.";
//         } else {
//             for (var i = 0; i < x.files.length; i++) {
//                 // txt += "<br><strong>" + (i + 1) + ". file</strong><br>";
//                 var file = x.files[i];

//                 if ('size' in file) {
//                     txt += "<strong>Size: " + file.size + " bytes <br>";
//                 }
//             }
//         }
//     }
//     else {
//         if (x.value == "") {
//             txt += "Select one or more files.";
//         } else {
//             txt += "The files property is not supported by your browser!";
//             txt += "<br>The path of the selected file: " + x.value; // If the browser does not support the files property, it will return the path of the selected file instead. 
//         }
//     }

//     function handleFiles(files) {
//         if (files.length > 0) {
//             const file = files[0];
//             const allowedFormats = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

//             if (allowedFormats.includes(file.type)) {
//                 alert(`File accepted: ${file.name}`);
//                 // You can now process the file (e.g., upload it or read its content)
//             } else {
//                 alert('Invalid file format. Only CSV and XLSX files are allowed.');
//             }
//         }
//     }

//     document.getElementById("demo").innerHTML = txt;
// }

document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');

    // Highlight the drop zone on dragover
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    // Remove highlight on dragleave
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    // Handle dropped files
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');

        const files = e.dataTransfer.files;
        handleFiles(files);
    });

    // Handle click to open file dialog
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    // Handle file input change
    fileInput.addEventListener('change', (e) => {
        const files = e.target.files;
        handleFiles(files);
    });

    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            const allowedFormats = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

            if (allowedFormats.includes(file.type)) {
                alert(`File accepted: ${file.name}`);
                // You can now process the file (e.g., upload it or read its content)
            } else {
                alert('Invalid file format. Only CSV and XLSX files are allowed.');
            }
        }
    }
});
