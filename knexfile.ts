import dotenv from 'dotenv'

dotenv.config()

console.log(process.env.POSTGRES_URI)
module.exports = {
    development: {
        client: 'pg',
        connection: process.env.POSTGRES_URI,
        migrations: {
            directory: './src/db/migrations',
            tableName: 'knex_migrations',
        }
    }
}