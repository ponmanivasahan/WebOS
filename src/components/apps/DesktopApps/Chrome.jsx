import { useState,useEffect,useCallback,useRef } from "react";
import "./Chrome.css";
const Icon={
	back:(
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" >
            <polyline points="15 18 9 12 15 6" />
		</svg>
	),
	forward:(
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"   strokeLinecap="round" strokeLinejoin="round" width="16" height="16" >
            <polyline points="9 18 15 12 9 6" />
		</svg>
	),
	refresh:(
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
			<polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
		</svg>
	),
	home:(
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
			<path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
            <polyline points="9 21 9 13 15 13 15 21" />
		</svg>
	),
	star: (filled)=>(
		<svg viewBox="0 0 24 24" fill={filled ? "#f0a500" : "none"} stroke={filled ? "#f0a500" : "currentColor"} strokeWidth="2" width="16" height="16">
             <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
		</svg>
	),
	lock:(
		<svg viewBox="0 0 24 24" fill="none" stroke="#1a73e8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
		   <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
           <path d="M7 11V7a5 5 0 0 1 10 0v4" />
		</svg>
	),
	globe:(
		<svg viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
		   <circle cx="12" cy="12" r="10" />
           <line x1="2" y1="12" x2="22" y2="12" />
           <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
		</svg>
	),
    close:(
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="12" height="12" >
			<line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
		</svg>
	),
	plus:(
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="15" height="15">
			<line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
		</svg>
	),
	menu:(
		<svg viewBox="0 0 24 24"fill="currentColor" width="18" height="18" >
		   <circle cx="12" cy="5" r="1.5" />
           <circle cx="12" cy="12" r="1.5" />
           <circle cx="12" cy="19" r="1.5" />
		</svg>
	),
	tabIcon :(
		<svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
		   <rect x="1" y="3" width="14" height="10" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
           <rect x="1" y="3" width="5" height="3" rx="1" fill="currentColor" opacity="0.4" />
		</svg>
	),
	profile:(
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17" >
		  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
		</svg>
	),
	extension:(
         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="17" height="17">
			<path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
            <line x1="16" y1="8" x2="2" y2="22" />
            <line x1="17.5" y1="15" x2="9" y2="15" />
		 </svg>
	)
}

const DEFAULT_BOOKMARKS=[
	{label:'Google', url:"https://www.google.com", favicon:"https://www.google.com/favicon.ico"},
	{label:"YouTube", url:"https://www.youtube.com",favicon:"https://www.youtube.com/favicon.ico"},
	{label:"GitHub", url:"https://github.com", favicon:"https://github.com/favicon.ico"},
	{label:"Wikipedia",url:"https://en.wikipedia.org",favicon:"https://en.wikipedia.org/favicon.ico"},
	{label:"MDN",url:"https://developer.mozilla.org",favicon:"https://developer.mozilla.org/favicon.ico"},
];

const QUICK_DIAL=[
	{label:"Google",url:"https://google.com",bg:"#fff",color:"#4285f4",letter:"G"},
	{label:"YouTube",url:"https://youtube.com",bg:"#ff0000",color:"#fff",letter:"Y"},
	{label:"GitHub",url:"https://github.com",bg:"#24292e",color:"#fff",letter:"G"},
	{label:"Wikipedia",url:"https://en.wikipedia.org",bg:"#f8f8f8",color:"#333",letter:"W"},
	{label:"Reddit",url:"https://reddit.com",bg:"#ff4500",color:"#fff",letter:"R"},
	{label:"Twitter",url:"https://twitter.com",bg:"#1da1f2",color:"#fff",letter:"T"},
	{label:"MDN",url:"https://developer.mozilla.org",bg:"#1b1b1b",color:"#fff",letter:"M"},
	{label:"Claude",url:"https://claude.ai",bg:"#da7756",color:"#fff",letter:"C"},
];

const SUGGESTIONS=[
	"google.com","github.com","youtube.com","reddit.com","twitter.com",
	"developer.mozilla.org","stackoverflow.com","wikipedia.org",
	"claude.ai","npmjs.com","tailwindcss.com","reactjs.com",
];

let _tabId=1;

