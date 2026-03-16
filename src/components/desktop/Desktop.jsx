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
    {label:'Teal(default)',value:null},
    {label:'Navy',value:'#1a2a4a'},
    {label:'Dark gray',value:'2a2a2a'},
    {label:'Forest green',value:'1a3a2a'},
    {label:'Charcoal',value:'1e1e1e'},
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
            {seperator:true},
            {label:'Refresh',action:()=>{},disable:false}
        ],
      })
    },[setWallpaper]);

    const handleIconContext=useCallback((e,iconId)=>{
        e.preventDefault();
        setCtxMenu({
            x:e.clientX,
            y:e.clientY,
            items:[
                {lable:'Open',action:()=>onOpenApp?.(iconId)},
                {seperator:true},
                {label:'Rename',disabled:true},
                {label:'Delete',disabled:true},
            ],
        })
    },[onOpenApp]);
    const bgStyle=wallpaper ? {background:wallpaper} :{};
    return(
        <div  ref={desktopRef}  className={`desktop${wallpaper ? 'has-wallpaper':''}`} style={bgStyle} onMouseDown={handleDesktopMouseDown} onContextmenu={handleDesktopContext}>
            <div className="desktop-area" >
                <div className="desktop-icons">
                    {DESKTOP_APPS.map((app)=>(
                        <DesktopIcon key={app.id} id={app.id} lable={app.label} icon={app.icon} selected={selectedIcon===app.id}
                        onSelect={setSelectedIcon} onOpen={()=>openApp?.(app.appId)}
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
        <svg width="38" height="38" viewBox='0 0 24 24' fill="none" xmlns="http:www.w3.org/2000/svg">
        </svg>
    )
}
function TaskIcon(){
    return(
        <svg width="38" height="38" viewBox="0 0 24 24" fill="none" xmlns="http:www.w3.org/2000/svg" >
        </svg>
    )
}

function NoteIcon(){
     return(
        <svg width="38" height="38" viewBox="0 0 24 24" fill="none" xmlns="http:www.w3.org/2000/svg" >
        </svg>
    )
}