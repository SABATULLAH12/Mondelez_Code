using Entites;
using System.Collections.Generic;

namespace BAL
{
    public interface IReportsHub
    {
        ReportsHubData GetReportHubData();
        UserRoleData GetUserRole(int id);
        string[] GetMailIdsToSendMailForReport(string fileName);
    }
}
