/* =========================================================
   SHOPPING WEBSITE - MAIN JAVASCRIPT
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       1. GLOBAL VARIABLES
       ===================================================== */

    let cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

    const PRODUCTS = [];

    /* =====================================================
       2. COMMON SELECTORS
       ===================================================== */

    const productContainer = document.querySelector("#products");
    const searchForm = document.querySelector("#search form");
    const searchInput = document.querySelector(
        '#search input[type="search"], #search input[type="text"]'
    );

    /* =====================================================
       3. GET PRODUCTS FROM HTML
       ===================================================== */

    function loadProductsFromHTML() {

        if (!productContainer) {
            return;
        }

        const productCards = productContainer.querySelectorAll("article");

        productCards.forEach(function (card, index) {

            const titleElement =
                card.querySelector("h3, h4, h2");

            const priceElement =
                card.querySelector(".price, strong");

            const imageElement =
                card.querySelector("img");

            const buttonElements =
                card.querySelectorAll("button");

            let title = titleElement
                ? titleElement.textContent.trim()
                : "Product " + (index + 1);

            let priceText = priceElement
                ? priceElement.textContent
                : "0";

            let priceMatch =
                priceText.replace(/,/g, "").match(/[\d]+(\.\d+)?/);

            let price =
                priceMatch
                    ? Number(priceMatch[0])
                    : 0;

            let image =
                imageElement
                    ? imageElement.src
                    : "";

            PRODUCTS.push({
                id: index + 1,
                name: title,
                price: price,
                image: image,
                element: card
            });

            /* Add button */
            if (buttonElements[0]) {

                buttonElements[0].addEventListener(
                    "click",
                    function () {
                        addToCart(PRODUCTS[index]);
                    }
                );
            }

            /* Buy Now button */
            if (buttonElements[1]) {

                buttonElements[1].addEventListener(
                    "click",
                    function () {

                        addToCart(PRODUCTS[index]);

                        setTimeout(function () {
                            scrollToSection("cart");
                        }, 200);
                    }
                );
            }

        });

    }

    loadProductsFromHTML();


    /* =====================================================
       4. LOCAL STORAGE
       ===================================================== */

    function saveCart() {

        localStorage.setItem(
            "shoppingCart",
            JSON.stringify(cart)
        );

    }

    function saveWishlist() {

        localStorage.setItem(
            "wishlist",
            JSON.stringify(wishlist)
        );

    }


    /* =====================================================
       5. ADD TO CART
       ===================================================== */

    function addToCart(product) {

        if (!product) {
            return;
        }

        const existingProduct =
            cart.find(function (item) {
                return item.id === product.id;
            });

        if (existingProduct) {

            existingProduct.quantity += 1;

        } else {

            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });

        }

        saveCart();
        updateCartCount();
        renderCart();

        showMessage(
            product.name + " added to cart!"
        );

    }


    /* =====================================================
       6. REMOVE FROM CART
       ===================================================== */

    function removeFromCart(productId) {

        cart =
            cart.filter(function (item) {
                return item.id !== productId;
            });

        saveCart();

        updateCartCount();
        renderCart();

        showMessage("Product removed from cart.");

    }


    /* =====================================================
       7. CHANGE QUANTITY
       ===================================================== */

    function changeQuantity(productId, change) {

        const product =
            cart.find(function (item) {
                return item.id === productId;
            });

        if (!product) {
            return;
        }

        product.quantity += change;

        if (product.quantity <= 0) {

            removeFromCart(productId);
            return;

        }

        saveCart();
        updateCartCount();
        renderCart();

    }


    /* =====================================================
       8. CART COUNT
       ===================================================== */

    function updateCartCount() {

        const totalItems =
            cart.reduce(
                function (total, item) {
                    return total + item.quantity;
                },
                0
            );

        let cartLink =
            document.querySelector('a[href="#cart"]');

        if (!cartLink) {
            return;
        }

        let badge =
            cartLink.querySelector(".cart-count");

        if (!badge) {

            badge =
                document.createElement("span");

            badge.className = "cart-count";

            cartLink.appendChild(badge);

        }

        badge.textContent = totalItems;

        badge.style.cssText = `
            background:#e53935;
            color:white;
            border-radius:50%;
            padding:3px 7px;
            margin-left:5px;
            font-size:12px;
            font-weight:bold;
        `;

    }


    /* =====================================================
       9. CALCULATE CART TOTAL
       ===================================================== */

    function calculateSubtotal() {

        return cart.reduce(
            function (total, item) {

                return total +
                    (item.price * item.quantity);

            },
            0
        );

    }


    /* =====================================================
       10. CART HTML
       ===================================================== */

    function renderCart() {

        const cartSection =
            document.querySelector("#cart");

        if (!cartSection) {
            return;
        }

        if (cart.length === 0) {

            cartSection.innerHTML = `
                <h2>Your Shopping Cart</h2>

                <div class="empty-cart">
                    <h3>🛒 Your cart is empty</h3>
                    <p>Add some products to your cart.</p>
                    <button onclick="scrollToSection('products')">
                        Continue Shopping
                    </button>
                </div>
            `;

            return;
        }

        let rows = "";

        cart.forEach(function (item) {

            const itemTotal =
                item.price * item.quantity;

            rows += `
                <tr>

                    <td>
                        <img
                            src="${item.image}"
                            alt="${item.name}"
                            width="70"
                            height="70"
                            style="object-fit:cover;"
                        >
                    </td>

                    <td>
                        ${item.name}
                    </td>

                    <td>
                        ₹${item.price.toFixed(2)}
                    </td>

                    <td>

                        <button
                            onclick="changeQuantity(${item.id}, -1)"
                        >
                            −
                        </button>

                        <span
                            style="
                                margin:0 10px;
                                font-weight:bold;
                            "
                        >
                            ${item.quantity}
                        </span>

                        <button
                            onclick="changeQuantity(${item.id}, 1)"
                        >
                            +
                        </button>

                    </td>

                    <td>
                        ₹${itemTotal.toFixed(2)}
                    </td>

                    <td>

                        <button
                            onclick="removeFromCart(${item.id})"
                        >
                            Remove
                        </button>

                    </td>

                </tr>
            `;

        });

        const subtotal =
            calculateSubtotal();

        const shipping =
            subtotal >= 999
                ? 0
                : 49;

        const total =
            subtotal + shipping;

        cartSection.innerHTML = `

            <h2>Your Shopping Cart</h2>

            <div class="cart-wrapper">

                <table>

                    <thead>

                        <tr>
                            <th>Image</th>
                            <th>Product</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Total</th>
                            <th>Action</th>
                        </tr>

                    </thead>

                    <tbody>
                        ${rows}
                    </tbody>

                </table>

                <div class="cart-summary">

                    <h3>Cart Summary</h3>

                    <p>
                        Subtotal:
                        <strong>
                            ₹${subtotal.toFixed(2)}
                        </strong>
                    </p>

                    <p>
                        Shipping:
                        <strong>
                            ${shipping === 0
                                ? "FREE"
                                : "₹" + shipping.toFixed(2)}
                        </strong>
                    </p>

                    <hr>

                    <h3>
                        Total:
                        ₹${total.toFixed(2)}
                    </h3>

                    <button
                        onclick="scrollToSection('checkout')"
                    >
                        Proceed to Checkout
                    </button>

                    <button
                        onclick="clearCart()"
                    >
                        Clear Cart
                    </button>

                </div>

            </div>
        `;

    }


    /* =====================================================
       11. CLEAR CART
       ===================================================== */

    function clearCart() {

        if (cart.length === 0) {
            return;
        }

        const confirmation =
            confirm(
                "Are you sure you want to clear your cart?"
            );

        if (!confirmation) {
            return;
        }

        cart = [];

        saveCart();
        updateCartCount();
        renderCart();

        showMessage("Cart cleared.");

    }


    /* =====================================================
       12. SEARCH PRODUCTS
       ===================================================== */

    function searchProducts(keyword) {

        const searchText =
            keyword
                .toLowerCase()
                .trim();

        PRODUCTS.forEach(function (product) {

            const productName =
                product.name.toLowerCase();

            if (
                searchText === "" ||
                productName.includes(searchText)
            ) {

                product.element.style.display = "";

            } else {

                product.element.style.display = "none";

            }

        });

    }


    /* =====================================================
       13. SEARCH FORM
       ===================================================== */

    if (searchForm) {

        searchForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                if (!searchInput) {
                    return;
                }

                searchProducts(
                    searchInput.value
                );

                scrollToSection("products");

            }
        );

    }


    /* =====================================================
       14. LIVE SEARCH
       ===================================================== */

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            function () {

                searchProducts(
                    searchInput.value
                );

            }
        );

    }


    /* =====================================================
       15. WISHLIST
       ===================================================== */

    function addToWishlist(product) {

        if (!product) {
            return;
        }

        const exists =
            wishlist.some(function (item) {
                return item.id === product.id;
            });

        if (exists) {

            showMessage(
                "Already added to wishlist."
            );

            return;
        }

        wishlist.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image
        });

        saveWishlist();

        showMessage(
            product.name +
            " added to wishlist ❤️"
        );

    }


    /* =====================================================
       16. WISHLIST BUTTONS
       ===================================================== */

    PRODUCTS.forEach(function (product) {

        const wishlistButton =
            document.createElement("button");

        wishlistButton.textContent = "♡ Wishlist";

        wishlistButton.className =
            "wishlist-button";

        wishlistButton.addEventListener(
            "click",
            function () {
                addToWishlist(product);
            }
        );

        product.element.appendChild(
            wishlistButton
        );

    });


    /* =====================================================
       17. DISPLAY WISHLIST
       ===================================================== */

    function showWishlist() {

        if (wishlist.length === 0) {

            showMessage(
                "Your wishlist is empty."
            );

            return;
        }

        let text =
            "❤️ Wishlist:\n\n";

        wishlist.forEach(function (item, index) {

            text +=
                (index + 1) +
                ". " +
                item.name +
                " - ₹" +
                item.price +
                "\n";

        });

        alert(text);

    }


    /* =====================================================
       18. CREATE WISHLIST LINK
       ===================================================== */

    const nav =
        document.querySelector("nav");

    if (nav) {

        const wishlistButton =
            document.createElement("button");

        wishlistButton.textContent =
            "❤️ Wishlist";

        wishlistButton.addEventListener(
            "click",
            showWishlist
        );

        nav.appendChild(
            wishlistButton
        );

    }


    /* =====================================================
       19. DARK MODE
       ===================================================== */

    function createDarkModeButton() {

        const button =
            document.createElement("button");

        button.id =
            "darkModeButton";

        button.textContent =
            "🌙 Dark Mode";

        button.style.cssText = `
            position:fixed;
            right:20px;
            bottom:20px;
            z-index:9999;
            padding:12px 18px;
            border:none;
            border-radius:25px;
            cursor:pointer;
            box-shadow:0 4px 15px rgba(0,0,0,.2);
        `;

        document.body.appendChild(button);

        const darkMode =
            localStorage.getItem(
                "darkMode"
            );

        if (darkMode === "true") {
            enableDarkMode();
        }

        button.addEventListener(
            "click",
            function () {

                const enabled =
                    document.body.classList
                        .contains("dark-mode");

                if (enabled) {

                    disableDarkMode();

                } else {

                    enableDarkMode();

                }

            }
        );

    }

    function enableDarkMode() {

        document.body.classList
            .add("dark-mode");

        localStorage.setItem(
            "darkMode",
            "true"
        );

    }

    function disableDarkMode() {

        document.body.classList
            .remove("dark-mode");

        localStorage.setItem(
            "darkMode",
            "false"
        );

    }

    createDarkModeButton();


    /* =====================================================
       20. DARK MODE CSS
       ===================================================== */

    const darkStyle =
        document.createElement("style");

    darkStyle.textContent = `

        body.dark-mode {
            background:#121212;
            color:#f5f5f5;
        }

        body.dark-mode header,
        body.dark-mode footer,
        body.dark-mode section,
        body.dark-mode article {
            background:#1e1e1e;
            color:#f5f5f5;
        }

        body.dark-mode input,
        body.dark-mode textarea,
        body.dark-mode select {
            background:#2b2b2b;
            color:white;
            border-color:#555;
        }

        body.dark-mode table {
            background:#1e1e1e;
            color:white;
        }

        body.dark-mode th,
        body.dark-mode td {
            border-color:#555;
        }

        body.dark-mode a {
            color:#80cbc4;
        }

    `;

    document.head.appendChild(
        darkStyle
    );


    /* =====================================================
       21. COUPON SYSTEM
       ===================================================== */

    const coupons = {

        SAVE10: 10,
        SAVE20: 20,
        WELCOME: 15,
        FESTIVE: 25

    };

    let appliedCoupon = null;

    function applyCoupon(code) {

        code =
            code
                .toUpperCase()
                .trim();

        if (!coupons[code]) {

            showMessage(
                "Invalid coupon code."
            );

            return;

        }

        appliedCoupon = code;

        showMessage(
            "Coupon " +
            code +
            " applied successfully!"
        );

        renderCart();

    }


    /* =====================================================
       22. FINAL TOTAL WITH DISCOUNT
       ===================================================== */

    function calculateDiscount() {

        if (!appliedCoupon) {
            return 0;
        }

        const subtotal =
            calculateSubtotal();

        const percentage =
            coupons[appliedCoupon];

        return (
            subtotal *
            percentage /
            100
        );

    }


    /* =====================================================
       23. CHECKOUT FORM
       ===================================================== */

    const checkoutForm =
        document.querySelector(
            "#checkout form"
        );

    if (checkoutForm) {

        checkoutForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                if (cart.length === 0) {

                    alert(
                        "Your cart is empty."
                    );

                    return;

                }

                const name =
                    checkoutForm.querySelector(
                        '[name="name"]'
                    );

                const email =
                    checkoutForm.querySelector(
                        '[type="email"]'
                    );

                const phone =
                    checkoutForm.querySelector(
                        '[type="tel"]'
                    );

                if (
                    name &&
                    name.value.trim() === ""
                ) {

                    alert(
                        "Please enter your name."
                    );

                    name.focus();

                    return;

                }

                if (
                    email &&
                    !isValidEmail(email.value)
                ) {

                    alert(
                        "Please enter a valid email."
                    );

                    email.focus();

                    return;

                }

                if (
                    phone &&
                    phone.value.trim() === ""
                ) {

                    alert(
                        "Please enter your phone number."
                    );

                    phone.focus();

                    return;

                }

                placeOrder();

            }
        );

    }


    /* =====================================================
       24. EMAIL VALIDATION
       ===================================================== */

    function isValidEmail(email) {

        const pattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        return pattern.test(email);

    }


    /* =====================================================
       25. PLACE ORDER
       ===================================================== */

    function placeOrder() {

        const subtotal =
            calculateSubtotal();

        const discount =
            calculateDiscount();

        const afterDiscount =
            subtotal - discount;

        const shipping =
            afterDiscount >= 999
                ? 0
                : 49;

        const finalTotal =
            afterDiscount + shipping;

        const orderNumber =
            "ORD" +
            Date.now()
                .toString()
                .slice(-8);

        localStorage.setItem(
            "lastOrder",
            JSON.stringify({
                orderNumber: orderNumber,
                total: finalTotal,
                date: new Date().toLocaleString(),
                status: "Order Confirmed"
            })
        );

        alert(
            "Order placed successfully!\n\n" +
            "Order ID: " +
            orderNumber +
            "\n" +
            "Amount: ₹" +
            finalTotal.toFixed(2)
        );

        cart = [];

        saveCart();

        updateCartCount();
        renderCart();

        scrollToSection("track-order");

    }


    /* =====================================================
       26. TRACK ORDER
       ===================================================== */

    const trackForm =
        document.querySelector(
            "#track-order form"
        );

    if (trackForm) {

        trackForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                const input =
                    trackForm.querySelector(
                        "input"
                    );

                if (!input) {
                    return;
                }

                const orderId =
                    input.value.trim();

                trackOrder(orderId);

            }
        );

    }


    function trackOrder(orderId) {

        const lastOrder =
            JSON.parse(
                localStorage.getItem(
                    "lastOrder"
                )
            );

        if (
            lastOrder &&
            lastOrder.orderNumber === orderId
        ) {

            alert(
                "Order Found!\n\n" +
                "Order ID: " +
                lastOrder.orderNumber +
                "\n" +
                "Status: " +
                lastOrder.status +
                "\n" +
                "Date: " +
                lastOrder.date
            );

        } else {

            alert(
                "Order not found.\n" +
                "Please check your Order ID."
            );

        }

    }


    /* =====================================================
       27. CONTACT FORM
       ===================================================== */

    const contactForms =
        document.querySelectorAll(
            "#contact form"
        );

    contactForms.forEach(
        function (form) {

            form.addEventListener(
                "submit",
                function (event) {

                    event.preventDefault();

                    alert(
                        "Thank you! Your message has been submitted."
                    );

                    form.reset();

                }
            );

        }
    );


    /* =====================================================
       28. REVIEW FORM
       ===================================================== */

    const reviewForms =
        document.querySelectorAll(
            "#reviews form"
        );

    reviewForms.forEach(
        function (form) {

            form.addEventListener(
                "submit",
                function (event) {

                    event.preventDefault();

                    alert(
                        "Thank you for your review!"
                    );

                    form.reset();

                }
            );

        }
    );


    /* =====================================================
       29. NEWSLETTER FORM
       ===================================================== */

    const newsletterForms =
        document.querySelectorAll(
            "#newsletter form"
        );

    newsletterForms.forEach(
        function (form) {

            form.addEventListener(
                "submit",
                function (event) {

                    event.preventDefault();

                    const email =
                        form.querySelector(
                            'input[type="email"]'
                        );

                    if (
                        email &&
                        !isValidEmail(
                            email.value
                        )
                    ) {

                        alert(
                            "Please enter a valid email."
                        );

                        return;

                    }

                    alert(
                        "Successfully subscribed!"
                    );

                    form.reset();

                }
            );

        }
    );


    /* =====================================================
       30. FEEDBACK FORM
       ===================================================== */

    const feedbackForms =
        document.querySelectorAll(
            "#feedback form"
        );

    feedbackForms.forEach(
        function (form) {

            form.addEventListener(
                "submit",
                function (event) {

                    event.preventDefault();

                    alert(
                        "Thank you for your valuable feedback!"
                    );

                    form.reset();

                }
            );

        }
    );


    /* =====================================================
       31. NAVIGATION
       ===================================================== */

    function scrollToSection(id) {

        const section =
            document.getElementById(id);

        if (!section) {
            return;
        }

        section.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }


    /* =====================================================
       32. MAKE ALL INTERNAL LINKS SMOOTH
       ===================================================== */

    const internalLinks =
        document.querySelectorAll(
            'a[href^="#"]'
        );

    internalLinks.forEach(
        function (link) {

            link.addEventListener(
                "click",
                function (event) {

                    const targetId =
                        link.getAttribute(
                            "href"
                        );

                    if (
                        targetId &&
                        targetId !== "#"
                    ) {

                        const target =
                            document.querySelector(
                                targetId
                            );

                        if (target) {

                            event.preventDefault();

                            target.scrollIntoView({
                                behavior: "smooth"
                            });

                        }

                    }

                }
            );

        }
    );


    /* =====================================================
       33. BACK TO TOP BUTTON
       ===================================================== */

    const topButton =
        document.createElement("button");

    topButton.textContent =
        "↑";

    topButton.id =
        "backToTop";

    topButton.style.cssText = `
        position:fixed;
        right:20px;
        bottom:75px;
        width:45px;
        height:45px;
        border:none;
        border-radius:50%;
        cursor:pointer;
        display:none;
        z-index:9998;
        font-size:20px;
        font-weight:bold;
    `;

    document.body.appendChild(
        topButton
    );

    window.addEventListener(
        "scroll",
        function () {

            if (window.scrollY > 400) {

                topButton.style.display =
                    "block";

            } else {

                topButton.style.display =
                    "none";

            }

        }
    );

    topButton.addEventListener(
        "click",
        function () {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );


    /* =====================================================
       34. SUCCESS MESSAGE
       ===================================================== */

    function showMessage(message) {

        const oldMessage =
            document.querySelector(
                ".website-message"
            );

        if (oldMessage) {
            oldMessage.remove();
        }

        const box =
            document.createElement("div");

        box.className =
            "website-message";

        box.textContent =
            message;

        box.style.cssText = `
            position:fixed;
            top:20px;
            right:20px;
            background:#222;
            color:white;
            padding:15px 20px;
            border-radius:8px;
            z-index:10000;
            box-shadow:0 5px 20px rgba(0,0,0,.25);
            animation:slideIn .3s ease;
        `;

        document.body.appendChild(box);

        setTimeout(
            function () {

                box.style.opacity = "0";

                setTimeout(
                    function () {
                        box.remove();
                    },
                    300
                );

            },
            2500
        );

    }


    /* =====================================================
       35. PRODUCT SORTING
       ===================================================== */

    function sortProducts(type) {

        if (!productContainer) {
            return;
        }

        const sorted =
            [...PRODUCTS].sort(
                function (a, b) {

                    if (type === "low") {
                        return a.price - b.price;
                    }

                    if (type === "high") {
                        return b.price - a.price;
                    }

                    if (type === "name") {
                        return a.name.localeCompare(
                            b.name
                        );
                    }

                    return a.id - b.id;

                }
            );

        sorted.forEach(
            function (product) {

                productContainer.appendChild(
                    product.element
                );

            }
        );

    }


    /* =====================================================
       36. SORT DROPDOWN
       ===================================================== */

    const sortSelect =
        document.querySelector(
            "#sortProducts"
        );

    if (sortSelect) {

        sortSelect.addEventListener(
            "change",
            function () {

                sortProducts(
                    sortSelect.value
                );

            }
        );

    }


    /* =====================================================
       37. CATEGORY FILTER
       ===================================================== */

    function filterCategory(category) {

        PRODUCTS.forEach(
            function (product) {

                const text =
                    product.element.textContent
                        .toLowerCase();

                if (
                    category === "all" ||
                    text.includes(
                        category.toLowerCase()
                    )
                ) {

                    product.element.style.display =
                        "";

                } else {

                    product.element.style.display =
                        "none";

                }

            }
        );

    }


    /* =====================================================
       38. PRICE FILTER
       ===================================================== */

    function filterPrice(maxPrice) {

        PRODUCTS.forEach(
            function (product) {

                if (
                    product.price <= maxPrice
                ) {

                    product.element.style.display =
                        "";

                } else {

                    product.element.style.display =
                        "none";

                }

            }
        );

    }


    /* =====================================================
       39. KEYBOARD SHORTCUT
       ===================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            /* Ctrl + K = Search */

            if (
                event.ctrlKey &&
                event.key.toLowerCase() === "k"
            ) {

                event.preventDefault();

                if (searchInput) {

                    searchInput.focus();

                }

            }

            /* Escape = Clear search */

            if (
                event.key === "Escape"
            ) {

                if (searchInput) {

                    searchInput.value = "";

                    searchProducts("");

                }

            }

        }
    );


    /* =====================================================
       40. PAGE LOADING
       ===================================================== */

    function showPageLoadedMessage() {

        setTimeout(
            function () {

                showMessage(
                    "Welcome to our shopping website! 🛍️"
                );

            },
            500
        );

    }


    /* =====================================================
       41. INITIALIZE WEBSITE
       ===================================================== */

    updateCartCount();

    renderCart();

    showPageLoadedMessage();


    /* =====================================================
       42. GLOBAL FUNCTIONS
       ===================================================== */

    window.addToCart =
        addToCart;

    window.removeFromCart =
        removeFromCart;

    window.changeQuantity =
        changeQuantity;

    window.clearCart =
        clearCart;

    window.scrollToSection =
        scrollToSection;

    window.applyCoupon =
        applyCoupon;

    window.trackOrder =
        trackOrder;

    window.sortProducts =
        sortProducts;

    window.filterCategory =
        filterCategory;

    window.filterPrice =
        filterPrice;

});