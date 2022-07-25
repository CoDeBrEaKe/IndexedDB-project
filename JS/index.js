const addForm = document.querySelector(".container form");
const data =  document.querySelectorAll(".container form input , textarea")
const successNote = document.querySelector(".container form p");
const searchForm = document.querySelector(".search  button");
const searchResults = document.querySelector(".search .results");
const inputID = document.querySelector(".search  .Query  input"); 
const queries = document.querySelector(".search .results .queries");
const dataArrange = document.querySelector(".search .results .data");
const warnID =  document.querySelector(".search .results  p");
const idDuplication = document.querySelector(".addition .container ul:first-child span");
const updateWarn = document.querySelector(".search .results  p:last-of-type");
let flag = true;
// Database setting up
let db;

window.onload = function() {
    let request = window.indexedDB.open('clinic' , 1);

    request.onerror =function(){
        console.log('Database Failed to Open');
    };
    request.onsuccess = function() {
        console.log('Database opened successfully');
        db = request.result;
    };
    request.onupgradeneeded = function(e){

        let db = e.target.result;
        let objectStore = db.createObjectStore('clinic', {keyPath:'num', autoIncrement:true});
        
        objectStore.createIndex('ID', 'ID', { unique: true });
        objectStore.createIndex('first', 'first', { unique: false });
        objectStore.createIndex('last', 'last', { unique: false });
        objectStore.createIndex('Gender', 'Gender', { unique: false });
        objectStore.createIndex('Date', 'Date', { unique: false });
        objectStore.createIndex('Age', 'Age', { unique: false });
        objectStore.createIndex('Blood', 'Blood', { unique: false });
        objectStore.createIndex('Diabetic', 'Diabetic', { unique: false });
        objectStore.createIndex('City', 'City', { unique: false });
        objectStore.createIndex('MRecord', 'MRecord', { unique: false });
    };  

};


addForm.onsubmit = addData;
// Add Data function
function addData(e)
{
    e.preventDefault();
    
    let chosenGender ;
    let diabetic;
    if (data[3].checked == true)
    {
        chosenGender = "Male";
    }
    else{
        chosenGender = "Female"
    }
    if (data[8].checked == true)
    {
        diabetic = "Has diabetes"
    }else{
        diabetic = "Not diabetic"
    }
    let newRecord = {ID:data[0].value,
         first:data[1].value ,
          last:data[2].value ,
           Gender:chosenGender ,
           Date:data[5].value,
           Age:data[6].value ,
            Blood:data[7].value,
            Diabetic:diabetic ,
            City:data[10].value ,
            MRecord:data[11].value
        };
    
    let transaction = db.transaction(['clinic'], 'readwrite');
    let objectStore = transaction.objectStore('clinic');
    let request = objectStore.add(newRecord);
    
    request.onsuccess = function() {
        // Clear the form, ready for adding the next entry
        for(let i = 0 ; i < 12 ; i++)
        {
            if(data[i].type == "radio")
            {
                data[i].checked = false;
            }
            
            data[i].value="";
        }
        
        successNote.style.display = "block";
        setTimeout(() => {successNote.style.display = "none"}, 2000);
        
    };
    transaction.onerror = function() {
        idDuplication.style.display = "inline";
        setTimeout(() => {successNote.style.display = "none"}, 2000);
        idDuplication.scrollIntoView({behavior:"smooth" , block:"center"});
    };
}



searchForm.onclick = displayData;


// display Data function
function displayData(e){
    e.preventDefault();

    // To clear the data
    while (dataArrange.firstChild) {
    dataArrange.removeChild(dataArrange.firstChild);    
    }
    while (queries.firstChild) {
    queries.removeChild(queries.firstChild);    
    }

  let objectStore = db.transaction('clinic').objectStore('clinic');
  objectStore.openCursor().onsuccess = function(e)
{
    let cursor = e.target.result;  
    if(cursor){
        if(cursor.value.ID == inputID.value)
        {
            const c = cursor.value;
            
            flag = false;
            warnID.style.display = "none";
           
            createData(dataArrange , c);

            addQueries(c);
            
            
        }    
        cursor.continue();     
    }
    if (flag == true){
    warnID.style.display = "block";
    setTimeout(() => {warnID.style.display = "none"}, 2000);
    warnID.scrollIntoView({behavior: "smooth", block: "end"});
    }
}  
flag =true;
}  


