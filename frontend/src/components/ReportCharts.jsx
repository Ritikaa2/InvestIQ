import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

// Formatting helper
const formatBillions = (value) => `$${(value / 1e9).toFixed(1)}B`;

export const RevenueBarChart = ({ data }) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.2}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
          <XAxis dataKey="year" stroke="#94a3b8" fontSize={10} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} tickFormatter={formatBillions} />
          <Tooltip 
            formatter={(value) => [`$${(value / 1e9).toFixed(2)} Billion`, 'Revenue']}
            contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
          />
          <Bar dataKey="revenue" fill="url(#revenueGrad)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ProfitFCFChart = ({ data }) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="fcfGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
          <XAxis dataKey="year" stroke="#94a3b8" fontSize={10} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} tickFormatter={formatBillions} />
          <Tooltip 
            formatter={(value, name) => [`$${(value / 1e9).toFixed(2)} Billion`, name === 'profit' ? 'Net Income' : 'Free Cash Flow']}
            contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
          />
          <Area type="monotone" dataKey="profit" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#profitGrad)" name="profit" />
          <Area type="monotone" dataKey="freeCashFlow" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#fcfGrad)" name="freeCashFlow" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const SentimentGauge = ({ score }) => {
  // Score: 0 to 100
  const color = score > 60 ? '#10b981' : (score < 40 ? '#ef4444' : '#f59e0b');
  
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-36 h-20 flex items-end justify-center overflow-hidden">
        {/* Semi-circle background */}
        <div className="absolute w-36 h-36 border-[14px] border-slate-200 dark:border-slate-800 rounded-full top-0" />
        {/* Filled score arc */}
        <div 
          className="absolute w-36 h-36 border-[14px] rounded-full top-0 transition-all duration-1000"
          style={{
            borderColor: `${color} transparent transparent transparent`,
            transform: `rotate(${(score / 100) * 180 - 45}deg)`,
            transformOrigin: 'center center'
          }}
        />
        <div className="z-10 text-center pb-2">
          <span className="text-3xl font-display font-extrabold" style={{ color }}>{score}%</span>
          <span className="text-[9px] text-slate-400 block uppercase font-bold mt-0.5">Sentiment Score</span>
        </div>
      </div>
      <div className="flex justify-between w-full text-[9px] text-slate-400 font-semibold px-2 mt-2">
        <span>BEARISH</span>
        <span>NEUTRAL</span>
        <span>BULLISH</span>
      </div>
    </div>
  );
};

export const CompetitorPieChart = ({ competitors }) => {
  const data = competitors.map(c => ({
    name: c.name,
    value: parseFloat(c.marketShareEstimated) || 20
  }));

  // Add client placeholder to total 100%
  const totalCompetitorsShare = data.reduce((acc, curr) => acc + curr.value, 0);
  data.push({ name: 'Client Share', value: Math.max(10, 100 - totalCompetitorsShare) });

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#0ea5e9'];

  return (
    <div className="h-44 w-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={65}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`${value}%`, 'Estimated Share']}
            contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '10px' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-col gap-1 text-[10px] pl-2 text-left">
        {data.map((d, idx) => (
          <div key={idx} className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
            <span className="truncate max-w-[90px]">{d.name} ({d.value}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};


