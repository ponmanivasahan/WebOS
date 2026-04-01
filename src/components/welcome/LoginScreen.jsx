import {useState,useEffect,useRef} from 'react'
import './welcome.css';
import background from '../../assets/background2.png';
import loginSound from '../../assets/wfw311.ogv';
import { useOS } from '../../context/OSContext';
const CORRECT_PASSWORD='Miss You';
export default function LoginScreen({onAuthenticate}){
    const {soundVolume}=useOS();
    const [password,setPassword]=useState('')
    const [error,setError]=useState('');
    const [success,setSuccess]=useState(false);
    const [shaking,setShaking]=useState(false);
    const [attempts,setAttempts]=useState(0);
    const [isLocked,setIsLocked]=useState(false);
    const [showHint,setShowHint]=useState(false);
    const [showKeypad,setShowKeypad]=useState(false);
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

    const handleKeypadInput=(key)=>{
        if(success || isLocked) return;

        setError('');

        if(key==='CLEAR'){
            setPassword('');
        }
        else if(key==='SPACE'){
            setPassword((prev)=>prev+' ');
        }
        else{
            setPassword((prev)=>prev+key);
        }

        inputRef.current?.focus();
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

                <div className={`login-input-wrap${shaking ? ' login-input-shake' :''}`} >
                    <div className={rowClass}>
                        <input ref={inputRef} type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} className="login-input" onChange={(e)=>{
                            setPassword(e.target.value);
                            setError('');
                        }} onKeyDown={(e)=>e.key==='Enter' && submit()} disabled={isLocked} />

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

                    <div className="login-tools-row">
                        <button
                            type="button"
                            className={`login-tool-btn${showHint ? ' is-active' : ''}`}
                            onClick={()=>setShowHint((v)=>!v)}
                            aria-label="Show password hint"
                            title="Passkey hint"
                        >
                            <PasskeyIcon />
                        </button>

                        <button
                            type="button"
                            className={`login-tool-btn${showKeypad ? ' is-active' : ''}`}
                            onClick={()=>setShowKeypad((v)=>!v)}
                            aria-label="Open keypad"
                            title="Keypad"
                        >
                            <KeypadIcon />
                        </button>
                    </div>

                    {showHint && (
                        <div className="login-hint">
                            Hint: <b>Miss You</b>
                        </div>
                    )}

                    {showKeypad && (
                        <div className="login-keypad" role="group" aria-label="On-screen keypad">
                            <div className="login-keypad-head">
                                <span className="login-keypad-title">On-screen keypad</span>
                                <span className="login-keypad-help">Tap keys to type password</span>
                            </div>

                            <div className="login-keypad-grid compact">
                                {['M','i','s','s','Y','o','u'].map((k, idx)=>(
                                    <button key={`${k}-${idx}`} type="button" className="login-keypad-key letter" onClick={()=>handleKeypadInput(k)} disabled={isLocked}>{k}</button>
                                ))}
                            </div>

                            <div className="login-keypad-row row-actions compact">
                                <button type="button" className="login-keypad-key action" onClick={()=>handleKeypadInput('CLEAR')} disabled={isLocked}>clear</button>
                                <button type="button" className="login-keypad-key wide" onClick={()=>handleKeypadInput('SPACE')} disabled={isLocked}>space</button>
                                <button type="button" className="login-keypad-key action submit" onClick={submit} disabled={isLocked}>enter</button>
                            </div>
                        </div>
                    )}

                    <div className="login-note">
                        Welcome to Aurora OS.
                        This is version 1.0.
                        With Out forgetting checkout Notes App.
                    </div>
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

function PasskeyIcon(){
    return(
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="15" r="4" />
            <path d="M12 15h9" />
            <path d="M19 12v6" />
            <path d="M16 13v4" />
        </svg>
    );
}

function KeypadIcon(){
    return(
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M7 8h.01M12 8h.01M17 8h.01" />
            <path d="M7 12h.01M12 12h.01M17 12h.01" />
            <path d="M7 16h10" />
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

