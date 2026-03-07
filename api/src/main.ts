import { NestFactory } from '@nestjs/core'
import { MainModule } from './main.module'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
	const app = await NestFactory.create(MainModule)
	app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))

	const config = new DocumentBuilder()
		.setTitle('Pipelines API')
		.setDescription('API documentation')
		.setVersion('1.0')
		.build()

	const document = SwaggerModule.createDocument(app, config)
	SwaggerModule.setup('docs', app, document)

	await app.listen(process.env.PORT ? Number(process.env.PORT) : 8000)
}

bootstrap()