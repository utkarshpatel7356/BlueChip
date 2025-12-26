// src/components/Feed.jsx
import React, { useEffect, useState } from 'react';
import { endpoints } from '../api';
import PostCard from './PostCard';
import { PlusCircle, RefreshCw } from 'lucide-react';
import { useUser } from '../context/UserContext'; // <--- Import

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [holdings, setHoldings] = useState({}); // Stores the map of ID -> Shares
    const [newPostContent, setNewPostContent] = useState("");
    
    // We still use context for the Balance update, but not for holdings anymore
    const { refreshUser, USER_ID } = useUser(); 

    const refreshData = async () => {
        try {
            // 1. Fetch Posts
            const postsRes = await endpoints.getPosts();
            setPosts(postsRes.data.sort((a, b) => b.id - a.id));

            // 2. Fetch User Balance (Updates Sidebar)
            await refreshUser(); 

            // 3. Fetch Portfolio (Updates "You Own" on cards) <--- NEW LOGIC
            const portfolioRes = await endpoints.getPortfolio(USER_ID);
            
            // Convert array to Map: { post_id: shares_owned }
            const portfolioMap = {};
            portfolioRes.data.forEach(item => {
                portfolioMap[item.post_id] = item.shares_owned;
            });
            setHoldings(portfolioMap);

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        refreshData();
        const interval = setInterval(refreshData, 5000); 
        return () => clearInterval(interval);
    }, []);

    const handleBuy = async (postId, amount) => {
        try {
            await endpoints.buy(USER_ID, postId, amount);
            refreshData(); // Updates Posts AND User Balance/Holdings
        } catch (err) {
            alert("Buy failed: " + (err.response?.data?.detail || err.message));
        }
    };

    const handleSell = async (postId, amount) => {
        try {
            await endpoints.sell(USER_ID, postId, amount);
            refreshData();
        } catch (err) {
            alert("Sell failed: " + (err.response?.data?.detail || err.message));
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPostContent) return;
        try {
            await endpoints.createPost(newPostContent, USER_ID);
            setNewPostContent("");
            refreshData();
        } catch (err) {
            alert("IPO failed");
        }
    };

    return (
        // ... (Keep the exact same JSX as before)
        <div>
            {/* Top Bar: IPO Input */}
            <div className="mb-8">
                <form onSubmit={handleCreatePost} className="relative">
                    <input 
                        type="text" 
                        placeholder="Launch a new IPO (What's on your mind?)" 
                        className="w-full bg-terminal-card border border-terminal-border rounded-lg p-4 pl-4 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-trade-accent transition-colors"
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                    />
                    <button 
                        type="submit"
                        className="absolute right-2 top-2 bottom-2 text-trade-accent hover:text-white px-2"
                    >
                        <PlusCircle />
                    </button>
                </form>
            </div>

            {/* Feed Header */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-200">Market Feed</h2>
                <button onClick={refreshData} className="text-gray-500 hover:text-white">
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* Posts List */}
            {posts.map(post => (
                <PostCard 
                    key={post.id} 
                    post={post} 
                    onBuy={handleBuy} 
                    onSell={handleSell}
                    userHoldings={holdings[post.id]}
                />
            ))}
            
            {posts.length === 0 && (
                <div className="text-center text-gray-600 mt-10">No IPOs yet. Be the first!</div>
            )}
        </div>
    );
};

export default Feed;