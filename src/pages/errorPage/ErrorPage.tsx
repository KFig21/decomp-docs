import { useRouteError, useNavigate, isRouteErrorResponse } from 'react-router-dom';
import './styles.scss';

export default function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();

  let title = 'Something went wrong';
  let message = 'An unexpected error occurred.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    message = typeof error.data === 'string' ? error.data : 'This page could not be loaded.';
  } else if (error instanceof Error) {
    message = error.message;
    stack = error.stack;
  } else if (typeof error === 'string') {
    message = error;
  }

  return (
    <div className="error-page">
      <div className="error-page__card">
        <div className="error-page__icon">⚠️</div>
        <h1 className="error-page__title">{title}</h1>
        <p className="error-page__message">{message}</p>

        {stack && (
          <details className="error-page__details">
            <summary>Stack trace</summary>
            <pre className="error-page__stack">{stack}</pre>
          </details>
        )}

        <div className="error-page__actions">
          <button className="error-page__btn error-page__btn--primary" onClick={() => navigate('/')}>
            Go home
          </button>
          <button className="error-page__btn" onClick={() => navigate(-1)}>
            Go back
          </button>
          <button className="error-page__btn" onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      </div>
    </div>
  );
}
