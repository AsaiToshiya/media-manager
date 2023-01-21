import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import { css } from "@emotion/react";

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

const contentStyle = css`
  box-sizing: border-box;
  height: 100%;
  padding: 2rem;
`;
const thumbnailListStyle = css`
  display: grid;
  gap: 4px;
  grid-template-columns: repeat(auto-fill, 210px);
  justify-content: space-between;
  padding-inline-start: 0;
`;
const thumbnailListItemStyle = css`
  cursor: pointer;
  list-style-type: none;
  padding: 0;
`;
const imageStyle = css`
  height: 210px;
  object-fit: contain;
  width: 210px;
`;
const titleStyle = css`
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
    <div css={contentStyle} onDragOver={handleDragOver} onDrop={handleDrop}>
      <ul css={thumbnailListStyle}>
        {thumbnails.map((thumbnail) => (
          <li
            css={thumbnailListItemStyle}
            key={thumbnail.title}
            onDoubleClick={() => handleDoubleClick(thumbnail)}
          >
            {thumbnail.isFolder ? (
              <img css={imageStyle} src="/folder.svg" />
            ) : (
              <img css={imageStyle} src={thumbnail.path} />
            )}
            <div css={titleStyle}>{thumbnail.title}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App
