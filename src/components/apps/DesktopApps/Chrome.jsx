const Icon={
	back:(
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLineJoin="round" width="16" height="16" >
            <polyline points="15 18 9 12 15 6" />
		</svg>
	),
	forward:(
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"   strokeLinecap="round" strokeLineJoin="round" width="16" height="16" >
            <polyline points="9 18 15 12 9 6" />
		</svg>
	),
	refresh:(
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLineJoin="round" width="16" height="16">
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
export default function Chrome(){
	return (
		<div className="mock-app mock-chrome">
			<div className="mock-chrome-toolbar">
				<div className="mock-chrome-dots">
					<span />
					<span />
					<span />
				</div>
				<div className="mock-chrome-address">https://flavortown.local/desktop</div>
			</div>
			<div className="mock-chrome-body">
				<h3>Chrome</h3>
				<p>This runs as an internal window in your WebOS desktop.</p>
			</div>
		</div>
	);
}
