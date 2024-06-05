import { useState, useEffect } from 'react';
import Shortener from '../components/Shortener';
import UrlList from '../components/UrlList';
import { TiDeleteOutline } from 'react-icons/ti';
import '../pages/Home.css';

const getLocalStorage = () => {
  if (!localStorage.getItem('links')) return [];
  return JSON.parse(localStorage.getItem('links'));
};

const Main = () => {
  const [links, setLinks] = useState(getLocalStorage);

  useEffect(() => {
    localStorage.setItem('links', JSON.stringify(links));
  }, [links]);

  const addLink = (newItem) => {
    setLinks([...links, newItem]);
  };

  const hideLinks = () => {
    setLinks([]);
  };

  return (
    <main>
      <Shortener addLink={addLink} />
      <UrlList urlList={links} />
      <div className="flex justify-center">
        {links.length > 0 && <TiDeleteOutline className="btn-cross" onClick={hideLinks} />}
      </div>
      <section className="stats pb-11 lg:pb-20">
        <h3 className="title pb-2">Advanced Statistics</h3>
        <p className="subtitle">Track how many clicks your shortened URLs receive and measure their performance.</p>
      </section>
    </main>
  );
};

export default Main;
