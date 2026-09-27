// test_natlas_ui_integration.js
// Verification suite for Phase 4 N-ATLAS UI Integration

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

async function runUITests() {
  console.log('=== TEST 1: Session Creation UI Form Verification (session-new.html) ===');
  const sessionHtml = fs.readFileSync(path.join(process.cwd(), 'public', 'session-new.html'), 'utf8');

  const requiredTokens = [
    '🇳🇬 Nigerian Languages (N-ATLAS ASR)',
    'value="yo-NG"',
    'value="ha-NG"',
    'value="ig-NG"',
    'value="en-NG"',
    'NAIC Keynote: Voice-First Multilingual Inclusion in Nigeria'
  ];

  for (const token of requiredTokens) {
    const found = sessionHtml.includes(token);
    console.log(` - Checking "${token}": ${found ? 'FOUND' : 'MISSING'}`);
    if (!found) {
      throw new Error(`Required token missing from session-new.html: ${token}`);
    }
  }

  console.log('\n=== TEST 2: Host Console UI Elements Verification (host-console.html) ===');
  const consoleHtml = fs.readFileSync(path.join(process.cwd(), 'public', 'host-console.html'), 'utf8');
  const consoleTokens = [
    'id="natlasEngineBadge"',
    'N-ATLAS ASR ACTIVE'
  ];

  for (const token of consoleTokens) {
    const found = consoleHtml.includes(token);
    console.log(` - Checking "${token}": ${found ? 'FOUND' : 'MISSING'}`);
    if (!found) {
      throw new Error(`Required token missing from host-console.html: ${token}`);
    }
  }

  console.log('\n=== TEST 3: Host Console Client Logic (host-console.js) ===');
  const consoleJs = fs.readFileSync(path.join(process.cwd(), 'public', 'js', 'host-console.js'), 'utf8');
  const jsTokens = [
    "natlasLangs = ['yo-NG', 'ha-NG', 'ig-NG', 'en-NG']",
    "natlasBadge.style.display = 'inline-flex'",
    "sttStatusBadge.textContent = 'N-ATLAS ASR Active'"
  ];

  for (const token of jsTokens) {
    const found = consoleJs.includes(token);
    console.log(` - Checking "${token}": ${found ? 'FOUND' : 'MISSING'}`);
    if (!found) {
      throw new Error(`Required logic token missing from host-console.js: ${token}`);
    }
  }

  console.log('\n=== TEST 4: Dynamic Session Creation API with N-ATLAS Source Language ===');
  const serverProcess = spawn('node', ['server.js'], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: '3006' },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let online = false;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch('http://localhost:3006/api/sessions/NAIC-VOICE');
      if (res.ok) {
        online = true;
        break;
      }
    } catch (e) {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  if (!online) {
    serverProcess.kill();
    throw new Error('Test server failed to start on port 3006');
  }

  try {
    const createRes = await fetch('http://localhost:3006/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'NAIC Voice Showcase Session',
        template: 'Conference',
        hostName: 'Test Presenter',
        sourceLanguage: 'yo-NG',
        customRoomId: 'NAIC-TEST-01'
      })
    });

    const createData = await createRes.json();
    console.log('Session Created API Response:', createData.success, '| Room:', createData.session?.roomId);

    if (!createData.success || createData.session?.sourceLanguage?.code !== 'yo-NG') {
      throw new Error('Failed to create session with yo-NG source language');
    }

    const getRes = await fetch('http://localhost:3006/api/sessions/NAIC-TEST-01');
    const getData = await getRes.json();
    console.log('GET Session API Response:', getData.success, '| Source Lang:', getData.session?.sourceLanguage?.code);

    if (getData.session?.sourceLanguage?.code !== 'yo-NG') {
      throw new Error('Retrieved session does not match expected sourceLanguage yo-NG');
    }

    console.log('\n>>> ALL PHASE 4 UI INTEGRATION TESTS PASSED! <<<');
  } finally {
    serverProcess.kill('SIGINT');
  }
}

runUITests().catch(err => {
  console.error('UI Test Failed:', err);
  process.exit(1);
});
