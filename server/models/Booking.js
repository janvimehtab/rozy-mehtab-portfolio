const mongoose = require('mongoose');
const { getIsConnected } = require('../config/db');

// Official Mongoose Schema
const bookingSchema = new mongoose.Schema({
  studentName: { type: String, required: true, trim: true },
  collegeName: { type: String, required: true, trim: true },
  universityName: { type: String, required: true, trim: true },
  academicYear: { type: String, trim: true, default: '' },
  year: { type: String, trim: true, default: '' },
  studentEmail: { 
    type: String, 
    required: true, 
    lowercase: true, 
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email address']
  },
  studentPhone: { type: String, trim: true, default: '' },
  purpose: { 
    type: String, 
    enum: ['Career Advice', 'Internship Guidance', 'General Academic Query'], 
    required: true 
  },
  shortDescription: { type: String, maxlength: 500, trim: true },
  referralSource: { type: String, default: 'Direct Website' },
  
  // Timing Logic (UTC ISO 8601)
  slotStart: { type: Date, required: true },
  slotEnd: { type: Date, required: true },
  
  // Workflow States
  status: { 
    type: String, 
    enum: ['PENDING', 'CONFIRMED', 'DECLINED', 'EXPIRED'], 
    default: 'PENDING' 
  },
  
  // Security Tokens
  confirmationToken: { type: String, required: true, unique: true },
  tokenExpiresAt: { type: Date, required: true },
  googleCalendarEventId: { type: String, default: null },
  meetLink: { type: String, default: null },
  meetUrl: { type: String, default: null }
}, { timestamps: true });

// Compound Index to rapidly block double-booking attempts
bookingSchema.index({ slotStart: 1, status: 1 });

const MongooseBookingModel = mongoose.model('Booking', bookingSchema);

// In-Memory Fallback Collection (Used when Atlas / local MongoDB is not yet running)
const inMemoryStore = new Map();

class InMemoryBookingDocument {
  constructor(data) {
    this._id = data._id || new mongoose.Types.ObjectId().toString();
    this.studentName = data.studentName;
    this.collegeName = data.collegeName;
    this.universityName = data.universityName;
    this.academicYear = data.academicYear || data.year || '';
    this.year = data.year || data.academicYear || '';
    this.studentEmail = data.studentEmail;
    this.studentPhone = data.studentPhone || data.phone || '';
    this.purpose = data.purpose;
    this.shortDescription = data.shortDescription || '';
    this.referralSource = data.referralSource || 'Direct Website';
    this.slotStart = data.slotStart instanceof Date ? data.slotStart : new Date(data.slotStart);
    this.slotEnd = data.slotEnd instanceof Date ? data.slotEnd : new Date(data.slotEnd);
    this.status = data.status || 'PENDING';
    this.confirmationToken = data.confirmationToken;
    this.tokenExpiresAt = data.tokenExpiresAt instanceof Date ? data.tokenExpiresAt : new Date(data.tokenExpiresAt);
    this.googleCalendarEventId = data.googleCalendarEventId || null;
    this.meetLink = data.meetLink || data.meetUrl || null;
    this.meetUrl = data.meetUrl || data.meetLink || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  async save() {
    this.updatedAt = new Date();
    inMemoryStore.set(this._id.toString(), this);
    return this;
  }
}

// Chainable query helper for in-memory operations
class InMemoryQuery {
  constructor(results) {
    this.results = results;
  }

  select(fields) {
    // Return self to support chaining .select()
    return this;
  }

  sort(sortObj) {
    if (sortObj?.slotStart === -1) {
      this.results.sort((a, b) => new Date(b.slotStart).getTime() - new Date(a.slotStart).getTime());
    }
    return this;
  }

  then(resolve, reject) {
    return Promise.resolve(this.results).then(resolve, reject);
  }
}

// Hybrid Adapter exposing identical Mongoose API
class BookingAdapter {
  constructor(data) {
    if (getIsConnected()) {
      return new MongooseBookingModel(data);
    }
    return new InMemoryBookingDocument(data);
  }

  static async findOne(filter = {}) {
    if (getIsConnected()) {
      return await MongooseBookingModel.findOne(filter);
    }

    const all = Array.from(inMemoryStore.values());
    for (const item of all) {
      let matches = true;

      if (filter.slotStart) {
        const targetTime = new Date(filter.slotStart).getTime();
        const itemTime = new Date(item.slotStart).getTime();
        if (targetTime !== itemTime) matches = false;
      }

      if (filter.status && filter.status.$in) {
        if (!filter.status.$in.includes(item.status)) matches = false;
      } else if (filter.status && typeof filter.status === 'string') {
        if (item.status !== filter.status) matches = false;
      }

      if (matches) return item;
    }
    return null;
  }

  static find(filter = {}) {
    if (getIsConnected()) {
      return MongooseBookingModel.find(filter);
    }

    let items = Array.from(inMemoryStore.values());

    if (filter.slotStart && (filter.slotStart.$gte || filter.slotStart.$lte)) {
      items = items.filter(item => {
        const itemTime = new Date(item.slotStart).getTime();
        if (filter.slotStart.$gte && itemTime < new Date(filter.slotStart.$gte).getTime()) return false;
        if (filter.slotStart.$lte && itemTime > new Date(filter.slotStart.$lte).getTime()) return false;
        return true;
      });
    }

    if (filter.status) {
      if (filter.status.$in) {
        items = items.filter(item => filter.status.$in.includes(item.status));
      } else if (typeof filter.status === 'string') {
        items = items.filter(item => item.status === filter.status);
      }
    }

    return new InMemoryQuery(items);
  }

  static async findById(id) {
    if (getIsConnected()) {
      return await MongooseBookingModel.findById(id);
    }
    return inMemoryStore.get(id?.toString()) || null;
  }

  static async updateMany(filter = {}, update = {}) {
    if (getIsConnected()) {
      return await MongooseBookingModel.updateMany(filter, update);
    }

    let modifiedCount = 0;
    const all = Array.from(inMemoryStore.values());
    for (const item of all) {
      let matches = true;
      if (filter.status && item.status !== filter.status) matches = false;
      if (filter.createdAt?.$lt && item.createdAt >= filter.createdAt.$lt) matches = false;

      if (matches) {
        if (update.$set) {
          Object.assign(item, update.$set);
        }
        modifiedCount++;
      }
    }
    return { modifiedCount };
  }

  static index(fields) {
    return MongooseBookingModel.index(fields);
  }
}

module.exports = BookingAdapter;
