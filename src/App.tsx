import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import styled from "styled-components";

interface Thumbnail {
  isFolder: boolean;
  path: string;
  title: string;
}

const getThumbnails = async (...paths: string[]) => {
  const config = await window.getConfig();
  const medias = await window.getMedias(...paths);
  return medias.map(({ name, isFolder }) => ({
    path: `file:///${pathJoin(
      config.libraryPath,
      "thumbnails",
      ...paths,
      name
    )}`,
    title: isFolder ? name : name.substring(0, name.lastIndexOf(".")),
    isFolder,
  }));
};
const pathJoin = (...paths: string[]) =>
  paths
    .map((path) => {
      const start = path[0] === "/" ? 1 : 0;
      const end = path[path.length - 1] === "/" ? path.length - 1 : path.length;
      return path.slice(start, end);
    })
    .join("/");
const stopEvent = (e: React.DragEvent<HTMLDivElement>) => {
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
  cursor: pointer;
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
  const [paths, setPaths] = useState<string[]>([]);
  const [thumbnails, setThumbnails] = useState(initialThumbnails);

  useEffect(() => {
    (async () => setThumbnails(await getThumbnails(...paths)))();
  }, [paths]);

  const handleDoubleClick = ({ path, isFolder }: Thumbnail) => {
    const filename = path.split("/").pop();
    isFolder
      ? setPaths((prevState) => [...prevState, filename!])
      : window.openMedia(filename!);
  };
  const handleDragOver = stopEvent;
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    stopEvent(e);
    [...e.dataTransfer.files].reduce<Promise<void>>(
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
        {thumbnails.map((thumbnail) => (
          <ThumbnailListItem
            key={thumbnail.title}
            onDoubleClick={() => handleDoubleClick(thumbnail)}
          >
            {thumbnail.isFolder ? (
              <Image src="/folder.svg" />
            ) : (
              <Image src={thumbnail.path} />
            )}
            <Title>{thumbnail.title}</Title>
          </ThumbnailListItem>
        ))}
      </ThumbnailList>
    </Content>
  );
}

export default App
