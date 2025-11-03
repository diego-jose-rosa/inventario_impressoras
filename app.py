from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import mysql.connector
from mysql.connector import pooling
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, template_folder='templates')
CORS(app)

db_config = {
    "host": os.getenv("DB_HOST"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME")
}

try:
    pool = mysql.connector.pooling.MySQLConnectionPool(pool_name="mypool",
                                                     pool_size=5,
                                                     **db_config)
    print("Connection pool created successfully.")
except mysql.connector.Error as err:
    print(f"Error creating connection pool: {err}")
    pool = None

def executar_query(query, params=None, fetch=None):
    conn = None
    cursor = None
    try:
        conn = pool.get_connection()
        if conn is None:
            return None, "Não foi possível conectar ao banco de dados."
        
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query, params)
        
        if fetch == 'all':
            resultado = cursor.fetchall()
            return resultado, None
        elif fetch == 'one':
            resultado = cursor.fetchone()
            return resultado, None
        else:
            conn.commit()
            return None, None
            
    except mysql.connector.Error as err:
        return None, str(err)
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/toner")
def toner():
    return render_template("toner.html")

@app.route("/unidadeimagem")
def unidadeimagem():
    return render_template("unidadeimagem.html")

@app.route("/computador")
def computador():
    return render_template("computador.html")

@app.route("/salvar_impressora", methods=["POST"])
def salvar_impressora():
    data = request.form
    nome = data.get("printer-name")
    modelo = data.get("printer-model")
    setor = data.get("printer-sector")
    ip = data.get("printer-ip")

    sql = "INSERT INTO impressoras (nome, modelo, setor, ip) VALUES (%s, %s, %s, %s)"
    _, erro = executar_query(sql, (nome, modelo, setor, ip))

    if erro:
        return jsonify({"erro": erro}), 500
    return jsonify({"mensagem": "Impressora salva com sucesso!"}), 200

@app.route("/salvar_computador", methods=["POST"])
def salvar_computador():
    data = request.form
    marca = data.get("computer-brand")
    modelo = data.get("computer-model")
    patrimonio = data.get("computer-asset")
    serialnumber = data.get("computer-serial")
    setor = data.get("computer-sector")

    sql = "INSERT INTO computadores (marca, modelo, patrimonio, serialnumber, setor) VALUES (%s, %s, %s, %s, %s)"
    _, erro = executar_query(sql, (marca, modelo, patrimonio, serialnumber, setor))

    if erro:
        return jsonify({"erro": erro}), 500
    return jsonify({"mensagem": "Computador salvo com sucesso!"}), 200

@app.route("/listar_impressoras", methods=["GET"])
def listar_impressoras():
    impressoras, erro = executar_query("SELECT * FROM impressoras ORDER BY nome", fetch='all')
    if erro:
        return jsonify({"erro": erro}), 500
    return jsonify(impressoras)

@app.route("/listar_computadores", methods=["GET"])
def listar_computadores():
    computadores, erro = executar_query("SELECT * FROM computadores", fetch='all')
    if erro:
        return jsonify({"erro": erro}), 500
    return jsonify(computadores)

@app.route("/inventario/<tipo>", methods=["GET"])
def get_inventario(tipo):
    tabelas = {"toner": "toners", "unidadeimagem": "unidadeimagem"}
    tabela = tabelas.get(tipo)
    if not tabela:
        return jsonify({"erro": "Tipo de inventário inválido"}), 400

    query = f"SELECT * FROM {tabela} ORDER BY modelo"
    items, erro = executar_query(query, fetch='all')
    
    if erro:
        return jsonify({"erro": erro}), 500
    return jsonify(items)

@app.route("/inventario/atualizar", methods=["POST"])
def atualizar_inventario():
    data = request.json
    item_id = data.get('id')
    tipo_item = data.get('tipo')
    coluna = data.get('coluna')
    nova_quantidade = data.get('quantidade')

    if not all([item_id, tipo_item, coluna, isinstance(nova_quantidade, int)]):
        return jsonify({"erro": "Dados inválidos."}), 400

    tabelas = {"toner": "toners", "unidadeimagem": "unidadeimagem"}
    tabela = tabelas.get(tipo_item)
    if not tabela:
        return jsonify({"erro": "Tipo de item inválido"}), 400
    
    query = f"UPDATE {tabela} SET {coluna} = %s WHERE id = %s"
    _, erro = executar_query(query, (nova_quantidade, item_id))

    if erro:
        return jsonify({"erro": erro}), 500
    return jsonify({"mensagem": "Inventário atualizado com sucesso!"})

@app.route("/impressora/excluir/<int:impressora_id>", methods=["DELETE"])
def excluir_impressora(impressora_id):
    query = "DELETE FROM impressoras WHERE id = %s"
    _, erro = executar_query(query, (impressora_id,))

    if erro:
        return jsonify({"erro": erro}), 500
    return jsonify({"mensagem": "Impressora excluída com sucesso!"})


if __name__ == "__main__":
    app.run(debug=True)
