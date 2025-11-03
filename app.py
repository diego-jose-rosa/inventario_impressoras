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
    # Buscar impressoras diretamente do banco de dados para exibir na página inicial
    impressoras, erro = executar_query("SELECT * FROM impressoras ORDER BY nome", fetch='all')
    if erro:
        print(f"Erro ao buscar impressoras: {erro}")
        impressoras = []
    return render_template("index.html", impressoras=impressoras)

@app.route("/impressora")
def impressora():
    # Buscar impressoras diretamente do banco de dados para garantir que sejam exibidas
    impressoras, erro = executar_query("SELECT * FROM impressoras ORDER BY nome", fetch='all')
    if erro:
        print(f"Erro ao buscar impressoras: {erro}")
        impressoras = []
    else:
        print(f"Impressoras encontradas: {len(impressoras)}")
        for imp in impressoras:
            print(f"Impressora: {imp}")
    return render_template("impressora.html", impressoras=impressoras)

@app.route("/impressora/<int:impressora_id>")
def obter_impressora(impressora_id):
    impressora, erro = executar_query("SELECT * FROM impressoras WHERE id = %s", (impressora_id,), fetch='one')
    if erro:
        return jsonify({"erro": f"Erro ao buscar impressora: {erro}"})
    if not impressora:
        return jsonify({"erro": "Impressora não encontrada"})
    return jsonify(impressora)

@app.route("/toner")
def toner():
    # Buscar toners diretamente do banco de dados
    toners, erro = executar_query("SELECT id, modelo, impressora, cor, quantidade_novo, quantidade_usado FROM toners ORDER BY modelo", fetch='all')
    if erro:
        print(f"Erro ao buscar toners: {erro}")
        toners = []
    return render_template("toner.html", toners=toners)

@app.route("/unidadeimagem")
def unidadeimagem():
    # Buscar unidades de imagem diretamente do banco de dados
    unidades, erro = executar_query("SELECT * FROM unidadeimagem ORDER BY modelo", fetch='all')
    if erro:
        print(f"Erro ao buscar unidades de imagem: {erro}")
        unidades = []
    return render_template("unidadeimagem.html", unidades=unidades)

@app.route("/computador")
def computador():
    computadores, erro = executar_query("SELECT * FROM computadores ORDER BY marca", fetch='all')
    if erro:
        print(f"Erro ao buscar computadores: {erro}")
        computadores = []
    return render_template("computador.html", computadores=computadores)

@app.route("/salvar_impressora", methods=["POST"])
def salvar_impressora():
    data = request.form
    nome = data.get("printer-name")
    modelo = data.get("printer-model")
    setor = data.get("printer-sector")
    ip = data.get("printer-ip")

    if not all([nome, modelo, setor, ip]):
        return jsonify({"erro": "Todos os campos são obrigatórios!"}), 400

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
    sistema_operacional = data.get("computer-os")

    if not all([marca, modelo, patrimonio, serialnumber, setor, sistema_operacional]):
        return jsonify({"erro": "Todos os campos são obrigatórios!"}), 400

    sql = "INSERT INTO computadores (marca, modelo, patrimonio, serialnumber, setor, sistema_operacional) VALUES (%s, %s, %s, %s, %s, %s)"
    _, erro = executar_query(sql, (marca, modelo, patrimonio, serialnumber, setor, sistema_operacional))

    if erro:
        return jsonify({"erro": erro}), 500
    return jsonify({"mensagem": "Computador salvo com sucesso!"}), 200

@app.route("/salvar_toner", methods=["POST"])
def salvar_toner():
    data = request.form
    print(f"Form data: {data}")
    modelo = data.get("toner-model")
    impressora = data.get("toner-impressora")
    cor = data.get("toner-cor")
    quantidade_estoque = data.get("toner-quantidade-estoque")
    quantidade_devolucao = data.get("toner-quantidade-devolucao")
    toner_id = data.get("toner-id")

    print(f"Parsed data: modelo={modelo}, impressora={impressora}, cor={cor}, estoque={quantidade_estoque}, devolucao={quantidade_devolucao}, id={toner_id}")

    if not all([modelo, impressora, cor, quantidade_estoque, quantidade_devolucao]):
        return jsonify({"erro": "Todos os campos são obrigatórios!"}), 400

    try:
        quantidade_estoque = int(quantidade_estoque)
        quantidade_devolucao = int(quantidade_devolucao)
    except ValueError:
        return jsonify({"erro": "Quantidades devem ser números inteiros!"}), 400

    if toner_id:
        # Atualizar toner existente
        sql = "UPDATE toners SET modelo = %s, impressora = %s, cor = %s, quantidade_novo = %s, quantidade_usado = %s WHERE id = %s"
        params = (modelo, impressora, cor, quantidade_estoque, quantidade_devolucao, toner_id)
        print(f"Executing UPDATE: {sql} with params {params}")
        _, erro = executar_query(sql, params)
        mensagem = "Toner atualizado com sucesso!"
    else:
        # Inserir novo toner
        sql = "INSERT INTO toners (modelo, impressora, cor, quantidade_novo, quantidade_usado) VALUES (%s, %s, %s, %s, %s)"
        params = (modelo, impressora, cor, quantidade_estoque, quantidade_devolucao)
        print(f"Executing INSERT: {sql} with params {params}")
        _, erro = executar_query(sql, params)
        mensagem = "Toner salvo com sucesso!"

    if erro:
        print(f"Database error: {erro}")
        return jsonify({"erro": erro}), 500
    return jsonify({"mensagem": mensagem}), 200

