import React, { useEffect, useRef, useState } from 'react';

interface TradingViewTickerProps {
  symbols: string[];
  showSymbolLogo?: boolean;
  colorTheme?: 'light' | 'dark';
  isTransparent?: boolean;
  displayMode?: 'compact' | 'adaptive' | 'regular';
  locale?: string;
  height?: number;
  className?: string;
}

declare global {
  interface Window {
    TradingView: any;
  }
}

export const TradingViewTicker: React.FC<TradingViewTickerProps> = ({
  symbols,
  showSymbolLogo = true,
  colorTheme = 'dark',
  isTransparent = false,
  displayMode = 'adaptive',
  locale = 'en',
  height = 60,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
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

        // Clean up existing widget
        if (widgetRef.current && typeof widgetRef.current.remove === 'function') {
          try {
            widgetRef.current.remove();
          } catch (error) {
            console.warn('Error removing existing ticker widget:', error);
          }
        }

        const config = {
          symbols: symbols.map(symbol => ({
            proName: symbol,
            title: symbol
          })),
          showSymbolLogo,
          colorTheme,
          isTransparent,
          displayMode,
          locale,
          container_id: containerRef.current.id
        };

        widgetRef.current = new window.TradingView.widget(config);
        
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);

      } catch (err) {
        console.error('Error creating TradingView ticker:', err);
        setError('Failed to load ticker');
        setIsLoading(false);
      }
    };

    createWidget();

    return () => {
      if (widgetRef.current && typeof widgetRef.current.remove === 'function') {
        try {
          widgetRef.current.remove();
        } catch (error) {
          console.warn('Error removing ticker widget:', error);
        }
      }
    };
  }, [symbols, showSymbolLogo, colorTheme, isTransparent, displayMode, locale]);

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-gray rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-primary mx-auto mb-2"></div>
            <p className="text-text-muted text-sm">Loading ticker...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-gray rounded-lg">
          <div className="text-center">
            <div className="text-red-500 mb-2">⚠️</div>
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        </div>
      )}
      
      <div
        id={`tradingview_ticker_${Date.now()}`}
        ref={containerRef}
        style={{ width: '100%', height: `${height}px` }}
        className="rounded-lg overflow-hidden"
      />
    </div>
  );
};
