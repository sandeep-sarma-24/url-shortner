import { useState } from 'react';
import './Home.css';
import { FaReddit, FaTumblr, FaFacebook, FaTwitter, FaWhatsapp, FaInstagram, FaPinterest, FaTelegram } from 'react-icons/fa';
import logo from '../assets/logo.png';
import Nav_bar from '../components/ui/Nav-bar';
import CopyToClipboard from 'react-copy-to-clipboard';

const Home = () => {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
  };

  const handleShortenUrl = async () => {
    if (url.trim() === '') {
      // Don't show alert, just return
      return;
    }

    try {

      const response = await fetch('http://52.13.22.149:3000/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          long_url: url,
          expire_at: '2024-06-20T23:45:00Z'
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setShortUrl(data.short_url);
    } catch (error) {
      console.error('Error shortening URL:', error);
    }
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 3000); // Reset copied state after 3 seconds
  };

  return (
    <div>
      <div className='nav-bar'>
        <Nav_bar />
      </div> 
      <div className="App">
        <div className="container">
          <div className='image-container'>
            <img src={logo} alt="Logo" className='logo-image' />
          </div>
          <div className="form-container">
            <input
              type="text"
              className="url-input"
              placeholder="Enter link here"
              value={url}
              onChange={handleUrlChange}
            />
            <div className="buttons">
              <button className="shorten-button" onClick={handleShortenUrl}>Shorten URL</button>
              <button className="stats-button">Check Stats</button>
            </div>
            {shortUrl && (
              <div className="short-url-container">
                <span className="short-url">{shortUrl}</span>
                <CopyToClipboard text={shortUrl} onCopy={handleCopy}>
                  <button className="copy-button">Copy</button>
                </CopyToClipboard>
                {copied && <span className="copied-message">Copied to clipboard!</span>}
              </div>
            )}
          </div>
        </div>

        <div className="social-icons">
          <FaReddit />
          <FaTumblr />
          <FaFacebook />
          <FaTwitter />
          <FaWhatsapp />
          <FaInstagram />
          <FaPinterest />
          <FaTelegram />
        </div>
      </div>
    </div>
  );
};

export default Home;
