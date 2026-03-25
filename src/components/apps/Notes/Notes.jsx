import {useState,useEffect,useCallback} from 'react';
import './notes.css';

const STORAGE_KEY='aurora_notes';
function loadNotes(){
    try{
        const raw=localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw):[
            {id:'default_1',title:'Welcome',
                body:'This is your Notepad app. \n\nCreate notes using the New button. \nClick a note in the sidebar to open it.',
                updatedAt:new Date().toISOString(),
            },
        ];
    }
    catch{return [];}
}

function saveNotes(notes){
    try{
        localStorage.setItem(STORAGE_KEY,JSON.stringify(notes));
    }
    catch{/*ig */}
}

function makeId(){
    return `n_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
}

function fmtDate(iso){
    if(!iso) return '';
    const d=new Date(iso);
    return d.toLocaleDateString('en-US',{month:'short',day:'numeric'})
    +' '+d.toLocaleDateString('en-US',{hour:'2-digit',minute:'2-digit'});
}

export default function Notes(){
    const[notes,setNotes]=useState(()=>loadNotes());
    const [activeId,setActiveId]=useState(()=>loadNotes()[0]?.id ?? null);
    const [searchQ,setSearchQ]=useState('');

    useEffect(()=>saveNotes(notes),[notes]);
    const activeNote=notes.find((n)=>n.id===activeId) ?? null;

    const filtered=searchQ.trim() ? notes.filter((n)=> n.title.toLowerCase().includes(searchQ.toLowerCase()) ||
n.body.toLowerCase().includes(searchQ.toLowerCase())
): notes;

const handleNew=useCallback(()=>{
    const note={
        id:makeId(),title:'Untitled Note',
        body:'',updatedAt:new Date().toISOString(),
    };
    setNotes((prev)=>[note,...prev]);
    setActiveId(note.id);
},[]);

const handleDelete=useCallback(()=>{
    if(!activeId)return;
    setNotes((prev)=>{
        const next=prev.filter((n)=>n.id !==activeId);
        return next;
    });
    setActiveId((prev)=>{
        const remaining=notes.filter((n)=>n.id !==prev);
        return remaining[0]?.id ?? null;
    });
},[activeId,notes]);

const handleTitleChange=useCallback((value)=>{
    setNotes((prev)=>
    prev.map((n)=>
    n.id===activeId ? {...n,title:value,updatedAt:new Date().toISOString()}:n));
},[activeId]);

const handleBodyChange=useCallback((value)=>{
    setNotes((prev)=>prev.map((n)=>n.id===activeId ? {...n,body:value,updatedAt:new Date().toISOString()}:n))
},[activeId]);

const wordCount=activeNote ? activeNote.body.trim().split(/\s+/).filter(Boolean).length :0;
const charCount=activeNote ? activeNote.body.length:0;
    return(
        <div className='notes-shell'>
            <div className='notes-toolbar'>
                <button className='notes-toolbar-btn' onClick={handleNew}>+ New</button>
                <div className='notes-toolbar-sep' />
                <button className="notes-toolbar-btn" disabled={!activeNote} onClick={handleDelete}>
                  Delete
                </button>

                <input className='notes-search' placeholder='Search notes...' value={searchQ} onChange={(e)=>setSearchQ(e.target.value)} onClick={(e)=>e.stopPropagation()} />
            </div>

            <div className='notes-body'>
                <div className='notes-sidebar'>
                    <div className='notes-list'>
                        {filtered.length===0 ? (
                            <div className='notes-empty-sidebar'>
                                {searchQ ? 'No results.' : 'No notes yet.'}
                            </div>
                        ):(
                            filtered.map((note)=>(
                                <div key={note.id} className={`notes-list-item${activeId===note.id ? 'is-selected' :''}`}
                                onClick={()=>setActiveId(note.id)}>
                                 <div className='notes-item-title'>{note.title || 'Untitled'}</div>    
                                 <div className='notes-item-preview'>
                                                {note.body.slice(0,40).replace(/\n/g,' ') || '-'}
                                 </div>
                                 <div className='notes-item-date'>{fmtDate(note.updatedAt)}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                <div className='notes-editor-panel'>
                    {activeNote ? (
                        <>
                        <input className='notes-title-input' placeholder="Note title..." value={activeNote.title} onChange={(e)=>handleTitleChange(e.target.value)}
                        onClick={(e)=>e.stopPropagation()} />

                        <textarea className='notes-textarea' placeholder='Start writing...' value={activeNote.body}
                        onChange={(e)=>handleBodyChange(e.target.value)}
                        onClick={(e)=>e.stopPropagation()} spellCheck />
                        </>
                    ) : (
                        <div className='notes-placeholder'>
                          Select a note or click + New    
                        </div>
                    )}
                </div>
            </div>
            
            <div className='notes-statusbar'>
                <span className='notes-status-panel'>{notes.length} note{notes.length !==1 ? 's' : ''}</span>
                {activeNote && (
                    <>
                    <span className='notes-status-panel'>{wordCount} words</span>
                    <span className='notes-status-panel'>{charCount} chars</span>
                    <span className='notes-status-panel'>Saved {fmtDate(activeNote.updatedAt)}</span>
                    </>
                )}
            </div>
        </div>
    );
}