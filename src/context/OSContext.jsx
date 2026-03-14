import React,{createContext,useContext,useState} from 'react';
const Ctx=createContext(null);

export function OSProvider({children}){
    const [username,setUsername]=useState('User');
    const [wallpaper,setWallpaper]=useState(null);
    return(
        <Ctx.Provider value={{username,setUsername,wallpaper,setWallpaper}}>
            {children}
        </Ctx.Provider>
    )
}

export const useOS=()=>useContext(Ctx);