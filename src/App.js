import {useState} from 'react';
import { OSProvider } from './context/OSContext';
import WelcomeScreen from './components/welcome/Welcome'
import Desktop from './components/desktop/Desktop';
import WindowManager from './components/window/windowManager';
import './index.css'

function App(){
  const [stage,setStage]=useState('welcome');
  const [windows,setWindows]=useState([]);
  const [activeWinId,setActiveWinId]=useState(null);

  const handleOpenApp=(appId)=>{
    const existing=windows.find((w)=>w.appId===appId);
    if(existing){
      setWindows((prev)=>
      prev.map((w)=>w.id===existing.id ?{...w,minimized:false}:w))
      setActiveWinId(existing.id);
      return;
    }
    const id=`${appId}-${Date.now()}`;
    const meta=APP_META[appId] || {title:appId,icon:null};
    setWindows((prev)=>[...prev,{id,appId,minimized:false,startMaximized:true,...meta}]);
    setActiveWinId(id);
  }

  const handleFocus=(id)=>{
    setActiveWinId(id);
    setWindows((prev)=>
    prev.map((w)=>w.id===id ? {...w,minimized:false}:w))
  };

  const handleClose=(id)=>{
    setWindows((prev)=>prev.filter((w)=>w.id !==id));
    setActiveWinId((cur)=>(cur===id ? null :cur));
  };

  const handleMinimize=(id)=>{
    setWindows((prev)=>
    prev.map((w)=>w.id===id ? {...w,minimized:true}:w));
    setActiveWinId((cur)=>(cur===id ? null : cur));
  };
  return(
    <OSProvider>
      {stage==='welcome' && (
        <WelcomeScreen onComplete={()=>setStage('desktop')} />
      )}
      {stage==='desktop' && (
        <>
        <Desktop openWindows={windows} activeWinId={activeWinId} onOpenApp={handleOpenApp} />

        <WindowManager windows={windows} activeWinId={activeWinId} onFocus={handleFocus} onClose={handleClose} onMinimize={handleMinimize} />
      </>
      )}
      
     </OSProvider>
  )
}
export default App

const APP_META={
  'file-explorer':{title:'File Explorer'},
  'task-manager':{title:'Task Manager'},
  'notes':{title:'Notes'},
  'vscode':{title:'VS Code'},
  'terminal':{title:'Terminal'},
  'chrome':{title:'Chrome'},
};