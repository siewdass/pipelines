export const config = {
	port: parseInt(process.env.PORT || '4014', 10),
	mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/catalog'
}
