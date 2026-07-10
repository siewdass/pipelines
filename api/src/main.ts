import { NestFactory } from '@nestjs/core'
import { MainModule } from './main.module'
import { ValidationPipe, ConsoleLogger } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
	const app = await NestFactory.create(MainModule, {
		logger: new ConsoleLogger({
			prefix: 'PIPELINES',
			colors: true,
		}),
	})
	app.enableCors({
		origin: (origin, callback) => {
			callback(null, origin || true)
		},
		credentials: true,
		methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization', 'project-id', 'x-project-id'],
		preflightContinue: false,
		optionsSuccessStatus: 204,
	})
	app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))

	const config = new DocumentBuilder()
		.setTitle('Pipelines API')
		.setDescription('API documentation')
		.setVersion('1.0')
		.build()

	const document = SwaggerModule.createDocument(app, config)
	SwaggerModule.setup('docs', app, document)

	await app.listen(process.env.PORT ? Number(process.env.PORT) : 4000, '0.0.0.0')
}

bootstrap()