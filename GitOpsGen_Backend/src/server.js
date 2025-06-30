// src/server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { initDb } = require('../db');


const app = express();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// CORS
app.use(cors({
    origin: 'http://localhost:3039',
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    credentials: true
}));

// JSON body parser
app.use(bodyParser.json());

// Log middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// Initialisation DB + tables
initDb().catch(err => console.error('Échec initDb:', err));

// Import des routes
const authRoutes        = require('./routes/authRoutes');
const groupRoutes       = require('./routes/groupRoutes');
const gitlabRoutes      = require('./routes/gitlabApplication.routes');
const gitlabHelmCharts  = require('./routes/gitlabhelmchart.routes');
const formulaireRoutes  = require('./routes/formulaire.routes');
const tokenRoutes       = require('./routes/token.routes');
const parametreRoutes   = require('./routes/parametreRoutes');
const userRoutes        = require('./routes/user.routes');
const argoRoutes        = require('./routes/argo.routes');
const gitlabRoutes1     = require('./routes/gitlab.routes');

// Montage des routes
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/gitlab', gitlabRoutes);
app.use('/api/gitlab/helmcharts', gitlabHelmCharts);
app.use('/api/formulaire', formulaireRoutes);
app.use('/api/token', tokenRoutes);
app.use('/api/parametre', parametreRoutes);
app.use('/api/users', userRoutes);
app.use('/api/v1/applications', argoRoutes);
app.use('/api/v1', gitlabRoutes1);

console.log('✅ Toutes les routes montées');

// Debug global des routes
app.get('/api/debug/routes', (req, res) => {
    const routes = [];
    app._router.stack.forEach(mw => {
        if (mw.name === 'router') {
            mw.handle.stack.forEach(h => {
                if (h.route) {
                    routes.push({
                        path: h.route.path,
                        method: Object.keys(h.route.methods)[0]
                    });
                }
            });
        }
    });
    res.json(routes);
});

// 404 handler
app.use((req, res) => {
    console.warn(`⚠️ 404: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ message: 'Endpoint introuvable' });
});

// Start
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${port}`);
});
