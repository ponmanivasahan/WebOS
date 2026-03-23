import { useState, useCallback } from 'react';
import AppWindow from './AppWindow';
import FileExplorer from '../apps/FileExplorer/FileExplorer';
import TaskManager from '../apps/TaskManager/TaskManager';
import Notes from '../apps/Notes/Notes';

const APP_DEFAULTS = {
  'file-explorer':{ width: 720, height: 480, title: 'File Explorer'},
  'task-manager':{ width: 560, height: 460, title: 'Task Manager'},
  'notes':{ width: 540, height: 420, title: 'Notes'},
};

const getAppIcon = (appId) => {
  if (appId === 'file-explorer') return <FolderIcon />;
  if (appId === 'task-manager')return <TaskIcon />;
  if (appId === 'notes') return <NoteIcon />;
  return null;
};

const APP_MENUS = {
  'file-explorer':[
    {label:'File'},{label:'Edit'},{label:'View'},{label:'Help'},
  ],
  'task-manager':[
    {label:'File'},{label:'Edit'},{label:'View'},
  ],
  'notes':[
    {label:'File'},{label:'Edit'},{label:'Format'},{label:'Help'},
  ],
};

export default function WindowManager({
  windows=[],
  activeWinId,
  onFocus,
  onClose,
  onMinimize,
}) {
  const [geometry, setGeometry] = useState({});

  const handleChange = useCallback((id, rect) =>{
    setGeometry((prev) =>({ ...prev, [id]: rect }));
  },[]);
  const handleMaximize = useCallback((id) =>{
    setGeometry((prev) =>({
      ...prev,
      [id]:{
        x:0,
        y:0,
        width:window.innerWidth,
        height:window.innerHeight - 36,
      },
    }));
  },[]);

  return (
    <>
      {windows.map((win, index) => {
        const defaults = APP_DEFAULTS[win.appId] || { width: 600, height: 400, title: win.appId };
        const offset= index * 24;
        const geo= geometry[win.id] || {
          x:60+offset,
          y:40+offset,
          width:defaults.width,
          height:defaults.height,
        };

        return (
          <AppWindow
            key={win.id}
            id={win.id}
            title={win.title || defaults.title}
            icon={getAppIcon(win.appId)}
            x={geo.x}
            y={geo.y}
            width={geo.width}
            height={geo.height}
            isActive={win.id === activeWinId}
            isMinimized={win.minimized}
            menuItems={APP_MENUS[win.appId] || []}
            onFocus={onFocus}
            onClose={onClose}
            onMinimize={onMinimize}
            onMaximize={handleMaximize}
            onChange={handleChange}
          >
            {win.appId ==='file-explorer' && <FileExplorer/>}
            {win.appId ==='task-manager'&& <TaskManager />}
            {win.appId ==='notes' && <Notes/>}
          </AppWindow>
        );
      })}
    </>
  );
}
function FolderIcon(){
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"
        fill="#f0c040" stroke="#a08000" strokeWidth="1" />
    </svg>
  );
}
function TaskIcon(){
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3" width="16" height="18" rx="2"
        fill="#fff" stroke="#888" strokeWidth="1" />
      <line x1="7" y1="8"  x2="17" y2="8"  stroke="#555" strokeWidth="1.2" />
      <line x1="7" y1="11" x2="17" y2="11" stroke="#555" strokeWidth="1.2" />
      <line x1="7" y1="14" x2="13" y2="14" stroke="#555" strokeWidth="1.2" />
    </svg>
  );
}
function NoteIcon(){
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3" width="16" height="18" rx="2"
        fill="#fffde0" stroke="#cca000" strokeWidth="1" />
      <line x1="7" y1="8"  x2="17" y2="8"  stroke="#bbb" strokeWidth="1" />
      <line x1="7" y1="11" x2="17" y2="11" stroke="#bbb" strokeWidth="1" />
      <line x1="7" y1="14" x2="14" y2="14" stroke="#bbb" strokeWidth="1" />
    </svg>
  );
}