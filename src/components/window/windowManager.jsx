import { useState, useCallback } from 'react';
import AppWindow from './AppWindow';
import FileExplorer from '../apps/FileExplorer/FileExplorer';
import TaskManager from '../apps/TaskManager/TaskManager';
import Notes from '../apps/Notes/Notes';
import VSCode from '../apps/DesktopApps/VSCode';
import Terminal from '../apps/DesktopApps/Terminal';
import Chrome from '../apps/DesktopApps/Chrome';
import vscodeIcon from '../../assets/taskbar/vs.png';
import terminalIcon from '../../assets/taskbar/terminal.png';
import chromeIcon from '../../assets/taskbar/chrome.png';
import fileExplorerIcon from '../../assets/taskbar/fileexp.png';
import taskManagerIcon from '../../assets/taskbar/taskmanager.png';
import notesIcon from '../../assets/taskbar/notepad.png';

const APP_DEFAULTS = {
  'file-explorer':{ width: 720, height: 480, title: 'File Explorer'},
  'task-manager':{ width: 560, height: 460, title: 'Task Manager'},
  'notes':{ width: 540, height: 420, title: ''},
  'vscode': { width: 900, height: 580, title: 'VS Code' },
  'terminal': { width: 760, height: 500, title: 'Terminal' },
  'chrome': { width: 960, height: 600, title: 'Chrome' },
};

const getAppIcon = (appId) => {
  if (appId === 'file-explorer') return <AppIcon src={fileExplorerIcon} alt="File Explorer" />;
  if (appId === 'task-manager') return <AppIcon src={taskManagerIcon} alt="Task Manager" />;
  if (appId === 'notes') return <AppIcon src={notesIcon} alt="Notepad" />;
  if (appId === 'vscode') return <AppIcon src={vscodeIcon} alt="VS Code" />;
  if (appId === 'terminal') return <AppIcon src={terminalIcon} alt="Terminal" />;
  if (appId === 'chrome') return <AppIcon src={chromeIcon} alt="Chrome" />;
  return null;
};

const APP_MENUS = {
  'file-explorer':[],
  'task-manager':[],
  'notes':[],
  'vscode':[],
  'terminal':[],
  'chrome':[],
};

const APP_COMPONENTS = {
  'file-explorer': FileExplorer,
  'task-manager': TaskManager,
  'notes': Notes,
  'vscode': VSCode,
  'terminal': Terminal,
  'chrome': Chrome,
};

export default function WindowManager({
  windows=[],
  activeWinId,
  onFocus,
  onClose,
  onMinimize,
  onTitleChange,
}) {
  const [geometry, setGeometry] = useState({});
  const [newFileSignals,setNewFileSignals]=useState({});
  const [titleRenameRequests,setTitleRenameRequests]=useState({});
  const getMaxRect = () => ({
    x:0,
    y:0,
    width:window.innerWidth,
    height:window.innerHeight - 52,
  });
  const getDefaultRestoreRect = useCallback((id) => {
    const index = windows.findIndex((w) => w.id === id);
    const win = windows[index];
    const defaults = APP_DEFAULTS[win?.appId] || { width: 600, height: 400 };
    const offset = Math.max(0, index) * 24;
    return {
      x:60 + offset,
      y:40 + offset,
      width:defaults.width,
      height:defaults.height,
    };
  },[windows]);

  const handleChange = useCallback((id, rect) =>{
    setGeometry((prev) =>({ ...prev, [id]: rect }));
  },[]);
  const handleMaximize = useCallback((id) =>{
    setGeometry((prev) => {
      const current = prev[id];
      const win = windows.find((w) => w.id === id);
      const wasImplicitMaximized = !current && !!win?.startMaximized;
      if (current?.isMaximized || wasImplicitMaximized) {
        const restore = current?.restoreRect || getDefaultRestoreRect(id);
        return {
          ...prev,
          [id]:{
            ...restore,
            isMaximized:false,
            restoreRect:null,
          },
        };
      }

      const baseRect = current || getDefaultRestoreRect(id);

      return {
        ...prev,
        [id]:{
          ...getMaxRect(),
          isMaximized:true,
          restoreRect:{
            x:baseRect.x,
            y:baseRect.y,
            width:baseRect.width,
            height:baseRect.height,
          },
        },
      };
    });
  },[windows,getDefaultRestoreRect]);

  return (
    <>
      {windows.map((win, index) => {
        const defaults = APP_DEFAULTS[win.appId] || { width: 600, height: 400, title: win.appId };
        const offset= index * 24;
        const storedGeo = geometry[win.id];
        const geo= storedGeo || (win.startMaximized ? {
          ...getMaxRect(),
          isMaximized:true,
          restoreRect:{
            x:60+offset,
            y:40+offset,
            width:defaults.width,
            height:defaults.height,
          },
        } : {
          x:60+offset,
          y:40+offset,
          width:defaults.width,
          height:defaults.height,
        });

        const AppModule = APP_COMPONENTS[win.appId];
        const AppComponent = (
          AppModule &&
          typeof AppModule === 'object' &&
          typeof AppModule.default === 'function'
        ) ? AppModule.default : AppModule;
        const canRender = typeof AppComponent === 'function';
        const windowTitle = win.title || defaults.title;

        return (
          <AppWindow
            key={win.id}
            id={win.id}
            title={windowTitle}
            icon={getAppIcon(win.appId)}
            x={geo.x}
            y={geo.y}
            width={geo.width}
            height={geo.height}
            isMaximized={!!geo.isMaximized}
            isActive={win.id === activeWinId}
            isMinimized={win.minimized}
            menuItems={APP_MENUS[win.appId] || []}
            onFocus={onFocus}
            onClose={onClose}
            onMinimize={onMinimize}
            onMaximize={handleMaximize}
            onChange={handleChange}
            onTitleAdd={win.appId==='notes' ? (id)=>setNewFileSignals((prev)=>({
              ...prev,
              [id]:(prev[id] || 0) + 1,
            })) : undefined}
            onTitleRename={win.appId==='notes' ? (id,nextTitle)=>setTitleRenameRequests((prev)=>({
              ...prev,
              [id]:{ value: nextTitle, token: Date.now() },
            })) : undefined}
          >
            {canRender ? (
              <AppComponent
                windowId={win.id}
                onWindowTitleChange={(title)=>onTitleChange?.(win.id,title)}
                newFileSignal={newFileSignals[win.id] || 0}
                titleRenameRequest={titleRenameRequests[win.id] || null}
              />
            ) : <div>Unable to load app.</div>}
          </AppWindow>
        );
      })}
    </>
  );
}

function AppIcon({ src, alt }) {
  return (
    <img src={src} alt={alt} width="12" height="12" draggable="false" style={{ display: 'block' }} />
  );
}
