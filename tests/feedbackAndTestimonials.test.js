process.env.NODE_ENV = 'test';
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { app } from '../server/index.js';

let server;
let baseUrl;
let adminToken = '';

describe('Community Feedback & Testimonials Feature Suite', () => {
  before(async () => {
    await new Promise((resolve) => {
      server = http.createServer(app).listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });

    // Obtain Admin Token for testing governance
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login: 'saumypandey745@gmail.com',
        password: 'Saumy_2026!'
      })
    });
    const data = await res.json();
    adminToken = data.token;
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it('GET /api/feedback/featured returns active featured testimonials with initials and ratings', async () => {
    const res = await fetch(`${baseUrl}/api/feedback/featured`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.testimonials));
    assert.ok(data.testimonials.length >= 3, 'Should have at least the 3 curated testimonials');

    // Verify Ananya Rao is present with 5 stars
    const ananya = data.testimonials.find((t) => t.name === 'Ananya Rao');
    assert.ok(ananya, 'Ananya Rao testimonial must be in featured list');
    assert.equal(ananya.rating, 5);
    assert.equal(ananya.initials, 'AR');
    assert.ok(ananya.message.includes('curly braces and arrow function'));
    assert.ok(ananya.display_role.includes('FinTech'));

    // Verify Marcus Schmidt
    const marcus = data.testimonials.find((t) => t.name === 'Marcus Schmidt');
    assert.ok(marcus, 'Marcus Schmidt testimonial must be in featured list');
    assert.equal(marcus.rating, 5);
    assert.equal(marcus.initials, 'MS');
    assert.ok(marcus.message.includes('Cherry MX Blue'));

    // Verify Devon Park
    const devon = data.testimonials.find((t) => t.name === 'Devon Park');
    assert.ok(devon, 'Devon Park testimonial must be in featured list');
    assert.equal(devon.rating, 5);
    assert.equal(devon.initials, 'DP');
    assert.ok(devon.message.includes('cryptographic certificates'));
  });

  it('POST /api/feedback accepts real feedback with 5-star rating and professional title', async () => {
    const res = await fetch(`${baseUrl}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Karan Mehra',
        email: 'karan.m@techdev.org',
        category: 'feedback',
        subject: 'Incredible audio synthesis',
        message: 'The zero-latency audio engine and dark mode make my morning drills delightful.',
        rating: 5,
        display_role: 'Lead Cloud Architect'
      })
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.id, 'New feedback ID should be returned');
  });

  it('Admin can view feedback list and counts including featured testimonials', async () => {
    const res = await fetch(`${baseUrl}/api/admin/feedback`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data.feedback));
    assert.ok(data.counts);
    assert.ok(data.counts.featured >= 3, 'Featured count should be >= 3');
  });

  it('Admin can toggle is_featured on a user review to feature or unfeature it', async () => {
    // 1. Submit a fresh review
    const submitRes = await fetch(`${baseUrl}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Elena Rostova',
        email: 'elena.rostova@systems.net',
        category: 'feedback',
        subject: 'Helped me pass my Google interview',
        message: 'The C++ pointer and reference drills completely fixed my interview typing stutter.',
        rating: 5,
        display_role: 'Staff Systems Engineer'
      })
    });
    const { id } = await submitRes.json();

    // 2. Toggle to featured
    const toggleRes1 = await fetch(`${baseUrl}/api/admin/feedback/${id}/toggle-featured`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.equal(toggleRes1.status, 200);
    const toggleData1 = await toggleRes1.json();
    assert.equal(toggleData1.success, true);
    assert.equal(toggleData1.is_featured, 1);

    // 3. Verify it is now returned in public /api/feedback/featured
    const publicRes = await fetch(`${baseUrl}/api/feedback/featured`);
    const publicData = await publicRes.json();
    const elena = publicData.testimonials.find((t) => t.name === 'Elena Rostova');
    assert.ok(elena, 'Elena Rostova should now be featured on the public website');
    assert.equal(elena.display_role, 'Staff Systems Engineer');
    assert.equal(elena.rating, 5);

    // 4. Toggle back off
    const toggleRes2 = await fetch(`${baseUrl}/api/admin/feedback/${id}/toggle-featured`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const toggleData2 = await toggleRes2.json();
    assert.equal(toggleData2.is_featured, 0);

    // 5. Verify it is removed from public endpoint
    const publicRes2 = await fetch(`${baseUrl}/api/feedback/featured`);
    const publicData2 = await publicRes2.json();
    const elenaAfter = publicData2.testimonials.find((t) => t.name === 'Elena Rostova');
    assert.equal(elenaAfter, undefined, 'Elena should no longer appear in public featured list');
  });

  it('Admin can edit rating, title role, and quote details via PUT /api/admin/feedback/:id', async () => {
    // Submit review
    const submitRes = await fetch(`${baseUrl}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jordan Bell',
        email: 'jordan@dev.io',
        category: 'feedback',
        subject: 'Great tool',
        message: 'Original draft message',
        rating: 4,
        display_role: 'Junior Dev'
      })
    });
    const { id } = await submitRes.json();

    // Admin updates rating to 5, edits role, and polishes quote
    const updateRes = await fetch(`${baseUrl}/api/admin/feedback/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        rating: 5,
        display_role: 'Full Stack Engineer @ FinTech',
        message: 'Polished review quote with higher detail and accuracy.',
        is_featured: 1
      })
    });
    assert.equal(updateRes.status, 200);
    const updateData = await updateRes.json();
    assert.equal(updateData.success, true);
    assert.equal(updateData.feedback.rating, 5);
    assert.equal(updateData.feedback.display_role, 'Full Stack Engineer @ FinTech');
    assert.equal(updateData.feedback.is_featured, 1);
  });

  it('Admin can manually create and publish a new testimonial via POST /api/admin/feedback', async () => {
    const res = await fetch(`${baseUrl}/api/admin/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Nadia Chen',
        email: 'nadia.chen@crypto.org',
        display_role: 'Senior Rust Security Researcher',
        rating: 5,
        message: 'CodeTyper is the only typing app that understands real engineering muscle memory.',
        is_featured: 1
      })
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.id);

    // Verify it appears in public featured testimonials immediately
    const publicRes = await fetch(`${baseUrl}/api/feedback/featured`);
    const publicData = await publicRes.json();
    const nadia = publicData.testimonials.find((t) => t.name === 'Nadia Chen');
    assert.ok(nadia, 'Nadia Chen must appear in featured testimonials');
    assert.equal(nadia.rating, 5);
    assert.equal(nadia.display_role, 'Senior Rust Security Researcher');
  });
});
