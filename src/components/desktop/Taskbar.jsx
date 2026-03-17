import TaskbarClock from './TaskbarClock';
export default function Taskbar({windows=[],activeWinId,onWinClick,onStartClick,}){
    return(
      <div className="taskbar">
        <button type="button" className="taskbar-start" onClick={onStartClick}>
          <div className="taskbar-start-icon">
            <span /><span /><span/><span />
          </div>
          Start
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

        <div className="taskbar-tray">
          <WifiIcon />
          <TaskbarClock />
        </div>
      </div>
    )
}

function WifiIcon(){
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke='#555' strokeWidth="2">
      <path d="M5 12.5C7.4 10.2 10 9 12 9s4.6 1.2 7 3.5"/>
      <path d="M8.5 16C9.9 14.8 11 14 12 14s2.1.8 3.5 2" />
      <circle cx="12" cy="19" r="1" fill="#555" />
    </svg>
  )
}