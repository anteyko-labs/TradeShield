import React, { useEffect, useRef, useState } from 'react';

interface TradingViewMarketOverviewProps {
  symbols: Array<{
    proName: string;
    title: string;
  }>;
  showChart?: boolean;
  showSymbolLogo?: boolean;
  colorTheme?: 'light' | 'dark';
  isTransparent?: boolean;
  locale?: string;
  height?: number;
  width?: string;
  className?: string;
}

declare global {
  interface Window {
    TradingView: any;
  }
}

export const TradingViewMarketOverview: React.FC<TradingViewMarketOverviewProps> = ({
  symbols,
  showChart = true,
  showSymbolLogo = true,
  colorTheme = 'dark',
  isTransparent = false,
  locale = 'en',
  height = 400,
  width = '100%',
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
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';
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
            console.warn('Error removing existing market overview widget:', error);
          }
        }

        const config = {
          colorTheme,
          dateRange: '12M',
          showChart,
          locale,
          largeChartUrl: '',
          isTransparent,
          showSymbolLogo,
          showFloatingTooltip: false,
          width,
          height,
          plotLineColorGrowing: 'rgba(33, 150, 243, 1)',
          plotLineColorFalling: 'rgba(33, 150, 243, 1)',
          gridLineColor: 'rgba(240, 243, 250, 0)',
          scaleFontColor: 'rgba(120, 123, 134, 1)',
          belowLineFillColorGrowing: 'rgba(33, 150, 243, 0.12)',
          belowLineFillColorFalling: 'rgba(33, 150, 243, 0.12)',
          belowLineFillColorGrowingBottom: 'rgba(41, 98, 255, 0)',
          belowLineFillColorFallingBottom: 'rgba(41, 98, 255, 0)',
          symbolActiveColor: 'rgba(33, 150, 243, 0.12)',
          container_id: containerRef.current.id,
          tabs: [
            {
              title: 'Crypto',
              symbols: symbols
            }
          ]
        };

        widgetRef.current = new window.TradingView.widget(config);
        
        setTimeout(() => {
          setIsLoading(false);
        }, 1500);

      } catch (err) {
        console.error('Error creating TradingView market overview:', err);
        setError('Failed to load market overview');
        setIsLoading(false);
      }
    };

    createWidget();

    return () => {
      if (widgetRef.current && typeof widgetRef.current.remove === 'function') {
        try {
          widgetRef.current.remove();
        } catch (error) {
          console.warn('Error removing market overview widget:', error);
        }
      }
    };
  }, [symbols, showChart, showSymbolLogo, colorTheme, isTransparent, locale, height, width]);

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-gray rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-primary mx-auto mb-4"></div>
            <p className="text-text-muted">Loading market overview...</p>
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
        id={`tradingview_market_overview_${Date.now()}`}
        ref={containerRef}
        style={{ width, height: `${height}px` }}
        className="rounded-lg overflow-hidden"
      />
    </div>
  );
};
