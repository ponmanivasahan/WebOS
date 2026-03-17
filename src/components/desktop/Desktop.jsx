import {useState,useCallback,useRef} from 'react';
import Taskbar from './Taskbar';
import DesktopIcon from './DesktopIcon';
import ContextMenu from './ContextMenu';
import {useOS} from '../../context/OSContext';
import './desktop.css';

const DESKTOP_APPS=[
    {
    id:'file-explorer',
    label:'File Explorer',
    appId:'file-explorer',
    icon:<FolderIcon />,
    },
    {
        id:'task-manager',
        label:'Task Manager',
        appId:'task-manager',
        icon:<TaskIcon />,
    },
    {
        id:'notes',
        label:'Notes',
        appId:'notes',
        icon:<NoteIcon />,
    },
]

const WALLPAPERS=[
    {label:'Teal (default)',value:null},
    {label:'Navy',value:'#1a2a4a'},
    {label:'Dark gray',value:'#2a2a2a'},
    {label:'Forest green',value:'#1a3a2a'},
    {label:'Sunset gradient',value:'linear-gradient(140deg, #173451 0%, #2f5b78 40%, #f4a261 100%)'},
]


export default function Desktop({openWindows=[], activeWinId, onWinClick,onStartClick,onOpenApp}){
    const {wallpaper,setWallpaper}=useOS();
    const [selectedIcon,setSelectedIcon]=useState(null);
    const [ctxMenu,setCtxMenu]=useState(null);
    const desktopRef=useRef(null);
    const handleDesktopMouseDown=useCallback(()=>{
        setCtxMenu(null);
        setSelectedIcon(null);
    },[])

    const handleDesktopContext=useCallback((e)=>{
      e.preventDefault();
      setCtxMenu({
        x:e.clientX,
        y:e.clientY,
        items:[
            ...WALLPAPERS.map((wp)=>({
              label:`Wallpaper:${wp.label}`,
              action:()=>setWallpaper(wp.value),
            })),
                        {separator:true},
                        {label:'Refresh',action:()=>{},disabled:false}
        ],
      })
    },[setWallpaper]);

    const handleIconContext=useCallback((e,iconId)=>{
        e.preventDefault();
        setCtxMenu({
            x:e.clientX,
            y:e.clientY,
            items:[
                {label:'Open',action:()=>onOpenApp?.(iconId)},
                {separator:true},
                {label:'Rename',disabled:true},
                {label:'Delete',disabled:true},
            ],
        })
    },[onOpenApp]);
    const bgStyle=wallpaper ? {background:wallpaper} :{};
    return(
        <div  ref={desktopRef}  className={`desktop${wallpaper ? ' has-wallpaper':''}`} style={bgStyle} onMouseDown={handleDesktopMouseDown} onContextMenu={handleDesktopContext}>
            <div className="desktop-area" >
                <div className="desktop-icons">
                    {DESKTOP_APPS.map((app)=>(
                        <DesktopIcon key={app.id} id={app.id} label={app.label} icon={app.icon} selected={selectedIcon===app.id}
                        onSelect={setSelectedIcon} onOpen={()=>onOpenApp?.(app.appId)}
                        onContext={handleIconContext} />
                    ))}
                </div>

            </div>

            <Taskbar windows={openWindows} activeWinId={activeWinId}
            onWinClick={onWinClick} onStartClick={onStartClick} />

            {ctxMenu && (
                <ContextMenu x={ctxMenu.x} y={ctxMenu.y} items={ctxMenu.items} onClose={()=>setCtxMenu(null)} />
            )}
        </div>
    )
}

function FolderIcon(){
    return(
        <svg width="38" height="38" viewBox='0 0 24 24' fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h4.2l1.6 1.8H19.5A1.5 1.5 0 0 1 21 9.3v7.2a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 16.5v-9z" fill="#f0c040" stroke="#a08000" strokeWidth="1" />
        </svg>
    )
}
function TaskIcon(){
    return(
        <svg width="38" height="38" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" >
         <rect x="4" y="3" width="16" height="18" rx="2" fill="#ffffff" stroke="#888" strokeWidth="1" />
         <line x1="7" y1="8" x2="17" y2="8" stroke="#555" strokeWidth="1.2" />
         <line x1="7" y1="11" x2="17" y2="11" stroke="#555" strokeWidth="1.2" />
         <line x1="7" y1="14" x2="13" y2="14" stroke="#555" strokeWidth="1.2" />
         <polyline points="7,8 8.2,9.4 10,7" stroke="#0a0" strokeWidth="1.2" fill="none" />
        </svg>
    )
}

function NoteIcon(){
     return(
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" >
        <rect x="4" y="3" width="16" height="18" rx="2" fill="#fffde0" stroke="#cca000" strokeWidth="1" />
        <line x1="7" y1="8" x2="17" y2="8" stroke="#bbb" strokeWidth="1" />
        <line x1="7" y1="11" x2="17" y2="11" stroke="#bbb" strokeWidth="1" />
        <line x1="7" y1="14" x2="14" y2="14" stroke="#bbb" strokeWidth="1" />
        <line x1="7" y1="17" x2="12" y2="17" stroke="#bbb" strokeWidth="1" />
        </svg>
    )
}