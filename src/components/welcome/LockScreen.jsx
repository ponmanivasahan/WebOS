import {useState,useEffect,useCallback} from 'react'
import './welcome.css';
import useNow from '../../hooks/useNow';

const p2=(n)=>String(n).padStart(2,'0');
export default function LockScreen({onUnlock}){
    const now=useNow();
    const [exiting,setExiting]=useState(false);
   const doUnlock=useCallback(()=>{
    if(exiting) return;
    setExiting(true);
    setTimeout(onUnlock,460);
   },[exiting,onUnlock]);

   useEffect(()=>{
     const h=(e)=>{
        if(e.key==='Enter' || e.key===' ') doUnlock();
     }
     window.addEventListener('keydown',h);
     return ()=>window.removeEventListener('keydown',h);
   },[doUnlock]);

   const hh=p2(now.getHours());
   const mm=p2(now.getMinutes());
   const ss=p2(now.getSeconds());
   const date=now.toLocaleDateString('en-US',{
    weekday:'long',month:'long',day:'numeric',year:'numeric',
   })
    return(
        <div className={`w-screen lock-screen${exiting ? 'exiting' :''}`} onClick={doUnlock} >
            <div className="lock-statusbar">
                <span>Aurora OS</span>
                <div className="lock-status-right">
                    <WifiIcon />
                    <BatteryIcon />
                    <span>{hh}:{mm}</span>
                </div>
            </div>
        <div className="lock-time">{hh}:{mm}</div>
        <div className="lock-seconds">{ss}</div>
        <div className="lock-date">{date}</div>
     
        <div className="lock-divider" />
        <div className="lock-hint">Click anywhere or press Enter to sign in</div>
        </div>
    )
}

function WifiIcon(){
    return(
        <svg width="18" height="11" viewBox="0 0 24 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="1" y="2" width="19" height="10" rx="2" />
            <rect x="2.5" y="3.5" width="12" height="7" rx="1" fill="currentColor" stroke="none" />
            <path d="M21 5v4" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
    )
}