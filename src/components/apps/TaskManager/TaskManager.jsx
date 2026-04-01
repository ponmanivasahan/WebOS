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

function fmtDue(d){return d || '';}

function TimerView(){
  const [modeIdx,setModeIdx]=useState(0);
  const [modeMinutes, setModeMinutes]=useState(() => Object.fromEntries(MODES.map(m => [m.key, m.minutes])));
  const [seconds,setSeconds]=useState(MODES[0].minutes * 60);
  const [minutesInput, setMinutesInput]=useState(String(MODES[0].minutes));
  const [running,setRunning]=useState(false);
  const [session,setSession]=useState(1); 
  const [completed,setCompleted]=useState(0);
  const intervalRef = useRef(null);

  const mode=MODES[modeIdx];
  const currentModeMinutes=modeMinutes[mode.key] ?? mode.minutes;
  const total=Math.max(60, currentModeMinutes * 60);
  const progress=seconds/total;
  const offset=RING_C*progress;

  useEffect(() => {
    setMinutesInput(String(currentModeMinutes));
  }, [modeIdx, currentModeMinutes]);

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
              setSeconds((modeMinutes[MODES[next].key] ?? MODES[next].minutes) * 60);
            } else {
              setModeIdx(0);
              setSeconds((modeMinutes[MODES[0].key] ?? MODES[0].minutes) * 60);
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () =>clearInterval(intervalRef.current);
  }, [running,modeIdx,session,modeMinutes]);

  const switchMode = (idx)=>{
    clearInterval(intervalRef.current);
    setRunning(false);
    setModeIdx(idx);
    setSeconds((modeMinutes[MODES[idx].key] ?? MODES[idx].minutes) * 60);
  };

  const toggle =()=>setRunning(r =>!r);

  const reset = ()=>{
    clearInterval(intervalRef.current);
    setRunning(false);
    setSeconds(currentModeMinutes * 60);
  };

  const applyNewTime = ()=>{
    const nextMinutes=Math.max(1, Math.min(180, Number.parseInt(minutesInput, 10) || currentModeMinutes));
    clearInterval(intervalRef.current);
    setRunning(false);
    setModeMinutes(prev => ({ ...prev, [mode.key]: nextMinutes }));
    setMinutesInput(String(nextMinutes));
    setSeconds(nextMinutes * 60);
  };

  const skip =()=>{
    clearInterval(intervalRef.current);
    setRunning(false);
    const next =modeIdx === 0 ? (session >= SESSIONS_PER_SET ? 2 : 1) : 0;
    if (modeIdx===0) setSession(s => s >= SESSIONS_PER_SET ? 1 : s + 1);
    setModeIdx(next);
    setSeconds((modeMinutes[MODES[next].key] ?? MODES[next].minutes) * 60);
  };

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
          <span className="fa-session-label">
            {completed} session{completed !== 1 ? 's' : ''} complete
          </span>
        </div>
        <div className="fa-time-set">
          <label htmlFor="fa-time-input" className="fa-time-label">Minutes</label>
          <input
            id="fa-time-input"
            className="fa-time-input"
            type="number"
            min="1"
            max="180"
            value={minutesInput}
            onChange={e => setMinutesInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && applyNewTime()}
            aria-label={`Set ${mode.label} minutes`}
          />
          <button className="fa-btn-secondary fa-time-apply" onClick={applyNewTime}>Set</button>
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
  const [showDeleteConfirm, setShowDeleteConfirm]=useState(false);
  const ref=useRef(null);

  const startEdit=()=>{setEditing(true); setVal(task.title); setTimeout(() => ref.current?.focus(), 20); };
  const commit=()=>{if(val.trim()) onEdit(task.id, { title: val.trim() }); setEditing(false); };
  const onKey= e =>{if(e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); e.stopPropagation(); };
  
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };
  
  const handleConfirmDelete = () => {
    onDelete(task.id);
    setShowDeleteConfirm(false);
  };
  
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
        title={task.done ? 'Mark as incomplete' : 'Mark as complete'}
      />
      <span className={`fa-pri-dot ${task.priority}`} title={`Priority: ${task.priority}`} />

      {editing ? (
        <input
          ref={ref}
          className="fa-edit-input"
          value={val}
          onChange={e => setVal(e.target.value)}
          onBlur={commit}
          onKeyDown={onKey}
          onClick={e => e.stopPropagation()}
          placeholder="Edit task…"
        />
      ) : (
        <span className="fa-task-title" onDoubleClick={startEdit} title="Double-click to edit">
          {task.title}
        </span>
      )}

      {task.dueDate && (
        <span className="fa-due">
          {I.clock}&nbsp;{fmtDue(task.dueDate)}
        </span>
      )}

      <div className="fa-row-actions">
        <button
          className={`fa-icon-btn${isActive ? ' focus-set' : ''}`}
          onClick={() => setActiveTaskId(isActive ? null : task.id)}
          title={isActive ? 'Remove from focus' : 'Set as focus task'}
          aria-label={isActive ? 'Remove from focus' : 'Set as focus task'}
        >
          {I.target}
        </button>
        <button className="fa-icon-btn" onClick={startEdit} title="Edit" aria-label="Edit task">{I.edit} </button>
        <button 
          className="fa-icon-btn del" 
          onClick={handleDeleteClick} 
          title="Delete" 
          aria-label="Delete task"
        >
          {I.trash}
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="fa-confirm-overlay">
          <div className="fa-confirm-dialog">
            <div className="fa-confirm-title">Delete Task?</div>
            <div className="fa-confirm-message">Are you sure you want to delete "{task.title}"?</div>
            <div className="fa-confirm-actions">
              <button className="fa-confirm-cancel" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
              <button className="fa-confirm-delete" onClick={handleConfirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
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
  const [showDatePicker, setShowDatePicker]=useState(false);
  const [showTimePicker, setShowTimePicker]=useState(false);
  const [viewMonth, setViewMonth]=useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [timeDraft, setTimeDraft]=useState({ hour: 9, minute: 0 });
  const [dateCursor, setDateCursor]=useState('');
  const dateFieldRef = useRef(null);
  const timeFieldRef = useRef(null);
  const datePopoverRef = useRef(null);
  const timePopoverRef = useRef(null);

  const toDateValue = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parseDateValue = value => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const [y, m, day] = value.split('-').map(Number);
    return new Date(y, m - 1, day);
  };

  const openDatePicker = () => {
    const base = parseDateValue(dueDate) || new Date();
    setViewMonth(new Date(base.getFullYear(), base.getMonth(), 1));
    setDateCursor(toDateValue(base));
    setShowTimePicker(false);
    setShowDatePicker(v => !v);
  };

  const openTimePicker = () => {
    const now = new Date();
    const [h, m] = dueTime ? dueTime.split(':').map(Number) : [now.getHours(), now.getMinutes()];
    setTimeDraft({ hour: Number.isFinite(h) ? h : now.getHours(), minute: Number.isFinite(m) ? m : now.getMinutes() });
    setShowDatePicker(false);
    setShowTimePicker(v => !v);
  };

  const shiftHour = delta => {
    setTimeDraft(prev => ({ ...prev, hour: (prev.hour + delta + 24) % 24 }));
  };

  const shiftMinute = delta => {
    setTimeDraft(prev => ({ ...prev, minute: (prev.minute + delta + 60) % 60 }));
  };

  const applyTime = () => {
    setDueTime(`${pad(timeDraft.hour)}:${pad(timeDraft.minute)}`);
    setShowTimePicker(false);
  };

  const moveDateCursor = deltaDays => {
    const base = parseDateValue(dateCursor) || parseDateValue(dueDate) || new Date();
    const next = new Date(base.getFullYear(), base.getMonth(), base.getDate() + deltaDays);
    setDateCursor(toDateValue(next));
    setViewMonth(new Date(next.getFullYear(), next.getMonth(), 1));
  };

  const selectCursorDate = () => {
    if (!dateCursor) return;
    setDueDate(dateCursor);
    setShowDatePicker(false);
  };

  const onDatePopoverKeyDown = e => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setShowDatePicker(false);
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      selectCursorDate();
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      moveDateCursor(-1);
      return;
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      moveDateCursor(1);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      moveDateCursor(-7);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      moveDateCursor(7);
      return;
    }
  };

  const onTimePopoverKeyDown = e => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setShowTimePicker(false);
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      applyTime();
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (e.shiftKey) shiftHour(1);
      else shiftMinute(5);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (e.shiftKey) shiftHour(-1);
      else shiftMinute(-5);
      return;
    }
  };

  const todayDateValue = toDateValue(new Date());
  const monthTitle = viewMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const buildCalendarCells = () => {
    const y = viewMonth.getFullYear();
    const m = viewMonth.getMonth();
    const firstDay = new Date(y, m, 1).getDay();
    const currentDays = new Date(y, m + 1, 0).getDate();
    const prevDays = new Date(y, m, 0).getDate();
    const cells = [];

    for (let i = 0; i < 42; i++) {
      let cellDate;
      if (i < firstDay) {
        cellDate = new Date(y, m - 1, prevDays - firstDay + i + 1);
      } else if (i < firstDay + currentDays) {
        cellDate = new Date(y, m, i - firstDay + 1);
      } else {
        cellDate = new Date(y, m + 1, i - firstDay - currentDays + 1);
      }

      const value = toDateValue(cellDate);
      cells.push({
        value,
        day: cellDate.getDate(),
        inMonth: cellDate.getMonth() === m,
        isToday: value === todayDateValue,
        isSelected: value === dueDate,
      });
    }

    return cells;
  };

  useEffect(() => {
    if (!showDatePicker && !showTimePicker) return;
    const onDocMouseDown = e => {
      const insideDate = dateFieldRef.current?.contains(e.target);
      const insideTime = timeFieldRef.current?.contains(e.target);
      if (!insideDate && !insideTime) {
        setShowDatePicker(false);
        setShowTimePicker(false);
      }
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [showDatePicker, showTimePicker]);

  useEffect(() => {
    if (showDatePicker) datePopoverRef.current?.focus();
  }, [showDatePicker]);

  useEffect(() => {
    if (showTimePicker) timePopoverRef.current?.focus();
  }, [showTimePicker]);

  const fillToday = () => setDueDate(toDateValue(new Date()));
  const fillNow = () => {
    const now = new Date();
    setDueTime(`${pad(now.getHours())}:${pad(now.getMinutes())}`);
  };

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
        <div className="fa-add-main-row">
          <input
            className="fa-input fa-add-title"
            placeholder="Task title"
            value={title}
            onChange={e =>setTitle(e.target.value)}
            onKeyDown={e =>e.key==='Enter' && submit()}
            aria-label="New task title"
          />
          <button className="fa-add-btn" onClick={submit} aria-label="Add new task">Add task</button>
        </div>
        <div className="fa-add-meta-row">
          <label className="fa-field" ref={dateFieldRef}>
            <span className="fa-field-label">Due date</span>
            <div className="fa-field-control">
              <input 
                type="text"
                className="fa-input fa-add-date" 
                value={dueDate} 
                onChange={() => {}}
                placeholder="YYYY-MM-DD"
                readOnly
                aria-label="Due date"
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    openDatePicker();
                  }
                }}
              />
              <div className="fa-field-actions">
                <button type="button" className="fa-mini-btn" onClick={openDatePicker}>Pick</button>
                <button type="button" className="fa-mini-btn" onClick={fillToday}>Today</button>
                <button type="button" className="fa-mini-btn" onClick={() => setDueDate('')}>Clear</button>
              </div>
              {showDatePicker && (
                <div
                  ref={datePopoverRef}
                  className="fa-picker-popover fa-date-popover"
                  role="dialog"
                  aria-label="Choose due date"
                  tabIndex={-1}
                  onKeyDown={onDatePopoverKeyDown}
                >
                  <div className="fa-picker-head">
                    <button
                      type="button"
                      className="fa-picker-nav"
                      onClick={() => setViewMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                      aria-label="Previous month"
                    >
                      ‹
                    </button>
                    <div className="fa-picker-title">{monthTitle}</div>
                    <button
                      type="button"
                      className="fa-picker-nav"
                      onClick={() => setViewMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                      aria-label="Next month"
                    >
                      ›
                    </button>
                  </div>
                  <div className="fa-weekdays">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <span key={d}>{d}</span>)}
                  </div>
                  <div className="fa-calendar-grid">
                    {buildCalendarCells().map(cell => (
                      <button
                        key={cell.value}
                        type="button"
                        className={`fa-day-btn${cell.inMonth ? '' : ' muted'}${(cell.value === dateCursor || cell.isSelected) ? ' selected' : ''}${cell.isToday ? ' today' : ''}`}
                        onClick={() => {
                          setDueDate(cell.value);
                          setDateCursor(cell.value);
                          setShowDatePicker(false);
                        }}
                      >
                        {cell.day}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </label>
          <label className="fa-field" ref={timeFieldRef}>
            <span className="fa-field-label">Time</span>
            <div className="fa-field-control">
              <input 
                type="text"
                className="fa-input fa-add-time" 
                value={dueTime} 
                onChange={() => {}}
                placeholder="HH:MM"
                readOnly
                aria-label="Due time"
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    openTimePicker();
                  }
                }}
              />
              <div className="fa-field-actions">
                <button type="button" className="fa-mini-btn" onClick={openTimePicker}>Pick</button>
                <button type="button" className="fa-mini-btn" onClick={fillNow}>Now</button>
                <button type="button" className="fa-mini-btn" onClick={() => setDueTime('')}>Clear</button>
              </div>
              {showTimePicker && (
                <div
                  ref={timePopoverRef}
                  className="fa-picker-popover fa-time-popover"
                  role="dialog"
                  aria-label="Choose due time"
                  tabIndex={-1}
                  onKeyDown={onTimePopoverKeyDown}
                >
                  <div className="fa-time-grid">
                    <div className="fa-time-col">
                      <button type="button" className="fa-time-step" onClick={() => shiftHour(1)}>+</button>
                      <div className="fa-time-value">{pad(timeDraft.hour)}</div>
                      <button type="button" className="fa-time-step" onClick={() => shiftHour(-1)}>-</button>
                    </div>
                    <div className="fa-time-sep">:</div>
                    <div className="fa-time-col">
                      <button type="button" className="fa-time-step" onClick={() => shiftMinute(5)}>+</button>
                      <div className="fa-time-value">{pad(timeDraft.minute)}</div>
                      <button type="button" className="fa-time-step" onClick={() => shiftMinute(-5)}>-</button>
                    </div>
                  </div>
                  <div className="fa-time-actions">
                    <button type="button" className="fa-mini-btn" onClick={fillNow}>Now</button>
                    <button type="button" className="fa-mini-btn" onClick={applyTime}>Apply</button>
                  </div>
                </div>
              )}
            </div>
          </label>
          <label className="fa-field fa-field-priority">
            <span className="fa-field-label">Priority</span>
            <div className="fa-priority-group" role="group" aria-label="Task priority">
              {['high', 'medium', 'low'].map(level => (
                <button
                  key={level}
                  type="button"
                  className={`fa-priority-btn${priority === level ? ' active' : ''}`}
                  onClick={() => setPriority(level)}
                  aria-pressed={priority === level}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </label>
        </div>
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

      <div className="fa-task-body">
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
        <span className="fa-appname">Focus App</span>
        {activeTaskId && (
          <span className="fa-title-current" title="Currently focusing on">
             {tasks.find(t => t.id === activeTaskId)?.title}
          </span>
        )}
      </div>
      <nav className="fa-nav">
        <div className="fa-nav-tab-wrap">
          <button 
            className={`fa-nav-btn${tab === 'timer' ? ' active' : ''}`} 
            onClick={() => setTab('timer')}
            aria-label="Timer tab"
            aria-current={tab === 'timer' ? 'page' : undefined}
          >
            {I.timer} Timer
          </button>
        </div>
        <div className="fa-nav-tab-wrap">
          <button 
            className={`fa-nav-btn${tab === 'tasks' ? ' active' : ''}`} 
            onClick={() => setTab('tasks')}
            aria-label="Tasks tab"
            aria-current={tab === 'tasks' ? 'page' : undefined}
          >
            {I.tasks} Tasks
            {activeTasks.length>0 &&(
              <span className="fa-nav-badge" title={`${activeTasks.length} active task${activeTasks.length !== 1 ? 's' : ''}`}>
                {activeTasks.length}
              </span>
            )}
          </button>
        </div>
      </nav>
      {tab==='timer' ?(
        <TimerView />
      ) : (
        <TasksView
          activeTaskId={activeTaskId}
          setActiveTaskId={setActiveTaskId}
        />
      )}

    </div>
  );
}