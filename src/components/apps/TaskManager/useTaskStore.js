import {useState,useCallback} from 'react';
const STORAGE_KEY='aurora_tasks';
function load(){
    try{
       const raw=localStorage.getItem(STORAGE_KEY);
       return raw ? JSON.parse(raw) :[];
    }
    catch{
        return[];
    }
}

function save(tasks){
    try{
        localStorage.setItem(STORAGE_KEY,JSON.stringify(tasks));
    }
    catch{/*ignore*/}
}

function makeId(){
    return `t_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
}

export default function useTaskStore(){
    const [tasks,setTasks]=useState(()=>load());

    const update=useCallback((updater)=>{
        setTasks((prev)=>{
            const next=updater(prev);
            save(next);
            return next;
        });
    },[]);

    const addTask=useCallback(({title, dueDate='', dueTime='', priority='medium'})=>{
        if(!title.trim()) return;
        const task={
            id:makeId(),
            title:title.trim(),
            dueDate,
            dueTime,
            priority,
            done:false,
            createdAt:new Date().toISOString(),
        };
        update((prev)=>[...prev,task]);
    },[update]);

    const toggleDone=useCallback((id)=>{
        update((prev)=>prev.map((t)=>t.id===id ? {...t,done:!t.done}:t));
    },[update]);

    const deleteTask=useCallback((id)=>{
        update((prev)=>prev.filter((t)=>t.id!==id));
    },[update]);

    const editTask=useCallback((id,fields)=>{
        update((prev)=>prev.map((t)=>t.id===id ? {...t,...fields} : t));
    },[update]);

    const reorderTasks=useCallback((fromIdx,toIdx)=>{
        update((prev)=>{
            const next=[...prev];
            const [moved]=next.splice(fromIdx,1);
            next.splice(toIdx,0,moved);
            return next;
        });
    },[update]);

    return {tasks,addTask,toggleDone,deleteTask,editTask,reorderTasks};
}