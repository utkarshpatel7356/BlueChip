import React, { useEffect, useState } from 'react';
import { endpoints } from '../api';
import { Trophy } from 'lucide-react';

const Leaderboard = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        endpoints.getLeaderboard().then(res => setUsers(res.data));
    }, []);

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Trophy className="text-yellow-500" /> Wall Street Elite
            </h2>
            <div className="bg-terminal-card border border-terminal-border rounded-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-black/40 text-gray-500 text-xs uppercase">
                        <tr>
                            <th className="p-4">Rank</th>
                            <th className="p-4">Trader</th>
                            <th className="p-4 text-right">Net Worth</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-terminal-border">
                        {users.map((u, index) => (
                            <tr key={u.username} className="hover:bg-white/5">
                                <td className="p-4 text-gray-500 font-mono">#{index + 1}</td>
                                <td className="p-4 text-white font-bold">{u.username}</td>
                                <td className="p-4 text-right text-trade-up font-mono font-bold">
                                    ${u.net_worth.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Leaderboard;