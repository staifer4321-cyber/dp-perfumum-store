// Данные товаров
const products = [
    { id: 1, name: "Chanel No.5", price: 12000, image: "https://basket-35.wbbasket.ru/vol7437/part743755/743755310/images/big/1.webp", category: "женские" },
    { id: 2, name: "Dior Sauvage", price: 9500, image: "https://avatars.mds.yandex.net/get-mpic/5252557/img_id7985596530252676081.jpeg/orig", category: "мужские" },
    { id: 3, name: "Tom Ford Black Orchid", price: 15000, image: "https://avatars.mds.yandex.net/get-mpic/15060735/2a00000196e9a10b00acef4f23ca21466e62/orig", category: "унисекс" },
    { id: 4, name: "Creed Aventus", price: 22000, image: "https://avatars.mds.yandex.net/get-mpic/4080967/2a0000019277b8127db83569982b781dc122/orig", category: "мужские" },
    { id: 5, name: "Yves Saint Laurent Libre", price: 13500, image: "https://avatars.mds.yandex.net/get-mpic/5363183/2a000001919031fc16e6505afc70c6bfe652/orig", category: "женские" },
    { id: 6, name: "Jo Malone Peony", price: 11000, image: "https://ir.ozone.ru/s3/multimedia-d/6354189109.jpg", category: "женские" }
];

// Данные отзывов
const reviews = [
    { author: "Анна", text: "Великолепный сервис! Очень довольна покупкой Chanel No.5, оригинал, стойкий аромат.", rating: 5 },
    { author: "Дмитрий", text: "Заказывал Dior Sauvage, привезли быстро, упаковка отличная. Рекомендую!", rating: 5 },
    { author: "Елена", text: "Большой выбор нишевой парфюмерии. Tom Ford покорил сердце. Спасибо!", rating: 5 },
    { author: "Иван", text: "Creed Aventus - бомба! Цена адекватная, консультанты приятные.", rating: 5 },
];

// Корзина (массив объектов)
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Элементы DOM
const productGrid = document.getElementById('productGrid');
const reviewsGrid = document.getElementById('reviewsGrid');
const cartCount = document.getElementById('cartCount');
const cartModal = document.getElementById('cartModal');
const cartIcon = document.getElementById('cartIcon');
const closeCart = document.getElementById('closeCart');
const cartItemsDiv = document.getElementById('cartItems');
const cartTotalSpan = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');

// Элементы аутентификации
const authModal = document.getElementById('authModal');
const authBtn = document.getElementById('authBtn');
const closeAuthModal = document.getElementById('closeAuthModal');
const authForm = document.getElementById('authForm');
const modalTitle = document.getElementById('modalTitle');
const switchToRegister = document.getElementById('switchToRegister');
const authSection = document.getElementById('authSection');

// Рендер товаров
function renderProducts() {
    productGrid.innerHTML = '';
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <h3>${product.name}</h3>
            <p class="product-price">${product.price.toLocaleString()} ₽</p>
            <button class="add-to-cart" data-id="${product.id}">В корзину</button>
        `;
        productGrid.appendChild(card);
    });
}

// Рендер отзывов
function renderReviews() {
    reviewsGrid.innerHTML = '';
    reviews.forEach(review => {
        const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
        const card = document.createElement('div');
        card.className = 'review-card';
        card.innerHTML = `
            <div class="stars">${stars}</div>
            <p>"${review.text}"</p>
            <div class="review-author">— ${review.author}</div>
        `;
        reviewsGrid.appendChild(card);
    });
}

// Обновление счетчика корзины
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Рендер корзины в модалке
function renderCartModal() {
    cartItemsDiv.innerHTML = '';
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p style="text-align:center; padding:20px;">Корзина пуста</p>';
        cartTotalSpan.textContent = `Итого: 0 ₽`;
        return;
    }

    let total = 0;
    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (!product) return;
        const itemTotal = product.price * item.quantity;
        total += itemTotal;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <strong>${product.name}</strong><br>
                <span>${product.price.toLocaleString()} ₽ x ${item.quantity}</span>
            </div>
            <div class="cart-item-price">${itemTotal.toLocaleString()} ₽</div>
            <div class="remove-item" data-id="${item.id}"><i class="fas fa-trash"></i></div>
        `;
        cartItemsDiv.appendChild(cartItem);
    });

    cartTotalSpan.textContent = `Итого: ${total.toLocaleString()} ₽`;

    // Добавляем обработчики удаления
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            removeFromCart(id);
        });
    });
}

// Добавление в корзину
function addToCart(productId) {
    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }
    updateCartCount();
    renderCartModal();
}

// Удаление из корзины
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartCount();
    renderCartModal();
}

// Функции аутентификации
function showAuthModal() {
    authModal.style.display = 'flex';
    modalTitle.textContent = 'Вход';
    authForm.reset();
}

function hideAuthModal() {
    authModal.style.display = 'none';
}

function switchAuthMode() {
    const isLogin = modalTitle.textContent === 'Вход';
    modalTitle.textContent = isLogin ? 'Регистрация' : 'Вход';
    switchToRegister.textContent = isLogin ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться';
    document.querySelector('.btn-auth-submit').textContent = isLogin ? 'Зарегистрироваться' : 'Войти';
}

