export default function ContextMenu({x,y,items=[],onClose}){
  const safeX=Math.max(0,Math.min(x,window.innerWidth-180));
  const safeY=Math.max(0,Math.min(y,window.innerHeight-items.length*26-20));
   return(
    <ul className="context-menu" style={{top:safeY,left:safeX}} onMouseDown={(e)=>e.stopPropagation()}>
      {items.map((item,i)=>{
         if(item.separator){
            return <li key={i} className="context-menu-seperator" />;
         }
         return (
            <li key={i} className={`context-menu-item${item.disabled ? ' is-disabled' : ''}`} onClick={()=>{
               if(!item.disabled && item.action) item.action();
               onClose?.();
            }} >{item.label}</li>
         )

      })}
        
    </ul>
   )
}