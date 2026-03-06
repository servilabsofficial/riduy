import { formatCurrency, formatDateTime, getPaymentMethodLabel } from '../../utils/formatters';

export default function SaleTicket({ sale }) {
  return (
    <div className="space-y-4">
      <div className="text-center border-b border-dashed border-gray-300 dark:border-gray-700 pb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">OptiVision</h3>
        <p className="text-sm text-gray-500">Ticket de Venta</p>
        <p className="text-xs text-gray-400 mt-1">{formatDateTime(sale.createdAt)}</p>
      </div>

      <div className="space-y-1 text-sm">
        <p><span className="text-gray-500">Paciente:</span> <span className="font-medium text-gray-900 dark:text-white">{sale.patient?.firstName} {sale.patient?.lastName}</span></p>
        <p><span className="text-gray-500">Vendedor:</span> <span className="text-gray-700 dark:text-gray-300">{sale.user?.name}</span></p>
        <p><span className="text-gray-500">Pago:</span> <span className="text-gray-700 dark:text-gray-300">{getPaymentMethodLabel(sale.paymentMethod)}</span></p>
      </div>

      <div className="border-t border-dashed border-gray-300 dark:border-gray-700 pt-3">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-xs">
              <th className="text-left pb-1">Producto</th>
              <th className="text-right pb-1">Cant.</th>
              <th className="text-right pb-1">Precio</th>
              <th className="text-right pb-1">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {sale.items?.map((item) => (
              <tr key={item.id} className="text-gray-700 dark:text-gray-300">
                <td className="py-0.5">{item.product?.name}</td>
                <td className="text-right">{item.quantity}</td>
                <td className="text-right">{formatCurrency(item.price)}</td>
                <td className="text-right">{formatCurrency(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-dashed border-gray-300 dark:border-gray-700 pt-3 space-y-1 text-sm">
        <div className="flex justify-between"><span className="text-gray-500">Subtotal:</span><span>{formatCurrency(sale.subtotal)}</span></div>
        {sale.discount > 0 && (
          <div className="flex justify-between text-red-500"><span>Descuento:</span><span>-{formatCurrency(sale.discount)}</span></div>
        )}
        <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
          <span>Total:</span>
          <span className="text-green-600">{formatCurrency(sale.total)}</span>
        </div>
      </div>

      <div className="text-center text-xs text-gray-400 border-t border-dashed border-gray-300 dark:border-gray-700 pt-3">
        Gracias por su preferencia
      </div>
    </div>
  );
}
