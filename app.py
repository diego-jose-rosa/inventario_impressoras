from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import mysql.connector

app = Flask(__name__, template_folder='templates')
CORS(app)

db_config = {
    "host": "localhost",
    "user": "root",
    "password": "",
    "database": "gestao_impressoras"
}

def conectar_banco():
    try:
        return mysql.connector.connect(**db_config)
    except mysql.connector.Error as err:
        print(f"Erro de conexão com o banco de dados: {err}")
        return None

def executar_query(query, params=None, fetch=None):
    conn = None
    cursor = None
    try:
        conn = conectar_banco()
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

@app.route("/listar_impressoras", methods=["GET"])
def listar_impressoras():
    impressoras, erro = executar_query("SELECT * FROM impressoras ORDER BY nome", fetch='all')
    if erro:
        return jsonify({"erro": erro}), 500
    return jsonify(impressoras)

@app.route("/inventario/<tipo>", methods=["GET"])
def get_inventario(tipo):
    tabela = 'toners' if tipo == 'toner' else 'unidades_imagem'
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

    tabela = 'toners' if tipo_item == 'toner' else 'unidades_imagem'
    
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
