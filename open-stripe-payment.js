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
const RENTING_ID = process.argv[3] || `quick_test_${Date.now()}`;

console.log('🚀 Opening Stripe Payment Page...');
console.log('================================');
console.log(`Amount: ${AMOUNT} THB`);
console.log(`Renting ID: ${RENTING_ID}`);
console.log('');

/**
 * Make HTTP request
 */
function makeRequest(url, method, data) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const protocol = urlObj.protocol === 'https:' ? https : http;

        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

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

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
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

        if (response.statusCode !== 200) {
            throw new Error(`HTTP ${response.statusCode}: ${JSON.stringify(response.data)}`);
        }

        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to create checkout session');
        }

        const checkoutUrl = response.data.data.url;
        const sessionId = response.data.data.session_id;

        console.log('✅ Checkout Session created!');
        console.log(`   Session ID: ${sessionId}`);
        console.log('');
        console.log('🔗 Payment URL:');
        console.log(checkoutUrl);
        console.log('');
        console.log('🌐 Opening in browser...');

        // Open browser
        setTimeout(() => openBrowser(checkoutUrl), 500);

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('');
        console.log('💡 Make sure:');
        console.log('  1. Your server is running on', SERVER_URL);
        console.log('  2. Stripe API keys are configured');
        console.log('  3. NEXT_PUBLIC_SERVER_URL is set correctly');
        process.exit(1);
    }
}

main();
