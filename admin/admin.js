const storageKey = 'buvaAdminKey';
const loginView = document.querySelector('[data-login-view]');
const dashboard = document.querySelector('[data-dashboard]');
const ordersBody = document.querySelector('[data-orders-body]');
const productsBody = document.querySelector('[data-products-body]');
const detailDrawer = document.querySelector('.detail-drawer');
const detailContent = document.querySelector('[data-detail-content]');
const toast = document.querySelector('[data-toast]');
let adminKey = sessionStorage.getItem(storageKey) || '';
let activeStatus = '';
let activeSearch = '';
let activeProductState = 'all';
let activeProductSearch = '';
let lowStockOnly = false;
let productCategories = [];
let productsById = new Map();
let toastTimer;

const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
}[character]));

const formatPrice = (paise) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0
}).format(Number(paise) / 100);

const formatDate = (value) => new Intl.DateTimeFormat('en-IN', {
  dateStyle: 'medium', timeStyle: 'short'
}).format(new Date(value));

const titleCase = (value) => value.charAt(0).toUpperCase() + value.slice(1);
const statusBadge = (status) => `<span class="status status-${escapeHtml(status)}">${escapeHtml(status)}</span>`;

const showToast = (message) => {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
};

const showLogin = (message = '') => {
  adminKey = '';
  sessionStorage.removeItem(storageKey);
  dashboard.hidden = true;
  loginView.hidden = false;
  document.querySelectorAll('[data-admin-view]').forEach((button) => button.classList.toggle('active', button.dataset.adminView === 'orders'));
  document.querySelectorAll('[data-view-panel]').forEach((panel) => { panel.hidden = panel.dataset.viewPanel !== 'orders'; });
  closeDetail();
  const error = document.querySelector('[data-login-error]');
  error.textContent = message;
  error.hidden = !message;
  document.querySelector('#admin-key').focus();
};

const adminRequest = async (path, options = {}) => {
  const response = await fetch(path, {
    ...options,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-Admin-Key': adminKey, ...options.headers }
  });
  const payload = await response.json().catch(() => ({}));
  if (response.status === 401) {
    showLogin('The access key is incorrect.');
    throw new Error(payload.error || 'Access denied');
  }
  if (!response.ok) throw new Error(payload.error || `Request failed with status ${response.status}`);
  return payload;
};

const renderSummary = (summary) => {
  Object.entries(summary).forEach(([key, value]) => {
    const root = document.querySelector(`[data-stat="${key}"]`);
    if (!root) return;
    root.textContent = key === 'revenuePaise' ? formatPrice(value) : value;
  });
};

const renderOrders = (orders) => {
  if (!orders.length) {
    ordersBody.innerHTML = '<tr><td colspan="6" class="empty-state">No orders match this view.</td></tr>';
    return;
  }
  ordersBody.innerHTML = orders.map((order) => `
    <tr data-order-id="${escapeHtml(order.id)}" tabindex="0">
      <td><span class="order-number">${escapeHtml(order.orderNumber)}</span></td>
      <td class="customer-cell">${escapeHtml(order.customerName)}<span>${escapeHtml(order.email)}</span></td>
      <td>${escapeHtml(formatDate(order.createdAt))}</td>
      <td>${order.itemCount}</td>
      <td>${formatPrice(order.totalPaise)}</td>
      <td>${statusBadge(order.status)}</td>
    </tr>`).join('');
};

const loadOrders = async () => {
  ordersBody.innerHTML = '<tr><td colspan="6" class="empty-state">Loading orders…</td></tr>';
  const params = new URLSearchParams({ limit: '100' });
  if (activeStatus) params.set('status', activeStatus);
  if (activeSearch) params.set('search', activeSearch);
  const { orders, summary, meta } = await adminRequest(`/api/admin/orders?${params}`);
  loginView.hidden = true;
  dashboard.hidden = false;
  renderSummary(summary);
  renderOrders(orders);
  document.querySelector('[data-results-note]').textContent = `${meta.count} ${meta.count === 1 ? 'order' : 'orders'} shown`;
};

