import {useState,useEffect,useRef} from 'react'
import './welcome.css';
import background from '../../assets/background2.png';
import loginSound from '../../assets/wfw311.ogv';
import { useOS } from '../../context/OSContext';
const CORRECT_PASSWORD='123';
export default function LoginScreen({onAuthenticate}){
    const {soundVolume}=useOS();
    const [password,setPassword]=useState('')
    const [error,setError]=useState('');
    const [success,setSuccess]=useState(false);
    const [shaking,setShaking]=useState(false);
    const [attempts,setAttempts]=useState(0);
    const [isLocked,setIsLocked]=useState(false);
    const [showPassword,setShowPassword]=useState(false);
    const inputRef=useRef(null);

    useEffect(()=>{
        setTimeout(()=>inputRef.current?.focus(),250);
    },[]);

    const playLoginSound=()=>{
        const audio=new Audio(loginSound);
        audio.volume=Math.min(1,Math.max(0,(Number(soundVolume) || 0)/100));
        audio.play().catch(()=>{
            /* ignore autoplay/playback errors */
        });
    };

    const submit=()=>{
        if(!password || success || isLocked) return;
        if(password.trim().toLowerCase()===CORRECT_PASSWORD.toLowerCase()){
            setSuccess(true);
            setError('');
            playLoginSound();
            onAuthenticate?.();
        }
        else{
            const a=attempts+1;
            setAttempts(a);
            if(a>=3){
                setIsLocked(true);
                setError('Too many incorrect attempts. Try again in 5 seconds.');
                setTimeout(()=>{
                    setIsLocked(false);
                    setAttempts(0);
                    setError('');
                },5000);
            }
            else{
                setError('The password is incorrect. Please try again.');
            }
            setPassword('');
            setShaking(true)
            setTimeout(()=>setShaking(false),400);
        }
    }

     const rowClass=[
        'login-input-row',
        error ? 'is-error' : '',
        success ? 'is-success' :'',
     ].filter(Boolean).join(' ');
    return(
        <div className="w-screen login-screen" style={{ '--login-bg-image': `url(${background})` }}>
            <div className="login-frame">
                <div className="login-avatar">
                    <UserIcon />
                </div>

                <div className="login-text">Welcome to Aurora OS</div>

                <div className={`login-input-wrap${shaking ? ' login-input-shake' :''}`} >
                    <div className={rowClass}>
                        <input ref={inputRef} type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} className="login-input" onChange={(e)=>{
                            setPassword(e.target.value);
                            setError('');
                        }} onKeyDown={(e)=>e.key==='Enter' && submit()} autoCapitalize="off" autoCorrect="off" enterKeyHint="go" disabled={isLocked} />

                        <button
                            type="button"
                            className="login-eye-btn"
                            onClick={()=>setShowPassword((v)=>!v)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            title={showPassword ? 'Hide password' : 'Show password'}
                            disabled={isLocked}
                        >
                            <EyeIcon open={showPassword} />
                        </button>

                        <button type="button" className="login-go-btn" onClick={submit} tabIndex={-1} aria-label="Sign in" disabled={isLocked}>
                            <ArrowRightIcon />
                        </button>
                    </div>

                    {error &&(
                        <div className="login-msg is-error">{error}</div>
                    )}
                </div>

                <div className="login-footer-row">
                    <button type="button" className="os-btn primary" onClick={submit} disabled={isLocked}>
                        Sign In
                    </button>
                </div>
            </div>
        </div>
    )
}

function UserIcon(){
    return(
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
    );
}

function ArrowRightIcon(){
    return(
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14" />
            <path d="m13 5 7 7-7 7" />
        </svg>
    );
}

function EyeIcon({open}){
    return(
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
            <circle cx="12" cy="12" r="3" />
            {!open && <path d="M4 20 20 4" />}
        </svg>
    );
}

