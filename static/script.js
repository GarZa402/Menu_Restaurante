// Array para almacenar los platos
let platos = [];
let editIndex = -1;

// Cargar platos al iniciar la página
document.addEventListener('DOMContentLoaded', function() {
    // Datos de ejemplo al cargar la página
    platos = [
        {
            id: 1,
            nombre: "Ensalada César Premium",
            precio: 25000,
            descripcion: "Lechuga fresca, pollo grillado, crutones caseros, queso parmesano y aderezo césar tradicional",
            imagen: "https://www.culinariamente.com/wp-content/uploads/2024/10/Receta-de-ensalada-Cesar-con-pollo.jpg"

        },
        {
            id: 2,
            nombre: "Bowl Mediterráneo",
            precio: 28000,
            descripcion: "Quinoa, hummus, vegetales frescos, aceitunas, queso feta, aderezo de limón y huevo cocido",
            imagen: "https://imag.bonviveur.com/emplatado-final-del-poke-bowl-mediterraneo.jpg"
        },
        {
            id: 3,
            nombre: "Salmón Teriyaki",
            precio: 35000,
            descripcion: "Salmón fresco con glaseado teriyaki, vegetales al vapor y sésamo",
            imagen: "https://www.pequerecetas.com/wp-content/uploads/2022/05/salmon-teriyaki.jpg"
        }
    ];
    actualizarVistas();
});

// Función para guardar plato (mantiene compatibilidad con backend)
async function guardarPlato() {
    const nombre = document.getElementById('nombre').value.trim();
    const precio = document.getElementById('precio').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();
    const imagenInput = document.getElementById('imagen');
    
    if (!nombre || !precio || !descripcion) {
        Swal.fire('Campos incompletos', 'Completa todos los campos.', 'warning');
        return;
    }

    try {
        let imagenPath = null;
        
        // Si hay archivo de imagen, crear URL temporal para mostrar
        if (imagenInput.files.length > 0) {
            imagenPath = URL.createObjectURL(imagenInput.files[0]);
        }

        const plato = {
            nombre: nombre,
            precio: parseFloat(precio),
            descripcion: descripcion,
            imagen: imagenPath,
            id: Date.now() // ID único basado en timestamp
        };
        
        if (editIndex === -1) {
            platos.push(plato);
            Swal.fire({
                title: '¡Éxito!',
                text: 'Plato agregado correctamente',
                icon: 'success',
                confirmButtonColor: '#706D54'
            });
        } else {
            platos[editIndex] = { ...plato, id: platos[editIndex].id };
            editIndex = -1;
            // Restaurar el botón a su estado original
            const submitBtn = document.querySelector('#plato-form button[type="submit"]');
            submitBtn.innerHTML = '<i class="fas fa-save me-2"></i>Guardar Plato';
            submitBtn.onclick = function() { guardarPlato(); };
            
            Swal.fire({
                title: '¡Actualizado!',
                text: 'Plato actualizado correctamente',
                icon: 'success',
                confirmButtonColor: '#706D54'
            });
        }
        
        // Limpiar formulario
        document.getElementById('nombre').value = '';
        document.getElementById('precio').value = '';
        document.getElementById('descripcion').value = '';
        imagenInput.value = '';
        
        actualizarVistas();
    } catch (err) {
        console.error(err);
        Swal.fire('Error', 'No se pudo guardar el plato.', 'error');
    }
}

// Función para cargar platos (mantiene compatibilidad)
function cargarPlatos() {
    actualizarVistas();
}

