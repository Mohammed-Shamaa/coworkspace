using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Coworkspace.API.Migrations
{
    /// <inheritdoc />
    public partial class AddAdminSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ApprovalDate",
                table: "Tenants",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ApprovedByUserId",
                table: "Tenants",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "Tenants",
                type: "TEXT",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Country",
                table: "Tenants",
                type: "TEXT",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FullAddress",
                table: "Tenants",
                type: "TEXT",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastPaymentDate",
                table: "Tenants",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Latitude",
                table: "Tenants",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Longitude",
                table: "Tenants",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "NextDueDate",
                table: "Tenants",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NumberOfDesks",
                table: "Tenants",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NumberOfMeetingRooms",
                table: "Tenants",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NumberOfOffices",
                table: "Tenants",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OwnerName",
                table: "Tenants",
                type: "TEXT",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PhoneNumber",
                table: "Tenants",
                type: "TEXT",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RejectionReason",
                table: "Tenants",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Tenants",
                type: "TEXT",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SubscriptionPlan",
                table: "Tenants",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "WorkspaceCapacity",
                table: "Tenants",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WorkspaceDescription",
                table: "Tenants",
                type: "TEXT",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Tenants_ApprovedByUserId",
                table: "Tenants",
                column: "ApprovedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Tenants_Users_ApprovedByUserId",
                table: "Tenants",
                column: "ApprovedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tenants_Users_ApprovedByUserId",
                table: "Tenants");

            migrationBuilder.DropIndex(
                name: "IX_Tenants_ApprovedByUserId",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "ApprovalDate",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "ApprovedByUserId",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "City",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "Country",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "FullAddress",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "LastPaymentDate",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "NextDueDate",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "NumberOfDesks",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "NumberOfMeetingRooms",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "NumberOfOffices",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "OwnerName",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "PhoneNumber",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "RejectionReason",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "SubscriptionPlan",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "WorkspaceCapacity",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "WorkspaceDescription",
                table: "Tenants");
        }
    }
}
