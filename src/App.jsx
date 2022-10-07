import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import styled from "styled-components";

const getThumbnails = async () => {
  const config = await window.getConfig();
  const medias = await window.getMedias();
  return medias.map((name) => ({
    path: `file:///${pathJoin(config.libraryPath, "thumbnails", name)}`,
    title: name.substring(0, name.lastIndexOf(".")),
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

const Content = styled.div`
  box-sizing: border-box;
  height: 100%;
  padding: 2rem;
`;
const ThumbnailList = styled.ul`
  display: grid;
  gap: 4px;
  grid-template-columns: repeat(auto-fill, 210px);
  justify-content: space-between;
  padding-inline-start: 0;
`;
const ThumbnailListItem = styled.li`
  list-style-type: none;
  padding: 0;
`;
const Image = styled.img`
  height: 210px;
  object-fit: contain;
  width: 210px;
`;
const Title = styled.div`
  word-break: break-all;
`;

const initialThumbnails = await getThumbnails();

function App() {
  const [thumbnails, setThumbnails] = useState(initialThumbnails);

  const handleDoubleClick = (path) => {
    const filename = path.split("/").pop();
    window.openMedia(filename);
  };
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
    <Content onDragOver={handleDragOver} onDrop={handleDrop}>
      <ThumbnailList>
        {thumbnails.map(({ path, title }) => (
          <ThumbnailListItem
            key={title}
            onDoubleClick={() => handleDoubleClick(path)}
          >
            <Image src={path} />
            <Title>{title}</Title>
          </ThumbnailListItem>
        ))}
      </ThumbnailList>
    </Content>
  );
}

export default App
