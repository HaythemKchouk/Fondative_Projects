require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

// Middleware cors
app.use(cors({
    origin: 'http://localhost:3039',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));

// Middleware body parser
app.use(bodyParser.json());

// Middleware de log
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// Import des routes
const authRoutes = require('./routes/authRoutes');
const groupRoutes = require('./routes/groupRoutes');
const gitlabRoutes = require('./routes/gitlabApplication.routes');
const gitlabHelmChartRoutes = require('./routes/gitlabhelmchart.routes');
const formulaireRoutes = require('./routes/formulaire.routes');
const tokenRoutes = require('./routes/token.routes');
const paramtreRoutes = require('./routes/parametreRoutes');
const userRoutes = require('./routes/user.routes');

// Montage des routes
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/gitlab', gitlabRoutes);
app.use('/api/gitlab/helmcharts', gitlabHelmChartRoutes);
app.use('/api/formulaire', formulaireRoutes);
app.use('/api/token', tokenRoutes);
app.use('/api/parametre', paramtreRoutes);
app.use('/api/users', userRoutes);
console.log('✅ Toutes les routes montées');

// Route de debug globale
app.get('/api/debug/routes', (req, res) => {
    const routes = [];
    app._router.stack.forEach(middleware => {
        if (middleware.name === 'router') {
            middleware.handle.stack.forEach(handler => {
                const route = handler.route;
                if (route) {
                    routes.push({
                        path: route.path,
                        method: Object.keys(route.methods)[0]
                    });
                }
            });
        }
    });
    res.json(routes);
});

// 404 Handler
app.use((req, res) => {
    console.warn(`⚠️ 404: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ message: 'Endpoint introuvable' });
});

// Démarrage du serveur
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${port}`);
});