const { ipcRenderer } = require('electron')

//ELEMENTS
const textArea = document.getElementById('text');
const title    = document.getElementById('title');

//SET FILE
ipcRenderer.on('setFile', function(event, data){
    textArea.value = data.content
    title.innerHTML = data.name + ' | Editor'
});


//UPDADE TEXTAREA
function handleChangeText(){
    ipcRenderer.send('updateContent', textArea.value);
}