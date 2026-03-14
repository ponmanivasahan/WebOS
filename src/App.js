import WelcomeScreen from './components/welcome/Welcome'
import './index.css'
import { OSProvider } from './context/OSContext';


function App(){
  return(
    <OSProvider>
        <WelcomeScreen />
    </OSProvider>
  )
}
export default App