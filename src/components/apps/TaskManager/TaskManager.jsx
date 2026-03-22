import {useState,useRef,useCallback} from 'react';
import useTaskStore from './useTaskStore';

import './taskmanager.css';

function dueBadgeClass(dueDate){
    if(!dueDate) return '';
    const today=new Date().toISOString().slice(0,10);
    if(dueDate<today) return 'is-overdue';
    if(dueDate===today) return 'is-today';
    return '';
}

function fmtDue(dueDate,dueTime){
    if(!dueDate && !dueTime){
        return '';
    }
    return [dueDate,dueTime].filter(Boolean).join(' ');
}

function priorityDot({priority}){
    return <div className={`tm-priority ${priority}`} title={priority} />;
}

function TaskItem({task,index,onToggle,onDelete,onEdit,
    onDragStart,onDragEnter,onDragEnd,onDrop,dragOverId,dragOverPos,
}){
    const [editing, setEditing]=useState(false);
    const [editVal,setEditVal]=useState(task.title);
    const editRef=useRef(null);

    const startEdit=()=>{
        setEditing(true);
        setEditVal(task.title);
        setTimeout(()=>editRef.current ?.focus(),20);
    };

    const commitEdit=()=>{
        if(editVal.trim()) onEdit(task.id,{title:editVal.trim()});
        setEditing(false);
    };

    const isOver=dragOverId===task.id;
    const overCls=isOver ? (dragOverPos==='top' ? 'drag-over-top' : 'drag-over-bottom') : '';

    return(
        <div className={`tm-task${task.done ? 'is-done' : ''}${overCls}`}
        draggable onDragStart={(e)=>onDragStart(e,index,task.id)}
        onDragEnter={(e)=>onDragEnter(e,index,task.id)}
        onDragOver={(e)=>{e.preventDefault(); onDragEnter(e,index,task.id);}}
        onDragEnd={onDragEnd} onDrop={(e)=>onDrop(e,index)}>
            <span className="tm-drag-handle" title="Drag to reorder">⠿</span>

            <input type='checkbox' className='tm-checkbox' checked={task.done} onChange={()=>onToggle(task.id)} />
            <priorityDot priority={task.priority} />

            {ending ? (
                <input ref={editRef} className='tm-edit-input' value={editVal} onChange={(e)=>setEditVal(e.target.value)} onBlur={commitEdit} onKeyDown={(e)=>{
                    if(e.key==='Enter') commitEdit(); 
                    if(e.key==='Escape') setEditing(false);
                    e.stopPropagation();
                }} onClick={(e)=>e.stopPropagation()} />
            ) : (
                <span className="tm-task-title" onDoubleClick={startEdit} title="Double click to edit">
                    {task.title}
                </span>
            )
        }

        {(task.dueDate || task.dueTime) && (
            <span className={`tm-due ${duebadgeClass(task.dueDate)}`}>
                {fmtDue(task.dueDate,task.dueTime)}
            </span>
        )}

        <div className="tm-task-actions">
            <button className="tm-action-btn" onClick={startEdit} title="Edit">✎</button>
            <button className="tm-action-btn danger" onClick={()=>onDelete(task.id)} title="Delete">✕</button>
        </div>
        </div>
    );
}

function AddTaskForm({onAdd}){
    const [title,setTitle]=useState('');
    const [dueDate,setDueDate]=useState('');
    const [dueTime,setDueTime]=useState('');
    const [priority,setPriority]=useState('medium');

    const submit=()=>{
        if(!title.trim()) return;
        onAdd({title,dueDate,dueTime,priority});
        setTitle('');
        setDueDate(''); setDueTime(''); setPriority('medium');
    };

    return(
        <div className='tm-add-form'>
            <input className='tm-add-title' placeholder="New task title..." value={title} onChange={(e)=>setTitle(e.target.value)}
            onKeyDown={(e)=>e.key==='Enter' && submit()} />
            <input type='date' className='tm-add-date' value={dueDate}
            onChange={(e)=>setDueDate(e.target.value)} title='Due date' />
            <input type="time" className="tm-add-time" value={dueTime}
            onChange={(e)=>setDueTime(e.target.value)} title="Due time" />
            <select className='tm-add-priority' value={priority} onChange={(e)=>setPriority(e.target.value)}>
                <option value="high">⬤ High</option>
                <option value="medium">⬤ Medium</option>
                <option value="low">⬤ Low</option>
            </select>
            <button className='tm-add-btn' onClick={submit}>+ Add</button>
        </div>
    );
}

