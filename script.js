document.addEventListener('DOMContentLoaded', () => {
    // !!! هام: تم إضافة رابط Google Apps Script الخاص بك !!!
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwDL-dmAGyhF_pKhQY-PuuGVlsor40F4lUv9BVAh1i11Z15v_t6NDriVhhy4ae6qtgXIA/exec';
    const ADMIN_EMAIL = "msdfrrt@gmail.com";

    // عناصر DOM
    const mainNav = document.getElementById('main-nav');
    const productsView = document.getElementById('products-view');
    const authView = document.getElementById('auth-view');
    const adminPanel = document.getElementById('admin-panel');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const productsContainer = document.getElementById('products-container');
    const showLoginBtn = document.getElementById('show-login');
    const showRegisterBtn = document.getElementById('show-register');

    // حالة التطبيق
    let currentUser = null;
    let isAdmin = false;

    // --- وظائف مساعدة ---

    // إظهار/إخفاء الأقسام الرئيسية
    function showView(viewId) {
        const views = [productsView, authView, adminPanel];
        views.forEach(view => view.classList.add('hidden'));
        document.getElementById(viewId).classList.remove('hidden');
    }

    // تحديث شريط التنقل العلوي
    function updateNavbar() {
        mainNav.innerHTML = '';
        if (isAdmin) {
            mainNav.innerHTML = `<button id="logout-btn">تسجيل خروج المدير</button>`;
        } else if (currentUser) {
            const merchantBtn = currentUser.isMerchant 
                ? `<a href="#" id="post-ad-btn">نشر إعلان جديد</a>` 
                : `<a href="https://www.instagram.com/webaidea?igsh=ajVyNm0yZHdlMnNi&utm_source=qr" target="_blank">تواصل لنشر إعلانك</a>`;
            mainNav.innerHTML = `
                <span>أهلاً بك, ${currentUser.name}</span>
                ${merchantBtn}
                <button id="logout-btn">تسجيل خروج</button>
            `;
        } else {
            mainNav.innerHTML = `<button id="login-btn">تسجيل الدخول</button>`;
        }
    }

    // جلب المنتجات وعرضها
    async function fetchAndDisplayProducts() {
        try {
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'action=getAllProducts'
            });
            const data = await response.json();
            if (data.status === 'success') {
                displayProducts(data.products);
            } else {
                console.error('Failed to fetch products:', data.message);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    }

    function displayProducts(products) {
        productsContainer.innerHTML = '';
        products.forEach(product => {
            const card = document.createElement('div');
            card.className = `product-card ${product.isFeatured ? 'featured' : ''}`;
            card.innerHTML = `
                <img src="${product.imageUrl}" alt="${product.name}">
                <div class="product-card-content">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <p class="posted-by">منشور بواسطة: ${product.postedBy}</p>
                </div>
            `;
            productsContainer.appendChild(card);
        });
    }

    // --- معالجات الأحداث ---

    // التبديل بين تسجيل الدخول وإنشاء الحساب
    showLoginBtn.addEventListener('click', () => {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        showLoginBtn.classList.add('active');
        showRegisterBtn.classList.remove('active');
    });

    showRegisterBtn.addEventListener('click', () => {
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        showRegisterBtn.classList.add('active');
        showLoginBtn.classList.remove('active');
    });

    // معالج تسجيل الدخول
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `action=login&email=${email}&password=${password}`
            });
            const data = await response.json();

            if (data.status === 'success') {
                currentUser = data.user;
                isAdmin = data.isAdmin;
                updateNavbar();
                if (isAdmin) {
                    showView('admin-panel');
                    setupAdminPanel();
                } else {
                    showView('products-view');
                }
                alert(data.message || `مرحباً بك, ${currentUser.name}`);
            } else {
                alert(`خطأ: ${data.message}`);
            }
        } catch (error) {
            alert('فشل الاتصال بالخادم. تأكد من تشغيل الموقع من خلال خادم محلي (مثل Live Server) وحاول مرة أخرى.');
            console.error(error);
        }
    });

    // معالج إنشاء الحساب
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        try {
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `action=register&name=${name}&email=${email}&password=${password}`
            });
            const data = await response.json();

            if (data.status === 'success') {
                alert(data.message);
                showLoginBtn.click(); // Switch to login form
            } else {
                alert(`خطأ: ${data.message}`);
            }
        } catch (error) {
            alert('فشل الاتصال بالخادم. تأكد من تشغيل الموقع من خلال خادم محلي (مثل Live Server) وحاول مرة أخرى.');
            console.error(error);
        }
    });

    // معالج تسجيل الخروج
    mainNav.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'logout-btn') {
            currentUser = null;
            isAdmin = false;
            updateNavbar();
            showView('products-view');
            alert('تم تسجيل الخروج بنجاح.');
        }
    });

    // معالج فتح صفحة تسجيل الدخول
    mainNav.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'login-btn') {
            showView('auth-view');
        }
    });

    // --- وظائف لوحة تحكم المدير ---

    async function setupAdminPanel() {
        await fetchAndDisplayUsers();
        await fetchAndDisplayAdminAds();
        
        // عرض الأقسام الفرعية
        const adminNavBtns = document.querySelectorAll('.admin-nav button');
        const adminSubViews = document.querySelectorAll('.admin-sub-view');
        // Set the first button as active by default
        adminNavBtns[0].classList.add('active');

        adminNavBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetViewId = btn.dataset.view;
                adminSubViews.forEach(view => view.classList.add('hidden'));
                document.getElementById(targetViewId).classList.remove('hidden');
                adminNavBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // معالج البحث عن مستخدم
        document.getElementById('search-user').addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#accounts-table-body tr');
            rows.forEach(row => {
                const email = row.cells[1].textContent.toLowerCase();
                row.style.display = email.includes(searchTerm) ? '' : 'none';
            });
        });

        // معالج نشر إعلان من قبل الإدارة
        document.getElementById('admin-post-ad-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('admin-product-name').value;
            const desc = document.getElementById('admin-product-desc').value;
            const imgUrl = document.getElementById('admin-product-image').value;
            const isFeatured = document.getElementById('is-featured-ad').checked;

            try {
                const response = await fetch(SCRIPT_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `action=addProduct&productName=${name}&description=${desc}&imageUrl=${imgUrl}&postedBy=${ADMIN_EMAIL}&isFeatured=${isFeatured}`
                });
                const data = await response.json();
                alert(data.message);
                if (data.status === 'success') {
                    e.target.reset();
                    fetchAndDisplayAdminAds();
                }
            } catch (error) {
                alert('فشل نشر الإعلان.');
                console.error(error);
            }
        });
    }

    async function fetchAndDisplayUsers() {
        try {
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'action=getAllUsers'
            });
            const data = await response.json();
            if (data.status === 'success') {
                displayUsers(data.users);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }

    function displayUsers(users) {
        const accountsTableBody = document.getElementById('accounts-table-body');
        const merchantsTableBody = document.getElementById('merchants-table-body');
        accountsTableBody.innerHTML = '';
        merchantsTableBody.innerHTML = '';

        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>
                    ${user.isMerchant 
                        ? `<button class="revoke-btn revoke-merchant-btn" data-email="${user.email}">إلغاء صلاحية التاجر</button>`
                        : `<button class="approve-btn make-merchant-btn" data-email="${user.email}">جعله تاجراً</button>`
                    }
                </td>
            `;
            
            if (user.isMerchant) {
                merchantsTableBody.appendChild(row.cloneNode(true));
            }
            if (user.email !== ADMIN_EMAIL) { // Don't show admin in the main list
                 accountsTableBody.appendChild(row);
            }
        });

        // Add event listeners for the new buttons
        document.querySelectorAll('.make-merchant-btn').forEach(btn => {
            btn.addEventListener('click', () => toggleMerchantStatus(btn.dataset.email, true));
        });
        document.querySelectorAll('.revoke-merchant-btn').forEach(btn => {
            btn.addEventListener('click', () => toggleMerchantStatus(btn.dataset.email, false));
        });
    }

    async function toggleMerchantStatus(email, makeMerchant) {
        const action = makeMerchant ? 'ترقية' : 'إلغاء ترقية';
        if (!confirm(`هل أنت متأكد من ${action} المستخدم ${email}؟`)) return;

        try {
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `action=toggleMerchantStatus&email=${email}`
            });
            const data = await response.json();
            alert(data.message);
            if (data.status === 'success') {
                fetchAndDisplayUsers(); // Refresh lists
            }
        } catch (error) {
            alert('فشل تحديث الصلاحيات.');
            console.error(error);
        }
    }
    
    async function fetchAndDisplayAdminAds() {
        try {
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'action=getAllProducts'
            });
            const data = await response.json();
            if (data.status === 'success') {
                const adminAdsContainer = document.getElementById('admin-ads-container');
                adminAdsContainer.innerHTML = '';
                data.products.forEach(product => {
                    const card = document.createElement('div');
                    card.className = `product-card ${product.isFeatured ? 'featured' : ''}`;
                    card.innerHTML = `
                        <img src="${product.imageUrl}" alt="${product.name}">
                        <div class="product-card-content">
                            <h3>${product.name}</h3>
                            <p>${product.description}</p>
                            <p class="posted-by">منشور بواسطة: ${product.postedBy}</p>
                        </div>
                    `;
                    adminAdsContainer.appendChild(card);
                });
            }
        } catch (error) {
            console.error('Error fetching admin ads:', error);
        }
    }


    // --- بدء التطبيق ---
    updateNavbar();
    fetchAndDisplayProducts();
    showLoginBtn.click(); // Show login form by default
});