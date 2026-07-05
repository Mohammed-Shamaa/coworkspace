using Microsoft.EntityFrameworkCore;
using Coworkspace.API.Models;

namespace Coworkspace.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Member> Members => Set<Member>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<MeetingRoomReservation> MeetingRoomReservations => Set<MeetingRoomReservation>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Tenant
        modelBuilder.Entity<Tenant>(entity =>
        {
            entity.HasIndex(t => t.Subdomain).IsUnique();
        });

        // User
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => new { u.TenantId, u.Email }).IsUnique();
            entity.HasIndex(u => u.RefreshToken);
            entity.HasOne(u => u.Tenant).WithMany(t => t.Users).HasForeignKey(u => u.TenantId).OnDelete(DeleteBehavior.Restrict);
        });

        // Member
        modelBuilder.Entity<Member>(entity =>
        {
            entity.HasIndex(m => new { m.TenantId, m.FullName }).IsUnique();
            entity.HasIndex(m => new { m.TenantId, m.PhoneNumber }).IsUnique();
            entity.HasIndex(m => new { m.TenantId, m.NationalId }).IsUnique();
            entity.HasIndex(m => new { m.TenantId, m.MemberType });
            entity.HasIndex(m => new { m.TenantId, m.PaymentStatus });
            entity.HasIndex(m => new { m.TenantId, m.EndDate });
            entity.HasIndex(m => new { m.TenantId, m.CreatedAt });
            entity.HasIndex(m => new { m.TenantId, m.DeskNumber });
            entity.HasIndex(m => new { m.TenantId, m.NextDueDate });
            entity.Property(m => m.MemberType).HasConversion<string>().HasMaxLength(20);
            entity.Property(m => m.WorkerType).HasConversion<string>().HasMaxLength(20);
            entity.Property(m => m.AttendancePlan).HasConversion<string>().HasMaxLength(20);
            entity.Property(m => m.AttendanceSchedule).HasConversion<string>().HasMaxLength(30);
            entity.Property(m => m.PaymentStatus).HasConversion<string>().HasMaxLength(10);
            entity.HasOne(m => m.Tenant).WithMany(t => t.Members).HasForeignKey(m => m.TenantId).OnDelete(DeleteBehavior.Restrict);
        });

        // Payment
        modelBuilder.Entity<Payment>(entity =>
        {
            entity.Property(p => p.Status).HasMaxLength(10);
            entity.HasIndex(p => new { p.TenantId, p.MemberId, p.PaymentDate });
            entity.HasOne(p => p.Member).WithMany(m => m.Payments).HasForeignKey(p => p.MemberId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(p => p.RecordedByUser).WithMany(u => u.RecordedPayments).HasForeignKey(p => p.RecordedByUserId).OnDelete(DeleteBehavior.SetNull);
        });

        // AuditLog
        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasIndex(a => a.TenantId);
            entity.HasOne(a => a.User).WithMany(u => u.AuditLogs).HasForeignKey(a => a.UserId).OnDelete(DeleteBehavior.SetNull);
        });

        // MeetingRoomReservation
        modelBuilder.Entity<MeetingRoomReservation>(entity =>
        {
            entity.HasOne(r => r.Tenant).WithMany(t => t.MeetingRoomReservations).HasForeignKey(r => r.TenantId).OnDelete(DeleteBehavior.Restrict);
            entity.HasIndex(r => new { r.TenantId, r.ReservationDate, r.StartTime });
        });
    }
}
