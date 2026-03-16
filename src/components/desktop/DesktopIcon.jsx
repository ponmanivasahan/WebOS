import {useRef} from 'react'
import './desktop.css';
export default function DesktopIcon({label,icon,selected=false,id,onSelect,onOpen,onContext}){
     const clickTimer=useRef(null);
     const handleClick=(e)=>{
        e.stopPropagation();
        if(clickTimer.current){
            clearTimeout(clickTimer.current);
            clickTimer.current=null;
            onOpen?.(id);
        }
        else{
            onSelect?.(id);
            clickTimer.current=setTimeout(()=>{
                clickTimer.current=null;
            },280)
        }
     }

     const handleContext=(e)=>{
        e.preventDefault();
        e.stopPropagation();
        onSelect?.(id);
        onContext?.(e,id);
     }
    return(
        <div className={`desktop-icon${selected ? 'is-selected' : ''}`} onClick={handleClick} onContextMenu={handleContext}>
                 <div className="desktop-icon-img">{icon}</div>
                 <span className="desktop-icon-label">{label}</span>
        </div>
    )
}