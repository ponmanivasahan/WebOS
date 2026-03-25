import {useState,useEffect,useCallback,useRef,useMemo} from 'react';
import './notes.css';
import useFileSystem from '../FileExplorer/useFileSystem';

const STORAGE_KEY='aurora_notes';
const NOTE_CONTENTS_KEY='aurora_note_file_contents';
const DOCS_PATH='/Documents';

const WELCOME_TEXT='Welcome to your Notes app.\n\nWishing you a great day and smooth work ahead.\nUse + to create new files, then write and organize your ideas freely.\n\nYou are doing great. Keep going.';

function toFileBaseName(title){
    const cleaned=(title || 'Untitled').replace(/[\\/:*?"<>|]/g,' ').replace(/\s+/g,' ').trim();
    return cleaned || 'Untitled';
}

function toFileName(title){
    return `${toFileBaseName(title)}.txt`;
}

function stripTxt(fileName){
    return fileName?.toLowerCase().endsWith('.txt') ? fileName.slice(0,-4) : fileName;
}

function loadNotes(){
    try{
        const raw=localStorage.getItem(STORAGE_KEY);
        const parsed=raw ? JSON.parse(raw) : null;
        if(Array.isArray(parsed) && parsed.length>0) return parsed;
        return [
            {
                id:'default_1',
                title:'Welcome',
                filePath:DOCS_PATH,
                fileName:'Welcome.txt',
                body:WELCOME_TEXT,
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

function loadContents(){
    try{
        const raw=localStorage.getItem(NOTE_CONTENTS_KEY);
        const parsed=raw ? JSON.parse(raw) : {};
        return parsed && typeof parsed==='object' ? parsed : {};
    }
    catch{return {};}
}

function saveContents(contents){
    try{
        localStorage.setItem(NOTE_CONTENTS_KEY,JSON.stringify(contents));
    }
    catch{/*ig */}
}

function makeId(){
    return `n_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
}

const BoldIcon=()=>(
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    </svg>
);

const ItalicIcon=()=>(
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="19" y1="4" x2="10" y2="4" />
        <line x1="14" y1="20" x2="5" y2="20" />
        <line x1="15" y1="4" x2="9" y2="20" />
    </svg>
);

const UnderlineIcon=()=>(
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" />
        <line x1="4" y1="21" x2="20" y2="21" />
    </svg>
);

const StrikeIcon=()=>(
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="4" y1="12" x2="20" y2="12" />
        <path d="M17.5 6.5C17.5 4.567 15.209 3 12.5 3S7.5 4.567 7.5 6.5c0 2.5 2.5 3 5 4" />
        <path d="M6.5 17.5C6.5 19.433 8.791 21 11.5 21s5-1.567 5-3.5c0-2-2-3-4.5-3.5" />
    </svg>
);

const SettingsIcon =()=>(
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);

export default function Notes({onWindowTitleChange,newFileSignal,titleRenameRequest}){
    const initialNotes=useRef(loadNotes()).current;
    const initialContents=useRef(loadContents()).current;

    const [notes,setNotes]=useState(initialNotes);
    const [activeId,setActiveId]=useState(initialNotes[0]?.id ?? null);
    const [contentsMap,setContentsMap]=useState(initialContents);
    const [fmt,setFmt]=useState({bold:false,italic:false,underline:false,strikethrough:false});
    const editorRef=useRef(null);
    const lastNewSignalRef=useRef(0);
    const lastRenameTokenRef=useRef(0);

    const {listDir,createFile,deleteEntry,renameEntry}=useFileSystem();

    useEffect(()=>saveNotes(notes),[notes]);
    useEffect(()=>saveContents(contentsMap),[contentsMap]);

    useEffect(()=>{
        if(notes.length>0) return;
        const note={
            id:'default_1',
            title:'Welcome',
            filePath:DOCS_PATH,
            fileName:'Welcome.txt',
            body:WELCOME_TEXT,
            updatedAt:new Date().toISOString(),
        };
        setNotes([note]);
        setActiveId(note.id);
    },[notes]);

    const docsFiles=useMemo(
        ()=>listDir(DOCS_PATH).filter((e)=>e.type==='file'),
        [listDir]
    );

    useEffect(()=>{
        const byId=new Map(docsFiles.map((f)=>[f.id,f]));
        const byName=new Map(docsFiles.map((f)=>[f.name,f]));

        let changed=false;
        const next=notes.map((note)=>{
            if(note.fsId && byId.has(note.fsId)) return note;

            const desiredName=note.fileName || toFileName(note.title);
            const existing=byName.get(desiredName);

            if(existing){
                changed=true;
                return {...note,fsId:existing.id,filePath:DOCS_PATH,fileName:existing.name};
            }

            const created=createFile(DOCS_PATH,toFileBaseName(note.title),'.txt');
            changed=true;
            setContentsMap((prev)=>({
                ...prev,
                [created.id]:prev[created.id] ?? note.body ?? '',
            }));
            return {...note,fsId:created.id,filePath:DOCS_PATH,fileName:created.name};
        });

        if(changed) setNotes(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[docsFiles,createFile]);

    const activeNote=notes.find((n)=>n.id===activeId) ?? null;

    useEffect(()=>{
        if(!activeNote){
            onWindowTitleChange?.('Notepad');
            return;
        }
        onWindowTitleChange?.(activeNote.fileName || toFileName(activeNote.title));
    },[activeNote,onWindowTitleChange]);

    const handleNew=useCallback(()=>{
        const created=createFile(DOCS_PATH,'New Text Document','.txt');
        const note={
            id:makeId(),
            title:stripTxt(created.name),
            fileName:created.name,
            filePath:DOCS_PATH,
            fsId:created.id,
            body:'',
            updatedAt:new Date().toISOString(),
        };
        setNotes((prev)=>[...prev,note]);
        setContentsMap((prev)=>({...prev,[created.id]:''}));
        setActiveId(note.id);
    },[createFile]);

    const handleDelete=useCallback((targetId=activeId)=>{
        if(!targetId)return;
        setNotes((prev)=>{
            const deleting=prev.find((n)=>n.id===targetId);
            if(deleting?.fsId){
                deleteEntry(deleting.filePath || DOCS_PATH,deleting.fsId);
                setContentsMap((map)=>{
                    const nextMap={...map};
                    delete nextMap[deleting.fsId];
                    return nextMap;
                });
            }
            const next=prev.filter((n)=>n.id!==targetId);
            setActiveId(next[0]?.id ?? null);
            return next;
        });
    },[activeId,deleteEntry]);

    const renameNoteById=useCallback((noteId,value)=>{
        const newTitle=value;
        setNotes((prev)=>
            prev.map((n)=>{
                if(n.id!==noteId) return n;
                if(n.fsId){
                    const nextFileName=toFileName(newTitle);
                    if(nextFileName!==n.fileName){
                        renameEntry(n.filePath || DOCS_PATH,n.fsId,nextFileName);
                    }
                    return {...n,title:newTitle,fileName:nextFileName,updatedAt:new Date().toISOString()};
                }
                return {...n,title:newTitle,updatedAt:new Date().toISOString()};
            })
        );
    },[renameEntry]);

    useEffect(()=>{
        if((newFileSignal || 0) <= lastNewSignalRef.current) return;
        lastNewSignalRef.current=newFileSignal;
        handleNew();
    },[newFileSignal,handleNew]);

    useEffect(()=>{
        if(!titleRenameRequest?.token || !activeNote) return;
        if(titleRenameRequest.token===lastRenameTokenRef.current) return;
        lastRenameTokenRef.current=titleRenameRequest.token;
        const normalized=stripTxt(titleRenameRequest.value || '').trim();
        renameNoteById(activeNote.id,normalized || 'Untitled');
    },[titleRenameRequest,activeNote,renameNoteById]);

    const handleEditorInput=useCallback(()=>{
        const html=editorRef.current?.innerHTML ?? '';
        let fsIdToSave=null;

        setNotes((prev)=>
            prev.map((n)=>{
                if(n.id!==activeId) return n;
                fsIdToSave=n.fsId || null;
                return {...n,body:html,updatedAt:new Date().toISOString()};
            })
        );

        if(fsIdToSave){
            setContentsMap((prev)=>({...prev,[fsIdToSave]:html}));
        }
    },[activeId]);

    const updateFmtState=()=>{
        setFmt({
            bold:document.queryCommandState('bold'),
            italic:document.queryCommandState('italic'),
            underline:document.queryCommandState('underline'),
            strikethrough:document.queryCommandState('strikeThrough'),
        });
    };

    const applyFormat=(cmd)=>{
        editorRef.current?.focus();
        if(typeof document.execCommand==='function'){
            document.execCommand(cmd,false,null);
        }
        updateFmtState();
        handleEditorInput();
    };

    useEffect(()=>{
        const onKeyDown=(e)=>{
            const isSaveShortcut=(e.ctrlKey || e.metaKey) && e.key.toLowerCase()==='s';
            if(!isSaveShortcut || !activeNote) return;
            e.preventDefault();
            handleEditorInput();
        };

        window.addEventListener('keydown',onKeyDown);
        return ()=>window.removeEventListener('keydown',onKeyDown);
    },[activeNote,handleEditorInput]);

    useEffect(()=>{
        if(editorRef.current && activeNote){
            const body=activeNote.fsId ? (contentsMap[activeNote.fsId] ?? activeNote.body) : activeNote.body;
            editorRef.current.innerHTML=body || '';
        }
    },[activeId]);

    return(
        <div className='notes-shell'>
            <div className='notes-toolbar'>
                <div className='notes-menu-group'>
                    <span className='notes-menu-item'>File</span>
                    <span className='notes-menu-item'>Edit</span>
                    <span className='notes-menu-item'>View</span>
                </div>

                <div className='notes-toolbar-sep' />

                <div className='notes-fmt-group'>
                    <button className={`notes-fmt-btn${fmt.bold ? ' is-active' : ''}`} onClick={()=>applyFormat('bold')} title='Bold (Ctrl+B)'>
                        <BoldIcon />
                    </button>
                    <button className={`notes-fmt-btn${fmt.italic ? ' is-active' : ''}`} onClick={()=>applyFormat('italic')} title='Italic (Ctrl+I)'>
                        <ItalicIcon />
                    </button>
                    <button className={`notes-fmt-btn${fmt.underline ? ' is-active' : ''}`} onClick={()=>applyFormat('underline')} title='Underline (Ctrl+U)'>
                        <UnderlineIcon />
                    </button>
                    <button className={`notes-fmt-btn${fmt.strikethrough ? ' is-active' : ''}`} onClick={()=>applyFormat('strikeThrough')} title='Strikethrough'>
                        <StrikeIcon />
                    </button>
                </div>

                <button className='notes-settings-btn' title='Settings'>
                    <SettingsIcon />
                </button>
                {notes.length>1 && (
                    <button className='notes-delete-file-btn' onClick={()=>handleDelete(activeId)} title='Close file'>x</button>
                )}
            </div>

            <div className='notes-editor-panel'>
                {activeNote ? (
                    <>
                        <div
                            ref={editorRef}
                            className='notes-editor'
                            contentEditable
                            suppressContentEditableWarning
                            onInput={handleEditorInput}
                            onKeyUp={updateFmtState}
                            onMouseUp={updateFmtState}
                            onSelect={updateFmtState}
                            onClick={(e)=>e.stopPropagation()}
                            spellCheck
                            data-placeholder='Start writing...'
                        />
                    </>
                ) : (
                    <div className='notes-placeholder'>
                        Click + to create a new text file
                    </div>
                )}
            </div>

        </div>
    );
}
