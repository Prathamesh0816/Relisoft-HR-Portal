namespace RelisoftHR.DTOs;

public record LoginRequest(string Username, string Password);

public record LoginResponse(
    int EmployeeId,
    string FullName,
    string Username,
    string Role,
    string? RoleLabel,
    string[] Views,
    string Token
);

public record DemoUserDto(string Username, string Role);

public record ChangePasswordRequest(string OldPassword, string NewPassword);
