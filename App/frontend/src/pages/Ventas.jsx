import { useCallback, useEffect, useMemo, useState } from 'react';
import { useCrud } from '../hooks/useCrud';
import { api } from '../api';
import { formatMoney } from '../utils/format';
import Tabla from '../components/Tabla';
import Formulario, { Campo, FilaCampos } from '../components/Formulario';

export default function Ventas() {
  const { rows, loading, error, save, remove, setError } = useCrud(api.sales);
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [cartItems, setCartItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const loadProducts = useCallback(async () => {
    try {
      setProducts(await api.products.list());
    } catch {
      setProducts([]);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const selectedProduct = products.find((product) => product.id === Number(productId));
  const selectedCartItem = cartItems.find((item) => item.productId === Number(productId));
  const quantityAlreadyInCart = selectedCartItem?.quantity ?? 0;
  const availableStock = selectedProduct
    ? Math.max(0, Number(selectedProduct.stock) - quantityAlreadyInCart)
    : 0;
  const unitPrice = selectedProduct ? Number(selectedProduct.price) : 0;
  const selectedProductSubtotal = unitPrice * Number(quantity || 0);

  const cartTotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.unitPrice * item.quantity, 0),
    [cartItems]
  );

  const cartUnitCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems]
  );

  const totalVentas = useMemo(
    () => rows.reduce((acc, sale) => acc + Number(sale.total || 0), 0),
    [rows]
  );

  // Agrega el producto al carrito; todavía no crea una venta en la base de datos.
  const addProductToCart = (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!productId) return setError('Debes seleccionar un producto');

    const productQuantity = Number(quantity);
    if (!Number.isInteger(productQuantity) || productQuantity < 1) {
      return setError('La cantidad debe ser un entero mayor o igual a 1');
    }

    if (!selectedProduct) return setError('El producto seleccionado no existe');

    if (productQuantity > availableStock) {
      return setError(
        `Stock insuficiente para ${selectedProduct.name}. Disponible para agregar: ${availableStock}`
      );
    }

    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.productId === selectedProduct.id
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item.productId === selectedProduct.id
            ? { ...item, quantity: item.quantity + productQuantity }
            : item
        );
      }

      return [
        ...currentItems,
        {
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          quantity: productQuantity,
          unitPrice
        }
      ];
    });

    setProductId('');
    setQuantity('1');
    setSuccessMessage(`${selectedProduct.name} se agregó al carrito.`);
  };

  const removeCartItem = (selectedProductId) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.productId !== selectedProductId)
    );
    setSuccessMessage('Producto retirado del carrito.');
    setError('');
  };

  const clearCart = () => {
    setCartItems([]);
    setSuccessMessage('Se vació el carrito.');
    setError('');
  };

  // Envía todos los artículos en una sola petición para registrar una única venta.
  const registerSale = async () => {
    setError('');
    setSuccessMessage('');

    if (cartItems.length === 0) {
      return setError('Agrega al menos un producto antes de registrar la venta');
    }

    const saleDescription = cartItems
      .map((item) => `${item.productName} x ${item.quantity}`)
      .join('\n');
    const confirmationMessage =
      `Confirmar venta\n\n${saleDescription}\n\nTotal: ${formatMoney(cartTotal)}`;

    if (!confirm(confirmationMessage)) return;

    try {
      setSaving(true);
      const createdSale = await save({
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      });

      setCartItems([]);
      setProductId('');
      setQuantity('1');
      setSuccessMessage(
        `Venta #${createdSale.id} registrada correctamente con ${cartItems.length} producto(s).`
      );
      await loadProducts();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (sale) => {
    if (!confirm(`¿Eliminar la venta #${sale.id}? Se restaurará el inventario de sus productos.`)) {
      return;
    }

    try {
      await remove(sale.id);
      await loadProducts();
      setSuccessMessage(`Venta #${sale.id} eliminada y su inventario restaurado.`);
      setError('');
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  const columns = [
    { key: 'id', header: 'ID', cellClassName: 'muted' },
    {
      key: 'products',
      header: 'Productos',
      render: (sale) => {
        const saleItems = sale.items?.length
          ? sale.items
          : sale.productName
            ? [{ productName: sale.productName, quantity: sale.quantity }]
            : [];

        return (
          <div>
            {saleItems.map((item, index) => (
              <div key={`${sale.id}-${item.productId ?? index}`}>
                {item.productName || 'Producto'} <span className="muted">× {item.quantity}</span>
              </div>
            ))}
          </div>
        );
      }
    },
    {
      key: 'units',
      header: 'Unidades',
      className: 'right',
      render: (sale) =>
        sale.items?.length
          ? sale.items.reduce((total, item) => total + Number(item.quantity || 0), 0)
          : Number(sale.quantity || 0)
    },
    {
      key: 'total',
      header: 'Total',
      className: 'right',
      render: (sale) => formatMoney(sale.total)
    },
    { key: 'createdAt', header: 'Fecha', cellClassName: 'muted' },
    {
      key: 'actions',
      header: '',
      render: (sale) => (
        <div className="btn-row">
          <button className="btn btn-sm btn-danger" onClick={() => onDelete(sale)}>
            Eliminar
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="panel">
      <h2>Ventas</h2>
      <p className="sub">
        Agrega varios productos al carrito y regístralos juntos en una sola venta. El inventario se actualiza al confirmar.
      </p>

      {error && <div className="error-msg">{error}</div>}
      {successMessage && <div className="success-msg">{successMessage}</div>}

      <div className="panel" style={{ marginBottom: 22 }}>
        <h3 style={{ margin: '0 0 14px' }}>Agregar productos</h3>
        <Formulario
          onSubmit={addProductToCart}
          submitLabel="Registrar producto"
          submitStyle={{ width: '100%' }}
          saving={saving}
        >
          <FilaCampos>
            <Campo label="Producto *">
              <select value={productId} onChange={(event) => setProductId(event.target.value)}>
                <option value="">Selecciona un producto...</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - {formatMoney(product.price)} (stock: {product.stock})
                  </option>
                ))}
              </select>
            </Campo>
            <Campo label="Cantidad *">
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
              />
            </Campo>
          </FilaCampos>

          <div className="field-row" style={{ alignItems: 'center' }}>
            <div className="muted" style={{ fontSize: 13 }}>
              Precio unitario:{' '}
              <strong style={{ color: 'var(--text)' }}>{formatMoney(unitPrice)}</strong>
              {selectedProduct && (
                <span> · Disponible para agregar: {availableStock}</span>
              )}
            </div>
            <div className="right">
              <span className="total-ventas">
                Subtotal del producto: {formatMoney(selectedProductSubtotal)}
              </span>
            </div>
          </div>
        </Formulario>

        <div style={{ marginTop: 22 }}>
          <div className="toolbar">
            <strong>Productos de esta venta</strong>
            <span className="muted">
              {cartItems.length} producto(s) · {cartUnitCount} unidad(es)
            </span>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th className="right">Cantidad</th>
                  <th className="right">Precio unitario</th>
                  <th className="right">Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cartItems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty">
                      Todavía no has agregado productos a esta venta.
                    </td>
                  </tr>
                ) : (
                  cartItems.map((item) => (
                    <tr key={item.productId}>
                      <td>{item.productName}</td>
                      <td className="right">{item.quantity}</td>
                      <td className="right">{formatMoney(item.unitPrice)}</td>
                      <td className="right">
                        {formatMoney(item.unitPrice * item.quantity)}
                      </td>
                      <td>
                        <div className="btn-row">
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => removeCartItem(item.productId)}
                            disabled={saving}
                          >
                            Quitar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div
            className="field-row"
            style={{ alignItems: 'center', marginTop: 16 }}
          >
            <div>
              {cartItems.length > 0 && (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={clearCart}
                  disabled={saving}
                >
                  Vaciar carrito
                </button>
              )}
            </div>
            <div className="right">
              <span className="total-ventas">Total de la venta: {formatMoney(cartTotal)}</span>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 14 }}
            onClick={registerSale}
            disabled={saving || cartItems.length === 0}
          >
            {saving ? 'Registrando venta...' : 'Registrar venta'}
          </button>
        </div>
      </div>

      <div className="toolbar">
        <span className="muted">
          {rows.length} venta(s) registrada(s) · Total acumulado:{' '}
          <strong className="total-ventas" style={{ padding: '3px 9px' }}>
            {formatMoney(totalVentas)}
          </strong>
        </span>
      </div>

      <Tabla
        columns={columns}
        rows={rows}
        loading={loading}
        empty="Aún no hay ventas registradas"
      />
    </div>
  );
}
