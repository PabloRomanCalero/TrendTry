let sectionCarrito = document.querySelector('#section-carrito');
let token = document.querySelector('[name=_token]').value;

let footer = document.querySelector('.footer');
async function listarCarrito(){

    sectionCarrito.innerHTML="";
    try{
        let respOrderLines = await fetch('api/orderLines');
        let orderLines = await respOrderLines.json();
        console.log(orderLines);
        let orderLinesLength = orderLines.length;
        let contadorLinesLength = 0;
        let numCarrito = document.querySelector('#numCarrito');
        let numeroCarrito = 0;
        let stockTotal = true;
        let precioFinal = 0;
        let listaProductos = [];
       console.log(orderLines.length)

       if(orderLines.length === 0){
            let articleImg = document.createElement('article')
            let img = document.createElement('img');

            articleImg.className = 'article-img--check';
            img.className = 'img-check';
            img.src="/img/carrito/Check-mark.png";

            articleImg.append(img);
            sectionCarrito.append(articleImg);
            sectionCarrito.style="background-Color: white;"
        }
        orderLines.forEach(linea =>{
            numeroCarrito = numeroCarrito + linea.quantity;
        });
        numCarrito.textContent = numeroCarrito;

        //creación líneas de pedido
        orderLines.forEach( async line => {
            console.log(line);
            //Llamada para recopilar cada producto
            let resProducto = await fetch(`api/products/${line.product_id}`);
            let producto = await resProducto.json();

            //Imagen de cada producto
            let imageProducts = await fetch(`api/image/product/${line.product_id}`);
            let imageProductJson = await imageProducts.json();
            let imageProduct = imageProductJson[0]; 
           
            let articuloProducto = document.createElement('article');
            let img = document.createElement('img');
            let divNomStock = document.createElement('div');
            let nombre = document.createElement('h2');
            let stock = document.createElement('p');
            let divBotonCantidad = document.createElement('div');
            let mas = document.createElement('button');
            let cantidad = document.createElement('p');
            let menos = document.createElement('button');
            let precio = document.createElement('p');
            let precioTotalProducto = document.createElement('p');
            let botonEliminar = document.createElement('button');

            //Insertamos el valor en cada caso
            img.src = imageProduct.url;
            nombre.textContent = producto.name;
            menos.textContent = '-';
            mas.textContent = '+';
            precio.textContent = `Pr/ud: ${producto.price} €`;
            precioTotalProducto.textContent = `Total: ${(producto.price * line.quantity).toFixed(2)} €`;
            botonEliminar.textContent = 'Eliminar';
            stock.textContent = `STOCK : ${producto.stock}`
            cantidad.textContent = line.quantity;
            mas.value = line.id;
            menos.value = line.id;
            mas.dataset.id = line.quantity;
            menos.dataset.id = line.quantity;
            botonEliminar.value = line.id;

            //clases
            articuloProducto.className="articulo--producto-carrito";
            img.className="img--producto-carrito";
            divNomStock.className = "div--nombreStock-carrito";
            stock.className = "stock--producto-carrito";
            divBotonCantidad.className = "div--botonCantidad-carrito";
            mas.className = "boton-mas-menos";
            menos.className = "boton-mas-menos";
            precio.className = "precio--producto-carrito";
            precioTotalProducto.className = "precioFinal--producto-carrito";
            botonEliminar.className ="boton--borrarProducto-carrito";

            divNomStock.append(nombre,stock);
            divBotonCantidad.append(menos,cantidad,mas);
            articuloProducto.append(img,divNomStock,divBotonCantidad,precio,precioTotalProducto,botonEliminar);
            sectionCarrito.append(articuloProducto);

            precioFinal += producto.price * line.quantity;
            let precioTotalProductos = producto.price * line.quantity;
            listaProductos.push({"name":producto.name,"cantidad":line.quantity,"precio":precioTotalProductos,"product_id":producto.id,"stock":producto.stock});

            if(producto.stock < line.quantity){
                stockTotal = false;
            }

            //Funciones despues de mostrar todos los productos
            contadorLinesLength += 1;
            if(contadorLinesLength === orderLinesLength){
                precioFinal = precioFinal.toFixed(2);
                compraFinal(precioFinal,numeroCarrito,stockTotal,orderLines,listaProductos);
                eventoSumarRestar();
                borrarLineOrder();
            }

        });

    }catch(error){
        if(error){
            let articleImg = document.createElement('article')
            let img = document.createElement('img');

            articleImg.className = 'article-img--check';
            img.className = 'img-check';
            img.src="/img/carrito/Check-mark.png";

            articleImg.append(img);
            sectionCarrito.append(articleImg);
            sectionCarrito.style="background-Color: white;"
        }
    }
}

