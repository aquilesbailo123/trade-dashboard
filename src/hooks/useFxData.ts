import { useState, useEffect, useMemo } from 'react';
import { type MetalTrade } from './useMetalTrades';

export interface FxRate {
    date: string;
    rate: number;
    volatility: number;
}

export interface FxDataHook {
    fxRates: FxRate[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

// Generate FX data that correlates with trade patterns
const generateTradeBasedFxData = (days: number, trades?: MetalTrade[]): FxRate[] => {
    const data: FxRate[] = [];
    const baseRate = 1.2; // Base EUR/USD rate
    const today = new Date();
    
    // Create a map of trade activity by date
    const tradesByDate = new Map<string, MetalTrade[]>();
    if (trades) {
        trades.forEach(trade => {
            const date = new Date(trade.timestamp).toISOString().split('T')[0];
            if (!tradesByDate.has(date)) {
                tradesByDate.set(date, []);
            }
            tradesByDate.get(date)!.push(trade);
        });
    }
    
    let previousRate = baseRate;
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        
        const dayTrades = tradesByDate.get(dateString) || [];
        
        // Calculate average price spread for the day
        let avgSpread = 0;
        let spreadVolatility = 0;
        
        if (dayTrades.length > 0) {
            const spreads = dayTrades.map(t => ((t.actualSalePrice - t.riskPrice) / t.riskPrice) * 100);
            avgSpread = spreads.reduce((sum, s) => sum + s, 0) / spreads.length;
            
            // Calculate spread volatility
            const meanSpread = avgSpread;
            const variance = spreads.reduce((sum, s) => sum + Math.pow(s - meanSpread, 2), 0) / spreads.length;
            spreadVolatility = Math.sqrt(variance);
        }
        
        // FX rate influenced by trade spreads with some lag and noise
        const spreadInfluence = avgSpread * 0.001; // Small influence factor
        const momentum = (previousRate - baseRate) * 0.7; // Momentum factor
        const randomWalk = (Math.random() - 0.5) * 0.015; // Random component
        const cyclical = Math.sin(i * 0.1) * 0.02; // Cyclical component
        
        const rate = baseRate + spreadInfluence + momentum + randomWalk + cyclical;
        
        // FX volatility influenced by trade spread volatility
        const baseVolatility = 0.008;
        const spreadVolInfluence = Math.min(spreadVolatility * 0.002, 0.01); // Cap influence
        const volatilityNoise = Math.random() * 0.005;
        const volatility = baseVolatility + spreadVolInfluence + volatilityNoise;
        
        const clampedRate = Math.max(1.0, Math.min(1.4, rate));
        previousRate = clampedRate;
        
        data.push({
            date: dateString,
            rate: clampedRate,
            volatility: Math.max(0.002, Math.min(0.025, volatility))
        });
    }
    
    return data;
};

export const useFxData = (days: number = 90, trades?: MetalTrade[]): FxDataHook => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    
    // Generate FX data based on trade patterns
    const fxRates = useMemo(() => {
        try {
            setError(null);
            return generateTradeBasedFxData(days, trades);
        } catch (err) {
            setError('Failed to generate FX data');
            return [];
        }
    }, [days, trades, refreshKey]);
    
    // Simulate loading delay
    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 100);
        
        return () => clearTimeout(timer);
    }, [refreshKey]);
    
    const refetch = () => {
        setRefreshKey(prev => prev + 1);
    };
    
    return {
        fxRates,
        isLoading,
        error,
        refetch
    };
};

// Helper function to get FX rate for a specific date
export const getFxRateForDate = (fxRates: FxRate[], date: string): FxRate | null => {
    return fxRates.find(fx => fx.date === date) || null;
};

// Helper function to get FX rates within a date range
export const getFxRatesInRange = (fxRates: FxRate[], startDate: string, endDate: string): FxRate[] => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return fxRates.filter(fx => {
        const fxDate = new Date(fx.date);
        return fxDate >= start && fxDate <= end;
    });
};
