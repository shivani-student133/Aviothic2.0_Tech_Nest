document.addEventListener('DOMContentLoaded', () => {
    localStorage.removeItem('currentUser');
    window.currentUser=null;

    // Helper function to get the current page file name
    const getPageName = () => {
        // Corrected for robustness: Ensures a file name is always returned
        return window.location.pathname.split("/").pop() || 'index.html';
    };

    // --- GLOBAL STATE MANAGEMENT ---
    window.users = JSON.parse(localStorage.getItem('users')) || [];
    // Ensure currentUser is null if localStorage is empty or null
    window.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    
    const preloadedProducts = [
    {name:'Handmade Bag', type:'Handicraft', price:300, seller:'Rina', whatsapp:'1234567890', email:'rina@example.com', img:'ra.webp', requests:0, rating:4.5, reviews:10},
    {name:'Organic Honey', type:'Food', price:200, seller:'Sita', whatsapp:'9876543210', email:'sita@example.com', img:'rb.jpg  ', requests:0, rating:4.8, reviews:5}
];

// Get existing products from localStorage
let storedProducts = JSON.parse(localStorage.getItem('products')) || [];

// Merge or replace images from preloadedProducts
preloadedProducts.forEach(pre => {
    const index = storedProducts.findIndex(p => p.name === pre.name);
    if (index !== -1) {
        // Update image if it changed
        storedProducts[index].img = pre.img;
    } else {
        // Add new product if not in storage
        storedProducts.push(pre);
    }
});

// Save back to localStorage
window.products = storedProducts;
localStorage.setItem('products', JSON.stringify(window.products));
    window.mentors = [
        {name:'Sita Devi', category:'Financial', email:'sita@example.com',experience:"5 years",description:
            "Expert in rural women finance and budgeting."
        },
        {name:'Meena Kumari', category:'Skill', email:'meena@example.com',experience:"8 years",description:
            "Trains in handicraft and self-employment skills."},
        {name:'Rina Sharma', category:'Schemes', email:'rina@example.com',experience:"6 years",description:
            "Guides on government entrepreneurship schemes."}
    ];

    if(!localStorage.getItem('products'))
    {
        localStorage.setItem('products',JSON.stringify(window.products));
    }
    else{
        window.products = JSON.parse(localStorage.getItem('products'));
    }
    
    


    // --- NOTIFICATIONS ---
    window.createNotification = function(msg) {
        let notif = document.getElementById('notification');
        
        // This check is crucial for pages that might not have the #notification div
        if (!notif) {
             console.warn("Notification element not found on this page.");
             // Fallback to simple alert if the element is missing
             // alert(msg); 
             return;
        }

        notif.textContent = msg;
        notif.style.display = 'block';

        // Auto-disappear after 2.5 seconds
        setTimeout(() => {
            notif.style.display = 'none';
        }, 2500);
    };

    // --- MARKETPLACE AUTHENTICATION (Only on marketplace.html) ---

    // Function to show the modal
    window.showAuthModal = function() {
        const modal = document.getElementById('authModal');
        if (!modal) return; // Check added for safety across pages
        
        modal.style.display = 'flex';
        // Default to login form when opening
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        if (loginForm && registerForm) {
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
        }
    };
    
    // Function to close the modal
    window.closeAuthModal = function() {
        const modal = document.getElementById('authModal');
        if (modal) modal.style.display = 'none';
    };

    // Function to toggle between login/register forms inside modal
    window.toggleAuth = function(formType) {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        if (loginForm && registerForm) {
            loginForm.style.display = formType === 'login' ? 'block' : 'none';
            registerForm.style.display = formType === 'register' ? 'block' : 'none';
        }
    };

    // Update UI elements based on login state
    const updateMarketplaceUI = () => {
        const uploadSection = document.getElementById('uploadSection');
        const myProductsSection = document.getElementById('myProductsSection');

        if (window.currentUser) {
            // User is logged in
            if (uploadSection) uploadSection.style.display = 'block';
            if (myProductsSection) myProductsSection.style.display = 'block';
            
            if (getPageName() === 'marketplace.html') {
                // Hide the Register/Login button on top info line and show welcome message
                const topInfo = document.querySelector('.top-info');
                if (topInfo) {
                    // This line uses the correct template literal syntax
                    topInfo.innerHTML = `Welcome, ${window.currentUser.name}! You can now upload and manage your products.`;
                }
            
            }
        } else {
            // User is logged out
            if (uploadSection) uploadSection.style.display = 'none';
            if (myProductsSection) myProductsSection.style.display = 'none';
            // On marketplace.html, the top-info text automatically reverts to the HTML default when logged out
        }
    };


    // Register user
    window.registerUser = function() {
        const name = document.getElementById('regName')?.value.trim();
        const email = document.getElementById('regEmail')?.value.trim();
        const password = document.getElementById('regPassword')?.value;
        const phone = document.getElementById('regPhone')?.value.trim();
        
        // Added optional chaining (?) for robustness

        if (!name || !email || !password || !phone) {
            createNotification("Please fill all registration fields.");
            return;
        }

        if (window.users.find(u => u.email === email)) {
            createNotification("This email is already registered.");
            return;
        }

        window.users.push({ name, email, password, phone });
        localStorage.setItem('users', JSON.stringify(window.users));
        createNotification('Registration successful! Please log in.');
        toggleAuth('login');
    };

    // Login user
    window.loginUser = function() {
        const name = document.getElementById('loginName')?.value.trim();
        const password = document.getElementById('loginPassword')?.value;

        const user = window.users.find(u => u.name === name && u.password === password);

        if (user) {
            window.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(window.currentUser));
            createNotification('Login successful!');
            closeAuthModal();
            updateMarketplaceUI();
            // Only attempt to render my products if we are on a page that needs it
            if (document.getElementById('myProductsGrid')) window.renderMyProducts();
        } else {
            createNotification('Invalid credentials! Try again.');
        }
    };


    // --- MARKETPLACE PRODUCTS ---

    // Render all products
    window.renderProducts = function(filtered = []) {
        const grid = document.getElementById('productGrid');
        if (!grid) return;

        grid.innerHTML = '';
        const list = filtered.length ? filtered : window.products;

        list.forEach(p => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <img src="${p.img}" alt="${p.name}">
                <h3>${p.name}</h3>
                <p>Category: ${p.type}</p>
                <p>Price: ₹${p.price}</p>
                <p>Seller: ${p.seller}</p>
                <p class="small-info">WhatsApp: ${p.whatsapp}</p>
                <p class="small-info">Email: ${p.email}</p>
                <p>Rating: <strong>${p.rating} ⭐</strong> | Reviews: ${p.reviews}</p>
                <p>Total Requests: <span class="request-count">${p.requests}</span></p>
                <button class="gradient-button" onclick="buyProduct('${p.name}')">Buy Now</button>
                <button class="gradient-button" onclick="openReviewModal('${p.name}')">View/Add Review</button>
                <button class="whatsapp-button" onclick="contactSeller('${p.whatsapp}','${p.name}')">
               <span class = "whatsapp-icon">💬</span>Contact Seller </button>
            `;
            grid.appendChild(productCard);
        });
    };

    // Buy now increases requests
    window.buyProduct = function(productName) {
        const prod = window.products.find(p => p.name === productName);
        if (prod) {
            prod.requests++;
            localStorage.setItem('products', JSON.stringify(window.products));
            createNotification('Product request sent to seller!');
            if (getPageName() === 'marketplace.html') {
                 // Re-render grids to reflect the change immediately
                window.renderProducts();
                window.renderMyProducts();
            }
        }
    };

    // Add product
    window.addProduct = function(e) {
        e.preventDefault();
        if (!window.currentUser) { createNotification("Please login to upload a product."); return; }

        const imgInput = document.getElementById('productImage');
        const name = document.getElementById('productName')?.value.trim();
        const type = document.getElementById('productType')?.value;
        const price = document.getElementById('productPrice')?.value.trim();
        const whatsapp = document.getElementById('productWhatsApp')?.value.trim();

        if (!name || !type || !price || !whatsapp || !imgInput.files[0]) { 
            createNotification("Please fill all fields and select an image."); 
            return; 
        }

        // Use FileReader to store the image data URL in localStorage
        const reader = new FileReader();
        reader.onload = function(e) {
            const newProduct = {
                name,
                type,
                price: Number(price),
                seller: window.currentUser.name,
                whatsapp,
                email: window.currentUser.email || 'example@example.com',
                img: e.target.result, // Data URL of the image
                requests: 0,
                rating: 0,
                reviews: 0
            };
            
            window.products.push(newProduct);
            localStorage.setItem('products', JSON.stringify(window.products));
            createNotification('Product uploaded successfully!');
            document.getElementById('uploadForm')?.reset();
            
            // Re-render
            window.renderProducts();
            window.renderMyProducts();
        };
        reader.readAsDataURL(imgInput.files[0]);
    };

    // Render logged-in user's products
    window.renderMyProducts = function() {
        const grid = document.getElementById('myProductsGrid');
        if (!window.currentUser || !grid) return;
        
        const myProducts = window.products.filter(p => p.seller === window.currentUser.name);
        grid.innerHTML = '';

        myProducts.forEach(p => {
            grid.innerHTML += `<div class="product-card">
                <img src="${p.img}" alt="${p.name}">
                <h3>${p.name}</h3>
                <p>Type: ${p.type}</p>
                <p>Price: ₹${p.price}</p>
                <p>Total Requests: <span class="request-count" style="font-weight:bold; color:var(--primary-end);">${p.requests}</span></p>
            </div>`;
        });
    };

            
         // --- Review System ---

window.openReviewModal = function(productName) {
    const modal = document.getElementById('reviewModal');
    const nameEl = document.getElementById('reviewProductName');
    const listEl = document.getElementById('reviewsList');

    const product = window.products.find(p => p.name === productName); 
    if  (!product) return;

    nameEl.textContent =`Reviews for ${product.name}`;
    modal.style.display = 'block';
    modal.dataset.productName = product.name;

    // Load existing reviews
    const allReviews = JSON.parse(localStorage.getItem('productReviews')) || {};
    const productReviews = allReviews[product.name] || [];

    if (productReviews.length === 0) {
        listEl.innerHTML = '<p>No reviews yet. Be the first to review!</p>';
    } else {
        listEl.innerHTML = productReviews.map(r => `
            <div class="review-item">
                <strong>${r.user}</strong> - ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}<br>
                <p><b>${r.text}</b></p>
            </div>
        `).join('');
    }
}

window.closeReviewModal=function() {
    document.getElementById('reviewModal').style.display = 'none';
}

window.addReview=function(event) {
    event.preventDefault();

    const modal = document.getElementById('reviewModal');
    const productName = modal.dataset.productName;
    const rating = parseInt(document.getElementById('reviewRating').value);
    const text = document.getElementById('reviewText').value.trim();
    const user = window.currentUser ? window.currentUser.name : 'Anonymous';

    if (!rating || !text) return alert('Please add rating and comment.');

    const allReviews = JSON.parse(localStorage.getItem('productReviews')) || {};
    if (!allReviews[productName]) allReviews[productName] = [];

    allReviews[productName].push({ user, rating, text });
    localStorage.setItem('productReviews', JSON.stringify(allReviews));

//--- Update product stats---

    const product= window.products.find(p => p.name === productName);
    if (product) {
        const reviews = allReviews[productName];
        const totalRatings = reviews.reduce((sum, r) => sum + r.rating, 0);
        product.rating = (totalRatings / reviews.length).toFixed(1);
        product.reviews = reviews.length;

        localStorage.setItem('products', JSON.stringify(window.products));
    }

    // --- Re-render products to show new stats ---
    window.renderProducts();
    window.renderMyProducts?.();

    document.getElementById('reviewForm').reset();
    openReviewModal(productName );

    window.createNotification('Review added successfully!');
}



    // Filter products
    window.filterProducts = function() {
        const categoryFilter = document.getElementById('categoryFilter');
        const searchInput = document.getElementById('searchInput');

        if (!categoryFilter || !searchInput) return;

        const category = categoryFilter.value;
        const search = searchInput.value.toLowerCase();
        
        const filtered = window.products.filter(p => {
            return (category === 'All' || p.type === category) && 
                   (p.name.toLowerCase().includes(search) || p.seller.toLowerCase().includes(search));
        });
        window.renderProducts(filtered);
    };


    // --- TRAINING TABS ---

    window.showTrainingTab = function(tabId) {
        const tabs = ['financial', 'schemes', 'skill'];
        tabs.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = (id === tabId) ? 'block' : 'none';
        });
        // Update active class for button styling (if you add an active class in CSS)
        document.querySelectorAll('.training-tabs button').forEach(btn => {
            if (btn.onclick.toString().includes('${tabId}')) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    };
    
    // Initialize training tab on load
    if (getPageName() === 'training.html') {
        window.showTrainingTab('financial');
    }


    // --- MENTORSHIP ---

    window.renderMentors = function(filtered = []) {
        const grid = document.getElementById('mentorGrid');
        if (!grid) return;

        grid.innerHTML = '';
        const list = filtered.length ? filtered : window.mentors;

        list.forEach(m => {
            grid.innerHTML += `<div class="mentor-card">
                <h3>${m.name}</h3>
                <p>Category: <strong>${m.category}</strong></p>
                <p>Email: <strong>${m.email}</strong></p>
                <p>Experience: <strong>${m.experience}</strong></p>
                <p>Description: <strong>${m.description}</strong></p>
                <button class="gradient-button" onclick="bookSession('${m.name}')">Book Session</button>
            </div>`;
        });
    };

    window.filterMentors = function() {
        const mentorFilter = document.getElementById('mentorFilter');
        if (!mentorFilter) return;

        const cat = mentorFilter.value;
        const filtered = window.mentors.filter(m => cat === 'All' || m.category === cat);
        window.renderMentors(filtered);
    };



    // Initialize render mentors on load
    if (getPageName() === 'mentorship.html') {
        window.renderMentors();
    }


    // --- LANGUAGE TOGGLE (HOME PAGE ONLY) ---

    window.setupLanguageToggle = function() {
        const langToggleBtn = document.getElementById('langToggle');
        const headline = document.querySelector('#home-section h1');
        const subHeadline = document.querySelector('#home-section h2');
        
        if (!langToggleBtn || !headline || !subHeadline) return;

        let currentLang = localStorage.getItem('projectLang') || 'en';

        const setLanguage = (lang) => {
            langToggleBtn.textContent = lang === 'en' ? 'Hindi' : 'English';
            
            headline.textContent = lang === 'en' 
                ? headline.getAttribute('data-lang-en') : headline.getAttribute('data-lang-hi');
            subHeadline.textContent = lang === 'en' 
                ? subHeadline.getAttribute('data-lang-en') : subHeadline.getAttribute('data-lang-hi');

            localStorage.setItem('projectLang', lang);
            currentLang = lang;
        };

        setLanguage(currentLang);

        langToggleBtn.addEventListener('click', () => {
            const newLang = currentLang === 'en' ? 'hi' : 'en';
            setLanguage(newLang);
        });
    };
      
    // --- Booking Modal Functions for Mentorship Page ---
window.bookSession = function(mentorName) {
  document.getElementById('mentorName').textContent = mentorName;
  document.getElementById('bookingModal').style.display = 'block';
};

window.closeBookingModal = function() {
  document.getElementById('bookingModal').style.display = 'none';
};

window.confirmBooking = function(event) {
  event.preventDefault();
  const name = document.getElementById('userName').value;
  const email = document.getElementById('userEmail').value;
  const date = document.getElementById('sessionDate').value;
  const mentor = document.getElementById('mentorName').textContent;

  createNotification(`Session confirmed with ${mentor} on ${date}`);
  document.getElementById('bookingModal').style.display = 'none';
};

    // --- CHATBOT ---

    const botResponses = {
        'register': 'To register, please navigate to the Marketplace and click the Register/Login button to fill out the form.',
        'upload': 'You must Login in the Marketplace section first. After logging in, the Upload Product form will appear.',
        'mentor': 'Visit the Mentorship page. You can filter mentors by expertise and click the Book Session button on the mentor\'s card.',
        'training': 'The Training section offers educational videos across three tabs: Financial Literacy, Government Schemes, and Skill Development.',
        'contact': 'For immediate contact, you can use the seller\'s WhatsApp/Email listed on the product card in the Marketplace.',
        'default': 'I can help you with registration, uploading products, finding mentors, or training. Ask about those topics!',
        'greeting': 'Hello! I\'m the Rural Women Entrepreneurship Assistant. How can I help you today?',
    };

    const initializeChatbot = () => {
        const box = document.getElementById('chatbotBox');
        if (!box) return;

        box.innerHTML = `
            <div id="chatbotMessages"></div>
            <div id="chatbotInputContainer">
                <div class="quick-replies">
                    <button onclick="handleUserInput('How to register?')">How to register?</button>
                    <button onclick="handleUserInput('Upload product')">Upload product</button>
                    <button onclick="handleUserInput('Contact mentor')">Contact mentor</button>
                    <button onclick="handleUserInput('Know about training')">Know about training</button>
                </div>
                <input type="text" id="userInput" placeholder="Type your question..." onkeypress="if(event.key === 'Enter') handleUserInput(this.value)">
            </div>
        `;
        // Display initial greeting
        displayBotResponse('greeting');
    };

    window.toggleChatbot = function() {
        const box = document.getElementById('chatbotBox');
        if (box) {
            box.style.display = (box.style.display === 'flex') ? 'none' : 'flex';
        }
    };

    const displayBotResponse = (type, userInput = '') => {
        const msgDiv = document.getElementById('chatbotMessages');
        if (!msgDiv) return;

        let key = 'default';
        let prompt = userInput.toLowerCase();

        if (type !== 'greeting') {
            if (prompt.includes('register')) key = 'register';
            else if (prompt.includes('upload') || prompt.includes('product')) key = 'upload';
            else if (prompt.includes('mentor') || prompt.includes('session')) key = 'mentor';
            else if (prompt.includes('training') || prompt.includes('video') || prompt.includes('skill')) key = 'training';
            else if (prompt.includes('contact') || prompt.includes('seller')) key = 'contact';
        } else {
            key = 'greeting';
        }

        const botMsg = document.createElement('div');
        botMsg.className = 'bot-message';
        msgDiv.appendChild(botMsg);
        
        const msg = botResponses[key];
        let i = 0;
        
        // Typing animation
        function typing() {
            if (i < msg.length) {
                botMsg.innerHTML += msg.charAt(i);
                i++;
                setTimeout(typing, 30);
            } else {
                // Auto-scroll to the bottom
                msgDiv.scrollTop = msgDiv.scrollHeight;
            }
        }
        typing();
    };

    window.handleUserInput = function(input) {
        const inputField = document.getElementById('userInput');
        const msgDiv = document.getElementById('chatbotMessages');
        let text = input;

        if (!text && inputField) {
            text = inputField.value;
        }

        if (!text.trim()) return;

        // Display user message
        const userMsg = document.createElement('div');
        userMsg.className = 'user-message';
        userMsg.innerHTML = '<strong>You:</strong> ${text}';
        msgDiv.appendChild(userMsg);

        // Get and display bot response
        displayBotResponse('response', text);

        // Clear input field
        if (inputField) inputField.value = '';
    };


    // --- INITIALIZATION ---
    
    // Check which page we are on and run necessary functions
    const currentPage = getPageName();
    
    if (currentPage === 'index.html') {
        setupLanguageToggle();
    } else if (currentPage === 'marketplace.html') {
        updateMarketplaceUI();
        window.renderProducts();
        window.renderMyProducts();
    } else if (currentPage === 'mentorship.html') {
        window.renderMentors();
    }
    
    initializeChatbot();

    // --- WHATSAPP INTEGRATION ---
window.contactSeller = function(number, productName) {
    const msg =`Hi, I'm interested in your product: ${productName}`;
    const whatsappLink =`https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
    window.open(whatsappLink, "_blank");
};



// --- THEME TOGGLE ---
const themeBtn = document.getElementById('themeToggle');
if (themeBtn) {
  const currentTheme = localStorage.getItem('theme') || 'light';
  if (currentTheme === 'dark') document.body.classList.add('dark-mode');
  themeBtn.textContent = currentTheme === 'dark' ? '🌞' : '🌙';

  themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const newTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    themeBtn.textContent = newTheme === 'dark' ? '🌞' : '🌙';
  });
}
});