const renderProductSummary = (summary) => {
  Object.entries(summary).forEach(([key, value]) => {
    const root = document.querySelector(`[data-product-stat="${key}"]`);
    if (root) root.textContent = value;
  });
};

const renderProducts = (products) => {
  productsById = new Map(products.map((product) => [String(product.id), product]));
  if (!products.length) {
    productsBody.innerHTML = '<tr><td colspan="6" class="empty-state">No products match this view.</td></tr>';
    return;
  }
  productsBody.innerHTML = products.map((product) => {
    const stockClass = product.availableQuantity === 0 ? 'stock-zero' : product.availableQuantity <= product.lowStockThreshold ? 'stock-low' : '';
    return `<tr data-product-id="${escapeHtml(product.id)}" tabindex="0">
      <td><div class="product-cell"><img src="${escapeHtml(product.imageUrl || '/perfume.jpg')}" alt=""><div><strong>${escapeHtml(product.name)}</strong><span>${escapeHtml(product.slug)}</span></div></div></td>
      <td>${escapeHtml(product.sku)}</td>
      <td>${escapeHtml(product.categoryName)}</td>
      <td>${formatPrice(product.pricePaise)}</td>
      <td class="${stockClass}">${product.availableQuantity} <span class="sr-only">available</span></td>
      <td>${product.active ? '<span class="status status-delivered">Active</span>' : '<span class="status status-cancelled">Archived</span>'}</td>
    </tr>`;
  }).join('');
};

const loadProducts = async () => {
  productsBody.innerHTML = '<tr><td colspan="6" class="empty-state">Loading products…</td></tr>';
  const params = new URLSearchParams({ active: activeProductState, lowStock: String(lowStockOnly) });
  if (activeProductSearch) params.set('search', activeProductSearch);
  const { products, summary, meta } = await adminRequest(`/api/admin/products?${params}`);
  renderProductSummary(summary);
  renderProducts(products);
  document.querySelector('[data-product-results-note]').textContent = `${meta.count} ${meta.count === 1 ? 'product' : 'products'} shown`;
};

const ensureProductCategories = async () => {
  if (productCategories.length) return;
  const result = await adminRequest('/api/admin/catalog/categories');
  productCategories = result.categories;
};

