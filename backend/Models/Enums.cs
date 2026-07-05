namespace Coworkspace.API.Models;

public enum MemberType { Student, RemoteWorker }
public enum WorkerType { FullTime, PartTime }
public enum AttendancePlan { ThreeDaysPerWeek, SixDaysPerWeek }
public enum AttendanceSchedule { SaturdayMondayWednesday, SundayTuesdayThursday }
public enum PaymentStatus { Paid, Unpaid }
public enum UserRole { SuperAdmin, Admin, Manager, Staff }
public enum TenantStatus { Pending, Approved, Rejected, Suspended }
