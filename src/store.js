// Single reactive store: auth, doctors, patients, appointments, toasts — all persisted in localStorage.
//
// Sections: helpers · seed data · state · toasts · auth · appointments · patients · lookups
import { reactive, watch } from 'vue'
export const DEPARTMENTS = [
  'Cardiology',
  'Neurology',
  'Pediatrics',
  'Orthopedics',
  'General Practice',
  'Dermatology',
  'Oncology',
]
export const STATUSES = ['Scheduled', 'Confirmed', 'Completed', 'Cancelled']
export const COUNTRIES = {
  PK: ['Pakistan', '🇵🇰'],
  US: ['USA', '🇺🇸'],
  UK: ['United Kingdom', '🇬🇧'],
  DE: ['Germany', '🇩🇪'],
  IN: ['India', '🇮🇳'],
  AE: ['UAE', '🇦🇪'],
  IT: ['Italy', '🇮🇹'],
  TR: ['Türkiye', '🇹🇷'],
  CA: ['Canada', '🇨🇦'],
  FR: ['France', '🇫🇷'],
}
// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------
/** Read JSON from localStorage (returns `fallback` if missing or broken). */
const loadFromStorage = (key, fallback) => {
  try {
    const value = localStorage.getItem(key)
    return value === null ? fallback : JSON.parse(value)
  } catch {
    return fallback
  }
}
const saveToStorage = (key, value) => localStorage.setItem(key, JSON.stringify(value))

/** Short unique id. */
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)

/** Light obfuscation only (frontend-only demo, NOT real security). */
const encodePassword = (text) => btoa(unescape(encodeURIComponent(text)))

/** Date -> 'YYYY-MM-DD' in local time. */
export const iso = (date = new Date()) => date.toLocaleDateString('en-CA')

/** ISO date for "today + offsetDays" (negative = past). */
const dateFromToday = (offsetDays) => {
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)
  return iso(date)
}

/** Portrait URL. gender: 'f' | 'm', number: 0-99. */
export const pic = (gender, number) =>
  `https://randomuser.me/api/portraits/${gender === 'f' ? 'women' : 'men'}/${number}.jpg`

// ---------------------------------------------------------------------------
// Seed data (used only the first time, before anything is saved in localStorage)
// ---------------------------------------------------------------------------
// Doctor row:  [name, department, country, city, years of experience, fee, gender, photo no.]
const seedDoctors = () =>
  [
    ['Ayesha Siddiqui', 'Cardiology', 'PK', 'Karachi', 14, 35, 'f', 44],
    ['Michael Chen', 'Cardiology', 'US', 'Boston', 18, 150, 'm', 32],
    ['Tariq Mehmood', 'Cardiology', 'PK', 'Lahore', 12, 30, 'm', 18],
    ['Hamza Qureshi', 'Neurology', 'PK', 'Lahore', 21, 40, 'm', 52],
    ['Elena Rossi', 'Neurology', 'IT', 'Milan', 16, 120, 'f', 65],
    ['Rahul Verma', 'Neurology', 'IN', 'Delhi', 13, 45, 'm', 45],
    ['Fatima Noor', 'Pediatrics', 'PK', 'Islamabad', 12, 28, 'f', 12],
    ['Sarah Thompson', 'Pediatrics', 'UK', 'London', 15, 110, 'f', 28],
    ['Ali Raza', 'Pediatrics', 'PK', 'Lahore', 9, 25, 'm', 61],
    ['Imran Sheikh', 'Orthopedics', 'PK', 'Lahore', 19, 35, 'm', 55],
    ['Lars Becker', 'Orthopedics', 'DE', 'Berlin', 22, 140, 'm', 71],
    ['Nadia Anwar', 'Orthopedics', 'PK', 'Karachi', 11, 30, 'f', 33],
    ['Sana Rauf', 'General Practice', 'PK', 'Lahore', 8, 20, 'f', 8],
    ['Priya Sharma', 'General Practice', 'IN', 'Mumbai', 10, 35, 'f', 17],
    ['David Miller', 'General Practice', 'CA', 'Toronto', 20, 90, 'm', 22],
    ['Kamran Akbar', 'Dermatology', 'PK', 'Islamabad', 13, 32, 'm', 36],
    ['Omar Al-Farsi', 'Dermatology', 'AE', 'Dubai', 17, 100, 'm', 50],
    ['Emma Wilson', 'Dermatology', 'UK', 'Manchester', 9, 95, 'f', 48],
    ['Mariam Tariq', 'Oncology', 'PK', 'Karachi', 16, 45, 'f', 19],
    ['James Carter', 'Oncology', 'US', 'Houston', 24, 180, 'm', 77],
    ['Yusuf Demir', 'Oncology', 'TR', 'Istanbul', 18, 85, 'm', 84],
  ].map(([name, department, cc, city, experience, fee, gender, photoNo], i) => ({
    id: 'd' + (i + 1),
    name: 'Dr. ' + name,
    department,
    cc,
    city,
    experience,
    fee,
    rating: (4.5 + ((i * 7) % 5) / 10).toFixed(1),
    photo: pic(gender, photoNo),
    available: i % 7 !== 5, // a few doctors are marked unavailable for the demo
    bio: `${experience} years of experience in ${department.toLowerCase()}, practising in ${city}.`,
  }))

