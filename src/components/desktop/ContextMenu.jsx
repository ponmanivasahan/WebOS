export default function ContextMenu({x,y,items=[],onClose,variant='desktop'}){
   const menuWidth=variant==='icon' ? 240 : 390;
   const rowHeight=variant==='icon' ? 36 : 42;
   const safeX=Math.max(0,Math.min(x,window.innerWidth-menuWidth));
   const safeY=Math.max(0,Math.min(y,window.innerHeight-items.length*rowHeight-24));
   return(
    <ul className={`context-menu${variant==='icon' ? ' context-menu--compact' : ''}`} style={{top:safeY,left:safeX}} onMouseDown={(e)=>e.stopPropagation()}>
      {items.map((item,i)=>{
         if(item.separator){
            return <li key={i} className="context-menu-seperator" />;
         }
         return (
            <li key={i} className={`context-menu-item${item.disabled ? ' is-disabled' : ''}`} onClick={()=>{
               if(!item.disabled && item.action) item.action();
               onClose?.();
            }} >
              <span className="context-menu-item-left">
                <span className="context-menu-item-icon">{item.icon || ''}</span>
                <span>{item.label}</span>
              </span>
                     <span className="context-menu-item-right">{item.rightLabel || (item.hasArrow ? '›' : '')}</span>
            </li>
         )

      })}
        
    </ul>
   )
}