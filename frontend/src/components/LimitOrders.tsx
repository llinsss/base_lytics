import React, { useState } from 'react';
import { useLimitOrders } from '../hooks/useLimitOrders';

export function LimitOrders() {
  const { orders, createLimitOrder, cancelOrder } = useLimitOrders();
  const [orderType, setOrderType] = useState<'limit' | 'stop_loss' | 'take_profit'>('limit');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [asset, setAsset] = useState('ETH');
  const [amount, setAmount] = useState('');
  const [triggerPrice, setTriggerPrice] = useState('');

  const handleCreateOrder = () => {
    if (amount && triggerPrice) {
      createLimitOrder(orderType, side, asset, Number(amount), Number(triggerPrice));
      setAmount('');
      setTriggerPrice('');
    }
  };

  const getOrderTypeLabel = (type: string) => {
    switch (type) {
      case 'limit': return 'Limit Order';
      case 'stop_loss': return 'Stop Loss';
      case 'take_profit': return 'Take Profit';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold dark:text-white">📋 Advanced Orders</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Create Order</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-white">Order Type</label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value="limit">Limit Order</option>
                <option value="stop_loss">Stop Loss</option>
                <option value="take_profit">Take Profit</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSide('buy')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                  side === 'buy' ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => setSide('sell')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                  side === 'sell' ? 'bg-red-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                Sell
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-white">Asset</label>
              <select
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value="ETH">ETH</option>
                <option value="BTC">BTC</option>
                <option value="BLT">BLT</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-white">Amount</label>
              <input
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-white">
                {orderType === 'limit' ? 'Limit Price' : 'Trigger Price'}
              </label>
              <input
                type="number"
                placeholder="0.0"
                value={triggerPrice}
                onChange={(e) => setTriggerPrice(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg text-sm">
              <div className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                {getOrderTypeLabel(orderType)} Details
              </div>
              <div className="text-blue-700 dark:text-blue-300">
                {orderType === 'limit' && 'Order will execute when price reaches your limit'}
                {orderType === 'stop_loss' && 'Order will sell when price drops to minimize losses'}
                {orderType === 'take_profit' && 'Order will sell when price rises to lock in profits'}
              </div>
            </div>

            <button
              onClick={handleCreateOrder}
              disabled={!amount || !triggerPrice}
              className="btn-primary w-full"
            >
              Create {getOrderTypeLabel(orderType)}
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Open Orders</h3>
          
          {orders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No open orders</p>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium dark:text-white">
                        {getOrderTypeLabel(order.type)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {order.side.toUpperCase()} {order.amount} {order.asset} @ ${order.triggerPrice}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'filled' ? 'bg-green-100 text-green-800' :
                        order.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                      {order.status === 'pending' && (
                        <button
                          onClick={() => cancelOrder(order.id)}
                          className="text-red-600 hover:text-red-700 text-xs"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Created: {order.createdAt.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}