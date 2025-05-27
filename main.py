from flask import Flask, render_template, request, redirect, session, url_for, flash, jsonify
from db import get_connection
import bcrypt
import os
from functools import wraps
from decimal import Decimal
app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY') or 'fallback_secret_key'

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# NOVA ROTA PARA A PÁGINA HOME
@app.route('/')
def home():
    return render_template('home.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        nome = request.form.get('nome')
        email = request.form.get('email')
        senha = request.form.get('senha')

        if not nome or not email or not senha:
            flash('Por favor, preencha todos os campos.')
            return redirect(url_for('register'))

        senha_hash = bcrypt.hashpw(senha.encode('utf-8'), bcrypt.gensalt())

        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute('INSERT INTO users (nome, email, senha) VALUES (%s, %s, %s)', (nome, email, senha_hash))
            conn.commit()
        except Exception as e:
            flash('Erro ao registrar usuário. Tente novamente.')
            print(e)
            return redirect(url_for('register'))
        finally:
            conn.close()

        flash('Registro realizado com sucesso! Faça login.')
        return redirect(url_for('login'))
    
    # Pegar email da URL se vier da página home
    email_prefill = request.args.get('email', '')
    return render_template('register.html', email_prefill=email_prefill)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        senha = request.form.get('senha')

        if not email or not senha:
            flash('Por favor, preencha todos os campos.')
            return redirect(url_for('login'))

        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute('SELECT * FROM users WHERE email = %s', (email,))
        user = cursor.fetchone()
        conn.close()

        if user and bcrypt.checkpw(senha.encode('utf-8'), user['senha'].encode('utf-8')):
            session['user_id'] = user['id_user']
            session['user_name'] = user['nome']
            return redirect(url_for('dashboard'))
        else:
            flash('Login inválido.')
            return redirect(url_for('login'))
    return render_template('login.html')

@app.route('/dashboard')
@login_required
def dashboard():
    user_id = session['user_id']
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT id_categoria, nome FROM categorias WHERE user_id = %s ORDER BY nome", (user_id,))
    categorias = cursor.fetchall()

    cursor.execute("""
        SELECT p.id, p.amount, p.descricao, p.purchase_time, c.nome AS categoria_nome
        FROM purchases p
        JOIN categorias c ON p.categoria_id = c.id_categoria
        WHERE p.user_id = %s
        ORDER BY p.purchase_time DESC
        LIMIT 10
    """, (user_id,))
    compras = cursor.fetchall()

    cursor.execute("SELECT COALESCE(SUM(amount), 0) AS total FROM purchases WHERE user_id = %s", (user_id,))
    total_gasto = cursor.fetchone()['total']

    cursor.execute("""
        SELECT COUNT(*) AS count FROM purchases
        WHERE user_id = %s
        AND MONTH(purchase_time) = MONTH(CURDATE()) AND YEAR(purchase_time) = YEAR(CURDATE())
    """, (user_id,))
    compras_mes = cursor.fetchone()['count']

    total_modalidades = len(categorias)
    conn.close()

    return render_template('dashboard.html',
                           categorias=categorias,
                           compras=compras,
                           total_gasto=total_gasto,
                           compras_mes=compras_mes,
                           total_modalidades=total_modalidades)

@app.route('/add_purchase', methods=['POST'])
@login_required
def add_purchase():
    amount = request.form.get("amount")
    descricao = request.form.get("descricao")
    categoria_id = request.form.get("categoria_id")
    purchase_time = request.form.get("purchase_time")

    if not amount or not categoria_id:
        flash('Por favor, preencha todos os campos obrigatórios.')
        return redirect(url_for('dashboard'))

    try:
        amount_float = float(amount)
        if amount_float <= 0:
            flash('O valor da compra deve ser positivo.')
            return redirect(url_for('dashboard'))
    except ValueError:
        flash('Valor inválido para amount.')
        return redirect(url_for('dashboard'))

    conn = get_connection()
    cursor = conn.cursor()
    
    if purchase_time:
        cursor.execute("""
            INSERT INTO purchases(user_id, categoria_id, amount, descricao, purchase_time)
            VALUES (%s, %s, %s, %s, %s)
        """, (session['user_id'], categoria_id, amount_float, descricao, purchase_time))
    else:
        cursor.execute("""
            INSERT INTO purchases(user_id, categoria_id, amount, descricao)
            VALUES (%s, %s, %s, %s)
        """, (session['user_id'], categoria_id, amount_float, descricao))
    
    conn.commit()
    conn.close()

    flash('Transação adicionada com sucesso.')
    return redirect(url_for('dashboard'))

@app.route('/add_category', methods=['POST'])
@login_required
def add_category():
    nome = request.form.get('nome')
    if not nome:
        flash('O nome da categoria não pode ser vazio.')
        return redirect(url_for('dashboard'))

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO categorias (user_id, nome) VALUES (%s, %s)
    """, (session['user_id'], nome))
    conn.commit()
    conn.close()

    flash('Categoria adicionada com sucesso.')
    return redirect(url_for('dashboard'))

# ROTA MELHORADA PARA DELETAR CATEGORIA COM LÓGICA CONDICIONAL
@app.route('/delete_category', methods=['POST'])
@login_required
def delete_category():
    try:
        categoria_id = request.form.get('categoria_id')
        print(f"Recebido categoria_id: {categoria_id}")  # Debug
        
        if not categoria_id:
            return jsonify({'success': False, 'error': 'ID da categoria não fornecido'}), 400

        user_id = session['user_id']
        conn = get_connection()
        cursor = conn.cursor()

        # Verificar se a categoria pertence ao usuário
        cursor.execute("SELECT id_categoria, nome FROM categorias WHERE id_categoria = %s AND user_id = %s", (categoria_id, user_id))
        categoria = cursor.fetchone()
        
        if not categoria:
            conn.close()
            return jsonify({'success': False, 'error': 'Categoria não encontrada'}), 404

        categoria_nome = categoria[1] if len(categoria) > 1 else "Categoria"

        # Verificar se existem compras relacionadas à categoria
        cursor.execute("SELECT COUNT(*) as total FROM purchases WHERE categoria_id = %s AND user_id = %s", (categoria_id, user_id))
        resultado = cursor.fetchone()
        total_compras = resultado[0] if resultado else 0
        
        print(f"Total de compras encontradas para a categoria {categoria_id}: {total_compras}")  # Debug

        if total_compras == 0:
            # CENÁRIO 1: Não há compras relacionadas - deletar categoria diretamente
            print("Cenário 1: Nenhuma compra relacionada, deletando categoria diretamente")
            
            cursor.execute("DELETE FROM categorias WHERE id_categoria = %s AND user_id = %s", (categoria_id, user_id))
            category_deleted = cursor.rowcount
            
            conn.commit()
            conn.close()
            
            if category_deleted > 0:
                return jsonify({
                    'success': True, 
                    'message': f'Categoria "{categoria_nome}" excluída com sucesso!'
                }), 200
            else:
                return jsonify({'success': False, 'error': 'Categoria não foi excluída'}), 400
                
        else:
            # CENÁRIO 2: Existem compras relacionadas - deletar compras primeiro, depois categoria
            print(f"Cenário 2: {total_compras} compras relacionadas encontradas, deletando compras primeiro")
            
            # Primeiro, deletar todas as compras relacionadas à categoria
            cursor.execute("DELETE FROM purchases WHERE categoria_id = %s AND user_id = %s", (categoria_id, user_id))
            purchases_deleted = cursor.rowcount
            print(f"Compras deletadas: {purchases_deleted}")  # Debug
            
            # Depois, deletar a categoria
            cursor.execute("DELETE FROM categorias WHERE id_categoria = %s AND user_id = %s", (categoria_id, user_id))
            category_deleted = cursor.rowcount
            print(f"Categoria deletada: {category_deleted}")  # Debug

            conn.commit()
            conn.close()
            
            if category_deleted > 0:
                return jsonify({
                    'success': True, 
                    'message': f'Categoria "{categoria_nome}" e {purchases_deleted} transação(ões) relacionada(s) excluída(s) com sucesso!'
                }), 200
            else:
                return jsonify({'success': False, 'error': 'Categoria não foi excluída'}), 400
        
    except Exception as e:
        print(f"Erro ao deletar categoria: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/delete_purchase', methods=['POST'])
@login_required
def delete_purchase():
    try:
        purchase_id = request.form.get('purchase_id')
        if not purchase_id:
            return jsonify({'success': False, 'error': 'ID da compra não fornecido'}), 400

        user_id = session['user_id']
        conn = get_connection()
        cursor = conn.cursor()
        
        # Verificar se a compra pertence ao usuário
        cursor.execute("SELECT id FROM purchases WHERE id = %s AND user_id = %s", (purchase_id, user_id))
        purchase = cursor.fetchone()
        
        if not purchase:
            conn.close()
            return jsonify({'success': False, 'error': 'Transação não encontrada'}), 404
            
        cursor.execute("DELETE FROM purchases WHERE id = %s AND user_id = %s", (purchase_id, user_id))
        deleted = cursor.rowcount
        conn.commit()
        conn.close()
        
        if deleted > 0:
            return jsonify({'success': True, 'message': 'Transação excluída com sucesso'}), 200
        else:
            return jsonify({'success': False, 'error': 'Transação não foi excluída'}), 400
        
    except Exception as e:
        print(f"Erro ao deletar compra: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/relatorios')
@login_required
def relatorios():
    user_id = session['user_id']
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
    SELECT c.nome AS categoria_nome, COALESCE(SUM(p.amount), 0) AS total
    FROM categorias c
    LEFT JOIN purchases p ON c.id_categoria = p.categoria_id AND p.user_id = %s
    GROUP BY c.nome
    HAVING total > 0
    ORDER BY total DESC
""", (user_id,))

    resultados = cursor.fetchall()

    categorias = [r['categoria_nome'] for r in resultados]
    totais = [float(r['total']) for r in resultados]

    cursor.execute("""
        SELECT 
            (SELECT COALESCE(SUM(amount), 0) FROM purchases WHERE user_id = %s AND amount > 0) AS renda_familiar,
            (SELECT COALESCE(SUM(amount), 0) FROM purchases WHERE user_id = %s AND amount < 0) AS gastos_totais
    """, (user_id, user_id))
    resumo = cursor.fetchone()

    renda_familiar = resumo['renda_familiar'] or Decimal('0.0')
    gastos_totais = resumo['gastos_totais'] or Decimal('0.0')

    renda_familiar_f = float(renda_familiar)
    gastos_totais_f = float(abs(gastos_totais))

    saldo_mes = renda_familiar_f - gastos_totais_f

    conn.close()

    return render_template(
        'relatorios.html',
        categorias=categorias,
        totais=totais,
        renda_familiar=renda_familiar_f,
        gastos_totais=gastos_totais_f,
        saldo_mes=saldo_mes
    )