function eventoSumarRestar(){
    let botonesCantidad = document.querySelectorAll('.boton-mas-menos');

    botonesCantidad.forEach(boton=>{
        boton.addEventListener('click',(e)=>{
            let orderLineId = e.target.value;
            let target = e.target.textContent;
            let cantidad = parseInt(e.target.dataset.id);

            if(target === '+'){
                cantidad = cantidad + 1;
            }else{
                cantidad -= 1;
            }
            if(cantidad <= 0 ){
                fetch(`api/orderLines/${orderLineId}`, {
                    method: "DELETE",
                    headers: {
                        'X-CSRF-TOKEN': token,
                        'Content-Type': 'application/json',
                    },
                });
            }else{
                fetch(`api/orderLines/${orderLineId}`, {
                    method: "PUT",
                    headers: {
                        'X-CSRF-TOKEN': token,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({"quantity": cantidad}),
                });
            }

            listarCarrito();
        });

    });

}

function borrarLineOrder(){
    let botonesBorrar = document.querySelectorAll('.boton--borrarProducto-carrito');

    botonesBorrar.forEach((botonBorrar)=>{
        botonBorrar.addEventListener('click',(e)=>{
            let orderLineId = e.target.value;
            fetch(`api/orderLines/${orderLineId}`, {
                method: "DELETE",
                mode:'cors',
                headers: {
                    'X-CSRF-TOKEN': token,
                    'Content-Type': 'application/json',
                },
            }).then(resp=> resp.json()).then(resp=>console.log(resp));

            listarCarrito();
        });
    })
}

async function compraFinal(precioFinal,numeroCarrito,stockTotal,orderLines,listaProductos){

    let articuloCompraFinal = document.createElement('article');
    let botonFinalizarCompra = document.createElement('button');
    let articulosCarrito = document.createElement('p');
    let totalPrecio = document.createElement('p');

    //Descuentos del usuario
    let descuentosUser = await fetch('api/descuentos');
    let descuentos = await descuentosUser.json();
    console.log(descuentos);
    if(descuentos.length > 0){
        let selectDescuentos = document.createElement('select');
        selectDescuentos.className = 'select-descuentos';

        // Opción por defecto
        let optionDefault = document.createElement('option');
        optionDefault.text = 'Selecciona un descuento';
        optionDefault.value = '';
        selectDescuentos.append(optionDefault);

        descuentos.forEach(descuento => {
            let option = document.createElement('option');
            option.text = `${descuento.descuento*100}% de descuento`;
            option.value = descuento.descuento;
            selectDescuentos.append(option);
        });

        selectDescuentos.addEventListener('change', (e) => {
            let descuentoSeleccionado = e.target.value;
            
            if (descuentoSeleccionado) {
                precioFinal = (precioFinal - (precioFinal * descuentoSeleccionado)).toFixed(2);
                console.log(precioFinal);
            }
            
            totalPrecio.textContent = `Total: ${precioFinal} €`;
        });
        articuloCompraFinal.append(selectDescuentos);
    }
    
    //introducimos datos
    botonFinalizarCompra.textContent = 'Finalizar la compra';
    if (numeroCarrito === 0) { articulosCarrito.textContent = `OOPS, no hoy ningún artículo en tu carrito` }
    else if (numeroCarrito === 1) { articulosCarrito.textContent = `Hay ${numeroCarrito} artículo en tu carrito` }
    else { articulosCarrito.textContent = `Hay ${numeroCarrito} artículos en tu carrito` }
    totalPrecio.textContent = `Total: ${precioFinal} €`;

    //clases a los elementos
    articuloCompraFinal.className = "articulo-carrito-final";
    botonFinalizarCompra.className = "boton-carrito-finalizar-compra";
    articulosCarrito.className = "articulos-carrito-final";
    totalPrecio.className = "precio-carrito-final";

    //Los metemos en la vista
    articuloCompraFinal.append(botonFinalizarCompra, articulosCarrito, totalPrecio);
    sectionCarrito.append(articuloCompraFinal);

    //EVENTO FINALIZAR COMPRA
    botonFinalizarCompra.addEventListener('click', async (e) => {
        let respUser = await fetch('api/users/viewUser');
        let userAndAddress = await respUser.json();
        let user = userAndAddress[0];
        let addresses = userAndAddress[1];
        console.log(user, addresses);
        let edad = getEdad(user.birthdate);
        console.log(edad);
        let finalizaCompraBoolean = true;
        let arrayErrores = [];
        let articleFinalVentaProducto = document.createElement('article');
        articleFinalVentaProducto.className = "articulo-final-venta";
        articleFinalVentaProducto.innerHTML = "";

        if (edad < 18) {
            finalizaCompraBoolean = false;
            arrayErrores.push('Para comprar productos en la tienda, deberás tener al menos 18 años');
        }
        if (!stockTotal) {
            finalizaCompraBoolean = false;
            arrayErrores.push('Lo sentimos pero algún producto no tiene stock suficiente.');
        }
        if (addresses.length === 0) {
            finalizaCompraBoolean = false;
            arrayErrores.push('Para poder comprar deberá tener al menos una dirección registrada.');
        }

        //Finalizar compra
        if (finalizaCompraBoolean) {
            sectionCarrito.innerHTML = "";
            let tituloConfirmacionDireccion = document.createElement('h1');
            tituloConfirmacionDireccion.textContent = 'Confirme una dirección para el pedido'
            tituloConfirmacionDireccion.className = "titulo-confirmacion";
            let listaDirecciones = document.createElement('ul');
            listaDirecciones.className = 'lista-direcciones-carrito';

            addresses.forEach(address => {
                let liDireccion = document.createElement('li');
                liDireccion.textContent = `Direccion: ${address.tipo} ${address.nombre}, Nº ${address.patio}, piso ${address.piso}, puerta ${address.puerta}, ${address.cp}, ${address.localidad}, ${address.pais}`;
                let botonConfirmarDireccion = document.createElement('button');
                botonConfirmarDireccion.textContent = 'Confirmar';
                botonConfirmarDireccion.value = address.id;
                botonConfirmarDireccion.className = "boton-confirmacion-direccion";
                liDireccion.append(botonConfirmarDireccion);
                listaDirecciones.append(liDireccion);
            });
            sectionCarrito.append(tituloConfirmacionDireccion, listaDirecciones);
            let botonesdirecciones = document.querySelectorAll('.boton-confirmacion-direccion');
            //coger el id de la order
            let resOrder = await fetch('/api/orders/cart');
            let order = await resOrder.json();
            let orderId = order[0].id;
            console.log(orderId);

            for (let botonDireccion of botonesdirecciones) {
                //evento de confirmacion de la direccion 
                botonDireccion.addEventListener('click', async (e) => {
                    let addresId = e.target.value;
                    console.log(orderId, addresId);
                    sectionCarrito.innerHTML = "";
                    let articleVentaFinal = document.createElement('article');
                    articleVentaFinal.className = "article-venta-final";
                    console.log(listaProductos);

                    let precioTotalFinal = 0;
                    let precioFinalProductos = document.createElement('p');
                    let tituloProductosPedido = document.createElement('h1');
                    precioFinalProductos.className = "precio-final-venta";
                    tituloProductosPedido.textContent = "Productos Del Pedido";
                    tituloProductosPedido.className = "titulos-carrito";
                    articleVentaFinal.append(tituloProductosPedido);

                    //Lista de productos que van a ser comprados
                    listaProductos.forEach(producto => {
                        precioTotalFinal += producto.precio;
                        let divProducto = document.createElement('div');
                        let tituloProducto = document.createElement('p');
                        let cantidadProducto = document.createElement('p');
                        let precioProducto = document.createElement('p');

                        divProducto.className = 'div-producto-final-compra';
                        tituloProducto.className = 'titulo-producto-compra-final';
                        cantidadProducto.className = 'cantidad-producto-compra-final';
                        precioProducto.className = 'precio-producto-compra-final';

                        tituloProducto.textContent = producto.name;
                        cantidadProducto.textContent = `Cantidad: ${producto.cantidad}`;
                        console.log(precioFinal);
                        precioProducto.textContent = `Precio: ${precioFinal} €`;
                        
                        divProducto.append(tituloProducto, cantidadProducto, precioProducto);
                        articleVentaFinal.append(divProducto);
                    });
                    

                    let precioEnvio = document.createElement('p');
                    let botonFinalizarPago = document.createElement('button');
                    botonFinalizarPago.className = 'boton-finalizar-pago';
                    botonFinalizarPago.textContent = 'Finalizar pago';
                    if (precioTotalFinal < 69.99) {
                        let anuncio = document.createElement('p');
                        console.log(precioFinal);
                        precioTotalFinal = parseFloat(precioFinal) + 3.95;
                        console.log(precioTotalFinal);
                        anuncio.textContent = 'Si el total de la compra supera los 70€, el envio será gratuito';
                        precioEnvio.textContent = 'Precio del envio: 3,95€';
                        precioFinalProductos.textContent = `Total del pedido: ${precioTotalFinal.toFixed(2)} €`;
                        articleVentaFinal.append(anuncio);
                    } else {
                        precioEnvio.textContent = 'Precio del envio: 0€';
                        precioFinalProductos.textContent = `Total del pedido: ${precioFinal} €`;
                    }
                    articleVentaFinal.append(precioEnvio, precioFinalProductos, botonFinalizarPago);
                    sectionCarrito.append(articleVentaFinal);

                    //finalizar pago, eliminar productos en base de datos y cambio del status del order
                    botonFinalizarPago.addEventListener('click', async (e) => {
                        //Cambio de carrito
                        fetch(`api/orders/${orderId}`, {
                            method: "PUT",
                            headers: {
                                'X-CSRF-TOKEN': token,
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ "address_id": addresId, "totalPrice": precioTotalFinal }),
                        });

                        //Eliminar productos(stock)
                        listaProductos.forEach(async (producto) => {
                            let stock = producto.stock - producto.cantidad;
                            console.log(stock);
                            fetch(`api/products/stock/${producto.product_id}`, {
                                method: "PUT",
                                headers: {
                                    'X-CSRF-TOKEN': token,
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ "stock": stock }),
                            });
                        });
                        setTimeout(() => {
                            window.location.reload();
                            listarCarrito();
                        }, 6000);
                        sectionCarrito.innerHTML = "";
                        let articleFinal = document.createElement('article');
                        articleFinal.className = "article-final";
                        let tituloUltimo = document.createElement('h1');
                        tituloUltimo.className = "titulo-ultimo";
                        tituloUltimo.textContent = 'Esto es una simulación del pago total por el carrito y sus productos, finalizará aquí, gracias por su compra';
                        articleFinal.append(tituloUltimo)
                        sectionCarrito.append(articleFinal);

                    });
                });
            }

        } else {
            let listaErrores = document.createElement('ul');
            listaErrores.className = "lista-errores-carrito";
            for (let error of arrayErrores) {
                let liError = document.createElement('li');
                liError.textContent = error;
                listaErrores.append(liError);
            }
            let titulo = document.createElement('h1');
            let subtitulo = document.createElement('h2');
            let botonCerrar = document.createElement('button');
            titulo.textContent = 'VAYA VAYA... PARACE QUE ALGO ANDA MAL...';
            subtitulo.textContent = 'Creo que deberias revisar los siguientes errores...';
            botonCerrar.textContent = 'Cerrar aviso';
            botonCerrar.className = "boton-cerrar";
            titulo.className = "titulo-error-carrito";
            subtitulo.className = "subtitulo-error-carrito";
            articleFinalVentaProducto.append(titulo, subtitulo, listaErrores, botonCerrar);
            sectionCarrito.append(articleFinalVentaProducto);
            let scroll = articleFinalVentaProducto.getBoundingClientRect();
            window.scrollTo(scroll.x, scroll.y);
            console.log(scroll);
            botonCerrar.addEventListener('click', e => {
                articleFinalVentaProducto.innerHTML = "";
            });
        }
    });

}

function getEdad(dateString){
    let hoy = new Date();
    let fechaNacimiento = new Date(dateString);
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    let diferenciaMeses = hoy.getMonth() - fechaNacimiento.getMonth();
    if (diferenciaMeses < 0 || (diferenciaMeses === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
        edad--;
    }
    return edad;
}

listarCarrito();