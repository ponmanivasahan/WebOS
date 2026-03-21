import {useState,useCallback} from 'react';
import AppWindow from './AppWindow';
const getAppIcon=(appId)=>{
    if(appId==='file-explorer') return <FolderIcon />;
    if(appId==='task-manager') return <TaskIcon />;
    if(appId==='notes') return <NoteIcon />;
    return null;
}

export default function WindowManager({windows=[],activeWinId,onFocus,onClose,onMinimize,}){
  return(
    <AppWindow />
  )
}