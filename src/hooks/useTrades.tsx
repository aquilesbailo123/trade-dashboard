import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";

export type ContractType = "WTI" | "BRENT" | "NATURAL_GAS" | "COBALT" | "ALUMINIUM";

export type Trade = {
  id: number;
  contract_type: ContractType;
  contract_month: string;
  price: number;
  client: string;
  sales_person: string;
  date_of_execution: string;
  pnl: number;
  anomaly_score?: number;
  is_anomaly?: boolean;
  is_validated: boolean;
  validated_classification?: boolean;
};

export type TradesResponse = {
  count: number;
  trades: Trade[];
};

export type ValidationRequest = {
  record_index: number;
  is_anomaly: boolean;
};

export type StatsResponse = {
  total_trades: number;
  validated_trades: number;
  detected_anomalies: number;
  anomaly_rate: number;
};

// Get API base URL from envnickelment variable, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

/**
 * Fetches recent trades from the backend API.
 * 
 * Backend Endpoint: GET /trades/recent?seconds={seconds}
 * 
 * This endpoint retrieves all trades that were executed within the specified time window.
 * The backend continuously generates new trades every 5 seconds with ~8% being anomalous.
 * Each trade includes anomaly detection results from the Isolation Forest ML model.
 * 
 * @param seconds - Time window in seconds to look back for trades (default: 60)
 * @returns Promise<TradesResponse> - Object containing count and array of trades
 * 
 * Response Format:
 * {
 *   "count": 15,
 *   "trades": [
 *     {
 *       "id": 123,
 *       "contract_type": "WTI",
 *       "contract_month": "January/25",
 *       "price": 65.50,
 *       "client": "Nova Trading",
 *       "sales_person": "0061",
 *       "date_of_execution": "2025-08-18T18:26:55.123456",
 *       "pnl": 1250.75,
 *       "anomaly_score": -0.15,
 *       "is_anomaly": false,
 *       "is_validated": false,
 *       "validated_classification": null
 *     }
 *   ]
 * }
 * 
 * Error Responses:
 * - 400: Invalid seconds parameter (must be positive)
 * - 500: Internal server error
 */
