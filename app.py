from flask import Flask, request, redirect, url_for
import pandas as pd

class Nodo:
    def __init__(self, dato):
        self.dato = dato
        self.siguiente = None

class ListaEnlazada:
    def __init__(self):
        self.cabeza = None
        self.tamaño = 0

    def insertar(self, dato):
        nuevo_nodo = Nodo(dato)
        if not self.cabeza:
            self.cabeza = nuevo_nodo
        else:
            actual = self.cabeza
            while actual.siguiente:
                actual = actual.siguiente
            actual.siguiente = nuevo_nodo
        self.tamaño += 1

    def eliminar(self, dato):
        if not self.cabeza:
            return

        if self.cabeza.dato == dato:
            self.cabeza = self.cabeza.siguiente
            self.tamaño -= 1
            return

        actual = self.cabeza
        while actual.siguiente and actual.siguiente.dato != dato:
            actual = actual.siguiente

        if actual.siguiente:
            actual.siguiente = actual.siguiente.siguiente
            self.tamaño -= 1

    def obtener_lista(self):
        datos = []
        actual = self.cabeza
        while actual:
            datos.append(actual.dato)
            actual = actual.siguiente
        return datos

    # Agregar este método a la clase ListaEnlazada
    def buscar(self, dato):
        actual = self.cabeza
        posicion = 0
        while actual:
            if actual.dato == dato:
                return posicion
            actual = actual.siguiente
            posicion += 1
        return -1

app = Flask(__name__)
lista = ListaEnlazada()

@app.route('/')
def index():
    datos = lista.obtener_lista()
    df = pd.DataFrame(datos, columns=['Valor'])
    resultado_busqueda = request.args.get('resultado')
    mensaje_busqueda = ''
    if resultado_busqueda is not None:
        if int(resultado_busqueda) >= 0:
            mensaje_busqueda = f'Elemento encontrado en la posición {resultado_busqueda}'
        else:
            mensaje_busqueda = 'Elemento no encontrado'

    return f'''
        <h1>Lista Enlazada Simple</h1>
        <form action="/insertar" method="post">
            <input type="text" name="valor" required>
            <input type="submit" value="Insertar">
        </form>
        <form action="/eliminar" method="post">
            <input type="text" name="valor" required>
            <input type="submit" value="Eliminar">
        </form>
        <form action="/buscar" method="post">
            <input type="text" name="valor" required>
            <input type="submit" value="Buscar">
        </form>
        <p>{mensaje_busqueda}</p>
        <h2>Elementos en la lista:</h2>
        {df.to_html()}
        <p>Tamaño de la lista: {lista.tamaño}</p>
    '''

@app.route('/buscar', methods=['POST'])
def buscar():
    valor = request.form['valor']
    posicion = lista.buscar(valor)
    return redirect(url_for('index', resultado=posicion))

@app.route('/insertar', methods=['POST'])
def insertar():
    valor = request.form['valor']
    lista.insertar(valor)
    return redirect(url_for('index'))

@app.route('/eliminar', methods=['POST'])
def eliminar():
    valor = request.form['valor']
    lista.eliminar(valor)
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)