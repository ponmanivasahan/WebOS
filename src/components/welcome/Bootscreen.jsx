import {useEffect,useState} from 'react'
import './welcome.css'
export default function BootScreen({onDone}){
    const [progress,setProgress]=useState(0);

    useEffect(()=>{
        const timerId=setTimeout(()=>onDone?.(),2500);
        const progressId=setInterval(()=>{
            setProgress((prev)=>Math.min(100,prev+5));
        },120);

        return ()=>{
            clearTimeout(timerId);
            clearInterval(progressId);
        };
    },[onDone])

    return(
        <div className="w-screen boot-screen">
            <div className="boot-frame">
                <div className="boot-brand">
                    <div className="boot-logo-mark" />
                    <div>
                        <div className="boot-logo-name">Aurora OS</div>
                        <div className="boot-logo-sub">Starting secure session</div>
                    </div>
                </div>

                <div className="boot-progress-track" aria-hidden="true">
                    <div className="boot-progress-fill" style={{width:`${progress}%`}} />
                </div>

                <div className="boot-progress-label">Loading... {progress}%</div>

                <div className="boot-dots">
                    <div className="boot-dot" />
                    <div className="boot-dot" />
                    <div className="boot-dot" />
                    <div className="boot-dot" />
                </div>
            </div>
        </div>
    )
}
