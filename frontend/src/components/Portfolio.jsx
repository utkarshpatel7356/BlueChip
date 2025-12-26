import React, { useEffect, useState } from 'react';
import { endpoints } from '../api';
import { useUser } from '../context/UserContext';
import { PieChart, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

const Portfolio = () => {
    const { user, refreshUser, USER_ID } = useUser();
    const [assets, setAssets] = useState([]);
    const [netWorth, setNetWorth] = useState(0);

    useEffect(() => {
        const fetchPortfolioData = async () => {
            try {
                // 1. Get Holdings (Now includes avg_buy_price)
                const portRes = await endpoints.getPortfolio(USER_ID);
                const holdings = portRes.data;

                // 2. Get Live Prices
                const postsRes = await endpoints.getPosts();
                const postsMap = {};
                postsRes.data.forEach(p => postsMap[p.id] = p);

                // 3. Calculate Logic
                let totalAssetValue = 0;
                
                const detailedAssets = holdings.map(h => {
                    const post = postsMap[h.post_id];
                    if (!post) return null;

                    const currentVal = h.shares_owned * post.current_price;
                    const costBasis = h.shares_owned * h.avg_buy_price;
                    const pnl = currentVal - costBasis;
                    const pnlPercent = ((pnl / costBasis) * 100);

                    totalAssetValue += currentVal;

                    return {
                        id: post.id,
                        content: post.content,
                        shares: h.shares_owned,
                        avgPrice: h.avg_buy_price,
                        currPrice: post.current_price,
                        value: currentVal,
                        pnl: pnl,
                        pnlPercent: pnlPercent
                    };
                }).filter(Boolean);

                setAssets(detailedAssets);
                
                // Net Worth = Cash + Assets
                if (user) {
                    setNetWorth(user.balance + totalAssetValue);
                }

            } catch (err) {
                console.error("Portfolio load failed", err);
            }
        };

        fetchPortfolioData();
        refreshUser();
    }, [USER_ID]);

    if (!user) return <div className="p-10 text-gray-500">Loading Financial Data...</div>;

    return (
        <div className="space-y-6">
            
            {/* Header: Net Worth Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Total Net Worth */}
                <div className="bg-terminal-card border border-terminal-border p-6 rounded-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <PieChart size={64} className="text-white" />
                    </div>
                    <p className="text-gray-500 text-sm mb-1 uppercase tracking-wider">Total Net Worth</p>
                    <p className="text-4xl font-bold text-white nums">
                        ${netWorth.toFixed(2)}
                    </p>
                </div>

                {/* Liquid Cash */}
                <div className="bg-terminal-card border border-terminal-border p-6 rounded-lg">
                    <p className="text-gray-500 text-sm mb-1 uppercase tracking-wider">Buying Power</p>
                    <p className="text-4xl font-bold text-trade-up nums">
                        ${user.balance.toFixed(2)}
                    </p>
                </div>
            </div>

            {/* Asset Table */}
            <div className="bg-terminal-card border border-terminal-border rounded-lg overflow-hidden">
                <div className="p-4 border-b border-terminal-border flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-200">Your Positions</h2>
                </div>
                
                <table className="w-full text-left border-collapse">
                    <thead className="bg-black/40 text-gray-500 text-xs uppercase font-mono">
                        <tr>
                            <th className="p-4 font-normal">Asset</th>
                            <th className="p-4 font-normal text-right">Shares</th>
                            <th className="p-4 font-normal text-right">Avg Cost</th>
                            <th className="p-4 font-normal text-right">Market Price</th>
                            <th className="p-4 font-normal text-right">Return</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-terminal-border text-sm">
                        {assets.map(asset => {
                            const isProfit = asset.pnl >= 0;
                            const ColorClass = isProfit ? 'text-trade-up' : 'text-trade-down';
                            
                            return (
                                <tr key={asset.id} className="hover:bg-white/5 transition-colors group">
                                    {/* Asset Name */}
                                    <td className="p-4">
                                        <div className="text-white font-medium truncate max-w-[200px] group-hover:text-trade-accent transition-colors">
                                            {asset.content}
                                        </div>
                                        <div className="text-xs text-gray-600 mt-1">IPO #{asset.id}</div>
                                    </td>
                                    
                                    {/* Shares */}
                                    <td className="p-4 text-right text-gray-300 nums font-bold">
                                        {asset.shares}
                                    </td>
                                    
                                    {/* Avg Cost */}
                                    <td className="p-4 text-right text-gray-500 nums">
                                        ${asset.avgPrice.toFixed(2)}
                                    </td>
                                    
                                    {/* Market Price */}
                                    <td className="p-4 text-right text-white nums">
                                        ${asset.currPrice.toFixed(2)}
                                    </td>
                                    
                                    {/* Return (PnL) */}
                                    <td className={`p-4 text-right nums font-bold ${ColorClass}`}>
                                        <div className="flex items-center justify-end gap-1">
                                            {isProfit ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                            {asset.pnlPercent.toFixed(1)}%
                                        </div>
                                        <div className="text-xs opacity-60">
                                            {isProfit ? '+' : ''}${asset.pnl.toFixed(2)}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}

                        {assets.length === 0 && (
                            <tr>
                                <td colSpan="5" className="p-10 text-center text-gray-600">
                                    <p className="mb-2">Your portfolio is empty.</p>
                                    <a href="/" className="text-trade-accent hover:underline flex items-center justify-center gap-1">
                                        Go to Market <ArrowRight size={14} />
                                    </a>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Portfolio;