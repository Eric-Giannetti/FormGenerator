import { useEffect, useMemo, useState } from 'react';
import { PublisherModal } from './components/PublisherModal';
import { UnidentifiedModal } from './components/UnidentifiedModal';
import { getMonthGames, getMonths } from './services/api';
import { Month, MonthGames, Publisher, UnidentifiedImage } from './types';

type Stage = 'select' | 'edit' | 'confirm';
const normalize = (value: string) => value.trim().replace(/\s+/g, ' ');
const keyFor = (value: string) => normalize(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');

export default function App() {
  const [stage, setStage] = useState<Stage>('select');
  const [months, setMonths] = useState<Month[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [data, setData] = useState<MonthGames | null>(null);
  const [activePublisher, setActivePublisher] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const loadMonths = () => {
    setLoading(true); setError('');
    getMonths().then(setMonths).catch((reason: Error) => setError(reason.message)).finally(() => setLoading(false));
  };
  useEffect(loadMonths, []);
  useEffect(() => {
    if (data) localStorage.setItem(`form-generator:${selectedMonth}`, JSON.stringify(data));
  }, [data, selectedMonth]);

  const chooseMonth = async () => {
    if (!selectedMonth) return;
    setLoading(true); setError('');
    try {
      const cached = localStorage.getItem(`form-generator:${selectedMonth}`);
      const result = cached ? JSON.parse(cached) as MonthGames : await getMonthGames(selectedMonth);
      setData(result); setStage('edit');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Não foi possível ler a pasta.'); }
    finally { setLoading(false); }
  };
  const update = (transform: (value: MonthGames) => MonthGames) => setData((previous) => previous && transform(previous));
  const renamePublisher = (id: string, nextName: string) => {
    const name = normalize(nextName); if (!name) return;
    const existing = data?.publishers.find((publisher) => publisher.id !== id && keyFor(publisher.name) === keyFor(name));
    if (existing && !window.confirm(`Mesclar "${data?.publishers.find((publisher) => publisher.id === id)?.name}" com "${existing.name}"?`)) return;
    update((current) => {
      const currentPublisher = current.publishers.find((publisher) => publisher.id === id);
      if (!currentPublisher) return current;
      if (existing) return { ...current, publishers: current.publishers.filter((publisher) => publisher.id !== id).map((publisher) => publisher.id === existing.id ? { ...publisher, games: [...publisher.games, ...currentPublisher.games] } : publisher) };
      return { ...current, publishers: current.publishers.map((publisher) => publisher.id === id ? { ...publisher, name } : publisher) };
    });
    if (existing) setActivePublisher(existing.id);
  };
  const renameGame = (publisherId: string, fileId: string, value: string) => update((current) => ({
    ...current, publishers: current.publishers.map((publisher) => publisher.id !== publisherId ? publisher : {
      ...publisher, games: publisher.games.map((game) => game.fileId === fileId ? { ...game, gameName: value } : game),
    }),
  }));
  const updateUnidentified = (fileId: string, field: keyof Pick<UnidentifiedImage, 'publisherName' | 'gameName'>, value: string) => update((current) => ({
    ...current, unidentified: current.unidentified.map((image) => image.fileId === fileId ? { ...image, [field]: value } : image),
  }));
  const resolveUnidentified = (fileId: string) => update((current) => {
    const image = current.unidentified.find((item) => item.fileId === fileId);
    if (!image?.publisherName?.trim() || !image.gameName?.trim()) return current;
    const name = normalize(image.publisherName); const id = keyFor(name);
    const game = { fileId: image.fileId, originalFileName: image.originalFileName, thumbnailUrl: image.thumbnailUrl, gameName: normalize(image.gameName) };
    const publisher = current.publishers.find((item) => item.id === id);
    return { ...current, unidentified: current.unidentified.filter((item) => item.fileId !== fileId), publishers: publisher
      ? current.publishers.map((item) => item.id === id ? { ...item, games: [...item.games, game] } : item)
      : [...current.publishers, { id, name, games: [game] }] };
  });
  const visiblePublishers = useMemo(() => (data?.publishers ?? []).filter((publisher) => publisher.name.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'))).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')), [data, query]);
  const currentPublisher: Publisher | undefined = data?.publishers.find((publisher) => publisher.id === activePublisher);
  const gameCount = data?.publishers.reduce((total, publisher) => total + publisher.games.length, 0) ?? 0;

  return <main className="app">
    <header><span className="eyebrow">Google Drive + Google Forms</span><h1>Organizador mensal</h1><p>Revise as capas antes de criar o formulário.</p><a className="login" href="/auth/google">Entrar com Google</a></header>
    {error && <div className="error" role="alert">{error}<button onClick={stage === 'select' ? loadMonths : chooseMonth}>Tentar novamente</button></div>}
    {stage === 'select' && <section className="panel">
      <h2>1. Selecione o mês</h2>
      {loading ? <p>Carregando meses...</p> : <><label>Mês disponível<select value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)}><option value="">Selecione uma pasta</option>{months.map((month) => <option key={month.id} value={month.id}>{month.name}</option>)}</select></label>
        {!months.length && <p>Nenhuma pasta de mês foi encontrada.</p>}<button className="primary" disabled={!selectedMonth} onClick={chooseMonth}>Ler imagens</button></>}
    </section>}
    {stage === 'edit' && data && <><nav className="steps"><b>1. Mês</b><b className="active">2. Revisão</b><b>3. Confirmação</b></nav>
      <section className="toolbar"><div><h2>{data.month}</h2><p>{gameCount} imagens em {data.publishers.length} editoras</p></div><input aria-label="Buscar editora" placeholder="Buscar editora..." value={query} onChange={(event) => setQuery(event.target.value)} /></section>
      <UnidentifiedModal images={data.unidentified} onUpdate={updateUnidentified} onResolve={resolveUnidentified} />
      <section className="grid">{visiblePublishers.map((publisher) => <button className="publisherCard" key={publisher.id} onClick={() => setActivePublisher(publisher.id)}>
        <img src={`/api/images/${publisher.games[0].fileId}`} loading="lazy" alt="" /><span><strong>{publisher.name}</strong><small>{publisher.games.length} {publisher.games.length === 1 ? 'jogo' : 'jogos'}</small></span>
      </button>)}</section>
      {!visiblePublishers.length && <p>Nenhuma editora encontrada.</p>}
      <button className="primary continue" disabled={data.unidentified.length > 0} onClick={() => setStage('confirm')}>Revisar e confirmar</button>
      {currentPublisher && <PublisherModal publisher={currentPublisher} onClose={() => setActivePublisher(null)} onRenamePublisher={(name) => renamePublisher(currentPublisher.id, name)} onRenameGame={(fileId, name) => renameGame(currentPublisher.id, fileId, name)} />}
    </>}
    {stage === 'confirm' && data && <section className="confirmation"><h2>3. Confirmação</h2><p><b>{data.month}</b> · {data.publishers.length} editoras · {gameCount} jogos/imagens</p>
      {data.publishers.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')).map((publisher) => <details key={publisher.id} open><summary>{publisher.name} ({publisher.games.length})</summary><ul>{publisher.games.map((game) => <li key={game.fileId}>{game.gameName}</li>)}</ul></details>)}
      <div className="actions"><button onClick={() => setStage('edit')}>Voltar</button><button className="primary" onClick={() => setSaved(true)}>Confirmar</button></div>
      {saved && <p className="success" role="status">Dados prontos para criação do formulário.</p>}
    </section>}
  </main>;
}
