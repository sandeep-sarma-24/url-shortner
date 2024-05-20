import { Link } from 'react-router-dom';
import './navbar.css';

const Nav_bar = () => {
    return (
        <nav>
            <div className='left'>
                <Link to="/home">Home</Link>
            </div>
            <div className='right'>
                <Link to="/services">Services</Link>
                <Link to="/about">About Us</Link>
                <Link to="/contact">Contact Us</Link>
            </div>
        </nav>
    );
}

export default Nav_bar;
