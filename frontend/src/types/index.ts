export interface Tenant {
  id: number
  name: string
  subdomain: string
  logoUrl: string
  primaryColor: string
  companyName: string
  hasMeetingRoom?: boolean
  status?: string
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

export interface Dashboard {
  totalMembers: number
  activeMembers: number
  expiredMembers: number
  unpaidMembers: number
  studentCount: number
  remoteWorkerCount: number
  monthlyIncome: number
  recentRegistrations: RecentRegistration[]
}

export interface RecentRegistration {
  id: number
  fullName: string
  memberType: string
  registrationDate: string
  monthlyFee: number
}

export interface OnboardingInfo {
  onboardingCompleted: boolean
  totalDesks: number | null
  maxCapacity: number | null
  hasMeetingRoom: boolean
  address: string
  openingTime: string | null
  closingTime: string | null
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

export type TenantStatus = 'Pending' | 'Approved' | 'Rejected' | 'Suspended'

export interface AdminDashboard {
  totalCompanies: number
  pendingRequests: number
  approvedCompanies: number
  rejectedCompanies: number
  suspendedCompanies: number
  activeCompanies: number
  paidCompanies: number
  unpaidCompanies: number
  approvalRate: number
  monthlyGrowth: { month: string; count: number }[]
  companiesByCountry: { country: string; count: number }[]
  companiesByCity: { city: string; count: number }[]
  workspaceDistribution: { range: string; count: number }[]
  registrationTrends: { date: string; count: number }[]
}

export interface CompanyListItem {
  id: number
  companyName: string
  ownerName: string | null
  email: string | null
  phone: string | null
  country: string | null
  city: string | null
  workspaceCapacity: number | null
  meetingRooms: number | null
  desks: number | null
  offices: number | null
  createdAt: string
  status: string
  paymentStatus: string | null
  approvalDate: string | null
  approvedByName: string | null
}

export interface CompanyDetail {
  id: number
  companyName: string
  subdomain: string
  ownerName: string | null
  email: string | null
  phoneNumber: string | null
  country: string | null
  city: string | null
  fullAddress: string | null
  latitude: number | null
  longitude: number | null
  workspaceCapacity: number | null
  numberOfOffices: number | null
  numberOfMeetingRooms: number | null
  numberOfDesks: number | null
  workspaceDescription: string | null
  status: string
  createdAt: string
  approvalDate: string | null
  approvedByName: string | null
  rejectionReason: string | null
  subscriptionPlan: string | null
  lastPaymentDate: string | null
  nextDueDate: string | null
  updatedAt: string
  userCount: number
  memberCount: number
}

export interface AuditLogItem {
  id: number
  adminName: string
  action: string
  entityType: string
  targetEntity: string | null
  timestamp: string
  details: string | null
  ipAddress: string | null
}

export interface PagedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

export interface RegisterRequest {
  email: string
  password: string
  fullName: string
  companyName: string
  subdomain: string
  phoneNumber?: string
  country?: string
  city?: string
  fullAddress?: string
  latitude?: number
  longitude?: number
  workspaceCapacity?: number
  numberOfOffices?: number
  numberOfMeetingRooms?: number
  numberOfDesks?: number
  workspaceDescription?: string
}
