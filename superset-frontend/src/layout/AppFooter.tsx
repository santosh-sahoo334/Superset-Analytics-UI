/* eslint-disable */
'use client';

import React from 'react';

import { useContext } from 'react';

import { LayoutContext } from './context/layoutcontext';

const AppFooter = () => {
    const { layoutConfig } = useContext(LayoutContext);

    return (
        <div className="layout-footer">
            <div className="footer-logo-container">
                <img src={`/static/assets/images/layout/images/logo-${layoutConfig.colorScheme === 'light' ? 'dark' : 'white'}.svg`} alt="diamond-layout" />
                <span className="footer-app-name">DIAMOND</span>
            </div>
            <span className="footer-copyright">&#169; Your Organization - 2023</span>
        </div>
    );
};

export default AppFooter;
