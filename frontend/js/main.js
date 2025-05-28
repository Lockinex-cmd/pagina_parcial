// Variables globales
let cart = [];
let products = [];

// Inicialización cuando el DOM está cargado
document.addEventListener('DOMContentLoaded', function() {
    // Cargar productos
    loadProducts();
    
    // Crear elementos del carrito si no existen
    createCartElements();

    // Configurar eventos
    setupEventListeners();
    
    // Cargar carrito desde localStorage si existe
    loadCartFromStorage();

    // Handle Google Auth Callback
    const urlParams = new URLSearchParams(window.location.search);
    const googleToken = urlParams.get('google_auth_token');
    const googleUserString = urlParams.get('google_user');

    if (googleToken && googleUserString) {
        try {
            const googleUser = JSON.parse(decodeURIComponent(googleUserString));
            localStorage.setItem('authToken', googleToken);
            localStorage.setItem('currentUser', JSON.stringify(googleUser)); // User object from backend
            showAlert('Login with Google successful!', 'success');
            
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
            
            updateLoginStatusUI();
            showSection('inicio'); // Or user dashboard
        } catch (e) {
            console.error("Error processing Google auth callback:", e);
            showAlert('Error processing Google login. Please try again.', 'error');
        }
    } else {
        const loginError = urlParams.get('login_error');
        const message = urlParams.get('message');
        if (loginError) {
            showAlert(message || 'Google login failed.', 'error');
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    // Actualizar UI de estado de login al cargar la página (after potential Google callback)
    updateLoginStatusUI();
});

// Función para crear los elementos del carrito en el DOM
function createCartElements() {
    // Botón flotante del carrito
    if (!document.querySelector('.cart-btn')) {
        const cartBtn = document.createElement('button');
        cartBtn.className = 'cart-btn';
        cartBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> <span class="cart-count">0</span>';
        document.body.appendChild(cartBtn);
    }
    
    // Modal del carrito
    if (!document.querySelector('.cart-modal')) {
        const cartModal = document.createElement('div');
        cartModal.className = 'cart-modal';
        cartModal.innerHTML = `
            <div class="cart-content">
                <div class="cart-header">
                    <h3>Tu Carrito</h3>
                    <button class="close-cart">&times;</button>
                </div>
                <div class="cart-items"></div>
                <div class="cart-total">
                    <span>Total:</span>
                    <span class="total-amount">$0</span>
                </div>
                <button class="checkout-btn">Proceder al Pago</button>
            </div>
        `;
        document.body.appendChild(cartModal);
    }
    
    // Añadir estilos si no existen
    if (!document.querySelector('#cart-styles')) {
        const cartStyles = document.createElement('style');
        cartStyles.id = 'cart-styles';
        cartStyles.textContent = getCartStyles();
        document.head.appendChild(cartStyles);
    }
}

// Función para cargar productos (simulada)
function loadProducts() {
    // Esto debería ser reemplazado por una llamada a tu API o base de datos
    products = [
        // Manga
        { id: 1, name: 'Manga de Naruto', price: 25000, category: 'manga', image: 'items/tomo1.webp' },
        { id: 2, name: 'Manga de One Piece', price: 28000, category: 'manga', image: 'items/tomo1op.webp' },
        
        // Figuras
        { id: 3, name: 'Figura Goku SSJ', price: 90000, category: 'figuras', image: 'img/ejemplo-figura1.jpg' },
        { id: 4, name: 'Figura Mikasa Ackerman', price: 110000, category: 'figuras', image: 'img/ejemplo-figura2.jpg' },
        
        // Peluches
        { id: 5, name: 'Peluche Pikachu', price: 35000, category: 'peluches', image: 'img/ejemplo-peluche1.jpg' },
        { id: 6, name: 'Peluche Totoro', price: 42000, category: 'peluches', image: 'img/ejemplo-peluche2.jpg' },
        
        // Accesorios
        { id: 7, name: 'Collar de Konoha', price: 18000, category: 'accesorios', image: 'img/ejemplo-accesorio1.jpg' },
        { id: 8, name: 'Pin One Piece', price: 10000, category: 'accesorios', image: 'img/ejemplo-accesorio2.jpg' },
        
        // Escolar
        { id: 9, name: 'Cuaderno Kimetsu', price: 12000, category: 'escolar', image: 'img/ejemplo-escolar1.jpg' },
        { id: 10, name: 'Bolígrafo Totoro', price: 7000, category: 'escolar', image: 'img/ejemplo-escolar2.jpg' },
        
        // Dulces
        { id: 11, name: 'Pocky Fresa', price: 9000, category: 'dulces', image: 'img/ejemplo-dulce1.jpg' },
        { id: 12, name: 'Ramen Picante', price: 15000, category: 'dulces', image: 'img/ejemplo-dulce2.jpg' },
        
        // Moda
        { id: 13, name: 'Camiseta Tokyo Revengers', price: 40000, category: 'moda', image: 'img/ejemplo-moda1.jpg' },
        { id: 14, name: 'Sudadera My Hero Academia', price: 70000, category: 'moda', image: 'img/ejemplo-moda2.jpg' },
        
        // Hogar
        { id: 15, name: 'Taza Evangelion', price: 22000, category: 'hogar', image: 'img/ejemplo-hogar1.jpg' },
        { id: 16, name: 'Cojín Jujutsu Kaisen', price: 30000, category: 'hogar', image: 'img/ejemplo-hogar2.jpg' }
    ];
}

// Configurar eventos
function setupEventListeners() {
    // Eventos para botones "Añadir al carrito"
    document.addEventListener('click', function(e) {
        const button = e.target.closest('.add-to-cart');
        if (button) {
            const productId = parseInt(button.dataset.id);
            addToCart(productId);
        }
    });
    
    // Evento para el botón del carrito flotante
    document.querySelector('.cart-btn').addEventListener('click', toggleCart);
    
    // Evento para cerrar el carrito
    document.querySelector('.close-cart').addEventListener('click', toggleCart);
    
    // Evento para proceder al pago
    document.querySelector('.checkout-btn').addEventListener('click', checkout);
    
    // Evento para eliminar items del carrito (usamos delegación de eventos)
    document.querySelector('.cart-items').addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-item') || e.target.closest('.remove-item')) {
            const button = e.target.classList.contains('remove-item') ? e.target : e.target.closest('.remove-item');
            const productId = parseInt(button.dataset.id);
            removeFromCart(productId);
        }
    });

    // Event listeners for login and registration forms
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(loginForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                const result = await response.json();

                if (response.ok && result.token && result.user) {
                    showAlert(result.message || 'Login successful!', 'success');
                    localStorage.setItem('authToken', result.token);
                    localStorage.setItem('currentUser', JSON.stringify(result.user));
                    updateLoginStatusUI();
                    loginForm.reset();
                    showSection('inicio'); // O redirigir a la página principal o dashboard
                } else {
                    showAlert(result.message || 'Login failed. Please check your credentials.', 'error');
                }
            } catch (error) {
                console.error('Login error:', error);
                showAlert('An error occurred during login. Please try again.', 'error');
            }
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(registerForm);
            const data = Object.fromEntries(formData.entries());

            if (data['register-password'] !== data['register-password-confirm']) {
                showAlert('Passwords do not match!', 'error');
                return;
            }

            // Remove confirm password before sending to backend
            delete data['register-password-confirm'];

            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                const result = await response.json();

                if (response.ok) {
                    showAlert(result.message || 'Registration successful! Please log in.', 'success');
                    registerForm.reset();
                    // Optionally, switch to login form:
                    // document.getElementById('registerSection').style.display = 'none';
                    // document.getElementById('loginSection').style.display = 'block';
                } else {
                    showAlert(result.message || 'Registration failed. Please try again.', 'error');
                }
            } catch (error) {
                console.error('Registration error:', error);
                showAlert('An error occurred during registration. Please try again.', 'error');
            }
        });
    }
}

