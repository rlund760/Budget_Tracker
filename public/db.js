const indexedDB = window.indexedDB

let db;
const request = indexedDB.open("budget",1)

request.onupgradeneeded = ( event => {
    var db = event.target.result;
    db.createObjectStore("PWAApp",{autoIncrement: true});
})


request.onsuccess = (event => {
    db = event.target.result;
    // When online
    if(navigator.online){
        getDataFromIndexedDB()
    }
})

request.onerror = function(event){
    console.log("error in initializing Indexed DB")
}

function getDataFromIndexedDB(){
    var tr = db.transaction(["PWAApp"],"readwrite")
    var store = tr.objectStore("PWAApp")
    var getData = store.getData()
    getData.onsuccess = function(){
          if(getData.result.length > 0){
              fetch("/api/transaction/bulk",{
                  method:"POST",
                  body:JSON.stringify(getData.result),
                  headers: {
                      Accept:"application/json, text/plain,*/*",
                      "Content-Type":"application/json"
                  }
              })
              .then( res => {
                  console.log("Bulk insert",res)
                  return res.json()
              })
              .then( () =>{
                var tr = db.transaction(["PWAApp"],"readwrite")
                var store = tr.objectStore("PWAApp")
                tr.clear()
              })
          }
    }
}

function saveRecord(newTransaction){
                var tr = db.transaction(["PWAApp"],"readwrite")
                var store = tr.objectStore("PWAApp")
                store.add(newTransaction)
}


window.addEventListener("online",getDataFromIndexedDB)