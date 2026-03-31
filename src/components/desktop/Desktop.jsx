import {useState,useCallback,useRef,useEffect,useMemo} from 'react';
import {
    MdGridView,
    MdSort,
    MdRefresh,
    MdUndo,
    MdAddCircleOutline,
    MdDisplaySettings,
    MdBrush,
    MdFolderOpen,
    MdDriveFileRenameOutline,
    MdDeleteOutline,
    MdTerminal,
    MdMoreHoriz,
} from 'react-icons/md';
import Taskbar from './Taskbar';
import DesktopIcon from './DesktopIcon';
import ContextMenu from './ContextMenu';
import useFileSystem from '../apps/FileExplorer/useFileSystem';
import {useOS} from '../../context/OSContext';
import './desktop.css';
import desktopBackground from '../../assets/desktopbg.png';
import backgroundImage from '../../assets/background.png';
import backgroundImage1 from '../../assets/background1.png';
import backgroundImage2 from '../../assets/background2.png';
import desktopImage from '../../assets/desktop.png';
import fileExplorerIcon from '../../assets/taskbar/fileexp.png';
import taskManagerIcon from '../../assets/taskbar/taskmanager.png';
import notesIcon from '../../assets/taskbar/notepad.png';
import vscodeIcon from '../../assets/taskbar/vs.png';
import terminalIcon from '../../assets/taskbar/terminal.png';
import chromeIcon from '../../assets/taskbar/chrome.png';
import drawIcon from '../../assets/draw.png';

const DESKTOP_APPS=[
    {
        id:'file-explorer',
        label:'Explorer',
        appId:'file-explorer',
        icon:<IconImage src={fileExplorerIcon} alt='Explorer' />,
    },
    {
        id:'chrome',
        label:'Chrome',
        appId:'chrome',
        icon:<IconImage src={chromeIcon} alt='Chrome' />,
    },
    {
        id:'vscode',
        label:'VS Code',
        appId:'vscode',
        icon:<IconImage src={vscodeIcon} alt='VS Code' />,
    },
    {
        id:'terminal',
        label:'Terminal',
        appId:'terminal',
        icon:<IconImage src={terminalIcon} alt='Terminal' />,
    },
    {
        id:'task-manager',
        label:'Focus App',
        appId:'task-manager',
        icon:<IconImage src={taskManagerIcon} alt='Focus App' />,
    },
    {
        id:'draw',
        label:'Paint',
        appId:'draw',
        icon:<IconImage src={drawIcon} alt='Paint' />,
    },
    {
        id:'notes',
        label:'Notepad',
        appId:'notes',
        icon:<IconImage src={notesIcon} alt='Notepad' />,
    },
];

const ICON_W=86;
const ICON_H=98;
const ICON_GAP=10;
const ICON_START_X=6;
const ICON_START_Y=6;
const MAX_ROWS_PER_COLUMN=4;
const DESKTOP_TASKBAR_H=52;
const DESKTOP_AREA_PADDING=12;
const ICONS_INNER_PADDING=6;

function buildDefaultPositions(apps){
    const availableHeight=Math.max(
        ICON_H,
        window.innerHeight - DESKTOP_TASKBAR_H - (DESKTOP_AREA_PADDING * 2) - (ICONS_INNER_PADDING * 2),
    );
    const rowsThatFit=Math.max(1,Math.floor((availableHeight + ICON_GAP) / (ICON_H + ICON_GAP)));
    const rowsPerColumn=Math.max(1,Math.min(MAX_ROWS_PER_COLUMN,rowsThatFit));
    const positions={};
    apps.forEach((app,index)=>{
        const col=Math.floor(index / rowsPerColumn);
        const row=index % rowsPerColumn;
        positions[app.id]={
            x:ICON_START_X + col * (ICON_W + ICON_GAP),
            y:ICON_START_Y + row * (ICON_H + ICON_GAP),
        };
    });
    return positions;
}

const BUILTIN_WALLPAPERS=[
    {id:'desktopbg',label:'Default',src:desktopBackground},
    {id:'desktop',label:'Desktop',src:desktopImage},
    {id:'background',label:'Background',src:backgroundImage},
    {id:'background1',label:'Background 1',src:backgroundImage1},
    {id:'background2',label:'Background 2',src:backgroundImage2},
];