// Función para añadir productos al carrito
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    updateCartUI();
    saveCartToStorage();
    showAlert(`${product.name} añadido al carrito`, 'success');
    
    // Efecto de animación en el botón del carrito
    const cartBtn = document.querySelector('.cart-btn');
    cartBtn.classList.add('animate-bounce');
    setTimeout(() => cartBtn.classList.remove('animate-bounce'), 500);
}

// Función para eliminar productos del carrito
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
    saveCartToStorage();
    showAlert('Producto eliminado del carrito', 'info');
}

// Actualizar la interfaz del carrito
function updateCartUI() {
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartCount = document.querySelector('.cart-count');
    const totalAmount = document.querySelector('.total-amount');
    
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
        cartCount.textContent = '0';
        totalAmount.textContent = '$0';
        return;
    }
    
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="item-info">
                <h4>${item.name}</h4>
                <p>$${item.price.toLocaleString()} x ${item.quantity}</p>
                <p class="item-total">$${itemTotal.toLocaleString()}</p>
            </div>
            <button class="remove-item" data-id="${item.id}">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        cartItemsContainer.appendChild(cartItemElement);
    });
    
    // Actualizar contador y total
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = itemCount;
    totalAmount.textContent = `$${total.toLocaleString()}`;
}

// Mostrar/ocultar carrito
function toggleCart() {
    document.querySelector('.cart-modal').classList.toggle('show');
}

