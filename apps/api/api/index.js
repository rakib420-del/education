"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = void 0;
exports.default = handler;
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const express_1 = require("express");
const server = (0, express_1.default)();
const createServer = async (expressInstance) => {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(expressInstance));
    app.setGlobalPrefix('api');
    app.enableCors({
        origin: '*',
        credentials: true,
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    await app.init();
    return app;
};
exports.createServer = createServer;
let cachedServer;
async function handler(req, res) {
    if (req.url === '/' || req.url === '' || req.url === '/api' || req.url === '/api/') {
        return res.status(200).json({
            status: 'ok',
            service: 'Bangla E-Learning API',
            message: 'API is running on Vercel Serverless',
            endpoints: '/api/content',
        });
    }
    try {
        if (!cachedServer) {
            cachedServer = await (0, exports.createServer)(server);
        }
        return server(req, res);
    }
    catch (err) {
        console.error('Vercel Handler Error:', err);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: err?.message || 'Server initialization failed',
            stack: err?.stack || null,
        });
    }
}
//# sourceMappingURL=index.js.map