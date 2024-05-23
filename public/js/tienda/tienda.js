let token = document.querySelector('[name=_token]').value;

async function inicializar() {
    let selectedCategory = 'Zapatillas';
    let selectedSex = 'Hombre'; 

    const sexHombre = document.getElementById('sex-hombre');
    const sexMujer = document.getElementById('sex-mujer');

    sexHombre.addEventListener('click', function() {
        handleSexSelection('Hombre');
    });

    sexMujer.addEventListener('click', function() {
        handleSexSelection('Mujer');
    });

    function handleSexSelection(sex) {
        const selectedDiv = document.querySelector('#sexDiv div.selected');
        if (selectedDiv) {
            selectedDiv.classList.remove('selected');
        }

        const selectedSexDiv = document.getElementById(`sex-${sex.toLowerCase()}`);
        selectedSexDiv.classList.add('selected');
        
        console.log("Sexo seleccionado:", sex);
        selectedSex = sex; 
        loadProducts(selectedCategory, selectedSex);
    }

    const categoryItems = document.querySelectorAll('#listaCategory li');
    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            selectedCategory = this.textContent; 
            console.log("Categoría seleccionada:", selectedCategory);
            loadProducts(selectedCategory, selectedSex);
        });
    });

    let arrayProductos = await fetch('api/products');
    let productsData = await arrayProductos.json();
    let buscador = document.getElementById("buscador");
    let resultadosDiv = document.getElementById("resultadosDiv");

    buscador.addEventListener("input", () => {
        
        let filtro = buscador.value.trim().toLowerCase();
        let resultadosFiltrados = productsData.filter(producto => (producto.name).toLowerCase().startsWith(filtro));
        if (resultadosFiltrados.length > 0) {
            resultadosDiv.style.display = "block";    
            //vacio el div del autocomplete
            resultadosDiv.innerHTML="";
            resultadosFiltrados.forEach(producto => {
                let resultadoP = document.createElement("div");
                resultadoP.classList.add("resultadoP");
                resultadoP.textContent = producto.name;

                resultadoP.addEventListener("click", () => {
                    resultadosDiv.style.display = "none";
                    resultadosDiv.innerHTML = ""; 
                    buscador.value = producto.id;
                    
                });
                resultadoP.addEventListener('click', async function() {
                    let productId = buscador.value;
                             
                    let form = document.createElement('form');
                    form.action = `/product-info/${productId}`;
                    form.method = 'get';
                                
                    document.body.appendChild(form);
                    form.submit();
                });
                resultadosDiv.appendChild(resultadoP);
                if (filtro == ''){
                    resultadosDiv.style.display = "none";
                    resultadosDiv.innerHTML="";
                }; 
            }); 
        };
        
    });
   
    async function loadProducts(category, sex) {
        const productsContainer = document.getElementById('product-container');
        productsContainer.innerHTML = ''; 
        
        let productsData = await fetch(`api/products/${sex}/${category}`);
        let products = await productsData.json();

        console.log(productsData);

        for (const product of products) {
            let imageProducts = await fetch(`api/image/product/${product.id}`);
            let imageProductJson = await imageProducts.json();
            let imageProduct = imageProductJson[0]; 

            const productDiv = document.createElement('div');
            productDiv.classList.add('product');

            const productImg = document.createElement('img');
            productImg.src = imageProduct.url;
            productImg.alt = product.name;

            const productName = document.createElement('h3');
            productName.textContent = product.name;

            const productMarca = document.createElement('h4');
            productMarca.textContent = product.brand;

            const productTalla = document.createElement('h4');
            productTalla.textContent = 'Talla: ' + product.size;

            const productPrice = document.createElement('p');
            productPrice.textContent = product.price + '€';

            const inputCantidad = document.createElement('input');
            inputCantidad.classList.add('inputCantidad');
            inputCantidad.type = 'number';
            inputCantidad.min = 1;
            inputCantidad.max = product.stock;
            inputCantidad.value = 1; 

            const addButton = document.createElement('button');
            addButton.classList.add('botonAdd');
            addButton.textContent = 'Añadir al carrito';
            addButton.addEventListener('click', function() {
                const quantity = parseInt(inputCantidad.value);
                if (quantity > 0 && quantity <= product.stock) {
                    addCarrito(product, quantity); 
                } else {
                    alert('Por favor, selecciona una cantidad válida.');
                }
            });

            const productForm = document.createElement('form');
            productForm.action = `/product-info/${product.id}`;
            productForm.method = 'get';

            const buttonVer = document.createElement('button');
            buttonVer.classList.add('buttonVer');
            buttonVer.type = 'submit';
            buttonVer.textContent = 'Ver más';

            productForm.appendChild(buttonVer);
            productDiv.append(productImg,productName,productMarca,productTalla,productPrice,inputCantidad,productForm,addButton);
            productsContainer.appendChild(productDiv);
        }
    }

    async function addCarrito(product, quantity) {
        let respOrders = await fetch('api/orders/cart');
        let order = await respOrders.json();
        console.log(respOrders);
        console.log(order);

        //se crea carrito si no tiene
        if(order === 'no registrado'){
            alert('Para añadir artículos a tu carrito, debes registrarte o estar logeado antes');
        }else{
            console.log(order.length);
            if(order.length == 0){
                await fetch('api/orders', {
                    method: "POST",
                    headers: {
                        'X-CSRF-TOKEN': token,
                        'Content-Type': 'application/json',
                    },
                });
                let respOrders2 = await fetch('api/orders/cart');
                let order2 = await respOrders2.json();
                
                introducirProductoCarrito(order2[0].id,product.id,quantity);
            } else{
                introducirProductoCarrito(order[0].id,product.id,quantity);
            }    
        }
        
    }

    async function introducirProductoCarrito(order,product_id,quantity){
        let respOrderLines = await fetch('api/orderLines');
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
            fetch('api/orderLines',{
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

    loadProducts(selectedCategory, selectedSex); 
}
inicializar();
