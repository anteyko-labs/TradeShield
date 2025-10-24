import React, { useEffect, useRef, useState } from 'react';
import { createTradingViewConfig } from '../services/tradingViewService';

interface TradingViewWidgetProps {
  symbol: string;
  interval?: string;
  theme?: 'light' | 'dark';
  height?: number;
  width?: number;
  studies?: string[];
  className?: string;
}

declare global {
  interface Window {
    TradingView: any;
  }
}

export const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({
  symbol,
  interval = '1',
  theme = 'dark',
  height = 610,
  width = 980,
  studies = [],
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

        // Clean up existing widget
        if (widgetRef.current) {
          widgetRef.current.remove();
        }

        const config = createTradingViewConfig(symbol, containerRef.current.id, {
          width,
          height,
          interval,
          theme,
          studies: studies.length > 0 ? studies : [
            'Volume@tv-basicstudies',
            'RSI@tv-basicstudies',
            'MACD@tv-basicstudies',
            'MA@tv-basicstudies',
            'EMA@tv-basicstudies',
            'BB@tv-basicstudies',
            'Stochastic@tv-basicstudies',
            'Williams%R@tv-basicstudies',
            'ATR@tv-basicstudies',
            'ADX@tv-basicstudies',
            'CCI@tv-basicstudies'
          ]
        });

        widgetRef.current = new window.TradingView.widget(config);
        
        widgetRef.current.onChartReady(() => {
          setIsLoading(false);
        });

      } catch (err) {
        console.error('Error creating TradingView widget:', err);
        setError('Failed to load TradingView widget');
        setIsLoading(false);
      }
    };

    createWidget();

    return () => {
      if (widgetRef.current) {
        widgetRef.current.remove();
      }
    };
  }, [symbol, interval, theme, height, width, studies]);

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-gray rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-primary mx-auto mb-4"></div>
            <p className="text-text-muted">Loading TradingView...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-gray rounded-lg">
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
        id={`tradingview_${symbol}_${Date.now()}`}
        ref={containerRef}
        style={{ width: '100%', height: `${height}px` }}
        className="rounded-lg overflow-hidden"
      />
    </div>
  );
};
