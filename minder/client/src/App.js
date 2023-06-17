import { React, useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom'
import { createTheme, ThemeProvider } from '@mui/material/styles'

import Browse from './pages/Browse'
import Home from './pages/Home'
import Liked from './pages/Liked'
import Login from './pages/Login'
import Movie from './pages/Movie'
import Signup from './pages/Signup'
import Swipe from './pages/Swipe'

const theme = createTheme({
  palette: {
    secondary: {
      main: '#FFFFFF'
    }
  }
})

function App() {
    const [loginstate, setloginstate] = useState(false);
    return (
        <ThemeProvider theme={theme}>
        <div>
          <Router>
            <div className="h-screen bg-gradient-to-tr from-dark-navy to-light-navy font-nunito text-white overflow-hidden">
              <Routes>
                {loginstate ? <Route path="" element={<Home />} /> : <Route path ="" element={<Navigate to= "login" />} />}
                <Route path="login" element={<Login setloginstate={setloginstate}/>} />
                <Route path="signup" element={<Signup setloginstate={setloginstate}/>} />
                <Route path="liked" element={<Liked />} />
                <Route path="browse" element={<Browse />} />
                <Route path="movie" element={<Movie />} />
                <Route path="swipe" element={<Swipe />} />
              </Routes>
            </div>
          </Router>
        </div>
      </ThemeProvider>
    )
}
export default App;