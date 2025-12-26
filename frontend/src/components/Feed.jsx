// frontend/src/components/Feed.jsx
import React, { useEffect, useState, useRef } from 'react';
import { endpoints } from '../api';
import PostCard from './PostCard';
import { PlusCircle, RefreshCw } from 'lucide-react';
import { useUser } from '../context/UserContext';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [holdings, setHoldings] = useState({});
    const [newPostContent, setNewPostContent] = useState("");
    
    // Get user from context
    const { user, refreshUser } = useUser(); 

    // Helper to Load Portfolio (Only called when we have a user)
    const loadPortfolio = async (userId) => {
        if (!userId) return;
        try {
            const portfolioRes = await endpoints.getPortfolio(userId);
            const portfolioMap = {};
            portfolioRes.data.forEach(item => {
                portfolioMap[item.post_id] = item.shares_owned;
            });
            setHoldings(portfolioMap);
        } catch (error) {
            console.error("Portfolio load error", error);
        }
    };

    // 1. Initial Data Load
    useEffect(() => {
        const initLoad = async () => {
            // Load posts
            const postsRes = await endpoints.getPosts();
            setPosts(postsRes.data.sort((a, b) => b.id - a.id));

            // Load user details
            await refreshUser();
        };
        initLoad();
    }, []); // Empty array = Runs ONCE on mount

    // 2. Poll only for POSTS (Safe, won't cause loops)
    useEffect(() => {
        const interval = setInterval(async () => {
            const postsRes = await endpoints.getPosts();
            setPosts(postsRes.data.sort((a, b) => b.id - a.id));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // 3. Update Holdings when User changes (e.g. after login)
    useEffect(() => {
        if (user && user.id) {
            loadPortfolio(user.id);
        }
    }, [user]); // Safe because loadPortfolio does NOT update 'user'

    // --- Actions ---

    const handleBuy = async (postId, amount) => {
        try {
            await endpoints.buy(postId, amount);
            // Manually refresh everything after action
            refreshUser();
            const postsRes = await endpoints.getPosts();
            setPosts(postsRes.data.sort((a, b) => b.id - a.id));
        } catch (err) {
            alert("Buy failed: " + (err.response?.data?.detail || err.message));
        }
    };

    const handleSell = async (postId, amount) => {
        try {
            await endpoints.sell(postId, amount);
            refreshUser(); 
            const postsRes = await endpoints.getPosts();
            setPosts(postsRes.data.sort((a, b) => b.id - a.id));
        } catch (err) {
            alert("Sell failed: " + (err.response?.data?.detail || err.message));
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPostContent) return;
        try {
            await endpoints.createPost(newPostContent);
            setNewPostContent("");
            const postsRes = await endpoints.getPosts();
            setPosts(postsRes.data.sort((a, b) => b.id - a.id));
        } catch (err) {
            alert("IPO failed");
        }
    };

    return (
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
                <button onClick={() => window.location.reload()} className="text-gray-500 hover:text-white">
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