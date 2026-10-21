import { Publisher } from '../types';

interface Props {
  publisher: Publisher;
  onClose: () => void;
  onRenamePublisher: (value: string) => void;
  onRenameGame: (fileId: string, value: string) => void;
}
export function PublisherModal({ publisher, onClose, onRenamePublisher, onRenameGame }: Props) {
  return <dialog open className="modal" aria-labelledby="publisher-dialog-title" onCancel={onClose}>
    <div className="modalHeader">
      <label id="publisher-dialog-title">Editora
        <input value={publisher.name} onChange={(event) => onRenamePublisher(event.target.value)} autoFocus />
      </label>
      <button className="iconButton" onClick={onClose} aria-label="Fechar modal">×</button>
    </div>
    <div className="gameList">
      {publisher.games.map((game) => <article className="gameRow" key={game.fileId}>
        <img src={`/api/images/${game.fileId}`} loading="lazy" alt={`Capa de ${game.gameName}`} />
        <div><small>{game.originalFileName}</small><label>Jogo
          <input value={game.gameName} onChange={(event) => onRenameGame(game.fileId, event.target.value)} />
        </label></div>
      </article>)}
    </div>
  </dialog>;
}
