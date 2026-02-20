#!/usr/bin/env node
/**
 * VAPID anahtarları ve CRON_SECRET üretir.
 * Çıktıyı Vercel > Settings > Environment Variables'a kopyalayın.
 *
 * Kullanım: node scripts/generate-vapid.js
 * veya:     npm run generate-vapid
 */
const webPush = require('web-push');
const crypto = require('crypto');

const keys = webPush.generateVAPIDKeys();
const cronSecret = crypto.randomBytes(32).toString('hex');

console.log('\n=== Vercel Environment Variables ===\n');
console.log('NEXT_PUBLIC_VAPID_PUBLIC_KEY=' + keys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + keys.privateKey);
console.log('CRON_SECRET=' + cronSecret);
console.log('\nBu 3 degeri Vercel > Proje > Settings > Environment Variables ile ekleyin.');
console.log('Upstash Redis URL/Token icin: https://console.upstash.com\n');
