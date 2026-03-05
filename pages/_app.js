import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Component {...pageProps} />
    </div>
  );
}