import {useState} from 'react';
import './desktop.css';
import useNow from '../../hooks/useNow';
const p2=(n)=>String(n).padStart(2,'0');
export default function TaskbarClock(){
const now=useNow();
const [tip,setTip]=useState(false);
const hh=p2(now.getHours());
const mm=p2(now.getMinutes());
const date=now.toLocaleDateString('en-US',{
    weekday:'long',year:'numeric',month:'long',day:'numeric',
})

return(
    <div className="taskbar-clock" onMouseEnter={()=>setTip(true)}
    onMouseLeave={()=>setTip(false)}>
        <span className="taskbar-clock-value">{hh}:{mm}</span>
        {tip && (
            <div className="taskbar-clock-tooltip">{date}</div>
        )}
    </div>
)
}