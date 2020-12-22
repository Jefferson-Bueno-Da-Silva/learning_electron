const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require('electron');
const fs = require('fs');
const path = require('path');

//JANELA PRINCIPAL
var mainWindow = null
async function createWindow(){
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  await mainWindow.loadFile('./src/pages/editor/index.html');

  // mainWindow.webContents.openDevTools();

  createNewFile();

  ipcMain.on('updateContent', function(event, data){
    file.content = data
  });

}

//SAVE FILE
function writeFile(filePath){
  try{
    fs.writeFile(filePath, file.content, function(err){
      
      //ERROR
      if(err) throw err;

      //SUCCESS
      file.path  = filePath;
      file.saved = true;
      file.name  = path.basename(filePath);

      mainWindow.webContents.send('setFile', file);

    })
  }catch(err){
    console.error(err)
  }
}


//CREATE FILE
var file = {} //ARQUIVO

function createNewFile(){
  file = {
    name: 'novo-arquivo.txt',
    content: '',
    saved: false,
    path: app.getPath('documents') + '/novo-arquivo.txt'
  };

  mainWindow.webContents.send('setFile', file);

}

//SAVE AS
async function saveFileAs(){
  //Dialog
  let dialogFile = await dialog.showSaveDialog({
    defaultPath: file.path
  });
  //CHECK CANCELLATION
  if(dialogFile.canceled){
    return false;
  }
  //SAVE FILE
  writeFile(dialogFile.filePath);
}

//SAVE FILE
function saveFile(){
  //SAVED
  if(file.saved){
    return writeFile(file.path)
  }
  //SAVE AS
  return saveFileAs();
}

//read file
function readFile(filePath){
  try{
    return fs.readFileSync(filePath, 'utf8');

  } catch(e){
    console.error(e);
    return '';
  }
}


// OPEN FILE
async function openFile(){
  //dialog
  dialogFile = await dialog.showOpenDialog({
    defaultPath: file.path,

  });
  
  //CHECK CANCELLATION
  if(dialogFile.canceled){
    return false;
  }

  //OPEN FILE
  file = {
    name : path.basename(dialogFile.filePaths[0]),
    content: readFile(dialogFile.filePaths[0]),
    saved: true,
    path: dialogFile.filePaths[0]
  }

  mainWindow.webContents.send('setFile', file);
  
}

//TEMPLATE MENU
const templateMenu = [
  {
    label: 'arquivo',
    submenu: [
      {
        label: 'Novo',
        accelerator: 'CmdOrCtrl+N',
        click(){
          createNewFile();
        }
        
      },
      {
        label: 'Abrir',
        accelerator: 'CmdOrCtrl+O',
        click(){
          openFile();
        }
      },
      {
        label: 'Salvar',
        accelerator: 'CmdOrCtrl+S',
        click(){
          saveFile();
        }
      },
      {
        label: 'Salvar como ...',
        accelerator: 'CmdOrCtrl+Shift+S',
        click(){
          saveFileAs();
        }
      },
      {
        label: 'Sair',
        accelerator: 'CmdOrCtrl+Q',
        role: process.platform === 'darwin'? 'close' : 'quit'
      }
    ]
  },
  {
    label: 'Editar',
    submenu:[
      {
        label : 'Desfazer',
        role  : 'undo'
      },
      {
        label : 'Refazer',
        role  : 'redo' 
      },
      {
        type: 'separator'
      },
      {
        label : 'Copiar',
        role  : 'copy'
      },
      {
        label : 'Recortar',
        role  : 'cut' 
      },
      {
        label : 'Colar',
        role  : 'paste' 
      }
    ]
  },
  {
    label: 'Ajuda',
    submenu:[
      {
        label: 'developed by: Jefferson',
        click(){
          shell.openExternal('https://github.com/Jefferson-Bueno-Da-Silva/learning_electron')
        }
      }
    ]
  }
];

//MENU
const menu = Menu.buildFromTemplate(templateMenu);

Menu.setApplicationMenu(menu);

//ON READY
app.whenReady().then(createWindow);

//ACTIVATE
app.on('activate', () => {
  if(BrowserWindow.getAllWindows().length === 0) createWindow();
})

