import './desktop.css';
export default function DesktopIcon({
   label,
   icon,
   selected=false,
   id,
   style,
   isMobile=false,
   isEditing=false,
   editValue='',
   isDragging=false,
   onSelect,
   onOpen,
   onContext,
   onEditChange,
   onEditCommit,
   onEditCancel,
   onDragStart,
   onDragEnd,
}){
     const handleClick=(e)=>{
        e.stopPropagation();
        onSelect?.(id);
        if(isMobile) onOpen?.(id);
     }

     const handleContext=(e)=>{
        e.preventDefault();
        e.stopPropagation();
        onSelect?.(id);
        onContext?.(e,id);
     }
    return(
      <div
         className={`desktop-icon${selected ? ' is-selected' : ''}${isDragging ? ' is-dragging' : ''}`}
         style={style}
         draggable={!isEditing && !isMobile}
         onDragStart={(e)=>onDragStart?.(e,id)}
         onDragEnd={onDragEnd}
         onClick={handleClick}
         onDoubleClick={isMobile ? undefined : (e)=>{if(isEditing) return; e.stopPropagation(); onOpen?.(id);}}
         onContextMenu={handleContext}
      >
                 <div className="desktop-icon-img">{icon}</div>
                 {isEditing ? (
                    <input
                       className="desktop-icon-name-input"
                       value={editValue}
                       autoFocus
                       onChange={(e)=>onEditChange?.(e.target.value)}
                       onClick={(e)=>e.stopPropagation()}
                       onDoubleClick={(e)=>e.stopPropagation()}
                       onBlur={()=>onEditCommit?.()}
                       onKeyDown={(e)=>{
                          if(e.key==='Enter') onEditCommit?.();
                          if(e.key==='Escape') onEditCancel?.();
                       }}
                    />
                 ) : (
                    <span className="desktop-icon-label">{label}</span>
                 )}
        </div>
    )
}