@app.route("/excluir_toner/<int:toner_id>", methods=["DELETE"])
def excluir_toner(toner_id):
    sql = "DELETE FROM toners WHERE id = %s"
    _, erro = executar_query(sql, (toner_id,))
    
    if erro:
        return jsonify({"erro": erro}), 500
    return jsonify({"mensagem": "Toner excluído com sucesso!"}), 200

@app.route("/excluir_unidadeimagem/<int:unidade_id>", methods=["DELETE"])
def excluir_unidadeimagem(unidade_id):
    sql = "DELETE FROM unidadeimagem WHERE id = %s"
    _, erro = executar_query(sql, (unidade_id,))
    
    if erro:
        return jsonify({"erro": erro}), 500
    return jsonify({"mensagem": "Unidade de imagem excluída com sucesso!"}), 200

@app.route("/excluir_computador/<int:computador_id>", methods=["DELETE"])
def excluir_computador(computador_id):
    sql = "DELETE FROM computadores WHERE id = %s"
    _, erro = executar_query(sql, (computador_id,))
    
    if erro:
        return jsonify({"erro": erro}), 500
    return jsonify({"mensagem": "Computador excluído com sucesso!"}), 200
@app.route("/salvar_unidadeimagem", methods=["POST"])
def salvar_unidadeimagem():
    data = request.form
    modelo = data.get("item-model")
    quantidade_novo = data.get("item-new-quantity")
    quantidade_usado = data.get("item-used-quantity")
    item_id = data.get("item-id")

    if not all([modelo, quantidade_novo, quantidade_usado]):
        return jsonify({"erro": "Todos os campos são obrigatórios!"}), 400

    try:
        quantidade_novo = int(quantidade_novo)
        quantidade_usado = int(quantidade_usado)
    except ValueError:
        return jsonify({"erro": "Quantidades devem ser números inteiros!"}), 400

    if item_id:
        # Atualizar unidade de imagem existente
        sql = "UPDATE unidadeimagem SET modelo = %s, quantidade_novo = %s, quantidade_usado = %s WHERE id = %s"
        params = (modelo, quantidade_novo, quantidade_usado, item_id)
        _, erro = executar_query(sql, params)
        mensagem = "Unidade de imagem atualizada com sucesso!"
    else:
        # Inserir nova unidade de imagem
        sql = "INSERT INTO unidadeimagem (modelo, quantidade_novo, quantidade_usado) VALUES (%s, %s, %s)"
        params = (modelo, quantidade_novo, quantidade_usado)
        _, erro = executar_query(sql, params)
        mensagem = "Unidade de imagem salva com sucesso!"

    if erro:
        return jsonify({"erro": erro}), 500
    return jsonify({"mensagem": mensagem}), 200

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

@app.route("/atualizar_impressora", methods=["PUT"])
def atualizar_impressora():
    data = request.form
    printer_id = data.get("printer-id")
    nome = data.get("printer-name")
    modelo = data.get("printer-model")
    setor = data.get("printer-sector")
    ip = data.get("printer-ip")

    if not all([printer_id, nome, modelo, setor, ip]):
        return jsonify({"erro": "Todos os campos são obrigatórios!"}), 400

    sql = "UPDATE impressoras SET nome = %s, modelo = %s, setor = %s, ip = %s WHERE id = %s"
    _, erro = executar_query(sql, (nome, modelo, setor, ip, printer_id))

    if erro:
        return jsonify({"erro": erro}), 500
    return jsonify({"mensagem": "Impressora atualizada com sucesso!"}), 200

@app.route("/atualizar_computador", methods=["POST"])
def atualizar_computador():
    data = request.form
    item_id = data.get("item-id")
    marca = data.get("computer-brand")
    modelo = data.get("computer-model")
    patrimonio = data.get("computer-asset")
    serialnumber = data.get("computer-serial")
    setor = data.get("computer-sector")
    sistema_operacional = data.get("computer-os")

    if not all([item_id, marca, modelo, patrimonio, serialnumber, setor, sistema_operacional]):
        return jsonify({"erro": "Todos os campos são obrigatórios!"}), 400

    sql = "UPDATE computadores SET marca = %s, modelo = %s, patrimonio = %s, serialnumber = %s, setor = %s, sistema_operacional = %s WHERE id = %s"
    _, erro = executar_query(sql, (marca, modelo, patrimonio, serialnumber, setor, sistema_operacional, item_id))

    if erro:
        return jsonify({"erro": erro}), 500
    return jsonify({"mensagem": "Computador atualizado com sucesso!"}), 200


if __name__ == "__main__":
    app.run(debug=True)
