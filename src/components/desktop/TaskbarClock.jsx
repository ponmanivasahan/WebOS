import './desktop.css';
import useNow from '../../hooks/useNow';
const p2=(n)=>String(n).padStart(2,'0');
export default function TaskbarClock({ onClick, onContextMenu, isActive = false }){
const now=useNow();
const hh=p2(now.getHours());
const mm=p2(now.getMinutes());
const date=now.toLocaleDateString('en-GB',{
    day:'2-digit',month:'2-digit',year:'numeric',
});

return(
    <button
        type="button"
        className={`taskbar-clock${isActive ? ' is-active' : ''}`}
        title={`${hh}:${mm} ${date}`}
        onClick={onClick}
        onContextMenu={onContextMenu}
    >
        <span className="taskbar-clock-value">{hh}:{mm}</span>
        <span className="taskbar-date-value">{date}</span>
    </button>
)
}