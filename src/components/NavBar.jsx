import React from 'react';
import { Menubar } from 'primereact/menubar';
import { useNavigate } from 'react-router-dom';
import logo from '../asset/logo.svg';

const NavBar = () => {
  const navigate = useNavigate();

  const items = [
    { label: 'Home', icon: 'pi pi-fw pi-home', command: () => navigate('/') },
    { label: 'About', icon: 'pi pi-fw pi-info-circle', command: () => navigate('/about') },
    { label: 'Services', icon: 'pi pi-fw pi-cog', command: () => navigate('/services') },
    { label: 'Contact', icon: 'pi pi-fw pi-envelope', command: () => navigate('/contact') }
  ];

  return (
    <div className="menubar-demo">
      <Menubar model={items} start={<img src={logo} alt="NexusConnect Logo" />} />
    </div>
  );
}

export default NavBar;
