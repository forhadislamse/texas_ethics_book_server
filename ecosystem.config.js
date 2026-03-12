module.exports = {
    apps: [
        {
            name: 'baham_server',
            script: './dist/server.js',
            args: 'start',
            env: {
                NODE_ENV: 'production',
            }, 
        },
    ],
}; 