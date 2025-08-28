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

// API response interface
interface ApiTradeResponse {
    timestamp: string;
    client: string;
    contract: string;
    price_estimated: number;
    price_executed: number;
    other: Record<string, any>;
}

export interface MetalStats {
    totalTrades: number;
    totalProfitLoss: number;
    averageAccuracy: number;
    bestPerformingMetal: string;
    worstPerformingMetal: string;
    totalVolume: number;
}

// Transform API response to MetalTrade interface
const transformApiResponse = (apiTrades: ApiTradeResponse[]): MetalTrade[] => {
    const traders = ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Lisa Rodriguez', 'David Kim'];
    
    return apiTrades.map((apiTrade, index) => {
        // Map contract names to our metal types
        const contractToMetal: Record<string, MetalTrade['metal']> = {
            'ZINC': 'zinc',
            'COPPER': 'copper',
            'COBALT': 'cobalt',
            'ALUMINIUM': 'aluminium',
            'ALUMINUM': 'aluminium',
            'NICKEL': 'nickel',
            'ALLOY': 'alloy'
        };
        
        const metal = contractToMetal[apiTrade.contract.toUpperCase()] || 'zinc';
        const estimatedPrice = apiTrade.price_estimated;
        const actualSalePrice = apiTrade.price_executed;
        
        // Calculate risk price as midpoint between estimated and executed (simulated)
        const riskPrice = (estimatedPrice + actualSalePrice) / 2;
        const quantity = Math.floor(Math.random() * 1000) + 100; // Simulated quantity
        const profitLoss = (actualSalePrice - riskPrice) * quantity;
        const accuracy = Math.max(0, 1 - Math.abs(estimatedPrice - actualSalePrice) / estimatedPrice);
        const riskAdjustment = riskPrice - estimatedPrice;
        
        return {
            id: `MT${String(index + 1).padStart(4, '0')}`,
            metal,
            quantity,
            estimatedPrice,
            riskPrice,
            actualSalePrice,
            timestamp: apiTrade.timestamp,
            trader: traders[Math.floor(Math.random() * traders.length)],
            client: apiTrade.client,
            status: 'completed' as const, // API data represents completed trades
            profitLoss,
            accuracy,
            riskAdjustment
        };
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// Fetch trades from API
const fetchTradesFromApi = async (): Promise<MetalTrade[]> => {
    const response = await fetch('https://execution-price-analysis.onrender.com/execution-prices');
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const apiTrades: ApiTradeResponse[] = await response.json();
    return transformApiResponse(apiTrades);
};


export const useMetalTrades = () => {
    const [trades, setTrades] = useState<MetalTrade[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTrades = async () => {
            try {
                setIsLoading(true);
                const apiTrades = await fetchTradesFromApi();
                setTrades(apiTrades);
                setError(null);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to fetch metal trades';
                setError(errorMessage);
                console.error('Error fetching trades:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTrades();
    }, []);

    const refetch = async () => {
        try {
            setIsLoading(true);
            const apiTrades = await fetchTradesFromApi();
            setTrades(apiTrades);
            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch metal trades';
            setError(errorMessage);
            console.error('Error refetching trades:', err);
        } finally {
            setIsLoading(false);
        }
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