// Patient row: [name, phone, age, gender, city, country, blood group, photo no.]
const seedPatients = () =>
  [
    ['Ahmed Raza', '+92 300 1234567', 34, 'm', 'Lahore', 'PK', 'B+', 3],
    ['Zara Khan', '+92 321 7654321', 27, 'f', 'Karachi', 'PK', 'O+', 5],
    ['Bilal Hussain', '+92 333 4567890', 45, 'm', 'Islamabad', 'PK', 'A+', 14],
    ['Hina Malik', '+92 345 9876543', 31, 'f', 'Lahore', 'PK', 'AB+', 9],
    ['Usman Tariq', '+92 301 5558899', 52, 'm', 'Faisalabad', 'PK', 'O-', 26],
    ['Maryam Aslam', '+92 312 2223344', 8, 'f', 'Lahore', 'PK', 'A+', 21],
    ['Hassan Javed', '+92 322 6677889', 63, 'm', 'Multan', 'PK', 'B-', 41],
    ['Ayesha Farooq', '+92 331 1122334', 39, 'f', 'Karachi', 'PK', 'O+', 29],
    ['Liam Johnson', '+1 617 555 0148', 41, 'm', 'Boston', 'US', 'A-', 12],
    ['Olivia Brown', '+44 20 7946 0958', 29, 'f', 'London', 'UK', 'B+', 23],
    ['Noah Schmidt', '+49 30 901820', 56, 'm', 'Berlin', 'DE', 'O+', 37],
    ['Emma Davis', '+1 416 555 0199', 35, 'f', 'Toronto', 'CA', 'AB-', 40],
    ['Arjun Mehta', '+91 98765 43210', 48, 'm', 'Mumbai', 'IN', 'B+', 60],
    ['Fatima Al-Zahra', '+971 50 123 4567', 33, 'f', 'Dubai', 'AE', 'A+', 51],
    ['Lucas Martin', '+33 1 23 45 67 89', 22, 'm', 'Paris', 'FR', 'O+', 66],
    ['Sophie Turner', '+44 161 555 0123', 44, 'f', 'Manchester', 'UK', 'A+', 35],
  ].map(([name, phone, age, gender, city, cc, blood, photoNo], i) => ({
    id: 'p' + (i + 1),
    name,
    email: name.toLowerCase().replace(/[^a-z]+/g, '.') + '@mail.com',
    phone,
    age,
    gender: gender === 'f' ? 'Female' : 'Male',
    city,
    cc,
    blood,
    photo: pic(gender, photoNo),
  }))

