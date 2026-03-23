import {useRef,useCallback,useEffect} from 'react';
import './window.css';

export default function AppWindow({
    id,title='Window',icon=null,children,x=60,y=60,width=640,height=440,
    isActive=false,isMinimized=false,isMaximized=false,menuItems=[],
  statusText='',onFocus,onClose,onMinimize,onMaximize,onChange,
}){
    const dragState=useRef(null);
    const resizeState=useRef(null);
    const startDrag=useCallback((e)=>{
      if(isMaximized) return;
        if(e.button!==0) return;
        e.preventDefault();
        onFocus?.(id);
        dragState.current={
            startMouseX:e.clientX,
            startMouseY:e.clientY,
            startX:x,
            startY:y
        };

        const onMove=(me)=>{
            if(!dragState.current) return;
            const {startMouseX,startMouseY,startX,startY}=dragState.current;
            const nx=Math.max(0,startX+(me.clientX-startMouseX));
            const ny=Math.max(0,startY+(me.clientY-startMouseY));
            onChange?.(id,{x:nx,y:ny,width,height});
        }

        const onUp=()=>{
            dragState.current=null;
            window.removeEventListener('mousemove',onMove);
            window.removeEventListener('mouseup',onUp);
        }

        window.addEventListener('mousemove',onMove);
        window.addEventListener('mouseup',onUp);
    },[id,x,y,width,height,isMaximized,onFocus,onChange]);

    const startResize=useCallback((e,dir)=>{
      if(isMaximized) return;
        if(e.button!==0) return;
        e.preventDefault();
        e.stopPropagation();
        onFocus?.(id);
        resizeState.current={dir,startMouseX:e.clientX,
               startMouseY:e.clientY,startX:x,startY:y,startW:width,startH:height,
        };

        const onMove=(me)=>{
            if(!resizeState.current) return;
            const {dir:d,startMouseX,startMouseY,startX,startY,startW,startH}=resizeState.current;
            const dx=me.clientX-startMouseX;
            const dy=me.clientY-startMouseY;

            let nx=startX,ny=startY,nw=startW,nh=startH;

            if(d.includes('e')) nw=Math.max(200,startW+dx);
            if(d.includes('s')) nh=Math.max(120,startH+dy);
            if(d.includes('w')) {nw=Math.max(200,startW-dx); nx=startX+(startW-nw);}
            if(d.includes('n')) {nh=Math.max(120,startH-dy); ny=startY+(startH-nh);}
            onChange?.(id,{x:nx,y:ny,width:nw,height:nh});
        };

        const onUp=()=>{
            resizeState.current=null;
            window.removeEventListener('mousemove',onMove);
            window.removeEventListener('mouseup',onUp);
        };

        window.addEventListener('mousemove',onMove);
        window.addEventListener('mouseup',onUp);
    },[id,x,y,width,height,isMaximized,onFocus,onChange]);

    useEffect(()=>{
        return()=>{
            dragState.current=null;
            resizeState.current=null;
        };
    },[]);

    const TASKBAR_H=36;
    const safeX=Math.max(0,Math.min(x,window.innerWidth-width));
    const safeY=Math.max(0,Math.min(y,window.innerHeight-TASKBAR_H-30));

    return(
        <div className={['app-window',isActive ? 'is-active' : '',isMinimized?'is-minimized':'',].filter(Boolean).join(' ')}
        style={{left:safeX,top:safeY,width,height,zIndex:isActive ? 200:100,}}
        onMouseDown={()=>onFocus?.(id)}>
            {!isMaximized && ['n','s','e','w','nw','ne','sw','se'].map((dir) => (
        <div
          key={dir}
          className={`win-resize win-resize-${dir}`}
          onMouseDown={(e) => startResize(e, dir)}
        />
      ))}

      <div className="win-titlebar">
        <div className="win-drag-handle" onMouseDown={startDrag}>
            {icon && <div className='win-titlebar-icon'>{icon}</div>}
            <span className='win-title'>{title}</span>
        </div>

        <div className='win-controls'>
            <button className="win-ctrl-btn minimize" onClick={(e)=>{e.stopPropagation();onMinimize?.(id);}}
            title='Minimize'>
                -
            </button>

             <button
            className="win-ctrl-btn maximize"
            onClick={(e) => { e.stopPropagation(); onMaximize?.(id); }}
            title={isMaximized ? 'Restore' : 'Maximize'}
          >
            {isMaximized ? 'R' : 'M'}
          </button>

           <button
            className="win-ctrl-btn close"
            onClick={(e) => { e.stopPropagation(); onClose?.(id); }}
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>
          
         {menuItems.length > 0 && (
        <div className="win-menubar">
          {menuItems.map((item, i) => (
            <div key={i} className="win-menu-item">{item.label}</div>
          ))}
        </div>
      )}
 
      <div className="win-body win-body-inset">
        {children}
      </div>
 
      {statusText && (
        <div className="win-statusbar">
          <div className="win-status-panel">{statusText}</div>
        </div>
      )}
 

        </div>
    )
}