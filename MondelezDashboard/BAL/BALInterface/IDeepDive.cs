using Entites;
using System.Collections.Generic;
using Aspose.Slides;
namespace BAL
{
    public interface IDeepDive
    {
        int GetUserId(string EmailId);
        OutputChartData GetChartOutput(DeepdiveViewRequest request);
        DeepdiveViewResponse GetDataForExports(DeepdiveViewRequest request);
        string ExportPPTExcel(DeepdiveViewRequest request);
        Presentation StoryBoardPPT(DeepdiveViewRequest request, Presentation pres);
    }
}
