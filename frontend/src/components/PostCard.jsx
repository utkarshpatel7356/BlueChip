import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const PostCard = ({ post, onBuy, onSell, userHoldings }) => {
    // Local state for how many shares to buy/sell
    const [amount, setAmount] = useState(1);

    // Color logic: If price > 10 (base), it's Green. Else Gray.
    const isProfitable = post.current_price > 10;
    const priceColor = isProfitable ? 'text-trade-up' : 'text-gray-400';

    return (
        <div className="bg-terminal-card border border-terminal-border rounded-lg p-5 mb-4 hover:border-gray-600 transition-colors">
            {/* Header: Author & Ticker Info */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400">
                        U{post.creator_id}
                    </div>
                    <span className="text-gray-400 text-sm">IPO #{post.id}</span>
                </div>
                
                {/* Price Display */}
                <div className="text-right">
                    <div className={`text-xl font-bold nums flex items-center justify-end gap-1 ${priceColor}`}>
                        {isProfitable ? <TrendingUp size={16} /> : <DollarSign size={16} />}
                        {post.current_price.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500 nums">
                        Vol: {post.shares_sold}/100
                    </div>
                </div>
            </div>

            {/* Content */}
            <p className="text-gray-200 text-lg mb-4 font-medium leading-relaxed">
                {post.content}
            </p>

            {/* Footer: Trading Controls */}
            <div className="flex items-center justify-between border-t border-terminal-border pt-4">
                
                {/* Holdings Indicator */}
                <div className="text-xs">
                    <span className="text-gray-500">You Own: </span>
                    <span className={`font-bold nums ${userHoldings > 0 ? 'text-white' : 'text-gray-600'}`}>
                        {userHoldings || 0} Shares
                    </span>
                </div>

                {/* Buy/Sell Actions */}
                <div className="flex items-center gap-2">
                    {/* Quantity Selector */}
                    <input 
                        type="number" 
                        min="1" 
                        max="10"
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