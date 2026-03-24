import {useState, useRef, useEffect} from 'react';
import dev from '../../assets/dev.png'
const DEV={
    name: 'Ponmani Vasahan',
    role:'Full Stack Developer',
    avatar:null,
    bio: 'I build things for the web. Passionate about developing smooth and clean UI, developer tooling, and making ideas real through code.',

    projects:[
        {
            name:'Gaming',
            desc:'A web based gaming application where you can play multiple games in one place.',
            tech:['Html','CSS','Javascript'],
            link:'https://github.com/ponmanivasahan/Gaming'
        },
        {
           name: 'Travel Page',
           desc:'A simple travel page built when learning Html Css',
           tech:['Html','CSS','JavaScript'],
           link:'https://github.com/ponmanivasahan/travel-page'
        },
    ],

    skills:{
        'Frontend':['React','HTML','CSS','Tailwind','JavaScript','GSAP'],
        'Backend':['Node.js','Express','Java','Spring Boot'],
        'Database':['MYSQL','MongoDB'],
        'Tools':['Git','Figma','Linux','VS Code'],
    },

    contact:{
        email:'vasupks01@gmail.com',
        website:'https://ponmanivasahan.github.io/Portfolio/',
    },
};

const TABS=['About','Projects & Contact','Skills'];

export default function DevInfo({onClose}){
    const [tab,setTab]=useState('About');
  const [pos, setPos]=useState({x:null,y:null});
    const panelRef=useRef(null);
    const isDragging=useRef(false);
  const dragOffset=useRef({x:0,y:0});

  const clampPosition = (x, y, width, height) => {
    const margin = 10;
    const taskbarHeight = 42;
    const maxX = Math.max(margin, window.innerWidth - width - margin);
    const maxY = Math.max(margin, window.innerHeight - taskbarHeight - height - margin);

    return {
      x: Math.min(Math.max(margin, x), maxX),
      y: Math.min(Math.max(margin, y), maxY),
    };
  };
    
    const handleMouseDown=(e)=>{
      if(!e.target.closest('.devinfo-titlebar') || e.button !== 0) return;
      if(!panelRef.current) return;

      const rect = panelRef.current.getBoundingClientRect();
      isDragging.current=true;
      dragOffset.current={x:e.clientX-rect.left,y:e.clientY-rect.top};
      e.preventDefault();
    };

    useEffect(()=>{
      if(!panelRef.current || pos.x !== null) return;

      const rect = panelRef.current.getBoundingClientRect();
      const centered = clampPosition(
        (window.innerWidth - rect.width) / 2,
        (window.innerHeight - 42 - rect.height) / 2,
        rect.width,
        rect.height
      );

      setPos({x: Math.round(centered.x), y: Math.round(centered.y)});
    },[pos.x]);

    useEffect(()=>{
        const handleMouseMove=(e)=>{
        if(!isDragging.current || !panelRef.current) return;

        const rect = panelRef.current.getBoundingClientRect();
        const next = clampPosition(
          e.clientX - dragOffset.current.x,
          e.clientY - dragOffset.current.y,
          rect.width,
          rect.height
        );

        setPos({x: Math.round(next.x), y: Math.round(next.y)});
        };

        const handleMouseUp=()=>{
            isDragging.current=false;
        };

        window.addEventListener('mousemove',handleMouseMove);
        window.addEventListener('mouseup',handleMouseUp);
        return ()=>{
            window.removeEventListener('mousemove',handleMouseMove);
            window.removeEventListener('mouseup',handleMouseUp);
        };
    },[]);

    return(
        <div className='devinfo-overlay' onMouseDown={onClose}>
        <div
          ref={panelRef}
          className='devinfo-panel'
          onMouseDown={(e)=>{handleMouseDown(e);e.stopPropagation();}}
          style={pos.x === null ? {visibility:'hidden'} : {left:`${pos.x}px`, top:`${pos.y}px`}}
        >
                <div className='devinfo-titlebar'>
                    <div className='devinfo-titlebar-icon'>
                        <DevIcon />
                    </div>
                    <span className='devinfo-titlebar-title'>Developer Info</span>
                    <button className='devinfo-close' onClick={onClose}>X</button>
                </div>

                <div className='devinfo-tabs'>
                    {TABS.map((t)=>(
                        <button key={t} className={`devinfo-tab${tab===t ? ' is-active' : ''}`} 
                        onClick={()=>setTab(t)}>{t}</button>
                    ))}
                </div>

                <div className='devinfo-body'>
                    {tab==='About' && <AboutTab />}
                  {tab==='Projects & Contact' && <ProjectsAndContactTab />}
                    {tab==='Skills' && <SkillsTab />}
                </div>
            </div>
        </div>
    )
}