const newTab=(url="newtab",title="New Tab")=>({
	id:_tabId++,url,displayUrl:url==="newtab" ? "" :url,title,favicon:null,
	loading:false,canBack:false,canForward:false,history:url==="newtab"?[]:[url],
	histIdx:url==="newtab" ? -1:0, starred:false, frameBlocked:false,
	unsupportedUrl:null,
});

const isSecure=(url)=>url.startsWith("https://") || url==="newtab";

const parseUrl=(raw)=>{
	const t=raw.trim();
	if(!t) return "newtab";
	if(t==="newtab" || t==="chrome://newtab") return "newtab";
	if(/^https?:\/\//i.test(t)) return t;
	if(/^localhost(:\d+)?(\/.*)?$/i.test(t)) return `http://${t}`;
	if(/^\d{1,3}(\.\d{1,3}){3}(:\d+)?(\/.*)?$/.test(t)) return `http://${t}`;
	if(/^[\w-]+(\.\w{2,})+/.test(t)) return "https://"+ t;
	return `https://www.google.com/search?q=${encodeURIComponent(t)}`;
};

const getTitle=(url)=>{
	if(url==="newtab") return "New Tab";
	try{
		return new URL(url).hostname.replace("www.","")
	}
	catch{
		return url;
	}
}

const isProxyFallbackUrl=(url)=>url.startsWith("https://r.jina.ai/http://");

const isWikipediaUrl=(url)=>{
	if(url==="newtab") return true;
	try{
		const {hostname}=new URL(url);
		return hostname==="wikipedia.org" || hostname.endsWith(".wikipedia.org");
	}
	catch{
		return false;
	}
};

const getInAppFallbackUrl=(url)=>{
	if(url==="newtab" || isProxyFallbackUrl(url)) return url;
	const stripped=url.replace(/^https?:\/\//i,"");
	return `https://r.jina.ai/http://${stripped}`;
}

export default function Chrome(){
	const [tabs,setTabs]=useState([newTab()]);
    const [activeId,setActiveId]=useState(tabs[0].id);
	const [addrFocused,setAddrFocused]=useState(false);
	const [addrVal,setAddrVal]=useState("");
	const [suggestions,setSuggestions]=useState([]);
	const [sugIdx,setSugIdx]=useState(-1);
	const [showMenu,setShowMenu]=useState(false);
	const [bookmarks]=useState(DEFAULT_BOOKMARKS);
	const addrRef=useRef(null);
	const active=tabs.find((t)=>t.id===activeId) || tabs[0];

	const updateTab=useCallback((id,patch)=>{
         setTabs((ts)=>ts.map((t)=>(t.id===id ? {...t,...patch} : t)));
	},[]);

	const addTab=(url="newtab")=>{
		const t=newTab(url,getTitle(url));
		setTabs((ts)=>[...ts,t]);
		setActiveId(t.id);
	};

	const closeTab=(id,e)=>{
		e.stopPropagation();
		setTabs((ts)=>{
			const next=ts.filter((t)=>t.id!==id);
			if(next.length===0) return [newTab()];
			return next;
		});
       if(activeId===id){
		const idx=tabs.findIndex((t)=>t.id===id);
		const fallback=tabs[idx+1] || tabs[idx-1];
		if(fallback) setActiveId(fallback.id);
	   }
	};
	 const navigate=(id,rawUrl)=>{
		const url=parseUrl(rawUrl);
		const wikipediaOnly=isWikipediaUrl(url);
		updateTab(id,{
			url:wikipediaOnly ? url : "newtab",
			displayUrl:url==="newtab" ? "" : url,
			title:getTitle(url),loading:wikipediaOnly && url !=="newtab",history:[url],
			histIdx:0,canBack:false,canForward:false,frameBlocked:false,
			unsupportedUrl:wikipediaOnly ? null : url,
		});
	 };

	 const handleGo=()=>{
		setSuggestions([]);
		setAddrFocused(false);
		addrRef.current?.blur();
		navigate(active.id,addrVal);
	 }

	 const handleAddrKey=(e)=>{
		if(e.key==="Enter"){
			handleGo(); return;
		}
		if(e.key==="Escape"){
			setSuggestions([]);
			setAddrFocused(false);
			addrRef.current?.blur();return;
		}
		if(e.key==="ArrowDown"){
			setSugIdx((i)=>Math.min(i+1,suggestions.length-1));
			return;
		}
		if(e.key==="ArrowUp"){
			setSugIdx((i)=>Math.min(i-1,-1));
			return;
		}
		if(e.key==="Tab" && suggestions.length){
			e.preventDefault();
			setAddrVal(suggestions[0]);
			setSuggestions([]);
		}
	 }

	  const handleAddrChange=(v)=>{
		 setAddrVal(v);
		 setSugIdx(-1);
		 if(!v.trim()){setSuggestions([]); return;}
		 const q=v.toLowerCase();
		 setSuggestions(SUGGESTIONS.filter((s)=>s.includes(q)).slice(0,6));
	  }

	  const goBack=()=>{
		const t=active;
		if(t.histIdx>0){
             const idx=t.histIdx-1;
			 updateTab(t.id,{
				histIdx:idx,url:t.history[idx],
				displayUrl:t.history[idx],title:getTitle(t.history[idx]),
				loading:true, canBack:idx>0,canForward:true, frameBlocked:false,
			 });
		}
	  }

	  const goForward=()=>{
		const t=active;
		if(t.histIdx<t.history.length-1){
			const idx=t.histIdx+1;
			updateTab(t.id,{
				histIdx:idx,url:t.history[idx],
				displayUrl:t.history[idx],title:getTitle(t.history[idx]),
				loading:true,
				canBack:true,canForward:idx<t.history.length-1, frameBlocked:false,
			});
		}
	  };
       const goHome=()=>navigate(active.id,"newtab");
	  const reload=()=>{
		if(active.unsupportedUrl) return;
		updateTab(active.id,{loading:true,frameBlocked:false});
	  };

	   useEffect(()=>{
           if(!addrFocused){
			setAddrVal(active.url==="newtab"?"":active.url);
		   }
	   },[active.url,active.id,addrFocused]);

	   const displayAddr=addrFocused ? addrVal :active.url==="newtab" ? "" : active.url;
	return (
		 <div className="chrome-root" onClick={() => { if (showMenu) setShowMenu(false); }}>
		<div className="chrome-tab-bar">
			<div className="chrome-tab-scroll">
				{tabs.map((tab)=>(
					<div key={tab.id} className={`chrome-tab ${tab.id=== activeId ? "active" : "inactive"}`}
					   onClick={()=>setActiveId(tab.id)}
					>
                     {tab.favicon ? <img src={tab.favicon} className="chrome-tab-favicon" alt="" onError={(e)=>{
						e.target.style.display="none";
					 }} /> : <span className="chrome-tab-favicon-fallback">{Icon.tabIcon}</span>}

					 <span className="chrome-tab-title">{tab.title || "New Tab"}</span>
					 <button className="chrome-tab-close" onClick={(e)=>closeTab(tab.id,e)} title="Close tab">
						{Icon.close}
					 </button>
					</div>
				))}

				<button className="chrome-new-tab-btn" onClick={()=>addTab()} title="New tab">{Icon.plus}</button>
			</div>

			<div className="chrome-tab-bar-right">
				<button className="chrome-icon-btn" title="Profile">{Icon.profile}</button>
				<button className="chrome-icon-btn" title="Extensions">{Icon.extension}</button>
			</div>
		</div>

		<div className="chrome-toolbar">
             <button className="chrome-nav-btn" onClick={goBack} disabled={!active.canBack} title="Back">{Icon.back}</button>
			 <button className="chrome-nav-btn" onClick={goForward} disabled={!active.canForward} title="Forward">{Icon.forward}</button>
			 <button className={`chrome-nav-btn${active.loading ? " spinning" : ""}`} onClick={reload} title="Reload">{Icon.refresh}</button>
			 <button className="chrome-nav-btn" onClick={goHome} title="Home">{Icon.home}</button>


			 <div className={`chrome-addr-wrap${addrFocused ? " focused" : ""}`}>
				<span className="chrome-addr-icon">
					{isSecure(active.url) ? Icon.lock : Icon.globe}
				</span>
				<input ref={addrRef} className="chrome-addr-input" value={displayAddr} onChange={(e)=>handleAddrChange(e.target.value)} onFocus={()=>{
					setAddrFocused(true);
					setAddrVal(active.url==="newtab" ? "" :active.url);
					addrRef.current?.select();
				}} onBlur={()=>setTimeout(()=>{setAddrFocused(false); setSuggestions([]);},150)} 
				onKeyDown={handleAddrKey} placeholder="Search Google or type a URL" spellCheck={false}/>
				<button className="chrome-addr-star" onClick={()=>updateTab(active.id,{starred:!active.starred})} title="Bookmark this page">{Icon.star(active.starred)}</button>

				{addrFocused && suggestions.length>0 && (
					<div className="chrome-suggestions">
                       {suggestions.map((s,i)=>(
						<div key={s} className={`chrome-suggestion${i===sugIdx ? " active" : ""}`} onMouseDown={()=>{setAddrVal(s); setSuggestions([]); navigate(active.id,s);}}>
							<span className="chrome-suggestion-icon">{Icon.globe}</span>
							{s}
						</div>
					   ))}
					</div>
				)}
			 </div>
			 <button className="chrome-nav-btn" title="Extensions">{Icon.extension}</button>
			 <div className="chrome-menu-wrap" onClick={(e)=>e.stopPropagation()}>
				<button className="chrome-nav-btn" onClick={()=> setShowMenu((v)=>!v)} title="Chrome menu">
					{Icon.menu}
				</button>

				{showMenu && (
					<div className="chrome-ctx-menu">
					  {[
						["New tab",()=>addTab()],
						["New window", null],
						["─",null],
						["Zoom  –  100%  +",null],
						["─",null],
						["Save page as…",null],
						["Print…",null],
						["Find…",null],
						["─",null],
						["Settings",null],
						["Help",null],
					  ].map(([label,action],i)=>
					 label==="─" ? <div key={i} className="chrome-ctx-divider" />
					    : <button key={i} className="chrome-ctx-item" onClick={()=>{action?.(); setShowMenu(false);}}>{label}</button> 
					  )}	
					</div>
				)}
			 </div>
		</div>

		<div className="chrome-bookmark-bar">
			{bookmarks.map((bm)=>(
				<button key={bm.url} className="chrome-bookmark-item" onClick={()=>navigate(active.id,bm.url)}>
					<img src={bm.favicon} className="chrome-bookmark-favicon" alt="" onError={(e)=>{e.target.style.display="none";}} />
					{bm.label}
				</button>
			))}
			<button className="chrome-bookmark-item manage">Manage bookmarks »</button>
		</div>
         
		 <div className="chrome-content">
             {tabs.map((tab)=>(
				<div key={tab.id} className={`chrome-tab-content${tab.id===activeId ? " visible" : ""}`}>
                   {tab.loading && (
					<div className="chrome-load-bar">
                     <div className="chrome-load-bar-fill" />
					</div>
				   )}

				   {tab.unsupportedUrl ? (
					<div className="chrome-blocked-overlay">
						<UpcomingMessage requestedUrl={tab.unsupportedUrl} onNavigate={(u)=>navigate(tab.id,u)} />
					</div>
				   ) : tab.url==="newtab" ? (
					<NewTabPage onNavigate={(url)=>navigate(tab.id,url)} />
				   ):(
					<>
					<iframe  src={tab.url} className="chrome-iframe" title={tab.title}  onLoad={()=>updateTab(tab.id,{loading:false,frameBlocked:false})} onError={()=>updateTab(tab.id,{loading:false,frameBlocked:true})} 
						sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation" />
						{tab.frameBlocked && (
							<div className="chrome-blocked-overlay">
								<CorsMessage url={tab.url} onNavigate={(u)=>navigate(tab.id,u)} />
							</div>
						)}
					</>
				   )}
				</div>
			 ))}
		 </div>

		</div>
	);
}

function NewTabPage({onNavigate}){
   const [q,setQ]=useState("");
   const handleSubmit=(e)=>{
	e.preventDefault();
	if(q.trim()) onNavigate(q);
   }
   const logoColors=[
	"ntp-logo-g","ntp-logo-o1","ntp-logo-o2",
	"ntp-logo-g2","ntp-logo-1","ntp-logo-e",
   ];

   return(
   <div className="ntp-root">
	   <div className="ntp-inner">
		   <div className="ntp-logo">
			   {"Google".split("").map((char,i)=>(
				   <span key={i} className={logoColors[i]}>{char}</span>
			   ))}
		   </div>

		   <form className="ntp-search-form" onSubmit={handleSubmit}>
			   <div className="ntp-search-shell">
				   <span className="ntp-search-left" aria-hidden="true">
					   <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						   <circle cx="11" cy="11" r="7" />
						   <line x1="16.65" y1="16.65" x2="21" y2="21" />
					   </svg>
				   </span>
				   <input className="ntp-search-input" placeholder="Search Google or type a URL" value={q} onChange={(e)=> setQ(e.target.value)} autoFocus />
				   <div className="ntp-search-right">
					   <button type="button" className="ntp-search-action" title="Voice search" aria-label="Voice search">
						   <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
							   <rect x="9" y="2" width="6" height="12" rx="3" />
							   <path d="M5 10a7 7 0 0 0 14 0" />
							   <line x1="12" y1="17" x2="12" y2="22" />
						   </svg>
					   </button>
					   <button type="button" className="ntp-search-action" title="Search by image" aria-label="Search by image">
						   <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
							   <rect x="4" y="4" width="16" height="16" rx="3" />
							   <circle cx="9" cy="9" r="1.5" />
							   <path d="M20 16l-4.5-4.5L8 19" />
						   </svg>
					   </button>
					   <button type="submit" className="ntp-ai-btn">AI Mode</button>
				   </div>
			   </div>
		   </form>

		   <div className="ntp-grid">
			   {QUICK_DIAL.map((site)=>(
				   <button key={site.url} className="ntp-tile" onClick={()=>onNavigate(site.url)}>
					   <div className="ntp-tile-icon" style={{background:site.bg,color:site.color}}>
						   {site.letter}
					   </div>
					   <span className="ntp-tile-label">{site.label}</span>
				   </button>
			   ))}
		   </div>
	   </div>

	   <div className="ntp-footer">
		   <span>India</span>
		   <div className="ntp-footer-links">
			   {["Advertising","Business","How Search works","Privacy","Terms", "Settings"].map((link)=>(
				   <button key={link} type="button" className="ntp-footer-link" style={{background: 'none', border: 'none', padding: 0, margin: 0, color: '#70757a', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline'}}>{link}</button>
			   ))}
		   </div>
	   </div>
   </div>
   );
}

function CorsMessage({url,onNavigate}){
	return(
		<>
		 <svg viewBox="0 0 64 64" width="64" height="64" style={{ marginBottom: 16 }}>
        <circle cx="32" cy="32" r="30" fill="none" stroke="#dadce0" strokeWidth="3" />
        <text x="32" y="42" textAnchor="middle" fontSize="32" fill="#dadce0">🔒</text>
        </svg>
		<h2>This page can't be displayed in a frame</h2>
		<p>
			<strong>{url}</strong> has blocked embedding for security reasons
			(X-Frame-Options / CSP). This is normal browser security behaviour.
		</p>
		{!isProxyFallbackUrl(url) && (
			<button className="chrome-blocked-btn" onClick={()=>onNavigate(getInAppFallbackUrl(url))}>
			   Open simplified view here
			</button>
		)}
		<button className="chrome-blocked-btn secondary" onClick={()=>onNavigate("newtab")}>
			Back to new tab
		</button>
		</>
	);
}

function UpcomingMessage({requestedUrl,onNavigate}){
	return(
		<>
		 <svg viewBox="0 0 64 64" width="64" height="64" style={{ marginBottom: 16 }}>
			<circle cx="32" cy="32" r="30" fill="none" stroke="#dadce0" strokeWidth="3" />
			<text x="32" y="42" textAnchor="middle" fontSize="32" fill="#8a9096">i</text>
		 </svg>
		 <h2>Coming in next update</h2>
		 <p>
			<strong>{requestedUrl}</strong> is not available yet in this version.
			 For now, Chrome supports Wikipedia only.
		 </p>
		 <button className="chrome-blocked-btn" onClick={()=>onNavigate("https://en.wikipedia.org")}>Open Wikipedia</button>
		 <button className="chrome-blocked-btn secondary" onClick={()=>onNavigate("newtab")}>Back to new tab</button>
		</>
	);
}