const REASONS = {
  Cardiology: ['Chest pain check', 'Blood pressure review', 'ECG follow-up'],
  Neurology: ['Recurring migraines', 'Numbness in hands', 'Sleep disturbance'],
  Pediatrics: ['Vaccination follow-up', 'Growth assessment', 'Fever and cough'],
  Orthopedics: ['Knee pain', 'Back pain consultation', 'Post-surgery review'],
  'General Practice': ['Persistent cough', 'Annual check-up', 'Fatigue and weakness'],
  Dermatology: ['Skin rash', 'Acne treatment', 'Allergy test'],
  Oncology: ['Screening consultation', 'Treatment follow-up', 'Second opinion'],
}
/** Builds ~40 sample appointments around today so every dashboard widget has data. */
const seedAppointments = (doctors, patients) => {
  // Tiny seeded random generator -> the demo data looks the same on every first load.
  let seed = 11
  const random = () => (seed = (seed * 9301 + 49297) % 233280) / 233280
  const pick = (list) => list[Math.floor(random() * list.length)]

  // Days relative to today (-13 = 13 days ago, 0 = today, 10 = in 10 days).
  const dayOffsets = [
    -13, -12, -11, -10, -9, -9, -8, -7, -6, -6, -5, -4, -4, -3, -3, -2, -2, -1, -1, -1, 0, 0, 0, 0,
    0, 0, 1, 1, 2, 2, 3, 3, 4, 5, 5, 6, 7, 8, 9, 10,
  ]
  const times = [
    '08:30',
    '09:00',
    '09:45',
    '10:15',
    '11:00',
    '11:30',
    '13:00',
    '14:30',
    '15:15',
    '16:00',
  ]
  const todayStatuses = [
    'Confirmed',
    'Scheduled',
    'Completed',
    'Confirmed',
    'Scheduled',
    'Confirmed',
  ]
  let todayCount = 0

  /** Past -> mostly Completed. Today -> a fixed mix. Future -> Confirmed or Scheduled. */
  const statusFor = (offset) => {
    if (offset < 0) return random() < 0.82 ? 'Completed' : 'Cancelled'
    if (offset === 0) return todayStatuses[todayCount++ % todayStatuses.length]
    return random() < 0.5 ? 'Confirmed' : 'Scheduled'
  }

  return dayOffsets.map((offset, i) => {
    const patient = patients[i % patients.length]
    const doctor = pick(doctors)
    const status = statusFor(offset)
    return {
      id: uid() + i,
      patientName: patient.name,
      patientEmail: patient.email,
      doctor: doctor.name,
      department: doctor.department,
      date: dateFromToday(offset),
      time: pick(times),
      reason: REASONS[doctor.department][i % 3],
      status,
    }
  })
}

// ---------------------------------------------------------------------------
// Reactive state (persisted in localStorage)
// ---------------------------------------------------------------------------
const doctors = loadFromStorage('hms2_doctors', null) || seedDoctors()
const patients = loadFromStorage('hms2_patients', null) || seedPatients()

export const state = reactive({
  users: loadFromStorage('users', []),
  isLoggedIn: loadFromStorage('isLoggedIn', false),
  currentUser: loadFromStorage('currentUser', null),
  doctors,
  patients,
  appointments: loadFromStorage('hms2_appts', null) || seedAppointments(doctors, patients),
  toasts: [],
})

// Save the lists now, and again whenever they change.
const PERSISTED_LISTS = [
  ['doctors', 'hms2_doctors'],
  ['patients', 'hms2_patients'],
  ['appointments', 'hms2_appts'],
]
PERSISTED_LISTS.forEach(([stateKey, storageKey]) => {
  saveToStorage(storageKey, state[stateKey])
  watch(
    () => state[stateKey],
    (value) => saveToStorage(storageKey, value),
    { deep: true }
  )
})

