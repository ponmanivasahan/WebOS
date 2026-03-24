import {useState,useEffect,useRef} from 'react'
import './welcome.css';
import background from '../../assets/background2.png';
const CORRECT_PASSWORD='pwd';
export default function LoginScreen({onAuthenticate}){
    const [password,setPassword]=useState('')
    const [error,setError]=useState('');
    const [success,setSuccess]=useState(false);
    const [shaking,setShaking]=useState(false);
    const [attempts,setAttempts]=useState(0);
    const inputRef=useRef(null);

    useEffect(()=>{
        setTimeout(()=>inputRef.current?.focus(),250);
    },[]);

    const submit=()=>{
        if(!password || success) return;
        if(password===CORRECT_PASSWORD){
            setSuccess(true);
            setError('');
            setTimeout(onAuthenticate,550);
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
        <div className="w-screen login-screen" style={{ '--login-bg-image': `url(${background})` }}>
            <div className="login-frame">
                <div className="login-avatar">
                    <UserIcon />
                </div>

                <div className={`login-input-wrap${shaking ? ' login-input-shake' :''}`} >
                    <div className={rowClass}>
                        <input ref={inputRef} type="password" placeholder="Password" value={password} className="login-input" onChange={(e)=>{
                            setPassword(e.target.value);
                            setError('');
                        }} onKeyDown={(e)=>e.key==='Enter' && submit()} />

                        <button type="button" className="login-go-btn" onClick={submit} tabIndex={-1} aria-label="Sign in">
                            <ArrowRightIcon />
                        </button>
                    </div>

                    {error &&(
                        <div className="login-msg is-error">{error}</div>
                    )}
                    {success &&(
                        <div className="login-msg is-success">Signing in ... </div>
                    )}

                    <div className="login-hint">
                        Hint: <b>pwd</b>
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

function ArrowRightIcon(){
    return(
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14" />
            <path d="m13 5 7 7-7 7" />
        </svg>
    );
}

