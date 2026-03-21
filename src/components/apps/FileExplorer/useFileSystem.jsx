import {useState,useCallback} from 'react';
const FS_KEY='aurora_fs';
const DEFAULT_FS={
    '/':[
        {id:'d1',name:'Documents',type:'folder',modified:'2026-03-02'},
        {id:'d2',name:'Downloads',type:'folder',modified:'2024-03-02'},
        {id:'d3',name:'Pictures',type:'folder',modified:'2024-03-02'},
    ],
    '/Documents':[
        {id:'f1',name:'readme.txt',type:'file',modified:'2026-03-02'},
        {id:'f2',name:'notes.txt',type:'file',modified:'2026-03-02'},
    ],
    '/Downloads':[],
    '/Pictures':[],
};


function loadFS(fs){
    try{
      const raw=localStorage.getItem(FS_KEY);
      return raw ? JSON.parse(raw) :DEFAULT_FS;
    }
    catch{
       return DEFAULT_FS;
    }
}
function saveFS(fs){
    try{
        localStorage.setItem(FS_KEY,JSON.stringify(fs));
    }
    catch{/*quota exceeded*/}
}
function makeId(){
    return `${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
}

function todayStr(){
    return new Date().toISOString().slice(0,10);
}

export default function useFileSystem(){
    const [fs,setFs]=useState(()=>loadFS());

    const update=useCallback((updater)=>{
        setFs((prev)=>{
            const next=updater(prev);
            saveFS(next);
            return next;
        });
    },[]);

    const listDir=useCallback(
        (path)=>fs[path] || [],[fs]
    );

    const exists=useCallback(
        (path,name)=>(fs[path] || []).some((e)=>e.name===name),
        [fs]
    );
     const uniqueName=useCallback(
        (path,base,ext='')=>{
            const entries=fs[path] || [];
            let name=base+ext;
            let i=2;
            while(entries.some((e)=>e.name===name)){
                name=`${base} (${i}) ${ext}`;
                i++;
            }
            return name;
        },
        [fs]
     );
    const createFolder=useCallback(
        (path,nameHint='New Folder')=>{
            const name=uniqueName(path,nameHint);
            const id=makeId();
            const folderPath=(path==='/' ? '':path)+'/'+name;
            update((prev)=>({
                ...prev,
                [path]:[...DEFAULT_FS(prev[path] || []),{
                    id,name,type:'folder',modified:todayStr(),
                }],
                [folderPath]:prev[folderPath] || [],
            }));
            return {id,name};
        },
        [update,uniqueName]
    );

    const createFile=useCallback(
        (path,nameHint='New Text Document',ext='.txt')=>{
            const name=uniqueName(path,nameHint,ext);
            const id=makeId();
            update((prev)=>({
                ...prev,
                [path]:[...(prev[path] || []),{
                  id,name,type:'file',modified:todayStr(),
                }],
            }));
            return {id,name};
        },
        [update,uniqueName]
    );

    const deleteEntry=useCallback(
        (path,id)=>{
            update((prev)=>{
                const entry=(prev[path] || []).find((e)=>e.id===id);
                const next={...prev,[path] : (prev[path] || []).filter((e)=>e.id !==id)};

                if(entry?.type==='folder'){
                    const folderPath=(path==='/' ? '' :path)+'/'+entry.name;
                    Object.keys(next).forEach((k)=>{
                        if(k===folderPath || k.startsWith(folderPath + '/')){
                            delete next[k];
                        }
                    });
                }
                return next;
            });
        },
        [update]
    );

    const renameEntry=useCallback(
        (path,id,newName)=>{
            update((prev)=>{
                const entries=prev[path] || [];
                const entry=entries.find((e)=>e.id===id);
                if(!entry) return prev;

                const next={
                    ...prev,[path]:entries.map((e)=>e.id===id ? {...e,name:newName,modified:todayStr()}:e),
                };

                if(entry.type==='folder'){
                    const oldPath=(path==='/' ? '':path)+'/'+entry.name;
                    const newPath=(path==='/' ? '':path)+'/'+newName;
                    Object.keys(prev).forEach((k)=>{
                        if(k===oldPath || k.startsWith(oldPath+'/')){
                            const relocated=newPath+k.slice(oldPath.length);
                            next[relocated]=prev[k];
                            if(relocated !==k) delete next[k];
                        }
                    });
                }
                return next;
            });
        },
        [update]
    )

    return {fs,listDir,exists,createFolder,createFile,deleteEntry,renameEntry};
}