// Proceso de pago
function checkout() {
    if (cart.length === 0) {
        showAlert('Tu carrito está vacío', 'error');
        return;
    }
    
    // Simular proceso de pago
    showAlert('Redirigiendo a pasarela de pago...', 'info');
    
    setTimeout(() => {
        showAlert('¡Compra realizada con éxito!', 'success');
        cart = [];
        updateCartUI();
        saveCartToStorage();
        toggleCart();
    }, 2000);
}

// Mostrar notificaciones
function showAlert(message, type) {
    // Eliminar alertas anteriores
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) existingAlert.remove();
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.style.animation = 'fadeOut 0.5s forwards';
        setTimeout(() => alert.remove(), 500);
    }, 3000);
}

// Guardar carrito en localStorage
function saveCartToStorage() {
    localStorage.setItem('otakuShopCart', JSON.stringify(cart));
}

// Cargar carrito desde localStorage
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('otakuShopCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }
}

// Función para actualizar la UI del botón de login/usuario
function updateLoginStatusUI() {
    const loginButton = document.querySelector('.btn-iniciar-sesion');
    if (!loginButton) {
        // console.warn('.btn-iniciar-sesion button not found for UI update.');
        return;
    }

    const currentUserString = localStorage.getItem('currentUser');
    let currentUser = null;
    if (currentUserString) {
        try {
            currentUser = JSON.parse(currentUserString);
        } catch (e) {
            console.error('Error parsing currentUser from localStorage:', e);
            localStorage.removeItem('currentUser'); // Clear corrupted data
            localStorage.removeItem('authToken');
        }
    }

    if (currentUser && currentUser.username) {
        // User is logged in
        loginButton.innerHTML = `<i class="fas fa-user-check"></i> Hola, ${currentUser.username} <button id="logoutBtn" style="margin-left: 10px; background: var(--secondary); color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">Salir</button>`;
        
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            // Ensure only one event listener is attached, or clone to remove old ones
            const newLogoutBtn = logoutBtn.cloneNode(true);
            logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
            
            newLogoutBtn.addEventListener('click', function(event) {
                event.stopPropagation(); // Prevent triggering other clicks on loginButton
                localStorage.removeItem('authToken');
                localStorage.removeItem('currentUser');
                updateLoginStatusUI(); // Update UI back to login state
                showSection('inicio'); // Go to home page
                showAlert('Has cerrado sesión.', 'info');
            });
        }
        // Prevent opening 'miCuenta' section when already logged in
        loginButton.onclick = (event) => {
            event.preventDefault();
            // Optionally, could navigate to a user profile page here
            // For now, it does nothing if user is logged in and clicks their name area
        };
    } else {
        // User is not logged in
        loginButton.innerHTML = '<i class="fas fa-user"></i> Iniciar sesión';
        loginButton.onclick = () => showSection('miCuenta'); // Restore original functionality
    }
}

// Función para mostrar secciones
function showSection(sectionId) {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    document.getElementById(sectionId).style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Si es una sección de categoría, actualizar botones
    if (sectionId.startsWith('categoria-')) {
        updateAddToCartButtons(sectionId.replace('categoria-', ''));
    }
}