const productFormMarkup = (product = null) => {
  const editing = Boolean(product);
  const value = (key, fallback = '') => escapeHtml(product?.[key] ?? fallback);
  const categoryOptions = productCategories.map((category) => `<option value="${escapeHtml(category.slug)}"${category.slug === product?.categorySlug ? ' selected' : ''}>${escapeHtml(category.name)}${category.active ? '' : ' · archived'}</option>`).join('');
  const familyOptions = ['floral', 'fresh', 'woody', 'sets'].map((family) => `<option value="${family}"${family === product?.scentFamily ? ' selected' : ''}>${titleCase(family)}</option>`).join('');
  return `
    <div class="detail-head"><div><p class="eyebrow">Catalogue</p><h2 id="detail-title">${editing ? 'Edit product' : 'New product'}</h2></div><button class="close-button" type="button" data-detail-close aria-label="Close">×</button></div>
    <div class="detail-body"><form class="product-form" data-product-form data-product-id="${editing ? escapeHtml(product.id) : ''}">
      <div class="product-form-grid">
        <label class="full">Product name<input name="name" value="${value('name')}" required minlength="2" maxlength="140"></label>
        <label>Slug<input name="slug" value="${value('slug')}" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" maxlength="100"></label>
        <label>SKU<input name="sku" value="${value('sku')}" required pattern="[A-Za-z0-9][A-Za-z0-9-]*" maxlength="60"></label>
        <label>Category<select name="categorySlug" required>${categoryOptions}</select></label>
        <label>Scent family<select name="scentFamily" required>${familyOptions}</select></label>
        <label>Concentration<input name="concentration" value="${value('concentration', 'Eau de Parfum')}" required maxlength="80"></label>
        <label>Size · ml<input name="sizeMl" type="number" value="${value('sizeMl', 50)}" min="1" max="10000" required></label>
        <label>Price · ₹<input name="price" type="number" value="${product ? product.pricePaise / 100 : ''}" min="0" step="0.01" required></label>
        <label>Compare-at price · ₹<input name="compareAtPrice" type="number" value="${product?.compareAtPricePaise ? product.compareAtPricePaise / 100 : ''}" min="0" step="0.01"></label>
        <label>Inventory quantity<input name="quantity" type="number" value="${value('quantity', 0)}" min="${product?.reservedQuantity || 0}" max="1000000" required></label>
        <label>Low-stock threshold<input name="lowStockThreshold" type="number" value="${value('lowStockThreshold', 5)}" min="0" max="1000000" required></label>
        <label class="full">Short description<input name="shortDescription" value="${value('shortDescription')}" maxlength="240"></label>
        <label class="full">Description<textarea name="description" maxlength="4000">${value('description')}</textarea></label>
        <label class="full">Image URL<input name="imageUrl" value="${value('imageUrl', '/perfume.jpg')}" required maxlength="500"></label>
        <label class="full">Image alt text<input name="imageAlt" value="${value('imageAlt')}" maxlength="240"></label>
      </div>
      ${editing && product.reservedQuantity ? `<p class="product-form-help">${product.reservedQuantity} units are currently reserved; inventory cannot be set below this amount.</p>` : ''}
      <div class="checkbox-row">
        <label><input name="active" type="checkbox"${product?.active ?? true ? ' checked' : ''}> Available in storefront</label>
        <label><input name="featured" type="checkbox"${product?.featured ? ' checked' : ''}> Featured</label>
      </div>
      <p class="product-form-error" data-product-form-error role="alert" hidden></p>
      <div class="product-form-actions"><button class="secondary-action" type="button" data-detail-close>Cancel</button><button class="status-action" type="submit">${editing ? 'Save changes' : 'Create product'}</button></div>
    </form></div>`;
};

const openProductForm = async (product = null) => {
  try {
    await ensureProductCategories();
    detailContent.innerHTML = productFormMarkup(product);
    document.body.classList.add('detail-open');
    detailDrawer.setAttribute('aria-hidden', 'false');
    document.querySelector('[name="name"]')?.focus();
  } catch (error) {
    showToast(error.message);
  }
};

const renderDetail = (order, allowedTransitions) => {
  const address = order.shippingAddress || {};
  const addressLines = [address.recipientName, address.line1, address.line2, `${address.city || ''}, ${address.state || ''} ${address.postalCode || ''}`, address.countryCode]
    .filter(Boolean).map(escapeHtml).join('<br>');
  const discount = order.discountPaise > 0
    ? `<div><span>Discount${order.couponCode ? ` · ${escapeHtml(order.couponCode)}` : ''}</span><strong>−${formatPrice(order.discountPaise)}</strong></div>` : '';
  const actions = allowedTransitions.length
    ? allowedTransitions.map((status) => `<button class="status-action${status === 'cancelled' || status === 'returned' ? ' danger' : ''}" type="button" data-next-status="${status}" data-order-id="${escapeHtml(order.id)}">Mark ${escapeHtml(status)}</button>`).join('')
    : '<p class="address">This order has reached a final status.</p>';

  detailContent.innerHTML = `
    <div class="detail-head"><div><p class="eyebrow">Order details</p><h2 id="detail-title">${escapeHtml(order.orderNumber)}</h2></div><button class="close-button" type="button" data-detail-close aria-label="Close">×</button></div>
    <div class="detail-body">
      <section class="detail-section"><h3>Overview</h3><div class="detail-grid">
        <div><span>Status</span><strong>${statusBadge(order.status)}</strong></div>
        <div><span>Placed</span><strong>${escapeHtml(formatDate(order.createdAt))}</strong></div>
        <div><span>Payment</span><strong>${escapeHtml(titleCase(order.paymentMethod))} · ${escapeHtml(order.paymentStatus)}</strong></div>
        <div><span>Contact</span><strong>${escapeHtml(order.phone)}</strong></div>
        <div><span>Customer</span><strong>${escapeHtml(order.customerName)}</strong></div>
        <div><span>Email</span><strong>${escapeHtml(order.email)}</strong></div>
      </div></section>
      <section class="detail-section"><h3>Delivery</h3><p class="address">${addressLines}</p></section>
      <section class="detail-section"><h3>Items</h3>${order.items.map((item) => `<div class="line-item"><div><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.sku)} · Qty ${item.quantity}</span></div><strong>${formatPrice(item.lineTotalPaise)}</strong></div>`).join('')}</section>
      <section class="detail-section totals"><h3>Totals</h3>
        <div><span>Subtotal</span><strong>${formatPrice(order.subtotalPaise)}</strong></div>${discount}
        <div><span>Delivery</span><strong>${order.shippingPaise ? formatPrice(order.shippingPaise) : 'Complimentary'}</strong></div>
        <div class="grand-total"><span>Total</span><strong>${formatPrice(order.totalPaise)}</strong></div>
      </section>
      ${order.customerNotes ? `<section class="detail-section"><h3>Customer notes</h3><p class="address">${escapeHtml(order.customerNotes)}</p></section>` : ''}
      <section class="detail-section"><h3>Update status</h3><div class="status-actions">${actions}</div></section>
    </div>`;
};