function handleAuth(e) {
    e.preventDefault();
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    const role = document.getElementById('authRole').value;
    const isLogin = modalTitle.textContent === 'Вход';

    // Получаем пользователей из localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];

    if (isLogin) {
        // Вход
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            updateAuthUI();
            hideAuthModal();
            alert(`Добро пожаловать, ${user.email}!`);
        } else {
            alert('Неверный email или пароль');
        }
    } else {
        // Регистрация
        if (users.find(u => u.email === email)) {
            alert('Пользователь с таким email уже существует');
            return;
        }
        const newUser = {
            id: Date.now(),
            email,
            password,
            role,
            createdAt: new Date().toISOString()
        };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        currentUser = newUser;
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        updateAuthUI();
        hideAuthModal();
        alert('Регистрация успешна!');
    }
}

function updateAuthUI() {
    if (currentUser) {
        authBtn.innerHTML = `
            <i class="fas fa-user"></i> 
            ${currentUser.email} 
            (${currentUser.role === 'admin' ? 'Администратор' : 'Покупатель'})
        `;
        authBtn.onclick = () => {
            if (confirm('Выйти из аккаунта?')) {
                currentUser = null;
                localStorage.removeItem('currentUser');
                updateAuthUI();
            }
        };
        
        // Показываем админ-панель для администраторов
        if (currentUser.role === 'admin') {
            showAdminPanel();
        } else {
            hideAdminPanel();
        }
    } else {
        authBtn.innerHTML = '<i class="fas fa-user"></i> Войти';
        authBtn.onclick = showAuthModal;
        hideAdminPanel();
    }
}

function showAdminPanel() {
    // Добавляем админ-панель если ее еще нет
    if (!document.getElementById('adminPanel')) {
        const adminPanel = document.createElement('div');
        adminPanel.id = 'adminPanel';
        adminPanel.className = 'admin-panel';
        adminPanel.innerHTML = `
            <h3>Административная панель</h3>
            <div class="admin-stats">
                <div class="stat-item">
                    <span class="stat-number">${products.length}</span>
                    <span class="stat-label">Товаров</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${reviews.length}</span>
                    <span class="stat-label">Отзывов</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${cart.length}</span>
                    <span class="stat-label">Товаров в корзине</span>
                </div>
            </div>
            <div class="admin-actions">
                <button class="admin-btn" onclick="exportData()">
                    <i class="fas fa-download"></i> Экспорт данных
                </button>
                <button class="admin-btn" onclick="clearAllData()">
                    <i class="fas fa-trash"></i> Очистить все данные
                </button>
            </div>
        `;
        
        // Вставляем панель после навигации
        const nav = document.querySelector('nav');
        nav.parentNode.insertBefore(adminPanel, nav.nextSibling);
    }
}

function hideAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) {
        adminPanel.remove();
    }
}

function exportData() {
    const data = {
        products: products,
        reviews: reviews,
        cart: cart,
        users: JSON.parse(localStorage.getItem('users')) || [],
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `dpperfumum_data_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    alert('Данные экспортированы успешно!');
}

function clearAllData() {
    if (confirm('Вы уверены, что хотите очистить все данные? Это действие нельзя отменить!')) {
        localStorage.clear();
        cart = [];
        currentUser = null;
        location.reload();
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateAuthUI();
    hideAuthModal();
}

// Обработчики событий
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-cart')) {
        if (!currentUser) {
            alert('Пожалуйста, войдите в систему, чтобы добавить товар в корзину');
            showAuthModal();
            return;
        }
        const id = parseInt(e.target.dataset.id);
        addToCart(id);
        alert('Товар добавлен в корзину!');
    }
});

// Вкладки
document.querySelectorAll('.tab-link').forEach(tab => {
    tab.addEventListener('click', () => {
        // Убираем активный класс у всех вкладок
        document.querySelectorAll('.tab-link').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Скрываем все секции
        document.querySelectorAll('.tab-section').forEach(section => section.classList.remove('active-section'));

        // Показываем нужную секцию
        const tabId = tab.dataset.tab;
        document.getElementById(tabId).classList.add('active-section');
    });
});

// Корзина модалка
cartIcon.addEventListener('click', () => {
    if (!currentUser) {
        alert('Пожалуйста, войдите в систему, чтобы просмотреть корзину');
        showAuthModal();
        return;
    }
    renderCartModal();
    cartModal.style.display = 'flex';
});

closeCart.addEventListener('click', () => {
    cartModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === cartModal) {
        cartModal.style.display = 'none';
    }
});

// Оформление заказа
checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Корзина пуста!');
        return;
    }
    alert('Спасибо за заказ! Мы свяжемся с вами в ближайшее время.');
    cart = [];
    updateCartCount();
    renderCartModal();
    cartModal.style.display = 'none';
});

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    renderReviews();
    updateCartCount();
    updateAuthUI();
    
    // Обработчики событий аутентификации
    authBtn.addEventListener('click', showAuthModal);
    closeAuthModal.addEventListener('click', hideAuthModal);
    authForm.addEventListener('submit', handleAuth);
    switchToRegister.addEventListener('click', (e) => {
        e.preventDefault();
        switchAuthMode();
    });
    
    // Закрытие модального окна при клике вне его
    window.addEventListener('click', (e) => {
        if (e.target === authModal) {
            hideAuthModal();
        }
    });
});

// Небольшая имитация "рабочих" контактов: при клике на телефон или почту
document.querySelector('.fa-phone').parentElement.addEventListener('click', () => {
    window.location.href = 'tel:+79991234567';
});
document.querySelector('.fa-envelope').parentElement.addEventListener('click', () => {
    window.location.href = 'mailto:info@dpperfumum.ru';
});

// Обработка ошибки загрузки видео - запасной вариант
const video = document.querySelector('video');
video.addEventListener('error', function() {
    console.log('Ошибка загрузки видео, используем запасной фон');
    // Можно установить цвет фона или изображение
    document.querySelector('.video-background').style.backgroundColor = '#1a1a1a';
});
