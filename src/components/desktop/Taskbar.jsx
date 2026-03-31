import { useEffect, useMemo, useRef, useState } from 'react';
import TaskbarClock from './TaskbarClock';
import DevInfo from './DevInfo';
import windowsIcon from '../../assets/taskbar/windows.svg';
import fileExplorerIcon from '../../assets/taskbar/fileexp.png';
import vscodeIcon from '../../assets/taskbar/vs.png';
import terminalIcon from '../../assets/taskbar/terminal.png';
import chromeIcon from '../../assets/taskbar/chrome.png';
import taskManagerIcon from '../../assets/taskbar/taskmanager.png';
import notesIcon from '../../assets/taskbar/notepad.png';
import drawIcon from '../../assets/draw.png';
import settingsIcon from '../../assets/taskbar/settings.png';
import soundIcon from '../../assets/taskbar/sound.png';
import notificationIcon from '../../assets/taskbar/notification.png';
import batteryIcon from '../../assets/taskbar/battery.png';
import genericAppIcon from '../../assets/taskbar/generic-app.svg';
import devIcon from '../../assets/taskbar/dev.png';
import { useOS } from '../../context/OSContext';

export default function Taskbar({ windows = [], activeWinId, onOpenApp, availableApps = [], onLogout }) {
  const { soundVolume, setSoundVolume, brightness, setBrightness } = useOS();
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isQuickOpen, setIsQuickOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isAppOverflowOpen, setIsAppOverflowOpen] = useState(false);
  const [isTrayOverflowOpen, setIsTrayOverflowOpen] = useState(false);
  const [taskbarContext, setTaskbarContext] = useState(null);
  const [devOpen, setDevOpen] = useState(false);
  const [startQuery, setStartQuery] = useState('');

  const startMenuRef = useRef(null);
  const quickPanelRef = useRef(null);
  const notificationsPanelRef = useRef(null);
  const calendarPanelRef = useRef(null);
  const appOverflowPanelRef = useRef(null);
  const trayOverflowPanelRef = useRef(null);
  const taskbarContextRef = useRef(null);

  const projectApps = useMemo(
    () => availableApps.filter((app) => app.appId && app.appId !== 'file-explorer'),
    [availableApps]
  );

  const MAX_VISIBLE_PINNED = 7;

  const pinnedApps = useMemo(() => {
    const base = [
      { id: 'file-explorer', appId: 'file-explorer', label: 'File Explorer', type: 'internal' },
      { id: 'chrome', appId: 'chrome', label: 'Chrome', type: 'internal' },
      { id: 'vscode', appId: 'vscode', label: 'VS Code', type: 'internal' },
      { id: 'terminal', appId: 'terminal', label: 'Terminal', type: 'internal' },
      { id: 'notes', appId: 'notes', label: 'Notepad', type: 'internal' },
      { id: 'task-manager', appId: 'task-manager', label: 'Task Manager', type: 'internal' },
    ];

    const merged = [
      ...base,
      ...projectApps.map((app) => ({
        id: app.appId,
        appId: app.appId,
        label: app.label,
        type: 'internal',
      })),
    ];

    const seen = new Set();
    return merged.filter((entry) => {
      if (!entry.appId || seen.has(entry.appId)) return false;
      seen.add(entry.appId);
      return true;
    });
  }, [projectApps]);

  const visiblePinnedApps = useMemo(() => pinnedApps.slice(0, MAX_VISIBLE_PINNED), [pinnedApps]);
  const overflowPinnedApps = useMemo(() => pinnedApps.slice(MAX_VISIBLE_PINNED), [pinnedApps]);

  const openAppIds = useMemo(() => new Set(windows.map((win) => win.appId)), [windows]);
  const calendarData = useMemo(() => getCalendarData(new Date()), []);
  const hiddenTrayApps = useMemo(
    () => [
      { id: 'security', label: 'Windows Security', icon: notificationIcon },
      { id: 'sync', label: 'Sync', icon: genericAppIcon },
      { id: 'update', label: 'Update Status', icon: batteryIcon },
    ],
    []
  );

  const startPinnedApps = useMemo(() => {
    const unique = new Map();
    pinnedApps.forEach((entry) => {
      if (entry.type !== 'internal' || !entry.appId) return;
      if (!unique.has(entry.appId)) {
        unique.set(entry.appId, { ...entry, id: entry.appId });
      }
    });
    return Array.from(unique.values());
  }, [pinnedApps]);

  const recommendedApps = useMemo(() => {
    const recent = [...windows].reverse();
    if (recent.length > 0) {
      return recent.slice(0, 3).map((win) => ({ appId: win.appId, label: win.title || win.appId }));
    }
    return [
      { appId: 'file-explorer', label: 'Open File Explorer' },
      { appId: 'task-manager', label: 'Open Task Manager' },
      { appId: 'notes', label: 'Open Notepad' },
    ];
  }, [windows]);

  const startSearchResults = useMemo(() => {
    const q = startQuery.trim().toLowerCase();
    if (!q) return [];

    const merged = [
      ...startPinnedApps.map((app) => ({ appId: app.appId, label: app.label })),
      ...recommendedApps,
    ];

    const byAppId = new Map();
    merged.forEach((app) => {
      if (!app.appId || byAppId.has(app.appId)) return;
      const searchable = `${app.label} ${app.appId}`.toLowerCase();
      if (searchable.includes(q)) {
        byAppId.set(app.appId, app);
      }
    });

    return Array.from(byAppId.values());
  }, [startQuery, startPinnedApps, recommendedApps]);

  useEffect(() => {
    const onWindowDown = (e) => {
      const target = e.target;
      if (isStartOpen && startMenuRef.current && !startMenuRef.current.contains(target)) {
        setIsStartOpen(false);
      }
      if (isCalendarOpen && calendarPanelRef.current && !calendarPanelRef.current.contains(target)) {
        setIsCalendarOpen(false);
      }
      if (isQuickOpen && quickPanelRef.current && !quickPanelRef.current.contains(target)) {
        setIsQuickOpen(false);
      }
      if (isNotificationsOpen && notificationsPanelRef.current && !notificationsPanelRef.current.contains(target)) {
        setIsNotificationsOpen(false);
      }
      if (isAppOverflowOpen && appOverflowPanelRef.current && !appOverflowPanelRef.current.contains(target)) {
        setIsAppOverflowOpen(false);
      }
      if (isTrayOverflowOpen && trayOverflowPanelRef.current && !trayOverflowPanelRef.current.contains(target)) {
        setIsTrayOverflowOpen(false);
      }
      if (taskbarContext && taskbarContextRef.current && !taskbarContextRef.current.contains(target)) {
        setTaskbarContext(null);
      }
    };

    window.addEventListener('mousedown', onWindowDown);
    return () => window.removeEventListener('mousedown', onWindowDown);
  }, [
    isStartOpen,
    isQuickOpen,
    isNotificationsOpen,
    isCalendarOpen,
    isAppOverflowOpen,
    isTrayOverflowOpen,
    taskbarContext,
  ]);

  useEffect(() => {
    if (!isStartOpen) setStartQuery('');
  }, [isStartOpen]);

  const launchApp = (entry) => {
    if (entry.type === 'internal' && entry.appId) {
      onOpenApp?.(entry.appId);
      setIsStartOpen(false);
      setIsQuickOpen(false);
      setIsNotificationsOpen(false);
      setIsCalendarOpen(false);
      setIsAppOverflowOpen(false);
      setIsTrayOverflowOpen(false);
      setTaskbarContext(null);
    }
  };

  const handleLogout = () => {
    setIsStartOpen(false);
    setIsQuickOpen(false);
    setIsNotificationsOpen(false);
    setIsCalendarOpen(false);
    setIsAppOverflowOpen(false);
    setIsTrayOverflowOpen(false);
    setTaskbarContext(null);
    onLogout?.();
  };

  const openTaskbarContextMenu = (e, type, entry) => {
    e.preventDefault();
    const x = Math.max(8, Math.min(e.clientX, window.innerWidth - 236));
    const y = Math.max(8, Math.min(e.clientY, window.innerHeight - 260));
    const commonItems = [
      {
        label: 'Taskbar settings',
        action: () => {
          setIsStartOpen(true);
          setTaskbarContext(null);
        },
      },
    ];

    if (type === 'app' && entry) {
      const isOpen = openAppIds.has(entry.appId);
      setTaskbarContext({
        x,
        y,
        title: entry.label,
        items: [
          { label: isOpen ? 'Open' : 'Launch', action: () => launchApp(entry) },
          { label: 'Pin to Start', action: () => setIsStartOpen(true) },
          { label: 'Run as administrator', disabled: true },
          { separator: true },
          ...commonItems,
        ],
      });
      return;
    }

    if (type === 'start') {
      setTaskbarContext({
        x,
        y,
        title: 'Start',
        items: [
          { label: 'Open Start', action: () => setIsStartOpen(true) },
          { label: 'Installed apps', action: () => setIsStartOpen(true) },
          { label: 'Power', action: handleLogout },
          { separator: true },
          ...commonItems,
        ],
      });
      return;
    }

    if (type === 'clock') {
      setTaskbarContext({
        x,
        y,
        title: 'Date and time',
        items: [
          { label: 'Open calendar', action: () => setIsCalendarOpen(true) },
          { label: 'Adjust date and time', disabled: true },
          { separator: true },
          ...commonItems,
        ],
      });
      return;
    }

    setTaskbarContext({
      x,
      y,
      title: 'System tray',
      items: [
        { label: 'Open quick settings', action: () => setIsQuickOpen(true) },
        { label: 'Open notifications', action: () => setIsNotificationsOpen(true) },
        { separator: true },
        ...commonItems,
      ],
    });
  };

  return (
    <>
      <div className="taskbar">
        <div className="taskbar-center">
          <button
            type="button"
            className={`taskbar-icon-btn taskbar-start-btn${isStartOpen ? ' is-active' : ''}`}
            onClick={() => setIsStartOpen((v) => !v)}
            title="Start"
            aria-label="Open Start Menu"
            aria-expanded={isStartOpen}
            onContextMenu={(e) => openTaskbarContextMenu(e, 'start')}
          >
            <TaskbarIconImage src={windowsIcon} alt="" className="taskbar-icon-img" />
          </button>

          {visiblePinnedApps.map((entry) => {
            const isOpen = entry.appId ? openAppIds.has(entry.appId) : false;
            const isFocused = !!entry.appId && windows.some((win) => win.appId === entry.appId && win.id === activeWinId);
            return (
              <button
                key={entry.id}
                type="button"
                className={`taskbar-icon-btn${isOpen ? ' is-open' : ''}${isFocused ? ' is-focused' : ''}`}
                onClick={() => launchApp(entry)}
                title={entry.label}
                aria-label={entry.label}
                onContextMenu={(e) => openTaskbarContextMenu(e, 'app', entry)}
              >
                <TaskbarAppIcon appId={entry.id} />
              </button>
            );
          })}

          {overflowPinnedApps.length > 0 && (
            <button
              type="button"
              className={`taskbar-icon-btn${isAppOverflowOpen ? ' is-focused' : ''}`}
              title="More apps"
              aria-label="More apps"
              onClick={() => setIsAppOverflowOpen((v) => !v)}
            >
              <span className="taskbar-overflow-dots">...</span>
            </button>
          )}
        </div>

        <div className="taskbar-tray">
          <button
            type="button"
            className={`taskbar-tray-btn${isTrayOverflowOpen ? ' is-active' : ''}`}
            title="Overflow"
            aria-label="Overflow"
            onClick={() => {
              setIsTrayOverflowOpen((v) => !v);
              setIsNotificationsOpen(false);
            }}
            onContextMenu={(e) => openTaskbarContextMenu(e, 'tray')}
          >
            <span className="taskbar-chevron">^</span>
          </button>
          <button
            type="button"
            className={`taskbar-tray-btn${isQuickOpen ? ' is-active' : ''}`}
            title="Settings"
            aria-label="Settings"
            onClick={() => {
              setIsQuickOpen((v) => !v);
              setIsNotificationsOpen(false);
              setIsTrayOverflowOpen(false);
            }}
            onContextMenu={(e) => openTaskbarContextMenu(e, 'tray')}
          >
            <TaskbarIconImage src={settingsIcon} alt="" className="taskbar-tray-img" />
          </button>
          <button
            type="button"
            className={`taskbar-tray-btn${isQuickOpen ? ' is-active' : ''}`}
            title="Sound"
            aria-label="Sound"
            onClick={() => {
              setIsQuickOpen((v) => !v);
              setIsNotificationsOpen(false);
              setIsTrayOverflowOpen(false);
            }}
            onContextMenu={(e) => openTaskbarContextMenu(e, 'tray')}
          >
            <TaskbarIconImage src={soundIcon} alt="" className="taskbar-tray-img" />
          </button>
          <button type="button" className="taskbar-tray-btn taskbar-language" title="Language Preferences" aria-label="Language Preferences">
            <span>ENG</span>
          </button>
          <button
            type="button"
            className={`taskbar-tray-btn${isNotificationsOpen ? ' is-active' : ''}`}
            title="Notifications"
            aria-label="Notifications"
            onClick={() => {
              setIsNotificationsOpen((v) => !v);
              setIsQuickOpen(false);
              setIsTrayOverflowOpen(false);
            }}
            onContextMenu={(e) => openTaskbarContextMenu(e, 'tray')}
          >
            <TaskbarIconImage src={notificationIcon} alt="" className="taskbar-tray-img" />
          </button>
          <button type="button" className="taskbar-tray-btn" title="Battery" aria-label="Battery">
            <TaskbarIconImage src={batteryIcon} alt="" className="taskbar-tray-img" />
          </button>
          <TaskbarClock
            isActive={isCalendarOpen}
            onClick={() => {
              setIsCalendarOpen((v) => !v);
              setIsNotificationsOpen(false);
              setIsQuickOpen(false);
            }}
            onContextMenu={(e) => openTaskbarContextMenu(e, 'clock')}
          />
        </div>
      </div>

      {isAppOverflowOpen && overflowPinnedApps.length > 0 && (
        <div className="taskbar-overflow-panel" ref={appOverflowPanelRef}>
          <div className="tray-panel-title">More apps</div>
          <div className="taskbar-overflow-grid">
            {overflowPinnedApps.map((entry) => (
              <button
                key={entry.id}
                type="button"
                className="taskbar-overflow-app"
                onClick={() => launchApp(entry)}
                onContextMenu={(e) => openTaskbarContextMenu(e, 'app', entry)}
              >
                <TaskbarAppIcon appId={entry.id} />
                <span>{entry.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {isTrayOverflowOpen && (
        <div className="tray-panel tray-overflow-panel" ref={trayOverflowPanelRef}>
          <div className="tray-panel-title">Hidden icons</div>
          <div className="tray-overflow-list">
            {hiddenTrayApps.map((item) => (
              <button key={item.id} type="button" className="tray-overflow-item" onContextMenu={(e) => openTaskbarContextMenu(e, 'tray')}>
                <TaskbarIconImage src={item.icon} alt="" className="taskbar-tray-img" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {isStartOpen && (
        <div className="start-menu" ref={startMenuRef}>
          <div className="start-menu-search-row">
            <input
              className="start-menu-search"
              value={startQuery}
              onChange={(e) => setStartQuery(e.target.value)}
              placeholder="Search for apps, settings, and documents"
              aria-label="Search apps"
            />
          </div>

          <div className="start-menu-content">

          {startQuery.trim() ? (
            <>
              <div className="start-menu-section-head">
                <span>Results</span>
              </div>
              <div className="start-menu-grid">
                {startSearchResults.map((app) => (
                  <button
                    key={`${app.appId}-${app.label}`}
                    type="button"
                    className="start-menu-app"
                    onClick={() => launchApp({ type: 'internal', appId: app.appId })}
                  >
                    <TaskbarAppIcon appId={app.appId} />
                    <span>{app.label}</span>
                  </button>
                ))}
              </div>
              {startSearchResults.length === 0 && (
                <div className="start-menu-no-results">No apps found.</div>
              )}
            </>
          ) : (
            <>
              <div className="start-menu-section-head">
                <span>Pinned</span>
              </div>
              <div className="start-menu-grid">
                {startPinnedApps.map((entry) => (
                  <button key={entry.id} type="button" className="start-menu-app" onClick={() => launchApp(entry)}>
                    <TaskbarAppIcon appId={entry.appId} />
                    <span>{entry.label}</span>
                  </button>
                ))}
              </div>

              <div className="start-menu-section-head start-menu-recommended-head">
                <span>Recommended</span>
              </div>
              <div className="start-menu-recommended">
                {recommendedApps.map((app) => (
                  <button
                    key={`${app.appId}-${app.label}`}
                    type="button"
                    className="start-menu-recommended-item"
                    onClick={() => launchApp({ type: 'internal', appId: app.appId })}
                  >
                    <TaskbarAppIcon appId={app.appId} />
                    <span>{app.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          </div>

          <div className="start-menu-footer">
            <button
              type="button"
              className="start-menu-user"
              onClick={() => {
                setIsStartOpen(false);
                setDevOpen(true);
              }}
            >
              <TaskbarIconImage src={devIcon} alt="" className="taskbar-icon-img start-menu-user-icon" />
              <span>Developer Info</span>
            </button>
            <button
              type="button"
              className="start-menu-power"
              aria-label="Power"
              onClick={handleLogout}
            >
              ⏻
            </button>
          </div>
        </div>
      )}

      {isQuickOpen && (
        <div className="tray-panel" ref={quickPanelRef}>
          <div className="tray-panel-title">Quick settings</div>
          <div className="tray-toggle-grid">
            <button type="button" className="tray-toggle is-on">Wi-Fi</button>
            <button type="button" className="tray-toggle is-on">Bluetooth</button>
            <button type="button" className="tray-toggle">Airplane</button>
            <button type="button" className="tray-toggle is-on">Night light</button>
          </div>
          <div className="tray-slider-row">
            <span>Volume {Math.round(soundVolume)}%</span>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={soundVolume}
              onChange={(e) => setSoundVolume(Number(e.target.value))}
            />
          </div>
          <div className="tray-slider-row">
            <span>Brightness {Math.round(brightness)}%</span>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
            />
          </div>
        </div>
      )}

      {isNotificationsOpen && (
        <div className="tray-panel tray-panel-notifications" ref={notificationsPanelRef}>
          <div className="tray-panel-title">Notifications</div>
          <div className="notification-card">
            <strong>System</strong>
            <span>Your desktop is running in Windows 11 mode.</span>
          </div>
          <div className="notification-card">
            <strong>Taskbar</strong>
            <span>Pinned apps launch as internal windows now.</span>
          </div>
        </div>
      )}

      {isCalendarOpen && (
        <div className="tray-panel tray-panel-calendar" ref={calendarPanelRef}>
          <div className="tray-panel-title">{calendarData.monthLabel}</div>
          <div className="calendar-weekdays">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((name) => (
              <span key={name}>{name}</span>
            ))}
          </div>
          <div className="calendar-grid">
            {calendarData.days.map((dayCell) => (
              <button
                key={dayCell.key}
                type="button"
                className={`calendar-day${dayCell.inMonth ? '' : ' is-muted'}${dayCell.isToday ? ' is-today' : ''}`}
              >
                {dayCell.day}
              </button>
            ))}
          </div>
          <div className="calendar-footer">{calendarData.fullDate}</div>
        </div>
      )}

      {taskbarContext && (
        <div
          className="taskbar-context-menu"
          ref={taskbarContextRef}
          style={{ left: taskbarContext.x, top: taskbarContext.y }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="taskbar-context-title">{taskbarContext.title}</div>
          {taskbarContext.items.map((item, index) => {
            if (item.separator) {
              return <div key={`sep-${index}`} className="taskbar-context-sep" />;
            }
            return (
              <button
                key={`${item.label}-${index}`}
                type="button"
                className="taskbar-context-item"
                disabled={item.disabled}
                onClick={() => {
                  item.action?.();
                  setTaskbarContext(null);
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}

      {devOpen && <DevInfo onClose={() => setDevOpen(false)} />}
    </>
  );
}

function getCalendarData(now) {
  const y = now.getFullYear();
  const m = now.getMonth();
  const firstDay = new Date(y, m, 1).getDay();
  const monthDays = new Date(y, m + 1, 0).getDate();
  const prevMonthDays = new Date(y, m, 0).getDate();

  const days = [];
  for (let i = 0; i < 42; i += 1) {
    const dayOffset = i - firstDay + 1;
    const inMonth = dayOffset >= 1 && dayOffset <= monthDays;
    let dayValue = dayOffset;
    let dateObj;

    if (inMonth) {
      dateObj = new Date(y, m, dayOffset);
    } else if (dayOffset < 1) {
      dayValue = prevMonthDays + dayOffset;
      dateObj = new Date(y, m - 1, dayValue);
    } else {
      dayValue = dayOffset - monthDays;
      dateObj = new Date(y, m + 1, dayValue);
    }

    const isToday =
      dateObj.getDate() === now.getDate() &&
      dateObj.getMonth() === now.getMonth() &&
      dateObj.getFullYear() === now.getFullYear();

    days.push({
      key: `${dateObj.getFullYear()}-${dateObj.getMonth()}-${dayValue}-${i}`,
      day: dayValue,
      inMonth,
      isToday,
    });
  }

  return {
    monthLabel: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    fullDate: now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    days,
  };
}

function TaskbarIconImage({ src, alt, className }) {
  return <img src={src} alt={alt} className={className} aria-hidden="true" draggable="false" />;
}

function TaskbarAppIcon({ appId }) {
  if (appId === 'file-explorer') return <TaskbarIconImage src={fileExplorerIcon} alt="" className="taskbar-icon-img" />;
  if (appId === 'task-manager') return <TaskbarIconImage src={taskManagerIcon} alt="" className="taskbar-icon-img" />;
  if (appId === 'notes') return <TaskbarIconImage src={notesIcon} alt="" className="taskbar-icon-img" />;
  if (appId === 'vscode') return <TaskbarIconImage src={vscodeIcon} alt="" className="taskbar-icon-img" />;
  if (appId === 'terminal') return <TaskbarIconImage src={terminalIcon} alt="" className="taskbar-icon-img" />;
  if (appId === 'chrome') return <TaskbarIconImage src={chromeIcon} alt="" className="taskbar-icon-img" />;
  if (appId === 'draw') return <TaskbarIconImage src={drawIcon} alt="" className="taskbar-icon-img" />;
  return <TaskbarIconImage src={genericAppIcon} alt="" className="taskbar-icon-img" />;
}