async function fetchRecentTrades(seconds: number = 60): Promise<TradesResponse> {
  const response = await fetch(`${API_BASE_URL}/trades/recent?seconds=${seconds}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch trades: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Validates a trade's anomaly classification through human feedback.
 * 
 * Backend Endpoint: POST /trades/validate
 * 
 * This endpoint allows human analysts to provide feedback on whether a trade
 * is actually anomalous or not. The system uses this feedback to improve
 * future anomaly detection through adaptive learning. The ML model adjusts
 * its sensitivity based on validation history for specific client/contract combinations.
 * 
 * @param validation - Object containing record index and anomaly classification
 * @returns Promise with validation result and updated trade
 * 
 * Request Body Format:
 * {
 *   "record_index": 42,     // Index of trade in the trades array (0-based)
 *   "is_anomaly": true      // Human classification: true = anomaly, false = normal
 * }
 * 
 * Response Format:
 * {
 *   "message": "Trade validated successfully",
 *   "trade": {
 *     // Updated trade object with is_validated=true and validated_classification set
 *   }
 * }
 * 
 * Error Responses:
 * - 404: Invalid record_index (trade not found)
 * - 400: Invalid request body format
 * - 500: Internal server error
 * 
 * Side Effects:
 * - Updates the trade's is_validated and validated_classification fields
 * - Adjusts ML model's feedback weights for future predictions
 * - Reduces false positives for validated normal trades
 * - Increases sensitivity for confirmed anomalies
 */
async function validateTrade(validation: ValidationRequest): Promise<{ message: string; trade: Trade }> {
  const response = await fetch(`${API_BASE_URL}/trades/validate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(validation),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to validate trade: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetches system-wide statistics and metrics.
 * 
 * Backend Endpoint: GET /stats
 * 
 * This endpoint provides real-time analytics about the anomaly detection system's
 * performance, including total trade volume, detection rates, and validation coverage.
 * Useful for monitoring system health and analyst productivity.
 * 
 * @returns Promise<StatsResponse> - Object containing system statistics
 * 
 * Response Format:
 * {
 *   "total_trades": 1247,           // Total number of trades in the system
 *   "validated_trades": 89,         // Number of trades that have been human-validated
 *   "detected_anomalies": 63,       // Number of trades flagged as anomalous by ML
 *   "anomaly_rate": 0.0505          // Percentage of trades flagged (0.0505 = 5.05%)
 * }
 * 
 * Key Metrics:
 * - total_trades: Includes all trades since last system reset (max 5000)
 * - validated_trades: Subset that received human review
 * - detected_anomalies: Current ML model predictions (may change after validation)
 * - anomaly_rate: Real-time detection rate (target ~5% based on contamination setting)
 * 
 * Error Responses:
 * - 500: Internal server error
 */
async function fetchStats(): Promise<StatsResponse> {
  const response = await fetch(`${API_BASE_URL}/stats`);
  if (!response.ok) {
    throw new Error(`Failed to fetch stats: ${response.statusText}`);
  }
  return response.json();
}

/**
 * React Query hook for fetching recent trades with real-time updates.
 * 
 * This hook automatically refetches trade data every 5 seconds to provide
 * real-time monitoring of new trades and anomaly detections. Perfect for
 * dashboard components that need live data updates.
 * 
 * @param seconds - Time window in seconds to look back for trades (default: 60)
 * @returns React Query result with trades data, loading states, and error handling
 * 
 * Usage Example:
 * ```tsx
 * function TradesDashboard() {
 *   const { data, isLoading, error, refetch } = useTrades(300); // Last 5 minutes
 *   
 *   if (isLoading) return <div>Loading trades...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   
 *   return (
 *     <div>
 *       <h2>Recent Trades ({data?.count})</h2>
 *       {data?.trades.map(trade => (
 *         <TradeCard key={trade.id} trade={trade} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 * 
 * Returned Data Structure:
 * - data.count: Total number of trades in time window
 * - data.trades: Array of Trade objects with anomaly scores
 * - isLoading: Boolean indicating initial load state
 * - error: Error object if request fails
 * - refetch: Function to manually trigger data refresh
 */
export function useTrades(seconds: number = 60) {
  return useQuery({
    queryKey: ["trades", seconds],
    queryFn: () => fetchRecentTrades(seconds),
    refetchInterval: 5000, // Refetch every 5 seconds to get new trades
    staleTime: 1000, // Consider data stale after 1 second
  });
}

/**
 * React Query mutation hook for validating trade anomaly classifications.
 * 
 * This hook provides a mutation function to submit human feedback on whether
 * a trade is actually anomalous. The system learns from this feedback to
 * improve future anomaly detection accuracy. Automatically invalidates and
 * refetches related data after successful validation.
 * 
 * @returns React Query mutation result with validation function and states
 * 
 * Usage Example:
 * ```tsx
 * function TradeValidationButton({ trade, tradeIndex }) {
 *   const validation = useTradeValidation();
 *   
 *   const handleValidate = (isAnomaly: boolean) => {
 *     validation.mutate({
 *       record_index: tradeIndex,
 *       is_anomaly: isAnomaly
 *     });
 *   };
 *   
 *   return (
 *     <div>
 *       <button 
 *         onClick={() => handleValidate(true)}
 *         disabled={validation.isPending}
 *       >
 *         Mark as Anomaly
 *       </button>
 *       <button 
 *         onClick={() => handleValidate(false)}
 *         disabled={validation.isPending}
 *       >
 *         Mark as Normal
 *       </button>
 *       {validation.error && <p>Error: {validation.error.message}</p>}
 *     </div>
 *   );
 * }
 * ```
 * 
 * Mutation Function Parameters:
 * - record_index: Index of trade in the current trades array (0-based)
 * - is_anomaly: Boolean classification (true = anomaly, false = normal)
 * 
 * Side Effects:
 * - Automatically refetches trades and stats data after successful validation
 * - Updates ML model's learning weights for improved future predictions
 * - Marks trade as validated in the system
 */
export function useTradeValidation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: validateTrade,
    onSuccess: () => {
      // Invalidate and refetch trades data after successful validation
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

/**
 * React Query hook for fetching system-wide anomaly detection statistics.
 * 
 * This hook provides real-time metrics about the anomaly detection system's
 * performance, including detection rates, validation coverage, and system health.
 * Automatically updates every 10 seconds for monitoring dashboards.
 * 
 * @returns React Query result with system statistics and loading states
 * 
 * Usage Example:
 * ```tsx
 * function SystemStatsWidget() {
 *   const { data: stats, isLoading } = useStats();
 *   
 *   if (isLoading) return <div>Loading stats...</div>;
 *   
 *   return (
 *     <div className="stats-grid">
 *       <div className="stat-card">
 *         <h3>Total Trades</h3>
 *         <p>{stats?.total_trades}</p>
 *       </div>
 *       <div className="stat-card">
 *         <h3>Anomaly Rate</h3>
 *         <p>{(stats?.anomaly_rate * 100).toFixed(1)}%</p>
 *       </div>
 *       <div className="stat-card">
 *         <h3>Validation Coverage</h3>
 *         <p>{((stats?.validated_trades / stats?.total_trades) * 100).toFixed(1)}%</p>
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 * 
 * Returned Statistics:
 * - total_trades: Total number of trades in system (max 5000, then resets)
 * - validated_trades: Number of trades that received human validation
 * - detected_anomalies: Current count of ML-flagged anomalous trades
 * - anomaly_rate: Percentage of trades flagged as anomalous (0.0-1.0)
 */
export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
    refetchInterval: 10000, // Refetch every 10 seconds
    staleTime: 5000,
  });
}

