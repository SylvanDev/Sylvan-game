import React from 'react';
import { Outlet } from 'react-router-dom';

export const audioPlayer = new Audio('/music/ambient.mp3');
audioPlayer.loop = true;

const Layout: React.FC = () => {
  return (
    <main>
      <Outlet />
    </main>
  );
};

export default Layout;