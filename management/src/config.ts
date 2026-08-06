export const config = {
	port: parseInt(process.env.PORT || '4004', 10),
	mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/default',
	accountJwtSecret: process.env.ACCOUNT_JWT_SECRET || 'dev-account-secret',
	userJwtSecret: process.env.USER_JWT_SECRET || 'dev-user-secret',
	mistralApiKey: process.env.MISTRAL_API_KEY || '',
	groqApiKey: process.env.GROQ_API_KEY || '',
	identityUrl: process.env.IDENTITY_URL || 'http://localhost:4010',
}
