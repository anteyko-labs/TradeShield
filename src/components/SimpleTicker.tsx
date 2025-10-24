import React, { useEffect, useRef, useState } from 'react';

interface SimpleTickerProps {
  symbols: string[];
  height?: number;
  className?: string;
}

export const SimpleTicker: React.FC<SimpleTickerProps> = ({
  symbols,
  height = 50,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTradingViewScript = () => {
      return new Promise((resolve, reject) => {
        if (window.TradingView) {
          resolve(window.TradingView);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
        script.async = true;
        script.onload = () => resolve(window.TradingView);
        script.onerror = () => reject(new Error('Failed to load TradingView script'));
        document.head.appendChild(script);
      });
    };

    const createWidget = async () => {
      try {
        setIsLoading(true);
        setError(null);

        await loadTradingViewScript();

        if (!containerRef.current) {
          throw new Error('Container not found');
        }

        const config = {
          symbols: symbols.map(symbol => ({
            proName: symbol,
            title: symbol
          })),
          showSymbolLogo: true,
          colorTheme: 'dark',
          isTransparent: false,
          displayMode: 'adaptive',
          locale: 'en',
          container_id: containerRef.current.id
        };

        // Create script element with proper configuration
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
        script.async = true;
        script.innerHTML = JSON.stringify(config);
        
        // Clear container and append script
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(script);

        // Simple timeout fallback
        setTimeout(() => {
          setIsLoading(false);
        }, 2000);

      } catch (err) {
        console.error('Error creating TradingView ticker:', err);
        setError('Failed to load ticker');
        setIsLoading(false);
      }
    };

    createWidget();
  }, [symbols]);

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-gray rounded-lg z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-primary mx-auto mb-2"></div>
            <p className="text-text-muted text-sm">Loading ticker...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-gray rounded-lg z-10">
          <div className="text-center">
            <div className="text-red-500 mb-2">⚠️</div>
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        </div>
      )}
      
      <div
        id={`simple_ticker_${Date.now()}`}
        ref={containerRef}
        style={{ width: '100%', height: `${height}px` }}
        className="rounded-lg overflow-hidden"
      />
    </div>
  );
};
