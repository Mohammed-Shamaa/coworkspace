using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Coworkspace.API.Models;

public class Payment
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    public int MemberId { get; set; }

    [Required]
    public int TenantId { get; set; }

    public int? RecordedByUserId { get; set; }

    [Required]
    public DateTime PaymentDate { get; set; }

    [Required]
    [MaxLength(20)]
    public string PaymentTime { get; set; } = string.Empty;

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "Paid";

    [MaxLength(30)]
    public string PaidMonth { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(MemberId))]
    public Member Member { get; set; } = null!;

    [ForeignKey(nameof(RecordedByUserId))]
    public User? RecordedByUser { get; set; }
}
