import { React } from 'react'
import { MdHomeFilled, MdOutlineCompareArrows, MdOutlineSearch, MdFavorite } from 'react-icons/md'
import Logo from './Logo'
import NavbarLink from './NavbarLink'
import { logoutUser } from '../fetcher'
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  function logout (){
    logoutUser()
    navigate('/login')
  }
  return (
    <>
      <div className="w-full h-screen bg-dark-navy flex flex-col justify-between px-8">
        <Logo /> 
        <div>
          <ul>
            <NavbarLink path={"/"} name={"Home"} icon={<MdHomeFilled />}/>
            <NavbarLink path={"/browse"} name={"Browse"} icon={<MdOutlineSearch />}/>
            <NavbarLink path={"/swipe"} name={"Swipe"} icon={<MdOutlineCompareArrows />}/>
            <NavbarLink path={"/liked"} name={"Liked"} icon={<MdFavorite />}/>
          </ul>
        </div>
        <div>
          <button className="my-8 transition duration-300 hover:text-pink" onClick={logout}>Log out</button>
        </div>
      </div>
    </>
  )
}

export default Navbar
