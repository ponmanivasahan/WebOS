import {useState,useRef,useCallback} from 'react';
import useTaskStore from './useTaskStore';

import './taskmanager.css';

const TABS=[
    {key:'all',label:'All'},
    {key:'active',label:'Active'},
    {key:'done',label:'Done'},
];
const PRIORITIES=['all','high','medium','low'];

const Icons={
   checkSquare:(
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" >
        <rect x="3" y="3" width="18" height="18" rx="4"/><polyline points="9 12 11.5 14.5 15.5 9.5"/>  
    </svg>
   ),
   clock:(
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" strokeColor="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/>
    </svg>
   ),
   circle:(
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" >
        <circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>
    </svg>
   ),
   check:(
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="9"/><polyline points="8.5 12 11 14.5 16 9"/> 
    </svg>
   ),
   flag:(
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M5 3v18"/><path d="M5 4h12l-3 5 3 5H5"/>
    </svg>
   ),
   edit:(
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
   ),
   trash: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
    </svg>
  ),
  tasks: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="3" width="18" height="18" rx="3"/>
      <path d="M8 10l2.5 2.5 5-5"/><line x1="8" y1="16" x2="16" y2="16"/>
    </svg>
  ),
  gripVertical: (
    <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor">
      <circle cx="3" cy="3"  r="1.5"/><circle cx="3" cy="8"  r="1.5"/><circle cx="3" cy="13" r="1.5"/>
      <circle cx="7" cy="3"  r="1.5"/><circle cx="7" cy="8"  r="1.5"/><circle cx="7" cy="13" r="1.5"/>
    </svg>
  ),
}
function dueBadgeClass(dueDate){
    if(!dueDate) return '';
    const today=new Date().toISOString().slice(0,10);
    if(dueDate<today) return 'is-overdue';
    if(dueDate===today) return 'is-today';
    return '';
}
function formatDue(dueDate,dueTime){
    return [dueDate,dueTime].filter(Boolean).join(' ');
}

function PriorityDot({priority}){
    return <div className={`tm-priority ${priority}`} title={priority} />;
}


function tabIcon(key){
    if(key==='all') return Icons.circle;
    if(key==='active') return Icons.clock;
    return Icons.check;
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
    
     const handleEditKey = (e) => {
    if (e.key === 'Enter')  commitEdit();
    if (e.key === 'Escape') setEditing(false);
    e.stopPropagation();
    };
    const isOver=dragOverId===task.id;
    const overCls=isOver ? (dragOverPos==='top' ? 'drag-over-top' : 'drag-over-bottom') : '';
    const doneCls=task.done ? 'is-done': '';
    return(
        <div className={`tm-task${doneCls}${overCls}`}
        draggable onDragStart={(e)=>onDragStart(e,index,task.id)}
        onDragEnter={(e)=>onDragEnter(e,index,task.id)}
        onDragOver={(e)=>{e.preventDefault(); onDragEnter(e,index,task.id);}}
        onDragEnd={onDragEnd} onDrop={(e)=>onDrop(e,index)}>
            <span className="tm-drag-handle" title="Drag to reorder">{Icons.gripVertical}</span>

            <input type='checkbox' className='tm-checkbox' checked={task.done} onChange={()=>onToggle(task.id)} />
            <PriorityDot priority={task.priority} />

            {editing ? (
                <input ref={editRef} className='tm-edit-input' value={editVal} onChange={(e)=>setEditVal(e.target.value)} onBlur={commitEdit} 
                onKeyDown={handleEditKey} onClick={(e)=>e.stopPropagation()} />
            ) : (
                <span className="tm-task-title" onDoubleClick={startEdit} title="Double click to edit">
                    {task.title}
                </span>
            )
        }

        {(task.dueDate || task.dueTime) && (
            <span className={`tm-due ${dueBadgeClass(task.dueDate)}`}>
                {Icons.clock}&nbsp;{formatDue(task.dueDate, task.dueTime)}
            </span>
        )}

        <div className="tm-task-actions">
            <button className="tm-action-btn" onClick={startEdit} title="Edit task">{Icons.edit}</button>
            <button className="tm-action-btn danger" onClick={()=>onDelete(task.id)} title="Delete task">{Icons.trash}</button>
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
                <option value="high"> High</option>
                <option value="medium"> Medium</option>
                <option value="low"> Low</option>
            </select>
            <button className='tm-add-btn' onClick={submit}>+ Add Task</button>
        </div>
    );
}

