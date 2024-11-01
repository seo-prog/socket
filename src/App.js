import {BrowserRouter, Routes, Route} from 'react-router-dom';
import ChatWindow from './Pages/ChatWindow';
import Main from './Pages/Main';


function App(){
  return (
   <>
   <BrowserRouter>
    <Routes>
      <Route path='/' element={<Main/>}/>
      <Route path='/chatWindow/:userId' element={<ChatWindow/>}/>
    </Routes>
   </BrowserRouter>
   </>
  );
}
export default App;
