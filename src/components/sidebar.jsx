import React, { useState } from 'react';
import { AiOutlineMenu } from 'react-icons/ai';
import { BsKanban, BsInbox, BsPerson, BsBoxArrowInRight, BsBoxArrowInLeft } from 'react-icons/bs';
import { RiDashboardLine, RiProductHuntLine } from 'react-icons/ri';
import { FiUsers } from 'react-icons/fi';
import { FaMapMarkedAlt } from "react-icons/fa";
import { MdSpaceDashboard } from "react-icons/md";
import { GiBrain } from "react-icons/gi";




const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button
        type="button"
        className="inline-flex items-center p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
        onClick={toggleSidebar}
      >
        <span className="sr-only">Open sidebar</span>
        <AiOutlineMenu className="w-6 h-6" />
      </button>

      <aside
        id="logo-sidebar"
        className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } sm:translate-x-0`}
        aria-label="Sidebar"
      >
        <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800">
          <a className="flex items-center ps-2.5 mb-5">
            <img src="https://flowbite.com/docs/images/logo.svg" className="h-6 me-3 sm:h-7" alt="Flowbite Logo" />
            <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Nexus Connect</span>
          </a>
          <ul className="space-y-2 font-medium">
            <li>
              <a href="./" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                <MdSpaceDashboard className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                <span className="ms-3">Dashboard</span>
              </a>
            </li>   
            <li>
              <a href="./map" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                <FaMapMarkedAlt className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                <span className="flex-1 ms-3 whitespace-nowrap">Map</span>
              </a>
            </li>
            <li>
              <a href="./" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                <GiBrain className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                <span className="ms-3">AI Chat</span>
              </a>
            </li>  
          </ul>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
