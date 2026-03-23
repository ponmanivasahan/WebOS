import {useState,useEffect,useRef,useCallback} from 'react';
import useFileSystem from './useFileSystem';
import './Fileexplorer.css';

function FolderIcon({open=false,size=16}){
    return(
         <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d={open
          ? 'M2 9a2 2 0 0 1 2-2h4l2 2h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9z'
          : 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z'}
        fill="#f0c040" stroke="#a08000" strokeWidth="1"
      />
    </svg>
    )
}

function FileIcon({size=16}){
    return(
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M6 2h8l4 4v16H6V2z"  fill="#fff"  stroke="#888" strokeWidth="1" />
      <path d="M14 2v4h4"            fill="none"  stroke="#888" strokeWidth="1" />
      <line x1="8" y1="10" x2="16" y2="10" stroke="#ccc" strokeWidth="1" />
      <line x1="8" y1="13" x2="16" y2="13" stroke="#ccc" strokeWidth="1" />
      <line x1="8" y1="16" x2="13" y2="16" stroke="#ccc" strokeWidth="1" />
    </svg>
    )
}

const BackIcon=()=> <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>;
const ForwardIcon=()=>  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>;
const UpIcon=()=>  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>;

function TreeNode({path,name,depth,fs,currentPath,onNavigate}){
    const [open,setOpen]=useState(depth===0);
    const children=(fs[path] || []).filter((e)=>e.type==='folder');
    const hasKids=children.length>0;
    const isActive=currentPath===path;

    return(
        <>
        <div className={`fe-tree-item${isActive ? 'is-selected' : ''}`} onClick={()=>{onNavigate(path); if(hasKids) setOpen((v)=>!v);}}>
        <div className='fe-tree-indent' style={{width:depth*12}} />
        <div className='fe-tree-toggle' >{hasKids ? (open ? '▼' : '▶') : ''} </div>
        <div className='fe-tree-icon'><FolderIcon open={open && isActive} size={14} /> </div>
        <span className='fe-tree-label'>{name}</span>
        </div>

        {open && children.map((child)=>{
            const childPath=(path==='/' ? '' :path)+'/'+child.name;
            return(
                <TreeNode key={child.id}  path={childPath} name={child.name} depth={depth+1} fs={fs}
                 currentPath={currentPath} onNavigate={onNavigate}
                />
            )
        })}
        </>
    );
}

function CtxMenu({x,y,items,onClose}){
    const safeX=Math.min(x,window.innerWidth-170);
    const safeY=Math.min(y,window.innerHeight-items.length*26-10);
    return(
        <ul className='fe-content-menu' style={{top:safeY,left:safeX}} onMouseDown={(e)=>e.stopPropagation()}>
          {items.map((item,i)=>
        item.sep ? <li key={i} className='fe-ctx-sep' /> :
        (<li key={i} className={`fe-ctx-item${item.disabled ? 'is-disabled' : ''}`} onClick={()=>{item.action?.(); onClose();}}>
            {item.label}
        </li>
    ))}
</ul>
    )
}

export default function FileExplorer(){
    const { fs,listDir,createFile,createFolder,deleteEntry,renameEntry}=useFileSystem();

    const [history,setHistory]=useState(['/']);
    const [histIdx,setHistIdx]=useState(0);
    const currentPath=history[histIdx];
    const [addrInput,setAddrInput]=useState('/');
    useEffect(()=>setAddrInput(currentPath),[currentPath]);

    const [selected,setSelected]=useState(null);
    const [renaming,setRenaming]=useState(null);
    const [renameVal,setRenameVal]=useState(null);
    const [ctx,setCtx]=useState(null);
    const renameRef=useRef(null);
    useEffect(()=>{
        if(renaming) renameRef.current?.focus();
    },[renaming]);

    const navigate=useCallback((path)=>{
        setHistory((prev)=>[...prev.slice(0,histIdx+1),path]);
        setHistIdx((i)=>i+1);
        setSelected(null);
        setRenaming(null);
        setCtx(null);
    },[histIdx]);

    const goBack=()=>{if(histIdx>0) {setHistIdx((i)=>i-1); setSelected(null);}};
    const  goForward=()=>{if (histIdx<history.length-1){setHistIdx((i)=>i+1); setSelected(null);}};
    const goUp=()=>{
        if(currentPath==='/') return;
        const parts=currentPath.split('/').filter(Boolean);
        parts.pop();
        navigate(parts.length===0 ? '/':'/'+parts.join('/'));
    }

    const handleNewFolder=useCallback(()=>{
        const {name}=createFolder(currentPath);
        setTimeout(()=>{
            const entry=listDir(currentPath).find((e)=>e.name===name);
            if(entry){
                setSelected(entry.id);
                setRenaming(entry.id);
                setRenameVal(name);
            }
        },30);
    },[createFolder,currentPath,listDir]);

    const handleNewFile=useCallback(()=>{
        const {name}=createFile(currentPath);
        setTimeout(()=>{
            const entry=listDir(currentPath).find((e)=>e.name===name);
            if(entry){
                setSelected(entry.id);
                setRenaming(entry.id);
                setRenameVal(name);
            }
        },30);
    },[createFile,currentPath,listDir]);

    const handleDelete=useCallback(()=>{
        if(!selected) return;
        deleteEntry(currentPath,selected);
        setSelected(null);
    },[selected,deleteEntry,currentPath]);

    const startRename=useCallback((entry)=>{
        setSelected(entry.id);
        setRenaming(entry.id);
        setRenameVal(entry.name);
    },[]);

    const commitRename=useCallback(()=>{
        if(renaming && renameVal.trim()) renameEntry(currentPath,renaming,renameVal.trim());
        setRenaming(null);
    },[renaming,renameVal,renameEntry,currentPath]);

    const handleOpen=useCallback((entry)=>{
        if(entry.type==='folder'){
            navigate((currentPath==='/' ? '' :currentPath)+'/'+entry.name);
        }
    },[currentPath,navigate]);

    const handleEntryCtx=useCallback((e,entry)=>{
        e.preventDefault();
        e.stopPropagation();
        setSelected(entry.id);
        setCtx({x:e.clientX,y:e.clientY,
            items:[
                {label:'Open',action:()=>handleOpen(entry)},
                {sep:true},
                {label:'Rename',action:()=>startRename(entry)},
                {label:'Delete',action:()=>{deleteEntry(currentPath,entry.id); setSelected(null);}},
            ],
        });
    },[handleOpen,startRename,deleteEntry,currentPath]);

    const handleMainCtx=useCallback((e)=>{
        if(e.target.closest('.fe-list-row')) return;
        e.preventDefault();
        setCtx({x:e.clientX,y:e.clientY,
            items:[
                {label:'New Folder',action:handleNewFolder},
                {label:'New Text Document',action:handleNewFile},
                {sep:true},
                {label:'Refresh',action:()=>setSelected(null)},
            ],
        })
    },[handleNewFolder,handleNewFile]);

    const entries=listDir(currentPath);

    return(
        <div className='fe-shell' onClick={()=>{setCtx(null); setSelected(null);}} >
            <div className='fe-toolbar'>
                <button className='fe-toolbar-btn' onClick={goBack} disabled={histIdx===0}><BackIcon />Back</button>
                <button className='fe-toolbar-btn' onClick={goForward} disabled={histIdx===history.length-1}><ForwardIcon />Forward</button>
                <button className='fe-toolbar-btn' onClick={goUp} disabled={currentPath==='/'}><UpIcon /> Up</button>
                <div className='fe-toolbar-sep' />
                <button className="fe-toolbar-btn" onClick={handleNewFolder}>📁 New Folder</button>
                <button className='fe-toolbar-btn' onClick={handleNewFile}>📄 New File</button>
                <div className='fe-toolbar-sep' />
                <button className='fe-toolbar-btn' disabled={!selected} onClick={()=>{const e=entries.find((e)=>e.id===selected); if(e) startRename(e);}} >
                    Rename
                </button>
                 <button className="fe-toolbar-btn" disabled={!selected} onClick={handleDelete}>
                      Delete
                 </button>
            </div>

            <div className='fe-addressbar'>
                <span className='fe-addressbar-label'>Address:</span>
                <input className='fe-addressbar-input' value={addrInput} onChange={(e)=>setAddrInput(e.target.value)} onKeyDown={(e)=>{
                    if(e.key==='Enter'){
                        const p=addrInput.trim() || '/';
                        navigate(p.startsWith('/') ? p :'/'+p);
                    }
                }} onClick={(e)=>e.stopPropagation()} spellCheck={false} />

                <button className="fe-addressbar-go" onClick={()=>{
                    const p=addrInput.trim() || '/';
                    navigate(p.startsWith('/') ? p:'/'+p);
                }} >
                    Go
                </button>
            </div>

            <div className='fe-body'>
                <div className='fe-sidebar'>
                    <TreeNode path="/" name="My Computer" depth={0} fs={fs} currentPath={currentPath} onNavigate={navigate} />
                </div>

                <div className='fe-main' onContextMenu={handleMainCtx} onClick={(e)=>{e.stopPropagation(); setCtx(null);}}>
                    {entries.length===0 ? (
                        <div className='fe-empty'>This folder is empty.</div>
                    ):(
                        <table className="fe-list">
              <thead className="fe-list-header">
                <tr>
                  <th style={{ width: '50%' }}>Name</th>
                  <th style={{ width: '20%' }}>Type</th>
                  <th style={{ width: '30%' }}>Modified</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr
                    key={entry.id}
                    className={`fe-list-row${selected === entry.id ? ' is-selected' : ''}`}
                    onClick={(e) => { e.stopPropagation(); setSelected(entry.id); setCtx(null); }}
                    onDoubleClick={() => handleOpen(entry)}
                    onContextMenu={(e) => handleEntryCtx(e, entry)}
                  >
                    <td>
                      {entry.type === 'folder' ? <FolderIcon /> : <FileIcon />}
                      {renaming === entry.id ? (
                        <input
                          ref={renameRef}
                          className="fe-rename-input"
                          value={renameVal}
                          onChange={(e) => setRenameVal(e.target.value)}
                          onBlur={commitRename}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter')  commitRename();
                            if (e.key === 'Escape') setRenaming(null);
                            e.stopPropagation();
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        entry.name
                      )}
                    </td>
                    <td>{entry.type === 'folder' ? 'File Folder' : 'Text Document'}</td>
                    <td>{entry.modified}</td>
                  </tr>
                ))}
                  </tbody>
                  </table>
                    )}
                </div>
            </div>

            <div className='fe-statusbar'>
                <span className='fe-statusbar-panel'>{entries.length} item{entries.length !==1 ? 's' : ''}</span>
                {selected && (<span className='fe-statusbar-panel'>
                    {entries.find((e)=>e.id===selected)?.name}
                </span>
            )}
            </div>

            {ctx && <CtxMenu x={ctx.x} y={ctx.y} items={ctx.items} onClose={()=>setCtx(null)} />}
        </div>
    );
}