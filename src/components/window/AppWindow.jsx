import {useRef,useCallback,useEffect,useState} from 'react';
import './window.css';

export default function AppWindow({
    id,title='Window',icon=null,children,x=60,y=60,width=640,height=440,
    isActive=false,isMinimized=false,isMaximized=false,menuItems=[],
  showTopbar=true,
  statusText='',onFocus,onClose,onMinimize,onMaximize,onChange,onTitleRename,onTitleAdd,
}){
    const dragState=useRef(null);
    const resizeState=useRef(null);
  const titleInputRef=useRef(null);
  const [isEditingTitle,setIsEditingTitle]=useState(false);
  const [titleDraft,setTitleDraft]=useState(title);
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(()=>{
    if(!isEditingTitle) setTitleDraft(title);
  },[title,isEditingTitle]);

  useEffect(()=>{
    if(isEditingTitle && titleInputRef.current){
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  },[isEditingTitle]);

  useEffect(() => {
    const onResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const commitTitleEdit=useCallback(()=>{
    const next=titleDraft.trim();
    if(next && next!==title) onTitleRename?.(id,next);
    setIsEditingTitle(false);
  },[titleDraft,title,onTitleRename,id]);
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

    const TASKBAR_H=48;
    const WINDOW_SIDE_GAP=isMaximized ? 0 : 8;
    const BOTTOM_GAP=isMaximized ? 0 : 8;
    const maxWidth=Math.max(240,viewport.width-(WINDOW_SIDE_GAP*2));
    const maxHeight=Math.max(140,viewport.height-TASKBAR_H-BOTTOM_GAP);
    const safeWidth=Math.min(width,maxWidth);
    const safeHeight=Math.min(height,maxHeight);
    const safeX=Math.max(WINDOW_SIDE_GAP,Math.min(x,viewport.width-WINDOW_SIDE_GAP-safeWidth));
    const safeY=Math.max(0,Math.min(y,viewport.height-TASKBAR_H-safeHeight));

    const windowStyle = isMaximized
      ? {
          left: 0,
          top: 0,
          width: viewport.width,
          height: Math.max(140, viewport.height - TASKBAR_H),
          zIndex: isActive ? 200 : 100,
        }
      : {
          left: safeX,
          top: safeY,
          width: safeWidth,
          height: safeHeight,
          zIndex: isActive ? 200 : 100,
        };

    return(
      <div className={['app-window',isActive ? 'is-active' : '',isMinimized?'is-minimized':'',isMaximized ? 'is-maximized' : '',].filter(Boolean).join(' ')}
        style={windowStyle}
        onMouseDown={()=>onFocus?.(id)}>
            {!isMaximized && ['n','s','e','w','nw','ne','sw','se'].map((dir) => (
        <div
          key={dir}
          className={`win-resize win-resize-${dir}`}
          onMouseDown={(e) => startResize(e, dir)}
        />
      ))}

        {showTopbar && (
          <>
            <div className="win-titlebar">
              <div className="win-drag-handle" onMouseDown={(e)=>{ if(!isEditingTitle) startDrag(e); }}>
                {icon && <div className='win-titlebar-icon'>{icon}</div>}
                {isEditingTitle ? (
                  <input
                    ref={titleInputRef}
                    className='win-title-edit-input'
                    value={titleDraft}
                    onMouseDown={(e)=>e.stopPropagation()}
                    onChange={(e)=>setTitleDraft(e.target.value)}
                    onBlur={commitTitleEdit}
                    onKeyDown={(e)=>{
                      if(e.key==='Enter'){
                        e.preventDefault();
                        commitTitleEdit();
                      }
                      if(e.key==='Escape'){
                        e.preventDefault();
                        setTitleDraft(title);
                        setIsEditingTitle(false);
                      }
                    }}
                  />
                ) : (
                  <span
                    className='win-title'
                    onDoubleClick={(e)=>{
                      if(!onTitleRename) return;
                      e.stopPropagation();
                      setIsEditingTitle(true);
                    }}
                  >
                    {title}
                  </span>
                )}
                {onTitleAdd && (
                  <button
                    className='win-title-add-btn win-title-action'
                    onMouseDown={(e)=>e.stopPropagation()}
                    onClick={(e)=>{e.stopPropagation(); onTitleAdd(id);}}
                    title='New file'
                  >
                    +
                  </button>
                )}
              </div>

              <div className='win-controls'>
                <button className="win-ctrl-btn minimize" onClick={(e)=>{e.stopPropagation();onMinimize?.(id);}}
                title='Minimize'>
                  -
                </button>

                <button
                  className={`win-ctrl-btn maximize${isMaximized ? ' is-restored' : ''}`}
                  onClick={(e) => { e.stopPropagation(); onMaximize?.(id); }}
                  title={isMaximized ? 'Restore' : 'Maximize'}
                >
                  {isMaximized ? (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <rect x="2" y="1" width="8" height="8" stroke="currentColor" strokeWidth="1" />
                      <path d="M1 3.5V11h7.5" stroke="currentColor" strokeWidth="1" />
                    </svg>
                  ) : (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <rect x="1.5" y="1.5" width="9" height="9" stroke="currentColor" strokeWidth="1" />
                    </svg>
                  )}
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
          </>
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