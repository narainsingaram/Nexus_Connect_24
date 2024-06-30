import React, { useState } from 'react';
import { MdSpaceDashboard } from "react-icons/md";
import { FaMapMarkedAlt } from "react-icons/fa";
import { GiBrain } from "react-icons/gi";
import { useNavigate } from 'react-router-dom';
import { Graph,  } from 'iconsax-react';
const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

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
            <img src="https://is4-ssl.mzstatic.com/image/thumb/Purple122/v4/6a/a6/76/6aa676e0-f3c2-991b-5940-19b90efa3b18/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/512x512bb.jpg" className="h-6 me-3 sm:h-7" alt="Flowbite Logo" />
            <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white ms-3 text-blue-600 hover:text-blue-700 transition-all">Nexus Connect</span>
          </a>
          <ul className="space-y-2 font-medium">
            <li>
              <a href="./" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                <MdSpaceDashboard className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                <span className="ms-3 text-blue-600 hover:text-blue-700 transition-all">Dashboard</span>
              </a>
            </li>
            <li>
              <a href="./graph" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                <Graph variant="Bold" className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                <span className="ms-3 text-blue-600 hover:text-blue-700 transition-all">Graphs</span>
              </a>
            </li>
            <li>
              <a href="./map" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                <FaMapMarkedAlt className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                <span className="ms-3 text-blue-600 hover:text-blue-700 transition-all">Map</span>
              </a>
            </li>
            <li>
              <a href="/ai" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                <GiBrain className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                <span className="ms-3 text-blue-600 hover:text-blue-700 transition-all">AI Chat</span>
              </a>
            </li>
          </ul>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
