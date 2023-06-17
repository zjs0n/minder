import { React, useState} from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import { loginUser } from '../fetcher'
import { useNavigate } from 'react-router-dom';


const Login = ({setloginstate}) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const inputClasses= "p-2 rounded-lg bg-medium-navy box-border border border-medium-navy focus:border-pink focus:outline-none transition duration-100"

//   useEffect(() => {
//     checkLogin().then((res) => {
//       if (res !== '') {
//         navigate('/');
//       }
//     });
//   }, []);
  // const loginUser = async () => {
  //   // post request
  //   loginUser(username, password)
  // }

  const handleSubmit = async e => {
    e.preventDefault()
    e.stopPropagation()
    console.log('login button is pressed')
    await loginUser(username, password)
      .then((result) => {
        if (JSON.stringify(result) === '{"error":"Invalid id or no id specified."}') {
          alert('Did not fill in all inputs!')
          return;
        } else if (JSON.stringify(result) === '{"error":"empty result"}'){
          alert('No such user! Incorrect username or password!')
        } 
        else {
          console.log('signupUser inside', username)
          setloginstate(true);
          navigate('/')
        }
      })
  }
  return (
    <>
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="w-1/4">
          <div>
            <Logo />
          </div>
          <div className="bg-dark-navy p-8 rounded-2xl">
            <h1 className="font-black text-4xl my-8">Sign in</h1>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-rows-2 gap-4">
                <input
                  placeholder="Username"
                  className={`block col-span-1 ${inputClasses}`}
                  onChange={e => setUsername(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Password"
                  className={`block col-span-1 ${inputClasses}`}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              <button className="bg-pink w-full p-2 my-8 rounded-lg hover:bg-medium-navy transition duration-300">
                Sign in
              </button>
            </form>
          </div>
          <div className="my-8 text-center">Don't have an account? <span><Link to="/signup" className="text-pink hover:text-white transition duration-300">Sign up</Link></span></div>
        </div>
      </div>
    </>
  )
}

export default Login
