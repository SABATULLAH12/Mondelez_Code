using Entites;
using System.Collections.Generic;
using System.Data;

namespace DAL
{
    public interface IReportsHubRepository
    {
        IList<string> GetFileList();
        AuthUserRole GetUserRoleDAL(int UserId);
        DataSet GetMailIdsToSendMailForReport(string fileName);
    }
}
