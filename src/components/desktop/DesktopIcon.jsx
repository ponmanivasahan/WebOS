import {useRef} from 'react'
export default function DesktopIcon({label,icon,selected=false}){

    return(
        <div className={`desktop-icon${selected ? 'is-selected' : ''}`} onClick={handleClick} onContextMenu={handleContext}>
                 <div className="desktop-icon-img">{icon}</div>
                 <span className="desktop-icon-label">{label}</span>
        </div>
    )
}