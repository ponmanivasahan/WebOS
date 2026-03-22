import {useState,useCallback} from 'react';
import AppWindow from './AppWindow';
import FileExplorer from '../apps/FileExplorer/FileExplorer';
import TaskManager from '../apps/TaskManager/TaskManager';

const APP_DEFAULTS={
  'file-explorer':{width:720,height:480,title:'File Explorer'},
  'task-manager':{width:560,height:460,title:'Task Manager'},
}

const getAppIcon=(appId)=>{
    if(appId==='file-explorer') return <FolderIcon />;
    if(appId==='task-manager') return <TaskIcon />;
    if(appId==='notes') return <NoteIcon />;
    return null;
}

const APP_MENUS={
  'file-explorer':[
    {label:'File'}, {label:'Edit'},{label:'View'}, {label:'Help'},
  ],
  'task-manager':[
    {label:'File'},{label:'Edit'} , {label:'View'},
  ]
}

export default function WindowManager({windows=[],activeWinId,onFocus,onClose,onMinimize,}){
  return(
    <AppWindow />
  )
}