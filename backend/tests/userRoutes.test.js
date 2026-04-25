const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('../routes/userRoutes');
const User = require('../models/User');

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

describe('User Routes Integration Tests', () => {
    describe('GET /api/users/leaderboard', () => {
        it('should return a list of users sorted by XP in descending order', async () => {
            await User.create([
                { clerkId: 'user1', email: 'alice@test.com', name: 'Alice', username: 'alice', xp: 50, role: 'user' },
                { clerkId: 'user2', email: 'bob@test.com', name: 'Bob', username: 'bob', xp: 150, role: 'user' },
                { clerkId: 'user3', email: 'charlie@test.com', name: 'Charlie', username: 'charlie', xp: 100, role: 'user' },
                { clerkId: 'admin1', email: 'admin@test.com', name: 'Admin', username: 'admin', xp: 5000, role: 'admin' } // Ensure admins are omitted
            ]);

            const response = await request(app).get('/api/users/leaderboard');

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(3); 
            
            // Verify sorting
            expect(response.body[0].username).toBe('bob');
            expect(response.body[1].username).toBe('charlie');
            expect(response.body[2].username).toBe('alice');
            
            expect(response.body[0]).not.toHaveProperty('_id');
            expect(response.body[0]).toHaveProperty('xp', 150);
        });

        it('should return an empty array if no users exist', async () => {
            const response = await request(app).get('/api/users/leaderboard');
            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        });
    });
});
