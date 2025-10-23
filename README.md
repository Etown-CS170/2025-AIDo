# 2025-AIDo
A-I Do is a wedding planning assistant that takes couples from ‘Yes’ to ‘I Do’ with less stress and more clarity. Its built-in AI chatbot guides couples step by step — simplifying decisions, tracking budgets, and keeping them on schedule.

## Tech Stack
* React
* TypeScript
* PostgreSQL
* OpenAI
* Hugging Face
* LangChain

## Getting Started
1. Clone the repository
```
git clone https://github.com/Etown-CS170/2025-AIDo.git
```
2. Check requirements (Node > 18)
```
node -v
npm -v
```
3. Database setup
```
---TODO: TEST BELOW---
docker run --name aido-postgres -e POSTGRES_PASSWORD=mysecretpassword -p 5431:5432 -d postgres

# Windows
$env:PGPASSWORD='mysecretpassword'
psql -h 127.0.0.1 -p 5431 -U postgres -d postgres -f .\ai-do\public\database\init.sql
```
4. Set up .env
```
PGHOST=127.0.0.1
PGPORT=5431
PGUSER=postgres
PGPASSWORD=mysecretpassword
PGDATABASE=aido_db
```
5. Start the website on http://localhost:5173/
```
cd ai-do
npm install
npm run dev
```
