import React from 'react';

interface TradePanelProps {
  balance: number;
  equity: number;
  freeMargin: number;
}

const TradePanel: React.FC<TradePanelProps> = ({ balance, equity, freeMargin }) => {
  const tabs = ["Trade", "Exposure", "History", "News", "Mailbox", "Journal"];
  
  return (
    <div className="bg-[#0b0e11] border-t border-[#2b2f36] flex flex-col h-64 text-[11px] font-sans">
      {/* Header Summary (MT5 Style) */}
      <div className="bg-[#181a20] px-4 py-1 border-b border-[#2b2f36] flex gap-6 text-gray-300">
        <div>Balance: <span className="font-bold text-white">{balance.toFixed(2)} USD</span></div>
        <div>Equity: <span className="font-bold text-white">{equity.toFixed(2)}</span></div>
        <div>Free Margin: <span className="font-bold text-white">{freeMargin.toFixed(2)}</span></div>
        <div className="ml-auto font-bold text-white">0.00</div>
      </div>

      {/* Table Section */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="text-gray-500 bg-[#181a20] sticky top-0 border-b border-[#2b2f36]">
            <tr>
              <th className="p-2 font-normal border-r border-[#2b2f36]">Symbol</th>
              <th className="p-2 font-normal border-r border-[#2b2f36]">Ticket</th>
              <th className="p-2 font-normal border-r border-[#2b2f36]">Time</th>
              <th className="p-2 font-normal border-r border-[#2b2f36]">Type</th>
              <th className="p-2 font-normal border-r border-[#2b2f36]">Volume</th>
              <th className="p-2 font-normal border-r border-[#2b2f36]">Price</th>
              <th className="p-2 font-normal border-r border-[#2b2f36]">S / L</th>
              <th className="p-2 font-normal border-r border-[#2b2f36]">T / P</th>
              <th className="p-2 font-normal border-r border-[#2b2f36]">Price</th>
              <th className="p-2 font-normal">Profit</th>
            </tr>
          </thead>
          <tbody className="text-gray-400">
            {/* مثال لصفقة مفتوحة */}
            <tr className="hover:bg-blue-900/10 cursor-default">
              <td className="p-2 border-r border-[#2b2f36] text-white">XAUUSD,H1</td>
              <td className="p-2 border-r border-[#2b2f36]">11624629</td>
              <td className="p-2 border-r border-[#2b2f36]">2026.01.22 16:00</td>
              <td className="p-2 border-r border-[#2b2f36] text-blue-400">buy</td>
              <td className="p-2 border-r border-[#2b2f36]">0.01</td>
              <td className="p-2 border-r border-[#2b2f36]">4839.53</td>
              <td className="p-2 border-r border-[#2b2f36]">0.00</td>
              <td className="p-2 border-r border-[#2b2f36]">0.00</td>
              <td className="p-2 border-r border-[#2b2f36]">4839.73</td>
              <td className="p-2 text-green-400 font-bold">0.20</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Bottom Tabs (MT5 Style) */}
      <div className="bg-[#181a20] border-t border-[#2b2f36] flex overflow-x-auto">
        {tabs.map((tab, i) => (
          <div 
            key={tab} 
            className={`px-4 py-1.5 border-r border-[#2b2f36] cursor-pointer hover:bg-[#2b2f36] transition-colors ${i === 0 ? 'bg-[#2b2f36] text-white font-bold' : 'text-gray-500'}`}
          >
            {tab}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TradePanel;