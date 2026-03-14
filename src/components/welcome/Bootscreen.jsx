import {useEffect} from 'react'
import './welcome.css'
export default function BootScreen({onDone}){
    useEffect(()=>{
        const id=setTimeout(onDone,2500);
        return ()=>clearTimeout(id);
    },[onDone])

    return(
        <div className="w-screen boot-screen">
            <div className="boot-logo-name">Aurora OS</div>
            <div className="boot-logo-sub">V 1.00</div>
            <div className="boot-dots">
                <div className="boot-dot" />
                <div className="boot-dot" />
                <div className="boot-dot" />
                <div className="boot-dot" />
            </div>
        </div>
    )
}
