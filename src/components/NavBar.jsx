import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../asset/logo.svg';

const NavBar = () => {
  const navigate = useNavigate();

  return (
    <nav className="bg-light-blue-600">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <div className="relative flex h-20 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            {/* Mobile menu button */}
            <button
              type="button"
              className="relative inline-flex items-center justify-center rounded-md p-3 text-light-blue-200 hover:bg-light-blue-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="absolute -inset-0.5"></span>
              <span className="sr-only">Open main menu</span>
              {/* Icon when menu is closed */}
              <svg className="block h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
              {/* Icon when menu is open */}
              <svg className="hidden h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex flex-shrink-0 items-center">
              <img className="h-10 w-auto" src={logo} alt="Your Company" />
            </div>
            <div className="hidden sm:ml-8 sm:block">
              <div className="flex space-x-6">
                <a href="/" className="rounded-md bg-light-blue-700 px-4 py-2 text-md font-medium text-white" aria-current="page">Home</a>
                <a href="/about" className="rounded-md px-4 py-2 text-md font-medium text-light-blue-200 hover:bg-light-blue-500 hover:text-white">About</a>
                <a href="/services" className="rounded-md px-4 py-2 text-md font-medium text-light-blue-200 hover:bg-light-blue-500 hover:text-white">Services</a>
                <a href="/contact" className="rounded-md px-4 py-2 text-md font-medium text-light-blue-200 hover:bg-light-blue-500 hover:text-white">Contact</a>
              </div>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 sm:static sm:inset-auto sm:ml-8 sm:pr-0">
            <button
              type="button"
              className="relative rounded-full bg-light-blue-600 p-2 text-light-blue-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-light-blue-600"
            >
              <span className="absolute -inset-1.5"></span>
              <span className="sr-only">View notifications</span>
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </button>
            <div className="relative ml-3">
              <div>
                <button
                  type="button"
                  className="relative flex rounded-full bg-light-blue-600 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-light-blue-600"
                  id="user-menu-button"
                  aria-expanded="false"
                  aria-haspopup="true"
                >
                  <span className="absolute -inset-1.5"></span>
                  <span className="sr-only">Open user menu</span>
                  <img className="h-10 w-10 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="User profile" />
                </button>
              </div>
              <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button" tabIndex="-1">
                <a href="#" className="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabIndex="-1" id="user-menu-item-0">Your Profile</a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabIndex="-1" id="user-menu-item-1">Settings</a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabIndex="-1" id="user-menu-item-2">Sign out</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="sm:hidden" id="mobile-menu">
        <div className="space-y-1 px-4 pb-3 pt-2">
          <a href="/" className="block rounded-md bg-light-blue-700 px-3 py-2 text-base font-medium text-white" aria-current="page">Home</a>
          <a href="/about" className="block rounded-md px-3 py-2 text-base font-medium text-light-blue-200 hover:bg-light-blue-500 hover:text-white">About</a>
          <a href="/services" className="block rounded-md px-3 py-2 text-base font-medium text-light-blue-200 hover:bg-light-blue-500 hover:text-white">Services</a>
          <a href="/contact" className="block rounded-md px-3 py-2 text-base font-medium text-light-blue-200 hover:bg-light-blue-500 hover:text-white">Contact</a>
          <button onClick={() => navigate('/add')} className="block w-full rounded-md bg-light-blue-500 px-3 py-2 text-base font-medium text-white hover:bg-light-blue-600">Add Business</button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