@app.route('/reset_mes', methods=['POST'])
@login_required
def reset_mes():
    user_id = session['user_id']
    conn = get_connection()
    cursor = conn.cursor()

    # Data de referência: mês atual
    from datetime import datetime
    mes_ref = datetime.now().strftime('%Y-%m')

    # Copiar registros
    cursor.execute("""
        INSERT INTO extrato (user_id, categoria_id, amount, descricao, purchase_time, mes_ref)
        SELECT user_id, categoria_id, amount, descricao, purchase_time, %s
        FROM purchases WHERE user_id = %s
    """, (mes_ref, user_id))

    # Deletar registros do mês atual
    cursor.execute("DELETE FROM purchases WHERE user_id = %s", (user_id,))
    conn.commit()
    conn.close()

    flash('Novo mês iniciado com sucesso. Transações foram movidas para o extrato.')
    return redirect(url_for('dashboard'))


@app.route('/extrato')
@login_required
def extrato():
    user_id = session['user_id']
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT 
            p.id, 
            p.amount, 
            p.descricao, 
            p.purchase_time,
            c.nome AS categoria_nome,
            DATE_FORMAT(p.purchase_time, '%Y-%m') AS mes_ref
        FROM purchases p
        JOIN categorias c ON p.categoria_id = c.id_categoria
        WHERE p.user_id = %s
        ORDER BY mes_ref ASC, p.purchase_time DESC
    """, (user_id,))
    
    registros = cursor.fetchall()
    conn.close()

    return render_template('extrato.html', registros=registros)







@app.route('/logout')
def logout():
    session.clear()
    flash('Você saiu da sessão.')
    return redirect(url_for('home'))  # Redireciona para home ao invés de login

if __name__ == '__main__':
    app.run(debug=True)
