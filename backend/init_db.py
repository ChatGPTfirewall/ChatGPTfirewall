import os
import psycopg2

DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_USER = os.getenv("DB_USER")
DB_NAME = os.getenv("DB_NAME")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_PORT = os.getenv("DB_PORT")

database_connection = f"dbname={DB_NAME} user={DB_USER} password={DB_PASSWORD} host={DB_HOST} port={DB_PORT}"

def migrate():
    print("Connect to database...")
    conn = psycopg2.connect(database_connection)

    # Open a cursor to perform database operations
    cur = conn.cursor()

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, auth0_id VARCHAR(255) UNIQUE NOT NULL, username VARCHAR(255),email VARCHAR(255));
        """
    )

    print("Create 'users' table...")

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS documents (id SERIAL PRIMARY KEY, user_id INT, filename VARCHAR(255),text TEXT, CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id));
        """
    )

    print("Create 'documents' table...")

    conn.commit()
    cur.close()
    conn.close()

    print("DB successfully initialized.")