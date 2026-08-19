using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using RelisoftHR.Controllers;
using RelisoftHR.DTOs;
using RelisoftHR.Services;

namespace RelisoftHR.Tests;

public class AuthControllerTests
{
    private readonly AuthController _controller;
    private readonly Dictionary<string, string?> _configValues = new()
    {
        ["Jwt:Key"] = "ReliSoft-HR-SecretKey-2026-Must-Be-32-Chars!",
        ["Jwt:Issuer"] = "RelisoftHR",
        ["Jwt:Audience"] = "RelisoftHR"
    };

    public AuthControllerTests()
    {
        var db = TestDbContext.Create();
        var config = new ConfigurationBuilder().AddInMemoryCollection(_configValues!).Build();
        _controller = new AuthController(db, config, new EmailService(new NullLogger<EmailService>(), config), new NullLogger<AuthController>());
    }

    [Fact]
    public async Task Login_ValidCredentials_ReturnsOkWithToken()
    {
        var result = await _controller.Login(new LoginRequest("preeti", "password"));
        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<LoginResponse>(ok.Value);
        Assert.Equal("Preeti Patil", response.FullName);
        Assert.Equal(1, response.EmployeeId);
        Assert.Equal("HRL2", response.Role);
        Assert.NotEmpty(response.Token);
    }

    [Fact]
    public async Task Login_InvalidPassword_ReturnsUnauthorized()
    {
        var result = await _controller.Login(new LoginRequest("preeti", "wrongpass"));
        Assert.IsType<UnauthorizedObjectResult>(result.Result);
    }

    [Fact]
    public async Task Login_UnknownUser_ReturnsUnauthorized()
    {
        var result = await _controller.Login(new LoginRequest("nonexistent", "password"));
        Assert.IsType<UnauthorizedObjectResult>(result.Result);
    }

    [Fact]
    public async Task Login_WithOfficialEmail_ReturnsOk()
    {
        var result = await _controller.Login(new LoginRequest("preeti.patil@relisofttechnologies.com", "password"));
        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<LoginResponse>(ok.Value);
        Assert.Equal("Preeti Patil", response.FullName);
        Assert.Equal(1, response.EmployeeId);
        Assert.NotEmpty(response.Token);
    }

    [Fact]
    public async Task Login_WithOfficialEmailCaseInsensitive_ReturnsOk()
    {
        var result = await _controller.Login(new LoginRequest("Preeti.Patil@RelisoftTechnologies.com", "password"));
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task Login_WithUppercaseName_ReturnsOk()
    {
        var result = await _controller.Login(new LoginRequest("Preeti", "password"));
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task Login_WithForeignDomainEmail_ReturnsUnauthorized()
    {
        var result = await _controller.Login(new LoginRequest("preeti@gmail.com", "password"));
        Assert.IsType<UnauthorizedObjectResult>(result.Result);
    }

    [Fact]
    public async Task Login_WithUnknownRelisoftEmail_ReturnsUnauthorized()
    {
        var result = await _controller.Login(new LoginRequest("nobody@relisofttechnologies.com", "password"));
        Assert.IsType<UnauthorizedObjectResult>(result.Result);
    }

    [Fact]
    public async Task Login_WithRandomUsername_ReturnsUnauthorized()
    {
        var result = await _controller.Login(new LoginRequest("random@person.org", "password"));
        Assert.IsType<UnauthorizedObjectResult>(result.Result);
    }

    [Fact]
    public async Task Login_AsEmployee_ReturnsCorrectRole()
    {
        var result = await _controller.Login(new LoginRequest("aradhana", "password"));
        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<LoginResponse>(ok.Value);
        Assert.Equal("Employee", response.Role);
        Assert.Equal("Aradhana Shinde", response.FullName);
        Assert.Contains("review", response.Views);
    }

    [Fact]
    public async Task Login_AsOrgHead_ReturnsCorrectRole()
    {
        var result = await _controller.Login(new LoginRequest("rakesh", "password"));
        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<LoginResponse>(ok.Value);
        Assert.Equal("OrganizationHead", response.Role);
        Assert.Equal("Rakesh Patil", response.FullName);
    }

    [Fact]
    public void GetDemoUsers_ReturnsThreeUsers()
    {
        var result = _controller.GetDemoUsers();
        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var users = Assert.IsType<List<DemoUserDto>>(ok.Value);
        Assert.Equal(3, users.Count);
        Assert.Contains(users, u => u.Username == "preeti");
        Assert.Contains(users, u => u.Username == "rakesh");
        Assert.Contains(users, u => u.Username == "aradhana");
    }
}
