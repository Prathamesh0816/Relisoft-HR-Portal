using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using RelisoftHR.Controllers;
using RelisoftHR.DTOs;
using RelisoftHR.Models;

namespace RelisoftHR.Tests;

public class AuthControllerTests
{
    private readonly AuthController _controller;
    private readonly RelisoftHR.Data.AppDbContext _db;
    private readonly Dictionary<string, string?> _configValues = new()
    {
        ["Jwt:Key"] = "CHANGE_ME_DEVELOPMENT_JWT_KEY_32_CHARS_MINIMUM",
        ["Jwt:Issuer"] = "RelisoftHR",
        ["Jwt:Audience"] = "RelisoftHR"
    };

    public AuthControllerTests()
    {
        _db = TestDbContext.Create();
        var config = new ConfigurationBuilder().AddInMemoryCollection(_configValues!).Build();
        _controller = new AuthController(_db, config);
    }

    [Fact]
    public async Task Login_ValidCredentials_ReturnsOkWithToken()
    {
        var result = await _controller.Login(new LoginRequest("preeti", "password"));
        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<LoginResponse>(ok.Value);
        Assert.Equal("Preeti Patil", response.FullName);
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
    public async Task Login_AsEmployee_ReturnsCorrectRole()
    {
        var result = await _controller.Login(new LoginRequest("aradhana", "password"));
        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<LoginResponse>(ok.Value);
        Assert.Equal("Employee", response.Role);
        Assert.Equal("Aradhana Shinde", response.FullName);
    }

    [Fact]
    public async Task Login_AsProjectDelegate_AddsLeaveReviewView()
    {
        var delegation = new ApprovalDelegate
        {
            Id = 20,
            ManagerId = 4,
            DelegateId = 3,
            ProjectId = 1
        };
        _db.ApprovalDelegates.Add(delegation);
        var project = await _db.Projects.FindAsync(1);
        Assert.NotNull(project);
        project.ApprovalRoute = ProjectApprovalRoute.Delegate;
        project.ApprovalDelegateId = delegation.Id;
        await _db.SaveChangesAsync();

        var result = await _controller.Login(new LoginRequest("aradhana", "password"));

        var response = Assert.IsType<LoginResponse>(Assert.IsType<OkObjectResult>(result.Result).Value);
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