export default function TaskManager(){
    const{tasks,addTask,toggleDone,deleteTask,editTask,reorderTasks}=useTaskStore();
    const [filter,setFilter]=useState('all');
    const [priFilter,setPriFilter]=useState('all');

    const dragFromIdx=useRef(null);
    const dragFromId=useRef(null);
    const [dragOverId,setDragOverId]=useState(null);
    const [dragOverPos,setDragOverPos]=useState('bottom');

    const handleDragStart=useCallback((e,index,id)=>{
        dragFromIdx.current=index;
        dragFromId.current=id;
        e.dataTransfer.effectAllowed='move';
        setTimeout(()=>{
            if(e.target){
                e.target.style.opacity='0.45';
            }
        },0)
    },[]);

    const handleDragEnter=useCallback((e,_index,id)=>{
        if(dragFromId.current===id) return;
        const rect=e.currentTarget.getBoundingClientRect();
        const pos=e.clientY<rect.top+rect.height/2 ? 'top' :'bottom';
        setDragOverId(id);
        setDragOverPos(pos);
    },[]);

    const handleDragEnd=useCallback((e)=>{
        if(e.target) e.target.style.opacity='';
        setDragOverId(null);
        dragFromIdx.current=null;
        dragFromId.current=null;
    },[]);

    const handleDrop=useCallback((e,toIdx)=>{
        e.preventDefault();
        const fromIdx=dragFromIdx.current;
        if(fromIdx===null || fromIdx===toIdx){
            setDragOverId(null);
            return;
        }
        const rect=e.currentTarget.getBoundingClientRect();
        const pos=e.clientY<rect.top+rect.height/2 ?'top':'bottom';
        let realTo=pos==='top' ? toIdx : toIdx+1;
        if(fromIdx<realTo) realTo-=1;
        reorderTasks(fromIdx,Math.max(0,realTo));
        setDragOverId(null);
    },[reorderTasks]);

    const visible=tasks.filter((t)=>{
        const doneOk=filter==='all' ? true :filter==='active' ? !t.done :t.done;
        const priOk=priFilter==='all' ? true: t.priority===priFilter;
        return doneOk && priOk;
    });

    const doneCount=tasks.filter((t)=>t.done).length;
    const activeCount=tasks.filter((t)=>!t.done).length;

    return(
        <div className='tm-shell'>
            <div className='tm-toolbar'>
                {[
                    {key:'all',label:`All (${tasks.length})`},
                    {key:'active',label:`Active (${activeCount})`},
                    {key:'done',label:`Done (${doneCount})`},
                ].map(({key,label})=>(
                    <button key={key} className={`tm-tab${filter===key ? 'is-active' : ''}`}
                    onClick={()=>setFilter(key)} >
                        {label}
                    </button>
                ))}
            </div>

            <AddTaskForm onAdd={addTask} />

            <div className="tm-filter-bar">
                <span>Priority:</span>
                {['all','high','medium','low'].map((p)=>(
                    <button key={p} className={`tm-filter-btn${priFilter===p ? 'is-active' : ''}`}
                    onClick={()=>setPriFilter(p)}>
                        {p.charAt(0).toUpperCase()+p.slice(1)}
                    </button>
                ))}
            </div>

            <div className='tm-body'>
                {visible.length===0 ? (
                    <div className='tm-empty'>
                        {filter==='done' ? 'No completed tasks yet.' : filter==='active' ? 'No active tasks. Add one above!' : 'No tasks yet. Add one above!'}
                    </div>
                ):(
                    visible.map((task,index)=>(
                        <TaskItem key={task.id} task={task} index={index} onToggle={toggleDone}
                        onDelete={deleteTask} onEdit={editTask} onDragStart={handleDragStart}
                        onDragEnter={handleDragEnter} onDragEnd={handleDragEnd} onDrop={handleDrop}
                        dragOverId={dragOverId} dragOverPos={dragOverPos} />
                    ))
                )}
            </div>

            <div className='tm-statusbar'>
                <span className='tm-status-panel'>{tasks.length} total</span>
                <span className='tm-status-panel'>{activeCount} active</span>
                <span className='tm-status-panel'>{doneCount} done</span>
            </div>
        </div>
    );
}