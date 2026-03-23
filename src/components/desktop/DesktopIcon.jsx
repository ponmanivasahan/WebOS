import './desktop.css';
export default function DesktopIcon({label,icon,selected=false,id,onSelect,onOpen,onContext}){
     const handleClick=(e)=>{
        e.stopPropagation();
        onSelect?.(id);
        onOpen?.(id);
     }

     const handleContext=(e)=>{
        e.preventDefault();
        e.stopPropagation();
        onSelect?.(id);
        onContext?.(e,id);
     }
    return(
        <div className={`desktop-icon${selected ? ' is-selected' : ''}`} onClick={handleClick} onContextMenu={handleContext}>
                 <div className="desktop-icon-img">{icon}</div>
                 <span className="desktop-icon-label">{label}</span>
        </div>
    )
}