// ---------------------------------------------------------------------------
// Toasts
// ---------------------------------------------------------------------------
export function toast(message, type = 'success') {
  const id = uid()
  state.toasts.push({ id, message, type })
  setTimeout(() => (state.toasts = state.toasts.filter((t) => t.id !== id)), 3500) // auto-dismiss
}
// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export function signup({ name, email, password }) {
  const cleanEmail = email.trim().toLowerCase()
  if (state.users.some((user) => user.email === cleanEmail))
    return { ok: false, error: 'An account with this email already exists.' }
  state.users.push({
    id: uid(),
    name: name.trim(),
    email: cleanEmail,
    password: encodePassword(password),
  })
  saveToStorage('users', state.users)
  return { ok: true }
}

export function login(email, password) {
  const cleanEmail = email.trim().toLowerCase()
  const user = state.users.find(
    (u) => u.email === cleanEmail && u.password === encodePassword(password)
  )
  if (!user) return { ok: false, error: 'Incorrect email or password. Check both and try again.' }
  state.currentUser = { id: user.id, name: user.name, email: user.email }
  state.isLoggedIn = true
  saveToStorage('currentUser', state.currentUser)
  saveToStorage('isLoggedIn', true)
  return { ok: true }
}

export function logout() {
  state.isLoggedIn = false
  state.currentUser = null
  saveToStorage('isLoggedIn', false)
  localStorage.removeItem('currentUser')
}

// ---------------------------------------------------------------------------
// Appointments
// ---------------------------------------------------------------------------
export const addAppointment = (data) => {
  const appointment = { ...data, id: uid() }
  state.appointments.unshift(appointment)
  return appointment
}
export const updateAppointment = (id, changes) => {
  const appointment = state.appointments.find((a) => a.id === id)
  if (appointment) Object.assign(appointment, changes)
}
export const removeAppointment = (id) => {
  state.appointments = state.appointments.filter((a) => a.id !== id)
}
export const getAppointment = (id) => state.appointments.find((a) => a.id === id)

// ---------------------------------------------------------------------------
// Patients
// ---------------------------------------------------------------------------
export const addPatient = (data) =>
  state.patients.unshift({
    ...data,
    id: uid(),
    photo: pic(data.gender === 'Female' ? 'f' : 'm', Math.floor(Math.random() * 90)),
  })
export const updatePatient = (id, changes) => {
  const patient = state.patients.find((p) => p.id === id)
  if (patient) Object.assign(patient, changes)
}
export const removePatient = (id) => {
  state.patients = state.patients.filter((p) => p.id !== id)
}

// ---------------------------------------------------------------------------
// Lookups & formatting
// ---------------------------------------------------------------------------
export const doctorByName = (name) => state.doctors.find((d) => d.name === name)
export const patientByName = (name) => state.patients.find((p) => p.name === name)
export const photoOf = (name) => (doctorByName(name) || patientByName(name))?.photo

/** '2026-10-08' -> 'Thu, 8 Oct 2026' */
export const fmtDate = (date) =>
  new Date(date + 'T00:00').toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

/** '14:30' -> '2:30 PM' */
export const fmtTime = (time) => {
  const [hours, minutes] = time.split(':')
  return `${+hours % 12 || 12}:${minutes} ${+hours >= 12 ? 'PM' : 'AM'}`
}

/** Messages shown in the dashboard's "Alerts & Notifications" card. */
export function getAlerts() {
  const today = iso()
  const count = (predicate) => state.appointments.filter(predicate).length
  const unavailableDoctors = state.doctors.filter((d) => !d.available).length
  return [
    `${count((a) => a.status === 'Scheduled')} appointments pending confirmation`,
    `${count((a) => a.date === today && a.status !== 'Cancelled')} appointments on today’s schedule`,
    `${unavailableDoctors} doctor(s) currently unavailable`,
    `${count((a) => a.status === 'Cancelled')} cancelled appointments to review`,
  ]
}
