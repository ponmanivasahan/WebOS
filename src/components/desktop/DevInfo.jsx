import {useState} from 'react';
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

export default function DevInfo(){
    const [tab,setTab]=useState('About');
    return(
        <div className='devinfo-panel devinfo-panel--app'>
                <div className='devinfo-tabs'>
                    {TABS.map((t)=>(
                        <button key={t} type='button' className={`devinfo-tab${tab===t ? ' is-active' : ''}`} 
                        onClick={()=>setTab(t)}>{t}</button>
                    ))}
                </div>

                <div className='devinfo-body'>
                    {tab==='About' && <AboutTab />}
                  {tab==='Projects & Contact' && <ProjectsAndContactTab />}
                    {tab==='Skills' && <SkillsTab />}
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
function MailIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <polyline points="2,4 12,13 22,4" />
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