const openOrder = async (id) => {
  detailContent.innerHTML = '<p class="empty-state">Loading order…</p>';
  document.body.classList.add('detail-open');
  detailDrawer.setAttribute('aria-hidden', 'false');
  try {
    const { order, allowedTransitions } = await adminRequest(`/api/admin/orders/${encodeURIComponent(id)}`);
    renderDetail(order, allowedTransitions);
    document.querySelector('[data-detail-close]')?.focus();
  } catch (error) {
    showToast(error.message);
    closeDetail();
  }
};

const closeDetail = () => {
  document.body.classList.remove('detail-open');
  detailDrawer.setAttribute('aria-hidden', 'true');
};

const switchAdminView = async (view) => {
  document.querySelectorAll('[data-admin-view]').forEach((button) => button.classList.toggle('active', button.dataset.adminView === view));
  document.querySelectorAll('[data-view-panel]').forEach((panel) => { panel.hidden = panel.dataset.viewPanel !== view; });
  closeDetail();
  if (view === 'products') await loadProducts();
};

document.querySelector('[data-login-form]').addEventListener('submit', async (event) => {
  event.preventDefault();
  const error = document.querySelector('[data-login-error]');
  error.hidden = true;
  adminKey = new FormData(event.currentTarget).get('key').trim();
  try {
    await loadOrders();
    sessionStorage.setItem(storageKey, adminKey);
    event.currentTarget.reset();
  } catch (requestError) {
    if (!error.hidden) return;
    error.textContent = requestError.message;
    error.hidden = false;
  }
});

document.querySelector('[data-search-form]').addEventListener('submit', async (event) => {
  event.preventDefault();
  activeSearch = new FormData(event.currentTarget).get('search').trim();
  try { await loadOrders(); } catch (error) { showToast(error.message); }
});

document.querySelector('[data-product-search-form]').addEventListener('submit', async (event) => {
  event.preventDefault();
  activeProductSearch = new FormData(event.currentTarget).get('search').trim();
  try { await loadProducts(); } catch (error) { showToast(error.message); }
});

