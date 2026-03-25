import React,{createContext,useContext,useEffect,useMemo,useState} from 'react';
const Ctx=createContext(null);

const WALLPAPER_STORAGE_KEY='webos_wallpaper_v1';
const SOUND_STORAGE_KEY='webos_sound_volume_v1';
const BRIGHTNESS_STORAGE_KEY='webos_brightness_v1';

function clampPercent(value, fallback){
    const n=Number(value);
    if(Number.isNaN(n)) return fallback;
    return Math.min(100,Math.max(0,n));
}

function loadPercent(key, fallback){
    try{
        const raw=localStorage.getItem(key);
        if(raw===null) return fallback;
        return clampPercent(raw,fallback);
    }
    catch{
        return fallback;
    }
}

function normalizeWallpaper(value){
    if(!value) return null;
    if(typeof value==='object' && value.type && typeof value.value==='string') return value;
    if(typeof value==='string') {
        // Legacy support for previous string-only wallpaper values.
        if(value.startsWith('data:image/')) return {type:'upload',value};
        if(value.startsWith('#') || value.startsWith('linear-gradient(')) return null;
        return {type:'asset',value};
    }
    return null;
}

function loadWallpaper(){
    try{
        const raw=localStorage.getItem(WALLPAPER_STORAGE_KEY);
        if(!raw) return null;
        return normalizeWallpaper(JSON.parse(raw));
    }
    catch{
        return null;
    }
}

export function OSProvider({children}){
    const [username,setUsername]=useState('User');
    const [wallpaper,setWallpaper]=useState(()=>loadWallpaper());
    const [soundVolume,setSoundVolume]=useState(()=>loadPercent(SOUND_STORAGE_KEY,68));
    const [brightness,setBrightness]=useState(()=>loadPercent(BRIGHTNESS_STORAGE_KEY,72));

    useEffect(()=>{
        try{
            if(!wallpaper){
                localStorage.removeItem(WALLPAPER_STORAGE_KEY);
                return;
            }
            localStorage.setItem(WALLPAPER_STORAGE_KEY,JSON.stringify(wallpaper));
        }
        catch{/* ignore storage issues */}
    },[wallpaper]);

    useEffect(()=>{
        try{localStorage.setItem(SOUND_STORAGE_KEY,String(clampPercent(soundVolume,68)));}
        catch{/* ignore storage issues */}
    },[soundVolume]);

    useEffect(()=>{
        try{localStorage.setItem(BRIGHTNESS_STORAGE_KEY,String(clampPercent(brightness,72)));}
        catch{/* ignore storage issues */}
    },[brightness]);

    const value=useMemo(()=>({
        username,
        setUsername,
        wallpaper,
        setWallpaper,
        soundVolume,
        setSoundVolume,
        brightness,
        setBrightness,
    }),[username,wallpaper,soundVolume,brightness]);
    return(
        <Ctx.Provider value={value}>
            {children}
        </Ctx.Provider>
    )
}

export const useOS=()=>useContext(Ctx);