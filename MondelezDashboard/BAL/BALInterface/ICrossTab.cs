using Entites;
using System.Collections.Generic;
using System;
using Entites.EntityModel;

namespace BAL
{
    public interface ICrossTab
    {
        int GetUserId(string EmailId);
        CrossTabViewResponse GetData(CrossTabViewRequest request);
        string ExportToExcel(CrossTabViewRequest request);
        string ExportToExcelDataExplorer(DataExplorerTableDetails request);
    }
}
