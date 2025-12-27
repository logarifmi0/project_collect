const products = [
    {
        id: 1,
        name: "Кирпич керамический полнотелый М150",
        price: 28,
        image: "../styles/ceramic.jpg",
        category: "ceramic",
        brand: "braer",
        rating: 4.5,
        inStock: true,
        link: "items.html"
    },
    {
        id: 2,
        name: "Кирпич силикатный М125",
        price: 22,
        image: "../styles/ceramic1.jpg",
        category: "silicate",
        brand: "grasse",
        rating: 4.2,
        inStock: true,
        link: "items.html"
    },
    {
        id: 3,
        name: "Кирпич клинкерный",
        price: 45,
        image: "../styles/ceramic2.jpg",
        category: "clinker",
        brand: "wienerberger",
        rating: 4.8,
        inStock: true,
        link: "items.html"
    },
    {
        id: 4,
        name: "Кирпич облицовочный красный",
        price: 35,
        image: "../styles/ceramic3.jpg",
        category: "facing",
        brand: "braer",
        rating: 4.3,
        inStock: false,
        link: "items.html"
    }
];

let cart = JSON.parse(localStorage.getItem('cart')) || [];

function displayProducts(productsToShow = products) {
    const container = document.getElementById('products-container');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    if (productsToShow.length === 0) {
        container.innerHTML = '<p class="no-products">Товары не найдены</p>';
        return;
    }
    
    productsToShow.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <a href="${product.link}" class="product-link">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-price">${product.price} ₽/шт</div>
                    <div class="product-meta">
                        <span class="rating">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5-Math.floor(product.rating))} (${product.rating})</span>
                        <span class="in-stock ${product.inStock ? 'available' : 'unavailable'}">
                            ${product.inStock ? '✓ В наличии' : '✗ Нет в наличии'}
                        </span>
                    </div>
                    <button class="btn-primary" onclick="event.preventDefault(); addToCartFromCatalog(${product.id})" ${!product.inStock ? 'disabled' : ''}>
                        ${product.inStock ? 'Добавить в корзину' : 'Нет в наличии'}
                    </button>
                </div>
            </a>
        `;
        container.appendChild(productCard);
    });
}

function applyFilters() {
    const categoryFilter = document.getElementById('category').value;
    const brandFilter = document.getElementById('brand').value;
    const priceFilter = document.getElementById('price').value;
    
    let filteredProducts = products;
    
    if (categoryFilter) {
        filteredProducts = filteredProducts.filter(product => product.category === categoryFilter);
    }
    
    if (brandFilter) {
        filteredProducts = filteredProducts.filter(product => product.brand === brandFilter);
    }
    
    if (priceFilter) {
        filteredProducts = filteredProducts.filter(product => product.price <= parseFloat(priceFilter));
    }
    
    displayProducts(filteredProducts);
}

function addToCartFromCatalog(productId) {
    const product = products.find(p => p.id === productId);
    if (product && product.inStock) {
        addToCart(productId, 1, product.price, product.name, product.image);
        showNotification(`Товар "${product.name}" добавлен в корзину!`);
    }
}

function addToCart(productId, quantity, price, productName, productImage) {
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: price,
            image: productImage,
            quantity: quantity
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    if (document.getElementById('cart-items')) {
        displayCartItems();
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    displayCartItems();
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            displayCartItems();
        }
    }
}

function updateCartCount() {
    const cartCountElements = document.querySelectorAll('#cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
}

function displayCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCart = document.getElementById('empty-cart');
    const cartSummary = document.getElementById('cart-summary');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        emptyCart.style.display = 'block';
        cartItemsContainer.style.display = 'none';
        cartSummary.style.display = 'none';
        return;
    }
    
    emptyCart.style.display = 'none';
    cartItemsContainer.style.display = 'block';
    cartSummary.style.display = 'block';
    
    cartItemsContainer.innerHTML = '';
    
    let totalAmount = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        totalAmount += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" width="80" height="80">
            <div class="item-info">
                <h3>${item.name}</h3>
                <p>${item.price} ₽/шт</p>
            </div>
            <div class="item-quantity">
                <button onclick="updateQuantity(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateQuantity(${item.id}, 1)">+</button>
            </div>
            <div class="item-total">${itemTotal} ₽</div>
            <button class="remove-btn" onclick="removeFromCart(${item.id})">×</button>
        `;
        cartItemsContainer.appendChild(cartItem);
    });
    
    document.getElementById('summary-total').textContent = totalAmount;
}

function clearCart() {
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    displayCartItems();
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--primary-color);
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10000;
        box-shadow: 0 3px 10px rgba(0,0,0,0.2);
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function addToCartFromProductPage() {
    const quantity = parseInt(document.getElementById('quantity').value) || 1;
    const product = products[0];
    if (product) {
        addToCart(product.id, quantity, product.price, product.name, product.image);
        showNotification(`Товар "${product.name}" в количестве ${quantity} шт. добавлен в корзину!`);
    }
}

function updateTotalPrice() {
    const quantityInput = document.getElementById('quantity');
    if (quantityInput) {
        quantityInput.addEventListener('input', function() {
            const quantity = parseInt(this.value) || 1;
            const price = 28; 
            const totalElement = document.getElementById('total');
            if (totalElement) {
                totalElement.textContent = quantity * price;
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('products-container')) {
        displayProducts();
    }
    
    if (document.getElementById('cart-items')) {
        displayCartItems();
    }
    
    updateCartCount();
    
    updateTotalPrice();
});