// Custom hook for managing trade filters and sorting
export function useTradeFilters() {
  const [filters, setFilters] = useState({
    contractType: "" as ContractType | "",
    client: "",
    showAnomaliesOnly: false,
    showUnvalidatedOnly: false,
  });

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Trade;
    direction: "asc" | "desc";
  }>({
    key: "date_of_execution",
    direction: "desc",
  });

  const updateFilter = useCallback((key: keyof typeof filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateSort = useCallback((key: keyof Trade) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  const filterTrades = useCallback((trades: Trade[]) => {
    return trades.filter(trade => {
      if (filters.contractType && trade.contract_type !== filters.contractType) {
        return false;
      }
      if (filters.client && !trade.client.toLowerCase().includes(filters.client.toLowerCase())) {
        return false;
      }
      if (filters.showAnomaliesOnly && !trade.is_anomaly) {
        return false;
      }
      if (filters.showUnvalidatedOnly && trade.is_validated) {
        return false;
      }
      return true;
    });
  }, [filters]);

  const sortTrades = useCallback((trades: Trade[]) => {
    return [...trades].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc" 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc" 
          ? aValue - bValue
          : bValue - aValue;
      }
      
      return 0;
    });
  }, [sortConfig]);

  return {
    filters,
    sortConfig,
    updateFilter,
    updateSort,
    filterTrades,
    sortTrades,
  };
}

// Convenience hook that combines trades fetching with filtering and sorting
export function useFilteredTrades(seconds: number = 60) {
  const { data: tradesData, ...tradesQuery } = useTrades(seconds);
  const { filters, sortConfig, updateFilter, updateSort, filterTrades, sortTrades } = useTradeFilters();
  
  const processedTrades = tradesData?.trades 
    ? sortTrades(filterTrades(tradesData.trades))
    : [];

  return {
    trades: processedTrades,
    totalCount: tradesData?.count || 0,
    filteredCount: processedTrades.length,
    filters,
    sortConfig,
    updateFilter,
    updateSort,
    ...tradesQuery,
  };
}
