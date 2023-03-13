var products = [
    {
        id: 1,
        title: 'Soup',
        price: '50.00',
        quantity: 100000000
    },
    {
        id: 2,
        title: 'Potato Wedges',
        price: '47.00',
        quantity: 100000000
    },
    {
        id: 3,
        title: 'PAneer Tikka',
        price: '95.00',
        quantity: 100000000
    },
    {
        id: 4,
        title: 'Fish',
        price: '200.00',
        quantity: 100000000
    },
    {
        id: 5,
        title: 'Steak',
        price: '250.00',
        quantity: 100000000
    },
    {
        id: 6,
        title: 'Chicken',
        price: '100.00',
        quantity: 100000000
    },
    {
        id: 7,
        title: 'Ice Cream',
        price: '65.00',
        quantity: 100000000
    },
    {
        id: 8,
        title: 'Cookie',
        price: '10.00',
        quantity: 100000000
    },
    {
        id: 9,
        title: 'Beer',
        price: '30.00',
        quantity: 100000000
    },
    {
        id: 10,
        title: 'Sprite',
        price: '10.00',
        quantity: 100000000
    },
    {
        id: 11,
        title: 'Bread',
        price: '5.00',
        quantity: 100000000
    },
    {
        id: 12,
        title: 'Milk',
        price: '15.00',
        quantity: 100000000
    },
];

function dragstartHandler(ev)
{
    console.log('----------------ondragstart - drag started');

    if(parseInt(ev.target.getAttribute("data-quantity")) == 0) {
        ev.dataTransfer.effectAllowed = "none";
        ev.dataTransfer.dropEffect = "none";
        alert("There is no enough items of this product");
        return false;
    } else {
        ev.dataTransfer.effectAllowed = "copy";
        ev.dataTransfer.dropEffect = "copy";

        ev.target.style.backgroundColor = "red";

        ev.dataTransfer.setData('text/html', ev.target.id);
    }
}

function ondragOverHandler(ev)
{
    ev.preventDefault();
    console.log("-----------------------ondragover");

    ev.dataTransfer.dropEffect = "copy";
}

function ondropHandler(ev)
{
    ev.preventDefault();
    console.log("-----------------------ondrop");

    try {

        let ele = document.getElementById(ev.dataTransfer.getData("text/html"));

        if(ev.dataTransfer.dropEffect == 'copy') {

            const cloned = ele.cloneNode(true);

            cloned.removeAttribute("id");

            cloned.style.backgroundColor = "";
            cloned.style.display = "none";

            document.getElementById("shopping-cart-zone").appendChild(cloned);
        }

    } catch(err) {
        console.error(err);
    }
}


function ondragendHandler(ev)
{
    console.log("----------------ondragend - drag finished");

    ev.target.style.backgroundColor = "";

    let itemId = ev.target.getAttribute("id");

    window.products.forEach((p) => {
        if("product-" + p.id == itemId) {
            if(p.quantity > 0) {
                p.quantity -= 1;

                // save products into some storage. For production environments you need to save the shopping cart into database like mysql, sqlserver,
                // But for the purpose of this tutorial i will save the shopping cart into browser localstorage
                saveProductToStorage(p.id);

            } else {
                p.quantity = 0 ;
                ev.dataTransfer.effectAllowed = "none";
                ev.dataTransfer.dropEffect = "none";
            }
        }
    });


    // Re-render products to display the correct amount
    renderProducts(window.products);
}

function renderProducts(products)
{
    document.getElementById("products-section").innerHTML = "";

    products.forEach((product) => {
        const outOfStockClass = product.quantity == 0 ? 'out-of-stock' : '';
        const enableDraggable = product.quantity > 0 ? 'draggable="true"' : '';

        document.getElementById("products-section").innerHTML += `
                   <div class="card mb-3 ${outOfStockClass}" style="max-width: 540px;" id="product-${product.id}" data-quantity="${product.quantity}" ${enableDraggable} ondragstart="dragstartHandler(event)" ondragend="ondragendHandler(event)">
                    <div class="row g-0">
                        
                        <div class="col-md-8">
                            <div class="card-body">
                                <h5 class="card-title">${product.title}</h5>
                                <p class="card-text"><small class="text-muted">$${product.price}</small></p>
                            </div>
                        </div>
                    </div>
                </div>
               `;
    });
}

