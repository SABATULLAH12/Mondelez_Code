[assembly: WebActivatorEx.PreApplicationStartMethod(typeof(MondelezDashboard.App_Start.NinjectWebCommon), "Start")]
[assembly: WebActivatorEx.ApplicationShutdownMethodAttribute(typeof(MondelezDashboard.App_Start.NinjectWebCommon), "Stop")]

namespace MondelezDashboard.App_Start
{
    using System;
    using System.Web;

    using Microsoft.Web.Infrastructure.DynamicModuleHelper;

    using Ninject;
    using Ninject.Web.Common;
    using System.Web.Http;
    using WebApiContrib.IoC.Ninject;

    using DAL;
    using BAL;
    using Ninject.Web.Common.WebHost;
    using BAL.BALInterface;
    using DAL.DALInterface;
    using BAL.BALRepository;
    using DAL.DALRepository;

    public static class NinjectWebCommon
    {
        private static readonly Bootstrapper bootstrapper = new Bootstrapper();

        /// <summary>
        /// Starts the application
        /// </summary>
        public static void Start()
        {
            DynamicModuleUtility.RegisterModule(typeof(OnePerRequestHttpModule));
            DynamicModuleUtility.RegisterModule(typeof(NinjectHttpModule));
            bootstrapper.Initialize(CreateKernel);
        }

        /// <summary>
        /// Stops the application.
        /// </summary>
        public static void Stop()
        {
            bootstrapper.ShutDown();
        }

        /// <summary>
        /// Creates the kernel that will manage your application.
        /// </summary>
        /// <returns>The created kernel.</returns>
        private static IKernel CreateKernel()
        {
            var kernel = new StandardKernel();
            try
            {
                kernel.Bind<Func<IKernel>>().ToMethod(ctx => () => new Bootstrapper().Kernel);
                kernel.Bind<IHttpModule>().To<HttpApplicationInitializationHttpModule>();
                GlobalConfiguration.Configuration.DependencyResolver = new NinjectResolver(kernel);

                RegisterServices(kernel);
                return kernel;
            }
            catch
            {
                kernel.Dispose();
                throw;
            }
        }

        /// <summary>
        /// Load your modules or register your services here!
        /// </summary>
        /// <param name="kernel">The kernel.</param>
        private static void RegisterServices(IKernel kernel)
        {
            #region BAL Mappings
            kernel.Bind<ICrossTab>().To<CrossTab>();
            kernel.Bind<IDeepDive>().To<DeepDive>();
            kernel.Bind<ISnapShot>().To<SnapShot>();
            kernel.Bind<IGrowthOpportunity>().To<GrowthOpportunity>();
            kernel.Bind<IStoryBoard>().To<StoryBoard>();
            kernel.Bind<IFilterPanel>().To<FilterPanel>();
            kernel.Bind<ILogin>().To<Login>();
            kernel.Bind<IReportsHub>().To<ReportsHub>();
            #endregion

            #region DAL Mappings
            kernel.Bind<IConnectionFactory>().To<ConnectionFactory>();
            kernel.Bind<ICrossTabRepository>().To<CrossTabRepository>();
            kernel.Bind<IDeepDiveRepository>().To<DeepDiveRepository>();
            kernel.Bind<ISnapShotRepository>().To<SnapShotRepository>();
            kernel.Bind<IGrowthOppotunityRepository>().To<GrowthOppotunityRepository>();
            kernel.Bind<IStoryBoardRepository>().To<StoryBoardRepository>();
            kernel.Bind<IFilterPanelRepository>().To<FilterPanelRepository>();
            kernel.Bind<IUnitOfWork>().To<UnitOfWork>();
            kernel.Bind<ILoginRepository>().To<LoginRepository>();
            kernel.Bind<IReportsHubRepository>().To<ReportsHubRepository>();
            #endregion

        }
    }
}
