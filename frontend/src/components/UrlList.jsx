
const UrlList = ({ urlList }) => {
  return (
    <ul className="list grid grid-cols-1 gap-5" style={{ marginTop : '30px' ,boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'}}>
      {urlList.map((element, index) => (
        <li className="list-item" key={index} id={index}>
          <div className="links">
            <a href={element.url} className="full-url"> {element.url.slice(0, 100)}</a>
            <a href={element.shortUrl} className="short-url font-medium"> {element.shortUrl}</a>
          </div>
          <button type="button" className="btn-cta btn-copy" onClick={() => navigator.clipboard.writeText(element.shortUrl)}>Copy</button>
        </li>
      ))}
    </ul>
  );
};

export default UrlList;
