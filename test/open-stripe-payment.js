#!/usr/bin/env node

/**
 * Quick Script: Open Stripe Payment Page
 * รัน script นี้แล้วจะเปิด browser ไปหน้า Stripe Payment เลย
 *
 * Usage: node open-stripe-payment.js [amount] [renting_id]
 * Example: node open-stripe-payment.js 1000 rent_123
 */

const https = require('https');
const http = require('http');
const { exec } = require('child_process');

// Configuration
const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';
const AMOUNT = parseInt(process.argv[2]) || 1000;
const RENTING_ID = process.argv[3] || `test_rent_${Date.now()}`;

console.log('🚀 Stripe Payment Test Script');
console.log('================================');
console.log(`💰 Amount: ${AMOUNT} THB`);
console.log(`📦 Renting ID: ${RENTING_ID}`);
console.log(`🌐 Server: ${SERVER_URL}`);
console.log('');

/**
 * Make HTTP request
 */
function makeRequest(url, method, data) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const protocol = urlObj.protocol === 'https:' ? https : http;

        const postData = data ? JSON.stringify(data) : null;

        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
            path: urlObj.pathname,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (postData) {
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }

        const req = protocol.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        statusCode: res.statusCode,
                        data: JSON.parse(body)
                    });
                } catch (e) {
                    reject(new Error(`Failed to parse response: ${body}`));
                }
            });
        });

        req.on('error', (err) => {
            reject(new Error(`Network error: ${err.message}`));
        });

        if (postData) {
            req.write(postData);
        }

        req.end();
    });
}

/**
 * Open URL in browser
 */
function openBrowser(url) {
    const platform = process.platform;
    let command;

    if (platform === 'darwin') {
        command = `open "${url}"`;
    } else if (platform === 'win32') {
        command = `start "" "${url}"`;
    } else {
        command = `xdg-open "${url}"`;
    }

    exec(command, (error) => {
        if (error) {
            console.error('❌ Failed to open browser automatically');
            console.log('');
            console.log('🔗 Please open this URL manually:');
            console.log(url);
        } else {
            console.log('✅ Browser opened successfully!');
        }
    });
}

/**
 * Main function
 */
async function main() {
    try {
        console.log('📡 Creating Stripe Checkout Session...');

        const response = await makeRequest(
            `${SERVER_URL}/api/stripe/create-checkout-session`,
            'POST',
            {
                amount: AMOUNT,
                renting_id: RENTING_ID
            }
        );

        console.log(`📬 Response Status: ${response.statusCode}`);

        if (response.statusCode !== 200) {
            throw new Error(`HTTP ${response.statusCode}: ${JSON.stringify(response.data)}`);
        }

        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to create checkout session');
        }

        const checkoutUrl = response.data.data.url;
        const sessionId = response.data.data.session_id;

        console.log('✅ Checkout Session created successfully!');
        console.log(`   📋 Session ID: ${sessionId}`);
        console.log('');
        console.log('🔗 Payment URL:');
        console.log(checkoutUrl);
        console.log('');
        console.log('🌐 Opening in browser...');

        // Open browser after short delay
        setTimeout(() => openBrowser(checkoutUrl), 500);

        console.log('');
        console.log('📝 Test Instructions:');
        console.log('   1. Use test card: 4242 4242 4242 4242');
        console.log('   2. Any future expiry date (e.g., 12/34)');
        console.log('   3. Any 3-digit CVC (e.g., 123)');
        console.log('');
        console.log('💡 Tip: Check your webhook logs for payment events');

    } catch (error) {
        console.error('');
        console.error('❌ Error:', error.message);
        console.log('');
        console.log('💡 Troubleshooting:');
        console.log('  1. Ensure your server is running:', SERVER_URL);
        console.log('  2. Check STRIPE_SECRET_KEY in .env.local');
        console.log('  3. Check NEXT_PUBLIC_SERVER_URL in .env.local');
        console.log('  4. Verify API route exists: /api/stripe/create-checkout-session');
        console.log('');
        console.log('🔧 Quick check:');
        console.log(`   curl ${SERVER_URL}/api/stripe/create-checkout-session -X POST -H "Content-Type: application/json" -d '{"amount":${AMOUNT},"renting_id":"${RENTING_ID}"}'`);
        process.exit(1);
    }
}

main();
