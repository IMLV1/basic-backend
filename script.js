// จำลองฐานข้อมูลสินค้า
const storeData = [
    {
        id: 1,
        name: "NVIDIA GeForce RTX 4090 24GB GDDR6X",
        type: "GPU",
        price: 75900,
        image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=400&q=80",
        rating: 5.0,
        sold: 24
    },
    {
        id: 2,
        name: "AMD Ryzen 9 7950X Processor (16-Core, 32-Thread)",
        type: "CPU",
        price: 22900,
        image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=400&q=80",
        rating: 4.8,
        sold: 156
    },
    {
        id: 3,
        name: "Razer BlackWidow V4 Pro Mechanical Gaming Keyboard",
        type: "Gear",
        price: 8490,
        image: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=400&q=80",
        rating: 4.9,
        sold: 312
    },
    {
        id: 4,
        name: "LG UltraGear 27 นิ้ว 165Hz Nano IPS 1ms",
        type: "Monitor",
        price: 12500,
        image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=400&q=80",
        rating: 4.7,
        sold: 89
    },
    {
        id: 5,
        name: "Logitech G Pro X Superlight Wireless Mouse",
        type: "Gear",
        price: 4990,
        image: "https://images.unsplash.com/photo-1527814050087-179f00495f03?auto=format&fit=crop&w=400&q=80",
        rating: 4.9,
        sold: 1240
    },
    {
        id: 6,
        name: "Corsair Vengeance RGB DDR5 32GB (16x2) 6000MHz",
        type: "RAM",
        price: 5200,
        image: "https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=400&q=80",
        rating: 4.8,
        sold: 450
    },
    {
        id: 7,
        name: "WD Black SN850X 2TB PCIe Gen4 NVMe M.2 SSD",
        type: "Storage",
        price: 6890,
        image: "https://images.unsplash.com/photo-1597849021482-559bf150eb01?auto=format&fit=crop&w=400&q=80",
        rating: 5.0,
        sold: 830
    },
    {
        id: 8,
        name: "NZXT Kraken Elite 360 RGB Liquid Cooler",
        type: "Cooling",
        price: 10500,
        image: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=400&q=80",
        rating: 4.6,
        sold: 120
    }
];

const productContainer = document.getElementById('productList');
let cartCount = 0;

// ฟังก์ชันสร้างดาว (Rating)
function generateStars(rating) {
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            starsHtml += '<i class="fa-solid fa-star"></i>';
        } else if (i - 0.5 === rating) {
            starsHtml += '<i class="fa-solid fa-star-half-stroke"></i>';
        } else {
            starsHtml += '<i class="fa-regular fa-star"></i>';
        }
    }
    return starsHtml;
}

// ฟังก์ชันเพิ่มลงตะกร้า
function addToCart(event, productName) {
    // ป้องกันไม่ให้คลิกปุ่มแล้วไปกระตุ้น event ของการ์ด
    event.stopPropagation();
    
    cartCount++;
    document.getElementById('cartBadge').innerText = cartCount;
    
    // แสดงลูกเล่นเด้งแจ้งเตือนที่ไอคอนตะกร้า
    const badge = document.getElementById('cartBadge');
    badge.style.transform = 'scale(1.5)';
    setTimeout(() => { badge.style.transform = 'scale(1)'; }, 200);
}

// ฟังก์ชันแสดงผลสินค้า
function renderProducts(products) {
    productContainer.innerHTML = '';

    if (products.length === 0) {
        productContainer.innerHTML = `
            <div class="no-result">
                <i class="fa-solid fa-box-open" style="font-size: 50px; margin-bottom: 15px; color: #cbd5e1;"></i>
                <h2 style="color: #475569;">ไม่พบสินค้าที่คุณค้นหา</h2>
                <p>ลองค้นหาด้วยคำอื่นดูนะครับ</p>
            </div>
        `;
        return;
    }

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.onclick = () => alert(`กำลังเปิดหน้ารายละเอียดของ:\n${product.name}`);

        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-price">฿${product.price.toLocaleString('th-TH')}</div>
                
                <div class="product-meta">
                    <span class="rating">${generateStars(product.rating)}</span>
                    <span class="sold">ขายแล้ว ${product.sold}</span>
                </div>
                
                <button class="add-to-cart-btn" onclick="addToCart(event, '${product.name}')">
                    <i class="fa-solid fa-cart-plus"></i> เพิ่มลงตะกร้า
                </button>
            </div>
        `;
        productContainer.appendChild(card);
    });
}

// ฟังก์ชันค้นหา
function searchProducts() {
    const keyword = document.getElementById('searchInput').value.toLowerCase();
    
    const filtered = storeData.filter(product => {
        return product.name.toLowerCase().includes(keyword) || 
               product.type.toLowerCase().includes(keyword);
    });

    renderProducts(filtered);
}

// เรียกให้แสดงสินค้าเมื่อโหลดหน้าเว็บเสร็จ
renderProducts(storeData);