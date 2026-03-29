import { useState, useEffect, useRef, useCallback } from 'react';
import useTaskStore from './useTaskStore';
import './taskmanager.css';

const MODES =[
  {key:'focus',label:'Focus',minutes:25,ring:''},
  {key:'short',label:'Short Break',minutes:5,ring:'break'},
  {key:'long',label:'Long Break',minutes:15,ring:'long-break'},
];

const SESSIONS_PER_SET=4;
const RING_R=88;
const RING_C=2 *Math.PI*RING_R;

const I={
  logo:(
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
      <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
    </svg>
  ),
  timer:(
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/>
    </svg>
  ),
  tasks:(
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"/>
    </svg>
  ),
  play:(
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21"/>
    </svg>
  ),
  pause:(
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
    </svg>
  ),
  reset:(
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <polyline points="1 4 1 10 7 10"/>
      <path d="M3.51 15a9 9 0 1 0 .49-4.6"/>
    </svg>
  ),
  skip:(
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <polygon points="5 4 15 12 5 20"/><line x1="19" y1="5" x2="19" y2="19"/>
    </svg>
  ),
  edit:(
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
    </svg>
  ),
  trash:(
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
    </svg>
  ),
  target:(
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  grip:(
    <svg width="8" height="14" viewBox="0 0 8 14" fill="currentColor">
      <circle cx="2" cy="2"  r="1.2"/><circle cx="6" cy="2"  r="1.2"/>
      <circle cx="2" cy="7"  r="1.2"/><circle cx="6" cy="7"  r="1.2"/>
      <circle cx="2" cy="12" r="1.2"/><circle cx="6" cy="12" r="1.2"/>
    </svg>
  ),
  clock:(
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>
    </svg>
  ),
};

const pad=(n) =>String(n).padStart(2,'0');
const fmt=(s) =>`${pad(Math.floor(s/60))}:${pad(s % 60)}`;

function dueCls(d){
  if(!d) return '';
  const t=new Date().toISOString().slice(0, 10);
  if (d<t) return 'overdue';
  if (d === t) return 'today';
  return '';
}

function fmtDue(d, t){return [d, t].filter(Boolean).join(' ');}

function TimerView({tasks,activeTaskId,setActiveTaskId }){
  const [modeIdx,setModeIdx]=useState(0);
  const [seconds,setSeconds]=useState(MODES[0].minutes * 60);
  const [running,setRunning]=useState(false);
  const [session,setSession]=useState(1); 
  const [completed,setCompleted]=useState(0);
  const intervalRef = useRef(null);

  const mode=MODES[modeIdx];
  const total=mode.minutes*60;
  const progress=seconds/total;
  const offset=RING_C*progress;
  useEffect(()=>{
    if(running){
      intervalRef.current=setInterval(() =>{
        setSeconds(s =>{
          if (s<=1){
            clearInterval(intervalRef.current);
            setRunning(false);
            if (modeIdx === 0) {
              const next = session>=SESSIONS_PER_SET ? 2 : 1;
              setCompleted(c =>c+1);
              setSession(s2 =>s2>=SESSIONS_PER_SET ? 1 : s2 + 1);
              setModeIdx(next);
              setSeconds(MODES[next].minutes*60);
            } else {
              setModeIdx(0);
              setSeconds(MODES[0].minutes*60);
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () =>clearInterval(intervalRef.current);
  }, [running,modeIdx,session]);

  const switchMode = (idx)=>{
    clearInterval(intervalRef.current);
    setRunning(false);
    setModeIdx(idx);
    setSeconds(MODES[idx].minutes * 60);
  };

  const toggle =()=>setRunning(r =>!r);

  const reset = ()=>{
    clearInterval(intervalRef.current);
    setRunning(false);
    setSeconds(mode.minutes * 60);
  };

  const skip =()=>{
    clearInterval(intervalRef.current);
    setRunning(false);
    const next =modeIdx === 0 ? (session >= SESSIONS_PER_SET ? 2 : 1) : 0;
    if (modeIdx===0) setSession(s => s >= SESSIONS_PER_SET ? 1 : s + 1);
    setModeIdx(next);
    setSeconds(MODES[next].minutes*60);
  };

  const activeTasks=tasks.filter(t => !t.done);
  const activeTask=tasks.find(t => t.id === activeTaskId);
  const dots = Array.from({ length: SESSIONS_PER_SET }, (_, i) => {
    if (i < completed % SESSIONS_PER_SET) return 'done';
    if (i === (completed % SESSIONS_PER_SET) && modeIdx !== 0) return 'break';
    return '';
  });

  return (
    <div className="fa-timer-view">
      <div className="fa-modes">
        {MODES.map((m, i) => (
          <button
            key={m.key}
            className={`fa-mode-btn${modeIdx === i ? ' active' : ''}`}
            onClick={() => switchMode(i)}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div className="fa-timer-centre">
        <div className="fa-ring-wrap">
          <svg className="fa-ring-svg" viewBox="0 0 200 200">
            <circle className="fa-ring-track" cx="100" cy="100" r={RING_R} />
            <circle
              className={`fa-ring-fill ${mode.ring}`}
              cx="100" cy="100" r={RING_R}
              strokeDasharray={RING_C}
              strokeDashoffset={RING_C - offset}
            />
          </svg>
          <div className="fa-ring-center">
            <div className="fa-timer-digits">{fmt(seconds)}</div>
            <div className="fa-timer-mode-label">{mode.label}</div>
          </div>
        </div>
        <div className="fa-sessions">
          {dots.map((cls, i) => (
            <span key={i} className={`fa-session-dot ${cls}`} />
          ))}
          <span className="fa-session-label">
            {completed} session{completed !== 1 ? 's' : ''} complete
          </span>
        </div>
        <div className="fa-controls">
          <button className="fa-btn-secondary" onClick={reset}>
            {I.reset}&nbsp; Reset
          </button>
          <button className="fa-btn-primary" onClick={toggle}>
            {running ? I.pause : I.play}
            &nbsp;{running ? 'Pause' : 'Start Focus'}
          </button>
          <button className="fa-btn-secondary" onClick={skip}>
            {I.skip}&nbsp; Skip
          </button>
        </div>
      </div>
      <div className="fa-active-task">
        <div className="fa-active-task-label">Now focusing on</div>
        {activeTask ? (
          <div className="fa-active-task-pick">
            <span className={`fa-pri-dot ${activeTask.priority}`} />
            <span className="fa-active-task-title">{activeTask.title}</span>
            <button className="fa-icon-btn" onClick={() => setActiveTaskId(null)} title="Clear">✕</button>
          </div>
        ) : (
          <div className="fa-active-task-pick">
            {activeTasks.length === 0 ? (
              <span>No tasks — add some in the Tasks tab</span>
            ) : (
              <>
                <span>Pick a task to focus on</span>
                <select
                  className="fa-task-select"
                  value=""
                  onChange={e => setActiveTaskId(e.target.value)}
                >
                  <option value="" disabled>Select task…</option>
                  {activeTasks.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

function TaskRow({
  task, index, activeTaskId, setActiveTaskId,
  onToggle, onDelete, onEdit,
  onDragStart, onDragEnter, onDragEnd, onDrop,
  dragOverId, dragOverPos,
}) {
  const [editing,setEditing]=useState(false);
  const [val,setVal]=useState(task.title);
  const ref=useRef(null);

  const startEdit=()=>{setEditing(true); setVal(task.title); setTimeout(() => ref.current?.focus(), 20); };
  const commit=()=>{if(val.trim()) onEdit(task.id, { title: val.trim() }); setEditing(false); };
  const onKey= e =>{if(e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); e.stopPropagation(); };
  const isOver=dragOverId === task.id;
  const overCls=isOver ? `drag-${dragOverPos}` : '';
  const isActive = activeTaskId === task.id;
  return (
    <div
      className={`fa-task${task.done ? ' done' : ''}${overCls}${isActive ? ' is-active-task' : ''}`}
      draggable
      onDragStart={e => onDragStart(e,index,task.id)}
      onDragEnter={e => onDragEnter(e,index,task.id)}
      onDragOver={e  => {e.preventDefault(); onDragEnter(e, index, task.id); }}
      onDragEnd={onDragEnd}
      onDrop={e => onDrop(e, index)}
    >
      <span className="fa-grip">{I.grip}</span>

      <input
        type="checkbox"
        className="fa-check"
        checked={task.done}
        onChange={() => onToggle(task.id)}
      />
      <span className={`fa-pri-dot ${task.priority}`} title={task.priority} />

      {editing ? (
        <input
          ref={ref}
          className="fa-edit-input"
          value={val}
          onChange={e => setVal(e.target.value)}
          onBlur={commit}
          onKeyDown={onKey}
          onClick={e => e.stopPropagation()}
        />
      ) : (
        <span className="fa-task-title" onDoubleClick={startEdit} title="Double-click to edit">
          {task.title}
        </span>
      )}

      {(task.dueDate || task.dueTime) && (
        <span className={`fa-due ${dueCls(task.dueDate)}`}>
          {I.clock}&nbsp;{fmtDue(task.dueDate, task.dueTime)}
        </span>
      )}

      <div className="fa-row-actions">
        <button
          className={`fa-icon-btn${isActive ? ' focus-set' : ''}`}
          onClick={() => setActiveTaskId(isActive ? null : task.id)}
          title={isActive ? 'Remove from focus' : 'Set as focus task'}
        >
          {I.target}
        </button>
        <button className="fa-icon-btn" onClick={startEdit} title="Edit">{I.edit} </button>
        <button className="fa-icon-btn del" onClick={() => onDelete(task.id)} title="Delete">{I.trash}</button>
      </div>
    </div>
  );
}

function TasksView({activeTaskId,setActiveTaskId}){
  const { tasks,addTask,toggleDone,deleteTask,editTask, reorderTasks } = useTaskStore();

  const [filter,setFilter]=useState('all');
  const [priFilter,setPriFilter]=useState('all');
  const [title,setTitle]=useState('');
  const [dueDate,setDueDate]=useState('');
  const [dueTime,setDueTime]=useState('');
  const [priority,setPriority]=useState('medium');

  const submit = () =>{
    if (!title.trim()) return;
    addTask({ title, dueDate, dueTime, priority });
    setTitle(''); setDueDate(''); setDueTime(''); setPriority('medium');
  };

  const fromIdx=useRef(null);
  const fromId =useRef(null);
  const [dragOverId,setDragOverId]=useState(null);
  const [dragOverPos,setDragOverPos]=useState('bottom');

  const onDragStart = useCallback((e, i, id) => {
    fromIdx.current = i; fromId.current = id;
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => { if (e.target) e.target.style.opacity = '0.4'; }, 0);
  }, []);

  const onDragEnter = useCallback((e, _i, id) => {
    if (fromId.current === id) return;
    const { top, height } = e.currentTarget.getBoundingClientRect();
    setDragOverId(id);
    setDragOverPos(e.clientY < top + height / 2 ? 'top' : 'bottom');
  }, []);

  const onDragEnd = useCallback(e => {
    if (e.target) e.target.style.opacity = '';
    setDragOverId(null);
    fromIdx.current = null; fromId.current = null;
  }, []);

  const onDrop = useCallback((e, toIdx) => {
    e.preventDefault();
    const fi = fromIdx.current;
    if (fi === null || fi === toIdx) { setDragOverId(null); return; }
    const { top, height } = e.currentTarget.getBoundingClientRect();
    const pos = e.clientY < top + height / 2 ? 'top' : 'bottom';
    let realTo = pos === 'top' ? toIdx : toIdx + 1;
    if (fi < realTo) realTo--;
    reorderTasks(fi, Math.max(0, realTo));
    setDragOverId(null);
  }, [reorderTasks]);

  const total=tasks.length;
  const done =tasks.filter(t => t.done).length;
  const active=total -done;
  const pct=total=== 0 ? 0 : Math.round(done/total*100);

  const counts ={all:total,active,done};

  const visible = tasks.filter(t => {
    const fm=filter==='all' ? true : filter==='active' ? !t.done : t.done;
    const fp=priFilter==='all' ? true : t.priority===priFilter;
    return fm && fp;
  });

  const EMPTY_MSG = {
    done:'No completed tasks yet.',
    active:'All caught up.',
    all:'No tasks yet. Add one above.',
  };

  return (
    <div className="fa-tasks-view">
      <div className="fa-add-form">
        <input
          className="fa-input fa-add-title"
          placeholder="New task…"
          value={title}
          onChange={e =>setTitle(e.target.value)}
          onKeyDown={e =>e.key==='Enter' && submit()}
        />
        <input type="date" className="fa-input fa-add-date" value={dueDate} onChange={e =>setDueDate(e.target.value)} title="Due date" />
        <input type="time" className="fa-input fa-add-time" value={dueTime} onChange={e =>setDueTime(e.target.value)} title="Due time" />
        <select className="fa-add-select" value={priority} onChange={e => setPriority(e.target.value)}>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <button className="fa-add-btn" onClick={submit}>+ Add</button>
      </div>
      <div className="fa-filter-row">
        {['all', 'active', 'done'].map(k => (
          <button
            key={k}
            className={`fa-pill${filter === k ? ' active' : ''}`}
            onClick={() => setFilter(k)}
          >
            {k.charAt(0).toUpperCase() + k.slice(1)}
            <span className="fa-pill-count">{counts[k]}</span>
          </button>
        ))}
        <span className="fa-filter-sep" />
        {['all', 'high', 'medium', 'low'].map(p =>(
          <button
            key={p}
            className={`fa-pill${priFilter === p ? ' active' : ''}`}
            onClick={() => setPriFilter(p)}
          >
            {p !== 'all' && <span className={`fa-dot fa-dot-${p}`} />}
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

=      <div className="fa-task-body">
        {visible.length === 0 ? (
          <div className="fa-empty">
            <span className="fa-empty-icon">{filter === 'done' ? '🏁' : '📋'}</span>
            {EMPTY_MSG[filter] ?? 'No tasks.'}
          </div>
        ) : (
          visible.map((task,i) =>(
            <TaskRow
              key={task.id}
              task={task}
              index={i}
              activeTaskId={activeTaskId}
              setActiveTaskId={setActiveTaskId}
              onToggle={toggleDone}
              onDelete={deleteTask}
              onEdit={editTask}
              onDragStart={onDragStart}
              onDragEnter={onDragEnter}
              onDragEnd={onDragEnd}
              onDrop={onDrop}
              dragOverId={dragOverId}
              dragOverPos={dragOverPos}
            />
          ))
        )}
      </div>

      <footer className="fa-statusbar">
        <span className="fa-status-text"><strong>{active}</strong> active</span>
        <span className="fa-status-sep" />
        <span className="fa-status-text"><strong>{done}</strong> done</span>
        <span className="fa-spacer" />
        <span className="fa-progress-label">{pct}%</span>
        <div className="fa-progress-bar">
          <div className="fa-progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </footer>
    </div>
  );
}

export default function FocusApp() {
  const [tab,setTab]=useState('timer');
  const [activeTaskId,setActiveTaskId]=useState(null);
  const {tasks}=useTaskStore();

  const activeTasks=tasks.filter(t => !t.done);
  return (
    <div className="fa-shell">
      <div className="fa-titlebar">
        <div className="fa-logo">{I.logo}</div>
        <span className="fa-appname">Focus</span>
        {activeTaskId && (
          <span style={{ fontSize: 11, color: 'var(--t3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
            ● {tasks.find(t => t.id === activeTaskId)?.title}
          </span>
        )}
      </div>
      <nav className="fa-nav">
        <div className="fa-nav-tab-wrap">
          <button className={`fa-nav-btn${tab === 'timer' ? ' active' : ''}`} onClick={() => setTab('timer')}>
            {I.timer} Timer
          </button>
        </div>
        <div className="fa-nav-tab-wrap">
          <button className={`fa-nav-btn${tab === 'tasks' ? ' active' : ''}`} onClick={() => setTab('tasks')}>
            {I.tasks} Tasks
            {activeTasks.length>0 &&(
              <span style={{
                fontSize:10,fontWeight:700,background:'var(--acc)',
                color:'#fff',padding:'0 5px',borderRadius:99,marginLeft:2
              }}>
                {activeTasks.length}
              </span>
            )}
          </button>
        </div>
      </nav>
      {tab==='timer' ?(
        <TimerView
          tasks={tasks}
          activeTaskId={activeTaskId}
          setActiveTaskId={setActiveTaskId}
        />
      ) : (
        <TasksView
          activeTaskId={activeTaskId}
          setActiveTaskId={setActiveTaskId}
        />
      )}

    </div>
  );
}