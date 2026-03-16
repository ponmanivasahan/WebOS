import WelcomeScreen from './components/welcome/Welcome'
// import './index.css'
import { OSProvider } from './context/OSContext';
import TaskbarClock from './components/desktop/TaskbarClock';
import DesktopIcon from './components/desktop/DesktopIcon';
import ContextMenu from './components/desktop/ContextMenu';
import Desktop from './components/desktop/Desktop';

function App(){
  return(
    // <OSProvider>
    <>
        <WelcomeScreen />
        <Desktop />
        {/* <DesktopIcon />
        <TaskbarClock /> */}
        {/* <ContextMenu /> */}
        </>
    // </OSProvider>
  )
}
export default App