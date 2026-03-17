import {useState,useEffect,useRef} from 'react'
import './welcome.css';
const CORRECT_PASSWORD='pwd';
export default function LoginScreen({onAuthenticate}){
    const [password,setPassword]=useState('')
    const [error,setError]=useState('');
    const [success,setSuccess]=useState(false);
    const [shaking,setShaking]=useState(false);
    const [attempts,setAttempts]=useState(0);
    const [showPwd,setShowPwd]=useState(false)
    const inputRef=useRef(null);

    useEffect(()=>{
        setTimeout(()=>inputRef.current?.focus(),250);
    },[]);

    const submit=()=>{
        if(!password || success) return;
        if(password===CORRECT_PASSWORD){
            setSuccess(true);
            setError('');
            setTimeout(onAuthenticate,900);
        }
        else{
            const a=attempts+1;
            setAttempts(a);
            setError(
                a>=3 ? `${a} incorrect attempts. Account may be locked.` : 'The password is incorrect. Please try again.'
            );
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
        <div className="w-screen login-screen">
            <div className="login-frame">
                <div className="login-body">
                    <div className="login-avatar">
                        <UserIcon />
                    </div>
                    <div className="login-name">User</div>
                    <div className={`login-input-wrap${shaking ? ' login-input-shake' :''}`} >
                        <div className={rowClass}>
                            <input ref={inputRef} type={showPwd ? 'text':'password'} placeholder="Password" value={password} className="login-input" onChange={(e)=>{
                                setPassword(e.target.value);
                                setError('');
                            }} onKeyDown={(e)=>e.key==='Enter' && submit()} />

                            <button type="button" className="login-eye-btn" onClick={()=>setShowPwd((v)=>!v)} tabIndex={-1}>
                                {showPwd ? <EyeOffIcon/> : <EyeIcon />}
                            </button>
                        </div>

                        {error &&(
                            <div className="login-msg is-error">{error}</div>
                        )}
                        {success &&(
                            <div className="login-msg is-success">Signing in ... </div>
                        )}
                    </div>

                    {success && (
                        <div className="login-fill-track">
                            <div className="login-fill-bar" />
                            </div>
                    )}

                    <div className="login-hint">
                        Hint:<b>pwd</b>
                    </div>
                </div>
                <div className="login-footer-row">
                    <button type="button" className="os-btn primary" onClick={submit}>
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

function EyeIcon(){
    return(
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/>
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

function EyeOffIcon(){
    return(
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17.94 17.94A10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <line x1="1" y1="1"x2="23" y2="23" />
        </svg>
    );
}