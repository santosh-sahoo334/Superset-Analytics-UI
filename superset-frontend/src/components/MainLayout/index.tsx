/* eslint-disable */
import React from 'react';
import Layout from 'src/layout/layout';

interface MainLayoutProps {
    children: React.ReactNode;
}

export const viewport = "width=device-width, initial-scale=1";

function MainLayout({ children }: MainLayoutProps) {
    return (
      <>
      <Layout>
      {children}
      </Layout>
        
      </>
    );
  }
  
  export default MainLayout;