import mysql.connector
from mysql.connector import errorcode

DB_NAME = 'gestao_impressoras'

TABLES = {}
TABLES['impressoras'] = (
    "CREATE TABLE impressoras("
    "  `id` int(11) NOT NULL AUTO_INCREMENT,"
    "  `nome` varchar(255) NOT NULL,"
    "  `modelo` varchar(255) NOT NULL,"
    "  `setor` varchar(255) DEFAULT NULL,"
    "  `ip` varchar(45) DEFAULT NULL,"
    "  PRIMARY KEY (`id`)"
    ") ENGINE=InnoDB")

TABLES['toners'] = ("""
    CREATE TABLE `toners` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `modelo` varchar(255) NOT NULL,
    `quantidade_novo` int(11) NOT NULL DEFAULT 0,
    `quantidade_usado` int(11) NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`)
    ) ENGINE=InnoDB""")

TABLES['unidades_imagem'] = ("""
    CREATE TABLE `unidades_imagem` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `modelo` varchar(255) NOT NULL,
    `quantidade_novo` int(11) NOT NULL DEFAULT 0,
    `quantidade_usado` int(11) NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`)
    ) ENGINE=InnoDB""")

def create_database(cursor):
    try:
        cursor.execute(
            f"CREATE DATABASE {DB_NAME} DEFAULT CHARACTER SET 'utf8'")
    except mysql.connector.Error as err:
        print(f"Failed creating database: {err}")
        exit(1)

def main():
    try:
        # Conectar sem especificar o banco de dados inicialmente
        cnx = mysql.connector.connect(
            host="localhost",
            user="root",
            password=""
        )
        cursor = cnx.cursor()

        try:
            cursor.execute(f"USE {DB_NAME}")
            print(f"Banco de dados '{DB_NAME}' já existe.")
        except mysql.connector.Error as err:
            if err.errno == errorcode.ER_BAD_DB_ERROR:
                print(f"Banco de dados '{DB_NAME}' não encontrado. Criando...")
                create_database(cursor)
                print(f"Banco de dados '{DB_NAME}' criado com sucesso.")
                cnx.database = DB_NAME
            else:
                raise

        for table_name in TABLES:
            table_description = TABLES[table_name]
            try:
                print(f"Criando tabela: {table_name}", end='')
                cursor.execute(table_description)
            except mysql.connector.Error as err:
                if err.errno == errorcode.ER_TABLE_EXISTS_ERROR:
                    print(" já existe.")
                else:
                    print(err.msg)
            else:
                print(" OK")
        
        # Populando dados iniciais se as tabelas estiverem vazias
        cursor.execute("SELECT COUNT(*) FROM toners")
        if cursor.fetchone()[0] == 0:
            print("Populando a tabela 'toners' com dados iniciais...")
            initial_toners = [
                ('TN-3492', 0, 0),
                ('TN-3472', 0, 0),
                ('TN-2370', 0, 0),
                ('TN-1060', 0, 0),
                ('TN-750', 0, 0)
            ]
            query = "INSERT INTO toners (modelo, quantidade_novo, quantidade_usado) VALUES (%s, %s, %s)"
            cursor.executemany(query, initial_toners)
            cnx.commit()
            print("Dados inseridos em 'toners'.")

        cursor.execute("SELECT COUNT(*) FROM unidades_imagem")
        if cursor.fetchone()[0] == 0:
            print("Populando a tabela 'unidades_imagem' com dados iniciais...")
            initial_imaging_units = [
                ('DR-3440', 0, 0),
                ('DR-2340', 0, 0),
                ('DR-1060', 0, 0)
            ]
            query = "INSERT INTO unidades_imagem (modelo, quantidade_novo, quantidade_usado) VALUES (%s, %s, %s)"
            cursor.executemany(query, initial_imaging_units)
            cnx.commit()
            print("Dados inseridos em 'unidades_imagem'.")

        cursor.close()
        cnx.close()
        print("\nConfiguração do banco de dados concluída com sucesso!")

    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            print("Acesso negado. Verifique seu usuário e senha do MySQL.")
        else:
            print(err)

if __name__ == "__main__":
    main()
