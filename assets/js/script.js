/* ==========================================================
   Nar Shop – jQuery + localStorage
   Bütün DOM əməliyyatları jQuery ilə aparılır.
   ========================================================== */
   $(document).ready(function () {

    /* ---------- 1. Constants & helpers ---------- */
    const PRODUCTS_KEY = "nar_products";
    const CART_KEY = "nar_cart";
  
    // Şəkil yüklənməyəndə göstərilən ehtiyat şəkil (SVG data URI)
    function svgImg(emoji, c1, c2) {
      const svg =
        "<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'>" +
        "<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>" +
        "<stop offset='0' stop-color='" + c1 + "'/><stop offset='1' stop-color='" + c2 + "'/>" +
        "</linearGradient></defs><rect width='400' height='300' fill='url(#g)'/>" +
        "<text x='200' y='195' font-size='120' text-anchor='middle'>" + emoji + "</text></svg>";
      return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    }
    const FALLBACK_IMG = svgImg("🖼️", "#e9e0d9", "#faf6f1");
  
    function money(n) {
      return Number(n).toFixed(2) + " ₼";
    }
  
    function load(key) {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      try { return JSON.parse(raw); } catch (e) { return null; }
    }
  
    /* ---------- 2. Default data (min. 6 products) ---------- */
    const DEFAULT_PRODUCTS = [
      { id: 1, name: "Wireless Headphones", price: 89.9, category: "Electronics",
        description: "Over-ear headphones with active noise cancelling and 30 hours of battery life.",
        image: svgImg("🎧", "#ffd9e2", "#f4a3b8") },
      { id: 2, name: "Smart Watch", price: 129.0, category: "Electronics",
        description: "Tracks steps, sleep and heart rate. Water resistant up to 50 meters.",
        image: svgImg("⌚", "#d8e8ff", "#9bbcf2") },
      { id: 3, name: "Running Shoes", price: 74.5, category: "Clothing",
        description: "Lightweight shoes with a breathable mesh upper and a cushioned sole.",
        image: svgImg("👟", "#ffe9bf", "#f2b134") },
      { id: 4, name: "Travel Backpack", price: 42.0, category: "Accessories",
        description: "25-liter backpack with a laptop sleeve and a hidden anti-theft pocket.",
        image: svgImg("🎒", "#dcefd9", "#8cc58a") },
      { id: 5, name: "Sunglasses", price: 28.9, category: "Accessories",
        description: "Polarized lenses with UV400 protection and a flexible frame.",
        image: svgImg("🕶️", "#e6dcf5", "#b19ae0") },
      { id: 6, name: "Ceramic Coffee Mug", price: 12.5, category: "Home",
        description: "Hand-glazed 350 ml mug. Dishwasher and microwave safe.",
        image: svgImg("☕", "#f7e0cf", "#e5a77b") },
      { id: 7, name: "Desk Lamp", price: 35.0, category: "Home",
        description: "LED lamp with three brightness levels and a USB charging port.",
        image: svgImg("💡", "#fff3c4", "#f6d55c") },
      { id: 8, name: "Bluetooth Speaker", price: 59.9, category: "Electronics",
        description: "Portable speaker with deep bass and 12 hours of playtime.",
        image: svgImg("🔊", "#cfeceb", "#79c4c1") }
    ];
  
    /* ---------- 3. State (read from localStorage on page load) ---------- */
    let products = load(PRODUCTS_KEY);
    if (!products) {
      products = DEFAULT_PRODUCTS;
      saveProducts();
    }
    let cart = load(CART_KEY) || [];
  
    function saveProducts() {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    }
    function saveCart() {
      if (cart.length === 0) {
        localStorage.removeItem(CART_KEY);   // Clear Cart → localStorage təmizlənir
      } else {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
      }
    }
  
    /* ---------- 4. Toast ---------- */
    function toast(msg, isError) {
      $("#toast")
        .stop(true, true)
        .text(msg)
        .css("background", isError ? "#c0262d" : "#2a1f24")
        .fadeIn(200)
        .delay(1600)
        .fadeOut(300);
    }
  
    /* ---------- 5. Categories ---------- */
    function renderCategories() {
      const current = $("#categoryFilter").val() || "all";
      const cats = [];
      $.each(products, function (_, p) {
        if ($.inArray(p.category, cats) === -1) cats.push(p.category);
      });
      cats.sort();
  
      const $sel = $("#categoryFilter").empty();
      const $list = $("#categoryList").empty();
      $.each(cats, function (_, c) {
        $sel.append($("<option>").val(c).text(c));
        $list.append($("<option>").val(c));
      });
      $sel.prepend($("<option>").val("all").text("All categories"));
      $sel.val($.inArray(current, cats) !== -1 ? current : "all");
    }
  
    /* ---------- 6. Product list ---------- */
    function buildCard(p) {
      const $c = $(
        '<article class="card">' +
          '<div class="img-wrap" title="Double-click to show the price">' +
            '<img alt="">' +
            '<div class="price-pop" style="display:none;"></div>' +
          "</div>" +
          '<div class="card-body">' +
            '<span class="tag"></span>' +
            "<h3></h3>" +
            '<div class="price"></div>' +
            '<p class="desc" style="display:none;"></p>' +
            '<div class="actions">' +
              '<button type="button" class="btn-desc">Details</button>' +
              '<button type="button" class="btn-add">Add to cart</button>' +
            "</div>" +
            '<div class="admin">' +
              '<button type="button" class="btn-edit">Edit</button>' +
              '<button type="button" class="btn-del">Delete</button>' +
            "</div>" +
          "</div>" +
        "</article>"
      );
      $c.attr("data-id", p.id);
      $c.find("img").attr({ src: p.image, alt: p.name }).one("error", function () {
        $(this).attr("src", FALLBACK_IMG);
      });
      $c.find(".price-pop").text(money(p.price));
      $c.find(".tag").text(p.category);
      $c.find("h3").text(p.name);
      $c.find(".price").text(money(p.price));
      $c.find(".desc").text(p.description);
      return $c;
    }
  
    function renderProducts(newId) {
      const q = $.trim($("#searchInput").val()).toLowerCase();
      const cat = $("#categoryFilter").val() || "all";
      const sort = $("#sortSelect").val();
  
      let list = $.grep(products, function (p) {
        const byName = p.name.toLowerCase().indexOf(q) !== -1;
        const byCat = cat === "all" || p.category === cat;
        return byName && byCat;
      });
  
      if (sort === "asc") list.sort(function (a, b) { return a.price - b.price; });
      if (sort === "desc") list.sort(function (a, b) { return b.price - a.price; });
  
      const $grid = $("#productGrid").empty();
      $("#totalCount").text(products.length);
      $("#shownCount").text(list.length);
  
      if (list.length === 0) {
        $("#noProducts").show();
      } else {
        $("#noProducts").hide();
      }
  
      $.each(list, function (_, p) {
        const $card = buildCard(p);
        $grid.append($card);
        if (p.id === newId) {
          $card.hide().slideDown(450);     // yeni məhsul → slideDown()
        }
      });
    }
  
    /* ---------- 7. Cart ---------- */
    function cartCount() {
      let n = 0;
      $.each(cart, function (_, i) { n += i.qty; });
      return n;
    }
  
    function renderCart() {
      const $items = $("#cartItems").empty();
      let total = 0;
  
      // Silinmiş məhsulları səbətdən təmizlə
      cart = $.grep(cart, function (i) {
        return $.grep(products, function (p) { return p.id === i.id; }).length > 0;
      });
  
      $.each(cart, function (_, i) {
        const p = $.grep(products, function (x) { return x.id === i.id; })[0];
        const line = p.price * i.qty;
        total += line;
  
        const $row = $(
          '<div class="cart-item">' +
            '<img alt="">' +
            "<div>" +
              '<div class="ci-name"></div>' +
              '<div class="ci-price"></div>' +
              '<div class="qty">' +
                '<button type="button" class="qty-minus" aria-label="Decrease quantity">−</button>' +
                "<span></span>" +
                '<button type="button" class="qty-plus" aria-label="Increase quantity">+</button>' +
              "</div>" +
            "</div>" +
            '<div class="ci-side">' +
              '<div class="ci-line"></div>' +
              '<button type="button" class="btn-remove">Remove</button>' +
            "</div>" +
          "</div>"
        );
        $row.attr("data-id", p.id);
        $row.find("img").attr({ src: p.image, alt: p.name }).one("error", function () {
          $(this).attr("src", FALLBACK_IMG);
        });
        $row.find(".ci-name").text(p.name);
        $row.find(".ci-price").text(money(p.price) + " each");
        $row.find(".qty span").text(i.qty);
        $row.find(".ci-line").text(money(line));
        $items.append($row);
      });
  
      $("#cartTotal").text(money(total));
      $("#cartCount").text(cartCount());
  
      if (cart.length === 0) {
        $("#cartEmpty").show();
        $("#cartFooter").hide();
      } else {
        $("#cartEmpty").hide();
        $("#cartFooter").show();
      }
      saveCart();
    }
  
    function bumpBadge() {
      $("#cartCount")
        .stop(true, true)
        .animate({ fontSize: "1.2rem" }, 120)
        .animate({ fontSize: ".82rem" }, 120);
    }
  
    function addToCart(id) {
      const found = $.grep(cart, function (i) { return i.id === id; })[0];
      if (found) {
        found.qty += 1;                    // eyni məhsul → quantity artır
      } else {
        cart.push({ id: id, qty: 1 });
      }
      renderCart();
      bumpBadge();
      toast("Added to cart");
    }
  
    function removeFromCart(id, $row) {
      $row.fadeOut(250, function () {
        $(this).remove();
        cart = $.grep(cart, function (i) { return i.id !== id; });
        renderCart();
      });
    }
  
    function changeQty(id, delta, $row) {
      const item = $.grep(cart, function (i) { return i.id === id; })[0];
      if (!item) return;
      const next = item.qty + delta;
      if (next <= 0) {                     // quantity 0 → məhsul silinir
        removeFromCart(id, $row);
      } else {
        item.qty = next;
        renderCart();
      }
    }
  
    /* ---------- 8. Form ---------- */
    function clearErrors() {
      $(".error").empty();
      $(".form-group").removeClass("invalid");
    }
  
    function showError(inputSel, errSel, msg) {
      $(inputSel).closest(".form-group").addClass("invalid");
      $(errSel).text(msg).hide().slideDown(150);
    }
  
    function resetForm() {
      $("#productForm").trigger("reset");
      $("#editId").val("");
      $("#formTitle").text("Add a new product");
      $("#submitBtn").text("Add product");
      clearErrors();
    }
  
    function validate() {
      clearErrors();
      let ok = true;
      const name = $.trim($("#pName").val());
      const priceRaw = $.trim($("#pPrice").val()).replace(",", ".");
      const price = Number(priceRaw);
      const cat = $.trim($("#pCategory").val());
      const img = $.trim($("#pImage").val());
      const desc = $.trim($("#pDesc").val());
  
      if (name === "") { showError("#pName", "#errName", "Product Name is required."); ok = false; }
      else if (name.length < 3) { showError("#pName", "#errName", "Product Name must be at least 3 characters."); ok = false; }
  
      if (priceRaw === "") { showError("#pPrice", "#errPrice", "Price is required."); ok = false; }
      else if (isNaN(price) || price <= 0) { showError("#pPrice", "#errPrice", "Price must be a number greater than 0."); ok = false; }
  
      if (cat === "") { showError("#pCategory", "#errCategory", "Category is required."); ok = false; }
      if (img === "") { showError("#pImage", "#errImage", "Image URL is required."); ok = false; }
      if (desc === "") { showError("#pDesc", "#errDesc", "Description is required."); ok = false; }
  
      return ok ? { name: name, price: price, category: cat, image: img, description: desc } : null;
    }
  
    function startEdit(id) {
      const p = $.grep(products, function (x) { return x.id === id; })[0];
      if (!p) return;
      clearErrors();
      $("#editId").val(p.id);
      $("#pName").val(p.name);
      $("#pPrice").val(p.price);
      $("#pCategory").val(p.category);
      $("#pImage").val(p.image);
      $("#pDesc").val(p.description);
      $("#formTitle").text("Edit product");
      $("#submitBtn").text("Save changes");
      if ($("#formPanel").is(":hidden")) $("#formPanel").slideDown(300);
      $("#toggleFormBtn").addClass("is-open");
      $("html, body").animate({ scrollTop: $("#formPanel").offset().top - 90 }, 350);
    }
  
    /* ---------- 9. EVENTS ---------- */
  
    // keyup → canlı axtarış
    $("#searchInput").on("keyup", function () { renderProducts(); });
  
    // change → kateqoriya və sıralama
    $("#categoryFilter").on("change", function () { renderProducts(); });
    $("#sortSelect").on("change", function () { renderProducts(); });
  
    // click → cart slideToggle()
    $("#cartToggle").on("click", function () { $("#cartPanel").slideToggle(250); });
    $("#cartClose").on("click", function () { $("#cartPanel").slideUp(250); });
  
    // click → form panel slideToggle()
    $("#toggleFormBtn").on("click", function () {
      resetForm();
      $(this).toggleClass("is-open");
      $("#formPanel").slideToggle(300);
    });
    $("#cancelEdit").on("click", function () {
      resetForm();
      $("#toggleFormBtn").removeClass("is-open");
      $("#formPanel").slideUp(250);
    });
  
    // Product card events (delegated, çünki kartlar dinamik yaradılır)
    $("#productGrid")
      // mouseenter / mouseleave → animate() ilə şəkil ölçüsünü dəyiş
      .on("mouseenter", ".card", function () {
        $(this).addClass("hovering").find(".img-wrap").stop(true).animate({ height: 215 }, 200);
      })
      .on("mouseleave", ".card", function () {
        $(this).removeClass("hovering").find(".img-wrap").stop(true).animate({ height: 180 }, 200);
      })
      // dblclick → qiyməti göstər / gizlət (fadeToggle)
      .on("dblclick", ".img-wrap", function () {
        $(this).find(".price-pop").fadeToggle(250);
      })
      // click → description toggle()
      .on("click", ".btn-desc", function () {
        const $card = $(this).closest(".card");
        $card.find(".desc").toggle();
        $(this).text($card.find(".desc").is(":visible") ? "Hide" : "Details");
      })
      // click → səbətə əlavə et
      .on("click", ".btn-add", function () {
        addToCart(Number($(this).closest(".card").attr("data-id")));
      })
      // click → edit
      .on("click", ".btn-edit", function () {
        startEdit(Number($(this).closest(".card").attr("data-id")));
      })
      // click → sil (fadeOut)
      .on("click", ".btn-del", function () {
        const $card = $(this).closest(".card");
        const id = Number($card.attr("data-id"));
        $card.fadeOut(300, function () {
          products = $.grep(products, function (p) { return p.id !== id; });
          saveProducts();                   // localStorage yenilənir
          renderCategories();
          renderProducts();
          renderCart();
          toast("Product deleted");
        });
      });
  
    // Cart events
    $("#cartItems")
      .on("click", ".qty-plus", function () {
        const $row = $(this).closest(".cart-item");
        changeQty(Number($row.attr("data-id")), 1, $row);
      })
      .on("click", ".qty-minus", function () {
        const $row = $(this).closest(".cart-item");
        changeQty(Number($row.attr("data-id")), -1, $row);
      })
      .on("click", ".btn-remove", function () {
        const $row = $(this).closest(".cart-item");
        removeFromCart(Number($row.attr("data-id")), $row);
      });
  
    $("#clearCart").on("click", function () {
      cart = [];
      localStorage.removeItem(CART_KEY);
      renderCart();
      toast("Cart cleared");
    });
  
    // submit → yeni məhsul əlavə et / redaktə et
    $("#productForm").on("submit", function (e) {
      e.preventDefault();
      const data = validate();
      if (!data) { toast("Please fix the highlighted fields", true); return; }
  
      const editId = $("#editId").val();
      let newId = null;
  
      if (editId) {
        const id = Number(editId);
        $.each(products, function (_, p) {
          if (p.id === id) { $.extend(p, data); }
        });
        toast("Product updated");
      } else {
        newId = Date.now();
        products.push($.extend({ id: newId }, data));
        // Yeni məhsul görünsün deyə filterləri sıfırla
        $("#searchInput").val("");
        $("#sortSelect").val("default");
        $("#categoryFilter").val("all");
        toast("Product added");
      }
  
      saveProducts();                       // localStorage yenilənir
      renderCategories();
      renderProducts(newId);
      renderCart();
  
      resetForm();                          // uğurlu əlavədən sonra form təmizlənir
      $("#toggleFormBtn").removeClass("is-open");
      $("#formPanel").slideUp(250);
  
      if (newId) {
        const $new = $("#productGrid").find('[data-id="' + newId + '"]');
        if ($new.length) {
          $("html, body").animate({ scrollTop: $new.offset().top - 120 }, 400);
        }
      }
    });
  
    /* ---------- 10. Init ---------- */
    renderCategories();
    renderProducts();
    renderCart();
  });