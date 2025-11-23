#!/usr/bin/env node

/**
 * Database Seeding Script for BMSIT Attendance System
 * Run this once to initialize collections and test data
 * 
 * Usage: node scripts/seed.js
 */

import { MongoClient } from 'mongodb'
import crypto from 'crypto'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://user:pass@cluster.mongodb.net/bmsit_attendance?retryWrites=true&w=majority'

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    const db = client.db('bmsit_attendance')
    
    console.log('🌱 Starting database seeding...\n')
    
    // 1. Create Collections
    console.log('📋 Creating collections...')
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map(c => c.name)
    
    if (!collectionNames.includes('students')) {
      await db.createCollection('students')
      console.log('  ✓ Created students collection')
    }
    if (!collectionNames.includes('staff')) {
      await db.createCollection('staff')
      console.log('  ✓ Created staff collection')
    }
    if (!collectionNames.includes('events')) {
      await db.createCollection('events')
      console.log('  ✓ Created events collection')
    }
    if (!collectionNames.includes('attendance')) {
      await db.createCollection('attendance')
      console.log('  ✓ Created attendance collection')
    }
    
    // 2. Create Indexes
    console.log('\n🔍 Creating indexes...')
    await db.collection('students').createIndex({ email: 1 }, { unique: true })
    console.log('  ✓ students.email')
    
    await db.collection('staff').createIndex({ email: 1 }, { unique: true })
    console.log('  ✓ staff.email')
    
    await db.collection('events').createIndex({ eventId: 1 }, { unique: true })
    console.log('  ✓ events.eventId')
    
    await db.collection('events').createIndex({ secretCode: 1 }, { sparse: true })
    console.log('  ✓ events.secretCode')
    
    await db.collection('attendance').createIndex(
      { eventId: 1, studentEmail: 1 },
      { unique: true }
    )
    console.log('  ✓ attendance (eventId + studentEmail)')
    
    // 3. Seed Test Data
    console.log('\n👥 Seeding test data...')
    
    const passwordHash = crypto.createHash('sha256').update('password').digest('hex')
    
    // Staff/Teachers
    const staff = [
      {
        email: 'teacher@bmsit.in',
        name: 'Dr. Smith',
        role: 'TEACHER',
        passwordHash,
        createdAt: new Date()
      },
      {
        email: 'admin@bmsit.in',
        name: 'Admin User',
        role: 'ADMIN',
        passwordHash,
        createdAt: new Date()
      },
      {
        email: 'coordinator@bmsit.in',
        name: 'Event Coordinator',
        role: 'STAFF',
        passwordHash,
        createdAt: new Date()
      }
    ]
    
    for (const member of staff) {
      try {
        await db.collection('staff').insertOne(member)
        console.log(`  ✓ Created ${member.role}: ${member.email}`)
      } catch (e) {
        if (e.code === 11000) {
          console.log(`  ℹ ${member.email} already exists`)
        }
      }
    }
    
    // Students
    const students = [
      {
        email: '1BY23AI001@bmsit.in',
        name: 'Rajesh Kumar',
        usn: '1BY23AI001',
        branch: 'AI',
        year: '1',
        deviceId: null,
        profileComplete: true,
        createdAt: new Date()
      },
      {
        email: '2BY22CS045@bmsit.in',
        name: 'Priya Singh',
        usn: '2BY22CS045',
        branch: 'CSE',
        year: '2',
        deviceId: null,
        profileComplete: true,
        createdAt: new Date()
      },
      {
        email: '3BY21ECE089@bmsit.in',
        name: 'Arun Kumar',
        usn: '3BY21ECE089',
        branch: 'ECE',
        year: '3',
        deviceId: null,
        profileComplete: true,
        createdAt: new Date()
      }
    ]
    
    for (const student of students) {
      try {
        await db.collection('students').insertOne(student)
        console.log(`  ✓ Created student: ${student.email}`)
      } catch (e) {
        if (e.code === 11000) {
          console.log(`  ℹ ${student.email} already exists`)
        }
      }
    }
    
    // Sample Events
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    const events = [
      {
        eventId: 'EVT-AI2024',
        title: 'Introduction to AI at Scale',
        description: 'Learn about modern AI systems and scalable architectures',
        startTime: tomorrow,
        endTime: new Date(tomorrow.getTime() + 3 * 60 * 60 * 1000),
        location: 'Seminar Hall A',
        locationLat: 13.1234,
        locationLng: 77.5678,
        radiusMeters: 200,
        secretCode: 'AI-2024',
        secretCodeEnabled: true,
        qrModeEnabled: true,
        codeValidFrom: tomorrow,
        codeValidTill: new Date(tomorrow.getTime() + 30 * 60 * 1000),
        createdBy: 'teacher@bmsit.in',
        createdAt: now,
        type: 'Workshop'
      },
      {
        eventId: 'EVT-WEB101',
        title: 'Web Development Bootcamp',
        description: 'Full-stack web development with React and Node.js',
        startTime: nextWeek,
        endTime: new Date(nextWeek.getTime() + 4 * 60 * 60 * 1000),
        location: 'Computer Lab 3',
        locationLat: 13.1240,
        locationLng: 77.5680,
        radiusMeters: 150,
        secretCode: 'WEB-101',
        secretCodeEnabled: true,
        qrModeEnabled: false,
        codeValidFrom: nextWeek,
        codeValidTill: new Date(nextWeek.getTime() + 45 * 60 * 1000),
        createdBy: 'teacher@bmsit.in',
        createdAt: now,
        type: 'Course'
      }
    ]
    
    for (const event of events) {
      try {
        await db.collection('events').insertOne(event)
        console.log(`  ✓ Created event: ${event.eventId} (${event.title})`)
      } catch (e) {
        if (e.code === 11000) {
          console.log(`  ℹ ${event.eventId} already exists`)
        }
      }
    }
    
    console.log('\n✅ Database seeding complete!\n')
    console.log('📝 Test Credentials:')
    console.log('  Teacher: teacher@bmsit.in / password')
    console.log('  Admin: admin@bmsit.in / password')
    console.log('  Student: 1BY23AI001@bmsit.in (no password, use email login)\n')
    console.log('🗺️  Event Location for GPS testing:')
    console.log('  Latitude: 13.1234, Longitude: 77.5678 (Event: EVT-AI2024)\n')
    
  } catch (err) {
    console.error('❌ Error during seeding:', err)
    process.exit(1)
  } finally {
    await client.close()
  }
}

// Run the seeding function
seedDatabase().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})

seedDatabase()
