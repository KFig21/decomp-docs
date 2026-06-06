import './styles.scss';

export default function LoadingScreen() {
  return (
    <div className="loading-screen-wrapper">
      <div className="pokeball"></div>
      <div className="loading-text">Loading save file...</div>
    </div>
  );
}
