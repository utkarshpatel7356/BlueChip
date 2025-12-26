import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const PostCard = ({ post, onBuy, onSell, userHoldings }) => {
    const [amount, setAmount] = useState(1);

    // --- Math for UI ---
    // Base price is always 10. Calculate % growth.
    const basePrice = 10;
    const priceChange = post.current_price - basePrice;
    const percentChange = ((priceChange / basePrice) * 100).toFixed(1);
    
    // Green if profit, Gray if neutral
    const isProfitable = post.current_price > 10;
    const priceColor = isProfitable ? 'text-trade-up' : 'text-gray-400';
    const accentColor = isProfitable ? 'bg-trade-up' : 'bg-gray-600';

    return (
        <div className="bg-terminal-card border border-terminal-border rounded-lg p-5 mb-4 hover:border-gray-600 transition-colors">
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400">
                        U{post.creator_id}
                    </div>
                    <span className="text-gray-400 text-sm">IPO #{post.id}</span>
                </div>
                
                {/* Ticker Display */}
                <div className="text-right">
                    <div className={`text-xl font-bold nums flex items-center justify-end gap-1 ${priceColor}`}>
                        {isProfitable ? <TrendingUp size={16} /> : <DollarSign size={16} />}
                        {post.current_price.toFixed(2)}
                    </div>
                    {/* The New % Change Badge */}
                    <div className={`text-xs inline-block px-1 rounded ${isProfitable ? 'text-trade-up bg-trade-up/10' : 'text-gray-500'}`}>
                        {isProfitable ? '+' : ''}{percentChange}%
                    </div>
                </div>
            </div>

            {/* Content */}
            <p className="text-gray-200 text-lg mb-4 font-medium leading-relaxed font-mono">
                {post.content}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-terminal-border pt-4">
                <div className="text-xs">
                    <span className="text-gray-500">You Own: </span>
                    <span className={`font-bold nums ${userHoldings > 0 ? 'text-white' : 'text-gray-600'}`}>
                        {userHoldings || 0} Shares
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <input 
                        type="number" min="1" max="10"
                        value={amount}
                        onChange={(e) => setAmount(parseInt(e.target.value))}
                        className="w-12 bg-black border border-terminal-border text-white text-center rounded text-sm py-1 focus:outline-none focus:border-trade-accent"
                    />
                    
                    <button 
                        onClick={() => onBuy(post.id, amount)}
                        className="bg-trade-up/10 text-trade-up border border-trade-up/50 px-3 py-1 rounded text-sm font-bold hover:bg-trade-up hover:text-black transition-all"
                    >
                        BUY
                    </button>
                    
                    <button 
                        onClick={() => onSell(post.id, amount)}
                        className="bg-trade-down/10 text-trade-down border border-trade-down/50 px-3 py-1 rounded text-sm font-bold hover:bg-trade-down hover:text-black transition-all"
                    >
                        SELL
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostCard;