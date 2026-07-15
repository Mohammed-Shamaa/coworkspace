export interface Tenant {
  id: number
  name: string
  subdomain: string
  logoUrl: string
  primaryColor: string
  companyName: string
  hasMeetingRoom?: boolean
  status?: 'Pending' | 'Approved' | 'Rejected'
  paymentStatus?: 'Trial' | 'Active' | 'Expired' | 'Suspended'
  isLocked?: boolean
  trialStartDate?: string | null
  subscriptionExpiryDate?: string | null
}

export interface AdminTenant {
  id: number
  name: string
  companyName: string
  subdomain: string
  whatsappNumber: string
  address: string
  totalDesks: number | null
  maxCapacity: number | null
  hasMeetingRoom: boolean
  openingTime: string | null
  closingTime: string | null
  createdAt: string
  adminEmail: string | null
  adminName: string | null
  status?: string
  paymentStatus?: string
  trialStartDate?: string | null
  subscriptionExpiryDate?: string | null
  approvalDate?: string | null
  memberCount?: number
  isLocked?: boolean
}

export interface AdminStats {
  totalTenants: number
  pendingTenants: number
  approvedTenants: number
  rejectedTenants: number
  activeSubscriptions: number
  trialTenants: number
  totalMembers: number
}

export interface User {
  id: number
  email: string
  fullName: string
  role: string
}

export interface AuthResponse {
  token: string
  refreshToken: string
  expiresAt: string
  user: User
  tenant: Tenant
}

export interface GoogleLoginResponse {
  requiresRegistration: boolean
  registrationToken?: string
  email?: string
  name?: string
}

export interface Member {
  id: number
  fullName: string
  phoneNumber: string
  nationalId: string
  memberType: string
  workerType: string | null
  registrationDate: string
  endDate: string | null
  noEndDate: boolean
  attendancePlan: string
  attendanceSchedule: string | null
  startTime: string
  endTime: string
  deskNumber: string
  workingHours: number
  subscriptionMonths: number
  remainingDays: number
  timePeriod: string
  monthlyFee: number
  paymentStatus: string
  paymentStatusDisplay: string
  lastPaymentDate: string | null
  nextDueDate: string | null
  createdAt: string
  updatedAt: string
  payments?: Payment[]
}

export interface Payment {
  id: number
  paymentDate: string
  paymentTime: string
  amount: number
  status: string
  paidMonth: string
  recordedByUserName: string | null
  createdAt: string
}

export interface Reservation {
  id: number
  personName: string
  reservationDate: string
  startTime: string
  endTime: string
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface ReservationStats {
  totalReservations: number
  todaysReservations: number
  upcomingReservations: number
  pastReservations: number
}

export interface CreateReservationRequest {
  personName: string
  reservationDate: string
  startTime: string
  endTime: string
  notes?: string
}

export interface UpdateReservationRequest {
  personName: string
  reservationDate: string
  startTime: string
  endTime: string
  notes?: string
}

export interface AdminWorkspaceDetail {
  id: number
  name: string
  companyName: string
  subdomain: string
  whatsappNumber: string
  address: string
  totalDesks: number | null
  maxCapacity: number | null
  hasMeetingRoom: boolean
  openingTime: string | null
  closingTime: string | null
  status: string
  paymentStatus: string
  isLocked?: boolean
  trialStartDate: string | null
  subscriptionExpiryDate: string | null
  approvalDate: string | null
  createdAt: string
  updatedAt: string
  adminEmail: string
  adminName: string
  memberCount: number
  meetingRoomReservationCount: number
  recentMembers: AdminMemberSummary[]
}

interface AdminMemberSummary {
  id: number
  fullName: string
  phoneNumber: string
  memberType: string
  paymentStatus: string
  registrationDate: string
}

export interface AppNotification {
  id: number
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
  relatedEntityId: number | null
  relatedEntityType: string | null
}

export interface CreateMemberRequest {
  fullName: string
  phoneNumber: string
  nationalId: string
  memberType: string
  workerType?: string
  registrationDate: string
  endDate?: string | null
  noEndDate: boolean
  attendancePlan: string
  attendanceSchedule?: string
  startTime: string
  endTime: string
  deskNumber: string
  monthlyFee: number
}

export interface AnalyticsOverview {
  kpis: KpiData
  revenueHistory: AnalyticsRevenuePoint[]
  memberGrowth: AnalyticsMemberGrowthPoint[]
  occupancy: AnalyticsOccupancyData | null
  paymentStatus: AnalyticsPaymentStatusData | null
  subscriptions: AnalyticsSubscriptionPoint[]
  meetingRoomUsage: AnalyticsMeetingRoomPoint[]
  memberActivity: AnalyticsMemberActivityPoint[]
  insights: AnalyticsInsight[]
}

export interface KpiData {
  totalMembers: number
  activeMembers: number
  expiredMembers: number
  unpaidMembers: number
  studentCount: number
  remoteWorkerCount: number
  monthlyIncome: number
  totalRevenue: number
  occupancyRate: number
  totalDesks: number
  occupiedDesks: number
  availableDesks: number
  totalMeetingRoomBookings: number
  activeSubscriptions: number
  membersTrend: number | null
  revenueTrend: number | null
  meetingRoomTrend: number | null
}

export interface AnalyticsRevenuePoint {
  month: string
  revenue: number
}

export interface AnalyticsMemberGrowthPoint {
  month: string
  newMembers: number
}

export interface AnalyticsOccupancyData {
  occupied: number
  available: number
  rate: number
}

export interface AnalyticsPaymentStatusData {
  paid: number
  unpaid: number
  paidPercentage: number
  unpaidPercentage: number
}

export interface AnalyticsSubscriptionPoint {
  plan: string
  count: number
  percentage: number
}

export interface AnalyticsMeetingRoomPoint {
  day: string
  bookings: number
}

export interface AnalyticsMemberActivityPoint {
  month: string
  newMembers: number
  expiredMembers: number
}

export interface AnalyticsInsight {
  type: string
  title: string
  message: string
  icon: string
}

export type AnalyticsPeriod = '7d' | '30d' | '90d' | '1y'


