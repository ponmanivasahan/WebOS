import {useState} from 'react';
import LockScreen from './LockScreen';
import LoginScreen from './LoginScreen';

export default function WelcomeScreen({onComplete}){
    const [stage,setStage] = useState('lock');
    if(stage==='lock'){
        return <LockScreen onUnlock={()=>setStage('login')} />
    }
    if(stage==='login'){
        return <LoginScreen onAuthenticate={()=>{onComplete?.();}} />
    }

    return null;
}