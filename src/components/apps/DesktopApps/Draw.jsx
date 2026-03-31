import { useCallback, useEffect, useRef, useState } from "react";
import './draw.css';
const TOOLS=[
    {key:'pen',icon:'pencil',label:'Pen'},
    {key:'eraser',icon:'eraser',label:'Eraser'},
    {key:'fill',icon:'fill',label:'Fill'},
    {key:'text',icon:'T',label:'Text'},
    {key:'line',icon:'/',label:'Line'},
    {key:'rect',icon:'Rect',label:'Rect'},
    {key:'circle',icon:'circle',label:'Circle'},
    {key:'triangle',icon:'Triangle',label:'Triangle'},
];

const STROKE_SIZES=[
    {key:'s',px:2},
    {key:'m',px:5},
    {key:'l',px:10},
    {key:'xl',px:20},
];

const PALETTE = [
  '#000000', '#ffffff', '#6b6b6b', '#c8c8c8',
  '#d32f2f', '#e64a19', '#f57c00', '#fbc02d',
  '#388e3c', '#0288d1', '#1565c0', '#6a1b9a',
  '#ad1457', '#00838f', '#4e342e', '#546e7a',
];
const CANVAS_W=1280;
const CANVAS_H=800;
const Ic={
    logo:
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
      </svg>,
    undo:
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <polyline points="9 14 4 9 9 4"/>
        <path d="M20 20v-7a4 4 0 0 0-4-4H4"/>
      </svg>,
    redo:
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <polyline points="15 14 20 9 15 4"/>
        <path d="M4 20v-7a4 4 0 0 1 4-4h12"/>
      </svg>,
    save:
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>,
    clear:    
       <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
         <polyline points="3 6 5 6 21 6"/>
         <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
       </svg>,
    newfile:  
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
         <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
         <polyline points="14 2 14 8 20 8"/>
        </svg>,
}
function hexToRgba(hex){
  const h=hex.replace('#','');
  return[
    parseInt(h.slice(0,2),16),
    parseInt(h.slice(2,4),16),
    parseInt(h.slice(4,6),16),
    255,
  ];
}
export default function DrawApp(){
     const canvasRef=useRef(null);
      const isDown=useRef(false);
      const startPt=useRef({x:0,y:0});
      const snapshotRef=useRef(null);
      const textInputRef=useRef(null);
      const [tool,setTool]=useState('pen');
      const [color,setColor]=useState('#000000');
      const [customColor,setCustomColor]=useState('#000000');
      const [strokePx,setStrokePx]=useState(3);
      const [opacity,setOpacity]=useState(100);
      const [history,setHistory]=useState([]);
      const [redoStack,setRedoStack]=useState([]);
      const [pos,setPos]=useState({x:0,y:0});
      const [canvasSize,setCanvasSize]=useState({w:CANVAS_W,h:CANVAS_H});
    
      const [textActive,setTextActive]=useState(false);
      const[textPos,setTextPos]=useState({x:0,y:0});
      const [textVal,setTextVal]=useState('');

      useEffect(()=>{
        const ctx=canvasRef.current.getContext('2d');
        ctx.fillStyle='#ffffff';
        ctx.fillRect(0,0,CANVAS_W,CANVAS_H);
      },[]);

      const ctx=()=>canvasRef.current.getContext('2d');

      const getPos=useCallback((e)=>{
        const rect=canvasRef.current.getBoundingClientRect();
        const scaleX=canvasRef.current.width/rect.width;
        const scaleY=canvasRef.current.height/rect.height;
        const cx=e.touches ? e.touches[0].clientX :e.clientX;
        const cy=e.touches ? e.touches[0].clientY :e.clientY;
        return{
            x:(cx-rect.left)*scaleX,
            y:(cy-rect.top)*scaleY,
        };
      },[]);
    const snapshot=()=>ctx().getImageData(0,0,canvasRef.current.width,canvasRef.current.height);
    const pushHistory=useCallback(()=>{
        setHistory(h=>[...h.slice(-49),snapshot()]);
        setRedoStack([]);
    },[]);

    const undo=useCallback(()=>{
        if(history.length===0) return;
        const prev=history[history.length-1];
        setRedoStack(r=>[snapshot(),...r.slice(0,49)]);
        setHistory(h=>h.slice(0,-1));
        ctx().putImageData(prev,0,0);
    },[history]);

    const redo=useCallback(()=>{
        if(redoStack.length===0) return;
        const next=redoStack[0];
        setHistory(h=>[...h,snapshot()]);
        setRedoStack(r=>r.slice(1));
        ctx().putImageData(next,0,0);
    },[redoStack]);

    const clearCanvas=useCallback(()=>{
        pushHistory();
        const c=canvasRef.current;
        const x=ctx();
        x.fillStyle='#ffffff';
        x.fillRect(0,0,c.width,c.height);
    },[pushHistory]);

    const saveImage=useCallback(()=>{
        const a=document.createElement('a');
        a.href=canvasRef.current.toDataURL('image/png');
        a.download=`drawing-${new Date().toISOString().slice(0,10)}.png`;
        a.click();
    },[]);

    const applyStyle=useCallback((c)=>{
        const alpha=opacity/100;
        if(tool==='eraser'){
            c.globalCompositeOperation='destination-out';
            c.strokeStyle='rgba(0,0,0,1)';
            c.lineWidth=strokePx*3;
        }
        else {
            c.globalCompositeOperation='source-over';
            c.strokeStyle=color+Math.round(alpha*255).toString(16).padStart(2,'0');
            c.fillStyle=color+Math.round(alpha*255).toString(16).padStart(2,'0');
            c.lineWidth=strokePx;
        }
        c.lineCap='round';
        c.lineJoin='round';
    },[tool,color,strokePx,opacity]);

    const floodFill=useCallback((sx,sy)=>{
        const c=canvasRef.current;
        const x=ctx();
        const {width,height}=c;
        const imageData=x.getImageData(0,0,width,height);
        const data=imageData.data;
        const ix=Math.round(sx);
        const iy=Math.round(sy);
        if(ix<0 || ix>=width || iy<0 || iy>=height) return;
        const baseIdx=(iy*width+ix)*4;
        const target=[data[baseIdx],data[baseIdx+1],data[baseIdx+2],data[baseIdx+3]];
        const fill=hexToRgba(color);
        if(target.every((v,i)=>v===fill[i])) return;
        const stack=[[ix,iy]];
        const same=(i)=>target.every((v,c)=>data[i*4+c]===v);
        const paint=(i)=>{fill.forEach((v,c)=>{data[i*4+c]=v;});}
        while(stack.length){
            const [px,py]=stack.pop();
            const i=py*width+px;
            if(px<0 || px>=width || py<0 || py>=height || !same(i)) continue;
            paint(i);
            stack.push([px+1,py],[px-1,py],[px,py+1],[px,py-1]);
        }
        x.putImageData(imageData,0,0);
    },[color]);

    const drawShape=useCallback((c,x0,y0,x1,y1)=>{
        c.beginPath();
        switch(tool){
            case 'line':
                c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
                break;
            case 'rect':
                c.rect(x0, y0, x1 - x0, y1 - y0); c.stroke();
                break;
            case 'circle':{
                 const rx = (x1 - x0) / 2, ry = (y1 - y0) / 2;
                 c.ellipse(x0 + rx, y0 + ry, Math.abs(rx), Math.abs(ry), 0, 0, 2 * Math.PI);
                 c.stroke();
                 break;
            }
            case 'triangle':
                c.moveTo((x0+x1)/2,y0);
                c.lineTo(x1,y1);
                c.lineTo(x0,y1);
                c.closePath();
                c.stroke();
                break;
        }
    },[tool]);

    const onPointerDown=useCallback((e)=>{
        e.preventDefault();
        const {x,y}=getPos(e);
        if(tool==='text'){
            setTextPos({x,y});
            setTextVal('');
            setTextActive(true);
            setTimeout(()=>textInputRef.current?.focus(),20);
            return;
        }
        if (tool === 'fill') {
           pushHistory();
           floodFill(x, y);
           return;
        }
       isDown.current=true;
       startPt.current={x,y};
       pushHistory();

       if (['line','rect','circle','triangle'].includes(tool)) {
          snapshotRef.current = snapshot();
      }
      const c=ctx();
      applyStyle(c);
      c.beginPath();
      c.moveTo(x,y);
    },[tool,getPos,pushHistory,floodFill,applyStyle]);

    const onPointerMove=useCallback((e)=>{
        if(e.cancelable) e.preventDefault();
        const {x,y}=getPos(e);
        setPos({x:Math.round(x),y:Math.round(y)});
        if(!isDown.current)return;
        const c=ctx();
        applyStyle(c);

       if (['line','rect','circle','triangle'].includes(tool)) {
      c.putImageData(snapshotRef.current, 0, 0);
      applyStyle(c);
      drawShape(c, startPt.current.x, startPt.current.y, x, y);
      return;
    } 
    c.lineTo(x,y);
    c.stroke();
    c.beginPath();
    c.moveTo(x,y);
    },[getPos,applyStyle,tool,drawShape]);

    const onPointerUp=useCallback(()=>{
        isDown.current=false;
        const c=ctx();
        c.globalCompositeOperation='source-over';
    },[]);

    const commitText=useCallback(()=>{
        if(!textVal.trim()){
            setTextActive(false);
            return;
        }
        pushHistory();
        const c=ctx();
        applyStyle(c);
        c.font=`${Math.max(14,strokePx*5)}px DM Sans, sans-serif`;
        c.globalCompositeOperation='source-over';
        c.fillText(textVal,textPos.x,textPos.y);
        setTextActive(false);
        setTextVal('');
    },[textVal,textPos,strokePx,pushHistory,applyStyle]);

    useEffect(()=>{
        const handler=(e)=>{
            if(e.target.tagName==='INPUT') return;
            if((e.ctrlKey || e.metaKey) && e.key === 'z')
            { 
                e.preventDefault();
                 undo();
            }
            if((e.ctrlKey || e.metaKey) && e.key === 'y')
            { 
                e.preventDefault();
                 redo();
            }
            if((e.ctrlKey || e.metaKey) && e.key === 's')
            { 
                e.preventDefault();
                 saveImage();
            }
        }
        window.addEventListener('keydown',handler);
        return()=>window.removeEventListener('keydown',handler);
    },[undo,redo,saveImage]);

    const strokeDot=(px)=>(
        <svg  width="22" height="22" viewBox="0 0 22 22">
            <circle cx="11" cy="11" r={Math.min(px * 0.8, 9)} fill="var(--t2)" /> 
        </svg>
    )
    return(
        <div className="da-shell">
            <div className="da-titlebar">
                <div className="da-logo"></div>
                <span className="da-title">Paint</span>
                <span className="da-title-meta">
                    {CANVAS_W} × {CANVAS_H}px · {tool.charAt(0).toUpperCase() + tool.slice(1)} · {strokePx}px
                </span>
            </div>
        <div className="da-ribbon">
            <div className="da-section">
                <span className="da-section-label">Tools</span>
                <div className="da-section-row">
                    {TOOLS.map(t=>(
                        <button key={t.key} className={`da-tool-btn${tool===t.key ? 'active' : ''}`} onClick={()=>setTool(t.key)} title={t.label}>
                           <span className="da-tool-icon">{t.icon}</span>
                           <span>{t.label}</span>
                        </button>
                    ))}
                </div>
            </div>
            <div className="da-ribbon-sep" />

            <div className="da-section">
                <span className="da-section-label">Colour</span>
                <div className="da-section-row">
                     <div className="da-swatches">
                        {PALETTE.map(c=>(
                            <span key={c} className={`da-swatch${color===c ? 'active' : ''}`}
                             style={{background:c,outline:c==='#ffffff' ? '1.5px solid':'none',outlineOffset:'-1px',}}
                              onClick={()=>setColor(c)} title={c}
                            />
                        ))}

                        <div className="da-custom-wrap" style={{background:customColor}} title="Custom colour">
                            <input type="color" className="da-custom-input" value={customColor} 
                               onChange={e=> { setCustomColor(e.target.value); setColor(e.target.value);}}/>
                        </div>
                     </div>
                </div>
            </div>
            <div className="da-ribbon-sep" />

            <div className="da-section">
                <span className="da-section-label">Edit</span>
                <div className="da-actions">
                    <button className="da-sm-btn" onClick={undo} disabled={history.length===0} title="Ctrl+Z">
                     {Ic.undo} Undo
                    </button>
                    <button className="da-sm-btn" onClick={redo} disabled={redoStack.length===0} title="Ctrl+Y">
                        {Ic.redo} Redo
                    </button>
                    <button className="da-sm-btn" onClick={saveImage} title="Ctrl+S">
                        {Ic.save} Save PNG
                    </button>
                    <button className="da-sm-btn danger" onClick={clearCanvas}>
                        {Ic.clear} Clear
                    </button>
                </div>
            </div>
        </div>
        <div className="da-workspace">
          <div className="da-canvas-scroll">
             {textActive && (
                <input ref={textInputRef} value={textVal} onChange={e=>setTextVal(e.target.value)}
                onKeyDown={e=>{if (e.key==='Enter') commitText(); if(e.key==='Escape') setTextActive(false);}}
                onBlur={commitText} style={{
                    position:'absolute',left:`calc(20px + ${textPos.x/(CANVAS_W/canvasRef.current?.getBoundingClientRect().width || 1)}px)`,
                    top:`calc(20px + ${textPos.y/(CANVAS_H/canvasRef.current?.getBoundingClientRect().height || 1)}px)`,
                    fontSize:`${Math.max(12,strokePx*4)}px`,fontFamily:'DM Sans, sans-serif',background:'rgba(255,255,255,0.92)',
                    border:'1.5px dashed var(--acc)', borderRadius:'4px',padding:'2px 6px', outline:'none',color:color,zIndex:10,minWidth:60,
                }} placeholder="Type here..."/>
             )}
             <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} className={`da-canvas c-${tool}`} 
                             onMouseDown={onPointerDown} onMouseMove={onPointerMove} onMouseUp={onPointerUp} onMouseLeave={onPointerUp} onTouchStart={onPointerDown} onTouchMove={onPointerMove} onTouchEnd={onPointerUp}
               style={{maxWidth:'100%',maxHeight:'100%'}}/>
          </div>
        </div>

        <div className="da-statusbar">
        <span className="da-status-item">
           Tool:<strong>{TOOLS.find(t=>t.key===tool)?.label}</strong>
        </span>
        <span className="da-status-sep"/>
        <span className="da-status-item">
          Size:<strong>{strokePx}px</strong>
        </span>
        <span className="da-status-sep"/>
        <span className="da-status-item">
          Colour:<strong style={{ color }}>{color}</strong>
        </span>
        <span className="da-status-sep"/>
        <span className="da-status-item">
          Opacity:<strong>{opacity}%</strong>
        </span>
        <span className="da-status-sep" />
        <span className="da-status-item">
           Pos:<strong>{pos.x},{pos.y}</strong>
        </span>
        <span className="da-status-spacer" />
        <span className="da-status-item">
          Undo:<strong>{history.length}</strong>
        </span>
        <span className="da-status-sep" />
        <span className="da-status-item">
          Canvas:<strong>{CANVAS_W} × {CANVAS_H}</strong>
        </span>
        </div>
        </div>
    )
}