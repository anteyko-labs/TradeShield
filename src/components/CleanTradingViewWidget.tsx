import React, { useEffect, useRef, useState } from 'react';

interface CleanTradingViewWidgetProps {
  symbol: string;
  height?: number;
  className?: string;
}

export const CleanTradingViewWidget: React.FC<CleanTradingViewWidgetProps> = ({
  symbol,
  height = 500,
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
        script.src = 'https://s3.tradingview.com/tv.js';
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
          width: '100%',
          height: height,
          symbol: symbol,
          interval: '1',
          timezone: 'Etc/UTC',
          theme: 'dark',
          style: '1',
          locale: 'en',
          toolbar_bg: '#1e1e1e',
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          details: true,
          hotlist: true,
          calendar: true,
          // Only use basic studies that work reliably
          studies: [
            'Volume@tv-basicstudies',
            'RSI@tv-basicstudies',
            'MACD@tv-basicstudies'
          ],
          container_id: containerRef.current.id,
          overrides: {
            'paneProperties.background': '#1e1e1e',
            'paneProperties.vertGridProperties.color': '#2a2a2a',
            'paneProperties.horzGridProperties.color': '#2a2a2a',
            'scalesProperties.textColor': '#d1d4dc',
            'scalesProperties.lineColor': '#2a2a2a'
          }
        };

        new window.TradingView.widget(config);
        
        // Simple timeout fallback
        setTimeout(() => {
          setIsLoading(false);
        }, 3000);

      } catch (err) {
        console.error('Error creating TradingView widget:', err);
        setError('Failed to load TradingView widget');
        setIsLoading(false);
      }
    };

    createWidget();
  }, [symbol, height]);

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-gray rounded-lg z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-primary mx-auto mb-4"></div>
            <p className="text-text-muted">Loading TradingView...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-gray rounded-lg z-10">
          <div className="text-center">
            <div className="text-red-500 mb-2">⚠️</div>
            <p className="text-red-500">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 px-4 py-2 bg-blue-primary text-white rounded hover:bg-blue-primary/80"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      
      <div
        id={`clean_tradingview_${symbol}_${Date.now()}`}
        ref={containerRef}
        style={{ width: '100%', height: `${height}px` }}
        className="rounded-lg overflow-hidden"
      />
    </div>
  );
};