// Función para editar plato
function editarPlato(id) {
    // Buscar el plato por ID
    const index = platos.findIndex(plato => plato.id === id);
    if (index === -1) return;
    
    const plato = platos[index];
    
    // Llenar el formulario con los datos del plato
    document.getElementById('nombre').value = plato.nombre;
    document.getElementById('precio').value = plato.precio;
    document.getElementById('descripcion').value = plato.descripcion;
    
    // Cambiar el botón de guardar a actualizar
    const submitBtn = document.querySelector('#plato-form button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-sync-alt me-2"></i>Actualizar Plato';
    submitBtn.onclick = function() { actualizarPlato(id); };
    
    editIndex = index;
    
    // Desplazar la vista al formulario
    document.getElementById('plato-form').scrollIntoView({ behavior: 'smooth' });
}

// Función para actualizar plato
async function actualizarPlato(id) {
    const nombre = document.getElementById('nombre').value.trim();
    const precio = document.getElementById('precio').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();
    const imagenInput = document.getElementById('imagen');
    
    if (!nombre || !precio || !descripcion) {
        Swal.fire('Campos incompletos', 'Completa todos los campos.', 'warning');
        return;
    }

    try {
        const index = platos.findIndex(plato => plato.id === id);
        if (index === -1) return;
        
        let imagenPath = platos[index].imagen; // Mantener imagen actual por defecto
        
        // Si hay nueva imagen, crear URL temporal
        if (imagenInput.files.length > 0) {
            imagenPath = URL.createObjectURL(imagenInput.files[0]);
        }

        // Actualizar el plato
        platos[index] = {
            ...platos[index],
            nombre: nombre,
            precio: parseFloat(precio),
            descripcion: descripcion,
            imagen: imagenPath
        };

        Swal.fire('Actualizado', 'El plato se actualizó exitosamente.', 'success');
        
        // Restaurar el formulario
        document.getElementById('nombre').value = '';
        document.getElementById('precio').value = '';
        document.getElementById('descripcion').value = '';
        imagenInput.value = '';
        
        // Restaurar el botón a su estado original
        const submitBtn = document.querySelector('#plato-form button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-save me-2"></i>Guardar Plato';
        submitBtn.onclick = function() { guardarPlato(); };
        
        editIndex = -1;
        actualizarVistas();
    } catch (err) {
        console.error(err);
        Swal.fire('Error', 'No se pudo actualizar el plato.', 'error');
    }
}

// Función para eliminar plato
function eliminarPlato(id) {
    Swal.fire({
        title: '¿Eliminar?',
        text: '¿Deseas eliminar este plato?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d'
    }).then(result => {
        if (result.isConfirmed) {
            const index = platos.findIndex(plato => plato.id === id);
            if (index !== -1) {
                platos.splice(index, 1);
                actualizarVistas();
                Swal.fire({
                    title: '¡Eliminado!',
                    text: 'El plato ha sido eliminado',
                    icon: 'success',
                    confirmButtonColor: '#706D54'
                });
            }
        }
    });
}

// Función para actualizar las vistas
function actualizarVistas() {
    actualizarGrid();
    actualizarTabla();
}

// Función para actualizar el grid de platos
function actualizarGrid() {
    const container = document.getElementById('dishes-container');
    container.innerHTML = '';
    
    platos.forEach((plato, index) => {
        const card = document.createElement('div');
        card.className = 'dish-card';
        card.innerHTML = `
            <div class="dish-image">
                ${plato.imagen ? 
                    `<img src="${plato.imagen}" alt="${plato.nombre}">` : 
                    '<i class="fas fa-utensils"></i>'
                }
                ${index < 3 ? '<div class="new-badge">NEW</div>' : ''}
            </div>
            <div class="dish-content">
                <h3 class="dish-title">${plato.nombre}</h3>
                <div class="dish-price">$${plato.precio.toLocaleString()}</div>
                <p class="dish-description">${plato.descripcion}</p>
                <div class="dish-actions">
                    <button class="btn btn-warning btn-sm" onclick="editarPlato(${plato.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="eliminarPlato(${plato.id})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Función para actualizar la tabla
function actualizarTabla() {
    const tbody = document.getElementById('tabla-platos');
    tbody.innerHTML = '';
    
    platos.forEach((plato) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${plato.nombre}</strong></td>
            <td><span class="fw-semibold text-success">$${plato.precio.toLocaleString()}</span></td>
            <td>${plato.descripcion}</td>
            <td>
                ${plato.imagen ? 
                    `<img src="${plato.imagen}" class="img-thumbnail" alt="${plato.nombre}">` : 
                    '<div class="img-thumbnail d-flex align-items-center justify-content-center" style="width:60px;height:60px;"><i class="fas fa-image text-muted"></i></div>'
                }
            </td>
            <td>
                <button class="btn btn-primary btn-sm me-2" onclick="editarPlato(${plato.id})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="eliminarPlato(${plato.id})" title="Eliminar">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}