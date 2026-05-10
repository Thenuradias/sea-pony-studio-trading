// Simple stress test for API endpoints
// Run with: node tests/stressTest.js

const http = require('http');

const BASE_URL = 'http://localhost:8080';
const REQUESTS = 50;
const CONCURRENT = 10;

let completed = 0;
let successCount = 0;
let failCount = 0;
let responseTimes = [];

async function makeRequest(endpoint, method = 'GET') {
    const start = Date.now();
    
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: 8080,
            path: endpoint,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        const req = http.request(options, (res) => {
            const end = Date.now();
            responseTimes.push(end - start);
            
            if (res.statusCode === 200) {
                successCount++;
            } else {
                failCount++;
            }
            completed++;
            resolve();
        });
        
        req.on('error', () => {
            failCount++;
            completed++;
            resolve();
        });
        
        req.end();
    });
}

async function runStressTest() {
    console.log(`\n🚀 Starting Stress Test`);
    console.log(`📊 ${REQUESTS} requests, ${CONCURRENT} concurrent`);
    console.log('⏳ Running...\n');
    
    const startTime = Date.now();
    
    // Test /test endpoint
    for (let i = 0; i < REQUESTS; i++) {
        makeRequest('/test');
        if ((i + 1) % CONCURRENT === 0) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
    }
    
    // Wait for all requests to complete
    const waitForCompletion = setInterval(() => {
        if (completed >= REQUESTS) {
            clearInterval(waitForCompletion);
            
            const totalTime = Date.now() - startTime;
            const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
            const throughput = (REQUESTS / totalTime) * 1000;
            
            console.log('📈 Results:');
            console.log(`   ✅ Successful: ${successCount}`);
            console.log(`   ❌ Failed: ${failCount}`);
            console.log(`   ⏱️  Avg Response: ${avgResponseTime.toFixed(2)}ms`);
            console.log(`   🚄 Throughput: ${throughput.toFixed(2)} req/sec`);
            console.log(`   ⏰ Total Time: ${totalTime}ms\n`);
            
            if (successCount === REQUESTS) {
                console.log('🎉 Stress test passed! Server handles load well.\n');
            }
        }
    }, 100);
}

// Check if server is running first
const checkServer = () => {
    const req = http.request({ hostname: 'localhost', port: 8080, path: '/test', method: 'GET' }, (res) => {
        if (res.statusCode === 200) {
            console.log('✅ Server is running');
            runStressTest();
        } else {
            console.log('❌ Server not responding. Start server first: node server.js');
        }
    });
    
    req.on('error', () => {
        console.log('❌ Cannot connect to server. Start server first: node server.js');
    });
    
    req.end();
};

checkServer();