const BUILTIN_WALLPAPER_MAP=BUILTIN_WALLPAPERS.reduce((acc,item)=>{
    acc[item.id]=item.src;
    return acc;
},{});

export default function Desktop({openWindows = [], activeWinId, onOpenApp, onLogout}) {
    const {wallpaper,setWallpaper,brightness}=useOS();
    const {createFolder,deleteEntry,renameEntry,listDir}=useFileSystem();
    const [selectedIcon,setSelectedIcon]=useState(null);
    const [ctxMenu,setCtxMenu]=useState(null);
    const [showWallpaperPicker,setShowWallpaperPicker]=useState(false);
    const [desktopFolders,setDesktopFolders]=useState([]);
    const [editingId,setEditingId]=useState(null);
    const [editingName,setEditingName]=useState('');
    const [positions,setPositions]=useState(()=>buildDefaultPositions(DESKTOP_APPS));
    const [draggingId,setDraggingId]=useState(null);
    const dragOffsetRef=useRef({x:0,y:0});
    const desktopRef=useRef(null);
    const desktopAreaRef=useRef(null);
    const wallpaperInputRef=useRef(null);
    const folderCounterRef=useRef(0);
    const desktopItems=useMemo(()=>[...DESKTOP_APPS,...desktopFolders],[desktopFolders]);

    const clampPosition=useCallback((position, rect)=>{
        const maxX=Math.max(0,rect.width-ICON_W);
        const maxY=Math.max(0,rect.height-ICON_H);
        return {
            x:Math.max(0,Math.min(position.x,maxX)),
            y:Math.max(0,Math.min(position.y,maxY)),
        };
    },[]);

    useEffect(()=>{
        const handleResize=()=>{
            if(!desktopAreaRef.current) return;
            const rect=desktopAreaRef.current.getBoundingClientRect();
            setPositions((prev)=>{
                const next={};
                desktopItems.forEach((app)=>{
                    const current=prev[app.id] || {x:ICON_START_X,y:ICON_START_Y};
                    next[app.id]=clampPosition(current,rect);
                });
                return next;
            });
        };

        window.addEventListener('resize',handleResize);
        return ()=>window.removeEventListener('resize',handleResize);
    },[clampPosition,desktopItems]);

    const handleRefreshDesktop=useCallback(()=>{
        if(!desktopAreaRef.current) return;
        const rect=desktopAreaRef.current.getBoundingClientRect();
        setPositions((prev)=>{
            const next={};
            desktopItems.forEach((item)=>{
                const current=prev[item.id] || {x:ICON_START_X,y:ICON_START_Y};
                next[item.id]=clampPosition(current,rect);
            });
            return next;
        });
        setSelectedIcon(null);
    },[desktopItems,clampPosition]);

    const handleCreateFolder=useCallback(()=>{
        const created=createFolder('/','New Folder');
        const id=`folder-${created.id}`;
        const folder={
            id,
            fsId:created.id,
            label:created.name,
            type:'folder',
            icon:<IconImage src={fileExplorerIcon} alt='Folder' />,
        };

        setDesktopFolders((prev)=>{
            const next=[...prev,folder];
            const defaultMap=buildDefaultPositions([...DESKTOP_APPS,...next]);
            setPositions((current)=>({
                ...current,
                [id]:defaultMap[id] || {x:ICON_START_X,y:ICON_START_Y},
            }));
            return next;
        });
        setEditingId(id);
        setEditingName(folder.label);
    },[createFolder]);

    const handleDeleteFolder=useCallback((id)=>{
        const target=desktopFolders.find((item)=>item.id===id);
        if(target?.fsId){
            deleteEntry('/',target.fsId);
        }
        setDesktopFolders((prev)=>prev.filter((item)=>item.id!==id));
        setPositions((prev)=>{
            const next={...prev};
            delete next[id];
            return next;
        });
        if(selectedIcon===id) setSelectedIcon(null);
        if(editingId===id){
            setEditingId(null);
            setEditingName('');
        }
    },[selectedIcon,editingId,desktopFolders,deleteEntry]);

    const startRenameFolder=useCallback((id)=>{
        const target=desktopFolders.find((f)=>f.id===id);
        if(!target) return;
        setEditingId(id);
        setEditingName(target.label);
    },[desktopFolders]);

    const commitRenameFolder=useCallback(()=>{
        if(!editingId) return;
        const nextName=editingName.trim();
        const target=desktopFolders.find((f)=>f.id===editingId);
        if(target?.fsId && nextName){
            const siblings=listDir('/');
            const hasConflict=siblings.some((entry)=>entry.type==='folder' && entry.name===nextName && entry.id!==target.fsId);
            if(!hasConflict){
                renameEntry('/',target.fsId,nextName);
            }
        }
        setDesktopFolders((prev)=>prev.map((f)=>{
            if(f.id!==editingId) return f;
            return {...f,label:nextName || f.label};
        }));
        setEditingId(null);
        setEditingName('');
    },[editingId,editingName,desktopFolders,renameEntry,listDir]);

    const cancelRenameFolder=useCallback(()=>{
        setEditingId(null);
        setEditingName('');
    },[]);

    const handleDesktopMouseDown=useCallback(()=>{
        setCtxMenu(null);
        setSelectedIcon(null);
        setShowWallpaperPicker(false);
    },[]);

    const handleDesktopContext=useCallback((e)=>{
        e.preventDefault();
        setShowWallpaperPicker(false);
        setCtxMenu({
            x:e.clientX,
            y:e.clientY,
            items:[
                {label:'View',icon:<MdGridView />,hasArrow:true,action:()=>{}},
                {label:'Sort by',icon:<MdSort />,hasArrow:true,action:()=>{}},
                {label:'Refresh',icon:<MdRefresh />,action:handleRefreshDesktop},
                {separator:true},
                {label:'Undo Delete',icon:<MdUndo />,rightLabel:'Ctrl+Z',action:()=>{}},
                {label:'New',icon:<MdAddCircleOutline />,hasArrow:true,action:handleCreateFolder},
                {separator:true},
                {label:'Display settings',icon:<MdDisplaySettings />,action:()=>{}},
                {label:'Personalize',icon:<MdBrush />,action:()=>setShowWallpaperPicker(true)},
                {separator:true},
                {label:'Rename with PowerRename',icon:<MdDriveFileRenameOutline />,action:()=>{}},
                {label:'Open in Terminal',icon:<MdTerminal />,action:()=>onOpenApp?.('terminal')},
                {separator:true},
                {label:'Show more options',icon:<MdMoreHoriz />,action:()=>{}},
            ],
        });
    },[handleCreateFolder,handleRefreshDesktop,onOpenApp]);

    const handleWallpaperUpload=useCallback((e)=>{
        const file=e.target.files?.[0];
        if(!file) return;
        const reader=new FileReader();
        reader.onload=()=>{
            const dataUrl=String(reader.result || '');
            if(dataUrl.startsWith('data:image/')){
                setWallpaper({type:'upload',value:dataUrl});
                setShowWallpaperPicker(false);
            }
        };
        reader.readAsDataURL(file);
        e.target.value='';
    },[setWallpaper]);

    const handleIconContext=useCallback((e,iconId)=>{
        e.preventDefault();
        const target=desktopItems.find((item)=>item.id===iconId);
        const isFolder=target?.type==='folder';
        setCtxMenu({
            x:e.clientX,
            y:e.clientY,
            variant:'icon',
            items:[
                {label:'Open',icon:<MdFolderOpen />,action:()=>target?.type==='folder' ? onOpenApp?.('file-explorer') : (target?.appId ? onOpenApp?.(target.appId) : undefined)},
                {separator:true},
                {label:'Rename',icon:<MdDriveFileRenameOutline />,disabled:!isFolder,action:()=>startRenameFolder(iconId)},
                {label:'Delete',icon:<MdDeleteOutline />,disabled:!isFolder,action:()=>handleDeleteFolder(iconId)},
            ],
        });
    },[desktopItems,onOpenApp,startRenameFolder,handleDeleteFolder]);

    const handleIconDragStart=useCallback((e,id)=>{
        const rect=e.currentTarget.getBoundingClientRect();
        dragOffsetRef.current={x:e.clientX-rect.left,y:e.clientY-rect.top};
        setDraggingId(id);
        e.dataTransfer.effectAllowed='move';
        e.dataTransfer.setData('text/plain',id);
    },[]);

    const handleDesktopDrop=useCallback((e)=>{
        e.preventDefault();
        const id=e.dataTransfer.getData('text/plain') || draggingId;
        if(!id || !desktopAreaRef.current) {
            setDraggingId(null);
            return;
        }
        const rect=desktopAreaRef.current.getBoundingClientRect();
        const rawX=e.clientX-rect.left-dragOffsetRef.current.x;
        const rawY=e.clientY-rect.top-dragOffsetRef.current.y;
        const {x,y}=clampPosition({x:rawX,y:rawY},rect);
        setPositions((prev)=>({...prev,[id]:{x,y}}));
        setDraggingId(null);
    },[draggingId,clampPosition]);

    const handleDragOver=useCallback((e)=>{
        e.preventDefault();
        e.dataTransfer.dropEffect='move';
    },[]);

    const handleDragEnd=useCallback(()=>{
        setDraggingId(null);
    },[]);

    const resolvedWallpaperSrc=
        wallpaper?.type==='upload'
            ? wallpaper.value
            : BUILTIN_WALLPAPER_MAP[wallpaper?.value] || desktopBackground;
    const bgStyle={
        backgroundImage:`url(${resolvedWallpaperSrc})`,
        filter:`brightness(${Math.min(1.28,Math.max(0.55,(brightness + 18) / 100))})`,
    };

    return(
        <div ref={desktopRef} className='desktop has-wallpaper' style={bgStyle} onMouseDown={handleDesktopMouseDown} onContextMenu={handleDesktopContext}>
            <input
                ref={wallpaperInputRef}
                type='file'
                accept='image/*'
                style={{display:'none'}}
                onChange={handleWallpaperUpload}
            />
            <div ref={desktopAreaRef} className='desktop-area' onDragOver={handleDragOver} onDrop={handleDesktopDrop}>
                <div className='desktop-icons'>
                    {desktopItems.map((app)=>(
                        <DesktopIcon
                            key={app.id}
                            id={app.id}
                            label={app.label}
                            icon={app.icon}
                            style={{left:positions[app.id]?.x ?? ICON_START_X,top:positions[app.id]?.y ?? ICON_START_Y}}
                            isDragging={draggingId===app.id}
                            isEditing={editingId===app.id}
                            editValue={editingName}
                            selected={selectedIcon===app.id}
                            onSelect={setSelectedIcon}
                            onOpen={()=>app.appId ? onOpenApp?.(app.appId) : undefined}
                            onContext={handleIconContext}
                            onEditChange={setEditingName}
                            onEditCommit={commitRenameFolder}
                            onEditCancel={cancelRenameFolder}
                            onDragStart={handleIconDragStart}
                            onDragEnd={handleDragEnd}
                        />
                    ))}
                </div>
            </div>

            <Taskbar
                windows={openWindows}
                activeWinId={activeWinId}
                onOpenApp={onOpenApp}
                onLogout={onLogout}
                availableApps={DESKTOP_APPS.map((app) => ({ appId: app.appId, label: app.label }))}
            />

            {ctxMenu && (
                <ContextMenu x={ctxMenu.x} y={ctxMenu.y} items={ctxMenu.items} variant={ctxMenu.variant} onClose={()=>setCtxMenu(null)} />
            )}

            {showWallpaperPicker && (
                <div className='wallpaper-picker' onMouseDown={(e)=>e.stopPropagation()}>
                    <div className='wallpaper-picker-title'>Change Wallpaper</div>
                    <div className='wallpaper-picker-grid'>
                        {BUILTIN_WALLPAPERS.map((wp)=>(
                            <button
                                key={wp.id}
                                type='button'
                                className='wallpaper-picker-item'
                                onClick={()=>{
                                    setWallpaper({type:'asset',value:wp.id});
                                    setShowWallpaperPicker(false);
                                }}
                            >
                                <img src={wp.src} alt={wp.label} />
                                <span>{wp.label}</span>
                            </button>
                        ))}
                    </div>
                    <div className='wallpaper-picker-actions'>
                        <button type='button' className='wallpaper-picker-btn' onClick={()=>wallpaperInputRef.current?.click()}>Upload from device</button>
                        <button type='button' className='wallpaper-picker-btn' onClick={()=>{setWallpaper({type:'asset',value:'desktopbg'}); setShowWallpaperPicker(false);}}>Reset default</button>
                        <button type='button' className='wallpaper-picker-btn' onClick={()=>setShowWallpaperPicker(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}

function IconImage({src,alt}){
    return <img src={src} alt={alt} width='34' height='34' draggable='false' style={{display:'block'}} />;
}
