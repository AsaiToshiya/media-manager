import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'

const pathJoin = (...paths) =>
  paths
    .map((path) => {
      const start = path[0] === "/" ? 1 : 0;
      const end = path[path.length - 1] === "/" ? path.length - 1 : path.length;
      return path.slice(start, end);
    })
    .join("/");

const thumbnailListStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "4px",
  justifyContent: "space-between",
};
const thumbnailListItemStyle = {
  listStyleType: "none",
  padding: 0,
  width: "210px",
};
const imageStyle = {
  height: "210px",
  objectFit: "contain",
  width: "210px",
};
const titleStyle = {
  wordBreak: "break-all",
};

const config = await window.getConfig();
const thumbnails = (await window.getMedias()).map((name) => ({
  path: `file:///${pathJoin(config.libraryPath, "thumbnails", name)}`,
  title: name,
}));

function App() {
  const handleDoubleClick = window.openMedia;

  return (
    <ul style={thumbnailListStyle}>
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
