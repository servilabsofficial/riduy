import { useState, useEffect } from 'react';
import { Plus, Minus, Trash2, ShoppingCart, Save } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import api from '../../utils/api';

export default function NewSaleForm({ onSubmit, onCancel }) {
  const [patients, setPatients] = useState([]);
  const [products, setProducts] = useState([]);
  const [patientId, setPatientId] = useState('');
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('CASH');

  useEffect(() => {
    Promise.all([
      api.get('/patients', { limit: 200 }),
      api.get('/products', { limit: 200 }),
    ]).then(([pData, prData]) => {
      setPatients(pData.data || []);
      setProducts(prData.data || []);
    });
  }, []);

  const addToCart = (product) => {
    const existing = cart.find((c) => c.productId === product.id);
    if (existing) {
      setCart(cart.map((c) => c.productId === product.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { productId: product.id, name: product.name, price: product.price, quantity: 1, stock: product.stock }]);
    }
  };

  const updateQty = (productId, delta) => {
    setCart(cart.map((c) => {
      if (c.productId === productId) {
        const newQty = c.quantity + delta;
        if (newQty <= 0) return null;
        return { ...c, quantity: Math.min(newQty, c.stock) };
      }
      return c;
    }).filter(Boolean));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((c) => c.productId !== productId));
  };

  const subtotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
  const total = subtotal - Number(discount);

  const handleSubmit = () => {
    if (!patientId) return;
    if (cart.length === 0) return;
    onSubmit({
      patientId,
      items: cart.map((c) => ({ productId: c.productId, quantity: c.quantity, price: c.price })),
      discount: Number(discount),
      paymentMethod,
    });
  };

  return (
    <div className="space-y-4">
      {/* Patient selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Paciente *</label>
        <select value={patientId} onChange={(e) => setPatientId(e.target.value)} className="input-field">
          <option value="">Seleccionar paciente...</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
          ))}
        </select>
      </div>

      {/* Product list */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Agregar productos</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-200 dark:border-gray-800 rounded-xl">
          {products.filter((p) => p.stock > 0).map((p) => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              className="text-left p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800 transition-colors text-sm"
            >
              <p className="font-medium text-gray-900 dark:text-white truncate">{p.name}</p>
              <p className="text-xs text-gray-500">{formatCurrency(p.price)} | Stock: {p.stock}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Cart */}
      {cart.length > 0 && (
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 flex items-center gap-2">
            <ShoppingCart size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Carrito ({cart.length})</span>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {cart.map((item) => (
              <div key={item.productId} className="px-4 py-2 flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                  <p className="text-xs text-gray-500">{formatCurrency(item.price)} c/u</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQty(item.productId, -1)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <button onClick={() => updateQty(item.productId, 1)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                    <Plus size={14} />
                  </button>
                  <span className="w-20 text-right text-sm font-medium">{formatCurrency(item.price * item.quantity)}</span>
                  <button onClick={() => removeFromCart(item.productId)} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/10">
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descuento</label>
          <input
            type="number"
            min="0"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            className="input-field"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Método de pago</label>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="input-field">
            <option value="CASH">Efectivo</option>
            <option value="CARD">Tarjeta</option>
            <option value="TRANSFER">Transferencia</option>
          </select>
        </div>
      </div>

      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-1">
        <div className="flex justify-between text-sm"><span>Subtotal:</span><span>{formatCurrency(subtotal)}</span></div>
        {Number(discount) > 0 && (
          <div className="flex justify-between text-sm text-red-500"><span>Descuento:</span><span>-{formatCurrency(discount)}</span></div>
        )}
        <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-2">
          <span>Total:</span>
          <span className="text-green-600">{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancelar</button>
        <button
          onClick={handleSubmit}
          disabled={!patientId || cart.length === 0}
          className="btn-primary flex items-center gap-2"
        >
          <Save size={16} /> Registrar Venta
        </button>
      </div>
    </div>
  );
}
