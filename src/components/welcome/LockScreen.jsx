import {useState,useEffect,useCallback,useRef} from 'react'
import './welcome.css';
import useNow from '../../hooks/useNow';
import background from '../../assets/background.png';
const p2=(n)=>String(n).padStart(2,'0');
export default function LockScreen({onUnlock}){
    const now=useNow();
    const [exiting,setExiting]=useState(false);
        const unlockingRef=useRef(false);
        const unlockTimerRef=useRef(null);

   const doUnlock=useCallback(()=>{
        if(unlockingRef.current) return;
        unlockingRef.current=true;
    setExiting(true);
        unlockTimerRef.current=setTimeout(()=>onUnlock?.(),460);
     },[onUnlock]);

     useEffect(()=>{
         return ()=>{
                if(unlockTimerRef.current){
                        clearTimeout(unlockTimerRef.current);
                }
         };
     },[]);

   useEffect(()=>{
     const h=(e)=>{
                if(e.key==='Enter' || e.key===' '){
                        e.preventDefault();
                        doUnlock();
                }
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
        <div className={`w-screen lock-screen${exiting ? ' exiting' :''}`} onClick={doUnlock} >
            <div className="lock-statusbar">
                <span className="nametitle">Aurora OS</span>
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
            <path d="M2 8.2C4.3 5.8 7.3 4.4 12 4.4c4.7 0 7.7 1.4 10 3.8" />
            <path d="M5.4 10.6C7.2 8.8 9.2 8 12 8s4.8.8 6.6 2.6" />
            <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
        </svg>
    )
}

function BatteryIcon(){

    return(
        <svg width="18" height="11" viewBox="0 0 24 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="1" y="2" width="19" height="10" rx="2" />
            <rect x="3" y="4" width="10" height="6" rx="1" fill="currentColor" stroke="none"/>
            <path d="M22 5v4" strokeWidth="2.5" strokeLinecap="round" />

        </svg>
    )
}