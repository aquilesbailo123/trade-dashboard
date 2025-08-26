import { useState, useEffect } from 'react';

export interface MetalTrade {
    id: string;
    metal: 'alloy' | 'copper' | 'cobalt' | 'aluminium' | 'nickel' | 'zinc';
    quantity: number; // in ounces/tons
    estimatedPrice: number; // trading team's estimated price
    riskPrice: number; // risk-adjusted price set by trading team
    actualSalePrice: number; // final sale price
    timestamp: string;
    trader: string;
    client: string;
    status: 'completed' | 'pending' | 'cancelled';
    profitLoss: number; // calculated P&L
    accuracy: number; // how close estimate was to actual (0-1)
    riskAdjustment: number; // difference between estimated and risk price
}

export interface MetalStats {
    totalTrades: number;
    totalProfitLoss: number;
    averageAccuracy: number;
    bestPerformingMetal: string;
    worstPerformingMetal: string;
    totalVolume: number;
}

// Generate dummy metal trading data
const generateMetalTrades = (count: number): MetalTrade[] => {
    const metals: MetalTrade['metal'][] = ['alloy', 'copper', 'cobalt', 'aluminium', 'nickel', 'zinc'];
    const traders = ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Lisa Rodriguez', 'David Kim'];
    const clients = ['Mining Corp A', 'Industrial Ltd', 'Jewelry Inc', 'Tech Solutions', 'Manufacturing Co'];
    
    const trades: MetalTrade[] = [];
    
    for (let i = 0; i < count; i++) {
        const metal = metals[Math.floor(Math.random() * metals.length)];
        const basePrice = getBasePrice(metal);
        const estimatedPrice = basePrice + (Math.random() - 0.5) * basePrice * 0.1; // ±10% variation
        const riskAdjustment = (Math.random() - 0.5) * basePrice * 0.05; // ±5% risk adjustment
        const riskPrice = estimatedPrice + riskAdjustment;
        const actualSalePrice = basePrice + (Math.random() - 0.5) * basePrice * 0.15; // ±15% actual variation
        const quantity = Math.floor(Math.random() * 1000) + 100;
        const profitLoss = (actualSalePrice - riskPrice) * quantity;
        const accuracy = Math.max(0, 1 - Math.abs(estimatedPrice - actualSalePrice) / estimatedPrice);
        
        trades.push({
            id: `MT${String(i + 1).padStart(4, '0')}`,
            metal,
            quantity,
            estimatedPrice,
            riskPrice,
            actualSalePrice,
            timestamp: (() => {
                const now = Date.now();
                const daysBack = Math.floor(Math.random() * 30);
                const pastDate = new Date(now - (daysBack * 24 * 60 * 60 * 1000));
                return pastDate.toISOString();
            })(),
            trader: traders[Math.floor(Math.random() * traders.length)],
            client: clients[Math.floor(Math.random() * clients.length)],
            status: Math.random() > 0.1 ? 'completed' : Math.random() > 0.5 ? 'pending' : 'cancelled',
            profitLoss,
            accuracy,
            riskAdjustment
        });
    }
    
    return trades.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const getBasePrice = (metal: MetalTrade['metal']): number => {
    const basePrices = {
        alloy: 2000,
        copper: 8,
        cobalt: 1950,
        aluminium: 24,
        nickel: 120,
        zinc: 120,
    };
    return basePrices[metal];
};

export const useMetalTrades = () => {
    const [trades, setTrades] = useState<MetalTrade[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Simulate API call
        const fetchTrades = async () => {
            try {
                setIsLoading(true);
                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                const generatedTrades = generateMetalTrades(150);
                setTrades(generatedTrades);
                setError(null);
            } catch (err) {
                setError('Failed to fetch metal trades');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTrades();
    }, []);

    const refetch = () => {
        const generatedTrades = generateMetalTrades(150);
        setTrades(generatedTrades);
    };

    return { trades, isLoading, error, refetch };
};

export const useMetalStats = (trades: MetalTrade[]): MetalStats => {
    const completedTrades = trades.filter(trade => trade.status === 'completed');
    
    const totalProfitLoss = completedTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
    const averageAccuracy = completedTrades.length > 0 
        ? completedTrades.reduce((sum, trade) => sum + trade.accuracy, 0) / completedTrades.length 
        : 0;
    
    // Calculate performance by metal
    const metalPerformance = completedTrades.reduce((acc, trade) => {
        if (!acc[trade.metal]) {
            acc[trade.metal] = { totalPL: 0, count: 0 };
        }
        acc[trade.metal].totalPL += trade.profitLoss;
        acc[trade.metal].count += 1;
        return acc;
    }, {} as Record<string, { totalPL: number; count: number }>);
    
    const metalAvgPL = Object.entries(metalPerformance).map(([metal, data]) => ({
        metal,
        avgPL: data.totalPL / data.count
    }));
    
    const bestPerformingMetal = metalAvgPL.length > 0 
        ? metalAvgPL.reduce((best, current) => current.avgPL > best.avgPL ? current : best).metal
        : 'N/A';
    
    const worstPerformingMetal = metalAvgPL.length > 0 
        ? metalAvgPL.reduce((worst, current) => current.avgPL < worst.avgPL ? current : worst).metal
        : 'N/A';
    
    const totalVolume = completedTrades.reduce((sum, trade) => sum + (trade.quantity * trade.actualSalePrice), 0);

    return {
        totalTrades: completedTrades.length,
        totalProfitLoss,
        averageAccuracy,
        bestPerformingMetal,
        worstPerformingMetal,
        totalVolume
    };
};

export const useMetalPerformanceData = (trades: MetalTrade[]) => {
    const completedTrades = trades.filter(trade => trade.status === 'completed');
    
    // Group trades by metal for performance analysis
    const metalData = completedTrades.reduce((acc, trade) => {
        if (!acc[trade.metal]) {
            acc[trade.metal] = [];
        }
        acc[trade.metal].push(trade);
        return acc;
    }, {} as Record<string, MetalTrade[]>);
    
    return Object.entries(metalData).map(([metal, metalTrades]) => {
        const totalPL = metalTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
        const avgAccuracy = metalTrades.reduce((sum, trade) => sum + trade.accuracy, 0) / metalTrades.length;
        const totalVolume = metalTrades.reduce((sum, trade) => sum + trade.quantity, 0);
        
        return {
            metal,
            totalPL,
            avgAccuracy,
            totalVolume,
            tradeCount: metalTrades.length,
            trades: metalTrades
        };
    });
};
