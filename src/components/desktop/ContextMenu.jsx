export default function ContextMenu({x,y,items=[],onClose}){
  const safeX=Math.min(x,window.innerWidth-180);
  const safeY=Math.min(y,window.innerHeight-items.length*26-20)
  console.log(safeX);
  console.log(safeY);
   return(
    <ul className="context-menu" style={{top:safeY,left:safeX}} onMouseDown={(e)=>e.stopPropagation()}>
      {items.map((item,i)=>{
         // console.log(items);
         if(item.seperator){
            return <li key={i} className="context-menu-seperator" />;
         }
         return (
            <li key={i} className={`context-menu-item${item.disabled ? 'is-disabled' : ''}`} onClick={()=>{
               if(!item.disabled && item.action) item.action();
               onClose();
            }} >{item.label}</li>
         )

      })}
        
    </ul>
   )
}