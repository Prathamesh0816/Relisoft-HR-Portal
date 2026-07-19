using Microsoft.AspNetCore.Mvc;
using RelisoftHR.Controllers;

namespace RelisoftHR.Tests;

public class WriteEndpointContractTests
{
    [Fact]
    public void Write_endpoints_do_not_bind_entity_models_directly()
    {
        var entityParameters = typeof(AuthController).Assembly
            .GetTypes()
            .Where(type => typeof(ControllerBase).IsAssignableFrom(type))
            .SelectMany(type => type.GetMethods())
            .Where(method => method.GetCustomAttributes(inherit: true)
                .Any(attribute => attribute.GetType().Name is
                    "HttpPostAttribute" or "HttpPutAttribute" or "HttpPatchAttribute"))
            .SelectMany(method => method.GetParameters()
                .Select(parameter => new { Method = method, Parameter = parameter }))
            .Where(item => ContainsEntityModel(item.Parameter.ParameterType))
            .Select(item => $"{item.Method.DeclaringType!.Name}.{item.Method.Name}: {item.Parameter.ParameterType.Name}")
            .ToList();

        Assert.Empty(entityParameters);
    }

    private static bool ContainsEntityModel(Type type)
    {
        if (type.Namespace == "RelisoftHR.Models")
            return true;

        return type.IsGenericType && type.GetGenericArguments().Any(ContainsEntityModel);
    }
}