function getShoppingFromStorage()
{
    const cartData = window.sessionStorage.getItem("shopping_cart");

    if(!cartData) {
        return null;
    }

    return JSON.parse(cartData);
}

function saveProductToStorage(productId)
{
    if(productId) {
        const shoppingCart = getShoppingFromStorage();

        const prod = window.products.find((i) => i.id == productId);

        let data = [];
        if (shoppingCart === null) {
            data.push({pid: productId, amount: 1, unit_price: prod.price});
        } else {
            data = shoppingCart;

            const checkProductIndex = data.findIndex((i) => i.pid == productId);
            if (checkProductIndex >=0 && checkProductIndex !== undefined) {
                data[checkProductIndex].amount = parseInt(data[checkProductIndex].amount) + 1;
            } else {
                data.push({pid: productId, amount: 1, unit_price: prod.price});
            }
        }

        window.sessionStorage.setItem("shopping_cart", JSON.stringify(data));

        displayTotalAmountInCart();
        displayCartProducts();
    }
}

function getCountAllProductsFromStorage()
{
    const shoppingCart = getShoppingFromStorage();

    let total = {count: 0, total_price: 0};

    if(shoppingCart != null) {
        const data = shoppingCart;
        data.forEach((i) => {
            total.count += i.amount;
            total.total_price += i.amount * i.unit_price;
        });
    }

    return total;
}

function removeFromCart(productId)
{
    const shoppingCart = getShoppingFromStorage();

    if(confirm("Are You Sure?")) {

        if (shoppingCart != null) {
            const removedProduct = shoppingCart.find(i => i.pid == productId);

            window.products.forEach((prod) => {
                if(prod.id == removedProduct.pid) {
                    prod.quantity = prod.quantity + removedProduct.amount;
                }
            });

            const newData = shoppingCart.filter(i => i.pid != productId);

            window.sessionStorage.setItem("shopping_cart", JSON.stringify(newData));

            // re-render products
            renderProducts(window.products);

            displayTotalAmountInCart();
            displayCartProducts();
        }
    }

    return false;
}

function displayTotalAmountInCart()
{
    const ele = document.getElementById("quantity-badge");

    const totalProds = getCountAllProductsFromStorage();

    if(totalProds.count > 0) {
        ele.style.display = "block";
        ele.innerHTML = "<div class='total-prods'>" + totalProds.count + " items</div>" +
            "<div class='total-price'>$" + (totalProds.total_price).toFixed(1) + "</div>";
    } else {
        ele.style.display = "none";
        ele.innerHTML = "";
    }
}

function displayCartProducts()
{
    const shoppingCart = getShoppingFromStorage();

    if(shoppingCart != null && shoppingCart.length > 0) {
        const data = shoppingCart;

        let html = "<ul>";

        data.forEach((i) => {
            const findProd = window.products.find((prod) => prod.id == i.pid);
            const totalPricePerProd = (i.amount * i.unit_price).toFixed(1);
            html += `<li class="">
                                
                                <span class="badge badge-primary">${i.amount}</span>
                                
                                 <span class="badge badge-primary">$${i.unit_price}</span>
                                  <span>=</span>
                                  <span class="badge badge-primary">$${totalPricePerProd}</span>
                                <div style="font-size: 10px">${findProd.title}</div>
                                <a href="javascript:void(0);" onclick="removeFromCart(${i.pid});">Remove</a>
                            </li>`
        });

        html += "</ul>";

        document.getElementById("cart-products").innerHTML = html;
        return;
    }

}

function isThereAvailableQuantity(prodId)
{
    let isThereAvailableQuantity = true;

    const findProduct = window.products.find(i => i.pid == prodId);

    if(findProduct.quantity == 0) {
        isThereAvailableQuantity = false;
    } else {
        isThereAvailableQuantity = true;
    }

    return isThereAvailableQuantity;
}

function resetProductsQuantity(products)
{
    const shoppingCart = getShoppingFromStorage();

    if(shoppingCart != null) {
        products.forEach((product) => {
            const productInCart = shoppingCart.find(i => i.pid == product.id);
            if(productInCart != undefined) {
                product.quantity = product.quantity >= productInCart.amount ? product.quantity - productInCart.amount : 0;
            }
        });
    }
}

window.onload = (e) => {
    resetProductsQuantity(products);
    renderProducts(products);
    displayTotalAmountInCart();
    displayCartProducts();
}

