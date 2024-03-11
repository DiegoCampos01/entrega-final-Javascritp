// Variable que mantiene el estado visible del carrito
let carritoVisible = false;

// Esperamos a que todos los elementos de la página carguen para ejecutar el script
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready);
} else {
    ready();
}

function ready() {
    // Agregamos funcionalidad a los botones eliminar del carrito
    const botonesEliminarItem = document.querySelectorAll('.btn-eliminar');
    for (let i = 0; i < botonesEliminarItem.length; i++) {
        const button = botonesEliminarItem[i];
        button.addEventListener('click', eliminarItemCarrito);
    }

    // Agregamos funcionalidad al botón agregar al carrito
    const botonesAgregarAlCarrito = document.querySelectorAll('.boton-item');
    for (let i = 0; i < botonesAgregarAlCarrito.length; i++) {
        const button = botonesAgregarAlCarrito[i];
        button.addEventListener('click', agregarAlCarritoClicked);
    }

    // Agregamos funcionalidad al botón comprar
    document.querySelector('.btn-pagar').addEventListener('click', pagarClicked);

    // Cargar productos del carrito desde un JSON local al cargar la página
    cargarDatosDesdeJSON()
        .then(carritoGuardado => {
            mostrarProductosEnCarrito(carritoGuardado);
        })
        .catch(error => {
            console.error('Error al cargar los datos del carrito:', error);
        });
}

