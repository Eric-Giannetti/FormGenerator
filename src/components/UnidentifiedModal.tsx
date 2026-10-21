import { UnidentifiedImage } from '../types';

interface Props {
  images: UnidentifiedImage[];
  onUpdate: (fileId: string, field: 'publisherName' | 'gameName', value: string) => void;
  onResolve: (fileId: string) => void;
}
export function UnidentifiedModal({ images, onUpdate, onResolve }: Props) {
  if (!images.length) return null;
  return <section className="unidentified" aria-live="assertive">
    <h2>Imagens não identificadas</h2>
    <p>Corrija os nomes abaixo para continuar. Todas as imagens precisam ter editora e jogo.</p>
    {images.map((image) => <article className="unidentifiedRow" key={image.fileId}>
      <img src={`/api/images/${image.fileId}`} loading="lazy" alt="" />
      <div><strong>{image.originalFileName}</strong><div className="fieldRow">
        <input placeholder="Nome da editora" value={image.publisherName ?? ''} onChange={(event) => onUpdate(image.fileId, 'publisherName', event.target.value)} />
        <input placeholder="Nome do jogo" value={image.gameName ?? ''} onChange={(event) => onUpdate(image.fileId, 'gameName', event.target.value)} />
        <button disabled={!image.publisherName?.trim() || !image.gameName?.trim()} onClick={() => onResolve(image.fileId)}>Adicionar</button>
      </div></div>
    </article>)}
  </section>;
}