function AboutTab(){
    return (
        <div className='devinfo-about'>
            <div className='devinfo-hero'>
            <div className='devinfo-avatar'>
                <img src={dev} alt="profile" />
            </div>

            <div className='devinfo-hero-text'>
                <div className='devinfo-name'>{DEV.name}</div>
                <div className='devinfo-role'>{DEV.role}</div>
            </div>
        </div>

        <div className='devinfo-divider' />

        <div className='devinfo-section-label'>About</div>
        <p className='devinfo-bio'>{DEV.bio}</p>

        <div className='devinfo-divider' />

        <div className='devinfo-section-label'>Top Skills</div>
        <div className='devinfo-pill-row'>
            {Object.values(DEV.skills).flat().slice(0,8).map((s)=>(
                <span key={s} className='devinfo-pill'>{s}</span>
            ))}
        </div>

        <div className='devinfo-divider' />
        <div className='devinfo-section-label'>Contact</div>
        <div className='devinfo-quick-contact'>
            <a href={`mailto:${DEV.contact.email}`} className='devinfo-link'>
                <MailIcon /> {DEV.contact.email}
            </a>
        </div>
    </div>
    )
}

function ProjectsTab(){
    return (
        <div className='devinfo-projects'>
            {DEV.projects.map((p)=>(
                <div key={p.name} className='devinfo-project-card'>
                  <div className='devinfo-project-header'>
                    <span className='devinfo-project-name'>{p.name}</span>
                    <a href={p.link} target='_blank' rel='noreferrer' className='devinfo-project-link' title='View project'>
                        <ExternalLinkIcon />
                    </a>
                    </div>    
                    <p className='devinfo-project-desc'>{p.desc}</p>
                    <div className='devinfo-pill-row'>
                        {p.tech.map((t)=>(
                            <span key={t} className='devinfo-pill'>{t}</span>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

function SkillsTab(){
    return(
        <div className='devinfo-skills'>
            {Object.entries(DEV.skills).map(([category,items])=>(
                <div key={category} className='devinfo-skill-group'>
                  <div className='devinfo-section-label'>{category}</div>
                  <div className='devinfo-pill-row'>
                    {items.map((skill)=>(
                        <span key={skill} className='devinfo-pill'>{skill}</span>
                    ))}
                  </div>
                </div>
            ))}
        </div>
    )
}


function ContactTab() {
  const links = [
    { label:'Email',href:`mailto:${DEV.contact.email}`,icon: <MailIcon />,value: DEV.contact.email},
    { label:'Website',href:DEV.contact.website,icon: <GlobeIcon />,value: DEV.contact.website},
  ].filter((l) => l.href && !l.href.includes('yourusername') && !l.href.includes('yourwebsite') && !l.href.includes('you@'));
 
  return (
    <div className="devinfo-contact">
      <div className="devinfo-section-label">Get in touch</div>
      <div className="devinfo-contact-list">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target={l.href.startsWith('mailto') ? '_self' : '_blank'}
            rel="noreferrer"
            className="devinfo-contact-row"
          >
            <span className="devinfo-contact-icon">{l.icon}</span>
            <span className="devinfo-contact-label">{l.label}</span>
            <span className="devinfo-contact-value">{l.value}</span>
            <span className="devinfo-contact-arrow">›</span>
          </a>
        ))}
        {links.length === 0 && (
          <div className="devinfo-empty">
            Update the DEV object at the top of DevInfo.jsx with your contact details.
          </div>
        )}
      </div>
    </div>
  );
}
function DevIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <polyline points="2,4 12,13 22,4" />
    </svg>
  );
}
function GithubIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.58 2 12.19c0 4.5 2.87 8.32 6.84 9.67.5.09.68-.22.68-.49v-1.71c-2.78.61-3.37-1.37-3.37-1.37-.45-1.17-1.1-1.48-1.1-1.48-.9-.63.07-.61.07-.61 1 .07 1.52 1.04 1.52 1.04.89 1.55 2.33 1.1 2.9.84.09-.65.35-1.1.63-1.35-2.22-.26-4.56-1.13-4.56-5.02 0-1.11.39-2.01 1.02-2.72-.1-.26-.44-1.29.1-2.68 0 0 .84-.27 2.75 1.04A9.36 9.36 0 0 1 12 6.84c.85 0 1.7.12 2.5.34 1.9-1.31 2.74-1.04 2.74-1.04.54 1.39.2 2.42.1 2.68.63.71 1.02 1.61 1.02 2.72 0 3.9-2.34 4.76-4.57 5.01.36.32.68.94.68 1.9v2.81c0 .27.18.59.69.49A10.2 10.2 0 0 0 22 12.19C22 6.58 17.52 2 12 2z"/>
    </svg>
  );
}
function ExternalLinkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}
function GlobeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function ProjectsAndContactTab(){
  return (
    <>
      <ProjectsTab />
      <div className='devinfo-divider' />
      <ContactTab />
    </>
  )
}