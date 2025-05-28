from flask import Flask, request, jsonify, render_template, send_from_directory
from werkzeug.utils import secure_filename
import sqlite3
import os

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'static', 'uploads')
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Ruta de la base de datos
DATABASE = os.path.join(os.path.dirname(__file__), 'platos.db')

# Función para verificar y actualizar la estructura de la base de datos
def check_db_structure():
    with sqlite3.connect(DATABASE) as db:
        cursor = db.cursor()
        
        # Verificar si la tabla existe
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='platos'")
        table_exists = cursor.fetchone()
        
        if table_exists:
            # Verificar las columnas existentes
            cursor.execute("PRAGMA table_info(platos)")
            columns = [column[1] for column in cursor.fetchall()]
            
            # Añadir columna imagen si no existe
            if 'imagen' not in columns:
                cursor.execute("ALTER TABLE platos ADD COLUMN imagen TEXT")
                db.commit()
        else:
            # Crear la tabla si no existe
            cursor.execute('''
                CREATE TABLE platos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nombre TEXT NOT NULL,
                    precio REAL NOT NULL,
                    descripcion TEXT,
                    imagen TEXT
                )
            ''')
            db.commit()

# Inicializa la base de datos al iniciar la aplicación
check_db_structure()

def get_db():
    return sqlite3.connect(DATABASE)

# Renderiza la interfaz principal
@app.route('/')
def home():
    return render_template('index.html')

# Endpoint GET y POST para platos
@app.route('/platos', methods=['GET', 'POST'])
def platos():
    db = get_db()
    if request.method == 'POST':
        data = request.get_json()
        db.execute('INSERT INTO platos (nombre, precio, descripcion, imagen) VALUES (?, ?, ?, ?)',
               [data['nombre'], data['precio'], data['descripcion'], data.get('imagen')])
        db.commit()
        return jsonify({"mensaje": "Plato guardado correctamente"})
    
    elif request.method == 'GET':
        cursor = db.execute('SELECT * FROM platos')
        platos = [dict(id=row[0], nombre=row[1], precio=row[2], descripcion=row[3], imagen=row[4]) for row in cursor.fetchall()]
        return jsonify(platos)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'imagen' not in request.files:
        return jsonify({"error": "No se recibió archivo"}), 400
        
    file = request.files['imagen']
    if file.filename == '':
        return jsonify({"error": "No se seleccionó archivo"}), 400
        
    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        return jsonify({"ruta": f"/static/uploads/{filename}"})
    return jsonify({"error": "Error al subir archivo"}), 500

# Endpoint GET, PUT, DELETE por ID
@app.route('/platos/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def plato_id(id):
    db = get_db()
    
    if request.method == 'GET':
        cursor = db.execute('SELECT * FROM platos WHERE id = ?', [id])
        row = cursor.fetchone()
        if row:
            return jsonify(dict(id=row[0], nombre=row[1], precio=row[2], descripcion=row[3], imagen=row[4]))
        else:
            return jsonify({"error": "Plato no encontrado"}), 404

    elif request.method == 'PUT':
        data = request.get_json()
        db.execute('UPDATE platos SET nombre = ?, precio = ?, descripcion = ?, imagen = ? WHERE id = ?',
                   [data['nombre'], data['precio'], data['descripcion'], data.get('imagen'), id])
        db.commit()
        return jsonify({"mensaje": "Plato actualizado correctamente"})

    elif request.method == 'DELETE':
        db.execute('DELETE FROM platos WHERE id = ?', [id])
        db.commit()
        return jsonify({"mensaje": "Plato eliminado correctamente"})

# Servir archivos estáticos
@app.route('/static/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


# Ejecutar la app
if __name__ == '__main__':
    check_db_structure()  # Cambia init_db() por check_db_structure()
    app.run(debug=True)