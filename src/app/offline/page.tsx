export default function OfflinePage() {
    return (
        <html lang="en" className="dark">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>WattFlow — Offline</title>
                <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            background-color: #09090b;
            color: #e5e5e5;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100dvh;
            padding: 2rem;
          }
          .container {
            text-align: center;
            max-width: 400px;
          }
          .icon {
            font-size: 4rem;
            margin-bottom: 1.5rem;
            display: block;
            filter: drop-shadow(0 0 20px rgba(6, 182, 212, 0.5));
          }
          h1 {
            font-size: 1.75rem;
            font-weight: 800;
            background: linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 0.75rem;
          }
          p {
            color: #a1a1aa;
            font-size: 0.95rem;
            line-height: 1.6;
            margin-bottom: 2rem;
          }
          .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            color: white;
            font-weight: 600;
            border-radius: 1rem;
            border: none;
            cursor: pointer;
            font-size: 0.9rem;
            text-decoration: none;
            transition: opacity 0.2s;
          }
          .btn:hover { opacity: 0.85; }
          .status {
            margin-top: 2rem;
            padding: 0.75rem 1.25rem;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 0.75rem;
            font-size: 0.8rem;
            color: #71717a;
          }
        `}</style>
            </head>
            <body>
                <div className="container">
                    <span className="icon">⚡</span>
                    <h1>Sei offline</h1>
                    <p>
                        WattFlow non riesce a connettersi a internet. Le funzionalità principali come il trainer Bluetooth e il tracking dei watt funzionano normalmente — solo il caricamento iniziale richiede una connessione.
                    </p>
                    <a href="/" className="btn">
                        ↩ Torna all&apos;app
                    </a>
                    <div className="status">
                        💡 Se hai già visitato l&apos;app online, ricarica la pagina — potrebbe funzionare comunque dalla cache.
                    </div>
                </div>
                <script dangerouslySetInnerHTML={{
                    __html: `
          // Auto-reload when connection is restored
          window.addEventListener('online', () => {
            window.location.href = '/';
          });
        `}} />
            </body>
        </html>
    );
}
