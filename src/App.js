import {useState} from 'react';
import WelcomeScreen from './components/welcome/Welcome'
import './index.css'
import { OSProvider } from './context/OSContext';
import Desktop from './components/desktop/Desktop';

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
    setWindows((prev)=>[...prev,{id,appId,minimized:false,...meta}]);
    setActiveWinId(id);
  }

  const handleWinClick=(id)=>{
    if(id===activeWinId){
      setWindows((prev)=>
      prev.map((w)=>w.id===id ? {...w,minimized:!w.minimized}:w))
      setActiveWinId(null);
    }
    else{
      setWindows((prev)=>
      prev.map((w)=>w.id===id ? {...w,minimized:false}:w))
      setActiveWinId(id);
    }
  }
  return(
    <OSProvider>
      {stage==='welcome' && (
        <WelcomeScreen onComplete={()=>setStage('desktop')} />
      )}
      {stage==='desktop' && (
        <Desktop openWindows={windows} activeWinId={activeWinId} onWinClick={handleWinClick} onOpenApp={handleOpenApp} />
      )}
     </OSProvider>
  )
}
export default App

const APP_META={
  'file-explorer':{title:'File Explorer'},
  'task-manager':{title:'Task Manager'},
  'notes':{title:'Notes'},
};