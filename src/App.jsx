import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'

const getThumbnails = async () => {
  const config = await window.getConfig();
  const medias = await window.getMedias();
  return medias.map((name) => ({
    path: `file:///${pathJoin(config.libraryPath, "thumbnails", name)}`,
    title: name,
  }));
};
const pathJoin = (...paths) =>
  paths
    .map((path) => {
      const start = path[0] === "/" ? 1 : 0;
      const end = path[path.length - 1] === "/" ? path.length - 1 : path.length;
      return path.slice(start, end);
    })
    .join("/");
const stopEvent = (e) => {
  e.preventDefault();
  e.stopPropagation();
};

const thumbnailListStyle = {
  display: "grid",
  gap: "4px",
  gridTemplateColumns: "repeat(auto-fill, 210px)",
  justifyContent: "space-between",
  paddingInlineStart: 0,
};
const thumbnailListItemStyle = {
  listStyleType: "none",
  padding: 0,
};
const imageStyle = {
  height: "210px",
  objectFit: "contain",
  width: "210px",
};
const titleStyle = {
  wordBreak: "break-all",
};

const initialThumbnails = await getThumbnails();

function App() {
  const [thumbnails, setThumbnails] = useState(initialThumbnails);

  const handleDoubleClick = window.openMedia;
  const handleDragOver = stopEvent;
  const handleDrop = (e) => {
    stopEvent(e);
    Array.from(e.dataTransfer.files).reduce(
      (p, f) =>
        p.then(async () => {
          await window.importMedia(f.path);
          setThumbnails(await getThumbnails());
        }),
      Promise.resolve()
    );
  };

  return (
    <ul
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={thumbnailListStyle}
    >
      {thumbnails.map(({ path, title }) => (
        <li
          key={title}
          onDoubleClick={() => handleDoubleClick(title)}
          style={thumbnailListItemStyle}
        >
          <img src={path} style={imageStyle} />
          <div style={titleStyle}>{title}</div>
        </li>
      ))}
    </ul>
  );
}

export default App