// Delete Data function
function deleteItem(e){
    //Retrieving ID from data note
    let noteId = Number(e.target.parentNode.getAttribute('data-note-id'));

    let transaction = db.transaction(['clinic'] , 'readwrite');
    let objectStore = transaction.objectStore('clinic');
    let request = objectStore.delete(noteId);
    transaction.oncomplete = function() {
    // delete the parent of the button
    // which is the list item, so it is no longer displayed
    while(queries.firstChild)
    queries.removeChild(queries.firstChild);
    while(dataArrange.firstChild)
    dataArrange.removeChild(dataArrange.firstChild);

}
}    


function createData(field , c){
    const span = document.createElement('span');
            span.textContent = `Name :- ${c.first} ${c.last}`
            field.appendChild(span);
            
            const span2 = document.createElement('span');
            span2.textContent = `Date of Birth :- ${c.Date}`
            field.appendChild(span2);

            const span3 = document.createElement('span');
            span3.textContent = `Gender :- ${c.Gender}`
            field.appendChild(span3);

            const span4= document.createElement('span');
            span4.textContent = `Age :- ${c.Age}`
            field.appendChild(span4);

            const span5= document.createElement('span');
            span5.textContent = `${c.Diabetic}`
            field.appendChild(span5);

            const span6= document.createElement('span');
            span6.textContent = `Blood Type :- ${c.Blood}`
            field.appendChild(span6);

            const span7= document.createElement('span');
            span7.textContent = `Medical Inforamtion :- ${c.MRecord}`
            field.appendChild(span7);
}



function addQueries(c){
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            queries.appendChild(deleteBtn);
            deleteBtn.onclick = deleteItem;

            // Edit Function
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            queries.appendChild(editBtn);

            editBtn.onclick = function(){
                   while(queries.firstChild){
                    queries.removeChild(queries.firstChild);
                   }
                    let medicalRecord = document.createElement("textarea");
                    medicalRecord.textContent = c.MRecord;
                    
                    queries.appendChild(medicalRecord);

                    let saveEdits = document.createElement("button");
                    saveEdits.textContent = "Save";
                    queries.appendChild(saveEdits);
                    saveEdits.onclick = function(){
                    let objectStore = db.transaction(["clinic"], "readwrite").objectStore("clinic");
                    
                    c.MRecord = medicalRecord.value; 
                    objectStore.put(c)

                    // Clearinggggggg
                    while(queries.firstChild)
                    queries.removeChild(queries.firstChild);
                    
                    while(dataArrange.firstChild){
                    dataArrange.removeChild(dataArrange.firstChild);

                    }
                        updateWarn.style.display = "block";
                        setTimeout(() => {updateWarn.style.display = "none"}, 2000);
                    }

                    let back = document.createElement("button");
                    back.textContent = "Back";
                    queries.appendChild(back);
                    back.onclick = function(){
                        while(queries.firstChild){
                    queries.removeChild(queries.firstChild);
                    }
                    addQueries(c);
                    }
            }

            // Print Function
            const printBtn = document.createElement('button');
            printBtn.textContent = 'Print';
            queries.appendChild(printBtn);


            printBtn.onclick = function() {
            my_window = window.open('', 'mywindow', 'status=1,width=350,height=150');
            my_window.document.write('<html><head><title>Print Me</title><link rel="stylesheet" type="text/css" href="../CSS/print.css"></head>');
            my_window.document.write('<body onafterprint="self.close()">');
            createData(my_window.document.body , c);
            
            my_window.document.write('</body></html>');
            
            setTimeout(() => {my_window.print()}, 500);
            }
            printBtn.scrollIntoView();
            queries.setAttribute('data-note-id', c.num);
    }