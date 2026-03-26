import {useState,useEffect,useRef,useCallback} from 'react';
import './Terminal.css';
const BOOT_LINES=[
	' Aurora OS [Version 1.0]',
	'(c)Aurora Corporation. All rights reserved.',
];
const PROMPT='C:\\Users\\Aurora>';

function runCommand(input){
	const cmd=input.trim().toLowerCase();
	const raw=input.trim();
	if(!raw) return[];

	if(cmd==='help'){
		return[
			'',
			'Available commands:',
			'help - Show this help',
			'cls/clear - Clear screen',
			'echo <text> - Print text',
			'dir - List directory',
			'ver - Show version',
			'date - Show current date',
			'time - Show current time',
			'whoami - Show current user',
			'exit -  Close terminal',
			'',
		];
	}

	if(cmd==='cls' || cmd==='clear'){
		return['__CLEAR__'];
	}

	if(cmd.startsWith('echo')){
		return[raw.slice(5)];
	}

	if(cmd==='ver'){
		return ['','Aurora OS [Version 1.0',''];
	}
	if(cmd==='date'){
		return [ new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric', month:'long',day:'numeric'})];
	}
	if(cmd==='time'){
		return [new Date().toLocaleTimeString()];
	}
	if(cmd==='whoami'){
		return ['Aurora'];
	}
	if(cmd==='dir'){
		return [
			'',
			'Directory of C:\\Users\\Aurora',
			'',
			'03/25/2026  10:42 AM  <DIR>.',
            '03/25/2026  10:42 AM  <DIR> ..',
            '03/24/2026  09:15 AM  <DIR> Desktop',
            '03/24/2026  09:15 AM  <DIR> Documents',
            '03/23/2026  09:15 AM  <DIR> Downloads',
            '03/23/2026  09:15 AM  <DIR> Pictures',
            ' 0 File(s) 0 bytes',
            ' 6 Dir(s)  512,000,000,000 bytes free',
            '',
		];
	}
	if(cmd==='exit'){
		return ['__EXIT__'];
	}
	return[`${raw} is not recoginized as an internal or external command,`, 'operable program or batch file.',''];
}

export default function Terminal(){
	const [lines,setLines]=useState([
		{type:'output',text:BOOT_LINES[0]},
		{type:'output',text:BOOT_LINES[1]},
		{type:'output',text:''},
	]);
	const [input,setInput]=useState('');
	const [history,setHistory]=useState([]);
	const [histIdx,setHistIdx]=useState(-1);
	const [closed,setClosed]=useState(false);
	const bottomRef=useRef(null);
	const inputRef=useRef(null);

	useEffect(()=>{
		bottomRef.current?.scrollIntoView({behavior:'smooth'});
	},[lines]);

	const focusInput=()=>inputRef.current?.focus();
    const handleSubmit=useCallback(()=>{
		const result=runCommand(input);
		const newHistory=input.trim() ? [input,...history]:history;
		if(result[0]==='__CLEAR__'){
			setLines([]);
			setInput('');
			setHistory(newHistory);
			setHistIdx(-1);
			return;
		}
		if(result[0]==='__EXIT__'){
			setClosed(true);
			return;
		}

		setLines((prev)=>[
			...prev,{type:'prompt',text:input},
			...result.map((t)=>({type:'output',text:t})),
		]);
		setInput('');
		if(input.trim()){
			setHistory(newHistory);
		}
		setHistIdx(-1);
	},[input,history]);

	const handleKeyDown=(e)=>{
		if(e.key==='Enter'){
			handleSubmit();
		}
		else if(e.key==='ArrowUp'){
			e.preventDefault();
			const idx=Math.min(histIdx+1,history.length-1);
			setHistIdx(idx);
			if(history[idx] !==undefined) setInput(history[idx]);
		}
		else if(e.key==='ArrowDown'){
           e.preventDefault();
		   const idx=Math.max(histIdx-1,-1);
		   setHistIdx(idx);
		   setInput(idx===-1 ? '' : history[idx]);
		}
	}
   if(closed){
	return(
		<div className='term-shell' onClick={focusInput}>
			<div className='term-body' style={{display:'flex',alignItems:'center',justifyContent:'center',
				color:'#444',fontFamily:'Cascadia Code , Consolas, monospace',fontSize:'13px'
			}}>
               Terminal session ended.
			</div>
		</div>
	)
   }

	return (
		<div className="term-shell" onClick={focusInput}>
			<div className="term-body">
				{lines.map((line,i)=>(
					<div key={i} className='term-line'>
						{line.type==='prompt' && (
							<span className='term-prompt'>{PROMPT}</span>
						)}
						<span>{line.text}</span>
					</div>
				))}

				<div className='term-line term-input-line'>
					<span className='term-prompt'>{PROMPT}</span>
					<span className='term-input-display' arial-hidden="true">{input}</span>
					<span className='term-cursor' />
					<input ref={inputRef} className='term-hidden-input' value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={handleKeyDown} autoFocus spellCheck={false} 
					autoComplete='off' autoCorrect='off' autoCapitalize='off'/>
				</div>
				<div ref={bottomRef} />
			</div>
		</div>
	);
}
