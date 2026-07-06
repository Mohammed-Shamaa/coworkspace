namespace Coworkspace.API.Models;

public enum MemberType { Student, RemoteWorker }
public enum WorkerType { FullTime, PartTime }
public enum AttendancePlan { ThreeDaysPerWeek, SixDaysPerWeek }
public enum AttendanceSchedule { SaturdayMondayWednesday, SundayTuesdayThursday }
public enum PaymentStatus { Paid, Unpaid }
public enum UserRole { Admin, Manager, Staff, SuperAdmin }
public enum TenantStatus { Pending, Approved, Rejected }
public enum TenantPaymentStatus { Trial, Active, Expired, Suspended }
