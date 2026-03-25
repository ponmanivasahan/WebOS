import { useState, useCallback } from 'react';
import AppWindow from './AppWindow';
import FileExplorer from '../apps/FileExplorer/FileExplorer';
import TaskManager from '../apps/TaskManager/TaskManager';
import Notes from '../apps/Notes/Notes';
import vscodeIcon from '../../assets/taskbar/vscode.svg';
import terminalIcon from '../../assets/taskbar/terminal.svg';
import chromeIcon from '../../assets/taskbar/chrome.svg';
import fileExplorerIcon from '../../assets/taskbar/file-explorer.svg';
import taskManagerIcon from '../../assets/taskbar/task-manager.svg';
import notesIcon from '../../assets/taskbar/notes.svg';

const APP_DEFAULTS = {
  'file-explorer':{ width: 720, height: 480, title: 'File Explorer'},
  'task-manager':{ width: 560, height: 460, title: 'Task Manager'},
  'notes':{ width: 540, height: 420, title: 'Notes'},
  'vscode': { width: 900, height: 580, title: 'VS Code' },
  'terminal': { width: 760, height: 500, title: 'Terminal' },
  'chrome': { width: 960, height: 600, title: 'Chrome' },
};

const getAppIcon = (appId) => {
  if (appId === 'file-explorer') return <AppIcon src={fileExplorerIcon} alt="File Explorer" />;
  if (appId === 'task-manager') return <AppIcon src={taskManagerIcon} alt="Task Manager" />;
  if (appId === 'notes') return <AppIcon src={notesIcon} alt="Notes" />;
  if (appId === 'vscode') return <AppIcon src={vscodeIcon} alt="VS Code" />;
  if (appId === 'terminal') return <AppIcon src={terminalIcon} alt="Terminal" />;
  if (appId === 'chrome') return <AppIcon src={chromeIcon} alt="Chrome" />;
  return null;
};

const APP_MENUS = {
  'file-explorer':[],
  'task-manager':[
    {label:'File'},{label:'Edit'},{label:'View'},
  ],
  'notes':[
    {label:'File'},{label:'Edit'},{label:'Format'},{label:'Help'},
  ],
  'vscode':[
    {label:'File'},{label:'Edit'},{label:'Selection'},{label:'View'},{label:'Run'},{label:'Terminal'},{label:'Help'},
  ],
  'terminal':[
    {label:'File'},{label:'Edit'},{label:'View'},{label:'Help'},
  ],
  'chrome':[
    {label:'File'},{label:'Edit'},{label:'View'},{label:'History'},{label:'Bookmarks'},
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
  const getMaxRect = () => ({
    x:0,
    y:0,
    width:window.innerWidth,
    height:window.innerHeight - 48,
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
            isMaximized={!!geo.isMaximized}
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
            {win.appId === 'vscode' && <VSCodeShell />}
            {win.appId === 'terminal' && <TerminalShell />}
            {win.appId === 'chrome' && <ChromeShell />}
          </AppWindow>
        );
      })}
    </>
  );
}

function AppIcon({ src, alt }) {
  return (
    <img src={src} alt={alt} width="14" height="14" draggable="false" style={{ display: 'block' }} />
  );
}

function VSCodeShell() {
  return (
    <div className="mock-app mock-vscode">
      <aside className="mock-vscode-sidebar">
        <span>EXPLORER</span>
        <span>SEARCH</span>
        <span>SOURCE CONTROL</span>
        <span>RUN</span>
      </aside>
      <main className="mock-vscode-editor">
        <div className="mock-vscode-tabs">App.js | Taskbar.jsx | windowManager.jsx</div>
        <pre className="mock-vscode-code">{`const startMenu = useMemo(() => ({\n  layout: 'windows-11',\n  mode: 'local-apps-only'\n}), []);`}</pre>
      </main>
    </div>
  );
}

function TerminalShell() {
  return (
    <div className="mock-app mock-terminal">
      <div className="mock-terminal-header">PowerShell</div>
      <div className="mock-terminal-body">
        <div>PS D:\FlavorTown\WebOS&gt; npm start</div>
        <div>Starting the development server...</div>
        <div className="mock-terminal-caret">_</div>
      </div>
    </div>
  );
}

function ChromeShell() {
  return (
    <div className="mock-app mock-chrome">
      <div className="mock-chrome-toolbar">
        <div className="mock-chrome-dots">
          <span />
          <span />
          <span />
        </div>
        <div className="mock-chrome-address">https://flavortown.local/desktop</div>
      </div>
      <div className="mock-chrome-body">
        <h3>Chrome App Window</h3>
        <p>This runs as an internal window in your WebOS desktop.</p>
      </div>
    </div>
  );
}