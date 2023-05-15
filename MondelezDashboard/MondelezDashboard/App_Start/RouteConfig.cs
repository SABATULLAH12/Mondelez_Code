using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace MondelezDashboard
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            // Route override to work with Angularjs and HTML5 routing
            routes.MapRoute(
                name: "Default0",
                url: "Home/logout",
                defaults: new { controller = "Home", action = "logout" }
            );
            routes.MapRoute(
                name: "Default1",
                url: "Home/Locallogin",
                defaults: new { controller = "Home", action = "Locallogin" }
            );
            routes.MapRoute(
                name: "Default2",
                url: "{controller}/{*.}",
                defaults: new { controller = "Home", action = "Index" }
            );
            routes.MapRoute(
               name: "Default3",
               url: "{controller}/{action}/{id}",
               defaults: new { controller = "Home", action = "Index", id = UrlParameter.Optional }
           );
        }
    }
}
