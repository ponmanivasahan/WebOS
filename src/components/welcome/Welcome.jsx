import {useState} from 'react';
import BootScreen from './Bootscreen';
import LockScreen from './LockScreen';
import LoginScreen from './LoginScreen';

export default function WelcomeScreen({onComplete}){
    const [stage,setStage] = useState('boot');
    if(stage=='boot'){
        return <BootScreen onDone={()=>setStage('lock')} />
    }
    if(stage=='lock'){
        return <LockScreen onUnlock={()=>setStage('login')} />
    }
    if(stage=='login'){
        return <LoginScreen onAuthenticate={()=>{onComplete?.();}} />
    }

    return null;
}