import TaskbarClock from './TaskbarClock';
import DevInfo from './DevInfo';
import { useState } from 'react';
export default function Taskbar({windows=[],activeWinId,onWinClick,onStartClick,}){
    const [devOpen,setDevOpen]=useState(false);  
  return(
    <>
      <div className="taskbar">
        <button type="button" className="taskbar-start" onClick={onStartClick}>
          <div className="taskbar-start-icon" aria-hidden="true">
            <BrandStartIcon />
          </div>
          Start
        </button>

        <button className={`taskbar-dev-btn${devOpen ? ' is-active' :''}`}
          onClick={()=>setDevOpen((v)=>!v)} title='Developer Info'>
            <DevBtnIcon />
            <span>Dev Info</span>
        </button>

        <div className="taskbar-divider" />
        <div className="taskbar-windows">
          {windows.map((win)=>(
            <button type="button" key={win.id} className={`taskbar-win-btn${win.id===activeWinId ? ' is-active' :''}`} onClick={()=>onWinClick?.(win.id)} title={win.title}>
              <span className="taskbar-win-btn-icon">{win.icon}</span>
             <span className="taskbar-win-btn-label">{win.title}</span>
            </button>
          ))}
        </div>


        <div className='taskbar-divider' />
        <div className="taskbar-tray">
          <span className="taskbar-tray-icon" aria-label="Network status">
            <WifiIcon />
          </span>
          <TaskbarClock />
        </div>
      </div>
      {devOpen && <DevInfo onClose={()=>setDevOpen(false)} />}
      </>
    )
}

function DevBtnIcon(){
  return(
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  )
}
function WifiIcon(){
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10a12.8 12.8 0 0 1 16 0" />
      <path d="M7.2 13.5a8 8 0 0 1 9.6 0" />
      <path d="M10.5 17a3.3 3.3 0 0 1 3 0" />
      <circle cx="12" cy="19" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function BrandStartIcon(){
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L19 6v7c0 4.4-2.4 6.9-7 9-4.6-2.1-7-4.6-7-9V6l7-4z" fill="currentColor" opacity="0.2" />
      <path d="M12 5.3 16.6 8v4.6c0 2.8-1.5 4.5-4.6 6-3.1-1.5-4.6-3.2-4.6-6V8L12 5.3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 8.7v5.6M9.2 11.5h5.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}