// Actualizar botones "Añadir al carrito" en cada categoría
function updateAddToCartButtons(category) {
    const productos = document.querySelectorAll(`#categoria-${category} .producto`);
    
    productos.forEach((producto, index) => {
        const productId = index + 1 + (getCategoryOffset(category) * 2);
        const addButton = producto.querySelector('button');
        
        // Convertir el botón existente en un botón funcional
        addButton.classList.add('add-to-cart');
        addButton.dataset.id = productId;
        addButton.innerHTML = '<i class="fas fa-cart-plus"></i> Añadir al carrito';
    });
}

// Obtener offset para IDs de productos por categoría
function getCategoryOffset(category) {
    const categoriesOrder = ['manga', 'figuras', 'peluches', 'accesorios', 'escolar', 'dulces', 'moda', 'hogar'];
    return categoriesOrder.indexOf(category);
}

// Estilos CSS para el carrito
function getCartStyles() {
    return `
        /* Estilos del carrito */
        .cart-btn {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(45deg, #5cb85c, #28a745);
            color: white;
            border: none;
            font-size: 1.2rem;
            cursor: pointer;
            box-shadow: 0 5px 20px rgba(40, 167, 69, 0.3);
            z-index: 999;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }
        
        .cart-btn:hover {
            transform: scale(1.1) translateY(-5px);
            box-shadow: 0 8px 25px rgba(21, 170, 56, 0.64);
        }
        
        .cart-btn.animate-bounce {
            animation: bounce 0.5s;
        }
        
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
        }
        
        .cart-count {
            margin-left: 5px;
            font-size: 0.9rem;
        }
        
        .cart-modal {
            position: fixed;
            top: 0;
            right: -100%;
            width: 100%;
            max-width: 400px;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            transition: right 0.3s ease;
        }
        
        .cart-modal.show {
            right: 0;
        }
        
        .cart-content {
            position: absolute;
            top: 0;
            right: 0;
            width: 100%;
            height: 100%;
            background-color: white;
            padding: 20px;
            display: flex;
            flex-direction: column;
        }
        
        .cart-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
        }
        
        .cart-header h3 {
            margin: 0;
            color: #333;
        }
        
        .close-cart {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #666;
        }
        
        .cart-items {
            flex: 1;
            overflow-y: auto;
            margin-bottom: 20px;
        }
        
        .empty-cart {
            text-align: center;
            color: #777;
            margin-top: 50px;
        }
        
        .cart-item {
            display: flex;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #eee;
            align-items: center;
        }
        
        .cart-item img {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 5px;
            margin-right: 15px;
        }
        
        .item-info {
            flex: 1;
        }
        
        .item-info h4 {
            margin: 0 0 5px 0;
            font-size: 1rem;
            color: #333;
        }
        
        .item-info p {
            margin: 0;
            font-size: 0.9rem;
            color: #777;
        }
        
        .item-total {
            font-weight: bold;
            color: #333 !important;
        }
        
        .remove-item {
            background: none;
            border: none;
            color: #dc3545;
            cursor: pointer;
            font-size: 1.1rem;
            margin-left: 10px;
        }
        
        .cart-total {
            display: flex;
            justify-content: space-between;
            font-size: 1.2rem;
            font-weight: bold;
            padding: 15px 0;
            border-top: 1px solid #eee;
        }
        
        .checkout-btn {
            padding: 12px;
            background: linear-gradient(45deg, #28a745, #5cb85c);
            color: white;
            border: none;
            border-radius: 5px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .checkout-btn:hover {
            background: linear-gradient(45deg, #5cb85c, #28a745);
            transform: translateY(-2px);
            box-shadow: 0 3px 10px rgba(40, 167, 69, 0.3);
        }
        
        /* Estilos para los botones de añadir al carrito */
        .add-to-cart {
            background: linear-gradient(45deg, #FF3E4D, #FF6B6B);
            color: white;
            border: none;
            padding: 0.8rem 1.5rem;
            border-radius: 50px;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-top: 1rem;
        }
        
        .add-to-cart:hover {
            background: linear-gradient(45deg, #FF6B6B, #FF3E4D);
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(255, 62, 77, 0.4);
        }
        
        /* Notificaciones */
        .alert {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 5px;
            color: white;
            z-index: 1100;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            animation: fadeIn 0.5s forwards;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .alert-success {
            background-color: #28a745;
        }
        
        .alert-error {
            background-color: #dc3545;
        }
        
        .alert-info {
            background-color: #17a2b8;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-20px); }
        }
    `;
}

