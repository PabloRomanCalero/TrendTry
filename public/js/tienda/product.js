let token = document.querySelector('[name=_token]').value;

async function mostrarProducto() {
    const productContainer = document.getElementById('product-container');
    const productId = productContainer.getAttribute('data-product-id');

    let productsData = await fetch(`/api/product/${productId}`);
    let product = await productsData.json();

    console.log(product);
    let imageProducts = await fetch(`/api/image/product/${productId}`);
    let imageProductJson = await imageProducts.json();
    let imageProduct = imageProductJson[0]; 

    const productDiv = document.createElement('div');
    productDiv.classList.add('product');

    const productImg = document.createElement('img');
    productImg.src = '/' + imageProduct.url;
    productImg.alt = product.name;

    const productName = document.createElement('h2');
    productName.textContent = product.name;
    
    const productMarca = document.createElement('h4');
    productMarca.textContent = product.brand;
    
    const productSize = document.createElement('p');
    productSize.textContent = 'Talla: ' + product.size;
    
    const productPrice = document.createElement('p');
    productPrice.textContent = 'Precio: ' + product.price + '€';

    const inputCantidad = document.createElement('input');
    inputCantidad.classList.add('inputCantidad');
    inputCantidad.type = 'number';
    inputCantidad.min = 1;
    inputCantidad.max = product.stock;
    inputCantidad.value = 1; 

    const addButton = document.createElement('button');
    addButton.textContent = 'Añadir al carrito';
    addButton.addEventListener('click', function() {
        const quantity = parseInt(inputCantidad.value);
        if (quantity > 0 && quantity <= product.stock) {
            addCarrito(product, quantity); 
        } else {
            alert('Por favor, selecciona una cantidad válida.');
        }
    });

    productDiv.append(productImg,productName,productMarca,productSize,productPrice,inputCantidad,addButton);
    productContainer.appendChild(productDiv);

    const productDescription = document.createElement('p');
    productDescription.textContent = product.description;
    productContainer.appendChild(productDescription);
}

async function addCarrito(product, quantity) {
    let respOrders = await fetch('/api/orders/cart');
    let order = await respOrders.json();
    console.log(respOrders);
    console.log(order);

    //se crea carrito si no tiene
    if(order === 'no registrado'){
        alert('Para añadir artículos a tu carrito, debes registrarte o estar logeado antes');
    }else{
        console.log(order.length);
        if(order.length == 0){
            await fetch('/api/orders', {
                method: "POST",
                headers: {
                    'X-CSRF-TOKEN': token,
                    'Content-Type': 'application/json',
                },
            });
            let respOrders2 = await fetch('/api/orders/cart');
            let order2 = await respOrders2.json();
            
            introducirProductoCarrito(order2[0].id,product.id,quantity);
        } else{
            introducirProductoCarrito(order[0].id,product.id,quantity);
        }    
    }
    
}

async function introducirProductoCarrito(order,product_id,quantity){
    let respOrderLines = await fetch('/api/orderLines');
    let orderLines = await respOrderLines.json();
    console.log(orderLines);
    let existe = false;
    let orderLineId;
    let orderLineCantidad = 0;

    //Comprobamos si existe el mismo producto para en vez de crear uno, le sumamos uno a quantity
    orderLines.forEach( async line =>{
        if(line.product_id == product_id){
            orderLineId = line.id;
            orderLineCantidad = line.quantity + parseInt(quantity);
            console.log(orderLineCantidad);
            existe = true;
            console.log(existe);
        }
    });
    console.log(quantity);
    if(existe){
        fetch(`/api/orderLines/${orderLineId}`, {
            method: "PUT",
            headers: {
                'X-CSRF-TOKEN': token,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({"quantity": orderLineCantidad}),
        });
    }else{
        fetch('/api/orderLines',{
            method: "POST",
            headers: {
                'X-CSRF-TOKEN': token,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({"quantity": quantity,"order_id": order,"product_id":product_id}),
        });
    }
    window.location.reload();
}

mostrarProducto();
