"use client";
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Button } from "../ui/button";
import {
     PieChart,
     Pie,
     Cell,
     BarChart,
     Bar,
     XAxis,
     YAxis,
     CartesianGrid,
     ResponsiveContainer,
     Legend,
     Tooltip,
} from "recharts";
import toast from "react-hot-toast";

type Network = "ETHEREUM" | "SOLANA";

type PortfolioData = {
     native: { symbol: string; amount: number; usd: number };
     tokens: Array<{
          symbol: string;
          amount: number;
          usd: number;
          address?: string;
          mint?: string;
     }>;
     totals: { usd: number };
};

const numberFormat = (n: number) =>
     n.toLocaleString(undefined, { maximumFractionDigits: 6 });

const usdFormat = (n: number) =>
     n.toLocaleString(undefined, { style: "currency", currency: "USD" });

const VIBRANT_COLORS = [
     "#FF6B6B",
     "#4ECDC4",
     "#45B7D1",
     "#FFA07A",
     "#98D8C8",
     "#F7DC6F",
     "#BB8FCE",
     "#85C1E9",
     "#F8C471",
     "#82E0AA",
];

const Portfolio: React.FC = () => {
     const [ethData, setEthData] = useState<PortfolioData | null>(null);
     const [solData, setSolData] = useState<PortfolioData | null>(null);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);
     const [selectedView, setSelectedView] = useState<
          "combined" | "ethereum" | "solana"
     >("combined");

     useEffect(() => {
          void loadAllPortfolios();
     }, []);

     const loadAllPortfolios = async () => {
          const ethAddress = localStorage.getItem("connected_eth_address");
          const solAddress = localStorage.getItem("connected_sol_address");

          if (!ethAddress && !solAddress) {
               toast.error("Please connect at least one wallet first! 🔗");
               return;
          }

          setLoading(true);
          setError(null);

          try {
               const promises = [];

               if (ethAddress) {
                    promises.push(
                         axios
                              .post("/api/portfolio", {
                                   address: ethAddress,
                                   network: "ETHEREUM",
                              })
                              .then((res) => ({ type: "eth", data: res.data }))
                    );
               }

               if (solAddress) {
                    promises.push(
                         axios
                              .post("/api/portfolio", {
                                   address: solAddress,
                                   network: "SOLANA",
                              })
                              .then((res) => ({ type: "sol", data: res.data }))
                    );
               }

               const results = await Promise.all(promises);

               results.forEach((result) => {
                    if (result.type === "eth") {
                         setEthData(result.data);
                    } else {
                         setSolData(result.data);
                    }
               });

               toast.success("Portfolio loaded successfully! 🎉");
          } catch (err: any) {
               console.error(err);
               const errorMsg =
                    err?.response?.data?.error ||
                    "Failed to fetch portfolio data";
               setError(errorMsg);
               toast.error(errorMsg);
          } finally {
               setLoading(false);
          }
     };

     const combinedData = useMemo(() => {
          if (!ethData && !solData) return null;

          const totalUsd =
               (ethData?.totals.usd || 0) + (solData?.totals.usd || 0);
          const allTokens = [
               ...(ethData ? [{ ...ethData.native, network: "Ethereum" }] : []),
               ...(solData ? [{ ...solData.native, network: "Solana" }] : []),
               ...(ethData?.tokens.map((t) => ({
                    ...t,
                    network: "Ethereum",
               })) || []),
               ...(solData?.tokens.map((t) => ({ ...t, network: "Solana" })) ||
                    []),
          ];

          return { totalUsd, allTokens };
     }, [ethData, solData]);

     const pieChartData = useMemo(() => {
          if (selectedView === "combined" && combinedData) {
               return combinedData.allTokens
                    .filter((token) => token.usd > 1)
                    .map((token, index) => ({
                         name: token.symbol,
                         value: token.usd,
                         color: VIBRANT_COLORS[index % VIBRANT_COLORS.length],
                    }))
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 8);
          } else if (selectedView === "ethereum" && ethData) {
               const tokens = [ethData.native, ...ethData.tokens];
               return tokens
                    .filter((token) => token.usd > 1)
                    .map((token, index) => ({
                         name: token.symbol,
                         value: token.usd,
                         color: VIBRANT_COLORS[index % VIBRANT_COLORS.length],
                    }));
          } else if (selectedView === "solana" && solData) {
               const tokens = [solData.native, ...solData.tokens];
               return tokens
                    .filter((token) => token.usd > 1)
                    .map((token, index) => ({
                         name: token.symbol,
                         value: token.usd,
                         color: VIBRANT_COLORS[index % VIBRANT_COLORS.length],
                    }));
          }
          return [];
     }, [selectedView, combinedData, ethData, solData]);

     const barChartData = useMemo(() => {
          const data = [];
          if (ethData) {
               data.push({
                    name: "Ethereum",
                    value: ethData.totals.usd,
                    color: "#627EEA",
               });
          }
          if (solData) {
               data.push({
                    name: "Solana",
                    value: solData.totals.usd,
                    color: "#9945FF",
               });
          }
          return data;
     }, [ethData, solData]);

     const renderSelectedData = () => {
          if (selectedView === "combined" && combinedData) {
               return {
                    totalUsd: combinedData.totalUsd,
                    tokens: combinedData.allTokens,
                    native: null,
               };
          } else if (selectedView === "ethereum" && ethData) {
               return {
                    totalUsd: ethData.totals.usd,
                    tokens: ethData.tokens,
                    native: ethData.native,
               };
          } else if (selectedView === "solana" && solData) {
               return {
                    totalUsd: solData.totals.usd,
                    tokens: solData.tokens,
                    native: solData.native,
               };
          }
          return null;
     };

     const currentData = renderSelectedData();

     return (
          <div className="w-full max-w-7xl mx-auto mt-8 px-6">
               <div className="bg-yellow-200 p-8 rounded-3xl border-4 border-black shadow-[8px_8px_0px_#000]">
                    <div className="text-center mb-8">
                         <h2 className="text-5xl font-black text-black mb-4 drop-shadow-[4px_4px_0px_#fff]">
                              🎯 Your Crypto Portfolio
                         </h2>
                         <p className="text-xl font-bold text-black">
                              Live tracking of your digital assets! 📈✨
                         </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-8">
                         <Button
                              onClick={loadAllPortfolios}
                              disabled={loading}
                              className="bg-pink-400 hover:bg-pink-300 text-black font-black px-8 py-4 rounded-2xl border-4 border-black text-xl shadow-[6px_6px_0px_#000]"
                         >
                              {loading
                                   ? "🔄 Loading..."
                                   : "🔃 Refresh Portfolio"}
                         </Button>

                         <div className="flex gap-2">
                              {["combined", "ethereum", "solana"].map(
                                   (view) => (
                                        <Button
                                             key={view}
                                             onClick={() =>
                                                  setSelectedView(view as any)
                                             }
                                             className={`font-black px-6 py-3 rounded-xl border-4 border-black text-lg shadow-[4px_4px_0px_#000] ${
                                                  selectedView === view
                                                       ? "bg-green-400 text-black"
                                                       : "bg-white text-black hover:bg-gray-100"
                                             }`}
                                        >
                                             {view === "combined" &&
                                                  "🌍 Combined"}
                                             {view === "ethereum" &&
                                                  "🔷 Ethereum"}
                                             {view === "solana" && "🌟 Solana"}
                                        </Button>
                                   )
                              )}
                         </div>
                    </div>

                    {error && (
                         <div className="bg-red-300 border-4 border-black text-black p-6 rounded-2xl mb-8 text-center text-xl font-bold shadow-[6px_6px_0px_#000]">
                              ⚠️ {error}
                         </div>
                    )}

                    {currentData && (
                         <div className="space-y-8">
                              {/* Summary Cards */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                   <div className="bg-green-300 p-6 rounded-2xl border-4 border-black shadow-[6px_6px_0px_#000] text-center">
                                        <div className="text-4xl mb-2">💰</div>
                                        <div className="text-lg font-bold">
                                             Total Portfolio
                                        </div>
                                        <div className="text-3xl font-black">
                                             {usdFormat(currentData.totalUsd)}
                                        </div>
                                   </div>

                                   <div className="bg-blue-300 p-6 rounded-2xl border-4 border-black shadow-[6px_6px_0px_#000] text-center">
                                        <div className="text-4xl mb-2">🪙</div>
                                        <div className="text-lg font-bold">
                                             Total Tokens
                                        </div>
                                        <div className="text-3xl font-black">
                                             {currentData.tokens.length +
                                                  (currentData.native ? 1 : 0)}
                                        </div>
                                   </div>

                                   <div className="bg-purple-300 p-6 rounded-2xl border-4 border-black shadow-[6px_6px_0px_#000] text-center">
                                        <div className="text-4xl mb-2">🌐</div>
                                        <div className="text-lg font-bold">
                                             Networks
                                        </div>
                                        <div className="text-3xl font-black">
                                             {selectedView === "combined"
                                                  ? `${ethData ? 1 : 0} + ${
                                                         solData ? 1 : 0
                                                    }`
                                                  : "1"}
                                        </div>
                                   </div>
                              </div>

                              {/* Charts */}
                              {pieChartData.length > 0 && (
                                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <div className="bg-white p-6 rounded-2xl border-4 border-black shadow-[6px_6px_0px_#000]">
                                             <h3 className="text-2xl font-black text-center mb-4">
                                                  🥧 Token Distribution
                                             </h3>
                                             <ResponsiveContainer
                                                  width="100%"
                                                  height={300}
                                             >
                                                  <PieChart>
                                                       <Pie
                                                            data={pieChartData}
                                                            cx="50%"
                                                            cy="50%"
                                                            outerRadius={100}
                                                            fill="#8884d8"
                                                            dataKey="value"
                                                            stroke="#000"
                                                            strokeWidth={3}
                                                       >
                                                            {pieChartData.map(
                                                                 (
                                                                      entry,
                                                                      index
                                                                 ) => (
                                                                      <Cell
                                                                           key={`cell-${index}`}
                                                                           fill={
                                                                                entry.color
                                                                           }
                                                                      />
                                                                 )
                                                            )}
                                                       </Pie>
                                                       <Tooltip
                                                            formatter={(
                                                                 value: any
                                                            ) =>
                                                                 usdFormat(
                                                                      value
                                                                 )
                                                            }
                                                       />
                                                       <Legend />
                                                  </PieChart>
                                             </ResponsiveContainer>
                                        </div>

                                        {selectedView === "combined" &&
                                             barChartData.length > 1 && (
                                                  <div className="bg-white p-6 rounded-2xl border-4 border-black shadow-[6px_6px_0px_#000]">
                                                       <h3 className="text-2xl font-black text-center mb-4">
                                                            📊 Chain Comparison
                                                       </h3>
                                                       <ResponsiveContainer
                                                            width="100%"
                                                            height={300}
                                                       >
                                                            <BarChart
                                                                 data={
                                                                      barChartData
                                                                 }
                                                            >
                                                                 <CartesianGrid
                                                                      strokeDasharray="3 3"
                                                                      stroke="#000"
                                                                 />
                                                                 <XAxis
                                                                      dataKey="name"
                                                                      tick={{
                                                                           fontWeight:
                                                                                "bold",
                                                                      }}
                                                                      stroke="#000"
                                                                 />
                                                                 <YAxis
                                                                      tick={{
                                                                           fontWeight:
                                                                                "bold",
                                                                      }}
                                                                      stroke="#000"
                                                                 />
                                                                 <Tooltip
                                                                      formatter={(
                                                                           value: any
                                                                      ) =>
                                                                           usdFormat(
                                                                                value
                                                                           )
                                                                      }
                                                                 />
                                                                 <Bar
                                                                      dataKey="value"
                                                                      fill="#FFD93D"
                                                                      stroke="#000"
                                                                      strokeWidth={
                                                                           3
                                                                      }
                                                                      radius={[
                                                                           8, 8,
                                                                           0, 0,
                                                                      ]}
                                                                 />
                                                            </BarChart>
                                                       </ResponsiveContainer>
                                                  </div>
                                             )}
                                   </div>
                              )}

                              {/* Token Table */}
                              <div className="bg-white rounded-2xl border-4 border-black shadow-[6px_6px_0px_#000] overflow-hidden">
                                   <div className="bg-pink-400 p-6 text-center border-b-4 border-black">
                                        <h3 className="text-3xl font-black text-black">
                                             🪙 Token Holdings
                                        </h3>
                                   </div>
                                   <div className="overflow-x-auto">
                                        <table className="min-w-full">
                                             <thead className="bg-yellow-200 border-b-4 border-black">
                                                  <tr>
                                                       <th className="text-left px-6 py-4 text-xl font-black border-r-4 border-black">
                                                            Token 🪙
                                                       </th>
                                                       <th className="text-left px-6 py-4 text-xl font-black border-r-4 border-black">
                                                            Balance ⚖️
                                                       </th>
                                                       <th className="text-left px-6 py-4 text-xl font-black border-r-4 border-black">
                                                            USD Value 💵
                                                       </th>
                                                       {selectedView ===
                                                            "combined" && (
                                                            <th className="text-left px-6 py-4 text-xl font-black">
                                                                 Network 🌐
                                                            </th>
                                                       )}
                                                  </tr>
                                             </thead>
                                             <tbody>
                                                  {currentData.native && (
                                                       <tr className="hover:bg-yellow-100 transition-colors">
                                                            <td className="px-6 py-4 border-b-2 border-black text-xl font-bold">
                                                                 {
                                                                      currentData
                                                                           .native
                                                                           .symbol
                                                                 }{" "}
                                                                 ⭐
                                                            </td>
                                                            <td className="px-6 py-4 border-b-2 border-black text-lg font-semibold">
                                                                 {numberFormat(
                                                                      currentData
                                                                           .native
                                                                           .amount
                                                                 )}{" "}
                                                                 {
                                                                      currentData
                                                                           .native
                                                                           .symbol
                                                                 }
                                                            </td>
                                                            <td className="px-6 py-4 border-b-2 border-black text-lg font-bold text-green-700">
                                                                 {usdFormat(
                                                                      currentData
                                                                           .native
                                                                           .usd
                                                                 )}
                                                            </td>
                                                            {selectedView ===
                                                                 "combined" && (
                                                                 <td className="px-6 py-4 border-b-2 border-black text-lg font-semibold">
                                                                      Native
                                                                 </td>
                                                            )}
                                                       </tr>
                                                  )}
                                                  {currentData.tokens
                                                       .sort(
                                                            (a, b) =>
                                                                 (b.usd || 0) -
                                                                 (a.usd || 0)
                                                       )
                                                       .map((token, idx) => (
                                                            <tr
                                                                 key={idx}
                                                                 className="hover:bg-blue-100 transition-colors"
                                                            >
                                                                 <td className="px-6 py-4 border-b-2 border-black text-xl font-bold">
                                                                      {
                                                                           token.symbol
                                                                      }{" "}
                                                                      🎯
                                                                 </td>
                                                                 <td className="px-6 py-4 border-b-2 border-black text-lg font-semibold">
                                                                      {numberFormat(
                                                                           token.amount
                                                                      )}
                                                                 </td>
                                                                 <td className="px-6 py-4 border-b-2 border-black text-lg font-bold text-green-700">
                                                                      {usdFormat(
                                                                           token.usd ||
                                                                                0
                                                                      )}
                                                                 </td>
                                                                 {selectedView ===
                                                                      "combined" && (
                                                                      <td className="px-6 py-4 border-b-2 border-black text-lg font-semibold">
                                                                           {(
                                                                                token as any
                                                                           )
                                                                                .network ||
                                                                                "Unknown"}
                                                                      </td>
                                                                 )}
                                                            </tr>
                                                       ))}
                                             </tbody>
                                        </table>
                                   </div>
                              </div>
                         </div>
                    )}

                    {!currentData && !loading && (
                         <div className="text-center py-12">
                              <div className="text-6xl mb-4">🔗</div>
                              <h3 className="text-3xl font-black text-black mb-4">
                                   Connect Your Wallets First!
                              </h3>
                              <p className="text-xl text-black">
                                   Head to the wallet section above to get
                                   started 🚀
                              </p>
                         </div>
                    )}
               </div>
          </div>
     );
};

export default Portfolio;
