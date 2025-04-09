import React from 'react';
import './Header.css';

const Header = ({ onLogout }) => {
    return (
        <header className="header">
            <div className="profile">
                <span>Profile</span>
                <button onClick={onLogout}>Logout</button>
            </div>
        </header>
    );
};

export default Header;
