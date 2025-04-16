# 🎉 FanParty

**FanParty** é uma plataforma web inovadora que une o melhor das redes sociais e dos sistemas de promoção de eventos. Desenvolvida para **organizadores de eventos, donos de negócios e usuários comuns**, a aplicação permite divulgar eventos, realizar encontros comunitários e interagir com outros usuários com interesses em comum.

---

## 🔭 Visão do Produto

> Para donos de negócios, organizadores de eventos e usuários comuns que desejam promover eventos ou interagir com pessoas de interesses semelhantes, **FanParty** é um sistema web que promove encontros e fomenta conexões sociais e comerciais, **combinando as funcionalidades de redes sociais e software de eventos em um único lugar**.

Usuários podem avaliar eventos, promover encontros, formar parcerias e fortalecer comunidades ativas em torno de causas e gostos parecidos.

---

## ⚙️ Tecnologias Utilizadas

### 📦 Backend

- Node.js
- Express
- MySQL
- JWT (autenticação)
- Bcrypt (criptografia de senhas)
- Dotenv
- Nodemon

### 💻 Frontend

- HTML, CSS e JavaScript puros
- Vistas servidas diretamente via Express (`res.sendFile`)
- Integração via fetch/AJAX com a API

---

## 🚀 Funcionalidades Iniciais (MVP)

- Cadastro e login de dois tipos de usuários:
  - Usuário comum
  - Empresa / organizador de eventos
- Autenticação com token JWT
- Criptografia de senhas com bcrypt
- Visualização do perfil do usuário logado
- Atualização e exclusão da conta
- Renderização de páginas HTML diretamente via backend

---

## 🧱 Arquitetura

O projeto segue uma **arquitetura em camadas baseada no padrão MVC**, com:

- **Model**: representação da estrutura dos dados
- **Repository**: camada de acesso ao banco de dados
- **Service**: camada de lógica de negócio
- **Controller**: recebe e trata as requisições HTTP
- **Views**: páginas HTML estáticas servidas pelo backend

Essa separação promove um código **mais limpo, modular e escalável**.

---

## 🛠️ Como rodar o projeto localmente

### 🔹 Pré-requisitos

- Node.js instalado
- MySQL instalado
- Git

### 🔹 Clonando o repositório

```bash
git clone https://github.com/seu-usuario/fanparty.git
cd fanparty
```

### 🔹 Configurando as variáveis de ambiente

Crie um arquivo `.env` na raiz com o seguinte conteúdo:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=suasenha
DB_NAME=fanparty_db
JWT_SECRET=suachavesecreta
```

> Substitua com os valores corretos da sua máquina.

---

### 🔹 Instalando dependências

```bash
npm install
```

---

### 🔹 Rodando o projeto

```bash
npm run dev
```

O backend estará disponível em:

```
http://localhost:3000
```

---

## 🩻 Estrutura do Projeto

Fanparty/
  ├── backend/
  │   ├── config/
  │   ├── controllers/
  │   ├── middlewares/
  │   ├── models/
  │   ├── repositories/
  │   ├── routes/
  │   └── services/
  │
  ├── docs/
  │
  ├── frontend/
  │   ├── css/
  │   ├── js/
  │   └── views/

---

## 🧪 Testes com Postman

Você pode testar as seguintes rotas:

| Método | Rota               | Protegida? | Descrição                          |
|--------|--------------------|------------|------------------------------------|
| POST   | `/api/cadastro`    | ❌         | Cadastro de usuário ou empresa     |
| POST   | `/api/login`       | ❌         | Login com retorno de token JWT     |
| GET    | `/api/perfil`      | ✅         | Ver perfil do usuário logado       |
| PUT    | `/api/perfil`      | ✅         | Atualizar dados do usuário         |
| DELETE | `/api/perfil`      | ✅         | Excluir conta                      |

Use o token no header:

```
Authorization: Bearer SEU_TOKEN_AQUI
```

---

## 🌱 Possibilidades Futuras

- Feed de eventos
- Sistema de comentários e curtidas
- Parcerias entre empresas e usuários
- Integração com plataformas de pagamento
- Notificações de eventos próximos

---

## 👥 Desenvolvedores

- Gabriel Ferreira Oliveira
- Kaio Vinícius Cordeiro Batista

---

📄 Todos os direitos reservados.
