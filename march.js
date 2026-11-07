// State Keranjang Belanja
let cart = [];

// DOM Elements
const openCartBtn = document.getElementById('openCartBtn');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartOverlay = document.getElementById('cartOverlay');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartBadgeCount = document.getElementById('cartBadgeCount');
const cartDrawerCount = document.getElementById('cartDrawerCount');
const cartGrandTotal = document.getElementById('cartGrandTotal');
const proceedCheckoutBtn = document.getElementById('proceedCheckoutBtn');

const checkoutModal = document.getElementById('checkoutModal');
const closeCheckoutModal = document.getElementById('closeCheckoutModal');
const checkoutForm = document.getElementById('checkoutForm');

// Fungsi Modal & Drawer Keranjang
function openCartDrawer() {
    if (cartOverlay) {
        cartOverlay.style.display = 'block';
        renderCart();
    }
}

function closeCartDrawer() {
    if (cartOverlay) {
        cartOverlay.style.display = 'none';
    }
}

openCartBtn?.addEventListener('click', openCartDrawer);
closeCartBtn?.addEventListener('click', closeCartDrawer);

cartOverlay?.addEventListener('click', (e) => {
    if (e.target === cartOverlay) closeCartDrawer();
});

// Fitur Tambah Keranjang Biasa
function addToCart(name, price, unit) {
    const existingIndex = cart.findIndex(item => item.name === name);
    if (existingIndex > -1) {
        cart[existingIndex].qty += 1;
    } else {
        cart.push({ name, price, unit, qty: 1 });
    }
    updateCartUI();
    showToast(`"${name}" berhasil ditambahkan ke keranjang!`);
}

function buyNow(name, price, unit) {
    addToCart(name, price, unit);
    openCartDrawer();
}

// Fitur Tambah Keranjang dengan Pilihan Rasa/Varian
function addToCartWithFlavor(baseName, price, unit, selectId) {
    const flavorSelect = document.getElementById(selectId);
    const selectedFlavor = flavorSelect ? flavorSelect.value : '';
    const fullName = selectedFlavor ? `${baseName} (${selectedFlavor})` : baseName;

    addToCart(fullName, price, unit);
}

function buyNowWithFlavor(baseName, price, unit, selectId) {
    addToCartWithFlavor(baseName, price, unit, selectId);
    openCartDrawer();
}

function updateQty(index, change) {
    cart[index].qty += change;
    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
    }
    updateCartUI();
    renderCart();
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

    if (cartBadgeCount) cartBadgeCount.textContent = totalItems;
    if (cartDrawerCount) cartDrawerCount.textContent = totalItems;
}

function renderCart() {
    if (!cartItemsContainer || !cartGrandTotal) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="text-center" style="padding: 40px 0; color: #64748b;">
                <i class="fa-solid fa-cart-arrow-down" style="font-size: 2.5rem; margin-bottom: 10px;"></i>
                <p>Keranjang belanja masih kosong</p>
            </div>
        `;
        cartGrandTotal.textContent = 'Rp 0';
        return;
    }

    let html = '';
    let grandTotal = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.qty;
        grandTotal += itemTotal;
        html += `
            <div class="cart-item">
                <div>
                    <strong>${item.name}</strong><br>
                    <small style="color: #64748b;">${item.unit} - Rp ${item.price.toLocaleString('id-ID')}</small>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <button onclick="updateQty(${index}, -1)" style="padding: 2px 8px; border: 1px solid #cbd5e1; background: white; border-radius: 4px; cursor: pointer;">-</button>
                    <span>${item.qty}</span>
                    <button onclick="updateQty(${index}, 1)" style="padding: 2px 8px; border: 1px solid #cbd5e1; background: white; border-radius: 4px; cursor: pointer;">+</button>
                </div>
            </div>
        `;
    });

    cartItemsContainer.innerHTML = html;
    cartGrandTotal.textContent = `Rp ${grandTotal.toLocaleString('id-ID')}`;
}

// Fitur Checkout WhatsApp
proceedCheckoutBtn?.addEventListener('click', () => {
    if (cart.length === 0) {
        showToast('Keranjang Anda masih kosong!');
        return;
    }
    closeCartDrawer();
    if (checkoutModal) checkoutModal.style.display = 'block';
});

closeCheckoutModal?.addEventListener('click', () => {
    if (checkoutModal) checkoutModal.style.display = 'none';
});

checkoutForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('buyerName').value;
    const phone = document.getElementById('buyerPhone').value;
    const payment = document.getElementById('paymentMethod').value;
    const notes = document.getElementById('buyerNotes').value;

    let orderListText = '';
    let total = 0;

    cart.forEach((item, i) => {
        const subtotal = item.price * item.qty;
        total += subtotal;
        orderListText += `${i + 1}. ${item.name} (${item.qty}x) - Rp ${subtotal.toLocaleString('id-ID')}\n`;
    });

    const waMessage =
        `*PESANAN BARU - TI SOLUTION AGENCY*
----------------------------------
*Data Pemesan:*
- Nama: ${name}
- No. HP: ${phone}
- Metode Bayar: ${payment}

*Rincian Pesanan:*
${orderListText}
*Total Bayar: Rp ${total.toLocaleString('id-ID')}*

*Catatan:* ${notes || '-'}
----------------------------------
Mohon konfirmasi pesanan saya. Terima kasih!`;

    const encodedMessage = encodeURIComponent(waMessage);
    const waNumber = '6283152892866'; // Nomor WhatsApp Admin Toko

    window.open(`https://wa.me/${waNumber}?text=${encodedMessage}`, '_blank');

    // Reset Keranjang & Form
    cart = [];
    updateCartUI();
    if (checkoutModal) checkoutModal.style.display = 'none';
    checkoutForm.reset();
});

// Fitur Filter Tab 4 Unit
const filterBtns = document.querySelectorAll('.filter-btn');
const unitGroups = document.querySelectorAll('.unit-group');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const selectedUnit = btn.getAttribute('data-unit');

        unitGroups.forEach(group => {
            if (selectedUnit === 'all' || group.getAttribute('data-unit-content') === selectedUnit) {
                group.style.display = 'block';
            } else {
                group.style.display = 'none';
            }
        });
    });
});

// Notifikasi Toast
function showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}