import net from 'net';

const host = 'ep-solitary-dream-alsfvt4l.c-3.eu-central-1.aws.neon.tech';
const port = 5432;

console.log(`Connecting to ${host}:${port} (30s timeout)...`);
const client = net.connect({ host, port, timeout: 30000 }, () => {
    console.log('Connected!');
    client.end();
});

client.on('error', (err) => {
    console.error('Connection error:', err);
    process.exit(1);
});

client.on('timeout', () => {
    console.error('Connection timed out');
    client.destroy();
    process.exit(1);
});