// Función para cargar los datos del carrito desde un JSON local usando fetch
function cargarDatosDesdeJSON() {
    return fetch('productos.json') // Ajusta la ruta según la ubicación real del archivo JSON
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar los datos');
            }
            return response.json();
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Función para guardar los datos del carrito en localStorage
function guardarDatosCarrito(carrito) {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

// Función para cargar los datos del carrito desde localStorage
function cargarDatosCarrito() {
    const carritoJSON = localStorage.getItem('carrito');
    return carritoJSON ? JSON.parse(carritoJSON) : [];
}

// Función que controla el botón clickeado de agregar al carrito
function agregarAlCarritoClicked(event) {
    const button = event.target;
    const item = button.parentElement;
    const nombre = item.querySelector('.titulo-item').innerText;
    const precio = item.querySelector('.precio-item').innerText;
    const imagenSrc = item.querySelector('.img-item').src;

    const producto = { nombre, precio, imagenSrc };

    // Obtener el carrito actual desde localStorage
    let carrito = cargarDatosCarrito();

    // Agregar el nuevo producto al carrito
    carrito.push(producto);

    // Guardar el carrito actualizado en localStorage
    guardarDatosCarrito(carrito);

    // Mostrar los productos actualizados en el carrito
    mostrarProductosEnCarrito(carrito);

    // Hacer visible el carrito
    hacerVisibleCarrito();
}

// Elimino el item seleccionado del carrito
function eliminarItemCarrito(event) {
    const buttonClicked = event.target;
    const item = buttonClicked.parentElement.parentElement;

    // Obtener el nombre del producto que se va a eliminar
    const nombreProducto = item.querySelector('.carrito-item-titulo').innerText;

    // Obtener el carrito actual desde localStorage
    let carrito = cargarDatosCarrito();

    // Filtrar el carrito para excluir el producto que se va a eliminar
    carrito = carrito.filter(producto => producto.nombre !== nombreProducto);

    // Guardar el carrito actualizado en localStorage
    guardarDatosCarrito(carrito);

    // Mostrar los productos actualizados en el carrito
    mostrarProductosEnCarrito(carrito);

    // Ocultar el carrito si está vacío
    if (carrito.length === 0) {
        ocultarCarrito();
    }
}

// Función para vaciar el carrito
function vaciarCarrito() {
    // Limpiar el carrito (array vacío)
    const carrito = [];
    
    // Guardar el carrito vacío en localStorage
    guardarDatosCarrito(carrito);

    // Mostrar los productos actualizados en el carrito (vacío)
    mostrarProductosEnCarrito(carrito);

    // Ocultar el carrito
    ocultarCarrito();
}

// Función que hace visible el carrito
function hacerVisibleCarrito() {
    carritoVisible = true;
    const carrito = document.querySelector('.carrito');
    carrito.style.marginRight = '0';
    carrito.style.opacity = '1';

    const items = document.querySelector('.contenedor-items');
    items.style.width = '60%';
}

// Función que agrega un item al carrito
function agregarItemAlCarrito(titulo, precio, imagenSrc) {
    const itemsCarrito = document.querySelector('.carrito-items');

    // Verificar si el producto ya está en el carrito
    const itemsEnCarrito = itemsCarrito.querySelectorAll('.carrito-item-titulo');
    for (let i = 0; i < itemsEnCarrito.length; i++) {
        if (itemsEnCarrito[i].innerText === titulo) {
            // Si el producto ya está en el carrito, simplemente incrementamos la cantidad
            const cantidadElemento = itemsEnCarrito[i].parentElement.querySelector('.carrito-item-cantidad');
            let cantidadActual = parseInt(cantidadElemento.value);
            cantidadActual++;
            cantidadElemento.value = cantidadActual;
            actualizarTotalCarrito();
            return; // Salimos de la función ya que el producto ya está en el carrito
        }
    }

    // Si el producto no está en el carrito, creamos un nuevo elemento en el carrito
    const item = document.createElement('div');
    item.classList.add('item');

    // Construir contenido HTML del nuevo item de carrito
    const itemCarritoContenido = `
        <div class="carrito-item">
            <img src="${imagenSrc}" width="80px" alt="">
            <div class="carrito-item-detalles">
                <span class="carrito-item-titulo">${titulo}</span>
                <div class="selector-cantidad">
                    <i class="fa-solid fa-minus restar-cantidad"></i>
                    <input type="text" value="1" class="carrito-item-cantidad" disabled>
                    <i class="fa-solid fa-plus sumar-cantidad"></i>
                </div>
                <span class="carrito-item-precio">${precio}</span>
            </div>
            <button class="btn-eliminar">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `;
    item.innerHTML = itemCarritoContenido;
    itemsCarrito.append(item);

    // Agregar funcionalidades a elementos del nuevo item
    item.querySelector('.btn-eliminar').addEventListener('click', eliminarItemCarrito);
    item.querySelector('.restar-cantidad').addEventListener('click', restarCantidad);
    item.querySelector('.sumar-cantidad').addEventListener('click', sumarCantidad);

    // Actualizar total del carrito
    actualizarTotalCarrito();
}

// Aumento en uno la cantidad del elemento seleccionado
function sumarCantidad(event) {
    const buttonClicked = event.target;
    const selector = buttonClicked.parentElement;
    let cantidadActual = parseInt(selector.querySelector('.carrito-item-cantidad').value);
    cantidadActual++;
    selector.querySelector('.carrito-item-cantidad').value = cantidadActual;
    actualizarTotalCarrito();
}

// Resto en uno la cantidad del elemento seleccionado
function restarCantidad(event) {
    const buttonClicked = event.target;
    const selector = buttonClicked.parentElement;
    let cantidadActual = parseInt(selector.querySelector('.carrito-item-cantidad').value);
    cantidadActual--;
    if (cantidadActual >= 1) {
        selector.querySelector('.carrito-item-cantidad').value = cantidadActual;
        actualizarTotalCarrito();
    }
}

// Función que controla si hay elementos en el carrito. Si no hay, oculto el carrito.
function ocultarCarrito() {
    const carritoItems = document.querySelector('.carrito-items');
    if (carritoItems.childElementCount === 0) {
        const carrito = document.querySelector('.carrito');
        carrito.style.marginRight = '-100%';
        carrito.style.opacity = '0';
        carritoVisible = false;

        const items = document.querySelector('.contenedor-items');
        items.style.width = '100%';
    }
}

// Actualizamos el total de Carrito
function actualizarTotalCarrito() {
    // Seleccionamos el contenedor carrito
    const carritoContenedor = document.querySelector('.carrito');
    const carritoItems = carritoContenedor.querySelectorAll('.carrito-item');
    let total = 0;
    // Recorremos cada elemento del carrito para actualizar el total
    for (let i = 0; i < carritoItems.length; i++) {
        const item = carritoItems[i];
        const precioElemento = item.querySelector('.carrito-item-precio');
        // Quitamos el símbolo peso y el punto de milesimos.
        const precio = parseFloat(precioElemento.innerText.replace('$', '').replace('.', ''));
        const cantidadItem = item.querySelector('.carrito-item-cantidad').value;
        total = total + (precio * cantidadItem);
    }
    total = Math.round(total * 100) / 100;

    document.querySelector('.carrito-precio-total').innerText = '$' + total.toLocaleString("es") + ",00";
}

// Función que controla el botón "Pagar"
function pagarClicked() {
    // Calculamos el total de la compra
    let totalCompra = calcularTotalCompra();

    // Mostramos un mensaje de confirmación con Sweet Alert
    Swal.fire({
        title: 'Confirmar compra',
        text: `El total de tu compra es: $${totalCompra.toLocaleString("es")},00. ¿Deseas confirmar la compra?`,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Si se confirma la compra, vaciamos el carrito y mostramos un mensaje de agradecimiento
            vaciarCarrito();
            Swal.fire('¡Gracias por tu compra!', '', 'success');
        }
    });
}

// Función para calcular el total de la compra
function calcularTotalCompra() {
    // Seleccionamos el contenedor carrito
    const carritoContenedor = document.querySelector('.carrito');
    const carritoItems = carritoContenedor.querySelectorAll('.carrito-item');
    let total = 0;

    // Recorremos cada elemento del carrito para calcular el total
    for (let i = 0; i < carritoItems.length; i++) {
        const item = carritoItems[i];
        const precioElemento = item.querySelector('.carrito-item-precio');
        // Quitamos el símbolo peso y el punto de milesimos.
        const precio = parseFloat(precioElemento.innerText.replace('$', '').replace(',', ''));
        const cantidadItem = parseInt(item.querySelector('.carrito-item-cantidad').value);
        total += precio * cantidadItem;
    }
    return total;
}

// Función para mostrar los productos en el carrito
function mostrarProductosEnCarrito(carrito) {
    const itemsCarrito = document.querySelector('.carrito-items');

    // Limpiar los elementos anteriores en el carrito
    itemsCarrito.innerHTML = '';

    // Agregar cada producto al carrito
    carrito.forEach(producto => {
        agregarItemAlCarrito(producto.nombre, producto.precio, producto.imagenSrc);
    });
}



