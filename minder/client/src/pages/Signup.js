import { React, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { signupUser, checkLogin } from '../fetcher'
import Logo from '../components/Logo'
import { useNavigate } from 'react-router-dom';

const Signup = ({setloginstate}) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [fname, setFname] = useState('')
  const [lname, setLname] = useState('')

  const inputClasses= "p-2 rounded-lg bg-medium-navy box-border border border-medium-navy focus:border-pink focus:outline-none transition duration-100"
  // useEffect(() => {
  //   checkLogin().then((res) => {
  //     if (res !== '') {
  //       console.log('username is', res);
  //       setloginstate(true);
  //       navigate('/');
  //     }
  //   });
  // }, []);

  // const signup = async () => {
  //   await signupUser(username, password, fname, lname)
  // }

  const handleSubmit = async e => {
    e.preventDefault()
    e.stopPropagation()
    console.log('username', username)
    console.log('password', password)
    console.log('fname', fname)
    console.log('lname', lname)
    await signupUser(username, password, fname, lname)
    .then((result) => {
      console.log(JSON.stringify(result));
      if (JSON.stringify(result) === '{"error":"Invalid id or no id specified."}') {
        alert('Did not fill in all inputs!')
        return;
      } else if (JSON.stringify(result) === '{"error":"username has been taken! Please use something else"}') {
        alert('username has been taken! Please use something else')
      }
      else {
      console.log('signupUser inside', username)
      setloginstate(true);
      navigate('/');
      }
    })
    //redirect to home
    // setloginstate(true);
    // navigate('/');

  }

  return (
    <>
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="w-1/3">
          <div>
            <Logo />
          </div>
          <div className="bg-dark-navy p-8 rounded-2xl">
            <h1 className="font-black text-4xl my-8">Sign up</h1>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-rows-3 gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    placeholder="First name"
                    className={`col-span-1 ${inputClasses}`}
                    onChange={e => setFname(e.target.value)}
                  />
                  <input
                    placeholder="Last name"
                    className={`col-span-1 ${inputClasses}`}
                    onChange={e => setLname(e.target.value)}
                  />
                </div>
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
                Create account
              </button>
            </form>
          </div>
          <div className="my-8 text-center">Already have an account? <span><Link to="/login" className="text-pink hover:text-white transition duration-300"> Sign in</Link></span></div>
        </div>
      </div>
    </>
  )
}

export default Signup
