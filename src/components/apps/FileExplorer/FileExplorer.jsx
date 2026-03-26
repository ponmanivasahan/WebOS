import {useState,useEffect,useRef,useCallback,useMemo} from 'react';
import useFileSystem from './useFileSystem';
import './Fileexplorer.css';

function FolderIcon({open=false,size=16}){
    return(
         <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d={open
          ? 'M2 9a2 2 0 0 1 2-2h4l2 2h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9z'
          : 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z'}
        fill="#f0c040" stroke="#c89a10" strokeWidth="0.5"
      />
    </svg>
    )
}

function FileIcon({size=16}){
    return(
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M6 2h8l4 4v16H6V2z"  fill="#3a8fd4"  stroke="#2878b8" strokeWidth="0.5" />
      <path d="M14 2v4h4" fill="none"  stroke="#2878b8" strokeWidth="0.5" />
      <line x1="8" y1="10" x2="16" y2="10" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
      <line x1="8" y1="13" x2="16" y2="13" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
      <line x1="8" y1="16" x2="13" y2="16" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
    </svg>
    )
}

const BackIcon=()=> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>;
const ForwardIcon=()=>  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>;
const UpIcon=()=>  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>;
const RefreshIcon=()=> <svg width="14" height="14"  viewBox="0 0 24 24" fill="none"  stroke="currentColor" strokeWidth="2"> 
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
</svg>

const HomeIcon=()=> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 10.5L12 3l9 7.5v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
</svg>

const SearchIcon=()=> <svg width="14" height="14" viewBox="0 0 24 24" fill="none"  stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
</svg>

function SidebarQuickIcon({kind}){
    if(kind==='home') return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 10.5L12 3l9 7.5v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="#f58b2e"/><polyline points="9 21 9 12 15 12 15 21" stroke="#ffffff" strokeWidth="1.4"/></svg>;
    if(kind==='cloud') return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M7.5 18h9a4 4 0 0 0 .4-8A5.5 5.5 0 0 0 6.2 8.5 3.8 3.8 0 0 0 7.5 18z" fill="#2ba1ff"/></svg>;
    if(kind==='desktop') return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="12" rx="1.5" fill="#38c0ff"/><rect x="10" y="18" width="4" height="1.6" fill="#9adfff"/></svg>;
    if(kind==='downloads') return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="2" fill="#1cc5a0"/><path d="M12 7v7m0 0 3-3m-3 3-3-3" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    if(kind==='documents') return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="2" fill="#9db4c9"/><path d="M8 10h8M8 13h8M8 16h5" stroke="#eef4fb" strokeWidth="1.4" strokeLinecap="round"/></svg>;
    if(kind==='music') return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="2" fill="#f08a45"/><path d="M13 8v6.2a1.8 1.8 0 1 1-1.2-1.7V9.2L17 8v5.2a1.8 1.8 0 1 1-1.2-1.7V8.7L13 9.2" fill="#fff"/></svg>;
    if(kind==='pictures') return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="2" fill="#3f9fff"/><circle cx="9" cy="9" r="1.6" fill="#fff"/><path d="M6 17l4-4 3 3 2-2 3 3" stroke="#eaf3ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    if(kind==='videos') return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="2" fill="#9658f4"/><path d="m10 9 6 3-6 3V9z" fill="#fff"/></svg>;
    if(kind==='pc') return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="12" rx="1.5" fill="#3ab8f0"/><rect x="8" y="18" width="8" height="2" rx="1" fill="#8adfff"/></svg>;
    if(kind==='network') return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" fill="#4aa7d8"/><path d="M5 12h14M12 5a12 12 0 0 1 0 14M12 5a12 12 0 0 0 0 14" stroke="#eaf3ff" strokeWidth="1.2"/></svg>;
    return null;
}

const ChevronRightIcon=()=> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" >
    <polyline points="9 18 15 12 9 6" />
</svg>

function Breadcrumb({currentPath,onNavigate}){
    const segments=currentPath === '/' ? [] : currentPath.split('/').filter(Boolean);

    const crumbs=[
        {label:'Home', path:'/'},
        ...segments.map((seg,i)=>(
            {
                label:seg,
                path:'/'+segments.slice(0,i+1).join('/'),
            }
        )),
    ];
    return(
        <div className='fe-breadcrumb'>
            <span className='fe-breadcrumb-home' onClick={()=>onNavigate('/')}>
                <HomeIcon />
            </span>
            {crumbs.map((crumb,i)=>(
                <span key={crumb.path} className='fe-breadcrumb-segment'>
                    <ChevronRightIcon />
                                        <span className={`fe-breadcrumb-label${i===crumbs.length-1 ? ' is-current':''}`}
                      onClick={()=>onNavigate(crumb.path)}>{crumb.label}</span>
                </span>
            ))}
        </div>
    )
}
function TreeNode({path,name,depth,fs,currentPath,onNavigate}){
    const [open,setOpen]=useState(depth===0);
    const children=(fs[path] || []).filter((e)=>e.type==='folder');
    const hasKids=children.length>0;
    const isActive=currentPath===path;

    return(
        <>
        <div className={`fe-tree-item${isActive ? ' is-selected' : ''}`} onClick={()=>{onNavigate(path); if(hasKids) setOpen((v)=>!v);}}>
        <div className='fe-tree-indent' style={{width:depth*14}} />
        <div className='fe-tree-toggle' >{hasKids ? (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              {open ? <polyline points="18 15 12 9 6 15" /> : <polyline points="9 18 15 12 9 6" />}
            </svg>
          ) : null}
         </div>
        <div className='fe-tree-icon'><FolderIcon open={open && isActive} size={16} /> </div>
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
    const safeX=Math.min(x,window.innerWidth-180);
    const safeY=Math.min(y,window.innerHeight-items.length*32-10);
    return(
        <ul className='fe-context-menu' style={{top:safeY,left:safeX}} onMouseDown={(e)=>e.stopPropagation()}>
          {items.map((item,i)=>
        item.sep ? <li key={i} className='fe-ctx-sep' /> :
        (<li key={i} className={`fe-ctx-item${item.disabled ? ' is-disabled' : ''}`} onClick={()=>{item.action?.(); onClose();}}>
            {item.label}
        </li>
    ))}
</ul>
    )
}

export default function FileExplorer({onOpenTextFile}){
    const { fs,listDir,createFile,createFolder,deleteEntry,renameEntry}=useFileSystem();

    const [history,setHistory]=useState(['/']);
    const [histIdx,setHistIdx]=useState(0);
    const currentPath=history[histIdx];
    const [addrInput,setAddrInput]=useState('/');
    const [addrFocused,setAddrFocused]=useState(false);
    const [searchQuery,setSearchQuery]=useState('');
    useEffect(()=>setAddrInput(currentPath),[currentPath]);

    const [selected,setSelected]=useState(null);
    const [renaming,setRenaming]=useState(null);
    const [renameVal,setRenameVal]=useState('');
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
        const nextName=renameVal.trim();
        if(renaming && nextName) renameEntry(currentPath,renaming,nextName);
        setRenaming(null);
    },[renaming,renameVal,renameEntry,currentPath]);

    const handleOpen=useCallback((entry)=>{
        if(!entry) return;
        if(entry.type==='folder'){
            navigate((currentPath==='/' ? '' :currentPath)+'/'+entry.name);
            return;
        }
        if(entry.type==='file' && entry.name.toLowerCase().endsWith('.txt')){
            onOpenTextFile?.({id:entry.id,name:entry.name,path:currentPath});
        }
    },[currentPath,navigate,onOpenTextFile]);

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
    const visibleEntries=useMemo(()=>{
        const q=searchQuery.trim().toLowerCase();
        if(!q) return entries;
        return entries.filter((entry)=>entry.name.toLowerCase().includes(q));
    },[entries,searchQuery]);
    const sidebarLinks=[
        {label:'Home',path:'/',icon:'home'},
        {label:'OneDrive',path:'/OneDrive',icon:'cloud'},
        {sep:true},
        {label:'Desktop',path:'/Desktop',icon:'desktop'},
        {label:'Downloads',path:'/Downloads',icon:'downloads'},
        {label:'Documents',path:'/Documents',icon:'documents'},
        {label:'Music',path:'/Music',icon:'music'},
        {label:'Pictures',path:'/Pictures',icon:'pictures'},
        {label:'Videos',path:'/Videos',icon:'videos'},
        {sep:true},
        {label:'This PC',path:'/This PC',icon:'pc'},
        {label:'Network',path:'/Network',icon:'network'},
    ];

    return(
        <div className='fe-shell' onClick={()=>{setCtx(null); setSelected(null);}} >
            <div className='fe-navbar'>
                <div className='fe-nav-controls'>
                    <button className='fe-nav-btn' onClick={goBack} disabled={histIdx===0} title='Back'>
                        <BackIcon />
                    </button>
                    <button className='fe-nav-btn' onClick={goForward} disabled={histIdx===history.length-1} title="Forward">
                        <ForwardIcon />
                    </button>
                    <button className='fe-nav-btn' onClick={goUp} disabled={currentPath==='/'} title='Up'>
                        <UpIcon />
                    </button>
                    <button className="fe-nav-btn" onClick={()=>setSelected(null)} title='Refresh'>
                        <RefreshIcon />
                    </button>
                </div>

                <div className='fe-addressbar-wrap'>
                    {addrFocused ? (
                        <input className='fe-addr-input' value={addrInput} autoFocus onChange={(e)=>setAddrInput(e.target.value)}
                        onBlur={()=>setAddrFocused(false)} 
                        onKeyDown={(e)=>{if(e.key==='Enter'){
                           const p=addrInput.trim() || '/';
                           navigate(p.startsWith('/') ? p : '/'+p);
                           setAddrFocused(false);
                        }
                     if (e.key==='Escape') setAddrFocused(false);
                     e.stopPropagation();
                    }}
                    onClick={(e)=>e.stopPropagation()} spellCheck={false} />
                    ):(
                        <div className='fe-breadcrumb-bar' onClick={(e)=>{e.stopPropagation(); setAddrFocused(true);}}>
                            <Breadcrumb currentPath={currentPath} onNavigate={navigate} />
                        </div>
                    )}
                </div>
                <div className='fe-search-wrap'>
                    <SearchIcon />
                                        <input
                                            className='fe-search-input'
                                            placeholder='Search'
                                            value={searchQuery}
                                            onChange={(e)=>setSearchQuery(e.target.value)}
                                            onClick={(e)=>e.stopPropagation()}
                                            onKeyDown={(e)=>{
                                                if(e.key==='Escape') setSearchQuery('');
                                                e.stopPropagation();
                                            }}
                                        />
                </div>
            </div>

            {/* <div className='fe-addressbar'>
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
            </div> */}

            <div className='fe-body'>
                <div className='fe-sidebar'>
                    <div className='fe-sidebar-links'>
                        {sidebarLinks.map((item,i)=>item.sep ? (
                            <div key={`sep-${i}`} className='fe-sidebar-sep' />
                        ) : (
                            <button key={item.path} className={`fe-sidebar-link${currentPath===item.path ? ' is-active' : ''}`} onClick={()=>navigate(item.path)}>
                                <span className='fe-sidebar-link-icon'><SidebarQuickIcon kind={item.icon} /></span>
                                {item.label}
                            </button>
                        ))}
                    </div>
                    <div className='fe-sidebar-tree'>
                        <TreeNode path="/" name="Home" depth={0} fs={fs} currentPath={currentPath} onNavigate={navigate} />
                    </div>
                </div>

                <div className='fe-main' onContextMenu={handleMainCtx} onClick={(e)=>{e.stopPropagation(); setCtx(null);}}>
                    {visibleEntries.length===0 ? (
                        <div className='fe-empty'>{searchQuery.trim() ? 'No results found.' : 'This folder is empty.'}</div>
                    ):(
                        <table className="fe-list">
              <thead className="fe-list-header">
                <tr>
                  <th style={{ width: '50%' }}>Name</th>
                  <th style={{ width: '20%' }}>Type</th>
                  <th style={{ width: '30%' }}>Date Modified</th>
                </tr>
              </thead>
              <tbody>
                {visibleEntries.map((entry) => (
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
                <span className='fe-statusbar-panel'>{visibleEntries.length} item{visibleEntries.length !==1 ? 's' : ''}</span>
                {selected && (<span className='fe-statusbar-panel'>
                    {entries.find((e)=>e.id===selected)?.name}
                </span>
            )}
            </div>

            {ctx && <CtxMenu x={ctx.x} y={ctx.y} items={ctx.items} onClose={()=>setCtx(null)} />}
        </div>
    );
}