export default function TaskManager() {
  const { tasks, addTask, toggleDone, deleteTask, editTask, reorderTasks } = useTaskStore();
 
  const [filter,    setFilter]    = useState('all');
  const [priFilter, setPriFilter] = useState('all');
 
  const dragFromIdx = useRef(null);
  const dragFromId  = useRef(null);
  const [dragOverId,  setDragOverId]  = useState(null);
  const [dragOverPos, setDragOverPos] = useState('bottom');
 
  const handleDragStart = useCallback((e, index, id) => {
    dragFromIdx.current = index;
    dragFromId.current  = id;
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => { if (e.target) e.target.style.opacity = '0.45'; }, 0);
  }, []);
 
  const handleDragEnter = useCallback((e, _index, id) => {
    if (dragFromId.current === id) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos  = e.clientY < rect.top + rect.height / 2 ? 'top' : 'bottom';
    setDragOverId(id);
    setDragOverPos(pos);
  }, []);
 
  const handleDragEnd = useCallback((e) => {
    if (e.target) e.target.style.opacity = '';
    setDragOverId(null);
    dragFromIdx.current = null;
    dragFromId.current  = null;
  }, []);
 
  const handleDrop = useCallback((e, toIdx) => {
    e.preventDefault();
    const fromIdx = dragFromIdx.current;
    if (fromIdx === null || fromIdx === toIdx) { setDragOverId(null); return; }
    const rect   = e.currentTarget.getBoundingClientRect();
    const pos    = e.clientY < rect.top + rect.height / 2 ? 'top' : 'bottom';
    let   realTo = pos === 'top' ? toIdx : toIdx + 1;
    if (fromIdx < realTo) realTo -= 1;
    reorderTasks(fromIdx, Math.max(0, realTo));
    setDragOverId(null);
  }, [reorderTasks]);
  const totalCount  = tasks.length;
  const doneCount   = tasks.filter((t) => t.done).length;
  const activeCount = tasks.filter((t) => !t.done).length;
 
  const tabCount = { all: totalCount, active: activeCount, done: doneCount };
 
  const visibleTasks = tasks.filter((t) => {
    const doneOk = filter === 'all' ? true : filter === 'active' ? !t.done : t.done;
    const priOk  = priFilter === 'all' ? true : t.priority === priFilter;
    return doneOk && priOk;
  });
 
  const progressPct = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);
 
  return (
    <div className="tm-shell">
 
      <div className="tm-header">
        <div className="tm-header-left">
          <div className="tm-app-icon">{Icons.tasks}</div>
          <div>
            <div className="tm-app-title">Task Manager</div>
            <div className="tm-app-subtitle">
              {progressPct}% complete
            </div>
          </div>
        </div>
 
        <div className="tm-header-stats">
          <div className="tm-stat-chip">
            <span>Total</span>
            <span className="num">{totalCount}</span>
          </div>
          <div className="tm-stat-chip active">
            <span>Active</span>
            <span className="num">{activeCount}</span>
          </div>
          <div className="tm-stat-chip done">
            <span>Done</span>
            <span className="num">{doneCount}</span>
          </div>
        </div>
      </div>
 
      <div className="tm-toolbar">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            className={`tm-tab${filter === key ? ' is-active' : ''}`}
            onClick={() => setFilter(key)}
          >
            <span className="tm-tab-icon">{tabIcon(key)}</span>
            {label}
            <span style={{ opacity: 0.6, fontSize: 11, marginLeft: 2 }}>
              ({tabCount[key]})
            </span>
          </button>
        ))}
      </div>
 
      <AddTaskForm onAdd={addTask} />
 
      <div className="tm-filter-bar">
        <span className="tm-filter-label">
          {Icons.flag} Priority
        </span>
        {PRIORITIES.map((p) => (
          <button
            key={p}
            className={`tm-filter-btn${priFilter === p ? ' is-active' : ''}`}
            onClick={() => setPriFilter(p)}
          >
            {p !== 'all' && <span className={`tm-pri-dot tm-pri-dot-${p}`} />}
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>
 
      <div className="tm-body">
        {visibleTasks.length === 0 ? (
          <div className="tm-empty">
            <span className="tm-empty-icon">
              {filter === 'done' ? '🏁' : filter === 'active' ? '⚡' : '📋'}
            </span>
            {filter === 'done'
              ? 'No completed tasks yet.'
              : filter === 'active'
              ? 'All caught up! Add a task above.'
              : 'No tasks yet. Add one above!'}
          </div>
        ) : (
          visibleTasks.map((task, index) => (
            <TaskItem
              key={task.id}
              task={task}
              index={index}
              onToggle={toggleDone}
              onDelete={deleteTask}
              onEdit={editTask}
              onDragStart={handleDragStart}
              onDragEnter={handleDragEnter}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
              dragOverId={dragOverId}
              dragOverPos={dragOverPos}
            />
          ))
        )}
      </div>
 
      <div className="tm-statusbar">
        <span className="tm-status-panel">
          <span className="val">{totalCount}</span> total
        </span>
        <span className="tm-status-panel">
          <span className="val">{activeCount}</span> active
        </span>
        <span className="tm-status-panel">
          <span className="val">{doneCount}</span> done
        </span>
        <span className="tm-status-spacer" />
        <div className="tm-progress-bar" title={`${progressPct}% done`}>
          <div className="tm-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </div>
 
    </div>
  );
}