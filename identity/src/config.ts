export const config = {
	port: parseInt(process.env.PORT || '4010', 10),
	mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/default',
	accountJwtSecret: process.env.ACCOUNT_JWT_SECRET || 'dev-account-secret',
	userJwtSecret: process.env.USER_JWT_SECRET || 'dev-user-secret',
}
