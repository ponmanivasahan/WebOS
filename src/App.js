import WelcomeScreen from './components/welcome/Welcome'
// import './index.css'
import { OSProvider } from './context/OSContext';
import TaskbarClock from './components/desktop/TaskbarClock';
import DesktopIcon from './components/desktop/DesktopIcon';


function App(){
  return(
    // <OSProvider>
    <>
        {/* <WelcomeScreen /> */}
        <DesktopIcon />
        <TaskbarClock />
        </>
    // </OSProvider>
  )
}
export default App