import {useState,useEffect,useCallback,useRef} from 'react'
import './welcome.css';
import useNow from '../../hooks/useNow';
import background from '../../assets/background2.png';
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
   const date=now.toLocaleDateString('en-US',{
    weekday:'long',month:'long',day:'numeric',year:'numeric',
   })
    return(
        <div
            className={`w-screen lock-screen${exiting ? ' exiting' :''}`}
            style={{ '--lock-bg-image': `url(${background})` }}
            onClick={doUnlock}
        >
            <div className="lock-content">
                <div className="lock-greeting">Welcome Back</div>
                <div className="lock-time">{hh}:{mm}</div>
                <div className="lock-date">{date}</div>

                <div className="lock-divider" />
                <div className="lock-hint">Click anywhere to sign in</div>
            </div>
        </div>
    )
}