document.addEventListener('submit', async (event) => {
  const form = event.target.closest('[data-product-form]');
  if (!form) return;
  event.preventDefault();
  const fields = new FormData(form);
  const errorRoot = form.querySelector('[data-product-form-error]');
  const submit = form.querySelector('[type="submit"]');
  errorRoot.hidden = true;
  submit.disabled = true;
  submit.textContent = form.dataset.productId ? 'Saving…' : 'Creating…';
  const compareAtPrice = fields.get('compareAtPrice').trim();
  const payload = {
    name: fields.get('name'),
    slug: fields.get('slug'),
    sku: fields.get('sku'),
    categorySlug: fields.get('categorySlug'),
    scentFamily: fields.get('scentFamily'),
    concentration: fields.get('concentration'),
    sizeMl: Number(fields.get('sizeMl')),
    pricePaise: Math.round(Number(fields.get('price')) * 100),
    compareAtPricePaise: compareAtPrice ? Math.round(Number(compareAtPrice) * 100) : null,
    quantity: Number(fields.get('quantity')),
    lowStockThreshold: Number(fields.get('lowStockThreshold')),
    shortDescription: fields.get('shortDescription'),
    description: fields.get('description'),
    imageUrl: fields.get('imageUrl'),
    imageAlt: fields.get('imageAlt'),
    active: fields.has('active'),
    featured: fields.has('featured')
  };
  const editing = Boolean(form.dataset.productId);
  try {
    const result = await adminRequest(editing ? `/api/admin/products/${form.dataset.productId}` : '/api/admin/products', {
      method: editing ? 'PATCH' : 'POST',
      body: JSON.stringify(payload)
    });
    closeDetail();
    await loadProducts();
    showToast(`${result.product.name} ${editing ? 'updated' : 'created'}`);
  } catch (error) {
    errorRoot.textContent = error.message;
    errorRoot.hidden = false;
    submit.disabled = false;
    submit.textContent = editing ? 'Save changes' : 'Create product';
  }
});

document.addEventListener('click', async (event) => {
  if (event.target.closest('[data-logout]')) return showLogin();
  if (event.target.closest('[data-detail-close]')) return closeDetail();
  const viewButton = event.target.closest('[data-admin-view]');
  if (viewButton) {
    try { await switchAdminView(viewButton.dataset.adminView); } catch (error) { showToast(error.message); }
    return;
  }
  if (event.target.closest('[data-product-create]')) {
    await openProductForm();
    return;
  }
  const productState = event.target.closest('[data-product-active]');
  if (productState) {
    document.querySelectorAll('[data-product-active]').forEach((button) => button.classList.remove('active'));
    productState.classList.add('active');
    activeProductState = productState.dataset.productActive;
    try { await loadProducts(); } catch (error) { showToast(error.message); }
    return;
  }
  if (event.target.closest('[data-product-low-stock]')) {
    lowStockOnly = !lowStockOnly;
    event.target.closest('[data-product-low-stock]').classList.toggle('active', lowStockOnly);
    try { await loadProducts(); } catch (error) { showToast(error.message); }
    return;
  }
  if (event.target.closest('[data-refresh]')) {
    try { await loadOrders(); showToast('Orders refreshed'); } catch (error) { showToast(error.message); }
    return;
  }
  const filter = event.target.closest('[data-status]');
  if (filter) {
    document.querySelectorAll('[data-status]').forEach((button) => button.classList.remove('active'));
    filter.classList.add('active');
    activeStatus = filter.dataset.status;
    try { await loadOrders(); } catch (error) { showToast(error.message); }
    return;
  }
  const action = event.target.closest('[data-next-status]');
  if (action) {
    action.disabled = true;
    try {
      const { order, allowedTransitions } = await adminRequest(`/api/admin/orders/${encodeURIComponent(action.dataset.orderId)}/status`, {
        method: 'PATCH', body: JSON.stringify({ status: action.dataset.nextStatus })
      });
      renderDetail(order, allowedTransitions);
      await loadOrders();
      showToast(`Order marked ${order.status}`);
    } catch (error) { action.disabled = false; showToast(error.message); }
    return;
  }
  const row = event.target.closest('[data-order-id]');
  if (row) {
    openOrder(row.dataset.orderId);
    return;
  }
  const productRow = event.target.closest('[data-product-id]');
  if (productRow) openProductForm(productsById.get(productRow.dataset.productId));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && document.body.classList.contains('detail-open')) closeDetail();
  if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[data-order-id]')) {
    event.preventDefault();
    openOrder(event.target.dataset.orderId);
  }
  if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[data-product-id]')) {
    event.preventDefault();
    openProductForm(productsById.get(event.target.dataset.productId));
  }
});

if (adminKey) loadOrders().catch((error) => showLogin(error.message));
