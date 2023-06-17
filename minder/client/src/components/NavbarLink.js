import { React } from 'react'
import { NavLink } from 'react-router-dom'

const NavbarLink = ({ name, path, icon }) => {
  return (
    <li className="flex items-center text-xl cursor-pointer my-4">
      <NavLink 
        to={path}
        className={({ isActive }) => (
          isActive ? "text-pink flex items-center hover:text-pink transition duration-300" : "text-white flex items-center hover:text-pink transition duration-300"
        )}
      >
        <span className="mx-2">{icon}</span> {name}
      </NavLink>
    </li>  
  )
}

export default NavbarLink
