
//import env from 'react-dotenv';
import LoginPage from './pages/loginPage.jsx'
import TutorPage from './pages/tutorPage.jsx'
import LearnerPage from './pages/learnerPage.jsx'

function App() {
  return (
    <div className="">
       <div className="w-50 m-auto mt-5">
          {/* <LoginPage/> */}
       </div>
       <div className="w-100 container m-auto mt-5">
          {/* <LoginPage/> */}
          <TutorPage/>
       </div>
      
    </div>
  );
}

export default App;
